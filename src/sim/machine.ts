import type { Program } from './compile';
import { CError } from './parse';

/**
 * Multi-process virtual machine for the fork() simulator.
 * Every operation is pure: step() returns a new Machine, so the UI can keep a history (undo).
 */

export type Val = number | string | { ref: string } | null; // null = uninitialised local
export type PState = 'ready' | 'blocked' | 'sleeping' | 'zombie' | 'terminated';
export type BufferMode = 'line' | 'full';

export interface Proc {
  pid: number;
  /** current parent (changes to 1 when orphaned) */
  ppid: number;
  /** process that actually called fork() to create this one (never changes) */
  creator: number;
  pc: number;
  stack: Val[];
  vars: Record<string, Val>;
  state: PState;
  exitCode?: number;
  exitTick?: number;
  /** stdio buffer (user-space!) — copied by fork() */
  buf: string;
  /** line of the statement executed most recently */
  lastLine: number;
  /** value fork() returned in this process (most recent call) */
  lastFork?: number;
  wakeAt?: number;
  /** pid filter for a blocked waitpid (-1 = any) */
  waitFor?: number;
  orphaned?: boolean;
  /** number of fork() calls this process has made */
  forks: number;
  createdTick: number;
}

export interface OutChunk { pid: number; text: string; err?: boolean }

export type SimEvent =
  | { k: 'start'; pid: number; tick: number }
  | { k: 'fork'; pid: number; child: number; tick: number; line: number }
  | { k: 'forkfail'; pid: number; tick: number; line: number }
  | { k: 'exit'; pid: number; code: number; tick: number; zombie: boolean }
  | { k: 'reap'; pid: number; child: number; tick: number; byInit?: boolean }
  | { k: 'orphan'; pid: number; tick: number }
  | { k: 'block'; pid: number; tick: number }
  | { k: 'wake'; pid: number; tick: number }
  | { k: 'sleep'; pid: number; secs: number; tick: number }
  | { k: 'waitnone'; pid: number; tick: number };

export interface SimOptions {
  basePid: number;
  bufferMode: BufferMode;
  /** make every fork() fail with -1 (EAGAIN) */
  failFork: boolean;
  maxProcs: number;
}

export interface Machine {
  prog: Program;
  opts: SimOptions;
  procs: Proc[];
  tick: number;
  nextPid: number;
  out: OutChunk[];
  events: SimEvent[];
  current: number | null;
  error?: { msg: string; line: number; pid: number };
  /** RNG state for the random scheduler */
  seed: number;
  rrLast: number;
}

export const DEFAULT_OPTS: SimOptions = { basePid: 1000, bufferMode: 'line', failFork: false, maxProcs: 64 };
export const SHELL_PID_OFFSET = 1; // the shell is basePid - 1
const TICKS_PER_SECOND = 3;
const MAX_OPS_PER_STEP = 20000;

export function createMachine(prog: Program, opts: Partial<SimOptions> = {}): Machine {
  const o = { ...DEFAULT_OPTS, ...opts };
  const root: Proc = {
    pid: o.basePid, ppid: o.basePid - SHELL_PID_OFFSET, creator: o.basePid - SHELL_PID_OFFSET, pc: 0, stack: [], vars: {},
    state: 'ready', buf: '', lastLine: prog.mainLine, forks: 0, createdTick: 0,
  };
  const m: Machine = {
    prog, opts: o, procs: [root], tick: 0, nextPid: o.basePid + 1, out: [], events: [{ k: 'start', pid: root.pid, tick: 0 }],
    current: null, seed: 12345, rrLast: -1,
  };
  if (prog.hasArgs) { root.vars.argc = 1; root.vars.argv = 0; }
  // run global initialisers (part of loading the program image)
  while (root.pc < prog.entry) execOp(m, root);
  return m;
}

export function cloneMachine(m: Machine): Machine {
  return {
    ...m,
    procs: m.procs.map((p) => ({ ...p, stack: p.stack.slice(), vars: { ...p.vars } })),
    out: m.out.slice(),
    events: m.events.slice(),
  };
}

export const isAlive = (p: Proc) => p.state !== 'zombie' && p.state !== 'terminated';
export const isRunnable = (p: Proc) => p.state === 'ready';
export const isFinished = (m: Machine) => !!m.error || m.procs.every((p) => !isAlive(p));
export const runnable = (m: Machine) => (m.error ? [] : m.procs.filter(isRunnable));

/** Line of the statement the process will execute next (for highlighting). */
export function nextLine(m: Machine, p: Proc): number {
  if (!isAlive(p)) return p.lastLine;
  const op = m.prog.ops[p.pc];
  if (op && op.op === 'stmt') return op.line;
  return p.lastLine; // resuming in the middle of a statement (e.g. right after fork())
}

const truthy = (v: Val) => (typeof v === 'number' ? v !== 0 : v !== null);
function num(v: Val, line: number): number {
  if (v === null) return 0; // uninitialised: garbage in real C, we use 0
  if (typeof v === 'number') return v;
  if (typeof v === 'string') throw new CError('cannot do arithmetic on a string', line);
  throw new CError('cannot do arithmetic on an address', line);
}

function fail(msg: string, line: number): never {
  throw new CError(msg, line);
}

function formatPrintf(fmt: string, args: Val[], line: number): string {
  let i = 0;
  return fmt.replace(/%([-+ 0#]*)(\d+)?(?:\.(\d+))?(hh|h|ll|l|z)?([diucsfxX%p])/g, (_all, flags: string, width: string, prec: string, _len, conv: string) => {
    if (conv === '%') return '%';
    if (i >= args.length) fail(`printf: missing argument for %${conv}`, line);
    const a = args[i++];
    let s: string;
    switch (conv) {
      case 'd': case 'i': case 'u': s = String(Math.trunc(num(a, line))); break;
      case 'c': s = String.fromCharCode(num(a, line)); break;
      case 's': if (typeof a !== 'string') fail('printf: %s needs a string', line); s = a; break;
      case 'f': s = num(a, line).toFixed(prec ? Number(prec) : 6); break;
      case 'x': s = (num(a, line) >>> 0).toString(16); break;
      case 'X': s = (num(a, line) >>> 0).toString(16).toUpperCase(); break;
      default: s = String(a);
    }
    const w = width ? Number(width) : 0;
    if (s.length < w) s = flags.includes('-') ? s.padEnd(w) : s.padStart(w, flags.includes('0') ? '0' : ' ');
    return s;
  });
}

function writeOut(m: Machine, p: Proc, text: string, err = false) {
  if (err) { m.out.push({ pid: p.pid, text, err: true }); return; } // stderr is unbuffered
  p.buf += text;
  if (m.opts.bufferMode === 'line') {
    const nl = p.buf.lastIndexOf('\n');
    if (nl >= 0) {
      m.out.push({ pid: p.pid, text: p.buf.slice(0, nl + 1) });
      p.buf = p.buf.slice(nl + 1);
    }
  } else if (p.buf.length >= 4096) {
    m.out.push({ pid: p.pid, text: p.buf });
    p.buf = '';
  }
}
function flush(m: Machine, p: Proc) {
  if (p.buf) { m.out.push({ pid: p.pid, text: p.buf }); p.buf = ''; }
}

const parentOf = (m: Machine, p: Proc) => m.procs.find((q) => q.pid === p.ppid);

function doExit(m: Machine, p: Proc, code: number, viaUnderscore: boolean) {
  if (!viaUnderscore) flush(m, p); // exit() flushes stdio buffers, _exit() does not
  else p.buf = '';
  p.exitCode = code & 0xff;
  p.exitTick = m.tick;
  // children are re-parented to init (pid 1); init reaps zombies immediately
  for (const c of m.procs) {
    if (c.ppid === p.pid && c.state !== 'terminated') {
      c.ppid = 1;
      c.orphaned = true;
      if (c.state === 'zombie') {
        c.state = 'terminated';
        m.events.push({ k: 'reap', pid: 1, child: c.pid, tick: m.tick, byInit: true });
      } else m.events.push({ k: 'orphan', pid: c.pid, tick: m.tick });
    }
  }
  const parent = parentOf(m, p);
  if (parent && isAlive(parent)) {
    p.state = 'zombie';
    m.events.push({ k: 'exit', pid: p.pid, code: p.exitCode, tick: m.tick, zombie: true });
    if (parent.state === 'blocked' && (parent.waitFor === -1 || parent.waitFor === p.pid)) {
      parent.state = 'ready';
      m.events.push({ k: 'wake', pid: parent.pid, tick: m.tick });
    }
  } else {
    // parent is init or the shell: reaped right away
    p.state = 'terminated';
    m.events.push({ k: 'exit', pid: p.pid, code: p.exitCode, tick: m.tick, zombie: false });
    m.events.push({ k: 'reap', pid: p.ppid, child: p.pid, tick: m.tick, byInit: p.ppid === 1 });
  }
}

/** returns false when the process blocked (pc not advanced) */
function callBuiltin(m: Machine, p: Proc, name: string, argc: number, line: number): boolean {
  const args = p.stack.slice(p.stack.length - argc);
  const ret = (v: Val) => { p.stack.length -= argc; p.stack.push(v); return true; };
  switch (name) {
    case 'fork': {
      if (m.opts.failFork) {
        m.events.push({ k: 'forkfail', pid: p.pid, tick: m.tick, line });
        p.vars.errno = 11;
        p.lastFork = -1;
        return ret(-1);
      }
      if (m.procs.filter(isAlive).length >= m.opts.maxProcs)
        fail(`process limit (${m.opts.maxProcs}) reached — is this a fork bomb?`, line);
      const childPid = m.nextPid++;
      p.forks++;
      ret(childPid);
      p.lastFork = childPid;
      // the child is an exact copy (memory, stack, stdio buffer, pc) except for fork's return value
      const child: Proc = {
        ...p, pid: childPid, ppid: p.pid, creator: p.pid, stack: p.stack.slice(), vars: { ...p.vars },
        state: 'ready', forks: 0, createdTick: m.tick, orphaned: false, lastFork: 0, exitCode: undefined,
      };
      child.stack[child.stack.length - 1] = 0;
      child.pc = p.pc + 1;
      m.procs.push(child);
      m.events.push({ k: 'fork', pid: p.pid, child: childPid, tick: m.tick, line });
      return true;
    }
    case 'getpid': return ret(p.pid);
    case 'getppid': return ret(p.ppid);
    case 'wait':
    case 'waitpid': {
      const target = name === 'waitpid' ? num(args[0], line) : -1;
      const statusArg = name === 'waitpid' ? args[1] : args[0];
      const kids = m.procs.filter((c) => c.ppid === p.pid && c.state !== 'terminated' && (target <= 0 || c.pid === target));
      if (kids.length === 0) {
        m.events.push({ k: 'waitnone', pid: p.pid, tick: m.tick });
        p.vars.errno = 10; // ECHILD
        return ret(-1);
      }
      const z = kids.filter((c) => c.state === 'zombie').sort((a, b) => (a.exitTick ?? 0) - (b.exitTick ?? 0))[0];
      if (z) {
        z.state = 'terminated';
        m.events.push({ k: 'reap', pid: p.pid, child: z.pid, tick: m.tick });
        if (statusArg && typeof statusArg === 'object') p.vars[statusArg.ref] = (z.exitCode ?? 0) << 8;
        p.waitFor = undefined;
        return ret(z.pid);
      }
      p.state = 'blocked';
      p.waitFor = target <= 0 ? -1 : target;
      m.events.push({ k: 'block', pid: p.pid, tick: m.tick });
      return false; // retry this call when woken
    }
    case 'exit':
    case '_exit':
      p.stack.length -= argc;
      doExit(m, p, num(args[0], line), name === '_exit');
      return true;
    case 'printf': {
      const fmt = args[0];
      if (typeof fmt !== 'string') fail('printf: first argument must be a string literal', line);
      const s = formatPrintf(fmt, args.slice(1), line);
      writeOut(m, p, s);
      return ret(s.length);
    }
    case 'puts': {
      if (typeof args[0] !== 'string') fail('puts needs a string', line);
      writeOut(m, p, args[0] + '\n');
      return ret(1);
    }
    case 'putchar': writeOut(m, p, String.fromCharCode(num(args[0], line))); return ret(args[0]);
    case 'fflush': flush(m, p); return ret(0);
    case 'perror': {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      const e = p.vars.errno === 10 ? 'No child processes' : 'Resource temporarily unavailable';
      writeOut(m, p, `${msg ? msg + ': ' : ''}${e}\n`, true);
      return ret(0);
    }
    case 'sleep': {
      const secs = num(args[0], line);
      ret(0);
      if (secs > 0) {
        p.state = 'sleeping';
        p.wakeAt = m.tick + Math.max(1, Math.round(secs * TICKS_PER_SECOND));
        m.events.push({ k: 'sleep', pid: p.pid, secs, tick: m.tick });
      }
      return true;
    }
    case 'WEXITSTATUS': return ret((num(args[0], line) >> 8) & 0xff);
    case 'WIFEXITED': return ret(1);
    case 'atoi': return ret(typeof args[0] === 'string' ? parseInt(args[0], 10) || 0 : 0);
    case 'abs': return ret(Math.abs(num(args[0], line)));
  }
  fail(`unknown function ${name}`, line);
}

function binop(o: string, a: number, b: number, line: number): number {
  switch (o) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': if (b === 0) fail('division by zero', line); return Math.trunc(a / b);
    case '%': if (b === 0) fail('division by zero', line); return a % b;
    case '<': return +(a < b);
    case '>': return +(a > b);
    case '<=': return +(a <= b);
    case '>=': return +(a >= b);
    case '==': return +(a === b);
    case '!=': return +(a !== b);
    case '&': return a & b;
    case '|': return a | b;
    case '^': return a ^ b;
    case '<<': return a << b;
    case '>>': return a >> b;
  }
  fail(`operator ${o} not supported`, line);
}

/** Execute one instruction. Returns false if the process blocked. */
function execOp(m: Machine, p: Proc): boolean {
  const op = m.prog.ops[p.pc];
  switch (op.op) {
    case 'stmt': p.lastLine = op.line; break;
    case 'push': p.stack.push(op.v); break;
    case 'load': {
      if (!(op.name in p.vars)) fail(`'${op.name}' used before its declaration`, op.line);
      p.stack.push(p.vars[op.name]);
      break;
    }
    case 'store': p.vars[op.name] = p.stack[p.stack.length - 1]; break;
    case 'decl': if (!(op.name in p.vars)) p.vars[op.name] = null; else p.vars[op.name] = null; break;
    case 'pop': p.stack.pop(); break;
    case 'dup': p.stack.push(p.stack[p.stack.length - 1]); break;
    case 'addr': p.stack.push({ ref: op.name }); break;
    case 'bin': {
      const b = p.stack.pop()!;
      const a = p.stack.pop()!;
      if ((op.o === '==' || op.o === '!=') && (typeof a !== 'number' || typeof b !== 'number')) {
        const eq = a === b || (a === 0 && b === null) ? 1 : 0;
        p.stack.push(op.o === '==' ? eq : 1 - eq);
      } else p.stack.push(binop(op.o, num(a, op.line), num(b, op.line), op.line));
      break;
    }
    case 'un': {
      const a = p.stack.pop()!;
      p.stack.push(op.o === '-' ? -num(a, 0) : op.o === '~' ? ~num(a, 0) : truthy(a) ? 0 : 1);
      break;
    }
    case 'jmp': p.pc = op.t; return true;
    case 'jz': { const v = p.stack.pop()!; if (!truthy(v)) { p.pc = op.t; return true; } break; }
    case 'jnz': { const v = p.stack.pop()!; if (truthy(v)) { p.pc = op.t; return true; } break; }
    case 'call': {
      const ok = callBuiltin(m, p, op.name, op.argc, op.line);
      if (!ok) return false;
      break;
    }
  }
  p.pc++;
  return true;
}

function wakeSleepers(m: Machine) {
  for (const p of m.procs) {
    if (p.state === 'sleeping' && p.wakeAt !== undefined && p.wakeAt <= m.tick) {
      p.state = 'ready';
      p.wakeAt = undefined;
      m.events.push({ k: 'wake', pid: p.pid, tick: m.tick });
    }
  }
}

/** If nothing is runnable but someone sleeps, advance the clock (time passes). */
export function idleAdvance(m: Machine): Machine {
  if (runnable(m).length > 0 || isFinished(m)) return m;
  const sleepers = m.procs.filter((p) => p.state === 'sleeping');
  if (!sleepers.length) return m;
  const n = cloneMachine(m);
  n.tick = Math.min(...sleepers.map((p) => p.wakeAt ?? n.tick));
  wakeSleepers(n);
  return n;
}

/** Run one source statement of process `pid`. */
export function step(m0: Machine, pid: number): Machine {
  const m = cloneMachine(m0);
  const p = m.procs.find((q) => q.pid === pid);
  if (!p || !isRunnable(p) || m.error) return m0;
  m.current = pid;
  m.tick++;
  try {
    let n = 0;
    let first = true;
    while (isAlive(p) && p.state === 'ready') {
      const op = m.prog.ops[p.pc];
      if (!op) fail('ran past end of program', p.lastLine);
      if (op.op === 'stmt' && !first) break;
      first = false;
      const ok = execOp(m, p);
      if (!ok) break;
      if ((p.state as PState) === 'sleeping') break;
      if (++n > MAX_OPS_PER_STEP) fail('statement did not finish (infinite loop?)', p.lastLine);
    }
  } catch (e) {
    if (e instanceof CError) m.error = { msg: e.message, line: e.line, pid };
    else throw e;
  }
  wakeSleepers(m);
  return idleAdvance(m);
}

// ───── schedulers ─────
export type Policy = 'rr' | 'random' | 'parent' | 'child';

function rand(m: Machine): number {
  // xorshift32
  let x = m.seed | 0 || 1;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  m.seed = x >>> 0;
  return m.seed / 4294967296;
}

export function pickNext(m: Machine, policy: Policy): { pid: number; machine: Machine } | null {
  const r = runnable(m);
  if (!r.length) return null;
  const pids = r.map((p) => p.pid).sort((a, b) => a - b);
  if (policy === 'parent') return { pid: pids[0], machine: m };
  if (policy === 'child') return { pid: pids[pids.length - 1], machine: m };
  if (policy === 'random') {
    const n = cloneMachine(m);
    return { pid: pids[Math.floor(rand(n) * pids.length)], machine: n };
  }
  const after = pids.find((x) => x > m.rrLast);
  return { pid: after ?? pids[0], machine: m };
}

export function autoStep(m: Machine, policy: Policy): Machine {
  const pick = pickNext(m, policy);
  if (!pick) return m;
  const n = step(pick.machine, pick.pid);
  if (n !== pick.machine) n.rrLast = pick.pid;
  return n;
}

export function runToEnd(m: Machine, policy: Policy, limit = 5000): Machine {
  let cur = m;
  for (let i = 0; i < limit && !isFinished(cur); i++) {
    const n = autoStep(cur, policy);
    if (n === cur) break;
    cur = n;
  }
  if (!isFinished(cur) && !cur.error) {
    cur = cloneMachine(cur);
    cur.error = { msg: `stopped after ${limit} steps (infinite loop?)`, line: 0, pid: cur.current ?? 0 };
  }
  return cur;
}

export function stdoutText(m: Machine): string {
  return m.out.filter((c) => !c.err).map((c) => c.text).join('');
}

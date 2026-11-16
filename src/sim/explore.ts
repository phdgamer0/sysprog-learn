import { compile } from './compile';
import { createMachine, isFinished, runnable, runToEnd, step, stdoutText, type Machine, type SimOptions } from './machine';

export interface ExploreResult {
  /** distinct complete stdout texts, most common first */
  outputs: string[];
  exhaustive: boolean;
  statesVisited: number;
  errors: string[];
}

function key(m: Machine): string {
  return JSON.stringify([
    m.procs.map((p) => [p.pid, p.pc, p.state, p.ppid, p.stack, p.vars, p.buf, p.wakeAt]),
    stdoutText(m),
    m.tick > 0 && m.procs.some((p) => p.state === 'sleeping') ? m.tick : 0,
  ]);
}

/**
 * Enumerates every possible stdout produced by every interleaving of statements
 * (depth-first search with memoisation). Falls back to random sampling if the
 * state space is too large.
 */
export function exploreOutputs(source: string, opts: Partial<SimOptions> = {}, maxStates = 40000): ExploreResult {
  const prog = compile(source);
  const start = createMachine(prog, opts);
  const seen = new Set<string>();
  const outputs = new Map<string, number>();
  const errors = new Set<string>();
  let exhaustive = true;
  const stack: Machine[] = [start];
  while (stack.length) {
    const m = stack.pop()!;
    if (m.error) { errors.add(m.error.msg); continue; }
    if (isFinished(m)) {
      const o = stdoutText(m);
      outputs.set(o, (outputs.get(o) ?? 0) + 1);
      continue;
    }
    const k = key(m);
    if (seen.has(k)) continue;
    seen.add(k);
    if (seen.size > maxStates) { exhaustive = false; break; }
    for (const p of runnable(m)) stack.push(step(m, p.pid));
  }
  if (!exhaustive) {
    for (let i = 0; i < 400; i++) {
      const m0 = { ...start, seed: 1 + i * 7919 };
      const end = runToEnd(m0, 'random');
      if (end.error) errors.add(end.error.msg);
      else { const o = stdoutText(end); outputs.set(o, (outputs.get(o) ?? 0) + 1); }
    }
  }
  return {
    outputs: [...outputs.entries()].sort((a, b) => b[1] - a[1]).map(([o]) => o),
    exhaustive,
    statesVisited: seen.size,
    errors: [...errors],
  };
}

/** Run once to completion with a deterministic scheduler. */
export function runProgram(source: string, opts: Partial<SimOptions> = {}): Machine {
  return runToEnd(createMachine(compile(source), opts), 'rr');
}

/** Count how many times each output line appears (schedule-independent for most exam programs). */
export function lineTally(stdout: string): Record<string, number> {
  const t: Record<string, number> = {};
  for (const l of stdout.split('\n')) if (l !== '') t[l] = (t[l] ?? 0) + 1;
  return t;
}

// ───── process trees ─────
export interface TreeNode { children: TreeNode[] }

/** Tree of "who fork()ed whom" (creator relation), rooted at the original process. */
export function forkTree(m: Machine): TreeNode {
  const build = (pid: number): TreeNode => ({
    children: m.procs.filter((p) => p.creator === pid && p.pid !== pid).sort((a, b) => a.pid - b.pid).map((p) => build(p.pid)),
  });
  return build(m.procs[0].pid);
}

/** Canonical string for a tree shape (order of siblings does not matter). */
export function canonical(t: TreeNode): string {
  return '(' + t.children.map(canonical).sort().join('') + ')';
}

export function countNodes(t: TreeNode): number {
  return 1 + t.children.reduce((s, c) => s + countNodes(c), 0);
}

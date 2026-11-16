import { CError, parse, type Expr, type Stmt } from './parse';

/** Stack-machine instructions. `stmt` marks the start of a source-level step. */
export type Op =
  | { op: 'stmt'; line: number }
  | { op: 'push'; v: number | string }
  | { op: 'load'; name: string; line: number }
  | { op: 'store'; name: string } // stores top of stack, leaves it on the stack
  | { op: 'decl'; name: string } // declares a local (value: uninitialised)
  | { op: 'pop' }
  | { op: 'dup' }
  | { op: 'bin'; o: string; line: number }
  | { op: 'un'; o: string }
  | { op: 'addr'; name: string }
  | { op: 'jmp'; t: number }
  | { op: 'jz'; t: number }
  | { op: 'jnz'; t: number }
  | { op: 'call'; name: string; argc: number; line: number };

export interface Program {
  source: string;
  ops: Op[];
  globals: string[];
  hasArgs: boolean;
  mainLine: number;
  /** ops index where main's body starts (globals are initialised before) */
  entry: number;
}

export const BUILTINS: Record<string, [number, number]> = {
  fork: [0, 0], getpid: [0, 0], getppid: [0, 0], wait: [1, 1], waitpid: [3, 3], exit: [1, 1], _exit: [1, 1],
  printf: [1, 16], puts: [1, 1], putchar: [1, 1], sleep: [1, 1], fflush: [1, 1], perror: [1, 1],
  WEXITSTATUS: [1, 1], WIFEXITED: [1, 1], atoi: [1, 1], abs: [1, 1],
};

export function compile(source: string): Program {
  const ast = parse(source);
  const ops: Op[] = [];
  const emit = (o: Op) => { ops.push(o); return ops.length - 1; };
  const here = () => ops.length;
  const patch = (at: number, t: number) => { (ops[at] as { t: number }).t = t; };
  const loops: { brk: number[]; cont: number[] }[] = [];
  const declared = new Set<string>(ast.globals.map((g) => g.name));
  if (ast.hasArgs) { declared.add('argc'); declared.add('argv'); }

  function expr(e: Expr): void {
    switch (e.k) {
      case 'num': emit({ op: 'push', v: e.v }); return;
      case 'str': emit({ op: 'push', v: e.v }); return;
      case 'id':
        if (!declared.has(e.name)) throw new CError(`'${e.name}' is not declared`, e.line);
        emit({ op: 'load', name: e.name, line: e.line });
        return;
      case 'addr':
        if (!declared.has(e.name)) throw new CError(`'${e.name}' is not declared`, e.line);
        emit({ op: 'addr', name: e.name });
        return;
      case 'assign':
        if (!declared.has(e.name)) throw new CError(`'${e.name}' is not declared`, e.line);
        if (e.op === '=') expr(e.e);
        else {
          emit({ op: 'load', name: e.name, line: e.line });
          expr(e.e);
          emit({ op: 'bin', o: e.op.slice(0, -1), line: e.line });
        }
        emit({ op: 'store', name: e.name });
        return;
      case 'incdec': {
        if (!declared.has(e.name)) throw new CError(`'${e.name}' is not declared`, e.line);
        const o = e.op === '++' ? '+' : '-';
        emit({ op: 'load', name: e.name, line: e.line });
        if (!e.prefix) emit({ op: 'dup' });
        emit({ op: 'push', v: 1 });
        emit({ op: 'bin', o, line: e.line });
        emit({ op: 'store', name: e.name });
        if (!e.prefix) emit({ op: 'pop' });
        return;
      }
      case 'un':
        expr(e.e);
        if (e.op !== '+') emit({ op: 'un', o: e.op });
        return;
      case 'cond': {
        expr(e.c);
        const jz = emit({ op: 'jz', t: -1 });
        expr(e.a);
        const j = emit({ op: 'jmp', t: -1 });
        patch(jz, here());
        expr(e.b);
        patch(j, here());
        return;
      }
      case 'bin':
        if (e.op === '&&' || e.op === '||') {
          // short-circuit: result is 0/1
          expr(e.l);
          const j1 = emit({ op: e.op === '&&' ? 'jz' : 'jnz', t: -1 });
          expr(e.r);
          const j2 = emit({ op: e.op === '&&' ? 'jz' : 'jnz', t: -1 });
          emit({ op: 'push', v: e.op === '&&' ? 1 : 0 });
          const j3 = emit({ op: 'jmp', t: -1 });
          patch(j1, here());
          patch(j2, here());
          emit({ op: 'push', v: e.op === '&&' ? 0 : 1 });
          patch(j3, here());
          return;
        }
        expr(e.l);
        expr(e.r);
        emit({ op: 'bin', o: e.op, line: e.line });
        return;
      case 'call': {
        const sig = BUILTINS[e.name];
        if (!sig) {
          if (/^exec/.test(e.name) || e.name === 'system')
            throw new CError(`${e.name}() is not simulated here — see the exec/system lesson`, e.line);
          throw new CError(`function ${e.name}() is not supported by the simulator`, e.line);
        }
        if (e.args.length < sig[0] || e.args.length > sig[1])
          throw new CError(`${e.name}() called with ${e.args.length} argument(s)`, e.line);
        e.args.forEach(expr);
        emit({ op: 'call', name: e.name, argc: e.args.length, line: e.line });
        return;
      }
    }
  }

  function stmt(s: Stmt): void {
    switch (s.k) {
      case 'empty': return;
      case 'block': s.body.forEach(stmt); return;
      case 'decl':
        emit({ op: 'stmt', line: s.line });
        for (const it of s.items) {
          declared.add(it.name);
          emit({ op: 'decl', name: it.name });
          if (it.init) {
            expr(it.init);
            emit({ op: 'store', name: it.name });
            emit({ op: 'pop' });
          }
        }
        return;
      case 'expr':
        emit({ op: 'stmt', line: s.line });
        expr(s.e);
        emit({ op: 'pop' });
        return;
      case 'if': {
        emit({ op: 'stmt', line: s.line });
        expr(s.cond);
        const jz = emit({ op: 'jz', t: -1 });
        stmt(s.then);
        if (s.els) {
          const j = emit({ op: 'jmp', t: -1 });
          patch(jz, here());
          stmt(s.els);
          patch(j, here());
        } else patch(jz, here());
        return;
      }
      case 'while': {
        const top = emit({ op: 'stmt', line: s.line });
        expr(s.cond);
        const jz = emit({ op: 'jz', t: -1 });
        loops.push({ brk: [], cont: [] });
        stmt(s.body);
        const l = loops.pop()!;
        emit({ op: 'jmp', t: top });
        patch(jz, here());
        l.brk.forEach((b) => patch(b, here()));
        l.cont.forEach((c) => patch(c, top));
        return;
      }
      case 'do': {
        const top = here();
        loops.push({ brk: [], cont: [] });
        stmt(s.body);
        const l = loops.pop()!;
        const condAt = emit({ op: 'stmt', line: s.condLine });
        expr(s.cond);
        emit({ op: 'jnz', t: top });
        l.brk.forEach((b) => patch(b, here()));
        l.cont.forEach((c) => patch(c, condAt));
        return;
      }
      case 'for': {
        emit({ op: 'stmt', line: s.line });
        if (s.init) {
          if (s.init.k === 'decl') {
            for (const it of s.init.items) {
              declared.add(it.name);
              emit({ op: 'decl', name: it.name });
              if (it.init) { expr(it.init); emit({ op: 'store', name: it.name }); emit({ op: 'pop' }); }
            }
          } else if (s.init.k === 'expr') { expr(s.init.e); emit({ op: 'pop' }); }
        }
        const jc = emit({ op: 'jmp', t: -1 });
        const stepAt = emit({ op: 'stmt', line: s.line });
        if (s.step) { expr(s.step); emit({ op: 'pop' }); }
        patch(jc, here());
        let jz = -1;
        if (s.cond) { expr(s.cond); jz = emit({ op: 'jz', t: -1 }); }
        loops.push({ brk: [], cont: [] });
        stmt(s.body);
        const l = loops.pop()!;
        emit({ op: 'jmp', t: stepAt });
        if (jz >= 0) patch(jz, here());
        l.brk.forEach((b) => patch(b, here()));
        l.cont.forEach((c) => patch(c, stepAt));
        return;
      }
      case 'break':
      case 'continue': {
        const l = loops[loops.length - 1];
        if (!l) throw new CError(`${s.k} outside a loop`, s.line);
        emit({ op: 'stmt', line: s.line });
        (s.k === 'break' ? l.brk : l.cont).push(emit({ op: 'jmp', t: -1 }));
        return;
      }
      case 'return':
        emit({ op: 'stmt', line: s.line });
        if (s.e) expr(s.e);
        else emit({ op: 'push', v: 0 });
        emit({ op: 'call', name: 'exit', argc: 1, line: s.line });
        return;
    }
  }

  // global initialisers (run before main, as part of the program image)
  for (const g of ast.globals) {
    emit({ op: 'decl', name: g.name });
    if (g.init) {
      if (g.init.k !== 'num' && g.init.k !== 'str' && !(g.init.k === 'un' && g.init.e.k === 'num'))
        throw new CError('global initialisers must be constants', g.line);
      expr(g.init);
      emit({ op: 'store', name: g.name });
      emit({ op: 'pop' });
    } else {
      emit({ op: 'push', v: 0 }); // globals are zero-initialised (.bss)
      emit({ op: 'store', name: g.name });
      emit({ op: 'pop' });
    }
  }
  const entry = here();
  stmt(ast.main);
  // falling off the end of main == return 0
  emit({ op: 'stmt', line: ast.main.endLine });
  emit({ op: 'push', v: 0 });
  emit({ op: 'call', name: 'exit', argc: 1, line: ast.main.endLine });

  return { source, ops, globals: ast.globals.map((g) => g.name), hasArgs: ast.hasArgs, mainLine: ast.mainLine, entry };
}

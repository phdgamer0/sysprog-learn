/**
 * A small C-subset parser used by the process simulator.
 *
 * Supported: global/local declarations (int, pid_t, long, float, double, char*, unsigned, short),
 * main() with or without (argc, argv), blocks, if/else, for, while, do-while, break, continue,
 * return, expressions with assignment ops, ++/--, || && ?:, comparisons, arithmetic, unary - ! &,
 * and calls to builtin functions (fork, wait, waitpid, exit, _exit, printf, puts, sleep,
 * getpid, getppid, fflush, perror, WEXITSTATUS, atoi).
 * Preprocessor lines are ignored. Only one function (main) may be defined; prototypes are skipped.
 */

export class CError extends Error {
  constructor(
    message: string,
    public line: number,
  ) {
    super(message);
  }
}

type TokT = 'num' | 'str' | 'id' | 'kw' | 'op' | 'eof';
export interface Tok {
  t: TokT;
  v: string;
  line: number;
}

const KEYWORDS = new Set([
  'int', 'pid_t', 'float', 'double', 'char', 'long', 'unsigned', 'short', 'void', 'const', 'static',
  'signed', 'if', 'else', 'for', 'while', 'do', 'return', 'break', 'continue',
]);
const TYPE_WORDS = new Set(['int', 'pid_t', 'float', 'double', 'char', 'long', 'unsigned', 'short', 'void', 'const', 'static', 'signed']);

const OPS = [
  '<<=', '>>=', '...', '++', '--', '+=', '-=', '*=', '/=', '%=', '==', '!=', '<=', '>=', '&&', '||', '<<', '>>', '->',
  '+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|', '^', '~', '(', ')', '{', '}', '[', ']', ';', ',', '?', ':', '.',
];

function unescape(s: string, line: number): string {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c !== '\\') {
      out += c;
      continue;
    }
    const n = s[++i];
    switch (n) {
      case 'n': out += '\n'; break;
      case 't': out += '\t'; break;
      case '0': out += '\0'; break;
      case '\\': out += '\\'; break;
      case '"': out += '"'; break;
      case "'": out += "'"; break;
      default: throw new CError(`unknown escape \\${n}`, line);
    }
  }
  return out;
}

export function lex(src: string): Tok[] {
  // Normalise typographic quotes that often appear when code is copied from slides.
  src = src.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\r\n?/g, '\n');
  const toks: Tok[] = [];
  let i = 0;
  let line = 1;
  while (i < src.length) {
    const c = src[i];
    if (c === '\n') { line++; i++; continue; }
    if (/\s/.test(c)) { i++; continue; }
    // preprocessor line (only at line start, ignoring indentation)
    if (c === '#') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    if (src.startsWith('//', i)) {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    if (src.startsWith('/*', i)) {
      const end = src.indexOf('*/', i + 2);
      if (end < 0) throw new CError('unterminated comment', line);
      for (let k = i; k < end; k++) if (src[k] === '\n') line++;
      i = end + 2;
      continue;
    }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] ?? ''))) {
      const m = /^(0[xX][0-9a-fA-F]+|[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)[uUlLfF]*/.exec(src.slice(i))!;
      toks.push({ t: 'num', v: m[1], line });
      i += m[0].length;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(src.slice(i))!;
      toks.push({ t: KEYWORDS.has(m[0]) ? 'kw' : 'id', v: m[0], line });
      i += m[0].length;
      continue;
    }
    if (c === '"') {
      let j = i + 1;
      while (j < src.length && src[j] !== '"') {
        if (src[j] === '\\') j++;
        if (src[j] === '\n') throw new CError('unterminated string', line);
        j++;
      }
      if (j >= src.length) throw new CError('unterminated string', line);
      toks.push({ t: 'str', v: unescape(src.slice(i + 1, j), line), line });
      i = j + 1;
      continue;
    }
    if (c === "'") {
      const m = /^'(\\.|[^'\\])'/.exec(src.slice(i));
      if (!m) throw new CError('bad character literal', line);
      toks.push({ t: 'num', v: String(unescape(m[1], line).charCodeAt(0)), line });
      i += m[0].length;
      continue;
    }
    const op = OPS.find((o) => src.startsWith(o, i));
    if (!op) throw new CError(`unexpected character '${c}'`, line);
    toks.push({ t: 'op', v: op, line });
    i += op.length;
  }
  toks.push({ t: 'eof', v: '<end of file>', line });
  return toks;
}

// ───────────── AST ─────────────
export type Expr =
  | { k: 'num'; v: number; line: number }
  | { k: 'str'; v: string; line: number }
  | { k: 'id'; name: string; line: number }
  | { k: 'call'; name: string; args: Expr[]; line: number }
  | { k: 'bin'; op: string; l: Expr; r: Expr; line: number }
  | { k: 'un'; op: string; e: Expr; line: number }
  | { k: 'assign'; op: string; name: string; e: Expr; line: number }
  | { k: 'incdec'; op: '++' | '--'; prefix: boolean; name: string; line: number }
  | { k: 'addr'; name: string; line: number }
  | { k: 'cond'; c: Expr; a: Expr; b: Expr; line: number };

export type Stmt =
  | { k: 'decl'; items: { name: string; init?: Expr }[]; line: number }
  | { k: 'expr'; e: Expr; line: number }
  | { k: 'if'; cond: Expr; then: Stmt; els?: Stmt; line: number }
  | { k: 'for'; init?: Stmt; cond?: Expr; step?: Expr; body: Stmt; line: number }
  | { k: 'while'; cond: Expr; body: Stmt; line: number }
  | { k: 'do'; cond: Expr; body: Stmt; line: number; condLine: number }
  | { k: 'block'; body: Stmt[]; line: number; endLine: number }
  | { k: 'return'; e?: Expr; line: number }
  | { k: 'break'; line: number }
  | { k: 'continue'; line: number }
  | { k: 'empty'; line: number };

export interface ProgramAst {
  globals: { name: string; init?: Expr; line: number }[];
  main: Extract<Stmt, { k: 'block' }>;
  mainLine: number;
  hasArgs: boolean;
}

export function parse(src: string): ProgramAst {
  const toks = lex(src);
  let p = 0;
  const peek = (o = 0) => toks[p + o];
  const next = () => toks[p++];
  const is = (v: string, o = 0) => {
    const t = peek(o);
    return (t.t === 'op' || t.t === 'kw') && t.v === v;
  };
  const expect = (v: string): Tok => {
    const t = next();
    if ((t.t === 'op' || t.t === 'kw') && t.v === v) return t;
    throw new CError(`expected '${v}' but found '${t.v}'`, t.line);
  };
  const isTypeStart = () => peek().t === 'kw' && TYPE_WORDS.has(peek().v);
  const skipType = () => {
    let any = false;
    while (isTypeStart()) { next(); any = true; }
    return any;
  };

  // ── expressions (precedence climbing) ──
  const BIN_PREC: Record<string, number> = {
    '||': 1, '&&': 2, '|': 3, '^': 4, '&': 5, '==': 6, '!=': 6, '<': 7, '>': 7, '<=': 7, '>=': 7,
    '<<': 8, '>>': 8, '+': 9, '-': 9, '*': 10, '/': 10, '%': 10,
  };
  const ASSIGN = new Set(['=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=']);

  function expression(): Expr {
    // comma operator is not supported except in for-steps via a list; keep simple.
    return assignment();
  }
  function assignment(): Expr {
    const t = peek();
    if (t.t === 'id' && peek(1).t === 'op' && ASSIGN.has(peek(1).v)) {
      next();
      const op = next().v;
      const e = assignment();
      return { k: 'assign', op, name: t.v, e, line: t.line };
    }
    if (t.t === 'op' && t.v === '*' && peek(1).t === 'id' && peek(2).t === 'op' && ASSIGN.has(peek(2).v)) {
      throw new CError('pointer dereference is not supported by the simulator', t.line);
    }
    return conditional();
  }
  function conditional(): Expr {
    const c = binary(1);
    if (is('?')) {
      const line = next().line;
      const a = assignment();
      expect(':');
      const b = conditional();
      return { k: 'cond', c, a, b, line };
    }
    return c;
  }
  function binary(minPrec: number): Expr {
    let l = unary();
    for (;;) {
      const t = peek();
      const prec = t.t === 'op' ? BIN_PREC[t.v] : undefined;
      if (prec === undefined || prec < minPrec) return l;
      next();
      const r = binary(prec + 1);
      l = { k: 'bin', op: t.v, l, r, line: t.line };
    }
  }
  function unary(): Expr {
    const t = peek();
    if (t.t === 'op') {
      if (t.v === '++' || t.v === '--') {
        next();
        const id = next();
        if (id.t !== 'id') throw new CError(`expected variable after ${t.v}`, id.line);
        return { k: 'incdec', op: t.v, prefix: true, name: id.v, line: t.line };
      }
      if (t.v === '-' || t.v === '!' || t.v === '+' || t.v === '~') {
        next();
        return { k: 'un', op: t.v, e: unary(), line: t.line };
      }
      if (t.v === '&') {
        next();
        const id = next();
        if (id.t !== 'id') throw new CError('expected variable after &', id.line);
        return { k: 'addr', name: id.v, line: t.line };
      }
      if (t.v === '(' && peek(1).t === 'kw' && TYPE_WORDS.has(peek(1).v)) {
        // cast: (type) expr — ignored
        next();
        skipType();
        while (is('*')) next();
        expect(')');
        return unary();
      }
      if (t.v === '*') throw new CError('pointer dereference is not supported by the simulator', t.line);
    }
    return postfix();
  }
  function postfix(): Expr {
    const e = primary();
    if (e.k === 'id' && (is('++') || is('--'))) {
      const op = next().v as '++' | '--';
      return { k: 'incdec', op, prefix: false, name: e.name, line: e.line };
    }
    if (is('[')) throw new CError('arrays are not supported by the simulator', peek().line);
    return e;
  }
  function primary(): Expr {
    const t = next();
    if (t.t === 'num') return { k: 'num', v: Number(t.v), line: t.line };
    if (t.t === 'str') {
      let v = t.v;
      while (peek().t === 'str') v += next().v; // adjacent literal concatenation
      return { k: 'str', v, line: t.line };
    }
    if (t.t === 'id') {
      if (t.v === 'NULL') return { k: 'num', v: 0, line: t.line };
      if (is('(')) {
        next();
        const args: Expr[] = [];
        if (!is(')')) {
          do args.push(assignment());
          while (is(',') && next());
        }
        expect(')');
        return { k: 'call', name: t.v, args, line: t.line };
      }
      return { k: 'id', name: t.v, line: t.line };
    }
    if (t.t === 'op' && t.v === '(') {
      const e = expression();
      expect(')');
      return e;
    }
    throw new CError(`unexpected '${t.v}'`, t.line);
  }

  // ── statements ──
  function declaration(): Stmt {
    const line = peek().line;
    skipType();
    const items: { name: string; init?: Expr }[] = [];
    do {
      while (is('*')) next();
      const id = next();
      if (id.t !== 'id') throw new CError(`expected a variable name, found '${id.v}'`, id.line);
      if (is('[')) throw new CError('arrays are not supported by the simulator', id.line);
      let init: Expr | undefined;
      if (is('=')) {
        next();
        init = assignment();
      }
      items.push({ name: id.v, init });
    } while (is(',') && next());
    expect(';');
    return { k: 'decl', items, line };
  }

  function block(): Extract<Stmt, { k: 'block' }> {
    const line = expect('{').line;
    const body: Stmt[] = [];
    while (!is('}')) {
      if (peek().t === 'eof') throw new CError("missing '}'", peek().line);
      body.push(statement());
    }
    const endLine = next().line;
    return { k: 'block', body, line, endLine };
  }

  function statement(): Stmt {
    const t = peek();
    if (is('{')) return block();
    if (is(';')) { next(); return { k: 'empty', line: t.line }; }
    if (isTypeStart()) return declaration();
    if (is('if')) {
      next();
      expect('(');
      const cond = expression();
      expect(')');
      const then = statement();
      let els: Stmt | undefined;
      if (is('else')) { next(); els = statement(); }
      return { k: 'if', cond, then, els, line: t.line };
    }
    if (is('while')) {
      next();
      expect('(');
      const cond = expression();
      expect(')');
      return { k: 'while', cond, body: statement(), line: t.line };
    }
    if (is('do')) {
      next();
      const body = statement();
      const condLine = expect('while').line;
      expect('(');
      const cond = expression();
      expect(')');
      expect(';');
      return { k: 'do', cond, body, line: t.line, condLine };
    }
    if (is('for')) {
      next();
      expect('(');
      let init: Stmt | undefined;
      if (is(';')) next();
      else if (isTypeStart()) init = declaration();
      else { init = { k: 'expr', e: expression(), line: t.line }; expect(';'); }
      const cond = is(';') ? undefined : expression();
      expect(';');
      const step = is(')') ? undefined : expression();
      expect(')');
      return { k: 'for', init, cond, step, body: statement(), line: t.line };
    }
    if (is('return')) {
      next();
      const e = is(';') ? undefined : expression();
      expect(';');
      return { k: 'return', e, line: t.line };
    }
    if (is('break')) { next(); expect(';'); return { k: 'break', line: t.line }; }
    if (is('continue')) { next(); expect(';'); return { k: 'continue', line: t.line }; }
    const e = expression();
    expect(';');
    return { k: 'expr', e, line: t.line };
  }

  // ── top level ──
  const globals: ProgramAst['globals'] = [];
  let main: ProgramAst['main'] | undefined;
  let mainLine = 0;
  let hasArgs = false;
  while (peek().t !== 'eof') {
    const startLine = peek().line;
    skipType();
    while (is('*')) next();
    const name = next();
    if (name.t !== 'id') throw new CError(`unexpected '${name.v}' at top level`, name.line);
    if (is('(')) {
      // function definition or prototype
      next();
      let depth = 1;
      let params = 0;
      while (depth > 0) {
        const tk = next();
        if (tk.t === 'eof') throw new CError("missing ')'", tk.line);
        if (tk.v === '(') depth++;
        else if (tk.v === ')') depth--;
        else if (tk.t === 'id' || (tk.t === 'kw' && tk.v !== 'void')) params++;
      }
      if (is(';')) { next(); continue; } // prototype
      if (name.v !== 'main') throw new CError(`only main() can be defined in the simulator (found ${name.v}())`, name.line);
      if (main) throw new CError('main() defined twice', name.line);
      mainLine = name.line;
      hasArgs = params > 0;
      main = block();
      continue;
    }
    // global declaration(s)
    p--; // re-read name
    while (true) {
      while (is('*')) next();
      const id = next();
      if (id.t !== 'id') throw new CError(`expected a name, found '${id.v}'`, id.line);
      let init: Expr | undefined;
      if (is('=')) { next(); init = assignment(); }
      globals.push({ name: id.v, init, line: startLine });
      if (is(',')) { next(); continue; }
      break;
    }
    expect(';');
  }
  if (!main) throw new CError('no main() function found', 1);
  return { globals, main, mainLine, hasArgs };
}

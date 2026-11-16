/** Tiny syntax highlighter for C and shell snippets (no dependencies). Returns tokens per line. */
export interface Tok { c?: string; t: string }

const C_KW = new Set(['if', 'else', 'for', 'while', 'do', 'return', 'break', 'continue', 'switch', 'case', 'default', 'sizeof', 'struct', 'typedef', 'static', 'const', 'extern', 'goto', 'union', 'enum', 'volatile']);
const C_TYPES = new Set(['int', 'char', 'float', 'double', 'void', 'long', 'short', 'unsigned', 'signed', 'pid_t', 'size_t', 'ssize_t', 'FILE', 'off_t', 'mode_t', 'uid_t']);
const C_CONST = new Set(['NULL', 'EOF', 'O_RDONLY', 'O_WRONLY', 'O_RDWR', 'O_CREAT', 'errno', 'stdout', 'stderr', 'stdin']);

export function highlightC(src: string): Tok[][] {
  const lines: Tok[][] = [[]];
  let cur = lines[0];
  const push = (t: string, c?: string) => {
    const parts = t.split('\n');
    parts.forEach((p, i) => {
      if (i > 0) { cur = []; lines.push(cur); }
      if (p) cur.push({ t: p, c });
    });
  };
  const re = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(^[ \t]*#[^\n]*)|(\b\d+(?:\.\d+)?[uUlLfF]?\b|\b0x[0-9a-fA-F]+\b)|([A-Za-z_]\w*)(\s*\()?|(\n)|([^\w\s"'/#]+|\/|#|\s+)/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m[1]) push(m[1], 'tok-com');
    else if (m[2]) push(m[2], 'tok-str');
    else if (m[3]) push(m[3], 'tok-pre');
    else if (m[4]) push(m[4], 'tok-num');
    else if (m[5]) {
      const w = m[5];
      if (C_KW.has(w)) push(w, 'tok-kw');
      else if (C_TYPES.has(w)) push(w, 'tok-type');
      else if (C_CONST.has(w)) push(w, 'tok-num');
      else if (m[6]) push(w, 'tok-fn');
      else push(w);
      if (m[6]) push(m[6]);
    } else if (m[7]) push('\n');
    else push(m[0]);
  }
  return lines;
}

export function highlightShell(src: string): Tok[][] {
  return src.split('\n').map((line) => {
    const m = /^(\s*[%$#]\s?)(.*)$/.exec(line);
    if (!m) return [{ t: line }];
    const [cmd, ...rest] = m[2].split(/(\s+)/);
    const toks: Tok[] = [{ t: m[1], c: 'tok-prompt' }, { t: cmd, c: 'tok-fn' }];
    rest.forEach((r) => toks.push({ t: r, c: /^-/.test(r) ? 'tok-kw' : /^".*"$/.test(r) ? 'tok-str' : undefined }));
    return toks;
  });
}

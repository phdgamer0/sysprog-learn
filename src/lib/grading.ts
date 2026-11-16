import type { Question } from '../content/types';
import { canonical, countNodes, forkTree, runProgram, type TreeNode } from '../sim/explore';

export type Answer =
  | { kind: 'mcq'; v: number }
  | { kind: 'multi'; v: number[] }
  | { kind: 'tf'; v: boolean }
  | { kind: 'numeric'; v: string }
  | { kind: 'short'; v: string }
  | { kind: 'fill'; v: string[] }
  | { kind: 'match'; v: number[] }
  | { kind: 'order'; v: number[] }
  | { kind: 'tree'; v: TreeNode };

export const normalize = (s: string) =>
  s.trim().toLocaleLowerCase('en').replace(/\s+/g, ' ').replace(/[“”]/g, '"').replace(/^["'`]|["'`;.]$/g, '').trim();

const treeCache = new Map<string, TreeNode>();
export function expectedTree(code: string): TreeNode {
  let t = treeCache.get(code);
  if (!t) {
    t = forkTree(runProgram(code));
    treeCache.set(code, t);
  }
  return t;
}
export { countNodes };

/** Is the answer complete enough to be graded? */
export function isAnswered(q: Question, a: Answer | undefined): boolean {
  if (!a || a.kind !== q.kind) return false;
  switch (a.kind) {
    case 'multi': return a.v.length > 0;
    case 'numeric': case 'short': return a.v.trim() !== '';
    case 'fill': return a.v.some((x) => x && x.trim() !== '');
    case 'match': return a.v.some((x) => x >= 0);
    default: return true;
  }
}

/** Score in [0, 1]. Partial credit for multi, fill, match and order. */
export function grade(q: Question, a: Answer | undefined): number {
  if (!a || a.kind !== q.kind) return 0;
  switch (q.kind) {
    case 'mcq': return (a as { v: number }).v === q.answer ? 1 : 0;
    case 'tf': return (a as { v: boolean }).v === q.answer ? 1 : 0;
    case 'numeric': {
      const s = (a as { v: string }).v.trim().replace(',', '.');
      return s !== '' && Number(s) === q.answer ? 1 : 0;
    }
    case 'short': {
      const s = normalize((a as { v: string }).v);
      return q.accept.some((x) => normalize(x) === s) ? 1 : 0;
    }
    case 'multi': {
      const sel = new Set((a as { v: number[] }).v);
      const right = new Set(q.answers);
      let hits = 0, wrong = 0;
      sel.forEach((i) => (right.has(i) ? hits++ : wrong++));
      return Math.max(0, (hits - wrong) / right.size);
    }
    case 'fill': {
      const v = (a as { v: string[] }).v;
      const ok = q.blanks.filter((acc, i) => acc.some((x) => normalize(x) === normalize(v[i] ?? ''))).length;
      return ok / q.blanks.length;
    }
    case 'match': {
      const v = (a as { v: number[] }).v;
      return q.pairs.filter((p, i) => v[i] === p).length / q.pairs.length;
    }
    case 'order': {
      // v = original indices in the order the student arranged them; correct is 0..n-1
      const v = (a as { v: number[] }).v;
      if (v.every((x, i) => x === i)) return 1;
      // partial: longest increasing subsequence / n (items already in correct relative order)
      const lis: number[] = [];
      for (const x of v) {
        let lo = 0, hi = lis.length;
        while (lo < hi) { const mid = (lo + hi) >> 1; if (lis[mid] < x) lo = mid + 1; else hi = mid; }
        lis[lo] = x;
      }
      return lis.length === v.length ? 1 : (lis.length - 1) / v.length;
    }
    case 'tree':
      return canonical((a as { v: TreeNode }).v) === canonical(expectedTree(q.code!)) ? 1 : 0;
  }
}

export function emptyAnswer(q: Question): Answer | undefined {
  switch (q.kind) {
    case 'fill': return { kind: 'fill', v: q.blanks.map(() => '') };
    case 'match': return { kind: 'match', v: q.left.map(() => -1) };
    case 'tree': return { kind: 'tree', v: { children: [] } };
    default: return undefined;
  }
}

export function hashSeed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

// ── shuffling (seeded, so a session can be restored identically) ──
export function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function shuffled<T>(arr: readonly T[], seed: number): T[] {
  const r = mulberry32(seed);
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
/** A permutation of 0..n-1 that is not the identity (for ordering questions). */
export function scramble(n: number, seed: number): number[] {
  const id = Array.from({ length: n }, (_, i) => i);
  for (let s = seed; s < seed + 20; s++) {
    const p = shuffled(id, s);
    if (p.some((x, i) => x !== i)) return p;
  }
  return id.reverse();
}

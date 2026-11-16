import { describe, expect, it } from 'vitest';
import type { Question } from '../content/types';
import { grade, normalize, scramble } from './grading';

const base = { id: 'x', topic: 't', difficulty: 1 as const, prompt: { tr: 'a', en: 'a' }, explanation: { tr: 'a', en: 'a' } };
const opts = [{ tr: 'a', en: 'a' }, { tr: 'b', en: 'b' }, { tr: 'c', en: 'c' }];

describe('grading', () => {
  it('mcq / tf / numeric', () => {
    expect(grade({ ...base, kind: 'mcq', options: opts, answer: 1 }, { kind: 'mcq', v: 1 })).toBe(1);
    expect(grade({ ...base, kind: 'mcq', options: opts, answer: 1 }, { kind: 'mcq', v: 0 })).toBe(0);
    expect(grade({ ...base, kind: 'tf', answer: false }, { kind: 'tf', v: false })).toBe(1);
    expect(grade({ ...base, kind: 'numeric', answer: 6 }, { kind: 'numeric', v: ' 6 ' })).toBe(1);
    expect(grade({ ...base, kind: 'numeric', answer: 6 }, { kind: 'numeric', v: '' })).toBe(0);
  });
  it('multi gives partial credit and penalises wrong picks', () => {
    const q: Question = { ...base, kind: 'multi', options: opts, answers: [0, 2] };
    expect(grade(q, { kind: 'multi', v: [0, 2] })).toBe(1);
    expect(grade(q, { kind: 'multi', v: [0] })).toBe(0.5);
    expect(grade(q, { kind: 'multi', v: [0, 1] })).toBe(0);
  });
  it('short / fill are case and space insensitive', () => {
    expect(normalize('  Wait( NULL ) ')).toBe('wait( null )');
    const f: Question = { ...base, kind: 'fill', template: { tr: '{0} {1}', en: '{0} {1}' }, blanks: [['fork'], ['0', 'zero']] };
    expect(grade(f, { kind: 'fill', v: ['FORK', 'zero'] })).toBe(1);
    expect(grade(f, { kind: 'fill', v: ['fork', '1'] })).toBe(0.5);
  });
  it('match and order', () => {
    const m: Question = { ...base, kind: 'match', left: opts, right: opts, pairs: [2, 0, 1] };
    expect(grade(m, { kind: 'match', v: [2, 0, 1] })).toBe(1);
    expect(grade(m, { kind: 'match', v: [2, 1, 0] })).toBeCloseTo(1 / 3);
    const o: Question = { ...base, kind: 'order', items: opts };
    expect(grade(o, { kind: 'order', v: [0, 1, 2] })).toBe(1);
    expect(grade(o, { kind: 'order', v: [2, 1, 0] })).toBe(0);
    expect(scramble(4, 1)).not.toEqual([0, 1, 2, 3]);
  });
  it('tree questions are graded against the simulator', () => {
    const q: Question = { ...base, kind: 'tree', code: 'int main(){ fork(); fork(); }' };
    const leaf = { children: [] };
    expect(grade(q, { kind: 'tree', v: { children: [{ children: [leaf] }, leaf] } })).toBe(1);
    expect(grade(q, { kind: 'tree', v: { children: [leaf, leaf, leaf] } })).toBe(0);
  });
});

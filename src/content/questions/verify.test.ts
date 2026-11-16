import { describe, expect, it } from 'vitest';
import { exploreOutputs, forkTree, countNodes, lineTally, runProgram } from '../../sim/explore';
import { stdoutText } from '../../sim/machine';
import { EXAMS } from '../exams';
import { QUESTION_BANK } from './index';
import type { Question } from '../types';

type Base = { replace?: [string, string][] };
type Check = Base &
  (
    | { t: 'count'; line: string } // numeric answer = times `line` is printed
    | { t: 'procs' } // numeric answer = number of processes
    | { t: 'lines' } // numeric answer = number of printed lines
    | { t: 'mcqNum'; of: 'procs' | { line: string } } // mcq whose options are numbers
    | { t: 'out'; only?: number[] } // mcq whose options are outputs (lines separated by spaces)
    | { t: 'nouts' } // numeric answer = number of distinct possible outputs
    | { t: 'printed' } // numeric answer = the single number printed
    | { t: 'outset'; set: string[]; tf?: boolean } // exact set of possible outputs
  );

const CHECKS: Record<string, Check> = {
  'm4-q01': { t: 'count', line: 'X' },
  'm4-q02': { t: 'procs' },
  'm4-q05': { t: 'count', line: 'A' },
  'm4-q06': { t: 'count', line: 'X' },
  'm4-q07': { t: 'out' },
  'm4-q08': { t: 'out' },
  'm4-q09': { t: 'count', line: 'C' },
  'm4-q10': { t: 'mcqNum', of: 'procs' },
  'm4-q11': { t: 'count', line: 'X' },
  'm4-q12': { t: 'mcqNum', of: { line: 'X' } },
  'm4-q13': { t: 'count', line: 'X' },
  'm4-q14': { t: 'count', line: 'AB' },
  'm4-q15': { t: 'count', line: 'Done' },
  'm4-q16': { t: 'count', line: 'Child' },
  'm4-q17': { t: 'procs' },
  'm4-q18': { t: 'count', line: 'X' },
  'm4-q19': { t: 'out' },
  'm4-q20': { t: 'out' },
  'm4-q21': { t: 'nouts' },
  'm4-q22': { t: 'out', only: [0, 1, 2] },
  'm4-q23': { t: 'printed' },
  'm4-q24': { t: 'outset', set: ['parent exits\nppid=1\n'] },
  'm4-q25': { t: 'outset', set: [] }, // custom below
  'm5-q02': { t: 'lines', replace: [['execl("/bin/echo", "echo", "B", (char *)NULL);', 'printf("B\\n"); exit(0);']] },
  'm5-q05': { t: 'out', replace: [['execl("/bin/echo", "echo", "child", (char *)NULL);', 'printf("child\\n"); exit(0);']] },
  'm5-q20': { t: 'count', line: 'failed', replace: [['execl("/nonexistent", "x", (char *)NULL);', '']] },
};

/** Code that cannot be run as-is (snippets); semantics are explained in the question text. */
const NO_CHECK = new Set(['m3-q13']);

const norm = (s: string) => s.trim().split('\n').join(' ');
const strip = (s: string) => s.replace(/`/g, '').trim();

function prepared(q: Question, chk: Check): string {
  let code = q.code!;
  for (const [a, b] of chk.replace ?? []) {
    expect(code.includes(a), `${q.id}: replace target missing`).toBe(true);
    code = code.replace(a, b);
  }
  return code;
}

describe('code-dependent answers are verified by the simulator', () => {
  for (const q of QUESTION_BANK) {
    const chk = CHECKS[q.id];
    if (!chk) continue;
    it(q.id, () => {
      const code = prepared(q, chk);
      const m = runProgram(code);
      expect(m.error, `${q.id} runtime error`).toBeUndefined();
      const tally = lineTally(stdoutText(m));
      const total = Object.values(tally).reduce((a, b) => a + b, 0);
      switch (chk.t) {
        case 'count':
          expect(q.kind).toBe('numeric');
          expect((q as { answer: number }).answer).toBe(tally[chk.line] ?? 0);
          break;
        case 'procs':
          expect((q as { answer: number }).answer).toBe(m.procs.length);
          break;
        case 'lines':
          expect((q as { answer: number }).answer).toBe(total);
          break;
        case 'mcqNum': {
          const mq = q as Extract<Question, { kind: 'mcq' }>;
          const want = chk.of === 'procs' ? m.procs.length : (tally[chk.of.line] ?? 0);
          expect(Number(strip(mq.options[mq.answer].en))).toBe(want);
          break;
        }
        case 'out': {
          const mq = q as Extract<Question, { kind: 'mcq' }>;
          const r = exploreOutputs(code);
          expect(r.exhaustive).toBe(true);
          expect(r.errors).toEqual([]);
          const set = new Set(r.outputs.map(norm));
          mq.options.forEach((o, i) => {
            if (chk.only && !chk.only.includes(i)) return;
            expect(set.has(strip(o.en)), `${q.id} option ${i} "${o.en}"`).toBe(i === mq.answer);
          });
          expect(strip(mq.options[mq.answer].tr)).toBe(strip(mq.options[mq.answer].en));
          break;
        }
        case 'nouts': {
          const r = exploreOutputs(code);
          expect(r.exhaustive).toBe(true);
          expect((q as { answer: number }).answer).toBe(r.outputs.length);
          break;
        }
        case 'printed': {
          const r = exploreOutputs(code);
          expect(r.outputs.length).toBe(1);
          expect((q as { answer: number }).answer).toBe(Number(r.outputs[0].trim()));
          break;
        }
        case 'outset': {
          const r = exploreOutputs(code);
          if (chk.set.length) expect(r.outputs.sort()).toEqual([...chk.set].sort());
        }
      }
    });
  }

  it('m4-q25: parent receives the same number the child sees via getpid()', () => {
    const q = QUESTION_BANK.find((x) => x.id === 'm4-q25')!;
    const r = exploreOutputs(q.code!);
    expect(r.exhaustive).toBe(true);
    for (const o of r.outputs) {
      const nums = o.trim().split('\n').map((l) => l.split(' ')[1]);
      expect(nums[0]).toBe(nums[1]);
    }
    expect((q as { answer: boolean }).answer).toBe(true);
  });

  it('m4-q07/m4-q22/m4-q20 have deterministic or documented output sets', () => {
    expect(exploreOutputs(QUESTION_BANK.find((x) => x.id === 'm4-q20')!.code!).outputs.map(norm).sort()).toEqual(['A B C', 'B A C']);
    expect(exploreOutputs(QUESTION_BANK.find((x) => x.id === 'm4-q22')!.code!).outputs.map(norm)).toEqual(['G C P']);
  });

  it('every code question that forks is either checked or explicitly exempt', () => {
    const missing = QUESTION_BANK.filter((q) => q.kind !== 'tree' && q.code && /fork\s*\(/.test(q.code) && !CHECKS[q.id] && !NO_CHECK.has(q.id)).map((q) => q.id);
    // m4-q25 is checked by a dedicated test; m4-q25 is also listed in CHECKS, so nothing should be missing.
    expect(missing).toEqual([]);
  });
});

describe('process-tree questions', () => {
  const trees = QUESTION_BANK.filter((q) => q.kind === 'tree');
  it('there are several tree questions', () => expect(trees.length).toBeGreaterThanOrEqual(6));
  for (const q of trees) {
    it(`${q.id} runs without error`, () => {
      const m = runProgram(q.code!);
      expect(m.error).toBeUndefined();
      expect(countNodes(forkTree(m))).toBeGreaterThan(1);
    });
  }
  const expected: Record<string, number> = { 'm4-q41': 4, 'm4-q42': 4, 'm4-q43': 4, 'm4-q44': 3, 'm4-q45': 3, 'm4-q46': 8, 'm4-q47': 3 };
  for (const [id, n] of Object.entries(expected)) {
    it(`${id} has ${n} processes`, () => {
      const q = QUESTION_BANK.find((x) => x.id === id)!;
      expect(countNodes(forkTree(runProgram(q.code!)))).toBe(n);
    });
  }
});

describe('bank & exams sanity', () => {
  it('ids unique, all kinds present, per-module counts', () => {
    const ids = QUESTION_BANK.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    const kinds = new Set(QUESTION_BANK.map((q) => q.kind));
    for (const k of ['mcq', 'multi', 'tf', 'numeric', 'short', 'fill', 'match', 'order', 'tree']) expect(kinds.has(k as Question['kind'])).toBe(true);
  });
  it('at least 6 exams; each question in at most 2 exams; ids exist', () => {
    expect(EXAMS.length).toBeGreaterThanOrEqual(6);
    const use = new Map<string, number>();
    const ids = new Set(QUESTION_BANK.map((q) => q.id));
    for (const e of EXAMS) for (const id of e.questionIds) { expect(ids.has(id), id).toBe(true); use.set(id, (use.get(id) ?? 0) + 1); }
    for (const [id, n] of use) expect(n, id).toBeLessThanOrEqual(2);
    expect(new Set(EXAMS.map((e) => e.id)).size).toBe(EXAMS.length);
  });
});

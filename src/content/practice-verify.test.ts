import { describe, expect, it } from 'vitest';
import { LESSONS } from './lessons';
import { exploreOutputs, lineTally, runProgram } from '../sim/explore';
import { stdoutText } from '../sim/machine';

const q = (id: string) => {
  const x = LESSONS.flatMap((l) => l.practice).find((p) => p.id === id);
  if (!x?.code) throw new Error('missing ' + id);
  return x;
};
const tally = (id: string) => lineTally(stdoutText(runProgram(q(id).code!)));
const answerOf = (id: string) => { const x = q(id); return x.kind === 'numeric' ? x.answer : x.kind === 'mcq' ? x.answer : null; };

describe('fork lesson practice answers agree with the simulator', () => {
  it('fork-basics-p1', () => expect(tally('fork-basics-p1').X).toBe(answerOf('fork-basics-p1')));
  it('fork-basics-p2', () => expect(tally('fork-basics-p2').One).toBe(answerOf('fork-basics-p2')));
  it('fork-basics-p3', () => { expect(tally('fork-basics-p3')).toEqual({ Y: 2, N: 1 }); expect(answerOf('fork-basics-p3')).toBe(1); });
  it('fork-basics-p5', () => { expect(exploreOutputs(q('fork-basics-p5').code!).outputs).toEqual(['child: 15\nparent: 10\n']); expect(answerOf('fork-basics-p5')).toBe(2); });
  it('pids-orphans-p3', () => { expect(exploreOutputs(q('pids-orphans-p3').code!).outputs.length).toBe(2); expect(answerOf('pids-orphans-p3')).toBe(2); });
  it('pids-orphans-p4', () => expect(Object.values(tally('pids-orphans-p4')).reduce((a, b) => a + b)).toBe(answerOf('pids-orphans-p4')));
  it('wait-exit-zombie-p2', () => expect(Object.keys(tally('wait-exit-zombie-p2')).length).toBe(answerOf('wait-exit-zombie-p2')));
  it('wait-exit-zombie-p3', () => { expect(stdoutText(runProgram(q('wait-exit-zombie-p3').code!))).toBe('3\n'); expect(answerOf('wait-exit-zombie-p3')).toBe(1); });
  it('wait-exit-zombie-p4', () => {
    const outs = exploreOutputs(q('wait-exit-zombie-p4').code!).outputs;
    expect(outs).not.toContain('B\nC\nA\n');
    expect(answerOf('wait-exit-zombie-p4')).toBe(3);
  });
});

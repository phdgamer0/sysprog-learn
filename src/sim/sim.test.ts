import { describe, expect, it } from 'vitest';
import { compile } from './compile';
import { canonical, countNodes, exploreOutputs, forkTree, lineTally, runProgram } from './explore';
import { createMachine, step, stdoutText } from './machine';
import { PRESETS } from './presets';

describe('fork simulator — last year exam questions', () => {
  it('Example 4: "Three" is printed 2 times', () => {
    const m = runProgram(PRESETS['exam-three'].code);
    expect(m.error).toBeUndefined();
    expect(lineTally(stdoutText(m))).toEqual({ One: 1, Two: 2, Three: 2 });
    expect(m.procs.length).toBe(4);
  });
  it('Example 2: PARENT: value = 5', () => {
    const r = exploreOutputs(PRESETS['exam-value'].code);
    expect(r.exhaustive).toBe(true);
    expect(r.outputs).toEqual(['PARENT: value = 5\n']);
  });
  it('loop i<2: "One" 6 times, "Two" 4 times', () => {
    const m = runProgram(PRESETS['exam-one-loop'].code);
    expect(lineTally(stdoutText(m))).toEqual({ One: 6, Two: 4 });
    expect(m.procs.length).toBe(4);
  });
  it('slide example: 4 processes, A twice, B four times', () => {
    const m = runProgram(PRESETS['slide-ab'].code);
    expect(lineTally(stdoutText(m))).toEqual({ 'Mesaj A': 2, 'Mesaj B': 4 });
  });
});

describe('semantics', () => {
  it('fork returns 0 in child and child pid in parent', () => {
    const m = runProgram(PRESETS['fork-template'].code);
    const out = stdoutText(m);
    expect(out).toContain('Child: fork returned 0, my PID=1001, parent=1000');
    expect(out).toContain('Parent: fork returned 1001, my PID=1000');
    expect(out.split('\n')[0]).toBe('Before fork, PID=1000');
  });
  it('orphan sees ppid 1 after parent exits', () => {
    const m = runProgram(PRESETS.orphan.code);
    expect(stdoutText(m)).toContain('child: now my parent is 1');
  });
  it('zombie: exit status decoded with WEXITSTATUS', () => {
    const m = runProgram(PRESETS.zombie.code);
    expect(stdoutText(m)).toContain('reaped 1001, exit code 7');
    expect(m.events.some((e) => e.k === 'exit' && e.zombie)).toBe(true);
  });
  it('wait loop reaps all three children', () => {
    const m = runProgram(PRESETS['wait-all'].code);
    const lines = stdoutText(m).trim().split('\n');
    expect(lines.length).toBe(3);
    expect(lines.map((l) => l.split('exit code: ')[1]).sort()).toEqual(['1', '2', '3']);
  });
  it('stdio buffer is duplicated by fork', () => {
    expect(lineTally(stdoutText(runProgram(PRESETS.buffering.code)))).toEqual({ 'Hello world': 2 });
  });
  it('full buffering duplicates text printed before fork', () => {
    const src = 'int main(){ printf("A\\n"); fork(); return 0; }';
    expect(lineTally(stdoutText(runProgram(src, { bufferMode: 'line' })))).toEqual({ A: 1 });
    expect(lineTally(stdoutText(runProgram(src, { bufferMode: 'full' })))).toEqual({ A: 2 });
  });
  it('fork() && fork() creates 3 processes', () => {
    const m = runProgram(PRESETS.logical.code);
    expect(m.procs.length).toBe(3);
    expect(lineTally(stdoutText(m))).toEqual({ 'parent of two': 1, child: 2 });
  });
  it('chain and fan tree shapes', () => {
    const chain = forkTree(runProgram(PRESETS.chain.code));
    expect(canonical(chain)).toBe('(((())))');
    const fan = forkTree(runProgram(PRESETS.fan.code));
    expect(canonical(fan)).toBe('(()()())');
    expect(countNodes(fan)).toBe(4);
  });
  it('enumerates both interleavings of two printing processes', () => {
    const r = exploreOutputs('int main(){ if (fork()==0) printf("C\\n"); else printf("P\\n"); return 0; }');
    expect(r.outputs.sort()).toEqual(['C\nP\n', 'P\nC\n']);
  });
  it('wait() blocks the parent until the child exits', () => {
    const r = exploreOutputs('int main(){ if (fork()==0) { printf("child\\n"); exit(0);} wait(NULL); printf("parent\\n"); return 0; }');
    expect(r.outputs).toEqual(['child\nparent\n']);
  });
  it('failing fork returns -1 and perror prints to stderr', () => {
    const m = runProgram(PRESETS['fork-template'].code, { failFork: true });
    expect(m.out.some((c) => c.err && c.text.startsWith('fork: '))).toBe(true);
    expect(m.procs.length).toBe(1);
  });
  it('reports compile errors with a line', () => {
    expect(() => compile('int main() {\n  x = 3;\n}')).toThrow(/not declared/);
  });
  it('step() is pure (history/undo friendly)', () => {
    const m0 = createMachine(compile(PRESETS['slide-ab'].code));
    const m1 = step(m0, 1000);
    expect(m0.procs.length).toBe(1);
    expect(m1.procs.length).toBe(2);
  });
});

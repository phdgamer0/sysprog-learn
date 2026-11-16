import { describe, expect, it } from 'vitest';
import { LANGS } from '../i18n/langs';
import { DIAGRAMS } from '../diagrams/ids';
import { INTERACTIVES } from '../interactives/ids';
import { PRESETS } from '../sim/presets';
import { compile } from '../sim/compile';
import type { Exam, Lesson, Question } from './types';

// Glob imports so partially-written content can be validated file by file.
const lessonMods = import.meta.glob('./lessons/m*.ts', { eager: true }) as Record<string, Record<string, unknown>>;
const questionMods = import.meta.glob('./questions/q-*.ts', { eager: true }) as Record<string, Record<string, unknown>>;
const lessons: Lesson[] = Object.values(lessonMods).flatMap((m) => Object.values(m)).filter((v): v is Lesson => !!v && typeof v === 'object' && 'sections' in v);
const bank: Question[] = Object.values(questionMods).flatMap((m) => Object.values(m)).flatMap((v) => (Array.isArray(v) ? (v as Question[]) : []));
const lessonIds = new Set(lessons.map((l) => l.id));

function checkLText(v: unknown, where: string, errs: string[]) {
  if (!v || typeof v !== 'object') { errs.push(`${where}: not an LText`); return; }
  for (const l of LANGS) {
    const s = (v as Record<string, unknown>)[l];
    if (typeof s !== 'string' || !s.trim()) errs.push(`${where}: missing "${l}"`);
  }
}

/** Walk any object; every object that has exactly the language keys is an LText. */
function walk(v: unknown, path: string, errs: string[]) {
  if (Array.isArray(v)) { v.forEach((x, i) => walk(x, `${path}[${i}]`, errs)); return; }
  if (!v || typeof v !== 'object') return;
  const keys = Object.keys(v);
  if (keys.some((k) => (LANGS as readonly string[]).includes(k))) { checkLText(v, path, errs); return; }
  for (const k of keys) walk((v as Record<string, unknown>)[k], `${path}.${k}`, errs);
}

export function validateQuestion(q: Question, errs: string[]) {
  const w = `question ${q.id}`;
  walk(q, w, errs);
  if (!lessonIds.has(q.topic) && lessons.length >= 13) errs.push(`${w}: unknown topic ${q.topic}`);
  switch (q.kind) {
    case 'mcq': if (q.answer < 0 || q.answer >= q.options.length) errs.push(`${w}: answer out of range`); if (q.optionNotes && q.optionNotes.length !== q.options.length) errs.push(`${w}: optionNotes length`); break;
    case 'multi': if (!q.answers.length || q.answers.some((a) => a < 0 || a >= q.options.length)) errs.push(`${w}: answers out of range`); break;
    case 'match': if (q.pairs.length !== q.left.length || new Set(q.pairs).size !== q.pairs.length || q.pairs.some((p) => p < 0 || p >= q.right.length)) errs.push(`${w}: bad pairs`); break;
    case 'order': if (q.items.length < 3) errs.push(`${w}: order needs >= 3 items`); break;
    case 'fill': {
      for (const l of LANGS) {
        const n = (q.template[l].match(/\{\d+\}/g) ?? []).length;
        if (n !== q.blanks.length) errs.push(`${w}: template(${l}) has ${n} blanks, expected ${q.blanks.length}`);
      }
      if (q.blanks.some((b) => !b.length)) errs.push(`${w}: empty blank answers`);
      break;
    }
    case 'short': if (!q.accept.length) errs.push(`${w}: no accepted answers`); break;
    case 'tree': if (!q.code) errs.push(`${w}: tree question needs code`); break;
  }
  if (q.kind === 'tree') { try { compile(q.code!); } catch (e) { errs.push(`${w}: code does not compile in simulator: ${(e as Error).message}`); } }
}

describe('lessons', () => {
  it('have unique ids and valid structure', () => {
    const errs: string[] = [];
    const seen = new Set<string>();
    for (const l of lessons) {
      if (seen.has(l.id)) errs.push(`duplicate lesson ${l.id}`);
      seen.add(l.id);
      walk(l, `lesson ${l.id}`, errs);
      if (!l.objectives.length) errs.push(`${l.id}: no objectives`);
      if (!l.summary.length) errs.push(`${l.id}: no summary`);
      if (l.practice.length < 3) errs.push(`${l.id}: fewer than 3 practice questions`);
      for (const p of l.prerequisites) if (lessons.length >= 13 && !lessonIds.has(p)) errs.push(`${l.id}: unknown prerequisite ${p}`);
      const secIds = new Set<string>();
      for (const s of l.sections) {
        if (secIds.has(s.id)) errs.push(`${l.id}: duplicate section ${s.id}`);
        secIds.add(s.id);
        for (const b of s.blocks) {
          if (b.type === 'diagram' && !(b.id in DIAGRAMS)) errs.push(`${l.id}: unknown diagram ${b.id}`);
          if (b.type === 'interactive') {
            if (!(b.id in INTERACTIVES)) errs.push(`${l.id}: unknown interactive ${b.id}`);
            const pr = b.props?.preset as string | undefined;
            if (pr && !(pr in PRESETS)) errs.push(`${l.id}: unknown preset ${pr}`);
          }
          if (b.type === 'table') for (const r of b.rows) if (r.length !== b.head.length) errs.push(`${l.id}: table row width`);
        }
      }
      const qids = new Set<string>();
      for (const q of l.practice) { if (qids.has(q.id)) errs.push(`dup ${q.id}`); qids.add(q.id); validateQuestion(q, errs); }
    }
    expect(errs).toEqual([]);
  });
});

describe('question bank & exams', () => {
  it('questions are valid and ids unique (also vs practice questions)', () => {
    const errs: string[] = [];
    const ids = new Set(lessons.flatMap((l) => l.practice.map((q) => q.id)));
    for (const q of bank) {
      if (ids.has(q.id)) errs.push(`duplicate question id ${q.id}`);
      ids.add(q.id);
      validateQuestion(q, errs);
    }
    expect(errs).toEqual([]);
  });
  it('exams reference existing questions', async () => {
    const mods = import.meta.glob('./exams.ts', { eager: true }) as Record<string, { EXAMS?: Exam[] }>;
    const exams = Object.values(mods)[0]?.EXAMS ?? [];
    const ids = new Set(bank.map((q) => q.id));
    const errs: string[] = [];
    for (const e of exams) {
      walk(e, `exam ${e.id}`, errs);
      for (const id of e.questionIds) if (!ids.has(id)) errs.push(`exam ${e.id}: unknown question ${id}`);
      if (new Set(e.questionIds).size !== e.questionIds.length) errs.push(`exam ${e.id}: duplicate question`);
    }
    expect(errs).toEqual([]);
  });
});

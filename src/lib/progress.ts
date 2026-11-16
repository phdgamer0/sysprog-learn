import { useSyncExternalStore } from 'react';
import type { LText } from '../i18n/langs';
import type { Answer } from './grading';

export interface Attempt {
  id: string;
  examId: string; // 'custom' for generated exams
  title?: LText;
  startedAt: number;
  finishedAt: number;
  questionIds: string[];
  answers: Record<string, Answer>;
  scores: Record<string, number>; // 0..1 per question
  points: number;
  total: number;
}

export interface ExamSession {
  examId: string;
  title?: LText;
  startedAt: number;
  /** ms; 0 = untimed */
  deadline: number;
  seed: number;
  questionIds: string[];
  answers: Record<string, Answer>;
  flagged: string[];
  index: number;
}

export interface Progress {
  v: 1;
  completed: Record<string, number>;
  lastLesson?: string;
  /** last result per practice question: 0..1 */
  practice: Record<string, number>;
  attempts: Attempt[];
  sessions: Record<string, ExamSession>;
}

const KEY = 'sp.progress.v1';
const empty = (): Progress => ({ v: 1, completed: {}, practice: {}, attempts: [], sessions: {} });

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const p = JSON.parse(raw);
    if (p?.v !== 1) return empty();
    return { ...empty(), ...p };
  } catch {
    return empty();
  }
}

let state: Progress = load();
const listeners = new Set<() => void>();

function commit(next: Progress) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* quota / private mode */ }
  listeners.forEach((l) => l());
}

// keep tabs in sync
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) { state = load(); listeners.forEach((l) => l()); }
  });
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => state,
    () => state,
  );
}
export const getProgress = () => state;

export const progress = {
  setCompleted(id: string, done: boolean) {
    const completed = { ...state.completed };
    if (done) completed[id] = Date.now();
    else delete completed[id];
    commit({ ...state, completed });
  },
  visit(id: string) {
    if (state.lastLesson !== id) commit({ ...state, lastLesson: id });
  },
  practice(qid: string, score: number) {
    commit({ ...state, practice: { ...state.practice, [qid]: score } });
  },
  saveSession(s: ExamSession) {
    commit({ ...state, sessions: { ...state.sessions, [s.examId]: s } });
  },
  dropSession(examId: string) {
    const sessions = { ...state.sessions };
    delete sessions[examId];
    commit({ ...state, sessions });
  },
  addAttempt(a: Attempt) {
    const sessions = { ...state.sessions };
    delete sessions[a.examId];
    commit({ ...state, attempts: [...state.attempts, a], sessions });
  },
  reset() { commit(empty()); },
  export(): string { return JSON.stringify(state, null, 2); },
  import(json: string): boolean {
    try {
      const p = JSON.parse(json);
      if (p?.v !== 1 || typeof p.completed !== 'object' || !Array.isArray(p.attempts)) return false;
      commit({ ...empty(), ...p });
      return true;
    } catch {
      return false;
    }
  },
};

/** Per-topic accuracy from exam attempts and practice answers. */
export function topicStats(p: Progress, topicOf: (qid: string) => string | undefined) {
  const stats: Record<string, { got: number; n: number }> = {};
  const add = (qid: string, s: number) => {
    const t = topicOf(qid);
    if (!t) return;
    const e = (stats[t] ??= { got: 0, n: 0 });
    e.got += s;
    e.n += 1;
  };
  for (const a of p.attempts) for (const q of a.questionIds) add(q, a.scores[q] ?? 0);
  for (const [q, s] of Object.entries(p.practice)) add(q, s);
  return stats;
}

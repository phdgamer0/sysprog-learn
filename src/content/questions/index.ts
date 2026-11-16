import type { Question } from '../types';
import { QUESTIONS_M1 } from './q-m1';
import { QUESTIONS_M2 } from './q-m2';
import { QUESTIONS_M3 } from './q-m3';
import { QUESTIONS_M4 } from './q-m4';
import { QUESTIONS_M5 } from './q-m5';

export const QUESTION_BANK: Question[] = [...QUESTIONS_M1, ...QUESTIONS_M2, ...QUESTIONS_M3, ...QUESTIONS_M4, ...QUESTIONS_M5];

const BY_ID = new Map(QUESTION_BANK.map((q) => [q.id, q]));

export function questionById(id: string): Question | undefined {
  return BY_ID.get(id);
}

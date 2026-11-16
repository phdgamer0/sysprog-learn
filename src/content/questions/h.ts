import type { LText } from '../types';

/** Short helper for bilingual text. */
export const L = (tr: string, en: string): LText => ({ tr, en });

/** Raw template tag for C code (keeps `\n` as two characters). */
export const c = String.raw;

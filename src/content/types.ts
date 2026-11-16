import type { LText } from '../i18n/langs';
import type { DiagramId } from '../diagrams/ids';
import type { InteractiveId } from '../interactives/ids';

export type { LText };

export type ModuleId = 'm1' | 'm2' | 'm3' | 'm4' | 'm5';

export interface Module {
  id: ModuleId;
  title: LText;
  description: LText;
  /** Source document this module is based on. */
  source: string;
}

/** Code may be language-neutral or localized (e.g. comments). */
export type CodeText = string | LText;

export type Block =
  | { type: 'h3'; text: LText }
  | { type: 'p'; text: LText }
  | { type: 'list'; ordered?: boolean; items: LText[] }
  | { type: 'code'; code: CodeText; lang?: 'c' | 'shell' | 'text'; caption?: LText; title?: string | LText }
  | { type: 'callout'; variant: 'note' | 'tip' | 'warning' | 'important' | 'source'; title?: LText; text: LText }
  | { type: 'table'; head: LText[]; rows: LText[][]; caption?: LText }
  | { type: 'diagram'; id: DiagramId; caption?: LText }
  | { type: 'interactive'; id: InteractiveId; props?: Record<string, unknown>; caption?: LText }
  | { type: 'definitions'; items: { term: LText; text: LText }[] }
  | { type: 'steps'; items: { title: LText; text: LText }[] }
  | { type: 'output'; text: string; caption?: LText };

export interface Section {
  id: string;
  title: LText;
  blocks: Block[];
}

export interface Lesson {
  id: string;
  module: ModuleId;
  order: number;
  title: LText;
  /** One-sentence description used in lists and search. */
  blurb: LText;
  minutes: number;
  /** Original slide references, e.g. "sys-prog-4.pdf s.1". */
  sources: string[];
  objectives: LText[];
  prerequisites: string[];
  sections: Section[];
  misconceptions: { wrong: LText; right: LText }[];
  summary: LText[];
  practice: Question[];
}

// ─────────────────────────── Questions ───────────────────────────

export type Difficulty = 1 | 2 | 3;

interface QBase {
  id: string;
  /** Lesson id this question tests (used for "topics to revisit"). */
  topic: string;
  difficulty: Difficulty;
  prompt: LText;
  /** Optional C or shell snippet shown with the prompt. */
  code?: string;
  /** Why the correct answer is correct. */
  explanation: LText;
}

export type Question = QBase &
  (
    | { kind: 'mcq'; options: LText[]; answer: number; /** why each option is wrong/right */ optionNotes?: LText[] }
    | { kind: 'multi'; options: LText[]; answers: number[] }
    | { kind: 'tf'; answer: boolean }
    | { kind: 'numeric'; answer: number }
    /** accepted answers, compared case-insensitively with collapsed whitespace */
    | { kind: 'short'; accept: string[] }
    /** template contains {0}, {1}, … placeholders; blanks[i] lists accepted answers for blank i */
    | { kind: 'fill'; template: LText; blanks: string[][] }
    /** pairs[i] = index into `right` that matches left[i] */
    | { kind: 'match'; left: LText[]; right: LText[]; pairs: number[] }
    /** items listed in the CORRECT order; UI shuffles them */
    | { kind: 'order'; items: LText[] }
    /** Student builds the process tree created by `code`; answer computed by the simulator. */
    | { kind: 'tree' }
  );

export type QuestionKind = Question['kind'];

export interface Exam {
  id: string;
  title: LText;
  description: LText;
  level: Difficulty;
  minutes: number;
  shuffle: boolean;
  questionIds: string[];
}

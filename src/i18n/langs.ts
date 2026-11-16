/**
 * Supported languages. To add a language:
 *   1. add its code here,
 *   2. add a UI dictionary in src/i18n/ui.<code>.ts and register it in src/i18n/index.tsx,
 *   3. add the key to every LText in content (the content test will tell you what is missing).
 */
export const LANGS = ['tr', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const LANG_LABEL: Record<Lang, string> = { tr: 'Türkçe', en: 'English' };

/** A localized string. Inline markup supported: `code`, **bold**, *italic*. */
export type LText = Record<Lang, string>;

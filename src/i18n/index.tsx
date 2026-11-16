import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LANGS, type Lang, type LText } from './langs';
import { UI, type UiKey } from './ui';

export interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** translate a UI key with {placeholders} */
  t: (key: UiKey, vars?: Record<string, string | number>) => string;
  /** pick the current language from a localized content string */
  L: (text: LText | string | undefined) => string;
}

const Ctx = createContext<I18n | null>(null);
const STORAGE_KEY = 'sp.lang';

function initialLang(): Lang {
  try {
    const s = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (s && (LANGS as readonly string[]).includes(s)) return s;
  } catch { /* storage unavailable */ }
  const nav = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : 'tr';
  return (LANGS as readonly string[]).includes(nav) ? (nav as Lang) : 'tr';
}

export function interpolate(s: string, vars?: Record<string, string | number>) {
  return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : s;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const value = useMemo<I18n>(() => ({
    lang,
    setLang,
    t: (key, vars) => interpolate(UI[lang][key] ?? UI.en[key] ?? key, vars),
    L: (text) => (text == null ? '' : typeof text === 'string' ? text : text[lang] ?? text.en),
  }), [lang, setLang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error('useI18n outside provider');
  return v;
}

/** helper for small component-local dictionaries */
export function useLocal<T extends Record<string, LText>>(dict: T): Record<keyof T, string> {
  const { lang } = useI18n();
  return useMemo(() => Object.fromEntries(Object.entries(dict).map(([k, v]) => [k, v[lang]])) as Record<keyof T, string>, [dict, lang]);
}

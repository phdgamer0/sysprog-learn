import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { LESSONS } from '../content/lessons';
import { MODULES } from '../content/modules';
import { GLOSSARY } from '../content/glossary';
import { useI18n } from '../i18n';
import { LANGS, LANG_LABEL, type Lang } from '../i18n/langs';
import { href, navigate, useRoute } from '../lib/router';
import { useProgress } from '../lib/progress';
import { Icon, type IconName } from './Icon';
import { plain } from './Markup';

const isDesktopSafe = () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(min-width: 1024px)').matches;

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (document.documentElement.dataset.theme as 'light' | 'dark') || 'light');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('sp.theme', theme); } catch { /* ignore */ }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0f1115' : '#fbfbfa');
  }, [theme]);
  return [theme, setTheme] as const;
}

export function Layout({ children }: { children: ReactNode }) {
  const { t, L, lang, setLang } = useI18n();
  const route = useRoute();
  const prog = useProgress();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => { try { return localStorage.getItem('sp.sidebar') === 'closed'; } catch { return false; } });
  useEffect(() => { try { localStorage.setItem('sp.sidebar', collapsed ? 'closed' : 'open'); } catch { /* ignore */ } }, [collapsed]);
  const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches;
  const toggleNav = () => (isDesktop() ? setCollapsed((c) => !c) : setOpen(true));
  const [searching, setSearching] = useState(false);
  const [theme, setTheme] = useTheme();
  const page = route.path[0] ?? '';
  const lessonId = page === 'lesson' ? route.path[1] : undefined;

  useEffect(() => setOpen(false), [route.path.join('/')]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = /INPUT|TEXTAREA|SELECT/.test(target.tagName);
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setSearching(true);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const navItem = (to: string, key: Parameters<typeof t>[0], icon: IconName, active: boolean) => (
    <a className="nav-link" href={to} aria-current={active ? 'page' : undefined}>
      <Icon name={icon} size={17} /> {t(key)}
    </a>
  );

  return (
    <>
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>{t('nav.skip')}</a>
      <header className="topbar">
        <button className="btn ghost icon menu-btn" onClick={toggleNav} aria-label={t('nav.toggleSidebar')} title={t('nav.toggleSidebar')} aria-controls="sidebar" aria-expanded={isDesktopSafe() ? !collapsed : open}>
          <Icon name="menu" />
        </button>
        <a className="brand" href={href()}>
          <span className="brand-mark" aria-hidden>$_</span>
          <span className="name">{t('app.name')}</span>
        </a>
        <span className="spacer" />
        <button className="search-trigger" onClick={() => setSearching(true)} aria-label={t('nav.search')}>
          <Icon name="search" size={16} /> <span className="label">{t('nav.search')}</span> <kbd>/</kbd>
        </button>
        <label className="sr-only" htmlFor="lang-select">{t('lang.label')}</label>
        <div className="seg" role="group" aria-label={t('lang.label')}>
          {LANGS.map((l) => (
            <button key={l} aria-pressed={lang === l} onClick={() => setLang(l as Lang)} title={LANG_LABEL[l]} lang={l}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <button className="btn ghost icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={t('theme.toggle')} title={t('theme.toggle')}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>
      </header>
      <div className={'layout' + (collapsed ? ' collapsed' : '')}>
        <div className={'scrim' + (open ? ' open' : '')} onClick={() => setOpen(false)} />
        <nav id="sidebar" className={'sidebar' + (open ? ' open' : '')} aria-hidden={collapsed && isDesktopSafe() ? true : undefined} inert={collapsed && isDesktopSafe() ? true : undefined} aria-label={t('nav.lessons')}>
          <div className="btn-row drawer-close" style={{ justifyContent: 'flex-end', marginBottom: 8 }}>
            <button className="btn ghost icon" onClick={() => setOpen(false)} aria-label={t('nav.close')}><Icon name="x" /></button>
          </div>
          <div className="nav-section">
            {navItem(href(), 'nav.home', 'book', page === '')}
            {navItem(href('lab'), 'nav.lab', 'flask', page === 'lab')}
            {navItem(href('exams'), 'nav.exams', 'clipboard', page === 'exams' || page === 'exam')}
            {navItem(href('progress'), 'nav.progress', 'chart', page === 'progress')}
            {navItem(href('glossary'), 'nav.glossary', 'globe', page === 'glossary')}
          </div>
          <div className="nav-section">
            <div className="nav-title">{t('nav.lessons')}</div>
            {MODULES.map((m, mi) => {
              const ls = LESSONS.filter((l) => l.module === m.id);
              const done = ls.filter((l) => prog.completed[l.id]).length;
              return (
                <div key={m.id}>
                  <div className="nav-module">{mi + 1}. {L(m.title)} <span>{done}/{ls.length}</span></div>
                  {ls.map((l) => (
                    <a key={l.id} className="nav-link" href={href('lesson', l.id)} aria-current={lessonId === l.id ? 'page' : undefined}>
                      <span className="nav-num">{mi + 1}.{l.order}</span>
                      <span>{L(l.title)}</span>
                      {prog.completed[l.id] && <span className="tick"><Icon name="check" size={15} label={t('lesson.done')} /></span>}
                    </a>
                  ))}
                </div>
              );
            })}
          </div>
        </nav>
        <main className="main" id="main" tabIndex={-1}>
          {children}
          <footer className="footer">{t('footer.note')}</footer>
        </main>
      </div>
      {searching && <SearchDialog onClose={() => setSearching(false)} />}
    </>
  );
}

interface Hit { title: string; sub: string; to: string; hay: string }

function SearchDialog({ onClose }: { onClose: () => void }) {
  const { t, L, lang } = useI18n();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => inputRef.current?.focus(), []);

  const index = useMemo<Hit[]>(() => {
    const hits: Hit[] = [];
    for (const l of LESSONS) {
      const title = L(l.title);
      hits.push({ title, sub: plain(L(l.blurb)), to: href('lesson', l.id), hay: `${title} ${L(l.blurb)} ${l.title.en} ${l.title.tr}` });
      for (const s of l.sections) {
        hits.push({ title: L(s.title), sub: title, to: href('lesson', l.id) + '?s=' + s.id, hay: `${L(s.title)} ${s.title.en} ${s.title.tr}` });
      }
    }
    for (const g of GLOSSARY) {
      hits.push({ title: `${g.tr} — ${g.en}`, sub: t('nav.glossary'), to: href('glossary') + '?q=' + encodeURIComponent(g.en), hay: `${g.tr} ${g.en} ${L(g.def)}` });
    }
    hits.push({ title: t('nav.lab'), sub: t('lab.lead'), to: href('lab'), hay: `${t('nav.lab')} fork simulator lab laboratuvar` });
    hits.push({ title: t('nav.exams'), sub: t('exams.lead'), to: href('exams'), hay: `${t('nav.exams')} exam sınav` });
    return hits;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const fold = (s: string) => s.toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i');
  const results = useMemo(() => {
    const terms = fold(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return index.filter((h) => h.sub !== t('nav.glossary')).slice(0, 12);
    return index.filter((h) => { const hay = fold(h.hay); return terms.every((x) => hay.includes(x)); }).slice(0, 30);
  }, [q, index]);

  const go = (h: Hit) => { onClose(); navigate(h.to); };
  return (
    <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-label={t('nav.search')}>
        <input
          ref={inputRef}
          type="search"
          value={q}
          placeholder={t('nav.searchPlaceholder')}
          aria-label={t('nav.search')}
          onChange={(e) => { setQ(e.target.value); setActive(0); }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            else if (e.key === 'Enter' && results[active]) go(results[active]);
          }}
        />
        <ul className="results" role="listbox">
          {results.length === 0 && <li className="muted small" style={{ padding: 12 }}>{t('nav.noResults')}</li>}
          {results.map((h, i) => (
            <li key={h.to + i} role="option" aria-selected={i === active}>
              <a href={h.to} className={i === active ? 'active' : ''} onClick={(e) => { e.preventDefault(); go(h); }} onMouseEnter={() => setActive(i)}>
                {plain(h.title)}
                <span className="sub">{h.sub}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

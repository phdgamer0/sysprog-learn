import { useEffect, useState } from 'react';
import { BlockList, type ViewMode } from '../components/Blocks';
import { Icon } from '../components/Icon';
import { Inline } from '../components/Markup';
import { PracticeQuestion } from '../components/QuestionView';
import { LESSONS, lessonById } from '../content/lessons';
import { MODULES } from '../content/modules';
import { useI18n } from '../i18n';
import { progress, useProgress } from '../lib/progress';
import { href } from '../lib/router';
import { NotFound } from './NotFound';

function useViewMode(): [ViewMode, (m: ViewMode) => void] {
  const [m, setM] = useState<ViewMode>(() => {
    try { return (localStorage.getItem('sp.view') as ViewMode) || 'all'; } catch { return 'all'; }
  });
  return [m, (v) => { setM(v); try { localStorage.setItem('sp.view', v); } catch { /* ignore */ } }];
}

export function LessonPage({ id, section }: { id: string; section?: string | null }) {
  const { t, L } = useI18n();
  const lesson = lessonById(id);
  const prog = useProgress();
  const [mode, setMode] = useViewMode();
  const [active, setActive] = useState<string>('');

  useEffect(() => { if (lesson) progress.visit(lesson.id); }, [lesson]);
  useEffect(() => {
    if (section) setTimeout(() => document.getElementById('sec-' + section)?.scrollIntoView({ behavior: 'smooth' }), 50);
    else window.scrollTo(0, 0);
  }, [id, section]);
  useEffect(() => {
    if (!lesson) return;
    const els = lesson.sections.map((s) => document.getElementById('sec-' + s.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (vis) setActive(vis.target.id.slice(4));
    }, { rootMargin: '-80px 0px -60% 0px' });
    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, [lesson, mode]);

  if (!lesson) return <NotFound text={t('lesson.notFound')} />;
  const mi = MODULES.findIndex((m) => m.id === lesson.module);
  const idx = LESSONS.indexOf(lesson);
  const prev = LESSONS[idx - 1];
  const next = LESSONS[idx + 1];
  const done = !!prog.completed[lesson.id];
  const practiced = lesson.practice.filter((q) => q.id in prog.practice);
  const practiceCorrect = practiced.filter((q) => prog.practice[q.id] === 1).length;

  return (
    <div className="lesson-layout">
      <article className="lesson-body">
        <header className="lesson-head">
          <div className="eyebrow">{t('lesson.module', { n: mi + 1 })} · {L(MODULES[mi].title)}</div>
          <h1>{L(lesson.title)}</h1>
          <p className="lead" style={{ marginTop: 10 }}><Inline text={L(lesson.blurb)} /></p>
          <div className="lesson-meta">
            <span className="chip">{t('lesson.minutes', { n: lesson.minutes })}</span>
            {done && <span className="chip ok"><Icon name="check" size={13} /> {t('lesson.done')}</span>}
            <span>{t('lesson.sources')}: {lesson.sources.join(', ')}</span>
          </div>
        </header>

        <div className="objectives">
          <div className="panel panel-pad">
            <h2>{t('lesson.objectives')}</h2>
            <ul>{lesson.objectives.map((o, i) => <li key={i}><Inline text={L(o)} /></li>)}</ul>
          </div>
          <div className="panel panel-pad">
            <h2>{t('lesson.prereqs')}</h2>
            {lesson.prerequisites.length === 0 ? <p className="muted" style={{ margin: 0 }}>{t('lesson.noPrereqs')}</p> : (
              <ul>
                {lesson.prerequisites.map((p) => {
                  const pl = lessonById(p);
                  return pl ? <li key={p}><a href={href('lesson', p)}>{L(pl.title)}</a> {prog.completed[p] && <Icon name="check" size={13} label={t('lesson.done')} />}</li> : null;
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="view-switch">
          <div className="btn-row">
            <span className="small" style={{ fontWeight: 600 }}>{t('lesson.view')}</span>
            <div className="seg" role="group" aria-label={t('lesson.view')}>
              {(['all', 'static', 'interactive'] as ViewMode[]).map((m) => (
                <button key={m} aria-pressed={mode === m} onClick={() => setMode(m)}>{t(`lesson.view.${m}` as 'lesson.view.all')}</button>
              ))}
            </div>
          </div>
          <span className="hint">{t('lesson.viewHint')}</span>
        </div>

        {lesson.sections.map((s, i) => (
          <section key={s.id} id={'sec-' + s.id} className="lesson-section" aria-labelledby={'h-' + s.id}>
            <h2 id={'h-' + s.id}><span className="num">{mi + 1}.{lesson.order}.{i + 1}</span> <Inline text={L(s.title)} /></h2>
            <BlockList blocks={s.blocks} mode={mode} />
          </section>
        ))}

        {mode !== 'interactive' && (
          <>
            <section id="sec-misconceptions" className="lesson-section">
              <h2>{t('lesson.misconceptions')}</h2>
              <div className="myths">
                {lesson.misconceptions.map((m, i) => (
                  <div className="myth" key={i}>
                    <div><div className="lab">{t('lesson.myth')}</div><Inline text={L(m.wrong)} /></div>
                    <div><div className="lab">{t('lesson.fact')}</div><Inline text={L(m.right)} /></div>
                  </div>
                ))}
              </div>
            </section>
            <section id="sec-summary" className="lesson-section">
              <h2>{t('lesson.summary')}</h2>
              <ul className="summary">{lesson.summary.map((x, i) => <li key={i}><Inline text={L(x)} /></li>)}</ul>
            </section>
          </>
        )}

        <section id="sec-practice" className="lesson-section">
          <h2 style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
            {t('lesson.practice')}
            {practiced.length > 0 && <span className="chip accent">{t('lesson.practiceScore', { c: practiceCorrect, t: lesson.practice.length })}</span>}
          </h2>
          {lesson.practice.map((q, i) => <PracticeQuestion key={q.id} q={q} index={i} />)}
        </section>

        <div className="lesson-foot">
          <button className={'btn ' + (done ? '' : 'primary')} onClick={() => progress.setCompleted(lesson.id, !done)}>
            <Icon name="check" size={16} /> {done ? t('lesson.markUndone') : t('lesson.markDone')}
          </button>
        </div>
        <nav className="pager" aria-label="pager">
          {prev && <a href={href('lesson', prev.id)}><span className="dir">← {t('nav.prev')}</span>{L(prev.title)}</a>}
          {next && <a className="next" href={href('lesson', next.id)}><span className="dir">{t('nav.next')} →</span>{L(next.title)}</a>}
        </nav>
      </article>
      <nav className="toc" aria-label={t('lesson.onThisPage')}>
        <div className="nav-title" style={{ paddingLeft: 10 }}>{t('lesson.onThisPage')}</div>
        {lesson.sections.map((s) => (
          <a key={s.id} href={href('lesson', lesson.id) + '?s=' + s.id} className={active === s.id ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); document.getElementById('sec-' + s.id)?.scrollIntoView({ behavior: 'smooth' }); }}>
            {L(s.title).replace(/`/g, '')}
          </a>
        ))}
        <a href="#sec-practice" onClick={(e) => { e.preventDefault(); document.getElementById('sec-practice')?.scrollIntoView({ behavior: 'smooth' }); }}>{t('lesson.practice')}</a>
      </nav>
    </div>
  );
}

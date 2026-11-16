import { Icon } from '../components/Icon';
import { Inline } from '../components/Markup';
import { LESSONS, lessonById } from '../content/lessons';
import { MODULES } from '../content/modules';
import { useI18n } from '../i18n';
import { useProgress } from '../lib/progress';
import { href } from '../lib/router';
import { PRESETS } from '../sim/presets';

export function Home() {
  const { t, L } = useI18n();
  const prog = useProgress();
  const done = LESSONS.filter((l) => prog.completed[l.id]).length;
  const last = prog.lastLesson ? lessonById(prog.lastLesson) : undefined;
  const firstOpen = LESSONS.find((l) => !prog.completed[l.id]) ?? LESSONS[0];
  const resume = last && !prog.completed[last.id] ? last : firstOpen;
  const pct = Math.round((done / LESSONS.length) * 100);
  return (
    <div className="page">
      <section className="hero">
        <div className="eyebrow">{t('app.tagline')}</div>
        <h1>{t('home.hero')}</h1>
        <p className="lead">{t('home.lead')}</p>
        <div className="btn-row" style={{ marginTop: 20 }}>
          <a className="btn primary" href={href('lesson', resume.id)}>
            {done === 0 && !last ? t('home.start') : t('home.resume', { title: L(resume.title) })} <Icon name="arrowR" size={16} />
          </a>
          <a className="btn" href={href('lab')}><Icon name="flask" size={16} /> {t('home.openLab')}</a>
          <a className="btn ghost" href={href('exams')}><Icon name="clipboard" size={16} /> {t('nav.exams')}</a>
        </div>
        <div style={{ marginTop: 24, maxWidth: 420 }}>
          <div className="small muted" style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('home.overall')}</span><span className="mono">{done}/{LESSONS.length}</span></div>
          <div className="bar" style={{ marginTop: 4 }}><span style={{ width: pct + '%' }} /></div>
        </div>
      </section>

      <h2 style={{ marginBottom: 16 }}>{t('home.modules')}</h2>
      <div className="grid-3">
        {MODULES.map((m, i) => {
          const ls = LESSONS.filter((l) => l.module === m.id);
          return (
            <section key={m.id} className="panel module-card">
              <h3><span className="num">0{i + 1}</span> {L(m.title)}</h3>
              <p className="muted small" style={{ margin: 0 }}>{L(m.description)}</p>
              <ol>
                {ls.map((l) => (
                  <li key={l.id}>
                    <a href={href('lesson', l.id)}>
                      <span className="mono muted small">{i + 1}.{l.order}</span> {L(l.title)}
                      {prog.completed[l.id] && <span className="tick"><Icon name="check" size={15} label={t('lesson.done')} /></span>}
                    </a>
                  </li>
                ))}
              </ol>
              <span className="small muted">{m.source}</span>
            </section>
          );
        })}
        <section className="panel module-card">
          <h3><Icon name="flask" /> {t('home.examStyle')}</h3>
          <p className="muted small" style={{ margin: 0 }}>{t('home.examStyleText')}</p>
          <ol>
            {(['exam-three', 'exam-value', 'exam-one-loop'] as const).map((p) => (
              <li key={p}><a href={href('lab') + '?preset=' + p}><Inline text={L(PRESETS[p].title)} /></a></li>
            ))}
          </ol>
        </section>
      </div>

      <section className="panel panel-pad" style={{ marginTop: 32 }}>
        <h2 style={{ marginBottom: 10 }}>{t('home.howTo')}</h2>
        <ol className="how">
          <li>{t('home.how1')}</li>
          <li>{t('home.how2')}</li>
          <li>{t('home.how3')}</li>
          <li>{t('home.how4')}</li>
        </ol>
      </section>
    </div>
  );
}

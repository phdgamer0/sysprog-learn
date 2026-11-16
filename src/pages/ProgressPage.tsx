import { useRef } from 'react';
import { Icon } from '../components/Icon';
import { EXAMS } from '../content/exams';
import { LESSONS } from '../content/lessons';
import { questionById } from '../content/questions';
import { useI18n } from '../i18n';
import { progress, topicStats, useProgress } from '../lib/progress';
import { href } from '../lib/router';

const topicOf = (qid: string) => questionById(qid)?.topic ?? LESSONS.find((l) => l.practice.some((q) => q.id === qid))?.id;

export function ProgressPage() {
  const { t, L, lang } = useI18n();
  const prog = useProgress();
  const fileRef = useRef<HTMLInputElement>(null);
  const done = LESSONS.filter((l) => prog.completed[l.id]).length;
  const avg = prog.attempts.length ? Math.round(prog.attempts.reduce((s, a) => s + a.points / a.total, 0) / prog.attempts.length * 100) : null;
  const stats = topicStats(prog, topicOf);
  const weak = Object.entries(stats).filter(([, v]) => v.n >= 2 && v.got / v.n < 0.7).sort((a, b) => a[1].got / a[1].n - b[1].got / b[1].n);
  const exportFile = () => {
    const blob = new Blob([progress.export()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sysprog-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importFile = async (f: File) => { if (!progress.import(await f.text())) alert(t('progress.importError')); };
  return (
    <div className="page">
      <h1>{t('progress.title')}</h1>
      <p className="lead">{t('progress.lead')}</p>
      <div className="grid-3" style={{ marginTop: 20 }}>
        <div className="panel panel-pad"><div className="small muted">{t('progress.lessons')}</div><div className="score-big">{done}<span className="muted" style={{ fontSize: '1.2rem' }}>/{LESSONS.length}</span></div><div className="bar" style={{ marginTop: 8 }}><span style={{ width: (done / LESSONS.length) * 100 + '%' }} /></div></div>
        <div className="panel panel-pad"><div className="small muted">{t('progress.exams')}</div><div className="score-big">{prog.attempts.length}</div></div>
        <div className="panel panel-pad"><div className="small muted">{t('progress.avg')}</div><div className="score-big">{avg === null ? '—' : avg + '%'}</div></div>
      </div>

      <section className="panel panel-pad" style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 10 }}>{t('progress.revisit')}</h2>
        {weak.length === 0 ? <p className="muted" style={{ margin: 0 }}>{t('progress.revisitNone')}</p> : (
          <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
            {weak.map(([topic, v]) => {
              const l = LESSONS.find((x) => x.id === topic);
              return <li key={topic}><a href={href('lesson', topic)}>{l ? L(l.title) : topic}</a> <span className="muted small">— {t('progress.revisitWhy', { p: Math.round((v.got / v.n) * 100), n: v.n })}</span></li>;
            })}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 10 }}>{t('progress.topicTable')}</h2>
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>{t('progress.lesson')}</th><th>{t('progress.status')}</th><th>{t('progress.accuracy')}</th></tr></thead>
            <tbody>
              {LESSONS.map((l) => {
                const v = stats[l.id];
                const p = v ? Math.round((v.got / v.n) * 100) : null;
                return (
                  <tr key={l.id}>
                    <td><a href={href('lesson', l.id)}>{L(l.title)}</a></td>
                    <td>{prog.completed[l.id] ? <span className="chip ok"><Icon name="check" size={12} /> {t('lesson.done')}</span> : <span className="muted">—</span>}</td>
                    <td>{p === null ? <span className="muted">—</span> : <span className={'chip ' + (p >= 70 ? 'ok' : p >= 50 ? 'warn' : 'bad')}>{p}% ({v!.n})</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 10 }}>{t('progress.history')}</h2>
        {prog.attempts.length === 0 ? <p className="muted">{t('progress.noHistory')}</p> : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>{t('progress.date')}</th><th>{t('progress.exam')}</th><th>{t('progress.score')}</th></tr></thead>
              <tbody>
                {prog.attempts.slice().reverse().map((a) => {
                  const e = EXAMS.find((x) => x.id === a.examId);
                  const p = Math.round((a.points / a.total) * 100);
                  return (
                    <tr key={a.id}>
                      <td className="mono small">{new Date(a.finishedAt).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' })}</td>
                      <td><a href={href('result', a.id)}>{e ? L(e.title) : a.title ? L(a.title) : a.examId}</a></td>
                      <td><span className={'chip ' + (p >= 70 ? 'ok' : p >= 50 ? 'warn' : 'bad')}>{p}%</span> <span className="muted small">{a.points}/{a.total}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="btn-row" style={{ marginTop: 28 }}>
        <button className="btn" onClick={exportFile}>{t('progress.export')}</button>
        <button className="btn" onClick={() => fileRef.current?.click()}>{t('progress.import')}</button>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} />
        <button className="btn danger" onClick={() => confirm(t('progress.confirmReset')) && progress.reset()}>{t('progress.reset')}</button>
      </div>
    </div>
  );
}

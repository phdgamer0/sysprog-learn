import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../components/Icon';
import { Inline } from '../components/Markup';
import { QuestionView } from '../components/QuestionView';
import { EXAMS } from '../content/exams';
import { LESSONS, lessonById } from '../content/lessons';
import { QUESTION_BANK, questionById } from '../content/questions';
import type { Exam, LText } from '../content/types';
import { useI18n } from '../i18n';
import { emptyAnswer, grade, isAnswered, shuffled, type Answer } from '../lib/grading';
import { getProgress, progress, useProgress, type Attempt, type ExamSession } from '../lib/progress';
import { href, navigate } from '../lib/router';
import { NotFound } from './NotFound';

const CUSTOM_TITLE: LText = { tr: 'Özel alıştırma sınavı', en: 'Custom practice exam' };

function newSession(e: Exam): ExamSession {
  const seed = (Date.now() ^ (Math.random() * 1e9)) >>> 0;
  return {
    examId: e.id,
    startedAt: Date.now(),
    deadline: e.minutes ? Date.now() + e.minutes * 60000 : 0,
    seed,
    questionIds: e.shuffle ? shuffled(e.questionIds, seed) : e.questionIds.slice(),
    answers: {},
    flagged: [],
    index: 0,
  };
}

export function ExamsPage() {
  const { t, L } = useI18n();
  const prog = useProgress();
  const [topics, setTopics] = useState<string[]>([]);
  const [size, setSize] = useState(10);
  const pool = QUESTION_BANK.filter((q) => !topics.length || topics.includes(q.topic));
  const generate = () => {
    const seed = (Date.now() ^ (Math.random() * 1e9)) >>> 0;
    const ids = shuffled(pool.map((q) => q.id), seed).slice(0, Math.min(size, pool.length));
    progress.saveSession({ examId: 'custom', title: CUSTOM_TITLE, startedAt: Date.now(), deadline: 0, seed, questionIds: ids, answers: {}, flagged: [], index: 0 });
    navigate(href('exam', 'custom'));
  };
  return (
    <div className="page">
      <h1>{t('exams.title')}</h1>
      <p className="lead">{t('exams.lead')}</p>
      <div className="grid-3" style={{ marginTop: 24 }}>
        {EXAMS.map((e) => {
          const att = prog.attempts.filter((a) => a.examId === e.id);
          const best = att.length ? Math.max(...att.map((a) => Math.round((a.points / a.total) * 100))) : null;
          const resume = prog.sessions[e.id];
          return (
            <div key={e.id} className="panel exam-card">
              <h3>{L(e.title)}</h3>
              <div className="meta">
                <span className="chip">{t('exams.questions', { n: e.questionIds.length })}</span>
                <span className="chip">{t('exams.minutes', { n: e.minutes })}</span>
                <span className={'chip ' + (e.level === 3 ? 'bad' : e.level === 2 ? 'warn' : 'ok')}>{t(`q.diff.${e.level}` as 'q.diff.1')}</span>
              </div>
              <p><Inline text={L(e.description)} /></p>
              <div className="small muted">{best === null ? t('exams.never') : `${t('exams.best', { p: best })} · ${t('exams.attempts', { n: att.length })}`}</div>
              <div className="btn-row">
                <a className="btn primary" href={href('exam', e.id)} onClick={() => { if (!resume) progress.saveSession(newSession(e)); }}>
                  {resume ? t('exam.resume') : t('exams.start')}
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <section className="panel panel-pad" style={{ marginTop: 32 }}>
        <h2>{t('exams.custom')}</h2>
        <p className="muted">{t('exams.customLead')}</p>
        <fieldset style={{ border: 0, padding: 0, margin: '0 0 12px' }}>
          <legend className="small" style={{ fontWeight: 600, marginBottom: 6 }}>{t('exams.topics')}</legend>
          <div className="btn-row">
            <label className="inline"><input type="checkbox" checked={!topics.length} onChange={() => setTopics([])} /> {t('exams.allTopics')}</label>
            {LESSONS.map((l) => (
              <label key={l.id} className="inline">
                <input type="checkbox" checked={topics.includes(l.id)} onChange={(e) => setTopics((x) => (e.target.checked ? [...x, l.id] : x.filter((y) => y !== l.id)))} /> {L(l.title)}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="btn-row">
          <label className="inline">{t('exams.size')} <input type="number" min={3} max={50} value={size} onChange={(e) => setSize(Math.max(3, Math.min(50, Number(e.target.value) || 10)))} style={{ width: 80 }} /></label>
          <span className="muted small">({pool.length})</span>
          <button className="btn primary" onClick={generate} disabled={!pool.length}>{t('exams.generate')}</button>
          {prog.sessions.custom && <a className="btn" href={href('exam', 'custom')}>{t('exam.resume')}</a>}
        </div>
      </section>
    </div>
  );
}

function fmt(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function ExamRun({ id }: { id: string }) {
  const { t, L } = useI18n();
  const exam = EXAMS.find((e) => e.id === id);
  const prog = useProgress();
  const session = prog.sessions[id];
  const [now, setNow] = useState(Date.now());
  const submitted = useRef(false);

  // start a session if someone opens the URL directly
  useEffect(() => { if (!session && exam) progress.saveSession(newSession(exam)); }, [session, exam]);
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [session?.index]);

  const submit = (s: ExamSession) => {
    if (submitted.current) return;
    submitted.current = true;
    const scores: Record<string, number> = {};
    let points = 0;
    for (const qid of s.questionIds) {
      const q = questionById(qid);
      const sc = q ? grade(q, s.answers[qid]) : 0;
      scores[qid] = sc;
      points += sc;
    }
    const a: Attempt = {
      id: `${s.examId}-${Date.now()}`, examId: s.examId, title: s.title, startedAt: s.startedAt, finishedAt: Date.now(),
      questionIds: s.questionIds, answers: s.answers, scores, points: Math.round(points * 100) / 100, total: s.questionIds.length,
    };
    progress.addAttempt(a);
    navigate(href('result', a.id));
  };

  useEffect(() => {
    if (session && session.deadline && now > session.deadline) { alert(t('exam.timeUp')); submit(getProgress().sessions[id] ?? session); }
  }, [now]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!exam && id !== 'custom') return <NotFound text={t('exam.notFound')} />;
  if (!session) {
    if (id === 'custom') return <NotFound text={t('exam.notFound')} />;
    return null;
  }
  const title = exam ? L(exam.title) : L(session.title ?? CUSTOM_TITLE);
  const qs = session.questionIds.map((q) => questionById(q)).filter((q): q is NonNullable<typeof q> => !!q);
  const idx = Math.min(session.index, qs.length - 1);
  const q = qs[idx];
  const update = (patch: Partial<ExamSession>) => progress.saveSession({ ...getProgress().sessions[id]!, ...patch });
  const setAnswer = (a: Answer) => update({ answers: { ...getProgress().sessions[id]!.answers, [q.id]: a } });
  const answeredCount = qs.filter((x) => isAnswered(x, session.answers[x.id])).length;
  const left = session.deadline ? session.deadline - now : 0;
  const flagged = session.flagged.includes(q.id);

  return (
    <div className="exam-shell">
      <div className="exam-top">
        <div>
          <div className="small muted">{title}</div>
          <strong>{t('exam.question', { i: idx + 1, n: qs.length })}</strong>
        </div>
        <div className="btn-row">
          <span className="small muted">{t('exam.answered', { a: answeredCount, n: qs.length })}</span>
          {session.deadline > 0 && <span className={'timer' + (left < 60000 ? ' low' : '')} aria-label={t('exam.timeLeft')} role="timer">{fmt(left)}</span>}
        </div>
      </div>

      <QuestionView key={q.id} q={q} index={idx} answer={session.answers[q.id] ?? emptyAnswer(q)} onChange={setAnswer} mode="exam" seed={session.seed} />

      <div className="btn-row" style={{ justifyContent: 'space-between', marginTop: 14 }}>
        <div className="btn-row">
          <button className="btn" onClick={() => update({ index: idx - 1 })} disabled={idx === 0}><Icon name="arrowL" size={16} /> {t('exam.prev')}</button>
          <button className={'btn' + (idx < qs.length - 1 ? ' primary' : '')} onClick={() => update({ index: idx + 1 })} disabled={idx >= qs.length - 1}>{t('exam.next')} <Icon name="arrowR" size={16} /></button>
        </div>
        <button className={'btn small ' + (flagged ? '' : 'ghost')} onClick={() => update({ flagged: flagged ? session.flagged.filter((x) => x !== q.id) : [...session.flagged, q.id] })} aria-pressed={flagged}>
          <Icon name="flag" size={15} /> {flagged ? t('exam.flagged') : t('exam.flag')}
        </button>
      </div>

      <section className="panel panel-pad" style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 10 }}>{t('exam.overview')}</h3>
        <div className="qnav">
          {qs.map((x, i) => (
            <button key={x.id} onClick={() => update({ index: i })} aria-label={`${i + 1}`} aria-current={i === idx}
              className={[isAnswered(x, session.answers[x.id]) ? 'answered' : '', i === idx ? 'current' : '', session.flagged.includes(x.id) ? 'flagged' : ''].join(' ')}>
              {i + 1}
            </button>
          ))}
        </div>
        <div className="btn-row" style={{ marginTop: 16, justifyContent: 'space-between' }}>
          <button className="btn ghost" onClick={() => { if (confirm(t('exam.confirmAbandon'))) navigate(href('exams')); }}>{t('exam.abandon')}</button>
          <button className="btn primary" onClick={() => {
            const missing = qs.length - answeredCount;
            if (missing === 0 || confirm(t('exam.confirmSubmit', { n: missing }))) submit(getProgress().sessions[id]!);
          }}>{t('exam.submit')}</button>
        </div>
      </section>
    </div>
  );
}

export function ResultPage({ attemptId }: { attemptId: string }) {
  const { t, L } = useI18n();
  const prog = useProgress();
  const a = prog.attempts.find((x) => x.id === attemptId);
  const [onlyWrong, setOnlyWrong] = useState(false);
  const exam = a ? EXAMS.find((e) => e.id === a.examId) : undefined;
  const byTopic = useMemo(() => {
    const m: Record<string, { got: number; n: number }> = {};
    if (a) for (const qid of a.questionIds) {
      const q = questionById(qid);
      if (!q) continue;
      const e = (m[q.topic] ??= { got: 0, n: 0 });
      e.got += a.scores[qid] ?? 0;
      e.n++;
    }
    return m;
  }, [a]);
  useEffect(() => window.scrollTo(0, 0), [attemptId]);
  if (!a) return <NotFound text={t('exam.notFound')} />;
  const pct = Math.round((a.points / a.total) * 100);
  const title = exam ? L(exam.title) : L(a.title ?? CUSTOM_TITLE);
  const retake = () => {
    if (exam) { progress.saveSession(newSession(exam)); navigate(href('exam', exam.id)); }
    else {
      const seed = (Date.now() ^ (Math.random() * 1e9)) >>> 0;
      progress.saveSession({ examId: 'custom', title: a.title, startedAt: Date.now(), deadline: 0, seed, questionIds: shuffled(a.questionIds, seed), answers: {}, flagged: [], index: 0 });
      navigate(href('exam', 'custom'));
    }
  };
  const list = a.questionIds.map((id, i) => ({ q: questionById(id), i })).filter((x) => x.q && (!onlyWrong || (a.scores[x.q.id] ?? 0) < 1));
  return (
    <div className="exam-shell">
      <div className="eyebrow">{t('exam.results')}</div>
      <h1>{title}</h1>
      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="panel panel-pad">
          <div className="small muted">{t('exam.score')}</div>
          <div className="score-big" style={{ color: pct >= 70 ? 'var(--ok)' : pct >= 50 ? 'var(--warn)' : 'var(--bad)' }}>{pct}%</div>
          <div className="muted">{a.points} / {a.total} · {pct >= 70 ? t('exam.passed') : t('exam.failed')}</div>
          <div className="small muted" style={{ marginTop: 6 }}>{t('exam.duration')}: {fmt(a.finishedAt - a.startedAt)}</div>
          <div className="btn-row" style={{ marginTop: 14 }}>
            <button className="btn primary" onClick={retake}><Icon name="reset" size={16} /> {t('exam.retake')}</button>
            <a className="btn" href={href('exams')}>{t('exam.back')}</a>
          </div>
        </div>
        <div className="panel panel-pad">
          <h3 style={{ marginBottom: 8 }}>{t('exam.byTopic')}</h3>
          {Object.entries(byTopic).map(([topic, v]) => {
            const p = Math.round((v.got / v.n) * 100);
            const l = lessonById(topic);
            return (
              <div className="topic-row" key={topic}>
                <a href={href('lesson', topic)}>{l ? L(l.title) : topic}</a>
                <div className="bar"><span style={{ width: p + '%', background: p >= 70 ? 'var(--ok)' : p >= 50 ? 'var(--warn)' : 'var(--bad)' }} /></div>
                <span className="mono small">{p}%</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="qnav" style={{ margin: '24px 0 12px' }}>
        {a.questionIds.map((id, i) => {
          const sc = a.scores[id] ?? 0;
          return <a key={id} href={'#rq-' + i} onClick={(e) => { e.preventDefault(); document.getElementById('rq-' + i)?.scrollIntoView({ behavior: 'smooth' }); }}><button tabIndex={-1} className={sc === 1 ? 'right' : sc > 0 ? 'partial' : 'wrong'}>{i + 1}</button></a>;
        })}
      </div>
      <div className="btn-row" style={{ justifyContent: 'space-between', margin: '20px 0 10px' }}>
        <h2>{t('exam.review')}</h2>
        <label className="inline"><input type="checkbox" checked={onlyWrong} onChange={(e) => setOnlyWrong(e.target.checked)} /> {t('exam.onlyWrong')}</label>
      </div>
      {list.map(({ q, i }) => (
        <div id={'rq-' + i} key={q!.id} style={{ marginBottom: 14 }}>
          <QuestionView q={q!} index={i} answer={a.answers[q!.id]} onChange={() => {}} mode="review" />
        </div>
      ))}
    </div>
  );
}

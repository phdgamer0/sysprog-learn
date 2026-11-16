import { useEffect } from 'react';
import { Layout } from './components/Layout';
import { useI18n } from './i18n';
import { lessonById } from './content/lessons';
import { useRoute } from './lib/router';
import { ExamRun, ExamsPage, ResultPage } from './pages/ExamPages';
import { Glossary } from './pages/Glossary';
import { Home } from './pages/Home';
import { Lab } from './pages/Lab';
import { LessonPage } from './pages/LessonPage';
import { NotFound } from './pages/NotFound';
import { ProgressPage } from './pages/ProgressPage';

export function App() {
  const { path, query } = useRoute();
  const { t, L } = useI18n();
  const [page, arg] = path;

  useEffect(() => {
    const l = page === 'lesson' && arg ? lessonById(arg) : undefined;
    const names: Record<string, string> = { lab: t('nav.lab'), exams: t('nav.exams'), exam: t('nav.exams'), result: t('exam.results'), progress: t('nav.progress'), glossary: t('nav.glossary') };
    const sub = l ? L(l.title) : names[page ?? ''];
    document.title = sub ? `${sub} · ${t('app.name')}` : `${t('app.name')} — ${t('app.tagline')}`;
  }, [page, arg, t, L]);
  useEffect(() => { if (page !== 'lesson') window.scrollTo(0, 0); }, [page, arg]);

  let content;
  switch (page) {
    case undefined: content = <Home />; break;
    case 'lesson': content = arg ? <LessonPage key={arg} id={arg} section={query.get('s')} /> : <NotFound />; break;
    case 'lab': content = <Lab query={query} />; break;
    case 'exams': content = <ExamsPage />; break;
    case 'exam': content = arg ? <ExamRun key={arg} id={arg} /> : <NotFound />; break;
    case 'result': content = arg ? <ResultPage attemptId={arg} /> : <NotFound />; break;
    case 'progress': content = <ProgressPage />; break;
    case 'glossary': content = <Glossary query={query} />; break;
    default: content = <NotFound />;
  }
  return <Layout>{content}</Layout>;
}

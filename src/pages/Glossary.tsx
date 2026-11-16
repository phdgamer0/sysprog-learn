import { useState } from 'react';
import { Inline } from '../components/Markup';
import { GLOSSARY } from '../content/glossary';
import { lessonById } from '../content/lessons';
import { useI18n } from '../i18n';
import { href } from '../lib/router';

export function Glossary({ query }: { query: URLSearchParams }) {
  const { t, L, lang } = useI18n();
  const [f, setF] = useState(query.get('q') ?? '');
  const fold = (s: string) => s.toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i');
  const items = GLOSSARY.filter((g) => !f || fold(`${g.tr} ${g.en} ${L(g.def)}`).includes(fold(f)))
    .sort((a, b) => (lang === 'tr' ? a.tr.localeCompare(b.tr, 'tr') : a.en.localeCompare(b.en, 'en')));
  return (
    <div className="page-narrow">
      <h1>{t('glossary.title')}</h1>
      <p className="lead">{t('glossary.lead')}</p>
      <input type="search" value={f} onChange={(e) => setF(e.target.value)} placeholder={t('glossary.filter')} aria-label={t('glossary.filter')} style={{ width: '100%', margin: '12px 0 16px' }} />
      <dl className="defs">
        {items.map((g) => {
          const l = g.lesson ? lessonById(g.lesson) : undefined;
          return (
            <div key={g.tr + g.en}>
              <dt>{lang === 'tr' ? g.tr : g.en}<div className="small muted" style={{ fontWeight: 400 }}>{lang === 'tr' ? g.en : g.tr}</div></dt>
              <dd><Inline text={L(g.def)} />{l && <> <a className="small" href={href('lesson', l.id)}>→ {L(l.title)}</a></>}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

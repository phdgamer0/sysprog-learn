import { useState } from 'react';
import { useI18n } from '../i18n';
import { highlightC, highlightShell, type Tok } from './highlight';
import { Icon } from './Icon';

export function CodeBlock({ code, lang = 'c', title, lines = true, highlight = [] }: { code: string; lang?: 'c' | 'shell' | 'text'; title?: string; lines?: boolean; highlight?: number[] }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const src = code.replace(/\n+$/, '');
  const toks: Tok[][] = lang === 'c' ? highlightC(src) : lang === 'shell' ? highlightShell(src) : src.split('\n').map((l) => [{ t: l }]);
  const showLines = lines && lang === 'c' && toks.length > 3;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(src);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard blocked */ }
  };
  return (
    <div className={'code' + (showLines ? '' : ' nolines')}>
      <div className="code-head">
        <span>{title ?? (lang === 'c' ? 'C' : lang === 'shell' ? 'shell' : '')}</span>
        <button className="btn ghost small" onClick={copy} aria-label={t('lesson.copy')}>
          <Icon name={copied ? 'check' : 'copy'} size={14} /> {copied ? t('lesson.copied') : t('lesson.copy')}
        </button>
      </div>
      <pre tabIndex={0}>
        <code>
          {toks.map((line, i) => (
            <span key={i} className={'ln' + (highlight.includes(i + 1) ? ' hl' : '')} data-n={i + 1}>
              {line.map((tk, j) => (tk.c ? <span key={j} className={tk.c}>{tk.t}</span> : tk.t))}
              {'\n'}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

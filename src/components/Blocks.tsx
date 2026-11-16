import type { Block, CodeText } from '../content/types';
import { DiagramView } from '../diagrams';
import { useI18n } from '../i18n';
import { InteractiveView } from '../interactives';
import { CodeBlock } from './CodeBlock';
import { Icon, type IconName } from './Icon';
import { Inline, Paras } from './Markup';

export type ViewMode = 'all' | 'static' | 'interactive';

const CALLOUT_ICON: Record<string, IconName> = { note: 'info', tip: 'bulb', warning: 'warn', important: 'warn', source: 'book' };

/** Which blocks are shown in each view mode. */
export function visibleIn(b: Block, mode: ViewMode): boolean {
  if (mode === 'all') return true;
  if (mode === 'static') return b.type !== 'interactive';
  return b.type === 'interactive' || b.type === 'diagram' || b.type === 'h3' || (b.type === 'callout' && (b.variant === 'important' || b.variant === 'tip'));
}

export function BlockList({ blocks, mode }: { blocks: Block[]; mode: ViewMode }) {
  const { t } = useI18n();
  const shown = blocks.filter((b) => visibleIn(b, mode));
  const hiddenInteractive = mode === 'static' && blocks.some((b) => b.type === 'interactive');
  if (mode === 'interactive' && !shown.some((b) => b.type === 'interactive' || b.type === 'diagram')) {
    return <p className="hidden-note">{t('lesson.interactiveOnlyEmpty')}</p>;
  }
  return (
    <div className="prose">
      {shown.map((b, i) => <BlockView key={i} b={b} />)}
      {hiddenInteractive && <p className="hidden-note">{t('lesson.staticOnlyHidden')}</p>}
    </div>
  );
}

function codeOf(c: CodeText, L: (x: CodeText) => string) { return L(c); }

export function BlockView({ b }: { b: Block }) {
  const { t, L } = useI18n();
  switch (b.type) {
    case 'h3': return <h3><Inline text={L(b.text)} /></h3>;
    case 'p': return <Paras text={L(b.text)} />;
    case 'list': {
      const items = b.items.map((x, i) => <li key={i}><Inline text={L(x)} /></li>);
      return b.ordered ? <ol>{items}</ol> : <ul>{items}</ul>;
    }
    case 'code':
      return (
        <figure className="block figure">
          <CodeBlock code={codeOf(b.code, L)} lang={b.lang ?? 'c'} title={b.title ? L(b.title) : undefined} />
          {b.caption && <figcaption><Inline text={L(b.caption)} /></figcaption>}
        </figure>
      );
    case 'output':
      return (
        <figure className="block figure">
          <pre className="term">{b.caption && <span className="cap">{L(b.caption)}</span>}{b.text}</pre>
        </figure>
      );
    case 'callout':
      return (
        <aside className={'block callout ' + b.variant}>
          <div className="ct"><Icon name={CALLOUT_ICON[b.variant]} size={16} /> {b.title ? <Inline text={L(b.title)} /> : t(`callout.${b.variant}` as 'callout.note')}</div>
          <Paras text={L(b.text)} />
        </aside>
      );
    case 'table':
      return (
        <figure className="block figure">
          <div className="table-wrap">
            <table className="data">
              <thead><tr>{b.head.map((h, i) => <th key={i} scope="col"><Inline text={L(h)} /></th>)}</tr></thead>
              <tbody>{b.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}><Inline text={L(c)} /></td>)}</tr>)}</tbody>
            </table>
          </div>
          {b.caption && <figcaption><Inline text={L(b.caption)} /></figcaption>}
        </figure>
      );
    case 'definitions':
      return (
        <dl className="block defs">
          {b.items.map((d, i) => (
            <div key={i}><dt><Inline text={L(d.term)} /></dt><dd><Inline text={L(d.text)} /></dd></div>
          ))}
        </dl>
      );
    case 'steps':
      return (
        <ol className="block steps">
          {b.items.map((s, i) => (
            <li key={i}><div className="st-title"><Inline text={L(s.title)} /></div><div className="st-text"><Paras text={L(s.text)} /></div></li>
          ))}
        </ol>
      );
    case 'diagram':
      return (
        <figure className="block figure">
          <div className="diagram"><DiagramView id={b.id} /></div>
          {b.caption && <figcaption><Inline text={L(b.caption)} /></figcaption>}
        </figure>
      );
    case 'interactive':
      return (
        <figure className="block figure breakout">
          <InteractiveView id={b.id} props={b.props} />
          {b.caption && <figcaption><Inline text={L(b.caption)} /></figcaption>}
        </figure>
      );
  }
}

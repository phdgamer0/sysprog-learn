import { useMemo, useState } from 'react';
import type { Question } from '../content/types';
import { useI18n } from '../i18n';
import { countNodes, emptyAnswer, hashSeed, expectedTree, grade, isAnswered, scramble, type Answer } from '../lib/grading';
import { progress } from '../lib/progress';
import { href } from '../lib/router';
import type { TreeNode } from '../sim/explore';
import { CodeBlock } from './CodeBlock';
import { Icon } from './Icon';
import { Inline, Paras } from './Markup';
import { TreeSvg, type VNode } from './TreeSvg';

type Mode = 'practice' | 'exam' | 'review';


/** Self-contained practice question (keeps its own answer state and records the result). */
export function PracticeQuestion({ q, index }: { q: Question; index?: number }) {
  const { t } = useI18n();
  const [answer, setAnswer] = useState<Answer | undefined>(() => emptyAnswer(q));
  const [checked, setChecked] = useState(false);
  const check = () => {
    setChecked(true);
    progress.practice(q.id, grade(q, answer));
  };
  return (
    <QuestionView
      q={q}
      index={index}
      answer={answer}
      onChange={(a) => { setAnswer(a); }}
      mode={checked ? 'review' : 'practice'}
      footer={
        <div className="q-actions">
          {!checked ? (
            <>
              <button className="btn primary" onClick={check} disabled={!isAnswered(q, answer)}>{t('q.check')}</button>
            </>
          ) : (
            <button className="btn" onClick={() => { setChecked(false); setAnswer(emptyAnswer(q)); }}><Icon name="reset" size={16} /> {t('q.retry')}</button>
          )}
        </div>
      }
    />
  );
}

export function QuestionView({ q, index, answer, onChange, mode, footer, seed = 0 }: {
  q: Question;
  index?: number;
  answer: Answer | undefined;
  onChange: (a: Answer) => void;
  mode: Mode;
  footer?: React.ReactNode;
  seed?: number;
}) {
  const { t, L } = useI18n();
  const locked = mode === 'review';
  const score = locked ? grade(q, answer) : 0;
  const name = `q-${q.id}`;

  return (
    <section className="q" aria-labelledby={name + '-p'}>
      <div className="q-head">
        {index !== undefined && <span className="chip">#{index + 1}</span>}
        <span className="chip">{t(`q.kind.${q.kind}` as 'q.kind.mcq')}</span>
        <span className={'chip ' + (q.difficulty === 3 ? 'bad' : q.difficulty === 2 ? 'warn' : 'ok')}>{t(`q.diff.${q.difficulty}` as 'q.diff.1')}</span>
      </div>
      <div className="q-prompt" id={name + '-p'}><Paras text={L(q.prompt)} /></div>
      {q.code && (
        <>
          <CodeBlock code={q.code} lang={/^\s*[%$]/.test(q.code) ? 'shell' : 'c'} />
          {/\bfork\s*\(/.test(q.code) && q.kind !== 'tree' && locked && (
            <a className="btn small ghost" href={href('lab') + '?code=' + encodeURIComponent(q.code)} style={{ marginBottom: 8 }}>
              <Icon name="flask" size={15} /> {t('q.runInLab')}
            </a>
          )}
        </>
      )}
      <Body q={q} answer={answer} onChange={onChange} locked={locked} name={name} seed={seed} />
      {locked && <Feedback q={q} answer={answer} score={score} />}
      {footer}
    </section>
  );
}

function Body({ q, answer, onChange, locked, name, seed }: { q: Question; answer: Answer | undefined; onChange: (a: Answer) => void; locked: boolean; name: string; seed: number }) {
  const { t, L } = useI18n();
  switch (q.kind) {
    case 'mcq': {
      const v = answer?.kind === 'mcq' ? answer.v : -1;
      return (
        <div className="opts" role="radiogroup">
          {q.options.map((o, i) => {
            const cls = locked ? (i === q.answer ? ' right' : i === v ? ' wrong' : '') : i === v ? ' sel' : '';
            return (
              <label key={i} className={'opt' + cls + (locked ? ' locked' : '')}>
                <input type="radio" name={name} checked={v === i} disabled={locked} onChange={() => onChange({ kind: 'mcq', v: i })} />
                <span>
                  <Inline text={L(o)} />
                  {locked && q.optionNotes && (i === v || i === q.answer) && <span className="note"><Inline text={L(q.optionNotes[i])} /></span>}
                </span>
              </label>
            );
          })}
        </div>
      );
    }
    case 'multi': {
      const v = answer?.kind === 'multi' ? answer.v : [];
      return (
        <>
          <p className="muted small">{t('q.selectAll')}</p>
          <div className="opts">
            {q.options.map((o, i) => {
              const on = v.includes(i);
              const right = q.answers.includes(i);
              const cls = locked ? (right ? ' right' : on ? ' wrong' : '') : on ? ' sel' : '';
              return (
                <label key={i} className={'opt' + cls + (locked ? ' locked' : '')}>
                  <input type="checkbox" checked={on} disabled={locked} onChange={() => onChange({ kind: 'multi', v: on ? v.filter((x) => x !== i) : [...v, i].sort() })} />
                  <span><Inline text={L(o)} /></span>
                </label>
              );
            })}
          </div>
        </>
      );
    }
    case 'tf': {
      const v = answer?.kind === 'tf' ? answer.v : undefined;
      return (
        <div className="opts" role="radiogroup" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {[true, false].map((b) => {
            const cls = locked ? (b === q.answer ? ' right' : b === v ? ' wrong' : '') : b === v ? ' sel' : '';
            return (
              <label key={String(b)} className={'opt' + cls + (locked ? ' locked' : '')}>
                <input type="radio" name={name} checked={v === b} disabled={locked} onChange={() => onChange({ kind: 'tf', v: b })} />
                <span>{b ? t('q.true') : t('q.false')}</span>
              </label>
            );
          })}
        </div>
      );
    }
    case 'numeric':
    case 'short': {
      const v = answer && (answer.kind === 'numeric' || answer.kind === 'short') ? answer.v : '';
      return (
        <input
          type="text"
          inputMode={q.kind === 'numeric' ? 'numeric' : 'text'}
          className={q.kind === 'numeric' ? 'num-input' : ''}
          style={q.kind === 'short' ? { width: 'min(100%, 420px)', fontFamily: 'var(--font-mono)' } : undefined}
          value={v}
          disabled={locked}
          placeholder={q.kind === 'numeric' ? t('q.typeNumber') : t('q.typeAnswer')}
          aria-label={q.kind === 'numeric' ? t('q.typeNumber') : t('q.typeAnswer')}
          onChange={(e) => onChange({ kind: q.kind, v: e.target.value } as Answer)}
        />
      );
    }
    case 'fill': {
      const v = answer?.kind === 'fill' ? answer.v : q.blanks.map(() => '');
      const parts = L(q.template).split(/(\{\d+\})/);
      return (
        <div className="fill-text">
          {parts.map((p, i) => {
            const m = /^\{(\d+)\}$/.exec(p);
            if (!m) return <Inline key={i} text={p} />;
            const b = Number(m[1]);
            const ok = locked && q.blanks[b].some((x) => x.trim().toLowerCase() === (v[b] ?? '').trim().toLowerCase());
            return (
              <input
                key={i}
                type="text"
                value={v[b] ?? ''}
                disabled={locked}
                aria-label={t('q.blank', { n: b + 1 })}
                className={locked ? (ok ? 'right' : 'wrong') : ''}
                onChange={(e) => { const nv = v.slice(); nv[b] = e.target.value; onChange({ kind: 'fill', v: nv }); }}
              />
            );
          })}
        </div>
      );
    }
    case 'match': {
      const v = answer?.kind === 'match' ? answer.v : q.left.map(() => -1);
      return (
        <div>
          {q.left.map((l, i) => (
            <div className="match-row" key={i}>
              <div><Inline text={L(l)} /></div>
              <select
                value={v[i]}
                disabled={locked}
                aria-label={L(l)}
                className={locked ? (v[i] === q.pairs[i] ? 'right' : 'wrong') : ''}
                onChange={(e) => { const nv = v.slice(); nv[i] = Number(e.target.value); onChange({ kind: 'match', v: nv }); }}
              >
                <option value={-1}>{t('q.matchPick')}</option>
                {q.right.map((r, j) => <option key={j} value={j}>{L(r).replace(/`/g, '')}</option>)}
              </select>
            </div>
          ))}
        </div>
      );
    }
    case 'order':
      return <OrderBody q={q} answer={answer} onChange={onChange} locked={locked} seed={seed} />;
    case 'tree':
      return <TreeBody q={q} answer={answer} onChange={onChange} locked={locked} />;
  }
}

function OrderBody({ q, answer, onChange, locked, seed }: { q: Extract<Question, { kind: 'order' }>; answer: Answer | undefined; onChange: (a: Answer) => void; locked: boolean; seed: number }) {
  const { t, L } = useI18n();
  const initial = useMemo(() => scramble(q.items.length, hashSeed(q.id) + seed), [q.id, q.items.length, seed]);
  const v = answer?.kind === 'order' ? answer.v : initial;
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= v.length) return;
    const nv = v.slice();
    [nv[i], nv[j]] = [nv[j], nv[i]];
    onChange({ kind: 'order', v: nv });
  };
  return (
    <>
      {!locked && <p className="muted small">{t('q.orderHint')}</p>}
      <ol className="order-list">
        {v.map((idx, i) => (
          <li key={idx} className={locked ? (idx === i ? 'right' : 'wrong') : ''}>
            <span className="pos">{i + 1}.</span>
            <span className="txt"><Inline text={L(q.items[idx])} /></span>
            {!locked && (
              <>
                <button className="btn ghost icon small" onClick={() => move(i, -1)} disabled={i === 0} aria-label={t('q.moveUp')}><Icon name="up" size={16} /></button>
                <button className="btn ghost icon small" onClick={() => move(i, 1)} disabled={i === v.length - 1} aria-label={t('q.moveDown')}><Icon name="down" size={16} /></button>
              </>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}

// ── process-tree builder ──
function updateAt(t: TreeNode, path: number[], f: (n: TreeNode) => TreeNode | null): TreeNode {
  if (!path.length) return f(t) ?? t;
  const [h, ...rest] = path;
  const children = t.children.slice();
  if (!rest.length) {
    const r = f(children[h]);
    if (r === null) children.splice(h, 1);
    else children[h] = r;
  } else children[h] = updateAt(children[h], rest, f);
  return { children };
}

function TreeBody({ q, answer, onChange, locked }: { q: Question; answer: Answer | undefined; onChange: (a: Answer) => void; locked: boolean }) {
  const { t } = useI18n();
  const tree: TreeNode = answer?.kind === 'tree' ? answer.v : { children: [] };
  const n = countNodes(tree);
  let counter = 0;
  const render = (node: TreeNode, path: number[]): React.ReactNode => {
    const label = 'P' + counter++;
    return (
      <div className={path.length ? 'tb-node' : 'tb-root'} key={path.join('.')}>
        <div className="tb-row">
          <span className="tb-dot">{label}</span>
          {!locked && (
            <>
              <button className="btn ghost small" onClick={() => onChange({ kind: 'tree', v: updateAt(tree, path, (x) => ({ children: [...x.children, { children: [] }] })) })} disabled={n >= 40} aria-label={`${t('q.addChild')} ${label}`}>
                <Icon name="plus" size={14} /> {t('q.addChild')}
              </button>
              {path.length > 0 && (
                <button className="btn ghost small danger" onClick={() => onChange({ kind: 'tree', v: updateAt(tree, path, () => null) })} aria-label={`${t('q.remove')} ${label}`}>
                  <Icon name="minus" size={14} />
                </button>
              )}
            </>
          )}
        </div>
        {node.children.map((c, i) => render(c, [...path, i]))}
      </div>
    );
  };
  const toV = (node: TreeNode, key: string): VNode => ({ key, label: key === 'r' ? 'P0' : '•', children: node.children.map((c, i) => toV(c, key + i)) });
  return (
    <div className="stack">
      <p className="muted small">{t('q.treeHint')}</p>
      <div className="grid-2">
        <div className="tree-builder">{render(tree, [])}</div>
        <div className="tree-wrap panel panel-pad">
          <div className="muted small">{t('q.processes', { n })}</div>
          <TreeSvg root={toV(tree, 'r')} nodeW={40} nodeH={28} gapX={10} gapY={26} />
        </div>
      </div>
      {locked && q.code && (
        <div className="panel panel-pad tree-wrap">
          <div className="muted small">{t('q.expectedTree')} — {t('q.processes', { n: countNodes(expectedTree(q.code)) })}</div>
          <TreeSvg root={toV(expectedTree(q.code), 'r')} nodeW={40} nodeH={28} gapX={10} gapY={26} />
        </div>
      )}
    </div>
  );
}

function Feedback({ q, answer, score }: { q: Question; answer: Answer | undefined; score: number }) {
  const { t, L } = useI18n();
  const verdict = !answer ? t('q.unanswered') : score === 1 ? t('q.correct') : score > 0 ? t('q.partial') : t('q.incorrect');
  const cls = score === 1 ? 'ok' : score > 0 ? 'partial' : 'bad';
  let correct: string | null = null;
  switch (q.kind) {
    case 'numeric': correct = String(q.answer); break;
    case 'short': correct = q.accept[0]; break;
    case 'fill': correct = q.blanks.map((b) => b[0]).join(' · '); break;
    case 'match': correct = q.left.map((l, i) => `${L(l)} → ${L(q.right[q.pairs[i]])}`).join('\n'); break;
    case 'order': correct = q.items.map((x, i) => `${i + 1}. ${L(x)}`).join('\n'); break;
    case 'tf': correct = q.answer ? t('q.true') : t('q.false'); break;
  }
  return (
    <div className={'q-feedback ' + (score === 1 ? 'ok' : 'bad')} role="status">
      <div className={'verdict ' + cls}>{verdict}{score > 0 && score < 1 ? ` (${Math.round(score * 100)}%)` : ''}</div>
      {correct !== null && score < 1 && (
        <div style={{ marginBottom: 8 }}>
          <strong>{t('q.correctAnswer')}:</strong>{' '}
          {correct.includes('\n') ? <div style={{ whiteSpace: 'pre-line' }}><Inline text={correct} /></div> : <Inline text={correct} />}
        </div>
      )}
      <div><strong>{t('q.explanation')}:</strong></div>
      <Paras text={L(q.explanation)} />
    </div>
  );
}

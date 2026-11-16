import { useEffect, useMemo, useRef, useState } from 'react';
import { highlightC } from '../components/highlight';
import { Icon } from '../components/Icon';
import { TreeSvg, type VNode } from '../components/TreeSvg';
import { useI18n } from '../i18n';
import { compile } from '../sim/compile';
import { exploreOutputs, lineTally, type ExploreResult } from '../sim/explore';
import {
  autoStep, createMachine, isAlive, isFinished, nextLine, runToEnd, step,
  type BufferMode, type Machine, type Policy, type Proc, type SimEvent,
} from '../sim/machine';
import { CError } from '../sim/parse';
import { PRESETS, type PresetId } from '../sim/presets';

const color = (i: number) => `var(--p${i % 8})`;
const MAX_HISTORY = 2000;

interface Props { preset?: PresetId; code?: string; full?: boolean }

export function ForkSim({ preset, code, full = false }: Props) {
  const { t, L } = useI18n();
  const [presetId, setPresetId] = useState<PresetId | 'custom'>(code ? 'custom' : preset ?? 'slide-ab');
  const [source, setSource] = useState<string>(code ?? PRESETS[preset ?? 'slide-ab'].code);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(source);
  const [policy, setPolicy] = useState<Policy>('rr');
  const [bufferMode, setBufferMode] = useState<BufferMode>('line');
  const [failFork, setFailFork] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [explore, setExplore] = useState<ExploreResult | null>(null);
  const [exploring, setExploring] = useState(false);

  const compiled = useMemo(() => {
    try { return { prog: compile(source) }; }
    catch (e) { if (e instanceof CError) return { error: { msg: e.message, line: e.line } }; throw e; }
  }, [source]);

  const fresh = () => (compiled.prog ? createMachine(compiled.prog, { bufferMode, failFork }) : null);
  const [history, setHistory] = useState<Machine[]>(() => { const m = fresh(); return m ? [m] : []; });
  useEffect(() => { const m = fresh(); setHistory(m ? [m] : []); setPlaying(false); setExplore(null); }, [compiled, bufferMode, failFork]); // eslint-disable-line react-hooks/exhaustive-deps
  const m = history[history.length - 1];
  const done = m ? isFinished(m) : true;

  const push = (n: Machine) => { if (n !== m) setHistory((h) => [...h.slice(-MAX_HISTORY), n]); };
  const stepPid = (pid: number) => m && push(step(m, pid));
  const stepAuto = () => m && push(autoStep(m, policy));

  // play loop
  const playRef = useRef(playing);
  playRef.current = playing;
  useEffect(() => {
    if (!playing || !m) return;
    if (done) { setPlaying(false); return; }
    const id = setTimeout(() => { if (playRef.current) push(autoStep(m, policy)); }, [900, 450, 180, 60][speed]);
    return () => clearTimeout(id);
  }, [playing, m, speed, policy, done]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPreset = (id: PresetId) => { setPresetId(id); setSource(PRESETS[id].code); setDraft(PRESETS[id].code); setEditing(false); };
  const apply = () => { setSource(draft); setPresetId('custom'); setEditing(false); };
  const runExplore = () => {
    setExploring(true);
    setTimeout(() => {
      try { setExplore(exploreOutputs(source, { bufferMode, failFork })); } finally { setExploring(false); }
    }, 20);
  };

  const procIndex = new Map<number, number>((m?.procs ?? []).map((p, i) => [p.pid, i]));
  const lines = useMemo(() => highlightC(source.replace(/\n+$/, '')), [source]);

  // markers: which processes will execute which line next
  const markers = new Map<number, Proc[]>();
  m?.procs.filter((p) => isAlive(p)).forEach((p) => {
    const ln = nextLine(m, p);
    markers.set(ln, [...(markers.get(ln) ?? []), p]);
  });
  const curLine = m && m.current !== null ? m.procs.find((p) => p.pid === m.current)?.lastLine : undefined;

  const stateLabel = (p: Proc) => t(`sim.state.${p.state}` as 'sim.state.ready');
  const evText = (e: SimEvent): string => {
    switch (e.k) {
      case 'start': return t('sim.ev.start', { pid: e.pid });
      case 'fork': return t('sim.ev.fork', { pid: e.pid, child: e.child });
      case 'forkfail': return t('sim.ev.forkfail', { pid: e.pid });
      case 'exit': return t(e.zombie ? 'sim.ev.exitZ' : 'sim.ev.exit', { pid: e.pid, code: e.code });
      case 'reap': return e.byInit ? t('sim.ev.reapInit', { child: e.child }) : m && e.pid === m.opts.basePid - 1 ? t('sim.ev.reapShell', { child: e.child }) : t('sim.ev.reap', { pid: e.pid, child: e.child });
      case 'orphan': return t('sim.ev.orphan', { pid: e.pid });
      case 'block': return t('sim.ev.block', { pid: e.pid });
      case 'wake': return t('sim.ev.wake', { pid: e.pid });
      case 'sleep': return t('sim.ev.sleep', { pid: e.pid, secs: e.secs });
      case 'waitnone': return t('sim.ev.waitnone', { pid: e.pid });
    }
  };

  const tree: VNode | null = useMemo(() => {
    if (!m) return null;
    const build = (p: Proc): VNode => ({
      key: String(p.pid),
      label: String(p.pid),
      sub: stateLabel(p) + (p.orphaned && isAlive(p) ? ' · PPID 1' : ''),
      color: color(procIndex.get(p.pid) ?? 0),
      faded: p.state === 'terminated',
      dashed: p.orphaned,
      active: m.current === p.pid,
      onClick: p.state === 'ready' && !m.error ? () => stepPid(p.pid) : undefined,
      children: m.procs.filter((c) => c.creator === p.pid && c.pid !== p.pid).map(build),
    });
    return build(m.procs[0]);
  }, [m, t]); // eslint-disable-line react-hooks/exhaustive-deps

  const tally = explore?.outputs[0] !== undefined ? lineTally(explore.outputs[0]) : null;
  const tallyInvariant = !!explore && !!tally && explore.outputs.every((o) => JSON.stringify(lineTally(o)) === JSON.stringify(tally));
  const errLine = compiled.error?.line ?? m?.error?.line;
  const presetNote = presetId !== 'custom' ? L(PRESETS[presetId].note) : null;

  return (
    <div className="sim">
      <div className="sim-bar">
        <label className="inline">
          <span className="sr-only">{t('sim.presets')}</span>
          <select value={presetId} onChange={(e) => e.target.value !== 'custom' && loadPreset(e.target.value as PresetId)} aria-label={t('sim.presets')} style={{ maxWidth: 260 }}>
            {presetId === 'custom' && <option value="custom">— {t('sim.code')} —</option>}
            {(Object.keys(PRESETS) as PresetId[]).map((id) => <option key={id} value={id}>{L(PRESETS[id].title)}</option>)}
          </select>
        </label>
        <button className="btn small" onClick={() => { setDraft(source); setEditing((e) => !e); }} aria-expanded={editing}><Icon name="edit" size={15} /> {t('sim.edit')}</button>
        <span className="grow" />
        <label className="inline">{t('sim.scheduler')}
          <select value={policy} onChange={(e) => setPolicy(e.target.value as Policy)}>
            {(['rr', 'random', 'parent', 'child'] as Policy[]).map((p) => <option key={p} value={p}>{t(`sim.policy.${p}` as 'sim.policy.rr')}</option>)}
          </select>
        </label>
        {full && (
          <>
            <label className="inline">{t('sim.buffer')}
              <select value={bufferMode} onChange={(e) => setBufferMode(e.target.value as BufferMode)}>
                <option value="line">{t('sim.buffer.line')}</option>
                <option value="full">{t('sim.buffer.full')}</option>
              </select>
            </label>
            <label className="inline"><input type="checkbox" checked={failFork} onChange={(e) => setFailFork(e.target.checked)} /> {t('sim.failFork')}</label>
          </>
        )}
        {!full && presetId === 'buffering' && (
          <label className="inline">{t('sim.buffer')}
            <select value={bufferMode} onChange={(e) => setBufferMode(e.target.value as BufferMode)}>
              <option value="line">{t('sim.buffer.line')}</option>
              <option value="full">{t('sim.buffer.full')}</option>
            </select>
          </label>
        )}
      </div>
      {presetNote && <div className="sim-msg small" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-2)' }}>{presetNote}</div>}
      {editing && (
        <div className="sim-pane" style={{ borderTop: 0, borderBottom: '1px solid var(--border)' }}>
          <textarea rows={Math.min(22, Math.max(8, draft.split('\n').length + 1))} value={draft} onChange={(e) => setDraft(e.target.value)} spellCheck={false} aria-label={t('sim.code')} />
          <div className="btn-row" style={{ marginTop: 8 }}>
            <button className="btn primary small" onClick={apply}>{t('sim.load')}</button>
            <span className="muted small">{t('sim.supported')}</span>
          </div>
        </div>
      )}
      <div className="sim-bar" style={{ background: 'var(--surface)' }} role="toolbar" aria-label="simulation controls">
        <button className="btn small" onClick={() => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h))} disabled={history.length <= 1} title={t('sim.back')}><Icon name="back" size={14} /> <span>{t('sim.back')}</span></button>
        <button className="btn small primary" onClick={stepAuto} disabled={!m || done} title={t('sim.stepHint')}><Icon name="step" size={14} /> {t('sim.step')}</button>
        <button className="btn small" onClick={() => setPlaying((p) => !p)} disabled={!m || done}><Icon name={playing ? 'pause' : 'play'} size={14} /> {playing ? t('sim.pause') : t('sim.play')}</button>
        <button className="btn small" onClick={() => m && push(runToEnd(m, policy))} disabled={!m || done}><Icon name="fast" size={14} /> {t('sim.run')}</button>
        <button className="btn small ghost" onClick={() => { const f = fresh(); if (f) setHistory([f]); setPlaying(false); }}><Icon name="reset" size={14} /> {t('sim.reset')}</button>
        <span className="grow" />
        <label className="inline small">{t('sim.speed')}
          <input type="range" min={0} max={3} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} style={{ width: 80 }} />
        </label>
        <span className="chip mono">{t('sim.step.n', { n: history.length - 1 })}</span>
      </div>
      {compiled.error && <div className="sim-msg err" role="alert">{t('sim.error')}: {t('sim.compileError', { line: compiled.error.line, msg: compiled.error.msg })}</div>}
      {m?.error && <div className="sim-msg err" role="alert">{t('sim.error')} (PID {m.error.pid}): {m.error.line ? t('sim.compileError', { line: m.error.line, msg: m.error.msg }) : m.error.msg}</div>}
      {m && done && !m.error && <div className="sim-msg done" role="status">{t('sim.finished')}</div>}

      <div className="sim-grid">
        <div className="sim-col">
          <div className="sim-pane">
            <h4>{t('sim.code')}</h4>
            <div className="sim-code" tabIndex={0}>
              {lines.map((toks, i) => {
                const ln = i + 1;
                const ps = markers.get(ln) ?? [];
                return (
                  <div key={i} className={'sim-line' + (ln === errLine ? ' err' : ln === curLine ? ' cur' : '')}>
                    <span className="gut">
                      {ps.slice(0, 5).map((p) => (
                        <button
                          key={p.pid}
                          className="pmark"
                          style={{ background: color(procIndex.get(p.pid) ?? 0), opacity: p.state === 'ready' ? 1 : 0.4 }}
                          title={`PID ${p.pid} (${stateLabel(p)})`}
                          aria-label={`${t('sim.stepThis')} ${p.pid}`}
                          disabled={p.state !== 'ready' || !!m?.error}
                          onClick={() => stepPid(p.pid)}
                        />
                      ))}
                    </span>
                    <span className="n">{ln}</span>
                    <span>{toks.map((tk, j) => (tk.c ? <span key={j} className={tk.c}>{tk.t}</span> : tk.t))}</span>
                  </div>
                );
              })}
            </div>
            <p className="muted small" style={{ marginTop: 8, marginBottom: 0 }}>{t('sim.help')}</p>
          </div>
          <div className="sim-pane">
            <h4>{t('sim.output')} <span className="muted" style={{ textTransform: 'none', letterSpacing: 0 }}>stdout / stderr</span></h4>
            <div className="out" aria-live="polite">
              {!m || m.out.length === 0 ? <span style={{ opacity: 0.6 }}>{t('sim.noOutput')}</span> : m.out.map((c, i) => (
                c.text.replace(/\n$/, '').split('\n').map((line, j) => (
                  <div key={i + '.' + j} className={'o-line' + (c.err ? ' err' : '')}>
                    <span className="o-pid" style={{ color: color(procIndex.get(c.pid) ?? 0) }}>{c.pid}</span>
                    <span>{line}</span>
                  </div>
                ))
              ))}
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-pane">
            <h4>{t('sim.processes')} <span className="chip">{m?.procs.filter(isAlive).length ?? 0} / {m?.procs.length ?? 0}</span></h4>
            <div className="procs">
              {m?.procs.map((p, i) => {
                const vars = Object.entries(p.vars).filter(([k]) => k !== 'argv' && k !== 'errno');
                return (
                  <button
                    key={p.pid}
                    className={'proc' + (m.current === p.pid ? ' current' : '')}
                    style={{ ['--pc' as string]: color(i) }}
                    disabled={p.state !== 'ready' || !!m.error}
                    onClick={() => stepPid(p.pid)}
                    aria-label={`${t('sim.stepThis')} ${p.pid}`}
                  >
                    <span className="top">
                      <span className="pid">{p.pid}</span>
                      <span className={'st ' + p.state}>{stateLabel(p)}</span>
                    </span>
                    <span className="muted">{t('sim.ppid')} {p.ppid}{p.orphaned ? ` (${t('sim.legend.orphan')})` : ''} · {t('sim.line')} {nextLine(m, p)}</span>
                    {p.lastFork !== undefined && <span className="vars">{t('sim.returned')}: <b>{p.lastFork}</b></span>}
                    {vars.length > 0 && <span className="vars">{vars.map(([k, v]) => `${k}=${v === null ? '?' : typeof v === 'object' ? '&' + v.ref : typeof v === 'string' ? JSON.stringify(v) : v}`).join('  ')}</span>}
                    {p.buf && <span className="vars" title={t('sim.buffered')}>buf: {JSON.stringify(p.buf)}</span>}
                    {p.exitCode !== undefined && <span className="vars">exit({p.exitCode})</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="sim-pane">
            <h4>{t('sim.tree')}</h4>
            <div className="tree-wrap">{tree && <TreeSvg root={tree} title={t('sim.tree')} />}</div>
          </div>
          <div className="sim-pane">
            <details>
              <summary className="small" style={{ cursor: 'pointer', fontWeight: 600 }}>{t('sim.events')} ({m?.events.length ?? 0})</summary>
              <ul className="events">
                {m?.events.slice().reverse().map((e, i) => <li key={i}><span className="tk">{e.tick}</span><span>{evText(e)}</span></li>)}
              </ul>
            </details>
          </div>
          <div className="sim-pane">
            <h4>{t('sim.allOutputs')} <button className="btn small" onClick={runExplore} disabled={!!compiled.error || exploring}>{exploring ? '…' : t('sim.compute')}</button></h4>
            {explore && (
              <div className="stack">
                <p className="small muted" style={{ margin: 0 }}>
                  {explore.exhaustive ? t('sim.outputsExhaustive', { n: explore.outputs.length, s: explore.statesVisited }) : t('sim.outputsSampled', { n: explore.outputs.length })}
                </p>
                {tally && tallyInvariant && Object.keys(tally).length > 0 && (
                  <div>
                    <div className="small" style={{ fontWeight: 600 }}>{t('sim.tally')}</div>
                    <div className="tally">{Object.entries(tally).map(([l, n]) => <span key={l}>{l} × {n}</span>)}</div>
                    <p className="small muted" style={{ margin: '4px 0 0' }}>{t('sim.tallyNote')}</p>
                  </div>
                )}
                <div className="outputs-list">
                  {explore.outputs.slice(0, 24).map((o, i) => <pre key={i}>{o || '∅'}</pre>)}
                </div>
                {explore.errors.length > 0 && <div className="sim-msg err">{explore.errors.join('; ')}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

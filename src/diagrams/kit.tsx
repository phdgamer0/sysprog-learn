import { createContext, useContext, useId, type ReactNode } from 'react';

const MarkerCtx = createContext('m');

/** SVG wrapper with responsive viewBox and arrowhead markers. */
export function Svg({ w, h, title, children, maxW }: { w: number; h: number; title: string; children: ReactNode; maxW?: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={title} style={{ maxWidth: maxW ?? w }}>
      <title>{title}</title>
      <defs>
        <marker id={`${id}-a`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--text-3)" />
        </marker>
        <marker id={`${id}-acc`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" />
        </marker>
        <marker id={`${id}-bad`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--bad)" />
        </marker>
      </defs>
      <MarkerCtx.Provider value={id}>{children}</MarkerCtx.Provider>
    </svg>
  );
}

type Tone = 'box' | 'box2' | 'acc' | 'warn' | 'bad' | 'ok' | 'info';

/** Multi-line text: lines split on \n. */
export function T({ x, y, children, cls = 'd-text', anchor = 'middle', lh = 15, weight }: { x: number; y: number; children: string; cls?: string; anchor?: 'start' | 'middle' | 'end'; lh?: number; weight?: number }) {
  const lines = children.split('\n');
  const y0 = y - ((lines.length - 1) * lh) / 2;
  return (
    <text x={x} y={y0} textAnchor={anchor} className={cls} dominantBaseline="middle" style={weight ? { fontWeight: weight } : undefined}>
      {lines.map((l, i) => <tspan key={i} x={x} dy={i === 0 ? 0 : lh}>{l}</tspan>)}
    </text>
  );
}

export function Box({ x, y, w, h, tone = 'box', label, sub, mono, rx = 7, cls, dashed }: { x: number; y: number; w: number; h: number; tone?: Tone; label?: string; sub?: string; mono?: boolean; rx?: number; cls?: string; dashed?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={rx} className={`d-${tone}`} strokeDasharray={dashed ? '5 4' : undefined} />
      {label && <T x={x + w / 2} y={y + h / 2 - (sub ? 8 : 0)} cls={cls ?? (mono ? 'd-mono' : 'd-text')}>{label}</T>}
      {sub && <T x={x + w / 2} y={y + h / 2 + (label ? 11 : 0)} cls="d-sub" lh={13}>{sub}</T>}
    </g>
  );
}

export function Arrow({ d, tone = 'muted', dashed, both }: { d: string; tone?: 'muted' | 'acc' | 'bad'; dashed?: boolean; both?: boolean }) {
  const id = useContext(MarkerCtx);
  const m = tone === 'acc' ? `${id}-acc` : tone === 'bad' ? `${id}-bad` : `${id}-a`;
  const stroke = tone === 'acc' ? 'var(--accent)' : tone === 'bad' ? 'var(--bad)' : 'var(--text-3)';
  return <path d={d} fill="none" stroke={stroke} strokeWidth={tone === 'muted' ? 1.4 : 1.8} strokeDasharray={dashed ? '5 4' : undefined} markerEnd={`url(#${m})`} markerStart={both ? `url(#${m})` : undefined} />;
}

/** Straight arrow helper. */
export const line = (x1: number, y1: number, x2: number, y2: number) => `M${x1},${y1} L${x2},${y2}`;

/** Time axis arrow pointing down with a label. */
export function TimeAxis({ x, y1, y2, label }: { x: number; y1: number; y2: number; label: string }) {
  return (
    <g>
      <Arrow d={line(x, y1, x, y2)} />
      <T x={x + 6} y={y2 - 6} cls="d-muted" anchor="start">{label}</T>
    </g>
  );
}

/** Decision diamond. */
export function Diamond({ cx, cy, w, h, label }: { cx: number; cy: number; w: number; h: number; label: string }) {
  return (
    <g>
      <path d={`M${cx},${cy - h / 2} L${cx + w / 2},${cy} L${cx},${cy + h / 2} L${cx - w / 2},${cy} Z`} className="d-warn" />
      <T x={cx} y={cy} cls="d-text">{label}</T>
    </g>
  );
}

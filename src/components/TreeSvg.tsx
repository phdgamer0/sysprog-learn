export interface VNode {
  key: string;
  label: string;
  sub?: string;
  color?: string;
  faded?: boolean;
  dashed?: boolean;
  edge?: string;
  onClick?: () => void;
  active?: boolean;
  children: VNode[];
}

interface Placed { n: VNode; x: number; y: number; parent?: Placed }

/** Simple tidy-tree layout: leaves get consecutive slots, parents are centered over their children. */
export function TreeSvg({ root, nodeW = 84, nodeH = 40, gapX = 14, gapY = 46, title }: { root: VNode; nodeW?: number; nodeH?: number; gapX?: number; gapY?: number; title?: string }) {
  const placed: Placed[] = [];
  let slot = 0;
  let maxDepth = 0;
  const place = (n: VNode, depth: number, parent?: Placed): Placed => {
    maxDepth = Math.max(maxDepth, depth);
    const me: Placed = { n, x: 0, y: depth * (nodeH + gapY), parent };
    placed.push(me);
    if (!n.children.length) me.x = slot++ * (nodeW + gapX);
    else {
      const kids = n.children.map((c) => place(c, depth + 1, me));
      me.x = (kids[0].x + kids[kids.length - 1].x) / 2;
    }
    return me;
  };
  place(root, 0);
  const width = Math.max(1, slot) * (nodeW + gapX) - gapX + 8;
  const height = (maxDepth + 1) * (nodeH + gapY) - gapY + 8;
  return (
    <svg className="tree-svg" viewBox={`-4 -4 ${width} ${height}`} style={{ maxWidth: Math.max(width, 120) * 1.15 }} role="img" aria-label={title}>
      {title && <title>{title}</title>}
      {placed.filter((p) => p.parent).map((p) => {
        const px = p.parent!.x + nodeW / 2, py = p.parent!.y + nodeH;
        const cx = p.x + nodeW / 2, cy = p.y;
        const my = (py + cy) / 2;
        return (
          <g key={'e' + p.n.key}>
            <path d={`M${px},${py} C${px},${my} ${cx},${my} ${cx},${cy}`} className={p.n.dashed ? 'd-dash' : 'd-line'} />
            {p.n.edge && (
              <text x={(px + cx) / 2 + (cx >= px ? 4 : -4)} y={my + 4} textAnchor={cx >= px ? 'start' : 'end'} className="d-muted" style={{ fontSize: 10 }}>{p.n.edge}</text>
            )}
          </g>
        );
      })}
      {placed.map((p) => (
        <g
          key={p.n.key}
          transform={`translate(${p.x},${p.y})`}
          opacity={p.n.faded ? 0.5 : 1}
          className={p.n.onClick ? 'svg-btn' : undefined}
          onClick={p.n.onClick}
          role={p.n.onClick ? 'button' : undefined}
          tabIndex={p.n.onClick ? 0 : undefined}
          onKeyDown={p.n.onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); p.n.onClick!(); } } : undefined}
          aria-label={p.n.onClick ? `${p.n.label} ${p.n.sub ?? ''}` : undefined}
        >
          <rect width={nodeW} height={nodeH} rx={7} fill="var(--surface)" stroke={p.n.color ?? 'var(--border-strong)'} strokeWidth={p.n.active ? 3 : 1.6} strokeDasharray={p.n.dashed ? '4 3' : undefined} />
          <text x={nodeW / 2} y={p.n.sub ? 17 : nodeH / 2 + 4} textAnchor="middle" className="d-mono" style={{ fontWeight: 700, fill: p.n.color ?? 'var(--text)' }}>{p.n.label}</text>
          {p.n.sub && <text x={nodeW / 2} y={31} textAnchor="middle" className="d-muted" style={{ fontSize: 10 }}>{p.n.sub}</text>}
        </g>
      ))}
    </svg>
  );
}

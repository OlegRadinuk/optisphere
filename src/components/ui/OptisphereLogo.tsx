'use client';
import { useId } from 'react';

const RED = '#e82020';
const RED_HOT = '#ff3a3a';

interface Props {
  size?: number;
}

export default function OptisphereLogo({ size = 38 }: Props) {
  const id = useId().replace(/:/g, '');
  const r = size / 2 - size * 0.07;
  const cx = size / 2;
  const cy = size / 2;
  const ringW = size * 0.055;

  const ra = (a: number) => (a - 90) * Math.PI / 180;
  const arc = (radius: number, a0: number, a1: number) => {
    const x0 = cx + radius * Math.cos(ra(a0));
    const y0 = cy + radius * Math.sin(ra(a0));
    const x1 = cx + radius * Math.cos(ra(a1));
    const y1 = cy + radius * Math.sin(ra(a1));
    const large = (a1 - a0) > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${radius} ${radius} 0 ${large} 1 ${x1} ${y1}`;
  };

  // intensity B breaks and red arc positions
  const breaks: [number, number][] = [[85, 95], [180, 188], [265, 275]];
  const redArcs: [number, number][] = [[30, 95], [165, 240]];

  const whiteSegs = (() => {
    let segs: [number, number][] = [[0, 360]];
    for (const [b0, b1] of breaks) {
      const next: [number, number][] = [];
      for (const [s0, s1] of segs) {
        if (b1 < s0 || b0 > s1) { next.push([s0, s1]); continue; }
        if (b0 > s0) next.push([s0, b0]);
        if (b1 < s1) next.push([b1, s1]);
      }
      segs = next;
    }
    return segs;
  })();

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.06, color: 'var(--op-text)' }}>

      {/* Left tick + O ring (single SVG, tick included in viewBox) */}
      <svg
        width={size * 1.7}
        height={size * 1.05}
        viewBox={`${-size * 0.35} ${-size * 0.025} ${size * 1.7} ${size * 1.05}`}
        style={{ display: 'block', overflow: 'visible', flexShrink: 0 }}
        role="img"
        aria-label="Optisphere"
      >
        <defs>
          <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor={RED_HOT} stopOpacity="0" />
            <stop offset="70%" stopColor={RED_HOT} stopOpacity="0" />
            <stop offset="92%" stopColor={RED} stopOpacity=".4" />
            <stop offset="100%" stopColor={RED} stopOpacity="0" />
          </radialGradient>
          <filter id={`${id}-blur`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={size * 0.012} />
          </filter>
        </defs>

        {/* left horizontal tick + vertical bracket */}
        <line
          x1={-size * 0.30} y1={cy + size * 0.02}
          x2={cx - r - size * 0.02} y2={cy + size * 0.02}
          stroke="currentColor" strokeWidth={ringW * 0.85}
        />
        <line
          x1={cx - r - size * 0.02} y1={cy - size * 0.07}
          x2={cx - r - size * 0.02} y2={cy + size * 0.10}
          stroke="currentColor" strokeWidth={ringW * 0.7}
        />

        {/* accretion glow halo */}
        <circle cx={cx} cy={cy} r={r * 1.15} fill={`url(#${id}-glow)`} />

        {/* white ring segments with breaks */}
        {whiteSegs.map(([a0, a1], i) => (
          <path
            key={i}
            d={arc(r, a0, a1)}
            stroke="currentColor"
            strokeWidth={ringW}
            fill="none"
            strokeLinecap="butt"
          />
        ))}

        {/* red accretion arcs: outer streak + main + inner echo */}
        {redArcs.map(([a0, a1], i) => (
          <g key={i}>
            <path
              d={arc(r * 1.04, a0 - 8, a1 + 8)}
              stroke={RED_HOT} strokeWidth={ringW * 0.6}
              fill="none" opacity=".55"
              filter={`url(#${id}-blur)`}
            />
            <path
              d={arc(r, a0, a1)}
              stroke={RED} strokeWidth={ringW * 1.7}
              fill="none" strokeLinecap="butt"
            />
            <path
              d={arc(r * 0.92, a0 + 5, a1 - 5)}
              stroke={RED} strokeOpacity=".4"
              strokeWidth={ringW * 0.7}
              fill="none"
            />
          </g>
        ))}

        {/* tiny core dot */}
        <circle cx={cx} cy={cy} r={size * 0.025} fill="currentColor" />
      </svg>

      {/* "ptisphere" wordmark — O is the ring above */}
      <span style={{
        fontFamily: "'Oxanium', sans-serif",
        fontWeight: 500,
        fontSize: size * 0.78,
        color: 'inherit',
        letterSpacing: '-0.005em',
        lineHeight: 1,
      }}>
        ptisphere
      </span>

      {/* right tail: horizontal → diagonal step → horizontal + red tip */}
      <svg
        width={size * 1.6}
        height={size * 0.5}
        viewBox={`0 0 ${size * 1.6} ${size * 0.5}`}
        style={{ display: 'block', overflow: 'visible', flexShrink: 0 }}
        aria-hidden="true"
      >
        <line x1={0} y1={size * 0.18} x2={size * 0.7} y2={size * 0.18}
              stroke="currentColor" strokeWidth={size * 0.045} />
        <line x1={size * 0.7} y1={size * 0.18} x2={size * 0.95} y2={size * 0.32}
              stroke="currentColor" strokeWidth={size * 0.045} />
        <line x1={size * 0.95} y1={size * 0.32} x2={size * 1.4} y2={size * 0.32}
              stroke="currentColor" strokeWidth={size * 0.045} />
        {/* red tip overrides last segment */}
        <line x1={size * 1.25} y1={size * 0.32} x2={size * 1.4} y2={size * 0.32}
              stroke={RED} strokeWidth={size * 0.045} />
      </svg>
    </div>
  );
}

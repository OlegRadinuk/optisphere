'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';

function parseNumeric(value: string): number {
  const digits = value.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

function getSuffix(value: string): string {
  const match = value.match(/\D+$/);
  return match ? match[0].trim() : '';
}

function formatNum(n: number): string {
  if (n >= 1000) return n.toLocaleString('ru-RU').replace(/\s/g, '\u00A0');
  return String(n);
}

function CountUp({ target, suffix, active }: { target: number; suffix: string; active: boolean }) {
  const [cur, setCur] = useState(0);
  const rafRef = useRef<number | null>(null);
  const t0Ref  = useRef<number | null>(null);
  const DURATION = 1800;

  useEffect(() => {
    if (!active || target === 0) return;
    t0Ref.current = null;
    const tick = (now: number) => {
      if (!t0Ref.current) t0Ref.current = now;
      const elapsed = now - t0Ref.current;
      const p = Math.min(elapsed / DURATION, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCur(Math.round(eased * target));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, active]);

  return <span>{formatNum(cur)}{suffix}</span>;
}

interface StatData { value: string; label: string }

// Icon for each stat
function StatIcon({ index }: { index: number }) {
  const icons = [
    // Sites launched
    <svg key="sites" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" opacity="0.5"/>
      <rect x="2" y="4" width="16" height="4" rx="2" fill="currentColor" opacity="0.2"/>
      <circle cx="5" cy="6" r="1" fill="currentColor" opacity="0.7"/>
      <circle cx="8" cy="6" r="1" fill="currentColor" opacity="0.5"/>
    </svg>,
    // Leads
    <svg key="leads" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.4" opacity="0.5"/>
      <path d="M3 17c0-3.5 3.1-5 7-5s7 1.5 7 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
      <path d="M14 5l1.5-1.5M14 5l-1 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.8"/>
    </svg>,
    // Days
    <svg key="days" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.4" opacity="0.5"/>
      <path d="M10 5.5V10l3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.8"/>
    </svg>,
  ];
  return <div style={{ color: 'currentColor' }}>{icons[index]}</div>;
}

export default function AIHookSection() {
  const t         = useTranslations('hook');
  const sectionRef = useRef<HTMLElement>(null);
  const isInView  = useInView(sectionRef, { once: true, margin: '-60px' });

  const stats: StatData[] = [
    { value: t('sites.value'), label: t('sites.label') },
    { value: t('leads.value'), label: t('leads.label') },
    { value: t('days.value'),  label: t('days.label') },
  ];

  const colors = [
    { grad: 'linear-gradient(135deg, var(--indigo), var(--cyan))', line: 'var(--indigo)', dim: 'rgba(99,102,241,0.12)' },
    { grad: 'linear-gradient(135deg, var(--cyan), #22c55e)',        line: 'var(--cyan)',   dim: 'rgba(6,182,212,0.12)' },
    { grad: 'linear-gradient(135deg, var(--indigo), var(--amber))', line: 'var(--amber)',  dim: 'rgba(245,158,11,0.1)' },
  ];

  return (
    <section
      ref={sectionRef}
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: 'clamp(2.5rem,5vw,4.5rem) 2rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle radial glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 100% at 50% 50%, rgba(99,102,241,0.04), transparent)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px',
          background: 'var(--border)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          overflow: 'hidden',
        }}>
          {stats.map((stat, i) => {
            const target = parseNumeric(stat.value);
            const suffix = getSuffix(stat.value);
            const color  = colors[i];
            return (
              <div
                key={i}
                style={{
                  background: 'var(--surface)',
                  padding: 'clamp(1.5rem,3vw,2.5rem)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1.25rem',
                  opacity: isInView ? 1 : 0,
                  transform: isInView ? 'translateY(0)' : 'translateY(28px)',
                  transition: `opacity 0.65s ease ${i * 130}ms, transform 0.65s ease ${i * 130}ms`,
                }}
              >
                {/* Vertical accent bar */}
                <div style={{
                  width: 3, alignSelf: 'stretch',
                  borderRadius: 2, background: color.line,
                  opacity: 0.7, flexShrink: 0,
                }} />

                <div style={{ flex: 1 }}>
                  {/* Icon + label row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: color.line, opacity: 0.8 }}>
                    <StatIcon index={i} />
                    <span style={{
                      fontSize: '0.6rem', fontWeight: 500,
                      fontFamily: 'var(--font-orbitron), monospace',
                      letterSpacing: '0.15em', textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                    }}>
                      {stat.label}
                    </span>
                  </div>

                  {/* Number */}
                  <div style={{
                    fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
                    fontWeight: 900, lineHeight: 1,
                    letterSpacing: '-0.025em',
                    background: color.grad,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                    <CountUp target={target} suffix={suffix} active={isInView} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          div[style*="repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

'use client';

import { useRef } from 'react';
import { useInView, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

// ── Shared panel layout ────────────────────────────────────────────────────

interface ServicePanelProps {
  accent: string;
  accentDim: string;
  label: string;
  title: string;
  desc: string;
  features: string[];
  visual: React.ReactNode;
  reverse?: boolean;
  bg: string;
  cta: string;
}

function ServicePanel({ accent, accentDim, label, title, desc, features, visual, reverse = false, bg, cta }: ServicePanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <div ref={ref} style={{ background: bg, padding: 'clamp(4rem,6vw,6rem) 2rem', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle cross grid bg */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.4,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      <div style={{
        maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 1,
        display: 'grid', gridTemplateColumns: '1fr',
        gap: '3.5rem', alignItems: 'center',
      }} className={`svc-grid${reverse ? ' svc-reverse' : ''}`}>

        {/* Visual */}
        <motion.div
          className="svc-visual"
          initial={{ opacity: 0, x: reverse ? -50 : 50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          {visual}
        </motion.div>

        {/* Text */}
        <motion.div
          className="svc-text"
          initial={{ opacity: 0, x: reverse ? 50 : -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <span style={{
            display: 'inline-block',
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '0.63rem', fontWeight: 600,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: accent, marginBottom: '1.25rem',
            padding: '0.32rem 0.85rem',
            border: `1px solid ${accent}44`,
            borderRadius: 9999, background: accentDim,
          }}>
            {label}
          </span>

          <h3 style={{
            fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
            fontWeight: 800, lineHeight: 1.08,
            letterSpacing: '-0.028em', color: 'var(--text)',
            marginBottom: '1.1rem',
          }}>
            {title}
          </h3>

          <p style={{
            fontSize: '1.05rem', lineHeight: 1.75,
            color: 'var(--text-muted)', maxWidth: 500,
            marginBottom: '2rem',
          }}>
            {desc}
          </p>

          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {features.map((f, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ marginTop: 2, flexShrink: 0 }}>
                  <circle cx="9" cy="9" r="8" fill={accentDim} />
                  <path d="M5.5 9l2.8 2.8L13 6" stroke={accent} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('yura-open'))}
            style={{
              marginTop: '2rem',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              height: 44, padding: '0 20px', borderRadius: 8,
              background: 'transparent', color: accent,
              border: `1px solid ${accent}55`,
              cursor: 'pointer',
              font: "500 14px/1 'Inter',sans-serif",
              transition: 'background 180ms ease, border-color 180ms ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = accentDim; (e.currentTarget as HTMLButtonElement).style.borderColor = accent; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = `${accent}55`; }}
          >
            {cta}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// ── AI Site browser mockup ─────────────────────────────────────────────────

function BrowserMockup() {
  return (
    <div style={{
      width: '100%', maxWidth: 520,
      borderRadius: 16,
      border: '1px solid rgba(99,102,241,0.25)',
      background: 'var(--surface)',
      overflow: 'hidden',
      boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)',
    }}>
      {/* Chrome bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '10px 16px',
        background: 'rgba(255,255,255,0.025)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {['#FF5F57','#FFBD2E','#28CA42'].map(c => (
          <span key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c, display: 'block' }} />
        ))}
        <div style={{
          flex: 1, marginLeft: 10, height: 24, borderRadius: 6,
          background: 'rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', paddingLeft: 10, gap: 6,
        }}>
          <span style={{ opacity: 0.4, fontSize: '0.6rem' }}>🔒</span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>yourclient.ru</span>
        </div>
      </div>

      {/* Website preview */}
      <div style={{ padding: '1.25rem', minHeight: 290, position: 'relative', background: 'var(--surface-high)' }}>
        {/* Hero section of client site */}
        <div style={{
          height: 56, borderRadius: 10,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.22) 0%, rgba(6,182,212,0.12) 100%)',
          border: '1px solid rgba(99,102,241,0.25)',
          marginBottom: 14,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 14px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ height: 6, width: 140, borderRadius: 3, background: 'rgba(255,255,255,0.25)', marginBottom: 5 }} />
          <div style={{ height: 4, width: 90, borderRadius: 2, background: 'rgba(255,255,255,0.1)' }} />
          {/* Indigo glow */}
          <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(99,102,241,0.35)' }} />
        </div>

        {/* Content rows */}
        {[100, 85, 70, 90].map((w, i) => (
          <div key={i} style={{ height: 8, borderRadius: 3, background: 'rgba(255,255,255,0.05)', width: `${w}%`, marginBottom: 9 }} />
        ))}

        {/* CTA button */}
        <div style={{
          height: 36, borderRadius: 18, width: '48%', marginTop: 16,
          background: 'linear-gradient(135deg, rgba(245,158,11,0.35), rgba(245,158,11,0.15))',
          border: '1px solid rgba(245,158,11,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--amber)', fontWeight: 700, letterSpacing: '0.05em' }}>Оставить заявку</span>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {['47 сайтов', '7 дней', 'SEO'].map(label => (
            <div key={label} style={{
              flex: 1, height: 30, borderRadius: 6,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Cursor blink */}
        <motion.div
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1.1, repeat: Infinity }}
          style={{ position: 'absolute', bottom: 36, left: 38, width: 2, height: 14, background: 'var(--indigo)', borderRadius: 1 }}
        />

        {/* Юра widget */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', bottom: 16, right: 16,
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 9999,
            background: 'var(--indigo)',
            fontSize: '0.65rem', fontWeight: 700, color: '#fff',
            boxShadow: '0 0 20px rgba(99,102,241,0.5)',
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#7fff7f', display: 'block', boxShadow: '0 0 5px #7fff7f' }} />
          Юра онлайн
        </motion.div>
      </div>

      {/* Analytics footer bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '0.7rem 1rem',
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        {[
          { label: 'Визиты', val: '1.4K', col: 'var(--indigo)' },
          { label: 'Лиды', val: '38', col: '#22c55e' },
          { label: 'Конверсия', val: '2.7%', col: 'var(--amber)' },
        ].map(m => (
          <div key={m.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: m.col }}>{m.val}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 360° panorama viewer mockup ────────────────────────────────────────────

function PanoramaMockup() {
  return (
    <div style={{
      width: '100%', maxWidth: 520,
      borderRadius: 16,
      border: '1px solid rgba(6,182,212,0.2)',
      background: 'var(--surface)',
      overflow: 'hidden',
      boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(6,182,212,0.08)',
    }}>
      {/* Viewer header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
        background: 'rgba(255,255,255,0.02)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cyan)', display: 'block', boxShadow: '0 0 6px var(--cyan)' }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>360° VIRTUAL TOUR</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['VR', 'HD', '🔊'].map(b => (
            <span key={b} style={{ fontSize: '0.58rem', padding: '2px 6px', borderRadius: 4, background: 'rgba(6,182,212,0.12)', color: 'var(--cyan)', border: '1px solid rgba(6,182,212,0.2)' }}>{b}</span>
          ))}
        </div>
      </div>

      {/* Main panorama view */}
      <div style={{
        aspectRatio: '16/9', position: 'relative',
        background: 'radial-gradient(ellipse at 40% 50%, rgba(6,182,212,0.18) 0%, rgba(30,30,60,0.8) 60%, rgba(10,10,24,1) 100%)',
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Panorama horizon line */}
        <div style={{ position: 'absolute', top: '55%', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.3), transparent)' }} />

        {/* 360 rings */}
        <svg width="180" height="180" viewBox="0 0 180 180" fill="none" style={{ position: 'relative', zIndex: 1 }}>
          <ellipse cx="90" cy="90" rx="82" ry="28" stroke="rgba(6,182,212,0.45)" strokeWidth="1.5" />
          <ellipse cx="90" cy="90" rx="60" ry="20" stroke="rgba(6,182,212,0.32)" strokeWidth="1.2" />
          <ellipse cx="90" cy="90" rx="36" ry="12" stroke="rgba(6,182,212,0.25)" strokeWidth="1" />
          <ellipse cx="90" cy="90" rx="16" ry="5" stroke="rgba(6,182,212,0.2)" strokeWidth="0.8" />
          <circle cx="90" cy="90" r="6" fill="rgba(6,182,212,0.8)" />
          <circle cx="90" cy="90" r="3" fill="white" />
          {/* Navigation arrows */}
          <text x="90" y="142" textAnchor="middle" fill="rgba(6,182,212,0.75)" fontSize="13" fontFamily="monospace" fontWeight="700">360°</text>
          <text x="14"  y="94"  fill="rgba(6,182,212,0.5)" fontSize="14">‹</text>
          <text x="160" y="94"  fill="rgba(6,182,212,0.5)" fontSize="14">›</text>
        </svg>

        {/* Scan line animation */}
        <motion.div
          animate={{ x: ['-60%', '160%'] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.07) 50%, transparent 100%)',
            width: '40%',
          }}
        />

        {/* Hotspot pins */}
        {[[25, 40], [70, 55], [55, 30]].map(([x, y], i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.15, 1] }}
            transition={{ duration: 2 + i * 0.7, repeat: Infinity, delay: i * 0.4 }}
            style={{
              position: 'absolute', left: `${x}%`, top: `${y}%`,
              width: 14, height: 14, borderRadius: '50%',
              background: 'rgba(6,182,212,0.9)',
              boxShadow: '0 0 12px rgba(6,182,212,0.6)',
              border: '2px solid white',
            }}
          />
        ))}

        {/* Object label tags */}
        <div style={{
          position: 'absolute', left: '10px', bottom: '10px',
          fontSize: '0.6rem', color: 'var(--cyan)', fontFamily: 'monospace',
          background: 'rgba(0,0,0,0.5)', padding: '3px 8px', borderRadius: 4,
          border: '1px solid rgba(6,182,212,0.2)',
        }}>
          Гостиница «Нова» · Люкс 301
        </div>
      </div>

      {/* Footer controls */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 1.1rem',
        background: 'rgba(255,255,255,0.015)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {['🏨 Ресепшн', '🛏 Люкс', '🏊 SPA'].map(room => (
            <button key={room} style={{
              fontSize: '0.62rem', padding: '4px 8px', borderRadius: 6,
              background: room.includes('Люкс') ? 'rgba(6,182,212,0.18)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${room.includes('Люкс') ? 'rgba(6,182,212,0.35)' : 'rgba(255,255,255,0.08)'}`,
              color: room.includes('Люкс') ? 'var(--cyan)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}>{room}</button>
          ))}
        </div>
        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>8/20 объектов</span>
      </div>
    </div>
  );
}

// ── Growth / SEO dashboard mockup ─────────────────────────────────────────

function GrowthChart() {
  const ref = useRef<SVGPathElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true });

  const points = [[0,78],[50,68],[100,52],[160,38],[220,22],[300,8]];
  const d = `M ${points.map(p => p.join(',')).join(' L ')}`;

  return (
    <div style={{
      width: '100%', maxWidth: 520,
      borderRadius: 16,
      border: '1px solid rgba(245,158,11,0.2)',
      background: 'var(--surface)',
      overflow: 'hidden',
      boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,158,11,0.07)',
    }}>
      {/* Dashboard header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 18px',
        background: 'rgba(255,255,255,0.02)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text)' }}>Продвижение · Аналитика</div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Органический трафик / 6 мес</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['1М', '3М', '6М'].map((t, i) => (
            <span key={t} style={{
              fontSize: '0.6rem', padding: '3px 8px', borderRadius: 5,
              background: i === 2 ? 'rgba(245,158,11,0.2)' : 'transparent',
              border: `1px solid ${i === 2 ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.06)'}`,
              color: i === 2 ? 'var(--amber)' : 'var(--text-muted)',
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: '1.25rem 1.25rem 0.5rem' }}>
        {/* Y-axis labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, padding: '0 4px' }}>
          {['8.2K', '6K', '4K', '2K', '0'].map(v => (
            <span key={v} style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>{v}</span>
          ))}
        </div>
        <svg width="100%" height="110" viewBox="0 0 300 90" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--amber)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[20,40,60,80].map(y => (
            <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          ))}
          <path d={`${d} L 300,90 L 0,90 Z`} fill="url(#chartFill)" />
          <motion.path
            ref={ref}
            d={d}
            fill="none"
            stroke="var(--amber)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : {}}
            transition={{ duration: 1.8, ease: 'easeOut' }}
          />
          {/* Area 2 — Яндекс.Директ comparison */}
          <motion.path
            d="M 0,85 L 50,80 L 100,72 L 160,62 L 220,48 L 300,34"
            fill="none"
            stroke="rgba(6,182,212,0.4)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : {}}
            transition={{ duration: 1.8, delay: 0.3, ease: 'easeOut' }}
          />
          {points.map(([x, y], i) => (
            <motion.circle key={i} cx={x} cy={y} r={4}
              fill="var(--base)" stroke="var(--amber)" strokeWidth="2"
              initial={{ opacity: 0, scale: 0 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.18 + 0.9 }}
            />
          ))}
        </svg>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: '0.75rem 1.25rem 1.25rem' }}>
        {[
          { label: 'SEO трафик',   color: 'var(--amber)',  val: '+340%', sub: '+2 840 визит/мес' },
          { label: 'ROI Директ',   color: 'var(--cyan)',   val: '4.2×',  sub: '₽ 14 → ₽ 59 лид' },
          { label: 'Конверсия',    color: '#22c55e',       val: '+28%',  sub: '1.8% → 2.3%' },
        ].map(m => (
          <div key={m.label} style={{
            padding: '0.75rem 0.9rem',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: m.color, display: 'block', boxShadow: `0 0 4px ${m.color}` }} />
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{m.label}</span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.val}</div>
            <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginTop: 3 }}>{m.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ServicesSection ────────────────────────────────────────────────────────

export function ServicesSection() {
  const t = useTranslations('services');

  const ai_features   = t.raw('ai_site.features')  as string[];
  const pres_features = t.raw('presence.features') as string[];
  const growth_features = t.raw('growth.features') as string[];

  return (
    <section id="services">
      {/* Section header */}
      <div style={{
        padding: 'clamp(4rem,6vw,6rem) 2rem clamp(2rem,3vw,3rem)',
        background: 'var(--base)', textAlign: 'center',
      }}>
        <span style={{
          display: 'inline-block',
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '0.63rem', fontWeight: 500,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--text-muted)', marginBottom: '1rem',
        }}>
          {t('label')}
        </span>
        <h2 style={{
          fontSize: 'clamp(2.2rem, 4.5vw, 4rem)',
          fontWeight: 800, lineHeight: 1.08,
          letterSpacing: '-0.028em', color: 'var(--text)', margin: 0,
        }}>
          {t('header')}
        </h2>
      </div>

      {/* Panel 1 — AI-сайт */}
      <ServicePanel
        accent="var(--indigo)" accentDim="var(--indigo-dim)"
        label={t('ai_site.label')} title={t('ai_site.title')} desc={t('ai_site.desc')}
        features={ai_features} visual={<BrowserMockup />}
        reverse={false} bg="var(--base)"
        cta="Обсудить мой сайт →"
      />

      {/* Panel 2 — Присутствие */}
      <ServicePanel
        accent="var(--cyan)" accentDim="var(--cyan-dim)"
        label={t('presence.label')} title={t('presence.title')} desc={t('presence.desc')}
        features={pres_features} visual={<PanoramaMockup />}
        reverse={true} bg="var(--surface)"
        cta="Заказать 360° тур →"
      />

      {/* Panel 3 — Рост */}
      <ServicePanel
        accent="var(--amber)" accentDim="var(--amber-dim)"
        label={t('growth.label')} title={t('growth.title')} desc={t('growth.desc')}
        features={growth_features} visual={<GrowthChart />}
        reverse={false} bg="var(--base)"
        cta="Обсудить продвижение →"
      />

      <style>{`
        @media (min-width: 900px) {
          .svc-grid { grid-template-columns: 1fr 1fr !important; }
          .svc-reverse .svc-visual { order: -1; }
          .svc-reverse .svc-text  { order: 1; }
        }
      `}</style>
    </section>
  );
}

export default ServicesSection;

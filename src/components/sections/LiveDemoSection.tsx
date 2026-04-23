'use client';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useScroll } from 'framer-motion';
import SectionIntro from '@/components/hud/SectionIntro';

function FrameVisual({ idx, briefPlaceholder, salesmanConnected, readySystem, readyTags }: {
  idx: number;
  briefPlaceholder: string;
  salesmanConnected: string;
  readySystem: string;
  readyTags: string;
}) {
  if (idx === 0) return (
    <motion.div
      key={0}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: 'absolute', inset: 0, padding: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div style={{ width: '52%', aspectRatio: '4/3', borderRadius: 14, border: '1px dashed var(--op-border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: "400 13px 'JetBrains Mono',monospace", color: 'var(--op-text-muted)', letterSpacing: '.1em' }}>{briefPlaceholder}</div>
    </motion.div>
  );
  if (idx === 1) return (
    <motion.div
      key={1}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: 'absolute', inset: 0, padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8 }}
    >
      {[72, 60, 48, 36].map((w, i) => (
        <div key={i} style={{ width: `${w}%`, height: 14, background: 'var(--op-surface-overlay)', borderRadius: 4, border: '1px solid var(--op-border)' }} />
      ))}
    </motion.div>
  );
  if (idx === 2) return (
    <motion.div
      key={2}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: 'absolute', inset: 0, padding: 48, display: 'flex', gap: 12, alignItems: 'stretch' }}
    >
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{ flex: 1, borderRadius: 10, border: '1px solid var(--op-border)', background: i === 1 ? 'linear-gradient(180deg,rgba(201,166,95,.1),transparent)' : 'var(--op-surface-overlay)', display: 'flex', flexDirection: 'column', gap: 8, padding: 16, justifyContent: 'flex-end' }}>
          <div style={{ height: 8, width: '70%', background: 'var(--op-text-faint)', borderRadius: 2 }} />
          <div style={{ height: 8, width: '40%', background: 'var(--op-text-faint)', borderRadius: 2 }} />
        </div>
      ))}
    </motion.div>
  );
  if (idx === 3) return (
    <motion.div
      key={3}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: 'absolute', inset: 0, padding: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 120, height: 80, borderRadius: 10, border: '1px solid var(--op-border-accent)', background: 'var(--op-accent-faint)' }} />
        ))}
      </div>
      <div style={{ padding: '12px 20px', borderRadius: 999, background: 'var(--op-accent-subtle)', border: '1px solid var(--op-border-accent)', color: 'var(--op-accent)', font: "500 13px 'Oxanium',sans-serif", display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--op-accent)', boxShadow: '0 0 0 4px rgba(201,166,95,.25)', display: 'inline-block' }} />
        {salesmanConnected}
      </div>
    </motion.div>
  );
  return (
    <motion.div
      key={4}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: 'absolute', inset: 0, padding: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}
    >
      <div style={{ width: '70%', height: 10, background: 'var(--op-surface-overlay)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: '100%', height: '100%', background: 'var(--op-accent)' }} />
      </div>
      <span style={{ font: "500 28px 'Oxanium',sans-serif", color: 'var(--op-text)', letterSpacing: '-0.02em' }}>{readySystem}</span>
      <div style={{ display: 'flex', gap: 16, font: "400 12px 'JetBrains Mono',monospace", color: 'var(--op-text-muted)', letterSpacing: '.1em' }}>
        {readyTags.split(' · ').map((tag, i, arr) => (
          <>
            <span key={tag}>{tag}</span>
            {i < arr.length - 1 && <span key={`sep-${i}`}>·</span>}
          </>
        ))}
      </div>
    </motion.div>
  );
}

export default function LiveDemoSection() {
  const t = useTranslations('demo');
  const [idx, setIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const FRAMES = [
    { pct: '0%',   label: t('frames.f0') },
    { pct: '25%',  label: t('frames.f1') },
    { pct: '50%',  label: t('frames.f2') },
    { pct: '75%',  label: t('frames.f3') },
    { pct: '100%', label: t('frames.f4') },
  ];

  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ['start start', 'end end'] });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    return scrollYProgress.on('change', (v: number) => {
      const newIdx = Math.min(Math.floor(v * FRAMES.length), FRAMES.length - 1);
      setIdx(newIdx);
    });
  }, [scrollYProgress, isMobile, FRAMES.length]);

  return (
    <section id="demo" style={{ background: 'var(--op-surface)', borderTop: '1px solid var(--op-border)', borderBottom: '1px solid var(--op-border)' }}>
      <div
        ref={wrapperRef}
        className="demo-wrapper"
        style={{ height: `${FRAMES.length * 100}vh` }}
      >
        <div
          className="demo-sticky"
          style={{ position: 'sticky', top: '80px', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', maxWidth: 1280, margin: '0 auto', padding: '32px 48px 48px' }}
        >
          <SectionIntro code="02" cmd="yura.trace()" title={t('title')} sub={t('sub')} crimson />

          {/* Progress bar */}
          <div style={{ height: 2, background: 'var(--op-border)', borderRadius: 1, marginBottom: 12, overflow: 'hidden' }}>
            <motion.div style={{ height: '100%', background: 'var(--op-accent)', borderRadius: 1, width: `${((idx + 1) / FRAMES.length) * 100}%`, transition: 'width 400ms ease' }} />
          </div>

          <div
            className="demo-grid"
            style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) 280px', gap: 48, flex: 1, minHeight: 0 }}
          >
            {/* Visual panel */}
            <div style={{ position: 'relative', background: 'var(--op-surface-elevated)', borderRadius: 16, border: '1px solid var(--op-border)', overflow: 'hidden' }}>
              <FrameVisual
                idx={idx}
                briefPlaceholder={t('brief_placeholder')}
                salesmanConnected={t('salesman_connected')}
                readySystem={t('ready_system')}
                readyTags={t('ready_tags')}
              />
              {/* HUD badge */}
              <div style={{ position: 'absolute', top: 24, left: 24, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 10, background: 'rgba(10,14,20,.65)', backdropFilter: 'blur(10px)', border: '1px solid var(--op-border)' }}>
                <span style={{ font: "500 11px 'JetBrains Mono',monospace", color: 'var(--op-accent)', letterSpacing: '.14em' }}>{FRAMES[idx].pct}</span>
                <span style={{ width: 1, height: 14, background: 'var(--op-border-strong)', display: 'inline-block' }} />
                <span style={{ font: "500 14px/1 'Oxanium',sans-serif", color: 'var(--op-text)', letterSpacing: '-0.01em' }}>{FRAMES[idx].label}</span>
              </div>
            </div>

            {/* Right panel — progress steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, paddingLeft: 24, borderLeft: '1px solid var(--op-border)', overflowY: 'auto' }}>
              {FRAMES.map((f, i) => {
                const active = i === idx;
                const past = i < idx;
                return (
                  <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '16px 0', position: 'relative' }}>
                    {/* Vertical connector line */}
                    {i < FRAMES.length - 1 && (
                      <div style={{ position: 'absolute', left: 5, top: 28, bottom: -16, width: 2, background: past ? 'var(--op-accent)' : 'var(--op-border)', transition: 'background 400ms' }} />
                    )}
                    {/* Dot */}
                    <span style={{
                      width: 12, height: 12, borderRadius: '50%', marginTop: 4, flexShrink: 0, position: 'relative', zIndex: 1,
                      background: active || past ? 'var(--op-accent)' : 'transparent',
                      border: active || past ? '1px solid var(--op-accent)' : '1px solid var(--op-border-strong)',
                      boxShadow: active ? '0 0 0 4px var(--op-accent-faint)' : 'none',
                      transition: 'all 300ms'
                    }} />
                    {/* Label */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ font: "500 10px/1 'JetBrains Mono',monospace", color: active ? 'var(--op-accent)' : past ? 'var(--op-text-muted)' : 'var(--op-text-faint)', letterSpacing: '.14em', transition: 'color 300ms' }}>{f.pct}</span>
                      <span style={{ font: "500 14px/1.3 'Oxanium',sans-serif", color: active ? 'var(--op-text)' : past ? 'var(--op-text-secondary)' : 'var(--op-text-faint)', letterSpacing: '-0.01em', transition: 'color 300ms' }}>{f.label}</span>
                    </div>
                  </div>
                );
              })}

              {/* Scroll hint */}
              <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8, opacity: idx === 0 ? 1 : 0, transition: 'opacity 400ms' }}>
                <span style={{ font: "400 11px/1 'JetBrains Mono',monospace", color: 'var(--op-text-faint)', letterSpacing: '.1em' }}>↓ SCROLL</span>
              </div>

              {/* Mobile fallback nav */}
              {isMobile && (
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button
                    onClick={() => setIdx(i => Math.max(0, i - 1))}
                    disabled={idx === 0}
                    style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid var(--op-border)', background: 'var(--op-surface-overlay)', color: 'var(--op-text-secondary)', font: "500 13px 'JetBrains Mono',monospace", cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.4 : 1 }}
                  >
                    ← Назад
                  </button>
                  <button
                    onClick={() => setIdx(i => Math.min(FRAMES.length - 1, i + 1))}
                    disabled={idx === FRAMES.length - 1}
                    style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid var(--op-border)', background: 'var(--op-surface-overlay)', color: 'var(--op-text-secondary)', font: "500 13px 'JetBrains Mono',monospace", cursor: idx === FRAMES.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === FRAMES.length - 1 ? 0.4 : 1 }}
                  >
                    Далее →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:900px){
          .demo-wrapper { height: auto !important; }
          .demo-sticky { position: relative !important; top: auto !important; height: auto !important; }
          .demo-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

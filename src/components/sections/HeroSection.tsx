'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

const NexusSphereLoader = dynamic(
  () => import('@/components/three/NexusSphere'),
  { ssr: false }
);

// ─── Starfield ───────────────────────────────────────────────────────────────

function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const COUNT = isMobile ? 500 : 2000;

    const setSize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    setSize();

    const stars = Array.from({ length: COUNT }, () => ({
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height,
      r:    0.3 + Math.random() * 1.0,
      a:    0.15 + Math.random() * 0.75,
      off:  Math.random() * Math.PI * 2,
      cyan: Math.random() < 0.045,
    }));

    let t0 = performance.now();
    const draw = (now: number) => {
      animRef.current = requestAnimationFrame(draw);
      const t = (now - t0) * 0.00055;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        const alpha = s.a * (0.35 + 0.65 * Math.sin(t + s.off));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.cyan ? `rgba(6,182,212,${alpha})` : `rgba(248,250,252,${alpha})`;
        ctx.fill();
      }
    };
    const onResize = () => { setSize(); for (const s of stars) { s.x = Math.random()*canvas.width; s.y = Math.random()*canvas.height; } };
    window.addEventListener('resize', onResize, { passive: true });
    t0 = performance.now();
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', onResize); };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}

// ─── Orbit ring decoration + floating cards ───────────────────────────────────

function SphereDecorations({ size }: { size: number }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {/* Orbit rings — centered on sphere within the wrapper */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          overflow: 'visible',
        }}
        aria-hidden="true"
      >
        {/* Outer orbit ellipse */}
        <ellipse
          cx={size * 0.5} cy={size * 0.5}
          rx={size * 0.56} ry={size * 0.17}
          fill="none"
          stroke="rgba(99,102,241,0.22)"
          strokeWidth="1"
          strokeDasharray="4 8"
        />
        {/* Inner orbit */}
        <ellipse
          cx={size * 0.5} cy={size * 0.5}
          rx={size * 0.42} ry={size * 0.12}
          fill="none"
          stroke="rgba(6,182,212,0.18)"
          strokeWidth="1"
          strokeDasharray="3 10"
        />
        {/* Orbit dot on outer ring */}
        <circle r="4" fill="rgba(99,102,241,0.9)">
          <animateMotion dur="22s" repeatCount="indefinite">
            <mpath xlinkHref="#orbit-outer" />
          </animateMotion>
        </circle>
        <ellipse
          id="orbit-outer"
          cx={size * 0.5} cy={size * 0.5}
          rx={size * 0.56} ry={size * 0.17}
          fill="none"
        />
        {/* Orbit dot on inner ring */}
        <circle r="3" fill="rgba(6,182,212,0.9)">
          <animateMotion dur="15s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear">
            <mpath xlinkHref="#orbit-inner" />
          </animateMotion>
        </circle>
        <ellipse
          id="orbit-inner"
          cx={size * 0.5} cy={size * 0.5}
          rx={size * 0.55} ry={size * 0.16}
          fill="none"
        />
      </svg>

      {/* Floating metric card — top right of sphere */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          top: '8%',
          right: '4%',
          background: 'rgba(10,10,24,0.88)',
          border: '1px solid rgba(99,102,241,0.32)',
          borderRadius: 12,
          padding: '0.65rem 0.9rem',
          backdropFilter: 'blur(20px)',
          minWidth: 145,
          boxShadow: '0 8px 32px rgba(99,102,241,0.22)',
        }}
      >
        <div style={{ fontSize: '0.59rem', color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'var(--font-orbitron), monospace', letterSpacing: '0.1em' }}>AI КОНВЕРСИЯ</div>
        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--indigo)', lineHeight: 1, letterSpacing: '-0.02em' }}>+340%</div>
        <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', marginTop: 2 }}>средний рост трафика</div>
      </motion.div>

      {/* Floating metric card — bottom right of sphere */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '6%',
          background: 'rgba(10,10,24,0.88)',
          border: '1px solid rgba(6,182,212,0.3)',
          borderRadius: 12,
          padding: '0.65rem 0.9rem',
          backdropFilter: 'blur(20px)',
          minWidth: 138,
          boxShadow: '0 8px 32px rgba(6,182,212,0.18)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', display: 'block', flexShrink: 0, animation: 'live-dot 1.8s ease-in-out infinite' }} />
          <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', fontFamily: 'var(--font-orbitron), monospace', letterSpacing: '0.1em' }}>ЮРА ОНЛАЙН</span>
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--cyan)', lineHeight: 1, letterSpacing: '-0.02em' }}>1 200+</div>
        <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', marginTop: 2 }}>лидов поймано</div>
      </motion.div>
    </div>
  );
}

// ─── HeroSection ─────────────────────────────────────────────────────────────

export default function HeroSection() {
  const t = useTranslations('hero');

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100svh',
        background: 'var(--base)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Starfield />

      {/* Deep ambient glow behind sphere */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: '50%', right: '4%',
        transform: 'translateY(-50%)',
        width: 800, height: 800,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, rgba(6,182,212,0.07) 40%, transparent 68%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      {/* Second glow offset for depth */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: '30%', right: '15%',
        width: 400, height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 65%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Content */}
      <div
        className="hero-inner"
        style={{
          position: 'relative', zIndex: 1,
          maxWidth: 1400, margin: '0 auto',
          width: '100%', padding: '0 2rem',
          paddingTop: 80, paddingBottom: 60,
        }}
      >
        {/* ── Mobile: sphere on top ── */}
        <motion.div
          className="hero-sphere-top"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}
        >
          <div style={{ filter: 'drop-shadow(0 0 60px rgba(99,102,241,0.6)) drop-shadow(0 0 120px rgba(6,182,212,0.35))' }}>
            <NexusSphereLoader size={260} />
          </div>
        </motion.div>

        {/* ── Two-column row ── */}
        <div className="hero-row" style={{ display: 'flex', alignItems: 'center', gap: '4rem' }}>

          {/* ── Text column ── */}
          <div className="hero-text" style={{ flex: '0 0 100%' }}>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              style={{ marginBottom: '1.75rem' }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                padding: '0.38rem 1rem',
                borderRadius: 9999,
                border: '1px solid rgba(99,102,241,0.38)',
                background: 'rgba(99,102,241,0.1)',
                fontFamily: 'var(--font-orbitron), monospace',
                fontSize: '0.63rem', fontWeight: 500,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'var(--indigo)',
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--indigo)',
                  boxShadow: '0 0 8px rgba(99,102,241,0.9)',
                  animation: 'pulse-dot 2s ease-in-out infinite',
                }} />
                {t('badge')}
              </span>
            </motion.div>

            {/* Headline */}
            <h1 style={{ margin: 0, padding: 0 }}>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  display: 'block',
                  fontSize: 'clamp(2.8rem, 5.8vw, 6rem)',
                  fontWeight: 900, lineHeight: 1.0,
                  letterSpacing: '-0.03em', color: 'var(--text)',
                }}
              >
                {t('headline.line1')}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  display: 'block',
                  fontSize: 'clamp(2.8rem, 5.8vw, 6rem)',
                  fontWeight: 900, lineHeight: 1.0,
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(110deg, var(--indigo) 0%, var(--cyan) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {t('headline.line2')}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.51, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  display: 'block',
                  fontSize: 'clamp(2.8rem, 5.8vw, 6rem)',
                  fontWeight: 900, lineHeight: 1.0,
                  letterSpacing: '-0.03em', color: 'var(--text)',
                }}
              >
                {t('headline.line3')}
              </motion.span>
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.68, duration: 0.6 }}
              style={{
                marginTop: '1.75rem',
                fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
                lineHeight: 1.75, color: 'var(--text-muted)',
                maxWidth: 500,
              }}
            >
              {t('subtitle')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.5 }}
              style={{ marginTop: '2.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
            >
              <a href="#calculator" className="btn btn-primary" style={{ minWidth: 210, fontSize: '0.975rem' }}>
                {t('cta.primary')}
              </a>
              <a href="#portfolio" className="btn btn-ghost" style={{ fontSize: '0.975rem' }}>
                {t('cta.secondary')}
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.7 }}
              style={{
                marginTop: '2.75rem',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              {/* Dividers between stats */}
              {[
                { value: '47',    label: 'сайтов' },
                { value: '1200+', label: 'лидов поймал Юра' },
                { value: '7 дней', label: 'в среднем' },
              ].map((s, i) => (
                <div key={s.value} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {i > 0 && <span style={{ width: 1, height: 30, background: 'var(--border)', flexShrink: 0 }} />}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                      {s.value}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.label}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Desktop sphere column ── */}
          <motion.div
            className="hero-sphere-right"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.3, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'none', justifyContent: 'center', alignItems: 'center', flexShrink: 0, position: 'relative' }}
          >
            <div style={{ filter: 'drop-shadow(0 0 80px rgba(99,102,241,0.55)) drop-shadow(0 0 160px rgba(6,182,212,0.28))' }}>
              <NexusSphereLoader size={520} />
            </div>
            <SphereDecorations size={520} />
          </motion.div>

        </div>
      </div>

      {/* Bottom gradient fade */}
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 130,
        background: 'linear-gradient(to bottom, transparent, var(--base))',
        pointerEvents: 'none', zIndex: 2,
      }} />

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.45; transform: scale(0.65); }
        }
        @keyframes live-dot {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #22c55e; }
          50%       { opacity: 0.5; box-shadow: 0 0 3px #22c55e; }
        }
        @media (min-width: 1024px) {
          .hero-sphere-top  { display: none !important; }
          .hero-row         { align-items: center !important; }
          .hero-text        { flex: 0 0 50% !important; max-width: 50% !important; }
          .hero-sphere-right { display: flex !important; flex: 0 0 50% !important; }
        }
        @media (max-width: 480px) {
          .hero-inner { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
        }
      `}</style>
    </section>
  );
}

'use client';

import { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';

// ─── Animated ring background ────────────────────────────────────────────────

function RingField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;
    const setSize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    setSize();
    window.addEventListener('resize', setSize, { passive: true });

    function draw() {
      animRef.current = requestAnimationFrame(draw);
      t += 0.006;

      const w = canvas!.width, h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      const cx = w / 2, cy = h / 2;

      // Expanding pulse rings
      for (let i = 0; i < 5; i++) {
        const phase   = ((t * 0.4 + i * 0.22) % 1);
        const radius  = phase * Math.min(w, h) * 0.65;
        const alpha   = (1 - phase) * 0.18;
        ctx!.beginPath();
        ctx!.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(232,32,32,${alpha})`;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();
      }

      // Inner ring pulses (offset timing)
      for (let i = 0; i < 3; i++) {
        const phase   = ((t * 0.6 + i * 0.33) % 1);
        const radius  = phase * Math.min(w, h) * 0.4;
        const alpha   = (1 - phase) * 0.12;
        ctx!.beginPath();
        ctx!.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(232,80,80,${alpha})`;
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }

      // Central glow
      const gr = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 160);
      gr.addColorStop(0,   'rgba(232,32,32,0.12)');
      gr.addColorStop(0.5, 'rgba(232,80,80,0.05)');
      gr.addColorStop(1,   'rgba(0,0,0,0)');
      ctx!.beginPath(); ctx!.arc(cx, cy, 160, 0, Math.PI*2);
      ctx!.fillStyle = gr; ctx!.fill();
    }

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', setSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}

function TelegramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

// ─── CTASection ───────────────────────────────────────────────────────────────

export default function CTASection() {
  const t    = useTranslations('cta');
  const ref  = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  function openOpti() { window.dispatchEvent(new CustomEvent('opti-open')); }

  return (
    <section
      id="contact"
      ref={ref}
      style={{
        background: 'var(--base)',
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(5rem,8vw,9rem) 2rem',
      }}
    >
      {/* Animated ring field */}
      <RingField />

      {/* Deep bg radial gradient */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(232,32,32,0.1) 0%, rgba(200,20,20,0.04) 45%, transparent 75%)',
        pointerEvents: 'none',
      }} />

      {/* Cross grid overlay */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        pointerEvents: 'none',
        opacity: 0.7,
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', textAlign: 'center',
          gap: '1.75rem', maxWidth: '700px', margin: '0 auto',
        }}>

          {/* Top label */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
              fontFamily: 'var(--font-jetbrains), monospace',
              fontSize: '0.63rem', fontWeight: 500,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 8px #22c55e',
                display: 'block',
                animation: 'cta-live 2s ease-in-out infinite',
              }} />
              {t('ready_label')}
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: 'clamp(3rem, 7vw, 6.5rem)',
              fontWeight: 900, lineHeight: 0.97,
              letterSpacing: '-0.035em', margin: 0, padding: 0,
              color: 'var(--text)',
            }}
          >
            {t('title')}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
              color: 'var(--text-muted)', lineHeight: 1.7,
              maxWidth: '500px',
            }}
          >
            {t('subtitle')}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}
          >
            <motion.button
              onClick={openOpti}
              className="btn btn-primary"
              animate={{ scale: [1, 1.018, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ padding: '1rem 2.75rem', fontSize: '1.05rem', minHeight: '54px', minWidth: 220 }}
            >
              {t('button')}
            </motion.button>

            <a
              href="https://t.me/optisphere"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{
                padding: '1rem 1.75rem',
                fontSize: '1.05rem', minHeight: '54px',
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              }}
            >
              <TelegramIcon />
              @optisphere
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            style={{
              display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
              justifyContent: 'center', marginTop: '0.5rem',
            }}
          >
            {[
              {
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                ),
                label: t('trust.response'),
              },
              {
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                ),
                label: t('trust.contract'),
              },
              {
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ),
                label: t('trust.revisions'),
              },
            ].map(b => (
              <div key={b.label} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.8rem', color: 'var(--text-muted)',
              }}>
                {b.icon}
                {b.label}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes cta-live {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #22c55e; }
          50%       { opacity: 0.5; box-shadow: 0 0 3px #22c55e; }
        }
      `}</style>
    </section>
  );
}

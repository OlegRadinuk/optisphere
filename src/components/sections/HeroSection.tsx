'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

const YuraHUD = dynamic(() => import('@/components/ai/YuraHUD'), { ssr: false });

// ─── Starfield ────────────────────────────────────────────────────────────────

function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const COUNT = isMobile ? 400 : 1200;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const stars = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 0.3 + Math.random() * 0.9,
      a: 0.1 + Math.random() * 0.6,
      off: Math.random() * Math.PI * 2,
      cyan: Math.random() < 0.04,
    }));

    let t0 = performance.now();
    const draw = (now: number) => {
      rafRef.current = requestAnimationFrame(draw);
      const t = (now - t0) * 0.00045;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        const alpha = s.a * (0.3 + 0.7 * Math.sin(t + s.off));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.cyan ? `rgba(0,212,255,${alpha})` : `rgba(248,250,252,${alpha})`;
        ctx.fill();
      }
    };
    t0 = performance.now();
    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}

// ─── Ambient glow blobs ───────────────────────────────────────────────────────

function AmbientGlow() {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '-10%', right: '-5%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute', bottom: '5%', left: '-10%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)',
        filter: 'blur(50px)',
      }} />
    </div>
  );
}

// ─── Service chip ─────────────────────────────────────────────────────────────

function ServiceChip({ label, accent }: { label: string; accent: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px',
      borderRadius: 6,
      border: `1px solid ${accent}40`,
      background: `${accent}0D`,
      fontSize: '0.72rem',
      fontWeight: 600,
      color: accent,
      letterSpacing: 0.4,
      textTransform: 'uppercase' as const,
      whiteSpace: 'nowrap' as const,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: accent, flexShrink: 0 }} />
      {label}
    </span>
  );
}

// ─── Stat ─────────────────────────────────────────────────────────────────────

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#F8FAFC', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: 'rgba(248,250,252,0.45)', marginTop: 3, lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}

// ─── HeroSection ─────────────────────────────────────────────────────────────

export default function HeroSection() {
  const t = useTranslations('hero');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        background: '#06060F',
        overflow: 'hidden',
      }}
    >
      <Starfield />
      <AmbientGlow />

      {/* Subtle horizontal line grid */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px)',
        backgroundSize: '100% 80px',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1280,
        margin: '0 auto',
        padding: isMobile ? '90px 20px 60px' : '90px 48px 60px',
        flex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? 40 : 48,
      }}>

        {/* ─── Left: copy ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ flex: '1 1 0', minWidth: 0 }}
        >
          {/* Label */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 14px', borderRadius: 6,
            border: '1px solid rgba(0,212,255,0.2)',
            background: 'rgba(0,212,255,0.06)',
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: 2,
            color: '#00D4FF', textTransform: 'uppercase',
            marginBottom: 24,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'heroPulse 2s ease-in-out infinite' }} />
            AI Web Studio
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(2.4rem, 5vw, 4rem)',
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: -1,
            color: '#F8FAFC',
            margin: '0 0 20px',
          }}>
            {t('title_line1')}<br />
            <span style={{ color: '#00D4FF' }}>{t('title_line2')}</span><br />
            {t('title_line3')}
          </h1>

          {/* Subhead */}
          <p style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
            color: 'rgba(248,250,252,0.55)',
            lineHeight: 1.6,
            maxWidth: 520,
            margin: '0 0 28px',
          }}>
            {t('subtitle')}
          </p>

          {/* Service chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 36 }}>
            <ServiceChip label="Разработка сайтов" accent="#00D4FF" />
            <ServiceChip label="AI-ассистент" accent="#818CF8" />
            <ServiceChip label="SEO + Директ" accent="#34D399" />
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: isMobile ? 24 : 36, flexWrap: 'wrap' }}>
            <Stat value="6" label="сайтов запущено" />
            <Stat value="1 200+" label="лидов поймано Юрой" />
            <Stat value="7 дней" label="средний срок сдачи" />
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
            <a
              href="#contact"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 28px',
                borderRadius: 10,
                background: '#FF4D4D',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                letterSpacing: 0.3,
                border: 'none',
                cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
                boxShadow: '0 0 30px rgba(255,77,77,0.35)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 40px rgba(255,77,77,0.5)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 30px rgba(255,77,77,0.35)';
              }}
            >
              Обсудить проект
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a
              href="#portfolio"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 24px',
                borderRadius: 10,
                background: 'transparent',
                color: 'rgba(248,250,252,0.7)',
                fontWeight: 600,
                fontSize: '0.9rem',
                textDecoration: 'none',
                border: '1px solid rgba(248,250,252,0.15)',
                cursor: 'pointer',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(0,212,255,0.4)';
                (e.currentTarget as HTMLAnchorElement).style.color = '#00D4FF';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(248,250,252,0.15)';
                (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(248,250,252,0.7)';
              }}
            >
              Смотреть работы
            </a>
          </div>
        </motion.div>

        {/* ─── Right: Yura HUD ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            flex: isMobile ? 'none' : '0 0 460px',
            width: isMobile ? '100%' : 460,
          }}
        >
          <YuraHUD />
        </motion.div>
      </div>

      {/* Scroll hint */}
      {!isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={{
            position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            zIndex: 1,
          }}
        >
          <span style={{ fontSize: '0.65rem', color: 'rgba(248,250,252,0.3)', letterSpacing: 2, textTransform: 'uppercase' }}>Прокрутите</span>
          <div style={{
            width: 24, height: 38, borderRadius: 12,
            border: '1px solid rgba(248,250,252,0.2)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: '4px 0',
          }}>
            <motion.div
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: 4, height: 8, borderRadius: 2, background: 'rgba(0,212,255,0.6)' }}
            />
          </div>
        </motion.div>
      )}

      <style>{`
        @keyframes heroPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </section>
  );
}

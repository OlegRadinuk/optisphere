'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import type { SphereState } from '@/components/three/NexusSphere';
import { useHeroChat } from '@/components/ai/HeroChatContext';

const NexusSphereLoader = dynamic(() => import('@/components/three/NexusSphere'), {
  ssr: false,
});

const HeroInlineChat = dynamic(() => import('@/components/ai/HeroInlineChat'), {
  ssr: false,
});

// ─── Starfield ───────────────────────────────────────────────────────────────

function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const COUNT = isMobile ? 500 : 2000;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();

    const stars = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 0.3 + Math.random() * 1.0,
      a: 0.15 + Math.random() * 0.75,
      off: Math.random() * Math.PI * 2,
      cyan: Math.random() < 0.045,
    }));

    let t0 = performance.now();
    const draw = (now: number) => {
      animRef.current = requestAnimationFrame(draw);
      const t = (now - t0) * 0.00055;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        const alpha = s.a * (0.35 + 0.65 * Math.sin(t + s.off));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.cyan ? `rgba(6,182,212,${alpha})` : `rgba(248,250,252,${alpha})`;
        ctx.fill();
      }
    };
    const onResize = () => {
      setSize();
      for (const s of stars) {
        s.x = Math.random() * canvas.width;
        s.y = Math.random() * canvas.height;
      }
    };
    window.addEventListener('resize', onResize, { passive: true });
    t0 = performance.now();
    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', onResize);
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

// ─── Orbit rings + floating cards ───────────────────────────────────────────

function SphereDecorations({ size }: { size: number }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          overflow: 'visible',
        }}
        aria-hidden="true"
      >
        <ellipse
          cx={size * 0.5}
          cy={size * 0.5}
          rx={size * 0.56}
          ry={size * 0.17}
          fill="none"
          stroke="rgba(99,102,241,0.22)"
          strokeWidth="1"
          strokeDasharray="4 8"
        />
        <ellipse
          cx={size * 0.5}
          cy={size * 0.5}
          rx={size * 0.42}
          ry={size * 0.12}
          fill="none"
          stroke="rgba(6,182,212,0.18)"
          strokeWidth="1"
          strokeDasharray="3 10"
        />
        <circle r="4" fill="rgba(99,102,241,0.9)">
          <animateMotion dur="22s" repeatCount="indefinite">
            <mpath xlinkHref="#orbit-outer" />
          </animateMotion>
        </circle>
        <ellipse
          id="orbit-outer"
          cx={size * 0.5}
          cy={size * 0.5}
          rx={size * 0.56}
          ry={size * 0.17}
          fill="none"
        />
        <circle r="3" fill="rgba(6,182,212,0.9)">
          <animateMotion
            dur="15s"
            repeatCount="indefinite"
            keyPoints="1;0"
            keyTimes="0;1"
            calcMode="linear"
          >
            <mpath xlinkHref="#orbit-inner" />
          </animateMotion>
        </circle>
        <ellipse
          id="orbit-inner"
          cx={size * 0.5}
          cy={size * 0.5}
          rx={size * 0.55}
          ry={size * 0.16}
          fill="none"
        />
      </svg>

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
        <div
          style={{
            fontSize: '0.59rem',
            color: 'var(--text-muted)',
            marginBottom: 4,
            fontFamily: 'var(--font-orbitron), monospace',
            letterSpacing: '0.1em',
          }}
        >
          AI КОНВЕРСИЯ
        </div>
        <div
          style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            color: 'var(--indigo)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          +340%
        </div>
        <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', marginTop: 2 }}>
          средний рост трафика
        </div>
      </motion.div>

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
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 8px #22c55e',
              display: 'block',
              flexShrink: 0,
              animation: 'live-dot 1.8s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontSize: '0.58rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-orbitron), monospace',
              letterSpacing: '0.1em',
            }}
          >
            ЮРА ОНЛАЙН
          </span>
        </div>
        <div
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--cyan)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          1 200+
        </div>
        <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', marginTop: 2 }}>
          лидов поймано
        </div>
      </motion.div>
    </div>
  );
}

// ─── PreQuestion bubble ─────────────────────────────────────────────────────

interface PreQuestionBubbleProps {
  text: string;
  yesLabel: string;
  noLabel: string;
  onAnswer: (answer: 'yes' | 'no') => void;
  showButtons?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

function PreQuestionBubble({
  text,
  yesLabel,
  noLabel,
  onAnswer,
  showButtons = true,
  onClick,
  compact = false,
}: PreQuestionBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      style={{
        padding: compact ? '0.75rem 1rem' : '0.95rem 1.1rem',
        borderRadius: '16px 16px 16px 4px',
        background: 'rgba(10,10,24,0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow:
          '0 12px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
        maxWidth: 320,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div
        style={{
          fontSize: '0.92rem',
          color: 'var(--text)',
          lineHeight: 1.45,
          fontWeight: 500,
        }}
      >
        {text}
      </div>
      {showButtons && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAnswer('yes');
            }}
            style={{
              flex: '1 1 auto',
              minWidth: 108,
              minHeight: 44,
              borderRadius: 10,
              border: '1px solid rgba(99,102,241,0.4)',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(6,182,212,0.18))',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '0 1rem',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(99,102,241,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {yesLabel}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAnswer('no');
            }}
            style={{
              flex: '1 1 auto',
              minWidth: 108,
              minHeight: 44,
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--text)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '0 1rem',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            }}
          >
            {noLabel}
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── HeroSection ────────────────────────────────────────────────────────────

export default function HeroSection() {
  const t = useTranslations('hero');
  const tAi = useTranslations('ai');
  const { openHeroChat, closeHeroChat } = useHeroChat();

  const [chatOpen, setChatOpen] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubbleHoverText, setBubbleHoverText] = useState(false);
  const [initialUserMessage, setInitialUserMessage] = useState<string | null>(null);
  const [sphereState, setSphereState] = useState<SphereState>('idle');
  const [audioLevel, setAudioLevel] = useState(0);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Pick one of three first messages randomly (memoized once per mount)
  const firstAssistantMessage = useMemo(() => {
    const variants = [
      tAi('first_messages.v1'),
      tAi('first_messages.v2'),
      tAi('first_messages.v3'),
    ];
    const idx = Math.floor(Math.random() * variants.length);
    return variants[idx];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show PreQuestion bubble 4s after mount (if chat not already open)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!chatOpen) setBubbleVisible(true);
    }, 4000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open chat — callback variant (from bubble or hover dwell or tap)
  const openChat = useCallback(
    (userAnswer: string | null) => {
      setInitialUserMessage(userAnswer);
      setChatOpen(true);
      setBubbleVisible(false);
      setSphereState('active');
      openHeroChat();
    },
    [openHeroChat],
  );

  const closeChat = useCallback(() => {
    setChatOpen(false);
    setInitialUserMessage(null);
    setSphereState('idle');
    setAudioLevel(0);
    closeHeroChat();
  }, [closeHeroChat]);

  // Answer from bubble buttons
  const handleBubbleAnswer = useCallback(
    (ans: 'yes' | 'no') => {
      const text = ans === 'yes' ? tAi('pre_question.yes') : tAi('pre_question.no');
      openChat(text);
    },
    [openChat, tAi],
  );

  // Hover dwell — 2s over sphere without click
  const handleSphereHoverDwell = useCallback(() => {
    if (chatOpen) return;
    setBubbleVisible(true);
    setBubbleHoverText(true);
  }, [chatOpen]);

  // Tap on sphere — opens chat directly on mobile / if already showing hover text
  const handleSphereTap = useCallback(() => {
    if (chatOpen) return;
    if (bubbleHoverText) {
      openChat(null);
    } else if (bubbleVisible) {
      // Already showing pre-question bubble — do nothing; user must pick an answer.
    } else {
      // No bubble yet — bring it up early
      setBubbleVisible(true);
    }
  }, [chatOpen, bubbleHoverText, bubbleVisible, openChat]);

  const bubbleText = bubbleHoverText
    ? tAi('pre_question.hover')
    : tAi('pre_question.default');

  // Desktop layout: when chat open, sphere shrinks and moves left; chat takes right
  const sphereSizeDesktop = chatOpen ? 340 : 520;
  const sphereSizeMobile = 260;

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

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          right: '4%',
          transform: 'translateY(-50%)',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(99,102,241,0.14) 0%, rgba(6,182,212,0.07) 40%, transparent 68%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '30%',
          right: '15%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 65%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Content */}
      <div
        className="hero-inner"
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1400,
          margin: '0 auto',
          width: '100%',
          padding: '0 2rem',
          paddingTop: 80,
          paddingBottom: 60,
        }}
      >
        {/* ── Mobile: sphere on top ── */}
        <motion.div
          className="hero-sphere-top"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '2.5rem',
            position: 'relative',
          }}
        >
          <div
            style={{
              filter:
                'drop-shadow(0 0 60px rgba(99,102,241,0.6)) drop-shadow(0 0 120px rgba(6,182,212,0.35))',
              position: 'relative',
            }}
          >
            <NexusSphereLoader
              size={sphereSizeMobile}
              sphereState={sphereState}
              audioLevel={audioLevel}
              onHoverDwell={handleSphereHoverDwell}
              onTap={handleSphereTap}
            />
          </div>

          {/* PreQuestion bubble next to sphere (mobile — below) */}
          <AnimatePresence>
            {bubbleVisible && !chatOpen && (
              <div
                style={{
                  position: 'absolute',
                  bottom: -18,
                  left: '50%',
                  transform: 'translate(-50%, 100%)',
                  zIndex: 5,
                }}
              >
                <PreQuestionBubble
                  text={bubbleText}
                  yesLabel={tAi('pre_question.yes')}
                  noLabel={tAi('pre_question.no')}
                  onAnswer={handleBubbleAnswer}
                  showButtons={!bubbleHoverText}
                  onClick={bubbleHoverText ? () => openChat(null) : undefined}
                  compact
                />
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Two-column row ── */}
        <div
          className="hero-row"
          style={{ display: 'flex', alignItems: 'center', gap: '4rem' }}
        >
          {/* Text column */}
          <div className="hero-text" style={{ flex: '0 0 100%' }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              style={{ marginBottom: '1.75rem' }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.38rem 1rem',
                  borderRadius: 9999,
                  border: '1px solid rgba(99,102,241,0.38)',
                  background: 'rgba(99,102,241,0.1)',
                  fontFamily: 'var(--font-orbitron), monospace',
                  fontSize: '0.63rem',
                  fontWeight: 500,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--indigo)',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--indigo)',
                    boxShadow: '0 0 8px rgba(99,102,241,0.9)',
                    animation: 'pulse-dot 2s ease-in-out infinite',
                  }}
                />
                {t('badge')}
              </span>
            </motion.div>

            <h1 style={{ margin: 0, padding: 0 }}>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  display: 'block',
                  fontSize: 'clamp(2.8rem, 5.8vw, 6rem)',
                  fontWeight: 900,
                  lineHeight: 1.0,
                  letterSpacing: '-0.03em',
                  color: 'var(--text)',
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
                  fontWeight: 900,
                  lineHeight: 1.0,
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
                  fontWeight: 900,
                  lineHeight: 1.0,
                  letterSpacing: '-0.03em',
                  color: 'var(--text)',
                }}
              >
                {t('headline.line3')}
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.68, duration: 0.6 }}
              style={{
                marginTop: '1.75rem',
                fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
                lineHeight: 1.75,
                color: 'var(--text-muted)',
                maxWidth: 500,
              }}
            >
              {t('subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.5 }}
              style={{ marginTop: '2.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
            >
              <a
                href="#calculator"
                className="btn btn-primary"
                style={{ minWidth: 210, fontSize: '0.975rem' }}
              >
                {t('cta.primary')}
              </a>
              <a
                href="#portfolio"
                className="btn btn-ghost"
                style={{ fontSize: '0.975rem' }}
              >
                {t('cta.secondary')}
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.7 }}
              style={{
                marginTop: '2.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              {[
                { value: '47', label: 'сайтов' },
                { value: '1200+', label: 'лидов поймал Юра' },
                { value: '7 дней', label: 'в среднем' },
              ].map((s, i) => (
                <div
                  key={s.value}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                >
                  {i > 0 && (
                    <span
                      style={{
                        width: 1,
                        height: 30,
                        background: 'var(--border)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span
                      style={{
                        fontSize: '1.4rem',
                        fontWeight: 800,
                        color: 'var(--text)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1,
                      }}
                    >
                      {s.value}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {s.label}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Desktop sphere column */}
          <motion.div
            className="hero-sphere-right"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.3, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: 'none',
              justifyContent: 'center',
              alignItems: 'center',
              flexShrink: 0,
              position: 'relative',
              minHeight: 520,
            }}
          >
            <motion.div
              layout
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                filter:
                  'drop-shadow(0 0 80px rgba(99,102,241,0.55)) drop-shadow(0 0 160px rgba(6,182,212,0.28))',
                position: 'relative',
              }}
            >
              <NexusSphereLoader
                size={sphereSizeDesktop}
                sphereState={sphereState}
                audioLevel={audioLevel}
                onHoverDwell={handleSphereHoverDwell}
                onTap={handleSphereTap}
              />
            </motion.div>
            {!chatOpen && <SphereDecorations size={520} />}

            {/* PreQuestion bubble (desktop — below sphere) */}
            <AnimatePresence>
              {bubbleVisible && !chatOpen && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: -30,
                    left: '50%',
                    transform: 'translate(-50%, 100%)',
                    zIndex: 5,
                  }}
                >
                  <PreQuestionBubble
                    text={bubbleText}
                    yesLabel={tAi('pre_question.yes')}
                    noLabel={tAi('pre_question.no')}
                    onAnswer={handleBubbleAnswer}
                    showButtons={!bubbleHoverText}
                    onClick={bubbleHoverText ? () => openChat(null) : undefined}
                  />
                </div>
              )}
            </AnimatePresence>

            {/* Inline chat panel (desktop, next to sphere) */}
            <AnimatePresence>
              {chatOpen && !isMobile && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: `calc(50% + ${sphereSizeDesktop / 2 + 24}px)`,
                    transform: 'translateY(-50%)',
                    width: 460,
                    maxWidth: 'calc(100vw - 3rem)',
                    height: 620,
                    zIndex: 10,
                  }}
                >
                  <HeroInlineChat
                    isMobile={false}
                    initialUserMessage={initialUserMessage}
                    firstAssistantMessage={firstAssistantMessage}
                    onClose={closeChat}
                    onSphereStateChange={setSphereState}
                    onAudioLevel={setAudioLevel}
                  />
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Mobile inline chat (fixed bottom) */}
      <AnimatePresence>
        {chatOpen && isMobile && (
          <HeroInlineChat
            isMobile
            initialUserMessage={initialUserMessage}
            firstAssistantMessage={firstAssistantMessage}
            onClose={closeChat}
            onSphereStateChange={setSphereState}
            onAudioLevel={setAudioLevel}
          />
        )}
      </AnimatePresence>

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 130,
          background: 'linear-gradient(to bottom, transparent, var(--base))',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

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

'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import SectionIntro from '@/components/hud/SectionIntro';

// ─── Frame 0: AE2 energy nodes + typing brief ───────────────────────────────

const BRIEF_TEXT =
  'КЛИЕНТ: Стоматология «Белая улыбка»\nЗАДАЧА: сайт с онлайн-записью\nЦА: 25–45, семьи\nКОНКУРЕНТЫ: 3 в радиусе 2км\nБЮДЖЕТ: от 80 000 ₽';

const AE2_NODES: { cx: number; cy: number; delay: number }[] = [
  { cx: 8,  cy: 12, delay: 0    },
  { cx: 88, cy: 8,  delay: 400  },
  { cx: 92, cy: 88, delay: 800  },
  { cx: 6,  cy: 85, delay: 200  },
  { cx: 50, cy: 5,  delay: 600  },
  { cx: 50, cy: 95, delay: 1000 },
  { cx: 20, cy: 50, delay: 300  },
  { cx: 80, cy: 50, delay: 700  },
];

const AE2_LINES: [number, number][] = [
  [0, 6], [0, 4], [6, 1], [4, 1],
  [6, 3], [3, 5], [5, 2], [2, 7],
  [7, 1], [4, 7],
];

function Frame0({ active }: { active: boolean }) {
  const [typed, setTyped] = useState('');
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    if (!active) { setTyped(''); return; }
    let i = 0;
    setTyped('');
    const iv = setInterval(() => {
      i++;
      setTyped(BRIEF_TEXT.slice(0, i));
      if (i >= BRIEF_TEXT.length) clearInterval(iv);
    }, 30);
    return () => clearInterval(iv);
  }, [active]);

  useEffect(() => {
    const iv = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* dot grid background */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
        <defs>
          <pattern id="ae2-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.5" fill="rgba(232,32,32,0.15)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ae2-dots)" />
        {/* energy lines */}
        {AE2_LINES.map(([a, b], li) => {
          const na = AE2_NODES[a];
          const nb = AE2_NODES[b];
          return (
            <line
              key={li}
              x1={`${na.cx}%`} y1={`${na.cy}%`}
              x2={`${nb.cx}%`} y2={`${nb.cy}%`}
              stroke="rgba(232,32,32,0.3)"
              strokeWidth="1"
              style={{
                animation: `ae2-line-blink 2.2s ease-in-out ${(li * 180) % 1400}ms infinite`,
              }}
            />
          );
        })}
        {/* nodes */}
        {AE2_NODES.map((n, i) => (
          <g key={i}>
            <circle
              cx={`${n.cx}%`}
              cy={`${n.cy}%`}
              r="5"
              fill="var(--op-accent)"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(232,32,32,0.8))',
                animation: `ae2-pulse 2s ease-in-out ${n.delay}ms infinite`,
              }}
            />
          </g>
        ))}
      </svg>

      {/* brief window */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60%',
        minHeight: 160,
        border: '1px solid var(--op-border-strong)',
        borderRadius: 8,
        background: 'rgba(6,6,6,0.88)',
        backdropFilter: 'blur(8px)',
        overflow: 'hidden',
        padding: '20px 24px 24px',
      }}>
        {/* scan line */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 0,
          height: 2,
          background: 'rgba(232,32,32,0.6)',
          animation: 'ae2-scan 2.5s linear infinite',
          zIndex: 2,
        }} />
        <pre style={{
          margin: 0,
          font: "400 12px/1.7 'JetBrains Mono',monospace",
          color: 'var(--op-text)',
          whiteSpace: 'pre-wrap',
          position: 'relative',
          zIndex: 1,
        }}>{typed}</pre>
        <div style={{
          marginTop: 12,
          font: "400 11px 'JetBrains Mono',monospace",
          color: 'var(--op-accent)',
          letterSpacing: '.12em',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          zIndex: 1,
          position: 'relative',
        }}>
          ANALYZING...
          <span style={{ opacity: cursor ? 1 : 0, transition: 'opacity 80ms' }}>█</span>
        </div>
      </div>

      <style>{`
        @keyframes ae2-pulse {
          0%,100%{opacity:.4} 50%{opacity:1}
        }
        @keyframes ae2-line-blink {
          0%,100%{opacity:.15} 50%{opacity:.7}
        }
        @keyframes ae2-scan {
          0%{transform:translateY(0)} 100%{transform:translateY(160px)}
        }
      `}</style>
    </div>
  );
}

// ─── Frame 1: Wireframe builder ──────────────────────────────────────────────

const WF_BLOCKS = [
  { label: 'NAVBAR',  h: 40,  w: '100%', delay: 0    },
  { label: 'HERO',    h: 100, w: '100%', delay: 300  },
  { label: 'CARD 1',  h: 80,  w: '31%',  delay: 600  },
  { label: 'CARD 2',  h: 80,  w: '31%',  delay: 700  },
  { label: 'CARD 3',  h: 80,  w: '31%',  delay: 800  },
  { label: 'FOOTER',  h: 48,  w: '100%', delay: 1100 },
];

function Frame1({ active }: { active: boolean }) {
  const [visible, setVisible] = useState<boolean[]>(WF_BLOCKS.map(() => false));
  const [blockCount, setBlockCount] = useState(0);

  useEffect(() => {
    if (!active) {
      setVisible(WF_BLOCKS.map(() => false));
      setBlockCount(0);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    WF_BLOCKS.forEach((b, i) => {
      const t = setTimeout(() => {
        setVisible(prev => { const next = [...prev]; next[i] = true; return next; });
        setBlockCount(c => c + 1);
      }, b.delay);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const cards = [2, 3, 4];

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 48px' }}>
      {/* left bus */}
      <div style={{ position: 'absolute', left: 24, top: 24, bottom: 24, width: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        {WF_BLOCKS.map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: visible[i] ? 'var(--op-accent)' : 'var(--op-text-faint)',
              boxShadow: visible[i] ? '0 0 0 3px rgba(232,32,32,0.25)' : 'none',
              transition: 'all 300ms',
              flexShrink: 0,
            }} />
            {i < WF_BLOCKS.length - 1 && (
              <div style={{ flex: 1, width: 1, background: visible[i] ? 'var(--op-accent)' : 'var(--op-border)', transition: 'background 300ms', marginTop: 2, marginBottom: 2 }} />
            )}
          </div>
        ))}
      </div>

      {/* blocks */}
      <div style={{ flex: 1, marginLeft: 32, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* navbar */}
        <WireBlock visible={visible[0]} h={WF_BLOCKS[0].h} w="100%" label="NAVBAR" />
        {/* hero */}
        <WireBlock visible={visible[1]} h={WF_BLOCKS[1].h} w="100%" label="HERO" />
        {/* cards */}
        <div style={{ display: 'flex', gap: 8 }}>
          {cards.map((bi, ci) => (
            <WireBlock key={ci} visible={visible[bi]} h={80} w="calc(33.3% - 6px)" label={WF_BLOCKS[bi].label} />
          ))}
        </div>
        {/* footer */}
        <WireBlock visible={visible[5]} h={WF_BLOCKS[5].h} w="100%" label="FOOTER" />
      </div>

      {/* block counter */}
      <div style={{
        position: 'absolute', top: 16, right: 16,
        font: "500 11px 'JetBrains Mono',monospace",
        color: 'var(--op-accent)',
        letterSpacing: '.12em',
      }}>
        BLOCKS: {blockCount}/{WF_BLOCKS.length}
      </div>
    </div>
  );
}

function WireBlock({ visible, h, w, label }: { visible: boolean; h: number; w: string; label: string }) {
  return (
    <div style={{
      width: w,
      height: h,
      borderRadius: 4,
      border: '1px dashed rgba(232,32,32,0.4)',
      background: 'rgba(232,32,32,0.04)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(6px)',
      transition: 'opacity 300ms ease, transform 300ms ease',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '8px 12px',
      gap: 5,
      overflow: 'hidden',
      position: 'relative',
    }}>
      <span style={{ font: "500 9px 'JetBrains Mono',monospace", color: 'rgba(232,32,32,0.5)', letterSpacing: '.1em' }}>{label}</span>
      <div style={{ height: 5, width: '60%', background: 'var(--op-border-strong)', borderRadius: 2 }} />
      <div style={{ height: 5, width: '35%', background: 'var(--op-border)', borderRadius: 2 }} />
    </div>
  );
}

// ─── Frame 2: Color scheme switcher ─────────────────────────────────────────

const COLOR_SCHEMES = [
  { name: 'Dark Red',  bg: '#060606', accent: '#e82020', label: 'OPTISPHERE' },
  { name: 'Ocean',     bg: '#0a1628', accent: '#3b82f6', label: 'OCEAN'      },
  { name: 'Forest',    bg: '#0a1a0f', accent: '#22c55e', label: 'FOREST'     },
  { name: 'Gold',      bg: '#1a1200', accent: '#f59e0b', label: 'GOLD'       },
];

function Frame2({ active }: { active: boolean }) {
  const [schemeIdx, setSchemeIdx] = useState(0);
  const [checked, setChecked] = useState(0);

  useEffect(() => {
    if (!active) { setSchemeIdx(0); setChecked(0); return; }
    const iv = setInterval(() => {
      setSchemeIdx(i => (i + 1) % COLOR_SCHEMES.length);
      setChecked(c => c + 1);
    }, 1200);
    return () => clearInterval(iv);
  }, [active]);

  const sc = COLOR_SCHEMES[schemeIdx];

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 32 }}>
      {/* mini site */}
      <div style={{
        width: 300, height: 200,
        background: sc.bg,
        borderRadius: 10,
        border: `1px solid ${sc.accent}40`,
        overflow: 'hidden',
        transition: 'background 600ms ease',
        boxShadow: `0 0 32px ${sc.accent}22`,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* navbar */}
        <div style={{ height: 36, background: `${sc.accent}18`, borderBottom: `1px solid ${sc.accent}30`, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8, transition: 'all 600ms ease' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc.accent, transition: 'background 600ms ease' }} />
          <div style={{ width: 60, height: 5, borderRadius: 2, background: `${sc.accent}60`, transition: 'background 600ms ease' }} />
        </div>
        {/* hero area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16 }}>
          <div style={{ font: "700 13px 'JetBrains Mono',monospace", color: '#ffffff', letterSpacing: '.05em' }}>ВАША СТУДИЯ</div>
          <div style={{ width: 80, height: 24, borderRadius: 4, background: sc.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 600ms ease' }}>
            <span style={{ font: "600 9px 'JetBrains Mono',monospace", color: '#fff', letterSpacing: '.08em' }}>НАЧАТЬ</span>
          </div>
        </div>
      </div>

      {/* scheme tabs */}
      <div style={{ display: 'flex', gap: 8 }}>
        {COLOR_SCHEMES.map((s, i) => (
          <div
            key={i}
            style={{
              padding: '5px 12px',
              borderRadius: 6,
              border: i === schemeIdx ? `1px solid ${s.accent}` : '1px solid var(--op-border)',
              background: i === schemeIdx ? `${s.accent}20` : 'transparent',
              font: "500 10px 'JetBrains Mono',monospace",
              color: i === schemeIdx ? s.accent : 'var(--op-text-muted)',
              transition: 'all 400ms ease',
              letterSpacing: '.08em',
            }}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* counter */}
      <div style={{ font: "400 11px 'JetBrains Mono',monospace", color: 'var(--op-text-muted)', letterSpacing: '.1em' }}>
        → {Math.min(checked, 47)} ВАРИАНТОВ ПРОВЕРЕНО
      </div>
    </div>
  );
}

// ─── Frame 3: Opti chat dialog ───────────────────────────────────────────────

interface ChatMsg {
  role: 'user' | 'opti';
  text: string;
  delay: number;
}

const CHAT_MESSAGES: ChatMsg[] = [
  { role: 'user',  text: 'Сколько стоит сайт для стоматологии?',                                                       delay: 0    },
  { role: 'opti',  text: 'Для клиники вашего уровня — от 90 000 ₽. Хотите узнать, что входит?',                        delay: 700  },
  { role: 'user',  text: 'Да, что конкретно?',                                                                         delay: 1600 },
  { role: 'opti',  text: 'SEO-оптимизация, онлайн-запись, виджет для WhatsApp, 3 месяца поддержки. Когда удобно обсудить?', delay: 2300 },
];

function TypingDots() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setPhase(p => (p + 1) % 3), 350);
    return () => clearInterval(iv);
  }, []);
  return (
    <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center', height: 14 }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--op-text-muted)', opacity: i === phase ? 1 : 0.3, transition: 'opacity 200ms' }} />
      ))}
    </span>
  );
}

function Frame3({ active }: { active: boolean }) {
  const [shown, setShown] = useState<number[]>([]);
  const [typing, setTyping] = useState(false);
  const [pulseDot, setPulseDot] = useState(true);

  useEffect(() => {
    if (!active) { setShown([]); setTyping(false); return; }

    const timers: ReturnType<typeof setTimeout>[] = [];
    CHAT_MESSAGES.forEach((m, i) => {
      if (m.role === 'opti' && i > 0) {
        // show typing indicator 500ms before the message
        const typingStart = m.delay - 500;
        if (typingStart >= 0) {
          timers.push(setTimeout(() => setTyping(true), typingStart));
        }
      }
      timers.push(setTimeout(() => {
        setTyping(false);
        setShown(prev => [...prev, i]);
      }, m.delay));
    });
    return () => timers.forEach(clearTimeout);
  }, [active]);

  useEffect(() => {
    const iv = setInterval(() => setPulseDot(p => !p), 600);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, font: "500 11px 'JetBrains Mono',monospace", color: 'var(--op-text-secondary)', letterSpacing: '.1em' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--op-accent)', boxShadow: '0 0 0 3px rgba(232,32,32,0.25)', opacity: pulseDot ? 1 : 0.4, transition: 'opacity 300ms', display: 'inline-block' }} />
        ◆ ОПТИ · AI-КОНСУЛЬТАНТ · ONLINE
      </div>

      {/* chat */}
      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {CHAT_MESSAGES.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '82%',
              padding: '10px 14px',
              borderRadius: 10,
              font: "400 13px 'Inter',sans-serif",
              lineHeight: 1.5,
              border: m.role === 'user' ? '1px solid rgba(232,32,32,0.2)' : '1px solid var(--op-border)',
              background: m.role === 'user' ? 'rgba(232,32,32,0.08)' : 'var(--op-surface-overlay)',
              color: 'var(--op-text)',
              opacity: shown.includes(i) ? 1 : 0,
              transform: shown.includes(i) ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 300ms ease, transform 300ms ease',
            }}
          >
            {m.text}
          </div>
        ))}
        {typing && (
          <div style={{
            alignSelf: 'flex-start',
            padding: '10px 14px',
            borderRadius: 10,
            border: '1px solid var(--op-border)',
            background: 'var(--op-surface-overlay)',
          }}>
            <TypingDots />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Frame 4: System ready ───────────────────────────────────────────────────

const RECEIPT_LINES = [
  '✓ Сайт на домене клиента',
  '✓ AI-ассистент Опти настроен',
  '✓ SEO: 47 страниц проиндексировано',
  '✓ Первые 3 лида в Telegram',
];

function Frame4({ active }: { active: boolean }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [receiptVisible, setReceiptVisible] = useState<boolean[]>(RECEIPT_LINES.map(() => false));

  useEffect(() => {
    if (!active) {
      setProgress(0);
      setDone(false);
      setReceiptVisible(RECEIPT_LINES.map(() => false));
      return;
    }

    // animate progress bar
    const start = performance.now();
    const duration = 1500;
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setProgress(p * 100);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDone(true);
        // reveal receipt lines
        RECEIPT_LINES.forEach((_, i) => {
          setTimeout(() => {
            setReceiptVisible(prev => { const next = [...prev]; next[i] = true; return next; });
          }, 500 + i * 100);
        });
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 20 }}>
      {/* progress bar */}
      <div style={{ width: '70%', height: 10, background: 'var(--op-surface-overlay)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'var(--op-accent)', borderRadius: 999, width: `${progress}%`, transition: 'width 40ms linear' }} />
      </div>

      {/* big title */}
      <div style={{
        font: "700 36px 'Oxanium',sans-serif",
        color: 'var(--op-text)',
        letterSpacing: '-0.02em',
        opacity: done ? 1 : 0,
        transform: done ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 400ms ease, transform 400ms ease',
      }}>
        СИСТЕМА ГОТОВА
      </div>

      {/* tags */}
      <div style={{
        display: 'flex',
        gap: 16,
        font: "400 11px 'JetBrains Mono',monospace",
        color: 'var(--op-text-muted)',
        letterSpacing: '.12em',
        opacity: done ? 1 : 0,
        transition: 'opacity 400ms ease 200ms',
      }}>
        <span>САЙТ</span>
        <span style={{ color: 'var(--op-border-strong)' }}>·</span>
        <span>AI-АССИСТЕНТ</span>
        <span style={{ color: 'var(--op-border-strong)' }}>·</span>
        <span>SEO</span>
      </div>

      {/* receipt card */}
      <div style={{
        border: '1px solid var(--op-border)',
        borderRadius: 10,
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minWidth: 280,
        opacity: done ? 1 : 0,
        transition: 'opacity 300ms ease 300ms',
      }}>
        {RECEIPT_LINES.map((line, i) => (
          <div
            key={i}
            style={{
              font: "400 13px 'JetBrains Mono',monospace",
              color: receiptVisible[i] ? 'var(--op-text)' : 'transparent',
              transition: 'color 250ms ease',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <span style={{ color: 'var(--op-accent)' }}>✓</span>
            {line.replace('✓ ', '')}
          </div>
        ))}
      </div>

      {/* CTA button */}
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('opti-open'))}
        style={{
          padding: '12px 28px',
          borderRadius: 8,
          background: 'var(--op-accent)',
          color: '#fff',
          border: 'none',
          font: "600 14px 'Oxanium',sans-serif",
          letterSpacing: '.04em',
          cursor: 'pointer',
          opacity: done ? 1 : 0,
          transition: 'opacity 400ms ease 600ms, background 150ms ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--op-accent-hover)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--op-accent)'; }}
      >
        Хочу такой же →
      </button>
    </div>
  );
}

// ─── FrameVisual dispatcher ──────────────────────────────────────────────────

function FrameVisual({ idx }: { idx: number }) {
  return (
    <div key={idx} style={{ position: 'absolute', inset: 0 }}>
      {idx === 0 && <Frame0 active={true} />}
      {idx === 1 && <Frame1 active={true} />}
      {idx === 2 && <Frame2 active={true} />}
      {idx === 3 && <Frame3 active={true} />}
      {idx === 4 && <Frame4 active={true} />}
    </div>
  );
}

// ─── Main section ────────────────────────────────────────────────────────────

const FRAME_COUNT = 5;
const TICKS_PER_FRAME = 3; // scroll ticks needed to advance one frame

export default function LiveDemoSection() {
  const t = useTranslations('demo');

  const idxRef = useRef(0);
  const [idx, setIdxState] = useState(0);
  const setIdx = useCallback((n: number) => {
    idxRef.current = n;
    setIdxState(n);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [prevPressed, setPrevPressed] = useState(false);
  const [nextPressed, setNextPressed] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const tickCountRef = useRef(0);
  const lastTickTimeRef = useRef(0);

  const FRAMES = [
    { pct: '0%',   label: t('frames.f0') },
    { pct: '25%',  label: t('frames.f1') },
    { pct: '50%',  label: t('frames.f2') },
    { pct: '75%',  label: t('frames.f3') },
    { pct: '100%', label: t('frames.f4') },
  ];

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const onWheel = (e: WheelEvent) => {
      const sticky = stickyRef.current;
      const wrapper = wrapperRef.current;
      if (!sticky || !wrapper) return;

      const rect = sticky.getBoundingClientRect();
      const isPinned = rect.top <= 1 && rect.bottom >= window.innerHeight - 1;

      if (!isPinned) return;

      const now = Date.now();
      const current = idxRef.current;

      // edge cases: let natural scroll through
      if (e.deltaY < 0 && current === 0) return;
      if (e.deltaY > 0 && current === FRAME_COUNT - 1) return;

      e.preventDefault();

      // Reset tick counter if direction changed or too much time passed (300ms)
      if (now - lastTickTimeRef.current > 300) {
        tickCountRef.current = 0;
      }
      lastTickTimeRef.current = now;

      // Accumulate ticks — advance frame every TICKS_PER_FRAME ticks
      tickCountRef.current += 1;
      if (tickCountRef.current < TICKS_PER_FRAME) return;
      tickCountRef.current = 0;

      const next = e.deltaY > 0
        ? Math.min(FRAME_COUNT - 1, current + 1)
        : Math.max(0, current - 1);

      setIdx(next);

      // keep the wrapper scroll position consistent with frame index
      // so sticky computes correctly after wheel ends
      if (wrapperRef.current) {
        const targetScrollY = wrapperRef.current.offsetTop + next * window.innerHeight;
        window.scrollTo({ top: targetScrollY, behavior: 'instant' });
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [isMobile, setIdx]);

  return (
    <section
      id="demo"
      style={{
        background: 'var(--op-surface)',
        borderTop: '1px solid var(--op-border)',
        borderBottom: '1px solid var(--op-border)',
      }}
    >
      <div
        ref={wrapperRef}
        className="demo-wrapper"
        style={{ height: `${FRAME_COUNT * 100}vh` }}
      >
        <div
          ref={stickyRef}
          className="demo-sticky"
          style={{
            position: 'sticky',
            top: '80px',
            height: 'calc(100vh - 80px)',
            display: 'flex',
            flexDirection: 'column',
            maxWidth: 1280,
            margin: '0 auto',
            padding: '32px 48px 48px',
          }}
        >
          <SectionIntro code="02" cmd="opti.trace()" title={t('title')} sub={t('sub')} crimson />

          {/* progress bar */}
          <div style={{ height: 2, background: 'var(--op-border)', borderRadius: 1, marginBottom: 12, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--op-accent)', borderRadius: 1, width: `${((idx + 1) / FRAME_COUNT) * 100}%`, transition: 'width 400ms ease' }} />
          </div>

          <div
            className="demo-grid"
            style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) 280px', gap: 48, flex: 1, minHeight: 0 }}
          >
            {/* Visual panel */}
            <div style={{ position: 'relative', background: 'var(--op-surface-elevated)', borderRadius: 16, border: '1px solid var(--op-border)', overflow: 'hidden' }}>
              <FrameVisual idx={idx} />

              {/* HUD badge */}
              <div style={{
                position: 'absolute', top: 24, left: 24,
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 16px', borderRadius: 10,
                background: 'rgba(10,14,20,.65)', backdropFilter: 'blur(10px)',
                border: '1px solid var(--op-border)',
                zIndex: 10,
              }}>
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
                    {i < FRAMES.length - 1 && (
                      <div style={{ position: 'absolute', left: 5, top: 28, bottom: -16, width: 2, background: past ? 'var(--op-accent)' : 'var(--op-border)', transition: 'background 400ms' }} />
                    )}
                    <span style={{
                      width: 12, height: 12, borderRadius: '50%', marginTop: 4, flexShrink: 0, position: 'relative', zIndex: 1,
                      background: active || past ? 'var(--op-accent)' : 'transparent',
                      border: active || past ? '1px solid var(--op-accent)' : '1px solid var(--op-border-strong)',
                      boxShadow: active ? '0 0 0 4px var(--op-accent-faint)' : 'none',
                      transition: 'all 300ms',
                      display: 'inline-block',
                    }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ font: "500 10px/1 'JetBrains Mono',monospace", color: active ? 'var(--op-accent)' : past ? 'var(--op-text-muted)' : 'var(--op-text-faint)', letterSpacing: '.14em', transition: 'color 300ms' }}>{f.pct}</span>
                      <span style={{ font: "500 14px/1.3 'Oxanium',sans-serif", color: active ? 'var(--op-text)' : past ? 'var(--op-text-secondary)' : 'var(--op-text-faint)', letterSpacing: '-0.01em', transition: 'color 300ms' }}>{f.label}</span>
                    </div>
                  </div>
                );
              })}

              {/* scroll hint */}
              <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8, opacity: idx === 0 ? 1 : 0, transition: 'opacity 400ms' }}>
                <span style={{ font: "400 11px/1 'JetBrains Mono',monospace", color: 'var(--op-text-faint)', letterSpacing: '.1em' }}>↓ SCROLL</span>
              </div>

              {/* mobile buttons */}
              {isMobile && (
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button
                    onClick={() => setIdx(Math.max(0, idx - 1))}
                    disabled={idx === 0}
                    onPointerDown={() => setPrevPressed(true)}
                    onPointerUp={() => setPrevPressed(false)}
                    onPointerLeave={() => setPrevPressed(false)}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 8,
                      border: '1px solid var(--op-border)',
                      background: prevPressed ? 'var(--op-accent-subtle)' : 'var(--op-surface-overlay)',
                      color: prevPressed ? 'var(--op-accent)' : 'var(--op-text-secondary)',
                      font: "500 13px 'JetBrains Mono',monospace",
                      cursor: idx === 0 ? 'not-allowed' : 'pointer',
                      opacity: idx === 0 ? 0.4 : 1,
                      transition: 'background 150ms ease, color 150ms ease',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    ← Назад
                  </button>
                  <button
                    onClick={() => setIdx(Math.min(FRAME_COUNT - 1, idx + 1))}
                    disabled={idx === FRAME_COUNT - 1}
                    onPointerDown={() => setNextPressed(true)}
                    onPointerUp={() => setNextPressed(false)}
                    onPointerLeave={() => setNextPressed(false)}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 8,
                      border: nextPressed ? '1px solid var(--op-border-accent)' : '1px solid var(--op-border)',
                      background: nextPressed ? 'var(--op-accent-subtle)' : 'var(--op-surface-overlay)',
                      color: nextPressed ? 'var(--op-accent)' : 'var(--op-text-secondary)',
                      font: "500 13px 'JetBrains Mono',monospace",
                      cursor: idx === FRAME_COUNT - 1 ? 'not-allowed' : 'pointer',
                      opacity: idx === FRAME_COUNT - 1 ? 0.4 : 1,
                      transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
                      WebkitTapHighlightColor: 'transparent',
                    }}
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

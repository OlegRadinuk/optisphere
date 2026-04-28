'use client';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import SectionIntro from '@/components/hud/SectionIntro';

// Scroll height per frame — determines how much scrolling maps to one full frame animation
const VH_PER_FRAME = 130;
const FRAME_COUNT  = 5;

// ════════════════════════════════════════ FRAME 0 — AI reads the brief
const BRIEF_LINES = [
  { prefix: 'КЛИЕНТ',    content: 'Стоматология «Белая улыбка»' },
  { prefix: 'ЗАДАЧА',    content: 'Сайт с онлайн-записью'       },
  { prefix: 'ЦА',        content: 'Пациенты 25–45, семьи'       },
  { prefix: 'КОНКУРЕНТ', content: '3 клиники в радиусе 2 км'    },
  { prefix: 'БЮДЖЕТ',    content: 'от 80 000 ₽'                 },
];
const BRIEF_TAGS = [
  { k: 'ниша',    v: 'медицина' },
  { k: 'цель',    v: 'лиды'     },
  { k: 'сегмент', v: 'premium'  },
  { k: 'срок',    v: '7 дней'   },
];
const FULL_BRIEF = BRIEF_LINES.map(l => `${l.prefix}: ${l.content}`).join('\n');

function Frame0({ progress }: { progress: number }) {
  const [blink, setBlink] = useState(true);
  useEffect(() => {
    const iv = setInterval(() => setBlink(b => !b), 530);
    return () => clearInterval(iv);
  }, []);

  // typing: 0→75% of frame progress
  const typingP = Math.min(progress / 0.75, 1);
  const charsTyped = Math.floor(typingP * FULL_BRIEF.length);
  const typed = FULL_BRIEF.slice(0, charsTyped);
  const lines = typed.split('\n');
  const isTyping = typingP < 1;

  // tags: appear 60%→100% of frame progress
  const tagP = Math.max(0, (progress - 0.60) / 0.40);
  const tagsShown = Math.floor(tagP * BRIEF_TAGS.length + 0.15);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', overflow: 'hidden' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} aria-hidden>
        <defs>
          <pattern id="f0dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(232,32,32,0.1)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#f0dots)" />
      </svg>

      {/* scan line — decorative CSS animation, independent of scroll */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 1, zIndex: 2, pointerEvents: 'none',
        background: 'linear-gradient(90deg, transparent, rgba(232,32,32,0.5) 50%, transparent)',
        animation: 'f0scan 3s linear infinite',
      }} />

      {/* terminal */}
      <div style={{ flex: 1, padding: '32px 28px', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        <div style={{ font: "500 9px/1 'JetBrains Mono',monospace", color: 'rgba(232,32,32,0.5)', letterSpacing: '.22em', marginBottom: 24 }}>
          OPTI · BRIEF · ANALYSIS
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {lines.map((line, li) => {
            const colon = line.indexOf(': ');
            const isLast = li === lines.length - 1;
            return (
              <div key={li} style={{ font: "400 12px/1.9 'JetBrains Mono',monospace" }}>
                {colon === -1 ? (
                  <span style={{ color: 'rgba(232,32,32,0.65)' }}>{line}</span>
                ) : (
                  <>
                    <span style={{ color: 'rgba(232,32,32,0.65)' }}>{line.slice(0, colon + 2)}</span>
                    <span style={{ color: 'rgba(255,255,255,0.9)' }}>{line.slice(colon + 2)}</span>
                  </>
                )}
                {isLast && isTyping && (
                  <span style={{
                    display: 'inline-block', width: 7, height: 13,
                    background: 'var(--op-accent)', marginLeft: 1,
                    opacity: blink ? 1 : 0, verticalAlign: 'text-bottom',
                    transition: 'opacity 60ms',
                  }} />
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, opacity: typingP > 0 ? 1 : 0, transition: 'opacity 400ms' }}>
          <span style={{ width: 5, height: 5, background: 'var(--op-accent)', borderRadius: '50%', display: 'inline-block', animation: 'hudPulse 1.4s ease-in-out infinite' }} />
          <span style={{ font: "500 9px/1 'JetBrains Mono',monospace", color: 'var(--op-accent)', letterSpacing: '.2em' }}>
            {typingP < 1 ? 'ANALYZING...' : 'ANALYSIS COMPLETE'}
          </span>
        </div>
      </div>

      {/* tags */}
      <div style={{
        width: 172, borderLeft: '1px solid rgba(232,32,32,0.18)',
        padding: '32px 18px', display: 'flex', flexDirection: 'column', gap: 10,
        background: 'rgba(232,32,32,0.025)', position: 'relative', zIndex: 1, flexShrink: 0,
      }}>
        <div style={{ font: "500 8px/1 'JetBrains Mono',monospace", color: 'rgba(232,32,32,0.45)', letterSpacing: '.22em', marginBottom: 4 }}>
          DETECTED TAGS
        </div>
        {BRIEF_TAGS.map((tag, i) => {
          const show = i < tagsShown;
          return (
            <div key={i} style={{
              padding: '8px 10px', borderRadius: 4,
              border: `1px solid ${show ? 'rgba(232,32,32,0.35)' : 'rgba(232,32,32,0.08)'}`,
              background: show ? 'rgba(232,32,32,0.07)' : 'transparent',
              opacity: show ? 1 : 0.25,
              transition: 'all 400ms ease',
            }}>
              <span style={{ font: "500 9px/1.5 'JetBrains Mono',monospace", color: show ? 'rgba(232,32,32,0.6)' : 'var(--op-text-faint)', display: 'block', transition: 'color 400ms' }}>
                {tag.k}:
              </span>
              <span style={{ font: "600 11px/1 'JetBrains Mono',monospace", color: show ? 'var(--op-text)' : 'var(--op-text-faint)', display: 'block', marginTop: 3, transition: 'color 400ms' }}>
                {tag.v}
              </span>
            </div>
          );
        })}
      </div>

      <style>{`@keyframes f0scan { 0%{top:0%} 100%{top:100%} }`}</style>
    </div>
  );
}

// ════════════════════════════════════════ FRAME 1 — wireframe builder
const WF_BLOCKS = [
  { label: 'HEADER',  y: '0%',  h: '12%', threshold: 0.10 },
  { label: 'HERO',    y: '14%', h: '28%', threshold: 0.28 },
  { label: 'УСЛУГИ',  y: '44%', h: '20%', threshold: 0.46 },
  { label: 'КЕЙСЫ',  y: '66%', h: '16%', threshold: 0.64 },
  { label: 'FOOTER',  y: '84%', h: '8%',  threshold: 0.82 },
];

function Frame1({ progress }: { progress: number }) {
  const visibleCount = WF_BLOCKS.filter(b => progress >= b.threshold).length;

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 56px' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} aria-hidden>
        <defs>
          <pattern id="f1grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(232,32,32,0.06)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#f1grid)" />
      </svg>

      {/* counter */}
      <div style={{ position: 'absolute', top: 20, left: 24, font: "600 10px/1 'JetBrains Mono',monospace", color: 'var(--op-accent)', letterSpacing: '.14em' }}>
        BLOCK {visibleCount}/{WF_BLOCKS.length}
      </div>

      {/* browser window */}
      <div style={{ position: 'relative', width: '52%', height: '88%', border: '1px dashed rgba(232,32,32,0.22)', borderRadius: 6 }}>
        <div style={{
          position: 'absolute', top: -26, left: 0, right: 0, height: 22,
          border: '1px dashed rgba(232,32,32,0.18)', borderBottom: 'none',
          display: 'flex', alignItems: 'center', paddingLeft: 8, gap: 5, borderRadius: '4px 4px 0 0',
        }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px dashed rgba(232,32,32,0.2)' }} />)}
        </div>

        {WF_BLOCKS.map((b, i) => {
          const show = progress >= b.threshold;
          // smooth opacity based on how far past the threshold we are
          const blockP = show ? Math.min((progress - b.threshold) / 0.1, 1) : 0;
          return (
            <div key={b.label} style={{
              position: 'absolute', left: '4%', right: '4%', top: b.y, height: b.h,
              border: '1px dashed rgba(232,32,32,0.4)',
              background: `rgba(232,32,32,${0.025 + blockP * 0.04})`,
              borderRadius: 3,
              opacity: blockP,
              transform: `scaleY(${0.2 + blockP * 0.8})`,
              transformOrigin: 'top center',
              transition: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ font: "600 8px 'JetBrains Mono',monospace", color: 'rgba(232,32,32,0.55)', letterSpacing: '.18em', opacity: blockP }}>{b.label}</span>
            </div>
          );
        })}
      </div>

      {/* checklist */}
      <div style={{ position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {WF_BLOCKS.map((b, i) => {
          const show = progress >= b.threshold;
          return (
            <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: show ? 'var(--op-accent)' : 'transparent',
                border: `1px solid ${show ? 'var(--op-accent)' : 'var(--op-border-strong)'}`,
                boxShadow: show ? '0 0 0 3px rgba(232,32,32,0.18)' : 'none',
                transition: 'all 350ms ease',
              }} />
              <span style={{
                font: "500 10px/1 'JetBrains Mono',monospace", letterSpacing: '.1em',
                color: show ? 'var(--op-text-secondary)' : 'var(--op-text-faint)',
                transition: 'color 350ms',
              }}>{b.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════ FRAME 2 — style picker
const THEMES = [
  { name: 'DARK PREMIUM',      bg: '#060606',  surface: '#111111', accent: '#e82020', text: '#ffffff', sub: '#555555', font: 'Oxanium' },
  { name: 'WHITE MEDICAL',     bg: '#f4f6f9',  surface: '#ffffff', accent: '#0066cc', text: '#111111', sub: '#888888', font: 'Inter'   },
  { name: 'LUXURY BLACK GOLD', bg: '#0c0900',  surface: '#18130a', accent: '#c9a96e', text: '#f0deba', sub: '#7d6440', font: 'Oxanium' },
  { name: 'MINT FRESH',        bg: '#020d0a',  surface: '#041a13', accent: '#00c896', text: '#e8fff8', sub: '#4a9e88', font: 'Inter'   },
];

function Frame2({ progress }: { progress: number }) {
  const raw = progress * THEMES.length;
  const ti = Math.min(Math.floor(raw), THEMES.length - 1);
  // 0→1 within current theme's portion
  const themeP = raw % 1;
  // fade: 0→0.15 fade in, 0.85→1 fade out (smooth crossfade at boundaries)
  const opacity = themeP < 0.15 ? themeP / 0.15 : themeP > 0.85 ? (1 - themeP) / 0.15 : 1;
  const th = THEMES[ti];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', transition: 'background 200ms ease', background: th.bg }}>
      <div style={{
        position: 'absolute', inset: 16, borderRadius: 10,
        background: th.surface,
        border: `1px solid ${th.accent}22`,
        opacity: Math.max(0.2, opacity),
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        transition: 'background 200ms ease, border-color 200ms ease, opacity 150ms ease',
      }}>
        {/* navbar */}
        <div style={{
          height: 42, borderBottom: `1px solid ${th.accent}20`,
          background: th.bg + 'cc',
          display: 'flex', alignItems: 'center', padding: '0 18px', gap: 20, flexShrink: 0,
          transition: 'background 200ms ease',
        }}>
          <div style={{ width: 72, height: 8, background: th.accent, borderRadius: 2, opacity: 0.85, transition: 'background 200ms ease' }} />
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 14 }}>
            {['О нас','Услуги','Контакт'].map(l => (
              <span key={l} style={{ font: "400 9px/1 'JetBrains Mono',monospace", color: th.sub, letterSpacing: '.07em', transition: 'color 200ms ease' }}>{l}</span>
            ))}
          </div>
        </div>

        {/* body */}
        <div style={{ padding: '24px 24px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ font: `700 20px/1.2 ${th.font},sans-serif`, color: th.text, transition: 'color 200ms ease, font-family 200ms ease' }}>
            Стоматология<br /><span style={{ color: th.accent, transition: 'color 200ms ease' }}>«Белая улыбка»</span>
          </div>
          <div style={{ font: "400 11px/1.7 'Inter',sans-serif", color: th.sub, maxWidth: 240, transition: 'color 200ms ease' }}>
            Профессиональная стоматология для всей семьи. Онлайн-запись за 2 минуты.
          </div>
          <button style={{
            alignSelf: 'flex-start', padding: '8px 18px', borderRadius: 5,
            background: th.accent, color: '#fff', border: 'none',
            font: `600 11px/1 ${th.font},sans-serif`, cursor: 'default',
            transition: 'background 200ms ease',
          }}>Записаться →</button>

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            {['Имплантация','Отбеливание','Ортодонтия'].map(s => (
              <div key={s} style={{
                flex: 1, padding: '8px 6px', borderRadius: 5,
                border: `1px solid ${th.accent}28`,
                background: th.bg + '66',
                font: "400 9px/1.4 'Inter',sans-serif",
                color: th.sub, textAlign: 'center',
                transition: 'border-color 200ms ease, background 200ms ease, color 200ms ease',
              }}>{s}</div>
            ))}
          </div>
        </div>
      </div>

      {/* theme name */}
      <div style={{
        position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
        padding: '7px 18px', borderRadius: 4,
        border: `1px solid ${th.accent}44`,
        background: th.bg + 'ee',
        font: "600 10px/1 'JetBrains Mono',monospace",
        color: th.accent, letterSpacing: '.22em', whiteSpace: 'nowrap',
        opacity: Math.max(0.15, opacity),
        backdropFilter: 'blur(8px)',
        transition: 'color 200ms ease, border-color 200ms ease, opacity 150ms ease',
      }}>{th.name}</div>

      {/* dots */}
      <div style={{ position: 'absolute', top: 28, right: 28, display: 'flex', gap: 5 }}>
        {THEMES.map((_, i) => (
          <div key={i} style={{
            height: 5, borderRadius: 3,
            width: i === ti ? 18 : 5,
            background: i === ti ? th.accent : th.sub + '44',
            transition: 'all 200ms ease',
          }} />
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════ FRAME 3 — AI salesman
const CHAT_MSGS = [
  { role: 'bot',  text: 'Здравствуйте! Я Опти — ваш AI-продажник.',              threshold: 0.08 },
  { role: 'lead', text: 'Нам нужен сайт для записи пациентов.',                   threshold: 0.30 },
  { role: 'bot',  text: 'Отлично — стоматология + онлайн-запись. Подберу за 1 минуту.', threshold: 0.52 },
  { role: 'bot',  text: 'Когда удобно начать? Готов взяться уже сегодня.',        threshold: 0.74 },
];
const LEADS_DATA = [
  { phone: '+7 928 *** **01', intent: 'горячий', time: '14:32', threshold: 0.60 },
  { phone: '+7 918 *** **44', intent: 'тёплый',  time: '14:37', threshold: 0.82 },
];

function Frame3({ progress }: { progress: number }) {
  const visibleMsgs = CHAT_MSGS.filter(m => progress >= m.threshold);
  const nextMsg = CHAT_MSGS[visibleMsgs.length];
  // show typing indicator when we're halfway to the next message
  const showTyping = nextMsg !== undefined && progress >= (CHAT_MSGS[visibleMsgs.length - 1]?.threshold ?? 0) + 0.06;
  const visibleLeads = LEADS_DATA.filter(l => progress >= l.threshold);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', overflow: 'hidden' }}>
      {/* chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 20px 16px' }}>
        {/* AI header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14, borderBottom: '1px solid var(--op-border)', marginBottom: 14, flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(232,32,32,0.12)', border: '1.5px solid rgba(232,32,32,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            font: "700 12px 'Oxanium',sans-serif", color: 'var(--op-accent)',
            boxShadow: '0 0 12px rgba(232,32,32,0.18)', flexShrink: 0,
          }}>AI</div>
          <div>
            <div style={{ font: "600 13px/1 'Oxanium',sans-serif", color: 'var(--op-text)' }}>ОПТИ</div>
            <div style={{ font: "400 9px/1 'JetBrains Mono',monospace", color: 'var(--op-accent)', letterSpacing: '.12em', marginTop: 4 }}>
              <span style={{ width: 5, height: 5, background: 'var(--op-accent)', borderRadius: '50%', display: 'inline-block', marginRight: 5, animation: 'hudPulse 1.4s ease-in-out infinite' }} />
              ONLINE
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
          {CHAT_MSGS.map((m, i) => {
            const show = progress >= m.threshold;
            const msgP = show ? Math.min((progress - m.threshold) / 0.08, 1) : 0;
            return (
              <div key={i} style={{
                maxWidth: '84%',
                alignSelf: m.role === 'bot' ? 'flex-start' : 'flex-end',
                padding: '8px 12px',
                borderRadius: m.role === 'bot' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                background: m.role === 'bot' ? 'rgba(232,32,32,0.09)' : 'rgba(255,255,255,0.06)',
                border: m.role === 'bot' ? '1px solid rgba(232,32,32,0.22)' : '1px solid var(--op-border)',
                font: "400 12px/1.55 'Inter',sans-serif",
                color: 'var(--op-text)',
                opacity: msgP,
                transform: `translateY(${(1 - msgP) * 6}px)`,
                transition: 'none',
              }}>{m.text}</div>
            );
          })}
          {showTyping && (
            <div style={{
              alignSelf: 'flex-start', padding: '9px 14px',
              borderRadius: '4px 12px 12px 12px',
              background: 'rgba(232,32,32,0.07)',
              border: '1px solid rgba(232,32,32,0.18)',
              display: 'flex', gap: 4, alignItems: 'center',
            }}>
              {[0,1,2].map(i => (
                <span key={i} style={{
                  width: 5, height: 5, background: 'var(--op-accent)',
                  borderRadius: '50%', display: 'inline-block',
                  animation: `ldsDot 1s ease-in-out ${i * 180}ms infinite`,
                }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* leads */}
      <div style={{
        width: 180, borderLeft: '1px solid var(--op-border)',
        padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 10,
        background: 'rgba(0,0,0,0.18)', flexShrink: 0,
      }}>
        <div style={{ font: "500 8px/1 'JetBrains Mono',monospace", color: 'var(--op-accent)', letterSpacing: '.22em', marginBottom: 4 }}>
          ВХОДЯЩИЕ ЛИДЫ
        </div>
        {LEADS_DATA.map((l, i) => {
          const show = progress >= l.threshold;
          const lP = show ? Math.min((progress - l.threshold) / 0.08, 1) : 0;
          return (
            <div key={i} style={{
              padding: '10px 12px', borderRadius: 8,
              border: '1px solid rgba(232,32,32,0.28)',
              background: 'rgba(232,32,32,0.07)',
              opacity: lP,
              transform: `translateY(${(1 - lP) * 8}px)`,
              transition: 'none',
            }}>
              <div style={{ font: "600 11px/1 'JetBrains Mono',monospace", color: 'var(--op-text)', marginBottom: 7 }}>{l.phone}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ font: "500 9px/1 'JetBrains Mono',monospace", color: l.intent === 'горячий' ? 'var(--op-accent)' : 'var(--op-text-muted)', letterSpacing: '.1em' }}>
                  {l.intent.toUpperCase()}
                </span>
                <span style={{ font: "400 9px/1 'JetBrains Mono',monospace", color: 'var(--op-text-faint)' }}>{l.time}</span>
              </div>
            </div>
          );
        })}
        {visibleLeads.length === 0 && (
          <div style={{ font: "400 10px/1.6 'JetBrains Mono',monospace", color: 'var(--op-text-faint)', letterSpacing: '.08em' }}>
            Ожидаем заявки...
          </div>
        )}
      </div>

      <style>{`
        @keyframes ldsDot { 0%,60%,100%{opacity:.2;transform:translateY(0)} 30%{opacity:1;transform:translateY(-3px)} }
      `}</style>
    </div>
  );
}

// ════════════════════════════════════════ FRAME 4 — system ready
const STATUS_ITEMS = [
  { label: 'Сайт',         value: 'ONLINE',    color: '#00c896', threshold: 0.28 },
  { label: 'AI-ассистент', value: 'ACTIVE',    color: '#e82020', threshold: 0.42 },
  { label: 'SEO',          value: '47 страниц', color: '#4f8eff', threshold: 0.56 },
  { label: 'Лиды сегодня', value: '3 заявки',  color: '#f59e0b', threshold: 0.70 },
];
const RECEIPT_LINES = [
  { text: 'Сайт на домене клиента доступен', threshold: 0.62 },
  { text: 'AI-продажник Опти активирован',   threshold: 0.70 },
  { text: 'SEO: 47 страниц проиндексировано', threshold: 0.78 },
  { text: 'Заявки поступают в Telegram',     threshold: 0.86 },
];

function Frame4({ progress }: { progress: number }) {
  const barPct = Math.min(progress / 0.25, 1) * 100;
  const done = progress >= 0.25;

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', overflow: 'hidden' }}>
      <div style={{ flex: 1, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* progress bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ font: "500 9px/1 'JetBrains Mono',monospace", color: 'var(--op-text-muted)', letterSpacing: '.14em' }}>СБОРКА СИСТЕМЫ</span>
            <span style={{ font: "700 9px/1 'JetBrains Mono',monospace", color: 'var(--op-accent)' }}>{Math.round(barPct)}%</span>
          </div>
          <div style={{ height: 5, background: 'var(--op-border)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #e82020, #ff5555)', width: `${barPct}%` }} />
          </div>
        </div>

        {done && (
          <div style={{
            font: "700 22px/1 'Oxanium',sans-serif", color: 'var(--op-text)', letterSpacing: '-0.015em',
            opacity: Math.min((progress - 0.25) / 0.08, 1),
          }}>
            СИСТЕМА ГОТОВА
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {STATUS_ITEMS.map((s) => {
            const show = progress >= s.threshold;
            const itemP = show ? Math.min((progress - s.threshold) / 0.08, 1) : 0;
            return (
              <div key={s.label} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '9px 14px', borderRadius: 8,
                border: `1px solid ${s.color}28`,
                background: `${s.color}08`,
                opacity: itemP,
                transform: `translateX(${(1 - itemP) * -10}px)`,
                transition: 'none',
              }}>
                <span style={{ color: s.color, fontSize: 10 }}>◉</span>
                <span style={{ font: "400 12px/1 'Inter',sans-serif", color: 'var(--op-text-secondary)', flex: 1 }}>{s.label}</span>
                <span style={{ font: "600 10px/1 'JetBrains Mono',monospace", color: s.color, letterSpacing: '.07em' }}>{s.value}</span>
              </div>
            );
          })}
        </div>

        {progress >= 0.90 && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('opti-open'))}
            style={{
              padding: '11px 0', borderRadius: 8,
              background: 'var(--op-accent)', color: '#fff', border: 'none',
              font: "600 13px/1 'Oxanium',sans-serif", letterSpacing: '.04em',
              cursor: 'pointer',
              opacity: Math.min((progress - 0.90) / 0.08, 1),
            }}
          >Хочу такой же →</button>
        )}
      </div>

      {/* receipt */}
      <div style={{
        width: 210, borderLeft: '1px solid var(--op-border)',
        padding: '28px 18px', display: 'flex', flexDirection: 'column', gap: 16,
        background: 'rgba(0,0,0,0.18)', flexShrink: 0,
      }}>
        <div style={{ font: "500 8px/1 'JetBrains Mono',monospace", color: 'var(--op-text-muted)', letterSpacing: '.22em' }}>ОТЧЁТ</div>
        {RECEIPT_LINES.map((r) => {
          const show = progress >= r.threshold;
          const rP = show ? Math.min((progress - r.threshold) / 0.06, 1) : 0;
          return (
            <div key={r.text} style={{
              display: 'flex', gap: 8, alignItems: 'flex-start',
              font: "400 11px/1.55 'Inter',sans-serif",
              color: 'var(--op-text-secondary)',
              opacity: rP,
              transform: `translateX(${(1 - rP) * 6}px)`,
              transition: 'none',
            }}>
              <span style={{ color: '#00c896', flexShrink: 0, marginTop: 1 }}>✓</span>
              {r.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════ DISPATCHER
function FrameVisual({ idx, frameP }: { idx: number; frameP: number }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {idx === 0 && <Frame0 progress={frameP} />}
      {idx === 1 && <Frame1 progress={frameP} />}
      {idx === 2 && <Frame2 progress={frameP} />}
      {idx === 3 && <Frame3 progress={frameP} />}
      {idx === 4 && <Frame4 progress={frameP} />}
    </div>
  );
}

// ════════════════════════════════════════ MAIN SECTION
export default function LiveDemoSection() {
  const t = useTranslations('demo');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [frameP, setFrameP] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 860);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const onScroll = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const scrolledIn = -rect.top;
      const scrollable  = wrapper.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const totalP = Math.max(0, Math.min(0.9999, scrolledIn / scrollable));
      const raw = totalP * FRAME_COUNT;
      const newIdx = Math.min(Math.floor(raw), FRAME_COUNT - 1);
      const newFrameP = raw % 1;
      setIdx(newIdx);
      setFrameP(newFrameP);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMobile]);

  const FRAME_LABELS = [
    t('frames.f0'), t('frames.f1'), t('frames.f2'), t('frames.f3'), t('frames.f4'),
  ];

  // ── Mobile layout
  if (isMobile) {
    return (
      <section id="demo" style={{ background: 'var(--op-surface)', borderTop: '1px solid var(--op-border)', borderBottom: '1px solid var(--op-border)', padding: '60px 20px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <SectionIntro code="02" cmd="opti.trace()" title={t('title')} sub={t('sub')} crimson />
          <div style={{ marginTop: 24 }}>
            <div style={{
              position: 'relative', height: 340, borderRadius: 14,
              border: '1px solid var(--op-border)', overflow: 'hidden',
              background: 'var(--op-surface-elevated)', marginBottom: 16,
            }}>
              <FrameVisual idx={idx} frameP={frameP} />
              <div style={{
                position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 14px', borderRadius: 8, zIndex: 10,
                background: 'rgba(8,10,16,.72)', backdropFilter: 'blur(8px)',
                border: '1px solid var(--op-border)',
              }}>
                <span style={{ font: "500 10px/1 'JetBrains Mono',monospace", color: 'var(--op-accent)', letterSpacing: '.14em' }}>
                  {idx + 1}/{FRAME_COUNT}
                </span>
                <span style={{ font: "500 13px/1 'Oxanium',sans-serif", color: 'var(--op-text)' }}>
                  {FRAME_LABELS[idx]}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setIdx(i => Math.max(0, i - 1)); setFrameP(0.5); }} disabled={idx === 0}
                style={{ flex: 1, height: 44, borderRadius: 8, border: '1px solid var(--op-border)', background: 'var(--op-surface-overlay)', color: 'var(--op-text-secondary)', font: "600 13px 'JetBrains Mono',monospace", cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 1 }}>← Назад</button>
              <button onClick={() => { setIdx(i => Math.min(FRAME_COUNT - 1, i + 1)); setFrameP(0.5); }} disabled={idx === FRAME_COUNT - 1}
                style={{ flex: 1, height: 44, borderRadius: 8, border: '1px solid var(--op-border)', background: idx === FRAME_COUNT - 1 ? 'var(--op-surface-overlay)' : 'var(--op-accent)', color: idx === FRAME_COUNT - 1 ? 'var(--op-text-secondary)' : '#fff', font: "600 13px 'JetBrains Mono',monospace", cursor: idx === FRAME_COUNT - 1 ? 'not-allowed' : 'pointer', opacity: idx === FRAME_COUNT - 1 ? 0.3 : 1 }}>Далее →</button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── Desktop layout
  return (
    <section id="demo" style={{ background: 'var(--op-surface)', borderTop: '1px solid var(--op-border)', borderBottom: '1px solid var(--op-border)' }}>
      <div ref={wrapperRef} style={{ height: `${FRAME_COUNT * VH_PER_FRAME}vh` }}>
        <div style={{
          position: 'sticky', top: 0, height: '100vh',
          display: 'flex', flexDirection: 'column',
          maxWidth: 1280, margin: '0 auto',
          padding: '110px 48px 48px',
        }}>
          <SectionIntro code="02" cmd="opti.trace()" title={t('title')} sub={t('sub')} crimson />

          {/* global progress bar */}
          <div style={{ height: 2, background: 'var(--op-border)', borderRadius: 1, marginTop: 20, marginBottom: 16, overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: 'var(--op-accent)', borderRadius: 1,
              width: `${((idx + frameP) / FRAME_COUNT) * 100}%`,
            }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) 260px', gap: 40, flex: 1, minHeight: 0 }}>
            {/* Visual panel */}
            <div style={{
              position: 'relative', borderRadius: 14,
              border: '1px solid var(--op-border)', overflow: 'hidden',
              background: 'var(--op-surface-elevated)',
            }}>
              <FrameVisual idx={idx} frameP={frameP} />

              {/* HUD badge */}
              <div style={{
                position: 'absolute', top: 20, left: 20, zIndex: 10,
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 16px', borderRadius: 10,
                background: 'rgba(8,10,16,.72)', backdropFilter: 'blur(10px)',
                border: '1px solid var(--op-border)',
              }}>
                <span style={{ font: "600 10px/1 'JetBrains Mono',monospace", color: 'var(--op-accent)', letterSpacing: '.16em' }}>
                  {idx + 1}/{FRAME_COUNT}
                </span>
                <span style={{ width: 1, height: 14, background: 'var(--op-border-strong)', display: 'inline-block' }} />
                <span style={{ font: "500 13px/1 'Oxanium',sans-serif", color: 'var(--op-text)' }}>
                  {FRAME_LABELS[idx]}
                </span>
              </div>
            </div>

            {/* Steps panel */}
            <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 24, borderLeft: '1px solid var(--op-border)' }}>
              {FRAME_LABELS.map((label, i) => {
                const active = i === idx;
                const past   = i < idx;
                return (
                  <div
                    key={i}
                    style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 0', position: 'relative', cursor: 'pointer' }}
                    onClick={() => {
                      const wrapper = wrapperRef.current;
                      if (!wrapper) return;
                      const scrollable = wrapper.offsetHeight - window.innerHeight;
                      window.scrollTo({ top: wrapper.offsetTop + (i / FRAME_COUNT) * scrollable, behavior: 'smooth' });
                    }}
                  >
                    {i < FRAME_LABELS.length - 1 && (
                      <div style={{
                        position: 'absolute', left: 5, top: 26, bottom: -14, width: 2,
                        background: past ? 'var(--op-accent)' : 'var(--op-border)',
                        transition: 'background 350ms',
                      }} />
                    )}
                    <span style={{
                      width: 12, height: 12, borderRadius: '50%', marginTop: 3, flexShrink: 0, position: 'relative', zIndex: 1,
                      background: active || past ? 'var(--op-accent)' : 'transparent',
                      border: `1px solid ${active || past ? 'var(--op-accent)' : 'var(--op-border-strong)'}`,
                      boxShadow: active ? '0 0 0 4px rgba(232,32,32,0.15)' : 'none',
                      transition: 'all 300ms',
                      display: 'inline-block',
                    }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{
                        font: "500 9px/1 'JetBrains Mono',monospace",
                        color: active ? 'var(--op-accent)' : past ? 'var(--op-text-muted)' : 'var(--op-text-faint)',
                        letterSpacing: '.14em', transition: 'color 300ms',
                      }}>0{i + 1}</span>
                      <span style={{
                        font: "500 13px/1.3 'Oxanium',sans-serif",
                        color: active ? 'var(--op-text)' : past ? 'var(--op-text-secondary)' : 'var(--op-text-faint)',
                        letterSpacing: '-0.005em', transition: 'color 300ms',
                      }}>{label}</span>
                    </div>
                  </div>
                );
              })}

              <div style={{ marginTop: 24, opacity: idx === 0 && frameP < 0.3 ? 1 : 0, transition: 'opacity 500ms' }}>
                <span style={{ font: "400 10px/1 'JetBrains Mono',monospace", color: 'var(--op-text-faint)', letterSpacing: '.12em' }}>
                  ↓ SCROLL TO CONTINUE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

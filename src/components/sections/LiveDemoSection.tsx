'use client';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import SectionIntro from '@/components/hud/SectionIntro';

const FRAME_COUNT = 5;

// ════════════════════════════════════════════════════════ FRAME 0
const BRIEF_LINES = [
  { prefix: 'КЛИЕНТ',     content: 'Стоматология «Белая улыбка»' },
  { prefix: 'ЗАДАЧА',     content: 'Сайт с онлайн-записью' },
  { prefix: 'ЦА',         content: 'Пациенты 25–45, семьи' },
  { prefix: 'КОНКУРЕНТ',  content: '3 клиники в радиусе 2 км' },
  { prefix: 'БЮДЖЕТ',     content: 'от 80 000 ₽' },
];
const BRIEF_TAGS = [
  { k: 'ниша',    v: 'медицина' },
  { k: 'цель',    v: 'лиды'     },
  { k: 'сегмент', v: 'premium'  },
  { k: 'срок',    v: '7 дней'   },
];

function Frame0() {
  const [doneLines, setDoneLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState('');
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [tags, setTags] = useState<boolean[]>(BRIEF_TAGS.map(() => false));
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => setBlink(b => !b), 530);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (lineIdx >= BRIEF_LINES.length) {
      // all lines typed — reveal tags
      BRIEF_TAGS.forEach((_, i) => {
        setTimeout(() => setTags(prev => { const n = [...prev]; n[i] = true; return n; }), 300 + i * 200);
      });
      return;
    }
    const line = BRIEF_LINES[lineIdx];
    const full = `${line.prefix}: ${line.content}`;
    if (charIdx < full.length) {
      const t = setTimeout(() => {
        setCurrentLine(full.slice(0, charIdx + 1));
        setCharIdx(c => c + 1);
      }, 26);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setDoneLines(prev => [...prev, full]);
        setCurrentLine('');
        setLineIdx(l => l + 1);
        setCharIdx(0);
      }, 180);
      return () => clearTimeout(t);
    }
  }, [lineIdx, charIdx]);

  const renderLine = (text: string, idx: number) => {
    const colon = text.indexOf(': ');
    if (colon === -1) return <span key={idx} style={{ color: 'rgba(232,32,32,0.7)' }}>{text}</span>;
    return (
      <div key={idx} style={{ font: "400 12px/1.8 'JetBrains Mono',monospace" }}>
        <span style={{ color: 'rgba(232,32,32,0.65)' }}>{text.slice(0, colon + 2)}</span>
        <span style={{ color: 'rgba(255,255,255,0.9)' }}>{text.slice(colon + 2)}</span>
      </div>
    );
  };

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', overflow: 'hidden' }}>
      {/* dot grid */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} aria-hidden>
        <defs>
          <pattern id="f0dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(232,32,32,0.1)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#f0dots)" />
      </svg>

      {/* scan line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 1, zIndex: 2, pointerEvents: 'none',
        background: 'linear-gradient(90deg, transparent 0%, rgba(232,32,32,0.55) 50%, transparent 100%)',
        animation: 'f0scan 2.6s linear infinite',
      }} />

      {/* terminal */}
      <div style={{ flex: 1, padding: '32px 28px', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        <div style={{ font: "500 9px/1 'JetBrains Mono',monospace", color: 'rgba(232,32,32,0.5)', letterSpacing: '.22em', marginBottom: 24 }}>
          OPTI · BRIEF · ANALYSIS ▌
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {doneLines.map((l, i) => renderLine(l, i))}
          {currentLine && (
            <div style={{ font: "400 12px/1.8 'JetBrains Mono',monospace" }}>
              {(() => {
                const c = currentLine.indexOf(': ');
                if (c === -1) return <span style={{ color: 'rgba(232,32,32,0.65)' }}>{currentLine}</span>;
                return (
                  <>
                    <span style={{ color: 'rgba(232,32,32,0.65)' }}>{currentLine.slice(0, c + 2)}</span>
                    <span style={{ color: 'rgba(255,255,255,0.9)' }}>{currentLine.slice(c + 2)}</span>
                  </>
                );
              })()}
              <span style={{
                display: 'inline-block', width: 7, height: 13,
                background: 'var(--op-accent)', marginLeft: 1,
                opacity: blink ? 1 : 0, verticalAlign: 'text-bottom',
                transition: 'opacity 80ms',
              }} />
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20 }}>
          <span style={{ width: 5, height: 5, background: 'var(--op-accent)', borderRadius: '50%', display: 'inline-block', animation: 'hudPulse 1.4s ease-in-out infinite' }} />
          <span style={{ font: "500 9px/1 'JetBrains Mono',monospace", color: 'var(--op-accent)', letterSpacing: '.2em' }}>ANALYZING...</span>
        </div>
      </div>

      {/* tags panel */}
      <div style={{
        width: 172, borderLeft: '1px solid rgba(232,32,32,0.18)',
        padding: '32px 18px', display: 'flex', flexDirection: 'column', gap: 10,
        background: 'rgba(232,32,32,0.03)', position: 'relative', zIndex: 1,
      }}>
        <div style={{ font: "500 8px/1 'JetBrains Mono',monospace", color: 'rgba(232,32,32,0.45)', letterSpacing: '.22em', marginBottom: 6 }}>
          DETECTED TAGS
        </div>
        {BRIEF_TAGS.map((tag, i) => (
          <div key={i} style={{
            padding: '7px 10px', borderRadius: 4,
            border: `1px solid ${tags[i] ? 'rgba(232,32,32,0.35)' : 'rgba(232,32,32,0.1)'}`,
            background: tags[i] ? 'rgba(232,32,32,0.08)' : 'transparent',
            transition: 'all 350ms ease',
          }}>
            <span style={{ font: "500 10px/1.5 'JetBrains Mono',monospace", color: tags[i] ? 'rgba(232,32,32,0.65)' : 'transparent', transition: 'color 350ms', display: 'block' }}>
              {tag.k}:
            </span>
            <span style={{ font: "600 11px/1 'JetBrains Mono',monospace", color: tags[i] ? 'var(--op-text)' : 'transparent', transition: 'color 350ms', display: 'block', marginTop: 2 }}>
              {tag.v}
            </span>
          </div>
        ))}
      </div>

      <style>{`@keyframes f0scan { 0%{top:0%} 100%{top:100%} }`}</style>
    </div>
  );
}

// ════════════════════════════════════════════════════════ FRAME 1
const WF_BLOCKS = [
  { label: 'HEADER',   y: '0%',  h: '13%', delay: 0    },
  { label: 'HERO',     y: '15%', h: '28%', delay: 350  },
  { label: 'УСЛУГИ',   y: '46%', h: '20%', delay: 700  },
  { label: 'КЕЙСЫ',   y: '69%', h: '16%', delay: 1000 },
  { label: 'ФОРМА',    y: '88%', h: '7%',  delay: 1300 },
];

function Frame1() {
  const [visible, setVisible] = useState<boolean[]>(WF_BLOCKS.map(() => false));
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    WF_BLOCKS.forEach((b, i) => {
      const t = setTimeout(() => {
        setVisible(prev => { const n = [...prev]; n[i] = true; return n; });
        setCount(c => c + 1);
      }, b.delay);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 56px' }}>
      {/* blueprint grid */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} aria-hidden>
        <defs>
          <pattern id="f1grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(232,32,32,0.07)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#f1grid)" />
      </svg>

      {/* counter */}
      <div style={{
        position: 'absolute', top: 20, left: 24,
        font: "600 10px/1 'JetBrains Mono',monospace",
        color: 'var(--op-accent)', letterSpacing: '.14em',
      }}>
        BLOCK {count}/{WF_BLOCKS.length}
      </div>

      {/* wireframe window */}
      <div style={{
        position: 'relative', width: '52%', height: '88%',
        border: '1px dashed rgba(232,32,32,0.2)', borderRadius: 6,
      }}>
        {/* browser chrome */}
        <div style={{
          position: 'absolute', top: -28, left: 0, right: 0, height: 24,
          border: '1px dashed rgba(232,32,32,0.2)', borderBottom: 'none',
          display: 'flex', alignItems: 'center', paddingLeft: 8, gap: 5, borderRadius: '4px 4px 0 0',
        }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px dashed rgba(232,32,32,0.2)' }} />
          ))}
        </div>

        {WF_BLOCKS.map((b, i) => (
          <div key={b.label} style={{
            position: 'absolute', left: '4%', right: '4%',
            top: b.y, height: b.h,
            border: '1px dashed rgba(232,32,32,0.45)',
            background: visible[i] ? 'rgba(232,32,32,0.05)' : 'transparent',
            borderRadius: 3,
            opacity: visible[i] ? 1 : 0,
            transform: visible[i] ? 'scaleY(1)' : 'scaleY(0.2)',
            transformOrigin: 'top center',
            transition: 'opacity 320ms ease, transform 320ms ease, background 320ms ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ font: "600 8px 'JetBrains Mono',monospace", color: 'rgba(232,32,32,0.55)', letterSpacing: '.18em' }}>
              {b.label}
            </span>
          </div>
        ))}
      </div>

      {/* right checklist */}
      <div style={{
        position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {WF_BLOCKS.map((b, i) => (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: visible[i] ? 'var(--op-accent)' : 'transparent',
              border: `1px solid ${visible[i] ? 'var(--op-accent)' : 'var(--op-border-strong)'}`,
              boxShadow: visible[i] ? '0 0 0 3px rgba(232,32,32,0.18)' : 'none',
              transition: 'all 300ms ease',
            }} />
            <span style={{
              font: "500 10px/1 'JetBrains Mono',monospace",
              letterSpacing: '.1em',
              color: visible[i] ? 'var(--op-text-secondary)' : 'var(--op-text-faint)',
              transition: 'color 300ms',
            }}>{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════ FRAME 2
const THEMES = [
  { name: 'DARK PREMIUM',      bg: '#060606', surface: '#111', accent: '#e82020', text: '#fff',     sub: '#666', font: 'Oxanium' },
  { name: 'WHITE MEDICAL',     bg: '#f5f7fa', surface: '#fff', accent: '#0066cc', text: '#111',     sub: '#888', font: 'Inter'   },
  { name: 'LUXURY BLACK GOLD', bg: '#0c0900', surface: '#17120a', accent: '#c9a96e', text: '#f0deba', sub: '#7d6640', font: 'Oxanium' },
  { name: 'MINT FRESH',        bg: '#020d0a', surface: '#041a13', accent: '#00c896', text: '#e8fff8', sub: '#4a9e88', font: 'Inter'   },
];

function Frame2() {
  const [ti, setTi] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => {
      setFade(false);
      setTimeout(() => { setTi(i => (i + 1) % THEMES.length); setFade(true); }, 240);
    }, 1700);
    return () => clearInterval(iv);
  }, []);

  const th = THEMES[ti];

  return (
    <div style={{ position: 'absolute', inset: 0, background: th.bg, transition: 'background 240ms ease', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 16, borderRadius: 10,
        background: th.surface,
        border: `1px solid ${th.accent}28`,
        transition: 'background 240ms ease, border-color 240ms ease',
        opacity: fade ? 1 : 0,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* navbar */}
        <div style={{
          height: 42, borderBottom: `1px solid ${th.accent}20`,
          background: th.bg + 'cc',
          display: 'flex', alignItems: 'center', padding: '0 18px', gap: 20, flexShrink: 0,
        }}>
          <div style={{ width: 72, height: 8, background: th.accent, borderRadius: 2, opacity: 0.85 }} />
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 14 }}>
            {['О нас','Услуги','Контакт'].map(l => (
              <span key={l} style={{ font: "400 9px/1 'JetBrains Mono',monospace", color: th.sub, letterSpacing: '.07em' }}>{l}</span>
            ))}
          </div>
        </div>

        {/* hero */}
        <div style={{ padding: '24px 24px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            font: `700 20px/1.2 ${th.font},sans-serif`,
            color: th.text,
            letterSpacing: th.font === 'Oxanium' ? '-0.02em' : '0',
          }}>
            Стоматология<br />
            <span style={{ color: th.accent }}>«Белая улыбка»</span>
          </div>
          <div style={{ font: "400 11px/1.65 'Inter',sans-serif", color: th.sub, maxWidth: 260 }}>
            Профессиональная стоматология для всей семьи. Онлайн-запись за 2 минуты.
          </div>
          <button style={{
            alignSelf: 'flex-start',
            padding: '8px 18px', borderRadius: 5,
            background: th.accent, color: '#fff', border: 'none',
            font: `600 11px/1 ${th.font},sans-serif`, cursor: 'pointer',
          }}>
            Записаться →
          </button>

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            {['Имплантация','Отбеливание','Ортодонтия'].map(s => (
              <div key={s} style={{
                flex: 1, padding: '8px 6px',
                border: `1px solid ${th.accent}28`,
                background: th.bg + '66',
                borderRadius: 5,
                font: "400 9px/1.4 'Inter',sans-serif",
                color: th.sub, textAlign: 'center',
              }}>{s}</div>
            ))}
          </div>
        </div>
      </div>

      {/* theme name */}
      <div style={{
        position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
        padding: '7px 18px',
        border: `1px solid ${th.accent}44`,
        background: th.bg + 'ee',
        font: "600 10px/1 'JetBrains Mono',monospace",
        color: th.accent, letterSpacing: '.22em', borderRadius: 4,
        opacity: fade ? 1 : 0, transition: 'opacity 240ms ease, color 240ms ease',
        backdropFilter: 'blur(8px)', whiteSpace: 'nowrap',
      }}>{th.name}</div>

      {/* dots */}
      <div style={{ position: 'absolute', top: 28, right: 28, display: 'flex', gap: 5 }}>
        {THEMES.map((_, i) => (
          <div key={i} style={{
            height: 5, borderRadius: 3,
            width: i === ti ? 18 : 5,
            background: i === ti ? th.accent : th.sub + '44',
            transition: 'all 300ms ease',
          }} />
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════ FRAME 3
const CHAT_MSGS = [
  { role: 'bot',  text: 'Здравствуйте! Я Опти — ваш AI-продажник.' },
  { role: 'lead', text: 'Нам нужен сайт для записи пациентов.' },
  { role: 'bot',  text: 'Отлично — стоматология + онлайн-запись. Подберу решение за 1 минуту.' },
  { role: 'bot',  text: 'Когда удобно начать? Готов взяться уже сегодня.' },
];
const LEADS = [
  { phone: '+7 928 *** **01', intent: 'горячий', time: '14:32' },
  { phone: '+7 918 *** **44', intent: 'тёплый',  time: '14:37' },
];

function Frame3() {
  const [msgCount, setMsgCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const [leadCount, setLeadCount] = useState(0);

  useEffect(() => {
    let n = 0;
    const next = () => {
      if (n >= CHAT_MSGS.length) return;
      setTyping(true);
      const delay = CHAT_MSGS[n].role === 'bot' ? 950 : 520;
      setTimeout(() => {
        setTyping(false);
        n++;
        setMsgCount(n);
        if (n === 2) setTimeout(() => setLeadCount(1), 700);
        if (n === CHAT_MSGS.length) setTimeout(() => setLeadCount(2), 600);
        if (n < CHAT_MSGS.length) next();
      }, delay);
    };
    const t = setTimeout(next, 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', overflow: 'hidden' }}>
      {/* chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 20px 16px' }}>
        {/* AI header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid var(--op-border)', marginBottom: 16, flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(232,32,32,0.12)', border: '1.5px solid rgba(232,32,32,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            font: "700 12px 'Oxanium',sans-serif", color: 'var(--op-accent)',
            boxShadow: '0 0 14px rgba(232,32,32,0.2)', flexShrink: 0,
          }}>AI</div>
          <div>
            <div style={{ font: "600 13px/1 'Oxanium',sans-serif", color: 'var(--op-text)' }}>ОПТИ</div>
            <div style={{ font: "400 9px/1 'JetBrains Mono',monospace", color: 'var(--op-accent)', letterSpacing: '.12em', marginTop: 4 }}>
              <span style={{ width: 5, height: 5, background: 'var(--op-accent)', borderRadius: '50%', display: 'inline-block', marginRight: 5, animation: 'hudPulse 1.4s ease-in-out infinite' }} />
              ONLINE
            </div>
          </div>
        </div>

        {/* messages */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
          {CHAT_MSGS.slice(0, msgCount).map((m, i) => (
            <div key={i} style={{
              maxWidth: '82%',
              alignSelf: m.role === 'bot' ? 'flex-start' : 'flex-end',
              padding: '8px 12px',
              borderRadius: m.role === 'bot' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
              background: m.role === 'bot' ? 'rgba(232,32,32,0.09)' : 'rgba(255,255,255,0.06)',
              border: m.role === 'bot' ? '1px solid rgba(232,32,32,0.22)' : '1px solid var(--op-border)',
              font: "400 12px/1.55 'Inter',sans-serif",
              color: 'var(--op-text)',
              animation: 'ldsSlideIn 220ms ease',
            }}>{m.text}</div>
          ))}
          {typing && (
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
        width: 182, borderLeft: '1px solid var(--op-border)',
        padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 10,
        background: 'rgba(0,0,0,0.18)', flexShrink: 0,
      }}>
        <div style={{ font: "500 8px/1 'JetBrains Mono',monospace", color: 'var(--op-accent)', letterSpacing: '.22em', marginBottom: 4 }}>
          ВХОДЯЩИЕ ЛИДЫ
        </div>
        {leadCount === 0 && (
          <div style={{ font: "400 10px/1.6 'JetBrains Mono',monospace", color: 'var(--op-text-faint)', letterSpacing: '.08em' }}>
            Ожидаем заявки...
          </div>
        )}
        {LEADS.slice(0, leadCount).map((l, i) => (
          <div key={i} style={{
            padding: '10px 12px', borderRadius: 8,
            border: '1px solid rgba(232,32,32,0.28)',
            background: 'rgba(232,32,32,0.07)',
            animation: 'ldsSlideIn 280ms ease',
          }}>
            <div style={{ font: "600 11px/1 'JetBrains Mono',monospace", color: 'var(--op-text)', marginBottom: 7 }}>{l.phone}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                font: "500 9px/1 'JetBrains Mono',monospace",
                color: l.intent === 'горячий' ? 'var(--op-accent)' : 'var(--op-text-muted)',
                letterSpacing: '.1em',
              }}>{l.intent.toUpperCase()}</span>
              <span style={{ font: "400 9px/1 'JetBrains Mono',monospace", color: 'var(--op-text-faint)' }}>{l.time}</span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes ldsSlideIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ldsDot { 0%,60%,100% { opacity:.25; transform:translateY(0); } 30% { opacity:1; transform:translateY(-3px); } }
      `}</style>
    </div>
  );
}

// ════════════════════════════════════════════════════════ FRAME 4
const STATUS_ITEMS = [
  { label: 'Сайт',          value: 'ONLINE',    color: '#00c896' },
  { label: 'AI-ассистент',  value: 'ACTIVE',    color: '#e82020' },
  { label: 'SEO',           value: '47 страниц', color: '#4f8eff' },
  { label: 'Лиды сегодня',  value: '3 заявки',  color: '#f59e0b' },
];
const RECEIPT = [
  'Сайт на домене клиента доступен',
  'AI-продажник Опти активирован',
  'SEO: 47 страниц проиндексировано',
  'Заявки поступают в Telegram',
];

function Frame4() {
  const [progress, setProgress] = useState(0);
  const [items, setItems] = useState(0);
  const [receipt, setReceipt] = useState(0);
  const done = progress >= 100;

  useEffect(() => {
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / 1100, 1);
      setProgress(p * 100);
      if (p < 1) { raf = requestAnimationFrame(tick); }
      else {
        STATUS_ITEMS.forEach((_, i) => setTimeout(() => setItems(c => Math.max(c, i + 1)), i * 180));
        RECEIPT.forEach((_, i) => setTimeout(() => setReceipt(c => Math.max(c, i + 1)), 700 + i * 140));
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', overflow: 'hidden' }}>
      {/* left: metrics */}
      <div style={{ flex: 1, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ font: "500 9px/1 'JetBrains Mono',monospace", color: 'var(--op-text-muted)', letterSpacing: '.14em' }}>СБОРКА СИСТЕМЫ</span>
            <span style={{ font: "700 9px/1 'JetBrains Mono',monospace", color: 'var(--op-accent)' }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: 5, background: 'var(--op-border)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3,
              background: 'linear-gradient(90deg, #e82020, #ff5555)',
              width: `${progress}%`, transition: 'width 30ms linear',
            }} />
          </div>
        </div>

        {done && (
          <div style={{
            font: "700 22px/1 'Oxanium',sans-serif",
            color: 'var(--op-text)', letterSpacing: '-0.015em',
            animation: 'ldsSlideIn 350ms ease',
          }}>
            СИСТЕМА ГОТОВА
          </div>
        )}

        {/* status cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {STATUS_ITEMS.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '9px 14px', borderRadius: 8,
              border: `1px solid ${s.color}28`,
              background: `${s.color}08`,
              opacity: i < items ? 1 : 0,
              transform: i < items ? 'translateX(0)' : 'translateX(-10px)',
              transition: 'opacity 280ms ease, transform 280ms ease',
            }}>
              <span style={{ color: s.color, fontSize: 10, animation: i < items ? 'hudPulse 2s ease-in-out infinite' : 'none' }}>◉</span>
              <span style={{ font: "400 12px/1 'Inter',sans-serif", color: 'var(--op-text-secondary)', flex: 1 }}>{s.label}</span>
              <span style={{ font: "600 10px/1 'JetBrains Mono',monospace", color: s.color, letterSpacing: '.07em' }}>{s.value}</span>
            </div>
          ))}
        </div>

        {items === STATUS_ITEMS.length && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('opti-open'))}
            style={{
              padding: '11px 0', borderRadius: 8,
              background: 'var(--op-accent)', color: '#fff', border: 'none',
              font: "600 13px/1 'Oxanium',sans-serif", letterSpacing: '.04em',
              cursor: 'pointer', animation: 'ldsSlideIn 350ms ease',
            }}
          >Хочу такой же →</button>
        )}
      </div>

      {/* right: receipt */}
      <div style={{
        width: 210, borderLeft: '1px solid var(--op-border)',
        padding: '28px 18px', display: 'flex', flexDirection: 'column', gap: 16,
        background: 'rgba(0,0,0,0.18)', flexShrink: 0,
      }}>
        <div style={{ font: "500 8px/1 'JetBrains Mono',monospace", color: 'var(--op-text-muted)', letterSpacing: '.22em' }}>ОТЧЁТ</div>
        {RECEIPT.map((line, i) => (
          <div key={i} style={{
            display: 'flex', gap: 8, alignItems: 'flex-start',
            font: "400 11px/1.55 'Inter',sans-serif",
            color: i < receipt ? 'var(--op-text-secondary)' : 'transparent',
            transition: 'color 300ms ease',
          }}>
            <span style={{ color: '#00c896', flexShrink: 0, marginTop: 1 }}>✓</span>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════ DISPATCHER

function FrameVisual({ idx }: { idx: number }) {
  return (
    <div key={idx} style={{ position: 'absolute', inset: 0 }}>
      {idx === 0 && <Frame0 />}
      {idx === 1 && <Frame1 />}
      {idx === 2 && <Frame2 />}
      {idx === 3 && <Frame3 />}
      {idx === 4 && <Frame4 />}
    </div>
  );
}

// ════════════════════════════════════════════════════════ MAIN

export default function LiveDemoSection() {
  const t = useTranslations('demo');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 860);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  // scroll-based frame index (desktop only)
  useEffect(() => {
    if (isMobile) return;
    const onScroll = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const scrolledIn = -rect.top;
      const scrollable = wrapper.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = Math.max(0, Math.min(0.9999, scrolledIn / scrollable));
      setIdx(Math.floor(progress * FRAME_COUNT));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMobile]);

  const FRAME_LABELS = [
    t('frames.f0'),
    t('frames.f1'),
    t('frames.f2'),
    t('frames.f3'),
    t('frames.f4'),
  ];

  if (isMobile) {
    return (
      <section id="demo" style={{ background: 'var(--op-surface)', borderTop: '1px solid var(--op-border)', borderBottom: '1px solid var(--op-border)', padding: '60px 20px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <SectionIntro code="02" cmd="opti.trace()" title={t('title')} sub={t('sub')} crimson />
          <div style={{ marginTop: 24 }}>
            {/* visual panel */}
            <div style={{
              position: 'relative', height: 340, borderRadius: 14,
              border: '1px solid var(--op-border)', overflow: 'hidden',
              background: 'var(--op-surface-elevated)', marginBottom: 16,
            }}>
              <FrameVisual idx={idx} />
              <div style={{
                position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 14px', borderRadius: 8, zIndex: 10,
                background: 'rgba(10,14,20,.7)', backdropFilter: 'blur(8px)',
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

            {/* tap controls */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setIdx(i => Math.max(0, i - 1))}
                disabled={idx === 0}
                style={{
                  flex: 1, height: 44, borderRadius: 8,
                  border: '1px solid var(--op-border)',
                  background: 'var(--op-surface-overlay)',
                  color: 'var(--op-text-secondary)',
                  font: "600 13px 'JetBrains Mono',monospace",
                  cursor: idx === 0 ? 'not-allowed' : 'pointer',
                  opacity: idx === 0 ? 0.3 : 1,
                }}
              >← Назад</button>
              <button
                onClick={() => setIdx(i => Math.min(FRAME_COUNT - 1, i + 1))}
                disabled={idx === FRAME_COUNT - 1}
                style={{
                  flex: 1, height: 44, borderRadius: 8,
                  border: '1px solid var(--op-border)',
                  background: idx === FRAME_COUNT - 1 ? 'var(--op-surface-overlay)' : 'var(--op-accent)',
                  color: idx === FRAME_COUNT - 1 ? 'var(--op-text-secondary)' : '#fff',
                  font: "600 13px 'JetBrains Mono',monospace",
                  cursor: idx === FRAME_COUNT - 1 ? 'not-allowed' : 'pointer',
                  opacity: idx === FRAME_COUNT - 1 ? 0.3 : 1,
                }}
              >Далее →</button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="demo"
      style={{ background: 'var(--op-surface)', borderTop: '1px solid var(--op-border)', borderBottom: '1px solid var(--op-border)' }}
    >
      <div
        ref={wrapperRef}
        style={{ height: `${FRAME_COUNT * 100}vh` }}
      >
        <div style={{
          position: 'sticky', top: 0, height: '100vh',
          display: 'flex', flexDirection: 'column',
          maxWidth: 1280, margin: '0 auto',
          padding: '110px 48px 48px',
        }}>
          <SectionIntro code="02" cmd="opti.trace()" title={t('title')} sub={t('sub')} crimson />

          {/* progress bar */}
          <div style={{ height: 2, background: 'var(--op-border)', borderRadius: 1, marginTop: 20, marginBottom: 16, overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: 'var(--op-accent)', borderRadius: 1,
              width: `${((idx + 1) / FRAME_COUNT) * 100}%`,
              transition: 'width 500ms ease',
            }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) 260px', gap: 40, flex: 1, minHeight: 0 }}>
            {/* Visual panel */}
            <div style={{
              position: 'relative', borderRadius: 14,
              border: '1px solid var(--op-border)', overflow: 'hidden',
              background: 'var(--op-surface-elevated)',
            }}>
              <FrameVisual idx={idx} />

              {/* HUD badge */}
              <div style={{
                position: 'absolute', top: 20, left: 20, zIndex: 10,
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 16px', borderRadius: 10,
                background: 'rgba(8,10,16,.7)', backdropFilter: 'blur(10px)',
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
                      const target = wrapper.offsetTop + (i / FRAME_COUNT) * scrollable;
                      window.scrollTo({ top: target, behavior: 'smooth' });
                    }}
                  >
                    {i < FRAME_LABELS.length - 1 && (
                      <div style={{
                        position: 'absolute', left: 5, top: 26, bottom: -14, width: 2,
                        background: past ? 'var(--op-accent)' : 'var(--op-border)',
                        transition: 'background 400ms',
                      }} />
                    )}
                    <span style={{
                      width: 12, height: 12, borderRadius: '50%', marginTop: 3, flexShrink: 0, position: 'relative', zIndex: 1,
                      background: active || past ? 'var(--op-accent)' : 'transparent',
                      border: active || past ? '1px solid var(--op-accent)' : '1px solid var(--op-border-strong)',
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

              <div style={{
                marginTop: 24, display: 'flex', alignItems: 'center', gap: 8,
                opacity: idx === 0 ? 1 : 0, transition: 'opacity 400ms',
              }}>
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

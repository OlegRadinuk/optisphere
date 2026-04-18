'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Waveform ─────────────────────────────────────────────────────────────────

const BAR_COUNT = 28;

function Waveform({ active }: { active: boolean }) {
  const [bars, setBars] = useState(() => Array.from({ length: BAR_COUNT }, () => Math.random()));
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const animate = (now: number) => {
      rafRef.current = requestAnimationFrame(animate);
      const t = now * 0.002;
      setBars(Array.from({ length: BAR_COUNT }, (_, i) => {
        return active
          ? 0.3 + 0.65 * Math.abs(Math.sin(t * 2.2 + i * 0.38))
          : 0.08 + 0.18 * Math.abs(Math.sin(t * 0.5 + i * 0.55));
      }));
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 36, padding: '0 2px' }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          width: 3,
          height: `${Math.max(4, h * 34)}px`,
          borderRadius: 2,
          background: active
            ? `rgba(0,212,255,${0.5 + h * 0.5})`
            : `rgba(0,212,255,${0.15 + h * 0.25})`,
          transition: 'height 0.08s ease, background 0.3s ease',
          flexShrink: 0,
        }} />
      ))}
    </div>
  );
}

// ─── Typing cursor ────────────────────────────────────────────────────────────

function TypingText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, 22);
    return () => clearInterval(id);
  }, [text]);

  return (
    <span>
      {displayed}
      {!done && <span style={{ borderRight: '2px solid #00D4FF', animation: 'hudBlink 0.7s step-end infinite', marginLeft: 1 }} />}
    </span>
  );
}

// ─── Message ─────────────────────────────────────────────────────────────────

interface Msg { role: 'yura' | 'user'; text: string; }

// ─── Placeholder animator ─────────────────────────────────────────────────────

const HINTS = ['Расскажите о проекте…', 'Какой бизнес?', 'Есть сайт или нужен новый?', 'Напишите Юре…'];

function AnimatedPlaceholder({ active }: { active: boolean }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (active) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % HINTS.length);
        setVisible(true);
      }, 300);
    }, 2800);
    return () => clearInterval(id);
  }, [active]);

  return (
    <span style={{
      position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
      fontSize: '0.82rem', pointerEvents: 'none', userSelect: 'none',
      color: 'rgba(0,212,255,0.35)',
      transition: 'opacity 0.3s',
      opacity: visible ? 1 : 0,
    }}>
      {HINTS[idx]}
    </span>
  );
}

// ─── Main HUD ─────────────────────────────────────────────────────────────────

interface YuraHUDProps {
  onLeadCaptured?: (data: { name?: string; phone?: string; message: string }) => void;
}

const FIRST_MESSAGES = [
  'Привет! Я Юра — AI-менеджер Optisphere. Расскажите о вашем бизнесе — подберём решение.',
  'Здравствуйте! Нужен сайт или хотите продвинуть существующий? Давайте разберёмся вместе.',
  'Добрый день! Я помогу рассчитать стоимость и сроки. С чего начнём?',
];

export default function YuraHUD({ onLeadCaptured }: YuraHUDProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const firstMsg = useRef(FIRST_MESSAGES[Math.floor(Math.random() * FIRST_MESSAGES.length)]);

  // First message after delay
  useEffect(() => {
    const t = setTimeout(() => {
      setMessages([{ role: 'yura', text: firstMsg.current }]);
      setStarted(true);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  // Scroll within the messages container only — never scroll the page
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            role: m.role === 'yura' ? 'assistant' : 'user',
            content: m.text,
          })),
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error('API error');

      // API streams plain text — read chunks directly
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      setMessages(prev => [...prev, { role: 'yura', text: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'yura', text: full };
          return copy;
        });
      }

      if (onLeadCaptured && (full.includes('телефон') || full.includes('заявк') || full.includes('свяж'))) {
        onLeadCaptured({ message: text.trim() });
      }
    } catch (e: unknown) {
      if ((e as Error).name !== 'AbortError') {
        setMessages(prev => [...prev, { role: 'yura', text: 'Что-то пошло не так. Попробуйте ещё раз.' }]);
      }
    } finally {
      setLoading(false);
    }
  }, [messages, loading, onLeadCaptured]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: 480,
      background: 'rgba(6,6,20,0.92)',
      border: '1px solid rgba(0,212,255,0.25)',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 0 0 1px rgba(0,212,255,0.08), 0 0 60px rgba(0,212,255,0.08), inset 0 1px 0 rgba(0,212,255,0.12)',
      backdropFilter: 'blur(20px)',
    }}>
      {/* Scan line */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,212,255,0.018) 3px, rgba(0,212,255,0.018) 4px)',
      }} />

      {/* Corner accents */}
      {(['tl','tr','bl','br'] as const).map(pos => (
        <div key={pos} aria-hidden="true" style={{
          position: 'absolute',
          top: pos.startsWith('t') ? 10 : 'auto',
          bottom: pos.startsWith('b') ? 10 : 'auto',
          left: pos.endsWith('l') ? 10 : 'auto',
          right: pos.endsWith('r') ? 10 : 'auto',
          width: 10, height: 10,
          borderTop: pos.startsWith('t') ? '1px solid rgba(0,212,255,0.5)' : undefined,
          borderBottom: pos.startsWith('b') ? '1px solid rgba(0,212,255,0.5)' : undefined,
          borderLeft: pos.endsWith('l') ? '1px solid rgba(0,212,255,0.5)' : undefined,
          borderRight: pos.endsWith('r') ? '1px solid rgba(0,212,255,0.5)' : undefined,
        }} />
      ))}

      {/* Header */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 20px 10px',
        borderBottom: '1px solid rgba(0,212,255,0.10)',
      }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #4F46E5, #06060F)',
            border: '1px solid rgba(0,212,255,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.85rem', fontWeight: 700, color: '#00D4FF', letterSpacing: 1,
          }}>Ю</div>
          <div style={{
            position: 'absolute', bottom: 1, right: 1,
            width: 9, height: 9, borderRadius: '50%',
            background: '#22c55e', border: '2px solid #06060F',
            animation: 'hudPulse 2s ease-in-out infinite',
          }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#F8FAFC', letterSpacing: 1 }}>ЮРА</span>
            <span style={{
              fontSize: '0.6rem', fontFamily: 'monospace', letterSpacing: 2,
              color: '#22c55e', background: 'rgba(34,197,94,0.1)',
              padding: '1px 6px', borderRadius: 4, border: '1px solid rgba(34,197,94,0.25)',
            }}>ОНЛАЙН</span>
          </div>
          <div style={{ fontSize: '0.65rem', color: 'rgba(0,212,255,0.5)', fontFamily: 'monospace', marginTop: 1 }}>
            AI-менеджер · Optisphere
          </div>
        </div>
        <Waveform active={loading} />
      </div>

      {/* Messages */}
      <div
        ref={messagesRef}
        style={{
          position: 'relative', zIndex: 1,
          height: 170,
          overflowY: 'auto',
          padding: '14px 16px',
          display: 'flex', flexDirection: 'column', gap: 10,
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,212,255,0.2) transparent',
        }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
            >
              <div style={{
                maxWidth: '85%',
                padding: '8px 12px',
                borderRadius: msg.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                background: msg.role === 'user' ? 'rgba(79,70,229,0.35)' : 'rgba(0,212,255,0.08)',
                border: msg.role === 'user' ? '1px solid rgba(79,70,229,0.4)' : '1px solid rgba(0,212,255,0.15)',
                fontSize: '0.82rem', lineHeight: 1.5, color: '#E8EAED',
              }}>
                {i === messages.length - 1 && msg.role === 'yura' && started
                  ? <TypingText text={msg.text} />
                  : msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && messages[messages.length - 1]?.role !== 'yura' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: 4, padding: '4px 8px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%', background: '#00D4FF',
                animation: `hudDot 1.2s ${i * 0.2}s ease-in-out infinite`,
              }} />
            ))}
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(0,212,255,0.10)',
        padding: '10px 12px',
        display: 'flex', gap: 8, alignItems: 'center',
      }}>
        {/* Input with animated placeholder */}
        <div style={{ flex: 1, position: 'relative' }}>
          {!input && !inputFocused && <AnimatedPlaceholder active={loading} />}
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder={inputFocused ? 'Напишите Юре…' : ''}
            disabled={loading}
            style={{
              width: '100%',
              background: 'rgba(0,212,255,0.05)',
              border: `1px solid ${inputFocused ? 'rgba(0,212,255,0.5)' : 'rgba(0,212,255,0.18)'}`,
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: '0.82rem',
              color: '#F8FAFC',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxShadow: inputFocused ? '0 0 0 3px rgba(0,212,255,0.08)' : 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: input.trim() ? '#00D4FF' : 'rgba(0,212,255,0.1)',
            border: 'none', cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s, transform 0.1s',
            color: input.trim() ? '#06060F' : 'rgba(0,212,255,0.4)',
          }}
          onMouseDown={e => { if (input.trim()) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.93)'; }}
          onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
          aria-label="Отправить"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M1 7.5h12M8 2l5.5 5.5L8 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Stats row */}
      <div style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(0,212,255,0.08)',
        padding: '8px 16px',
        display: 'flex', justifyContent: 'space-around',
      }}>
        {[['6', 'сайтов'], ['1 200+', 'лидов поймано'], ['4.9', 'рейтинг']].map(([val, label]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#00D4FF', fontFamily: 'monospace' }}>{val}</div>
            <div style={{ fontSize: '0.58rem', color: 'rgba(248,250,252,0.35)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes hudPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
        @keyframes hudBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes hudDot { 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(-4px);opacity:1} }
      `}</style>
    </div>
  );
}

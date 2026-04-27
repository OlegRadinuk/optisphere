'use client';
import { useState, useRef, useEffect } from 'react';
import WireSphere from './WireSphere';
import { useHeroChat } from '@/components/ai/HeroChatContext';
import type { ChatMessage } from '@/components/ai/HeroChatContext';
import LeadForm from '@/components/ai/LeadForm';

type SphereState = 'idle' | 'thinking' | 'speaking';

const GREETING = "Расскажите чем занимаетесь — покажу, как именно это продаётся через сайт.";
const PROGRESS_STEPS = 3;
const SAVE_LEAD_MARKER = '[SAVE_LEAD]';

const QUICK_PROMPTS = ['Стоматология', 'Гостиница', 'Магазин', 'Строительство'];


export default function HeroStage() {
  const { sharedMessages, setSharedMessages, sharedSessionId } = useHeroChat();
  const [state, setState] = useState<SphereState>('idle');
  const [streamingText, setStreamingText] = useState('');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [greetingTyped, setGreetingTyped] = useState('');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Typewriter effect for greeting — only when no messages yet
  useEffect(() => {
    if (sharedMessages.length > 0) return;
    let i = 0;
    // Small initial delay so page loads first
    const start = setTimeout(() => {
      const timer = setInterval(() => {
        i++;
        setGreetingTyped(GREETING.slice(0, i));
        if (i >= GREETING.length) clearInterval(timer);
      }, 22);
      return () => clearInterval(timer);
    }, 600);
    return () => clearTimeout(start);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    const userMsg: ChatMessage = { role: 'user', content: text.trim() };
    const newMessages = [...sharedMessages, userMsg];
    setSharedMessages(newMessages);
    setInput('');
    setBusy(true);
    setState('thinking');
    setStreamingText('');

    try {
      abortRef.current = new AbortController();
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, sessionId: sharedSessionId }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error('API error');

      setState('speaking');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        full += chunk;
        setStreamingText(full.replace(/\[SHOW_FORM\]|\[SAVE_LEAD\]/g, '').trim());
      }

      const cleanFull = full.replace(/\[SHOW_FORM\]|\[SAVE_LEAD\]/g, '').trim();
      if (full.includes(SAVE_LEAD_MARKER) || full.includes('[SHOW_FORM]')) {
        setShowLeadForm(true);
      }
      setSharedMessages(prev => [...prev, { role: 'assistant', content: cleanFull }]);
      setStreamingText('');
    } catch (e: unknown) {
      if ((e as Error)?.name !== 'AbortError') {
        setStreamingText('Что-то пошло не так. Попробуйте ещё раз.');
      }
    } finally {
      setBusy(false);
      setState('idle');
    }
  };

  const displayedMessages = sharedMessages.length > 0 ? sharedMessages.slice(-4) : [];
  const answeredSteps = Math.min(
    sharedMessages.filter(m => m.role === 'assistant').length,
    PROGRESS_STEPS
  );
  const progressDone = answeredSteps >= PROGRESS_STEPS;
  const showProgress = sharedMessages.length > 0;

  return (
    <div className="hero-stage-wrap" style={{ position: 'relative', minHeight: 520, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`
        @keyframes hudCaret { 50% { opacity: 0; } }
        @media (max-width: 640px) {
          .hero-stage-wrap { min-height: 400px !important; gap: 12px !important; }
        }
      `}</style>

      {/* Header with sphere */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
        <WireSphere state={state} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, paddingTop: 24 }}>
          <span style={{ font: "500 9px/1 'JetBrains Mono',monospace", color: 'var(--op-accent)', letterSpacing: '.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            ◆ ОПТИ · AI-КОНСУЛЬТАНТ
          </span>
          <span style={{ font: "600 20px/1.2 'Oxanium',sans-serif", color: 'var(--op-text)', letterSpacing: '-0.005em', textTransform: 'uppercase' }}>
            {state === 'idle' ? 'Готов слушать' : state === 'thinking' ? 'Анализирую…' : 'Формирую ответ'}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ font: "500 10px/1 'JetBrains Mono',monospace", color: progressDone ? 'var(--op-accent)' : 'var(--op-text-muted)', letterSpacing: '.12em', textTransform: 'uppercase' }}>
              {progressDone ? '✓ Расчёт готовится' : `Шаг ${answeredSteps}/${PROGRESS_STEPS} — до расчёта стоимости`}
            </span>
            <span style={{ font: "500 10px/1 'JetBrains Mono',monospace", color: progressDone ? 'var(--op-accent)' : 'var(--op-text-faint)' }}>
              {Math.round((answeredSteps / PROGRESS_STEPS) * 100)}%
            </span>
          </div>
          <div style={{ height: 2, background: 'var(--op-border)', borderRadius: 1, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(answeredSteps / PROGRESS_STEPS) * 100}%`, background: progressDone ? 'var(--op-accent)' : 'var(--op-accent)', borderRadius: 1, transition: 'width 600ms ease' }} />
          </div>
        </div>
      )}

      {/* Chat area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 160, paddingLeft: 4 }}>
        {displayedMessages.length === 0 && !streamingText && (
          <p style={{ font: "400 14px/1.6 'Inter',sans-serif", color: 'var(--op-text-secondary)', maxWidth: 460, margin: 0 }}>
            {greetingTyped}
            {greetingTyped.length < GREETING.length && (
              <span style={{ display: 'inline-block', width: 2, height: 13, background: 'var(--op-accent)', marginLeft: 1, animation: 'hudCaret 0.8s step-end infinite', verticalAlign: 'text-bottom' }} />
            )}
          </p>
        )}
        {displayedMessages.map((m, i) => (
          <div key={i} style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: m.role === 'user'
              ? 'rgba(232,32,32,0.08)'
              : 'rgba(255,255,255,0.04)',
            border: m.role === 'user'
              ? '1px solid rgba(232,32,32,0.2)'
              : '1px solid var(--op-border)',
            font: "400 13px/1.55 'Inter',sans-serif",
            color: m.role === 'user' ? 'var(--op-text)' : 'var(--op-text-secondary)',
            maxWidth: '90%',
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            {m.content}
          </div>
        ))}
        {streamingText && (
          <div style={{
            padding: '10px 14px', borderRadius: 8,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--op-border)',
            font: "400 13px/1.55 'Inter',sans-serif",
            color: 'var(--op-text-secondary)',
            maxWidth: '90%',
          }}>
            {streamingText}
            <span style={{ display: 'inline-block', width: 2, height: 12, background: 'var(--op-accent)', marginLeft: 2, animation: 'hudCaret 1s step-end infinite', verticalAlign: 'text-bottom' }} />
          </div>
        )}
      </div>

      {/* Lead form */}
      {showLeadForm && (
        <LeadForm
          messages={sharedMessages}
          accentColor="var(--op-accent)"
          onSubmitted={() => setShowLeadForm(false)}
        />
      )}

      {/* Input */}
      <div style={{ marginTop: 'auto' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '6px 6px 6px 16px',
          background: 'rgba(18,22,30,.85)', border: '1px solid var(--op-border-strong)',
          backdropFilter: 'blur(14px)',
          borderRadius: 10,
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
            placeholder="Стоматология, нужен сайт с записью…"
            disabled={busy}
            style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--op-text)', font: "400 14px/1 'Inter',sans-serif", padding: '10px 0', minWidth: 0 }}
          />
          <button onClick={() => send(input)} disabled={busy || !input.trim()} style={{
            background: busy || !input.trim() ? 'rgba(232,32,32,0.3)' : 'var(--op-accent)',
            color: '#fff', border: 0, padding: '0 16px', height: 38,
            font: "600 11px/1 'JetBrains Mono',monospace", letterSpacing: '.1em', textTransform: 'uppercase',
            cursor: busy || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            borderRadius: 6, transition: 'background 150ms ease',
          }}>
            {busy ? '···' : 'Спросить →'}
          </button>
        </div>

        {/* Quick prompts */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          {QUICK_PROMPTS.map(p => (
            <button key={p} onClick={() => send(p)} disabled={busy} style={{
              padding: '6px 12px',
              background: 'transparent', border: '1px solid var(--op-border)',
              color: 'var(--op-text-muted)',
              font: "500 10px/1 'JetBrains Mono',monospace", letterSpacing: '.1em', textTransform: 'uppercase',
              cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.4 : 1,
              borderRadius: 6, transition: 'all 180ms',
            }}
            onMouseEnter={e => { if (!busy) { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--op-accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--op-accent)'; } }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--op-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--op-text-muted)'; }}
            >{p}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

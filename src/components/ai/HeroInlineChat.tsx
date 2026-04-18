'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useVoice } from '@/hooks/useVoice';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface LeadFormData {
  name: string;
  phone: string;
  time: string;
}

const FORM_MARKER = '[SAVE_LEAD]';
const TOTAL_STEPS = 3;

export type SphereSignalState = 'idle' | 'active' | 'listening' | 'responding';

interface HeroInlineChatProps {
  isMobile: boolean;
  initialUserMessage?: string | null;
  firstAssistantMessage: string;
  onClose: () => void;
  onSphereStateChange?: (state: SphereSignalState) => void;
  onAudioLevel?: (level: number) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function genUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getSessionId(): string {
  if (typeof window === 'undefined') return genUUID();
  const key = 'yura_session_id';
  const stored = sessionStorage.getItem(key);
  if (stored) return stored;
  const id = genUUID();
  sessionStorage.setItem(key, id);
  return id;
}

function detectContact(text: string): string | null {
  const tgMatch = text.match(/@[\w]{3,}/u);
  const phoneMatch = text.match(/[+\d][\d\s\-()]{6,}/u);
  if (tgMatch) return tgMatch[0];
  if (phoneMatch) return phoneMatch[0].trim();
  return null;
}

function detectIntent(msgList: ChatMessage[]): 'hot' | 'warm' | 'cold' {
  const lastUser = [...msgList].reverse().find((m) => m.role === 'user')?.content ?? '';
  const lower = lastUser.toLowerCase();
  if (
    lower.includes('делаем') ||
    lower.includes('готов') ||
    lower.includes('хочу заказ') ||
    lower.includes("let's do") ||
    lower.includes("yes let's")
  ) {
    return 'hot';
  }
  if (
    lower.includes('интересует') ||
    lower.includes('расскажите') ||
    lower.includes('сколько') ||
    lower.includes('how much') ||
    lower.includes('interested')
  ) {
    return 'warm';
  }
  return 'cold';
}

// ─── Typing dots ────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 14px' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            display: 'block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'rgba(160, 165, 200, 0.75)',
            animation: `yuraDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Avatar ─────────────────────────────────────────────────────────────────

function YuraAvatar({ size = 32 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
        boxShadow: '0 0 10px rgba(99,102,241,0.5)',
        position: 'relative',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '36%',
          height: '36%',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.38)',
          top: '14%',
          left: '17%',
        }}
      />
    </div>
  );
}

// ─── Lead form (compact) ────────────────────────────────────────────────────

function LeadFormBubble({
  onSubmit,
  isSubmitting,
  submitted,
}: {
  onSubmit: (data: LeadFormData) => void;
  isSubmitting: boolean;
  submitted: boolean;
}) {
  const [data, setData] = useState<LeadFormData>({ name: '', phone: '', time: '' });

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          margin: '4px 0 4px 36px',
          padding: '14px 16px',
          borderRadius: '16px 16px 16px 4px',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.1))',
          border: '1px solid rgba(16,185,129,0.3)',
          color: '#6ee7b7',
          fontSize: 13.5,
          fontWeight: 500,
        }}
      >
        ✓ Заявка отправлена — Олег свяжется с вами лично.
      </motion.div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.06)',
    color: '#F0F0FF',
    fontSize: 13,
    outline: 'none',
    marginBottom: 8,
    minHeight: 44,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        margin: '4px 0 4px 36px',
        padding: '14px',
        borderRadius: '16px 16px 16px 4px',
        background: 'rgba(99,102,241,0.08)',
        border: '1px solid rgba(99,102,241,0.22)',
      }}
    >
      <p style={{ color: '#c4b5fd', fontSize: 13, marginBottom: 12, fontWeight: 500 }}>
        Оставьте контакт — Олег свяжется лично:
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!data.name.trim() || !data.phone.trim()) return;
          onSubmit(data);
        }}
      >
        <input
          style={inputStyle}
          placeholder="Ваше имя *"
          value={data.name}
          onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
          required
        />
        <input
          style={inputStyle}
          placeholder="Телефон или Telegram *"
          value={data.phone}
          onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
          required
        />
        <input
          style={{ ...inputStyle, marginBottom: 12 }}
          placeholder="Удобное время для звонка"
          value={data.time}
          onChange={(e) => setData((d) => ({ ...d, time: e.target.value }))}
        />
        <button
          type="submit"
          disabled={isSubmitting || !data.name.trim() || !data.phone.trim()}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 10,
            border: 'none',
            minHeight: 44,
            background:
              isSubmitting || !data.name.trim() || !data.phone.trim()
                ? 'rgba(99,102,241,0.3)'
                : 'linear-gradient(135deg, #6366F1, #06B6D4)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor:
              isSubmitting || !data.name.trim() || !data.phone.trim()
                ? 'not-allowed'
                : 'pointer',
          }}
        >
          {isSubmitting ? 'Отправляю...' : 'Отправить заявку →'}
        </button>
      </form>
    </motion.div>
  );
}

// ─── Message bubble ─────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        display: 'flex',
        gap: 8,
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
      }}
    >
      {!isUser && <YuraAvatar size={28} />}
      <div
        style={{
          maxWidth: '80%',
          padding: '10px 14px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          background: isUser ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.04)',
          border: isUser
            ? '1px solid rgba(99,102,241,0.35)'
            : '1px solid rgba(255,255,255,0.08)',
          color: 'var(--text)',
          fontSize: '0.9rem',
          lineHeight: 1.6,
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
        }}
      >
        {msg.content}
      </div>
    </motion.div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export default function HeroInlineChat({
  isMobile,
  initialUserMessage,
  firstAssistantMessage,
  onClose,
  onSphereStateChange,
  onAudioLevel,
}: HeroInlineChatProps) {
  const t = useTranslations('ai');

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const base: ChatMessage[] = [{ role: 'assistant', content: firstAssistantMessage }];
    if (initialUserMessage) {
      return [{ role: 'user', content: initialUserMessage }, ...base];
    }
    return base;
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadFormSubmitting, setLeadFormSubmitting] = useState(false);
  const [leadFormSubmitted, setLeadFormSubmitted] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sessionId = useRef<string>('');
  const isAtBottom = useRef(true);

  // Session init
  useEffect(() => {
    sessionId.current = getSessionId();
  }, []);

  // If we started with an initial user message — fetch assistant response for it
  // beyond the pre-generated greeting. But per spec: first_messages is the first
  // assistant message, and if user tapped Yes/No, Yura "responds to it" — so we
  // send the user message through the API to get a real reply, *replacing* the
  // stock greeting context. Actually per spec: "Юра отвечает на него" — keep
  // the first message as intro AND send the user's answer to generate the reply.
  const initialSentRef = useRef(false);
  useEffect(() => {
    if (!initialUserMessage || initialSentRef.current) return;
    initialSentRef.current = true;
    // Fire the request in-background
    void sendToApi(
      [
        { role: 'assistant', content: firstAssistantMessage },
        { role: 'user', content: initialUserMessage },
      ],
      initialUserMessage,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // User-answer counter for progress bar
  const userAnswersCount = messages.filter((m) => m.role === 'user').length;
  const progressPct = Math.min(99, userAnswersCount * 33);
  const questionsLeft = Math.max(0, TOTAL_STEPS - userAnswersCount);

  // Auto-scroll
  const handleMessagesScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    isAtBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  };

  useEffect(() => {
    if (isAtBottom.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    isAtBottom.current = true;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // visualViewport — account for keyboard on mobile
  useEffect(() => {
    if (!isMobile) return;
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const vv = window.visualViewport;
    const updateOffset = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardOffset(offset);
    };
    updateOffset();
    vv.addEventListener('resize', updateOffset);
    vv.addEventListener('scroll', updateOffset);
    return () => {
      vv.removeEventListener('resize', updateOffset);
      vv.removeEventListener('scroll', updateOffset);
    };
  }, [isMobile]);

  // Lead send
  const sendLead = useCallback(
    async (contact: string, msgList: ChatMessage[], name?: string, time?: string) => {
      if (leadSent) return;
      setLeadSent(true);
      const intent = detectIntent(msgList);
      const summary = msgList
        .filter((m) => m.role === 'user')
        .map((m) => m.content)
        .slice(-3)
        .join(' | ');

      try {
        await fetch('/api/leads/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contact,
            name: name || undefined,
            callTime: time || undefined,
            intent,
            summary: summary || 'Нет данных',
            dialog: msgList,
          }),
        });
      } catch (err) {
        console.error('[HeroInlineChat] lead send error:', err);
      }
    },
    [leadSent],
  );

  const handleLeadFormSubmit = useCallback(
    async (data: LeadFormData) => {
      setLeadFormSubmitting(true);
      const allMessages: ChatMessage[] = [
        ...messages,
        {
          role: 'user',
          content: `Имя: ${data.name}, контакт: ${data.phone}${data.time ? `, время: ${data.time}` : ''}`,
        },
      ];
      await sendLead(data.phone, allMessages, data.name, data.time);
      setLeadFormSubmitting(false);
      setLeadFormSubmitted(true);
    },
    [messages, sendLead],
  );

  // API call (shared)
  const sendToApi = useCallback(
    async (fullMessages: ChatMessage[], lastUserText: string) => {
      setIsTyping(true);
      onSphereStateChange?.('responding');
      scrollToBottom();

      const contact = detectContact(lastUserText);

      try {
        const res = await fetch('/api/bots/yura/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: fullMessages, sessionId: sessionId.current }),
        });

        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantText = '';
        let firstContent = true;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantText += chunk;

          const displayText = assistantText.replace(FORM_MARKER, '').trim();

          if (firstContent && displayText) {
            firstContent = false;
            setIsTyping(false);
            setMessages((prev) => [...prev, { role: 'assistant', content: displayText }]);
          } else if (!firstContent) {
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: 'assistant', content: displayText };
              return updated;
            });
          }
        }

        if (firstContent) setIsTyping(false);

        if (assistantText.includes(FORM_MARKER)) {
          setShowLeadForm(true);
        }

        if (contact) {
          const finalMessages: ChatMessage[] = [
            ...fullMessages,
            { role: 'assistant', content: assistantText.replace(FORM_MARKER, '').trim() },
          ];
          sendLead(contact, finalMessages).catch((err) =>
            console.error('[HeroInlineChat] sendLead error:', err),
          );
        }

        // Reset sphere to active state after response done
        onSphereStateChange?.('active');
      } catch (err) {
        console.error('[HeroInlineChat] sendToApi error:', err);
        setIsTyping(false);
        setMessages((prev) => [...prev, { role: 'assistant', content: t('error') }]);
        onSphereStateChange?.('active');
      }
    },
    [onSphereStateChange, sendLead, t],
  );

  const sendMessage = useCallback(
    async (userText: string) => {
      const trimmed = userText.trim();
      if (!trimmed || isTyping) return;

      const newMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
      setMessages(newMessages);
      setInput('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      await sendToApi(newMessages, trimmed);
    },
    [isTyping, messages, sendToApi],
  );

  // ── Voice ──
  const audioLevelRef = useRef(0);
  const audioRafRef = useRef<number | null>(null);

  const { isListening, isSupported, startListening, stopListening, interimTranscript } = useVoice(
    (text) => {
      // Auto-send recognized text
      void sendMessage(text);
    },
  );

  useEffect(() => {
    if (isListening) {
      onSphereStateChange?.('listening');

      // Fake audio level oscillation (no direct mic access via getUserMedia since
      // SpeechRecognition already has it; simulate waveform pulse).
      const start = performance.now();
      const tick = () => {
        const t2 = (performance.now() - start) / 1000;
        const level =
          0.35 + 0.45 * Math.abs(Math.sin(t2 * 6.2)) + 0.2 * Math.abs(Math.sin(t2 * 2.3));
        audioLevelRef.current = Math.min(1, level);
        onAudioLevel?.(audioLevelRef.current);
        audioRafRef.current = requestAnimationFrame(tick);
      };
      audioRafRef.current = requestAnimationFrame(tick);
    } else {
      if (audioRafRef.current) cancelAnimationFrame(audioRafRef.current);
      audioRafRef.current = null;
      audioLevelRef.current = 0;
      onAudioLevel?.(0);
      // If chat not typing, return sphere to active
      if (!isTyping) onSphereStateChange?.('active');
    }
    return () => {
      if (audioRafRef.current) cancelAnimationFrame(audioRafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  const toggleMic = useCallback(() => {
    if (!isSupported) return;
    if (isListening) stopListening();
    else startListening();
  }, [isSupported, isListening, startListening, stopListening]);

  // Input handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 96)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  // ── Render ──
  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: '58svh',
        zIndex: 80,
        background: 'rgba(10,10,24,0.97)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderBottom: 'none',
        borderRadius: '20px 20px 0 0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 -12px 48px rgba(0,0,0,0.55)',
        paddingBottom: keyboardOffset,
        transition: 'padding-bottom 0.2s ease',
      }
    : {
        width: 460,
        maxWidth: '100%',
        height: '100%',
        maxHeight: 620,
        borderRadius: 20,
        background: 'rgba(13,13,26,0.96)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow:
          '0 8px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
      };

  return (
    <motion.div
      layoutId="yura-chat-panel"
      initial={isMobile ? { y: 40, opacity: 0 } : { x: 32, opacity: 0 }}
      animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
      exit={isMobile ? { y: 40, opacity: 0 } : { x: 32, opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      style={panelStyle}
    >
      {/* Accent top */}
      <div
        style={{
          height: 2,
          background: 'linear-gradient(90deg, #6366F1, #06B6D4)',
          flexShrink: 0,
        }}
      />

      {/* Header */}
      <div
        style={{
          padding: '0.875rem 1.1rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexShrink: 0,
        }}
      >
        <YuraAvatar size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'var(--text)',
              lineHeight: 1.2,
            }}
          >
            {t('name')} · {t('online')}
          </div>
          <div
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              marginTop: 2,
            }}
          >
            {t('subtitle')}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label={t('close')}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            borderRadius: '50%',
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="2" y1="2" x2="10" y2="10" />
            <line x1="10" y1="2" x2="2" y2="10" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div
        style={{
          padding: '0.55rem 1.1rem 0.65rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-orbitron), monospace',
            fontSize: '0.62rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: 6,
          }}
        >
          {questionsLeft > 0
            ? t('progress_label', { count: questionsLeft })
            : t('progress_done')}
        </div>
        <div
          style={{
            height: 3,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #6366F1, #06B6D4)',
              boxShadow: '0 0 10px rgba(99,102,241,0.55)',
            }}
          />
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleMessagesScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.1) transparent',
          minHeight: 0,
        }}
      >
        {messages.map((m, i) => (
          <MessageBubble key={i} msg={m} />
        ))}
        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'end', gap: 8 }}>
            <YuraAvatar size={28} />
            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px 16px 16px 4px',
              }}
            >
              <TypingDots />
            </div>
          </div>
        )}
        <AnimatePresence>
          {showLeadForm && (
            <LeadFormBubble
              onSubmit={handleLeadFormSubmit}
              isSubmitting={leadFormSubmitting}
              submitted={leadFormSubmitted}
            />
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: '0.75rem 0.9rem',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'flex-end',
          flexShrink: 0,
          background: 'rgba(0,0,0,0.12)',
        }}
      >
        <textarea
          ref={textareaRef}
          value={isListening && interimTranscript ? interimTranscript : input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? t('mic_listening') : t('placeholder')}
          rows={1}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: '0.625rem 0.875rem',
            color: 'var(--text)',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            maxHeight: 96,
            minHeight: 44,
            overflowY: 'auto',
          }}
        />

        {isSupported && (
          <button
            onClick={toggleMic}
            aria-label={isListening ? t('mic_stop') : t('mic_start')}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              background: isListening
                ? 'linear-gradient(135deg, #EF4444, #DC2626)'
                : 'rgba(255,255,255,0.08)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              animation: isListening ? 'micPulse 1.2s ease-in-out infinite' : undefined,
              transition: 'background 0.2s ease',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
        )}

        <button
          onClick={() => void sendMessage(input)}
          disabled={!input.trim() || isTyping}
          aria-label={t('send')}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: 'none',
            cursor: input.trim() && !isTyping ? 'pointer' : 'default',
            background:
              input.trim() && !isTyping
                ? 'linear-gradient(135deg, #6366F1, #06B6D4)'
                : 'rgba(255,255,255,0.07)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            opacity: input.trim() && !isTyping ? 1 : 0.45,
            transition: 'background 0.15s ease, opacity 0.15s ease',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes yuraDot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%           { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes micPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.7); }
          50%      { box-shadow: 0 0 0 10px rgba(239,68,68,0); }
        }
      `}</style>
    </motion.div>
  );
}

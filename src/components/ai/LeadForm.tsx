'use client';
import { useState } from 'react';

export interface LeadFormData {
  name: string;
  phone: string;
  telegram: string;
}

interface Props {
  messages: { role: string; content: string }[];
  onSubmitted?: () => void;
  accentColor?: string;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  // Normalise: strip leading 7/8
  const local = digits.startsWith('7') ? digits.slice(1) : digits.startsWith('8') ? digits.slice(1) : digits;
  const d = local.slice(0, 10);
  if (!d) return '';
  let result = '+7';
  if (d.length > 0) result += ' (' + d.slice(0, 3);
  if (d.length >= 3) result += ') ' + d.slice(3, 6);
  if (d.length >= 6) result += '-' + d.slice(6, 8);
  if (d.length >= 8) result += '-' + d.slice(8, 10);
  return result;
}

export default function LeadForm({ messages, onSubmitted, accentColor = '#E82020' }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '' || raw === '+') { setPhone(''); return; }
    setPhone(formatPhone(raw));
  };

  const handleTelegram = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    if (v && !v.startsWith('@') && !v.startsWith('+') && v.trim() !== '') {
      v = '@' + v.replace(/^@+/, '');
    }
    setTelegram(v);
  };

  const canSubmit = name.trim() && (phone.replace(/\D/g, '').length >= 11 || telegram.trim().length >= 3);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#F0F0FF',
    font: "400 13px/1 'Inter',sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: 8,
  };

  if (done) return (
    <div style={{
      padding: '14px 16px',
      borderRadius: 10,
      background: 'rgba(16,185,129,0.12)',
      border: '1px solid rgba(16,185,129,0.3)',
      color: '#6ee7b7',
      font: "400 14px/1.5 'Inter',sans-serif",
    }}>
      ✓ Заявка отправлена — Олег свяжется лично.
    </div>
  );

  return (
    <div style={{
      padding: '16px',
      borderRadius: 10,
      background: `rgba(${accentColor === '#E82020' ? '232,32,32' : '99,102,241'},0.07)`,
      border: `1px solid rgba(${accentColor === '#E82020' ? '232,32,32' : '99,102,241'},0.2)`,
    }}>
      <p style={{
        font: "600 12px/1 'JetBrains Mono',monospace",
        color: accentColor,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: '.08em',
      }}>
        Оставьте контакт — Олег свяжется лично
      </p>

      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Ваше имя *"
        style={inputStyle}
      />
      <input
        value={phone}
        onChange={handlePhone}
        placeholder="+7 (___) ___-__-__"
        type="tel"
        inputMode="tel"
        style={inputStyle}
      />
      <input
        value={telegram}
        onChange={handleTelegram}
        placeholder="@telegram (необязательно)"
        style={{ ...inputStyle, marginBottom: 12 }}
      />

      <button
        disabled={submitting || !canSubmit}
        onClick={async () => {
          if (!canSubmit) return;
          setSubmitting(true);
          const summary = messages
            .filter(m => m.role === 'user')
            .map(m => m.content)
            .slice(-3)
            .join(' | ') || 'Нет данных';
          const contactStr = [phone.trim(), telegram.trim()].filter(Boolean).join(' / ');
          await fetch('/api/leads/telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contact: contactStr,
              name: name.trim(),
              intent: 'warm',
              summary,
              dialog: messages.slice(-6),
            }),
          }).catch(() => {});
          setSubmitting(false);
          setDone(true);
          onSubmitted?.();
        }}
        style={{
          width: '100%',
          padding: '11px',
          background: canSubmit && !submitting ? accentColor : `${accentColor}55`,
          border: 'none',
          borderRadius: 8,
          color: '#fff',
          font: "600 11px/1 'JetBrains Mono',monospace",
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed',
          transition: 'background 150ms ease',
        }}
      >
        {submitting ? '···' : 'Отправить заявку →'}
      </button>
    </div>
  );
}

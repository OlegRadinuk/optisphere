'use client';
import { useState, useId } from 'react';
import Navbar from '@/components/sections/Navbar';
import { HudStatusBar, HudCorners, HudRail } from '@/components/hud/HudChrome';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';

type RequestType = 'website' | 'ai' | 'seo' | 'other';

interface FormState {
  name: string;
  contact: string;
  type: RequestType;
  message: string;
}

interface FormErrors {
  contact?: string;
  consent?: string;
}

function ContactForm() {
  const locale = useLocale();
  const isRu = locale === 'ru';
  const nameId = useId();
  const contactId = useId();
  const typeId = useId();
  const messageId = useId();

  const [form, setForm] = useState<FormState>({
    name: '',
    contact: '',
    type: 'website',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (form.contact.trim().length < 5) {
      newErrors.contact = isRu
        ? 'Укажите телефон или Telegram (не менее 5 символов)'
        : 'Enter a phone or Telegram (at least 5 chars)';
    }
    if (!consent) {
      newErrors.consent = isRu
        ? 'Необходимо согласие на обработку персональных данных'
        : 'Consent to personal data processing is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const TYPE_LABELS: Record<RequestType, { ru: string; en: string }> = {
    website: { ru: 'Сайт', en: 'Website' },
    ai: { ru: 'AI-ассистент', en: 'AI Assistant' },
    seo: { ru: 'SEO', en: 'SEO' },
    other: { ru: 'Другое', en: 'Other' },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setBusy(true);
    setServerError('');

    const typeLabel = TYPE_LABELS[form.type][isRu ? 'ru' : 'en'];
    const summary = `Тип: ${typeLabel}.${form.message ? ' ' + form.message : ''}`;

    try {
      const res = await fetch('/api/leads/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: form.contact,
          name: form.name || undefined,
          intent: 'hot',
          summary,
          dialog: [],
        }),
      });

      if (!res.ok) throw new Error('Server error');
      setSuccess(true);
    } catch {
      setServerError(
        isRu
          ? 'Ошибка отправки. Попробуйте ещё раз или напишите напрямую: radinuko@gmail.com'
          : 'Sending error. Try again or write directly: radinuko@gmail.com'
      );
    } finally {
      setBusy(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 48,
    padding: '0 16px',
    background: 'var(--op-surface-overlay)',
    border: '1px solid var(--op-border)',
    borderRadius: 4,
    color: 'var(--op-text)',
    font: "400 14px/1 'Inter',sans-serif",
    outline: 'none',
    transition: 'border-color 150ms',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    font: "500 12px/1 'JetBrains Mono',monospace",
    color: 'var(--op-text-muted)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: 8,
  };

  const errorStyle: React.CSSProperties = {
    font: "400 12px/1.4 'Inter',sans-serif",
    color: '#f87171',
    marginTop: 6,
  };

  if (success) {
    return (
      <div
        style={{
          border: '1px solid var(--op-border-accent)',
          borderRadius: 12,
          padding: '48px',
          textAlign: 'center',
          background:
            'linear-gradient(180deg,rgba(201,166,95,.06),transparent 80%),var(--op-surface-elevated)',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--op-accent-subtle)',
            border: '1px solid var(--op-border-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: 24,
          }}
        >
          ✓
        </div>
        <h3
          style={{
            font: "600 24px/1.2 'Oxanium',sans-serif",
            margin: '0 0 12px',
            color: 'var(--op-text)',
          }}
        >
          {isRu ? 'Спасибо!' : 'Thank you!'}
        </h3>
        <p
          style={{
            font: "400 15px/1.6 'Inter',sans-serif",
            color: 'var(--op-text-secondary)',
            margin: 0,
          }}
        >
          {isRu
            ? 'Отвечу в течение часа в Telegram или по телефону.'
            : "I'll reply within an hour via Telegram or phone."}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      {/* Name */}
      <div>
        <label htmlFor={nameId} style={labelStyle}>
          {isRu ? 'Имя' : 'Name'}
          <span style={{ color: 'var(--op-text-muted)', marginLeft: 4, fontSize: 10 }}>
            {isRu ? '(необязательно)' : '(optional)'}
          </span>
        </label>
        <input
          id={nameId}
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder={isRu ? 'Иван' : 'John'}
          style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--op-accent)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--op-border)')}
        />
      </div>

      {/* Contact */}
      <div>
        <label htmlFor={contactId} style={labelStyle}>
          {isRu ? 'Телефон или Telegram' : 'Phone or Telegram'}
          <span style={{ color: '#f87171', marginLeft: 4 }}>*</span>
        </label>
        <input
          id={contactId}
          type="text"
          value={form.contact}
          onChange={(e) => {
            setForm((f) => ({ ...f, contact: e.target.value }));
            if (errors.contact) setErrors((err) => ({ ...err, contact: undefined }));
          }}
          placeholder={
            isRu ? '+7 900 000 00 00 или @username' : '+7 900 000 00 00 or @username'
          }
          style={{
            ...inputStyle,
            borderColor: errors.contact ? '#f87171' : 'var(--op-border)',
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = errors.contact
              ? '#f87171'
              : 'var(--op-accent)')
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = errors.contact
              ? '#f87171'
              : 'var(--op-border)')
          }
          aria-required="true"
          aria-invalid={errors.contact !== undefined}
          aria-describedby={errors.contact ? `${contactId}-error` : undefined}
        />
        {errors.contact && (
          <p
            id={`${contactId}-error`}
            style={errorStyle}
            role="alert"
            aria-live="polite"
          >
            {errors.contact}
          </p>
        )}
      </div>

      {/* Type */}
      <div>
        <label htmlFor={typeId} style={labelStyle}>
          {isRu ? 'Тип запроса' : 'Request type'}
        </label>
        <select
          id={typeId}
          value={form.type}
          onChange={(e) =>
            setForm((f) => ({ ...f, type: e.target.value as RequestType }))
          }
          style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--op-accent)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--op-border)')}
        >
          <option value="website">{isRu ? 'Сайт' : 'Website'}</option>
          <option value="ai">{isRu ? 'AI-ассистент' : 'AI Assistant'}</option>
          <option value="seo">SEO</option>
          <option value="other">{isRu ? 'Другое' : 'Other'}</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor={messageId} style={labelStyle}>
          {isRu ? 'Сообщение' : 'Message'}
          <span style={{ color: 'var(--op-text-muted)', marginLeft: 4, fontSize: 10 }}>
            {isRu ? '(необязательно)' : '(optional)'}
          </span>
        </label>
        <textarea
          id={messageId}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder={
            isRu
              ? 'Расскажите о вашем бизнесе и задаче...'
              : 'Tell us about your business and task...'
          }
          rows={4}
          style={{
            ...inputStyle,
            height: 'auto',
            padding: '12px 16px',
            resize: 'vertical',
            fontFamily: "'Inter',sans-serif",
            lineHeight: 1.5,
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--op-accent)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--op-border)')}
        />
      </div>

      <label style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        cursor: 'pointer', font: "400 13px/1.5 'Inter',sans-serif", color: 'var(--op-text-muted)',
      }}>
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          style={{ marginTop: 2, width: 16, height: 16, accentColor: 'var(--op-accent)', flexShrink: 0, cursor: 'pointer' }}
        />
        <span>
          {isRu ? 'Согласен на обработку персональных данных в соответствии с ' : 'I consent to personal data processing per the '}
          <a href={isRu ? '/privacy' : '/en/privacy'} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--op-accent)', textDecoration: 'underline' }}>
            {isRu ? 'политикой конфиденциальности' : 'privacy policy'}
          </a>
        </span>
      </label>
      {errors.consent && (
        <p style={errorStyle} role="alert" aria-live="polite">
          {errors.consent}
        </p>
      )}

      {serverError && (
        <p style={errorStyle} role="alert" aria-live="polite">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        style={{
          height: 52,
          padding: '0 32px',
          background: busy ? 'var(--op-border-strong)' : 'var(--op-accent)',
          color: busy ? 'var(--op-text-muted)' : 'var(--op-text-on-accent)',
          border: 'none',
          borderRadius: 0,
          cursor: busy ? 'not-allowed' : 'pointer',
          font: "500 15px/1 'Inter',sans-serif",
          clipPath: busy
            ? 'none'
            : 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
          transition: 'all 200ms',
          alignSelf: 'flex-start',
        }}
        aria-disabled={busy}
      >
        {busy
          ? isRu
            ? 'Отправляем...'
            : 'Sending...'
          : isRu
          ? 'Отправить →'
          : 'Send →'}
      </button>

      <p
        style={{
          font: "400 11px/1.5 'Inter',sans-serif",
          color: 'var(--op-text-muted)',
          margin: 0,
        }}
      >
        {isRu ? 'Нажимая «Отправить», вы соглашаетесь с ' : 'By clicking Send you agree to the '}
        <Link
          href="/privacy"
          style={{ color: 'var(--op-text-muted)', textDecoration: 'underline' }}
        >
          {isRu ? 'политикой обработки ПД' : 'privacy policy'}
        </Link>
        .
      </p>
    </form>
  );
}

export default function ContactPageClient() {
  const locale = useLocale();
  const isRu = locale === 'ru';

  return (
    <main style={{ minHeight: '100vh', background: 'var(--op-base)' }}>
      <HudStatusBar />
      <HudCorners />
      <HudRail />
      <Navbar />

      <section style={{ padding: '64px 0 96px' }}>
        <div
          style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}
          className="contact-container"
        >
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              font: "400 12px/1 'JetBrains Mono',monospace",
              color: 'var(--op-text-muted)',
              letterSpacing: '0.08em',
              marginBottom: 48,
            }}
          >
            <Link
              href="/"
              style={{ color: 'var(--op-text-muted)', textDecoration: 'none' }}
            >
              {isRu ? 'Главная' : 'Home'}
            </Link>
            <span style={{ opacity: 0.4 }}>›</span>
            <span>{isRu ? 'Контакт' : 'Contact'}</span>
          </nav>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 64,
              alignItems: 'start',
            }}
            className="contact-grid"
          >
            {/* Left: info */}
            <div>
              <p
                style={{
                  font: "500 11px/1 'JetBrains Mono',monospace",
                  color: 'var(--op-accent)',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  margin: '0 0 16px',
                }}
              >
                {isRu ? '// КОНТАКТ' : '// CONTACT'}
              </p>
              <h1
                style={{
                  font: "700 52px/1.05 'Oxanium',sans-serif",
                  letterSpacing: '-0.03em',
                  margin: '0 0 20px',
                  color: 'var(--op-text)',
                }}
                className="contact-title"
              >
                {isRu ? 'Обсудим ваш проект' : "Let's discuss your project"}
              </h1>
              <p
                style={{
                  font: "400 16px/1.6 'Inter',sans-serif",
                  color: 'var(--op-text-secondary)',
                  margin: '0 0 40px',
                }}
              >
                {isRu
                  ? 'Отвечаю в течение часа в Telegram или по телефону. Без лишних вопросов — только по делу.'
                  : 'I reply within an hour via Telegram or phone. No fluff — straight to the point.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '16px 20px',
                    border: '1px solid var(--op-border)',
                    borderRadius: 8,
                    background: 'var(--op-surface-elevated)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: 'var(--op-accent-subtle)',
                      border: '1px solid var(--op-border-accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: 18,
                    }}
                  >
                    ✈
                  </div>
                  <div>
                    <p
                      style={{
                        font: "500 12px/1 'JetBrains Mono',monospace",
                        color: 'var(--op-text-muted)',
                        letterSpacing: '0.1em',
                        margin: '0 0 4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Telegram
                    </p>
                    <a
                      href="https://t.me/aleg_rad"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        font: "400 15px/1 'Inter',sans-serif",
                        color: 'var(--op-text)',
                        textDecoration: 'none',
                      }}
                    >
                      @aleg_rad
                    </a>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '16px 20px',
                    border: '1px solid var(--op-border)',
                    borderRadius: 8,
                    background: 'var(--op-surface-elevated)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: 'var(--op-surface-overlay)',
                      border: '1px solid var(--op-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: 18,
                    }}
                  >
                    @
                  </div>
                  <div>
                    <p
                      style={{
                        font: "500 12px/1 'JetBrains Mono',monospace",
                        color: 'var(--op-text-muted)',
                        letterSpacing: '0.1em',
                        margin: '0 0 4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Email
                    </p>
                    <a
                      href="mailto:radinuko@gmail.com"
                      style={{
                        font: "400 15px/1 'Inter',sans-serif",
                        color: 'var(--op-text)',
                        textDecoration: 'none',
                      }}
                    >
                      radinuko@gmail.com
                    </a>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 16px',
                    background: 'var(--op-accent-subtle)',
                    border: '1px solid var(--op-border-accent)',
                    borderRadius: 6,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--op-accent)',
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      font: "400 12px/1.4 'JetBrains Mono',monospace",
                      color: 'var(--op-accent)',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {isRu
                      ? 'Ответ в течение 1 часа · Крым, вся Россия'
                      : 'Reply within 1 hour · Crimea, all Russia'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: form */}
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .contact-container { padding: 0 24px !important; }
          .contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .contact-title { font-size: 38px !important; }
        }
      `}</style>
    </main>
  );
}

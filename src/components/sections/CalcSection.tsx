'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CalcAnswers {
  business: number | null;
  type: number | null;
  features: number[];
  timeline: number | null;
}

interface CalcResult {
  min: number;
  max: number;
  tier: 'start' | 'pro' | 'premium';
  days: string;
}

// ─── Calculation logic ────────────────────────────────────────────────────────

function calculate(answers: CalcAnswers): CalcResult {
  let min = 90_000;
  let max = 150_000;
  let tier: CalcResult['tier'] = 'start';
  let days = '3–5 дней';

  if (answers.type === 1) {
    min = 180_000; max = 280_000; tier = 'pro'; days = '5–10 дней';
  } else if (answers.type === 2) {
    min = 280_000; max = 420_000; tier = 'premium'; days = '10–20 дней';
  }

  if (answers.features.includes(0)) {
    min += 20_000; max += 20_000;
    if (tier === 'start') { tier = 'pro'; days = '5–10 дней'; }
  }

  if (answers.timeline === 0) {
    min = Math.round(min * 1.3);
    max = Math.round(max * 1.3);
  }

  return { min, max, tier, days };
}

function formatPrice(n: number): string {
  return n.toLocaleString('ru-RU') + ' ₽';
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TIER_LABELS: Record<CalcResult['tier'], string> = {
  start: 'START',
  pro: 'PRO',
  premium: 'PREMIUM',
};

// ─── Progress indicator ───────────────────────────────────────────────────────

function StepCounter({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
      <span style={{
        font: "500 11px/1 'JetBrains Mono',monospace",
        letterSpacing: '.14em',
        textTransform: 'uppercase' as const,
        color: 'var(--op-accent)',
      }}>
        {String(step + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? 24 : 6,
              height: 2,
              borderRadius: 1,
              background: i < step
                ? 'var(--op-accent)'
                : i === step
                  ? 'var(--op-accent)'
                  : 'var(--op-border-strong)',
              opacity: i < step ? 0.4 : 1,
              transition: 'all 300ms ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Option button ────────────────────────────────────────────────────────────

function OptionButton({ label, selected, onClick }: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: selected ? 'rgba(232,32,32,0.08)' : 'transparent',
        border: selected ? '1px solid var(--op-accent)' : '1px solid var(--op-border)',
        borderRadius: 6,
        padding: '14px 16px',
        display: 'block',
        cursor: 'pointer',
        transition: 'all 140ms ease',
        textAlign: 'left' as const,
        width: '100%',
        font: "500 13px/1 'Inter',sans-serif",
        color: selected ? 'var(--op-text)' : 'var(--op-text-secondary)',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--op-border-strong)';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--op-text)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--op-border)';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--op-text-secondary)';
        }
      }}
    >
      {label}
    </button>
  );
}

// ─── Multi-select button ──────────────────────────────────────────────────────

function MultiButton({ label, selected, onClick }: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: selected ? 'rgba(232,32,32,0.08)' : 'transparent',
        border: selected ? '1px solid var(--op-accent)' : '1px solid var(--op-border)',
        borderRadius: 6,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        cursor: 'pointer',
        transition: 'all 140ms ease',
        textAlign: 'left' as const,
        width: '100%',
        font: "500 13px/1 'Inter',sans-serif",
        color: selected ? 'var(--op-text)' : 'var(--op-text-secondary)',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--op-border-strong)';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--op-text)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--op-border)';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--op-text-secondary)';
        }
      }}
    >
      <span style={{ flex: 1, lineHeight: 1.4 }}>{label}</span>
      {selected && (
        <span style={{
          width: 16, height: 16, borderRadius: 3,
          background: 'var(--op-accent)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: '9px', color: '#fff', fontWeight: 700,
          fontFamily: 'monospace',
        }}>
          ✓
        </span>
      )}
    </button>
  );
}

// ─── Step slide variants ──────────────────────────────────────────────────────

function stepVariants(direction: 1 | -1) {
  return {
    initial: { x: direction * 60, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: direction * -60, opacity: 0 },
  };
}

// ─── Step title ───────────────────────────────────────────────────────────────

function StepTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      font: "600 13px/1 'JetBrains Mono',monospace",
      letterSpacing: '.1em',
      textTransform: 'uppercase' as const,
      color: 'var(--op-text-muted)',
      marginBottom: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    }}>
      <span style={{ color: 'var(--op-accent)', fontSize: '10px' }}>◆</span>
      {children}
    </p>
  );
}

// ─── Result card ──────────────────────────────────────────────────────────────

function ResultCard({ result, onOpti }: { result: CalcResult; onOpti: () => void }) {
  const tCalc = useTranslations('calculator');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      <div style={{ textAlign: 'center' }}>
        <span style={{
          font: "500 10px/1 'JetBrains Mono',monospace",
          letterSpacing: '.14em',
          textTransform: 'uppercase' as const,
          color: 'var(--op-text-muted)',
        }}>
          {tCalc('result.title')}
        </span>
      </div>

      <div style={{
        padding: '24px',
        borderRadius: 8,
        background: 'rgba(232,32,32,0.05)',
        border: '1px solid var(--op-border-accent, rgba(232,32,32,0.25))',
        textAlign: 'center',
      }}>
        <div style={{
          font: "700 32px/1 'Oxanium',sans-serif",
          color: 'var(--op-accent)',
          letterSpacing: '-0.02em',
        }}>
          {formatPrice(result.min)}
          <span style={{ color: 'var(--op-text-muted)', fontWeight: 400, fontSize: '0.55em' }}>{' '}—{' '}</span>
          {formatPrice(result.max)}
        </div>
        <p style={{ color: 'var(--op-text-muted)', marginTop: '0.5rem', font: "400 13px/1 'Inter',sans-serif" }}>
          {result.days}
        </p>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 1.25rem', borderRadius: 8,
        background: 'var(--op-surface)', border: '1px solid var(--op-border)',
      }}>
        <span style={{
          font: "500 10px/1 'JetBrains Mono',monospace",
          letterSpacing: '.14em',
          textTransform: 'uppercase' as const,
          color: 'var(--op-text-muted)',
        }}>
          {tCalc('result.tier_label')}
        </span>
        <span style={{
          font: "600 10px/1 'JetBrains Mono',monospace",
          letterSpacing: '.1em',
          background: 'var(--op-accent)',
          color: '#fff',
          padding: '4px 10px',
          borderRadius: 4,
        }}>
          {TIER_LABELS[result.tier]}
        </span>
      </div>

      <button
        onClick={onOpti}
        className="btn btn-primary"
        style={{
          width: '100%', height: 48,
          justifyContent: 'center', fontSize: '0.9375rem',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          borderRadius: 8, cursor: 'pointer',
        }}
      >
        {tCalc('result.cta')}
      </button>
    </motion.div>
  );
}

// ─── CalcSection ──────────────────────────────────────────────────────────────

export default function CalcSection() {
  const t = useTranslations('calculator');

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [answers, setAnswers] = useState<CalcAnswers>({ business: null, type: null, features: [], timeline: null });
  const [result, setResult] = useState<CalcResult | null>(null);

  const TOTAL_STEPS = 4;

  const businessOptions = t.raw('steps.business.options') as string[];
  const typeOptions = t.raw('steps.type.options') as string[];
  const featureOptions = t.raw('steps.features.options') as string[];
  const timelineOptions = t.raw('steps.timeline.options') as string[];

  function goNext() {
    if (step < TOTAL_STEPS - 1) { setDirection(1); setStep((s) => s + 1); }
    else { setResult(calculate(answers)); }
  }

  function goBack() {
    if (step > 0) { setDirection(-1); setStep((s) => s - 1); }
  }

  function canProceed(): boolean {
    if (step === 0) return answers.business !== null;
    if (step === 1) return answers.type !== null;
    if (step === 2) return true;
    if (step === 3) return answers.timeline !== null;
    return false;
  }

  function openOpti(calcResult: CalcResult) {
    window.dispatchEvent(new CustomEvent('opti-open', { detail: { calcResult } }));
  }

  const slideVariants = stepVariants(direction);

  return (
    <section id="calc" style={{ padding: '96px 0', background: 'var(--op-base)', position: 'relative', overflow: 'hidden' }}>
      {/* Background dot grid */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '28px 28px', pointerEvents: 'none',
      }} />

      {/* Ambient glow */}
      <div aria-hidden style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 700, height: 500,
        background: 'radial-gradient(ellipse at center, rgba(232,32,32,0.06) 0%, rgba(232,32,32,0.02) 45%, transparent 72%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px', position: 'relative', zIndex: 1 }} className="section-container">
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '3rem', textAlign: 'center' }}>
          <span style={{
            font: "500 11px/1 'JetBrains Mono',monospace",
            letterSpacing: '.14em',
            textTransform: 'uppercase' as const,
            color: 'var(--op-accent)',
          }}>
            КАЛЬКУЛЯТОР
          </span>
          <h2 style={{
            font: "600 clamp(34px,5vw,60px)/1.02 'Oxanium',sans-serif",
            letterSpacing: '-0.025em',
            color: 'var(--op-text)',
            margin: 0,
            textTransform: 'uppercase' as const,
          }}>
            {t('title')}
          </h2>
        </div>

        {/* Card */}
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{
            background: 'var(--op-surface)',
            border: '1px solid var(--op-border)',
            borderRadius: 12,
            padding: 'clamp(1.5rem, 4vw, 2rem)',
            overflow: 'hidden',
          }}>
            {result ? (
              <ResultCard result={result} onOpti={() => openOpti(result)} />
            ) : (
              <>
                <StepCounter step={step} total={TOTAL_STEPS} />

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={step}
                    variants={slideVariants}
                    initial="initial" animate="animate" exit="exit"
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <StepTitle>
                      {step === 0 && t('steps.business.title')}
                      {step === 1 && t('steps.type.title')}
                      {step === 2 && t('steps.features.title')}
                      {step === 3 && t('steps.timeline.title')}
                    </StepTitle>

                    {step === 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem' }}>
                        {businessOptions.map((opt, i) => (
                          <OptionButton key={i} label={opt} selected={answers.business === i} onClick={() => setAnswers((a) => ({ ...a, business: i }))} />
                        ))}
                      </div>
                    )}

                    {step === 1 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }} className="calc-type-grid">
                        {typeOptions.map((opt, i) => (
                          <OptionButton key={i} label={opt} selected={answers.type === i} onClick={() => setAnswers((a) => ({ ...a, type: i }))} />
                        ))}
                      </div>
                    )}

                    {step === 2 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {featureOptions.map((opt, i) => (
                          <MultiButton
                            key={i}
                            label={opt}
                            selected={answers.features.includes(i)}
                            onClick={() => setAnswers((a) => ({
                              ...a,
                              features: a.features.includes(i)
                                ? a.features.filter((f) => f !== i)
                                : [...a.features, i],
                            }))}
                          />
                        ))}
                      </div>
                    )}

                    {step === 3 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {timelineOptions.map((opt, i) => (
                          <OptionButton key={i} label={opt} selected={answers.timeline === i} onClick={() => setAnswers((a) => ({ ...a, timeline: i }))} />
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', gap: '1rem' }}>
                  {step > 0 ? (
                    <button
                      onClick={goBack}
                      style={{
                        height: 40, padding: '0 20px', borderRadius: 6,
                        background: 'transparent',
                        color: 'var(--op-text-muted)',
                        border: '1px solid var(--op-border-strong)',
                        cursor: 'pointer',
                        font: "600 11px/1 'JetBrains Mono',monospace",
                        letterSpacing: '.1em',
                        textTransform: 'uppercase' as const,
                      }}
                    >
                      {t('nav.back')}
                    </button>
                  ) : <div />}

                  <button
                    onClick={goNext}
                    disabled={!canProceed()}
                    style={{
                      height: 40, padding: '0 20px', borderRadius: 6,
                      background: canProceed() ? 'var(--op-accent)' : 'rgba(232,32,32,0.25)',
                      color: '#fff', border: 'none',
                      cursor: canProceed() ? 'pointer' : 'not-allowed',
                      font: "600 11px/1 'JetBrains Mono',monospace",
                      letterSpacing: '.1em',
                      textTransform: 'uppercase' as const,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {step === TOTAL_STEPS - 1 ? t('nav.calculate') : t('nav.next')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 640px) {
          .calc-type-grid { display: grid !important; grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}

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

// ─── Step icons ──────────────────────────────────────────────────────────────

const BUSINESS_ICONS = ['🏨', '🏗️', '🏥', '💼'];
const TYPE_ICONS = ['📄', '🖥️', '🛒'];
const FEATURE_ICONS = ['🤖', '📬', '📦', '🔍'];
const TIMELINE_ICONS = ['⚡', '📅', '🌿'];

const TIER_LABELS: Record<CalcResult['tier'], string> = {
  start: 'START',
  pro: 'PRO',
  premium: 'PREMIUM',
};

const TIER_COLORS: Record<CalcResult['tier'], string> = {
  start: '#06B6D4',
  pro: '#6366F1',
  premium: 'var(--op-accent)',
};

// ─── Progress bar ─────────────────────────────────────────────────────────────

const STEP_LABELS = ['Бизнес', 'Тип', 'Функции', 'Сроки'];

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: i <= step ? '#6366F1' : 'var(--op-surface-overlay)',
                border: i <= step ? '2px solid #6366F1' : '2px solid var(--op-border-strong)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s ease', position: 'relative', zIndex: 1,
              }}>
                {i < step ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700,
                    color: i === step ? '#fff' : 'var(--op-text-muted)',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {i + 1}
                  </span>
                )}
              </div>
              {i === step && (
                <motion.div
                  animate={{ scale: [1, 1.7, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute', inset: -2, borderRadius: '50%',
                    border: '1.5px solid #6366F1',
                  }}
                />
              )}
            </div>
            {i < total - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '0 4px',
                background: i < step
                  ? 'linear-gradient(90deg, #6366F1, rgba(99,102,241,0.4))'
                  : 'var(--op-border)',
                transition: 'background 0.4s ease', borderRadius: 1,
              }} />
            )}
          </div>
        ))}
      </div>

      <div className="calc-step-labels" style={{ display: 'flex', marginTop: '0.5rem' }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ flex: 1, display: 'flex' }}>
            <span style={{
              fontSize: '0.6rem',
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: i === step ? '#6366F1' : i < step ? 'rgba(99,102,241,0.5)' : 'var(--op-text-muted)',
              opacity: i === step ? 1 : 0.6, transition: 'color 0.3s ease', paddingLeft: 2,
            }}>
              {STEP_LABELS[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Option card ──────────────────────────────────────────────────────────────

function OptionCard({ icon, label, selected, onClick }: {
  icon: string; label: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: selected ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
        border: selected ? '1px solid rgba(99,102,241,0.5)' : '1px solid var(--op-border)',
        borderRadius: 12, padding: '1rem',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem',
        cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left', width: '100%', minHeight: 44,
      }}
      onMouseEnter={(e) => { if (!selected) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--op-border-strong)'; }}
      onMouseLeave={(e) => { if (!selected) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--op-border)'; }}
    >
      <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: selected ? 'var(--op-text)' : 'var(--op-text-secondary)', lineHeight: 1.4 }}>
        {label}
      </span>
    </button>
  );
}

// ─── Multi-select card ────────────────────────────────────────────────────────

function MultiCard({ icon, label, selected, onClick }: {
  icon: string; label: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: selected ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
        border: selected ? '1px solid rgba(99,102,241,0.5)' : '1px solid var(--op-border)',
        borderRadius: 12, padding: '0.875rem 1rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left', width: '100%', minHeight: 44,
      }}
    >
      <span style={{ fontSize: '1.25rem', lineHeight: 1, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: selected ? 'var(--op-text)' : 'var(--op-text-secondary)', lineHeight: 1.4, flex: 1 }}>
        {label}
      </span>
      {selected && (
        <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#6366F1', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.65rem', color: '#fff', fontWeight: 700 }}>
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

// ─── Result card ──────────────────────────────────────────────────────────────

function ResultCard({ result, onYura }: { result: CalcResult; onYura: () => void }) {
  const tCalc = useTranslations('calculator');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      <div style={{ textAlign: 'center' }}>
        <span style={{ font: "500 11px/1 'JetBrains Mono',monospace", letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--op-text-muted)' }}>
          {tCalc('result.title')}
        </span>
      </div>

      <div style={{
        textAlign: 'center', padding: '2rem', borderRadius: 12,
        background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)',
      }}>
        <div style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--op-text)' }}>
          {formatPrice(result.min)}
          <span style={{ color: 'var(--op-text-muted)', fontWeight: 400, fontSize: '0.6em' }}>{' '}—{' '}</span>
          {formatPrice(result.max)}
        </div>
        <p style={{ color: 'var(--op-text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          {result.days}
        </p>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 1.25rem', borderRadius: 12,
        background: 'rgba(255,255,255,0.03)', border: '1px solid var(--op-border)',
      }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--op-text-muted)' }}>
          {tCalc('result.tier_label')}
        </span>
        <span style={{ font: "600 0.75rem/1 'JetBrains Mono',monospace", letterSpacing: '0.1em', color: TIER_COLORS[result.tier] }}>
          {TIER_LABELS[result.tier]}
        </span>
      </div>

      <button
        onClick={onYura}
        style={{
          width: '100%', height: 48, justifyContent: 'center', fontSize: '1rem',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          borderRadius: 8, background: '#6366F1', color: '#fff', border: 'none',
          cursor: 'pointer', font: "500 15px/1 'Inter',sans-serif",
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

  function openYura(calcResult: CalcResult) {
    window.dispatchEvent(new CustomEvent('yura-open', { detail: { calcResult } }));
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
        background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.09) 0%, rgba(6,182,212,0.04) 45%, transparent 72%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '3rem', textAlign: 'center' }}>
          <span style={{ font: "500 11px/1 'JetBrains Mono',monospace", letterSpacing: '.14em', textTransform: 'uppercase', color: '#6366F1' }}>
            КАЛЬКУЛЯТОР
          </span>
          <h2 style={{ font: "600 clamp(34px,5vw,60px)/1.02 'Oxanium',sans-serif", letterSpacing: '-0.025em', color: 'var(--op-text)', margin: 0, textTransform: 'uppercase' }}>
            {t('title')}
          </h2>
        </div>

        {/* Card */}
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{
            background: 'var(--op-surface-elevated)', border: '1px solid var(--op-border)',
            borderRadius: 16, padding: 'clamp(1.5rem, 4vw, 2.5rem)', overflow: 'hidden',
          }}>
            {result ? (
              <ResultCard result={result} onYura={() => openYura(result)} />
            ) : (
              <>
                <ProgressBar step={step} total={TOTAL_STEPS} />

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={step}
                    variants={slideVariants}
                    initial="initial" animate="animate" exit="exit"
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--op-text)', marginBottom: '1.25rem', lineHeight: 1.3 }}>
                      {step === 0 && t('steps.business.title')}
                      {step === 1 && t('steps.type.title')}
                      {step === 2 && t('steps.features.title')}
                      {step === 3 && t('steps.timeline.title')}
                    </p>

                    {step === 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                        {businessOptions.map((opt, i) => (
                          <OptionCard key={i} icon={BUSINESS_ICONS[i] ?? '📌'} label={opt} selected={answers.business === i} onClick={() => setAnswers((a) => ({ ...a, business: i }))} />
                        ))}
                      </div>
                    )}

                    {step === 1 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="calc-type-grid">
                        {typeOptions.map((opt, i) => (
                          <OptionCard key={i} icon={TYPE_ICONS[i] ?? '🖥️'} label={opt} selected={answers.type === i} onClick={() => setAnswers((a) => ({ ...a, type: i }))} />
                        ))}
                      </div>
                    )}

                    {step === 2 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {featureOptions.map((opt, i) => (
                          <MultiCard key={i} icon={FEATURE_ICONS[i] ?? '⚙️'} label={opt} selected={answers.features.includes(i)}
                            onClick={() => setAnswers((a) => ({ ...a, features: a.features.includes(i) ? a.features.filter((f) => f !== i) : [...a.features, i] }))}
                          />
                        ))}
                      </div>
                    )}

                    {step === 3 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {timelineOptions.map((opt, i) => (
                          <OptionCard key={i} icon={TIMELINE_ICONS[i] ?? '📅'} label={opt} selected={answers.timeline === i} onClick={() => setAnswers((a) => ({ ...a, timeline: i }))} />
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', gap: '1rem' }}>
                  {step > 0 ? (
                    <button onClick={goBack} style={{ minWidth: 100, height: 40, padding: '0 16px', borderRadius: 8, background: 'transparent', color: 'var(--op-text-secondary)', border: '1px solid var(--op-border-strong)', cursor: 'pointer', font: "500 14px/1 'Inter',sans-serif" }}>
                      {t('nav.back')}
                    </button>
                  ) : <div />}

                  <button
                    onClick={goNext}
                    disabled={!canProceed()}
                    style={{
                      minWidth: 140, height: 40, padding: '0 20px', borderRadius: 8,
                      background: canProceed() ? '#6366F1' : 'rgba(99,102,241,0.3)',
                      color: '#fff', border: 'none',
                      cursor: canProceed() ? 'pointer' : 'not-allowed',
                      font: "500 14px/1 'Inter',sans-serif",
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
        @media (max-width: 480px) {
          .calc-step-labels { display: none !important; }
        }
      `}</style>
    </section>
  );
}

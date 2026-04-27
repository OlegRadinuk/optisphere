'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import SectionIntro from '@/components/hud/SectionIntro';

interface TierData {
  name: string;
  price: string;
  days: string;
  desc: string;
  badge?: string;
}

const CORPORATE = {
  name: 'Корпоративный',
  price: 'обсуждается',
  days: '1–3 мес',
  desc: 'Индивидуально',
  cta: 'Обсудить',
  featured: false,
};

export default function PricingSection() {
  const t = useTranslations('pricing');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  const tiers: Array<TierData & { key: 'start' | 'pro' | 'premium'; cta: string; featured: boolean }> = [
    { key: 'start',   ...(t.raw('tiers.start')   as TierData), cta: t('cta.discuss'),  featured: false },
    { key: 'pro',     ...(t.raw('tiers.pro')      as TierData), cta: t('cta.discuss'),  featured: true  },
    { key: 'premium', ...(t.raw('tiers.premium')  as TierData), cta: t('cta.discuss'),  featured: false },
  ];

  return (
    <section id="pricing" style={{ padding: '96px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }} className="section-container" ref={ref}>
        <SectionIntro code="07" cmd="pricing.estimate()" title={t('title')} sub={t('subtitle')} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }} className="pricing-grid">
          {tiers.map((tier, index) => (
            <motion.article
              key={tier.key}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: tier.featured
                  ? 'linear-gradient(180deg,rgba(232,32,32,.06),transparent 60%),var(--op-surface-elevated)'
                  : 'var(--op-surface-elevated)',
                border: tier.featured ? '1px solid var(--op-border-accent)' : '1px solid var(--op-border)',
                borderRadius: tier.featured ? 16 : 12,
                padding: 24, display: 'flex', flexDirection: 'column', gap: 18,
                minHeight: 360, position: 'relative',
                transform: tier.featured ? 'translateY(-8px)' : 'none',
              }}
            >
              {tier.featured && tier.badge && (
                <span style={{ position: 'absolute', top: -10, left: 24, background: 'var(--op-accent)', color: 'var(--op-text-on-accent)', padding: '4px 10px', borderRadius: 999, font: "500 11px/1 'Inter',sans-serif" }}>
                  {tier.badge}
                </span>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ font: "500 13px/1 'Inter',sans-serif", color: tier.featured ? 'var(--op-accent)' : 'var(--op-text)', letterSpacing: '-0.005em' }}>{tier.name}</span>
                <span style={{ font: "500 32px/1 'Inter',sans-serif", color: 'var(--op-text)', letterSpacing: '-0.025em' }}>{tier.price}</span>
                <span style={{ font: "400 12px/1 'JetBrains Mono',monospace", color: 'var(--op-text-muted)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{tier.days}</span>
              </div>
              <p style={{ font: "400 14px/1.55 'Inter',sans-serif", color: 'var(--op-text-secondary)', margin: 0 }}>{tier.desc}</p>
              <button onClick={() => window.dispatchEvent(new CustomEvent('opti-open'))} style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 36, padding: '0 14px', borderRadius: 8, background: tier.featured ? 'var(--op-accent)' : 'transparent', color: tier.featured ? 'var(--op-text-on-accent)' : 'var(--op-text)', border: tier.featured ? 'none' : '1px solid var(--op-border-strong)', cursor: 'pointer', font: "500 13px/1 'Inter',sans-serif" }}>
                {tier.cta} →
              </button>
            </motion.article>
          ))}

          {/* Corporate tier — stays hardcoded as per spec */}
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 3 * 0.08, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: 'var(--op-surface-elevated)',
              border: '1px solid var(--op-border)',
              borderRadius: 12,
              padding: 24, display: 'flex', flexDirection: 'column', gap: 18,
              minHeight: 360, position: 'relative',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ font: "500 13px/1 'Inter',sans-serif", color: 'var(--op-text)', letterSpacing: '-0.005em' }}>{CORPORATE.name}</span>
              <span style={{ font: "500 32px/1 'Inter',sans-serif", color: 'var(--op-text)', letterSpacing: '-0.025em' }}>{CORPORATE.price}</span>
              <span style={{ font: "400 12px/1 'JetBrains Mono',monospace", color: 'var(--op-text-muted)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{CORPORATE.days}</span>
            </div>
            <p style={{ font: "400 14px/1.55 'Inter',sans-serif", color: 'var(--op-text-secondary)', margin: 0 }}>{CORPORATE.desc}</p>
            <button onClick={() => window.dispatchEvent(new CustomEvent('opti-open'))} style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 36, padding: '0 14px', borderRadius: 8, background: 'transparent', color: 'var(--op-text)', border: '1px solid var(--op-border-strong)', cursor: 'pointer', font: "500 13px/1 'Inter',sans-serif" }}>
              {CORPORATE.cta} →
            </button>
          </motion.article>
        </div>
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <a onClick={() => document.getElementById('calc')?.scrollIntoView({ behavior: 'smooth' })} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, font: "500 14px/1 'Inter',sans-serif", color: 'var(--op-accent)', textDecoration: 'none', cursor: 'pointer' }}>
            Рассчитать стоимость вашего проекта →
          </a>
        </div>
      </div>
      <style>{`@media(max-width:900px){.pricing-grid{grid-template-columns:repeat(2,1fr)!important;}}@media(max-width:640px){.pricing-grid{grid-template-columns:1fr!important;}}`}</style>
    </section>
  );
}

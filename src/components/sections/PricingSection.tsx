'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';

// ─── Feature include/exclude flags ───────────────────────────────────────────

const START_INCLUDED  = [true, true, true, true, false];
const PRO_INCLUDED    = [true, true, true, true, true];
const PREMIUM_INCLUDED = [true, true, true, true, true];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function CheckIcon({ ok }: { ok: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{
        fontSize: '0.85rem',
        color: ok ? 'var(--cyan)' : 'var(--text-faint)',
        fontWeight: 600,
        minWidth: '1.2rem',
        display: 'inline-block',
      }}
    >
      {ok ? '✓' : '—'}
    </span>
  );
}

// ─── One-time Project Card ────────────────────────────────────────────────────

interface ProjectCardProps {
  name: string;
  price: string;
  days: string;
  desc: string;
  features: { label: string; included: boolean }[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
  badge?: string;
  accentColor?: string;
  index: number;
}

function ProjectCard({
  name,
  price,
  days,
  desc,
  features,
  cta,
  ctaHref,
  highlighted = false,
  badge,
  accentColor,
  index,
}: ProjectCardProps) {
  const accent = accentColor ?? (highlighted ? 'var(--indigo)' : 'var(--text-muted)');
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.5,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        position: 'relative',
        borderRadius: 'var(--r-lg)',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        border: highlighted
          ? '1px solid rgba(99,102,241,0.4)'
          : '1px solid var(--border)',
        background: highlighted
          ? 'rgba(18,18,31,0.85)'
          : 'rgba(10,10,24,0.6)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: highlighted
          ? '0 0 60px rgba(99,102,241,0.15), 0 0 120px rgba(99,102,241,0.07)'
          : 'none',
        zIndex: highlighted ? 1 : 0,
        overflow: 'hidden',
      }}
    >
      {/* Accent top bar */}
      <div style={{
        height: 3,
        background: accentColor
          ? `linear-gradient(90deg, ${accentColor}, transparent)`
          : highlighted
          ? 'linear-gradient(90deg, var(--indigo), var(--cyan))'
          : 'linear-gradient(90deg, rgba(255,255,255,0.08), transparent)',
        flexShrink: 0,
      }} />
      <div style={{
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        flex: 1,
      }}>
      {/* Popular badge */}
      {badge && (
        <div
          style={{
            position: 'absolute',
            top: '-14px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '0.3rem 1rem',
            borderRadius: 'var(--r-full)',
            border: '1px solid rgba(99,102,241,0.5)',
            background: 'rgba(99,102,241,0.15)',
            backdropFilter: 'blur(8px)',
            whiteSpace: 'nowrap',
          }}
        >
          <span className="section-label" style={{ color: 'var(--indigo)' }}>
            {badge}
          </span>
        </div>
      )}

      {/* Tier name */}
      <span className="section-label" style={{ color: 'var(--text-muted)' }}>
        {name}
      </span>

      {/* Price */}
      <div>
        <div
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {highlighted ? (
            <span className="gradient-indigo-cyan">{price}</span>
          ) : (
            <span style={{ color: 'var(--text)' }}>{price}</span>
          )}
        </div>
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            marginTop: '0.25rem',
          }}
        >
          {days}
        </p>
      </div>

      {/* Description */}
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
        {desc}
      </p>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border)' }} />

      {/* Feature list */}
      <ul
        style={{
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          flex: 1,
        }}
      >
        {features.map((f) => (
          <li
            key={f.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.875rem',
              color: f.included ? 'var(--text)' : 'var(--text-muted)',
            }}
          >
            <CheckIcon ok={f.included} />
            {f.label}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href={ctaHref}
        className={highlighted ? 'btn btn-secondary' : 'btn btn-ghost'}
        style={{
          width: '100%',
          justifyContent: 'center',
          ...(highlighted && {
            background: 'var(--indigo-dim)',
            border: '1px solid rgba(99,102,241,0.4)',
            color: 'var(--indigo)',
          }),
        }}
      >
        {cta}
      </a>
      </div>
    </motion.div>
  );
}

// ─── Orbit Tier Card ──────────────────────────────────────────────────────────

function OrbitCard({
  name,
  price,
  features,
  active,
}: {
  name: string;
  price: string;
  features: readonly string[];
  active?: boolean;
}) {
  return (
    <div
      style={{
        flex: '1 1 180px',
        borderRadius: 'var(--r-md)',
        padding: '1.25rem',
        border: active
          ? '1px solid rgba(99,102,241,0.5)'
          : '1px solid var(--border)',
        background: active ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        minWidth: '160px',
      }}
    >
      <div>
        <span
          className="section-label"
          style={{ color: active ? 'var(--indigo)' : 'var(--text-muted)' }}
        >
          {name}
        </span>
        <div
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: active ? 'var(--text)' : 'var(--text-muted)',
            marginTop: '0.35rem',
            letterSpacing: '-0.01em',
          }}
        >
          {price}
        </div>
      </div>

      <ul
        style={{
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
        }}
      >
        {features.map((f) => (
          <li
            key={f}
            style={{
              fontSize: '0.8rem',
              color: active ? 'var(--text)' : 'var(--text-muted)',
              display: 'flex',
              gap: '0.4rem',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ color: active ? 'var(--cyan)' : 'var(--text-faint)', flexShrink: 0 }}>
              ✓
            </span>
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── PricingSection ───────────────────────────────────────────────────────────

export default function PricingSection() {
  const t = useTranslations('pricing');
  const orbitRef = useRef<HTMLDivElement>(null);
  const orbitInView = useInView(orbitRef, { once: true, margin: '-80px' });

  const orbitTiers = {
    start: t.raw('orbit.tiers.start') as { name: string; price: string; features: string[] },
    pro: t.raw('orbit.tiers.pro') as { name: string; price: string; features: string[] },
    max: t.raw('orbit.tiers.max') as { name: string; price: string; features: string[] },
  };

  const startFeatureLabels = t.raw('features.start') as string[];
  const proFeatureLabels   = t.raw('features.pro')   as string[];
  const premFeatureLabels  = t.raw('features.premium') as string[];

  const startFeatures  = startFeatureLabels.map((label, i) => ({ label, included: START_INCLUDED[i] ?? true }));
  const proFeatures    = proFeatureLabels.map((label, i)   => ({ label, included: PRO_INCLUDED[i] ?? true }));
  const premiumFeatures = premFeatureLabels.map((label, i) => ({ label, included: PREMIUM_INCLUDED[i] ?? true }));

  return (
    <section
      id="pricing"
      className="section"
      style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}
    >
      {/* Background decoration */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: '20%', left: '15%',
        width: '500px', height: '500px',
        background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.06) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute',
        bottom: '15%', right: '10%',
        width: '400px', height: '400px',
        background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.05) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div className="container-wide" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            marginBottom: '1rem',
            textAlign: 'center',
          }}
        >
          <span className="section-label">{t('label')}</span>
          <h2 className="section-title" style={{ color: 'var(--text)' }}>
            {t('title')}
          </h2>
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--text-muted)',
              maxWidth: '480px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            {t('subtitle')}
          </p>
        </div>

        {/* Three project cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(1, 1fr)',
            gap: '1.5rem',
            marginTop: '3rem',
            alignItems: 'start',
          }}
          className="pricing-grid"
        >
          <ProjectCard
            index={0}
            name={t('tiers.start.name')}
            price={t('tiers.start.price')}
            days={t('tiers.start.days')}
            desc={t('tiers.start.desc')}
            features={startFeatures}
            cta={t('cta.discuss')}
            ctaHref="#contact"
            accentColor="var(--cyan)"
          />

          <ProjectCard
            index={1}
            name={t('tiers.pro.name')}
            price={t('tiers.pro.price')}
            days={t('tiers.pro.days')}
            desc={t('tiers.pro.desc')}
            features={proFeatures}
            cta={t('cta.calculate')}
            ctaHref="#calculator"
            highlighted
            badge={t('tiers.pro.badge')}
          />

          <ProjectCard
            index={2}
            name={t('tiers.premium.name')}
            price={t('tiers.premium.price')}
            days={t('tiers.premium.days')}
            desc={t('tiers.premium.desc')}
            features={premiumFeatures}
            cta={t('cta.discuss')}
            ctaHref="#contact"
            accentColor="var(--amber)"
          />
        </div>

        {/* Orbit subscription block */}
        <motion.div
          ref={orbitRef}
          initial={{ opacity: 0, y: 40 }}
          animate={orbitInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            marginTop: '5rem',
            borderRadius: 'var(--r-lg)',
            border: '1px solid rgba(99,102,241,0.2)',
            background: 'rgba(18,18,31,0.7)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
          }}
          className="orbit-block"
        >
          {/* Orbit header */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              maxWidth: '480px',
            }}
          >
            <span className="section-label" style={{ color: 'var(--indigo)' }}>
              {t('orbit.label')}
            </span>
            <h3
              style={{
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--text)',
                lineHeight: 1.1,
              }}
            >
              {t('orbit.title')}
            </h3>
            <p
              style={{
                fontSize: '0.95rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                marginTop: '0.25rem',
              }}
            >
              {t('orbit.desc')}
            </p>
          </div>

          {/* Orbit tier cards */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
            className="orbit-tiers"
          >
            <OrbitCard
              name={orbitTiers.start.name}
              price={orbitTiers.start.price}
              features={orbitTiers.start.features}
            />
            <OrbitCard
              name={orbitTiers.pro.name}
              price={orbitTiers.pro.price}
              features={orbitTiers.pro.features}
              active
            />
            <OrbitCard
              name={orbitTiers.max.name}
              price={orbitTiers.max.price}
              features={orbitTiers.max.features}
            />
          </div>

          {/* Orbit CTA */}
          <a
            href="#contact"
            className="btn btn-ghost"
            style={{ alignSelf: 'flex-start', minWidth: '200px' }}
          >
            {t('cta.subscribe')}
          </a>
        </motion.div>
      </div>

      {/* Responsive overrides */}
      <style>{`
        @media (min-width: 768px) {
          .pricing-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .orbit-block { flex-direction: row !important; align-items: flex-start !important; }
          .orbit-block > div:first-child { flex-shrink: 0; }
          .orbit-block > div:last-child { display: none !important; }
        }
        @media (min-width: 768px) {
          .orbit-block { display: grid !important; grid-template-columns: 280px 1fr !important; gap: 3rem; }
          .orbit-block > div:nth-child(3) { display: flex !important; }
          .orbit-tiers { flex-wrap: nowrap !important; }
        }
        @media (max-width: 767px) {
          .orbit-tiers { overflow-x: auto; flex-wrap: nowrap !important; padding-bottom: 0.5rem; }
          .orbit-tiers > div { min-width: 220px; flex-shrink: 0; }
        }
      `}</style>
    </section>
  );
}

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { PORTFOLIO, type PortfolioItem, type PortfolioCategory } from '@/lib/portfolio';

// ─── Types ───────────────────────────────────────────────────────────────────

type FilterKey = 'all' | PortfolioCategory;

const FILTER_KEYS: FilterKey[] = ['all', 'sites', 'pano', 'promo'];

// Map category to i18n filter key
const CAT_TO_FILTER: Record<PortfolioCategory, string> = {
  sites: 'sites',
  pano: 'panoramas',
  promo: 'promo',
};

// Category accent colours
const CAT_ACCENT: Record<PortfolioCategory, { text: string; border: string; label: string }> = {
  sites: {
    text: 'var(--indigo)',
    border: 'rgba(99,102,241,0.4)',
    label: 'САЙТ',
  },
  pano: {
    text: 'var(--amber)',
    border: 'rgba(245,158,11,0.4)',
    label: 'ПАНОРАМА',
  },
  promo: {
    text: 'var(--cyan)',
    border: 'rgba(6,182,212,0.4)',
    label: 'ПРОДВИЖЕНИЕ',
  },
};

// ─── Category bg gradients ────────────────────────────────────────────────

const CAT_GRADIENT: Record<PortfolioCategory, string> = {
  sites: 'radial-gradient(ellipse at 25% 30%, rgba(99,102,241,0.28) 0%, rgba(6,182,212,0.08) 55%, transparent 85%)',
  pano:  'radial-gradient(ellipse at 65% 30%, rgba(245,158,11,0.28) 0%, rgba(201,169,110,0.08) 55%, transparent 85%)',
  promo: 'radial-gradient(ellipse at 40% 70%, rgba(6,182,212,0.25) 0%, rgba(62,207,160,0.1) 55%, transparent 85%)',
};

// ─── Category-specific thumbnail previews ─────────────────────────────────

function SiteThumbnail({ item }: { item: PortfolioItem }) {
  const c = CAT_ACCENT[item.category];
  return (
    <div style={{ position: 'absolute', inset: 0, padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Browser chrome bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
        {['#FF5F57','#FFBD2E','#28CA42'].map(col => (
          <span key={col} style={{ width: 7, height: 7, borderRadius: '50%', background: col, display: 'block', flexShrink: 0 }} />
        ))}
        <div style={{ flex: 1, height: 14, borderRadius: 3, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', paddingLeft: 7 }}>
          <span style={{ fontSize: '0.5rem', color: c.text, opacity: 0.55, fontFamily: 'monospace' }}>{item.id}.ru</span>
        </div>
      </div>
      {/* Hero bar */}
      <div style={{ height: 32, borderRadius: 6, background: `${c.text}1A`, border: `1px solid ${c.text}28`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
        <div style={{ height: 5, width: 70, borderRadius: 2, background: `${c.text}40` }} />
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${c.text}30` }} />
      </div>
      {/* Content lines */}
      {[80, 65, 90, 55].map((w, i) => (
        <div key={i} style={{ height: 5, width: `${w}%`, borderRadius: 2, background: 'rgba(255,255,255,0.07)' }} />
      ))}
      {/* CTA button */}
      <div style={{ height: 22, width: '45%', borderRadius: 11, background: `${c.text}28`, border: `1px solid ${c.text}40`, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.48rem', color: c.text, fontWeight: 700 }}>Оставить заявку</span>
      </div>
      {/* Yura badge */}
      <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 9999, background: c.text, fontSize: '0.48rem', color: '#fff', fontWeight: 700 }}>
        <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#7fff7f', display: 'block' }} />
        Юра онлайн
      </div>
    </div>
  );
}

function PanoThumbnail({ item }: { item: PortfolioItem }) {
  const c = CAT_ACCENT[item.category];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '0.9rem' }}>
      {/* Domain label */}
      <div style={{ position: 'absolute', top: 12, left: 12, fontSize: '0.52rem', color: c.text, opacity: 0.65, fontFamily: 'monospace' }}>{item.id}.ru</div>
      {/* VR badge */}
      <div style={{ position: 'absolute', top: 10, right: 12, fontSize: '0.48rem', padding: '2px 7px', borderRadius: 4, background: `${c.text}20`, border: `1px solid ${c.text}38`, color: c.text }}>360°</div>
      {/* Panorama rings */}
      <svg width="110" height="90" viewBox="0 0 110 90" fill="none">
        <ellipse cx="55" cy="48" rx="50" ry="18" stroke={c.text} strokeWidth="1.2" opacity="0.45"/>
        <ellipse cx="55" cy="48" rx="36" ry="13" stroke={c.text} strokeWidth="1" opacity="0.32"/>
        <ellipse cx="55" cy="48" rx="22" ry="8" stroke={c.text} strokeWidth="0.9" opacity="0.22"/>
        <circle cx="55" cy="48" r="5" fill={c.text} opacity="0.75"/>
        <circle cx="55" cy="48" r="2.5" fill="white" opacity="0.9"/>
        {/* Horizon line */}
        <line x1="5" y1="48" x2="105" y2="48" stroke={c.text} strokeWidth="0.5" strokeDasharray="3 4" opacity="0.2"/>
        {/* Hotspot dots */}
        <circle cx="25" cy="38" r="4" fill={c.text} opacity="0.6"/>
        <circle cx="85" cy="54" r="4" fill={c.text} opacity="0.5"/>
        <circle cx="55" cy="28" r="3" fill={c.text} opacity="0.4"/>
        {/* Nav arrows */}
        <text x="8"  y="52" fill={c.text} fontSize="12" opacity="0.5">‹</text>
        <text x="96" y="52" fill={c.text} fontSize="12" opacity="0.5">›</text>
      </svg>
      {/* Room tabs */}
      <div style={{ display: 'flex', gap: 5 }}>
        {item.tags.slice(0, 3).map((t, i) => (
          <span key={t} style={{ fontSize: '0.48rem', padding: '2px 7px', borderRadius: 5, background: i === 0 ? `${c.text}28` : 'rgba(255,255,255,0.04)', border: `1px solid ${i === 0 ? c.text+'40' : 'rgba(255,255,255,0.06)'}`, color: i === 0 ? c.text : 'rgba(255,255,255,0.35)' }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function PromoThumbnail({ item }: { item: PortfolioItem }) {
  const c = CAT_ACCENT[item.category];
  const pts = [[0,70],[50,58],[100,42],[160,28],[220,14],[290,6]];
  const d = `M ${pts.map(p => p.join(',')).join(' L ')}`;
  return (
    <div style={{ position: 'absolute', inset: 0, padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: 7 }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.52rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Аналитика</span>
        <span style={{ fontSize: '0.48rem', padding: '1px 7px', borderRadius: 4, background: `${c.text}20`, border: `1px solid ${c.text}35`, color: c.text }}>6М</span>
      </div>
      {/* Chart */}
      <div style={{ flex: 1, position: 'relative' }}>
        <svg width="100%" height="100%" viewBox="0 0 290 80" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`pg-${item.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.text} stopOpacity="0.25"/>
              <stop offset="100%" stopColor={c.text} stopOpacity="0"/>
            </linearGradient>
          </defs>
          {[20,40,60].map(y => (
            <line key={y} x1="0" y1={y} x2="290" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
          ))}
          <path d={`${d} L 290,80 L 0,80 Z`} fill={`url(#pg-${item.id})`}/>
          <path d={d} fill="none" stroke={c.text} strokeWidth="2" strokeLinecap="round"/>
          {pts.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="var(--surface-high)" stroke={c.text} strokeWidth="1.5"/>
          ))}
        </svg>
      </div>
      {/* Metrics row */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[
          { l: 'SEO', v: '+220%', col: c.text },
          { l: 'ROI', v: '3.8×', col: 'var(--indigo)' },
          { l: 'Трафик', v: '↑↑↑', col: '#22c55e' },
        ].map(m => (
          <div key={m.l} style={{ flex: 1, padding: '4px 6px', borderRadius: 5, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.48rem', color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>{m.l}</div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: m.col }}>{m.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardThumbnail({ item }: { item: PortfolioItem }) {
  if (item.category === 'pano')  return <PanoThumbnail  item={item} />;
  if (item.category === 'promo') return <PromoThumbnail item={item} />;
  return <SiteThumbnail item={item} />;
}

// ─── Portfolio Card ───────────────────────────────────────────────────────────

function PortfolioCard({ item, index }: { item: PortfolioItem; index: number }) {
  const t = useTranslations('portfolio');
  const locale = useLocale();
  const isRu = locale === 'ru';
  const accent = CAT_ACCENT[item.category];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.35,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4 }}
      style={{
        borderRadius: 'var(--r-md)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.2s ease',
      }}
      className="glass"
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          '0 20px 60px rgba(99,102,241,0.15)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Thumbnail zone */}
      <div
        style={{
          aspectRatio: '16/10',
          position: 'relative',
          background: 'var(--surface-high)',
          borderBottom: `1px solid ${accent.border}`,
          overflow: 'hidden',
        }}
      >
        {/* Radial gradient bg */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: CAT_GRADIENT[item.category] }} />
        {/* Dot grid pattern */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />
        <CardThumbnail item={item} />
      </div>

      {/* Card body */}
      <div
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          flex: 1,
        }}
      >
        {/* Category label */}
        <span
          className="section-label"
          style={{ color: accent.text }}
        >
          {accent.label}
        </span>

        {/* Project name */}
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 600,
            color: 'var(--text)',
            lineHeight: 1.3,
          }}
        >
          {isRu ? item.titleRu : item.titleEn}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            lineHeight: 1.55,
            flex: 1,
          }}
        >
          {isRu ? item.descriptionRu : item.descriptionEn}
        </p>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            background: 'var(--border)',
            margin: '0.25rem 0',
          }}
        />

        {/* Price + CTA row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
            }}
          >
            {t('price_prefix')}
            <strong style={{ color: 'var(--text)', fontWeight: 600 }}>
              {isRu ? item.priceRu : item.priceEn}
            </strong>
          </span>

          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.8rem',
                minHeight: '36px',
              }}
            >
              {t('cta')} ↗
            </a>
          ) : (
            <span
              className="btn btn-ghost"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.8rem',
                minHeight: '36px',
                opacity: 0.5,
                cursor: 'default',
              }}
            >
              {t('cta')}
            </span>
          )}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {item.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '0.7rem',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--r-full)',
                background: 'rgba(248,250,252,0.05)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                letterSpacing: '0.02em',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

// ─── PortfolioSection ─────────────────────────────────────────────────────────

export default function PortfolioSection() {
  const t = useTranslations('portfolio');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const filtered = PORTFOLIO.filter(
    (item) => activeFilter === 'all' || item.category === activeFilter,
  );

  // Map FilterKey → i18n key for filter labels
  const getFilterLabel = (key: FilterKey) => {
    if (key === 'all') return t('filters.all');
    if (key === 'sites') return t('filters.sites');
    if (key === 'pano') return t('filters.panoramas');
    return t('filters.promo');
  };

  return (
    <section
      id="portfolio"
      className="section"
      style={{ background: 'var(--base)' }}
    >
      <div className="container-wide">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            marginBottom: '3rem',
          }}
        >
          <span className="section-label">{t('label')}</span>
          <h2 className="section-title" style={{ color: 'var(--text)' }}>
            {t('title')}
          </h2>
        </div>

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '2.5rem',
          }}
          role="group"
          aria-label="Portfolio filter"
        >
          {FILTER_KEYS.map((key) => {
            const isActive = activeFilter === key;
            return (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                aria-pressed={isActive}
                style={{
                  minHeight: '44px',
                  padding: '0.5rem 1.25rem',
                  borderRadius: 'var(--r-full)',
                  border: isActive
                    ? 'none'
                    : '1px solid var(--border)',
                  background: isActive
                    ? 'var(--indigo)'
                    : 'rgba(10,10,24,0.6)',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  backdropFilter: 'blur(20px)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = 'var(--text)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  }
                }}
              >
                {getFilterLabel(key)}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <motion.div
          layout
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(1, 1fr)',
            gap: '1.5rem',
          }}
          className="portfolio-grid"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item, index) => (
              <PortfolioCard key={item.id} item={item} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Responsive grid columns */}
      <style>{`
        @media (min-width: 768px) {
          .portfolio-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 1024px) {
          .portfolio-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}

'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { PORTFOLIO } from '@/lib/portfolio';

// ─── Portfolio Card ───────────────────────────────────────────────────────────

function PortfolioCard({ item, index, inView }: { item: typeof PORTFOLIO[number]; index: number; inView: boolean }) {
  const locale = useLocale();
  const isRu = locale === 'ru';

  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      layout
      initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 32, filter: 'blur(8px)' }}
      transition={{ duration: 0.5, delay: inView ? index * 0.06 : 0, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      style={{
        display: 'block',
        borderRadius: 16,
        overflow: 'hidden',
        textDecoration: 'none',
        background: 'rgba(12,12,30,0.8)',
        border: '1px solid rgba(0,212,255,0.12)',
        backdropFilter: 'blur(12px)',
        transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.boxShadow = '0 20px 60px rgba(0,212,255,0.12)';
        el.style.borderColor = 'rgba(0,212,255,0.30)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.boxShadow = 'none';
        el.style.borderColor = 'rgba(0,212,255,0.12)';
      }}
    >
      {/* Screenshot */}
      <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', background: '#0a0a1a' }}>
        <Image
          src={item.image}
          alt={isRu ? item.titleRu : item.titleEn}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover', objectPosition: 'top' }}
        />
        {/* Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 50%, rgba(6,6,20,0.85) 100%)',
        }} />
        {/* External link icon */}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          width: 30, height: 30, borderRadius: 8,
          background: 'rgba(0,212,255,0.15)',
          border: '1px solid rgba(0,212,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 10L10 2M10 2H5M10 2V7" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {/* Niche tag */}
        <div style={{
          position: 'absolute', bottom: 12, left: 12,
          fontSize: '0.65rem', fontWeight: 600, letterSpacing: 0.5,
          color: '#00D4FF',
          background: 'rgba(0,212,255,0.12)',
          border: '1px solid rgba(0,212,255,0.25)',
          padding: '3px 8px', borderRadius: 5,
          backdropFilter: 'blur(8px)',
        }}>
          {item.niche}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h3 style={{
          fontSize: '1rem', fontWeight: 700,
          color: '#F8FAFC', margin: 0, lineHeight: 1.3,
        }}>
          {isRu ? item.titleRu : item.titleEn}
        </h3>
        <p style={{
          fontSize: '0.82rem', color: 'rgba(248,250,252,0.5)',
          lineHeight: 1.55, margin: 0,
        }}>
          {isRu ? item.descriptionRu : item.descriptionEn}
        </p>
        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
          {item.tags.map(tag => (
            <span key={tag} style={{
              fontSize: '0.68rem', padding: '2px 8px', borderRadius: 5,
              background: 'rgba(248,250,252,0.05)',
              border: '1px solid rgba(248,250,252,0.1)',
              color: 'rgba(248,250,252,0.4)',
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </motion.a>
  );
}

// ─── PortfolioSection ─────────────────────────────────────────────────────────

export default function PortfolioSection() {
  const t = useTranslations('portfolio');
  const gridRef = useRef(null);
  const inView = useInView(gridRef, { once: true, margin: '0px' });

  return (
    <section
      id="portfolio"
      style={{
        background: '#06060F',
        padding: 'clamp(5rem, 8vw, 8rem) 0',
        position: 'relative',
      }}
    >
      {/* Subtle top border */}
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.2), transparent)',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(20px, 5vw, 48px)' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px' }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: 2,
            color: '#00D4FF', textTransform: 'uppercase', marginBottom: 14,
          }}>
            <span style={{ width: 20, height: 1, background: '#00D4FF', display: 'block' }} />
            {t('label')}
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 900, letterSpacing: -0.5,
            color: '#F8FAFC', margin: 0,
          }}>
            {t('title')}
          </h2>
          <p style={{
            fontSize: '1rem', color: 'rgba(248,250,252,0.45)',
            marginTop: 12, maxWidth: 500,
          }}>
            Реальные проекты — нажмите чтобы открыть сайт
          </p>
        </motion.div>

        {/* Grid */}
        <div
          ref={gridRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(1, 1fr)',
            gap: '1.5rem',
          }}
          className="portfolio-grid"
        >
          {PORTFOLIO.map((item, index) => (
            <PortfolioCard key={item.id} item={item} index={index} inView={inView} />
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 640px) {
          .portfolio-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 1024px) {
          .portfolio-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}

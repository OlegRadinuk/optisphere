'use client';
import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import SectionIntro from '@/components/hud/SectionIntro';

// ─── Types ────────────────────────────────────────────────────────────────────

type CaseType = 'medical' | 'hotel' | 'construction' | 'restaurant' | 'auto';
type FilterKey = 'all' | CaseType;

interface CaseItem {
  id: number;
  name: string;
  type: CaseType;
  label: string;
  price: string;
  tags: string[];
  url: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CASES: CaseItem[] = [
  { id: 1, name: 'Hotel Nova',    type: 'hotel',        label: 'Гостиница',     price: '120 000 ₽', tags: ['Booking', 'AI-бот', '360°'],  url: '#' },
  { id: 2, name: 'MedPro Clinic', type: 'medical',      label: 'Медицина',      price: '180 000 ₽', tags: ['Запись', 'AI-бот', 'SEO'],     url: '#' },
  { id: 3, name: 'СтройПро',      type: 'construction', label: 'Строительство', price: '90 000 ₽',  tags: ['Лендинг', 'SEO'],              url: '#' },
  { id: 4, name: 'Le Grand',      type: 'restaurant',   label: 'Ресторан',      price: '360° тур',  tags: ['Panorama', 'Virtual tour'],    url: '#' },
  { id: 5, name: 'AutoMax',       type: 'auto',         label: 'Авто',          price: '85 000 ₽',  tags: ['Директ', 'SEO'],               url: '#' },
  { id: 6, name: 'ЖК Горизонт',   type: 'construction', label: 'Недвижимость',  price: '360° тур',  tags: ['Panorama', '3D'],              url: '#' },
];

// ─── Gradient previews per niche ──────────────────────────────────────────────

const PREVIEW_GRADIENTS: Record<CaseType, string> = {
  medical:      'linear-gradient(135deg, #0a1628 0%, #1a3a5c 50%, #0d2040 100%)',
  hotel:        'linear-gradient(135deg, #1a1200 0%, #3d2b00 50%, #1a1200 100%)',
  construction: 'linear-gradient(135deg, #0d1a0d 0%, #1a3320 50%, #0d1a0d 100%)',
  restaurant:   'linear-gradient(135deg, #1a0a0a 0%, #3d1515 50%, #1a0a0a 100%)',
  auto:         'linear-gradient(135deg, #0a0a1a 0%, #15153d 50%, #0a0a1a 100%)',
};

const FILTER_KEYS: FilterKey[] = ['all', 'medical', 'hotel', 'construction', 'restaurant', 'auto'];

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CaseCardProps {
  item: CaseItem;
  index: number;
  viewLabel: string;
}

function CaseCard({ item, index, viewLabel }: CaseCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--op-surface)',
        border: '1px solid var(--op-border)',
        borderRadius: 10,
        overflow: 'hidden',
        transition: 'transform 200ms var(--op-ease), box-shadow 200ms var(--op-ease), border-color 200ms var(--op-ease)',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: hovered ? '0 16px 40px rgba(0,0,0,0.45)' : 'none',
        borderColor: hovered ? 'var(--op-border-strong)' : 'var(--op-border)',
      }}
    >
      {/* Preview area */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '16/10',
          overflow: 'hidden',
          background: PREVIEW_GRADIENTS[item.type],
        }}
      >
        {/* Name watermark */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 20px',
          }}
        >
          <span
            style={{
              font: "700 clamp(20px,3.5vw,32px)/1 'Oxanium',sans-serif",
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.09)',
              textAlign: 'center',
              userSelect: 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}
          >
            {item.name}
          </span>
        </div>

        {/* Corner geometric accent */}
        <svg
          aria-hidden="true"
          width="60"
          height="60"
          viewBox="0 0 60 60"
          fill="none"
          style={{ position: 'absolute', top: 0, right: 0, opacity: 0.15 }}
        >
          <path d="M60 0 L60 60 L0 0 Z" fill="rgba(255,255,255,0.25)" />
          <line x1="60" y1="0" x2="0" y2="60" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
        </svg>

        {/* Hover overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 200ms ease',
            pointerEvents: hovered ? 'auto' : 'none',
          }}
        >
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '10px 20px',
              borderRadius: 6,
              background: 'var(--op-accent)',
              color: 'var(--op-text-on-accent)',
              font: "600 11px/1 'JetBrains Mono',monospace",
              letterSpacing: '.1em',
              textDecoration: 'none',
              textTransform: 'uppercase',
            }}
            onClick={e => { if (item.url === '#') e.preventDefault(); }}
          >
            {viewLabel} →
          </a>
        </div>
      </div>

      {/* Card footer */}
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span
          style={{
            font: "600 14px/1.2 'Oxanium',sans-serif",
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--op-text)',
          }}
        >
          {item.name}
        </span>
        <span
          style={{
            font: "400 11px/1 'JetBrains Mono',monospace",
            color: 'var(--op-text-muted)',
            letterSpacing: '.06em',
          }}
        >
          {item.label} · {item.price}
        </span>

        <div style={{ height: 1, background: 'var(--op-divider)', margin: '4px 0' }} />

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {item.tags.map(tag => (
            <span
              key={tag}
              style={{
                font: "500 9px/1 'JetBrains Mono',monospace",
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                padding: '3px 7px',
                borderRadius: 4,
                border: '1px solid var(--op-border-strong)',
                color: 'var(--op-text-muted)',
                background: 'transparent',
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

// ─── Section ──────────────────────────────────────────────────────────────────

export default function CasesSection() {
  const t = useTranslations('cases');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px' });
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const filtered = activeFilter === 'all'
    ? CASES
    : CASES.filter(c => c.type === activeFilter);

  return (
    <section id="cases" style={{ padding: '96px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(20px,4vw,48px)' }}>

        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionIntro code="04" cmd="cases.query({hot:true})" title={t('title')} sub={t('sub')} crimson />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}
        >
          {FILTER_KEYS.map(key => {
            const isActive = activeFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveFilter(key)}
                style={{
                  font: "600 10px/1 'JetBrains Mono',monospace",
                  letterSpacing: '.12em',
                  textTransform: 'uppercase',
                  padding: '7px 14px',
                  borderRadius: 5,
                  border: isActive
                    ? '1px solid var(--op-accent)'
                    : '1px solid var(--op-border-strong)',
                  background: 'transparent',
                  color: isActive ? 'var(--op-accent)' : 'var(--op-text-muted)',
                  cursor: 'pointer',
                  transition: 'border-color 150ms ease, color 150ms ease',
                }}
              >
                {t(`filters.${key}`)}
              </button>
            );
          })}
        </motion.div>

        {/* Catalog grid */}
        <div className="cases-catalog-grid">
          {filtered.map((item, i) => (
            <CaseCard key={item.id} item={item} index={i} viewLabel={t('view')} />
          ))}
        </div>
      </div>

      <style>{`
        .cases-catalog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }
        @media (max-width: 639px) {
          .cases-catalog-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }
        @media (max-width: 379px) {
          .cases-catalog-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}

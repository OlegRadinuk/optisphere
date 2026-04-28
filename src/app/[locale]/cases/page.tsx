'use client';

import { useState } from 'react';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import SectionIntro from '@/components/hud/SectionIntro';

// generateMetadata cannot be used with 'use client' — exported separately below via a parallel route approach.
// Since this page needs client-side filtering, metadata is defined in a separate layout or via static export.
// Per task rules: 'use client' only where interactivity needed. Filters require it here.

// ─── Types ───────────────────────────────────────────────────────────────────

type CaseFilterKey = 'all' | 'site' | 'ads' | 'ai';

interface CaseMetric {
  value: string;
  label: string;
}

interface CaseItem {
  id: number;
  name: string;
  clientType: string;
  filterKey: CaseFilterKey;
  typeLabel: string;
  description: string;
  stack: string[];
  metrics: CaseMetric[];
  duration: string;
  serviceType: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const CASES: CaseItem[] = [
  {
    id: 1,
    name: 'Life Style Crimea',
    clientType: 'Гостевые апартаменты, Крым',
    filterKey: 'site',
    typeLabel: 'Сайт + AI + Интеграции',
    description:
      'Платформа бронирования 40 апартаментов в Гурзуфе и Ялте. AI-боты Yana и Sofia консультируют гостей 24/7, синхронизируют занятость из Travelline в реальном времени. Панорамы 360° для каждого объекта.',
    stack: ['Next.js 16', 'SQLite', 'Travelline API', 'AI Claude', 'Яндекс.Директ'],
    metrics: [
      { value: '40', label: 'апартаментов в базе' },
      { value: '273', label: 'бронирования синхронизированы' },
      { value: '+34%', label: 'онлайн-бронирований после AI' },
      { value: '85%', label: 'вопросов без участия менеджера' },
    ],
    duration: '3 месяца',
    serviceType: 'Бронирование апартаментов',
  },
  {
    id: 2,
    name: 'Lilit Flowers Crimea',
    clientType: 'Цветочный магазин, Крым',
    filterKey: 'ads',
    typeLabel: 'Реклама + Конверсия',
    description:
      'Настройка 4 рекламных кампаний в Яндекс.Директ, аудит конверсионной воронки. Исправлена сломанная кнопка заказа "в 1 клик" — ключевой элемент конверсии. Снижена цена лида за счёт точной работы с аудиторией.',
    stack: ['Яндекс.Директ', 'Аналитика', 'Конверсионный аудит'],
    metrics: [
      { value: '189', label: 'кликов из Директа' },
      { value: '3.2%', label: 'конверсия в заявку' },
      { value: '1 583 ₽', label: 'цена лида' },
      { value: '9 497 ₽', label: 'расходов на рекламу' },
    ],
    duration: '1 месяц',
    serviceType: 'Яндекс.Директ + Конверсия',
  },
  {
    id: 3,
    name: 'Albamed',
    clientType: 'Медицинская клиника',
    filterKey: 'ai',
    typeLabel: 'AI-ассистент',
    description:
      'AI-ассистент на платформе Optisphere для медицинской клиники Альбамед. Обучен на данных клиники: услуги, цены, режим работы. Интегрирован через виджет в существующий сайт на WordPress за 3 дня.',
    stack: ['Optisphere AI', 'WordPress', 'Claude API'],
    metrics: [
      { value: '24/7', label: 'консультации без администратора' },
      { value: '70%', label: 'стандартных вопросов автоматически' },
      { value: '3 дня', label: 'до запуска интеграции' },
    ],
    duration: '1 неделя',
    serviceType: 'AI-ассистент для клиники',
  },
];

const FILTERS: Array<{ key: CaseFilterKey; label: string }> = [
  { key: 'all', label: 'Все проекты' },
  { key: 'site', label: 'Сайт' },
  { key: 'ads', label: 'Реклама' },
  { key: 'ai', label: 'AI' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricBadge({ value, label }: CaseMetric) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      padding: '12px 16px',
      background: 'var(--op-surface-overlay)',
      borderRadius: 10,
      border: '1px solid var(--op-border)',
      flex: '1 1 calc(50% - 6px)',
      minWidth: 100,
    }}>
      <span style={{
        font: "700 28px/1 'Oxanium', sans-serif",
        color: 'var(--op-accent)',
        letterSpacing: '-0.02em',
      }}>
        {value}
      </span>
      <span style={{
        font: "400 11px/1.3 'Inter', sans-serif",
        color: 'var(--op-text-secondary)',
      }}>
        {label}
      </span>
    </div>
  );
}

function StackTag({ label }: { label: string }) {
  return (
    <span style={{
      font: "400 11px/1 'JetBrains Mono', monospace",
      color: 'var(--op-text-muted)',
      background: 'var(--op-surface-overlay)',
      border: '1px solid var(--op-border)',
      borderRadius: 4,
      padding: '4px 8px',
      letterSpacing: '.04em',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

function CaseCard({ item }: { item: CaseItem }) {
  return (
    <article style={{
      background: 'var(--op-surface-elevated)',
      border: '1px solid var(--op-border)',
      borderRadius: 16,
      padding: 28,
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      transition: 'border-color 220ms ease, box-shadow 220ms ease',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.borderColor = 'var(--op-border-accent)';
      (e.currentTarget as HTMLElement).style.boxShadow = 'var(--op-shadow-glow)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.borderColor = 'var(--op-border)';
      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
    }}
    >
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{
            font: "500 11px/1 'JetBrains Mono', monospace",
            color: 'var(--op-accent)',
            background: 'var(--op-accent-faint)',
            border: '1px solid var(--op-border-accent)',
            borderRadius: 4,
            padding: '4px 8px',
            letterSpacing: '.08em',
            textTransform: 'uppercase',
          }}>
            {item.typeLabel}
          </span>
          <span style={{
            font: "400 11px/1 'JetBrains Mono', monospace",
            color: 'var(--op-text-muted)',
            letterSpacing: '.06em',
          }}>
            {item.duration}
          </span>
        </div>
        <h2 style={{
          font: "600 22px/1.1 'Oxanium', sans-serif",
          color: 'var(--op-text)',
          margin: 0,
          letterSpacing: '-0.01em',
        }}>
          {item.name}
        </h2>
        <p style={{
          font: "400 13px/1 'Inter', sans-serif",
          color: 'var(--op-text-secondary)',
          margin: 0,
        }}>
          {item.clientType}
        </p>
      </div>

      {/* Description */}
      <p style={{
        font: "400 14px/1.6 'Inter', sans-serif",
        color: 'var(--op-text-secondary)',
        margin: 0,
      }}>
        {item.description}
      </p>

      {/* Metrics */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {item.metrics.map((m, i) => (
          <MetricBadge key={i} value={m.value} label={m.label} />
        ))}
      </div>

      {/* Stack */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {item.stack.map((tag, i) => (
          <StackTag key={i} label={tag} />
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('opti-open'))}
        style={{
          marginTop: 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 18px',
          borderRadius: 8,
          background: 'transparent',
          color: 'var(--op-accent)',
          border: '1px solid var(--op-border-accent)',
          cursor: 'pointer',
          font: "500 13px/1 'Inter', sans-serif",
          alignSelf: 'flex-start',
          transition: 'background 180ms ease, color 180ms ease',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--op-accent)';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--op-text-on-accent)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--op-accent)';
        }}
      >
        Обсудить похожий проект →
      </button>
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CasesPage() {
  const [activeFilter, setActiveFilter] = useState<CaseFilterKey>('all');

  const filtered = activeFilter === 'all'
    ? CASES
    : CASES.filter(c => c.filterKey === activeFilter);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--op-base)', color: 'var(--op-text)' }}>

      {/* Back nav */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 48px 0' }} className="cases-back-nav">
        <Link
          href="/"
          style={{
            font: "400 13px/1 'JetBrains Mono', monospace",
            color: 'var(--op-text-muted)',
            textDecoration: 'none',
            letterSpacing: '.08em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ← Optisphere
        </Link>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 48px 96px' }} className="cases-container">

        <SectionIntro
          code="04"
          cmd="cases.query({hot:true})"
          title="Реализованные проекты"
          sub="Реальные результаты для реальных бизнесов — сайты с AI, интеграции, рекламные кампании."
        />

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 40, flexWrap: 'wrap' }} role="group" aria-label="Фильтр проектов">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              aria-pressed={activeFilter === f.key}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: activeFilter === f.key ? '1px solid var(--op-accent)' : '1px solid var(--op-border-strong)',
                background: activeFilter === f.key ? 'var(--op-accent-faint)' : 'transparent',
                color: activeFilter === f.key ? 'var(--op-accent)' : 'var(--op-text-secondary)',
                font: "500 13px/1 'Inter', sans-serif",
                cursor: 'pointer',
                transition: 'all 180ms ease',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Cards grid */}
        <div className="cases-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {filtered.map(item => (
            <CaseCard key={item.id} item={item} />
          ))}
        </div>

        {/* CTA block */}
        <div style={{
          marginTop: 80,
          padding: '48px 40px',
          background: 'var(--op-surface-elevated)',
          border: '1px solid var(--op-border-accent)',
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          textAlign: 'center',
        }}>
          <span style={{
            font: "500 11px/1 'JetBrains Mono', monospace",
            color: 'var(--op-accent)',
            letterSpacing: '.14em',
            textTransform: 'uppercase',
          }}>
            ◆ Следующий кейс
          </span>
          <h2 style={{
            font: "600 clamp(24px,4vw,40px)/1.1 'Oxanium', sans-serif",
            color: 'var(--op-text)',
            margin: 0,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}>
            Обсудим ваш проект
          </h2>
          <p style={{
            font: "400 15px/1.6 'Inter', sans-serif",
            color: 'var(--op-text-secondary)',
            margin: 0,
            maxWidth: 480,
          }}>
            Расскажите о задаче — Опти задаст несколько уточняющих вопросов и сориентирует по срокам и стоимости.
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('opti-open'))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              borderRadius: 10,
              background: 'var(--op-accent)',
              color: 'var(--op-text-on-accent)',
              border: 'none',
              cursor: 'pointer',
              font: "500 15px/1 'Inter', sans-serif",
              letterSpacing: '-0.01em',
            }}
          >
            Поговорить с Опти →
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .cases-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .cases-container { padding: 48px 32px 80px !important; }
          .cases-back-nav { padding: 24px 32px 0 !important; }
        }
        @media (max-width: 640px) {
          .cases-grid { grid-template-columns: 1fr !important; }
          .cases-container { padding: 40px 20px 64px !important; }
          .cases-back-nav { padding: 20px 20px 0 !important; }
        }
      `}</style>
    </main>
  );
}

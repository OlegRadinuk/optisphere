'use client';

import { useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SiteTier {
  name: string;
  price: string;
  duration: string;
  features: string[];
  featured?: boolean;
  badge?: string;
}

interface OrbitTier {
  name: string;
  price: string;
  features: string[];
  featured?: boolean;
}

interface FaqItem {
  q: string;
  a: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const SITE_TIERS: SiteTier[] = [
  {
    name: 'START',
    price: 'от 50 000 ₽',
    duration: '3–5 дней',
    features: [
      'Лендинг (1 страница)',
      'Адаптивная вёрстка',
      'Форма обратной связи',
      'Базовая SEO-разметка',
      'Подключение аналитики',
      'Домен и хостинг на 1 год',
    ],
  },
  {
    name: 'PRO',
    price: 'от 120 000 ₽',
    duration: '5–10 дней',
    badge: 'Популярный',
    featured: true,
    features: [
      'Многостраничный сайт (до 10 стр.)',
      'Адаптивная вёрстка',
      'CMS для управления контентом',
      'Блог / каталог товаров',
      'Расширенная SEO-структура',
      'Аналитика + цели Директа',
      'Подключение AI-чата (базовый)',
      'Домен и хостинг на 1 год',
    ],
  },
  {
    name: 'PREMIUM',
    price: 'от 180 000 ₽',
    duration: '2–4 недели',
    features: [
      'Кастомный дизайн + 3D-сцены',
      'GSAP / Framer Motion анимации',
      'Panorama 360° туры',
      'AI-ассистент с обучением',
      'Интеграции: CRM, Travelline, 1C',
      'Расширенная SEO-стратегия',
      'Поддержка 3 месяца включена',
      'Приоритетная техподдержка',
    ],
  },
  {
    name: 'КОРПОРАТИВНЫЙ',
    price: 'по запросу',
    duration: '1–3 месяца',
    features: [
      'Индивидуальная разработка',
      'Архитектура под нагрузку',
      'Команда разработчиков',
      'Выделенный менеджер проекта',
      'SLA и гарантии uptime',
      'Полный аудит перед запуском',
    ],
  },
];

const ORBIT_TIERS: OrbitTier[] = [
  {
    name: 'ORBIT START',
    price: '10 000 ₽/мес',
    features: [
      'Хостинг и домен',
      'Мониторинг 24/7',
      'SSL-сертификат',
      'До 5 правок в месяц',
      'Ежемесячный отчёт',
    ],
  },
  {
    name: 'ORBIT PRO',
    price: '15 000 ₽/мес',
    featured: true,
    features: [
      'Всё из START',
      'SEO-продвижение',
      'Отчёт по позициям',
      'Расширенная аналитика',
      'Приоритет в очереди правок',
    ],
  },
  {
    name: 'ORBIT MAX',
    price: '25 000 ₽/мес',
    features: [
      'Всё из PRO',
      'Яндекс.Директ (ведение кампаний)',
      'Безлимитные правки',
      'A/B тесты посадочных',
      'Ежеквартальный редизайн блоков',
    ],
  },
];

const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Почему нет точных цен на сайте?',
    a: 'Стоимость зависит от конкретной задачи: объём контента, нужны ли интеграции, насколько сложна анимация. «От X» — нижняя граница простейшей реализации. Поговорите с Опти — он задаст 3–4 вопроса и даст точную оценку за 5 минут.',
  },
  {
    q: 'Что входит в поддержку?',
    a: 'В тариф ORBIT входят: хостинг, SSL, мониторинг доступности, резервное копирование, обновления безопасности и правки по брифу. Мы не исчезаем после сдачи проекта.',
  },
  {
    q: 'Можно ли сделать только AI-ассистент без сайта?',
    a: 'Да. AI-ассистент на платформе Optisphere можно интегрировать в любой существующий сайт — WordPress, Tilda, Bitrix, React. Встраивается одним скриптом.',
  },
  {
    q: 'Есть ли гарантии?',
    a: 'Мы фиксируем результат в договоре: сроки, функциональность, число правок. Если сайт не работает как договорились — дорабатываем бесплатно. Расчёт после сдачи и принятия.',
  },
  {
    q: 'Работаете ли вы с клиентами за пределами Крыма?',
    a: 'Работаем удалённо по всей России и СНГ. Встречи — в Zoom или Telegram. Договор, акты и оплата — онлайн. Клиенты есть из Москвы, Краснодара и других городов.',
  },
];

type CalcKey = 'site' | 'ai' | 'seo' | 'ads' | 'panorama';

interface CalcOption {
  key: CalcKey;
  label: string;
  min: number;
  max: number;
}

const CALC_OPTIONS: CalcOption[] = [
  { key: 'site',     label: 'Сайт',           min: 50000,  max: 180000 },
  { key: 'ai',       label: 'AI-ассистент',   min: 50000,  max: 100000 },
  { key: 'seo',      label: 'SEO',            min: 30000,  max: 60000  },
  { key: 'ads',      label: 'Директ',         min: 15000,  max: 30000  },
  { key: 'panorama', label: 'Панорамы 360°',  min: 20000,  max: 50000  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({ code, cmd, title, sub }: { code: string; cmd: string; title: string; sub?: string }) {
  return (
    <header style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 14,
        font: "500 11px/1 'JetBrains Mono', monospace",
        letterSpacing: '0.14em', textTransform: 'uppercase',
      }}>
        <span style={{
          color: 'var(--op-text-muted)', padding: '6px 10px',
          border: '1px solid var(--op-border-strong)',
          clipPath: 'polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)',
        }}>
          SECTION.{code}
        </span>
        <span style={{ display: 'inline-block', width: 32, height: 1, background: 'var(--op-border-strong)' }} />
        <span style={{
          color: 'var(--op-accent)', fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.1em', textTransform: 'lowercase',
        }}>
          $ {cmd}
        </span>
      </div>
      <h2 style={{
        font: "600 clamp(28px,4vw,48px)/1.05 'Oxanium', sans-serif",
        letterSpacing: '-0.02em', color: 'var(--op-text)',
        margin: 0, textTransform: 'uppercase',
      }}>
        {title}
      </h2>
      {sub && (
        <p style={{
          font: "400 16px/1.55 'Inter', sans-serif",
          color: 'var(--op-text-secondary)', margin: 0, maxWidth: 580,
        }}>
          {sub}
        </p>
      )}
    </header>
  );
}

function CheckIcon() {
  return (
    <span style={{ color: 'var(--op-accent)', fontSize: 14, flexShrink: 0, lineHeight: 1.4 }}>✓</span>
  );
}

function SiteTierCard({ tier }: { tier: SiteTier }) {
  return (
    <article style={{
      background: tier.featured
        ? 'linear-gradient(180deg, rgba(232,32,32,.06), transparent 60%), var(--op-surface-elevated)'
        : 'var(--op-surface-elevated)',
      border: tier.featured ? '1px solid var(--op-border-accent)' : '1px solid var(--op-border)',
      borderRadius: tier.featured ? 16 : 12,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      position: 'relative',
      transform: tier.featured ? 'translateY(-8px)' : 'none',
    }}>
      {tier.featured && tier.badge && (
        <span style={{
          position: 'absolute', top: -10, left: 20,
          background: 'var(--op-accent)', color: 'var(--op-text-on-accent)',
          padding: '4px 10px', borderRadius: 999,
          font: "500 11px/1 'Inter', sans-serif",
        }}>
          {tier.badge}
        </span>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{
          font: "500 12px/1 'Inter', sans-serif",
          color: tier.featured ? 'var(--op-accent)' : 'var(--op-text)',
          letterSpacing: '.06em', textTransform: 'uppercase',
        }}>
          {tier.name}
        </span>
        <span style={{
          font: "600 24px/1 'Oxanium', sans-serif",
          color: 'var(--op-text)', letterSpacing: '-0.02em',
        }}>
          {tier.price}
        </span>
        <span style={{
          font: "400 11px/1 'JetBrains Mono', monospace",
          color: 'var(--op-text-muted)', letterSpacing: '.08em', textTransform: 'uppercase',
        }}>
          {tier.duration}
        </span>
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tier.features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, font: "400 13px/1.5 'Inter', sans-serif", color: 'var(--op-text-secondary)' }}>
            <CheckIcon />
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('opti-open'))}
        style={{
          marginTop: 'auto',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          height: 38, padding: '0 16px', borderRadius: 8,
          background: tier.featured ? 'var(--op-accent)' : 'transparent',
          color: tier.featured ? 'var(--op-text-on-accent)' : 'var(--op-text)',
          border: tier.featured ? 'none' : '1px solid var(--op-border-strong)',
          cursor: 'pointer',
          font: "500 13px/1 'Inter', sans-serif",
        }}
      >
        Обсудить →
      </button>
    </article>
  );
}

function OrbitTierCard({ tier }: { tier: OrbitTier }) {
  return (
    <article style={{
      background: tier.featured
        ? 'linear-gradient(180deg, rgba(232,32,32,.06), transparent 60%), var(--op-surface-elevated)'
        : 'var(--op-surface-elevated)',
      border: tier.featured ? '1px solid var(--op-border-accent)' : '1px solid var(--op-border)',
      borderRadius: 12,
      padding: 24,
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{
          font: "500 11px/1 'JetBrains Mono', monospace",
          color: tier.featured ? 'var(--op-accent)' : 'var(--op-text-muted)',
          letterSpacing: '.1em', textTransform: 'uppercase',
        }}>
          {tier.name}
        </span>
        <span style={{
          font: "600 22px/1 'Oxanium', sans-serif",
          color: 'var(--op-text)', letterSpacing: '-0.02em',
        }}>
          {tier.price}
        </span>
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tier.features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, font: "400 13px/1.5 'Inter', sans-serif", color: 'var(--op-text-secondary)' }}>
            <CheckIcon />
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('opti-open'))}
        style={{
          marginTop: 'auto',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          height: 36, padding: '0 14px', borderRadius: 8,
          background: tier.featured ? 'var(--op-accent)' : 'transparent',
          color: tier.featured ? 'var(--op-text-on-accent)' : 'var(--op-text)',
          border: tier.featured ? 'none' : '1px solid var(--op-border-strong)',
          cursor: 'pointer', font: "500 13px/1 'Inter', sans-serif",
        }}
      >
        Выбрать →
      </button>
    </article>
  );
}

function PricingBlockRow({ label, price, note }: { label: string; price: string; note?: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 0', borderBottom: '1px solid var(--op-border)',
      flexWrap: 'wrap', gap: 12,
    }}>
      <span style={{ font: "400 15px/1.4 'Inter', sans-serif", color: 'var(--op-text-secondary)' }}>
        {label}
        {note && (
          <span style={{ display: 'block', font: "400 12px/1.3 'JetBrains Mono', monospace", color: 'var(--op-text-muted)', marginTop: 3, letterSpacing: '.04em' }}>
            {note}
          </span>
        )}
      </span>
      <span style={{ font: "600 18px/1 'Oxanium', sans-serif", color: 'var(--op-accent)', whiteSpace: 'nowrap' }}>
        {price}
      </span>
    </div>
  );
}

// ─── Calculator ───────────────────────────────────────────────────────────────

function Calculator() {
  const [selected, setSelected] = useState<Set<CalcKey>>(new Set());

  const toggle = (key: CalcKey) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const total = CALC_OPTIONS.reduce(
    (acc, opt) => selected.has(opt.key)
      ? { min: acc.min + opt.min, max: acc.max + opt.max }
      : acc,
    { min: 0, max: 0 }
  );

  const formatPrice = (n: number) =>
    n.toLocaleString('ru-RU') + ' ₽';

  return (
    <div style={{
      background: 'var(--op-surface-elevated)',
      border: '1px solid var(--op-border)',
      borderRadius: 16,
      padding: 32,
      display: 'flex', flexDirection: 'column', gap: 24,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {CALC_OPTIONS.map(opt => (
          <label
            key={opt.key}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
              padding: '12px 16px', borderRadius: 10,
              border: selected.has(opt.key) ? '1px solid var(--op-border-accent)' : '1px solid var(--op-border)',
              background: selected.has(opt.key) ? 'var(--op-accent-faint)' : 'transparent',
              transition: 'all 180ms ease',
            }}
          >
            <input
              type="checkbox"
              checked={selected.has(opt.key)}
              onChange={() => toggle(opt.key)}
              style={{ accentColor: 'var(--op-accent)', width: 16, height: 16, cursor: 'pointer' }}
            />
            <span style={{ flex: 1, font: "400 14px/1 'Inter', sans-serif", color: 'var(--op-text)' }}>
              {opt.label}
            </span>
            <span style={{ font: "400 12px/1 'JetBrains Mono', monospace", color: 'var(--op-text-muted)', letterSpacing: '.04em' }}>
              от {formatPrice(opt.min)}
            </span>
          </label>
        ))}
      </div>

      {/* Result */}
      <div style={{
        padding: '20px 24px',
        background: 'var(--op-surface-overlay)',
        borderRadius: 12,
        border: '1px solid var(--op-border-strong)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ font: "400 12px/1 'JetBrains Mono', monospace", color: 'var(--op-text-muted)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            Примерная стоимость
          </span>
          {selected.size === 0 ? (
            <span style={{ font: "500 20px/1 'Oxanium', sans-serif", color: 'var(--op-text-muted)' }}>
              Выберите услуги
            </span>
          ) : (
            <span style={{ font: "600 28px/1 'Oxanium', sans-serif", color: 'var(--op-accent)', letterSpacing: '-0.02em' }}>
              {formatPrice(total.min)} — {formatPrice(total.max)}
            </span>
          )}
        </div>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('opti-open'))}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 20px', borderRadius: 8,
            background: 'var(--op-accent)', color: 'var(--op-text-on-accent)',
            border: 'none', cursor: 'pointer',
            font: "500 13px/1 'Inter', sans-serif",
            whiteSpace: 'nowrap',
          }}
        >
          Получить точный расчёт →
        </button>
      </div>
    </div>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            style={{
              background: 'var(--op-surface-elevated)',
              border: isOpen ? '1px solid var(--op-border-accent)' : '1px solid var(--op-border)',
              borderRadius: 12,
              overflow: 'hidden',
              transition: 'border-color 180ms ease',
            }}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 16, padding: '18px 20px', background: 'transparent', border: 'none',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span style={{ font: "500 15px/1.4 'Inter', sans-serif", color: 'var(--op-text)' }}>
                {item.q}
              </span>
              <span style={{
                flexShrink: 0, width: 20, height: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                font: "500 16px/1 'Inter', sans-serif",
                color: 'var(--op-accent)',
                transform: isOpen ? 'rotate(45deg)' : 'none',
                transition: 'transform 200ms ease',
              }}>
                +
              </span>
            </button>
            {isOpen && (
              <div style={{ padding: '0 20px 18px', font: "400 14px/1.65 'Inter', sans-serif", color: 'var(--op-text-secondary)' }}>
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div style={{
      height: 1, background: 'var(--op-divider)',
      margin: '16px 0',
    }} />
  );
}

// ─── Main client component ────────────────────────────────────────────────────

export default function PricingPageClient() {
  return (
    <>
      {/* ── 1. Sites ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 0 72px' }}>
        <SectionHeading
          code="01"
          cmd="pricing.sites()"
          title="Разовые проекты — сайты"
          sub="Фиксированный результат, прозрачные сроки. Платите после приёмки."
        />
        <div className="pricing-page-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {SITE_TIERS.map((tier, i) => (
            <SiteTierCard key={i} tier={tier} />
          ))}
        </div>
      </section>

      <Divider />

      {/* ── 2. Orbit subscription ────────────────────────────────────────────── */}
      <section style={{ padding: '72px 0' }}>
        <SectionHeading
          code="02"
          cmd="pricing.orbit()"
          title='Подписка "Орбита"'
          sub='Сделали сайт — подключайте "Орбиту" для постоянного роста. Мониторинг, SEO, реклама в одном пакете.'
        />
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 14px', borderRadius: 8,
          background: 'var(--op-accent-faint)', border: '1px solid var(--op-border-accent)',
          marginBottom: 28,
        }}>
          <span style={{ font: "500 12px/1 'JetBrains Mono', monospace", color: 'var(--op-accent)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            ◆ Ежемесячная оплата — отменить можно в любой момент
          </span>
        </div>
        <div className="pricing-page-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {ORBIT_TIERS.map((tier, i) => (
            <OrbitTierCard key={i} tier={tier} />
          ))}
        </div>
      </section>

      <Divider />

      {/* ── 3. AI assistant ──────────────────────────────────────────────────── */}
      <section style={{ padding: '72px 0' }}>
        <SectionHeading
          code="03"
          cmd="pricing.ai()"
          title="AI-ассистент"
          sub="Виртуальный сотрудник, который отвечает на вопросы, принимает заявки и консультирует 24/7."
        />
        <div style={{
          background: 'var(--op-surface-elevated)',
          border: '1px solid var(--op-border)',
          borderRadius: 16, padding: '0 8px',
        }}>
          <PricingBlockRow
            label="Подключение и настройка AI-ассистента"
            note="Обучение на данных вашего бизнеса, интеграция на сайт, тестирование"
            price="от 50 000 ₽"
          />
          <PricingBlockRow
            label="Интеграция в существующий сайт"
            note="Виджет встраивается в любую платформу: WordPress, Tilda, Bitrix, React"
            price="от 30 000 ₽"
          />
          <PricingBlockRow
            label="Обслуживание и дообучение"
            note="Ежемесячное обновление базы знаний, мониторинг качества ответов"
            price="от 5 000 ₽/мес"
          />
        </div>
        <p style={{ font: "400 13px/1.5 'Inter', sans-serif", color: 'var(--op-text-muted)', marginTop: 16, maxWidth: 560 }}>
          AI-ассистент можно заказать отдельно — без создания нового сайта.
        </p>
      </section>

      <Divider />

      {/* ── 4. SEO + Ads ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '72px 0' }}>
        <SectionHeading
          code="04"
          cmd="pricing.marketing()"
          title="SEO и Яндекс.Директ"
          sub="Органический трафик и платная реклама — настраиваем и ведём кампании под ключ."
        />
        <div style={{
          background: 'var(--op-surface-elevated)',
          border: '1px solid var(--op-border)',
          borderRadius: 16, padding: '0 8px',
        }}>
          <PricingBlockRow
            label="SEO-продвижение"
            note="Технический аудит, семантика, оптимизация текстов, ссылочный профиль"
            price="от 30 000 ₽/мес"
          />
          <PricingBlockRow
            label="Яндекс.Директ — настройка кампаний"
            note="4 кампании: поиск + РСЯ + ретаргетинг. Без учёта рекламного бюджета"
            price="от 15 000 ₽"
          />
          <PricingBlockRow
            label="Яндекс.Директ — ведение кампаний"
            note="Оптимизация ставок, A/B объявлений, еженедельные отчёты"
            price="от 10 000 ₽/мес"
          />
        </div>
      </section>

      <Divider />

      {/* ── 5. Calculator ────────────────────────────────────────────────────── */}
      <section style={{ padding: '72px 0' }}>
        <SectionHeading
          code="05"
          cmd="pricing.estimate()"
          title="Калькулятор проекта"
          sub="Выберите нужные услуги — получите примерную сумму. Точный расчёт делает Опти за 5 минут."
        />
        <Calculator />
      </section>

      <Divider />

      {/* ── 6. FAQ ───────────────────────────────────────────────────────────── */}
      <section style={{ padding: '72px 0' }}>
        <SectionHeading
          code="06"
          cmd="pricing.faq()"
          title="Вопросы и ответы"
        />
        <FaqAccordion />
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <div style={{
        marginTop: 16,
        padding: '48px 40px',
        background: 'var(--op-surface-elevated)',
        border: '1px solid var(--op-border-accent)',
        borderRadius: 20,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        textAlign: 'center',
      }}>
        <h2 style={{
          font: "600 clamp(22px,4vw,38px)/1.1 'Oxanium', sans-serif",
          color: 'var(--op-text)', margin: 0,
          letterSpacing: '-0.02em', textTransform: 'uppercase',
        }}>
          Готовы начать?
        </h2>
        <p style={{
          font: "400 15px/1.6 'Inter', sans-serif",
          color: 'var(--op-text-secondary)', margin: 0, maxWidth: 440,
        }}>
          Поговорите с Опти — он поможет собрать пакет под ваш бюджет и задачи.
        </p>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('opti-open'))}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 28px', borderRadius: 10,
            background: 'var(--op-accent)', color: 'var(--op-text-on-accent)',
            border: 'none', cursor: 'pointer',
            font: "500 15px/1 'Inter', sans-serif",
          }}
        >
          Поговорить с Опти →
        </button>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .pricing-page-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
          .pricing-page-grid-3 { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .pricing-page-grid-4 { grid-template-columns: 1fr !important; }
          .pricing-page-grid-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

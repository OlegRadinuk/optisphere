import type { Metadata } from 'next';
import { OptiCtaButton } from '@/components/ui/OptiCtaButton';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isRu = locale === 'ru';

  return {
    title: isRu
      ? 'Создание сайтов в Крыму под ключ — лендинги и многостраничники'
      : 'Website Development in Crimea — Landing Pages & Multi-page Sites',
    description: isRu
      ? 'Разрабатываем продающие сайты для малого бизнеса. Лендинг от 50 000 ₽ за 3-5 дней. AI-ассистент в комплекте. Гостиницы, стоматологии, строительство. Крым, вся Россия.'
      : 'We build high-converting websites for small businesses. Landing page from ₽50,000 in 3-5 days. AI assistant included. Hotels, clinics, construction. Crimea, all Russia.',
  };
}

const PACKAGES = [
  {
    nameRu: 'START',
    nameEn: 'START',
    priceRu: 'от 50 000 ₽',
    priceEn: 'from ₽50,000',
    daysRu: '3–5 дней',
    daysEn: '3–5 days',
    descRu: 'Лендинг с AI-ассистентом Опти',
    descEn: 'Landing page with AI assistant Opti',
    featuresRu: [
      'Адаптивный дизайн (мобиль + десктоп)',
      'Одна страница-лендинг',
      'Форма заявки',
      'Базовое SEO',
      'AI-ассистент Опти',
      'Хостинг на 1 месяц в подарок',
    ],
    featuresEn: [
      'Responsive design (mobile + desktop)',
      'Single landing page',
      'Application form',
      'Basic SEO',
      'AI assistant Opti',
      '1 month hosting included',
    ],
    popular: false,
  },
  {
    nameRu: 'PRO',
    nameEn: 'PRO',
    priceRu: 'от 120 000 ₽',
    priceEn: 'from ₽120,000',
    daysRu: '5–10 дней',
    daysEn: '5–10 days',
    descRu: 'Продающий сайт + SEO',
    descEn: 'Sales website + SEO',
    featuresRu: [
      'Адаптивный дизайн',
      'До 10 страниц',
      'AI-ассистент Опти',
      'SEO-оптимизация',
      'Аналитика и отчёты',
      'Интеграция с CRM/Telegram',
    ],
    featuresEn: [
      'Responsive design',
      'Up to 10 pages',
      'AI assistant Opti',
      'SEO optimisation',
      'Analytics & reports',
      'CRM/Telegram integration',
    ],
    popular: true,
  },
  {
    nameRu: 'PREMIUM',
    nameEn: 'PREMIUM',
    priceRu: 'от 180 000 ₽',
    priceEn: 'from ₽180,000',
    daysRu: '10–20 дней',
    daysEn: '10–20 days',
    descRu: 'Кастом + анимации + маркетинг',
    descEn: 'Custom + animations + marketing',
    featuresRu: [
      'Всё из PRO',
      '3D и кастомные анимации',
      'Маркетинговая упаковка',
      '360° панорамы',
      'Приоритетная поддержка',
      'Подписка Спутник START на 1 месяц',
    ],
    featuresEn: [
      'Everything in PRO',
      '3D and custom animations',
      'Marketing package',
      '360° panoramas',
      'Priority support',
      '1 month Satellite START subscription',
    ],
    popular: false,
  },
];

const SPECIALIZATIONS = [
  {
    iconRu: '🏨',
    iconEn: '🏨',
    titleRu: 'Гостиницы и апартаменты',
    titleEn: 'Hotels & apartments',
    descRu: 'Системы бронирования, галереи, AI-ассистент для приёма заявок.',
    descEn: 'Booking systems, galleries, AI assistant for capturing reservations.',
  },
  {
    iconRu: '🦷',
    iconEn: '🦷',
    titleRu: 'Стоматологии и клиники',
    titleEn: 'Dental clinics & medical',
    descRu: 'Онлайн-запись, прайс-листы, отзывы, AI-регистратор.',
    descEn: 'Online booking, price lists, reviews, AI receptionist.',
  },
  {
    iconRu: '🏗️',
    iconEn: '🏗️',
    titleRu: 'Строительство и ремонт',
    titleEn: 'Construction & renovation',
    descRu: 'Портфолио работ, калькулятор, заявки на выезд.',
    descEn: 'Work portfolio, calculator, on-site visit requests.',
  },
  {
    iconRu: '🛒',
    iconEn: '🛒',
    titleRu: 'Интернет-магазины',
    titleEn: 'Online stores',
    descRu: 'Каталог, корзина, оплата, AI-консультант по товарам.',
    descEn: 'Catalogue, cart, payments, AI product consultant.',
  },
];

const FAQ = [
  {
    qRu: 'Сколько стоит сайт?',
    aRu: 'Лендинг — от 50 000 ₽, многостраничник — от 120 000 ₽. Точную стоимость называем после короткого брифа — это бесплатно.',
    qEn: 'How much does a website cost?',
    aEn: 'Landing page — from ₽50,000, multi-page site — from ₽120,000. Exact cost is confirmed after a short brief — free of charge.',
  },
  {
    qRu: 'Как долго делается сайт?',
    aRu: 'Лендинг — 3–5 дней, PRO-сайт — 5–10 дней. Сроки фиксируются в договоре и не меняются.',
    qEn: 'How long does it take to build a site?',
    aEn: 'Landing page — 3–5 days, PRO site — 5–10 days. Deadlines are fixed in the contract and do not change.',
  },
  {
    qRu: 'Что нужно для старта?',
    aRu: 'Бриф (заполните за 5 минут с Опти) + материалы (фото, логотип, тексты — если есть). Если материалов нет — поможем создать.',
    qEn: 'What do I need to get started?',
    aEn: 'A brief (fill it in 5 minutes with Opti) + materials (photos, logo, texts — if available). If you don\'t have materials — we\'ll help create them.',
  },
  {
    qRu: 'Какие гарантии?',
    aRu: 'Договор с фиксированными сроками и стоимостью. Правки в рамках ТЗ — бесплатно. Гарантийная поддержка 1 месяц после сдачи.',
    qEn: 'What guarantees do you offer?',
    aEn: 'Contract with fixed deadlines and price. Revisions within the scope — free. 1 month warranty support after delivery.',
  },
  {
    qRu: 'Включён ли хостинг?',
    aRu: 'Для START — 1 месяц бесплатно. Далее — 700 ₽/мес или через подписку Спутник. Хостинг в России (Яндекс.Облако).',
    qEn: 'Is hosting included?',
    aEn: 'For START — 1 month free. After that — ₽700/month or via Satellite subscription. Russian hosting (Yandex Cloud).',
  },
];

export default async function WebsitesPage({ params }: Props) {
  const { locale } = await params;
  const isRu = locale === 'ru';

  return (
    <article style={{ padding: '48px 0 0' }}>
      <div
        style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}
        className="websites-container"
      >
        {/* Hero */}
        <header style={{ marginBottom: 80 }}>
          <p
            style={{
              font: "500 11px/1 'JetBrains Mono',monospace",
              color: 'var(--op-accent)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              margin: '0 0 16px',
            }}
          >
            {isRu ? '// САЙТЫ' : '// WEBSITES'}
          </p>
          <h1
            style={{
              font: "700 60px/1.05 'Oxanium',sans-serif",
              letterSpacing: '-0.03em',
              margin: '0 0 24px',
              color: 'var(--op-text)',
            }}
            className="websites-hero-title"
          >
            {isRu ? 'Сайты под ключ\nв Крыму' : 'Websites\nin Crimea'}
          </h1>
          <p
            style={{
              font: "400 18px/1.6 'Inter',sans-serif",
              color: 'var(--op-text-secondary)',
              margin: '0 0 32px',
              maxWidth: 600,
            }}
          >
            {isRu
              ? 'Разрабатываем продающие сайты для малого бизнеса. Лендинг — за 3 дня. AI-ассистент — в комплекте. Договор с фиксированной ценой.'
              : 'We build high-converting sites for small businesses. Landing page in 3 days. AI assistant included. Fixed-price contract.'}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <OptiCtaButton
              label={isRu ? 'Обсудить проект →' : 'Discuss project →'}
              variant="primary"
            />
            <a
              href="#packages"
              style={{
                height: 48,
                padding: '0 28px',
                display: 'inline-flex',
                alignItems: 'center',
                background: 'transparent',
                color: 'var(--op-text-secondary)',
                border: '1px solid var(--op-border-strong)',
                borderRadius: 4,
                textDecoration: 'none',
                font: "500 14px/1 'Inter',sans-serif",
              }}
            >
              {isRu ? 'Смотреть цены' : 'View pricing'}
            </a>
          </div>
        </header>

        {/* Packages */}
        <section id="packages" style={{ marginBottom: 96 }}>
          <h2
            style={{
              font: "600 36px/1.15 'Oxanium',sans-serif",
              letterSpacing: '-0.02em',
              margin: '0 0 8px',
              color: 'var(--op-text)',
            }}
          >
            {isRu ? 'Пакеты' : 'Packages'}
          </h2>
          <p
            style={{
              font: "400 16px/1.5 'Inter',sans-serif",
              color: 'var(--op-text-secondary)',
              margin: '0 0 40px',
            }}
          >
            {isRu
              ? 'Выберите подходящий — или обсудите с Опти, он подберёт точнее.'
              : 'Pick the right one — or discuss with Opti, he\'ll find the best fit.'}
          </p>
          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}
            className="packages-grid"
          >
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.nameRu}
                style={{
                  border: pkg.popular
                    ? '1px solid var(--op-border-accent)'
                    : '1px solid var(--op-border)',
                  borderRadius: 16,
                  padding: '32px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 24,
                  background: pkg.popular
                    ? 'linear-gradient(180deg,rgba(201,166,95,.06),transparent 80%),var(--op-surface-elevated)'
                    : 'var(--op-surface-elevated)',
                  position: 'relative',
                }}
              >
                {pkg.popular && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -1,
                      right: 20,
                      background: 'var(--op-accent)',
                      color: '#fff',
                      font: "500 10px/1 'JetBrains Mono',monospace",
                      letterSpacing: '0.12em',
                      padding: '5px 12px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {isRu ? 'Популярный' : 'Popular'}
                  </div>
                )}
                <div>
                  <p
                    style={{
                      font: "500 11px/1 'JetBrains Mono',monospace",
                      color: 'var(--op-text-muted)',
                      letterSpacing: '0.18em',
                      margin: '0 0 8px',
                    }}
                  >
                    {isRu ? pkg.nameRu : pkg.nameEn}
                  </p>
                  <p
                    style={{
                      font: "700 32px/1 'Oxanium',sans-serif",
                      color: 'var(--op-accent)',
                      margin: '0 0 4px',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {isRu ? pkg.priceRu : pkg.priceEn}
                  </p>
                  <p
                    style={{
                      font: "400 13px/1 'JetBrains Mono',monospace",
                      color: 'var(--op-text-muted)',
                      margin: '0 0 12px',
                    }}
                  >
                    {isRu ? pkg.daysRu : pkg.daysEn}
                  </p>
                  <p
                    style={{
                      font: "400 14px/1.5 'Inter',sans-serif",
                      color: 'var(--op-text-secondary)',
                      margin: 0,
                    }}
                  >
                    {isRu ? pkg.descRu : pkg.descEn}
                  </p>
                </div>
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    flex: 1,
                  }}
                >
                  {(isRu ? pkg.featuresRu : pkg.featuresEn).map((f) => (
                    <li
                      key={f}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                        font: "400 13px/1.5 'Inter',sans-serif",
                        color: 'var(--op-text-secondary)',
                      }}
                    >
                      <span style={{ color: 'var(--op-accent)', flexShrink: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <OptiCtaButton
                  label={isRu ? 'Выбрать →' : 'Choose →'}
                  variant={pkg.popular ? 'primary' : 'ghost'}
                  height={44}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Specializations */}
        <section style={{ marginBottom: 96 }}>
          <h2
            style={{
              font: "600 36px/1.15 'Oxanium',sans-serif",
              letterSpacing: '-0.02em',
              margin: '0 0 8px',
              color: 'var(--op-text)',
            }}
          >
            {isRu ? 'Специализации' : 'Specialisations'}
          </h2>
          <p
            style={{
              font: "400 16px/1.5 'Inter',sans-serif",
              color: 'var(--op-text-secondary)',
              margin: '0 0 40px',
            }}
          >
            {isRu
              ? 'Опыт в нишах, где сайт = прямой источник клиентов.'
              : 'Experience in niches where a website is a direct client source.'}
          </p>
          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}
            className="spec-grid"
          >
            {SPECIALIZATIONS.map((spec) => (
              <div
                key={spec.titleRu}
                style={{
                  border: '1px solid var(--op-border)',
                  borderRadius: 12,
                  padding: '24px',
                  background: 'var(--op-surface-elevated)',
                }}
              >
                <p style={{ fontSize: 32, margin: '0 0 12px' }}>{spec.iconRu}</p>
                <h3
                  style={{
                    font: "600 17px/1.3 'Oxanium',sans-serif",
                    margin: '0 0 8px',
                    color: 'var(--op-text)',
                  }}
                >
                  {isRu ? spec.titleRu : spec.titleEn}
                </h3>
                <p
                  style={{
                    font: "400 13px/1.5 'Inter',sans-serif",
                    color: 'var(--op-text-secondary)',
                    margin: 0,
                  }}
                >
                  {isRu ? spec.descRu : spec.descEn}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: 80 }}>
          <h2
            style={{
              font: "600 36px/1.15 'Oxanium',sans-serif",
              letterSpacing: '-0.02em',
              margin: '0 0 40px',
              color: 'var(--op-text)',
            }}
          >
            {isRu ? 'Частые вопросы' : 'FAQ'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {FAQ.map((item) => (
              <div
                key={item.qRu}
                style={{
                  border: '1px solid var(--op-border)',
                  borderRadius: 8,
                  padding: '24px 28px',
                  background: 'var(--op-surface-elevated)',
                }}
              >
                <p
                  style={{
                    font: "600 16px/1.4 'Oxanium',sans-serif",
                    margin: '0 0 8px',
                    color: 'var(--op-text)',
                  }}
                >
                  {isRu ? item.qRu : item.qEn}
                </p>
                <p
                  style={{
                    font: "400 14px/1.6 'Inter',sans-serif",
                    color: 'var(--op-text-secondary)',
                    margin: 0,
                  }}
                >
                  {isRu ? item.aRu : item.aEn}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .websites-container { padding: 0 24px !important; }
          .websites-hero-title { font-size: 40px !important; }
          .packages-grid { grid-template-columns: 1fr !important; }
          .spec-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 480px) {
          .spec-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </article>
  );
}

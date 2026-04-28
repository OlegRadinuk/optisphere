import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { OptiCtaButton } from '@/components/ui/OptiCtaButton';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isRu = locale === 'ru';

  return {
    title: isRu ? 'Услуги — Optisphere' : 'Services — Optisphere',
    description: isRu
      ? 'Разрабатываем сайты с AI-ассистентом, продвигаем в Яндексе и Google. Для малого бизнеса в Крыму и по всей России.'
      : 'We build websites with AI assistants and promote on Yandex and Google. For small businesses across Russia.',
  };
}

const SERVICES = [
  {
    slug: 'ai-assistants',
    ebRu: 'AI 01',
    ebEn: 'AI 01',
    titleRu: 'AI-ассистенты',
    titleEn: 'AI Assistants',
    descRu:
      'Умный чат-бот для вашего сайта: отвечает на вопросы 24/7, принимает заявки, квалифицирует клиентов. Интеграция за 3 дня на базе Claude AI.',
    descEn:
      'Smart chat bot for your site: answers questions 24/7, captures leads, qualifies clients. Integration in 3 days powered by Claude AI.',
    priceRu: 'от 50 000 ₽',
    priceEn: 'from ₽50,000',
    featuresRu: [
      'Отвечает 24/7 без выходных',
      'Принимает заявки и передаёт вам',
      'Обучается на данных вашего бизнеса',
      'Интеграция в сайт за 3 дня',
    ],
    featuresEn: [
      'Answers 24/7 with no days off',
      'Captures leads and forwards them to you',
      'Trained on your business data',
      'Site integration in 3 days',
    ],
  },
  {
    slug: 'websites',
    ebRu: 'WEB 02',
    ebEn: 'WEB 02',
    titleRu: 'Сайты под ключ',
    titleEn: 'Websites',
    descRu:
      'Лендинг за 3 дня или многостраничник с CMS. Адаптивный дизайн, SEO-оптимизация и AI-ассистент в комплекте. Гостиницы, стоматологии, строительство.',
    descEn:
      'Landing page in 3 days or a multi-page site with CMS. Responsive design, SEO optimisation and AI assistant included. Hotels, clinics, construction.',
    priceRu: 'от 50 000 ₽',
    priceEn: 'from ₽50,000',
    featuresRu: [
      'Адаптивный дизайн под все устройства',
      'SEO-оптимизация с первого дня',
      'AI-ассистент Опти в комплекте',
      'Готов к запуску за 3–10 дней',
    ],
    featuresEn: [
      'Responsive design for all devices',
      'SEO optimisation from day one',
      'AI assistant Opti included',
      'Ready to launch in 3–10 days',
    ],
  },
  {
    slug: 'seo',
    ebRu: 'SEO 03',
    ebEn: 'SEO 03',
    titleRu: 'SEO-продвижение',
    titleEn: 'SEO',
    descRu:
      'Органический трафик из Яндекса и Google. Семантика, контент, техническая оптимизация. Ежемесячные отчёты по позициям и трафику.',
    descEn:
      'Organic traffic from Yandex and Google. Semantics, content, technical optimisation. Monthly reports on rankings and traffic.',
    priceRu: 'от 25 000 ₽/мес',
    priceEn: 'from ₽25,000/mo',
    featuresRu: [
      'Сбор семантического ядра',
      'Техническая оптимизация сайта',
      'Контентная стратегия',
      'Ежемесячные отчёты по позициям',
    ],
    featuresEn: [
      'Keyword research and semantic core',
      'Technical site optimisation',
      'Content strategy',
      'Monthly ranking reports',
    ],
  },
  {
    slug: 'yandex-direct',
    ebRu: 'ADS 04',
    ebEn: 'ADS 04',
    titleRu: 'Яндекс.Директ',
    titleEn: 'Yandex Direct',
    descRu:
      'Платный трафик с ROI. Настройка рекламных кампаний, ведение и ежемесячные отчёты по результатам.',
    descEn:
      'Paid traffic with ROI. Ad campaign setup, management and monthly performance reports.',
    priceRu: 'от 20 000 ₽/мес',
    priceEn: 'from ₽20,000/mo',
    featuresRu: [
      'Настройка рекламных кампаний',
      'Подбор ключевых слов и аудиторий',
      'A/B тестирование объявлений',
      'Ежемесячные отчёты по ROI',
    ],
    featuresEn: [
      'Ad campaign setup',
      'Keyword and audience targeting',
      'A/B testing of ads',
      'Monthly ROI reports',
    ],
  },
  {
    slug: 'panoramas',
    ebRu: 'VR 05',
    ebEn: 'VR 05',
    titleRu: 'Панорамы 360°',
    titleEn: '360° Panoramas',
    descRu:
      'Интерактивные туры по объекту. Клиент видит гостиницу, клинику или шоу-рум ещё до первого звонка. Увеличивает конверсию в бронь.',
    descEn:
      'Interactive object tours. Clients see your hotel, clinic or showroom before their first call. Increases booking conversion.',
    priceRu: 'от 8 000 ₽',
    priceEn: 'from ₽8,000',
    featuresRu: [
      '360° туры по объекту',
      'Встраивание на сайт и в соцсети',
      'Виртуальный просмотр без визита',
      'Готово за 1–2 дня',
    ],
    featuresEn: [
      '360° object tours',
      'Embed on website and social media',
      'Virtual viewing without a visit',
      'Ready in 1–2 days',
    ],
  },
];

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  const isRu = locale === 'ru';

  return (
    <section style={{ padding: '64px 0 0' }}>
      <div
        style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}
        className="services-hub-container"
      >
        {/* Header */}
        <div style={{ marginBottom: 64 }}>
          <p
            style={{
              font: "500 11px/1 'JetBrains Mono',monospace",
              color: 'var(--op-accent)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              margin: '0 0 16px',
            }}
          >
            {isRu ? '// УСЛУГИ' : '// SERVICES'}
          </p>
          <h1
            style={{
              font: "700 56px/1.1 'Oxanium',sans-serif",
              letterSpacing: '-0.03em',
              margin: '0 0 16px',
              color: 'var(--op-text)',
            }}
            className="services-hub-title"
          >
            {isRu ? 'Что мы делаем' : 'What we do'}
          </h1>
          <p
            style={{
              font: "400 18px/1.6 'Inter',sans-serif",
              color: 'var(--op-text-secondary)',
              margin: 0,
              maxWidth: 640,
            }}
          >
            {isRu
              ? 'Пять направлений для роста вашего бизнеса в интернете. Каждое — с гарантированным результатом.'
              : 'Five directions for growing your business online. Each one with a guaranteed result.'}
          </p>
        </div>

        {/* Service cards */}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {SERVICES.map((service, idx) => {
            const href =
              service.slug === 'panoramas' || service.slug === 'seo' || service.slug === 'yandex-direct'
                ? null
                : `/services/${service.slug}`;

            return (
              <article
                key={service.slug}
                style={{
                  border: '1px solid var(--op-border)',
                  borderRadius: 12,
                  padding: '36px 40px',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 32,
                  alignItems: 'start',
                  background: 'var(--op-surface-elevated)',
                  marginBottom: idx < SERVICES.length - 1 ? 2 : 0,
                }}
                className="services-hub-card"
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="services-hub-card-inner">
                  <div>
                    <p
                      style={{
                        font: "500 10px/1 'JetBrains Mono',monospace",
                        color: 'var(--op-text-muted)',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        margin: '0 0 12px',
                      }}
                    >
                      {isRu ? service.ebRu : service.ebEn}
                    </p>
                    <h2
                      style={{
                        font: "600 28px/1.2 'Oxanium',sans-serif",
                        letterSpacing: '-0.02em',
                        margin: '0 0 12px',
                        color: 'var(--op-text)',
                      }}
                    >
                      {isRu ? service.titleRu : service.titleEn}
                    </h2>
                    <p
                      style={{
                        font: "400 15px/1.6 'Inter',sans-serif",
                        color: 'var(--op-text-secondary)',
                        margin: 0,
                      }}
                    >
                      {isRu ? service.descRu : service.descEn}
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
                    }}
                  >
                    {(isRu ? service.featuresRu : service.featuresEn).map(
                      (f) => (
                        <li
                          key={f}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 8,
                            font: "400 14px/1.5 'Inter',sans-serif",
                            color: 'var(--op-text-secondary)',
                          }}
                        >
                          <span
                            style={{
                              color: 'var(--op-accent)',
                              flexShrink: 0,
                              marginTop: 2,
                            }}
                          >
                            ✓
                          </span>
                          {f}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 16,
                    minWidth: 160,
                  }}
                >
                  <span
                    style={{
                      font: "600 22px/1 'Oxanium',sans-serif",
                      color: 'var(--op-accent)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {isRu ? service.priceRu : service.priceEn}
                  </span>
                  {href !== null ? (
                    <Link
                      href={href as Parameters<typeof Link>[0]['href']}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        height: 40,
                        padding: '0 20px',
                        font: "500 13px/1 'Inter',sans-serif",
                        color: 'var(--op-text-secondary)',
                        textDecoration: 'none',
                        border: '1px solid var(--op-border-strong)',
                        borderRadius: 4,
                        transition: 'all 180ms',
                      }}
                      className="svc-more-link"
                    >
                      {isRu ? 'Подробнее →' : 'Learn more →'}
                    </Link>
                  ) : (
                    <OptiCtaButton
                      label={isRu ? 'Обсудить →' : 'Discuss →'}
                      variant="ghost"
                      height={40}
                      padding="0 20px"
                    />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <style>{`
        .svc-more-link:hover { border-color: var(--op-accent) !important; color: var(--op-accent) !important; }
        @media (max-width: 900px) {
          .services-hub-container { padding: 0 24px !important; }
          .services-hub-title { font-size: 40px !important; }
          .services-hub-card { grid-template-columns: 1fr !important; padding: 28px 24px !important; }
          .services-hub-card-inner { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

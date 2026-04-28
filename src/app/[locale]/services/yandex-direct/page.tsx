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
      ? 'Яндекс.Директ для бизнеса в Крыму — настройка и ведение | Optisphere'
      : 'Yandex Direct for Crimea Business — Setup & Management | Optisphere',
    description: isRu
      ? 'Настраиваем рекламу в Яндекс.Директ для малого бизнеса. Кейс: 189 кликов за 9 497 ₽, стоимость лида 1 583 ₽. Гостиницы, цветы, медицина, строительство.'
      : 'We set up Yandex Direct advertising for small businesses. Case: 189 clicks for ₽9,497, lead cost ₽1,583. Hotels, flowers, medical, construction.',
  };
}

const STATS = [
  { numRu: '189', numEn: '189', labelRu: 'кликов', labelEn: 'clicks', subRu: 'за первый месяц', subEn: 'in the first month' },
  { numRu: '9 497 ₽', numEn: '₽9,497', labelRu: 'бюджет', labelEn: 'budget', subRu: 'цветочный магазин', subEn: 'flower shop' },
  { numRu: '1 583 ₽', numEn: '₽1,583', labelRu: 'цена лида', labelEn: 'cost per lead', subRu: 'Lilit Flowers', subEn: 'Lilit Flowers' },
];

const STEPS = [
  {
    num: '01',
    titleRu: 'Анализ ниши',
    titleEn: 'Niche Analysis',
    descRu: 'Изучаем конкурентов, их объявления и ставки. Определяем горячие запросы с коммерческим интентом и отсеиваем пустые клики.',
    descEn: 'We study competitors, their ads and bids. We identify hot queries with commercial intent and filter out empty clicks.',
  },
  {
    num: '02',
    titleRu: 'Семантика и минус-слова',
    titleEn: 'Keywords & Negatives',
    descRu: 'Собираем ключи под каждую услугу. Добавляем минус-слова — без них бюджет утекает на нерелевантные запросы.',
    descEn: 'We collect keywords for each service. We add negative keywords — without them budget leaks on irrelevant queries.',
  },
  {
    num: '03',
    titleRu: 'Тексты объявлений',
    titleEn: 'Ad Copywriting',
    descRu: 'Пишем заголовки с ключевым словом, конкретные преимущества, призыв к действию. A/B тест двух вариантов в каждой группе.',
    descEn: 'We write headlines with keywords, specific benefits, calls to action. A/B test two variants in each group.',
  },
  {
    num: '04',
    titleRu: 'Настройка кампаний',
    titleEn: 'Campaign Setup',
    descRu: 'Поиск + РСЯ. Геотаргетинг по Крыму или нужным городам. Расписание показов, корректировки ставок по устройствам и аудиториям.',
    descEn: 'Search + YAN. Geo-targeting for Crimea or target cities. Ad scheduling, bid adjustments by device and audience.',
  },
  {
    num: '05',
    titleRu: 'Аналитика и оптимизация',
    titleEn: 'Analytics & Optimization',
    descRu: 'Подключаем Метрику, настраиваем цели. Еженедельный мониторинг CTR, конверсий, расхода бюджета. Отключаем неэффективные объявления.',
    descEn: 'We connect Metrica, configure goals. Weekly monitoring of CTR, conversions, budget spend. We disable ineffective ads.',
  },
];

const PACKAGES = [
  {
    nameRu: 'Директ Старт',
    nameEn: 'Direct Start',
    priceRu: '20 000 ₽',
    priceEn: '₽20,000',
    subRu: 'разовая настройка',
    subEn: 'one-time setup',
    featuresRu: [
      'До 3 рекламных кампаний',
      'До 100 ключевых запросов',
      'Тексты объявлений',
      'Минус-слова',
      'Настройка Метрики и целей',
      'Инструкция по самостоятельному ведению',
    ],
    featuresEn: [
      'Up to 3 ad campaigns',
      'Up to 100 keywords',
      'Ad copywriting',
      'Negative keywords',
      'Metrica & goal setup',
      'Self-management guide',
    ],
    popular: false,
  },
  {
    nameRu: 'Директ Ведение',
    nameEn: 'Direct Management',
    priceRu: '25 000 ₽/мес',
    priceEn: '₽25,000/mo',
    subRu: '+ рекламный бюджет',
    subEn: '+ ad budget',
    featuresRu: [
      'Настройка + ежемесячное ведение',
      'Неограниченное кол-во кампаний',
      'Оптимизация ставок каждую неделю',
      'A/B тесты объявлений',
      'Ретаргетинг',
      'Ежемесячный отчёт с выводами',
    ],
    featuresEn: [
      'Setup + monthly management',
      'Unlimited number of campaigns',
      'Weekly bid optimization',
      'A/B ad tests',
      'Retargeting',
      'Monthly report with insights',
    ],
    popular: true,
  },
  {
    nameRu: 'Директ + SEO',
    nameEn: 'Direct + SEO',
    priceRu: '45 000 ₽/мес',
    priceEn: '₽45,000/mo',
    subRu: '+ рекламный бюджет',
    subEn: '+ ad budget',
    featuresRu: [
      'Всё из «Директ Ведение»',
      'SEO-продвижение в комплекте',
      'Единая стратегия трафика',
      'Блог с SEO-статьями',
      'Приоритетная поддержка',
    ],
    featuresEn: [
      'Everything in Direct Management',
      'SEO promotion included',
      'Unified traffic strategy',
      'Blog with SEO articles',
      'Priority support',
    ],
    popular: false,
  },
];

const FAQ = [
  {
    qRu: 'Какой минимальный бюджет на рекламу?',
    aRu: 'Рекомендуем от 15 000 ₽/мес на рекламный бюджет — это отдельно от стоимости ведения. С меньшим бюджетом сложно собрать статистику для оптимизации.',
    qEn: 'What is the minimum advertising budget?',
    aEn: 'We recommend at least ₽15,000/month for ad budget — this is separate from management fees. With less budget it\'s hard to collect statistics for optimization.',
  },
  {
    qRu: 'Как быстро запустить рекламу?',
    aRu: 'Кампании настраиваем за 3–5 рабочих дней. Объявления начинают показываться сразу после модерации Яндекса (1–2 дня).',
    qEn: 'How quickly can we launch ads?',
    aEn: 'We set up campaigns in 3–5 business days. Ads start showing immediately after Yandex moderation (1–2 days).',
  },
  {
    qRu: 'Нужен ли у меня аккаунт в Яндексе?',
    aRu: 'Да. Мы работаем в вашем аккаунте — все данные и история остаются у вас. Никакой зависимости от нас.',
    qEn: 'Do I need a Yandex account?',
    aEn: 'Yes. We work in your account — all data and history stays with you. No dependency on us.',
  },
  {
    qRu: 'Работаете ли вы с Google Ads?',
    aRu: 'Приоритет — Яндекс.Директ для рынка РФ. Google Ads обсуждаем индивидуально, он актуален для международной аудитории.',
    qEn: 'Do you work with Google Ads?',
    aEn: 'Priority is Yandex Direct for the Russian market. Google Ads is discussed individually — relevant for international audiences.',
  },
];

export default async function YandexDirectPage({ params }: Props) {
  const { locale } = await params;
  const isRu = locale === 'ru';

  return (
    <main style={{ paddingTop: '80px', background: 'var(--op-bg)', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ padding: '80px 48px 64px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: '20px', marginBottom: '24px' }}>
          <span style={{ color: 'var(--op-accent)', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
            Яндекс.Директ
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 700, color: 'var(--op-text)', lineHeight: 1.1, marginBottom: '24px', maxWidth: '800px' }}>
          {isRu ? 'Яндекс.Директ для бизнеса в Крыму' : 'Yandex Direct for Crimea Business'}
        </h1>
        <p style={{ fontSize: '20px', color: 'var(--op-muted)', maxWidth: '600px', lineHeight: 1.6, marginBottom: '40px' }}>
          {isRu
            ? 'Настраиваем и ведём контекстную рекламу. Клиенты с первого дня. Оплата только за клики — без слитого бюджета на нерелевантные запросы.'
            : 'We set up and manage contextual advertising. Clients from day one. Pay only for clicks — no wasted budget on irrelevant queries.'}
        </p>
        <OptiCtaButton label={isRu ? "Обсудить проект" : "Discuss Project"} />
      </section>

      {/* Stats — real case data */}
      <section style={{ padding: '0 48px 80px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ background: 'var(--op-surface)', border: '1px solid var(--op-border)', borderRadius: '20px', padding: '32px 40px', marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', color: 'var(--op-muted)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            {isRu ? 'Кейс: Lilit Flowers Crimea' : 'Case: Lilit Flowers Crimea'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '32px' }}>
            {STATS.map((s) => (
              <div key={s.numRu}>
                <div style={{ fontSize: '40px', fontWeight: 800, color: 'var(--op-accent)', marginBottom: '4px' }}>{isRu ? s.numRu : s.numEn}</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--op-text)', marginBottom: '2px' }}>{isRu ? s.labelRu : s.labelEn}</div>
                <div style={{ fontSize: '13px', color: 'var(--op-muted)' }}>{isRu ? s.subRu : s.subEn}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section style={{ padding: '0 48px 80px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 700, color: 'var(--op-text)', marginBottom: '48px' }}>
          {isRu ? 'Как мы работаем' : 'How We Work'}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {STEPS.map((step, i) => (
            <div key={step.num} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '24px', padding: '32px 0', borderTop: i === 0 ? '1px solid var(--op-border)' : 'none', borderBottom: '1px solid var(--op-border)' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--op-accent)', paddingTop: '4px' }}>{step.num}</div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--op-text)', marginBottom: '8px' }}>
                  {isRu ? step.titleRu : step.titleEn}
                </div>
                <div style={{ fontSize: '15px', color: 'var(--op-muted)', lineHeight: 1.6 }}>
                  {isRu ? step.descRu : step.descEn}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section style={{ padding: '0 48px 80px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 700, color: 'var(--op-text)', marginBottom: '48px' }}>
          {isRu ? 'Тарифы' : 'Pricing'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {PACKAGES.map((pkg) => (
            <div key={pkg.nameRu} style={{ background: 'var(--op-surface)', border: pkg.popular ? '2px solid var(--op-accent)' : '1px solid var(--op-border)', borderRadius: '20px', padding: '32px', position: 'relative' }}>
              {pkg.popular && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--op-accent)', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  {isRu ? 'Популярный' : 'Popular'}
                </div>
              )}
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--op-text)', marginBottom: '4px' }}>
                {isRu ? pkg.nameRu : pkg.nameEn}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--op-accent)', marginBottom: '4px' }}>
                {isRu ? pkg.priceRu : pkg.priceEn}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--op-muted)', marginBottom: '24px' }}>
                {isRu ? pkg.subRu : pkg.subEn}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(isRu ? pkg.featuresRu : pkg.featuresEn).map((f) => (
                  <li key={f} style={{ display: 'flex', gap: '10px', fontSize: '14px', color: 'var(--op-muted)', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--op-accent)', flexShrink: 0, marginTop: '2px' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <OptiCtaButton label={isRu ? "Обсудить проект" : "Discuss Project"} />
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '0 48px 120px', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 700, color: 'var(--op-text)', marginBottom: '48px' }}>
          {isRu ? 'Частые вопросы' : 'FAQ'}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {FAQ.map((item, i) => (
            <div key={i} style={{ padding: '28px 0', borderBottom: '1px solid var(--op-border)' }}>
              <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--op-text)', marginBottom: '10px' }}>
                {isRu ? item.qRu : item.qEn}
              </div>
              <div style={{ fontSize: '15px', color: 'var(--op-muted)', lineHeight: 1.7 }}>
                {isRu ? item.aRu : item.aEn}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

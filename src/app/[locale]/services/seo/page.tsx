import type { Metadata } from 'next';
import { OptiCtaButton } from '@/components/ui/OptiCtaButton';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isRu = locale === 'ru';

  const canonical = isRu
    ? 'https://optisphere.tech/services/seo'
    : 'https://optisphere.tech/en/services/seo';
  return {
    title: isRu
      ? 'SEO-продвижение сайтов в Крыму — Яндекс и Google | Optisphere'
      : 'SEO Promotion in Crimea — Yandex & Google | Optisphere',
    description: isRu
      ? 'Вывод сайта в топ Яндекса и Google по Крыму и всей России. Техническое SEO, контент, schema.org, Core Web Vitals. Первые результаты за 3 месяца.'
      : 'Ranking websites in Yandex and Google for Crimea and all Russia. Technical SEO, content, schema.org, Core Web Vitals. First results in 3 months.',
    alternates: {
      canonical,
      languages: {
        ru: 'https://optisphere.tech/services/seo',
        en: 'https://optisphere.tech/en/services/seo',
      },
    },
    openGraph: { url: canonical },
  };
}

const STEPS = [
  {
    num: '01',
    titleRu: 'Технический аудит',
    titleEn: 'Technical Audit',
    descRu: 'Проверяем скорость загрузки (Core Web Vitals), структуру URL, мета-теги, дубли страниц, битые ссылки. Формируем список критических правок.',
    descEn: 'We check loading speed (Core Web Vitals), URL structure, meta tags, duplicate pages, broken links. We create a list of critical fixes.',
  },
  {
    num: '02',
    titleRu: 'Семантическое ядро',
    titleEn: 'Keyword Research',
    descRu: 'Собираем запросы по вашей нише в Крыму и регионе. Распределяем по страницам, выделяем кластеры с быстрым трафиком.',
    descEn: 'We collect queries for your niche in Crimea and the region. We distribute them across pages and identify quick-traffic clusters.',
  },
  {
    num: '03',
    titleRu: 'Контент и schema.org',
    titleEn: 'Content & Schema.org',
    descRu: 'Оптимизируем H1, описания, alt-теги. Подключаем структурированные данные — LocalBusiness, FAQ, Product. Поисковик понимает сайт лучше.',
    descEn: 'We optimize H1, descriptions, alt tags. We add structured data — LocalBusiness, FAQ, Product. Search engines understand the site better.',
  },
  {
    num: '04',
    titleRu: 'Ссылочный профиль',
    titleEn: 'Link Building',
    descRu: 'Размещение в Яндекс.Бизнес, 2GIS, профильных каталогах. Крауд-ссылки и статьи на тематических площадках.',
    descEn: 'Placement in Yandex Business, 2GIS, industry directories. Crowd links and articles on thematic platforms.',
  },
  {
    num: '05',
    titleRu: 'Отчётность',
    titleEn: 'Reporting',
    descRu: 'Ежемесячный отчёт: позиции по ключам, трафик, CTR. Вебмастер + Метрика подключены, цели настроены.',
    descEn: 'Monthly report: keyword positions, traffic, CTR. Webmaster + Metrica connected, goals configured.',
  },
];

const RESULTS = [
  { numRu: '+34%', numEn: '+34%', labelRu: 'онлайн-броней', labelEn: 'online bookings', whoRu: 'Life Style Crimea', whoEn: 'Life Style Crimea' },
  { numRu: '3 мес', numEn: '3 months', labelRu: 'до первых позиций', labelEn: 'to first rankings', whoRu: 'средний срок', whoEn: 'average timeline' },
  { numRu: '×2', numEn: '×2', labelRu: 'органический трафик', labelEn: 'organic traffic', whoRu: 'за 6 месяцев', whoEn: 'in 6 months' },
];

const PACKAGES = [
  {
    nameRu: 'SEO Старт',
    nameEn: 'SEO Start',
    priceRu: '15 000 ₽/мес',
    priceEn: '₽15,000/mo',
    featuresRu: [
      'Технический аудит (разово)',
      'До 30 ключевых запросов',
      'Оптимизация мета-тегов',
      'Ежемесячный отчёт по позициям',
      'Подключение Яндекс.Вебмастер + GSC',
    ],
    featuresEn: [
      'Technical audit (one-time)',
      'Up to 30 keywords',
      'Meta tag optimization',
      'Monthly position report',
      'Yandex Webmaster + GSC setup',
    ],
    popular: false,
  },
  {
    nameRu: 'SEO Рост',
    nameEn: 'SEO Growth',
    priceRu: '30 000 ₽/мес',
    priceEn: '₽30,000/mo',
    featuresRu: [
      'Всё из «Старт»',
      'До 100 ключевых запросов',
      'Schema.org: LocalBusiness, FAQ',
      '2 SEO-статьи в блог в месяц',
      'Ссылочный профиль (Яндекс.Бизнес, 2GIS, каталоги)',
      'Оптимизация Core Web Vitals',
    ],
    featuresEn: [
      'Everything in Start',
      'Up to 100 keywords',
      'Schema.org: LocalBusiness, FAQ',
      '2 SEO blog articles per month',
      'Link profile (Yandex Business, 2GIS, directories)',
      'Core Web Vitals optimization',
    ],
    popular: true,
  },
  {
    nameRu: 'SEO Макс',
    nameEn: 'SEO Max',
    priceRu: '60 000 ₽/мес',
    priceEn: '₽60,000/mo',
    featuresRu: [
      'Всё из «Рост»',
      'Без ограничений по ключам',
      '5 SEO-статей в блог в месяц',
      'Крауд-маркетинг',
      'A/B тестирование посадочных страниц',
      'Приоритетная поддержка',
    ],
    featuresEn: [
      'Everything in Growth',
      'Unlimited keywords',
      '5 SEO blog articles per month',
      'Crowd marketing',
      'Landing page A/B testing',
      'Priority support',
    ],
    popular: false,
  },
];

const FAQ = [
  {
    qRu: 'Через сколько будут результаты?',
    aRu: 'Первые движения позиций — через 4–8 недель после старта. Устойчивый трафик — через 3–4 месяца. SEO — инвестиция, а не реклама.',
    qEn: 'How soon will results appear?',
    aEn: 'First position movements — 4–8 weeks after start. Stable traffic — 3–4 months. SEO is an investment, not advertising.',
  },
  {
    qRu: 'Вы работаете с Яндексом или Google?',
    aRu: 'С обоими. Для бизнеса в Крыму приоритет — Яндекс (70% трафика). Google важен для туристов из других стран.',
    qEn: 'Do you work with Yandex or Google?',
    aEn: 'Both. For Crimea businesses, priority is Yandex (70% of traffic). Google matters for international tourists.',
  },
  {
    qRu: 'Нужен ли контракт на год?',
    aRu: 'Нет. Работаем помесячно. Но реальный эффект виден от 3 месяцев — советуем планировать именно так.',
    qEn: 'Is a 1-year contract required?',
    aEn: 'No. We work month-to-month. But real effect shows from 3 months — we recommend planning accordingly.',
  },
  {
    qRu: 'Можно ли совмещать с Яндекс.Директ?',
    aRu: 'Да, это оптимальная стратегия: Директ даёт трафик сразу, SEO — долгосрочный органический канал.',
    qEn: 'Can it be combined with Yandex Direct?',
    aEn: 'Yes, that\'s the optimal strategy: Direct gives traffic immediately, SEO builds a long-term organic channel.',
  },
];

export default async function SeoPage({ params }: Props) {
  const { locale } = await params;
  const isRu = locale === 'ru';

  return (
    <main style={{ paddingTop: '80px', background: 'var(--op-bg)', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ padding: '80px 48px 64px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: '20px', marginBottom: '24px' }}>
          <span style={{ color: 'var(--op-accent)', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
            SEO
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 700, color: 'var(--op-text)', lineHeight: 1.1, marginBottom: '24px', maxWidth: '800px' }}>
          {isRu ? 'SEO-продвижение в Крыму и России' : 'SEO Promotion in Crimea & Russia'}
        </h1>
        <p style={{ fontSize: '20px', color: 'var(--op-muted)', maxWidth: '600px', lineHeight: 1.6, marginBottom: '40px' }}>
          {isRu
            ? 'Выводим сайты в топ Яндекса и Google. Первые позиции — через 3 месяца. Работаем с малым бизнесом в Крыму и по всей России.'
            : 'We rank websites in Yandex and Google. First positions in 3 months. We work with small businesses in Crimea and all Russia.'}
        </p>
        <OptiCtaButton label={isRu ? "Обсудить проект" : "Discuss Project"} />
      </section>

      {/* Results */}
      <section style={{ padding: '0 48px 80px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          {RESULTS.map((r) => (
            <div key={r.numRu} style={{ background: 'var(--op-surface)', border: '1px solid var(--op-border)', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--op-accent)', marginBottom: '8px' }}>{r.numRu}</div>
              <div style={{ fontSize: '16px', color: 'var(--op-text)', fontWeight: 600, marginBottom: '4px' }}>{isRu ? r.labelRu : r.labelEn}</div>
              <div style={{ fontSize: '13px', color: 'var(--op-muted)' }}>{isRu ? r.whoRu : r.whoEn}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section style={{ padding: '0 48px 80px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 700, color: 'var(--op-text)', marginBottom: '48px' }}>
          {isRu ? 'Как мы работаем' : 'How We Work'}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
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
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--op-text)', marginBottom: '8px' }}>
                {isRu ? pkg.nameRu : pkg.nameEn}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--op-accent)', marginBottom: '24px' }}>
                {isRu ? pkg.priceRu : pkg.priceEn}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
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

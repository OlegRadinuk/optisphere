'use client';
import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import SectionIntro from '@/components/hud/SectionIntro';

interface ServiceCard {
  slug: string;
  iconRu: string;
  iconEn: string;
  titleRu: string;
  titleEn: string;
  descRu: string;
  descEn: string;
  priceRu: string;
  priceEn: string;
  icon: React.ReactNode;
}

const ICON_BOT = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <path d="M12 11V7" />
    <circle cx="12" cy="5" r="2" />
    <path d="M8 15h.01M16 15h.01" />
  </svg>
);

const ICON_LAYOUT = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </svg>
);

const ICON_SEO = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M18 20V10M12 20V4M6 20v-6" />
  </svg>
);

const ICON_DIRECT = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
  </svg>
);

const ICON_PANO = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 12s3-5 9-5 9 5 9 5-3 5-9 5-9-5-9-5Z" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const SERVICES: ServiceCard[] = [
  {
    slug: 'ai-assistants',
    icon: ICON_BOT,
    iconRu: 'AI 01',
    iconEn: 'AI 01',
    titleRu: 'AI-ассистенты',
    titleEn: 'AI Assistants',
    descRu: 'Умный чат-бот для сайта: отвечает 24/7, принимает заявки, квалифицирует клиентов.',
    descEn: 'Smart chat bot for your site: answers 24/7, captures leads, qualifies clients.',
    priceRu: 'от 50 000 ₽',
    priceEn: 'from ₽50,000',
  },
  {
    slug: 'websites',
    icon: ICON_LAYOUT,
    iconRu: 'WEB 02',
    iconEn: 'WEB 02',
    titleRu: 'Сайты под ключ',
    titleEn: 'Websites',
    descRu: 'Лендинг за 3 дня или многостраничник с CMS. Всё с AI-ассистентом внутри.',
    descEn: 'Landing page in 3 days or multi-page site with CMS. AI assistant included.',
    priceRu: 'от 50 000 ₽',
    priceEn: 'from ₽50,000',
  },
  {
    slug: 'seo',
    icon: ICON_SEO,
    iconRu: 'SEO 03',
    iconEn: 'SEO 03',
    titleRu: 'SEO-продвижение',
    titleEn: 'SEO',
    descRu: 'Органический трафик из Яндекса и Google. Позиции в ТОП с первого месяца.',
    descEn: 'Organic traffic from Yandex and Google. Top positions from month one.',
    priceRu: 'от 25 000 ₽/мес',
    priceEn: 'from ₽25,000/mo',
  },
  {
    slug: 'yandex-direct',
    icon: ICON_DIRECT,
    iconRu: 'ADS 04',
    iconEn: 'ADS 04',
    titleRu: 'Яндекс.Директ',
    titleEn: 'Yandex Direct',
    descRu: 'Платный трафик с ROI. Настройка, ведение и ежемесячные отчёты по результатам.',
    descEn: 'Paid traffic with ROI. Setup, management and monthly performance reports.',
    priceRu: 'от 20 000 ₽/мес',
    priceEn: 'from ₽20,000/mo',
  },
  {
    slug: 'panoramas',
    icon: ICON_PANO,
    iconRu: 'VR 05',
    iconEn: 'VR 05',
    titleRu: 'Панорамы 360°',
    titleEn: '360° Panoramas',
    descRu: 'Интерактивные туры по объекту. Гостиницы, клиники, шоу-румы — онлайн-просмотр.',
    descEn: 'Interactive object tours. Hotels, clinics, showrooms — virtual viewing online.',
    priceRu: 'от 8 000 ₽',
    priceEn: 'from ₽8,000',
  },
];

function ServiceCard({ service }: { service: ServiceCard }) {
  const [hover, setHover] = useState(false);
  const locale = useLocale();
  const isRu = locale === 'ru';

  const href = service.slug === 'panoramas'
    ? '/services'
    : `/services/${service.slug}`;

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover
          ? 'linear-gradient(180deg,rgba(201,166,95,.05),transparent 60%),var(--op-surface-elevated)'
          : 'var(--op-surface-elevated)',
        border: hover
          ? '1px solid var(--op-border-accent)'
          : '1px solid var(--op-border)',
        borderRadius: 16,
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 220ms',
        minHeight: 260,
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: hover
              ? 'var(--op-accent-subtle)'
              : 'var(--op-surface-overlay)',
            border: hover
              ? '1px solid var(--op-border-accent)'
              : '1px solid var(--op-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: hover ? 'var(--op-accent)' : 'var(--op-text-secondary)',
            transition: 'all 220ms',
          }}
        >
          {service.icon}
        </span>
        <span
          style={{
            font: "500 11px/1 'JetBrains Mono',monospace",
            color: 'var(--op-text-muted)',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          {isRu ? service.iconRu : service.iconEn}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <h3
          style={{
            font: "500 22px/1.2 'Oxanium',sans-serif",
            letterSpacing: '-0.02em',
            margin: 0,
            color: 'var(--op-text)',
          }}
        >
          {isRu ? service.titleRu : service.titleEn}
        </h3>
        <p
          style={{
            font: "400 14px/1.55 'Inter',sans-serif",
            color: 'var(--op-text-secondary)',
            margin: 0,
          }}
        >
          {isRu ? service.descRu : service.descEn}
        </p>
      </div>

      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 16,
          borderTop: '1px solid var(--op-border)',
        }}
      >
        <span
          style={{
            font: "500 14px/1 'Oxanium',sans-serif",
            color: 'var(--op-accent)',
            letterSpacing: '-0.01em',
          }}
        >
          {isRu ? service.priceRu : service.priceEn}
        </span>
        <Link
          href={href as Parameters<typeof Link>[0]['href']}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            font: "500 13px/1 'Inter',sans-serif",
            color: hover ? 'var(--op-accent)' : 'var(--op-text-secondary)',
            textDecoration: 'none',
            transition: 'color 220ms',
          }}
        >
          {isRu ? 'Подробнее' : 'Learn more'}
          <span
            style={{
              transform: hover ? 'translateX(3px)' : 'translateX(0)',
              transition: 'transform 220ms',
              display: 'inline-flex',
            }}
          >
            →
          </span>
        </Link>
      </div>
    </article>
  );
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.93, y: 18 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 200, damping: 20 },
  },
};

export default function ServicesPreviewSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px' });
  const locale = useLocale();
  const isRu = locale === 'ru';

  return (
    <section id="services-preview" style={{ padding: '96px 0' }}>
      <div
        style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}
        className="section-container"
      >
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionIntro
            code="03"
            cmd="services.list()"
            title={isRu ? 'Что мы делаем' : 'What we do'}
            sub={
              isRu
                ? 'Пять инструментов для роста. Можно одно, можно всё вместе.'
                : 'Five tools for growth. Pick one, or all together.'
            }
          />
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 16,
          }}
          className="services-preview-grid"
        >
          {SERVICES.map((service) => (
            <motion.div key={service.slug} variants={itemVariants}>
              <ServiceCard service={service} />
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 1200px) {
          .services-preview-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .services-preview-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .services-preview-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

import { Link } from '@/i18n/navigation';
import Navbar from '@/components/sections/Navbar';
import Footer from '@/components/sections/Footer';
import { HudStatusBar, HudCorners, HudRail } from '@/components/hud/HudChrome';
import { OptiCtaButton } from '@/components/ui/OptiCtaButton';

const SERVICE_LINKS = [
  { slug: 'websites', labelRu: 'Сайты', labelEn: 'Websites' },
  { slug: 'ai-assistants', labelRu: 'AI-ассистенты', labelEn: 'AI Assistants' },
  { slug: 'seo', labelRu: 'SEO', labelEn: 'SEO' },
  { slug: 'yandex-direct', labelRu: 'Яндекс.Директ', labelEn: 'Yandex Direct' },
];

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function ServicesLayout({ children, params }: Props) {
  const { locale } = await params;
  const isRu = locale === 'ru';

  return (
    <main style={{ minHeight: '100vh', background: 'var(--op-base)' }}>
      <HudStatusBar />
      <HudCorners />
      <HudRail />
      <Navbar />

      {/* Breadcrumbs + submenu */}
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '20px 48px 0',
        }}
        className="services-breadcrumbs-wrap"
      >
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            font: "400 12px/1 'JetBrains Mono',monospace",
            color: 'var(--op-text-muted)',
            letterSpacing: '0.08em',
          }}
        >
          <Link
            href="/"
            className="svc-breadcrumb-link"
            style={{ color: 'var(--op-text-muted)', textDecoration: 'none' }}
          >
            {isRu ? 'Главная' : 'Home'}
          </Link>
          <span style={{ opacity: 0.4 }}>›</span>
          <Link
            href="/services"
            className="svc-breadcrumb-link"
            style={{ color: 'var(--op-text-muted)', textDecoration: 'none' }}
          >
            {isRu ? 'Услуги' : 'Services'}
          </Link>
        </nav>

        {/* Services submenu */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            marginTop: 16,
            flexWrap: 'wrap',
          }}
        >
          {SERVICE_LINKS.map((link) => (
            <Link
              key={link.slug}
              href={`/services/${link.slug}` as Parameters<typeof Link>[0]['href']}
              className="svc-nav-link"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: 32,
                padding: '0 14px',
                font: "400 12px/1 'Inter',sans-serif",
                color: 'var(--op-text-secondary)',
                textDecoration: 'none',
                border: '1px solid var(--op-border)',
                borderRadius: 4,
              }}
            >
              {isRu ? link.labelRu : link.labelEn}
            </Link>
          ))}
        </div>
      </div>

      {children}

      {/* Bottom CTA */}
      <section
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '64px 48px',
        }}
        className="services-cta-bottom"
      >
        <div
          style={{
            border: '1px solid var(--op-border)',
            borderRadius: 16,
            padding: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
            background: 'var(--op-surface-elevated)',
          }}
        >
          <div>
            <p
              style={{
                font: "500 11px/1 'JetBrains Mono',monospace",
                color: 'var(--op-accent)',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                margin: '0 0 12px',
              }}
            >
              {isRu ? 'ГОТОВЫ НАЧАТЬ?' : 'READY TO START?'}
            </p>
            <h2
              style={{
                font: "600 32px/1.2 'Oxanium',sans-serif",
                margin: '0 0 8px',
                color: 'var(--op-text)',
                letterSpacing: '-0.02em',
              }}
            >
              {isRu ? 'Обсудим ваш проект' : "Let's discuss your project"}
            </h2>
            <p
              style={{
                font: "400 15px/1.5 'Inter',sans-serif",
                color: 'var(--op-text-secondary)',
                margin: 0,
              }}
            >
              {isRu
                ? 'Ответ в течение часа. Без воды и лишних вопросов.'
                : 'Reply within an hour. Straight to the point.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <OptiCtaButton
              label={isRu ? 'Обсудить с Опти →' : 'Discuss with Opti →'}
              variant="primary"
            />
            <Link
              href="/contact"
              className="svc-contact-link"
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
              {isRu ? 'Написать напрямую' : 'Write directly'}
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        .svc-breadcrumb-link:hover { color: var(--op-accent) !important; }
        .svc-nav-link:hover { border-color: var(--op-accent) !important; color: var(--op-accent) !important; }
        .svc-contact-link:hover { border-color: var(--op-accent) !important; color: var(--op-accent) !important; }
        @media (max-width: 768px) {
          .services-breadcrumbs-wrap { padding: 16px 24px 0 !important; }
          .services-cta-bottom { padding: 40px 24px !important; }
          .services-cta-bottom > div { padding: 32px 24px !important; }
        }
      `}</style>
    </main>
  );
}

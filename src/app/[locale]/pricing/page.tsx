import { Link } from '@/i18n/navigation';
import SectionIntro from '@/components/hud/SectionIntro';
import PricingPageClient from './PricingPageClient';

// Server component wrapper — metadata lives in layout.tsx

export default function PricingPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--op-base)', color: 'var(--op-text)' }}>

      {/* Back nav */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 48px 0' }} className="pricing-back-nav">
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

      {/* Page header */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 48px 0' }} className="pricing-header">
        <SectionIntro
          code="07"
          cmd="pricing.all()"
          title="Тарифы и цены"
          sub="Прозрачные цены без скрытых доплат. Сайты, AI-ассистенты, SEO и реклама — всё в одном месте."
        />
      </div>

      {/* Main content — client sections */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px 96px' }} className="pricing-container">
        <PricingPageClient />
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .pricing-back-nav { padding: 24px 32px 0 !important; }
          .pricing-header { padding: 40px 32px 0 !important; }
          .pricing-container { padding: 0 32px 80px !important; }
        }
        @media (max-width: 640px) {
          .pricing-back-nav { padding: 20px 20px 0 !important; }
          .pricing-header { padding: 32px 20px 0 !important; }
          .pricing-container { padding: 0 20px 64px !important; }
        }
      `}</style>
    </main>
  );
}

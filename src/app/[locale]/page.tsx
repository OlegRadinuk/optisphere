import type { Metadata } from 'next';
import Navbar from '@/components/sections/Navbar';
import HeroSection from '@/components/sections/HeroSection';
import LiveDemoSection from '@/components/sections/LiveDemoSection';
import ServicesPreviewSection from '@/components/sections/ServicesPreviewSection';
import CasesSection from '@/components/sections/CasesSection';
import ProofSection from '@/components/sections/ProofSection';
import TeamSection from '@/components/sections/TeamSection';
import PricingSection from '@/components/sections/PricingSection';
import CalcSection from '@/components/sections/CalcSection';
import FaqSection from '@/components/sections/FaqSection';
import FinalCtaSection from '@/components/sections/FinalCtaSection';
import Footer from '@/components/sections/Footer';
import { HudStatusBar, HudCorners, HudRail, HudLogTicker } from '@/components/hud/HudChrome';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isRu = locale === 'ru';
  const canonical = isRu ? 'https://optisphere.tech/' : 'https://optisphere.tech/en';
  return {
    alternates: {
      canonical,
      languages: {
        ru: 'https://optisphere.tech/',
        en: 'https://optisphere.tech/en',
      },
    },
    openGraph: {
      url: canonical,
    },
  };
}

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--op-base)' }}>
      <HudStatusBar />
      <HudCorners />
      <HudRail />
      <Navbar />
      <HeroSection />
      <LiveDemoSection />
      <ServicesPreviewSection />
      <CasesSection />
      <ProofSection />
      <TeamSection />
      <PricingSection />
      <CalcSection />
      <FaqSection />
      <FinalCtaSection />
      <Footer />
      <HudLogTicker />
    </main>
  );
}

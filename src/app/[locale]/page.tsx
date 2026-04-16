import Navbar from '@/components/sections/Navbar';
import HeroSection from '@/components/sections/HeroSection';
import AIHookSection from '@/components/sections/AIHookSection';
import ServicesSection from '@/components/sections/ServicesSection';
import PortfolioSection from '@/components/sections/PortfolioSection';
import PricingSection from '@/components/sections/PricingSection';
import CalcSection from '@/components/sections/CalcSection';
import CTASection from '@/components/sections/CTASection';
import Footer from '@/components/sections/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-base">
      <Navbar />
      <HeroSection />
      <AIHookSection />
      <ServicesSection />
      <PortfolioSection />
      <PricingSection />
      <CalcSection />
      <CTASection />
      <Footer />
      {/* YuraWidgetLoader will be added separately */}
    </main>
  );
}

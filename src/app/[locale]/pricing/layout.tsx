import type { Metadata } from 'next';
import Navbar from '@/components/sections/Navbar';
import Footer from '@/components/sections/Footer';
import { HudStatusBar, HudCorners, HudRail } from '@/components/hud/HudChrome';

export const metadata: Metadata = {
  title: 'Цены на разработку сайтов и AI-ассистентов — Optisphere',
  description:
    'Прозрачные цены на создание сайтов, AI-ботов и SEO-продвижение. Лендинг от 50 000 ₽, AI-ассистент от 50 000 ₽. Подписка "Орбита" от 10 000 ₽/мес.',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--op-base)' }}>
      <HudStatusBar />
      <HudCorners />
      <HudRail />
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

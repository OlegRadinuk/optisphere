import type { Metadata } from 'next';
import Navbar from '@/components/sections/Navbar';
import Footer from '@/components/sections/Footer';
import { HudStatusBar, HudCorners, HudRail } from '@/components/hud/HudChrome';

export const metadata: Metadata = {
  title: 'Кейсы — реализованные проекты Optisphere',
  description:
    'Реальные результаты: сайты с AI для гостиниц и клиник, настройка Яндекс.Директ, AI-ассистенты для бизнеса. Крым и вся Россия.',
  alternates: {
    canonical: 'https://optisphere.tech/cases',
    languages: {
      ru: 'https://optisphere.tech/cases',
      en: 'https://optisphere.tech/en/cases',
    },
  },
};

export default function CasesLayout({ children }: { children: React.ReactNode }) {
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

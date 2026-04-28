import Navbar from '@/components/sections/Navbar';
import Footer from '@/components/sections/Footer';
import { HudStatusBar, HudCorners, HudRail } from '@/components/hud/HudChrome';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
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

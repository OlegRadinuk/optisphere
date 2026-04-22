'use client';
import HeroStage from '@/components/hero/HeroStage';

export default function HeroSection() {
  return (
    <section
      id="hero"
      style={{ padding:'80px 0 100px', position:'relative', overflow:'hidden', minHeight:'calc(100vh - 80px)' }}
    >
      <div aria-hidden style={{
        position:'absolute', inset:0, pointerEvents:'none',
        backgroundImage:
          'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),' +
          'linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)',
        backgroundSize:'80px 80px',
        maskImage:'radial-gradient(ellipse at 70% 40%, black 10%, transparent 70%)',
        WebkitMaskImage:'radial-gradient(ellipse at 70% 40%, black 10%, transparent 70%)',
      }}/>

      <div style={{
        maxWidth:1280, margin:'0 auto', padding:'0 48px', position:'relative',
        display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1.15fr)',
        gap:72, alignItems:'center',
      }} className="hero-container">
        <div style={{ display:'flex', flexDirection:'column', gap:28 }} className="hero-text">
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, font:"500 11px/1 'JetBrains Mono',monospace", letterSpacing:'.14em', textTransform:'uppercase' }}>
            <span style={{ width:6, height:6, background:'var(--op-accent-2)', boxShadow:'0 0 8px rgba(232,87,74,.6)', animation:'hudPulse 1.8s ease-in-out infinite', display:'inline-block' }}/>
            <span style={{ color:'var(--op-accent-2)' }}>LIVE</span>
            <span style={{ color:'var(--op-text-muted)' }}>◆ OPTISPHERE · AI-FIRST WEB STUDIO</span>
          </div>

          <h1 style={{ font:"700 clamp(44px,7vw,104px)/.98 'Oxanium',sans-serif", letterSpacing:'-0.025em', margin:0, color:'var(--op-text)', textTransform:'uppercase' }}>
            Познакомьтесь<br/>с <span style={{ color:'var(--op-accent)' }}>Юрой</span><span style={{ color:'var(--op-accent-2)' }}>.</span>
          </h1>

          <p style={{ font:"400 20px/1.55 'Inter',sans-serif", color:'var(--op-text-secondary)', margin:0, maxWidth:480 }}>
            Он продаёт, консультирует и работает 24/7. Задайте вопрос справа — увидите его мышление вживую. Без анкет, без «оставьте заявку».
          </p>

          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <button style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8, height:48, padding:'0 26px', borderRadius:8, background:'var(--op-accent)', color:'var(--op-text-on-accent)', border:'none', cursor:'pointer', font:"500 15px/1 'Inter',sans-serif" }}>
              Посмотреть тарифы →
            </button>
            <button style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8, height:48, padding:'0 26px', borderRadius:8, background:'transparent', color:'var(--op-text)', border:'1px solid var(--op-border-strong)', cursor:'pointer', font:"500 15px/1 'Inter',sans-serif" }}>
              Как это работает
            </button>
          </div>

          <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap', marginTop:8, font:"500 10px/1.4 'JetBrains Mono',monospace", color:'var(--op-text-muted)', letterSpacing:'.12em', textTransform:'uppercase' }}>
            <span>150+ проектов</span>
            <span style={{ width:3, height:3, background:'var(--op-text-faint)', display:'inline-block' }}/>
            <span>25 AI-агентов</span>
            <span style={{ width:3, height:3, background:'var(--op-text-faint)', display:'inline-block' }}/>
            <span>РФ-хостинг</span>
          </div>
        </div>

        <div className="hero-chat">
          <HeroStage/>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .hero-container { grid-template-columns: 1fr !important; gap: 40px !important; padding: 0 32px !important; }
          .hero-text { order: 2; }
          .hero-chat { order: 1; }
        }
        @media (max-width: 640px) {
          .hero-container { padding: 0 20px !important; }
        }
      `}</style>
    </section>
  );
}

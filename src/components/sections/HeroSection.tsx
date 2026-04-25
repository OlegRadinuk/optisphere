'use client';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import HeroStage from '@/components/hero/HeroStage';

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const } },
});

export default function HeroSection() {
  const t = useTranslations('hero');
  const th = useTranslations('hook');

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
        <motion.div
          style={{ display:'flex', flexDirection:'column', gap:28 }}
          className="hero-text"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
          }}
        >
          <motion.div variants={fadeUp(0)}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:10, font:"500 11px/1 'JetBrains Mono',monospace", letterSpacing:'.14em', textTransform:'uppercase' }}>
              <span style={{ width:6, height:6, background:'var(--op-accent-2)', boxShadow:'0 0 8px rgba(255,74,74,.6)', animation:'hudPulse 1.8s ease-in-out infinite', display:'inline-block' }}/>
              <span style={{ color:'var(--op-accent-2)' }}>LIVE</span>
              <span style={{ color:'var(--op-text-muted)' }}>◆ OPTISPHERE · AI-FIRST WEB STUDIO</span>
            </div>
          </motion.div>

          <motion.h1
            variants={fadeUp(0.05)}
            style={{ font:"700 clamp(44px,7vw,104px)/.98 'Oxanium',sans-serif", letterSpacing:'-0.025em', margin:0, color:'var(--op-text)', textTransform:'uppercase' }}
          >
            {t('meet_title_line1')} <span style={{ color:'var(--op-accent)' }}>{t('meet_title_yura')}</span><span style={{ color:'var(--op-accent-2)' }}>.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp(0.1)}
            style={{ font:"400 20px/1.55 'Inter',sans-serif", color:'var(--op-text-secondary)', margin:0, maxWidth:480 }}
          >
            {t('meet_subtitle')}
          </motion.p>

          <motion.div variants={fadeUp(0.15)} style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn btn-primary"
            >
              {t('cta.primary')}
            </button>
            <button
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn btn-ghost"
            >
              {t('cta.secondary')}
            </button>
          </motion.div>

          <motion.div
            variants={fadeUp(0.2)}
            style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap', marginTop:8, font:"500 10px/1.4 'JetBrains Mono',monospace", color:'var(--op-text-muted)', letterSpacing:'.12em', textTransform:'uppercase' }}
          >
            <span>{th('sites.value')}+ {th('sites.label')}</span>
            <span style={{ width:3, height:3, background:'var(--op-text-faint)', display:'inline-block' }}/>
            <span>{th('leads.value')} {th('leads.label')}</span>
            <span style={{ width:3, height:3, background:'var(--op-text-faint)', display:'inline-block' }}/>
            <span>{t('hosting')}</span>
          </motion.div>
        </motion.div>

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
          #hero { padding: 60px 0 40px !important; }
          .hero-container { padding: 0 20px !important; }
          .hero-chat { max-height: 480px; overflow: hidden; }
        }
      `}</style>
    </section>
  );
}

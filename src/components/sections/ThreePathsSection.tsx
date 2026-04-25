'use client';
import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import SectionIntro from '@/components/hud/SectionIntro';

const PATH_ICONS = ['bot', 'layout', 'bar-chart'] as const;

const ICONS: Record<string, React.ReactNode> = {
  bot: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 11V7"/><circle cx="12" cy="5" r="2"/><path d="M8 15h.01M16 15h.01"/></svg>,
  layout: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  'bar-chart': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
};

interface PathItem {
  eb: string;
  title: string;
  desc: string;
  price: string;
  icon: typeof PATH_ICONS[number];
}

function PathCard({ p, more }: { p: PathItem; more: string }) {
  const [hover, setHover] = useState(false);
  return (
    <article onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      background: hover ? 'linear-gradient(180deg,rgba(201,166,95,.05),transparent 60%),var(--op-surface-elevated)' : 'var(--op-surface-elevated)',
      border: hover ? '1px solid var(--op-border-accent)' : '1px solid var(--op-border)',
      borderRadius:16, padding:28, display:'flex', flexDirection:'column', gap:20,
      transform: hover ? 'translateY(-4px)' : 'translateY(0)',
      transition:'all 220ms', minHeight:280, cursor:'pointer',
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ width:44, height:44, borderRadius:10, background: hover?'var(--op-accent-subtle)':'var(--op-surface-overlay)', border: hover?'1px solid var(--op-border-accent)':'1px solid var(--op-border)', display:'flex', alignItems:'center', justifyContent:'center', color: hover?'var(--op-accent)':'var(--op-text-secondary)', transition:'all 220ms' }}>
          {ICONS[p.icon]}
        </span>
        <span style={{ font:"500 11px/1 'JetBrains Mono',monospace", color:'var(--op-text-muted)', letterSpacing:'0.14em', textTransform:'uppercase' }}>{p.eb}</span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <h3 style={{ font:"500 26px/1.15 'Oxanium',sans-serif", letterSpacing:'-0.02em', margin:0, color:'var(--op-text)' }}>{p.title}</h3>
        <p style={{ font:"400 15px/1.55 'Inter',sans-serif", color:'var(--op-text-secondary)', margin:0 }}>{p.desc}</p>
      </div>
      <div style={{ marginTop:'auto', display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:16, borderTop:'1px solid var(--op-border)' }}>
        <span style={{ font:"500 15px/1 'Oxanium',sans-serif", color:'var(--op-accent)', letterSpacing:'-0.01em' }}>{p.price}</span>
        <span style={{ display:'inline-flex', alignItems:'center', gap:6, font:"500 13px/1 'Inter',sans-serif", color: hover?'var(--op-accent)':'var(--op-text-secondary)', transition:'color 220ms' }}>
          {more}
          <span style={{ transform: hover?'translateX(3px)':'translateX(0)', transition:'transform 220ms', display:'inline-flex' }}>→</span>
        </span>
      </div>
    </article>
  );
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 20 } },
};

export default function ThreePathsSection() {
  const t = useTranslations('paths');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px' });

  const PATHS: PathItem[] = [
    { eb: t('items.0.eb'), title: t('items.0.title'), desc: t('items.0.desc'), price: t('items.0.price'), icon: 'bot' },
    { eb: t('items.1.eb'), title: t('items.1.title'), desc: t('items.1.desc'), price: t('items.1.price'), icon: 'layout' },
    { eb: t('items.2.eb'), title: t('items.2.title'), desc: t('items.2.desc'), price: t('items.2.price'), icon: 'bar-chart' },
  ];

  return (
    <section id="paths" style={{ padding:'96px 0' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 48px' }} className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionIntro code="03" cmd="paths.list()" title={t('title')} sub={t('sub')}/>
        </motion.div>
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}
          className="paths-grid"
        >
          {PATHS.map((p,i) => (
            <motion.div key={i} variants={itemVariants}>
              <PathCard p={p} more={t('more')}/>
            </motion.div>
          ))}
        </motion.div>
      </div>
      <style>{`@media(max-width:900px){.paths-grid{grid-template-columns:1fr!important;}}`}</style>
    </section>
  );
}

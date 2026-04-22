'use client';
import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import SectionIntro from '@/components/hud/SectionIntro';

function FaqItem({ q, a, open, onClick }: { q: string; a: string; open: boolean; onClick: () => void }) {
  return (
    <div style={{ border:'1px solid var(--op-border)', borderRadius:10, background: open?'var(--op-surface-elevated)':'var(--op-surface)', transition:'background 220ms', overflow:'hidden' }}>
      <button onClick={onClick} style={{ width:'100%', background:'transparent', border:0, padding:'20px 22px', display:'flex', alignItems:'center', gap:16, cursor:'pointer', textAlign:'left', color:'var(--op-text)', minHeight:56 }}>
        <span style={{ flex:1, font:"500 16px/1.4 'Oxanium',sans-serif", letterSpacing:'-0.01em' }}>{q}</span>
        <span style={{ width:28, height:28, borderRadius:6, border:'1px solid var(--op-border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color: open?'var(--op-accent)':'var(--op-text-secondary)', transform: open?'rotate(180deg)':'rotate(0)', transition:'transform 220ms, color 220ms' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m6 9 6 6 6-6"/></svg>
        </span>
      </button>
      <div style={{ maxHeight: open?400:0, overflow:'hidden', transition:'max-height 320ms' }}>
        <p style={{ font:"400 15px/1.6 'Inter',sans-serif", color:'var(--op-text-secondary)', margin:0, padding:'0 22px 22px', maxWidth:720 }}>{a}</p>
      </div>
    </div>
  );
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

const FAQ_INDICES = [0, 1, 2, 3, 4, 5, 6, 7];

export default function FaqSection() {
  const t = useTranslations('faq');
  const [open, setOpen] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px' });

  return (
    <section id="faq" style={{ padding:'96px 0' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 48px' }}>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionIntro code="08" cmd="faq.search()" title={t('title')}/>
        </motion.div>
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{ display:'flex', flexDirection:'column', gap:10, maxWidth:860 }}
        >
          {FAQ_INDICES.map((i) => (
            <motion.div key={i} variants={itemVariants}>
              <FaqItem
                q={t(`items.${i}.q`)}
                a={t(`items.${i}.a`)}
                open={open === i}
                onClick={() => setOpen(open === i ? -1 : i)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

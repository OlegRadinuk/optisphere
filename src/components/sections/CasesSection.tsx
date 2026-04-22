'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import SectionIntro from '@/components/hud/SectionIntro';

const CASES_DATA = [
  { nicheKey:'clinic',     cityKey:'moscow',      madeKey:'clinic',
    metrics:[['45 → 127','leads_per_month'],['₽2 800 → ₽920','lead_price'],['78%','ai_handled']], footerKey:'m6' },
  { nicheKey:'shop',       cityKey:'spb',         madeKey:'shop',
    metrics:[['1.8% → 4.3%','conversion'],['+22%','avg_check'],['91%','ai_support']], footerKey:'m4' },
  { nicheKey:'legal',      cityKey:'ekb',         madeKey:'legal',
    metrics:[['12 → 67','leads_per_month'],['−60%','lead_price'],['ТОП-3','in_yandex']], footerKey:'m5' },
  { nicheKey:'restaurant', cityKey:'kazan',       madeKey:'restaurant',
    metrics:[['+340%','online_bookings'],['−45%','cancellations'],['+18%','avg_check']], footerKey:'m3' },
  { nicheKey:'barbershop', cityKey:'novosibirsk', madeKey:'barbershop',
    metrics:[['87%','online_booking_rate'],['−63%','no_show'],['+28%','repeat_visits']], footerKey:'m6' },
  { nicheKey:'school',     cityKey:'rostov',      madeKey:'school',
    metrics:[['+156%','registrations'],['−72%','lead_price'],['93%','ai_questions']], footerKey:'m7' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: (i: number) => ({ opacity: 0, x: i % 2 === 0 ? -40 : 40 }),
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function CasesSection() {
  const t = useTranslations('cases');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px' });

  return (
    <section id="cases" style={{ padding:'96px 0' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 48px' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionIntro code="04" cmd="cases.query({hot:true})" title={t('title')} sub={t('sub')} crimson/>
        </motion.div>
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}
          className="cases-grid"
        >
          {CASES_DATA.map((c,i) => (
            <motion.article key={i} variants={itemVariants} custom={i} style={{ background:'var(--op-surface-elevated)', border:'1px solid var(--op-border)', borderRadius:12, padding:24, display:'flex', flexDirection:'column', gap:20 }}>
              <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                  <span style={{ font:"500 15px/1.2 'Inter',sans-serif", color:'var(--op-text)', letterSpacing:'-0.01em' }}>{t(`niches.${c.nicheKey}`)}</span>
                  <span style={{ font:"400 11px/1 'JetBrains Mono',monospace", color:'var(--op-text-muted)', letterSpacing:'.1em', textTransform:'uppercase' }}>{t(`cities.${c.cityKey}`)}</span>
                </div>
              </div>
              <div style={{ padding:'10px 12px', background:'var(--op-base)', borderRadius:8, border:'1px solid var(--op-border)', font:"400 13px/1.4 'Inter',sans-serif", color:'var(--op-text-secondary)' }}>
                <span style={{ color:'var(--op-text-muted)' }}>{t('made_label')}</span>{t(`made.${c.madeKey}`)}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                {c.metrics.map(([v,metricKey],j) => (
                  <div key={j} style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    <span style={{ font:"500 18px/1.1 'Inter',sans-serif", color:'var(--op-accent)', letterSpacing:'-0.02em' }}>{v}</span>
                    <span style={{ font:"400 11px/1.3 'Inter',sans-serif", color:'var(--op-text-muted)' }}>{t(`metrics.${metricKey}`)}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:'auto', paddingTop:12, borderTop:'1px solid var(--op-border)', font:"400 11px/1 'JetBrains Mono',monospace", color:'var(--op-text-muted)', letterSpacing:'.1em', textTransform:'uppercase' }}>
                {t(`footers.${c.footerKey}`)}
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
      <style>{`@media(max-width:900px){.cases-grid{grid-template-columns:1fr!important;}}@media(min-width:641px)and(max-width:900px){.cases-grid{grid-template-columns:repeat(2,1fr)!important;}}`}</style>
    </section>
  );
}

'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionIntro from '@/components/hud/SectionIntro';

const CASES = [
  { niche:'Медицинская клиника', city:'Москва', made:'Сайт + SEO + AI-администратор',
    metrics:[['45 → 127','заявок/мес'],['₽2 800 → ₽920','цена лида'],['78%','обработано AI']], footer:'за 6 месяцев' },
  { niche:'Интернет-магазин', city:'Санкт-Петербург', made:'Сайт с AI-продажником',
    metrics:[['1.8% → 4.3%','конверсия'],['+22%','средний чек'],['91%','поддержки AI']], footer:'за 4 месяца' },
  { niche:'Юридическая фирма', city:'Екатеринбург', made:'Лендинг + SEO',
    metrics:[['12 → 67','заявок/мес'],['−60%','цена лида'],['ТОП-3','в Яндексе']], footer:'за 5 месяцев' },
  { niche:'Ресторан', city:'Казань', made:'Сайт + AI-бронирование',
    metrics:[['+340%','онлайн-брони'],['−45%','отмены'],['+18%','средний чек']], footer:'за 3 месяца' },
  { niche:'Барбершоп · 5 точек', city:'Новосибирск', made:'Сайт + AI-запись',
    metrics:[['87%','онлайн-запись'],['−63%','no-show'],['+28%','повторные визиты']], footer:'за 6 месяцев' },
  { niche:'Онлайн-школа', city:'Ростов-на-Дону', made:'Сайт + SEO + AI-консультант',
    metrics:[['+156%','регистрации'],['−72%','цена лида'],['93%','вопросов AI']], footer:'за 7 месяцев' },
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
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="cases" style={{ padding:'96px 0' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 48px' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionIntro code="04" cmd="cases.query({hot:true})" title="Что получается на практике" sub="Анонимно, но точно. Полные кейсы с названиями — под NDA, покажем в разговоре." crimson/>
        </motion.div>
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}
          className="cases-grid"
        >
          {CASES.map((c,i) => (
            <motion.article key={i} variants={itemVariants} custom={i} style={{ background:'var(--op-surface-elevated)', border:'1px solid var(--op-border)', borderRadius:12, padding:24, display:'flex', flexDirection:'column', gap:20 }}>
              <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                  <span style={{ font:"500 15px/1.2 'Inter',sans-serif", color:'var(--op-text)', letterSpacing:'-0.01em' }}>{c.niche}</span>
                  <span style={{ font:"400 11px/1 'JetBrains Mono',monospace", color:'var(--op-text-muted)', letterSpacing:'.1em', textTransform:'uppercase' }}>{c.city}</span>
                </div>
              </div>
              <div style={{ padding:'10px 12px', background:'var(--op-base)', borderRadius:8, border:'1px solid var(--op-border)', font:"400 13px/1.4 'Inter',sans-serif", color:'var(--op-text-secondary)' }}>
                <span style={{ color:'var(--op-text-muted)' }}>Сделали: </span>{c.made}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                {c.metrics.map(([v,l],j) => (
                  <div key={j} style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    <span style={{ font:"500 18px/1.1 'Inter',sans-serif", color:'var(--op-accent)', letterSpacing:'-0.02em' }}>{v}</span>
                    <span style={{ font:"400 11px/1.3 'Inter',sans-serif", color:'var(--op-text-muted)' }}>{l}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:'auto', paddingTop:12, borderTop:'1px solid var(--op-border)', font:"400 11px/1 'JetBrains Mono',monospace", color:'var(--op-text-muted)', letterSpacing:'.1em', textTransform:'uppercase' }}>
                {c.footer}
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
      <style>{`@media(max-width:900px){.cases-grid{grid-template-columns:1fr!important;}}@media(min-width:641px)and(max-width:900px){.cases-grid{grid-template-columns:repeat(2,1fr)!important;}}`}</style>
    </section>
  );
}

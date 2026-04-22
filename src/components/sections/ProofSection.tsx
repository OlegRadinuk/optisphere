'use client';
import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionIntro from '@/components/hud/SectionIntro';

const TILES = [
  { niche:'Ювелирный магазин',      img:'/portfolio/versal.jpg',           span:'tall' },
  { niche:'Медицинская клиника',    img:'/portfolio/medcentr.jpg',         span:'wide' },
  { niche:'Фитнес-студия',           img:'/portfolio/lovelifestyle.jpg',    span:'std'  },
  { niche:'Отель премиум-класса',   img:'/portfolio/deniz.jpg',            span:'std'  },
  { niche:'Строительная компания',  img:'/portfolio/vladen.jpg',           span:'wide' },
  { niche:'Агентство недвижимости', img:'/portfolio/lifestyle-crimea.jpg', span:'std'  },
  { niche:'Автосервис',              img:'/portfolio/medcentr.jpg',         span:'std'  },
  { niche:'Детский центр',           img:'/portfolio/deniz.jpg',            span:'tall' },
  { niche:'Ресторан',                img:'/portfolio/versal.jpg',           span:'std'  },
  { niche:'Кофейня · сеть',          img:'/portfolio/lovelifestyle.jpg',    span:'std'  },
  { niche:'Юридическая фирма',      img:'/portfolio/vladen.jpg',           span:'std'  },
  { niche:'Онлайн-школа',           img:'/portfolio/lifestyle-crimea.jpg', span:'wide' },
];

function ProofTile({ t }: { t: typeof TILES[0] }) {
  const [hover, setHover] = useState(false);
  const spanStyle: React.CSSProperties =
    t.span === 'tall' ? { gridRow:'span 2' } :
    t.span === 'wide' ? { gridColumn:'span 2' } : {};
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position:'relative', borderRadius:12, overflow:'hidden',
        backgroundImage:`url(${t.img})`, backgroundSize:'cover', backgroundPosition:'center',
        border: hover ? '1px solid var(--op-border-accent)' : '1px solid var(--op-border)',
        minHeight:160, cursor:'default',
        transition:'border-color 220ms, transform 220ms',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        filter: hover ? 'none' : 'saturate(0.75) brightness(0.9)',
        ...spanStyle,
      }}
    >
      <div style={{ position:'absolute', inset:0, background: hover ? 'linear-gradient(to top, rgba(10,14,20,.85), rgba(10,14,20,.2) 60%)' : 'linear-gradient(to top, rgba(10,14,20,.65), transparent 70%)', transition:'background 220ms' }}/>
      <span aria-hidden style={{ position:'absolute', top:10, right:10, width:6, height:6, borderRadius:'50%', background:'var(--op-accent)', opacity: hover?1:0.4, boxShadow: hover?'0 0 0 4px var(--op-accent-faint)':'none', transition:'all 220ms' }}/>
      <div style={{ position:'absolute', left:14, bottom:14, padding:'6px 10px', borderRadius:6, background:'rgba(10,14,20,.9)', border:'1px solid var(--op-border-accent)', font:"500 12px/1.2 'Inter',sans-serif", color:'var(--op-text)', opacity: hover?1:0, transform: hover?'translateY(0)':'translateY(4px)', transition:'all 220ms' }}>
        {t.niche}
      </div>
    </div>
  );
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function ProofSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="proof" style={{ padding:'96px 0', background:'var(--op-surface)', borderTop:'1px solid var(--op-border)', borderBottom:'1px solid var(--op-border)' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 48px' }}>
        <motion.div
          initial={{ opacity: 0, clipPath: 'inset(100% 0 0 0)' }}
          animate={inView ? { opacity: 1, clipPath: 'inset(0% 0 0 0)' } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionIntro code="05" cmd="clients.list()" title="Мы работали с" sub="Показываем без логотипов — клиенты ценят приватность. Наведите, чтобы увидеть нишу."/>
        </motion.div>
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gridAutoRows:'120px', gap:12 }}
          className="proof-collage"
        >
          {TILES.map((t,i) => {
            const spanStyle: React.CSSProperties =
              t.span === 'tall' ? { gridRow:'span 2' } :
              t.span === 'wide' ? { gridColumn:'span 2' } : {};
            return (
              <motion.div key={i} variants={itemVariants} style={spanStyle}>
                <ProofTile t={t}/>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
      <style>{`
        @media(max-width:900px){.proof-collage{grid-template-columns:repeat(2,1fr)!important;}}
        @media(max-width:640px){.proof-collage{grid-template-columns:1fr!important;}}
        @media(max-width:900px){.proof-collage>*{grid-column:span 1!important;grid-row:span 1!important;}}
      `}</style>
    </section>
  );
}

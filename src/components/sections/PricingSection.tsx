import SectionIntro from '@/components/hud/SectionIntro';

const TIERS = [
  { name:'Быстрый старт', price:'120 000 ₽', term:'3 дня',       desc:'Для первых продаж',                    cta:'Начать',   featured:false },
  { name:'Стандарт',      price:'200 000 ₽', term:'5–7 дней',    desc:'Премиум-лендинг с ассистентом',        cta:'Начать',   featured:true,  badge:'Самый популярный' },
  { name:'Про',           price:'450 000 ₽', term:'2–4 недели',  desc:'Для зрелого бизнеса',                  cta:'Начать',   featured:false },
  { name:'Корпоративный', price:'обсуждается',term:'1–3 мес',    desc:'Индивидуально',                        cta:'Обсудить', featured:false },
];

export default function PricingSection() {
  return (
    <section id="pricing" style={{ padding:'96px 0' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 48px' }}>
        <SectionIntro code="07" cmd="pricing.estimate()" title="Простое ценообразование" sub="Полный перечень — на странице каждого продукта."/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }} className="pricing-grid">
          {TIERS.map((t,i) => (
            <article key={i} style={{
              background: t.featured
                ? 'linear-gradient(180deg,rgba(201,166,95,.06),transparent 60%),var(--op-surface-elevated)'
                : 'var(--op-surface-elevated)',
              border: t.featured ? '1px solid var(--op-border-accent)' : '1px solid var(--op-border)',
              borderRadius: t.featured ? 16 : 12,
              padding:24, display:'flex', flexDirection:'column', gap:18,
              minHeight:360, position:'relative',
              transform: t.featured ? 'translateY(-8px)' : 'none',
            }}>
              {t.featured && (
                <span style={{ position:'absolute', top:-10, left:24, background:'var(--op-accent)', color:'var(--op-text-on-accent)', padding:'4px 10px', borderRadius:999, font:"500 11px/1 'Inter',sans-serif" }}>
                  {(t as typeof t & { badge?: string }).badge}
                </span>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <span style={{ font:"500 13px/1 'Inter',sans-serif", color: t.featured?'var(--op-accent)':'var(--op-text)', letterSpacing:'-0.005em' }}>{t.name}</span>
                <span style={{ font:"500 32px/1 'Inter',sans-serif", color:'var(--op-text)', letterSpacing:'-0.025em' }}>{t.price}</span>
                <span style={{ font:"400 12px/1 'JetBrains Mono',monospace", color:'var(--op-text-muted)', letterSpacing:'.08em', textTransform:'uppercase' }}>{t.term} · фикс</span>
              </div>
              <p style={{ font:"400 14px/1.55 'Inter',sans-serif", color:'var(--op-text-secondary)', margin:0 }}>{t.desc}</p>
              <button style={{ marginTop:'auto', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6, height:36, padding:'0 14px', borderRadius:8, background: t.featured?'var(--op-accent)':'transparent', color: t.featured?'var(--op-text-on-accent)':'var(--op-text)', border: t.featured?'none':'1px solid var(--op-border-strong)', cursor:'pointer', font:"500 13px/1 'Inter',sans-serif" }}>
                {t.cta} →
              </button>
            </article>
          ))}
        </div>
        <div style={{ marginTop:32, textAlign:'center' }}>
          <a style={{ display:'inline-flex', alignItems:'center', gap:8, font:"500 14px/1 'Inter',sans-serif", color:'var(--op-accent)', textDecoration:'none', cursor:'pointer' }}>
            Калькулятор пакетного тарифа — экономия до 25% →
          </a>
        </div>
      </div>
      <style>{`@media(max-width:900px){.pricing-grid{grid-template-columns:repeat(2,1fr)!important;}}@media(max-width:640px){.pricing-grid{grid-template-columns:1fr!important;}}`}</style>
    </section>
  );
}

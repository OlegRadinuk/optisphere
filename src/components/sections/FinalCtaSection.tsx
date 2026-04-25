'use client';

export default function FinalCtaSection() {
  return (
    <section id="cta" style={{ padding:'120px 0', position:'relative', overflow:'hidden' }}>
      <div aria-hidden style={{ position:'absolute', inset:'-20% -20% auto -20%', height:'60%', pointerEvents:'none', background:'radial-gradient(ellipse at 50% 0%, rgba(201,166,95,.08), transparent 60%)' }}/>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 48px', position:'relative', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:24 }} className="section-container">
        <span style={{ display:'inline-flex', alignItems:'center', gap:12, font:"500 11px/1 'JetBrains Mono',monospace", color:'var(--op-accent)', letterSpacing:'0.14em', textTransform:'uppercase' }}>
          <span style={{ width:24, height:1, background:'var(--op-accent)', display:'inline-block' }}/>
          НАЧНЁМ С РАЗГОВОРА
        </span>
        <h2 style={{ font:"500 clamp(36px,5.5vw,68px)/1.05 'Oxanium',sans-serif", letterSpacing:'-0.03em', margin:0, color:'var(--op-text)', maxWidth:900 }}>
          Начнём с разговора
        </h2>
        <p style={{ font:"400 19px/1.55 'Inter',sans-serif", color:'var(--op-text-secondary)', margin:0, maxWidth:620 }}>
          Наш ассистент за 5 минут поймёт задачу и даст конкретные цифры по срокам и стоимости.
        </p>
        <button onClick={() => window.dispatchEvent(new CustomEvent('yura-open'))} style={{ marginTop:8, height:56, padding:'0 32px', fontSize:16, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8, borderRadius:8, background:'var(--op-accent)', color:'var(--op-text-on-accent)', border:'none', cursor:'pointer', font:"500 16px/1 'Inter',sans-serif" }}>
          Открыть чат с ассистентом →
        </button>
        <div style={{ marginTop:16, display:'flex', gap:28, flexWrap:'wrap', justifyContent:'center', font:"400 13px/1.4 'Inter',sans-serif", color:'var(--op-text-muted)' }}>
          <span>📞 +7 (978) 576-84-51</span>
          <span>✉ hello@optisphere.ru</span>
          <span>✈ @optisphere</span>
        </div>
      </div>
    </section>
  );
}

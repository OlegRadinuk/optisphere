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
          Опти разберётся в задаче за 5 минут
        </h2>
        <p style={{ font:"400 19px/1.55 'Inter',sans-serif", color:'var(--op-text-secondary)', margin:0, maxWidth:620 }}>
          Расскажите о бизнесе — получите конкретные цифры по срокам и стоимости. Без анкет и «мы вам перезвоним».
        </p>
        <button onClick={() => window.dispatchEvent(new CustomEvent('opti-open'))} style={{ marginTop:8, height:56, padding:'0 32px', fontSize:16, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8, borderRadius:8, background:'var(--op-accent)', color:'var(--op-text-on-accent)', border:'none', cursor:'pointer', font:"500 16px/1 'Inter',sans-serif" }}>
          Открыть чат с ассистентом →
        </button>
        <div style={{ marginTop:16, display:'flex', gap:28, flexWrap:'wrap', justifyContent:'center', font:"400 13px/1.4 'Inter',sans-serif", color:'var(--op-text-muted)' }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:7 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            +7 (978) 576-84-51
          </span>
          <span style={{ display:'inline-flex', alignItems:'center', gap:7 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg>
            radinuko@gmail.com
          </span>
          <span style={{ display:'inline-flex', alignItems:'center', gap:7 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            @aleg_rad
          </span>
        </div>
      </div>
    </section>
  );
}

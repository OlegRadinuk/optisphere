'use client';
import { useState } from 'react';
import SectionIntro from '@/components/hud/SectionIntro';

const FRAMES = [
  { pct:'0%',   label:'AI видит вашу задачу' },
  { pct:'25%',  label:'Строит структуру' },
  { pct:'50%',  label:'Подбирает стиль' },
  { pct:'75%',  label:'Ставит продажника' },
  { pct:'100%', label:'Вы получаете готовую систему' },
];

function FrameVisual({ idx }: { idx: number }) {
  const base: React.CSSProperties = { position:'absolute', inset:0, display:'flex', padding:48, gap:16 };
  if (idx === 0) return (
    <div style={{...base, alignItems:'center', justifyContent:'center'}}>
      <div style={{ width:'52%', aspectRatio:'4/3', borderRadius:14, border:'1px dashed var(--op-border-strong)', display:'flex', alignItems:'center', justifyContent:'center', font:"400 13px 'JetBrains Mono',monospace", color:'var(--op-text-muted)', letterSpacing:'.1em' }}>— пустой бриф —</div>
    </div>
  );
  if (idx === 1) return (
    <div style={{...base, flexDirection:'column', justifyContent:'center', alignItems:'center', gap:8}}>
      {[72,60,48,36].map((w,i)=>(
        <div key={i} style={{ width:`${w}%`, height:14, background:'var(--op-surface-overlay)', borderRadius:4, border:'1px solid var(--op-border)' }}/>
      ))}
    </div>
  );
  if (idx === 2) return (
    <div style={{...base, gap:12, alignItems:'stretch'}}>
      {[0,1,2,3].map(i=>(
        <div key={i} style={{ flex:1, borderRadius:10, border:'1px solid var(--op-border)', background: i===1?'linear-gradient(180deg,rgba(201,166,95,.1),transparent)':'var(--op-surface-overlay)', display:'flex', flexDirection:'column', gap:8, padding:16, justifyContent:'flex-end' }}>
          <div style={{ height:8, width:'70%', background:'var(--op-text-faint)', borderRadius:2 }}/>
          <div style={{ height:8, width:'40%', background:'var(--op-text-faint)', borderRadius:2 }}/>
        </div>
      ))}
    </div>
  );
  if (idx === 3) return (
    <div style={{...base, alignItems:'center', justifyContent:'center', flexDirection:'column', gap:20}}>
      <div style={{ display:'flex', gap:12 }}>
        {[0,1,2].map(i=>(
          <div key={i} style={{ width:120, height:80, borderRadius:10, border:'1px solid var(--op-border-accent)', background:'var(--op-accent-faint)' }}/>
        ))}
      </div>
      <div style={{ padding:'12px 20px', borderRadius:999, background:'var(--op-accent-subtle)', border:'1px solid var(--op-border-accent)', color:'var(--op-accent)', font:"500 13px 'Oxanium',sans-serif", display:'flex', gap:8, alignItems:'center' }}>
        <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--op-accent)', boxShadow:'0 0 0 4px rgba(201,166,95,.25)', display:'inline-block' }}/>
        Продажник подключён
      </div>
    </div>
  );
  return (
    <div style={{...base, alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16}}>
      <div style={{ width:'70%', height:10, background:'var(--op-surface-overlay)', borderRadius:999, overflow:'hidden' }}>
        <div style={{ width:'100%', height:'100%', background:'var(--op-accent)' }}/>
      </div>
      <span style={{ font:"500 28px 'Oxanium',sans-serif", color:'var(--op-text)', letterSpacing:'-0.02em' }}>Готовая система</span>
      <div style={{ display:'flex', gap:16, font:"400 12px 'JetBrains Mono',monospace", color:'var(--op-text-muted)', letterSpacing:'.1em' }}>
        <span>САЙТ</span><span>·</span><span>AI-ПРОДАЖНИК</span><span>·</span><span>SEO</span>
      </div>
    </div>
  );
}

export default function LiveDemoSection() {
  const [idx, setIdx] = useState(0);
  return (
    <section id="demo" style={{ padding:'96px 0', background:'var(--op-surface)', borderTop:'1px solid var(--op-border)', borderBottom:'1px solid var(--op-border)' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 48px' }}>
        <SectionIntro code="02" cmd="yura.trace()" title="Как AI-команда собирает вашу систему" sub="Реальный процесс внутри студии — в пяти кадрах. Покажем, как 25 AI-агентов передают друг другу задачи." crimson/>
        <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 320px', gap:48, alignItems:'stretch' }} className="demo-grid">
          <div style={{ position:'relative', aspectRatio:'16/9', background:'var(--op-surface-elevated)', borderRadius:16, border:'1px solid var(--op-border)', overflow:'hidden' }}>
            <FrameVisual idx={idx}/>
            <div style={{ position:'absolute', top:24, left:24, display:'flex', alignItems:'center', gap:12, padding:'10px 16px', borderRadius:10, background:'rgba(10,14,20,.65)', backdropFilter:'blur(10px)', border:'1px solid var(--op-border)' }}>
              <span style={{ font:"500 11px 'JetBrains Mono',monospace", color:'var(--op-accent)', letterSpacing:'.14em' }}>{FRAMES[idx].pct}</span>
              <span style={{ width:1, height:14, background:'var(--op-border-strong)', display:'inline-block' }}/>
              <span style={{ font:"500 14px/1 'Oxanium',sans-serif", color:'var(--op-text)', letterSpacing:'-0.01em' }}>{FRAMES[idx].label}</span>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, paddingLeft:16, borderLeft:'1px solid var(--op-border)' }}>
            {FRAMES.map((f,i) => {
              const active = i === idx;
              return (
                <button key={i} onClick={() => setIdx(i)} style={{ display:'flex', gap:16, alignItems:'flex-start', background:'transparent', border:0, padding:'14px 0', cursor:'pointer', textAlign:'left', color:'var(--op-text)' }}>
                  <span style={{ width:12, height:12, borderRadius:'50%', marginTop:4, flexShrink:0, background: active?'var(--op-accent)':'transparent', border: active?'1px solid var(--op-accent)':'1px solid var(--op-border-strong)', boxShadow: active?'0 0 0 4px var(--op-accent-faint)':'none', transition:'all 220ms' }}/>
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    <span style={{ font:"500 11px 'JetBrains Mono',monospace", color: active?'var(--op-accent)':'var(--op-text-muted)', letterSpacing:'.14em' }}>{f.pct}</span>
                    <span style={{ font:"500 15px/1.3 'Oxanium',sans-serif", color: active?'var(--op-text)':'var(--op-text-secondary)', letterSpacing:'-0.01em' }}>{f.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`@media(max-width:900px){.demo-grid{grid-template-columns:1fr!important;}}`}</style>
    </section>
  );
}

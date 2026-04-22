'use client';
import { useState, useEffect } from 'react';

type CardKind = 'thinking' | 'ref' | 'stream' | 'offer' | 'ask';

interface Card {
  kind: CardKind;
  text?: string;
  title?: string;
  metric?: string;
  note?: string;
  price?: string;
  time?: string;
  boost?: string;
  q1?: string;
  q2?: string;
  q3?: string;
}

function StreamText({ text }: { text: string }) {
  const [shown, setShown] = useState('');
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [text]);
  return (
    <span>
      {shown}
      <span style={{
        display:'inline-block', width:6, height:14, marginLeft:2, marginBottom:-2,
        background:'var(--op-accent)',
        animation:'termblink 1s steps(1) infinite',
        opacity: shown.length < text.length ? 1 : 0,
      }}/>
    </span>
  );
}

export default function FloatCard({ card, index }: { card: Card; index: number }) {
  const style: React.CSSProperties = { animationDelay:`${index*120}ms` };

  if (card.kind === 'thinking') return (
    <div className="fcard-enter" style={{ ...style,
      display:'inline-flex', alignItems:'center', gap:8, padding:'7px 13px',
      background:'rgba(201,166,95,.08)', border:'1px solid rgba(201,166,95,.25)',
      clipPath:'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)',
      font:"500 10px/1 'JetBrains Mono',monospace", letterSpacing:'.14em',
      textTransform:'uppercase', color:'var(--op-accent)',
    }}>
      <span style={{ width:7, height:7, border:'1.5px solid var(--op-accent)', borderRightColor:'transparent', animation:'termspin 700ms linear infinite', display:'inline-block' }}/>
      {card.text}…
    </div>
  );

  if (card.kind === 'ref') return (
    <div className="fcard-enter" style={{ ...style,
      display:'flex', alignItems:'center', gap:14, padding:'14px 18px', maxWidth:480,
      background:'linear-gradient(135deg, rgba(111,136,168,.1), rgba(111,136,168,.02))',
      border:'1px solid rgba(111,136,168,.3)', backdropFilter:'blur(12px)',
      clipPath:'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
    }}>
      <div style={{
        width:40, height:40, background:'rgba(111,136,168,.15)',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
        clipPath:'polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6f88a8" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
        <span style={{ font:"500 9px/1 'JetBrains Mono',monospace", letterSpacing:'.16em', color:'#6f88a8', textTransform:'uppercase' }}>▸ Похожий кейс</span>
        <span style={{ font:"600 15px/1.2 'Oxanium',sans-serif", color:'var(--op-text)', letterSpacing:'-0.005em', textTransform:'uppercase' }}>{card.title}</span>
        <span style={{ font:"400 12px/1.3 'Inter',sans-serif", color:'var(--op-text-secondary)' }}>
          <b style={{ color:'var(--op-accent)', fontWeight:500 }}>{card.metric}</b> · {card.note}
        </span>
      </div>
    </div>
  );

  if (card.kind === 'stream') return (
    <div className="fcard-enter" style={{ ...style,
      maxWidth:540, font:"400 17px/1.55 'Inter',sans-serif", color:'var(--op-text)',
      borderLeft:'2px solid var(--op-accent)', paddingLeft:16,
    }}>
      <StreamText text={card.text!}/>
    </div>
  );

  if (card.kind === 'offer') return (
    <div className="fcard-enter" style={{ ...style,
      padding:'18px 20px', maxWidth:480,
      background:'linear-gradient(135deg, rgba(201,166,95,.14), rgba(201,166,95,.03))',
      border:'1px solid rgba(201,166,95,.45)', backdropFilter:'blur(12px)',
      boxShadow:'0 24px 50px -18px rgba(201,166,95,.2)',
      clipPath:'polygon(14px 0,100% 0,100% calc(100% - 14px),calc(100% - 14px) 100%,0 100%,0 14px)',
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:10 }}>
        <span style={{ font:"500 10px/1 'JetBrains Mono',monospace", color:'var(--op-accent)', letterSpacing:'.16em' }}>▸ РЕКОМЕНДАЦИЯ ЮРЫ</span>
        <span style={{ font:"700 24px/1 'Oxanium',sans-serif", color:'var(--op-text)', letterSpacing:'-0.02em', textTransform:'uppercase' }}>{card.price}</span>
      </div>
      <div style={{ font:"600 19px/1.25 'Oxanium',sans-serif", color:'var(--op-text)', letterSpacing:'-0.01em', marginBottom:12, textTransform:'uppercase' }}>{card.title}</div>
      <div style={{ display:'flex', gap:14, flexWrap:'wrap', font:"500 11px/1 'JetBrains Mono',monospace", color:'var(--op-text-secondary)', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:14 }}>
        <span>⏱ {card.time}</span><span>·</span><span style={{ color:'#6fa875' }}>▲ {card.boost}</span>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <button style={{ display:'inline-flex', alignItems:'center', gap:6, height:36, padding:'0 14px', borderRadius:8, background:'var(--op-accent)', color:'var(--op-text-on-accent)', border:'none', cursor:'pointer', font:"500 12px/1 'JetBrains Mono',monospace", letterSpacing:'.1em', textTransform:'uppercase', clipPath:'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)' }}>
          Забронировать →
        </button>
        <button style={{ display:'inline-flex', alignItems:'center', height:36, padding:'0 14px', borderRadius:8, background:'transparent', color:'var(--op-text-secondary)', border:'none', cursor:'pointer', font:"500 12px/1 'JetBrains Mono',monospace" }}>
          КП на почту
        </button>
      </div>
    </div>
  );

  if (card.kind === 'ask') return (
    <div className="fcard-enter" style={{ ...style,
      display:'flex', flexDirection:'column', gap:6, padding:'14px 16px', maxWidth:480,
      background:'rgba(18,22,30,.65)', border:'1px solid var(--op-border)', backdropFilter:'blur(10px)',
      clipPath:'polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)',
    }}>
      <span style={{ font:"500 9px/1 'JetBrains Mono',monospace", color:'var(--op-text-muted)', letterSpacing:'.16em', textTransform:'uppercase', marginBottom:6 }}>▸ Юра уточнит</span>
      {[card.q1, card.q2, card.q3].map((q, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:10, font:"400 13px/1.4 'Inter',sans-serif", color:'var(--op-text-secondary)' }}>
          <span style={{ width:20, height:20, background:'rgba(201,166,95,.12)', color:'var(--op-accent)', display:'flex', alignItems:'center', justifyContent:'center', font:"500 10px/1 'JetBrains Mono',monospace", flexShrink:0 }}>{i+1}</span>
          {q}
        </div>
      ))}
    </div>
  );

  return null;
}

export type { Card };

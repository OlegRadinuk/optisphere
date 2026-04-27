'use client';
import { useEffect, useState } from 'react';

export function HudStatusBar() {
  const [time, setTime] = useState('');
  const [latency, setLatency] = useState(42);

  useEffect(() => {
    const fmt = (d: Date) =>
      `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}:${String(d.getUTCSeconds()).padStart(2,'0')} UTC`;
    setTime(fmt(new Date()));
    const t = setInterval(() => {
      setTime(fmt(new Date()));
      setLatency(30 + Math.floor(Math.random() * 40));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <div style={{
        position: 'sticky', top: 0, zIndex: 70,
        background: 'rgba(7,9,13,0.92)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--op-border)',
        font: "500 11px/1 'JetBrains Mono', monospace",
        letterSpacing: '0.08em',
        color: 'var(--op-text-muted)',
      }}>
        <div style={{
          maxWidth: 1600, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center', padding: '9px 20px', gap: 24,
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textTransform: 'uppercase' }}>
            <span style={{ display:'inline-block', width:6, height:6, background:'var(--op-accent-2)', boxShadow:'0 0 8px var(--op-accent-2)', animation:'hudPulse 1.8s ease-in-out infinite' }}/>
            <span style={{ opacity: .65 }}>OPTI.KERNEL</span>
            <span style={{ color: 'var(--op-text-secondary)' }}>v4.2.1 · ONLINE</span>
          </div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:14, justifyContent:'center', textTransform:'uppercase' }} className="hud-status-center">
            <span style={{ opacity: .65 }}>SESSION</span>
            <span style={{ color:'var(--op-text-secondary)' }}>{time}</span>
            <span style={{ display:'inline-block', width:1, height:10, background:'var(--op-border-strong)', margin:'0 4px' }}/>
            <span style={{ opacity: .65 }}>LAT</span>
            <span style={{ color:'var(--op-text-secondary)' }}>{latency}ms</span>
            <span style={{ display:'inline-block', width:1, height:10, background:'var(--op-border-strong)', margin:'0 4px' }}/>
            <span style={{ opacity: .65 }}>AGENTS</span>
            <span style={{ color:'var(--op-text-secondary)' }}>25/25</span>
          </div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, justifyContent:'flex-end', textTransform:'uppercase' }}>
            <span style={{ opacity: .65 }}>RU-1 · MSK</span>
            <span style={{ display:'inline-block', width:6, height:6, background:'var(--op-accent)' }}/>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .hud-status-center { display: none !important; }
        }
      `}</style>
    </>
  );
}

export function HudCorners() {
  return (
    <>
      <div style={{ position:'fixed', inset:34, pointerEvents:'none', zIndex:40 }} aria-hidden className="hud-corners">
        {(['tl','tr','bl','br'] as const).map(c => (
          <span key={c} style={{
            position:'absolute',
            width:14, height:14,
            ...(c==='tl' ? { top:0, left:0, borderTop:'1px solid var(--op-border-strong)', borderLeft:'1px solid var(--op-border-strong)' } :
               c==='tr' ? { top:0, right:0, borderTop:'1px solid var(--op-border-strong)', borderRight:'1px solid var(--op-border-strong)' } :
               c==='bl' ? { bottom:0, left:0, borderBottom:'1px solid var(--op-border-strong)', borderLeft:'1px solid var(--op-border-strong)' } :
                          { bottom:0, right:0, borderBottom:'1px solid var(--op-border-strong)', borderRight:'1px solid var(--op-border-strong)' }),
          }}/>
        ))}
      </div>
      <style>{`
        @media (max-width: 900px) { .hud-corners { display: none !important; } }
      `}</style>
    </>
  );
}

const RAIL_SECTIONS = [
  { id:'hero',    code:'01', label:'BOOT' },
  { id:'demo',    code:'02', label:'DEMO' },
  { id:'paths',   code:'03', label:'PATHS' },
  { id:'cases',   code:'04', label:'CASES' },
  { id:'proof',   code:'05', label:'PROOF' },
  { id:'team',    code:'06', label:'TEAM' },
  { id:'pricing', code:'07', label:'COST' },
  { id:'faq',     code:'08', label:'FAQ' },
  { id:'cta',     code:'09', label:'CONTACT' },
];

export function HudRail() {
  const [active, setActive] = useState('hero');

  useEffect(() => {
    const onScroll = () => {
      let found = 'hero';
      const y = window.scrollY + window.innerHeight * 0.35;
      for (const s of RAIL_SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.offsetTop <= y) found = s.id;
      }
      setActive(found);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div style={{
        position:'fixed', left:18, top:'50%', transform:'translateY(-50%)',
        zIndex:50, display:'flex', flexDirection:'column', gap:14,
        pointerEvents:'auto',
      }} aria-hidden className="hud-rail">
        <div style={{
          position:'absolute', left:12, top:-20, bottom:-20, width:1,
          background:'linear-gradient(180deg, transparent, var(--op-border-strong) 20%, var(--op-border-strong) 80%, transparent)',
          zIndex:0,
        }}/>
        {RAIL_SECTIONS.map(s => {
          const isActive = active === s.id;
          return (
            <a key={s.id} href={`#${s.id}`} style={{
              position:'relative', zIndex:1,
              display:'inline-flex', alignItems:'center', gap:10,
              textDecoration:'none', cursor:'pointer', padding:'4px 0',
              font: "500 10px/1 'JetBrains Mono', monospace",
              letterSpacing:'0.14em',
              color: isActive ? 'var(--op-text)' : 'var(--op-text-muted)',
              opacity: isActive ? 1 : 0.55,
              transition:'opacity .2s, color .2s',
            }}>
              <span style={{ marginLeft:0, color:'inherit', width:18 }}>{s.code}</span>
              <span style={{ color:'inherit', letterSpacing:'0.16em' }}>{s.label}</span>
              <span style={{
                position:'absolute', left:9, width:7, height:7,
                background: isActive ? 'var(--op-accent)' : 'var(--op-text-faint)',
                boxShadow: isActive ? '0 0 8px var(--op-accent-ring)' : 'none',
                transform: isActive ? 'scale(1.3)' : 'scale(1)',
                transition:'all .2s',
              }}/>
            </a>
          );
        })}
      </div>
      <style>{`
        @media (max-width: 1100px) { .hud-rail { display: none !important; } }
      `}</style>
    </>
  );
}

const BOOT_MESSAGES = [
  'OPTI.KERNEL INITIALIZING...',
  'AGENT READY · WAITING FOR INPUT',
  'ВЫ ТЕРЯЕТЕ ЗАЯВКИ ПОКА ВАС НЕТ ОНЛАЙН — ОПТИ НЕТ',
  'КОНКУРЕНТ В ТОПЕ? ЗНАЮ ПОЧЕМУ — СПРОСИ ОПТИ',
  'САЙТ БЕЗ AI = МЕНЕДЖЕР КОТОРЫЙ СПИТ 16 ЧАСОВ В СУТКИ',
];

const LOG_MESSAGES = [
  '> opti.reason(niche="dental") → 6 options generated · 412ms',
  '> agents[sales].handoff(lead#4821) → qualified · $1.2M pipeline',
  '> seo.crawl(optisphere.ru) → 347 pages indexed · ok',
  '> copy.draft(tone="premium") → 3 variants · 890ms',
  '> design.render(brief#0912) → ready for review',
  '> ads.optimize(campaign#114) → CTR +34% · stable',
];

const ALL_MESSAGES = [...BOOT_MESSAGES, ...LOG_MESSAGES];

export function HudLogTicker() {
  const [idx, setIdx] = useState(0);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    // Boot sequence: cycle through BOOT_MESSAGES every 2.5s
    if (idx < BOOT_MESSAGES.length - 1) {
      const t = setTimeout(() => setIdx(i => i + 1), 2500);
      return () => clearTimeout(t);
    }
    // After boot sequence completes, switch to cycling ALL_MESSAGES
    if (!booted) {
      const t = setTimeout(() => {
        setBooted(true);
        setIdx(0);
      }, 2500);
      return () => clearTimeout(t);
    }
    // Regular cycle through all messages
    const t = setInterval(() => setIdx(i => (i + 1) % ALL_MESSAGES.length), 3200);
    return () => clearInterval(t);
  }, [idx, booted]);

  const displayText = booted ? ALL_MESSAGES[idx] : BOOT_MESSAGES[idx];

  return (
    <>
      <div style={{
        position:'fixed', left:'50%', bottom:14, transform:'translateX(-50%)',
        zIndex:45, display:'inline-flex', alignItems:'center', gap:10,
        padding:'8px 16px',
        background:'rgba(14,18,24,0.92)',
        border:'1px solid var(--op-border)',
        backdropFilter:'blur(12px)',
        font: "500 10.5px/1 'JetBrains Mono', monospace",
        letterSpacing:'0.06em', color:'var(--op-text-muted)',
        maxWidth:'calc(100vw - 40px)',
        clipPath:'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
      }} className="hud-log-ticker">
        <span style={{ display:'inline-block', width:6, height:6, background:'var(--op-accent-2)', boxShadow:'0 0 8px var(--op-accent-2)', animation:'hudPulse 1.8s ease-in-out infinite' }}/>
        <span style={{ color:'var(--op-accent-2)', textTransform:'uppercase', letterSpacing:'0.14em' }}>SYS.LOG</span>
        <span style={{ color:'var(--op-text-secondary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'60vw' }}>{displayText}</span>
      </div>
      <style>{`
        @media (max-width: 640px) { .hud-log-ticker { display: none !important; } }
      `}</style>
    </>
  );
}

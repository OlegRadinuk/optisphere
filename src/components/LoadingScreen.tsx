'use client';
import { useState, useEffect } from 'react';

const TERMINAL_LINES = [
  '0.000 ▸ MOUNT  /opt/kernel/agents.so',
  '0.213 ▸ INIT   neural-core@4.2.1',
  '0.426 ▸ AUTH   handshake OK · 384-bit',
  '0.639 ▸ BIND   ws://opti.kernel:9090',
  '0.852 ▸ BOOT   agent[01..25] online',
  '1.065 ▸ SYNC   knowledge-graph 81.2GB',
  '1.278 ▸ READY  awaiting input',
];

const SEGMENTS = 20;

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [gone, setGone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [revealedLines, setRevealedLines] = useState(0);
  const [agentCount, setAgentCount] = useState(0);
  const [memoryGb, setMemoryGb] = useState(0.0);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    // Skip on subsequent navigations within same session
    if (typeof window !== 'undefined' && sessionStorage.getItem('opti-booted')) {
      setGone(true);
      return;
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('opti-booted', '1');
    }

    const t1 = setTimeout(() => setVisible(false), 2200);
    const t2 = setTimeout(() => setGone(true), 2600);

    // Animate progress 0 → 100 over 2s
    const startTime = Date.now();
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / 2000) * 100));
      setProgress(pct);
      setAgentCount(Math.min(25, Math.round((elapsed / 2000) * 25)));
      setMemoryGb(parseFloat(Math.min(81.2, (elapsed / 2000) * 81.2).toFixed(1)));
      if (pct >= 100) clearInterval(progressTimer);
    }, 16);

    // Reveal terminal lines every ~200ms
    let lineIdx = 0;
    const lineTimer = setInterval(() => {
      lineIdx += 1;
      setRevealedLines(lineIdx);
      if (lineIdx >= TERMINAL_LINES.length) clearInterval(lineTimer);
    }, 200);

    // Blinking cursor
    const blinkTimer = setInterval(() => setBlink(b => !b), 530);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(progressTimer);
      clearInterval(lineTimer);
      clearInterval(blinkTimer);
    };
  }, []);

  if (gone) return null;

  const filledSegments = Math.round((progress / 100) * SEGMENTS);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      background: '#050505',
      display: 'flex',
      flexDirection: 'column',
      opacity: visible ? 1 : 0,
      transition: 'opacity 400ms ease',
      pointerEvents: visible ? 'auto' : 'none',
      overflow: 'hidden',
    }}>
      {/* Corner ticks */}
      <span style={{ position:'absolute', top:16, left:16, width:10, height:10, borderTop:'1px solid #e82020', borderLeft:'1px solid #e82020' }}/>
      <span style={{ position:'absolute', top:16, right:16, width:10, height:10, borderTop:'1px solid #e82020', borderRight:'1px solid #e82020' }}/>
      <span style={{ position:'absolute', bottom:16, left:16, width:10, height:10, borderBottom:'1px solid #e82020', borderLeft:'1px solid #e82020' }}/>
      <span style={{ position:'absolute', bottom:16, right:16, width:10, height:10, borderBottom:'1px solid #e82020', borderRight:'1px solid #e82020' }}/>

      {/* Top HUD bar */}
      <div style={{
        height: 32,
        borderBottom: '1px solid #141414',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 16,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        letterSpacing: '.18em',
        flexShrink: 0,
      }}>
        {/* Left: brand */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ width:6, height:6, background:'#e82020', display:'inline-block', animation:'hudPulse 1.4s ease-in-out infinite' }}/>
          <span style={{ color:'#f5f5f5' }}>OPTI.KERNEL</span>
          <span style={{ color:'#3a3a3a' }}>·</span>
          <span style={{ color:'#555' }}>v4.2.1</span>
          <span style={{ color:'#3a3a3a' }}>·</span>
          <span style={{ color:'#e82020' }}>ONLINE</span>
        </div>
        {/* Center */}
        <div style={{ flex:1, display:'flex', justifyContent:'center', gap:20, color:'#444' }}>
          <span>SESSION<span style={{ color:'#666', marginLeft:6 }}>OP-{String(Date.now()).slice(-6)}</span></span>
          <span>LAT<span style={{ color:'#666', marginLeft:6 }}>12ms</span></span>
          <span>AGENTS<span style={{ color:'#e82020', marginLeft:6 }}>{agentCount}/25</span></span>
        </div>
        {/* Right */}
        <div style={{ color:'#444' }}>
          <span style={{ color:'#666' }}>RU</span>
          <span style={{ margin:'0 6px' }}>·</span>
          <span style={{ color:'#666' }}>MSK</span>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
        padding: '24px 20px',
      }}>
        {/* Big progress number */}
        <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
          <span style={{
            fontFamily: "'Oxanium', sans-serif",
            fontWeight: 800,
            fontSize: 140,
            lineHeight: 1,
            color: '#e82020',
          }}>{progress}</span>
          <span style={{
            fontFamily: "'Oxanium', sans-serif",
            fontWeight: 800,
            fontSize: 60,
            color: '#3a3a3a',
          }}>%</span>
        </div>

        {/* Terminal box */}
        <div style={{
          width: 480,
          maxWidth: '90vw',
          background: '#0a0a0a',
          border: '1px solid #1a1a1a',
          padding: '16px 20px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          lineHeight: 1.85,
        }}>
          {TERMINAL_LINES.map((line, i) => {
            if (i >= revealedLines) return null;
            const isLast = i === TERMINAL_LINES.length - 1 && revealedLines >= TERMINAL_LINES.length;
            const isCurrent = i === revealedLines - 1 && !isLast;
            const color = isLast ? '#ff2a2a' : isCurrent ? '#f5f5f5' : '#5a5a5a';
            return (
              <div key={i} style={{ color }}>
                {line}
                {isLast && (
                  <span style={{ opacity: blink ? 1 : 0, transition:'opacity 100ms', marginLeft:2 }}>█</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        height: 70,
        borderTop: '1px solid #141414',
        padding: '12px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        flexShrink: 0,
      }}>
        {/* Segmented progress bar */}
        <div style={{ position:'relative', height:8 }}>
          {/* Background track */}
          <div style={{
            position:'absolute', inset:0,
            background:'#0e0e0e',
            border:'1px solid #1a1a1a',
          }}/>
          {/* Red fill */}
          <div style={{
            position:'absolute', top:0, left:0, bottom:0,
            width:`${progress}%`,
            background:'#e82020',
            boxShadow:'0 0 12px #e82020',
            transition:'width 40ms linear',
          }}/>
          {/* Segment ticks */}
          {Array.from({ length: SEGMENTS - 1 }).map((_, i) => (
            <div key={i} style={{
              position:'absolute',
              top:0,
              bottom:0,
              left:`${((i + 1) / SEGMENTS) * 100}%`,
              width:1,
              background:'#050505',
              zIndex:2,
            }}/>
          ))}
          {/* Tick marks on top */}
          <div style={{
            position:'absolute',
            top:-4,
            left:0,
            right:0,
            display:'flex',
            justifyContent:'space-between',
          }}>
            {Array.from({ length: SEGMENTS + 1 }).map((_, i) => (
              <div key={i} style={{ width:1, height:4, background: i <= filledSegments ? '#e82020' : '#1e1e1e' }}/>
            ))}
          </div>
        </div>
        {/* Log line */}
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          color: '#444',
          letterSpacing: '.12em',
          display: 'flex',
          gap: 16,
          alignItems: 'center',
        }}>
          <span>▸ HANDSHAKE OK</span>
          <span>▸ AGENTS BOOTING ({agentCount}/25)</span>
          <span>▸ MEMORY {memoryGb} GB</span>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ width:5, height:5, background:'#e82020', display:'inline-block', borderRadius:'50%', animation:'hudPulse 1.4s ease-in-out infinite' }}/>
            LIVE
          </span>
        </div>
      </div>

      <style>{`
        @keyframes hudPulse { 0%,100% { opacity: 1; } 50% { opacity: .3; } }
      `}</style>
    </div>
  );
}

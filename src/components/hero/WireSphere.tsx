'use client';

type SphereState = 'idle' | 'thinking' | 'speaking';

export default function WireSphere({ state }: { state: SphereState }) {
  const size = 340;
  const c = size / 2;
  const rings = [
    { rx: 150, ry: 52, tilt: -18, speed: 24, phase: 0,   op: 0.9 },
    { rx: 150, ry: 52, tilt:  62, speed: 36, phase: 120, op: 0.7 },
    { rx: 150, ry: 52, tilt: 152, speed: 48, phase: 240, op: 0.5 },
  ];
  const nodeCount = 6;
  const pulseDur = state === 'thinking' ? '1s' : state === 'speaking' ? '1.4s' : '3.2s';

  return (
    <div className="wire-sphere-wrap" style={{ position:'relative', width:'100%', maxWidth:size, height:'auto', aspectRatio:'1/1', flexShrink:0 }}>
      <style>{`
        @keyframes wsRot { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .wire-sphere-wrap { max-width: 220px !important; margin: 0 auto; }
        }
        @keyframes wsPulse { 0% { transform: scale(.6); opacity:.9; } 100% { transform: scale(2.4); opacity:0; } }
        @keyframes wsCenterIdle  { 0%,100% { opacity:.7; } 50% { opacity:1; } }
        @keyframes wsCenterThink { 0%,100% { opacity:.6; transform:scale(1); } 50% { opacity:1; transform:scale(1.6); } }
        @keyframes wsCenterSpeak { 0%,100% { opacity:.85; transform:scale(1); } 50% { opacity:1; transform:scale(1.3); } }
        @keyframes wsBar { 0% { transform: scaleY(.3); } 100% { transform: scaleY(1.3); } }
      `}</style>
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} style={{ display:'block' }}>
        <defs>
          <linearGradient id="ringStroke" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%"  stopColor="rgba(232,32,32,0)"/>
            <stop offset="30%" stopColor="rgba(232,32,32,.4)"/>
            <stop offset="50%" stopColor="rgba(232,32,32,.9)"/>
            <stop offset="70%" stopColor="rgba(232,32,32,.4)"/>
            <stop offset="100%" stopColor="rgba(232,32,32,0)"/>
          </linearGradient>
          <radialGradient id="coreGlow" cx="50%" cy="50%">
            <stop offset="0%"  stopColor="rgba(232,32,32,.35)"/>
            <stop offset="40%" stopColor="rgba(232,32,32,.08)"/>
            <stop offset="100%" stopColor="transparent"/>
          </radialGradient>
        </defs>

        <circle cx={c} cy={c} r="90" fill="url(#coreGlow)"/>
        <circle cx={c} cy={c} r="155" fill="none" stroke="rgba(232,32,32,.14)" strokeWidth="0.75" strokeDasharray="2 6"/>
        <circle cx={c} cy={c} r="110" fill="none" stroke="rgba(255,255,255,.04)" strokeWidth="0.75"/>

        {[0,90,180,270].map(a => {
          const r1 = 158, r2 = 168;
          const rad = (a * Math.PI) / 180;
          return (
            <line key={a}
              x1={c + Math.cos(rad)*r1} y1={c + Math.sin(rad)*r1}
              x2={c + Math.cos(rad)*r2} y2={c + Math.sin(rad)*r2}
              stroke="rgba(232,32,32,.4)" strokeWidth="1"
            />
          );
        })}

        {rings.map((r, i) => (
          <g key={i} style={{ transformOrigin:`${c}px ${c}px`, transform:`rotate(${r.tilt}deg)`, opacity:r.op }}>
            <g style={{
              transformOrigin:`${c}px ${c}px`,
              animation:`wsRot ${r.speed}s linear infinite`,
              animationPlayState: state === 'idle' ? 'paused' : 'running'
            }}>
              <ellipse cx={c} cy={c} rx={r.rx} ry={r.ry} fill="none" stroke="url(#ringStroke)" strokeWidth="1"/>
              {Array.from({length: nodeCount}).map((_, k) => {
                const theta = (k / nodeCount) * Math.PI * 2 + (r.phase * Math.PI / 180);
                const nx = c + Math.cos(theta) * r.rx;
                const ny = c + Math.sin(theta) * r.ry;
                const isHot = k === 0;
                return (
                  <g key={k}>
                    <circle cx={nx} cy={ny} r={isHot ? 3 : 1.6}
                      fill={isHot ? 'var(--op-accent)' : 'rgba(255,255,255,.6)'}
                      style={{ filter: isHot ? 'drop-shadow(0 0 6px rgba(232,32,32,.9))' : 'none' }}
                    />
                    {isHot && (
                      <circle cx={nx} cy={ny} r="6" fill="none" stroke="var(--op-accent)" strokeWidth="0.8" opacity="0.6"
                        style={{
                          transformOrigin:`${nx}px ${ny}px`,
                          animation:`wsPulse ${pulseDur} ease-out infinite`
                        }}
                      />
                    )}
                  </g>
                );
              })}
            </g>
          </g>
        ))}

        <line x1={c} y1={c-35} x2={c} y2={c+35} stroke="rgba(232,32,32,.5)" strokeWidth="0.75"/>
        <line x1={c-35} y1={c} x2={c+35} y2={c} stroke="rgba(232,32,32,.5)" strokeWidth="0.75"/>
        <circle cx={c} cy={c} r="5" fill="#060606" stroke="var(--op-accent)" strokeWidth="1.5"/>
        <circle cx={c} cy={c} r="2" fill="var(--op-accent)"
          style={{
            animation: state === 'speaking'
              ? 'wsCenterSpeak 0.9s ease-in-out infinite'
              : state === 'thinking'
              ? 'wsCenterThink 1.2s ease-in-out infinite'
              : 'wsCenterIdle 3.2s ease-in-out infinite'
          }}
        />

        {state === 'speaking' && (
          <g transform={`translate(${c-48},${c+72})`}>
            {Array.from({length:16}).map((_, i) => (
              <rect key={i} x={i*6} y={-6} width="2" height="12"
                fill="var(--op-accent)" rx="1"
                style={{
                  transformOrigin:`${i*6+1}px 0`,
                  animation:`wsBar 0.${(i%5)+4}s ease-in-out ${i*.05}s infinite alternate`,
                  opacity: 0.7
                }}
              />
            ))}
          </g>
        )}

        <g style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:9, fill:'rgba(255,255,255,.5)', letterSpacing:'0.12em' }}>
          <text x="10" y="18">OPTI · v3.1</text>
          <text x={size-86} y="18">42°N · OPT</text>
          <text x="10" y={size-10}>MODE · {state==='thinking' ? 'THINK' : state==='speaking' ? 'SPEAK' : 'READY'}</text>
          <text x={size-56} y={size-10}>▲ {state==='idle' ? 'IDLE' : 'LIVE'}</text>
        </g>
      </svg>
    </div>
  );
}

interface SectionIntroProps {
  code: string;
  cmd: string;
  title: string;
  sub?: string;
  align?: 'left' | 'center';
  crimson?: boolean;
}

export default function SectionIntro({ code, cmd, title, sub, align = 'left', crimson = false }: SectionIntroProps) {
  const isCenter = align === 'center';
  return (
    <header style={{
      display:'flex', flexDirection:'column', gap:16,
      marginBottom:56, maxWidth:820,
      ...(isCenter ? { marginLeft:'auto', marginRight:'auto', textAlign:'center', alignItems:'center' } : {}),
    }}>
      <div style={{ display:'inline-flex', alignItems:'center', gap:14, font:"500 11px/1 'JetBrains Mono',monospace", letterSpacing:'0.14em', textTransform:'uppercase' }}>
        <span style={{ color:'var(--op-text-muted)', padding:'6px 10px', border:'1px solid var(--op-border-strong)', clipPath:'polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)' }}>
          SECTION.{code}
        </span>
        <span style={{ display:'inline-block', width:40, height:1, background:'var(--op-border-strong)' }}/>
        <span style={{ display:'inline-flex', alignItems:'center', gap:4, color: crimson ? 'var(--op-accent-2)' : 'var(--op-accent)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.1em', textTransform:'lowercase' }}>
          $ {cmd}
          <span style={{ display:'inline-block', width:7, height:14, background:'currentColor', marginLeft:2, animation:'hudCaret 1s steps(2,end) infinite' }}/>
        </span>
      </div>
      <h2 style={{ font:"600 clamp(34px,5vw,60px)/1.02 'Oxanium',sans-serif", letterSpacing:'-0.025em', color:'var(--op-text)', margin:0, textTransform:'uppercase' }}>
        {title}
      </h2>
      {sub && <p style={{ font:"400 17px/1.55 'Inter',sans-serif", color:'var(--op-text-secondary)', margin:0, maxWidth:620 }}>{sub}</p>}
    </header>
  );
}

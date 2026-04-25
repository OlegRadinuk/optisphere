'use client';
import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import SectionIntro from '@/components/hud/SectionIntro';

const DEPT_COLORS: Record<string, string> = {
  Planning:  'rgba(79,142,255,.7)',
  Marketing: 'rgba(201,166,95,.8)',
  Dev:       'rgba(79,142,255,.6)',
  Quality:   'rgba(62,207,160,.7)',
  Risk:      'rgba(232,32,32,.6)',
  Infra:     'rgba(150,120,255,.6)',
  Oversight: 'rgba(255,160,50,.6)',
  Meta:      'rgba(120,136,160,.6)',
};

const DEPTS_AGENTS: Record<string, string[]> = {
  Planning:  ['planner','architect','devil-advocate'],
  Marketing: ['conversion','copywriter','seo','analytics','ads'],
  Dev:       ['designer','frontend','backend','db-engineer'],
  Quality:   ['reviewer','unit-test','e2e-test','perf','a11y'],
  Risk:      ['security','compliance','deps-audit'],
  Infra:     ['devops'],
  Oversight: ['controller','studio-hr'],
  Meta:      ['memory','docs'],
};

function deptOf(name: string): string | null {
  for (const [d, agents] of Object.entries(DEPTS_AGENTS)) {
    if (agents.includes(name)) return d;
  }
  return null;
}

const FLAT_AGENTS = Object.values(DEPTS_AGENTS).flat();

const DEPT_ICONS: Record<string, React.ReactNode> = {
  Planning: (
    <path d="M8 2 L14 6 L14 10 L8 14 L2 10 L2 6 Z" stroke="currentColor" strokeWidth="1.3" fill="none"/>
  ),
  Marketing: (
    <path d="M4 12 Q4 4 8 4 Q12 4 12 8 Q12 12 8 12 Q5 12 4 12" stroke="currentColor" strokeWidth="1.3" fill="none"/>
  ),
  Dev: (
    <>
      <path d="M5 4 L3 8 L5 12" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <path d="M11 4 L13 8 L11 12" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <path d="M9 3 L7 13" stroke="currentColor" strokeWidth="1.3" fill="none"/>
    </>
  ),
  Quality: (
    <path d="M3 8 L6.5 11.5 L13 5" stroke="currentColor" strokeWidth="1.3" fill="none"/>
  ),
  Risk: (
    <>
      <path d="M8 3 L14 13 L2 13 Z" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <line x1="8" y1="7" x2="8" y2="10" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="8" cy="11.5" r="0.7" fill="currentColor"/>
    </>
  ),
  Infra: (
    <path d="M2 10 L5 5 L8 8 L11 4 L14 7" stroke="currentColor" strokeWidth="1.3" fill="none"/>
  ),
  Oversight: (
    <>
      <ellipse cx="8" cy="8" rx="6" ry="4" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
    </>
  ),
  Meta: (
    <>
      <line x1="3" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.3"/>
      <line x1="3" y1="8" x2="10" y2="8" stroke="currentColor" strokeWidth="1.3"/>
      <line x1="3" y1="12" x2="7" y2="12" stroke="currentColor" strokeWidth="1.3"/>
    </>
  ),
};

function AgentTile({ agentName, idx, agentDesc }: { agentName: string; idx: number; agentDesc: string }) {
  const [hover, setHover] = useState(false);
  const dept = deptOf(agentName);
  const deptColor = dept ? DEPT_COLORS[dept] : 'transparent';
  const deptIcon = DEPT_ICONS[dept ?? 'Meta'];
  const pulseDelay = (idx * 0.11) % 1.5;
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        aspectRatio: '1/1', position: 'relative', overflow: 'visible',
        background: hover ? 'var(--op-accent-subtle)' : 'var(--op-surface-elevated)',
        border: hover ? '1px solid var(--op-border-accent)' : '1px solid var(--op-border)',
        borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 6,
        alignItems: 'center', justifyContent: 'center',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hover ? '0 8px 24px rgba(201,166,95,.08)' : 'none',
        transition: 'all 200ms', cursor: 'default', padding: 8,
      }}
    >
      {/* dept colour strip */}
      <span aria-hidden style={{ position: 'absolute', top: 0, left: 8, right: 8, height: 2, borderRadius: 2, background: deptColor }}/>

      {/* pulse dot */}
      <span
        aria-hidden
        style={{
          position: 'absolute', top: 8, right: 8,
          width: 6, height: 6, borderRadius: '50%',
          background: '#3ECFA0',
          animation: `tilePulse 2s ease-in-out ${pulseDelay}s infinite`,
        }}
      />

      {/* dept icon */}
      <span style={{ color: hover ? 'var(--op-accent)' : 'var(--op-text-muted)', transition: 'color 200ms' }}>
        <svg width="16" height="16" viewBox="0 0 16 16">{deptIcon}</svg>
      </span>

      {/* agent name */}
      <span style={{
        font: "500 10px/1.1 'JetBrains Mono',monospace",
        color: hover ? 'var(--op-accent)' : 'var(--op-text-secondary)',
        letterSpacing: '.04em', textAlign: 'center',
      }}>
        {agentName}
      </span>

      {/* hover tooltip */}
      {hover && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--op-surface-overlay)',
          border: '1px solid var(--op-border-strong)',
          borderRadius: 8, padding: '8px 12px', whiteSpace: 'nowrap', zIndex: 5,
          font: "400 12px/1.3 'Inter',sans-serif", color: 'var(--op-text)',
          boxShadow: '0 8px 24px rgba(0,0,0,.4)',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <span style={{
            display: 'inline-block', padding: '2px 6px', borderRadius: 4,
            background: deptColor, color: '#fff',
            font: "600 9px/1 'JetBrains Mono'", letterSpacing: '.1em', marginBottom: 4,
          }}>
            {dept?.toUpperCase()}
          </span>
          {agentDesc}
          <span style={{
            color: '#3ECFA0',
            font: "500 10px/1 'JetBrains Mono'",
            letterSpacing: '.08em', marginTop: 4,
          }}>
            ● ONLINE
          </span>
        </div>
      )}
    </div>
  );
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, scale: 0.85, rotate: -2 },
  visible: { opacity: 1, scale: 1, rotate: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 22 } },
};

export default function TeamSection() {
  const t = useTranslations('team');
  const headingRef = useRef(null);
  const gridRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, margin: '0px' });
  const gridInView = useInView(gridRef, { once: true, margin: '0px' });

  const STATS: [string, string][] = [
    [t('stat_agents_value'), t('stat_agents_label')],
    [t('stat_speed_value'),  t('stat_speed_label')],
    [t('stat_depts_value'),  t('stat_depts_label')],
  ];

  return (
    <section id="team" style={{ padding: '96px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }} className="section-container">
        <div
          style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,3fr)', gap: 64, alignItems: 'flex-start' }}
          className="team-layout"
        >
          <motion.div
            ref={headingRef}
            initial={{ opacity: 0, y: 28 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, font: "500 11px/1 'JetBrains Mono',monospace", letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>
              <span style={{ color: 'var(--op-text-muted)', padding: '6px 10px', border: '1px solid var(--op-border-strong)', clipPath: 'polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)' }}>SECTION.06</span>
              <span style={{ display: 'inline-block', width: 40, height: 1, background: 'var(--op-border-strong)' }}/>
              <span style={{ color: 'var(--op-accent)', fontFamily: "'JetBrains Mono',monospace" }}>$ team.roster()</span>
            </div>
            <h2 style={{ font: "600 clamp(32px,4.5vw,56px)/1.02 'Oxanium',sans-serif", letterSpacing: '-0.025em', color: 'var(--op-text)', margin: 0, textTransform: 'uppercase' }}>
              {t('title_line1')}<br/>{t('title_line2')} <span style={{ color: 'var(--op-accent-2)' }}>{t('title_highlight')}</span>
            </h2>
            <p style={{ font: "400 16px/1.6 'Inter',sans-serif", color: 'var(--op-text-secondary)', margin: 0 }}>
              {t('desc1')}
            </p>
            <p style={{ font: "400 16px/1.6 'Inter',sans-serif", color: 'var(--op-text-secondary)', margin: 0 }}>
              {t('desc2_prefix')}<span style={{ color: 'var(--op-text)' }}>{t('desc2_highlight')}</span>{t('desc2_suffix')}
            </p>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 8 }}>
              {STATS.map(([a, b], i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ font: "500 28px/1 'Oxanium',sans-serif", color: i === 1 ? 'var(--op-accent-2)' : 'var(--op-accent)', letterSpacing: '-0.02em' }}>{a}</span>
                  <span style={{ font: "400 12px/1.3 'Inter',sans-serif", color: 'var(--op-text-muted)' }}>{b}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <motion.div
              ref={gridRef}
              variants={containerVariants}
              initial="hidden"
              animate={gridInView ? 'visible' : 'hidden'}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}
              className="team-grid"
            >
              {FLAT_AGENTS.map((agentName, i) => (
                <motion.div key={agentName} variants={itemVariants}>
                  <AgentTile
                    agentName={agentName}
                    idx={i}
                    agentDesc={t(`agent_descriptions.${agentName}`)}
                  />
                </motion.div>
              ))}
            </motion.div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
              {Object.entries(DEPT_COLORS).map(([name, color]) => (
                <span key={name} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: "400 11px 'JetBrains Mono',monospace", color: 'var(--op-text-muted)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                  <span style={{ width: 10, height: 2, borderRadius: 2, background: color, display: 'inline-block' }}/>
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes tilePulse {
          0%,100% { opacity:1; box-shadow:0 0 0 0 rgba(62,207,160,.4); }
          50%      { opacity:.7; box-shadow:0 0 0 4px rgba(62,207,160,0); }
        }
        @media(max-width:900px){.team-layout{grid-template-columns:1fr!important;gap:48px!important;}}
        @media(max-width:900px){.team-grid{grid-template-columns:repeat(4,1fr)!important;}}
        @media(max-width:640px){.team-grid{grid-template-columns:repeat(3,1fr)!important;}}
      `}</style>
    </section>
  );
}

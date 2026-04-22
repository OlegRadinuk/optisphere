'use client';
import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionIntro from '@/components/hud/SectionIntro';

const DEPTS: Record<string, { color: string; agents: [string, string][] }> = {
  Planning:  { color:'rgba(201,166,95,.65)',  agents:[['planner','Разбивает задачу на этапы'],['architect','Проектирует структуру'],['devil-advocate','Ищет слабые места']] },
  Marketing: { color:'rgba(201,166,95,.55)', agents:[['conversion','Настраивает CTA и воронку'],['copywriter','Пишет тексты под сегмент'],['seo','Собирает семантику'],['analytics','Метрика, события'],['ads','Яндекс.Директ, таргет']] },
  Dev:       { color:'rgba(201,166,95,.45)', agents:[['designer','Макеты и визуал'],['frontend','Вёрстка, анимация'],['backend','API, CMS, интеграции'],['db-engineer','Схема, миграции']] },
  Quality:   { color:'rgba(201,166,95,.40)', agents:[['reviewer','Ревью кода'],['unit-test','Юнит-покрытие'],['e2e-test','Сценарии в браузере'],['perf','Lighthouse, CWV'],['a11y','Доступность AA']] },
  Risk:      { color:'rgba(201,166,95,.35)', agents:[['security','Аудит уязвимостей'],['compliance','152-ФЗ, согласия'],['deps-audit','Проверка зависимостей']] },
  Infra:     { color:'rgba(201,166,95,.30)', agents:[['devops','Хостинг, мониторинг']] },
  Oversight: { color:'rgba(201,166,95,.25)', agents:[['controller','Итоговый контроль'],['studio-hr','Ротация агентов']] },
  Meta:      { color:'rgba(201,166,95,.20)', agents:[['memory','Долговременная память'],['docs','Документация']] },
};

function deptOf(name: string) {
  for (const [d, def] of Object.entries(DEPTS)) {
    if (def.agents.some(a => a[0] === name)) return { name: d, ...def };
  }
  return null;
}

const FLAT_AGENTS = Object.values(DEPTS).flatMap(d => d.agents);

const GEO_PATHS = [
  <circle key="c" cx="8" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="1.3"/>,
  <rect key="r" x="4" y="4" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.3"/>,
  <path key="t" d="M3 13 L8 3 L13 13 Z" fill="none" stroke="currentColor" strokeWidth="1.3"/>,
  <path key="d" d="M3 8 L8 3 L13 8 L8 13 Z" fill="none" stroke="currentColor" strokeWidth="1.3"/>,
  <><line key="l1" x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.3"/><line key="l2" x1="8" y1="3" x2="8" y2="13" stroke="currentColor" strokeWidth="1.3"/></>,
  <><circle key="co" cx="8" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="1.3"/><circle key="ci" cx="8" cy="8" r="1.5" fill="currentColor"/></>,
];

function AgentTile({ a, i }: { a: [string, string]; i: number }) {
  const [hover, setHover] = useState(false);
  const dept = deptOf(a[0]);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      aspectRatio:'1/1', position:'relative',
      background: hover ? 'var(--op-accent-subtle)' : 'var(--op-surface-elevated)',
      border: hover ? '1px solid var(--op-border-accent)' : '1px solid var(--op-border)',
      borderRadius:10, display:'flex', flexDirection:'column', gap:6, alignItems:'center', justifyContent:'center',
      transform: hover ? 'translateY(-2px)' : 'translateY(0)',
      boxShadow: hover ? '0 8px 24px rgba(201,166,95,.08)' : 'none',
      transition:'all 200ms', cursor:'default', padding:8,
    }}>
      <span style={{ color: hover ? 'var(--op-accent)' : 'var(--op-text-muted)', transition:'color 200ms' }}>
        <svg width="16" height="16" viewBox="0 0 16 16">{GEO_PATHS[i % GEO_PATHS.length]}</svg>
      </span>
      <span style={{ font:"500 10px/1.1 'JetBrains Mono',monospace", color: hover?'var(--op-accent)':'var(--op-text-secondary)', letterSpacing:'.04em', textAlign:'center' }}>{a[0]}</span>
      <span aria-hidden style={{ position:'absolute', top:0, left:8, right:8, height:2, borderRadius:2, background: dept?.color || 'transparent' }}/>
      {hover && (
        <div style={{ position:'absolute', bottom:'calc(100% + 8px)', left:'50%', transform:'translateX(-50%)', background:'var(--op-surface-overlay)', border:'1px solid var(--op-border-strong)', borderRadius:8, padding:'8px 12px', whiteSpace:'nowrap', zIndex:5, font:"400 12px/1.3 'Inter',sans-serif", color:'var(--op-text)', boxShadow:'0 8px 24px rgba(0,0,0,.4)' }}>
          <span style={{ font:"500 10px 'JetBrains Mono',monospace", color:'var(--op-accent)', letterSpacing:'.1em', marginRight:8 }}>{dept?.name.toUpperCase()}</span>
          {a[1]}
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
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] as const } },
};

export default function TeamSection() {
  const headingRef = useRef(null);
  const gridRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, margin: '-80px' });
  const gridInView = useInView(gridRef, { once: true, margin: '-80px' });

  return (
    <section id="team" style={{ padding:'96px 0' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 48px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'minmax(0,2fr) minmax(0,3fr)', gap:64, alignItems:'flex-start' }} className="team-layout">
          <motion.div
            ref={headingRef}
            initial={{ opacity: 0, y: 28 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
            style={{ display:'flex', flexDirection:'column', gap:20 }}
          >
            <div style={{ display:'inline-flex', alignItems:'center', gap:14, font:"500 11px/1 'JetBrains Mono',monospace", letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:4 }}>
              <span style={{ color:'var(--op-text-muted)', padding:'6px 10px', border:'1px solid var(--op-border-strong)', clipPath:'polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)' }}>SECTION.06</span>
              <span style={{ display:'inline-block', width:40, height:1, background:'var(--op-border-strong)' }}/>
              <span style={{ color:'var(--op-accent)', fontFamily:"'JetBrains Mono',monospace" }}>$ team.roster()</span>
            </div>
            <h2 style={{ font:"600 clamp(32px,4.5vw,56px)/1.02 'Oxanium',sans-serif", letterSpacing:'-0.025em', color:'var(--op-text)', margin:0, textTransform:'uppercase' }}>
              Почему у нас быстрее<br/>и <span style={{ color:'var(--op-accent-2)' }}>дешевле</span>
            </h2>
            <p style={{ font:"400 16px/1.6 'Inter',sans-serif", color:'var(--op-text-secondary)', margin:0 }}>
              Вместо менеджера, дизайнера, копирайтера и верстальщика с человеческими часами — у нас команда AI-агентов. Архитектор думает над структурой, маркетолог определяет CTA, дизайнер собирает визуал, разработчик пишет код, юрист проверяет 152-ФЗ.
            </p>
            <p style={{ font:"400 16px/1.6 'Inter',sans-serif", color:'var(--op-text-secondary)', margin:0 }}>
              Люди — только на контроле ключевых точек. Результат: <span style={{ color:'var(--op-text)' }}>то же качество, в 10–30 раз быстрее и дешевле</span>.
            </p>
            <div style={{ display:'flex', gap:20, flexWrap:'wrap', marginTop:8 }}>
              {([['25','специализированных агентов'],['10–30×','ускорение против агентства'],['8','отделов']] as [string,string][]).map(([a,b],i)=>(
                <div key={i} style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  <span style={{ font:"500 28px/1 'Oxanium',sans-serif", color: i===1?'var(--op-accent-2)':'var(--op-accent)', letterSpacing:'-0.02em' }}>{a}</span>
                  <span style={{ font:"400 12px/1.3 'Inter',sans-serif", color:'var(--op-text-muted)' }}>{b}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <motion.div
              ref={gridRef}
              variants={containerVariants}
              initial="hidden"
              animate={gridInView ? 'visible' : 'hidden'}
              style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10 }}
              className="team-grid"
            >
              {FLAT_AGENTS.map((a,i) => (
                <motion.div key={a[0]} variants={itemVariants}>
                  <AgentTile a={a} i={i}/>
                </motion.div>
              ))}
            </motion.div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginTop:4 }}>
              {Object.entries(DEPTS).map(([name, d]) => (
                <span key={name} style={{ display:'inline-flex', alignItems:'center', gap:6, font:"400 11px 'JetBrains Mono',monospace", color:'var(--op-text-muted)', letterSpacing:'.08em', textTransform:'uppercase' }}>
                  <span style={{ width:10, height:2, borderRadius:2, background:d.color, display:'inline-block' }}/>
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media(max-width:900px){.team-layout{grid-template-columns:1fr!important;gap:48px!important;}}
        @media(max-width:900px){.team-grid{grid-template-columns:repeat(4,1fr)!important;}}
        @media(max-width:640px){.team-grid{grid-template-columns:repeat(3,1fr)!important;}}
      `}</style>
    </section>
  );
}

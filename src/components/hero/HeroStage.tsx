'use client';
import { useState } from 'react';
import WireSphere from './WireSphere';
import FloatCard, { type Card } from './FloatCard';

type SphereState = 'idle' | 'thinking' | 'speaking';

const SUGGESTIONS = [
  { label:'Стоматология', cmd:'stoma' },
  { label:'Магазин',      cmd:'shop'  },
  { label:'Школа',        cmd:'school'},
  { label:'Что-то своё…', cmd:'custom'},
];

const SCRIPTS: Record<string, { intent: string; cards: Card[] }> = {
  stoma: {
    intent: 'МЕДИЦИНА · СТОМАТОЛОГИЯ',
    cards: [
      { kind:'thinking', text:'Анализирую нишу' },
      { kind:'ref',   title:'Клиника Хакимовых', metric:'+180% записей', note:'похожий кейс · 2024' },
      { kind:'stream', text:'Для стоматологии — сайт на 8 страниц + администратор 24/7: ведёт запись, напоминает, отвечает про врачей.' },
      { kind:'offer', title:'Пакет «Клиника»', price:'280 000 ₽', time:'10 дней', boost:'+180% записей' },
    ],
  },
  shop: {
    intent: 'E-COMMERCE · РОЗНИЦА',
    cards: [
      { kind:'thinking', text:'Анализирую нишу' },
      { kind:'ref',   title:'Deniz', metric:'+240% заявок', note:'похожий кейс · 2024' },
      { kind:'stream', text:'Лендинг + AI-менеджер в WhatsApp — квалифицирует и дожимает до оплаты, пока вы спите.' },
      { kind:'offer', title:'Быстрый старт', price:'120 000 ₽', time:'3 дня', boost:'×2.4 конверсия' },
    ],
  },
  school: {
    intent: 'EDTECH · ШКОЛА',
    cards: [
      { kind:'thinking', text:'Анализирую нишу' },
      { kind:'ref',   title:'Versal', metric:'+47 заявок/нед', note:'похожий кейс · 2024' },
      { kind:'stream', text:'Сайт с каталогом программ + AI-консультант по расписанию и ценам, который сам записывает на пробное.' },
      { kind:'offer', title:'Пакет «Стандарт»', price:'200 000 ₽', time:'7 дней', boost:'+47 лидов/нед' },
    ],
  },
  custom: {
    intent: 'ИНДИВИДУАЛЬНО',
    cards: [
      { kind:'thinking', text:'Готовлю вопросы' },
      { kind:'stream', text:'Опишите в двух словах — я соберу похожие кейсы из 150+ и посчитаю бюджет.' },
      { kind:'ask', q1:'Сколько заявок в месяц сейчас?', q2:'Какой средний чек?', q3:'Где теряете клиентов?' },
    ],
  },
};

export default function HeroStage() {
  const [state, setState] = useState<SphereState>('idle');
  const [cards, setCards] = useState<Card[]>([]);
  const [intent, setIntent] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  const runScenario = (key: string) => {
    if (busy) return;
    const sc = SCRIPTS[key] ?? SCRIPTS.custom;
    setBusy(true);
    setCards([]);
    setIntent(sc.intent);
    setState('thinking');

    let delay = 400;
    sc.cards.forEach((c, i) => {
      setTimeout(() => {
        if (c.kind === 'stream') setState('speaking');
        setCards(prev => [...prev, c]);
        if (i === sc.cards.length - 1) {
          setTimeout(() => { setState('idle'); setBusy(false); }, 1800);
        }
      }, delay);
      delay += c.kind === 'stream' ? 2400 : c.kind === 'thinking' ? 800 : 900;
    });
  };

  const submit = () => {
    const t = input.trim();
    if (!t) return;
    setInput('');
    const s = t.toLowerCase();
    let key = 'custom';
    if (/стома|клиник|врач|медиц|зуб/.test(s)) key = 'stoma';
    else if (/магаз|shop|товар|продаж/.test(s)) key = 'shop';
    else if (/школ|курс|обучен/.test(s)) key = 'school';
    runScenario(key);
  };

  return (
    <div style={{ position:'relative', minHeight:560, display:'flex', flexDirection:'column', gap:24 }}>
      <style>{`
        @keyframes termblink { 50% { opacity: 0; } }
        @keyframes termspin  { to { transform: rotate(360deg); } }
        .fcard-enter { animation: fcardIn 500ms cubic-bezier(.22,.61,.36,1) backwards; }
        @keyframes fcardIn { from { opacity:0; transform: translateY(12px) scale(.96); } }
      `}</style>

      <div style={{ display:'flex', alignItems:'flex-start', gap:20 }}>
        <WireSphere state={state}/>
        <div style={{ display:'flex', flexDirection:'column', gap:10, flex:1, paddingTop:28 }}>
          <span style={{ font:"500 10px/1 'JetBrains Mono',monospace", color:'var(--op-accent)', letterSpacing:'.18em', textTransform:'uppercase' }}>
            ◆ Юра · AI-консультант
          </span>
          <span style={{ font:"600 22px/1.25 'Oxanium',sans-serif", color:'var(--op-text)', letterSpacing:'-0.005em', textTransform:'uppercase' }}>
            {state === 'idle' ? 'Готов слушать' : state === 'thinking' ? 'Анализирую…' : 'Формирую ответ'}
          </span>
          {intent && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, font:"500 10px/1 'JetBrains Mono',monospace", color:'var(--op-text-muted)', letterSpacing:'.14em', marginTop:2 }}>
              <span style={{ width:6, height:6, background:'var(--op-accent)', display:'inline-block' }}/>
              CTX: {intent}
            </div>
          )}
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:14, minHeight:200, paddingLeft:8 }}>
        {cards.length === 0 && (
          <div style={{ font:"400 15px/1.55 'Inter',sans-serif", color:'var(--op-text-muted)', maxWidth:500 }}>
            Выберите нишу или напишите свою. Юра подтянет похожий кейс, рассчитает бюджет и покажет КП. Прямо здесь, за 8 секунд.
          </div>
        )}
        {cards.map((c, i) => <FloatCard key={`${intent}-${i}`} card={c} index={i}/>)}
      </div>

      <div style={{
        display:'flex', alignItems:'center', gap:10, padding:'5px 5px 5px 18px',
        background:'rgba(18,22,30,.75)', border:'1px solid rgba(201,166,95,.25)',
        backdropFilter:'blur(14px)', boxShadow:'0 20px 40px -20px rgba(0,0,0,.5)',
        marginTop:'auto',
        clipPath:'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="1.5" style={{ flexShrink:0 }}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Опишите бизнес — Юра услышит…"
          disabled={busy}
          style={{ flex:1, background:'transparent', border:0, outline:0, color:'var(--op-text)', font:"400 15px/1 'Inter',sans-serif", padding:'12px 0', minWidth:0 }}
        />
        <button onClick={submit} disabled={busy} style={{
          background:'var(--op-accent)', color:'#0a0e14', border:0, padding:'0 18px', height:40,
          font:"600 12px/1 'JetBrains Mono',monospace", letterSpacing:'.12em', textTransform:'uppercase',
          cursor: busy ? 'not-allowed' : 'pointer',
          display:'inline-flex', alignItems:'center', gap:6, opacity: busy ? 0.5 : 1,
          clipPath:'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)',
        }}>
          {busy ? 'Думает' : 'Спросить'} →
        </button>
      </div>

      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:-8 }}>
        {SUGGESTIONS.map(s => (
          <button key={s.cmd} onClick={() => runScenario(s.cmd)} disabled={busy} style={{
            padding:'8px 14px',
            background:'transparent', border:'1px solid var(--op-border)', color:'var(--op-text-secondary)',
            font:"500 11px/1 'JetBrains Mono',monospace", letterSpacing:'.1em', textTransform:'uppercase',
            cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.4 : 1,
            transition:'all 180ms',
            clipPath:'polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)',
          }}
          onMouseEnter={e => { if (!busy) { (e.currentTarget as HTMLButtonElement).style.borderColor='var(--op-accent)'; (e.currentTarget as HTMLButtonElement).style.color='var(--op-accent)'; } }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor='var(--op-border)'; (e.currentTarget as HTMLButtonElement).style.color='var(--op-text-secondary)'; }}
          >{s.label}</button>
        ))}
      </div>
    </div>
  );
}

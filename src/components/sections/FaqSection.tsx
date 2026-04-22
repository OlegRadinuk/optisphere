'use client';
import { useState } from 'react';
import SectionIntro from '@/components/hud/SectionIntro';

const FAQS = [
  { q:'Сколько времени занимает проект?', a:'«Быстрый старт» — 3 дня. «Стандарт» — 5–7 дней. «Про» — 2–4 недели. Сроки фиксируются в договоре.' },
  { q:'Что если AI-ассистент скажет клиенту что-то не то?', a:'Ассистент обучен на вашей базе знаний и работает только внутри заданных сценариев. На граничные случаи — эскалация на человека.' },
  { q:'Как защищены данные по 152-ФЗ?', a:'Хостинг — Яндекс.Облако с РФ-локализацией. Подписываем NDA и договор поручения обработки ПД. Cookie-баннер с детальным согласием.' },
  { q:'Можно ли просто сайт без ассистента?', a:'Да, любой тариф — с ассистентом или без. «Быстрый старт» без ассистента — 90 000 ₽.' },
  { q:'Какой хостинг используется?', a:'По умолчанию — Яндекс.Облако (РФ-локализация, 152-ФЗ). По запросу — Selectel или ваш собственный.' },
  { q:'Почему вы дешевле других в 10–30 раз?', a:'Команда из 25 AI-агентов выполняет работу 10–15 человек. Мы платим за вычислительные ресурсы, а не за часы.' },
  { q:'Что если нужны правки после сдачи?', a:'Все правки в рамках ТЗ — бесплатно. Новые фичи — по прайсу, с фиксированной оценкой до начала работы.' },
  { q:'Как начать работать?', a:'Откройте чат с ассистентом вверху страницы или нажмите «Поговорить с ассистентом». За 5 минут он уточнит задачу и даст конкретные цифры.' },
];

function FaqItem({ q, a, open, onClick }: { q: string; a: string; open: boolean; onClick: () => void }) {
  return (
    <div style={{ border:'1px solid var(--op-border)', borderRadius:10, background: open?'var(--op-surface-elevated)':'var(--op-surface)', transition:'background 220ms', overflow:'hidden' }}>
      <button onClick={onClick} style={{ width:'100%', background:'transparent', border:0, padding:'20px 22px', display:'flex', alignItems:'center', gap:16, cursor:'pointer', textAlign:'left', color:'var(--op-text)', minHeight:56 }}>
        <span style={{ flex:1, font:"500 16px/1.4 'Oxanium',sans-serif", letterSpacing:'-0.01em' }}>{q}</span>
        <span style={{ width:28, height:28, borderRadius:6, border:'1px solid var(--op-border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color: open?'var(--op-accent)':'var(--op-text-secondary)', transform: open?'rotate(180deg)':'rotate(0)', transition:'transform 220ms, color 220ms' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m6 9 6 6 6-6"/></svg>
        </span>
      </button>
      <div style={{ maxHeight: open?400:0, overflow:'hidden', transition:'max-height 320ms' }}>
        <p style={{ font:"400 15px/1.6 'Inter',sans-serif", color:'var(--op-text-secondary)', margin:0, padding:'0 22px 22px', maxWidth:720 }}>{a}</p>
      </div>
    </div>
  );
}

export default function FaqSection() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" style={{ padding:'96px 0' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 48px' }}>
        <SectionIntro code="08" cmd="faq.search()" title="Частые вопросы"/>
        <div style={{ display:'flex', flexDirection:'column', gap:10, maxWidth:860 }}>
          {FAQS.map((f,i) => (
            <FaqItem key={i} q={f.q} a={f.a} open={open===i} onClick={() => setOpen(open===i ? -1 : i)}/>
          ))}
        </div>
      </div>
    </section>
  );
}

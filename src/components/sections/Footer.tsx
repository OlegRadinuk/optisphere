'use client';
import { useState, useEffect } from 'react';

function Brand() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <svg width={28} height={28} viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="22" fill="none" stroke="#e8e6e3" strokeWidth="1.5"/>
        <path d="M 24 2 A 22 12 0 0 1 24 46" fill="none" stroke="#e82020" strokeWidth="1.5"/>
        <path d="M 2 24 L 46 24" stroke="#e8e6e3" strokeWidth="1.5" opacity="0.35" fill="none"/>
      </svg>
      <span style={{ font:"500 17px/1 'Oxanium',sans-serif", color:'var(--op-text)', letterSpacing:'-0.015em' }}>Optisphere</span>
    </div>
  );
}

function Col({ title, items }: { title: string; items: { label: string; href?: string }[] }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <span style={{ font:"500 11px/1 'JetBrains Mono',monospace", color:'var(--op-text-muted)', letterSpacing:'.14em', textTransform:'uppercase' }}>{title}</span>
      <ul style={{ listStyle:'none', margin:0, padding:0, display:'flex', flexDirection:'column', gap:10 }}>
        {items.map((it,i) => (
          <li key={i}>
            {it.href ? (
              <a href={it.href} style={{ font:"400 14px/1.4 'Inter',sans-serif", color:'var(--op-text-secondary)', textDecoration:'none', cursor:'pointer' }}>{it.label}</a>
            ) : (
              <span style={{ font:"400 14px/1.4 'Inter',sans-serif", color:'var(--op-text-secondary)' }}>{it.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShow(false);
  };

  const handleConfigure = () => {
    setShow(false);
  };

  if (!show) return null;
  return (
    <div style={{ position:'fixed', left:16, right:16, bottom:16, zIndex:100, background:'var(--op-surface-elevated)', border:'1px solid var(--op-border-strong)', borderRadius:12, padding:'16px 20px', display:'flex', gap:16, alignItems:'center', flexWrap:'wrap', boxShadow:'0 12px 32px rgba(0,0,0,.5)', maxWidth:920, margin:'0 auto' }}>
      <span style={{ font:"400 13px/1.5 'Inter',sans-serif", color:'var(--op-text-secondary)', flex:'1 1 280px' }}>
        Мы используем cookies для аналитики и работы чата. Продолжая, вы соглашаетесь с{' '}
        <a href="/cookies" style={{ color:'var(--op-text)', textDecoration:'underline', cursor:'pointer' }}>политикой cookies в соответствии с 152-ФЗ</a>.
      </span>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        <button onClick={handleConfigure} style={{ height:36, padding:'0 14px', borderRadius:8, background:'transparent', color:'var(--op-text-secondary)', border:'none', cursor:'pointer', font:"500 13px/1 'Inter',sans-serif" }}>Только необходимые</button>
        <button onClick={handleConfigure} style={{ height:36, padding:'0 14px', borderRadius:8, background:'transparent', color:'var(--op-text)', border:'1px solid var(--op-border-strong)', cursor:'pointer', font:"500 13px/1 'Inter',sans-serif" }}>Настроить</button>
        <button onClick={handleAccept} style={{ height:36, padding:'0 14px', borderRadius:8, background:'var(--op-accent)', color:'var(--op-text-on-accent)', border:'none', cursor:'pointer', font:"500 13px/1 'Inter',sans-serif" }}>Принять всё</button>
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <>
      <footer style={{ borderTop:'1px solid var(--op-border)', padding:'72px 0 32px', background:'var(--op-surface)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 48px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr 1fr 1fr', gap:40, marginBottom:56 }} className="footer-grid">
            <div style={{ display:'flex', flexDirection:'column', gap:16, maxWidth:320 }}>
              <Brand/>
              <p style={{ font:"400 14px/1.55 'Inter',sans-serif", color:'var(--op-text-secondary)', margin:0 }}>
                Сайты, которые приносят клиентов. AI-ассистент Юра — 24/7 без выходных.
              </p>
            </div>
            <Col title="УСЛУГИ" items={[
              { label: 'AI-ассистенты', href: '#' },
              { label: 'Сайты', href: '#' },
              { label: 'SEO', href: '#' },
              { label: 'Яндекс.Директ', href: '#' },
              { label: 'Подписка «Орбита»', href: '#' },
            ]}/>
            <Col title="КОМПАНИЯ" items={[
              { label: 'О нас', href: '#' },
              { label: 'Кейсы', href: '#' },
              { label: 'Блог', href: '#' },
              { label: 'Enterprise', href: '#' },
            ]}/>
            <Col title="ЮРИДИЧЕСКОЕ" items={[
              { label: 'Политика конфиденциальности', href: '/privacy' },
              { label: 'Cookies', href: '/cookies' },
              { label: 'Оферта', href: '#' },
            ]}/>
            <Col title="КОНТАКТЫ" items={[
              { label: '+7 (978) 576-84-51', href: 'tel:+79785768451' },
              { label: 'hello@optisphere.ru', href: 'mailto:hello@optisphere.ru' },
              { label: '@optisphere', href: 'https://t.me/optisphere' },
              { label: 'Telegram · VK', href: '#' },
            ]}/>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', gap:16, paddingTop:24, borderTop:'1px solid var(--op-border)', flexWrap:'wrap', font:"400 12px/1.4 'JetBrains Mono',monospace", color:'var(--op-text-muted)', letterSpacing:'.06em' }}>
            <span>© 2026 OPTISPHERE · ВСЕ ПРАВА ЗАЩИЩЕНЫ</span>
            <div style={{ display:'flex', gap:16 }}>
              <a href="/privacy" style={{ color:'inherit', textDecoration:'none', cursor:'pointer' }}>/privacy</a>
              <a href="/cookies" style={{ color:'inherit', textDecoration:'none', cursor:'pointer' }}>/cookies</a>
            </div>
          </div>
        </div>
      </footer>
      <CookieBanner/>
      <style>{`@media(max-width:900px){.footer-grid{grid-template-columns:repeat(2,1fr)!important;}}@media(max-width:640px){.footer-grid{grid-template-columns:1fr!important;}}`}</style>
    </>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';

const LINKS = ['AI-сотрудники','Сайты','SEO','Реклама','Кейсы','Тарифы'];
const LINK_HREFS: Record<string, string> = {
  'AI-сотрудники': '#paths',
  'Сайты': '#paths',
  'SEO': '#paths',
  'Реклама': '#paths',
  'Кейсы': '#cases',
  'Тарифы': '#pricing',
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isLight, setIsLight] = useState(false);
  const locale = useLocale();

  useEffect(() => {
    const saved = localStorage.getItem('op-theme');
    if (saved === 'light') setTheme('light');
  }, []);

  useEffect(() => {
    const checkTheme = () => setIsLight(document.documentElement.getAttribute('data-theme') === 'light');
    checkTheme();
    const obs = new MutationObserver(checkTheme);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('op-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('op-theme', 'dark');
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <nav style={{
        position: 'sticky', top: 34, zIndex: 60,
        display: 'flex', alignItems: 'center', gap: 24,
        padding: '14px 32px',
        borderBottom: scrolled ? '1px solid var(--op-border)' : '1px solid transparent',
        background: scrolled ? (isLight ? 'rgba(255,255,255,0.92)' : 'rgba(6,6,6,0.85)') : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'all 220ms ease',
      }}>
        <img
          src={isLight ? '/optisphere-logo-light.png' : '/optisphere-logo-dark.png'}
          alt="Optisphere"
          style={{ height: 48, width: 'auto', display: 'block' }}
        />
        <div style={{ display:'flex', gap:22, marginLeft:16 }} className="nav-links-desktop">
          {LINKS.map((l, i) => (
            <a key={l} href={LINK_HREFS[l] || '#'} style={{
              font: "500 14px/1 'Inter',sans-serif",
              color: 'var(--op-text-secondary)',
              textDecoration: 'none', cursor: 'pointer',
              transition: 'color 180ms',
              display: 'inline-flex', alignItems: 'center',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--op-text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--op-text-secondary)')}
            >
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'var(--op-accent)', opacity:.7, letterSpacing:'.18em', marginRight:5 }}>
                0{i+1}
              </span>
              {l}
            </a>
          ))}
        </div>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ font:"400 11px/1 'JetBrains Mono',monospace", color:'var(--op-text-muted)', letterSpacing:'.12em' }}
                className="nav-price-desktop">ОТ 30 000 ₽</span>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', border:'1px solid var(--op-border)', background:'transparent' }} className="nav-opti-status">
            <span style={{ width:6, height:6, background:'var(--op-accent)', boxShadow:'0 0 8px var(--op-accent-ring)', animation:'hudPulse 1.4s ease-in-out infinite', display:'inline-block' }}/>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'var(--op-text-secondary)', letterSpacing:'.18em' }}>OPTI · READY</span>
          </div>
          <div className="locale-switcher" style={{ display: 'flex', alignItems: 'center', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--op-border-strong)', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>
            <Link href="/" locale="ru" style={{ padding: '0 10px', height: 36, display: 'inline-flex', alignItems: 'center', background: locale === 'ru' ? 'var(--op-accent)' : 'transparent', color: locale === 'ru' ? '#fff' : 'var(--op-text-secondary)', textDecoration: 'none', transition: 'all 140ms' }}>RU</Link>
            <Link href="/" locale="en" style={{ padding: '0 10px', height: 36, display: 'inline-flex', alignItems: 'center', background: locale === 'en' ? 'var(--op-accent)' : 'transparent', color: locale === 'en' ? '#fff' : 'var(--op-text-secondary)', textDecoration: 'none', transition: 'all 140ms' }}>EN</Link>
          </div>
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            style={{
              width: 36, height: 36,
              borderRadius: 8,
              background: 'transparent',
              border: '1px solid var(--op-border-strong)',
              color: 'var(--op-text-secondary)',
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
              transition: 'all 180ms ease',
            }}
          >
            {theme === 'dark' ? '☀' : '🌙'}
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('yura-open'))}
            style={{
              display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
              height:36, padding:'0 14px',
              borderRadius:0, background:'var(--op-accent)', color:'var(--op-text-on-accent)',
              border:'none', cursor:'pointer', font:"500 13px/1 'Inter',sans-serif",
              clipPath:'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
            }}
          >Обсудить</button>
          <button
            onClick={() => setOpen(o => !o)}
            aria-label="Меню"
            className="nav-burger"
            style={{
              width:44, height:44, border:'1px solid var(--op-border-strong)',
              background: open ? 'var(--op-accent)' : 'transparent',
              color: 'var(--op-text)',
              cursor:'pointer', display:'none', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:5,
              clipPath:'polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)',
              transition:'background .2s,color .2s',
            }}
          >
            <span style={{ display:'block', width:18, height:1.5, background:'currentColor', transform: open ? 'translateY(3px) rotate(45deg)' : 'none', transition:'transform .25s' }}/>
            <span style={{ display:'block', width:18, height:1.5, background:'currentColor', transform: open ? 'translateY(-3px) rotate(-45deg)' : 'none', transition:'transform .25s' }}/>
          </button>
        </div>
      </nav>

      <div style={{
        position:'fixed', inset:0, zIndex:100,
        background:'rgba(6,6,6,.97)', backdropFilter:'blur(20px)',
        display:'flex', flexDirection:'column', gap:4, padding:'96px 24px 40px',
        transform: open ? 'translateY(0)' : 'translateY(-100%)',
        transition:'transform .35s var(--op-ease)',
        pointerEvents: open ? 'auto' : 'none',
      }} onClick={() => setOpen(false)}>
        {LINKS.map(l => (
          <a key={l} href={LINK_HREFS[l] || '#'} style={{
            font: "600 32px/1.1 'Oxanium',sans-serif",
            color:'var(--op-text)', textDecoration:'none', padding:'16px 0',
            borderBottom:'1px solid var(--op-border)', letterSpacing:'-0.01em', textTransform:'uppercase',
          }}>{l}</a>
        ))}
        <button
          onClick={e => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('yura-open')); setOpen(false); }}
          style={{ marginTop:24, height:48, padding:'0 26px', background:'var(--op-accent)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', font:"500 15px/1 'Inter',sans-serif" }}
        >
          Обсудить проект →
        </button>
        <div style={{ marginTop:20, font:"400 11px/1.5 'JetBrains Mono',monospace", color:'var(--op-text-muted)', letterSpacing:'.12em' }}>
          ОТ 30 000 ₽ · hi@optisphere.ru
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .nav-links-desktop { display: none !important; }
          .nav-price-desktop { display: none !important; }
          .nav-opti-status { display: none !important; }
          .nav-burger { display: inline-flex !important; }
        }
        @media (max-width: 640px) {
          .locale-switcher { display: none !important; }
        }
      `}</style>
    </>
  );
}

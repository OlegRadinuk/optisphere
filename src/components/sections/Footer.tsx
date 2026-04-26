'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import TransitionLink from '@/components/transitions/TransitionLink';

function Col({ title, items }: { title: string; items: { label: string; href?: string }[] }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <span style={{ font:"500 11px/1 'JetBrains Mono',monospace", color:'var(--op-text-muted)', letterSpacing:'.14em', textTransform:'uppercase' }}>{title}</span>
      <ul style={{ listStyle:'none', margin:0, padding:0, display:'flex', flexDirection:'column', gap:10 }}>
        {items.map((it,i) => (
          <li key={i}>
            {it.href ? (
              it.href.startsWith('/') ? (
                <TransitionLink href={it.href} style={{ font:"400 14px/1.4 'Inter',sans-serif", color:'var(--op-text-secondary)', textDecoration:'none', cursor:'pointer' }}>{it.label}</TransitionLink>
              ) : (
                <a href={it.href} style={{ font:"400 14px/1.4 'Inter',sans-serif", color:'var(--op-text-secondary)', textDecoration:'none', cursor:'pointer' }}>{it.label}</a>
              )
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
  const t = useTranslations('footer');
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
    <div className="cookie-banner" style={{ position:'fixed', left:16, right:16, bottom:16, zIndex:100, background:'var(--op-surface-elevated)', border:'1px solid var(--op-border-strong)', borderRadius:12, padding:'16px 20px', display:'flex', gap:16, alignItems:'center', flexWrap:'wrap', boxShadow:'0 12px 32px rgba(0,0,0,.5)', maxWidth:920, margin:'0 auto' }}>
      <span style={{ font:"400 13px/1.5 'Inter',sans-serif", color:'var(--op-text-secondary)', flex:'1 1 280px' }}>
        {t('cookie_text')}{' '}
        <TransitionLink href="/cookies" style={{ color:'var(--op-text)', textDecoration:'underline', cursor:'pointer' }}>{t('cookie_link')}</TransitionLink>.
      </span>
      <div className="cookie-btns" style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        <button onClick={handleConfigure} style={{ height:36, padding:'0 14px', borderRadius:8, background:'transparent', color:'var(--op-text-secondary)', border:'none', cursor:'pointer', font:"500 13px/1 'Inter',sans-serif" }}>{t('cookie_essential')}</button>
        <button onClick={handleConfigure} style={{ height:36, padding:'0 14px', borderRadius:8, background:'transparent', color:'var(--op-text)', border:'1px solid var(--op-border-strong)', cursor:'pointer', font:"500 13px/1 'Inter',sans-serif" }}>{t('cookie_configure')}</button>
        <button onClick={handleAccept} style={{ height:36, padding:'0 14px', borderRadius:8, background:'var(--op-accent)', color:'var(--op-text-on-accent)', border:'none', cursor:'pointer', font:"500 13px/1 'Inter',sans-serif" }}>{t('cookie_accept')}</button>
      </div>
    </div>
  );
}

export default function Footer() {
  const t = useTranslations('footer');
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.getAttribute('data-theme') === 'light');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <footer style={{ borderTop:'1px solid var(--op-border)', padding:'72px 0 32px', background:'var(--op-surface)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 48px' }} className="section-container">
          <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr 1fr 1fr', gap:40, marginBottom:56 }} className="footer-grid">
            <div style={{ display:'flex', flexDirection:'column', gap:16, maxWidth:320 }}>
              <img
                src={isLight ? '/optisphere-logo-light.png' : '/optisphere-logo-dark.png'}
                alt="Optisphere"
                style={{ height: 48, width: 'auto', display: 'block' }}
              />
              <p style={{ font:"400 14px/1.55 'Inter',sans-serif", color:'var(--op-text-secondary)', margin:0 }}>
                {t('desc_short')}
              </p>
            </div>
            <Col title={t('col_services')} items={[
              { label: t('svc_ai'),     href: '#' },
              { label: t('svc_sites'),  href: '#' },
              { label: t('svc_seo'),    href: '#' },
              { label: t('svc_direct'), href: '#' },
              { label: t('svc_orbit'),  href: '#' },
            ]}/>
            <Col title={t('col_company')} items={[
              { label: t('company_about'),      href: '#' },
              { label: t('company_cases'),      href: '#' },
              { label: t('company_blog'),       href: '#' },
              { label: t('company_enterprise'), href: '#' },
            ]}/>
            <Col title={t('col_legal')} items={[
              { label: t('legal_privacy'), href: '/privacy' },
              { label: t('legal_cookies'), href: '/cookies' },
              { label: t('legal_offer'),   href: '#' },
            ]}/>
            <Col title={t('col_contacts')} items={[
              { label: '+7 (978) 576-84-51',  href: 'tel:+79785768451' },
              { label: 'hello@optisphere.ru', href: 'mailto:hello@optisphere.ru' },
              { label: '@optisphere',         href: 'https://t.me/optisphere' },
              { label: 'Telegram · VK',       href: '#' },
            ]}/>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', gap:16, paddingTop:24, borderTop:'1px solid var(--op-border)', flexWrap:'wrap', font:"400 12px/1.4 'JetBrains Mono',monospace", color:'var(--op-text-muted)', letterSpacing:'.06em' }}>
            <span>{t('copyright')}</span>
            <div style={{ display:'flex', gap:16 }}>
              <TransitionLink href="/privacy" style={{ color:'inherit', textDecoration:'none', cursor:'pointer' }}>/privacy</TransitionLink>
              <TransitionLink href="/cookies" style={{ color:'inherit', textDecoration:'none', cursor:'pointer' }}>/cookies</TransitionLink>
            </div>
          </div>
        </div>
      </footer>
      <CookieBanner/>
      <style>{`
        @media(max-width:900px){.footer-grid{grid-template-columns:repeat(2,1fr)!important;}}
        @media(max-width:640px){.footer-grid{grid-template-columns:1fr!important;}}
        @media(max-width:480px){
          .cookie-banner{padding:10px 12px!important; gap:10px!important;}
          .cookie-btns{gap:4px!important;}
          .cookie-btns button{height:30px!important; padding:0 8px!important; font-size:11px!important;}
        }
      `}</style>
    </>
  );
}

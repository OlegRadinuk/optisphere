import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

// Server Component — no 'use client' needed

function TelegramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="13" stroke="url(#logo-grad)" strokeWidth="1.5" opacity="0.6" />
      <circle cx="16" cy="16" r="8" stroke="url(#logo-grad)" strokeWidth="1" opacity="0.4" />
      <circle cx="16" cy="16" r="3.5" fill="url(#logo-grad)" opacity="0.9" />
      <ellipse cx="16" cy="16" rx="13" ry="5" stroke="url(#logo-grad)" strokeWidth="1" opacity="0.3" />
      <defs>
        <linearGradient id="logo-grad" x1="3" y1="3" x2="29" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const NAV_LINKS = [
  { href: '#services',    labelKey: 'services' },
  { href: '#portfolio',   labelKey: 'portfolio' },
  { href: '#pricing',     labelKey: 'pricing' },
  { href: '#calculator',  labelKey: 'calculator' },
  { href: '#contact',     labelKey: 'contact' },
] as const;


export default function Footer() {
  const tNav    = useTranslations('nav');
  const tFooter = useTranslations('footer');
  const tCalc   = useTranslations('calculator');
  const features = [
    { icon: '🚀', text: tFooter('features.speed') },
    { icon: '🤖', text: tFooter('features.ai') },
    { icon: '📍', text: tFooter('features.pano') },
    { icon: '📈', text: tFooter('features.seo') },
  ];

  return (
    <footer style={{ background: 'var(--base)', position: 'relative', overflow: 'hidden' }}>

      {/* Background dot grid */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        pointerEvents: 'none',
      }} />

      {/* Top glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '600px', height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), rgba(6,182,212,0.4), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Main grid */}
        <div
          className="container-wide footer-main-grid"
          style={{ padding: '4rem 1.5rem 3rem' }}
        >
          {/* Column 1 — Brand */}
          <div className="footer-col-brand">
            <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }} aria-label="Optisphere — главная">
              <LogoMark />
              <span style={{
                fontFamily: 'var(--font-orbitron), monospace',
                fontSize: '1.1rem', fontWeight: 700,
                letterSpacing: '0.06em', color: 'var(--text)',
              }}>
                <span style={{
                  background: 'linear-gradient(135deg, var(--indigo), var(--cyan))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>O</span>PTISPHERE
              </span>
            </Link>

            <p style={{
              marginTop: '0.875rem',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              lineHeight: 1.65,
              maxWidth: '260px',
            }}>
              {tFooter('tagline')}. {tFooter('desc')}
            </p>

            {/* Telegram CTA */}
            <a
              href="https://t.me/optisphere"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: '1.25rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                border: '1px solid rgba(99,102,241,0.3)',
                background: 'rgba(99,102,241,0.08)',
                fontSize: '0.8rem',
                color: 'var(--indigo)',
                textDecoration: 'none',
                transition: 'background 0.2s, border-color 0.2s',
              }}
              className="footer-tg-btn"
            >
              <TelegramIcon />
              @optisphere
            </a>
          </div>

          {/* Column 2 — Navigation */}
          <div className="footer-col-nav">
            <p style={{
              fontFamily: 'var(--font-orbitron), monospace',
              fontSize: '0.6rem', fontWeight: 600,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'var(--text-muted)', marginBottom: '1.25rem',
            }}>
              {tFooter('nav_label')}
            </p>
            <nav aria-label="Навигация в подвале" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {NAV_LINKS.map(({ href, labelKey }) => (
                <a key={href} href={href} className="footer-link">
                  {labelKey === 'calculator'
                    ? tCalc('label')
                    : tNav(labelKey as 'services' | 'portfolio' | 'pricing' | 'contact')}
                </a>
              ))}
            </nav>
          </div>

          {/* Column 3 — What we offer */}
          <div className="footer-col-features">
            <p style={{
              fontFamily: 'var(--font-orbitron), monospace',
              fontSize: '0.6rem', fontWeight: 600,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'var(--text-muted)', marginBottom: '1.25rem',
            }}>
              {tFooter('services_label')}
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {features.map(f => (
                <li key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span style={{ fontSize: '0.9rem' }}>{f.icon}</span>
                  {f.text}
                </li>
              ))}
            </ul>

            {/* Trust marker */}
            <div style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              background: 'rgba(99,102,241,0.06)',
              border: '1px solid rgba(99,102,241,0.15)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', display: 'block', flexShrink: 0 }} />
                <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-orbitron), monospace', letterSpacing: '0.12em', color: '#22c55e', textTransform: 'uppercase' }}>Online</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {tFooter('online_label')}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--border)' }} />

        {/* Bottom bar */}
        <div
          className="container-wide footer-bottom"
          style={{ padding: '1.25rem 1.5rem' }}
        >
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', opacity: 0.6 }}>
            {tFooter('rights')}
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', opacity: 0.4 }}>
            {tFooter('made_with')} · AI Web Studio
          </p>
        </div>
      </div>

      <style>{`
        .footer-link {
          font-size: 0.875rem;
          color: var(--text-muted);
          text-decoration: none;
          min-height: 36px;
          display: inline-flex;
          align-items: center;
          transition: color 0.2s ease;
        }
        .footer-link:hover { color: var(--text); }
        .footer-tg-btn:hover {
          background: rgba(99,102,241,0.15) !important;
          border-color: rgba(99,102,241,0.5) !important;
        }
        .footer-main-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
        }
        .footer-bottom {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          text-align: center;
        }
        @media (min-width: 768px) {
          .footer-main-grid {
            grid-template-columns: 1.6fr 1fr 1.2fr;
            gap: 3rem;
          }
          .footer-bottom {
            flex-direction: row;
            justify-content: space-between;
            text-align: left;
          }
        }
      `}</style>
    </footer>
  );
}

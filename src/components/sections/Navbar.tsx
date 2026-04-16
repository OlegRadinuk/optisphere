'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, usePathname as useNextPathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useRouter } from '@/i18n/navigation';

type Locale = 'ru' | 'en';

const NAV_LINKS = [
  { key: 'services' as const, href: '#services' },
  { key: 'portfolio' as const, href: '#portfolio' },
  { key: 'pricing' as const, href: '#pricing' },
  { key: 'contact' as const, href: '#contact' },
] satisfies { key: 'services' | 'portfolio' | 'pricing' | 'contact'; href: string }[];

export default function Navbar() {
  const t = useTranslations('nav');
  const params = useParams();
  const nextPathname = useNextPathname();
  const router = useRouter();

  const currentLocale = (params?.locale as Locale) ?? 'ru';

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const switchLocale = (locale: Locale) => {
    // Extract the path without the locale prefix
    const localePrefix = `/${currentLocale}`;
    const pathWithoutLocale = nextPathname.startsWith(localePrefix)
      ? nextPathname.slice(localePrefix.length) || '/'
      : nextPathname;

    router.replace(pathWithoutLocale, { locale });
    setMobileOpen(false);
  };

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* Navbar */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 w-full"
        style={{ height: '64px' }}
      >
        <div
          className="w-full h-full transition-all duration-300"
          style={
            scrolled
              ? {
                  background: 'rgba(10, 10, 24, 0.85)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderBottom: '1px solid var(--border)',
                }
              : {
                  background: 'transparent',
                }
          }
        >
          <div
            className="container-wide h-full flex items-center justify-between"
            style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}
          >
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-1 no-underline"
              aria-label="Optisphere — главная страница"
            >
              <span
                style={{
                  fontFamily: 'var(--font-orbitron), monospace',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  color: 'var(--text)',
                  textDecoration: 'none',
                }}
              >
                <span className="gradient-indigo-cyan">O</span>PTISPHERE
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8" aria-label="Основная навигация">
              {NAV_LINKS.map(({ key, href }) => (
                <a
                  key={key}
                  href={href}
                  className="transition-colors duration-200 no-underline"
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)';
                  }}
                >
                  {t(key)}
                </a>
              ))}
            </nav>

            {/* Desktop right: lang toggle + CTA */}
            <div className="hidden lg:flex items-center gap-5">
              {/* Language toggle */}
              <div className="flex items-center gap-1" style={{ fontSize: '0.875rem' }}>
                <button
                  onClick={() => switchLocale('ru')}
                  className="transition-colors duration-200 cursor-pointer bg-transparent border-none p-0"
                  style={{
                    color: currentLocale === 'ru' ? 'var(--text)' : 'var(--text-muted)',
                    fontWeight: currentLocale === 'ru' ? 500 : 400,
                    minHeight: '44px',
                    minWidth: '44px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label="Переключить на русский"
                  aria-current={currentLocale === 'ru' ? 'true' : undefined}
                >
                  RU
                </button>
                <span style={{ color: 'var(--text-faint)' }}>/</span>
                <button
                  onClick={() => switchLocale('en')}
                  className="transition-colors duration-200 cursor-pointer bg-transparent border-none p-0"
                  style={{
                    color: currentLocale === 'en' ? 'var(--text)' : 'var(--text-muted)',
                    fontWeight: currentLocale === 'en' ? 500 : 400,
                    minHeight: '44px',
                    minWidth: '44px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label="Switch to English"
                  aria-current={currentLocale === 'en' ? 'true' : undefined}
                >
                  EN
                </button>
              </div>

              {/* CTA button */}
              <a
                href="#contact"
                className="btn btn-primary"
                style={{
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.875rem',
                }}
              >
                {t('cta')}
              </a>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden flex flex-col justify-center items-center bg-transparent border-none cursor-pointer"
              style={{
                width: '44px',
                height: '44px',
                gap: '5px',
                padding: '10px',
              }}
              aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={mobileOpen}
            >
              <motion.span
                animate={
                  mobileOpen
                    ? { rotate: 45, y: 7, scaleX: 1 }
                    : { rotate: 0, y: 0, scaleX: 1 }
                }
                transition={{ duration: 0.2 }}
                style={{
                  display: 'block',
                  width: '22px',
                  height: '2px',
                  background: 'var(--text)',
                  borderRadius: '1px',
                  transformOrigin: 'center',
                }}
              />
              <motion.span
                animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.15 }}
                style={{
                  display: 'block',
                  width: '22px',
                  height: '2px',
                  background: 'var(--text)',
                  borderRadius: '1px',
                }}
              />
              <motion.span
                animate={
                  mobileOpen
                    ? { rotate: -45, y: -7, scaleX: 1 }
                    : { rotate: 0, y: 0, scaleX: 1 }
                }
                transition={{ duration: 0.2 }}
                style={{
                  display: 'block',
                  width: '22px',
                  height: '2px',
                  background: 'var(--text)',
                  borderRadius: '1px',
                  transformOrigin: 'center',
                }}
              />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-40 lg:hidden flex flex-col"
            style={{
              background: 'var(--surface)',
              paddingTop: '60px',
            }}
          >
            {/* Nav links */}
            <nav
              className="flex flex-col items-center justify-center flex-1 gap-6"
              aria-label="Мобильная навигация"
            >
              {NAV_LINKS.map(({ key, href }, i) => (
                <motion.a
                  key={key}
                  href={href}
                  onClick={handleNavClick}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.07, duration: 0.25 }}
                  className="no-underline"
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: 'var(--text)',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--indigo)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)';
                  }}
                >
                  {t(key)}
                </motion.a>
              ))}
            </nav>

            {/* Bottom: lang toggle + CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.25 }}
              className="flex flex-col items-center gap-5 pb-10 px-6"
            >
              {/* Language toggle */}
              <div className="flex items-center gap-2" style={{ fontSize: '1rem' }}>
                <button
                  onClick={() => switchLocale('ru')}
                  className="cursor-pointer bg-transparent border-none"
                  style={{
                    color: currentLocale === 'ru' ? 'var(--text)' : 'var(--text-muted)',
                    fontWeight: currentLocale === 'ru' ? 600 : 400,
                    fontSize: '1rem',
                    minHeight: '44px',
                    minWidth: '44px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label="Переключить на русский"
                  aria-current={currentLocale === 'ru' ? 'true' : undefined}
                >
                  RU
                </button>
                <span style={{ color: 'var(--text-faint)' }}>/</span>
                <button
                  onClick={() => switchLocale('en')}
                  className="cursor-pointer bg-transparent border-none"
                  style={{
                    color: currentLocale === 'en' ? 'var(--text)' : 'var(--text-muted)',
                    fontWeight: currentLocale === 'en' ? 600 : 400,
                    fontSize: '1rem',
                    minHeight: '44px',
                    minWidth: '44px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label="Switch to English"
                  aria-current={currentLocale === 'en' ? 'true' : undefined}
                >
                  EN
                </button>
              </div>

              {/* CTA */}
              <a
                href="#contact"
                onClick={handleNavClick}
                className="btn btn-primary w-full text-center"
                style={{ maxWidth: '320px' }}
              >
                {t('cta')}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

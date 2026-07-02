"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"

export default function SaasNavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { label: "Как работает", href: "#features" },
    { label: "Кейсы", href: "#cases" },
    { label: "FAQ", href: "#faq" },
  ]

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 64,
          display: "flex",
          alignItems: "center",
          padding: "0 clamp(20px,4vw,48px)",
          background: scrolled ? "rgba(6,6,6,0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid var(--op-border)" : "none",
          transition: "all 220ms var(--op-ease)",
        }}
      >
        {/* Logo */}
        <Link
          href="/saas/clinics"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/optisphere-logo-dark.png"
            alt="Optisphere"
            style={{ height: 30, width: "auto", display: "block" }}
          />
        </Link>

        {/* Desktop nav */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 32,
            marginLeft: 48,
            flex: 1,
          }}
          className="saas-nav-desktop"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontFamily: "var(--op-font-body)",
                fontSize: 14,
                color: "var(--op-text-secondary)",
                textDecoration: "none",
                transition: "color 160ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--op-text)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--op-text-secondary)"
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA always visible */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/saas/onboarding" className="btn btn-primary" style={{ height: 40, padding: "0 20px", fontSize: 14 }}>
            Создать бесплатно
          </Link>

          {/* Hamburger (mobile) */}
          <button
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              display: "none",
              width: 40,
              height: 40,
              background: "transparent",
              border: "1px solid var(--op-border)",
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
            className="saas-hamburger"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--op-text)" strokeWidth="1.5" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="17" y2="6" />
                  <line x1="3" y1="10" x2="17" y2="10" />
                  <line x1="3" y1="14" x2="17" y2="14" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                zIndex: 98,
              }}
            />
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 99,
                background: "var(--op-surface)",
                borderTop: "1px solid var(--op-border)",
                borderRadius: "20px 20px 0 0",
                padding: "24px 24px calc(24px + env(safe-area-inset-bottom))",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontFamily: "var(--op-font-body)",
                    fontSize: 18,
                    color: "var(--op-text)",
                    textDecoration: "none",
                    padding: "14px 0",
                    borderBottom: "1px solid var(--op-divider)",
                  }}
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.06 }}
                style={{ marginTop: 8 }}
              >
                <Link
                  href="/saas/onboarding"
                  className="btn btn-primary"
                  onClick={() => setMenuOpen(false)}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Создать бесплатно
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 767px) {
          .saas-nav-desktop { display: none !important; }
          .saas-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  )
}

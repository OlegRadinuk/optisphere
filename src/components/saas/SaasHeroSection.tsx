"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"

const heroVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}
const itemVariant = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const trustChips = [
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    text: "Бесплатно навсегда",
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    text: "Запускается за 10 минут",
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h6M9 12h6M9 15h4" />
      </svg>
    ),
    text: "Работает 24/7",
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    text: "Данные в России",
  },
]

export default function SaasHeroSection() {
  const shouldReduceMotion = useReducedMotion()
  const [showScroll, setShowScroll] = useState(true)

  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY < 100)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section
      style={{
        position: "relative",
        minHeight: "88vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 80,
        overflow: "hidden",
      }}
    >
      {/* Grid background */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />
      {/* Red glow center */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(232,32,32,0.06) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 720,
          width: "100%",
          padding: "0 clamp(20px,4vw,48px)",
          textAlign: "center",
        }}
      >
        <motion.div
          variants={shouldReduceMotion ? {} : heroVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Label */}
          <motion.div
            variants={shouldReduceMotion ? {} : itemVariant}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "var(--op-font-mono)",
              fontSize: 11,
              letterSpacing: "0.2em",
              color: "var(--op-text-muted)",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--op-accent)",
                animation: "hudPulse 2s ease-in-out infinite",
              }}
            />
            AI · Администратор · Для клиник
          </motion.div>

          {/* H1 */}
          <motion.h1
            variants={shouldReduceMotion ? {} : itemVariant}
            style={{
              fontFamily: "var(--op-font-display)",
              fontSize: "clamp(36px,6vw,64px)",
              fontWeight: 700,
              lineHeight: 1.1,
              color: "var(--op-text)",
              marginBottom: 20,
              letterSpacing: "-0.02em",
            }}
          >
            Наймите{" "}
            <span
              style={{
                background: "linear-gradient(90deg, var(--op-accent), var(--op-accent-2))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              AI-администратора
            </span>{" "}
            для клиники
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={shouldReduceMotion ? {} : itemVariant}
            style={{
              fontFamily: "var(--op-font-body)",
              fontSize: "clamp(16px,2vw,20px)",
              color: "var(--op-text-secondary)",
              lineHeight: 1.6,
              maxWidth: 540,
              margin: "0 auto 36px",
            }}
          >
            Отвечает пациентам и ведёт запись 24/7. Запустить за 10 минут — без
            программиста, без интеграций, без абонентской платы первый месяц.
          </motion.p>

          {/* CTA block */}
          <motion.div variants={shouldReduceMotion ? {} : itemVariant}>
            <div className="saas-hero-cta">
              <div>
                <Link
                  href="/saas/onboarding"
                  className="btn btn-primary"
                  style={{
                    height: 52,
                    padding: "0 32px",
                    fontSize: 16,
                    fontWeight: 600,
                    gap: 10,
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  Создать бесплатно за 10 минут
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
              <div style={{ textAlign: "center" }}>
                <a
                  href="#contact"
                  className="btn btn-ghost"
                  style={{
                    height: 52,
                    padding: "0 28px",
                    fontSize: 15,
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  Сделаем под ключ с интеграцией в МИС
                </a>
                <p
                  style={{
                    fontFamily: "var(--op-font-body)",
                    fontSize: 11,
                    color: "var(--op-text-muted)",
                    marginTop: 6,
                  }}
                >
                  от 7 000 ₽ · МедФлекс / 1С
                </p>
              </div>
            </div>
          </motion.div>

          {/* Trust chips */}
          <motion.div
            variants={shouldReduceMotion ? {} : itemVariant}
            style={{ marginTop: 40 }}
          >
            <div className="saas-trust-chips">
              {trustChips.map((chip) => (
                <div
                  key={chip.text}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "var(--op-font-body)",
                    fontSize: 13,
                    color: "var(--op-text-secondary)",
                  }}
                >
                  {chip.icon}
                  {chip.text}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      {showScroll && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            animation: "fadeInUp 1s ease 1.5s both",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--op-text-muted)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animation: "heroBounce 2s ease-in-out infinite" }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      )}

      <style>{`
        .saas-hero-cta {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .saas-hero-cta > div {
          flex: 1;
          min-width: 220px;
          max-width: 340px;
        }
        .saas-trust-chips {
          display: grid;
          grid-template-columns: repeat(4, auto);
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        @keyframes heroBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        @media (max-width: 640px) {
          .saas-hero-cta {
            flex-direction: column;
            align-items: stretch;
          }
          .saas-hero-cta > div {
            max-width: 100%;
          }
          .saas-trust-chips {
            grid-template-columns: repeat(2, auto);
            gap: 12px;
          }
        }
      `}</style>
    </section>
  )
}

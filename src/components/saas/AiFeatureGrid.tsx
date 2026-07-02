"use client"

import { useRef } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"
import SectionIntro from "@/components/hud/SectionIntro"

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: "Ответ за секунды",
    text: "Пациент написал в 23:00 — AI ответил сразу. Время реакции: < 3 секунды. Больше не теряете обращения из-за занятого администратора.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: "Запись без администратора",
    text: "Уточняет услугу, подбирает время, подтверждает запись — всё в диалоге. Заявки приходят вам в Telegram с именем и телефоном.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    title: "Знает всё о клинике",
    text: "Цены, врачи, услуги, адрес, время работы. Берёт данные с вашего сайта в реальном времени — всегда актуально, без ручного обновления.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
    ),
    title: "Горячие лиды — только вам",
    text: "Задаёт 2–3 уточняющих вопроса, понимает запрос. Вы получаете не просто номер телефона — а кому, зачем и когда нужна помощь.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    title: "Виджет — одна строка кода",
    text: "Вставляете один тег на сайт — готово. Не нужен программист. Работает на любом сайте: Tilda, WordPress, конструктор.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
    title: "Заявки в Telegram",
    text: "Каждая новая заявка — мгновенное уведомление вам и администратору. Подключается одним нажатием.",
  },
]

export default function AiFeatureGrid() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const shouldReduceMotion = useReducedMotion()

  return (
    <section id="features" style={{ padding: "96px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px,4vw,48px)" }}>
        <SectionIntro
          code="01"
          cmd="assistant.capabilities()"
          title="Что умеет ваш AI-администратор"
          sub="Работает вместо администратора — отвечает, квалифицирует, ведёт запись. Не болеет, не уходит в отпуск."
        />

        <div
          ref={ref}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
          className="saas-features-grid"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: "var(--op-surface)",
                border: "1px solid var(--op-border)",
                borderRadius: 12,
                padding: "28px 24px",
                transition: "border-color 220ms, box-shadow 220ms",
              }}
              whileHover={
                shouldReduceMotion
                  ? {}
                  : {
                      borderColor: "rgba(232,32,32,0.3)",
                      boxShadow: "var(--op-shadow-glow)",
                    }
              }
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(232,32,32,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                {feature.icon}
              </div>
              <h3
                style={{
                  fontFamily: "var(--op-font-display)",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "var(--op-text)",
                  marginBottom: 10,
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--op-font-body)",
                  fontSize: 14,
                  color: "var(--op-text-secondary)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {feature.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .saas-features-grid {
          grid-template-columns: repeat(3, 1fr) !important;
        }
        @media (max-width: 900px) {
          .saas-features-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .saas-features-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}

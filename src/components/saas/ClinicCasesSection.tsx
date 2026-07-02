"use client"

import { useRef } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"
import SectionIntro from "@/components/hud/SectionIntro"
import ClinicCaseCard from "./ClinicCaseCard"

export default function ClinicCasesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const shouldReduceMotion = useReducedMotion()

  return (
    <section id="cases" style={{ padding: "96px 0", background: "var(--op-surface)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px,4vw,48px)" }}>
        <SectionIntro
          code="02"
          cmd="cases.load()"
          title="Клиники, которые уже используют"
        />

        <div ref={ref} className="saas-cases-grid" style={{ display: "flex", gap: 24 }}>
          <motion.div
            style={{ flex: 1 }}
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <ClinicCaseCard
              initial="А"
              name="Альбамед"
              subtitle="Многопрофильный медицинский центр · Симферополь"
              quote="AI отвечает пациентам пока мы спим. Утром приходим — в Telegram уже 4–7 готовых записей."
              metrics={[
                { value: "312", label: "заявок за первый месяц" },
                { value: "< 4 сек", label: "среднее время ответа" },
                { value: "38%", label: "записей без участия администратора" },
              ]}
            />
          </motion.div>

          <motion.div
            style={{ flex: 1 }}
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <ClinicCaseCard
              initial="Э"
              name="Эстет"
              subtitle="Косметологическая клиника · Симферополь"
              quote="Пациенты пишут в час ночи, AI отвечает и берёт контакт. Мы закрываем утром."
              metrics={[
                { value: "187", label: "заявок за 3 недели" },
                { value: "24/7", label: "работает без выходных" },
                { value: "0 ₽", label: "стоит подключение" },
              ]}
            />
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .saas-cases-grid {
            flex-direction: column !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </section>
  )
}

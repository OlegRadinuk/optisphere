"use client"

import { useRef, useState } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"
import SectionIntro from "@/components/hud/SectionIntro"

const FAQS = [
  {
    q: "Сколько это стоит?",
    a: "Первый месяц — бесплатно. Потом — по договорённости в зависимости от объёма. Для небольших клиник (до 200 диалогов в месяц) стоимость сопоставима с одним рекламным объявлением.",
  },
  {
    q: "Мне нужен программист, чтобы установить?",
    a: "Нет. Вы получаете одну строку кода — вставляете её в конструктор сайта (Tilda, WordPress, любой другой). Это занимает 2 минуты. Если не знаете как — мы помогаем бесплатно.",
  },
  {
    q: "AI будет отвечать неправильно?",
    a: "AI берёт информацию с вашего сайта в реальном времени — цены, услуги, врачи. При настройке вы указываете, что бот должен говорить, а что нет. Неточные ответы — редкость, обычно бот уточняет или просит связаться напрямую.",
  },
  {
    q: "Что если пациент захочет поговорить с человеком?",
    a: "AI понимает такой запрос и передаёт контакт живому администратору. Вы видите весь диалог в кабинете и в Telegram — можно подключиться в любой момент.",
  },
  {
    q: "Будет ли бот записывать в нашу МИС (МедФлекс, 1С)?",
    a: "В базовой версии — запись идёт во встроенный календарь + уведомление вам в Telegram. Интеграция напрямую в вашу МИС (МедФлекс, 1С и другие) — это расширенный тариф, который настраивается вместе с нами. Уточните через форму ниже.",
  },
  {
    q: "Мы уже платим за другой онлайн-чат. Зачем менять?",
    a: "AI-администратор — это не просто чат. Он квалифицирует пациента, берёт контакт, предлагает время записи. Обычный чат-виджет ждёт, пока администратор ответит. AI работает даже когда клиника закрыта.",
  },
  {
    q: "Насколько безопасно — персональные данные пациентов?",
    a: "Данные хранятся на российских серверах. Диалоги не передаются третьим лицам. Политика конфиденциальности соответствует 152-ФЗ. Мы готовы подписать NDA.",
  },
  {
    q: "Как быстро можно запустить?",
    a: "Через 10 минут после регистрации у вас будет рабочий ассистент с вашими данными. Нажмите «Создать бесплатно» — увидите сами.",
  },
]

function FaqItem({ q, a, open, onClick }: { q: string; a: string; open: boolean; onClick: () => void }) {
  return (
    <div
      style={{
        border: "1px solid var(--op-border)",
        borderRadius: 10,
        background: open ? "var(--op-surface-elevated)" : "var(--op-surface)",
        transition: "background 220ms",
        overflow: "hidden",
      }}
    >
      <button
        onClick={onClick}
        aria-expanded={open}
        style={{
          width: "100%",
          background: "transparent",
          border: 0,
          padding: "20px 22px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          textAlign: "left",
          color: "var(--op-text)",
          minHeight: 56,
        }}
      >
        <span
          style={{
            flex: 1,
            fontFamily: "var(--op-font-display)",
            fontSize: 16,
            fontWeight: 500,
            lineHeight: 1.4,
            letterSpacing: "-0.01em",
          }}
        >
          {q}
        </span>
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            border: "1px solid var(--op-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: open ? "var(--op-accent)" : "var(--op-text-secondary)",
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 220ms, color 220ms",
          }}
          aria-hidden="true"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>
      <div style={{ maxHeight: open ? 400 : 0, overflow: "hidden", transition: "max-height 320ms" }}>
        <p
          style={{
            fontFamily: "var(--op-font-body)",
            fontSize: 15,
            color: "var(--op-text-secondary)",
            margin: 0,
            padding: "0 22px 22px",
            lineHeight: 1.6,
          }}
        >
          {a}
        </p>
      </div>
    </div>
  )
}

export default function SaasFaqSection() {
  const [openIndex, setOpenIndex] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "0px" })
  const shouldReduceMotion = useReducedMotion()

  return (
    <section id="faq" style={{ padding: "96px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px,4vw,48px)" }}>
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionIntro code="03" cmd="faq.resolve()" title="Частые вопросы" />
        </motion.div>

        <div
          ref={ref}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            maxWidth: 820,
          }}
        >
          {FAQS.map((faq, i) => (
            <FaqItem
              key={faq.q}
              q={faq.q}
              a={faq.a}
              open={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

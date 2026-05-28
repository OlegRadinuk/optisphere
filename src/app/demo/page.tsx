"use client"

import { useState, useEffect, useLayoutEffect, useRef } from "react"

// ─────────────────────────────────────────────────────────────────────────────
// Демо панели управления клиникой. Полностью статичные данные, без auth и API.
// Цель — дать прокликать продукт и подтолкнуть к покупке.
// ─────────────────────────────────────────────────────────────────────────────

const PRIMARY = "#0D9488"
const PRIMARY_SOFT = "#F0FDFA"
const CONTACT_URL = "/contact"
const PRICE = "10 000 ₽/мес"

type Tab = "overview" | "leads" | "calendar" | "chats" | "doctors"

const ICONS: Record<Tab, React.ReactNode> = {
  overview: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  leads: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  calendar: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  chats: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  doctors: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.3.3 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>,
}

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Обзор" },
  { id: "leads", label: "Клиенты" },
  { id: "calendar", label: "Запись" },
  { id: "chats", label: "Диалоги" },
  { id: "doctors", label: "Врачи" },
]

interface TourStep { tab: Tab; selector?: string; title: string; text: string }
const TOUR: TourStep[] = [
  { tab: "overview", title: "Привет! Давайте покажу за минуту", text: "Это рабочее место клиники: владельцу — контроль и цифры, администратору — меньше рутины. Дальше листайте сами, тут всё кликается." },
  { tab: "overview", selector: "[data-tour='stat-leads']", title: "Владельцу — пульс клиники с утра", text: "Новые пациенты, диалоги, конверсия в запись — цифры собираются сами, без таблиц. Сразу видно: окупается ли реклама и растёт ли поток." },
  { tab: "overview", selector: "[data-tour='night-insight']", title: "Здесь прячутся ваши деньги", text: "Треть обращений приходит ночью и в выходные, когда регистратура не работает. Ассистент отвечает мгновенно и берёт контакт — иначе человек уходит к соседям. Один имплант окупает панель на год вперёд." },
  { tab: "leads", selector: "[data-tour='lead-0']", title: "Администратору — ни одной потерянной заявки", text: "Имя, услуга, телефон и статус в одном списке. Нажал на номер — позвонил. Видно, кто ещё не обработан, — ничего не тонет в мессенджерах и стикерах на мониторе." },
  { tab: "calendar", selector: "[data-tour='calendar']", title: "Запись, которую не страшно вести", text: "Перетащите приём мышкой или коснитесь записи и выберите время — перенос за секунду, без зачёркиваний. Весь день виден сразу, а «+ Запись» добавляет пациента в пару кликов." },
  { tab: "chats", selector: "[data-tour='chat-0']", title: "Вы знаете о пациенте до звонка", text: "Вся переписка с ассистентом сохраняется. Администратор перезванивает, уже зная, что человека волнует и на какую сумму он рассчитывает, — разговор теплее и короче. Нажмите, чтобы раскрыть диалог." },
  { tab: "doctors", selector: "[data-tour='doctor-0']", title: "Врачи и график — под рукой", text: "Кто принимает и в какие дни — настраивается в один тап. Когда график меняется, администратор не путается, на кого записывать. Нажмите на день — он включится или выключится." },
  { tab: "overview", title: "Это будет работать на вас 24/7", text: "У вашей клиники будет так же — свой логотип, свои врачи, реальные пациенты. Владельцу — больше записей и прозрачность, администратору — спокойная смена без хаоса. Запуск за пару дней." },
]

const MoonIcon = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const PlayIcon = ({ size = 15, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0 }}>
    <path d="M8 5v14l11-7z" />
  </svg>
)

const ToothIcon = ({ size = 30, color = PRIMARY }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5.5C10.5 4 8.5 3.5 7 4.2 5 5 4 7 4.5 10c.4 2.3 1 3.8 1.4 6 .3 1.6.5 4 1.6 4 1 0 1.1-1.7 1.4-3.2.3-1.5.6-2.6 1.1-2.6.5 0 .8 1.1 1.1 2.6.3 1.5.4 3.2 1.4 3.2 1.1 0 1.3-2.4 1.6-4 .4-2.2 1-3.7 1.4-6 .5-3-.5-5-2.5-5.8-1.5-.7-3.5-.2-5 1.3z" />
  </svg>
)

// ── Демо-данные ──────────────────────────────────────────────────────────────
const LEADS = [
  { name: "Марина К.", phone: "+7 978 412-08-90", service: "Имплантация", status: "new", when: "сегодня, 23:41", night: true },
  { name: "Алексей Д.", phone: "+7 978 330-55-12", service: "Брекеты", status: "new", when: "сегодня, 21:18", night: true },
  { name: "Ольга П.", phone: "+7 978 760-14-23", service: "Чистка + отбеливание", status: "working", when: "сегодня, 14:02", night: false },
  { name: "Сергей В.", phone: "+7 978 201-77-46", service: "Лечение кариеса", status: "working", when: "вчера, 19:55", night: true },
  { name: "Ирина М.", phone: "+7 978 555-39-01", service: "Коронка", status: "closed", when: "вчера, 11:30", night: false },
  { name: "Дмитрий Л.", phone: "+7 978 188-22-67", service: "Консультация", status: "new", when: "вчера, 22:07", night: true },
]

const STATUS_MAP: Record<string, { label: string; bg: string; color: string; border: string }> = {
  new: { label: "Новый", bg: PRIMARY_SOFT, color: PRIMARY, border: "#99F6E4" },
  working: { label: "В работе", bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  closed: { label: "Закрыт", bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
}

const CHATS = [
  {
    name: "Марина К.", time: "23:41", tag: "Клиент · имплантация",
    msgs: [
      { role: "user", text: "Здравствуйте, сколько стоит имплант?" },
      { role: "bot", text: "Добрый вечер! Имплантация под ключ — от 38 000 ₽ за один имплант, точную сумму назовёт врач после осмотра. Подобрать вам удобное время для бесплатной консультации?" },
      { role: "user", text: "Да, можно на эту неделю" },
      { role: "bot", text: "Отлично. Оставьте, пожалуйста, имя и телефон — администратор позвонит и подтвердит время." },
      { role: "user", text: "Марина, +7 978 412-08-90" },
      { role: "bot", text: "Записал, Марина. Администратор свяжется с вами завтра с 9:00. Хорошего вечера!" },
    ],
  },
  {
    name: "Клиент", time: "21:18", tag: "Клиент · брекеты",
    msgs: [
      { role: "user", text: "брекеты ставите взрослым?" },
      { role: "bot", text: "Да, конечно. Ставим металлические, керамические и элайнеры — для взрослых это обычная практика. Хотите, запишу на консультацию ортодонта?" },
      { role: "user", text: "сколько по времени носить" },
      { role: "bot", text: "В среднем 12–18 месяцев, зависит от случая. Точный план составит ортодонт на первом приёме. Оставите контакт — подберём удобное время?" },
      { role: "user", text: "Алексей, 89783305512" },
      { role: "bot", text: "Спасибо, Алексей! Передал администратору, перезвоним завтра утром." },
    ],
  },
]

const DOCTORS = [
  { name: "Ураков Андрей Владимирович", specialty: "Имплантолог, хирург", days: [1, 1, 1, 1, 1, 0, 0] },
  { name: "Терапевт-стоматолог", specialty: "Лечение кариеса, каналы", days: [1, 1, 1, 1, 1, 1, 0] },
  { name: "Ортодонт", specialty: "Брекеты, элайнеры", days: [1, 0, 1, 0, 1, 0, 0] },
  { name: "Гигиенист", specialty: "Профгигиена, отбеливание", days: [1, 1, 1, 1, 1, 1, 0] },
]
const DAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]

interface Appt { id: number; time: string; dur: number; patient: string; service: string; doctor: string; color: string }
const APPTS: Appt[] = [
  { id: 1, time: "09:00", dur: 30, patient: "Ольга П.", service: "Чистка", doctor: "Гигиенист", color: "#0891b2" },
  { id: 2, time: "10:30", dur: 60, patient: "Сергей В.", service: "Кариес", doctor: "Терапевт", color: "#16a34a" },
  { id: 3, time: "12:00", dur: 60, patient: "Марина К.", service: "Имплант — консультация", doctor: "Ураков А.В.", color: PRIMARY },
  { id: 4, time: "14:30", dur: 45, patient: "Ирина М.", service: "Коронка", doctor: "Ортопед", color: "#9333ea" },
  { id: 5, time: "16:00", dur: 90, patient: "Алексей Д.", service: "Брекеты", doctor: "Ортодонт", color: "#d97706" },
]

const ACTIVITY = [3, 5, 4, 7, 6, 9, 5, 8, 11, 7, 10, 6, 9, 14]

// ─────────────────────────────────────────────────────────────────────────────
export default function DemoPage() {
  const [tab, setTab] = useState<Tab>("overview")
  const [nudge, setNudge] = useState(false)
  const [tourStep, setTourStep] = useState(-1)
  const [bannerOpen, setBannerOpen] = useState(true)
  const bannerRef = useRef<HTMLDivElement>(null)
  const [bannerH, setBannerH] = useState(0)

  // Measure banner so the fixed sidebar/topbar can sit below it (no overlap)
  useLayoutEffect(() => {
    if (!bannerOpen) { setBannerH(0); return }
    const measure = () => setBannerH(bannerRef.current?.offsetHeight ?? 0)
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [bannerOpen])

  // Auto-start tour once per browser
  useEffect(() => {
    try {
      if (!localStorage.getItem("demo-tour-v1")) {
        const t = setTimeout(() => setTourStep(0), 700)
        return () => clearTimeout(t)
      }
    } catch { /* ignore */ }
  }, [])

  // Switch to the tab a tour step belongs to
  useEffect(() => {
    if (tourStep >= 0 && tourStep < TOUR.length) setTab(TOUR[tourStep].tab)
  }, [tourStep])

  const endTour = () => {
    setTourStep(-1)
    try { localStorage.setItem("demo-tour-v1", "1") } catch { /* ignore */ }
  }

  const card: React.CSSProperties = {
    background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14,
    boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.05)",
  }
  const h1: React.CSSProperties = {
    fontFamily: "var(--font-oxanium)", fontSize: 22, fontWeight: 700,
    letterSpacing: "-0.3px", color: "#0F172A", margin: "0 0 4px",
  }
  const sub: React.CSSProperties = { fontSize: 14, color: "#94A3B8", margin: "0 0 20px" }

  return (
    <div style={{ "--banner-h": `${bannerH}px` } as React.CSSProperties}>
      {/* ── Sales banner ── */}
      {bannerOpen && (
        <div ref={bannerRef} style={{
          position: "sticky", top: 0, zIndex: 120,
          background: "linear-gradient(135deg, #0D9488 0%, #0891B2 100%)",
          color: "#fff", padding: "10px 48px 10px 16px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap",
          textAlign: "center",
        }}>
          <span style={{ fontSize: 13.5, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 7 }}>
            <PlayIcon size={14} color="#fff" />
            Это <b>демо</b>. У вашей клиники будет так же — со своим логотипом и реальными заявками пациентов.
          </span>
          <a href={CONTACT_URL} style={{
            background: "#fff", color: PRIMARY, fontWeight: 700, fontSize: 13,
            padding: "6px 16px", borderRadius: 8, textDecoration: "none", whiteSpace: "nowrap",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}>
            Подключить — {PRICE} →
          </a>
          <button onClick={() => setBannerOpen(false)} aria-label="Закрыть" style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.18)", border: "none", color: "#fff",
            width: 26, height: 26, borderRadius: "50%", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
      )}

      {/* ── Sidebar (desktop) ── */}
      <div className="demo-sidebar">
        <div style={{ padding: "20px 16px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#0D9488,#0F766E)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(13,148,136,0.35)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5.5C10.5 4 8.5 3.5 7 4.2 5 5 4 7 4.5 10c.4 2.3 1 3.8 1.4 6 .3 1.6.5 4 1.6 4 1 0 1.1-1.7 1.4-3.2.3-1.5.6-2.6 1.1-2.6.5 0 .8 1.1 1.1 2.6.3 1.5.4 3.2 1.4 3.2 1.1 0 1.3-2.4 1.6-4 .4-2.2 1-3.7 1.4-6 .5-3-.5-5-2.5-5.8-1.5-.7-3.5-.2-5 1.3z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}>Ваша клиника</div>
            <div style={{ fontSize: 11, color: "#94A3B8" }}>Демо-панель</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 13px",
                borderRadius: 10, border: "none", textAlign: "left", cursor: "pointer",
                background: active ? PRIMARY_SOFT : "transparent",
                color: active ? PRIMARY : "#475569",
                fontWeight: active ? 600 : 400, fontSize: 14, fontFamily: "inherit",
                borderLeft: active ? `3px solid ${PRIMARY}` : "3px solid transparent",
              }}>
                <span style={{ display: "flex" }}>{ICONS[t.id]}</span>{t.label}
              </button>
            )
          })}
        </div>
        <div style={{ padding: 16 }}>
          <a href={CONTACT_URL} style={{
            display: "block", textAlign: "center", background: PRIMARY, color: "#fff",
            fontWeight: 600, fontSize: 13, padding: "11px 0", borderRadius: 10, textDecoration: "none",
            boxShadow: "0 4px 12px rgba(13,148,136,0.3)",
          }}>
            Хочу себе такую →
          </a>
        </div>
      </div>

      {/* ── Mobile topbar ── */}
      <header className="demo-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#0D9488,#0F766E)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5.5C10.5 4 8.5 3.5 7 4.2 5 5 4 7 4.5 10c.4 2.3 1 3.8 1.4 6 .3 1.6.5 4 1.6 4 1 0 1.1-1.7 1.4-3.2.3-1.5.6-2.6 1.1-2.6.5 0 .8 1.1 1.1 2.6.3 1.5.4 3.2 1.4 3.2 1.1 0 1.3-2.4 1.6-4 .4-2.2 1-3.7 1.4-6 .5-3-.5-5-2.5-5.8-1.5-.7-3.5-.2-5 1.3z"/></svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Ваша клиника</span>
        </div>
        <span style={{ background: PRIMARY, color: "#fff", borderRadius: 9999, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>демо</span>
      </header>

      {/* ── Main ── */}
      <main className="demo-main">
        {tab === "overview" && <Overview card={card} h1={h1} sub={sub} />}
        {tab === "leads" && <Leads card={card} h1={h1} sub={sub} onAction={() => setNudge(true)} />}
        {tab === "calendar" && <Calendar card={card} h1={h1} sub={sub} />}
        {tab === "chats" && <Chats card={card} h1={h1} sub={sub} />}
        {tab === "doctors" && <Doctors card={card} h1={h1} sub={sub} />}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="demo-bottomnav">
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1,
              padding: "8px 2px", border: "none", background: "none", cursor: "pointer",
              color: active ? PRIMARY : "#8b96a5", position: "relative", fontFamily: "inherit",
            }}>
              {ICONS[t.id]}
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{t.label}</span>
              {active && <span style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 28, height: 2, background: PRIMARY, borderRadius: 2 }} />}
            </button>
          )
        })}
      </nav>

      {/* ── Floating CTA ── */}
      <a href={CONTACT_URL} className="demo-fab" style={{
        position: "fixed", right: 18, bottom: 90, zIndex: 130,
        background: "linear-gradient(135deg,#0D9488,#0891B2)", color: "#fff",
        padding: "12px 18px", borderRadius: 9999, textDecoration: "none",
        fontWeight: 700, fontSize: 14, boxShadow: "0 6px 20px rgba(13,148,136,0.4)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        Подключить →
      </a>

      {/* ── Help / replay tour ── */}
      <button onClick={() => setTourStep(0)} aria-label="Запустить обучение" className="demo-help" style={{
        width: 44, height: 44, borderRadius: "50%", border: "1px solid #E2E8F0",
        background: "#fff", color: PRIMARY, cursor: "pointer",
        boxShadow: "0 4px 14px rgba(15,23,42,0.12)", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </button>

      {/* ── Onboarding tour ── */}
      {tourStep >= 0 && (
        <TourOverlay
          step={TOUR[tourStep]}
          index={tourStep}
          total={TOUR.length}
          onPrev={() => setTourStep((s) => Math.max(0, s - 1))}
          onNext={() => { if (tourStep + 1 >= TOUR.length) endTour(); else setTourStep(tourStep + 1) }}
          onClose={endTour}
        />
      )}

      {/* ── Nudge modal ── */}
      {nudge && (
        <div onClick={() => setNudge(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,40,70,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ ...card, maxWidth: 380, padding: 28, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: PRIMARY_SOFT, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <ToothIcon size={30} />
            </div>
            <h3 style={{ fontFamily: "var(--font-oxanium)", fontSize: 19, fontWeight: 700, margin: "0 0 8px", color: "#0F172A" }}>Это демо-режим</h3>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.5, margin: "0 0 20px" }}>
              Здесь изменения не сохраняются. В вашей версии всё по-настоящему: реальные заявки пациентов, ваши врачи, ваше расписание — и всё это работает 24/7.
            </p>
            <a href={CONTACT_URL} style={{ display: "block", background: PRIMARY, color: "#fff", fontWeight: 600, fontSize: 15, padding: "12px 0", borderRadius: 10, textDecoration: "none", marginBottom: 10, boxShadow: "0 4px 12px rgba(13,148,136,0.3)" }}>
              Подключить за {PRICE}
            </a>
            <button onClick={() => setNudge(false)} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              Продолжить смотреть демо
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.5 } }
        .demo-sidebar {
          position: fixed; top: var(--banner-h, 0px); left: 0; height: calc(100vh - var(--banner-h, 0px)); width: 220px;
          background: #fff; border-right: 1px solid #E2E8F0; display: flex; flex-direction: column;
          z-index: 110; box-shadow: 2px 0 16px rgba(15,23,42,0.05);
          transition: top 0.2s ease, height 0.2s ease;
        }
        .demo-topbar { display: none; }
        .demo-bottomnav { display: none; }
        .demo-main { margin-left: 220px; padding: 28px; }
        .demo-help { position: fixed; right: 18px; bottom: 18px; z-index: 130; }
        @media (max-width: 767px) {
          .demo-sidebar { display: none; }
          .demo-fab { display: none !important; }
          .demo-help { bottom: calc(74px + env(safe-area-inset-bottom)); }
          .demo-topbar {
            display: flex; align-items: center; justify-content: space-between;
            position: sticky; top: var(--banner-h, 0px); height: 52px; background: #fff;
            border-bottom: 1px solid #E2E8F0; padding: 0 16px; z-index: 100;
          }
          .demo-main { margin-left: 0; padding: 16px 16px 90px; }
          .demo-bottomnav {
            display: flex; position: fixed; bottom: 0; left: 0; right: 0;
            background: #fff; border-top: 1px solid #E2E8F0; z-index: 100;
            padding-bottom: env(safe-area-inset-bottom);
          }
          .demo-stats { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}

// ── Sections ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{
      background: accent ? "linear-gradient(135deg,#0D9488,#0891B2)" : "#fff",
      border: accent ? "none" : "1px solid #E2E8F0", borderRadius: 14, padding: "18px 20px",
      boxShadow: accent ? "0 6px 20px rgba(13,148,136,0.28)" : "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.05)",
    }}>
      <div style={{ fontSize: 12, color: accent ? "rgba(255,255,255,0.8)" : "#94A3B8", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-oxanium)", fontSize: 30, fontWeight: 700, letterSpacing: "-0.8px", color: accent ? "#fff" : "#0F172A", lineHeight: 1 }}>{value}</div>
    </div>
  )
}

function Overview({ card, h1, sub }: { card: React.CSSProperties; h1: React.CSSProperties; sub: React.CSSProperties }) {
  const max = Math.max(...ACTIVITY)
  return (
    <div>
      <h1 style={h1}>Обзор</h1>
      <p style={sub}>Что происходит в клинике прямо сейчас</p>

      <div className="demo-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        <div data-tour="stat-leads"><StatCard label="Новых клиентов" value="14" accent /></div>
        <StatCard label="Всего за месяц" value="87" />
        <StatCard label="Диалогов сегодня" value="9" />
        <StatCard label="Конверсия в заявку" value="19%" />
      </div>

      {/* Highlight callout — продающий инсайт */}
      <div data-tour="night-insight" style={{ ...card, padding: "16px 20px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center", background: PRIMARY_SOFT, border: "1px solid #99F6E4" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <MoonIcon size={20} color={PRIMARY} />
        </div>
        <div style={{ fontSize: 14, color: "#0F766E", lineHeight: 1.5 }}>
          <b>4 из 14 заявок пришли ночью и в выходные</b>, когда регистратура не работала. Их поймал AI-ассистент — иначе эти пациенты ушли бы к конкурентам.
        </div>
      </div>

      <div style={{ ...card, padding: "20px 24px" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 16 }}>Заявки за 14 дней</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 90 }}>
          {ACTIVITY.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: "100%", height: Math.max(4, Math.round((v / max) * 74)), background: i === ACTIVITY.length - 1 ? PRIMARY : "#99F6E4", borderRadius: "3px 3px 0 0" }} title={`${v} заявок`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Leads({ card, h1, sub, onAction }: { card: React.CSSProperties; h1: React.CSSProperties; sub: React.CSSProperties; onAction: () => void }) {
  return (
    <div>
      <h1 style={h1}>Клиенты</h1>
      <p style={sub}>Каждая заявка от пациента — с контактом и услугой</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {LEADS.map((l, i) => {
          const s = STATUS_MAP[l.status]
          return (
            <div key={i} data-tour={i === 0 ? "lead-0" : undefined} style={{ ...card, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#0F172A" }}>{l.name}</span>
                    {l.night && <span style={{ fontSize: 11, background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa", borderRadius: 6, padding: "2px 7px", display: "inline-flex", alignItems: "center", gap: 4 }}><MoonIcon size={11} color="#c2410c" />пока вы спали</span>}
                  </div>
                  <div style={{ fontSize: 13, color: "#64748B", marginTop: 3 }}>{l.service}</div>
                  <a href="#" onClick={(e) => { e.preventDefault(); onAction() }} style={{ fontSize: 14, color: PRIMARY, fontWeight: 600, textDecoration: "none", display: "inline-block", marginTop: 6 }}>{l.phone}</a>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <button onClick={onAction} style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 9999, background: s.bg, color: s.color, border: `1px solid ${s.border}`, cursor: "pointer", fontFamily: "inherit" }}>{s.label}</button>
                  <span style={{ fontSize: 11, color: "#94A3B8", whiteSpace: "nowrap" }}>{l.when}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const CAL_START = 9   // 09:00
const CAL_END = 19    // 19:00
const SLOT_H = 56     // px per hour

function toMin(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m }
function toTime(min: number) { return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}` }

let demoApptSeq = 100

const DEFAULT_HINT = "Перетащите запись мышкой или коснитесь её и выберите время — расписание обновится"

function Calendar({ card, h1, sub }: { card: React.CSSProperties; h1: React.CSSProperties; sub: React.CSSProperties }) {
  const [appts, setAppts] = useState<Appt[]>(APPTS)
  const [dragId, setDragId] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [hint, setHint] = useState(DEFAULT_HINT)

  const hours = Array.from({ length: CAL_END - CAL_START }, (_, i) => CAL_START + i)
  const totalH = (CAL_END - CAL_START) * SLOT_H

  function moveTo(id: number, hour: number, half: boolean) {
    const newMin = hour * 60 + (half ? 30 : 0)
    setAppts((prev) => prev.map((a) => a.id === id ? { ...a, time: toTime(newMin) } : a))
    setSelectedId(null)
    setHint("Готово — запись перенесена. В вашей версии это сразу видит регистратура.")
  }

  // Tap interaction (works on touch where drag-n-drop не работает):
  // 1-й тап по записи — выбрать; тап по времени — перенести.
  function tapAppt(id: number) {
    setSelectedId((cur) => {
      const next = cur === id ? null : id
      setHint(next != null ? "Теперь коснитесь нужного времени в расписании" : DEFAULT_HINT)
      return next
    })
  }
  function tapSlot(hour: number, half: boolean) {
    if (selectedId != null) moveTo(selectedId, hour, half)
  }

  function addDemo() {
    const used = new Set(appts.map((a) => a.time))
    let slot = "11:30"
    for (let h = CAL_START; h < CAL_END; h++) {
      for (const m of ["00", "30"]) {
        const t = `${String(h).padStart(2, "0")}:${m}`
        if (!used.has(t)) { slot = t; break }
      }
    }
    setAppts((prev) => [...prev, { id: ++demoApptSeq, time: slot, dur: 30, patient: "Новый пациент", service: "Консультация", doctor: "Врач", color: "#0d9488" }])
    setHint("Запись добавлена. Перетащите её или коснитесь, затем выберите время.")
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={h1}>Запись</h1>
          <p style={sub}>Расписание приёмов на сегодня</p>
        </div>
        <button data-tour="add-appt" onClick={addDemo} style={{ background: PRIMARY, color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(13,148,136,0.3)" }}>+ Запись</button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 12.5, color: "#0F766E", background: PRIMARY_SOFT, border: "1px solid #99F6E4", borderRadius: 8, padding: "8px 12px" }}>
        <MoonIcon size={14} color={PRIMARY} />
        <span style={{ color: "#475569" }}>{hint}</span>
      </div>

      <div data-tour="calendar" style={{ ...card, padding: "8px 8px 8px 0", overflow: "hidden" }}>
        <div style={{ position: "relative", height: totalH }}>
          {/* hour grid + drop zones */}
          {hours.map((h) => (
            <div key={h}>
              {[0, 1].map((half) => (
                <div
                  key={half}
                  onDragOver={(e) => { e.preventDefault(); (e.currentTarget as HTMLElement).style.background = "rgba(13,148,136,0.07)" }}
                  onDragLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "" }}
                  onDrop={(e) => { e.preventDefault(); (e.currentTarget as HTMLElement).style.background = ""; if (dragId != null) moveTo(dragId, h, half === 1) }}
                  onClick={() => tapSlot(h, half === 1)}
                  style={{ position: "absolute", left: 56, right: 8, top: (h - CAL_START) * SLOT_H + half * (SLOT_H / 2), height: SLOT_H / 2, borderTop: half === 0 ? "1px solid #F1F5F9" : "1px dashed #F1F5F9", background: selectedId != null ? "rgba(13,148,136,0.04)" : undefined, cursor: selectedId != null ? "pointer" : "default" }}
                />
              ))}
              <span style={{ position: "absolute", left: 10, top: (h - CAL_START) * SLOT_H + 3, fontSize: 11, color: "#94A3B8", fontFamily: "var(--font-oxanium)" }}>{String(h).padStart(2, "0")}:00</span>
            </div>
          ))}
          {/* appointments */}
          {appts.map((a) => {
            const top = ((toMin(a.time) - CAL_START * 60) / 60) * SLOT_H
            const height = Math.max(26, (a.dur / 60) * SLOT_H - 3)
            const dragging = dragId === a.id
            const selected = selectedId === a.id
            return (
              <div
                key={a.id}
                draggable
                onDragStart={() => setDragId(a.id)}
                onDragEnd={() => setDragId(null)}
                onClick={() => tapAppt(a.id)}
                style={{
                  position: "absolute", left: 56, right: 8, top, height,
                  background: `${a.color}14`,
                  border: `1.5px solid ${a.color}`, borderLeft: `3px solid ${a.color}`,
                  boxShadow: selected ? `0 0 0 2px #fff, 0 0 0 4px ${a.color}` : undefined,
                  borderRadius: 8, padding: "4px 10px", boxSizing: "border-box", cursor: "pointer",
                  opacity: dragging ? 0.4 : 1, overflow: "hidden", userSelect: "none",
                  transition: "box-shadow 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontFamily: "var(--font-oxanium)", fontSize: 12.5, fontWeight: 700, color: a.color }}>{a.time}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.patient}</span>
                </div>
                {height > 34 && <div style={{ fontSize: 11.5, color: "#64748B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.service} · {a.doctor}</div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Chats({ card, h1, sub }: { card: React.CSSProperties; h1: React.CSSProperties; sub: React.CSSProperties }) {
  const [open, setOpen] = useState(0)
  return (
    <div>
      <h1 style={h1}>Диалоги</h1>
      <p style={sub}>Переписка пациентов с AI-ассистентом — видно, что человека волновало</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {CHATS.map((c, i) => (
          <div key={i} data-tour={i === 0 ? "chat-0" : undefined} style={{ ...card, overflow: "hidden" }}>
            <button onClick={() => setOpen(open === i ? -1 : i)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "14px 16px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit" }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{c.name}</div>
                <div style={{ fontSize: 12, color: PRIMARY, marginTop: 2 }}>{c.tag}</div>
              </div>
              <span style={{ fontSize: 12, color: "#94A3B8" }}>{c.time}</span>
            </button>
            {open === i && (
              <div style={{ padding: "4px 16px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                {c.msgs.map((m, j) => {
                  const isBot = m.role === "bot"
                  return (
                    <div key={j} style={{ alignSelf: isBot ? "flex-end" : "flex-start", maxWidth: "85%", background: isBot ? PRIMARY_SOFT : "#F1F5F9", border: `1px solid ${isBot ? "#99F6E4" : "#E2E8F0"}`, borderRadius: 12, padding: "8px 12px", fontSize: 13.5, color: "#0F172A", lineHeight: 1.45 }}>
                      {m.text}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12.5, color: "#94A3B8", marginTop: 14, textAlign: "center" }}>
        ↑ нажмите на диалог, чтобы раскрыть переписку
      </p>
    </div>
  )
}

function Doctors({ card, h1, sub }: { card: React.CSSProperties; h1: React.CSSProperties; sub: React.CSSProperties }) {
  const [docs, setDocs] = useState(DOCTORS.map((d) => ({ ...d, days: [...d.days] })))
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: "", specialty: "" })
  const toggle = (di: number, dj: number) =>
    setDocs((prev) => prev.map((d, i) => i === di ? { ...d, days: d.days.map((v, j) => j === dj ? (v ? 0 : 1) : v) } : d))
  function add() {
    if (!form.name.trim()) return
    setDocs((prev) => [...prev, { name: form.name.trim(), specialty: form.specialty.trim() || "Врач", days: [1, 1, 1, 1, 1, 0, 0] }])
    setForm({ name: "", specialty: "" })
    setAdding(false)
  }
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={h1}>Врачи</h1>
          <p style={sub}>Расписание по дням недели — нажмите на день, чтобы включить/выключить</p>
        </div>
        <button onClick={() => setAdding(true)} style={{ background: PRIMARY, color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(13,148,136,0.3)", whiteSpace: "nowrap" }}>+ Врач</button>
      </div>

      {adding && (
        <div onClick={() => setAdding(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,40,70,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ ...card, width: 380, maxWidth: "100%", padding: 24 }}>
            <h2 style={{ fontFamily: "var(--font-oxanium)", fontSize: 18, fontWeight: 700, color: "#0F172A", margin: "0 0 16px" }}>Новый врач</h2>
            <input autoFocus value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="ФИО врача"
              style={{ width: "100%", border: "1px solid #CBD5E1", borderRadius: 8, padding: "10px 12px", fontSize: 16, outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 10 }} />
            <input value={form.specialty} onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))} placeholder="Специальность"
              style={{ width: "100%", border: "1px solid #CBD5E1", borderRadius: 8, padding: "10px 12px", fontSize: 16, outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 18 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={add} disabled={!form.name.trim()} style={{ flex: 1, padding: "12px 0", background: PRIMARY, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: form.name.trim() ? "pointer" : "not-allowed", opacity: form.name.trim() ? 1 : 0.6, fontFamily: "inherit" }}>Добавить</button>
              <button onClick={() => setAdding(false)} style={{ padding: "12px 18px", background: "#fff", color: "#475569", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
        {docs.map((d, i) => (
          <div key={i} data-tour={i === 0 ? "doctor-0" : undefined} style={{ ...card, padding: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#0F172A" }}>{d.name}</div>
            <div style={{ fontSize: 13, color: "#64748B", marginBottom: 12 }}>{d.specialty}</div>
            <div style={{ display: "flex", gap: 6 }}>
              {DAY_LABELS.map((lbl, j) => (
                <button key={j} onClick={() => toggle(i, j)} style={{
                  width: 34, height: 34, borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit",
                  fontSize: 11, fontWeight: 600, transition: "background 120ms",
                  background: d.days[j] ? PRIMARY : "#eef3f8",
                  color: d.days[j] ? "#fff" : "#94A3B8",
                }}>{lbl}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Onboarding tour overlay ──────────────────────────────────────────────────
interface Box { top: number; left: number; width: number; height: number }

function TourOverlay({ step, index, total, onPrev, onNext, onClose }: {
  step: TourStep; index: number; total: number; onPrev: () => void; onNext: () => void; onClose: () => void
}) {
  const [box, setBox] = useState<Box | null>(null)

  useLayoutEffect(() => {
    let cancelled = false
    let tries = 0
    setBox(null)

    const read = (el: HTMLElement) => {
      const r = el.getBoundingClientRect()
      if (!cancelled) setBox({ top: r.top, left: r.left, width: r.width, height: r.height })
    }

    const find = () => {
      if (cancelled) return
      if (!step.selector) { setBox(null); return }
      const el = document.querySelector(step.selector) as HTMLElement | null
      if (el) {
        el.scrollIntoView({ behavior: "auto", block: "center" })
        // Measure on the next frame (no artificial delay) so the spotlight appears instantly
        requestAnimationFrame(() => !cancelled && read(el))
        const onMove = () => { const cur = document.querySelector(step.selector!) as HTMLElement | null; if (cur) read(cur) }
        window.addEventListener("scroll", onMove, true)
        window.addEventListener("resize", onMove)
        ;(find as unknown as { cleanup?: () => void }).cleanup = () => {
          window.removeEventListener("scroll", onMove, true)
          window.removeEventListener("resize", onMove)
        }
      } else if (tries < 15) {
        tries++
        setTimeout(find, 60)
      } else {
        setBox(null)
      }
    }
    find()
    return () => {
      cancelled = true
      ;(find as unknown as { cleanup?: () => void }).cleanup?.()
    }
  }, [step])

  const PAD = 6
  const isLast = index === total - 1
  const isFirst = index === 0

  // Tooltip card content
  const tip = (
    <div style={{
      background: "#fff", borderRadius: 14, padding: 18, width: 300, maxWidth: "calc(100vw - 32px)",
      boxShadow: "0 12px 40px rgba(15,23,42,0.25)", pointerEvents: "auto",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontFamily: "var(--font-oxanium)", fontSize: 11, fontWeight: 700, color: PRIMARY, letterSpacing: "0.5px" }}>
          ШАГ {index + 1} / {total}
        </span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: 18, cursor: "pointer", lineHeight: 1, fontFamily: "inherit" }}>×</button>
      </div>
      <h3 style={{ fontFamily: "var(--font-oxanium)", fontSize: 17, fontWeight: 700, color: "#0F172A", margin: "0 0 6px" }}>{step.title}</h3>
      <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.5, margin: "0 0 16px" }}>{step.text}</p>
      {isLast ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <a href={CONTACT_URL} style={{ display: "block", textAlign: "center", background: PRIMARY, color: "#fff", fontWeight: 600, fontSize: 14, padding: "11px 0", borderRadius: 10, textDecoration: "none", boxShadow: "0 4px 12px rgba(13,148,136,0.3)" }}>
            Подключить за {PRICE}
          </a>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Закрыть</button>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Пропустить</button>
          <div style={{ display: "flex", gap: 8 }}>
            {!isFirst && <button onClick={onPrev} style={{ background: "#F1F5F9", border: "none", color: "#475569", fontSize: 13, fontWeight: 600, padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>Назад</button>}
            <button onClick={onNext} style={{ background: PRIMARY, border: "none", color: "#fff", fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>Далее</button>
          </div>
        </div>
      )}
    </div>
  )

  // Centered (no target)
  if (!box) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(15,40,70,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        {tip}
      </div>
    )
  }

  // Tooltip placement: below the spotlight if room, else above
  const spotTop = box.top - PAD, spotLeft = box.left - PAD
  const spotW = box.width + PAD * 2, spotH = box.height + PAD * 2
  const below = spotTop + spotH + 16 + 220 < window.innerHeight
  const tipTop = below ? spotTop + spotH + 12 : Math.max(12, spotTop - 12 - 220)
  let tipLeft = spotLeft + spotW / 2 - 150
  tipLeft = Math.max(12, Math.min(tipLeft, window.innerWidth - 312))

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, pointerEvents: "none" }}>
      {/* Spotlight with dimmed surroundings (no animation — sterile, instant) */}
      <div style={{
        position: "fixed", top: spotTop, left: spotLeft, width: spotW, height: spotH,
        borderRadius: 12, boxShadow: "0 0 0 3px rgba(13,148,136,0.9), 0 0 0 9999px rgba(15,40,70,0.55)",
        pointerEvents: "none",
      }} />
      <div style={{ position: "fixed", top: tipTop, left: tipLeft }}>{tip}</div>
    </div>
  )
}

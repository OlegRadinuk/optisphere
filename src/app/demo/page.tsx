"use client"

import { useState } from "react"

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
  doctors: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 0h4m-4 0H8"/></svg>,
}

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Обзор" },
  { id: "leads", label: "Лиды" },
  { id: "calendar", label: "Запись" },
  { id: "chats", label: "Диалоги" },
  { id: "doctors", label: "Врачи" },
]

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
    name: "Марина К.", time: "23:41", tag: "Лид · имплантация",
    msgs: [
      { role: "user", text: "Здравствуйте, сколько стоит имплант?" },
      { role: "bot", text: "Добрый вечер! Имплантация под ключ — от 38 000 ₽ за один имплант, точную сумму назовёт врач после осмотра. Подобрать вам удобное время для бесплатной консультации?" },
      { role: "user", text: "Да, можно на эту неделю" },
      { role: "bot", text: "Отлично. Оставьте, пожалуйста, имя и телефон — администратор позвонит и подтвердит время." },
      { role: "user", text: "Марина, +7 978 412-08-90" },
      { role: "bot", text: "Записал, Марина. Администратор свяжется с вами завтра с 9:00. Хорошего вечера! 🦷" },
    ],
  },
  {
    name: "Гость", time: "21:18", tag: "Лид · брекеты",
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

const APPTS = [
  { time: "09:00", patient: "Ольга П.", service: "Чистка", doctor: "Гигиенист", color: "#0891b2" },
  { time: "10:30", patient: "Сергей В.", service: "Кариес", doctor: "Терапевт", color: "#16a34a" },
  { time: "12:00", patient: "Марина К.", service: "Имплант — консультация", doctor: "Ураков А.В.", color: PRIMARY },
  { time: "14:30", patient: "Ирина М.", service: "Коронка", doctor: "Ортопед", color: "#9333ea" },
  { time: "16:00", patient: "Алексей Д.", service: "Брекеты", doctor: "Ортодонт", color: "#d97706" },
]

const ACTIVITY = [3, 5, 4, 7, 6, 9, 5, 8, 11, 7, 10, 6, 9, 14]

// ─────────────────────────────────────────────────────────────────────────────
export default function DemoPage() {
  const [tab, setTab] = useState<Tab>("overview")
  const [nudge, setNudge] = useState(false)

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
    <div>
      {/* ── Sales banner ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 120,
        background: "linear-gradient(135deg, #0D9488 0%, #0891B2 100%)",
        color: "#fff", padding: "10px 16px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap",
        textAlign: "center",
      }}>
        <span style={{ fontSize: 13.5, fontWeight: 500 }}>
          🎬 Это <b>демо</b>. У вашей клиники будет так же — со своим логотипом и реальными заявками пациентов.
        </span>
        <a href={CONTACT_URL} style={{
          background: "#fff", color: PRIMARY, fontWeight: 700, fontSize: 13,
          padding: "6px 16px", borderRadius: 8, textDecoration: "none", whiteSpace: "nowrap",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}>
          Подключить — {PRICE} →
        </a>
      </div>

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
        {tab === "calendar" && <Calendar card={card} h1={h1} sub={sub} onAction={() => setNudge(true)} />}
        {tab === "chats" && <Chats card={card} h1={h1} sub={sub} />}
        {tab === "doctors" && <Doctors card={card} h1={h1} sub={sub} onAction={() => setNudge(true)} />}
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

      {/* ── Nudge modal ── */}
      {nudge && (
        <div onClick={() => setNudge(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,40,70,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ ...card, maxWidth: 380, padding: 28, textAlign: "center" }}>
            <div style={{ fontSize: 38, marginBottom: 8 }}>🦷</div>
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
          position: fixed; top: 0; left: 0; height: 100vh; width: 220px;
          background: #fff; border-right: 1px solid #E2E8F0; display: flex; flex-direction: column;
          z-index: 110; box-shadow: 2px 0 16px rgba(15,23,42,0.05); padding-top: 0;
        }
        .demo-topbar { display: none; }
        .demo-bottomnav { display: none; }
        .demo-main { margin-left: 220px; padding: 28px; min-height: calc(100vh - 40px); }
        @media (max-width: 767px) {
          .demo-sidebar { display: none; }
          .demo-fab { display: none !important; }
          .demo-topbar {
            display: flex; align-items: center; justify-content: space-between;
            position: sticky; top: 40px; height: 52px; background: #fff;
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
        <StatCard label="Новых лидов" value="14" accent />
        <StatCard label="Всего за месяц" value="87" />
        <StatCard label="Диалогов сегодня" value="9" />
        <StatCard label="Конверсия в заявку" value="19%" />
      </div>

      {/* Highlight callout — продающий инсайт */}
      <div style={{ ...card, padding: "16px 20px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center", background: PRIMARY_SOFT, border: "1px solid #99F6E4" }}>
        <div style={{ fontSize: 26 }}>💤</div>
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
      <h1 style={h1}>Лиды</h1>
      <p style={sub}>Каждая заявка от пациента — с контактом и услугой</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {LEADS.map((l, i) => {
          const s = STATUS_MAP[l.status]
          return (
            <div key={i} style={{ ...card, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#0F172A" }}>{l.name}</span>
                    {l.night && <span style={{ fontSize: 11, background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa", borderRadius: 6, padding: "1px 7px" }}>💤 пока вы спали</span>}
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

function Calendar({ card, h1, sub, onAction }: { card: React.CSSProperties; h1: React.CSSProperties; sub: React.CSSProperties; onAction: () => void }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={h1}>Запись</h1>
          <p style={sub}>Расписание приёмов на сегодня</p>
        </div>
        <button onClick={onAction} style={{ background: PRIMARY, color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(13,148,136,0.3)" }}>+ Запись</button>
      </div>
      <div style={{ ...card, padding: 8 }}>
        {APPTS.map((a, i) => (
          <button key={i} onClick={onAction} style={{
            display: "flex", alignItems: "stretch", gap: 12, width: "100%", textAlign: "left",
            padding: "12px 12px", border: "none", borderBottom: i < APPTS.length - 1 ? "1px solid #F1F5F9" : "none",
            background: "transparent", cursor: "pointer", borderRadius: 8, fontFamily: "inherit",
          }}>
            <div style={{ fontFamily: "var(--font-oxanium)", fontSize: 15, fontWeight: 700, color: "#0F172A", width: 52, flexShrink: 0 }}>{a.time}</div>
            <div style={{ width: 3, borderRadius: 2, background: a.color, flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{a.patient}</div>
              <div style={{ fontSize: 12.5, color: "#64748B" }}>{a.service} · {a.doctor}</div>
            </div>
          </button>
        ))}
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
          <div key={i} style={{ ...card, overflow: "hidden" }}>
            <button onClick={() => setOpen(open === i ? -1 : i)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "14px 16px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit" }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{c.name}</div>
                <div style={{ fontSize: 12, color: PRIMARY, marginTop: 2 }}>{c.tag}</div>
              </div>
              <span style={{ fontSize: 12, color: "#94A3B8" }}>{c.time}</span>
            </button>
            {open === i && (
              <div style={{ padding: "4px 16px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                {c.msgs.map((m, j) => (
                  <div key={j} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%", background: m.role === "user" ? "#F1F5F9" : PRIMARY_SOFT, border: `1px solid ${m.role === "user" ? "#E2E8F0" : "#99F6E4"}`, borderRadius: 12, padding: "8px 12px", fontSize: 13.5, color: "#0F172A", lineHeight: 1.45 }}>
                    {m.text}
                  </div>
                ))}
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

function Doctors({ card, h1, sub, onAction }: { card: React.CSSProperties; h1: React.CSSProperties; sub: React.CSSProperties; onAction: () => void }) {
  return (
    <div>
      <h1 style={h1}>Врачи</h1>
      <p style={sub}>Расписание по дням недели</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {DOCTORS.map((d, i) => (
          <div key={i} style={{ ...card, padding: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#0F172A" }}>{d.name}</div>
            <div style={{ fontSize: 13, color: "#64748B", marginBottom: 12 }}>{d.specialty}</div>
            <div style={{ display: "flex", gap: 6 }}>
              {DAY_LABELS.map((lbl, j) => (
                <button key={j} onClick={onAction} style={{
                  width: 34, height: 34, borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit",
                  fontSize: 11, fontWeight: 600,
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

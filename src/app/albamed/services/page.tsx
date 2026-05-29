"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface Service {
  id: number
  name: string
  category: string
  price: string
  active: number
}

const ORANGE = "#f47920"

const fieldInput: React.CSSProperties = {
  width: "100%", border: "1px solid #d8d8d8", borderRadius: 8, padding: "10px 12px",
  fontSize: 16, outline: "none", fontFamily: "inherit", color: "#1a1a1a", boxSizing: "border-box", background: "#fff",
}
const fieldLabel: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 5, fontSize: 12, fontWeight: 600, color: "#777" }

type FormState = { id: number; name: string; category: string; price: string } | null

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [form, setForm] = useState<FormState>(null) // id===0 -> новая
  const [saving, setSaving] = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async (search: string) => {
    setLoading(true); setError(null)
    try {
      const r = await fetch(`/api/albamed/services?search=${encodeURIComponent(search)}`)
      if (!r.ok) throw new Error("Ошибка загрузки")
      const d = await r.json()
      setServices(d.services ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки")
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load("") }, [load])

  function onSearch(v: string) {
    setQuery(v)
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => load(v), 300)
  }

  async function save() {
    if (!form || !form.name.trim()) return
    setSaving(true)
    try {
      if (form.id === 0) {
        await fetch("/api/albamed/services", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, category: form.category, price: form.price }),
        })
      } else {
        await fetch("/api/albamed/services", {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: form.id, name: form.name, category: form.category, price: form.price }),
        })
      }
      setForm(null)
      await load(query)
    } finally { setSaving(false) }
  }

  async function remove(id: number) {
    await fetch(`/api/albamed/services?id=${id}`, { method: "DELETE" })
    setForm(null)
    await load(query)
  }

  // группировка по категориям
  const groups: { cat: string; items: Service[] }[] = []
  const byCat = new Map<string, Service[]>()
  for (const s of services) {
    const c = s.category || "Без категории"
    if (!byCat.has(c)) byCat.set(c, [])
    byCat.get(c)!.push(s)
  }
  for (const [cat, items] of byCat) groups.push({ cat, items })

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", margin: "0 0 4px" }}>Услуги</h1>
          <p style={{ fontSize: 14, color: "#999", margin: 0 }}>Прайс клиники — поиск, цены, редактирование</p>
        </div>
        <button onClick={() => setForm({ id: 0, name: "", category: "", price: "" })}
          style={{ background: ORANGE, color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(244,121,32,0.3)", whiteSpace: "nowrap", minHeight: 44 }}>
          + Услуга
        </button>
      </div>

      {/* Поиск */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#bbb" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input value={query} onChange={(e) => onSearch(e.target.value)} placeholder="Поиск услуги или направления…"
          style={{ width: "100%", border: "1px solid #e8e8e8", borderRadius: 8, padding: "10px 12px 10px 36px", fontSize: 16, outline: "none", fontFamily: "inherit", color: "#1a1a1a", boxSizing: "border-box", background: "#fff" }} />
      </div>

      {error && (
        <div style={{ padding: 16, color: "#ef4444", background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, display: "flex", gap: 12, alignItems: "center" }}>
          <span>{error}</span>
          <button onClick={() => load(query)} style={{ border: "1px solid #ef4444", color: "#ef4444", borderRadius: 6, padding: "6px 12px", background: "transparent", cursor: "pointer", fontFamily: "inherit" }}>Повторить</button>
        </div>
      )}

      {!error && (
        <>
          <div style={{ fontSize: 13, color: "#999", marginBottom: 10 }}>
            {loading ? "Загрузка…" : `${services.length} ${services.length === 1 ? "услуга" : "услуг"}`}
          </div>
          {!loading && services.length === 0 && (
            <div style={{ padding: "40px 0", textAlign: "center", color: "#bbb", fontSize: 14 }}>
              {query ? `Ничего не найдено по «${query}»` : "Услуг пока нет — добавьте первую"}
            </div>
          )}
          {groups.map((g) => (
            <div key={g.cat} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: ORANGE, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>{g.cat}</div>
              <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, overflow: "hidden" }}>
                {g.items.map((s, i) => (
                  <button key={s.id} onClick={() => setForm({ id: s.id, name: s.name, category: s.category, price: s.price })}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, width: "100%", textAlign: "left", padding: "12px 16px", border: "none", borderBottom: i < g.items.length - 1 ? "1px solid #f5f5f5" : "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", minHeight: 44 }}>
                    <span style={{ fontSize: 14, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: s.price ? "#1a1a1a" : "#ccc", whiteSpace: "nowrap" }}>{s.price || "—"}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {form && (
        <div onClick={() => setForm(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, width: 400, maxWidth: "100%", padding: 24, boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", margin: "0 0 16px" }}>{form.id === 0 ? "Новая услуга" : "Услуга"}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
              <label style={fieldLabel}>Название
                <input autoFocus value={form.name} onChange={(e) => setForm((f) => f && { ...f, name: e.target.value })} placeholder="Например, Лечение кариеса" style={fieldInput} />
              </label>
              <label style={fieldLabel}>Направление
                <input value={form.category} onChange={(e) => setForm((f) => f && { ...f, category: e.target.value })} placeholder="Терапия, УЗИ…" style={fieldInput} />
              </label>
              <label style={fieldLabel}>Цена
                <input value={form.price} onChange={(e) => setForm((f) => f && { ...f, price: e.target.value })} placeholder="2100 руб." style={fieldInput} />
              </label>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={save} disabled={!form.name.trim() || saving}
                style={{ flex: 1, padding: "12px 0", background: ORANGE, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: form.name.trim() && !saving ? "pointer" : "not-allowed", opacity: form.name.trim() && !saving ? 1 : 0.6, fontFamily: "inherit", minHeight: 44 }}>
                {saving ? "Сохранение…" : "Сохранить"}
              </button>
              {form.id !== 0 && (
                <button onClick={() => remove(form.id)} style={{ padding: "12px 16px", background: "#fff", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 10, fontSize: 14, cursor: "pointer", fontFamily: "inherit", minHeight: 44 }}>Удалить</button>
              )}
              <button onClick={() => setForm(null)} style={{ padding: "12px 16px", background: "#fff", color: "#555", border: "1px solid #e8e8e8", borderRadius: 10, fontSize: 14, cursor: "pointer", fontFamily: "inherit", minHeight: 44 }}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useMemo, useState } from "react"
import type { AlbamedBranch, AlbamedPriceCategory, AlbamedPricesResponse } from "@/lib/albamed/prices"

// ── Цвета клиники Альба-Мед (из их CSS, не наши) ────────────────────────────
const ACCENT = "#e0502e" // основной акцент
const ACCENT_SOFT = "#f4ab01" // дополнительный (жёлтый) — только для декора, не для текста (низкий контраст)
const BACKDROP = "#fff1ed" // светлая подложка
const GRAY_TEXT = "#757575"
const BORDER = "#e3e3e3"

const BRANCH_LABELS: Record<AlbamedBranch, string> = {
  kantar: "ул. Кантар, 9",
  kievskaya: "ул. Киевская, 153А",
}

const BRANCH_ORDER: AlbamedBranch[] = ["kantar", "kievskaya"]

// Лёгкость важнее красоты: при поиске рендерим не больше N строк за раз,
// чтобы не создавать тысячи DOM-узлов на слабом канале в Крыму.
const SEARCH_RESULTS_LIMIT = 150

// Неразрывный пробел (U+00A0) — только через escape, не как "невидимый" символ
// в исходнике, чтобы не ловить баги при копировании/диффах.
const NBSP = " "

interface FlatService {
  category: string
  name: string
  price: number
}

/**
 * "2000" -> "2 000 ₽" (везде NBSP). Intl.NumberFormat("ru-RU") может
 * подставить обычный пробел, NBSP или узкий NBSP (U+202F) в зависимости от
 * ICU-данных рантайма — нормализуем всё в NBSP, чтобы число с ценой
 * никогда не переносилось на мобильном экране.
 */
function formatPrice(price: number): string {
  const grouped = new Intl.NumberFormat("ru-RU").format(price)
  const normalized = grouped.replace(/[\s  ]/g, NBSP)
  return `${normalized}${NBSP}₽`
}

function formatUpdatedAt(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "недавно"
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
}

// ── Ранжирование поиска ──────────────────────────────────────────────────────
// Поиск остаётся подстрочным (ничего не выкидываем из выдачи), но упорядочиваем
// по "качеству" совпадения — иначе "узи" находит "УЗИ артерий..." и "Бузина"
// в одном списке, и вторая позиция на странице для руководителя клиники читается
// как промах поиска.
const WORD_BOUNDARY_CHARS = new Set([" ", "(", ")", "-", ","])

/** 0 — совпадение в начале строки, 1 — в начале слова, 2 — где угодно ещё. */
function getMatchRank(nameLower: string, queryLower: string): 0 | 1 | 2 {
  const idx = nameLower.indexOf(queryLower)
  if (idx === 0) return 0
  if (idx > 0 && WORD_BOUNDARY_CHARS.has(nameLower[idx - 1])) return 1
  return 2
}

export function AlbamedPricePreview({
  branches,
}: {
  branches: Record<AlbamedBranch, AlbamedPricesResponse>
}) {
  const [branch, setBranch] = useState<AlbamedBranch>("kantar")
  const [query, setQuery] = useState("")
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const data = branches[branch]

  function handleBranchChange(next: AlbamedBranch): void {
    if (next === branch) return
    setBranch(next)
    setQuery("")
    setExpanded(new Set())
  }

  function toggleCategory(name: string): void {
    setExpanded((prev) => {
      const copy = new Set(prev)
      if (copy.has(name)) copy.delete(name)
      else copy.add(name)
      return copy
    })
  }

  // Плоский список услуг текущего филиала — для мгновенного поиска.
  const flatServices = useMemo<FlatService[]>(() => {
    const out: FlatService[] = []
    for (const cat of data.categories) {
      for (const svc of cat.services) {
        out.push({ category: cat.category, name: svc.name, price: svc.price })
      }
    }
    return out
  }, [data])

  const trimmedQuery = query.trim().toLowerCase()
  const isSearching = trimmedQuery.length > 0

  const searchResults = useMemo<FlatService[]>(() => {
    if (!isSearching) return []

    const ranked: Array<{ service: FlatService; rank: 0 | 1 | 2 }> = []
    for (const s of flatServices) {
      const nameLower = s.name.toLowerCase()
      if (!nameLower.includes(trimmedQuery)) continue
      ranked.push({ service: s, rank: getMatchRank(nameLower, trimmedQuery) })
    }

    ranked.sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank
      return a.service.name.localeCompare(b.service.name, "ru")
    })

    return ranked.map((r) => r.service)
  }, [flatServices, trimmedQuery, isSearching])

  const visibleResults = searchResults.slice(0, SEARCH_RESULTS_LIMIT)

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        button, input { -webkit-tap-highlight-color: transparent; }
        button:focus-visible, input:focus-visible {
          outline: 2px solid ${ACCENT};
          outline-offset: 2px;
        }
        input[type="search"]::-webkit-search-cancel-button { -webkit-appearance: none; }
      `}</style>

      <main style={{ minHeight: "100vh", background: "#ffffff" }}>
        {/* Header */}
        <header style={{ background: ACCENT, borderBottom: `3px solid ${ACCENT_SOFT}` }}>
          <div style={{ maxWidth: 640, margin: "0 auto", padding: "18px 16px 22px", color: "#ffffff" }}>
            <div
              style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                opacity: 0.9,
                marginBottom: 6,
              }}
            >
              Медицинский центр Альба-Мед
            </div>
            <h1
              style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontWeight: 700,
                fontSize: 24,
                lineHeight: 1.25,
                margin: 0,
              }}
            >
              Стоимость услуг
            </h1>
          </div>
        </header>

        <div style={{ maxWidth: 640, margin: "0 auto", padding: "16px 16px 40px" }}>
          {/* Branch switcher */}
          <div
            role="tablist"
            aria-label="Филиал клиники"
            style={{ display: "flex", gap: 8, marginBottom: 14 }}
          >
            {BRANCH_ORDER.map((key) => {
              const active = key === branch
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  data-testid={`branch-tab-${key}`}
                  onClick={() => handleBranchChange(key)}
                  style={{
                    flex: 1,
                    minHeight: 44,
                    padding: "10px 8px",
                    borderRadius: 10,
                    border: `1.5px solid ${active ? ACCENT : BORDER}`,
                    background: active ? ACCENT : "#ffffff",
                    color: active ? "#ffffff" : "#2b2b2b",
                    fontFamily: "var(--font-open-sans), sans-serif",
                    fontWeight: 600,
                    fontSize: 13,
                    lineHeight: 1.3,
                    cursor: "pointer",
                  }}
                >
                  {BRANCH_LABELS[key]}
                </button>
              )
            })}
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: 8 }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={GRAY_TEXT}
              strokeWidth="2"
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              inputMode="search"
              placeholder="Найти услугу"
              aria-label="Поиск по названию услуги"
              data-testid="price-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: "100%",
                minHeight: 46,
                padding: "10px 14px 10px 40px",
                borderRadius: 10,
                border: `1.5px solid ${BORDER}`,
                fontSize: 15,
                fontFamily: "var(--font-open-sans), sans-serif",
                color: "#2b2b2b",
                background: "#ffffff",
                outline: "none",
              }}
            />
          </div>

          {/* Results */}
          <div style={{ marginTop: 12 }}>
            {isSearching ? (
              <SearchResultsList results={visibleResults} totalMatches={searchResults.length} />
            ) : (
              <CategoryAccordion
                categories={data.categories}
                expanded={expanded}
                onToggle={toggleCategory}
              />
            )}
          </div>

          {/* Updated at */}
          <p
            style={{
              marginTop: 24,
              fontSize: 13,
              color: GRAY_TEXT,
              fontFamily: "var(--font-open-sans), sans-serif",
            }}
          >
            Цены актуальны на {formatUpdatedAt(data.updatedAt)}
          </p>

          {/* Disclaimer */}
          <p
            style={{
              marginTop: 10,
              fontSize: 11,
              color: GRAY_TEXT,
              lineHeight: 1.5,
              fontFamily: "var(--font-open-sans), sans-serif",
            }}
          >
            Указанные цены не являются публичной офертой. Точную стоимость уточняйте у
            администратора клиники.
          </p>
        </div>
      </main>
    </>
  )
}

// ── Search results (flat, across all categories of the active branch) ──────

function SearchResultsList({
  results,
  totalMatches,
}: {
  results: FlatService[]
  totalMatches: number
}) {
  if (totalMatches === 0) {
    return (
      <p style={{ color: GRAY_TEXT, fontSize: 14, padding: "28px 0", textAlign: "center" }}>
        Ничего не найдено
      </p>
    )
  }

  return (
    <div data-testid="search-results">
      {results.map((s, i) => (
        <div
          key={`${s.category}|${s.name}|${i}`}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            padding: "10px 2px",
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, color: "#2b2b2b", lineHeight: 1.4 }}>{s.name}</div>
            <div style={{ fontSize: 11, color: GRAY_TEXT, marginTop: 2 }}>{s.category}</div>
          </div>
          <div
            style={{
              flexShrink: 0,
              fontWeight: 700,
              color: ACCENT,
              fontSize: 14,
              whiteSpace: "nowrap",
            }}
          >
            {formatPrice(s.price)}
          </div>
        </div>
      ))}
      {totalMatches > results.length && (
        <p style={{ fontSize: 12, color: GRAY_TEXT, padding: "12px 2px 0", textAlign: "center" }}>
          Показаны первые {results.length} из {totalMatches}. Уточните запрос.
        </p>
      )}
    </div>
  )
}

// ── Category accordion (collapsed by default) ───────────────────────────────

function CategoryAccordion({
  categories,
  expanded,
  onToggle,
}: {
  categories: AlbamedPriceCategory[]
  expanded: Set<string>
  onToggle: (name: string) => void
}) {
  return (
    <div data-testid="category-accordion">
      {categories.map((cat) => {
        const isOpen = expanded.has(cat.category)
        return (
          <div key={cat.category} style={{ borderBottom: `1px solid ${BORDER}` }}>
            <button
              type="button"
              aria-expanded={isOpen}
              data-testid="category-toggle"
              onClick={() => onToggle(cat.category)}
              style={{
                width: "100%",
                minHeight: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "12px 2px",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontWeight: 600,
                  fontSize: 15,
                  color: "#2b2b2b",
                  minWidth: 0,
                }}
              >
                {cat.category}{" "}
                <span style={{ color: GRAY_TEXT, fontWeight: 400, fontSize: 13 }}>
                  ({cat.services.length})
                </span>
              </span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={ACCENT}
                strokeWidth="2.5"
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  transition: "transform 0.15s ease",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {isOpen && (
              <div style={{ padding: "0 2px 12px", background: BACKDROP, borderRadius: 8 }}>
                {cat.services.map((svc, i) => (
                  <div
                    key={`${svc.name}-${i}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "8px 10px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        color: "#2b2b2b",
                        lineHeight: 1.4,
                        minWidth: 0,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {svc.name}
                    </span>
                    <span
                      style={{
                        flexShrink: 0,
                        fontWeight: 700,
                        color: ACCENT,
                        fontSize: 14,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatPrice(svc.price)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

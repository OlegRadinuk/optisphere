"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import type {
  AlbamedBranch,
  AlbamedPriceCategorySummary,
  AlbamedPriceService,
  AlbamedPricesResponse,
  AlbamedPricesSummary,
} from "@/lib/albamed/prices"

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

// То же самое для раскрытой категории — «Анализы (CMD)» содержит 1143 услуги,
// рендер всех сразу подвешивает мобильный Safari. Показываем порциями.
const CATEGORY_INITIAL_VISIBLE = 150
const CATEGORY_PAGE_SIZE = 150

// Неразрывный пробел (U+00A0) — только через escape, не как "невидимый" символ
// в исходнике, чтобы не ловить баги при копировании/диффах.
const NBSP = " "

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
  const normalized = grouped.replace(/[\s  ]/g, NBSP)
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

// ── Ленивая подгрузка полных данных филиала ──────────────────────────────────
// Сервер отдаёт в разметке только категории + счётчики (см. page.tsx). Полные
// списки услуг (нужны для поиска и раскрытых категорий) подгружаются отсюда же,
// с того же домена — /api/albamed/prices уже существует и отдаёт весь филиал
// одним JSON с Cache-Control на 6 часов.
async function fetchFullBranch(branch: AlbamedBranch): Promise<AlbamedPricesResponse> {
  const res = await fetch(`/api/albamed/prices?branch=${branch}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as AlbamedPricesResponse
}

export function AlbamedPricePreview({
  branches,
}: {
  branches: Record<AlbamedBranch, AlbamedPricesSummary>
}) {
  const [branch, setBranch] = useState<AlbamedBranch>("kantar")
  const [query, setQuery] = useState("")
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [categoryVisibleCounts, setCategoryVisibleCounts] = useState<Record<string, number>>({})

  // Полные данные филиалов, догруженные лениво (изначально пусто — в разметке
  // их нет вообще).
  const [fullData, setFullData] = useState<Partial<Record<AlbamedBranch, AlbamedPricesResponse>>>({})
  const [loadingBranches, setLoadingBranches] = useState<Set<AlbamedBranch>>(new Set())
  const [loadErrors, setLoadErrors] = useState<Partial<Record<AlbamedBranch, string>>>({})
  const inFlightRef = useRef<Partial<Record<AlbamedBranch, Promise<void>>>>({})

  const summary = branches[branch]
  const activeFull = fullData[branch]
  const isActiveLoading = loadingBranches.has(branch)
  const activeLoadError = loadErrors[branch] ?? null

  function ensureFullData(target: AlbamedBranch): void {
    if (fullData[target]) return
    if (inFlightRef.current[target]) return

    setLoadingBranches((prev) => {
      const copy = new Set(prev)
      copy.add(target)
      return copy
    })

    const promise = fetchFullBranch(target)
      .then((data) => {
        setFullData((prev) => ({ ...prev, [target]: data }))
        setLoadErrors((prev) => {
          if (!(target in prev)) return prev
          const copy = { ...prev }
          delete copy[target]
          return copy
        })
      })
      .catch((err) => {
        console.error(`[preview/albamed-price] failed to load full price list for ${target}:`, err)
        setLoadErrors((prev) => ({ ...prev, [target]: "Не удалось загрузить список услуг" }))
      })
      .finally(() => {
        delete inFlightRef.current[target]
        setLoadingBranches((prev) => {
          const copy = new Set(prev)
          copy.delete(target)
          return copy
        })
      })

    inFlightRef.current[target] = promise
  }

  // Подгружаем полные данные активного филиала сразу после первого рендера —
  // не блокируя первичную разметку (её уже отправил сервер), но так, чтобы
  // поиск и раскрытие категорий стали рабочими практически мгновенно.
  useEffect(() => {
    ensureFullData(branch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branch])

  function handleBranchChange(next: AlbamedBranch): void {
    if (next === branch) return
    setBranch(next)
    setQuery("")
    setExpanded(new Set())
    setCategoryVisibleCounts({})
  }

  function toggleCategory(name: string): void {
    setExpanded((prev) => {
      const copy = new Set(prev)
      if (copy.has(name)) copy.delete(name)
      else copy.add(name)
      return copy
    })
    ensureFullData(branch)
  }

  function showMoreInCategory(name: string): void {
    setCategoryVisibleCounts((prev) => ({
      ...prev,
      [name]: (prev[name] ?? CATEGORY_INITIAL_VISIBLE) + CATEGORY_PAGE_SIZE,
    }))
  }

  // Карта "категория -> её услуги" из полных данных (когда они загружены).
  const servicesByCategory = useMemo<Map<string, AlbamedPriceService[]> | null>(() => {
    if (!activeFull) return null
    const map = new Map<string, AlbamedPriceService[]>()
    for (const cat of activeFull.categories) map.set(cat.category, cat.services)
    return map
  }, [activeFull])

  // Плоский список услуг текущего филиала — для мгновенного поиска. Доступен
  // только после того, как полные данные филиала догрузились.
  const flatServices = useMemo<FlatService[]>(() => {
    if (!activeFull) return []
    const out: FlatService[] = []
    for (const cat of activeFull.categories) {
      for (const svc of cat.services) {
        out.push({ category: cat.category, name: svc.name, price: svc.price })
      }
    }
    return out
  }, [activeFull])

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
      {/*
        Список категорий/услуг может содержать сотни повторяющихся строк
        (114 категорий, до 1143 услуг в одной), поэтому их стили вынесены сюда
        общим классами вместо inline style на каждый узел — иначе разметка
        раздувается на десятки лишних килобайт одинаковым CSS-текстом.
      */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        button, input { -webkit-tap-highlight-color: transparent; }
        button:focus-visible, input:focus-visible {
          outline: 2px solid ${ACCENT};
          outline-offset: 2px;
        }
        input[type="search"]::-webkit-search-cancel-button { -webkit-appearance: none; }

        .cat-item { border-bottom: 1px solid ${BORDER}; }
        .cat-btn {
          width: 100%; min-height: 52px; display: flex; align-items: center;
          justify-content: space-between; gap: 10px; padding: 12px 2px;
          background: none; border: none; cursor: pointer; text-align: left;
        }
        .cat-name {
          font-family: var(--font-montserrat), sans-serif; font-weight: 600;
          font-size: 15px; color: #2b2b2b; min-width: 0;
        }
        .cat-count { color: ${GRAY_TEXT}; font-weight: 400; font-size: 13px; }
        .cat-chevron { flex-shrink: 0; transition: transform 0.15s ease; }
        .cat-chevron.is-open { transform: rotate(180deg); }
        .cat-panel { padding: 0 2px 12px; background: ${BACKDROP}; border-radius: 8px; }

        .svc-row { display: flex; justify-content: space-between; gap: 12px; padding: 8px 10px; }
        .svc-name { font-size: 14px; color: #2b2b2b; line-height: 1.4; min-width: 0; overflow-wrap: anywhere; }
        .svc-price { flex-shrink: 0; font-weight: 700; color: ${ACCENT}; font-size: 14px; white-space: nowrap; }

        .search-row {
          display: flex; justify-content: space-between; gap: 12px; padding: 10px 2px;
          border-bottom: 1px solid ${BORDER};
        }
        .search-text { min-width: 0; }
        .search-name { font-size: 14px; color: #2b2b2b; line-height: 1.4; }
        .search-cat { font-size: 11px; color: ${GRAY_TEXT}; margin-top: 2px; }

        .action-btn {
          min-height: 38px; padding: 8px 16px; border-radius: 8px;
          border: 1.5px solid ${ACCENT}; background: #ffffff; color: ${ACCENT};
          font-family: var(--font-open-sans), sans-serif; font-weight: 600;
          font-size: 13px; cursor: pointer;
        }
      `}</style>

      <main style={{ minHeight: "100vh", background: "#ffffff" }}>
        {/* Header */}
        <header style={{ background: ACCENT, borderBottom: `3px solid ${ACCENT_SOFT}` }}>
          <div
            style={{
              maxWidth: 640,
              margin: "0 auto",
              padding: "18px 16px 22px",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Image
                src="/albamed-logo.png"
                alt="Логотип Альба-Мед"
                width={224}
                height={223}
                priority
                style={{ width: 40, height: "auto", display: "block" }}
              />
            </div>
            <div style={{ minWidth: 0 }}>
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
              activeFull ? (
                <SearchResultsList results={visibleResults} totalMatches={searchResults.length} />
              ) : (
                <LoadingOrError
                  isLoading={isActiveLoading}
                  error={activeLoadError}
                  loadingText="Загружаем услуги для поиска…"
                  onRetry={() => ensureFullData(branch)}
                />
              )
            ) : (
              <CategoryAccordion
                categories={summary.categories}
                expanded={expanded}
                onToggle={toggleCategory}
                servicesByCategory={servicesByCategory}
                isLoading={isActiveLoading}
                loadError={activeLoadError}
                onRetry={() => ensureFullData(branch)}
                visibleCounts={categoryVisibleCounts}
                onShowMore={showMoreInCategory}
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
            Цены актуальны на {formatUpdatedAt(summary.updatedAt)}
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

// ── Общий блок "загрузка / ошибка" для поиска и раскрытых категорий ─────────

function LoadingOrError({
  isLoading,
  error,
  loadingText,
  onRetry,
}: {
  isLoading: boolean
  error: string | null
  loadingText: string
  onRetry: () => void
}) {
  if (error) {
    return (
      <div style={{ padding: "16px 2px", textAlign: "center" }}>
        <p style={{ color: GRAY_TEXT, fontSize: 13, margin: "0 0 10px" }}>{error}</p>
        <button type="button" className="action-btn" onClick={onRetry}>
          Повторить
        </button>
      </div>
    )
  }

  return (
    <p style={{ color: GRAY_TEXT, fontSize: 14, padding: "20px 2px", textAlign: "center" }}>
      {isLoading ? loadingText : "Загрузка…"}
    </p>
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
        <div className="search-row" key={`${s.category}|${s.name}|${i}`}>
          <div className="search-text">
            <div className="search-name">{s.name}</div>
            <div className="search-cat">{s.category}</div>
          </div>
          <div className="svc-price">{formatPrice(s.price)}</div>
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
  servicesByCategory,
  isLoading,
  loadError,
  onRetry,
  visibleCounts,
  onShowMore,
}: {
  categories: AlbamedPriceCategorySummary[]
  expanded: Set<string>
  onToggle: (name: string) => void
  servicesByCategory: Map<string, AlbamedPriceService[]> | null
  isLoading: boolean
  loadError: string | null
  onRetry: () => void
  visibleCounts: Record<string, number>
  onShowMore: (name: string) => void
}) {
  return (
    <div data-testid="category-accordion">
      {categories.map((cat) => {
        const isOpen = expanded.has(cat.category)
        return (
          <div className="cat-item" key={cat.category}>
            <button
              type="button"
              className="cat-btn"
              aria-expanded={isOpen}
              data-testid="category-toggle"
              onClick={() => onToggle(cat.category)}
            >
              <span className="cat-name">
                {cat.category} <span className="cat-count">({cat.count})</span>
              </span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={ACCENT}
                strokeWidth="2.5"
                aria-hidden="true"
                className={`cat-chevron${isOpen ? " is-open" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {isOpen && (
              <div className="cat-panel">
                {(() => {
                  const services = servicesByCategory?.get(cat.category)
                  if (!services) {
                    return (
                      <LoadingOrError
                        isLoading={isLoading}
                        error={loadError}
                        loadingText="Загрузка услуг категории…"
                        onRetry={onRetry}
                      />
                    )
                  }

                  const visibleCount = visibleCounts[cat.category] ?? CATEGORY_INITIAL_VISIBLE
                  const visible = services.slice(0, visibleCount)
                  const remaining = services.length - visible.length

                  return (
                    <>
                      {visible.map((svc, i) => (
                        <div className="svc-row" key={`${svc.name}-${i}`}>
                          <span className="svc-name">{svc.name}</span>
                          <span className="svc-price">{formatPrice(svc.price)}</span>
                        </div>
                      ))}
                      {remaining > 0 && (
                        <div style={{ padding: "8px 10px 2px", textAlign: "center" }}>
                          <button type="button" className="action-btn" onClick={() => onShowMore(cat.category)}>
                            Показать ещё {Math.min(CATEGORY_PAGE_SIZE, remaining)} из {remaining}
                          </button>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

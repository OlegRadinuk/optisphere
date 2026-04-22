# Orchestrator.local — Optisphere V3 "NEXUS"

> **Extends:** `~/.claude/agents/orchestrator.md`
> V3 полный ресет. Старый код v2 удалён. Строим с нуля.

## Стек

- **Framework:** Next.js 16 (App Router, webpack mode: `next dev --webpack`)
- **Language:** TypeScript strict (no any, no @ts-ignore)
- **Styling:** Tailwind 4 (PostCSS-only) + CSS Custom Properties в globals.css
- **i18n:** next-intl 4.9 → messages/ru.json + messages/en.json
- **3D:** Three.js + @react-three/fiber + @react-three/drei
- **Animation:** Framer Motion + Lenis (smooth scroll)
- **State:** Zustand 5
- **AI:** @anthropic-ai/sdk
- **Fonts:** Orbitron (logo/labels only) + Geist (body, headlines — размер крупный)

## Концепция V3 — NEXUS

**Позиционирование:** AI-нативная веб-студия. Юра — продукт, не фича.
**Слоган-кандидат:** "Ваш первый AI-продавец уже готов к работе"
**Визуал:** Editorial-стиль. Большой текст. Много воздуха. Секции-полотна.

## Новая палитра

```
--base:          #04040C   (почти чёрный, чуть тёплый)
--surface:       #0A0A18   (карточки, подложки)
--surface-high:  #12121F   (elevated карточки)
--indigo:        #6366F1   (основной AI-акцент)
--indigo-dim:    rgba(99,102,241,0.12)
--cyan:          #06B6D4   (энергия, свечения Hero)
--cyan-dim:      rgba(6,182,212,0.12)
--amber:         #F59E0B   (CTA-кнопки — единственный тёплый)
--amber-dim:     rgba(245,158,11,0.12)
--text:          #F8FAFC
--text-muted:    #64748B
--text-faint:    #1E293B
--border:        rgba(255,255,255,0.06)
--border-hover:  rgba(255,255,255,0.14)
```

## Услуги V3 (AI-фрейм)

```
AI-Сайт       → сайт + цифровой продавец Юра внутри
Присутствие   → 360-панорамы + визуальный контент (до звонка уже продаёт)
Рост          → SEO + Директ + аналитика (AI ищет, сайт конвертирует)
```

## Структура страницы (воронка V3)

```
1. Hero        — AI Sphere (Energy Orb + Neural Net) + УТП + Юра виден сразу
2. AI-Hook     — 3 цифры: сайтов / лидов Юрой / дней среднее
3. Services    — три full-screen панели, скролл-reveal
4. Portfolio   — горизонтальный скролл, живые проекты
5. Pricing     — три карты + Orbit подписка
6. Calculator  — → Юра берёт результат и продолжает диалог
7. CTA         — одна кнопка. Amber. Большая.
8. Footer
```

## Hero сфера — техническая спека

```
Подход: ГИБРИДНЫЙ (не чистый R3F)
  Layer 1 (WebGL/R3F): Energy orb — plasma core шейдер, indigo→cyan gradient,
                        медленное "дыхание" (scale 1.0→1.05→1.0, 4s loop),
                        mouse parallax ±15px
  Layer 2 (Canvas 2D): Neural network overlay — 60 узлов на эллиптических орбитах,
                        линии связи между близкими узлами (threshold 150px),
                        pulse-анимация по линиям, реагирует на мышь
  Starfield (Canvas 2D): 800 звёзд mobile, 3200 desktop

Запрет: @react-three/postprocessing / Bloom (context loss)
Свечение: CSS filter drop-shadow на canvas wrapper
Mobile: только Canvas 2D нейросеть + CSS sphere (без WebGL)
```

## Критические ограничения

```
[ЗАПРЕТ]  @react-three/postprocessing / Bloom — НИКОГДА
[ЗАПРЕТ]  Хардкод текста — только next-intl ключи
[ЗАПРЕТ]  any в TypeScript
[CSS]     Tailwind 4 canonical: bg-surface (НЕ bg-[var(--surface)])
[PERF]    Hero = единственная WebGL сцена. Всё остальное: CSS + SVG + Framer Motion
[MOBILE]  DPR [1,1.5], 30fps throttle, WebGL → CSS fallback
[AMBER]   Amber (#F59E0B) — ТОЛЬКО для CTA кнопок. Не использовать как декор.
[I18N]    messages/ru.json И messages/en.json — всегда синхронно
[HMR]     .playwright-mcp/ ignored в next.config.ts
```

## Локальные агенты

```
agents/local/designer.md   — дизайн-система NEXUS, компоненты
agents/local/frontend.md   — файловая структура v3, конвенции
agents/local/backend.md    — API эндпоинты, интеграции
agents/local/qa.md         — тест-стек, Playwright
```

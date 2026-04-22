# TASK-003: Overnight Full Build — Optisphere
**Статус:** READY  
**Направление:** Полная пересборка без тяжёлого 3D. Упор: продажи + AI Юра как главный продавец.  
**MCP:** context7 (актуальная дока), playwright (тесты)

---

## СМЕНА КУРСА (от task-002)

**Что убираем:**
- OrbitalSphere (Three.js/R3F/GLSL) — слишком тяжело, отвлекает от продаж
- R3F зависимости из активного использования (оставляем в package.json на будущее)

**Что строим:**
- Современный, амбициозный sales-сайт
- Визуальная тема: космос через CSS/SVG/Canvas 2D — легко и быстро
- AI Юра — ГЛАВНАЯ ФИШКА сайта, не просто виджет
- Каждая секция ведёт к одному действию: заявка

---

## СТЕК ДЛЯ НОЧНОЙ РАБОТЫ

```
Next.js 16 (App Router) — читать через context7 перед API
React 19 + TypeScript strict
Tailwind 4 (PostCSS)
Framer Motion — анимации, scroll-driven
next-intl 4.9 — весь текст в ru.json/en.json
Lenis — smooth scroll
Anthropic SDK — Юра
Telegram Bot API — лиды
```

**Запрещено:** any в TypeScript, хардкод текста, секреты в клиент-коде

---

## АРХИТЕКТУРА СТРАНИЦЫ

```
/ (ru) и /en/ (en)
│
├── Navbar                    ← уже есть, минор фиксы
├── HeroSection               ← ПЕРЕПИСАТЬ полностью (без R3F)
├── ServicesSection           ← рефакторинг (фикс ids)
├── PortfolioSection          ← оставить структуру
├── PricingSection            ← переписать (fix require bug)
├── CalcSection               ← создать новую
├── ContactSection            ← создать новую  
├── Footer                    ← создать новый
│
├── YuraWidget (fixed)        ← ГЛАВНАЯ ФИШКА — создать
│
└── API Routes:
    ├── /api/ai/chat          ← стриминг, Юра
    ├── /api/leads/telegram   ← лиды
    └── /api/calculator       ← расчёт
```

---

## СЕКЦИЯ 1: HeroSection — ПЕРЕПИСАТЬ

**Концепция:** Космическая сцена без WebGL. Визуал через CSS + Canvas 2D + SVG.

**Элементы:**
- Фон: анимированное звёздное поле на Canvas 2D (лёгкое — 200 точек, requestAnimationFrame)
- Центральный элемент: SVG или CSS "атом" — пульсирующий шар + 3 анимированных орбитальных кольца через CSS keyframes
- Орбитальные точки: 4 маленьких div-шара на орбитах (CSS animation), при hover → tooltip с услугой
- НЕТ Three.js, НЕТ R3F, НЕТ шейдеров

**Текст:**
```
[i18n: hero.label]       — надпись сверху (ВЕBСТУДИЯ / WEB STUDIO)
[i18n: hero.headline]    — главный заголовок (Создаём сайты которые продают)
[i18n: hero.sub]         — подзаголовок (описание студии)
[i18n: hero.cta_primary] — кнопка "Обсудить проект" → #contact
[i18n: hero.cta_calc]    — кнопка "Рассчитать стоимость" → #calculator
[i18n: hero.stats.*]     — 3 числа: "50+ проектов", "98% довольных клиентов", "3 года на рынке"
```

**Layout (desktop):** левая колонка текст + кнопки, правая колонка атом-анимация  
**Layout (mobile):** атом сверху (уменьшенный), текст снизу

**Анимации входа:** Framer Motion stagger — label → headline → sub → кнопки → stats

---

## СЕКЦИЯ 2: ServicesSection — РЕФАКТОРИНГ

**Что делать:**
- Исправить id: "services" у всех трёх → "sites", "pano", "promo"
- Добавить якорные ссылки на секцию из Hero
- Сохранить существующий визуал (карточки, иконки, hover)

---

## СЕКЦИЯ 3: PortfolioSection — МИНОР

- Сохранить структуру (фильтры, карточки, AnimatePresence)
- Заменить фиктивные данные в portfolio.ts на более реалистичные плейсхолдеры:
  ```
  Денис-море (денис-море.рф) — отель, Краснодарский край
  LoveLifestyle (lovelifestyle.ru) — lifestyle бренд
  МедПро Клиника — медицинский центр
  СтройГрупп — строительная компания
  ```

---

## СЕКЦИЯ 4: PricingSection — ПЕРЕПИСАТЬ

**Проблема:** `require("next-intl")` crash + не в page.tsx

**Решение:**
```typescript
import { useTranslations } from "next-intl"
// Все строки → messages/ru.json + messages/en.json
// pricing.label_sites, pricing.headline_sites, pricing.tiers.* и т.д.
```

Добавить в page.tsx между Portfolio и Calc.

---

## СЕКЦИЯ 5: CalcSection — СОЗДАТЬ

**Файл:** `src/components/sections/CalcSection.tsx`

Multi-step калькулятор:
```
Шаг 1: Тип проекта
  [Лендинг] [Корп сайт] [Интернет-магазин] [360 Тур] [Продвижение]
  — большие карточки с SVG иконкой, не radio buttons

Шаг 2: Дизайн  
  [Шаблонный] [Кастомный] [Премиум]

Шаг 3: Допы (мультивыбор)
  [CMS] [SEO] [Мультиязычность] [Аналитика]

Результат:
  Диапазон: "от 80 000 до 150 000 ₽"
  Срок: "5–10 дней"
  CTA: "Уточнить у Юры →" → открывает YuraWidget
```

Анимация между шагами: slide + fade (Framer Motion AnimatePresence).  
Прогресс-бар вверху.  
POST /api/calculator для итога.

---

## СЕКЦИЯ 6: ContactSection — СОЗДАТЬ

**Файл:** `src/components/sections/ContactSection.tsx`

```
Левая сторона (desktop):
  Аватар/фото Олега (placeholder круглый)
  "Олег Петров, основатель"
  "Отвечу в течение дня"
  Telegram кнопка: t.me/optisphere_oleg
  3 буллета: "Бесплатная консультация", "Оценка за 24ч", "Договор перед началом"

Правая сторона:
  Форма: Имя, Телефон/Telegram, Описание проекта
  Кнопка: "Отправить заявку" (idle/loading/success/error)
  
Mobile: форма на весь экран, sticky кнопка
```

Отправка → POST /api/leads/telegram

---

## СЕКЦИЯ 7: Footer — СОЗДАТЬ

**Файл:** `src/components/sections/Footer.tsx`

```
Логотип Optisphere + tagline
Колонки: Услуги | Портфолио | Контакт
Соцсети: Telegram, VK
Копирайт: "© 2024 Optisphere. Сделано с ♥ в России"
Декор: тонкая линия gradient сверху
```

---

## ГЛАВНАЯ ФИЧА: AI Юра — СОЗДАТЬ

### Виджет: `src/components/ai/YuraWidget.tsx`

**Позиция:** fixed bottom-right (desktop), full bottom-sheet (mobile)

**Trigger:** появляется через 25 сек ИЛИ при скролле до 50% страницы — whichever first

**Trigger-кнопка:**
- Анимированный пульсирующий шар (CSS animation, не Three.js)
- Надпись "Юра" + иконка чата
- Плавное появление: scale 0 → 1 + fade

**Открытый виджет:**
- Glass-morphism панель 380×520px (desktop), full bottom-sheet (mobile)
- Header: мини-аватар + "Юра" + "AI-консультант" + ✕
- Область сообщений: пузыри (user right, Юра left)
- Typing indicator: три точки анимация
- Input: textarea + кнопка отправить
- Первое сообщение Юры появляется автоматически при открытии

**Стартовое сообщение Юры:**
```
"Привет! Я Юра — помогу разобраться что нужно именно вашему бизнесу.
С чего начнём — расскажите про проект или хотите сразу узнать цену?"
```

**Streaming:** fetch + ReadableStream (не EventSource)
**Session:** localStorage для sessionId
**Abort:** AbortController при закрытии

### API: `src/app/api/ai/chat/route.ts`

```typescript
// Streaming endpoint
// Model: claude-haiku-4-5-20251001 (быстрый, дешёвый)
// Rate limit: 20 сообщений/session, 50/IP в час

// Системный промпт Юры:
const YURA_SYSTEM = `
Ты — Юра, AI-консультант веб-студии Optisphere.
Твоя личность: умный, уверенный, слегка неформальный. Не навязчивый.
Ты реальный эксперт — говоришь по делу, без воды.

Твоя цель (по этапам):
1. Понять проект клиента (1-2 вопроса)
2. Дать конкретную пользу (оценка, совет, пример из портфолио)
3. Назвать примерную цену/сроки
4. Через 3-4 обмена: "Ну что, делаем?" и запросить контакт

Важно:
- Иногда (раз в диалог) упомяни интересный факт о космосе — это твой характер
- Если клиент готов — запроси Telegram или телефон
- При получении контакта: скажи что Олег свяжется сегодня

Услуги студии:
- Лендинг от 50к, корп сайт от 120к, премиум от 180к
- Подписка Орбита: 10к/15к/25к в месяц (хостинг+поддержка+SEO)
- Туры 360° от 8к/объект
- Продвижение в подписке PRO/MAX

Финальная реплика клозера: "Ну что, делаем?"
`
```

При получении контакта → POST /api/leads/telegram с `{ type: "yura", dialog, contact, intent }`

### API: `src/app/api/leads/telegram/route.ts`

```typescript
// Rate limit: 3 запроса/IP за 10 минут
// Валидация: name min 2, contact min 5, message min 10
// Telegram HTML parse_mode
// env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (уже в .env.local)
// Response: { success: true } или { error, code }
```

### API: `src/app/api/calculator/route.ts`

```typescript
const PRICES = {
  type:   { landing:[30,60], corporate:[80,150], ecommerce:[150,300], pano:[8,30], promo:[15,30] },
  design: { template:0, custom:[20,40], premium:[40,80] },
  extras: { cms:[10,20], seo:[5,15], multilang:[10,20], analytics:[5,10] }
}
// Возвращает: { min, max, days, currency: "RUB" }
```

---

## i18n КЛЮЧИ — добавить в ru.json + en.json

```json
"hero": {
  "label": "ВЕБ-СТУДИЯ / WEB STUDIO",
  "headline": "Создаём сайты\nкоторые продают",
  "sub": "Разрабатываем продающие сайты, 360° туры и выводим бизнес в топ поиска",
  "cta_primary": "Обсудить проект",
  "cta_calc": "Рассчитать стоимость",
  "stats": {
    "projects": "50+",
    "projects_label": "проектов",
    "happy": "98%",
    "happy_label": "довольных клиентов",
    "years": "3",
    "years_label": "года на рынке"
  }
},
"calc": { ... все ключи калькулятора ... },
"contact": { ... все ключи контакта ... },
"footer": { ... },
"ai": {
  "trigger_label": "Юра",
  "title": "Юра",
  "subtitle": "AI-консультант",
  "placeholder": "Напишите вопрос...",
  "send": "Отправить"
}
```

---

## ДИЗАЙН: ключевые решения

**Цветовая тема — без изменений:**
```
Base: #07070F, Text: #F0F0FF, Muted: #7878A0
Blue: #4F8EFF, Gold: #C9A96E, Mint: #3ECFA0
```

**Атом в Hero — CSS only:**
```css
.atom-core {
  width: 120px; height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fff 0%, #4F8EFF 40%, #1a2a6c 100%);
  box-shadow: 0 0 60px rgba(79,142,255,0.4), 0 0 120px rgba(79,142,255,0.15);
  animation: pulse 3s ease-in-out infinite;
}
.orbit-ring {
  border: 1px solid rgba(200,220,255,0.2);
  border-radius: 50%;
  animation: spin 8s linear infinite;
}
/* 3 кольца: rotate(0deg), rotate(60deg), rotate(120deg) - атом */
```

**Юра-кнопка (trigger):**
```css
.yura-trigger {
  width: 64px; height: 64px; border-radius: 50%;
  background: radial-gradient(circle at 40% 40%, #7c3aed, #4F8EFF);
  box-shadow: 0 0 0 0 rgba(79,142,255,0.4);
  animation: yura-pulse 2s ease-out infinite;
}
@keyframes yura-pulse {
  0% { box-shadow: 0 0 0 0 rgba(79,142,255,0.4); }
  70% { box-shadow: 0 0 0 20px rgba(79,142,255,0); }
  100% { box-shadow: 0 0 0 0 rgba(79,142,255,0); }
}
```

---

## ПОРЯДОК ВЫПОЛНЕНИЯ (ночной план)

```
ПАРАЛЛЕЛЬНО — Фаза 1 (старт):
  [A] Переписать HeroSection (CSS атом, без R3F)    — frontend(sonnet)
  [B] API routes: /chat + /telegram + /calculator    — backend(sonnet)

ПОСЛЕ A завершён:
  [C] PricingSection rewrite + добавить в page.tsx  — frontend(haiku)
  [D] ServicesSection фиксы (ids)                   — frontend(haiku)

ПАРАЛЛЕЛЬНО — Фаза 2:
  [E] YuraWidget компонент (после B)                 — frontend(sonnet)
  [F] CalcSection (после B)                          — frontend(sonnet)

ПОСЛЕ E,F:
  [G] ContactSection                                 — frontend(sonnet)
  [H] Footer                                         — frontend(haiku)

ФИНАЛ:
  [I] Собрать всё в page.tsx                        — frontend(haiku)
  [J] i18n: все ключи ru.json + en.json             — frontend(haiku)
  [K] npm run build — проверить ошибки              — qa(haiku)
```

---

## CONSTRAINTS

```
[I18N]    ru.json + en.json синхронно — без хардкода
[CSS]     Tailwind 4 canonical classes
[PERF]    Нет тяжёлого WebGL на главной
[MOBILE]  390px first, tap targets ≥44px
[SEC]     Rate limiting на все POST, секреты только в env
[NEXT]    App Router — использовать context7 для проверки API
[CONV]    Каждая секция → к заявке, конверсия > визуал
[AI_ENV]  .env.local уже содержит AI_API_KEY + AI_BASE_URL + AI_MODEL
          TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID уже есть
```

---

## ВАЖНО: env для Юры

В `.env.local` уже есть:
```
AI_API_KEY=sk-7af001d...        (кастомный Claude-compatible endpoint)
AI_BASE_URL=https://aiprime.store
AI_MODEL=claude-sonnet-4-6
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

API route должен использовать `openai` пакет (уже установлен) с базовым URL:
```typescript
import OpenAI from "openai"
const ai = new OpenAI({ 
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL 
})
// model: process.env.AI_MODEL
```

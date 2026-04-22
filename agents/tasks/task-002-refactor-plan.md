# TASK-002: Полный план рефакторинга и достройки Optisphere
**Статус:** READY  
**Основание:** task-001-decision.md → РЕФАКТОРИНГ + ДОСТРОЙКА

---

## ФАЗА 0 — Срочные фиксы (P0, ≤2 часа)

### task-002-p0-a: Фиксы файлов
**Агент:** frontend · **Модель:** haiku  
**Что делать:**

1. **next.config.ts** — убрать `transpilePackages: ["@react-three/postprocessing", "postprocessing"]`

2. **ServicesSection.tsx** — исправить дублирующиеся id:
   ```typescript
   // было: id: "services" у всех трёх
   // стало:
   { key: "sites", id: "sites", ... }
   { key: "pano",  id: "pano",  ... }
   { key: "promo", id: "promo", ... }
   ```

3. **Navbar.tsx** — убрать `lastY` ref (строки 119, 125)

4. **layout.tsx** — убрать неиспользуемый `getTranslations` import (строки 4, 29-30)

**Артефакты:** изменённые файлы, no new files

---

### task-002-p0-b: PricingSection переписать
**Агент:** frontend · **Модель:** sonnet  
**Цепочка:** после p0-a

**Проблемы к устранению:**
- `require("next-intl")` → `import { useLocale } from "next-intl"`
- `PROJECT_TIERS` с `{ ru, en }` объектами → перевести в messages/ru.json + messages/en.json
- Все хардкодированные строки → i18n ключи

**Новые i18n ключи (добавить в ru.json и en.json):**
```json
"pricing": {
  "label_sites": "Сайты",
  "label_orbit": "Орбита",
  "headline_sites": "Цены на разработку",
  "headline_orbit": "Подписка Орбита",
  "popular": "Популярный",
  "cta": "Обсудить проект",
  "timeline": "Срок: {days} дней",
  "tiers": {
    "start": { "name": "Start", "price": "от 50 000 ₽", ... },
    "pro":   { "name": "Pro",   "price": "от 120 000 ₽", ... },
    "premium":{ "name": "Premium","price": "от 180 000 ₽", ... }
  }
}
```

**После:** добавить `<PricingSection />` в page.tsx между PortfolioSection и будущим ContactSection

**Constraints:**
- [I18N] ru.json + en.json обновлять синхронно
- [CSS] только canonical Tailwind 4 классы
- Структура карточек визуально не менять (только код)

---

## ФАЗА 1 — Конверсионные секции (P1, главное)

### task-002-p1-a: ContactSection + /api/leads/telegram
**Агент-цепочка:** designer(sonnet) → frontend(sonnet) → backend(sonnet) → security(haiku)

**Designer задача:** Спека ContactSection
- Форма: Имя, Телефон/Telegram, Описание проекта
- Рядом с формой: краткий блок доверия (статы, фото-аватар Олега + "Отвечу в течение дня")
- CTA кнопка: "Отправить заявку" → state: idle/sending/success/error
- Mobile: форма на весь экран, кнопка sticky
- Добавить быстрые методы связи: Telegram кнопка, WhatsApp (если нужно)
- Космическая тема: минимальный glow, не перегружать

**Frontend задача:** Реализация по спеке дизайнера
```typescript
// src/components/sections/ContactSection.tsx
// - useForm или useState для полей
// - fetch POST /api/leads/telegram
// - loading state с spinner
// - success message с анимацией
// - error handling
// - Framer Motion animate-in
// - 'use client'
// - все тексты через useTranslations("contact")
```

**Backend задача:** POST /api/leads/telegram
```typescript
// src/app/api/leads/telegram/route.ts
// - Валидация: name (min 2), contact (min 5), message (min 10)
// - Rate limit: 3 запроса/IP за 10 минут (простой Map<ip, timestamps>)
// - Форматирование сообщения в Telegram (HTML parse_mode)
// - POST https://api.telegram.org/bot{TOKEN}/sendMessage
// - env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
// - Ответ: { success: true } или { error: string, code: string }
```

**Security:** rate limiting, валидация входных данных, нет утечки секретов в ответах

---

### task-002-p1-b: AI Юра + /api/ai/chat
**Агент-цепочка:** designer(sonnet) → backend(sonnet) → security(haiku) → frontend(sonnet)

**Designer задача:** Спека виджета Юры
- Позиционирование: fixed bottom-right (desktop), bottom-full (mobile)
- Trigger: появляется после 30 сек или скролла до 60% страницы
- Визуал trigger-кнопки: energy sphere, пульс анимация, "Есть вопрос?" / "Юра"
- Открытый виджет: glass-morphism окно 380×520 (desktop), full-bottom-sheet (mobile)
- Header: мини-аватар сферы + "Юра" + "Консультант" + кнопка закрыть
- Messages: пузыри (user right, Юра left), typing indicator
- Input: textarea + кнопка отправить
- Юра "дышащий" индикатор при thinking
- Тема: космос, мягкий glow синего цвета

**Backend задача:** POST /api/ai/chat (streaming)
```typescript
// src/app/api/ai/chat/route.ts
// - Streaming ответ (ReadableStream)
// - Claude claude-haiku-4-5-20251001 для скорости
// - Системный промпт Юры (уверенный, умный, слегка неформальный)
//   Цель: узнать потребность → дать пользу → запросить контакт
//   Финальная реплика через 3-4 обмена: "Ну что, делаем?"
//   Иногда факт о космосе (характер)
//   Запросить контакт (Telegram/телефон)
// - Валидация: messages array, sessionId
// - Rate limit: 20 сообщений/session, 50/IP за час
// - При получении контакта: POST /api/leads/telegram с dialog + intent
// - env: ANTHROPIC_API_KEY
```

**Frontend задача:** Компонент YuraWidget
```typescript
// src/components/ai/YuraWidget.tsx
// - dynamic import + ssr:false (Web Audio, localStorage)
// - Delay trigger (30s) или IntersectionObserver (60% scroll)
// - EventSource или fetch streaming для streaming ответа
// - localStorage для sessionId
// - Abort controller для отмены
// - Анимации Framer Motion для appear/close
// - 'use client'
// - Добавить в layout.tsx (всегда доступен)
```

---

### task-002-p1-c: CalcSection + /api/calculator
**Агент-цепочка:** designer(sonnet) → frontend(sonnet) → backend(haiku)

**Designer задача:** Спека CalcSection
- Multi-step форма: Шаг 1 (тип проекта) → Шаг 2 (дизайн) → Шаг 3 (допы) → Результат
- Прогресс-бар вверху
- Каждый шаг: крупные карточки с иконками (не radio buttons)
- Результат: диапазон цен + "Уточнить у Юры" кнопка → открывает виджет
- Анимация между шагами: slide + fade
- Мобильная: полноэкранный step-by-step

**Backend задача:** POST /api/calculator
```typescript
// Простая логика без AI:
const PRICES = {
  type:   { landing: [30, 60],  corporate: [80, 150], ecommerce: [150, 300], pano: [8, 30], promo: [15, 30] },
  design: { template: 0, custom: [20, 40], premium: [40, 80] },
  extras: { cms: [10, 20], seo: [5, 15], multilang: [10, 20], analytics: [5, 10] },
};
// Возвращать: { min, max, currency: "RUB" }
```

---

## ФАЗА 2 — Completeness (P2)

### task-002-p2-a: Footer
**Агент:** frontend(haiku)

```typescript
// src/components/sections/Footer.tsx
// - Логотип + tagline
// - Ссылки: Услуги, Портфолио, Цены, Контакт
// - Социальные: Telegram, VK (или GitHub)
// - Copyright + "Сделано с ♥" 
// - Космический декор: линия с gradient, мелкие звёзды
// - Все тексты через useTranslations("footer")
```

### task-002-p2-b: SEO и metadata
**Агент:** seo → frontend(haiku)

- Layout metadata через i18n (убрать хардкодированные ru/en строки из layout.tsx)
- Добавить Schema.org LocalBusiness (src/components/SchemaOrg.tsx)
- sitemap.ts
- robots.ts
- generateMetadata для каждой секции если нужно

### task-002-p2-c: Lenis smooth scroll
**Агент:** frontend(haiku)

```typescript
// src/components/LenisProvider.tsx
// - 'use client'
// - Lenis import + useEffect
// - RAF loop
// - Добавить в [locale]/layout.tsx
```

---

## ФАЗА 3 — Polish (P3)

### task-002-p3-a: OrbitalSphere точечные фиксы
**Агент:** frontend(opus) — 3D задача

1. `isMobile` → хук `useIsMobile()` (SSR-safe через useState + useEffect)
2. `SpaceHUD visible={true}` → управлять через `hoveredNode !== null` (показывать default только после первого hover)
3. `handleClick` → использовать Lenis scroll to section вместо `window.location.hash`
4. HUD "Подробнее →" → через i18n ключ `hero.hud_cta`

### task-002-p3-b: Portfolio реальные данные
**Агент:** frontend(haiku)  
**Блокировано:** Олег предоставляет реальные проекты  
- Обновить portfolio.ts с реальными проектами: deniz-more.ru, lovelifestyle.ru, etc.
- Добавить реальные URL

### task-002-p3-c: Loader ракета
**Агент:** designer(sonnet) → frontend(opus)

```
Loader: абсолютный оверлей поверх страницы
- Ракета CSS анимация (SVG, взлетает вверх)
- 0.8-1.2 сек
- Fade out при готовности Canvas
- Не блокировать загрузку остального DOM
```

---

## ФАЗА 4 — Verify (P4)

### task-002-p4-a: Prod проверка OrbitalSphere
```bash
npm run build && npm start
# Открыть localhost:3000, Ctrl+F5 несколько раз
# Если планеты есть → баг только в dev, закрыть
# Если нет → escalate к frontend(opus) для диагностики
```

---

## Итоговая очерёдность выполнения

```
СЕЙЧАС:
  P0a → P0b (параллельно или последовательно, 1-2 часа)

ДАЛЬШЕ:
  P1a (Contact) — самое важное для конверсии
  P1b (Юра AI) — второй по приоритету (фишка)
  P1c (Calc)   — третий

ПОТОМ:
  P2a (Footer)
  P2b (SEO)
  P2c (Lenis)

ПАРАЛЛЕЛЬНО:
  P4a (prod check) — можно сейчас, займёт 5 минут

КОГДА ДАННЫЕ ГОТОВЫ:
  P3b (реальное портфолио)

В КОНЦЕ:
  P3a (OrbitalSphere polish)
  P3c (Loader)
```

---

## Constraints для всей команды

```
[I18N]    Все тексты через next-intl — ru.json + en.json синхронно
[CSS]     Tailwind 4 canonical: bg-base-card, text-text-muted (не var())
[PERF]    Postprocessing/Bloom ЗАПРЕЩЕНЫ
[PERF]    WebGL только в HeroSection
[MOBILE]  390px → 768px → 1280px. Touch-first. Tap targets ≥44px
[NEXT]    App Router. Читать node_modules/next/dist/docs/
[SEC]     Rate limiting на все POST эндпоинты
[SEC]     Секреты только в env, никогда в client code
[CONV]    Каждая секция → к заявке. Конверсия > визуал
```

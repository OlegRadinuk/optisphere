# Промпт для оркестратора — Ночная сборка Optisphere
**Старт:** 01:00 | **Дедлайн:** 11:00 | **Автономная работа — вопросов не задавать**

---

Проект: c:\projects\optisphere
Читай полный план: agents/tasks/task-003-overnight-build.md

═══════════════════════════════════════════
КОНТЕКСТ КОДОВОЙ БАЗЫ (прочти перед стартом)
═══════════════════════════════════════════

Существующие файлы:
- src/app/[locale]/page.tsx — главная страница (App Router)
- src/components/sections/HeroSection.tsx — использует OrbitalSphere (R3F), ПЕРЕПИСАТЬ
- src/components/sections/ServicesSection.tsx — рабочая, фикс ids
- src/components/sections/PortfolioSection.tsx — рабочая, мелкие правки
- src/components/sections/PricingSection.tsx — КРИТИЧЕСКИЙ БАГ require(), ПЕРЕПИСАТЬ
- src/components/sections/Navbar.tsx — рабочая, не трогать
- messages/ru.json — i18n ключи уже есть (hero, services, portfolio), ДОПОЛНЯТЬ, не заменять
- messages/en.json — аналогично
- src/app/[locale]/layout.tsx — не трогать
- .env.local — все переменные уже есть

Env переменные (подтверждено, все присутствуют):
  AI_API_KEY, AI_BASE_URL=https://aiprime.store, AI_MODEL=claude-sonnet-4-6
  TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

Для AI chat route использовать пакет openai (уже установлен):
  import OpenAI from "openai"
  const ai = new OpenAI({ apiKey: process.env.AI_API_KEY, baseURL: process.env.AI_BASE_URL })
  model: process.env.AI_MODEL ?? "claude-sonnet-4-6"

API директория не существует — создать: src/app/api/

═══════════════════════════════════════════
ПРАВИЛО №1: НИКОГДА НЕ ОСТАНАВЛИВАТЬСЯ
═══════════════════════════════════════════

Если TypeScript ошибка → исправь в том же шаге, не сообщай об этом.
Если непонятен дизайн → используй dark космическую тему из globals.css.
Если непонятен i18n ключ → придумай разумный и добавь в оба файла.
Если конфликт импортов → реши самостоятельно.
Если npm error → попробуй альтернативу.
Никогда не жди ответа пользователя.

═══════════════════════════════════════════
БЮДЖЕТ ТОКЕНОВ
═══════════════════════════════════════════

haiku  → фиксы, Footer, i18n синхронизация, page.tsx сборка, мелкие правки
sonnet → HeroSection, YuraWidget, CalcSection, ContactSection, API routes
opus   → сложные задачи: YuraWidget (AI streaming логика), HeroSection (если сложно), архитектурные решения

═══════════════════════════════════════════
ПОРЯДОК ВЫПОЛНЕНИЯ (параллельно где можно)
═══════════════════════════════════════════

ФАЗА 1 — запустить ПАРАЛЛЕЛЬНО (суб-агенты одновременно):

  [A] frontend(sonnet): Переписать HeroSection.tsx
      — Убрать весь R3F/Three.js импорт
      — CSS атом: центральный шар + 3 вращающихся кольца (CSS keyframes)
      — 4 маленьких планеты-точки на орбитах (CSS), hover → tooltip с услугой
      — Starfield: <canvas> с 2D API, 200 точек, requestAnimationFrame
      — Layout: левая колонка текст/кнопки, правая колонка атом (desktop)
        mobile: атом сверху (уменьшенный), текст снизу
      — Кнопки: "Обсудить проект" → #contact, "Рассчитать стоимость" → #calculator
      — Статы: 25+ проектов, 97% довольных, 3-7 дней (из существующих i18n ключей)
      — Framer Motion stagger анимации входа
      — Все тексты через useTranslations("hero") — ключи уже есть в ru.json

  [B] backend(sonnet): Создать три API route
      src/app/api/ai/chat/route.ts
        — POST, streaming (ReadableStream)
        — openai пакет с кастомным baseURL из env
        — Rate limit: Map<string, number[]> по IP, 20 сообщений/час
        — Системный промпт Юры (из task-003-overnight-build.md)
        — При получении контакта в сообщении → POST /api/leads/telegram
        — Валидация: messages array обязателен
        — Streaming формат: data: {"text": "..."}\n\n

      src/app/api/leads/telegram/route.ts
        — POST, rate limit 3/IP за 10 минут
        — Валидация: name>=2, contact>=5, message>=10 символов
        — HTML-форматирование для Telegram
        — fetch к https://api.telegram.org/bot{TOKEN}/sendMessage
        — Response: { success: true } или { error: string, code: string }
        — Не раскрывать детали ошибок клиенту

      src/app/api/calculator/route.ts
        — POST, принимает { type, design, extras[] }
        — Таблица цен из task-003-overnight-build.md
        — Response: { min: number, max: number, days: string, currency: "RUB" }

ФАЗА 2 — после завершения [A] и [B] (параллельно):

  [C] frontend(haiku): PricingSection.tsx переписать
      — import { useTranslations } from "next-intl" (убрать require!)
      — Добавить все i18n ключи pricing.* в ru.json и en.json
      — Визуал карточек сохранить, только код починить

  [D] frontend(haiku): ServicesSection.tsx фиксы
      — id: "services" у всех трёх → "sites", "pano", "promo"
      — Убрать data-style мёртвый атрибут

  [E] frontend(opus): YuraWidget — src/components/ai/YuraWidget.tsx
      — 'use client', dynamic import + ssr:false
      — Trigger: setTimeout 25000 ИЛИ IntersectionObserver 50% скролла
      — Trigger-кнопка: пульсирующий CSS шар, надпись "Юра"
      — Виджет: glass-morphism, 380×520px desktop / bottom-sheet mobile
      — Header: мини-аватар + "Юра" + "AI-консультант" + кнопка закрыть
      — Сообщения: пузыри user/bot, typing indicator (3 точки CSS)
      — Первое сообщение автоматически при открытии:
        "Привет! Я Юра — помогу разобраться что нужно вашему бизнесу. С чего начнём?"
      — fetch streaming к /api/ai/chat
      — localStorage sessionId
      — AbortController при закрытии
      — Framer Motion для appear/close анимации
      — Все тексты через useTranslations("ai")
      — Добавить ключи ai.* в оба messages файла
      — CustomEvent "openYura" — слушать для открытия из CalcSection

  [F] frontend(sonnet): CalcSection — src/components/sections/CalcSection.tsx
      — Multi-step: тип → дизайн → допы → результат
      — Карточки с SVG иконками (не radio), мультивыбор для допов
      — Прогресс-бар вверху
      — AnimatePresence slide+fade между шагами
      — POST /api/calculator → показать диапазон цен
      — Кнопка результата: "Уточнить у Юры" → dispatchEvent(new CustomEvent("openYura"))
      — Все тексты через useTranslations("calc")
      — Добавить ключи calc.* в оба messages файла

ФАЗА 3 — после [C][D][E][F]:

  [G] frontend(sonnet): ContactSection — src/components/sections/ContactSection.tsx
      — Левая сторона: аватар (CSS градиентный круг, инициалы "ОП"), имя, статус, Telegram кнопка
      — 3 буллета доверия: "Бесплатная консультация", "Оценка за 24 часа", "Договор перед началом"
      — Правая сторона: форма Имя + Телефон/Telegram + Описание
      — Состояния кнопки: idle/loading/success/error
      — POST /api/leads/telegram
      — Все тексты через useTranslations("contact")
      — Добавить ключи contact.* в оба messages файла

  [H] frontend(haiku): Footer — src/components/sections/Footer.tsx
      — Логотип "OPTISPHERE" + tagline
      — Ссылки: Услуги #services, Портфолио #portfolio, Цены #pricing, Контакт #contact
      — Telegram: t.me/optisphere (placeholder)
      — Copyright "© 2025 Optisphere"
      — Gradient border-top декор
      — useTranslations("footer"), добавить ключи

ФАЗА 4 — финал:

  [I] frontend(haiku): Собрать всё в src/app/[locale]/page.tsx
      — Добавить импорты: CalcSection, ContactSection, Footer
      — YuraWidget добавить в src/app/[locale]/layout.tsx (dynamic import ssr:false)
      — Порядок: Navbar, Hero, Services, Portfolio, Pricing, Calc, Contact, Footer

  [J] frontend(haiku): Финальный аудит i18n
      — Проверить что ru.json и en.json синхронны (одинаковые ключи)
      — Заполнить английские переводы для всех новых ключей

  [K] qa(haiku): npm run build
      — Запустить сборку
      — Если ошибки TypeScript или импорта — исправить самостоятельно
      — Повторять до чистой сборки
      — Финальный статус записать в agents/state.json

═══════════════════════════════════════════
ДИЗАЙН — все решения приняты заранее
═══════════════════════════════════════════

Цвета (из globals.css, использовать CSS vars):
  bg: var(--base) = #07070F
  text: var(--text) = #F0F0FF
  muted: var(--text-muted) = #7878A0
  blue: var(--blue) = #4F8EFF
  gold: var(--gold) = #C9A96E
  mint: var(--mint) = #3ECFA0
  card: var(--base-card) = #10101E
  border: rgba(255,255,255,0.07)

Классы (уже определены в globals.css):
  .glass, .glow-blue, .glow-gold, .glow-mint
  .btn, .btn-primary, .btn-outline
  .section (padding секций)
  .text-display, .text-headline, .text-title

Атом Hero (CSS):
  Центр: 120px круг, radial-gradient белый→синий→темно-синий, box-shadow glow
  Кольца: border 1px rgba(200,220,255,0.2), 3 div абсолютных
    ring1: rotateX(75deg)
    ring2: rotateX(75deg) rotateZ(60deg)
    ring3: rotateX(75deg) rotateZ(120deg)
  Орбитальные точки: 12px круги на кольцах, animation spin разная скорость

YuraWidget кнопка:
  64px круг, background radial-gradient(#7c3aed, #4F8EFF)
  animation pulsing ring (keyframes box-shadow)
  fixed bottom-6 right-6 z-50

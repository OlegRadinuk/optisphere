# Optisphere — Project State & Design System
> Последнее обновление: 2026-04-30. Единый источник правды по текущему стейту, дизайну и плану.

---

## 1. Что это за проект

**Optisphere / Оптисфера** — веб-студия в Крыму, позиционируется как **первая AI-first компания в Крыму**.

- **Владелец:** Олег Радинук
- **Главная задача сайта:** конверсия в клиента через AI-ассистента "Опти"
- **Технический стек:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4
- **Развёрнут:** сервер Selectel, PM2 (#0), порт 3001, nginx reverse proxy
- **Репозиторий:** github.com/OlegRadinuk/optisphere (ветка main)
- **Деплой:** `./deploy.sh` → `ssh ops 'cd /home/deploy/app && git pull && npm run build && pm2 restart optisphere'`

---

## 2. Продукты и цены

### Сайты (разовые)
| Тариф   | Цена      | Срок     | Описание |
|---------|-----------|----------|----------|
| START   | от 50 000 ₽ | 3–5 дн  | Лендинг |
| PRO     | от 120 000 ₽ | 5–10 дн | Продающий сайт + SEO |
| PREMIUM | от 180 000 ₽ | индив.  | Кастом + 3D + маркетинг |

### Подписка "Спутник" (ежемесячно)
| Тариф        | Цена/мес    |
|--------------|-------------|
| Спутник СТАРТ | 7 000 ₽    |
| Спутник ПРО  | 12 000 ₽    |
| Спутник МАКС | 18 000 ₽    |

### AI-ассистенты (отдельный продукт)
- Белый ярлык на базе платформы Optisphere
- Три SKU: Базовый / Стандарт / Бизнес (цены TBD)
- Монтируется на любой сайт через `<script>` тег

---

## 3. Структура сайта (воронка)

```
1. Hero          — УТП + AI-чат с Опти (квалификация лида)
2. Услуги        — три направления: Сайты / AI-ассистенты / Продвижение
3. Портфолио     — 6 кейсов с фильтрами
4. LiveDemo      — sticky scroll 5×100vh (переключение кадров при скролле)
5. Калькулятор   — диапазон цены → подключается Опти
6. Цены / Тарифы — детали пакетов
7. Доверие       — цифры, логотипы клиентов
8. CTA           — финальный призыв
9. Footer        — контакты, ссылки
```

**Страницы:**
- `/` (главная) + `/blog` + `/cases` + `/services/*` + `/pricing` + `/contact`
- `/aiadmin` — внутренняя CMS для управления AI-ботами
- `/api/bots/[slug]/chat|lead|config|stats` — API ботов

---

## 4. Компоненты (инвентарь)

### Секции главной страницы
| Файл | Статус | Описание |
|------|--------|----------|
| `HeroSection.tsx` | ✅ Готов | 3D сфера + inline-чат с Опти |
| `ServicesPreviewSection.tsx` | ✅ Готов | Превью 3 направлений |
| `ServicesSection.tsx` | ✅ Готов | Детальные карточки услуг |
| `PortfolioSection.tsx` | ✅ Готов | 6 кейсов с фильтрами |
| `LiveDemoSection.tsx` | ✅ Готов | Sticky scroll 5 кадров |
| `CalcSection.tsx` | ✅ Готов | Калькулятор (JetBrains Mono, шаг 01/04) |
| `PricingSection.tsx` | ✅ Готов | Тарифные блоки |
| `ProofSection.tsx` | ✅ Готов | Статистика + отзывы |
| `TeamSection.tsx` | ✅ Готов | Карточки агентов с dept-иконками |
| `AIHookSection.tsx` | ✅ Готов | Секция-хук для AI |
| `FaqSection.tsx` | ✅ Готов | FAQ аккордеон |
| `CTASection.tsx` + `FinalCtaSection.tsx` | ✅ Готов | CTA блоки |
| `Navbar.tsx` | ✅ Готов | Numbered nav, OPTI·READY chip, RU/EN |
| `Footer.tsx` | ✅ Готов | Контакты, i18n ключи |

### AI компоненты
| Файл | Статус | Описание |
|------|--------|----------|
| `HeroInlineChat.tsx` | ✅ Готов | Чат Опти в Hero, прогресс-бар 3 шагов |
| `HeroChatContext.tsx` | ✅ Готов | Zustand контекст чата |
| `LeadForm.tsx` | ✅ Готов | Форма лида с валидацией |
| `OptiWidget.tsx` | ✅ Готов | Виджет для встраивания |
| `OptiWidgetLoader.tsx` | ✅ Готов | Lazy загрузчик виджета |

### 3D / визуал
| Файл | Статус | Описание |
|------|--------|----------|
| `NexusSphere.tsx` | ✅ Готов | Главная 3D сфера (WebGL + шейдеры) |
| `HeroStage.tsx` | ✅ Готов | R3F stage, FloatCard, WireSphere |
| `LoadingScreen.tsx` | ✅ Готов | OPTI.KERNEL boot screen (1 раз/сессию) |
| `TransitionProvider.tsx` | ✅ Готов | Scan-line overlay между страницами |

### Публичный виджет (widget.js)
- `/public/widget.js` — standalone виджет для вставки на клиентские сайты
- Монтируется через `<script data-bot="slug" src="...">` тег
- Хранит сессию в localStorage, поддерживает lead-форму
- Кнопка очистки истории (`#opsph-clear`) — **добавлена 2026-04-30**
- ⚠️ **Следующий шаг: переписать на Shadow DOM** — для работы нескольких виджетов на одной странице (изоляция стилей)

---

## 5. Дизайн-система (текущая)

### Цветовая палитра

**Тёмная тема (основная):**
```
Base:      #060606   ← почти чёрный, фон страниц
Surface:   #111111   ← карточки, панели
Elevated:  #1a1a1a   ← навбар при скролле, модалки
Text:      #ffffff   ← основной текст
Secondary: #888888   ← вторичный текст
Muted:     #555555   ← плейсхолдеры, метки
Accent:    #e82020   ← красный, единственный цвет
Border:    rgba(255,255,255,0.08) ← разделители
Strong:    rgba(255,255,255,0.16) ← акцентные рамки
```

**Светлая тема (через переключатель в navbar):**
```
Base:      #F7F7F5
Surface:   #FFFFFF
Border:    #E5E5E5
Text:      #111111
Muted:     #666666
Accent:    #FF2A2A (чуть ярче)
```

### Шрифты
- **Display/UI:** Oxanium — заголовки, navbar
- **Body:** Inter — основной текст, карточки
- **HUD:** JetBrains Mono — статусы, метки, калькулятор

### Ключевые UI-паттерны
- Chamfered кнопки (срезанный угол через `clip-path`)
- Numbered navigation: `01 · 02 · 03`
- HUD-метки: `OPTI·READY`, `LIVE · OPTISPHERE`
- Пульсирующие точки: `animation: pulse 2s ease-in-out infinite`
- Кастомный курсор: красная стрелка + I-beam (SVG-файлы в public/)
- Переходы: scan-line overlay

---

## 6. Дизайн-направление: Azimov Upgrade 🎯

**Вектор редизайна:** от простого тёмного фона → тёмный с белыми геометрическими акцентами в стиле Asiimov AWP из CS2.

### Что такое Azimov-стиль для веба
Asiimov AWP характерен:
- Чёрная база
- Крупные белые/кремовые геометрические фигуры (треугольники, диагональные секции)
- Красная акцентная полоса
- Чёткие угловые линии, высокий контраст

**Перевод в веб:**

#### Фоновые декоративные элементы (тёмная тема)
```
Угловые белые формы (SVG/CSS):
  Большие: opacity 0.03–0.04 (едва видны, дают объём)
  Малые: opacity 0.06–0.08 (чуть заметнее на hover-зонах)

Геометрические линии:
  border: 1px solid rgba(255,255,255,0.06)
  Диагональные: transform: skewY(-8deg) или skewX(-8deg)

Белые срезы секций (вместо прямого разделителя):
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 40px), 0 100%)
  background: rgba(255,255,255,0.015)
```

#### Обновлённые цвета (dark theme — Azimov версия)
```
Base:      #080808   ← чуть темнее для контраста с белым
Surface:   #0f0f0f   ← панели
Elevated:  #161616   ← модалки, dropdown
Border:    rgba(255,255,255,0.10)  ← было 0.08, стало 0.10
StrongBorder: rgba(255,255,255,0.20)  ← было 0.16, стало 0.20
GeoAccent: rgba(255,255,255,0.04)  ← новый: фоновые декор-формы
```

#### Декоративные элементы (новые)
1. **Hero background:** крупные диагональные белые геом. фигуры (SVG или CSS) с opacity 0.03
2. **Section dividers:** не горизонтальные линии, а угловые срезы (clip-path)
3. **Card backgrounds:** тонкий угловой белый штрих в правом верхнем углу карточки (`::before`)
4. **Service icons:** белый контур + красная точка (accent) вместо просто красного контура
5. **CTA секция:** белая диагональная полоса на тёмном фоне + красный акцент

#### Что НЕ меняется
- Красный акцент `#e82020` — остаётся без изменений
- Шрифты: Oxanium + Inter + JetBrains Mono
- HUD-элементы: numbered nav, OPTI·READY, pulse-точки
- Общая структура воронки
- 3D сфера в Hero

#### Внедрение (поэтапно)
1. Обновить CSS custom properties в `globals.css` (цвета + GeoAccent)
2. Добавить декоративные SVG/CSS в Hero background
3. Section dividers: угловые срезы (начать с CalcSection и CTASection)
4. Card corners: `::before` белый штрих
5. Обновить иконки сервисов

---

## 7. AI-платформа (технический стейт)

### База данных (SQLite, `/data/bots.db`)
```sql
clients  — конфиги ботов (slug, api_key, system_prompt, context_url, tg_token, tg_chat_id...)
sessions — диалоги по sessionId
messages — сообщения чата
events   — аналитика (свайпы, leads)
leads    — формы захвата
```

### Активные боты
| Slug | Название | Клиент | Статус |
|------|----------|--------|--------|
| `albamed` | Альбамед | Медклиника | ✅ Active |
| `lifestyle-crimea` | Sofia | life-style-crimea (40 апартаментов) | ✅ Active |
| `vlad` | Влад | TBD | ✅ Active |

### Резервное копирование конфигов
- `bots-seed.json` — файл-сид с конфигами всех ботов
- Расположен: `/home/deploy/app/data/bots-seed.json`
- Загружается при старте через `seedBots()` в `db.ts`
- Путь передаётся через `BOT_SEED_PATH` в `ecosystem.config.js`

### Telegram-уведомления
- Прокси через Cloudflare Worker: `tg-proxy.radinuko.workers.dev`
- При входящем лиде: контакт + последние 10 сообщений + время МСК

---

## 8. Инфраструктура

```
Сервер:   Selectel VPS (SSH алиас: ops)
App dir:  /home/deploy/app
PM2:      optisphere (#0, порт 3001) + lifestyle-sk (#1, порт 3000)
Nginx:    reverse proxy → PM2 → Next.js standalone
SSL:      Let's Encrypt (certbot)
DB:       SQLite WAL mode, файл /home/deploy/app/data/bots.db
Seed:     /home/deploy/app/data/bots-seed.json
Env:      ecosystem.config.js (BOT_SEED_PATH, TELEGRAM_*, ADMIN_*)
```

### PM2 ecosystem.config.js (ключевые поля)
```js
{
  name: 'optisphere',
  script: '.next/standalone/server.js',
  env: {
    BOT_SEED_PATH: '/home/deploy/app/data/bots-seed.json',
    TELEGRAM_BOT_TOKEN: '...',
    TELEGRAM_CHAT_ID: '...',
    ADMIN_PASSWORD: '...',
  }
}
```

---

## 9. План ближайших работ (5 блоков)

### 🔴 Блок 1 — Надёжность БД (Приоритет #1)
- [ ] `db.ts` — добавить `PRAGMA wal_autocheckpoint = 1000`
- [ ] `db.ts` — SIGTERM/SIGINT хук: `wal_checkpoint(TRUNCATE)` + `db.close()`
- [ ] `ecosystem.config.js` — `kill_timeout: 5000`
- [ ] `deploy.sh` — `sqlite3 integrity_check` перед деплоем
- [ ] Сервер — cron ежедневный бэкап bots.db (ротация 7 дней)
- [ ] `data/backups/` — создать директорию

### 🟡 Блок 2 — Health-check + Self-healing
- [ ] API `/api/health/bots` — тестовый диалог с каждым ботом
- [ ] Cron каждые 10 мин → вызов `/api/health/bots`
- [ ] Telegram-алерт при сбое
- [ ] Auto `pm2 restart` при сбое + recheck через 2 мин
- [ ] UptimeRobot HTTP-монитор на `/api/health/bots`

### 🔵 Блок 3 — widget.js → Shadow DOM
- [ ] Переписать `public/widget.js` на Shadow DOM
- [ ] Один `<script data-bot="slug">` = один изолированный виджет
- [ ] Поддержка нескольких виджетов на одной странице без конфликтов
- [ ] Это prerequisite для /demo страницы

### 🟢 Блок 4 — Страница /demo
- [ ] Карточки всех ботов (логотип, ниша, описание)
- [ ] Кнопка "Поговорить" разворачивает виджет прямо на странице
- [ ] Секция на главной (3-4 карточки + разворот по клику)
- [ ] Полноценная `/assistants` с фильтрами по нише

### 🟣 Блок 5 — Мониторинг-дашборд в /aiadmin
- [ ] Раздел "Мониторинг" в admin
- [ ] Индикатор бота: зелёный/жёлтый/красный
- [ ] Последний health-check: когда, ответил ли
- [ ] context_url: доступен / последний фетч
- [ ] Диалоги за 24ч / 7д
- [ ] Алерты: бот > 5 мин не отвечает, context_url > 15 мин недоступен

---

## 10. SEO-статус

- Google Search Console: подключён (OAuth, radinukoleg@gmail.com)
- GSC_REFRESH_TOKEN: в `.env.local`
- sitemap.xml: `/app/sitemap.ts` (авто-генерация)
- robots.txt: `/app/robots.ts`
- OG-изображение: динамическое, Edge Runtime, 1200×630
- Schema.org: `JsonLd.tsx` — LocalBusiness + WebSite
- Яндекс Вебмастер: ⚠️ не подключён (в backlog)

---

## 11. i18n

- next-intl v4.9.0
- Языки: RU (дефолт) + EN
- Тексты: `messages/ru.json` + `messages/en.json`
- URLs: `/` = RU, `/en/` = EN
- Правило: **никакого hardcoded текста** — только i18n ключи

---

## 12. Правила разработки

1. **Не хардкодить текст** — только i18n ключи
2. **Не использовать `any`** в TypeScript
3. **3D-компоненты** — только через `dynamic import, {ssr: false}`
4. **Secrets** — только в API routes, никогда в client components
5. **Mobile first** — responsive с sm→lg breakpoints
6. **Loading states** — обязательно везде где async
7. **Telegram proxy** — `tg-proxy.radinuko.workers.dev` (Крым блокирует telegram.org)

---

## 13. Файловая структура (ключевые файлы)

```
optisphere/
├── CLAUDE.md                    ← правила проекта, дизайн-система
├── AGENTS.md                    ← состав команды агентов
├── deploy.sh                    ← деплой-скрипт
├── spec/
│   ├── PROJECT_STATE.md         ← этот файл (единый источник правды)
│   └── design-white.md          ← детальная спека светлой темы
├── agents/
│   ├── ideas.md                 ← backlog идей (оркестратор пишет сюда)
│   ├── state.json               ← стейт агентной системы
│   └── local/                   ← role-based оверлеи агентов
├── messages/
│   ├── ru.json                  ← русский текст
│   └── en.json                  ← английский текст
├── public/
│   ├── widget.js                ← публичный виджет (embed на клиент.сайты)
│   ├── logo/                    ← SVG логотип
│   └── portfolio/               ← изображения кейсов
├── data/
│   └── bots.db                  ← SQLite (боты, сессии, лиды)
└── src/
    ├── app/                     ← Next.js App Router (страницы + API)
    ├── components/              ← React компоненты
    ├── lib/                     ← утилиты (db.ts, auth.ts, seo.ts...)
    ├── hooks/                   ← useVoice и другие
    └── i18n/                    ← next-intl конфиг
```

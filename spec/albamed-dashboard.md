# Albamed Dashboard — Design Specification

**Проект:** optisphere / internal admin  
**Маршруты:** `/albamed`, `/albamed/leads`, `/albamed/sessions/[sessionId]`, `/albamed/doctors`  
**Аудитория:** Администратор клиники, ноутбук + редко телефон  
**Режим:** Тёмная admin-тема, совместима с `/aiadmin`

---

## Design Tokens

```
bg-base:     #0f172a   /* фон страницы, sidebar */
bg-surface:  #1e293b   /* карточки, таблицы, инпуты */
bg-hover:    #293548   /* hover по строкам таблицы, nav items */
border:      #334155   /* все границы */
text:        #e2e8f0   /* основной текст */
text-muted:  #94a3b8   /* вторичный текст, подписи */
accent:      #3b82f6   /* кнопки primary, ссылки, активный nav */
success:     #22c55e   /* статус closed, позитивные метки */
warning:     #f59e0b   /* статус working */
danger:      #ef4444   /* ошибки, удаление */

font-family: system-ui, -apple-system, sans-serif
font-size-base: 14px
font-size-sm: 12px
font-size-lg: 16px
font-size-xl: 20px
font-size-2xl: 24px

border-radius-sm: 6px
border-radius-md: 8px
border-radius-lg: 12px

sidebar-width: 220px
content-padding: 24px
table-row-height: 48px
```

Статусные цвета лидов:
```
new:     bg=#1d3461  text=#3b82f6  label="Новый"
working: bg=#3d2e0a  text=#f59e0b  label="В работе"
closed:  bg=#0f2a1a  text=#22c55e  label="Закрыт"
```

---

## Общий Layout

Все страницы `/albamed/*` используют один shell-layout:

```
┌──────────────────────────────────────────────┐
│  Sidebar (220px fixed) │  Main content        │
│                        │  padding: 24px       │
│                        │                      │
│  [nav items]           │  [page content]      │
│                        │                      │
│  [Выйти — внизу]       │                      │
└──────────────────────────────────────────────┘
```

**Sidebar:**
- `position: fixed; top: 0; left: 0; height: 100vh; width: 220px`
- `background: #0f172a; border-right: 1px solid #334155`
- Логотип / название "Альба-Мед" вверху — `font-size: 14px; font-weight: 600; color: #e2e8f0; padding: 20px 16px`
- Навигационные элементы: `padding: 10px 16px; border-radius: 6px; color: #94a3b8`
- Активный элемент: `background: #1e293b; color: #3b82f6`
- Hover: `background: #293548; color: #e2e8f0`
- Кнопка "Выйти": `position: absolute; bottom: 20px; left: 16px; right: 16px`

**Main content:**
- `margin-left: 220px; min-height: 100vh; background: #0f172a; padding: 24px`

**Mobile (< 768px):**
- Sidebar скрыт, вместо него hamburger-кнопка `position: fixed; top: 12px; left: 12px`
- Sidebar открывается как drawer поверх контента с `backdrop`
- Main content `margin-left: 0`

---

## Навигация Sidebar

| Иконка | Лейбл | Маршрут | Badge |
|---|---|---|---|
| `grid` (2x2 квадрат) | Обзор | `/albamed` | — |
| `person` (силуэт) | Лиды | `/albamed/leads` | число новых лидов, `background: #3b82f6; color: #fff; border-radius: 9999px; padding: 1px 6px; font-size: 11px` |
| `chat-bubble` | Диалоги | `/albamed/sessions` | — |
| `stethoscope` | Врачи | `/albamed/doctors` | — |
| `logout` | Выйти | POST `/api/albamed/logout` | — |

Иконки — inline SVG (24x24), `currentColor`. Не использовать иконочные шрифты.

---

## Страница 1: `/albamed` — Обзор

### Stat Cards (4 в ряд)

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Лидов       │ │ Всего       │ │ Диалогов    │ │ Конверсия   │
│ сегодня     │ │ лидов       │ │ сегодня     │ │             │
│             │ │             │ │             │ │             │
│   12        │ │   348       │ │   7         │ │   34%       │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

Каждая карточка:
- `background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px`
- Лейбл: `font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em`
- Число: `font-size: 28px; font-weight: 700; color: #e2e8f0; margin-top: 8px`
- Desktop: `display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px`
- Mobile: `grid-template-columns: repeat(2, 1fr)`

**Loading state:** число заменяется на `<div style="width:60px;height:28px;background:#334155;border-radius:4px">` (skeleton)

### График активности по часам

Простой SVG бар-чарт. Без внешних библиотек.

```
Активность за сегодня
┌────────────────────────────────────────────────────────┐
│                                                        │
│  ▌  ▌     ▌  ██     ██  ▌  ██  ▌  ▌                  │
│  ▌  ▌  ▌  ▌  ██  ▌  ██  ██ ██  ██ ▌                  │
│  ▌  ▌  ▌  ██ ██  ██ ██  ██ ██  ██ ██                 │
└─────────────────────────────────────────────────────── │
  00  02  04  06  08  10  12  14  16  18  20  22
```

Обёртка: `background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px; margin-top: 16px`

Заголовок секции: `font-size: 14px; font-weight: 600; color: #e2e8f0; margin-bottom: 16px`

SVG параметры:
- `viewBox="0 0 600 120"`, `width: 100%`, `height: auto`
- Bars: `fill: #3b82f6; rx: 2`
- Hover на бар: `fill: #60a5fa`
- Tooltip: `position: absolute; background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 4px 8px; font-size: 12px; color: #e2e8f0`
- Ось X: текст часов `fill: #94a3b8; font-size: 10px`

Данные: массив `{ hour: 0..23, count: number }`, высота бара = `(count / maxCount) * 100` (px в рамках SVG).

**Empty state (нет данных):** текст по центру SVG — `fill: #94a3b8; font-size: 13px` "Нет активности за сегодня"

### Таблица последних лидов

Заголовок секции + кнопка справа:
```
Последние лиды                              [Все лиды →]
```

- Кнопка "Все лиды": `background: transparent; border: 1px solid #334155; color: #94a3b8; border-radius: 6px; padding: 6px 12px; font-size: 13px` + hover `border-color: #3b82f6; color: #3b82f6`

Таблица: 5 строк, колонки: Дата | Имя | Телефон | Статус

- Обёртка: `background: #1e293b; border: 1px solid #334155; border-radius: 8px; overflow: hidden; margin-top: 16px`
- `<table style="width:100%;border-collapse:collapse">`
- Шапка `<thead>`: `background: #0f172a; color: #94a3b8; font-size: 12px; text-transform: uppercase`
- Ячейки шапки: `padding: 10px 16px; text-align: left; border-bottom: 1px solid #334155`
- Строки `<tbody>`: `color: #e2e8f0; font-size: 14px`
- Ячейки строк: `padding: 12px 16px; border-bottom: 1px solid #334155`
- Последняя строка без border-bottom
- Row hover: `background: #293548`

Статус в таблице — цветной badge (см. статусные цвета выше): `border-radius: 9999px; padding: 2px 8px; font-size: 12px; font-weight: 500`

**Loading state:** 5 строк-скелетонов, ячейки заменены серыми прямоугольниками `background: #334155; border-radius: 4px`

**Empty state:** одна строка на всю ширину, текст по центру: `color: #94a3b8` "Лидов пока нет"

---

## Страница 2: `/albamed/leads` — Лиды

### Фильтр-табы

```
[ Все ] [ Новые (12) ] [ В работе (5) ] [ Закрытые (31) ]
```

- Обёртка: `display: flex; gap: 4px; margin-bottom: 16px`
- Каждый таб: `padding: 7px 14px; border-radius: 6px; font-size: 13px; cursor: pointer; border: none`
- Неактивный: `background: #1e293b; color: #94a3b8`
- Активный: `background: #3b82f6; color: #fff`
- Hover неактивного: `background: #293548; color: #e2e8f0`
- Число в скобках — часть текста таба, не отдельный badge

### Таблица лидов

Обёртка аналогична таблице на обзоре.

Колонки: Дата | Имя | Телефон | Сообщение | Статус | Переписка

Ширины (примерные):
- Дата: 140px
- Имя: 160px
- Телефон: 140px
- Сообщение: auto (flex-grow)
- Статус: 140px
- Переписка: 100px

**Колонка "Сообщение":**
- Текст обрезан в одну строку: `white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 280px`
- Полный текст в `title` атрибуте ячейки

**Колонка "Статус" — inline dropdown:**
```html
<select style="background:#1d3461;color:#3b82f6;border:1px solid #3b82f6;border-radius:6px;padding:4px 8px;font-size:12px;cursor:pointer">
  <option value="new">Новый</option>
  <option value="working">В работе</option>
  <option value="closed">Закрыт</option>
</select>
```
При смене значения — сразу PATCH `/api/albamed/leads/:id` `{ status: value }`.
Цвета select меняются вместе со статусом (JS):
- `new`: `background:#1d3461; color:#3b82f6; border-color:#3b82f6`
- `working`: `background:#3d2e0a; color:#f59e0b; border-color:#f59e0b`
- `closed`: `background:#0f2a1a; color:#22c55e; border-color:#22c55e`

**Колонка "Переписка":**
- Если `session_id` есть: ссылка `<a href="/albamed/sessions/{id}">Открыть →</a>` — `color: #3b82f6; font-size: 13px; text-decoration: none` + hover `text-decoration: underline`
- Если нет: `color: #334155; font-size: 13px` "—"

**Пагинация** (если лидов > 20):
```
← Пред.   Страница 1 из 5   След. →
```
- Кнопки: `background: #1e293b; border: 1px solid #334155; color: #94a3b8; border-radius: 6px; padding: 6px 12px; font-size: 13px`
- Активная страница (в будущем при множественных): `color: #3b82f6; border-color: #3b82f6`

**Состояния:**
- Loading: skeleton-строки (10 штук)
- Empty (для выбранного фильтра): иконка + текст по центру таблицы `color: #94a3b8` "Лидов нет"
- Error: `color: #ef4444` "Ошибка загрузки. Попробуйте обновить страницу."

**Mobile:** таблица горизонтально скроллируется `overflow-x: auto`. Минимальная ширина таблицы `min-width: 700px`.

---

## Страница 3: `/albamed/sessions/[sessionId]` — Диалог

### Метаданные сессии

Карточка сверху: `background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 16px 20px; margin-bottom: 16px; display: flex; gap: 24px; align-items: center; flex-wrap: wrap`

Поля:
- `Дата:` `<время ISO → отформатировать в ДД.ММ.ГГГГ ЧЧ:ММ>` — `color: #e2e8f0`
- `Сообщений:` `<число>` — `color: #e2e8f0`
- `Лид:` если есть — `color: #22c55e` "Оставлен", если нет — `color: #94a3b8` "Не оставлен"

Каждое поле: `font-size: 13px; color: #94a3b8` лейбл + `color: #e2e8f0` значение

### Карточка лида (если лид есть)

`background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 16px 20px; margin-bottom: 16px`

```
Лид из этого диалога
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Имя:      Анна Петрова
Телефон:  +7 978 123 45 67
Статус:   [dropdown — аналогичен таблице лидов]
```

Лейблы `color: #94a3b8; font-size: 13px`, значения `color: #e2e8f0; font-size: 14px`.
Dropdown статуса — идентичен тому, что на странице лидов.

### Чат-интерфейс

Обёртка: `background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 16px; display: flex; flex-direction: column; gap: 12px`

**Сообщение пользователя (справа):**
```
                                ┌──────────────────────────┐
                                │  Здравствуйте, мне нужна │
                                │  запись к стоматологу    │
                                └──────────────────────────┘
                                        14:32
```
- `align-self: flex-end; max-width: 70%`
- Bubble: `background: #1d3461; border: 1px solid #3b82f6; border-radius: 12px 12px 2px 12px; padding: 10px 14px; color: #e2e8f0; font-size: 14px; line-height: 1.5`
- Время: `font-size: 11px; color: #94a3b8; text-align: right; margin-top: 4px`

**Сообщение ассистента (слева):**
```
┌──────────────────────────────────┐
│  Здравствуйте! Я помогу вам      │
│  записаться. Как вас зовут?      │
└──────────────────────────────────┘
14:32
```
- `align-self: flex-start; max-width: 70%`
- Bubble: `background: #293548; border: 1px solid #334155; border-radius: 12px 12px 12px 2px; padding: 10px 14px; color: #e2e8f0; font-size: 14px; line-height: 1.5`
- Время: `font-size: 11px; color: #94a3b8; margin-top: 4px`

Над чатом — label: `font-size: 13px; font-weight: 600; color: #94a3b8; margin-bottom: 8px` "Переписка"

**Состояния:**
- Loading: 3 skeleton-bubble (чередуются слева/справа)
- Empty: `color: #94a3b8; text-align: center; padding: 40px 0` "Сообщений нет"
- Error: `color: #ef4444` "Ошибка загрузки диалога"

**Кнопка назад:**
`← Все лиды` — вверху страницы: `color: #94a3b8; font-size: 13px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; margin-bottom: 16px` + hover `color: #e2e8f0`

---

## Страница 4: `/albamed/doctors` — Расписание врачей

### Таблица расписания

Обёртка стандартная (background surface, border, border-radius 8px).

Колонки: Врач | Специальность | Филиал | Пн | Вт | Ср | Чт | Пт | Сб | Вс | Активен

Ширины:
- Врач: 180px
- Специальность: 160px
- Филиал: 140px
- Дни (7 колонок): 44px каждая, по центру
- Активен: 80px, по центру

**Ячейки дней — toggle-checkbox:**
```html
<input type="checkbox" checked={isWorking} onChange={handleDayToggle} />
```
Стилизованный через CSS (без внешних библиотек):
- Обёртка: `width: 20px; height: 20px; cursor: pointer`
- Checked: `accent-color: #3b82f6` (нативный, поддерживается везде)
- Unchecked визуально серый
- При клике: немедленно PATCH `/api/albamed/doctors/:id/schedule` `{ day: "mon", active: boolean }`
- Пока идёт запрос: чекбокс `disabled`, `opacity: 0.5`
- Ошибка: чекбокс откатывается к предыдущему состоянию + toast `color: #ef4444` "Не удалось сохранить"

**Колонка "Активен" — inline toggle:**
```
[  ●    ]  ← включён (синий)
[    ●  ]  ← выключен (серый)
```
CSS toggle switch (чистый CSS + JS, без библиотек):
- Track включён: `background: #3b82f6`
- Track выключён: `background: #334155`
- Thumb: `background: #fff; border-radius: 50%`
- При клике: PATCH `/api/albamed/doctors/:id` `{ active: boolean }`
- Disabled во время запроса, откат при ошибке

**Toast-уведомления (глобальные для страницы):**
- Позиция: `position: fixed; bottom: 24px; right: 24px; z-index: 1000`
- Успех: `background: #0f2a1a; border: 1px solid #22c55e; color: #22c55e; border-radius: 8px; padding: 10px 16px; font-size: 13px`
- Ошибка: `background: #2a0f0f; border: 1px solid #ef4444; color: #ef4444`
- Автоскрытие через 3 сек

**Состояния:**
- Loading: skeleton-строки
- Empty: `color: #94a3b8; text-align: center; padding: 40px 0` "Врачи не найдены"
- Error: `color: #ef4444; padding: 20px` "Ошибка загрузки. Обновите страницу."

**Mobile:** таблица горизонтально скроллируется, `min-width: 800px`. Дни недели сокращаются до "Пн" и т.д. (уже сокращены).

---

## Компоненты для создания

| Компонент | Путь | Описание |
|---|---|---|
| `AlbamedLayout` | `components/albamed/AlbamedLayout.tsx` | Shell с sidebar и main. Принимает `children`. |
| `AlbamedSidebar` | `components/albamed/AlbamedSidebar.tsx` | Навигация. Принимает `activePath`, `newLeadsCount`. |
| `StatCard` | `components/albamed/StatCard.tsx` | Одна stat-карточка. Props: `label`, `value`, `loading`. |
| `ActivityChart` | `components/albamed/ActivityChart.tsx` | SVG бар-чарт. Props: `data: {hour,count}[]`, `loading`. |
| `LeadsTable` | `components/albamed/LeadsTable.tsx` | Таблица лидов. Props: `leads`, `loading`, `onStatusChange`. |
| `StatusBadge` | `components/albamed/StatusBadge.tsx` | Цветной badge статуса. Props: `status: 'new'|'working'|'closed'`. |
| `StatusSelect` | `components/albamed/StatusSelect.tsx` | Inline dropdown статуса. Props: `leadId`, `current`, `onChange`. |
| `LeadFilterTabs` | `components/albamed/LeadFilterTabs.tsx` | Фильтр-табы. Props: `active`, `counts`, `onChange`. |
| `ChatMessage` | `components/albamed/ChatMessage.tsx` | Bubble сообщения. Props: `role: 'user'|'assistant'`, `text`, `time`. |
| `DoctorRow` | `components/albamed/DoctorRow.tsx` | Строка таблицы врачей с чекбоксами и toggle. |
| `InlineToggle` | `components/albamed/InlineToggle.tsx` | CSS toggle switch. Props: `checked`, `onChange`, `disabled`. |
| `SkeletonRow` | `components/albamed/SkeletonRow.tsx` | Skeleton для строк таблицы. Props: `cols`. |
| `Toast` | `components/albamed/Toast.tsx` | Уведомление. Props: `type: 'success'|'error'`, `message`. Singleton через context. |
| `SectionHeader` | `components/albamed/SectionHeader.tsx` | Заголовок секции + опциональная кнопка справа. |

---

## API эндпоинты (ожидаемые)

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/albamed/stats` | `{ leadsToday, leadsTotal, sessionsToday, conversion }` |
| GET | `/api/albamed/activity` | `{ data: [{hour, count}] }` |
| GET | `/api/albamed/leads` | `?status=new|working|closed|all&page=1&limit=20` |
| PATCH | `/api/albamed/leads/:id` | `{ status }` |
| GET | `/api/albamed/sessions/:id` | `{ metadata, lead?, messages }` |
| GET | `/api/albamed/doctors` | Список врачей с расписанием |
| PATCH | `/api/albamed/doctors/:id` | `{ active }` |
| PATCH | `/api/albamed/doctors/:id/schedule` | `{ day: 'mon'|...'sun', active: boolean }` |

---

## Состояния компонентов (сводка)

| Состояние | Визуал |
|---|---|
| Loading / skeleton | Прямоугольники `background: #334155; border-radius: 4px; animation: pulse 1.5s ease infinite` |
| Empty | Иконка (опционально) + текст `color: #94a3b8`, центрирован |
| Error | Текст `color: #ef4444`, кнопка "Повторить" `border: 1px solid #ef4444; color: #ef4444; border-radius: 6px; padding: 6px 12px` |
| Saving (inline) | `opacity: 0.5; pointer-events: none` на элементе управления |
| Success toast | Зелёная плашка, fixed bottom-right, исчезает через 3 сек |
| Error toast | Красная плашка, аналогично |

---

## Анимации

Никаких кастомных анимаций. Только:
- Skeleton pulse: `@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }` — стандартный Tailwind `animate-pulse` или inline
- Hover-переходы: `transition: background 150ms, color 150ms, border-color 150ms` на интерактивных элементах

---

## Замечания для frontend

1. Компоненты живут в `components/albamed/` — не смешивать с другими admin-компонентами
2. Все страницы оборачиваются в `AlbamedLayout` — layout-файл `app/albamed/layout.tsx`
3. Auth guard на уровне layout: если нет cookie сессии — редирект на `/aiadmin/login` или `/albamed/login`
4. `StatusSelect` вызывает PATCH немедленно при `onChange`, без кнопки "Сохранить"
5. `DoctorRow` чекбоксы — аналогично, optimistic update: сразу обновить UI, откатить при ошибке
6. SVG бар-чарт — строить вручную через `<svg>`, без recharts/chart.js. Данные нормализовать относительно `Math.max(...data.map(d=>d.count))`
7. Таблица лидов на mobile — горизонтальный скролл, не скрывать колонки (данные важны)
8. Стандартный Tailwind 4 допустим для утилит (flex, gap, padding), но токены цветов задавать через inline styles или CSS variables — не переопределять тему

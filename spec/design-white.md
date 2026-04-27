# Design Spec — White Asiimov Minimal
## Optisphere Web Studio Redesign

**Режим:** Classic  
**Стиль:** Apple Pro × Industrial Tech × Clean AI Interface  
**Принцип:** точность, интеллект, чистота, система, премиум  
**Стек:** Next.js 16 + Tailwind 4 + CSS Custom Properties

---

## 1. Design Tokens

### Colors — Light Theme
```
--light-bg:        #F7F7F5   /* фон страницы */
--light-surface:   #FFFFFF   /* панели, карточки */
--light-border:    #E5E5E5   /* линии, разделители */
--light-text:      #111111   /* основной текст */
--light-muted:     #666666   /* вторичный текст */
--accent:          #FF2A2A   /* красный акцент */
--accent-hover:    #E01A1A   /* hover-состояние */
```

### Colors — Dark Theme (параллельная, те же компоненты)
```
--dark-bg:         #0A0A0A
--dark-surface:    #141414
--dark-border:     #222222
--dark-text:       #F5F5F5
--dark-muted:      #888888
/* --accent и --accent-hover — идентичны обеим темам */
```

### Shadows (строгий минимализм)
```
--shadow-card:     0 1px 4px rgba(0,0,0,0.06)
--shadow-card-hover: 0 4px 16px rgba(0,0,0,0.08)
--shadow-nav:      0 1px 0 var(--border)      /* только нижняя линия */
```

### Border Radius
```
--radius-sm:   4px    /* теги, labels, mono-badges */
--radius-md:   8px    /* кнопки, поля ввода, карточки — стандарт */
--radius-lg:   12px   /* большие карточки, hero-блок Опти */
--radius-full: 9999px /* только pill-теги при необходимости */
```

### Spacing — шаг 4px
```
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-6:  24px
--space-8:  32px
--space-12: 48px
--space-16: 64px
--space-24: 96px
```

### Container
```
max-width: 1280px
padding-x: 24px (mobile) / 48px (tablet) / 80px (desktop)
```

### Breakpoints
```
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
```

---

## 2. Типографика

### Шрифтовая пара
- **Display / UI:** Inter (variable font, уже подключён) — основная рабочая лошадка для всего интерфейса. Универсальность, техническая читаемость, безупречный рендеринг на Retina.
- **Mono:** JetBrains Mono (уже подключён) — исключительно для HUD-элементов, статусных строк, технических меток.
- Никаких дополнительных шрифтов — система выглядит как продукт, а не как портфолио.

### Шкала

#### H1 — Hero заголовок
```
font-family: Inter, system-ui, sans-serif
font-size:   desktop 64px / tablet 48px / mobile 36px
font-weight: 600 (SemiBold)
line-height: 1.05
letter-spacing: -0.03em
color: var(--text)
```
Красный акцент внутри H1 (одно слово или фраза): `color: var(--accent)`, тот же weight.

#### H2 — Заголовки секций
```
font-family: Inter, system-ui, sans-serif
font-size:   desktop 40px / tablet 32px / mobile 28px
font-weight: 600
line-height: 1.1
letter-spacing: -0.02em
color: var(--text)
```

#### H3 — Заголовки карточек
```
font-family: Inter, system-ui, sans-serif
font-size:   desktop 20px / mobile 18px
font-weight: 600
line-height: 1.25
letter-spacing: -0.01em
color: var(--text)
```

#### Body Large — подзаголовок hero
```
font-family: Inter, system-ui, sans-serif
font-size:   desktop 18px / mobile 16px
font-weight: 400
line-height: 1.6
letter-spacing: 0
color: var(--muted)
max-width: 480px
```

#### Body Regular — основной текст
```
font-family: Inter, system-ui, sans-serif
font-size:   16px
font-weight: 400
line-height: 1.6
letter-spacing: 0
color: var(--text)
```

#### Label / Caption — метки, подписи
```
font-family: Inter, system-ui, sans-serif
font-size:   12px
font-weight: 500
line-height: 1.4
letter-spacing: 0.06em
text-transform: uppercase
color: var(--muted)
```

#### Mono — HUD-элементы, статусы, технические метки
```
font-family: 'JetBrains Mono', 'Fira Code', monospace
font-size:   11px (badges) / 13px (поля, статусы)
font-weight: 400
line-height: 1.4
letter-spacing: 0.02em
color: var(--muted)
```
Использование: статус "ГОТОВ СЛУШАТЬ", метка "LIVE · OPTISPHERE · AI-FIRST WEB STUDIO", индикаторы.

---

## 3. Компоненты

### 3.1 Навбар

```
height:           64px (desktop) / 56px (mobile)
padding-x:        80px (desktop) / 24px (mobile)
background (default): transparent
background (при скролле — frosted glass):
  backdrop-filter: blur(12px)
  background: rgba(247,247,245,0.92)        /* light */
  background: rgba(10,10,10,0.88)           /* dark */
border-bottom:    1px solid var(--border)   /* появляется при скролле */
position:         sticky top-0 z-50
transition:       background 200ms ease, border-color 200ms ease
```

**Логотип:**
```
height: 32px
margin-right: auto
```

**Навигационные ссылки:**
```
font-size:   14px
font-weight: 500
letter-spacing: 0
color: var(--muted)
gap между ссылками: 32px
hover: color: var(--text), transition 150ms
```

**Кнопка "Обсудить проект":**
```
height:        40px
padding:       0 20px
border-radius: 8px
background:    var(--accent)
color:         #FFFFFF
font-size:     14px
font-weight:   600
letter-spacing: 0
hover:
  background: var(--accent-hover)
  transform: translateY(-1px)
  box-shadow: 0 4px 12px rgba(255,42,42,0.25)
transition:    all 150ms ease
```

**RU/EN switcher:**
```
font-size:     13px
font-weight:   500
color:         var(--muted)
separator:     " / " (цвет --border)
active язык:   color: var(--text)
hover:         color: var(--text)
cursor:        pointer
```

---

### 3.2 Hero Секция

```
section padding:  120px top / 80px bottom (desktop)
                  80px top / 60px bottom (mobile)
background:       var(--bg)
```

**Grid:**
```
display: grid
grid-template-columns: 55fr 45fr
gap: 80px (desktop) / 48px (tablet)
align-items: center

Tablet (md): grid-template-columns: 1fr 1fr, gap: 40px
Mobile (sm): grid-template-columns: 1fr — правая колонка идёт вниз
```

**Метка над заголовком (левая колонка, самый верх):**
```
font-family: 'JetBrains Mono', monospace
font-size:   11px
font-weight: 400
letter-spacing: 0.12em
text-transform: uppercase
color: var(--muted)
margin-bottom: 24px
display: flex
align-items: center
gap: 8px

Структура: [•] LIVE · OPTISPHERE · AI-FIRST WEB STUDIO
Точка [•]: width 6px, height 6px, border-radius 50%, background var(--accent)
           animation: pulse 2s ease-in-out infinite (opacity 1 → 0.4 → 1)
```

**H1:**
```
font-size:     64px (desktop) / 40px (tablet) / 36px (mobile)
font-weight:   600
line-height:   1.05
letter-spacing: -0.03em
color: var(--text)
margin-bottom: 24px

Акцентное слово (например "AI-сайты"): color: var(--accent)
```

**Подзаголовок (Body Large):**
```
font-size:   18px (desktop) / 16px (mobile)
font-weight: 400
line-height: 1.6
color: var(--muted)
max-width:   440px
margin-bottom: 40px
```

**CTA-блок:**
```
display: flex
align-items: center
gap: 16px
flex-wrap: wrap (mobile)
```

CTA Primary — "Обсудить проект":
```
height:        52px
padding:       0 28px
border-radius: 8px
background:    var(--accent)
color:         #FFFFFF
font-size:     15px
font-weight:   600
hover:
  background:  var(--accent-hover)
  transform:   translateY(-1px)
  box-shadow:  0 4px 16px rgba(255,42,42,0.28)
transition:    all 150ms ease
```

CTA Secondary — "Смотреть кейсы":
```
height:        52px
padding:       0 28px
border-radius: 8px
background:    transparent
border:        1px solid var(--border)
color:         var(--text)
font-size:     15px
font-weight:   500
hover:
  border-color: var(--text)
  background:   transparent
transition:    all 150ms ease
```

---

### 3.3 Блок Опти — правая колонка Hero

Главный принцип: выглядит как реальный AI-интерфейс, не как маркетинговый скриншот.

```
Карточка (контейнер):
  background:    var(--surface)
  border:        1px solid var(--border)
  border-radius: 12px
  padding:       24px
  box-shadow:    var(--shadow-card)
  max-width:     480px
  width:         100%
```

**Шапка карточки:**
```
display: flex
align-items: center
justify-content: space-between
margin-bottom: 20px
border-bottom: 1px solid var(--border)
padding-bottom: 16px
```

Заголовок "ОПТИ · AI-КОНСУЛЬТАНТ":
```
font-family: 'JetBrains Mono', monospace
font-size:   11px
font-weight: 400
letter-spacing: 0.1em
text-transform: uppercase
color: var(--text)
```

Статус "ГОТОВ СЛУШАТЬ":
```
font-family: 'JetBrains Mono', monospace
font-size:   11px
letter-spacing: 0.06em
text-transform: uppercase
color: var(--accent)
display: flex
align-items: center
gap: 6px
```
Точка перед статусом: 5px × 5px, border-radius 50%, background var(--accent), animation pulse.

**Зона чата (пример сообщений Опти):**
```
min-height: 120px
padding: 12px 0
font-size: 14px
line-height: 1.5
color: var(--text)
```
Сообщение Опти:
```
background: var(--bg)
border: 1px solid var(--border)
border-radius: 8px 8px 8px 2px
padding: 10px 14px
margin-bottom: 8px
font-size: 14px
max-width: 90%
```

**Поле ввода:**
```
height:        44px
width:         100%
padding:       0 14px
border:        1px solid var(--border)
border-radius: 8px
background:    var(--bg)
font-size:     14px
color:         var(--text)
placeholder:   color: var(--muted), font-size: 14px

focus:
  border-color: var(--text)
  outline:      none
  box-shadow:   none

margin-top: 16px
margin-bottom: 12px
```

**Кнопка "Спросить →":**
```
height:        36px
padding:       0 16px
border-radius: 8px
background:    var(--accent)
color:         #FFFFFF
font-size:     13px
font-weight:   600
float:         right (или align-self: flex-end)
hover:
  background: var(--accent-hover)
transition: all 150ms ease
```

**Теги под полем ввода (примеры вопросов):**
```
display: flex
flex-wrap: wrap
gap: 8px
margin-top: 12px

Каждый тег:
  padding:       5px 12px
  border:        1px solid var(--border)
  border-radius: 4px
  font-size:     12px
  font-weight:   500
  color:         var(--muted)
  background:    transparent
  cursor:        pointer
  white-space:   nowrap

  hover:
    border-color: var(--text)
    color:        var(--text)
  transition: all 120ms ease

Примеры текстов: "Стоматология", "Гостиница", "Интернет-магазин", "Медцентр", "Ресторан"
```

---

### 3.4 Карточки услуг

**Grid:**
```
Desktop (lg+):  4 колонки, gap: 24px
Tablet (md):    2×2, gap: 20px
Mobile (sm):    1 колонка, gap: 16px
```

**Карточка:**
```
padding:       28px 24px
border:        1px solid var(--border)
border-radius: 12px
background:    var(--surface)
box-shadow:    var(--shadow-card)
transition:    border-color 200ms ease, box-shadow 200ms ease

hover:
  border-color: rgba(17,17,17,0.2)        /* light */
  border-color: rgba(245,245,245,0.15)    /* dark */
  box-shadow:   var(--shadow-card-hover)
```

Никакого translateY, scale, цветных фонов при hover. Только граница темнеет и тень чуть глубже.

**Иконка:**
```
width:          40px
height:         40px
stroke-width:   1.5px
color:          var(--accent)
style:          outline (Lucide Icons или аналог)
margin-bottom:  20px
```

**Заголовок карточки (H3):**
```
font-size:     20px
font-weight:   600
line-height:   1.25
letter-spacing: -0.01em
color:         var(--text)
margin-bottom: 8px
```

**Описание карточки:**
```
font-size:    14px
line-height:  1.55
color:        var(--muted)
```

---

### 3.5 Строка статистики

Располагается между Hero и секцией услуг.

```
layout:        4 блока в ряд (desktop) / 2×2 (tablet) / 2×2 (mobile)
border-top:    1px solid var(--border)
border-bottom: 1px solid var(--border)
padding:       40px 0
background:    transparent

Разделители между блоками:
  border-right: 1px solid var(--border)
  (последний блок — без правой границы)
```

**Каждый блок:**
```
display:        flex
flex-direction: column
align-items:    center
padding:        0 40px

Цифра:
  font-size:     40px (desktop) / 32px (mobile)
  font-weight:   600
  line-height:   1
  letter-spacing: -0.02em
  color:         var(--text)
  margin-bottom: 6px

  Акцент-символ (+ или %) после цифры:
    color: var(--accent)
    font-size: 0.7em
    font-weight: 600

Подпись:
  font-size:     13px
  font-weight:   400
  color:         var(--muted)
  letter-spacing: 0
  text-align:    center
```

---

## 4. Декоративные элементы

### Угловые срезы
**Отказаться от clip-path.** Причина: clip-path плохо работает с box-shadow, border и overflow; создаёт ощущение геймерской эстетики (Asiimov skin из CS:GO), а не premium AI-продукта. Для "White Asiimov" — граница ощущения точности создаётся типографикой и сеткой, а не формой элементов.

Единственное исключение: если клиент требует срез — применять только на крупных декоративных блоках (не на кнопках), значение `clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)`.

### Тонкие линии
```
Где используются:
  - border-bottom навбара при скролле: 1px solid var(--border)
  - разделитель статистики (top + bottom)
  - разделители внутри блоков (вертикальные между колонками статистики)
  - border шапки карточки Опти (внутренняя горизонтальная линия)
  - секционные разделители между крупными блоками страницы: 1px solid var(--border), margin: 0 auto, max-width: 1280px

Толщина: всегда 1px
Цвет: var(--border) — #E5E5E5 light / #222222 dark
Никогда: 2px линии, цветные линии, пунктиры
```

### Красный акцент — точки применения (исчерпывающий список)
```
1. Одно акцентное слово/фраза в H1 hero                    — color: var(--accent)
2. Кнопки: CTA Primary навбар, CTA Primary hero, "Спросить →" в блоке Опти — background: var(--accent)
3. Пульсирующая точка в метке "LIVE · OPTISPHERE"           — background: var(--accent)
4. Пульсирующая точка статуса "ГОТОВ СЛУШАТЬ"               — background: var(--accent)
5. Иконки карточек услуг                                    — color: var(--accent)
6. Акцент-символ (+, %) в цифрах статистики                 — color: var(--accent)

НЕ использовать красный:
  - Как фон секций
  - Как border карточек (даже при hover)
  - В декоративных линиях
  - В тексте, кроме H1 и специально выделенных слов
  - В навигационных ссылках
  - Как glow/shadow цвет (только rgba(255,42,42,0.25) в тени hover-кнопки — допустимо)
```

### Glow, bloom, неон
Строгий запрет. Нет text-shadow с цветом, нет box-shadow с насыщенным цветом (только rgba(0,0,0,X) нейтральные).

### Анимации
```
Стандартный transition: all 150ms ease (кнопки) / 200ms ease (карточки)
Hover translateY(-1px): только CTA-кнопки, максимум 1px
Pulse-анимация для живых точек:
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.35; }
  }
  animation: pulse 2s ease-in-out infinite

prefers-reduced-motion:
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation: none !important; transition: none !important; }
  }
```

---

## 5. Что НЕ делать — чеклист

- Glow / bloom / neon — запрещено
- box-shadow с цветом: максимум `0 1px 4px rgba(0,0,0,0.06)` и `0 4px 16px rgba(0,0,0,0.08)`
- border-radius больше 12px — запрещено (исключение: pill-теги `border-radius: 9999px` если нужно, но в этом проекте не нужно)
- Красный как фон секций, border, декор — запрещено
- Более одного акцентного шрифта (Inter + JetBrains Mono — максимум)
- Градиентные фоны секций
- Тяжёлые входные анимации (parallax, 3D-трансформации) — только если отдельно заказывает perf-engineer
- Uppercase текст длиннее 5 слов (за исключением mono-меток)

---

## 6. CSS Custom Properties — полный блок для globals.css

```css
/* ============================================================
   OPTISPHERE — White Asiimov Minimal Design System
   Insert into :root and [data-theme="dark"]
   ============================================================ */

/* ---------- Light Theme (default) ---------- */
:root {
  /* Colors */
  --bg:              #F7F7F5;
  --surface:         #FFFFFF;
  --border:          #E5E5E5;
  --text:            #111111;
  --muted:           #666666;
  --accent:          #FF2A2A;
  --accent-hover:    #E01A1A;

  /* Shadows */
  --shadow-card:       0 1px 4px rgba(0,0,0,0.06);
  --shadow-card-hover: 0 4px 16px rgba(0,0,0,0.08);
  --shadow-nav:        0 1px 0 var(--border);

  /* Typography */
  --font-display: 'Inter', system-ui, -apple-system, sans-serif;
  --font-body:    'Inter', system-ui, -apple-system, sans-serif;
  --font-mono:    'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;

  /* Type Scale */
  --text-h1:     clamp(36px, 5vw, 64px);
  --text-h2:     clamp(28px, 3.5vw, 40px);
  --text-h3:     20px;
  --text-body-lg: 18px;
  --text-body:   16px;
  --text-sm:     14px;
  --text-label:  12px;
  --text-mono:   11px;

  /* Font Weights */
  --weight-regular:  400;
  --weight-medium:   500;
  --weight-semibold: 600;

  /* Line Heights */
  --leading-tight:  1.05;
  --leading-snug:   1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.6;

  /* Letter Spacing */
  --tracking-tight:  -0.03em;
  --tracking-snug:   -0.02em;
  --tracking-normal:  0;
  --tracking-wide:    0.06em;
  --tracking-widest:  0.12em;

  /* Border Radius */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-full: 9999px;

  /* Spacing */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-6:  24px;
  --space-8:  32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;

  /* Layout */
  --container-max:   1280px;
  --container-px:    80px;
  --section-py:      96px;

  /* Component-specific */
  --nav-height:      64px;
  --nav-bg-scroll:   rgba(247,247,245,0.92);
  --nav-blur:        12px;

  --btn-primary-bg:  var(--accent);
  --btn-primary-color: #FFFFFF;
  --btn-height-md:   52px;
  --btn-height-sm:   40px;
  --btn-height-xs:   36px;
  --btn-px-md:       28px;
  --btn-px-sm:       20px;
  --btn-px-xs:       16px;
}

/* ---------- Dark Theme ---------- */
[data-theme="dark"] {
  --bg:      #0A0A0A;
  --surface: #141414;
  --border:  #222222;
  --text:    #F5F5F5;
  --muted:   #888888;
  /* --accent и --accent-hover наследуются из :root без изменений */

  --shadow-card:       0 1px 4px rgba(0,0,0,0.4);
  --shadow-card-hover: 0 4px 16px rgba(0,0,0,0.5);

  --nav-bg-scroll: rgba(10,10,10,0.88);
}

/* Responsive overrides */
@media (max-width: 1024px) {
  :root {
    --container-px: 48px;
    --section-py:   64px;
    --nav-height:   60px;
  }
}

@media (max-width: 640px) {
  :root {
    --container-px: 24px;
    --section-py:   48px;
    --nav-height:   56px;
    --btn-height-md: 48px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Pulse animation для живых точек (статус, LIVE) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.35; }
}

.pulse-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulse 2s ease-in-out infinite;
}
```

---

## 7. Tailwind 4 — дополнения к конфигу (если используется extend)

```js
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        muted: 'var(--muted)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        nav: 'var(--shadow-nav)',
      },
    },
  },
}
```

---

## Статус

```
Mode:    Classic
Output:  spec/design-white.md
Передаю: frontend

Замечания для frontend:
  - Tailwind 4 не поддерживает extend через конфиг в старом формате — проверить синтаксис @theme в globals.css
  - CSS Custom Properties использовать через var() напрямую, не через Tailwind-токены там, где это удобнее
  - Два шрифта уже подключены — Inter и JetBrains Mono — импорт проверить в layout.tsx
  - data-theme="dark" переключатель — реализовать через next-themes или ручной toggle в layout

Замечания для perf-engineer:
  - Inter variable font — загружать один файл (woff2 variable), не отдельные веса
  - JetBrains Mono — только подмножество символов (Latin + цифры + базовые символы), остальное не нужно
  - Frosted glass (backdrop-filter: blur) — тяжёлая операция на мобильных GPU, отключить на sm breakpoint если FPS низкий
```

# Designer.local — Optisphere V3 "NEXUS"

> **Extends:** `~/.claude/agents/designer.md`
> Дизайн-система V3. V2 удалён. Всё с нуля.

## Позиционирование

**AI-нативная веб-студия.** Юра — продукт, не фича. Сайт сам является демонстрацией.
**Аудитория:** Гостиницы, строительство, медклиники, малый бизнес.
**Тон:** Уверенный, умный, слегка неформальный. Не пафосный, не корпоративный.

## Цвета (CSS Custom Properties → Tailwind canonical)

```css
--base:          #04040C   → bg-base
--surface:       #0A0A18   → bg-surface
--surface-high:  #12121F   → bg-surface-high
--border:        rgba(255,255,255,0.06)  → border-border
--border-hover:  rgba(255,255,255,0.14) → border-border-hover
--text:          #F8FAFC   → text-text
--text-muted:    #64748B   → text-text-muted
--text-faint:    #1E293B   → text-text-faint

--indigo:        #6366F1   → text-indigo, bg-indigo   (AI, основной)
--indigo-dim:    rgba(99,102,241,0.12)  → bg-indigo-dim
--cyan:          #06B6D4   → text-cyan, bg-cyan       (энергия, Hero)
--cyan-dim:      rgba(6,182,212,0.12)   → bg-cyan-dim
--amber:         #F59E0B   → text-amber, bg-amber     (CTA ТОЛЬКО)
--amber-dim:     rgba(245,158,11,0.12)  → bg-amber-dim
```

**Правило Amber:** Используется ИСКЛЮЧИТЕЛЬНО для CTA-кнопок и конверсионных моментов.
Никакого amber в декоре, иконках, бордерах — только кнопки.

## Шрифты

```
Orbitron:  ТОЛЬКО логотип + section-label теги (спарсено)
Geist:     ВСЁ остальное — заголовки, тело, кнопки, цифры

Display размеры:
  Hero headline:   clamp(3.5rem, 8vw, 7rem)   — огромный, editorial
  Section title:   clamp(2.5rem, 5vw, 4.5rem) — крупный, уверенный
  Card title:      clamp(1.25rem, 2vw, 1.75rem)
  Body:            1rem / 1.1rem
  Label (Orbitron): 0.7rem, letter-spacing 0.2em, uppercase, text-muted
```

## Utility классы (globals.css — создавать в фундаменте)

```css
/* Типографика */
.display-text    — Hero headline, Geist Black, clamp(3.5rem,8vw,7rem)
.section-title   — Section заголовок, Geist Bold, clamp(2.5rem,5vw,4.5rem)
.section-label   — "AI-САЙТ" тег, Orbitron, 0.7rem, uppercase, letter-spacing 0.2em

/* Контейнеры */
.glass           — glassmorphism: bg rgba(10,10,24,0.6) + border + backdrop-blur-xl
.glass-high      — stronger glass: bg rgba(18,18,31,0.8) + border-hover
.section         — responsive padding (px-6 md:px-12 lg:px-20, py-24 lg:py-36)
.container-wide  — max-w-7xl mx-auto px-6

/* Свечения (CSS filter, не Bloom) */
.glow-indigo     — filter: drop-shadow(0 0 40px rgba(99,102,241,0.4))
.glow-cyan       — filter: drop-shadow(0 0 40px rgba(6,182,212,0.4))
.glow-amber      — filter: drop-shadow(0 0 30px rgba(245,158,11,0.5))

/* Кнопки */
.btn-primary     — amber bg + text-black + font-bold + glow-amber
.btn-secondary   — glass + border-indigo + text-indigo
.btn-ghost       — transparent + border-border + text-text-muted
```

## Компоненты V3 (создавать с нуля)

| Компонент | Файл | Приоритет |
|-----------|------|-----------|
| Navbar | `sections/Navbar.tsx` | 1 — вместе с фундаментом |
| HeroSection | `sections/HeroSection.tsx` | 1 — главная секция |
| AIHook | `sections/AIHookSection.tsx` | 2 — цифры после Hero |
| ServicesSection | `sections/ServicesSection.tsx` | 2 |
| PortfolioSection | `sections/PortfolioSection.tsx` | 3 |
| PricingSection | `sections/PricingSection.tsx` | 3 |
| CalcSection | `sections/CalcSection.tsx` | 4 |
| CTASection | `sections/CTASection.tsx` | 4 |
| Footer | `sections/Footer.tsx` | 4 |
| YuraWidget | `ai/YuraWidget.tsx` | 5 |
| NexusSphere | `three/NexusSphere.tsx` | 1 (Hero зависит) |

## Hero — дизайн-спека

```
Layout:
  Полный экран (100vh), центр — сфера
  Левее центра: большой заголовок (2 строки) + подзаголовок + 2 кнопки
  Правее центра: сфера (500px desktop, 300px mobile)

Сфера:
  Размер: 500×500px desktop, 300×300px mobile
  Свечение: CSS glow-cyan + glow-indigo (два слоя)
  Нейросеть поверх: 60 узлов, линии, pulse по линиям

Текст Hero:
  Badge (Orbitron label): "AI WEB STUDIO"
  Headline line 1: "Ваш первый"
  Headline line 2: "AI-продавец"  (indigo gradient)
  Headline line 3: "уже работает"
  Subtext: нейтральный, объясняет ценность
  CTA primary: "Рассчитать стоимость" (amber)
  CTA secondary: "Смотреть работы" (ghost)

Анимация:
  Headline: каждое слово появляется с задержкой (stagger 0.1s)
  Сфера: fade in + scale from 0.8 (duration 1.2s)
  После загрузки сферы: pulse нейросети активируется
```

## Services — дизайн-спека

```
Layout: три секции, каждая ~80vh, скролл-reveal (IntersectionObserver)
Нет горизонтального скролла — вертикальный, одна за другой

Секция-1: AI-Сайт (indigo)
  Левая часть: заголовок + описание + bullet points + CTA
  Правая часть: мокап браузера с анимированным сайтом (CSS animation)
  Bg: bg-surface, левый edge — indigo gradient strip

Секция-2: Присутствие (cyan)  
  Зеркально: мокап 360° слева, текст справа
  Bg: bg-base

Секция-3: Рост (amber)
  Текст слева, animated chart/graph справа
  Bg: bg-surface
```

## Portfolio — дизайн-спека

```
Горизонтальный скролл (Lenis horizontal в этой секции)
Карточки: 400×500px, border-radius 20px, glass effect
Hover: scale 1.02 + glow-indigo (мягко)
Внутри карточки: screenshot (bg-cover), overlay с именем + цена такого сайта + arrow
Sticky header: "Наши работы" + фильтр-теги сверху
```

## Запрещено в V3

```
Светлые фоны — всегда тёмная тема
Хардкод текста — только i18n ключи
Bloom / @react-three/postprocessing
Amber цвет не в CTA — декоративный amber запрещён
Планеты-шары v2 — не возвращать (OrbitalSphere удалён)
Аккреционный диск — не возвращать
Drag-to-rotate на сфере — не возвращать
Orbitron в теле текста — только logo/labels
```

## Mobile-first правила

```
Hero:      сфера уменьшается, текст — full width, CTA — full width sticky
Services:  вертикальный стек (не split), мокапы — сверху секции
Portfolio: горизонтальный скролл → вертикальный стек + swipe на mobile
Navbar:    hamburger, full-screen overlay menu
Tap zones: ≥ 44×44px везде
```

# Frontend.local — Optisphere V3 "NEXUS"

> **Extends:** `~/.claude/agents/frontend.md`
> Конвенции V3. Старый код v2 удалён. Строим с нуля.

## Файловая структура V3

```
src/
  app/
    [locale]/
      layout.tsx       — root layout: Geist+Orbitron, LenisProvider, NextIntlProvider
      page.tsx         — главная: импортирует секции в порядке воронки
    api/
      ai/chat/         — Юра streaming
      leads/telegram/  — лиды → Telegram
      calculator/      — расчёт стоимости
  components/
    sections/          — секции страницы
      Navbar.tsx
      HeroSection.tsx
      AIHookSection.tsx
      ServicesSection.tsx
      PortfolioSection.tsx
      PricingSection.tsx
      CalcSection.tsx
      CTASection.tsx
      Footer.tsx
    three/             — R3F/WebGL (ВСЕГДА dynamic import + ssr:false)
      NexusSphere.tsx  — Energy Orb + Neural Net (Hero)
    ai/                — Юра виджет
      YuraWidget.tsx
      YuraWidgetLoader.tsx
    ui/                — базовые примитивы (создавать здесь)
  hooks/               — кастомные хуки
  lib/
    portfolio.ts       — данные портфолио
  i18n/
    routing.ts         — locales: ['ru', 'en'], defaultLocale: 'ru'
    request.ts
    navigation.ts
  proxy.ts             — next-intl middleware
  app/globals.css      — CSS vars + utility classes
messages/
  ru.json
  en.json
```

## Конвенции кода

```
Файлы:     PascalCase (HeroSection.tsx, NexusSphere.tsx)
Экспорт:   named export — export function ComponentName
i18n:      const t = useTranslations('section_key')
           Серверный: const t = await getTranslations('key')
CSS:       Tailwind 4 canonical (bg-surface, text-indigo)
           НЕ bg-[var(--surface)], НЕ хардкод hex
Imports:   @/ алиас
'use client': только если hooks/events используются
```

## Критические правила V3

```
[BLOOM]    @react-three/postprocessing ЗАПРЕЩЁН — крашит при context loss
           Свечение: CSS filter drop-shadow на wrapper div
           class="glow-cyan" или "glow-indigo" из globals.css

[3D]       dynamic import + ssr:false ОБЯЗАТЕЛЬНО
           const NexusSphere = dynamic(
             () => import('./NexusSphere').then(m => ({ default: m.NexusSphere })),
             { ssr: false, loading: () => <SphereSkeleton /> }
           )

[I18N]     ru.json И en.json — синхронно всегда
           Ключи: section.subsection.key (макс 3 уровня)

[CSS]      Tailwind 4: canonical, не arbitrary
           bg-surface ✓   bg-[var(--surface)] ✗
           text-indigo ✓  text-[#6366F1] ✗

[MOBILE]   WebGL ТОЛЬКО в HeroSection
           Mobile Hero: CSS sphere (border-radius, gradient, animation) вместо WebGL
           Все остальные секции: CSS + SVG + Framer Motion

[LENIS]    Инициализирован в layout — не переинициализировать
           Scroll events: useLenis hook или IntersectionObserver

[AMBER]    Amber только для .btn-primary — не как декоративный цвет
```

## Порядок страницы (page.tsx)

```tsx
export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />       {/* #hero */}
      <AIHookSection />     {/* #stats — 3 цифры */}
      <ServicesSection />   {/* #services */}
      <PortfolioSection />  {/* #portfolio */}
      <PricingSection />    {/* #pricing */}
      <CalcSection />       {/* #calculator */}
      <CTASection />        {/* #contact */}
      <Footer />
      <YuraWidgetLoader />  {/* поверх всего, lazy */}
    </main>
  )
}
```

## NexusSphere — техническая спека

```
Файл: src/components/three/NexusSphere.tsx

Подход ГИБРИДНЫЙ:
  R3F Canvas: Energy Orb — кастомный GLSL шейдер
    - uniforms: uTime, uMouse, uResolution
    - Fragment: plasma noise (FBM 4 octaves), indigo→cyan gradient
    - Vertex: slight displacement по uTime (дыхание)
    - Sphere geometry: 64 segments
    - Нет lights — unlit материал

  Canvas 2D (overlay, абсолютный, pointer-events:none):
    - 60-80 узлов на эллиптических орбитах (3-4 орбиты)
    - Линии между узлами < 150px расстояния
    - Pulse: бегущая точка по линиям, случайные интервалы
    - Mouse: узлы слегка притягиваются к курсору
    - FPS: requestAnimationFrame, 60fps desktop, 30fps mobile

Размеры:
  Desktop: canvas 500×500, sphere geometry radius 1.8
  Mobile:  CSS sphere only (border-radius 50%, gradient, keyframe pulse)

Экспорт:
  export function NexusSphere()  — R3F сцена
  export function NexusSphereMobile() — CSS fallback
```

## Анимации (Framer Motion паттерны)

```tsx
// Секции — fade-in при скролле
const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}
// + useInView из framer-motion

// Stagger для списков
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

// Hero headline — каждое слово
const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}
```

## i18n структура V3 (ключи)

```json
{
  "nav": { "services": "", "portfolio": "", "pricing": "", "contact": "", "cta": "" },
  "hero": {
    "badge": "AI WEB STUDIO",
    "headline": { "line1": "", "line2": "", "line3": "" },
    "subtitle": "",
    "cta": { "primary": "", "secondary": "" }
  },
  "hook": { "sites": {}, "leads": {}, "days": {} },
  "services": {
    "label": "",
    "ai_site": { "title": "", "desc": "", "features": [] },
    "presence": { "title": "", "desc": "", "features": [] },
    "growth": { "title": "", "desc": "", "features": [] }
  },
  "portfolio": { "label": "", "title": "", "filters": {}, "cta": "" },
  "pricing": { "label": "", "title": "", "tiers": {}, "orbit": {} },
  "calculator": { "label": "", "title": "", "steps": {} },
  "cta": { "title": "", "subtitle": "", "button": "" },
  "ai": { "trigger": "", "name": "Юра", "placeholder": "" },
  "footer": { "tagline": "", "rights": "" }
}
```

## Performance бюджеты V3

```
Mobile FCP:  < 1.5s
Mobile JS:   < 150KB initial
Total:       < 3MB
Desktop FCP: < 1s

Lazy load:   NexusSphere, YuraWidget, sections below fold
Preload:     Geist, Orbitron fonts в layout head
Images:      next/image, WebP, sizes attr
```

## HMR Fix (уже должен быть в next.config.ts)

```typescript
experimental: {
  turbo: {
    watchOptions: {
      ignored: ['**/.playwright-mcp/**']
    }
  }
}
```

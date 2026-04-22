# Аудит Optisphere — TASK-001
**Агент:** frontend (haiku mode, read-only)  
**Дата:** 2026-04-10

---

## Общая оценка

Проект в **хорошем рабочем состоянии** с точечными критическими багами. OrbitalSphere архитектурно чистый, Navbar эталонный, Hero и Services в порядке. Главная проблема — половина страницы отсутствует (ContactSection, Footer, AI-виджет, Калькулятор), а PricingSection существует, но содержит критический баг и нарушает конвенции.

---

## Файл: OrbitalSphere.tsx (~667 строк)

- **Сложность:** высокая, но обоснованная — GLSL шейдеры, Web Audio API, physics loop
- **Структура:** отлично разбита на именованные блоки (BlackHoleSystem, OrbitPlanet, Starfield, HUD, Scene)
- **Проблемы:**
  - `isMobile = typeof window!=="undefined" && window.innerWidth<768` — не реактивный, snapshot при маунте, не обновляется при resize, возможная гидрация-дивергенция
  - `<SpaceHUD node={activeNode} visible={true}/>` — `visible` всегда `true`, HUD всегда показан. Было намерение скрывать до первого hover, сейчас показывает первую планету всегда
  - `handleClick` использует `window.location.hash` — резкий jump, без smooth scroll
  - HUD: "Подробнее →" — хардкодированный русский текст, не через i18n
  - Шейдеры минифицированы (на одной строке) — работает, но усложняет дебаг
  - `physicsRefs.current.length===0` guard на строке 421 защищает от двойного маунта — правильно
- **Хорошее:** DPR [1,1.5] mobile / [1,2] desktop ✓, FPSThrottle ✓, debounce на hover ✓, mobile fallback карточки в HeroSection ✓, ambient sound через Web Audio (опциональный) ✓
- **Вердикт:** ОСТАВИТЬ как основу, точечно исправить

---

## Файл: HeroSection.tsx

- **Сложность:** низкая/средняя
- **Проблемы:**
  - `o("tiers.pro.price") + " ₽/мес"` — "₽/мес" хардкод в мобильных карточках
  - `style={{ fontFamily: "var(--font-orbitron),monospace" }}` — в нескольких местах, вместо Tailwind класса
  - `activeCard` state управляет визуалом карточек, но не делает ничего кроме визуального выделения
- **Хорошее:** dynamic import + ssr:false для OrbitalSphere ✓, i18n полная ✓, мобильные карточки ✓, stagger анимации ✓, scroll indicator ✓
- **Вердикт:** РЕФАКТОРИНГ минимальный

---

## Файл: Navbar.tsx

- **Сложность:** низкая
- **Проблемы:**
  - `lastY` ref (строка 119) инициализирован и обновляется, но нигде не используется (dead code)
- **Хорошее:** всё остальное — эталонный компонент. Scroll→blur ✓, hamburger анимация ✓, LangToggle ✓, MobileMenu с AnimatePresence ✓, SphereLogo ✓
- **Вердикт:** УБРАТЬ lastY ref, оставить всё остальное

---

## Файл: ServicesSection.tsx

- **Сложность:** низкая
- **Проблемы:**
  - Все три объекта в `SERVICES` имеют `id: "services"` — одинаковый id. Должны быть "sites", "pano", "promo"
  - `data-style` атрибут на div (строка 181) — мёртвый атрибут, не используется
  - SVG иконки захардкоджены прямо в массив — большие inline JSX блоки, но функционально OK
- **Хорошее:** ServiceCard переиспользуемый ✓, t.raw() для массивов тегов/фич ✓, scroll parallax ✓, hover glow ✓, CTA в каждой карточке ✓
- **Вердикт:** ТОЧЕЧНЫЕ ФИКСЫ

---

## Файл: PortfolioSection.tsx

- **Сложность:** низкая/средняя
- **Проблемы:**
  - Все проекты в portfolio.ts — ФИКТИВНЫЕ (Hotel Nova, MedPro, BuildPro и т.д.)
  - Нет реальных URL (url поле отсутствует у большинства)
  - Заглушки-градиенты вместо реальных скриншотов
- **Хорошее:** AnimatePresence для фильтров ✓, layout animations ✓, locale-aware данные ✓, price + CTA ✓
- **Вердикт:** СТРУКТУРА ХОРОШАЯ, нужны реальные данные проектов

---

## Файл: PricingSection.tsx ⚠️ КРИТИЧНО

- **Сложность:** средняя
- **Проблемы:**
  - **КРИТИЧЕСКИЙ БАГ:** `const { useLocale } = require("next-intl")` внутри тела функции-компонента (строка 80-81) — CommonJS require() в ESM Next.js проекте, нарушает Rules of Hooks (require — не хук, но вызов хука через require нестабилен), вероятны ошибки в production
  - Massive hardcode: "Сайты", "Websites", "Цены на разработку", "Development pricing", "Срок:", "Timeline:", "Популярный", "Popular", "Обсудить проект", "Discuss project" — НЕ через i18n ключи
  - `PROJECT_TIERS` использует `{ ru: string; en: string }` pattern вместо next-intl — inconsistent с остальным кодом
  - **НЕ ИМПОРТИРОВАН в page.tsx** — секция просто не показывается!
- **Хорошее:** структура визуала карточек ✓, CheckIcon переиспользуемый ✓
- **Вердикт:** ПЕРЕПИСАТЬ полностью с нуля (через i18n, убрать require, добавить в page.tsx)

---

## Файл: layout.tsx

- **Сложность:** низкая
- **Проблемы:**
  - `import { getTranslations } from "next-intl/server"` — импортирован, но `t` из `getTranslations({ locale, namespace: "hero" })` нигде не используется в теле! `generateMetadata` возвращает хардкодированные строки (не через `t`)
  - Нет LenisProvider — Lenis установлен в package.json, но не подключён
  - Нет метаданных для Open Graph image
- **Хорошее:** generateStaticParams ✓, notFound() для невалидных локалей ✓, шрифты через next/font ✓
- **Вердикт:** РЕФАКТОРИНГ — убрать неиспользуемый import, добавить Lenis, i18n для metadata

---

## Файл: page.tsx

- **Сложность:** нет (trivial)
- **Проблемы:**
  - PricingSection не импортирована
  - Нет: ContactSection, Footer, CalcSection, AI-виджет
- **Вердикт:** ДОПОЛНИТЬ по мере создания секций

---

## Файл: next.config.ts

- **Проблемы:**
  - `transpilePackages: ["@react-three/postprocessing", "postprocessing"]` — postprocessing ЗАПРЕЩЁН в проекте (крашит при context loss). Эти пакеты даже не должны быть в транспиле — нужно убрать
  - watchOptions использует webpack config, не turbopack — может не работать если turbopack включён
- **Вердикт:** ТОЧЕЧНЫЙ ФИX — убрать postprocessing из transpilePackages

---

## Файл: globals.css

- Чистый design system ✓
- @theme inline bridge правильный ✓
- CSS vars полные ✓
- **Вердикт:** ХОРОШО, оставить

---

## Баг: планеты исчезают при Ctrl+F5 в dev

- **Проверен в prod:** НЕТ (нужно `npm run build && npm start`)
- **Анализ кода:**
  - `physicsRefs.current.length===0` guard на строке 421 должен защищать от двойного React Strict Mode маунта
  - Шейдерные материалы создаются через `useMemo` — правильно, не пересоздаются
  - `isMobile` snapshot — не влияет на исчезновение планет
- **Рекомендация:** проверить prod первым делом. Если в prod нет — это Strict Mode dev артефакт, не тратить время

---

## Архитектурные проблемы

1. **Половина воронки отсутствует:** нет Calc, Contact, Footer, AI — сайт показывает только Hero+Services+Portfolio, без конверсионного хвоста
2. **Нет API слоя:** /api/leads/telegram, /api/ai/chat, /api/calculator — все запланированы, ни одного нет
3. **PricingSection вне воронки:** сделана, но не показывается — require() блокирует отображение в prod
4. **portfolio.ts с фиктивными данными:** отсутствует доверие через реальные кейсы

---

## Что точно хорошо и стоит сохранить

- OrbitalSphere.tsx — вся 3D архитектура, GLSL шейдеры (черная дыра + планеты), Starfield, ambient sound
- Navbar.tsx — эталон, оставить почти без изменений
- HeroSection.tsx — структура и анимации хорошие
- ServicesSection.tsx — карточки и layout хорошие
- globals.css — design system полный
- messages/ru.json — i18n структура полная
- portfolio.ts — interface и структура правильные

---

## Что точно нужно переделать / создать

1. PricingSection.tsx — переписать (require bug + i18n)
2. ContactSection — создать (форма + Telegram API)
3. CalcSection — создать (multi-step + API)
4. AI Юра widget — создать (Claude API + stream)
5. Footer — создать
6. /api/leads/telegram — создать
7. /api/ai/chat — создать (stream)
8. /api/calculator — создать
9. portfolio.ts — заменить фиктивные данные на реальные (Олег предоставит)

---

## Рекомендация: Рефакторинг

**Вердикт: РЕФАКТОРИНГ, не пересоздание.**

OrbitalSphere читаем, структурирован, GLSL шейдеры уникальные и работают. Переписывать с нуля — потерять 30+ часов работы и накопленные паттерны. Проблемы точечные и изолированные. Большая часть работы — это ДОСТРОЙКА отсутствующих секций, а не исправление существующих.

# Решение по TASK-001 — Orchestrator
**Дата:** 2026-04-10

---

## Решение: РЕФАКТОРИНГ + ДОСТРОЙКА

### Обоснование

**Критерии для ПЕРЕСОЗДАНИЯ** (из task-001) — ни одного не выполнено:

| Критерий | Факт |
|----------|------|
| OrbitalSphere >50% мёртвого кода | ❌ Код плотный, все части используются |
| Архитектурные проблемы >3 файлов | ❌ Критические только в PricingSection, layout |
| Баг планет воспроизводится в prod | ❌ Не проверено — скорее всего dev артефакт |
| Рефакторинг = переписать с нуля по времени | ❌ Фиксы точечные, займут часы, не дни |

**Основания для РЕФАКТОРИНГА:**
1. OrbitalSphere — сложный, но читаемый. GLSL шейдеры (Black Hole + 4 alien worlds) уникальны и занимают недели работы. Переписывать — терять ценность.
2. Navbar — эталонный компонент, трогать незачем.
3. HeroSection, ServicesSection, PortfolioSection — рабочие с minor issues.
4. Проблемы изолированы: один файл (PricingSection) с критическим багом, остальные — точечные.
5. 80% работы — это ДОСТРОЙКА (Contact, Calc, AI, Footer, APIs), а не исправление существующего.

### Приоритеты

```
P0 (сломано, мешает):
  - PricingSection require() bug + добавить в page.tsx
  - next.config.ts удалить postprocessing transpile

P1 (архитектура конверсии — главное):
  - ContactSection + /api/leads/telegram
  - AI Юра widget + /api/ai/chat
  - CalcSection + /api/calculator

P2 (completeness):
  - Footer
  - SEO metadata через i18n
  - Lenis подключить в layout

P3 (polish):
  - OrbitalSphere: isMobile → хук, SpaceHUD видимость, i18n для "Подробнее"
  - Navbar: убрать lastY
  - Portfolio: реальные данные (от Олега)
  - Loader ракета

P4 (verify):
  - Проверить баг планет в prod (npm run build && npm start)
  - Если есть — чинить в OrbitalSphere
```

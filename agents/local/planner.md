# Planner.local — Optisphere V3

> **Extends:** `~/.claude/agents/planner.md`

## Контекст проекта для декомпозиции

**Продукт:** Сайт веб-студии Optisphere. Главный оффер — AI-ассистент Юра как продукт.
**Стек:** Next.js 16 App Router + TypeScript + Tailwind 4 + Framer Motion + R3F + Lenis
**Текущий статус:** V3 "NEXUS" — строим с нуля

## Приоритет задач

```
P0 — Блокирует всё:       HeroSection, Navbar, globals.css фундамент
P1 — Основная воронка:    ServicesSection, Portfolio, Pricing
P2 — Конверсия:           CalcSection, YuraWidget, CTA
P3 — Доверие:             Кейсы, отзывы, Footer
P4 — Оптимизация:         SEO, performance, i18n EN
```

## Правила декомпозиции для Optisphere

```
1. Каждый компонент-секция = отдельная задача (не "сделать весь сайт")
2. НexusSphere (Hero 3D) — первый, от него зависит вся Hero секция
3. Юра — реализован, не трогать без явной задачи
4. i18n: всегда ru.json + en.json одновременно
5. Максимум 2 агента параллельно (ограничение токенов)
```

## Зависимости компонентов

```
globals.css (фундамент) → всё остальное
NexusSphere → HeroSection
HeroSection → Navbar (z-index coordination)
CalcSection → YuraWidget (передаёт результат калькулятора)
Portfolio → реальные данные от Олега (заглушки пока)
```

## Формат задачи для агентов

Каждая задача должна иметь:
- Один компонент / один файл (не пакет файлов)
- Чёткий accept criteria (как выглядит "готово")
- Перечень зависимостей (что должно быть готово до)
- Модель: haiku=аудит/фиксы, sonnet=стандарт, opus=сложная анимация/3D

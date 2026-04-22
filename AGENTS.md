<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Optisphere — Agent Config

## Глобальные агенты
Агентная система живёт в `~/.claude/agents/`. Мета-правила в `~/.claude/CLAUDE.md`.  
Всегда начинать с `~/.claude/agents/orchestrator.md`.

## Стек проекта
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript strict (no any)
- **Styling:** Tailwind 4 (PostCSS-only, no tailwind.config.js) + CSS Custom Properties
- **i18n:** next-intl 4.9 (ru.json + en.json в messages/)
- **3D:** Three.js + @react-three/fiber + @react-three/drei
- **Animation:** Framer Motion + Lenis (smooth scroll, уже инициализирован)
- **State:** Zustand 5 (установлен, пока не используется)
- **Testing:** Playwright (настроен в .playwright-mcp/)
- **AI:** @anthropic-ai/sdk (для Юры)

## Проект-специфичные ограничения
> Оркестратор передаёт эти constraints суб-агентам (не весь этот файл)

```
[I18N]    Все тексты ТОЛЬКО через next-intl ключи — никогда хардкод
          Обновлять messages/ru.json И messages/en.json одновременно
[CSS]     Tailwind 4 canonical classes: bg-base-card (не bg-[var(--base-card)])
          Использовать var(--token) из globals.css, не хардкодить hex
[PERF]    Только Hero использует heavy WebGL
[PERF]    @react-three/postprocessing / Bloom — ЗАПРЕЩЕНЫ
          Крашит при context loss (renderer.getContext() → null)
          Свечение → CSS filter: drop-shadow на canvas контейнере
[PERF]    Mobile: DPR [1,1.5], 30fps throttle, без Bloom, упрощённые шейдеры
[NEXT]    App Router. Читать node_modules/next/dist/docs/ перед API
[21ST]    21st.dev MCP работает только в CLI (не в VS Code расширении)
[SPACE]   Тема: космос. Все компоненты — часть одного пространства
[CONV]    Конверсия > визуал. Каждая секция ведёт к заявке
[BUG]     Планеты исчезают при hard refresh в dev — проверить prod сначала
          (npm run build && npm start), вероятно Strict Mode артефакт
[HMR]     Playwright пишет в .playwright-mcp/ → триггерит HMR rebuild
          Workaround: experimental.turbo.watchOptions.ignored в next.config.ts
```

## Визуализация
- **Диаграмма:** [agents/FLOW.md](agents/FLOW.md) → `Ctrl+Shift+V` в VS Code  
  (Установить: [Markdown Preview Mermaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid))
- **Dashboard:** `npm run dev` → [http://localhost:3000/agents](http://localhost:3000/agents) (dev only)
- **CLI Dashboard:** `node ~/.claude/agents/bin/dashboard.js`

## Стейт и задачи
- `agents/state.json` — текущее состояние проекта
- `agents/tasks/` — задачи для команды
- Начать с: [agents/tasks/task-001-audit-and-rebuild.md](agents/tasks/task-001-audit-and-rebuild.md)

## Дизайн-система
```
Base:      #07070F   Base-soft: #0D0D1A   Base-card: #10101E
Text:      #F0F0FF   Text-muted: #7878A0
Blue:      #4F8EFF   (Сайты)     — canonical: text-blue, bg-blue
Gold:      #C9A96E   (Панорамы)  — canonical: text-gold, bg-gold
Mint:      #3ECFA0   (Продвижение) — canonical: text-mint, bg-mint

Fonts: Orbitron (заголовки) + Geist (тело)
Classes: .glass, .glow-blue/gold/mint, .btn/.btn-primary/.btn-outline, .section
```

## Что сделано / Что нет
Смотреть в `agents/state.json` → секции `tasks.completed` / `tasks.in_progress` / `queue.pending`

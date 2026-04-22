# Security.local — Optisphere V3

> **Extends:** `~/.claude/agents/security.md`

## Проект-специфичные риски

### API Routes (/api/*)
```
[CRITICAL] AI_API_KEY — только в серверных route handlers, НИКОГДА в клиентском коде
[CRITICAL] TELEGRAM_BOT_TOKEN — только серверная сторона
[CHECK]    Rate limiting реализован в /api/ai/chat и /api/leads/telegram
[CHECK]    Валидация входных данных (contact, intent, summary) есть в telegram route
```

### Юра (AI ассистент)
```
[CHECK]    URL fetch из сообщений пользователя — проверить SSRF защиту
           Разрешённые домены: любые публичные URLs (пользователь присылает свой сайт)
           Запрещены: localhost, 127.0.0.1, 192.168.*, 10.*, 172.16-31.*
[CHECK]    Длина сообщений пользователя — ограничить до 2000 символов
[CHECK]    Контент фильтрация — Claude API обрабатывает на своей стороне
```

### Next.js конфигурация
```
[CHECK]    Нет секретов в next.config.ts (env переменные без NEXT_PUBLIC_ = серверные)
[CHECK]    .env.local в .gitignore
[CHECK]    API routes не экспортируют секреты в response body
```

### i18n
```
[LOW]      next-intl ключи — XSS низкий риск (escaping в React)
```

## Чеклист быстрого аудита

```
□ process.env.* в клиентском коде → RED FLAG
□ fetch() с user-provided URLs → проверить SSRF
□ eval() / innerHTML / dangerouslySetInnerHTML → RED FLAG
□ SQL/NoSQL запросы с user input → injection check
□ Файловые операции с user input → path traversal check
□ Новые зависимости → npm audit
```

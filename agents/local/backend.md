# Backend.local — Optisphere V3 "NEXUS"

> **Extends:** `~/.claude/agents/backend.md`
> API и интеграции V3. Эндпоинты пересоздаются с нуля.

## Стек

- Next.js 16 App Router — Route Handlers (НЕ Pages API, НЕ req/res)
- TypeScript strict (no any)
- @anthropic-ai/sdk (НЕ openai пакет)
- Telegram Bot API через fetch

## API Эндпоинты V3

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/ai/chat` | Юра streaming (claude-haiku-4-5-20251001) |
| POST | `/api/leads/telegram` | Лид → Telegram Bot |
| POST | `/api/calculator` | Расчёт диапазона стоимости |

## Юра V3 — системный промпт

```
Персонаж: Юра — AI-консультант Optisphere
Тон: уверенный, умный, слегка неформальный. Не навязчивый.
Цель: получить контакт клиента (Telegram / телефон)
Стратегия: 1-2 вопроса → дать пользу → предложить помощь → запросить контакт
Финальная реплика: "Ну что, делаем?"
Иногда: рассказывает факт о космосе (характер)
Язык: русский (по умолчанию), может переключиться на EN

Intent классификация:
  hot  — называет бизнес + бюджет + срок
  warm — интересуется, есть вопросы
  cold — просто смотрит
```

## Модели

```
claude-haiku-4-5-20251001   — Юра (скорость + стоимость)
claude-sonnet-4-6            — резервный для важных ответов
```

## Route Handler паттерн

```typescript
// src/app/api/[endpoint]/route.ts
import { NextResponse } from 'next/server';

// Web Request/Response API — не req/res
// Читать node_modules/next/dist/docs/ перед написанием

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    // валидация...
    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

## Streaming (Юра)

```typescript
// Использовать ReadableStream + StreamingTextResponse pattern
// Anthropic SDK: client.messages.stream()
// Rate limit: 20 req/min per IP (в памяти, без Redis)
```

## ENV переменные

```bash
ANTHROPIC_API_KEY=sk-ant-...     # Claude API (Юра)
TELEGRAM_BOT_TOKEN=...           # Telegram Bot
TELEGRAM_CHAT_ID=...             # ID чата куда слать лиды
```

## Telegram лид-формат

```
🔥 Новый лид — Optisphere

👤 Контакт: {contact}
🎯 Intent: {hot|warm|cold}
📋 Запрос: {summary}

💬 Диалог:
{dialog_formatted}

⏰ {timestamp}
```

## Модели данных

```typescript
interface Lead {
  contact: string;           // Telegram / телефон
  intent: 'hot' | 'warm' | 'cold';
  summary: string;
  dialog: ChatMessage[];
  timestamp: string;
  calcResult?: string;       // если пришёл из калькулятора
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface CalcResult {
  type: 'start' | 'pro' | 'premium' | 'custom';
  min: number;
  max: number;
  days: string;
  features: string[];
}
```

## Калькулятор — логика V3

```
Шаг 1: Тип бизнеса (отель/стройка/медицина/другое)
Шаг 2: Что нужно (лендинг/сайт/интернет-магазин)
Шаг 3: Функции (AI-ассистент/форма/каталог/SEO)
Шаг 4: Срок (срочно/нормально/не горит)

Результат → диапазон + рекомендованный тариф → Юра подхватывает контекст
```

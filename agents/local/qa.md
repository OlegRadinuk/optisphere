# QA.local — Optisphere

> **Extends:** `~/.claude/agents/qa.md`
> Тест-инфраструктура Optisphere. Глобальные паттерны и чеклисты применяются полностью.

## Тест-стек

```
E2E:          Playwright (настроен в .playwright-mcp/)
Unit:         Не установлен — добавить Vitest если нужен
Mocking:      vi.mock для Three.js, MSW для API (нужно установить)
```

## Playwright конфигурация

```
Выходные файлы: .playwright-mcp/ (ПРОБЛЕМА: триггерит HMR rebuild в dev)
Fix:            next.config.ts → experimental.turbo.watchOptions.ignored
Base URL:       http://localhost:3000
Locale routes:  /ru/ (default), /en/
```

## Что уже покрыто

| Компонент/Feature | Тест | Покрытие |
|-------------------|------|---------|
| — | — | Тестов пока нет |

## Three.js мок (использовать для unit тестов)

```typescript
// Мокировать @react-three/fiber и @react-three/drei
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useFrame: vi.fn(),
  useThree: () => ({ size: { width: 1920, height: 1080 }, camera: {} })
}));

vi.mock('@react-three/drei', () => ({
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: () => null,
}));
```

## next-intl мок для компонент-тестов

```typescript
import { NextIntlClientProvider } from 'next-intl';

const messages = {
  nav: { services: 'Услуги', cta: 'Связаться' },
  hero: { badge: 'Тест', title: { line1: 'Заголовок' } }
  // добавлять по мере необходимости
};

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="ru" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}
```

## Что НЕ тестировать

```
GLSL шейдеры — браузер-only, не поддаются unit тестированию
Web Audio API — мокировать или пропускать
Three.js Canvas рендеринг — мокировать весь @react-three/fiber
```

## E2E флоу для Optisphere

```
Основной флоу (Playwright):
1. Открыть / → редирект на /ru/
2. Проверить Hero загрузился (h1 виден)
3. Скролл до ServicesSection
4. Нажать CTA → ожидать реакцию Юры
5. Проверить форму контакта
6. Переключить язык RU → EN
7. Проверить /en/ загрузился

Mobile E2E (390×844):
1. Проверить что hamburger menu работает
2. Проверить sticky CTA на мобилке
3. Проверить что WebGL не используется в не-Hero секциях
```

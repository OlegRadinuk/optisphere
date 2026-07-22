/**
 * SQLite-based rate limiting для booking-эндпоинтов.
 *
 * Преимущество перед in-process Map:
 *   - Переживает PM2-рестарт
 *   - Общий счётчик для всех воркеров кластера (WAL-файл)
 *   - Нет утечки памяти при unbounded Map
 *
 * Таблица: rate_limit_booking (ip, window_start, count)
 *   window_start — начало текущей минуты в Unix-секундах
 *
 * Использование:
 *   const allowed = checkRateLimit(ip, 5)   // max 5 req/min
 *   if (!allowed) return 429
 */
import { getDb } from "@/lib/db"

/**
 * Проверяет и инкрементирует счётчик.
 * @param ip         IP-адрес (уже извлечён из X-Forwarded-For)
 * @param limit      Максимум запросов в минуту
 * @returns true — запрос разрешён; false — лимит превышен
 */
export function checkRateLimit(ip: string, limit: number): boolean {
  const db = getDb()
  // Округляем до начала текущей минуты (Unix секунды)
  const windowStart = Math.floor(Date.now() / 60_000) * 60

  // Атомарный upsert — инкремент счётчика + возвращаем новое значение
  // RETURNING поддерживается в SQLite ≥ 3.35.0 (Node 18+ гарантирует это)
  const row = db.prepare(`
    INSERT INTO rate_limit_booking (ip, window_start, count) VALUES (?, ?, 1)
    ON CONFLICT(ip, window_start) DO UPDATE SET count = count + 1
    RETURNING count
  `).get(ip, windowStart) as { count: number } | undefined

  // Чистка старых окон (старше 2 минут) — небольшой overhead, но ограничивает рост таблицы
  db.prepare(`DELETE FROM rate_limit_booking WHERE window_start < ?`).run(windowStart - 120)

  return (row?.count ?? 0) <= limit
}

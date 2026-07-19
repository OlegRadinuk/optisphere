import { getAlbamedPrices, type AlbamedBranch, type AlbamedPricesResponse } from "@/lib/albamed/prices"
import { AlbamedPricePreview } from "./AlbamedPricePreview"

/**
 * Демо-витрина прайса Альба-Мед — показать клиенту, как будет выглядеть
 * страница «Стоимость услуг» на его сайте. Не индексируется (см. layout.tsx),
 * не является страницей Optisphere.
 *
 * Данные берём напрямую через getAlbamedPrices() (тот же кэш в памяти
 * процесса, что и у /api/albamed/prices) — без лишнего HTTP-хопа на себя же.
 */

export const dynamic = "force-dynamic"

async function loadBranches(): Promise<{
  branches: Record<AlbamedBranch, AlbamedPricesResponse> | null
  error: string | null
}> {
  try {
    const [kantar, kievskaya] = await Promise.all([
      getAlbamedPrices("kantar"),
      getAlbamedPrices("kievskaya"),
    ])
    return {
      branches: { kantar: kantar.data, kievskaya: kievskaya.data },
      error: null,
    }
  } catch (err) {
    console.error("[preview/albamed-price] failed to load prices:", err)
    return {
      branches: null,
      error: err instanceof Error ? err.message : "Не удалось загрузить прайс",
    }
  }
}

export default async function AlbamedPricePreviewPage() {
  const { branches, error } = await loadBranches()

  if (!branches) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>
            Прайс временно недоступен
          </h1>
          <p style={{ fontSize: 14, color: "#757575", margin: 0 }}>{error}</p>
        </div>
      </main>
    )
  }

  return <AlbamedPricePreview branches={branches} />
}

import type { Metadata } from "next"
import { Montserrat, Open_Sans } from "next/font/google"

/**
 * Отдельный root-layout вне [locale] — это НЕ страница Optisphere, а имитация
 * будущей страницы клиники Альба-Мед для показа клиенту. Поэтому без
 * фирменного стиля Optisphere (globals.css сюда намеренно не подключаем):
 * свои шрифты и цвета клиники (см. AlbamedPricePreview.tsx).
 */

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800"],
  display: "swap",
})

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Стоимость услуг — Альба-Мед (предпросмотр)",
  description: "Предпросмотр страницы прайса для медицинского центра Альба-Мед",
  robots: { index: false, follow: false },
}

export default function AlbamedPricePreviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={`${montserrat.variable} ${openSans.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Явный <meta> — вдобавок к metadata.robots выше, дублирование намеренное */}
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#ffffff",
          color: "#2b2b2b",
          fontFamily: "var(--font-open-sans), 'Open Sans', system-ui, -apple-system, sans-serif",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        {children}
      </body>
    </html>
  )
}

import type { Metadata } from "next"
import { Oxanium, Inter, JetBrains_Mono } from "next/font/google"
import "../globals.css"

const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  weight: ["400", "500"],
})

export const metadata: Metadata = {
  title: "AI-администратор для клиники — Optisphere",
  description:
    "Отвечает пациентам и ведёт запись 24/7. Запустить — 10 минут, без программиста.",
  robots: "noindex, nofollow",
}

export default function SaasLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ru"
      className={`${oxanium.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body style={{ margin: 0, background: "var(--op-base)", color: "var(--op-text)" }}>
        {children}
      </body>
    </html>
  )
}

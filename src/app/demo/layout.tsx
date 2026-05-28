import type { Metadata } from "next"
import { Oxanium, Inter } from "next/font/google"

const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Демо панели управления клиникой — Optisphere",
  description: "Попробуйте панель управления клиникой: лиды, запись, диалоги с AI-ассистентом, статистика. Демо-доступ без регистрации.",
  robots: "noindex, nofollow",
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${oxanium.variable} ${inter.variable}`}>
      <body
        style={{
          margin: 0,
          background: "#F8FAFB",
          color: "#0F172A",
          fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif",
          fontSize: 14,
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        {children}
      </body>
    </html>
  )
}

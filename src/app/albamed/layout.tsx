import type { Metadata } from "next"
import { AlbamedShell } from "@/components/albamed/AlbamedShell"

export const metadata: Metadata = {
  title: "Альбамед — Дашборд",
  robots: "noindex, nofollow",
}

export default function AlbamedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          background: "#0f172a",
          color: "#e2e8f0",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 14,
        }}
      >
        <AlbamedShell>{children}</AlbamedShell>
      </body>
    </html>
  )
}

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Optisphere Admin",
  robots: "noindex, nofollow",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, background: "#0f172a", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  )
}

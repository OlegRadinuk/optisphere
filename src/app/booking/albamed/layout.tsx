import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Запись к врачу — Альбамед",
  description: "Онлайн-запись к специалистам медицинского центра Альбамед",
  robots: "noindex, nofollow",
}

export default function AlbamedBookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#ffffff",
          color: "#111827",
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          fontSize: 15,
          lineHeight: 1.5,
        }}
      >
        {children}
      </body>
    </html>
  )
}

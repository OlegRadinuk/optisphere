import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@splinetool/react-spline"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      // Общие security-заголовки — на всё, включая /booking (фрейминг тут не задаётся).
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      // Весь сайт КРОМЕ /booking — запрет фрейминга с чужих доменов (антикликджекинг).
      // Граница по сегменту (booking/ или ровно booking), чтобы /bookings и т.п. не выпадали из защиты.
      {
        source: "/((?!booking(?:/|$)).*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
        ],
      },
      // Страница записи — разрешаем встраивание в iframe на сайте клиники Альбамед.
      // X-Frame-Options НЕ выставляем (он legacy и заблокировал бы кросс-доменный фрейм),
      // ограничение фрейминга задаётся только через frame-ancestors.
      {
        source: "/booking/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://alba-medcenter.ru https://www.alba-medcenter.ru",
          },
        ],
      },
    ]
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: /node_modules|\.playwright-mcp/,
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);

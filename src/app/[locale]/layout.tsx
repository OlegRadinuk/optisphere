import type { Metadata } from "next";
import { Oxanium, Inter, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import YuraWidgetLoader from "@/components/ai/YuraWidgetLoader";
import { HeroChatProvider } from "@/components/ai/HeroChatContext";
import "../globals.css";

const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  weight: ["400", "500"],
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: {
      default: "Optisphere — AI Web Studio",
      template: "%s | Optisphere",
    },
    description:
      locale === "ru"
        ? "Первая AI-нативная веб-студия. Сайт + цифровой продавец Юра."
        : "First AI-native web studio. Website + digital salesperson Yura.",
    metadataBase: new URL("https://optisphere.tech"),
    alternates: {
      canonical: locale === "ru" ? "/" : "/en",
      languages: { ru: "/", en: "/en" },
    },
    openGraph: {
      siteName: "Optisphere",
      locale: locale === "ru" ? "ru_RU" : "en_US",
      type: "website",
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${oxanium.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-base text-text">
        <NextIntlClientProvider messages={messages}>
          <HeroChatProvider>
            {children}
            <YuraWidgetLoader />
          </HeroChatProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

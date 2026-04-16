import type { Metadata } from "next";
import { Geist, Orbitron } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import YuraWidgetLoader from "@/components/ai/YuraWidgetLoader";
import "../globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"],
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
    <html lang={locale} className={`${geist.variable} ${orbitron.variable}`}>
      <body className="bg-base text-text">
        <NextIntlClientProvider messages={messages}>
          {children}
          <YuraWidgetLoader />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

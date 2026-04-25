import type { Metadata } from "next";
import { Oxanium, Inter, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import YuraWidgetLoader from "@/components/ai/YuraWidgetLoader";
import LoadingScreen from "@/components/LoadingScreen";
import { HeroChatProvider } from "@/components/ai/HeroChatContext";
import TransitionProvider from "@/components/transitions/TransitionProvider";
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
        ? "Первая AI-нативная веб-студия. Сайт + AI-ассистент Опти — продаёт 24/7."
        : "First AI-native web studio. Website + AI assistant Opti — sells 24/7.",
    metadataBase: new URL("https://optisphere.tech"),
    alternates: {
      canonical: locale === "ru" ? "https://optisphere.tech/" : "https://optisphere.tech/en",
      languages: {
        ru: "https://optisphere.tech/",
        en: "https://optisphere.tech/en",
      },
    },
    openGraph: {
      siteName: "Optisphere",
      locale: locale === "ru" ? "ru_RU" : "en_US",
      type: "website",
      title: "Optisphere — AI Web Studio",
      description: locale === "ru"
        ? "Первая AI-нативная веб-студия. Сайт + AI-ассистент Опти — продаёт 24/7."
        : "First AI-native web studio. Website + AI assistant Opti — sells 24/7.",
    },
    twitter: {
      card: "summary_large_image",
      title: "Optisphere — AI Web Studio",
      description: locale === "ru"
        ? "Первая AI-нативная веб-студия. Сайт + AI-ассистент Опти — продаёт 24/7."
        : "First AI-native web studio. Website + AI assistant Opti — sells 24/7.",
    },
    verification: {
      google: "D2bmSl1lozm70q5Iq9WasgQJ2pbS2l1_bh9jJJo_pIg",
      yandex: "d5a06dfcc3217e76",
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

function buildSchemaOrg(locale: string): string {
  const isRu = locale === "ru";
  const siteUrl = "https://optisphere.tech";

  const localBusiness = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${siteUrl}/#organization`,
        name: isRu ? "Optisphere — AI-студия веб-разработки" : "Optisphere — AI Web Studio",
        url: siteUrl,
        logo: `${siteUrl}/og-image.png`,
        image: `${siteUrl}/og-image.png`,
        description: isRu
          ? "Первая AI-нативная веб-студия. Создаём сайты и AI-ассистентов для гостиниц, клиник, строительных компаний."
          : "First AI-native web studio. We build websites and AI assistants for hotels, clinics, and construction companies.",
        email: "hello@optisphere.ru",
        telephone: "+79785768451",
        areaServed: [
          { "@type": "Country", name: "Russia" },
          { "@type": "AdministrativeArea", name: isRu ? "Крым" : "Crimea" },
        ],
        serviceType: isRu
          ? ["Веб-разработка", "AI-ассистенты", "SEO-продвижение"]
          : ["Web Development", "AI Assistants", "SEO"],
        inLanguage: isRu ? "ru-RU" : "en-US",
        sameAs: [],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Optisphere",
        publisher: { "@id": `${siteUrl}/#organization` },
        inLanguage: isRu ? "ru-RU" : "en-US",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return JSON.stringify(localBusiness);
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${oxanium.variable} ${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
  try {
    var t = localStorage.getItem('op-theme');
    if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
  } catch(e) {}
` }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: buildSchemaOrg(locale) }}
        />
      </head>
      <body style={{ background: "var(--op-base)", color: "var(--op-text)" }}>
        <LoadingScreen />
        <NextIntlClientProvider messages={messages}>
          <HeroChatProvider>
            <TransitionProvider>
              {children}
              <YuraWidgetLoader />
            </TransitionProvider>
          </HeroChatProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

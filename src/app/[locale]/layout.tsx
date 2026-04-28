import type { Metadata } from "next";
import { Oxanium, Inter, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import OptiWidgetLoader from "@/components/ai/OptiWidgetLoader";
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

  const titleDefault =
    locale === "ru"
      ? "Создание сайтов в Крыму с AI-ассистентом | Optisphere"
      : "Website Development in Crimea with AI Assistant | Optisphere";

  const description =
    locale === "ru"
      ? "Разрабатываем продающие сайты для малого бизнеса в Крыму. Лендинги от 50 000 ₽. AI-ассистент в каждом сайте. Симферополь, Севастополь, Ялта. Работаем по всей России."
      : "We build conversion-focused websites for businesses in Crimea. Landing pages from 50 000 ₽. AI assistant included. Simferopol, Sevastopol, Yalta.";

  return {
    title: {
      default: titleDefault,
      template: "%s | Optisphere",
    },
    description,
    ...(locale === "ru"
      ? {
          keywords: [
            "создание сайтов Крым",
            "разработка сайтов Симферополь",
            "лендинг под ключ",
            "AI-ассистент для сайта",
            "веб-студия Крым",
            "SEO продвижение Крым",
            "Яндекс.Директ настройка",
            "сайт для бизнеса",
          ],
        }
      : {}),
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
      title: titleDefault,
      description,
      url: locale === "ru" ? "https://optisphere.tech/" : "https://optisphere.tech/en",
    },
    twitter: {
      card: "summary_large_image",
      title: titleDefault,
      description,
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
        address: {
          "@type": "PostalAddress",
          addressLocality: "Симферополь",
          addressRegion: "Республика Крым",
          addressCountry: "RU",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 44.952116,
          longitude: 34.102411,
        },
        areaServed: [
          { "@type": "Country", name: "Russia" },
          { "@type": "AdministrativeArea", name: isRu ? "Крым" : "Crimea" },
          { "@type": "City", name: isRu ? "Симферополь" : "Simferopol" },
          { "@type": "City", name: isRu ? "Севастополь" : "Sevastopol" },
          { "@type": "City", name: isRu ? "Ялта" : "Yalta" },
          { "@type": "City", name: isRu ? "Феодосия" : "Feodosiya" },
          { "@type": "City", name: isRu ? "Евпатория" : "Yevpatoria" },
          { "@type": "City", name: isRu ? "Керчь" : "Kerch" },
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
              <OptiWidgetLoader />
            </TransitionProvider>
          </HeroChatProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

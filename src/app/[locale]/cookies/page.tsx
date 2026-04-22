import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Link from "next/link"

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "cookies" })
  return {
    title: t("title"),
    description: t("meta_desc"),
  }
}

export default async function CookiesPage() {
  const t = await getTranslations("cookies")

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--op-base)",
        color: "var(--op-text)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Back nav */}
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "32px 24px 0",
        }}
      >
        <Link
          href="/"
          style={{
            font: "400 13px/1 'JetBrains Mono', monospace",
            color: "var(--op-text-muted)",
            textDecoration: "none",
            letterSpacing: ".08em",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ← Optisphere
        </Link>
      </div>

      {/* Content */}
      <article
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "48px 24px 96px",
        }}
      >
        <h1
          style={{
            font: "600 32px/1.2 'Oxanium', sans-serif",
            color: "var(--op-text)",
            marginBottom: 8,
          }}
        >
          {t("title")}
        </h1>
        <p
          style={{
            font: "400 12px/1 'JetBrains Mono', monospace",
            color: "var(--op-text-muted)",
            marginBottom: 48,
            letterSpacing: ".06em",
          }}
        >
          {t("updated")}
        </p>

        <Section heading={t("what_title")}>
          <p>{t("what_text")}</p>
        </Section>

        <Section heading={t("types_title")}>
          <h3
            style={{
              font: "600 14px/1.4 'Inter', sans-serif",
              color: "var(--op-text)",
              marginBottom: 6,
              marginTop: 16,
            }}
          >
            {t("technical_title")}
          </h3>
          <p>{t("technical_text")}</p>
          <ul>
            {(t.raw("technical_items") as string[]).map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h3
            style={{
              font: "600 14px/1.4 'Inter', sans-serif",
              color: "var(--op-text)",
              marginBottom: 6,
              marginTop: 20,
            }}
          >
            {t("analytics_title")}
          </h3>
          <p>{t("analytics_text")}</p>
          <ul>
            {(t.raw("analytics_items") as string[]).map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </Section>

        <Section heading={t("no_trackers_title")}>
          <p>{t("no_trackers_text")}</p>
        </Section>

        <Section heading={t("control_title")}>
          <p>{t("control_text")}</p>
        </Section>

        <Section heading={t("contact_title")}>
          <p>{t("contact_text")}</p>
        </Section>
      </article>
    </main>
  )
}

function Section({
  heading,
  children,
}: {
  heading: string
  children: React.ReactNode
}) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2
        style={{
          font: "600 18px/1.3 'Oxanium', sans-serif",
          color: "var(--op-text)",
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: "1px solid var(--op-border)",
        }}
      >
        {heading}
      </h2>
      <div
        style={{
          font: "400 15px/1.7 'Inter', sans-serif",
          color: "var(--op-text-secondary)",
        }}
      >
        {children}
      </div>
    </section>
  )
}

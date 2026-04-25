import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import TransitionLink from "@/components/transitions/TransitionLink"

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "privacy" })
  return {
    title: t("title"),
    description: t("meta_desc"),
  }
}

export default async function PrivacyPage() {
  const t = await getTranslations("privacy")

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
        <TransitionLink
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
        </TransitionLink>
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

        <Section heading={t("operator_title")}>
          <p>{t("operator_text")}</p>
        </Section>

        <Section heading={t("data_title")}>
          <p>{t("data_text")}</p>
          <ul>
            {(t.raw("data_items") as string[]).map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </Section>

        <Section heading={t("purpose_title")}>
          <p>{t("purpose_text")}</p>
          <ul>
            {(t.raw("purpose_items") as string[]).map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </Section>

        <Section heading={t("basis_title")}>
          <p>{t("basis_text")}</p>
        </Section>

        <Section heading={t("retention_title")}>
          <p>{t("retention_text")}</p>
        </Section>

        <Section heading={t("transfer_title")}>
          <p>{t("transfer_text")}</p>
        </Section>

        <Section heading={t("rights_title")}>
          <p>{t("rights_text")}</p>
          <ul>
            {(t.raw("rights_items") as string[]).map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p style={{ marginTop: 12 }}>{t("rights_contact")}</p>
        </Section>

        <Section heading={t("revoke_title")}>
          <p>{t("revoke_text")}</p>
        </Section>

        <Section heading={t("security_title")}>
          <p>{t("security_text")}</p>
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

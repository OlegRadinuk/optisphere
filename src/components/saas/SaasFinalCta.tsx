import Link from "next/link"

export default function SaasFinalCta() {
  return (
    <section
      id="contact"
      style={{
        padding: "96px 0",
        background: "var(--op-surface)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Red glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 50% 80% at 50% 50%, rgba(232,32,32,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 600,
          margin: "0 auto",
          padding: "0 clamp(20px,4vw,48px)",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--op-font-display)",
            fontSize: "clamp(28px,4vw,40px)",
            fontWeight: 700,
            color: "var(--op-text)",
          }}
        >
          Запустите AI-администратора сегодня
        </h2>
        <p
          style={{
            fontFamily: "var(--op-font-body)",
            fontSize: 16,
            color: "var(--op-text-secondary)",
            marginTop: 12,
            lineHeight: 1.6,
          }}
        >
          10 минут настройки. Бесплатно. Первый пациент — уже сегодня вечером.
        </p>

        <div
          className="saas-final-cta-btns"
          style={{
            marginTop: 32,
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/saas/onboarding"
            className="btn btn-primary"
            style={{ height: 52, padding: "0 32px", fontSize: 16, fontWeight: 600 }}
          >
            Создать AI-администратора бесплатно
          </Link>
          <a
            href="https://t.me/optisphere"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
            style={{ height: 52, padding: "0 28px", fontSize: 15 }}
          >
            Хочу интеграцию с нашей МИС
          </a>
        </div>

        <p
          style={{
            fontFamily: "var(--op-font-body)",
            fontSize: 12,
            color: "var(--op-text-muted)",
            marginTop: 16,
          }}
        >
          Без кредитной карты · Без технических знаний · Отмена в любой момент
        </p>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .saas-final-cta-btns {
            flex-direction: column;
            align-items: stretch;
          }
          .saas-final-cta-btns .btn {
            justify-content: center;
          }
        }
      `}</style>
    </section>
  )
}

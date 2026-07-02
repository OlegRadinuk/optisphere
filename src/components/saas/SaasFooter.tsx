export default function SaasFooter() {
  return (
    <footer
      style={{
        background: "var(--op-base)",
        borderTop: "1px solid var(--op-border)",
        padding: "32px 0",
      }}
    >
      <div
        className="saas-footer-inner"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 clamp(20px,4vw,48px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <span
          style={{
            fontFamily: "var(--op-font-body)",
            fontSize: 13,
            color: "var(--op-text-muted)",
          }}
        >
          © 2026 Optisphere
        </span>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <a
            href="/privacy"
            style={{
              fontFamily: "var(--op-font-body)",
              fontSize: 13,
              color: "var(--op-text-muted)",
              textDecoration: "none",
            }}
          >
            Политика конфиденциальности
          </a>
          <a
            href="/cookies"
            style={{
              fontFamily: "var(--op-font-body)",
              fontSize: 13,
              color: "var(--op-text-muted)",
              textDecoration: "none",
            }}
          >
            Cookies
          </a>
        </div>

        <a
          href="https://t.me/optisphere"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Telegram Optisphere"
          style={{ color: "var(--op-text-muted)", lineHeight: 0 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.22 13.49l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.46c.537-.194 1.006.131.928.068z" />
          </svg>
        </a>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .saas-footer-inner {
            flex-direction: column !important;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  )
}

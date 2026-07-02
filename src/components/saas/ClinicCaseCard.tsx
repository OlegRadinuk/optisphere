interface CaseMetric {
  value: string
  label: string
}

interface ClinicCaseCardProps {
  initial: string
  name: string
  subtitle: string
  quote: string
  metrics: [CaseMetric, CaseMetric, CaseMetric]
}

export default function ClinicCaseCard({
  initial,
  name,
  subtitle,
  quote,
  metrics,
}: ClinicCaseCardProps) {
  return (
    <div
      style={{
        background: "var(--op-surface-elevated)",
        border: "1px solid var(--op-border)",
        borderRadius: 16,
        padding: "32px 28px",
        position: "relative",
        flex: 1,
        minWidth: 0,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: "rgba(232,32,32,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <span
            style={{
              fontFamily: "var(--op-font-display)",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--op-accent)",
            }}
          >
            {initial}
          </span>
        </div>
        <div>
          <div
            style={{
              fontFamily: "var(--op-font-display)",
              fontSize: 20,
              fontWeight: 700,
              color: "var(--op-text)",
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontFamily: "var(--op-font-body)",
              fontSize: 13,
              color: "var(--op-text-secondary)",
              marginTop: 2,
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>

      {/* Quote */}
      <blockquote
        style={{
          fontFamily: "var(--op-font-body)",
          fontSize: 15,
          color: "var(--op-text-secondary)",
          fontStyle: "italic",
          lineHeight: 1.7,
          margin: "0 0 24px",
          borderLeft: "2px solid var(--op-accent)",
          paddingLeft: 16,
        }}
      >
        &ldquo;{quote}&rdquo;
      </blockquote>

      {/* Metrics */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 20,
        }}
      >
        {metrics.map((metric, i) => (
          <div
            key={metric.label}
            style={{
              flex: 1,
              padding: "0 16px",
              borderLeft: i > 0 ? "1px solid var(--op-border)" : "none",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div
              style={{
                fontFamily: "var(--op-font-mono)",
                fontSize: 28,
                fontWeight: 700,
                color: "var(--op-accent)",
              }}
            >
              {metric.value}
            </div>
            <div
              style={{
                fontFamily: "var(--op-font-body)",
                fontSize: 12,
                color: "var(--op-text-muted)",
                lineHeight: 1.4,
              }}
            >
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      {/* Status tag */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#22c55e",
            boxShadow: "0 0 6px rgba(34,197,94,0.6)",
            animation: "optiGreenPulse 2s ease-in-out infinite",
          }}
          aria-hidden="true"
        />
        <span
          style={{
            fontFamily: "var(--op-font-body)",
            fontSize: 12,
            color: "#22c55e",
          }}
        >
          AI-администратор · активен
        </span>
      </div>

      <style>{`
        @keyframes optiGreenPulse {
          0%, 100% { opacity: 0.6; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

interface DarkStatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  accent?: boolean
}

export default function DarkStatCard({ icon, label, value, sub, accent = false }: DarkStatCardProps) {
  return (
    <div
      style={{
        background: accent
          ? "linear-gradient(135deg, rgba(232,32,32,0.15), rgba(255,74,74,0.08))"
          : "var(--op-surface)",
        border: `1px solid ${accent ? "rgba(232,32,32,0.3)" : "var(--op-border)"}`,
        borderRadius: 12,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "rgba(232,32,32,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div
        style={{
          fontFamily: "var(--op-font-body)",
          fontSize: 12,
          color: "var(--op-text-muted)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--op-font-mono)",
          fontSize: 32,
          fontWeight: 700,
          color: accent ? "var(--op-accent)" : "var(--op-text)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "var(--op-font-body)",
          fontSize: 12,
          color: "var(--op-text-secondary)",
        }}
      >
        {sub}
      </div>
    </div>
  )
}

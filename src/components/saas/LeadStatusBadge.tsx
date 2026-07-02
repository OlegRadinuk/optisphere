import type { LeadStatus } from "./mock-data"

interface LeadStatusBadgeProps {
  status: LeadStatus
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; bg: string; color: string; border: string }> = {
  new: {
    label: "Новый",
    bg: "rgba(232,32,32,0.1)",
    color: "var(--op-accent)",
    border: "rgba(232,32,32,0.25)",
  },
  working: {
    label: "В работе",
    bg: "rgba(99,102,241,0.1)",
    color: "#818cf8",
    border: "rgba(99,102,241,0.25)",
  },
  closed: {
    label: "Закрыт",
    bg: "rgba(34,197,94,0.08)",
    color: "#4ade80",
    border: "rgba(34,197,94,0.2)",
  },
}

export default function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 9999,
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontFamily: "var(--op-font-body)",
        fontSize: 12,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
      aria-label={`Статус: ${config.label}`}
    >
      {config.label}
    </span>
  )
}

interface StatusBadgeProps {
  status: "new" | "working" | "closed"
}

const STATUS_CONFIG = {
  new: { bg: "#1d3461", color: "#3b82f6", label: "Новый" },
  working: { bg: "#3d2e0a", color: "#f59e0b", label: "В работе" },
  closed: { bg: "#0f2a1a", color: "#22c55e", label: "Закрыт" },
} as const

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      style={{
        background: cfg.bg,
        color: cfg.color,
        borderRadius: 9999,
        padding: "2px 8px",
        fontSize: 12,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  )
}

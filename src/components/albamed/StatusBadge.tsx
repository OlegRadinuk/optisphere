interface StatusBadgeProps {
  status: "new" | "working" | "closed"
}

const STATUS_CONFIG = {
  new:     { bg: "#fff4ec", color: "#f47920", border: "#fdd9b5", label: "Новый" },
  working: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe", label: "В работе" },
  closed:  { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", label: "Закрыт" },
} as const

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      style={{
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        borderRadius: 9999,
        padding: "3px 10px",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  )
}

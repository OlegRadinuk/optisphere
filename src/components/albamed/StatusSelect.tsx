"use client"

import { useState } from "react"

type LeadStatus = "new" | "working" | "closed"

interface StatusSelectProps {
  leadId: number
  current: LeadStatus
  onChange?: (newStatus: LeadStatus) => void
}

const STATUS_STYLES: Record<LeadStatus, React.CSSProperties> = {
  new:     { background: "#fff4ec", color: "#f47920", borderColor: "#fdd9b5" },
  working: { background: "#eff6ff", color: "#2563eb", borderColor: "#bfdbfe" },
  closed:  { background: "#f0fdf4", color: "#16a34a", borderColor: "#bbf7d0" },
}

export function StatusSelect({ leadId, current, onChange }: StatusSelectProps) {
  const [status, setStatus] = useState<LeadStatus>(current)
  const [saving, setSaving] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as LeadStatus
    setSaving(true)
    try {
      const r = await fetch("/api/albamed/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      })
      if (r.ok) {
        setStatus(newStatus)
        onChange?.(newStatus)
      }
    } finally {
      setSaving(false)
    }
  }

  const styles = STATUS_STYLES[status]

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={saving}
      style={{
        ...styles,
        border: `1px solid ${styles.borderColor as string}`,
        borderRadius: 6,
        padding: "5px 10px",
        fontSize: 12,
        fontWeight: 600,
        cursor: saving ? "not-allowed" : "pointer",
        opacity: saving ? 0.6 : 1,
        outline: "none",
        fontFamily: "inherit",
      }}
    >
      <option value="new">Новый</option>
      <option value="working">В работе</option>
      <option value="closed">Закрыт</option>
    </select>
  )
}

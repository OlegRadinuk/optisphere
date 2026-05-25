"use client"

import { useState } from "react"

type LeadStatus = "new" | "working" | "closed"

interface StatusSelectProps {
  leadId: number
  current: LeadStatus
  onChange?: (newStatus: LeadStatus) => void
}

const STATUS_STYLES: Record<LeadStatus, React.CSSProperties> = {
  new: { background: "#1d3461", color: "#3b82f6", borderColor: "#3b82f6" },
  working: { background: "#3d2e0a", color: "#f59e0b", borderColor: "#f59e0b" },
  closed: { background: "#0f2a1a", color: "#22c55e", borderColor: "#22c55e" },
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
        padding: "4px 8px",
        fontSize: 12,
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

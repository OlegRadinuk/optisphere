"use client"

interface InlineToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function InlineToggle({ checked, onChange, disabled }: InlineToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        width: 36,
        height: 20,
        borderRadius: 10,
        background: checked ? "#0D9488" : "#d1d5db",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        padding: 2,
        transition: "background 200ms",
        opacity: disabled ? 0.5 : 1,
        outline: "none",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          display: "block",
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          transform: checked ? "translateX(16px)" : "translateX(0)",
          transition: "transform 200ms",
          flexShrink: 0,
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  )
}

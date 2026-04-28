'use client';

interface OptiCtaButtonProps {
  label: string;
  variant?: 'primary' | 'ghost';
  height?: number;
  padding?: string;
}

export function OptiCtaButton({
  label,
  variant = 'primary',
  height = 48,
  padding = '0 28px',
}: OptiCtaButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('opti-open'))}
      style={{
        height,
        padding,
        background: isPrimary ? 'var(--op-accent)' : 'transparent',
        color: isPrimary ? 'var(--op-text-on-accent)' : 'var(--op-text-secondary)',
        border: isPrimary ? 'none' : '1px solid var(--op-border-strong)',
        borderRadius: isPrimary ? 0 : 4,
        cursor: 'pointer',
        font: "500 14px/1 'Inter',sans-serif",
        clipPath: isPrimary
          ? 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
          : 'none',
        transition: 'all 200ms',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

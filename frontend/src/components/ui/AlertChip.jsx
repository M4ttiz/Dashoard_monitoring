export default function AlertChip({ count = 0, severity = 'warning', onClick, ariaLabel }) {
  if (!count) {
    return <span className="font-mono text-xs text-text-muted">—</span>
  }

  const tone =
    severity === 'critical'
      ? 'bg-status-critical/20 text-status-critical ring-status-critical/40'
      : 'bg-status-warning/20 text-status-warning ring-status-warning/40'

  const Component = onClick ? 'button' : 'span'

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label={ariaLabel || `${count} alert`}
      className={`inline-flex min-w-6 items-center justify-center rounded-md px-1.5 py-0.5 font-mono text-xs font-semibold ring-1 ${tone} ${
        onClick ? 'cursor-pointer hover:brightness-110' : ''
      }`}
    >
      {count}
    </Component>
  )
}

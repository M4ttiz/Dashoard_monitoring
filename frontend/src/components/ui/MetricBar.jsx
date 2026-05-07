import { statusFromValue } from '../../utils/thresholds.js'

const STATUS_BAR_CLASS = {
  ok: 'bg-status-ok',
  warning: 'bg-status-warning',
  critical: 'bg-status-critical',
  unknown: 'bg-bg-border',
}

export default function MetricBar({ value, max = 100, height = 6, ariaLabel }) {
  const numeric = Number(value)
  const safe = Number.isFinite(numeric) ? Math.max(0, Math.min(100, (numeric / max) * 100)) : 0
  const status = statusFromValue(numeric)
  const tone = STATUS_BAR_CLASS[status] || STATUS_BAR_CLASS.unknown

  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Number.isFinite(numeric) ? numeric : 0}
      className="w-full overflow-hidden rounded bg-bg-border/40"
      style={{ height }}
    >
      <div
        className={`h-full transition-[width] duration-300 ease-out ${tone}`}
        style={{ width: `${safe}%` }}
      />
    </div>
  )
}

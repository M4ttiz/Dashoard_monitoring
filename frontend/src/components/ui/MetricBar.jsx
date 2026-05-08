import { statusFromValue } from '../../utils/thresholds.js'

export default function MetricBar({ value, max = 100, height = 6, ariaLabel }) {
  const numeric = Number(value)
  const safe = Number.isFinite(numeric) ? Math.max(0, Math.min(100, (numeric / max) * 100)) : 0
  const status = statusFromValue(numeric)
  const toneText =
    status === 'ok'
      ? 'text-status-ok'
      : status === 'warning'
        ? 'text-status-warning'
        : status === 'critical'
          ? 'text-status-critical'
          : status === 'down'
            ? 'text-status-unknown'
            : 'text-text-muted'

  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Number.isFinite(numeric) ? numeric : 0}
      className={`relative w-full overflow-hidden ${toneText}`}
      style={{ height }}
    >
      <div aria-hidden="true" className="absolute inset-0 rounded-[4px] bg-bg-border" />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 rounded-[4px] transition-[width] duration-150 ease-out bg-current"
        style={{ width: `${safe}%` }}
      />
    </div>
  )
}

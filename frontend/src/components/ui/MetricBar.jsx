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
      {/* Track */}
      <div aria-hidden="true" className="absolute inset-0 bg-bg-border" />

      {/* Filled part: segmented with 25% ticks. */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 transition-[width] duration-80 ease-out"
        style={{
          width: `${safe}%`,
          backgroundImage:
            'repeating-linear-gradient(90deg, currentColor 0, currentColor calc(100% - 1px), transparent calc(100% - 1px), transparent 100%)',
          backgroundSize: '25% 100%',
        }}
      />

      {/* Vertical tick overlay (every 25%). */}
      {[25, 50, 75].map((p) => (
        <span
          key={p}
          aria-hidden="true"
          className="absolute top-0 bottom-0 w-px bg-current opacity-25"
          style={{ left: `${p}%` }}
        />
      ))}
    </div>
  )
}

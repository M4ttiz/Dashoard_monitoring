import { STATUS_LABEL } from '../../utils/thresholds.js'

const TONE_CLASSES = {
  ok: 'bg-status-ok/15 text-status-ok ring-1 ring-status-ok/30',
  warning: 'bg-status-warning/15 text-status-warning ring-1 ring-status-warning/30',
  critical: 'bg-status-critical/20 text-status-critical ring-1 ring-status-critical/40',
  down: 'bg-status-unknown/20 text-status-unknown ring-1 ring-status-unknown/30',
  unknown: 'bg-status-unknown/15 text-status-unknown ring-1 ring-status-unknown/30',
}

const DOT_CLASSES = {
  ok: 'bg-status-ok',
  warning: 'bg-status-warning',
  critical: 'bg-status-critical',
  down: 'bg-status-unknown',
  unknown: 'bg-status-unknown',
}

export default function StatusBadge({ status = 'unknown', label, size = 'md', dot = true }) {
  const tone = TONE_CLASSES[status] || TONE_CLASSES.unknown
  const dotTone = DOT_CLASSES[status] || DOT_CLASSES.unknown
  const text = label ?? STATUS_LABEL[status] ?? STATUS_LABEL.unknown
  const sizing =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px]'
      : 'px-2.5 py-1 text-xs'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-semibold uppercase tracking-wide ${tone} ${sizing}`}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={`inline-block size-1.5 rounded-full ${dotTone} ${
            status === 'critical' ? 'animate-pulse' : ''
          }`}
        />
      ) : null}
      {text}
    </span>
  )
}

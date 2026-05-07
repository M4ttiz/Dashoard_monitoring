import { STATUS_LABEL } from '../../utils/thresholds.js'

const TONE_CLASSES = {
  ok: 'bg-status-ok/10 border-status-ok/35 text-status-ok',
  warning: 'bg-status-warning/10 border-status-warning/35 text-status-warning',
  critical: 'bg-status-critical/10 border-status-critical/35 text-status-critical',
  down: 'bg-status-unknown/10 border-status-unknown/35 text-status-unknown',
  unknown: 'bg-status-unknown/10 border-status-unknown/35 text-status-unknown',
}

export default function StatusBadge({ status = 'unknown', label, size = 'md', dot = true }) {
  const tone = TONE_CLASSES[status] || TONE_CLASSES.unknown
  const text = label ?? STATUS_LABEL[status] ?? STATUS_LABEL.unknown
  const sizing =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px]'
      : 'px-2.5 py-1 text-[11px]'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[4px] border ${tone} font-sans font-semibold uppercase tracking-wide ${sizing}`}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={[
            'inline-block size-2 rounded-full bg-current',
            status === 'ok' ? 'shadow-[0_0_3px_0_currentColor]' : 'shadow-[0_0_4px_0_currentColor]',
            status === 'critical' ? 'animate-[led-pulse_2.1s_ease-in-out_infinite]' : '',
          ].join(' ')}
        />
      ) : null}
      {text}
    </span>
  )
}

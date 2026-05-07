import { STATUS_LABEL } from '../../utils/thresholds.js'

const TONE_CLASSES = {
  ok: 'bg-status-ok/8 border-status-ok/35 text-status-ok',
  warning: 'bg-status-warning/8 border-status-warning/35 text-status-warning',
  critical: 'bg-status-critical/8 border-status-critical/35 text-status-critical',
  down: 'bg-status-unknown/8 border-status-unknown/35 text-status-unknown',
  unknown: 'bg-status-unknown/8 border-status-unknown/35 text-status-unknown',
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
      className={`inline-flex items-center gap-2 rounded-[2px] border ${tone} font-display font-bold uppercase tracking-[0.18em] ${sizing}`}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={[
            'inline-block size-2 rounded-[2px] bg-current',
            // Glow intensity tuned to the prompt.
            status === 'ok' ? 'shadow-[0_0_5px_1px_currentColor]' : 'shadow-[0_0_6px_1px_currentColor]',
            status === 'critical' ? 'animate-[led-pulse_1.4s_ease-in-out_infinite]' : '',
          ].join(' ')}
        />
      ) : null}
      {text}
    </span>
  )
}

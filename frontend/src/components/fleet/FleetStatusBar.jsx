import { STATUS_LABEL } from '../../utils/thresholds.js'

const ORDER = ['ok', 'warning', 'critical', 'down']

const PILL_TONE = {
  ok: 'bg-status-ok/15 text-status-ok ring-status-ok/30',
  warning: 'bg-status-warning/15 text-status-warning ring-status-warning/30',
  critical: 'bg-status-critical/20 text-status-critical ring-status-critical/40',
  down: 'bg-status-unknown/20 text-status-unknown ring-status-unknown/30',
}

const DOT_TONE = {
  ok: 'bg-status-ok',
  warning: 'bg-status-warning',
  critical: 'bg-status-critical',
  down: 'bg-status-unknown',
}

export default function FleetStatusBar({ counts, total }) {
  return (
    <div
      role="region"
      aria-label="Riepilogo stato flotta"
      className="flex flex-wrap items-center gap-2 rounded-lg border border-bg-border bg-bg-surface px-3 py-2"
    >
      {ORDER.map((key) => (
        <span
          key={key}
          className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 font-mono text-xs font-semibold ring-1 ${PILL_TONE[key]}`}
        >
          <span aria-hidden="true" className={`size-1.5 rounded-full ${DOT_TONE[key]}`} />
          {counts?.[key] ?? 0} {STATUS_LABEL[key]}
        </span>
      ))}
      <span className="ml-auto font-mono text-xs text-text-secondary">
        Totale: <span className="text-text-primary">{total}</span>
      </span>
    </div>
  )
}

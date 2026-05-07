import { memo } from 'react'

import AlertChip from '../ui/AlertChip.jsx'
import MetricBar from '../ui/MetricBar.jsx'
import StatusBadge from '../ui/StatusBadge.jsx'
import { formatPercent, formatRelative } from '../../utils/formatters.js'
import { CRITICAL_THRESHOLD, WARNING_THRESHOLD } from '../../utils/thresholds.js'

function metricCellTone(value) {
  const v = Number(value)
  if (!Number.isFinite(v)) return 'text-text-muted'
  if (v >= CRITICAL_THRESHOLD) return 'text-status-critical'
  if (v >= WARNING_THRESHOLD) return 'text-status-warning'
  return 'text-text-secondary'
}

const COLUMNS_GRID =
  'grid grid-cols-[minmax(160px,1.4fr)_minmax(110px,0.9fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(110px,0.9fr)_minmax(70px,0.5fr)_44px] items-center gap-3 px-4'

function FleetTableRow({ node, metric, status, alerts, onSelect, height = 40 }) {
  const cpu = metric?.cpu_percent
  const ram = metric?.memory_percent
  const disk = Array.isArray(metric?.disk_data)
    ? metric.disk_data.reduce((max, d) => Math.max(max, Number(d?.percent) || 0), 0)
    : null

  const isDown = status === 'down'
  const rowTone =
    status === 'critical'
      ? 'border-l-status-critical bg-status-critical/5'
      : status === 'warning'
        ? 'border-l-status-warning bg-status-warning/5'
        : status === 'down'
          ? 'border-l-status-unknown bg-status-unknown/5 opacity-60'
          : 'border-l-transparent'

  const criticalAlerts = alerts?.filter((a) => a.severity === 'critical' && !a.is_read).length || 0
  const warningAlerts = alerts?.filter((a) => a.severity === 'warning' && !a.is_read).length || 0
  const totalUnread = criticalAlerts + warningAlerts
  const alertSeverity = criticalAlerts > 0 ? 'critical' : 'warning'

  return (
    <button
      type="button"
      onClick={() => onSelect(node.id)}
      role="row"
      aria-label={`Apri dettaglio ${node.name}`}
      className={`${COLUMNS_GRID} group w-full cursor-pointer border-l-3 border-b border-bg-border text-left text-[13px] transition-colors duration-100 hover:bg-bg-elevated focus-visible:bg-bg-elevated ${rowTone}`}
      style={{ height }}
    >
      <div role="gridcell" className="min-w-0">
        <p
          className={`truncate font-sans text-sm font-semibold ${
            isDown ? 'text-text-muted' : 'text-text-primary'
          }`}
        >
          {node.name}
        </p>
        <p className="truncate text-[11px] text-text-muted">
          {node.host}
          {node.port ? `:${node.port}` : ''}
        </p>
      </div>

      <div role="gridcell">
        <StatusBadge status={status} size="sm" />
      </div>

      <div role="gridcell">
        <div className="flex items-center gap-2">
          <span className={`w-10 font-mono text-right text-xs font-semibold ${metricCellTone(cpu)}`}>
            {formatPercent(cpu, 0)}
          </span>
          <div className="flex-1">
            <MetricBar value={cpu} ariaLabel={`CPU ${node.name}`} />
          </div>
        </div>
      </div>

      <div role="gridcell">
        <div className="flex items-center gap-2">
          <span className={`w-10 font-mono text-right text-xs font-semibold ${metricCellTone(ram)}`}>
            {formatPercent(ram, 0)}
          </span>
          <div className="flex-1">
            <MetricBar value={ram} ariaLabel={`RAM ${node.name}`} />
          </div>
        </div>
      </div>

      <div role="gridcell">
        <div className="flex items-center gap-2">
          <span className={`w-10 font-mono text-right text-xs font-semibold ${metricCellTone(disk)}`}>
            {formatPercent(disk, 0)}
          </span>
          <div className="flex-1">
            <MetricBar value={disk} ariaLabel={`Disk ${node.name}`} />
          </div>
        </div>
      </div>

      <div role="gridcell" className="font-mono text-xs text-text-secondary">
        {node.last_seen ? formatRelative(node.last_seen) : '—'}
      </div>

      <div role="gridcell">
        <AlertChip count={totalUnread} severity={alertSeverity} />
      </div>

      <div role="gridcell" className="flex items-center justify-end">
        <span
          aria-hidden="true"
          className="font-mono text-xl leading-none text-text-muted transition-colors duration-80 group-hover:text-accent"
        >
          ›
        </span>
      </div>
    </button>
  )
}

export const FLEET_TABLE_COLUMNS_GRID = COLUMNS_GRID

export default memo(FleetTableRow)

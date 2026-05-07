import { memo } from 'react'
import { BarChart3, Bell, List, MoreHorizontal } from 'lucide-react'

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
  'grid grid-cols-[minmax(190px,1.3fr)_minmax(90px,0.6fr)_minmax(140px,1fr)_minmax(130px,0.9fr)_minmax(130px,0.9fr)_minmax(130px,0.9fr)_minmax(90px,0.6fr)_minmax(90px,0.7fr)_minmax(120px,0.9fr)_minmax(130px,1fr)] items-center gap-3 px-4'

function FleetTableRow({ node, metric, status, alerts, onSelect, height = 52 }) {
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
          ? 'border-l-status-unknown opacity-60'
          : 'border-l-transparent'

  const criticalAlerts = alerts?.filter((a) => a.severity === 'critical').length || 0
  const warningAlerts = alerts?.filter((a) => a.severity === 'warning').length || 0
  const unknownAlerts =
    alerts?.filter((a) => !['critical', 'warning'].includes(String(a.severity))).length || 0
  const totalUnread = criticalAlerts + warningAlerts
  const alertSeverity = criticalAlerts > 0 ? 'critical' : 'warning'
  const services = {
    ok: [cpu, ram, disk].filter((v) => Number(v) < WARNING_THRESHOLD).length,
    warning: [cpu, ram, disk].filter(
      (v) => Number(v) >= WARNING_THRESHOLD && Number(v) < CRITICAL_THRESHOLD,
    ).length,
    critical: [cpu, ram, disk].filter((v) => Number(v) >= CRITICAL_THRESHOLD).length,
    unknown: [cpu, ram, disk].filter((v) => !Number.isFinite(Number(v))).length,
  }

  return (
    <div
      role="row"
      className={`${COLUMNS_GRID} group w-full border-l-4 border-b border-bg-border/60 text-left transition hover:bg-bg-elevated ${rowTone}`}
      style={{ height }}
    >
      <div role="gridcell" className="min-w-0">
        <p
          className={`truncate font-mono text-sm font-semibold ${
            isDown ? 'italic text-text-muted' : 'text-text-primary'
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

      <div role="gridcell" className="font-mono text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-status-ok" />
            <span>{services.ok}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-status-warning" />
            <span>{services.warning}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-status-critical" />
            <span>{services.critical}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-status-unknown" />
            <span>{services.unknown}</span>
          </div>
        </div>
      </div>

      <div role="gridcell">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <MetricBar value={cpu} ariaLabel={`CPU ${node.name}`} />
          </div>
          <span className={`w-10 text-right font-mono text-xs ${metricCellTone(cpu)}`}>{formatPercent(cpu, 0)}</span>
        </div>
      </div>

      <div role="gridcell">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <MetricBar value={ram} ariaLabel={`Memory ${node.name}`} />
          </div>
          <span className={`w-10 text-right font-mono text-xs ${metricCellTone(ram)}`}>{formatPercent(ram, 0)}</span>
        </div>
      </div>

      <div role="gridcell">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <MetricBar value={disk} ariaLabel={`Disk ${node.name}`} />
          </div>
          <span className={`w-10 text-right font-mono text-xs ${metricCellTone(disk)}`}>{formatPercent(disk, 0)}</span>
        </div>
      </div>

      <div role="gridcell" className="font-mono text-xs text-text-secondary">
        {node.last_seen ? formatRelative(node.last_seen) : '—'}
      </div>

      <div role="gridcell">
        <AlertChip count={totalUnread + unknownAlerts} severity={alertSeverity} />
      </div>

      <div role="gridcell" className="flex items-center justify-end gap-1 text-text-muted">
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className="rounded p-1 hover:bg-bg-base hover:text-text-primary"
          aria-label={`Open charts for ${node.name}`}
        >
          <BarChart3 className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className="rounded p-1 hover:bg-bg-base hover:text-text-primary"
          aria-label={`Open list for ${node.name}`}
        >
          <List className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className="rounded p-1 hover:bg-bg-base hover:text-text-primary"
          aria-label={`Open alerts for ${node.name}`}
        >
          <Bell className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className="rounded p-1 hover:bg-bg-base hover:text-text-primary"
          aria-label={`Open menu for ${node.name}`}
        >
          <MoreHorizontal className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

export const FLEET_TABLE_COLUMNS_GRID = COLUMNS_GRID

export default memo(FleetTableRow)

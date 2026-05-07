import MetricBar from '../ui/MetricBar.jsx'
import StatusBadge from '../ui/StatusBadge.jsx'
import { formatGB, formatPercent } from '../../utils/formatters.js'
import { statusFromValue } from '../../utils/thresholds.js'

export default function DiskTable({ disks = [] }) {
  if (!Array.isArray(disks) || disks.length === 0) {
    return (
      <section className="rounded-lg border border-bg-border bg-bg-surface p-4">
        <h3 className="mb-2 font-mono text-sm font-semibold text-text-primary">Disk usage</h3>
        <p className="text-sm text-text-secondary">Nessun mount point disponibile.</p>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-bg-border bg-bg-surface">
      <h3 className="border-b border-bg-border px-4 py-3 font-mono text-sm font-semibold text-text-primary">
        Disk usage per mount point
      </h3>
      <div role="table" className="text-sm">
        <div
          role="row"
          className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_1.2fr_0.6fr] border-b border-bg-border bg-bg-elevated px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-text-muted"
        >
          <div role="columnheader">Mount</div>
          <div role="columnheader">Total</div>
          <div role="columnheader">Used</div>
          <div role="columnheader">Free</div>
          <div role="columnheader">%</div>
          <div role="columnheader" className="text-right">Status</div>
        </div>

        {disks.map((disk, idx) => {
          const percent = Number(disk?.percent) || 0
          const status = statusFromValue(percent)
          return (
            <div
              role="row"
              key={disk.mountpoint || disk.device || `disk-${idx}`}
              className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_1.2fr_0.6fr] items-center border-b border-bg-border/40 px-4 py-2 font-mono text-xs"
            >
              <div role="cell" className="truncate text-text-primary">{disk.mountpoint || '—'}</div>
              <div role="cell" className="text-text-secondary">{formatGB(disk.total_gb, 0)}</div>
              <div role="cell" className="text-text-secondary">{formatGB(disk.used_gb, 0)}</div>
              <div role="cell" className="text-text-secondary">{formatGB(disk.free_gb, 0)}</div>
              <div role="cell" className="flex items-center gap-2">
                <span className="w-12">{formatPercent(percent, 0)}</span>
                <div className="flex-1">
                  <MetricBar value={percent} ariaLabel={`Disk ${disk.mountpoint}`} />
                </div>
              </div>
              <div role="cell" className="flex justify-end">
                <StatusBadge status={status} size="sm" dot={false} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

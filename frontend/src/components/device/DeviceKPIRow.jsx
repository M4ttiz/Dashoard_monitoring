import {
  formatGB,
  formatPercent,
  formatRelative,
} from '../../utils/formatters.js'
import { statusFromValue } from '../../utils/thresholds.js'

const CARD_TONE = {
  ok: 'border-l-status-ok bg-bg-surface',
  warning: 'border-l-status-warning bg-bg-surface',
  critical: 'border-l-status-critical bg-status-critical/4',
  unknown: 'border-l-bg-border bg-bg-surface',
}

function TrendIcon({ delta }) {
  if (delta == null || !Number.isFinite(delta)) {
    return (
      <span className="font-mono text-[10px] text-text-muted" aria-hidden="true">
        ─
      </span>
    )
  }
  if (delta > 0.5)
    return (
      <span className="font-mono text-[10px] text-status-warning" aria-hidden="true">
        ▲
      </span>
    )
  if (delta < -0.5)
    return (
      <span className="font-mono text-[10px] text-status-ok" aria-hidden="true">
        ▼
      </span>
    )

  return (
    <span className="font-mono text-[10px] text-text-muted" aria-hidden="true">
      ─
    </span>
  )
}

function KPICard({ label, value, sub, status = 'ok', trendDelta }) {
  const tone = CARD_TONE[status] || CARD_TONE.unknown
  return (
    <div className={`rounded-[4px] border border-bg-border border-l-4 p-4 ${tone}`}>
      <p className="font-sans text-[10px] uppercase tracking-wider text-text-muted">{label}</p>
      <p className="mt-1 font-mono text-3xl font-bold text-text-data">{value}</p>
      <div className="mt-2 flex items-center gap-2 font-sans text-[11px] text-text-secondary">
        <TrendIcon delta={trendDelta} />
        <span>{sub}</span>
      </div>
    </div>
  )
}

export default function DeviceKPIRow({ current, previous, lastSeen }) {
  const cpu = current?.cpu_percent
  const ram = current?.memory_percent
  const memUsed = current?.memory_used_gb
  const memTotal = current?.memory_total_gb
  const diskMax = Array.isArray(current?.disk_data)
    ? current.disk_data.reduce((max, d) => Math.max(max, Number(d?.percent) || 0), 0)
    : null
  const rootDisk = Array.isArray(current?.disk_data)
    ? current.disk_data.find((d) => d.mountpoint === '/' || d.mountpoint === 'C:\\')
    : null

  const cpuDelta = previous?.cpu_percent != null && cpu != null
    ? cpu - previous.cpu_percent
    : null

  const ramDelta = previous?.memory_percent != null && ram != null
    ? ram - previous.memory_percent
    : null

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KPICard
        label="CPU"
        value={formatPercent(cpu, 1)}
        sub={cpuDelta != null ? `${cpuDelta > 0 ? '+' : ''}${cpuDelta.toFixed(1)}% vs precedente` : 'Stabile'}
        status={statusFromValue(cpu)}
        trendDelta={cpuDelta}
      />
      <KPICard
        label="RAM"
        value={
          memTotal != null
            ? `${formatGB(memUsed)} / ${formatGB(memTotal, 0)}`
            : formatPercent(ram, 1)
        }
        sub={ram != null ? `${formatPercent(ram, 0)} usata` : '—'}
        status={statusFromValue(ram)}
        trendDelta={ramDelta}
      />
      <KPICard
        label="Disk (max)"
        value={formatPercent(diskMax, 0)}
        sub={rootDisk ? `${rootDisk.mountpoint}: ${formatGB(rootDisk.free_gb)} liberi` : '—'}
        status={statusFromValue(diskMax)}
      />
      <KPICard
        label="Last update"
        value={lastSeen ? formatRelative(lastSeen) : '—'}
        sub={lastSeen ? 'metriche fresche' : 'nessun dato'}
        status="ok"
      />
    </div>
  )
}

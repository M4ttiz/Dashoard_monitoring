import MetricBar from '../components/ui/MetricBar.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'

const DISK_FORECAST = [
  { host: 'toolticket', used: 412, total: 512, percent: 80, fullIn: '26 days' },
  { host: 'PC_DI_ANDREA', used: 452, total: 512, percent: 88, fullIn: '12 days' },
  { host: 'pasqui_pc', used: 470, total: 512, percent: 92, fullIn: '6 days' },
]

const TOP_CPU = [
  { host: 'PC_DI_ANDREA', value: 89 },
  { host: 'toolticket', value: 77 },
  { host: 'pasqui_pc', value: 69 },
  { host: 'LAB_HOST_01', value: 64 },
  { host: 'EDGE_NODE_03', value: 58 },
]

const TOP_RAM = [
  { host: 'pasqui_pc', value: 85 },
  { host: 'PC_DI_ANDREA', value: 79 },
  { host: 'toolticket', value: 72 },
  { host: 'FINANCE_WS_09', value: 66 },
  { host: 'SALES_WS_04', value: 61 },
]

const WEEKLY_SUMMARY = [
  { label: 'Total alerts', current: 86, previous: 102, unit: '' },
  { label: 'Average CPU', current: 68, previous: 63, unit: '%' },
  { label: 'Average RAM', current: 74, previous: 70, unit: '%' },
]

function heatColor(value) {
  if (value < 25) return 'bg-status-ok/30'
  if (value < 50) return 'bg-status-ok/55'
  if (value < 70) return 'bg-status-warning/60'
  return 'bg-status-critical/60'
}

const HEATMAP = Array.from({ length: 7 }).map((_, dayIndex) =>
  Array.from({ length: 24 }).map((__, hour) => {
    const base = hour >= 8 && hour <= 18 ? 45 : 20
    const extra = dayIndex === 0 || dayIndex === 4 ? 15 : 0
    return Math.min(100, base + extra + ((hour * 7 + dayIndex * 11) % 35))
  })
)

export default function TrendsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Trends</h1>
        <p className="mt-1 text-sm text-text-secondary">Predictive analysis and usage patterns</p>
      </div>

      <section className="space-y-3 rounded-[4px] border border-bg-border bg-bg-surface p-4">
        <h2 className="text-sm font-semibold text-text-primary">Disk Space Forecast</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-xs uppercase text-text-muted">
              <tr>
                <th className="px-3 py-2 text-left">Host</th>
                <th className="px-3 py-2 text-left">Used</th>
                <th className="px-3 py-2 text-left">Total</th>
                <th className="px-3 py-2 text-left">% Used</th>
                <th className="px-3 py-2 text-left">Estimated Full In</th>
              </tr>
            </thead>
            <tbody>
              {DISK_FORECAST.map((row) => (
                <tr key={row.host} className="border-t border-bg-border">
                  <td className="px-3 py-2 text-text-primary">{row.host}</td>
                  <td className="px-3 py-2 text-text-secondary">{row.used} GB</td>
                  <td className="px-3 py-2 text-text-secondary">{row.total} GB</td>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      <MetricBar value={row.percent} max={100} height={10} ariaLabel={`${row.host} disk usage`} />
                      <span className="font-mono text-xs text-text-secondary">{row.percent}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {row.total - row.used < row.total * 0.1 ? (
                      <StatusBadge status="critical" label={row.fullIn} size="sm" />
                    ) : (
                      <span className="text-text-secondary">{row.fullIn}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[4px] border border-bg-border bg-bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold text-text-primary">Top Resource Consumers (CPU)</h2>
          <ol className="space-y-2">
            {TOP_CPU.map((row) => (
              <li key={row.host}>
                <div className="mb-1 flex justify-between text-xs text-text-secondary">
                  <span>{row.host}</span>
                  <span>{row.value}%</span>
                </div>
                <MetricBar value={row.value} max={100} ariaLabel={`${row.host} cpu`} />
              </li>
            ))}
          </ol>
        </article>
        <article className="rounded-[4px] border border-bg-border bg-bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold text-text-primary">Top Resource Consumers (RAM)</h2>
          <ol className="space-y-2">
            {TOP_RAM.map((row) => (
              <li key={row.host}>
                <div className="mb-1 flex justify-between text-xs text-text-secondary">
                  <span>{row.host}</span>
                  <span>{row.value}%</span>
                </div>
                <MetricBar value={row.value} max={100} ariaLabel={`${row.host} ram`} />
              </li>
            ))}
          </ol>
        </article>
      </section>

      <section className="rounded-[4px] border border-bg-border bg-bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold text-text-primary">Incident Heatmap</h2>
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
          {HEATMAP.flatMap((dayRow, dayIndex) =>
            dayRow.map((value, hour) => (
              <div
                key={`${dayIndex}-${hour}`}
                title={`Day ${dayIndex + 1}, Hour ${hour}: ${value}`}
                className={`h-4 rounded-[2px] ${heatColor(value)}`}
              />
            ))
          )}
        </div>
      </section>

      <section className="rounded-[4px] border border-bg-border bg-bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold text-text-primary">Weekly Summary</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {WEEKLY_SUMMARY.map((item) => (
            <article key={item.label} className="rounded-[4px] border border-bg-border bg-bg-elevated p-3">
              <p className="text-xs text-text-muted">{item.label}</p>
              <p className="mt-1 text-sm text-text-primary">
                This week: <span className="font-mono">{item.current}{item.unit}</span>
              </p>
              <p className="text-sm text-text-secondary">
                Last week: <span className="font-mono">{item.previous}{item.unit}</span>
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'

import Spinner from '../components/ui/Spinner.jsx'
import { formatTimestamp } from '../utils/formatters.js'

function getUsageColor(value) {
  if (value > 90) return 'var(--color-status-critical)'
  if (value >= 70) return 'var(--color-status-warning)'
  return 'var(--color-status-ok)'
}

function trendBadge(value) {
  if (value > 85) return { label: 'Critical', className: 'text-status-critical border-status-critical/50 bg-status-critical/10' }
  if (value > 70) return { label: 'Warning', className: 'text-status-warning border-status-warning/50 bg-status-warning/10' }
  return { label: 'OK', className: 'text-status-ok border-status-ok/50 bg-status-ok/10' }
}

export default function TrendsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/nodes')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((nodesRaw) => {
        const nodes = Array.isArray(nodesRaw) ? nodesRaw : []
        return Promise.all([
          Promise.resolve(nodes),
          fetch('/api/alerts').then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
          Promise.all(
            nodes.map((node) =>
              Promise.all([
                fetch(`/api/metrics/${node.id}?range=24h`).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
                fetch(`/api/metrics/${node.id}/current`).then((r) => (r.status === 404 ? null : r.ok ? r.json() : Promise.reject(r.status))),
              ]).then(([history, current]) => ({ nodeId: node.id, history, current })),
            ),
          ),
        ])
      })
      .then(([nodes, alertsRaw, metricsBundle]) => {
        setData({
          nodes,
          alerts: Array.isArray(alertsRaw) ? alertsRaw : [],
          metricsBundle,
        })
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (error) return <p className="text-red-400">Errore: {error}</p>

  const nodes = data?.nodes || []
  const alerts = data?.alerts || []
  const metricsBundle = data?.metricsBundle || []

  const currentRows = useMemo(
    () =>
      nodes.map((node) => {
        const metrics = metricsBundle.find((item) => item.nodeId === node.id)
        const current = metrics?.current
        const disks = Array.isArray(current?.disk_data) ? current.disk_data : []
        const diskUsed = disks.reduce((max, disk) => Math.max(max, Number(disk?.percent) || 0), 0)
        const diskTotal = disks.length > 0 ? disks.length * 100 : 0
        return {
          id: node.id,
          name: node.name || node.id,
          cpu: Number(current?.cpu_percent) || 0,
          ram: Number(current?.memory_percent) || 0,
          diskUsed,
          diskTotal,
          diskPercent: diskUsed,
        }
      }),
    [metricsBundle, nodes],
  )

  const topCpu = [...currentRows].sort((a, b) => b.cpu - a.cpu).slice(0, 5)
  const topRam = [...currentRows].sort((a, b) => b.ram - a.ram).slice(0, 5)

  const alertByHost = useMemo(() => {
    const map = new Map()
    alerts.forEach((alert) => {
      const id = alert.node_id || 'unknown'
      const existing = map.get(id) || { nodeId: id, total: 0, last: null }
      existing.total += 1
      const ts = alert.created_at || alert.timestamp || alert.time
      if (!existing.last || new Date(ts).getTime() > new Date(existing.last).getTime()) {
        existing.last = ts
      }
      map.set(id, existing)
    })
    return Array.from(map.values())
      .map((row) => {
        const node = nodes.find((n) => n.id === row.nodeId)
        return { ...row, name: node?.name || row.nodeId }
      })
      .sort((a, b) => b.total - a.total)
  }, [alerts, nodes])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Trends</h1>
        <p className="mt-1 text-sm text-text-secondary">Usage patterns and capacity forecasting</p>
      </div>

      <section className="space-y-3 rounded-[4px] border border-bg-border bg-bg-surface p-4">
        <h2 className="text-sm font-semibold text-text-primary">Disk Capacity Forecast</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="bg-bg-elevated text-xs uppercase text-text-muted">
              <tr>
                <th className="px-3 py-2 text-left">Host</th>
                <th className="px-3 py-2 text-left">Disk Used</th>
                <th className="px-3 py-2 text-left hidden md:table-cell">Disk Total</th>
                <th className="px-3 py-2 text-left">% Used</th>
                <th className="px-3 py-2 text-left">Trend</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row) => {
                const trend = trendBadge(row.diskPercent)
                return (
                  <tr key={row.id} className="border-t border-bg-border">
                    <td className="px-3 py-2 text-text-primary">{row.name}</td>
                    <td className="px-3 py-2 text-text-secondary">{row.diskUsed.toFixed(1)}%</td>
                    <td className="px-3 py-2 text-text-secondary hidden md:table-cell">{row.diskTotal.toFixed(1)}%</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded bg-bg-border">
                          <div
                            className="h-full"
                            style={{
                              width: `${Math.min(100, row.diskPercent)}%`,
                              backgroundColor: getUsageColor(row.diskPercent),
                            }}
                          />
                        </div>
                        <span className="font-mono text-xs text-text-primary">{row.diskPercent.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-[4px] border px-2 py-0.5 text-xs ${trend.className}`}>{trend.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="space-y-3 rounded-[4px] border border-bg-border bg-bg-surface p-4">
          <h2 className="text-sm font-semibold text-text-primary">Top CPU Consumers</h2>
          <div className="space-y-2">
            {topCpu.map((row) => (
              <div key={`cpu-${row.id}`} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">{row.name}</span>
                  <span className="font-mono text-text-primary">{row.cpu.toFixed(1)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded bg-bg-border">
                  <div className="h-full bg-status-critical" style={{ width: `${Math.min(100, row.cpu)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3 rounded-[4px] border border-bg-border bg-bg-surface p-4">
          <h2 className="text-sm font-semibold text-text-primary">Top RAM Consumers</h2>
          <div className="space-y-2">
            {topRam.map((row) => (
              <div key={`ram-${row.id}`} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">{row.name}</span>
                  <span className="font-mono text-text-primary">{row.ram.toFixed(1)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded bg-bg-border">
                  <div className="h-full bg-status-warning" style={{ width: `${Math.min(100, row.ram)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="space-y-3 rounded-[4px] border border-bg-border bg-bg-surface p-4">
        <h2 className="text-sm font-semibold text-text-primary">Alert Frequency</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="bg-bg-elevated text-xs uppercase text-text-muted">
              <tr>
                <th className="px-3 py-2 text-left">Host</th>
                <th className="px-3 py-2 text-left">Total Alerts</th>
                <th className="px-3 py-2 text-left">Last Alert</th>
              </tr>
            </thead>
            <tbody>
              {alertByHost.map((row) => (
                <tr key={`alert-host-${row.nodeId}`} className="border-t border-bg-border">
                  <td className="px-3 py-2 text-text-primary">{row.name}</td>
                  <td className="px-3 py-2 font-mono text-text-secondary">{row.total}</td>
                  <td className="px-3 py-2 text-text-secondary">{formatTimestamp(row.last, { full: true })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

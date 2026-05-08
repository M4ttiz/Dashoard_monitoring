import { useEffect, useMemo, useState } from 'react'

import Spinner from '../components/ui/Spinner.jsx'
import { formatTimestamp, formatUptime } from '../utils/formatters.js'

function normalizeStatus(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'up' || value === 'ok') return 'ok'
  if (value === 'warning') return 'warning'
  if (value === 'down' || value === 'critical') return 'critical'
  return 'unknown'
}

function severityClass(severity) {
  const value = String(severity || '').toLowerCase()
  if (value === 'critical') return 'text-status-critical border-status-critical/50 bg-status-critical/10'
  if (value === 'warning') return 'text-status-warning border-status-warning/50 bg-status-warning/10'
  return 'text-status-info border-status-info/50 bg-status-info/10'
}

export default function ReportsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/nodes').then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
      fetch('/api/alerts').then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
    ])
      .then(([nodesRaw, alertsRaw]) => {
        const nodes = Array.isArray(nodesRaw) ? nodesRaw : []
        const alerts = Array.isArray(alertsRaw) ? alertsRaw : []
        return Promise.all(
          nodes.map((node) =>
            fetch(`/api/metrics/${node.id}/current`)
              .then((r) => (r.status === 404 ? null : r.ok ? r.json() : Promise.reject(r.status)))
              .then((current) => ({ node, current })),
          ),
        ).then((rows) => ({ nodes, alerts, rows }))
      })
      .then((payload) => setData(payload))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  const handleExportCsv = () => {
    const headers = ['Host', 'Status', 'CPU%', 'RAM%', 'Disk%', 'Alerts', 'Uptime']
    const rows = (data?.rows || []).map(({ node, current }) => {
      const hostAlerts = (data?.alerts || []).filter((a) => a.node_id === node.id).length
      const disks = Array.isArray(current?.disk_data) ? current.disk_data : []
      const diskPercent = disks.reduce((max, disk) => Math.max(max, Number(disk?.percent) || 0), 0)
      return [
        node.name || node.id,
        node.status || 'unknown',
        (Number(current?.cpu_percent) || 0).toFixed(1),
        (Number(current?.memory_percent) || 0).toFixed(1),
        diskPercent.toFixed(1),
        hostAlerts,
        formatUptime(current?.uptime_seconds ?? node?.uptime_seconds),
      ]
    })
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <Spinner />
  if (error) return <p className="text-red-400">Errore: {error}</p>

  const nodes = data?.nodes || []
  const alerts = data?.alerts || []
  const rows = data?.rows || []
  const online = nodes.filter((n) => normalizeStatus(n.status) === 'ok').length
  const offline = nodes.filter((n) => normalizeStatus(n.status) === 'critical').length
  const unreadAlerts = alerts.filter((a) => !a.is_read).length
  const latestAlerts = [...alerts]
    .sort((a, b) => new Date(b.created_at || b.timestamp || 0).getTime() - new Date(a.created_at || a.timestamp || 0).getTime())
    .slice(0, 10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Reports</h1>
        <p className="mt-1 text-sm text-text-secondary">Summary of fleet health and activity</p>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Hosts', value: nodes.length },
          { label: 'Online', value: online },
          { label: 'Offline', value: offline },
          { label: 'Total Alerts (unread)', value: unreadAlerts },
        ].map((item) => (
          <div key={item.label} className="rounded-[4px] border border-bg-border bg-bg-surface p-4">
            <p className="text-xs uppercase tracking-wide text-text-muted">{item.label}</p>
            <p className="mt-2 font-mono text-2xl font-semibold text-text-primary">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="space-y-3 rounded-[4px] border border-bg-border bg-bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-text-primary">Host Health Table</h2>
          <button
            type="button"
            onClick={handleExportCsv}
            className="rounded-[4px] border border-accent/40 bg-accent/15 px-3 py-2 text-xs font-semibold text-accent"
          >
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="bg-bg-elevated text-xs uppercase text-text-muted">
              <tr>
                <th className="px-3 py-2 text-left">Host</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">CPU%</th>
                <th className="px-3 py-2 text-left">RAM%</th>
                <th className="px-3 py-2 text-left hidden md:table-cell">Disk%</th>
                <th className="px-3 py-2 text-left">Alerts</th>
                <th className="px-3 py-2 text-left hidden md:table-cell">Uptime</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ node, current }) => {
                const status = normalizeStatus(node.status)
                const hostAlerts = alerts.filter((a) => a.node_id === node.id).length
                const disks = Array.isArray(current?.disk_data) ? current.disk_data : []
                const diskPercent = disks.reduce((max, disk) => Math.max(max, Number(disk?.percent) || 0), 0)
                return (
                  <tr
                    key={node.id}
                    className={`border-t border-bg-border ${
                      status === 'critical'
                        ? 'bg-status-critical/5'
                        : status === 'warning'
                          ? 'bg-status-warning/5'
                          : ''
                    }`}
                  >
                    <td className="px-3 py-2 text-text-primary">{node.name || node.id}</td>
                    <td className="px-3 py-2 text-text-secondary">{node.status || 'unknown'}</td>
                    <td className="px-3 py-2 font-mono text-text-secondary">{(Number(current?.cpu_percent) || 0).toFixed(1)}</td>
                    <td className="px-3 py-2 font-mono text-text-secondary">{(Number(current?.memory_percent) || 0).toFixed(1)}</td>
                    <td className="px-3 py-2 font-mono text-text-secondary hidden md:table-cell">{diskPercent.toFixed(1)}</td>
                    <td className="px-3 py-2 font-mono text-text-secondary">{hostAlerts}</td>
                    <td className="px-3 py-2 text-text-secondary hidden md:table-cell">
                      {formatUptime(current?.uptime_seconds ?? node?.uptime_seconds)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 rounded-[4px] border border-bg-border bg-bg-surface p-4">
        <h2 className="text-sm font-semibold text-text-primary">Recent Alerts</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="bg-bg-elevated text-xs uppercase text-text-muted">
              <tr>
                <th className="px-3 py-2 text-left">Time</th>
                <th className="px-3 py-2 text-left">Host</th>
                <th className="px-3 py-2 text-left">Message</th>
                <th className="px-3 py-2 text-left">Severity</th>
              </tr>
            </thead>
            <tbody>
              {latestAlerts.map((alert) => {
                const node = nodes.find((n) => n.id === alert.node_id)
                return (
                  <tr key={alert.id} className="border-t border-bg-border">
                    <td className="px-3 py-2 text-text-secondary">{formatTimestamp(alert.created_at || alert.timestamp, { full: true })}</td>
                    <td className="px-3 py-2 text-text-primary">{node?.name || alert.node_id || '—'}</td>
                    <td className="px-3 py-2 text-text-secondary">{alert.message || alert.metric || '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-[4px] border px-2 py-0.5 text-xs ${severityClass(alert.severity)}`}>
                        {alert.severity || 'info'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

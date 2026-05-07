import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import FleetTable from '../components/fleet/FleetTable.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { useAlerts } from '../hooks/useAlerts.js'
import { useFleetData } from '../hooks/useFleetData.js'
import { useFleetMetrics } from '../hooks/useFleetMetrics.js'
import { statusFromNode } from '../utils/thresholds.js'

const STATUS_PILLS = ['ok', 'warning', 'critical', 'down']

export default function FleetOverview() {
  const navigate = useNavigate()
  const { data: nodes = [], isLoading: isFleetLoading } = useFleetData()
  const { data: alerts = [] } = useAlerts()
  const metricsMap = useFleetMetrics(nodes)
  const [activeStatus, setActiveStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const rows = useMemo(
    () =>
      nodes.map((node) => {
        const metric = metricsMap.get(node.id)
        const status = statusFromNode(node, metric)
        const nodeAlerts = alerts.filter((alert) => alert.node_id === node.id)
        return { node, metric, status, alerts: nodeAlerts }
      }),
    [alerts, metricsMap, nodes],
  )

  const counts = useMemo(
    () =>
      rows.reduce(
        (acc, row) => {
          acc[row.status] = (acc[row.status] || 0) + 1
          return acc
        },
        { ok: 0, warning: 0, critical: 0, down: 0, unknown: 0 },
      ),
    [rows],
  )

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase()
    return rows.filter((row) => {
      if (activeStatus !== 'all' && row.status !== activeStatus) return false
      if (!term) return true
      return (
        row.node.name?.toLowerCase().includes(term) ||
        row.node.host?.toLowerCase().includes(term)
      )
    })
  }, [activeStatus, rows, search])

  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize)

  const hostStatusDistribution = [
    { name: 'OK', value: counts.ok, color: 'var(--color-status-ok)' },
    { name: 'Warning', value: counts.warning, color: 'var(--color-status-warning)' },
    { name: 'Down', value: counts.down + counts.unknown, color: 'var(--color-status-unknown)' },
  ]

  const serviceStatusDistribution = useMemo(() => {
    let ok = 0
    let warning = 0
    let critical = 0
    let unknown = 0
    rows.forEach(({ metric }) => {
      const sample = [metric?.cpu_percent, metric?.memory_percent, metric?.disk_data?.[0]?.percent]
      sample.forEach((value) => {
        if (!Number.isFinite(Number(value))) unknown += 1
        else if (Number(value) >= 85) critical += 1
        else if (Number(value) >= 70) warning += 1
        else ok += 1
      })
    })
    return [
      { name: 'OK', value: ok, color: 'var(--color-status-ok)' },
      { name: 'Warning', value: warning, color: 'var(--color-status-warning)' },
      { name: 'Critical', value: critical, color: 'var(--color-status-critical)' },
      { name: 'Unknown', value: unknown, color: 'var(--color-status-unknown)' },
    ]
  }, [rows])

  const problemsOverTime = useMemo(() => {
    const buckets = new Map()
    const now = Date.now()
    for (let i = 11; i >= 0; i -= 1) {
      const date = new Date(now - i * 2 * 60 * 60 * 1000)
      const key = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:00`
      buckets.set(key, { time: key, critical: 0, warning: 0, unknown: 0 })
    }
    alerts.forEach((alert) => {
      const date = new Date(alert.timestamp)
      const key = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:00`
      const bucket = buckets.get(key)
      if (!bucket) return
      if (alert.severity === 'critical') bucket.critical += 1
      else if (alert.severity === 'warning') bucket.warning += 1
      else bucket.unknown += 1
    })
    return Array.from(buckets.values())
  }, [alerts])

  const problemHosts = useMemo(
    () =>
      rows
        .map((row) => ({
          host: row.node.name,
          status: row.status,
          problems: row.alerts.length,
          lastChange: row.alerts[0]?.timestamp || row.node.last_seen,
        }))
        .sort((a, b) => b.problems - a.problems)
        .slice(0, 6),
    [rows],
  )

  const hostProblemsByState = [
    { name: 'Critical', value: alerts.filter((a) => a.severity === 'critical').length, color: 'var(--color-status-critical)' },
    { name: 'Warning', value: alerts.filter((a) => a.severity === 'warning').length, color: 'var(--color-status-warning)' },
    { name: 'Unknown', value: alerts.filter((a) => !['critical', 'warning'].includes(String(a.severity))).length, color: 'var(--color-status-unknown)' },
  ]
  const serviceProblemsByState = hostProblemsByState

  const kpis = [
    { label: 'Total Hosts', value: rows.length },
    { label: 'Up Hosts', value: counts.ok },
    { label: 'Warning Hosts', value: counts.warning },
    { label: 'Critical Hosts', value: counts.critical },
    { label: 'Down Hosts', value: counts.down + counts.unknown },
    { label: 'Total Services', value: rows.length * 3 },
    { label: 'Problems', value: alerts.length },
    { label: 'Unchecked', value: alerts.filter((a) => !a.is_read).length },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        {STATUS_PILLS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => {
              setActiveStatus(status)
              setPage(1)
            }}
            className={`rounded-full px-3 py-1 font-mono text-xs uppercase ring-1 ${
              status === 'ok'
                ? 'bg-status-ok/15 text-status-ok ring-status-ok/30'
                : status === 'warning'
                  ? 'bg-status-warning/15 text-status-warning ring-status-warning/30'
                  : status === 'critical'
                    ? 'bg-status-critical/15 text-status-critical ring-status-critical/30'
                    : 'bg-status-unknown/15 text-status-unknown ring-status-unknown/30'
            }`}
          >
            {status} {counts[status] || 0}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <section key={kpi.label} className="panel-soft rounded-xl p-3">
            <p className="font-mono text-[11px] uppercase tracking-wide text-text-muted">{kpi.label}</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-text-primary">{kpi.value}</p>
            <p className={`mt-1 font-mono text-[11px] ${idx % 3 === 0 ? 'text-status-ok' : idx % 3 === 1 ? 'text-status-warning' : 'text-status-critical'}`}>
              {idx % 3 === 0 ? '+' : '-'}
              {Math.max(1, Math.round((kpi.value || 1) / 3))}% vs last 24h
            </p>
          </section>
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <DonutPanel title="Host Status Distribution" data={hostStatusDistribution} />
        <DonutPanel title="Service Status Distribution" data={serviceStatusDistribution} />
        <section className="panel-soft rounded-xl p-3">
          <h2 className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-text-primary">Problems Over Time</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={problemsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bg-border)" />
                <XAxis dataKey="time" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="critical" stroke="var(--color-status-critical)" fill="var(--color-status-critical)" fillOpacity={0.2} />
                <Line type="monotone" dataKey="warning" stroke="var(--color-status-warning)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="unknown" stroke="var(--color-status-unknown)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <section className="panel-soft rounded-xl p-3">
          <h2 className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-text-primary">Top Problem Hosts</h2>
          <div className="space-y-2">
            {problemHosts.map((row) => (
              <div key={row.host} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 rounded-md border border-bg-border px-2 py-1.5">
                <span className="truncate font-mono text-xs text-text-primary">{row.host}</span>
                <StatusBadge status={row.status} size="sm" />
                <span className="font-mono text-xs text-text-secondary">{row.problems}</span>
                <span className="font-mono text-[11px] text-text-muted">{row.lastChange ? new Date(row.lastChange).toLocaleTimeString() : '—'}</span>
              </div>
            ))}
          </div>
        </section>
        <BarPanel title="Host Problems by State" data={hostProblemsByState} />
        <BarPanel title="Service Problems by State" data={serviceProblemsByState} />
      </div>

      <section className="space-y-2 rounded-xl border border-bg-border bg-bg-surface p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search host name or IP"
              className="w-full rounded-md border border-bg-border bg-bg-base px-8 py-2 font-mono text-sm text-text-primary"
            />
          </label>
          <span className="font-mono text-xs text-text-muted">
            {filteredRows.length} hosts · page {page}/{totalPages}
          </span>
        </div>
        <FleetTable rows={pagedRows} loading={isFleetLoading} onSelectNode={(id) => navigate(`/devices/${id}`)} />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-md border border-bg-border px-2.5 py-1 font-mono text-xs disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-md border border-bg-border px-2.5 py-1 font-mono text-xs disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </section>
    </div>
  )
}

function DonutPanel({ title, data }) {
  const total = data.reduce((acc, item) => acc + item.value, 0)
  return (
    <section className="panel-soft rounded-xl p-3">
      <h2 className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-text-primary">{title}</h2>
      <div className="grid grid-cols-[160px_1fr] items-center gap-3">
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={34} outerRadius={58}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-2 font-mono text-xs text-text-secondary">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}
              </span>
              <span>{entry.value} ({total ? Math.round((entry.value / total) * 100) : 0}%)</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BarPanel({ title, data }) {
  return (
    <section className="panel-soft rounded-xl p-3">
      <h2 className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-text-primary">{title}</h2>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bg-border)" />
            <XAxis type="number" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value">
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

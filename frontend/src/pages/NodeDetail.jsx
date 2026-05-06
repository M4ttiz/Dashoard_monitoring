import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card } from '../components/ui/Card.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { Gauge } from '../components/ui/Gauge.jsx'
import { useStore } from '../store/useDashboardStore.js'

const RANGE_OPTIONS = ['1h', '6h', '24h', '7d']

function formatTimeLabel(value) {
  const date = new Date(value)
  return date.toLocaleString()
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded border border-slate-700 bg-slate-900/95 p-2 text-xs text-slate-100 shadow-lg">
      <p className="mb-1 text-slate-300">{formatTimeLabel(label)}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {Number(entry.value).toFixed(1)}%
        </p>
      ))}
    </div>
  )
}

export default function NodeDetail() {
  const { id: nodeId } = useParams()
  const nodes = useStore((s) => s.nodes)
  const alerts = useStore((s) => s.alerts)
  const currentMetrics = useStore((s) => s.metrics)
  const fetchNodeHistory = useStore((s) => s.fetchNodeHistory)
  const historical = useStore((s) => s.historical)

  const [range, setRange] = useState('1h')
  const node = nodes.find((n) => n.id === nodeId)

  useEffect(() => {
    if (!nodeId) return
    void fetchNodeHistory(nodeId, range)
  }, [nodeId, range, fetchNodeHistory])

  const livePoint = currentMetrics[nodeId]
  const history = historical[nodeId] || []
  const mergedHistory = useMemo(() => {
    if (!livePoint?.timestamp) return history
    const last = history[history.length - 1]
    if (last && last.timestamp === livePoint.timestamp) {
      return [...history.slice(0, -1), livePoint]
    }
    return [...history, livePoint].slice(-200)
  }, [history, livePoint])

  const cpuAverage = useMemo(() => {
    if (mergedHistory.length === 0) return 0
    return (
      mergedHistory.reduce((acc, point) => acc + (point.cpu_percent || 0), 0) / mergedHistory.length
    )
  }, [mergedHistory])

  const diskChartData = useMemo(() => {
    return mergedHistory.map((point) => {
      const row = { timestamp: point.timestamp }
      if (Array.isArray(point.disk_data)) {
        point.disk_data.forEach((disk) => {
          const key = String(disk.mountpoint || 'unknown')
          row[key] = Number(disk.percent || 0)
        })
      }
      return row
    })
  }, [mergedHistory])

  const diskKeys = useMemo(() => {
    const set = new Set()
    diskChartData.forEach((row) => {
      Object.keys(row).forEach((k) => {
        if (k !== 'timestamp') set.add(k)
      })
    })
    return Array.from(set)
  }, [diskChartData])

  const nodeAlerts = alerts.filter((a) => a.node_id === nodeId).slice(0, 20)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/" className="text-sm text-sky-400 hover:text-sky-300">
            ← Back
          </Link>
          <h2 className="mt-1 text-2xl font-semibold text-slate-100">{node?.name || 'Node Detail'}</h2>
          <p className="text-sm text-slate-400">
            {node?.host || 'Unknown host'} · {node?.status === 'online' ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {RANGE_OPTIONS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRange(value)}
            className={`rounded px-3 py-1.5 text-sm ${
              range === value ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {mergedHistory.length === 0 ? <p className="text-sm text-slate-400">Caricamento dati...</p> : null}

      <section className="grid gap-3 md:grid-cols-3">
        <Card><Gauge label="CPU live" value={livePoint?.cpu_percent || 0} /></Card>
        <Card><Gauge label="RAM live" value={livePoint?.memory_percent || 0} /></Card>
        <Card><Gauge label="Disk live" value={Array.isArray(livePoint?.disk_data) ? Math.max(0, ...livePoint.disk_data.map((d) => Number(d.percent) || 0)) : 0} /></Card>
      </section>

      <section className="rounded-lg border border-slate-700 bg-slate-800 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-200">CPU Usage %</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mergedHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="timestamp" tickFormatter={formatTimeLabel} minTickGap={40} stroke="#94a3b8" />
              <YAxis domain={[0, 100]} stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="4 4" />
              <ReferenceLine y={cpuAverage} stroke="#38bdf8" strokeDasharray="6 6" />
              <Area type="monotone" dataKey="cpu_percent" name="CPU" stroke="#38bdf8" fill="#38bdf833" />
              <Brush dataKey="timestamp" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-lg border border-slate-700 bg-slate-800 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-200">Memory Usage %</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mergedHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="timestamp" tickFormatter={formatTimeLabel} minTickGap={40} stroke="#94a3b8" />
              <YAxis domain={[0, 100]} stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="memory_percent" name="Memory" stroke="#34d399" fill="#34d39933" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-lg border border-slate-700 bg-slate-800 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-200">Disk Usage per mountpoint</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={diskChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="timestamp" tickFormatter={formatTimeLabel} minTickGap={40} stroke="#94a3b8" />
              <YAxis domain={[0, 100]} stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="4 4" />
              {diskKeys.map((key, idx) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={key}
                  stroke={['#f59e0b', '#f43f5e', '#a78bfa', '#22d3ee'][idx % 4]}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-lg border border-slate-700 bg-slate-800 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-200">CPU/RAM confronto</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mergedHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="timestamp" tickFormatter={formatTimeLabel} minTickGap={40} stroke="#94a3b8" />
              <YAxis domain={[0, 100]} stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="cpu_percent" fill="#38bdf8" />
              <Bar dataKey="memory_percent" fill="#34d399" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-lg border border-slate-700 bg-slate-800 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-200">Alert History (ultimi 20)</h3>
        <div className="space-y-2 text-sm">
          {nodeAlerts.length === 0 ? (
            <p className="text-slate-400">Nessun alert per questo nodo.</p>
          ) : (
            nodeAlerts.map((alert) => (
              <div key={alert.id} className="rounded border border-slate-700 bg-slate-900/60 p-2 text-slate-200">
                <span className={alert.severity === 'critical' ? 'text-red-400' : 'text-yellow-300'}>
                  {alert.severity.toUpperCase()}
                </span>{' '}
                · {alert.message} · {new Date(alert.timestamp).toLocaleString()}
              </div>
            ))
          )}
        </div>
      </section>
      <section className="rounded-lg border border-slate-700 bg-slate-950 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-200">Timeline eventi</h3>
        {nodeAlerts.length === 0 ? (
          <EmptyState title="Nessun evento" message="Non ci sono eventi recenti per questo server." />
        ) : (
          <div className="space-y-2 text-xs text-slate-300">
            {nodeAlerts.map((alert) => (
              <div key={alert.id} className="rounded border border-slate-800 bg-slate-900 p-2">
                [{new Date(alert.timestamp).toLocaleTimeString()}] {alert.severity.toUpperCase()} - {alert.message}
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="rounded-lg border border-slate-700 bg-slate-900 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-200">Azioni</h3>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded bg-red-700 px-3 py-1.5 text-sm">Restart</button>
          <button type="button" className="rounded bg-sky-700 px-3 py-1.5 text-sm">Refresh agent</button>
          <button type="button" className="rounded bg-slate-700 px-3 py-1.5 text-sm">Export dati</button>
        </div>
      </section>
    </div>
  )
}


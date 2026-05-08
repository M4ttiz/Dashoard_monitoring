import { useEffect, useMemo, useState } from 'react'

import MetricChart from '../components/device/MetricChart.jsx'
import Spinner from '../components/ui/Spinner.jsx'

const RANGE_OPTIONS = ['1h', '6h', '24h', '7d']
const METRIC_OPTIONS = [
  { value: 'cpu_percent', label: 'CPU' },
  { value: 'memory_percent', label: 'RAM' },
  { value: 'disk_percent', label: 'Disk' },
]

function getMetricValue(point, metric) {
  if (metric === 'disk_percent') {
    if (!Array.isArray(point?.disk_data) || point.disk_data.length === 0) return null
    const vals = point.disk_data.map((d) => Number(d?.percent)).filter(Number.isFinite)
    if (vals.length === 0) return null
    return Math.max(...vals)
  }
  const value = Number(point?.[metric])
  return Number.isFinite(value) ? value : null
}

export default function MetricsPage() {
  const [nodes, setNodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedHost, setSelectedHost] = useState('')
  const [selectedMetric, setSelectedMetric] = useState('cpu_percent')
  const [selectedRange, setSelectedRange] = useState('1h')
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState(null)
  const [noRecentData, setNoRecentData] = useState(false)

  useEffect(() => {
    fetch('/api/nodes')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        setNodes(list)
        if (list.length > 0) setSelectedHost(list[0].id)
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedHost) return
    setHistoryLoading(true)
    setHistoryError(null)
    setNoRecentData(false)

    Promise.all([
      fetch(`/api/metrics/${selectedHost}?range=${encodeURIComponent(selectedRange)}`).then((r) =>
        r.ok ? r.json() : Promise.reject(r.status),
      ),
      fetch(`/api/metrics/${selectedHost}/current`).then((r) => {
        if (r.status === 404) return null
        if (!r.ok) return Promise.reject(r.status)
        return r.json()
      }),
    ])
      .then(([historyData, current]) => {
        setHistory(Array.isArray(historyData) ? historyData : [])
        setNoRecentData(current === null)
      })
      .catch((e) => setHistoryError(String(e)))
      .finally(() => setHistoryLoading(false))
  }, [selectedHost, selectedRange])

  const chartData = useMemo(() => {
    return history.map((point) => ({
      timestamp: point.timestamp,
      value: getMetricValue(point, selectedMetric),
    }))
  }, [history, selectedMetric])

  const kpis = useMemo(() => {
    const values = chartData.map((p) => Number(p.value)).filter(Number.isFinite)
    if (values.length === 0) return null
    const current = values[values.length - 1]
    const average = values.reduce((acc, v) => acc + v, 0) / values.length
    const peak = Math.max(...values)
    const minimum = Math.min(...values)
    return { current, average, peak, minimum }
  }, [chartData])

  if (loading) return <Spinner />
  if (error) return <p className="text-red-400">Errore: {error}</p>

  const selectedNode = nodes.find((node) => node.id === selectedHost)

  if (!selectedNode) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Metrics</h1>
          <p className="mt-1 text-sm text-text-secondary">Real-time and historical performance data</p>
        </div>
        <p className="text-sm text-text-secondary">Select a host to view metrics</p>
      </div>
    )
  }

  if (historyError) return <p className="text-red-400">Errore: {historyError}</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Metrics</h1>
        <p className="mt-1 text-sm text-text-secondary">Real-time and historical performance data</p>
      </div>

      {noRecentData ? (
        <div className="rounded-[4px] border border-status-warning/40 bg-status-warning/10 px-4 py-3 text-sm text-status-warning">
          No recent data for this host
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 rounded-[4px] border border-bg-border bg-bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm text-text-secondary">
          Select Host
          <select
            value={selectedHost}
            onChange={(e) => setSelectedHost(e.target.value)}
            className="w-full rounded-[4px] border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary"
          >
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.name || node.id}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-text-secondary">
          Metric
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="w-full rounded-[4px] border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary"
          >
            {METRIC_OPTIONS.map((metric) => (
              <option key={metric.value} value={metric.value}>
                {metric.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-text-secondary">
          Range
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="w-full rounded-[4px] border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary"
          >
            {RANGE_OPTIONS.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </label>
      </div>

      <MetricChart
        title={`${selectedNode.name || selectedNode.id} - ${METRIC_OPTIONS.find((m) => m.value === selectedMetric)?.label || 'Metric'} (%)`}
        data={chartData}
        dataKey="value"
        loading={historyLoading}
        height={300}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Current', value: kpis?.current },
          { label: 'Average', value: kpis?.average },
          { label: 'Peak', value: kpis?.peak },
          { label: 'Minimum', value: kpis?.minimum },
        ].map((item) => (
          <div key={item.label} className="rounded-[4px] border border-bg-border bg-bg-surface p-4">
            <p className="text-xs uppercase tracking-wide text-text-muted">{item.label}</p>
            <p className="mt-2 font-mono text-2xl font-semibold text-text-primary">
              {Number.isFinite(item.value) ? `${Number(item.value).toFixed(1)}%` : '—'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

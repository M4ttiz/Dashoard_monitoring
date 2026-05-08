import { useMemo, useState } from 'react'

import MetricChart from '../components/device/MetricChart.jsx'

const HOSTS = ['toolticket', 'PC_DI_ANDREA', 'pasqui_pc']
const METRICS = ['CPU', 'RAM', 'Disk', 'Network']
const RANGES = ['1h', '6h', '24h', '7d']

function buildSeries(host, metric) {
  const baseByMetric = { CPU: 58, RAM: 66, Disk: 64, Network: 42 }
  const offset = host === 'toolticket' ? 0 : host === 'PC_DI_ANDREA' ? 6 : -5
  return Array.from({ length: 24 }).map((_, index) => {
    const wave = Math.sin(index / 2.4) * 12 + Math.cos(index / 3.1) * 5
    const value = Math.max(20, Math.min(95, baseByMetric[metric] + offset + wave))
    return {
      timestamp: Date.now() - (23 - index) * 60 * 60 * 1000,
      value,
    }
  })
}

export default function MetricsPage() {
  const [selectedHost, setSelectedHost] = useState('toolticket')
  const [selectedMetric, setSelectedMetric] = useState('CPU')
  const [selectedRange, setSelectedRange] = useState('24h')

  const hostSeries = useMemo(() => buildSeries(selectedHost, selectedMetric), [selectedHost, selectedMetric])

  const kpis = useMemo(() => {
    const values = hostSeries.map((point) => point.value)
    const current = values[values.length - 1]
    const avg = values.reduce((acc, value) => acc + value, 0) / values.length
    return {
      current: current.toFixed(1),
      avg: avg.toFixed(1),
      peak: Math.max(...values).toFixed(1),
      minimum: Math.min(...values).toFixed(1),
    }
  }, [hostSeries])

  const compareData = useMemo(() => {
    const byHost = HOSTS.map((host) => ({ host, series: buildSeries(host, selectedMetric) }))
    return byHost[0].series.map((item, index) => ({
      timestamp: item.timestamp,
      toolticket: byHost[0].series[index].value,
      PC_DI_ANDREA: byHost[1].series[index].value,
      pasqui_pc: byHost[2].series[index].value,
    }))
  }, [selectedMetric])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Metrics</h1>
        <p className="mt-1 text-sm text-text-secondary">Historical performance data for all monitored hosts</p>
      </div>

      <section className="grid gap-3 rounded-[4px] border border-bg-border bg-bg-surface p-4 md:grid-cols-3">
        <div>
          <label htmlFor="metric-host" className="mb-1 block text-xs text-text-secondary">Host</label>
          <select
            id="metric-host"
            value={selectedHost}
            onChange={(event) => setSelectedHost(event.target.value)}
            className="w-full rounded-[4px] border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary"
          >
            {HOSTS.map((host) => <option key={host} value={host}>{host}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="metric-type" className="mb-1 block text-xs text-text-secondary">Metric</label>
          <select
            id="metric-type"
            value={selectedMetric}
            onChange={(event) => setSelectedMetric(event.target.value)}
            className="w-full rounded-[4px] border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary"
          >
            {METRICS.map((metric) => <option key={metric} value={metric}>{metric}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="metric-range" className="mb-1 block text-xs text-text-secondary">Range</label>
          <select
            id="metric-range"
            value={selectedRange}
            onChange={(event) => setSelectedRange(event.target.value)}
            className="w-full rounded-[4px] border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary"
          >
            {RANGES.map((range) => <option key={range} value={range}>{range}</option>)}
          </select>
        </div>
      </section>

      <MetricChart
        title={`${selectedMetric} trend — ${selectedHost} (${selectedRange})`}
        data={hostSeries}
        dataKey="value"
        threshold={85}
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[4px] border border-bg-border bg-bg-surface p-3">
          <p className="text-xs text-text-muted">Current Value</p>
          <p className="mt-1 font-mono text-xl text-text-primary">{kpis.current}%</p>
        </article>
        <article className="rounded-[4px] border border-bg-border bg-bg-surface p-3">
          <p className="text-xs text-text-muted">Average</p>
          <p className="mt-1 font-mono text-xl text-text-primary">{kpis.avg}%</p>
        </article>
        <article className="rounded-[4px] border border-bg-border bg-bg-surface p-3">
          <p className="text-xs text-text-muted">Peak</p>
          <p className="mt-1 font-mono text-xl text-status-warning">{kpis.peak}%</p>
        </article>
        <article className="rounded-[4px] border border-bg-border bg-bg-surface p-3">
          <p className="text-xs text-text-muted">Minimum</p>
          <p className="mt-1 font-mono text-xl text-status-ok">{kpis.minimum}%</p>
        </article>
      </section>

      <MetricChart
        title="Compare Hosts"
        data={compareData}
        multi
        dataKeys={['toolticket', 'PC_DI_ANDREA', 'pasqui_pc']}
        threshold={85}
      />
    </div>
  )
}

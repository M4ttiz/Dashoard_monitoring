import { useMemo } from 'react'
import {
  Area,
  AreaChart,
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

import Spinner from '../ui/Spinner.jsx'
import { formatPercent, formatTimestamp } from '../../utils/formatters.js'

const MAX_POINTS = 300

/**
 * Aggregates points into buckets averaging values.
 * Avoids the "decimate" effect where peaks disappear due to thinning.
 */
function smartSample(points, maxPoints = MAX_POINTS) {
  if (!Array.isArray(points) || points.length <= maxPoints) return points || []
  const bucketSize = Math.ceil(points.length / maxPoints)
  const result = []
  for (let i = 0; i < points.length; i += bucketSize) {
    const bucket = points.slice(i, i + bucketSize)
    if (bucket.length === 0) continue
    const aggregated = { timestamp: bucket[Math.floor(bucket.length / 2)].timestamp }
    const numericKeys = Object.keys(bucket[0]).filter((k) => k !== 'timestamp')
    numericKeys.forEach((k) => {
      let sum = 0
      let count = 0
      bucket.forEach((p) => {
        const v = Number(p?.[k])
        if (Number.isFinite(v)) {
          sum += v
          count += 1
        }
      })
      aggregated[k] = count > 0 ? sum / count : null
    })
    result.push(aggregated)
  }
  return result
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-md border border-bg-border bg-bg-elevated/95 p-2 font-mono text-[11px] text-text-primary shadow-lg">
      <p className="mb-1 text-text-secondary">{formatTimestamp(label, { full: true, seconds: true })}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: {Number(entry.value).toFixed(1)}%
        </p>
      ))}
    </div>
  )
}

export default function MetricChart({
  title,
  data = [],
  dataKey,
  multi = false,
  dataKeys = [],
  colors = ['#388bfd', '#d29922', '#3fb950', '#f85149', '#8957e5'],
  threshold = 85,
  unit = '%',
  height = 240,
  loading = false,
  emptyMessage = 'Nessun dato disponibile per il range selezionato.',
}) {
  const sampled = useMemo(() => smartSample(data), [data])

  const stats = useMemo(() => {
    const key = multi ? dataKeys[0] : dataKey
    if (!key || sampled.length === 0) return null
    const values = sampled.map((d) => Number(d?.[key])).filter((v) => Number.isFinite(v))
    if (values.length === 0) return null
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)
    return { avg, max, min }
  }, [sampled, dataKey, dataKeys, multi])

  const Chart = multi ? LineChart : AreaChart
  const ChartContent = multi
    ? dataKeys.map((key, idx) => (
        <Line
          key={key}
          type="monotone"
          dataKey={key}
          name={key}
          stroke={colors[idx % colors.length]}
          dot={false}
          strokeWidth={1.5}
          isAnimationActive={false}
        />
      ))
    : (
        <Area
          type="monotone"
          dataKey={dataKey}
          name={dataKey}
          stroke={colors[0]}
          fill={colors[0]}
          fillOpacity={0.18}
          strokeWidth={1.5}
          isAnimationActive={false}
        />
      )

  return (
    <section className="rounded-lg border border-bg-border bg-bg-surface p-4">
      <header className="mb-3 flex items-center justify-between">
        <h3 className="font-mono text-sm font-semibold text-text-primary">{title}</h3>
        {stats ? (
          <div className="flex items-center gap-3 font-mono text-[11px] text-text-secondary">
            <span>
              Avg <span className="text-text-primary">{formatPercent(stats.avg, 1)}</span>
            </span>
            <span>
              Max <span className="text-status-warning">{formatPercent(stats.max, 1)}</span>
            </span>
            <span>
              Min <span className="text-status-ok">{formatPercent(stats.min, 1)}</span>
            </span>
          </div>
        ) : null}
      </header>

      <div style={{ height }}>
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner size={20} />
          </div>
        ) : sampled.length === 0 ? (
          <div className="flex h-full items-center justify-center font-mono text-xs text-text-muted">
            {emptyMessage}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <Chart data={sampled} margin={{ top: 6, right: 12, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--color-bg-border)" opacity={0.5} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(v) => formatTimestamp(v)}
                stroke="var(--color-text-muted)"
                tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }}
                minTickGap={32}
              />
              <YAxis
                domain={[0, 100]}
                stroke="var(--color-text-muted)"
                tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }}
                tickFormatter={(v) => `${v}${unit}`}
                width={36}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={threshold}
                stroke="var(--color-status-critical)"
                strokeDasharray="4 4"
                strokeOpacity={0.7}
                label={{
                  value: `${threshold}${unit}`,
                  fill: 'var(--color-status-critical)',
                  fontSize: 10,
                  position: 'right',
                }}
              />
              {multi ? <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'var(--font-mono)' }} /> : null}
              {ChartContent}
            </Chart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}

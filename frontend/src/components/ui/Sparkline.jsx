import { Line, LineChart, ResponsiveContainer } from 'recharts'

export function Sparkline({ data = [], dataKey = 'value', stroke = '#38bdf8' }) {
  return (
    <div className="h-12 w-full" aria-label="sparkline chart" role="img">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey={dataKey} stroke={stroke} dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


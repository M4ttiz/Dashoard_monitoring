export function TrendIndicator({ delta = 0 }) {
  const positive = delta >= 0
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${positive ? 'text-emerald-300' : 'text-red-300'}`}>
      <span aria-hidden>{positive ? '▲' : '▼'}</span>
      {Math.abs(delta).toFixed(1)}%
    </span>
  )
}


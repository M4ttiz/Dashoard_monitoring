export function Gauge({ label, value }) {
  const safe = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <div className="space-y-1" role="meter" aria-label={label} aria-valuenow={safe} aria-valuemin={0} aria-valuemax={100}>
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span>{label}</span>
        <span>{safe.toFixed(1)}%</span>
      </div>
      <div className="h-2 rounded bg-slate-700">
        <div className="h-2 rounded bg-sky-500" style={{ width: `${safe}%` }} />
      </div>
    </div>
  )
}


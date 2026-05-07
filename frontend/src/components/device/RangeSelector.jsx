const RANGES = ['1h', '6h', '24h', '7d']

export default function RangeSelector({ value, onChange }) {
  return (
    <div
      role="group"
      aria-label="Range temporale"
      className="inline-flex rounded-md border border-bg-border bg-bg-surface p-1"
    >
      {RANGES.map((r) => {
        const active = r === value
        return (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            aria-pressed={active}
            className={`rounded px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider transition ${
              active
                ? 'bg-accent text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {r}
          </button>
        )
      })}
    </div>
  )
}

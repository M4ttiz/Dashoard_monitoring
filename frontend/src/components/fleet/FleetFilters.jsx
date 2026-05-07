import { Search } from 'lucide-react'

import { STATUS_LABEL } from '../../utils/thresholds.js'

const STATUS_FILTERS = ['ok', 'warning', 'critical', 'down']
const SORT_OPTIONS = [
  { id: 'status', label: 'Status' },
  { id: 'name', label: 'Nome' },
  { id: 'cpu', label: 'CPU' },
  { id: 'ram', label: 'RAM' },
  { id: 'disk', label: 'Disk' },
]

export default function FleetFilters({
  search,
  onSearchChange,
  activeStatuses,
  onToggleStatus,
  sortBy,
  onSortByChange,
  onAddNode,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-bg-border bg-bg-surface px-3 py-2">
      <label className="relative flex-1 min-w-[200px]">
        <span className="sr-only">Cerca host</span>
        <Search
          className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-text-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cerca hostname, IP..."
          className="w-full rounded-md border border-bg-border bg-bg-base px-8 py-1.5 font-mono text-sm text-text-primary placeholder:text-text-muted focus-visible:border-accent focus-visible:outline-none"
        />
      </label>

      <div role="group" aria-label="Filtra per stato" className="inline-flex flex-wrap gap-1">
        {STATUS_FILTERS.map((s) => {
          const active = activeStatuses.has(s)
          return (
            <button
              key={s}
              type="button"
              onClick={() => onToggleStatus(s)}
              aria-pressed={active}
              className={`rounded-md px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wide transition ${
                active
                  ? 'bg-accent/20 text-accent ring-1 ring-accent/40'
                  : 'bg-bg-elevated text-text-secondary ring-1 ring-bg-border hover:text-text-primary'
              }`}
            >
              {STATUS_LABEL[s]}
            </button>
          )
        })}
      </div>

      <label className="inline-flex items-center gap-2 rounded-md border border-bg-border bg-bg-base px-2 py-1.5">
        <span className="font-mono text-[10px] uppercase text-text-muted">Sort</span>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="bg-transparent font-mono text-xs text-text-primary focus-visible:outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id} className="bg-bg-surface">
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      {onAddNode ? (
        <button
          type="button"
          onClick={onAddNode}
          className="rounded-md bg-accent px-3 py-1.5 font-mono text-xs font-semibold text-white hover:brightness-110"
        >
          + Aggiungi nodo
        </button>
      ) : null}
    </div>
  )
}

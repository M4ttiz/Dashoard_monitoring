import SkeletonRow from '../ui/SkeletonRow.jsx'
import FleetTableRow, { FLEET_TABLE_COLUMNS_GRID } from './FleetTableRow.jsx'

const ROW_HEIGHT = 52
const HEADER_HEIGHT = 36

function HeaderCell({ children, className = '' }) {
  return (
    <div
      role="columnheader"
      className={`font-mono text-[10px] font-semibold uppercase tracking-wider text-text-muted ${className}`}
    >
      {children}
    </div>
  )
}

export default function FleetTable({
  rows,
  loading,
  onSelectNode,
  emptyMessage = 'Nessun nodo disponibile.',
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-bg-border bg-bg-surface">
      <div
        role="row"
        className={`${FLEET_TABLE_COLUMNS_GRID} sticky top-0 z-10 border-b border-bg-border bg-bg-elevated`}
        style={{ height: HEADER_HEIGHT }}
      >
        <HeaderCell>Host</HeaderCell>
        <HeaderCell>Status</HeaderCell>
        <HeaderCell>Services</HeaderCell>
        <HeaderCell>CPU</HeaderCell>
        <HeaderCell>Memory</HeaderCell>
        <HeaderCell>Disk</HeaderCell>
        <HeaderCell>Last Check</HeaderCell>
        <HeaderCell>Problems</HeaderCell>
        <HeaderCell className="text-right">Actions</HeaderCell>
      </div>

      <div role="grid" aria-rowcount={rows.length} className="min-h-[240px]">
        {loading ? (
          <div>
            {Array.from({ length: 8 }).map((_, idx) => (
              <SkeletonRow key={idx} columns={10} height={ROW_HEIGHT} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-text-secondary">
            {emptyMessage}
          </div>
        ) : (
          rows.map((row) => (
            <FleetTableRow
              key={row.node.id}
              node={row.node}
              metric={row.metric}
              status={row.status}
              alerts={row.alerts}
              onSelect={onSelectNode}
              height={ROW_HEIGHT}
            />
          ))
        )}
      </div>
    </div>
  )
}

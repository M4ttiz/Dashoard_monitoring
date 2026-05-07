import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

import SkeletonRow from '../ui/SkeletonRow.jsx'
import FleetTableRow, { FLEET_TABLE_COLUMNS_GRID } from './FleetTableRow.jsx'

const ROW_HEIGHT = 40
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
  const scrollRef = useRef(null)

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  })

  const items = rowVirtualizer.getVirtualItems()

  return (
    <div className="overflow-hidden border border-bg-border bg-bg-surface">
      <div
        role="row"
        className={`${FLEET_TABLE_COLUMNS_GRID} sticky top-0 z-10 border-b border-bg-border bg-bg-elevated`}
        style={{ height: HEADER_HEIGHT }}
      >
        <HeaderCell>Host</HeaderCell>
        <HeaderCell>Status</HeaderCell>
        <HeaderCell>CPU</HeaderCell>
        <HeaderCell>RAM</HeaderCell>
        <HeaderCell>Disk</HeaderCell>
        <HeaderCell>Last seen</HeaderCell>
        <HeaderCell>Alerts</HeaderCell>
        <HeaderCell className="text-right">→</HeaderCell>
      </div>

      <div
        ref={scrollRef}
        role="grid"
        aria-rowcount={rows.length}
        className="max-h-[calc(100vh-22rem)] min-h-[240px] overflow-auto"
      >
        {loading ? (
          <div>
            {Array.from({ length: 8 }).map((_, idx) => (
              <SkeletonRow key={idx} columns={7} height={ROW_HEIGHT} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-text-secondary">
            {emptyMessage}
          </div>
        ) : (
          <div
            style={{
              height: rowVirtualizer.getTotalSize(),
              position: 'relative',
              width: '100%',
            }}
          >
            {items.map((virtualRow) => {
              const row = rows[virtualRow.index]
              return (
                <div
                  key={row.node.id}
                  ref={rowVirtualizer.measureElement}
                  data-index={virtualRow.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <FleetTableRow
                    node={row.node}
                    metric={row.metric}
                    status={row.status}
                    alerts={row.alerts}
                    onSelect={onSelectNode}
                    height={ROW_HEIGHT}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

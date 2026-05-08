import { ArrowLeft, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import StatusBadge from '../ui/StatusBadge.jsx'

export default function DeviceHeader({ node, status, onDelete, deleting }) {
  return (
    <div className="panel p-4">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 font-sans text-xs text-accent hover:underline"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Fleet Overview
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="truncate font-sans text-2xl font-semibold text-text-primary">
              {node?.name || '—'}
            </h1>
            <StatusBadge status={status} />
          </div>
          <p className="mt-1 font-mono text-[10px] text-text-secondary">
            {node?.host || '—'}
            {node?.port ? `:${node.port}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-[4px] border border-status-critical/35 bg-status-critical/8 px-3 py-1.5 font-sans text-xs font-semibold text-status-critical hover:bg-status-critical/12 disabled:opacity-60"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              {deleting ? 'Rimozione...' : 'Rimuovi'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

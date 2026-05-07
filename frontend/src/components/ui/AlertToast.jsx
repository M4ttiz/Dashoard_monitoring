import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, OctagonAlert, X } from 'lucide-react'

import { useMonitorStore } from '../../store/useMonitorStore.js'

const TONE = {
  critical: 'border-status-critical/60 bg-[#1c0a0a] text-status-critical',
  warning: 'border-status-warning/50 bg-[#1a1200] text-status-warning',
}

const AUTO_CLOSE_MS = 6000

function ToastItem({ toast, onDismiss }) {
  const severity = toast.severity === 'critical' ? 'critical' : 'warning'
  const tone = TONE[severity]
  const Icon = severity === 'critical' ? OctagonAlert : AlertTriangle

  useEffect(() => {
    const id = window.setTimeout(() => onDismiss(toast.id), AUTO_CLOSE_MS)
    return () => window.clearTimeout(id)
  }, [toast.id, onDismiss])

  return (
    <div
      role="alert"
      className={`toast-enter w-80 rounded-lg border p-3 text-sm shadow-2xl ${tone}`}
    >
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-wider opacity-90">
            {severity}
          </p>
          <p className="mt-0.5 truncate text-text-primary">{toast.title}</p>
          {toast.message ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary">{toast.message}</p>
          ) : null}
          {toast.nodeId ? (
            <Link
              to={`/devices/${toast.nodeId}`}
              className="mt-1 inline-block text-[11px] font-medium text-accent hover:underline"
              onClick={() => onDismiss(toast.id)}
            >
              Vai al nodo →
            </Link>
          ) : null}
        </div>
        <button
          type="button"
          aria-label="Chiudi notifica"
          onClick={() => onDismiss(toast.id)}
          className="rounded p-1 text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export default function ToastStack() {
  const toasts = useMonitorStore((s) => s.toasts)
  const dismissToast = useMonitorStore((s) => s.dismissToast)

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  )
}

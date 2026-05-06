function severityClass(severity) {
  return severity === 'critical'
    ? 'border-red-500/60 bg-red-950/80 text-red-100'
    : 'border-yellow-500/60 bg-yellow-950/80 text-yellow-100'
}

export default function AlertToast({ alert, onClose }) {
  if (!alert) return null

  const severity = String(alert.severity || '').toLowerCase()
  const tone = severityClass(severity)
  const metric = String(alert.metric || '').toUpperCase()
  const nodeName = alert.node_name || alert.node_id || 'Unknown node'

  return (
    <button
      type="button"
      onClick={onClose}
      className={`fixed bottom-6 right-6 z-50 w-80 rounded-lg border p-4 text-left shadow-xl transition-transform duration-300 hover:translate-x-0 ${tone} animate-[slidein_300ms_ease-out]`}
    >
      <p className="text-xs font-semibold tracking-wide">{severity === 'critical' ? 'CRITICAL' : 'WARNING'}</p>
      <p className="mt-1 text-sm font-medium">
        {nodeName} — {metric}
      </p>
      <p className="mt-1 text-xs opacity-90">{alert.message}</p>
      <style>{'@keyframes slidein { from { transform: translateX(24px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }'}</style>
    </button>
  )
}


const statusStyles = {
  ok: 'bg-emerald-500/20 text-emerald-300',
  warning: 'bg-yellow-500/20 text-yellow-300',
  critical: 'bg-red-500/20 text-red-300',
  offline: 'bg-slate-500/30 text-slate-300',
}

export function Badge({ status = 'ok', children }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[status] || statusStyles.ok}`}>
      {children}
    </span>
  )
}


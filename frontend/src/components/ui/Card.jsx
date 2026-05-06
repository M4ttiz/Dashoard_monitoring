export function Card({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'border-slate-700 bg-slate-900/80',
    compact: 'border-slate-700 bg-slate-900/70 p-3',
    alert: 'border-red-700/60 bg-red-950/20',
  }
  return (
    <article className={`rounded-xl border p-4 shadow-sm ${variants[variant] || variants.default} ${className}`}>
      {children}
    </article>
  )
}


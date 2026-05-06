export function EmptyState({ title, message }) {
  return (
    <div role="status" className="rounded-xl border border-slate-700 bg-slate-900/60 p-8 text-center">
      <p className="text-3xl" aria-hidden>
        📊
      </p>
      <p className="mt-2 text-base font-semibold text-slate-100">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{message}</p>
    </div>
  )
}


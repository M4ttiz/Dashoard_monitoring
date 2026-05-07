export default function FleetStatusBar({ counts, total }) {
  return (
    <div role="region" aria-label="Status strip flotta" className="panel px-3 py-2">
      {(() => {
        const okCount = counts?.ok ?? 0
        const warnCount = counts?.warning ?? 0
        // In the NOC strip we fold down/unknown into the worst severity.
        const critCount = (counts?.critical ?? 0) + (counts?.down ?? 0) + (counts?.unknown ?? 0)
        const totalCount = total ?? okCount + warnCount + critCount
        const safeTotal = totalCount > 0 ? totalCount : 1

        const okPct = (okCount / safeTotal) * 100
        const warnPct = (warnCount / safeTotal) * 100
        const critPct = (critCount / safeTotal) * 100

        return (
          <>
            <div className="relative h-2 overflow-hidden bg-bg-border">
              <div aria-hidden="true" className="flex h-full w-full">
                <div className="bg-status-ok" style={{ width: `${okPct}%` }} />
                <div className="bg-status-warning" style={{ width: `${warnPct}%` }} />
                <div className="bg-status-critical" style={{ width: `${critPct}%` }} />
              </div>

              {/* Tacche ogni 25% (sopra la barra) */}
              {[25, 50, 75].map((p) => (
                <span
                  key={p}
                  aria-hidden="true"
                  className="absolute top-0 bottom-0 w-px bg-bg-base opacity-90"
                  style={{ left: `${p}%` }}
                />
              ))}
            </div>

            <div className="mt-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em]">
              <span>
                OK <span className="font-semibold text-status-ok">{okCount}</span>
              </span>
              <span>
                WARN <span className="font-semibold text-status-warning">{warnCount}</span>
              </span>
              <span>
                CRIT <span className="font-semibold text-status-critical">{critCount}</span>
              </span>
            </div>
          </>
        )
      })()}
    </div>
  )
}

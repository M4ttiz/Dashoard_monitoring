import { useEffect, useRef } from 'react'

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export function usePolling(task, options = {}) {
  const { enabled = true, intervalMs = 10000, retries = 3 } = options
  const taskRef = useRef(task)
  taskRef.current = task

  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    const run = async () => {
      while (!cancelled) {
        let retry = 0
        let ok = false
        while (!cancelled && retry <= retries && !ok) {
          try {
            await taskRef.current()
            ok = true
          } catch {
            const backoff = Math.min(15000, 500 * 2 ** retry)
            retry += 1
            await wait(backoff)
          }
        }
        await wait(intervalMs)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [enabled, intervalMs, retries])
}


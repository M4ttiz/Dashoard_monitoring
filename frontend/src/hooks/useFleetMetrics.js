import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'

import { getMetricsCurrent } from '../api/client.js'
import { metricsCurrentKey } from './useDeviceMetrics.js'

/**
 * Fetches current metrics in parallel for every node in the fleet.
 * Returns a Map keyed by nodeId. Empty entries (404 / no data yet) are kept null.
 */
export function useFleetMetrics(nodes = []) {
  const queries = useQueries({
    queries: nodes.map((node) => ({
      queryKey: metricsCurrentKey(node.id),
      queryFn: () => getMetricsCurrent(node.id),
      enabled: Boolean(node?.id),
      refetchInterval: 30_000,
      staleTime: 5_000,
    })),
  })

  return useMemo(() => {
    const map = new Map()
    nodes.forEach((node, idx) => {
      const q = queries[idx]
      map.set(node.id, q?.data ?? null)
    })
    return map
  }, [nodes, queries])
}

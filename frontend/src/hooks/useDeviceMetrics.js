import { useQuery } from '@tanstack/react-query'

import { getMetricsCurrent, getMetricsHistory } from '../api/client.js'

export const metricsHistoryKey = (nodeId, range) => ['metrics-history', nodeId, range]
export const metricsCurrentKey = (nodeId) => ['metrics-current', nodeId]

export function useDeviceMetrics(nodeId, range = '1h') {
  return useQuery({
    queryKey: metricsHistoryKey(nodeId, range),
    queryFn: () => getMetricsHistory(nodeId, range),
    enabled: Boolean(nodeId),
    refetchInterval: 30_000,
    staleTime: 10_000,
  })
}

export function useDeviceCurrent(nodeId) {
  return useQuery({
    queryKey: metricsCurrentKey(nodeId),
    queryFn: () => getMetricsCurrent(nodeId),
    enabled: Boolean(nodeId),
    refetchInterval: 30_000,
    staleTime: 5_000,
  })
}

import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getAlerts, markAlertReadApi, markAllAlertsRead } from '../api/client.js'

export const ALERTS_QUERY_KEY = ['alerts']

export function useAlerts() {
  return useQuery({
    queryKey: ALERTS_QUERY_KEY,
    queryFn: () => getAlerts(),
    refetchInterval: 30_000,
    staleTime: 5_000,
  })
}

export function useNodeAlerts(nodeId) {
  const { data, ...rest } = useAlerts()
  const filtered = useMemo(() => {
    if (!Array.isArray(data) || !nodeId) return []
    return data.filter((a) => a.node_id === nodeId)
  }, [data, nodeId])
  return { ...rest, data: filtered }
}

export function useMarkAlertRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markAlertReadApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ALERTS_QUERY_KEY })
    },
  })
}

export function useMarkAllAlertsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markAllAlertsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ALERTS_QUERY_KEY })
    },
  })
}

export function useUnreadAlertCount() {
  const { data } = useAlerts()
  return useMemo(() => {
    if (!Array.isArray(data)) return 0
    return data.reduce((acc, a) => (a?.is_read ? acc : acc + 1), 0)
  }, [data])
}

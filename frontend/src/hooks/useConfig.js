import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getMonitorConfig, updateMonitorConfig } from '../api/client.js'

export const CONFIG_QUERY_KEY = ['monitor-config']

export function useMonitorConfig() {
  return useQuery({
    queryKey: CONFIG_QUERY_KEY,
    queryFn: getMonitorConfig,
    staleTime: 10_000,
    refetchInterval: 30_000,
  })
}

export function useUpdateMonitorConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateMonitorConfig,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONFIG_QUERY_KEY })
    },
  })
}

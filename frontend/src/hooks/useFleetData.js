import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createNode, deleteNode, getFleet, updateNode } from '../api/client.js'

export const FLEET_QUERY_KEY = ['fleet']

export function useFleetData() {
  return useQuery({
    queryKey: FLEET_QUERY_KEY,
    queryFn: getFleet,
    refetchInterval: 15_000,
    staleTime: 5_000,
  })
}

export function useAddNode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createNode,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FLEET_QUERY_KEY })
    },
  })
}

export function useDeleteNode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteNode,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FLEET_QUERY_KEY })
    },
  })
}

export function useUpdateNode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) => updateNode(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FLEET_QUERY_KEY })
    },
  })
}

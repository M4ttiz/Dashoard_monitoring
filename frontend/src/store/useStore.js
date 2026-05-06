import axios from 'axios'
import { create } from 'zustand'

import { BACKEND_HTTP_URL } from '../config/backend.js'

const api = axios.create({
  baseURL: BACKEND_HTTP_URL,
})

function computeUnreadCount(alerts) {
  return alerts.reduce((acc, a) => (a?.is_read ? acc : acc + 1), 0)
}

export const useStore = create((set) => ({
  nodes: [],
  isNodesLoading: true,
  currentMetrics: {},
  alerts: [],
  unreadCount: 0,

  fetchNodes: async () => {
    set({ isNodesLoading: true })
    try {
      const { data } = await api.get('/api/nodes')
      set({ nodes: data || [], isNodesLoading: false })
    } catch {
      set({ isNodesLoading: false })
    }
  },

  addNode: async ({ name, host, port }) => {
    const { data } = await api.post('/api/nodes', { name, host, port })
    set((state) => ({
      nodes: [...state.nodes, data],
    }))
    return data
  },

  fetchAlerts: async () => {
    const { data } = await api.get('/api/alerts')
    const alerts = data || []
    set({ alerts, unreadCount: computeUnreadCount(alerts) })
  },

  handleWebSocketMessage: async (message) => {
    if (!message || typeof message !== 'object') return

    if (message.type === 'metrics_update') {
      const nodeId = message.node_id
      if (!nodeId) return

      try {
        const { data } = await api.get(`/api/metrics/${nodeId}/current`)
        set((state) => ({
          currentMetrics: { ...state.currentMetrics, [nodeId]: data },
        }))
      } catch {
        // node might not have metrics yet; ignore transient errors
      }
      return
    }

    if (message.type === 'new_alert') {
      const incoming = message.alert
      if (!incoming?.id) return

      set((state) => {
        const nextAlerts = [incoming, ...state.alerts]
        return {
          alerts: nextAlerts,
          unreadCount: computeUnreadCount(nextAlerts),
        }
      })
    }
  },

  markAlertRead: async (id) => {
    const { data } = await api.patch(`/api/alerts/${id}/read`)
    set((state) => {
      const nextAlerts = state.alerts.map((a) => (a.id === id ? data : a))
      return { alerts: nextAlerts, unreadCount: computeUnreadCount(nextAlerts) }
    })
  },

  markAllRead: async () => {
    await api.patch('/api/alerts/read-all')
    set((state) => {
      const nextAlerts = state.alerts.map((a) => ({ ...a, is_read: true }))
      return { alerts: nextAlerts, unreadCount: 0 }
    })
  },
}))


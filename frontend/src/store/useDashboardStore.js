import { create } from 'zustand'

import {
  addNode,
  getAlerts,
  getNodeCurrentMetrics,
  getNodeHistory,
  getNodes,
  markAlertRead,
  markAllAlertsRead,
} from '../services/dashboardApi.js'

const UI_KEY = 'dashboard-ui-v1'
const LAYOUT_KEY = 'dashboard-layout-v1'

const defaultUi = {
  theme: 'dark',
  activeFilters: { server: 'all', severity: 'all', metric: 'all' },
  panelsOpen: { overview: true, charts: true, alerts: true },
}

function persistedUi() {
  try {
    const raw = localStorage.getItem(UI_KEY)
    return raw ? { ...defaultUi, ...JSON.parse(raw) } : defaultUi
  } catch {
    return defaultUi
  }
}

function saveUi(ui) {
  localStorage.setItem(UI_KEY, JSON.stringify(ui))
}

function nowIso() {
  return new Date().toISOString()
}

export const useDashboardStore = create((set, get) => ({
  nodes: [],
  metrics: {},
  historical: {},
  alerts: [],
  ui: persistedUi(),
  layout: (() => {
    try {
      return JSON.parse(localStorage.getItem(LAYOUT_KEY) || 'null') || []
    } catch {
      return []
    }
  })(),
  fetchStatus: { loading: false, error: '', lastUpdated: null, latencyMs: null },
  connection: { mode: 'polling', isConnected: false },

  setTheme: (theme) =>
    set((state) => {
      const ui = { ...state.ui, theme }
      saveUi(ui)
      return { ui }
    }),
  setFilters: (activeFilters) =>
    set((state) => {
      const ui = { ...state.ui, activeFilters }
      saveUi(ui)
      return { ui }
    }),
  setLayout: (layout) => {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout))
    set({ layout })
  },
  setConnection: (connection) => set({ connection: { ...get().connection, ...connection } }),

  fetchAll: async () => {
    const start = performance.now()
    set({ fetchStatus: { ...get().fetchStatus, loading: true, error: '' } })
    try {
      const nodes = await getNodes()
      const alerts = await getAlerts()
      const metricsEntries = await Promise.all(
        nodes.map(async (n) => {
          try {
            const data = await getNodeCurrentMetrics(n.id)
            return [n.id, data]
          } catch {
            return [n.id, null]
          }
        }),
      )
      const metrics = Object.fromEntries(metricsEntries)
      set({
        nodes,
        alerts,
        metrics,
        fetchStatus: {
          loading: false,
          error: '',
          lastUpdated: nowIso(),
          latencyMs: Math.round(performance.now() - start),
        },
      })
    } catch {
      set({
        fetchStatus: {
          ...get().fetchStatus,
          loading: false,
          error: 'Errore di rete durante il refresh dashboard.',
          lastUpdated: nowIso(),
        },
      })
      throw new Error('fetch failed')
    }
  },

  fetchNodeHistory: async (nodeId, range = '15m') => {
    const data = await getNodeHistory(nodeId, range)
    set((state) => ({
      historical: { ...state.historical, [nodeId]: data.slice(-90) },
    }))
  },

  addNode: async (payload) => {
    const created = await addNode(payload)
    set((state) => ({ nodes: [...state.nodes, created] }))
    return created
  },

  acknowledgeAlert: async (id) => {
    const previous = get().alerts
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, is_read: true } : a)),
    }))
    try {
      const updated = await markAlertRead(id)
      set((state) => ({ alerts: state.alerts.map((a) => (a.id === id ? updated : a)) }))
    } catch {
      set({ alerts: previous })
    }
  },
  snoozeAlert: async (id) => {
    const snoozedUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, snoozed_until: snoozedUntil } : a)),
    }))
  },
  markAllRead: async () => {
    const previous = get().alerts
    set((state) => ({ alerts: state.alerts.map((a) => ({ ...a, is_read: true })) }))
    try {
      await markAllAlertsRead()
    } catch {
      set({ alerts: previous })
    }
  },
  ingestRealtimeMessage: (msg) => {
    if (!msg || typeof msg !== 'object') return
    if (msg.type === 'metrics_update' && msg.node_id && msg.metrics) {
      set((state) => ({ metrics: { ...state.metrics, [msg.node_id]: msg.metrics } }))
    }
    if (msg.type === 'new_alert' && msg.alert) {
      set((state) => ({ alerts: [msg.alert, ...state.alerts] }))
    }
  },
}))

export const useStore = useDashboardStore


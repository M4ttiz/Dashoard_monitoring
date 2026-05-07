import axios from 'axios'

import { BACKEND_HTTP_URL } from '../config/backend.js'

export const apiClient = axios.create({
  baseURL: BACKEND_HTTP_URL,
  timeout: 15_000,
})

export const endpoints = {
  fleet: () => '/api/nodes',
  node: (id) => `/api/nodes/${id}`,
  metricsHistory: (id, range) => `/api/metrics/${id}?range=${encodeURIComponent(range)}`,
  metricsCurrent: (id) => `/api/metrics/${id}/current`,
  alerts: (params = {}) => {
    const search = new URLSearchParams()
    if (params.unread === true) search.set('unread', 'true')
    const qs = search.toString()
    return qs ? `/api/alerts?${qs}` : '/api/alerts'
  },
  alertRead: (id) => `/api/alerts/${id}/read`,
  alertReadAll: () => '/api/alerts/read-all',
  config: () => '/api/config',
}

export async function getFleet() {
  const { data } = await apiClient.get(endpoints.fleet())
  return Array.isArray(data) ? data : []
}

export async function createNode(payload) {
  const { data } = await apiClient.post(endpoints.fleet(), payload)
  return data
}

export async function deleteNode(id) {
  await apiClient.delete(endpoints.node(id))
}

export async function updateNode(id, payload) {
  const { data } = await apiClient.patch(endpoints.node(id), payload)
  return data
}

export async function getMetricsHistory(id, range = '1h') {
  const { data } = await apiClient.get(endpoints.metricsHistory(id, range))
  return Array.isArray(data) ? data : []
}

export async function getMetricsCurrent(id) {
  try {
    const { data } = await apiClient.get(endpoints.metricsCurrent(id))
    return data
  } catch (err) {
    if (err?.response?.status === 404) return null
    throw err
  }
}

export async function getAlerts(params) {
  const { data } = await apiClient.get(endpoints.alerts(params))
  return Array.isArray(data) ? data : []
}

export async function markAlertReadApi(id) {
  const { data } = await apiClient.patch(endpoints.alertRead(id))
  return data
}

export async function markAllAlertsRead() {
  await apiClient.patch(endpoints.alertReadAll())
}

export async function getMonitorConfig() {
  const { data } = await apiClient.get(endpoints.config())
  return data
}

export async function updateMonitorConfig(payload) {
  const { data } = await apiClient.patch(endpoints.config(), payload)
  return data
}

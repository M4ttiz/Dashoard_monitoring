import { apiClient } from './apiClient.js'

export async function getNodes() {
  const { data } = await apiClient.get('/api/nodes')
  return Array.isArray(data) ? data : []
}

export async function getAlerts() {
  const { data } = await apiClient.get('/api/alerts')
  return Array.isArray(data) ? data : []
}

export async function getNodeCurrentMetrics(nodeId) {
  const { data } = await apiClient.get(`/api/metrics/${nodeId}/current`)
  return data || null
}

export async function getNodeHistory(nodeId, range = '15m') {
  const { data } = await apiClient.get(`/api/metrics/${nodeId}?range=${range}`)
  return Array.isArray(data) ? data : []
}

export async function markAlertRead(id) {
  const { data } = await apiClient.patch(`/api/alerts/${id}/read`)
  return data
}

export async function markAllAlertsRead() {
  await apiClient.patch('/api/alerts/read-all')
}

export async function addNode(payload) {
  const { data } = await apiClient.post('/api/nodes', payload)
  return data
}


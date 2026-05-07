import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { BACKEND_WS_URL } from '../config/backend.js'
import { useMonitorStore } from '../store/useMonitorStore.js'
import { ALERTS_QUERY_KEY } from './useAlerts.js'
import { metricsCurrentKey } from './useDeviceMetrics.js'
import { FLEET_QUERY_KEY } from './useFleetData.js'

const RECONNECT_BASE_MS = 3000
const RECONNECT_MAX_MS = 30_000
const DEBOUNCE_MS = 150

/**
 * Single shared WebSocket. Debounces metric invalidations to avoid
 * a re-render storm when many nodes report at once.
 */
export function useWebSocket(url = BACKEND_WS_URL) {
  const qc = useQueryClient()
  const setWsConnected = useMonitorStore((s) => s.setWsConnected)
  const pushToast = useMonitorStore((s) => s.pushToast)

  const socketRef = useRef(null)
  const reconnectTimerRef = useRef(null)
  const retriesRef = useRef(0)
  const debounceTimerRef = useRef(null)
  const pendingNodeIdsRef = useRef(new Set())

  useEffect(() => {
    let cancelled = false

    const flushPendingMetrics = () => {
      const ids = Array.from(pendingNodeIdsRef.current)
      pendingNodeIdsRef.current.clear()
      debounceTimerRef.current = null
      if (ids.length === 0) return
      ids.forEach((nodeId) => {
        qc.invalidateQueries({ queryKey: metricsCurrentKey(nodeId) })
      })
      // Fleet status (last_seen / online flag) may have changed too.
      qc.invalidateQueries({ queryKey: FLEET_QUERY_KEY })
    }

    const scheduleFlush = () => {
      if (debounceTimerRef.current != null) return
      debounceTimerRef.current = window.setTimeout(flushPendingMetrics, DEBOUNCE_MS)
    }

    const handleMessage = (raw) => {
      let msg
      try {
        msg = typeof raw === 'string' ? JSON.parse(raw) : raw
      } catch {
        return
      }
      if (!msg || typeof msg !== 'object') return

      switch (msg.type) {
        case 'metrics_update': {
          const id = msg.node_id || msg.nodeId
          if (id) {
            pendingNodeIdsRef.current.add(id)
            scheduleFlush()
          }
          break
        }
        case 'new_alert': {
          qc.invalidateQueries({ queryKey: ALERTS_QUERY_KEY })
          if (msg.alert) {
            pushToast({
              kind: 'alert',
              severity: msg.alert.severity,
              title: msg.alert.metric
                ? String(msg.alert.metric).toUpperCase()
                : 'Alert',
              nodeId: msg.alert.node_id,
              message: msg.alert.message,
              alert: msg.alert,
            })
          }
          break
        }
        case 'node_status_change': {
          qc.invalidateQueries({ queryKey: FLEET_QUERY_KEY })
          break
        }
        default:
          break
      }
    }

    const scheduleReconnect = () => {
      if (cancelled || reconnectTimerRef.current != null) return
      const delay = Math.min(
        RECONNECT_BASE_MS + retriesRef.current * 2000,
        RECONNECT_MAX_MS,
      )
      reconnectTimerRef.current = window.setTimeout(() => {
        reconnectTimerRef.current = null
        retriesRef.current += 1
        connect()
      }, delay)
    }

    const connect = () => {
      if (cancelled) return
      try {
        const ws = new WebSocket(url)
        socketRef.current = ws

        ws.onopen = () => {
          if (cancelled) return
          retriesRef.current = 0
          setWsConnected(true)
        }

        ws.onmessage = (event) => {
          if (cancelled) return
          handleMessage(event?.data)
        }

        ws.onclose = () => {
          if (cancelled) return
          setWsConnected(false)
          scheduleReconnect()
        }

        ws.onerror = () => {
          try {
            ws.close()
          } catch {
            // ignore — onclose handles reconnect
          }
        }
      } catch {
        setWsConnected(false)
        scheduleReconnect()
      }
    }

    connect()

    const pendingNodeIds = pendingNodeIdsRef.current

    return () => {
      cancelled = true
      setWsConnected(false)

      if (reconnectTimerRef.current != null) {
        window.clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
      if (debounceTimerRef.current != null) {
        window.clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
      pendingNodeIds.clear()

      if (socketRef.current) {
        try {
          socketRef.current.close()
        } catch {
          // ignore
        }
        socketRef.current = null
      }
    }
  }, [url, qc, setWsConnected, pushToast])
}

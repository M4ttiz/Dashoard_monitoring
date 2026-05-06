import { useEffect, useRef, useState } from 'react'

import { BACKEND_WS_URL } from '../config/backend.js'

export function useWebSocket(url = BACKEND_WS_URL) {
  const socketRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)

  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const [latencyMs, setLatencyMs] = useState(null)

  useEffect(() => {
    let cancelled = false

    const scheduleReconnect = () => {
      if (cancelled) return
      if (reconnectTimeoutRef.current) return

      reconnectTimeoutRef.current = window.setTimeout(() => {
        reconnectTimeoutRef.current = null
        connect()
      }, 3000)
    }

    const connect = () => {
      if (cancelled) return
      try {
        const ws = new WebSocket(url)
        socketRef.current = ws

        ws.onopen = () => {
          if (cancelled) return
          setIsConnected(true)
        }

        ws.onmessage = (event) => {
          if (cancelled) return
          const raw = event?.data
          const t0 = performance.now()
          try {
            setLastMessage(JSON.parse(raw))
          } catch {
            setLastMessage(raw)
          }
          setLatencyMs(Math.round(performance.now() - t0))
        }

        ws.onclose = () => {
          if (cancelled) return
          setIsConnected(false)
          scheduleReconnect()
        }

        ws.onerror = () => {
          if (cancelled) return
          setIsConnected(false)
          try {
            ws.close()
          } catch {
            // ignore
          }
        }
      } catch {
        setIsConnected(false)
        scheduleReconnect()
      }
    }

    connect()

    return () => {
      cancelled = true
      setIsConnected(false)

      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }

      if (socketRef.current) {
        try {
          socketRef.current.close()
        } catch {
          // ignore
        }
        socketRef.current = null
      }
    }
  }, [url])

  return { lastMessage, isConnected, latencyMs }
}


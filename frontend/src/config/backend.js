const DEFAULT_HTTP_URL = 'http://localhost:8000'
const DEFAULT_WS_URL = 'ws://localhost:8000/ws'

function getRuntimeDefaults() {
  if (typeof window === 'undefined') {
    return { httpUrl: DEFAULT_HTTP_URL, wsUrl: DEFAULT_WS_URL }
  }

  const { hostname, origin, protocol, host } = window.location
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return { httpUrl: DEFAULT_HTTP_URL, wsUrl: DEFAULT_WS_URL }
  }

  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:'
  return {
    httpUrl: origin,
    wsUrl: `${wsProtocol}//${host}/ws`,
  }
}

const runtimeDefaults = getRuntimeDefaults()

export const BACKEND_HTTP_URL = (
  import.meta.env.VITE_BACKEND_HTTP_URL || runtimeDefaults.httpUrl
).replace(/\/$/, '')
export const BACKEND_WS_URL = import.meta.env.VITE_BACKEND_WS_URL || runtimeDefaults.wsUrl


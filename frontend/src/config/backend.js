const DEFAULT_HTTP_URL = 'http://localhost:8000'
const DEFAULT_WS_URL = 'ws://localhost:8000/ws'

export const BACKEND_HTTP_URL = (import.meta.env.VITE_BACKEND_HTTP_URL || DEFAULT_HTTP_URL).replace(/\/$/, '')
export const BACKEND_WS_URL = import.meta.env.VITE_BACKEND_WS_URL || DEFAULT_WS_URL


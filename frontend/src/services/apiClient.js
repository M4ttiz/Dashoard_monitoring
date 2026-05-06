import axios from 'axios'

import { BACKEND_HTTP_URL } from '../config/backend.js'

export const apiClient = axios.create({
  baseURL: BACKEND_HTTP_URL,
  timeout: 10000,
})


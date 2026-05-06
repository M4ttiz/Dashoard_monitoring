import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

if (import.meta.env.DEV) {
  import('@welldone-software/why-did-you-render')
    .then(({ default: whyDidYouRender }) => {
      whyDidYouRender(React, { trackAllPureComponents: false })
    })
    .catch(() => {})
}

document.documentElement.classList.add('dark')

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

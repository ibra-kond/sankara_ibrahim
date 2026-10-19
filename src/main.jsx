import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource-variable/fraunces'
import '@fontsource-variable/inter'
import './index.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Service worker (PWA) : uniquement en production pour ne pas gêner le développement
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

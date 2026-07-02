import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const root = document.getElementById('root')!
root.innerHTML = '<p style="padding:20px">Loading...</p>'

try {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (e) {
  root.innerHTML = '<p style="padding:20px;color:red">Error: ' + e + '</p>'
}

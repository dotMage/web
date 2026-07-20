import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyScale } from './lib/uiScale'
import { getLang } from './i18n'

// Apply persisted UI scale and language before the first paint (no flash).
applyScale()
document.documentElement.lang = getLang()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

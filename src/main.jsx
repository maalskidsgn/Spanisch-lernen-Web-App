import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Einwilligung from './Einwilligung.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* Neben der App, nicht darin: Der Hinweis muss auch auf der
        Startseite erscheinen, und die liegt in App hinter einer
        vorzeitigen Rueckgabe. */}
    <Einwilligung onRecht={(s) => { window.dispatchEvent(new CustomEvent('recht', { detail: s })) }} />
  </StrictMode>,
)

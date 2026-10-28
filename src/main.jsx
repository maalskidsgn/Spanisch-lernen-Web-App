import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Einwilligung from './Einwilligung.jsx'
import { merkeEinladung } from './rangliste.js'

// Ganz früh, noch vor dem ersten Rendern: Wer über einen
// Einladungslink kommt, soll den Namen des Einladenden nicht
// verlieren, wenn die App unterwegs die Adresse austauscht.
merkeEinladung()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* Neben der App, nicht darin: Der Hinweis muss auch auf der
        Startseite erscheinen, und die liegt in App hinter einer
        vorzeitigen Rueckgabe. */}
    <Einwilligung onRecht={(s) => { window.dispatchEvent(new CustomEvent('recht', { detail: s })) }} />
  </StrictMode>,
)

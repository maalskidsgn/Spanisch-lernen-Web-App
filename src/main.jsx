import { merkePartnerLink } from './partnerCode.js'
import { merkeHerkunft } from './herkunft.js'
import { rueckkehrHoeren, blogImBrowser } from './appAnmeldung.js'
import { StrictMode } from 'react'
import UpdateHinweis from './UpdateHinweis.jsx'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Einwilligung from './Einwilligung.jsx'
import { merkeEinladung } from './rangliste.js'
import { starteLernzeit } from './lernzeit.js'
import { klicktoeneStarten } from './erfolgston.js'

merkeHerkunft()
starteLernzeit()
klicktoeneStarten() // „Thock“-Klick auf allen Knöpfen
rueckkehrHoeren()
blogImBrowser()
merkePartnerLink()

// Ganz früh, noch vor dem ersten Rendern: Wer über einen
// Einladungslink kommt, soll den Namen des Einladenden nicht
// verlieren, wenn die App unterwegs die Adresse austauscht.
merkeEinladung()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* Store-Apps: „Bitte aktualisieren“, gesteuert über /api/app/version */}
    <UpdateHinweis />
    {/* Neben der App, nicht darin: Der Hinweis muss auch auf der
        Startseite erscheinen, und die liegt in App hinter einer
        vorzeitigen Rueckgabe. */}
    <Einwilligung onRecht={(s) => { window.dispatchEvent(new CustomEvent('recht', { detail: s })) }} />
  </StrictMode>,
)

// Start-Logo (index.html) sanft ausblenden – frühestens nach 0,9 s,
// damit es auch bei schnellem Laden einmal kurz aufploppt.
const startLogo = document.getElementById('start-logo')
if (startLogo) {
  setTimeout(() => {
    startLogo.classList.add('weg')
    setTimeout(() => startLogo.remove(), 500)
  }, Math.max(0, 900 - performance.now()))
}

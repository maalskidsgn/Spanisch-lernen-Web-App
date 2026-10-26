import { useEffect, useState } from 'react'

// "Zum Startbildschirm hinzufuegen" als Knopf.
//
// Android/Chrome: Der Browser meldet mit "beforeinstallprompt", dass
// die Seite installierbar ist – dann oeffnet unser Knopf direkt den
// echten Installationsdialog.
// iPhone/Safari: Apple erlaubt das NICHT per Knopf. Dort zeigen wir
// die zwei Handgriffe (Teilen → Zum Home-Bildschirm) als Anleitung.
// Laeuft die App schon vom Startbildschirm aus, erscheint nichts.

let gemerkterAufruf = null
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    gemerkterAufruf = e
  })
}

function laeuftInstalliert() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
  )
}

function istIphone() {
  const ua = navigator.userAgent
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document)
}

export default function InstallKnopf({ app = 'App' }) {
  const [aufruf, setAufruf] = useState(() => gemerkterAufruf)
  const [anleitung, setAnleitung] = useState(false)
  const [weg, setWeg] = useState(
    () => laeuftInstalliert() || localStorage.getItem('install-hinweis') === 'weg'
  )
  // Die Store-App (Capacitor) braucht das nicht
  const imStore = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()

  useEffect(() => {
    const merken = (e) => {
      e.preventDefault()
      gemerkterAufruf = e
      setAufruf(e)
    }
    const fertig = () => {
      localStorage.setItem('install-hinweis', 'weg')
      setWeg(true)
    }
    window.addEventListener('beforeinstallprompt', merken)
    window.addEventListener('appinstalled', fertig)
    return () => {
      window.removeEventListener('beforeinstallprompt', merken)
      window.removeEventListener('appinstalled', fertig)
    }
  }, [])

  if (weg || imStore) return null
  const iphone = istIphone()
  // Weder installierbar gemeldet noch iPhone (z. B. Firefox am PC): nichts zeigen
  if (!aufruf && !iphone) return null

  async function installieren() {
    if (aufruf) {
      aufruf.prompt()
      const { outcome } = await aufruf.userChoice
      if (outcome === 'accepted') {
        localStorage.setItem('install-hinweis', 'weg')
        setWeg(true)
      }
      gemerkterAufruf = null
      setAufruf(null)
    } else {
      setAnleitung(true)
    }
  }

  function spaeter() {
    localStorage.setItem('install-hinweis', 'weg')
    setWeg(true)
  }

  return (
    <section className="install-karte">
      <div className="install-kopf">
        <img src="/apple-touch-icon.png" alt="" width="48" height="48" />
        <div>
          <b>{app} auf deinen Startbildschirm</b>
          <span>Ein Tipp – und du lernst wie in einer echten App, ohne Browserleiste.</span>
        </div>
      </div>

      {anleitung ? (
        <ol className="install-schritte">
          <li>
            Tippe unten auf{' '}
            <span className="install-symbol" aria-label="Teilen">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M12 3v12M7 8l5-5 5 5M5 13v7h14v-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>{' '}
            <b>Teilen</b>
          </li>
          <li>
            Wähle <b>„Zum Home-Bildschirm"</b>
          </li>
          <li>
            Oben rechts auf <b>Hinzufügen</b> – fertig
          </li>
        </ol>
      ) : (
        <div className="install-knoepfe">
          <button type="button" className="btn" onClick={installieren}>
            Zum Startbildschirm hinzufügen
          </button>
          <button type="button" className="btn-plain" onClick={spaeter}>
            Später
          </button>
        </div>
      )}
      {anleitung && (
        <button type="button" className="btn-plain install-zu" onClick={spaeter}>
          Erledigt
        </button>
      )}
    </section>
  )
}

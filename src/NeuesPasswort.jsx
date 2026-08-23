import { useState } from 'react'
import { neuesPasswortSetzen } from './auth.js'
import Logo from './Logo.jsx'

/**
 * Das Formular nach dem Klick in der "Passwort vergessen"-Mail.
 *
 * Supabase meldet den Nutzer ueber den Link schon an – aber das
 * alte Passwort ist damit nicht ersetzt. Dieses Fenster erscheint
 * genau in dem Moment und laesst sich nicht wegklicken: Wer hier
 * abbricht, steht beim naechsten Anmelden wieder vor derselben Tuer.
 */
export default function NeuesPasswort({ onFertig }) {
  const [passwort, setPasswort] = useState('')
  const [nochmal, setNochmal] = useState('')
  const [fehler, setFehler] = useState('')
  const [laeuft, setLaeuft] = useState(false)

  async function absenden(e) {
    e.preventDefault()
    setFehler('')
    if (passwort.length < 6) return setFehler('Mindestens 6 Zeichen.')
    if (passwort !== nochmal) return setFehler('Die beiden Passwörter sind nicht gleich.')
    setLaeuft(true)
    try {
      await neuesPasswortSetzen(passwort)
      onFertig()
    } catch (f) {
      setFehler(f.message)
      setLaeuft(false)
    }
  }

  return (
    // Bewusst kein onClick zum Schliessen am Overlay und kein x-Knopf:
    // Wer hier abbricht, steht beim naechsten Anmelden wieder vor
    // derselben Tuer.
    <div className="login-overlay" role="dialog" aria-label="Neues Passwort">
      <div className="login-box">
        <div className="login-kopf">
          <Logo klasse="login-badge" />
          <h2>Neues Passwort</h2>
          <p>Du bist über den Link aus der E-Mail hier. Gib jetzt ein neues Passwort ein – das alte gilt danach nicht mehr.</p>
        </div>

        <form onSubmit={absenden} className="login-form">
          <label className="login-feld">
            <span>Neues Passwort</span>
            <input
              type="password"
              value={passwort}
              onChange={(e) => setPasswort(e.target.value)}
              minLength={6}
              autoComplete="new-password"
              placeholder="Mindestens 6 Zeichen"
              autoFocus
              required
            />
          </label>
          <label className="login-feld">
            <span>Noch einmal</span>
            <input
              type="password"
              value={nochmal}
              onChange={(e) => setNochmal(e.target.value)}
              minLength={6}
              autoComplete="new-password"
              required
            />
          </label>
          {fehler && <p className="login-fehler" role="alert">{fehler}</p>}
          <button type="submit" className="btn login-absenden" disabled={laeuft}>
            {laeuft ? 'Speichere …' : 'Passwort speichern'}
          </button>
        </form>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { registrieren, anmelden, passwortVergessen } from './auth.js'
import Logo from './Logo.jsx'

/**
 * Anmelde-Dialog – erscheint als Overlay über der App.
 *
 * Drei Ansichten in einem: Anmelden, Registrieren und Passwort vergessen.
 * Schließen ist immer möglich, denn die App läuft auch ohne Konto.
 */
export default function Login({ onSchliessen, onFertig, startModus = 'anmelden' }) {
  const [modus, setModus] = useState(startModus) // anmelden | registrieren | vergessen
  const [email, setEmail] = useState('')
  const [passwort, setPasswort] = useState('')
  const [name, setName] = useState('')
  const [laedt, setLaedt] = useState(false)
  const [fehler, setFehler] = useState('')
  const [hinweis, setHinweis] = useState('')

  async function absenden(e) {
    e.preventDefault()
    setLaedt(true)
    setFehler('')
    setHinweis('')

    try {
      if (modus === 'anmelden') {
        await anmelden(email, passwort)
        onFertig?.()
        onSchliessen()
      } else if (modus === 'registrieren') {
        const { mailBestaetigen } = await registrieren(email, passwort, name)
        if (mailBestaetigen) {
          setHinweis(
            'Fast geschafft! Wir haben dir eine E-Mail geschickt – ' +
            'klicke den Link darin, dann kannst du dich anmelden.'
          )
        } else {
          onFertig?.()
          onSchliessen()
        }
      } else {
        await passwortVergessen(email)
        setHinweis('Wir haben dir einen Link zum Zurücksetzen geschickt.')
      }
    } catch (f) {
      setFehler(f.message)
    } finally {
      setLaedt(false)
    }
  }

  const titel = {
    anmelden: 'Willkommen zurück',
    registrieren: 'Konto anlegen',
    vergessen: 'Passwort zurücksetzen',
  }[modus]

  const untertitel = {
    anmelden: 'Melde dich an, um deinen Fortschritt überall zu haben.',
    registrieren: 'Sichere deine Vokabeln und lerne auf allen Geräten weiter.',
    vergessen: 'Wir schicken dir einen Link per E-Mail.',
  }[modus]

  return (
    <div className="login-overlay" onClick={onSchliessen}>
      <div className="login-box" onClick={(e) => e.stopPropagation()}>
        <button className="login-schliessen" onClick={onSchliessen} aria-label="Schließen">
          ×
        </button>

        <div className="login-kopf">
          <Logo klasse="login-badge" />
          <h2>{titel}</h2>
          <p>{untertitel}</p>
        </div>

        <form onSubmit={absenden} className="login-form">
          {modus === 'registrieren' && (
            <label className="login-feld">
              <span>Wie sollen wir dich nennen?</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dein Vorname"
                autoComplete="given-name"
              />
            </label>
          )}

          <label className="login-feld">
            <span>E-Mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="du@beispiel.de"
              autoComplete="email"
              required
            />
          </label>

          {modus !== 'vergessen' && (
            <label className="login-feld">
              <span>Passwort</span>
              <input
                type="password"
                value={passwort}
                onChange={(e) => setPasswort(e.target.value)}
                placeholder={modus === 'registrieren' ? 'Mindestens 6 Zeichen' : '••••••••'}
                autoComplete={modus === 'registrieren' ? 'new-password' : 'current-password'}
                minLength={6}
                required
              />
            </label>
          )}

          {fehler && <p className="login-fehler">{fehler}</p>}
          {hinweis && <p className="login-hinweis">✉️ {hinweis}</p>}

          <button className="btn login-absenden" disabled={laedt}>
            {laedt
              ? 'Einen Moment…'
              : modus === 'anmelden'
                ? 'Anmelden'
                : modus === 'registrieren'
                  ? 'Konto anlegen'
                  : 'Link schicken'}
          </button>
        </form>

        <div className="login-wechsel">
          {modus === 'anmelden' && (
            <>
              <button className="btn-plain" onClick={() => setModus('registrieren')}>
                Noch kein Konto? <b>Jetzt anlegen</b>
              </button>
              <button className="btn-plain login-klein" onClick={() => setModus('vergessen')}>
                Passwort vergessen?
              </button>
            </>
          )}
          {modus !== 'anmelden' && (
            <button className="btn-plain" onClick={() => setModus('anmelden')}>
              ← Zurück zur Anmeldung
            </button>
          )}
        </div>

        <p className="login-fuss">
          Mit dem Anlegen eines Kontos wird dein Lernfortschritt gesichert und
          steht dir auf allen Geräten zur Verfügung.
        </p>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { istApp } from './api.js'
import { registrieren, anmelden, passwortVergessen, mitAnbieter, aktiveAnbieter } from './auth.js'
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

  // Google/Apple: nur anzeigen, was in Supabase eingeschaltet ist.
  // In der Store-App vorerst nicht – dort braeuchte die Rueckkehr
  // vom Anbieter einen eigenen App-Link.
  const [anbieter, setAnbieter] = useState([])
  useEffect(() => {
    if (!istApp) aktiveAnbieter().then(setAnbieter)
  }, [])

  async function anbieterLogin(a) {
    setFehler('')
    try {
      await mitAnbieter(a)
    } catch (f) {
      setFehler(f.message)
    }
  }

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
        const { mailBestaetigen, schonVorhanden } = await registrieren(email, passwort, name)
        if (schonVorhanden) {
          // Gleich zur Anmeldung wechseln – die Adresse bleibt stehen
          setModus('anmelden')
          setPasswort('')
          setHinweis(
            'Für diese E-Mail gibt es schon ein Konto. Melde dich einfach an – ' +
            'oder setze dein Passwort zurück, falls du es vergessen hast.'
          )
        } else if (mailBestaetigen) {
          setHinweis(
            'Fast geschafft! Wir haben dir eine E-Mail geschickt – ' +
            'klicke den Link darin, dann kannst du dich anmelden. ' +
            'Schau bitte auch im Spam-Ordner nach, falls nichts ankommt.'
          )
        } else {
          onFertig?.()
          onSchliessen()
        }
      } else {
        await passwortVergessen(email)
        setHinweis(
          'Wir haben dir einen Link zum Zurücksetzen geschickt. ' +
          'Schau bitte auch im Spam-Ordner nach, falls nichts ankommt.'
        )
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
        {/* Auf dem Handy ein Zurück-Pfeil oben links, am Rechner ein
            Kreuz oben rechts – beides dasselbe Zeichen, nur gedreht
            per CSS. Ein getipptes "×" sah auf jedem Gerät anders aus. */}
        <button className="login-schliessen" onClick={onSchliessen} aria-label="Schließen">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path className="ls-kreuz" d="M6 6l12 12M18 6L6 18" stroke="currentColor"
                  strokeWidth="2.4" strokeLinecap="round" />
            <path className="ls-pfeil" d="M15 5l-7 7 7 7" stroke="currentColor"
                  strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="login-kopf">
          <Logo klasse="login-badge" />
          <h2>{titel}</h2>
          <p>{untertitel}</p>
        </div>

        {modus !== 'vergessen' && anbieter.length > 0 && (
          <div className="login-anbieter">
            {anbieter.includes('apple') && (
              <button type="button" className="anbieter-knopf anbieter-apple" onClick={() => anbieterLogin('apple')}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="currentColor" d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8s2 .8 3.3.8c1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.8-1.1-2.8-4.3zM14 5.3c.7-.9 1.2-2 1-3.2-1 0-2.3.7-3 1.5-.7.8-1.2 2-1.1 3.1 1.2.1 2.3-.6 3.1-1.4z" />
                </svg>
                Weiter mit Apple
              </button>
            )}
            {anbieter.includes('google') && (
              <button type="button" className="anbieter-knopf" onClick={() => anbieterLogin('google')}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9c-.3 1.4-1 2.5-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z" />
                  <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.7H2.1v2.8C3.9 20.4 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.7 14c-.2-.7-.4-1.4-.4-2s.1-1.4.4-2V7.2H2.1C1.4 8.6 1 10.3 1 12s.4 3.4 1.1 4.8L5.7 14z" />
                  <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.3 1.7l3.2-3.2C17.5 2 15 1 12 1 7.7 1 3.9 3.6 2.1 7.2L5.7 10c.9-2.7 3.4-4.6 6.3-4.6z" />
                </svg>
                Weiter mit Google
              </button>
            )}
            <div className="login-oder"><span>oder mit E-Mail</span></div>
          </div>
        )}

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

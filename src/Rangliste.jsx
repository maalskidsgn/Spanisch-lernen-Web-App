import { useEffect, useRef, useState } from 'react'
import {
  ladeBenutzername, ladeRangliste, setzeBenutzername, istNameFrei, nameFehler,
} from './rangliste.js'
import Logo from './Logo.jsx'

/**
 * Die Rangliste auf der Startseite: die zehn Lernenden mit den meisten
 * XP. Ohne Benutzernamen steht man nicht drin – dann zeigt die Karte
 * gleich das Feld, um sich einen auszusuchen.
 *
 * Fehlt die Datenbank-Migration (supabase-rangliste.sql), bleibt die
 * Karte unsichtbar statt kaputt.
 */
export function RanglistenKarte({ nutzerId, eigeneXp = 0 }) {
  const [name, setName] = useState(undefined) // undefined = lädt/nicht verfügbar
  const [liste, setListe] = useState(null)

  async function laden() {
    const [n, l] = await Promise.all([ladeBenutzername(nutzerId), ladeRangliste(10)])
    setName(n)
    setListe(l)
  }

  useEffect(() => {
    laden()
    const neu = () => laden()
    window.addEventListener('benutzername', neu)
    return () => window.removeEventListener('benutzername', neu)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nutzerId])

  if (name === undefined || liste === null) return null

  // Die eigenen XP liegen lokal frischer vor als in der Datenbank
  // (die zieht 1,5 s verzögert nach) – also den höheren Wert zeigen.
  const zeilen = liste.map((z) => (z.ich ? { ...z, xp: Math.max(z.xp, eigeneXp) } : z))
  const top = zeilen.filter((z) => z.platz <= 10)
  const ichDraussen = zeilen.find((z) => z.ich && z.platz > 10)

  return (
    <section className="start-karte rangliste">
      <div className="rang-kopf">
        <span className="rang-pokal" aria-hidden="true">🏆</span>
        <div>
          <h2 className="start-abschnitt rang-titel">Rangliste</h2>
          <p className="rang-unter">Die fleißigsten Lernenden bei Habloo – nach XP</p>
        </div>
      </div>

      {top.length === 0 ? (
        <p className="rang-leer">Noch niemand drin – sei die Nummer 1.</p>
      ) : (
        <ol className="rang-liste">
          {top.map((z) => (
            <RangZeile key={z.platz} z={z} />
          ))}
          {ichDraussen && (
            <>
              <li className="rang-luecke" aria-hidden="true">···</li>
              <RangZeile z={ichDraussen} />
            </>
          )}
        </ol>
      )}

      {name === null && (
        <div className="rang-mitmachen">
          <p>
            <b>Du fehlst noch!</b> Such dir einen Benutzernamen aus, dann stehst du mit deinen{' '}
            {eigeneXp} XP in der Liste.
          </p>
          <BenutzernameFeld nutzerId={nutzerId} knopf="Mitmachen" />
        </div>
      )}
    </section>
  )
}

function RangZeile({ z }) {
  const medaille = { 1: '🥇', 2: '🥈', 3: '🥉' }[z.platz]
  return (
    <li className={'rang-zeile' + (z.ich ? ' rang-ich' : '') + (z.platz <= 3 ? ' rang-podest' : '')}>
      <span className="rang-platz">{medaille ?? z.platz}</span>
      <span className="rang-name">
        {z.benutzername}
        {z.ich && <small> (du)</small>}
      </span>
      <b className="rang-xp">{z.xp.toLocaleString('de-DE')} XP</b>
    </li>
  )
}

/**
 * Eingabefeld für den Benutzernamen mit Live-Prüfung, ob er frei ist.
 * Wird auf dem Start, im Begrüßungsschritt und in den Einstellungen
 * benutzt.
 */
export function BenutzernameFeld({ nutzerId, start = '', knopf = 'Speichern', onGespeichert }) {
  const [wert, setWert] = useState(start)
  const [frei, setFrei] = useState(null) // null = unbekannt
  const [fehler, setFehler] = useState('')
  const [laeuft, setLaeuft] = useState(false)
  const pruefNr = useRef(0)

  const form = wert.trim() ? nameFehler(wert) : ''
  const unveraendert = start && wert.trim().toLowerCase() === start.toLowerCase()

  // Kurz nach dem Tippen nachfragen, ob der Name noch frei ist
  useEffect(() => {
    setFrei(null)
    if (!wert.trim() || form || unveraendert) return
    const nr = ++pruefNr.current
    const t = setTimeout(async () => {
      const ok = await istNameFrei(wert)
      if (nr === pruefNr.current) setFrei(ok)
    }, 350)
    return () => clearTimeout(t)
  }, [wert, form, unveraendert])

  async function speichern(e) {
    e.preventDefault()
    setFehler('')
    setLaeuft(true)
    try {
      const n = await setzeBenutzername(nutzerId, wert)
      onGespeichert?.(n)
    } catch (f) {
      setFehler(f.message)
    } finally {
      setLaeuft(false)
    }
  }

  let hinweis = ''
  let klasse = ''
  if (form) { hinweis = form; klasse = 'name-schlecht' }
  else if (frei === false) { hinweis = 'Den Namen gibt es schon.'; klasse = 'name-schlecht' }
  else if (frei === true) { hinweis = '✓ Der Name ist frei.'; klasse = 'name-gut' }

  return (
    <form className="name-form" onSubmit={speichern}>
      <div className="name-zeile">
        <span className="name-at" aria-hidden="true">@</span>
        <input
          value={wert}
          onChange={(e) => setWert(e.target.value.replace(/\s/g, ''))}
          placeholder="z. B. sol_lernt"
          maxLength={20}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Benutzername"
        />
        <button
          className="btn name-knopf"
          disabled={laeuft || !wert.trim() || Boolean(form) || frei === false || unveraendert}
        >
          {laeuft ? '…' : knopf}
        </button>
      </div>
      {(fehler || hinweis) && <p className={'name-hinweis ' + (fehler ? 'name-schlecht' : klasse)}>{fehler || hinweis}</p>}
    </form>
  )
}

/**
 * Einmal nach der Anmeldung: "Wie willst du heißen?"
 * Wer jetzt nicht will, tippt "Später" und findet das Feld wieder auf
 * der Startseite und in den Einstellungen.
 */
export function BenutzernameWahl({ nutzerId, onFertig }) {
  return (
    <div className="ob">
      <div className="ob-karte name-wahl">
        <span className="ob-maskottchen" aria-hidden="true"><Logo /></span>
        <h1>Wie willst du <span className="ob-akzent">heißen?</span></h1>
        <p className="ob-text">
          Dein Benutzername erscheint in der <b>Rangliste</b> – wer die meisten XP sammelt, steht
          ganz oben. Jeden Namen gibt es nur einmal.
        </p>
        <BenutzernameFeld nutzerId={nutzerId} knopf="Los geht’s" onGespeichert={onFertig} />
        <button className="ob-skip name-spaeter" onClick={onFertig}>Später</button>
      </div>
    </div>
  )
}

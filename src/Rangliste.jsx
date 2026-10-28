import { useEffect, useRef, useState } from 'react'
import {
  ladeBenutzername, ladeRangliste, setzeBenutzername, istNameFrei, nameFehler, ZEITRAEUME,
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
  const [zeitraum, setZeitraum] = useState('gesamt')
  // Während ein anderer Zeitraum geladen wird, bleibt die alte Liste
  // stehen und blendet nur ab. Sie ganz zu entfernen liess die Karte
  // zusammenklappen – das sprang.
  const [wechselt, setWechselt] = useState(false)

  async function laden(z = zeitraum) {
    const [n, l] = await Promise.all([ladeBenutzername(nutzerId), ladeRangliste(10, z)])
    setName(n)
    setListe(l)
    setWechselt(false)
  }

  useEffect(() => {
    laden()
    const neu = () => laden()
    window.addEventListener('benutzername', neu)
    return () => window.removeEventListener('benutzername', neu)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nutzerId, zeitraum])

  if (name === undefined || liste === null) return null

  // Die eigenen XP liegen lokal frischer vor als in der Datenbank
  // (die zieht 1,5 s verzögert nach) – also den höheren Wert zeigen.
  // Nur bei der Gesamtliste: Die lokalen XP sind frischer als die
  // Datenbank. Bei Monat und Jahr wäre der Gesamtstand schlicht falsch.
  const zeilen =
    zeitraum === 'gesamt'
      ? liste.map((z) => (z.ich ? { ...z, xp: Math.max(z.xp, eigeneXp) } : z))
      : liste
  // Bei Monat und Jahr nur zeigen, wer in dem Zeitraum wirklich XP
  // hat. Sich selbst mit 0 XP allein in der Liste zu sehen, wirkt
  // wie ein Fehler – dann lieber der Hinweis darunter.
  const echte = zeitraum === 'gesamt' ? zeilen : zeilen.filter((z) => z.xp > 0)
  const top = echte.filter((z) => z.platz <= 10)
  // Die ersten drei stehen auf dem Podest, der Rest in der Liste
  const podest = top.filter((z) => z.platz <= 3)
  const rest = top.filter((z) => z.platz > 3)
  const ichDraussen = echte.find((z) => z.ich && z.platz > 10)

  return (
    <section className="start-karte rangliste">
      <div className="rang-kopf">
        <span className="rang-pokal" aria-hidden="true">🏆</span>
        <div>
          <h2 className="start-abschnitt rang-titel">Rangliste</h2>
          <p className="rang-unter">Die fleißigsten Lernenden bei Habloo – nach XP</p>
        </div>
      </div>

      {/* Drei Zeiträume: Wer lange dabei ist, steht insgesamt vorn –
          wer gerade loslegt, hat im Monat eine faire Chance. */}
      <div className="rang-zeitraum" role="tablist" aria-label="Zeitraum">
        {/* Die Pille gleitet zum gewählten Knopf, statt zu springen */}
        <span
          className="rang-zr-pille"
          aria-hidden="true"
          style={{ transform: `translateX(${ZEITRAEUME.findIndex(([w]) => w === zeitraum) * 100}%)` }}
        />
        {ZEITRAEUME.map(([wert, text]) => (
          <button
            key={wert}
            role="tab"
            aria-selected={zeitraum === wert}
            className={'rang-zr' + (zeitraum === wert ? ' ist-aktiv' : '')}
            onClick={() => {
              if (wert === zeitraum) return
              setWechselt(true)
              setZeitraum(wert)
            }}
          >
            {text}
          </button>
        ))}
      </div>

      {top.length === 0 ? (
        <div className="rang-leer">
          {zeitraum === 'gesamt' ? (
            <p>Noch niemand drin – sei die Nummer 1.</p>
          ) : (
            <>
              <p>
                <b>Die Wertung läuft ab jetzt.</b>
              </p>
              <p className="rang-leer-klein">
                Wer wann gelernt hat, wird erst seit heute festgehalten – vorher gab es nur
                den Gesamtstand. Die erste XP {zeitraum === 'monat' ? 'dieses Monats' : 'dieses Jahres'}{' '}
                bringt dich auf Platz 1.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className={'rang-inhalt' + (wechselt ? ' ist-wechsel' : '')}>
          {/* Die drei Besten auf dem Podest – Gold in der Mitte und
              höher. Weniger als drei kommen in die Liste darunter,
              ein Podest mit einer Säule wäre albern. */}
          {podest.length === 3 && (
            <div className="rang-podest">
              <Saeule z={podest[1]} stufe="zweiter" />
              <Saeule z={podest[0]} stufe="erster" />
              <Saeule z={podest[2]} stufe="dritter" />
            </div>
          )}

          <ol className="rang-liste">
            {(podest.length === 3 ? rest : top).map((z, i) => (
              <RangZeile key={zeitraum + '-' + z.platz} z={z} nr={i} />
            ))}
            {ichDraussen && (
              <>
                <li className="rang-luecke" aria-hidden="true">···</li>
                <RangZeile z={ichDraussen} nr={rest.length} />
              </>
            )}
          </ol>
        </div>
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

/** Eine Säule des Podests: Bild, Name, XP und der Block mit dem Platz. */
function Saeule({ z, stufe }) {
  return (
    <div className={'rang-saeule rang-' + stufe + (z.ich ? ' ist-ich' : '')}>
      <span className="rs-bild" aria-hidden="true">{z.benutzername.charAt(0).toUpperCase()}</span>
      <span className="rs-name">
        {z.benutzername}
        {z.ich && <small>du</small>}
      </span>
      <span className="rs-xp">{z.xp.toLocaleString('de-DE')} XP</span>
      <span className="rs-block">{z.platz}</span>
    </div>
  )
}

/**
 * Eine Zeile der Rangliste.
 *
 * Statt Medaillen-Emojis (die auf jedem Gerät anders aussehen) trägt
 * der Platz eine eigene Farbe: Gold, Silber, Bronze, danach ruhig.
 * Der Balken darunter zeigt den Abstand zur Spitze – so sieht man
 * auf einen Blick, ob es knapp ist oder uneinholbar.
 */
function RangZeile({ z, nr = 0 }) {
  const stufe = z.platz <= 3 ? ' rang-p' + z.platz : ''
  return (
    <li
      className={'rang-zeile' + (z.ich ? ' rang-ich' : '') + stufe}
      style={{ '--nr': nr }}
    >
      <span className="rang-platz">{z.platz}</span>
      <span className="rang-initial" aria-hidden="true">
        {z.benutzername.charAt(0).toUpperCase()}
      </span>
      <span className="rang-name">
        {z.benutzername}
        {z.ich && <small>du</small>}
      </span>
      <b className="rang-xp">
        {z.xp.toLocaleString('de-DE')}
        <small>XP</small>
      </b>
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

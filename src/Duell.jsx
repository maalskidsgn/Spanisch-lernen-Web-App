import { useEffect, useRef, useState } from 'react'
import {
  FRAGEN, SEKUNDEN, XP_GESPIELT, XP_SIEG,
  ladeDuelle, duellStarten, duellAbgeben, duellLoeschen, stand, zeitText, neueSiege,
} from './duell.js'
import { ladeFreunde } from './rangliste.js'
import { Bildnis } from './Rangliste.jsx'

/**
 * Duelle gegen Freunde.
 *
 * Sitzt im Profil unter den Freunden – da steht schon, mit wem man
 * es zu tun hat. Ein eigener Reiter dafür wäre leer, solange niemand
 * Freunde hat.
 */
export default function DuellKasten({ addXp }) {
  const [liste, setListe] = useState(null) // null = lädt
  const [freunde, setFreunde] = useState([])
  const [waehlen, setWaehlen] = useState(false)
  const [spiel, setSpiel] = useState(null) // das Duell, das gerade läuft
  const [fehler, setFehler] = useState('')
  // Frisch gewonnene Duelle, für die es gerade XP gab
  const [siege, setSiege] = useState([])

  async function neuLaden() {
    const [d, f] = await Promise.all([ladeDuelle(), ladeFreunde()])
    setListe(d)
    setFreunde(f.filter((x) => x.stand === 'freund'))

    // Der Siegbonus kann erst hier kommen: Beim eigenen Spiel steht
    // noch gar nicht fest, ob man gewonnen hat.
    const frisch = neueSiege(d)
    if (frisch.length) {
      addXp?.(XP_SIEG * frisch.length)
      setSiege(frisch)
    }
  }

  useEffect(() => {
    neuLaden()
    const neu = () => neuLaden()
    window.addEventListener('duelle', neu)
    window.addEventListener('freunde', neu)
    return () => {
      window.removeEventListener('duelle', neu)
      window.removeEventListener('freunde', neu)
    }
  }, [])

  async function fordere(name) {
    setFehler('')
    setWaehlen(false)
    try {
      await duellStarten(name)
      await neuLaden()
    } catch (f) {
      setFehler(f.message)
    }
  }

  if (liste === null) return null

  const offen = liste.filter((d) => stand(d) === 'ich_dran')
  const wartet = liste.filter((d) => stand(d) === 'er_dran')
  const fertig = liste.filter((d) => !['ich_dran', 'er_dran'].includes(stand(d)))

  return (
    <div className="du">
      {spiel && (
        <DuellSpiel
          duell={spiel}
          addXp={addXp}
          onFertig={async () => {
            setSpiel(null)
            await neuLaden()
          }}
        />
      )}

      {/* ---------- Herausfordern ---------- */}
      {freunde.length === 0 ? (
        <p className="du-leer">
          Für ein Duell brauchst du erst einen Freund. Such jemanden über den Namen –
          oder schick deinen Einladungslink aus der Rangliste.
        </p>
      ) : !waehlen ? (
        <button className="du-neu" onClick={() => { setFehler(''); setWaehlen(true) }}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 20 20 4M14 4h6v6M10 20H4v-6" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Duell starten
        </button>
      ) : (
        <div className="du-waehlen">
          <p className="du-waehlen-titel">Gegen wen?</p>
          {freunde.map((f) => (
            <button key={f.benutzername} className="du-gegner" onClick={() => fordere(f.benutzername)}>
              <Bildnis name={f.benutzername} bild={f.bild} klasse="du-bild" />
              <b>{f.benutzername}</b>
            </button>
          ))}
          <button className="btn-plain du-abbrechen" onClick={() => setWaehlen(false)}>
            Abbrechen
          </button>
        </div>
      )}

      {fehler && <p className="du-fehler">{fehler}</p>}

      {/* Gewonnen, während man weg war – das soll man mitbekommen */}
      {siege.length > 0 && (
        <p className="du-sieg">
          {siege.length === 1
            ? `Du hast gegen ${siege[0].gegner} gewonnen.`
            : `Du hast ${siege.length} Duelle gewonnen.`}{' '}
          <b>+{XP_SIEG * siege.length} XP</b>
        </p>
      )}

      {/* ---------- Du bist dran ----------
          Ganz oben: Das ist das Einzige, wo man etwas tun kann. */}
      {offen.length > 0 && (
        <section className="du-block">
          <h3 className="du-titel">
            Du bist dran <span className="du-zahl">{offen.length}</span>
          </h3>
          {offen.map((d) => (
            <Zeile key={d.id} d={d} onSpielen={() => setSpiel(d)} onWeg={neuLaden} />
          ))}
        </section>
      )}

      {wartet.length > 0 && (
        <section className="du-block">
          <h3 className="du-titel">Warten auf den Gegner</h3>
          {wartet.map((d) => <Zeile key={d.id} d={d} onWeg={neuLaden} />)}
        </section>
      )}

      {fertig.length > 0 && (
        <section className="du-block">
          <h3 className="du-titel">Gespielt</h3>
          {fertig.map((d) => <Zeile key={d.id} d={d} onWeg={neuLaden} />)}
        </section>
      )}
    </div>
  )
}

/** Ein Duell in der Liste. */
function Zeile({ d, onSpielen, onWeg }) {
  const s = stand(d)
  const [laeuft, setLaeuft] = useState(false)

  async function weg() {
    setLaeuft(true)
    try {
      await duellLoeschen(d.id)
      await onWeg?.()
    } catch {
      setLaeuft(false)
    }
  }

  return (
    <div className={'du-zeile du-ist-' + s}>
      <Bildnis name={d.gegner} bild={d.gegner_bild} klasse="du-bild" />

      <span className="du-text">
        <b>{d.gegner}</b>
        <small>
          {s === 'ich_dran' && `${FRAGEN} Fragen warten auf dich`}
          {s === 'er_dran' && `Du: ${d.punkte_ich}/${FRAGEN} · ${zeitText(d.zeit_ich)}`}
          {s !== 'ich_dran' && s !== 'er_dran' &&
            `${d.punkte_ich}:${d.punkte_gegner} · ${zeitText(d.zeit_ich)} gegen ${zeitText(d.zeit_gegner)}`}
        </small>
      </span>

      <span className="du-tun">
        {s === 'ich_dran' && (
          <button className="btn-small" onClick={onSpielen}>Spielen</button>
        )}
        {s === 'er_dran' && <span className="du-marke">wartet</span>}
        {s === 'gewonnen' && <span className="du-marke du-gewonnen">gewonnen</span>}
        {s === 'verloren' && <span className="du-marke du-verloren">verloren</span>}
        {s === 'unentschieden' && <span className="du-marke">unentschieden</span>}
        {s !== 'ich_dran' && (
          <button className="btn-plain du-weg" disabled={laeuft} onClick={weg}
                  aria-label="Duell entfernen">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4"
                    strokeLinecap="round" />
            </svg>
          </button>
        )}
      </span>
    </div>
  )
}

/**
 * Das Spiel selbst: sieben Fragen, je zehn Sekunden.
 *
 * Die Uhr läuft weiter, während man überlegt – wer zu lange braucht,
 * verliert die Frage. Das ist der Grund, warum das Duell überhaupt
 * spannend ist: Ohne Zeitdruck hätten am Ende beide sieben Punkte.
 */
function DuellSpiel({ duell, addXp, onFertig }) {
  const fragen = duell.fragen || []
  const [nr, setNr] = useState(0)
  const [gewaehlt, setGewaehlt] = useState(null)
  const [punkte, setPunkte] = useState(0)
  const [rest, setRest] = useState(SEKUNDEN)
  const [fertig, setFertig] = useState(null) // {punkte, zeit, fehler?}
  const start = useRef(Date.now())
  const abgegeben = useRef(false)

  const frage = fragen[nr]

  // Die Uhr. Läuft nur, solange noch nicht geantwortet wurde.
  useEffect(() => {
    if (gewaehlt !== null || fertig) return
    if (rest <= 0) {
      setGewaehlt('') // leere Wahl = Zeit abgelaufen
      return
    }
    const t = setTimeout(() => setRest((r) => r - 0.1), 100)
    return () => clearTimeout(t)
  }, [rest, gewaehlt, fertig])

  // Nach der Antwort kurz stehen bleiben, damit man die Auflösung sieht
  useEffect(() => {
    if (gewaehlt === null || fertig) return
    const t = setTimeout(() => {
      if (nr + 1 < fragen.length) {
        setNr(nr + 1)
        setGewaehlt(null)
        setRest(SEKUNDEN)
      } else {
        beenden()
      }
    }, 950)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gewaehlt])

  function waehle(antwort) {
    if (gewaehlt !== null) return
    setGewaehlt(antwort)
    if (antwort === frage.richtig) setPunkte((p) => p + 1)
  }

  async function beenden() {
    if (abgegeben.current) return
    abgegeben.current = true
    const zeit = Date.now() - start.current
    // `punkte` ist hier schon aktuell: setGewaehlt und setPunkte
    // laufen im selben Klick, der Effekt danach sieht beide neu.
    const erreicht = punkte
    try {
      await duellAbgeben(duell.id, erreicht, zeit)
      // XP gibt es fürs Mitspielen. Der Siegbonus kommt erst, wenn
      // beide gespielt haben – vorher weiss niemand, wer gewinnt.
      addXp?.(XP_GESPIELT)
      setFertig({ punkte: erreicht, zeit })
    } catch (f) {
      setFertig({ punkte: erreicht, zeit, fehler: f.message })
    }
  }

  if (!frage && !fertig) {
    return (
      <div className="du-schicht" role="dialog" aria-modal="true">
        <div className="du-karte">
          <p>Dieses Duell hat keine Fragen mehr.</p>
          <button className="btn" onClick={onFertig}>Zurück</button>
        </div>
      </div>
    )
  }

  if (fertig) {
    return (
      <div className="du-schicht" role="dialog" aria-modal="true">
        <div className="du-karte du-ende">
          <p className="du-ende-klein">Dein Ergebnis</p>
          <p className="du-ende-punkte">
            {fertig.punkte}<span>/{fragen.length}</span>
          </p>
          <p className="du-ende-zeit">{zeitText(fertig.zeit)}</p>

          {fertig.fehler ? (
            <p className="du-fehler">{fertig.fehler}</p>
          ) : (
            <>
              <div className="du-ende-xp">+{XP_GESPIELT} XP</div>
              <p className="du-ende-text">
                {duell.punkte_gegner === null || duell.punkte_gegner === undefined
                  ? `Jetzt ist ${duell.gegner} dran. Du siehst hier, sobald gespielt wurde.`
                  : `${duell.gegner} hatte ${duell.punkte_gegner}/${fragen.length}.`}
              </p>
            </>
          )}

          <button className="btn" onClick={onFertig}>Fertig</button>
        </div>
      </div>
    )
  }

  const anteil = Math.max(0, rest / SEKUNDEN)

  return (
    <div className="du-schicht" role="dialog" aria-modal="true">
      <div className="du-karte du-spiel">
        <div className="du-kopf">
          <span className="du-nr">Frage {nr + 1} von {fragen.length}</span>
          <span className="du-punkte">{punkte} Punkte</span>
        </div>

        {/* Die Uhr als Balken, nicht als Zahl: Man soll sie spüren,
            nicht lesen. */}
        <div className="du-uhr" aria-hidden="true">
          <span
            className={'du-uhr-innen' + (anteil < 0.3 ? ' ist-knapp' : '')}
            style={{ transform: `scaleX(${anteil})` }}
          />
        </div>

        <p className="du-wort">{frage.es}</p>

        <div className="du-antworten">
          {frage.antworten.map((a) => {
            let art = ''
            if (gewaehlt !== null) {
              if (a === frage.richtig) art = ' ist-richtig'
              else if (a === gewaehlt) art = ' ist-falsch'
              else art = ' ist-blass'
            }
            return (
              <button
                key={a}
                className={'du-antwort' + art}
                disabled={gewaehlt !== null}
                onClick={() => waehle(a)}
              >
                {a}
              </button>
            )
          })}
        </div>

        {gewaehlt === '' && <p className="du-zuspaet">Zeit abgelaufen</p>}
      </div>
    </div>
  )
}

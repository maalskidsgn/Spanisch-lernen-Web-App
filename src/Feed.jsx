import { createPortal } from 'react-dom'
import { useState, useEffect, useRef, useMemo } from 'react'
import { uebersetzungsAdresse } from './satzUmfeld.js'
import { feedKarten, merkeGesehen, gesehene } from './feed.js'
import { API_URL } from './api.js'
import { spiele, dialogAbspielen } from './audio.js'
import { XP } from './gamification.js'
import { merkeEinheit } from './aktivitaet.js'
import { IconPfeil } from './icons.jsx'

/** Ein Wort auf seinen Nachschlag-Schlüssel bringen. */
function wortSchluessel(wort) {
  return wort.toLowerCase().replace(/[^a-záéíóúüñ]/gi, '')
}

/**
 * Der Feed – Spanisch zum Durchwischen.
 *
 * Aufbau wie bei den bekannten Apps: eine Karte füllt den Bildschirm,
 * hochwischen bringt die nächste. Das übernimmt CSS (scroll-snap),
 * nicht JavaScript – dadurch fühlt es sich genauso an wie überall
 * sonst, auch beim schnellen Durchwischen.
 *
 * Was anders ist als bei Instagram: Jede Karte hat einen Ton-Knopf
 * und lässt sich antippen. Man kann also nicht nur konsumieren,
 * sondern an jeder Stelle einsteigen.
 */
export default function Feed({ onZurueck, onAddVocab, vocab = {}, addXp }) {
  const karten = useMemo(() => feedKarten(), [])
  const [sichtbar, setSichtbar] = useState(0)
  const [wort, setWort] = useState(null)
  const behaelter = useRef(null)
  const schonGezaehlt = useRef(new Set())

  // Welche Karte ist gerade im Bild? Der Beobachter meldet es,
  // sobald eine Karte mehr als zur Hälfte zu sehen ist.
  useEffect(() => {
    const kasten = behaelter.current
    if (!kasten) return

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        for (const e of eintraege) {
          if (!e.isIntersecting) continue
          const nr = Number(e.target.dataset.nr)
          setSichtbar(nr)

          // Einmal je Karte verbuchen: gesehen und ein paar XP.
          const id = karten[nr]?.id
          if (id && !schonGezaehlt.current.has(id)) {
            schonGezaehlt.current.add(id)
            merkeGesehen(id)
          }
        }
      },
      { root: kasten, threshold: 0.6 }
    )

    for (const el of kasten.querySelectorAll('.feed-karte')) beobachter.observe(el)
    return () => beobachter.disconnect()
  }, [karten])

  /** Ein Wort antippen: übersetzen und als Karte zeigen. */
  async function wortAntippen(rohesWort, umfeld) {
    const sauber = rohesWort.replace(/[«».,;:¿?¡!()"—…]/g, '').trim()
    if (!sauber) return
    setWort({ text: sauber, de: '', laedt: true })
    try {
      const res = await fetch(uebersetzungsAdresse(API_URL, sauber, umfeld))
      const daten = await res.json()
      setWort({ text: sauber, de: daten.translation || '', laedt: false })
    } catch {
      setWort({ text: sauber, de: '', laedt: false })
    }
  }

  function wortInTrainer(status) {
    // Ohne Übersetzung nichts sammeln: Ein Wort ohne Bedeutung im
    // Trainer ist nur eine Karte, die man nie beantworten kann.
    if (!wort?.text || !wort.de || !onAddVocab) return setWort(null)
    onAddVocab([{ wort: wort.text, uebersetzung: wort.de, quelle: 'Feed' }], status)
    setWort(null)
  }

  return (
    <div className="feed-seite">
      <header className="feed-kopf">
        <button className="feed-zurueck" onClick={onZurueck} aria-label="Zurück">
          ←
        </button>
        <span className="feed-titel">Für dich</span>
        <span className="feed-zaehler">
          {sichtbar + 1}/{karten.length}
        </span>
      </header>

      <div className="feed-bahn" ref={behaelter}>
        {karten.map((k, i) => (
          <div className="feed-karte" key={k.id} data-nr={i}>
            {k.art === 'haeppchen' ? (
              <Haeppchen karte={k} aktiv={sichtbar === i} />
            ) : (
              <TextKarte
                karte={k}
                aktiv={sichtbar === i}
                vocab={vocab}
                onWort={wortAntippen}
                addXp={addXp}
              />
            )}
          </div>
        ))}

        {/* Letzte Seite: geschafft */}
        <div className="feed-karte feed-ende">
          <div className="feed-ende-inhalt">
            <h2>Das war alles für heute</h2>
            <p>
              {gesehene().size} von {karten.length} Karten gesehen. Neue kommen
              laufend dazu.
            </p>
            <button className="btn" onClick={onZurueck}>
              Zurück zur App
            </button>
          </div>
        </div>
      </div>

      {/* ---------- Angetipptes Wort ---------- */}
      {wort && createPortal(
        <div className="wortkarte-hintergrund" onClick={() => setWort(null)}>
          <div className="wortkarte" onClick={(e) => e.stopPropagation()}>
            <button
              className="wortkarte-schliessen"
              aria-label="Schließen"
              onClick={() => setWort(null)}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
              </svg>
            </button>
            <div className="wortkarte-wort">
              {wort.text}
              {vocab[wortSchluessel(wort.text)] && (
                <span className="wortkarte-marke">✓ im Trainer</span>
              )}
            </div>
            <div className="wortkarte-de">
              {wort.laedt ? 'Übersetze …' : wort.de || 'Keine Übersetzung gefunden'}
            </div>
            <div className="wortkarte-knoepfe">
              <button
                className="btn-outline"
                onClick={() => wortInTrainer('gewusst')}
                disabled={wort.laedt || !wort.de}
              >
                Kenne ich
              </button>
              <button
                className="btn"
                onClick={() => wortInTrainer('lernen')}
                disabled={wort.laedt || !wort.de}
              >
                ＋ Lernen
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

// ===============================================================
//  Karte 1: das Grundlagen-Häppchen
// ===============================================================

/**
 * Eine Regel, in dreißig Sekunden erzählt.
 *
 * Der Aufbau ist zeitlich gestaffelt: erst der Titel, dann die
 * Regel, dann die Beispiele nacheinander. Das ist der Grund, warum
 * sich die Karte wie ein kurzes Video anfühlt, obwohl sie keines
 * ist – die Information kommt in Portionen statt als Wand.
 *
 * Die Animation startet erst, wenn die Karte wirklich im Bild ist
 * (`aktiv`) – sonst wäre sie vorbei, bevor man hinsieht.
 */
function Haeppchen({ karte, aktiv }) {
  const [laeuft, setLaeuft] = useState(null) // welcher Satz gerade klingt

  async function anhoeren(text, nr) {
    setLaeuft(nr)
    try {
      await spiele(text)
    } catch {
      // Kein Ton möglich – dann eben still
    }
    // Kurz stehen lassen, damit man sieht, welche Zeile klingt
    setTimeout(() => setLaeuft(null), 900 + text.length * 55)
  }

  return (
    <article className={'haeppchen farbe-' + (karte.farbe ?? 0) + (aktiv ? ' ist-aktiv' : '')}>
      <span className="haeppchen-marke">Grundlagen</span>
      <h2 className="haeppchen-titel">{karte.titel}</h2>
      <p className="haeppchen-kern">{karte.kern}</p>

      <div className="haeppchen-zeilen">
        {karte.zeilen.map((z, i) => (
          <button
            key={i}
            className={'haeppchen-zeile' + (laeuft === i ? ' zeile-klingt' : '')}
            style={{ '--nr': i }}
            onClick={() => anhoeren(z.es, i)}
          >
            <span className="zeile-es">{z.es}</span>
            <span className="zeile-de">{z.de}</span>
            <span className="zeile-ton" aria-hidden="true">
              {laeuft === i ? '♪' : '▶'}
            </span>
          </button>
        ))}
      </div>

      {karte.merke && (
        <p className="haeppchen-merke">
          <b>Merke:</b> {karte.merke}
        </p>
      )}
    </article>
  )
}

// ===============================================================
//  Karte 2: der Wissenstext
// ===============================================================

/**
 * Ein kurzer Text zum Hören und Mitlesen.
 *
 * Der Ton ist hier die Hauptsache – deshalb steht der Abspiel-Knopf
 * groß oben und nicht als kleines Symbol am Rand. Wer lieber liest,
 * schaltet unten auf Deutsch um.
 */
function TextKarte({ karte, aktiv, vocab, onWort, addXp }) {
  const [sprache, setSprache] = useState('es')
  const [laeuft, setLaeuft] = useState(false)
  const [gelesen, setGelesen] = useState(false)
  const laufRef = useRef(null)

  // Wischt man weiter, soll der Ton nicht nachlaufen.
  useEffect(() => {
    if (!aktiv && laufRef.current) {
      laufRef.current.stop()
      laufRef.current = null
      setLaeuft(false)
    }
  }, [aktiv])

  // Einmal je Karte XP geben, wenn man sie wirklich angesehen hat.
  useEffect(() => {
    if (!aktiv || gelesen) return
    const timer = setTimeout(() => {
      setGelesen(true)
      addXp?.(XP.WORT_RICHTIG)
      merkeEinheit('wiederholung')
    }, 4000)
    return () => clearTimeout(timer)
  }, [aktiv, gelesen, addXp])

  /**
   * Den ganzen Text vorlesen, Absatz für Absatz.
   *
   * dialogAbspielen() wartet auf das Ende jeder Aufnahme – ohne das
   * würden alle Absätze gleichzeitig loslegen.
   */
  async function vorlesen() {
    if (laufRef.current) {
      laufRef.current.stop()
      laufRef.current = null
      setLaeuft(false)
      return
    }
    setLaeuft(true)
    const lauf = dialogAbspielen(karte.absaetze.map((a) => ({ es: a.es })))
    laufRef.current = lauf
    try {
      await lauf.fertig
    } catch {
      // still
    }
    laufRef.current = null
    setLaeuft(false)
  }

  /** Macht aus einem Absatz einzeln antippbare Wörter. */
  function alsWoerter(absatz) {
    return absatz.split(/(\s+)/).map((teil, i) => {
      if (!teil.trim()) return teil
      const status = vocab[wortSchluessel(teil)]?.status
      return (
        <span
          key={i}
          className={'lese-wort' + (status ? ' lese-wort-' + status : '')}
          onClick={() => onWort(teil, absatz)}
        >
          {teil}
        </span>
      )
    })
  }

  return (
    <article className={'feed-text farbe-' + (karte.farbe ?? 0) + (aktiv ? ' ist-aktiv' : '')}>
      <span className="haeppchen-marke">Wissen</span>
      <h2 className="feed-text-titel">
        {sprache === 'es' ? karte.titelEs : karte.titelDe}
      </h2>

      <button
        className={'feed-hoeren' + (laeuft ? ' hoeren-laeuft' : '')}
        onClick={vorlesen}
      >
        <span className="hoeren-kreis" aria-hidden="true">
          {laeuft ? '■' : '▶'}
        </span>
        {laeuft ? 'Stopp' : 'Vorlesen'}
      </button>

      <div className="feed-text-inhalt">
        {karte.absaetze.map((a, i) => (
          <p key={i} className="feed-absatz">
            {sprache === 'es' ? alsWoerter(a.es) : a.de}
          </p>
        ))}
      </div>

      {karte.merksatz && sprache === 'de' && (
        <p className="feed-merksatz">{karte.merksatz}</p>
      )}

      <div className="feed-sprachen" role="tablist">
        {[
          ['es', 'Español'],
          ['de', 'Deutsch'],
        ].map(([wert, name]) => (
          <button
            key={wert}
            role="tab"
            aria-selected={sprache === wert}
            className={'leser-sprache' + (sprache === wert ? ' leser-sprache-an' : '')}
            onClick={() => setSprache(wert)}
          >
            {name}
          </button>
        ))}
      </div>
    </article>
  )
}

/** Der Einstiegsknopf, der von der Startseite in den Feed führt. */
export function FeedTuer({ onOeffnen }) {
  const anzahl = feedKarten().length
  const gesehen = gesehene().size

  return (
    <button className="feed-tuer" onClick={onOeffnen}>
      <span className="feed-tuer-text">
        <b>Für dich</b>
        <span>
          {gesehen > 0
            ? `${anzahl - gesehen} neue Karten – Spanisch zum Durchwischen`
            : 'Spanisch zum Durchwischen – Grundlagen und Wissen'}
        </span>
      </span>
      <IconPfeil groesse={20} />
    </button>
  )
}

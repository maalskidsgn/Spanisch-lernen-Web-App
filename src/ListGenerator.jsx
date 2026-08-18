import { API_URL } from './api.js'
import { useState } from 'react'
import { newEntry } from './srs.js'
import { FREE_LIMIT, verbleibend, zaehleNutzung } from './limits.js'

// Vokabellisten mit KI erstellen: Thema eingeben (z.B. "Restaurant" oder
// "Fußball"), die KI schlägt 12 passende Vokabeln vor, du wählst aus.
export default function ListGenerator({ vocab, setVocab }) {
  const [thema, setThema] = useState('')
  const [fertigThema, setFertigThema] = useState('') // Thema der fertigen Liste
  const [laden, setLaden] = useState(false)
  const [fehler, setFehler] = useState('')
  const [liste, setListe] = useState(null) // Vorschläge mit Häkchen
  const [erfolg, setErfolg] = useState(false)
  const [uebrig, setUebrig] = useState(() => verbleibend('listeGen')) // freie Generierungen
  const [begruendung, setBegruendung] = useState('') // warum die KI diese Wörter wählte
  const [infoOffen, setInfoOffen] = useState(false) // Erklärung der Automatik

  /**
   * Holt eine Liste. Ohne Thema übernimmt die KI die Auswahl und
   * richtet sich nach dem, was schon im Trainer liegt.
   */
  async function generieren(e, automatisch = false) {
    e?.preventDefault()
    if ((!automatisch && !thema.trim()) || uebrig <= 0) return
    setLaden(true)
    setFehler('')
    setErfolg(false)
    setBegruendung('')
    try {
      const res = await fetch(API_URL + '/api/vokabelliste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Die schon gesammelten Wörter mitschicken: so kommen keine
        // Dopplungen zurück und die Liste passt zum eigenen Stand.
        body: JSON.stringify({
          thema: automatisch ? '' : thema.trim(),
          bekannt: Object.keys(vocab),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setListe(data.vokabeln.map((v) => ({ ...v, checked: true })))
      setBegruendung(data.begruendung || '')
      setFertigThema(data.thema || thema.trim())
      zaehleNutzung('listeGen') // eine kostenlose Generierung verbrauchen
      setUebrig(verbleibend('listeGen'))
    } catch (err) {
      setFehler(err.message)
    } finally {
      setLaden(false)
    }
  }

  // Ausgewählte Vokabeln in den Trainer übernehmen
  function uebernehmen() {
    setVocab((v) => {
      const copy = { ...v }
      for (const s of liste) {
        const key = s.wort.toLowerCase()
        if (!s.checked || copy[key]) continue
        copy[key] = {
          ...newEntry(s.uebersetzung, 'Liste: ' + fertigThema),
          status: 'lernen',
          beispiel: s.beispiel,
        }
      }
      return copy
    })
    setErfolg(true)
    setListe(null)
    setThema('')
  }

  // Kostenloses Kontingent aufgebraucht: Premium-Hinweis statt Formular
  if (uebrig <= 0 && !liste) {
    return (
      <div className="list-gen">
        <div className="plan-card plan-premium premium-teaser">
          <div className="plan-name">
            Premium <span className="plan-badge badge-soon">Bald verfügbar</span>
          </div>
          <p className="row-hint">
            Deine {FREE_LIMIT} kostenlosen Listen sind aufgebraucht – unbegrenzte
            KI-Vokabellisten kommen mit dem Premium-Abo.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="list-gen">
      {/* Gleicher Aufbau wie die anderen Bereiche: Überschrift,
          ein Satz zur Einordnung, dann der Inhalt */}
      <div className="bereich-kopf">
        <div className="kopf-zeile">
          <h2>Neue Wörter sammeln</h2>
          <span className="rest-zaehler" title="Kostenlose Listen diesen Monat">
            {uebrig}/{FREE_LIMIT}
          </span>
        </div>
        <p>
          Nenn ein Thema, und die KI stellt zwölf passende Wörter mit
          Beispielsätzen zusammen – ohne das, was du schon kennst.
        </p>
      </div>

      <form className="wort-form" onSubmit={generieren}>
        <input
          type="text"
          value={thema}
          onChange={(e) => setThema(e.target.value)}
          placeholder="z.B. Restaurant, Fußball, Arztbesuch…"
          disabled={laden}
          required
        />

        <div className="wort-vorschlaege">
          {['Restaurant', 'Reisen', 'Arbeit', 'Einkaufen'].map((v) => (
            <button
              key={v}
              type="button"
              className="vorschlag-chip"
              onClick={() => setThema(v)}
            >
              {v}
            </button>
          ))}
        </div>

        <button type="submit" className="btn wort-los" disabled={laden}>
          {laden ? (
            <>Stellt deine Liste zusammen<span className="studio-punkte" /></>
          ) : (
            'Liste erstellen'
          )}
        </button>
      </form>

      {/* ---------- Die Automatik ---------- */}
      <div className="automatik">
          <div className="automatik-kopf">
            <div className="automatik-titel">
              <b>Oder passend zu deinem Stand</b>
              <span>Die KI wählt selbst aus, was als Nächstes dran ist</span>
            </div>
            <button
              type="button"
              className="automatik-info"
              onClick={() => setInfoOffen(!infoOffen)}
              title="Wie funktioniert das?"
              aria-expanded={infoOffen}
            >
              {infoOffen ? '×' : '?'}
            </button>
          </div>

          {infoOffen && (
            <div className="automatik-erklaerung">
              <p>
                <b>Was passiert hier?</b> Deine gesammelten Wörter werden an die
                KI geschickt. Sie schaut sich an, welche Themen darin vorkommen
                und was noch fehlt – etwa passende Verben zu Wörtern, die du
                schon kennst.
              </p>
              <p>
                <b>Was du davon hast:</b> Keine Wiederholungen von Wörtern, die
                du längst hast. Und die Vorschläge bauen aufeinander auf, statt
                zufällig zu sein. Warum die KI genau diese Auswahl getroffen hat,
                erklärt sie dir direkt über der Liste.
              </p>
              <p className="automatik-klein">
                Du brauchst mindestens 5 gesammelte Wörter, damit die KI etwas
                erkennen kann. Aktuell hast du {Object.keys(vocab).length}.
              </p>
            </div>
          )}

          <button
            type="button"
            className="btn-outline automatik-los"
            onClick={(e) => generieren(e, true)}
            disabled={laden || Object.keys(vocab).length < 5}
          >
            {Object.keys(vocab).length < 5
              ? 'Sammle erst 5 Wörter'
              : 'Für mich auswählen lassen'}
          </button>
      </div>

      {erfolg && <p className="gen-success">Liste ist im Trainer! ✓</p>}

      {fehler === 'premium' ? (
        <div className="plan-card plan-premium premium-teaser">
          <div className="plan-name">
            Premium-Funktion <span className="plan-badge badge-soon">Bald verfügbar</span>
          </div>
          <p className="row-hint">
            Themen-Vokabellisten erstellt die KI – diese Funktion wird
            mit dem Premium-Abo freigeschaltet.
          </p>
        </div>
      ) : (
        fehler && <p className="error">{fehler}</p>
      )}

      {liste && (
        <div className="gen-list">
          {begruendung && (
            <div className="gen-begruendung">
              <span className="gen-begruendung-marke">Warum diese Wörter?</span>
              <p>{begruendung}</p>
            </div>
          )}
          <p className="gen-hint">
            Deine Liste zu „{fertigThema}“ – wähle aus, was in den Trainer soll:
          </p>
          {liste.map((s, i) => (
            <label key={i} className="gen-item">
              <input
                type="checkbox"
                checked={s.checked}
                onChange={() =>
                  setListe((l) =>
                    l.map((v, j) => (j === i ? { ...v, checked: !v.checked } : v))
                  )
                }
              />
              <span className="gen-word">{s.wort}</span>
              <span className="gen-translation">{s.uebersetzung}</span>
              {s.beispiel && <span className="gen-example">„{s.beispiel}“</span>}
            </label>
          ))}
          <div className="gen-actions">
            <button onClick={uebernehmen}>
              {liste.filter((s) => s.checked).length} Vokabeln übernehmen
            </button>
            <button className="btn-plain" onClick={() => setListe(null)}>
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

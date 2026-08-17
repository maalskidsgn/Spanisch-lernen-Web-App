import { useState, useEffect, useRef } from 'react'
import { API_URL } from './api.js'
import { db } from './supabase.js'

const NIVEAUS = ['A1', 'A2', 'B1', 'B2']

// Lesedauer grob schätzen: ~150 Wörter pro Minute
function leseMinuten(buch) {
  const woerter = (buch.kapitel ?? [])
    .map((k) => (k.text_es ?? '').split(/\s+/).length)
    .reduce((a, b) => a + b, 0)
  return Math.max(2, Math.round(woerter / 150) * 2) // beide Sprachen
}

/**
 * Bilinguale E-Books im Blinkist-Stil.
 *
 * Kurze Sachbuch-Zusammenfassungen, Kapitel für Kapitel lesbar,
 * unten umschaltbar zwischen Spanisch und Deutsch. Zwei Beispiel-
 * bücher sieht jeder; eigene erzeugt man sich per KI – im
 * kostenlosen Zugang drei pro Monat.
 */
export default function Ebooks({ onAddVocab }) {
  const [buecher, setBuecher] = useState(null)
  const [offenes, setOffenes] = useState(null)
  const [thema, setThema] = useState('')
  const [niveau, setNiveau] = useState('A2')
  const [laedt, setLaedt] = useState(false)
  const [fehler, setFehler] = useState('')
  const [kontingent, setKontingent] = useState(null)

  async function ladeBuecher() {
    const { data, error } = await db
      .from('ebooks')
      .select('*')
      .order('ist_beispiel', { ascending: false })
      .order('erstellt_am', { ascending: false })

    if (error) return setFehler(error.message)
    setBuecher(data)
  }

  async function ladeKontingent() {
    try {
      const { data } = await db.auth.getSession()
      const res = await fetch(API_URL + '/api/ebook/kontingent', {
        headers: { Authorization: `Bearer ${data.session?.access_token}` },
      })
      if (res.ok) setKontingent(await res.json())
    } catch {
      // nur Anzeige – Fehler hier sind unkritisch
    }
  }

  useEffect(() => {
    ladeBuecher()
    ladeKontingent()
  }, [])

  async function erstellen(e) {
    e.preventDefault()
    if (!thema.trim()) return

    setLaedt(true)
    setFehler('')
    try {
      const { data } = await db.auth.getSession()
      const res = await fetch(API_URL + '/api/ebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.session?.access_token}`,
        },
        body: JSON.stringify({ thema: thema.trim(), niveau }),
      })

      const antwort = await res.json()
      if (!res.ok) throw new Error(antwort.nachricht || antwort.error)

      setBuecher((b) => [antwort.buch, ...(b ?? [])])
      setKontingent((k) => (k ? { ...k, frei: antwort.frei } : k))
      setThema('')
      setOffenes(antwort.buch)
    } catch (f) {
      setFehler(f.message)
    } finally {
      setLaedt(false)
    }
  }

  async function loeschen(id) {
    if (!confirm('Dieses Buch wirklich löschen?')) return
    const { error } = await db.from('ebooks').delete().eq('id', id)
    if (error) return setFehler(error.message)
    setBuecher((b) => b.filter((x) => x.id !== id))
  }

  if (offenes) {
    return <BuchLeser buch={offenes} onZurueck={() => setOffenes(null)} onAddVocab={onAddVocab} />
  }

  const aufgebraucht = kontingent && kontingent.frei === 0

  return (
    <>
      <p className="intro">
        Kurze Sachbuch-Zusammenfassungen auf Spanisch – mit deutscher Fassung
        zum Umschalten. Ein Buch in etwa 10 Minuten.
      </p>

      {/* ---------- Das E-Book-Studio ---------- */}
      <div className="studio">
        <div className="studio-kopf">
          <span className="studio-icon">📖</span>
          <div className="studio-titel">
            <b>E-Book-Studio</b>
            <span>Dein Thema → kurzes zweisprachiges Buch in ~10 Sekunden</span>
          </div>
          {kontingent && (
            <span
              className={'studio-zaehler' + (aufgebraucht ? ' zaehler-leer' : '')}
              title="Kostenlose Bücher diesen Monat"
            >
              {kontingent.frei}/{kontingent.gesamt}
            </span>
          )}
        </div>

        <form className="studio-form" onSubmit={erstellen}>
          <label className="studio-feld">
            <span>Welches Buch soll die KI für dich schreiben?</span>
            <input
              type="text"
              value={thema}
              onChange={(e) => setThema(e.target.value)}
              placeholder="Thema oder Buchtitel, z.B. „Ikigai“ oder „Besser schlafen“"
              disabled={aufgebraucht || laedt}
              required
            />
          </label>

          <div className="studio-zeile">
            <div className="studio-optionen">
              <span className="studio-option-label">Niveau</span>
              {NIVEAUS.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={'chip' + (niveau === n ? ' chip-aktiv' : '')}
                  onClick={() => setNiveau(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <button type="submit" className="btn studio-los" disabled={laedt || aufgebraucht}>
              {laedt ? (
                <>Schreibt dein Buch<span className="studio-punkte" /></>
              ) : (
                '✨ Buch erstellen'
              )}
            </button>
          </div>

          {aufgebraucht && (
            <p className="studio-leer-hinweis">
              Dein Monatskontingent ist aufgebraucht – mit Premium schreibst du
              unbegrenzt viele Bücher.
            </p>
          )}
        </form>
      </div>

      {aufgebraucht && (
        <div className="plan-card plan-premium premium-teaser">
          <div className="plan-name">
            Unbegrenzt lesen <span className="plan-badge badge-soon">Premium</span>
          </div>
          <p className="row-hint">
            Mit Premium erstellst du so viele E-Books, wie du möchtest – zu jedem
            Thema und auf jedem Niveau.
          </p>
        </div>
      )}

      {fehler && <p className="error">{fehler}</p>}

      {!buecher && <p className="intro">Lade deine Bibliothek…</p>}

      {buecher && (
        <div className="ebook-grid">
          {buecher.map((b) => (
            <div key={b.id} className="ebook-karte" onClick={() => setOffenes(b)}>
              <div className={'ebook-cover ebook-cover-' + b.niveau}>
                <span className="ebook-cover-niveau">{b.niveau}</span>
                <span className="ebook-cover-titel">{b.titel}</span>
                <span className="ebook-cover-autor">{b.autor}</span>
                {b.ist_beispiel && <span className="ebook-marke">Beispiel</span>}
              </div>
              <div className="ebook-info">
                <div className="ebook-titel">{b.titel_de || b.titel}</div>
                <div className="ebook-meta">
                  {leseMinuten(b)} Min · {b.kapitel?.length ?? 0} Kapitel
                </div>
              </div>
              {!b.ist_beispiel && (
                <button
                  className="btn-delete ebook-loeschen"
                  title="Buch löschen"
                  onClick={(e) => { e.stopPropagation(); loeschen(b.id) }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

// ---------------------------------------------------------------
//  Der Leser im Blinkist-Stil
// ---------------------------------------------------------------
function BuchLeser({ buch, onZurueck, onAddVocab }) {
  const [sprache, setSprache] = useState('es') // 'es' | 'de'
  const [kapitelNr, setKapitelNr] = useState(0) // -1 wäre Vokabel-Seite
  const [uebernommen, setUebernommen] = useState(false)
  const textRef = useRef(null)

  const kapitel = buch.kapitel ?? []
  const aktuelles = kapitel[kapitelNr]
  const gesamtMin = leseMinuten(buch)
  const restMin = Math.max(
    1,
    Math.round(gesamtMin * (1 - kapitelNr / Math.max(1, kapitel.length)))
  )

  // Beim Kapitelwechsel nach oben springen
  useEffect(() => {
    textRef.current?.scrollTo?.(0, 0)
    window.scrollTo({ top: 0 })
  }, [kapitelNr])

  function vokabelnUebernehmen() {
    // Format, das der Trainer erwartet: { wort, uebersetzung, quelle }
    onAddVocab?.(
      (buch.vokabeln ?? []).map((v) => ({
        wort: v.es,
        uebersetzung: v.de,
        quelle: 'Buch: ' + buch.titel,
      }))
    )
    setUebernommen(true)
  }

  const fertig = kapitelNr >= kapitel.length // Vokabel-/Abschluss-Seite

  return (
    <div className="leser">
      {/* Kopf: zurück + Titel */}
      <div className="leser-kopf">
        <button className="btn-plain back-link" onClick={onZurueck}>
          ← Bibliothek
        </button>
        <div className="leser-kopf-titel">
          <b>{sprache === 'es' ? buch.titel : buch.titel_de || buch.titel}</b>
          <span>
            {buch.autor} · {gesamtMin} Min · {kapitel.length} Kapitel
          </span>
        </div>
      </div>

      {/* Der Lesetext */}
      {!fertig && aktuelles && (
        <div className="leser-text" ref={textRef} key={kapitelNr + sprache}>
          <div className="leser-label">
            {sprache === 'es' ? aktuelles.label_es : aktuelles.label_de}
          </div>
          <h1 className="leser-titel">
            {sprache === 'es' ? aktuelles.titel_es : aktuelles.titel_de}
          </h1>
          {(sprache === 'es' ? aktuelles.text_es : aktuelles.text_de)
            .split(/\n\n+/)
            .map((absatz, i) => (
              <p key={i} className="leser-absatz">{absatz}</p>
            ))}
        </div>
      )}

      {/* Abschluss-Seite mit den Vokabeln */}
      {fertig && (
        <div className="leser-text" ref={textRef}>
          <div className="leser-label">
            {sprache === 'es' ? '¡Enhorabuena!' : 'Geschafft!'}
          </div>
          <h1 className="leser-titel">
            {sprache === 'es'
              ? 'Las palabras más importantes'
              : 'Die wichtigsten Wörter'}
          </h1>
          <div className="buch-vokabeln">
            {(buch.vokabeln ?? []).map((v, i) => (
              <div key={i} className="buch-vokabel">
                <b>{v.es}</b>
                <span>{v.de}</span>
              </div>
            ))}
          </div>
          <button className="btn" onClick={vokabelnUebernehmen} disabled={uebernommen}>
            {uebernommen ? '✓ Im Trainer' : '＋ Alle in den Vokabeltrainer'}
          </button>
        </div>
      )}

      {/* Fuß: Sprachwahl, Fortschritt, Navigation */}
      <div className="leser-fuss">
        <div className="leser-sprachen">
          <button
            className={'sprach-knopf' + (sprache === 'es' ? ' sprach-aktiv' : '')}
            onClick={() => setSprache('es')}
          >
            Spanisch
          </button>
          <button
            className={'sprach-knopf sprach-navy' + (sprache === 'de' ? ' sprach-aktiv' : '')}
            onClick={() => setSprache('de')}
          >
            Deutsch
          </button>
        </div>

        <div className="leser-fortschritt">
          <div className="leser-balken">
            {kapitel.map((_, i) => (
              <span
                key={i}
                className={'balken-teil' + (i <= kapitelNr - 1 || fertig ? ' balken-voll' : i === kapitelNr ? ' balken-halb' : '')}
                onClick={() => setKapitelNr(i)}
              />
            ))}
          </div>
          <span className="leser-stand">
            {fertig
              ? '✓'
              : `${kapitelNr + 1}/${kapitel.length} · Noch ${restMin} Min`}
          </span>
        </div>

        <div className="leser-pfeile">
          <button
            className="btn-outline pfeil"
            disabled={kapitelNr === 0}
            onClick={() => setKapitelNr((n) => n - 1)}
          >
            ←
          </button>
          <button
            className="btn pfeil"
            disabled={fertig}
            onClick={() => setKapitelNr((n) => n + 1)}
          >
            {kapitelNr === kapitel.length - 1 ? 'Fertig' : '→'}
          </button>
        </div>
      </div>
    </div>
  )
}

export { leseMinuten }

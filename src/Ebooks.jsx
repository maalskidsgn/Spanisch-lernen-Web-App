import { useState, useEffect, useRef } from 'react'
import { API_URL } from './api.js'
import { db } from './supabase.js'

const NIVEAUS = ['A1', 'A2', 'B1', 'B2']

/** Vereinheitlicht ein Wort so, wie es im Vokabeltrainer abgelegt ist. */
function schluessel(wort) {
  return wort.toLowerCase().replace(/[^a-záéíóúüñ]/gi, '')
}

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
export default function Ebooks({ onAddVocab, vocab = {} }) {
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
    return (
      <BuchLeser
        buch={offenes}
        onZurueck={() => setOffenes(null)}
        onAddVocab={onAddVocab}
        vocab={vocab}
      />
    )
  }

  const aufgebraucht = kontingent && kontingent.frei === 0

  return (
    <>
      {/* ============ 1. BUCH ERSTELLEN ============ */}
      <section className="bereich">
        <div className="bereich-kopf">
          <div className="kopf-zeile">
            <h2>Buch schreiben lassen</h2>
            {kontingent && (
              <span
                className={'rest-zaehler' + (aufgebraucht ? ' zaehler-leer' : '')}
                title="Kostenlose Bücher diesen Monat"
              >
                {kontingent.frei}/{kontingent.gesamt}
              </span>
            )}
          </div>
          <p>
            Nenn ein Thema, und die KI schreibt eine kurze Zusammenfassung auf
            Spanisch – mit deutscher Fassung zum Umschalten.
          </p>
        </div>

        <form className="wort-form" onSubmit={erstellen}>
          <input
            type="text"
            value={thema}
            onChange={(e) => setThema(e.target.value)}
            placeholder="Thema oder Buchtitel, z.B. „Ikigai“ oder „Besser schlafen“"
            disabled={aufgebraucht || laedt}
            required
          />

          <div className="niveau-zeile">
            <span className="niveau-label">Niveau</span>
            {NIVEAUS.map((n) => (
              <button
                key={n}
                type="button"
                className={'vorschlag-chip' + (niveau === n ? ' chip-gewaehlt' : '')}
                onClick={() => setNiveau(n)}
              >
                {n}
              </button>
            ))}
          </div>

          <button type="submit" className="btn wort-los" disabled={laedt || aufgebraucht}>
            {laedt ? (
              <>Schreibt dein Buch<span className="studio-punkte" /></>
            ) : (
              'Buch erstellen'
            )}
          </button>

          {aufgebraucht && (
            <p className="studio-leer-hinweis">
              Dein Monatskontingent ist aufgebraucht – mit Premium schreibst du
              unbegrenzt viele Bücher.
            </p>
          )}
        </form>
      </section>

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

      {/* ============ 2. DEINE BÜCHER ============ */}
      <section className="bereich">
        <div className="bereich-kopf">
          <h2>Deine Bücher</h2>
          <p>
            {buecher
              ? `${buecher.length} zum Lesen – tippe eins an.`
              : 'Wird geladen …'}
          </p>
        </div>

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
      </section>
    </>
  )
}

// ---------------------------------------------------------------
//  Der Leser im Blinkist-Stil
// ---------------------------------------------------------------
function BuchLeser({ buch, onZurueck, onAddVocab, vocab = {} }) {
  const [sprache, setSprache] = useState('es') // 'es' | 'de'
  const [kapitelNr, setKapitelNr] = useState(0) // -1 wäre Vokabel-Seite
  const [uebernommen, setUebernommen] = useState(false)
  const [wort, setWort] = useState(null) // angetipptes Wort { text, de, laedt }
  const textRef = useRef(null)

  // Beim Lesen die App-Navigation ausblenden – nur das Buch zählt
  useEffect(() => {
    document.body.classList.add('liest-buch')
    return () => document.body.classList.remove('liest-buch')
  }, [])

  /** Ein angetipptes Wort übersetzen lassen. */
  async function wortAntippen(rohesWort) {
    const sauber = rohesWort.replace(/[«».,;:¿?¡!()"—…]/g, '').trim()
    if (!sauber) return

    setWort({ text: sauber, de: '', laedt: true })
    try {
      const res = await fetch(API_URL + '/api/translate?q=' + encodeURIComponent(sauber))
      const daten = await res.json()
      setWort({ text: sauber, de: daten.translation || '', laedt: false })
    } catch {
      setWort({ text: sauber, de: '', laedt: false })
    }
  }

  /** Ein einzelnes Wort in den Trainer legen. */
  function wortSammeln() {
    if (!wort?.text) return
    onAddVocab?.([
      { wort: wort.text, uebersetzung: wort.de, quelle: 'Buch: ' + buch.titel },
    ])
    setWort(null)
  }

  /**
   * Macht aus einem Absatz einzeln antippbare Wörter.
   * Nur im spanischen Text – im deutschen wäre es sinnlos.
   */
  function alsWoerter(absatz) {
    return absatz.split(/(\s+)/).map((teil, i) => {
      if (!teil.trim()) return teil
      // Steht das Wort schon im Trainer? Dann wird es eingefärbt.
      const status = vocab[schluessel(teil)]?.status
      return (
        <span
          key={i}
          className={'lese-wort' + (status ? ' lese-wort-' + status : '')}
          onClick={() => wortAntippen(teil)}
          title={status ? 'Im Vokabeltrainer' : undefined}
        >
          {teil}
        </span>
      )
    })
  }

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
              <p key={i} className="leser-absatz">
                {sprache === 'es' ? alsWoerter(absatz) : absatz}
              </p>
            ))}
          {sprache === 'es' && (
            <p className="lese-tipp">
              Tipp: Tippe ein Wort an, um es zu übersetzen und zu sammeln.
            </p>
          )}
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

      {/* Angetipptes Wort: Übersetzung und ab in den Trainer */}
      {wort && (
        <div className="wortkarte-hintergrund" onClick={() => setWort(null)}>
          <div className="wortkarte" onClick={(e) => e.stopPropagation()}>
            <div className="wortkarte-wort">
              {wort.text}
              {vocab[schluessel(wort.text)] && (
                <span className="wortkarte-marke">✓ im Trainer</span>
              )}
            </div>
            <div className="wortkarte-de">
              {wort.laedt ? 'Übersetze …' : wort.de || 'Keine Übersetzung gefunden'}
            </div>
            <div className="wortkarte-knoepfe">
              <button className="btn-outline" onClick={() => setWort(null)}>
                Schließen
              </button>
              <button className="btn" onClick={wortSammeln} disabled={wort.laedt}>
                ＋ Sammeln
              </button>
            </div>
          </div>
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

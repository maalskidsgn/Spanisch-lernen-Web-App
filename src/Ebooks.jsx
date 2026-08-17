import { useState, useEffect } from 'react'
import { API_URL } from './api.js'
import { db } from './supabase.js'

const NIVEAUS = ['A1', 'A2', 'B1', 'B2']

/**
 * Bilinguale E-Books: links Spanisch, rechts Deutsch.
 *
 * Zwei Beispielbücher sieht jeder Nutzer. Eigene Bücher lässt man sich
 * zu einem beliebigen Thema erzeugen – im kostenlosen Zugang drei
 * Stück pro Monat.
 */
export default function Ebooks({ onAddVocab }) {
  const [buecher, setBuecher] = useState(null)
  const [offenes, setOffenes] = useState(null)
  const [thema, setThema] = useState('')
  const [niveau, setNiveau] = useState('A2')
  const [laedt, setLaedt] = useState(false)
  const [fehler, setFehler] = useState('')
  const [kontingent, setKontingent] = useState(null) // { frei, gesamt }

  // ---------- Laden ----------
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
      // Kontingent ist nur eine Anzeige – Fehler hier sind nicht schlimm
    }
  }

  useEffect(() => {
    ladeBuecher()
    ladeKontingent()
  }, [])

  // ---------- Erzeugen ----------
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

  // ---------- Ein geöffnetes Buch ----------
  if (offenes) {
    return <BuchLeser buch={offenes} onZurueck={() => setOffenes(null)} onAddVocab={onAddVocab} />
  }

  const aufgebraucht = kontingent && kontingent.frei === 0

  return (
    <>
      <p className="intro">
        Zweisprachige Geschichten – spanischer Text mit deutscher Übersetzung
        direkt daneben. Lesen, verstehen, Vokabeln mitnehmen.
      </p>

      {/* ---------- Neues Buch erzeugen ---------- */}
      <form className="ebook-form" onSubmit={erstellen}>
        <input
          type="text"
          value={thema}
          onChange={(e) => setThema(e.target.value)}
          placeholder="Worum soll es gehen? z.B. „Ein Wochenende in Sevilla“"
          disabled={aufgebraucht}
          required
        />
        <div className="ebook-form-zeile">
          <div className="ebook-niveaus">
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
          <button type="submit" className="btn" disabled={laedt || aufgebraucht}>
            {laedt ? 'Schreibt…' : '✨ Buch erstellen'}
          </button>
        </div>
      </form>

      {kontingent && (
        <p className={'kontingent' + (aufgebraucht ? ' kontingent-leer' : '')}>
          {aufgebraucht
            ? `Dein Monatskontingent ist aufgebraucht (${kontingent.gesamt} Bücher).`
            : `Noch ${kontingent.frei} von ${kontingent.gesamt} Büchern diesen Monat`}
        </p>
      )}

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

      {/* ---------- Die Bücher ---------- */}
      {!buecher && <p className="intro">Lade deine Bibliothek…</p>}

      {buecher && (
        <div className="ebook-grid">
          {buecher.map((b) => (
            <div key={b.id} className="ebook-karte" onClick={() => setOffenes(b)}>
              <div className={'ebook-cover ebook-cover-' + b.niveau}>
                <span className="ebook-cover-niveau">{b.niveau}</span>
                <span className="ebook-cover-symbol">📖</span>
                {b.ist_beispiel && <span className="ebook-marke">Beispiel</span>}
              </div>
              <div className="ebook-info">
                <div className="ebook-titel">{b.titel}</div>
                <div className="ebook-meta">
                  {b.kapitel?.length ?? 0} Absätze · {b.vokabeln?.length ?? 0} Vokabeln
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
//  Der Leser
// ---------------------------------------------------------------
function BuchLeser({ buch, onZurueck, onAddVocab }) {
  const [zeigeDe, setZeigeDe] = useState(true)
  const [uebernommen, setUebernommen] = useState(false)

  function vokabelnUebernehmen() {
    onAddVocab?.(
      (buch.vokabeln ?? []).map((v) => ({ es: v.es, de: v.de })),
      'Buch: ' + buch.titel
    )
    setUebernommen(true)
  }

  return (
    <div className="buch-leser">
      <button className="btn-plain back-link" onClick={onZurueck}>
        ← Zurück zu den Büchern
      </button>

      <div className="buch-kopf">
        <h1>{buch.titel}</h1>
        <p className="buch-untertitel">
          {buch.autor} · Niveau {buch.niveau}
        </p>
      </div>

      <div className="buch-leiste">
        <label className="schalter">
          <input
            type="checkbox"
            checked={zeigeDe}
            onChange={(e) => setZeigeDe(e.target.checked)}
          />
          <span>Übersetzung anzeigen</span>
        </label>
        <button className="btn-small" onClick={vokabelnUebernehmen} disabled={uebernommen}>
          {uebernommen ? '✓ Im Trainer' : '＋ Vokabeln übernehmen'}
        </button>
      </div>

      <div className="buch-text">
        {(buch.kapitel ?? []).map((absatz, i) => (
          <div key={i} className="buch-absatz">
            <p className="absatz-es">{absatz.es}</p>
            {zeigeDe && <p className="absatz-de">{absatz.de}</p>}
          </div>
        ))}
      </div>

      {buch.vokabeln?.length > 0 && (
        <>
          <h2 className="buch-vokabel-titel">Wichtige Wörter</h2>
          <div className="buch-vokabeln">
            {buch.vokabeln.map((v, i) => (
              <div key={i} className="buch-vokabel">
                <b>{v.es}</b>
                <span>{v.de}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

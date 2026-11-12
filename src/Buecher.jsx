// Buch-Generator im Blinkist-Stil (Manuel, 10.11.2026):
// Echte Bücher nach Themen wählen (oder eigenen Titel / Text) → 8 Kapitel,
// jeder Absatz in der Lernsprache und in der Muttersprache. Übersichtsseite
// mit Inhaltsverzeichnis, Kapitel im weißen Lese-Container, Wörter antippen
// → Trainer. Davaigo: Lautschrift als eigener Schalter (nur A1).
// Diese Datei ist in Habloo und Davaigo gleich – nur der Block
// „Was je App anders ist“ unterscheidet sich.
import { useEffect, useState } from 'react'
import GratisHinweis, { zurKasse } from './GratisHinweis.jsx'
import { API_URL, istApp } from './api.js'
import { usePremium, TESTPHASE_ALLES_FREI } from './premium.js'
import { loginKopf, kontingentLeer, zaehleNutzung } from './limits.js'
import { sprache, useTexte } from './sprache.js'
import { XP } from './gamification.js'
import { erfolgston } from './erfolgston.js'
import { BIBLIOTHEK } from './bibliothekBuecher.js'
import { THEMEN, KLASSIKER } from './buchKatalog.js'
import KiMelden from './KiMelden.jsx'

export { BIBLIOTHEK }

// Bibliotheksbuch laden (liegt als JSON in public/buecher, je UI-Sprache)
const GELADEN = new Map()
export async function ladeBibliotheksbuch(eintrag) {
  const datei = `/buecher/${eintrag.slug}.${sprache() === 'en' ? 'en' : 'de'}.json`
  if (!GELADEN.has(datei)) {
    const r = await fetch(datei)
    if (!r.ok) throw new Error('Buch konnte nicht geladen werden.')
    GELADEN.set(datei, await r.json())
  }
  return GELADEN.get(datei)
}

// ---- Was je App anders ist (Davaigo: 'ru', Русский, Lautschrift bei A1) ----
const L1 = 'es' // Feldname der Lernsprache in den Buchdaten
const LERN_NAME = 'Español'
const LAUTSCHRIFT = null // (text, sprache) => Text in lateinischen Buchstaben
const LERN_DE = 'Spanisch', LERN_EN = 'Spanish'

const NIVEAUS = ['A1', 'A2', 'B1', 'B2', 'C1']
const TEXT_MAX = 100000 // wie GRENZEN.buchtextZeichen im Server

const T = {
  de: {
    buehne1: `Lerne ${LERN_DE} mit`, buehne2: 'echten Büchern',
    vorteil1: 'Kapitel wie bei Blinkist', vorteil2: `${LERN_DE} & Deutsch`, vorteil3: 'Wort antippen = übersetzt', vorteilLaut: 'Lautschrift bei A1',
    titel: 'Eigenes Buch erstellen',
    unter: `Wähle ein echtes Buch – du liest es in 8 Kapiteln auf ${LERN_DE} und Deutsch.`,
    klassiker: 'Klassiker',
    eigenes: 'Oder ein anderes Buch',
    platz: 'Titel und Autor, z. B. „Ikigai – Héctor García“',
    textAuf: '+ Text aus dem Buch einfügen (optional)',
    textZu: 'Text entfernen',
    textPlatz: 'Ein Kapitel, mehrere Seiten oder das ganze Buch einfügen …',
    textInfo: (n) => `${n.toLocaleString('de-DE')} von 100.000 Zeichen · nur für die Zusammenfassung, wird nicht gespeichert`,
    niveau: 'Dein Niveau',
    los: 'Zusammenfassung erstellen',
    losTitel: (t) => `„${t}“ zusammenfassen`,
    losKurz: 'Zusammenfassen', ausgewaehlt: 'Ausgewählt', eigenerText: 'Dein eingefügter Text', eigenesLink: '+ Anderes Buch eingeben',
    laedt: 'Liest das Buch und schreibt 8 Kapitel …',
    dauer: 'Das dauert etwa 20–40 Sekunden.',
    regal: 'Deine Bücher',
    bibliothek: 'Kostenlose E-Books', bibUnter: '6 Bücher – gratis für alle',
    nurPremium: 'Gratis liest du die 6 Bücher der Bibliothek. Eigene Bücher – jedes Buch, auf deinem Niveau – erstellst du mit Premium (bis zu 50 im Monat).',
    premiumKnopf: 'Mit Premium erstellen',
    beispiel: 'Beispiel',
    kapitel: 'Kapitel',
    einf: 'Einführung', fazit: 'Fazit', idee: (n) => `Kernidee ${n}`,
    kern: 'Kernaussage',
    woerter: 'Wörter aus diesem Kapitel',
    alleRein: (n) => `${n} Wörter in den Trainer`,
    drin: 'Im Trainer ✓',
    einzeln: 'Tippe ein Wort an, um es in den Trainer zu legen.',
    weiter: 'Weiter', zurueck: 'Zurück', schliessen: 'Schließen', fertig: 'Fertig', start: 'Lesen starten', inhalt: 'Inhalt', uebersicht: 'Übersicht',
    geschafft: 'Buch geschafft!',
    gesamt: (n) => `Alle ${n} Wörter in den Trainer`,
    beide: 'Beide', mutter: 'Deutsch', laut: 'Lautschrift',
    unbekannt: 'Dieses Buch kennt die KI nicht genau. Füge beim Erstellen Text aus dem Buch ein, dann wird die Zusammenfassung genau.',
    loeschen: 'Buch löschen',
    tipp: 'Tipp: Tippe auf ein Wort, um es zu übersetzen und zu sammeln.',
    kenne: 'Kenne ich', lernen: '＋ Lernen', uebersetze: 'Übersetze …', keine: 'Keine Übersetzung gefunden',
    min: (n) => `${n} Min.`,
    woerterImBuch: (n) => `${n} Wörter`,
  },
  en: {
    buehne1: `Learn ${LERN_EN} with`, buehne2: 'real books',
    vorteil1: 'Chapters like Blinkist', vorteil2: `${LERN_EN} & English`, vorteil3: 'Tap a word = translated', vorteilLaut: 'Latin letters at A1',
    titel: 'Create your own book',
    unter: `Pick a real book – you read it in 8 chapters in ${LERN_EN} and English.`,
    klassiker: 'Classics',
    eigenes: 'Or another book',
    platz: 'Title and author, e.g. “Ikigai – Héctor García”',
    textAuf: '+ Paste text from the book (optional)',
    textZu: 'Remove text',
    textPlatz: 'Paste a chapter, several pages or the whole book …',
    textInfo: (n) => `${n.toLocaleString('en-GB')} of 100,000 characters · only used for the summary, never stored`,
    niveau: 'Your level',
    los: 'Create summary',
    losTitel: (t) => `Summarise “${t}”`,
    losKurz: 'Summarise', ausgewaehlt: 'Selected', eigenerText: 'Your pasted text', eigenesLink: '+ Enter another book',
    laedt: 'Reading the book and writing 8 chapters …',
    dauer: 'This takes about 20–40 seconds.',
    regal: 'Your books',
    bibliothek: 'Free e-books', bibUnter: '6 books – free for everyone',
    nurPremium: 'Free: read the 6 books in the library. Create your own – any book, at your level – with Premium (up to 50 a month).',
    premiumKnopf: 'Create with Premium',
    beispiel: 'Example',
    kapitel: 'chapters',
    einf: 'Introduction', fazit: 'Conclusion', idee: (n) => `Key idea ${n}`,
    kern: 'Key takeaway',
    woerter: 'Words from this chapter',
    alleRein: (n) => `Add ${n} words to trainer`,
    drin: 'In trainer ✓',
    einzeln: 'Tap a word to add it to your trainer.',
    weiter: 'Next', zurueck: 'Back', schliessen: 'Close', fertig: 'Done', start: 'Start reading', inhalt: "What's inside", uebersicht: 'Overview',
    geschafft: 'Book finished!',
    gesamt: (n) => `Add all ${n} words to trainer`,
    beide: 'Both', mutter: 'English', laut: 'Latin letters',
    unbekannt: "The AI doesn't know this book well. Paste some text from the book when creating it for an accurate summary.",
    loeschen: 'Delete book',
    tipp: 'Tip: tap a word to translate and save it.',
    kenne: 'I know it', lernen: '＋ Learn', uebersetze: 'Translating …', keine: 'No translation found',
    min: (n) => `${n} min`,
    woerterImBuch: (n) => `${n} words`,
  },
}
const txt = () => T[sprache() === 'en' ? 'en' : 'de']

// Flache Cover-Farben [Fläche, Kante] – je Titel immer dieselbe
const COVER = [['#ff9a5c', '#d96b2c'], ['#4d9cf5', '#2a6fc4'], ['#4ccb7f', '#2a9a5a'], ['#8a6cf5', '#5f43c9'], ['#f06aa0', '#c24277'], ['#33c2a3', '#1d8f78'], ['#ffb02e', '#d98a00']]
function coverFarbe(titel = '') {
  let h = 0
  for (const z of titel) h = (h * 31 + z.charCodeAt(0)) >>> 0
  return COVER[h % COVER.length]
}

/** Alte Bücher (nur Absätze) in das Kapitel-Format bringen. */
export function alsKapitelBuch(buch) {
  if (buch.kapitel?.length) return buch
  return {
    ...buch,
    kapitel: [{ titel: { [L1]: buch.titel, de: buch.titel_de || buch.titel }, absaetze: buch.absaetze ?? [], kern: null, vokabeln: buch.vokabeln ?? [] }],
  }
}

export function leseMinuten(buch) {
  const woerter = (buch.kapitel ?? []).flatMap((k) => k.absaetze ?? []).map((a) => (a[L1] || '').split(/\s+/).length).reduce((a, b) => a + b, 0)
  return Math.max(3, Math.round(woerter / 110))
}

// ---------------------------------------------------------------
//  Entdecken + Erstellen
// ---------------------------------------------------------------
export function BuchFormular({ onFertig }) {
  useTexte()
  const L = txt()
  const en = sprache() === 'en'
  const themen = [{ id: 'klassiker', de: L.klassiker, en: L.klassiker, buecher: KLASSIKER[L1] ?? [] }, ...THEMEN]
  const [thema, setThema] = useState('gewohnheiten')
  const [gewaehlt, setGewaehlt] = useState(null) // Buch aus dem Katalog
  const [titel, setTitel] = useState('')
  const [text, setText] = useState('')
  const [textOffen, setTextOffen] = useState(false)
  const [eigenesOffen, setEigenesOffen] = useState(false)
  const [niveau, setNiveau] = useState('A2')
  const [laedt, setLaedt] = useState(false)
  const [fehler, setFehler] = useState('')
  const { premium } = usePremium()
  const darf = premium || TESTPHASE_ALLES_FREI

  const aktuell = themen.find((t) => t.id === thema) ?? themen[0]
  const katalogTitel = gewaehlt ? (en ? gewaehlt.en : gewaehlt.de) : ''
  const anfrageTitel = gewaehlt ? `${katalogTitel} – ${gewaehlt.autor}` : eigenesOffen ? titel.trim() : ''
  const bereit = Boolean(anfrageTitel) || (eigenesOffen && textOffen && text.trim().length >= 400)

  async function erstellen(e) {
    e.preventDefault()
    if (!bereit || laedt) return
    setLaedt(true)
    setFehler('')
    try {
      const res = await fetch(API_URL + '/api/buch', {
        method: 'POST',
        headers: await loginKopf({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ titel: anfrageTitel, text: eigenesOffen && textOffen ? text : '', niveau, sprache: sprache() }),
      })
      const daten = await res.json()
      if (res.status === 402) kontingentLeer()
      if (!res.ok) throw new Error(daten.nachricht || daten.error)
      zaehleNutzung()
      setTitel('')
      setText('')
      setTextOffen(false)
      setGewaehlt(null)
      setEigenesOffen(false)
      onFertig({ ...daten, id: 'b' + Date.now(), erstellt: Date.now() })
    } catch (err) {
      setFehler(err.message)
    } finally {
      setLaedt(false)
    }
  }

  // Gratis in den Store-Apps: kein Verweis auf eine Kasse – nur die Bibliothek
  if (!darf && istApp) return null

  return (
    <section className={'engine engine-toon bg-buehne' + (darf ? '' : ' bg-gesperrt')}>
      {/* Toon-Bühne wie bei den Videos (Entwurf A, 10.11.2026): schwebende Bücher */}
      <div className="et-flug" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => <span key={i} className={'bg-flug bf' + i} />)}
        <i className="et-funke et-f1">✦</i>
        <i className="et-funke et-f2">✦</i>
      </div>

      <h2 className="engine-titel">
        {L.buehne1} <span>{L.buehne2}</span>
      </h2>
      <p className="engine-text">{L.unter}</p>

      <ul className="engine-features">
        <li><b>8</b> {L.vorteil1}</li>
        <li><b>{L1.toUpperCase()}</b> {L.vorteil2}</li>
        {LAUTSCHRIFT ? <li><b>Aa</b> {L.vorteilLaut}</li> : <li><b>↻</b> {L.vorteil3}</li>}
      </ul>

      <GratisHinweis art="buecher" />

      <div className="bg-themen" role="tablist">
        {themen.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={thema === t.id} className={thema === t.id ? 'an' : ''} onClick={() => setThema(t.id)}>
            {en ? t.en : t.de}
          </button>
        ))}
      </div>

      <div className="bg-katalog">
        {aktuell.buecher.map((b) => {
          const an = gewaehlt === b
          const t = en ? b.en : b.de
          return (
            <button key={b.de} type="button" className={'bg-katalog-buch' + (an ? ' an' : '')} aria-pressed={an} onClick={() => { setGewaehlt(an ? null : b); setEigenesOffen(false) }} disabled={laedt}>
              <BuchCover buch={{ titel: t, autor: b.autor }} mini />
              <span className="bg-katalog-text"><b>{t}</b><small>{b.autor}</small></span>
              <span className={'bg-haken' + (an ? ' an' : '')} aria-hidden="true">{an ? '✓' : '+'}</span>
            </button>
          )
        })}
      </div>

      {/* Eigenes Buch: erst auf Wunsch aufklappen – hält die Karte ruhig */}
      {eigenesOffen ? (
        <form className="bg-eigenes" onSubmit={erstellen}>
          <div className="bg-eigenes-kopf">
            <label className="bg-feldname" htmlFor="bg-titel">{L.eigenes}</label>
            <button type="button" className="bg-link" onClick={() => { setEigenesOffen(false); setTitel(''); setText(''); setTextOffen(false) }}>{L.schliessen}</button>
          </div>
          <input id="bg-titel" type="text" value={titel} onChange={(e) => setTitel(e.target.value)} placeholder={L.platz} maxLength={160} disabled={laedt} autoFocus />
          {textOffen ? (
            <div className="bg-text">
              <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, TEXT_MAX))} placeholder={L.textPlatz} rows={5} disabled={laedt} />
              <div className="bg-text-fuss">
                <small>{L.textInfo(text.length)}</small>
                <button type="button" className="bg-link" onClick={() => { setText(''); setTextOffen(false) }}>{L.textZu}</button>
              </div>
            </div>
          ) : (
            <button type="button" className="bg-link" onClick={() => setTextOffen(true)}>{L.textAuf}</button>
          )}
        </form>
      ) : (
        <button type="button" className="bg-link bg-eigenes-link" onClick={() => { setEigenesOffen(true); setGewaehlt(null) }}>{L.eigenesLink}</button>
      )}

      {/* Auswahl-Leiste: erscheint erst, wenn ein Buch feststeht */}
      {bereit && (
        <form className="bg-auswahl" onSubmit={erstellen}>
          <div className="bg-auswahl-buch">
            <BuchCover buch={{ titel: katalogTitel || titel || '…', autor: '' }} mini />
            <span><small>{L.ausgewaehlt}</small><b>{katalogTitel || titel.trim() || L.eigenerText}</b></span>
          </div>
          <div className="bg-auswahl-niveau" role="radiogroup" aria-label={L.niveau}>
            {NIVEAUS.map((n) => (
              <button key={n} type="button" role="radio" aria-checked={niveau === n} className={niveau === n ? 'an' : ''} onClick={() => setNiveau(n)} disabled={laedt}>{n}</button>
            ))}
          </div>
          {darf ? (
            <button type="submit" className="bg-los" disabled={laedt}>{laedt ? L.laedt : L.losKurz}</button>
          ) : (
            <button type="button" className="gh-knopf bg-premium-knopf" onClick={zurKasse}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor"><path d="M3 8l4.5 3.5L12 5l4.5 6.5L21 8l-2 11H5L3 8z" /></svg>
              {L.premiumKnopf}
            </button>
          )}
          {laedt && <p className="bg-dauer">{L.dauer}</p>}
        </form>
      )}
      {fehler && <p className="error">{fehler}</p>}
    </section>
  )
}

// ---------------------------------------------------------------
//  Cover + Regal
// ---------------------------------------------------------------
export function BuchCover({ buch, klein = false, mini = false }) {
  const [flaeche, kante] = coverFarbe(buch.titel)
  return (
    <span className={'bg-cover' + (klein ? ' bg-cover-klein' : '') + (mini ? ' bg-cover-mini' : '')} style={{ '--cf': flaeche, '--ck': kante }}>
      <span className="bg-cover-ruecken" />
      {buch.niveau && <span className="bg-cover-niveau">{buch.niveau}</span>}
      <b>{buch.titel}</b>
      {!mini && <small>{buch.autor}</small>}
    </span>
  )
}

// Bücher als Zeilen – dieselben Bausteine wie die Video-Zeilen der Mediathek
// (video-zeile / zeile-bild / zeile-text / zeile-play), damit beide Bereiche
// gleich aufgebaut sind (Manuel, 10.11.2026).
export function BuchZeilen({ buecher, onOeffnen, onLoeschen }) {
  useTexte()
  const L = txt()
  const en = sprache() === 'en'
  return (
    <div className="video-zeilen">
      {buecher.map((b) => (
        <div key={b.id} className="bg-zeile">
          <button type="button" className="video-zeile" onClick={() => onOeffnen(b)}>
            <span className="zeile-bild bg-zeile-bild"><BuchCover buch={{ titel: b.titel, autor: b.autor }} mini /></span>
            <span className="zeile-text">
              {b.niveau && <span className={'niveau-badge niveau-' + b.niveau}>{b.niveau}</span>}
              <span className="zeile-titel">{(en ? b.titel_en : b.titel_de) || b.titel_de || b.titel}</span>
              <span className="zeile-kanal">{b.autor}</span>
              <span className="zeile-dauer">{b.kapitelZahl ?? b.kapitel?.length ?? 1} {L.kapitel} · {L.min(b.minuten ?? leseMinuten(alsKapitelBuch(b)))}</span>
            </span>
            <span className="zeile-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5.5C7 4.3 10 4.6 12 6.5c2-1.9 5-2.2 8-1V19c-3-1.2-6-.9-8 1-2-1.9-5-2.2-8-1z" /><path d="M12 6.5V20" /></svg>
            </span>
          </button>
          {onLoeschen && (
            <button type="button" className="bg-zeile-weg" title={L.loeschen} aria-label={L.loeschen} onClick={() => onLoeschen(b.id)}>✕</button>
          )}
        </div>
      ))}
    </div>
  )
}

// Niveau-Filter über der Bibliothek – wie die Themen-Leiste bei „Für dich“
export function NiveauFilter({ buecher, wert, onWert }) {
  useTexte()
  const en = sprache() === 'en'
  const stufen = [...new Set(buecher.map((b) => b.niveau).filter(Boolean))].sort()
  if (stufen.length < 2) return null
  return (
    <div className="themen-leiste">
      {['alle', ...stufen].map((n) => (
        <button key={n} type="button" className={'thema' + (wert === n ? ' thema-aktiv' : '')} onClick={() => onWert(n)}>
          {n === 'alle' ? (en ? 'All' : 'Alle') : n}
        </button>
      ))}
    </div>
  )
}

export function BuchRegal({ buecher, onOeffnen, onLoeschen, bibliothek = false, nackt = false }) {
  useTexte()
  const L = txt()
  const en = sprache() === 'en'
  return (
    <section className={(nackt ? '' : 'bg-karte ') + 'bg-regal' + (bibliothek ? ' bg-bibliothek' : '')}>
      {!nackt && (
        <div className="bg-regal-kopf">
          <h3>{bibliothek ? L.bibliothek : L.regal}</h3>
          {bibliothek && <span>{L.bibUnter}</span>}
        </div>
      )}
      <div className="bg-regal-reihe">
        {buecher.map((b) => (
          <div key={b.id} className="bg-regal-buch">
            <button type="button" className="bg-regal-knopf" onClick={() => onOeffnen(b)}>
              <BuchCover buch={b} />
              <span className="bg-regal-titel">{(en ? b.titel_en : b.titel_de) || b.titel_de || b.titel}</span>
              <span className="bg-regal-meta">
                {b.kapitelZahl ?? b.kapitel?.length ?? 1} {L.kapitel} · {L.min(b.minuten ?? leseMinuten(alsKapitelBuch(b)))}
              </span>
            </button>
            {!bibliothek && onLoeschen && (
              <button type="button" className="bg-weg" title={L.loeschen} aria-label={L.loeschen} onClick={() => onLoeschen(b.id)}>✕</button>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------
//  Leser: Übersicht (nr = -1) → 8 Kapitel → Abschluss
// ---------------------------------------------------------------
const sauberesWort = (w) => w.replace(/[«».,;:¿?¡!()"—…“”„]/g, '').trim()
const wortSchluessel = (w) => w.toLowerCase().replace(/[^a-záéíóúüñа-яё]/gi, '')

export function BuchLeser({ buch: roh, onClose, onAddVocab, addXp, vocab = {} }) {
  useTexte()
  const L = txt()
  const buch = alsKapitelBuch(roh)
  const kapitel = buch.kapitel
  const kannLaut = Boolean(LAUTSCHRIFT) && buch.niveau === 'A1'
  const [nr, setNr] = useState(-1) // -1 Übersicht · 0…n-1 Kapitel · n Abschluss
  const [ansicht, setAnsicht] = useState('lern') // 'lern' | 'beide' | 'de'
  const [laut, setLaut] = useState(kannLaut)
  const [wort, setWort] = useState(null)
  const [drin, setDrin] = useState({})
  const [einzeln, setEinzeln] = useState(() => new Set()) // einzeln in den Trainer gelegt
  const [xp, setXp] = useState(null)
  const uebersicht = nr < 0
  const fertig = nr >= kapitel.length
  const k = kapitel[nr]
  const zeigLaut = kannLaut && laut && ansicht !== 'de'
  const lautVon = (t) => LAUTSCHRIFT(t || '', sprache())

  useEffect(() => {
    document.body.classList.add('liest-buch', 'lese-modus')
    return () => document.body.classList.remove('liest-buch', 'lese-modus')
  }, [])
  useEffect(() => { window.scrollTo({ top: 0 }) }, [nr])

  function feiere(menge) {
    addXp?.(menge)
    erfolgston()
    setXp({ menge, key: Date.now() })
  }
  async function antippen(teil) {
    const s = sauberesWort(teil)
    if (!s) return
    setWort({ text: s, de: '', laedt: true })
    try {
      const r = await fetch(API_URL + '/api/translate?q=' + encodeURIComponent(s) + '&sprache=' + sprache())
      const d = await r.json()
      setWort({ text: s, de: d.translation || '', laedt: false })
    } catch {
      setWort({ text: s, de: '', laedt: false })
    }
  }
  function sammeln(status) {
    if (!wort?.text) return setWort(null)
    onAddVocab?.([{ wort: wort.text, uebersetzung: wort.de, quelle: 'Buch: ' + buch.titel }], status)
    feiere(XP.WORT_NEU)
    setWort(null)
  }
  // Schon im Trainer? (eben hier angetippt oder vorher gesammelt)
  const imTrainer = (w) => einzeln.has(w) || Boolean(vocab[wortSchluessel(w)])
  function wortRein(v) {
    if (imTrainer(v.wort)) return
    onAddVocab?.([{ wort: v.wort, uebersetzung: v.uebersetzung, quelle: 'Buch: ' + buch.titel }])
    feiere(XP.WORT_NEU)
    setEinzeln((alt) => new Set(alt).add(v.wort))
  }
  function woerterRein(liste, schluessel) {
    const neu = liste.filter((v) => !imTrainer(v.wort))
    if (neu.length) {
      onAddVocab?.(neu.map((v) => ({ wort: v.wort, uebersetzung: v.uebersetzung, quelle: 'Buch: ' + buch.titel })))
      feiere(XP.WORT_NEU * neu.length)
    }
    setEinzeln((alt) => { const n = new Set(alt); for (const v of liste) n.add(v.wort); return n })
    setDrin((d) => ({ ...d, [schluessel]: true }))
  }
  const alsWoerter = (satz = '') => satz.split(/(\s+)/).map((teil, i) => {
    if (!teil.trim()) return teil
    const status = vocab[wortSchluessel(teil)]?.status
    return <span key={i} className={'lese-wort' + (status ? ' lese-wort-' + status : '')} onClick={() => antippen(teil)}>{teil}</span>
  })
  const label = (i) => (i === 0 ? L.einf : i === kapitel.length - 1 && kapitel.length > 2 ? L.fazit : L.idee(i))
  const alleWoerter = kapitel.flatMap((x) => x.vokabeln ?? [])
  const anteil = uebersicht ? 0 : fertig ? 1 : (nr + 1) / kapitel.length
  const buchTitel = ansicht === 'de' ? buch.titel_de || buch.titel : buch.titel
  const kopfZeile = uebersicht ? L.uebersicht : fertig ? L.geschafft : `${label(nr)} · ${nr + 1} / ${kapitel.length}`

  // Ein Text-Paar (Lernsprache + Übersetzung) je nach Ansicht
  const paar = (p, { gross = false, klickbar = true } = {}) => (
    <>
      {ansicht !== 'de' && <p className={gross ? 'bl-gross' : 'bl-text'}>{klickbar ? alsWoerter(p[L1]) : p[L1]}</p>}
      {zeigLaut && <p className="bl-lautzeile">{lautVon(p[L1])}</p>}
      {ansicht === 'beide' && <p className="bl-uebers">{p.de}</p>}
      {ansicht === 'de' && <p className={gross ? 'bl-gross' : 'bl-text'}>{p.de}</p>}
    </>
  )

  return (
    <div className="bl">
      {/* Lese-Modus wie Blinkist/Headway (11.11.2026): oben nur Schließen,
          Titel und Inhalt – alles Bedienen passiert unten auf Daumenhöhe */}
      <header className="bl-leiste">
        <div className="bl-leiste-zeile">
          <button type="button" className="bl-icon" onClick={onClose} aria-label={L.schliessen} title={L.schliessen}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          <div className="bl-mitte">
            <b>{buchTitel}</b>
            <span>{kopfZeile}</span>
          </div>
          {uebersicht ? <span className="bl-platz" /> : (
            <button type="button" className="bl-icon" onClick={() => setNr(-1)} aria-label={L.inhalt} title={L.inhalt}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2.5 5h6a3.5 3.5 0 0 1 3.5 3.5V20a2.5 2.5 0 0 0-2.5-2.5h-7z" /><path d="M21.5 5h-6A3.5 3.5 0 0 0 12 8.5V20a2.5 2.5 0 0 1 2.5-2.5h7z" /></svg>
            </button>
          )}
        </div>
        <div className="bl-fortschritt" aria-hidden="true"><i style={{ width: anteil * 100 + '%' }} /></div>
      </header>

      {/* ---------- Übersicht: wie die Buchseite bei Blinkist ---------- */}
      {uebersicht && (
        <div className="bl-seite" key="uebersicht">
          <section className="bl-karte bl-held">
            <BuchCover buch={buch} />
            <div className="bl-held-text">
              <h1>{buchTitel}</h1>
              {zeigLaut && <p className="bl-lautzeile">{lautVon(buch.titel)}</p>}
              <p className="bl-autor">{buch.autor}</p>
              <ul className="bl-fakten">
                <li><b>{L.min(leseMinuten(buch))}</b></li>
                <li><b>{kapitel.length}</b> {L.kapitel}</li>
                <li><b>{buch.niveau}</b></li>
                {alleWoerter.length > 0 && <li><b>{L.woerterImBuch(alleWoerter.length)}</b></li>}
              </ul>
              {buch.kurz && <div className="bl-kurz">{paar(buch.kurz, { klickbar: false })}</div>}
              <button type="button" className="bl-weiter bl-start" onClick={() => setNr(0)}>{L.start} <span aria-hidden="true">→</span></button>
            </div>
          </section>
          {buch.bekannt === false && <p className="bl-warnung">{L.unbekannt}</p>}

          <section className="bl-karte">
            <h3 className="bl-karten-titel">{L.inhalt}</h3>
            <ol className="bl-inhalt">
              {kapitel.map((x, i) => (
                <li key={i}>
                  <button type="button" onClick={() => setNr(i)}>
                    <span className="bl-nr">{i + 1}</span>
                    <span className="bl-inhalt-text">
                      <small>{label(i)}</small>
                      <b>{ansicht === 'de' ? x.titel.de : x.titel[L1]}</b>
                      {zeigLaut && <i>{lautVon(x.titel[L1])}</i>}
                      {ansicht === 'beide' && <em>{x.titel.de}</em>}
                    </span>
                    <span className="bl-pfeil" aria-hidden="true">›</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        </div>
      )}

      {/* ---------- Ein Kapitel im weißen Lese-Container ---------- */}
      {!uebersicht && !fertig && k && (
        <div className="bl-seite" key={nr}>
          <article className="bl-kapitel">
            <span className="bl-label">{label(nr)}</span>
            <h2>{ansicht === 'de' ? k.titel.de : k.titel[L1]}</h2>
            {zeigLaut && <p className="bl-lautzeile bl-laut-titel">{lautVon(k.titel[L1])}</p>}
            {ansicht === 'beide' && <p className="bl-uebers bl-titel-zweit">{k.titel.de}</p>}

            <div className="bl-absaetze">
              {k.absaetze.map((a, i) => <div key={i} className="bl-absatz">{paar(a)}</div>)}
            </div>
            {nr === 0 && ansicht !== 'de' && <p className="bl-tipp">{L.tipp}</p>}

            {k.kern && (
              <figure className="bl-kern">
                <figcaption>{L.kern}</figcaption>
                {paar(k.kern, { gross: true, klickbar: false })}
              </figure>
            )}
            <KiMelden bereich="buch" inhalt={`${buch.titel} – ${label(nr)}\n` + k.absaetze.map((a) => Object.values(a).join(' / ')).join('\n')} className="ki-melden-rechts" />
          </article>

          {k.vokabeln?.length > 0 && (() => {
            const offen = k.vokabeln.filter((v) => !imTrainer(v.wort)).length
            return (
              <section className="bl-karte bl-woerter">
                <div className="bl-woerter-kopf">
                  <h3 className="bl-karten-titel">{L.woerter}</h3>
                  <button type="button" className="bl-rein" disabled={offen === 0} onClick={() => woerterRein(k.vokabeln, nr)}>
                    {offen === 0 ? L.drin : L.alleRein(offen)}
                  </button>
                </div>
                <p className="bl-woerter-tipp">{L.einzeln}</p>
                <ul>
                  {k.vokabeln.map((v) => {
                    const da = imTrainer(v.wort)
                    return (
                      <li key={v.wort}>
                        <button type="button" className={'bl-wort' + (da ? ' drin' : '')} onClick={() => wortRein(v)} aria-pressed={da}>
                          <b>{v.wort}</b>
                          {kannLaut && laut && <i>{lautVon(v.wort)}</i>}
                          <span>{v.uebersetzung}</span>
                          <em className="bl-wort-zeichen" aria-hidden="true">{da ? '✓' : '+'}</em>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })()}
        </div>
      )}

      {/* ---------- Abschluss ---------- */}
      {fertig && (
        <div className="bl-seite" key="ende">
          <section className="bl-karte bl-ende">
            <BuchCover buch={buch} />
            <h2>{L.geschafft}</h2>
            {buch.kurz && <div className="bl-kurz">{paar(buch.kurz, { klickbar: false })}</div>}
            {alleWoerter.length > 0 && (
              <button type="button" className="bl-weiter bl-start" disabled={alleWoerter.every((v) => imTrainer(v.wort))} onClick={() => woerterRein(alleWoerter, 'alle')}>
                {alleWoerter.every((v) => imTrainer(v.wort)) ? L.drin : L.gesamt(alleWoerter.filter((v) => !imTrainer(v.wort)).length)}
              </button>
            )}
          </section>
        </div>
      )}

      {/* Fußleiste auf Daumenhöhe: oben Ansicht + Lautschrift, unten blättern */}
      <nav className="bl-fuss">
        <div className="bl-fuss-innen">
          <div className="bl-fuss-zeile">
            <div className="bl-segment" role="tablist">
              {[['lern', LERN_NAME], ['beide', L.beide], ['de', L.mutter]].map(([w, n]) => (
                <button key={w} type="button" role="tab" aria-selected={ansicht === w} className={ansicht === w ? 'an' : ''} onClick={() => setAnsicht(w)}>{n}</button>
              ))}
            </div>
            {kannLaut && (
              <button type="button" className={'bl-laut' + (laut ? ' an' : '')} aria-pressed={laut} disabled={ansicht === 'de'} onClick={() => setLaut((v) => !v)}>
                <span className="bl-schalter" aria-hidden="true"><i /></span>{L.laut}
              </button>
            )}
          </div>
          <div className="bl-fuss-zeile">
            {!uebersicht && (
              <button type="button" className="bl-zurueck" onClick={() => setNr((n) => n - 1)} aria-label={nr === 0 ? L.inhalt : L.zurueck}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
              </button>
            )}
            {fertig ? (
              <button type="button" className="bl-weiter" onClick={onClose}>{L.fertig} ✓</button>
            ) : (
              <button type="button" className="bl-weiter" onClick={() => setNr((n) => n + 1)}>
                {uebersicht ? L.start : nr === kapitel.length - 1 ? L.fertig : L.weiter}
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
              </button>
            )}
          </div>
        </div>
      </nav>

      {xp && <span key={xp.key} className="buch-xp" onAnimationEnd={() => setXp(null)}>+{xp.menge} XP</span>}

      {wort && (
        <div className="wortkarte-hintergrund" onClick={() => setWort(null)}>
          <div className="wortkarte" onClick={(e) => e.stopPropagation()}>
            <button className="wortkarte-schliessen" aria-label="✕" onClick={() => setWort(null)}>✕</button>
            <div className="wortkarte-wort">{wort.text}</div>
            {kannLaut && <div className="bl-lautzeile">{lautVon(wort.text)}</div>}
            <div className="wortkarte-de">{wort.laedt ? L.uebersetze : wort.de || L.keine}</div>
            <div className="wortkarte-knoepfe">
              <button className="btn-outline" onClick={() => sammeln('gewusst')} disabled={wort.laedt}>{L.kenne}</button>
              <button className="btn" onClick={() => sammeln('lernen')} disabled={wort.laedt}>{L.lernen}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

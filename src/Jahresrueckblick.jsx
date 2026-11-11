import { useEffect, useMemo, useRef, useState } from 'react'
import { lokalerVerlauf } from './verlauf.js'
import { sprache, gebiet } from './sprache.js'

/**
 * Jahresrückblick zu Silvester (seit 11.11.2026) – wie „Wrapped“:
 * ein paar Story-Seiten zum Durchtippen und am Ende ein Bild zum
 * Posten (Instagram-Story-Format 1080 × 1920).
 *
 * Sichtbar vom 27.12. bis 15.01. als Karte auf der Startseite.
 * Zum Ansehen außerhalb dieser Zeit: Adresse mit ?rueckblick öffnen.
 *
 * Die Zahlen kommen aus dem Lernverlauf (verlauf.js), der mit dem
 * Konto auf alle Geräte reist. Die Lernzeit wird erst seit dem
 * 11.11.2026 gemessen – für ältere Tage wird sie aus dem Gelernten
 * geschätzt (minutenVonTag).
 */

// ----- Was sich zwischen Habloo und Davaigo unterscheidet -----
const APP = {
  name: 'Habloo',
  // Englische Nutzer kommen über habloo.net (app.habloo.net)
  get web() { return sprache() === 'en' ? 'habloo.net' : 'habloo.de' },
  logo: '/favicon.svg',
  lernsprache: { de: 'Spanisch', en: 'Spanish' },
  farbe1: '#ff8a2b',
  farbe2: '#c2410c',
  akzent: '#ffe14d',
}

const TEXT = {
  de: {
    karteTitel: (j) => `Dein ${APP.name}-Jahr ${j}`,
    karteUnter: 'Dein Jahresrückblick ist da – zum Ansehen und Teilen',
    deinJahr: 'Dein Jahr',
    mit: `mit ${APP.name}`,
    tippen: 'Tippe, um weiterzugehen',
    gelernt: 'Du hast gelernt',
    minuten: `Minuten ${APP.lernsprache.de}`,
    stunden: (h) => `Das sind ${h} Stunden – stark!`,
    jedeMinute: 'Jede Minute zählt.',
    lerntage: 'Lerntage',
    tageDabei: 'An so vielen Tagen warst du dabei',
    serie: (n) => `Längste Serie: ${n} ${n === 1 ? 'Tag' : 'Tage'} in Folge`,
    wasGelernt: 'Das hast du geschafft',
    karten: 'Karten wiederholt',
    lektionen: 'Lektionen',
    saetze: 'Sätze geübt',
    texte: 'Texte gelesen',
    video: 'Video-Minuten',
    habla: 'Gesprächs-Minuten',
    besterMonat: 'Dein stärkster Monat',
    teilen: 'Teilen',
    speichern: 'Bild speichern',
    teilenTitel: 'Dein Jahr zum Posten',
    teilenUnter: 'Teile es in deiner Story – und nimm Freunde mit ins neue Jahr.',
    bildMein: `Mein ${APP.name}-Jahr`,
    bildMinuten: `Minuten ${APP.lernsprache.de} gelernt`,
    bildTage: 'Lerntage',
    bildSerie: 'Tage Serie',
    bildLektionen: 'Lektionen',
    bildKarten: 'Karten',
    leer: 'Noch keine Lerndaten in diesem Jahr – leg los, dann füllt sich dein Rückblick.',
    schliessen: 'Schließen',
  },
  en: {
    karteTitel: (j) => `Your ${APP.name} year ${j}`,
    karteUnter: 'Your year in review is here – to watch and share',
    deinJahr: 'Your year',
    mit: `with ${APP.name}`,
    tippen: 'Tap to continue',
    gelernt: 'You studied',
    minuten: `minutes of ${APP.lernsprache.en}`,
    stunden: (h) => `That's ${h} hours – amazing!`,
    jedeMinute: 'Every minute counts.',
    lerntage: 'study days',
    tageDabei: 'You showed up on this many days',
    serie: (n) => `Longest streak: ${n} ${n === 1 ? 'day' : 'days'} in a row`,
    wasGelernt: 'What you achieved',
    karten: 'cards reviewed',
    lektionen: 'lessons',
    saetze: 'sentences practised',
    texte: 'texts read',
    video: 'video minutes',
    habla: 'conversation minutes',
    besterMonat: 'Your strongest month',
    teilen: 'Share',
    speichern: 'Save image',
    teilenTitel: 'Your year, ready to post',
    teilenUnter: 'Share it in your story – and bring friends into the new year.',
    bildMein: `My ${APP.name} year`,
    bildMinuten: `minutes of ${APP.lernsprache.en}`,
    bildTage: 'study days',
    bildSerie: 'day streak',
    bildLektionen: 'lessons',
    bildKarten: 'cards',
    leer: 'No study data this year yet – get going and your review will fill up.',
    schliessen: 'Close',
  },
}

const FARBEN = { '--rb1': APP.farbe1, '--rb2': APP.farbe2, '--rb-akzent': APP.akzent }

const T = () => TEXT[sprache() === 'en' ? 'en' : 'de']
const zahl = (n) => Math.round(n).toLocaleString(gebiet())

/** Welches Jahr gerade zurückgeblickt wird – oder null außerhalb der Zeit. */
export function rueckblickJahr(d = new Date()) {
  if (d.getMonth() === 11 && d.getDate() >= 27) return d.getFullYear()
  if (d.getMonth() === 0 && d.getDate() <= 15) return d.getFullYear() - 1
  return null
}

/** Lernzeit eines Tages – gemessen, sonst aus dem Gelernten geschätzt. */
function minutenVonTag(e = {}) {
  if (e.minuten) return e.minuten
  return (
    (e.video ?? 0) + (e.habla ?? 0) + (e.woerter ?? 0) * 0.2 +
    (e.saetze ?? 0) * 0.4 + (e.lektionen ?? 0) * 4 + (e.texte ?? 0) * 3
  )
}

export function rueckblickDaten(jahr) {
  const { aktivitaet = {}, lernkurve = {} } = lokalerVerlauf()
  const vor = jahr + '-'
  const d = { jahr, minuten: 0, woerter: 0, saetze: 0, lektionen: 0, texte: 0, video: 0, habla: 0 }
  const monate = Array(12).fill(0)
  const tage = new Set()
  for (const [tag, e] of Object.entries(lernkurve)) {
    if (!tag.startsWith(vor)) continue
    const min = minutenVonTag(e)
    d.minuten += min
    for (const a of ['woerter', 'saetze', 'lektionen', 'texte', 'video', 'habla']) d[a] += e[a] ?? 0
    monate[Number(tag.slice(5, 7)) - 1] += min
    if (Object.values(e).some((v) => v > 0)) tage.add(tag)
  }
  for (const tag of Object.keys(aktivitaet)) if (tag.startsWith(vor)) tage.add(tag)

  // Längste Serie innerhalb des Jahres
  let serie = 0
  let lauf = 0
  let vorher = null
  for (const t of [...tage].sort()) {
    const tagDatum = new Date(t + 'T12:00:00')
    lauf = vorher && (tagDatum - vorher) / 86400000 < 1.5 ? lauf + 1 : 1
    serie = Math.max(serie, lauf)
    vorher = tagDatum
  }
  const spitze = Math.max(...monate)
  return {
    ...d,
    minuten: Math.round(d.minuten),
    lerntage: tage.size,
    serie,
    monate,
    besterMonat: spitze > 0 ? monate.indexOf(spitze) : -1,
  }
}

const monatsName = (i, lang = 'long') =>
  new Date(2026, i, 1).toLocaleDateString(gebiet(), { month: lang }).replace('.', '')

// ---------------------------------------------------------------
//  Das Bild zum Teilen (1080 × 1920)
// ---------------------------------------------------------------

function ladeBild(src) {
  return new Promise((ok) => {
    const img = new Image()
    img.onload = () => ok(img)
    img.onerror = () => ok(null)
    img.src = src
  })
}

function rundesRechteck(c, x, y, b, h, r) {
  c.beginPath()
  c.moveTo(x + r, y)
  c.arcTo(x + b, y, x + b, y + h, r)
  c.arcTo(x + b, y + h, x, y + h, r)
  c.arcTo(x, y + h, x, y, r)
  c.arcTo(x, y, x + b, y, r)
  c.closePath()
}

async function zeichneBild(daten) {
  const t = T()
  const B = 1080
  const H = 1920
  const leinwand = document.createElement('canvas')
  leinwand.width = B
  leinwand.height = H
  const c = leinwand.getContext('2d')
  try { await document.fonts?.load('900 100px Nunito') } catch { /* Ersatzschrift */ }
  const schrift = (g, w = 900) => `${w} ${g}px Nunito, 'Segoe UI', Arial, sans-serif`

  const verlauf = c.createLinearGradient(0, 0, B, H)
  verlauf.addColorStop(0, APP.farbe1)
  verlauf.addColorStop(1, APP.farbe2)
  c.fillStyle = verlauf
  c.fillRect(0, 0, B, H)

  // Weiche Lichtkreise
  for (const [x, y, r, a] of [[880, 260, 420, 0.16], [120, 1500, 520, 0.12], [980, 1700, 300, 0.1]]) {
    const g = c.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(255,255,255,${a})`)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    c.fillStyle = g
    c.fillRect(0, 0, B, H)
  }

  const logo = await ladeBild(APP.logo)
  if (logo) c.drawImage(logo, B / 2 - 80, 170, 160, 160)

  c.textAlign = 'center'
  c.fillStyle = 'rgba(255,255,255,.9)'
  c.font = schrift(58, 800)
  c.fillText(t.bildMein, B / 2, 430)
  c.fillStyle = APP.akzent
  c.font = schrift(190)
  c.fillText(String(daten.jahr), B / 2, 620)

  c.fillStyle = '#fff'
  c.font = schrift(daten.minuten >= 10000 ? 210 : 250)
  c.fillText(zahl(daten.minuten), B / 2, 920)
  c.fillStyle = 'rgba(255,255,255,.88)'
  c.font = schrift(54, 800)
  c.fillText(t.bildMinuten, B / 2, 1000)

  const kacheln = [
    [daten.lerntage, t.bildTage],
    [daten.serie, t.bildSerie],
    [daten.lektionen, t.bildLektionen],
    [daten.woerter, t.bildKarten],
  ]
  const kb = 430
  const kh = 230
  kacheln.forEach(([wert, name], i) => {
    const x = i % 2 === 0 ? B / 2 - kb - 20 : B / 2 + 20
    const y = 1120 + Math.floor(i / 2) * (kh + 40)
    rundesRechteck(c, x, y, kb, kh, 44)
    c.fillStyle = 'rgba(255,255,255,.16)'
    c.fill()
    c.fillStyle = '#fff'
    c.font = schrift(96)
    c.fillText(zahl(wert), x + kb / 2, y + 125)
    c.fillStyle = 'rgba(255,255,255,.85)'
    c.font = schrift(40, 800)
    c.fillText(name, x + kb / 2, y + 185)
  })

  c.fillStyle = 'rgba(255,255,255,.8)'
  c.font = schrift(44, 800)
  c.fillText(APP.web, B / 2, H - 120)

  return new Promise((ok) => leinwand.toBlob((b) => ok(b), 'image/png'))
}

function speichere(blob, name) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

// ---------------------------------------------------------------
//  Die Story-Ansicht
// ---------------------------------------------------------------

export function Jahresrueckblick({ jahr, onClose }) {
  const t = T()
  const daten = useMemo(() => rueckblickDaten(jahr), [jahr])
  const [seite, setSeite] = useState(0)
  const [bild, setBild] = useState(null) // { blob, url }
  const bildUrl = useRef(null)

  const leer = daten.lerntage === 0
  const stats = [
    ['woerter', t.karten],
    ['lektionen', t.lektionen],
    ['saetze', t.saetze],
    ['texte', t.texte],
    ['video', t.video],
    ['habla', t.habla],
  ].filter(([k]) => daten[k] > 0)

  const seiten = leer
    ? ['start', 'leer']
    : ['start', 'minuten', 'tage', ...(stats.length ? ['was'] : []), ...(daten.besterMonat >= 0 ? ['monat'] : []), 'teilen']
  const art = seiten[seite]

  useEffect(() => {
    document.body.classList.add('rueckblick-offen')
    return () => {
      document.body.classList.remove('rueckblick-offen')
      if (bildUrl.current) URL.revokeObjectURL(bildUrl.current)
    }
  }, [])

  // Das Bild schon vorbereiten, bevor man auf der letzten Seite ankommt
  useEffect(() => {
    if (leer || bild) return
    let aus = false
    zeichneBild(daten).then((blob) => {
      if (aus || !blob) return
      bildUrl.current = URL.createObjectURL(blob)
      setBild({ blob, url: bildUrl.current })
    })
    return () => { aus = true }
  }, [daten, leer, bild])

  function tippe(e) {
    if (e.target.closest('button')) return
    const links = e.clientX < window.innerWidth * 0.3
    if (links) setSeite((s) => Math.max(0, s - 1))
    else if (seite < seiten.length - 1) setSeite(seite + 1)
  }

  const dateiName = `${APP.name}-${jahr}.png`
  async function teilen() {
    if (!bild) return
    const datei = new File([bild.blob], dateiName, { type: 'image/png' })
    if (navigator.canShare?.({ files: [datei] })) {
      try {
        await navigator.share({ files: [datei], text: `${t.bildMein} ${jahr} · ${APP.web}` })
      } catch { /* abgebrochen */ }
    } else {
      speichere(bild.blob, dateiName)
    }
  }

  const spitze = Math.max(...daten.monate, 1)

  return (
    <div className="rb" style={FARBEN} onClick={tippe} role="dialog" aria-modal="true">
      <div className="rb-balken" aria-hidden="true">
        {seiten.map((s, i) => <i key={s} className={i <= seite ? 'an' : ''} />)}
      </div>
      <button type="button" className="rb-zu" onClick={onClose} aria-label={t.schliessen}>✕</button>

      <div className="rb-seite" key={art}>
        {art === 'start' && (
          <>
            <img className="rb-logo" src={APP.logo} alt="" />
            <p className="rb-klein">{t.deinJahr}</p>
            <p className="rb-jahr">{jahr}</p>
            <p className="rb-klein">{t.mit}</p>
            <p className="rb-hinweis">{t.tippen}</p>
          </>
        )}
        {art === 'leer' && <p className="rb-text">{t.leer}</p>}
        {art === 'minuten' && (
          <>
            <p className="rb-klein">{t.gelernt}</p>
            <p className="rb-riesig">{zahl(daten.minuten)}</p>
            <p className="rb-gross">{t.minuten}</p>
            <p className="rb-text">{daten.minuten >= 120 ? t.stunden(zahl(daten.minuten / 60)) : t.jedeMinute}</p>
          </>
        )}
        {art === 'tage' && (
          <>
            <p className="rb-klein">{t.tageDabei}</p>
            <p className="rb-riesig">{zahl(daten.lerntage)}</p>
            <p className="rb-gross">{t.lerntage}</p>
            <p className="rb-text">🔥 {t.serie(daten.serie)}</p>
          </>
        )}
        {art === 'was' && (
          <>
            <p className="rb-gross">{t.wasGelernt}</p>
            <div className="rb-raster">
              {stats.map(([k, name], i) => (
                <div key={k} className="rb-kachel" style={{ animationDelay: i * 0.08 + 's' }}>
                  <b>{zahl(daten[k])}</b>
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {art === 'monat' && (
          <>
            <p className="rb-klein">{t.besterMonat}</p>
            <p className="rb-riesig rb-monat">{monatsName(daten.besterMonat)}</p>
            <div className="rb-saeulen" aria-hidden="true">
              {daten.monate.map((m, i) => (
                <span key={i} className={i === daten.besterMonat ? 'an' : ''}>
                  <i style={{ height: Math.max(4, (m / spitze) * 100) + '%', animationDelay: i * 0.04 + 's' }} />
                  <small>{monatsName(i, 'narrow')}</small>
                </span>
              ))}
            </div>
          </>
        )}
        {art === 'teilen' && (
          <>
            <p className="rb-gross">{t.teilenTitel}</p>
            {bild ? <img className="rb-vorschau" src={bild.url} alt={t.bildMein} /> : <div className="rb-vorschau rb-vorschau-laedt" />}
            <p className="rb-text">{t.teilenUnter}</p>
            <div className="rb-knoepfe">
              <button type="button" className="rb-knopf" onClick={teilen} disabled={!bild}>{t.teilen}</button>
              <button type="button" className="rb-knopf rb-knopf-leise" onClick={() => bild && speichere(bild.blob, dateiName)} disabled={!bild}>{t.speichern}</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/** Karte für die Startseite – nur zwischen 27.12. und 15.01. (oder mit ?rueckblick). */
export function RueckblickKarte() {
  const vorschau = useMemo(() => {
    try { return new URLSearchParams(window.location.search).has('rueckblick') } catch { return false }
  }, [])
  const jahr = rueckblickJahr() ?? (vorschau ? new Date().getFullYear() : null)
  const [offen, setOffen] = useState(vorschau)
  if (!jahr) return null
  const t = T()
  return (
    <>
      <button type="button" className="rb-karte" style={FARBEN} onClick={() => setOffen(true)}>
        <img src={APP.logo} alt="" />
        <span>
          <b>{t.karteTitel(jahr)}</b>
          <small>{t.karteUnter}</small>
        </span>
        <span className="rb-karte-pfeil" aria-hidden="true">→</span>
      </button>
      {offen && <Jahresrueckblick jahr={jahr} onClose={() => setOffen(false)} />}
    </>
  )
}

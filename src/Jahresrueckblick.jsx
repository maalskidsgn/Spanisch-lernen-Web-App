import { useEffect, useMemo, useRef, useState } from 'react'
import { lokalerVerlauf } from './verlauf.js'
import { sprache, gebiet } from './sprache.js'

/**
 * Jahresrückblick – wie „Wrapped“ (Neufassung 12.11.2026).
 *
 * Eine Story, die von selbst durchläuft (Tippen springt weiter), mit
 * den echten Zahlen aus dem Lernverlauf. Der Verlauf reist mit dem
 * Konto auf alle Geräte (verlauf.js), deshalb ist der Rückblick für
 * jedes Jahr jederzeit wieder abrufbar – „gespeichert“ im Profil.
 *
 * Teilen: als Video (9:16, ca. 20 s, im Gerät aufgenommen) oder als
 * Bild. Am Handy öffnet „Teilen“ das System-Menü (Instagram, WhatsApp …),
 * am PC wird die Datei gespeichert.
 *
 * Sichtbar vom 27.12. bis 15.01. auf der Startseite, im Profil für
 * vergangene Jahre immer. Tester sehen ihn schon jetzt: einmal die
 * Adresse mit ?rueckblick öffnen.
 */

// ----- Was sich zwischen Habloo und Davaigo unterscheidet -----
const APP = {
  name: 'Habloo',
  get web() { return sprache() === 'en' ? 'habloo.net' : 'habloo.de' },
  logo: '/favicon.svg',
  lernsprache: { de: 'Spanisch', en: 'Spanish' },
  farbe1: '#ff8a2b',
  farbe2: '#c2410c',
  hell: '#ffa463',
  tief: '#3a1300',
  akzent: '#ffe14d',
  badgeApple: '/badges/app-store.svg',
  badgePlay: '/badges/google-play.png',
}

const TEXT = {
  de: {
    karteTitel: (j) => `Dein ${APP.name}-Jahr ${j}`,
    karteUnter: 'Dein Jahresrückblick ist da – teile ihn!',
    profilUnter: 'Ansehen und als Video teilen',
    deinJahr: `Dein Jahr mit ${APP.name}`,
    malSehen: 'Mal sehen, was du so\ngelernt hast …',
    gelernt: `Du hast ${APP.lernsprache.de} gelernt –`,
    stundenEinheit: 'h',
    minutenEinheit: 'Min',
    filme: (n) => n >= 1 ? `Das sind ${n} ${n === 1 ? 'Spielfilm' : 'Spielfilme'}.\nNur eben mit Vokabeln.` : 'Jede Minute zählt.',
    woerter: 'Wörter wiederholt',
    erstesWort: 'Dein erstes Wort des Jahres:',
    monat: 'Dein Lieblingsmonat',
    monatZeile: 'brannte richtig.',
    serie: 'Längste Serie',
    tage: (n) => `${n} ${n === 1 ? 'Tag' : 'Tage'}`,
    serieUnter: (n) => n >= 14 ? `${Math.floor(n / 7)} Wochen ohne Pause.\nRespekt.` : 'Dranbleiben lohnt sich.',
    typ: 'Dein Lerntyp',
    typen: {
      woerter: ['Wortschatz-Jäger', 'Kein Wort ist vor dir sicher.'],
      saetze: ['Satzbau-Profi', 'Du denkst in ganzen Sätzen.'],
      lektionen: ['Kurs-Held', 'Lektion für Lektion nach vorn.'],
      texte: ['Leseratte', 'Am liebsten mit einem guten Text.'],
      video: ['Serienjunkie', 'Lernen nebenbei mit Videos.'],
      habla: ['Plaudertasche', 'Am liebsten wird gesprochen.'],
    },
    meinJahr: (j) => `Mein ${APP.lernsprache.de}-Jahr ${j}`,
    kGelernt: 'gelernt',
    kWoerter: 'Wörter',
    kSerie: 'Tage Serie',
    kTage: 'Lerntage',
    videoTeilen: 'Als Video teilen',
    bildTeilen: 'Bild teilen',
    videoLaeuft: (p) => `Video wird erstellt … ${p} %`,
    lernMitMir: 'lern mit mir',
    leer: 'Noch keine Lerndaten in diesem Jahr – leg los, dann füllt sich dein Rückblick.',
    schliessen: 'Schließen',
    teilText: (j) => `Mein ${APP.name}-Jahr ${j} 🎉`,
  },
  en: {
    karteTitel: (j) => `Your ${APP.name} year ${j}`,
    karteUnter: 'Your year in review is here – share it!',
    profilUnter: 'Watch and share it as a video',
    deinJahr: `Your year with ${APP.name}`,
    malSehen: "Let's see what\nyou've learned …",
    gelernt: `You studied ${APP.lernsprache.en} for`,
    stundenEinheit: 'h',
    minutenEinheit: 'min',
    filme: (n) => n >= 1 ? `That's ${n} feature ${n === 1 ? 'film' : 'films'}.\nJust with vocabulary.` : 'Every minute counts.',
    woerter: 'words reviewed',
    erstesWort: 'Your first word of the year:',
    monat: 'Your favourite month',
    monatZeile: 'was on fire.',
    serie: 'Longest streak',
    tage: (n) => `${n} ${n === 1 ? 'day' : 'days'}`,
    serieUnter: (n) => n >= 14 ? `${Math.floor(n / 7)} weeks without a break.\nRespect.` : 'Keeping at it pays off.',
    typ: 'Your learner type',
    typen: {
      woerter: ['Word Hunter', 'No word is safe from you.'],
      saetze: ['Sentence Pro', 'You think in full sentences.'],
      lektionen: ['Course Hero', 'Lesson by lesson, forward.'],
      texte: ['Bookworm', 'Best with a good text.'],
      video: ['Binge Learner', 'Learning on the side with videos.'],
      habla: ['Chatterbox', 'Talking is your thing.'],
    },
    meinJahr: (j) => `My ${APP.lernsprache.en} year ${j}`,
    kGelernt: 'studied',
    kWoerter: 'words',
    kSerie: 'day streak',
    kTage: 'study days',
    videoTeilen: 'Share as video',
    bildTeilen: 'Share image',
    videoLaeuft: (p) => `Creating video … ${p} %`,
    lernMitMir: 'learn with me',
    leer: 'No study data this year yet – get going and your review will fill up.',
    schliessen: 'Close',
    teilText: (j) => `My ${APP.name} year ${j} 🎉`,
  },
}

const T = () => TEXT[sprache() === 'en' ? 'en' : 'de']
const zahl = (n) => Math.round(n).toLocaleString(gebiet())
const monatsName = (i, lang = 'long') =>
  new Date(2026, i, 1).toLocaleDateString(gebiet(), { month: lang }).replace('.', '')

/** Welches Jahr gerade zurückgeblickt wird – oder null außerhalb der Zeit. */
export function rueckblickJahr(d = new Date()) {
  if (d.getMonth() === 11 && d.getDate() >= 27) return d.getFullYear()
  if (d.getMonth() === 0 && d.getDate() <= 15) return d.getFullYear() - 1
  return null
}

/** Tester sehen den Rückblick jederzeit: einmal ?rueckblick öffnen. */
export function rueckblickTester() {
  try {
    if (new URLSearchParams(window.location.search).has('rueckblick')) localStorage.setItem('rb-tester', '1')
    return localStorage.getItem('rb-tester') === '1'
  } catch {
    return false
  }
}

/** Lernzeit eines Tages – gemessen, sonst aus dem Gelernten geschätzt. */
function minutenVonTag(e = {}) {
  if (e.minuten) return e.minuten
  return (
    (e.video ?? 0) + (e.habla ?? 0) + (e.woerter ?? 0) * 0.2 +
    (e.saetze ?? 0) * 0.4 + (e.lektionen ?? 0) * 4 + (e.texte ?? 0) * 3
  )
}

/** Wörter aus dem Trainer – für den Wortregen und das erste Wort des Jahres. */
function woerterDesJahres(jahr) {
  try {
    const v = JSON.parse(localStorage.getItem('vokabeln')) || {}
    const alle = Object.entries(v)
    const imJahr = alle
      .filter(([, e]) => e?.addedAt && new Date(e.addedAt).getFullYear() === jahr)
      .sort((a, b) => a[1].addedAt - b[1].addedAt)
    const quelle = imJahr.length >= 8 ? imJahr : alle
    const kurz = quelle.map(([w]) => w).filter((w) => w.length <= 12)
    return { liste: kurz.sort(() => Math.random() - 0.5).slice(0, 16), erstes: imJahr[0]?.[0] ?? null }
  } catch {
    return { liste: [], erstes: null }
  }
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
  // Lerntyp: was hat (gewichtet nach Aufwand) am meisten Zeit bekommen?
  const gewicht = {
    woerter: d.woerter * 0.2, saetze: d.saetze * 0.4, lektionen: d.lektionen * 4,
    texte: d.texte * 3, video: d.video, habla: d.habla,
  }
  const typ = Object.entries(gewicht).sort((a, b) => b[1] - a[1])[0]
  const { liste, erstes } = woerterDesJahres(jahr)
  return {
    ...d,
    minuten: Math.round(d.minuten),
    lerntage: tage.size,
    serie,
    monate,
    besterMonat: spitze > 0 ? monate.indexOf(spitze) : -1,
    typ: typ && typ[1] > 0 ? typ[0] : 'woerter',
    wortliste: liste,
    erstesWort: erstes,
  }
}

/** Stunden-Anzeige: ab 2 Stunden in h, darunter in Minuten. */
function zeitWert(min) {
  return min >= 120 ? { wert: Math.round(min / 60), einheit: 'h' } : { wert: Math.round(min), einheit: 'min' }
}

/** Welche Folien es für diese Daten gibt – leere fallen weg. */
function folienVon(d) {
  if (d.lerntage === 0) return ['start', 'leer']
  return [
    'start', 'zeit',
    ...(d.woerter > 0 ? ['woerter'] : []),
    ...(d.besterMonat >= 0 ? ['monat'] : []),
    ...(d.serie >= 2 ? ['serie'] : []),
    'typ', 'ende',
  ]
}
const DAUER = { start: 3200, zeit: 3600, woerter: 3600, monat: 3800, serie: 3400, typ: 3600, ende: 5000, leer: 4000 }

// ---------------------------------------------------------------
//  Gemeinsames fürs Zeichnen (Video + Bild), 1080 × 1920
// ---------------------------------------------------------------

const B = 1080
const H = 1920
const FLAMME_AUSSEN = new Path2D('M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3-1-6 1-9z')
const FLAMME_INNEN = new Path2D('M12 12c1 2 3 3 3 5a3 3 0 0 1-6 0c0-1.5 1-2.5 1.5-3 0 1 .5 1.5 1 1.5 0-1.5-.5-2.5.5-3.5z')

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

const schrift = (g, w = 900) => `${w} ${g}px Nunito, 'Segoe UI', Arial, sans-serif`
const raus = (p) => 1 - Math.pow(1 - Math.min(1, Math.max(0, p)), 3)
// Federnder Einstieg (überschwingt kurz)
const feder = (p) => {
  p = Math.min(1, Math.max(0, p))
  return 1 + 2.2 * Math.pow(p - 1, 3) + 1.2 * Math.pow(p - 1, 2)
}

/** Text, der von unten reinfedert. ms = Zeit seit Folienstart, ab = Start. */
function reinText(c, text, x, y, ms, ab, groesse, farbe, gewicht = 900, ausrichtung = 'left') {
  const p = (ms - ab) / 700
  if (p <= 0) return
  c.save()
  c.globalAlpha = Math.min(1, p * 2)
  c.translate(0, (1 - feder(p)) * 60)
  c.fillStyle = farbe
  c.font = schrift(groesse, gewicht)
  c.textAlign = ausrichtung
  String(text).split('\n').forEach((z, i) => c.fillText(z, x, y + i * groesse * 1.15))
  c.restore()
}

function verlaufHinten(c, stops, winkel = 'diag') {
  const g = winkel === 'senk' ? c.createLinearGradient(0, 0, 0, H) : c.createLinearGradient(0, 0, B, H)
  stops.forEach(([o, f]) => g.addColorStop(o, f))
  c.fillStyle = g
  c.fillRect(0, 0, B, H)
}

function lichtKreis(c, x, y, r, a) {
  const g = c.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, `rgba(255,255,255,${a})`)
  g.addColorStop(1, 'rgba(255,255,255,0)')
  c.fillStyle = g
  c.fillRect(x - r, y - r, r * 2, r * 2)
}

/** Eine Folie zum Zeitpunkt ms zeichnen (für das Video). */
function zeichneFolie(c, art, ms, d, bilder) {
  const t = T()
  const L = 110 // linker Rand
  c.textBaseline = 'alphabetic'
  if (art === 'start') {
    verlaufHinten(c, [[0, APP.hell], [0.45, APP.farbe1], [1, APP.farbe2]])
    lichtKreis(c, 200 + Math.sin(ms / 900) * 30, 500, 420, 0.16)
    lichtKreis(c, 900, 1400 + Math.cos(ms / 1100) * 30, 380, 0.12)
    reinText(c, t.deinJahr, B / 2, 720, ms, 0, 58, 'rgba(255,255,255,.92)', 800, 'center')
    const p = feder(ms / 1000)
    c.save()
    c.translate(B / 2, 1000)
    c.rotate((1 - Math.min(1, ms / 1000)) * -0.2)
    c.scale(Math.max(0.01, p), Math.max(0.01, p))
    c.fillStyle = 'rgba(0,0,0,.18)'
    c.font = schrift(330)
    c.textAlign = 'center'
    c.fillText(String(d.jahr), 0, 30)
    c.fillStyle = APP.akzent
    c.fillText(String(d.jahr), 0, 0)
    c.restore()
    reinText(c, t.malSehen, B / 2, 1250, ms, 450, 56, 'rgba(255,255,255,.9)', 800, 'center')
  } else if (art === 'zeit') {
    verlaufHinten(c, [[0, APP.tief], [1, APP.farbe2]], 'senk')
    c.save()
    c.strokeStyle = 'rgba(255,255,255,.08)'
    c.lineWidth = 50
    c.beginPath()
    c.arc(920, 1720, 330, 0, Math.PI * 2)
    c.stroke()
    c.translate(920, 1720)
    c.rotate(ms / 480)
    c.fillStyle = 'rgba(255,255,255,.25)'
    c.fillRect(-9, 0, 18, 240)
    c.restore()
    const z = zeitWert(d.minuten)
    reinText(c, t.gelernt, L, 760, ms, 0, 56, 'rgba(255,255,255,.88)', 800)
    const wert = Math.round(z.wert * raus((ms - 400) / 1400))
    reinText(c, `${zahl(wert)} ${z.einheit}`, L, 1010, ms, 350, 250, APP.akzent)
    reinText(c, t.filme(Math.floor(d.minuten / 120)), L, 1160, ms, 700, 56, 'rgba(255,255,255,.9)', 800)
  } else if (art === 'woerter') {
    c.fillStyle = APP.akzent
    c.fillRect(0, 0, B, H)
    c.font = schrift(64)
    c.textAlign = 'left'
    d.wortliste.forEach((w, i) => {
      const dauer = 3000 + (i % 5) * 700
      const y = (((ms + i * 450) % dauer) / dauer) * (H + 200) - 100
      c.fillStyle = 'rgba(194,65,12,.38)'
      c.fillText(w, ((i * 37) % 85) / 100 * B, y)
    })
    const p = feder(ms / 700)
    c.save()
    c.globalAlpha = Math.min(1, ms / 350)
    c.translate(0, (1 - p) * 80)
    rundesRechteck(c, 80, 620, B - 160, 700, 70)
    c.fillStyle = 'rgba(255,255,255,.9)'
    c.fill()
    c.textAlign = 'left'
    c.fillStyle = APP.tief
    c.font = schrift(52, 800)
    c.fillText(t.woerter, 150, 760)
    c.fillStyle = APP.farbe1
    c.font = schrift(230)
    c.fillText(zahl(d.woerter * raus((ms - 300) / 1400)), 140, 1000)
    if (d.erstesWort) {
      c.fillStyle = APP.tief
      c.font = schrift(46, 800)
      c.fillText(t.erstesWort, 150, 1120)
      c.fillStyle = APP.farbe1
      c.font = schrift(86)
      c.fillText(d.erstesWort, 150, 1230)
    }
    c.restore()
  } else if (art === 'monat') {
    verlaufHinten(c, [[0, APP.farbe1], [1, APP.farbe2]], 'senk')
    reinText(c, t.monat, L, 520, ms, 0, 56, 'rgba(255,255,255,.88)', 800)
    reinText(c, monatsName(d.besterMonat), L, 680, ms, 300, 130, '#fff')
    reinText(c, t.monatZeile, L, 800, ms, 450, 100, APP.akzent)
    const spitze = Math.max(...d.monate, 1)
    const bb = (B - 2 * L - 11 * 18) / 12
    d.monate.forEach((m, i) => {
      const h = Math.max(10, (m / spitze) * 620) * raus((ms - 400 - i * 60) / 900)
      const x = L + i * (bb + 18)
      rundesRechteck(c, x, 1620 - h, bb, Math.max(h, 1), 14)
      c.fillStyle = i === d.besterMonat ? APP.akzent : 'rgba(255,255,255,.3)'
      c.fill()
      c.fillStyle = 'rgba(255,255,255,.8)'
      c.font = schrift(32)
      c.textAlign = 'center'
      c.fillText(monatsName(i, 'narrow'), x + bb / 2, 1680)
    })
  } else if (art === 'serie') {
    const g = c.createRadialGradient(B / 2, 1300, 0, B / 2, 1300, 1300)
    g.addColorStop(0, '#ff8a2b')
    g.addColorStop(0.5, '#c2410c')
    g.addColorStop(1, '#3a1300')
    c.fillStyle = g
    c.fillRect(0, 0, B, H)
    reinText(c, t.serie, B / 2, 640, ms, 0, 56, 'rgba(255,255,255,.9)', 800, 'center')
    reinText(c, t.tage(d.serie), B / 2, 860, ms, 300, 200, '#fff', 900, 'center')
    const n = Math.min(d.serie, 30)
    const proZeile = 7
    for (let i = 0; i < n; i++) {
      const p = feder((ms - 200 - i * 70) / 400)
      if (p <= 0.01) continue
      const zeile = Math.floor(i / proZeile)
      const spalten = Math.min(proZeile, n - zeile * proZeile)
      const x = B / 2 + (i % proZeile - (spalten - 1) / 2) * 110
      const y = 1000 + zeile * 120
      c.save()
      c.translate(x, y)
      c.scale(p * 4, p * 4)
      c.translate(-12, -12)
      c.fillStyle = '#ffd84d'
      c.fill(FLAMME_AUSSEN)
      c.fillStyle = '#fff4c2'
      c.fill(FLAMME_INNEN)
      c.restore()
    }
    reinText(c, t.serieUnter(d.serie), B / 2, 1000 + Math.ceil(n / proZeile) * 120 + 90, ms, 900, 54, 'rgba(255,255,255,.9)', 800, 'center')
  } else if (art === 'typ') {
    verlaufHinten(c, [[0, '#1b1446'], [1, '#3b2a8a']])
    for (let i = 0; i < 26; i++) {
      c.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(ms / 700 + i))
      c.fillStyle = '#fff'
      c.beginPath()
      c.arc(((i * 41) % 96) / 100 * B, ((i * 23) % 55) / 100 * H, 6, 0, Math.PI * 2)
      c.fill()
    }
    c.globalAlpha = 1
    const p = feder(ms / 1000)
    c.save()
    c.translate(B / 2, 680)
    c.scale(Math.max(0.01, p), Math.max(0.01, p))
    c.shadowColor = 'rgba(255,225,77,.6)'
    c.shadowBlur = 120
    c.fillStyle = APP.akzent
    c.beginPath()
    c.arc(0, 0, 170, 0, Math.PI * 2)
    c.fill()
    c.restore()
    const [name, unter] = t.typen[d.typ] ?? t.typen.woerter
    reinText(c, t.typ, B / 2, 1020, ms, 200, 56, 'rgba(255,255,255,.88)', 800, 'center')
    reinText(c, name, B / 2, 1170, ms, 450, 112, '#fff', 900, 'center')
    reinText(c, unter, B / 2, 1290, ms, 750, 54, 'rgba(255,255,255,.88)', 800, 'center')
  } else if (art === 'ende' || art === 'leer') {
    zeichneEnde(c, d, bilder, ms)
  }
}

/** Abschluss: Karte mit Zahlen + Branding, Website, Store-Abzeichen. */
function zeichneEnde(c, d, bilder, ms = 99999) {
  const t = T()
  verlaufHinten(c, [[0, APP.hell], [0.45, APP.farbe1], [1, APP.farbe2]])
  lichtKreis(c, 880, 240, 460, 0.16)
  lichtKreis(c, 120, 1500, 520, 0.12)
  const p = feder(ms / 800)
  c.save()
  c.globalAlpha = Math.min(1, ms / 300)
  c.translate(0, (1 - p) * 80)
  if (bilder.logo) c.drawImage(bilder.logo, B / 2 - 75, 170, 150, 150)
  c.textAlign = 'center'
  c.fillStyle = '#fff'
  c.font = schrift(64)
  c.fillText(t.meinJahr(d.jahr), B / 2, 430)

  if (d.lerntage > 0) {
    const z = zeitWert(d.minuten)
    const kacheln = [
      [`${zahl(z.wert)} ${z.einheit}`, t.kGelernt],
      [zahl(d.woerter), t.kWoerter],
      [zahl(d.serie), t.kSerie],
      [zahl(d.lerntage), t.kTage],
    ]
    const kb = 420
    const kh = 260
    kacheln.forEach(([wert, name], i) => {
      const x = i % 2 === 0 ? B / 2 - kb - 20 : B / 2 + 20
      const y = 520 + Math.floor(i / 2) * (kh + 40)
      rundesRechteck(c, x, y, kb, kh, 48)
      c.fillStyle = 'rgba(255,255,255,.17)'
      c.fill()
      c.fillStyle = APP.akzent
      c.font = schrift(wert.length > 6 ? 88 : 108)
      c.fillText(wert, x + kb / 2, y + 140)
      c.fillStyle = 'rgba(255,255,255,.9)'
      c.font = schrift(42, 800)
      c.fillText(name, x + kb / 2, y + 205)
    })
    const [name] = t.typen[d.typ] ?? t.typen.woerter
    rundesRechteck(c, B / 2 - 300, 1140, 600, 110, 55)
    c.fillStyle = 'rgba(255,255,255,.95)'
    c.fill()
    c.fillStyle = APP.farbe2
    c.font = schrift(52)
    c.fillText(name, B / 2, 1213)
  } else {
    c.fillStyle = '#fff'
    c.font = schrift(54, 800)
    t.leer.match(/.{1,30}(\s|$)/g).forEach((z, i) => c.fillText(z.trim(), B / 2, 700 + i * 70))
  }
  c.restore()

  // Branding unten: Logo-Zeile, Website, Store-Abzeichen
  c.textAlign = 'center'
  c.fillStyle = '#fff'
  c.font = schrift(60)
  c.fillText(APP.web, B / 2, 1470)
  c.fillStyle = 'rgba(255,255,255,.85)'
  c.font = schrift(40, 800)
  c.fillText(t.lernMitMir, B / 2, 1530)
  const hoehe = 120
  const breiteA = bilder.apple ? (bilder.apple.width / bilder.apple.height) * hoehe : 0
  // Das Google-Abzeichen hat ringsum Rand – etwas größer zeichnen
  const hoeheP = hoehe * 1.42
  const breiteP = bilder.play ? (bilder.play.width / bilder.play.height) * hoeheP : 0
  const gesamt = breiteA + breiteP + (breiteA && breiteP ? 20 : 0)
  let x = B / 2 - gesamt / 2
  if (bilder.apple) { c.drawImage(bilder.apple, x, 1610, breiteA, hoehe); x += breiteA + 20 }
  if (bilder.play) c.drawImage(bilder.play, x - 14, 1610 - (hoeheP - hoehe) / 2, breiteP, hoeheP)
}

async function ladeMarke() {
  try { await document.fonts?.load('900 100px Nunito') } catch { /* Ersatzschrift */ }
  const [logo, apple, play] = await Promise.all([ladeBild(APP.logo), ladeBild(APP.badgeApple), ladeBild(APP.badgePlay)])
  return { logo, apple, play }
}

/** Das Bild zum Teilen (Abschlusskarte). */
async function zeichneBild(daten) {
  const bilder = await ladeMarke()
  const leinwand = document.createElement('canvas')
  leinwand.width = B
  leinwand.height = H
  zeichneEnde(leinwand.getContext('2d'), daten, bilder)
  return new Promise((ok) => leinwand.toBlob((b) => ok(b), 'image/png'))
}

/** Das Video: alle Folien nacheinander, im Gerät aufgenommen. */
async function macheVideo(daten, beiFortschritt) {
  const bilder = await ladeMarke()
  const leinwand = document.createElement('canvas')
  leinwand.width = B
  leinwand.height = H
  const c = leinwand.getContext('2d')
  const typen = ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm']
  const mime = typen.find((m) => window.MediaRecorder?.isTypeSupported?.(m))
  if (!mime || !leinwand.captureStream) return null
  const strom = leinwand.captureStream(30)
  const rec = new MediaRecorder(strom, { mimeType: mime, videoBitsPerSecond: 6_000_000 })
  const teile = []
  rec.ondataavailable = (e) => e.data.size && teile.push(e.data)
  const fertig = new Promise((ok) => { rec.onstop = ok })

  const folien = folienVon(daten)
  const gesamt = folien.reduce((s, f) => s + DAUER[f], 0)
  zeichneFolie(c, folien[0], 0, daten, bilder)
  rec.start(500)
  const start = performance.now()
  await new Promise((ok) => {
    const bild = () => {
      const jetzt = performance.now() - start
      if (jetzt >= gesamt) return ok()
      let ab = 0
      for (const f of folien) {
        if (jetzt < ab + DAUER[f]) { zeichneFolie(c, f, jetzt - ab, daten, bilder); break }
        ab += DAUER[f]
      }
      beiFortschritt?.(Math.round((jetzt / gesamt) * 100))
      requestAnimationFrame(bild)
    }
    requestAnimationFrame(bild)
  })
  rec.stop()
  await fertig
  const typ = mime.startsWith('video/mp4') ? 'video/mp4' : 'video/webm'
  return { blob: new Blob(teile, { type: typ }), endung: typ === 'video/mp4' ? 'mp4' : 'webm' }
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

/** Teilen-Menü am Handy (Instagram, WhatsApp …), sonst Datei speichern. */
async function teileDatei(blob, name, text) {
  const datei = new File([blob], name, { type: blob.type })
  if (navigator.canShare?.({ files: [datei] })) {
    try { await navigator.share({ files: [datei], text }) } catch { /* abgebrochen */ }
  } else {
    speichere(blob, name)
  }
}

// ---------------------------------------------------------------
//  Die Story-Ansicht
// ---------------------------------------------------------------

const FLAMME_SVG = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3-1-6 1-9z" fill="#ffd84d" />
    <path d="M12 12c1 2 3 3 3 5a3 3 0 0 1-6 0c0-1.5 1-2.5 1.5-3 0 1 .5 1.5 1 1.5 0-1.5-.5-2.5.5-3.5z" fill="#fff4c2" />
  </svg>
)

function Zaehler({ ziel }) {
  const [wert, setWert] = useState(0)
  useEffect(() => {
    let rahmen
    const start = performance.now() + 350
    const schritt = (jetzt) => {
      const p = Math.max(0, Math.min(1, (jetzt - start) / 1400))
      setWert(Math.round(ziel * raus(p)))
      if (p < 1) rahmen = requestAnimationFrame(schritt)
    }
    rahmen = requestAnimationFrame(schritt)
    return () => cancelAnimationFrame(rahmen)
  }, [ziel])
  return <>{zahl(wert)}</>
}

export function Jahresrueckblick({ jahr, onClose }) {
  const t = T()
  const daten = useMemo(() => rueckblickDaten(jahr), [jahr])
  const folien = useMemo(() => folienVon(daten), [daten])
  const [nr, setNr] = useState(0)
  const [pause, setPause] = useState(false)
  const [video, setVideo] = useState(null) // { blob, endung }
  const [fortschritt, setFortschritt] = useState(null)
  const art = folien[nr]
  const z = zeitWert(daten.minuten)

  useEffect(() => {
    document.body.classList.add('rueckblick-offen')
    return () => document.body.classList.remove('rueckblick-offen')
  }, [])

  // Von selbst weiter – auf der letzten Folie bleibt es stehen
  useEffect(() => {
    if (pause || nr >= folien.length - 1) return
    const uhr = setTimeout(() => setNr((n) => n + 1), DAUER[art])
    return () => clearTimeout(uhr)
  }, [nr, art, pause, folien.length])

  function tippe(e) {
    if (e.target.closest('button')) return
    const r = e.currentTarget.getBoundingClientRect()
    if (e.clientX - r.left < r.width / 3) setNr((n) => Math.max(0, n - 1))
    else setNr((n) => Math.min(folien.length - 1, n + 1))
  }

  async function videoTeilen() {
    if (fortschritt !== null) return
    let v = video
    if (!v) {
      setFortschritt(0)
      try { v = await macheVideo(daten, setFortschritt) } catch { v = null }
      setFortschritt(null)
      if (!v) return bildTeilen() // Gerät kann kein Video aufnehmen
      setVideo(v)
    }
    await teileDatei(v.blob, `${APP.name}-${jahr}.${v.endung}`, `${t.teilText(jahr)} · ${APP.web}`)
  }

  async function bildTeilen() {
    const blob = await zeichneBild(daten)
    if (blob) await teileDatei(blob, `${APP.name}-${jahr}.png`, `${t.teilText(jahr)} · ${APP.web}`)
  }

  const typ = t.typen[daten.typ] ?? t.typen.woerter
  const spitze = Math.max(...daten.monate, 1)
  const stil = { '--rb1': APP.farbe1, '--rb2': APP.farbe2, '--rb-hell': APP.hell, '--rb-tief': APP.tief, '--rb-akzent': APP.akzent }

  return (
    <div className="rbx" style={stil} role="dialog" aria-modal="true">
      <div className="rbx-story" onClick={tippe} onPointerDown={() => setPause(true)} onPointerUp={() => setPause(false)} onPointerLeave={() => setPause(false)}>
        <div className="rbx-balken" aria-hidden="true">
          {folien.map((f, i) => (
            <i key={f} className={i < nr ? 'fertig' : i === nr ? 'laeuft' : ''} style={{ '--dauer': DAUER[f] + 'ms' }}>
              <b style={{ animationPlayState: pause ? 'paused' : 'running' }} />
            </i>
          ))}
        </div>
        <div className="rbx-marke"><img src={APP.logo} alt="" />{APP.name}</div>
        <button type="button" className="rbx-zu" onClick={onClose} aria-label={t.schliessen}>✕</button>

        <div className={'rbx-folie rbx-' + art} key={art}>
          {art === 'start' && (
            <>
              <div className="rbx-kreise" aria-hidden="true"><span /><span /><span /></div>
              <p className="rbx-klein rein">{t.deinJahr}</p>
              <p className="rbx-jahr">{jahr}</p>
              <p className="rbx-unter rein2">{t.malSehen}</p>
            </>
          )}
          {art === 'leer' && <p className="rbx-unter rein">{t.leer}</p>}
          {art === 'zeit' && (
            <>
              <span className="rbx-uhr" aria-hidden="true" />
              <p className="rbx-klein rein">{t.gelernt}</p>
              <p className="rbx-riesig rein2"><Zaehler ziel={z.wert} /> {z.einheit}</p>
              <p className="rbx-unter rein3">{t.filme(Math.floor(daten.minuten / 120))}</p>
            </>
          )}
          {art === 'woerter' && (
            <>
              <div className="rbx-regen" aria-hidden="true">
                {daten.wortliste.map((w, i) => (
                  <span key={w + i} style={{ left: ((i * 37) % 85) + '%', animationDuration: 3 + (i % 5) * 0.7 + 's', animationDelay: -(i * 0.45) + 's' }}>{w}</span>
                ))}
              </div>
              <div className="rbx-wortkarte rein">
                <p className="rbx-klein">{t.woerter}</p>
                <p className="rbx-riesig"><Zaehler ziel={daten.woerter} /></p>
                {daten.erstesWort && (
                  <p className="rbx-unter">{t.erstesWort}<br /><b>{daten.erstesWort}</b></p>
                )}
              </div>
            </>
          )}
          {art === 'monat' && (
            <>
              <p className="rbx-klein rein">{t.monat}</p>
              <p className="rbx-gross rein2">{monatsName(daten.besterMonat)}<br /><span>{t.monatZeile}</span></p>
              <div className="rbx-monate" aria-hidden="true">
                {daten.monate.map((m, i) => (
                  <div key={i} className={i === daten.besterMonat ? 'top' : ''}>
                    <i style={{ '--h': Math.max(4, (m / spitze) * 100) + '%', '--n': i }} />
                    <span>{monatsName(i, 'narrow')}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {art === 'serie' && (
            <>
              <p className="rbx-klein rein">{t.serie}</p>
              <p className="rbx-riesig rein2">{t.tage(daten.serie)}</p>
              <div className="rbx-flammen" aria-hidden="true">
                {Array.from({ length: Math.min(daten.serie, 30) }, (_, i) => (
                  <span key={i} style={{ '--n': i }}>{FLAMME_SVG}</span>
                ))}
              </div>
              <p className="rbx-unter rein3">{t.serieUnter(daten.serie)}</p>
            </>
          )}
          {art === 'typ' && (
            <>
              <div className="rbx-sterne" aria-hidden="true">
                {Array.from({ length: 22 }, (_, i) => (
                  <span key={i} style={{ left: ((i * 41) % 96) + '%', top: ((i * 23) % 60) + '%', animationDelay: (i % 6) * 0.25 + 's' }} />
                ))}
              </div>
              <div className="rbx-mond" aria-hidden="true" />
              <p className="rbx-klein rein">{t.typ}</p>
              <p className="rbx-gross rein2">{typ[0]}</p>
              <p className="rbx-unter rein3">{typ[1]}</p>
            </>
          )}
          {art === 'ende' && (
            <>
              <div className="rbx-endkarte rein">
                <h3>{t.meinJahr(jahr)}</h3>
                <div className="rbx-raster">
                  <div><b>{zahl(z.wert)} {z.einheit}</b><span>{t.kGelernt}</span></div>
                  <div><b>{zahl(daten.woerter)}</b><span>{t.kWoerter}</span></div>
                  <div><b>{zahl(daten.serie)}</b><span>{t.kSerie}</span></div>
                  <div><b>{zahl(daten.lerntage)}</b><span>{t.kTage}</span></div>
                </div>
              </div>
              <div className="rbx-knoepfe rein2">
                <button type="button" className="rbx-weiss" onClick={videoTeilen} disabled={fortschritt !== null}>
                  {fortschritt !== null ? t.videoLaeuft(fortschritt) : t.videoTeilen}
                </button>
                <button type="button" className="rbx-hell" onClick={bildTeilen}>{t.bildTeilen}</button>
              </div>
              <div className="rbx-branding rein3">
                <p><img src={APP.logo} alt="" /> {APP.web} · {t.lernMitMir}</p>
                <div className="rbx-stores">
                  <img src={APP.badgeApple} alt="App Store" />
                  <img src={APP.badgePlay} alt="Google Play" className="rbx-play" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Karte „Dein Jahresrückblick ist da – teile ihn!“.
 * Startseite: 27.12.–15.01. (Tester immer). Profil (imProfil): immer
 * für Tester, sonst zur selben Zeit – vergangene Jahre bleiben im Profil.
 */
export function RueckblickKarte({ imProfil = false }) {
  const tester = useMemo(() => rueckblickTester(), [])
  const vorschau = useMemo(() => {
    try { return new URLSearchParams(window.location.search).has('rueckblick') } catch { return false }
  }, [])
  const jetzt = new Date()
  const jahr = rueckblickJahr() ?? (tester ? jetzt.getFullYear() : imProfil && jetzt.getMonth() < 11 ? jetzt.getFullYear() - 1 : null)
  const [offen, setOffen] = useState(vorschau && !imProfil)
  const hatDaten = useMemo(() => (jahr ? rueckblickDaten(jahr).lerntage > 0 : false), [jahr])
  if (!jahr || (imProfil && !hatDaten && !tester)) return null
  const t = T()
  return (
    <>
      <button
        type="button"
        className={'rb-karte' + (imProfil ? ' rb-karte-profil' : '')}
        style={{ '--rb1': APP.farbe1, '--rb2': APP.farbe2, '--rb-akzent': APP.akzent }}
        onClick={() => setOffen(true)}
      >
        <img src={APP.logo} alt="" />
        <span>
          <b>{t.karteTitel(jahr)}</b>
          <small>{imProfil ? t.profilUnter : t.karteUnter}</small>
        </span>
        <span className="rb-karte-pfeil" aria-hidden="true">→</span>
      </button>
      {offen && <Jahresrueckblick jahr={jahr} onClose={() => setOffen(false)} />}
    </>
  )
}

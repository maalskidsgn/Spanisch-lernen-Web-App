/**
 * Wochenbericht per Mail (24.11.2026, Manuel): statt einer Mail je
 * Anmeldung kommt jeden Montagmorgen EIN Bericht über die Vorwoche
 * (Montag–Sonntag, deutsche Zeit) an lernen@… – mit Kennzahlen,
 * Vergleich zur Vorwoche und Diagrammen.
 *
 * Diagramme sind reine HTML-Tabellen mit farbigen Balken: Mail-Programme
 * zeigen weder SVG noch Skripte zuverlässig.
 *
 * Versand: montags ab 7 Uhr (Europe/Berlin), genau einmal je Woche – der
 * Vermerk steht im ältesten Konto (app_metadata.wochenbericht), damit ein
 * Neustart des Servers nichts doppelt schickt.
 * Empfänger: WOCHENBERICHT_AN, sonst SMTP_USER. Aus: WOCHENBERICHT_AUS=1.
 * Eigene und Test-Konten zählen nicht mit (BERICHT_AUSSCHLUSS, Regex).
 */
import { alleKonten } from './push.js'
import { schicke, mailBereit } from './mail.js'

const APP = 'Habloo'
const F = { haupt: '#ff7a1a', hell: '#ffd3b0', grund: '#fdf7f1', tief: '#d95a00' }
const AUS = new RegExp(process.env.BERICHT_AUSSCHLUSS || 'killert|habloo\\.de|davaigo\\.de|klarwerk|test|review|sloppyslipjim|knockstar|moord5555|ethaneast', 'i')
const TAG = 86400000
const WT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

const kopf = () => ({ apikey: process.env.SUPABASE_SERVICE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}` })
async function hole(pfad) {
  let alle = []
  for (let i = 0; ; i += 1000) {
    const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${pfad}`, { headers: { ...kopf(), Range: `${i}-${i + 999}` } })
    const teil = r.ok ? await r.json() : []
    if (!Array.isArray(teil)) return alle
    alle = alle.concat(teil)
    if (teil.length < 1000) return alle
  }
}
const berlin = (d) => new Date(d).toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' })
const plus = (tag, n) => new Date(Date.parse(tag + 'T12:00:00Z') + n * TAG).toISOString().slice(0, 10)
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (z) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[z])
const zahl = (n) => Number(n).toLocaleString('de-DE')
const datum = (tag, mitJahr = false) => new Date(tag + 'T12:00:00Z').toLocaleDateString('de-DE', { day: 'numeric', month: 'short', ...(mitJahr ? { year: 'numeric' } : {}), timeZone: 'UTC' })

/** Montag der Vorwoche (deutsche Zeit) als JJJJ-MM-TT */
export function vorwochenMontag(jetzt = Date.now()) {
  const heute = berlin(jetzt)
  const wt = (new Date(heute + 'T12:00:00Z').getUTCDay() + 6) % 7
  return plus(heute, -wt - 7)
}

/** Alle Zahlen einer Woche. montag = erster Tag (JJJJ-MM-TT). */
export async function berichtDaten(montag) {
  const tage = WT.map((_, i) => plus(montag, i))
  const vor = WT.map((_, i) => plus(montag, i - 7))
  const inW = new Set(tage), inV = new Set(vor)
  const konten = await alleKonten()
  const echt = konten.filter((k) => !AUS.test(k.email || ''))
  const ids = new Set(echt.map((k) => k.id))
  const neu = echt.filter((k) => inW.has(berlin(k.created_at)))
  const neuVor = echt.filter((k) => inV.has(berlin(k.created_at)))

  const xp = (await hole(`xp_tage?select=nutzer_id,tag,xp&xp=gt.0&tag=gte.${vor[0]}`)).filter((z) => ids.has(z.nutzer_id))
  const lek = (await hole(`lektion_fortschritt?select=nutzer_id,erledigt_am&erledigt_am=gte.${plus(vor[0], -1)}T00:00:00Z`))
    .filter((z) => ids.has(z.nutzer_id)).map((z) => ({ id: z.nutzer_id, tag: berlin(z.erledigt_am) }))

  // Lerntage je Konto (XP oder abgeschlossene Lektion)
  const lerntage = new Map()
  const merke = (id, tag) => { if (!lerntage.has(id)) lerntage.set(id, new Set()); lerntage.get(id).add(tag) }
  for (const z of xp) merke(z.nutzer_id, z.tag)
  for (const l of lek) merke(l.id, l.tag)
  const aktivAm = (tag) => [...lerntage].filter(([, s]) => s.has(tag)).length
  const aktivIn = (menge) => [...lerntage].filter(([, s]) => [...s].some((t) => menge.has(t))).length

  const jeTag = tage.map((tag, i) => ({
    wt: WT[i], tag,
    neu: neu.filter((k) => berlin(k.created_at) === tag).length,
    aktiv: aktivAm(tag),
    lektionen: lek.filter((l) => l.tag === tag).length,
  }))

  // Was aus den Neuen der Woche wurde
  const hatLektion = new Set(lek.map((l) => l.id))
  const trichter = {
    angemeldet: neu.length,
    gelernt: neu.filter((k) => lerntage.has(k.id)).length,
    lektion: neu.filter((k) => hatLektion.has(k.id)).length,
    wieder: neu.filter((k) => (lerntage.get(k.id)?.size ?? 0) >= 2).length,
  }
  const wege = { Apple: 0, Google: 0, 'E-Mail': 0 }
  for (const k of neu) {
    const p = k.app_metadata?.providers ?? []
    wege[p.includes('apple') ? 'Apple' : p.includes('google') ? 'Google' : 'E-Mail']++
  }

  // Fleißigste der Woche
  const xpWoche = new Map()
  for (const z of xp) if (inW.has(z.tag)) xpWoche.set(z.nutzer_id, (xpWoche.get(z.nutzer_id) || 0) + z.xp)
  const besteIds = [...xpWoche].sort((a, b) => b[1] - a[1]).slice(0, 5)
  const namen = besteIds.length ? new Map((await hole(`profile?select=id,benutzername,anzeigename&id=in.(${besteIds.map((b) => b[0]).join(',')})`)).map((p) => [p.id, p.benutzername || p.anzeigename])) : new Map()
  const beste = besteIds.map(([id, punkte]) => ({ name: namen.get(id) || 'ohne Namen', xp: punkte, lektionen: lek.filter((l) => l.id === id && inW.has(l.tag)).length }))

  // Abos: echte Käufe (kein Geschenk, kein Apple-Testkauf)
  const abos = (await hole('abos?select=nutzer_id,tarif,status,quelle,start_am,laeuft_ab,extern_id'))
    .filter((a) => a.quelle !== 'geschenk' && !String(a.extern_id || '').startsWith('2000000'))
  const laeuft = (a) => a.status !== 'abgelaufen' && (!a.laeuft_ab || Date.parse(a.laeuft_ab) > Date.now())
  const abosNeu = abos.filter((a) => inW.has(berlin(a.start_am)))

  // Sprach-Trainer in der Woche
  const sprech = (await hole(`sprech_gespraeche?select=nutzer_id,beginn,ende&beginn=gte.${plus(montag, -1)}T00:00:00Z`))
    .filter((g) => ids.has(g.nutzer_id) && inW.has(berlin(g.beginn)))
  const sprechMin = sprech.reduce((s, g) => s + (g.ende ? (Date.parse(g.ende) - Date.parse(g.beginn)) / 60000 : 0), 0)

  // KI-Funktionen werden je Monat gezählt → Stand des laufenden Monats
  const monat = tage[6].slice(0, 7)
  const [jahr, mon] = monat.split('-').map(Number)
  const naechster = mon === 12 ? `${jahr + 1}-01` : `${jahr}-${String(mon + 1).padStart(2, '0')}`
  const nutzung = await hole(`nutzung?select=nutzer_id,art,anzahl&tag=gte.${monat}-01&tag=lt.${naechster}-01`)
  const summe = (art) => nutzung.filter((n) => n.art === art && ids.has(n.nutzer_id)).reduce((s, n) => s + Number(n.anzahl), 0)
  const kosten = nutzung.filter((n) => n.art === 'kosten').reduce((s, n) => s + Number(n.anzahl), 0) / 1e6

  return {
    montag, sonntag: tage[6], jeTag, trichter, wege, beste,
    neu: neu.length, neuVor: neuVor.length,
    aktiv: aktivIn(inW), aktivVor: aktivIn(inV),
    lektionen: lek.filter((l) => inW.has(l.tag)).length, lektionenVor: lek.filter((l) => inV.has(l.tag)).length,
    abosNeu: abosNeu.length, abosAktiv: abos.filter(laeuft).length,
    sprech: { gespraeche: sprech.length, minuten: Math.round(sprechMin), nutzer: new Set(sprech.map((g) => g.nutzer_id)).size },
    ki: { monat, listen: summe('ki'), schnell: summe('schnell'), buecher: summe('buch'), videos: summe('video'), kosten },
    gesamt: echt.length, ausgeschlossen: konten.length - echt.length,
    // Stand am Ende der Berichtswoche (Sonntagabend) und eine Woche davor
    gesamtEnde: echt.filter((k) => berlin(k.created_at) <= tage[6]).length,
    gesamtVor: echt.filter((k) => berlin(k.created_at) < tage[0]).length,
  }
}

/* ---------------- Darstellung ---------------- */

function pfeil(jetzt, vorher) {
  const d = jetzt - vorher
  if (!vorher && !jetzt) return ''
  const [bg, fg, z] = d > 0 ? ['#e6f7ef', '#1d7a52', '▲ +' + zahl(d)] : d < 0 ? ['#fdecef', '#b4455a', '▼ ' + zahl(d)] : ['#f1eef4', '#8a8497', '= gleich']
  return `<span style="display:inline-block;background:${bg};color:${fg};border-radius:99px;padding:2px 9px;font-size:12px;font-weight:700">${z}</span>`
}
const kachel = (wert, name, zusatz) => `<td width="50%" style="padding:6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:#ffffff;border:1px solid #f0eaf2;border-radius:18px;padding:18px 18px 16px">
  <div style="font-size:30px;line-height:1;font-weight:800;color:#1d1b33">${wert}</div>
  <div style="margin:6px 0 8px;font-size:13px;color:#8a8497;font-weight:600">${name}</div>${zusatz || ''}
</td></tr></table></td>`
const karte = (titel, inhalt) => `<tr><td style="padding:6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:#ffffff;border:1px solid #f0eaf2;border-radius:18px;padding:20px 20px 18px">
  <div style="font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#8a8497;margin-bottom:14px">${titel}</div>${inhalt}
</td></tr></table></td></tr>`

/** Säulen je Wochentag: zwei Reihen nebeneinander */
function saeulen(jeTag, a, b) {
  const max = Math.max(1, ...jeTag.map((t) => Math.max(t[a.feld], t[b.feld])))
  const balken = (n, farbe) => `<td valign="bottom" align="center" style="padding:0 2px"><div style="font-size:11px;font-weight:700;color:#8a8497;padding-bottom:3px">${n || ''}</div><div style="width:14px;height:${Math.max(3, Math.round((n / max) * 96))}px;background:${n ? farbe : '#efeaf2'};border-radius:6px 6px 0 0;font-size:0;line-height:0">&nbsp;</div></td>`
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${jeTag.map((t) => `<td valign="bottom" align="center" height="122"><table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>${balken(t[a.feld], a.farbe)}${balken(t[b.feld], b.farbe)}</tr></table></td>`).join('')}</tr>
  <tr>${jeTag.map((t) => `<td align="center" style="padding-top:7px;border-top:2px solid #f3eff5;font-size:12px;font-weight:700;color:#8a8497">${t.wt}</td>`).join('')}</tr></table>
  <div style="margin-top:12px;font-size:12px;color:#8a8497"><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${a.farbe}"></span> ${a.name} &nbsp;&nbsp; <span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${b.farbe}"></span> ${b.name}</div>`
}
/** Waagerechte Balken (Trichter, Bestenliste) */
function zeile(name, wert, anteil, farbe, rechts) {
  const b = Math.max(2, Math.round(anteil * 100))
  return `<tr><td style="padding:5px 0;font-size:14px;font-weight:600;color:#1d1b33;width:42%">${name}</td>
  <td style="padding:5px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td width="${b}%" style="background:${farbe};border-radius:8px;height:16px;font-size:0;line-height:0">&nbsp;</td><td style="font-size:0">&nbsp;</td></tr></table></td>
  <td align="right" style="padding:5px 0 5px 10px;font-size:14px;font-weight:800;color:#1d1b33;white-space:nowrap;width:1%">${wert}${rechts ? `<span style="font-weight:600;color:#8a8497"> ${rechts}</span>` : ''}</td></tr>`
}

export function berichtHtml(d, test = false) {
  const t = d.trichter
  const pz = (n) => (t.angemeldet ? Math.round((n / t.angemeldet) * 100) + ' %' : '–')
  const lage = d.neu > d.neuVor * 1.3 && d.neu - d.neuVor >= 3 ? 'Wachstum' : d.aktiv > d.aktivVor * 1.3 && d.aktiv - d.aktivVor >= 3 ? 'Mehr Aktivität' : d.neu < d.neuVor * 0.7 && d.neuVor - d.neu >= 3 ? 'Ruhigere Woche' : 'Stabile Woche'
  const satz = `${lage}: <b>${zahl(d.neu)}</b> neue Konten (Vorwoche ${zahl(d.neuVor)}), <b>${zahl(d.aktiv)}</b> Menschen haben gelernt` +
    (t.angemeldet ? ` – von den Neuen ${pz(t.gelernt)}.` : '.')
  const wegSumme = Math.max(1, d.wege.Apple + d.wege.Google + d.wege['E-Mail'])
  const wegFarbe = { Apple: '#1d1b33', Google: F.haupt, 'E-Mail': F.hell }
  const wegBalken = Object.entries(d.wege).filter(([, n]) => n).map(([w, n]) => `<td width="${Math.round((n / wegSumme) * 100)}%" style="background:${wegFarbe[w]};height:18px;font-size:0;line-height:0">&nbsp;</td>`).join('')
  const besteMax = Math.max(1, ...d.beste.map((b) => b.xp))
  const klein = (name, wert) => `<td width="33%" align="center" style="padding:8px 4px"><div style="font-size:20px;font-weight:800;color:#1d1b33">${wert}</div><div style="font-size:12px;color:#8a8497;font-weight:600;margin-top:3px">${name}</div></td>`

  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"></head>
<body style="margin:0;padding:0;background:${F.grund};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${F.grund}"><tr><td align="center" style="padding:34px 12px 44px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="padding:0 10px 18px">
  <div style="font-size:13px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${F.haupt}">${APP} · Wochenbericht${test ? ' · Test' : ''}</div>
  <div style="font-size:26px;line-height:1.2;font-weight:800;color:#1d1b33;margin-top:6px">${datum(d.montag)} – ${datum(d.sonntag, true)}</div>
  <div style="font-size:15px;line-height:1.6;color:#6d6779;margin-top:10px">${satz}</div>
</td></tr>
<tr><td style="padding:6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:#ffe9d6;border-radius:20px;padding:22px 24px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td valign="middle"><div style="font-size:13px;font-weight:700;color:${F.tief}">Konten insgesamt</div><div style="font-size:44px;line-height:1.05;font-weight:800;color:#1d1b33;margin-top:2px">${zahl(d.gesamtEnde)}</div></td>
    <td valign="middle" align="right"><span style="display:inline-block;background:#ffffff;color:${F.tief};border-radius:99px;padding:6px 14px;font-size:14px;font-weight:800">+${zahl(d.gesamtEnde - d.gesamtVor)} in dieser Woche</span><div style="font-size:12px;font-weight:600;color:#6d6779;margin-top:8px">Vorwoche: ${zahl(d.gesamtVor)}${d.gesamt !== d.gesamtEnde ? ` · heute: ${zahl(d.gesamt)}` : ''}</div></td>
  </tr></table>
</td></tr></table></td></tr>
<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>${kachel(zahl(d.neu), 'Neue Konten', pfeil(d.neu, d.neuVor))}${kachel(zahl(d.aktiv), 'Aktive Lerner', pfeil(d.aktiv, d.aktivVor))}</tr>
  <tr>${kachel(zahl(d.lektionen), 'Lektionen abgeschlossen', pfeil(d.lektionen, d.lektionenVor))}${kachel(zahl(d.abosNeu), 'Neue Abos', `<span style="font-size:12px;color:#8a8497;font-weight:600">${zahl(d.abosAktiv)} laufen insgesamt</span>`)}</tr>
</table></td></tr>
${karte('Jeden Tag: neue Konten und aktive Lerner', saeulen(d.jeTag, { feld: 'neu', farbe: F.haupt, name: 'Neue Konten' }, { feld: 'aktiv', farbe: F.hell, name: 'Aktive Lerner' }))}
${karte('Was aus den Neuen der Woche wurde', t.angemeldet ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  ${zeile('Angemeldet', zahl(t.angemeldet), 1, F.hell)}
  ${zeile('Haben gelernt', zahl(t.gelernt), t.gelernt / t.angemeldet, F.haupt, pz(t.gelernt))}
  ${zeile('Lektion geschafft', zahl(t.lektion), t.lektion / t.angemeldet, F.haupt, pz(t.lektion))}
  ${zeile('An 2. Tag wieder da', zahl(t.wieder), t.wieder / t.angemeldet, F.tief, pz(t.wieder))}
</table>` : '<div style="font-size:14px;color:#8a8497">Diese Woche gab es keine neuen Konten.</div>')}
${t.angemeldet ? karte('Wie sie sich angemeldet haben', `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:9px;overflow:hidden"><tr>${wegBalken}</tr></table>
  <div style="margin-top:12px;font-size:13px;color:#6d6779;font-weight:600">${Object.entries(d.wege).map(([w, n]) => `<span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${wegFarbe[w]}"></span> ${w} <b style="color:#1d1b33">${n}</b>`).join(' &nbsp;&nbsp; ')}</div>`) : ''}
${d.beste.length ? karte('Die Fleißigsten der Woche', `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${d.beste.map((b, i) => zeile(`${i + 1}. ${esc(b.name)}`, zahl(b.xp) + ' XP', b.xp / besteMax, i === 0 ? F.haupt : F.hell, `· ${b.lektionen} Lekt.`)).join('')}</table>`) : ''}
${karte('Lektionen je Tag', saeulen(d.jeTag, { feld: 'lektionen', farbe: F.haupt, name: 'Abgeschlossene Lektionen' }, { feld: 'neu', farbe: '#efeaf2', name: 'zum Vergleich: neue Konten' }))}
${karte('KI und Sprach-Trainer', `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
  ${klein('Gespräche diese Woche', zahl(d.sprech.gespraeche))}${klein('Sprech-Minuten', zahl(d.sprech.minuten))}${klein('Nutzer im Gespräch', zahl(d.sprech.nutzer))}</tr><tr>
  ${klein('KI-Listen im Monat', zahl(d.ki.listen))}${klein('E-Books · Videos', zahl(d.ki.buecher) + ' · ' + zahl(d.ki.videos))}${klein('KI-Kosten im Monat', d.ki.kosten.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' $')}</tr></table>`)}
<tr><td align="center" style="padding:18px 16px 0;font-size:12px;line-height:1.7;color:#a59fb0">
  ${d.ausgeschlossen} eigene und Test-Konten sind herausgerechnet.<br>Wochen laufen von Montag bis Sonntag, deutsche Zeit. Der Bericht kommt jeden Montagmorgen.
</td></tr>
</table></td></tr></table></body></html>`
}

export async function wochenberichtSenden({ montag = vorwochenMontag(), test = false } = {}) {
  const d = await berichtDaten(montag)
  const ok = await schicke({
    an: process.env.WOCHENBERICHT_AN || process.env.SMTP_USER,
    betreff: `${test ? '[Test] ' : ''}${APP}-Wochenbericht ${datum(d.montag)} – ${datum(d.sonntag)}: ${d.gesamtEnde} Konten (+${d.neu}), ${d.aktiv} aktiv`,
    text: `${APP}-Wochenbericht ${d.montag} bis ${d.sonntag}\n\nKonten insgesamt: ${d.gesamtEnde}\nNeue Konten: ${d.neu} (Vorwoche ${d.neuVor})\nAktive Lerner: ${d.aktiv} (Vorwoche ${d.aktivVor})\nLektionen: ${d.lektionen} (Vorwoche ${d.lektionenVor})\nNeue Abos: ${d.abosNeu}, laufend ${d.abosAktiv}\nVon den Neuen gelernt: ${d.trichter.gelernt}, Lektion geschafft: ${d.trichter.lektion}, an 2. Tag wieder da: ${d.trichter.wieder}\n`,
    html: berichtHtml(d, test),
  })
  return { ok, daten: d }
}

let laeuft = false
async function runde() {
  if (laeuft || !mailBereit()) return
  const jetzt = new Date()
  const wt = jetzt.toLocaleDateString('en-GB', { timeZone: 'Europe/Berlin', weekday: 'short' })
  const stunde = Number(jetzt.toLocaleString('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', hourCycle: 'h23' }))
  if (wt !== 'Mon' || stunde < 7 || stunde >= 12) return
  laeuft = true
  try {
    const montag = vorwochenMontag()
    const aeltestes = (await alleKonten()).sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at))[0]
    if (!aeltestes || aeltestes.app_metadata?.wochenbericht === montag) return
    const r = await wochenberichtSenden({ montag })
    if (!r.ok) return
    await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users/${aeltestes.id}`, {
      method: 'PUT', headers: { ...kopf(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_metadata: { wochenbericht: montag } }),
    })
    console.log('[wochenbericht] gesendet für', montag)
  } catch (f) {
    console.warn('[wochenbericht]', f.message)
  } finally {
    laeuft = false
  }
}
export function wochenberichtStarten() {
  if (process.env.WOCHENBERICHT_AUS === '1') return
  setTimeout(runde, 2 * 60 * 1000).unref?.()
  setInterval(runde, 10 * 60 * 1000).unref?.()
}

/**
 * Erinnerungen an Tag 1 und Tag 3 nach der Registrierung (15.11.2026, Manuel).
 *
 * Warum: In der Woche 09.–15.11. hat über die Hälfte der neuen Konten
 * nach der Anmeldung gar nichts gelernt, nur 3 von 35 kamen an einem
 * zweiten Tag wieder.
 *
 * Ablauf: Alle 15 Minuten schaut der Server nach Konten mit Push-Gerät,
 * die vor 1 bzw. 3 Kalendertagen (Berliner Zeit) angelegt wurden.
 *   – Uhrzeit: ungefähr dieselbe wie bei der Registrierung, aber nur
 *     zwischen 9 und 20 Uhr (keiner wird nachts geweckt).
 *   – Wer an dem Tag schon gelernt hat (xp_tage), bekommt nichts.
 *   – Jede Erinnerung höchstens einmal: vermerkt in
 *     app_metadata.erinnert = { t1: Zeitpunkt, t3: Zeitpunkt }.
 * Ein Tipp auf die Nachricht öffnet direkt die nächste offene Lektion
 * (Link /lektionen, siehe App.jsx).
 *
 * Läuft nur, wenn Push eingerichtet ist (APNs oder FCM). Abschalten:
 * ERINNERUNGEN_AUS=1. Probelauf ohne Versand: GET /api/push/erinnerungen
 * mit X-Push-Schluessel.
 */
import { alleKonten, senden, apnsBereit, fcmBereit } from './push.js'

const TEXTE = {
  t1: {
    titel: { de: 'Dein Spanisch wartet 🔥', en: 'Your Spanish is waiting 🔥' },
    text: {
      de: 'Fünf Minuten reichen: Mach heute deine nächste Lektion und zünde deine erste Flamme.',
      en: 'Five minutes is enough: do your next lesson today and light your first streak flame.',
    },
  },
  t3: {
    titel: { de: '¡Hola! Weiter geht’s', en: '¡Hola! Ready for more?' },
    text: {
      de: 'Eine kurze Lektion heute und die neuen Wörter bleiben hängen. Tipp hier und leg direkt los.',
      en: 'One short lesson today and your new words will stick. Tap here to jump right in.',
    },
  },
}

const ZONE = 'Europe/Berlin'
const TAG_MS = 86400000
const kopf = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
  'Content-Type': 'application/json',
})

/** Kalendertag (JJJJ-MM-TT) und Stunde in Berlin */
function berlin(zeit) {
  const t = new Date(zeit)
  const tag = t.toLocaleDateString('sv-SE', { timeZone: ZONE })
  const stunde = Number(t.toLocaleString('en-GB', { timeZone: ZONE, hour: '2-digit', hourCycle: 'h23' }))
  return { tag, stunde }
}
const tageZwischen = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / TAG_MS)

async function heuteGelernt(ids, tag) {
  if (!ids.length) return new Set()
  const r = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/xp_tage?select=nutzer_id&tag=eq.${tag}&xp=gt.0&nutzer_id=in.(${ids.join(',')})`,
    { headers: kopf() },
  )
  return new Set((r.ok ? await r.json() : []).map((z) => z.nutzer_id))
}

async function vermerken(konto, stufe, wert) {
  const erinnert = { ...(konto.app_metadata?.erinnert ?? {}), [stufe]: wert }
  await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users/${konto.id}`, {
    method: 'PUT', headers: kopf(),
    body: JSON.stringify({ app_metadata: { erinnert } }),
  })
}

/**
 * Ein Durchgang. probe: nur auflisten, nichts senden und nichts vermerken.
 * jetzt: für Tests ein anderer Zeitpunkt.
 */
export async function erinnerungenPruefen({ probe = false, jetzt = Date.now() } = {}) {
  const heute = berlin(jetzt)
  const grenze = jetzt - 5 * TAG_MS
  const konten = (await alleKonten()).filter(
    (k) => k.app_metadata?.push_geraete?.length && Date.parse(k.created_at) > grenze,
  )
  const faellig = []
  for (const k of konten) {
    const reg = berlin(k.created_at)
    const tage = tageZwischen(reg.tag, heute.tag)
    const stufe = tage === 1 ? 't1' : tage === 3 ? 't3' : null
    if (!stufe || k.app_metadata?.erinnert?.[stufe]) continue
    if (heute.stunde < Math.min(20, Math.max(9, reg.stunde))) continue
    faellig.push({ konto: k, stufe })
  }
  const gelernt = await heuteGelernt(faellig.map((f) => f.konto.id), heute.tag)
  const ergebnis = { geprueft: konten.length, faellig: faellig.length, gesendet: 0, schonGelernt: 0, liste: [] }
  for (const { konto, stufe } of faellig) {
    const schon = gelernt.has(konto.id)
    ergebnis.liste.push({ id: konto.id.slice(0, 8), stufe, schonGelernt: schon })
    if (probe) continue
    if (schon) {
      ergebnis.schonGelernt++
      await vermerken(konto, stufe, 'gelernt').catch(() => {})
      continue
    }
    // Nur vermerken, wenn das Gerät überhaupt erreichbar ist – sonst käme
    // die Erinnerung nie, sobald die zweite Plattform eingerichtet ist.
    const erreichbar = konto.app_metadata.push_geraete.some(
      (g) => (g.plattform === 'ios' && apnsBereit()) || (g.plattform === 'android' && fcmBereit()),
    )
    if (!erreichbar) continue
    const t = TEXTE[stufe]
    const r = await senden({ titel: t.titel, text: t.text, link: '/lektionen', ziel: { nutzer: [konto.id] } }, [konto])
    ergebnis.gesendet += r.gesendet
    // Auch ohne Erfolg vermerken: lieber eine Erinnerung zu wenig als dieselbe alle 15 Minuten
    await vermerken(konto, stufe, new Date(jetzt).toISOString()).catch(() => {})
  }
  return ergebnis
}

let laeuft = false
/** Einmal beim Serverstart aufrufen. */
export function erinnerungenStarten() {
  if (process.env.ERINNERUNGEN_AUS === '1') return
  const runde = async () => {
    if (laeuft || !(apnsBereit() || fcmBereit())) return
    laeuft = true
    try {
      const r = await erinnerungenPruefen()
      if (r.faellig) console.log('[erinnerungen]', JSON.stringify({ ...r, liste: undefined }))
    } catch (f) {
      console.warn('[erinnerungen]', f.message)
    } finally {
      laeuft = false
    }
  }
  setTimeout(runde, 60 * 1000).unref?.()
  setInterval(runde, 15 * 60 * 1000).unref?.()
}

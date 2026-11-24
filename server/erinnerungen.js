/**
 * Push-Erinnerungen (15.11.2026, erweitert 17.11.2026, Manuel).
 *
 * 1) Neue Konten: Tag 1, Tag 3 und Tag 7 nach der Registrierung.
 *    Warum: In der Woche 09.–15.11. hat über die Hälfte der neuen Konten
 *    nach der Anmeldung gar nichts gelernt, nur 3 von 35 kamen an einem
 *    zweiten Tag wieder.
 *    – Uhrzeit: ungefähr dieselbe wie bei der Registrierung, aber nur
 *      zwischen 9 und 20 Uhr (keiner wird nachts geweckt).
 *    – Wer an dem Tag schon gelernt hat, bekommt nichts.
 *
 * 2) Flamme in Gefahr (alle Konten): Die Flamme hat einen Puffertag
 *    (17.11.2026, wie bei Babbel). Wer VORGESTERN zuletzt gelernt hat, hat
 *    heute die letzte Chance – ab 19 Uhr kommt eine Erinnerung, sonst ist
 *    die Serie um Mitternacht weg. Nach 22 Uhr kommt nichts mehr.
 *
 * Für alle gilt:
 *   – Ortszeit des Geräts (die App meldet ihre Zeitzone mit an; ältere
 *     Anmeldungen ohne Zone zählen als Berlin).
 *   – Höchstens EINE Erinnerung am Tag.
 *   – Jede Stufe nur einmal: vermerkt in app_metadata.erinnert =
 *     { t1, t3, t7: Zeitpunkt, flamme: letzter Tag, zuletzt: letzter Tag }.
 * Ein Tipp auf die Nachricht öffnet direkt die nächste offene Lektion
 * (Link /lektionen, siehe App.jsx).
 *
 * Läuft nur, wenn Push eingerichtet ist (APNs oder FCM). Abschalten:
 * ERINNERUNGEN_AUS=1. Probelauf ohne Versand: GET /api/push/erinnerungen
 * mit X-Push-Schluessel.
 */
import { alleKonten, senden, apnsBereit, fcmBereit } from './push.js'
import { erinnerungsMail, erinnerungMailBereit } from './erinnerungMail.js'

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
  t7: {
    titel: { de: 'Eine Woche Habloo 🎉', en: 'One week of Habloo 🎉' },
    text: {
      de: 'Vor einer Woche hast du angefangen. Eine Lektion heute – und Spanisch wird zur Gewohnheit.',
      en: 'You started a week ago. One lesson today and Spanish becomes a habit.',
    },
  },
}

const ZONE = 'Europe/Berlin'
const TAG_MS = 86400000
const STUFEN = { 1: 't1', 3: 't3', 7: 't7' }
const FLAMME_AB = 19 // Uhr Ortszeit
const FLAMME_BIS = 22
const kopf = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
  'Content-Type': 'application/json',
})

/** Zeitzone des Kontos: die zuletzt gemeldete gültige, sonst Berlin. */
function zoneVon(konto) {
  for (const g of konto.app_metadata?.push_geraete ?? []) {
    if (!g.zone) continue
    try { new Date().toLocaleString('en-GB', { timeZone: g.zone }); return g.zone } catch { /* ungültig */ }
  }
  return ZONE
}

/** Kalendertag (JJJJ-MM-TT) und Stunde in einer Zeitzone */
function ortszeit(zeit, zone) {
  const t = new Date(zeit)
  const tag = t.toLocaleDateString('sv-SE', { timeZone: zone })
  const stunde = Number(t.toLocaleString('en-GB', { timeZone: zone, hour: '2-digit', hourCycle: 'h23' }))
  return { tag, stunde }
}
const tageZwischen = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / TAG_MS)
const gestern = (tag) => new Date(Date.parse(tag) - TAG_MS).toISOString().slice(0, 10)

/** Serie und letzter Lerntag je Konto (Tabelle statistik, Ortsdatum der App). */
async function statistik(ids) {
  const karte = new Map()
  for (let i = 0; i < ids.length; i += 150) {
    const stueck = ids.slice(i, i + 150)
    const r = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/statistik?select=nutzer_id,serie,letzter_tag&nutzer_id=in.(${stueck.join(',')})`,
      { headers: kopf() },
    )
    for (const z of r.ok ? await r.json() : []) karte.set(z.nutzer_id, z)
  }
  return karte
}

/** Wer hat an seinem heutigen Tag schon XP? (xp_tage, Ortsdatum der App) */
async function heuteGelernt(paare) {
  if (!paare.length) return new Set()
  const tage = [...new Set(paare.map((p) => p.tag))]
  const ids = paare.map((p) => p.id)
  const r = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/xp_tage?select=nutzer_id,tag&xp=gt.0&tag=in.(${tage.join(',')})&nutzer_id=in.(${ids.join(',')})`,
    { headers: kopf() },
  )
  const soll = new Map(paare.map((p) => [p.id, p.tag]))
  return new Set((r.ok ? await r.json() : []).filter((z) => soll.get(z.nutzer_id) === z.tag).map((z) => z.nutzer_id))
}

async function vermerken(konto, neu) {
  const erinnert = { ...(konto.app_metadata?.erinnert ?? {}), ...neu }
  konto.app_metadata = { ...konto.app_metadata, erinnert }
  await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users/${konto.id}`, {
    method: 'PUT', headers: kopf(),
    body: JSON.stringify({ app_metadata: { erinnert } }),
  })
}

const erreichbar = (konto) => (konto.app_metadata?.push_geraete ?? []).some(
  (g) => (g.plattform === 'ios' && apnsBereit()) || (g.plattform === 'android' && fcmBereit()),
)

/** Welche Erinnerung ist für dieses Konto jetzt dran? null = keine. */
function welche(konto, stat, jetzt) {
  const zone = zoneVon(konto)
  const heute = ortszeit(jetzt, zone)
  const erinnert = konto.app_metadata?.erinnert ?? {}
  if (erinnert.zuletzt === heute.tag) return null // heute schon eine bekommen

  // 1) Neue Konten: Tag 1 / 3 / 7
  const reg = ortszeit(konto.created_at, zone)
  const stufe = STUFEN[tageZwischen(reg.tag, heute.tag)]
  if (stufe && !erinnert[stufe] && heute.stunde >= Math.min(20, Math.max(9, reg.stunde)) && heute.stunde < 21) {
    return { art: stufe, tag: heute.tag }
  }

  // 2) Flamme in Gefahr
  const serie = Number(stat?.serie) || 0
  if (
    serie >= 1 &&
    stat?.letzter_tag === gestern(gestern(heute.tag)) &&
    erinnert.flamme !== heute.tag &&
    heute.stunde >= FLAMME_AB && heute.stunde < FLAMME_BIS
  ) {
    return { art: 'flamme', tag: heute.tag, serie }
  }
  return null
}

/**
 * Ein Durchgang. probe: nur auflisten, nichts senden und nichts vermerken.
 * jetzt: für Tests ein anderer Zeitpunkt.
 */
export async function erinnerungenPruefen({ probe = false, jetzt = Date.now() } = {}) {
  // Push, wenn ein Gerät erreichbar ist – sonst Mail (22.11.2026), nie beides
  const pushAn = apnsBereit() || fcmBereit()
  const mailAn = erinnerungMailBereit()
  // Apples versteckte Adressen (…@privaterelay.appleid.com) nehmen Mails nur von bei Apple
  // eingetragenen Absendern an – sonst kommt „unauthorized sender“ zurück (24.11.2026).
  // Bis der Absender dort eingetragen ist, gehen an diese Adressen keine Mails; danach
  // in Coolify APPLE_RELAY_OK=1 setzen.
  const relayGesperrt = (mail) => /@privaterelay\.appleid\.com$/i.test(mail) && process.env.APPLE_RELAY_OK !== '1'
  const kanal = (k) => (pushAn && erreichbar(k) ? 'push' : mailAn && k.email && !relayGesperrt(k.email) && !k.app_metadata?.erinnerung_mail_aus ? 'mail' : null)
  const konten = (await alleKonten()).filter((k) => kanal(k))
  const stats = await statistik(konten.map((k) => k.id))
  const faellig = []
  for (const k of konten) {
    const w = welche(k, stats.get(k.id), jetzt)
    if (w) faellig.push({ konto: k, ...w })
  }
  const gelernt = await heuteGelernt(faellig.map((f) => ({ id: f.konto.id, tag: f.tag })))
  const ergebnis = { geprueft: konten.length, faellig: faellig.length, gesendet: 0, schonGelernt: 0, liste: [] }
  for (const f of faellig) {
    const { konto, art, tag } = f
    // „Heute gelernt“ auch aus der Statistik, falls xp_tage hinterherhängt
    const schon = gelernt.has(konto.id) || stats.get(konto.id)?.letzter_tag === tag
    ergebnis.liste.push({ id: konto.id.slice(0, 8), art, kanal: kanal(konto), schonGelernt: schon })
    if (probe) continue
    if (schon) {
      ergebnis.schonGelernt++
      // Tag-Stufen erledigen sich durchs Lernen; die Flamme prüft morgen neu
      if (art !== 'flamme') await vermerken(konto, { [art]: 'gelernt' }).catch(() => {})
      continue
    }
    // Nur vermerken, wenn das Gerät überhaupt erreichbar ist – sonst käme
    // die Erinnerung nie, sobald die zweite Plattform eingerichtet ist.
    const weg = kanal(konto)
    if (!weg) continue
    const t = art === 'flamme' ? flammenText(f.serie) : TEXTE[art]
    if (weg === 'push') {
      const r = await senden({ titel: t.titel, text: t.text, link: '/lektionen', ziel: { nutzer: [konto.id] } }, [konto])
      ergebnis.gesendet += r.gesendet
    } else {
      // Mail: der Text ohne Emoji im Betreff wirkt seriöser – Titel bleibt aber gleich
      if (await erinnerungsMail(konto, t)) { ergebnis.gesendet++; ergebnis.mails = (ergebnis.mails || 0) + 1 }
    }
    // Auch ohne Erfolg vermerken: lieber eine Erinnerung zu wenig als dieselbe alle 15 Minuten
    const vermerk = art === 'flamme' ? { flamme: tag, zuletzt: tag } : { [art]: new Date(jetzt).toISOString(), zuletzt: tag }
    await vermerken(konto, vermerk).catch(() => {})
  }
  return ergebnis
}

function flammenText(serie) {
  return {
    titel: { de: 'Deine Flamme geht gleich aus 🔥', en: 'Your streak is about to go out 🔥' },
    text: serie > 1
      ? {
          de: `Deine Serie von ${serie} Tagen hält nur noch heute. Ein paar Minuten reichen – sonst ist sie um Mitternacht weg.`,
          en: `Your ${serie}-day streak only lasts until tonight. A few minutes is enough – otherwise it's gone at midnight.`,
        }
      : {
          de: 'Deine Flamme brennt nur noch heute. Lern kurz weiter, sonst geht sie um Mitternacht aus.',
          en: 'Your flame only lasts until tonight. Learn a little or it goes out at midnight.',
        },
  }
}

let laeuft = false
/** Einmal beim Serverstart aufrufen. */
export function erinnerungenStarten() {
  if (process.env.ERINNERUNGEN_AUS === '1') return
  const runde = async () => {
    if (laeuft || !(apnsBereit() || fcmBereit() || erinnerungMailBereit())) return
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

/**
 * Mail an das eigene Postfach, sobald sich jemand neu registriert
 * (19.11.2026, Manuel: "Mail-Benachrichtigung bei jedem neuen Konto an lernen@").
 *
 * Alle 5 Minuten werden die Konten gelesen. Wer nach START angelegt wurde
 * und noch keinen Vermerk app_metadata.neu_gemeldet hat, wird gemeldet –
 * eine Mail je Konto. Der Vermerk steht im Konto selbst, deshalb gehen
 * auch bei einem Neustart des Servers keine Anmeldungen verloren und es
 * kommt keine doppelt.
 *
 * Empfänger: NEUE_KONTEN_AN, sonst das Versandpostfach (SMTP_USER =
 * lernen@…). Abschalten: NEUE_KONTEN_AUS=1.
 */
import { alleKonten } from './push.js'
import { schicke, mailBereit } from './mail.js'

const APP = 'Habloo'
const START = Date.parse('2026-11-19T11:00:00Z') // ältere Konten nicht nachmelden
const kopf = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
  'Content-Type': 'application/json',
})
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (z) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[z])
const berlin = (t) => new Date(t).toLocaleString('de-DE', { timeZone: 'Europe/Berlin', dateStyle: 'medium', timeStyle: 'short' })

const WEG = { email: 'E-Mail', google: 'Google', apple: 'Apple' }

function mail(konto, gesamt, heute) {
  const name = konto.user_metadata?.full_name || konto.user_metadata?.name || ''
  const wege = (konto.app_metadata?.providers ?? [konto.app_metadata?.provider]).filter(Boolean).map((p) => WEG[p] || p).join(', ') || 'E-Mail'
  const sprache = konto.user_metadata?.sprache === 'en' ? 'Englisch' : konto.user_metadata?.sprache === 'de' ? 'Deutsch' : '–'
  const zeilen = [
    ['E-Mail', konto.email || '–'],
    ['Name', name || '–'],
    ['Anmeldung über', wege],
    ['App-Sprache', sprache],
    ['Zeit', berlin(konto.created_at) + ' Uhr'],
  ]
  const betreff = `Neues ${APP}-Konto: ${konto.email || name || konto.id.slice(0, 8)}`
  const text = `Neues Konto bei ${APP}\n\n` + zeilen.map(([a, b]) => `${a}: ${b}`).join('\n') +
    `\n\nHeute neu: ${heute} · Konten gesamt: ${gesamt}\n`
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#fdf7f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf7f1"><tr><td align="center" style="padding:28px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;background:#fff;border-radius:20px;border:1px solid #eee6f0">
<tr><td style="padding:28px 28px 8px">
  <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#ff6c00">${APP}</p>
  <p style="margin:0 0 18px;font-size:20px;font-weight:800;color:#1d1b33">Neues Konto 🎉</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.5">
  ${zeilen.map(([a, b]) => `<tr><td style="padding:6px 0;color:#8a8497;width:130px;vertical-align:top">${a}</td><td style="padding:6px 0;color:#1d1b33;font-weight:600">${esc(b)}</td></tr>`).join('')}
  </table>
</td></tr>
<tr><td style="padding:14px 28px 24px">
  <p style="margin:0;padding-top:14px;border-top:1px solid #f1ecf3;font-size:13px;color:#8a8497">Heute neu: <b style="color:#1d1b33">${heute}</b> · Konten gesamt: <b style="color:#1d1b33">${gesamt}</b></p>
</td></tr></table></td></tr></table></body></html>`
  return { betreff, text, html }
}

async function vermerken(konto) {
  await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users/${konto.id}`, {
    method: 'PUT', headers: kopf(),
    body: JSON.stringify({ app_metadata: { neu_gemeldet: new Date().toISOString() } }),
  })
}

let laeuft = false
export async function neueKontenPruefen() {
  if (laeuft || !mailBereit()) return 0
  laeuft = true
  try {
    const konten = await alleKonten()
    if (!konten.length) return 0
    const heuteTag = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' })
    const heute = konten.filter((k) => new Date(k.created_at).toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' }) === heuteTag).length
    const neu = konten
      .filter((k) => Date.parse(k.created_at) >= START && !k.app_metadata?.neu_gemeldet)
      .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at))
      .slice(0, 20) // Schutz gegen eine Bot-Welle: höchstens 20 Mails je Runde
    let n = 0
    for (const k of neu) {
      const m = mail(k, konten.length, heute)
      const ok = await schicke({ an: process.env.NEUE_KONTEN_AN || process.env.SMTP_USER, betreff: m.betreff, text: m.text, html: m.html })
      if (!ok) break // Mailserver klemmt: nächste Runde erneut versuchen
      await vermerken(k).catch(() => {})
      n++
    }
    if (n) console.log(`[neue-konten] ${n} gemeldet`)
    return n
  } catch (f) {
    console.warn('[neue-konten]', f.message)
    return 0
  } finally {
    laeuft = false
  }
}

export function neueKontenStarten() {
  if (process.env.NEUE_KONTEN_AUS === '1') return
  setTimeout(neueKontenPruefen, 90 * 1000).unref?.()
  setInterval(neueKontenPruefen, 5 * 60 * 1000).unref?.()
}

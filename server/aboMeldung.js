/**
 * Mail an das eigene Postfach bei jedem NEUEN Abo bzw. Lifetime-Kauf
 * (22.11.2026, Manuel: "Mail mit Glückwunsch, wenn jemand abonniert").
 *
 * Ausgelöst von:
 *   – kauf.js (RevenueCat: App Store / Google Play) bei INITIAL_PURCHASE
 *     und NON_RENEWING_PURCHASE – Verlängerungen melden NICHT
 *   – bezahlung.js (Stripe, Web) bei der ersten bezahlten Rechnung eines
 *     Abos (billing_reason subscription_create) und beim Lifetime-Kauf
 * Empfänger: NEUE_ABOS_AN, sonst NEUE_KONTEN_AN, sonst SMTP_USER (lernen@…).
 * Wirft nie – ein Mailfehler darf keinen Kauf aufhalten.
 */
import { schicke, mailBereit } from './mail.js'

const APP = 'Habloo'
const TARIF = { monatlich: 'Monatsabo', jaehrlich: 'Jahresabo', lifetime: 'Lifetime' }
const QUELLE = { apple: 'App Store (iPhone)', google: 'Google Play (Android)', stripe: 'Web (Stripe)', geschenk: 'RevenueCat' }
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (z) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[z])

async function konto(nutzerId) {
  try {
    const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users/${nutzerId}`, {
      headers: { apikey: process.env.SUPABASE_SERVICE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}` },
    })
    return r.ok ? await r.json() : null
  } catch { return null }
}

function betragText(betrag, waehrung) {
  if (betrag == null || Number.isNaN(Number(betrag))) return '–'
  try { return new Intl.NumberFormat('de-DE', { style: 'currency', currency: String(waehrung || 'EUR').toUpperCase() }).format(Number(betrag)) }
  catch { return `${betrag} ${waehrung || ''}`.trim() }
}

/** betrag in Währungseinheiten (nicht Cent). test=true → „Testkauf“ im Betreff. */
export async function meldeNeuesAbo({ nutzerId, tarif, quelle, betrag, waehrung, test = false, land }) {
  try {
    if (!mailBereit()) return false
    const k = nutzerId ? await konto(nutzerId) : null
    const zeilen = [
      ['Tarif', TARIF[tarif] || tarif || '–'],
      ['Preis', betragText(betrag, waehrung)],
      ['Gekauft über', QUELLE[quelle] || quelle || '–'],
      ['Konto', k?.email || (nutzerId ? nutzerId.slice(0, 8) : '–')],
      ['Name', k?.user_metadata?.full_name || k?.user_metadata?.name || '–'],
      ...(land ? [['Land', land]] : []),
      ['Zeit', new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin', dateStyle: 'medium', timeStyle: 'short' }) + ' Uhr'],
    ]
    const betreff = `${test ? '[Testkauf] ' : ''}🎉 Glückwunsch – neues ${APP}-${tarif === 'lifetime' ? 'Lifetime' : 'Abo'}!`
    const text = `Glückwunsch! Neues ${APP} Premium${test ? ' (Testkauf)' : ''}\n\n` + zeilen.map(([a, b]) => `${a}: ${b}`).join('\n') + '\n'
    const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#fdf7f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf7f1"><tr><td align="center" style="padding:28px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;background:#fff;border-radius:20px;border:1px solid #eee6f0">
<tr><td align="center" style="padding:32px 28px 6px">
  <div style="font-size:44px;line-height:1">🎉</div>
  <p style="margin:14px 0 4px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#ff6c00">${APP} Premium${test ? ' · Testkauf' : ''}</p>
  <p style="margin:0 0 6px;font-size:22px;font-weight:800;color:#1d1b33">Glückwunsch – neues ${tarif === 'lifetime' ? 'Lifetime-Mitglied' : 'Abo'}!</p>
  <p style="margin:0 0 18px;font-size:30px;font-weight:800;color:#ff6c00">${esc(betragText(betrag, waehrung))}</p>
</td></tr>
<tr><td style="padding:0 28px 26px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.5;border-top:1px solid #f1ecf3">
  ${zeilen.map(([a, b]) => `<tr><td style="padding:7px 0;color:#8a8497;width:120px;vertical-align:top">${a}</td><td style="padding:7px 0;color:#1d1b33;font-weight:600">${esc(b)}</td></tr>`).join('')}
  </table>
</td></tr></table></td></tr></table></body></html>`
    const ok = await schicke({ an: process.env.NEUE_ABOS_AN || process.env.NEUE_KONTEN_AN || process.env.SMTP_USER, betreff, text, html })
    console.log('[abo-meldung]', ok ? 'gesendet' : 'nicht gesendet', tarif, quelle)
    return ok
  } catch (f) {
    console.warn('[abo-meldung]', f.message)
    return false
  }
}

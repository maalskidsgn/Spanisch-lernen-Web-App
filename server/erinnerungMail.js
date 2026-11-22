/**
 * Erinnerungen per Mail für alle, die KEINE Push-Nachrichten bekommen
 * (Push abgelehnt, nur im Browser, ältere App) – 22.11.2026, Manuel:
 * „wenn jemand Push ablehnt, dann Mail“. Nie beides: erinnerungen.js
 * nimmt Push, wenn ein Gerät erreichbar ist, sonst diese Mail.
 *
 * Jede Mail hat einen Abmelde-Link (/api/erinnerungen/abmelden), der
 * app_metadata.erinnerung_mail_aus setzt. Signiert, damit niemand
 * fremde Konten abmelden kann.
 */
import { createHmac } from 'node:crypto'
import { schicke, mailBereit } from './mail.js'

const APP = 'Habloo'
const WEB = process.env.WEB_URL || 'https://habloo.de'
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (z) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[z])

export const erinnerungMailBereit = () => mailBereit() && process.env.ERINNERUNG_MAILS_AUS !== '1'

export function abmeldeZeichen(id) {
  return createHmac('sha256', process.env.SUPABASE_SERVICE_KEY || 'x').update('abmelden:' + id).digest('hex').slice(0, 24)
}
export const abmeldeLink = (id) => `${WEB}/api/erinnerungen/abmelden?id=${id}&z=${abmeldeZeichen(id)}`

const W = {
  de: { knopf: 'Jetzt weiterlernen', fuss: 'Du bekommst diese Erinnerung, weil du ein Konto bei ' + APP + ' hast.', ab: 'Keine Erinnerungen mehr per Mail', gruss: 'Viel Spaß beim Lernen!' },
  en: { knopf: 'Continue learning', fuss: 'You are getting this reminder because you have a ' + APP + ' account.', ab: 'Stop reminder emails', gruss: 'Have fun learning!' },
}

/** titel/text wie bei der Push-Nachricht ({de,en}) */
export async function erinnerungsMail(konto, { titel, text }) {
  if (!konto?.email || !erinnerungMailBereit()) return false
  const sp = konto.user_metadata?.sprache === 'en' ? 'en' : 'de'
  const w = W[sp]
  const t = titel[sp] ?? titel.de, x = text[sp] ?? text.de
  const link = WEB + '/?ziel=lektionen'
  const ab = abmeldeLink(konto.id)
  const html = `<!doctype html><html lang="${sp}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"></head>
<body style="margin:0;padding:0;background:#fdf7f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf7f1"><tr><td align="center" style="padding:36px 16px 44px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:460px">
<tr><td align="center" style="padding-bottom:20px"><span style="font-size:22px;font-weight:800;color:#1d1b33">${APP}</span><span style="font-size:22px;font-weight:800;color:#ff6c00">.</span></td></tr>
<tr><td style="background:#ffffff;border-radius:22px;border:1px solid #eee8ef;padding:38px 32px;text-align:center">
  <p style="margin:0 0 12px;font-size:22px;line-height:1.35;font-weight:800;color:#1d1b33">${esc(t)}</p>
  <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#7b7386">${esc(x)}</p>
  <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr><td style="background:#ff6c00;border-radius:14px;border-bottom:3px solid #d95a00">
    <a href="${link}" style="display:inline-block;padding:14px 30px;color:#fff;text-decoration:none;font-weight:700;font-size:15px">${w.knopf}</a>
  </td></tr></table>
  <p style="margin:26px 0 0;font-size:13px;color:#a59fb0">${w.gruss}</p>
</td></tr>
<tr><td align="center" style="padding:20px 12px 0"><p style="margin:0;font-size:12px;line-height:1.7;color:#a59fb0">${w.fuss}<br><a href="${ab}" style="color:#a59fb0;text-decoration:underline">${w.ab}</a></p></td></tr>
</table></td></tr></table></body></html>`
  return schicke({
    an: konto.email, betreff: t,
    text: `${t}\n\n${x}\n\n${link}\n\n—\n${w.ab}: ${ab}\n`,
    html,
  })
}

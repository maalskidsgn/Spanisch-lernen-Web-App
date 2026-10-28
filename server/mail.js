/**
 * Mailversand für Habloo.
 *
 * Bisher verschickte nur Supabase (Anmeldebestätigung, Passwort
 * vergessen). Das hier ist der erste eigene Versand: die Nachricht,
 * dass jemand eine Freundschaftsanfrage geschickt hat.
 *
 * Es läuft über dasselbe Postfach wie die Auth-Mails
 * (lernen@habloo.de bei All-Inkl, Port 587) – ein zweiter Absender
 * würde die mühsam eingerichtete SPF/DMARC-Lage nur gefährden.
 *
 * Fehlen die Zugangsdaten, passiert still nichts. Eine Anfrage darf
 * nicht daran scheitern, dass der Mailserver klemmt.
 */

import nodemailer from 'nodemailer'

let versand = null

export function mailBereit() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

function verbindung() {
  if (versand) return versand
  const port = Number(process.env.SMTP_PORT || 587)
  versand = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // 465 spricht von Anfang an verschlüsselt, 587 steigt per
    // STARTTLS um. Beides geht bei All-Inkl.
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  return versand
}

/** Schickt eine Mail. Wirft nicht – meldet nur, ob es geklappt hat. */
export async function schicke({ an, betreff, text, html }) {
  if (!mailBereit()) return false
  try {
    await verbindung().sendMail({
      from: process.env.SMTP_FROM || `Habloo <${process.env.SMTP_USER}>`,
      to: an,
      subject: betreff,
      text,
      html,
    })
    return true
  } catch (fehler) {
    console.error('Mailversand:', fehler.message)
    return false
  }
}

/** Die Vorlage für alle Habloo-Mails: schlicht, in Markenfarbe. */
function rahmen(inhalt) {
  return `<!doctype html><html lang="de"><body style="margin:0;padding:24px;background:#fdf7f1;
  font-family:-apple-system,'Segoe UI',Roboto,sans-serif;color:#000041">
  <div style="max-width:460px;margin:0 auto;background:#fff;border-radius:18px;
    border:1px solid #eee8e0;padding:28px 24px">
    <div style="font-size:20px;font-weight:800;color:#000041;margin-bottom:20px">Habloo</div>
    ${inhalt}
  </div>
  <p style="max-width:460px;margin:16px auto 0;font-size:12px;color:#8a8076;text-align:center">
    Du bekommst diese Nachricht, weil jemand bei Habloo mit dir lernen möchte.
  </p></body></html>`
}

/**
 * "X möchte mit dir lernen."
 *
 * Bewusst ohne Annehmen-Knopf in der Mail: Dafür bräuchte es einen
 * Link mit Token, und ein Klick aus dem Postfach heraus soll keine
 * Freundschaft schließen können.
 */
export function freundschaftsanfrage({ von, adresse }) {
  const name = String(von).slice(0, 40)
  return {
    betreff: `${name} möchte mit dir Spanisch lernen`,
    text:
      `${name} hat dir bei Habloo eine Freundschaftsanfrage geschickt.\n\n` +
      `Öffne die App und schau unter Profil → Freunde nach.\n\n${adresse}\n`,
    html: rahmen(
      `<p style="margin:0 0 6px;font-size:17px;line-height:1.5">
        <b>${name}</b> möchte mit dir Spanisch lernen.
      </p>
      <p style="margin:0 0 22px;font-size:15px;line-height:1.5;color:#756a5c">
        Nimm die Anfrage an, dann seht ihr euch gegenseitig in der Rangliste –
        und könnt sehen, wer fleißiger ist.
      </p>
      <a href="${adresse}" style="display:inline-block;background:#ff6c00;color:#fff;
        text-decoration:none;padding:13px 26px;border-radius:14px;font-weight:800;font-size:15px">
        Anfrage ansehen
      </a>`
    ),
  }
}

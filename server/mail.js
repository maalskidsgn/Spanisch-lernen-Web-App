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

/**
 * Die Vorlage für alle Habloo-Mails.
 *
 * Alles in Tabellen und mit Stilen direkt am Element: Outlook und
 * Gmail werfen `<style>`-Blöcke und moderne CSS-Eigenschaften raus,
 * und eine Mail, die nur in einem Postfach gut aussieht, ist keine.
 */
function rahmen({ inhalt, fusszeile }) {
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"></head>
<body style="margin:0;padding:0;background:#fdf7f1;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
  -webkit-font-smoothing:antialiased">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
  style="background:#fdf7f1">
  <tr><td align="center" style="padding:32px 16px 40px">

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
      style="max-width:480px">

      <!-- Wortmarke -->
      <tr><td align="center" style="padding-bottom:20px">
        <span style="font-size:22px;font-weight:800;letter-spacing:-.4px;color:#000041">Habloo</span><span
          style="color:#ff6c00;font-size:22px;font-weight:800">.</span>
      </td></tr>

      <!-- Karte -->
      <tr><td style="background:#ffffff;border-radius:20px;border:1px solid #f0e9e1;
        padding:36px 32px">
        ${inhalt}
      </td></tr>

      <!-- Fußzeile -->
      <tr><td align="center" style="padding:20px 12px 0">
        <p style="margin:0;font-size:12px;line-height:1.6;color:#a2988c">
          ${fusszeile}<br>
          <a href="https://habloo.de" style="color:#a2988c;text-decoration:underline">habloo.de</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`
}

/** Der orange Knopf. Als Tabelle, damit Outlook ihn nicht zerlegt. */
function knopf(text, adresse) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center" style="background:#ff6c00;border-radius:14px">
      <a href="${adresse}" style="display:inline-block;padding:14px 30px;color:#ffffff;
        text-decoration:none;font-weight:700;font-size:15px;letter-spacing:.1px">${text}</a>
    </td></tr></table>`
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
  const initiale = name.charAt(0).toUpperCase()

  return {
    betreff: `${name} möchte mit dir Spanisch lernen`,
    text:
      `${name} hat dir bei Habloo eine Freundschaftsanfrage geschickt.\n\n` +
      `Öffne die App und schau unter Profil → Freunde nach.\n\n${adresse}\n`,
    html: rahmen({
      fusszeile: 'Du bekommst diese Nachricht, weil jemand bei Habloo mit dir lernen möchte.',
      inhalt: `
        <!-- Kreis mit dem Anfangsbuchstaben: ein Gesicht statt nur Text -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"
          style="margin:0 auto 22px">
          <tr><td align="center" width="76" height="76" valign="middle"
            style="width:76px;height:76px;background:#ff6c00;border-radius:38px;
              color:#ffffff;font-size:32px;font-weight:800;line-height:76px;
              text-align:center">${initiale}</td></tr>
        </table>

        <p style="margin:0 0 10px;font-size:21px;line-height:1.35;font-weight:800;
          color:#000041;text-align:center;letter-spacing:-.3px">
          ${name} möchte mit dir<br>Spanisch lernen
        </p>

        <p style="margin:0 0 26px;font-size:15px;line-height:1.65;color:#7b7064;
          text-align:center">
          Nimm die Anfrage an – dann seht ihr euch gegenseitig in der Rangliste
          und könnt schauen, wer fleißiger ist.
        </p>

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"
          style="margin:0 auto">
          <tr><td align="center">${knopf('Anfrage ansehen', adresse)}</td></tr>
        </table>

        <p style="margin:26px 0 0;padding-top:20px;border-top:1px solid #f4ede5;
          font-size:13px;line-height:1.6;color:#a2988c;text-align:center">
          Oder öffne die App und geh auf <b style="color:#7b7064">Profil → Freunde</b>.
        </p>`,
    }),
  }
}

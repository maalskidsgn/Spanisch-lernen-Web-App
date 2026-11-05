/**
 * Rueckmeldungen aus der App und von der Website.
 *
 * Die Nachricht geht als Mail ins Postfach lernen@habloo.de. Antworten
 * laufen ueber die normale Antwort-Funktion des Mailprogramms, deshalb
 * steht die Adresse der Person im Reply-To.
 */

import { schicke, mailBereit } from './mail.js'

const POSTFACH = process.env.FEEDBACK_AN || 'lernen@habloo.de'
const ARTEN = { idee: 'Idee', kritik: 'Kritik', fehler: 'Fehler', sprechen: 'Sprach-Trainer', sonst: 'Sonstiges' }
const MAIL_MUSTER = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Hoechstens fuenf Nachrichten pro Stunde je Adresse, sonst wird das
// oeffentliche Formular zum Spam-Kanal ins eigene Postfach.
const FENSTER_MS = 60 * 60 * 1000
const MAX_PRO_FENSTER = 5
const zuletzt = new Map()

function zuViele(ip) {
  const jetzt = Date.now()
  const liste = (zuletzt.get(ip) || []).filter((z) => jetzt - z < FENSTER_MS)
  if (liste.length >= MAX_PRO_FENSTER) return true
  liste.push(jetzt)
  zuletzt.set(ip, liste)
  return false
}

export async function nimmRueckmeldung(eingabe, { nutzer, ip }) {
  // Das versteckte Feld fuellen nur Bots. Sie bekommen ein Ja, damit sie nichts lernen.
  if (eingabe?.falle) return
  const text = String(eingabe?.text ?? '').trim()
  if (text.length < 5) throw new Error('Schreib bitte ein paar Worte mehr.')
  if (text.length > 4000) throw new Error('Das ist zu lang. Bitte kürz die Nachricht auf 4000 Zeichen.')
  if (!mailBereit()) throw new Error('Das Senden klappt gerade nicht. Versuch es bitte später nochmal.')
  if (zuViele(ip)) throw new Error('Das waren gerade viele Nachrichten. Versuch es bitte später nochmal.')

  const art = ARTEN[eingabe?.art] || ARTEN.sonst
  const angegeben = String(eingabe?.antwort ?? '').trim().slice(0, 200)
  const antwort = MAIL_MUSTER.test(angegeben) ? angegeben : nutzer?.email || ''
  const anfang = text.replace(/\s+/g, ' ').slice(0, 60)

  const erfolg = await schicke({
    an: POSTFACH,
    antwortAn: antwort || undefined,
    betreff: `[Habloo Feedback] ${art}: ${anfang}`,
    text: [
      text,
      '',
      '---',
      `Art: ${art}`,
      `Antwort an: ${antwort || 'keine Adresse angegeben'}`,
      `Konto: ${nutzer?.id || 'nicht angemeldet'}`,
      `Quelle: ${String(eingabe?.quelle ?? '').slice(0, 20)}`,
      `Sprache: ${String(eingabe?.sprache ?? '').slice(0, 10)}`,
      `Gerät: ${String(eingabe?.geraet ?? '').slice(0, 200)}`,
    ].join('\n'),
  })
  if (!erfolg) throw new Error('Das Senden klappt gerade nicht. Versuch es bitte später nochmal.')
}

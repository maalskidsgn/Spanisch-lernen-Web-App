// Google Analytics 4 – aber erst, wenn jemand zugestimmt hat.
//
// Warum nicht einfach der Schnipsel aus dem Google-Konto in die
// index.html? Weil der SOFORT lädt. In Deutschland darf das nicht:
// § 25 TTDSG verlangt eine Einwilligung, bevor irgendetwas auf dem
// Gerät gespeichert oder ausgelesen wird, und GA setzt Cookies. Der
// Schnipsel in der index.html wäre also ein Verstoß ab der ersten
// Sekunde, in der habloo.de erreichbar ist.
//
// Deshalb liegt er hier: Geladen wird erst, wenn Einwilligung()
// die Zustimmung meldet. Ohne Zustimmung passiert gar nichts – kein
// Skript, kein Cookie, keine Anfrage an Google.
//
// Drei weitere Riegel:
//
//   1. Nur auf habloo.de. Sonst zählt jeder Entwicklungs-Klick auf
//      localhost in die Statistik und verfälscht sie.
//   2. Nicht in der Store-App. Dort lädt die Seite aus dem eigenen
//      Paket, nicht von habloo.de – gtag.js zählt dann Unsinn. Für
//      Android und iOS wäre Firebase Analytics das Richtige, nicht
//      dieses hier.
//   3. Nur einmal. Ein zweiter Aufruf tut nichts.

import { istApp } from './api.js'

// Die Mess-Kennung ist kein Geheimnis – sie steht bei jedem
// GA-Nutzer sichtbar im Quelltext der Seite.
const MESS_ID = 'G-YQ7ZLFZGTL'

// Wo gemessen wird. Alles andere (localhost, Vorschau-Adressen von
// Vercel) bleibt draußen.
const ECHTE_HOSTS = ['habloo.de', 'www.habloo.de']

const SPEICHER = 'messungEinwilligung'

let laeuft = false

/** Hat die Person zugestimmt, abgelehnt – oder noch gar nichts gesagt? */
export function einwilligungsStand() {
  try {
    return localStorage.getItem(SPEICHER) // 'ja' | 'nein' | null
  } catch {
    // Privater Modus ohne Speicher: als "noch nicht gefragt" behandeln,
    // aber niemals als Zustimmung.
    return null
  }
}

/** Darf hier überhaupt gemessen werden? */
export function messungMoeglich() {
  return !istApp && ECHTE_HOSTS.includes(location.hostname)
}

/**
 * Zustimmung erteilen oder zurücknehmen.
 *
 * Zurücknehmen muss genauso leicht sein wie zustimmen – deshalb steht
 * der Schalter auch in den Einstellungen. Beim Zurücknehmen werden die
 * GA-Cookies gelöscht; das Skript selbst bekommt man ohne Neuladen
 * nicht mehr aus der Seite, es sendet danach aber nichts mehr.
 */
export function setzeEinwilligung(ja) {
  try {
    localStorage.setItem(SPEICHER, ja ? 'ja' : 'nein')
  } catch {
    // dann gilt die Entscheidung eben nur für diese Sitzung
  }
  if (ja) {
    starte()
  } else {
    loescheCookies()
    // Falls schon geladen: Google anweisen, nichts mehr zu senden.
    window.gtag?.('consent', 'update', { analytics_storage: 'denied' })
    window[`ga-disable-${MESS_ID}`] = true
  }
}

/** Beim Seitenaufruf: nur starten, wenn früher schon zugestimmt wurde. */
export function messungFortsetzen() {
  if (einwilligungsStand() === 'ja') starte()
}

function starte() {
  if (laeuft || !messungMoeglich()) return
  laeuft = true

  window.dataLayer = window.dataLayer || []
  window.gtag = function () { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  // send_page_view: false ist der WICHTIGE Teil – siehe seitenaufruf().
  window.gtag('config', MESS_ID, { send_page_view: false })

  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${MESS_ID}`
  document.head.appendChild(s)

  // Den ersten Aufruf gleich melden, damit der Einstieg nicht fehlt.
  seitenaufruf(aktuelleAnsicht ?? 'start')
}

// Welche Ansicht zuletzt gemeldet wurde – damit derselbe Bildschirm
// nicht doppelt zählt, wenn React neu rendert.
let aktuelleAnsicht = null

/**
 * Einen Seitenaufruf melden.
 *
 * Das ist der Teil, den der Google-Schnipsel NICHT kann: Habloo hat
 * keinen Router. `view` ist React-Zustand, die Adresse in der Leiste
 * ändert sich nie. Der Standard-Schnipsel zählte deshalb genau EINEN
 * Seitenaufruf pro Sitzung – egal, ob jemand zwei Minuten oder zwei
 * Stunden durch die App geht.
 */
export function seitenaufruf(ansicht) {
  if (ansicht === aktuelleAnsicht) return
  aktuelleAnsicht = ansicht
  if (!laeuft) return
  window.gtag?.('event', 'page_view', {
    page_title: 'Habloo – ' + ansicht,
    page_path: '/' + ansicht,
    page_location: location.origin + '/' + ansicht,
  })
}

/**
 * Ein eigenes Ereignis melden – etwa "Lektion geschafft".
 *
 * Bewusst OHNE alles, was eine Person kenntlich macht: keine
 * Nutzerkennung, keine E-Mail, keine Vokabeln. Was jemand lernt,
 * geht Google nichts an. Wie viele Lektionen insgesamt abgeschlossen
 * werden, ist eine Zahl ohne Person dahinter.
 */
export function ereignis(name, daten = {}) {
  if (!laeuft) return
  window.gtag?.('event', name, daten)
}

/** Die Cookies, die GA gesetzt hat, wieder entfernen. */
function loescheCookies() {
  const heute = 'expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  for (const teil of document.cookie.split(';')) {
    const name = teil.split('=')[0].trim()
    if (!name.startsWith('_ga')) continue
    document.cookie = `${name}=; ${heute}`
    // Auch auf der Hauptdomain – dort legt GA sie eigentlich ab.
    document.cookie = `${name}=; ${heute}; domain=.${location.hostname.replace(/^www\./, '')}`
  }
}

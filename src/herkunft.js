/**
 * Woher kommt ein neuer Nutzer? (07.11.)
 *
 * Beim allerersten Besuch merken wir uns, von welcher Seite jemand kam
 * (nur der Domainname, z. B. "www.google.com"), über welche Adresse
 * er die App geöffnet hat und ein etwaiges utm_source. Bei der
 * Registrierung wandert das ins Konto – so sieht man im Dashboard,
 * welche Wege tatsächlich Nutzer bringen. Kein Cookie, keine
 * Drittanbieter, nichts Persönliches.
 */
const SCHLUESSEL = 'herkunft'

export function merkeHerkunft() {
  try {
    if (localStorage.getItem(SCHLUESSEL)) return
    const p = new URLSearchParams(location.search)
    let von = ''
    try {
      von = document.referrer ? new URL(document.referrer).hostname : ''
    } catch {
      /* kaputter Referrer */
    }
    if (von === location.hostname) von = ''
    const app = Boolean(window.Capacitor?.isNativePlatform?.())
    localStorage.setItem(
      SCHLUESSEL,
      JSON.stringify({
        quelle: p.get('utm_source') || von || (app ? 'app' : 'direkt'),
        kampagne: p.get('utm_campaign') || undefined,
        adresse: app ? 'app' : location.hostname,
        seite: location.pathname,
        am: new Date().toISOString().slice(0, 10),
      })
    )
  } catch {
    /* privater Modus – dann eben ohne */
  }
}

export function herkunft() {
  try {
    return JSON.parse(localStorage.getItem(SCHLUESSEL)) || undefined
  } catch {
    return undefined
  }
}

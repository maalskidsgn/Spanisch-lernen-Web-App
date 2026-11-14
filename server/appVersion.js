/**
 * Welche App-Version ist Pflicht, welche aktuell? (14.11.2026)
 * GET /api/app/version?plattform=ios|android → { min, aktuell }
 *
 * Die Store-Apps fragen das ab 2.0.2 beim Start (src/push.js,
 * src/UpdateHinweis.jsx):
 *   älter als min     → „Bitte aktualisieren“, App gesperrt
 *   älter als aktuell → kleiner Hinweis mit „Später“
 * Ändern ohne Deploy: Coolify-Variablen APP_MIN_IOS, APP_AKTUELL_IOS,
 * APP_MIN_ANDROID, APP_AKTUELL_ANDROID (wirken nach Neustart).
 * Erst erhöhen, wenn die neue Version im Store wirklich freigegeben ist!
 */
const STANDARD = {
  ios: { min: '2.0.1', aktuell: '2.0.1' },
  android: { min: '2.0.1', aktuell: '2.0.1' },
}

export function appVersion(plattform) {
  const p = plattform === 'android' ? 'android' : 'ios'
  const gross = p.toUpperCase()
  return {
    min: process.env[`APP_MIN_${gross}`] || STANDARD[p].min,
    aktuell: process.env[`APP_AKTUELL_${gross}`] || STANDARD[p].aktuell,
  }
}

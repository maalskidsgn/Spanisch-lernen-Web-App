// Push-Benachrichtigungen + Mindestversion (eingebaut 14.11.2026, Manuel).
//
// PUSH: Die App meldet nach der Anmeldung ihre Geräte-Kennung an den
// Server (/api/push/anmelden). Danach kann der Server jederzeit
// Nachrichten schicken – wöchentliche Übung, neue Funktion,
// Erinnerungen – ganz ohne neues App-Paket.
//
// Bewusst AUS, bis alles eingerichtet ist: VITE_PUSH_AKTIV=1 erst setzen,
// wenn (1) der Apple-Push-Schlüssel und das Provisioning-Profil mit Push
// stehen und (2) android/app/google-services.json (Firebase) im Projekt
// liegt. Ohne Firebase stürzt Android bei register() ab.
//
// MINDESTVERSION: Beim Start fragt die Store-App /api/app/version. Ist
// sie älter als „min“, sperrt ein Hinweis die App mit Store-Knopf; ist
// sie nur älter als „aktuell“, erscheint ein kleiner Hinweis. So lässt
// sich ein kaputtes Paket (wie 2.0 am 14.11.) künftig sofort abfangen.

import { Capacitor } from '@capacitor/core'
import { API_URL } from './api.js'
import { db, supabaseBereit } from './supabase.js'

export const PUSH_AKTIV = import.meta.env.VITE_PUSH_AKTIV === '1'
const nativ = () => Capacitor.isNativePlatform()
const plattform = () => Capacitor.getPlatform() // 'ios' | 'android' | 'web'

async function kopf() {
  const basis = { 'Content-Type': 'application/json' }
  if (!supabaseBereit) return basis
  const { data } = await db.auth.getSession()
  const t = data?.session?.access_token
  return t ? { ...basis, Authorization: 'Bearer ' + t } : basis
}

let eingerichtet = false

/**
 * Nach der Anmeldung aufrufen. Fragt einmal um Erlaubnis und meldet
 * das Gerät beim Server an. Tut im Browser und bei PUSH_AKTIV=false nichts.
 * @param {string} nutzerId
 * @param {(link: string) => void} [oeffne] – wohin ein Tipp auf die Nachricht führt
 */
export async function pushEinrichten(nutzerId, oeffne) {
  if (!PUSH_AKTIV || !nativ() || !nutzerId || eingerichtet) return
  eingerichtet = true
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')
    await PushNotifications.addListener('registration', async ({ value }) => {
      try {
        const { App } = await import('@capacitor/app')
        const info = await App.getInfo().catch(() => ({}))
        await fetch(API_URL + '/api/push/anmelden', {
          method: 'POST',
          headers: await kopf(),
          body: JSON.stringify({
            token: value,
            plattform: plattform(),
            version: info.version || '',
            sprache: (localStorage.getItem('oberflaeche-sprache') || navigator.language || 'de').slice(0, 2),
          }),
        })
      } catch { /* nächster Start versucht es wieder */ }
    })
    await PushNotifications.addListener('registrationError', (e) => console.warn('[push]', e?.error))
    await PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => {
      const link = notification?.data?.link
      if (link && oeffne) oeffne(String(link))
    })
    let recht = await PushNotifications.checkPermissions()
    if (recht.receive === 'prompt' || recht.receive === 'prompt-with-rationale') {
      recht = await PushNotifications.requestPermissions()
    }
    if (recht.receive === 'granted') await PushNotifications.register()
  } catch (f) {
    console.warn('[push] nicht eingerichtet:', f?.message)
  }
}

/** Versionen vergleichen: '2.0.1' < '2.1' → -1 */
export function vergleiche(a = '0', b = '0') {
  const x = String(a).split('.').map(Number)
  const y = String(b).split('.').map(Number)
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] || 0) - (y[i] || 0)
    if (d) return d < 0 ? -1 : 1
  }
  return 0
}

/**
 * Prüft beim Start der Store-App, ob sie zu alt ist.
 * @returns {Promise<null | { pflicht: boolean, version: string, neu: string }>}
 */
export async function versionPruefen() {
  if (!nativ()) return null
  try {
    const { App } = await import('@capacitor/app')
    const { version } = await App.getInfo()
    const r = await fetch(`${API_URL}/api/app/version?plattform=${plattform()}`)
    if (!r.ok) return null
    const { min, aktuell } = await r.json()
    if (min && vergleiche(version, min) < 0) return { pflicht: true, version, neu: aktuell || min }
    if (aktuell && vergleiche(version, aktuell) < 0) return { pflicht: false, version, neu: aktuell }
  } catch { /* offline: einfach weiter */ }
  return null
}

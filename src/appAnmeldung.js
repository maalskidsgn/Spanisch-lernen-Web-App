// Anmelden mit Google/Apple in der installierten App (Android/iOS).
//
// Im Browser leitet Supabase einfach zurück auf die Seite. In der App
// geht das nicht: Google sperrt Anmeldungen in eingebetteten WebViews.
// Deshalb öffnet sich der System-Browser, und Supabase schickt am Ende
// auf die App-Adresse de.habloo.app://anmeldung zurück. Diese Adresse
// fängt die App ab (AndroidManifest / Info.plist) und übernimmt die
// Sitzung. Sie muss in Supabase unter "Redirect URLs" stehen.
import { Capacitor } from '@capacitor/core'
import { db } from './supabase.js'

const SCHEMA = 'de.habloo.app'
export const APP_RUECKKEHR = SCHEMA + '://anmeldung'

export const istNativ = () => Capacitor.isNativePlatform()

/** Apple verlangt auf dem iPhone „Mit Apple anmelden“, sobald es
 *  irgendeine fremde Anmeldung gibt – ohne Apple also gar keine. */
export function anbieterFuerGeraet(liste) {
  if (Capacitor.getPlatform() === 'ios' && !liste.includes('apple')) return []
  return liste
}

export async function mitAnbieterInApp(anbieter) {
  const { data, error } = await db.auth.signInWithOAuth({
    provider: anbieter,
    options: { redirectTo: APP_RUECKKEHR, skipBrowserRedirect: true },
  })
  if (error) throw error
  const { Browser } = await import('@capacitor/browser')
  await Browser.open({ url: data.url, presentationStyle: 'popover' })
}

/** Einmal beim Start: wartet auf den Rücksprung aus dem Browser. */
export async function rueckkehrHoeren() {
  if (!istNativ() || !db) return
  const { App } = await import('@capacitor/app')
  App.addListener('appUrlOpen', async ({ url }) => {
    if (!url || !url.startsWith(SCHEMA + '://')) return
    try {
      const { Browser } = await import('@capacitor/browser')
      await Browser.close()
    } catch { /* auf Android schon zu */ }
    const werte = new URLSearchParams(url.split(/[?#]/).slice(1).join('&'))
    try {
      if (werte.get('code')) {
        await db.auth.exchangeCodeForSession(werte.get('code'))
      } else if (werte.get('access_token') && werte.get('refresh_token')) {
        await db.auth.setSession({
          access_token: werte.get('access_token'),
          refresh_token: werte.get('refresh_token'),
        })
      }
    } catch (f) {
      console.warn('Anmeldung aus dem Browser fehlgeschlagen', f)
    }
  })
}

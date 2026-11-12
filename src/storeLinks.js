// Einladungslink -> Store (12.11.2026)
//
// Der geteilte Link bleibt habloo.de/?einladung=Name. Wer ihn am Handy
// öffnet, landet im passenden Store: iPhone/iPad -> App Store,
// Android -> Google Play (die Einladung reist als Install-Referrer mit).
// Am PC bleibt man in der Web-App. Gemerkt wird die Einladung vorher
// trotzdem – wer später im Browser ein Konto anlegt, landet in der Liste.
//
// Je Store ein Schalter: App Store seit 12.11.2026 überall live (auch EU)
// -> an. Google Play einschalten, sobald die Produktion öffentlich ist.
import { istApp } from './api.js'

export const STORE_IOS = true
export const STORE_ANDROID = true

const APP_STORE = 'https://apps.apple.com/app/id6828830288'
const PLAY_STORE = 'https://play.google.com/store/apps/details?id=de.habloo.app'

/** Store-Adresse für dieses Gerät – oder null (PC). */
export function storeAdresse(einladung) {
  const ua = navigator.userAgent || ''
  if (/android/i.test(ua)) {
    if (!STORE_ANDROID) return null
    return PLAY_STORE + (einladung ? '&referrer=' + encodeURIComponent('einladung=' + einladung) : '')
  }
  const ipad = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  if ((/iphone|ipad|ipod/i.test(ua) || ipad) && STORE_IOS) return APP_STORE
  return null
}

/** Mit Einladung am Handy direkt in den Store. true = wird weitergeleitet. */
export function weiterZumStore(einladung) {
  if (istApp) return false
  try {
    const ziel = storeAdresse(einladung)
    if (!ziel) return false
    location.replace(ziel)
    return true
  } catch {
    return false
  }
}

// Google-Anmeldung direkt auf unserer Seite (09.11.2026).
//
// Vorher lief „Mit Google anmelden“ über Supabase – Google zeigte dann
// „weiter zu <projekt>.supabase.co“, was nach Betrug aussieht. Mit Googles
// eigenem Knopf (Google Identity Services) steht dort unsere Domain; das
// ID-Token geben wir per signInWithIdToken an Supabase weiter.
// Nur im Browser – in der installierten App bleibt der Weg über den System-Browser.
import { db } from './supabase.js'

const CLIENT = '117922947125-ra04qqv6ke1c81aopu1jor36b46rpdif.apps.googleusercontent.com'
let skript = null
let start = null
let beiErfolg = null
let beiFehler = null

function ladeSkript() {
  if (!skript) {
    skript = new Promise((fertig, fehler) => {
      if (window.google?.accounts?.id) return fertig()
      const s = document.createElement('script')
      s.src = 'https://accounts.google.com/gsi/client'
      s.async = true
      s.onload = () => fertig()
      s.onerror = () => { skript = null; fehler(new Error('Google nicht erreichbar')) }
      document.head.appendChild(s)
    })
  }
  return skript
}

async function hex(text) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Einmal einrichten: Nonce erzeugen (roh an Supabase, gehasht an Google). */
function einrichten() {
  if (!start) {
    start = (async () => {
      await ladeSkript()
      const roh = crypto.randomUUID() + crypto.randomUUID()
      window.google.accounts.id.initialize({
        client_id: CLIENT,
        nonce: await hex(roh),
        use_fedcm_for_button: true,
        callback: async (antwort) => {
          const { error } = await db.auth.signInWithIdToken({ provider: 'google', token: antwort.credential, nonce: roh })
          if (error) beiFehler?.(error)
          else beiErfolg?.()
        },
      })
    })()
  }
  return start
}

/**
 * Zeichnet Googles Knopf in das Element.
 * @param {HTMLElement} ziel
 * @param {{ breite?: number, sprache?: string, onErfolg?: Function, onFehler?: Function }} o
 */
export async function zeigeGoogleKnopf(ziel, o = {}) {
  if (o.onErfolg) beiErfolg = o.onErfolg
  if (o.onFehler) beiFehler = o.onFehler
  await einrichten()
  ziel.innerHTML = ''
  window.google.accounts.id.renderButton(ziel, {
    type: 'standard', theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with',
    logo_alignment: 'center', locale: o.sprache || 'de',
    width: Math.round(Math.min(400, Math.max(220, o.breite || ziel.getBoundingClientRect().width || 300))),
  })
}

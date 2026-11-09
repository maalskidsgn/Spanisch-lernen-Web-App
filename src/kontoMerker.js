/**
 * Merker, die zum Konto gehören statt zum Gerät (09.11.).
 *
 * „Einführung schon gesehen“, „Onboarding durch“ – bisher nur im
 * Browserspeicher. Nach Ab- und Anmelden, auf einem neuen Gerät oder
 * nach dem Leeren des Speichers kam deshalb alles noch einmal. Jetzt
 * liegen sie zusätzlich in den Konto-Metadaten (user_metadata.merker)
 * und werden beim Anmelden zurückgeholt.
 */
import { db, supabaseBereit } from './supabase.js'

const BEREICHE = 'bereichGesehen'

function lies(schluessel, ersatz) {
  try {
    return JSON.parse(localStorage.getItem(schluessel)) ?? ersatz
  } catch {
    return ersatz
  }
}

/** Beim Anmelden: was im Konto steht, auf dieses Gerät übernehmen. */
export function uebernimmMerker(nutzer) {
  const m = nutzer?.user_metadata?.merker
  if (!m) return
  try {
    if (m.bereiche) localStorage.setItem(BEREICHE, JSON.stringify({ ...lies(BEREICHE, {}), ...m.bereiche }))
    if (m.onboarding) localStorage.setItem('onboarding:' + nutzer.id, 'fertig')
  } catch {
    /* privater Modus */
  }
}

let zuletzt = ''
let uhr = null
/** Den aktuellen Stand der Merker ins Konto schreiben (gebündelt, nur bei Änderung). */
export function sichereMerker() {
  if (!supabaseBereit) return
  clearTimeout(uhr)
  uhr = setTimeout(async () => {
    try {
      const { data } = await db.auth.getSession()
      const nutzer = data?.session?.user
      if (!nutzer) return
      const alt = nutzer.user_metadata?.merker ?? {}
      const neu = {
        bereiche: { ...(alt.bereiche ?? {}), ...lies(BEREICHE, {}) },
        onboarding: Boolean(alt.onboarding) || localStorage.getItem('onboarding:' + nutzer.id) === 'fertig',
      }
      const text = JSON.stringify(neu)
      if (text === zuletzt || text === JSON.stringify(alt)) return
      zuletzt = text
      await db.auth.updateUser({ data: { merker: neu } })
    } catch {
      /* nicht schlimm – dann eben beim nächsten Mal */
    }
  }, 1500)
}

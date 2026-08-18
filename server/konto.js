// Konto endgültig löschen.
//
// Apple verlangt das seit 2022 von jeder App, in der man ein Konto
// anlegen kann (App-Store-Richtlinie 5.1.1 v). Ohne diese Funktion
// wird die App bei der Prüfung abgelehnt. Google Play verlangt
// inzwischen dasselbe.
//
// Ein Nutzer kann sich nicht selbst aus auth.users entfernen –
// dafür braucht es den Service-Role-Key. Deshalb läuft das über den
// Server und nicht direkt aus der App.
//
// Die Daten verschwinden mit: Alle Tabellen verweisen mit
// "ON DELETE CASCADE" auf auth.users, also räumt die Datenbank
// Vokabeln, Fortschritt, gespeicherte Videos und Abos selbst ab.

import { createClient } from '@supabase/supabase-js'
import { kuendigeSofort } from './bezahlung.js'

function adminZugang() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/**
 * Löscht das Konto des Nutzers, dem das Token gehört.
 *
 * Die Kennung kommt ausdrücklich aus dem geprüften Token und nicht
 * aus der Anfrage – sonst könnte jemand ein fremdes Konto löschen.
 *
 * @param {object} nutzer – Ergebnis von nutzerAusToken()
 */
export async function loescheKonto(nutzer) {
  if (!nutzer?.id) throw new Error('Nicht angemeldet.')

  const db = adminZugang()

  // ZUERST ein laufendes Abo kündigen. Stripe bucht sonst munter
  // weiter ab, obwohl das Konto weg ist – und die Zuordnung zum
  // Nutzer wäre danach nicht mehr auffindbar.
  const { data: abo } = await db
    .from('abos')
    .select('extern_id, status')
    .eq('nutzer_id', nutzer.id)
    .maybeSingle()

  let abogekuendigt = null
  if (abo?.extern_id && abo.status !== 'abgelaufen') {
    try {
      await kuendigeSofort(abo.extern_id)
      abogekuendigt = abo.extern_id
    } catch (fehler) {
      // Lieber abbrechen als ein Konto löschen, das weiter zahlt.
      throw new Error(
        'Das laufende Abo konnte nicht gekündigt werden – das Konto wurde ' +
          'deshalb NICHT gelöscht. Bitte melde dich bei uns. (' + fehler.message + ')'
      )
    }
  }

  const { error } = await db.auth.admin.deleteUser(nutzer.id)
  if (error) throw new Error('Konto konnte nicht gelöscht werden: ' + error.message)

  return { geloescht: true, abogekuendigt }
}

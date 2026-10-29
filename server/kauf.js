/**
 * Käufe aus den App Stores (Apple, Google) über RevenueCat.
 *
 * Warum nicht Stripe in der App? Apple und Google verlangen für
 * digitale Inhalte ihre eigene Kasse. Auf habloo.de im Browser bleibt
 * Stripe erlaubt – deshalb gibt es beide Wege nebeneinander.
 *
 * Warum RevenueCat und nicht direkt gegen Apple? Ein Kauf ist nicht
 * der schwierige Teil. Der schwierige Teil sind Verlängerung,
 * Kündigung, Rückerstattung, Zahlungsprobleme und die Tatsache, dass
 * Apple und Google das alles unterschiedlich melden. RevenueCat
 * übersetzt beides in dieselbe Nachricht.
 *
 * Diese Datei kennt nur eine Aufgabe: aus so einer Nachricht wird
 * eine Zeile in "abos". Wer Premium hat, liest die App ausschliesslich
 * dort – egal, woher die Berechtigung kam.
 */

import { createClient } from '@supabase/supabase-js'

/**
 * Zugriff mit dem Dienstschlüssel.
 *
 * Nötig, weil hier niemand angemeldet ist: Die Nachricht kommt von
 * RevenueCat, nicht aus dem Browser des Nutzers. Die Tabelle "abos"
 * lässt sonst niemanden schreiben.
 */
let kunde = null
function datenbank() {
  if (kunde) return kunde
  kunde = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  })
  return kunde
}

export function kaufBereit() {
  return Boolean(process.env.REVENUECAT_WEBHOOK_SECRET && process.env.SUPABASE_SERVICE_KEY)
}

/**
 * Prüft, ob die Nachricht wirklich von RevenueCat kommt.
 *
 * RevenueCat unterschreibt nicht, sondern schickt einen festen
 * Authorization-Header, den man selbst im Dashboard einträgt. Der
 * Vergleich läuft trotzdem zeichenweise konstant ab – sonst verrät
 * die Antwortzeit, wie viele Zeichen schon stimmen.
 */
export function pruefeHerkunft(kopfzeile) {
  const erwartet = process.env.REVENUECAT_WEBHOOK_SECRET
  if (!erwartet) throw new Error('REVENUECAT_WEBHOOK_SECRET fehlt auf dem Server.')
  const gegeben = String(kopfzeile || '')
  if (gegeben.length !== erwartet.length) throw new Error('Nicht berechtigt.')
  let gleich = 0
  for (let i = 0; i < erwartet.length; i++) {
    gleich |= erwartet.charCodeAt(i) ^ gegeben.charCodeAt(i)
  }
  if (gleich !== 0) throw new Error('Nicht berechtigt.')
}

/* ---------------------------------------------------------------- *
 *  Übersetzung in unsere Begriffe
 * ---------------------------------------------------------------- */

/** 'APP_STORE' → 'apple'. Die Spalte "quelle" kennt nur Kleinschreibung. */
function quelleVon(store) {
  if (store === 'APP_STORE' || store === 'MAC_APP_STORE') return 'apple'
  if (store === 'PLAY_STORE') return 'google'
  if (store === 'STRIPE' || store === 'RC_BILLING') return 'stripe'
  // Testkäufe aus der RevenueCat-Oberfläche und alles Unbekannte
  return 'geschenk'
}

/**
 * Aus der Produkt-Kennung auf den Tarif schliessen.
 *
 * Die Kennungen legen wir in App Store Connect selbst fest, deshalb
 * reicht ein Blick auf den Namen. Fällt eine Kennung durchs Raster,
 * gilt "monatlich" – lieber zu kurz berechtigt als unbegrenzt.
 */
function tarifVon(produkt) {
  const p = String(produkt || '').toLowerCase()
  if (p.includes('lifetime') || p.includes('einmal')) return 'lifetime'
  if (p.includes('jahr') || p.includes('year') || p.includes('annual')) return 'jaehrlich'
  return 'monatlich'
}

/**
 * Welche Ereignisse Premium geben und welche es nehmen.
 *
 * Bewusst eine Liste und kein "alles ausser X": Kommt bei RevenueCat
 * ein neuer Ereignistyp dazu, soll er nichts tun, statt versehentlich
 * jemandem den Zugang zu entziehen.
 */
const GIBT = new Set([
  'INITIAL_PURCHASE',   // zum ersten Mal gekauft
  'RENEWAL',            // Abo hat sich verlängert
  'UNCANCELLATION',     // Kündigung zurückgenommen
  'NON_RENEWING_PURCHASE', // Einmalkauf (Lifetime)
  'PRODUCT_CHANGE',     // Tarif gewechselt
  'SUBSCRIPTION_EXTENDED',
  'TRANSFER',           // Abo auf dieses Konto übertragen
])

const NIMMT = new Set([
  'EXPIRATION',         // Zeitraum abgelaufen
  'REFUND',             // Geld zurück
  'SUBSCRIPTION_PAUSED',
])

/* ---------------------------------------------------------------- *
 *  Die eigentliche Arbeit
 * ---------------------------------------------------------------- */

/**
 * Verarbeitet eine geprüfte Nachricht von RevenueCat.
 * @returns {Promise<object>} was getan wurde – landet im Log
 */
export async function verarbeiteKauf(nachricht) {
  const e = nachricht?.event
  if (!e?.type) throw new Error('Nachricht ohne Ereignistyp.')

  // CANCELLATION heisst nur "nicht verlängern". Der Zugang läuft bis
  // zum bezahlten Ende weiter – erst EXPIRATION nimmt ihn weg. Wer
  // hier schon abschaltet, sperrt Leute aus, die noch bezahlt haben.
  if (e.type === 'CANCELLATION') {
    return { typ: e.type, getan: 'nichts – Zugang laeuft bis zum Ende weiter' }
  }

  if (!GIBT.has(e.type) && !NIMMT.has(e.type)) {
    return { typ: e.type, getan: 'nichts – unbekanntes Ereignis' }
  }

  // Die app_user_id ist die Supabase-Nutzer-Kennung: Die App meldet
  // sich bei RevenueCat genau damit an (siehe src/kauf.js).
  const nutzerId = e.app_user_id
  if (!nutzerId || !/^[0-9a-f-]{36}$/i.test(nutzerId)) {
    // Anonyme Kennungen beginnen mit "$RCAnonymousID:". Dazu gibt es
    // bei uns kein Konto – also auch nichts einzutragen.
    return { typ: e.type, getan: 'uebersprungen – keine Nutzer-Kennung' }
  }

  const lifetime = tarifVon(e.product_id) === 'lifetime'

  if (NIMMT.has(e.type)) {
    const { error } = await datenbank()
      .from('abos')
      .update({ status: 'abgelaufen' })
      .eq('nutzer_id', nutzerId)
    if (error) throw new Error('Konnte das Abo nicht beenden: ' + error.message)
    return { typ: e.type, nutzerId, getan: 'abgelaufen' }
  }

  // Wer Lifetime hat, behaelt es – ein spaeter laufendes Monatsabo
  // darf das nicht ueberschreiben.
  if (!lifetime) {
    const { data: jetzt } = await datenbank()
      .from('abos')
      .select('tarif, status')
      .eq('nutzer_id', nutzerId)
      .maybeSingle()
    if (jetzt?.tarif === 'lifetime' && jetzt.status === 'aktiv') {
      return { typ: e.type, nutzerId, getan: 'nichts – Lifetime bleibt' }
    }
  }

  const { error } = await datenbank()
    .from('abos')
    .upsert(
      {
        nutzer_id: nutzerId,
        status: 'aktiv',
        tarif: tarifVon(e.product_id),
        // Bei Lifetime bleibt das Feld leer – das gilt unbegrenzt.
        laeuft_ab: lifetime || !e.expiration_at_ms
          ? null
          : new Date(e.expiration_at_ms).toISOString(),
        quelle: quelleVon(e.store),
        extern_id: e.transaction_id || e.original_transaction_id || null,
      },
      { onConflict: 'nutzer_id' }
    )
  if (error) throw new Error('Konnte das Abo nicht speichern: ' + error.message)

  return { typ: e.type, nutzerId, tarif: tarifVon(e.product_id), getan: 'aktiv' }
}

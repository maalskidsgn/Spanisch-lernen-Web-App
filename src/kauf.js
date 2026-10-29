/**
 * Kaufen in der App (Apple App Store, Google Play).
 *
 * Apple und Google verlangen für digitale Inhalte ihre eigene Kasse.
 * Im Browser auf habloo.de bleibt Stripe erlaubt – deshalb hängt es
 * hier an der Plattform, welcher Weg gezeigt wird:
 *
 *   Browser  → Bezahlen.jsx (Stripe)
 *   iOS/Android → KaufNativ.jsx (diese Datei)
 *
 * Die Berechtigung selbst wird nicht hier entschieden. Der Kauf geht
 * an RevenueCat, RevenueCat meldet ihn unserem Server, der Server
 * schreibt in "abos" – und premium.js liest ausschliesslich dort.
 * So gibt es weiterhin nur eine Wahrheit, egal woher das Geld kam.
 */

import { Capacitor } from '@capacitor/core'
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor'
import { db, supabaseBereit } from './supabase.js'

/** Der Name der Berechtigung, wie er im RevenueCat-Dashboard steht. */
export const BERECHTIGUNG = 'premium'

/** Läuft die App als echte App – oder im Browser? */
export function istApp() {
  try {
    return Capacitor.isNativePlatform()
  } catch {
    return false
  }
}

/** 'ios' | 'android' | 'web' */
export function plattform() {
  try {
    return Capacitor.getPlatform()
  } catch {
    return 'web'
  }
}

function schluessel() {
  return plattform() === 'ios'
    ? import.meta.env.VITE_REVENUECAT_APPLE_KEY
    : import.meta.env.VITE_REVENUECAT_GOOGLE_KEY
}

/** Ist der Kaufweg überhaupt eingerichtet? */
export function kaufMoeglich() {
  return istApp() && Boolean(schluessel())
}

/* ---------------------------------------------------------------- *
 *  Anmelden
 * ---------------------------------------------------------------- */

let eingerichtet = ''

/**
 * RevenueCat mit der eigenen Nutzer-Kennung verbinden.
 *
 * Entscheidend ist die appUserID: Genau die schickt RevenueCat später
 * im Webhook mit, und nur dadurch findet der Server die richtige
 * Zeile in "abos". Ohne sie wäre ein Kauf an ein anonymes Gerät
 * gebunden und beim Handywechsel verloren.
 */
export async function kaufVorbereiten(nutzerId) {
  if (!kaufMoeglich() || !nutzerId) return false
  if (eingerichtet === nutzerId) return true
  try {
    if (import.meta.env.DEV) {
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG })
    }
    await Purchases.configure({ apiKey: schluessel(), appUserID: nutzerId })
    eingerichtet = nutzerId
    return true
  } catch (fehler) {
    console.error('[kauf] Einrichten fehlgeschlagen:', fehler?.message)
    return false
  }
}

/** Beim Abmelden die Verbindung lösen, damit kein Kauf hängen bleibt. */
export async function kaufBeenden() {
  if (!eingerichtet) return
  eingerichtet = ''
  try {
    await Purchases.logOut()
  } catch {
    /* war nie angemeldet – dann gibt es auch nichts zu trennen */
  }
}

/* ---------------------------------------------------------------- *
 *  Angebote
 * ---------------------------------------------------------------- */

/**
 * Die kaufbaren Pakete, so wie sie der Store gerade anbietet.
 *
 * Preis und Währung kommen vom Store, nicht von uns: Apple rechnet
 * je nach Land in anderer Währung ab, und ein selbst hingeschriebenes
 * "9,99 €" wäre dort schlicht falsch.
 *
 * @returns {Promise<Array<{id, name, preisText, zeitraum, paket}>>}
 */
export async function ladeAngebote() {
  if (!kaufMoeglich()) return []
  const { current } = await Purchases.getOfferings()
  if (!current?.availablePackages?.length) return []

  return current.availablePackages.map((p) => {
    const produkt = p.product
    return {
      id: p.identifier,
      name: nameVon(p.packageType),
      // Der fertig formatierte Preis des Stores, inklusive Währung
      preisText: produkt.priceString,
      betrag: produkt.price,
      zeitraum: zeitraumVon(p.packageType),
      lifetime: p.packageType === 'LIFETIME',
      paket: p,
    }
  })
}

function nameVon(art) {
  return {
    MONTHLY: 'Monatlich',
    ANNUAL: 'Jährlich',
    LIFETIME: 'Lifetime',
    SIX_MONTH: 'Halbjährlich',
    THREE_MONTH: 'Vierteljährlich',
    WEEKLY: 'Wöchentlich',
  }[art] || 'Premium'
}

function zeitraumVon(art) {
  return {
    MONTHLY: 'pro Monat',
    ANNUAL: 'pro Jahr',
    LIFETIME: 'einmalig, für immer',
    SIX_MONTH: 'pro Halbjahr',
    THREE_MONTH: 'pro Quartal',
    WEEKLY: 'pro Woche',
  }[art] || ''
}

/* ---------------------------------------------------------------- *
 *  Kaufen
 * ---------------------------------------------------------------- */

/**
 * Ein Paket kaufen.
 *
 * @returns {Promise<'gekauft'|'abgebrochen'>}
 * @throws bei echten Fehlern – Abbruch ist keiner.
 */
export async function kaufe(paket) {
  try {
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: paket })
    return hatPremium(customerInfo) ? 'gekauft' : 'abgebrochen'
  } catch (fehler) {
    // Wer im Apple-Dialog auf "Abbrechen" tippt, hat nichts falsch
    // gemacht – das darf keine rote Fehlermeldung geben.
    if (fehler?.code === '1' || fehler?.userCancelled) return 'abgebrochen'
    throw new Error(lesbar(fehler))
  }
}

/**
 * Käufe wiederherstellen.
 *
 * Apple verlangt diesen Knopf in jeder App mit Käufen: Wer sein Handy
 * wechselt oder die App neu installiert, muss ohne Support an seinen
 * bezahlten Zugang kommen.
 *
 * @returns {Promise<boolean>} ob danach Premium besteht
 */
export async function stelleWiederHer() {
  const { customerInfo } = await Purchases.restorePurchases()
  return hatPremium(customerInfo)
}

function hatPremium(info) {
  return Boolean(info?.entitlements?.active?.[BERECHTIGUNG])
}

/**
 * Was der Store gerade über diesen Nutzer weiss.
 *
 * Nur als schnelle Auskunft direkt nach dem Kauf gedacht: Die
 * verbindliche Antwort steht in "abos" und kommt über den Webhook.
 * Der braucht aber ein, zwei Sekunden – so lange wäre der Nutzer
 * sonst nach dem Bezahlen immer noch ohne Premium.
 */
export async function kaufStand() {
  if (!kaufMoeglich()) return false
  try {
    const { customerInfo } = await Purchases.getCustomerInfo()
    return hatPremium(customerInfo)
  } catch {
    return false
  }
}

/** Technische Meldungen in etwas übersetzen, das man lesen kann. */
function lesbar(fehler) {
  const text = String(fehler?.message || '')
  if (/network|connection|internet/i.test(text)) {
    return 'Keine Verbindung zum Store. Versuch es gleich nochmal.'
  }
  if (/already|owned/i.test(text)) {
    return 'Dieser Kauf besteht schon. Tipp auf „Käufe wiederherstellen“.'
  }
  if (/not allowed|restricted/i.test(text)) {
    return 'Käufe sind auf diesem Gerät gesperrt (Bildschirmzeit oder Familienfreigabe).'
  }
  return text || 'Der Kauf hat nicht geklappt.'
}

/* ---------------------------------------------------------------- *
 *  Warten, bis der Server Bescheid weiss
 * ---------------------------------------------------------------- */

/**
 * Nach dem Kauf so lange nachfragen, bis die Berechtigung steht.
 *
 * Der Weg ist: Store → RevenueCat → unser Webhook → Tabelle "abos".
 * Das dauert meist unter einer Sekunde, manchmal länger. Ohne dieses
 * Warten sähe der Nutzer direkt nach dem Bezahlen noch die Werbung
 * für Premium – und würde zu Recht denken, das Geld sei weg.
 */
export async function warteAufFreischaltung(sekunden = 12) {
  if (!supabaseBereit) return false
  const ende = Date.now() + sekunden * 1000
  let pause = 600
  while (Date.now() < ende) {
    const { data } = await db.from('abos').select('status').maybeSingle()
    if (data?.status === 'aktiv') return true
    await new Promise((r) => setTimeout(r, pause))
    // Abstände wachsen lassen, statt zwanzigmal im Sekundentakt
    // dieselbe Frage zu stellen.
    pause = Math.min(pause * 1.4, 2500)
  }
  return false
}

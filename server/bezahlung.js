// Stripe-Anbindung: Bezahlvorgang starten und Zahlungen verbuchen.
//
// Der Ablauf in drei Schritten:
//
//   1. Die App fragt "/api/bezahlung/start" – wir legen bei Stripe
//      einen Bezahlvorgang an und schicken die Adresse zurück.
//   2. Der Nutzer bezahlt auf einer Seite von Stripe. Wir sehen
//      seine Kartendaten nie.
//   3. Stripe meldet sich bei "/api/bezahlung/melden" und sagt, was
//      passiert ist. ERST DANN tragen wir die Berechtigung ein.
//
// Wichtig ist Schritt 3: Wir glauben niemals dem Browser, dass
// bezahlt wurde. Nur Stripe darf das sagen – und wir prüfen per
// Signatur, dass die Meldung wirklich von Stripe stammt.

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Welche App das hier ist. Stripe schickt jedes Ereignis an ALLE
// passenden Webhook-Endpunkte – teilen sich mehrere Apps ein
// Stripe-Konto, bekaeme Habloo auch Davaigos Abos gemeldet und
// wuerde an einer unbekannten Nutzer-Kennung scheitern.
const APP_KENNUNG = process.env.APP_KENNUNG || 'habloo'

let stripe = null
export function stripeBereit() {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

function client() {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Auf dem Server fehlt STRIPE_SECRET_KEY.')
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  }
  return stripe
}

// Der Service-Role-Key umgeht die Zugriffsregeln der Datenbank.
// Genau dafür ist er da: Die Tabelle "abos" erlaubt niemandem sonst
// zu schreiben, damit sich kein Nutzer selbst Premium eintragen kann.
function datenbank() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  })
}

/**
 * Legt einen Bezahlvorgang an und gibt die Adresse zurück, auf die
 * der Browser weitergeleitet wird.
 *
 * @param {string} nutzerId – die Supabase-Kennung des Nutzers
 * @param {string} email    – für die Quittung
 * @param {string} herkunft – z.B. "https://habloo.de"
 */
export async function starteBezahlung(nutzerId, email, herkunft) {
  if (!nutzerId) throw new Error('Ohne Anmeldung geht das nicht.')
  if (!process.env.STRIPE_PREIS_ID) {
    throw new Error('Auf dem Server fehlt STRIPE_PREIS_ID.')
  }

  const sitzung = await client().checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PREIS_ID, quantity: 1 }],
    customer_email: email || undefined,

    // Die Nutzer-Kennung reisen mit und kommen in der Meldung
    // zurück – so wissen wir später, wem die Zahlung gehört.
    client_reference_id: nutzerId,
    subscription_data: { metadata: { nutzer_id: nutzerId, app: APP_KENNUNG } },
    metadata: { nutzer_id: nutzerId, app: APP_KENNUNG },

    success_url: `${herkunft}/?bezahlt=ja`,
    cancel_url: `${herkunft}/?bezahlt=abgebrochen`,

    allow_promotion_codes: true,
  })

  return sitzung.url
}

/**
 * Öffnet Stripes eigene Verwaltungsseite, auf der der Nutzer sein
 * Abo kündigen oder die Zahlungsart ändern kann. Das müssen wir
 * nicht selbst bauen – und dürfen es teilweise auch gar nicht.
 */
export async function verwaltungsLink(nutzerId, herkunft) {
  const { data } = await datenbank()
    .from('abos')
    .select('extern_id')
    .eq('nutzer_id', nutzerId)
    .maybeSingle()

  if (!data?.extern_id) throw new Error('Für dieses Konto gibt es kein Abo.')

  // Aus der Abo-Kennung den zugehörigen Kunden ermitteln
  const abo = await client().subscriptions.retrieve(data.extern_id)
  const sitzung = await client().billingPortal.sessions.create({
    customer: abo.customer,
    return_url: `${herkunft}/`,
  })
  return sitzung.url
}

/**
 * Prüft, ob eine Meldung wirklich von Stripe kommt.
 *
 * Stripe unterschreibt jede Meldung mit einem Geheimnis, das nur
 * Stripe und wir kennen. Ohne diese Prüfung könnte jeder eine
 * Nachricht "Zahlung erfolgreich" an uns schicken.
 *
 * @param {Buffer} roherKoerper – der UNVERÄNDERTE Nachrichtentext.
 *   Schon einmal eingelesenes und wieder ausgegebenes JSON passt
 *   nicht mehr zur Signatur, deshalb muss er roh bleiben.
 */
export function pruefeMeldung(roherKoerper, signatur) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('Auf dem Server fehlt STRIPE_WEBHOOK_SECRET.')
  }
  return client().webhooks.constructEvent(
    roherKoerper,
    signatur,
    process.env.STRIPE_WEBHOOK_SECRET
  )
}

/**
 * Ermittelt, bis wann der bezahlte Zeitraum laeuft.
 *
 * Stripe hat "current_period_end" mit der Basil-Version (2025) vom
 * Abo auf die einzelnen Abo-Positionen verschoben. Wir lesen daher
 * zuerst dort und fallen nur fuer aeltere Versionen auf das alte
 * Feld zurueck – sonst stuende hier ein ungueltiges Datum.
 */
function periodenEnde(abo) {
  const ausPosition = abo.items?.data?.[0]?.current_period_end
  const wert = ausPosition ?? abo.current_period_end
  if (!wert || !Number.isFinite(wert)) {
    throw new Error(
      'Stripe hat kein Periodenende geliefert (weder an der Position ' +
        'noch am Abo). Abo: ' + abo.id
    )
  }
  return wert
}

/**
 * Schreibt oder aktualisiert die Berechtigung eines Nutzers.
 *
 * Die Spaltennamen stammen aus dem urspruenglichen Schema
 * (laeuft_ab, tarif) – deshalb heissen sie hier nicht so wie in
 * Stripe. "tarif" ist ein Pflichtfeld mit fester Auswahl, also
 * uebersetzen wir Stripes Abrechnungszeitraum darauf.
 */
async function setzeBerechtigung(nutzerId, { status, laeuftAb, externId, zeitraum }) {
  const tarif = zeitraum === 'year' ? 'jaehrlich' : 'monatlich'

  const { error } = await datenbank()
    .from('abos')
    .upsert(
      {
        nutzer_id: nutzerId,
        status,
        tarif,
        laeuft_ab: new Date(laeuftAb * 1000).toISOString(),
        quelle: 'stripe',
        extern_id: externId,
      },
      { onConflict: 'nutzer_id' }
    )
  if (error) throw new Error('Konnte das Abo nicht speichern: ' + error.message)
}

/**
 * Verarbeitet eine geprüfte Meldung von Stripe.
 *
 * Wir hören auf die Abo-Ereignisse statt nur auf "bezahlt": Nur so
 * bekommen wir auch Verlängerungen, Kündigungen und geplatzte
 * Lastschriften mit.
 */
export async function verarbeiteMeldung(ereignis) {
  const d = ereignis.data.object

  switch (ereignis.type) {
    // Abo neu, verlängert oder geändert
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const nutzerId = d.metadata?.nutzer_id
      if (!nutzerId) return { erledigt: false, grund: 'keine Nutzer-Kennung' }

      // Gehoert das Abo ueberhaupt zu dieser App? Aeltere Abos ohne
      // Kennung lassen wir durch, sonst wuerden sie stehenbleiben.
      if (d.metadata?.app && d.metadata.app !== APP_KENNUNG) {
        return { erledigt: false, grund: 'gehoert zu ' + d.metadata.app }
      }

      // "gekuendigt" heißt: läuft noch bis zum Periodenende, aber
      // verlängert sich nicht mehr. Premium bleibt bis dahin.
      const status = d.cancel_at_period_end
        ? 'gekuendigt'
        : ['active', 'trialing'].includes(d.status)
          ? 'aktiv'
          : 'abgelaufen'

      await setzeBerechtigung(nutzerId, {
        status,
        laeuftAb: periodenEnde(d),
        externId: d.id,
        zeitraum: d.items?.data?.[0]?.plan?.interval,
      })
      return { erledigt: true, nutzerId, status }
    }

    // Abo endgültig beendet
    case 'customer.subscription.deleted': {
      const nutzerId = d.metadata?.nutzer_id
      if (!nutzerId) return { erledigt: false, grund: 'keine Nutzer-Kennung' }
      if (d.metadata?.app && d.metadata.app !== APP_KENNUNG) {
        return { erledigt: false, grund: 'gehoert zu ' + d.metadata.app }
      }
      await setzeBerechtigung(nutzerId, {
        status: 'abgelaufen',
        laeuftAb: d.ended_at ?? Math.floor(Date.now() / 1000),
        externId: d.id,
        zeitraum: d.items?.data?.[0]?.plan?.interval,
      })
      return { erledigt: true, nutzerId, status: 'abgelaufen' }
    }

    default:
      // Alles andere interessiert uns nicht – wir bestätigen es
      // trotzdem, sonst versucht Stripe es tagelang erneut.
      return { erledigt: false, grund: 'nicht zuständig für ' + ereignis.type }
  }
}

/**
 * Holt den hinterlegten Preis aus Stripe.
 *
 * So steht der Preis nur an EINER Stelle – im Stripe-Dashboard.
 * Aenderst du ihn dort, aendert sich die Anzeige mit, ohne dass
 * jemand Code anfassen muss.
 */
export async function holePreis() {
  if (!process.env.STRIPE_PREIS_ID) return null
  const preis = await client().prices.retrieve(process.env.STRIPE_PREIS_ID)
  return {
    betrag: preis.unit_amount / 100,
    waehrung: preis.currency.toUpperCase(),
    // "month" oder "year" – bei Einmalzahlung null
    zeitraum: preis.recurring?.interval ?? null,
  }
}

/**
 * Beendet ein Abo sofort – nicht erst zum Periodenende.
 *
 * Wird beim Loeschen eines Kontos gebraucht: Danach gibt es
 * niemanden mehr, dem eine Verlaengerung zugeordnet werden koennte.
 */
export async function kuendigeSofort(aboId) {
  if (!aboId) return null
  return client().subscriptions.cancel(aboId)
}

/**
 * Partnerprogramm: Wer unter einem Code kauft, wird dem Partner
 * zugerechnet, und jede bezahlte Rechnung ergibt eine Provision.
 *
 * Quelle der Wahrheit ist die Zahlung, nicht der Klick: Gezaehlt wird
 * nur, was wirklich bezahlt wurde. Ein Code bleibt am Abo haengen,
 * deshalb bekommt der Partner auch die Verlaengerungen, solange der
 * Rabatt laeuft.
 *
 * Partner anlegen und Bericht lesen: server/partner-cli.js
 */
import { createClient } from '@supabase/supabase-js'

const APP = process.env.APP_KENNUNG || 'habloo'

let verbindung = null
function db() {
  if (!verbindung) {
    verbindung = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } })
  }
  return verbindung
}

async function partnerZu(code) {
  if (!code) return null
  const { data } = await db().from('partner').select('code, provision_prozent').eq('code', String(code).toUpperCase()).maybeSingle()
  return data
}

async function buche({ code, quelle, beleg, nutzerId, betragCent, waehrung }) {
  const partner = await partnerZu(code)
  if (!partner) return { getan: 'kein Partner', code }
  const provisionCent = Math.round((betragCent * partner.provision_prozent) / 100)
  const { error } = await db().from('partner_verkaeufe').upsert({
    code: partner.code,
    quelle,
    beleg,
    nutzer_id: nutzerId || null,
    betrag_cent: betragCent,
    waehrung: waehrung || 'eur',
    provision_cent: provisionCent,
  }, { onConflict: 'beleg', ignoreDuplicates: true })
  if (error) throw new Error('Partner-Verkauf: ' + error.message)
  return { getan: 'gebucht', code: partner.code, betragCent, provisionCent }
}

/** Stripe meldet eine bezahlte Rechnung. Beide Apps teilen ein Stripe-Konto. */
export async function erfasseRechnung(stripe, rechnungEreignis) {
  const r = await stripe.invoices.retrieve(rechnungEreignis.id, { expand: ['discounts', 'lines.data'] })
  const meta = r.parent?.subscription_details?.metadata ?? r.lines?.data?.[0]?.metadata ?? {}
  if (meta.app && meta.app !== APP) return { getan: 'andere App' }
  if (!r.amount_paid) return { getan: 'nichts bezahlt' }
  for (const d of r.discounts ?? []) {
    const pid = typeof d === 'object' ? d.promotion_code : null
    if (!pid) continue
    const promo = typeof pid === 'string' ? await stripe.promotionCodes.retrieve(pid) : pid
    return buche({ code: promo.code, quelle: 'stripe', beleg: 'stripe:' + r.id, nutzerId: meta.nutzer_id, betragCent: r.amount_paid, waehrung: r.currency })
  }
  return { getan: 'ohne Code' }
}

/** RevenueCat meldet einen Store-Kauf mit Angebotscode. Der Preis ist der Bruttopreis vor Store-Gebuehr. */
export async function erfasseStoreKauf(e) {
  if (!e?.offer_code) return null
  if (!['INITIAL_PURCHASE', 'RENEWAL', 'NON_RENEWING_PURCHASE'].includes(e.type)) return null
  return buche({
    code: e.offer_code,
    quelle: String(e.store || 'store').toLowerCase(),
    beleg: 'store:' + (e.id || e.transaction_id),
    nutzerId: /^[0-9a-f-]{36}$/i.test(e.app_user_id || '') ? e.app_user_id : null,
    betragCent: Math.round((e.price_in_purchased_currency ?? e.price ?? 0) * 100),
    waehrung: (e.currency || 'eur').toLowerCase(),
  })
}

/** Ein Besuch ueber einen Partner-Link. Nur eine Zahl pro Tag, keine Personendaten. */
export async function zaehleKlick(code) {
  const partner = await partnerZu(code)
  if (!partner) return { ok: false }
  const tag = new Date().toISOString().slice(0, 10)
  await db().rpc('partner_klick', { p_code: partner.code, p_tag: tag })
  return { ok: true }
}

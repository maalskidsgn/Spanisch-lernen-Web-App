/**
 * Partner verwalten. Laeuft auf dem Server im API-Container:
 *
 *   node server/partner-cli.js anlegen "Anna Beispiel" ANNA20 20 20
 *        (Name, Code, Rabatt in Prozent, Provision in Prozent)
 *   node server/partner-cli.js bericht
 *
 * Der Rabatt laeuft 12 Monate. Die Provision wird auf das gebucht, was
 * wirklich bezahlt wurde, also nach Abzug des Rabatts.
 */
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const APP = process.env.APP_KENNUNG || 'habloo'
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } })
const [befehl, ...rest] = process.argv.slice(2)

if (befehl === 'anlegen') {
  const [name, rohCode, rabatt = '20', provision = '20'] = rest
  const code = String(rohCode || '').toUpperCase()
  if (!name || !/^[A-Z0-9]{3,20}$/.test(code)) throw new Error('Name und Code (3 bis 20 Zeichen, A-Z, 0-9) angeben.')
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  let promo = (await stripe.promotionCodes.list({ code, limit: 1 })).data[0]
  if (!promo) {
    const preise = (await stripe.prices.list({ lookup_keys: ['habloo_monat', 'davaigo_monat'], active: true })).data
    const coupon = await stripe.coupons.create({
      percent_off: Number(rabatt), duration: 'repeating', duration_in_months: 12, name: code,
      applies_to: { products: preise.map((p) => p.product) },
    })
    promo = await stripe.promotionCodes.create({
      promotion: { type: 'coupon', coupon: coupon.id }, code, restrictions: { first_time_transaction: true },
    })
  }
  const { error } = await db.from('partner').upsert({ code, name, rabatt_prozent: Number(rabatt), provision_prozent: Number(provision) }, { onConflict: 'code' })
  if (error) throw error
  console.log(`${code} angelegt: ${rabatt} % Rabatt, ${provision} % Provision`)
  console.log(`Link: https://${APP}.de/?code=${code}`)
} else if (befehl === 'bericht') {
  const { data: partner } = await db.from('partner').select('*').order('code')
  const { data: verkauf } = await db.from('partner_verkaeufe').select('*')
  const { data: klicks } = await db.from('partner_klicks').select('*')
  for (const p of partner ?? []) {
    const v = (verkauf ?? []).filter((x) => x.code === p.code)
    const summe = (f, l = v) => l.reduce((s, x) => s + x[f], 0) / 100
    const offen = v.filter((x) => !x.ausgezahlt_am)
    console.log(`${p.code} (${p.name}): ${(klicks ?? []).filter((k) => k.code === p.code).reduce((s, k) => s + k.anzahl, 0)} Klicks, ${v.length} Zahlungen, ${summe('betrag_cent').toFixed(2)} € Umsatz, ${summe('provision_cent').toFixed(2)} € Provision, davon offen ${summe('provision_cent', offen).toFixed(2)} €`)
  }
} else {
  console.log('anlegen NAME CODE [RABATT] [PROVISION]  |  bericht')
}

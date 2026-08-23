// Richtet den Mailversand von Supabase Auth ein – ohne Klicken.
//
// Aufruf:  node scripts/supabase-mail-einrichten.mjs            (zeigt nur, was es tun wuerde)
//          node scripts/supabase-mail-einrichten.mjs --los      (schreibt wirklich)
//          node scripts/supabase-mail-einrichten.mjs --test EMAIL   (schickt eine echte Passwort-Mail)
//
// Braucht in .env.local:
//   SUPABASE_ACCESS_TOKEN   – persoenlicher Token (supabase.com → Account → Access Tokens)
//   SUPABASE_URL, SUPABASE_SERVICE_KEY (vorhanden)
//   SMTP_HOST/PORT/USER/PASS/FROM (vorhanden seit 23.08.)
//
// Warum ein Skript und kein Klicken: Die Mail-Einstellungen von
// Supabase liegen hinter der Management-API, nicht hinter dem
// Projekt-Schluessel. Mit dem Token kann man Templates, SMTP und
// Rueckkehr-Adressen in einem Rutsch setzen – und vor allem
// NACHLESEN, was wirklich gespeichert ist. Genau das fehlte am
// 23.08.: Das Formular zeigte das eine, gespeichert war das andere,
// und niemand konnte es sehen.

import { readFileSync } from 'node:fs'

for (const z of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = z.match(/^([A-Z_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
}

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN
const REF = (process.env.SUPABASE_URL ?? '').match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1]
if (!TOKEN) { console.error('SUPABASE_ACCESS_TOKEN fehlt in .env.local'); process.exit(1) }
if (!REF) { console.error('SUPABASE_URL fehlt oder sieht falsch aus'); process.exit(1) }

const API = `https://api.supabase.com/v1/projects/${REF}/config/auth`
const KOPF = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
const los = process.argv.includes('--los')
const testAn = process.argv.includes('--test') ? process.argv[process.argv.indexOf('--test') + 1] : null

const vorlage = (name) => readFileSync(`mail-vorlagen/${name}`, 'utf8')

// Was gesetzt werden soll – Feldnamen sind die der Management-API.
const GEWUENSCHT = {
  // Rueckkehr-Adressen: ohne die faellt Supabase still auf die alte Site URL zurueck
  site_url: 'https://habloo.de',
  uri_allow_list: 'https://habloo.de,https://habloo.de/**,https://www.habloo.de/**',

  // Mail-Bestaetigung bei Registrierung AN – bisher war jeder sofort
  // "bestaetigt", ohne je eine Mail gesehen zu haben
  mailer_autoconfirm: false,

  // SMTP ueber das All-Inkl-Postfach
  external_email_enabled: true,
  smtp_admin_email: process.env.SMTP_FROM,
  smtp_sender_name: 'Habloo',
  smtp_host: process.env.SMTP_HOST,
  smtp_user: process.env.SMTP_USER,
  smtp_max_frequency: 60,

  // Die vier Vorlagen im Habloo-Design
  mailer_subjects_confirmation: 'Willkommen bei Habloo – bitte bestätige deine E-Mail',
  mailer_templates_confirmation_content: vorlage('confirm-signup.html'),
  mailer_subjects_recovery: 'Habloo – dein Link zum neuen Passwort',
  mailer_templates_recovery_content: vorlage('reset-password.html'),
  mailer_subjects_magic_link: 'Dein Anmelde-Link für Habloo',
  mailer_templates_magic_link_content: vorlage('magic-link.html'),
  mailer_subjects_email_change: 'Habloo – neue E-Mail-Adresse bestätigen',
  mailer_templates_email_change_content: vorlage('change-email.html'),
}

// ---- 1. Lesen, was gerade gilt ----
const aktuellAntwort = await fetch(API, { headers: KOPF })
if (!aktuellAntwort.ok) {
  console.error(`Konfig nicht lesbar: HTTP ${aktuellAntwort.status} – ${(await aktuellAntwort.text()).slice(0, 200)}`)
  console.error('Stimmt der Token? Hat er Zugriff auf dieses Projekt?')
  process.exit(1)
}
const aktuell = await aktuellAntwort.json()

console.log(`Projekt ${REF} – Stand der Mail-Einstellungen:\n`)
const zeige = (k, v) => console.log(`  ${k.padEnd(40)} ${v}`)
zeige('site_url', aktuell.site_url)
zeige('uri_allow_list', aktuell.uri_allow_list || '(leer)')
zeige('mailer_autoconfirm (Bestaetigung AUS?)', aktuell.mailer_autoconfirm)
zeige('smtp_host', aktuell.smtp_host || '(leer)')
zeige('smtp_port', aktuell.smtp_port || '(leer)')
zeige('smtp_user', aktuell.smtp_user || '(leer)')
zeige('smtp_pass gesetzt?', aktuell.smtp_pass ? 'ja (' + String(aktuell.smtp_pass).length + ' Zeichen)' : 'NEIN')
zeige('smtp_admin_email', aktuell.smtp_admin_email || '(leer)')
zeige('Betreff Bestaetigung', aktuell.mailer_subjects_confirmation)
zeige('Betreff Passwort', aktuell.mailer_subjects_recovery)
zeige('Vorlage Bestaetigung (Zeichen)', (aktuell.mailer_templates_confirmation_content ?? '').length)

// Passwort nur nachtragen, wenn in Supabase keins liegt. Es kommt
// verschluesselt zurueck und ist deshalb nie "gleich" – ein blinder
// Vergleich wuerde es bei jedem Lauf neu schreiben.
if (!aktuell.smtp_pass) GEWUENSCHT.smtp_pass = process.env.SMTP_PASS
// Port ebenso: Was gespeichert ist und nachweislich sendet, bleibt.
if (!aktuell.smtp_port) GEWUENSCHT.smtp_port = String(process.env.SMTP_PORT)

// ---- 2. Unterschiede ----
const aenderungen = Object.entries(GEWUENSCHT).filter(([k, v]) => String(aktuell[k] ?? '') !== String(v ?? ''))
console.log(`\n${aenderungen.length} Feld(er) weichen ab:`)
for (const [k] of aenderungen) console.log('  - ' + k)

if (!los && !testAn) {
  console.log('\nProbelauf. Mit --los wird geschrieben, mit --test EMAIL eine echte Mail verschickt.')
  process.exit(0)
}

// ---- 3. Schreiben ----
if (los && aenderungen.length) {
  const r = await fetch(API, { method: 'PATCH', headers: KOPF, body: JSON.stringify(Object.fromEntries(aenderungen)) })
  if (!r.ok) { console.error(`Schreiben fehlgeschlagen: HTTP ${r.status} – ${(await r.text()).slice(0, 300)}`); process.exit(1) }
  console.log('\nGeschrieben. Gegenprobe:')
  const nachher = await (await fetch(API, { headers: KOPF })).json()
  const nochAnders = Object.entries(GEWUENSCHT).filter(([k, v]) => String(nachher[k] ?? '') !== String(v ?? '') && k !== 'smtp_pass')
  console.log(nochAnders.length ? '  NOCH ANDERS: ' + nochAnders.map(([k]) => k).join(', ') : '  alles wie gewuenscht.')
}

// ---- 4. Echte Test-Mail ----
if (testAn) {
  const B = process.env.SUPABASE_URL, SVC = process.env.SUPABASE_SERVICE_KEY
  const H = { apikey: SVC, Authorization: `Bearer ${SVC}`, 'Content-Type': 'application/json' }
  // Passwort-Reset an eine ECHTE Adresse – die Mail kommt im Habloo-Design an.
  const r = await fetch(`${B}/auth/v1/recover`, {
    method: 'POST', headers: { apikey: process.env.SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testAn, options: { redirectTo: 'https://habloo.de' } }),
  })
  console.log(`\nTest-Mail an ${testAn}: HTTP ${r.status} ${r.status === 200 ? '– raus, schau ins Postfach' : '– ' + (await r.text()).slice(0, 200)}`)
  console.log('(Geht nur, wenn es zu dieser Adresse ein Habloo-Konto gibt.)')
}

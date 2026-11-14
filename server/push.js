/**
 * Push-Benachrichtigungen (14.11.2026, Manuel).
 *
 * Geräte-Kennungen liegen im Konto unter app_metadata.push_geraete
 * (höchstens 5 je Konto). Das braucht keine neue Tabelle und nur der
 * Server darf app_metadata schreiben. Ab ein paar tausend Nutzern
 * lohnt sich eine eigene Tabelle.
 *
 * Versand ohne Fremddienst:
 *   iOS     – direkt an Apple (APNs, HTTP/2, Schlüssel .p8)
 *   Android – Firebase Cloud Messaging (HTTP v1, Dienstkonto-JSON)
 *
 * Umgebung (Coolify):
 *   APNS_KEY_ID, APNS_KEY (Inhalt der .p8, Zeilenumbrüche als \n),
 *   APNS_TEAM_ID (Standard 2S6262ZCFW), APNS_SANDBOX=1 nur für Tests
 *   FCM_SERVICE_ACCOUNT (das Dienstkonto-JSON in einer Zeile)
 *   PUSH_ADMIN_SCHLUESSEL – schützt /api/push/senden
 * Fehlt etwas, wird die jeweilige Plattform still übersprungen.
 */
import crypto from 'node:crypto'
import http2 from 'node:http2'
import { Buffer } from 'node:buffer'

const BUNDLE = process.env.APP_BUNDLE_ID || 'de.habloo.app'
const MAX_GERAETE = 5
const kopf = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
  'Content-Type': 'application/json',
})
const AUTH = () => `${process.env.SUPABASE_URL}/auth/v1/admin/users`

export class PushFehler extends Error {
  constructor(code, text) { super(text); this.code = code }
}

/* ---------------- Geräte verwalten ---------------- */

async function geraeteSetzen(nutzerId, liste) {
  const r = await fetch(`${AUTH()}/${nutzerId}`, {
    method: 'PUT', headers: kopf(),
    body: JSON.stringify({ app_metadata: { push_geraete: liste } }),
  })
  if (!r.ok) throw new PushFehler(502, 'Gerät konnte nicht gespeichert werden.')
}

/** POST /api/push/anmelden – die App meldet ihre Kennung. */
export async function anmelden(nutzer, { token, plattform, version, sprache }) {
  if (typeof token !== 'string' || token.length < 20 || token.length > 4096) throw new PushFehler(400, 'Ungültige Kennung.')
  if (!['ios', 'android'].includes(plattform)) throw new PushFehler(400, 'Unbekannte Plattform.')
  const r = await fetch(`${AUTH()}/${nutzer.id}`, { headers: kopf() })
  const konto = r.ok ? await r.json() : {}
  const alt = (konto.app_metadata?.push_geraete ?? []).filter((g) => g.token !== token)
  const neu = [{ token, plattform, version: String(version || '').slice(0, 20), sprache: sprache === 'en' ? 'en' : 'de', am: new Date().toISOString() }, ...alt].slice(0, MAX_GERAETE)
  await geraeteSetzen(nutzer.id, neu)
  return { ok: true }
}

async function alleKonten() {
  let alle = []
  for (let seite = 1; seite < 200; seite++) {
    const r = await fetch(`${AUTH()}?per_page=500&page=${seite}`, { headers: kopf() })
    const liste = r.ok ? (await r.json()).users ?? [] : []
    alle = alle.concat(liste)
    if (liste.length < 500) break
  }
  return alle
}

async function premiumIds() {
  const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/abos?select=nutzer_id,status,laeuft_ab`, { headers: kopf() })
  const jetzt = Date.now()
  return new Set((r.ok ? await r.json() : [])
    .filter((a) => a.status !== 'abgelaufen' && (!a.laeuft_ab || Date.parse(a.laeuft_ab) > jetzt))
    .map((a) => a.nutzer_id))
}

/* ---------------- Apple (APNs) ---------------- */

let apnsJwt = { wert: null, zeit: 0 }
function apnsToken() {
  if (apnsJwt.wert && Date.now() - apnsJwt.zeit < 45 * 60 * 1000) return apnsJwt.wert
  const b = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
  const daten = b({ alg: 'ES256', kid: process.env.APNS_KEY_ID }) + '.' + b({ iss: process.env.APNS_TEAM_ID || '2S6262ZCFW', iat: Math.floor(Date.now() / 1000) })
  const sig = crypto.sign('sha256', Buffer.from(daten), { key: process.env.APNS_KEY.replace(/\\n/g, '\n'), dsaEncoding: 'ieee-p1363' })
  apnsJwt = { wert: daten + '.' + sig.toString('base64url'), zeit: Date.now() }
  return apnsJwt.wert
}
const apnsBereit = () => Boolean(process.env.APNS_KEY_ID && process.env.APNS_KEY)

function apnsSenden(sitzung, token, nachricht) {
  return new Promise((fertig) => {
    const anfrage = sitzung.request({
      ':method': 'POST', ':path': '/3/device/' + token,
      authorization: 'bearer ' + apnsToken(),
      'apns-topic': BUNDLE, 'apns-push-type': 'alert', 'apns-priority': '10',
    })
    let status = 0, text = ''
    anfrage.on('response', (h) => { status = h[':status'] })
    anfrage.on('data', (d) => { text += d })
    anfrage.on('end', () => fertig({ ok: status === 200, weg: status === 410 || /BadDeviceToken|Unregistered/.test(text), status, text }))
    anfrage.on('error', (e) => fertig({ ok: false, weg: false, text: e.message }))
    anfrage.end(JSON.stringify({
      aps: { alert: { title: nachricht.titel, body: nachricht.text }, sound: 'default' },
      link: nachricht.link || '',
    }))
  })
}

/* ---------------- Google (FCM HTTP v1) ---------------- */

let fcmZugang = { wert: null, bis: 0 }
const fcmKonto = () => { try { return JSON.parse(process.env.FCM_SERVICE_ACCOUNT || '') } catch { return null } }
const fcmBereit = () => Boolean(fcmKonto()?.private_key)

async function fcmToken() {
  if (fcmZugang.wert && Date.now() < fcmZugang.bis) return fcmZugang.wert
  const k = fcmKonto()
  const jetzt = Math.floor(Date.now() / 1000)
  const b = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
  const daten = b({ alg: 'RS256', typ: 'JWT' }) + '.' + b({ iss: k.client_email, scope: 'https://www.googleapis.com/auth/firebase.messaging', aud: 'https://oauth2.googleapis.com/token', iat: jetzt, exp: jetzt + 3600 })
  const sig = crypto.sign('sha256', Buffer.from(daten), k.private_key).toString('base64url')
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: daten + '.' + sig }),
  })
  const j = await r.json()
  if (!j.access_token) throw new Error('FCM-Anmeldung fehlgeschlagen')
  fcmZugang = { wert: j.access_token, bis: Date.now() + 50 * 60 * 1000 }
  return fcmZugang.wert
}

async function fcmSenden(token, nachricht) {
  const k = fcmKonto()
  const r = await fetch(`https://fcm.googleapis.com/v1/projects/${k.project_id}/messages:send`, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + (await fcmToken()), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: { token, notification: { title: nachricht.titel, body: nachricht.text }, data: { link: nachricht.link || '' } } }),
  })
  const text = r.ok ? '' : await r.text()
  return { ok: r.ok, weg: r.status === 404 || /UNREGISTERED|INVALID_ARGUMENT/.test(text), status: r.status, text }
}

/* ---------------- Versand ---------------- */

/**
 * POST /api/push/senden (Kopf X-Push-Schluessel = PUSH_ADMIN_SCHLUESSEL)
 * body: { titel, text, link?, ziel?: { sprache?: 'de'|'en', nur?: 'premium'|'gratis', nutzer?: [ids] }, probe?: true }
 * Texte dürfen je Sprache kommen: titel: { de, en }, text: { de, en }.
 * probe: zählt nur, schickt nichts.
 */
export async function senden({ titel, text, link, ziel = {}, probe = false }) {
  if (!titel || !text) throw new PushFehler(400, 'Titel und Text fehlen.')
  const konten = await alleKonten()
  const premium = ziel.nur ? await premiumIds() : null
  const auswahl = konten.filter((k) => {
    if (!k.app_metadata?.push_geraete?.length) return false
    if (ziel.nutzer?.length && !ziel.nutzer.includes(k.id)) return false
    if (ziel.nur === 'premium' && !premium.has(k.id)) return false
    if (ziel.nur === 'gratis' && premium.has(k.id)) return false
    return true
  })
  const ergebnis = { konten: auswahl.length, geraete: 0, gesendet: 0, fehler: 0, entfernt: 0, ios: apnsBereit(), android: fcmBereit() }
  let apns = null
  try {
    for (const konto of auswahl) {
      const bleiben = []
      for (const g of konto.app_metadata.push_geraete) {
        if (ziel.sprache && g.sprache !== ziel.sprache) { bleiben.push(g); continue }
        ergebnis.geraete++
        const sp = g.sprache === 'en' ? 'en' : 'de'
        const n = { titel: typeof titel === 'object' ? titel[sp] ?? titel.de : titel, text: typeof text === 'object' ? text[sp] ?? text.de : text, link }
        if (probe) { bleiben.push(g); continue }
        let r = { ok: false, weg: false }
        if (g.plattform === 'ios' && apnsBereit()) {
          apns ??= http2.connect(process.env.APNS_SANDBOX === '1' ? 'https://api.sandbox.push.apple.com' : 'https://api.push.apple.com')
          r = await apnsSenden(apns, g.token, n)
        } else if (g.plattform === 'android' && fcmBereit()) {
          r = await fcmSenden(g.token, n)
        } else { bleiben.push(g); continue }
        if (r.ok) ergebnis.gesendet++
        else { ergebnis.fehler++; console.warn('[push]', g.plattform, r.status, String(r.text).slice(0, 160)) }
        if (r.weg) ergebnis.entfernt++
        else bleiben.push(g)
      }
      if (!probe && bleiben.length !== konto.app_metadata.push_geraete.length) await geraeteSetzen(konto.id, bleiben).catch(() => {})
    }
  } finally {
    apns?.close()
  }
  return ergebnis
}

/** Prüft den Admin-Schlüssel in konstanter Zeit. */
export function adminErlaubt(wert) {
  const soll = process.env.PUSH_ADMIN_SCHLUESSEL || ''
  if (!soll || typeof wert !== 'string' || wert.length !== soll.length) return false
  return crypto.timingSafeEqual(Buffer.from(wert), Buffer.from(soll))
}

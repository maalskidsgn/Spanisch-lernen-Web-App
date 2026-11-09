/**
 * Anmeldung und Konten für Habloo.
 *
 * Wichtig: Die App funktioniert auch OHNE Konto weiter – dann liegen
 * alle Daten wie bisher nur im Browser. Ein Konto bringt zwei Dinge:
 * Sicherung der Daten und Nutzung auf mehreren Geräten.
 */

import { uebernimmMerker } from './kontoMerker.js'
import { herkunft } from './herkunft.js'
import { useState, useEffect } from 'react'
import { db, supabaseBereit } from './supabase.js'
import { t, sprache } from './sprache.js'

// ---------------------------------------------------------------
//  Fehlermeldungen in der Sprache des Nutzers
// ---------------------------------------------------------------
// Supabase antwortet immer auf Englisch, und zwar technisch. Hier
// stehen die haeufigsten Faelle als Schluessel - uebersetzt wird
// erst beim Anzeigen, sonst friert die Sprache beim Laden ein.
const MELDUNGEN = {
  'Invalid login credentials': 'au.falscheDaten',
  'User already registered': 'au.schonRegistriert',
  'Email not confirmed': 'au.nichtBestaetigt',
  'Password should be at least 6 characters': 'au.passwortZuKurz',
  'Unable to validate email address: invalid format': 'au.emailUngueltig',
  'For security purposes, you can only request this after 60 seconds.': 'au.kurzWarten',
  'Signup requires a valid password': 'au.passwortFehlt',
  'Email rate limit exceeded': 'au.zuVieleMails',
}

function uebersetzeFehler(fehler) {
  if (!fehler) return ''
  const meldung = fehler.message ?? ''

  if (MELDUNGEN[meldung]) return t(MELDUNGEN[meldung])

  // Meldungen mit wechselndem Inhalt (z. B. die genannte Adresse)
  if (/is invalid/.test(meldung) && /email/i.test(meldung)) return t('au.emailAbgelehnt')
  if (/password/i.test(meldung) && /least/i.test(meldung)) return t('au.passwortZuKurz')
  return meldung
}

// ---------------------------------------------------------------
//  Konto anlegen / anmelden / abmelden
// ---------------------------------------------------------------

/** Legt ein neues Konto an. */
// Wohin der Link in der Bestätigungs- oder Passwort-Mail führt.
//
// Fest auf habloo.de, nicht window.location.origin: In der Store-App
// wäre das "capacitor://localhost" – ein Link, den kein Mailprogramm
// öffnen kann. Und beim Entwickeln wäre es localhost, was vom Handy
// aus ins Leere zeigt. Die Mail kommt immer bei einem Menschen an,
// der sie irgendwo öffnet – der einzige Ort, der von überall
// erreichbar ist, ist die echte Domain.
//
// Supabase lässt nur Adressen zu, die dort unter "Redirect URLs"
// eingetragen sind (Authentication → URL Configuration). habloo.de
// muss dort stehen, sonst fällt Supabase still auf die Site URL
// zurück.
// Wer sich auf der englischen Adresse app.habloo.net anmeldet, kommt
// auch dorthin zurück (steht ebenfalls unter "Redirect URLs").
const MAIL_RUECKKEHR =
  typeof location !== 'undefined' && location.hostname === 'app.habloo.net'
    ? 'https://app.habloo.net'
    : 'https://habloo.de'

/**
 * Die eingestellte Sprache beim Konto hinterlegen.
 *
 * Der Server verschickt Mails an ANDERE Leute - er kann die Sprache
 * also nicht aus dem Browser des Absenders nehmen. Sie muss beim
 * Empfaenger stehen, und das einzige Feld, das ohne neue Tabelle
 * dafuer taugt, sind die user_metadata.
 */
// Konten über Google/Apple bekommen die Herkunft nachträglich – aber
// nur frische (unter zwei Tagen), sonst stünde bei alten Konten die
// Herkunft dieses Geräts statt der echten.
let herkunftGemerkt = false
function merkeHerkunftImKonto(nutzer) {
  if (!nutzer || herkunftGemerkt || nutzer.user_metadata?.herkunft) return
  const alter = Date.now() - new Date(nutzer.created_at).getTime()
  if (!(alter < 2 * 86400000)) return
  const h = herkunft()
  if (!h) return
  herkunftGemerkt = true
  setTimeout(() => db.auth.updateUser({ data: { herkunft: h } }).catch(() => {}), 0)
}

export async function merkeSprache() {
  if (!supabaseBereit) return
  try {
    const { data } = await db.auth.getUser()
    if (!data?.user) return
    if (data.user.user_metadata?.sprache === sprache()) return
    await db.auth.updateUser({ data: { sprache: sprache() } })
  } catch {
    /* Nicht schlimm: dann geht die Mail eben auf Deutsch raus. */
  }
}

// Beim Umschalten gleich nachziehen - sonst stuende dort die
// Sprache von der Anmeldung, nicht die, die jemand gerade liest.
if (typeof window !== 'undefined') {
  window.addEventListener('sprache', () => { merkeSprache() })
}

export async function registrieren(email, passwort, name) {
  const { data, error } = await db.auth.signUp({
    email: email.trim(),
    password: passwort,
    options: {
      data: { name: name?.trim() || undefined, sprache: sprache(), herkunft: herkunft() },
      emailRedirectTo: MAIL_RUECKKEHR,
    },
  })
  if (error) throw new Error(uebersetzeFehler(error))

  // Gibt es die Adresse schon, meldet Supabase KEINEN Fehler und
  // schickt auch keine Mail (Schutz gegen Konten-Raten). Erkennbar
  // ist es nur an der leeren identities-Liste.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return { schonVorhanden: true }
  }

  // Wenn Supabase eine Bestätigungs-Mail verschickt, gibt es noch keine Sitzung.
  return { nutzer: data.user, sitzung: data.session, mailBestaetigen: !data.session }
}

/** Meldet einen bestehenden Nutzer an. */
export async function anmelden(email, passwort) {
  const { data, error } = await db.auth.signInWithPassword({
    email: email.trim(),
    password: passwort,
  })
  if (error) throw new Error(uebersetzeFehler(error))
  return data.user
}

/** Meldet ab – die lokalen Daten bleiben, bis sich ein anderes Konto anmeldet. */
export async function abmelden() {
  const { error } = await db.auth.signOut()
  if (error) throw new Error(uebersetzeFehler(error))
}

/**
 * Anmeldung über Google oder Apple. Supabase leitet zum Anbieter
 * und danach zurück auf die Seite – dort steht die Sitzung bereit.
 * @param {'google'|'apple'} anbieter
 */
export async function mitAnbieter(anbieter) {
  const { error } = await db.auth.signInWithOAuth({
    provider: anbieter,
    options: { redirectTo: window.location.origin },
  })
  if (error) throw new Error(uebersetzeFehler(error))
}

/**
 * Welche Anbieter sind in Supabase eingeschaltet? So erscheinen die
 * Knöpfe von selbst, sobald ein Anbieter eingerichtet ist.
 */
export async function aktiveAnbieter() {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
    const r = await fetch(url + '/auth/v1/settings', { headers: { apikey: key } })
    const d = await r.json()
    return ['apple', 'google'].filter((a) => d.external?.[a])
  } catch {
    return []
  }
}

/** Schickt eine E-Mail zum Zurücksetzen des Passworts. */
export async function passwortVergessen(email) {
  const { error } = await db.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: MAIL_RUECKKEHR,
  })
  if (error) throw new Error(uebersetzeFehler(error))
}

// ---------------------------------------------------------------
//  React-Hook: wer ist gerade angemeldet?
// ---------------------------------------------------------------

// ---------------------------------------------------------------
//  Wem gehoeren die Lerndaten auf diesem Geraet?
// ---------------------------------------------------------------
// Beim Abmelden bleiben die Daten im Speicher, und beim Anmelden
// werden sie ins Konto uebernommen - gewollt fuer alle, die erst ohne
// Konto lernen. Bis 05.11. galt das aber auch, wenn sich danach ein
// ANDERES Konto anmeldete: Dessen Konto bekam dann den kompletten
// Stand des vorigen. Deshalb merken wir uns, wem die Daten gehoeren.
const BESITZER = 'daten-besitzer'
// Geraete-Einstellungen, keine Lerndaten - die bleiben stehen.
const BLEIBEN = ['oberflaeche-sprache', 'messungEinwilligung', 'install-hinweis', BESITZER]

/**
 * Meldet sich ein anderes Konto an als das, dem die Daten hier
 * gehoeren, wird der Speicher geleert und die Seite neu geladen.
 * Liefert dann true - der Aufrufer setzt den Nutzer nicht mehr.
 */
function fremdeDatenWeg(user) {
  if (!user) return false
  try {
    const besitzer = localStorage.getItem(BESITZER)
    if (besitzer === user.id) return false
    if (besitzer) {
      for (const k of Object.keys(localStorage)) {
        // sb-… ist die Anmeldung selbst
        if (k.startsWith('sb-') || k.startsWith('CapacitorStorage.') || BLEIBEN.includes(k)) continue
        localStorage.removeItem(k)
      }
    }
    localStorage.setItem(BESITZER, user.id)
    if (!besitzer) return false // Daten ohne Konto: werden uebernommen
  } catch {
    return false
  }
  window.location.reload()
  return true
}

/**
 * Liefert den angemeldeten Nutzer (oder null) und meldet sich
 * automatisch bei jeder Änderung neu.
 *
 *   const { nutzer, laedt } = useNutzer()
 */
export function useNutzer() {
  const [nutzer, setNutzer] = useState(null)
  const [laedt, setLaedt] = useState(supabaseBereit)
  const [passwortNeuSetzen, setPasswortNeuSetzen] = useState(false)

  useEffect(() => {
    if (!supabaseBereit) return

    // Beim Start: gibt es noch eine gültige Sitzung?
    db.auth.getSession().then(({ data }) => {
      if (fremdeDatenWeg(data.session?.user)) return
      uebernimmMerker(data.session?.user)
      setNutzer(data.session?.user ?? null)
      setLaedt(false)
      if (data.session?.user) merkeSprache()
    })

    // Danach: auf An- und Abmelden reagieren
    const { data: beobachter } = db.auth.onAuthStateChange((ereignis, sitzung) => {
      if (fremdeDatenWeg(sitzung?.user)) return
      uebernimmMerker(sitzung?.user)
      setNutzer(sitzung?.user ?? null)
      setLaedt(false)
      if (sitzung?.user) merkeSprache()
      merkeHerkunftImKonto(sitzung?.user)
      // Der Klick in der "Passwort vergessen"-Mail fuehrt hierher.
      // Supabase meldet den Nutzer dabei schon an – aber mit dem ALTEN
      // Passwort im Kopf. Ohne dieses Signal stuende er einfach in der
      // App, wuesste nicht, dass er jetzt ein neues setzen muss, und
      // haette es beim naechsten Mal wieder vergessen. Bis zum 23.08.
      // war genau das der Zustand: Mail kam, Link ging, Formular fehlte.
      if (ereignis === 'PASSWORD_RECOVERY') setPasswortNeuSetzen(true)
    })

    return () => beobachter.subscription.unsubscribe()
  }, [])

  return { nutzer, laedt, passwortNeuSetzen, passwortGesetzt: () => setPasswortNeuSetzen(false) }
}

/** Setzt nach dem Klick in der Wiederherstellungs-Mail das neue Passwort. */
export async function neuesPasswortSetzen(passwort) {
  const { error } = await db.auth.updateUser({ password: passwort })
  if (error) throw new Error(uebersetzeFehler(error))
}

/** Anzeigename fürs Profil – fällt auf den Teil vor dem @ zurück. */
export function anzeigename(nutzer) {
  if (!nutzer) return ''
  return nutzer.user_metadata?.name || nutzer.email?.split('@')[0] || 'Du'
}

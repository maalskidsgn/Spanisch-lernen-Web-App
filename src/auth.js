/**
 * Anmeldung und Konten für Habloo.
 *
 * Wichtig: Die App funktioniert auch OHNE Konto weiter – dann liegen
 * alle Daten wie bisher nur im Browser. Ein Konto bringt zwei Dinge:
 * Sicherung der Daten und Nutzung auf mehreren Geräten.
 */

import { useState, useEffect } from 'react'
import { db, supabaseBereit } from './supabase.js'

// ---------------------------------------------------------------
//  Fehlermeldungen auf Deutsch
// ---------------------------------------------------------------
// Supabase antwortet auf Englisch; hier die häufigsten Fälle übersetzt.
const MELDUNGEN = {
  'Invalid login credentials': 'E-Mail oder Passwort stimmt nicht.',
  'User already registered': 'Für diese E-Mail gibt es schon ein Konto. Melde dich einfach an.',
  'Email not confirmed': 'Bitte bestätige zuerst den Link in deiner E-Mail.',
  'Password should be at least 6 characters':
    'Das Passwort braucht mindestens 6 Zeichen.',
  'Unable to validate email address: invalid format':
    'Diese E-Mail-Adresse sieht nicht richtig aus.',
  'For security purposes, you can only request this after 60 seconds.':
    'Kurz warten – aus Sicherheitsgründen geht das nur einmal pro Minute.',
  'Signup requires a valid password': 'Bitte gib ein Passwort ein.',
  'Email rate limit exceeded':
    'Gerade wurden zu viele E-Mails verschickt. Bitte später noch einmal versuchen.',
}

function uebersetzeFehler(fehler) {
  if (!fehler) return ''
  const text = fehler.message ?? ''

  if (MELDUNGEN[text]) return MELDUNGEN[text]

  // Meldungen mit wechselndem Inhalt (z. B. die genannte Adresse)
  if (/is invalid/.test(text) && /email/i.test(text)) {
    return 'Diese E-Mail-Adresse wird nicht akzeptiert. Bitte nimm deine richtige Adresse.'
  }
  if (/password/i.test(text) && /least/i.test(text)) {
    return 'Das Passwort braucht mindestens 6 Zeichen.'
  }
  return text
}

// ---------------------------------------------------------------
//  Konto anlegen / anmelden / abmelden
// ---------------------------------------------------------------

/** Legt ein neues Konto an. */
export async function registrieren(email, passwort, name) {
  const { data, error } = await db.auth.signUp({
    email: email.trim(),
    password: passwort,
    options: { data: { name: name?.trim() || undefined } },
  })
  if (error) throw new Error(uebersetzeFehler(error))

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

/** Meldet ab – die lokalen Daten im Browser bleiben erhalten. */
export async function abmelden() {
  const { error } = await db.auth.signOut()
  if (error) throw new Error(uebersetzeFehler(error))
}

/** Schickt eine E-Mail zum Zurücksetzen des Passworts. */
export async function passwortVergessen(email) {
  const { error } = await db.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: window.location.origin,
  })
  if (error) throw new Error(uebersetzeFehler(error))
}

// ---------------------------------------------------------------
//  React-Hook: wer ist gerade angemeldet?
// ---------------------------------------------------------------

/**
 * Liefert den angemeldeten Nutzer (oder null) und meldet sich
 * automatisch bei jeder Änderung neu.
 *
 *   const { nutzer, laedt } = useNutzer()
 */
export function useNutzer() {
  const [nutzer, setNutzer] = useState(null)
  const [laedt, setLaedt] = useState(supabaseBereit)

  useEffect(() => {
    if (!supabaseBereit) return

    // Beim Start: gibt es noch eine gültige Sitzung?
    db.auth.getSession().then(({ data }) => {
      setNutzer(data.session?.user ?? null)
      setLaedt(false)
    })

    // Danach: auf An- und Abmelden reagieren
    const { data: beobachter } = db.auth.onAuthStateChange((_ereignis, sitzung) => {
      setNutzer(sitzung?.user ?? null)
      setLaedt(false)
    })

    return () => beobachter.subscription.unsubscribe()
  }, [])

  return { nutzer, laedt }
}

/** Anzeigename fürs Profil – fällt auf den Teil vor dem @ zurück. */
export function anzeigename(nutzer) {
  if (!nutzer) return ''
  return nutzer.user_metadata?.name || nutzer.email?.split('@')[0] || 'Du'
}

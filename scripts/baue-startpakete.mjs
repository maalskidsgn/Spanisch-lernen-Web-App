// Erzeugt src/startpakete.js – die sechs fertigen Startpakete.
//
// Aufruf (Server muss auf 8787 laufen):
//   node scripts/baue-startpakete.mjs
//
// Die Wortlisten kommen aus genau dem Endpunkt, den die App auch
// sonst benutzt. Video und Song stehen unten von Hand drin: Die
// automatische Suche lieferte für "Spanisch lernen für Anfänger"
// einen Algebra-Kurs und einen Gebärdensprach-Kurs.

import { writeFileSync } from 'fs'

const SERVER = process.env.HABLOO_SERVER || 'http://localhost:8787'

const PAKETE = [
  {
    id: 'reisen',
    label: 'Reisen',
    thema: 'Reisen und unterwegs sein in Spanien',
    video: ['xyMglrghklc', 'Aprender español para principiantes: Lección 1 – Los saludos'],
    song: ['qExd-3oCTl4', 'Carlos Baute – Colgando en tus manos (con Marta Sánchez)'],
  },
  {
    id: 'familie',
    label: 'Familie',
    thema: 'Familie und nahestehende Menschen',
    video: ['xyMglrghklc', 'Aprender español para principiantes: Lección 1 – Los saludos'],
    song: ['uN6hzjkrZ4w', 'Pablo Alborán feat. Jesse & Joy – Dónde está el amor'],
  },
  {
    id: 'kultur',
    label: 'Musik & Kultur',
    thema: 'Musik, Ausgehen und Kultur',
    video: ['Ek3g10qXPZc', 'Talk About Your Daily Routine in a Small Town – A1 Spanish'],
    song: ['AnioNDuHu6M', 'J. Balvin, Bad Bunny – LA CANCIÓN (Letra)'],
  },
  {
    id: 'beruf',
    label: 'Beruf',
    thema: 'Arbeit und Beruf',
    video: ['oKwtZoa803I', 'How to Find a Job: Spanish Tips & Vocabulary'],
    song: ['qExd-3oCTl4', 'Carlos Baute – Colgando en tus manos (con Marta Sánchez)'],
  },
  {
    id: 'auswandern',
    label: 'Alltag in Spanien',
    thema: 'Wohnen, Behörden und Alltag in Spanien',
    video: ['fYxvYjK-crs', 'Aprende Español Podcast: Ahorrando Pequeñas Cantidades'],
    song: ['KiZfl9IByx4', 'Sergio Dalma – Bailar Pegados (Letra)'],
  },
  {
    id: 'lust',
    label: 'deine ersten Wörter',
    thema: 'die allerersten Wörter für den Einstieg',
    video: ['xyMglrghklc', 'Aprender español para principiantes: Lección 1 – Los saludos'],
    song: ['SJSML8LguBk', 'Quevedo, Nueva Línea – AL GOLPITO (Letra)'],
  },
]

const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
const bild = (id) => 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'

const kopf = `// Die sechs Startpakete.
//
// Sie liegen fertig hier und werden NICHT beim Besuch erzeugt. Drei
// Gründe, alle handfest:
//
//   Kosten – der Trichter läuft VOR der Anmeldung. Jeder anonyme
//   Besuch löste sonst eine OpenAI-Anfrage aus, und wer das Formular
//   in Ruhe hundertmal abschickt, bezahlt es nicht selbst.
//
//   Verlässlichkeit – das Startpaket ist das Erste, was jemand von
//   Habloo sieht. Ein leerer Kasten, weil das Kontingent erschöpft
//   ist, wäre der schlechteste erste Eindruck von allen.
//
//   Tempo – ohne Netz-Anfrage ist es sofort da.
//
// Es sind trotzdem echte KI-Inhalte: Die Wortlisten stammen aus genau
// dem Endpunkt, den die App auch sonst benutzt (/api/vokabelliste,
// gpt-4o-mini) – nur einmal im Voraus statt bei jedem Besuch. Der
// Ladebildschirm behauptet also nichts, was nicht stimmt.
//
// Video und Song sind von Hand gewählt. Die automatische Suche
// lieferte für "Spanisch lernen für Anfänger" unter anderem einen
// Algebra-Kurs und einen Gebärdensprach-Kurs – als erster Eindruck
// unbrauchbar.
//
// NICHT von Hand bearbeiten, sondern neu erzeugen:
//   node scripts/baue-startpakete.mjs

export const STARTPAKETE = {
`

const fuss = `}

/** Das Paket zu einem Grund – mit Rückfall, falls die Kennung nicht passt. */
export function paketFuer(grund) {
  return STARTPAKETE[grund] ?? STARTPAKETE.lust
}

/** Alle Kennungen – der Prüfer vergleicht sie mit den Antwortmöglichkeiten. */
export const PAKET_IDS = Object.keys(STARTPAKETE)
`

let rumpf = ''
for (const p of PAKETE) {
  process.stdout.write(p.id + ' … ')
  const antwort = await fetch(SERVER + '/api/vokabelliste', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ thema: p.thema }),
  })
  const daten = await antwort.json()
  if (!daten.vokabeln?.length) {
    console.error('FEHLGESCHLAGEN: ' + (daten.error ?? antwort.status))
    process.exit(1)
  }

  rumpf += `  ${p.id}: {\n`
  rumpf += `    label: '${esc(p.label)}',\n`
  rumpf += `    thema: '${esc(daten.thema || p.thema)}',\n`
  rumpf += `    begruendung:\n      '${esc(daten.begruendung)}',\n`
  rumpf += `    video: { videoId: '${p.video[0]}', title: '${esc(p.video[1])}', thumbnail: '${bild(p.video[0])}' },\n`
  rumpf += `    song: { videoId: '${p.song[0]}', title: '${esc(p.song[1])}', thumbnail: '${bild(p.song[0])}' },\n`
  rumpf += `    vokabeln: [\n`
  for (const v of daten.vokabeln) {
    rumpf += `      { wort: '${esc(v.wort)}', uebersetzung: '${esc(v.uebersetzung)}', beispiel: '${esc(v.beispiel)}' },\n`
  }
  rumpf += `    ],\n  },\n`
  console.log(daten.vokabeln.length + ' Wörter')
}

writeFileSync('src/startpakete.js', kopf + rumpf + fuss)
console.log('\nsrc/startpakete.js geschrieben.')

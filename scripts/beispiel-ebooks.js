#!/usr/bin/env node
/**
 * Legt die beiden Beispiel-E-Books an, die jeder Nutzer sieht.
 *
 * Diese Bücher sind handgeschrieben (nicht generiert): der spanische
 * Text ist auf das jeweilige Niveau abgestimmt, die deutsche Fassung
 * ist frei übersetzt statt Wort für Wort.
 *
 * Aufruf:  node scripts/beispiel-ebooks.js
 */

import { readFileSync } from 'node:fs'

// Zugangsdaten aus .env.local
const env = {}
for (const zeile of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const t = zeile.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (t) env[t[1]] = t[2].trim()
}

const URL_BASIS = env.SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_KEY

// ---------------------------------------------------------------
//  Buch 1 – Niveau A1
// ---------------------------------------------------------------
const BUCH_A1 = {
  titel: 'El primer día de Lena en Madrid',
  autor: 'Habloo',
  thema: 'Ankommen in einer neuen Stadt',
  niveau: 'A1',
  kapitel: [
    {
      es: 'Lena llega a Madrid por la mañana. El avión aterriza a las nueve. Ella está muy cansada, pero también está contenta.',
      de: 'Lena kommt am Morgen in Madrid an. Das Flugzeug landet um neun Uhr. Sie ist sehr müde, aber auch glücklich.',
    },
    {
      es: 'En el aeropuerto, Lena busca un taxi. Un hombre le pregunta: «¿Adónde vas?» Lena responde: «Al centro, por favor.»',
      de: 'Am Flughafen sucht Lena ein Taxi. Ein Mann fragt sie: „Wohin möchtest du?" Lena antwortet: „Ins Zentrum, bitte."',
    },
    {
      es: 'El taxi pasa por calles grandes. Lena mira por la ventana. Hay muchas personas, muchos coches y mucho sol.',
      de: 'Das Taxi fährt durch große Straßen. Lena schaut aus dem Fenster. Es gibt viele Menschen, viele Autos und viel Sonne.',
    },
    {
      es: 'Su hotel es pequeño pero bonito. La recepcionista se llama Carmen. «Bienvenida», dice Carmen con una sonrisa.',
      de: 'Ihr Hotel ist klein, aber hübsch. Die Empfangsdame heißt Carmen. „Willkommen", sagt Carmen mit einem Lächeln.',
    },
    {
      es: 'Lena deja la maleta en la habitación. Después sale a la calle. Tiene hambre y busca un café.',
      de: 'Lena lässt den Koffer im Zimmer. Danach geht sie auf die Straße. Sie hat Hunger und sucht ein Café.',
    },
    {
      es: 'En el café pide un cortado y una tostada. Todo cuesta tres euros. «¡Qué barato!», piensa Lena.',
      de: 'Im Café bestellt sie einen Cortado und einen Toast. Alles kostet drei Euro. „Wie günstig!", denkt Lena.',
    },
    {
      es: 'Por la tarde, Lena camina por el parque del Retiro. Hay músicos, familias y un lago con barcas.',
      de: 'Am Nachmittag spaziert Lena durch den Retiro-Park. Es gibt Musiker, Familien und einen See mit Booten.',
    },
    {
      es: 'Por la noche, Lena escribe en su cuaderno: «Hoy es mi primer día aquí. Creo que Madrid me va a gustar mucho.»',
      de: 'Am Abend schreibt Lena in ihr Heft: „Heute ist mein erster Tag hier. Ich glaube, Madrid wird mir sehr gefallen."',
    },
  ],
  vokabeln: [
    { es: 'llegar', de: 'ankommen' },
    { es: 'cansado', de: 'müde' },
    { es: 'buscar', de: 'suchen' },
    { es: 'la calle', de: 'die Straße' },
    { es: 'la habitación', de: 'das Zimmer' },
    { es: 'tener hambre', de: 'Hunger haben' },
    { es: 'pedir', de: 'bestellen' },
    { es: 'barato', de: 'günstig' },
    { es: 'caminar', de: 'spazieren gehen' },
    { es: 'gustar', de: 'gefallen' },
  ],
}

// ---------------------------------------------------------------
//  Buch 2 – Niveau A2
// ---------------------------------------------------------------
const BUCH_A2 = {
  titel: 'La llave perdida',
  autor: 'Habloo',
  thema: 'Eine kleine Geschichte aus dem Alltag',
  niveau: 'A2',
  kapitel: [
    {
      es: 'Marcos salió de casa con prisa. Tenía una reunión importante a las diez y ya eran las nueve y media.',
      de: 'Marcos verließ das Haus in Eile. Er hatte um zehn Uhr einen wichtigen Termin, und es war schon halb zehn.',
    },
    {
      es: 'Cuando llegó a la oficina, metió la mano en el bolsillo y no encontró nada. La llave había desaparecido.',
      de: 'Als er im Büro ankam, griff er in die Tasche und fand nichts. Der Schlüssel war verschwunden.',
    },
    {
      es: '«No pasa nada», pensó. «Seguro que está en casa.» Pero por la tarde, cuando volvió, la puerta seguía cerrada.',
      de: '„Halb so wild", dachte er. „Bestimmt liegt er zu Hause." Doch als er am Nachmittag zurückkam, war die Tür immer noch zu.',
    },
    {
      es: 'Llamó a su vecina, la señora Ortiz. Ella siempre sabía qué hacer. «Espera un momento», dijo. «Voy a preguntar en la panadería.»',
      de: 'Er rief seine Nachbarin an, Frau Ortiz. Sie wusste immer, was zu tun war. „Warte kurz", sagte sie. „Ich frage in der Bäckerei nach."',
    },
    {
      es: 'Diez minutos después, la señora Ortiz volvió sonriendo. En la mano llevaba una llave pequeña con un llavero rojo.',
      de: 'Zehn Minuten später kam Frau Ortiz lächelnd zurück. In der Hand hielt sie einen kleinen Schlüssel mit rotem Anhänger.',
    },
    {
      es: '«El panadero la encontró esta mañana en el mostrador», explicó. «Se te cayó cuando pagaste el café.»',
      de: '„Der Bäcker hat ihn heute Morgen auf der Theke gefunden", erklärte sie. „Er ist dir heruntergefallen, als du den Kaffee bezahlt hast."',
    },
    {
      es: 'Marcos se rio. Había pasado todo el día preocupado por algo que estaba a cincuenta metros de su puerta.',
      de: 'Marcos lachte. Er hatte sich den ganzen Tag Sorgen gemacht wegen etwas, das fünfzig Meter von seiner Tür entfernt lag.',
    },
    {
      es: 'Desde entonces, Marcos siempre revisa los bolsillos antes de salir. Y cada viernes compra pan en la misma panadería.',
      de: 'Seitdem prüft Marcos immer die Taschen, bevor er geht. Und jeden Freitag kauft er Brot in derselben Bäckerei.',
    },
  ],
  vokabeln: [
    { es: 'con prisa', de: 'in Eile' },
    { es: 'la reunión', de: 'die Besprechung' },
    { es: 'el bolsillo', de: 'die Tasche' },
    { es: 'desaparecer', de: 'verschwinden' },
    { es: 'la vecina', de: 'die Nachbarin' },
    { es: 'preguntar', de: 'nachfragen' },
    { es: 'el mostrador', de: 'die Theke' },
    { es: 'caerse', de: 'herunterfallen' },
    { es: 'preocupado', de: 'besorgt' },
    { es: 'revisar', de: 'überprüfen' },
  ],
}

// ---------------------------------------------------------------
//  Einspielen
// ---------------------------------------------------------------
const kopf = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
}

console.log('\n📖 Beispiel-E-Books anlegen\n')

// Vorhandene Beispiele entfernen, damit das Skript wiederholbar bleibt
await fetch(`${URL_BASIS}/rest/v1/ebooks?ist_beispiel=eq.true`, {
  method: 'DELETE',
  headers: kopf,
})

for (const buch of [BUCH_A1, BUCH_A2]) {
  const antwort = await fetch(`${URL_BASIS}/rest/v1/ebooks`, {
    method: 'POST',
    headers: { ...kopf, Prefer: 'return=representation' },
    body: JSON.stringify({ ...buch, nutzer_id: null, ist_beispiel: true }),
  })

  if (!antwort.ok) {
    console.error(`❌ ${buch.titel}: ${(await antwort.text()).slice(0, 200)}`)
    continue
  }
  console.log(`✅ ${buch.titel} (${buch.niveau}) – ${buch.kapitel.length} Absätze, ${buch.vokabeln.length} Vokabeln`)
}

const alle = await (
  await fetch(`${URL_BASIS}/rest/v1/ebooks?select=titel,niveau&ist_beispiel=eq.true`, { headers: kopf })
).json()
console.log(`\n── Beispiel-Bücher in der Datenbank: ${alle.length}\n`)

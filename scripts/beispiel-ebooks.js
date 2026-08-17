#!/usr/bin/env node
/**
 * Legt die beiden Beispiel-E-Books an, die jeder Nutzer sieht.
 *
 * Aufbau wie bei Blinkist: Einführung → Kapitel → Schluss, jede
 * Überschrift eine Kernaussage. Alles zweisprachig; in der App
 * schaltet man unten zwischen Spanisch und Deutsch um.
 *
 * Aufruf:  node scripts/beispiel-ebooks.js
 */

import { readFileSync } from 'node:fs'

const env = {}
for (const zeile of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const t = zeile.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (t) env[t[1]] = t[2].trim()
}

const URL_BASIS = env.SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_KEY

// ---------------------------------------------------------------
//  Buch 1 – A1: Kleine Gewohnheiten
// ---------------------------------------------------------------
const BUCH_A1 = {
  titel: 'Pequeños hábitos, gran vida',
  titel_de: 'Kleine Gewohnheiten, großes Leben',
  untertitel_es: 'Cómo los pasos pequeños cambian tu día a día',
  untertitel_de: 'Wie kleine Schritte deinen Alltag verändern',
  autor: 'Habloo',
  thema: 'Gewohnheiten',
  niveau: 'A1',
  kapitel: [
    {
      label_es: 'Introducción', label_de: 'Einführung',
      titel_es: 'Lo que hay aquí para ti: el poder de lo pequeño',
      titel_de: 'Was drin ist für dich: die Kraft des Kleinen',
      text_es:
        'Muchas personas quieren cambiar su vida. Quieren hacer más deporte, comer mejor o aprender español. Pero los planes grandes son difíciles.\n\n' +
        'Este libro tiene una idea simple: no necesitas planes grandes. Necesitas hábitos pequeños. Un hábito es una cosa que haces todos los días, casi sin pensar.',
      text_de:
        'Viele Menschen wollen ihr Leben verändern. Sie wollen mehr Sport machen, besser essen oder Spanisch lernen. Aber große Pläne sind schwer.\n\n' +
        'Dieses Buch hat eine einfache Idee: Du brauchst keine großen Pläne. Du brauchst kleine Gewohnheiten. Eine Gewohnheit ist etwas, das du jeden Tag tust – fast ohne nachzudenken.',
    },
    {
      label_es: 'Capítulo 1', label_de: 'Kapitel 1',
      titel_es: 'Empieza tan pequeño que no puedas decir no',
      titel_de: 'Fang so klein an, dass du nicht Nein sagen kannst',
      text_es:
        '¿Quieres leer más? Lee una página cada noche. ¿Quieres hacer deporte? Haz dos minutos cada mañana. Parece poco, pero no importa.\n\n' +
        'Lo importante es el ritmo, no el tamaño. Cuando algo es muy fácil, lo haces todos los días. Y después de unas semanas, dos minutos son diez minutos.',
      text_de:
        'Du willst mehr lesen? Lies jeden Abend eine Seite. Du willst Sport machen? Mach jeden Morgen zwei Minuten. Das klingt nach wenig – aber das macht nichts.\n\n' +
        'Wichtig ist der Rhythmus, nicht die Größe. Wenn etwas sehr leicht ist, machst du es jeden Tag. Und nach ein paar Wochen werden aus zwei Minuten zehn.',
    },
    {
      label_es: 'Capítulo 2', label_de: 'Kapitel 2',
      titel_es: 'Une el hábito nuevo a una cosa que ya haces',
      titel_de: 'Verbinde die neue Gewohnheit mit etwas, das du schon tust',
      text_es:
        'Tu día ya tiene una estructura: te levantas, haces café, comes. Usa esta estructura.\n\n' +
        'La fórmula es: después de X, hago Y. Después del café, estudio cinco palabras de español. Después de la cena, salgo a caminar. Así el hábito nuevo tiene un lugar fijo en tu día.',
      text_de:
        'Dein Tag hat schon eine Struktur: Du stehst auf, machst Kaffee, isst. Nutze diese Struktur.\n\n' +
        'Die Formel lautet: Nach X mache ich Y. Nach dem Kaffee lerne ich fünf spanische Wörter. Nach dem Abendessen gehe ich spazieren. So bekommt die neue Gewohnheit einen festen Platz in deinem Tag.',
    },
    {
      label_es: 'Conclusión', label_de: 'Fazit',
      titel_es: 'El resumen: pequeño + cada día = grande',
      titel_de: 'Das Fazit: klein + jeden Tag = groß',
      text_es:
        'No necesitas motivación grande. Necesitas pasos pequeños y un lugar fijo en tu día.\n\n' +
        'Empieza hoy: elige un hábito mini. Una página, dos minutos, cinco palabras. En un año, esto es un libro entero, muchas horas de deporte y mil palabras nuevas de español.',
      text_de:
        'Du brauchst keine große Motivation. Du brauchst kleine Schritte und einen festen Platz in deinem Tag.\n\n' +
        'Fang heute an: Wähle eine Mini-Gewohnheit. Eine Seite, zwei Minuten, fünf Wörter. In einem Jahr ist das ein ganzes Buch, viele Stunden Sport – und tausend neue spanische Wörter.',
    },
  ],
  vokabeln: [
    { es: 'el hábito', de: 'die Gewohnheit' },
    { es: 'cambiar', de: 'verändern' },
    { es: 'fácil', de: 'leicht' },
    { es: 'todos los días', de: 'jeden Tag' },
    { es: 'empezar', de: 'anfangen' },
    { es: 'la página', de: 'die Seite' },
    { es: 'después de', de: 'nach' },
    { es: 'elegir', de: 'auswählen' },
    { es: 'el paso', de: 'der Schritt' },
    { es: 'el lugar', de: 'der Ort / Platz' },
  ],
}

// ---------------------------------------------------------------
//  Buch 2 – A2: Ikigai
// ---------------------------------------------------------------
const BUCH_A2 = {
  titel: 'Ikigai: los secretos de Japón para una vida larga y feliz',
  titel_de: 'Ikigai: Japans Geheimnisse für ein langes, glückliches Leben',
  untertitel_es: 'Por qué los japoneses encuentran sentido en las cosas pequeñas',
  untertitel_de: 'Warum die Japaner Sinn in den kleinen Dingen finden',
  autor: 'Ken Mogi',
  thema: 'Ikigai',
  niveau: 'A2',
  kapitel: [
    {
      label_es: 'Introducción', label_de: 'Einführung',
      titel_es: '¿De qué trata «Ikigai»?',
      titel_de: 'Worum geht es in „Ikigai"?',
      text_es:
        'Ken Mogi explica en «Ikigai» un principio central de la vida japonesa: ikigai significa, más o menos, «una razón para levantarse por la mañana».\n\n' +
        'No es necesario tener un trabajo espectacular o mucho dinero. El ikigai puede ser algo pequeño: cuidar un jardín, preparar un buen té o ver el mar cada día.',
      text_de:
        'Ken Mogi erklärt in „Ikigai" ein zentrales Prinzip des japanischen Lebens: Ikigai bedeutet ungefähr „ein Grund, morgens aufzustehen".\n\n' +
        'Man braucht dafür keinen spektakulären Job und kein großes Geld. Das Ikigai kann etwas Kleines sein: einen Garten pflegen, einen guten Tee zubereiten oder jeden Tag das Meer sehen.',
    },
    {
      label_es: 'Capítulo 1', label_de: 'Kapitel 1',
      titel_es: 'Empezar pequeño es un arte japonés',
      titel_de: 'Klein anzufangen ist eine japanische Kunst',
      text_es:
        'El primer pilar del ikigai es empezar pequeño. Los maestros japoneses del sushi practican durante años solo el arroz. No es aburrido para ellos: es el camino.\n\n' +
        'Mogi dice: cuando haces una cosa pequeña con mucho cuidado, encuentras alegría en ella. La perfección no es la meta; la atención sí.',
      text_de:
        'Die erste Säule des Ikigai heißt: klein anfangen. Japanische Sushi-Meister üben jahrelang nur den Reis. Für sie ist das nicht langweilig – es ist der Weg.\n\n' +
        'Mogi sagt: Wenn du eine kleine Sache mit großer Sorgfalt machst, findest du Freude darin. Nicht die Perfektion ist das Ziel, sondern die Aufmerksamkeit.',
    },
    {
      label_es: 'Capítulo 2', label_de: 'Kapitel 2',
      titel_es: 'Liberarse del propio yo quita presión',
      titel_de: 'Sich vom eigenen Ich zu lösen nimmt Druck weg',
      text_es:
        'El segundo pilar es liberarse del yo. En Japón, muchas personas no trabajan para ser famosas. Trabajan porque el trabajo mismo tiene valor.\n\n' +
        'Cuando no piensas todo el tiempo en ti mismo, en tu imagen o en tu éxito, la vida se vuelve más ligera. Puedes concentrarte en el momento presente.',
      text_de:
        'Die zweite Säule heißt: sich vom Ich lösen. In Japan arbeiten viele Menschen nicht, um berühmt zu werden. Sie arbeiten, weil die Arbeit selbst einen Wert hat.\n\n' +
        'Wer nicht ständig an sich selbst denkt, an sein Bild oder seinen Erfolg, für den wird das Leben leichter. Man kann sich auf den Moment konzentrieren.',
    },
    {
      label_es: 'Capítulo 3', label_de: 'Kapitel 3',
      titel_es: 'La armonía con otros hace la vida sostenible',
      titel_de: 'Harmonie mit anderen macht das Leben tragfähig',
      text_es:
        'El tercer pilar es la armonía. En la isla de Okinawa, donde viven muchas personas de más de cien años, todos forman parte de un grupo: el moai.\n\n' +
        'Un moai es un círculo de amigos para toda la vida. Sus miembros se ayudan, comen juntos y celebran juntos. Esta conexión, dice Mogi, es una de las razones de la larga vida.',
      text_de:
        'Die dritte Säule ist die Harmonie. Auf der Insel Okinawa, wo besonders viele über Hundertjährige leben, gehört jeder zu einer Gruppe: dem Moai.\n\n' +
        'Ein Moai ist ein Freundeskreis fürs Leben. Seine Mitglieder helfen sich, essen zusammen und feiern zusammen. Diese Verbundenheit, sagt Mogi, ist einer der Gründe für das lange Leben.',
    },
    {
      label_es: 'Conclusión', label_de: 'Fazit',
      titel_es: 'El ikigai no se busca, se cultiva',
      titel_de: 'Das Ikigai sucht man nicht – man pflegt es',
      text_es:
        'El mensaje final de Mogi: no tienes que viajar lejos para encontrar tu ikigai. Ya está en tu vida, en las cosas pequeñas que amas.\n\n' +
        'Pregúntate: ¿qué me da alegría por la mañana? Puede ser el café, un paseo, una conversación. Cultiva estas cosas cada día, y tu vida tendrá sentido: ese es el ikigai.',
      text_de:
        'Mogis Botschaft am Ende: Du musst nicht weit reisen, um dein Ikigai zu finden. Es ist schon in deinem Leben – in den kleinen Dingen, die du liebst.\n\n' +
        'Frag dich: Was macht mir morgens Freude? Das kann der Kaffee sein, ein Spaziergang, ein Gespräch. Pflege diese Dinge jeden Tag, und dein Leben bekommt Sinn – genau das ist Ikigai.',
    },
  ],
  vokabeln: [
    { es: 'la razón', de: 'der Grund' },
    { es: 'levantarse', de: 'aufstehen' },
    { es: 'cuidar', de: 'pflegen, sich kümmern um' },
    { es: 'el pilar', de: 'die Säule' },
    { es: 'la alegría', de: 'die Freude' },
    { es: 'la meta', de: 'das Ziel' },
    { es: 'el éxito', de: 'der Erfolg' },
    { es: 'ligero', de: 'leicht' },
    { es: 'la armonía', de: 'die Harmonie' },
    { es: 'el sentido', de: 'der Sinn' },
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
  console.log(`✅ ${buch.titel} (${buch.niveau}) – ${buch.kapitel.length} Kapitel`)
}

const alle = await (
  await fetch(`${URL_BASIS}/rest/v1/ebooks?select=titel,niveau&ist_beispiel=eq.true`, { headers: kopf })
).json()
console.log(`\n── Beispiel-Bücher in der Datenbank: ${alle.length}\n`)

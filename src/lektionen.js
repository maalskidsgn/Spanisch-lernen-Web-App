// Die Grundlagen-Lektionen (wie bei Babbel) mit geführtem Aufbau:
// Einleitung (Lernziele) → neue Wörter mit Beispielsätzen → "Gut zu wissen"
// → Dialog zum Mitlesen → Übungen (Auswahl + Lückentext) → Abschluss.
// Neue Lektionen hinzufügen = einfach einen Eintrag ergänzen!

export const LEKTIONEN = [
  {
    id: 'begruessung',
    titel: 'Begrüßung',
    emoji: '👋',
    beschreibung: 'Hallo sagen wie ein Muttersprachler',
    ziele: [
      'Hallo und Tschüss sagen',
      'Grüße für jede Tageszeit kennen',
      'Deinen ersten Dialog verstehen',
    ],
    items: [
      { es: 'hola', de: 'hallo', beispielEs: '¡Hola, María!', beispielDe: 'Hallo, María!' },
      { es: 'buenos días', de: 'guten Morgen', beispielEs: 'Buenos días, ¿cómo está usted?', beispielDe: 'Guten Morgen, wie geht es Ihnen?' },
      { es: 'buenas noches', de: 'gute Nacht', beispielEs: 'Buenas noches, hasta mañana.', beispielDe: 'Gute Nacht, bis morgen.' },
      { es: 'adiós', de: 'tschüss', beispielEs: '¡Adiós y buen viaje!', beispielDe: 'Tschüss und gute Reise!' },
      { es: 'hasta luego', de: 'bis später', beispielEs: 'Me voy, ¡hasta luego!', beispielDe: 'Ich gehe, bis später!' },
    ],
    wissen: [
      {
        emoji: '🕐',
        titel: 'Der richtige Gruß zur richtigen Zeit',
        text: '*Buenos días* sagst du am Morgen. *Buenas noches* geht am Abend zum Begrüßen UND zum Verabschieden.',
      },
      {
        emoji: '❗',
        titel: 'Die umgedrehten Zeichen',
        text: 'Ausrufe stehen im Spanischen zwischen zwei Zeichen: *¡Hola!* – das umgedrehte *¡* kommt an den Anfang.',
      },
    ],
    dialog: [
      { sprecher: 'Ana', es: '¡Hola, Luis!', de: 'Hallo, Luis!' },
      { sprecher: 'Luis', es: '¡Buenos días, Ana! ¿Qué tal?', de: 'Guten Morgen, Ana! Wie geht’s?' },
      { sprecher: 'Ana', es: 'Bien, gracias. Me voy al trabajo.', de: 'Gut, danke. Ich gehe zur Arbeit.' },
      { sprecher: 'Luis', es: '¡Adiós, hasta luego!', de: 'Tschüss, bis später!' },
    ],
  },
  {
    id: 'vorstellen',
    titel: 'Sich vorstellen',
    emoji: '🙋',
    beschreibung: 'Name, Herkunft und Befinden',
    ziele: [
      'Deinen Namen sagen und nach Namen fragen',
      'Sagen, woher du kommst',
      'Fragen, wie es jemandem geht',
    ],
    items: [
      { es: 'me llamo…', de: 'ich heiße…', beispielEs: 'Me llamo Manuel.', beispielDe: 'Ich heiße Manuel.' },
      { es: '¿cómo te llamas?', de: 'wie heißt du?', beispielEs: 'Hola, ¿cómo te llamas?', beispielDe: 'Hallo, wie heißt du?' },
      { es: 'mucho gusto', de: 'freut mich', beispielEs: 'Mucho gusto, Carmen.', beispielDe: 'Freut mich, Carmen.' },
      { es: 'soy de Alemania', de: 'ich komme aus Deutschland', beispielEs: 'Soy de Alemania, de Berlín.', beispielDe: 'Ich komme aus Deutschland, aus Berlin.' },
      { es: '¿cómo estás?', de: 'wie geht es dir?', beispielEs: '¿Cómo estás hoy?', beispielDe: 'Wie geht es dir heute?' },
    ],
    wissen: [
      {
        emoji: '🙋',
        titel: 'Ich, du, er? Einfach weglassen!',
        text: 'Im Spanischen lässt man *yo* (ich) meist weg: *Soy de Alemania* heißt wörtlich nur „Bin aus Deutschland“ – die Verbform verrät, wer gemeint ist.',
      },
      {
        emoji: '💬',
        titel: 'Zwei kleine Helfer',
        text: '*¿Y tú?* („Und du?“) und *Mucho gusto* machen jedes Kennenlernen rund und freundlich.',
      },
    ],
    dialog: [
      { sprecher: 'Carmen', es: 'Hola, ¿cómo te llamas?', de: 'Hallo, wie heißt du?' },
      { sprecher: 'Manuel', es: 'Me llamo Manuel. ¿Y tú?', de: 'Ich heiße Manuel. Und du?' },
      { sprecher: 'Carmen', es: 'Soy Carmen. Mucho gusto.', de: 'Ich bin Carmen. Freut mich.' },
      { sprecher: 'Manuel', es: 'Mucho gusto. Soy de Alemania.', de: 'Freut mich. Ich komme aus Deutschland.' },
    ],
  },
  {
    id: 'zahlen',
    titel: 'Zahlen',
    emoji: '🔢',
    beschreibung: 'Von eins bis zehn zählen',
    ziele: [
      'Die wichtigsten Zahlen bis zehn',
      'Mengen bestellen wie ein Local',
      'Preise und Uhrzeiten verstehen',
    ],
    items: [
      { es: 'uno', de: 'eins', beispielEs: 'Solo uno, por favor.', beispielDe: 'Nur eins, bitte.' },
      { es: 'dos', de: 'zwei', beispielEs: 'Dos cafés, por favor.', beispielDe: 'Zwei Kaffee, bitte.' },
      { es: 'tres', de: 'drei', beispielEs: 'Son las tres.', beispielDe: 'Es ist drei Uhr.' },
      { es: 'cinco', de: 'fünf', beispielEs: 'Cinco minutos más.', beispielDe: 'Noch fünf Minuten.' },
      { es: 'diez', de: 'zehn', beispielEs: 'Son diez euros.', beispielDe: 'Das macht zehn Euro.' },
    ],
    wissen: [
      {
        emoji: '☝️',
        titel: 'uno wird un',
        text: 'Vor männlichen Wörtern wird *uno* zu *un*: *un café*, aber *una cerveza*.',
      },
      {
        emoji: '🛒',
        titel: 'Die Bestell-Formel',
        text: 'Zahl + Wort + *por favor*: *Dos cervezas, por favor* – damit klingst du sofort wie ein Local!',
      },
    ],
    dialog: [
      { sprecher: 'Kellner', es: 'Buenos días, ¿qué desea?', de: 'Guten Morgen, was möchten Sie?' },
      { sprecher: 'Gast', es: 'Dos cafés, por favor.', de: 'Zwei Kaffee, bitte.' },
      { sprecher: 'Kellner', es: 'Son cinco euros.', de: 'Das macht fünf Euro.' },
      { sprecher: 'Gast', es: 'Gracias, ¡hasta luego!', de: 'Danke, bis später!' },
    ],
  },
  {
    id: 'hoeflichkeit',
    titel: 'Höflichkeit',
    emoji: '🙏',
    beschreibung: 'Bitte, danke und Entschuldigung',
    ziele: [
      'Höflich bitten und danken',
      'Dich entschuldigen',
      'Auf ein Danke richtig antworten',
    ],
    items: [
      { es: 'por favor', de: 'bitte', beispielEs: 'La cuenta, por favor.', beispielDe: 'Die Rechnung, bitte.' },
      { es: 'gracias', de: 'danke', beispielEs: 'Muchas gracias por todo.', beispielDe: 'Vielen Dank für alles.' },
      { es: 'de nada', de: 'gern geschehen', beispielEs: '—¡Gracias! —De nada.', beispielDe: '„Danke!“ – „Gern geschehen.“' },
      { es: 'perdón', de: 'Entschuldigung', beispielEs: 'Perdón, ¿dónde está el metro?', beispielDe: 'Entschuldigung, wo ist die U-Bahn?' },
      { es: 'lo siento', de: 'es tut mir leid', beispielEs: 'Lo siento, llego tarde.', beispielDe: 'Es tut mir leid, ich komme zu spät.' },
    ],
    wissen: [
      {
        emoji: '🙏',
        titel: 'perdón oder lo siento?',
        text: '*Perdón* benutzt du zum Ansprechen und für kleine Versehen. *Lo siento* ist das echte Bedauern („es tut mir leid“).',
      },
      {
        emoji: '🔁',
        titel: 'Das Antwort-Duo',
        text: 'Auf *gracias* antwortet man fast immer mit *de nada* – merk dir beide als Paar.',
      },
    ],
    dialog: [
      { sprecher: 'Tourist', es: 'Perdón, ¿dónde está el museo?', de: 'Entschuldigung, wo ist das Museum?' },
      { sprecher: 'Frau', es: 'Está allí, a la derecha.', de: 'Es ist dort, rechts.' },
      { sprecher: 'Tourist', es: '¡Muchas gracias!', de: 'Vielen Dank!' },
      { sprecher: 'Frau', es: 'De nada. ¡Buen día!', de: 'Gern geschehen. Schönen Tag!' },
    ],
  },
  {
    id: 'essen',
    titel: 'Essen & Trinken',
    emoji: '🥘',
    beschreibung: 'Im Café und Restaurant bestellen',
    ziele: [
      'Getränke und Essen benennen',
      'Im Restaurant bestellen',
      'Die Rechnung verlangen',
    ],
    items: [
      { es: 'el agua', de: 'das Wasser', beispielEs: 'Un agua sin gas, por favor.', beispielDe: 'Ein stilles Wasser, bitte.' },
      { es: 'el café', de: 'der Kaffee', beispielEs: 'El café está muy bueno.', beispielDe: 'Der Kaffee ist sehr gut.' },
      { es: 'el pan', de: 'das Brot', beispielEs: 'El pan está fresco.', beispielDe: 'Das Brot ist frisch.' },
      { es: 'la cerveza', de: 'das Bier', beispielEs: 'Una cerveza fría, por favor.', beispielDe: 'Ein kaltes Bier, bitte.' },
      { es: 'la cuenta', de: 'die Rechnung', beispielEs: 'La cuenta, por favor.', beispielDe: 'Die Rechnung, bitte.' },
    ],
    wissen: [
      {
        emoji: '🚻',
        titel: 'el oder la?',
        text: 'Spanische Wörter sind männlich oder weiblich: *el café*, aber *la cerveza*. Lern den Artikel am besten gleich mit!',
      },
      {
        emoji: '🧾',
        titel: 'Zahlen, bitte!',
        text: '*La cuenta, por favor* – und schon kommt die Rechnung. Funktioniert in jedem Restaurant der spanischsprachigen Welt.',
      },
    ],
    dialog: [
      { sprecher: 'Kellnerin', es: '¿Qué desean tomar?', de: 'Was möchten Sie trinken?' },
      { sprecher: 'Gast', es: 'Una cerveza y un agua, por favor.', de: 'Ein Bier und ein Wasser, bitte.' },
      { sprecher: 'Kellnerin', es: '¿Algo más? ¿Pan?', de: 'Noch etwas? Brot?' },
      { sprecher: 'Gast', es: 'No, gracias. La cuenta, por favor.', de: 'Nein, danke. Die Rechnung, bitte.' },
    ],
  },
  {
    id: 'unterwegs',
    titel: 'Unterwegs',
    emoji: '🧭',
    beschreibung: 'Nach dem Weg fragen',
    ziele: [
      'Nach Orten fragen',
      'Richtungsangaben verstehen',
      'Dich in der Stadt zurechtfinden',
    ],
    items: [
      { es: '¿dónde está…?', de: 'wo ist…?', beispielEs: '¿Dónde está la playa?', beispielDe: 'Wo ist der Strand?' },
      { es: 'el baño', de: 'die Toilette', beispielEs: 'Perdón, ¿dónde está el baño?', beispielDe: 'Entschuldigung, wo ist die Toilette?' },
      { es: 'la playa', de: 'der Strand', beispielEs: 'La playa está cerca.', beispielDe: 'Der Strand ist in der Nähe.' },
      { es: 'izquierda', de: 'links', beispielEs: 'A la izquierda está el hotel.', beispielDe: 'Links ist das Hotel.' },
      { es: 'derecha', de: 'rechts', beispielEs: 'El museo está a la derecha.', beispielDe: 'Das Museum ist rechts.' },
    ],
    wissen: [
      {
        emoji: '🧭',
        titel: 'Die Zauberfrage',
        text: '*¿Dónde está…?* öffnet dir jede Tür – ob Toilette, Strand oder Museum. *Está* heißt „ist“ bei Orten.',
      },
      {
        emoji: '↔️',
        titel: 'Richtung mit „a la“',
        text: 'Richtungen sagt man mit a la: *a la izquierda* (nach links), *a la derecha* (nach rechts).',
      },
    ],
    dialog: [
      { sprecher: 'Tourist', es: 'Perdón, ¿dónde está la playa?', de: 'Entschuldigung, wo ist der Strand?' },
      { sprecher: 'Mann', es: 'Todo recto y a la izquierda.', de: 'Immer geradeaus und dann links.' },
      { sprecher: 'Tourist', es: '¿Está cerca?', de: 'Ist er in der Nähe?' },
      { sprecher: 'Mann', es: 'Sí, cinco minutos. ¡Buen día!', de: 'Ja, fünf Minuten. Schönen Tag!' },
    ],
  },
]

// Die Module der Sprach-Reise: Jedes Modul bündelt Lektionen zu einem Thema.
// "kommtBald"-Module zeigen, wohin die Reise geht (noch ohne Inhalt).
export const MODULE = [
  {
    id: 'm1',
    titel: 'Erste Schritte',
    emoji: '🌱',
    beschreibung: 'Begrüßen und dich vorstellen',
    lektionen: ['begruessung', 'vorstellen'],
  },
  {
    id: 'm2',
    titel: 'Im Alltag',
    emoji: '☕',
    beschreibung: 'Zahlen, Höflichkeit und Small Talk',
    lektionen: ['zahlen', 'hoeflichkeit'],
  },
  {
    id: 'm3',
    titel: 'Unterwegs',
    emoji: '🌍',
    beschreibung: 'Restaurant, Stadt und Reisen',
    lektionen: ['essen', 'unterwegs'],
  },
  {
    id: 'm4',
    titel: 'Familie & Freunde',
    emoji: '👨‍👩‍👧',
    beschreibung: 'Über dein Leben erzählen',
    lektionen: [],
    kommtBald: true,
  },
  {
    id: 'm5',
    titel: 'Vergangenheit erzählen',
    emoji: '⏳',
    beschreibung: 'Was gestern passiert ist',
    lektionen: [],
    kommtBald: true,
  },
]

// Hilfen rund um Module und Fortschritt
export function lektionenVon(modul) {
  return modul.lektionen.map((id) => LEKTIONEN.find((l) => l.id === id))
}

export function modulFortschritt(modul, lessonProgress) {
  const fertig = modul.lektionen.filter((id) => lessonProgress[id]?.fertig).length
  return { fertig, gesamt: modul.lektionen.length }
}

// Ein Modul ist offen, wenn das vorherige komplett geschafft ist
// Auf true setzen, um beim Entwickeln alle Module und Lektionen
// sofort öffnen zu können (ohne sie der Reihe nach abzuschließen).
export const ALLES_OFFEN = true

export function modulOffen(index, lessonProgress) {
  if (MODULE[index].kommtBald) return false
  if (ALLES_OFFEN) return true
  if (index === 0) return true
  const vorher = MODULE[index - 1]
  if (vorher.kommtBald) return false
  return modulFortschritt(vorher, lessonProgress).fertig === vorher.lektionen.length
}

// Mischt eine Liste zufällig durch (Fisher-Yates-Verfahren)
export function mischen(liste) {
  const copy = [...liste]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// Das "Kernwort" eines Eintrags: ohne Satzzeichen wie ¿? ¡! und …
function kernwort(es) {
  return es.replace(/[¿¡?!….]/g, '').trim()
}

// Baut aus einem Beispielsatz eine Lücken-Übung: das gelernte Wort
// wird im Satz durch ___ ersetzt. Klappt das nicht, gibt es keine Lücke.
export function baueLuecke(item) {
  const kern = kernwort(item.es)
  const regex = new RegExp(kern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
  const treffer = item.beispielEs.match(regex)
  if (!treffer) return null
  return { satz: item.beispielEs.replace(regex, '_____'), loesung: treffer[0] }
}

// Baut den geführten Ablauf einer Lektion:
// Einleitung → Wörter → Gut zu wissen → Dialog → Auswahl-Übungen → Lücken-Übungen
export function baueSchritte(lektion) {
  const schritte = [{ typ: 'intro' }]
  for (const item of lektion.items) schritte.push({ typ: 'lernen', item })
  if (lektion.wissen) schritte.push({ typ: 'info' })
  if (lektion.dialog) schritte.push({ typ: 'dialog' })
  mischen(lektion.items).forEach((item, i) =>
    schritte.push({ typ: 'quiz', item, richtung: i % 2 === 0 ? 'es-de' : 'de-es' })
  )
  for (const item of mischen(lektion.items).slice(0, 3)) {
    const luecke = baueLuecke(item)
    if (luecke) schritte.push({ typ: 'luecke', item, luecke })
  }
  return schritte
}

// Baut die vier Antwort-Möglichkeiten für eine Übung (richtige + drei falsche)
export function baueOptionen(schritt, lektion) {
  if (schritt.typ === 'luecke') {
    const falsche = mischen(
      lektion.items.filter((i) => i !== schritt.item).map((i) => kernwort(i.es))
    ).slice(0, 3)
    return mischen([schritt.luecke.loesung, ...falsche])
  }
  const feld = schritt.richtung === 'es-de' ? 'de' : 'es'
  const richtig = schritt.item[feld]
  const falsche = mischen(
    lektion.items.filter((i) => i !== schritt.item).map((i) => i[feld])
  ).slice(0, 3)
  return mischen([richtig, ...falsche])
}

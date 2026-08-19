// ============================================================
//  Das Lektions-Schema
// ============================================================
// Jede Lektion folgt derselben Struktur. Die Pflichtfelder tragen
// den Inhalt, die Kursfelder halten die 150 Lektionen als
// zusammenhängenden Kurs zusammen statt als lose Sammlung.
//
//  PFLICHT
//    id            eindeutige Kennung, wird nie wieder geändert
//    titel         Anzeigename
//    emoji         Symbol auf der Landkarte
//    beschreibung  ein Satz, was man danach kann
//    ziele[]       2–4 konkrete Lernziele
//    items[]       8–15 Wörter mit Beispielsatz auf ES und DE
//    wissen[]      Kultur- und Grammatikkarten
//    dialog[]      Gespräch mit festen Sprechern
//
//  KURS (neu, für den 150-Lektionen-Aufbau)
//    niveau        A1.1 … B2.1, Einstufung nach GER
//    grammatik[]   HÖCHSTENS EIN neuer Schwerpunkt je Lektion
//    wiederholt[]  3–5 IDs früherer Lektionen, die mitlaufen
//    vorher[]      Lektionen, die man vorher gemacht haben sollte
//    kulturnotiz   ein Satz Landeskunde
//
// Warum "wiederholt" Pflicht ist: 150 Lektionen ohne Rückgriff
// wären 150 isolierte Artikel. Erst der Rückgriff macht daraus
// einen Kurs.

// Die Grundlagen-Lektionen (wie bei Babbel) mit geführtem Aufbau:
// Einleitung (Lernziele) → neue Wörter mit Beispielsätzen → "Gut zu wissen"
// → Dialog zum Mitlesen → Übungen (Auswahl + Lückentext) → Abschluss.
// Neue Lektionen hinzufügen = einfach einen Eintrag ergänzen!

export const LEKTIONEN = [
  {
    id: 'begruessung',
    // Kursfelder: Lektion 5 im 150er-Aufbau
    niveau: 'A1.1',
    kursNr: 5,
    grammatik: ['Register: du oder Sie'],
    wiederholt: [],
    vorher: [],
    kulturnotiz: 'In Spanien begrüßt man sich unter Freunden mit zwei Wangenküssen, rechts beginnend.',
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
    // Kursfelder: Lektion 6 im 150er-Aufbau
    niveau: 'A1.1',
    kursNr: 6,
    grammatik: ['llamarse und ser in der ersten Person'],
    wiederholt: ['begruessung'],
    vorher: ['begruessung'],
    kulturnotiz: 'Spanier tragen zwei Nachnamen: den des Vaters und den der Mutter.',
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
    // Kursfelder: Lektion 11 im 150er-Aufbau
    niveau: 'A1.1',
    kursNr: 11,
    grammatik: ['uno wird un vor männlichen Substantiven'],
    wiederholt: ['alphabet', 'vorstellen'],
    vorher: ['alphabet'],
    kulturnotiz: 'Preise werden in Spanien mit Komma geschrieben: 5,20 € heißt „cinco con veinte“.',
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
    // Kursfelder: Lektion 5 im 150er-Aufbau
    niveau: 'A1.1',
    kursNr: 24,
    grammatik: ['por favor, gracias und die Antwortformeln'],
    wiederholt: ['begruessung', 'vorstellen'],
    vorher: ['begruessung'],
    kulturnotiz: '„Perdón“ entschuldigt eine Störung, „lo siento“ drückt echtes Bedauern aus.',
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
    // Kursfelder: Lektion 32 im 150er-Aufbau
    niveau: 'A1.2',
    kursNr: 32,
    grammatik: ['el oder la: das Geschlecht der Substantive'],
    wiederholt: ['zahlen', 'hoeflichkeit', 'begruessung'],
    vorher: ['hoeflichkeit'],
    kulturnotiz: 'Die Hauptmahlzeit ist in Spanien das Mittagessen zwischen 14 und 16 Uhr.',
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
    // Kursfelder: Lektion 66 im 150er-Aufbau
    niveau: 'A2.1',
    kursNr: 66,
    grammatik: ['Richtungsangaben mit a la und Ortspräpositionen'],
    wiederholt: ['hoeflichkeit', 'zahlen', 'essen'],
    vorher: ['hoeflichkeit'],
    kulturnotiz: 'In spanischen Städten heißt die zentrale Platzanlage fast immer Plaza Mayor.',
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

  // ============ NEU: Gebiet "Erste Schritte" vervollständigen ============
  {
    id: 'woher',
    // Kursfelder: Lektion 12 im 150er-Aufbau
    niveau: 'A1.1',
    kursNr: 12,
    grammatik: ['ser de für Herkunft, Nationalitätsadjektive'],
    wiederholt: ['vorstellen', 'begruessung'],
    vorher: ['vorstellen'],
    kulturnotiz: 'Spanisch ist in 21 Ländern Amtssprache – nach Mandarin die zweitmeistgesprochene Muttersprache der Welt.',
    titel: 'Woher kommst du?',
    emoji: '🌍',
    beschreibung: 'Über Herkunft und Sprachen sprechen',
    ziele: [
      'Sagen, woher du kommst und wo du wohnst',
      'Nach der Herkunft fragen',
      'Über Sprachen sprechen, die du sprichst',
    ],
    items: [
      { es: 'ser de', de: 'kommen aus / sein aus', beispielEs: 'Soy de Alemania.', beispielDe: 'Ich komme aus Deutschland.' },
      { es: '¿De dónde eres?', de: 'Woher kommst du?', beispielEs: '¿De dónde eres, Marta?', beispielDe: 'Woher kommst du, Marta?' },
      { es: 'vivir en', de: 'wohnen in', beispielEs: 'Vivo en Berlín.', beispielDe: 'Ich wohne in Berlin.' },
      { es: 'Alemania', de: 'Deutschland', beispielEs: 'Alemania está en Europa.', beispielDe: 'Deutschland liegt in Europa.' },
      { es: 'alemán / alemana', de: 'deutsch (m/w)', beispielEs: 'Ella es alemana.', beispielDe: 'Sie ist Deutsche.' },
      { es: 'España', de: 'Spanien', beispielEs: 'España es preciosa.', beispielDe: 'Spanien ist wunderschön.' },
      { es: 'hablar', de: 'sprechen', beispielEs: 'Hablo un poco de español.', beispielDe: 'Ich spreche ein bisschen Spanisch.' },
      { es: 'el idioma', de: 'die Sprache', beispielEs: 'El español es un idioma bonito.', beispielDe: 'Spanisch ist eine schöne Sprache.' },
      { es: 'un poco', de: 'ein bisschen', beispielEs: 'Solo un poco, por favor.', beispielDe: 'Nur ein bisschen, bitte.' },
      { es: 'también', de: 'auch', beispielEs: 'Yo también soy de Múnich.', beispielDe: 'Ich bin auch aus München.' },
    ],
    wissen: [
      {
        emoji: '🧭',
        titel: 'ser de – die Herkunftsformel',
        text: 'Herkunft geht immer mit *ser*: *Soy de Alemania* (Ich bin aus Deutschland). Wo du gerade wohnst, sagst du mit *vivir en*: *Vivo en Madrid*.',
      },
      {
        emoji: '🚻',
        titel: 'alemán oder alemana?',
        text: 'Nationalitäten richten sich nach der Person: ein Mann ist *alemán*, eine Frau *alemana*. Und anders als im Deutschen schreibt man sie klein.',
      },
      {
        emoji: '💬',
        titel: 'Der Satz, der Türen öffnet',
        text: '*Hablo un poco de español* – ein bisschen Spanisch zu sprechen und es zuzugeben, macht jedes Gespräch freundlicher. Fast immer kommt zurück: *¡Muy bien!*',
      },
    ],
    dialog: [
      { sprecher: 'Marta', es: 'Hola, ¿de dónde eres?', de: 'Hallo, woher kommst du?' },
      { sprecher: 'Tom', es: 'Soy de Alemania, de Múnich. ¿Y tú?', de: 'Ich bin aus Deutschland, aus München. Und du?' },
      { sprecher: 'Marta', es: 'Soy de Sevilla, pero vivo en Madrid.', de: 'Ich bin aus Sevilla, aber ich wohne in Madrid.' },
      { sprecher: 'Tom', es: 'Hablo un poco de español.', de: 'Ich spreche ein bisschen Spanisch.' },
      { sprecher: 'Marta', es: '¡Muy bien! Yo también hablo un poco de alemán.', de: 'Sehr gut! Ich spreche auch ein bisschen Deutsch.' },
      { sprecher: 'Tom', es: '¡Perfecto, entonces nos ayudamos!', de: 'Perfekt, dann helfen wir uns!' },
    ],
  },
  {
    id: 'alphabet',
    // Kursfelder: Lektion 2 im 150er-Aufbau
    niveau: 'A1.1',
    kursNr: 2,
    grammatik: ['Aussprache und Betonung'],
    wiederholt: [],
    vorher: [],
    kulturnotiz: 'Das ñ hat einen eigenen Platz im Alphabet – es entstand aus einem doppelten n im Mittelalter.',
    titel: 'Das Alphabet & Aussprache',
    emoji: '🔤',
    beschreibung: 'Buchstabieren und richtig klingen',
    ziele: [
      'Deinen Namen buchstabieren',
      'Die spanischen Sonderlaute kennen',
      'Wörter beim ersten Lesen richtig aussprechen',
    ],
    items: [
      { es: 'la letra', de: 'der Buchstabe', beispielEs: 'La eñe es una letra española.', beispielDe: 'Das Ñ ist ein spanischer Buchstabe.' },
      { es: 'deletrear', de: 'buchstabieren', beispielEs: '¿Puedes deletrear tu nombre?', beispielDe: 'Kannst du deinen Namen buchstabieren?' },
      { es: 'la eñe (ñ)', de: 'das Ñ', beispielEs: 'España se escribe con eñe.', beispielDe: 'España schreibt man mit Ñ.' },
      { es: 'la elle (ll)', de: 'das Doppel-L', beispielEs: 'Me llamo Guillermo.', beispielDe: 'Ich heiße Guillermo.' },
      { es: '¿Cómo se escribe?', de: 'Wie schreibt man das?', beispielEs: '¿Cómo se escribe tu apellido?', beispielDe: 'Wie schreibt man deinen Nachnamen?' },
      { es: '¿Cómo se pronuncia?', de: 'Wie spricht man das aus?', beispielEs: '¿Cómo se pronuncia esta palabra?', beispielDe: 'Wie spricht man dieses Wort aus?' },
      { es: 'despacio', de: 'langsam', beispielEs: 'Más despacio, por favor.', beispielDe: 'Langsamer, bitte.' },
      { es: 'repetir', de: 'wiederholen', beispielEs: '¿Puedes repetir, por favor?', beispielDe: 'Kannst du das bitte wiederholen?' },
      { es: 'la palabra', de: 'das Wort', beispielEs: 'Es una palabra nueva para mí.', beispielDe: 'Das ist ein neues Wort für mich.' },
      { es: 'el nombre', de: 'der Name', beispielEs: 'Mi nombre es difícil de deletrear.', beispielDe: 'Mein Name ist schwer zu buchstabieren.' },
    ],
    wissen: [
      {
        emoji: '👂',
        titel: 'Spanisch liest man, wie man es schreibt',
        text: 'Die beste Nachricht zuerst: Im Spanischen klingt fast jeder Buchstabe immer gleich. Wer die Regeln einmal kennt, kann JEDES Wort richtig vorlesen.',
      },
      {
        emoji: '🤫',
        titel: 'Das stumme H',
        text: 'Das *h* wird nie gesprochen: *hola* klingt wie „ola". Das *j* dagegen klingt wie ein deutsches „ch" in „Bach": *Juan* = „Chuan".',
      },
      {
        emoji: '🌊',
        titel: 'll wie „j"',
        text: '*ll* spricht man wie ein deutsches „j": *Me llamo* klingt wie „Me jamo". Und das *ñ* ist ein „nj" wie in „Kognak": *España* = „Espanja".',
      },
    ],
    dialog: [
      { sprecher: 'Empleada', es: 'Buenos días. ¿Su nombre, por favor?', de: 'Guten Morgen. Ihr Name, bitte?' },
      { sprecher: 'Jan', es: 'Jan Weber. ¿Se lo deletreo?', de: 'Jan Weber. Soll ich ihn buchstabieren?' },
      { sprecher: 'Empleada', es: 'Sí, por favor, despacio.', de: 'Ja bitte, langsam.' },
      { sprecher: 'Jan', es: 'Jota, a, ene. Uve doble, e, be, e, erre.', de: 'J, A, N. W, E, B, E, R.' },
      { sprecher: 'Empleada', es: 'Perfecto, ya lo tengo.', de: 'Perfekt, ich habe es.' },
      { sprecher: 'Jan', es: 'El español se escribe como suena, ¡qué fácil!', de: 'Spanisch schreibt man, wie es klingt – wie einfach!' },
    ],
  },

  // ============ NEU: Gebiet "Im Alltag" vervollständigen ============
  {
    id: 'cafe',
    // Kursfelder: Lektion 36 im 150er-Aufbau
    niveau: 'A1.2',
    kursNr: 36,
    grammatik: ['Bestellformeln: para mí, quisiera'],
    wiederholt: ['zahlen', 'hoeflichkeit', 'begruessung'],
    vorher: ['zahlen', 'hoeflichkeit'],
    kulturnotiz: 'Trinkgeld ist in Spanien freiwillig – Aufrunden genügt, niemand erwartet Prozente.',
    titel: 'Im Café bestellen',
    emoji: '☕',
    beschreibung: 'Getränke, Tapas und bezahlen',
    ziele: [
      'Getränke und Kleinigkeiten bestellen',
      'Nach der Rechnung fragen',
      'Verstehen, was der Kellner zurückfragt',
    ],
    items: [
      { es: 'el café solo', de: 'der Espresso', beispielEs: 'Un café solo, por favor.', beispielDe: 'Einen Espresso, bitte.' },
      { es: 'el café con leche', de: 'der Milchkaffee', beispielEs: 'Para mí, un café con leche.', beispielDe: 'Für mich einen Milchkaffee.' },
      { es: 'el zumo de naranja', de: 'der Orangensaft', beispielEs: 'Un zumo de naranja natural.', beispielDe: 'Einen frisch gepressten Orangensaft.' },
      { es: 'el agua sin gas', de: 'stilles Wasser', beispielEs: 'Un agua sin gas, por favor.', beispielDe: 'Ein stilles Wasser, bitte.' },
      { es: 'la tostada', de: 'das Röstbrot', beispielEs: 'Una tostada con tomate.', beispielDe: 'Ein Röstbrot mit Tomate.' },
      { es: 'los churros', de: 'die Churros', beispielEs: 'Churros con chocolate, ¡qué ricos!', beispielDe: 'Churros mit Schokolade, wie lecker!' },
      { es: 'para mí', de: 'für mich', beispielEs: 'Para mí, lo mismo.', beispielDe: 'Für mich das Gleiche.' },
      { es: '¿Algo más?', de: 'Noch etwas?', beispielEs: '¿Algo más? – No, gracias.', beispielDe: 'Noch etwas? – Nein, danke.' },
      { es: 'la cuenta', de: 'die Rechnung', beispielEs: 'La cuenta, por favor.', beispielDe: 'Die Rechnung, bitte.' },
      { es: '¿Cuánto es?', de: 'Wie viel macht das?', beispielEs: '¿Cuánto es todo?', beispielDe: 'Wie viel macht alles zusammen?' },
      { es: 'la propina', de: 'das Trinkgeld', beispielEs: 'Dejamos una pequeña propina.', beispielDe: 'Wir lassen ein kleines Trinkgeld da.' },
      { es: 'para llevar', de: 'zum Mitnehmen', beispielEs: '¿Para tomar aquí o para llevar?', beispielDe: 'Zum Hieressen oder zum Mitnehmen?' },
    ],
    wissen: [
      {
        emoji: '☕',
        titel: 'café solo, nicht café negro',
        text: 'Schwarzer Kaffee heißt *café solo* – „Kaffee allein". Ein *cortado* ist ein Espresso mit einem Schuss Milch, der Liebling der Spanier nach dem Essen.',
      },
      {
        emoji: '🍅',
        titel: 'Das andalusische Frühstück',
        text: '*Tostada con tomate* – Röstbrot mit geriebener Tomate und Olivenöl – ist DAS Frühstück im Süden Spaniens. Kostet selten mehr als 2,50 €.',
      },
      {
        emoji: '💶',
        titel: 'Trinkgeld ist entspannt',
        text: 'In Spanien wird kein Prozentsatz erwartet. Kleingeld liegen lassen oder aufrunden reicht – niemand schaut komisch, wenn du gar nichts gibst.',
      },
    ],
    dialog: [
      { sprecher: 'Camarero', es: 'Buenos días, ¿qué le pongo?', de: 'Guten Morgen, was darf ich Ihnen bringen?' },
      { sprecher: 'Lisa', es: 'Un café con leche y una tostada con tomate.', de: 'Einen Milchkaffee und ein Röstbrot mit Tomate.' },
      { sprecher: 'Camarero', es: '¿Algo más?', de: 'Noch etwas?' },
      { sprecher: 'Lisa', es: 'Sí, un zumo de naranja. ¿Es natural?', de: 'Ja, einen Orangensaft. Ist er frisch gepresst?' },
      { sprecher: 'Camarero', es: 'Claro, aquí lo exprimimos al momento.', de: 'Natürlich, wir pressen ihn frisch.' },
      { sprecher: 'Lisa', es: 'Perfecto. ¿Cuánto es todo?', de: 'Perfekt. Wie viel macht alles?' },
      { sprecher: 'Camarero', es: 'Son cinco con veinte.', de: 'Das macht fünf Euro zwanzig.' },
    ],
  },
  {
    id: 'einkaufen',
    // Kursfelder: Lektion 39 im 150er-Aufbau
    niveau: 'A1.2',
    kursNr: 39,
    grammatik: ['Mengenangaben mit de'],
    wiederholt: ['zahlen', 'cafe', 'hoeflichkeit'],
    vorher: ['zahlen'],
    kulturnotiz: 'In fast jeder spanischen Stadt gibt es eine Markthalle, den mercado – dort bestellt man laut über die Theke.',
    titel: 'Einkaufen gehen',
    emoji: '🛒',
    beschreibung: 'Mengen, Preise und „Haben Sie…?"',
    ziele: [
      'Nach Produkten und Preisen fragen',
      'Mengen angeben (ein Kilo, 200 Gramm…)',
      'Auf dem Markt und im Laden zurechtkommen',
    ],
    items: [
      { es: 'comprar', de: 'kaufen', beispielEs: 'Quiero comprar fruta fresca.', beispielDe: 'Ich möchte frisches Obst kaufen.' },
      { es: '¿Tiene…?', de: 'Haben Sie…?', beispielEs: '¿Tiene pan integral?', beispielDe: 'Haben Sie Vollkornbrot?' },
      { es: 'un kilo de', de: 'ein Kilo', beispielEs: 'Un kilo de tomates, por favor.', beispielDe: 'Ein Kilo Tomaten, bitte.' },
      { es: 'medio kilo', de: 'ein halbes Kilo', beispielEs: 'Medio kilo de fresas.', beispielDe: 'Ein halbes Kilo Erdbeeren.' },
      { es: 'doscientos gramos', de: '200 Gramm', beispielEs: 'Doscientos gramos de jamón.', beispielDe: '200 Gramm Schinken.' },
      { es: '¿Cuánto cuesta?', de: 'Was kostet das?', beispielEs: '¿Cuánto cuesta el queso?', beispielDe: 'Was kostet der Käse?' },
      { es: 'barato / caro', de: 'billig / teuer', beispielEs: 'Este mercado es muy barato.', beispielDe: 'Dieser Markt ist sehr günstig.' },
      { es: 'fresco', de: 'frisch', beispielEs: 'El pescado está muy fresco.', beispielDe: 'Der Fisch ist sehr frisch.' },
      { es: 'la bolsa', de: 'die Tüte', beispielEs: '¿Quiere una bolsa?', beispielDe: 'Möchten Sie eine Tüte?' },
      { es: 'nada más', de: 'sonst nichts', beispielEs: 'Nada más, gracias.', beispielDe: 'Sonst nichts, danke.' },
    ],
    wissen: [
      {
        emoji: '🥕',
        titel: 'Der Mercado ist ein Erlebnis',
        text: 'In fast jeder spanischen Stadt gibt es eine Markthalle. Dort bestellt man laut über die Theke – trau dich, genau dafür hast du diese Lektion.',
      },
      {
        emoji: '⚖️',
        titel: 'Mengen brauchen „de"',
        text: 'Mengenangaben brauchen *de*: *un kilo DE tomates*, *un litro DE leche*. Das kleine Wort wegzulassen ist DER Anfängerfehler – jetzt nicht mehr deiner.',
      },
      {
        emoji: '👉',
        titel: 'Zeigen ist erlaubt',
        text: 'Weißt du ein Wort nicht? *¿Me pone esto?* („Geben Sie mir das?") plus Fingerzeig funktioniert auf jedem Markt der Welt.',
      },
    ],
    dialog: [
      { sprecher: 'Vendedora', es: '¡Buenas! ¿Qué le pongo?', de: 'Hallo! Was darf es sein?' },
      { sprecher: 'Nico', es: 'Un kilo de tomates y medio kilo de fresas.', de: 'Ein Kilo Tomaten und ein halbes Kilo Erdbeeren.' },
      { sprecher: 'Vendedora', es: 'Las fresas están muy frescas hoy. ¿Algo más?', de: 'Die Erdbeeren sind heute sehr frisch. Noch etwas?' },
      { sprecher: 'Nico', es: '¿Tiene queso manchego?', de: 'Haben Sie Manchego-Käse?' },
      { sprecher: 'Vendedora', es: 'Claro. ¿Cuánto le pongo?', de: 'Klar. Wie viel darf es sein?' },
      { sprecher: 'Nico', es: 'Doscientos gramos. ¿Cuánto es todo?', de: '200 Gramm. Wie viel macht alles?' },
      { sprecher: 'Vendedora', es: 'Son ocho euros. ¿Quiere una bolsa?', de: 'Acht Euro. Möchten Sie eine Tüte?' },
      { sprecher: 'Nico', es: 'No, gracias, traigo una. ¡Hasta luego!', de: 'Nein danke, ich habe eine dabei. Bis bald!' },
    ],
  },
  {
    id: 'wetter',
    // Kursfelder: Lektion 43 im 150er-Aufbau
    niveau: 'A1.2',
    kursNr: 43,
    grammatik: ['hacer für Wetterangaben'],
    wiederholt: ['zahlen', 'begruessung', 'woher'],
    vorher: ['zahlen'],
    kulturnotiz: '„¡Qué calor!“ ist der einfachste Gesprächseinstieg Spaniens – im Aufzug, an der Haltestelle, überall.',
    titel: 'Wetter & Small Talk',
    emoji: '🌤️',
    beschreibung: 'Plaudern über Wetter, Tage und Pläne',
    ziele: [
      'Über das Wetter sprechen',
      'Die Wochentage sicher benutzen',
      'Small Talk anfangen und beenden',
    ],
    items: [
      { es: 'hace sol', de: 'es ist sonnig', beispielEs: 'Hoy hace sol, ¡qué bien!', beispielDe: 'Heute ist es sonnig, wie schön!' },
      { es: 'hace calor', de: 'es ist heiß', beispielEs: 'En agosto hace mucho calor.', beispielDe: 'Im August ist es sehr heiß.' },
      { es: 'hace frío', de: 'es ist kalt', beispielEs: 'En enero hace frío en Madrid.', beispielDe: 'Im Januar ist es kalt in Madrid.' },
      { es: 'llueve', de: 'es regnet', beispielEs: 'En el norte llueve mucho.', beispielDe: 'Im Norden regnet es viel.' },
      { es: 'el fin de semana', de: 'das Wochenende', beispielEs: '¿Qué haces el fin de semana?', beispielDe: 'Was machst du am Wochenende?' },
      { es: 'el lunes', de: 'der Montag / am Montag', beispielEs: 'El lunes trabajo.', beispielDe: 'Am Montag arbeite ich.' },
      { es: 'hoy / mañana', de: 'heute / morgen', beispielEs: 'Hoy llueve, pero mañana hace sol.', beispielDe: 'Heute regnet es, aber morgen ist es sonnig.' },
      { es: '¿Qué planes tienes?', de: 'Was hast du vor?', beispielEs: '¿Qué planes tienes para hoy?', beispielDe: 'Was hast du heute vor?' },
      { es: 'ir a la playa', de: 'an den Strand gehen', beispielEs: 'Vamos a la playa el sábado.', beispielDe: 'Wir gehen am Samstag an den Strand.' },
      { es: 'quedar', de: 'sich verabreden', beispielEs: '¿Quedamos el domingo?', beispielDe: 'Treffen wir uns am Sonntag?' },
    ],
    wissen: [
      {
        emoji: '🌡️',
        titel: 'Das Wetter „macht" man',
        text: 'Spanisch benutzt *hacer* (machen): *hace sol*, *hace frío* – wörtlich „es macht Sonne". Nur der Regen hat ein eigenes Verb: *llueve*.',
      },
      {
        emoji: '📅',
        titel: 'el lunes = am Montag',
        text: 'Für „am Montag" reicht der Artikel: *el lunes*. Und *los lunes* heißt „montags, jeden Montag". Wochentage schreibt man übrigens klein.',
      },
      {
        emoji: '🗣️',
        titel: 'Wetter ist der Türöffner',
        text: 'Wie bei uns: *¡Qué calor!* („Was für eine Hitze!") ist der einfachste Gesprächseinstieg Spaniens – im Aufzug, an der Bushaltestelle, überall.',
      },
    ],
    dialog: [
      { sprecher: 'Vecina', es: '¡Qué calor hace hoy!', de: 'Was für eine Hitze heute!' },
      { sprecher: 'David', es: 'Sí, y mañana hace más. ¿Qué planes tienes?', de: 'Ja, und morgen wird es noch heißer. Was hast du vor?' },
      { sprecher: 'Vecina', es: 'El sábado vamos a la playa. ¿Vienes?', de: 'Am Samstag gehen wir an den Strand. Kommst du mit?' },
      { sprecher: 'David', es: '¡Claro! ¿Y si llueve?', de: 'Klar! Und wenn es regnet?' },
      { sprecher: 'Vecina', es: 'En agosto nunca llueve aquí.', de: 'Im August regnet es hier nie.' },
      { sprecher: 'David', es: 'Perfecto, ¡quedamos el sábado!', de: 'Perfekt, dann bis Samstag!' },
    ],
  },

  // ============ NEU: Aussprache-Fundament (Lektionen 3 und 4) ============
  {
    id: 'aussprache',
    // Kursfelder: Lektion 3 im 150er-Aufbau
    niveau: 'A1.1',
    kursNr: 3,
    grammatik: ['Die spanischen Sonderlaute'],
    wiederholt: ['alphabet'],
    vorher: ['alphabet'],
    kulturnotiz: 'In Spanien spricht man das c vor e und i wie das englische „th“ – in Lateinamerika wie ein s. Beides ist völlig korrekt.',
    titel: 'Spanische Aussprache',
    emoji: '🗣️',
    beschreibung: 'Die Laute, die es im Deutschen nicht gibt',
    ziele: [
      'Die spanischen Sonderlaute erkennen und aussprechen',
      'Das gerollte R üben',
      'Regionale Unterschiede heraushören',
    ],
    items: [
      { es: 'el trabajo', de: 'die Arbeit', beispielEs: 'Mi trabajo empieza a las nueve.', beispielDe: 'Meine Arbeit beginnt um neun.' },
      { es: 'el perro', de: 'der Hund', beispielEs: 'El perro corre por el parque.', beispielDe: 'Der Hund läuft durch den Park.' },
      { es: 'pero', de: 'aber', beispielEs: 'Quiero ir, pero no tengo tiempo.', beispielDe: 'Ich möchte gehen, aber ich habe keine Zeit.' },
      { es: 'la hora', de: 'die Stunde', beispielEs: '¿Qué hora es, por favor?', beispielDe: 'Wie spät ist es, bitte?' },
      { es: 'el coche', de: 'das Auto', beispielEs: 'Mi coche es pequeño y rojo.', beispielDe: 'Mein Auto ist klein und rot.' },
      { es: 'la plaza', de: 'der Platz', beispielEs: 'Nos vemos en la plaza mayor.', beispielDe: 'Wir sehen uns auf dem Hauptplatz.' },
      { es: 'la llave', de: 'der Schlüssel', beispielEs: 'No encuentro mi llave.', beispielDe: 'Ich finde meinen Schlüssel nicht.' },
      { es: 'el vino', de: 'der Wein', beispielEs: 'Un vino tinto, por favor.', beispielDe: 'Einen Rotwein, bitte.' },
      { es: 'la guitarra', de: 'die Gitarre', beispielEs: 'Toco la guitarra los domingos.', beispielDe: 'Ich spiele sonntags Gitarre.' },
      { es: 'mañana', de: 'morgen', beispielEs: 'Hasta mañana, Ana.', beispielDe: 'Bis morgen, Ana.' },
      { es: 'la gente', de: 'die Leute', beispielEs: 'Hay mucha gente en la calle.', beispielDe: 'Es sind viele Leute auf der Straße.' },
      { es: 'despacio', de: 'langsam', beispielEs: 'Más despacio, por favor.', beispielDe: 'Langsamer, bitte.' },
    ],
    wissen: [
      {
        emoji: '🎯',
        titel: 'Das gerollte R – der Trick',
        text: 'Ein *rr* ist ein gerolltes R: *perro* (Hund). Ein einfaches *r* zwischen Vokalen ist nur ein kurzer Schlag: *pero* (aber). Der Unterschied ändert die Bedeutung! Wer das Rollen nicht schafft: Zungenspitze locker hinter die oberen Schneidezähne und pusten.',
      },
      {
        emoji: '🤫',
        titel: 'j und g klingen wie „ch“ in Bach',
        text: 'Das *j* ist immer ein Rachenlaut: *trabajo* klingt wie „trabacho“. Vor *e* und *i* klingt auch das *g* so: *gente* wird „chente“, *gitarra* dagegen mit *u* geschrieben – *guitarra* – damit es hart bleibt.',
      },
      {
        emoji: '🌍',
        titel: 'b und v klingen gleich',
        text: 'Für spanische Ohren gibt es keinen Unterschied zwischen *b* und *v*: *vino* und *bino* klängen identisch. Deshalb fragen Spanier beim Buchstabieren oft „¿be o uve?“ – ist es ein B oder ein V?',
      },
    ],
    dialog: [
      { sprecher: 'Ana', es: 'Tom, repite: el perro corre.', de: 'Tom, wiederhole: Der Hund läuft.' },
      { sprecher: 'Tom', es: 'El pero corre… ¿está bien?', de: 'El pero corre … ist das richtig?' },
      { sprecher: 'Ana', es: 'Casi. Con dos erres: perro. Pero con una erre significa „aber“.', de: 'Fast. Mit zwei R: perro. Mit einem R heißt es „aber“.' },
      { sprecher: 'Tom', es: 'Ah, entonces trabajo también es difícil para mí.', de: 'Ah, dann ist trabajo auch schwer für mich.' },
      { sprecher: 'Ana', es: 'La jota suena como en alemán „Bach“. Trabajo.', de: 'Das J klingt wie im deutschen „Bach“. Trabajo.' },
      { sprecher: 'Tom', es: 'Trabajo. ¿Y la hache en hora?', de: 'Trabajo. Und das H in hora?' },
      { sprecher: 'Ana', es: 'La hache no suena nunca. Solo „ora“.', de: 'Das H klingt nie. Nur „ora“.' },
      { sprecher: 'Tom', es: 'Más despacio, por favor. ¡Pero me gusta!', de: 'Langsamer, bitte. Aber es gefällt mir!' },
    ],
  },
  {
    id: 'betonung',
    // Kursfelder: Lektion 4 im 150er-Aufbau
    niveau: 'A1.1',
    kursNr: 4,
    grammatik: ['Betonungsregeln und der schriftliche Akzent'],
    wiederholt: ['aussprache', 'alphabet'],
    vorher: ['aussprache'],
    kulturnotiz: 'Der Akzent ist keine Zierde: „papa“ ist der Papst oder die Kartoffel, „papá“ ist der Papa.',
    titel: 'Betonung & Akzente',
    emoji: '´',
    beschreibung: 'Warum ein Strich die Bedeutung ändert',
    ziele: [
      'Wörter ohne Akzent richtig betonen',
      'Verstehen, wann ein Akzent nötig ist',
      'Bedeutungsunterschiede wie tu und tú erkennen',
    ],
    items: [
      { es: 'la sílaba', de: 'die Silbe', beispielEs: 'Esta palabra tiene tres sílabas.', beispielDe: 'Dieses Wort hat drei Silben.' },
      { es: 'la palabra', de: 'das Wort', beispielEs: 'No conozco esta palabra.', beispielDe: 'Ich kenne dieses Wort nicht.' },
      { es: 'el acento', de: 'der Akzent', beispielEs: 'Café lleva acento en la e.', beispielDe: 'Café trägt einen Akzent auf dem E.' },
      { es: 'tú', de: 'du', beispielEs: '¿Y tú, de dónde eres?', beispielDe: 'Und du, woher kommst du?' },
      { es: 'tu', de: 'dein', beispielEs: '¿Cómo se llama tu hermana?', beispielDe: 'Wie heißt deine Schwester?' },
      { es: 'él', de: 'er', beispielEs: 'Él vive en Sevilla.', beispielDe: 'Er wohnt in Sevilla.' },
      { es: 'el', de: 'der', beispielEs: 'El libro está en la mesa.', beispielDe: 'Das Buch liegt auf dem Tisch.' },
      { es: 'sí', de: 'ja', beispielEs: 'Sí, claro que quiero.', beispielDe: 'Ja, natürlich möchte ich.' },
      { es: 'si', de: 'wenn', beispielEs: 'Si llueve, nos quedamos en casa.', beispielDe: 'Wenn es regnet, bleiben wir zu Hause.' },
      { es: 'el examen', de: 'die Prüfung', beispielEs: 'El examen es el jueves.', beispielDe: 'Die Prüfung ist am Donnerstag.' },
      { es: 'fácil', de: 'einfach', beispielEs: 'El español no es tan fácil.', beispielDe: 'Spanisch ist nicht so einfach.' },
      { es: 'difícil', de: 'schwierig', beispielEs: 'Esta palabra es difícil.', beispielDe: 'Dieses Wort ist schwierig.' },
    ],
    wissen: [
      {
        emoji: '📏',
        titel: 'Zwei Regeln decken fast alles ab',
        text: 'Endet ein Wort auf *Vokal*, *n* oder *s*, liegt die Betonung auf der vorletzten Silbe: *casa*, *examen*, *gracias*. Endet es auf einen anderen Konsonanten, auf der letzten: *hablar*, *feliz*, *ciudad*.',
      },
      {
        emoji: '❗',
        titel: 'Der Akzent markiert die Ausnahme',
        text: 'Ein geschriebener Akzent steht nur dort, wo die Betonung von der Regel abweicht: *café* endet auf einen Vokal, wird aber hinten betont – also Akzent. *fácil* endet auf Konsonant, wird aber vorne betont – also auch Akzent.',
      },
      {
        emoji: '🔀',
        titel: 'Der Akzent, der Wörter unterscheidet',
        text: 'Bei kurzen Wörtern trennt der Akzent die Bedeutung: *tú* (du) und *tu* (dein), *él* (er) und *el* (der), *sí* (ja) und *si* (wenn). Gesprochen klingt das gleich – geschrieben ist es ein anderes Wort.',
      },
    ],
    dialog: [
      { sprecher: 'Tom', es: 'Ana, ¿por qué café lleva acento?', de: 'Ana, warum trägt café einen Akzent?' },
      { sprecher: 'Ana', es: 'Porque no sigue la regla. Normalmente „cafe“ se diría CA-fe.', de: 'Weil es der Regel nicht folgt. Normalerweise würde man „cafe“ als CA-fe sprechen.' },
      { sprecher: 'Tom', es: 'Y con acento es ca-FÉ.', de: 'Und mit Akzent ist es ca-FÉ.' },
      { sprecher: 'Ana', es: 'Exacto. Mira: tu hermana y tú. ¿Ves la diferencia?', de: 'Genau. Schau: deine Schwester und du. Siehst du den Unterschied?' },
      { sprecher: 'Tom', es: 'Tu sin acento es „dein“, tú con acento es „du“.', de: 'Tu ohne Akzent ist „dein“, tú mit Akzent ist „du“.' },
      { sprecher: 'Ana', es: 'Muy bien. Un acento pequeño, una palabra distinta.', de: 'Sehr gut. Ein kleiner Akzent, ein anderes Wort.' },
      { sprecher: 'Tom', es: 'Entonces no es tan difícil, solo diferente.', de: 'Dann ist es nicht so schwierig, nur anders.' },
      { sprecher: 'Ana', es: 'Eso es. Y el español se lee como se escribe.', de: 'So ist es. Und Spanisch liest man, wie man es schreibt.' },
    ],
  },

  // ============ NEU: Grammatik-Fundament (Lektionen 7 bis 9) ============
  {
    id: 'pronomen',
    // Kursfelder: Lektion 7 im 150er-Aufbau
    niveau: 'A1.1',
    kursNr: 7,
    grammatik: ['Die Personalpronomen'],
    wiederholt: ['vorstellen', 'begruessung', 'alphabet'],
    vorher: ['vorstellen'],
    kulturnotiz: 'In Spanien duzt man fast alle – in Lateinamerika ist „usted“ deutlich häufiger, auch unter Erwachsenen.',
    titel: 'Ich, du, wir',
    emoji: '👥',
    beschreibung: 'Die Personalpronomen und wann man sie weglässt',
    ziele: [
      'Alle Personalpronomen kennen',
      'Verstehen, warum Spanier sie meist weglassen',
      'Zwischen tú und usted sicher wählen',
    ],
    items: [
      { es: 'yo', de: 'ich', beispielEs: 'Yo soy de Alemania, ¿y tú?', beispielDe: 'Ich bin aus Deutschland, und du?' },
      { es: 'tú', de: 'du', beispielEs: 'Tú hablas muy bien español.', beispielDe: 'Du sprichst sehr gut Spanisch.' },
      { es: 'él', de: 'er', beispielEs: 'Él trabaja en un hospital.', beispielDe: 'Er arbeitet in einem Krankenhaus.' },
      { es: 'ella', de: 'sie', beispielEs: 'Ella estudia medicina.', beispielDe: 'Sie studiert Medizin.' },
      { es: 'usted', de: 'Sie (höflich)', beispielEs: '¿Y usted, cómo se llama?', beispielDe: 'Und Sie, wie heißen Sie?' },
      { es: 'nosotros', de: 'wir', beispielEs: 'Nosotros vivimos en Madrid.', beispielDe: 'Wir wohnen in Madrid.' },
      { es: 'vosotros', de: 'ihr (Spanien)', beispielEs: '¿Vosotros venís mañana?', beispielDe: 'Kommt ihr morgen?' },
      { es: 'ustedes', de: 'Sie / ihr (Mehrzahl)', beispielEs: '¿Ustedes son de aquí?', beispielDe: 'Sind Sie von hier?' },
      { es: 'ellos', de: 'sie (Männer)', beispielEs: 'Ellos llegan por la tarde.', beispielDe: 'Sie kommen am Nachmittag an.' },
      { es: 'ellas', de: 'sie (Frauen)', beispielEs: 'Ellas trabajan juntas.', beispielDe: 'Sie arbeiten zusammen.' },
    ],
    wissen: [
      {
        emoji: '🫥',
        titel: 'Meistens lässt man sie weg',
        text: 'Die Verbendung verrät schon, wer gemeint ist: *hablo* kann nur „ich spreche“ heißen. Deshalb sagt man einfach *Hablo español* – nicht *Yo hablo español*. Das Pronomen setzt man nur, wenn man betont: *Yo soy de Alemania, ¿y tú?*',
      },
      {
        emoji: '🤝',
        titel: 'usted ist höflich – und dritte Person',
        text: '*usted* heißt „Sie“, wird aber wie *él/ella* gebeugt: *usted habla*, nicht *usted hablas*. Das verwirrt am Anfang, hat aber einen Grund: Es kommt von *vuestra merced* – „Euer Gnaden“.',
      },
      {
        emoji: '🌎',
        titel: 'vosotros gibt es nur in Spanien',
        text: 'In Spanien sagt man zu einer Gruppe von Freunden *vosotros*. In ganz Lateinamerika benutzt man dafür *ustedes* – egal ob förmlich oder locker. Beides verstehen, eins aktiv benutzen.',
      },
    ],
    dialog: [
      { sprecher: 'Ana', es: 'Tom, ¿tú trabajas o estudias?', de: 'Tom, arbeitest du oder studierst du?' },
      { sprecher: 'Tom', es: 'Estudio español. ¿Y ella? ¿Es tu hermana?', de: 'Ich lerne Spanisch. Und sie? Ist das deine Schwester?' },
      { sprecher: 'Ana', es: 'Sí, ella se llama Carmen. Nosotras vivimos juntas.', de: 'Ja, sie heißt Carmen. Wir wohnen zusammen.' },
      { sprecher: 'Tom', es: 'Perdón, ¿por qué dices „nosotras“ y no „nosotros“?', de: 'Entschuldigung, warum sagst du „nosotras“ und nicht „nosotros“?' },
      { sprecher: 'Ana', es: 'Porque somos dos mujeres. Con un hombre sería „nosotros“.', de: 'Weil wir zwei Frauen sind. Mit einem Mann wäre es „nosotros“.' },
      { sprecher: 'Tom', es: 'Entiendo. ¿Y a tu profesor le dices tú o usted?', de: 'Verstehe. Und zu deinem Lehrer sagst du du oder Sie?' },
      { sprecher: 'Ana', es: 'En España casi siempre tú. Usted es para situaciones muy formales.', de: 'In Spanien fast immer du. Sie ist für sehr formelle Situationen.' },
      { sprecher: 'Tom', es: '¡Qué bien! En alemán es más complicado.', de: 'Wie gut! Auf Deutsch ist es komplizierter.' },
    ],
  },
  {
    id: 'ser',
    // Kursfelder: Lektion 8 im 150er-Aufbau
    niveau: 'A1.1',
    kursNr: 8,
    grammatik: ['Das Verb ser im Präsens'],
    wiederholt: ['pronomen', 'vorstellen', 'betonung'],
    vorher: ['pronomen'],
    kulturnotiz: 'Berufe stehen nach ser ohne Artikel: „Soy profesora“ – nicht „soy una profesora“.',
    titel: 'Das Verb ser',
    emoji: '🪪',
    beschreibung: 'Sagen, wer und was jemand ist',
    ziele: [
      'ser vollständig konjugieren',
      'Beruf, Herkunft und Eigenschaften ausdrücken',
      'Verstehen, wofür ser wirklich zuständig ist',
    ],
    items: [
      { es: 'ser', de: 'sein', beispielEs: 'Ser profesor es un buen trabajo.', beispielDe: 'Lehrer zu sein ist ein guter Beruf.' },
      { es: 'soy', de: 'ich bin', beispielEs: 'Soy de Múnich.', beispielDe: 'Ich bin aus München.' },
      { es: 'eres', de: 'du bist', beispielEs: '¿Eres estudiante?', beispielDe: 'Bist du Student?' },
      { es: 'es', de: 'er/sie ist', beispielEs: 'Mi hermana es médica.', beispielDe: 'Meine Schwester ist Ärztin.' },
      { es: 'somos', de: 'wir sind', beispielEs: 'Somos cuatro en casa.', beispielDe: 'Wir sind vier zu Hause.' },
      { es: 'sois', de: 'ihr seid', beispielEs: '¿Sois de aquí?', beispielDe: 'Seid ihr von hier?' },
      { es: 'son', de: 'sie sind', beispielEs: 'Mis padres son profesores.', beispielDe: 'Meine Eltern sind Lehrer.' },
      { es: 'el estudiante', de: 'der Student', beispielEs: 'Soy estudiante de medicina.', beispielDe: 'Ich bin Medizinstudent.' },
      { es: 'el profesor', de: 'der Lehrer', beispielEs: 'Mi profesor es muy simpático.', beispielDe: 'Mein Lehrer ist sehr nett.' },
      { es: 'simpático', de: 'nett, sympathisch', beispielEs: 'Tu amiga es muy simpática.', beispielDe: 'Deine Freundin ist sehr nett.' },
      { es: 'alto', de: 'groß (Person)', beispielEs: 'Mi padre es muy alto.', beispielDe: 'Mein Vater ist sehr groß.' },
      { es: 'joven', de: 'jung', beispielEs: 'Ella es joven pero sabe mucho.', beispielDe: 'Sie ist jung, weiß aber viel.' },
    ],
    wissen: [
      {
        emoji: '🧾',
        titel: 'ser beantwortet: Wer oder was ist das?',
        text: '*ser* steht für alles, was jemanden ausmacht: Name, Herkunft, Beruf, Charakter, Aussehen, Material, Uhrzeit. *Soy Tom. Soy alemán. Soy estudiante. Es la una.* Lerne es nicht als „dauerhaft“ – sondern als Antwort auf „wer oder was?“.',
      },
      {
        emoji: '🚫',
        titel: 'Berufe ohne Artikel',
        text: 'Nach *ser* steht der Beruf nackt: *Soy profesor*, *Ella es médica*. Ein *un/una* kommt erst dazu, wenn ein Adjektiv folgt: *Es una médica excelente*.',
      },
      {
        emoji: '🔤',
        titel: 'Das Adjektiv passt sich an',
        text: 'Nach *ser* richtet sich das Adjektiv nach der Person: *Tom es alto*, *Ana es alta*, *ellos son altos*. Auf *-o* endende Adjektive wechseln zu *-a*; auf *-e* oder Konsonant endende bleiben gleich: *joven*, *jóvenes*.',
      },
    ],
    dialog: [
      { sprecher: 'Ana', es: 'Tom, este es Luis. Es mi compañero de piso.', de: 'Tom, das ist Luis. Er ist mein Mitbewohner.' },
      { sprecher: 'Luis', es: '¡Hola! ¿Eres el amigo alemán de Ana?', de: 'Hallo! Bist du Anas deutscher Freund?' },
      { sprecher: 'Tom', es: 'Sí, soy Tom. Soy de Múnich y soy estudiante.', de: 'Ja, ich bin Tom. Ich bin aus München und bin Student.' },
      { sprecher: 'Luis', es: 'Yo soy de Valencia. Somos casi vecinos en España.', de: 'Ich bin aus Valencia. Wir sind fast Nachbarn in Spanien.' },
      { sprecher: 'Ana', es: 'Luis es profesor de guitarra. Y es muy simpático.', de: 'Luis ist Gitarrenlehrer. Und er ist sehr nett.' },
      { sprecher: 'Tom', es: '¿Profesor? ¡Qué bien! ¿Y sois de la misma ciudad?', de: 'Lehrer? Wie schön! Und seid ihr aus derselben Stadt?' },
      { sprecher: 'Ana', es: 'No, yo soy de Madrid. Pero somos amigos desde hace años.', de: 'Nein, ich bin aus Madrid. Aber wir sind seit Jahren befreundet.' },
      { sprecher: 'Tom', es: 'Entonces ahora somos tres. ¡Perfecto!', de: 'Dann sind wir jetzt drei. Perfekt!' },
    ],
  },
  {
    id: 'artikel',
    // Kursfelder: Lektion 9 im 150er-Aufbau
    niveau: 'A1.1',
    kursNr: 9,
    grammatik: ['Bestimmte und unbestimmte Artikel'],
    wiederholt: ['ser', 'aussprache', 'vorstellen'],
    vorher: ['ser'],
    kulturnotiz: 'Wörter griechischen Ursprungs auf -ma sind männlich: el problema, el tema, el idioma – trotz der Endung auf -a.',
    titel: 'el, la, un, una',
    emoji: '🏷️',
    beschreibung: 'Jedes Substantiv hat ein Geschlecht',
    ziele: [
      'Bestimmte und unbestimmte Artikel unterscheiden',
      'Das Geschlecht an der Endung erkennen',
      'Die wichtigsten Ausnahmen kennen',
    ],
    items: [
      { es: 'el libro', de: 'das Buch', beispielEs: 'El libro está en la mesa.', beispielDe: 'Das Buch liegt auf dem Tisch.' },
      { es: 'la mesa', de: 'der Tisch', beispielEs: 'La mesa es de madera.', beispielDe: 'Der Tisch ist aus Holz.' },
      { es: 'un libro', de: 'ein Buch', beispielEs: 'Busco un libro en español.', beispielDe: 'Ich suche ein Buch auf Spanisch.' },
      { es: 'una mesa', de: 'ein Tisch', beispielEs: 'Necesitamos una mesa más grande.', beispielDe: 'Wir brauchen einen größeren Tisch.' },
      { es: 'la ventana', de: 'das Fenster', beispielEs: 'Abre la ventana, por favor.', beispielDe: 'Mach das Fenster auf, bitte.' },
      { es: 'el problema', de: 'das Problem', beispielEs: 'No hay ningún problema.', beispielDe: 'Es gibt kein Problem.' },
      { es: 'el idioma', de: 'die Sprache', beispielEs: 'El español es un idioma bonito.', beispielDe: 'Spanisch ist eine schöne Sprache.' },
      { es: 'la mano', de: 'die Hand', beispielEs: 'Dame la mano.', beispielDe: 'Gib mir die Hand.' },
      { es: 'el día', de: 'der Tag', beispielEs: 'Hoy es un día especial.', beispielDe: 'Heute ist ein besonderer Tag.' },
      { es: 'la ciudad', de: 'die Stadt', beispielEs: 'Madrid es una ciudad grande.', beispielDe: 'Madrid ist eine große Stadt.' },
      { es: 'la clase', de: 'der Unterricht', beispielEs: 'La clase empieza a las diez.', beispielDe: 'Der Unterricht beginnt um zehn.' },
      { es: 'el papel', de: 'das Papier', beispielEs: 'Necesito un papel y un boli.', beispielDe: 'Ich brauche ein Blatt Papier und einen Stift.' },
    ],
    wissen: [
      {
        emoji: '🧲',
        titel: 'Artikel und Substantiv gehören zusammen',
        text: 'Lerne nie *mesa*, sondern immer *la mesa*. Das Geschlecht lässt sich nicht ableiten – *la mesa* ist weiblich, obwohl „der Tisch“ im Deutschen männlich ist. Wer den Artikel mitlernt, muss ihn nie wieder raten.',
      },
      {
        emoji: '📐',
        titel: 'Die Faustregel und ihre Grenzen',
        text: 'Endet ein Wort auf *-o*, ist es meist männlich (*el libro*); auf *-a* meist weiblich (*la mesa*). Auch *-ción*, *-dad* und *-tad* sind immer weiblich: *la ciudad*. Wörter auf *-e* oder Konsonant muss man einzeln lernen.',
      },
      {
        emoji: '⚠️',
        titel: 'Die berühmten Ausreißer',
        text: '*el problema*, *el idioma*, *el día*, *el mapa* sind männlich trotz *-a*. Umgekehrt ist *la mano* weiblich trotz *-o*. Es sind wenige – aber es sind genau die Wörter, die man ständig braucht.',
      },
    ],
    dialog: [
      { sprecher: 'Ana', es: 'Tom, ¿dónde está el libro de español?', de: 'Tom, wo ist das Spanischbuch?' },
      { sprecher: 'Tom', es: 'Está en la mesa, al lado de la ventana.', de: 'Es liegt auf dem Tisch, neben dem Fenster.' },
      { sprecher: 'Ana', es: 'Gracias. ¿Necesitas un papel para la clase?', de: 'Danke. Brauchst du ein Blatt Papier für den Unterricht?' },
      { sprecher: 'Tom', es: 'Sí, pero tengo una pregunta. ¿Por qué el problema y no la problema?', de: 'Ja, aber ich habe eine Frage. Warum el problema und nicht la problema?' },
      { sprecher: 'Ana', es: 'Buena pregunta. Las palabras en -ma vienen del griego y son masculinas.', de: 'Gute Frage. Wörter auf -ma kommen aus dem Griechischen und sind männlich.' },
      { sprecher: 'Tom', es: 'Como el idioma. ¿Y hay más excepciones?', de: 'Wie el idioma. Und gibt es mehr Ausnahmen?' },
      { sprecher: 'Ana', es: 'La mano, por ejemplo. Es femenina aunque termina en -o.', de: 'La mano zum Beispiel. Es ist weiblich, obwohl es auf -o endet.' },
      { sprecher: 'Tom', es: 'Entonces aprendo siempre el artículo con la palabra.', de: 'Dann lerne ich immer den Artikel mit dem Wort.' },
      { sprecher: 'Ana', es: 'Exacto. Así no tienes que pensar nunca más.', de: 'Genau. So musst du nie wieder nachdenken.' },
    ],
  },

  // ============ NEU: Grammatik-Spine Modul 1 (10, 13-16) ============
  {
    id: 'plural',
    niveau: 'A1.1',
    kursNr: 10,
    grammatik: ['Singular und Plural'],
    wiederholt: ['artikel', 'ser', 'aussprache'],
    vorher: ['artikel'],
    kulturnotiz: 'Spanier sagen „los padres“ für Eltern und „los hermanos“ für Geschwister – die männliche Mehrzahl meint gemischte Gruppen mit.',
    titel: 'Einer oder mehrere',
    emoji: '2️⃣',
    beschreibung: 'Die Mehrzahl bilden – und die Stolperfallen',
    ziele: [
      'Die Mehrzahl regelmäßig bilden',
      'Die Schreibänderungen bei z und c erkennen',
      'Verstehen, warum Akzente verschwinden',
    ],
    items: [
      { es: 'los amigos', de: 'die Freunde', beispielEs: 'Mis amigos llegan el sábado.', beispielDe: 'Meine Freunde kommen am Samstag.' },
      { es: 'las flores', de: 'die Blumen', beispielEs: 'Las flores están en la mesa.', beispielDe: 'Die Blumen stehen auf dem Tisch.' },
      { es: 'las voces', de: 'die Stimmen', beispielEs: 'Oigo voces en la calle.', beispielDe: 'Ich höre Stimmen auf der Straße.' },
      { es: 'los lápices', de: 'die Stifte', beispielEs: 'Necesito dos lápices para el examen.', beispielDe: 'Ich brauche zwei Stifte für die Prüfung.' },
      { es: 'las veces', de: 'die Male', beispielEs: 'He estado allí tres veces.', beispielDe: 'Ich war dreimal dort.' },
      { es: 'los jóvenes', de: 'die Jugendlichen', beispielEs: 'Los jóvenes hablan muy rápido.', beispielDe: 'Die Jugendlichen sprechen sehr schnell.' },
      { es: 'las llaves', de: 'die Schlüssel', beispielEs: '¿Dónde están mis llaves?', beispielDe: 'Wo sind meine Schlüssel?' },
      { es: 'los meses', de: 'die Monate', beispielEs: 'El año tiene doce meses.', beispielDe: 'Das Jahr hat zwölf Monate.' },
      { es: 'las luces', de: 'die Lichter', beispielEs: 'Apaga las luces, por favor.', beispielDe: 'Mach das Licht aus, bitte.' },
      { es: 'los trenes', de: 'die Züge', beispielEs: 'Los trenes salen cada hora.', beispielDe: 'Die Züge fahren jede Stunde.' },
      { es: 'las manos', de: 'die Hände', beispielEs: 'Me lavo las manos antes de comer.', beispielDe: 'Ich wasche mir vor dem Essen die Hände.' },
      { es: 'los países', de: 'die Länder', beispielEs: 'Conozco tres países de habla hispana.', beispielDe: 'Ich kenne drei spanischsprachige Länder.' },
    ],
    wissen: [
      {
        emoji: '➕',
        titel: 'Vokal bekommt -s, Konsonant bekommt -es',
        text: 'Endet ein Wort auf einen Vokal, hängst du *-s* an: *amigo → amigos*, *flor* dagegen endet auf Konsonant und bekommt *-es*: *flores*. Der Artikel wandert mit: *el → los*, *la → las*.',
      },
      {
        emoji: '🔁',
        titel: 'Aus z wird c',
        text: 'Wörter auf *-z* schreiben in der Mehrzahl *-ces*: *la voz → las voces*, *el lápiz → los lápices*, *la vez → las veces*. Gesprochen ändert sich fast nichts – es ist eine Schreibregel, keine Lautregel.',
      },
      {
        emoji: '´',
        titel: 'Der Akzent kommt und geht',
        text: 'Durch die neue Silbe verschiebt sich die Betonung – und der Akzent folgt der Regel aus Lektion 4. *joven* wird *jóvenes* (Akzent kommt dazu), *el inglés* wird *los ingleses* (Akzent fällt weg).',
      },
    ],
    dialog: [
      { sprecher: 'Ana', es: 'Tom, ¿tienes las llaves?', de: 'Tom, hast du die Schlüssel?' },
      { sprecher: 'Tom', es: 'Sí, aquí están. ¿Por qué dices „las llaves“ y no „los llaves“?', de: 'Ja, hier sind sie. Warum sagst du „las llaves“ und nicht „los llaves“?' },
      { sprecher: 'Ana', es: 'Porque la llave es femenina. El artículo cambia con la palabra.', de: 'Weil la llave weiblich ist. Der Artikel ändert sich mit dem Wort.' },
      { sprecher: 'Tom', es: 'Entiendo. ¿Y los lápices? Eso suena raro.', de: 'Verstehe. Und los lápices? Das klingt seltsam.' },
      { sprecher: 'Ana', es: 'La zeta se convierte en ce: lápiz, lápices. Igual que voz y voces.', de: 'Das Z wird zu C: lápiz, lápices. Genauso wie voz und voces.' },
      { sprecher: 'Tom', es: 'Y joven se convierte en jóvenes, con acento.', de: 'Und joven wird jóvenes, mit Akzent.' },
      { sprecher: 'Ana', es: 'Exacto. La palabra crece, la acentuación se mueve.', de: 'Genau. Das Wort wächst, die Betonung wandert.' },
      { sprecher: 'Tom', es: 'Vale. Entonces vamos, los trenes no esperan.', de: 'Gut. Dann los, die Züge warten nicht.' },
    ],
  },
  {
    id: 'fragen',
    niveau: 'A1.1',
    kursNr: 13,
    grammatik: ['Die Fragewörter'],
    wiederholt: ['woher', 'pronomen', 'begruessung'],
    vorher: ['woher'],
    kulturnotiz: 'Das umgekehrte Fragezeichen am Anfang ist kein Schmuck: Weil Spanisch keine Umstellung im Satzbau braucht, sieht man erst daran, dass eine Frage kommt.',
    titel: 'Fragen stellen',
    emoji: '❓',
    beschreibung: 'Wer, was, wo – und warum zwei Fragezeichen',
    ziele: [
      'Die wichtigsten Fragewörter kennen',
      'Fragen ohne Fragewort bilden',
      'Verstehen, wozu das umgekehrte Fragezeichen dient',
    ],
    items: [
      { es: '¿qué?', de: 'was?', beispielEs: '¿Qué haces hoy?', beispielDe: 'Was machst du heute?' },
      { es: '¿quién?', de: 'wer?', beispielEs: '¿Quién es esa mujer?', beispielDe: 'Wer ist diese Frau?' },
      { es: '¿dónde?', de: 'wo?', beispielEs: '¿Dónde vives ahora?', beispielDe: 'Wo wohnst du jetzt?' },
      { es: '¿adónde?', de: 'wohin?', beispielEs: '¿Adónde vamos esta noche?', beispielDe: 'Wohin gehen wir heute Abend?' },
      { es: '¿cuándo?', de: 'wann?', beispielEs: '¿Cuándo empieza la clase?', beispielDe: 'Wann beginnt der Unterricht?' },
      { es: '¿cómo?', de: 'wie?', beispielEs: '¿Cómo se dice esto en español?', beispielDe: 'Wie sagt man das auf Spanisch?' },
      { es: '¿por qué?', de: 'warum?', beispielEs: '¿Por qué estudias español?', beispielDe: 'Warum lernst du Spanisch?' },
      { es: 'porque', de: 'weil', beispielEs: 'Estudio español porque me gusta.', beispielDe: 'Ich lerne Spanisch, weil es mir gefällt.' },
      { es: '¿cuánto?', de: 'wie viel?', beispielEs: '¿Cuánto cuesta el billete?', beispielDe: 'Wie viel kostet die Fahrkarte?' },
      { es: '¿cuál?', de: 'welcher?', beispielEs: '¿Cuál es tu número?', beispielDe: 'Welche ist deine Nummer?' },
      { es: '¿verdad?', de: 'oder?, nicht wahr?', beispielEs: 'Eres alemán, ¿verdad?', beispielDe: 'Du bist Deutscher, oder?' },
    ],
    wissen: [
      {
        emoji: '¿',
        titel: 'Zwei Zeichen, ein Zweck',
        text: 'Im Spanischen ändert sich die Wortstellung bei Fragen nicht. *Tú hablas español* und *¿Tú hablas español?* sehen gleich aus. Das *¿* am Anfang sagt dem Leser vorher, dass eine Frage kommt – auf Deutsch übernimmt das die Umstellung.',
      },
      {
        emoji: '´',
        titel: 'Fragewörter tragen immer einen Akzent',
        text: '*qué*, *dónde*, *cómo* mit Akzent sind Fragewörter. Ohne Akzent sind es andere Wörter: *que* (dass), *donde* (wo … ist), *como* (wie, ich esse). Der Strich unterscheidet also nicht die Aussprache, sondern die Funktion.',
      },
      {
        emoji: '🎵',
        titel: 'Fragen ganz ohne Fragewort',
        text: 'Man kann jeden Satz durch die Stimme zur Frage machen: *¿Vienes mañana?* Die Stimme geht am Ende hoch. Für ein „oder?“ hängt man *¿verdad?* oder *¿no?* an: *Hablas español, ¿verdad?*',
      },
    ],
    dialog: [
      { sprecher: 'Tom', es: 'Ana, ¿puedo hacerte muchas preguntas?', de: 'Ana, darf ich dir viele Fragen stellen?' },
      { sprecher: 'Ana', es: 'Claro. ¿Qué quieres saber?', de: 'Klar. Was möchtest du wissen?' },
      { sprecher: 'Tom', es: '¿Dónde trabajas y cuándo empiezas?', de: 'Wo arbeitest du und wann fängst du an?' },
      { sprecher: 'Ana', es: 'Trabajo en una escuela y empiezo a las ocho.', de: 'Ich arbeite in einer Schule und fange um acht an.' },
      { sprecher: 'Tom', es: '¿Y por qué enseñas español?', de: 'Und warum unterrichtest du Spanisch?' },
      { sprecher: 'Ana', es: 'Porque me gusta ver cómo la gente aprende.', de: 'Weil ich gern sehe, wie Menschen lernen.' },
      { sprecher: 'Tom', es: 'Una cosa más: ¿por qué se escribe „¿“ al principio?', de: 'Noch eine Sache: Warum schreibt man „¿“ am Anfang?' },
      { sprecher: 'Ana', es: 'Para saber desde el principio que es una pregunta. Práctico, ¿verdad?', de: 'Um von Anfang an zu wissen, dass es eine Frage ist. Praktisch, oder?' },
    ],
  },

  {
    id: 'arverben',
    niveau: 'A1.1',
    kursNr: 14,
    grammatik: ['Regelmäßige Verben auf -ar im Präsens'],
    wiederholt: ['pronomen', 'fragen', 'ser'],
    vorher: ['pronomen'],
    kulturnotiz: 'Rund die Hälfte aller spanischen Verben endet auf -ar. Wer diese sechs Endungen kann, kann Tausende von Wörtern beugen.',
    titel: 'Verben auf -ar',
    emoji: '🔤',
    beschreibung: 'Sechs Endungen, tausende Verben',
    ziele: [
      'Die sechs Präsens-Endungen sicher anwenden',
      'Über den Alltag sprechen',
      'Verstehen, warum das Pronomen wegfallen kann',
    ],
    items: [
      { es: 'hablar', de: 'sprechen', beispielEs: 'Hablo español todos los días.', beispielDe: 'Ich spreche jeden Tag Spanisch.' },
      { es: 'trabajar', de: 'arbeiten', beispielEs: '¿Dónde trabajas tú?', beispielDe: 'Wo arbeitest du?' },
      { es: 'estudiar', de: 'lernen, studieren', beispielEs: 'Estudiamos juntos los martes.', beispielDe: 'Wir lernen dienstags zusammen.' },
      { es: 'escuchar', de: 'zuhören, hören', beispielEs: 'Escucho música mientras cocino.', beispielDe: 'Ich höre Musik, während ich koche.' },
      { es: 'tomar', de: 'nehmen, trinken', beispielEs: 'Tomo un café por la mañana.', beispielDe: 'Ich trinke morgens einen Kaffee.' },
      { es: 'llegar', de: 'ankommen', beispielEs: 'El tren llega a las siete.', beispielDe: 'Der Zug kommt um sieben an.' },
      { es: 'necesitar', de: 'brauchen', beispielEs: 'Necesito tu ayuda, por favor.', beispielDe: 'Ich brauche deine Hilfe, bitte.' },
      { es: 'buscar', de: 'suchen', beispielEs: 'Busco un piso en el centro.', beispielDe: 'Ich suche eine Wohnung im Zentrum.' },
      { es: 'viajar', de: 'reisen', beispielEs: 'Viajamos a España en verano.', beispielDe: 'Wir reisen im Sommer nach Spanien.' },
      { es: 'cocinar', de: 'kochen', beispielEs: 'Mi hermano cocina muy bien.', beispielDe: 'Mein Bruder kocht sehr gut.' },
      { es: 'descansar', de: 'sich ausruhen', beispielEs: 'Los domingos descanso en casa.', beispielDe: 'Sonntags ruhe ich mich zu Hause aus.' },
      { es: 'preguntar', de: 'fragen', beispielEs: 'Si no entiendes, pregunta.', beispielDe: 'Wenn du nicht verstehst, frag.' },
    ],
    wissen: [
      {
        emoji: '🧩',
        titel: 'Stamm plus Endung',
        text: 'Streiche die Endung *-ar* und hänge an, wer spricht: *habl-o*, *habl-as*, *habl-a*, *habl-amos*, *habl-áis*, *habl-an*. Diese sechs Endungen gelten für jedes regelmäßige *-ar*-Verb – bei *trabajar*, *estudiar* und *cocinar* genauso.',
      },
      {
        emoji: '🫥',
        titel: 'Darum braucht es kein „yo“',
        text: 'Die Endung sagt schon, wer gemeint ist: *hablo* kann nur „ich spreche“ heißen. Deshalb sagt man *Hablo español*, nicht *Yo hablo español*. Das Pronomen kommt nur dazu, wenn man betont oder vergleicht.',
      },
      {
        emoji: '⏱️',
        titel: 'Eine Form, drei deutsche Bedeutungen',
        text: '*Hablo español* heißt „ich spreche Spanisch“, „ich bin am Sprechen“ und „ich spreche gerade“. Das Spanische braucht dafür keine Verlaufsform – die einfache Gegenwart deckt das mit ab.',
      },
    ],
    dialog: [
      { sprecher: 'Luis', es: 'Tom, ¿trabajas o estudias?', de: 'Tom, arbeitest du oder studierst du?' },
      { sprecher: 'Tom', es: 'Estudio y trabajo un poco. Y tú, ¿qué haces?', de: 'Ich studiere und arbeite ein bisschen. Und du, was machst du?' },
      { sprecher: 'Luis', es: 'Enseño guitarra. Los alumnos llegan por la tarde.', de: 'Ich unterrichte Gitarre. Die Schüler kommen nachmittags.' },
      { sprecher: 'Tom', es: '¿Y descansas alguna vez?', de: 'Und ruhst du dich auch mal aus?' },
      { sprecher: 'Luis', es: 'Los domingos descanso y cocino para mis amigos.', de: 'Sonntags ruhe ich mich aus und koche für meine Freunde.' },
      { sprecher: 'Tom', es: 'Necesito practicar más. Hablo muy despacio.', de: 'Ich muss mehr üben. Ich spreche sehr langsam.' },
      { sprecher: 'Luis', es: 'Pues hablamos cada semana. Así practicas conmigo.', de: 'Dann sprechen wir jede Woche. So übst du mit mir.' },
      { sprecher: 'Tom', es: '¡Perfecto! Pregunto mucho, te aviso.', de: 'Perfekt! Ich frage viel, ich warne dich.' },
    ],
  },
  {
    id: 'verneinung',
    niveau: 'A1.1',
    kursNr: 15,
    grammatik: ['Satzbau und Verneinung'],
    wiederholt: ['arverben', 'fragen', 'artikel'],
    vorher: ['arverben'],
    kulturnotiz: 'Die doppelte Verneinung ist im Spanischen kein Fehler, sondern Pflicht: „No veo nada“ heißt „Ich sehe nichts“, nicht „Ich sehe nicht nichts“.',
    titel: 'Nein sagen',
    emoji: '🚫',
    beschreibung: 'Verneinen – und warum doppelt richtig ist',
    ziele: [
      'Sätze richtig verneinen',
      'Die doppelte Verneinung verstehen',
      'Zustimmen und widersprechen mit también und tampoco',
    ],
    items: [
      { es: 'no', de: 'nicht, nein', beispielEs: 'No trabajo los domingos.', beispielDe: 'Ich arbeite sonntags nicht.' },
      { es: 'nunca', de: 'nie', beispielEs: 'Nunca tomo café por la noche.', beispielDe: 'Ich trinke abends nie Kaffee.' },
      { es: 'nada', de: 'nichts', beispielEs: 'No necesito nada, gracias.', beispielDe: 'Ich brauche nichts, danke.' },
      { es: 'nadie', de: 'niemand', beispielEs: 'No hay nadie en la oficina.', beispielDe: 'Es ist niemand im Büro.' },
      { es: 'tampoco', de: 'auch nicht', beispielEs: 'Yo tampoco hablo francés.', beispielDe: 'Ich spreche auch kein Französisch.' },
      { es: 'también', de: 'auch', beispielEs: 'Yo también estudio español.', beispielDe: 'Ich lerne auch Spanisch.' },
      { es: 'siempre', de: 'immer', beispielEs: 'Siempre llego temprano.', beispielDe: 'Ich komme immer früh.' },
      { es: 'algo', de: 'etwas', beispielEs: '¿Necesitas algo del mercado?', beispielDe: 'Brauchst du etwas vom Markt?' },
      { es: 'alguien', de: 'jemand', beispielEs: '¿Hay alguien en casa?', beispielDe: 'Ist jemand zu Hause?' },
      { es: 'todavía', de: 'noch', beispielEs: 'Todavía no hablo bien.', beispielDe: 'Ich spreche noch nicht gut.' },
      { es: 'ya', de: 'schon', beispielEs: 'Ya entiendo mucho más.', beispielDe: 'Ich verstehe schon viel mehr.' },
    ],
    wissen: [
      {
        emoji: '⬅️',
        titel: 'Das no steht vor dem Verb',
        text: 'Anders als im Deutschen wandert die Verneinung nach vorn: *No hablo francés* – wörtlich „nicht spreche ich Französisch“. Zwischen *no* und das Verb passt nichts außer einem Pronomen.',
      },
      {
        emoji: '➕',
        titel: 'Doppelt ist richtig',
        text: 'Steht ein Wort wie *nada*, *nadie* oder *nunca* hinter dem Verb, MUSS davor ein *no*: *No veo nada.* Rückt das Wort nach vorn, fällt das *no* weg: *Nunca veo nada.* Beides ist korrekt, nur nicht gemischt.',
      },
      {
        emoji: '🔁',
        titel: 'también und tampoco',
        text: 'Auf einen positiven Satz antwortet man mit *también*: „Hablo español.“ – „Yo también.“ Auf einen verneinten mit *tampoco*: „No hablo francés.“ – „Yo tampoco.“ Wer hier *también* sagt, sagt versehentlich das Gegenteil.',
      },
    ],
    dialog: [
      { sprecher: 'Ana', es: 'Tom, ¿trabajas los fines de semana?', de: 'Tom, arbeitest du am Wochenende?' },
      { sprecher: 'Tom', es: 'No, nunca trabajo el domingo.', de: 'Nein, sonntags arbeite ich nie.' },
      { sprecher: 'Ana', es: 'Yo tampoco. Es el día para descansar.', de: 'Ich auch nicht. Das ist der Tag zum Ausruhen.' },
      { sprecher: 'Tom', es: '¿Por qué dices „tampoco“ y no „también“?', de: 'Warum sagst du „tampoco“ und nicht „también“?' },
      { sprecher: 'Ana', es: 'Porque tu frase es negativa. Con „también“ dirías lo contrario.', de: 'Weil dein Satz verneint ist. Mit „también“ würdest du das Gegenteil sagen.' },
      { sprecher: 'Tom', es: 'Ah. ¿Y „no necesito nada“ no es doble negación?', de: 'Ah. Und „no necesito nada“ ist keine doppelte Verneinung?' },
      { sprecher: 'Ana', es: 'En español sí es correcto. Sin el „no“ suena mal.', de: 'Im Spanischen ist das richtig. Ohne das „no“ klingt es falsch.' },
      { sprecher: 'Tom', es: 'Vale. Todavía no lo digo rápido, pero ya lo entiendo.', de: 'Gut. Ich sage es noch nicht schnell, aber ich verstehe es schon.' },
    ],
  },

  {
    id: 'estar',
    niveau: 'A1.1',
    kursNr: 16,
    grammatik: ['Das Verb estar im Präsens'],
    wiederholt: ['ser', 'arverben', 'plural'],
    vorher: ['ser'],
    kulturnotiz: 'Auf „¿Cómo estás?“ antwortet man in Spanien meist knapp mit „Bien, ¿y tú?“ – eine ausführliche Antwort erwartet niemand.',
    titel: 'Das Verb estar',
    emoji: '📍',
    beschreibung: 'Wo etwas ist und wie es einem geht',
    ziele: [
      'estar vollständig konjugieren',
      'Orte und Befinden ausdrücken',
      'Den Unterschied zu ser erkennen',
    ],
    items: [
      { es: 'estar', de: 'sich befinden', beispielEs: 'Estar en casa es agradable.', beispielDe: 'Zu Hause zu sein ist angenehm.' },
      { es: 'estoy', de: 'ich bin (gerade)', beispielEs: 'Estoy en la oficina ahora.', beispielDe: 'Ich bin gerade im Büro.' },
      { es: 'estás', de: 'du bist (gerade)', beispielEs: '¿Dónde estás?', beispielDe: 'Wo bist du?' },
      { es: 'está', de: 'er/sie ist (gerade)', beispielEs: 'El libro está en la mesa.', beispielDe: 'Das Buch liegt auf dem Tisch.' },
      { es: 'estamos', de: 'wir sind (gerade)', beispielEs: 'Estamos muy contentos aquí.', beispielDe: 'Wir sind hier sehr zufrieden.' },
      { es: 'están', de: 'sie sind (gerade)', beispielEs: 'Mis padres están de viaje.', beispielDe: 'Meine Eltern sind auf Reisen.' },
      { es: 'cansado', de: 'müde', beispielEs: 'Hoy estoy muy cansado.', beispielDe: 'Heute bin ich sehr müde.' },
      { es: 'contento', de: 'zufrieden', beispielEs: 'Está contenta con su trabajo.', beispielDe: 'Sie ist mit ihrer Arbeit zufrieden.' },
      { es: 'ocupado', de: 'beschäftigt', beispielEs: 'Ahora estoy ocupado, perdona.', beispielDe: 'Ich bin gerade beschäftigt, entschuldige.' },
      { es: 'enfermo', de: 'krank', beispielEs: 'Mi hermana está enferma.', beispielDe: 'Meine Schwester ist krank.' },
      { es: 'cerca', de: 'in der Nähe', beispielEs: 'La panadería está cerca.', beispielDe: 'Die Bäckerei ist in der Nähe.' },
      { es: 'lejos', de: 'weit weg', beispielEs: 'El aeropuerto está lejos del centro.', beispielDe: 'Der Flughafen ist weit vom Zentrum entfernt.' },
    ],
    wissen: [
      {
        emoji: '📍',
        titel: 'estar beantwortet: Wo? Und wie gerade?',
        text: '*estar* steht für den Ort und für den Zustand im Augenblick: *Estoy en Madrid.* *Estoy cansado.* *La llave está aquí.* Ändert sich etwas gleich wieder oder ist es eine Momentaufnahme, dann *estar*.',
      },
      {
        emoji: '⚖️',
        titel: 'ser oder estar – die kurze Faustregel',
        text: '*ser* sagt, WER oder WAS etwas ist: *Ana es profesora.* *estar* sagt, WO es ist oder WIE es gerade steht: *Ana está en la escuela.* Beim Ort gibt es keine Ausnahme – ein Ort ist immer *estar*.',
      },
      {
        emoji: '🎭',
        titel: 'Dasselbe Wort, zwei Bedeutungen',
        text: 'Mit *ser* wird ein Adjektiv zum Charakter, mit *estar* zur Stimmung: *Es aburrido* heißt „er ist langweilig“, *Está aburrido* heißt „er langweilt sich“. Genauso: *es guapa* (sie ist hübsch) und *está guapa* (sie sieht heute hübsch aus).',
      },
    ],
    dialog: [
      { sprecher: 'Carmen', es: 'Hola Tom, ¿cómo estás?', de: 'Hallo Tom, wie geht es dir?' },
      { sprecher: 'Tom', es: 'Bien, pero un poco cansado. ¿Y tú?', de: 'Gut, aber ein bisschen müde. Und dir?' },
      { sprecher: 'Carmen', es: 'Estoy contenta. ¿Dónde está Ana?', de: 'Mir geht es gut. Wo ist Ana?' },
      { sprecher: 'Tom', es: 'Está en la escuela. Trabaja hasta las cinco.', de: 'Sie ist in der Schule. Sie arbeitet bis fünf.' },
      { sprecher: 'Carmen', es: '¿La escuela está lejos de aquí?', de: 'Ist die Schule weit von hier?' },
      { sprecher: 'Tom', es: 'No, está bastante cerca. Diez minutos a pie.', de: 'Nein, sie ist ziemlich nah. Zehn Minuten zu Fuß.' },
      { sprecher: 'Carmen', es: 'Perfecto. Ana es profesora y está muy ocupada siempre.', de: 'Perfekt. Ana ist Lehrerin und immer sehr beschäftigt.' },
      { sprecher: 'Tom', es: 'Ahora entiendo: es profesora, está ocupada. ¡Dos verbos!', de: 'Jetzt verstehe ich: Sie ist Lehrerin, sie ist beschäftigt. Zwei Verben!' },
    ],
  },
]

// Die Module der Sprach-Reise: Jedes Modul bündelt Lektionen zu einem Thema.
// "kommtBald"-Module zeigen, wohin die Reise geht (noch ohne Inhalt).
export const MODULE = [
  {
    id: 'm1',
    von: 1,
    bis: 22,
    titel: 'Erste Schritte',
    emoji: '🌱',
    beschreibung: 'Ankommen in der Sprache – ohne Grammatik, nur Sprechen',
    farbe: '#7d8c5c', // Olive
  },
  {
    id: 'm2',
    von: 23,
    bis: 45,
    titel: 'Im Alltag',
    emoji: '☕',
    beschreibung: 'Ein ganz normaler Tag auf Spanisch',
    farbe: '#ff6c00', // Habloo-Orange
  },
  {
    id: 'm3',
    von: 46,
    bis: 65,
    titel: 'Unter Menschen',
    emoji: '👋',
    beschreibung: 'Der obere Weg: über dich und andere sprechen',
    farbe: '#c96f4a', // Terrakotta
    kommtBald: true,
    geplant: ['Familie', 'Aussehen & Charakter', 'Hobbys', 'Verabreden', 'Gefühle'],
  },
  {
    id: 'm4',
    von: 66,
    bis: 88,
    titel: 'Unterwegs',
    emoji: '🧳',
    beschreibung: 'Der untere Weg: raus aus dem Haus',
    farbe: '#c9a961', // Sand, etwas dunkler fuer Kontrast
    geplant: ['Bus, Zug & Taxi', 'Im Hotel', 'Beim Arzt', 'Notfälle'],
  },
  {
    id: 'm5',
    von: 89,
    bis: 110,
    titel: 'Erzählen',
    emoji: '📖',
    beschreibung: 'Wo beide Wege zusammenlaufen – die Vergangenheit',
    farbe: '#7d3350', // Wein
    kommtBald: true,
    geplant: ['Gestern & letzte Woche', 'Der Urlaub', 'Früher war das so', 'Eine Geschichte erzählen', 'Meinungen sagen'],
  },
  {
    id: 'm6',
    von: 111,
    bis: 130,
    titel: 'An der Küste',
    emoji: '🌊',
    beschreibung: 'Ein Abstecher: Spanien und Lateinamerika',
    farbe: '#4a9d9c', // Meer
    kommtBald: true,
    geplant: ['Feste & Traditionen', 'Essen der Regionen', 'Spanisch in Amerika', 'Redewendungen'],
  },
  {
    id: 'm7',
    von: 131,
    bis: 150,
    titel: 'Arbeit & Pläne',
    emoji: '💼',
    beschreibung: 'Das letzte Gebiet: Zukunft und Berufliches',
    farbe: '#5b7596', // Blaugrau
    kommtBald: true,
    geplant: ['Beruf & Studium', 'Termine machen', 'Telefonieren', 'Pläne schmieden', 'Höflich schreiben'],
  },
]

// Hilfen rund um Module und Fortschritt
/**
 * Welche Lektionen gehoeren zu diesem Modul?
 *
 * ABGELEITET aus der Kursnummer, nicht von Hand gepflegt. Die
 * frueheren Listen sind zweimal falsch gewesen: "Zahlen" (Nr. 11)
 * lag in Modul 2 und "Essen" (Nr. 32) in Modul 4, obwohl beide
 * Nummern in andere Module gehoeren. Solche Fehler faellt niemandem
 * auf – die Lektion ist ja da, nur an der falschen Stelle.
 */
export function lektionenVon(modul) {
  return LEKTIONEN
    .filter((l) => l.kursNr >= modul.von && l.kursNr <= modul.bis)
    .sort((a, b) => a.kursNr - b.kursNr)
}

export function modulFortschritt(modul, lessonProgress) {
  const liste = lektionenVon(modul)
  const fertig = liste.filter((l) => lessonProgress[l.id]?.fertig).length
  return { fertig, gesamt: liste.length }
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
  const { fertig, gesamt } = modulFortschritt(vorher, lessonProgress)
  return gesamt > 0 && fertig === gesamt
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
/** Platzhalter fuer die Luecke im Satz – wird als Linie gezeichnet. */
export const LUECKE_MARKE = '\u0000LUECKE\u0000'

export function baueLuecke(item) {
  const kern = kernwort(item.es)
  const regex = new RegExp(kern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
  const treffer = item.beispielEs.match(regex)
  if (!treffer) return null
  // Marke statt Unterstrichen: Die Luecke wird als saubere Linie
  // gezeichnet, nicht als fuenf einzelne Striche.
  return { satz: item.beispielEs.replace(regex, LUECKE_MARKE), loesung: treffer[0] }
}

/**
 * Sammelt Wörter aus den Lektionen, die diese hier wiederholt.
 * Höchstens drei, gemischt – mehr würde die Lektion überladen.
 */
export function sammleWiederholung(lektion) {
  const quellen = (lektion.wiederholt ?? [])
    .map((id) => LEKTIONEN.find((l) => l.id === id))
    .filter(Boolean)
  if (quellen.length === 0) return []

  // Aus jeder Quelle EIN Wort, damit die Wiederholung breit streut
  const gezogen = quellen.map((q) => mischen(q.items)[0]).filter(Boolean)
  return mischen(gezogen).slice(0, 3)
}

// Baut den geführten Ablauf einer Lektion:
// Einleitung → Wörter → Gut zu wissen → Dialog → Auswahl-Übungen → Lücken-Übungen
export function baueSchritte(lektion) {
  const schritte = [{ typ: 'intro' }]
  for (const item of lektion.items) schritte.push({ typ: 'lernen', item })
  if (lektion.wissen) schritte.push({ typ: 'info' })

  // Hörverstehen VOR dem Dialog: eine Zeile nur hören, Bedeutung
  // wählen. Wer den Dialog schon gelesen hat, hört nicht mehr
  // wirklich hin – deshalb kommt dieser Schritt zuerst.
  if (lektion.dialog?.length >= 4) {
    const kandidaten = lektion.dialog.filter((z) => z.es.length > 12)
    if (kandidaten.length) {
      const zeile = mischen(kandidaten)[0]
      schritte.push({ typ: 'hoeren', zeile, dialog: lektion.dialog })
    }
  }

  if (lektion.dialog) schritte.push({ typ: 'dialog' })
  mischen(lektion.items).forEach((item, i) =>
    schritte.push({ typ: 'quiz', item, richtung: i % 2 === 0 ? 'es-de' : 'de-es' })
  )
  for (const item of mischen(lektion.items).slice(0, 3)) {
    const luecke = baueLuecke(item)
    if (luecke) schritte.push({ typ: 'luecke', item, luecke })
  }

  // Satzbau: zwei Beispielsätze aus Bausteinen zusammensetzen
  for (const item of mischen(lektion.items).slice(0, 6)) {
    const satzbau = baueSatzbau(item)
    if (satzbau) {
      schritte.push({ typ: 'satzbau', item, satzbau })
      if (schritte.filter((s) => s.typ === 'satzbau').length >= 2) break
    }
  }

  // Wortpaare: fuenf Woerter der Lektion verbinden – lockert die
  // Quiz-Strecke auf und wiederholt nebenbei den halben Wortschatz
  if (lektion.items.length >= 5) {
    schritte.push({
      typ: 'paare',
      paare: mischen(lektion.items).slice(0, 5).map((i) => ({ es: i.es, de: i.de })),
    })
  }

  // Wiederholung aus frueheren Lektionen. DAS macht aus 150
  // Einzelstuecken einen Kurs: Jede Lektion greift drei bis fuenf
  // aeltere Woerter auf, statt nur Neues aufzutuermen.
  const rueckblick = sammleWiederholung(lektion)
  for (const item of rueckblick) {
    schritte.push({ typ: 'rueckblick', item, richtung: 'es-de' })
  }

  // Abschlussfragen: ganze Saetze aus dem Dialog verstehen, nicht
  // nur einzelne Woerter – das ist die eigentliche Vertiefung
  if (lektion.dialog?.length >= 4) {
    const zeilen = mischen(lektion.dialog.filter((z) => z.es.length > 12)).slice(0, 3)
    for (const zeile of zeilen) {
      schritte.push({ typ: 'dialogquiz', zeile, dialog: lektion.dialog })
    }
  }
  return schritte
}

/**
 * Baut eine Satzbau-Übung aus einem Beispielsatz: Die Wörter werden
 * gemischt, der Lernende tippt sie in die richtige Reihenfolge.
 * Nur Sätze mit 4 bis 8 Wörtern taugen dafür – kürzere sind trivial,
 * längere werden zum Geduldsspiel.
 */
export function baueSatzbau(item) {
  const satz = (item.beispielEs || '').trim()
  const woerter = satz.split(/\s+/)
  if (woerter.length < 4 || woerter.length > 8) return null
  // Erst mischen, wenn wirklich eine andere Reihenfolge entsteht
  let gemischt = woerter
  for (let i = 0; i < 8 && gemischt.join(' ') === satz; i++) {
    gemischt = mischen(woerter)
  }
  if (gemischt.join(' ') === satz) return null
  return { woerter: gemischt, loesung: satz, uebersetzung: item.beispielDe }
}

// Baut die vier Antwort-Möglichkeiten für eine Übung (richtige + drei falsche)
export function baueOptionen(schritt, lektion) {
  if (schritt.typ === 'rueckblick') {
    // Falsche Antworten aus der AKTUELLEN Lektion – so muss man
    // Altes und Neues auseinanderhalten
    const falsche = mischen(
      lektion.items.map((i) => i.de).filter((d) => d !== schritt.item.de)
    ).slice(0, 3)
    return mischen([schritt.item.de, ...falsche])
  }
  if (schritt.typ === 'hoeren' || schritt.typ === 'dialogquiz') {
    // Die falschen Antworten sind die deutschen Saetze der ANDEREN
    // Dialogzeilen – nah genug am Thema, um zum Nachdenken zu zwingen
    const falsche = mischen(
      schritt.dialog.filter((z) => z !== schritt.zeile).map((z) => z.de)
    ).slice(0, 3)
    return mischen([schritt.zeile.de, ...falsche])
  }
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

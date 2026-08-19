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
    wiederholt: ['einstieg', 'aussprache', 'betonung'],
    vorher: ['betonung'],
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
    wiederholt: ['zahlen', 'hoeflichkeit', 'abschluss1', 'tagesablauf'],
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
    wiederholt: ['einstieg'],
    vorher: ['einstieg'],
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
    wiederholt: ['zahlen', 'hoeflichkeit', 'begruessung', 'abschluss1'],
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
    wiederholt: ['zahlen', 'cafe', 'hoeflichkeit', 'beschreiben'],
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
    wiederholt: ['ser', 'aussprache', 'vorstellen', 'einstieg'],
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

  {
    id: 'seroestar',
    niveau: 'A1.1',
    kursNr: 17,
    grammatik: ['Ser oder estar unterscheiden'],
    wiederholt: ['ser', 'estar', 'arverben'],
    vorher: ['estar'],
    kulturnotiz: 'Veranstaltungen sind die grosse Ausnahme: „La fiesta es en mi casa“ – ein Fest findet statt, es liegt nicht irgendwo herum.',
    titel: 'Ser oder estar',
    emoji: '⚖️',
    beschreibung: 'Zwei Verben für „sein“ – und wann welches',
    ziele: [
      'Die Grundregel sicher anwenden',
      'Adjektive erkennen, die ihre Bedeutung wechseln',
      'Die Ausnahme bei Veranstaltungen kennen',
    ],
    items: [
      { es: 'aburrido', de: 'langweilig oder gelangweilt', beispielEs: 'El libro es aburrido.', beispielDe: 'Das Buch ist langweilig.' },
      { es: 'listo', de: 'klug oder fertig', beispielEs: 'Ya estoy listo, vamos.', beispielDe: 'Ich bin schon fertig, gehen wir.' },
      { es: 'rico', de: 'reich oder lecker', beispielEs: 'Esta sopa está muy rica.', beispielDe: 'Diese Suppe ist sehr lecker.' },
      { es: 'malo', de: 'schlecht oder krank', beispielEs: 'Hoy está malo, no viene.', beispielDe: 'Heute ist er krank, er kommt nicht.' },
      { es: 'abierto', de: 'geöffnet', beispielEs: 'La tienda está abierta hasta las ocho.', beispielDe: 'Der Laden ist bis acht geöffnet.' },
      { es: 'cerrado', de: 'geschlossen', beispielEs: 'El museo está cerrado los lunes.', beispielDe: 'Das Museum ist montags geschlossen.' },
      { es: 'libre', de: 'frei', beispielEs: '¿Está libre esta mesa?', beispielDe: 'Ist dieser Tisch frei?' },
      { es: 'casado', de: 'verheiratet', beispielEs: 'Mi hermano está casado.', beispielDe: 'Mein Bruder ist verheiratet.' },
      { es: 'la fiesta', de: 'die Feier', beispielEs: 'La fiesta es en mi casa.', beispielDe: 'Die Feier ist bei mir zu Hause.' },
      { es: 'la reunión', de: 'das Treffen', beispielEs: 'La reunión es a las diez.', beispielDe: 'Das Treffen ist um zehn.' },
      { es: 'serio', de: 'ernst', beispielEs: 'Mi jefe es muy serio.', beispielDe: 'Mein Chef ist sehr ernst.' },
      { es: 'tranquilo', de: 'ruhig', beispielEs: 'Este barrio es tranquilo.', beispielDe: 'Dieses Viertel ist ruhig.' },
    ],
    wissen: [
      {
        emoji: '🧭',
        titel: 'Die Frage entscheidet, nicht das Gefühl',
        text: 'Frag dich: WER oder WAS ist das? Dann *ser*. WO ist es oder WIE steht es gerade? Dann *estar*. *Ana es profesora* (was sie ist), *Ana está en clase* (wo sie ist), *Ana está cansada* (wie es ihr geht). Vergiss „dauerhaft gegen vorübergehend“ – *estar muerto* ist reichlich dauerhaft.',
      },
      {
        emoji: '🎭',
        titel: 'Wörter, die ihre Bedeutung wechseln',
        text: 'Bei manchen Adjektiven ändert das Verb den Sinn: *es aburrido* (er ist langweilig) gegen *está aburrido* (er langweilt sich). *Es listo* (klug) gegen *está listo* (fertig). *Es rico* (reich) gegen *está rico* (schmeckt gut). *Es malo* (böse) gegen *está malo* (krank).',
      },
      {
        emoji: '🎉',
        titel: 'Die Ausnahme: Veranstaltungen',
        text: 'Beim Ort gilt sonst immer *estar* – aber Veranstaltungen bilden die Ausnahme: *La fiesta es en mi casa.* *El concierto es en el parque.* Der Grund: Ein Fest liegt nicht irgendwo, es findet statt. Der Tisch dagegen: *La mesa está en la cocina.*',
      },
    ],
    dialog: [
      { sprecher: 'Tom', es: 'Ana, ¿la fiesta está en tu casa?', de: 'Ana, ist die Feier bei dir zu Hause?' },
      { sprecher: 'Ana', es: 'Es en mi casa. Con fiestas usamos ser, no estar.', de: 'Sie ist bei mir. Bei Feiern benutzen wir ser, nicht estar.' },
      { sprecher: 'Tom', es: '¿Pero no dijiste que el lugar siempre es estar?', de: 'Aber sagtest du nicht, der Ort sei immer estar?' },
      { sprecher: 'Ana', es: 'Sí, para cosas. Una fiesta no está en un sitio: ocurre.', de: 'Ja, für Dinge. Eine Feier ist nicht an einem Ort: Sie findet statt.' },
      { sprecher: 'Tom', es: 'Entiendo. ¿Y por qué dices „la sopa está rica“?', de: 'Verstehe. Und warum sagst du „la sopa está rica“?' },
      { sprecher: 'Ana', es: 'Porque hablo de cómo sabe hoy. „Es rica“ sonaría a dinero.', de: 'Weil ich davon spreche, wie sie heute schmeckt. „Es rica“ klänge nach Geld.' },
      { sprecher: 'Tom', es: 'Entonces mi jefe es serio, pero hoy está tranquilo.', de: 'Also ist mein Chef ernst, aber heute ist er ruhig.' },
      { sprecher: 'Ana', es: '¡Perfecto! Ya lo tienes.', de: 'Perfekt! Du hast es.' },
    ],
  },
  {
    id: 'hay',
    niveau: 'A1.1',
    kursNr: 18,
    grammatik: ['hay für Existenz, estar für den Ort'],
    wiederholt: ['estar', 'artikel', 'plural'],
    vorher: ['estar'],
    kulturnotiz: 'In spanischen Städten fragt man selten nach der Adresse, sondern nach der Ecke: „en la esquina de Goya con Serrano“.',
    titel: 'Es gibt oder es ist',
    emoji: '🗺️',
    beschreibung: 'hay und está – und den Weg beschreiben',
    ziele: [
      'hay und está sicher unterscheiden',
      'Nach Orten in der Nähe fragen',
      'Lage mit Präpositionen beschreiben',
    ],
    items: [
      { es: 'hay', de: 'es gibt', beispielEs: 'Hay un banco en esta calle.', beispielDe: 'Es gibt eine Bank in dieser Straße.' },
      { es: 'el supermercado', de: 'der Supermarkt', beispielEs: 'El supermercado abre a las nueve.', beispielDe: 'Der Supermarkt öffnet um neun.' },
      { es: 'la farmacia', de: 'die Apotheke', beispielEs: '¿Hay una farmacia cerca?', beispielDe: 'Gibt es eine Apotheke in der Nähe?' },
      { es: 'el banco', de: 'die Bank', beispielEs: 'El banco está enfrente de la plaza.', beispielDe: 'Die Bank ist gegenüber vom Platz.' },
      { es: 'la parada', de: 'die Haltestelle', beispielEs: 'La parada está en la esquina.', beispielDe: 'Die Haltestelle ist an der Ecke.' },
      { es: 'la esquina', de: 'die Ecke', beispielEs: 'Nos vemos en la esquina.', beispielDe: 'Wir sehen uns an der Ecke.' },
      { es: 'la calle', de: 'die Straße', beispielEs: 'Vivo en esta calle.', beispielDe: 'Ich wohne in dieser Straße.' },
      { es: 'al lado de', de: 'neben', beispielEs: 'La farmacia está al lado del banco.', beispielDe: 'Die Apotheke ist neben der Bank.' },
      { es: 'enfrente de', de: 'gegenüber von', beispielEs: 'Mi casa está enfrente del parque.', beispielDe: 'Mein Haus ist gegenüber vom Park.' },
      { es: 'detrás de', de: 'hinter', beispielEs: 'El coche está detrás de la casa.', beispielDe: 'Das Auto steht hinter dem Haus.' },
      { es: 'delante de', de: 'vor', beispielEs: 'Te espero delante del cine.', beispielDe: 'Ich warte vor dem Kino auf dich.' },
      { es: 'entre', de: 'zwischen', beispielEs: 'La tienda está entre dos bares.', beispielDe: 'Der Laden ist zwischen zwei Bars.' },
    ],
    wissen: [
      {
        emoji: '🆕',
        titel: 'hay stellt vor, está zeigt hin',
        text: '*hay* sagt, DASS es etwas gibt – der Zuhörer kennt es noch nicht: *Hay una farmacia aquí.* *está* sagt, WO etwas Bekanntes ist: *La farmacia está al lado del banco.* Erst vorstellen, dann verorten.',
      },
      {
        emoji: '🚫',
        titel: 'Nie „hay el banco“',
        text: '*hay* verträgt keinen bestimmten Artikel. Richtig ist *hay un banco*, *hay dos bancos*, *hay bancos* – falsch ist *hay el banco*. Sobald du *el* oder *la* sagst, brauchst du *está*.',
      },
      {
        emoji: '1️⃣',
        titel: 'hay bleibt immer gleich',
        text: 'Egal ob eines oder zwanzig: *Hay un coche.* *Hay veinte coches.* Es gibt kein „hays“. Bei *estar* dagegen zählt die Zahl mit: *El coche está…* gegen *Los coches están…*',
      },
    ],
    dialog: [
      { sprecher: 'Tom', es: 'Perdona, ¿hay una farmacia por aquí?', de: 'Entschuldige, gibt es hier eine Apotheke?' },
      { sprecher: 'Carmen', es: 'Sí, hay una en la calle Goya.', de: 'Ja, es gibt eine in der Goya-Straße.' },
      { sprecher: 'Tom', es: '¿Y dónde está exactamente?', de: 'Und wo genau ist sie?' },
      { sprecher: 'Carmen', es: 'Está al lado del banco, enfrente de la parada.', de: 'Sie ist neben der Bank, gegenüber der Haltestelle.' },
      { sprecher: 'Tom', es: 'Primero dices „hay“ y luego „está“. ¿Por qué?', de: 'Erst sagst du „hay“, dann „está“. Warum?' },
      { sprecher: 'Carmen', es: 'Con hay te digo que existe. Con está te digo dónde.', de: 'Mit hay sage ich dir, dass es sie gibt. Mit está, wo sie ist.' },
      { sprecher: 'Tom', es: 'Claro. ¿Y hay dos farmacias o solo una?', de: 'Klar. Und gibt es zwei Apotheken oder nur eine?' },
      { sprecher: 'Carmen', es: 'Hay dos, pero la otra está muy lejos.', de: 'Es gibt zwei, aber die andere ist sehr weit weg.' },
    ],
  },

  {
    id: 'tener',
    niveau: 'A1.1',
    kursNr: 19,
    grammatik: ['Das Verb tener'],
    wiederholt: ['ser', 'zahlen', 'seroestar'],
    vorher: ['seroestar'],
    kulturnotiz: 'Nach dem Alter fragt man mit „¿Cuántos años tienes?“ – wörtlich „wie viele Jahre hast du“. Wer „¿Cómo viejo eres?“ sagt, erntet Gelächter.',
    titel: 'Haben und Alter',
    emoji: '🎂',
    beschreibung: 'tener – und warum man Jahre hat, statt alt zu sein',
    ziele: [
      'tener vollständig konjugieren',
      'Nach dem Alter fragen und antworten',
      'Zustände wie Hunger und Durst ausdrücken',
    ],
    items: [
      { es: 'tener', de: 'haben', beispielEs: 'Tener tiempo es un lujo.', beispielDe: 'Zeit zu haben ist ein Luxus.' },
      { es: 'tengo', de: 'ich habe', beispielEs: 'Tengo dos hermanos.', beispielDe: 'Ich habe zwei Brüder.' },
      { es: 'tienes', de: 'du hast', beispielEs: '¿Cuántos años tienes?', beispielDe: 'Wie alt bist du?' },
      { es: 'tiene', de: 'er/sie hat', beispielEs: 'Mi madre tiene un coche rojo.', beispielDe: 'Meine Mutter hat ein rotes Auto.' },
      { es: 'tenemos', de: 'wir haben', beispielEs: 'Tenemos una casa pequeña.', beispielDe: 'Wir haben ein kleines Haus.' },
      { es: 'tienen', de: 'sie haben', beispielEs: 'Mis vecinos tienen tres perros.', beispielDe: 'Meine Nachbarn haben drei Hunde.' },
      { es: 'el hermano', de: 'der Bruder', beispielEs: 'Mi hermano estudia medicina.', beispielDe: 'Mein Bruder studiert Medizin.' },
      { es: 'la hermana', de: 'die Schwester', beispielEs: 'Mi hermana vive en Sevilla.', beispielDe: 'Meine Schwester wohnt in Sevilla.' },
      { es: 'los años', de: 'die Jahre', beispielEs: 'Tengo treinta años.', beispielDe: 'Ich bin dreißig Jahre alt.' },
      { es: 'tener hambre', de: 'Hunger haben', beispielEs: 'Tengo hambre, vamos a comer.', beispielDe: 'Ich habe Hunger, gehen wir essen.' },
      { es: 'tener sed', de: 'Durst haben', beispielEs: '¿Tienes sed? Hay agua fría.', beispielDe: 'Hast du Durst? Es gibt kaltes Wasser.' },
      { es: 'tener prisa', de: 'es eilig haben', beispielEs: 'Perdona, tengo mucha prisa.', beispielDe: 'Entschuldige, ich habe es sehr eilig.' },
    ],
    wissen: [
      {
        emoji: '🔀',
        titel: 'Der Stamm wechselt – aber nicht überall',
        text: '*tener* ist unregelmäßig: *tengo*, *tienes*, *tiene*, *tenemos*, *tenéis*, *tienen*. Das *e* wird zu *ie*, wo die Betonung darauf fällt. Bei *nosotros* und *vosotros* liegt sie woanders – dort bleibt es *tenemos* und *tenéis*.',
      },
      {
        emoji: '🎂',
        titel: 'Man hat Jahre, man ist sie nicht',
        text: 'Das Alter steht mit *tener*, nicht mit *ser*: *Tengo treinta años.* *¿Cuántos años tienes?* Ein *Soy treinta* wäre so falsch wie „ich bin dreißig Jahre haben“ auf Deutsch. Und *años* darf nicht weggelassen werden.',
      },
      {
        emoji: '🍽️',
        titel: 'Hunger, Durst, Eile – alles mit tener',
        text: 'Wo das Deutsche „sein“ nimmt, nimmt das Spanische oft *tener*: *tener hambre* (Hunger haben), *tener sed*, *tener frío* (frieren), *tener calor*, *tener sueño* (müde sein), *tener prisa*, *tener miedo* (Angst haben).',
      },
    ],
    dialog: [
      { sprecher: 'Luis', es: 'Tom, ¿tienes hermanos?', de: 'Tom, hast du Geschwister?' },
      { sprecher: 'Tom', es: 'Sí, tengo una hermana. Tiene veinte años.', de: 'Ja, ich habe eine Schwester. Sie ist zwanzig.' },
      { sprecher: 'Luis', es: '¿Y tú cuántos años tienes?', de: 'Und wie alt bist du?' },
      { sprecher: 'Tom', es: 'Tengo veinticinco. ¿Se dice así?', de: 'Ich bin fünfundzwanzig. Sagt man das so?' },
      { sprecher: 'Luis', es: 'Perfecto. En español tienes años, no eres años.', de: 'Perfekt. Auf Spanisch hast du Jahre, du bist sie nicht.' },
      { sprecher: 'Tom', es: 'Curioso. ¿Y „tengo hambre“ también funciona así?', de: 'Merkwürdig. Und „tengo hambre“ funktioniert auch so?' },
      { sprecher: 'Luis', es: 'Igual. Tengo hambre, tengo sed, tengo prisa.', de: 'Genauso. Ich habe Hunger, Durst, es eilig.' },
      { sprecher: 'Tom', es: 'Pues tengo hambre. ¿Comemos algo?', de: 'Dann habe ich Hunger. Essen wir etwas?' },
    ],
  },

  {
    id: 'grosszahlen',
    niveau: 'A1.1',
    kursNr: 20,
    grammatik: ['Zahlen bis 1.000'],
    wiederholt: ['zahlen', 'tener', 'plural'],
    vorher: ['zahlen'],
    kulturnotiz: 'Im Spanischen trennt der Punkt die Tausender und das Komma die Nachkommastellen – genau wie im Deutschen, anders als im Englischen.',
    titel: 'Zahlen bis 1.000',
    emoji: '💯',
    beschreibung: 'Preise, Jahreszahlen, Hausnummern',
    ziele: [
      'Die Zehner und Hunderter bilden',
      'Preise verstehen und nennen',
      'Die Stolperfallen ciento und veintiuno kennen',
    ],
    items: [
      { es: 'treinta', de: 'dreißig', beispielEs: 'Mi padre tiene treinta y ocho años.', beispielDe: 'Mein Vater ist achtunddreißig.' },
      { es: 'cuarenta', de: 'vierzig', beispielEs: 'El billete cuesta cuarenta euros.', beispielDe: 'Die Fahrkarte kostet vierzig Euro.' },
      { es: 'cincuenta', de: 'fünfzig', beispielEs: 'Hay cincuenta personas en la sala.', beispielDe: 'Es sind fünfzig Personen im Saal.' },
      { es: 'sesenta', de: 'sechzig', beispielEs: 'La abuela tiene sesenta años.', beispielDe: 'Die Großmutter ist sechzig.' },
      { es: 'setenta', de: 'siebzig', beispielEs: 'Setenta euros es demasiado.', beispielDe: 'Siebzig Euro ist zu viel.' },
      { es: 'ochenta', de: 'achtzig', beispielEs: 'El libro tiene ochenta páginas.', beispielDe: 'Das Buch hat achtzig Seiten.' },
      { es: 'noventa', de: 'neunzig', beispielEs: 'Noventa minutos dura el partido.', beispielDe: 'Das Spiel dauert neunzig Minuten.' },
      { es: 'cien', de: 'hundert', beispielEs: 'Necesito cien euros.', beispielDe: 'Ich brauche hundert Euro.' },
      { es: 'ciento', de: 'hundert (mit Rest)', beispielEs: 'Son ciento veinte euros.', beispielDe: 'Das macht hundertzwanzig Euro.' },
      { es: 'doscientos', de: 'zweihundert', beispielEs: 'El vuelo cuesta doscientos euros.', beispielDe: 'Der Flug kostet zweihundert Euro.' },
      { es: 'quinientos', de: 'fünfhundert', beispielEs: 'Quinientos gramos de queso, por favor.', beispielDe: 'Fünfhundert Gramm Käse, bitte.' },
      { es: 'mil', de: 'tausend', beispielEs: 'Mil gracias por tu ayuda.', beispielDe: 'Tausend Dank für deine Hilfe.' },
    ],
    wissen: [
      {
        emoji: '🔟',
        titel: 'Ab dreißig wird getrennt geschrieben',
        text: 'Bis 29 steht alles zusammen: *veintiuno*, *veintidós*. Ab 30 kommt ein *y* dazwischen und alles wird getrennt: *treinta y uno*, *cuarenta y cinco*, *noventa y nueve*. Ein *treintaiuno* gibt es nicht.',
      },
      {
        emoji: '💯',
        titel: 'cien oder ciento',
        text: 'Genau hundert heißt *cien*: *cien euros*, *cien años*. Kommt etwas dazu, wird daraus *ciento*: *ciento uno*, *ciento cincuenta*. Und zwischen Hunderter und Rest steht KEIN *y*: *ciento veinte*, nicht *ciento y veinte*.',
      },
      {
        emoji: '👥',
        titel: 'Hunderter richten sich nach dem Wort',
        text: 'Ab zweihundert passt sich die Zahl an: *doscientos euros*, aber *doscientas personas*. Drei sind unregelmäßig und müssen gelernt werden: *quinientos* (500), *setecientos* (700), *novecientos* (900).',
      },
    ],
    dialog: [
      { sprecher: 'Tom', es: 'Perdona, ¿cuánto cuesta esta chaqueta?', de: 'Entschuldige, was kostet diese Jacke?' },
      { sprecher: 'Carmen', es: 'Ciento veinte euros.', de: 'Hundertzwanzig Euro.' },
      { sprecher: 'Tom', es: '¿Ciento veinte? ¿No se dice cien veinte?', de: 'Ciento veinte? Sagt man nicht cien veinte?' },
      { sprecher: 'Carmen', es: 'Cien solo cuando es exacto. Con algo más, ciento.', de: 'Cien nur, wenn es genau ist. Mit etwas mehr: ciento.' },
      { sprecher: 'Tom', es: 'Entiendo. Es un poco cara. ¿Hay algo de setenta?', de: 'Verstehe. Sie ist etwas teuer. Gibt es etwas für siebzig?' },
      { sprecher: 'Carmen', es: 'Sí, esta cuesta ochenta y cinco.', de: 'Ja, diese kostet fünfundachtzig.' },
      { sprecher: 'Tom', es: 'Ochenta y cinco. ¿Con „y“ en el medio?', de: 'Fünfundachtzig. Mit „y“ in der Mitte?' },
      { sprecher: 'Carmen', es: 'Sí, a partir de treinta siempre lleva y.', de: 'Ja, ab dreißig steht immer ein y.' },
    ],
  },
  {
    id: 'uhrzeit',
    niveau: 'A1.1',
    kursNr: 21,
    grammatik: ['Uhrzeit, Wochentage und Datum'],
    wiederholt: ['grosszahlen', 'ser', 'hay'],
    vorher: ['grosszahlen'],
    kulturnotiz: 'In Spanien isst man um 14 Uhr zu Mittag und um 21 Uhr zu Abend – eine Verabredung „por la tarde“ kann gut 20 Uhr bedeuten.',
    titel: 'Wann? Uhrzeit & Tage',
    emoji: '🕐',
    beschreibung: 'Verabreden – und die spanischen Tageszeiten',
    ziele: [
      'Nach der Uhrzeit fragen und sie sagen',
      'Wochentage und Datum nennen',
      'Verstehen, warum es „es la una“ heißt, aber „son las dos“',
    ],
    items: [
      { es: 'la hora', de: 'die Uhrzeit', beispielEs: '¿Qué hora es, por favor?', beispielDe: 'Wie spät ist es, bitte?' },
      { es: 'es la una', de: 'es ist ein Uhr', beispielEs: 'Ahora es la una en punto.', beispielDe: 'Jetzt ist es genau ein Uhr.' },
      { es: 'son las dos', de: 'es ist zwei Uhr', beispielEs: 'Ya son las dos y media.', beispielDe: 'Es ist schon halb drei.' },
      { es: 'y media', de: 'halb (nach)', beispielEs: 'Quedamos a las ocho y media.', beispielDe: 'Wir treffen uns um halb neun.' },
      { es: 'y cuarto', de: 'Viertel nach', beispielEs: 'El tren sale a las seis y cuarto.', beispielDe: 'Der Zug fährt um Viertel nach sechs.' },
      { es: 'menos cuarto', de: 'Viertel vor', beispielEs: 'Llego a las nueve menos cuarto.', beispielDe: 'Ich komme um Viertel vor neun.' },
      { es: 'el lunes', de: 'der Montag', beispielEs: 'El lunes empiezo el curso.', beispielDe: 'Am Montag fange ich den Kurs an.' },
      { es: 'el sábado', de: 'der Samstag', beispielEs: 'El sábado vamos al cine.', beispielDe: 'Am Samstag gehen wir ins Kino.' },
      { es: 'el fin de semana', de: 'das Wochenende', beispielEs: 'Este fin de semana descanso.', beispielDe: 'Dieses Wochenende ruhe ich mich aus.' },
      { es: 'por la mañana', de: 'morgens', beispielEs: 'Trabajo por la mañana.', beispielDe: 'Ich arbeite morgens.' },
      { es: 'por la tarde', de: 'nachmittags, abends', beispielEs: 'Nos vemos por la tarde.', beispielDe: 'Wir sehen uns am Nachmittag.' },
      { es: 'mañana', de: 'morgen', beispielEs: 'Mañana tengo una reunión.', beispielDe: 'Morgen habe ich ein Treffen.' },
    ],
    wissen: [
      {
        emoji: '1️⃣',
        titel: 'Eins ist Einzahl, alles andere Mehrzahl',
        text: 'Die Uhrzeit steht mit *ser* – und richtet sich nach der Stunde: *Es la una* (eine Stunde), aber *Son las dos*, *Son las siete*. Die *la* und *las* beziehen sich auf *hora* und *horas*, deshalb weiblich.',
      },
      {
        emoji: '⏰',
        titel: 'Erst nach halb wird abgezogen',
        text: 'Bis zur halben Stunde zählt man dazu: *las tres y diez*, *las tres y media*. Danach zieht man von der nächsten Stunde ab: *las cuatro menos veinte*, *las cuatro menos cuarto*. Für „um“ steht *a*: *a las ocho*.',
      },
      {
        emoji: '📅',
        titel: 'Wochentage tragen einen Artikel',
        text: 'Für „am Montag“ sagt man *el lunes*, für „montags“ *los lunes*. Ein *en lunes* gibt es nicht. Die Tage werden kleingeschrieben, und *sábado* und *domingo* bilden den Plural mit *-s*, die übrigen bleiben gleich: *los lunes*.',
      },
    ],
    dialog: [
      { sprecher: 'Ana', es: 'Tom, ¿quedamos el sábado?', de: 'Tom, treffen wir uns am Samstag?' },
      { sprecher: 'Tom', es: 'Vale. ¿A qué hora?', de: 'Gut. Um wie viel Uhr?' },
      { sprecher: 'Ana', es: 'A las ocho y media, por la tarde.', de: 'Um halb neun, am Abend.' },
      { sprecher: 'Tom', es: '¿Las ocho y media es tarde para vosotros?', de: 'Ist halb neun bei euch Abend?' },
      { sprecher: 'Ana', es: 'Aquí la tarde llega hasta las nueve o diez.', de: 'Hier geht der Nachmittag bis neun oder zehn.' },
      { sprecher: 'Tom', es: 'En Alemania eso ya es noche. ¿Y comemos algo?', de: 'In Deutschland ist das schon Nacht. Und essen wir etwas?' },
      { sprecher: 'Ana', es: 'Claro, la cena es a las nueve y media.', de: 'Klar, das Abendessen ist um halb zehn.' },
      { sprecher: 'Tom', es: 'Entonces el sábado a las ocho y media. Apuntado.', de: 'Also Samstag um halb neun. Notiert.' },
    ],
  },

  {
    id: 'einstieg',
    niveau: 'A1.1',
    kursNr: 1,
    grammatik: ['Verwandte Wörter erkennen'],
    wiederholt: [],
    vorher: [],
    kulturnotiz: 'Spanisch ist nach Mandarin die Sprache mit den zweitmeisten Muttersprachlern – rund 500 Millionen Menschen in 21 Ländern.',
    titel: 'Du kannst schon Spanisch',
    emoji: '🚪',
    beschreibung: 'Der Einstieg – und warum du mehr verstehst, als du denkst',
    ziele: [
      'Verwandte Wörter auf Anhieb verstehen',
      'Die zwei häufigsten Endungs-Muster kennen',
      'Wissen, wie dieser Kurs aufgebaut ist',
    ],
    items: [
      { es: 'el hotel', de: 'das Hotel', beispielEs: 'El hotel está en el centro.', beispielDe: 'Das Hotel ist im Zentrum.' },
      { es: 'el restaurante', de: 'das Restaurant', beispielEs: 'Este restaurante es muy bueno.', beispielDe: 'Dieses Restaurant ist sehr gut.' },
      { es: 'la música', de: 'die Musik', beispielEs: 'Me gusta la música española.', beispielDe: 'Ich mag spanische Musik.' },
      { es: 'la familia', de: 'die Familie', beispielEs: 'Mi familia vive en Berlín.', beispielDe: 'Meine Familie wohnt in Berlin.' },
      { es: 'el chocolate', de: 'die Schokolade', beispielEs: 'El chocolate español es famoso.', beispielDe: 'Die spanische Schokolade ist berühmt.' },
      { es: 'el hospital', de: 'das Krankenhaus', beispielEs: 'El hospital está cerca del parque.', beispielDe: 'Das Krankenhaus ist in der Nähe des Parks.' },
      { es: 'la universidad', de: 'die Universität', beispielEs: 'Estudio en la universidad.', beispielDe: 'Ich studiere an der Universität.' },
      { es: 'el animal', de: 'das Tier', beispielEs: 'El perro es un animal fiel.', beispielDe: 'Der Hund ist ein treues Tier.' },
      { es: 'importante', de: 'wichtig', beispielEs: 'Esto es muy importante para mí.', beispielDe: 'Das ist sehr wichtig für mich.' },
      { es: 'natural', de: 'natürlich, naturbelassen', beispielEs: 'Prefiero el zumo natural.', beispielDe: 'Ich bevorzuge naturbelassenen Saft.' },
      { es: 'la información', de: 'die Information', beispielEs: 'Necesito más información.', beispielDe: 'Ich brauche mehr Informationen.' },
      { es: 'la posibilidad', de: 'die Möglichkeit', beispielEs: 'Hay una posibilidad.', beispielDe: 'Es gibt eine Möglichkeit.' },
    ],
    wissen: [
      {
        emoji: '🎁',
        titel: 'Tausende Wörter bekommst du geschenkt',
        text: 'Spanisch und Deutsch teilen sich einen riesigen Vorrat lateinischer Wörter. *hotel*, *restaurante*, *hospital*, *animal*, *natural* – die musst du nicht lernen, nur aussprechen. Wer Englisch kann, versteht noch mehr.',
      },
      {
        emoji: '🔤',
        titel: 'Zwei Endungen, zwei Regeln',
        text: 'Deutsch *-tion* wird spanisch *-ción*: *Information → información*, *Nation → nación*. Deutsch *-tät* wird *-dad*: *Universität → universidad*, *Möglichkeit → posibilidad*. Beide Gruppen sind **immer weiblich**: *la información*, *la universidad*.',
      },
      {
        emoji: '🧭',
        titel: 'So läuft dieser Kurs',
        text: 'Jede Lektion bringt neue Wörter, einen Dialog und Übungen – und holt drei alte Wörter zurück, damit nichts verloren geht. Ab 80 % richtigen Antworten sitzt eine Lektion. Darunter empfiehlt die App eine zweite Runde, blockiert dich aber nicht.',
      },
    ],
    dialog: [
      { sprecher: 'Ana', es: 'Hola, soy Ana. ¿Hablas español?', de: 'Hallo, ich bin Ana. Sprichst du Spanisch?' },
      { sprecher: 'Tom', es: 'No, no hablo español. Solo alemán.', de: 'Nein, ich spreche kein Spanisch. Nur Deutsch.' },
      { sprecher: 'Ana', es: '¿Y entiendes „hotel“, „restaurante“, „hospital“?', de: 'Und verstehst du „hotel“, „restaurante“, „hospital“?' },
      { sprecher: 'Tom', es: 'Sí, claro. Eso es fácil.', de: 'Ja, klar. Das ist einfach.' },
      { sprecher: 'Ana', es: 'Entonces ya entiendes cientos de palabras.', de: 'Dann verstehst du schon hunderte Wörter.' },
      { sprecher: 'Tom', es: '¿Y „información“ es como „Information“?', de: 'Und „información“ ist wie „Information“?' },
      { sprecher: 'Ana', es: 'Exacto. La terminación cambia, la palabra no.', de: 'Genau. Die Endung ändert sich, das Wort nicht.' },
      { sprecher: 'Tom', es: 'Vale, entonces empezamos. ¡Es importante!', de: 'Gut, dann fangen wir an. Das ist wichtig!' },
    ],
  },
  {
    id: 'abschluss1',
    niveau: 'A1.1',
    kursNr: 22,
    grammatik: ['Redemittel für das Gespräch'],
    wiederholt: ['uhrzeit', 'estar', 'tener', 'hay', 'verneinung'],
    vorher: ['uhrzeit'],
    kulturnotiz: '„Vale“ ist in Spanien das meistgesagte Wort des Alltags – es heißt okay, einverstanden, verstanden und alles dazwischen.',
    titel: 'Modul 1 geschafft',
    emoji: '🏁',
    beschreibung: 'Die Wendungen, die jedes Gespräch am Laufen halten',
    ziele: [
      'Ein Gespräch in Gang halten',
      'Um Wiederholung bitten, ohne zu stocken',
      'Die Grammatik aus Modul 1 verbinden',
    ],
    items: [
      { es: 'encantado', de: 'sehr erfreut', beispielEs: 'Encantado, soy Tom.', beispielDe: 'Sehr erfreut, ich bin Tom.' },
      { es: '¿qué tal?', de: 'wie geht’s?', beispielEs: 'Hola Ana, ¿qué tal?', beispielDe: 'Hallo Ana, wie geht’s?' },
      { es: 'más o menos', de: 'so lala', beispielEs: 'Hoy estoy más o menos.', beispielDe: 'Heute geht es mir so lala.' },
      { es: 'de nada', de: 'gern geschehen', beispielEs: 'Gracias. – De nada.', beispielDe: 'Danke. – Gern geschehen.' },
      { es: 'lo siento', de: 'es tut mir leid', beispielEs: 'Lo siento, tengo prisa.', beispielDe: 'Es tut mir leid, ich habe es eilig.' },
      { es: 'no entiendo', de: 'ich verstehe nicht', beispielEs: 'Perdona, no entiendo nada.', beispielDe: 'Entschuldige, ich verstehe nichts.' },
      { es: '¿puedes repetir?', de: 'kannst du wiederholen?', beispielEs: 'Más despacio, ¿puedes repetir?', beispielDe: 'Langsamer, kannst du wiederholen?' },
      { es: 'un momento', de: 'einen Moment', beispielEs: 'Un momento, por favor.', beispielDe: 'Einen Moment, bitte.' },
      { es: 'claro', de: 'klar', beispielEs: 'Claro, no hay problema.', beispielDe: 'Klar, kein Problem.' },
      { es: 'vale', de: 'okay', beispielEs: 'Vale, nos vemos el sábado.', beispielDe: 'Okay, wir sehen uns am Samstag.' },
      { es: 'depende', de: 'es kommt darauf an', beispielEs: 'Depende del tiempo que tenga.', beispielDe: 'Es kommt darauf an, wie viel Zeit ich habe.' },
      { es: '¿cómo se dice?', de: 'wie sagt man?', beispielEs: '¿Cómo se dice esto en español?', beispielDe: 'Wie sagt man das auf Spanisch?' },
    ],
    wissen: [
      {
        emoji: '🛟',
        titel: 'Die vier Sätze, die dich retten',
        text: 'Wer diese vier kann, bleibt in jedem Gespräch: *No entiendo.* *¿Puedes repetir, por favor?* *Más despacio.* *¿Cómo se dice … en español?* Sie sind wichtiger als hundert Vokabeln – denn sie halten das Gespräch am Leben, statt es zu beenden.',
      },
      {
        emoji: '🧩',
        titel: 'Was du jetzt bauen kannst',
        text: 'Aus Modul 1 hast du vier Bausteine: *ser* (wer ich bin), *estar* (wo ich bin, wie es mir geht), *tener* (was ich habe, wie alt ich bin) und *hay* (was es gibt). Damit: *Soy Tom, tengo veinticinco años, estoy en Madrid y aquí hay mucha gente.*',
      },
      {
        emoji: '🇪🇸',
        titel: 'Vale, das Allzweckwort',
        text: '*Vale* heißt okay, einverstanden, verstanden, gut. Man hört es in Spanien im Minutentakt – in Lateinamerika sagt man dafür eher *bueno*, *dale* oder *listo*. Ein einziges Wort verrät also schon, wo jemand herkommt.',
      },
    ],
    dialog: [
      { sprecher: 'Ana', es: 'Tom, ¿qué tal el primer módulo?', de: 'Tom, wie war das erste Modul?' },
      { sprecher: 'Tom', es: 'Más o menos. A veces no entiendo nada.', de: 'So lala. Manchmal verstehe ich nichts.' },
      { sprecher: 'Ana', es: 'Es normal. ¿Sabes pedir una repetición?', de: 'Das ist normal. Kannst du um Wiederholung bitten?' },
      { sprecher: 'Tom', es: 'Sí: „¿Puedes repetir, por favor?“ Y „más despacio“.', de: 'Ja: „Kannst du wiederholen, bitte?“ Und „langsamer“.' },
      { sprecher: 'Ana', es: 'Perfecto. Con eso nunca te quedas atascado.', de: 'Perfekt. Damit bleibst du nie stecken.' },
      { sprecher: 'Tom', es: 'Vale. Soy Tom, tengo veinticinco años y estoy en Madrid.', de: 'Okay. Ich bin Tom, ich bin fünfundzwanzig und ich bin in Madrid.' },
      { sprecher: 'Ana', es: '¡Cuatro verbos en una frase! Eso es el módulo entero.', de: 'Vier Verben in einem Satz! Das ist das ganze Modul.' },
      { sprecher: 'Tom', es: 'Entonces estoy listo para el módulo dos.', de: 'Dann bin ich bereit für Modul zwei.' },
    ],
  },

  // ============ MODUL 2: Im Alltag ============
  {
    id: 'erirverben',
    niveau: 'A1.2',
    kursNr: 23,
    grammatik: ['Regelmäßige Verben auf -er und -ir'],
    wiederholt: ['arverben', 'tener', 'uhrzeit'],
    vorher: ['arverben'],
    kulturnotiz: 'Die drei Verbgruppen -ar, -er und -ir decken alle spanischen Verben ab. Wer die neun Endungen kann, beugt jedes regelmäßige Verb.',
    titel: 'Verben auf -er und -ir',
    emoji: '🍽️',
    beschreibung: 'Die zweite und dritte Verbgruppe',
    ziele: [
      'Die Endungen von -er und -ir unterscheiden',
      'Über Essen, Wohnen und Lesen sprechen',
      'Erkennen, wo beide Gruppen gleich sind',
    ],
    items: [
      { es: 'comer', de: 'essen', beispielEs: 'Comemos a las dos en España.', beispielDe: 'In Spanien essen wir um zwei.' },
      { es: 'beber', de: 'trinken', beispielEs: 'Bebo mucha agua al día.', beispielDe: 'Ich trinke viel Wasser am Tag.' },
      { es: 'leer', de: 'lesen', beispielEs: 'Leo un libro cada mes.', beispielDe: 'Ich lese jeden Monat ein Buch.' },
      { es: 'aprender', de: 'lernen', beispielEs: 'Aprendo español desde enero.', beispielDe: 'Ich lerne seit Januar Spanisch.' },
      { es: 'comprender', de: 'begreifen', beispielEs: 'Ahora comprendo la regla.', beispielDe: 'Jetzt begreife ich die Regel.' },
      { es: 'vender', de: 'verkaufen', beispielEs: 'Venden fruta en la esquina.', beispielDe: 'An der Ecke verkaufen sie Obst.' },
      { es: 'vivir', de: 'wohnen, leben', beispielEs: 'Vivo en un piso pequeño.', beispielDe: 'Ich wohne in einer kleinen Wohnung.' },
      { es: 'escribir', de: 'schreiben', beispielEs: 'Escribo un mensaje a mi hermana.', beispielDe: 'Ich schreibe meiner Schwester eine Nachricht.' },
      { es: 'abrir', de: 'öffnen', beispielEs: 'Abren la tienda a las nueve.', beispielDe: 'Sie öffnen den Laden um neun.' },
      { es: 'recibir', de: 'bekommen', beispielEs: 'Recibo tu correo mañana.', beispielDe: 'Ich bekomme deine Mail morgen.' },
      { es: 'subir', de: 'hinaufgehen', beispielEs: 'Subimos por la escalera.', beispielDe: 'Wir gehen die Treppe hinauf.' },
      { es: 'decidir', de: 'entscheiden', beispielEs: 'Decides tú, me da igual.', beispielDe: 'Du entscheidest, mir ist es egal.' },
    ],
    wissen: [
      {
        emoji: '🍴',
        titel: 'Die -er-Gruppe',
        text: 'Streiche *-er* und hänge an: *com-o*, *com-es*, *com-e*, *com-emos*, *com-éis*, *com-en*. Bis auf *nosotros* und *vosotros* sind es dieselben Vokale wie bei *-ar*, nur mit *e* statt *a*.',
      },
      {
        emoji: '🏠',
        titel: 'Die -ir-Gruppe – fast identisch',
        text: '*viv-o*, *viv-es*, *viv-e*, *viv-imos*, *viv-ís*, *viv-en*. Vier der sechs Formen sind mit *-er* identisch! Nur *nosotros* und *vosotros* unterscheiden sich: *comemos* gegen *vivimos*, *coméis* gegen *vivís*.',
      },
      {
        emoji: '🧠',
        titel: 'Was du dir wirklich merken musst',
        text: 'Statt drei Tabellen zu lernen, merk dir: Die *ich*-Form endet in allen drei Gruppen auf *-o*. Und *-er* und *-ir* trennen sich nur in zwei von sechs Formen. Das ist deutlich weniger, als es aussieht.',
      },
    ],
    dialog: [
      { sprecher: 'Ana', es: 'Tom, ¿dónde vives ahora?', de: 'Tom, wo wohnst du jetzt?' },
      { sprecher: 'Tom', es: 'Vivo cerca del centro. Y como en casa todos los días.', de: 'Ich wohne in der Nähe des Zentrums. Und ich esse jeden Tag zu Hause.' },
      { sprecher: 'Ana', es: '¿Y a qué hora comes?', de: 'Und um wie viel Uhr isst du?' },
      { sprecher: 'Tom', es: 'A la una. Aquí coméis muy tarde.', de: 'Um eins. Hier esst ihr sehr spät.' },
      { sprecher: 'Ana', es: 'Comemos a las dos o las tres. ¿Ya lo comprendes?', de: 'Wir essen um zwei oder drei. Verstehst du es schon?' },
      { sprecher: 'Tom', es: 'Comprendo, pero mi estómago no.', de: 'Ich verstehe es, aber mein Magen nicht.' },
      { sprecher: 'Ana', es: 'Escribe la hora en el móvil. Así aprendes rápido.', de: 'Schreib die Uhrzeit ins Handy. So lernst du schnell.' },
      { sprecher: 'Tom', es: 'Buena idea. Decido comer a las dos desde mañana.', de: 'Gute Idee. Ich entscheide mich, ab morgen um zwei zu essen.' },
    ],
  },
  {
    id: 'tagesablauf',
    niveau: 'A1.2',
    kursNr: 25,
    grammatik: ['Reflexive Verben'],
    wiederholt: ['erirverben', 'hoeflichkeit', 'uhrzeit'],
    vorher: ['erirverben'],
    kulturnotiz: 'Die Siesta ist kein Nickerchen für alle: In Städten arbeitet man durch, aber viele kleine Läden schließen zwischen 14 und 17 Uhr.',
    titel: 'Der Tagesablauf',
    emoji: '⏰',
    beschreibung: 'Aufstehen, duschen, losgehen – mit sich selbst',
    ziele: [
      'Den eigenen Tag beschreiben',
      'Reflexive Verben richtig bilden',
      'Erkennen, wann ein Verb reflexiv wird',
    ],
    items: [
      { es: 'levantarse', de: 'aufstehen', beispielEs: 'Me levanto a las siete.', beispielDe: 'Ich stehe um sieben auf.' },
      { es: 'despertarse', de: 'aufwachen', beispielEs: 'Me despierto muy temprano.', beispielDe: 'Ich wache sehr früh auf.' },
      { es: 'ducharse', de: 'duschen', beispielEs: 'Se ducha antes de desayunar.', beispielDe: 'Er duscht vor dem Frühstück.' },
      { es: 'vestirse', de: 'sich anziehen', beispielEs: 'Me visto en cinco minutos.', beispielDe: 'Ich ziehe mich in fünf Minuten an.' },
      { es: 'llamarse', de: 'heißen', beispielEs: 'Mi vecina se llama Rosa.', beispielDe: 'Meine Nachbarin heißt Rosa.' },
      { es: 'acostarse', de: 'schlafen gehen', beispielEs: 'Nos acostamos a medianoche.', beispielDe: 'Wir gehen um Mitternacht schlafen.' },
      { es: 'desayunar', de: 'frühstücken', beispielEs: 'Desayuno café y tostada.', beispielDe: 'Ich frühstücke Kaffee und Toast.' },
      { es: 'salir de casa', de: 'aus dem Haus gehen', beispielEs: 'Salgo de casa a las ocho.', beispielDe: 'Ich gehe um acht aus dem Haus.' },
      { es: 'volver', de: 'zurückkommen', beispielEs: 'Vuelvo del trabajo a las seis.', beispielDe: 'Ich komme um sechs von der Arbeit zurück.' },
      { es: 'temprano', de: 'früh', beispielEs: 'Los lunes me levanto temprano.', beispielDe: 'Montags stehe ich früh auf.' },
      { es: 'tarde', de: 'spät', beispielEs: 'Hoy llego tarde otra vez.', beispielDe: 'Heute komme ich wieder spät.' },
      { es: 'luego', de: 'danach', beispielEs: 'Desayuno y luego salgo.', beispielDe: 'Ich frühstücke und gehe danach los.' },
    ],
    wissen: [
      {
        emoji: '🪞',
        titel: 'Das Pronomen steht vor dem Verb',
        text: 'Reflexive Verben tragen im Wörterbuch ein *-se*: *levantarse*. Beim Beugen wandert es nach vorn und passt sich an: *me levanto*, *te levantas*, *se levanta*, *nos levantamos*, *os levantáis*, *se levantan*.',
      },
      {
        emoji: '🔀',
        titel: 'Dasselbe Verb, mit und ohne',
        text: 'Das *se* sagt, dass die Handlung auf einen selbst zurückfällt. *Despierto a mi hijo* – ich wecke meinen Sohn. *Me despierto* – ich wache auf. *Lavo el coche* gegen *me lavo* funktioniert genauso.',
      },
      {
        emoji: '📋',
        titel: 'Ein Tag am Stück',
        text: 'Mit *primero*, *luego*, *después* und *por fin* reihst du auf: *Primero me levanto, luego desayuno, después salgo de casa y por fin llego al trabajo.* Damit erzählst du einen ganzen Tag.',
      },
    ],
    dialog: [
      { sprecher: 'Carmen', es: 'Tom, ¿a qué hora te levantas?', de: 'Tom, wann stehst du auf?' },
      { sprecher: 'Tom', es: 'Me levanto a las siete. ¿Y tú?', de: 'Ich stehe um sieben auf. Und du?' },
      { sprecher: 'Carmen', es: 'Yo me despierto a las seis, pero me levanto más tarde.', de: 'Ich wache um sechs auf, stehe aber später auf.' },
      { sprecher: 'Tom', es: '¿Hay diferencia entre despertarse y levantarse?', de: 'Gibt es einen Unterschied zwischen despertarse und levantarse?' },
      { sprecher: 'Carmen', es: 'Sí: primero abres los ojos, luego sales de la cama.', de: 'Ja: Erst machst du die Augen auf, dann steigst du aus dem Bett.' },
      { sprecher: 'Tom', es: 'Entiendo. Luego me ducho y desayuno rápido.', de: 'Verstehe. Danach dusche ich und frühstücke schnell.' },
      { sprecher: 'Carmen', es: '¿Y a qué hora te acuestas?', de: 'Und wann gehst du schlafen?' },
      { sprecher: 'Tom', es: 'Muy tarde. Por eso me despierto cansado.', de: 'Sehr spät. Deshalb wache ich müde auf.' },
    ],
  },

  {
    id: 'zuhause',
    niveau: 'A1.2',
    kursNr: 26,
    grammatik: ['Wohnen beschreiben mit hay und estar'],
    wiederholt: ['hay', 'tagesablauf', 'artikel'],
    vorher: ['tagesablauf'],
    kulturnotiz: 'In Spanien wohnt man meist im „piso“, einer Etagenwohnung. Ein „casa“ mit Garten ist in Städten die Ausnahme.',
    titel: 'Zu Hause',
    emoji: '🏠',
    beschreibung: 'Die Wohnung, die Räume, die Möbel',
    ziele: [
      'Die eigene Wohnung beschreiben',
      'Räume und Möbel benennen',
      'hay und estar im Zusammenspiel üben',
    ],
    items: [
      { es: 'el piso', de: 'die Wohnung', beispielEs: 'Mi piso tiene tres habitaciones.', beispielDe: 'Meine Wohnung hat drei Zimmer.' },
      { es: 'la habitación', de: 'das Zimmer', beispielEs: 'Mi habitación es pequeña pero clara.', beispielDe: 'Mein Zimmer ist klein, aber hell.' },
      { es: 'la cocina', de: 'die Küche', beispielEs: 'En la cocina hay una ventana grande.', beispielDe: 'In der Küche gibt es ein großes Fenster.' },
      { es: 'el baño', de: 'das Bad', beispielEs: 'El baño está al final del pasillo.', beispielDe: 'Das Bad ist am Ende des Flurs.' },
      { es: 'el salón', de: 'das Wohnzimmer', beispielEs: 'Vemos la tele en el salón.', beispielDe: 'Wir sehen im Wohnzimmer fern.' },
      { es: 'la cama', de: 'das Bett', beispielEs: 'La cama está debajo de la ventana.', beispielDe: 'Das Bett steht unter dem Fenster.' },
      { es: 'la silla', de: 'der Stuhl', beispielEs: 'Hay cuatro sillas en la cocina.', beispielDe: 'In der Küche stehen vier Stühle.' },
      { es: 'el armario', de: 'der Schrank', beispielEs: 'La ropa está en el armario.', beispielDe: 'Die Kleidung ist im Schrank.' },
      { es: 'la nevera', de: 'der Kühlschrank', beispielEs: 'No hay nada en la nevera.', beispielDe: 'Im Kühlschrank ist nichts.' },
      { es: 'el balcón', de: 'der Balkon', beispielEs: 'Desayunamos en el balcón.', beispielDe: 'Wir frühstücken auf dem Balkon.' },
      { es: 'el alquiler', de: 'die Miete', beispielEs: 'El alquiler cuesta seiscientos euros.', beispielDe: 'Die Miete kostet sechshundert Euro.' },
      { es: 'el vecino', de: 'der Nachbar', beispielEs: 'Mi vecino es muy simpático.', beispielDe: 'Mein Nachbar ist sehr nett.' },
    ],
    wissen: [
      {
        emoji: '🔄',
        titel: 'Erst was es gibt, dann wo es steht',
        text: 'Beim Beschreiben wechselst du ständig: *En mi piso hay un balcón* (es gibt einen) und *El balcón está a la izquierda* (wo er ist). Ein Zimmer beschreibst du fast immer in dieser Reihenfolge – erst vorstellen, dann verorten.',
      },
      {
        emoji: '📐',
        titel: 'Wo genau?',
        text: 'Zu den Präpositionen aus Lektion 18 kommen zwei senkrechte dazu: *encima de* (auf, über) und *debajo de* (unter). *El libro está encima de la mesa.* *Los zapatos están debajo de la cama.*',
      },
      {
        emoji: '🇪🇸',
        titel: 'piso, apartamento oder casa',
        text: 'Der *piso* ist die normale Etagenwohnung in Spanien. Ein *apartamento* ist kleiner, oft eine Ferienwohnung. *Casa* meint eigentlich das Haus – aber *voy a casa* heißt einfach „ich gehe nach Hause“, egal wo man wohnt.',
      },
    ],
    dialog: [
      { sprecher: 'Tom', es: 'Ana, ¿cómo es tu piso?', de: 'Ana, wie ist deine Wohnung?' },
      { sprecher: 'Ana', es: 'Es pequeño, pero hay un balcón bonito.', de: 'Sie ist klein, aber es gibt einen schönen Balkon.' },
      { sprecher: 'Tom', es: '¿Y dónde está el balcón?', de: 'Und wo ist der Balkon?' },
      { sprecher: 'Ana', es: 'Está al lado de la cocina. Desayuno allí en verano.', de: 'Er ist neben der Küche. Im Sommer frühstücke ich dort.' },
      { sprecher: 'Tom', es: '¿Cuántas habitaciones hay?', de: 'Wie viele Zimmer gibt es?' },
      { sprecher: 'Ana', es: 'Dos: mi habitación y la de Carmen. Y un baño.', de: 'Zwei: mein Zimmer und Carmens. Und ein Bad.' },
      { sprecher: 'Tom', es: '¿El alquiler es caro en el centro?', de: 'Ist die Miete im Zentrum teuer?' },
      { sprecher: 'Ana', es: 'Bastante. Por eso vivimos dos en el piso.', de: 'Ziemlich. Deshalb wohnen wir zu zweit in der Wohnung.' },
    ],
  },
  {
    id: 'familie',
    niveau: 'A1.2',
    kursNr: 27,
    grammatik: ['Die Possessivbegleiter'],
    wiederholt: ['tener', 'zuhause', 'ser'],
    vorher: ['tener'],
    kulturnotiz: 'Spanier tragen zwei Nachnamen: erst den des Vaters, dann den der Mutter. Beim Heiraten ändert sich nichts daran.',
    titel: 'Die Familie',
    emoji: '👨‍👩‍👧',
    beschreibung: 'Mein, dein, unser – und wer zur Familie gehört',
    ziele: [
      'Die Familienmitglieder benennen',
      'Besitz mit mi, tu, su ausdrücken',
      'Verstehen, warum su vieldeutig ist',
    ],
    items: [
      { es: 'los padres', de: 'die Eltern', beispielEs: 'Mis padres viven en Múnich.', beispielDe: 'Meine Eltern wohnen in München.' },
      { es: 'la madre', de: 'die Mutter', beispielEs: 'Mi madre cocina muy bien.', beispielDe: 'Meine Mutter kocht sehr gut.' },
      { es: 'el padre', de: 'der Vater', beispielEs: 'Su padre trabaja en un banco.', beispielDe: 'Sein Vater arbeitet in einer Bank.' },
      { es: 'el hijo', de: 'der Sohn', beispielEs: 'Tienen un hijo de diez años.', beispielDe: 'Sie haben einen zehnjährigen Sohn.' },
      { es: 'la hija', de: 'die Tochter', beispielEs: 'Su hija estudia en Madrid.', beispielDe: 'Ihre Tochter studiert in Madrid.' },
      { es: 'el abuelo', de: 'der Großvater', beispielEs: 'Mi abuelo tiene ochenta años.', beispielDe: 'Mein Großvater ist achtzig.' },
      { es: 'la abuela', de: 'die Großmutter', beispielEs: 'La abuela vive con nosotros.', beispielDe: 'Die Großmutter wohnt bei uns.' },
      { es: 'el tío', de: 'der Onkel', beispielEs: 'Mi tío es de Valencia.', beispielDe: 'Mein Onkel ist aus Valencia.' },
      { es: 'el primo', de: 'der Cousin', beispielEs: 'Mis primos llegan el domingo.', beispielDe: 'Meine Cousins kommen am Sonntag.' },
      { es: 'mi', de: 'mein', beispielEs: 'Mi hermana se llama Lena.', beispielDe: 'Meine Schwester heißt Lena.' },
      { es: 'tu', de: 'dein', beispielEs: '¿Cómo están tus padres?', beispielDe: 'Wie geht es deinen Eltern?' },
      { es: 'nuestro', de: 'unser', beispielEs: 'Nuestra casa es antigua.', beispielDe: 'Unser Haus ist alt.' },
    ],
    wissen: [
      {
        emoji: '👤',
        titel: 'Sie richten sich nach dem Ding, nicht nach dir',
        text: '*mi*, *tu* und *su* haben nur eine Mehrzahlform: *mi hermano*, *mis hermanos*. Sie fragen nicht, ob DU männlich bist, sondern wie viele Dinge es sind. *Nuestro* ist die Ausnahme und passt sich ganz an: *nuestro piso*, *nuestra casa*, *nuestros hijos*.',
      },
      {
        emoji: '❓',
        titel: 'su kann fünf Dinge heißen',
        text: '*su* heißt sein, ihr, Ihr, ihr (Mehrzahl) – je nach Zusammenhang. *Su padre* kann also der Vater von ihm, ihr, Ihnen oder von mehreren sein. Wenn es unklar wird, sagt man deutlicher: *el padre de Ana*.',
      },
      {
        emoji: '📛',
        titel: 'Zwei Nachnamen',
        text: 'Ana García López heißt so, weil ihr Vater García und ihre Mutter López heißt. Bei der Heirat ändert sich nichts – Namensänderungen kennt Spanien nicht. Angesprochen wird sie mit dem ersten: *señora García*.',
      },
    ],
    dialog: [
      { sprecher: 'Luis', es: 'Tom, ¿tienes familia aquí en España?', de: 'Tom, hast du hier in Spanien Familie?' },
      { sprecher: 'Tom', es: 'No, mis padres y mi hermana están en Alemania.', de: 'Nein, meine Eltern und meine Schwester sind in Deutschland.' },
      { sprecher: 'Luis', es: 'Mi familia es grande. Tengo cuatro primos.', de: 'Meine Familie ist groß. Ich habe vier Cousins.' },
      { sprecher: 'Tom', es: '¿Y tus abuelos? ¿Viven cerca?', de: 'Und deine Großeltern? Wohnen sie in der Nähe?' },
      { sprecher: 'Luis', es: 'Mi abuela vive con nosotros. Su casa es nuestra casa.', de: 'Meine Großmutter wohnt bei uns. Ihr Haus ist unser Haus.' },
      { sprecher: 'Tom', es: 'Una pregunta: „su casa“ ¿es de ella o de vosotros?', de: 'Eine Frage: „su casa“ – ist das ihres oder eures?' },
      { sprecher: 'Luis', es: 'De ella. Si no está claro, decimos „la casa de mi abuela“.', de: 'Ihres. Wenn es unklar ist, sagen wir „das Haus meiner Großmutter“.' },
      { sprecher: 'Tom', es: 'Vale, entonces „su“ es cómodo pero peligroso.', de: 'Gut, „su“ ist also bequem, aber gefährlich.' },
    ],
  },

  {
    id: 'beschreiben',
    niveau: 'A1.2',
    kursNr: 28,
    grammatik: ['Adjektive angleichen und stellen'],
    wiederholt: ['familie', 'plural', 'seroestar'],
    vorher: ['familie'],
    kulturnotiz: 'Anders als im Deutschen steht das Adjektiv fast immer HINTER dem Wort: „un coche rojo“, nicht „un rojo coche“.',
    titel: 'Farben & Beschreiben',
    emoji: '🎨',
    beschreibung: 'Wie Dinge und Menschen aussehen',
    ziele: [
      'Farben und Eigenschaften nennen',
      'Adjektive an Geschlecht und Zahl anpassen',
      'Die richtige Stellung im Satz treffen',
    ],
    items: [
      { es: 'rojo', de: 'rot', beispielEs: 'Tengo una bici roja.', beispielDe: 'Ich habe ein rotes Fahrrad.' },
      { es: 'azul', de: 'blau', beispielEs: 'El cielo está muy azul hoy.', beispielDe: 'Der Himmel ist heute sehr blau.' },
      { es: 'verde', de: 'grün', beispielEs: 'Sus ojos son verdes.', beispielDe: 'Ihre Augen sind grün.' },
      { es: 'negro', de: 'schwarz', beispielEs: 'Llevo una chaqueta negra.', beispielDe: 'Ich trage eine schwarze Jacke.' },
      { es: 'blanco', de: 'weiß', beispielEs: 'Las paredes son blancas.', beispielDe: 'Die Wände sind weiß.' },
      { es: 'amarillo', de: 'gelb', beispielEs: 'El taxi amarillo espera fuera.', beispielDe: 'Das gelbe Taxi wartet draußen.' },
      { es: 'grande', de: 'groß', beispielEs: 'Vivimos en una ciudad grande.', beispielDe: 'Wir wohnen in einer großen Stadt.' },
      { es: 'pequeño', de: 'klein', beispielEs: 'Es un problema pequeño.', beispielDe: 'Das ist ein kleines Problem.' },
      { es: 'nuevo', de: 'neu', beispielEs: 'Necesito zapatos nuevos.', beispielDe: 'Ich brauche neue Schuhe.' },
      { es: 'viejo', de: 'alt', beispielEs: 'Este coche ya está viejo.', beispielDe: 'Dieses Auto ist schon alt.' },
      { es: 'bonito', de: 'hübsch', beispielEs: 'Qué bonita es esta plaza.', beispielDe: 'Wie hübsch dieser Platz ist.' },
      { es: 'largo', de: 'lang', beispielEs: 'Tiene el pelo muy largo.', beispielDe: 'Sie hat sehr lange Haare.' },
    ],
    wissen: [
      {
        emoji: '➡️',
        titel: 'Das Adjektiv kommt danach',
        text: 'Im Deutschen sagst du „ein rotes Auto“, im Spanischen *un coche rojo*. Die Umkehrung ist die Regel, nicht die Ausnahme: *una casa grande*, *un libro nuevo*, *el pelo largo*.',
      },
      {
        emoji: '🔗',
        titel: 'Es passt sich zweifach an',
        text: 'Adjektive auf *-o* wechseln zu *-a* und bilden die Mehrzahl: *rojo, roja, rojos, rojas*. Solche auf *-e* oder Konsonant kennen kein Geschlecht, nur die Zahl: *verde, verdes*, *azul, azules*.',
      },
      {
        emoji: '↔️',
        titel: 'Wenn die Stellung die Bedeutung ändert',
        text: 'Ein paar Adjektive stehen vorn und bedeuten dann etwas anderes: *un amigo viejo* ist ein alter Mann, *un viejo amigo* ein langjähriger Freund. *Un coche nuevo* ist fabrikneu, *un nuevo coche* nur neu für dich.',
      },
    ],
    dialog: [
      { sprecher: 'Ana', es: 'Tom, ¿de qué color es tu bici?', de: 'Tom, welche Farbe hat dein Fahrrad?' },
      { sprecher: 'Tom', es: 'Es roja. Bueno, una bici roja y bastante vieja.', de: 'Es ist rot. Also, ein rotes und ziemlich altes Fahrrad.' },
      { sprecher: 'Ana', es: 'Dices „bici roja“, no „roja bici“. Muy bien.', de: 'Du sagst „bici roja“, nicht „roja bici“. Sehr gut.' },
      { sprecher: 'Tom', es: 'Sí, el adjetivo va detrás. ¿Siempre?', de: 'Ja, das Adjektiv steht dahinter. Immer?' },
      { sprecher: 'Ana', es: 'Casi siempre. A veces delante cambia el sentido.', de: 'Fast immer. Manchmal ändert es vorn den Sinn.' },
      { sprecher: 'Tom', es: '¿Como „un viejo amigo“?', de: 'Wie „un viejo amigo“?' },
      { sprecher: 'Ana', es: 'Exacto: un amigo de hace años, no un amigo mayor.', de: 'Genau: ein Freund seit Jahren, kein alter Freund.' },
      { sprecher: 'Tom', es: 'Entonces eres una vieja amiga. ¿O amiga vieja?', de: 'Dann bist du eine langjährige Freundin. Oder eine alte Freundin?' },
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

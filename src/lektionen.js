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

  // ============ NEU: Gebiet "Erste Schritte" vervollständigen ============
  {
    id: 'woher',
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
]

// Die Module der Sprach-Reise: Jedes Modul bündelt Lektionen zu einem Thema.
// "kommtBald"-Module zeigen, wohin die Reise geht (noch ohne Inhalt).
export const MODULE = [
  {
    id: 'm1',
    titel: 'Erste Schritte',
    emoji: '🌱',
    beschreibung: 'Ankommen in der Sprache – ohne Grammatik, nur Sprechen',
    farbe: '#7d8c5c', // Olive
    lektionen: ['begruessung', 'vorstellen', 'woher', 'alphabet'],
  },
  {
    id: 'm2',
    titel: 'Im Alltag',
    emoji: '☕',
    beschreibung: 'Ein ganz normaler Tag auf Spanisch',
    farbe: '#ff6c00', // Habloo-Orange
    lektionen: ['zahlen', 'hoeflichkeit', 'cafe', 'einkaufen', 'wetter'],
  },
  {
    id: 'm3',
    titel: 'Unter Menschen',
    emoji: '👋',
    beschreibung: 'Der obere Weg: über dich und andere sprechen',
    farbe: '#c96f4a', // Terrakotta
    lektionen: [],
    kommtBald: true,
    geplant: ['Familie', 'Aussehen & Charakter', 'Hobbys', 'Verabreden', 'Gefühle'],
  },
  {
    id: 'm4',
    titel: 'Unterwegs',
    emoji: '🧳',
    beschreibung: 'Der untere Weg: raus aus dem Haus',
    farbe: '#c9a961', // Sand, etwas dunkler fuer Kontrast
    lektionen: ['essen', 'unterwegs'],
    geplant: ['Bus, Zug & Taxi', 'Im Hotel', 'Beim Arzt', 'Notfälle'],
  },
  {
    id: 'm5',
    titel: 'Erzählen',
    emoji: '📖',
    beschreibung: 'Wo beide Wege zusammenlaufen – die Vergangenheit',
    farbe: '#7d3350', // Wein
    lektionen: [],
    kommtBald: true,
    geplant: ['Gestern & letzte Woche', 'Der Urlaub', 'Früher war das so', 'Eine Geschichte erzählen', 'Meinungen sagen'],
  },
  {
    id: 'm6',
    titel: 'An der Küste',
    emoji: '🌊',
    beschreibung: 'Ein Abstecher: Spanien und Lateinamerika',
    farbe: '#4a9d9c', // Meer
    lektionen: [],
    kommtBald: true,
    geplant: ['Feste & Traditionen', 'Essen der Regionen', 'Spanisch in Amerika', 'Redewendungen'],
  },
  {
    id: 'm7',
    titel: 'Arbeit & Pläne',
    emoji: '💼',
    beschreibung: 'Das letzte Gebiet: Zukunft und Berufliches',
    farbe: '#5b7596', // Blaugrau
    lektionen: [],
    kommtBald: true,
    geplant: ['Beruf & Studium', 'Termine machen', 'Telefonieren', 'Pläne schmieden', 'Höflich schreiben'],
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

  // Wortpaare: fuenf Woerter der Lektion verbinden – lockert die
  // Quiz-Strecke auf und wiederholt nebenbei den halben Wortschatz
  if (lektion.items.length >= 5) {
    schritte.push({
      typ: 'paare',
      paare: mischen(lektion.items).slice(0, 5).map((i) => ({ es: i.es, de: i.de })),
    })
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

// Baut die vier Antwort-Möglichkeiten für eine Übung (richtige + drei falsche)
export function baueOptionen(schritt, lektion) {
  if (schritt.typ === 'dialogquiz') {
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

/**
 * Der Feed – Spanisch zum Durchwischen.
 *
 * Die Idee: Die Minuten, die sonst in Instagram verschwinden, sollen
 * hier landen. Also dasselbe Format – eine Karte pro Bildschirm,
 * hochwischen, nächste – nur mit Inhalt, der etwas bringt.
 *
 * Zwei Sorten Karten:
 *
 *   'haeppchen' – eine Grundlagen-Regel in dreißig Sekunden. Baut
 *                 sich beim Erscheinen auf (erst die Regel, dann
 *                 die Beispiele), jedes Beispiel antippbar zum
 *                 Anhören. Das sind die "Kurzvideos": kein echtes
 *                 Video, sondern eine bewegte Karte – lädt sofort,
 *                 kostet kein Hosting und ist in zwei Minuten
 *                 geändert, wenn etwas falsch ist.
 *
 *   'text'      – ein kurzer Wissenstext auf Spanisch zum Hören und
 *                 Mitlesen, mit Umschalter auf Deutsch und
 *                 antippbaren Wörtern.
 *
 * Die Inhalte stehen HIER und kommen nicht aus der KI: Eine falsche
 * Grammatikregel im Feed wäre schlimmer als gar keine. Die
 * Wissenstexte sind KI-geschrieben, aber einmalig geprüft und dann
 * festgeschrieben – nicht bei jedem Aufruf neu gewürfelt.
 */

// ---------------------------------------------------------------
//  Grundlagen-Häppchen
// ---------------------------------------------------------------
//
// Aufbau jeder Karte:
//   titel    – worum es geht, auf Deutsch
//   kern     – die Regel in EINEM Satz. Das ist die Hauptsache.
//   zeilen   – zwei bis vier Beispiele, je { es, de }
//   merke    – der eine Satz, den man behalten soll (optional)
//   farbe    – Nummer 0-5 für den Hintergrundverlauf

export const HAEPPCHEN = [
  {
    id: 'h-hallo',
    titel: 'Hallo sagen',
    kern: 'Drei Grüße decken den ganzen Tag ab – sie richten sich nach der Uhrzeit.',
    zeilen: [
      { es: 'Buenos días', de: 'Guten Morgen (bis etwa 12 Uhr)' },
      { es: 'Buenas tardes', de: 'Guten Tag (ab Mittag bis zum Dunkelwerden)' },
      { es: 'Buenas noches', de: 'Guten Abend / Gute Nacht' },
      { es: '¿Qué tal?', de: 'Wie geht’s? (immer passend)' },
    ],
    merke: 'Morgens „días“ im Plural – nicht „buen día“.',
    farbe: 0,
  },
  {
    id: 'h-ser-estar',
    titel: 'ser oder estar?',
    kern: 'ser ist, was jemand IST. estar ist, wie es ihm GERADE geht oder wo er ist.',
    zeilen: [
      { es: 'Soy alemán.', de: 'Ich bin Deutscher. (bleibt so)' },
      { es: 'Estoy cansado.', de: 'Ich bin müde. (geht vorbei)' },
      { es: 'Madrid es grande.', de: 'Madrid ist groß. (Eigenschaft)' },
      { es: 'Madrid está en España.', de: 'Madrid liegt in Spanien. (Ort)' },
    ],
    merke: 'Ort und Laune immer mit estar – auch wenn der Ort für immer gilt.',
    farbe: 1,
  },
  {
    id: 'h-zahlen',
    titel: 'Zählen bis zehn',
    kern: 'Die ersten zehn Zahlen braucht man überall – Preise, Uhrzeit, Hausnummern.',
    zeilen: [
      { es: 'uno, dos, tres', de: 'eins, zwei, drei' },
      { es: 'cuatro, cinco, seis', de: 'vier, fünf, sechs' },
      { es: 'siete, ocho, nueve, diez', de: 'sieben, acht, neun, zehn' },
    ],
    merke: 'Vor einem Nomen wird aus uno ein un: un café, una cerveza.',
    farbe: 2,
  },
  {
    id: 'h-artikel',
    titel: 'el oder la?',
    kern: 'Wörter auf -o sind meist männlich (el), Wörter auf -a meist weiblich (la).',
    zeilen: [
      { es: 'el libro', de: 'das Buch' },
      { es: 'la mesa', de: 'der Tisch' },
      { es: 'el problema', de: 'das Problem (Ausnahme!)' },
      { es: 'la mano', de: 'die Hand (Ausnahme!)' },
    ],
    merke: 'Lerne den Artikel immer mit – nachträglich raten klappt nicht.',
    farbe: 3,
  },
  {
    id: 'h-vorstellen',
    titel: 'Sich vorstellen',
    kern: 'Vier Sätze, und das erste Gespräch läuft.',
    zeilen: [
      { es: 'Me llamo Manuel.', de: 'Ich heiße Manuel.' },
      { es: 'Soy de Alemania.', de: 'Ich komme aus Deutschland.' },
      { es: 'Tengo treinta años.', de: 'Ich bin dreißig Jahre alt.' },
      { es: 'Mucho gusto.', de: 'Sehr erfreut.' },
    ],
    merke: 'Das Alter hat man auf Spanisch: tener años, nicht sein.',
    farbe: 4,
  },
  {
    id: 'h-tener',
    titel: 'tener – haben',
    kern: 'tener ist unregelmäßig, aber man braucht es ständig.',
    zeilen: [
      { es: 'tengo, tienes, tiene', de: 'ich habe, du hast, er/sie hat' },
      { es: 'Tengo hambre.', de: 'Ich habe Hunger.' },
      { es: 'Tengo que trabajar.', de: 'Ich muss arbeiten.' },
    ],
    merke: 'tener que + Infinitiv heißt „müssen“ – der häufigste Weg, das zu sagen.',
    farbe: 5,
  },
  {
    id: 'h-gustar',
    titel: 'gustar ist anders',
    kern: 'Nicht „ich mag etwas“, sondern „etwas gefällt mir“ – der Satz dreht sich um.',
    zeilen: [
      { es: 'Me gusta el café.', de: 'Ich mag Kaffee. (wörtlich: mir gefällt der Kaffee)' },
      { es: 'Me gustan los perros.', de: 'Ich mag Hunde. (Plural: gustan)' },
      { es: '¿Te gusta bailar?', de: 'Tanzt du gern?' },
    ],
    merke: 'Mehrzahl heißt gustan – es richtet sich nach dem, was gefällt.',
    farbe: 0,
  },
  {
    id: 'h-bestellen',
    titel: 'Im Café bestellen',
    kern: 'Höflich bestellt man mit „quería“ oder „me pone“ – nicht mit „quiero“.',
    zeilen: [
      { es: 'Quería un café con leche.', de: 'Ich hätte gern einen Milchkaffee.' },
      { es: 'Me pone una caña, por favor.', de: 'Ein kleines Bier, bitte. (Spanien)' },
      { es: 'La cuenta, por favor.', de: 'Die Rechnung, bitte.' },
    ],
    merke: '„Quiero“ klingt wie ein Befehl. „Quería“ ist die höfliche Form.',
    farbe: 1,
  },
  {
    id: 'h-muy-mucho',
    titel: 'muy oder mucho?',
    kern: 'muy steht vor Eigenschaftswörtern, mucho bei Mengen.',
    zeilen: [
      { es: 'Es muy bueno.', de: 'Es ist sehr gut.' },
      { es: 'Trabajo mucho.', de: 'Ich arbeite viel.' },
      { es: 'Hay mucha gente.', de: 'Es sind viele Leute da.' },
    ],
    merke: 'muy verändert sich nie, mucho passt sich an: mucho/mucha/muchos.',
    farbe: 2,
  },
  {
    id: 'h-weg',
    titel: 'Nach dem Weg fragen',
    kern: 'Eine Frage und drei Antworten – mehr braucht es nicht.',
    zeilen: [
      { es: '¿Dónde está la estación?', de: 'Wo ist der Bahnhof?' },
      { es: 'Todo recto.', de: 'Immer geradeaus.' },
      { es: 'A la derecha / a la izquierda.', de: 'Nach rechts / nach links.' },
      { es: 'Está cerca de aquí.', de: 'Es ist hier in der Nähe.' },
    ],
    merke: 'Ort fragen immer mit estar: ¿Dónde está…?',
    farbe: 3,
  },
  {
    id: 'h-hay',
    titel: 'hay – es gibt',
    kern: 'hay bleibt immer gleich, egal ob eins oder hundert.',
    zeilen: [
      { es: 'Hay un problema.', de: 'Es gibt ein Problem.' },
      { es: 'Hay muchos turistas.', de: 'Es gibt viele Touristen.' },
      { es: '¿Hay wifi aquí?', de: 'Gibt es hier WLAN?' },
    ],
    merke: 'Niemals „hayn“ oder „hays“ – hay hat nur diese eine Form.',
    farbe: 4,
  },
  {
    id: 'h-por-para',
    titel: 'por oder para?',
    kern: 'para zeigt auf ein Ziel, por auf den Grund oder den Weg dorthin.',
    zeilen: [
      { es: 'Es para ti.', de: 'Das ist für dich. (Ziel)' },
      { es: 'Gracias por todo.', de: 'Danke für alles. (Grund)' },
      { es: 'Salgo para Madrid.', de: 'Ich fahre nach Madrid. (Richtung)' },
      { es: 'Paso por Madrid.', de: 'Ich komme durch Madrid. (Weg)' },
    ],
    merke: 'Faustregel: para = wohin/wofür, por = warum/wodurch.',
    farbe: 5,
  },
]

// ---------------------------------------------------------------
//  Wissenstexte
// ---------------------------------------------------------------
//
// Kurz gehalten: vier bis fünf Sätze, damit eine Karte auf einen
// Bildschirm passt. Geschrieben auf A2/B1-Niveau.
//
// Jede Karte: titelEs/titelDe, absaetze [{es, de}], woerter, merksatz

export const TEXTE = [
  {
    id: 't-pulpo',
    titelEs: 'El pulpo tiene tres corazones',
    titelDe: 'Der Oktopus hat drei Herzen',
    absaetze: [
      {
        es: 'El pulpo tiene tres corazones. Uno mueve la sangre por el cuerpo y los otros dos la llevan a las branquias.',
        de: 'Der Oktopus hat drei Herzen. Eines bewegt das Blut durch den Körper, die anderen beiden bringen es zu den Kiemen.',
      },
      {
        es: 'Cuando el pulpo nada, el corazón principal deja de latir. Por eso prefiere caminar por el fondo del mar.',
        de: 'Wenn der Oktopus schwimmt, hört das Hauptherz auf zu schlagen. Deshalb läuft er lieber über den Meeresboden.',
      },
    ],
    woerter: [
      { wort: 'el pulpo', uebersetzung: 'der Oktopus' },
      { wort: 'el corazón', uebersetzung: 'das Herz' },
      { wort: 'la sangre', uebersetzung: 'das Blut' },
      { wort: 'nadar', uebersetzung: 'schwimmen' },
    ],
    merksatz: 'Beim Schwimmen steht dem Oktopus das Herz still – deshalb geht er lieber zu Fuß.',
    farbe: 1,
  },
  {
    id: 't-siesta',
    titelEs: 'La siesta no es pereza',
    titelDe: 'Die Siesta ist keine Faulheit',
    absaetze: [
      {
        es: 'La siesta viene del latín "sexta hora", la sexta hora después del amanecer. Era el momento más caluroso del día.',
        de: 'Die Siesta kommt vom lateinischen „sexta hora“, der sechsten Stunde nach Sonnenaufgang. Das war die heißeste Zeit des Tages.',
      },
      {
        es: 'Hoy mucha gente en las ciudades ya no duerme la siesta. Pero en los pueblos pequeños las tiendas todavía cierran al mediodía.',
        de: 'Heute halten viele Leute in den Städten keine Siesta mehr. Aber in kleinen Dörfern schließen die Läden mittags noch immer.',
      },
    ],
    woerter: [
      { wort: 'la pereza', uebersetzung: 'die Faulheit' },
      { wort: 'el amanecer', uebersetzung: 'der Sonnenaufgang' },
      { wort: 'caluroso', uebersetzung: 'heiß' },
      { wort: 'el pueblo', uebersetzung: 'das Dorf' },
    ],
    merksatz: '„Siesta“ heißt wörtlich „sechste Stunde“ – die Mittagshitze.',
    farbe: 2,
  },
  {
    id: 't-ñ',
    titelEs: 'La letra ñ',
    titelDe: 'Der Buchstabe ñ',
    absaetze: [
      {
        es: 'La ñ nació en los monasterios. Los copistas escribían dos enes seguidas y, para ahorrar espacio, pusieron la segunda encima de la primera.',
        de: 'Das ñ entstand in den Klöstern. Die Abschreiber schrieben zwei n hintereinander und setzten, um Platz zu sparen, das zweite über das erste.',
      },
      {
        es: 'Esa rayita de arriba se llama virgulilla. Sin ella, "año" significa otra cosa muy distinta.',
        de: 'Der kleine Strich oben heißt Virgulilla. Ohne ihn bedeutet „año“ etwas ganz anderes.',
      },
    ],
    woerter: [
      { wort: 'la letra', uebersetzung: 'der Buchstabe' },
      { wort: 'ahorrar', uebersetzung: 'sparen' },
      { wort: 'encima de', uebersetzung: 'über, oberhalb von' },
      { wort: 'el año', uebersetzung: 'das Jahr' },
    ],
    merksatz: 'Das ñ war ursprünglich eine Abkürzung für zwei n.',
    farbe: 3,
  },
  {
    id: 't-tomate',
    titelEs: 'El tomate viajó dos veces',
    titelDe: 'Die Tomate reiste zweimal',
    absaetze: [
      {
        es: 'El tomate llegó de América a España en el siglo XVI. Al principio nadie lo comía: lo tenían por una planta venenosa y solo lo usaban como adorno.',
        de: 'Die Tomate kam im 16. Jahrhundert aus Amerika nach Spanien. Zuerst aß sie niemand: Man hielt sie für eine Giftpflanze und nutzte sie nur als Zierde.',
      },
      {
        es: 'Pasaron casi doscientos años hasta que entró en la cocina. Hoy nadie se imagina la comida mediterránea sin él.',
        de: 'Es dauerte fast zweihundert Jahre, bis sie in die Küche kam. Heute kann sich niemand die mittelmeerische Küche ohne sie vorstellen.',
      },
    ],
    woerter: [
      { wort: 'el siglo', uebersetzung: 'das Jahrhundert' },
      { wort: 'venenoso', uebersetzung: 'giftig' },
      { wort: 'el adorno', uebersetzung: 'die Zierde, der Schmuck' },
      { wort: 'la cocina', uebersetzung: 'die Küche' },
    ],
    merksatz: 'Zweihundert Jahre galt die Tomate in Europa als Giftpflanze.',
    farbe: 4,
  },
  {
    id: 't-sahara',
    titelEs: 'Polvo del Sahara en Europa',
    titelDe: 'Saharastaub über Europa',
    absaetze: [
      {
        es: 'Varias veces al año el viento lleva polvo del Sahara hasta Europa. El cielo se pone naranja y los coches amanecen cubiertos de arena.',
        de: 'Mehrmals im Jahr trägt der Wind Staub aus der Sahara bis nach Europa. Der Himmel färbt sich orange, und die Autos sind morgens mit Sand bedeckt.',
      },
      {
        es: 'Ese polvo no solo molesta. También lleva minerales que alimentan el mar y la selva amazónica al otro lado del Atlántico.',
        de: 'Dieser Staub stört nicht nur. Er bringt auch Mineralien mit, die das Meer und den Amazonas-Regenwald auf der anderen Seite des Atlantiks nähren.',
      },
    ],
    woerter: [
      { wort: 'el polvo', uebersetzung: 'der Staub' },
      { wort: 'el viento', uebersetzung: 'der Wind' },
      { wort: 'la arena', uebersetzung: 'der Sand' },
      { wort: 'la selva', uebersetzung: 'der Urwald' },
    ],
    merksatz: 'Der Sand aus der Sahara düngt den Amazonas-Regenwald.',
    farbe: 5,
  },
  {
    id: 't-dormir',
    titelEs: 'Por qué bostezamos',
    titelDe: 'Warum wir gähnen',
    absaetze: [
      {
        es: 'Bostezar no significa solo que tenemos sueño. Parece que ayuda a enfriar el cerebro cuando se calienta demasiado.',
        de: 'Gähnen bedeutet nicht nur, dass wir müde sind. Offenbar hilft es, das Gehirn zu kühlen, wenn es zu warm wird.',
      },
      {
        es: 'Además, el bostezo se contagia. Si ves a alguien bostezar, es muy probable que tú también lo hagas en pocos segundos.',
        de: 'Außerdem ist Gähnen ansteckend. Wenn du jemanden gähnen siehst, tust du es sehr wahrscheinlich binnen Sekunden auch.',
      },
    ],
    woerter: [
      { wort: 'bostezar', uebersetzung: 'gähnen' },
      { wort: 'el cerebro', uebersetzung: 'das Gehirn' },
      { wort: 'enfriar', uebersetzung: 'kühlen' },
      { wort: 'contagiarse', uebersetzung: 'sich anstecken' },
    ],
    merksatz: 'Gähnen kühlt das Gehirn – und steckt andere an.',
    farbe: 0,
  },
]

/**
 * Die Karten des Feeds, gemischt.
 *
 * Abwechselnd Häppchen und Text: Zwölf Grammatikregeln am Stück
 * wären Unterricht, zwölf Geschichten am Stück Unterhaltung. Der
 * Wechsel hält beides wach.
 *
 * Die Reihenfolge ist fest und nicht zufällig – so kann man
 * weiterlesen, wo man aufgehört hat, und trifft nicht zweimal
 * dieselbe Karte.
 */
export function feedKarten() {
  const karten = []
  const max = Math.max(HAEPPCHEN.length, TEXTE.length)
  for (let i = 0; i < max; i++) {
    if (HAEPPCHEN[i]) karten.push({ art: 'haeppchen', ...HAEPPCHEN[i] })
    if (TEXTE[i]) karten.push({ art: 'text', ...TEXTE[i] })
  }
  return karten
}

// Welche Karten hat man schon gesehen? (localStorage)
const SPEICHER = 'feedGesehen'

export function gesehene() {
  try {
    return new Set(JSON.parse(localStorage.getItem(SPEICHER)) ?? [])
  } catch {
    return new Set()
  }
}

export function merkeGesehen(id) {
  try {
    const alle = gesehene()
    alle.add(id)
    localStorage.setItem(SPEICHER, JSON.stringify([...alle]))
  } catch {
    // Kein Speicher: dann merkt sich der Feed eben nichts
  }
}

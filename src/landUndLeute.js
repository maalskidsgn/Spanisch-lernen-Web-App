/**
 * Land & Leute – jeden Tag ein kurzes zweisprachiges Stück.
 *
 * Warum eine feste Liste und keine KI, obwohl "täglich etwas Neues"
 * nach einem Fall für ein Modell klingt:
 *
 * Manuels ursprüngliche Idee waren Nachrichten. Eine KI, die
 * "Nachrichten" schreiben soll, erfindet Nachrichten – nicht
 * vielleicht, sondern zuverlässig. Bei einem Grammatikbeispiel ist
 * ein Fehler ärgerlich; bei einer Meldung ist es Desinformation
 * unter Manuels Namen, auf seiner eigenen Startseite.
 *
 * Deshalb hier dasselbe Vorgehen wie bei den Zitaten in zitate.js:
 * geschrieben statt erzeugt. Das liefert das Eigentliche – jeden Tag
 * etwas Neues, Positives, Zweisprachiges – ohne dass je die Frage
 * aufkommt, ob da Unsinn steht. Kostet nichts, funktioniert ohne
 * Netz, kann nicht danebengreifen.
 *
 * REGELN FÜR NEUE STÜCKE (bitte einhalten, der Prüfer erzwingt sie):
 *
 *   Nur Allgemeinwissen. Keine Jahreszahlen, Einwohnerzahlen oder
 *   Rekorde, die man nachschlagen müsste – genau da entstehen die
 *   Fehler. "Im Sommer" ist besser als ein falsches Datum.
 *
 *   Nichts Negatives. Keine Politik, keine Katastrophen, keine
 *   Kriminalität. Das war Manuels Bedingung von Anfang an.
 *
 *   Spanisch auf A2/B1: kurze Hauptsätze, Präsens, kein Subjuntivo,
 *   keine seltenen Zeiten. Wer bei Lektion 40 steht, soll es lesen
 *   können.
 *
 *   Die deutsche Zeile ist eine ehrliche Übersetzung, keine freie
 *   Nacherzählung. Sie steht daneben, damit man den spanischen Satz
 *   versteht – nicht, damit man ihn überspringt.
 *
 *   Sechs Wörter je Stück, mit Artikel. Sie müssen im spanischen
 *   Text wirklich vorkommen; sonst lernt jemand Vokabeln zu einem
 *   Text, in dem sie nicht stehen. Der Prüfer schlägt darauf an.
 *
 * KEIN LAUTSPRECHER: Die Stücke sind nicht vertont. Auf die
 * Gerätestimme zurückzufallen wäre falsch – dieselbe Begründung wie
 * in HoerKnopf.jsx. Wenn sie vertont werden sollen, dann richtig,
 * über scripts/vertone.mjs.
 */

/**
 * Die Stücke.
 *
 * region ist die Überschrift über dem Titel und dient nur der
 * Einordnung – die App sortiert oder filtert nicht danach.
 */
export const STUECKE = [
  {
    id: 'sobremesa',
    region: 'Spanien',
    titel: 'La sobremesa',
    titelDe: 'Das Bleiben am Tisch',
    vorspann: 'Die wichtigste Mahlzeit Spaniens beginnt, wenn der Teller leer ist.',
    absaetze: [
      {
        es: 'En España, la comida no termina cuando el plato está vacío. Después de comer, la gente se queda sentada a la mesa y habla. Esto se llama la sobremesa.',
        de: 'In Spanien endet das Essen nicht, wenn der Teller leer ist. Nach dem Essen bleiben die Leute am Tisch sitzen und reden. Das nennt man „la sobremesa".',
      },
      {
        es: 'La sobremesa puede durar diez minutos o dos horas. Nadie mira el reloj. Se toma un café, a veces un postre, y se habla de todo: del trabajo, de la familia, de fútbol.',
        de: 'Die Sobremesa kann zehn Minuten oder zwei Stunden dauern. Niemand schaut auf die Uhr. Man trinkt einen Kaffee, manchmal einen Nachtisch, und redet über alles: über die Arbeit, die Familie, Fußball.',
      },
      {
        es: 'Para muchos españoles, esta parte es la más importante. La comida es la excusa. Lo que de verdad importa es la conversación.',
        de: 'Für viele Spanier ist dieser Teil der wichtigste. Das Essen ist der Vorwand. Worauf es wirklich ankommt, ist das Gespräch.',
      },
    ],
    woerter: [
      { es: 'la sobremesa', de: 'das Beisammensein nach dem Essen' },
      { es: 'el plato', de: 'der Teller' },
      { es: 'el postre', de: 'der Nachtisch' },
      { es: 'la conversación', de: 'das Gespräch' },
      { es: 'durar', de: 'dauern' },
      { es: 'quedarse', de: 'bleiben' },
    ],
    wusstest:
      'Wenn du in Spanien eingeladen bist und nach dem Essen aufstehst, wirkt das leicht so, als hättest du es eilig wegzukommen. Sitzenbleiben ist die Höflichkeit.',
  },

  {
    id: 'dia-de-muertos',
    region: 'Mexiko',
    titel: 'El Día de Muertos',
    titelDe: 'Der Tag der Toten',
    vorspann: 'Ein Fest, bei dem an die Verstorbenen mit Farben erinnert wird, nicht mit Schwarz.',
    absaetze: [
      {
        es: 'En México, el Día de Muertos es una fiesta alegre. Las familias recuerdan a las personas que ya no están, pero no lloran. Cantan, comen y cuentan historias.',
        de: 'In Mexiko ist der Tag der Toten ein fröhliches Fest. Die Familien erinnern sich an die Menschen, die nicht mehr da sind, aber sie weinen nicht. Sie singen, essen und erzählen Geschichten.',
      },
      {
        es: 'En las casas se prepara un altar con flores amarillas, velas y fotos. También se pone la comida favorita del familiar. La idea es sencilla: quien viene de visita debe encontrar algo que le gusta.',
        de: 'In den Häusern wird ein Altar aufgebaut, mit gelben Blumen, Kerzen und Fotos. Dazu stellt man das Lieblingsessen des Angehörigen. Der Gedanke ist einfach: Wer zu Besuch kommt, soll etwas vorfinden, das er mag.',
      },
      {
        es: 'Las calles se llenan de color. Mucha gente se pinta la cara de calavera y sale a la calle a bailar. La muerte no da miedo ese día: forma parte de la vida.',
        de: 'Die Straßen füllen sich mit Farbe. Viele Leute schminken sich das Gesicht als Totenschädel und gehen zum Tanzen auf die Straße. Der Tod macht an diesem Tag keine Angst: Er gehört zum Leben.',
      },
    ],
    woerter: [
      { es: 'la fiesta', de: 'das Fest' },
      { es: 'la flor', de: 'die Blume' },
      { es: 'la vela', de: 'die Kerze' },
      { es: 'la calle', de: 'die Straße' },
      { es: 'recordar', de: 'sich erinnern an' },
      { es: 'bailar', de: 'tanzen' },
    ],
    wusstest:
      'Die gelb-orangen Blumen heißen „cempasúchil". Ihr Duft soll den Verstorbenen den Weg nach Hause weisen — deshalb streut man oft eine Spur davon bis zur Haustür.',
  },

  {
    id: 'el-mate',
    region: 'Argentinien & Uruguay',
    titel: 'El mate',
    titelDe: 'Der Mate',
    vorspann: 'Ein Getränk, das man nicht allein trinkt – und nie umrührt.',
    absaetze: [
      {
        es: 'El mate es la bebida más típica de Argentina y Uruguay. Se prepara con hierba en un recipiente pequeño y se bebe con una bombilla, un tubo de metal.',
        de: 'Der Mate ist das typischste Getränk Argentiniens und Uruguays. Er wird mit Kräutern in einem kleinen Gefäß zubereitet und mit einer „bombilla" getrunken, einem Metallröhrchen.',
      },
      {
        es: 'Lo importante no es el sabor, sino la costumbre. Una persona prepara el mate y lo pasa a la siguiente. Todos beben del mismo recipiente, uno detrás de otro.',
        de: 'Das Wichtige ist nicht der Geschmack, sondern der Brauch. Eine Person bereitet den Mate zu und reicht ihn an die nächste weiter. Alle trinken aus demselben Gefäß, einer nach dem anderen.',
      },
      {
        es: 'Hay una regla que sorprende a los visitantes: no se debe mover la bombilla. Y cuando alguien dice "gracias" al devolver el mate, significa que ya no quiere más.',
        de: 'Es gibt eine Regel, die Besucher überrascht: Man darf die Bombilla nicht bewegen. Und wenn jemand beim Zurückgeben „gracias" sagt, heißt das, dass er nichts mehr möchte.',
      },
    ],
    woerter: [
      { es: 'la bebida', de: 'das Getränk' },
      { es: 'la hierba', de: 'das Kraut' },
      { es: 'el sabor', de: 'der Geschmack' },
      { es: 'la costumbre', de: 'der Brauch' },
      { es: 'pasar', de: 'weiterreichen' },
      { es: 'devolver', de: 'zurückgeben' },
    ],
    wusstest:
      'Sag „gracias" erst, wenn du wirklich aufhören willst. Wer sich höflich bedankt, während er weitertrinken möchte, ist aus der Runde – ohne es gemerkt zu haben.',
  },

  {
    id: 'camino-de-santiago',
    region: 'Spanien',
    titel: 'El Camino de Santiago',
    titelDe: 'Der Jakobsweg',
    vorspann: 'Ein Weg quer durch Nordspanien, den man am besten langsam geht.',
    absaetze: [
      {
        es: 'El Camino de Santiago es una ruta antigua que termina en la ciudad de Santiago de Compostela, en el noroeste de España. Mucha gente lo hace a pie, algunos en bicicleta.',
        de: 'Der Jakobsweg ist eine alte Route, die in der Stadt Santiago de Compostela im Nordwesten Spaniens endet. Viele Leute gehen ihn zu Fuß, manche mit dem Fahrrad.',
      },
      {
        es: 'No todos los peregrinos son religiosos. Algunos caminan para pensar, otros porque quieren estar solos unos días. Se duerme en albergues sencillos y se camina muchas horas.',
        de: 'Nicht alle Pilger sind religiös. Manche gehen, um nachzudenken, andere, weil sie ein paar Tage allein sein wollen. Man schläft in einfachen Herbergen und läuft viele Stunden.',
      },
      {
        es: 'La señal del camino es una flecha amarilla. Está pintada en árboles, piedras y paredes. Mientras la sigas, no te pierdes.',
        de: 'Das Zeichen des Weges ist ein gelber Pfeil. Er ist auf Bäume, Steine und Mauern gemalt. Solange du ihm folgst, verläufst du dich nicht.',
      },
    ],
    woerter: [
      { es: 'el camino', de: 'der Weg' },
      { es: 'la ruta', de: 'die Route' },
      { es: 'el peregrino', de: 'der Pilger' },
      { es: 'la flecha', de: 'der Pfeil' },
      { es: 'caminar', de: 'gehen, wandern' },
      { es: 'perderse', de: 'sich verlaufen' },
    ],
    wusstest:
      'Pilger grüßen sich unterwegs mit „¡Buen Camino!" – „Guten Weg!". Es ist einer der wenigen Grüße, die man wildfremden Menschen zuruft, ohne dass es seltsam wirkt.',
  },

  {
    id: 'las-doce-uvas',
    region: 'Spanien',
    titel: 'Las doce uvas',
    titelDe: 'Die zwölf Weintrauben',
    vorspann: 'Silvester in Spanien ist ein Wettessen gegen die Uhr.',
    absaetze: [
      {
        es: 'En España, la Nochevieja tiene una tradición muy concreta. A las doce de la noche hay que comer doce uvas, una con cada campanada del reloj.',
        de: 'In Spanien hat der Silvesterabend eine sehr konkrete Tradition. Um zwölf Uhr nachts muss man zwölf Weintrauben essen, eine bei jedem Glockenschlag der Uhr.',
      },
      {
        es: 'Parece fácil, pero no lo es. Las campanadas van rápido y las uvas tienen pepitas. Casi siempre alguien se queda atrás y termina riéndose con la boca llena.',
        de: 'Es sieht leicht aus, ist es aber nicht. Die Glockenschläge gehen schnell und die Trauben haben Kerne. Fast immer bleibt jemand zurück und lacht am Ende mit vollem Mund.',
      },
      {
        es: 'Quien consigue comerlas todas a tiempo tendrá un buen año. Muchas familias lo ven juntas en la televisión, con el reloj de la Puerta del Sol de Madrid.',
        de: 'Wer es schafft, alle rechtzeitig zu essen, bekommt ein gutes Jahr. Viele Familien schauen es gemeinsam im Fernsehen, mit der Uhr an der Puerta del Sol in Madrid.',
      },
    ],
    woerter: [
      { es: 'la uva', de: 'die Weintraube' },
      { es: 'la campanada', de: 'der Glockenschlag' },
      { es: 'el reloj', de: 'die Uhr' },
      { es: 'la boca', de: 'der Mund' },
      { es: 'conseguir', de: 'schaffen, erreichen' },
      { es: 'reírse', de: 'lachen' },
    ],
    wusstest:
      'Im Supermarkt gibt es vor Silvester kleine Dosen mit genau zwölf geschälten, entkernten Trauben. Das gilt als Schummeln – gekauft wird es trotzdem.',
  },

  {
    id: 'pura-vida',
    region: 'Costa Rica',
    titel: '"Pura vida"',
    titelDe: '„Pura vida"',
    vorspann: 'Zwei Wörter, mit denen man in Costa Rica fast jedes Gespräch führen kann.',
    absaetze: [
      {
        es: 'En Costa Rica se oye "pura vida" todo el día. Significa "vida pura", pero se usa para muchas cosas: hola, adiós, gracias, todo bien, no pasa nada.',
        de: 'In Costa Rica hört man den ganzen Tag „pura vida". Wörtlich heißt es „pures Leben", aber man benutzt es für vieles: hallo, tschüss, danke, alles gut, kein Problem.',
      },
      {
        es: 'Si preguntas a alguien cómo está, te responde "pura vida". Si le das las gracias, te contesta "pura vida". Si algo sale mal, alguien dirá "pura vida" y seguirá adelante.',
        de: 'Wenn du jemanden fragst, wie es ihm geht, antwortet er „pura vida". Wenn du dich bedankst, sagt er „pura vida". Wenn etwas schiefgeht, sagt jemand „pura vida" und macht weiter.',
      },
      {
        es: 'No es solo una expresión. Es una forma de ver las cosas: no vale la pena preocuparse por lo que no puedes cambiar.',
        de: 'Es ist nicht nur eine Redewendung. Es ist eine Art, die Dinge zu sehen: Es lohnt sich nicht, sich um das zu sorgen, was man nicht ändern kann.',
      },
    ],
    woerter: [
      { es: 'la vida', de: 'das Leben' },
      { es: 'la expresión', de: 'die Redewendung' },
      { es: 'responder', de: 'antworten' },
      { es: 'contestar', de: 'antworten, erwidern' },
      { es: 'preocuparse', de: 'sich sorgen' },
      { es: 'cambiar', de: 'ändern' },
    ],
    wusstest:
      'Die Costa-Ricaner nennen sich selbst „ticos". Das kommt von ihrer Vorliebe für Verkleinerungsformen: statt „un momentito" sagen sie „un momentico".',
  },

  {
    id: 'los-pintxos',
    region: 'Baskenland',
    titel: 'Los pintxos',
    titelDe: 'Die Pintxos',
    vorspann: 'Im Baskenland isst man im Stehen – und wechselt dabei die Bar.',
    absaetze: [
      {
        es: 'En el País Vasco, en el norte de España, las tapas se llaman pintxos. Son pequeños bocados que están sobre la barra, casi siempre encima de un trozo de pan.',
        de: 'Im Baskenland, im Norden Spaniens, heißen die Tapas „pintxos". Es sind kleine Häppchen, die auf dem Tresen stehen, fast immer auf einem Stück Brot.',
      },
      {
        es: 'La costumbre es no quedarse en un solo sitio. Se entra en un bar, se toma un pintxo y una bebida, y luego se va al siguiente bar. Esto se llama ir de pintxos.',
        de: 'Der Brauch ist, nicht an einem einzigen Ort zu bleiben. Man geht in eine Bar, nimmt einen Pintxo und ein Getränk, und geht dann zur nächsten Bar. Das nennt man „ir de pintxos".',
      },
      {
        es: 'En muchos bares no hay que pedir: coges lo que quieres del mostrador y al final dices cuántos has comido. Funciona porque todo el mundo es honesto.',
        de: 'In vielen Bars muss man nicht bestellen: Du nimmst dir vom Tresen, was du willst, und sagst am Ende, wie viele du gegessen hast. Es funktioniert, weil alle ehrlich sind.',
      },
    ],
    woerter: [
      { es: 'el pan', de: 'das Brot' },
      { es: 'la barra', de: 'der Tresen' },
      { es: 'el mostrador', de: 'die Theke' },
      { es: 'el trozo', de: 'das Stück' },
      { es: 'pedir', de: 'bestellen' },
      { es: 'coger', de: 'nehmen' },
    ],
    wusstest:
      'Der Name kommt vom Zahnstocher, der das Häppchen zusammenhält – „pintxo" heißt so viel wie „Spieß". Die Stäbchen zählt der Wirt am Ende ab.',
  },

  {
    id: 'el-cafe-colombiano',
    region: 'Kolumbien',
    titel: 'El café colombiano',
    titelDe: 'Der kolumbianische Kaffee',
    vorspann: 'In den Bergen Kolumbiens wird jede Bohne einzeln gepflückt.',
    absaetze: [
      {
        es: 'En Colombia, el café crece en las montañas. Las plantas necesitan sombra, lluvia y noches frescas, y eso lo encuentran a mucha altura.',
        de: 'In Kolumbien wächst der Kaffee in den Bergen. Die Pflanzen brauchen Schatten, Regen und kühle Nächte, und das finden sie in großer Höhe.',
      },
      {
        es: 'Los granos no se recogen todos a la vez. En la misma planta hay frutos verdes y frutos rojos, y solo se cogen los rojos. Por eso el trabajo se hace a mano.',
        de: 'Die Bohnen werden nicht alle auf einmal geerntet. An derselben Pflanze hängen grüne und rote Früchte, und nur die roten werden gepflückt. Deshalb wird die Arbeit von Hand gemacht.',
      },
      {
        es: 'En las fincas se toma un café pequeño y dulce que se llama tinto. Se ofrece a cualquier persona que llega, a cualquier hora del día.',
        de: 'Auf den Höfen trinkt man einen kleinen, süßen Kaffee, der „tinto" heißt. Er wird jedem angeboten, der ankommt, zu jeder Tageszeit.',
      },
    ],
    woerter: [
      { es: 'la montaña', de: 'der Berg' },
      { es: 'la sombra', de: 'der Schatten' },
      { es: 'el grano', de: 'die Bohne, das Korn' },
      { es: 'el fruto', de: 'die Frucht' },
      { es: 'crecer', de: 'wachsen' },
      { es: 'recoger', de: 'ernten, aufsammeln' },
    ],
    wusstest:
      '„Tinto" heißt in Spanien Rotwein – in Kolumbien schwarzer Kaffee. Wer das verwechselt, bekommt vormittags eine Überraschung.',
  },

  {
    id: 'las-fallas',
    region: 'Valencia',
    titel: 'Las Fallas',
    titelDe: 'Die Fallas',
    vorspann: 'Ein Jahr lang bauen, eine Nacht lang verbrennen.',
    absaetze: [
      {
        es: 'En Valencia, en primavera, hay una fiesta que se llama las Fallas. Durante todo el año, los vecinos construyen figuras enormes de madera y cartón.',
        de: 'In Valencia gibt es im Frühling ein Fest, das „las Fallas" heißt. Das ganze Jahr über bauen die Nachbarn riesige Figuren aus Holz und Pappe.',
      },
      {
        es: 'Las figuras se colocan en las calles y en las plazas. Algunas son más altas que una casa. Mucha gente viene a verlas y a sacar fotos.',
        de: 'Die Figuren werden auf den Straßen und Plätzen aufgestellt. Manche sind höher als ein Haus. Viele Leute kommen, um sie anzusehen und Fotos zu machen.',
      },
      {
        es: 'La última noche pasa algo que sorprende a todo el mundo: las queman. Después de un año de trabajo, arden en pocos minutos. Al día siguiente se empieza la del año que viene.',
        de: 'In der letzten Nacht passiert etwas, das alle überrascht: Sie werden verbrannt. Nach einem Jahr Arbeit brennen sie in wenigen Minuten nieder. Am nächsten Tag fängt man mit der für das kommende Jahr an.',
      },
    ],
    woerter: [
      { es: 'la primavera', de: 'der Frühling' },
      { es: 'el vecino', de: 'der Nachbar' },
      { es: 'la madera', de: 'das Holz' },
      { es: 'la plaza', de: 'der Platz' },
      { es: 'construir', de: 'bauen' },
      { es: 'quemar', de: 'verbrennen' },
    ],
    wusstest:
      'Eine einzige Figur wird jedes Jahr vom Feuer verschont. Die Besucher stimmen darüber ab; die Gewinnerin kommt ins Museum.',
  },

  {
    id: 'el-asado',
    region: 'Argentinien',
    titel: 'El asado',
    titelDe: 'Der Asado',
    vorspann: 'Kein Grillabend, sondern ein Nachmittag mit Verantwortlichem.',
    absaetze: [
      {
        es: 'En Argentina, el asado no es una comida rápida. Es un domingo entero. La familia y los amigos llegan por la mañana y se van cuando ya es de noche.',
        de: 'In Argentinien ist der Asado kein schnelles Essen. Es ist ein ganzer Sonntag. Familie und Freunde kommen morgens und gehen, wenn es schon dunkel ist.',
      },
      {
        es: 'Hay una persona que se ocupa del fuego y de la carne: el asador. Nadie más toca la parrilla. Es un honor, pero también una responsabilidad.',
        de: 'Es gibt eine Person, die sich um das Feuer und das Fleisch kümmert: den „asador". Niemand sonst fasst den Grill an. Das ist eine Ehre, aber auch eine Verantwortung.',
      },
      {
        es: 'La carne se hace despacio, con brasas y no con llama. Mientras tanto se habla, se bebe y se espera. La espera forma parte del asado.',
        de: 'Das Fleisch gart langsam, über Glut und nicht über Flammen. Währenddessen redet man, trinkt und wartet. Das Warten gehört zum Asado dazu.',
      },
    ],
    woerter: [
      { es: 'la carne', de: 'das Fleisch' },
      { es: 'el fuego', de: 'das Feuer' },
      { es: 'la parrilla', de: 'der Grill, der Rost' },
      { es: 'la llama', de: 'die Flamme' },
      { es: 'ocuparse de', de: 'sich kümmern um' },
      { es: 'esperar', de: 'warten' },
    ],
    wusstest:
      'Dem Asador beim Feuer dreinzureden gilt als grobe Unhöflichkeit. Es gibt sogar ein Wort dafür, wenn jemand es doch tut: „opinólogo" – Meinungskundler.',
  },

  {
    id: 'las-arepas',
    region: 'Venezuela & Kolumbien',
    titel: 'Las arepas',
    titelDe: 'Die Arepas',
    vorspann: 'Ein Maisfladen, über den zwei Länder sich freundschaftlich streiten.',
    absaetze: [
      {
        es: 'La arepa es un pan redondo y plano hecho de maíz. Se come en Venezuela y en Colombia, por la mañana, al mediodía y por la noche.',
        de: 'Die Arepa ist ein rundes, flaches Brot aus Mais. Man isst sie in Venezuela und in Kolumbien, morgens, mittags und abends.',
      },
      {
        es: 'En Venezuela se abre por la mitad y se rellena de queso, carne o aguacate. En Colombia muchas veces se come sin relleno, con mantequilla y queso encima.',
        de: 'In Venezuela schneidet man sie in der Mitte auf und füllt sie mit Käse, Fleisch oder Avocado. In Kolumbien isst man sie oft ohne Füllung, mit Butter und Käse obendrauf.',
      },
      {
        es: 'Los dos países dicen que la arepa es suya. Es una discusión vieja y bastante amistosa: nadie quiere ganarla de verdad.',
        de: 'Beide Länder sagen, die Arepa gehöre ihnen. Es ist ein alter und ziemlich freundschaftlicher Streit: Niemand will ihn wirklich gewinnen.',
      },
    ],
    woerter: [
      { es: 'el maíz', de: 'der Mais' },
      { es: 'el queso', de: 'der Käse' },
      { es: 'el relleno', de: 'die Füllung' },
      { es: 'la mantequilla', de: 'die Butter' },
      { es: 'redondo', de: 'rund' },
      { es: 'rellenar', de: 'füllen' },
    ],
    wusstest:
      'Die gefüllte Variante mit Hühnchen und Avocado heißt „reina pepiada" – die kurvige Königin. Sie ist nach einer Schönheitskönigin benannt.',
  },

  {
    id: 'el-flamenco',
    region: 'Andalusien',
    titel: 'El flamenco',
    titelDe: 'Der Flamenco',
    vorspann: 'Erst die Stimme, dann die Gitarre – der Tanz kam zuletzt dazu.',
    absaetze: [
      {
        es: 'El flamenco viene del sur de España, de Andalucía. Mucha gente piensa primero en el baile, pero lo más antiguo es el cante, es decir, la voz.',
        de: 'Der Flamenco kommt aus dem Süden Spaniens, aus Andalusien. Viele denken zuerst an den Tanz, aber das Älteste ist der „cante", also die Stimme.',
      },
      {
        es: 'Un flamenco tiene tres partes: el cante, la guitarra y el baile. También están las palmas, cuando el público marca el ritmo con las manos.',
        de: 'Ein Flamenco hat drei Teile: den Gesang, die Gitarre und den Tanz. Dazu kommen die „palmas", wenn das Publikum den Rhythmus mit den Händen schlägt.',
      },
      {
        es: 'No todo el flamenco es triste. Hay estilos alegres para las fiestas y otros muy serios que se cantan casi sin música. Depende del momento.',
        de: 'Nicht jeder Flamenco ist traurig. Es gibt fröhliche Stile für Feste und andere, sehr ernste, die fast ohne Musik gesungen werden. Es kommt auf den Moment an.',
      },
    ],
    woerter: [
      { es: 'el baile', de: 'der Tanz' },
      { es: 'la voz', de: 'die Stimme' },
      { es: 'la guitarra', de: 'die Gitarre' },
      { es: 'el público', de: 'das Publikum' },
      { es: 'alegre', de: 'fröhlich' },
      { es: 'triste', de: 'traurig' },
    ],
    wusstest:
      'Der Zuruf „¡Olé!" gehört zur Aufführung, aber nur an der richtigen Stelle. Ein Ruf zur falschen Zeit stört – ähnlich wie Klatschen zwischen zwei Sätzen im Konzert.',
  },

  {
    id: 'las-galapagos',
    region: 'Ecuador',
    titel: 'Las islas Galápagos',
    titelDe: 'Die Galápagos-Inseln',
    vorspann: 'Inseln, auf denen die Tiere vor dem Menschen nicht weglaufen.',
    absaetze: [
      {
        es: 'Las islas Galápagos están en el océano Pacífico y pertenecen a Ecuador. Están muy lejos de la costa, y por eso los animales vivieron allí solos durante mucho tiempo.',
        de: 'Die Galápagos-Inseln liegen im Pazifischen Ozean und gehören zu Ecuador. Sie sind sehr weit von der Küste entfernt, und deshalb lebten die Tiere dort lange Zeit allein.',
      },
      {
        es: 'Hay tortugas enormes, iguanas que nadan en el mar y pájaros que no se encuentran en ningún otro lugar del mundo.',
        de: 'Es gibt riesige Schildkröten, Leguane, die im Meer schwimmen, und Vögel, die man an keinem anderen Ort der Welt findet.',
      },
      {
        es: 'Lo que más sorprende a los visitantes es que los animales no tienen miedo. Nunca aprendieron que el ser humano puede ser peligroso, así que se quedan tranquilos.',
        de: 'Was die Besucher am meisten überrascht: Die Tiere haben keine Angst. Sie haben nie gelernt, dass der Mensch gefährlich sein kann, also bleiben sie ruhig.',
      },
    ],
    woerter: [
      { es: 'la isla', de: 'die Insel' },
      { es: 'el mar', de: 'das Meer' },
      { es: 'la costa', de: 'die Küste' },
      { es: 'el pájaro', de: 'der Vogel' },
      { es: 'nadar', de: 'schwimmen' },
      { es: 'peligroso', de: 'gefährlich' },
    ],
    wusstest:
      'Die Inseln sind nach ihren Schildkröten benannt: „galápago" ist ein altes spanisches Wort für Sattel – die Panzer erinnerten die Seefahrer an Reitsättel.',
  },

  {
    id: 'la-siesta',
    region: 'Spanien',
    titel: 'La siesta',
    titelDe: 'Die Siesta',
    vorspann: 'Die berühmteste spanische Gewohnheit – die kaum noch jemand hat.',
    absaetze: [
      {
        es: 'Todo el mundo conoce la siesta: dormir un rato después de comer. En los pueblos pequeños, muchas tiendas todavía cierran a mediodía y abren otra vez por la tarde.',
        de: 'Alle kennen die Siesta: nach dem Essen ein Weilchen schlafen. In kleinen Dörfern schließen viele Läden mittags immer noch und öffnen nachmittags wieder.',
      },
      {
        es: 'Pero en las ciudades grandes casi nadie duerme la siesta entre semana. La gente trabaja en oficinas y no tiene tiempo de volver a casa.',
        de: 'Aber in den großen Städten hält unter der Woche kaum jemand Siesta. Die Leute arbeiten in Büros und haben keine Zeit, nach Hause zu fahren.',
      },
      {
        es: 'Lo que sí queda es el horario. En España se come sobre las dos y media y se cena a las nueve o más tarde. Para un alemán, eso sigue siendo muy tarde.',
        de: 'Was aber bleibt, sind die Zeiten. In Spanien isst man gegen halb drei zu Mittag und gegen neun oder später zu Abend. Für einen Deutschen ist das immer noch sehr spät.',
      },
    ],
    woerter: [
      { es: 'la tienda', de: 'der Laden' },
      { es: 'el pueblo', de: 'das Dorf' },
      { es: 'la oficina', de: 'das Büro' },
      { es: 'el horario', de: 'die Zeiten, der Zeitplan' },
      { es: 'dormir', de: 'schlafen' },
      { es: 'cerrar', de: 'schließen' },
    ],
    wusstest:
      'Wer um sieben Uhr abends in Spanien ein Restaurant sucht, findet höchstens Tapas. Die Küche öffnet vielerorts erst um halb neun.',
  },

  {
    id: 'machu-picchu',
    region: 'Peru',
    titel: 'Machu Picchu',
    titelDe: 'Machu Picchu',
    vorspann: 'Eine Stadt aus Stein, gebaut ohne Mörtel und ohne Rad.',
    absaetze: [
      {
        es: 'Machu Picchu está en los Andes, en Perú, muy arriba entre las montañas. Es una ciudad de piedra construida por los incas.',
        de: 'Machu Picchu liegt in den Anden in Peru, hoch oben zwischen den Bergen. Es ist eine Stadt aus Stein, erbaut von den Inka.',
      },
      {
        es: 'Lo más impresionante son los muros. Las piedras están cortadas con tanta precisión que encajan sin cemento. Entre dos piedras no cabe ni una hoja de papel.',
        de: 'Am beeindruckendsten sind die Mauern. Die Steine sind so genau zugeschnitten, dass sie ohne Zement ineinanderpassen. Zwischen zwei Steine passt nicht einmal ein Blatt Papier.',
      },
      {
        es: 'Los incas no conocían la rueda ni usaban animales grandes para llevar peso. Todo lo subieron a mano, hasta esa altura.',
        de: 'Die Inka kannten das Rad nicht und benutzten keine großen Tiere zum Lastentragen. Alles haben sie von Hand hinaufgebracht, bis in diese Höhe.',
      },
    ],
    woerter: [
      { es: 'la piedra', de: 'der Stein' },
      { es: 'el muro', de: 'die Mauer' },
      { es: 'la altura', de: 'die Höhe' },
      { es: 'el papel', de: 'das Papier' },
      { es: 'cortar', de: 'schneiden' },
      { es: 'subir', de: 'hinaufbringen, steigen' },
    ],
    wusstest:
      'Der Ort war nie wirklich verloren – die Bauern der Umgebung wussten davon. Nur außerhalb Perus kannte ihn lange niemand.',
  },

  {
    id: 'la-tomatina',
    region: 'Spanien',
    titel: 'La Tomatina',
    titelDe: 'Die Tomatina',
    vorspann: 'Eine Stunde lang wirft ein ganzes Dorf mit Tomaten.',
    absaetze: [
      {
        es: 'En un pueblo cerca de Valencia hay una fiesta muy rara: durante una hora, miles de personas se tiran tomates en la calle.',
        de: 'In einem Dorf bei Valencia gibt es ein sehr merkwürdiges Fest: Eine Stunde lang bewerfen sich Tausende von Menschen auf der Straße mit Tomaten.',
      },
      {
        es: 'Hay reglas. Los tomates tienen que estar aplastados antes de tirarlos, para que no hagan daño. Y cuando suena la señal del final, nadie tira nada más.',
        de: 'Es gibt Regeln. Die Tomaten müssen zerdrückt sein, bevor man sie wirft, damit sie nicht wehtun. Und wenn das Zeichen zum Schluss ertönt, wirft niemand mehr etwas.',
      },
      {
        es: 'Después, los bomberos limpian las calles con agua. Media hora más tarde, el pueblo está otra vez limpio y todo el mundo se va a comer.',
        de: 'Danach reinigt die Feuerwehr die Straßen mit Wasser. Eine halbe Stunde später ist das Dorf wieder sauber und alle gehen essen.',
      },
    ],
    woerter: [
      { es: 'el tomate', de: 'die Tomate' },
      { es: 'la regla', de: 'die Regel' },
      { es: 'la señal', de: 'das Zeichen, das Signal' },
      { es: 'el agua', de: 'das Wasser' },
      { es: 'tirar', de: 'werfen' },
      { es: 'limpiar', de: 'reinigen' },
    ],
    wusstest:
      'Die Säure der Tomaten putzt den Stein mit. Nach dem Abspritzen sind die Fassaden sauberer als vorher.',
  },

  {
    id: 'el-tango',
    region: 'Argentinien',
    titel: 'El tango',
    titelDe: 'Der Tango',
    vorspann: 'Der Tanz begann im Hafen, nicht im Ballsaal.',
    absaetze: [
      {
        es: 'El tango nació en Buenos Aires, en los barrios del puerto. Allí vivían muchos inmigrantes de Europa, lejos de su familia, y la música hablaba de eso.',
        de: 'Der Tango entstand in Buenos Aires, in den Vierteln am Hafen. Dort lebten viele Einwanderer aus Europa, weit weg von ihrer Familie, und die Musik handelte davon.',
      },
      {
        es: 'Al principio no era elegante. Se bailaba en la calle y en los bares. Solo más tarde llegó a los salones y después al resto del mundo.',
        de: 'Am Anfang war er nicht elegant. Man tanzte auf der Straße und in den Bars. Erst später kam er in die Säle und danach in den Rest der Welt.',
      },
      {
        es: 'Hoy todavía se baila en plazas al aire libre. Cualquiera puede acercarse a mirar, y a veces alguien te saca a bailar aunque no sepas.',
        de: 'Heute wird immer noch auf Plätzen unter freiem Himmel getanzt. Jeder kann näher kommen und zuschauen, und manchmal fordert dich jemand auf, auch wenn du es nicht kannst.',
      },
    ],
    woerter: [
      { es: 'el barrio', de: 'das Viertel' },
      { es: 'el puerto', de: 'der Hafen' },
      { es: 'la música', de: 'die Musik' },
      { es: 'el salón', de: 'der Saal' },
      { es: 'nacer', de: 'entstehen, geboren werden' },
      { es: 'acercarse', de: 'näher kommen' },
    ],
    wusstest:
      'Das typische Instrument ist kein argentinisches: Das Bandoneón wurde in Deutschland gebaut und kam mit den Einwanderern über den Atlantik.',
  },

  {
    id: 'la-patagonia',
    region: 'Chile & Argentinien',
    titel: 'La Patagonia',
    titelDe: 'Patagonien',
    vorspann: 'Ganz im Süden, wo mehr Schafe leben als Menschen.',
    absaetze: [
      {
        es: 'La Patagonia está en el sur de Chile y Argentina. Es una región enorme y casi vacía: hay montañas, lagos, glaciares y muchísimo viento.',
        de: 'Patagonien liegt im Süden Chiles und Argentiniens. Es ist eine riesige und fast leere Region: Es gibt Berge, Seen, Gletscher und sehr viel Wind.',
      },
      {
        es: 'En algunas zonas hay más ovejas que personas. Se puede conducir durante horas sin ver una casa ni encontrarse con otro coche.',
        de: 'In manchen Gegenden gibt es mehr Schafe als Menschen. Man kann stundenlang fahren, ohne ein Haus zu sehen oder einem anderen Auto zu begegnen.',
      },
      {
        es: 'El viento es lo que más recuerdan los visitantes. Sopla casi todos los días y es tan fuerte que los árboles crecen torcidos, siempre hacia el mismo lado.',
        de: 'An den Wind erinnern sich die Besucher am meisten. Er weht fast jeden Tag und ist so stark, dass die Bäume schief wachsen, immer in dieselbe Richtung.',
      },
    ],
    woerter: [
      { es: 'el sur', de: 'der Süden' },
      { es: 'el lago', de: 'der See' },
      { es: 'el viento', de: 'der Wind' },
      { es: 'la oveja', de: 'das Schaf' },
      { es: 'conducir', de: 'Auto fahren' },
      { es: 'soplar', de: 'wehen' },
    ],
    wusstest:
      'Es gibt eine patagonische Redensart für jemanden, der ständig jammert: Er habe „den Wind noch nicht kennengelernt".',
  },

  {
    id: 'el-chocolate',
    region: 'Mexiko',
    titel: 'El chocolate',
    titelDe: 'Die Schokolade',
    vorspann: 'Ursprünglich war sie bitter, scharf – und ein Getränk.',
    absaetze: [
      {
        es: 'El chocolate viene de México y de América Central. Allí ya se tomaba mucho antes de que llegaran los europeos, pero era muy diferente del que conocemos.',
        de: 'Die Schokolade kommt aus Mexiko und Mittelamerika. Dort wurde sie schon lange getrunken, bevor die Europäer kamen, aber sie war ganz anders als die, die wir kennen.',
      },
      {
        es: 'No era dulce y no era una tableta. Era una bebida amarga, a veces con chile, y se servía fría. El azúcar llegó después, desde Europa.',
        de: 'Sie war nicht süß und keine Tafel. Sie war ein bitteres Getränk, manchmal mit Chili, und wurde kalt serviert. Der Zucker kam später, aus Europa.',
      },
      {
        es: 'En México todavía se prepara así en algunos lugares, con agua y especias. También se usa en la cocina: el mole, una salsa oscura para el pollo, lleva chocolate.',
        de: 'In Mexiko wird sie mancherorts noch so zubereitet, mit Wasser und Gewürzen. Sie wird auch beim Kochen verwendet: In „mole", einer dunklen Soße zu Hühnchen, ist Schokolade drin.',
      },
    ],
    woerter: [
      { es: 'el azúcar', de: 'der Zucker' },
      { es: 'la salsa', de: 'die Soße' },
      { es: 'el pollo', de: 'das Hühnchen' },
      { es: 'la cocina', de: 'die Küche' },
      { es: 'amargo', de: 'bitter' },
      { es: 'dulce', de: 'süß' },
    ],
    wusstest:
      'Das Wort „chocolate" ist eines der wenigen, die aus dem Nahuatl über das Spanische in fast jede Sprache der Welt gewandert sind – „Tomate" und „Avocado" auch.',
  },

  {
    id: 'el-gordo',
    region: 'Spanien',
    titel: 'El Gordo',
    titelDe: 'Der Dicke',
    vorspann: 'Die Weihnachtslotterie, deren Zahlen von Kindern gesungen werden.',
    absaetze: [
      {
        es: 'En diciembre, casi toda España juega a la lotería de Navidad. El premio más grande se llama el Gordo, y el sorteo se ve en la televisión por la mañana.',
        de: 'Im Dezember spielt fast ganz Spanien in der Weihnachtslotterie. Der größte Gewinn heißt „el Gordo", und die Ziehung wird morgens im Fernsehen übertragen.',
      },
      {
        es: 'Los números no se leen: se cantan. Unos niños de un colegio de Madrid cantan cada número y cada premio en voz alta. Dura varias horas.',
        de: 'Die Zahlen werden nicht vorgelesen, sondern gesungen. Kinder einer Madrider Schule singen jede Zahl und jeden Gewinn laut vor. Das dauert mehrere Stunden.',
      },
      {
        es: 'Casi nadie compra un billete entero, porque es caro. La gente comparte: en la oficina, en el bar del barrio, entre amigos. Por eso a veces gana un pueblo entero.',
        de: 'Fast niemand kauft ein ganzes Los, weil es teuer ist. Die Leute teilen sich: im Büro, in der Kneipe im Viertel, unter Freunden. Deshalb gewinnt manchmal ein ganzes Dorf.',
      },
    ],
    woerter: [
      { es: 'el premio', de: 'der Gewinn, der Preis' },
      { es: 'el número', de: 'die Zahl' },
      { es: 'el billete', de: 'das Los, der Schein' },
      { es: 'el colegio', de: 'die Schule' },
      { es: 'cantar', de: 'singen' },
      { es: 'compartir', de: 'teilen' },
    ],
    wusstest:
      'Weil ganze Nachbarschaften dieselbe Nummer kaufen, gewinnen die Nachbarn oft gemeinsam – und wer als Einziger nicht mitgemacht hat, hat einen sehr langen Tag.',
  },

  {
    id: 'los-mercados',
    region: 'Mexiko',
    titel: 'El mercado',
    titelDe: 'Der Markt',
    vorspann: 'In Oaxaca kauft man nicht ein – man wird beraten.',
    absaetze: [
      {
        es: 'En México, el mercado es el centro del día. En ciudades como Oaxaca hay mercados enormes, con pasillos llenos de fruta, verdura, pan y flores.',
        de: 'In Mexiko ist der Markt das Zentrum des Tages. In Städten wie Oaxaca gibt es riesige Märkte, mit Gängen voller Obst, Gemüse, Brot und Blumen.',
      },
      {
        es: 'No se compra en silencio. La vendedora te pregunta para qué lo quieres y te dice cuál está mejor hoy. A veces te da a probar algo antes.',
        de: 'Man kauft nicht schweigend ein. Die Verkäuferin fragt dich, wofür du es willst, und sagt dir, was heute am besten ist. Manchmal gibt sie dir vorher etwas zum Probieren.',
      },
      {
        es: 'Casi siempre hay una parte donde se come. Son mesas sencillas y comida muy buena, y allí se sientan juntos los que trabajan y los que compran.',
        de: 'Fast immer gibt es einen Bereich, in dem gegessen wird. Es sind einfache Tische und sehr gutes Essen, und dort sitzen die, die arbeiten, und die, die einkaufen, beisammen.',
      },
    ],
    woerter: [
      { es: 'el mercado', de: 'der Markt' },
      { es: 'la fruta', de: 'das Obst' },
      { es: 'la verdura', de: 'das Gemüse' },
      { es: 'la mesa', de: 'der Tisch' },
      { es: 'preguntar', de: 'fragen' },
      { es: 'probar', de: 'probieren' },
    ],
    wusstest:
      'Wenn dir jemand am Stand „¿le doy?" sagt, heißt das nicht „darf ich Ihnen geben" im Sinne eines Angebots – es ist die freundliche Art zu fragen, ob du dich entschieden hast.',
  },

  {
    id: 'la-paella',
    region: 'Valencia',
    titel: 'La paella',
    titelDe: 'Die Paella',
    vorspann: 'Ein Bauernessen vom Feld – ursprünglich ganz ohne Meeresfrüchte.',
    absaetze: [
      {
        es: 'La paella es de Valencia. El nombre no es del plato, sino de la sartén ancha y plana en la que se hace: la paella es la sartén.',
        de: 'Die Paella kommt aus Valencia. Der Name bezeichnet nicht das Gericht, sondern die breite, flache Pfanne, in der es zubereitet wird: „la paella" ist die Pfanne.',
      },
      {
        es: 'La original no lleva marisco. Era comida de campo, con pollo, conejo, judías verdes y arroz. El marisco vino después, en la costa.',
        de: 'Die ursprüngliche enthält keine Meeresfrüchte. Es war Essen vom Feld, mit Hühnchen, Kaninchen, grünen Bohnen und Reis. Die Meeresfrüchte kamen später dazu, an der Küste.',
      },
      {
        es: 'Se come a mediodía y casi nunca por la noche. Y se hace para muchos: preparar una paella para dos personas no tiene sentido.',
        de: 'Man isst sie mittags und fast nie abends. Und man macht sie für viele: Eine Paella für zwei Personen zu kochen ergibt keinen Sinn.',
      },
    ],
    woerter: [
      { es: 'el arroz', de: 'der Reis' },
      { es: 'la sartén', de: 'die Pfanne' },
      { es: 'el campo', de: 'das Land, das Feld' },
      { es: 'el conejo', de: 'das Kaninchen' },
      { es: 'ancho', de: 'breit' },
      { es: 'llevar', de: 'enthalten' },
    ],
    wusstest:
      'Die knusprige Schicht Reis am Pfannenboden heißt „socarrat" und gilt als das Beste daran. Sie entsteht nur, wenn man am Schluss die Hitze noch einmal hochdreht.',
  },

  {
    id: 'el-carnaval',
    region: 'Kolumbien',
    titel: 'El carnaval',
    titelDe: 'Der Karneval',
    vorspann: 'Vier Tage, an denen in Barranquilla niemand arbeitet.',
    absaetze: [
      {
        es: 'En Barranquilla, en la costa de Colombia, hay un carnaval muy grande. Dura cuatro días y en la ciudad casi nadie trabaja durante ese tiempo.',
        de: 'In Barranquilla an der Küste Kolumbiens gibt es einen sehr großen Karneval. Er dauert vier Tage, und in der Stadt arbeitet in dieser Zeit fast niemand.',
      },
      {
        es: 'Hay desfiles con música, disfraces y máscaras de animales. Cada grupo baila su propio ritmo, y muchos vienen de pueblos pequeños de la región.',
        de: 'Es gibt Umzüge mit Musik, Kostümen und Tiermasken. Jede Gruppe tanzt ihren eigenen Rhythmus, und viele kommen aus kleinen Dörfern der Region.',
      },
      {
        es: 'Hay una frase que se repite mucho esos días: "Quien lo vive, es quien lo goza". Es decir, no basta con mirar, hay que participar.',
        de: 'Es gibt einen Satz, der in diesen Tagen oft wiederholt wird: „Wer es erlebt, hat auch etwas davon." Anders gesagt: Zuschauen reicht nicht, man muss mitmachen.',
      },
    ],
    woerter: [
      { es: 'el desfile', de: 'der Umzug' },
      { es: 'el disfraz', de: 'das Kostüm' },
      { es: 'la máscara', de: 'die Maske' },
      { es: 'el ritmo', de: 'der Rhythmus' },
      { es: 'durar', de: 'dauern' },
      { es: 'participar', de: 'mitmachen' },
    ],
    wusstest:
      'Der Karneval hat eine eigene Königin, aber auch einen Gegen-König: den „Rey Momo". Er steht für das Recht, vier Tage lang nichts ernst zu nehmen.',
  },

  {
    id: 'canarias',
    region: 'Kanarische Inseln',
    titel: 'El español de Canarias',
    titelDe: 'Das Spanisch der Kanaren',
    vorspann: 'Auf den Kanaren klingt Spanisch eher nach Kuba als nach Madrid.',
    absaetze: [
      {
        es: 'Las islas Canarias son españolas, pero están cerca de África. Su español no suena como el de Madrid: se parece más al de Cuba o Venezuela.',
        de: 'Die Kanarischen Inseln sind spanisch, liegen aber nahe bei Afrika. Ihr Spanisch klingt nicht wie das von Madrid: Es ähnelt eher dem von Kuba oder Venezuela.',
      },
      {
        es: 'La razón es histórica. Durante siglos, los barcos que iban a América paraban en las islas, y las palabras viajaron en las dos direcciones.',
        de: 'Der Grund ist historisch. Jahrhundertelang machten die Schiffe, die nach Amerika fuhren, auf den Inseln halt, und die Wörter reisten in beide Richtungen.',
      },
      {
        es: 'Hay palabras que solo se usan allí. Al autobús lo llaman guagua, y a las palomitas de maíz, cotufas. Un español de la península no siempre lo entiende.',
        de: 'Es gibt Wörter, die nur dort benutzt werden. Den Bus nennen sie „guagua" und das Popcorn „cotufas". Ein Spanier vom Festland versteht das nicht immer.',
      },
    ],
    woerter: [
      { es: 'la palabra', de: 'das Wort' },
      { es: 'el barco', de: 'das Schiff' },
      { es: 'el siglo', de: 'das Jahrhundert' },
      { es: 'el autobús', de: 'der Bus' },
      { es: 'sonar', de: 'klingen' },
      { es: 'parecerse a', de: 'ähneln' },
    ],
    wusstest:
      '„Guagua" heißt in den Anden etwas völlig anderes: dort ist es ein kleines Kind. Derselbe Satz kann also auf zwei Kontinenten sehr verschiedene Dinge bedeuten.',
  },

  {
    id: 'el-dia-de-reyes',
    region: 'Spanien & Lateinamerika',
    titel: 'El Día de Reyes',
    titelDe: 'Der Dreikönigstag',
    vorspann: 'In vielen Familien bringt nicht der Weihnachtsmann die Geschenke, sondern drei Könige.',
    absaetze: [
      {
        es: 'En España y en gran parte de América Latina, los regalos no llegan el 24 de diciembre. Llegan el seis de enero, y no los trae Papá Noel, sino los Reyes Magos.',
        de: 'In Spanien und in weiten Teilen Lateinamerikas kommen die Geschenke nicht am 24. Dezember. Sie kommen am 6. Januar, und sie bringt nicht der Weihnachtsmann, sondern die Heiligen Drei Könige.',
      },
      {
        es: 'La tarde anterior hay un desfile por la ciudad. Los Reyes van en carrozas y tiran caramelos a los niños, que esperan en la calle con bolsas.',
        de: 'Am Nachmittag davor gibt es einen Umzug durch die Stadt. Die Könige fahren auf Wagen und werfen den Kindern Bonbons zu, die mit Tüten auf der Straße warten.',
      },
      {
        es: 'Por la noche, los niños dejan sus zapatos junto a la ventana, y también agua para los camellos. A la mañana siguiente, los zapatos ya no están solos.',
        de: 'Nachts stellen die Kinder ihre Schuhe ans Fenster, dazu Wasser für die Kamele. Am nächsten Morgen stehen die Schuhe nicht mehr allein da.',
      },
    ],
    woerter: [
      { es: 'el regalo', de: 'das Geschenk' },
      { es: 'el rey', de: 'der König' },
      { es: 'el zapato', de: 'der Schuh' },
      { es: 'la ventana', de: 'das Fenster' },
      { es: 'traer', de: 'bringen' },
      { es: 'dejar', de: 'stellen, lassen' },
    ],
    wusstest:
      'Zum Fest gehört der „roscón de Reyes", ein Kranzkuchen. Darin ist eine Bohne versteckt – wer sie findet, muss den Kuchen im nächsten Jahr bezahlen.',
  },

  {
    id: 'la-quinua',
    region: 'Peru & Bolivien',
    titel: 'La quinua',
    titelDe: 'Die Quinoa',
    vorspann: 'Ein Korn, das dort wächst, wo sonst fast nichts mehr wächst.',
    absaetze: [
      {
        es: 'La quinua crece en los Andes, en Perú y Bolivia, a mucha altura. Allí hace frío por la noche y el suelo es pobre, pero la planta aguanta.',
        de: 'Die Quinoa wächst in den Anden, in Peru und Bolivien, in großer Höhe. Dort ist es nachts kalt und der Boden ist karg, aber die Pflanze hält es aus.',
      },
      {
        es: 'La gente de la región la come desde hace miles de años. Se prepara como el arroz y se usa en sopas, en ensaladas y también con leche por la mañana.',
        de: 'Die Menschen der Region essen sie seit Tausenden von Jahren. Sie wird wie Reis zubereitet und in Suppen, in Salaten und morgens auch mit Milch verwendet.',
      },
      {
        es: 'Hay un detalle importante: antes de cocinarla hay que lavarla bien. Los granos tienen una capa amarga por fuera que protege la planta de los pájaros.',
        de: 'Ein wichtiges Detail: Vor dem Kochen muss man sie gut waschen. Die Körner haben außen eine bittere Schicht, die die Pflanze vor Vögeln schützt.',
      },
    ],
    woerter: [
      { es: 'el suelo', de: 'der Boden' },
      { es: 'la sopa', de: 'die Suppe' },
      { es: 'la leche', de: 'die Milch' },
      { es: 'la capa', de: 'die Schicht' },
      { es: 'lavar', de: 'waschen' },
      { es: 'proteger', de: 'schützen' },
    ],
    wusstest:
      'Botanisch ist Quinoa gar kein Getreide, sondern mit Spinat und Rote Bete verwandt. Gegessen wird sie trotzdem wie Reis.',
  },

  {
    id: 'la-feria-de-abril',
    region: 'Sevilla',
    titel: 'La Feria de Abril',
    titelDe: 'Die Feria von Sevilla',
    vorspann: 'Eine Woche lang steht in Sevilla eine Stadt aus Zelten.',
    absaetze: [
      {
        es: 'En Sevilla, en primavera, se construye una ciudad pequeña de casetas: calles enteras de tiendas de tela, con luces de colores por encima.',
        de: 'In Sevilla wird im Frühling eine kleine Stadt aus „casetas" gebaut: ganze Straßen aus Stoffzelten, darüber bunte Lichter.',
      },
      {
        es: 'Dentro de cada caseta se come, se bebe y se baila sevillanas. Muchas mujeres llevan el traje de flamenca y muchos hombres van a caballo por la mañana.',
        de: 'In jedem Zelt wird gegessen, getrunken und Sevillanas getanzt. Viele Frauen tragen das Flamenco-Kleid, und viele Männer reiten morgens auf dem Pferd hindurch.',
      },
      {
        es: 'La mayoría de las casetas son privadas, de familias o de asociaciones. Pero también hay algunas públicas, donde puede entrar cualquiera.',
        de: 'Die meisten Zelte sind privat, von Familien oder Vereinen. Aber es gibt auch öffentliche, in die jeder hineingehen kann.',
      },
    ],
    woerter: [
      { es: 'la luz', de: 'das Licht' },
      { es: 'la tela', de: 'der Stoff' },
      { es: 'el traje', de: 'das Kleid, der Anzug' },
      { es: 'el caballo', de: 'das Pferd' },
      { es: 'dentro', de: 'drinnen' },
      { es: 'entrar', de: 'hineingehen' },
    ],
    wusstest:
      'Das Fest beginnt mit dem „alumbrado": Um Mitternacht gehen auf einen Schlag alle Lichter an. Bis dahin steht das Gelände dunkel da.',
  },

  {
    id: 'la-cumbia',
    region: 'Kolumbien',
    titel: 'La cumbia',
    titelDe: 'Die Cumbia',
    vorspann: 'Ein Rhythmus aus Kolumbien, den heute ein halber Kontinent tanzt.',
    absaetze: [
      {
        es: 'La cumbia nació en la costa de Colombia. En su música se juntan tres cosas: los tambores de África, las flautas de los indígenas y las melodías de España.',
        de: 'Die Cumbia entstand an der Küste Kolumbiens. In ihrer Musik kommen drei Dinge zusammen: die Trommeln aus Afrika, die Flöten der Indigenen und die Melodien aus Spanien.',
      },
      {
        es: 'El baile es tranquilo. Los pies dan pasos cortos, casi sin levantarse del suelo, y la pareja gira despacio, uno alrededor del otro.',
        de: 'Der Tanz ist ruhig. Die Füße machen kurze Schritte, fast ohne den Boden zu verlassen, und das Paar dreht sich langsam, eines um das andere.',
      },
      {
        es: 'Con los años, la cumbia salió de Colombia. Hoy se toca en México, en Perú y sobre todo en Argentina, y en cada país suena un poco distinta.',
        de: 'Im Lauf der Jahre verließ die Cumbia Kolumbien. Heute wird sie in Mexiko gespielt, in Peru und vor allem in Argentinien, und in jedem Land klingt sie ein wenig anders.',
      },
    ],
    woerter: [
      { es: 'el tambor', de: 'die Trommel' },
      { es: 'la flauta', de: 'die Flöte' },
      { es: 'el pie', de: 'der Fuß' },
      { es: 'la pareja', de: 'das Paar' },
      { es: 'girar', de: 'sich drehen' },
      { es: 'tocar', de: 'spielen (Musik)' },
    ],
    wusstest:
      'Beim traditionellen Tanz hält die Frau ein Bündel Kerzen in der Hand. Getanzt wurde ursprünglich nachts, und die Kerze war zugleich die Beleuchtung.',
  },
]

/**
 * Welcher Tag ist heute – als fortlaufende Zahl?
 *
 * Gerechnet ab einem festen Punkt, nicht als Tag im Jahr: Sonst
 * spränge die Liste jeden Silvester zurück auf Anfang und der
 * 1. Januar zeigte für immer dasselbe Stück. Dieselbe Rechnung wie
 * in zitate.js – wenn du sie dort änderst, ändere sie hier mit.
 */
function tagesZahl(datum = new Date()) {
  const TAG = 24 * 60 * 60 * 1000
  // Ortszeit, nicht UTC: Das Stück soll um Mitternacht hier wechseln.
  const heute = new Date(datum.getFullYear(), datum.getMonth(), datum.getDate())
  return Math.floor(heute.getTime() / TAG)
}

/**
 * Das Stück für heute.
 *
 * Gleich für alle und den ganzen Tag dasselbe – kein Zufall. Wer die
 * App zweimal öffnet, soll nicht zwei verschiedene Stücke sehen und
 * sich fragen, welches denn nun das heutige ist.
 */
export function stueckDesTages(datum = new Date()) {
  return STUECKE[tagesZahl(datum) % STUECKE.length]
}

/**
 * Alle Stücke, beginnend mit dem heutigen.
 *
 * Nicht die Rohliste: Die Reihenfolge im Quelltext ist die, in der
 * ich sie geschrieben habe, und die sagt dem Leser nichts. So steht
 * oben, was er heute bekommt, und dahinter das, was als Nächstes
 * kommt.
 */
export function reihenfolgeAbHeute(datum = new Date()) {
  const start = tagesZahl(datum) % STUECKE.length
  return [...STUECKE.slice(start), ...STUECKE.slice(0, start)]
}

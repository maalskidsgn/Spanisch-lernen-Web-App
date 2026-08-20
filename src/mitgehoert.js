// „Mitgehört" – Hörverstehen zwischen den Lektionen.
//
// Die Idee kam von Manuel am 20.08.: Dialoge hören, Fragen zum
// Inhalt beantworten, danach den Dialog lesen können.
//
// Warum es das braucht: Die App prüfte bisher nur Übersetzen.
// `hoeren` spielt einen Satz vor und fragt, was er bedeutet;
// `dialogquiz` zeigt ihn und fragt dasselbe. Nirgends wurde gefragt,
// worum es GING. Man kann jeden einzelnen Satz übersetzen und
// trotzdem nicht mitbekommen haben, was passiert ist – und genau das
// ist der Unterschied zwischen Vokabeln können und Spanisch
// verstehen.
//
// Die Reihenfolge ist der ganze Punkt:
//
//   1. Das Gespräch läuft EINMAL ohne Text. Nur Ton.
//   2. Danach die Fragen. Wiederhören so oft man will – Zuhören ist
//      die Übung, nicht Auswendiglernen.
//   3. Erst dann die Abschrift, mit Ton je Zeile.
//
// Wer den Text vorher sieht, hört nicht mehr zu. Deshalb steht die
// Abschrift hinten und nicht vorn.
//
// Warum von Hand geschrieben und nicht gezogen wie die Prüfstationen:
// Verstehensfragen lassen sich nicht aus Wortlisten ableiten. Sie
// brauchen eine Geschichte, in der etwas passiert – und falsche
// Antworten, die plausibel sind, ohne richtig zu sein. Das ist genau
// die Aufgabenart, bei der ein Modell am zuverlässigsten danebengreift:
// eine „falsche" Antwort, die auch stimmt, macht die Aufgabe unlösbar.
//
// Der Prüfer (pruefe-mitgehoert.mjs) fängt dafür die Falle ab, in die
// solche Aufgaben wirklich tappen – dass die richtige Antwort die
// einzige ist, deren Wörter im Dialog vorkommen. Dann rät man nach
// Stichwort, statt zu verstehen.

import { MODULE, lektionenVon, mischen } from './lektionen.js'

/** Wie viele Fragen eine Szene mindestens stellt. */
export const FRAGEN_MINDESTENS = 4

/**
 * Die sieben Szenen – eine je Modul.
 *
 * `ort` steht VOR dem Hören auf dem Bildschirm. Das ist kein
 * Entgegenkommen, sondern Handwerk: Auch in einer echten Prüfung
 * weiß man, ob man gleich ein Telefonat oder eine Durchsage hört.
 * Ohne diesen Satz rät man die ersten zwanzig Sekunden lang, worum
 * es überhaupt geht, statt zuzuhören.
 *
 * `fragenAuf` steuert die Sprache der Fragen. Modul 1 bis 3 fragen
 * auf Deutsch – sonst prüft die Aufgabe das Lesen mit, und ein
 * Anfänger scheitert an der Frage statt am Gespräch. Ab Modul 4
 * fragt sie auf Spanisch: Wer A2 hinter sich hat, soll nicht mehr
 * über den Umweg der Muttersprache verstehen.
 *
 * Gesprochen wird von der festen Besetzung (Ana, Tom, Luis, Carmen,
 * Lena). Wer dort nicht steht, bekäme eine Stimme nach Position
 * zugeteilt – ein Kellner klänge dann wie Tom.
 *
 * `sofortOffen` hat nur die erste Szene: Sie ist die Kostprobe und
 * wartet nicht auf die halbe Modulstrecke.
 */
export const SZENEN = [
  // =============================================================
  {
    id: 'mitgehoert-m1',
    modul: 'm1',
    titel: 'Mitgehört: Im Café',
    emoji: '☕',
    ort: 'Ein Café in Madrid, kurz vor Mittag. Tom ist neu in der Stadt.',
    fragenAuf: 'de',
    // Die Kostprobe. Als einzige Szene von Anfang an offen: Wer neu
    // ist, soll einmal erleben, dass er einem echten Gespraech schon
    // folgen kann – das ueberzeugt mehr als jede Beschreibung. Und es
    // erklaert, was "Mitgehört" ueberhaupt ist, bevor die Karte in
    // Modul 2 zum ersten Mal verschlossen dasteht.
    sofortOffen: true,
    dialog: [
      { sprecher: 'Tom', es: 'Buenos días. Un café, por favor.', de: 'Guten Tag. Einen Kaffee, bitte.' },
      { sprecher: 'Ana', es: 'Buenos días. ¿Solo o con leche?', de: 'Guten Tag. Schwarz oder mit Milch?' },
      { sprecher: 'Tom', es: 'Perdón, ¿puedes repetir? Más despacio, por favor.', de: 'Entschuldigung, kannst du das wiederholen? Langsamer, bitte.' },
      { sprecher: 'Ana', es: 'Claro. ¿Café solo… o café con leche?', de: 'Klar. Schwarzer Kaffee … oder Milchkaffee?' },
      { sprecher: 'Tom', es: 'Ah, con leche. Gracias.', de: 'Ah, mit Milch. Danke.' },
      { sprecher: 'Ana', es: 'No hablas español desde hace mucho, ¿verdad?', de: 'Du sprichst noch nicht lange Spanisch, oder?' },
      { sprecher: 'Tom', es: 'No. Hablo un poco. Estudio en casa.', de: 'Nein. Ich spreche ein bisschen. Ich lerne zu Hause.' },
      { sprecher: 'Ana', es: 'Pues hablas bien. ¿De dónde eres?', de: 'Also, du sprichst gut. Woher kommst du?' },
      { sprecher: 'Tom', es: 'Soy de Alemania. De Hamburgo.', de: 'Ich bin aus Deutschland. Aus Hamburg.' },
      { sprecher: 'Ana', es: '¡Alemania! ¿Y qué haces en Madrid?', de: 'Deutschland! Und was machst du in Madrid?' },
      { sprecher: 'Tom', es: 'Trabajo aquí. Soy profesor.', de: 'Ich arbeite hier. Ich bin Lehrer.' },
      { sprecher: 'Ana', es: '¿Profesor de qué?', de: 'Lehrer für was?' },
      { sprecher: 'Tom', es: 'De música. En una escuela pequeña.', de: 'Für Musik. An einer kleinen Schule.' },
      { sprecher: 'Ana', es: 'Qué bien. Yo soy estudiante. Estudio en la universidad.', de: 'Wie schön. Ich bin Studentin. Ich studiere an der Universität.' },
      { sprecher: 'Tom', es: '¿Y trabajas aquí también?', de: 'Und du arbeitest auch hier?' },
      { sprecher: 'Ana', es: 'Por la mañana aquí, por la tarde en la universidad. Estoy muy cansada.', de: 'Vormittags hier, nachmittags an der Uni. Ich bin sehr müde.' },
      { sprecher: 'Tom', es: 'Lo siento. ¿Cuántas horas trabajas?', de: 'Das tut mir leid. Wie viele Stunden arbeitest du?' },
      { sprecher: 'Ana', es: 'Cinco. De ocho a una. Pero el fin de semana estoy libre.', de: 'Fünf. Von acht bis eins. Aber am Wochenende habe ich frei.' },
      { sprecher: 'Tom', es: 'Yo también. ¿Cómo te llamas?', de: 'Ich auch. Wie heißt du?' },
      { sprecher: 'Ana', es: 'Ana. ¿Y tú?', de: 'Ana. Und du?' },
      { sprecher: 'Tom', es: 'Me llamo Tom. Mucho gusto.', de: 'Ich heiße Tom. Sehr erfreut.' },
      { sprecher: 'Ana', es: 'Encantada, Tom. ¿Cómo se escribe? ¿Con dos emes?', de: 'Freut mich, Tom. Wie schreibt man das? Mit zwei M?' },
      { sprecher: 'Tom', es: 'No, con una. T–O–M.', de: 'Nein, mit einem. T–O–M.' },
      { sprecher: 'Ana', es: 'Vale. ¿Y dónde vives?', de: 'Alles klar. Und wo wohnst du?' },
      { sprecher: 'Tom', es: 'En la calle Goya. Al lado de la farmacia.', de: 'In der Calle Goya. Neben der Apotheke.' },
      { sprecher: 'Ana', es: '¡No! Yo vivo enfrente. En el número doce.', de: 'Nein! Ich wohne gegenüber. In der Nummer zwölf.' },
      { sprecher: 'Tom', es: '¿Verdad? Entonces somos vecinos.', de: 'Wirklich? Dann sind wir ja Nachbarn.' },
      { sprecher: 'Ana', es: 'Somos vecinos. Qué pequeño es Madrid.', de: 'Wir sind Nachbarn. Wie klein Madrid ist.' },
      { sprecher: 'Tom', es: 'Muy pequeño. Bueno, hasta luego, vecina.', de: 'Sehr klein. Also, bis später, Nachbarin.' },
      { sprecher: 'Ana', es: 'Hasta luego. Y tu café… es gratis hoy.', de: 'Bis später. Und dein Kaffee … geht heute aufs Haus.' },
    ],
    fragen: [
      {
        frage: 'Warum bittet Tom am Anfang um eine Wiederholung?',
        optionen: [
          'Er hat die Frage nicht schnell genug verstanden',
          'Im Café ist es zu laut',
          'Ana hat sich versprochen',
        ],
        loesung: 'Er hat die Frage nicht schnell genug verstanden',
      },
      {
        frage: 'Was arbeitet Tom?',
        optionen: [
          'Er ist Musiklehrer',
          'Er ist Musiker in einer Band',
          'Er studiert Musik',
          'Er arbeitet im Café',
        ],
        loesung: 'Er ist Musiklehrer',
      },
      {
        frage: 'Wie sieht Anas Tag aus?',
        optionen: [
          'Vormittags Café, nachmittags Universität',
          'Vormittags Universität, nachmittags Café',
          'Sie arbeitet nur am Wochenende',
          'Sie arbeitet den ganzen Tag im Café',
        ],
        loesung: 'Vormittags Café, nachmittags Universität',
      },
      {
        frage: 'Was stellt sich am Ende heraus?',
        optionen: [
          'Die beiden wohnen in derselben Straße',
          'Die beiden kennen sich von der Universität',
          'Ana ist auch aus Deutschland',
          'Tom war schon einmal in diesem Café',
        ],
        loesung: 'Die beiden wohnen in derselben Straße',
      },
      {
        frage: 'Wie endet das Gespräch?',
        optionen: [
          'Ana lässt Tom den Kaffee nicht bezahlen',
          'Sie verabreden sich für das Wochenende',
          'Tom bezahlt und lässt Trinkgeld da',
          'Ana schreibt Tom ihre Adresse auf',
        ],
        loesung: 'Ana lässt Tom den Kaffee nicht bezahlen',
      },
    ],
  },

  // =============================================================
  {
    id: 'mitgehoert-m2',
    modul: 'm2',
    titel: 'Mitgehört: Die Einkaufsliste',
    emoji: '🛒',
    ort: 'Anas Küche, Samstagvormittag. Ana und Carmen teilen sich die Wohnung.',
    fragenAuf: 'de',
    dialog: [
      { sprecher: 'Carmen', es: 'Ana, ¿ya estás despierta? Son las once.', de: 'Ana, bist du schon wach? Es ist elf Uhr.' },
      { sprecher: 'Ana', es: 'Sí, sí. Me he levantado hace diez minutos.', de: 'Ja, ja. Ich bin vor zehn Minuten aufgestanden.' },
      { sprecher: 'Carmen', es: 'Los sábados siempre te acuestas tardísimo.', de: 'Samstags gehst du immer superspät ins Bett.' },
      { sprecher: 'Ana', es: 'Y los domingos descanso. Está todo en orden.', de: 'Und sonntags ruhe ich mich aus. Alles in Ordnung.' },
      { sprecher: 'Carmen', es: 'Oye, ¿desayunamos y vamos al supermercado?', de: 'Hör mal, frühstücken wir und gehen dann in den Supermarkt?' },
      { sprecher: 'Ana', es: 'Vale. ¿Qué hay en la nevera?', de: 'Alles klar. Was ist im Kühlschrank?' },
      { sprecher: 'Carmen', es: 'Nada. Bueno, tres huevos y media cebolla.', de: 'Nichts. Also, drei Eier und eine halbe Zwiebel.' },
      { sprecher: 'Ana', es: '¿Y la leche?', de: 'Und die Milch?' },
      { sprecher: 'Carmen', es: 'Se acabó ayer. Y el pan también.', de: 'Ist gestern ausgegangen. Und das Brot auch.' },
      { sprecher: 'Ana', es: 'Entonces hoy no hay tostadas. Qué pena.', de: 'Dann gibt es heute keine Toasts. Wie schade.' },
      { sprecher: 'Carmen', es: 'Hago la lista. Leche, pan, fruta, verdura…', de: 'Ich schreibe die Liste. Milch, Brot, Obst, Gemüse …' },
      { sprecher: 'Ana', es: 'Y patatas. Quiero hacer tortilla esta noche.', de: 'Und Kartoffeln. Ich will heute Abend Tortilla machen.' },
      { sprecher: 'Carmen', es: '¿Tortilla otra vez? La hiciste el martes.', de: 'Schon wieder Tortilla? Die hast du am Dienstag gemacht.' },
      { sprecher: 'Ana', es: 'Es que me sale muy bien.', de: 'Sie gelingt mir eben sehr gut.' },
      { sprecher: 'Carmen', es: 'Te sale bien, sí. Pero comemos lo mismo cada semana.', de: 'Sie gelingt dir, ja. Aber wir essen jede Woche dasselbe.' },
      { sprecher: 'Ana', es: 'Vale, vale. ¿Y qué quieres tú?', de: 'Gut, gut. Und was willst du?' },
      { sprecher: 'Carmen', es: 'Pescado. Con verdura. Algo ligero.', de: 'Fisch. Mit Gemüse. Etwas Leichtes.' },
      { sprecher: 'Ana', es: 'El pescado es caro.', de: 'Fisch ist teuer.' },
      { sprecher: 'Carmen', es: 'Hoy hay oferta. Lo vi en el folleto.', de: 'Heute ist er im Angebot. Ich hab es im Prospekt gesehen.' },
      { sprecher: 'Ana', es: 'Ah, entonces vale. ¿Vamos a pie?', de: 'Ah, dann ist gut. Gehen wir zu Fuß?' },
      { sprecher: 'Carmen', es: 'Sí, está cerca. Cinco minutos.', de: 'Ja, es ist nah. Fünf Minuten.' },
      { sprecher: 'Ana', es: 'Espera, necesito la bolsa grande.', de: 'Warte, ich brauche die große Tasche.' },
      { sprecher: 'Carmen', es: 'Está en el armario, detrás de los abrigos.', de: 'Sie ist im Schrank, hinter den Mänteln.' },
      { sprecher: 'Ana', es: 'Ya la tengo. ¿Llevamos dinero en efectivo?', de: 'Ich hab sie. Nehmen wir Bargeld mit?' },
      { sprecher: 'Carmen', es: 'Con tarjeta es más fácil.', de: 'Mit Karte ist es einfacher.' },
      { sprecher: 'Ana', es: 'Vale. Oye, ¿y esta noche viene Luis?', de: 'Gut. Sag mal, und kommt Luis heute Abend?' },
      { sprecher: 'Carmen', es: 'Sí, sobre las nueve.', de: 'Ja, gegen neun.' },
      { sprecher: 'Ana', es: 'Entonces compramos más pescado. Él come muchísimo.', de: 'Dann kaufen wir mehr Fisch. Er isst wahnsinnig viel.' },
      { sprecher: 'Carmen', es: 'Es verdad. Pongo dos kilos en la lista.', de: 'Das stimmt. Ich schreibe zwei Kilo auf die Liste.' },
      { sprecher: 'Ana', es: 'Perfecto. Vamos, que a la una hay mucha gente.', de: 'Perfekt. Los, um eins ist da viel los.' },
    ],
    fragen: [
      {
        frage: 'Was ist noch im Kühlschrank?',
        optionen: [
          'Drei Eier und eine halbe Zwiebel',
          'Nur Milch',
          'Eier, Milch und Brot',
          'Gar nichts mehr',
        ],
        loesung: 'Drei Eier und eine halbe Zwiebel',
      },
      {
        frage: 'Warum ist Carmen mit Anas Vorschlag nicht einverstanden?',
        optionen: [
          'Es gab dasselbe Gericht erst vor ein paar Tagen',
          'Ana kann es nicht besonders gut kochen',
          'Die Zutaten dafür sind zu teuer',
          'Sie hat abends keinen Hunger',
        ],
        loesung: 'Es gab dasselbe Gericht erst vor ein paar Tagen',
      },
      {
        frage: 'Warum wird der Fisch am Ende doch gekauft?',
        optionen: [
          'Er ist heute im Angebot',
          'Carmen bezahlt ihn allein',
          'Ana mag Fisch lieber als Kartoffeln',
          'Es ist nichts anderes mehr da',
        ],
        loesung: 'Er ist heute im Angebot',
      },
      {
        frage: 'Womit wollen die beiden bezahlen?',
        optionen: [
          'Mit Karte, weil es bequemer ist',
          'Mit Bargeld, weil Ana keine Karte hat',
          'Jede bezahlt ihren Teil selbst',
          'Carmen legt alles aus',
        ],
        loesung: 'Mit Karte, weil es bequemer ist',
      },
      {
        frage: 'Warum wird die Einkaufsmenge am Ende größer?',
        optionen: [
          'Abends kommt Besuch, der viel isst',
          'Der Supermarkt hat morgen zu',
          'Sie wollen für die ganze Woche einkaufen',
          'Die Angebote gelten nur für zwei Kilo',
        ],
        loesung: 'Abends kommt Besuch, der viel isst',
      },
    ],
  },

  // =============================================================
  {
    id: 'mitgehoert-m3',
    modul: 'm3',
    titel: 'Mitgehört: Die Einladung',
    emoji: '🎉',
    ort: 'Ein Telefonat. Luis ruft Tom an, es ist Mittwochabend.',
    fragenAuf: 'de',
    dialog: [
      { sprecher: 'Luis', es: '¿Tom? Soy Luis. ¿Te pillo mal?', de: 'Tom? Hier ist Luis. Störe ich gerade?' },
      { sprecher: 'Tom', es: 'No, no. Estaba leyendo. Dime.', de: 'Nein, nein. Ich hab gerade gelesen. Sag.' },
      { sprecher: 'Luis', es: 'El sábado hago una fiesta. Cumplo treinta.', de: 'Am Samstag mache ich eine Party. Ich werde dreißig.' },
      { sprecher: 'Tom', es: '¡Enhorabuena! ¿Treinta ya?', de: 'Herzlichen Glückwunsch! Schon dreißig?' },
      { sprecher: 'Luis', es: 'Ya. No me lo recuerdes.', de: 'Ja. Erinner mich nicht dran.' },
      { sprecher: 'Tom', es: '¿Y dónde es?', de: 'Und wo ist sie?' },
      { sprecher: 'Luis', es: 'En mi piso. A partir de las nueve.', de: 'In meiner Wohnung. Ab neun.' },
      { sprecher: 'Tom', es: 'Me apetece mucho. Pero no conozco a nadie.', de: 'Ich hätte große Lust. Aber ich kenne niemanden.' },
      { sprecher: 'Luis', es: 'Conoces a Ana. Y a Carmen.', de: 'Du kennst Ana. Und Carmen.' },
      { sprecher: 'Tom', es: 'Es verdad. ¿Vienen ellas?', de: 'Stimmt. Kommen die beiden?' },
      { sprecher: 'Luis', es: 'Claro. Y unos quince más.', de: 'Klar. Und noch ungefähr fünfzehn andere.' },
      { sprecher: 'Tom', es: '¿Quince? Uf.', de: 'Fünfzehn? Puh.' },
      { sprecher: 'Luis', es: 'Tranquilo. Son todos majos.', de: 'Ganz ruhig. Das sind alles nette Leute.' },
      { sprecher: 'Tom', es: 'Es que hablan muy rápido y me pierdo.', de: 'Es ist nur so, dass sie sehr schnell reden und ich den Faden verliere.' },
      { sprecher: 'Luis', es: 'Pues les dices que hablen despacio. Nadie se enfada.', de: 'Dann sagst du ihnen, sie sollen langsam reden. Da ist niemand beleidigt.' },
      { sprecher: 'Tom', es: 'Nunca lo he hecho.', de: 'Das hab ich noch nie gemacht.' },
      { sprecher: 'Luis', es: 'Pues empieza el sábado. Te lo digo en serio.', de: 'Dann fang am Samstag damit an. Das mein ich ernst.' },
      { sprecher: 'Tom', es: 'Vale. Voy. ¿Llevo algo?', de: 'Gut. Ich komme. Soll ich was mitbringen?' },
      { sprecher: 'Luis', es: 'Bebida, si quieres. Comida hay de sobra.', de: 'Getränke, wenn du magst. Essen gibt es mehr als genug.' },
      { sprecher: 'Tom', es: '¿Vino? ¿Cerveza?', de: 'Wein? Bier?' },
      { sprecher: 'Luis', es: 'Cerveza mejor. El vino no le gusta a casi nadie.', de: 'Bier lieber. Wein mag fast niemand.' },
      { sprecher: 'Tom', es: 'Anotado. ¿Y regalo?', de: 'Notiert. Und ein Geschenk?' },
      { sprecher: 'Luis', es: 'Nada de regalos. En serio, nada.', de: 'Bloß keine Geschenke. Im Ernst, nichts.' },
      { sprecher: 'Tom', es: 'En Alemania eso no se dice.', de: 'In Deutschland sagt man das nicht.' },
      { sprecher: 'Luis', es: 'Aquí sí. Y va en serio.', de: 'Hier schon. Und es ist ernst gemeint.' },
      { sprecher: 'Tom', es: 'Vale, vale. Oye, ¿hasta qué hora?', de: 'Gut, gut. Sag mal, bis wann geht das?' },
      { sprecher: 'Luis', es: 'Ni idea. Las tres, las cuatro.', de: 'Keine Ahnung. Drei, vier Uhr.' },
      { sprecher: 'Tom', es: '¿De la madrugada?', de: 'Nachts?' },
      { sprecher: 'Luis', es: 'Es una fiesta española, Tom.', de: 'Es ist eine spanische Party, Tom.' },
      { sprecher: 'Tom', es: 'Entonces duermo el domingo. Hasta el sábado.', de: 'Dann schlafe ich am Sonntag. Bis Samstag.' },
    ],
    fragen: [
      {
        frage: 'Was macht Tom nervös an der Einladung?',
        optionen: [
          'Er kennt fast niemanden und kommt beim schnellen Reden nicht mit',
          'Er hat am Samstag schon etwas anderes vor und müsste dafür absagen',
          'Er weiß nicht, wie er zu Luis nach Hause kommen soll',
          'Er war noch nie auf einer spanischen Geburtstagsfeier',
        ],
        loesung: 'Er kennt fast niemanden und kommt beim schnellen Reden nicht mit',
      },
      {
        frage: 'Was rät Luis ihm dazu?',
        optionen: [
          'Er soll die Leute einfach bitten, langsamer zu sprechen',
          'Er soll sich zu Ana und Carmen setzen und bei ihnen bleiben',
          'Er soll später kommen, wenn nicht mehr so viele da sind',
          'Er soll sich vorher ein paar Sätze zurechtlegen',
        ],
        loesung: 'Er soll die Leute einfach bitten, langsamer zu sprechen',
      },
      {
        frage: 'Was soll Tom mitbringen?',
        optionen: [
          'Bier, weil Wein kaum jemand mag',
          'Wein, weil davon zu wenig da ist',
          'Etwas zu essen',
          'Nichts, es ist für alles gesorgt',
        ],
        loesung: 'Bier, weil Wein kaum jemand mag',
      },
      {
        frage: 'Wie reagiert Tom auf die Sache mit dem Geschenk?',
        optionen: [
          'Er ist überrascht, weil man das in Deutschland anders sagt',
          'Er hält es für eine Floskel und will trotzdem etwas mitbringen',
          'Er fragt Ana, was in Spanien üblich ist',
          'Er findet es unhöflich von Luis, so etwas zu sagen',
        ],
        loesung: 'Er ist überrascht, weil man das in Deutschland anders sagt',
      },
      {
        frage: 'Wie lange soll die Feier gehen?',
        optionen: [
          'Bis in die frühen Morgenstunden',
          'Bis Mitternacht, dann müssen alle gehen',
          'Das hat Luis noch nicht festgelegt',
          'Nur zwei, drei Stunden am Abend',
        ],
        loesung: 'Bis in die frühen Morgenstunden',
      },
    ],
  },

  // =============================================================
  {
    id: 'mitgehoert-m4',
    modul: 'm4',
    titel: 'Mitgehört: Am Bahnhof',
    emoji: '🚉',
    ort: 'Bahnhof Atocha, Madrid. Tom und Lena wollen nach Valencia. Lena ist zu Besuch aus Deutschland.',
    fragenAuf: 'es',
    dialog: [
      { sprecher: 'Lena', es: 'Tom, mira el panel. ¿Qué pone ahí?', de: 'Tom, schau auf die Anzeigetafel. Was steht da?' },
      { sprecher: 'Tom', es: 'El de las once y media… lleva cuarenta minutos de retraso.', de: 'Der um halb zwölf … hat vierzig Minuten Verspätung.' },
      { sprecher: 'Lena', es: '¿Cuarenta? Pero si hemos venido corriendo.', de: 'Vierzig? Und dabei sind wir hergerannt.' },
      { sprecher: 'Tom', es: 'Ya. Podríamos habernos tomado el café tranquilamente.', de: 'Tja. Wir hätten in Ruhe Kaffee trinken können.' },
      { sprecher: 'Lena', es: '¿Y no hay otro antes?', de: 'Und es gibt keinen früheren?' },
      { sprecher: 'Tom', es: 'Espera, pregunto en información.', de: 'Warte, ich frage an der Information.' },
      { sprecher: 'Lena', es: 'Voy contigo. Quiero oírlo yo también.', de: 'Ich komme mit. Ich will es auch hören.' },
      { sprecher: 'Tom', es: 'Buenos días. ¿El tren a Valencia sale con retraso?', de: 'Guten Tag. Fährt der Zug nach Valencia mit Verspätung?' },
      { sprecher: 'Ana', es: 'Sí, cuarenta minutos. Saldrá a las doce y diez del andén siete.', de: 'Ja, vierzig Minuten. Er fährt um zehn nach zwölf von Gleis sieben.' },
      { sprecher: 'Tom', es: '¿Del siete? En el billete pone tres.', de: 'Von Gleis sieben? Auf dem Ticket steht drei.' },
      { sprecher: 'Ana', es: 'Han cambiado el andén. Pasa a menudo.', de: 'Sie haben das Gleis geändert. Das kommt oft vor.' },
      { sprecher: 'Lena', es: '¿Y hay algún tren antes?', de: 'Und gibt es einen Zug vorher?' },
      { sprecher: 'Ana', es: 'Hay uno a las once y cincuenta, pero está completo.', de: 'Es gibt einen um zehn vor zwölf, aber der ist ausgebucht.' },
      { sprecher: 'Tom', es: 'Entonces esperamos. ¿Se puede cambiar el billete?', de: 'Dann warten wir. Kann man das Ticket umtauschen?' },
      { sprecher: 'Ana', es: 'Con más de treinta minutos de retraso, sí. En la taquilla.', de: 'Bei mehr als dreißig Minuten Verspätung, ja. Am Schalter.' },
      { sprecher: 'Lena', es: '¿Y devuelven dinero?', de: 'Und geben sie Geld zurück?' },
      { sprecher: 'Ana', es: 'Parte, sí. Pero llegan ustedes igual hoy.', de: 'Einen Teil, ja. Aber Sie kommen heute trotzdem an.' },
      { sprecher: 'Tom', es: 'Muchas gracias. Una cosa más: ¿hay consigna?', de: 'Vielen Dank. Noch eine Sache: Gibt es Schließfächer?' },
      { sprecher: 'Ana', es: 'Sí, al fondo a la derecha, después de la cafetería.', de: 'Ja, ganz hinten rechts, hinter der Cafeteria.' },
      { sprecher: 'Tom', es: 'Perfecto. Gracias.', de: 'Perfekt. Danke.' },
      { sprecher: 'Lena', es: 'Bueno. Cuarenta minutos. ¿Qué hacemos?', de: 'Also. Vierzig Minuten. Was machen wir?' },
      { sprecher: 'Tom', es: 'Dejamos las maletas y nos tomamos algo.', de: 'Wir geben die Koffer ab und trinken was.' },
      { sprecher: 'Lena', es: 'Vale, pero yo invito. Tú pagaste ayer.', de: 'Gut, aber ich lade ein. Du hast gestern bezahlt.' },
      { sprecher: 'Tom', es: 'Como quieras. Oye, ¿tienes el hotel reservado?', de: 'Wie du willst. Sag mal, hast du das Hotel gebucht?' },
      { sprecher: 'Lena', es: 'Sí, desde hace dos semanas. Está al lado de la playa.', de: 'Ja, seit zwei Wochen. Es liegt direkt am Strand.' },
      { sprecher: 'Tom', es: '¿Y cómo llegamos desde la estación?', de: 'Und wie kommen wir vom Bahnhof dorthin?' },
      { sprecher: 'Lena', es: 'En metro, tres paradas. O andando media hora.', de: 'Mit der Metro, drei Stationen. Oder eine halbe Stunde zu Fuß.' },
      { sprecher: 'Tom', es: 'Con las maletas, metro.', de: 'Mit den Koffern: Metro.' },
      { sprecher: 'Lena', es: 'Eso digo yo. Venga, vamos a por ese café.', de: 'Sag ich doch. Komm, holen wir uns den Kaffee.' },
      { sprecher: 'Tom', es: 'Y esta vez sin correr.', de: 'Und diesmal ohne zu rennen.' },
    ],
    fragen: [
      {
        frage: '¿Por qué están molestos al principio?',
        optionen: [
          'Han corrido para nada, porque el tren llega tarde',
          'Han perdido el tren por poco',
          'No encuentran el andén correcto',
          'Han olvidado los billetes en casa',
        ],
        loesung: 'Han corrido para nada, porque el tren llega tarde',
      },
      {
        frage: '¿Qué problema hay con el billete?',
        optionen: [
          'El andén impreso ya no es el correcto',
          'La hora impresa es de otro día',
          'Es un billete para otra ciudad',
          'Está a nombre de otra persona',
        ],
        loesung: 'El andén impreso ya no es el correcto',
      },
      {
        frage: '¿Por qué no cogen el tren anterior?',
        optionen: [
          'Ya no quedan plazas libres',
          'Sale desde otra estación',
          'Cuesta bastante más',
          'Llegaría demasiado tarde por la noche',
        ],
        loesung: 'Ya no quedan plazas libres',
      },
      {
        frage: '¿Qué deciden hacer mientras esperan?',
        optionen: [
          'Guardar el equipaje y tomar algo',
          'Cambiar los billetes en la taquilla',
          'Buscar otro medio de transporte',
          'Dar un paseo por el centro',
        ],
        loesung: 'Guardar el equipaje y tomar algo',
      },
      {
        frage: '¿Cómo irán al hotel al llegar?',
        optionen: [
          'En metro, porque llevan maletas',
          'Andando, porque está muy cerca',
          'En taxi, porque es más rápido',
          'Los recoge un amigo en coche',
        ],
        loesung: 'En metro, porque llevan maletas',
      },
    ],
  },

  // =============================================================
  {
    id: 'mitgehoert-m5',
    modul: 'm5',
    titel: 'Mitgehört: Was gestern passiert ist',
    emoji: '📖',
    ort: 'Ein Park, Sonntagnachmittag. Ana erzählt Luis von einem missglückten Abend.',
    fragenAuf: 'es',
    dialog: [
      { sprecher: 'Luis', es: 'Oye, ¿qué te pasó ayer? Carmen me dijo algo raro.', de: 'Sag mal, was ist dir gestern passiert? Carmen hat mir was Seltsames erzählt.' },
      { sprecher: 'Ana', es: 'Ay, no me lo recuerdes. Menudo día.', de: 'Ach, erinner mich nicht dran. Was für ein Tag.' },
      { sprecher: 'Luis', es: 'Cuenta, cuenta.', de: 'Erzähl, erzähl.' },
      { sprecher: 'Ana', es: 'Pues era sábado, sobre las ocho. Iba a salir con Carmen.', de: 'Also, es war Samstag, gegen acht. Ich wollte mit Carmen ausgehen.' },
      { sprecher: 'Luis', es: 'Hasta ahí todo normal.', de: 'Bis dahin alles normal.' },
      { sprecher: 'Ana', es: 'Cerré la puerta, bajé las escaleras… y me di cuenta.', de: 'Ich schloss die Tür, ging die Treppe runter … und da fiel es mir auf.' },
      { sprecher: 'Luis', es: 'No me digas. ¿Las llaves dentro?', de: 'Sag bloß. Die Schlüssel drinnen?' },
      { sprecher: 'Ana', es: 'Se me quedaron encima de la mesa. Las vi por la ventana.', de: 'Die lagen auf dem Tisch liegengeblieben. Ich hab sie durchs Fenster gesehen.' },
      { sprecher: 'Luis', es: 'Qué rabia. ¿Y Carmen no tenía copia?', de: 'Wie ärgerlich. Und Carmen hatte keinen Zweitschlüssel?' },
      { sprecher: 'Ana', es: 'Sí, pero ya estaba en el bar esperándome.', de: 'Doch, aber sie war schon in der Bar und hat auf mich gewartet.' },
      { sprecher: 'Luis', es: 'Pues la llamas y ya está.', de: 'Dann rufst du sie eben an, fertig.' },
      { sprecher: 'Ana', es: 'Eso pensé yo. Saqué el móvil… y no tenía batería.', de: 'Das dachte ich auch. Ich holte das Handy raus … und es hatte keinen Akku.' },
      { sprecher: 'Luis', es: 'No puede ser.', de: 'Das gibt es doch nicht.' },
      { sprecher: 'Ana', es: 'Se apagó justo en ese momento. Cero por ciento.', de: 'Es ging genau in dem Moment aus. Null Prozent.' },
      { sprecher: 'Luis', es: '¿Y qué hiciste?', de: 'Und was hast du gemacht?' },
      { sprecher: 'Ana', es: 'Me senté en el portal. Estuve media hora ahí.', de: 'Ich hab mich in den Hausflur gesetzt. Ich saß eine halbe Stunde da.' },
      { sprecher: 'Luis', es: '¿Media hora sin hacer nada?', de: 'Eine halbe Stunde ohne irgendwas zu tun?' },
      { sprecher: 'Ana', es: 'Pensando en lo tonta que había sido, sobre todo.', de: 'Vor allem darüber nachdenkend, wie dumm ich gewesen war.' },
      { sprecher: 'Luis', es: 'Bueno, le pasa a cualquiera.', de: 'Na ja, das passiert jedem.' },
      { sprecher: 'Ana', es: 'Total que bajó la vecina del cuarto. La señora mayor.', de: 'Kurzum, die Nachbarin aus dem vierten Stock kam runter. Die ältere Dame.' },
      { sprecher: 'Luis', es: '¿Doña Pilar?', de: 'Doña Pilar?' },
      { sprecher: 'Ana', es: 'Esa. Me vio la cara y me invitó a subir.', de: 'Genau die. Sie sah mein Gesicht und lud mich nach oben ein.' },
      { sprecher: 'Luis', es: '¿Y subiste?', de: 'Und bist du hochgegangen?' },
      { sprecher: 'Ana', es: 'Claro. Me dejó el teléfono y me hizo un café.', de: 'Klar. Sie ließ mich telefonieren und machte mir einen Kaffee.' },
      { sprecher: 'Luis', es: 'Menos mal.', de: 'Zum Glück.' },
      { sprecher: 'Ana', es: 'Y lo mejor: estuvimos hablando hora y media.', de: 'Und das Beste: Wir haben anderthalb Stunden geredet.' },
      { sprecher: 'Luis', es: '¿De qué?', de: 'Worüber?' },
      { sprecher: 'Ana', es: 'De cuando era joven. Vivió en Argentina veinte años.', de: 'Von früher, als sie jung war. Sie hat zwanzig Jahre in Argentinien gelebt.' },
      { sprecher: 'Luis', es: 'Vaya. Llevas tres años en ese piso y no lo sabías.', de: 'Krass. Du wohnst drei Jahre in dieser Wohnung und wusstest das nicht.' },
      { sprecher: 'Ana', es: 'Ni una palabra. Al final valió la pena quedarme fuera.', de: 'Kein Wort. Am Ende hat es sich gelohnt, ausgesperrt zu sein.' },
    ],
    fragen: [
      {
        frage: '¿Qué le pasó a Ana al salir de casa?',
        optionen: [
          'Dejó las llaves dentro sin darse cuenta',
          'Perdió las llaves en algún punto del camino',
          'Se le rompió la llave dentro de la cerradura',
          'Se equivocó de puerta y no pudo abrir',
        ],
        loesung: 'Dejó las llaves dentro sin darse cuenta',
      },
      {
        frage: '¿Por qué no pudo avisar a Carmen?',
        optionen: [
          'El móvil se le apagó en ese mismo momento',
          'No se acordaba del número de memoria',
          'Carmen tenía el teléfono apagado en el bar',
          'Se había dejado el móvil arriba también',
        ],
        loesung: 'El móvil se le apagó en ese mismo momento',
      },
      {
        frage: '¿Qué hizo durante la media hora siguiente?',
        optionen: [
          'Se quedó sentada en el portal dándole vueltas',
          'Fue andando hasta el bar para buscar a Carmen',
          'Llamó a un cerrajero desde una cabina',
          'Estuvo buscando a alguien con una copia',
        ],
        loesung: 'Se quedó sentada en el portal dándole vueltas',
      },
      {
        frage: '¿Cómo se resolvió la situación?',
        optionen: [
          'Una vecina la invitó a subir y le dejó llamar',
          'Carmen volvió del bar al ver que no llegaba nadie',
          'Su hermano le llevó la copia de las llaves',
          'Consiguió entrar por la ventana del patio',
        ],
        loesung: 'Una vecina la invitó a subir y le dejó llamar',
      },
      {
        frage: '¿Por qué dice al final que mereció la pena?',
        optionen: [
          'Descubrió algo de la vecina que no sabía en tres años',
          'Al final llegó al bar antes de que cerraran',
          'La vecina le dio una copia de sus llaves para la próxima vez',
          'Aprendió a no salir nunca sin batería en el móvil',
        ],
        loesung: 'Descubrió algo de la vecina que no sabía en tres años',
      },
    ],
  },

  // =============================================================
  {
    id: 'mitgehoert-m6',
    modul: 'm6',
    titel: 'Mitgehört: Das Fest im Dorf',
    emoji: '🎺',
    ort: 'Eine Terrasse am Abend. Carmen kommt aus Kolumbien, Luis aus Valencia.',
    fragenAuf: 'es',
    dialog: [
      { sprecher: 'Luis', es: 'Carmen, el mes que viene son las fiestas de mi pueblo. ¿Te vienes?', de: 'Carmen, nächsten Monat ist das Fest in meinem Dorf. Kommst du mit?' },
      { sprecher: 'Carmen', es: '¿Y eso qué es exactamente? Porque aquí hay fiestas cada semana.', de: 'Und was ist das genau? Hier ist ja jede Woche irgendein Fest.' },
      { sprecher: 'Luis', es: 'Cuatro días. Música en la plaza, comida, y no se duerme.', de: 'Vier Tage. Musik auf dem Platz, Essen, und geschlafen wird nicht.' },
      { sprecher: 'Carmen', es: 'Eso me suena. ¿Y qué música?', de: 'Das kommt mir bekannt vor. Und was für Musik?' },
      { sprecher: 'Luis', es: 'De todo. Pero sobre todo la banda del pueblo.', de: 'Alles Mögliche. Aber vor allem die Dorfkapelle.' },
      { sprecher: 'Carmen', es: '¿Banda? ¿Con trompetas y todo?', de: 'Kapelle? Mit Trompeten und allem?' },
      { sprecher: 'Luis', es: 'Con trompetas, tambores, cincuenta personas.', de: 'Mit Trompeten, Trommeln, fünfzig Leuten.' },
      { sprecher: 'Carmen', es: 'Ojalá pudiera llevar a mi madre. Le encantaría.', de: 'Wenn ich nur meine Mutter mitnehmen könnte. Es würde ihr gefallen.' },
      { sprecher: 'Luis', es: 'Pues que venga. ¿Cuándo viene de Colombia?', de: 'Dann soll sie doch kommen. Wann kommt sie aus Kolumbien?' },
      { sprecher: 'Carmen', es: 'En noviembre. Demasiado tarde.', de: 'Im November. Zu spät.' },
      { sprecher: 'Luis', es: 'Qué pena. ¿Y allá tenéis algo parecido?', de: 'Wie schade. Und habt ihr drüben etwas Ähnliches?' },
      { sprecher: 'Carmen', es: 'Uy, sí. En mi ciudad la feria dura una semana entera.', de: 'Oh ja. In meiner Stadt dauert die Feria eine ganze Woche.' },
      { sprecher: 'Luis', es: '¿Una semana? Nosotros nos quedamos cortos entonces.', de: 'Eine Woche? Dann sind wir ja bescheiden.' },
      { sprecher: 'Carmen', es: 'Y con desfile. Carrozas, flores, la gente en la calle.', de: 'Und mit Umzug. Festwagen, Blumen, die Leute auf der Straße.' },
      { sprecher: 'Luis', es: 'Eso también lo tenemos. Pero un solo día.', de: 'Das haben wir auch. Aber nur einen Tag.' },
      { sprecher: 'Carmen', es: 'Lo que no entiendo de aquí es cenar a las diez.', de: 'Was ich hier nicht verstehe, ist um zehn zu Abend zu essen.' },
      { sprecher: 'Luis', es: '¿Y allá a qué hora?', de: 'Und drüben um wie viel Uhr?' },
      { sprecher: 'Carmen', es: 'A las siete, siete y media. Como personas normales.', de: 'Um sieben, halb acht. Wie normale Menschen.' },
      { sprecher: 'Luis', es: 'Eso lo dirás tú.', de: 'Das sagst du.' },
      { sprecher: 'Carmen', es: 'Y otra cosa: aquí todo el mundo se tutea enseguida.', de: 'Und noch was: Hier duzen sich alle sofort.' },
      { sprecher: 'Luis', es: '¿Y eso está mal?', de: 'Und das ist schlecht?' },
      { sprecher: 'Carmen', es: 'No, pero al principio me chocaba. Allá se usa mucho el usted.', de: 'Nein, aber am Anfang hat es mich befremdet. Drüben benutzt man viel das Sie.' },
      { sprecher: 'Luis', es: 'Incluso entre amigos, tengo entendido.', de: 'Sogar unter Freunden, soweit ich weiß.' },
      { sprecher: 'Carmen', es: 'Con los mayores, siempre. Es cuestión de respeto.', de: 'Mit Älteren immer. Es ist eine Frage des Respekts.' },
      { sprecher: 'Luis', es: 'Aquí sonaría distante.', de: 'Hier klänge das distanziert.' },
      { sprecher: 'Carmen', es: 'Ya. Se entiende igual, pero suena diferente.', de: 'Eben. Man versteht sich trotzdem, aber es klingt anders.' },
      { sprecher: 'Luis', es: 'Bueno, ¿te vienes o no?', de: 'Also, kommst du mit oder nicht?' },
      { sprecher: 'Carmen', es: 'Voy. Pero con una condición.', de: 'Ich komme. Aber unter einer Bedingung.' },
      { sprecher: 'Luis', es: 'Dime.', de: 'Sag.' },
      { sprecher: 'Carmen', es: 'Que un día cenemos a las ocho. Uno solo.', de: 'Dass wir an einem Tag um acht essen. An einem einzigen.' },
    ],
    fragen: [
      {
        frage: '¿Qué diferencia hay entre las dos fiestas?',
        optionen: [
          'La de Colombia dura bastante más días',
          'La de España tiene desfile y la otra no',
          'La de Colombia no tiene música en directo',
          'La de España es solo para la gente del pueblo',
        ],
        loesung: 'La de Colombia dura bastante más días',
      },
      {
        frage: '¿Por qué no puede venir la madre de Carmen?',
        optionen: [
          'Llega al país cuando ya han pasado las fiestas',
          'No le gusta ese tipo de música',
          'El viaje le resulta demasiado caro',
          'Está enferma en Colombia',
        ],
        loesung: 'Llega al país cuando ya han pasado las fiestas',
      },
      {
        frage: '¿Qué le costó acostumbrarse a Carmen al llegar aquí?',
        optionen: [
          'Que la gente pase al tú de inmediato',
          'Que nadie salga por la noche entre semana',
          'Que las fiestas duren tan poco',
          'Que se hable demasiado alto en la calle',
        ],
        loesung: 'Que la gente pase al tú de inmediato',
      },
      {
        frage: 'Según Carmen, ¿cuándo se usa el usted en su país?',
        optionen: [
          'Con las personas mayores, por respeto',
          'Solamente en el trabajo',
          'Únicamente con desconocidos en la calle',
          'Ya casi no se usa en ningún caso',
        ],
        loesung: 'Con las personas mayores, por respeto',
      },
      {
        frage: '¿Qué pide Carmen a cambio de ir?',
        optionen: [
          'Cenar más temprano al menos un día',
          'Que la fiesta no dure los cuatro días',
          'Que Luis la acompañe a la feria el año que viene',
          'Dormir en un hotel y no en casa de la familia',
        ],
        loesung: 'Cenar más temprano al menos un día',
      },
    ],
  },

  // =============================================================
  {
    id: 'mitgehoert-m7',
    modul: 'm7',
    titel: 'Mitgehört: Das Vorstellungsgespräch',
    emoji: '💼',
    ort: 'Ein Besprechungsraum. Ana leitet die Musikschule, Tom bewirbt sich auf eine Stelle.',
    fragenAuf: 'es',
    dialog: [
      { sprecher: 'Ana', es: 'Siéntese, por favor. He leído su currículum con interés.', de: 'Setzen Sie sich bitte. Ich habe Ihren Lebenslauf mit Interesse gelesen.' },
      { sprecher: 'Tom', es: 'Gracias por recibirme.', de: 'Danke, dass Sie mich empfangen.' },
      { sprecher: 'Ana', es: 'Veo que lleva tres años dando clases aquí en Madrid.', de: 'Ich sehe, Sie unterrichten seit drei Jahren hier in Madrid.' },
      { sprecher: 'Tom', es: 'Tres y medio, sí. En una escuela pequeña del barrio.', de: 'Dreieinhalb, ja. An einer kleinen Schule im Viertel.' },
      { sprecher: 'Ana', es: '¿Y por qué quiere cambiar?', de: 'Und warum wollen Sie wechseln?' },
      { sprecher: 'Tom', es: 'Allí solo doy clases individuales. Me gustaría trabajar con grupos.', de: 'Dort gebe ich nur Einzelunterricht. Ich würde gern mit Gruppen arbeiten.' },
      { sprecher: 'Ana', es: 'Aquí serían grupos de hasta doce niños.', de: 'Hier wären es Gruppen von bis zu zwölf Kindern.' },
      { sprecher: 'Tom', es: 'Perfecto. Es justo lo que busco.', de: 'Perfekt. Genau das suche ich.' },
      { sprecher: 'Ana', es: '¿Ha trabajado con grupos alguna vez?', de: 'Haben Sie schon einmal mit Gruppen gearbeitet?' },
      { sprecher: 'Tom', es: 'En Alemania sí, durante cuatro años. Aquí todavía no.', de: 'In Deutschland ja, vier Jahre lang. Hier noch nicht.' },
      { sprecher: 'Ana', es: 'Entiendo. ¿Y el idioma no le supone un problema?', de: 'Verstehe. Und die Sprache ist für Sie kein Problem?' },
      { sprecher: 'Tom', es: 'Con adultos ninguno. Con doce niños a la vez… lo veremos.', de: 'Mit Erwachsenen keins. Mit zwölf Kindern gleichzeitig … das werden wir sehen.' },
      { sprecher: 'Ana', es: 'Me gusta que lo diga así.', de: 'Mir gefällt, dass Sie das so sagen.' },
      { sprecher: 'Tom', es: 'Prefiero no prometer lo que aún no sé.', de: 'Ich verspreche lieber nicht, was ich noch nicht weiß.' },
      { sprecher: 'Ana', es: 'Hablemos del horario. Serían tardes, de cuatro a ocho.', de: 'Sprechen wir über die Zeiten. Es wären Nachmittage, von vier bis acht.' },
      { sprecher: 'Tom', es: '¿Todos los días?', de: 'Jeden Tag?' },
      { sprecher: 'Ana', es: 'De lunes a jueves. Los viernes libres.', de: 'Montag bis Donnerstag. Freitags frei.' },
      { sprecher: 'Tom', es: 'Eso me vendría muy bien.', de: 'Das käme mir sehr gelegen.' },
      { sprecher: 'Ana', es: '¿Y podría empezar en septiembre?', de: 'Und könnten Sie im September anfangen?' },
      { sprecher: 'Tom', es: 'Tendría que avisar con un mes. Si me lo confirman en julio, sí.', de: 'Ich müsste einen Monat vorher kündigen. Wenn Sie mir im Juli zusagen, ja.' },
      { sprecher: 'Ana', es: 'Lo tendrá antes. ¿Alguna pregunta por su parte?', de: 'Sie hören früher von uns. Haben Sie Fragen?' },
      { sprecher: 'Tom', es: 'Sí. ¿Quién decide el programa de las clases?', de: 'Ja. Wer entscheidet über den Unterrichtsplan?' },
      { sprecher: 'Ana', es: 'Cada profesor el suyo. Nos reunimos una vez al mes.', de: 'Jeder Lehrer seinen eigenen. Wir treffen uns einmal im Monat.' },
      { sprecher: 'Tom', es: 'Eso es importante para mí.', de: 'Das ist mir wichtig.' },
      { sprecher: 'Ana', es: 'Aquí nadie le va a decir qué tocar.', de: 'Hier wird Ihnen niemand sagen, was Sie spielen sollen.' },
      { sprecher: 'Tom', es: 'Entonces solo queda una cosa.', de: 'Dann bleibt nur noch eine Sache.' },
      { sprecher: 'Ana', es: 'El sueldo.', de: 'Das Gehalt.' },
      { sprecher: 'Tom', es: 'Exacto.', de: 'Genau.' },
      { sprecher: 'Ana', es: 'Está en la oferta. Y si el primer año va bien, lo revisamos.', de: 'Es steht im Angebot. Und wenn das erste Jahr gut läuft, sehen wir es uns wieder an.' },
      { sprecher: 'Tom', es: 'Me parece justo. Quedo a la espera.', de: 'Das finde ich fair. Ich warte auf Ihre Nachricht.' },
    ],
    fragen: [
      {
        frage: '¿Por qué quiere Tom cambiar de trabajo?',
        optionen: [
          'Quiere dar clase a grupos y no uno a uno',
          'No está contento con lo que gana ahora mismo',
          'La escuela actual le queda demasiado lejos',
          'Prefiere trabajar por las mañanas',
        ],
        loesung: 'Quiere dar clase a grupos y no uno a uno',
      },
      {
        frage: '¿Qué responde cuando le preguntan por el idioma?',
        optionen: [
          'Que con adultos va bien, pero con niños está por ver',
          'Que no le supone ninguna dificultad en absoluto',
          'Que preferiría dar las clases en alemán al principio',
          'Que piensa apuntarse a un curso antes de empezar',
        ],
        loesung: 'Que con adultos va bien, pero con niños está por ver',
      },
      {
        frage: '¿Qué le parece a Ana esa respuesta?',
        optionen: [
          'Le gusta, porque no promete de más',
          'Le preocupa de cara a las clases con niños',
          'Le parece poco seguro de sí mismo',
          'Prefiere no dar su opinión al respecto',
        ],
        loesung: 'Le gusta, porque no promete de más',
      },
      {
        frage: '¿De qué depende que pueda empezar en septiembre?',
        optionen: [
          'De que le confirmen a tiempo para poder avisar antes',
          'De que le mejoren la oferta económica que le han hecho',
          'De que las clases sean solo cuatro días por semana',
          'De que le dejen elegir el programa de sus clases',
        ],
        loesung: 'De que le confirmen a tiempo para poder avisar antes',
      },
      {
        frage: '¿Qué quiere saber Tom antes que el sueldo?',
        optionen: [
          'Si decide él lo que se da en clase',
          'Cuántos alumnos hay en cada grupo',
          'Si los viernes libra de verdad',
          'Cada cuánto se reúne todo el equipo',
        ],
        loesung: 'Si decide él lo que se da en clase',
      },
    ],
  },
]

// ---------------------------------------------------------------
//  Zuordnung, Freischaltung, Ablauf
// ---------------------------------------------------------------

/** Die Szene eines Moduls. */
export function szeneVon(modul) {
  return SZENEN.find((s) => s.modul === modul?.id) ?? null
}

/** Das Modul einer Szene. */
export function modulVonSzene(szene) {
  return MODULE.find((m) => m.id === szene.modul) ?? null
}

/**
 * Ab wann ist die Szene offen?
 *
 * In der MITTE des Moduls, nicht am Ende. Das ist der Unterschied zur
 * Prüfstation: Die prüft, was sitzt; diese hier ist eine Pause vom
 * Pauken, in der man merkt, dass die halbe Sache schon reicht, um
 * einem Gespräch zu folgen. Am Ende des Moduls käme sie zu spät –
 * dort steht schon die Prüfung.
 */
export function szeneOffen(szene, lessonProgress = {}) {
  if (szene.sofortOffen) return true
  const modul = modulVonSzene(szene)
  if (!modul) return false
  const lektionen = lektionenVon(modul)
  if (!lektionen.length) return false
  const fertig = lektionen.filter((l) => lessonProgress?.[l.id]?.fertig).length
  return fertig >= haelfte(lektionen.length)
}

/** Wie viele Lektionen fehlen noch bis zur Szene? */
export function nochBisSzene(szene, lessonProgress = {}) {
  if (szene.sofortOffen) return 0
  const modul = modulVonSzene(szene)
  if (!modul) return 0
  const lektionen = lektionenVon(modul)
  const fertig = lektionen.filter((l) => lessonProgress?.[l.id]?.fertig).length
  return Math.max(0, haelfte(lektionen.length) - fertig)
}

function haelfte(anzahl) {
  return Math.ceil(anzahl / 2)
}

/** Schon gehört? */
export function szeneGeschafft(szene, lessonProgress = {}) {
  return Boolean(lessonProgress?.[szene.id]?.fertig)
}

/** Für die Anzeige: gehört diese id zu einer Szene? */
export function istSzenenId(id) {
  return SZENEN.some((s) => s.id === id)
}

/**
 * Die Szene als Lektions-Objekt.
 *
 * Wie bei den Prüfstationen: Damit läuft sie durch denselben Ablauf –
 * derselbe Fortschrittsbalken, dieselben Antwortknöpfe, derselbe
 * Abschluss mit der 80-Prozent-Marke.
 *
 * items ist LEER, und das mit Absicht. Beim Abschluss wandern sonst
 * alle Wörter der Lektion in den Vokabeltrainer – hier gibt es aber
 * keine neuen Wörter zu lernen, nur ein Gespräch zu verstehen.
 */
export function szeneAlsLektion(szene) {
  return {
    id: szene.id,
    titel: szene.titel,
    emoji: szene.emoji,
    niveau: lektionenVon(modulVonSzene(szene) ?? {}).slice(-1)[0]?.niveau ?? '',
    beschreibung: 'Ein Gespräch hören und verstehen',
    items: [],
    wissen: null,
    dialog: szene.dialog,
    ziele: [
      'Ein ganzes Gespräch am Stück hören',
      'Fragen zum Inhalt beantworten – nicht zur Übersetzung',
      'Danach die Abschrift lesen und nachhören',
    ],
    istSzene: true,
  }
}

/**
 * Der Ablauf einer Szene.
 *
 * Die Fragen werden gemischt, die Antwortmöglichkeiten auch – sonst
 * lernt man beim zweiten Anlauf die Reihenfolge statt des Inhalts.
 * Der Dialog selbst bleibt in seiner Reihenfolge, versteht sich.
 */
export function baueSchritteSzene(szene) {
  return [
    { typ: 'intro' },
    { typ: 'hoerszene', szene },
    ...mischen(szene.fragen).map((frage) => ({ typ: 'verstehen', frage, szene })),
    { typ: 'abschrift', szene },
  ]
}

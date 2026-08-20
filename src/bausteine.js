// Die Bausteine: Grammatik im Karteikasten.
//
// Ein Baustein ist eine Regel – "Ser oder estar", "Indefinido oder
// Imperfekt" – mit fünf Aufgaben dazu. Er läuft durch genau dasselbe
// Spaced-Repetition-Verfahren wie eine Vokabel: review() aus srs.js
// fasst nur intervall, leichtigkeit, level und due an und weiß gar
// nicht, dass hier eine Regel statt eines Wortes steckt.
//
// Deshalb gibt es KEINE zweite Lernlogik. Nur zweites Futter.
//
// Die Erklärung schreibt diese Datei nicht selbst: Jeder Baustein
// zeigt auf eine Lektion, und deren drei wissen-Karten SIND die
// Erklärung. So kann die Grammatik im Trainer nie etwas anderes
// behaupten als die Lektion, aus der sie stammt.

import { LEKTIONEN, mischen } from './lektionen.js'

/**
 * Die Familien – die grobe Sortierung in der Übersicht.
 *
 * Die Reihenfolge hier ist die Reihenfolge auf dem Bildschirm. Sie
 * folgt dem Kurs, nicht der Schulgrammatik: Erst das, was man zum
 * ersten Satz braucht, ganz zum Schluss der Subjuntivo.
 */
export const FAMILIEN = [
  { id: 'fundamente', titel: 'Fundamente', text: 'ser, estar, tener, hay' },
  { id: 'satz', titel: 'Wörter im Satz', text: 'Artikel, Geschlecht, Adjektive' },
  { id: 'gegenwart', titel: 'Gegenwart', text: 'Die Formen, mit denen du sprichst' },
  { id: 'pronomen', titel: 'Pronomen', text: 'me, te, lo, la – und beide zusammen' },
  { id: 'verbinden', titel: 'Verbinden', text: 'Präpositionen, Nebensätze, Vergleiche' },
  { id: 'auffordern', titel: 'Auffordern', text: 'Imperativ und höfliche Bitten' },
  { id: 'vergangenheit', titel: 'Vergangenheit', text: 'Das Herzstück: welche Zeit wann' },
  { id: 'zukunft', titel: 'Zukunft & Bedingung', text: 'Futur, Konditional, si-Sätze' },
  { id: 'subjuntivo', titel: 'Subjuntivo', text: 'Die Form für alles Ungewisse' },
]

/**
 * Die Bausteine.
 *
 * Jeder hat:
 *   id       – dauerhaft, steckt im Speicher des Nutzers. Nie ändern.
 *   titel    – wie er im Trainer heißt
 *   familie  – eine id aus FAMILIEN
 *   lektion  – die id der Lektion, die das erklärt (Sprung dorthin)
 *   regel    – EIN Satz. Die Kurzfassung, die auf der Karte steht.
 *   aufgaben – mindestens fünf, siehe die vier Typen unten
 *
 * Die Aufgabentypen:
 *   luecke  – { satz: '… ___ …', loesung, hilfe?, de }  selbst tippen
 *   wahl    – { satz: '… ___ …', optionen: [...], loesung, de }
 *   fehler  – { satz, falsch, richtig, de }  das falsche Wort antippen
 *   bauen   – { loesung: 'ganzer Satz', de }  Wörter in Reihenfolge
 *
 * Bei "fehler" muss falsch als ganzes Wort im Satz stehen – der
 * Validator prüft das, damit nie eine Aufgabe erscheint, bei der
 * sich das gesuchte Wort nicht antippen lässt.
 */
export const BAUSTEINE = [
  // ---------------------------------------------------------------
  //  Fundamente
  // ---------------------------------------------------------------
  {
    id: 'ser-praesens',
    titel: 'Das Verb ser',
    familie: 'fundamente',
    lektion: 'ser',
    regel: 'soy, eres, es, somos, sois, son – die wichtigste unregelmäßige Reihe der Sprache.',
    aufgaben: [
      { typ: 'luecke', satz: 'Yo ___ de Alemania.', loesung: 'soy', hilfe: 'ser', de: 'Ich bin aus Deutschland.' },
      { typ: 'luecke', satz: 'Nosotros ___ estudiantes.', loesung: 'somos', hilfe: 'ser', de: 'Wir sind Studenten.' },
      { typ: 'wahl', satz: '¿Tú ___ el hermano de Ana?', optionen: ['eres', 'es', 'soy'], loesung: 'eres', de: 'Bist du Anas Bruder?' },
      { typ: 'fehler', satz: 'Ellos trabajan aquí y ella son médica.', falsch: 'son', richtig: 'es', de: 'Sie arbeiten hier und sie ist Ärztin.' },
      { typ: 'bauen', loesung: 'Mi madre es muy simpática', de: 'Meine Mutter ist sehr nett.' },
    ],
  },
  {
    id: 'estar-praesens',
    titel: 'Das Verb estar',
    familie: 'fundamente',
    lektion: 'estar',
    regel: 'estoy, estás, está, estamos, estáis, están – für Ort und Befinden.',
    aufgaben: [
      { typ: 'luecke', satz: 'Yo ___ en casa.', loesung: 'estoy', hilfe: 'estar', de: 'Ich bin zu Hause.' },
      { typ: 'luecke', satz: 'Los niños ___ en el parque.', loesung: 'están', hilfe: 'estar', de: 'Die Kinder sind im Park.' },
      { typ: 'wahl', satz: '¿Cómo ___ tu padre?', optionen: ['está', 'estás', 'estoy'], loesung: 'está', de: 'Wie geht es deinem Vater?' },
      { typ: 'fehler', satz: 'Yo estoy bien y vosotros estamos cansados.', falsch: 'estamos', richtig: 'estáis', de: 'Mir geht es gut und ihr seid müde.' },
      { typ: 'bauen', loesung: 'El restaurante está muy cerca', de: 'Das Restaurant ist ganz in der Nähe.' },
    ],
  },
  {
    id: 'ser-estar',
    titel: 'Ser oder estar',
    familie: 'fundamente',
    lektion: 'seroestar',
    regel: 'ser für das, was jemand ist – estar für das, wie es gerade ist.',
    aufgaben: [
      { typ: 'wahl', satz: 'Mi hermano ___ médico.', optionen: ['es', 'está'], loesung: 'es', de: 'Mein Bruder ist Arzt.' },
      { typ: 'wahl', satz: 'La sopa ___ fría.', optionen: ['es', 'está'], loesung: 'está', de: 'Die Suppe ist kalt.' },
      { typ: 'wahl', satz: 'Ana ___ muy cansada hoy.', optionen: ['es', 'está'], loesung: 'está', de: 'Ana ist heute sehr müde.' },
      { typ: 'luecke', satz: 'El hotel ___ en el centro.', loesung: 'está', hilfe: 'ser oder estar', de: 'Das Hotel liegt im Zentrum.' },
      { typ: 'fehler', satz: 'Hoy hace sol y el banco es cerrado.', falsch: 'es', richtig: 'está', de: 'Heute scheint die Sonne und die Bank ist geschlossen.' },
    ],
  },
  {
    id: 'hay-estar',
    titel: 'hay oder está',
    familie: 'fundamente',
    lektion: 'hay',
    regel: 'hay sagt, DASS es etwas gibt – está sagt, WO das Bekannte ist.',
    aufgaben: [
      { typ: 'wahl', satz: 'En la plaza ___ una farmacia.', optionen: ['hay', 'está'], loesung: 'hay', de: 'Auf dem Platz gibt es eine Apotheke.' },
      { typ: 'wahl', satz: 'La farmacia ___ en la plaza.', optionen: ['hay', 'está'], loesung: 'está', de: 'Die Apotheke ist auf dem Platz.' },
      { typ: 'luecke', satz: '¿___ un baño por aquí?', loesung: 'hay', hilfe: 'hay oder estar', de: 'Gibt es hier eine Toilette?' },
      { typ: 'fehler', satz: 'El museo hay al lado de la catedral.', falsch: 'hay', richtig: 'está', de: 'Das Museum ist neben der Kathedrale.' },
      { typ: 'bauen', loesung: 'En mi barrio hay dos supermercados', de: 'In meinem Viertel gibt es zwei Supermärkte.' },
    ],
  },
  {
    id: 'tener',
    titel: 'Das Verb tener',
    familie: 'fundamente',
    lektion: 'tener',
    regel: 'tengo, tienes, tiene … – und es sagt auch, wie alt man ist.',
    aufgaben: [
      { typ: 'luecke', satz: 'Yo ___ treinta años.', loesung: 'tengo', hilfe: 'tener', de: 'Ich bin dreißig Jahre alt.' },
      { typ: 'luecke', satz: 'Mis padres ___ una casa en el campo.', loesung: 'tienen', hilfe: 'tener', de: 'Meine Eltern haben ein Haus auf dem Land.' },
      { typ: 'wahl', satz: '¿Cuántos años ___ tu hija?', optionen: ['tiene', 'tienes', 'tengo'], loesung: 'tiene', de: 'Wie alt ist deine Tochter?' },
      { typ: 'fehler', satz: 'Yo tengo hambre y tú tenemos sed.', falsch: 'tenemos', richtig: 'tienes', de: 'Ich habe Hunger und du hast Durst.' },
      { typ: 'bauen', loesung: 'Tengo dos hermanos y una hermana', de: 'Ich habe zwei Brüder und eine Schwester.' },
    ],
  },

  // ---------------------------------------------------------------
  //  Wörter im Satz
  // ---------------------------------------------------------------
  {
    id: 'artikel',
    titel: 'Die Artikel',
    familie: 'satz',
    lektion: 'artikel',
    regel: 'el, la, los, las für Bekanntes – un, una, unos, unas für Neues.',
    aufgaben: [
      { typ: 'wahl', satz: 'Vivo en ___ ciudad muy pequeña.', optionen: ['una', 'la', 'un'], loesung: 'una', de: 'Ich lebe in einer sehr kleinen Stadt.' },
      { typ: 'luecke', satz: '___ profesores llegan a las ocho.', loesung: 'Los', hilfe: 'bestimmter Artikel', de: 'Die Lehrer kommen um acht.' },
      { typ: 'wahl', satz: '¿Dónde está ___ estación?', optionen: ['la', 'una', 'el'], loesung: 'la', de: 'Wo ist der Bahnhof?' },
      { typ: 'fehler', satz: 'Quiero un cerveza y una tapa.', falsch: 'un', richtig: 'una', de: 'Ich möchte ein Bier und eine Tapa.' },
      { typ: 'bauen', loesung: 'El libro está en la mesa', de: 'Das Buch liegt auf dem Tisch.' },
    ],
  },
  {
    id: 'genus',
    titel: 'el oder la',
    familie: 'satz',
    lektion: 'essen',
    regel: '-o ist meistens männlich, -a weiblich – mit ein paar berühmten Ausnahmen.',
    aufgaben: [
      { typ: 'wahl', satz: '___ problema es difícil.', optionen: ['El', 'La'], loesung: 'El', de: 'Das Problem ist schwierig.' },
      { typ: 'wahl', satz: '___ mano derecha.', optionen: ['La', 'El'], loesung: 'La', de: 'Die rechte Hand.' },
      { typ: 'luecke', satz: '___ ciudad es muy antigua.', loesung: 'La', hilfe: 'el oder la', de: 'Die Stadt ist sehr alt.' },
      { typ: 'fehler', satz: 'La día está bonito hoy.', falsch: 'La', richtig: 'El', de: 'Der Tag ist heute schön.' },
      { typ: 'wahl', satz: '___ agua está fría.', optionen: ['El', 'La'], loesung: 'El', de: 'Das Wasser ist kalt.' },
    ],
  },
  {
    id: 'plural',
    titel: 'Der Plural',
    familie: 'satz',
    lektion: 'plural',
    regel: 'Vokal am Ende: +s. Konsonant am Ende: +es.',
    aufgaben: [
      { typ: 'luecke', satz: 'Tengo dos ___ (hermano).', loesung: 'hermanos', hilfe: 'Plural', de: 'Ich habe zwei Brüder.' },
      { typ: 'luecke', satz: 'Hay tres ___ (ciudad) grandes.', loesung: 'ciudades', hilfe: 'Plural', de: 'Es gibt drei große Städte.' },
      { typ: 'wahl', satz: 'Los ___ están en la mesa.', optionen: ['papeles', 'papels', 'papelos'], loesung: 'papeles', de: 'Die Papiere liegen auf dem Tisch.' },
      { typ: 'fehler', satz: 'Los profesors son muy amables.', falsch: 'profesors', richtig: 'profesores', de: 'Die Lehrer sind sehr freundlich.' },
      { typ: 'bauen', loesung: 'Las flores son muy bonitas', de: 'Die Blumen sind sehr schön.' },
    ],
  },
  {
    id: 'adjektive',
    titel: 'Adjektive angleichen',
    familie: 'satz',
    lektion: 'beschreiben',
    regel: 'Das Adjektiv richtet sich nach dem Substantiv – und steht dahinter.',
    aufgaben: [
      { typ: 'luecke', satz: 'Una casa ___ (blanco).', loesung: 'blanca', hilfe: 'angleichen', de: 'Ein weißes Haus.' },
      { typ: 'luecke', satz: 'Unos zapatos ___ (negro).', loesung: 'negros', hilfe: 'angleichen', de: 'Schwarze Schuhe.' },
      { typ: 'wahl', satz: 'Las chicas son muy ___.', optionen: ['simpáticas', 'simpático', 'simpáticos'], loesung: 'simpáticas', de: 'Die Mädchen sind sehr nett.' },
      { typ: 'fehler', satz: 'Tengo una coche rojo muy viejo.', falsch: 'una', richtig: 'un', de: 'Ich habe ein sehr altes rotes Auto.' },
      { typ: 'bauen', loesung: 'Es una película muy interesante', de: 'Das ist ein sehr interessanter Film.' },
    ],
  },
  {
    id: 'possessiv',
    titel: 'mi, tu, su',
    familie: 'satz',
    lektion: 'familie',
    regel: 'Sie richten sich nach dem Besitz, nicht nach dem Besitzer: mis libros.',
    aufgaben: [
      { typ: 'luecke', satz: '___ padres viven en Madrid.', loesung: 'Mis', hilfe: 'mi im Plural', de: 'Meine Eltern leben in Madrid.' },
      { typ: 'wahl', satz: 'Ana y ___ hermano son altos.', optionen: ['su', 'sus', 'tu'], loesung: 'su', de: 'Ana und ihr Bruder sind groß.' },
      { typ: 'luecke', satz: '¿Dónde están ___ llaves?', loesung: 'tus', hilfe: 'tu im Plural', de: 'Wo sind deine Schlüssel?' },
      { typ: 'fehler', satz: 'Mi hermanos trabajan en Barcelona.', falsch: 'Mi', richtig: 'Mis', de: 'Meine Brüder arbeiten in Barcelona.' },
      { typ: 'bauen', loesung: 'Nuestra casa tiene un jardín', de: 'Unser Haus hat einen Garten.' },
    ],
  },
  {
    id: 'demonstrativ',
    titel: 'este, ese, aquel',
    familie: 'satz',
    lektion: 'supermarkt',
    regel: 'este = hier bei mir, ese = da bei dir, aquel = dort drüben.',
    aufgaben: [
      { typ: 'wahl', satz: '___ libro que tengo aquí es mío.', optionen: ['Este', 'Ese', 'Aquel'], loesung: 'Este', de: 'Dieses Buch hier gehört mir.' },
      { typ: 'wahl', satz: '¿Me pasas ___ vaso que tienes ahí?', optionen: ['ese', 'este', 'aquel'], loesung: 'ese', de: 'Reichst du mir das Glas da?' },
      { typ: 'luecke', satz: '___ montañas del fondo son los Pirineos.', loesung: 'Aquellas', hilfe: 'aquel, weiblich Plural', de: 'Jene Berge hinten sind die Pyrenäen.' },
      { typ: 'fehler', satz: 'Esta coche es de mi padre.', falsch: 'Esta', richtig: 'Este', de: 'Dieses Auto gehört meinem Vater.' },
      { typ: 'bauen', loesung: 'Estas fotos son de mi viaje', de: 'Diese Fotos sind von meiner Reise.' },
    ],
  },

  // ---------------------------------------------------------------
  //  Gegenwart
  // ---------------------------------------------------------------
  {
    id: 'ar-verben',
    titel: 'Verben auf -ar',
    familie: 'gegenwart',
    lektion: 'arverben',
    regel: '-o, -as, -a, -amos, -áis, -an. Die größte Gruppe der Sprache.',
    aufgaben: [
      { typ: 'luecke', satz: 'Yo ___ (hablar) español.', loesung: 'hablo', hilfe: 'hablar', de: 'Ich spreche Spanisch.' },
      { typ: 'luecke', satz: 'Nosotros ___ (trabajar) en Madrid.', loesung: 'trabajamos', hilfe: 'trabajar', de: 'Wir arbeiten in Madrid.' },
      { typ: 'wahl', satz: '¿Tú ___ mucho café?', optionen: ['tomas', 'toma', 'tomo'], loesung: 'tomas', de: 'Trinkst du viel Kaffee?' },
      { typ: 'fehler', satz: 'Ellos trabajan mucho y ella estudian poco.', falsch: 'estudian', richtig: 'estudia', de: 'Sie arbeiten viel und sie lernt wenig.' },
      { typ: 'bauen', loesung: 'Mis amigos cantan muy bien', de: 'Meine Freunde singen sehr gut.' },
    ],
  },
  {
    id: 'er-ir-verben',
    titel: 'Verben auf -er und -ir',
    familie: 'gegenwart',
    lektion: 'erirverben',
    regel: 'Fast gleich – sie trennen sich nur in der wir- und ihr-Form.',
    aufgaben: [
      { typ: 'luecke', satz: 'Nosotros ___ (comer) a las dos.', loesung: 'comemos', hilfe: 'comer', de: 'Wir essen um zwei.' },
      { typ: 'luecke', satz: 'Nosotros ___ (vivir) en Valencia.', loesung: 'vivimos', hilfe: 'vivir', de: 'Wir leben in Valencia.' },
      { typ: 'wahl', satz: 'Ana ___ una carta a su madre.', optionen: ['escribe', 'escribo', 'escriben'], loesung: 'escribe', de: 'Ana schreibt ihrer Mutter einen Brief.' },
      { typ: 'fehler', satz: 'Vosotros comemos muy tarde en España.', falsch: 'comemos', richtig: 'coméis', de: 'Ihr esst in Spanien sehr spät.' },
      { typ: 'bauen', loesung: 'Los niños beben leche por la mañana', de: 'Die Kinder trinken morgens Milch.' },
    ],
  },
  {
    id: 'verneinung',
    titel: 'Die Verneinung',
    familie: 'gegenwart',
    lektion: 'verneinung',
    regel: 'no steht vor dem Verb – und die doppelte Verneinung ist hier richtig.',
    aufgaben: [
      { typ: 'luecke', satz: 'Yo ___ hablo francés.', loesung: 'no', hilfe: 'verneinen', de: 'Ich spreche kein Französisch.' },
      { typ: 'wahl', satz: '___ hay nadie en casa.', optionen: ['No', 'Nada', 'Nunca'], loesung: 'No', de: 'Es ist niemand zu Hause.' },
      { typ: 'fehler', satz: 'No quiero algo de beber.', falsch: 'algo', richtig: 'nada', de: 'Ich möchte nichts trinken.' },
      { typ: 'luecke', satz: 'No quiero ___ (nichts).', loesung: 'nada', hilfe: 'nichts', de: 'Ich will nichts.' },
      { typ: 'bauen', loesung: 'No tengo tiempo esta semana', de: 'Ich habe diese Woche keine Zeit.' },
    ],
  },

  {
    id: 'reflexiv',
    titel: 'Reflexive Verben',
    familie: 'gegenwart',
    lektion: 'tagesablauf',
    regel: 'Das -se wandert nach vorn und passt sich an: levantarse wird zu me levanto.',
    aufgaben: [
      { typ: 'luecke', satz: 'Yo ___ a las siete.', loesung: 'me levanto', hilfe: 'levantarse', de: 'Ich stehe um sieben auf.' },
      { typ: 'luecke', satz: 'Ana ___ por la mañana.', loesung: 'se ducha', hilfe: 'ducharse', de: 'Ana duscht morgens.' },
      { typ: 'wahl', satz: '¿A qué hora ___ acuestas?', optionen: ['te', 'se', 'me'], loesung: 'te', de: 'Wann gehst du ins Bett?' },
      { typ: 'fehler', satz: 'Yo se levanto muy temprano.', falsch: 'se', richtig: 'me', de: 'Ich stehe sehr früh auf.' },
      { typ: 'bauen', loesung: 'Me acuesto a las once', de: 'Ich gehe um elf ins Bett.' },
    ],
  },
  {
    id: 'gustar',
    titel: 'Der Satzbau mit gustar',
    familie: 'gegenwart',
    lektion: 'gustar',
    regel: 'Nicht ich mag etwas – etwas gefällt mir. Das Verb richtet sich nach der Sache.',
    aufgaben: [
      { typ: 'wahl', satz: 'Me ___ mucho las películas españolas.', optionen: ['gustan', 'gusta'], loesung: 'gustan', de: 'Ich mag spanische Filme sehr.' },
      { typ: 'luecke', satz: 'A mí me ___ el chocolate.', loesung: 'gusta', hilfe: 'gustar', de: 'Ich mag Schokolade.' },
      { typ: 'wahl', satz: 'A Ana ___ gusta bailar.', optionen: ['le', 'la', 'se'], loesung: 'le', de: 'Ana tanzt gern.' },
      { typ: 'fehler', satz: 'A nosotros nos gusta los deportes.', falsch: 'gusta', richtig: 'gustan', de: 'Wir mögen Sport.' },
      { typ: 'bauen', loesung: 'No me gustan las verduras', de: 'Ich mag kein Gemüse.' },
    ],
  },
  {
    id: 'modalverben',
    titel: 'poder, querer, tener que',
    familie: 'gegenwart',
    lektion: 'modalverben',
    regel: 'Alle drei ziehen den Infinitiv nach sich – nur tener braucht das que dazwischen.',
    aufgaben: [
      { typ: 'luecke', satz: '___ ayudarte mañana.', loesung: 'Puedo', hilfe: 'poder, ich', de: 'Ich kann dir morgen helfen.' },
      { typ: 'wahl', satz: 'Tengo ___ estudiar más.', optionen: ['que', 'de', 'a'], loesung: 'que', de: 'Ich muss mehr lernen.' },
      { typ: 'luecke', satz: 'Ellos ___ ir al cine.', loesung: 'quieren', hilfe: 'querer', de: 'Sie wollen ins Kino.' },
      { typ: 'fehler', satz: 'Tú puede venir con nosotros.', falsch: 'puede', richtig: 'puedes', de: 'Du kannst mitkommen.' },
      { typ: 'bauen', loesung: 'Quiero aprender español este año', de: 'Ich will dieses Jahr Spanisch lernen.' },
    ],
  },
  {
    id: 'saber-conocer',
    titel: 'saber oder conocer',
    familie: 'gegenwart',
    lektion: 'freunde',
    regel: 'saber für Fakten und Fähigkeiten – conocer für Menschen und Orte.',
    aufgaben: [
      { typ: 'wahl', satz: '¿___ dónde está la estación?', optionen: ['Sabes', 'Conoces'], loesung: 'Sabes', de: 'Weißt du, wo der Bahnhof ist?' },
      { typ: 'wahl', satz: 'No ___ a su hermana.', optionen: ['conozco', 'sé'], loesung: 'conozco', de: 'Ich kenne seine Schwester nicht.' },
      { typ: 'luecke', satz: 'Yo ___ hablar tres idiomas.', loesung: 'sé', hilfe: 'saber', de: 'Ich kann drei Sprachen sprechen.' },
      { typ: 'fehler', satz: 'Conozco que vives en Madrid.', falsch: 'Conozco', richtig: 'Sé', de: 'Ich weiß, dass du in Madrid wohnst.' },
      { typ: 'bauen', loesung: 'Ana conoce muy bien Barcelona', de: 'Ana kennt Barcelona sehr gut.' },
    ],
  },
  {
    id: 'meinung',
    titel: 'creer und parecer',
    familie: 'gegenwart',
    lektion: 'medien',
    regel: 'creo que für die eigene Meinung – me parece que für den Eindruck.',
    aufgaben: [
      { typ: 'luecke', satz: 'Me ___ una buena idea.', loesung: 'parece', hilfe: 'parecer', de: 'Das scheint mir eine gute Idee.' },
      { typ: 'wahl', satz: '___ que tienes razón.', optionen: ['Creo', 'Crees', 'Cree'], loesung: 'Creo', de: 'Ich glaube, du hast recht.' },
      { typ: 'wahl', satz: 'Nosotros ___ que va a llover.', optionen: ['creemos', 'creéis', 'creen'], loesung: 'creemos', de: 'Wir glauben, dass es regnen wird.' },
      { typ: 'fehler', satz: 'Me parezco muy caro este hotel.', falsch: 'parezco', richtig: 'parece', de: 'Dieses Hotel scheint mir sehr teuer.' },
      { typ: 'bauen', loesung: 'Creo que mañana va a llover', de: 'Ich glaube, dass es morgen regnet.' },
    ],
  },

  // ---------------------------------------------------------------
  //  Pronomen
  // ---------------------------------------------------------------
  {
    id: 'indirekt',
    titel: 'me, te, le',
    familie: 'pronomen',
    lektion: 'restaurant',
    regel: 'Wem etwas geschieht: me, te, le, nos, os, les – vor dem Verb.',
    aufgaben: [
      { typ: 'luecke', satz: 'A Ana ___ doy mi número.', loesung: 'le', hilfe: 'ihr', de: 'Ana gebe ich meine Nummer.' },
      { typ: 'wahl', satz: '¿___ puedes traer la cuenta?', optionen: ['Nos', 'Los', 'Las'], loesung: 'Nos', de: 'Kannst du uns die Rechnung bringen?' },
      { typ: 'luecke', satz: 'Mis padres ___ regalaron un coche.', loesung: 'me', hilfe: 'mir', de: 'Meine Eltern haben mir ein Auto geschenkt.' },
      { typ: 'fehler', satz: 'A ellos lo doy las gracias.', falsch: 'lo', richtig: 'les', de: 'Ihnen danke ich.' },
      { typ: 'bauen', loesung: 'Te escribo un correo mañana', de: 'Ich schreibe dir morgen eine Mail.' },
    ],
  },
  {
    id: 'direkt',
    titel: 'lo, la, los, las',
    familie: 'pronomen',
    lektion: 'objekt',
    regel: 'Was ersetzt wird, richtet sich in Geschlecht und Zahl nach dem Ding.',
    aufgaben: [
      { typ: 'wahl', satz: '¿Ves la película? Sí, ___ veo.', optionen: ['la', 'lo', 'le'], loesung: 'la', de: 'Siehst du den Film? Ja, ich sehe ihn.' },
      { typ: 'luecke', satz: '¿Ya tienes el coche? Sí, ___ compré ayer.', loesung: 'lo', hilfe: 'ihn', de: 'Hast du das Auto schon? Ja, ich habe es gestern gekauft.' },
      { typ: 'wahl', satz: 'No conozco a tus primos, no ___ conozco.', optionen: ['los', 'les', 'las'], loesung: 'los', de: 'Ich kenne deine Cousins nicht.' },
      { typ: 'fehler', satz: 'A María le vi ayer en el parque.', falsch: 'le', richtig: 'la', de: 'María habe ich gestern im Park gesehen.' },
      { typ: 'bauen', loesung: 'Lo compré en el mercado', de: 'Ich habe es auf dem Markt gekauft.' },
    ],
  },
  {
    id: 'zwei-pronomen',
    titel: 'Zwei Pronomen im Satz',
    familie: 'pronomen',
    lektion: 'beidepronomen',
    regel: 'Erst die Person, dann die Sache – und vor lo, la, los, las wird le zu se.',
    aufgaben: [
      { typ: 'wahl', satz: '¿El libro para Ana? ___ doy mañana.', optionen: ['Se lo', 'Le lo', 'Lo le'], loesung: 'Se lo', de: 'Das Buch für Ana? Ich gebe es ihr morgen.' },
      { typ: 'luecke', satz: '¿Me traes el pan? Sí, ___ traigo.', loesung: 'te lo', hilfe: 'dir + ihn', de: 'Bringst du mir das Brot? Ja, ich bringe es dir.' },
      { typ: 'wahl', satz: 'La carta para ellos: ___ mando hoy.', optionen: ['se la', 'les la', 'la les'], loesung: 'se la', de: 'Der Brief für sie: Ich schicke ihn heute.' },
      { typ: 'fehler', satz: 'Ana quiere el coche: le lo presto mañana.', falsch: 'le', richtig: 'se', de: 'Ana will das Auto: Ich leihe es ihr morgen.' },
      { typ: 'bauen', loesung: 'Se lo explico otra vez', de: 'Ich erkläre es ihm noch einmal.' },
    ],
  },
  {
    id: 'se-me',
    titel: 'Unabsichtliches mit se me',
    familie: 'pronomen',
    lektion: 'missgeschick',
    regel: 'Nicht ich habe es vergessen – es hat sich mir vergessen: se me olvidó.',
    aufgaben: [
      { typ: 'luecke', satz: '___ me olvidaron las llaves.', loesung: 'Se', hilfe: 'die feste Formel', de: 'Ich habe die Schlüssel vergessen.' },
      { typ: 'wahl', satz: 'A Tom ___ rompió el móvil.', optionen: ['se le', 'se lo', 'le se'], loesung: 'se le', de: 'Tom ist das Handy kaputtgegangen.' },
      { typ: 'luecke', satz: 'Se ___ cayó el vaso.', loesung: 'me', hilfe: 'mir', de: 'Mir ist das Glas heruntergefallen.' },
      { typ: 'fehler', satz: 'Se nos olvidó los billetes en casa.', falsch: 'olvidó', richtig: 'olvidaron', de: 'Wir haben die Tickets zu Hause vergessen.' },
      { typ: 'bauen', loesung: 'Se me olvidó tu cumpleaños', de: 'Ich habe deinen Geburtstag vergessen.' },
    ],
  },

  // ---------------------------------------------------------------
  //  Verbinden
  // ---------------------------------------------------------------
  {
    id: 'por-para',
    titel: 'por oder para',
    familie: 'verbinden',
    lektion: 'bezahlen',
    regel: 'para zeigt nach vorn: Ziel, Zweck, Empfänger. por schaut zurück: Grund und Weg.',
    aufgaben: [
      { typ: 'wahl', satz: 'Este regalo es ___ ti.', optionen: ['para', 'por'], loesung: 'para', de: 'Dieses Geschenk ist für dich.' },
      { typ: 'wahl', satz: 'Gracias ___ tu ayuda.', optionen: ['por', 'para'], loesung: 'por', de: 'Danke für deine Hilfe.' },
      { typ: 'luecke', satz: 'Estudio español ___ trabajar en Madrid.', loesung: 'para', hilfe: 'Zweck', de: 'Ich lerne Spanisch, um in Madrid zu arbeiten.' },
      { typ: 'fehler', satz: 'Pasamos para el parque todas las tardes.', falsch: 'para', richtig: 'por', de: 'Wir gehen jeden Nachmittag durch den Park.' },
      { typ: 'bauen', loesung: 'Salimos para Valencia el domingo', de: 'Wir fahren am Sonntag nach Valencia.' },
    ],
  },
  {
    id: 'konnektoren',
    titel: 'porque, pero, cuando',
    familie: 'verbinden',
    lektion: 'abschluss2',
    regel: 'porque gibt den Grund, pero den Gegensatz, cuando den Zeitpunkt.',
    aufgaben: [
      { typ: 'wahl', satz: 'No voy ___ estoy cansado.', optionen: ['porque', 'por qué', 'pero'], loesung: 'porque', de: 'Ich gehe nicht, weil ich müde bin.' },
      { typ: 'wahl', satz: 'Quiero ir ___ no tengo tiempo.', optionen: ['pero', 'porque', 'cuando'], loesung: 'pero', de: 'Ich will hin, aber ich habe keine Zeit.' },
      { typ: 'luecke', satz: '___ llego a casa, te llamo.', loesung: 'Cuando', hilfe: 'Zeitpunkt', de: 'Wenn ich nach Hause komme, rufe ich dich an.' },
      { typ: 'fehler', satz: 'Voy al médico pero estoy enfermo.', falsch: 'pero', richtig: 'porque', de: 'Ich gehe zum Arzt, weil ich krank bin.' },
      { typ: 'bauen', loesung: 'Estudio porque quiero aprender más', de: 'Ich lerne, weil ich mehr lernen will.' },
    ],
  },
  {
    id: 'relativ',
    titel: 'Relativsätze',
    familie: 'verbinden',
    lektion: 'relativ',
    regel: 'que für alles, donde für Orte – und im Spanischen fällt que nie weg.',
    aufgaben: [
      { typ: 'wahl', satz: 'El chico ___ vive aquí es mi primo.', optionen: ['que', 'donde', 'quien'], loesung: 'que', de: 'Der Junge, der hier wohnt, ist mein Cousin.' },
      { typ: 'luecke', satz: 'La ciudad ___ nací es muy pequeña.', loesung: 'donde', hilfe: 'Ort', de: 'Die Stadt, in der ich geboren bin, ist sehr klein.' },
      { typ: 'wahl', satz: 'Este es el libro ___ te hablé.', optionen: ['del que', 'que', 'donde'], loesung: 'del que', de: 'Das ist das Buch, von dem ich dir erzählt habe.' },
      { typ: 'fehler', satz: 'La casa que vivo es antigua.', falsch: 'que', richtig: 'donde', de: 'Das Haus, in dem ich wohne, ist alt.' },
      { typ: 'bauen', loesung: 'La película que vimos era larga', de: 'Der Film, den wir gesehen haben, war lang.' },
    ],
  },
  {
    id: 'komparativ',
    titel: 'Vergleiche mit más que',
    familie: 'verbinden',
    lektion: 'kaufen',
    regel: 'más … que und menos … que – und vier Formen, die aus der Reihe tanzen.',
    aufgaben: [
      { typ: 'luecke', satz: 'Madrid es más grande ___ Valencia.', loesung: 'que', hilfe: 'als', de: 'Madrid ist größer als Valencia.' },
      { typ: 'wahl', satz: 'Este coche es ___ caro que el otro.', optionen: ['menos', 'menor', 'poco'], loesung: 'menos', de: 'Dieses Auto ist billiger als das andere.' },
      { typ: 'luecke', satz: 'Mi hermano juega ___ que yo.', loesung: 'mejor', hilfe: 'gut wird besser', de: 'Mein Bruder spielt besser als ich.' },
      { typ: 'fehler', satz: 'Ana es más alta como su hermana.', falsch: 'como', richtig: 'que', de: 'Ana ist größer als ihre Schwester.' },
      { typ: 'bauen', loesung: 'Este libro es más interesante', de: 'Dieses Buch ist interessanter.' },
    ],
  },
  {
    id: 'superlativ',
    titel: 'Der Superlativ',
    familie: 'verbinden',
    lektion: 'superlativ',
    regel: 'el más … de – nach dem Superlativ steht de, nie en.',
    aufgaben: [
      { typ: 'luecke', satz: 'Es el restaurante más caro ___ la ciudad.', loesung: 'de', hilfe: 'nach dem Superlativ', de: 'Es ist das teuerste Restaurant der Stadt.' },
      { typ: 'wahl', satz: 'Esta es ___ playa más bonita.', optionen: ['la', 'una', 'esa'], loesung: 'la', de: 'Das ist der schönste Strand.' },
      { typ: 'luecke', satz: 'La comida está ___ hoy.', loesung: 'buenísima', hilfe: 'sehr gut, mit -ísimo', de: 'Das Essen ist heute ganz hervorragend.' },
      { typ: 'fehler', satz: 'Es la ciudad más grande en España.', falsch: 'en', richtig: 'de', de: 'Es ist die größte Stadt Spaniens.' },
      { typ: 'bauen', loesung: 'Es el mejor día del año', de: 'Es ist der beste Tag des Jahres.' },
    ],
  },
  {
    id: 'tan-como',
    titel: 'tan … como',
    familie: 'verbinden',
    lektion: 'unterkunft',
    regel: 'Gleich viel: tan vor Adjektiven, tanto vor Substantiven – und angeglichen.',
    aufgaben: [
      { typ: 'luecke', satz: 'Ana es ___ alta como su madre.', loesung: 'tan', hilfe: 'genauso', de: 'Ana ist genauso groß wie ihre Mutter.' },
      { typ: 'wahl', satz: 'No tengo ___ dinero como tú.', optionen: ['tanto', 'tan', 'tanta'], loesung: 'tanto', de: 'Ich habe nicht so viel Geld wie du.' },
      { typ: 'luecke', satz: 'Este hotel es tan caro ___ el otro.', loesung: 'como', hilfe: 'wie', de: 'Dieses Hotel ist so teuer wie das andere.' },
      { typ: 'fehler', satz: 'Mi casa es tan grande que la tuya.', falsch: 'que', richtig: 'como', de: 'Mein Haus ist so groß wie deins.' },
      { typ: 'bauen', loesung: 'Habla tan rápido como Ana', de: 'Er spricht so schnell wie Ana.' },
    ],
  },

  // ---------------------------------------------------------------
  //  Auffordern
  // ---------------------------------------------------------------
  {
    id: 'imperativ',
    titel: 'Der Imperativ',
    familie: 'auffordern',
    lektion: 'kochen',
    regel: 'Die du-Form verliert einfach das s: hablas wird zu habla.',
    aufgaben: [
      { typ: 'luecke', satz: '___ más despacio, por favor.', loesung: 'Habla', hilfe: 'hablar, du', de: 'Sprich bitte langsamer.' },
      { typ: 'wahl', satz: '___ la puerta, por favor.', optionen: ['Cierra', 'Cierras', 'Cerrar'], loesung: 'Cierra', de: 'Mach bitte die Tür zu.' },
      { typ: 'luecke', satz: '___ tranquilos, hay tiempo.', loesung: 'Comed', hilfe: 'comer, ihr', de: 'Esst in Ruhe, es ist Zeit.' },
      { typ: 'fehler', satz: 'Ven aquí y sientas a mi lado.', falsch: 'sientas', richtig: 'siéntate', de: 'Komm her und setz dich neben mich.' },
      { typ: 'bauen', loesung: 'Pon la mesa antes de comer', de: 'Deck den Tisch vor dem Essen.' },
    ],
  },
  {
    id: 'imperativ-verneint',
    titel: 'Der verneinte Imperativ',
    familie: 'auffordern',
    lektion: 'imperativ',
    regel: 'Verneint wird der Imperativ zum Subjuntivo: habla wird zu no hables.',
    aufgaben: [
      { typ: 'wahl', satz: '___ tan rápido, no te entiendo.', optionen: ['No hables', 'No hablas', 'No habla'], loesung: 'No hables', de: 'Sprich nicht so schnell, ich verstehe dich nicht.' },
      { typ: 'luecke', satz: 'No ___ tarde, por favor.', loesung: 'vengas', hilfe: 'venir, du', de: 'Komm bitte nicht zu spät.' },
      { typ: 'luecke', satz: 'No ___ tan deprisa, niños.', loesung: 'comáis', hilfe: 'comer, ihr', de: 'Esst nicht so hastig, Kinder.' },
      { typ: 'fehler', satz: 'No hablas tan alto, por favor.', falsch: 'hablas', richtig: 'hables', de: 'Sprich bitte nicht so laut.' },
      { typ: 'bauen', loesung: 'No te preocupes por eso', de: 'Mach dir darüber keine Sorgen.' },
    ],
  },
  {
    id: 'imperativ-usted',
    titel: 'Der Imperativ mit usted',
    familie: 'auffordern',
    lektion: 'siebefehl',
    regel: 'Die höfliche Aufforderung nimmt immer die Subjuntivo-Form: pase, espere, diga.',
    aufgaben: [
      { typ: 'luecke', satz: '___, por favor, está abierto.', loesung: 'Pase', hilfe: 'pasar, usted', de: 'Treten Sie bitte ein, es ist offen.' },
      { typ: 'wahl', satz: '___ aquí, por favor.', optionen: ['Siéntese', 'Siéntate', 'Se siente'], loesung: 'Siéntese', de: 'Setzen Sie sich bitte hierhin.' },
      { typ: 'luecke', satz: '___ un momento, ahora le atiendo.', loesung: 'Espere', hilfe: 'esperar, usted', de: 'Warten Sie einen Moment, ich komme gleich.' },
      { typ: 'fehler', satz: 'Perdone, dime dónde está la salida.', falsch: 'dime', richtig: 'dígame', de: 'Entschuldigung, sagen Sie mir, wo der Ausgang ist.' },
      { typ: 'bauen', loesung: 'Tome asiento por favor', de: 'Nehmen Sie bitte Platz.' },
    ],
  },
  {
    id: 'bitte-konditional',
    titel: 'Höflich bitten',
    familie: 'auffordern',
    lektion: 'nachbarn',
    regel: 'podría, sería, me gustaría – der Konditional macht aus der Forderung eine Bitte.',
    aufgaben: [
      { typ: 'wahl', satz: '¿___ ayudarme un momento?', optionen: ['Podría', 'Puedo', 'Podrías'], loesung: 'Podría', de: 'Könnten Sie mir kurz helfen?' },
      { typ: 'luecke', satz: 'Me ___ hablar con el director.', loesung: 'gustaría', hilfe: 'gustar im Konditional', de: 'Ich würde gern mit dem Direktor sprechen.' },
      { typ: 'luecke', satz: '¿___ posible cambiar la fecha?', loesung: 'Sería', hilfe: 'ser im Konditional', de: 'Wäre es möglich, den Termin zu ändern?' },
      { typ: 'fehler', satz: 'Me gustaba hablar con usted un momento.', falsch: 'gustaba', richtig: 'gustaría', de: 'Ich würde gern kurz mit Ihnen sprechen.' },
      { typ: 'bauen', loesung: 'Podrías cerrar la ventana por favor', de: 'Könntest du bitte das Fenster schließen?' },
    ],
  },
  {
    id: 'wir-form',
    titel: 'Vorschläge in der wir-Form',
    familie: 'auffordern',
    lektion: 'stadtfuehrung',
    regel: 'vamos a + Infinitiv für den Vorschlag – oder direkt der Subjuntivo: comamos.',
    aufgaben: [
      { typ: 'wahl', satz: '___ al cine esta noche.', optionen: ['Vamos a ir', 'Vamos ir', 'Va a ir'], loesung: 'Vamos a ir', de: 'Lass uns heute Abend ins Kino gehen.' },
      { typ: 'luecke', satz: '___ algo, tengo hambre.', loesung: 'Comamos', hilfe: 'comer, wir', de: 'Lass uns etwas essen, ich habe Hunger.' },
      { typ: 'wahl', satz: '¿Por qué no ___ un café?', optionen: ['tomamos', 'tomemos', 'tomar'], loesung: 'tomamos', de: 'Warum trinken wir nicht einen Kaffee?' },
      { typ: 'fehler', satz: 'Vamos a vemos mañana en la plaza.', falsch: 'vemos', richtig: 'vernos', de: 'Lass uns morgen auf dem Platz treffen.' },
      { typ: 'bauen', loesung: 'Vamos a quedar el sábado', de: 'Lass uns am Samstag verabreden.' },
    ],
  },

  // ---------------------------------------------------------------
  //  Vergangenheit
  // ---------------------------------------------------------------
  {
    id: 'perfekt',
    titel: 'Das Perfekt',
    familie: 'vergangenheit',
    lektion: 'perfekt',
    regel: 'haber plus Partizip – und haber steht immer direkt davor, ohne Zwischenwort.',
    aufgaben: [
      { typ: 'luecke', satz: 'Hoy ___ mucho en la oficina.', loesung: 'he trabajado', hilfe: 'trabajar, Perfekt', de: 'Heute habe ich viel im Büro gearbeitet.' },
      { typ: 'wahl', satz: 'Ana ___ comido ya.', optionen: ['ha', 'has', 'han'], loesung: 'ha', de: 'Ana hat schon gegessen.' },
      { typ: 'luecke', satz: 'Nosotros ___ visto la película.', loesung: 'hemos', hilfe: 'haber, wir', de: 'Wir haben den Film gesehen.' },
      { typ: 'fehler', satz: 'Esta mañana yo ha desayunado tarde.', falsch: 'ha', richtig: 'he', de: 'Heute Morgen habe ich spät gefrühstückt.' },
      { typ: 'bauen', loesung: 'Hoy he comido en casa', de: 'Heute habe ich zu Hause gegessen.' },
    ],
  },
  {
    id: 'partizipien',
    titel: 'Unregelmäßige Partizipien',
    familie: 'vergangenheit',
    lektion: 'perfektunregel',
    regel: 'visto, hecho, dicho, puesto, vuelto, escrito, abierto, roto – acht muss man kennen.',
    aufgaben: [
      { typ: 'luecke', satz: '¿Has ___ la carta ya?', loesung: 'escrito', hilfe: 'escribir', de: 'Hast du den Brief schon geschrieben?' },
      { typ: 'wahl', satz: 'He ___ la ventana.', optionen: ['abierto', 'abrido', 'abrí'], loesung: 'abierto', de: 'Ich habe das Fenster geöffnet.' },
      { typ: 'luecke', satz: 'Todavía no he ___ esa película.', loesung: 'visto', hilfe: 'ver', de: 'Ich habe diesen Film noch nicht gesehen.' },
      { typ: 'fehler', satz: 'Ana ha hacido la comida.', falsch: 'hacido', richtig: 'hecho', de: 'Ana hat das Essen gemacht.' },
      { typ: 'bauen', loesung: 'Han dicho que llegan tarde', de: 'Sie haben gesagt, dass sie spät kommen.' },
    ],
  },
  {
    id: 'indefinido',
    titel: 'Das Indefinido',
    familie: 'vergangenheit',
    lektion: 'indefinido',
    regel: 'hablé, hablaste, habló – der Akzent am Ende trägt die ganze Bedeutung.',
    aufgaben: [
      { typ: 'luecke', satz: 'Ayer ___ con mi madre por teléfono.', loesung: 'hablé', hilfe: 'hablar, ich', de: 'Gestern habe ich mit meiner Mutter telefoniert.' },
      { typ: 'wahl', satz: 'Ana ___ a las ocho.', optionen: ['llegó', 'llegué', 'llega'], loesung: 'llegó', de: 'Ana kam um acht an.' },
      { typ: 'luecke', satz: 'El año pasado ___ en Madrid.', loesung: 'viví', hilfe: 'vivir, ich', de: 'Letztes Jahr wohnte ich in Madrid.' },
      { typ: 'fehler', satz: 'Ayer yo hablo con el jefe.', falsch: 'hablo', richtig: 'hablé', de: 'Gestern sprach ich mit dem Chef.' },
      { typ: 'bauen', loesung: 'Anoche cenamos en un restaurante', de: 'Gestern Abend aßen wir in einem Restaurant.' },
    ],
  },
  {
    id: 'indefinido-unregel',
    titel: 'Unregelmäßiges Indefinido',
    familie: 'vergangenheit',
    lektion: 'indefunregel',
    regel: 'fui, tuve, hice, estuve, pude – diese Stämme tragen keinen Akzent am Ende.',
    aufgaben: [
      { typ: 'luecke', satz: 'Ayer ___ al cine con Ana.', loesung: 'fui', hilfe: 'ir, ich', de: 'Gestern ging ich mit Ana ins Kino.' },
      { typ: 'wahl', satz: 'Ana ___ que trabajar el sábado.', optionen: ['tuvo', 'tenió', 'tuve'], loesung: 'tuvo', de: 'Ana musste am Samstag arbeiten.' },
      { typ: 'luecke', satz: 'Nosotros ___ la cena juntos.', loesung: 'hicimos', hilfe: 'hacer, wir', de: 'Wir machten das Abendessen zusammen.' },
      { typ: 'fehler', satz: 'El fin de semana yo estuvo en Valencia.', falsch: 'estuvo', richtig: 'estuve', de: 'Am Wochenende war ich in Valencia.' },
      { typ: 'bauen', loesung: 'No pude venir a la fiesta', de: 'Ich konnte nicht zur Feier kommen.' },
    ],
  },
  {
    id: 'perfekt-indefinido',
    titel: 'Perfekt oder Indefinido',
    familie: 'vergangenheit',
    lektion: 'perfektindef',
    regel: 'hoy und esta semana ziehen das Perfekt – ayer und el año pasado das Indefinido.',
    aufgaben: [
      { typ: 'wahl', satz: 'Hoy ___ muy temprano.', optionen: ['me he levantado', 'me levanté'], loesung: 'me he levantado', de: 'Heute bin ich sehr früh aufgestanden.' },
      { typ: 'wahl', satz: 'Ayer ___ a las diez.', optionen: ['me acosté', 'me he acostado'], loesung: 'me acosté', de: 'Gestern ging ich um zehn ins Bett.' },
      { typ: 'luecke', satz: 'Esta semana ___ mucho trabajo.', loesung: 'he tenido', hilfe: 'tener, Perfekt', de: 'Diese Woche hatte ich viel Arbeit.' },
      { typ: 'fehler', satz: 'Ayer he ido al cine con Ana.', falsch: 'Ayer', richtig: 'Hoy', de: 'Heute bin ich mit Ana ins Kino gegangen.' },
      { typ: 'bauen', loesung: 'Ayer fuimos al mercado central', de: 'Gestern gingen wir zum Zentralmarkt.' },
    ],
  },
  {
    id: 'imperfekt',
    titel: 'Das Imperfekt',
    familie: 'vergangenheit',
    lektion: 'imperfekt',
    regel: 'hablaba, comía – und nur drei Verben tanzen aus der Reihe: ser, ir und ver.',
    aufgaben: [
      { typ: 'luecke', satz: 'De niño ___ mucho al fútbol.', loesung: 'jugaba', hilfe: 'jugar, ich', de: 'Als Kind spielte ich viel Fußball.' },
      { typ: 'wahl', satz: 'Antes ___ en un pueblo pequeño.', optionen: ['vivíamos', 'vivimos', 'viviremos'], loesung: 'vivíamos', de: 'Früher lebten wir in einem kleinen Dorf.' },
      { typ: 'luecke', satz: 'Cuando ___ pequeño, no me gustaba el pescado.', loesung: 'era', hilfe: 'ser, ich', de: 'Als ich klein war, mochte ich keinen Fisch.' },
      { typ: 'fehler', satz: 'Antes nosotros iba al parque cada domingo.', falsch: 'iba', richtig: 'íbamos', de: 'Früher gingen wir jeden Sonntag in den Park.' },
      { typ: 'bauen', loesung: 'Mi abuela cocinaba muy bien', de: 'Meine Großmutter kochte sehr gut.' },
    ],
  },
  {
    id: 'indef-imperfekt',
    titel: 'Indefinido oder Imperfekt',
    familie: 'vergangenheit',
    lektion: 'kontrast',
    regel: 'Indefinido erzählt, was passierte. Imperfekt beschreibt, wie es dabei war.',
    aufgaben: [
      { typ: 'wahl', satz: 'Mientras ___, sonó el teléfono.', optionen: ['cenaba', 'cené'], loesung: 'cenaba', de: 'Während ich zu Abend aß, klingelte das Telefon.' },
      { typ: 'wahl', satz: 'Cuando llegué, ella ___ en el sofá.', optionen: ['dormía', 'durmió'], loesung: 'dormía', de: 'Als ich ankam, schlief sie auf dem Sofa.' },
      { typ: 'luecke', satz: 'Hacía sol cuando ___ de casa.', loesung: 'salí', hilfe: 'salir, ich, Indefinido', de: 'Die Sonne schien, als ich das Haus verließ.' },
      { typ: 'fehler', satz: 'Mientras estudié, mi hermano puso música.', falsch: 'estudié', richtig: 'estudiaba', de: 'Während ich lernte, machte mein Bruder Musik an.' },
      { typ: 'bauen', loesung: 'Era tarde cuando llegamos a casa', de: 'Es war spät, als wir nach Hause kamen.' },
    ],
  },
  {
    id: 'verlaufsform',
    titel: 'estar plus Gerundium',
    familie: 'vergangenheit',
    lektion: 'verlaufsform',
    regel: 'estar plus -ando oder -iendo für das, was genau jetzt läuft.',
    aufgaben: [
      { typ: 'luecke', satz: 'Ahora ___ trabajando en el informe.', loesung: 'estoy', hilfe: 'estar, ich', de: 'Ich arbeite gerade am Bericht.' },
      { typ: 'wahl', satz: 'Los niños están ___ en el jardín.', optionen: ['jugando', 'jugar', 'jugado'], loesung: 'jugando', de: 'Die Kinder spielen gerade im Garten.' },
      { typ: 'luecke', satz: 'Ana está ___ un libro muy bueno.', loesung: 'leyendo', hilfe: 'leer', de: 'Ana liest gerade ein sehr gutes Buch.' },
      { typ: 'fehler', satz: 'Estoy comer ahora mismo.', falsch: 'comer', richtig: 'comiendo', de: 'Ich esse gerade.' },
      { typ: 'bauen', loesung: 'Estamos viendo una película', de: 'Wir schauen gerade einen Film.' },
    ],
  },
  {
    id: 'plusquam',
    titel: 'Das Plusquamperfekt',
    familie: 'vergangenheit',
    lektion: 'plusquam',
    regel: 'había plus Partizip – für das, was noch vor dem Vergangenen lag.',
    aufgaben: [
      { typ: 'luecke', satz: 'Cuando llegué, ella ya se ___ ido.', loesung: 'había', hilfe: 'haber im Imperfekt', de: 'Als ich ankam, war sie schon weg.' },
      { typ: 'wahl', satz: 'No fui porque ya ___ visto la película.', optionen: ['había', 'habría', 'he'], loesung: 'había', de: 'Ich ging nicht, weil ich den Film schon gesehen hatte.' },
      { typ: 'luecke', satz: 'Nosotros ya ___ cenado cuando llamaste.', loesung: 'habíamos', hilfe: 'haber, wir', de: 'Wir hatten schon gegessen, als du anriefst.' },
      { typ: 'fehler', satz: 'Cuando llegamos, la fiesta ha terminado ya.', falsch: 'ha', richtig: 'había', de: 'Als wir ankamen, war die Feier schon vorbei.' },
      { typ: 'bauen', loesung: 'Nunca había estado en México', de: 'Ich war noch nie in Mexiko gewesen.' },
    ],
  },
  {
    id: 'indirekte-rede',
    titel: 'Die indirekte Rede',
    familie: 'vergangenheit',
    lektion: 'indirekt',
    regel: 'Nach dijo que rutscht der Satz eine Zeitstufe zurück.',
    aufgaben: [
      { typ: 'wahl', satz: 'Ana dijo que ___ cansada.', optionen: ['estaba', 'está', 'estará'], loesung: 'estaba', de: 'Ana sagte, dass sie müde sei.' },
      { typ: 'luecke', satz: 'Tom dijo que ___ mañana.', loesung: 'vendría', hilfe: 'venir im Konditional', de: 'Tom sagte, dass er morgen käme.' },
      { typ: 'wahl', satz: 'Me preguntó ___ tenía tiempo.', optionen: ['si', 'que', 'cuando'], loesung: 'si', de: 'Er fragte mich, ob ich Zeit hätte.' },
      { typ: 'fehler', satz: 'Dijo que está muy ocupado ayer.', falsch: 'está', richtig: 'estaba', de: 'Er sagte, dass er gestern sehr beschäftigt war.' },
      { typ: 'bauen', loesung: 'Dijo que llegaría más tarde', de: 'Er sagte, dass er später käme.' },
    ],
  },

  // ---------------------------------------------------------------
  //  Zukunft & Bedingung
  // ---------------------------------------------------------------
  {
    id: 'ir-a',
    titel: 'Die nahe Zukunft',
    familie: 'zukunft',
    lektion: 'zukunft',
    regel: 'ir a plus Infinitiv – die Zukunft, die man im Alltag wirklich benutzt.',
    aufgaben: [
      { typ: 'luecke', satz: 'Mañana ___ a visitar a mi abuela.', loesung: 'voy', hilfe: 'ir, ich', de: 'Morgen besuche ich meine Großmutter.' },
      { typ: 'wahl', satz: 'Ellos ___ a viajar en agosto.', optionen: ['van', 'va', 'vamos'], loesung: 'van', de: 'Sie werden im August verreisen.' },
      { typ: 'luecke', satz: '¿Qué ___ a hacer este fin de semana?', loesung: 'vas', hilfe: 'ir, du', de: 'Was machst du dieses Wochenende?' },
      { typ: 'fehler', satz: 'Yo va a llamarte esta tarde.', falsch: 'va', richtig: 'voy', de: 'Ich rufe dich heute Nachmittag an.' },
      { typ: 'bauen', loesung: 'Voy a estudiar esta noche', de: 'Ich werde heute Abend lernen.' },
    ],
  },
  {
    id: 'futur',
    titel: 'Das Futur auf -é',
    familie: 'zukunft',
    lektion: 'futur',
    regel: 'Die Endung hängt am ganzen Infinitiv – für alle drei Verbgruppen gleich.',
    aufgaben: [
      { typ: 'luecke', satz: 'El año que viene ___ en Madrid.', loesung: 'viviré', hilfe: 'vivir, ich', de: 'Nächstes Jahr werde ich in Madrid leben.' },
      { typ: 'wahl', satz: 'Mañana ___ el resultado.', optionen: ['sabremos', 'sabemos', 'supimos'], loesung: 'sabremos', de: 'Morgen werden wir das Ergebnis wissen.' },
      { typ: 'luecke', satz: 'Ellos ___ a las ocho en punto.', loesung: 'llegarán', hilfe: 'llegar, sie', de: 'Sie werden punkt acht ankommen.' },
      { typ: 'fehler', satz: 'Mañana yo hablaremos con el jefe.', falsch: 'hablaremos', richtig: 'hablaré', de: 'Morgen werde ich mit dem Chef sprechen.' },
      { typ: 'bauen', loesung: 'El tren saldrá a las nueve', de: 'Der Zug wird um neun abfahren.' },
    ],
  },
  {
    id: 'bedingung-real',
    titel: 'Reale Bedingungen mit si',
    familie: 'zukunft',
    lektion: 'bedingung',
    regel: 'si plus Präsens, dann Futur. Nach si steht nie der Subjuntivo der Gegenwart.',
    aufgaben: [
      { typ: 'luecke', satz: 'Si ___ tiempo, iré contigo.', loesung: 'tengo', hilfe: 'tener, ich', de: 'Wenn ich Zeit habe, komme ich mit.' },
      { typ: 'wahl', satz: 'Si llueve, ___ en casa.', optionen: ['nos quedaremos', 'nos quedáramos', 'nos quedaríamos'], loesung: 'nos quedaremos', de: 'Wenn es regnet, bleiben wir zu Hause.' },
      { typ: 'luecke', satz: 'Si ___ pronto, llegamos a tiempo.', loesung: 'salimos', hilfe: 'salir, wir', de: 'Wenn wir früh losgehen, kommen wir pünktlich an.' },
      { typ: 'fehler', satz: 'Si tenga dinero, compraré un coche.', falsch: 'tenga', richtig: 'tengo', de: 'Wenn ich Geld habe, kaufe ich ein Auto.' },
      { typ: 'bauen', loesung: 'Si estudias aprobarás el examen', de: 'Wenn du lernst, bestehst du die Prüfung.' },
    ],
  },
  {
    id: 'konditional',
    titel: 'Der Konditional',
    familie: 'zukunft',
    lektion: 'konditional',
    regel: 'hablaría, comería – die Imperfekt-Endungen, aber am ganzen Infinitiv.',
    aufgaben: [
      { typ: 'luecke', satz: 'Yo en tu lugar ___ con ella.', loesung: 'hablaría', hilfe: 'hablar, ich', de: 'An deiner Stelle würde ich mit ihr reden.' },
      { typ: 'wahl', satz: '___ ir, pero no tengo tiempo.', optionen: ['Iría', 'Iré', 'Iba'], loesung: 'Iría', de: 'Ich würde gehen, aber ich habe keine Zeit.' },
      { typ: 'luecke', satz: 'Nos ___ mucho verte pronto.', loesung: 'gustaría', hilfe: 'gustar im Konditional', de: 'Wir würden dich sehr gern bald sehen.' },
      { typ: 'fehler', satz: 'Yo que tú hablaré con el jefe.', falsch: 'hablaré', richtig: 'hablaría', de: 'An deiner Stelle würde ich mit dem Chef reden.' },
      { typ: 'bauen', loesung: 'Me encantaría vivir en España', de: 'Ich würde sehr gern in Spanien leben.' },
    ],
  },
  {
    id: 'bedingung-irreal',
    titel: 'Irreale Bedingungen',
    familie: 'zukunft',
    lektion: 'irreal',
    regel: 'si plus Imperfekt-Subjuntivo, dann Konditional: si tuviera tiempo, iría.',
    aufgaben: [
      { typ: 'luecke', satz: 'Si ___ tiempo, iría contigo.', loesung: 'tuviera', hilfe: 'tener im Subjuntivo', de: 'Wenn ich Zeit hätte, würde ich mitkommen.' },
      { typ: 'wahl', satz: 'Si fuera rico, ___ por el mundo.', optionen: ['viajaría', 'viajaré', 'viajaba'], loesung: 'viajaría', de: 'Wenn ich reich wäre, würde ich um die Welt reisen.' },
      { typ: 'luecke', satz: 'Si yo ___ tú, aceptaría la oferta.', loesung: 'fuera', hilfe: 'ser im Subjuntivo', de: 'Wenn ich du wäre, würde ich das Angebot annehmen.' },
      { typ: 'fehler', satz: 'Si tendría dinero, compraría una casa.', falsch: 'tendría', richtig: 'tuviera', de: 'Wenn ich Geld hätte, würde ich ein Haus kaufen.' },
      { typ: 'bauen', loesung: 'Si pudiera te ayudaría ahora', de: 'Wenn ich könnte, würde ich dir jetzt helfen.' },
    ],
  },

  // ---------------------------------------------------------------
  //  Subjuntivo
  // ---------------------------------------------------------------
  {
    id: 'ojala',
    titel: 'Wünsche mit ojalá',
    familie: 'subjuntivo',
    lektion: 'ojala',
    regel: 'ojalá pueda heißt: es geht vielleicht. ojalá pudiera heißt: es geht nicht.',
    aufgaben: [
      { typ: 'luecke', satz: 'Ojalá ___ buen tiempo mañana.', loesung: 'haga', hilfe: 'hacer im Subjuntivo', de: 'Hoffentlich ist morgen gutes Wetter.' },
      { typ: 'wahl', satz: 'Ojalá ___ venir, pero está en Berlín.', optionen: ['pudiera', 'puede', 'podrá'], loesung: 'pudiera', de: 'Wenn er nur kommen könnte, aber er ist in Berlin.' },
      { typ: 'luecke', satz: 'Ojalá ___ pronto, te echo de menos.', loesung: 'vuelvas', hilfe: 'volver, du', de: 'Hoffentlich kommst du bald zurück, du fehlst mir.' },
      { typ: 'fehler', satz: 'Ojalá tienes razón esta vez.', falsch: 'tienes', richtig: 'tengas', de: 'Hoffentlich hast du diesmal recht.' },
      { typ: 'bauen', loesung: 'Ojalá llegue el tren pronto', de: 'Hoffentlich kommt der Zug bald.' },
    ],
  },
  {
    id: 'subjuntivo-bildung',
    titel: 'Die Bildung des Subjuntivo',
    familie: 'subjuntivo',
    lektion: 'subjuntivo',
    regel: 'Die Endung springt die Seite: hablar wird hable, comer wird coma.',
    aufgaben: [
      { typ: 'luecke', satz: 'Quiero que ___ conmigo al cine.', loesung: 'vengas', hilfe: 'venir, du', de: 'Ich will, dass du mit mir ins Kino kommst.' },
      { typ: 'wahl', satz: 'Espero que todo ___ bien.', optionen: ['salga', 'sale', 'saldrá'], loesung: 'salga', de: 'Ich hoffe, dass alles gut geht.' },
      { typ: 'luecke', satz: 'Es importante que ___ pronto.', loesung: 'llegues', hilfe: 'llegar, du', de: 'Es ist wichtig, dass du früh ankommst.' },
      { typ: 'fehler', satz: 'Quiero que tú hablas con él.', falsch: 'hablas', richtig: 'hables', de: 'Ich will, dass du mit ihm sprichst.' },
      { typ: 'bauen', loesung: 'Espero que tengas buen viaje', de: 'Ich hoffe, du hast eine gute Reise.' },
    ],
  },
  {
    id: 'gefuehle-que',
    titel: 'Gefühle und Wertungen',
    familie: 'subjuntivo',
    lektion: 'wertungen',
    regel: 'Ein Gefühl oder eine Wertung plus que – danach steht der Subjuntivo.',
    aufgaben: [
      { typ: 'luecke', satz: 'Me alegro de que ___ aquí.', loesung: 'estés', hilfe: 'estar, du', de: 'Ich freue mich, dass du hier bist.' },
      { typ: 'wahl', satz: 'Es una pena que no ___ venir.', optionen: ['puedas', 'puedes', 'podrás'], loesung: 'puedas', de: 'Schade, dass du nicht kommen kannst.' },
      { typ: 'luecke', satz: 'Me gusta que ___ tanto.', loesung: 'estudies', hilfe: 'estudiar, du', de: 'Mir gefällt, dass du so viel lernst.' },
      { typ: 'fehler', satz: 'Es raro que Ana no viene hoy.', falsch: 'viene', richtig: 'venga', de: 'Es ist seltsam, dass Ana heute nicht kommt.' },
      { typ: 'bauen', loesung: 'Siento que estés enfermo hoy', de: 'Es tut mir leid, dass du heute krank bist.' },
    ],
  },
  {
    id: 'creo-no-creo',
    titel: 'creo que und no creo que',
    familie: 'subjuntivo',
    lektion: 'meinungen',
    regel: 'creo que nimmt den Indikativ – no creo que den Subjuntivo. Der Zweifel schaltet um.',
    aufgaben: [
      { typ: 'wahl', satz: 'Creo que ___ razón.', optionen: ['tienes', 'tengas'], loesung: 'tienes', de: 'Ich glaube, du hast recht.' },
      { typ: 'wahl', satz: 'No creo que ___ razón.', optionen: ['tengas', 'tienes'], loesung: 'tengas', de: 'Ich glaube nicht, dass du recht hast.' },
      { typ: 'luecke', satz: 'No pienso que ___ una buena idea.', loesung: 'sea', hilfe: 'ser im Subjuntivo', de: 'Ich finde nicht, dass das eine gute Idee ist.' },
      { typ: 'fehler', satz: 'No creo que Ana viene mañana.', falsch: 'viene', richtig: 'venga', de: 'Ich glaube nicht, dass Ana morgen kommt.' },
      { typ: 'bauen', loesung: 'Creo que mañana hace frío', de: 'Ich glaube, morgen ist es kalt.' },
    ],
  },
  {
    id: 'cuando-subjuntivo',
    titel: 'cuando mit Subjuntivo',
    familie: 'subjuntivo',
    lektion: 'cuandosubj',
    regel: 'Geht es um Zukünftiges, nimmt cuando den Subjuntivo: cuando llegue, nicht llega.',
    aufgaben: [
      { typ: 'luecke', satz: 'Cuando ___ a casa, te llamo.', loesung: 'llegue', hilfe: 'llegar, ich, Subjuntivo', de: 'Wenn ich nach Hause komme, rufe ich dich an.' },
      { typ: 'wahl', satz: 'Te aviso cuando ___ listo.', optionen: ['esté', 'está', 'estará'], loesung: 'esté', de: 'Ich sage dir Bescheid, wenn es fertig ist.' },
      { typ: 'luecke', satz: 'Cuando ___ dinero, viajaremos más.', loesung: 'tengamos', hilfe: 'tener, wir', de: 'Wenn wir Geld haben, reisen wir mehr.' },
      { typ: 'fehler', satz: 'Cuando termino el trabajo, te llamaré.', falsch: 'termino', richtig: 'termine', de: 'Wenn ich mit der Arbeit fertig bin, rufe ich dich an.' },
      { typ: 'bauen', loesung: 'Cuando puedas llámame por favor', de: 'Ruf mich an, wenn du kannst.' },
    ],
  },
  {
    id: 'para-que',
    titel: 'Zwecksätze mit para que',
    familie: 'subjuntivo',
    lektion: 'zwecksaetze',
    regel: 'para que verlangt den Subjuntivo – aber nur, wenn zwei verschiedene Personen handeln.',
    aufgaben: [
      { typ: 'luecke', satz: 'Te lo digo para que lo ___.', loesung: 'sepas', hilfe: 'saber, du', de: 'Ich sage es dir, damit du es weißt.' },
      { typ: 'wahl', satz: 'Hablo despacio para que me ___.', optionen: ['entiendas', 'entiendes', 'entenderás'], loesung: 'entiendas', de: 'Ich spreche langsam, damit du mich verstehst.' },
      { typ: 'luecke', satz: 'Lo hago para que ___ contento.', loesung: 'estés', hilfe: 'estar, du', de: 'Ich mache es, damit du zufrieden bist.' },
      { typ: 'fehler', satz: 'Te escribo para que sabes la fecha.', falsch: 'sabes', richtig: 'sepas', de: 'Ich schreibe dir, damit du das Datum weißt.' },
      { typ: 'bauen', loesung: 'Vengo para que hablemos tranquilos', de: 'Ich komme, damit wir in Ruhe reden.' },
    ],
  },
]

// ---------------------------------------------------------------
//  Ab hier: die Logik. Keine Inhalte mehr.
// ---------------------------------------------------------------

/** Wie viele Aufgaben eine Runde hat. Fünf sind rund zwei Minuten. */
export const RUNDE_GROESSE = 5

/** Einen Baustein über seine id finden. */
export function bausteinMit(id) {
  return BAUSTEINE.find((b) => b.id === id) ?? null
}

/** Die Lektion, die diesen Baustein erklärt – für den Sprung dorthin. */
export function lektionZu(baustein) {
  return LEKTIONEN.find((l) => l.id === baustein.lektion) ?? null
}

/**
 * Ist dieser Baustein schon freigeschaltet?
 *
 * Regel: sobald die erklärende Lektion durch ist. Sonst bekäme ein
 * Anfänger am dritten Tag den Subjuntivo vorgesetzt.
 *
 * Die Ausnahme sind die ersten fünf: Wer die App frisch installiert
 * hat, soll den Trainer trotzdem anfassen können, statt vor einer
 * leeren Seite zu stehen.
 */
export function istOffen(baustein, lessonProgress = {}) {
  if (BAUSTEINE.indexOf(baustein) < 5) return true
  return Boolean(lessonProgress?.[baustein.lektion]?.fertig)
}

/** Alle freigeschalteten Bausteine, in Kursreihenfolge. */
export function offeneBausteine(lessonProgress = {}) {
  return BAUSTEINE.filter((b) => istOffen(b, lessonProgress))
}

/**
 * Der Baustein des Tages.
 *
 * Genommen wird der am längsten überfällige. Ein noch nie geübter
 * Baustein hat keinen Termin und gilt damit als maximal überfällig –
 * so arbeitet man sich der Reihe nach vor, ohne dass jemand eine
 * Reihenfolge festlegen müsste.
 *
 * Kein Zufall, kein Datum: Wer heute übt, schiebt den Termin nach
 * hinten, und morgen steht von selbst ein anderer oben. Genau das
 * ist mit "jeden Tag eine andere Grundlage" gemeint.
 */
export function bausteinDesTages(stand = {}, lessonProgress = {}) {
  const offen = offeneBausteine(lessonProgress)
  if (offen.length === 0) return null

  let bester = offen[0]
  let besterTermin = stand[bester.id]?.due ?? 0
  for (const b of offen) {
    const termin = stand[b.id]?.due ?? 0
    if (termin < besterTermin) {
      bester = b
      besterTermin = termin
    }
  }
  return bester
}

/** Wie viele Bausteine sind gerade fällig? Für die Zahl im Trainer. */
export function faelligeBausteine(stand = {}, lessonProgress = {}) {
  const jetzt = Date.now()
  return offeneBausteine(lessonProgress).filter(
    (b) => (stand[b.id]?.due ?? 0) <= jetzt
  )
}

/**
 * Wie viele Aufgaben einer Runde von der KI stammen dürfen.
 *
 * Zwei von fünf, nicht mehr. Die Formprüfung in aufgabePruefen.js
 * fängt unlösbare Aufgaben ab – aber kein Regelwerk erkennt einen
 * Satz, der grammatisch geht und trotzdem das Falsche übt. Bleibt
 * die Mehrheit jeder Runde geprüft, wiegt ein Ausrutscher nicht
 * schwer.
 */
export const KI_JE_RUNDE = 2

/**
 * Die Aufgaben für eine Runde zusammenstellen.
 *
 * Erst die KI-Varianten begrenzen, dann alles zusammen mischen: So
 * ist die Reihenfolge jedes Mal anders, ohne dass eine Runde
 * überwiegend aus ungeprüftem Stoff besteht.
 */
export function baueRunde(baustein, zusatz = []) {
  const ki = mischen(zusatz).slice(0, KI_JE_RUNDE)
  const basis = mischen(baustein.aufgaben).slice(0, RUNDE_GROESSE - ki.length)
  return mischen([...basis, ...ki])
}

/** Die Bausteine einer Familie – für die Übersicht. */
export function bausteineVon(familie) {
  return BAUSTEINE.filter((b) => b.familie === familie.id)
}

// Ein Satz pro Tag auf der Startseite.
//
// Warum eine feste Liste und keine KI: Ein Zitat ist genau dann
// schön, wenn es stimmt. Ein Modell, das täglich ein neues erfindet,
// schreibt früher oder später einem echten Menschen einen Satz zu,
// den er nie gesagt hat – und das steht dann auf deiner Startseite.
// Die Liste hier kostet nichts, funktioniert ohne Netz und kann
// nicht danebengreifen.
//
// Der Großteil sind REFRANES – spanische Sprichwörter. Die haben
// keinen Urheber, den man falsch nennen könnte, sie sind echtes
// Alltagsspanisch, und sie sagen oft genau das, was jemand hören
// muss, der gerade an Lektion 40 hängt.
//
// Die deutsche Zeile ist eine ehrliche Übersetzung, kein deutsches
// Ersatzsprichwort: Wer hier mitliest, soll den spanischen Satz
// verstehen, nicht ein anderes Sprichwort lernen.

/**
 * Die Sätze.
 *
 * quelle nur, wo ich mir sicher bin. Im Zweifel steht dort nichts –
 * lieber ohne Herkunft als mit einer erfundenen.
 */
export const ZITATE = [
  // --- Dranbleiben ---
  { es: 'Poco a poco se anda lejos.', de: 'Schritt für Schritt kommt man weit.' },
  { es: 'El que la sigue, la consigue.', de: 'Wer dranbleibt, bekommt es auch.' },
  { es: 'El que persevera, alcanza.', de: 'Wer durchhält, kommt an.' },
  { es: 'Gota a gota se llena la copa.', de: 'Tropfen für Tropfen füllt sich das Glas.' },
  { es: 'Grano a grano, se llena el granero.', de: 'Korn für Korn füllt sich die Scheune.' },
  { es: 'Poco a poco hila la vieja el copo.', de: 'Nach und nach spinnt die Alte den Flachs.' },
  { es: 'No dejes para mañana lo que puedas hacer hoy.', de: 'Verschiebe nicht auf morgen, was du heute tun kannst.' },
  { es: 'Más vale tarde que nunca.', de: 'Besser spät als nie.' },
  { es: 'Camarón que se duerme, se lo lleva la corriente.', de: 'Die Garnele, die einschläft, nimmt die Strömung mit.' },
  { es: 'A quien madruga, Dios le ayuda.', de: 'Wer früh aufsteht, dem hilft der Himmel.' },
  { es: 'El movimiento se demuestra andando.', de: 'Dass man vorankommt, zeigt sich im Gehen.' },
  { es: 'Lo que bien se aprende, nunca se pierde.', de: 'Was man gut lernt, verliert man nie.' },
  { es: 'Quien siembra, recoge.', de: 'Wer sät, der erntet.' },

  // --- Fehler machen ---
  { es: 'De los errores se aprende.', de: 'Aus Fehlern lernt man.' },
  { es: 'El que no comete errores, no hace nada.', de: 'Wer keine Fehler macht, macht gar nichts.' },
  { es: 'Errar es humano.', de: 'Irren ist menschlich.' },
  { es: 'Nadie nace enseñado.', de: 'Niemand wird gelehrt geboren.' },
  { es: 'Nadie escarmienta en cabeza ajena.', de: 'Niemand wird an fremdem Kopf klug.' },
  { es: 'La práctica hace al maestro.', de: 'Übung macht den Meister.' },
  { es: 'Se hace camino al andar.', de: 'Der Weg entsteht beim Gehen.', quelle: 'Antonio Machado' },
  { es: 'Al mal tiempo, buena cara.', de: 'Bei schlechtem Wetter ein gutes Gesicht.' },
  { es: 'Cada maestrillo tiene su librillo.', de: 'Jeder hat seine eigene Art, es zu machen.' },

  // --- Sprache und Sprechen ---
  { es: 'Hablando se entiende la gente.', de: 'Im Sprechen versteht man einander.' },
  { es: 'Cuantas lenguas hablas, tantas veces eres persona.', de: 'So viele Sprachen du sprichst, so oft bist du Mensch.' },
  { es: 'El que habla dos lenguas vale por dos.', de: 'Wer zwei Sprachen spricht, zählt doppelt.' },
  { es: 'Quien pregunta, no yerra.', de: 'Wer fragt, macht nichts falsch.' },
  { es: 'Preguntando se llega a Roma.', de: 'Mit Fragen kommt man bis nach Rom.' },
  { es: 'Del dicho al hecho hay mucho trecho.', de: 'Zwischen Sagen und Tun liegt ein weiter Weg.' },
  { es: 'Obras son amores, y no buenas razones.', de: 'Taten sind Liebe, nicht schöne Worte.' },
  { es: 'Las palabras se las lleva el viento.', de: 'Die Worte trägt der Wind davon.' },

  // --- Geduld ---
  { es: 'No se ganó Zamora en una hora.', de: 'Zamora wurde nicht in einer Stunde erobert.' },
  { es: 'La paciencia es la madre de la ciencia.', de: 'Geduld ist die Mutter des Wissens.' },
  { es: 'Vísteme despacio, que tengo prisa.', de: 'Zieh mich langsam an, ich habe es eilig.' },
  { es: 'No por mucho madrugar amanece más temprano.', de: 'Auch wer früher aufsteht, bringt die Sonne nicht früher hoch.' },
  { es: 'Cada cosa a su tiempo.', de: 'Alles zu seiner Zeit.' },
  { es: 'Quien mucho abarca, poco aprieta.', de: 'Wer zu viel auf einmal will, hält am Ende wenig fest.' },

  // --- Anfangen ---
  { es: 'Todo principio es difícil.', de: 'Aller Anfang ist schwer.' },
  { es: 'El primer paso es el que cuesta.', de: 'Der erste Schritt ist der schwerste.' },
  { es: 'Comenzar es ya la mitad.', de: 'Anfangen ist schon die Hälfte.' },
  { es: 'Querer es poder.', de: 'Wollen ist Können.' },
  { es: 'Nunca es tarde para aprender.', de: 'Zum Lernen ist es nie zu spät.' },
  { es: 'Quien no arriesga, no gana.', de: 'Wer nichts wagt, gewinnt nichts.' },
  { es: 'El que algo quiere, algo le cuesta.', de: 'Wer etwas will, muss auch etwas dafür geben.' },
  { es: 'No hay atajo sin trabajo.', de: 'Es gibt keine Abkürzung ohne Arbeit.' },
  { es: 'Lo importante no es llegar, sino saber ir.', de: 'Wichtig ist nicht anzukommen, sondern gehen zu können.' },

  // --- Vertrauen ---
  { es: 'Todo llega para quien sabe esperar.', de: 'Alles kommt für den, der warten kann.' },
  { es: 'Después de la tormenta viene la calma.', de: 'Nach dem Sturm kommt die Ruhe.' },
  { es: 'No hay mal que cien años dure.', de: 'Kein Übel dauert hundert Jahre.' },
  { es: 'Cuando una puerta se cierra, otra se abre.', de: 'Wenn eine Tür sich schließt, öffnet sich eine andere.' },
  { es: 'A cada día le basta su propio afán.', de: 'Jedem Tag genügt seine eigene Mühe.' },
  { es: 'Mañana será otro día.', de: 'Morgen ist auch noch ein Tag.' },
  { es: 'Hoy por ti, mañana por mí.', de: 'Heute für dich, morgen für mich.' },

  // --- Wie man lernt ---
  { es: 'El saber no ocupa lugar.', de: 'Wissen nimmt keinen Platz weg.' },
  { es: 'Más vale maña que fuerza.', de: 'Geschick ist mehr wert als Kraft.' },
  { es: 'Más vale poco y bueno que mucho y malo.', de: 'Besser wenig und gut als viel und schlecht.' },
  { es: 'A buen entendedor, pocas palabras bastan.', de: 'Dem Verständigen genügen wenige Worte.' },
  { es: 'Cada uno a su manera.', de: 'Jeder auf seine Art.' },
]

/**
 * Welcher Tag ist heute – als fortlaufende Zahl?
 *
 * Gerechnet ab einem festen Datum, nicht als Tag im Jahr: Sonst
 * spränge die Liste jeden Silvester zurück auf Anfang und der
 * 1. Januar zeigte für immer denselben Satz.
 */
function tagesZahl(datum = new Date()) {
  const TAG = 24 * 60 * 60 * 1000
  // Ortszeit, nicht UTC: Der Satz soll um Mitternacht hier wechseln.
  const heute = new Date(datum.getFullYear(), datum.getMonth(), datum.getDate())
  return Math.floor(heute.getTime() / TAG)
}

/**
 * Der Satz für heute.
 *
 * Gleich für alle und den ganzen Tag derselbe – kein Zufall. Wer die
 * App zweimal öffnet, soll nicht zwei verschiedene Sätze sehen und
 * sich fragen, welcher denn nun gilt.
 */
export function zitatDesTages(datum = new Date()) {
  return ZITATE[tagesZahl(datum) % ZITATE.length]
}

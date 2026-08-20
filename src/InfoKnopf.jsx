import { useState } from 'react'

// Ein Fragezeichen, das den Bereich erklärt, in dem es steht.
//
// Warum an Ort und Stelle statt in einer Hilfe: Die Frage "warum
// kommt genau dieses Wort jetzt?" stellt sich beim Üben. Die Frage
// "was holt ihr euch da eigentlich von Spotify?" stellt sich vor dem
// Verbinden. Beide Antworten gehören dorthin, wo die Frage entsteht.
//
// Und warum alle Texte in EINER Datei: Vokabeln und Grammatik laufen
// durch denselben Karteikasten. Stünde die Erklärung zweimal da,
// würde eine davon irgendwann etwas anderes behaupten.

const TEXTE = {
  woerter: {
    titel: 'Wie der Vokabeltrainer arbeitet',
    absaetze: [
      [
        'Woher die Wörter kommen: ',
        'Jedes Wort aus einer Lektion landet hier. Dazu alles, was du beim ' +
          'Video-Schauen oder in einem Ebook antippst.',
      ],
      [
        'Warum gerade jetzt: ',
        'Der Trainer merkt sich, wann du ein Wort zuletzt konntest, und legt ' +
          'es dir vor, bevor du es vergisst – nach einem Tag, nach dreien, nach ' +
          'einer Woche, nach einem Monat. Wie du eine Karte bewertest, ' +
          'entscheidet über den nächsten Termin: „Nochmal" holt sie in 15 ' +
          'Minuten zurück, „Einfach" schiebt sie weit nach hinten.',
      ],
      [
        'Was die KI dabei tut: ',
        'Der Listengenerator stellt dir zu jedem Thema zwölf Wörter zusammen – ' +
          'ohne die, die du längst hast. Mit KI-Gen wählt sie das Thema selbst, ' +
          'passend zu dem, was du schon gesammelt hast.',
      ],
    ],
  },
  spotify: {
    titel: 'Was passiert beim Verbinden?',
    absaetze: [
      [
        'Wozu das gut ist: ',
        'Aus deiner Spotify-Bibliothek suchen wir die spanischsprachigen ' +
          'Künstler heraus. Du bekommst dann Songs zum Mitlesen, die du ohnehin ' +
          'hörst – das ist der Unterschied zwischen Lernstoff und Musik.',
      ],
      [
        'Was wir lesen: ',
        'Deine gespeicherten Titel, deine Playlists und deine meistgehörten ' +
          'Künstler und Songs. Mehr fragt die App nicht an.',
      ],
      [
        'Was wir NICHT tun: ',
        'Nichts abspielen, nichts ändern, niemandem folgen, nichts posten. Die ' +
          'Rechte, die angefordert werden, erlauben ausschließlich Lesen – ' +
          'abspielen oder speichern könnte die App gar nicht.',
      ],
      [
        'Wieder lösen: ',
        'Ein Knopf hier trennt die Verbindung. Zusätzlich kannst du den Zugang ' +
          'jederzeit in deinem Spotify-Konto unter „Apps" entziehen.',
      ],
    ],
  },
  grammatik: {
    titel: 'Wie die Bausteine arbeiten',
    absaetze: [
      [
        'Was ein Baustein ist: ',
        'Eine Regel mit fünf Aufgaben – „Ser oder estar", „Indefinido oder ' +
          'Imperfekt". 55 Stück, jede erklärt von der Lektion, aus der sie stammt.',
      ],
      [
        'Derselbe Karteikasten: ',
        'Bausteine laufen durch dieselbe Rechnung wie die Vokabeln. Fünf von ' +
          'fünf richtig, und die Regel kommt lange nicht wieder; unter drei, und ' +
          'sie ist gleich wieder dran. Jeden Tag steht eine andere oben – die, ' +
          'die am längsten überfällig ist.',
      ],
      [
        'Was die KI dabei tut: ',
        'Ab dem zweiten Üben schreibt sie zusätzliche Aufgaben zur selben Regel, ' +
          'damit nicht ewig dieselben fünf Sätze kommen. Höchstens zwei von fünf ' +
          'pro Runde – und jede läuft vorher durch dieselbe Prüfung wie die ' +
          'handgeschriebenen.',
      ],
    ],
  },
}

export default function InfoKnopf({ thema }) {
  const [offen, setOffen] = useState(false)
  const inhalt = TEXTE[thema] ?? TEXTE.woerter

  return (
    <>
      <button
        className="wieder-info"
        onClick={() => setOffen(!offen)}
        aria-expanded={offen}
        title={inhalt.titel}
      >
        {offen ? '×' : '?'}
      </button>

      {offen && (
        <div className="wieder-erklaerung">
          <h3>{inhalt.titel}</h3>
          {inhalt.absaetze.map(([kopf, text]) => (
            <p key={kopf}>
              <b>{kopf}</b>
              {text}
            </p>
          ))}
        </div>
      )}
    </>
  )
}

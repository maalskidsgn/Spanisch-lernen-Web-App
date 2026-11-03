import { useState } from 'react'

import { useTexte } from './sprache.js'
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
    titel: "ik.woerter.titel",
    absaetze: [
      ["ik.woerter.a0.kopf", "ik.woerter.a0.text"],
      ["ik.woerter.a1.kopf", "ik.woerter.a1.text"],
      ["ik.woerter.a2.kopf", "ik.woerter.a2.text"],
    ],
  },
  spotify: {
    titel: "ik.spotify.titel",
    absaetze: [
      ["ik.spotify.a0.kopf", "ik.spotify.a0.text"],
      ["ik.spotify.a1.kopf", "ik.spotify.a1.text"],
      ["ik.spotify.a2.kopf", "ik.spotify.a2.text"],
      ["ik.spotify.a3.kopf", "ik.spotify.a3.text"],
    ],
  },
  grammatik: {
    titel: "ik.grammatik.titel",
    absaetze: [
      ["ik.grammatik.a0.kopf", "ik.grammatik.a0.text"],
      ["ik.grammatik.a1.kopf", "ik.grammatik.a1.text"],
      ["ik.grammatik.a2.kopf", "ik.grammatik.a2.text"],
    ],
  },
}


export default function InfoKnopf({ thema }) {
  const t = useTexte()
  const [offen, setOffen] = useState(false)
  const inhalt = TEXTE[thema] ?? TEXTE.woerter

  return (
    <>
      <button
        className="wieder-info"
        onClick={() => setOffen(!offen)}
        aria-expanded={offen}
        title={t(inhalt.titel)}
      >
        {offen ? '×' : '?'}
      </button>

      {offen && (
        <div className="wieder-erklaerung">
          <h3>{t(inhalt.titel)}</h3>
          {inhalt.absaetze.map(([kopf, text]) => (
            <p key={kopf}>
              <b>{t(kopf)}</b>
              {t(text)}
            </p>
          ))}
        </div>
      )}
    </>
  )
}

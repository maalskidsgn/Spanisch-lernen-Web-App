import { useEffect, useRef, useState } from 'react'

// "So funktioniert Habloo": 10 Reiter mit animierten Erklärvideos (HyperFrames,
// Quelle ~/habloo-social/funktionen). Stumm in Schleife, auf Wunsch mit Julias Erklärung.
const REITER = [
  { k: 'lektionen', n: 'Lektionen', t: 'Schritt für Schritt', p: ['Dein Lernweg als Reiseroute – Etappe für Etappe', 'Neue Wörter mit Aussprache, kleine Dialoge und Übungen', 'Ist eine Etappe geschafft, geht die nächste auf'] },
  { k: 'vokabeltrainer', n: 'Vokabeltrainer', t: 'Wörter, die bleiben', p: ['Karteikarten mit Wort, Übersetzung und Aussprache', 'Du bewertest selbst: Nochmal, Schwer, Gut oder Einfach', 'Jedes Wort kommt nach 1, 3, 7, 14, 30 und 90 Tagen wieder'] },
  { k: 'spiele', n: 'Spiele', t: 'Lernen wie beim Spielen', p: ['Sechs Spiele: Memory, Wortpaare, Wortsuche, Blitzrunde, Galgenmännchen, Buchstabensalat', 'Immer mit den Wörtern, die du gerade lernst', 'Jede richtige Antwort bringt XP'] },
  { k: 'duell', n: 'Duell & Freunde', t: 'Lernen mit Freunden', p: ['Am grünen Punkt siehst du, wer gerade online ist', 'Duell mit sieben gleichen Fragen für beide', 'Jeder spielt, wann er Zeit hat – wer mehr richtig hat, gewinnt'] },
  { k: 'saetze', n: 'Sätze', t: 'Ganze Sätze statt einzelner Wörter', p: ['Thema wählen, zum Beispiel Reisen oder Restaurant', 'Habloo erstellt passende Sätze für dich', 'Die besten landen mit einem Tipp in deinem Satz-Karteikasten'] },
  { k: 'texte', n: 'Texte', t: 'Lesen und Hören', p: ['Jeden Tag kurze Texte über Land und Leute', 'Mit einem Tipp zwischen Spanisch und Deutsch wechseln oder vorlesen lassen', 'Unbekannte Wörter gehen direkt in den Vokabeltrainer'] },
  { k: 'videos', n: 'Videos', t: 'Lernen mit echten Videos', p: ['Musik, Kochen, Reisen – ganz wie du magst', 'Die Untertitel laufen mit, die aktuelle Zeile leuchtet', 'Ein Klick auf ein Wort – und es ist in deinem Vokabeltrainer'] },
  { k: 'tutor', n: 'KI-Tutor', t: 'Habla, dein KI-Tutor', p: ['Schreib auf Spanisch – Habla antwortet wie ein echter Gesprächspartner', 'Unter jeder Antwort steht die Übersetzung, auf Wunsch ausgeblendet', 'Habla merkt sich eure Themen und deine schweren Wörter'] },
  { k: 'rangliste', n: 'Rangliste', t: 'Ein kleiner Wettbewerb', p: ['Für jedes richtige Wort gibt es XP', 'Mit jedem Punkt kletterst du nach oben', 'Eigener Benutzername – darüber findest du auch deine Freunde'] },
  { k: 'statistik', n: 'Statistik', t: 'Sieh, was du geschafft hast', p: ['Der Kalender zeigt deine Lerntage', 'XP sammeln und Level für Level aufsteigen', 'Deine Tagesserie zeigt, wie lange du dranbleibst'] },
]

export default function FunktionenTabs() {
  const [akt, setAkt] = useState(REITER[1])
  const [ton, setTon] = useState(false)
  const v = useRef(null)

  useEffect(() => {
    const el = v.current
    if (!el) return
    el.muted = !ton
    el.currentTime = 0
    el.play().catch(() => {})
  }, [akt, ton])

  return (
    <section className="wk-sektion">
      <div className="wk-breite">
        <div className="wk-kopf zeigt-sich">
          <span className="wk-label">So funktioniert Habloo</span>
          <h2>Alles, was du zum Spanischlernen brauchst</h2>
          <p>Tippe auf einen Bereich – das Video zeigt, wie es funktioniert.</p>
        </div>
        <div className="ft-tabs" role="tablist">
          {REITER.map((r) => (
            <button key={r.k} role="tab" aria-selected={r.k === akt.k} className={'ft-tab' + (r.k === akt.k ? ' an' : '')}
              onClick={() => { setAkt(r); setTon(false) }}>{r.n}</button>
          ))}
        </div>
        <div className="ft-buehne">
          <div className="ft-video">
            <video ref={v} key={akt.k + ton} src={`/funktionen/${akt.k}${ton ? '-ton' : ''}.mp4`}
              poster={`/funktionen/${akt.k}.jpg`} autoPlay muted={!ton} loop={!ton} playsInline preload="metadata" />
            <button className="ft-ton" onClick={() => setTon(!ton)}>{ton ? '🔇 Ohne Ton' : '🔊 Mit Erklärung'}</button>
          </div>
          <div className="ft-text">
            <h3>{akt.t}</h3>
            <ul>{akt.p.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        </div>
      </div>
    </section>
  )
}

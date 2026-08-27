// Das Nachschlagewerk: die Zeitformen als Tabellen.
//
// Manuels Punkt: Beim Lernen verliert man den Überblick, welche
// Zeitform wie gebildet wird – die Bausteine üben, aber zum schnellen
// NACHSCHLAGEN gab es nichts. Hier stehen die sechs wichtigsten
// Zeitformen als Tabellen, dazu die unregelmäßigen Verben, die man
// ständig braucht.
//
// Bewusst von Hand geschrieben und nicht von der KI erzeugt: Eine
// Konjugationstabelle ist entweder richtig oder wertlos. Die Formen
// hier sind Standardspanisch, wie es jedes Lehrwerk führt.
//
// Alles zugeklappt außer der ersten Karte – wer nachschlägt, sucht
// EINE Form, keine Textwand.

import { useState } from 'react'
import { IconListe } from './icons.jsx'

const PERSONEN = ['yo', 'tú', 'él/ella', 'nosotros', 'vosotros', 'ellos/ellas']

/**
 * Die Zeitformen. `endungen` ist je Verbgruppe (-ar/-er/-ir) eine
 * Liste der sechs Formen am Beispielverb; `merken` der eine Satz, den
 * man sich merken muss; `signal` die typischen Signalwörter.
 */
const ZEITFORMEN = [
  {
    id: 'presente',
    name: 'Presente',
    deutsch: 'Gegenwart',
    merken: 'Was jetzt passiert oder immer gilt: hablo – ich spreche.',
    signal: 'ahora, hoy, normalmente, siempre',
    spalten: ['hablar', 'comer', 'vivir'],
    formen: [
      ['hablo', 'como', 'vivo'],
      ['hablas', 'comes', 'vives'],
      ['habla', 'come', 'vive'],
      ['hablamos', 'comemos', 'vivimos'],
      ['habláis', 'coméis', 'vivís'],
      ['hablan', 'comen', 'viven'],
    ],
  },
  {
    id: 'perfecto',
    name: 'Pretérito perfecto',
    deutsch: 'Perfekt',
    merken: 'haber im Presente + Partizip (-ado / -ido): he hablado – ich habe gesprochen.',
    signal: 'hoy, esta semana, ya, todavía no, alguna vez',
    spalten: ['haber', '+ Partizip'],
    formen: [
      ['he', 'hablado'],
      ['has', 'comido'],
      ['ha', 'vivido'],
      ['hemos', 'hablado'],
      ['habéis', 'comido'],
      ['han', 'vivido'],
    ],
  },
  {
    id: 'indefinido',
    name: 'Pretérito indefinido',
    deutsch: 'Einfache Vergangenheit',
    merken: 'Abgeschlossen und mit klarem Zeitpunkt: ayer hablé – gestern sprach ich.',
    signal: 'ayer, anoche, el año pasado, en 2020, de repente',
    spalten: ['hablar', 'comer', 'vivir'],
    formen: [
      ['hablé', 'comí', 'viví'],
      ['hablaste', 'comiste', 'viviste'],
      ['habló', 'comió', 'vivió'],
      ['hablamos', 'comimos', 'vivimos'],
      ['hablasteis', 'comisteis', 'vivisteis'],
      ['hablaron', 'comieron', 'vivieron'],
    ],
  },
  {
    id: 'imperfecto',
    name: 'Imperfecto',
    deutsch: 'Verlaufs-Vergangenheit',
    merken: 'Gewohnheiten und Hintergrund: hablaba – ich sprach (damals immer).',
    signal: 'antes, siempre, todos los días, mientras, de niño',
    spalten: ['hablar', 'comer', 'vivir'],
    formen: [
      ['hablaba', 'comía', 'vivía'],
      ['hablabas', 'comías', 'vivías'],
      ['hablaba', 'comía', 'vivía'],
      ['hablábamos', 'comíamos', 'vivíamos'],
      ['hablabais', 'comíais', 'vivíais'],
      ['hablaban', 'comían', 'vivían'],
    ],
  },
  {
    id: 'futuro',
    name: 'Futuro simple',
    deutsch: 'Zukunft',
    merken: 'Ganzer Infinitiv + Endung: hablaré – ich werde sprechen. (Im Alltag oft: voy a hablar.)',
    signal: 'mañana, el año que viene, pronto, algún día',
    spalten: ['hablar', 'comer', 'vivir'],
    formen: [
      ['hablaré', 'comeré', 'viviré'],
      ['hablarás', 'comerás', 'vivirás'],
      ['hablará', 'comerá', 'vivirá'],
      ['hablaremos', 'comeremos', 'viviremos'],
      ['hablaréis', 'comeréis', 'viviréis'],
      ['hablarán', 'comerán', 'vivirán'],
    ],
  },
  {
    id: 'condicional',
    name: 'Condicional',
    deutsch: 'Würde-Form',
    merken: 'Ganzer Infinitiv + ía: hablaría – ich würde sprechen. Höflich: ¿Podrías…?',
    signal: 'me gustaría, en tu lugar, si pudiera',
    spalten: ['hablar', 'comer', 'vivir'],
    formen: [
      ['hablaría', 'comería', 'viviría'],
      ['hablarías', 'comerías', 'vivirías'],
      ['hablaría', 'comería', 'viviría'],
      ['hablaríamos', 'comeríamos', 'viviríamos'],
      ['hablaríais', 'comeríais', 'viviríais'],
      ['hablarían', 'comerían', 'vivirían'],
    ],
  },
]

// Die Unregelmäßigen, die man wirklich ständig braucht.
const UNREGELMAESSIG = [
  {
    id: 'unreg-presente',
    name: 'Unregelmäßige Verben',
    deutsch: 'im Presente',
    merken: 'Diese acht decken den halben Alltag ab – am besten als Ganzes merken.',
    signal: null,
    spalten: ['ser', 'estar', 'ir', 'tener'],
    formen: [
      ['soy', 'estoy', 'voy', 'tengo'],
      ['eres', 'estás', 'vas', 'tienes'],
      ['es', 'está', 'va', 'tiene'],
      ['somos', 'estamos', 'vamos', 'tenemos'],
      ['sois', 'estáis', 'vais', 'tenéis'],
      ['son', 'están', 'van', 'tienen'],
    ],
    zusatz: {
      spalten: ['hacer', 'poder', 'querer', 'haber'],
      formen: [
        ['hago', 'puedo', 'quiero', 'he'],
        ['haces', 'puedes', 'quieres', 'has'],
        ['hace', 'puede', 'quiere', 'ha'],
        ['hacemos', 'podemos', 'queremos', 'hemos'],
        ['hacéis', 'podéis', 'queréis', 'habéis'],
        ['hacen', 'pueden', 'quieren', 'han'],
      ],
    },
  },
  {
    id: 'unreg-indefinido',
    name: 'Unregelmäßige Verben',
    deutsch: 'im Indefinido',
    merken: 'ser und ir teilen sich hier dieselben Formen – fui heißt beides.',
    signal: null,
    spalten: ['ser/ir', 'tener', 'estar', 'hacer'],
    formen: [
      ['fui', 'tuve', 'estuve', 'hice'],
      ['fuiste', 'tuviste', 'estuviste', 'hiciste'],
      ['fue', 'tuvo', 'estuvo', 'hizo'],
      ['fuimos', 'tuvimos', 'estuvimos', 'hicimos'],
      ['fuisteis', 'tuvisteis', 'estuvisteis', 'hicisteis'],
      ['fueron', 'tuvieron', 'estuvieron', 'hicieron'],
    ],
  },
]

function Tabelle({ spalten, formen }) {
  return (
    <div className="ns-tabelle-rahmen">
      <table className="ns-tabelle">
        <thead>
          <tr>
            <th></th>
            {spalten.map((s) => (
              <th key={s}>{s}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {formen.map((zeile, i) => (
            <tr key={i}>
              <td className="ns-person">{PERSONEN[i]}</td>
              {zeile.map((f, j) => (
                <td key={j}>{f}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Nachschlag({ onZurueck }) {
  // Die erste Karte startet offen – man sieht sofort, wie der
  // Bereich funktioniert. Der Rest ist zugeklappt.
  const [offen, setOffen] = useState('presente')
  const alle = [...ZEITFORMEN, ...UNREGELMAESSIG]

  return (
    <div className="trainer nachschlag">
      <button className="recht-zurueck" onClick={onZurueck}>← Zurück</button>

      <div className="gespr-kopf">
        <IconListe groesse={22} />
        <div>
          <h1 className="trainer-titel">Zeitformen</h1>
          <p className="gespr-unter">
            Zum Nachschlagen, nicht zum Auswendiglernen – geübt wird in den
            Bausteinen.
          </p>
        </div>
      </div>

      {alle.map((z) => {
        const istOffen = offen === z.id
        return (
          <section key={z.id} className={'ns-karte' + (istOffen ? ' ns-offen' : '')}>
            <button
              className="ns-kopf"
              onClick={() => setOffen(istOffen ? null : z.id)}
              aria-expanded={istOffen}
            >
              <span className="ns-kopf-text">
                <b>{z.name}</b>
                <span>{z.deutsch}</span>
              </span>
              <span className={'liste-pfeil' + (istOffen ? ' liste-pfeil-auf' : '')}>▾</span>
            </button>

            {istOffen && (
              <div className="ns-inhalt">
                <p className="ns-merken">{z.merken}</p>
                <Tabelle spalten={z.spalten} formen={z.formen} />
                {z.zusatz && <Tabelle spalten={z.zusatz.spalten} formen={z.zusatz.formen} />}
                {z.signal && (
                  <p className="ns-signal">
                    <b>Signalwörter:</b> {z.signal}
                  </p>
                )}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

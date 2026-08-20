// Die Prüfstationen: der Abschluss eines Moduls.
//
// Warum keine 8. Lektion pro Modul?
//
// Erstens: Wiederholung gibt es schon. Jede Lektion zieht über
// sammleWiederholung() drei Wörter aus früheren Lektionen. Was
// fehlte, war nicht mehr Wiederholung, sondern ein Moment des
// Abschlusses.
//
// Zweitens: Eine handgeschriebene Zusammenfassung veraltet. Ändert
// jemand Lektion 31, müsste er daran denken, die Zusammenfassung von
// Modul 2 nachzuziehen. Das vergisst man. Deshalb werden die
// Aufgaben aus den Lektionen des Moduls GEZOGEN – sie können gar
// nicht auseinanderlaufen.
//
// Von Hand geschrieben ist nur das, was sich nicht ziehen lässt:
// der rote Faden. Drei Karten pro Modul, die sagen, worum es die
// ganze Zeit ging.
//
// Und: KEIN neuer Wortschatz. Ausgerechnet an der Stelle, an der
// gefestigt werden soll, wären zwölf neue Vokabeln verkehrt.

import { LEKTIONEN, MODULE, lektionenVon, mischen, baueLuecke, baueSatzbau } from './lektionen.js'

/**
 * Die sieben Stationen.
 *
 * rueckblick sind drei Karten im Format der wissen-Karten einer
 * Lektion – der Lektions-Ablauf zeigt sie mit demselben Schritt an.
 */
export const PRUEFSTATIONEN = [
  {
    id: 'station-m1',
    modul: 'm1',
    titel: 'Prüfstation: Erste Schritte',
    emoji: '🚩',
    rueckblick: [
      {
        emoji: '🗣️',
        titel: 'Du kannst dich vorstellen',
        text: 'Zweiundzwanzig Lektionen lang ging es um einen einzigen Satz: wer du bist. *Me llamo…*, *soy de…*, *tengo… años*, *vivo en…* Damit hältst du dein erstes Gespräch durch – und mehr braucht der Anfang nicht.',
      },
      {
        emoji: '⚖️',
        titel: 'ser und estar sind zwei Verben',
        text: 'Das ist der Bruch, an dem alle Deutschen hängen bleiben: „sein" heißt zweimal etwas anderes. ser für das Dauerhafte – Beruf, Herkunft, Wesen. estar für den Moment – Ort, Laune, Zustand. Diese Trennung begleitet dich bis Lektion 150.',
      },
      {
        emoji: '🔤',
        titel: 'Die Aussprache liegt hinter dir',
        text: 'Spanisch wird gelesen, wie es geschrieben steht – die eine große Erleichterung dieser Sprache. Betonung auf der vorletzten Silbe, es sei denn, ein Akzent sagt etwas anderes. Ab hier musst du nie wieder raten, wie ein Wort klingt.',
      },
    ],
  },
  {
    id: 'station-m2',
    modul: 'm2',
    titel: 'Prüfstation: Im Alltag',
    emoji: '🚩',
    rueckblick: [
      {
        emoji: '🌅',
        titel: 'Ein ganzer Tag auf Spanisch',
        text: 'Aufstehen, frühstücken, einkaufen, bestellen, verabreden, ins Bett gehen. Modul 2 hat dir für jede Stunde des Tages die Wörter gegeben – und mit den reflexiven Verben die Form, in der man über sich selbst spricht: *me levanto*, *me ducho*, *me acuesto*.',
      },
      {
        emoji: '🔄',
        titel: 'gustar dreht den Satz um',
        text: 'Nicht du magst etwas – etwas gefällt dir. *Me gusta el café*, *me gustan los libros*. Das Verb richtet sich nach der Sache, nicht nach dir. Dieselbe Bauweise steckt später in *me parece*, *me apetece* und *se me olvidó*.',
      },
      {
        emoji: '⏭️',
        titel: 'Deine erste Zukunft',
        text: '*Voy a…* – ir a plus Infinitiv. Das ist die Zukunft, die Spanier im Alltag wirklich benutzen; das Futur auf -é kommt erst in Modul 7 und klingt dort förmlicher. Mit *voy a* kannst du ab jetzt über alles reden, was noch kommt.',
      },
    ],
  },
  {
    id: 'station-m3',
    modul: 'm3',
    titel: 'Prüfstation: Unter Menschen',
    emoji: '🚩',
    rueckblick: [
      {
        emoji: '⏮️',
        titel: 'Deine erste Vergangenheit',
        text: 'Das Perfekt – *he hablado*, *has comido* – erzählt, was heute, diese Woche, in letzter Zeit passiert ist. haber steht immer direkt vor dem Partizip, ohne Zwischenwort. Acht Partizipien tanzen aus der Reihe: visto, hecho, dicho, puesto, vuelto, escrito, abierto, roto.',
      },
      {
        emoji: '👥',
        titel: 'Die Pronomen sortieren sich',
        text: 'Erst die Person (me, te, le), dann die Sache (lo, la, los, las) – und wenn beide zusammentreffen, wird le zu se: *se lo doy*. Das ist die kniffligste Stelle des Moduls und die, an der man Muttersprachler am schnellsten beeindruckt.',
      },
      {
        emoji: '💬',
        titel: 'Du kannst ein Gespräch führen',
        text: 'Vorschlagen, ablehnen, sich entschuldigen, gratulieren, streiten und sich wieder vertragen. Dazu die kleinen Wörter, die ein Gespräch am Laufen halten: *¿en serio?*, *claro*, *ya*, *o sea*. Ohne sie klingt auch korrektes Spanisch wie ein Vortrag.',
      },
    ],
  },
  {
    id: 'station-m4',
    modul: 'm4',
    titel: 'Prüfstation: Unterwegs',
    emoji: '🚩',
    rueckblick: [
      {
        emoji: '🧭',
        titel: 'Du kommst überall hin',
        text: 'Nach dem Weg fragen und die Antwort auch verstehen – *siga recto*, *gire a la derecha*, *cruce la plaza*. Dazu Fahrpläne, Tickets, Verbote und das unpersönliche *se* auf jedem Schild: *se prohíbe*, *se ruega*, *no se puede*.',
      },
      {
        emoji: '🎩',
        titel: 'Höflichkeit ist eine Verbform',
        text: 'Der usted-Imperativ nimmt den Subjuntivo – *pase*, *espere*, *dígame* – und der Konditional macht aus jeder Forderung eine Bitte: *¿podría…?*, *me gustaría…*, *sería posible…* Damit kommst du durch jede Behörde und jedes Hotel.',
      },
      {
        emoji: '🔗',
        titel: 'Deine Sätze werden länger',
        text: 'Relativsätze mit *que* und *donde*, Superlative mit *el más … de*, Vergleiche mit *tan … como*. Ab hier sagst du nicht mehr nur „Das Hotel ist gut", sondern „Das Hotel, in dem wir waren, war das beste der Stadt".',
      },
    ],
  },
  {
    id: 'station-m5',
    modul: 'm5',
    titel: 'Prüfstation: Erzählen',
    emoji: '🚩',
    rueckblick: [
      {
        emoji: '🎬',
        titel: 'Der eine Unterschied, um den alles kreist',
        text: 'Indefinido erzählt, WAS passierte – ein Punkt auf der Zeitlinie. Imperfekt beschreibt, WIE es dabei war – die Kulisse dahinter. *Llovía cuando salí*: Der Regen ist die Kulisse, das Hinausgehen der Punkt. Dieses Modul hatte im Grunde nur dieses eine Thema.',
      },
      {
        emoji: '🕰️',
        titel: 'Und die Zeit davor',
        text: 'Das Plusquamperfekt – *había llegado* – ist das, was noch vor dem Vergangenen lag. Zusammen mit der Verlaufsform *estaba comiendo* und der indirekten Rede *dijo que vendría* hast du jetzt jede Zeitstufe, die eine Geschichte braucht.',
      },
      {
        emoji: '📖',
        titel: 'Du kannst wirklich erzählen',
        text: 'Nicht mehr Sätze aneinanderreihen, sondern eine Geschichte aufbauen: *érase una vez*, *de repente*, *al final*. Wer eine Anekdote auf Spanisch erzählen kann, wird nicht mehr als Anfänger behandelt.',
      },
    ],
  },
  {
    id: 'station-m6',
    modul: 'm6',
    titel: 'Prüfstation: An der Küste',
    emoji: '🚩',
    rueckblick: [
      {
        emoji: '🌗',
        titel: 'Der Subjuntivo ist keine Zeit',
        text: 'Er ist eine Haltung. Alles Gewünschte, Bezweifelte, Bewertete steht darin: *ojalá venga*, *espero que salga bien*, *no creo que tengas razón*. *Creo que tienes razón* bleibt im Indikativ – erst der Zweifel schaltet um. Das ist die Grenze, an der Spanisch aufhört, einfach zu sein.',
      },
      {
        emoji: '🌎',
        titel: 'Spanisch ist nicht eine Sprache',
        text: 'Vierhundert Millionen Menschen, zwanzig Länder, ein seseo statt des z-Lauts, *vos* statt *tú*, *carro* statt *coche*. Nichts davon ist falsch. Wer das weiß, versteht beim Reisen mehr – und traut sich, den eigenen Akzent stehen zu lassen.',
      },
      {
        emoji: '🎭',
        titel: 'Die Sprache hinter der Sprache',
        text: 'Redewendungen, Feste, Aberglaube, Musik. Modul 6 hat weniger Grammatik gebracht als jedes andere – dafür das, was man in keinem Lehrbuch findet und ohne das man immer Ausländer bleibt.',
      },
    ],
  },
  {
    id: 'station-m7',
    modul: 'm7',
    titel: 'Prüfstation: Arbeit & Pläne',
    emoji: '🏁',
    rueckblick: [
      {
        emoji: '🏗️',
        titel: 'Das Gerüst steht komplett',
        text: 'Präsens, beide Vergangenheiten und ihr Unterschied, Plusquamperfekt, Futur, Konditional, Subjuntivo in Gegenwart und Vergangenheit, reale und irreale Bedingungen. Mehr Grammatik hat diese Sprache nicht. Was jetzt noch fehlt, ist Wortschatz – und den sammelt man beim Leben, nicht beim Lernen.',
      },
      {
        emoji: '🔀',
        titel: 'Die si-Sätze, sauber getrennt',
        text: '*Si tengo tiempo, iré* – das kann passieren. *Si tuviera tiempo, iría* – das wird es nicht. Nach *si* steht nie der Subjuntivo der Gegenwart; das ist der Fehler, den fast alle machen. Zwei Muster, und du kannst über alles reden, was möglich oder unmöglich ist.',
      },
      {
        emoji: '💼',
        titel: 'Du kannst auf Spanisch arbeiten',
        text: 'Bewerben, verhandeln, telefonieren, präsentieren, Konflikte ansprechen, Feedback geben. Das ist die Stufe, auf der die Sprache aufhört, ein Hobby zu sein, und anfängt, etwas zu verändern.',
      },
    ],
  },
]

/** Die Station eines Moduls – oder null. */
export function stationVon(modul) {
  return PRUEFSTATIONEN.find((s) => s.modul === modul.id) ?? null
}

/** Das Modul einer Station. */
export function modulVon(station) {
  return MODULE.find((m) => m.id === station.modul) ?? null
}

/**
 * Ist die Station offen?
 *
 * Erst, wenn alle Lektionen des Moduls abgeschlossen sind. Eine
 * Prüfstation vor der Prüfung wäre keine.
 */
export function stationOffen(station, lessonProgress = {}) {
  const modul = modulVon(station)
  if (!modul) return false
  const lektionen = lektionenVon(modul)
  return lektionen.length > 0 && lektionen.every((l) => lessonProgress?.[l.id]?.fertig)
}

/** Wie viele Lektionen des Moduls fehlen noch bis zur Station? */
export function nochOffen(station, lessonProgress = {}) {
  const modul = modulVon(station)
  if (!modul) return 0
  return lektionenVon(modul).filter((l) => !lessonProgress?.[l.id]?.fertig).length
}

/**
 * Alle Wörter eines Moduls – doppelte entfernt.
 *
 * Das Entfernen ist keine Kosmetik, sondern nötig: baueOptionen()
 * zieht die falschen Antworten aus items. Käme "der Freund" in zwei
 * Lektionen des Moduls vor, stünde dieselbe Übersetzung zweimal
 * unter den vier Antworten – und die Aufgabe wäre nicht mehr
 * eindeutig lösbar.
 */
export function woerterVon(station) {
  const modul = modulVon(station)
  if (!modul) return []
  const gesehenDe = new Set()
  const gesehenEs = new Set()
  const raus = []
  for (const lektion of lektionenVon(modul)) {
    for (const item of lektion.items) {
      const de = item.de.toLowerCase()
      const es = item.es.toLowerCase()
      if (gesehenDe.has(de) || gesehenEs.has(es)) continue
      gesehenDe.add(de)
      gesehenEs.add(es)
      raus.push(item)
    }
  }
  return raus
}

/**
 * Die Station als Lektions-Objekt.
 *
 * Damit läuft sie durch denselben Ablauf wie jede Lektion: dieselben
 * Quiz-Knöpfe, derselbe Satzbau, derselbe Abschlussbildschirm mit der
 * 80-Prozent-Marke. Eine zweite Oberfläche wäre eine zweite Stelle
 * zum Kaputtgehen.
 */
export function stationAlsLektion(station) {
  return {
    id: station.id,
    titel: station.titel,
    emoji: station.emoji,
    // Module tragen kein Niveau – das der letzten Lektion passt:
    // Die Station prüft alles bis dorthin.
    niveau: lektionenVon(modulVon(station) ?? {}).slice(-1)[0]?.niveau ?? '',
    beschreibung: 'Alles aus dem Modul – ohne neue Wörter',
    items: woerterVon(station),
    wissen: station.rueckblick,
    dialog: null,
    // Der Intro-Schritt zeigt diese Liste unter "Das lernst du …".
    // Ohne sie stuende dort eine leere Aufzaehlung – und eine
    // Station "lernt" ja auch nichts Neues, sie prueft.
    ziele: [
      'Zeigen, was aus dem Modul wirklich sitzt',
      'Rund 25 Aufgaben – keine neuen Wörter',
      'Ab 80 % gilt das Modul als bestanden',
    ],
    istStation: true,
  }
}

/** Wie viele Aufgaben eine Station hat. Ungefähr eine Doppellektion. */
export const STATION_AUFGABEN = 25

/**
 * Die Schritte einer Station.
 *
 * Bewusst OHNE die Schritte "lernen" und "dialog": Hier wird nichts
 * mehr vorgestellt, hier wird nur noch abgefragt. Der einzige
 * Lesetext ist der Rückblick am Anfang.
 */
export function baueSchritteStation(station) {
  const lektion = stationAlsLektion(station)
  const modul = modulVon(station)
  const schritte = [{ typ: 'intro' }, { typ: 'info' }]

  const woerter = mischen(lektion.items)

  // Die Hälfte der Aufgaben sind Vokabelfragen, abwechselnd in
  // beide Richtungen – Erkennen und Abrufen sind zwei Fähigkeiten.
  const quizAnzahl = Math.min(14, woerter.length)
  woerter.slice(0, quizAnzahl).forEach((item, i) => {
    schritte.push({ typ: 'quiz', item, richtung: i % 2 === 0 ? 'es-de' : 'de-es' })
  })

  // Lücken: das Wort im eigenen Beispielsatz wiederfinden
  let luecken = 0
  for (const item of woerter.slice(quizAnzahl)) {
    if (luecken >= 5) break
    const luecke = baueLuecke(item)
    if (luecke) {
      schritte.push({ typ: 'luecke', item, luecke })
      luecken++
    }
  }

  // Satzbau: zwei Sätze aus Bausteinen zusammensetzen
  let saetze = 0
  for (const item of mischen(lektion.items)) {
    if (saetze >= 2) break
    const satzbau = baueSatzbau(item)
    if (satzbau) {
      schritte.push({ typ: 'satzbau', item, satzbau })
      saetze++
    }
  }

  // Ein Paare-Spiel als Verschnaufpause in der Mitte
  if (lektion.items.length >= 5) {
    schritte.push({
      typ: 'paare',
      paare: mischen(lektion.items).slice(0, 5).map((i) => ({ es: i.es, de: i.de })),
    })
  }

  // Und zum Schluss ganze Sätze: Dialogzeilen aus verschiedenen
  // Lektionen des Moduls. Das ist der eigentliche Test – einzelne
  // Wörter kann man raten, einen Satz nicht.
  const dialoge = lektionenVon(modul)
    .filter((l) => l.dialog?.length >= 4)
    .map((l) => l.dialog)
  for (const dialog of mischen(dialoge).slice(0, 4)) {
    const kandidaten = dialog.filter((z) => z.es.length > 12)
    if (kandidaten.length >= 4) {
      schritte.push({ typ: 'dialogquiz', zeile: mischen(kandidaten)[0], dialog })
    }
  }

  return schritte
}

/** Wurde die Station schon geschafft? */
export function stationGeschafft(station, lessonProgress = {}) {
  return Boolean(lessonProgress?.[station.id]?.fertig)
}

/** Für die Anzeige: gehört diese id zu einer Station? */
export function istStationsId(id) {
  return PRUEFSTATIONEN.some((s) => s.id === id)
}

/** Alle Lektions-Ids, damit der Prüfer Kollisionen erkennt. */
export const LEKTIONS_IDS = new Set(LEKTIONEN.map((l) => l.id))

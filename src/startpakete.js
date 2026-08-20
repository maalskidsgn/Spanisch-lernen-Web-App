// Die sechs Startpakete.
//
// Sie liegen fertig hier und werden NICHT beim Besuch erzeugt. Drei
// Gründe, alle handfest:
//
//   Kosten – der Trichter läuft VOR der Anmeldung. Jeder anonyme
//   Besuch löste sonst eine OpenAI-Anfrage aus, und wer das Formular
//   in Ruhe hundertmal abschickt, bezahlt es nicht selbst.
//
//   Verlässlichkeit – das Startpaket ist das Erste, was jemand von
//   Habloo sieht. Ein leerer Kasten, weil das Kontingent erschöpft
//   ist, wäre der schlechteste erste Eindruck von allen.
//
//   Tempo – ohne Netz-Anfrage ist es sofort da.
//
// Es sind trotzdem echte KI-Inhalte: Die Wortlisten stammen aus genau
// dem Endpunkt, den die App auch sonst benutzt (/api/vokabelliste,
// gpt-4o-mini) – nur einmal im Voraus statt bei jedem Besuch. Der
// Ladebildschirm behauptet also nichts, was nicht stimmt.
//
// Video und Song sind von Hand gewählt. Die automatische Suche
// lieferte für "Spanisch lernen für Anfänger" unter anderem einen
// Algebra-Kurs und einen Gebärdensprach-Kurs – als erster Eindruck
// unbrauchbar.
//
// NICHT von Hand bearbeiten, sondern neu erzeugen:
//   node scripts/baue-startpakete.mjs

export const STARTPAKETE = {
  reisen: {
    label: 'Reisen',
    thema: 'Reisen und unterwegs sein in Spanien',
    begruendung:
      'Ich habe diese Vokabeln ausgewählt, weil sie in vielen Alltagssituationen beim Reisen in Spanien sehr nützlich sind. Als angehender Reisender wirst du diese Wörter oft benötigen, um dich zurechtzufinden und mit Einheimischen zu kommunizieren.',
    video: { videoId: 'xyMglrghklc', title: 'Aprender español para principiantes: Lección 1 – Los saludos', thumbnail: 'https://i.ytimg.com/vi/xyMglrghklc/hqdefault.jpg' },
    song: { videoId: 'qExd-3oCTl4', title: 'Carlos Baute – Colgando en tus manos (con Marta Sánchez)', thumbnail: 'https://i.ytimg.com/vi/qExd-3oCTl4/hqdefault.jpg' },
    vokabeln: [
      { wort: 'el autobús', uebersetzung: 'der Bus', beispiel: 'Tomamos el autobús a la ciudad.' },
      { wort: 'la carretera', uebersetzung: 'die Straße', beispiel: 'Conducimos por la carretera hacia la playa.' },
      { wort: 'el tren', uebersetzung: 'der Zug', beispiel: 'El tren llega a las diez.' },
      { wort: 'el mapa', uebersetzung: 'die Karte', beispiel: 'Mira el mapa para encontrar el hotel.' },
      { wort: 'el aeropuerto', uebersetzung: 'der Flughafen', beispiel: 'Llegamos al aeropuerto a tiempo.' },
      { wort: 'la maleta', uebersetzung: 'der Koffer', beispiel: 'Olvidé mi maleta en el hotel.' },
      { wort: 'el billete', uebersetzung: 'die Fahrkarte', beispiel: 'Compré un billete para el tren.' },
      { wort: 'la estación', uebersetzung: 'der (Zug-)Bahnhof', beispiel: 'La estación está cerca de aquí.' },
      { wort: 'el coche', uebersetzung: 'das Auto', beispiel: 'Alquilamos un coche para el fin de semana.' },
      { wort: 'la guía', uebersetzung: 'der Reiseführer', beispiel: 'Compré una guía para conocer la ciudad.' },
      { wort: 'el destino', uebersetzung: 'das Ziel', beispiel: 'Nuestro destino es Barcelona.' },
    ],
  },
  familie: {
    label: 'Familie',
    thema: 'Familie und nahestehende Menschen',
    begruendung:
      'Ich habe diese Vokabeln ausgewählt, weil Familie und Freunde zentrale Bestandteile unseres Lebens sind. Ein fundierter Wortschatz in diesem Bereich hilft dir, Beziehungen im Spanischen auszudrücken und zu vertiefen.',
    video: { videoId: 'xyMglrghklc', title: 'Aprender español para principiantes: Lección 1 – Los saludos', thumbnail: 'https://i.ytimg.com/vi/xyMglrghklc/hqdefault.jpg' },
    song: { videoId: 'uN6hzjkrZ4w', title: 'Pablo Alborán feat. Jesse & Joy – Dónde está el amor', thumbnail: 'https://i.ytimg.com/vi/uN6hzjkrZ4w/hqdefault.jpg' },
    vokabeln: [
      { wort: 'el padre', uebersetzung: 'der Vater', beispiel: 'Mi padre es muy amable.' },
      { wort: 'la madre', uebersetzung: 'die Mutter', beispiel: 'La madre de Juan cocina bien.' },
      { wort: 'el hermano', uebersetzung: 'der Bruder', beispiel: 'Tengo un hermano mayor.' },
      { wort: 'la hermana', uebersetzung: 'die Schwester', beispiel: 'Mi hermana estudia en la universidad.' },
      { wort: 'el abuelo', uebersetzung: 'der Großvater', beispiel: 'El abuelo cuenta historias interesantes.' },
      { wort: 'la abuela', uebersetzung: 'die Großmutter', beispiel: 'La abuela me hace galletas.' },
      { wort: 'el tío', uebersetzung: 'der Onkel', beispiel: 'Mi tío vive en Madrid.' },
      { wort: 'la tía', uebersetzung: 'die Tante', beispiel: 'La tía de Sofía es muy divertida.' },
      { wort: 'el primo', uebersetzung: 'der Vetter', beispiel: 'Mi primo juega al fútbol.' },
      { wort: 'la prima', uebersetzung: 'die Kusine', beispiel: 'La prima de Carla es muy simpática.' },
      { wort: 'el amigo', uebersetzung: 'der Freund', beispiel: 'Mi amigo y yo vamos al cine.' },
      { wort: 'la amiga', uebersetzung: 'die Freundin', beispiel: 'Tengo una amiga que habla español.' },
    ],
  },
  kultur: {
    label: 'Musik & Kultur',
    thema: 'Musik, Ausgehen und Kultur',
    begruendung:
      'Ich habe diese Vokabeln ausgewählt, weil Musik, Ausgehen und Kultur zentrale Aspekte des Lebens sind, die oft im Alltag diskutiert werden. Diese Wörter helfen dir, dich in sozialen Situationen besser auszudrücken und neue Freundschaften zu schließen.',
    video: { videoId: 'Ek3g10qXPZc', title: 'Talk About Your Daily Routine in a Small Town – A1 Spanish', thumbnail: 'https://i.ytimg.com/vi/Ek3g10qXPZc/hqdefault.jpg' },
    song: { videoId: 'AnioNDuHu6M', title: 'J. Balvin, Bad Bunny – LA CANCIÓN (Letra)', thumbnail: 'https://i.ytimg.com/vi/AnioNDuHu6M/hqdefault.jpg' },
    vokabeln: [
      { wort: 'la música', uebersetzung: 'die Musik', beispiel: 'Me gusta la música española.' },
      { wort: 'el concierto', uebersetzung: 'das Konzert', beispiel: 'Voy a un concierto este sábado.' },
      { wort: 'el baile', uebersetzung: 'der Tanz', beispiel: 'El baile es muy divertido.' },
      { wort: 'la fiesta', uebersetzung: 'die Party', beispiel: 'La fiesta empieza a las ocho.' },
      { wort: 'el arte', uebersetzung: 'die Kunst', beispiel: 'Me interesa el arte moderno.' },
      { wort: 'el teatro', uebersetzung: 'das Theater', beispiel: 'Vamos al teatro mañana.' },
      { wort: 'el cine', uebersetzung: 'das Kino', beispiel: 'Me encanta ir al cine los fines de semana.' },
      { wort: 'la cultura', uebersetzung: 'die Kultur', beispiel: 'Quiero aprender más sobre la cultura española.' },
      { wort: 'el músico', uebersetzung: 'der Musiker', beispiel: 'Ella es una gran músico.' },
      { wort: 'la canción', uebersetzung: 'das Lied', beispiel: 'Escuché una canción nueva hoy.' },
      { wort: 'el festival', uebersetzung: 'das Festival', beispiel: 'El festival de música es en junio.' },
      { wort: 'el grupo', uebersetzung: 'die Gruppe', beispiel: 'Mi grupo favorito es muy famoso.' },
    ],
  },
  beruf: {
    label: 'Beruf',
    thema: 'Arbeit und Beruf',
    begruendung:
      'Ich habe diese Vokabeln ausgewählt, weil sie dir helfen werden, dich in deinem zukünftigen Berufsleben in spanischsprachigen Ländern zurechtzufinden. Diese Wörter decken die wichtigsten Aspekte der Arbeit und des Berufs ab und sind oft in Alltagssituationen zu hören.',
    video: { videoId: 'oKwtZoa803I', title: 'How to Find a Job: Spanish Tips & Vocabulary', thumbnail: 'https://i.ytimg.com/vi/oKwtZoa803I/hqdefault.jpg' },
    song: { videoId: 'qExd-3oCTl4', title: 'Carlos Baute – Colgando en tus manos (con Marta Sánchez)', thumbnail: 'https://i.ytimg.com/vi/qExd-3oCTl4/hqdefault.jpg' },
    vokabeln: [
      { wort: 'el trabajo', uebersetzung: 'die Arbeit', beispiel: 'Me gusta mi trabajo.' },
      { wort: 'el jefe', uebersetzung: 'der Chef', beispiel: 'El jefe es muy amable.' },
      { wort: 'la oficina', uebersetzung: 'das Büro', beispiel: 'Trabajo en una oficina grande.' },
      { wort: 'el empleado', uebersetzung: 'der Angestellte', beispiel: 'El empleado ayuda a los clientes.' },
      { wort: 'la reunión', uebersetzung: 'das Meeting', beispiel: 'Tenemos una reunión mañana.' },
      { wort: 'el horario', uebersetzung: 'der Zeitplan', beispiel: 'Mi horario es muy flexible.' },
      { wort: 'el sueldo', uebersetzung: 'das Gehalt', beispiel: 'El sueldo es suficiente para vivir.' },
      { wort: 'la tarea', uebersetzung: 'die Aufgabe', beispiel: 'Tengo que terminar una tarea importante.' },
      { wort: 'la experiencia', uebersetzung: 'die Erfahrung', beispiel: 'Tengo mucha experiencia en este campo.' },
      { wort: 'el contrato', uebersetzung: 'der Vertrag', beispiel: 'Firmamos el contrato hoy.' },
      { wort: 'el compañero', uebersetzung: 'der Kollege', beispiel: 'Mi compañero de trabajo es muy divertido.' },
      { wort: 'la industria', uebersetzung: 'die Branche', beispiel: 'Trabajo en la industria de la tecnología.' },
    ],
  },
  auswandern: {
    label: 'Alltag in Spanien',
    thema: 'Wohnen, Behörden und Alltag in Spanien',
    begruendung:
      'Ich habe Wörter ausgewählt, die dir helfen werden, im Alltag in Spanien zu navigieren, besonders wenn es um das Wohnen und den Kontakt mit Behörden geht. Diese Begriffe sind grundlegend und werden dir oft begegnen.',
    video: { videoId: 'fYxvYjK-crs', title: 'Aprende Español Podcast: Ahorrando Pequeñas Cantidades', thumbnail: 'https://i.ytimg.com/vi/fYxvYjK-crs/hqdefault.jpg' },
    song: { videoId: 'KiZfl9IByx4', title: 'Sergio Dalma – Bailar Pegados (Letra)', thumbnail: 'https://i.ytimg.com/vi/KiZfl9IByx4/hqdefault.jpg' },
    vokabeln: [
      { wort: 'el apartamento', uebersetzung: 'die Wohnung', beispiel: 'Vivo en un apartamento pequeño en el centro.' },
      { wort: 'la casa', uebersetzung: 'das Haus', beispiel: 'Quiero comprar una casa con jardín.' },
      { wort: 'el contrato', uebersetzung: 'der Vertrag', beispiel: 'Firmamos el contrato de alquiler la semana pasada.' },
      { wort: 'la factura', uebersetzung: 'die Rechnung', beispiel: 'Recibí la factura de la electricidad hoy.' },
      { wort: 'la oficina', uebersetzung: 'das Büro', beispiel: 'Trabajo en una oficina en el centro de la ciudad.' },
      { wort: 'el vecino', uebersetzung: 'der Nachbar', beispiel: 'Mi vecino es muy amable.' },
      { wort: 'la cita', uebersetzung: 'der Termin', beispiel: 'Tengo una cita en el ayuntamiento.' },
      { wort: 'la regla', uebersetzung: 'die Regel', beispiel: 'Es importante seguir la regla de la comunidad.' },
      { wort: 'el documento', uebersetzung: 'das Dokument', beispiel: 'Necesito presentar todos los documentos antes del lunes.' },
      { wort: 'el alquiler', uebersetzung: 'die Miete', beispiel: 'El alquiler de este piso es muy alto.' },
      { wort: 'la solicitud', uebersetzung: 'der Antrag', beispiel: 'Envios la solicitud para mi residencia.' },
      { wort: 'la comunidad', uebersetzung: 'die Gemeinschaft', beispiel: 'Vivo en una comunidad muy tranquila.' },
    ],
  },
  lust: {
    label: 'deine ersten Wörter',
    thema: 'Die allerersten Wörter für den Einstieg',
    begruendung:
      'Es ist wichtig, sofort mit den grundlegenden Wörtern zu beginnen, die man im Alltag häufig benötigt. Diese Auswahl hilft dir, dich in einfachen Situationen auf Spanisch zurechtzufinden und dich schnell verständigen zu können.',
    video: { videoId: 'xyMglrghklc', title: 'Aprender español para principiantes: Lección 1 – Los saludos', thumbnail: 'https://i.ytimg.com/vi/xyMglrghklc/hqdefault.jpg' },
    song: { videoId: 'SJSML8LguBk', title: 'Quevedo, Nueva Línea – AL GOLPITO (Letra)', thumbnail: 'https://i.ytimg.com/vi/SJSML8LguBk/hqdefault.jpg' },
    vokabeln: [
      { wort: 'el libro', uebersetzung: 'das Buch', beispiel: 'Este es mi libro.' },
      { wort: 'la casa', uebersetzung: 'das Haus', beispiel: 'Vivo en una casa grande.' },
      { wort: 'el agua', uebersetzung: 'das Wasser', beispiel: 'Quiero un poco de agua.' },
      { wort: 'la comida', uebersetzung: 'das Essen', beispiel: 'Me gusta la comida española.' },
      { wort: 'el amigo', uebersetzung: 'der Freund', beispiel: 'Mi amigo es muy divertido.' },
      { wort: 'la familia', uebersetzung: 'die Familie', beispiel: 'Mi familia es muy importante para mí.' },
      { wort: 'el gato', uebersetzung: 'die Katze', beispiel: 'Tengo un gato negro.' },
      { wort: 'la perra', uebersetzung: 'die Hündin', beispiel: 'La perra juega en el jardín.' },
      { wort: 'el coche', uebersetzung: 'das Auto', beispiel: 'Mi coche es rojo.' },
      { wort: 'la ciudad', uebersetzung: 'die Stadt', beispiel: 'La ciudad es muy bonita.' },
      { wort: 'el trabajo', uebersetzung: 'die Arbeit', beispiel: 'Tengo que ir al trabajo.' },
      { wort: 'la escuela', uebersetzung: 'die Schule', beispiel: 'Los niños van a la escuela.' },
    ],
  },
}

/** Das Paket zu einem Grund – mit Rückfall, falls die Kennung nicht passt. */
export function paketFuer(grund) {
  return STARTPAKETE[grund] ?? STARTPAKETE.lust
}

/** Alle Kennungen – der Prüfer vergleicht sie mit den Antwortmöglichkeiten. */
export const PAKET_IDS = Object.keys(STARTPAKETE)

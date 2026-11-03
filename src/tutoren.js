// Tutorinnen und Tutoren fuer den Unterrichtsbereich.
//
// Felder, die (noch) null sind, blendet die Profilkarte einfach aus –
// so steht nie eine erfundene Bewertung oder Stundenzahl in der App.
// Quelle fuer Yulibeth: ihr Preply-Profil (preply.com/en/tutor/2553093),
// die Werte dort von Hand uebertragen.

export const TUTOREN = [
  {
    id: 'yulibeth',
    name: 'Yulibeth M.',
    foto: '/tutoren/yulibeth.jpg',
    herkunft: { flagge: '🇪🇸', land: null }, // TODO Land aus Preply
    verifiziert: true,
    ueberschrift: 'tu9.yulibethUeberschrift',
    sprachen: [
      { name: 'tu9.spanisch', stufe: 'tu9.muttersprache' },
      { name: 'tu9.englisch', stufe: null }, // TODO Niveau aus Preply
    ],
    schwerpunkte: ['tu9.konversation', 'tu9.anfaenger', 'tu9.alltagsspanisch'],
    bewertung: null, // z. B. 4.9
    bewertungen: null, // Anzahl
    lektionen: null, // Unterrichtsstunden gesamt
    preis: null, // € pro 50 Min.
    ueber: null, // Text "Über mich" aus Preply
  },
]

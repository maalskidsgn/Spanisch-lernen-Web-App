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
    ueberschrift: 'Spanisch mit einer Muttersprachlerin – locker sprechen, sicher werden',
    sprachen: [
      { name: 'Spanisch', stufe: 'Muttersprache' },
      { name: 'Englisch', stufe: null }, // TODO Niveau aus Preply
    ],
    schwerpunkte: ['Konversation', 'Anfänger', 'Alltagsspanisch'],
    bewertung: null, // z. B. 4.9
    bewertungen: null, // Anzahl
    lektionen: null, // Unterrichtsstunden gesamt
    preis: null, // € pro 50 Min.
    ueber: null, // Text "Über mich" aus Preply
  },
]

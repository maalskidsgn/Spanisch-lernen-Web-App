// Die Icon-Sprache der App: schlanke Linien-Zeichnungen statt Emojis.
//
// Emojis sehen auf jedem Gerät anders aus (Apple, Samsung, Google
// zeichnen sie jeweils selbst) und wirken schnell nach Chat statt
// nach Produkt. Diese Icons sind ein einziger Strich-Stil, erben
// ihre Farbe vom Text (currentColor) und skalieren scharf.

const grund = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

function Icon({ kinder, groesse = 20, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={groesse}
      height={groesse}
      aria-hidden="true"
      {...grund}
      {...rest}
    >
      {kinder}
    </svg>
  )
}

/* Lernen / Lektionen */
export const IconLektion = (p) => (
  <Icon {...p} kinder={<>
    <path d="M22 9 12 5 2 9l10 4 10-4z" />
    <path d="M6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5" />
  </>} />
)

/* Karteikarten / Trainer */
export const IconKarten = (p) => (
  <Icon {...p} kinder={<>
    <rect x="3" y="7" width="13" height="14" rx="2.5" />
    <path d="M8 4.5 18.5 3a2 2 0 0 1 2.2 1.7L21.9 15" />
  </>} />
)

/* Mediathek / Abspielen */
export const IconMediathek = (p) => (
  <Icon {...p} kinder={<>
    <rect x="2.5" y="5" width="19" height="14" rx="3" />
    <path d="M10 9.6a.6.6 0 0 1 .92-.5l4 2.4a.6.6 0 0 1 0 1l-4 2.4a.6.6 0 0 1-.92-.5z" />
  </>} />
)

/* Einstellungen */
export const IconMehr = (p) => (
  <Icon {...p} kinder={<>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5" />
  </>} />
)

/* Tagesserie (Flamme) */
export const IconSerie = (p) => (
  <Icon {...p} kinder={
    <path d="M12 21c3.9 0 6.5-2.4 6.5-6 0-3.9-3.2-6-4.4-9.5-.2-.5-.9-.6-1.1 0-.6 1.6-1.6 2.8-2.6 4.2C9 11.6 7.5 13 7.5 15c0 3.6 2.6 6 4.5 6z" />
  } />
)

/* Level (Stern) */
export const IconLevel = (p) => (
  <Icon {...p} kinder={
    <path d="m12 3.5 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.6-5 2.6.9-5.6-4-4 5.6-.8z" />
  } />
)

/* Suche */
export const IconSuche = (p) => (
  <Icon {...p} kinder={<>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.4-4.4" />
  </>} />
)

/* Musik */
export const IconMusik = (p) => (
  <Icon {...p} kinder={<>
    <path d="M9 18V6.4a.8.8 0 0 1 .66-.79l8-1.6A.8.8 0 0 1 19 4.8V16" />
    <circle cx="6.5" cy="18" r="2.5" />
    <circle cx="16.5" cy="16" r="2.5" />
  </>} />
)

/* Buch / E-Books */
export const IconBuch = (p) => (
  <Icon {...p} kinder={<>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5H6.5A2.5 2.5 0 0 0 4 21z" />
    <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" />
  </>} />
)

/* Multiple Choice (Liste mit Haken) */
export const IconAuswahl = (p) => (
  <Icon {...p} kinder={<>
    <path d="m3.5 6.5 1.5 1.5L8 5M3.5 12.5 5 14l3-3M3.5 18.5 5 20l3-3" />
    <path d="M12 6h8.5M12 12h8.5M12 18h8.5" />
  </>} />
)

/* Schreiben (Stift) */
export const IconSchreiben = (p) => (
  <Icon {...p} kinder={<>
    <path d="M4 20h4.5L20 8.5a2.1 2.1 0 0 0-3-3L5.5 17z" />
    <path d="m14.5 8 3 3" />
  </>} />
)

/* Gemischt (Würfel-Pfeile) */
export const IconGemischt = (p) => (
  <Icon {...p} kinder={<>
    <path d="M2.5 7h3.2c5.8 0 6.8 10 12.6 10h3.2" />
    <path d="M2.5 17h3.2c2 0 3.4-1.2 4.6-2.7M21.5 7h-3.2c-2 0-3.4 1.2-4.6 2.7" />
    <path d="m18.5 4 3 3-3 3M18.5 14l3 3-3 3" />
  </>} />
)

/* Lesezeichen – markiert Gemerktes */
export const IconLesezeichen = (p) => (
  <Icon {...p} kinder={<path d="M6.5 3.5h11a1 1 0 0 1 1 1V21l-6.5-4.2L5.5 21V4.5a1 1 0 0 1 1-1z" />} />
)

/* Stern mit Strahlen – für Ausgewähltes */
export const IconStern = (p) => (
  <Icon {...p} kinder={<>
    <path d="m12 3.2 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z" />
  </>} />
)

/* Pfeil rechts */
export const IconPfeil = (p) => (
  <Icon {...p} kinder={<path d="M5 12h14m-6-6 6 6-6 6" />} />
)

/* Themen der Mediathek */
export const IconSprache = (p) => (
  <Icon {...p} kinder={<>
    <path d="M4 5h9M8.5 3v2M11.8 5c-.8 4-3.6 7.3-7.3 9.3" />
    <path d="M6 9.5c1.4 2.4 3.6 4.3 6.2 5.3M13 21l4.5-10L22 21M14.6 17.5h5.8" />
  </>} />
)
export const IconGesundheit = (p) => (
  <Icon {...p} kinder={
    <path d="M12 20.5c-4.5-3-8-6.1-8-10A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 3.5c0 3.9-3.5 7-8 10z" />
  } />
)
export const IconSport = (p) => (
  <Icon {...p} kinder={<>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 3.5c2.5 2.2 4 5.2 4 8.5s-1.5 6.3-4 8.5c-2.5-2.2-4-5.2-4-8.5s1.5-6.3 4-8.5zM3.8 9.5h16.4M3.8 14.5h16.4" />
  </>} />
)
export const IconErnaehrung = (p) => (
  <Icon {...p} kinder={<>
    <path d="M12 8c-4 0-6.5 2.6-6.5 6a6.5 6.5 0 0 0 13 0c0-3.4-2.5-6-6.5-6z" />
    <path d="M12 8V5.5M12 5.5C12 4 13.5 3 15 3c0 1.8-1.3 2.5-3 2.5z" />
  </>} />
)
export const IconProduktiv = (p) => (
  <Icon {...p} kinder={
    <path d="M13 2.5 4.5 13.5H11L10 21.5l8.5-11H12z" />
  } />
)
export const IconStoa = (p) => (
  <Icon {...p} kinder={<>
    <path d="M3 21h18M4.5 18h15M6 18V9.5M10 18V9.5M14 18V9.5M18 18V9.5" />
    <path d="m3.5 9.5 8.5-5 8.5 5z" />
  </>} />
)
export const IconPsyche = (p) => (
  <Icon {...p} kinder={<>
    <path d="M15.5 21v-2.6c2.4-1.3 4-3.8 4-6.9A7.7 7.7 0 0 0 4 11.8c0 2 .8 3.4 2 4.7V21" />
    <path d="M9.5 10a2.5 2.5 0 1 1 3 2.4V14" />
    <circle cx="12" cy="16.4" r=".2" />
  </>} />
)
export const IconGefunden = IconSuche
export const IconAlle = (p) => (
  <Icon {...p} kinder={<>
    <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
  </>} />
)

/* Landkarte – fuer den Umschalter der Reiseroute */
export const IconLandkarte = (p) => (
  <Icon {...p} kinder={<>
    <path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4z" />
    <path d="M9 4v13" />
    <path d="M15 6.5v13" />
  </>} />
)

/* Liste – fuer den Umschalter der Reiseroute */
export const IconListe = (p) => (
  <Icon {...p} kinder={<>
    <path d="M8 6.5h12M8 12h12M8 17.5h12" />
    <path d="M4 6.5h.01M4 12h.01M4 17.5h.01" />
  </>} />
)

/* Uhr – die geschaetzte Dauer einer Lektion */
export const IconUhr = (p) => (
  <Icon {...p} kinder={<>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </>} />
)

/* Schloss – eine noch gesperrte Etappe */
export const IconSchloss = (p) => (
  <Icon {...p} kinder={<>
    <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </>} />
)

/* Funken – die KI-gestuetzte Erzeugung */
export const IconFunken = (p) => (
  <Icon {...p} kinder={<>
    <path d="M13 3 15 8.5 20.5 10.5 15 12.5 13 18 11 12.5 5.5 10.5 11 8.5 13 3z" />
    <path d="M6 15.5 6.9 17.6 9 18.5 6.9 19.4 6 21.5 5.1 19.4 3 18.5 5.1 17.6 6 15.5z" />
  </>} />
)

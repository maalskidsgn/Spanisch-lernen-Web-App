// Das Grundpaket: Jedes Konto (und jeder Gast) bekommt es einmal,
// damit der Trainer am ersten Tag nicht leer ist. 100 wichtige Wörter,
// 5 Sätze und ein Text auf Spanisch mit Übersetzung, der erklärt, wie
// man Habloo benutzt. Von Hand geschrieben, nicht von der KI erzeugt.
// Eingeräumt in App.jsx (Suche nach "Grundpaket").
//
// Jede Übersetzung gibt es zweimal: deutsch ("uebersetzung", "de",
// "titel_de") und englisch ("en", "titel_en"). Welche in den Trainer
// kommt, entscheidet die App-Sprache – siehe geschenkSprache.js.

export const GRUNDPAKET_VERSION = 1

export const GRUNDPAKET_WOERTER = [
  {
    "wort": "yo",
    "uebersetzung": "ich",
    "en": "I"
  },
  {
    "wort": "tú",
    "uebersetzung": "du",
    "en": "you (informal)"
  },
  {
    "wort": "él",
    "uebersetzung": "er",
    "en": "he"
  },
  {
    "wort": "ella",
    "uebersetzung": "sie",
    "en": "she"
  },
  {
    "wort": "usted",
    "uebersetzung": "Sie (höflich)",
    "en": "you (formal)"
  },
  {
    "wort": "nosotros",
    "uebersetzung": "wir",
    "en": "we"
  },
  {
    "wort": "ellos",
    "uebersetzung": "sie (Mehrzahl)",
    "en": "they"
  },
  {
    "wort": "ser",
    "uebersetzung": "sein (dauerhaft)",
    "en": "to be (lasting)"
  },
  {
    "wort": "estar",
    "uebersetzung": "sein (Zustand, Ort)",
    "en": "to be (state, place)"
  },
  {
    "wort": "tener",
    "uebersetzung": "haben",
    "en": "to have"
  },
  {
    "wort": "hacer",
    "uebersetzung": "machen",
    "en": "to do, to make"
  },
  {
    "wort": "ir",
    "uebersetzung": "gehen, fahren",
    "en": "to go"
  },
  {
    "wort": "poder",
    "uebersetzung": "können",
    "en": "can, to be able to"
  },
  {
    "wort": "querer",
    "uebersetzung": "wollen, mögen",
    "en": "to want, to love"
  },
  {
    "wort": "decir",
    "uebersetzung": "sagen",
    "en": "to say"
  },
  {
    "wort": "saber",
    "uebersetzung": "wissen",
    "en": "to know"
  },
  {
    "wort": "ver",
    "uebersetzung": "sehen",
    "en": "to see"
  },
  {
    "wort": "venir",
    "uebersetzung": "kommen",
    "en": "to come"
  },
  {
    "wort": "hablar",
    "uebersetzung": "sprechen",
    "en": "to speak"
  },
  {
    "wort": "comer",
    "uebersetzung": "essen",
    "en": "to eat"
  },
  {
    "wort": "beber",
    "uebersetzung": "trinken",
    "en": "to drink"
  },
  {
    "wort": "vivir",
    "uebersetzung": "wohnen, leben",
    "en": "to live"
  },
  {
    "wort": "gustar",
    "uebersetzung": "gefallen",
    "en": "to like"
  },
  {
    "wort": "necesitar",
    "uebersetzung": "brauchen",
    "en": "to need"
  },
  {
    "wort": "trabajar",
    "uebersetzung": "arbeiten",
    "en": "to work"
  },
  {
    "wort": "aprender",
    "uebersetzung": "lernen",
    "en": "to learn"
  },
  {
    "wort": "entender",
    "uebersetzung": "verstehen",
    "en": "to understand"
  },
  {
    "wort": "qué",
    "uebersetzung": "was",
    "en": "what"
  },
  {
    "wort": "quién",
    "uebersetzung": "wer",
    "en": "who"
  },
  {
    "wort": "dónde",
    "uebersetzung": "wo",
    "en": "where"
  },
  {
    "wort": "cuándo",
    "uebersetzung": "wann",
    "en": "when"
  },
  {
    "wort": "cómo",
    "uebersetzung": "wie",
    "en": "how"
  },
  {
    "wort": "por qué",
    "uebersetzung": "warum",
    "en": "why"
  },
  {
    "wort": "cuánto",
    "uebersetzung": "wie viel",
    "en": "how much"
  },
  {
    "wort": "sí",
    "uebersetzung": "ja",
    "en": "yes"
  },
  {
    "wort": "no",
    "uebersetzung": "nein, nicht",
    "en": "no, not"
  },
  {
    "wort": "hola",
    "uebersetzung": "hallo",
    "en": "hello"
  },
  {
    "wort": "adiós",
    "uebersetzung": "tschüss",
    "en": "goodbye"
  },
  {
    "wort": "gracias",
    "uebersetzung": "danke",
    "en": "thank you"
  },
  {
    "wort": "por favor",
    "uebersetzung": "bitte",
    "en": "please"
  },
  {
    "wort": "perdón",
    "uebersetzung": "Entschuldigung",
    "en": "sorry"
  },
  {
    "wort": "bien",
    "uebersetzung": "gut",
    "en": "well, good"
  },
  {
    "wort": "mal",
    "uebersetzung": "schlecht",
    "en": "badly, bad"
  },
  {
    "wort": "muy",
    "uebersetzung": "sehr",
    "en": "very"
  },
  {
    "wort": "más",
    "uebersetzung": "mehr",
    "en": "more"
  },
  {
    "wort": "también",
    "uebersetzung": "auch",
    "en": "also, too"
  },
  {
    "wort": "pero",
    "uebersetzung": "aber",
    "en": "but"
  },
  {
    "wort": "y",
    "uebersetzung": "und",
    "en": "and"
  },
  {
    "wort": "o",
    "uebersetzung": "oder",
    "en": "or"
  },
  {
    "wort": "con",
    "uebersetzung": "mit",
    "en": "with"
  },
  {
    "wort": "sin",
    "uebersetzung": "ohne",
    "en": "without"
  },
  {
    "wort": "para",
    "uebersetzung": "für",
    "en": "for"
  },
  {
    "wort": "aquí",
    "uebersetzung": "hier",
    "en": "here"
  },
  {
    "wort": "allí",
    "uebersetzung": "dort",
    "en": "there"
  },
  {
    "wort": "ahora",
    "uebersetzung": "jetzt",
    "en": "now"
  },
  {
    "wort": "hoy",
    "uebersetzung": "heute",
    "en": "today"
  },
  {
    "wort": "mañana",
    "uebersetzung": "morgen",
    "en": "tomorrow"
  },
  {
    "wort": "ayer",
    "uebersetzung": "gestern",
    "en": "yesterday"
  },
  {
    "wort": "siempre",
    "uebersetzung": "immer",
    "en": "always"
  },
  {
    "wort": "nunca",
    "uebersetzung": "nie",
    "en": "never"
  },
  {
    "wort": "mucho",
    "uebersetzung": "viel",
    "en": "a lot, much"
  },
  {
    "wort": "poco",
    "uebersetzung": "wenig",
    "en": "little, not much"
  },
  {
    "wort": "todo",
    "uebersetzung": "alles",
    "en": "everything"
  },
  {
    "wort": "nada",
    "uebersetzung": "nichts",
    "en": "nothing"
  },
  {
    "wort": "algo",
    "uebersetzung": "etwas",
    "en": "something"
  },
  {
    "wort": "la casa",
    "uebersetzung": "das Haus",
    "en": "the house"
  },
  {
    "wort": "el agua",
    "uebersetzung": "das Wasser",
    "en": "the water"
  },
  {
    "wort": "la comida",
    "uebersetzung": "das Essen",
    "en": "the food"
  },
  {
    "wort": "el día",
    "uebersetzung": "der Tag",
    "en": "the day"
  },
  {
    "wort": "la noche",
    "uebersetzung": "die Nacht",
    "en": "the night"
  },
  {
    "wort": "el tiempo",
    "uebersetzung": "die Zeit, das Wetter",
    "en": "the time, the weather"
  },
  {
    "wort": "el año",
    "uebersetzung": "das Jahr",
    "en": "the year"
  },
  {
    "wort": "la semana",
    "uebersetzung": "die Woche",
    "en": "the week"
  },
  {
    "wort": "la hora",
    "uebersetzung": "die Stunde",
    "en": "the hour"
  },
  {
    "wort": "el trabajo",
    "uebersetzung": "die Arbeit",
    "en": "the work, the job"
  },
  {
    "wort": "el amigo",
    "uebersetzung": "der Freund",
    "en": "the friend (male)"
  },
  {
    "wort": "la amiga",
    "uebersetzung": "die Freundin",
    "en": "the friend (female)"
  },
  {
    "wort": "la familia",
    "uebersetzung": "die Familie",
    "en": "the family"
  },
  {
    "wort": "la ciudad",
    "uebersetzung": "die Stadt",
    "en": "the city"
  },
  {
    "wort": "el país",
    "uebersetzung": "das Land",
    "en": "the country"
  },
  {
    "wort": "la calle",
    "uebersetzung": "die Straße",
    "en": "the street"
  },
  {
    "wort": "el dinero",
    "uebersetzung": "das Geld",
    "en": "the money"
  },
  {
    "wort": "el nombre",
    "uebersetzung": "der Name",
    "en": "the name"
  },
  {
    "wort": "la persona",
    "uebersetzung": "die Person",
    "en": "the person"
  },
  {
    "wort": "el hombre",
    "uebersetzung": "der Mann",
    "en": "the man"
  },
  {
    "wort": "la mujer",
    "uebersetzung": "die Frau",
    "en": "the woman"
  },
  {
    "wort": "el niño",
    "uebersetzung": "das Kind",
    "en": "the child"
  },
  {
    "wort": "la madre",
    "uebersetzung": "die Mutter",
    "en": "the mother"
  },
  {
    "wort": "el padre",
    "uebersetzung": "der Vater",
    "en": "the father"
  },
  {
    "wort": "el café",
    "uebersetzung": "der Kaffee",
    "en": "the coffee"
  },
  {
    "wort": "el pan",
    "uebersetzung": "das Brot",
    "en": "the bread"
  },
  {
    "wort": "la cuenta",
    "uebersetzung": "die Rechnung",
    "en": "the bill"
  },
  {
    "wort": "el baño",
    "uebersetzung": "das Bad, die Toilette",
    "en": "the bathroom, the toilet"
  },
  {
    "wort": "la palabra",
    "uebersetzung": "das Wort",
    "en": "the word"
  },
  {
    "wort": "grande",
    "uebersetzung": "groß",
    "en": "big"
  },
  {
    "wort": "pequeño",
    "uebersetzung": "klein",
    "en": "small"
  },
  {
    "wort": "bueno",
    "uebersetzung": "gut",
    "en": "good"
  },
  {
    "wort": "nuevo",
    "uebersetzung": "neu",
    "en": "new"
  },
  {
    "wort": "bonito",
    "uebersetzung": "schön",
    "en": "pretty, nice"
  },
  {
    "wort": "fácil",
    "uebersetzung": "leicht, einfach",
    "en": "easy"
  }
]

export const GRUNDPAKET_SAETZE = [
  {
    "satz": "¿Cómo te llamas?",
    "uebersetzung": "Wie heißt du?",
    "en": "What's your name?",
    "schluessel": "llamas"
  },
  {
    "satz": "Me llamo Ana y soy de Alemania.",
    "uebersetzung": "Ich heiße Ana und komme aus Deutschland.",
    "en": "My name is Ana and I'm from Germany.",
    "schluessel": "soy"
  },
  {
    "satz": "¿Dónde está el baño?",
    "uebersetzung": "Wo ist die Toilette?",
    "en": "Where is the bathroom?",
    "schluessel": "está"
  },
  {
    "satz": "Quiero un café, por favor.",
    "uebersetzung": "Ich möchte einen Kaffee, bitte.",
    "en": "I'd like a coffee, please.",
    "schluessel": "quiero"
  },
  {
    "satz": "No entiendo, ¿puedes repetir?",
    "uebersetzung": "Ich verstehe nicht, kannst du das wiederholen?",
    "en": "I don't understand, can you repeat that?",
    "schluessel": "entiendo"
  },
  {
    "satz": "¿Cuánto cuesta esto?",
    "uebersetzung": "Wie viel kostet das?",
    "en": "How much does this cost?",
    "schluessel": "cuesta"
  },
  {
    "satz": "Estoy aprendiendo español.",
    "uebersetzung": "Ich lerne Spanisch.",
    "en": "I'm learning Spanish.",
    "schluessel": "aprendiendo"
  },
  {
    "satz": "Gracias, todo bien.",
    "uebersetzung": "Danke, alles gut.",
    "en": "Thanks, all good.",
    "schluessel": "bien"
  },
  {
    "satz": "¿Puedes hablar más despacio?",
    "uebersetzung": "Kannst du langsamer sprechen?",
    "en": "Can you speak more slowly?",
    "schluessel": "despacio"
  },
  {
    "satz": "¡Hasta mañana!",
    "uebersetzung": "Bis morgen!",
    "en": "See you tomorrow!",
    "schluessel": "mañana"
  }
]

export const GRUNDPAKET_TEXT = {
  "titel_es": "Cómo aprender con Habloo",
  "titel_de": "So lernst du mit Habloo",
  "titel_en": "How to learn with Habloo",
  "stufe": "a1",
  "absaetze": [
    {
      "es": "¡Hola! Bienvenido a Habloo. Aquí aprendes español un poco cada día.",
      "de": "Hallo! Willkommen bei Habloo. Hier lernst du jeden Tag ein bisschen Spanisch.",
      "en": "Hello! Welcome to Habloo. Here you learn a little Spanish every day."
    },
    {
      "es": "Empieza con las lecciones. Son cortas y van paso a paso.",
      "de": "Fang mit den Lektionen an. Sie sind kurz und gehen Schritt für Schritt.",
      "en": "Start with the lessons. They are short and go step by step."
    },
    {
      "es": "Después mira un video en YouTube. Toca una palabra y la guardas en el entrenador.",
      "de": "Danach schau ein Video auf YouTube. Tippe auf ein Wort, und du speicherst es im Trainer.",
      "en": "Then watch a video on YouTube. Tap a word and you save it to the trainer."
    },
    {
      "es": "El entrenador te muestra las palabras otra vez, justo antes de olvidarlas.",
      "de": "Der Trainer zeigt dir die Wörter wieder, kurz bevor du sie vergisst.",
      "en": "The trainer shows you the words again, just before you forget them."
    },
    {
      "es": "¿Quieres hablar? Con Habla practicas una conversación de verdad, con tu voz.",
      "de": "Willst du sprechen? Mit Habla übst du ein echtes Gespräch, mit deiner Stimme.",
      "en": "Want to speak? With Habla you practice a real conversation, using your voice."
    },
    {
      "es": "Aprende un poco cada día y tu racha crece. ¡Vamos!",
      "de": "Lerne jeden Tag ein bisschen, und deine Serie wächst. Los geht’s!",
      "en": "Learn a little every day and your streak grows. Let's go!"
    }
  ],
  "woerter": [
    {
      "wort": "bienvenido",
      "uebersetzung": "willkommen",
      "en": "welcome"
    },
    {
      "wort": "paso a paso",
      "uebersetzung": "Schritt für Schritt",
      "en": "step by step"
    },
    {
      "wort": "guardar",
      "uebersetzung": "speichern",
      "en": "to save"
    },
    {
      "wort": "el entrenador",
      "uebersetzung": "der Trainer",
      "en": "the trainer"
    },
    {
      "wort": "olvidar",
      "uebersetzung": "vergessen",
      "en": "to forget"
    },
    {
      "wort": "la racha",
      "uebersetzung": "die Serie",
      "en": "the streak"
    }
  ]
}

// Startgeschenk (10.11.2026): nur die ERSTEN 50 – die Liste ist nach Wichtigkeit sortiert.
export const STARTGESCHENK_WOERTER = GRUNDPAKET_WOERTER.slice(0, 50)

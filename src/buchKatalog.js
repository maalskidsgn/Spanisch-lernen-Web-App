// Echte Bücher nach Themen für den Buch-Generator (10.11.2026).
// Bewusst eine feste Liste bekannter Titel: Die KI kennt sie sicher
// (keine erfundenen Inhalte), und die Auswahl kostet nichts.
// de/en = Titel, wie er in der jeweiligen Sprache bekannt ist.
const b = (de, en, autor) => ({ de, en, autor })

export const THEMEN = [
  {
    id: 'gewohnheiten', de: 'Gewohnheiten', en: 'Habits',
    buecher: [
      b('Die 1%-Methode (Atomic Habits)', 'Atomic Habits', 'James Clear'),
      b('Die Macht der Gewohnheit', 'The Power of Habit', 'Charles Duhigg'),
      b('Deep Work', 'Deep Work', 'Cal Newport'),
      b('Die 7 Wege zur Effektivität', 'The 7 Habits of Highly Effective People', 'Stephen R. Covey'),
      b('Essentialismus', 'Essentialism', 'Greg McKeown'),
      b('Die 4-Stunden-Woche', 'The 4-Hour Workweek', 'Tim Ferriss'),
    ],
  },
  {
    id: 'psychologie', de: 'Psychologie', en: 'Psychology',
    buecher: [
      b('Schnelles Denken, langsames Denken', 'Thinking, Fast and Slow', 'Daniel Kahneman'),
      b('Selbstbild (Mindset)', 'Mindset', 'Carol S. Dweck'),
      b('Flow', 'Flow', 'Mihaly Csikszentmihalyi'),
      b('Wie man Freunde gewinnt', 'How to Win Friends and Influence People', 'Dale Carnegie'),
      b('Das Kind in dir muss Heimat finden', 'The Child in You', 'Stefanie Stahl'),
      b('Still – Die Kraft der Introvertierten', 'Quiet', 'Susan Cain'),
    ],
  },
  {
    id: 'geld', de: 'Geld & Business', en: 'Money & business',
    buecher: [
      b('Rich Dad Poor Dad', 'Rich Dad Poor Dad', 'Robert T. Kiyosaki'),
      b('Die Psychologie des Geldes', 'The Psychology of Money', 'Morgan Housel'),
      b('Der reichste Mann von Babylon', 'The Richest Man in Babylon', 'George S. Clason'),
      b('Zero to One', 'Zero to One', 'Peter Thiel'),
      b('Lean Startup', 'The Lean Startup', 'Eric Ries'),
      b('Denke nach und werde reich', 'Think and Grow Rich', 'Napoleon Hill'),
    ],
  },
  {
    id: 'sinn', de: 'Philosophie & Sinn', en: 'Philosophy & meaning',
    buecher: [
      b('Ikigai', 'Ikigai', 'Héctor García, Francesc Miralles'),
      b('… trotzdem Ja zum Leben sagen', "Man's Search for Meaning", 'Viktor E. Frankl'),
      b('Selbstbetrachtungen', 'Meditations', 'Mark Aurel'),
      b('Die Kunst des Krieges', 'The Art of War', 'Sun Tzu'),
      b('Jetzt! Die Kraft der Gegenwart', 'The Power of Now', 'Eckhart Tolle'),
      b('Die vier Versprechen', 'The Four Agreements', 'Don Miguel Ruiz'),
    ],
  },
  {
    id: 'wissen', de: 'Geschichte & Wissen', en: 'History & science',
    buecher: [
      b('Eine kurze Geschichte der Menschheit', 'Sapiens', 'Yuval Noah Harari'),
      b('Factfulness', 'Factfulness', 'Hans Rosling'),
      b('Eine kurze Geschichte der Zeit', 'A Brief History of Time', 'Stephen Hawking'),
      b('Arm und Reich', 'Guns, Germs, and Steel', 'Jared Diamond'),
      b('Das egoistische Gen', 'The Selfish Gene', 'Richard Dawkins'),
    ],
  },
  {
    id: 'gesundheit', de: 'Gesundheit', en: 'Health',
    buecher: [
      b('Das große Buch vom Schlaf', 'Why We Sleep', 'Matthew Walker'),
      b('Darm mit Charme', 'Gut', 'Giulia Enders'),
      b('Breath – Atem', 'Breath', 'James Nestor'),
      b('Das Ende des Alterns', 'Lifespan', 'David A. Sinclair'),
    ],
  },
]

// Klassiker der Lernsprache – je App eigene Liste
export const KLASSIKER = {
  es: [
    b('Don Quijote', 'Don Quixote', 'Miguel de Cervantes'),
    b('Hundert Jahre Einsamkeit', 'One Hundred Years of Solitude', 'Gabriel García Márquez'),
    b('Die Liebe in den Zeiten der Cholera', 'Love in the Time of Cholera', 'Gabriel García Márquez'),
    b('Der Schatten des Windes', 'The Shadow of the Wind', 'Carlos Ruiz Zafón'),
    b('Der Alchimist', 'The Alchemist', 'Paulo Coelho'),
    b('Der kleine Prinz', 'The Little Prince', 'Antoine de Saint-Exupéry'),
  ],
  ru: [
    b('Krieg und Frieden', 'War and Peace', 'Lew Tolstoi'),
    b('Schuld und Sühne', 'Crime and Punishment', 'Fjodor Dostojewski'),
    b('Anna Karenina', 'Anna Karenina', 'Lew Tolstoi'),
    b('Der Meister und Margarita', 'The Master and Margarita', 'Michail Bulgakow'),
    b('Die Brüder Karamasow', 'The Brothers Karamazov', 'Fjodor Dostojewski'),
    b('Der kleine Prinz', 'The Little Prince', 'Antoine de Saint-Exupéry'),
  ],
}

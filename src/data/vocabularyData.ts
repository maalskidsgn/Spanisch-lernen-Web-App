import { Vocabulary } from '../types';

export const vocabularyData: Vocabulary[] = [
  {
    id: '1',
    spanish: 'Gato',
    german: 'Katze',
    category: 'Tiere',
    difficulty: 'easy',
    image: '🐱'
  },
  {
    id: '2',
    spanish: 'Perro',
    german: 'Hund',
    category: 'Tiere',
    difficulty: 'easy',
    image: '🐶'
  },
  {
    id: '3',
    spanish: 'Casa',
    german: 'Haus',
    category: 'Wohnung',
    difficulty: 'easy',
    image: '🏠'
  },
  {
    id: '4',
    spanish: 'Libro',
    german: 'Buch',
    category: 'Schule',
    difficulty: 'easy',
    image: '📚'
  },
  {
    id: '5',
    spanish: 'Manzana',
    german: 'Apfel',
    category: 'Essen',
    difficulty: 'easy',
    image: '🍎'
  },
  {
    id: '6',
    spanish: 'Mesa',
    german: 'Tisch',
    category: 'Möbel',
    difficulty: 'easy',
    image: '📦'
  },
  {
    id: '7',
    spanish: 'Silla',
    german: 'Stuhl',
    category: 'Möbel',
    difficulty: 'easy',
    image: '🪑'
  },
  {
    id: '8',
    spanish: 'Puerta',
    german: 'Tür',
    category: 'Wohnung',
    difficulty: 'easy',
    image: '🚪'
  },
  {
    id: '9',
    spanish: 'Ventana',
    german: 'Fenster',
    category: 'Wohnung',
    difficulty: 'easy',
    image: '🪟'
  },
  {
    id: '10',
    spanish: 'Agua',
    german: 'Wasser',
    category: 'Essen',
    difficulty: 'easy',
    image: '💧'
  },
  {
    id: '11',
    spanish: 'Pan',
    german: 'Brot',
    category: 'Essen',
    difficulty: 'medium',
    image: '🍞'
  },
  {
    id: '12',
    spanish: 'Leche',
    german: 'Milch',
    category: 'Essen',
    difficulty: 'medium',
    image: '🥛'
  },
  {
    id: '13',
    spanish: 'Muerte',
    german: 'Tod',
    category: 'Natur',
    difficulty: 'hard',
    image: '💀'
  },
  {
    id: '14',
    spanish: 'Corazón',
    german: 'Herz',
    category: 'Körper',
    difficulty: 'medium',
    image: '❤️'
  },
  {
    id: '15',
    spanish: 'Cabeza',
    german: 'Kopf',
    category: 'Körper',
    difficulty: 'easy',
    image: '👤'
  },
];

export const lessonsData = [
  {
    id: '1',
    title: 'Anfänger Grundlagen',
    description: 'Lerne die Grundlagen des Spanischen',
    topic: 'Begrüßungen',
    level: 'beginner' as const,
    duration: 15,
    completed: false,
  },
  {
    id: '2',
    title: 'Körperteile',
    description: 'Lerne die Spanischen Namen für Körperteile',
    topic: 'Körper',
    level: 'beginner' as const,
    duration: 20,
    completed: false,
  },
  {
    id: '3',
    title: 'Haushaltsgegenstände',
    description: 'Möbel und Gegenstände im Haus',
    topic: 'Wohnung',
    level: 'beginner' as const,
    duration: 25,
    completed: false,
  },
  {
    id: '4',
    title: 'Essen und Trinken',
    description: 'Lerne Speisen und Getränke auf Spanisch',
    topic: 'Essen',
    level: 'intermediate' as const,
    duration: 30,
    completed: false,
  },
  {
    id: '5',
    title: 'Tiere',
    description: 'Verschiedene Tiere und ihre Namen',
    topic: 'Tiere',
    level: 'intermediate' as const,
    duration: 20,
    completed: false,
  },
];

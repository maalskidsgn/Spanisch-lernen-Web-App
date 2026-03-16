export interface Vocabulary {
  id: string;
  spanish: string;
  german: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  image?: string;
}

export interface VocabularyExercise {
  id: string;
  word: Vocabulary;
  options: string[];
  correct: string;
  type: 'translation' | 'recognition';
}

export interface UserProgress {
  totalCorrect: number;
  totalWrong: number;
  percentage: number;
  lastResult?: {
    correct: number;
    wrong: number;
    percentage: number;
  };
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  completed: boolean;
}

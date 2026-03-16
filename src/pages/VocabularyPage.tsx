import React, { useState } from 'react';
import { vocabularyData } from '../data/vocabularyData';
import { VocabularyExerciseComponent } from '../components/exercises/VocabularyExercise';
import { Button, Card } from '../components/shared/UI';

export const VocabularyPage: React.FC = () => {
  const [showExercise, setShowExercise] = useState(false);
  const [lastResult, setLastResult] = useState<{ correct: number; wrong: number } | null>(null);

  const handleExerciseComplete = (correct: number, wrong: number) => {
    setLastResult({ correct, wrong });
    setShowExercise(false);
  };

  if (showExercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setShowExercise(false)}
            className="mb-6 text-primary font-semibold hover:underline"
          >
            ← Zurück
          </button>
          <VocabularyExerciseComponent
            vocabulary={vocabularyData}
            onComplete={handleExerciseComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">Vokabeltraining</h1>
          <p className="text-xl opacity-90">
            Erweitere deinen spanischen Wortschatz mit interaktiven Übungen
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* CTA Button */}
        <div className="mb-12 text-center">
          <Button
            size="lg"
            onClick={() => setShowExercise(true)}
            className="bg-gradient-to-r from-primary to-primary-dark"
          >
            🚀 Übung Starten
          </Button>
        </div>

        {/* Last Result */}
        {lastResult && (
          <div className="mb-12">
            <Card className="bg-gradient-to-r from-primary to-primary-dark text-white">
              <h2 className="text-2xl font-bold mb-4">Letztes Ergebnis</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm opacity-90">Richtig</p>
                  <p className="text-3xl font-bold">{lastResult.correct}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Falsch</p>
                  <p className="text-3xl font-bold">{lastResult.wrong}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Quote</p>
                  <p className="text-3xl font-bold">
                    {Math.round((lastResult.correct / (lastResult.correct + lastResult.wrong)) * 100)}%
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Vocabulary Grid */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-secondary mb-8">Alle Vokabeln</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {vocabularyData.map(vocab => (
              <Card key={vocab.id} className="hover:shadow-xl hover:scale-105 transition-transform">
                <div className="text-center">
                  {vocab.image && <p className="text-4xl mb-3">{vocab.image}</p>}
                  <p className="text-sm text-primary font-semibold mb-1">{vocab.category}</p>
                  <p className="text-2xl font-bold text-secondary mb-2">{vocab.spanish}</p>
                  <p className="text-lg text-text-secondary">{vocab.german}</p>
                  <div className="mt-3">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        vocab.difficulty === 'easy'
                          ? 'bg-green-100 text-green-700'
                          : vocab.difficulty === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {vocab.difficulty === 'easy'
                        ? 'Einfach'
                        : vocab.difficulty === 'medium'
                        ? 'Mittel'
                        : 'Schwer'}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

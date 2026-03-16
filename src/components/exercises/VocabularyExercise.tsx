import React, { useState, useEffect } from 'react';
import { Vocabulary, VocabularyExercise } from '../../types';
import { Button, ProgressCircle, Card } from '../shared/UI';

interface VocabularyExerciseProps {
  vocabulary: Vocabulary[];
  onComplete: (correct: number, wrong: number) => void;
}

export const VocabularyExerciseComponent: React.FC<VocabularyExerciseProps> = ({
  vocabulary,
  onComplete,
}) => {
  const [exercises, setExercises] = useState<VocabularyExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // Generiere Übungen
    const generatedExercises: VocabularyExercise[] = vocabulary.slice(0, 10).map((word) => {
      const allOptions = vocabulary.map(v => v.german).sort(() => Math.random() - 0.5);
      const uniqueOptions = Array.from(new Set(allOptions)).slice(0, 3);
      if (!uniqueOptions.includes(word.german)) {
        uniqueOptions[0] = word.german;
      }

      return {
        id: word.id,
        word,
        options: uniqueOptions.sort(() => Math.random() - 0.5),
        correct: word.german,
        type: 'translation',
      };
    });
    setExercises(generatedExercises);
  }, [vocabulary]);

  if (exercises.length === 0) return <div>Lädt...</div>;

  if (completed) {
    const percentage = Math.round((correct / (correct + wrong)) * 100);
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card className="text-center">
          <h2 className="text-3xl font-bold text-secondary mb-6">Übung abgeschlossen! 🎉</h2>
          <div className="flex justify-center mb-8">
            <ProgressCircle percentage={percentage} size={150} />
          </div>
          <div className="text-lg mb-8">
            <p className="mb-2">
              <span className="font-bold text-primary">Richtig: {correct}</span>
            </p>
            <p className="mb-2">
              <span className="font-bold text-error">Falsch: {wrong}</span>
            </p>
            <p className="text-xl font-bold mt-4">Ergebnis: {percentage}%</p>
          </div>
          <Button onClick={() => {
            onComplete(correct, wrong);
            setCompleted(false);
            setCorrect(0);
            setWrong(0);
            setCurrentIndex(0);
            setSelectedAnswer(null);
          }}>
            Neue Übung
          </Button>
        </Card>
      </div>
    );
  }

  const currentExercise = exercises[currentIndex];
  const progress = Math.round(((currentIndex + 1) / exercises.length) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold text-text-secondary">
            Frage {currentIndex + 1} von {exercises.length}
          </p>
          <p className="text-sm font-semibold text-primary">{progress}%</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Exercise Card */}
      <Card className="mb-8">
        <div className="text-center mb-8">
          <p className="text-sm text-text-secondary mb-2">Übersetze:</p>
          <h2 className="text-4xl font-bold text-secondary mb-2">{currentExercise.word.spanish}</h2>
          {currentExercise.word.image && (
            <p className="text-6xl mb-4">{currentExercise.word.image}</p>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {currentExercise.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentExercise.correct;
            const showCorrect = showResult && isCorrect;
            const showIncorrect = showResult && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => {
                  if (!showResult) {
                    setSelectedAnswer(option);
                  }
                }}
                disabled={showResult}
                className={`w-full p-4 text-lg font-semibold rounded-lg transition-all duration-200 border-2 ${
                  showCorrect
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : showIncorrect
                    ? 'bg-red-50 border-red-500 text-red-700'
                    : isSelected
                    ? 'bg-primary text-white border-primary'
                    : 'bg-gray-50 border-gray-200 hover:border-primary'
                }`}
              >
                {option}
                {showCorrect && ' ✓'}
                {showIncorrect && ' ✗'}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        {!showResult && (
          <Button
            onClick={() => {
              if (selectedAnswer) {
                setShowResult(true);
                if (selectedAnswer === currentExercise.correct) {
                  setCorrect(correct + 1);
                } else {
                  setWrong(wrong + 1);
                }
              }
            }}
            disabled={!selectedAnswer}
            className="w-full"
          >
            Überprüfen
          </Button>
        )}

        {showResult && (
          <Button
            onClick={() => {
              if (currentIndex < exercises.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setSelectedAnswer(null);
                setShowResult(false);
              } else {
                setCompleted(true);
              }
            }}
            className="w-full"
          >
            {currentIndex < exercises.length - 1 ? 'Nächste Frage' : 'Ergebnis anschauen'}
          </Button>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-xl p-4 text-center border-2 border-green-200">
          <p className="text-sm text-green-700 font-semibold mb-1">Richtig</p>
          <p className="text-2xl font-bold text-green-700">{correct}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center border-2 border-red-200">
          <p className="text-sm text-red-700 font-semibold mb-1">Falsch</p>
          <p className="text-2xl font-bold text-red-700">{wrong}</p>
        </div>
      </div>
    </div>
  );
};

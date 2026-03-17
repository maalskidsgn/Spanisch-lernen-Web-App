import React, { useState, useEffect } from 'react';
import { VOCABULARY_LIST } from '../services/vocabularyService';
import {
  SpaceRepetitionManager,
  VocabularyProgress,
} from '../services/spaceRepetitionService';
import { useAuth } from '../AuthContext';
import { db } from '../config';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

export const ReviewPage: React.FC = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<string, VocabularyProgress>>({});
  const [dueVocabIds, setDueVocabIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  // Laden des Fortschritts aus Firestore
  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;

      try {
        const progressDoc = await getDoc(
          doc(db, 'users', user.uid, 'learning', 'progress')
        );

        let allProgress: Record<string, VocabularyProgress> = {};

        if (progressDoc.exists()) {
          allProgress = progressDoc.data() as Record<string, VocabularyProgress>;
        }

        // Stelle sicher, dass alle Vokabeln einen Progress-Eintrag haben
        VOCABULARY_LIST.forEach((vocab) => {
          if (!allProgress[vocab.id]) {
            allProgress[vocab.id] = SpaceRepetitionManager.createNewProgress(vocab.id);
          }
        });

        setProgress(allProgress);

        // Finde Vokabeln die wiederholt werden müssen
        const dueVocabs = SpaceRepetitionManager.getDueVocabulary(
          Object.values(allProgress)
        );
        setDueVocabIds(dueVocabs);
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden des Fortschritts:', error);
        setLoading(false);
      }
    };

    loadProgress();
  }, [user]);

  // Speichere Fortschritt in Firestore
  const saveProgress = async () => {
    if (!user) return;

    try {
      const progressRef = doc(db, 'users', user.uid, 'learning', 'progress');
      await setDoc(progressRef, progress, { merge: true });
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  };

  // Bewerte Antwort
  const handleAnswer = (quality: number) => {
    // quality: 0-5
    const currentVocabId = dueVocabIds[currentIndex];
    const currentProgress = progress[currentVocabId];

    const updatedProgress = SpaceRepetitionManager.updateProgress(
      currentProgress,
      quality
    );

    const newProgress = {
      ...progress,
      [currentVocabId]: updatedProgress,
    };

    setProgress(newProgress);
    saveProgress();

    setSessionStats({
      correct: quality >= 3 ? sessionStats.correct + 1 : sessionStats.correct,
      total: sessionStats.total + 1,
    });

    // Nächstes Vokabel
    if (currentIndex < dueVocabIds.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      // Session beendet
      setCurrentIndex(-1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <p className="text-2xl text-gray-600">Lädt Fortschritt...</p>
      </div>
    );
  }

  if (dueVocabIds.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-6">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Gratuliere!</h1>
          <p className="text-xl text-gray-600 mb-8">
            Du hast alle fälligen Wiederholungen erledigt. Morgen geht's weiter! 📚
          </p>
          <div className="bg-white rounded-xl shadow-lg p-8 inline-block">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Dein Fortschritt</h2>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {Object.values(progress).filter((p) => p.repetitions === 0).length}
                </div>
                <div className="text-sm text-gray-600">Neue Wörter</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">
                  {Object.values(progress).filter(
                    (p) => p.repetitions > 0 && p.repetitions < 4
                  ).length}
                </div>
                <div className="text-sm text-gray-600">Lernen</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {Object.values(progress).filter((p) => p.repetitions >= 4).length}
                </div>
                <div className="text-sm text-gray-600">Beherrscht</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {Object.values(progress).length}
                </div>
                <div className="text-sm text-gray-600">Gesamt</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentIndex === -1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-6">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="text-6xl mb-4">✨</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Session beendet!</h1>
          <div className="bg-white rounded-xl shadow-lg p-8 inline-block">
            <div className="text-2xl font-bold text-gray-800 mb-4">
              {sessionStats.correct}/{sessionStats.total} richtig
            </div>
            <div className="text-xl font-semibold text-orange-600 mb-6">
              {Math.round((sessionStats.correct / sessionStats.total) * 100)}% Erfolgsquote
            </div>
            <button
              onClick={() => {
                setCurrentIndex(0);
                setSessionStats({ correct: 0, total: 0 });
                window.location.reload();
              }}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition"
            >
              Zurück zur Übersicht
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentVocabId = dueVocabIds[currentIndex];
  const currentVocab = VOCABULARY_LIST.find((v) => v.id === currentVocabId);
  const currentProgress = progress[currentVocabId];

  if (!currentVocab) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Fortschrittsbalken */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-700">
              Frage {currentIndex + 1} von {dueVocabIds.length}
            </span>
            <span className="text-sm text-orange-600 font-bold">
              ✓ {sessionStats.correct} richtig
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / dueVocabIds.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Quiz Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center">
          {/* Icon */}
          <div className="text-8xl mb-6">{currentVocab.icon}</div>

          {/* Spanisches Wort */}
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            {currentVocab.spanish}
          </h2>

          {/* Hinweis */}
          {!showAnswer && (
            <p className="text-lg text-gray-500 mb-8">
              Was ist die deutsche Übersetzung?
            </p>
          )}

          {/* Antwort - versteckt bis geklickt */}
          {showAnswer && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 mb-8 border-2 border-blue-300">
              <p className="text-sm text-blue-600 mb-2">Deutsche Übersetzung:</p>
              <h3 className="text-3xl font-bold text-blue-800 mb-4">
                {currentVocab.german}
              </h3>
              {currentVocab.pronunciation && (
                <p className="text-sm text-blue-600 italic">
                  Aussprache: {currentVocab.pronunciation}
                </p>
              )}
              {currentVocab.example && (
                <div className="mt-4 pt-4 border-t border-blue-300">
                  <p className="text-sm text-blue-600 mb-2">Beispiel:</p>
                  <p className="text-blue-800 italic">"{currentVocab.example}"</p>
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="w-full bg-blue-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-600 transition"
            >
              Antwort anzeigen 👀
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 font-semibold mb-4">
                Wie war die Antwort für dich?
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleAnswer(0)}
                  className="bg-red-100 text-red-700 py-3 rounded-lg font-bold hover:bg-red-200 transition text-sm"
                  title="Komplett vergessen"
                >
                  ❌ Falsch
                </button>
                <button
                  onClick={() => handleAnswer(2)}
                  className="bg-yellow-100 text-yellow-700 py-3 rounded-lg font-bold hover:bg-yellow-200 transition text-sm"
                  title="Mit Mühe"
                >
                  🤔 Schwer
                </button>
                <button
                  onClick={() => handleAnswer(5)}
                  className="bg-green-100 text-green-700 py-3 rounded-lg font-bold hover:bg-green-200 transition text-sm"
                  title="Perfekt"
                >
                  ✓ Richtig
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Wiederholungsintervall: {currentProgress.interval} Tage
              </p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4 text-center text-sm text-gray-600">
          <p>
            <strong>Schwierigkeitsgrad:</strong> {currentVocab.difficulty} •{' '}
            <strong>Kategorie:</strong> {currentVocab.category}
          </p>
        </div>
      </div>
    </div>
  );
};

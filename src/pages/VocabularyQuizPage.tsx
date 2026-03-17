import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VOCABULARY_LIST } from '../services/vocabularyService';
import { SpaceRepetitionManager, VocabularyProgress } from '../services/spaceRepetitionService';
import { db } from '../config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

export const VocabularyQuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentBatch, setCurrentBatch] = useState(0);
  const [batchSize] = useState(10);
  const [currentVocabIndex, setCurrentVocabIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [progress, setProgress] = useState<Map<string, VocabularyProgress>>(new Map());
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [batchComplete, setBatchComplete] = useState(false);
  const [allComplete, setAllComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  // Lade Fortschritt vom Firestore
  useEffect(() => {
    if (!user) return;

    const loadProgress = async () => {
      try {
        const docRef = doc(db, `users/${user.uid}/learning/progress`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const progressMap = new Map<string, VocabularyProgress>();

          Object.entries(data).forEach(([key, value]: [string, any]) => {
            progressMap.set(key, {
              ...value,
              nextReviewDate: new Date(value.nextReviewDate),
              lastReviewDate: value.lastReviewDate
                ? new Date(value.lastReviewDate)
                : undefined,
            });
          });

          setProgress(progressMap);
        } else {
          // Initialize mit allen Vokabeln
          const newProgress = new Map<string, VocabularyProgress>();
          VOCABULARY_LIST.forEach((vocab) => {
            newProgress.set(
              vocab.id,
              SpaceRepetitionManager.createNewProgress(vocab.id)
            );
          });
          setProgress(newProgress);
        }
      } catch (error) {
        console.error('Fehler beim Laden des Fortschritts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900">Lädt...</h2>
      </div>
    );
  }

  // Berechne aktuelle Batch
  const batchVocab = VOCABULARY_LIST.slice(
    currentBatch * batchSize,
    (currentBatch + 1) * batchSize
  );

  if (allComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Gratuliere!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Du hast alle 100 Vokabeln gelernt! Jetzt werden diese regelmäßig wiederholt.
          </p>
          <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Deine Statistiken
            </h2>
            <p className="text-lg text-gray-600">
              Gesamt gelernt: <span className="text-orange-500 font-bold">100</span> Vokabeln
            </p>
            <p className="text-lg text-gray-600">
              Session Erfolgsrate: <span className="text-orange-500 font-bold">
                {Math.round((sessionStats.correct / sessionStats.total) * 100)}%
              </span>
            </p>
          </div>
          <button
            onClick={() => navigate('/review')}
            className="bg-orange-500 text-white px-12 py-5 rounded-lg font-bold text-xl hover:bg-orange-600 transition shadow-lg"
          >
            Zum Review Modus
          </button>
        </div>
      </div>
    );
  }

  if (batchComplete) {
    const totalBatches = Math.ceil(VOCABULARY_LIST.length / batchSize);
    const nextBatchNum = currentBatch + 1;

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Batch {currentBatch + 1} abgeschlossen!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Du hast {batchSize} Vokabeln gelernt. Diese sind jetzt im Lernalgorithmus!
          </p>

          <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Fortschritt
            </h2>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div
                className="bg-orange-500 h-4 rounded-full transition-all"
                style={{
                  width: `${((currentBatch * batchSize) / VOCABULARY_LIST.length) * 100}%`,
                }}
              />
            </div>
            <p className="text-lg text-gray-600">
              {currentBatch * batchSize} / {VOCABULARY_LIST.length} Vokabeln
            </p>
          </div>

          {nextBatchNum <= totalBatches ? (
            <button
              onClick={() => {
                setBatchComplete(false);
                setCurrentVocabIndex(0);
                setShowTranslation(false);
                setCurrentBatch(nextBatchNum - 1);
              }}
              className="bg-orange-500 text-white px-12 py-5 rounded-lg font-bold text-xl hover:bg-orange-600 transition shadow-lg"
            >
              Nächste Batch ({nextBatchNum}/{totalBatches})
            </button>
          ) : (
            <button
              onClick={() => setAllComplete(true)}
              className="bg-green-500 text-white px-12 py-5 rounded-lg font-bold text-xl hover:bg-green-600 transition shadow-lg"
            >
              Alle Vokabeln abgeschlossen! 🚀
            </button>
          )}
        </div>
      </div>
    );
  }

  if (batchVocab.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900">Keine Vokabeln verfügbar</h2>
      </div>
    );
  }

  const currentVocab = batchVocab[currentVocabIndex];
  const isLastInBatch = currentVocabIndex === batchVocab.length - 1;

  const handleAnswer = (quality: number) => {
    const currentProgress = progress.get(currentVocab.id) || 
      SpaceRepetitionManager.createNewProgress(currentVocab.id);

    const updatedProgress = SpaceRepetitionManager.updateProgress(
      currentProgress,
      quality
    );

    const newProgress = new Map(progress);
    newProgress.set(currentVocab.id, updatedProgress);
    setProgress(newProgress);

    // Update Firestore
    if (user) {
      const progressObj: Record<string, any> = {};
      newProgress.forEach((value, key) => {
        progressObj[key] = {
          ...value,
          nextReviewDate: value.nextReviewDate.toISOString(),
          lastReviewDate: value.lastReviewDate?.toISOString(),
        };
      });

      setDoc(doc(db, `users/${user.uid}/learning/progress`), progressObj);
    }

    // Update stats
    const newStats = { ...sessionStats };
    newStats.total += 1;
    if (quality >= 3) newStats.correct += 1;
    setSessionStats(newStats);

    if (isLastInBatch) {
      setBatchComplete(true);
    } else {
      setCurrentVocabIndex(currentVocabIndex + 1);
      setShowTranslation(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-4 py-20">
      <div className="max-w-2xl mx-auto w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-bold text-gray-900">
              Batch {currentBatch + 1}: {currentVocabIndex + 1}/{batchVocab.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-orange-500 h-3 rounded-full transition-all"
              style={{ width: `${((currentVocabIndex + 1) / batchVocab.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Quiz Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 mb-8 text-center">
          {/* Icon & Word */}
          <div className="text-7xl mb-6">{currentVocab.icon}</div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            {currentVocab.spanish}
          </h1>
          <p className="text-lg text-gray-500 mb-8 italic">
            [{currentVocab.pronunciation}]
          </p>

          {/* Translation & Example */}
          <div
            className={`transition-all duration-300 ${
              showTranslation ? 'opacity-100' : 'opacity-0 hidden'
            }`}
          >
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-8 mb-8">
              <p className="text-3xl font-bold text-gray-900 mb-4">
                {currentVocab.german}
              </p>
              <div className="border-t border-orange-300 pt-4">
                <p className="text-sm text-gray-600 mb-2">Beispiel:</p>
                <p className="text-lg text-gray-700 italic">
                  &quot;{currentVocab.example}&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Show/Hide Button */}
          {!showTranslation ? (
            <button
              onClick={() => setShowTranslation(true)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg transition mb-8"
            >
              Antwort anzeigen
            </button>
          ) : null}
        </div>

        {/* Answer Buttons */}
        {showTranslation && (
          <div className="space-y-3">
            <button
              onClick={() => handleAnswer(0)}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-lg"
            >
              ❌ Falsch
            </button>
            <button
              onClick={() => handleAnswer(2)}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-lg"
            >
              🤔 Schwer
            </button>
            <button
              onClick={() => handleAnswer(5)}
              className="w-full bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-lg"
            >
              ✅ Richtig
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 bg-white rounded-2xl p-6 text-center shadow-lg">
          <p className="text-gray-600">
            Erfolgsrate: <span className="font-bold text-orange-500">
              {sessionStats.total > 0
                ? Math.round((sessionStats.correct / sessionStats.total) * 100)
                : 0}
              %
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

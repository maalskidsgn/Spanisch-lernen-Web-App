import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VOCABULARY_LIST } from '../services/vocabularyService';
import { SpaceRepetitionManager, VocabularyProgress } from '../services/spaceRepetitionService';
import { db } from '../config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

interface QuizQuestion {
  vocabId: string;
  spanish: string;
  icon: string;
  correctAnswer: string;
  options: string[]; // 5 Optionen mit korrekter Antwort gemischt
}

// Global Cache für Firestore-Daten
let progressCache: Map<string, VocabularyProgress> | null = null;
let cacheLoaded = false;

export const VocabularyQuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentBatch, setCurrentBatch] = useState(0);
  const batchSize = 10; // Direkt hier definieren
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [progress, setProgress] = useState<Map<string, VocabularyProgress>>(new Map());
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [batchComplete, setBatchComplete] = useState(false);
  const [allComplete, setAllComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Generiere 4 wirklich ZUFÄLLIGE falsche Antworten für jede Frage
  const getRandomWrongAnswers = (correctAnswer: string): string[] => {
    const wrongAnswers: string[] = [];
    const seen = new Set<string>([correctAnswer]);

    // Wähle aus ALLEN 100 Vokabeln - nicht nur aus der Batch
    const allGermanWords = VOCABULARY_LIST.map(v => v.german);

    while (wrongAnswers.length < 4) {
      const randomIdx = Math.floor(Math.random() * allGermanWords.length);
      const candidate = allGermanWords[randomIdx];
      if (!seen.has(candidate)) {
        wrongAnswers.push(candidate);
        seen.add(candidate);
      }
    }

    return wrongAnswers;
  };

  // Generiere Multiple-Choice Fragen - SCHNELL und DIREKT
  const generateQuestionsForBatch = (batchNum: number) => {
    const batchStart = batchNum * batchSize;
    const batchEnd = Math.min(batchStart + batchSize, VOCABULARY_LIST.length);
    const batchVocab = VOCABULARY_LIST.slice(batchStart, batchEnd);

    return batchVocab.map((vocab) => {
      // Für JEDE Frage neu zufällige falsche Antworten generieren
      const wrongAnswers = getRandomWrongAnswers(vocab.german);
      const allOptions = [vocab.german, ...wrongAnswers];
      const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

      return {
        vocabId: vocab.id,
        spanish: vocab.spanish,
        icon: vocab.icon,
        correctAnswer: vocab.german,
        options: shuffledOptions,
      };
    });
  };

  // Lade Progress vom Firestore - NUR einmal beim Mount
  useEffect(() => {
    if (!user || cacheLoaded) return;

    const loadProgressAsync = async () => {
      try {
        const docRef = doc(db, `users/${user.uid}/learning/progress`);
        
        // Mit Timeout - wenn zu lange dauert, verwende Fallback
        const timeoutPromise = new Promise<any>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 3000)
        );

        let docSnap;
        try {
          docSnap = await Promise.race([getDoc(docRef), timeoutPromise]);
        } catch (timeoutError) {
          console.warn('Firestore zu langsam, verwende Fallback');
          docSnap = null;
        }

        const progressMap = new Map<string, VocabularyProgress>();

        if (docSnap?.exists()) {
          const data = docSnap.data();
          Object.entries(data).forEach(([key, value]: [string, any]) => {
            progressMap.set(key, {
              ...value,
              nextReviewDate: new Date(value.nextReviewDate),
              lastReviewDate: value.lastReviewDate
                ? new Date(value.lastReviewDate)
                : undefined,
            });
          });
        } else {
          // Initialize schnell lokal
          VOCABULARY_LIST.forEach((vocab) => {
            progressMap.set(
              vocab.id,
              SpaceRepetitionManager.createNewProgress(vocab.id)
            );
          });
        }

        // Cache speichern
        progressCache = progressMap;
        cacheLoaded = true;
        setProgress(progressMap);

        // Generiere Fragen für Batch 0
        const newQuestions = generateQuestionsForBatch(0);
        setQuestions(newQuestions);
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden des Fortschritts:', error);

        // Schneller Fallback
        const fallbackProgress = new Map<string, VocabularyProgress>();
        VOCABULARY_LIST.forEach((vocab) => {
          fallbackProgress.set(
            vocab.id,
            SpaceRepetitionManager.createNewProgress(vocab.id)
          );
        });

        progressCache = fallbackProgress;
        cacheLoaded = true;
        setProgress(fallbackProgress);
        const newQuestions = generateQuestionsForBatch(0);
        setQuestions(newQuestions);
        setLoading(false);
      }
    };

    loadProgressAsync();
  }, [user]);

  // Wenn Batch ändert - SCHNELL regeneriere Fragen
  useEffect(() => {
    if (progress.size > 0 && currentBatch >= 0) {
      const newQuestions = generateQuestionsForBatch(currentBatch);
      setQuestions(newQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setAnswered(false);
      setIsCorrect(null);
    }
  }, [currentBatch, progress]);

  // Regeneriere Fragen dynamisch bei jedem Next-Klick (für neue Variationen)
  const regenerateCurrentQuestion = () => {
    if (questions.length === 0) return;
    
    const batchStart = currentBatch * batchSize;
    const batchEnd = Math.min(batchStart + batchSize, VOCABULARY_LIST.length);
    const currentVocab = VOCABULARY_LIST[batchStart + currentQuestionIndex];
    
    if (!currentVocab) return;

    const wrongAnswers = getRandomWrongAnswers(currentVocab.german);
    const allOptions = [currentVocab.german, ...wrongAnswers];
    const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

    const newQuestion: QuizQuestion = {
      vocabId: currentVocab.id,
      spanish: currentVocab.spanish,
      icon: currentVocab.icon,
      correctAnswer: currentVocab.german,
      options: shuffledOptions,
    };

    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = newQuestion;
    setQuestions(updatedQuestions);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900">Lädt...</h2>
      </div>
    );
  }

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
            <p className="text-lg text-gray-600 mb-2">
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
            Du hast {questions.length} Vokabeln gelernt. Diese sind jetzt im Lernalgorithmus!
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
            <p className="text-lg text-gray-600 mt-4">
              Erfolgsrate: <span className="text-orange-500 font-bold">
                {Math.round((sessionStats.correct / sessionStats.total) * 100)}%
              </span>
            </p>
          </div>

          {nextBatchNum <= totalBatches ? (
            <button
              onClick={() => {
                setBatchComplete(false);
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

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900">Keine Vokabeln verfügbar</h2>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswer = (selectedOption: string) => {
    if (answered) return; // Verhindere mehrfaches Klicken

    const isAnswerCorrect = selectedOption === currentQuestion.correctAnswer;
    setSelectedAnswer(selectedOption);
    setAnswered(true);
    setIsCorrect(isAnswerCorrect);

    // Update Progress mit SM-2
    const currentProgress = progress.get(currentQuestion.vocabId) ||
      SpaceRepetitionManager.createNewProgress(currentQuestion.vocabId);

    // Quality Score basierend auf Antwort
    const quality = isAnswerCorrect ? 5 : 0; // 5 = korrekt, 0 = falsch

    const updatedProgress = SpaceRepetitionManager.updateProgress(
      currentProgress,
      quality
    );

    const newProgress = new Map(progress);
    newProgress.set(currentQuestion.vocabId, updatedProgress);
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

      setDoc(doc(db, `users/${user.uid}/learning/progress`), progressObj).catch(
        (error) => console.error('Fehler beim Speichern:', error)
      );
    }

    // Update stats
    const newStats = { ...sessionStats };
    newStats.total += 1;
    if (isAnswerCorrect) newStats.correct += 1;
    setSessionStats(newStats);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setBatchComplete(true);
    } else {
      // Gehe zur nächsten Frage
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setIsCorrect(null);
      
      // Nach state update die nächste Frage regenerieren
      setTimeout(() => {
        const batchStart = currentBatch * batchSize;
        const nextQuestionIdx = currentQuestionIndex + 1;
        const nextVocab = VOCABULARY_LIST[batchStart + nextQuestionIdx];
        
        if (nextVocab && questions.length > 0) {
          const wrongAnswers = getRandomWrongAnswers(nextVocab.german);
          const allOptions = [nextVocab.german, ...wrongAnswers];
          const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

          const newQuestion: QuizQuestion = {
            vocabId: nextVocab.id,
            spanish: nextVocab.spanish,
            icon: nextVocab.icon,
            correctAnswer: nextVocab.german,
            options: shuffledOptions,
          };

          const updatedQuestions = [...questions];
          updatedQuestions[nextQuestionIdx] = newQuestion;
          setQuestions(updatedQuestions);
        }
      }, 0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-4 py-20">
      <div className="max-w-2xl mx-auto w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-bold text-gray-900">
              Batch {currentBatch + 1}: {currentQuestionIndex + 1}/{questions.length}
            </span>
            <span className="text-lg font-bold text-orange-500">
              {Math.round((sessionStats.correct / (sessionStats.total || 1)) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-orange-500 h-3 rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Quiz Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 mb-8">
          {/* Icon & Spanish Word */}
          <div className="text-center mb-8">
            <div className="text-7xl mb-4">{currentQuestion.icon}</div>
            <h1 className="text-5xl font-bold text-gray-900">
              {currentQuestion.spanish}
            </h1>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-8" />

          {/* Question */}
          <p className="text-center text-lg text-gray-600 mb-8">
            Was bedeutet das auf Deutsch?
          </p>

          {/* Answer Options */}
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = option === currentQuestion.correctAnswer;
              
              let buttonClass = 'bg-white border-2 border-gray-300 text-gray-900 hover:border-orange-500 hover:bg-orange-50';
              
              if (answered) {
                if (isCorrectOption) {
                  buttonClass = 'bg-green-100 border-2 border-green-500 text-green-900';
                } else if (isSelected && !isCorrect) {
                  buttonClass = 'bg-red-100 border-2 border-red-500 text-red-900';
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => !answered && handleAnswer(option)}
                  disabled={answered}
                  className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition ${buttonClass} ${
                    answered ? 'cursor-default' : 'cursor-pointer'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {answered && (
            <div className={`p-4 rounded-xl mb-8 text-center font-semibold text-lg ${
              isCorrect
                ? 'bg-green-100 text-green-900'
                : 'bg-red-100 text-red-900'
            }`}>
              {isCorrect ? '✅ Richtig!' : '❌ Falsch!'}
            </div>
          )}

          {/* Next Button */}
          {answered && (
            <button
              onClick={handleNext}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-lg"
            >
              {isLastQuestion ? 'Batch abschließen' : 'Weiter →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { VOCABULARY_LIST, Vocabulary } from '../services/vocabularyService';

type DifficultyFilter = 'alle' | 'leicht' | 'mittel' | 'schwer';

export const VocabularyPage: React.FC = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>('alle');
  const [selectedVocab, setSelectedVocab] = useState<Vocabulary | null>(null);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVocabulary = useMemo(() => {
    let filtered = VOCABULARY_LIST;
    
    if (selectedDifficulty !== 'alle') {
      filtered = filtered.filter(v => v.difficulty === selectedDifficulty);
    }
    
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(v => 
        v.spanish.toLowerCase().includes(search) || 
        v.german.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }, [selectedDifficulty, searchTerm]);

  const stats = {
    alle: VOCABULARY_LIST.length,
    leicht: VOCABULARY_LIST.filter(v => v.difficulty === 'leicht').length,
    mittel: VOCABULARY_LIST.filter(v => v.difficulty === 'mittel').length,
    schwer: VOCABULARY_LIST.filter(v => v.difficulty === 'schwer').length,
  };

  const toggleLearned = (id: string) => {
    const newSet = new Set(learnedWords);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setLearnedWords(newSet);
  };

  const learnedPercentage = Math.round((learnedWords.size / VOCABULARY_LIST.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 Vokabeltrainer</h1>
          <p className="text-gray-600 mb-4">Lerne die 100 wichtigsten spanischen Wörter</p>
          
          {/* Progress Bar */}
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">Fortschritt</span>
              <span className="text-sm font-bold text-orange-600">{learnedPercentage}% ({learnedWords.size}/{VOCABULARY_LIST.length})</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-orange-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${learnedPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Suchfeld */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <input
            type="text"
            placeholder="Suche nach Wort (Spanisch oder Deutsch)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition"
          />
        </div>

        {/* Filter Buttons */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Schwierigkeitsstufe</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['alle', 'leicht', 'mittel', 'schwer'] as const).map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                  selectedDifficulty === difficulty
                    ? 'bg-orange-500 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg mb-1">
                    {difficulty === 'leicht' && '🟢'}
                    {difficulty === 'mittel' && '🟡'}
                    {difficulty === 'schwer' && '🔴'}
                    {difficulty === 'alle' && '📊'}
                  </span>
                  <div className="capitalize text-sm">{difficulty}</div>
                  <div className="text-xs mt-1 opacity-70">{stats[difficulty]} Wörter</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="mb-6 text-gray-600">
          <p className="text-sm">Zeige {filteredVocabulary.length} von {VOCABULARY_LIST.length} Wörtern</p>
        </div>

        {/* Vokabel Grid */}
        {filteredVocabulary.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVocabulary.map((vocab) => (
              <div
                key={vocab.id}
                onClick={() => setSelectedVocab(vocab)}
                className={`bg-white rounded-xl p-5 shadow-md hover:shadow-xl transition-all cursor-pointer border-2 ${
                  learnedWords.has(vocab.id)
                    ? 'border-green-500 bg-green-50'
                    : 'border-transparent hover:border-orange-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-4xl">{vocab.icon}</span>
                  {learnedWords.has(vocab.id) && (
                    <span className="text-green-500 text-2xl">✓</span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{vocab.spanish}</h3>
                <p className="text-gray-600 text-sm mb-3">{vocab.german}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                    {vocab.category}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    vocab.difficulty === 'leicht' ? 'bg-green-100 text-green-700' :
                    vocab.difficulty === 'mittel' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {vocab.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-600 text-lg">Keine Wörter gefunden 😅</p>
          </div>
        )}

        {/* Detail Modal */}
        {selectedVocab && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedVocab(null)}
          >
            <div
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">{selectedVocab.icon}</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {selectedVocab.spanish}
                </h2>
                <p className="text-xl text-gray-600 mb-2">{selectedVocab.german}</p>
                
                {selectedVocab.pronunciation && (
                  <p className="text-sm text-orange-600 italic mb-4">
                    Aussprache: {selectedVocab.pronunciation}
                  </p>
                )}

                <div className="bg-gray-100 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-2">Beispiel:</p>
                  <p className="text-gray-800 italic">
                    "{selectedVocab.example || 'Kein Beispiel verfügbar'}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600">Kategorie</p>
                    <p className="font-semibold text-gray-800 text-sm">{selectedVocab.category}</p>
                  </div>
                  <div className={`rounded-lg p-3 ${
                    selectedVocab.difficulty === 'leicht' ? 'bg-green-50' :
                    selectedVocab.difficulty === 'mittel' ? 'bg-yellow-50' :
                    'bg-red-50'
                  }`}>
                    <p className="text-xs text-gray-600">Schwierigkeit</p>
                    <p className="font-semibold text-gray-800 text-sm capitalize">
                      {selectedVocab.difficulty}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    toggleLearned(selectedVocab.id);
                    setSelectedVocab(null);
                  }}
                  className={`w-full py-3 rounded-lg font-semibold transition-all mb-3 ${
                    learnedWords.has(selectedVocab.id)
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  {learnedWords.has(selectedVocab.id) 
                    ? '✓ Gelernt - Entfernen'
                    : '📌 Als gelernt markieren'}
                </button>

                <button
                  onClick={() => setSelectedVocab(null)}
                  className="w-full py-2 text-gray-600 hover:text-gray-800"
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

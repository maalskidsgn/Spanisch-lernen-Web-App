import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Word {
  text: string;
  start: number;
}

interface TranscribeResponse {
  words: Word[];
  success: boolean;
  total_words: number;
  error?: string;
}

export const VideoGeneratorPage: React.FC = () => {
  const navigate = useNavigate();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState<Word[]>([]);
  const [error, setError] = useState('');
  const [selectedWords, setSelectedWords] = useState<Set<number>>(new Set());

  // API Backend URL - je nach Umgebung
  const getApiUrl = () => {
    if (window.location.hostname === 'app.spanisch-lernen.com') {
      // Production
      return 'https://api.spanisch-lernen.com';
    }
    // Development
    return process.env.REACT_APP_API_URL || 'http://localhost:8000';
  };

  const API_URL = getApiUrl();

  const handleTranscribe = async () => {
    if (!youtubeUrl.trim()) {
      setError('Bitte gib eine YouTube URL ein');
      return;
    }

    setLoading(true);
    setError('');
    setTranscript([]);

    try {
      console.log(`Sending request to: ${API_URL}/transcribe`);
      
      const response = await fetch(`${API_URL}/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: youtubeUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data: TranscribeResponse = await response.json();

      if (!data.success || data.error) {
        setError(data.error || 'Fehler beim Transkribieren');
      } else if (Array.isArray(data.words)) {
        setTranscript(data.words);
        setSelectedWords(new Set());
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unbekannter Fehler';
      setError(`Fehler: ${errorMsg}. Stelle sicher, dass der Backend läuft.`);
      console.error('Transcribe error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleWordSelection = (index: number) => {
    const newSelected = new Set(selectedWords);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedWords(newSelected);
  };

  const handleAddToVocabulary = () => {
    const selectedWordsArray = transcript.filter((_, i) => selectedWords.has(i));
    console.log('Zu Vokabeln hinzufügen:', selectedWordsArray);
    // TODO: Speichere in Firebase/Vocabulary
    alert(`${selectedWordsArray.length} Wörter hinzugefügt!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/')}
            className="mb-6 text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-2"
          >
            ← Zurück zur Startseite
          </button>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">🎬 Video Generator</h1>
          <p className="text-xl text-gray-600">
            Gib eine YouTube-URL ein um Vokabeln aus Videos zu lernen (wie LingQ)
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <div className="space-y-4">
            <label className="block text-lg font-semibold text-gray-900">
              YouTube URL eingeben
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTranscribe()}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none text-lg"
              />
              <button
                onClick={handleTranscribe}
                disabled={loading}
                className={`px-8 py-4 rounded-xl font-bold text-lg text-white transition whitespace-nowrap ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {loading ? '⏳ Lädt...' : '🎤 Transkribieren'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-100 border-2 border-red-500 rounded-xl text-red-900 font-semibold">
              ❌ {error}
            </div>
          )}

          {loading && (
            <div className="mt-6 p-4 bg-blue-100 border-2 border-blue-500 rounded-xl text-blue-900 font-semibold">
              ⏳ Transkribiere Video... (kann 1-2 Minuten dauern)
            </div>
          )}
        </div>

        {/* Transcript Section */}
        {transcript.length > 0 && (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                📝 Transkript ({transcript.length} Wörter)
              </h2>
              <button
                onClick={() => setTranscript([])}
                className="text-gray-600 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            {/* Words with click selection */}
            <div className="mb-8 p-6 bg-gray-50 rounded-2xl text-lg leading-relaxed text-gray-800 max-h-96 overflow-y-auto">
              {transcript.map((word, index) => (
                <span
                  key={index}
                  onClick={() => toggleWordSelection(index)}
                  className={`inline-block px-3 py-2 mr-2 mb-2 rounded-lg cursor-pointer transition font-medium ${
                    selectedWords.has(index)
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-white border-2 border-gray-300 hover:border-orange-500 hover:bg-orange-50'
                  }`}
                >
                  {word.text}
                </span>
              ))}
            </div>

            {/* Selected words summary */}
            {selectedWords.size > 0 && (
              <div className="mb-8 p-6 bg-orange-50 rounded-2xl border-2 border-orange-200">
                <h3 className="font-bold text-orange-900 mb-3 text-lg">
                  ✅ {selectedWords.size} Wörter ausgewählt:
                </h3>
                <p className="text-orange-800 text-lg mb-6 p-4 bg-white rounded-lg border border-orange-200">
                  {transcript
                    .filter((_, i) => selectedWords.has(i))
                    .map(w => w.text)
                    .join(', ')}
                </p>
                <button
                  onClick={handleAddToVocabulary}
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-xl font-bold text-lg transition shadow-lg"
                >
                  💾 Zu Vokabeln hinzufügen
                </button>
              </div>
            )}

            {selectedWords.size === 0 && (
              <div className="text-center text-gray-600 text-sm p-4">
                👆 Klick auf Wörter um sie auszuwählen
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && transcript.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🎥</div>
            <p className="text-2xl text-gray-600 mb-4">Starten Sie mit einer YouTube-URL</p>
            <p className="text-lg text-gray-500">
              Beispiel: https://www.youtube.com/watch?v=dQw4w9WgXcQ
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

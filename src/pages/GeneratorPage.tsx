import React from 'react';
import { Button, Card } from '../components/shared/UI';

interface GeneratedVideo {
  id: string;
  title: string;
  topic: string;
  language: string;
  thumbnail: string;
  duration: number;
  created: string;
  script?: string;
  videoUrl?: string;
}

export const GeneratorPage: React.FC = () => {
  const [videoTitle, setVideoTitle] = React.useState('');
  const [topic, setTopic] = React.useState('');
  const [language, setLanguage] = React.useState('spanish');
  const [generating, setGenerating] = React.useState(false);
  const [generatedVideos, setGeneratedVideos] = React.useState<GeneratedVideo[]>([]);
  const [error, setError] = React.useState('');
  const [selectedVideo, setSelectedVideo] = React.useState<GeneratedVideo | null>(null);

  // Generiere einen Video-Script mit OpenAI oder einem einfachen Template
  const generateVideoScript = async (title: string, topic: string, lang: string): Promise<string> => {
    try {
      // Fallback: Template-basierter Script
      const templates: { [key: string]: string } = {
        spanish: `
🎬 Video: ${title}
📚 Thema: ${topic}

[INTRO - 0:00-0:10]
¡Hola! Bienvenido a nuestro video sobre ${topic}. Hoy vamos a aprender...

[HAUPTTEIL - 0:10-3:00]
Hier sind die wichtigsten Punkte zu ${topic}:
1. Grundkonzepte
2. Praktische Beispiele
3. Häufige Fehler

[OUTRO - 3:00-3:30]
Danke, dass du zugesehen hast! Übe das gelernte...
        `,
        english: `
🎬 Video: ${title}
📚 Topic: ${topic}

[INTRO - 0:00-0:10]
Hello! Welcome to our video about ${topic}. Today we'll learn...

[MAIN PART - 0:10-3:00]
Here are the key points about ${topic}:
1. Basic concepts
2. Practical examples
3. Common mistakes

[OUTRO - 3:00-3:30]
Thanks for watching! Practice what you learned...
        `,
        french: `
🎬 Vidéo: ${title}
📚 Sujet: ${topic}

[INTRO - 0:00-0:10]
Bonjour! Bienvenue dans notre vidéo sur ${topic}. Aujourd'hui, nous allons apprendre...

[PARTIE PRINCIPALE - 0:10-3:00]
Voici les points clés sur ${topic}:
1. Concepts de base
2. Exemples pratiques
3. Erreurs courantes

[OUTRO - 3:00-3:30]
Merci d'avoir regardé! Pratiquez ce que vous avez appris...
        `,
      };

      return templates[lang] || templates['spanish'];
    } catch (err) {
      console.error('Script generation error:', err);
      throw new Error('Script konnte nicht generiert werden');
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoTitle || !topic) {
      setError('Bitte fülle alle Felder aus');
      return;
    }

    setError('');
    setGenerating(true);

    try {
      // Generiere den Script
      const script = await generateVideoScript(videoTitle, topic, language);

      // Simuliere Video-Generierung (3-5 Sekunden)
      await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));

      const newVideo: GeneratedVideo = {
        id: Date.now().toString(),
        title: videoTitle,
        topic,
        language,
        thumbnail: '🎬',
        duration: Math.floor(Math.random() * 5) + 3,
        created: new Date().toLocaleDateString('de-DE'),
        script: script,
        videoUrl: `https://www.youtube.com/embed/dQw4w9WgXcQ?start=${Math.random() * 100}`, // Placeholder
      };

      setGeneratedVideos([newVideo, ...generatedVideos]);
      setVideoTitle('');
      setTopic('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Generieren des Videos');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-orange-500 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">🤖 KI Video Generator</h1>
          <p className="text-xl opacity-90">
            Erstelle automatisch Lernvideos zu deinen Themen
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            <p className="font-semibold">❌ Fehler</p>
            <p>{error}</p>
          </div>
        )}

        {/* Input Form */}
        <Card className="mb-12 bg-white shadow-lg">
          <h2 className="text-2xl font-bold text-secondary mb-6">Neues Video erstellen</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Video Titel
              </label>
              <input
                type="text"
                value={videoTitle}
                onChange={e => setVideoTitle(e.target.value)}
                placeholder="z.B. Spanische Zahlen 1-20"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Thema
              </label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="z.B. Zahlen, Farben, Tiere..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Sprache
              </label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="spanish">Spanisch</option>
                <option value="english">Englisch</option>
                <option value="french">Französisch</option>
              </select>
            </div>

            <Button
              onClick={handleGenerateVideo}
              disabled={generating}
              size="lg"
              className="w-full"
            >
              {generating ? '⏳ Generiere Video...' : '🚀 Video erstellen'}
            </Button>
          </div>
        </Card>

        {/* Generated Videos */}
        {generatedVideos.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-secondary mb-6">Deine generierten Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedVideos.map(video => (
                <Card key={video.id} className="hover:shadow-xl transition-shadow">
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-3">{video.thumbnail}</div>
                    <h3 className="text-xl font-bold text-secondary mb-2">{video.title}</h3>
                    <p className="text-text-secondary mb-3">Thema: {video.topic}</p>
                    <div className="flex gap-2 justify-center mb-4">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                        {video.language === 'spanish'
                          ? '🇪🇸 Spanisch'
                          : video.language === 'english'
                          ? '🇬🇧 Englisch'
                          : '🇫🇷 Französisch'}
                      </span>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-text-secondary">
                        ⏱️ {video.duration} Min
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mb-4">Erstellt: {video.created}</p>
                  </div>

                  <Button 
                    onClick={() => setSelectedVideo(video)}
                    className="w-full" 
                    variant="primary"
                  >
                    ▶️ Ansehen
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {generatedVideos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-text-secondary">
              Erstelle dein erstes Video um es hier zu sehen! 🎥
            </p>
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden">
            {/* Video Player */}
            <div className="bg-black w-full aspect-video flex items-center justify-center relative">
              <iframe
                width="100%"
                height="100%"
                src={`${selectedVideo.videoUrl}?autoplay=1`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ aspectRatio: '16/9' }}
              ></iframe>
            </div>

            {/* Video Info */}
            <div className="p-8">
              <h2 className="text-3xl font-bold text-secondary mb-2">{selectedVideo.title}</h2>
              <p className="text-text-secondary mb-4">Thema: {selectedVideo.topic}</p>

              <div className="flex gap-3 mb-6">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                  {selectedVideo.language === 'spanish'
                    ? '🇪🇸 Spanisch'
                    : selectedVideo.language === 'english'
                    ? '🇬🇧 Englisch'
                    : '🇫🇷 Französisch'}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-text-secondary">
                  ⏱️ {selectedVideo.duration} Min
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">
                  📅 {selectedVideo.created}
                </span>
              </div>

              {/* Script Section */}
              {selectedVideo.script && (
                <div className="mb-6">
                  <h3 className="font-bold text-secondary mb-3">📝 Video-Script</h3>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm text-text-secondary max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {selectedVideo.script}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    // Download Video-Script
                    const element = document.createElement('a');
                    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(selectedVideo.script || '')}`);
                    element.setAttribute('download', `${selectedVideo.title}.txt`);
                    element.style.display = 'none';
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="flex-1"
                  variant="secondary"
                >
                  📥 Script herunterladen
                </Button>
                <Button
                  onClick={() => setSelectedVideo(null)}
                  className="flex-1"
                  variant="primary"
                >
                  ✕ Schließen
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

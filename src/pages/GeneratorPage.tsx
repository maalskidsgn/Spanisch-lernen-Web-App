import React from 'react';
import { Button, Card } from '../components/shared/UI';

export const GeneratorPage: React.FC = () => {
  const [videoTitle, setVideoTitle] = React.useState('');
  const [topic, setTopic] = React.useState('');
  const [language, setLanguage] = React.useState('spanish');
  const [generating, setGenerating] = React.useState(false);
  const [generatedVideos, setGeneratedVideos] = React.useState<any[]>([]);

  const handleGenerateVideo = () => {
    if (!videoTitle || !topic) {
      alert('Bitte fülle alle Felder aus');
      return;
    }

    setGenerating(true);

    // Simuliere Video-Generierung (In der Realität würde hier eine KI-API aufgerufen)
    setTimeout(() => {
      const newVideo = {
        id: Date.now().toString(),
        title: videoTitle,
        topic,
        language,
        thumbnail: '🎬',
        duration: Math.floor(Math.random() * 10) + 5,
        created: new Date().toLocaleDateString('de-DE'),
      };

      setGeneratedVideos([newVideo, ...generatedVideos]);
      setVideoTitle('');
      setTopic('');
      setGenerating(false);
    }, 2000);
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

                  <Button className="w-full" variant="primary">
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
    </div>
  );
};

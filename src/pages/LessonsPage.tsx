import React from 'react';
import { Button, Card } from '../components/shared/UI';
import { lessonsData } from '../data/vocabularyData';

export const LessonsPage: React.FC = () => {
  const [completedLessons, setCompletedLessons] = React.useState<string[]>([]);

  const handleLessonClick = (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons([...completedLessons, lessonId]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary to-blue-700 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">Spanisch Lektionen</h1>
          <p className="text-xl opacity-90">
            Strukturiertes Lernen mit umfassenden Lektionen
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lessonsData.map(lesson => {
            const isCompleted = completedLessons.includes(lesson.id);

            return (
              <Card
                key={lesson.id}
                onClick={() => handleLessonClick(lesson.id)}
                className="hover:shadow-xl transition-all duration-300 border-l-4 border-primary"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-secondary mb-2">{lesson.title}</h3>
                    <p className="text-text-secondary mb-3">{lesson.description}</p>
                  </div>
                  {isCompleted && <div className="text-3xl">✓</div>}
                </div>

                <div className="flex gap-2 mb-4">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      lesson.level === 'beginner'
                        ? 'bg-green-100 text-green-700'
                        : lesson.level === 'intermediate'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {lesson.level === 'beginner'
                      ? 'Anfänger'
                      : lesson.level === 'intermediate'
                      ? 'Mittelstufe'
                      : 'Fortgeschrittene'}
                  </span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                    ⏱️ {lesson.duration} Min
                  </span>
                </div>

                <Button
                  variant={isCompleted ? 'secondary' : 'primary'}
                  className="w-full"
                  onClick={() => handleLessonClick(lesson.id)}
                >
                  {isCompleted ? 'Abgeschlossen ✓' : 'Lektion starten'}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center bg-gradient-to-br from-primary to-primary-dark text-white">
            <p className="text-sm opacity-90 mb-2">Abgeschlossene Lektionen</p>
            <p className="text-4xl font-bold">{completedLessons.length}</p>
          </Card>
          <Card className="text-center bg-gradient-to-br from-secondary to-blue-700 text-white">
            <p className="text-sm opacity-90 mb-2">Gesamtlektionen</p>
            <p className="text-4xl font-bold">{lessonsData.length}</p>
          </Card>
          <Card className="text-center bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <p className="text-sm opacity-90 mb-2">Fortschritt</p>
            <p className="text-4xl font-bold">
              {Math.round((completedLessons.length / lessonsData.length) * 100)}%
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

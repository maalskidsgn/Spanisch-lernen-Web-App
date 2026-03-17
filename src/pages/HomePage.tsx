import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/shared/UI';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex flex-col items-center justify-center px-4">
      {/* Hero Section - Minimalist */}
      <div className="text-center mb-16 max-w-2xl">
        <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary mb-6">
          Spanisch Meistern
        </h1>
        <p className="text-2xl text-text-secondary font-light mb-2">
          Intelligent. Modern. Effektiv.
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mb-8"></div>
        <p className="text-lg text-text-secondary leading-relaxed">
          Lerne Spanisch mit unserem intelligenten Vokabeltrainer, angetrieben durch Spaced Repetition und KI-generierte Videos.
        </p>
      </div>

      {/* Feature Cards - Grid with Hover Effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-12">
        {/* Vokabeltrainer Card */}
        <button
          onClick={() => navigate('/vocabulary')}
          className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 hover:border-primary"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-3xl font-bold text-secondary mb-3 group-hover:text-primary transition-colors">
              Vokabeltrainer
            </h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              Intelligente Wiederholungen mit dem SM-2 Algorithmus. Lerne schneller, merke dir mehr.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-primary">Mit Spaced Repetition</span>
              <span className="text-2xl group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </div>
        </button>

        {/* KI Video Generator Card */}
        <button
          onClick={() => navigate('/generator')}
          className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 hover:border-accent"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-3xl font-bold text-secondary mb-3 group-hover:text-accent transition-colors">
              KI Video Generator
            </h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              Erstelle automatisch Lernvideos zu beliebigen Themen mit künstlicher Intelligenz.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-accent">Mit OpenAI</span>
              <span className="text-2xl group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </div>
        </button>
      </div>

      {/* Stats Section - Minimal */}
      <div className="bg-white rounded-2xl p-8 w-full max-w-4xl shadow-lg border border-gray-100">
        <h3 className="text-2xl font-bold text-secondary mb-8 text-center">Warum unser System?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-5xl mb-3">⚡</div>
            <h4 className="font-semibold text-secondary mb-2">60% schneller</h4>
            <p className="text-sm text-text-secondary">
              Der SM-2 Algorithmus ist wissenschaftlich optimiert für effizientes Lernen
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-5xl mb-3">🎯</div>
            <h4 className="font-semibold text-secondary mb-2">Präzise</h4>
            <p className="text-sm text-text-secondary">
              Adaptive Wiederholungen basierend auf deinem Lernfortschritt
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-5xl mb-3">🚀</div>
            <h4 className="font-semibold text-secondary mb-2">Modern</h4>
            <p className="text-sm text-text-secondary">
              Mit KI-generierten Videos und intelligenter Technologie
            </p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-12 text-center">
        <p className="text-text-secondary mb-4 text-lg">
          Starte jetzt deine Lernreise
        </p>
        <Button
          onClick={() => navigate('/vocabulary')}
          className="px-12 py-4 text-lg rounded-full shadow-lg hover:shadow-2xl transition-all"
        >
          Los geht's →
        </Button>
      </div>
    </div>
  );
};

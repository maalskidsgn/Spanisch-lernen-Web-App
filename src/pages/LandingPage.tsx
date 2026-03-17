import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';

// 3D Komponenten
const RotatingGlobe: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.001;
      meshRef.current.rotation.y += 0.003;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1.5, 64, 64]}>
      <meshPhongMaterial
        color="#FF6C00"
        emissive="#FF6C00"
        emissiveIntensity={0.2}
      />
    </Sphere>
  );
};

const FloatingBoxes: React.FC = () => {
  const boxes = [
    { offset: 0, scale: 0.8 },
    { offset: 120, scale: 0.6 },
    { offset: 240, scale: 0.7 },
  ];

  return (
    <>
      {boxes.map((box, i) => (
        <FloatingBox key={i} offset={box.offset} scale={box.scale} />
      ))}
    </>
  );
};

const FloatingBox: React.FC<{ offset: number; scale: number }> = ({
  offset,
  scale,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y =
        Math.sin(clock.elapsedTime + offset * 0.01) * 0.5;
      meshRef.current.rotation.x += 0.003;
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <Box
      ref={meshRef}
      args={[0.8 * scale, 0.8 * scale, 0.8 * scale]}
      position={[offset * 0.01 - 1.2, 0, 0]}
    >
      <meshStandardMaterial color="#000041" roughness={0.4} metalness={0.6} />
    </Box>
  );
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = React.useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          scrollContainerRef.current;
        const progress = scrollTop / (scrollHeight - clientHeight);
        setScrollProgress(Math.min(progress, 1));
      }
    };

    const container = scrollContainerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full bg-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100 font-sans">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <img src="/logo.svg" alt="Logo" className="h-8" />
          <div className="flex gap-6 items-center">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-600 hover:text-gray-900 font-semibold"
            >
              Anmelden
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Registrieren
            </button>
          </div>
        </div>
      </nav>

      <div ref={scrollContainerRef} className="h-screen overflow-y-scroll">
        {/* Hero Section */}
        <section className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-4 pt-20">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6">
                Spanisch lernen,
                <span className="text-orange-500"> intelligent</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Lerne mit wissenschaftlich optimierten Spaced Repetition Algorithmen.
                Schneller merken. Länger behalten.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-orange-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-orange-600 transition shadow-lg"
                >
                  Kostenlos starten
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="border-2 border-orange-500 text-orange-500 px-8 py-4 rounded-lg font-bold text-lg hover:bg-orange-50 transition"
                >
                  Anmelden
                </button>
              </div>
            </div>

            {/* 3D Scene */}
            <div className="h-96 rounded-2xl overflow-hidden shadow-2xl">
              <Canvas>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <RotatingGlobe />
                <OrbitControls
                  enableZoom={false}
                  autoRotate
                  autoRotateSpeed={2}
                />
              </Canvas>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="min-h-screen bg-white flex items-center justify-center px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl font-bold text-center text-gray-900 mb-20">
              So funktioniert dein Lernen
            </h2>

            <div className="grid md:grid-cols-3 gap-8 mb-20">
              {[
                {
                  num: '1',
                  icon: '📚',
                  title: 'Vokabeln Entdecken',
                  desc: 'Starten mit 100 wichtigen Grundwörtern oder wähle eigene Vokabeln',
                  color: 'bg-blue-50',
                },
                {
                  num: '2',
                  icon: '🧠',
                  title: 'SM-2 Algorithmus',
                  desc: 'Unser System passt sich an dein Lerntempo an und optimiert Wiederholungen',
                  color: 'bg-purple-50',
                },
                {
                  num: '3',
                  icon: '🎯',
                  title: 'Fließend Sprechen',
                  desc: 'Trainiere täglich 10-15 Min. und erreiche deine Ziele in Wochen',
                  color: 'bg-green-50',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className={`${feature.color} rounded-2xl p-8 transition-all hover:shadow-lg hover:scale-105`}
                >
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <div className="text-3xl font-bold text-orange-500 mb-3">
                    {feature.num}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* 3D Interactive Section */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12 text-white mb-20">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-4xl font-bold mb-6">
                    Intelligente Wiederholungen
                  </h3>
                  <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                    Der SM-2 Algorithmus berechnet für jedes Wort den perfekten
                    Zeitpunkt für die nächste Wiederholung. Kein unnötiges
                    Wiederholen, nur das was zählt.
                  </p>
                  <ul className="space-y-3">
                    {[
                      '✓ Adaptive Intervalle',
                      '✓ Wissenschaftlich optimiert',
                      '✓ Supermemo 2 Algorithmus',
                      '✓ 60% schneller als traditionelles Lernen',
                    ].map((item, i) => (
                      <li key={i} className="text-lg">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="h-96 rounded-2xl overflow-hidden">
                  <Canvas>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <FloatingBoxes />
                    <OrbitControls
                      enableZoom={false}
                      autoRotate
                      autoRotateSpeed={1}
                    />
                  </Canvas>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* KI Section */}
        <section className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-4 py-20">
          <div className="max-w-6xl mx-auto w-full">
            <h2 className="text-5xl font-bold text-center text-gray-900 mb-16">
              KI-generierte Lernvideos
            </h2>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
                <h3 className="text-3xl font-bold text-gray-900">
                  Videos nach deinen Wünschen
                </h3>
                <p className="text-lg text-gray-600">
                  Erstelle Lernvideos zu beliebigen Themen mit unserem KI Video
                  Generator. Perfekt zum Vertiefen und Üben.
                </p>
                <div className="space-y-4">
                  {[
                    'Automatische Generierung',
                    'Beliebige Sprachen',
                    'Custom Themen',
                    'Direkt zum Lernen verfügbar',
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-orange-500 text-2xl">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl h-96 flex items-center justify-center text-white text-center p-8">
                <div>
                  <div className="text-6xl mb-4">🎬</div>
                  <h4 className="text-2xl font-bold mb-2">
                    Lernvideos in Sekunden
                  </h4>
                  <p>Generiert mit künstlicher Intelligenz</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-6xl font-bold mb-6">
              Bereit, Spanisch zu meistern?
            </h2>
            <p className="text-2xl text-gray-300 mb-12">
              Starte heute kostenlos. Keine Kreditkarte erforderlich.
            </p>

            <button
              onClick={() => navigate('/signup')}
              className="bg-orange-500 text-white px-12 py-5 rounded-lg font-bold text-xl hover:bg-orange-600 transition shadow-lg mb-6"
            >
              Jetzt Registrieren
            </button>
            <p className="text-gray-400">Oder {' '}
              <button
                onClick={() => navigate('/login')}
                className="text-orange-400 hover:text-orange-300 underline"
              >
                melde dich an
              </button>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

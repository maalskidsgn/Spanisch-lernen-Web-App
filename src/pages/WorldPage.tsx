import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import GlobeComponent from '../components/3D/Globe';
import CountryPopup from '../components/CountryPopup';
import { Navbar } from '../components/layout/Navbar';

export interface Country {
  name: string;
  coordinates: [number, number]; // [latitude, longitude]
  description: string;
  flag: string;
  speakers: string;
  capital: string;
}

const SPANISH_COUNTRIES: Country[] = [
  {
    name: 'Spanien',
    coordinates: [40.463667, -3.74922],
    description: 'Das Geburtsland der spanischen Sprache. Mit einer reichen Geschichte, Kultur und moderner Architektur.',
    flag: '🇪🇸',
    speakers: '47 Millionen Einwohner',
    capital: 'Madrid',
  },
  {
    name: 'Mexiko',
    coordinates: [23.6345, -102.5528],
    description: 'Das größte spanischsprachige Land der Welt. Bekannt für seine präkolumbische Kultur und lebendige Traditionen.',
    flag: '🇲🇽',
    speakers: '128 Millionen Einwohner',
    capital: 'Mexiko-Stadt',
  },
  {
    name: 'Argentinien',
    coordinates: [-38.4161, -63.6167],
    description: 'Ein großes südamerikanisches Land mit italienischem Einfluss. Heimat des Tangos und beeindruckender Landschaften.',
    flag: '🇦🇷',
    speakers: '46 Millionen Einwohner',
    capital: 'Buenos Aires',
  },
  {
    name: 'Kolumbien',
    coordinates: [4.5709, -74.2973],
    description: 'Die magische Realität der Andes. Bekannt für Kaffee, Biodiversität und freundliche Menschen.',
    flag: '🇨🇴',
    speakers: '52 Millionen Einwohner',
    capital: 'Bogotá',
  },
  {
    name: 'Peru',
    coordinates: [-9.19, -75.0152],
    description: 'Das Land der Inkas. Machu Picchu, Amazon und alte Zivilisationen prägen dieses mystische Land.',
    flag: '🇵🇪',
    speakers: '34 Millionen Einwohner',
    capital: 'Lima',
  },
  {
    name: 'Chile',
    coordinates: [-35.6751, -71.543],
    description: 'Ein langes, schmales Land in Südamerika mit extremen Landschaften - von der Atacama bis zur Antarktis.',
    flag: '🇨🇱',
    speakers: '19 Millionen Einwohner',
    capital: 'Santiago',
  },
  {
    name: 'Venezuela',
    coordinates: [6.4238, -66.5897],
    description: 'Das Land mit den größten Ölreserven. Bekannt für die Angel Falls und reiche Biodiversität.',
    flag: '🇻🇪',
    speakers: '28 Millionen Einwohner',
    capital: 'Caracas',
  },
  {
    name: 'Ecuador',
    coordinates: [-1.8312, -78.1834],
    description: 'Ein kleineres Land mit großer Vielfalt. Der Äquator verläuft durch das Land und die Galápagos-Inseln gehören dazu.',
    flag: '🇪🇨',
    speakers: '18 Millionen Einwohner',
    capital: 'Quito',
  },
  {
    name: 'Kuba',
    coordinates: [21.5218, -77.7812],
    description: 'Die größte karibische Insel mit einzigartiger Kultur, Musik und Geschichte.',
    flag: '🇨🇺',
    speakers: '11 Millionen Einwohner',
    capital: 'Havanna',
  },
  {
    name: 'Dominikanische Republik',
    coordinates: [18.7357, -70.1627],
    description: 'Ein tropisches Karibikparadies mit wunderschönen Stränden und reicher Kultur.',
    flag: '🇩🇴',
    speakers: '11 Millionen Einwohner',
    capital: 'Santo Domingo',
  },
];

const WorldPage: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              🌍 Spanische Welt
            </h1>
            <p className="text-gray-600 text-lg">
              Erkunde die Länder, in denen Spanisch gesprochen wird
            </p>
          </div>

          {/* 3D Globe Container */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-[600px] mb-8">
            <Canvas camera={{ position: [0, 0, 2.5], fov: 50 }}>
              <GlobeComponent countries={SPANISH_COUNTRIES} onCountryClick={setSelectedCountry} />
            </Canvas>
          </div>

          {/* Countries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SPANISH_COUNTRIES.map((country) => (
              <div
                key={country.name}
                onClick={() => setSelectedCountry(country)}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer transform hover:scale-105"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{country.flag}</span>
                  <h3 className="text-xl font-bold text-gray-900">{country.name}</h3>
                </div>
                <p className="text-sm text-gray-600">{country.capital}</p>
                <p className="text-xs text-gray-500 mt-2">{country.speakers}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Country Popup */}
      {selectedCountry && (
        <CountryPopup country={selectedCountry} onClose={() => setSelectedCountry(null)} />
      )}
    </div>
  );
};

export default WorldPage;

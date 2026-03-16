import React from 'react';
import { Country } from '../pages/WorldPage';

interface CountryPopupProps {
  country: Country;
  onClose: () => void;
}

const CountryPopup: React.FC<CountryPopupProps> = ({ country, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
        {/* Header with Flag */}
        <div className="bg-gradient-to-r from-primary to-primary-dark p-8 text-white">
          <div className="text-6xl mb-4 text-center">{country.flag}</div>
          <h2 className="text-3xl font-bold text-center">{country.name}</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Capital */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Hauptstadt
            </h3>
            <p className="text-lg text-gray-900 font-medium">{country.capital}</p>
          </div>

          {/* Speakers */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Einwohner
            </h3>
            <p className="text-lg text-gray-900 font-medium">{country.speakers}</p>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Über dieses Land
            </h3>
            <p className="text-gray-700 leading-relaxed">{country.description}</p>
          </div>

          {/* Coordinates */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Koordinaten
            </h3>
            <p className="text-sm text-gray-600">
              {country.coordinates[0].toFixed(2)}° N, {country.coordinates[1].toFixed(2)}° E
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Schließen
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition"
          >
            Mehr erfahren
          </button>
        </div>
      </div>
    </div>
  );
};

export default CountryPopup;

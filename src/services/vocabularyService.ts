export interface Vocabulary {
  id: string;
  spanish: string;
  german: string;
  icon: string;
  difficulty: 'leicht' | 'mittel' | 'schwer';
  category: string;
  example?: string;
  pronunciation?: string;
}

export const VOCABULARY_LIST: Vocabulary[] = [
  // Leichte Wörter (Grundlagen)
  { id: '1', spanish: 'Hola', german: 'Hallo', icon: '👋', difficulty: 'leicht', category: 'Grüße', pronunciation: 'OH-la' },
  { id: '2', spanish: 'Adiós', german: 'Auf Wiedersehen', icon: '👋', difficulty: 'leicht', category: 'Grüße', pronunciation: 'ah-dee-OHS' },
  { id: '3', spanish: 'Por favor', german: 'Bitte', icon: '🙏', difficulty: 'leicht', category: 'Höflichkeit', pronunciation: 'por fah-VOR' },
  { id: '4', spanish: 'Gracias', german: 'Danke', icon: '🙏', difficulty: 'leicht', category: 'Höflichkeit', pronunciation: 'GRAH-see-ahs' },
  { id: '5', spanish: 'De nada', german: 'Gerne', icon: '😊', difficulty: 'leicht', category: 'Höflichkeit', pronunciation: 'deh NAH-dah' },
  { id: '6', spanish: 'Sí', german: 'Ja', icon: '✅', difficulty: 'leicht', category: 'Antworten', pronunciation: 'see' },
  { id: '7', spanish: 'No', german: 'Nein', icon: '❌', difficulty: 'leicht', category: 'Antworten', pronunciation: 'no' },
  { id: '8', spanish: 'Perdón', german: 'Entschuldigung', icon: '😔', difficulty: 'leicht', category: 'Höflichkeit', pronunciation: 'per-DOHN' },
  { id: '9', spanish: 'Buenas noches', german: 'Guten Nacht', icon: '🌙', difficulty: 'leicht', category: 'Grüße', pronunciation: 'bweh-nas NOH-ches' },
  { id: '10', spanish: 'Buenos días', german: 'Guten Morgen', icon: '🌅', difficulty: 'leicht', category: 'Grüße', pronunciation: 'bweh-nos DEE-ahs' },

  // Zahlen
  { id: '11', spanish: 'Uno', german: 'Eins', icon: '1️⃣', difficulty: 'leicht', category: 'Zahlen', pronunciation: 'OO-no' },
  { id: '12', spanish: 'Dos', german: 'Zwei', icon: '2️⃣', difficulty: 'leicht', category: 'Zahlen', pronunciation: 'dos' },
  { id: '13', spanish: 'Tres', german: 'Drei', icon: '3️⃣', difficulty: 'leicht', category: 'Zahlen', pronunciation: 'tres' },
  { id: '14', spanish: 'Cuatro', german: 'Vier', icon: '4️⃣', difficulty: 'leicht', category: 'Zahlen', pronunciation: 'KWAH-tro' },
  { id: '15', spanish: 'Cinco', german: 'Fünf', icon: '5️⃣', difficulty: 'leicht', category: 'Zahlen', pronunciation: 'SEEN-ko' },
  { id: '16', spanish: 'Seis', german: 'Sechs', icon: '6️⃣', difficulty: 'leicht', category: 'Zahlen', pronunciation: 'says' },
  { id: '17', spanish: 'Siete', german: 'Sieben', icon: '7️⃣', difficulty: 'leicht', category: 'Zahlen', pronunciation: 'see-EH-teh' },
  { id: '18', spanish: 'Ocho', german: 'Acht', icon: '8️⃣', difficulty: 'leicht', category: 'Zahlen', pronunciation: 'OH-cho' },
  { id: '19', spanish: 'Nueve', german: 'Neun', icon: '9️⃣', difficulty: 'leicht', category: 'Zahlen', pronunciation: 'noo-EH-veh' },
  { id: '20', spanish: 'Diez', german: 'Zehn', icon: '🔟', difficulty: 'leicht', category: 'Zahlen', pronunciation: 'dee-EHS' },

  // Farben
  { id: '21', spanish: 'Rojo', german: 'Rot', icon: '🔴', difficulty: 'leicht', category: 'Farben', pronunciation: 'ROH-ho' },
  { id: '22', spanish: 'Azul', german: 'Blau', icon: '🔵', difficulty: 'leicht', category: 'Farben', pronunciation: 'ah-SOOL' },
  { id: '23', spanish: 'Verde', german: 'Grün', icon: '🟢', difficulty: 'leicht', category: 'Farben', pronunciation: 'VER-deh' },
  { id: '24', spanish: 'Amarillo', german: 'Gelb', icon: '🟡', difficulty: 'leicht', category: 'Farben', pronunciation: 'ah-mah-REE-yo' },
  { id: '25', spanish: 'Negro', german: 'Schwarz', icon: '⚫', difficulty: 'leicht', category: 'Farben', pronunciation: 'NEH-gro' },
  { id: '26', spanish: 'Blanco', german: 'Weiß', icon: '⚪', difficulty: 'leicht', category: 'Farben', pronunciation: 'BLAHN-ko' },
  { id: '27', spanish: 'Naranja', german: 'Orange', icon: '🟠', difficulty: 'leicht', category: 'Farben', pronunciation: 'nah-RAHN-ha' },
  { id: '28', spanish: 'Rosa', german: 'Rosa', icon: '🩷', difficulty: 'leicht', category: 'Farben', pronunciation: 'ROH-sah' },

  // Tiere
  { id: '29', spanish: 'Gato', german: 'Katze', icon: '🐱', difficulty: 'leicht', category: 'Tiere', pronunciation: 'GAH-to' },
  { id: '30', spanish: 'Perro', german: 'Hund', icon: '🐕', difficulty: 'leicht', category: 'Tiere', pronunciation: 'PEH-ro' },
  { id: '31', spanish: 'Pájaro', german: 'Vogel', icon: '🐦', difficulty: 'leicht', category: 'Tiere', pronunciation: 'PAH-ha-ro' },
  { id: '32', spanish: 'Pez', german: 'Fisch', icon: '🐠', difficulty: 'leicht', category: 'Tiere', pronunciation: 'pehs' },
  { id: '33', spanish: 'Caballo', german: 'Pferd', icon: '🐴', difficulty: 'leicht', category: 'Tiere', pronunciation: 'kah-BAH-yo' },
  { id: '34', spanish: 'Vaca', german: 'Kuh', icon: '🐄', difficulty: 'leicht', category: 'Tiere', pronunciation: 'VAH-kah' },
  { id: '35', spanish: 'Cerdo', german: 'Schwein', icon: '🐷', difficulty: 'leicht', category: 'Tiere', pronunciation: 'SER-do' },
  { id: '36', spanish: 'Oso', german: 'Bär', icon: '🐻', difficulty: 'leicht', category: 'Tiere', pronunciation: 'OH-so' },

  // Körperteile
  { id: '37', spanish: 'Cabeza', german: 'Kopf', icon: '🧠', difficulty: 'mittel', category: 'Körper', pronunciation: 'kah-beh-sah' },
  { id: '38', spanish: 'Ojo', german: 'Auge', icon: '👁️', difficulty: 'mittel', category: 'Körper', pronunciation: 'OH-ho' },
  { id: '39', spanish: 'Oído', german: 'Ohr', icon: '👂', difficulty: 'mittel', category: 'Körper', pronunciation: 'oh-EE-do' },
  { id: '40', spanish: 'Nariz', german: 'Nase', icon: '👃', difficulty: 'mittel', category: 'Körper', pronunciation: 'nah-REES' },
  { id: '41', spanish: 'Boca', german: 'Mund', icon: '👄', difficulty: 'mittel', category: 'Körper', pronunciation: 'BOH-kah' },
  { id: '42', spanish: 'Diente', german: 'Zahn', icon: '🦷', difficulty: 'mittel', category: 'Körper', pronunciation: 'dee-EHN-teh' },
  { id: '43', spanish: 'Mano', german: 'Hand', icon: '✋', difficulty: 'mittel', category: 'Körper', pronunciation: 'MAH-no' },
  { id: '44', spanish: 'Brazo', german: 'Arm', icon: '💪', difficulty: 'mittel', category: 'Körper', pronunciation: 'BRAH-so' },
  { id: '45', spanish: 'Pierna', german: 'Bein', icon: '🦵', difficulty: 'mittel', category: 'Körper', pronunciation: 'pee-EHR-nah' },
  { id: '46', spanish: 'Pie', german: 'Fuß', icon: '🦶', difficulty: 'mittel', category: 'Körper', pronunciation: 'pee-eh' },

  // Essen & Trinken
  { id: '47', spanish: 'Pan', german: 'Brot', icon: '🍞', difficulty: 'leicht', category: 'Essen', pronunciation: 'pahn' },
  { id: '48', spanish: 'Agua', german: 'Wasser', icon: '💧', difficulty: 'leicht', category: 'Getränke', pronunciation: 'AH-gwah' },
  { id: '49', spanish: 'Leche', german: 'Milch', icon: '🥛', difficulty: 'leicht', category: 'Getränke', pronunciation: 'LEH-cheh' },
  { id: '50', spanish: 'Queso', german: 'Käse', icon: '🧀', difficulty: 'leicht', category: 'Essen', pronunciation: 'KEH-so' },
  { id: '51', spanish: 'Manzana', german: 'Apfel', icon: '🍎', difficulty: 'leicht', category: 'Essen', pronunciation: 'mahn-sah-nah' },
  { id: '52', spanish: 'Plátano', german: 'Banane', icon: '🍌', difficulty: 'leicht', category: 'Essen', pronunciation: 'PLAH-tah-no' },
  { id: '53', spanish: 'Naranja', german: 'Orange', icon: '🍊', difficulty: 'leicht', category: 'Essen', pronunciation: 'nah-RAHN-ha' },
  { id: '54', spanish: 'Fresa', german: 'Erdbeere', icon: '🍓', difficulty: 'leicht', category: 'Essen', pronunciation: 'FREH-sah' },
  { id: '55', spanish: 'Pollo', german: 'Huhn', icon: '🍗', difficulty: 'mittel', category: 'Essen', pronunciation: 'POH-yo' },
  { id: '56', spanish: 'Carne', german: 'Fleisch', icon: '🥩', difficulty: 'mittel', category: 'Essen', pronunciation: 'KAR-neh' },

  // Kleidung
  { id: '57', spanish: 'Camisa', german: 'Hemd', icon: '👕', difficulty: 'leicht', category: 'Kleidung', pronunciation: 'kah-MEE-sah' },
  { id: '58', spanish: 'Pantalón', german: 'Hose', icon: '👖', difficulty: 'leicht', category: 'Kleidung', pronunciation: 'pahn-tah-LOHN' },
  { id: '59', spanish: 'Zapato', german: 'Schuh', icon: '👟', difficulty: 'leicht', category: 'Kleidung', pronunciation: 'sah-PAH-to' },
  { id: '60', spanish: 'Sombrero', german: 'Hut', icon: '🎩', difficulty: 'leicht', category: 'Kleidung', pronunciation: 'som-BREH-ro' },
  { id: '61', spanish: 'Abrigo', german: 'Mantel', icon: '🧥', difficulty: 'leicht', category: 'Kleidung', pronunciation: 'ah-BREE-go' },
  { id: '62', spanish: 'Vestido', german: 'Kleid', icon: '👗', difficulty: 'leicht', category: 'Kleidung', pronunciation: 'ves-TEE-do' },
  { id: '63', spanish: 'Calcetín', german: 'Socke', icon: '🧦', difficulty: 'leicht', category: 'Kleidung', pronunciation: 'kal-seh-TEEN' },
  { id: '64', spanish: 'Guante', german: 'Handschuh', icon: '🧤', difficulty: 'leicht', category: 'Kleidung', pronunciation: 'gwahn-teh' },

  // Haus & Möbel
  { id: '65', spanish: 'Casa', german: 'Haus', icon: '🏠', difficulty: 'leicht', category: 'Haus', pronunciation: 'KAH-sah' },
  { id: '66', spanish: 'Puerta', german: 'Tür', icon: '🚪', difficulty: 'leicht', category: 'Haus', pronunciation: 'pwehr-tah' },
  { id: '67', spanish: 'Ventana', german: 'Fenster', icon: '🪟', difficulty: 'leicht', category: 'Haus', pronunciation: 'ven-TAH-nah' },
  { id: '68', spanish: 'Cama', german: 'Bett', icon: '🛏️', difficulty: 'leicht', category: 'Möbel', pronunciation: 'KAH-mah' },
  { id: '69', spanish: 'Mesa', german: 'Tisch', icon: '🪑', difficulty: 'leicht', category: 'Möbel', pronunciation: 'MEH-sah' },
  { id: '70', spanish: 'Silla', german: 'Stuhl', icon: '🪑', difficulty: 'leicht', category: 'Möbel', pronunciation: 'SEE-yah' },
  { id: '71', spanish: 'Lámpara', german: 'Lampe', icon: '💡', difficulty: 'leicht', category: 'Möbel', pronunciation: 'LAHM-pah-rah' },
  { id: '72', spanish: 'Sofá', german: 'Sofa', icon: '🛋️', difficulty: 'leicht', category: 'Möbel', pronunciation: 'so-FAH' },

  // Natur & Wetter
  { id: '73', spanish: 'Sol', german: 'Sonne', icon: '☀️', difficulty: 'leicht', category: 'Natur', pronunciation: 'sol' },
  { id: '74', spanish: 'Luna', german: 'Mond', icon: '🌙', difficulty: 'leicht', category: 'Natur', pronunciation: 'LOO-nah' },
  { id: '75', spanish: 'Nube', german: 'Wolke', icon: '☁️', difficulty: 'leicht', category: 'Natur', pronunciation: 'NOO-beh' },
  { id: '76', spanish: 'Lluvia', german: 'Regen', icon: '🌧️', difficulty: 'leicht', category: 'Wetter', pronunciation: 'loo-VEE-ah' },
  { id: '77', spanish: 'Nieve', german: 'Schnee', icon: '❄️', difficulty: 'leicht', category: 'Wetter', pronunciation: 'nee-EH-veh' },
  { id: '78', spanish: 'Árbol', german: 'Baum', icon: '🌳', difficulty: 'leicht', category: 'Natur', pronunciation: 'AHR-bol' },
  { id: '79', spanish: 'Flor', german: 'Blume', icon: '🌸', difficulty: 'leicht', category: 'Natur', pronunciation: 'flor' },
  { id: '80', spanish: 'Montaña', german: 'Berg', icon: '⛰️', difficulty: 'mittel', category: 'Natur', pronunciation: 'mon-TAH-nya' },

  // Familie
  { id: '81', spanish: 'Padre', german: 'Vater', icon: '👨', difficulty: 'leicht', category: 'Familie', pronunciation: 'PAH-dreh' },
  { id: '82', spanish: 'Madre', german: 'Mutter', icon: '👩', difficulty: 'leicht', category: 'Familie', pronunciation: 'MAH-dreh' },
  { id: '83', spanish: 'Hijo', german: 'Sohn', icon: '👦', difficulty: 'leicht', category: 'Familie', pronunciation: 'EE-ho' },
  { id: '84', spanish: 'Hija', german: 'Tochter', icon: '👧', difficulty: 'leicht', category: 'Familie', pronunciation: 'EE-hah' },
  { id: '85', spanish: 'Hermano', german: 'Bruder', icon: '👨', difficulty: 'leicht', category: 'Familie', pronunciation: 'er-MAH-no' },
  { id: '86', spanish: 'Hermana', german: 'Schwester', icon: '👩', difficulty: 'leicht', category: 'Familie', pronunciation: 'er-MAH-nah' },
  { id: '87', spanish: 'Abuelo', german: 'Großvater', icon: '👴', difficulty: 'leicht', category: 'Familie', pronunciation: 'ah-BWEH-lo' },
  { id: '88', spanish: 'Abuela', german: 'Großmutter', icon: '👵', difficulty: 'leicht', category: 'Familie', pronunciation: 'ah-BWEH-lah' },

  // Verben (Mittel)
  { id: '89', spanish: 'Comer', german: 'Essen', icon: '🍽️', difficulty: 'mittel', category: 'Verben', pronunciation: 'ko-MEHR' },
  { id: '90', spanish: 'Beber', german: 'Trinken', icon: '🥤', difficulty: 'mittel', category: 'Verben', pronunciation: 'beh-BEHR' },
  { id: '91', spanish: 'Hablar', german: 'Sprechen', icon: '🗣️', difficulty: 'mittel', category: 'Verben', pronunciation: 'ah-BLAHR' },
  { id: '92', spanish: 'Escribir', german: 'Schreiben', icon: '✍️', difficulty: 'mittel', category: 'Verben', pronunciation: 'es-kree-BEER' },
  { id: '93', spanish: 'Leer', german: 'Lesen', icon: '📖', difficulty: 'mittel', category: 'Verben', pronunciation: 'leh-ehr' },
  { id: '94', spanish: 'Caminar', german: 'Gehen', icon: '🚶', difficulty: 'mittel', category: 'Verben', pronunciation: 'kah-mee-NAHR' },
  { id: '95', spanish: 'Correr', german: 'Laufen', icon: '🏃', difficulty: 'mittel', category: 'Verben', pronunciation: 'ko-REHR' },
  { id: '96', spanish: 'Dormir', german: 'Schlafen', icon: '😴', difficulty: 'mittel', category: 'Verben', pronunciation: 'dor-MEER' },
  { id: '97', spanish: 'Trabajar', german: 'Arbeiten', icon: '💼', difficulty: 'schwer', category: 'Verben', pronunciation: 'trah-bah-HAHR' },
  { id: '98', spanish: 'Aprender', german: 'Lernen', icon: '🎓', difficulty: 'schwer', category: 'Verben', pronunciation: 'ah-pren-DEHR' },
  { id: '99', spanish: 'Jugar', german: 'Spielen', icon: '🎮', difficulty: 'mittel', category: 'Verben', pronunciation: 'hoo-GAHR' },
  { id: '100', spanish: 'Comprar', german: 'Kaufen', icon: '🛒', difficulty: 'mittel', category: 'Verben', pronunciation: 'kom-PRAHR' },
];

export const getVocabularyByDifficulty = (difficulty: string) => {
  return VOCABULARY_LIST.filter(vocab => vocab.difficulty === difficulty);
};

export const getVocabularyByCategory = (category: string) => {
  return VOCABULARY_LIST.filter(vocab => vocab.category === category);
};

export const getAllCategories = () => {
  return [...new Set(VOCABULARY_LIST.map(vocab => vocab.category))].sort();
};

export const getAllDifficulties = () => ['leicht', 'mittel', 'schwer'];

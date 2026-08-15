// Die Adresse des Vamigo-Servers.
// Lokal bleibt sie leer (dann leitet Vite an localhost:8787 weiter).
// Im Web-Deployment setzt man die Umgebungsvariable VITE_API_URL,
// z.B. auf "https://api.deine-domain.de" – ohne Schrägstrich am Ende.
export const API_URL = import.meta.env.VITE_API_URL || ''

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../config';
import { doc, setDoc } from 'firebase/firestore';

interface SignupError {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  firebase?: string;
}

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<SignupError>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: SignupError = {};

    if (!name.trim()) {
      newErrors.name = 'Name ist erforderlich';
    } else if (name.length < 2) {
      newErrors.name = 'Name muss mindestens 2 Zeichen lang sein';
    }

    if (!email) {
      newErrors.email = 'Email ist erforderlich';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Ungültige Email-Adresse';
    }

    if (!password) {
      newErrors.password = 'Passwort ist erforderlich';
    } else if (password.length < 6) {
      newErrors.password = 'Passwort muss mindestens 6 Zeichen lang sein';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Benutzer erstellen
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Profil aktualisieren
      await updateProfile(user, {
        displayName: name,
      });

      // Benutzer-Profil in Firestore speichern
      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: email,
        createdAt: new Date().toISOString(),
        streak: 0,
        totalLessons: 0,
        totalWords: 0,
        accuracy: 0,
        emailVerified: false,
      });

      // Verifikations-Email senden
      await sendEmailVerification(user);

      // Zeige Bestätigungsmeldung
      alert('✅ Konto erstellt! Überprüfe dein Email-Postfach für einen Bestätigungslink.');
      
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.message || 'Registrierung fehlgeschlagen';
      setErrors({ firebase: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f7fa' }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '40px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h1 style={{ textAlign: 'center', color: '#003366', marginBottom: '10px' }}>
          Willkommen! 🎉
        </h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
          Erstelle ein Konto, um dein Lernprogress zu verfolgen
        </p>

        {errors.firebase && (
          <div style={{
            padding: '12px',
            backgroundColor: '#ffebee',
            borderLeft: '4px solid #F44336',
            marginBottom: '20px',
            borderRadius: '4px',
            color: '#c62828',
          }}>
            {errors.firebase}
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: errors.name ? '2px solid #F44336' : '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
              }}
              placeholder="Dein Name"
            />
            {errors.name && (
              <p style={{ color: '#F44336', fontSize: '14px', marginTop: '4px' }}>
                {errors.name}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: errors.email ? '2px solid #F44336' : '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
              }}
              placeholder="deine@email.de"
            />
            {errors.email && (
              <p style={{ color: '#F44336', fontSize: '14px', marginTop: '4px' }}>
                {errors.email}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: errors.password ? '2px solid #F44336' : '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
              }}
              placeholder="••••••••"
            />
            {errors.password && (
              <p style={{ color: '#F44336', fontSize: '14px', marginTop: '4px' }}>
                {errors.password}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Passwort bestätigen
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: errors.confirmPassword ? '2px solid #F44336' : '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
              }}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p style={{ color: '#F44336', fontSize: '14px', marginTop: '4px' }}>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#FF7A00',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
            disabled={loading}
          >
            {loading ? 'Wird registriert...' : 'Registrieren'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
          Hast du schon ein Konto?{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
            style={{ color: '#FF7A00', textDecoration: 'none', fontWeight: 'bold' }}
          >
            Anmelden
          </a>
        </p>
      </div>
    </div>
  );
};

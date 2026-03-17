import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { VocabularyPage } from './pages/VocabularyPage';
import { ReviewPage } from './pages/ReviewPage';
import { GeneratorPage } from './pages/GeneratorPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AuthProvider, useAuth } from './AuthContext';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f7fa',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Laden...</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      {user && <Navbar />}
      <Routes>
        {user ? (
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/vocabulary" element={<VocabularyPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/generator" element={<GeneratorPage />} />
            <Route path="/login" element={<Navigate to="/" />} />
            <Route path="/signup" element={<Navigate to="/" />} />
          </>
        ) : (
          <>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

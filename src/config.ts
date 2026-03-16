import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase Config
const firebaseConfig = {
  apiKey: 'AIzaSyApWp7hVXuho93_N-i3iRtVk1UBN092Vz0',
  authDomain: 'spanisch-lernen-app.firebaseapp.com',
  projectId: 'spanisch-lernen-app',
  storageBucket: 'spanisch-lernen-app.firebasestorage.app',
  messagingSenderId: '735153004125',
  appId: '1:735153004125:web:2904b44d17e42f9446b7b4',
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);

// Auth Service
export const auth: Auth = getAuth(app);

// Firestore Service
export const db: Firestore = getFirestore(app);

export default app;

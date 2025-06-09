// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v9-compat and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfXa4eLs5pab9Zia5kS8idvHx-tMssc94",
  authDomain: "miambidi.firebaseapp.com",
  projectId: "miambidi",
  storageBucket: "miambidi.firebasestorage.app",
  messagingSenderId: "278582031159",
  appId: "1:278582031159:web:14503ac6077607b53460b2",
  measurementId: "G-GLH328GZJT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configure Firestore settings for better connectivity
if (typeof window !== 'undefined') {
  // Enable offline persistence (helps with connectivity issues)
  try {
    // Note: This should only be called once per app instance
    // enableNetwork(db); // Ensure network is enabled
  } catch (error) {
    console.warn('Firestore network configuration warning:', error);
  }
}

// Initialize Analytics only in production
let analytics = null;
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  analytics = getAnalytics(app);
}
export { analytics };

// Connect to emulators in development (uncomment if using Firebase emulators)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Uncomment these lines if you want to use Firebase emulators
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectStorageEmulator(storage, 'localhost', 9199);
}

export default app;

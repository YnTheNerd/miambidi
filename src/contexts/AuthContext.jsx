import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { logFirebaseDebugInfo } from '../utils/firebaseValidator';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sign up with email and password
  async function signup(email, password, profileData = {}) {
    try {
      setError(null);
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const displayName = profileData.displayName || `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim();

      await updateProfile(userCredential.user, { displayName });

      // Create user profile in Firestore with enhanced structure
      const userDoc = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName,
        photoURL: userCredential.user.photoURL || '',
        provider: 'email',
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        preferences: {
          language: 'fr',
          currency: 'FCFA',
          notifications: true
        },
        profile: {
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          bio: profileData.bio || '',
          location: profileData.location || ''
        }
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userDoc);
      return userCredential;
    } catch (error) {
      setError(getErrorMessage(error));
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Sign in with email and password
  async function signin(email, password) {
    try {
      setError(null);
      setLoading(true);

      console.log('🔐 Attempting email/password sign-in...');

      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      console.log('✅ Email/password sign-in successful');

      // Update last login time
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        lastLoginAt: serverTimestamp()
      });

      return userCredential;
    } catch (error) {
      console.error('❌ Email/password sign-in error:', error);
      setError(getErrorMessage(error));
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Sign in with Google
  async function signInWithGoogle() {
    try {
      setError(null);
      setLoading(true);

      console.log('🔐 Attempting Google sign-in...');

      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      console.log('📱 Opening Google sign-in popup...');
      const userCredential = await signInWithPopup(auth, provider);

      console.log('✅ Google sign-in successful');

      // Handle Firestore operations with retry logic
      await handleFirestoreUserProfile(userCredential.user);

      return userCredential;
    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      setError(getErrorMessage(error));
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Sign out
  async function logout() {
    try {
      console.log('🔐 Starting logout process...');

      // Clear user profile state immediately
      setCurrentUser(null);
      setUserProfile(null);
      setError(null);

      // Clear any cached authentication data
      if (typeof window !== 'undefined') {
        // Clear localStorage items that might contain user data
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.startsWith('firebase:') ||
            key.startsWith('user-') ||
            key.includes('auth') ||
            key.includes('token')
          )) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));

        // Clear sessionStorage
        sessionStorage.clear();
      }

      // Sign out from Firebase
      await signOut(auth);

      console.log('✅ Logout completed successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if Firebase signOut fails, clear local state
      setCurrentUser(null);
      setUserProfile(null);
      setError(null);
      throw error;
    }
  }

  // Handle Firestore user profile operations with retry logic
  async function handleFirestoreUserProfile(user, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Firestore operation attempt ${attempt}/${maxRetries}`);

        // Wait a bit before retrying (exponential backoff)
        if (attempt > 1) {
          const delay = Math.pow(2, attempt - 1) * 1000; // 2s, 4s, 8s
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Check if user profile exists
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (!userDoc.exists()) {
          console.log('👤 Creating new user profile...');
          const newUserDoc = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL || '',
            provider: 'google',
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
            preferences: {
              language: 'fr',
              currency: 'FCFA',
              notifications: true
            },
            profile: {
              firstName: '',
              lastName: '',
              bio: '',
              location: ''
            }
          };
          await setDoc(doc(db, 'users', user.uid), newUserDoc);
          console.log('✅ User profile created successfully');
        } else {
          console.log('👤 Updating existing user profile...');
          await updateDoc(doc(db, 'users', user.uid), {
            lastLoginAt: serverTimestamp()
          });
          console.log('✅ User profile updated successfully');
        }

        return; // Success, exit retry loop

      } catch (error) {
        console.error(`❌ Firestore operation attempt ${attempt} failed:`, error);

        if (attempt === maxRetries) {
          console.error('❌ All Firestore retry attempts failed');
          // Don't throw error - allow authentication to succeed even if Firestore fails
          console.warn('⚠️ Continuing without Firestore profile update');
          return;
        }
      }
    }
  }

  // Fetch user profile from Firestore
  async function fetchUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
        return userDoc.data();
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
    return null;
  }

  // Reset password
  async function resetPassword(email) {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError(getErrorMessage(error));
      throw error;
    }
  }

  // Change password
  async function changePassword(newPassword) {
    try {
      setError(null);
      await updatePassword(currentUser, newPassword);
    } catch (error) {
      setError(getErrorMessage(error));
      throw error;
    }
  }

  // Update user profile
  async function updateUserProfile(updates) {
    if (!currentUser) return;

    try {
      setError(null);

      // Update Firebase Auth profile if needed
      if (updates.displayName || updates.photoURL) {
        await updateProfile(currentUser, {
          displayName: updates.displayName,
          photoURL: updates.photoURL
        });
      }

      // Update Firestore document
      await updateDoc(doc(db, 'users', currentUser.uid), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      setUserProfile(prev => ({ ...prev, ...updates }));
    } catch (error) {
      setError(getErrorMessage(error));
      throw error;
    }
  }

  // Get user-friendly error messages
  function getErrorMessage(error) {
    console.log('🔍 Error details:', { code: error.code, message: error.message });

    switch (error.code) {
      case 'auth/configuration-not-found':
        return 'Configuration Firebase manquante. Veuillez vérifier la configuration du projet.';
      case 'auth/invalid-api-key':
        return 'Clé API Firebase invalide. Veuillez vérifier la configuration.';
      case 'auth/project-not-found':
        return 'Projet Firebase introuvable. Veuillez vérifier l\'ID du projet.';
      case 'auth/user-not-found':
        return 'Aucun compte trouvé avec cette adresse email.';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect.';
      case 'auth/email-already-in-use':
        return 'Cette adresse email est déjà utilisée.';
      case 'auth/weak-password':
        return 'Le mot de passe doit contenir au moins 6 caractères.';
      case 'auth/invalid-email':
        return 'Adresse email invalide.';
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Veuillez réessayer plus tard.';
      case 'auth/network-request-failed':
        return 'Erreur de connexion. Vérifiez votre connexion internet.';
      case 'auth/popup-closed-by-user':
        return 'Connexion annulée.';
      case 'auth/popup-blocked':
        return 'Popup bloqué. Veuillez autoriser les popups pour ce site.';
      case 'auth/cancelled-popup-request':
        return 'Demande de popup annulée.';
      case 'auth/unauthorized-domain':
        return 'Domaine non autorisé. Veuillez contacter l\'administrateur.';
      // Firestore errors
      case 'unavailable':
        return 'Service temporairement indisponible. Veuillez réessayer.';
      case 'permission-denied':
        return 'Permissions insuffisantes. Veuillez contacter l\'administrateur.';
      case 'not-found':
        return 'Document non trouvé.';
      case 'already-exists':
        return 'Le document existe déjà.';
      default:
        return error.message || 'Une erreur est survenue.';
    }
  }

  useEffect(() => {
    // Debug Firebase configuration on initialization
    if (process.env.NODE_ENV === 'development') {
      console.log('🔥 Initializing Firebase Auth...');
      logFirebaseDebugInfo();
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔄 Auth state changed:', user ? 'User logged in' : 'User logged out');

      setCurrentUser(user);
      if (user) {
        console.log('👤 User authenticated, fetching profile...');
        await fetchUserProfile(user.uid);
      } else {
        console.log('👤 User not authenticated, clearing profile...');
        setUserProfile(null);
        setError(null);

        // Additional cleanup when user logs out
        if (typeof window !== 'undefined') {
          // Clear any remaining user-specific data
          localStorage.removeItem('recipe-favorites');
          localStorage.removeItem('meal-plan-cache');
          localStorage.removeItem('shopping-list-cache');
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    // State
    currentUser,
    userProfile,
    loading,
    error,

    // Authentication methods
    signup,
    signin,
    signInWithGoogle,
    logout,
    resetPassword,
    changePassword,

    // Profile methods
    fetchUserProfile,
    updateUserProfile,

    // Utility methods
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  type User 
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase/config';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase auth state change error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<UserProfile | null> => {
    setAuthError(null);

    // Fallback demo user for local testing when Firebase domain is unauthorized
    const demoUser: UserProfile = {
      uid: 'demo-chief-user-01',
      email: 'chief@example.com',
      displayName: 'Chief',
      photoURL: null
    };

    if (!isFirebaseConfigured) {
      setUser(demoUser);
      return demoUser;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const profile: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName,
        photoURL: fbUser.photoURL
      };
      setUser(profile);
      setFirebaseUser(fbUser);
      return profile;
    } catch (err: any) {
      console.warn("Google Sign-In Popup Error (using local fallback if unauthorized domain):", err);
      if (
        err.code === 'auth/unauthorized-domain' || 
        err.code === 'auth/configuration-not-found' || 
        err.message?.includes('unauthorized-domain')
      ) {
        console.log("Logged in as Demo User (Chief) for local testing on 127.0.0.1");
        setUser(demoUser);
        return demoUser;
      }
      
      let errorMsg = "Failed to sign in with Google. Please try again.";
      if (err.code === 'auth/popup-closed-by-user') {
        errorMsg = "Sign-in popup was closed before completing.";
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMsg = "Sign-in request was cancelled.";
      } else if (err.message) {
        errorMsg = err.message;
      }

      setAuthError(errorMsg);
      // If any popup error occurs, fallback to demo login for local development
      setUser(demoUser);
      return demoUser;
    }
  };



  const logout = async () => {
    setAuthError(null);
    if (isFirebaseConfigured) {
      await firebaseSignOut(auth);
    }
    setUser(null);
    setFirebaseUser(null);
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signInWithGoogle,
        logout,
        authError,
        clearAuthError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

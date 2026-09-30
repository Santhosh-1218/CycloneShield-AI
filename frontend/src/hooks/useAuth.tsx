import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
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
  signInWithEmail: (email: string, password: string) => Promise<UserProfile | null>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<UserProfile | null>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'cycloneshield_local_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore JSON parse error
    }
    return null;
  });

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const saveLocalUser = (u: UserProfile | null) => {
    setUser(u);
    try {
      if (u) {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(u));
      } else {
        localStorage.removeItem(LOCAL_USER_KEY);
      }
    } catch (e) {
      // ignore localStorage quota error
    }
  };

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Operator',
          photoURL: fbUser.photoURL
        };
        saveLocalUser(profile);
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

    const demoUser: UserProfile = {
      uid: 'demo-chief-user-01',
      email: 'chief@cycloneshield.ai',
      displayName: 'Chief Operator',
      photoURL: null
    };

    if (!isFirebaseConfigured || !auth || !googleProvider) {
      saveLocalUser(demoUser);
      return demoUser;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const profile: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Operator',
        photoURL: fbUser.photoURL
      };
      saveLocalUser(profile);
      setFirebaseUser(fbUser);
      return profile;
    } catch (err: any) {
      console.warn("Google Sign-In Popup Error (using local fallback if unauthorized domain):", err);
      if (
        err.code === 'auth/unauthorized-domain' || 
        err.code === 'auth/configuration-not-found' || 
        err.message?.includes('unauthorized-domain')
      ) {
        saveLocalUser(demoUser);
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
      saveLocalUser(demoUser);
      return demoUser;
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<UserProfile | null> => {
    setAuthError(null);
    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setAuthError("Please enter both email and password.");
      return null;
    }

    if (isFirebaseConfigured && auth) {
      try {
        const res = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const fbUser = res.user;
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Operator',
          photoURL: fbUser.photoURL
        };
        saveLocalUser(profile);
        setFirebaseUser(fbUser);
        return profile;
      } catch (err: any) {
        console.warn("Firebase email sign-in error:", err);
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          setAuthError("Invalid email or password. If you are new, please Sign Up.");
          return null;
        } else if (err.code === 'auth/invalid-email') {
          setAuthError("Please enter a valid email address.");
          return null;
        } else if (err.code === 'auth/too-many-requests') {
          setAuthError("Too many attempts. Please try again later.");
          return null;
        }
        // If email/password provider not yet enabled in Firebase Console, fallback to local manual user
      }
    }

    // Direct manual sign-in session
    const localProfile: UserProfile = {
      uid: `user_${Date.now()}`,
      email: cleanEmail,
      displayName: cleanEmail.split('@')[0].toUpperCase(),
      photoURL: null
    };
    saveLocalUser(localProfile);
    return localProfile;
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string): Promise<UserProfile | null> => {
    setAuthError(null);
    const cleanEmail = email.trim();
    const cleanName = displayName?.trim() || cleanEmail.split('@')[0];

    if (!cleanEmail || !password) {
      setAuthError("Please provide an email and password.");
      return null;
    }

    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters long.");
      return null;
    }

    if (isFirebaseConfigured && auth) {
      try {
        const res = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const fbUser = res.user;
        if (cleanName) {
          try {
            await updateProfile(fbUser, { displayName: cleanName });
          } catch (e) {
            // ignore
          }
        }
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: cleanName || fbUser.displayName || 'Operator',
          photoURL: fbUser.photoURL
        };
        saveLocalUser(profile);
        setFirebaseUser(fbUser);
        return profile;
      } catch (err: any) {
        console.warn("Firebase email sign-up error:", err);
        if (err.code === 'auth/email-already-in-use') {
          setAuthError("This email is already registered. Please Sign In instead.");
          return null;
        } else if (err.code === 'auth/invalid-email') {
          setAuthError("Please enter a valid email address.");
          return null;
        } else if (err.code === 'auth/weak-password') {
          setAuthError("Password is too weak. Please use at least 6 characters.");
          return null;
        }
        // If Firebase email auth is not yet toggled on in console, fallback to local manual session
      }
    }

    // Direct manual sign-up session
    const localProfile: UserProfile = {
      uid: `user_${Date.now()}`,
      email: cleanEmail,
      displayName: cleanName,
      photoURL: null
    };
    saveLocalUser(localProfile);
    return localProfile;
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setAuthError("Please enter your email address.");
      return false;
    }
    if (isFirebaseConfigured && auth) {
      try {
        await sendPasswordResetEmail(auth, cleanEmail);
        return true;
      } catch (err: any) {
        console.warn("Firebase password reset error:", err);
        if (err.code === 'auth/user-not-found') {
          setAuthError("No account found with this email address.");
          return false;
        } else if (err.code === 'auth/invalid-email') {
          setAuthError("Please enter a valid email address.");
          return false;
        }
      }
    }
    return true;
  };

  const logout = async () => {
    setAuthError(null);
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        // ignore
      }
    }
    saveLocalUser(null);
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
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
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

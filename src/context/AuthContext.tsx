import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { auth, db, googleProvider } from '../lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect,
  signInAnonymously,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  serverTimestamp, 
  onSnapshot 
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  startLocalSession: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const createLocalUser = (): UserProfile => ({
    uid: 'local-agent',
    displayName: 'Local Agent',
    email: 'local@sea.rho7',
    role: 'operator',
    isOnline: true,
    preferences: {
      theme: 'dark',
      speedMode: true,
    },
  });

  const isOfflinePreview = () =>
    typeof window !== 'undefined' && window.location.protocol === 'file:';

  const shouldUseRedirectSignIn = () => {
    if (typeof window === 'undefined') return false;
    return window.location.protocol === 'https:';
  };

  const createFirebaseProfile = (firebaseUser: NonNullable<typeof auth.currentUser>): UserProfile => ({
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Guest Student' : 'Anonymous Student'),
    photoURL: firebaseUser.photoURL || '',
    email: firebaseUser.email || (firebaseUser.isAnonymous ? 'guest@sea.rho7' : ''),
    role: 'student',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  useEffect(() => {
    if (isOfflinePreview()) {
      setUser(createLocalUser());
      setLoading(false);
      return;
    }

    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up previous profile listener if any
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser(docSnap.data() as UserProfile);
          } else {
            const initialProfile = createFirebaseProfile(firebaseUser);
            
            setUser(initialProfile);
            setDoc(userDocRef, initialProfile, { merge: true })
              .catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${firebaseUser.uid}`));
          }
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          setUser(createFirebaseProfile(firebaseUser));
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  useEffect(() => {
    if (!loading || user) return;

    const fallbackTimer = window.setTimeout(() => {
      setLoading(false);
    }, 8000);

    return () => window.clearTimeout(fallbackTimer);
  }, [loading, user]);

  const signIn = async () => {
    if (isOfflinePreview()) {
      startLocalSession();
      return;
    }
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      if (shouldUseRedirectSignIn()) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/popup-closed-by-user') {
        console.error('Sign in error:', error);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const signInAsGuest = async () => {
    if (isOfflinePreview()) {
      startLocalSession();
      return;
    }
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error('Guest sign in error:', error);
      startLocalSession();
    } finally {
      setIsSigningIn(false);
    }
  };

  const startLocalSession = () => {
    setUser(createLocalUser());
    setLoading(false);
  };

  const signOut = async () => {
    try {
      if (user?.uid === 'local-agent') {
        setUser(null);
        return;
      }
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, { isOnline: false, lastSeen: serverTimestamp() }, { merge: true })
          .catch(error => handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser?.uid}`));
      }
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (user?.uid === 'local-agent') {
      setUser(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : prev);
      return;
    }
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      setUser(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : prev);
      await setDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
    }
  };

  useEffect(() => {
    if (!user?.uid || user.uid === 'local-agent') return;

    const updatePresence = async () => {
      const userRef = doc(db, 'users', user.uid);
      try {
        await setDoc(userRef, {
          isOnline: true,
          lastSeen: serverTimestamp(),
        }, { merge: true });
      } catch (e) {
        console.error("Presence error:", e);
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, 60000); // Pulse every minute

    return () => clearInterval(interval);
  }, [user?.uid]);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInAsGuest, signOut, startLocalSession, updateProfile }}>
      {loading ? (
        <div className="min-h-screen bg-vision-blue-950 text-white flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-lg border-2 border-saffron-400 border-t-transparent animate-spin" />
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-vision-blue-100">Opening SEA.RHO7</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

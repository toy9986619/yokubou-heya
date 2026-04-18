'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut as firebaseSignOut,
  linkWithPopup,
  updateProfile,
} from 'firebase/auth';

import { getFirebaseAuth } from '@/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }, []);

  const signInAsAnonymous = useCallback(async (displayName) => {
    const auth = getFirebaseAuth();
    const credential = await signInAnonymously(auth);
    if (displayName) {
      await updateProfile(credential.user, { displayName });
    }
    return credential.user;
  }, []);

  const upgradeAnonymousToGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth.currentUser || !auth.currentUser.isAnonymous) {
      throw new Error('Not an anonymous user');
    }
    const provider = new GoogleAuthProvider();
    await linkWithPopup(auth.currentUser, provider);
  }, []);

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAnonymous: !!user?.isAnonymous,
      signInWithGoogle,
      signInAsAnonymous,
      upgradeAnonymousToGoogle,
      signOut,
    }),
    [user, loading, signInWithGoogle, signInAsAnonymous, upgradeAnonymousToGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

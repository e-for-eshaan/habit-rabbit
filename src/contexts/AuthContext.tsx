"use client";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { setApiGetToken } from "@/lib/apiAuth";
import { auth } from "@/lib/firebase/client";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  getIdToken: () => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!auth);

  useEffect(() => {
    const authInstance = auth;
    if (!authInstance) return;
    setApiGetToken(async () => {
      const u = authInstance.currentUser;
      if (!u) return null;
      try {
        return await u.getIdToken();
      } catch {
        return null;
      }
    });
    const unsubscribe = onAuthStateChanged(authInstance, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch {
      return null;
    }
  }, [user]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase Auth is not configured");
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase Auth is not configured");
    await createUserWithEmailAndPassword(auth, email, password);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) throw new Error("Firebase Auth is not configured");
    await signInWithPopup(auth, new GoogleAuthProvider());
  }, []);

  const signOut = useCallback(async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      getIdToken,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
    }),
    [user, loading, getIdToken, signIn, signUp, signInWithGoogle, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/*
 * context/AuthContext.tsx — Authentication Context
 *
 * Wraps the whole app. Provides:
 *   - currentUser: Profile | null
 *   - session: AuthSession | null
 *   - isLoading: boolean (true while checking stored session)
 *   - login(), register(), logout(), signInWithOAuth()
 *
 * Components use the useAuth() hook. They never call authService directly.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { AuthSession, Profile } from '@/types';
import { authService, profileService } from '@/services';

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  session: AuthSession | null;
  currentUser: Profile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (params: {
    email: string;
    password: string;
    username: string;
    fullName: string;
    githubUsername?: string;
    avatarId?: number;
  }) => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: restore session from storage
  useEffect(() => {
    authService.getSession().then(async (stored) => {
      if (stored) {
        setSession(stored);
        try {
          const profile = await profileService.getMyProfile();
          setCurrentUser(profile);
        } catch {
          // Session exists but profile fetch failed — clear
          setSession(null);
        }
      }
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const sess = await authService.signInWithEmail(email, password);
    setSession(sess);
    const profile = await profileService.getMyProfile();
    setCurrentUser(profile);
  }, []);

  const register = useCallback(
    async (params: {
      email: string;
      password: string;
      username: string;
      fullName: string;
      githubUsername?: string;
      avatarId?: number;
    }) => {
      const sess = await authService.registerWithEmail(params);
      setSession(sess);
      const profile = await profileService.getMyProfile();
      setCurrentUser(profile);
    },
    [],
  );

  const signInWithOAuth = useCallback(async (provider: 'google' | 'github') => {
    await authService.signInWithOAuth(provider);
  }, []);

  const logout = useCallback(async () => {
    await authService.signOut();
    setSession(null);
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, currentUser, isLoading, login, register, signInWithOAuth, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth() must be called inside <AuthProvider>.');
  return ctx;
}

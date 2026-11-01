/*
 * services/mock/mockAuth.ts — Mock Auth Service
 *
 * Simulates sign-in, registration, and session management.
 * Uses the shared runtimeUsers / runtimePasswords from mockData.ts —
 * the same arrays that mockProfile.ts reads — so a newly registered
 * user is immediately visible to profile lookups.
 *
 * Email matching is case-insensitive and trimmed on both register and login.
 * Errors are distinct: "No account" vs "Wrong password".
 */

import type { IAuthService } from '../interfaces';
import type { AuthSession } from '@/types';
import {
  runtimeUsers,
  runtimePasswords,
  addRuntimeUser,
  saveMockSession,
  loadMockSession,
  clearMockSession,
} from './mockData';

function delay(ms = 600): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function makeSession(userId: string, email: string): AuthSession {
  return {
    userId,
    email,
    accessToken: `mock-token-${userId}-${Date.now()}`,
    expiresAt: Date.now() + 1000 * 60 * 60 * 8, // 8 hours
  };
}

export const mockAuthService: IAuthService = {
  async signInWithEmail(email, password) {
    await delay();

    // Normalise: lower-case + trim so "Nova@..." matches "nova@..."
    const normalEmail = email.toLowerCase().trim();

    const user = runtimeUsers.find((u) => u.email.toLowerCase().trim() === normalEmail);
    if (!user) {
      throw new Error('No account found with that email address.');
    }

    const storedPass = runtimePasswords[normalEmail];
    if (storedPass !== password) {
      throw new Error('Wrong password. Please try again.');
    }

    const session = makeSession(user.userId, user.email);
    saveMockSession(session);
    return session;
  },

  async registerWithEmail({ email, password, username, fullName, githubUsername, avatarId }) {
    await delay(800);

    const normalEmail = email.toLowerCase().trim();
    const trimmedUsername = username.trim();

    // Check unique email (case-insensitive)
    if (runtimeUsers.find((u) => u.email.toLowerCase().trim() === normalEmail)) {
      throw new Error('An account with this email already exists.');
    }

    // Check unique username (case-insensitive)
    if (runtimeUsers.find((u) => u.username.toLowerCase() === trimmedUsername.toLowerCase())) {
      throw new Error('That username is already taken. Please choose another.');
    }

    // Create new user and add via shared helper (also stores password under normalEmail key)
    const newUser = {
      userId: `mock-user-rt-${Date.now()}`,
      username: trimmedUsername,
      fullName: fullName.trim(),
      email: normalEmail,          // store normalised so lookups are consistent
      bio: '',
      avatarId: avatarId && avatarId >= 1 && avatarId <= 10 ? avatarId : 1,
      githubUsername: githubUsername?.trim() ?? '',
      createdAt: new Date().toISOString(),
    };

    // addRuntimeUser pushes to runtimeUsers AND sets runtimePasswords[normalEmail]
    addRuntimeUser(newUser, password);

    const session = makeSession(newUser.userId, normalEmail);
    saveMockSession(session);
    return session;
  },

  async signInWithOAuth(provider) {
    await delay(300);
    console.warn(
      `[MOCK] signInWithOAuth("${provider}") called. ` +
        'OAuth flows need a real Supabase project. Coming in Milestone 3.',
    );
    throw new Error(
      `Continue with ${provider === 'google' ? 'Google' : 'GitHub'} is not available in mock mode. ` +
        'Use email/password with the test accounts instead.',
    );
  },

  async signOut() {
    await delay(200);
    clearMockSession();
  },

  async getSession() {
    const session = loadMockSession();
    if (!session) return null;
    if (session.expiresAt < Date.now()) {
      clearMockSession();
      return null;
    }
    return session;
  },

  async checkUsernameAvailable(username) {
    await delay(400);
    const trimmed = username.toLowerCase().trim();
    return !runtimeUsers.find((u) => u.username.toLowerCase() === trimmed);
  },
};

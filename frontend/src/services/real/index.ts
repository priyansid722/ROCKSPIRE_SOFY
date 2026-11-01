/*
 * services/real/ — Real API service stubs
 *
 * These implement the same interfaces as the mock services but call
 * the real FastAPI backend. They are STUBS until Milestone 4.
 * Each method throws a clear error so the developer knows the real
 * backend isn't wired yet.
 */

import type { IAuthService, IProfileService, IProjectService } from '../interfaces';

const NOT_READY = (method: string) =>
  new Error(
    `[Real API] ${method}() is not implemented yet. ` +
      'The real backend will be connected in Milestone 4. ' +
      'Set VITE_USE_MOCK_API=true to use the mock service.',
  );

export const realAuthService: IAuthService = {
  signInWithEmail: () => Promise.reject(NOT_READY('signInWithEmail')),
  registerWithEmail: () => Promise.reject(NOT_READY('registerWithEmail')),
  signInWithOAuth: () => Promise.reject(NOT_READY('signInWithOAuth')),
  signOut: () => Promise.reject(NOT_READY('signOut')),
  getSession: async () => null, // Safe default — treats user as logged out
  checkUsernameAvailable: () => Promise.reject(NOT_READY('checkUsernameAvailable')),
};

export const realProfileService: IProfileService = {
  getMyProfile: () => Promise.reject(NOT_READY('getMyProfile')),
  updateMyProfile: () => Promise.reject(NOT_READY('updateMyProfile')),
  getProfileByUsername: () => Promise.reject(NOT_READY('getProfileByUsername')),
};

export const realProjectService: IProjectService = {
  listMyProjects: () => Promise.reject(NOT_READY('listMyProjects')),
  getProject: async () => null, // Safe default — shows not-found state
  createProject: () => Promise.reject(NOT_READY('createProject')),
  updateProject: () => Promise.reject(NOT_READY('updateProject')),
};

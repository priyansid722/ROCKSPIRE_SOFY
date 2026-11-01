/*
 * services/mock/mockProfile.ts — Mock Profile Service
 *
 * Uses the shared runtimeUsers array from mockData.ts.
 * This is the SAME array that mockAuth writes to via addRuntimeUser(),
 * so newly registered users are immediately visible here.
 *
 * Privacy rule: a user can see another user's profile ONLY if they share a project.
 */

import type { IProfileService } from '../interfaces';
import type { UpdateProfilePayload } from '@/types';
import { runtimeUsers, MOCK_PROJECTS, loadMockSession } from './mockData';

function getCurrentUserId(): string {
  const session = loadMockSession();
  if (!session) throw new Error('Not authenticated.');
  return session.userId;
}

function delay(ms = 500): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export const mockProfileService: IProfileService = {
  async getMyProfile() {
    await delay();
    const userId = getCurrentUserId();
    // runtimeUsers is the live shared array — includes newly registered users
    const profile = runtimeUsers.find((p) => p.userId === userId);
    if (!profile) throw new Error('Profile not found.');
    return { ...profile };
  },

  async updateMyProfile(payload: UpdateProfilePayload) {
    await delay(700);
    const userId = getCurrentUserId();
    const idx = runtimeUsers.findIndex((p) => p.userId === userId);
    if (idx === -1) throw new Error('Profile not found.');
    runtimeUsers[idx] = { ...runtimeUsers[idx], ...payload };
    return { ...runtimeUsers[idx] };
  },

  async getProfileByUsername(username: string) {
    await delay();
    const userId = getCurrentUserId();

    const target = runtimeUsers.find((p) => p.username === username);
    if (!target) throw new Error('User not found.');

    // Always allow viewing own profile
    if (target.userId === userId) return { ...target };

    // Privacy: must share a project
    const shareProject = MOCK_PROJECTS.some(
      (proj) =>
        proj.members.some((m) => m.userId === userId) &&
        proj.members.some((m) => m.userId === target.userId),
    );
    if (!shareProject) {
      throw new Error('You can only view profiles of teammates.');
    }
    return { ...target };
  },
};

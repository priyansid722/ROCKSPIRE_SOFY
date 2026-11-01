/*
 * services/mock/mockData.ts — Seed data for the mock service layer
 *
 * IMPORTANT: runtimeUsers and runtimePasswords are the single source of truth
 * for both auth AND profile lookups. Both services import from here so they
 * always see the same user list — fixing the "registered user not found" bug.
 *
 * Persistence: registered users (profiles) and their hashed-equivalent passwords
 * are stored in localStorage under separate keys so they survive page reloads.
 * SESSION NOTE: Passwords stored here are FAKE DEV DATA only (plain text in
 * localStorage). This is intentional for mock mode and must never be used with
 * real user passwords. localStorage is scoped to this browser/origin and is
 * never sent to any server in mock mode.
 */

import type { Profile, Project, AuthSession } from '@/types';
import { DEPARTMENT_META } from '@/types';
import type { DepartmentId, DepartmentStatus } from '@/types';

// ─── Storage keys ─────────────────────────────────────────────────────────────

const SESSION_KEY   = 'rockspire_mock_session';
const USERS_KEY     = 'rockspire_mock_users';
const PASSWORDS_KEY = 'rockspire_mock_passwords';

// ─── Seed users ───────────────────────────────────────────────────────────────

const SEED_USERS: Profile[] = [
  {
    userId: 'mock-user-001',
    username: 'nova_lead',
    fullName: 'Nova Stellarson',
    email: 'nova@mockrockspire.dev',
    bio: 'Mission commander and lead engineer. Building rockets one line at a time.',
    avatarId: 1,
    githubUsername: 'nova-stellarson',
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    userId: 'mock-user-002',
    username: 'atlas_member',
    fullName: 'Atlas Rivera',
    email: 'atlas@mockrockspire.dev',
    bio: 'Backend engineer on the engine department. Loves clean APIs.',
    avatarId: 3,
    githubUsername: 'atlas-rv',
    createdAt: '2025-02-01T12:00:00Z',
  },
  {
    userId: 'mock-user-003',
    username: 'orbit_solo',
    fullName: 'Orbit Kim',
    email: 'orbit@mockrockspire.dev',
    bio: 'Solo rocket builder. Working on a personal satellite tracker.',
    avatarId: 7,
    githubUsername: 'orbit-kim',
    createdAt: '2025-03-10T08:00:00Z',
  },
];

const SEED_PASSWORDS: Record<string, string> = {
  'nova@mockrockspire.dev':  'MockPass123!',
  'atlas@mockrockspire.dev': 'MockPass456!',
  'orbit@mockrockspire.dev': 'MockPass789!',
};

// ─── localStorage helpers ────────────────────────────────────────────────────

function loadPersistedUsers(): Profile[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Profile[];
  } catch {
    return [];
  }
}

function savePersistedUsers(users: Profile[]): void {
  // Only save users that are NOT in SEED_USERS (seeds are always re-added at init).
  const seedIds = new Set(SEED_USERS.map((u) => u.userId));
  const runtimeOnly = users.filter((u) => !seedIds.has(u.userId));
  localStorage.setItem(USERS_KEY, JSON.stringify(runtimeOnly));
}

function loadPersistedPasswords(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PASSWORDS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

function savePersistedPasswords(passwords: Record<string, string>): void {
  // Only persist non-seed passwords.
  const seedEmails = new Set(Object.keys(SEED_PASSWORDS));
  const runtimeOnly: Record<string, string> = {};
  for (const [k, v] of Object.entries(passwords)) {
    if (!seedEmails.has(k)) runtimeOnly[k] = v;
  }
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(runtimeOnly));
}

// ─── Runtime stores — initialised from seeds + any previously registered data ──

/**
 * MOCK_USERS — exported for use in mockProject.ts (dept member refs).
 * Always refer to this for reads; use addRuntimeUser() to add new users.
 */
export const MOCK_USERS: Profile[] = [...SEED_USERS];

/**
 * Single mutable runtime user store — shared by mockAuth and mockProfile.
 * Initialised with seeds + any users registered in a prior session.
 */
export const runtimeUsers: Profile[] = [
  ...SEED_USERS,
  ...loadPersistedUsers(),
];

/**
 * Simple in-memory password store. Keys are lower-cased, trimmed emails.
 * Seed passwords are hardcoded; registered-user passwords come from localStorage.
 *
 * SECURITY NOTE (mock-mode only): passwords are stored as plain text in
 * localStorage for developer convenience. This is fake dev data — use throwaway
 * passwords only. Never run this code against real credentials.
 */
export const runtimePasswords: Record<string, string> = {
  ...SEED_PASSWORDS,
  ...loadPersistedPasswords(),
};

// ─── Mutation helpers ─────────────────────────────────────────────────────────

/** Add a newly registered user to the runtime store and persist to localStorage. */
export function addRuntimeUser(user: Profile, password: string): void {
  runtimeUsers.push(user);
  runtimePasswords[user.email.toLowerCase().trim()] = password;
  // Persist both so they survive page reloads
  savePersistedUsers(runtimeUsers);
  savePersistedPasswords(runtimePasswords);
}

/**
 * Reset ALL runtime state back to seed data only.
 * Clears localStorage so registered test accounts are removed.
 * Called by the "Reset mock data (dev only)" button.
 */
export function resetRuntimeData(): void {
  // Reset in-memory arrays
  runtimeUsers.length = 0;
  runtimeUsers.push(...SEED_USERS);

  for (const key of Object.keys(runtimePasswords)) {
    delete runtimePasswords[key];
  }
  Object.assign(runtimePasswords, SEED_PASSWORDS);

  // Clear all persisted mock keys
  localStorage.removeItem(USERS_KEY);
  localStorage.removeItem(PASSWORDS_KEY);
  clearMockSession();
}

// ─── Helper to build a sample department ────────────────────────────────────

function makeDept(
  id: DepartmentId,
  status: DepartmentStatus,
  memberIds: string[],
  tasks: { title: string; done: boolean }[],
) {
  return {
    id,
    displayName: DEPARTMENT_META[id].displayName,
    emoji: DEPARTMENT_META[id].emoji,
    purpose: DEPARTMENT_META[id].purpose,
    status,
    tasks: tasks.map((t, i) => ({
      taskId: `${id}-task-${i}`,
      title: t.title,
      done: t.done,
      isSampleData: true,
    })),
    members: memberIds.map((uid) => {
      const u = SEED_USERS.find((x) => x.userId === uid)!;
      return { userId: u.userId, username: u.username, avatarId: u.avatarId };
    }),
  };
}

// ─── Seed projects ────────────────────────────────────────────────────────────

export const MOCK_PROJECTS: Project[] = [
  // Project 1 — Team project; mock-user-001 is lead, 002 is member
  {
    projectId: 'mock-proj-001',
    name: 'Project Helios',
    description:
      'A real-time satellite tracking dashboard with live orbit visualisation and alert systems.',
    status: 'ongoing',
    role: 'lead',       // Perspective of mock-user-001 (the logged-in seed user)
    leadId: 'mock-user-001',
    discordUrl: 'https://discord.gg/mockhelios',
    githubRepoUrl: 'https://github.com/nova-stellarson/project-helios',
    lastWorkedOn: '2026-10-28T18:30:00Z',
    createdAt: '2025-06-01T09:00:00Z',
    members: [
      {
        userId: 'mock-user-001',
        username: 'nova_lead',
        avatarId: 1,
        role: 'lead',
        department: 'nose-cone',
        joinedAt: '2025-06-01T09:00:00Z',
        email: 'nova@mockrockspire.dev',
        githubUsername: 'nova-stellarson',
        contributions: { commits: 42, prs: 8, lastActivity: '2026-10-28T18:30:00Z' },
      },
      {
        userId: 'mock-user-002',
        username: 'atlas_member',
        avatarId: 3,
        role: 'member',
        department: 'engine',
        joinedAt: '2025-06-15T11:00:00Z',
        email: 'atlas@mockrockspire.dev',
        githubUsername: 'atlas-rv',
        contributions: { commits: 29, prs: 5, lastActivity: '2026-10-27T14:00:00Z' },
      },
    ],
    departments: [
      makeDept('nose-cone', 'in-progress', ['mock-user-001'], [
        { title: 'Write project vision statement', done: true },
        { title: 'Create API design document', done: true },
        { title: 'Define MVP scope', done: false },
      ]),
      makeDept('payload', 'needs-attention', [], [
        { title: 'Implement satellite data fetcher', done: false },
        { title: 'Build orbit calculation module', done: false },
      ]),
      makeDept('avionics', 'not-assessed', [], []),
      makeDept('engine', 'in-progress', ['mock-user-002'], [
        { title: 'Set up FastAPI project', done: true },
        { title: 'Connect to Supabase', done: false },
        { title: 'Write auth middleware', done: false },
      ]),
      makeDept('navigation', 'not-assessed', [], []),
      makeDept('fuel-system', 'verified-complete', [], [
        { title: 'Pin all dependencies', done: true },
        { title: 'Set up dependabot', done: true },
      ]),
      makeDept('structure', 'in-progress', ['mock-user-001'], [
        { title: 'Design system tokens', done: true },
        { title: 'Component library skeleton', done: false },
      ]),
      makeDept('stabilization', 'not-assessed', [], []),
      makeDept('launch-system', 'not-assessed', [], []),
    ],
  },

  // Project 2 — Solo project; mock-user-001 is the only member
  {
    projectId: 'mock-proj-002',
    name: 'AstroLog',
    description:
      'A personal stargazing journal. Log observations, track objects, and generate sky charts.',
    status: 'planning',
    role: 'solo',
    leadId: 'mock-user-001',
    discordUrl: '',
    githubRepoUrl: 'https://github.com/nova-stellarson/astrolog',
    lastWorkedOn: '2026-10-20T10:00:00Z',
    createdAt: '2026-09-01T07:00:00Z',
    members: [
      {
        userId: 'mock-user-001',
        username: 'nova_lead',
        avatarId: 1,
        role: 'solo',
        department: 'nose-cone',
        joinedAt: '2026-09-01T07:00:00Z',
        email: 'nova@mockrockspire.dev',
        githubUsername: 'nova-stellarson',
        contributions: { commits: 7, prs: 0, lastActivity: '2026-10-20T10:00:00Z' },
      },
    ],
    departments: [
      makeDept('nose-cone', 'in-progress', ['mock-user-001'], [
        { title: 'Define observation data model', done: true },
        { title: 'Sketch wireframes', done: false },
      ]),
      makeDept('payload', 'not-assessed', [], []),
      makeDept('avionics', 'not-assessed', [], []),
      makeDept('engine', 'not-assessed', [], []),
      makeDept('navigation', 'not-assessed', [], []),
      makeDept('fuel-system', 'not-assessed', [], []),
      makeDept('structure', 'not-assessed', [], []),
      makeDept('stabilization', 'not-assessed', [], []),
      makeDept('launch-system', 'not-assessed', [], []),
    ],
  },
];

// ─── Session storage (localStorage) ──────────────────────────────────────────

export function saveMockSession(session: AuthSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadMockSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function clearMockSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

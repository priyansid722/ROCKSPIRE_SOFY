/*
 * services/interfaces.ts — Service layer contracts
 *
 * Components NEVER call fetch() or localStorage directly.
 * They always use these interfaces. This guarantees that
 * swapping from mock → real backend in Milestone 4 changes
 * zero UI code.
 */

import type {
  AuthSession,
  Profile,
  UpdateProfilePayload,
  ProjectSummary,
  Project,
  CreateProjectPayload,
  UpdateProjectPayload,
  ProjectStatus,
} from '@/types';

// ─── Auth Service ─────────────────────────────────────────────────────────────

export interface IAuthService {
  /** Sign in with email + password. Throws on failure. */
  signInWithEmail(email: string, password: string): Promise<AuthSession>;

  /** Register with email + password + username. Throws on failure. */
  registerWithEmail(params: {
    email: string;
    password: string;
    username: string;
    fullName: string;
    githubUsername?: string;
    avatarId?: number;
  }): Promise<AuthSession>;

  /** Start OAuth flow (Google or GitHub). In mock: console.warns and resolves. */
  signInWithOAuth(provider: 'google' | 'github'): Promise<void>;

  /** Sign out the current session. */
  signOut(): Promise<void>;

  /** Returns the current session, or null if logged out. */
  getSession(): Promise<AuthSession | null>;

  /** Returns true if a username is available. */
  checkUsernameAvailable(username: string): Promise<boolean>;
}

// ─── Profile Service ──────────────────────────────────────────────────────────

export interface IProfileService {
  /** Get the current user's own profile. */
  getMyProfile(): Promise<Profile>;

  /** Update the current user's profile. */
  updateMyProfile(payload: UpdateProfilePayload): Promise<Profile>;

  /** Get another user's profile. Only succeeds if they share a project. */
  getProfileByUsername(username: string): Promise<Profile>;
}

// ─── Project Service ──────────────────────────────────────────────────────────

export interface IProjectService {
  /** List only projects the current user belongs to. */
  listMyProjects(filter?: { status?: ProjectStatus }): Promise<ProjectSummary[]>;

  /** Get a single project. Returns null if not found or not a member. */
  getProject(projectId: string): Promise<Project | null>;

  /** Create a new project. The creator becomes the lead (or solo owner). */
  createProject(payload: CreateProjectPayload): Promise<Project>;

  /** Update project metadata. Lead only — throws 403 otherwise. */
  updateProject(projectId: string, payload: UpdateProjectPayload): Promise<Project>;
}

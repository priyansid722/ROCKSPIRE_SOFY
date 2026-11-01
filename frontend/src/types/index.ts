/*
 * types/index.ts — ROCKSPIRE SOFY shared TypeScript types
 *
 * These types are the single source of truth for the data layer.
 * They match the API contract documented in docs/API_CONTRACT.md.
 * When the real backend is connected (Milestone 4), these types
 * should continue to match without changes.
 */

// ─── Auth & Session ──────────────────────────────────────────────────────────

export interface AuthSession {
  userId: string;
  email: string;
  accessToken: string;
  expiresAt: number; // Unix timestamp
}

// ─── User & Profile ──────────────────────────────────────────────────────────

/** A lightweight public-facing user reference (safe to share between teammates) */
export interface UserRef {
  userId: string;
  username: string;
  avatarId: number; // 1–10
}

/** Full profile — returned by GET /me and GET /profiles/:username (teammates only) */
export interface Profile {
  userId: string;
  username: string;
  fullName: string;
  email: string;       // Only visible to the profile owner
  bio: string;
  avatarId: number;    // 1–10
  githubUsername: string;
  createdAt: string;   // ISO 8601
}

/** Payload for PATCH /me */
export interface UpdateProfilePayload {
  fullName?: string;
  bio?: string;
  avatarId?: number;
  githubUsername?: string;
}

// ─── Project ─────────────────────────────────────────────────────────────────

/** Possible lifecycle statuses for a project (rocket) */
export type ProjectStatus = 'planning' | 'ongoing' | 'completed';

/** A user's role within a project */
export type ProjectRole = 'lead' | 'member' | 'solo';

/** Summary card — returned in GET /projects lists */
export interface ProjectSummary {
  projectId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  role: ProjectRole;          // Current user's role in this project
  discordUrl: string;
  githubRepoUrl: string;
  lastWorkedOn: string;       // ISO 8601
  createdAt: string;          // ISO 8601
}

/** Full project — returned by GET /projects/:id (members only) */
export interface Project extends ProjectSummary {
  leadId: string;
  members: Member[];          // Lead sees all; member sees only own dept
  departments: Department[];
}

/** Payload for POST /projects */
export interface CreateProjectPayload {
  name: string;
  description: string;
  status: ProjectStatus;
  discordUrl?: string;
  githubRepoUrl: string;      // REQUIRED
  memberType: 'solo' | 'team';
  analyseWithRocky?: boolean; // Placeholder until Milestone 8
}

/** Payload for PATCH /projects/:id (lead only) */
export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  discordUrl?: string;
  githubRepoUrl?: string;
}

// ─── Members ─────────────────────────────────────────────────────────────────

export interface Member {
  userId: string;
  username: string;
  avatarId: number;
  role: ProjectRole;
  department: DepartmentId;
  joinedAt: string;
  /**
   * Only visible to the lead:
   * - email, githubUsername, contributions
   */
  email?: string;
  githubUsername?: string;
  contributions?: Contributions;
}

export interface Contributions {
  commits: number;
  prs: number;
  lastActivity: string; // ISO 8601
}

// ─── Departments ─────────────────────────────────────────────────────────────

/**
 * The 9 departments of every rocket.
 * These are fixed — they don't change per project.
 */
export type DepartmentId =
  | 'nose-cone'       // Docs, vision, product definition
  | 'payload'         // Core features, product logic
  | 'avionics'        // Logic, integrations, state management
  | 'engine'          // Backend, APIs, data layer
  | 'navigation'      // Testing, QA, observability
  | 'fuel-system'     // Dependencies, package management
  | 'structure'       // Architecture, design system
  | 'stabilization'   // Security, auth, permissions
  | 'launch-system';  // Deployment, CI/CD, infrastructure

export type DepartmentStatus =
  | 'not-assessed'
  | 'needs-attention'
  | 'in-progress'
  | 'verified-complete';

export interface Department {
  id: DepartmentId;
  displayName: string;
  emoji: string;        // Visual shorthand for the department
  purpose: string;      // One-sentence description shown in side panel
  status: DepartmentStatus;
  tasks: DepartmentTask[]; // SAMPLE DATA until real data exists
  members: UserRef[];   // Lead sees all depts; member sees only own
}

export interface DepartmentTask {
  taskId: string;
  title: string;
  done: boolean;
  isSampleData: boolean; // Always true until Milestone 4
}

// ─── Invites (placeholder shape — full implementation in Milestone 5) ────────

export interface InviteLink {
  inviteId: string;
  projectId: string;
  department: DepartmentId;
  expiresAt: string | null;    // null = no expiry
  maxUses: number | null;      // null = unlimited
  uses: number;
  revoked: boolean;
  // The actual token is NEVER stored or sent to the frontend in plaintext.
  // The link itself is: /join/:token
  linkPreview: string;         // e.g. "/join/abc123…" (last 8 chars for display)
}

// ─── Join Requests (placeholder shape — full implementation in Milestone 5) ──

export type JoinRequestStatus = 'pending' | 'approved' | 'rejected';

export interface JoinRequest {
  requestId: string;
  projectId: string;
  department: DepartmentId;
  userId: string;
  username: string;
  email: string;          // Visible to lead only
  githubUsername: string; // Visible to lead only
  status: JoinRequestStatus;
  createdAt: string;
}

// ─── Department metadata (static, used by the UI for display) ───────────────

export const DEPARTMENT_META: Record<DepartmentId, { displayName: string; emoji: string; purpose: string }> = {
  'nose-cone':     { displayName: 'Nose Cone',     emoji: '🔭', purpose: 'Docs, vision, and product definition — the rocket\'s guiding point.' },
  'payload':       { displayName: 'Payload',       emoji: '📦', purpose: 'Core features and product logic — what the rocket actually carries.' },
  'avionics':      { displayName: 'Avionics',      emoji: '⚡', purpose: 'Logic, integrations, and state management — the rocket\'s brain.' },
  'engine':        { displayName: 'Engine',        emoji: '🔥', purpose: 'Backend, APIs, and data layer — raw thrust that makes it fly.' },
  'navigation':    { displayName: 'Navigation',    emoji: '🧭', purpose: 'Testing, QA, and observability — keeps the flight on course.' },
  'fuel-system':   { displayName: 'Fuel System',   emoji: '⛽', purpose: 'Dependencies and package management — the fuel that powers everything.' },
  'structure':     { displayName: 'Structure',     emoji: '🏗️', purpose: 'Architecture and design system — the hull that holds it all together.' },
  'stabilization': { displayName: 'Stabilization', emoji: '🛡️', purpose: 'Security, auth, and permissions — keeps the rocket stable and safe.' },
  'launch-system': { displayName: 'Launch System', emoji: '🚀', purpose: 'Deployment, CI/CD, and infrastructure — the launchpad and countdown.' },
};

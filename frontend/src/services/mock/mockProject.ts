/*
 * services/mock/mockProject.ts — Mock Project Service
 *
 * Privacy rules enforced:
 *   1. User sees ONLY projects they belong to.
 *   2. In a project, a member sees only members in their OWN department.
 *      Only the lead sees all members.
 *   3. Only the lead sees member emails, GitHub usernames, contributions.
 *   4. Only the lead can call updateProject.
 */

import type { IProjectService } from '../interfaces';
import type {
  ProjectSummary,
  Project,
  CreateProjectPayload,
  UpdateProjectPayload,
  ProjectStatus,
  DepartmentId,
} from '@/types';
import { DEPARTMENT_META } from '@/types';
import { MOCK_PROJECTS, loadMockSession } from './mockData';

// Mutable in-memory store
const projects: Project[] = [...MOCK_PROJECTS];
let nextId = 100;

function getCurrentUserId(): string {
  const session = loadMockSession();
  if (!session) throw new Error('Not authenticated.');
  return session.userId;
}

function delay(ms = 600): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Apply privacy filters to a project for a given viewer.
 * - Member: only sees members in their own department; no emails/GitHub/contributions.
 * - Lead: sees everything.
 */
function applyPrivacy(project: Project, viewerId: string): Project {
  const viewerMember = project.members.find((m) => m.userId === viewerId);
  if (!viewerMember) return project; // will be caught by membership check above

  const isLead = project.leadId === viewerId;

  // Filter department members for non-leads
  const filteredDepts = project.departments.map((dept) => ({
    ...dept,
    members: isLead
      ? dept.members
      : dept.id === viewerMember.department
      ? dept.members
      : [],
  }));

  // Filter member list: non-leads see only own dept members; no sensitive fields
  const filteredMembers = project.members
    .filter(
      (m) => isLead || m.department === viewerMember.department,
    )
    .map((m) =>
      isLead
        ? m // lead sees everything
        : {
            // member sees only safe fields
            userId: m.userId,
            username: m.username,
            avatarId: m.avatarId,
            role: m.role,
            department: m.department,
            joinedAt: m.joinedAt,
          },
    );

  return {
    ...project,
    members: filteredMembers,
    departments: filteredDepts,
  };
}

export const mockProjectService: IProjectService = {
  async listMyProjects(filter?: { status?: ProjectStatus }) {
    await delay();
    const userId = getCurrentUserId();

    // Privacy rule 1: only projects the user belongs to
    return projects
      .filter((p) => p.members.some((m) => m.userId === userId))
      .filter((p) => !filter?.status || p.status === filter.status)
      .map((p): ProjectSummary => {
        const myMember = p.members.find((m) => m.userId === userId)!;
        return {
          projectId: p.projectId,
          name: p.name,
          description: p.description,
          status: p.status,
          role: myMember.role,
          discordUrl: p.discordUrl,
          githubRepoUrl: p.githubRepoUrl,
          lastWorkedOn: p.lastWorkedOn,
          createdAt: p.createdAt,
        };
      });
  },

  async getProject(projectId: string) {
    await delay();
    const userId = getCurrentUserId();
    const project = projects.find((p) => p.projectId === projectId);

    // Privacy: not found OR not a member → null (not 403, to avoid leaking existence)
    if (!project || !project.members.some((m) => m.userId === userId)) {
      return null;
    }

    return applyPrivacy(project, userId);
  },

  async createProject(payload: CreateProjectPayload) {
    await delay(900);
    const userId = getCurrentUserId();
    const role = payload.memberType === 'solo' ? 'solo' : 'lead';
    const projectId = `mock-proj-${++nextId}`;
    const now = new Date().toISOString();

    // Seed all 9 departments empty
    const departments = (Object.keys(DEPARTMENT_META) as DepartmentId[]).map(
      (id) => ({
        id,
        displayName: DEPARTMENT_META[id].displayName,
        emoji: DEPARTMENT_META[id].emoji,
        purpose: DEPARTMENT_META[id].purpose,
        status: 'not-assessed' as const,
        tasks: [],
        members:
          id === 'nose-cone'
            ? [{ userId, username: 'you', avatarId: 1 }]
            : [],
      }),
    );

    const newProject: Project = {
      projectId,
      name: payload.name,
      description: payload.description,
      status: payload.status,
      role,
      leadId: userId,
      discordUrl: payload.discordUrl ?? '',
      githubRepoUrl: payload.githubRepoUrl,
      lastWorkedOn: now,
      createdAt: now,
      members: [
        {
          userId,
          username: 'you',
          avatarId: 1,
          role,
          department: 'nose-cone',
          joinedAt: now,
        },
      ],
      departments,
    };

    projects.push(newProject);
    return newProject;
  },

  async updateProject(projectId: string, payload: UpdateProjectPayload) {
    await delay(700);
    const userId = getCurrentUserId();
    const idx = projects.findIndex((p) => p.projectId === projectId);
    if (idx === -1) throw new Error('Project not found.');

    // Only the lead may update
    if (projects[idx].leadId !== userId) {
      throw new Error('Only the project lead can edit project details.');
    }

    projects[idx] = { ...projects[idx], ...payload };
    return applyPrivacy(projects[idx], userId);
  },
};

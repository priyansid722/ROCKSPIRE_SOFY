# ROCKSPIRE SOFY — Architecture

> **Milestone:** 1 (Frontend Foundation)
> **Last updated:** 2026-10-29

---

## 1. Overview

ROCKSPIRE SOFY is a space-themed, **private** project-collaboration platform.
Every project is a "rocket" with nine selectable departments.
The platform is publicly discoverable but every workspace is invite-only.

```
┌──────────────────────────────────────────────────────┐
│                    Browser (React)                   │
│  Vite + TypeScript + React Router + CSS Modules      │
│  Service layer (mock now → real in Milestone 4)      │
└────────────────────┬─────────────────────────────────┘
                     │ HTTPS / REST
┌────────────────────▼─────────────────────────────────┐
│               FastAPI (Python)                        │
│  JWT verification · Business logic · GitHub API       │
│  Gemini API (Milestone 8) · n8n webhooks (optional)   │
└────────────────────┬─────────────────────────────────┘
                     │ postgres:// (connection pooler)
┌────────────────────▼─────────────────────────────────┐
│          Supabase (PostgreSQL + Auth)                 │
│  Row Level Security on every table                   │
│  Supabase Auth (Google, GitHub, email/password)      │
└──────────────────────────────────────────────────────┘
```

---

## 2. Repository Layout

```
rockspire-sofy/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React context (AuthContext)
│   │   ├── pages/        # Route-level page components
│   │   ├── services/     # Data layer (mock + real)
│   │   │   ├── mock/     # In-memory mock, enabled with VITE_USE_MOCK_API=true
│   │   │   └── real/     # Real API calls (stubs until Milestone 4)
│   │   ├── styles/       # tokens.css + global.css
│   │   └── types/        # Shared TypeScript interfaces
│   ├── public/           # Static files (favicon)
│   └── index.html
├── backend/           # Python + FastAPI (Milestones 3+)
├── supabase/          # SQL migrations + RLS policies (Milestone 2+)
└── docs/              # This file and companions
    ├── ARCHITECTURE.md   ← you are here
    ├── DESIGN_SYSTEM.md
    ├── SECURITY.md
    └── API_CONTRACT.md
```

---

## 3. Frontend Architecture

### 3.1 Service Layer Pattern

Components **never** call `fetch` or `localStorage` directly.
All data access goes through a service interface:

```
IAuthService     login / register / signInWithOAuth / logout / checkUsernameAvailable
IProfileService  getMyProfile / updateMyProfile / getProfileByUsername
IProjectService  createProject / listMyProjects / getProject / updateProject
```

`src/services/index.ts` reads `VITE_USE_MOCK_API` at startup and exports
the correct implementation. Switching from mock to real requires **zero
component code changes**.

```typescript
// src/services/index.ts
const useMock = import.meta.env.VITE_USE_MOCK_API === 'true';
export const authService    = useMock ? mockAuth    : realAuth;
export const profileService = useMock ? mockProfile : realProfile;
export const projectService = useMock ? mockProject : realProject;
```

### 3.2 Auth Context

`src/context/AuthContext.tsx` provides:

| Value | Type | Description |
|-------|------|-------------|
| `session` | `AuthSession \| null` | Current JWT session |
| `currentUser` | `Profile \| null` | Loaded profile |
| `login` | `fn` | Email/password login |
| `register` | `fn` | Create account |
| `signInWithOAuth` | `fn` | Google / GitHub OAuth |
| `logout` | `fn` | Clear session |
| `isLoading` | `boolean` | Session restore in progress |

On mount it restores a session from `localStorage` (mock) / Supabase (real).

### 3.3 Route Guard

`ProtectedRoute` wraps any route that requires authentication.
If no session exists it redirects to `/login?return=<current-path>`.
After login, the user is sent back to the original destination.

### 3.4 Folder Conventions

```
components/ComponentName/
  ComponentName.tsx        # Component logic
  ComponentName.module.css # Scoped styles (CSS Modules)
  index.ts                 # Barrel export: export { ComponentName } from './ComponentName'

pages/PageName/
  PageName.tsx             # Page + page-level layout
  PageName.module.css
  index.ts
```

---

## 4. Routing

| Path | Page | Auth |
|------|------|------|
| `/` | Landing | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/terms` | Terms | Public |
| `/contact` | Contact | Public |
| `/profile` | Profile Dashboard | **Protected** |
| `/profile/edit` | Profile Edit | **Protected** |
| `/projects/new` | New Project | **Protected** |
| `/projects/:projectId` | Project Workspace | **Protected** |
| `*` | 404 Not Found | Public |

---

## 5. Data Flow (Mock Mode)

```
Page component
  → calls profileService.getMyProfile()
    → mock reads from MOCK_USERS in-memory store
    → mock applies privacy filter (only returns own data)
  → renders with the returned data
```

Privacy rules are enforced **in the mock** the same way they will be in the
real backend and Supabase RLS — so the frontend code never needs to change.

---

## 6. Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `VITE_USE_MOCK_API` | `.env` | `"true"` for mock, `"false"` for real |
| `VITE_API_BASE_URL` | `.env` | Base URL of the FastAPI server |
| `VITE_SUPABASE_URL` | `.env` | Supabase project URL (real mode only) |
| `VITE_SUPABASE_ANON_KEY` | `.env` | Supabase public anon key (real mode only) |

**Never put secrets in frontend env vars.** The anon key is public by design.
Service-role keys, OAuth secrets, and GitHub tokens stay on the backend only.

Copy `.env.example` to `.env` and fill in the values you need.

---

## 7. Milestone Map

| Milestone | Focus | Status |
|-----------|-------|--------|
| 1 | Frontend foundation, design system, all pages (mock data) | ✅ Complete |
| 2 | Supabase schema + RLS policies | ⏳ Next |
| 3 | Auth (Google, GitHub, email/password) + FastAPI JWT |  |
| 4 | Real project CRUD API + frontend switch from mock |  |
| 5 | Invite links, join requests, team lead powers |  |
| 6 | GitHub integration, fork/commit/PR tracking |  |
| 7 | Systems panel (admin only) |  |
| 8 | Rocky.ai (Gemini API) |  |
| 9 | Hardening, security audit, deployment |  |

# ROCKSPIRE SOFY — API Contract

> **Milestone:** 1 (planned contract; real implementation begins in Milestone 3)
> Frontend TypeScript types in `src/types/index.ts` match this contract exactly.
> Until Milestone 4, the frontend uses mock services. When the real backend is
> connected via `VITE_USE_MOCK_API=false`, no component code should need to change.

---

## Conventions

- **Base URL:** `VITE_API_BASE_URL` (e.g. `http://localhost:8000`)
- **Auth:** `Authorization: Bearer <supabase_jwt>` on every protected endpoint.
- **Content-Type:** `application/json`
- **Errors:** all errors follow `{ "detail": "Human-readable message" }`
- **Timestamps:** ISO 8601 strings (`2024-01-15T10:30:00Z`)
- **IDs:** UUIDs (v4)
- **HTTP status codes used:**

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No content (delete/logout) |
| 400 | Bad request (validation failed) |
| 401 | Unauthenticated (no/invalid token) |
| 403 | Forbidden (authenticated but not permitted) |
| 404 | Not found (or: exists but you don't have access — indistinguishable) |
| 422 | Unprocessable entity (Pydantic schema mismatch) |
| 429 | Rate limit exceeded |

---

## Authentication Endpoints

### `POST /auth/register`
> **Who:** Anyone (public)

Register a new user with email, password, and a unique username.

**Request body:**
```json
{
  "email": "nova@example.com",
  "password": "••••••••",
  "username": "nova-stellarson",
  "fullName": "Nova Stellarson",
  "githubUsername": "nova-gh"   // optional
}
```

**Response 201:**
```json
{
  "userId": "uuid",
  "username": "nova-stellarson",
  "email": "nova@example.com",
  "accessToken": "eyJ…",
  "expiresAt": 1700000000
}
```

**Errors:** 400 if username taken; 422 if email/password invalid.

---

### `POST /auth/login`
> **Who:** Anyone (public)

**Request body:**
```json
{ "email": "nova@example.com", "password": "••••••••" }
```

**Response 200:** same shape as register.

**Errors:** 401 if invalid credentials.

---

### `POST /auth/logout`
> **Who:** Authenticated user

Invalidates the current session server-side.

**Response 204:** no body.

---

### `GET /auth/username-available?username=:username`
> **Who:** Anyone (public)

**Response 200:**
```json
{ "available": true }
```

---

## Profile Endpoints

### `GET /me`
> **Who:** Authenticated user (own profile only)

Returns the full profile including email and GitHub username.

**Response 200:**
```json
{
  "userId": "uuid",
  "username": "nova-stellarson",
  "fullName": "Nova Stellarson",
  "email": "nova@example.com",
  "bio": "I build rocket engines.",
  "avatarId": 3,
  "githubUsername": "nova-gh",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### `PATCH /me`
> **Who:** Authenticated user (own profile only)

Update editable fields. Email and username are **not** editable through this
endpoint.

**Request body (all optional):**
```json
{
  "fullName": "Nova Stellarson",
  "bio": "Updated bio.",
  "avatarId": 5,
  "githubUsername": "nova-gh"
}
```

**Response 200:** full profile (same as `GET /me`).

---

### `GET /profiles/:username`
> **Who:** Authenticated user who shares at least one project with the target

Returns a teammate's public profile. Email is **omitted**.

**Response 200:**
```json
{
  "userId": "uuid",
  "username": "blaze-kowalski",
  "fullName": "Blaze Kowalski",
  "bio": "Engine specialist.",
  "avatarId": 7,
  "githubUsername": "blaze-gh",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Errors:** 404 if user doesn't exist or you don't share a project with them.

---

## Project Endpoints

### `POST /projects`
> **Who:** Any authenticated user

Creates a new project. The creator automatically becomes the lead (or sole
member for solo projects).

**Request body:**
```json
{
  "name": "Orion Pathfinder",
  "description": "A navigation system for deep-space probes.",
  "status": "planning",
  "discordUrl": "https://discord.gg/abc123",   // optional
  "githubRepoUrl": "https://github.com/nova/orion",   // REQUIRED
  "memberType": "team"   // "solo" | "team"
}
```

**Validation rules (backend-enforced):**
- `githubRepoUrl` must match `^https://github\.com/[\w.-]+/[\w.-]+/?$`
- `name` max 80 characters
- `description` max 500 characters

**Response 201:**
```json
{
  "projectId": "uuid",
  "name": "Orion Pathfinder",
  "description": "…",
  "status": "planning",
  "role": "lead",
  "discordUrl": "…",
  "githubRepoUrl": "…",
  "leadId": "uuid",
  "lastWorkedOn": "2024-01-01T00:00:00Z",
  "createdAt": "2024-01-01T00:00:00Z",
  "members": [ /* initial: only the creator */ ],
  "departments": [ /* all 9, status = "not-assessed", tasks = [] */ ]
}
```

---

### `GET /projects`
> **Who:** Authenticated user — returns ONLY their own projects

**Response 200:**
```json
[
  {
    "projectId": "uuid",
    "name": "Orion Pathfinder",
    "description": "…",
    "status": "planning",
    "role": "lead",
    "discordUrl": "…",
    "githubRepoUrl": "…",
    "lastWorkedOn": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

Note: this is `ProjectSummary[]` — no `members` or `departments` in the list.

---

### `GET /projects/:projectId`
> **Who:** Authenticated project member only

Returns the full project. The `members` and `departments` arrays are filtered
by the requesting user's role:
- **Lead:** sees all members across all departments; sees emails and
  contribution counts.
- **Member:** sees only members in their own department; no emails, no
  contribution counts.

**Response 200:** full `Project` object (see TypeScript type).

**Errors:** 404 if project doesn't exist or you're not a member.

---

### `PATCH /projects/:projectId`
> **Who:** Project lead only

**Request body (all optional):**
```json
{
  "name": "Renamed Rocket",
  "description": "Updated description.",
  "status": "ongoing",
  "discordUrl": "https://discord.gg/new",
  "githubRepoUrl": "https://github.com/nova/orion-v2"
}
```

**Response 200:** updated full `Project` object.

**Errors:** 403 if not the lead; 404 if not a member.

---

## Invite Endpoints (Milestone 5)

These are documented as planned contracts. They are **not** implemented in
Milestone 1.

### `POST /projects/:projectId/invites`
> **Who:** Project lead only

Create a per-department invite link.

**Request body:**
```json
{
  "department": "engine",
  "expiresAt": "2024-02-01T00:00:00Z",   // optional, null = no expiry
  "maxUses": 5   // optional, null = unlimited
}
```

**Response 201:**
```json
{
  "inviteId": "uuid",
  "token": "abc123…",   // full token — shown ONCE, then discarded
  "link": "/join/abc123…",
  "department": "engine",
  "expiresAt": "2024-02-01T00:00:00Z",
  "maxUses": 5,
  "uses": 0
}
```

---

### `GET /projects/:projectId/invites`
> **Who:** Project lead only

Lists all non-revoked invite links for the project.

---

### `DELETE /projects/:projectId/invites/:inviteId`
> **Who:** Project lead only

Revokes an invite link immediately.

---

### `POST /join/:token`
> **Who:** Authenticated user

Redeems an invite token. Creates a join request visible to the lead.

**Response 201:**
```json
{
  "requestId": "uuid",
  "status": "pending",
  "department": "engine",
  "projectId": "uuid"
}
```

**Errors:** 404 if token invalid/expired/revoked; 429 if rate-limited;
400 if already a member or debarred.

---

## Join Request Endpoints (Milestone 5)

### `GET /projects/:projectId/join-requests`
> **Who:** Project lead only

### `PATCH /projects/:projectId/join-requests/:requestId`
> **Who:** Project lead only

**Request body:**
```json
{ "status": "approved" }   // or "rejected"
```

---

## Health Endpoint (Milestone 7)

### `GET /health`
> **Who:** Public

Returns service health. Does not expose internals.

**Response 200:**
```json
{ "status": "ok", "version": "0.1.0" }
```

---

## Type Reference

The following TypeScript types in `src/types/index.ts` correspond to this contract:

| TypeScript type | API usage |
|----------------|-----------|
| `AuthSession` | Login/register response |
| `Profile` | `GET /me`, `PATCH /me` response |
| `UpdateProfilePayload` | `PATCH /me` request |
| `ProjectSummary` | `GET /projects` item |
| `Project` | `GET /projects/:id`, `POST /projects`, `PATCH /projects/:id` response |
| `CreateProjectPayload` | `POST /projects` request |
| `UpdateProjectPayload` | `PATCH /projects/:id` request |
| `Member` | Embedded in `Project.members` |
| `Department` | Embedded in `Project.departments` |
| `InviteLink` | `POST/GET /projects/:id/invites` |
| `JoinRequest` | `POST /join/:token`, `GET/PATCH /join-requests` |

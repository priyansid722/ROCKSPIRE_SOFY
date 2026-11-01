# ROCKSPIRE SOFY — Security & Privacy Model

> **Milestone:** 1 (documented; enforcement begins in Milestone 2)
> This document is the authoritative reference for all privacy and security
> decisions in this project. Every backend endpoint and database policy must
> be verified against it.

---

## 1. Core Privacy Rules

These eight rules govern **every layer** of the system (frontend display,
FastAPI authorization, Supabase RLS). Breaking any one is a security defect,
not a bug.

| # | Rule | Where enforced |
|---|------|---------------|
| 1 | A user can see **only** projects they belong to. They cannot list or open anyone else's project. | RLS + FastAPI |
| 2 | A user can see profiles **only** of people who share a project with them. | RLS + FastAPI |
| 3 | Inside a project, a department member sees **only the usernames** of members in their own department. The team lead sees all members across all departments. | RLS + FastAPI |
| 4 | Only the lead sees members' **email, GitHub username**, and per-member **contribution numbers**. | RLS + FastAPI |
| 5 | Only the lead can **approve or reject join requests**, **remove or debar** a member, and **create or revoke invite links**. | FastAPI |
| 6 | Each department has its own **unique invite link**. A link grants access to that department only. Without a valid link, nobody can enter or see the workspace. | FastAPI + DB |
| 7 | Solo projects have exactly one member (the owner), stored in the same tables, so the same privacy rules apply. | RLS |
| 8 | **Usernames are globally unique.** | DB UNIQUE constraint |

---

## 2. Authorization Architecture

Authorization is **never trusted to the frontend**.

```
Frontend        → displays/hides UI elements based on role (UX only)
FastAPI         → verifies JWT on every request; enforces rule 5
Supabase RLS    → enforces rules 1–4, 6–7 at the database row level
```

The frontend role/permission state is cosmetic. A malicious user who removes
a "hidden" button and manually sends a request will receive a 403 from the
API, and the database will silently return no rows.

---

## 3. Authentication

### Providers (Milestone 3)

- **Google OAuth** via Supabase Auth
- **GitHub OAuth** via Supabase Auth
- **Email / Password** via Supabase Auth

### JWT Flow

1. User authenticates → Supabase issues a signed JWT (RS256).
2. Frontend stores the JWT in memory (not `localStorage`) using Supabase's
   built-in session management.
3. Every FastAPI request receives the JWT in `Authorization: Bearer <token>`.
4. FastAPI verifies the JWT signature against Supabase's public key (JWKS).
5. If verification fails → 401 Unauthorized. No data returned.

### Session Restoration

The frontend restores the session on page load via Supabase's
`supabase.auth.getSession()`. In mock mode, session data is persisted to
`localStorage` for developer convenience only — this is never done in
production.

---

## 4. Secrets Policy

| Secret | Where it lives | Who sees it |
|--------|---------------|-------------|
| Supabase anon key | Frontend `.env` (safe — public by design) | Everyone |
| Supabase service-role key | Backend `.env` only | Never in frontend |
| Google OAuth Client Secret | Supabase dashboard | Never in codebase |
| GitHub OAuth Client Secret | Supabase dashboard | Never in codebase |
| GitHub personal access token | Backend `.env`, encrypted at rest | Never in frontend |
| Gemini API key | Backend `.env` only | Never in frontend |
| Fernet encryption key | Backend `.env` only | Never in codebase |

**Rule:** If a secret appears in `git log`, rotate it immediately.

`.env` files are in `.gitignore`. Only `.env.example` (with placeholder
values) is committed.

---

## 5. GitHub Token Storage (Milestone 6)

GitHub tokens are stored encrypted on the backend:

- Library: `cryptography` (Python) — Fernet symmetric encryption.
- Key: generated once, stored in backend `.env` as `FERNET_KEY`.
- Never stored in plaintext in the database.
- Never sent to the frontend.
- The token is decrypted in-memory only when an API call is being made.

---

## 6. Invite Link Security (Milestone 5)

- Tokens are generated with `secrets.token_urlsafe(32)` (32 bytes = 256 bits
  of entropy — far beyond brute-force feasibility).
- Only the **SHA-256 hash** of the token is stored in the database.
  The plaintext token is shown once to the lead and then discarded.
- Links expire (`expires_at`) and have optional `max_uses`.
- Revoked links immediately become invalid regardless of expiry.
- Redemption is rate-limited (e.g. 10 attempts per IP per minute).
- A debarred user cannot re-join using the same or any new invite link
  for that project.

---

## 7. Row Level Security (RLS) Policy Summary

> Full SQL is in `supabase/migrations/`. This section is the human-readable
> specification.

### `profiles`
- `SELECT`: allowed if the requesting user shares at least one project with
  the profile owner, OR is the owner themselves.
- `INSERT`: only on own row (via Supabase trigger on `auth.users`).
- `UPDATE`: only own row.
- `DELETE`: disabled.

### `projects`
- `SELECT`: only if the user is in `project_members` for that project.
- `INSERT`: any authenticated user (becomes the lead automatically).
- `UPDATE`: only the lead.
- `DELETE`: only the lead (soft-delete in practice).

### `project_members`
- `SELECT`: lead sees all rows for their projects; member sees only rows
  where `department = their own department`.
- `INSERT`: only via join-request approval flow (lead action).
- `UPDATE`: lead only.
- `DELETE`: lead only.

### `invites`
- `SELECT`: lead only (for their projects).
- `INSERT`: lead only.
- `UPDATE`: lead only (to revoke).
- Redemption is a FastAPI endpoint, not a direct DB write from the frontend.

### `join_requests`
- `SELECT`: lead sees all for their projects; member sees only their own requests.
- `INSERT`: any authenticated user with a valid invite token.
- `UPDATE`: lead only (approve / reject).

### `contributions`
- `SELECT`: lead sees all for their projects; member sees only their own row.
- `INSERT` / `UPDATE`: backend service only (not accessible from frontend).

---

## 8. Transport Security

- All traffic over **HTTPS** (TLS 1.2 minimum, 1.3 preferred).
- `Strict-Transport-Security` header set on all responses.
- CORS: FastAPI allow-list matches only the known frontend origin(s). No
  wildcard in production.
- `Content-Security-Policy` header added in Milestone 9.

---

## 9. Input Validation

- **Frontend:** validates format and required fields before submission.
  This is UX-only — it is **not** a security boundary.
- **FastAPI:** all inputs validated with Pydantic models. Anything that
  doesn't match the schema → 422 Unprocessable Entity.
- **Database:** constraints (UNIQUE, NOT NULL, CHECK) provide the final layer.

GitHub repository URL is validated against:
```
^https://github\.com/[\w.-]+/[\w.-]+/?$
```
on both frontend (UX) and backend (security boundary).

---

## 10. Logging & Error Handling

- Errors returned to the client never include stack traces, internal IDs, or
  sensitive data.
- Backend logs include: timestamp, endpoint, HTTP status, latency.
- Backend logs **never** include: passwords, tokens, email addresses, or any
  PII beyond user ID (for audit purposes).

---

## 11. Dependency Audit

Run before every production deployment:
```bash
# Frontend
npm audit

# Backend
pip-audit  # or: safety check
```

---

## 12. Security Checklist (Milestone 9 verification)

- [ ] CORS allow-list matches production domain only
- [ ] Rate limiting on: login, register, invite redemption, Rocky.ai calls
- [ ] All secrets confirmed absent from `git log`
- [ ] `.env.example` contains no real values
- [ ] RLS policies tested with SQL test scripts
- [ ] JWT expiry handled gracefully (refresh or re-login)
- [ ] GitHub token encrypted at rest
- [ ] Invite tokens stored only as hashes
- [ ] Dependency audit passes with no critical CVEs
- [ ] HTTPS enforced; HSTS header present
- [ ] No `console.log` with sensitive data in production build

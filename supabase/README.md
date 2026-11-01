# ROCKSPIRE SOFY — Supabase

> **Milestone:** 2 (not yet built)
> This directory will contain SQL migrations and RLS policies.

---

## Planned Contents

```
supabase/
├── migrations/
│   ├── 001_initial_schema.sql     # All tables
│   ├── 002_rls_policies.sql       # Row Level Security for every table
│   ├── 003_indexes.sql            # Performance indexes
│   └── 004_seed_data.sql          # Dev seed data (never run in production)
└── tests/
    ├── test_rls_projects.sql      # Proves user A cannot read user B's project
    ├── test_rls_profiles.sql      # Proves non-teammate cannot read a profile
    ├── test_rls_departments.sql   # Proves dept member cannot see other depts
    └── test_rls_lead_only.sql     # Proves non-lead cannot see emails/contributions
```

---

## Tables (planned)

| Table | Primary key | Description |
|-------|------------|-------------|
| `profiles` | `id` (= auth user ID) | Username, full name, bio, avatar, GitHub handle |
| `projects` | `id` | Name, description, status, lead, GitHub URL, Discord URL |
| `project_members` | `(project_id, user_id)` | Role, department, joined_at |
| `invites` | `id` | Token hash, department, expiry, max uses, revoked |
| `join_requests` | `id` | Pending/approved/rejected requests with applicant details |
| `contributions` | `(project_id, user_id)` | Commits, PRs, last activity |
| `activity_log` | `id` | Audit trail for all lead actions |

---

## Getting Started (when Milestone 2 begins)

1. Create a Supabase project at https://supabase.com
2. Copy your project URL and keys into `backend/.env`
3. Run migrations via the Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref <your-project-ref>

# Run all migrations
supabase db push
```

Or paste migration files directly into the Supabase SQL editor.

---

## Security Notes

- Row Level Security (RLS) is **enabled on every table**.
- The service-role key bypasses RLS — it is used **only by the FastAPI backend**.
- The frontend uses only the **anon key**, which cannot bypass RLS.
- See `docs/SECURITY.md` for the full RLS policy specification.

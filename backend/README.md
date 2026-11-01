# ROCKSPIRE SOFY — Backend

> **Milestone:** 2+ (not yet built)
> This directory will contain the FastAPI backend.

---

## Planned Stack

- **Language:** Python 3.11+
- **Framework:** FastAPI
- **Validation:** Pydantic v2
- **Database:** Supabase (PostgreSQL) via `supabase-py`
- **Auth:** Supabase JWT verification (no custom auth server)
- **Secrets encryption:** `cryptography` (Fernet)
- **GitHub integration:** `PyGithub` + HMAC webhook verification
- **AI:** Google Gemini API (Milestone 8)

---

## Planned Directory Layout

```
backend/
├── main.py              # FastAPI app, CORS, middleware
├── requirements.txt
├── .env.example         # Template — never commit real .env
├── routers/
│   ├── auth.py          # /auth/* endpoints
│   ├── profiles.py      # /me, /profiles/:username
│   ├── projects.py      # /projects/*
│   ├── invites.py       # /projects/:id/invites, /join/:token
│   └── health.py        # /health
├── dependencies.py      # JWT verification FastAPI dependency
├── models/              # Pydantic request/response models
└── services/
    ├── github.py        # GitHub API + webhook handling
    └── gemini.py        # Gemini API calls (Milestone 8)
```

---

## Getting Started (when Milestone 3 begins)

```bash
# 1. Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy env template
copy .env.example .env
# Then fill in the values (see SECURITY.md for which keys are needed)

# 4. Run the dev server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive docs at `http://localhost:8000/docs`.

---

## Required Environment Variables (do not commit)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key (backend only — never in frontend) |
| `SUPABASE_JWT_SECRET` | For verifying JWTs locally (get from Supabase dashboard → Settings → API) |
| `FERNET_KEY` | Generate with: `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"` |
| `GITHUB_CLIENT_ID` | From your GitHub OAuth App |
| `GITHUB_CLIENT_SECRET` | From your GitHub OAuth App |
| `GITHUB_WEBHOOK_SECRET` | Random string; set the same value in your GitHub repo webhook settings |
| `GEMINI_API_KEY` | From Google AI Studio (Milestone 8 only) |
| `ALLOWED_ORIGINS` | Comma-separated list, e.g. `http://localhost:5173,https://yourdomain.com` |

See `SECURITY.md` for the full secrets policy.

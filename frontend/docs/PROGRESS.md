# Milestone 1 Progress

## Phase 1 – Check the State
- [x] Real brand logo applied everywhere
- [x] Auth card glitches reviewed (shadow consistent; badge overlap now fixed in Phase 3)
- [x] Avatar system working
- [x] Mock‑auth fixes applied
- [ ] Landing rocket illustration
- [ ] Other pages verified
- [ ] Rocky AI mascot displayed

## Phase 2 – Mock‑Auth Fixes
- [x] "Account already exists" error clears on field edit/resubmit (`clearGeneralError` called on every onChange)
- [x] Autocomplete attributes set: username `off`, email `email`, passwords `new-password` / `current-password`
- [x] Username validation message updated: "Usernames can only use letters, numbers and underscores (3 to 20 characters). The @ symbol is not allowed."
- [x] Register‑then‑login works — shared `runtimeUsers` / `runtimePasswords` via `mockData.ts`; case‑insensitive email matching; distinct errors ("No account found…" / "Wrong password…")
- [x] Account is saved only after full registration succeeds (`addRuntimeUser` called inside `registerWithEmail`, never before)
- [x] Login error clears when user edits email or password fields
- [x] "Reset mock data (dev only)" button added to `DevMockBanner`

## Phase 3 – UI Glitches & Logo
- [x] Username availability badge no longer overlaps input (margin-top fixed to positive value)
- [x] Auth card shadow consistent in both Register and Login (both use `var(--shadow-lg)`)
- [x] Logo not clipped — `object-fit: contain` + `max-width` added to `Brand.module.css`
- [ ] Responsive check at desktop & phone (to verify after build)

## Phase 4 – Avatar Optimisation
- [ ] Node script to shrink avatars (256 × 256) added
- [ ] `src/config/avatars.ts` imports optimized PNGs only
- [ ] `image‑rendering: pixelated` removed from avatar styles
- [ ] Optimized avatar file sizes logged

## Phase 5 – Landing‑page Rocket Upgrade
- [ ] `RocketIllustration` component created (palette‑compliant)
- [ ] Callout labels added (responsive hide on small screens)
- [ ] Layout non‑overlapping, animation on scroll (prefers‑reduced‑motion respected)

## Phase 6 – Verify the Rest
- [ ] All pages functional and styled according to palette
- [ ] No horizontal scrolling on phones

## Phase 7 – Build, Run & Report
- [ ] `npm install` / `npm run build` passes
- [ ] Dev server running (`http://localhost:5173`)
- [ ] End‑to‑end registration/login flow verified
- [ ] Final report written

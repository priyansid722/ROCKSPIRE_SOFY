# ROCKSPIRE SOFY — Design System

> **Milestone:** 1
> **Source of truth:** `frontend/src/styles/tokens.css` and `frontend/src/styles/global.css`

---

## 1. Colour Palette

All colours are defined as CSS custom properties. **No other colours may be
used anywhere in the codebase.** Use opacity variants for states.

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-cream` | `#FDFBD4` | Main backgrounds, large sections, light surfaces |
| `--color-rose` | `#DEA193` | Primary buttons, CTAs, highlights, active nav, accents |
| `--color-black` | `#000000` | Typography, headings, borders, icons, outlines |
| `--color-ecru` | `#E0CD95` | Secondary card backgrounds, decorative sections |
| `--color-pewter` | `#909EAE` | Secondary buttons, muted metadata, status elements |

### Opacity Variants

```css
--color-cream-80   --color-rose-20   --color-rose-40
--color-ecru-60    --color-pewter-20 --color-pewter-40
--color-black-10   --color-black-20  --color-black-40  --color-black-60
```

### Contrast Check

All text uses `--color-black` (`#000`) on palette backgrounds.
Black on cream (`#FDFBD4`) ≈ 17.5:1 — **passes AAA**.
Black on rose (`#DEA193`) ≈ 5.8:1 — **passes AA**.
Black on ecru (`#E0CD95`) ≈ 10.4:1 — **passes AAA**.
Black on pewter (`#909EAE`) ≈ 5.1:1 — **passes AA**.

---

## 2. Star Colours (Project Roles)

Stars are used **only** for project role indicators.
Every star has a `1.5px solid black` outline for contrast.
A text label or tooltip is always provided — colour is never the only signal.

| Token | Hex | Role | Accessibility label |
|-------|-----|------|---------------------|
| `--star-gold` | `#D4AF37` | Team Lead | "Team lead" |
| `--star-silver` | `#C0C0C0` | Team Member | "Team member" |
| `--star-glitter` | `#FDBBD4` | Solo Project | "Solo project" |

The glitter star has a subtle sparkle CSS animation (`@keyframes sparkle`),
which is disabled under `prefers-reduced-motion: reduce`.

### Star Legend (Profile Dashboard)

```
★ Gold    = Team Lead
★ Silver  = Team Member
✦ Pink    = Solo Project
```

---

## 3. Typography

Four Google Fonts, each with a specific job. The site should feel like a
typewriter-written mission log.

| Font | Variable | Primary Jobs |
|------|----------|-------------|
| **Courier Prime** | `--font-courier` | Body copy, paragraphs, descriptions, form inputs/labels, helper/error text, project descriptions, metadata, timestamps, facts, footer, terminal panels |
| **Aboreto** | `--font-aboreto` | ROCKSPIRE wordmark, page `<h1>` titles, major headings |
| **Alumni Sans** | `--font-alumni` | SOFY sub-wordmark, navigation links, buttons, badges, tabs |
| **Advent Pro** | `--font-advent` | Sub-headings (`h2`–`h4`), card titles, section eyebrows, stat numbers, department names |

### Type Scale

| Token | Size (range) | Usage |
|-------|-------------|-------|
| `--text-xs` | 10–12px | Badges, timestamps, footnotes |
| `--text-sm` | 12–14px | Helper text, captions |
| `--text-base` | 14–16px | Default body |
| `--text-md` | 16–18px | Body copy, inputs, nav links |
| `--text-lg` | 18–20px | Large body, lead text |
| `--text-xl` | 20–24px | Card titles, sub-headings |
| `--text-2xl` | 24–32px | Section headings |
| `--text-3xl` | 32–44px | Page headings |
| `--text-4xl` | 44–56px | Display headings |
| `--text-5xl` | 56–72px | Hero headings |
| `--text-6xl` | 72–96px | 404 code display |

Sizes use `clamp()` for fluid scaling — no media queries needed for font sizes.

### Typewriter Effect

The landing page tagline and rotating facts use a CSS `steps()` animation
to reveal text character by character. Disabled under `prefers-reduced-motion`.
See `TypewriterText` component.

---

## 4. Spacing

4px base grid. All spacing values are CSS custom properties.

| Token | Value |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |
| `--space-16` | 64px |
| `--space-20` | 80px |
| `--space-24` | 96px |
| `--space-32` | 128px |

---

## 5. Borders & Shadows

```css
--border-thin:   1px solid black    /* cards, inputs, most elements */
--border-medium: 2px solid black    /* emphasis */
--border-thick:  3px solid black    /* active states */
--border-muted:  1px solid rgba(0,0,0,0.12)   /* dividers */

--shadow-sm:  2px 2px 0 black       /* subtle lift */
--shadow-md:  4px 4px 0 black       /* cards */
--shadow-lg:  6px 6px 0 black       /* hover elevation */
--shadow-xl:  8px 8px 0 black       /* modal/important */
--shadow-soft: 0 4px 24px rgba(0,0,0,0.12)   /* gentle depth */
```

Shadows are "offset" style (no blur), consistent with the editorial aesthetic.

---

## 6. Border Radii

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | 0 | Strict rectangular |
| `--radius-sm` | 4px | Small elements, badges |
| `--radius-md` | 8px | Buttons, cards |
| `--radius-lg` | 16px | Panels, modals |
| `--radius-xl` | 24px | Large cards |
| `--radius-pill` | 9999px | Status pills, chips |

---

## 7. Component Inventory

| Component | Variants / Props | Notes |
|-----------|-----------------|-------|
| `Button` | primary (rose), secondary (pewter), ghost | `isLoading`, `fullWidth`, `size` (sm/md/lg) |
| `FormField` | input / textarea | `error`, `hint`, `as` |
| `PasswordField` | — | Show/hide toggle with eye SVG |
| `Card` | cream, ecru, pewter, rose backgrounds | `elevation` (flat/raised), clickable |
| `StatusBadge` | planning, ongoing, completed | Alumni Sans, pill shape |
| `StarBadge` | lead (gold), member (silver), solo (glitter) | Black outline, label tooltip |
| `ProjectCard` | — | Rocket name, star, description, status, timestamp |
| `Avatar` | 10 SVG avatars | Size sm/md/lg; `AvatarPicker` in profile edit |
| `Brand` | size sm/md/lg | Real pixel-art logo, `image-rendering: pixelated` |
| `RockyMascot` | size sm/md/lg/xl | animate prop, labelled "Coming Later" |
| `Navbar` | — | Sticky, auth-aware, mobile hamburger |
| `Footer` | — | Black bg, inverted logo, Terms + Contact links |
| `TypewriterText` | `text`, `duration`, `as` | CSS steps animation |
| `LoadingState` | `fullPage`, `message` | Floating rocket SVG |
| `ErrorState` | `message`, `onRetry` | Warning icon + retry button |
| `EmptyState` | `title`, `description`, `action` | Rocket illustration |
| `ProtectedRoute` | — | Wraps protected routes; redirects to /login |
| `DevMockBanner` | — | Fixed top banner in mock mode; shows test creds |

---

## 8. Breakpoints

```
--bp-mobile:  375px   /* single column, full-width forms */
--bp-tablet:  768px   /* 2-column grids, hamburger nav */
--bp-laptop:  1024px  /* 3-column grids */
--bp-desktop: 1280px  /* max-width container */
```

Container max-widths: `--max-width-content: 1200px`, `--max-width-narrow: 680px`.

---

## 9. Motion & Animation

| Class / keyframe | Description |
|-----------------|-------------|
| `@keyframes float` | Gentle rocket float (LoadingState, 404) |
| `@keyframes fadeIn` | Opacity + translateY (panels, modals) |
| `@keyframes spin` | Button loading spinner |
| `@keyframes sparkle` | Star glitter ping (StarBadge) |
| `@keyframes typewriter` | Character-reveal steps (TypewriterText) |

All animations are wrapped in:
```css
@media (prefers-reduced-motion: reduce) {
  animation: none;
  transition: none;
}
```

---

## 10. Global CSS Rules

Defined in `global.css`:

- CSS reset (box-sizing, margin/padding zero, `ul { list-style: none }`)
- `:focus-visible` outline: `3px solid var(--color-black)` with 2px offset
- `a` default: black, no underline; hover: `opacity: 0.7`
- `img`: `max-width: 100%; display: block`
- `.visually-hidden` utility for accessible-only text
- `.container` and `.container--narrow` layout helpers

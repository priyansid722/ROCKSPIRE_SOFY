# Rockspire Sofy — Presentation

A 6-slide portfolio deck for **Rockspire Sofy**, generated programmatically
with [`python-pptx`](https://python-pptx.readthedocs.io/).

## Files

| File | Purpose |
|------|---------|
| `Rockspire_Sofy_Presentation.pptx` | The final 6-slide deck (deliverable). |
| `build_ppt.py` | Generator script — rebuilds the `.pptx` from scratch. |
| `_render_check.py` | Dev-only: renders each slide to PNG and reports text overflow (used to verify layout since LibreOffice is unavailable in CI). |
| `assets/` | `rockspire-logo.png` and a background-cleaned `mascot.png`. |

## Slides

1. **Title** — wordmark, tagline, author, GitHub link.
2. **The problem** — 6 community problems the project addresses.
3. **The solution** — the repo → findings → job match → missions → rocket
   pipeline, plus the 9-part mission-control rocket (drawn with shapes).
4. **Architecture & tech stack** — frontend / backend / services + FinOps note.
5. **Progress & roadmap** — honest status as a timeline (M1 done; M2–9 and
   later phases planned).
6. **Vision, learnings & next steps** — call to action + mascot.

## Rebuild

```bash
python -m venv .venv && source .venv/bin/activate
pip install python-pptx Pillow
python build_ppt.py        # writes Rockspire_Sofy_Presentation.pptx
python _render_check.py     # optional: renders previews + overflow report
```

## Design

- **Colours:** cream `#FDFBD4`, rose gold `#DEA193`, black `#000000`,
  ecru `#E0CD95`, pewter `#909EAE`.
- **Fonts:** Aboreto (title only), Alumni Sans (headings), Advent Pro
  (numbers/labels), Courier New (body + fallback). Font *names* are embedded;
  machines without the brand fonts fall back to Courier New.
- Diagrams (rocket, timeline) are drawn with native shapes, not images.

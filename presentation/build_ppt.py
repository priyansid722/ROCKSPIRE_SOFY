"""
build_ppt.py
================
Generates `Rockspire_Sofy_Presentation.pptx` — a 6-slide student portfolio
deck for the "Rockspire Sofy" project.

Run:
    python build_ppt.py

Dependencies:
    pip install python-pptx Pillow

Design language (from docs/DESIGN_SYSTEM.md + project brief):
    - Cream background, rose-gold accents, black text, ecru cards, pewter lines.
    - Fonts: Aboreto (title only), Alumni Sans (headings),
      Advent Pro (numbers/labels), Courier New (body + universal fallback).
    - All diagrams (rocket, timeline) are drawn with native shapes, not images.
"""

from __future__ import annotations

import os

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_AUTO_SIZE
from pptx.oxml.ns import qn

try:
    from PIL import Image
    _HAS_PIL = True
except ImportError:  # pragma: no cover
    _HAS_PIL = False

# --------------------------------------------------------------------------- #
# Paths
# --------------------------------------------------------------------------- #
HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "assets")
LOGO = os.path.join(ASSETS, "rockspire-logo.png")
LOGO_SRC = LOGO                                   # original (already RGBA)
LOGO_T = os.path.join(ASSETS, "rockspire-logo-transparent.png")
MASCOT = os.path.join(ASSETS, "mascot.png")
OUT = os.path.join(HERE, "Rockspire_Sofy_Presentation.pptx")

GITHUB_URL = "github.com/priyansid722/ROCKSPIRE_SOFY"


def ensure_transparent_logo():
    """Make white / near-white pixels of the logo transparent (Pillow) and
    save to LOGO_T. The source logo is already mostly transparent, but we
    run this so the corner logo blends cleanly on any background."""
    if not _HAS_PIL:
        return LOGO_SRC
    try:
        im = Image.open(LOGO_SRC).convert("RGBA")
        px = im.load()
        w, h = im.size
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                if r >= 240 and g >= 240 and b >= 240:
                    px[x, y] = (r, g, b, 0)
        im.save(LOGO_T)
        return LOGO_T
    except Exception:
        return LOGO_SRC

# --------------------------------------------------------------------------- #
# Palette
# --------------------------------------------------------------------------- #
CREAM = RGBColor(0xFD, 0xFB, 0xD4)
ROSE = RGBColor(0xDE, 0xA1, 0x93)
BLACK = RGBColor(0x00, 0x00, 0x00)
ECRU = RGBColor(0xE0, 0xCD, 0x95)
PEWTER = RGBColor(0x90, 0x9E, 0xAE)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)

# --------------------------------------------------------------------------- #
# Fonts (names are embedded; they render where installed, else fall back)
# --------------------------------------------------------------------------- #
F_TITLE = "Aboreto"          # title slide wordmark only
F_HEAD = "Alumni Sans"       # headings
F_NUM = "Advent Pro"         # numbers / labels / eyebrows
F_BODY = "Courier New"       # body + universal fallback
FALLBACK = "Courier New"

# --------------------------------------------------------------------------- #
# Slide geometry (16:9)
# --------------------------------------------------------------------------- #
SW = Inches(13.333)
SH = Inches(7.5)

# --------------------------------------------------------------------------- #
# Low-level helpers
# --------------------------------------------------------------------------- #

def _set_fill(shape, color):
    shape.fill.solid()
    shape.fill.fore_color.rgb = color


def _set_line(shape, color=None, width=None):
    if color is None:
        shape.line.fill.background()
    else:
        shape.line.color.rgb = color
        if width is not None:
            shape.line.width = width


def _no_shadow(shape):
    """python-pptx adds a default preset shadow on autoshapes; strip it."""
    spPr = shape.fill._xPr  # spPr element
    # remove any existing effect list, then add an empty one (no shadow)
    for tag in ("a:effectLst", "a:effectDag"):
        for el in spPr.findall(qn(tag)):
            spPr.remove(el)
    spPr.append(spPr.makeelement(qn("a:effectLst"), {}))


def add_rect(slide, x, y, w, h, fill=None, line=None, line_w=None,
             shape=MSO_SHAPE.RECTANGLE):
    sp = slide.shapes.add_shape(shape, x, y, w, h)
    if fill is None:
        sp.fill.background()
    else:
        _set_fill(sp, fill)
    _set_line(sp, line, line_w)
    _no_shadow(sp)
    sp.text_frame.clear()
    return sp


def _apply_run(run, text, size, color, font, bold=False, italic=False):
    run.text = text
    run.font.size = Pt(size)
    run.font.color.rgb = color
    run.font.name = font
    run.font.bold = bold
    run.font.italic = italic
    # set the fallback for all script ranges
    rPr = run._r.get_or_add_rPr()
    for tag in ("a:latin", "a:cs", "a:ea"):
        el = rPr.find(qn(tag))
        if el is None:
            el = rPr.makeelement(qn(tag), {})
            rPr.append(el)
        el.set("typeface", font)


def add_text(slide, x, y, w, h, runs, align=PP_ALIGN.LEFT,
             anchor=MSO_ANCHOR.TOP, line_spacing=1.0, space_after=0,
             wrap=True):
    """runs: list of paragraphs; each paragraph is a list of run dicts."""
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = wrap
    tf.auto_size = MSO_AUTO_SIZE.NONE
    tf.vertical_anchor = anchor
    tf.margin_left = 0
    tf.margin_right = 0
    tf.margin_top = 0
    tf.margin_bottom = 0
    for i, para in enumerate(runs):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        if line_spacing:
            p.line_spacing = line_spacing
        if space_after:
            p.space_after = Pt(space_after)
        for rd in para:
            r = p.add_run()
            _apply_run(
                r, rd["t"], rd["s"], rd.get("c", BLACK),
                rd.get("f", F_BODY), rd.get("b", False), rd.get("i", False),
            )
    return tb


def run(t, s, c=BLACK, f=F_BODY, b=False, i=False):
    return {"t": t, "s": s, "c": c, "f": f, "b": b, "i": i}


def add_line(slide, x1, y1, x2, y2, color=PEWTER, width=Pt(1.5), dash=None):
    ln = slide.shapes.add_connector(2, x1, y1, x2, y2)  # straight connector
    ln.line.color.rgb = color
    ln.line.width = width
    if dash is not None:
        lnEl = ln.line._get_or_add_ln()
        d = lnEl.makeelement(qn("a:prstDash"), {"val": dash})
        lnEl.append(d)
    return ln


def img_size(path):
    if _HAS_PIL:
        with Image.open(path) as im:
            return im.size
    return (1, 1)


def add_image_fit(slide, path, x, y, max_w, max_h, align="center",
                  valign="middle"):
    """Place an image scaled to fit inside the box, preserving aspect."""
    iw, ih = img_size(path)
    box_r = max_w / max_h
    img_r = iw / ih
    if img_r > box_r:
        w = max_w
        h = Emu(int(max_w * ih / iw))
    else:
        h = max_h
        w = Emu(int(max_h * iw / ih))
    if align == "center":
        px = x + (max_w - w) // 2
    elif align == "right":
        px = x + (max_w - w)
    else:
        px = x
    if valign == "middle":
        py = y + (max_h - h) // 2
    elif valign == "bottom":
        py = y + (max_h - h)
    else:
        py = y
    return slide.shapes.add_picture(path, px, py, w, h)


# --------------------------------------------------------------------------- #
# Shared slide chrome
# --------------------------------------------------------------------------- #

MARGIN = Inches(0.6)


# Corner chrome geometry — identical on every slide.
LOGO_W = Inches(1.45)          # small but readable corner logo
LOGO_H = Inches(0.72)          # (2:1 wordmark aspect fits inside this box)
LOGO_X = SW - MARGIN - LOGO_W  # top-right
LOGO_Y = Inches(0.32)
NUM_X = MARGIN                 # top-left slide number
NUM_Y = Inches(0.3)


def new_slide(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])  # blank
    add_rect(s, 0, 0, SW, SH, fill=CREAM)
    return s


def corner_logo(slide):
    """Small Rockspire logo, top-right, same size/position on every slide."""
    add_image_fit(slide, LOGO_T, LOGO_X, LOGO_Y, LOGO_W, LOGO_H,
                  align="right", valign="middle")


def slide_number(slide, num):
    """Slide number in the top-left corner (Advent Pro, pewter)."""
    add_text(slide, NUM_X, NUM_Y, Inches(1.2), Inches(0.4),
             [[run(f"{num:02d}", 18, PEWTER, F_NUM, b=True)]],
             align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.MIDDLE)


def chrome(slide, num):
    """Add the corner logo + slide number present on all six slides."""
    corner_logo(slide)
    slide_number(slide, num)


def header(slide, eyebrow, title, num):
    """Standard content-slide header. Logo (top-right) + number (top-left)
    live in the corners; eyebrow/title sit below them so nothing collides."""
    chrome(slide, num)
    # eyebrow — sits just below the top-left slide number (which ends ~0.7")
    add_text(slide, MARGIN, Inches(0.74), Inches(9), Inches(0.32),
             [[run(eyebrow.upper(), 14, ROSE, F_NUM, b=True)]])
    # title — a touch lower than the original to clear the corner chrome;
    # width capped so it cannot reach the top-right logo
    add_text(slide, MARGIN, Inches(1.0), Inches(10.4), Inches(0.85),
             [[run(title, 38, BLACK, F_HEAD, b=True)]])
    # underline rule
    add_line(slide, MARGIN, Inches(1.74), SW - MARGIN, Inches(1.74),
             color=BLACK, width=Pt(2.25))


def footer(slide):
    add_text(slide, MARGIN, SH - Inches(0.5), Inches(7), Inches(0.3),
             [[run("ROCKSPIRE SOFY", 9, PEWTER, F_NUM, b=True),
               run("   ·   Student Portfolio Project", 9, PEWTER, F_BODY)]])
    add_text(slide, SW - Inches(5.6), SH - Inches(0.5), Inches(5),
             Inches(0.3), [[run(GITHUB_URL, 9, PEWTER, F_BODY)]],
             align=PP_ALIGN.RIGHT)


def bullet(label_runs):
    """Helper: build a bullet paragraph led by a rose square glyph."""
    return [run("\u25AA  ", 15, ROSE, F_BODY, b=True)] + label_runs


def add_bullets(slide, x, y, w, h, items, size=13, color=BLACK,
                line_spacing=1.05, space_after=6, glyph_color=ROSE):
    """Bulleted list with a real hanging indent so wrapped lines align."""
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.auto_size = MSO_AUTO_SIZE.NONE
    tf.margin_left = 0
    tf.margin_right = 0
    tf.margin_top = 0
    tf.margin_bottom = 0
    indent = Pt(16)
    for i, text in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.line_spacing = line_spacing
        p.space_after = Pt(space_after)
        # hanging indent: first line starts at 0, wraps indent under text
        pPr = p._pPr if p._pPr is not None else p.get_or_add_pPr()
        pPr.set("marL", str(int(indent)))
        pPr.set("indent", str(-int(indent)))
        rg = p.add_run()
        _apply_run(rg, "\u25AA  ", size, glyph_color, F_BODY, bold=True)
        rt = p.add_run()
        _apply_run(rt, text, size, color, F_BODY)
    return tb


# --------------------------------------------------------------------------- #
# SLIDE 1 — TITLE
# --------------------------------------------------------------------------- #

def slide_title(prs):
    s = new_slide(prs)
    # decorative side panel
    add_rect(s, 0, 0, Inches(0.35), SH, fill=ROSE)
    # thin top rule (kept clear of the corner chrome)
    add_line(s, Inches(1.0), Inches(1.15), SW - Inches(1.0), Inches(1.15),
             color=PEWTER, width=Pt(1.25))

    # corner chrome: small logo top-right + "01" top-left (as on every slide)
    chrome(s, 1)

    # hero logo (kept — "Rockspire Sofy" wordmark stays)
    add_image_fit(s, LOGO, Inches(1.0), Inches(1.5), Inches(6.0),
                  Inches(1.55), align="left")

    # big wordmark title (Aboreto)
    add_text(s, Inches(1.0), Inches(3.2), Inches(11.4), Inches(1.4),
             [[run("ROCKSPIRE SOFY", 62, BLACK, F_TITLE, b=True)]])

    # tagline
    add_text(s, Inches(1.03), Inches(4.42), Inches(11), Inches(0.7),
             [[run("AI-powered software development intelligence for "
                   "your portfolio.", 20, BLACK, F_BODY)]])

    # accent rule under tagline
    add_line(s, Inches(1.05), Inches(5.02), Inches(6.2), Inches(5.02),
             color=ROSE, width=Pt(3))

    # team + repo card (both team members credited)
    card = add_rect(s, Inches(1.0), Inches(5.35), Inches(9.9), Inches(1.6),
                    fill=ECRU, line=BLACK, line_w=Pt(1.5))
    # Priyansi Das — Team Lead
    add_text(s, Inches(1.25), Inches(5.47), Inches(9.4), Inches(0.4),
             [[run("TEAM LEAD   ", 11, PEWTER, F_NUM, b=True),
               run("Priyansi Das", 18, BLACK, F_HEAD, b=True),
               run("   \u25B8 github.com/priyansid722", 12, BLACK, F_BODY)]],
             anchor=MSO_ANCHOR.MIDDLE)
    # Trishanu — Team Member
    add_text(s, Inches(1.25), Inches(5.9), Inches(9.4), Inches(0.4),
             [[run("TEAM MEMBER   ", 11, PEWTER, F_NUM, b=True),
               run("Trishanu Dasgupta", 18, BLACK, F_HEAD, b=True),
               run("   \u25B8 github.com/trishanudg01", 12, BLACK, F_BODY)]],
             anchor=MSO_ANCHOR.MIDDLE)
    # project repo
    add_text(s, Inches(1.25), Inches(6.35), Inches(9.4), Inches(0.4),
             [[run("PROJECT   ", 11, PEWTER, F_NUM, b=True),
               run("\u25B8 " + GITHUB_URL, 13, BLACK, F_BODY, b=True)]],
             anchor=MSO_ANCHOR.MIDDLE)

    footer(s)
    return s


# --------------------------------------------------------------------------- #
# SLIDE 2 — THE PROBLEM
# --------------------------------------------------------------------------- #

def slide_problem(prs):
    s = new_slide(prs)
    header(s, "The Problem", "Portfolios build in the dark", 2)

    # lead statement
    add_text(s, MARGIN, Inches(1.85), Inches(12.1), Inches(0.75),
             [[run("Students ship projects with no feedback loop — unsure "
                   "what their code proves, what it risks, or what to fix "
                   "next.", 16, BLACK, F_BODY)]], line_spacing=1.05)

    # two columns of community problems, as cards
    problems = [
        ("01", "No feedback", "Beginners get zero review on portfolio projects."),
        ("02", "Hidden skill gaps", "Can't tell which skills a repo proves for a job post."),
        ("03", "Leaked API keys", "Secrets sit exposed in student repos."),
        ("04", "Surprise bills", "Cloud & AI costs arrive with no warning."),
        ("05", "Abandoned projects", "Hackathon & course repos stall half-finished."),
        ("06", "Over-trusting AI", "AI-generated code is shipped unchecked."),
    ]
    col_w = Inches(5.95)
    row_h = Inches(1.15)
    gap = Inches(0.22)
    x0 = MARGIN
    x1 = MARGIN + col_w + gap
    y0 = Inches(2.75)
    for i, (num, title, desc) in enumerate(problems):
        col = i % 2
        row = i // 2
        x = x0 if col == 0 else x1
        y = y0 + row * (row_h + Inches(0.12))
        add_rect(s, x, y, col_w, row_h, fill=ECRU, line=BLACK, line_w=Pt(1.25))
        # number badge
        add_text(s, x + Inches(0.18), y, Inches(1.0), row_h,
                 [[run(num, 30, ROSE, F_NUM, b=True)]],
                 anchor=MSO_ANCHOR.MIDDLE)
        add_text(s, x + Inches(1.15), y + Inches(0.14), col_w - Inches(1.3),
                 Inches(0.45),
                 [[run(title, 18, BLACK, F_HEAD, b=True)]])
        add_text(s, x + Inches(1.15), y + Inches(0.58), col_w - Inches(1.3),
                 Inches(0.5),
                 [[run(desc, 12, BLACK, F_BODY)]], line_spacing=1.0)

    footer(s)
    return s


# --------------------------------------------------------------------------- #
# SLIDE 3 — THE SOLUTION + 9-PART ROCKET
# --------------------------------------------------------------------------- #

def slide_solution(prs):
    s = new_slide(prs)
    header(s, "The Solution", "From repo to launch-ready", 3)

    # LEFT: the pipeline (flow of 5 steps) + supporting bullets
    left_x = MARGIN
    left_w = Inches(7.1)

    add_text(s, left_x, Inches(1.85), left_w, Inches(0.4),
             [[run("HOW IT WORKS", 13, ROSE, F_NUM, b=True)]])

    steps = ["Connect repo", "Evidence findings", "Match to job",
             "Turn gaps into missions", "Track on the rocket"]
    sy = Inches(2.3)
    step_h = Inches(0.6)
    step_gap = Inches(0.17)
    for i, st in enumerate(steps):
        y = sy + i * (step_h + step_gap)
        add_rect(s, left_x, y, left_w, step_h,
                 fill=CREAM if i % 2 else ROSE, line=BLACK, line_w=Pt(1.5))
        add_text(s, left_x + Inches(0.15), y, Inches(0.7), step_h,
                 [[run(str(i + 1), 22, BLACK, F_NUM, b=True)]],
                 anchor=MSO_ANCHOR.MIDDLE)
        add_text(s, left_x + Inches(0.85), y, left_w - Inches(1.0), step_h,
                 [[run(st, 17, BLACK, F_HEAD, b=True)]],
                 anchor=MSO_ANCHOR.MIDDLE)
        # arrow between steps
        if i < len(steps) - 1:
            ax = left_x + Inches(0.42)
            add_text(s, ax, y + step_h - Inches(0.02), Inches(0.5),
                     Inches(0.2),
                     [[run("\u25BC", 11, PEWTER, F_BODY)]],
                     align=PP_ALIGN.CENTER)

    add_text(s, left_x, sy + 5 * (step_h + step_gap) + Inches(0.05),
             left_w, Inches(0.5),
             [[run("Findings are labelled ", 12, BLACK, F_BODY),
               run("confirmed / possible / suggestion", 12, BLACK, F_BODY, b=True),
               run(".", 12, BLACK, F_BODY)]], line_spacing=1.0)

    # RIGHT: the 9-part rocket, drawn with shapes
    draw_rocket(s, origin_x=Inches(8.5), origin_y=Inches(1.9))

    footer(s)
    return s


def draw_rocket(slide, origin_x, origin_y):
    """Draw a simple rocket from shapes with a numbered legend of 9 parts."""
    cx = origin_x + Inches(0.85)   # rocket centre-x
    body_w = Inches(1.3)
    # --- Nose cone (1) : triangle
    nose_h = Inches(0.75)
    nose = slide.shapes.add_shape(MSO_SHAPE.ISOSCELES_TRIANGLE,
                                  cx - body_w / 2, origin_y, body_w, nose_h)
    _set_fill(nose, ROSE)
    _set_line(nose, BLACK, Pt(1.5))
    _no_shadow(nose)
    # nose cone number (1)
    add_text(slide, cx - body_w / 2, origin_y + Inches(0.26), body_w,
             Inches(0.4),
             [[run("1", 15, BLACK, F_NUM, b=True)]],
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.TOP)

    # --- Body stack: payload(2), avionics(3), nav(4), fuel(5), engine(6)
    body_y = origin_y + nose_h
    seg_h = Inches(0.55)
    seg_colors = [ECRU, CREAM, ECRU, CREAM, ECRU]
    seg_nums = ["2", "3", "4", "5", "6"]
    for i in range(5):
        y = body_y + i * seg_h
        seg = add_rect(slide, cx - body_w / 2, y, body_w, seg_h,
                       fill=seg_colors[i], line=BLACK, line_w=Pt(1.25))
        add_text(slide, cx - body_w / 2, y, body_w, seg_h,
                 [[run(seg_nums[i], 16, BLACK, F_NUM, b=True)]],
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

    body_bottom = body_y + 5 * seg_h

    # --- Fins (7) : two triangles
    fin_w = Inches(0.55)
    fin_h = Inches(0.8)
    lfin = slide.shapes.add_shape(MSO_SHAPE.RIGHT_TRIANGLE,
                                  cx - body_w / 2 - fin_w + Inches(0.05),
                                  body_bottom - fin_h, fin_w, fin_h)
    _set_fill(lfin, ROSE)
    _set_line(lfin, BLACK, Pt(1.25))
    _no_shadow(lfin)
    rfin = slide.shapes.add_shape(MSO_SHAPE.RIGHT_TRIANGLE,
                                  cx + body_w / 2 - Inches(0.05),
                                  body_bottom - fin_h, fin_w, fin_h)
    _set_fill(rfin, ROSE)
    _set_line(rfin, BLACK, Pt(1.25))
    _no_shadow(rfin)
    rfin.rotation = 0
    # flip the right fin horizontally
    rfin.element.spPr.xfrm.set("flipH", "1")
    # fins number (7) — placed on the left fin
    add_text(slide, cx - body_w / 2 - fin_w + Inches(0.05),
             body_bottom - fin_h + Inches(0.42), fin_w, Inches(0.35),
             [[run("7", 13, BLACK, F_NUM, b=True)]],
             align=PP_ALIGN.CENTER)

    # --- Engine / launch nozzle (8) : trapezoid
    noz_w = Inches(0.8)
    noz_h = Inches(0.45)
    noz = slide.shapes.add_shape(MSO_SHAPE.TRAPEZOID,
                                 cx - noz_w / 2, body_bottom, noz_w, noz_h)
    noz.rotation = 180
    _set_fill(noz, PEWTER)
    _set_line(noz, BLACK, Pt(1.25))
    _no_shadow(noz)
    # engine / structural-body nozzle number (8)
    add_text(slide, cx - noz_w / 2, body_bottom + Inches(0.03), noz_w,
             Inches(0.35),
             [[run("8", 13, BLACK, F_NUM, b=True)]],
             align=PP_ALIGN.CENTER)

    # --- Launch flame / system (9) : small triangle below nozzle
    fl_w = Inches(0.5)
    fl_h = Inches(0.5)
    flame = slide.shapes.add_shape(MSO_SHAPE.ISOSCELES_TRIANGLE,
                                   cx - fl_w / 2, body_bottom + noz_h,
                                   fl_w, fl_h)
    flame.rotation = 180
    _set_fill(flame, ROSE)
    _set_line(flame, BLACK, Pt(1))
    _no_shadow(flame)
    # launch-system flame number (9)
    add_text(slide, cx - fl_w / 2, body_bottom + noz_h + Inches(0.02),
             fl_w, Inches(0.3),
             [[run("9", 12, BLACK, F_NUM, b=True)]],
             align=PP_ALIGN.CENTER)

    # --- Legend of 9 parts (to the right of the rocket) ---
    legend = [
        ("1", "Nose cone", "Docs"),
        ("2", "Payload", "Core features"),
        ("3", "Avionics", "App logic"),
        ("4", "Navigation", "Testing"),
        ("5", "Fuel", "Dependencies"),
        ("6", "Engine", "Backend"),
        ("7", "Fins", "Security"),
        ("8", "Structural body", "Architecture"),
        ("9", "Launch system", "Deployment"),
    ]
    lx = origin_x + Inches(2.1)
    ly = origin_y - Inches(0.05)
    lh = Inches(0.44)
    add_text(slide, lx, ly - Inches(0.1), Inches(2.9), Inches(0.3),
             [[run("THE 9-PART ROCKET", 12, ROSE, F_NUM, b=True)]])
    for i, (n, part, meaning) in enumerate(legend):
        y = ly + Inches(0.28) + i * lh
        add_text(slide, lx, y, Inches(0.35), lh,
                 [[run(n, 14, ROSE, F_NUM, b=True)]],
                 anchor=MSO_ANCHOR.MIDDLE)
        add_text(slide, lx + Inches(0.35), y, Inches(2.6), lh,
                 [[run(part + "  ", 12, BLACK, F_HEAD, b=True),
                   run("= " + meaning, 11, PEWTER, F_BODY)]],
                 anchor=MSO_ANCHOR.MIDDLE)


# --------------------------------------------------------------------------- #
# SLIDE 4 — ARCHITECTURE & TECH STACK
# --------------------------------------------------------------------------- #

def slide_architecture(prs):
    s = new_slide(prs)
    header(s, "Architecture", "How the system fits together", 4)

    # Flow diagram: Frontend -> Backend -> (Supabase / GitHub App / Gemini)
    box_w = Inches(2.9)
    box_h = Inches(1.15)
    y_top = Inches(2.15)

    def arch_box(x, y, w, h, title, sub, fill):
        add_rect(s, x, y, w, h, fill=fill, line=BLACK, line_w=Pt(1.75))
        add_text(s, x + Inches(0.15), y + Inches(0.12), w - Inches(0.3),
                 Inches(0.5),
                 [[run(title, 17, BLACK, F_HEAD, b=True)]])
        add_text(s, x + Inches(0.15), y + Inches(0.58), w - Inches(0.3),
                 Inches(0.5),
                 [[run(sub, 11, BLACK, F_BODY)]], line_spacing=1.0)

    fx = MARGIN
    bx = MARGIN + box_w + Inches(0.95)
    arch_box(fx, y_top, box_w, box_h, "Frontend",
             "React + TypeScript + Vite", ECRU)
    arch_box(bx, y_top, box_w, box_h, "Backend API",
             "Python + FastAPI", ROSE)

    # arrow frontend -> backend
    add_text(s, fx + box_w, y_top, Inches(0.95), box_h,
             [[run("\u2192", 30, PEWTER, F_BODY, b=True)]],
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

    # three service boxes below the backend
    svc_w = Inches(3.55)
    svc_h = Inches(1.0)
    sy = Inches(4.05)
    svcs = [
        ("Supabase", "PostgreSQL + Auth"),
        ("GitHub App", "Repository access"),
        ("Gemini API", "AI analysis"),
    ]
    sx0 = MARGIN
    for i, (t, sub) in enumerate(svcs):
        x = sx0 + i * (svc_w + Inches(0.28))
        add_rect(s, x, sy, svc_w, svc_h, fill=CREAM, line=BLACK,
                 line_w=Pt(1.5))
        add_text(s, x + Inches(0.15), sy + Inches(0.12), svc_w - Inches(0.3),
                 Inches(0.45),
                 [[run(t, 16, BLACK, F_HEAD, b=True)]])
        add_text(s, x + Inches(0.15), sy + Inches(0.55), svc_w - Inches(0.3),
                 Inches(0.4),
                 [[run(sub, 11, BLACK, F_BODY)]])
        # connector from backend down to each service
        add_line(s, bx + box_w / 2, y_top + box_h,
                 x + svc_w / 2, sy, color=PEWTER, width=Pt(1.25),
                 dash="dash")

    # FinOps note strip
    add_rect(s, MARGIN, Inches(5.55), SW - 2 * MARGIN, Inches(0.78),
             fill=ECRU, line=BLACK, line_w=Pt(1.25))
    add_text(s, MARGIN + Inches(0.25), Inches(5.55), SW - 2 * MARGIN - Inches(0.5),
             Inches(0.78),
             [[run("FINOPS LAYER   ", 13, BLACK, F_NUM, b=True),
               run("A cost layer tracks the platform's own AI spend and "
                   "labels every number ", 13, BLACK, F_BODY),
               run("ACTUAL", 13, BLACK, F_BODY, b=True),
               run(" or ", 13, BLACK, F_BODY),
               run("ESTIMATE", 13, BLACK, F_BODY, b=True),
               run(".", 13, BLACK, F_BODY)]],
             anchor=MSO_ANCHOR.MIDDLE, line_spacing=1.05)

    footer(s)
    return s


# --------------------------------------------------------------------------- #
# SLIDE 5 — PROGRESS & ROADMAP TIMELINE
# --------------------------------------------------------------------------- #

def slide_roadmap(prs):
    s = new_slide(prs)
    header(s, "Progress & Roadmap", "Honest status, clear next steps", 5)

    # status legend
    add_text(s, MARGIN, Inches(1.8), Inches(12), Inches(0.35),
             [[run("\u25CF ", 13, ROSE, F_BODY, b=True),
               run("Done     ", 12, BLACK, F_NUM, b=True),
               run("\u25CB ", 13, PEWTER, F_BODY, b=True),
               run("In progress / next     ", 12, BLACK, F_NUM, b=True),
               run("\u25C7 ", 13, PEWTER, F_BODY, b=True),
               run("Later", 12, BLACK, F_NUM, b=True)]])

    # timeline backbone — placed with room for cards above and below
    tl_y = Inches(4.15)
    tl_x0 = MARGIN + Inches(0.1)
    tl_x1 = SW - MARGIN - Inches(0.1)
    add_line(s, tl_x0, tl_y, tl_x1, tl_y, color=BLACK, width=Pt(2.5))

    phases = [
        ("M1", "Specification", "Blueprint, scope,\narch, API, DB,\nsecurity model", "done"),
        ("M2-9", "Build", "Frontend, backend,\nauth, GitHub, analysis,\nAI, rocket, matching", "next"),
        ("+", "Mission AI", "Smarter missions\nfrom findings", "later"),
        ("+", "Crew Mode", "Mentors track\nseveral learners", "later"),
        ("+", "Full FinOps", "Complete cost\n& budget layer", "later"),
    ]
    n = len(phases)
    span = tl_x1 - tl_x0
    for i, (tag, title, desc, status) in enumerate(phases):
        cx = tl_x0 + Emu(int(span * (i + 0.5) / n))
        # node
        node_d = Inches(0.42)
        if status == "done":
            fill = ROSE
            shape = MSO_SHAPE.OVAL
        elif status == "next":
            fill = ECRU
            shape = MSO_SHAPE.OVAL
        else:
            fill = CREAM
            shape = MSO_SHAPE.DIAMOND
        node = add_rect(s, cx - node_d / 2, tl_y - node_d / 2, node_d,
                        node_d, fill=fill, line=BLACK, line_w=Pt(2),
                        shape=shape)

        # alternate cards above / below the line
        above = (i % 2 == 0)
        card_w = Inches(2.2)
        card_h = Inches(1.5)
        card_x = cx - card_w / 2
        if above:
            card_y = tl_y - Inches(0.4) - card_h
            # stem
            add_line(s, cx, tl_y - node_d / 2, cx, card_y + card_h,
                     color=PEWTER, width=Pt(1.25))
        else:
            card_y = tl_y + Inches(0.4)
            add_line(s, cx, tl_y + node_d / 2, cx, card_y,
                     color=PEWTER, width=Pt(1.25))

        card_fill = ECRU if status == "done" else CREAM
        add_rect(s, card_x, card_y, card_w, card_h, fill=card_fill,
                 line=BLACK, line_w=Pt(1.25))
        add_text(s, card_x + Inches(0.12), card_y + Inches(0.1),
                 card_w - Inches(0.24), Inches(0.35),
                 [[run(tag, 15, ROSE, F_NUM, b=True),
                   run("  " + ("DONE" if status == "done"
                               else "NEXT" if status == "next" else "LATER"),
                       9, PEWTER, F_NUM, b=True)]])
        add_text(s, card_x + Inches(0.12), card_y + Inches(0.42),
                 card_w - Inches(0.24), Inches(0.35),
                 [[run(title, 15, BLACK, F_HEAD, b=True)]])
        add_text(s, card_x + Inches(0.12), card_y + Inches(0.78),
                 card_w - Inches(0.24), Inches(0.72),
                 [[run(desc, 9.5, BLACK, F_BODY)]], line_spacing=0.95)

    # honest one-liner
    add_text(s, MARGIN, SH - Inches(1.0), SW - 2 * MARGIN, Inches(0.45),
             [[run("Status today: ", 12, ROSE, F_NUM, b=True),
               run("Milestone 1 is complete. Milestones 2-9 and the later "
                   "phases are planned, not yet built.", 12, BLACK, F_BODY)]],
             align=PP_ALIGN.CENTER)

    footer(s)
    return s


# --------------------------------------------------------------------------- #
# SLIDE 6 — VISION / LEARNINGS / CALL TO ACTION
# --------------------------------------------------------------------------- #

def slide_vision(prs):
    s = new_slide(prs)
    header(s, "Vision & Next Steps", "Where this is headed", 6)

    y = Inches(2.0)
    col_w = Inches(4.9)          # left column (vision + learnings)
    rw = Inches(3.9)             # middle column (next steps + CTA)
    rx = MARGIN + col_w + Inches(0.4)

    # Vision card
    vis_h = Inches(1.55)
    add_rect(s, MARGIN, y, col_w, vis_h, fill=ROSE, line=BLACK,
             line_w=Pt(1.5))
    add_text(s, MARGIN + Inches(0.22), y + Inches(0.13), col_w - Inches(0.44),
             Inches(0.35), [[run("THE VISION", 13, BLACK, F_NUM, b=True)]])
    add_text(s, MARGIN + Inches(0.22), y + Inches(0.52), col_w - Inches(0.44),
             Inches(0.95),
             [[run("Give every student the evidence-backed feedback a "
                   "senior mentor would give — on any repo, in minutes.",
                   14, BLACK, F_BODY)]], line_spacing=1.1)

    # What I learned card
    ly = y + vis_h + Inches(0.3)
    learn_h = Inches(2.6)
    add_rect(s, MARGIN, ly, col_w, learn_h, fill=ECRU, line=BLACK,
             line_w=Pt(1.5))
    add_text(s, MARGIN + Inches(0.22), ly + Inches(0.13), col_w - Inches(0.44),
             Inches(0.35), [[run("WHAT I LEARNED", 13, ROSE, F_NUM, b=True)]])
    learns = [
        "Specify before building — M1 saved rework.",
        "Evidence beats opinions.",
        "A design system keeps a solo project consistent.",
        "Honest scope matters more than a flashy demo.",
    ]
    add_bullets(s, MARGIN + Inches(0.22), ly + Inches(0.6),
                col_w - Inches(0.44), learn_h - Inches(0.7), learns,
                size=12.5, line_spacing=1.05, space_after=7)

    # Next steps + CTA card (middle column)
    card_h = Inches(4.45)
    add_rect(s, rx, y, rw, card_h, fill=CREAM, line=BLACK, line_w=Pt(1.5))
    add_text(s, rx + Inches(0.22), y + Inches(0.15), rw - Inches(0.44),
             Inches(0.35), [[run("NEXT STEPS", 13, ROSE, F_NUM, b=True)]])
    nexts = [
        "Build the mock-data frontend (M2).",
        "Stand up backend, DB & auth (M3-4).",
        "Ship GitHub analysis & AI findings.",
        "Wire the Rocket Builder to live data.",
    ]
    add_bullets(s, rx + Inches(0.22), y + Inches(0.6), rw - Inches(0.44),
                Inches(2.2), nexts, size=12.5, line_spacing=1.05,
                space_after=8)

    # call to action inside the card
    add_line(s, rx + Inches(0.22), y + Inches(3.25),
             rx + rw - Inches(0.22), y + Inches(3.25),
             color=PEWTER, width=Pt(1.25))
    add_text(s, rx + Inches(0.22), y + Inches(3.42), rw - Inches(0.44),
             Inches(0.45),
             [[run("Follow along \u2192", 16, BLACK, F_HEAD, b=True)]])
    add_text(s, rx + Inches(0.22), y + Inches(3.9), rw - Inches(0.44),
             Inches(0.4),
             [[run(GITHUB_URL, 11, BLACK, F_BODY)]])

    # mascot on the far right (final slide only), clear of the card
    mascot_x = rx + rw + Inches(0.35)
    add_image_fit(s, MASCOT, mascot_x, Inches(2.0),
                  SW - MARGIN - mascot_x, Inches(4.45),
                  align="center", valign="middle")

    footer(s)
    return s


# --------------------------------------------------------------------------- #
# Build
# --------------------------------------------------------------------------- #

def build():
    ensure_transparent_logo()   # writes assets/rockspire-logo-transparent.png

    prs = Presentation()
    prs.slide_width = SW
    prs.slide_height = SH

    slide_title(prs)
    slide_problem(prs)
    slide_solution(prs)
    slide_architecture(prs)
    slide_roadmap(prs)
    slide_vision(prs)

    prs.save(OUT)
    print(f"Saved {OUT}  ({len(prs.slides.__iter__.__self__._sldIdLst)} slides)")


if __name__ == "__main__":
    build()

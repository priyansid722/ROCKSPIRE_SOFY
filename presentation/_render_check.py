"""
_render_check.py  (dev-only, not shipped as the deliverable)

Renders each slide of the generated .pptx to a PNG using Pillow by reading
the actual shape geometry, text, fonts and sizes from the pptx XML. Also
runs a text-overflow check: for every textbox/shape-with-text it measures
the wrapped text height against the shape height and reports overflows.

This substitutes for LibreOffice (unavailable in this sandbox) so each slide
can be visually inspected and overflow fixed.
"""
import os
from pptx import Presentation
from pptx.util import Emu
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
PPTX = os.path.join(HERE, "Rockspire_Sofy_Presentation.pptx")
OUTDIR = os.path.join(HERE, "_preview")
os.makedirs(OUTDIR, exist_ok=True)

SCALE = 120 / 914400  # px per EMU  => 120 px/inch

# A monospace font approximates Courier New metrics well enough for a
# conservative overflow check; headings (Alumni Sans etc.) are proportional
# and narrower, so a mono measurement is a safe over-estimate for wrapping.
# Only Noto Sans (proportional) is available in this sandbox. The real body
# font is Courier New (monospace, wider). We therefore inflate measured text
# widths by COURIER_FACTOR so the wrapping/overflow check is CONSERVATIVE
# (i.e. assumes text is wider than Noto renders it).
COURIER_FACTOR = 1.18
_FONT = "/usr/share/fonts/google-noto-vf/NotoSans[wght].ttf"


def load_font(size_px, bold=False):
    try:
        f = ImageFont.truetype(_FONT, size_px)
        if bold:
            try:
                f.set_variation_by_axes([700])
            except Exception:
                pass
        return f
    except Exception:
        return ImageFont.load_default()


def rgb(color):
    try:
        return (color[0], color[1], color[2])
    except Exception:
        return (0, 0, 0)


def shape_color(shape):
    try:
        if shape.fill.type is not None:
            return "#%02X%02X%02X" % tuple(shape.fill.fore_color.rgb)
    except Exception:
        pass
    return None


def tlen(draw, text, font):
    return draw.textlength(text, font=font) * COURIER_FACTOR


def wrap_text(text, font, max_w, draw):
    words = text.split(" ")
    lines = []
    cur = ""
    for w in words:
        trial = (cur + " " + w).strip()
        if tlen(draw, trial, font) <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def render():
    prs = Presentation(PPTX)
    W = int(prs.slide_width * SCALE)
    H = int(prs.slide_height * SCALE)
    overflow_report = []

    for idx, slide in enumerate(prs.slides, start=1):
        img = Image.new("RGB", (W, H), "#FDFBD4")
        draw = ImageDraw.Draw(img, "RGBA")

        for shape in slide.shapes:
            try:
                x = int(shape.left * SCALE)
                y = int(shape.top * SCALE)
                w = int(shape.width * SCALE)
                h = int(shape.height * SCALE)
            except Exception:
                continue

            st_top = str(getattr(shape, "shape_type", ""))
            # connectors (lines)
            if "CONNECTOR" in st_top or "LINE" in st_top:
                try:
                    lc = tuple(shape.line.color.rgb)
                except Exception:
                    lc = (144, 158, 174)
                draw.line([x, y, x + w, y + h], fill=lc, width=2)
                continue

            # fill + outline for autoshapes
            if shape.shape_type is not None and not shape.has_text_frame or shape.has_text_frame:
                fill = shape_color(shape)
                has_line = False
                line_col = (0, 0, 0)
                try:
                    if shape.line.color and shape.line.color.type is not None:
                        line_col = tuple(shape.line.color.rgb)
                        has_line = True
                except Exception:
                    has_line = False
                st = str(getattr(shape, "shape_type", ""))
                if "PICTURE" in st:
                    try:
                        im = Image.open(shape.image.blob and __import__("io").BytesIO(shape.image.blob))
                        im = im.convert("RGBA").resize((max(1, w), max(1, h)))
                        img.paste(im, (x, y), im)
                    except Exception:
                        pass
                    continue
                try:
                    shp_name = str(shape.auto_shape_type)
                except Exception:
                    shp_name = ""
                if fill or has_line:
                    if "OVAL" in shp_name:
                        draw.ellipse([x, y, x + w, y + h],
                                     fill=fill, outline=line_col if has_line else None, width=2)
                    elif "TRIANGLE" in shp_name:
                        draw.polygon([(x + w // 2, y), (x, y + h), (x + w, y + h)],
                                     fill=fill, outline=line_col if has_line else None)
                    elif "DIAMOND" in shp_name:
                        draw.polygon([(x + w // 2, y), (x + w, y + h // 2),
                                      (x + w // 2, y + h), (x, y + h // 2)],
                                     fill=fill, outline=line_col if has_line else None)
                    else:
                        draw.rectangle([x, y, x + w, y + h],
                                       fill=fill, outline=line_col if has_line else None, width=2)

            # text + overflow measurement
            if shape.has_text_frame and shape.text_frame.text.strip():
                tf = shape.text_frame
                pad = 2
                cursor_y = y + pad
                total_text_h = 0
                for para in tf.paragraphs:
                    runs = para.runs
                    if not runs:
                        continue
                    size_pt = max((r.font.size.pt if r.font.size else 12) for r in runs)
                    size_px = int(size_pt * SCALE * 914400 / 72)
                    bold = any(bool(r.font.bold) for r in runs)
                    font = load_font(size_px, bold=bold)
                    text = "".join(r.text for r in runs)
                    col = (0, 0, 0)
                    for r in runs:
                        try:
                            if r.font.color and r.font.color.type is not None:
                                col = tuple(r.font.color.rgb)
                                break
                        except Exception:
                            pass
                    max_w = max(10, w - 2 * pad)
                    # honor explicit newlines then wrap
                    sublines = []
                    for seg in text.split("\n"):
                        sublines.extend(wrap_text(seg, font, max_w, draw) or [""])
                    lh = int(size_px * 1.2)
                    align = para.alignment
                    for ln in sublines:
                        lw = tlen(draw, ln, font)
                        if str(align) == "PP_ALIGN.CENTER":
                            tx = x + (w - lw) / 2
                        elif str(align) == "PP_ALIGN.RIGHT":
                            tx = x + w - lw - pad
                        else:
                            tx = x + pad
                        draw.text((tx, cursor_y), ln, fill=col, font=font)
                        cursor_y += lh
                        total_text_h += lh
                # overflow: text taller than the box (allow small slack)
                if total_text_h > h + 6 and h > 0:
                    overflow_report.append(
                        f"  slide {idx}: text overflow by "
                        f"{total_text_h - h}px in box h={h}px :: "
                        f"'{shape.text_frame.text[:45].strip()}...'")

        img.save(os.path.join(OUTDIR, f"slide_{idx}.png"))

    # compose a contact sheet
    imgs = [Image.open(os.path.join(OUTDIR, f"slide_{i}.png")) for i in range(1, len(prs.slides.__iter__.__self__._sldIdLst) + 1)]
    cols, rows = 2, 3
    pad = 20
    cw, ch = imgs[0].size
    sheet = Image.new("RGB", (cols * cw + (cols + 1) * pad,
                              rows * ch + (rows + 1) * pad), "#555555")
    for i, im in enumerate(imgs):
        r, c = divmod(i, cols)
        sheet.paste(im, (pad + c * (cw + pad), pad + r * (ch + pad)))
    sheet.save(os.path.join(OUTDIR, "contact_sheet.png"))

    print("OVERFLOW REPORT:")
    if overflow_report:
        print("\n".join(overflow_report))
    else:
        print("  none detected")


if __name__ == "__main__":
    render()

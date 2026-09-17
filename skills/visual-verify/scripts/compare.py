"""Build a strict, CSS-pixel-aligned screenshot comparison (requires Pillow)."""
import argparse
import base64
import io
import json
import math
from pathlib import Path

from PIL import Image, ImageChops, ImageOps, ImageStat


def crop_box(value):
    numbers = tuple(int(n) for n in value.split(','))
    if len(numbers) != 4 or min(numbers[:2]) < 0 or min(numbers[2:]) <= 0:
        raise argparse.ArgumentTypeError('Use source-raster x,y,width,height; positive dimensions.')
    return numbers


def positive(value):
    number = float(value)
    if not math.isfinite(number) or number <= 0:
        raise argparse.ArgumentTypeError('Must be finite and positive.')
    return number


def density(value):
    number = positive(value)
    if number < 1:
        raise argparse.ArgumentTypeError('Sub-1x input is a thumbnail; re-export instead of upscaling it.')
    return number


def prepare(path, scale, crop, background):
    with Image.open(path) as source:
        original = source.size
        image = source.convert('RGBA')
    if crop:
        x, y, w, h = crop
        if x + w > image.width or y + h > image.height:
            raise ValueError(f'{path}: crop extends outside {image.size}.')
        image = image.crop((x, y, x + w, y + h))
    raster = image.size
    css = tuple(n / scale for n in raster)
    rounded = tuple(round(n) for n in css)
    if any(abs(n - r) > 0.01 for n, r in zip(css, rounded)) or min(rounded) < 1:
        raise ValueError(f'{path}: raster {raster} / scale {scale} gives nonintegral CSS bounds {css}. Re-export at 1x.')
    # Normalize only a declared export/DPR density, never a layout discrepancy.
    if scale != 1:
        image = image.resize(rounded, Image.Resampling.LANCZOS)
    paper = Image.new('RGBA', image.size, background)
    paper.alpha_composite(image)
    return paper.convert('RGB'), {
        'path': str(path.resolve()), 'original_raster': original,
        'crop_raster_xywh': crop, 'compared_raster': raster,
        'pixels_per_css_pixel': scale, 'compared_css': rounded,
    }


def spans(flags):
    result, start = [], None
    for i, flag in enumerate([*flags, False]):
        if flag and start is None:
            start = i
        if not flag and start is not None:
            result.append([start, i - 1])
            start = None
    return result


def data_uri(image):
    output = io.BytesIO()
    image.save(output, format='PNG')
    return 'data:image/png;base64,' + base64.b64encode(output.getvalue()).decode('ascii')


def compare(args):
    reference, ref_meta = prepare(args.reference, args.reference_scale, args.reference_crop, args.background)
    actual, actual_meta = prepare(args.actual, args.actual_scale, args.actual_crop, args.background)
    if reference.size != actual.size:
        raise ValueError(
            f'CSS dimensions differ: reference={reference.size}, actual={actual.size}. '
            'Recapture at matching viewport/clip dimensions. No overlap-only crop or stretching was applied.'
        )
    if args.width is not None and reference.width != args.width:
        raise ValueError(f'Expected {args.width} CSS px wide, got {reference.width}. Check for thumbnail downscaling.')
    if args.height is not None and reference.height != args.height:
        raise ValueError(f'Expected {args.height} CSS px high, got {reference.height}. Check the frame and crop.')
    raw = ImageChops.difference(reference, actual)
    r, g, b = raw.split()
    maximum = ImageChops.lighter(ImageChops.lighter(r, g), b)
    mask = maximum.point(lambda n: 255 if n > args.threshold else 0)
    histogram = mask.histogram()
    changed = histogram[255]
    width, height = raw.size
    rows = [bool(mask.crop((0, y, width, y + 1)).getbbox()) for y in range(height)]
    cols = [bool(mask.crop((x, 0, x + 1, height)).getbbox()) for x in range(width)]
    report = {
        'title': args.title, 'reference': ref_meta, 'actual': actual_meta,
        'reference_source': args.reference_source, 'actual_source': args.actual_source,
        'scope': args.scope, 'background': args.background, 'root_font_css_px': args.root_font,
        'comparison_css': [width, height], 'threshold_per_channel': args.threshold,
        'changed_pixels': changed, 'changed_ratio': changed / (width * height),
        'mean_absolute_rgb_difference': sum(ImageStat.Stat(raw).mean) / 3,
        'changed_bounds_css_xyxy': mask.getbbox(),
        'changed_row_spans_css_inclusive': spans(rows),
        'changed_column_spans_css_inclusive': spans(cols),
        'notes': args.note, 'verdict': 'UNREVIEWED — metrics are diagnostic, not design approval',
    }
    output = args.output
    output.mkdir(parents=True, exist_ok=True)
    artifacts = {
        'reference.png': reference, 'actual.png': actual,
        'blend.png': Image.blend(reference, actual, 0.5),
        # Identical pixels become neutral gray; residual edges expose displacement.
        'inverted-overlay.png': Image.blend(reference, ImageOps.invert(actual), 0.5),
        'difference.png': raw, 'difference-mask.png': mask,
    }
    side = Image.new('RGB', (width * 2, height), args.background)
    side.paste(reference, (0, 0))
    side.paste(actual, (width, 0))
    artifacts['side-by-side.png'] = side
    for name, image in artifacts.items():
        image.save(output / name)
    (output / 'report.json').write_text(json.dumps(report, indent=2) + '\n')
    payload = {'reference': data_uri(reference), 'actual': data_uri(actual), 'report': report}
    encoded = base64.b64encode(json.dumps(payload).encode()).decode('ascii')
    template = Path(__file__).parent.parent / 'templates' / 'viewer.html'
    (output / 'overlay.html').write_text(template.read_text().replace('__OVERLAY_PAYLOAD__', encoded))
    print(json.dumps({'output': str(output.resolve()), 'comparison_css': [width, height],
                      'changed_pixels': changed, 'changed_ratio': report['changed_ratio'],
                      'verdict': report['verdict']}, indent=2))
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('reference', type=Path)
    parser.add_argument('actual', type=Path)
    parser.add_argument('output', type=Path, help='New evidence directory (will not overwrite an earlier comparison).')
    parser.add_argument('--reference-scale', type=density, default=1, help='Known export pixels per CSS px, not fit-to-width.')
    parser.add_argument('--actual-scale', type=density, default=1, help='Known screenshot pixels per CSS px; usually DPR.')
    parser.add_argument('--reference-crop', type=crop_box)
    parser.add_argument('--actual-crop', type=crop_box)
    parser.add_argument('--width', type=int, help='Expected compared width in CSS px, independently measured.')
    parser.add_argument('--height', type=int, help='Expected compared height in CSS px, independently measured.')
    parser.add_argument('--root-font', type=positive, default=16, help='Measured root font size in CSS px.')
    parser.add_argument('--threshold', type=int, default=24, help='Noise cutoff for diagnostic mask only (0..255).')
    parser.add_argument('--background', default='#ffffff', help='Explicit alpha-compositing background.')
    parser.add_argument('--title', default='Design overlay')
    parser.add_argument('--reference-source', required=True, help='Figma node/revision or baseline route/revision.')
    parser.add_argument('--actual-source', required=True, help='Actual route, state and branch/revision.')
    parser.add_argument('--scope', required=True, help='Full frame or the exact region being compared.')
    parser.add_argument('--note', action='append', default=[], help='Approved deviation or capture limitation; repeatable.')
    args = parser.parse_args()
    if not 0 <= args.threshold <= 255:
        parser.error('--threshold must be 0..255.')
    if args.output.exists():
        parser.error('Evidence directory exists; choose a new output so earlier captures survive.')
    try:
        compare(args)
    except (ValueError, OSError) as error:
        parser.exit(2, f'{error}\n')


if __name__ == '__main__':
    main()

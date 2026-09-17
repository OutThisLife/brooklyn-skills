"""Exercise the overlay utility with synthetic fixtures, not product evidence."""
import base64
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from PIL import Image

SCRIPT = Path(__file__).with_name('compare.py')


class OverlayTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.addCleanup(self.temp.cleanup)
        Image.new('RGB', (16, 12), 'white').save(self.root / 'reference.png')
        Image.new('RGB', (16, 12), 'white').save(self.root / 'actual.png')

    def run_compare(self, *extra):
        result = subprocess.run([
            sys.executable, str(SCRIPT), str(self.root / 'reference.png'),
            str(self.root / 'actual.png'), str(self.root / 'output'),
            '--reference-source', 'synthetic self-test reference',
            '--actual-source', 'synthetic self-test actual', '--scope', 'test fixture', *extra,
        ], capture_output=True, text=True)
        return result

    def report(self):
        return json.loads((self.root / 'output/report.json').read_text())

    def test_identical_has_gray_inversion_black_difference(self):
        result = self.run_compare('--width', '16', '--height', '12')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.report()['changed_pixels'], 0)
        with Image.open(self.root / 'output/inverted-overlay.png') as image:
            self.assertEqual(image.getpixel((0, 0)), (127, 127, 127))
        with Image.open(self.root / 'output/difference.png') as image:
            self.assertIsNone(image.getbbox())
        html = (self.root / 'output/overlay.html').read_text()
        self.assertNotIn('__OVERLAY_PAYLOAD__', html)
        self.assertIn('data:image/png;base64', base64.b64decode(html.split("atob('")[1].split("')")[0]).decode())

    def test_known_delta_is_measured_without_translation(self):
        image = Image.new('RGB', (16, 12), 'white')
        image.putpixel((3, 5), (0, 0, 0))
        image.save(self.root / 'actual.png')
        self.assertEqual(self.run_compare().returncode, 0)
        self.assertEqual(self.report()['changed_pixels'], 1)
        self.assertEqual(self.report()['changed_bounds_css_xyxy'], [3, 5, 4, 6])

    def test_size_mismatch_fails_instead_of_common_area_crop(self):
        Image.new('RGB', (17, 12), 'white').save(self.root / 'actual.png')
        result = self.run_compare()
        self.assertEqual(result.returncode, 2)
        self.assertIn('CSS dimensions differ', result.stderr)
        self.assertFalse((self.root / 'output').exists())

    def test_known_double_density_is_normalized(self):
        Image.new('RGB', (32, 24), 'white').save(self.root / 'actual.png')
        self.assertEqual(self.run_compare('--actual-scale', '2').returncode, 0)
        self.assertEqual(self.report()['comparison_css'], [16, 12])
        self.assertEqual(self.report()['actual']['original_raster'], [32, 24])

    def test_explicit_crop_is_recorded_and_bounds_checked(self):
        self.assertEqual(self.run_compare('--reference-crop', '0,0,8,8', '--actual-crop', '0,0,8,8').returncode, 0)
        self.assertEqual(self.report()['actual']['crop_raster_xywh'], [0, 0, 8, 8])

    def test_out_of_bounds_crop_fails(self):
        result = self.run_compare('--reference-crop', '10,0,8,8')
        self.assertEqual(result.returncode, 2)
        self.assertIn('outside', result.stderr)

    def test_expected_frame_size_catches_thumbnail(self):
        result = self.run_compare('--width', '1440')
        self.assertEqual(result.returncode, 2)
        self.assertIn('thumbnail', result.stderr)

    def test_sub_native_density_cannot_upscale_thumbnail(self):
        result = self.run_compare('--reference-scale', '0.5')
        self.assertEqual(result.returncode, 2)
        self.assertIn('re-export', result.stderr)

    def test_existing_evidence_is_not_overwritten(self):
        self.assertEqual(self.run_compare().returncode, 0)
        result = self.run_compare()
        self.assertEqual(result.returncode, 2)
        self.assertIn('exists', result.stderr)


if __name__ == '__main__':
    unittest.main()

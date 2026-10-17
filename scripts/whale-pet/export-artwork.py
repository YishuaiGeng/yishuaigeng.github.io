"""Extract trusted V0.2 SVG geometry and original PNG textures for the Astro component.

Uses only the Python standard library. Run from any directory; no design files are changed.
"""

from pathlib import Path
import base64
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'design/whale-pet/v02-glossy/whale-pet-idle.svg'
OUTPUT = ROOT / 'public/assets/img/whale-pet/layers'
OUTPUT.mkdir(parents=True, exist_ok=True)
tree = ET.fromstring(SOURCE.read_text(encoding='utf-8'))
ns = {'svg': 'http://www.w3.org/2000/svg'}
layers = []
for name in ('spout', 'body', 'tail', 'eye'):
    contour = tree.find(f".//svg:clipPath[@id='{name}-contour']/svg:path", ns)
    texture = tree.find(f".//svg:image[@id='{name}-material']", ns)
    if contour is None or texture is None:
        raise ValueError(f'Missing layer: {name}')
    uri = texture.attrib['href']
    if not uri.startswith('data:image/png;base64,'):
        raise ValueError(f'Unexpected texture format: {name}')
    (OUTPUT / f'{name}.png').write_bytes(base64.b64decode(uri.split(',', 1)[1], validate=True))
    layers.append({
        'name': name,
        'contour': contour.attrib['d'],
        'texture': f'layers/{name}.png',
        **{k: float(texture.attrib[k]) for k in ('x', 'y', 'width', 'height')},
    })
(ROOT / 'src/data/whale-pet-artwork.json').write_text(
    json.dumps({'viewBox': tree.attrib['viewBox'], 'layers': layers}, indent=2) + '\n',
    encoding='utf-8',
)
print(f'Exported {len(layers)} original layers for WhalePet.astro')

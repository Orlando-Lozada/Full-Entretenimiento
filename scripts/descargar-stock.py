#!/usr/bin/env python3
"""
descargar-stock.py
==================
Descarga imágenes de stock de Unsplash (gratis y libres de regalías) y las
convierte automáticamente a AVIF + WebP fallback.

USO (desde la raíz del proyecto):
    pip install pillow pillow-avif-plugin requests
    python scripts/descargar-stock.py

Las URLs son de Unsplash CDN (uso libre comercial, sin atribución requerida).
Si quieres cambiar una imagen: busca en https://unsplash.com, copia el ID
del foto-XXXXX-XXXXX en la URL, y reemplázalo en STOCK abajo.
"""
import os, sys
from pathlib import Path

try:
    import requests
    from PIL import Image
except ImportError:
    print("Instala dependencias:  pip install pillow pillow-avif-plugin requests")
    sys.exit(1)

# Detectar si Pillow tiene AVIF nativo (>=11) o requiere plugin
from PIL import features
if not features.check('avif'):
    try:
        import pillow_avif  # noqa
    except ImportError:
        print("AVIF no disponible. Pillow >=11 lo trae nativo, o instala: pip install pillow-avif-plugin")
        sys.exit(1)

ROOT = Path(__file__).parent.parent
IMG = ROOT / 'img'
TEST = ROOT / 'testimonios'
IMG.mkdir(exist_ok=True)
TEST.mkdir(exist_ok=True)

# =====================================================
# URLs CURADAS — Unsplash CDN, libres para uso comercial
# Cambia el ID si quieres otra imagen.
# =====================================================
STOCK = [
    # (carpeta_destino, nombre_base, max_w, calidad_avif, descripción, url_unsplash)
    (IMG, 'header',           1920, 60, 'familia/amigos viendo TV con palomitas',
        'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=1920&q=80&fm=jpg&fit=crop'),
    (IMG, 'pc',               1400, 65, 'múltiples dispositivos con apps de streaming',
        'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1400&q=80&fm=jpg&fit=crop'),
    (IMG, 'whitetv',           800, 70, 'smart TV moderna con apps de streaming',
        'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80&fm=jpg&fit=crop'),
    (IMG, 'bg-movies',        1920, 50, 'collage cinemático de películas',
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80&fm=jpg&fit=crop'),
    (IMG, 'bg-testimonios',   1920, 50, 'sala de cine en casa',
        'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1920&q=80&fm=jpg&fit=crop'),

    # Avatares testimonios — 5 personas diversas, retrato cuadrado
    (TEST, 'testimonio1', 480, 75, 'retrato hombre joven sonriendo',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=480&q=80&fm=jpg&fit=crop&crop=faces'),
    (TEST, 'testimonio2', 480, 75, 'retrato hombre adulto profesional',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=480&q=80&fm=jpg&fit=crop&crop=faces'),
    (TEST, 'testimonio3', 480, 75, 'retrato hombre maduro confiado',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=480&q=80&fm=jpg&fit=crop&crop=faces'),
    (TEST, 'testimonio4', 480, 75, 'retrato mujer sonriente',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=480&q=80&fm=jpg&fit=crop&crop=faces'),
    (TEST, 'testimonio5', 480, 75, 'retrato mujer joven amigable',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=480&q=80&fm=jpg&fit=crop&crop=faces'),
]


def descargar(url: str) -> bytes:
    r = requests.get(url, timeout=30, headers={'User-Agent': 'Mozilla/5.0'})
    r.raise_for_status()
    return r.content


def procesar(img_bytes: bytes, dest_dir: Path, base: str, max_w: int, q: int, descripcion: str):
    from io import BytesIO
    im = Image.open(BytesIO(img_bytes))
    if im.mode not in ('RGB', 'RGBA'):
        im = im.convert('RGB')

    if im.width > max_w:
        h = int(im.height * (max_w / im.width))
        im = im.resize((max_w, h), Image.LANCZOS)

    # Para avatares: cuadrado central
    if dest_dir == TEST:
        side = min(im.size)
        left = (im.width - side) // 2
        top = (im.height - side) // 2
        im = im.crop((left, top, left + side, top + side))

    avif_path = dest_dir / f'{base}.avif'
    webp_path = dest_dir / f'{base}.webp'
    im.save(avif_path, format='AVIF', quality=q, speed=2)
    im.save(webp_path, format='WebP', quality=min(q + 15, 90))

    a = avif_path.stat().st_size
    w = webp_path.stat().st_size
    print(f'  {base:<22} {im.size}   avif:{a//1024}KB  webp:{w//1024}KB   ({descripcion})')


def main():
    print('=' * 70)
    print('Descargando imágenes de stock — Unsplash (libre uso comercial)')
    print('=' * 70)
    fallos = 0
    for dest, base, max_w, q, descripcion, url in STOCK:
        print(f'\n→ {base}.avif/.webp  ←  {url[:70]}...')
        try:
            data = descargar(url)
            procesar(data, dest, base, max_w, q, descripcion)
        except Exception as e:
            print(f'  ❌ Error: {e}')
            fallos += 1
    print()
    print('=' * 70)
    print(f'Listo. {len(STOCK) - fallos}/{len(STOCK)} imágenes procesadas.')
    if fallos:
        print(f'⚠  {fallos} fallaron — revisa tu conexión o cambia el ID de Unsplash.')
    print('Imágenes guardadas en /img/ y /testimonios/.')
    print('=' * 70)


if __name__ == '__main__':
    main()

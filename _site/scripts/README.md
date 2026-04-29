# Scripts de imágenes

## descargar-stock.py

Descarga imágenes de stock de Unsplash y las convierte a AVIF + WebP.

### Requisitos (una sola vez)

```bash
pip install pillow requests
```

> Si tu Pillow es < 11, también: `pip install pillow-avif-plugin`.

### Uso

Desde la **raíz del proyecto** (no desde `scripts/`):

```bash
python scripts/descargar-stock.py
```

Reemplaza las imágenes en `/img/` y `/testimonios/`. Los archivos viejos
quedan sobreescritos (se generan tanto `.avif` como `.webp`).

### Cambiar una imagen

Abre `scripts/descargar-stock.py` y edita la lista `STOCK`. Cada tupla es:

```python
(carpeta, nombre_base, max_width, calidad, descripcion, url_unsplash)
```

Para cambiar la imagen del hero, ve a [unsplash.com](https://unsplash.com),
busca lo que quieras, abre la imagen y copia el ID del path (`photo-XXXX-XXXX`).
Pégalo en la URL existente.

Las URLs de Unsplash CDN aceptan parámetros:
- `w=1920` — ancho máximo
- `q=80` — calidad jpeg origen
- `fm=jpg` — formato
- `fit=crop&crop=faces` — recorte centrado en caras (útil para avatares)

### Licencia de las imágenes

Unsplash es gratis para uso comercial sin atribución requerida. Política:
[unsplash.com/license](https://unsplash.com/license)

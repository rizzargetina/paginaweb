"""
Mejor scanner que extrae selectores desde la parte izquierda de las llaves '{' en CSS
y luego busca .class e #id en archivos .html. Evita capturar valores y unidades.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSS_PATH = ROOT / 'css' / 'main.css'

SELECTOR_BLOCK_RE = re.compile(r'([^{}]+)\{')
SIMPLE_TOKEN_RE = re.compile(r'([.#][a-zA-Z][a-zA-Z0-9_-]*)')

def extract_selectors(css_text):
    sels = set()
    for m in SELECTOR_BLOCK_RE.finditer(css_text):
        left = m.group(1)
        parts = [p.strip() for p in left.split(',')]
        for p in parts:
            for tok in SIMPLE_TOKEN_RE.findall(p):
                sels.add(tok)
    return sorted(sels)


def search_in_html(name, is_class):
    pattern = None
    if is_class:
        pattern = re.compile(r'class=["\'][^"\']*\b' + re.escape(name) + r'\b[^"\']*["\']', re.IGNORECASE)
    else:
        pattern = re.compile(r'id=["\']' + re.escape(name) + r'["\']', re.IGNORECASE)
    count = 0
    for p in ROOT.rglob('*.html'):
        try:
            txt = p.read_text(encoding='utf-8')
        except Exception:
            continue
        if pattern.search(txt):
            count += 1
    return count


def main():
    if not CSS_PATH.exists():
        print('No encontré', CSS_PATH)
        return
    css = CSS_PATH.read_text(encoding='utf-8')
    selectors = extract_selectors(css)
    classes = [s for s in selectors if s.startswith('.')]
    ids = [s for s in selectors if s.startswith('#')]

    unused_classes = []
    used_classes = []
    for c in classes:
        name = c[1:]
        cnt = search_in_html(name, True)
        if cnt == 0:
            unused_classes.append(c)
        else:
            used_classes.append((c, cnt))

    unused_ids = []
    used_ids = []
    for i in ids:
        name = i[1:]
        cnt = search_in_html(name, False)
        if cnt == 0:
            unused_ids.append(i)
        else:
            used_ids.append((i, cnt))

    print('Selectores totales encontrados en CSS:', len(selectors))
    print('\nTop usados (muestra):')
    for s, cnt in sorted(used_classes + used_ids, key=lambda x: -x[1])[:60]:
        print(f'  {s} -> {cnt} archivos')

    print('\nSelectores POTENCIALMENTE NO usados:')
    for s in sorted(unused_classes):
        print(' ', s)
    for s in sorted(unused_ids):
        print(' ', s)

    print('\nNota: busca solo en .html. Si usas clases desde JS o templates, pueden aparecer como "no usados" pero sí serlo.')

if __name__ == '__main__':
    main()

"""
Simple scanner: extrae selectores .clase y #id de css/main.css y busca su uso en .html.
Genera un resumen con selectores usados y potencialmente no usados.
"""
import re
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSS_PATH = ROOT / 'css' / 'main.css'

def extract_selectors(css_text):
    # Encuentra tokens .name y #name (ignora regex y valores dentro de urls)
    tokens = re.findall(r'([.#][a-zA-Z0-9_-]+)', css_text)
    # Filtrar tokens que aparecen justo después de @ (rare)
    return sorted(set(tokens))

def search_in_html(name, is_class):
    pattern = None
    if is_class:
        # buscar dentro de atributos class="... name ..."
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

    print('Resumen rápido de uso (buscando solo en .html):')
    print('\nSelectores usados (ejemplo y conteos):')
    for s, cnt in sorted(used_classes + used_ids, key=lambda x: -x[1])[:50]:
        print(f'  {s} -> {cnt} archivos')

    print('\nSelectores potencialmente NO usados:')
    for s in sorted(unused_classes)[:200]:
        print('  ', s)
    for s in sorted(unused_ids)[:200]:
        print('  ', s)

    print('\nNota: Este script solo busca en archivos .html. Si usas clases desde JS, templates dinámicos o SVGs/JSX, pueden aparecer como "no usados" pero sí serlo.')

if __name__ == '__main__':
    main()

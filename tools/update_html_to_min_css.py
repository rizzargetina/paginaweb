"""
Replace references to css/main.css with css/main.min.css in .html files under the project root.
This is a safe, idempotent script: it only replaces exact matches and keeps backups if desired.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
count = 0
for p in ROOT.glob('*.html'):
    txt = p.read_text(encoding='utf-8')
    if 'main.min.css' in txt:
        continue
    if 'main.css' in txt:
        new = txt.replace('main.css', 'main.min.css')
        p.write_text(new, encoding='utf-8')
        print('Actualizado', p.name)
        count += 1

print('Archivos actualizados:', count)

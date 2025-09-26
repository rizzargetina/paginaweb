"""
Minify css/main.css into css/main.min.css

This script performs a conservative minification:
- removes CSS comments
- collapses multiple whitespace into single spaces
- strips spaces around common punctuation ({ } ; : , )

It aims to be safe for most project CSS files. If you use edge-case hacks, review the output.
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
CSS_IN = ROOT / 'css' / 'main.css'
CSS_OUT = ROOT / 'css' / 'main.min.css'

if not CSS_IN.exists():
    print('No encontré', CSS_IN)
    raise SystemExit(1)

text = CSS_IN.read_text(encoding='utf-8')

# Remove /* ... */ comments (non-greedy)
text = re.sub(r'/\*[^*]*\*+(?:[^/*][^*]*\*+)*/', '', text, flags=re.S)

# Collapse whitespace to single space
text = re.sub(r"\s+", ' ', text)

# Remove spaces around selectors/braces/semicolons/colons/commas
text = re.sub(r"\s*{\s*", '{', text)
text = re.sub(r"\s*}\s*", '}', text)
text = re.sub(r"\s*;\s*", ';', text)
text = re.sub(r"\s*:\s*", ':', text)
text = re.sub(r"\s*,\s*", ',', text)

# Remove stray semicolon before closing brace
text = text.replace(';}', '}')

text = text.strip()

CSS_OUT.write_text(text, encoding='utf-8')
print('Escrito', CSS_OUT)

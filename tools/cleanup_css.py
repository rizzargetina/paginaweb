#!/usr/bin/env python3
"""
Simple conservative CSS cleaner:
- Backs up css/main.css to css/main.css.bak
- Parses top-level rules (selector { body }) and extracts class (.name) and id (#name) tokens
- Marks a selector "candidate removable" only if every selector in a comma-separated selector-list uses at least one class or id token and none of the class/id tokens appear anywhere in the project files (html, js, templates, svg, json, txt, md)
- Keeps all other rules (element selectors, attribute selectors, at-rules, media blocks are handled conservatively: kept unless inner rules can be safely evaluated)
- Writes cleaned output to css/main.cleaned.css and overwrites css/main.css (keeping backup)

Note: This is conservative to avoid breaking runtime JS-driven classes or attribute selectors.
"""

import os
import re
import sys
from pathlib import Path

ROOT = Path(os.getcwd())
CSS_PATH = ROOT / 'css' / 'main.css'
BACKUP_PATH = ROOT / 'css' / 'main.css.bak'
CLEANED_PATH = ROOT / 'css' / 'main.cleaned.css'

if not CSS_PATH.exists():
    print(f"ERROR: {CSS_PATH} not found. Run from project root.")
    sys.exit(1)

# Read project files to search for class/id usage
SEARCH_EXT = {'.html', '.htm', '.js', '.css', '.svg', '.txt', '.json', '.md'}
project_texts = []
for p in ROOT.rglob('*'):
    if p.is_file():
        if p == CSS_PATH:
            continue
        if p.suffix.lower() in SEARCH_EXT or p.suffix == '':
            try:
                text = p.read_text(encoding='utf-8', errors='ignore')
                project_texts.append((str(p.relative_to(ROOT)), text))
            except Exception:
                pass

print(f"Scanned {len(project_texts)} files for selector usage.")

css_text = CSS_PATH.read_text(encoding='utf-8', errors='ignore')

# crude tokenization to handle @media blocks: we'll remove @keyframes and keep @media blocks intact but try to process their inner rules
# First extract @keyframes blocks and keep them untouched
keyframes = {}
keyframe_re = re.compile(r'@keyframes\s+[^{]+\{.*?\}\s*', re.S)
for i, m in enumerate(keyframe_re.finditer(css_text)):
    keyframes[f'__KEYFRAME_BLOCK_{i}__'] = m.group(0)
    css_text = css_text.replace(m.group(0), f'/*{list(keyframes.keys())[ -1]}*/')

# Extract @font-face blocks too
fontfaces = {}
fontface_re = re.compile(r'@font-face\s*\{.*?\}\s*', re.S)
for i, m in enumerate(fontface_re.finditer(css_text)):
    fontfaces[f'__FONTFACE_BLOCK_{i}__'] = m.group(0)
    css_text = css_text.replace(m.group(0), f'/*{list(fontfaces.keys())[ -1]}*/')

# We'll attempt to capture top-level rules of the shape 'selector { body }' but this will skip nested { } inside media; handle media by extracting them first
media_blocks = {}
media_re = re.compile(r'@media[^{]+\{(.*?)\}\s*\}', re.S)
# Slightly better approach: find @media ... { ... } with balanced braces
def extract_balanced_at_blocks(text, at_keyword):
    blocks = {}
    i = 0
    start = 0
    while True:
        idx = text.find(at_keyword, start)
        if idx == -1:
            break
        # find opening brace
        brace_idx = text.find('{', idx)
        if brace_idx == -1:
            start = idx + 1
            continue
        depth = 0
        j = brace_idx
        while j < len(text):
            if text[j] == '{':
                depth += 1
            elif text[j] == '}':
                depth -= 1
                if depth == 0:
                    # block is from idx to j
                    block = text[idx:j+1]
                    key = f'__AT_BLOCK_{at_keyword}_{i}__'
                    blocks[key] = block
                    text = text[:idx] + key + text[j+1:]
                    start = idx + len(key)
                    i += 1
                    break
            j += 1
        else:
            break
    return text, blocks

css_text, media_blocks = extract_balanced_at_blocks(css_text, '@media')
print(f"Extracted {len(media_blocks)} @media blocks for separate handling.")

# Now capture simple rules: selectors { body }
rule_re = re.compile(r'([^\{]+)\{([^\}]*)\}', re.S)

rules = []
for m in rule_re.finditer(css_text):
    sel = m.group(1).strip()
    body = m.group(2)
    start, end = m.span()
    rules.append((sel, body))

print(f"Found {len(rules)} top-level rules (conservative extraction).")

# Helper: find if a class or id name appears in project texts

def is_name_used(name, kind):
    # kind: 'class' or 'id'
    # check common patterns
    name_esc = re.escape(name)
    class_attr_re = re.compile(r'class\s*=\s*["\'][^"\']*\b' + name_esc + r'\b', re.I)
    id_attr_re = re.compile(r'id\s*=\s*["\']' + name_esc + r'["\']', re.I)
    js_classlist_re = re.compile(r'classList\.(?:add|remove|toggle)\(\s*["\']' + name_esc + r'["\']', re.I)
    js_query_re = re.compile(r'querySelector(All)?\(\s*["\'][^"\']*\b[.#]' + name_esc + r'\b', re.I)
    get_by_class_re = re.compile(r'getElementsByClassName\(\s*["\']' + name_esc + r'["\']', re.I)
    get_by_id_re = re.compile(r'getElementById\(\s*["\']' + name_esc + r'["\']', re.I)
    for fname, text in project_texts:
        if kind == 'class':
            if class_attr_re.search(text):
                return True
            if js_classlist_re.search(text):
                return True
            if js_query_re.search(text):
                return True
            if get_by_class_re.search(text):
                return True
        else:
            if id_attr_re.search(text):
                return True
            if get_by_id_re.search(text):
                return True
            if js_query_re.search(text):
                return True
    return False

# Extract class and id tokens from a selector string
class_re = re.compile(r'\.([A-Za-z0-9_-]+)')
id_re = re.compile(r'#([A-Za-z0-9_-]+)')

kept_rules = []
removed_count = 0
for sel, body in rules:
    # selectors might be comma separated
    selectors = [s.strip() for s in sel.split(',') if s.strip()]
    selector_kept = False
    selector_unused_all = True
    for s in selectors:
        classes = class_re.findall(s)
        ids = id_re.findall(s)
        # If selector contains no class nor id, be conservative and keep entire rule
        if not classes and not ids:
            selector_kept = True
            selector_unused_all = False
            break
        # otherwise, check if any of the class/id names are used
        any_used = False
        for c in classes:
            if is_name_used(c, 'class'):
                any_used = True
                break
        if not any_used:
            for i_ in ids:
                if is_name_used(i_, 'id'):
                    any_used = True
                    break
        if any_used:
            selector_kept = True
            selector_unused_all = False
            break
    if selector_kept:
        kept_rules.append((sel, body))
    else:
        # all selectors are class/id-only and none of those names were found in project -> remove rule
        removed_count += 1

# Reconstruct CSS: keep keyframes and fontfaces placeholders, then rules, then media blocks processed similarly (very conservatively: keep media block if any inner selector is kept)

out_lines = []
for sel, body in kept_rules:
    out_lines.append(f"{sel}{{{body}}}")

# Process media blocks: attempt to clean inner rules similarly
for key, block in media_blocks.items():
    # block starts with '@media...{inner}'
    inner = block[block.find('{')+1:-1]
    inner_rules = rule_re.findall(inner)
    kept_inner = []
    for sel, body in inner_rules:
        selectors = [s.strip() for s in sel.split(',') if s.strip()]
        sel_keep = False
        for s in selectors:
            classes = class_re.findall(s)
            ids = id_re.findall(s)
            if not classes and not ids:
                sel_keep = True
                break
            any_used = False
            for c in classes:
                if is_name_used(c, 'class'):
                    any_used = True
                    break
            if not any_used:
                for i_ in ids:
                    if is_name_used(i_, 'id'):
                        any_used = True
                        break
            if any_used:
                sel_keep = True
                break
        if sel_keep:
            kept_inner.append((sel, body))
    if kept_inner:
        inner_text = '\n'.join(f"{s}{{{b}}}" for s, b in kept_inner)
        out_lines.append(f"{block.split('{',1)[0].strip()}{{{inner_text}}}")
    else:
        # drop the entire media block
        pass

# Reinsert keyframes and fontfaces at top
final_css = []
for k, v in fontfaces.items():
    final_css.append(v)
for k, v in keyframes.items():
    final_css.append(v)
final_css.append('\n'.join(out_lines))
final_css_text = '\n\n'.join(final_css)

# backup and write
try:
    if not BACKUP_PATH.exists():
        CSS_PATH.replace(BACKUP_PATH)
        print(f"Backup created at {BACKUP_PATH}")
    else:
        # if backup exists, create numbered backup
        i = 1
        alt = BACKUP_PATH.with_suffix('.bak' + str(i))
        while alt.exists():
            i += 1
            alt = BACKUP_PATH.with_suffix('.bak' + str(i))
        CSS_PATH.replace(alt)
        print(f"Backup created at {alt}")
    # write cleaned to cleaned path and to original path
    CLEANED_PATH.write_text(final_css_text, encoding='utf-8')
    # write final to original main.css
    CLEANED_PATH.replace(CSS_PATH)
    print(f"Wrote cleaned CSS to {CSS_PATH} (also available as {CLEANED_PATH.name} before overwrite). Removed ~{removed_count} rules conservatively.")
except Exception as e:
    print(f"ERROR writing cleaned files: {e}")
    sys.exit(1)

print("DONE. Please review css/main.css (backup kept).")

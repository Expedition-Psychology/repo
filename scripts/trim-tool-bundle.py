#!/usr/bin/env python3
"""Trim redundant fonts out of a standalone design-tool bundle.

These bundles inline every asset as gzip-then-base64 inside a JSON manifest,
which is why they are ~660KB and why gzip barely helps — base64 of already
compressed data does not compress twice.

Two kinds of font in there are dead weight:

  1. woff and opentype fallbacks beside a woff2 for the same face. woff2 has
     been supported everywhere for years; the fallbacks are never fetched.
  2. Cyrillic and Vietnamese subsets of Nunito, on an English-language site.
     If someone pastes Cyrillic in, it falls back to a system font.

Both are removed from the manifest and from the template's @font-face rules
together, so no rule is left pointing at an asset that is no longer there.

Re-run this after any fresh export:
    python3 scripts/trim-tool-bundle.py assets/tools/core10/index.html
"""
import json
import pathlib
import re
import sys

DROP_FORMATS = {'woff', 'opentype', 'truetype'}
DROP_SUBSETS = ('U+0460', 'U+0301', 'U+0102')  # cyrillic-ext, cyrillic, vietnamese


def trim(path: pathlib.Path) -> None:
    src = path.read_text(encoding='utf-8', errors='replace')

    man_m = re.search(r'(<script type="__bundler/manifest"[^>]*>)(.*?)(</script>)', src, re.S)
    tpl_m = re.search(r'(<script type="__bundler/template"[^>]*>)(.*?)(</script>)', src, re.S)
    if not man_m or not tpl_m:
        sys.exit(f'{path}: not a bundler export')

    manifest = json.loads(man_m.group(2))
    template = json.loads(tpl_m.group(2))
    if not isinstance(template, str):
        sys.exit(f'{path}: unexpected template type {type(template).__name__}')

    before_file = len(src)
    before_assets = len(manifest)
    dropped = set()

    def face_sub(m):
        """Rewrite one @font-face: drop whole non-Latin blocks, else drop
        non-woff2 sources from its src list."""
        face = m.group(0)
        rng = re.search(r'unicode-range:\s*([^;}]+)', face)
        if rng and any(p in rng.group(1) for p in DROP_SUBSETS):
            for uid, _ in re.findall(r'url\("([0-9a-f-]{36})"\)\s*format\(["\']([a-z0-9]+)["\']\)', face):
                dropped.add(uid)
            return ''  # the whole rule goes

        keep = []
        for whole, uid, fmt in re.findall(
                r'(url\("([0-9a-f-]{36})"\)\s*format\(["\']([a-z0-9]+)["\']\))', face):
            if fmt in DROP_FORMATS:
                dropped.add(uid)
            else:
                keep.append(whole)
        if not keep:
            return face  # never strip a face down to nothing
        return re.sub(r'src:\s*[^;}]+', 'src:' + ','.join(keep), face, count=1)

    template = re.sub(r'@font-face\s*\{[^}]*\}', face_sub, template)

    # Only drop an asset once nothing references it any more.
    still_used = set(re.findall(r'[0-9a-f-]{36}', template))
    removed = [u for u in dropped if u not in still_used]
    freed = sum(len(manifest[u].get('data', '')) for u in removed if u in manifest)
    for u in removed:
        manifest.pop(u, None)

    # Inside a <script> element, a literal </script> ends the element early —
    # so every "</" has to stay escaped, which is what the original export does.
    def embed(obj, **kw):
        return json.dumps(obj, **kw).replace('</', '<\\/')

    out = (src[:man_m.start(2)] + embed(manifest, separators=(',', ':')) + src[man_m.end(2):])
    # the template moved, so locate it again in the rebuilt document
    tpl_m2 = re.search(r'(<script type="__bundler/template"[^>]*>)(.*?)(</script>)', out, re.S)
    out = out[:tpl_m2.start(2)] + embed(template) + out[tpl_m2.end(2):]

    path.write_text(out, encoding='utf-8')
    print(f'{path}')
    print(f'   assets {before_assets} -> {len(manifest)}   '
          f'file {before_file/1024:.0f}KB -> {len(out)/1024:.0f}KB '
          f'({100*(before_file-len(out))/before_file:.0f}% smaller, {freed/1024:.0f}KB of fonts freed)')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    for arg in sys.argv[1:]:
        trim(pathlib.Path(arg))

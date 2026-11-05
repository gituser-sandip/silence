from pathlib import Path
import traceback

root = Path(__file__).resolve().parent
with (root / 'atelier-render.log').open('w', encoding='utf-8') as log:
    try:
        log.write('Building and rendering atelier\n'); log.flush()
        source = root / 'atelier-assets.py'
        exec(compile(source.read_text(encoding='utf-8'), str(source), 'exec'), {'__file__': str(source), '__name__': '__main__'})
        for name in ['vintage-composition.png', 'rose.png', 'foliage.png', 'wax-seal.png']:
            assert (root / 'atelier-refined' / name).stat().st_size > 1000, name
        log.write('All four render outputs verified\n')
    except Exception:
        traceback.print_exc(file=log)
        raise

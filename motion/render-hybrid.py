from pathlib import Path
import traceback, sys
root=Path(__file__).resolve().parent
log_path=root/'hybrid-hero'/'render.log'
with log_path.open('w',encoding='utf-8',buffering=1) as log:
    sys.stdout=log; sys.stderr=log
    try:
        src=root/'hybrid-hero.py'
        exec(compile(src.read_text(encoding='utf-8'),str(src),'exec'),{'__file__':str(src),'__name__':'__main__'})
        print('Hybrid render complete',flush=True)
    except Exception:
        traceback.print_exc(file=log)
        raise

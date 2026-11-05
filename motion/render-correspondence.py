from pathlib import Path
import sys, traceback

root=Path(__file__).resolve().parent
with (root/'correspondence-study'/'render.log').open('w',encoding='utf-8',buffering=1) as log:
    sys.stdout=log
    sys.stderr=log
    try:
        source=root/'correspondence-study.py'
        print('Building reference composition',flush=True)
        exec(compile(source.read_text(encoding='utf-8'),str(source),'exec'),{'__file__':str(source),'__name__':'__main__'})
        print('Render and library exports completed',flush=True)
    except Exception:
        traceback.print_exc(file=log)
        raise

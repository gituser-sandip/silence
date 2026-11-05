from pathlib import Path

from PIL import Image


source = Path(r"C:\Users\ASUS\.codex\generated_images\01a15357-33df-70e3-a58a-cb7a18cb07c5")
destination = Path(r"D:\websites\Perfume\silence\client\public\assets\editorial")
destination.mkdir(parents=True, exist_ok=True)

assets = {
    "exec-a95e0961-494b-4187-9923-b340551e1c17.png": "hero-paper.webp",
    "exec-9715726d-23a0-42f1-9c2d-3c81f0106366.png": "hero-letter-layer.webp",
    "exec-e8ce87eb-15a8-4788-9400-473ec3c13339.png": "hero-rose-layer.webp",
    "exec-6c67bda2-1f8d-47ff-99bc-aec7e5987336.png": "hero-seal-layer.webp",
    "exec-4a61d438-8eb5-417b-9ce3-057669518b80.png": "hero-botanical-layer.webp",
}

for source_name, output_name in assets.items():
    image = Image.open(source / source_name).convert("RGBA")
    if output_name != "hero-paper.webp":
        alpha = image.getchannel("A").point(lambda value: 0 if value < 46 else min(255, int((value - 46) * 1.22)))
        image.putalpha(alpha)
    image.save(destination / output_name, "WEBP", quality=88, method=6)
    print(output_name)

# Botanical correspondence — editable 3D study

Source: `../correspondence-study.py`. Reference: `../../client/public/assets/editorial/story-letter-option2.png`.

`Golden botanical correspondence.blend` contains the assembled scene and a fixed orthographic camera. Six asset libraries contain the rose, serrated foliage, ivory blossoms, silk bow/tails, botanical seal, and correspondence respectively. Each rose petal, blossom petal, leaf, and ribbon surface is individually editable.

`composition.png` is the latest inspected still, not an approved final. The script checks rose/ribbon counts, camera immobility, packed textures, and screen-to-world projection. Regenerate with Blender in background mode using `-b -t 12 -P motion/render-correspondence.py`; `render.log` records completion or Python errors.

The letter corners, envelope peak, rose bounds, seal position, and silk centerlines are placed against normalized landmarks in the reference. The camera stays at `(0.6, -7.6, 10.4)`, looking at `(-0.05, 0.25, 0.15)`. Material textures are packed in the Blender files. Petals, leaves, flowers, and ribbon strips have attachment-point origins for subsequent animation work.

Remaining visual discrepancy: the procedural rose is still flatter and more regular than the original sculpted rose. The user approved 18 Higgsfield credits for one Tripo H3.1 image-to-3D candidate using the original `hero-rose-layer.webp`. Submission with detailed geometry/textures, PBR, 200000 faces, original-image texture alignment, and image-aligned orientation was rejected: "Out of credits on free (null) plan in Private workspace." No job ID was returned. Do not retry until credits are available; approval for this one 18-credit generation persists. The available reference is `https://silence-gamma.vercel.app/assets/editorial/hero-rose-layer.webp` (verified image response). The backend normalized the canonical image role to `image_references`.

This is a static modeling study. The ribbon folds are modeled surfaces, not a cloth simulation; botanical movement has not been rigged or baked. No website asset has been replaced. The reference is an illustration, and the current model has not passed the requested visual-match review.

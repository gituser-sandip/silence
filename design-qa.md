# About hero design QA

**Source visual truth:** `client/public/assets/editorial/story-letter-option2.png` (generated concept 2, 1472 × 992). This is the selected warm, illuminated envelope-and-ribbon composition used as the visual master. The About hero also uses the HyperFrames-rendered plate `client/public/assets/editorial/story-hero-motion.mp4`, with the PNG retained as poster/reduced-motion fallback.

**Implementation evidence:**

- `output/story/qa-hero-desktop-final.png` — 1440 × 900 CSS viewport.
- `output/story/qa-hero-mobile-final.png` — 390 × 844 CSS viewport.

**State:** About route at the top of the page, normal motion preference, hero fully loaded.

## Comparison

The implementation preserves the selected concept 2 composition, crop, warm light, antique paper texture, rose, letter, botanical linework, wax seal, and negative space. The live HTML copy occupies the source's right-side negative space. A HyperFrames motion plate keeps the camera locked while animating localized botanicals, the flower, light drift, deterministic petals, and dust; the separate animated ribbon canvas remains the foreground movement without crossing the headline.

## Required fidelity surfaces

- **Typography:** Cormorant-style display hierarchy remains readable at both viewports; small navigation and chapter labels retain their tracking.
- **Spacing and layout:** Desktop keeps the still life left and copy right. Mobile stacks artwork and copy without horizontal overflow.
- **Colors and tokens:** Warm ivory, sepia, dusty rose, and dark ink remain consistent with the source.
- **Image quality:** The original artwork is used directly; generated reconstructed layers are not used in the hero.
- **Copy:** The hero title and supporting line remain unchanged and readable.

## Motion checks

- Ribbon: a full foreground canvas remains active; the second origin canvas is reserved but clipped out for concept 2 to avoid a doubled ribbon.
- Paper: locked camera; only the local light field and botanical layers breathe.
- Envelope and letter: remain stable so the raster artwork does not read as a sliding cutout.
- Petals: HyperFrames-rendered staggered drift paths.
- Dust: HyperFrames-rendered low-opacity particles drift through the light beam; the live canvas fallback remains available when the video plate is not used.
- Pointer lens: cursor position drives a restrained warm highlight over the artwork.
- Click response: a short ripple and paper-light pulse make the hero feel tactile without changing the composition.
- Reduced-motion CSS disables decorative motion.

## Findings

No actionable P0, P1, or P2 visual findings remain in the current pass. The individual flower and leaf artwork remains a single engraved source image, so the motion is intentionally subtle to preserve image fidelity and avoid ghosting.

## Verification

- HyperFrames lint, inspect, and draft render passed.
- Production build passed.
- Live About route loaded the selected concept 2 artwork, the HyperFrames motion plate, and the ribbon canvas.
- No horizontal overflow at desktop or 390px mobile width.
- Browser console reported zero warnings and zero errors.

**final result: passed**

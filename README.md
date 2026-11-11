# Albania, at your pace

Ten inherited places on a key-free OpenTopoMap terrain map. The original search, type filters, English/Albanian guide, local reviews, multiple itineraries, reorder/export, historical overlays and simulation tools remain. Reset map restores the Albania overview; the themes change the opaque UI, not the cartography. All simulation systems are fictional, not live travel, weather, crowd, risk or surveillance information.

The source is preserved in legacy and archive/pre-readable-20261111. Original local-storage keys are unchanged. Hosting on a new origin cannot transfer an old origin's local storage automatically; the original host stays archived, so existing plans remain there.

Map tiles: OpenStreetMap contributors, SRTM and OpenTopoMap, CC BY-SA. Source and best-effort availability: https://opentopomap.org/about . No prefetch or offline download is implemented. The original CARTO source returned API KEY REQUIRED. Attribution is always visible on phone and desktop. Raster map-label contrast belongs to the tile provider, not the measured UI.

Inherited guide copy, trivia and photos are not independently fact-checked. Image photographer/licence details remain unverified and are disclosed; broken images are hidden rather than shown as empty cards.

## Verification

`npm ci`, `npm test` (37 unit tests), `PW_PORT=8861 PW_BASE_URL=http://localhost:8861 npm run test:e2e -- --project=chromium --workers=1` (7 browser regressions), `WIDTH=390 npm run verify:visual` (68 states, both themes,10 places and controls). Chromium defaults to /usr/bin/google-chrome; CHROME overrides it. `npm run build` copies the static runtime to dist.

Final matrices also run at320 and1440. Contrast capture: `CONTRAST=1 WIDTH=390 npm run verify:visual` and same at1440; then `python verification/measure-contrast.py` (Pillow and NumPy required).136 rendered screens yielded2080 visible direct-text glyph samples, minimum6.757:1. Disabled controls also meet the floor. No audio feature is present, so no synthesized audio was added.

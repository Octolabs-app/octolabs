# OctoGarage — prototype 01

An Octolabs section at `/octogarage/`. Static HTML, CSS and ES modules; no build step, API keys or paid infrastructure. The main Octolabs homepage remains intact.

## Included

- Three real-car artist models: classic Fiat 500, MINI Cooper S and Tesla Model 3. Models load on demand, one at a time.
- Touch orbit/pinch/pan, camera presets, optional auto-rotation.
- Separate showroom and educational systems views. Select systems from the list or tap their geometry. Search, system filters, connections, descriptions and general symptoms.
- X-ray body transparency and an explode slider **for the educational systems**, not a manufacturer teardown of the imported asset.
- A car-library dialog with three 3D entries and on-demand NHTSA vPIC passenger-car makes and model-name searches.
- Source links to Reddit and forum search results, clearly labelled as searches rather than retrieved evidence or diagnoses.

## Accuracy and coverage

The imported models are artistic representations. Their exact model year, trim and mechanical accuracy have not been established. Internal teaching geometry is original, deliberately simplified, and not dimensionally accurate. It is not suitable for repair, assembly instructions, torque settings or high-voltage work. The Fiat overlay represents a rear air-cooled twin and drum brakes; MINI represents a front-engine transaxle; Tesla represents a rear-drive EV. Variants and modified cars differ.

**The catalogue is not every car on Earth.** vPIC is manufacturer-reported and primarily US-market oriented. Make/model names are not a complete history of global cars, generations, trims or engines. Catalogue results do not imply a 3D model exists. No fake 3D placeholders or fabricated coverage counts are used. Makes come from `GetMakesForVehicleType/car`; models from `GetModelsForMakeId/{id}`. Model-name lists can include other vehicle types from that make. Model results are cached only in memory for the current page session. Live API failures display retryable errors.

Assembly games (engine, brakes, wiring) are a subsequent milestone, not included in this release.

## Asset credits and dependencies

The models below retain **Creative Commons Attribution 4.0 International**: https://creativecommons.org/licenses/by/4.0/ . Attribution and source links are also displayed beside the active model in the app. No affiliation with the manufacturers is implied.

| Model | Author | Original source |
| --- | --- | --- |
| Fiat 500 (classic) | Francesco Coldesina | https://sketchfab.com/3d-models/fiat-500-4606659ff31142e3b8080f995514452f |
| MINI Cooper S | cenobyte | https://sketchfab.com/3d-models/mini-cooper-s-b262744901a04cda823f17289d1a4847 |
| Tesla Model 3 | David_Holiday | https://sketchfab.com/3d-models/tesla-model-3-123c10f376ec4f18b93c73afc382808b |

Distribution host: https://sceneview.github.io/models/platforms/ . Credits cross-checked against https://github.com/sceneview/sceneview/blob/main/assets/CREDITS.md and https://sceneview.github.io/credits.html on 2026-10-28. Assets are loaded unchanged and transformed only in memory for positioning, scaling and transparency. X-ray is a presentation effect. Original educational geometry and written explanations are separate from the licensed assets.

Three.js 0.146.0 and its addons load from jsDelivr under the MIT licence: https://github.com/mrdoob/three.js/blob/r146/LICENSE . Draco and Meshopt decoders use the corresponding Three.js addon distribution. Fonts load from Google Fonts. External hosts receive ordinary asset requests; the prototype stores no personal data. Internet access and WebGL are required. For production resilience, vendor the vetted assets/dependencies in a dedicated follow-up and retain their licences. Do not claim offline support.

## Run and validate

From repository root: `node octogarage/serve.cjs`, then open `http://127.0.0.1:8080/octogarage/`.

`node --test octogarage/tests/*.test.mjs`

`node --check octogarage/app.mjs` and `node --check octogarage/viewer.mjs`.

Before promotion to main, verify that all three real assets render, pinch/orbit works on a physical touchscreen, selecting parts and connected parts updates descriptions, X-ray and explosion operate on teaching geometry, and live catalogue success/error states work. Check phone portrait, tablet landscape and keyboard/dialog navigation. The repository's existing Cloudflare Pages integration supplies branch previews. Production publishes from main.

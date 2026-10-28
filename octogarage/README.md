# OctoGarage — Studio 02

Static Octolabs module at /octogarage/. No build, keys or paid infrastructure.

## Change in direction

The first prototype's procedural replacement internals have been removed. The viewer now renders, selects and visually separates only meshes that are actually in the imported artist asset. Nothing is substituted with primitive boxes or cylinders. The default reference is a Ferrari F40; the Fiat 500, MINI Cooper S and Tesla Model 3 remain in the library.

Studio presentation uses a neutral graphite environment, physically based materials, environment reflections, soft directional shadows, a grounded floor and a lower camera. These changes improve presentation but do not turn an artist model into a manufacturer digital twin or guarantee photorealism.

Tap a surface to inspect its source mesh. The mesh list uses author-supplied names; generic names become Surface 01, etc. One mesh can contain several physical parts. Neither mesh naming nor visual separation is a validated service assembly, disassembly sequence or collision simulation. Unknown meshes are not identified as engines. A component without a verified separate mesh is information-only, clearly indicated in the inspector. X-ray changes transparency of actual geometry; it does not invent hidden internals. Accurate internal systems and assembly games need appropriate licensed assets and remain unfinished.

## Four car assets / attribution

All retain Creative Commons Attribution 4.0 International: https://creativecommons.org/licenses/by/4.0/

| Model | Author | Original source |
| --- | --- | --- |
| Ferrari F40 | Black Snow | https://sketchfab.com/3d-models/ferrari-f40-52a66c41cfcd4f999fb1b1c49bf24d70 |
| Fiat 500 (classic) | Francesco Coldesina | https://sketchfab.com/3d-models/fiat-500-4606659ff31142e3b8080f995514452f |
| MINI Cooper S | cenobyte | https://sketchfab.com/3d-models/mini-cooper-s-b262744901a04cda823f17289d1a4847 |
| Tesla Model 3 | David_Holiday | https://sketchfab.com/3d-models/tesla-model-3-123c10f376ec4f18b93c73afc382808b |

Distributor: https://sceneview.github.io/models/platforms/ . Credits verified against https://github.com/sceneview/sceneview/blob/main/assets/CREDITS.md and https://sceneview.github.io/credits.html . Assets retain original geometry and texture maps; presentation applies scaling, positioning, lighting, selection tint, transparency and optional mesh translation in memory. Exact year, trim, dimensions and mechanical completeness are unverified. No manufacturer affiliation is implied. Render a candidate before calling it realistic; the UI concept image is not evidence of available asset detail.

Three.js 0.146.0 and addons: MIT, https://github.com/mrdoob/three.js/blob/r146/LICENSE . This release supports the Fiat asset's legacy specular/glossiness material extension. Dependencies are pinned through jsDelivr. Models and fonts load from external hosts and need internet; no offline guarantee or personal-data storage. Use a modern WebGL browser. Physical touch behaviour still needs device testing.

## Catalogue and problems

On-demand NHTSA vPIC makes and model names are manufacturer-reported, primarily US-market oriented, and are not every historical/global car, generation, trim or engine. Model-name results may include other vehicle types for the make. Catalogue-only entries do not include 3D assets. API errors are retryable, and successful model results are cached only in current-session memory. Reddit/forum buttons open search results; no live discussion retrieval or verified diagnosis is claimed.

## Run and verify

From repository root: node octogarage/serve.cjs . Open http://127.0.0.1:8080/octogarage/ . Run node --test octogarage/tests/*.test.mjs and syntax checks for app.mjs and viewer.mjs.

Browser QA: inspect the F40 and the other three assets; select actual meshes by list and by tapping; test X-ray, separation and return to Studio; verify information-only components never create fake geometry; check portrait and landscape layouts and catalogue success/error states. Existing Cloudflare Pages branch previews publish the feature branch. Main remains the production branch. This update stays in draft PR #20 until reviewed.

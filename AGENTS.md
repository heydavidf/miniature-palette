# Pigment contributor guide

Pigment turns image/seed colours into independent miniature-painting palettes and printable reference cards. Start with the canonical [README setup and validation instructions](README.md#run-locally). Installing/using the app is separate from changing its code; publication and deployment need the owner's instruction.

## Code and data map

- `src/App.tsx`: workspace, palette/shade/paint selection, async image extraction and save/restore.
- `src/colour.ts`, `src/extract.worker.ts`: colour generation, image candidate extraction and approximate matching.
- `src/scheme-state.ts`, `src/types.ts`, `src/storage.ts`: study data, target traversal and validated local persistence/backup.
- `src/Panorama.tsx`, `src/framing.ts`: pointer/keyboard panorama framing in original-image coordinates, separate from extraction crop.
- `src/export.ts`: shared Compact preview/PNG/A4 PDF renderer and separate printer proof. `src/card-layout.ts` owns semantic core/companion roles; `src/print-pairs.ts` preserves separate/shared/missing bottle choices.
- `src/style.css`: neutral Instrument Sans/IBM Plex Mono interface. Keep artwork and intended colours visually dominant.
- `public/paints.json`, `src/art.json`, `public/images/`: bundled catalogue/art credits; full rights are in `THIRD_PARTY_NOTICES.md` and adjacent notices.
- `src/*.test.ts`, `scripts/check-*.mjs`: unit and disposable-browser checks. `examples/` is synthetic first-use data. `dist/`, node_modules and `.test-output/` are generated/ignored.

## Changes and checks

Use the exact [build/browser/optional PDF commands](README.md#build-and-validate); run from the repository root. Start the loopback dev server before browser checks; use PALETTE_TEST_URL for another port. Do not change a user's ordinary browser data to test a feature. Review executable commands before running them.

Preserve version-1 study compatibility and validation, original hex values separate from paint matches, independently chosen core/anchor bottles, manual/crossed tones and extraction/restore race guards. Palette counts are 3–8; missing choices stay explicit. Framing must not re-extract or alter colours. The shared card renderer keeps readable type and exact clear patches; oversized single-side studies fail explicitly rather than silently dropping text or adding pages. Printer proof is separate; do not claim physical colour certification.

Keep runtime dependencies, lockfile and bundled notices in agreement. Data imports overwrite published assets and are only run when explicitly requested; inspect all resulting credits/licences and exclusions. Never commit real studies, private references, credentials, cache/output folders or unrelated workspace instructions. New features should stay focused; significant product, identity or publication changes need an explicit request.

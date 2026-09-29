# Miniature Palette

Turn an image or a few starting colours into a miniature painting scheme, then find named paints for the core colours and their shadows and highlights.

Use it at the painting desk: keep the reference image beside your palette, shift a pink toward red without changing neighbouring colours, develop independent shading sequences, and export a reference card with the paints you picked.

## Run locally

You need Node.js 22 or later, npm, and a modern browser. No ChatGPT account, API key, backend service or paid integration is required. The first install needs internet access.

Download this repository as a ZIP and extract it, or clone it. Open a terminal in the `miniature-palette` folder and run:

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:5178**. Keep the terminal running while painting; press Control-C to stop it. A credited artwork and five colours appear when the app is ready. If the port is occupied, stop the other server or use `npm run dev -- --port 5189`; a different port has separate browser storage.

On macOS, after installing Node, you can also double-click **Open Miniature Palette.command**. It installs dependencies if needed and opens the app after the server is ready. If Finder cannot run the file, use the terminal commands above. If `npm` is not found, install Node.js, reopen your terminal and retry. If downloads fail, restore the network connection and rerun `npm ci`.

## Try a complete study

Follow the [five-minute example](examples/README.md), using the included synthetic [pink, blue and gold backup](examples/pink-blue-gold.json).

1. Start from an image, a bundled artwork, or seed colours. Select three to eight swatches.
2. Tune the whole palette, or select **Adjust colour** to edit one swatch’s hue, vividness, lightness or exact hex. Preview before applying. Applied edits stay fixed during whole-palette tuning; unlock that swatch to include it again.
3. **Lock palette**, then **Develop this colour** for any core swatch. Choose its role as shadow, midtone or highlight. Reuse colours from elsewhere in the palette or choose new tones. Manual choices stay fixed when you change tonal spread.
4. **Find paint matches** for the **Core palette** or **Extended palette**. Compare up to three alternatives per target, filter by brand/range and choose a bottle. A checkmark marks a saved paint choice.
5. Name and save the study. Export a PNG reference card or a JSON backup. Reopen saved studies through **My schemes**.

## Your data

Images are processed in your browser. Saved studies use IndexedDB and belong to that browser and origin (including the port). There are no app analytics or uploads to a service. External artwork/source links open only when followed; a hosting provider may collect its own access logs.

Export **Backup** for durable copies or to move a study to another browser. Backups contain the source image and selected paints. **Restore backup** loads one, then **Save scheme** keeps a local copy. Clearing browser data removes saved studies. Changing the local directory does not move browser storage. The app does not automatically reopen the last study.

Uploads accept JPG, PNG and WebP, up to 20 MB and 40 megapixels; images need opaque pixels. JSON backups are limited to 35 MB. Treat images and backups you share as your own content, separate from this repository.

## Paints and artwork

The catalogue contains 945 filtered records from Citadel, Vallejo, Army Painter Fanatic, AK 3rd Gen and Pro Acryl. It is a curated subset, not complete or guaranteed-current manufacturer coverage. Matching compares digital RGB swatches using CIEDE2000; primer, finish, lighting and application can change the painted result. No mixing recipes are provided.

Six public-domain artworks are bundled from The Metropolitan Museum of Art. Images, fonts and paint data load locally after dependencies are installed. This is not an installable offline PWA.

See [third-party attribution and licences](THIRD_PARTY_NOTICES.md). The original application code is available under the [MIT licence](LICENSE). Bundled third-party materials retain their respective licences.

## Build and test

```sh
npm test
npm run build
```

The build produces a static site in `dist/`. Serve it at a domain root with HTTPS, or use `npm run preview` locally. Opening `dist/index.html` directly as a file is unsupported. GitHub Pages project subpaths such as `/repository-name/` are not supported by the current root-relative asset paths.

For browser tests, install Chromium once and start the dev server in another terminal:

```sh
npx playwright install chromium
npm run test:browser
```

The suite uses disposable contexts, creates its own test-output directory, and checks extraction, shading, paint choices, persistence, export/restore, invalid files, colour adjustments and desktop/mobile accessibility. It does not touch your usual browser’s saved studies. Results go into ignored `.impeccable/review/`. To test another local port on macOS/Linux, run `PALETTE_TEST_URL=http://127.0.0.1:5189 npm run test:browser`.

Development checks use Chromium. Physical phones, Safari/Firefox and Windows are not covered by the release test evidence; an automated accessibility scan is not a full accessibility certification.

## Maintain or remove

Before updating, export backups. Replace the source with the newer release or pull its changes, run `npm ci`, and restart on the same origin to retain existing browser studies. Stop the server before deleting the app folder; browser data and downloaded backups remain until you remove them separately.

Paint/artwork refresh scripts are maintainer tools, require Python 3 and internet access, and are never run on startup. They overwrite bundled data: review their output, licence notices and credits before committing a refresh. `scripts/import-paints.py` records the upstream revision used; `scripts/import-art.py` checks Met public-domain flags.

For bugs, use this repository’s issue tracker with reproduction steps, browser/version and a synthetic example. Do not attach private images or backups. Contributions should stay focused and pass the relevant tests. This is an experimental painting tool without a support-service guarantee. See [SECURITY.md](SECURITY.md) for sensitive reports.

# Pigment

Turn an image or a few starting colours into a miniature painting scheme, find named paints for each colour and shade, and print a compact reference card for your painting desk.

The repository keeps its original `miniature-palette` name. This update adds the neutral Pigment workspace, a draggable panorama, quicker paint selection and A4 portrait reference cards.

## Run locally

You need **Node.js 22 or later**, npm and a modern browser. No account, API key, backend or paid service is required. Internet access is needed for the initial dependency install.

Download this repository as a ZIP and extract it, or clone it. Open a terminal in the repository folder:

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:5178**. A credited artwork and five colours appear when analysis finishes. Keep the terminal running; press Control-C to stop. If the port is occupied, stop the other server or use `npm run dev -- --port 5189`. Each port has separate browser storage.

On macOS, after installing Node, you can double-click **Open Miniature Palette.command**. The launcher installs dependencies if needed and opens Pigment when the server is ready. If Finder cannot run it, use the commands above. If npm is missing, install Node, reopen the terminal and retry. If installation fails, check your network and rerun `npm ci`.

### Ask your agent

Give your agent the repository URL and this request:

> Inspect https://github.com/heydavidf/miniature-palette and its README. Help me install Pigment locally, verify Node/npm, start it on a free loopback port, and complete the synthetic example in examples/README.md. Explain browser-local storage and help me export a backup and an A4 reference PDF. Do not publish, deploy, change unrelated configuration or use my private images without my instruction.

Agents making code changes should read [AGENTS.md](AGENTS.md). The example and setup instructions here are sufficient; no private workspace or additional skill is required.

## Make your first study

The [five-minute example](examples/README.md) uses a synthetic [pink, blue and gold backup](examples/pink-blue-gold.json).

1. Choose a bundled artwork, upload a JPG/PNG/WebP, or start **From colours**. Choose three to eight colours.
2. Tune the palette, or select a swatch and **Adjust colour** to preview hue, vividness, lightness or an exact hex. **Apply colour** fixes that swatch during whole-palette tuning; unlock it to include it again.
3. **Lock palette**, then optionally **Develop this colour**. Each colour has its own shadow/midtone/highlight sequence. Choose the core role, reuse another palette colour or choose a new tone. Manual choices stay fixed when tonal spread changes.
4. **Find paint matches**, filter by brand/range and choose a bottle. Each selection advances to the next core or developed shade. **Previous/Next** and **Choose a specific colour or shade** let you revisit targets. Core and anchor bottles can differ.
5. Drag the image to choose the panorama crop; arrows and **Centre** are alternatives. Framing preserves the colours and paint choices. **Sample** is a separate mode.
6. Name and save the study. Use **Preview card**, **Export card** PNG or **Print PDF**. Keep a JSON **Backup** for another browser or a future update. Reopen saved work through **My studies**.

## Print a comparison card

The regular card is one A4 portrait side: your selected proportional panorama, then three square/paint-label pairs across each row. Paint names lead the labels, with full bottle details and colour roles underneath. The intended colour remains separate from its approximate paint match.

The card states its clear comparison-square size. Full five/six/seven-colour test studies fit at 30/25.5/21 mm; longer text can need smaller squares, down to 16 mm. Fit depends on actual details. Dense eight-colour studies or oversized source text can exceed the readable one-side limit: Pigment shows a message, retains the study and lets you make a complete backup. Extra-page card output is not implemented.

Print the PDF at **Actual size / 100%**, with page fitting disabled. The separate **Printer proof** supplies current/baseline colour patches, a 50 mm measuring line and settings/result fields. Measure the line and the card's stated square size before comparing a painted part.

Digital colours and print dimensions have been checked, but printer, ink, paper, lighting and paint finish affect the physical result. Real-paper colour accuracy and legibility are not certified. PNG records sRGB intent and 300 dpi density; some viewers ignore that metadata, so PDF is the intended print route.

## Your data

Images are processed locally in the browser. Saved studies use IndexedDB and belong to that browser and origin, including its port. There are no app accounts, analytics or image uploads to a service. External source links open only when followed; a hosting provider may collect its own logs.

**Backup** embeds the image, framing and paint choices. **Restore backup** loads it; save afterward to keep a local copy. Clearing browser data removes saved studies. The app does not automatically reopen the last study. Changing folders does not move browser storage.

Uploads accept JPG/PNG/WebP up to 20 MB and 40 megapixels, with opaque pixels. Backups are limited to 35 MB. Share your own images/backups deliberately; they are separate from this repository.

## Paints, artwork and licences

The catalogue contains 945 filtered records across Citadel, Vallejo, Army Painter Fanatic, AK 3rd Gen and Pro Acryl. It is a curated subset, not complete or guaranteed-current manufacturer coverage. Digital RGB matching uses CIEDE2000 and supplies approximate bottle suggestions, not physical measurements or mixing recipes.

Six public-domain artworks come from The Metropolitan Museum of Art. Artwork, fonts and the catalogue are bundled. Once installed, the local app needs no external service; it is not an installable offline PWA.

Original code is under [MIT](LICENSE). [Third-party notices](THIRD_PARTY_NOTICES.md) cover the catalogue, artwork, fonts and PDF/runtime libraries; those materials retain their own licences.

## Build and validate

```sh
npm test
npm run build
```

The build produces `dist/`. Serve it at a domain root with HTTPS, or use `npm run preview` locally. Opening `dist/index.html` directly is unsupported. GitHub Pages project subpaths such as `/repository-name/` are not supported by the root-relative asset paths. No hosted demo is provided here.

For browser checks, install Chromium and keep the dev server running in another terminal:

```sh
npx playwright install chromium
npm run test:browser
```

The checks use disposable contexts and synthetic/public fixtures; they do not touch your usual browser's studies. They cover image extraction, editing, independent shades, matching, framing, save/reopen/restore, restore-race protection, actual exports, fit limits and desktop/mobile accessibility. Ignored artifacts go into `.test-output/`. For a different local port on macOS/Linux: `PALETTE_TEST_URL=http://127.0.0.1:5189 npm run test:browser`.

Optional independent PDF geometry/pixel checks require Python 3 with Pillow and Poppler (`pdfinfo`, `pdfimages`). On macOS, Poppler can be installed with Homebrew (`brew install poppler`); other systems need their own Poppler package. After the browser suite, create an isolated Python environment and run:

```sh
python3 -m venv .venv
. .venv/bin/activate
python -m pip install Pillow
npm run test:print
```

Use `deactivate` afterward. These tools are development-only; the app itself does not need them.

Release checks use macOS and Chromium. Physical phones, Safari/Firefox and Windows are not covered; automated accessibility checks are not full certification.

## Update, remove and contribute

Before updating, export backups. Pull the newer release or replace the folder, run `npm ci`, and restart at the same browser origin. Stop the server before deleting the folder; browser data and downloaded backups remain until removed separately.

Data-import scripts are maintainer tools requiring Python 3 and internet access. They overwrite bundled data and never run on startup. Review refreshed data, exclusions, upstream revisions, credits and notices before committing.

For bugs, use the repository's issue tracker with reproduction steps, browser/version and a synthetic example. Do not attach private images/backups or secrets. See [SECURITY.md](SECURITY.md) for sensitive reports and [AGENTS.md](AGENTS.md) for the code map and change constraints. This is an experimental painting tool without a support-service guarantee.

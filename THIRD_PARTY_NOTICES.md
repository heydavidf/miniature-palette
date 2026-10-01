# Third-party material

The application’s own licence does not replace these notices.

## Paint catalogue

The 945 bundled records are a filtered selection from [Miniature Painter Pro](https://github.com/Arcturus5404/miniature-paints), revision `22791a682e1d155da388f4f856cd7196cd9f2677`. Copyright © 2022 Rick Fleuren; MIT licence. The full notice is [public/PAINT-DATA-LICENSE.txt](public/PAINT-DATA-LICENSE.txt). Each record retains its source URL. Brand and product names identify the paints; no manufacturer endorsement is implied.

## Artwork

Six public-domain artworks come from [The Metropolitan Museum of Art Open Access](https://www.metmuseum.org/hubs/open-access), which provides eligible images under CC0. Adjacent `public/images/*.jpg.json` files identify each artwork, artist and image source; `src/art.json` contains the app credits. Retain their provenance when redistributing the collection.

## Fonts

The interface and card use Instrument Sans and IBM Plex Mono, bundled unmodified with their complete SIL Open Font License notices in [public/fonts](public/fonts/). Instrument Sans: copyright 2022 The Instrument Sans Project Authors. IBM Plex Mono: copyright 2017 IBM Corp., reserved font name Plex. The unused DM Sans npm dependency remains separately licensed under OFL-1.1.

## Runtime dependencies

Complete copyright/licence notices are bundled in [public/THIRD-PARTY-LICENSES.txt](public/THIRD-PARTY-LICENSES.txt) and included in the production output. The locked production tree, including optional dependencies, is:

| Package | Version | Licence |
|---|---|---|
| @babel/runtime | 7.29.7 | MIT |
| @fontsource/dm-sans | 5.3.0 | OFL-1.1 |
| @types/pako | 2.0.4 | MIT |
| @types/raf | 3.4.3 | MIT |
| @types/trusted-types | 2.0.7 | MIT |
| base64-arraybuffer | 1.0.2 | MIT |
| canvg | 3.0.11 | MIT |
| core-js | 3.50.0 | MIT |
| css-line-break | 2.1.0 | MIT |
| culori | 4.0.2 | MIT |
| dompurify | 3.4.16 | (MPL-2.0 OR Apache-2.0) |
| fast-png | 6.4.0 | MIT |
| fflate | 0.8.3 | MIT |
| html2canvas | 1.4.1 | MIT |
| idb-keyval | 6.3.0 | Apache-2.0 |
| iobuffer | 5.4.0 | MIT |
| jspdf | 4.2.1 | MIT |
| lucide-react | 0.468.0 | ISC |
| pako | 2.2.0 | (MIT AND Zlib) |
| performance-now | 2.1.0 | MIT |
| raf | 3.4.1 | MIT |
| react | 19.3.0 | MIT |
| react-dom | 19.3.0 | MIT |
| regenerator-runtime | 0.13.11 | MIT |
| rgbcolor | 1.0.1 | MIT OR SEE LICENSE IN FEEL-FREE.md |
| scheduler | 0.28.0 | MIT |
| stackblur-canvas | 2.7.0 | MIT |
| svg-pathdata | 6.0.3 | MIT |
| text-segmentation | 1.0.3 | MIT |
| utrie | 1.0.2 | MIT |

DOMPurify's dual licence texts are retained; idb-keyval's complete Apache-2.0 notice, Lucide's Feather attribution and pako's MIT/Zlib notices are preserved. Dependency code is installed by npm rather than committed as node_modules. Development tools retain their installed package notices. Review this file and the bundled texts whenever dependencies change.

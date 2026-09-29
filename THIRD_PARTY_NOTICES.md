# Third-party material

The application’s own licence does not replace these notices.

## Paint catalogue

The 945 bundled records are a filtered selection from [Miniature Painter Pro](https://github.com/Arcturus5404/miniature-paints), revision `22791a682e1d155da388f4f856cd7196cd9f2677`. Copyright © 2022 Rick Fleuren; MIT licence. The full notice is [public/PAINT-DATA-LICENSE.txt](public/PAINT-DATA-LICENSE.txt). Each record retains its source URL. Brand and product names identify the paints; no manufacturer endorsement is implied.

## Artwork

Six public-domain artworks come from [The Metropolitan Museum of Art Open Access](https://www.metmuseum.org/hubs/open-access), which provides eligible images under CC0. Adjacent `public/images/*.jpg.json` files identify each artwork, artist and image source; `src/art.json` contains the app credits. Retain their provenance when redistributing the collection.

## Runtime libraries and font

Full copyright and licence notices are bundled in [public/THIRD-PARTY-LICENSES.txt](public/THIRD-PARTY-LICENSES.txt), which Vite includes in production output:

| Package | Version | Licence |
|---|---|---|
| @fontsource/dm-sans | 5.3.0 | OFL-1.1 |
| culori | 4.0.2 | MIT |
| idb-keyval | 6.3.0 | Apache-2.0 |
| lucide-react | 0.468.0 | ISC |
| react | 19.3.0 | MIT |
| react-dom | 19.3.0 | MIT |
| scheduler | 0.28.0 | MIT |

Lucide also retains attribution for its Feather-derived portions. DM Sans remains under OFL-1.1. The complete Apache-2.0 text accompanies idb-keyval’s notice.

Development tools have their own licences in their installed packages. Dependencies are installed through npm and pinned in `package-lock.json`; `node_modules` is not distributed here. Review and refresh bundled notices whenever runtime dependencies change.

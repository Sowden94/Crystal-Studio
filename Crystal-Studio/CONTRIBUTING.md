# Contributing

Crystal Studio is beta software under active development. Bug reports and feature suggestions are welcome through GitHub Issues. Do not upload confidential, unpublished, or personal data to public issues.

Use Node.js 24 and `npm ci`. Run `npm run check` and `npm test` before a pull request. `npm start` opens the local desktop app. For a browser preview, serve the `web/` directory through a local static server.

Keep the online and desktop workflows compatible. Use the existing project schema and validate file inputs. For crystallographic changes, add a small constructed or permissively redistributable fixture and check atom counts, connectivity, symmetry-generated geometry, and displacement-tensor transformations.

Contributions are distributed under GPL-3.0-only. Keep third-party attribution and licence texts intact. Screenshots and examples should demonstrate implemented behaviour and should not imply that constructed coordinates are experimental data.

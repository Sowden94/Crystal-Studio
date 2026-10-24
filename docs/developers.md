# Developer notes

## Structure

- `web/`: the shared browser and desktop UI, renderers, parsers, and project format.
- `desktop/`: Electron's main process, sandboxed preload bridge, and native file operations.
- `examples/`: constructed public demonstration structures.
- `tests/`: synthetic parser, symmetry, project, and file-operation checks.
- `docs/`: user guide, screenshots, and publishing instructions.
- `.github/workflows/`: GitHub Pages deployment and native desktop packaging.

The online version is a static export of `web/`; no server-side file processing or API key is needed. Paths are relative so the app can run under a GitHub project Pages subdirectory.

Electron serves only bundled app assets through a secure custom protocol. The renderer has context isolation and sandboxing enabled and cannot access Node.js. Every native IPC operation checks its sender. Project saves and exports are written atomically to user-approved paths; external navigation is restricted to documentation domains.

## Commands

```sh
npm ci
npm run check
npm test
npm start
npm run build:web
```

Mac packages must be produced and tested on macOS; Windows installers must be tested on Windows. The workflow uses native GitHub-hosted runners for those outputs. The Linux directory package is an internal packaging check, not an advertised supported download.

## Project format

`web/project.mjs` owns schema version 1. Atom positions and bonds are stored in the full-model coordinate system, then selected groups and view settings are restored. Input PDFs, CIF text, and reflection data are not embedded. Validate schema and all indices before applying a project.

## Release discipline

Tag releases as `v0.1.0-beta.1` (matching `package.json`). The build workflow makes a draft prerelease with native packages and SHA-256 checksums. Test it before publishing. Manual workflow runs create build artifacts without a public release. There is no auto-updater.

The initial configuration is unsigned and unnotarized. Add and validate platform signing before broad distribution. Do not commit certificates, passwords, private structure files, tokens, or other secrets.

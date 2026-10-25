# Security review — beta 2, 24 October 2026

This update builds on the earlier security patch. It is a focused source review, upstream advisory check and regression exercise, not an independent penetration test or a guarantee of zero vulnerabilities. No private research files were used.

## Recent upstream fixes and applicability

| Source | Relevant issue or recommendation | Action in Crystal Studio |
|---|---|---|
| [Mozilla PDF.js advisory, July 2026](https://github.com/mozilla/pdf.js/security/advisories/GHSA-hq66-cqwq-w95j) and [current release](https://github.com/mozilla/pdf.js/releases/tag/v6.4.299) | Malicious PDF scripting; the advisory lists affected versions starting with 5.6.83 and a fix in 6.2.108. | Updated from 4.10.38 to the current 6.4.299 compatibility build. The old version was outside that listed affected range; this is a maintenance upgrade, not evidence of an exploit in the old app. No scripting viewer is used; eval, XFA, Wasm, font-face loading and image decoding remain disabled. |
| [ngx-extended-pdf-viewer advisory, July 2026](https://github.com/stephanrauh/ngx-extended-pdf-viewer/security/advisories/GHSA-w9hm-4m3m-fxmm) | A bundled PDF.js fork escaped normal package dependency scanning. | Added a separate exact-version audit lock for all bundled browser libraries, SHA-256 file inventory and build-time consistency checks. |
| [SiYuan import advisory, March 2026](https://github.com/siyuan-note/siyuan/security/advisories/GHSA-ff66-236v-p4fg) | Imported markup became XSS, then native command execution through privileged Electron access. | Retained text-only display of imported metadata, CSP, sandboxing and disabled Node integration. Moved coordinate imports into workers, revalidate their models, and strengthened native project/export validation. SiYuan's Go escaping patch is not applicable to this JavaScript app and was not copied. |
| [Electron 45 release notes](https://releases.electronjs.org/release/v45.0.0) | Current runtime fixes include worker/subframe and extension boundary changes. | Electron was already 45.0.0, the current stable version confirmed at review time. Kept it, explicitly disabled worker/subframe Node integration and webviews, and retained permission denial. No older runtime was substituted. |
| [Electron fuse guidance](https://www.electronjs.org/docs/latest/tutorial/fuses) | Disable unused powerful launch features and constrain packaged code loading. | Disabled RunAsNode, NODE_OPTIONS, CLI inspection and extra file-protocol privileges; enabled ASAR-only loading and embedded integrity checking on supported platforms. |

## Implemented protections

- Browser and desktop policies disable fetch/XHR/WebSocket connections (`connect-src 'none'`), inline scripts, eval, forms, embedded pages and plugins. Bundled JavaScript modules can still load from the app origin.
- CIF/XYZ/MOL/SDF parsing, inferred bonds and symmetry completion run in a dedicated worker with a 15-second termination deadline. PDF-to-model conversion also runs there. Worker results are validated again before rendering.
- PDF extraction uses a dedicated wrapper worker and an explicitly supplied native PDF parser worker. It does not silently fall back to parsing in the page. The page can terminate the wrapper at 45 seconds or on cancellation.
- Trusted static module wrappers in blob workers inherit the creator's CSP. This matters on GitHub Pages, where an HTML meta policy does not automatically constrain a separately network-loaded worker. See [MDN worker policy documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#content_security_policy).
- Models are limited to 2,000 atoms, 20,000 bonds, 64 coordinate data blocks and 512 symmetry operations. Coordinates must be finite and within the supported range.
- PDFs are limited to 30 MiB, 150 pages, 10,000 text items per page, 100,000 items total and 2,000,000 extracted characters. The PDF signature is checked before parsing.
- Native project reads are bounded, regular-file-only and validated in the main process. Native export types require matching PNG/GIF/WebM signatures and destination extensions. Arbitrary executables are not export formats.
- Desktop renderer traffic remains blocked at the session layer, permissions are denied, IPC is restricted to the main application document, external Help links use an exact URL allowlist, and generic downloads are blocked.
- Workflow action versions are pinned to verified upstream commit IDs and checkout credentials are not persisted. Security CI and Dependabot configuration are supplied.

Worker threads reduce access to the page and preload bridge and allow termination of synchronous parser work. They are not separate OS security processes and have no strict per-file OS memory quota. Browser/Chromium vulnerabilities, decompression memory pressure, trusted-origin compromise and malicious dependency updates remain risks.

## Verification and limits

- **36 automated tests passed**, covering worker completion/timeout/cancellation/failure, unavailable workers failing closed, hostile URLs, native file signatures and size limits, IPC wiring with a mocked Electron API, geometry, project persistence and synthetic PDF extraction.
- **3,000 deterministic malformed synthetic CIF/XYZ/MOL cases completed** within the 30-second fuzz-run limit: 191 accepted and revalidated; 2,809 rejected. This mutation smoke test is not exhaustive fuzzing, does not fuzz the JavaScript engine, and does not provide broad PDF exploit coverage.
- Both npm dependency audit inventories reported **zero known vulnerabilities** at review time. This means no matching published advisory was reported, not that the code has no vulnerabilities.
- Syntax checks, static build and Linux desktop packaging passed. Packaged Linux binary fuse bytes were read back: RunAsNode, NODE_OPTIONS, CLI inspection and extra file privileges disabled; ASAR-only loading and integrity fuse enabled. Linux does not provide the same ASAR integrity enforcement as supported Mac/Windows builds.
- A browser fixture successfully extracted a constructed PDF coordinate table and parsed synthetic XYZ coordinates through the worker pipeline. The ordinary app also started successfully.
- **Outstanding:** the final browser test of CSP inheritance, blocked remote worker connections and forced worker termination was blocked by the cloud browser's policy gate. That final check is not counted as passed. The earlier extraction check preceded the final `connect-src 'none'` tightening.
- **Outstanding:** actual Mac and Windows installer runtime tests, including blob/module workers under the custom protocol, native file dialogs and ASAR integrity. Mocked Electron checks and Linux packaging cannot replace those tests.
- **Outstanding:** independent security review, sustained fuzzing, signing/notarization and repository/account security settings. No GitHub account permission changes or security settings were made.

## Ongoing checks

```sh
npm run check
npm test
npm run security:fuzz
npm run security:audit
```

The Security checks workflow runs on pushes and pull requests and supports manual dispatch. Dependabot checks the root npm lock, bundled-library audit lock and pinned GitHub Actions. Maintainers must update vendored files and their hashes together; a dependency inventory change alone does not replace bundled code.

Apply all package files together, then rebuild desktop downloads from the new main commit. Existing installed copies do not acquire these changes automatically. Keep this version under beta review until the outstanding platform and browser checks are completed.

## Windows checkout follow-up — 25 October 2026

The first Windows desktop build stopped at the bundled Three.js hash check. Git line-ending conversion was reproduced locally; the file content changes from LF to CRLF during Windows-style checkout. The new root `.gitattributes` keeps vendor files as exact bytes. A regression test reproduces the mismatch without the rule and verifies exact bytes with it; real content changes still produce a different hash. Both Mac packaging jobs had passed. A new Windows GitHub build is required to verify the complete corrected pipeline.

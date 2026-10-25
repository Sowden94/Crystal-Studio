# Security

The app processes structure and project files locally. The desktop renderer is sandboxed and has no direct Node.js access; native file operations are exposed through a narrow preload bridge and use user-selected paths.

If you find a vulnerability, use GitHub's private vulnerability reporting for this repository when available. If that feature has not been enabled, open a minimal issue requesting a private reporting channel without publishing exploit details, credentials, private structures, or personal data.

Only the current beta development line is maintained. Dependency and signing improvements may arrive in frequent updates. The initial desktop packages are unsigned and are not a substitute for signed, notarized production releases.

## Protections

- The browser app has a content security policy restricting scripts to its own origin and disabling fetch/XHR/WebSocket connections, blocking inline JavaScript, eval, forms, embedded pages, and plugins. All rendering dependencies are bundled.
- The desktop app keeps Node integration off, context isolation and sandboxing on, and denies permission requests. IPC requests must come from the main application document. Native saves still use user-selected destinations.
- Desktop renderer requests are restricted to packaged resources and in-memory data. External Help links open only an exact approved URL in the system browser; arbitrary query strings and destinations are rejected.
- Coordinate imports are bounded before expensive bond inference and symmetry expansion. Models are limited to 2,000 atoms and 20,000 bonds.
- PDF import extracts text without rendering PDF forms or running embedded scripts. Dynamic evaluation, XFA and font-face loading are disabled. Size, page, text-item and extracted-character budgets limit resource use; a page-controlled 45-second deadline terminates a stalled PDF extraction worker. Cancel also destroys the current task.

These are risk reductions, not a guarantee that malformed files cannot exhaust resources or exploit an undiscovered parser or browser vulnerability. See [review and verification notes](docs/security-review.md).

## Maintaining dependencies and releases

Run `npm audit` for the npm lockfile and review upstream advisories for the separately bundled Three.js, gifenc and PDF.js versions listed in `THIRD-PARTY-NOTICES.md`. The npm lockfile alone does not cover those vendored files. Keep Electron current and rebuild installers after security changes; existing downloaded installers do not update themselves.

Before distributing publicly, test on Mac and Windows and configure Windows signing and Apple signing/notarization. Signing helps verify the publisher and package integrity; it does not fix application bugs. Enable GitHub Dependabot alerts and private vulnerability reporting in repository settings where available. Never include private research files in issues, test fixtures, release assets or demonstration media.

## Beta 2 import isolation and audit inventory

CIF/XYZ/MOL/SDF parsing and report-to-model conversion run in dedicated workers with a 15-second deadline. PDF extraction uses a dedicated worker plus an explicitly supplied native PDF parser worker; no main-page PDF parser fallback is allowed. Both use trusted module wrappers in blob workers to inherit the creator's CSP on GitHub Pages. Imported data is validated again before rendering. Workers cannot access the DOM or the Electron preload bridge; they are browser threads, not independently secured operating-system processes, and they have no strict per-import OS memory quota.

PDF.js is updated to 6.4.299 using Mozilla's official compatibility build. `security/vendor` pins audit versions separately from the desktop/build dependencies. `security/vendor-manifest.json` records bundled-file SHA-256 hashes. `npm run check` verifies that inventory. `npm run security:audit` checks both npm lockfiles; `npm run security:fuzz` runs a bounded, deterministic synthetic coordinate mutation test. Dependabot proposals do not automatically replace vendored files: maintainers must update the bundled code and hashes together and retest.

Packaged desktop fuses disable RunAsNode, NODE_OPTIONS, Node CLI inspection and extra file-protocol privileges, and require loading the app from ASAR with integrity checking where Electron supports it. Signing remains necessary to protect distribution integrity; these settings do not certify the app. GitHub Actions are pinned to reviewed commit IDs and checkout does not persist credentials. The Security checks workflow runs on pushes and pull requests and can be started manually; GitHub account settings still control alerts and private vulnerability reporting.

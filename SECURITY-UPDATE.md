# Apply the beta 2 security update

This package replaces the earlier security update. It contains application code, dependencies, security checks and documentation only. No user research files are included.

1. Unzip the download.
2. Open the repository's main Code page, where `package.json` is visible.
3. Use **Add file → Upload files**. Upload all extracted contents together, including `.gitattributes`, `.github`, `web`, `desktop`, `tests`, `scripts`, `security`, `docs` and the root files. On a Mac, press **Command + Shift + .** in Finder to show `.github` and `.gitattributes`. Upload the contents, not the ZIP or its enclosing folder. Existing unrelated files remain in place.
4. Commit the changes. Confirm **Online app (GitHub Pages)** and **Security checks** pass. If Security checks reports an advisory, review it before publishing desktop downloads.
5. Start a new **Desktop downloads** workflow using **main**. Rerunning an older workflow would build the older commit.
6. Test the new installers on Mac and Windows before publishing them. Signing/notarization remain separate tasks.

The package includes a detailed [security review](docs/security-review.md). A final browser check of the strictest worker policy was blocked by the testing environment, so it remains outstanding. The previous worker-based synthetic PDF and XYZ extraction check passed. This is additional hardening, not a guarantee of zero vulnerabilities or a substitute for an independent review.

When Dependabot proposes a bundled-library update, update the copied files and `security/vendor-manifest.json` as well as the inventory lock. A lockfile update alone does not patch a library copied into `web/vendor`.

Windows checkout correction, 25 October 2026: `.gitattributes` disables line-ending conversion for `web/vendor/**`. This preserves the audited files byte for byte. The integrity check remains enabled. Start a new workflow from main after committing this file.

# Put everything on GitHub

This source package is prepared for **Sowden94/Crystal-Studio**. It does not create that repository or claim a live Pages deployment or completed desktop release.

## 1. Create the repository

Create a new **public** repository named `Crystal-Studio` in the `Sowden94` account. Do not use an unrelated existing repository. If using the connected GitHub app to populate it, include this new repository in that app's allowed repositories.

Keep the source tree intact, including dot-prefixed `.github/` workflow and template folders. `node_modules/`, `release/`, `site/`, `.openai/`, user research files, and credentials do not belong in the repository.

If a different name or owner is chosen, update the repository URL in `package.json`, README links, `CITATION.cff`, and desktop Help links before publication.

## 2. Online app: GitHub Pages

In the repository, choose **Settings → Pages → Source → GitHub Actions**. Push the source to `main` and run the **Online app (GitHub Pages)** workflow. The workflow checks the code, runs tests, builds `site/`, and deploys it as a Pages artifact.

The expected address for this repository name is `https://sowden94.github.io/Crystal-Studio/`. The workflow's returned deployment URL is the authority; do not announce it as live before the deployment succeeds.

## 3. Desktop downloads: GitHub Actions and Releases

Run **Desktop downloads** from Actions manually for the first test build. It builds on Mac and Windows runners and uploads workflow artifacts. These artifacts are **test downloads**, not a public release.

For a release, update the package version and changelog, then push a matching version tag:

```sh
git tag v0.1.0-beta.1
git push origin v0.1.0-beta.1
```

The workflow builds Mac Apple silicon, Mac Intel, and Windows x64 packages and creates a **draft beta release** with checksums. Download and test all three on real computers. Publish the draft only after review. The README's Releases link will then include the published beta downloads.

The default workflow does not sign Windows packages or sign/notarize Mac packages. Configure and test those release tasks before broad public distribution.

## 4. GitHub page and tabs

Set the About description to "Crystal structure renders and looping movies, online and on your desktop." Set its website to the verified Pages URL. Suggested topics: `crystallography`, `chemistry`, `molecular-visualization`, `electron`, `cif`, `research-software`.

The README includes features, examples, saving, installation, beta status, and GPLv3 licensing. Issues and pull-request templates are included. Code, Issues, Pull requests, Actions, Releases, and Security are GitHub features. Enable Discussions, Wiki, and private vulnerability reporting in repository settings if desired.

## Current validation boundary

JavaScript, pure parser/geometry/project tests, static asset checks, browser preview, and a Linux desktop packaging check can be run in this development workspace. That is not equivalent to testing the installed app on Mac or Windows. The build and release workflow must still run in the created GitHub repository.

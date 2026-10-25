# Changelog

## Windows checkout correction — 25 October 2026

- Preserve audited vendor bytes across Windows/Mac/Linux checkout with `.gitattributes`.
- Keep the exact SHA-256 checks enabled and add a checkout regression test.

## 0.1.0-beta.2 — additional security hardening

- Updated bundled PDF.js from 4.10.38 to 6.4.299.
- Isolated coordinate parsing and PDF extraction in workers with enforceable termination deadlines and inherited content security policies.
- Disabled fetch/XHR/WebSocket connections in the page and workers; retained local module loading.
- Added main-process project validation, bounded native reads and export signature/extension checks.
- Disabled unused Electron fuses and explicitly denied worker/subframe Node integration.
- Added bundled-library audit locks and file hashes, pinned workflow actions, dependency update proposals and security CI.
- Added deterministic malformed-coordinate mutation checks and worker lifecycle regression tests.

## Unreleased — security hardening

- Restrictive browser content security policy and stricter desktop asset response headers.
- Desktop outbound request blocking, exact Help-link allowlist, and stricter IPC document checks.
- Early atom, bond and symmetry-operation limits to reduce denial-of-service exposure from crafted coordinate files.
- PDF extraction text budgets, timeout, font/XFA restrictions, and reliable cancellation cleanup.
- Regression tests for hostile URLs, renderer IPC boundaries, dense models and synthetic PDF extraction.

## Unreleased — measurement update

- Interactive 3D distance and angle measurements, with atom-name selection.
- Draggable plain-text labels and automatic placement clear of the structure.
- Configurable text and line colours, line styles, text size, and line thickness.
- Hide measurements during automatic rotation, always show them, or fade them in near a bookmarked view.
- Measurement annotations in PNG, GIF, and WebM exports and saved projects.
- Manual rotation follows pointer direction and pauses automatic rotation.

## 0.1.0-beta.1 — initial beta preparation

- Online static app prepared for GitHub Pages.
- Mac (Apple silicon and Intel) and Windows x64 desktop packaging workflows.
- Open, Save, and Save As for portable `.crystalstudio` projects.
- CIF/XYZ/MOL/SDF coordinates and reviewed text-PDF coordinate extraction.
- Finite molecular symmetry completion from CIF bond links.
- Molecule-group selection and one-per-connectivity display.
- PNG, infinitely looping GIF, and WebM output.
- Slower rotation options from 4 to 60 seconds per turn, defaulting to 30.
- Adjustable depth fading, thermal ellipsoids, and a dark interface with a white workspace.
- GPLv3 licence, examples, user guide, issue templates, and draft-release workflow.

This development line is beta and is expected to change frequently. Mac and Windows runtime testing and signed distribution remain release tasks.

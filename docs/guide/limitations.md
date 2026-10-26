# Known limitations — beta

Crystal Studio is under active development and is updated frequently. The first desktop distribution requires testing on real Mac and Windows computers; successful packaging alone is not a native runtime test.

- CIF molecule completion needs explicit symmetry operators and symmetry-coded bond links. It is not a full space-group database or crystal-packing viewer.
- Finite molecular models are supported. Extended networks can be shown as deposited sites with Complete finite molecules turned off; boundary connections are omitted. Full packing/supercells are not implemented.
- Bonds are taken from CIF geometry tables when present, with H connections inferred. All 118 element symbols have radius entries; coordinate-only bonding remains a heuristic. Reported geometry tables may be incomplete. Check coordination, disorder and unusually short contacts; see [elements and metals](elements-and-metals.md).
- Bond cylinders are displayed singly; crystallographic bond lengths are not converted into a bond-order depiction.
- Alternate disorder sites appear as deposited; occupancy refinement and disorder resolution are not implemented.
- Keep one of each compares elemental connectivity, not stereochemistry or chemical equivalence.
- PDF import supports readable coordinate tables; OCR, PDF tensor extraction, and PDF symmetry extraction are not implemented.
- MOL V2000 and the first SDF record are supported; V3000 is not supported.
- Models are limited to 2,000 atoms. Coordinate files are limited to 5 MB, PDFs to 30 MB/150 pages, and project files to 20 MB.
- GIFs are 640 × 480 with an adaptive frame count. WebM availability depends on browser/Chromium codecs. There is no MP4 export.
- No cloud project library, automatic project backups, or automatic desktop updater is provided.
- Initial desktop packages are unsigned; Mac notarization is not configured.

Always compare a rendered structure with the source crystallographic report before using it as a scientific figure. Report problems with a safe synthetic or public example wherever possible.

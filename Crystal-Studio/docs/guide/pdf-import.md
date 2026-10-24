# Importing a PDF report

A PDF must contain atomic coordinates as readable text. The importer does not recover a 3D structure from a picture, bond-length table alone, or refinement statistics.

1. Choose **Import PDF report** and select the report.
2. Choose a detected coordinate table. The review window shows its page and atom count.
3. Check **Coordinate type**: fractional crystallographic coordinates or Cartesian coordinates in angstroms.
4. Check the printed scaling. A table marked `x 10^4` contains coordinates that must be divided by 10,000. Unscaled decimal coordinates use divisor 1.
5. For fractional coordinates, verify all six unit-cell values from the same compound. Missing angles are not assumed to be 90 degrees.
6. Review the atom rows. Correct labels, signs, decimal points, or missing lines before selecting **Render selected coordinates**.

Multiple detected tables are listed independently. Tables split over pages may need their continuation rows pasted into the review box. Verify that the chosen atom list is complete and that it belongs to the same structure as the cell parameters.

PDF import currently reads coordinates only: it does not import anisotropic displacement tensors or symmetry operations. Use the CIF for thermal ellipsoids and molecular symmetry completion.

## Scanned pages

OCR means optical character recognition: conversion of text in a scanned image into readable characters. OCR is not built into this release. Apply OCR to an image-only PDF before importing, or paste verified coordinate rows into the review window. OCR can misread minus signs and decimal points, so inspect the values carefully.

## Limits

PDF files are limited to 30 MB and 150 pages. Password-protected files must be unlocked first. Unsupported or incomplete extraction does not replace the structure already open in the viewer.

# Structures and molecules

## Coordinates and symmetry

CIF fractional coordinates are converted with all six unit-cell parameters. Valid anisotropic Uij/Bij tensors are converted to the Cartesian basis for the ellipsoid display.

When a CIF supplies symmetry operators and symmetry-coded bond links, the importer follows those links until each finite molecular graph closes. This can complete a molecule for which only half is listed in the asymmetric unit. Generated atoms receive a prime mark in their display labels. It does not generate the entire crystal packing.

Without a suitable symmetry-coded bond table, the app displays the deposited coordinates and notes that limitation. Infinite periodic networks and oversized expansions are rejected rather than silently presented as complete finite molecules.

## Several molecules in one structure

The **Molecules** section appears when the loaded model has multiple disconnected bond-connectivity groups. Each row shows its formula, atom count, and label range.

- Untick a row to hide that group from the view and all exports.
- **Only** displays the chosen group.
- **Show all** restores every group.
- **Keep one of each** keeps one group for each matching elemental connectivity graph.

Matching connectivity is not a test of stereochemistry, conformation, disorder, or chemical equivalence. It can group stereoisomers together. Review each molecule, especially when solvent or counterions overlap, when bonds are inferred, or when alternate disorder sites are present.

Keep at least one group selected. Save a project to retain the full model and the selection; hidden groups can be restored after reopening it.

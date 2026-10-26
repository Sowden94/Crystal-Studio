# Elements, metals and connectivity

Crystal Studio recognises all 118 current element symbols in CIF/XYZ/MOL/SDF imports and saved projects, and in supported PDF coordinate tables. D and T are rendered as hydrogen while their atom labels remain intact. CIF type symbols such as Fe3+ and Ni2+ are read as element identities; the app does not assign an oxidation state, spin state or electronic structure from those labels.

## Radius data

Covalent radii in angstroms use Cordero et al. for elements 1–96. For elements 97–118, single-bond values compiled from Pyykkö are used. These later entries include predictions; support for an element symbol does not imply experimental validation of its compounds.

The numerical tables were transcribed from Paul Kienzle's public-domain Periodictable data, source blob `d4f02e58cb570537b86d069c33468f5572a8beaa`. Carbon uses the sp3 entry, and Mn, Fe and Co use the low-spin entries in that table. Oxidation state, coordination and spin can change useful bond cutoffs.

- Cordero et al., *Covalent radii revisited*, Dalton Transactions (2008), 2832–2838. [DOI: 10.1039/B801115J](https://doi.org/10.1039/B801115J).
- Pyykkö and Atsumi, *Molecular Single-Bond Covalent Radii for Elements 1–118*, Chemistry—A European Journal 15 (2009), 186–197. [DOI: 10.1002/chem.200800987](https://doi.org/10.1002/chem.200800987).
- [Public-domain Periodictable numerical compilation](https://github.com/python-periodictable/periodictable/blob/d4f02e58cb570537b86d069c33468f5572a8beaa/periodictable/covalent_radius.py).

The space-filling style remains an illustrative covalent-radius-based display, not an ionic-radius or van der Waals surface. Element colours are a display palette, not an oxidation-state assignment.

## Reported bonds take priority

When a CIF supplies matching `_geom_bond_atom_site_label_1/2` rows, the app uses those bonds—including long metal–ligand or metal–metal bonds—and supplements hydrogen connections by distance. This applies to Cartesian CIFs as well as fractional-coordinate CIFs. MOL/SDF explicit connectivity is retained.

Heavy-atom contacts omitted from a supplied CIF geometry table are not automatically added. A table can be incomplete; compare the picture with the report. A short contact is not sufficient evidence of a chemical bond, and a long coordination bond is not grounds for dropping an explicitly reported connection.

If connectivity is absent, distance inference uses a cutoff of 1.2 times the sum of the two tabulated covalent radii and excludes separations below 0.35 Å. This is a display heuristic. It does not calculate bond orders, oxidation states, coordination numbers, hapticity or ionic association. Check long/weak coordination, disorder, counterions, close packing and delocalised organometallic bonding. Inferred connections in coordinate-only PDF/XYZ imports need particular care.

## Molecular symmetry and extended structures

**Complete finite molecules** uses supplied CIF symmetry operators and bond codes to generate finite molecular partners, with anisotropic tensors transformed with the coordinates. Cartesian coordinates with a complete unit cell can also use that basis for symmetry completion.

For an extended coordination polymer or other network, turn **Complete finite molecules** off to show **deposited sites only**. Reported connections to other symmetry copies are omitted and the warning identifies this boundary limitation. This view is not full unit-cell packing, a supercell or an infinite-network renderer. Molecule checkboxes then refer to connected groups in the displayed subset, not necessarily entire chemical species.

The viewer retains its atom, bond, symmetry-state, worker-time and file-size limits. An extended network will not be expanded without bounds merely because the structure contains metals.

## Verification examples

Regression fixtures use constructed coordinates only: 118-element import/project round trips, fixed transition-metal coordination shells, alkali/alkaline-earth/main-group/lanthanide/actinide contacts, metal clusters, explicit long metal bonds, finite symmetry and deposited-site network views. They are software checks, not experimental structures or proof of universal bond-perception accuracy.

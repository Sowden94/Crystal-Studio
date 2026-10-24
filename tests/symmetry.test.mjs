import test from 'node:test';
import assert from 'node:assert/strict';
import {fromCif,cifBlocks,eigen} from '../web/structure.mjs';
import {components} from '../web/molecules.mjs';
import {apply,compose,inverse,parseOperation} from '../web/symmetry.mjs';
const fixture=(bond,operation='-x,y,-z',positions='C1 C 0.075 0.1 0\nH1 H 0.18 0.1 0')=>`data_test
_cell_length_a 10
_cell_length_b 11
_cell_length_c 12
_cell_angle_alpha 90
_cell_angle_beta 90
_cell_angle_gamma 90
loop_
_space_group_symop_id
_space_group_symop_operation_xyz
1 'x,y,z'
8 '${operation}'
loop_
_atom_site_label
_atom_site_type_symbol
_atom_site_fract_x
_atom_site_fract_y
_atom_site_fract_z
${positions}
loop_
_geom_bond_atom_site_label_1
_geom_bond_atom_site_label_2
_geom_bond_site_symmetry_2
${bond}
loop_
_atom_site_aniso_label
_atom_site_aniso_U_11
_atom_site_aniso_U_22
_atom_site_aniso_U_33
_atom_site_aniso_U_12
_atom_site_aniso_U_13
_atom_site_aniso_U_23
C1 .02 .03 .04 .005 .006 .007
`;
test('completes a molecule across a symmetry bond using the declared operator ID',()=>{const d=fromCif(cifBlocks(fixture('C1 C1 8_555'))[0]);assert.equal(d.atoms.length,4);assert.equal(components(d.atoms,d.bonds).length,1);assert.equal(d.bonds.length,3);assert.equal(d.symmetryAdded,2);const [a,b]=d.atoms.filter(x=>x.U);const x=eigen(a.U).values.sort(),y=eigen(b.U).values.sort();x.forEach((v,i)=>assert.ok(Math.abs(v-y[i])<1e-10))});
test('handles special-position stabilizers without duplicate atoms',()=>{const text=fixture('C1 H1 .','-x,-y,-z','C1 C 0 0 0\nH1 H .1 0 0');const b=cifBlocks(text)[0];b.loops.find(l=>l[0]?._geom_bond_atom_site_label_1).push({_geom_bond_atom_site_label_1:'C1',_geom_bond_atom_site_label_2:'H1',_geom_bond_site_symmetry_2:'8_555'});const d=fromCif(b);assert.equal(d.atoms.length,3);assert.equal(d.bonds.length,2)});
test('rejects unbounded periodic connectivity rather than silently truncating a molecule',()=>{assert.throws(()=>fromCif(cifBlocks(fixture('C1 C1 1_655'))[0]),/extended network|limit/)});
test('rejects a symmetry code with a missing operation',()=>{assert.throws(()=>fromCif(cifBlocks(fixture('C1 C1 3_555'))[0]),/Missing symmetry operation/)});
test('parses fractional translation without executable expressions',()=>{const op=parseOperation('1/2-x, y, -z+1/3'),p=[.1,.2,.3],result=apply(compose(op,inverse(op)),p);result.forEach((v,i)=>assert.ok(Math.abs(v-p[i])<1e-12));assert.throws(()=>parseOperation('window.x,y,z'));assert.throws(()=>parseOperation('x/0,y,z'))});

import test from 'node:test';
import assert from 'node:assert/strict';
import {symbols,covalentRadii,elementSymbol,elementColours,isMetal} from '../web/elements.mjs';
import {parse,inferBonds,cifBlocks,fromCif} from '../web/structure.mjs';
import {validatedModel} from '../web/import-model.mjs';
import {encodeProject,decodeProject} from '../web/project.mjs';
import {buildReportModel} from '../web/report.mjs';
test('all 118 elements survive coordinate import, validation and project saving',()=>{
  assert.equal(symbols.length,118);assert.equal(new Set(symbols).size,118);
  const xyz='118\nSynthetic periodic table\n'+symbols.map((s,i)=>s+' '+i*10+' 0 0').join('\n');
  const model=validatedModel(parse(xyz,'xyz'));
  assert.deepEqual(model.atoms.map(a=>a.element),symbols);
  const table=symbols.map((s,i)=>s+'1 '+s+' '+i*10+' 0 0').join('\n');
  assert.deepEqual(fromCif(cifBlocks(cif(table,''))[0]).atoms.map(a=>a.element),symbols);
  assert.deepEqual(decodeProject(encodeProject({model})).model.atoms.map(a=>a.element),symbols);
  for(const s of symbols){assert.ok(Number.isFinite(covalentRadii[s])&&covalentRadii[s]>0,s);assert.ok(elementColours[s],s);}
  assert.equal(covalentRadii.Ni,1.24);assert.equal(covalentRadii.Co,1.26);assert.equal(covalentRadii.Ce,2.04);assert.equal(covalentRadii.U,1.96);assert.equal(covalentRadii.Rf,1.57);
  assert.throws(()=>elementSymbol('Xx'));assert.equal(elementSymbol('FE3+'),'Fe');assert.equal(elementSymbol('U+6'),'U');assert.equal(elementSymbol('D'),'H');assert.equal(isMetal('Co'),true);assert.equal(isMetal('Cl'),false);
});
const atom=(element,p,label=element)=>({element,p,label});
test('previously missing transition metals retain six metal–N connections',()=>{
  for(const metal of ['Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','Hf','Ta','W','Re','Os','Ir','Pt','Au','Hg']){
    const atoms=[atom(metal,[0,0,0]),...[0,1,2].flatMap(k=>[-1,1].map(s=>atom('N',[0,1,2].map(j=>j===k?s*2.1:0))))];
    assert.equal(inferBonds(atoms).filter(b=>b.includes(0)).length,6,metal);
  }
});
test('synthetic main-group, lanthanide, actinide and metal-cluster contacts are retained',()=>{
  for(const [metal,distance,ligand] of [['Li',1.9,'O'],['Na',2.4,'O'],['K',2.8,'O'],['Ca',2.4,'O'],['Al',1.9,'O'],['Sn',2.3,'Cl'],['Pb',2.7,'Cl'],['Ce',2.5,'O'],['Gd',2.4,'O'],['Lu',2.3,'O'],['U',1.8,'O'],['Th',2.5,'O'],['Pt',2.3,'Cl'],['Au',2.3,'P'],['Ru',2.65,'Ru']]){
    assert.equal(inferBonds([atom(metal,[0,0,0]),atom(ligand,[distance,0,0])]).length,1,metal+'–'+ligand);
  }
  assert.equal(inferBonds([atom('H',[0,0,0]),atom('H',[.74,0,0])]).length,1);
  assert.equal(inferBonds([atom('Ni',[0,0,0]),atom('N',[8,0,0])]).length,0);
});
const cif=(positions,bonds,extra='',fractional=false)=>`data_synthetic
${extra}
loop_
_atom_site_label
_atom_site_type_symbol
_atom_site_${fractional?'fract':'Cartn'}_x
_atom_site_${fractional?'fract':'Cartn'}_y
_atom_site_${fractional?'fract':'Cartn'}_z
${positions}
loop_
_geom_bond_atom_site_label_1
_geom_bond_atom_site_label_2
_geom_bond_site_symmetry_2
${bonds}
`;
test('Cartesian CIF honours long reported metal bonds and excludes unreported short contacts',()=>{
  const model=fromCif(cifBlocks(cif('Ni1 Ni2+ 0 0 0\nN1 N 3.4 0 0\nN2 N 0 1.8 0','Ni1 N1 .'))[0]);
  assert.deepEqual(model.atoms.map(a=>a.element),['Ni','N','N']);assert.deepEqual(model.bonds,[[0,1]]);
  assert.equal(model.atoms[1].p[0],3.4);
});
const cell='_cell_length_a 10\n_cell_length_b 10\n_cell_length_c 10\n_cell_angle_alpha 90\n_cell_angle_beta 90\n_cell_angle_gamma 90';
const ops="loop_\n_space_group_symop_id\n_space_group_symop_operation_xyz\n1 'x,y,z'\n8 '-x,y,-z'";
test('finite metal symmetry expands while preserving ADPs and coordinate basis',()=>{
  for(const fractional of [true,false]){
    const positions=fractional?'Ni1 Ni 0 .1 0\nN1 N .2 .1 0':'Ni1 Ni 0 1 0\nN1 N 2 1 0';
    const adps='loop_\n_atom_site_aniso_label\n_atom_site_aniso_U_11\n_atom_site_aniso_U_22\n_atom_site_aniso_U_33\n_atom_site_aniso_U_12\n_atom_site_aniso_U_13\n_atom_site_aniso_U_23\nNi1 .02 .03 .04 0 0 0';
    const model=fromCif(cifBlocks(cif(positions,'Ni1 N1 .\nNi1 N1 8_555',cell+'\n'+ops+'\n'+adps,fractional))[0]);
    assert.equal(model.atoms.length,3);assert.equal(model.bonds.length,2);
    const x=model.atoms.map(a=>a.p[0]).sort((a,b)=>a-b);[-2,0,2].forEach((v,i)=>assert.ok(Math.abs(x[i]-v)<1e-10));
    const nickel=model.atoms.find(a=>a.element==='Ni');assert.ok(nickel.U);assert.ok(Math.abs(nickel.U[0][0]-.02)<1e-10);
  }
});
test('extended metal network can show deposited sites without unbounded expansion',()=>{
  const block=cifBlocks(cif('Ni1 Ni 0 0 0\nN1 N .2 0 0','Ni1 N1 .\nNi1 Ni1 1_655',cell+'\n'+ops,true))[0];
  assert.throws(()=>fromCif(block),/extended network|limit/);
  const model=fromCif(block,{expandSymmetry:false});assert.equal(model.atoms.length,2);assert.deepEqual(model.bonds,[[0,1]]);assert.match(model.warning,/boundary bond\(s\) omitted/);
});
test('PDF-derived metal labels and isotope labels preserve element identity',()=>{
  const model=buildReportModel({text:'Co1 0 0 0\nNi1 5 0 0\nLa1 10 0 0\nU1 15 0 0\nD1 20 0 0',kind:'cartesian',scale:1,cell:[],name:'Synthetic metals'});
  assert.deepEqual(validatedModel(model).atoms.map(a=>a.element),['Co','Ni','La','U','H']);
});

test('constructed nickel ammine has six metal bonds and eighteen N–H bonds',async()=>{const {metalSample}=await import('../web/metal-sample.mjs');const model=validatedModel(metalSample());assert.equal(model.atoms.length,25);assert.equal(model.bonds.length,24);assert.equal(model.bonds.filter(b=>b.includes(0)).length,6);});

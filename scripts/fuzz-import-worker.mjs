import {parentPort} from 'node:worker_threads';
import {parseStructure} from '../web/import-worker.mjs';
import {validatedModel} from '../web/import-model.mjs';
let seed=0x43525953;
const random=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n;};
const cif=`data_synthetic
_cell_length_a 10
_cell_length_b 10
_cell_length_c 10
_cell_angle_alpha 90
_cell_angle_beta 90
_cell_angle_gamma 90
loop_
_atom_site_label
_atom_site_type_symbol
_atom_site_fract_x
_atom_site_fract_y
_atom_site_fract_z
C1 C 0 0 0
C2 C .156 0 0
`;
const seeds=[['xyz','2\nSynthetic only\nC 0 0 0\nC 1.56 0 0'],['cif',cif],['mol','Synthetic\nCrystal Studio\n\n  2  1  0  0  0  0            999 V2000\n    0.0000    0.0000    0.0000 C   0  0\n    1.5600    0.0000    0.0000 C   0  0\n  1  2  1\nM  END']];
const tokens=['\0','<script>alert(1)</script>','__proto__','1e309','-1','2000000000','NaN','Infinity',"'",'"',';','\n','loop_','data_','x/0','%PDF-'];
let accepted=0,rejected=0;
for(let i=0;i<3000;i++){
  const [ext,source]=seeds[random(seeds.length)];let text=source;
  for(let j=0,n=1+random(6);j<n;j++){const index=random(text.length+1),token=tokens[random(tokens.length)];text=text.slice(0,index)+token+text.slice(index+random(Math.min(12,text.length-index)+1));}
  try{const result=parseStructure({text,ext});validatedModel(result.model);accepted++;}catch(error){if(!(error instanceof Error))throw Error('Parser threw a non-error');rejected++;}
}
parentPort.postMessage({seed:'0x43525953',mutations:3000,accepted,rejected,scope:'synthetic CIF, XYZ and MOL; bounded mutation smoke test, not exhaustive fuzzing'});

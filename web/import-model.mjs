import {validateProject} from './project.mjs';
import {atomLimit,bondLimit} from './import-limits.mjs';
import {inferBonds} from './structure.mjs';
export function validatedModel(model) {
  if(!model||!Array.isArray(model.atoms))throw Error('Invalid imported model.');
  atomLimit(model.atoms.length);
  // Validate coordinates before inference. Imported fields never become HTML.
  const clean=validateProject({format:'crystal-studio-project',version:1,model:{...model,bonds:model.bonds??[]}}).model;
  if(model.bonds===undefined)clean.bonds=inferBonds(clean.atoms);
  bondLimit(clean.bonds.length);
  if(Array.isArray(model.cell)&&model.cell.length===6&&model.cell.every(Number.isFinite))clean.cell=model.cell.slice();
  return clean;
}

import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const inventory=JSON.parse(await fs.readFile(path.join(root,'security/vendor-manifest.json'),'utf8'));
const lock=JSON.parse(await fs.readFile(path.join(root,'security/vendor/package-lock.json'),'utf8'));
for(const item of inventory){
  if(lock.packages['node_modules/'+item.package]?.version!==item.version)throw Error('Bundled version does not match audit lock: '+item.package);
  const hash=createHash('sha256').update(await fs.readFile(path.join(root,item.file))).digest('hex');
  if(hash!==item.sha256)throw Error('Bundled file hash mismatch: '+item.file);
}
console.log('Bundled library versions and SHA-256 hashes match the security inventory.');

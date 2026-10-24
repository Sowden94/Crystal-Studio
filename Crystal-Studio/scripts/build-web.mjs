import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'site');
await fs.rm(out,{recursive:true,force:true});await fs.cp(path.join(root,'web'),out,{recursive:true});await fs.cp(path.join(root,'examples'),path.join(out,'examples'),{recursive:true});await fs.writeFile(path.join(out,'.nojekyll'),'');
console.log('Built GitHub Pages files in site/.');

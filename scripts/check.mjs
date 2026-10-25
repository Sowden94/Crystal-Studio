import fs from 'node:fs/promises';import path from 'node:path';import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');async function walk(dir){return(await Promise.all((await fs.readdir(dir,{withFileTypes:true})).map(async e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]))).flat()}
for(const file of [...await walk(path.join(root,'web')),...await walk(path.join(root,'desktop'))])if(/\.(mjs|js|cjs)$/.test(file)){const r=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}
const html=await fs.readFile(path.join(root,'web/index.html'),'utf8');for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){if(/^(https?:|\.\/|#)/.test(match[1]))continue;await fs.access(path.join(root,'web',match[1]))}
const file=await fs.readFile(path.join(root,'package.json'),'utf8');JSON.parse(file);console.log('JavaScript syntax, HTML asset references, and package metadata passed.');

await import('./check-security.mjs');

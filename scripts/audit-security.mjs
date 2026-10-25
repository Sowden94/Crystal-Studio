import {spawnSync} from 'node:child_process';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const npm=process.platform==='win32'?'npm.cmd':'npm';
let failed=false;
for(const [name,cwd] of [['desktop/build dependencies',root],['bundled browser dependencies',path.join(root,'security/vendor')]]){
  const result=spawnSync(npm,['audit','--json'],{cwd,encoding:'utf8',shell:process.platform==='win32',timeout:60000});
  if(result.error){console.error(name+': audit unavailable: '+result.error.message);failed=true;continue;}
  try{const report=JSON.parse(result.stdout);if(report.error||!report.metadata)throw Error(report.error?.summary||'Invalid audit response');console.log(name+': '+JSON.stringify(report.metadata.vulnerabilities));if(result.status!==0||report.metadata.vulnerabilities.total>0){failed=true;for(const [pkg,issue] of Object.entries(report.vulnerabilities||{}))console.error(pkg+': '+issue.severity+' — '+issue.range);}}
  catch(e){failed=true;console.error(name+': '+e.message);}
}
if(failed)process.exitCode=1;

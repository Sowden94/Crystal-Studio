import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
test('Windows-style checkout preserves audited vendor bytes and detects real changes',async()=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'crystal-checkout-'));
  const git=(...args)=>execFileSync('git',args,{cwd:root,stdio:['ignore','pipe','pipe']});
  try{
    git('init','--quiet');
    await fs.mkdir(path.join(root,'web/vendor'),{recursive:true});
    const original=Buffer.from('const version = "synthetic";\nexport {version};\n');
    await fs.writeFile(path.join(root,'web/vendor/fixture.js'),original);
    git('-c','core.autocrlf=false','add','web/vendor/fixture.js');
    const before=path.join(root,'before');await fs.mkdir(before);
    git('-c','core.autocrlf=true','-c','core.eol=crlf','checkout-index','--all','--prefix='+before.replaceAll('\\','/')+'/');
    const converted=await fs.readFile(path.join(before,'web/vendor/fixture.js'));
    assert.ok(converted.includes(Buffer.from('\r\n')));assert.notDeepEqual(converted,original);
    await fs.copyFile(new URL('../.gitattributes',import.meta.url),path.join(root,'.gitattributes'));
    git('-c','core.autocrlf=false','add','.gitattributes');
    const after=path.join(root,'after');await fs.mkdir(after);
    git('-c','core.autocrlf=true','-c','core.eol=crlf','checkout-index','--all','--prefix='+after.replaceAll('\\','/')+'/');
    assert.deepEqual(await fs.readFile(path.join(after,'web/vendor/fixture.js')),original);
    const {createHash}=await import('node:crypto');const hash=value=>createHash('sha256').update(value).digest('hex');
    assert.notEqual(hash(Buffer.concat([original,Buffer.from('// changed\n')])),hash(original));
  }finally{await fs.rm(root,{recursive:true,force:true});}
});

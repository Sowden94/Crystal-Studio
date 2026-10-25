const path = require('node:path');
const {isAppOrigin} = require('./security.cjs');
const { randomUUID } = require('node:crypto');
const fs = require('node:fs/promises');
function assetPath(root, requestUrl) {
  const url = new URL(requestUrl);
  if (!isAppOrigin(requestUrl)) throw new Error('Unknown app origin.');
  const decoded = decodeURIComponent(url.pathname);
  if (decoded.includes('\\') || decoded.includes('\0')) throw new Error('Invalid asset path.');
  const relative = decoded.replace(/^\/+/, '') || 'index.html';
  const result = path.resolve(root, relative);
  if (result !== root && !result.startsWith(root + path.sep)) throw new Error('Invalid asset path.');
  return result;
}
async function atomicWrite(destination, bytes) {
  const temp = path.join(path.dirname(destination), `.${path.basename(destination)}.${randomUUID()}.tmp`);
  try { await fs.writeFile(temp, bytes, {flag:'wx'}); await fs.rename(temp, destination); }
  catch (error) { await fs.unlink(temp).catch(()=>{}); throw error; }
}
function safeFilename(name) { return String(name || 'Crystal-Studio').replace(/[<>:"/\\|?*\u0000-\u001f]/g,'_').slice(0,160); }
async function readLimitedProject(file, limit=20*1024*1024) {
  const handle=await fs.open(file,'r');
  try {
    const stat=await handle.stat();if(!stat.isFile()||stat.size>limit)throw Error('Choose a regular project file smaller than 20 MB.');
    const chunks=[];let length=0;
    while(true){const chunk=Buffer.alloc(Math.min(65536,limit+1-length));const {bytesRead}=await handle.read(chunk);if(!bytesRead)break;length+=bytesRead;if(length>limit)throw Error('Project exceeds 20 MB.');chunks.push(chunk.subarray(0,bytesRead));}
    return Buffer.concat(chunks,length).toString('utf8');
  }finally{await handle.close();}
}
function validExport(bytes,ext) {
  if(!(bytes instanceof Uint8Array)||bytes.byteLength>250*1024*1024)return false;
  const starts=signature=>signature.every((b,i)=>bytes[i]===b);
  if(ext==='png')return starts([137,80,78,71,13,10,26,10]);
  if(ext==='gif')return starts([71,73,70,56,55,97])||starts([71,73,70,56,57,97]);
  return ext==='webm'&&starts([26,69,223,163]);
}
module.exports = {assetPath, atomicWrite, safeFilename,readLimitedProject,validExport};

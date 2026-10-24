const path = require('node:path');
const { randomUUID } = require('node:crypto');
const fs = require('node:fs/promises');
function assetPath(root, requestUrl) {
  const url = new URL(requestUrl);
  if (url.protocol !== 'crystal:' || url.hostname !== 'studio') throw new Error('Unknown app origin.');
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
module.exports = {assetPath, atomicWrite, safeFilename};

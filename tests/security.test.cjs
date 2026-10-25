const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {isAppOrigin,isAppDocument,externalUrl,allowedRequest,APP_CSP} = require('../desktop/security.cjs');
const {assetPath} = require('../desktop/files.cjs');
test('desktop rejects lookalike origins, credentials, ports and non-app IPC documents',()=>{
  for(const url of ['https://studio/index.html','crystal://studio.evil/index.html','crystal://user@studio/index.html','crystal://studio:123/index.html','garbage']) {
    assert.equal(isAppOrigin(url),false,url);
    assert.throws(()=>assetPath(path.resolve('/app/web'),url));
  }
  assert.equal(isAppDocument('crystal://studio/index.html'),true);
  assert.equal(isAppDocument('crystal://studio/index.html#help'),true);
  for(const url of ['crystal://studio/vendor/pdf.mjs','crystal://studio/index.html?redirect=x','crystal://studio/other.html']) assert.equal(isAppDocument(url),false);
});
test('desktop blocks outbound requests and arbitrary external links',()=>{
  assert.equal(allowedRequest('crystal://studio/app.js'),true);
  assert.equal(allowedRequest('blob:crystal://studio/test'),true);
  for(const url of ['https://github.com/','https://evil.example/upload','http://127.0.0.1/','file:///etc/passwd','blob:https://evil.example/test','wss://evil.example/']) assert.equal(allowedRequest(url),false,url);
  assert.equal(allowedRequest('crystal://studio/index.html','POST'),false);
  const approved='https://github.com/Sowden94/Crystal-Studio/releases';
  assert.equal(externalUrl(approved),approved);
  for(const url of [approved+'?data=secret',approved+'#secret',approved+'.evil', 'https://github.com/other/repo','file:///etc/passwd','javascript:alert(1)']) assert.equal(externalUrl(url),null,url);
});
test('online and desktop policy block inline scripts, eval, forms and embedded pages',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../web/index.html'),'utf8');
  const policy=html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
  for(const csp of [policy,APP_CSP]) {
    assert.match(csp,/script-src 'self';/);
    assert.doesNotMatch(csp,/unsafe-eval|script-src[^;]*unsafe-inline|https:/);
    assert.match(csp,/form-action 'none'/);
    assert.match(csp,/frame-src 'none'/);
    assert.match(csp,/object-src 'none'/);
  }
  assert.ok(html.indexOf('Content-Security-Policy') < html.indexOf('<script'));
});

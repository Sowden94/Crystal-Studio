const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {EventEmitter}=require('node:events');
test('desktop startup enforces IPC, navigation, request and asset response boundaries',async()=>{
  const handlers=new Map(),protocolHandlers=new Map();let win,requestHandler,downloadHandler;
  const app=new EventEmitter();app.requestSingleInstanceLock=()=>true;app.whenReady=()=>Promise.resolve();app.setAboutPanelOptions=()=>{};app.getVersion=()=>'test-beta';
  class BrowserWindow extends EventEmitter {
    constructor(options){super();win=this;this.options=options;this.webContents=new EventEmitter();this.webContents.mainFrame={url:'crystal://studio/index.html'};this.webContents.setWindowOpenHandler=fn=>this.popup=fn;this.webContents.once=()=>{};}
    loadURL(url){this.url=url;return Promise.resolve();}
  }
  const session={setPermissionRequestHandler:fn=>session.permission=fn,setPermissionCheckHandler:fn=>session.check=fn,webRequest:{onBeforeRequest:fn=>requestHandler=fn},on:(name,fn)=>{if(name==='will-download')downloadHandler=fn;}};
  const electron={app,BrowserWindow,Menu:{setApplicationMenu(){},buildFromTemplate:x=>x},dialog:{showOpenDialog:async()=>({canceled:true})},ipcMain:{handle:(name,fn)=>handlers.set(name,fn),on(){}},protocol:{registerSchemesAsPrivileged(){},handle:(name,fn)=>protocolHandlers.set(name,fn)},shell:{openExternal:()=>Promise.resolve()},session:{defaultSession:session}};
  const desktop=path.join(__dirname,'../desktop');
  vm.runInNewContext(fs.readFileSync(path.join(desktop,'main.cjs'),'utf8'),{require:name=>name==='electron'?electron:require(name.startsWith('.')?path.join(desktop,name):name),__dirname:desktop,process,URL,Buffer,Headers,Response,Uint8Array,console});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(win.options.webPreferences.sandbox,true);assert.equal(win.options.webPreferences.contextIsolation,true);assert.equal(win.options.webPreferences.nodeIntegration,false);
  const trusted={sender:win.webContents,senderFrame:win.webContents.mainFrame};
  assert.equal(await handlers.get('project:open')(trusted),null);
  for(const name of ['project:open','project:save','export:save']) {
    await assert.rejects(()=>handlers.get(name)({sender:{},senderFrame:{url:'https://evil.example'}},{}),/Untrusted/);
    await assert.rejects(()=>handlers.get(name)({sender:win.webContents,senderFrame:{url:'crystal://studio/index.html'}},{}),/Untrusted/);
  }
  let canceled;requestHandler({url:'https://evil.example/upload',method:'POST'},result=>canceled=result.cancel);assert.equal(canceled,true);
  requestHandler({url:'crystal://studio/app.js',method:'GET'},result=>canceled=result.cancel);assert.equal(canceled,false);
  let prevented=false;win.webContents.emit('will-navigate',{preventDefault:()=>prevented=true},'crystal://studio/vendor/pdf.mjs');assert.equal(prevented,true);
  assert.equal(win.popup({url:'https://evil.example'}).action,'deny');
  downloadHandler({preventDefault:()=>prevented=true});assert.equal(prevented,true);
  const response=await protocolHandlers.get('crystal')({url:'crystal://studio/index.html',method:'GET'});
  assert.equal(response.status,200);assert.match(response.headers.get('Content-Security-Policy'),/frame-ancestors 'none'/);assert.equal(response.headers.get('X-Content-Type-Options'),'nosniff');assert.match(await response.text(),/Crystal Studio/);
  assert.equal((await protocolHandlers.get('crystal')({url:'crystal://studio/..%2fpackage.json',method:'GET'})).status,404);
  assert.equal((await protocolHandlers.get('crystal')({url:'crystal://studio/index.html',method:'POST'})).status,405);
});

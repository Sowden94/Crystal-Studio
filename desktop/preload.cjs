const {contextBridge, ipcRenderer} = require('electron');
contextBridge.exposeInMainWorld('crystalDesktop', {
  platform: process.platform,
  openProject: () => ipcRenderer.invoke('project:open'),
  saveProject: (text, saveAs=false) => ipcRenderer.invoke('project:save', {text,saveAs:!!saveAs}),
  saveExport: (bytes, filename) => ipcRenderer.invoke('export:save', {bytes,filename}),
  setDirty: dirty => ipcRenderer.send('project:dirty', !!dirty),
  onCommand: callback => { const handler=(_event,command,payload)=>callback(command,payload); ipcRenderer.on('app:command',handler); return ()=>ipcRenderer.removeListener('app:command',handler); }
});

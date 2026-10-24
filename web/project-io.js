import {encodeProject,decodeProject} from './project.mjs';
export function setupProjectIO({snapshot,restore,status}){
 const $=id=>document.getElementById(id);const desktop=window.crystalDesktop;let dirty=false,handle=null;
 function setDirty(value){dirty=value;desktop?.setDirty(value)}
 const markDirty=()=>setDirty(true);
 function accept(text,name){const project=decodeProject(text);restore(project);setDirty(false);status('Opened project: '+name)}
 function canReplace(){return !dirty||window.confirm('Open another project? Save your current project first if you want to keep its changes.')}
 async function save(saveAs=false){try{const text=encodeProject(snapshot()),name=(snapshot().model.name||'Untitled').replace(/[^a-z0-9_-]/gi,'_')+'.crystalstudio';if(desktop){const result=await desktop.saveProject(text,saveAs);if(!result)return;setDirty(false);status('Project saved: '+result.name);return}
 if('showSaveFilePicker'in window){if(!handle||saveAs)handle=await window.showSaveFilePicker({suggestedName:name,types:[{description:'Crystal Studio project',accept:{'application/json':['.crystalstudio']}}]});const writable=await handle.createWritable();await writable.write(text);await writable.close();status('Project saved: '+handle.name)}else{const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);status('Project downloaded. Keep this .crystalstudio file to reopen your work.')}setDirty(false)}catch(e){if(e.name!=='AbortError')status('Could not save project: '+e.message)}}
 async function open(){if(!canReplace())return;try{if(desktop){const result=await desktop.openProject();if(result)accept(result.text,result.name)}else $('projectfile').click()}catch(e){status('Could not open project: '+e.message)}}
 $('saveproject').onclick=()=>save();$('openproject').onclick=open;$('projectfile').onchange=async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>20*1024*1024)throw Error('Choose a project smaller than 20 MB.');accept(await file.text(),file.name);handle=null}catch(e){status('Could not open project: '+e.message)}event.target.value=''};
 document.addEventListener('input',event=>{if(!event.target.closest('#pdfreview'))markDirty()});document.addEventListener('change',event=>{if(!event.target.closest('#pdfreview'))markDirty()});document.addEventListener('pointerup',event=>{if(event.target.id==='canvas')markDirty()});document.addEventListener('wheel',event=>{if(event.target.id==='canvas')markDirty()},{passive:true});
 window.addEventListener('beforeunload',event=>{if(dirty&&!desktop){event.preventDefault();event.returnValue=''}});
 document.addEventListener('keydown',event=>{if(desktop)return;if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();void save(event.shiftKey)}if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='o'){event.preventDefault();void open()}});
 desktop?.onCommand((command,payload)=>{if(command==='project:open')void open();else if(command==='project:save')void save();else if(command==='project:save-as')void save(true);else if(command==='project:load'){try{accept(payload.text,payload.name)}catch(e){status(e.message)}}else if(command.startsWith('export:'))$(command.split(':')[1])?.click()});
 if(desktop)document.querySelector('.upload-privacy').textContent='Files stay on your computer';
 return {markDirty,setClean:()=>setDirty(false)};
}

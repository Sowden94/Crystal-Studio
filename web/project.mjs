export const PROJECT_FORMAT='crystal-studio-project';
const finiteVector=(v,n)=>Array.isArray(v)&&v.length===n&&v.every(x=>typeof x==='number'&&Number.isFinite(x));
export function validateProject(value){
 if(!value||value.format!==PROJECT_FORMAT||value.version!==1)throw Error('This is not a supported Crystal Studio project.');
 const m=value.model;if(!m||!Array.isArray(m.atoms)||m.atoms.length<1||m.atoms.length>2000)throw Error('Project must contain 1–2,000 atoms.');
 const atoms=m.atoms.map((a,i)=>{if(!a||!/^[A-Z][a-z]?$/.test(a.element)||!finiteVector(a.p,3)||a.p.some(v=>Math.abs(v)>1e6))throw Error('Invalid atom '+(i+1));if(a.U!==null&&a.U!==undefined&&(!Array.isArray(a.U)||a.U.length!==3||!a.U.every(r=>finiteVector(r,3))))throw Error('Invalid displacement tensor.');return {element:a.element,label:String(a.label||a.element+(i+1)).slice(0,256),p:a.p.slice(),U:a.U?a.U.map(r=>r.slice()):null,occupancy:typeof a.occupancy==='number'&&Number.isFinite(a.occupancy)?a.occupancy:1}});
 if(!Array.isArray(m.bonds)||m.bonds.length>20000)throw Error('Project has invalid connectivity.');const bonds=m.bonds.map(b=>{if(!Array.isArray(b)||b.length!==2||!b.every(i=>Number.isInteger(i)&&i>=0&&i<atoms.length)||b[0]===b[1])throw Error('Project has an invalid bond.');return b.slice()});
 const source=String(m.source||'PROJECT').slice(0,32),model={name:String(m.name||'Untitled').slice(0,256),source,warning:String(m.warning||'Saved project · verify connectivity against the original structure').slice(0,1000),atoms,bonds};
 for(const k of ['symmetryAdded','asymmetricAtoms'])if(Number.isInteger(m[k])&&m[k]>=0)model[k]=m[k];
 const v=value.view||{},choice=(key,allowed,fallback)=>allowed.includes(v[key])?v[key]:fallback;
 const rotation=finiteVector(v.rotation,4)&&Math.hypot(...v.rotation)>1e-8?v.rotation:[0,0,0,1];
 const view={style:choice('style',['reference','element','sticks','space'],'reference'),shape:choice('shape',['sphere','ellipsoid'],'sphere'),axis:choice('axis',['x','y','z'],'y'),duration:choice('duration',[4,6,10,15,20,30,45,60],30),prob:choice('prob',[10,20,30,40,50,60,70,80,90],50),thickness:Number.isFinite(v.thickness)?Math.max(4,Math.min(18,v.thickness)):10,fogstrength:Number.isFinite(v.fogstrength)?Math.max(0,Math.min(95,v.fogstrength)):45,hydrogen:v.hydrogen!==false,labels:!!v.labels,rings:v.rings!==false,fog:v.fog!==false,transparent:!!v.transparent,background:typeof v.background==='string'&&/^#[a-f0-9]{6}$/i.test(v.background)?v.background:'#ffffff',rotation:rotation.slice(),angle:typeof v.angle==='number'&&Number.isFinite(v.angle)?v.angle%(2*Math.PI):0,zoom:typeof v.zoom==='number'&&Number.isFinite(v.zoom)?Math.max(.3,Math.min(4,v.zoom)):1,playing:v.playing!==false,resolution:choice('resolution',[1200,2400,3600],2400)};
 const selected=Array.isArray(value.selected)&&value.selected.length?value.selected:null;
 if(selected&&(!selected.every(i=>Number.isInteger(i)&&i>=0&&i<2000)||new Set(selected).size!==selected.length))throw Error('Invalid molecule selection.');
 return {format:PROJECT_FORMAT,version:1,model,view,selected};
}
export function encodeProject(snapshot){return JSON.stringify(validateProject({format:PROJECT_FORMAT,version:1,...snapshot}),null,2)}
export function decodeProject(text){if(typeof text!=='string'||text.length>20*1024*1024)throw Error('Choose a project smaller than 20 MB.');return validateProject(JSON.parse(text))}

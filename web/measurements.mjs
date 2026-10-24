import {layoutMeasurementLabels,boxEdge} from './measurement-layout.mjs';
import {measurementValue,validateMeasurements,measurementOpacity} from './measurement-geometry.mjs';

export function setupMeasurements({canvas,viewport,sidebar,getAtoms,getModel,getProjected,pickAtom,pause,redraw,dirty,status,isBusy,isRotating,getOrientation}){
  const section=document.createElement('section');section.className='measurement-tools';
  section.innerHTML=`<h2>Measurements</h2><div class="measurement-modes" role="group" aria-label="Mouse tool"><button type="button" data-tool="rotate" aria-pressed="true">Rotate</button><button type="button" data-tool="distance" aria-pressed="false">Length</button><button type="button" data-tool="angle" aria-pressed="false">Angle</button></div><small class="measurement-help">Length: drag between two atoms, or click each. Angle: select three atoms; the second is the vertex.</small><p class="measurement-progress" role="status" aria-live="polite"></p><details><summary>Choose atoms by name</summary><label class="field">First atom<select class="measurement-first"></select></label><label class="field">Second atom / angle vertex<select class="measurement-second"></select></label><label class="field measurement-third-wrap" hidden>Third atom<select class="measurement-third"></select></label><button type="button" class="measurement-add">Add measurement</button></details><div class="measurement-list"></div><details class="measurement-appearance"><summary>Measurement appearance</summary><div class="measurement-colours"><label class="field">Font colour<input type="color" class="measurement-font-colour" aria-label="Measurement font colour"><input type="text" class="measurement-font-hex" aria-label="Font colour hex" maxlength="7" spellcheck="false"></label><label class="field">Line colour<input type="color" class="measurement-line-colour" aria-label="Measurement line colour"><input type="text" class="measurement-line-hex" aria-label="Line colour hex" maxlength="7" spellcheck="false"></label></div><label class="field">Measurement lines<select class="measurement-line-style"><option value="solid">Solid</option><option value="dashed">Dashed</option><option value="dotted">Dotted</option><option value="none">None</option></select></label><label class="field">Label connectors<select class="measurement-leader-style"><option value="solid">Solid</option><option value="dashed">Dashed</option><option value="dotted">Dotted</option><option value="none">None</option></select></label><label class="field">Font size <output class="measurement-font-size-value"></output><input type="range" class="measurement-font-size" min="14" max="30" step="1" aria-label="Measurement font size"></label><label class="field">Line thickness <output class="measurement-line-width-value"></output><input type="range" class="measurement-line-width" min="0.5" max="4" step="0.1" aria-label="Measurement line thickness"></label></details><label class="field">During rotation<select class="measurement-visibility-mode"><option value="paused">Hide while rotating</option><option value="view">Near a chosen view</option><option value="always">Always show</option></select></label><div class="measurement-view-controls" hidden><button type="button" class="measurement-set-view">Use current view</button><label class="field">Visible rotation window<select class="measurement-view-window"><option value="30">30° · narrow</option><option value="60">60° · default</option><option value="90">90° · wide</option><option value="120">120° · wider</option></select></label><small>Pause at the best angle, then choose Use current view. Measurements fade in around that view on each turn.</small></div><small>Applies to the workspace and exported movies.</small><div class="measurement-options"><label><input type="checkbox" class="measurement-avoid" checked> Keep labels clear of structure</label><label><input type="checkbox" class="measurement-visible" checked> Show measurements</label><label><input type="checkbox" class="measurement-export" checked> Include in exports</label></div><div class="measurement-layout-actions"><button type="button" class="measurement-auto">Auto-place labels</button><button type="button" class="measurement-clear">Clear measurements</button></div><small>Drag the text to pin a label in place. Turn off Keep labels clear for unrestricted placement. From coordinates · no calculated uncertainties.</small>`;
  sidebar.insertBefore(section,sidebar.querySelector('.divider'));
  const style=document.createElement('style');style.textContent=`.workspace>aside:first-child{max-height:calc(100vh - 155px);overflow-y:auto}@media(max-width:620px){.workspace>aside:first-child{max-height:none;overflow:visible}}.measurement-tools{border-top:1px solid #cad7e6;margin-top:22px;padding-top:18px}.measurement-tools h2{margin-bottom:12px}.measurement-modes{display:flex;gap:6px;flex-wrap:wrap}.measurement-modes button{flex:1;min-height:44px;font-size:16px;padding:8px}.measurement-modes button[aria-pressed=true]{background:#2864a8;color:white;border-color:#4786cd}.measurement-tools small{display:block;font-size:14px;line-height:1.5;margin:10px 0}.measurement-progress{font-size:16px;line-height:1.5;margin:10px 0}.measurement-tools summary{font-size:16px;min-height:36px}.measurement-tools details{margin:14px 0}.measurement-options{display:grid;gap:10px;margin:16px 0;font-size:16px}.measurement-row{display:flex;gap:8px;align-items:center;padding:9px 0;border-bottom:1px solid #cad7e6}.measurement-row span{flex:1;min-width:0;overflow-wrap:anywhere;font-size:16px}.measurement-row button{font-size:16px;min-height:40px;padding:6px 10px}.measurement-colours{display:flex;gap:16px}.measurement-colours .field{flex:1;min-width:0}.measurement-colours input[type=color]{display:block;width:64px;height:44px;padding:4px;border:1px solid #69819c;border-radius:5px;background:transparent}.measurement-colours input[type=text]{display:block;width:100%;min-width:0;font:16px Arial;color:inherit;background:transparent;border:1px solid #69819c;border-radius:5px;padding:8px;margin-top:7px}.measurement-layout-actions{display:flex;gap:8px;flex-wrap:wrap}.measurement-layout-actions button{font-size:16px;min-height:44px;padding:8px}.measurement-set-view{font-size:16px;min-height:44px;padding:8px}.measurement-clear,.measurement-add{font-size:16px;min-height:44px}.measurement-overlay{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}html[data-theme=dark] .measurement-tools,html[data-theme=dark] .measurement-row{border-color:#34465b}`;
  document.head.append(style);
  const overlay=document.createElement('canvas');overlay.className='measurement-overlay';overlay.setAttribute('aria-hidden','true');viewport.append(overlay);
  const $=s=>section.querySelector(s),tools=[...section.querySelectorAll('[data-tool]')],selects=['.measurement-first','.measurement-second','.measurement-third'].map($);
  let state=validateMeasurements(undefined,[]),mode='rotate',pending=[],gesture=null,boxes=[];
  const needed=()=>mode==='angle'?3:2;
  const name=id=>getModel()?.atoms[id]?.label||'Atom '+(id+1);
  const label=item=>{const v=measurementValue(item.atomIds.map(id=>getModel().atoms[id].p));return item.kind==='distance'?v.toFixed(3)+' Å':v.toFixed(1)+'°'};
  const change=()=>{dirty();refresh();redraw()};
  function refresh(){
    tools.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tool===mode)));
    canvas.style.cursor=mode==='rotate'?'grab':'crosshair';
    $('.measurement-progress').textContent=mode==='rotate'?'':`${mode==='angle'?'Angle':'Length'}: ${pending.map(name).join(' → ')||'choose an atom'}${pending.length?` · ${needed()-pending.length} more`:''}`;
    $('.measurement-third-wrap').hidden=mode!=='angle';
    $('.measurement-add').disabled=mode==='rotate'||isBusy();
    const atoms=getAtoms();
    selects.forEach((select,k)=>{const previous=select.value;select.replaceChildren(...atoms.map(a=>new Option(`${a.label} · #${a.id+1}`,String(a.id))));if(atoms.some(a=>String(a.id)===previous))select.value=previous;else if(atoms.length)select.selectedIndex=Math.min(k,atoms.length-1);});
    $('.measurement-visible').checked=state.visible;$('.measurement-export').checked=state.includeInExports;$('.measurement-avoid').checked=state.avoidStructure;
    $('.measurement-visibility-mode').value=state.visibility.mode;$('.measurement-view-controls').hidden=state.visibility.mode!=='view';$('.measurement-view-window').value=state.visibility.window;
    const style=state.style;
    $('.measurement-font-colour').value=style.fontColor;$('.measurement-line-colour').value=style.lineColor;$('.measurement-font-hex').value=style.fontColor;$('.measurement-line-hex').value=style.lineColor;
    $('.measurement-line-style').value=style.lineStyle;$('.measurement-leader-style').value=style.leaderStyle;
    $('.measurement-font-size').value=style.fontSize;$('.measurement-font-size-value').textContent=style.fontSize;
    $('.measurement-line-width').value=style.lineWidth;$('.measurement-line-width-value').textContent=style.lineWidth.toFixed(1);
    const list=$('.measurement-list');list.replaceChildren();
    state.items.forEach((item,i)=>{const row=document.createElement('div'),text=document.createElement('span'),remove=document.createElement('button');row.className='measurement-row';text.textContent=`${item.atomIds.map(name).join('–')}: ${label(item)}${item.position?' · pinned':''}`;remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','Remove '+text.textContent);remove.onclick=()=>{state.items.splice(i,1);change()};row.append(text,remove);list.append(row)});
    $('.measurement-clear').disabled=!state.items.length||isBusy();$('.measurement-auto').disabled=!state.items.length||isBusy();
  }
  function add(ids){
    try{
      const item=validateMeasurements({items:[{kind:mode,atomIds:ids}]},getModel().atoms).items[0];
      if(state.items.length>=32)throw Error('Clear a measurement before adding more than 32.');
      const duplicate=state.items.some(m=>m.kind===mode&&(m.atomIds.join(',')===ids.join(',')||m.atomIds.join(',')===ids.slice().reverse().join(',')));
      if(!duplicate)state.items.push(item);
      if(state.visibility.mode==='view'&&!state.visibility.reference)state.visibility.reference=getOrientation();state.visible=true;pending=[];status(`${ids.map(name).join('–')}: ${label(item)}. Choose Rotate to turn the structure.`);change();
    }catch(e){pending=[];status(e.message);refresh();redraw()}
  }
  function select(id){if(id===null||pending.includes(id))return;pending.push(id);if(pending.length===needed())add(pending.slice());else{refresh();redraw()}}
  tools.forEach(button=>button.onclick=()=>{mode=button.dataset.tool;pending=[];if(mode!=='rotate')pause();refresh();redraw()});
  $('.measurement-add').onclick=()=>add(selects.slice(0,needed()).map(s=>Number(s.value)));
  $('.measurement-visible').onchange=e=>{state.visible=e.target.checked;change()};
  $('.measurement-export').onchange=e=>{state.includeInExports=e.target.checked;change()};
  $('.measurement-avoid').onchange=e=>{state.avoidStructure=e.target.checked;change()};
  for(const [selector,key,numeric] of [['.measurement-font-colour','fontColor'],['.measurement-line-colour','lineColor'],['.measurement-line-style','lineStyle'],['.measurement-leader-style','leaderStyle'],['.measurement-font-size','fontSize',true],['.measurement-line-width','lineWidth',true]])$(selector).addEventListener('input',e=>{state.style[key]=numeric?Number(e.target.value):e.target.value;change()});
  for(const [selector,key] of [['.measurement-font-hex','fontColor'],['.measurement-line-hex','lineColor']])for(const event of ['input','change'])$(selector).addEventListener(event,e=>{const value=e.target.value.trim();if(!/^#[a-f0-9]{6}$/i.test(value)){if(event==='change'){e.target.value=state.style[key];status('Enter a six-digit hex colour, such as #204f80.');}return;}state.style[key]=value;change()});
  $('.measurement-visibility-mode').onchange=e=>{state.visibility.mode=e.target.value;if(state.visibility.mode==='view'){pause();if(!state.visibility.reference)state.visibility.reference=getOrientation();}change()};
  $('.measurement-set-view').onclick=()=>{pause();state.visibility.reference=getOrientation();change();status('Measurements will fade in near this view during rotation.')};
  $('.measurement-view-window').onchange=e=>{state.visibility.window=Number(e.target.value);change()};
  $('.measurement-auto').onclick=()=>{state.items.forEach(item=>delete item.position);change();status('Labels returned to automatic placement.')};
  $('.measurement-clear').onclick=()=>{state.items=[];pending=[];change()};

  function paint(ctx,w,h,exporting=false,movie=false){
    let opacity=measurementOpacity(state.visibility,getOrientation(),exporting?movie:isRotating());
    if(!exporting&&(mode!=='rotate'||gesture))opacity=1;
    if(!state.visible||exporting&&!state.includeInExports||opacity===0){if(!exporting)boxes=[];return;}
    const projected=getProjected(w,h),points=new Map(projected.map(a=>[a.id,a])),scale=Math.min(w,h)/480,font=Math.max(14,state.style.fontSize*scale),line=Math.max(.5,state.style.lineWidth*scale),newBoxes=[];
    ctx.save();ctx.globalAlpha*=opacity;ctx.font=`${font}px Arial`;ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.lineJoin='round';ctx.lineCap='round';
    const annotations=[];
    state.items.forEach((item,index)=>{
      const p=item.atomIds.map(id=>points.get(id));if(p.some(a=>!a))return;
      let anchor,arc=[];
      if(item.kind==='distance')anchor={x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2};
      else{arc=getArc(item,points,w,h);anchor=arc.length?arc[Math.floor(arc.length/2)]:p[1]}
      const text=label(item),metrics=ctx.measureText(text),left=metrics.actualBoundingBoxLeft||0,right=metrics.actualBoundingBoxRight||metrics.width,ascent=metrics.actualBoundingBoxAscent||font*.8,descent=metrics.actualBoundingBoxDescent||0,paddingX=9*scale,paddingY=7*scale;
      annotations.push({index,item,p,arc,anchor,text,left,right,ascent,descent,w:left+right+paddingX*2,h:ascent+descent+paddingY*2,manual:!!item.position,desired:item.position?{x:item.position[0]*w,y:item.position[1]*h}:{x:anchor.x+item.offset[0]*Math.min(w,h),y:anchor.y+item.offset[1]*Math.min(w,h)}});
    });
    const layout=layoutMeasurementLabels(annotations,projected,w,h,12*scale,{avoidStructure:state.avoidStructure});
    const stroke=(path,type=state.style.lineStyle)=>{
      if(type==='none')return;
      ctx.setLineDash([]);ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=line+1.5*scale;ctx.beginPath();path();ctx.stroke();
      ctx.strokeStyle=state.style.lineColor;ctx.lineWidth=line;ctx.setLineDash(type==='dotted'?[.01*scale,4*scale]:type==='dashed'?[5*scale,4*scale]:[]);ctx.beginPath();path();ctx.stroke();ctx.setLineDash([]);
    };
    annotations.forEach((a,i)=>{
      const box=layout[i];if(!box)return;
      if(a.item.kind==='distance')stroke(()=>{ctx.moveTo(a.p[0].x,a.p[0].y);ctx.lineTo(a.p[1].x,a.p[1].y)});
      else{
        stroke(()=>{ctx.moveTo(a.p[0].x,a.p[0].y);ctx.lineTo(a.p[1].x,a.p[1].y);ctx.lineTo(a.p[2].x,a.p[2].y)});
        if(a.arc.length)stroke(()=>a.arc.forEach((p,j)=>j?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)));
      }
      const edge=boxEdge(a.anchor,box);
      stroke(()=>{ctx.moveTo(a.anchor.x,a.anchor.y);ctx.lineTo(edge.x,edge.y)},state.style.leaderStyle);
      ctx.fillStyle=state.style.fontColor;
      // Centre the visible glyphs, including the ring in Å, rather than the font's advance box.
      ctx.fillText(a.text,box.x+box.w/2+(a.left-a.right)/2,box.y+box.h/2+(a.ascent-a.descent)/2);
      if(!exporting)newBoxes.push({index:a.index,...box,anchor:a.anchor});
    });
    if(!exporting){boxes=newBoxes;for(const id of pending){const p=points.get(id);if(p){ctx.strokeStyle='#247bd5';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,12,0,Math.PI*2);ctx.stroke()}}}
    ctx.restore();
  }
  function getArc(item,points,w,h){
    // getProjected also projects arbitrary model-coordinate positions.
    const model=getModel(),[a,b,c]=item.atomIds.map(id=>model.atoms[id].p),u=a.map((x,i)=>x-b[i]),v=c.map((x,i)=>x-b[i]),lu=Math.hypot(...u),lv=Math.hypot(...v),cos=Math.max(-1,Math.min(1,u.reduce((s,x,i)=>s+x*v[i],0)/(lu*lv))),theta=Math.acos(cos),s=Math.sin(theta);
    if(Math.abs(s)<1e-6)return [];
    const radius=Math.min(lu,lv)*.3,center=getAtoms().find(x=>x.id===item.atomIds[1]);if(!center)return [];
    const samples=Array.from({length:25},(_,j)=>{const t=j/24,aa=Math.sin((1-t)*theta)/s,bb=Math.sin(t*theta)/s;return center.p.map((x,i)=>x+radius*(aa*u[i]/lu+bb*v[i]/lv))});
    return getProjected(w,h,samples);
  }
  function drawOverlay(){const r=viewport.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);if(overlay.width!==Math.round(r.width*ratio)||overlay.height!==Math.round(r.height*ratio)){overlay.width=Math.round(r.width*ratio);overlay.height=Math.round(r.height*ratio)}const ctx=overlay.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,r.width,r.height);paint(ctx,r.width,r.height)}
  const stop=e=>{e.preventDefault();e.stopImmediatePropagation()};
  canvas.addEventListener('pointerdown',e=>{
    if(isBusy()||e.button!==0||gesture)return;
    const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,box=state.visible?boxes.slice().reverse().find(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h):null;
    if(!box&&mode==='rotate')return;
    stop(e);pause();canvas.setPointerCapture(e.pointerId);
    gesture={id:e.pointerId,x:e.clientX,y:e.clientY,box:box?.index,position:box?[(box.x+box.w/2)/r.width,(box.y+box.h/2)/r.height]:null};
    if(!box&&pending.length===0)select(pickAtom(e.clientX,e.clientY));
  },true);
  canvas.addEventListener('pointermove',e=>{if(!gesture){const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;canvas.style.cursor=state.visible&&boxes.some(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h)?'move':mode==='rotate'?'grab':'crosshair';return;}if(gesture.id!==e.pointerId)return;stop(e);if(gesture.box!==undefined){const r=canvas.getBoundingClientRect(),item=state.items[gesture.box];item.position=gesture.position.map((x,i)=>Math.max(0,Math.min(1,x+((i?e.clientY:e.clientX)-(i?gesture.y:gesture.x))/(i?r.height:r.width))));canvas.style.cursor='move';redraw()}},true);
  canvas.addEventListener('pointerup',e=>{if(!gesture||gesture.id!==e.pointerId)return;stop(e);if(gesture.box!==undefined)dirty();else{const id=pickAtom(e.clientX,e.clientY);if(id===null)status('Choose an atom, or use Choose atoms by name.');else select(id)}gesture=null;refresh();redraw()},true);
  for(const event of ['pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{if(gesture?.id===e.pointerId){gesture=null;redraw()}},true);
  refresh();
  return {paint,drawOverlay,refresh,reset(){state={...state,items:[],visibility:{...state.visibility,reference:null}};pending=[];gesture=null;mode='rotate';refresh()},snapshot:()=>structuredClone(state),restore(value){state=validateMeasurements(value,getModel().atoms);pending=[];mode='rotate';refresh();redraw()}};
}

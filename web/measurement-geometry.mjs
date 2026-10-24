export function measurementValue(points){
  if(!Array.isArray(points)||![2,3].includes(points.length)||points.some(p=>!Array.isArray(p)||p.length!==3||p.some(x=>!Number.isFinite(x))))throw Error('Choose two or three valid atoms.');
  const sub=(a,b)=>a.map((x,i)=>x-b[i]);
  if(points.length===2){const length=Math.hypot(...sub(points[0],points[1]));if(length<1e-10)throw Error('These atoms have coincident coordinates.');return length;}
  const u=sub(points[0],points[1]),v=sub(points[2],points[1]),a=Math.hypot(...u),b=Math.hypot(...v);
  if(a<1e-10||b<1e-10)throw Error('An angle needs three non-coincident atoms.');
  return Math.acos(Math.max(-1,Math.min(1,u.reduce((s,x,i)=>s+x*v[i],0)/(a*b))))*180/Math.PI;
}
export function validateMeasurements(value,atoms){
  if(value===undefined||value===null)value={items:[]};
  if(typeof value!=='object'||!Array.isArray(value.items)||value.items.length>32)throw Error('A project can contain up to 32 measurements.');
  const items=value.items.map(item=>{
    const n=item?.kind==='distance'?2:item?.kind==='angle'?3:0,ids=item?.atomIds;
    if(!n||!Array.isArray(ids)||ids.length!==n||new Set(ids).size!==n||ids.some(i=>!Number.isInteger(i)||i<0||i>=atoms.length))throw Error('Invalid measurement atom selection.');
    measurementValue(ids.map(i=>atoms[i].p));
    const offset=item.offset??[0,-.05];
    if(!Array.isArray(offset)||offset.length!==2||offset.some(x=>!Number.isFinite(x)||Math.abs(x)>2))throw Error('Invalid measurement label position.');
    const result={kind:item.kind,atomIds:ids.slice(),offset:offset.slice()};
    if(item.position!==undefined){
      if(!Array.isArray(item.position)||item.position.length!==2||item.position.some(x=>!Number.isFinite(x)||x<0||x>1))throw Error('Invalid fixed label position.');
      result.position=item.position.slice();
    }
    return result;
  });
  const s=value.style||{},colour=(v,fallback)=>typeof v==='string'&&/^#[a-f0-9]{6}$/i.test(v)?v:fallback,line=(v,fallback)=>['solid','dashed','dotted','none'].includes(v)?v:fallback;
  const style={fontColor:colour(s.fontColor,'#204f80'),lineColor:colour(s.lineColor,'#316ba6'),lineStyle:line(s.lineStyle,'dashed'),leaderStyle:line(s.leaderStyle,'dashed'),fontSize:Number.isFinite(s.fontSize)?Math.max(14,Math.min(30,s.fontSize)):18,lineWidth:Number.isFinite(s.lineWidth)?Math.max(.5,Math.min(4,s.lineWidth)):1.3};
  const raw=value.visibility||{},q=raw.reference,n=Array.isArray(q)&&q.length===4&&q.every(Number.isFinite)?Math.hypot(...q):0;
  const visibility={mode:['always','paused','view'].includes(raw.mode)?raw.mode:'paused',window:[30,60,90,120].includes(raw.window)?raw.window:60,reference:n>1e-10&&Number.isFinite(n)?q.map(x=>x/n):null};
  return {items,visible:value.visible!==false,includeInExports:value.includeInExports!==false,avoidStructure:value.avoidStructure!==false,style,visibility};
}

export function measurementOpacity(visibility,orientation,moving){
  if(visibility.mode==='paused')return moving?0:1;
  if(visibility.mode!=='view')return 1;
  const reference=visibility.reference;
  if(!reference||!Array.isArray(orientation)||orientation.length!==4)return 0;
  const n=Math.hypot(...orientation);if(!Number.isFinite(n)||n<1e-10)return 0;
  const dot=Math.abs(reference.reduce((sum,x,i)=>sum+x*orientation[i]/n,0));
  const angle=2*Math.acos(Math.max(0,Math.min(1,dot)))*180/Math.PI,outer=visibility.window/2,inner=outer*.6;
  const t=Math.max(0,Math.min(1,(angle-inner)/(outer-inner)));
  return 1-t*t*(3-2*t);
}

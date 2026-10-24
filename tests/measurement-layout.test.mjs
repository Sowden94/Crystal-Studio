import test from 'node:test';
import assert from 'node:assert/strict';
import {layoutMeasurementLabels,boxEdge} from '../web/measurement-layout.mjs';

test('label boxes stay outside atom silhouettes and separate from each other',()=>{
  for(const [w,h] of [[640,480],[1200,900],[360,480]])for(let frame=0;frame<36;frame++){
    const angle=frame*Math.PI/18,c=Math.cos(angle),s=Math.sin(angle),size=Math.min(w,h),atoms=[];
    for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1])atoms.push({x:w/2+(x*c+z*s)*size*.15,y:h/2+y*size*.2,rx:size*.025,ry:size*.025});
    const labels=Array.from({length:4},(_,i)=>({w:size*.15,h:size*.06,anchor:{x:w/2,y:h/2},desired:{x:w/2+(i%2?1:-1)*size*.12,y:h/2+(i<2?-1:1)*size*.05}}));
    const boxes=layoutMeasurementLabels(labels,atoms,w,h,size*.025);assert.ok(boxes.every(Boolean));
    const l=Math.min(...atoms.map(a=>a.x-a.rx)),r=Math.max(...atoms.map(a=>a.x+a.rx)),t=Math.min(...atoms.map(a=>a.y-a.ry)),b=Math.max(...atoms.map(a=>a.y+a.ry));
    boxes.forEach((a,i)=>{assert.ok(a.x+a.w<=l||a.x>=r||a.y+a.h<=t||a.y>=b);assert.ok(a.x>=0&&a.y>=0&&a.x+a.w<=w&&a.y+a.h<=h);for(const d of boxes.slice(i+1))assert.ok(a.x+a.w<=d.x||d.x+d.w<=a.x||a.y+a.h<=d.y||d.y+d.h<=a.y)});
  }
});
test('leaders terminate at box edges, leaving the lettering clear',()=>{
  const box={x:100,y:100,w:80,h:40};assert.deepEqual(boxEdge({x:0,y:120},box),{x:100,y:120});assert.deepEqual(boxEdge({x:140,y:0},box),{x:140,y:100});
});
test('no label is drawn over a structure that leaves no available paper',()=>{
  assert.deepEqual(layoutMeasurementLabels([{w:100,h:40,anchor:{x:100,y:100},desired:{x:100,y:100}}],[{x:100,y:100,rx:100,ry:100}],200,200),[null]);
});
test('pinned labels keep their chosen paper position and optionally allow free placement',()=>{
  const atom=[{x:320,y:240,rx:80,ry:100}],anchor={x:320,y:240};
  const outside={w:80,h:30,anchor,desired:{x:100,y:100},manual:true};
  assert.deepEqual(layoutMeasurementLabels([outside],atom,640,480)[0],{x:60,y:85,w:80,h:30});
  const inside={...outside,desired:anchor};
  const safe=layoutMeasurementLabels([inside],atom,640,480)[0];assert.ok(safe.x+safe.w<=240||safe.x>=400||safe.y+safe.h<=140||safe.y>=340);
  assert.deepEqual(layoutMeasurementLabels([inside],atom,640,480,12,{avoidStructure:false})[0],{x:280,y:225,w:80,h:30});
});

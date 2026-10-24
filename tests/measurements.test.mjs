import test from 'node:test';
import assert from 'node:assert/strict';
import {measurementValue,validateMeasurements,measurementOpacity} from '../web/measurement-geometry.mjs';
import {sample,inferBonds} from '../web/structure.mjs';
import {encodeProject,decodeProject} from '../web/project.mjs';

test('measures in 3D angstrom coordinates rather than projected screen distance',()=>{
  assert.equal(measurementValue([[0,0,0],[0,0,1.54]]),1.54);
  assert.equal(measurementValue([[0,0,0],[3,4,12]]),13);
  const d=sample();assert.equal(measurementValue([d.atoms[0].p,d.atoms[1].p]),1.56);
});
test('angle uses the second atom as vertex and handles straight angles',()=>{
  assert.equal(measurementValue([[1,0,0],[0,0,0],[0,1,0]]),90);
  assert.equal(measurementValue([[-1,0,0],[0,0,0],[1,0,0]]),180);
  assert.ok(Math.abs(measurementValue([[1,0,0],[0,0,0],[-.5,Math.sqrt(3)/2,0]])-120)<1e-10);
  const points=[[1,2,3],[3,-1,2],[0,1,6]],transformed=points.map(([x,y,z])=>[-y+100,x-200,z+50]);
  assert.ok(Math.abs(measurementValue(points)-measurementValue(transformed))<1e-10);
});
test('measurements and label positions survive saving while old projects still open',()=>{
  const model=sample();model.bonds=inferBonds(model.atoms);
  const measurements={visible:false,includeInExports:false,items:[{kind:'distance',atomIds:[0,1],offset:[.1,-.2]},{kind:'angle',atomIds:[1,0,2],offset:[0,.2]}]};
  const result=decodeProject(encodeProject({model,view:{},measurements}));assert.deepEqual(result.measurements.items,measurements.items);assert.equal(result.measurements.visible,false);assert.equal(result.measurements.includeInExports,false);
  const legacy=decodeProject(encodeProject({model,view:{}})).measurements;assert.deepEqual(legacy.items,[]);assert.equal(legacy.visible,true);assert.equal(legacy.includeInExports,true);assert.equal(legacy.avoidStructure,true);assert.equal(legacy.style.fontColor,'#204f80');
});
test('custom measurement appearance and pinned positions survive a project round trip',()=>{
  const model=sample();model.bonds=inferBonds(model.atoms);
  const measurements={items:[{kind:'angle',atomIds:[3,1,5],offset:[0,0],position:[.2,.8]}],visible:true,includeInExports:true,avoidStructure:false,visibility:{mode:'view',window:90,reference:[0,0,0,1]},style:{fontColor:'#882255',lineColor:'#228833',lineStyle:'dotted',leaderStyle:'solid',fontSize:24,lineWidth:2.5}};
  assert.deepEqual(decodeProject(encodeProject({model,measurements})).measurements,measurements);
  const cleaned=validateMeasurements({...measurements,style:{fontColor:'url(private)',lineColor:'red',lineStyle:'code',leaderStyle:'none',fontSize:500,lineWidth:-8}},model.atoms);
  assert.equal(cleaned.style.fontColor,'#204f80');assert.equal(cleaned.style.lineColor,'#316ba6');assert.equal(cleaned.style.lineStyle,'dashed');assert.equal(cleaned.style.leaderStyle,'none');assert.equal(cleaned.style.fontSize,30);assert.equal(cleaned.style.lineWidth,.5);
  assert.throws(()=>validateMeasurements({items:[{kind:'distance',atomIds:[0,1],position:[-1,NaN]}]},model.atoms));
});
test('rotation visibility hides while moving or smoothly gates a chosen orientation',()=>{
  const q=degrees=>[0,Math.sin(degrees*Math.PI/360),0,Math.cos(degrees*Math.PI/360)];
  assert.equal(measurementOpacity({mode:'paused'},q(0),true),0);assert.equal(measurementOpacity({mode:'paused'},q(0),false),1);
  assert.equal(measurementOpacity({mode:'always'},q(180),true),1);
  const v={mode:'view',window:60,reference:q(0)};
  assert.equal(measurementOpacity(v,q(0),true),1);assert.equal(measurementOpacity(v,q(15),true),1);
  assert.ok(Math.abs(measurementOpacity(v,q(24),true)-.5)<1e-10);
  assert.equal(measurementOpacity(v,q(45),true),0);assert.equal(measurementOpacity(v,q(180),false),0);
  assert.equal(measurementOpacity(v,q(360),true),1);
  assert.equal(measurementOpacity({...v,reference:null},q(0),true),0);
  const model=sample();assert.equal(validateMeasurements({items:[],visibility:{mode:'script',window:999,reference:[NaN,0,0,0]}},model.atoms).visibility.mode,'paused');
});
test('rejects invalid geometry, out-of-range references and unbounded saved labels',()=>{
  const atoms=[{p:[0,0,0]},{p:[1,0,0]},{p:[0,0,0]}];
  assert.throws(()=>measurementValue([[0,0,0],[0,0,0]]));
  assert.throws(()=>measurementValue([[0,0,0],[0,0,0],[1,0,0]]));
  for(const item of [{kind:'distance',atomIds:[0,99]},{kind:'angle',atomIds:[0,1,1]},{kind:'distance',atomIds:[0,2]},{kind:'distance',atomIds:[0,1],offset:[Infinity,0]}])assert.throws(()=>validateMeasurements({items:[item]},atoms));
  assert.throws(()=>validateMeasurements({items:Array(33).fill({kind:'distance',atomIds:[0,1]})},atoms));
});

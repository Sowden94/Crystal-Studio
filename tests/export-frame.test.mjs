import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../web/vendor/three.js';
import {copyExportFrame,rotationRadius,exportFrustum} from '../web/export-frame.mjs';

test('exports copy the full backing canvas at standard, fractional and Retina pixel ratios',()=>{
  for(const [w,h] of [[640,480],[960,720],[2400,1800]])for(const dpr of [1,1.25,1.5,2]){
    const source={width:w*dpr,height:h*dpr},calls=[];
    copyExportFrame({clearRect(...a){calls.push(['clear',...a])},drawImage(...a){calls.push(['draw',...a])}},source,w,h);
    assert.deepEqual(calls,[['clear',0,0,w,h],['draw',source,0,0,w*dpr,h*dpr,0,0,w,h]]);
  }
});

test('a full rotation fits off-centre space-filling atoms and elongated ellipsoids on every axis',()=>{
  const shapes=[{position:new T.Vector3(-6,2,0),scale:new T.Vector3(3,3,3)}, {position:new T.Vector3(4,-2,2),scale:new T.Vector3(.2,4,.3)}];
  const radius=rotationRadius(shapes,.18);
  for(const [w,h] of [[640,480],[960,720],[480,640]]){
    const f=exportFrustum(w,h,radius),camera=new T.OrthographicCamera(f.left,f.right,f.top,f.bottom,.1,200);
    camera.position.set(0,0,40);camera.updateMatrixWorld();
    for(const axis of [new T.Vector3(1,0,0),new T.Vector3(0,1,0),new T.Vector3(0,0,1)])for(let n=0;n<360;n+=3){
      const q=new T.Quaternion().setFromAxisAngle(axis,n*Math.PI/180);
      for(const shape of shapes){
        const p=shape.position.clone().applyQuaternion(q).project(camera),extent=Math.max(...shape.scale.toArray())*1.01;
        assert.ok(Math.abs(p.x)+extent/f.right<1);
        assert.ok(Math.abs(p.y)+extent/f.top<1);
      }
    }
  }
});

test('thin stick displays still reserve the complete bond thickness',()=>{
  assert.equal(rotationRadius([{position:new T.Vector3(10,0,0),scale:new T.Vector3(.085,.085,.085)}],.18),10.18);
});

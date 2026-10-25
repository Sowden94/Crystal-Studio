import test from 'node:test';
import assert from 'node:assert/strict';
import {startImport} from '../web/import-runner.mjs';
import {parseStructure,importTask} from '../web/import-worker.mjs';
import {validatedModel} from '../web/import-model.mjs';
test('isolated import runner terminates on completion, timeout, cancel and worker failure',async()=>{
  for(const mode of ['result','timeout','cancel','error','bad-message']){
    let terminated=0,deadline,cleared=0,sent;
    const worker={terminate(){terminated++},postMessage(value){sent=value}};
    const task=startImport('structure',{text:'synthetic'},{createWorker:()=>worker,setTimer:fn=>{deadline=fn;return 1},clearTimer:()=>cleared++});
    assert.equal(sent.kind,'structure');
    if(mode==='result'){worker.onmessage({data:{type:'result',result:{safe:true}}});assert.deepEqual(await task.promise,{safe:true});}
    else{if(mode==='timeout')deadline();if(mode==='cancel')task.cancel();if(mode==='error')worker.onerror({preventDefault(){}});if(mode==='bad-message')worker.onmessage({data:null});await assert.rejects(task.promise);}
    assert.equal(terminated,1);assert.equal(cleared,1);task.cancel();assert.equal(terminated,1);
  }
});
test('unavailable isolation fails closed instead of falling back to the page',async()=>{
  const task=startImport('structure',{}, {createWorker(){throw Error('Worker disabled')}});
  await assert.rejects(task.promise,/isolated file reader could not start/);
});
test('structure worker validates output and rejects hostile or unsupported input',async()=>{
  const text='2\n<img src=x onerror=alert(1)>\nC 0 0 0\nC 1.56 0 0';
  const result=parseStructure({text,ext:'xyz'});assert.equal(result.model.atoms.length,2);assert.deepEqual(result.model.bonds,[[1,0]]);assert.equal(result.model.name,'<img src=x onerror=alert(1)>');
  // Markup is kept as plain text; it must never be interpreted as HTML.
  assert.throws(()=>parseStructure({text,ext:'html'}),/Choose CIF/);
  await assert.rejects(importTask('execute',{code:'anything'}),/Unsupported/);
  assert.throws(()=>validatedModel({atoms:[{element:'C',p:[NaN,0,0]}],bonds:[]}),/Invalid atom/);
  assert.throws(()=>validatedModel({atoms:[{element:'C',p:[0,0,0]}],bonds:[[0,5]]}),/invalid bond/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {parse,fromCif,inferBonds,sample} from '../web/structure.mjs';
import {PDF_LIMITS,pdfOptions,checkPdfPage} from '../web/import-limits.mjs';
import {buildReportModel} from '../web/report.mjs';
test('rejects oversized atom tables before bond inference or symmetry expansion',()=>{
  assert.throws(()=>parse('2001\nLarge\n'+Array(2001).fill('C 0 0 0').join('\n'),'xyz'),/2,000/);
  assert.throws(()=>fromCif({tags:{},loops:[Array.from({length:2001},(_,i)=>({_atom_site_label:'C'+i,_atom_site_cartn_x:'0',_atom_site_cartn_y:'0',_atom_site_cartn_z:'0'}))]}),/2,000/);
  assert.throws(()=>inferBonds(Array(2001).fill({element:'C',p:[0,0,0]})),/2,000/);
});
test('rejects dense synthetic coordinates rather than building unbounded bond meshes',()=>{
  const atoms=Array.from({length:400},(_,i)=>({element:'C',p:[i%10*.1,Math.floor(i/10)%10*.1,Math.floor(i/100)*.1]}));
  assert.throws(()=>inferBonds(atoms),/20,000 bond limit/);
  assert.equal(inferBonds(sample().atoms).length,20);
});
test('PDF extraction has text budgets and disables dynamic code and font loading',()=>{
  const data=new Uint8Array([1,2]);const opts=pdfOptions(data);
  assert.equal(opts.data,data);assert.equal(opts.isEvalSupported,false);assert.equal(opts.enableXfa,false);assert.equal(opts.disableFontFace,true);assert.equal(opts.useWorkerFetch,false);
  assert.throws(()=>checkPdfPage(Array(PDF_LIMITS.pageItems+1).fill({str:'x'}),{items:0,characters:0}),/too many text/);
  assert.throws(()=>checkPdfPage([{str:'a'}],{items:PDF_LIMITS.items,characters:0}),/limit/);
  assert.throws(()=>checkPdfPage([{str:'a'}],{items:0,characters:PDF_LIMITS.characters}),/limit/);
  const budget={items:0,characters:0};checkPdfPage([{str:'C1 0 0 0'}],budget);assert.deepEqual(budget,{items:1,characters:8});
});
test('structure and report coordinates reject nonfinite or extreme values',()=>{
  assert.throws(()=>parse('1\nExtreme\nC 1e300 0 0','xyz'),/Invalid XYZ/);
  assert.throws(()=>buildReportModel({text:'C1 1e300 0 0',kind:'cartesian',scale:'1',cell:[],name:'synthetic'}),/range/);
});

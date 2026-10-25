import {cifBlocks,fromCif,parse} from './structure.mjs';
import {validatedModel} from './import-model.mjs';
import {analyseReport,buildReportModel} from './report.mjs';
import {PDF_LIMITS,pdfOptions,checkPdfPage} from './import-limits.mjs';
import {createIsolatedWorker} from './isolated-worker.mjs';

export function parseStructure({text,ext,index=0}) {
  if(typeof text!=='string'||text.length>5*1024*1024)throw Error('Choose a structure smaller than 5 MB.');
  if(!['cif','xyz','mol','sdf'].includes(ext))throw Error('Choose CIF, XYZ, MOL or SDF coordinates.');
  if(ext!=='cif')return {model:validatedModel(parse(text,ext)),blockNames:[]};
  const blocks=cifBlocks(text);
  if(!blocks.length)throw Error('No coordinate data blocks in this CIF.');
  if(blocks.length>64)throw Error('Choose a CIF with 64 or fewer coordinate blocks.');
  if(!Number.isInteger(index)||index<0||index>=blocks.length)throw Error('Invalid CIF block selection.');
  return {model:validatedModel(fromCif(blocks[index])),blockNames:blocks.map(b=>String(b.name).slice(0,256))};
}
export async function extractPdf(bytes,progress=()=>{}) {
  if(!(bytes instanceof ArrayBuffer)||bytes.byteLength>PDF_LIMITS.bytes||bytes.byteLength<8)throw Error('Choose a valid PDF smaller than 30 MB.');
  const signature=new TextDecoder().decode(new Uint8Array(bytes,0,Math.min(bytes.byteLength,1024)));
  if(!signature.includes('%PDF-'))throw Error('This file does not have a PDF header.');
  const pdfjs=await import('./vendor/pdf.mjs');
  // Supply a native worker port explicitly. Never fall back to parsing in the UI.
  const port=createIsolatedWorker(new URL('./vendor/pdf.worker.mjs',import.meta.url));
  const worker=new pdfjs.PDFWorker({port});
  const task=pdfjs.getDocument({...pdfOptions(new Uint8Array(bytes)),worker});
  task.onPassword=()=>{void task.destroy().catch(()=>{});};
  try{
    const doc=await task.promise;if(doc.numPages>PDF_LIMITS.pages)throw Error('Choose a report of 150 pages or fewer.');
    const pages=[],budget={items:0,characters:0};
    for(let i=1;i<=doc.numPages;i++){
      progress({page:i,pages:doc.numPages});
      const page=await doc.getPage(i),content=await page.getTextContent();checkPdfPage(content.items,budget);
      const groups=[];
      for(const item of content.items){if(!item.str?.trim())continue;const y=item.transform[5],x=item.transform[4],tol=Math.max(2,Math.abs(item.transform[3])*.3);if(!Number.isFinite(x)||!Number.isFinite(y))throw Error('Invalid PDF text coordinates.');let row=groups.find(r=>Math.abs(r.y-y)<tol);if(!row){row={y,items:[]};groups.push(row)}row.items.push({x,s:item.str})}
      pages.push({page:i,lines:groups.sort((a,b)=>b.y-a.y).map(r=>r.items.sort((a,b)=>a.x-b.x).map(i=>i.s).join(' ').replace(/\s+/g,' ').trim())});page.cleanup();
    }
    return {...analyseReport(pages),pageCount:doc.numPages};
  }finally{try{await task.destroy()}catch{}finally{port.terminate();port.releaseIsolation();worker.destroy();}}
}
export async function importTask(kind,payload,progress=()=>{}) {
  if(kind==='structure')return parseStructure(payload);
  if(kind==='pdf')return extractPdf(payload.bytes,progress);
  if(kind==='report-model')return {model:validatedModel(buildReportModel(payload))};
  throw Error('Unsupported import request.');
}
if(typeof WorkerGlobalScope!=='undefined'&&globalThis instanceof WorkerGlobalScope){
  let used=false;
  self.onmessage=async event=>{if(used)return;used=true;try{const {kind,payload}=event.data;const result=await importTask(kind,payload,progress=>postMessage({type:'progress',...progress}));postMessage({type:'result',result});}catch(error){postMessage({type:'error',error:String(error.message||'Could not read file.').slice(0,500)});}};
}

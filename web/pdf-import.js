import {PDF_LIMITS} from './import-limits.mjs';
import {startImport} from './import-runner.mjs';
import {validatedModel} from './import-model.mjs';
export function setupPdfImport({load,status}){
  const $=id=>document.getElementById(id);let candidate=null,reportName='',task=null,run=0;
  function cancel(){run++;task?.cancel();task=null;}
  function showTable(){if(!candidate)return;const t=candidate.tables[Number($('pdftable').value)];$('pdfrows').value=t?t.rows.map(r=>r.raw).join('\n'):'';$('pdfkind').value=t?.kind||'';$('pdfscale').value=t?.scale||'';$('pdfcontext').textContent=t?'Detected '+t.rows.length+' atom rows on page '+t.page+'. Verify that this is the complete table for your compound.':'No coordinate table detected. You can paste a coordinate table below, or upload a CIF.';$('pdfcellgroup').hidden=$('pdfkind').value==='cartesian';$('pdfmessage').textContent='';}
  $('pdfkind').onchange=()=>$('pdfcellgroup').hidden=$('pdfkind').value==='cartesian';$('pdftable').onchange=showTable;
  $('pdfclose').onclick=()=>{cancel();$('pdfreview').close()};$('pdfcancel').onclick=()=>{cancel();$('pdfreview').close()};$('pdfreview').addEventListener('cancel',cancel);
  $('pdfrender').onclick=async()=>{
    const token=++run;task?.cancel();$('pdfrender').disabled=true;
    const current=startImport('report-model',{text:$('pdfrows').value,kind:$('pdfkind').value,scale:$('pdfscale').value,cell:['a','b','c','alpha','beta','gamma'].map(k=>$('pdfcell_'+k).value),name:reportName.replace(/\.pdf$/i,'')});task=current;
    try{const result=await current.promise;if(run!==token)return;load(validatedModel(result.model));$('blockwrap').hidden=true;$('pdfreview').close();status('PDF coordinates loaded. Review inferred bonds against your report.');}
    catch(e){if(run===token&&e.name!=='AbortError')$('pdfmessage').textContent=e.message;}
    finally{if(task===current)task=null;if(run===token)$('pdfrender').disabled=false;}
  };
  const importPdf=async function(file){
    cancel();const token=run;candidate=null;reportName=file.name;if(!$('pdfreview').open)$('pdfreview').showModal();$('pdfname').textContent=file.name;$('pdfprogress').textContent='Reading PDF in an isolated worker…';$('pdfcontents').hidden=true;$('pdfrender').disabled=true;$('pdfmessage').textContent='';
    let current;
    try{
      if(file.size>PDF_LIMITS.bytes)throw Error('Choose a PDF smaller than 30 MB.');
      const bytes=await file.arrayBuffer();if(run!==token)return;
      current=startImport('pdf',{bytes},{transfer:[bytes],milliseconds:PDF_LIMITS.milliseconds,onProgress:p=>{if(run===token)$('pdfprogress').textContent='Reading page '+p.page+' of '+p.pages+'…';}});task=current;
      const result=await current.promise;if(run!==token)return;
      if(typeof result.text!=='string'||result.text.length>PDF_LIMITS.characters+10000||!Array.isArray(result.tables)||result.tables.length>1000)throw Error('Invalid report reader response.');
      candidate=result;$('pdftext').value=candidate.text;$('pdftable').replaceChildren(...candidate.tables.map((t,i)=>new Option(t.title+' · '+t.rows.length+' atoms',i)));$('pdftablewrap').hidden=!candidate.tables.length;candidate.cell.forEach((v,i)=>{$('pdfcell_'+['a','b','c','alpha','beta','gamma'][i]).value=v});$('pdfcontents').hidden=false;$('pdfrender').disabled=false;
      const letters=candidate.text.replace(/--- Page \d+ ---/g,'').trim().length;
      $('pdfprogress').textContent=letters<50?'This looks like a scanned PDF. Use OCR first, then import it again.':candidate.pageCount+' pages read · '+candidate.tables.length+' coordinate table(s) detected';showTable();status('PDF read. Review the extracted coordinates before rendering.');
    }catch(e){if(run===token&&e.name!=='AbortError'){$('pdfprogress').textContent='Could not extract this PDF: '+e.message;status('PDF extraction failed. Your current model has been kept.');}}
    finally{if(task===current)task=null;}
  };
  importPdf.cancel=cancel;return importPdf;
}


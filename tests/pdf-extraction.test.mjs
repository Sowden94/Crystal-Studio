import test from 'node:test';
import assert from 'node:assert/strict';
import {pdfOptions,checkPdfPage} from '../web/import-limits.mjs';
// Constructed report: no experimental coordinates, reports or research files.
function syntheticPdf(){
  const stream='BT /F1 12 Tf 40 750 Td (Cartesian x y z) Tj 0 -18 Td (C1 0 0 0) Tj 0 -18 Td (C2 1.56 0 0) Tj ET';
  const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
  let text='%PDF-1.4\n',offsets=[0];objects.forEach((object,i)=>{offsets.push(text.length);text+=`${i+1} 0 obj\n${object}\nendobj\n`;});const xref=text.length;
  text+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(text);
}
test('bundled PDF parser extracts synthetic coordinates with hardened settings',async()=>{
  const pdfjs=await import('../web/vendor/pdf.mjs');pdfjs.GlobalWorkerOptions.workerSrc=new URL('../web/vendor/pdf.worker.mjs',import.meta.url).href;
  const task=pdfjs.getDocument({...pdfOptions(syntheticPdf()),verbosity:0});
  try{const doc=await task.promise;assert.equal(doc.numPages,1);const page=await doc.getPage(1),text=await page.getTextContent();checkPdfPage(text.items,{items:0,characters:0});assert.match(text.items.map(x=>x.str).join(' '),/C2 1\.56 0 0/);}
  finally{await task.destroy();}
});

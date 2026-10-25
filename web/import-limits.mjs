export const MAX_ATOMS = 2000;
export const MAX_BONDS = 20000;
export function atomLimit(count) {
  if (!Number.isInteger(count) || count < 1 || count > MAX_ATOMS) throw Error('Choose a structure containing 1–2,000 atoms.');
}
export function bondLimit(count) {
  if (!Number.isInteger(count) || count < 0 || count > MAX_BONDS) throw Error('Connectivity exceeds the 20,000 bond limit.');
}
export const PDF_LIMITS = Object.freeze({bytes:30*1024*1024,pages:150,pageItems:10000,items:100000,characters:2000000,milliseconds:45000});
export function pdfOptions(data) {
  return {data,isEvalSupported:false,disableFontFace:true,useSystemFonts:false,enableXfa:false,useWorkerFetch:false,useWasm:false,isOffscreenCanvasSupported:false,isImageDecoderSupported:false};
}
export function checkPdfPage(items, budget) {
  if (!Array.isArray(items) || items.length > PDF_LIMITS.pageItems) throw Error('PDF page contains too many text items. Use a smaller report or the CIF.');
  budget.items += items.length;
  for (const item of items) budget.characters += typeof item.str === 'string' ? item.str.length : 0;
  if (budget.items > PDF_LIMITS.items || budget.characters > PDF_LIMITS.characters) throw Error('PDF extracted text exceeds the supported limit. Use a smaller report or the CIF.');
}

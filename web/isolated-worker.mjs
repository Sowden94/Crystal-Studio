// A blob worker inherits the creator's CSP. A network-loaded worker does not
// inherit an HTML meta policy on GitHub Pages, where custom headers are unavailable.
export function createIsolatedWorker(moduleUrl) {
  const source=new URL(moduleUrl);
  const own=new URL(import.meta.url);
  if(source.protocol!==own.protocol||source.host!==own.host||source.search||source.hash)throw Error('Invalid isolated worker module.');
  const blobUrl=URL.createObjectURL(new Blob(['import '+JSON.stringify(source.href)+';'],{type:'text/javascript'}));
  try{
    const worker=new Worker(blobUrl,{type:'module'});
    Object.defineProperty(worker,'releaseIsolation',{value:()=>URL.revokeObjectURL(blobUrl)});
    return worker;
  }catch(error){URL.revokeObjectURL(blobUrl);throw error;}
}

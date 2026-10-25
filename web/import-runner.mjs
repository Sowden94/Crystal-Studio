import {createIsolatedWorker} from './isolated-worker.mjs';
export function startImport(kind,payload,{milliseconds=15000,onProgress=()=>{},transfer=[],createWorker=()=>createIsolatedWorker(new URL('./import-worker.mjs',import.meta.url)),setTimer=setTimeout,clearTimer=clearTimeout}={}) {
  let worker,timer,done=false,rejectTask;
  function finish(error,result){if(done)return;done=true;clearTimer(timer);worker?.terminate();worker?.releaseIsolation?.();worker=null;if(error)rejectTask(error);else resolveTask(result);}
  let resolveTask;
  const promise=new Promise((resolve,reject)=>{resolveTask=resolve;rejectTask=reject;});
  try{
    worker=createWorker();
    worker.onmessage=event=>{const message=event.data;if(!message||typeof message!=='object')return finish(Error('Invalid import worker response.'));if(message.type==='progress'){onProgress(message);return;}if(message.type==='result')finish(null,message.result);else finish(Error(typeof message.error==='string'?message.error.slice(0,500):'Could not read this file.'));};
    worker.onerror=event=>{event.preventDefault?.();finish(Error('The isolated file reader failed. Your current structure has been kept.'));};
    worker.onmessageerror=()=>finish(Error('Invalid file reader response.'));
    timer=setTimer(()=>finish(Error('File reading exceeded its time limit. Use a smaller file or the CIF.')),milliseconds);
    worker.postMessage({kind,payload},transfer);
  }catch{finish(Error('An isolated file reader could not start. Use a supported, up-to-date browser.'));}
  return {promise,cancel(){finish(new DOMException('Import cancelled.','AbortError'));}};
}

import {Worker} from 'node:worker_threads';
const worker=new Worker(new URL('./fuzz-import-worker.mjs',import.meta.url),{resourceLimits:{maxOldGenerationSizeMb:128,stackSizeMb:4}});
const timer=setTimeout(()=>{console.error('Fuzz run exceeded 30 seconds.');void worker.terminate();process.exitCode=1;},30000);
worker.on('message',result=>{console.log(JSON.stringify(result));clearTimeout(timer);});
worker.on('error',error=>{clearTimeout(timer);console.error(error);process.exitCode=1;});
worker.on('exit',code=>{clearTimeout(timer);if(code)process.exitCode=1;});

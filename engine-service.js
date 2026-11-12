/* Stockfish.js 19 worker wrapper. The original engine files are unmodified and licensed GPLv3. */
(function(root){
'use strict';
class EngineService{
 constructor(){this.worker=null;this.mode='none';this.ready=false;this.pending=null;this.waiting=null;this.queue=Promise.resolve();this.lastError='';this.loading=false;this.onState=()=>{};this.generation=0;}
 static canFull(){return !root.CHESS_ACADEMY_LITE_ONLY&&typeof crossOriginIsolated!=='undefined'&&crossOriginIsolated&&typeof SharedArrayBuffer!=='undefined';}
 getStatus(){return {mode:this.mode,ready:this.ready,loading:this.loading,canFull:EngineService.canFull(),error:this.lastError};}
 _state(){try{this.onState(this.getStatus());}catch(e){}}
 async start(mode='lite'){
  if(mode==='full'&&!EngineService.canFull())throw Error('Full Stockfish requires cross-origin isolation. Use Lite, or start the included Python server.');
  if(this.ready&&this.mode===mode)return;
  if(this.loading&&this.waiting)return this.waiting;
  this.stop();const generation=this.generation;this.mode=mode;this.loading=true;this.lastError='';this._state();
  const basename=mode==='full'?'stockfish-19':'stockfish-19-lite-single';
  const script=new URL(`engine/${basename}.js`,location.href);
  const wasm=new URL(`engine/${basename}.wasm`,location.href);
  script.hash=encodeURIComponent(wasm.href);
  this.waiting=new Promise((resolve,reject)=>{
   let isSettled=false;
   const timer=setTimeout(()=>{if(isSettled)return;isSettled=true;this.lastError='Stockfish initialization timed out.';this.stop();reject(Error('Stockfish initialization timed out.'));},mode==='full'?100000:25000);
   const success=()=>{if(isSettled||generation!==this.generation)return;isSettled=true;clearTimeout(timer);this.ready=true;this.loading=false;this.waiting=null;this._state();resolve();};
   const fail=(err)=>{if(isSettled)return;isSettled=true;clearTimeout(timer);this.lastError=String(err?.message||err);this.ready=false;this.loading=false;this.waiting=null;this._state();reject(err);};
   try{
    this.worker=new Worker(script.href);
    this.worker.onmessage=e=>{
     const value=e.data;if(typeof value!=='string')return;
     if(value==='uciok'){this.send('isready');return;}
     if(value==='readyok'){success();return;}
     if(this.pending){
      if(value.startsWith('info depth ')){
       const depth=Number(value.match(/\bdepth (\d+)/)?.[1]||0);
       const cp=value.match(/\bscore (cp|mate) (-?\d+)/);
       const pv=value.match(/\bpv (.+)$/);
       if(cp&&(!this.pending.info||depth>=this.pending.info.depth)){
        this.pending.info={depth,scoreType:cp[1],score:Number(cp[2]),pv:pv?pv[1].split(' '):[]};
        if(this.pending.onProgress)this.pending.onProgress(this.pending.info);
       }
      }
      if(value.startsWith('bestmove ')){
       const request=this.pending;this.pending=null;clearTimeout(request.timer);
       request.resolve({...request.info,bestmove:value.split(/\s+/)[1],mode:this.mode});
      }
     }
    };
    this.worker.onerror=e=>{fail(Error('Engine worker failed: '+(e.message||'unknown error')));if(this.pending){clearTimeout(this.pending.timer);this.pending.reject(Error('Stockfish stopped.'));this.pending=null;}};
    this.send('uci');
   }catch(err){fail(err);}
  });
  return this.waiting;
 }
 send(line){if(this.worker)this.worker.postMessage(line);}
 async analyze(fen,{depth=11,movetime=220,onProgress=null}={}){
  const run=async()=>{
   if(!this.ready)await this.start(this.mode==='full'?'full':'lite');
   if(!this.worker)throw Error('Stockfish is not running.');
   return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{const old=this.pending;this.pending=null;if(old){this.send('stop');reject(Error('Engine search timed out.'));}},Math.max(30000,movetime*5));
    this.pending={resolve,reject,info:null,onProgress,timer};
    this.send('position fen '+fen);this.send(`go depth ${Math.min(20,Math.max(1,depth|0))} movetime ${Math.min(5000,Math.max(50,movetime|0))}`);
   });
  };
  const result=this.queue.then(run,run);this.queue=result.catch(()=>{});return result;
 }
 async bestmove(fen,depth=5){const a=await this.analyze(fen,{depth,movetime:180});return a.bestmove;}
 stop(){this.generation++;if(this.pending){clearTimeout(this.pending.timer);this.pending.reject(Error('Engine stopped.'));this.pending=null;}if(this.worker){try{this.worker.terminate();}catch(e){}}this.worker=null;this.ready=false;this.loading=false;this.waiting=null;this.queue=Promise.resolve();this._state();}
}
root.EngineService=EngineService;
})(window);

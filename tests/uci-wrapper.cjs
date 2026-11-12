/* Verify the app's Stockfish wrapper using real, supplied UCI engine and a Node CLI-backed Worker surrogate.
   The browser Web Worker / WASM fetch path still needs actual browser QA. */
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
global.window=global;global.location={href:'http://localhost:8765/index.html'};
global.crossOriginIsolated=false;
class CLIWorker{
 constructor(url){const base=new URL(url).pathname.split('/').pop();this.proc=spawn(process.execPath,[path.join(root,'engine',base)],{stdio:['pipe','pipe','pipe']});this.buf='';this.proc.stdout.on('data',data=>{this.buf+=data.toString();let n;while((n=this.buf.indexOf('\n'))>=0){let line=this.buf.slice(0,n).trim();this.buf=this.buf.slice(n+1);if(line)this.onmessage?.({data:line});}});this.proc.on('error',e=>this.onerror?.(e));}
 postMessage(line){this.proc.stdin.write(line+'\n')}
 terminate(){this.proc.kill('SIGTERM')}
}
global.Worker=CLIWorker;
require('../engine-service.js');
(async()=>{const e=new global.EngineService();await e.start('lite');assert.equal(e.ready,true);const out=await e.analyze('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',{depth:6,movetime:180});assert(/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(out.bestmove),out.bestmove);assert(out.depth>=1);console.log('PASS UCI wrapper actual engine, bestmove',out.bestmove,'depth',out.depth,'score',out.score);e.stop();})().catch(e=>{console.error(e);process.exitCode=1});

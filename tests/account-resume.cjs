/* Regression: deliberate first sync, safe auto-resume, external changes, local conflicts. */
const assert=require('node:assert/strict');
const storage={};
global.window=global;
global.localStorage={
 getItem:key=>storage[key]??null,
 setItem:(key,value)=>{storage[key]=String(value)},
 removeItem:key=>{delete storage[key]}
};
let device={version:2,mastered:{1:true},review:{},placement:{correct:23,total:27}};
const user={id:'practice-account',email:'student@example.com'};
let remote=null,listener=null;
const q=(action,changes)=>{
 let id=null,revision=null;
 const chain={
  select(){return this;},
  eq(k,v){if(k==='user_id')id=v;if(k==='revision')revision=v;return this;},
  async maybeSingle(){return answer();},
  async single(){return answer();}
 };
 function answer(){
  if(action==='read')return {data:remote,error:null};
  if(action==='insert'){remote={...changes,updated_at:new Date().toISOString()};return {data:remote,error:null};}
  if(!remote||revision!==remote.revision||id!==user.id)return {data:null,error:null};
  remote={...remote,...changes};return {data:remote,error:null};
 }
 return chain;
};
global.CHESS_ACADEMY_SUPABASE={enabled:true,url:'https://demo.supabase.co',publishableKey:'sb_publishable_0123456789abcdef01234567'};
global.supabase={createClient(){return {
 auth:{getSession:async()=>({data:{session:{user}},error:null}),onAuthStateChange:f=>{listener=f;return {data:{subscription:{unsubscribe(){}}}}}},
 from(){return {select(){return q('read')},insert:v=>q('insert',v),update:v=>q('update',v)}}
};}};
global.location={origin:'https://leaf6433.github.io',pathname:'/chess-academy/'};
function reload(){
 delete require.cache[require.resolve('../account-client.js')];
 return require('../account-client.js');
}
const setup=async()=>{
 const app=reload();
 await app.init({getData:()=>device,applyData:d=>{device=d}});
 return app;
};
(async()=>{
 let a=await setup();
 assert.equal(a.state.status,'choose','First sign-in requires explicit choice');
 await a.uploadDevice();
 assert.equal(a.state.status,'ready');
 assert(storage['chess.academy.cloud.known-v1'],'Trusted sync marker saved');
 a=await setup();
 assert.equal(a.state.status,'ready','Return on known device should resume without prompt');
 assert.equal(a.state.selected,true);
 // A newer server copy is safe to adopt only if this device has no uncommitted edits.
 remote={...remote,revision:remote.revision+1,payload:{version:2,mastered:{1:true,2:true},review:{},placement:{correct:23,total:27}}};
 a=await setup();
 assert.equal(a.state.status,'ready');
 assert(device.mastered[2], 'Remote progress adopted when local copy matches last sync');
 // Divergent progress on both sides must not be replaced.
 device.mastered[3]=true;
 remote={...remote,revision:remote.revision+1,payload:{version:2,mastered:{1:true,2:true,4:true},review:{},placement:{correct:23,total:27}}};
 a=await setup();
 assert.equal(a.state.status,'choose');
 assert(device.mastered[3]);
 assert(!device.mastered[4],'Remote data must not overwrite unsynced changes');
 console.log('PASS: persistent login sync, safe remote refresh, divergent progress conflict');
})().catch(error=>{console.error(error);process.exitCode=1;});

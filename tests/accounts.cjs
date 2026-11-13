/* Unit-level tests for optional account client. Real Supabase RLS/auth tests require a configured project. */
const assert=require('node:assert/strict');
const originalWindow=global.window;
let local={version:2,mastered:{1:{score:2}},review:{},placement:{correct:23,total:27}};
const records=new Map();
let listener=null,session=null;
function query(op,body){
 let matchUser=null,matchRev=null;
 const builder={
  select(){return this;},
  eq(col,value){if(col==='user_id')matchUser=value;else if(col==='revision')matchRev=value;return this;},
  async maybeSingle(){return response(false);},
  async single(){return response(true);}
 };
 function response(required){
  if(op==='read'){const existing=records.get(matchUser);return {data:existing||null,error:required&&!existing?{message:'No row'}:null};}
  if(op==='insert'){
   if(records.has(body.user_id))return {data:null,error:{message:'Duplicate row'}};
   const row={...body,updated_at:new Date().toISOString()};
   records.set(body.user_id,row);return {data:row,error:null};
  }
  const row=records.get(matchUser);
  if(!row||row.revision!==matchRev)return {data:null,error:required?{message:'Revision mismatch'}:null};
  const updated={...row,...body};records.set(matchUser,updated);return {data:updated,error:null};
 }
 return builder;
}
const client={
 from(){return {
  select(){return query('read');},
  insert(body){return query('insert',body);},
  update(body){return query('update',body);}
 };},
 auth:{
  onAuthStateChange(fn){listener=fn;return {data:{subscription:{unsubscribe(){}}}};},
  async getSession(){return {data:{session},error:null};},
  async signUp({email}){session={user:{id:'user-1',email}};listener?.('SIGNED_IN',session);return {data:{session},error:null};},
  async signInWithPassword({email}){session={user:{id:'user-1',email}};listener?.('SIGNED_IN',session);return {data:{session},error:null};},
  async resetPasswordForEmail(){return {error:null};},
  async updateUser(){return {error:null};},
  async signOut(){session=null;listener?.('SIGNED_OUT',null);return {error:null};}
 }
};
global.window={
 CHESS_ACADEMY_SUPABASE:{enabled:true,url:'https://demo.supabase.co',publishableKey:'sb_publishable_0123456789abcdef01234567'},
 supabase:{createClient(){return client;}},
 location:{origin:'https://leaf6433.github.io',pathname:'/chess-academy/'}
};
const accounts=require('../account-client.js');
const flush=async()=>{for(let i=0;i<5;i++)await new Promise(resolve=>setImmediate(resolve));};
(async()=>{
 await accounts.init({getData:()=>local,applyData:next=>{local=next;}});
 assert.equal(accounts.state.status,'signed-out');
 await accounts.signUp('test@example.com','a long password');
 await flush();
 assert.equal(accounts.state.user.id,'user-1');
 assert.equal(accounts.state.status,'choose');
 assert.equal(accounts.state.remote,null);
 await accounts.uploadDevice();
 assert.equal(accounts.state.status,'ready');
 assert.deepEqual(records.get('user-1').payload.placement,{correct:23,total:27});
 assert.deepEqual(records.get('user-1').payload.mastered,local.mastered);
 // Simulated other browser updates the cloud. Loading should only happen on explicit action.
 records.set('user-1',{...records.get('user-1'),revision:2,payload:{version:2,mastered:{2:{score:2}},review:{},placement:null}});
 assert(local.mastered[1],'local data was silently overwritten');
 await accounts.useCloud();
 assert(local.mastered[2],'explicit cloud load failed');
 assert(!local.mastered[1],'explicit cloud load did not replace');
 assert.equal(accounts.state.remote.revision,2);
 // Simulated concurrent update; stale autosave must not overwrite it.
 records.set('user-1',{...records.get('user-1'),revision:3});
 local.mastered[3]={score:2};
 accounts.changed();
 await new Promise(resolve=>setTimeout(resolve,1550));
 assert.equal(accounts.state.status,'conflict');
 assert.equal(records.get('user-1').revision,3);
 assert(local.mastered[3],'local progress was not preserved after conflict');
 await accounts.signOut();await flush();
 assert.equal(accounts.state.user,null);
 assert(local.mastered[3],'sign out unexpectedly erased local progress');
 console.log('PASS: signup/login state, deliberate initial upload, deliberate cloud load, revision conflict, sign out');
})().catch(err=>{console.error(err);process.exitCode=1;}).finally(()=>{global.window=originalWindow;});

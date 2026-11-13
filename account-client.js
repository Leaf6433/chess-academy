/* Optional Supabase-backed authentication and cloud progress.
   Auth is disabled until supabase-config.js contains a project's public credentials.
   The local course works without any network connection or cloud account. */
(function (root) {
  'use strict';
  const cfg = root.CHESS_ACADEMY_SUPABASE || {};
  const valid = cfg.enabled === true &&
    /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(cfg.url || '') &&
    /^(sb_publishable_|eyJ)[A-Za-z0-9._-]{12,}$/.test(cfg.publishableKey || '');
  const state = {available: false, user: null, remote: null, selected: false, status: 'off', message: '', saving: false, recovery: false};
  let client = null, notify = () => {}, applyData = () => {}, getData = () => null, pending = null, suppress = false;
  const email = () => state.user && state.user.email || '';
  const SYNC_KEY='chess.academy.cloud.known-v1';
  const snapshot=()=>JSON.stringify(getData());
  function trusted(){try{return JSON.parse(root.localStorage?.getItem(SYNC_KEY)||'null');}catch(e){return null;}}
  function remember(){if(!state.user||!state.remote)return;try{root.localStorage?.setItem(SYNC_KEY,JSON.stringify({userId:state.user.id,revision:state.remote.revision,data:snapshot()}));}catch(e){}}
  function clearKnown(){try{root.localStorage?.removeItem(SYNC_KEY);}catch(e){}}

  function announce(status, message = '') {state.status = status;state.message = message;notify();}
  function errorMessage(error) {return String(error?.message || error || 'An unexpected error occurred.').slice(0, 260);}
  function copyPayload() {return JSON.parse(JSON.stringify(getData()));}
  function configReady() {return valid && !!root.supabase?.createClient;}
  function assertAuth() {if (!client || !state.user) throw Error('Sign in to a configured account first.');}
  function ensureRevision(row) {
    if(!row)return null;
    if(!Number.isInteger(row.revision) || row.revision < 1 || !row.payload || row.payload.version !== 2)throw Error('Cloud progress is not a supported Chess Academy backup.');
    return row;
  }
  async function refreshRemote() {
    assertAuth();
    const uid = state.user.id;
    const {data, error} = await client.from('chess_academy_progress').select('user_id,payload,revision,updated_at').eq('user_id',uid).maybeSingle();
    if(error)throw error;
    if(state.user?.id !== uid)return;
    state.remote=ensureRevision(data);
    return state.remote;
  }
  async function authChanged(event, session) {
    if (event === 'PASSWORD_RECOVERY') state.recovery = true;
    const next = session?.user || null;
    if (next?.id === state.user?.id && event !== 'SIGNED_IN' && event !== 'INITIAL_SESSION')return;
    if (!next) {
      state.user=null;state.remote=null;state.selected=false;
      if(pending)clearTimeout(pending);pending=null;state.recovery=false;
      announce('signed-out');return;
    }
    if (next.id !== state.user?.id) {state.selected=false;state.remote=null;pending=null;}
    state.user = next;
    announce('loading','Checking cloud progress…');
    try {
      await refreshRemote();if(state.user?.id !== next.id)return;
      const mark=trusted();
      // A previously chosen device/account pair can resume automatically when
      // it is unchanged locally. New accounts and unsynced local edits require choice.
      if(state.remote&&mark?.userId===next.id&&mark.data===snapshot()){
        if(state.remote.revision!==mark.revision){
          suppress=true;try{applyData(JSON.parse(JSON.stringify(state.remote.payload)));}finally{suppress=false;}
        }
        state.selected=true;remember();announce('ready','Cloud progress connected. Changes sync automatically.');
      }else announce(state.selected?'ready':'choose',state.remote?'Choose which progress to keep.':'No cloud progress exists yet. You can upload this device.');
    }
    catch(err) {if(state.user?.id === next.id)announce('error', 'Could not load cloud progress: '+errorMessage(err));}
  }
  async function init(callbacks={}) {
    notify = callbacks.onChange || notify;
    applyData = callbacks.applyData || applyData;
    getData = callbacks.getData || getData;
    if (!valid){announce('off','Accounts need a connected Supabase project. Local saving still works.');return;}
    if (!configReady()){announce('unavailable','Supabase library could not load. Check your connection.');return;}
    try {
      client=root.supabase.createClient(cfg.url.replace(/\/$/,''),cfg.publishableKey,{
        auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'chess-academy-supabase-session'}
      });
      state.available=true;
      client.auth.onAuthStateChange((event,session)=>{Promise.resolve().then(()=>authChanged(event,session));});
      const {data,error}=await client.auth.getSession();
      if(error)throw error;
      await authChanged('INITIAL_SESSION',data.session);
    }catch(err){announce('error', 'Unable to start accounts: '+errorMessage(err));}
  }
  async function signIn(email,password){
    if(!client)throw Error('Account service is not configured.');
    announce('loading','Signing in…');
    try{const {error}=await client.auth.signInWithPassword({email,password});if(error)throw error;announce('loading','Checking your saved progress…');}
    catch(err){announce('signed-out',errorMessage(err));}
  }
  async function signUp(email,password) {
    if(!client)throw Error('Account service is not configured.');
    announce('loading','Creating your account…');
    try {
      const {data,error}=await client.auth.signUp({email,password,options:{emailRedirectTo:root.location.origin+root.location.pathname}});
      if(error)throw error;
      announce(data.session?'loading':'signed-out',data.session?'Signing in…':'Check your email for an account confirmation link before signing in.');
    }catch(err){announce('signed-out',errorMessage(err));}
  }
  async function resetPassword(email){
    if(!client)throw Error('Account service is not configured.');
    try{const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:root.location.origin+root.location.pathname});if(error)throw error;announce('signed-out','If this email has an account, a password reset email has been requested.');}
    catch(err){announce('signed-out',errorMessage(err));}
  }
  async function updatePassword(newPassword) {
    if(!client||!state.user)throw Error('Sign in before setting a new password.');
    try{const {error}=await client.auth.updateUser({password:newPassword});if(error)throw error;state.recovery=false;announce(state.selected?'ready':'choose','Password updated.');}
    catch(err){announce('error',errorMessage(err));}
  }
  async function signOut(){if(!client)return;try{if(pending)clearTimeout(pending);pending=null;clearKnown();const {error}=await client.auth.signOut();if(error)throw error;announce('signed-out','Signed out. Device progress was not erased.');}catch(err){announce('error',errorMessage(err));}}
  async function useCloud(){
    try{
      assertAuth();
      const row=await refreshRemote();
      if(!row){announce('choose','There is no cloud progress yet. Upload this device to initialize it.');return;}
      const incoming=JSON.parse(JSON.stringify(row.payload));
      suppress=true;
      try{applyData(incoming);}finally{suppress=false;}
      state.selected=true;remember();
      announce('ready','Cloud progress loaded onto this device. Automatic sync is on.');
    }catch(err){announce('error',errorMessage(err));}
  }
  async function uploadDevice(){
    try{
      assertAuth();if(state.saving)return;
      state.saving=true;announce('syncing','Saving your progress…');
      // Verify the latest revision before each explicit overwrite.
      const row=await refreshRemote();
      const snapshot=copyPayload();
      if(!snapshot || snapshot.version !== 2)throw Error('Invalid device progress data.');
      let result;
      if(!row)result=await client.from('chess_academy_progress').insert({user_id:state.user.id,payload:snapshot,revision:1}).select('user_id,payload,revision,updated_at').single();
      else result=await client.from('chess_academy_progress').update({payload:snapshot,revision:row.revision+1,updated_at:new Date().toISOString()}).eq('user_id',state.user.id).eq('revision',row.revision).select('user_id,payload,revision,updated_at').maybeSingle();
      if(result.error)throw result.error;
      if(!result.data){state.selected=false;announce('conflict','Cloud progress changed on another device. Choose which version to keep.');return;}
      state.remote=ensureRevision(result.data);state.selected=true;remember();announce('ready','Saved in your account. Automatic sync is on.');
    }catch(err){state.selected=false;announce('error','Cloud upload failed: '+errorMessage(err));}
    finally{state.saving=false;}
  }
  async function autosave(){
    pending=null;
    if(!state.selected||!state.user||!state.remote||state.saving||suppress||!client)return;
    state.saving=true;
    const old=state.remote;
    const userId=state.user.id;
    const local=copyPayload();
    try{
      const {data,error}=await client.from('chess_academy_progress').update({payload:local,revision:old.revision+1,updated_at:new Date().toISOString()}).eq('user_id',userId).eq('revision',old.revision).select('user_id,payload,revision,updated_at').maybeSingle();
      if(error)throw error;
      if(!data){state.selected=false;announce('conflict','Cloud data changed on another device. Your local progress is safe. Choose which copy to keep.');return;}
      if(state.user?.id!==userId)return;
      state.remote=ensureRevision(data);remember();announce('ready','Synced just now.');
      // If the learner saved again during this request, sync that latest snapshot too.
      if(JSON.stringify(getData())!==JSON.stringify(local))changed();
    }catch(err){announce('error','Progress remains saved on this device. Cloud sync failed: '+errorMessage(err));}
    finally{state.saving=false;}
  }
  function changed(){
    if(!state.selected||suppress||!state.user||!state.remote)return;
    if(pending)clearTimeout(pending);
    pending=setTimeout(autosave,1300);
  }
  root.addEventListener?.('online',()=>{if(state.selected)changed();});
  const api={state,init,signIn,signUp,signOut,resetPassword,updatePassword,useCloud,uploadDevice,changed,email};
  root.ChessAcademyAccounts=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

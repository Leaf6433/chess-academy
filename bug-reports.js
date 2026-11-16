/* Private, account-backed reports. No AI requests or automatic code changes. */
(function(root){
'use strict';
const state={uid:null,title:'',description:'',screenshot:null,context:{},rows:[],detail:null,admin:false,busy:false,message:''};
const safeImage=value=>typeof value==='string'&&value.length<=1500000&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value);
function account(){const a=root.ChessAcademyAccounts;if(!a?.state.user||!a.getClient?.())throw Error('Sign in through Settings to submit and view saved reports.');return {client:a.getClient(),uid:a.state.user.id};}
function sync(){const uid=root.ChessAcademyAccounts?.state.user?.id||null;if(state.uid!==uid){if(state.uid){state.title='';state.description='';state.screenshot=null;}Object.assign(state,{uid,rows:[],detail:null,admin:false,message:'',pendingId:null});}}
function validate(title,description,image){if(title.trim().length<3||title.trim().length>120)throw Error('Use a short title of 3–120 characters.');if(description.trim().length<10||description.trim().length>5000)throw Error('Describe the problem in 10–5,000 characters.');if(image&&!safeImage(image))throw Error('Choose a PNG, JPEG or WebP screenshot.');}
async function submit(){
 const {client,uid}=account();validate(state.title,state.description,state.screenshot);
 const id=state.pendingId||(state.pendingId=root.crypto.randomUUID());
 const row={id,title:state.title.trim(),description:state.description.trim(),context:state.context,screenshot:state.screenshot};
 const {data,error}=await client.from('chess_bug_reports').insert(row).select('id').single();
 if(error){
  if(error.code!=='23505')throw error;
  const existing=await client.from('chess_bug_reports').select('id').eq('id',id).eq('reporter_id',uid).single();
  if(existing.error||!existing.data)throw error;
 }
 if(state.uid!==uid)return;
 state.title='';state.description='';state.screenshot=null;state.pendingId=null;state.message='Report saved. Reference: '+(data?.id||id)+'.';
 await load(false);
}
async function load(clear=true){
 const {client,uid}=account();
 const [rows,role]=await Promise.all([client.from('chess_bug_reports').select('id,title,description,context,status,created_at,reporter_id').order('created_at',{ascending:false}).limit(100),client.from('chess_bug_reviewers').select('user_id').eq('user_id',uid)]);
 if(rows.error)throw rows.error;if(role.error)throw role.error;
 if(state.uid!==uid)return;
 state.rows=rows.data||[];state.admin=!!role.data?.length;if(clear)state.message='Loaded '+state.rows.length+' reports'+(state.admin?' from all reporters.':' submitted by you.');
}
async function detail(id){const {client,uid}=account();const {data,error}=await client.from('chess_bug_reports').select('*').eq('id',id).single();if(error)throw error;if(state.uid===uid)state.detail=data;}
async function status(id,value){if(!['open','reviewed','resolved','needs_approval'].includes(value))throw Error('Invalid status.');const {client}=account();const {data,error}=await client.from('chess_bug_reports').update({status:value}).eq('id',id).select('id').single();if(error)throw error;if(!data)throw Error('Only the report reviewer can change status.');await load();await detail(id);}
async function image(file){
 if(!file){state.screenshot=null;state.pendingId=null;return;}
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>10*1024*1024)throw Error('Choose a PNG, JPEG or WebP image smaller than 10 MB.');
 const bitmap=await root.createImageBitmap(file);
 try{const scale=Math.min(1,1280/Math.max(bitmap.width,bitmap.height)),canvas=root.document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);const value=canvas.toDataURL('image/jpeg',.8);if(!safeImage(value))throw Error('This screenshot is too large. Try cropping it first.');state.screenshot=value;state.pendingId=null;}finally{bitmap.close();}
}
function exportList(){const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),reports:state.rows},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=root.document.createElement('a');link.href=url;link.download='Chess-Academy-bug-reports-'+new Date().toISOString().slice(0,10)+'.json';root.document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
root.BugReports={state,sync,validate,safeImage,submit,load,detail,status,image,exportList};
if(typeof module!=='undefined')module.exports=root.BugReports;
})(typeof window!=='undefined'?window:globalThis);

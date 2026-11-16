const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
let failure=false,inserted,uid='reporter',rows=[];
const client={from(table){return {insert(row){inserted=row;return {select(){return {async single(){return failure?{error:{message:'Offline'}}:{data:{id:row.id}};}}}}},select(){return {order(){return {async limit(){return {data:rows}}}},async eq(){return {data:[]}}}}}}};
const root={crypto:{randomUUID:()=> 'a6111616-1111-4111-8111-111111111111'},ChessAcademyAccounts:{state:{user:{id:uid}},getClient:()=>client}};
root.window=root;vm.createContext(root);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../bug-reports.js'),'utf8'),root);
const B=root.BugReports;B.sync();
assert.throws(()=>B.validate('a','too short',null));assert.throws(()=>B.validate('Valid','Long enough description','data:image/svg+xml;base64,abc'));
assert(B.safeImage('data:image/png;base64,aGVsbG8='));assert(!B.safeImage('https://example.com/track.png'));
(async()=>{
 Object.assign(B.state,{title:'Wrong position',description:'The black king starts on the wrong square.',screenshot:'data:image/png;base64,aGVsbG8=',context:{lesson:3}});
 failure=true;await assert.rejects(()=>B.submit());assert.equal(B.state.title,'Wrong position','Failed submissions keep the draft');assert(B.state.screenshot);
 failure=false;await B.submit();assert.equal(inserted.context.lesson,3);assert(inserted.screenshot);assert(!('reporter_id' in inserted),'Reporter identity is assigned by database');assert.equal(B.state.description,'');assert(B.state.message.includes('Report saved'));
 B.state.rows=[{title:'Private'}];B.state.description='Private draft';root.ChessAcademyAccounts.state.user=null;B.sync();assert.equal(B.state.rows.length,0);assert.equal(B.state.description,'','Sign-out removes prior account drafts');
 console.log('PASS: private bug report validation, screenshot restrictions, failed-draft retention, submission payload and sign-out isolation');
})().catch(e=>{console.error(e);process.exitCode=1});

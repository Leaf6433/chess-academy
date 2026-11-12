/* Headless DOM-event and state-transition smoke tests. No browser required. */
const assert=require('node:assert/strict');
const path=require('node:path');
const elements=new Map();
const app={innerHTML:''}; elements.set('app',app);
const callbacks={};
const store={};
global.window=global;
global.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v}};
global.location={href:'http://localhost:8765/index.html'};
global.navigator={};
global.document={getElementById(id){return elements.get(id)||null;},addEventListener(name,fn){callbacks[name]=fn;}};
global.scrollTo=()=>{};
require('../chess-engine.js');require('../course-data-v2.js');
global.EngineService=class {constructor(){this.mode='lite';this.ready=true;this.onState=()=>{}}start(){return Promise.resolve()}getStatus(){return {mode:'lite',ready:true,loading:false,canFull:false,error:''}}stop(){}analyze(fen){return Promise.resolve({bestmove:'e2e4',scoreType:'cp',score:0,depth:5,pv:['e2e4'],mode:'lite'})}bestmove(){return Promise.resolve('e7e5')}};
require('../app.js');
const t=global.__CHESS_ACADEMY_TEST__;
function press(action,props={}) {callbacks.click({preventDefault(){},target:{closest(sel){if(sel==='[data-sq]')return null;return {dataset:{action,...props}};}}});}
function nav(page,id=null){t.nav(page,id);}
function move(uci){const s=t.ui.board.history.at(-1),m=t.C.fromUci(s,uci);assert(m,'legal move '+uci);const from=m[0],to=m[1];for(const n of [from,to])callbacks.click({preventDefault(){},target:{closest(sel){return sel==='[data-sq]'?{dataset:{sq:String(n)}}:null;}}});}
assert(app.innerHTML.includes('Chess Academy'));
assert(t.D.lessons.length===40&&t.D.exercises.length===121);
nav('lesson',1);assert.equal(t.ui.page,'lesson');
press('board-next');assert.equal(t.ui.board.moves.length,1);press('board-back');assert.equal(t.ui.board.moves.length,0);
press('board-next');assert.equal(t.ui.board.moves[0],'e2e4');
nav('curriculum');assert(app.innerHTML.includes('Your curriculum'));
nav('lesson',1);
press('start-mastery');assert.equal(t.ui.exam.kind,'mastery');
for(const q of t.ui.exam.items){
 assert.equal(t.ui.exam.items[t.ui.exam.index].id,q.id);
 if(q.kind==='mc')press('exam-choice',{choice:String(q.answer)});
 else move(q.answer);
 assert.equal(t.ui.exam.answered,true);
 press('exam-next');
}
assert(t.data.mastered[1]);assert(t.ui.exam.passed);nav('curriculum');
assert(app.innerHTML.includes('Mastered'));
// Verify opening recall branches for both colors.
for(const [id,side] of [['italian',1],['caro',-1]]){
 nav('openings');press('select-opening',{opening:id});press('start-opening-drill');
 const b=t.ui.board;assert.equal(t.ui.openingPhase,'drill');assert.equal(t.ui.playSide,side);
 const seq=b.sequence.map(x=>x[0]);
 while(b.moves.length<seq.length){move(seq[b.moves.length]);}
 assert.equal(b.moves.length,seq.length);assert.equal(t.data.openingDrills[id].clean,1);
}
// Revisit starts new run.
press('start-opening-drill');assert.equal(t.ui.board.kind,'opening-drill');
press('exit-opening-drill');assert.equal(t.ui.board.kind,'opening');
// PGN parser including variation and comments.
const g=t.getGameMoves('[Event "Test"]\n1.e4 e5 2.Nf3 {notes} Nc6 (2... Nf6) 3.Bc4 Bc5 *');assert.equal(g.moves.length,6);assert.equal(g.tags.Event,'Test');
nav('analyze');assert(app.innerHTML.includes('Import a PGN'));
// Practice with shuffled answer order, selecting the true original answer.
nav('practice');const q=t.D.exercises.find(x=>x.kind==='mc');press('open-question',{qid:q.id});assert.equal(t.ui.practiceOptionOrder.length,q.options.length);press('choose-question',{choice:String(q.answer)});assert.equal(t.ui.feedbackGood,true);
nav('practice','due');assert.equal(t.ui.filter,'due');
nav('settings');assert(app.innerHTML.includes('Export progress'));
nav('progress');assert(app.innerHTML.includes('Course mastery by module'));
console.log('PASS: page navigation, mastery unlocking, exercise grading, 2 opening recall drills, PGN parsing, progress, review, settings');

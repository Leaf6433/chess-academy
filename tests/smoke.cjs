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
require('../chess-engine.js');require('../course-data-v2.js');require('../foundation-drills.js');
global.EngineService=class {constructor(){this.mode='lite';this.ready=true;this.onState=()=>{}}start(){return Promise.resolve()}getStatus(){return {mode:'lite',ready:true,loading:false,canFull:false,error:''}}stop(){}analyze(fen){return Promise.resolve({bestmove:'e2e4',scoreType:'cp',score:0,depth:5,pv:['e2e4'],mode:'lite'})}bestmove(){return Promise.resolve('e7e5')}};
require('../app.js');
const t=global.__CHESS_ACADEMY_TEST__;
function press(action,props={}) {callbacks.click({preventDefault(){},target:{closest(sel){if(sel==='[data-sq]')return null;return {dataset:{action,...props}};}}});}
function nav(page,id=null){t.nav(page,id);}
function move(uci){const s=t.ui.board.history.at(-1),m=t.C.fromUci(s,uci);assert(m,'legal move '+uci);const from=m[0],to=m[1];for(const n of [from,to])callbacks.click({preventDefault(){},target:{closest(sel){return sel==='[data-sq]'?{dataset:{sq:String(n)}}:null;}}});}
assert(app.innerHTML.includes('Chess Academy'));

assert(t.D.lessons.length===40&&t.D.exercises.length===121);
nav('lesson',1);assert.equal(t.ui.page,'lesson');assert(app.innerHTML.includes('assets/pieces.svg#wK'));assert(app.innerHTML.includes('assets/pieces.svg#bK'));
assert(app.innerHTML.includes('quick guide'),'Each lesson has a notation guide');
assert(app.innerHTML.includes('Practice these positions'),'Every lesson offers a guided practice step');
press('lesson-phase',{phase:'practice'});
assert(app.innerHTML.includes('YOUR PRACTICE PLAN'));
const firstLessonQuestion=t.D.lessons.find(x=>x.id===1).exercises[0];
press('open-question',{qid:firstLessonQuestion.id});
assert.equal(t.ui.practiceOrigin,'lesson');
assert.equal(t.ui.practiceId,firstLessonQuestion.id);
if(firstLessonQuestion.kind==='mc')press('choose-question',{choice:String(firstLessonQuestion.answer)});
else move(firstLessonQuestion.answer);
assert(app.innerHTML.includes('Next practice position'),'Correct feedback should guide to the next lesson position');
press('return-lesson-practice',{id:'1'});
assert.equal(t.ui.page,'lesson');
assert.equal(t.ui.phase,'practice');
assert(app.innerHTML.includes('YOUR PRACTICE PLAN'));
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

// Beginner training (preserves the 121 original course exercises).
assert.equal(global.FOUNDATION_DRILLS.length,14);
assert(global.FOUNDATION_DRILLS.filter(q=>q.kind==='board').length>=2);
assert.equal(new Set(global.FOUNDATION_DRILLS.map(q=>q.id)).size,14);
for(const q of global.FOUNDATION_DRILLS){
 if(q.kind==='mc'){assert.equal(q.options.length,4);assert(q.answer>=0&&q.answer<4);}
 else {assert.equal(q.kind,'board');assert(t.C.fromUci(t.C.parseFen(q.fen),q.answer),'legal foundation board answer');}
 t.C.parseFen(q.fen);
 assert(t.D.lessons.some(l=>l.id===q.lesson),'foundation drill has matching lesson');
}
nav('dashboard');assert(app.innerHTML.includes('Foundation training'));
assert(app.innerHTML.includes('Foundation-first track')||app.innerHTML.includes('Foundation & mastery track'));
nav('practice','foundation');
assert.equal(t.ui.filter,'foundation');
assert(app.innerHTML.includes('Practice skills that decide real games'));
assert(app.innerHTML.includes('Game 1: White to move'));
const masteryBefore=JSON.stringify(t.data.mastered);
press('open-question',{qid:'F01'});
assert.equal(t.ui.practiceId,'F01');
assert(app.innerHTML.includes('Game 1'));
press('choose-question',{choice:'1'});
assert.equal(t.ui.attemptWrong,1);
press('choose-question',{choice:'0'});
assert(t.data.practiceSolved.F01);
assert(t.data.review.F01);
assert.equal(JSON.stringify(t.data.mastered),masteryBefore,'foundation practice is not course mastery');
nav('practice','due');
assert(t.ui.page==='practice');

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
// Regression: the diagnostic must display legal move sequences without revealing answers.
t.startAssessment('placement');
const items=t.ui.exam.items;
const slavAt=items.findIndex(q=>q.id==='V30-1');
assert(slavAt>=0,'Slav question is included in placement');
t.ui.exam.index=slavAt;
const target=items[slavAt];
assert.equal(target.kind,'mc');
const question=t.D.exercises.find(q=>q.id===target.id);
assert.equal(question.prompt.includes('1.d4 d5 2.c4'),true);
// Advance through questions to initialize the preview using the normal page transition.
t.startAssessment('placement');
for(let i=0;i<slavAt;i++){const q=t.ui.exam.items[t.ui.exam.index];if(q.kind==='mc')press('exam-choice',{choice:String(q.answer)});else move(q.answer);press('exam-next');}
assert.equal(t.ui.exam.items[t.ui.exam.index].id,'V30-1');
assert.deepEqual(t.ui.preview.moves,['d2d4','d7d5','c2c4']);
assert.equal(t.ui.preview.index,3);
assert(app.innerHTML.includes('POSITION REPLAY'));
assert(!app.innerHTML.includes('Replay only the answer'));
press('preview-back');assert.equal(t.ui.preview.index,2);
press('preview-start');assert.equal(t.ui.preview.index,0);
press('preview-end');assert.equal(t.ui.preview.index,3);
press('preview-jump',{ply:'1'});assert.equal(t.ui.preview.index,1);
assert.equal(t.ui.exam.answered,null,'Preview does not submit an answer');
press('exam-choice',{choice:String(target.answer)});assert.equal(t.ui.exam.answered,true);
// Placement credit does not imply study, completion, or mastery.
assert.equal(t.data.mastered[2],undefined);
t.data.placementCredit[2]={at:Date.now()};
assert.equal(t.data.studied[2],undefined);
assert.equal(t.data.completed[2],undefined);
nav('curriculum');assert(app.innerHTML.includes('Placement credit · not studied'));
nav('lesson',2);assert.equal(t.data.studied[2],undefined,'Opening a lesson alone must not mark it studied');
press('lesson-phase',{phase:'practice'});assert(t.data.studied[2],'Entering practice marks study');

console.log('PASS: page navigation, mastery unlocking, exercise grading, 2 opening recall drills, PGN parsing, progress, review, settings');

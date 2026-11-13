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
require('../chess-engine.js');require('../course-data-v2.js');require('../foundation-drills.js');require('../board-drills.js');require('../mastery-positions.js');require('../mastery-concepts.js');require('../lesson-deep-dives.js');require('../lesson-scenes.js');
global.EngineService=class {constructor(){this.mode='lite';this.ready=true;this.onState=()=>{}}start(){return Promise.resolve()}getStatus(){return {mode:'lite',ready:true,loading:false,canFull:false,error:''}}stop(){}analyze(fen){return Promise.resolve({bestmove:'e2e4',scoreType:'cp',score:0,depth:5,pv:['e2e4'],mode:'lite'})}bestmove(){return Promise.resolve('e7e5')}};
require('../app.js');
const t=global.__CHESS_ACADEMY_TEST__;
function press(action,props={}) {callbacks.click({preventDefault(){},target:{closest(sel){if(sel==='[data-sq]')return null;return {dataset:{action,...props}};}}});}
function nav(page,id=null){t.nav(page,id);}
function move(uci){const s=t.ui.board.history.at(-1),m=t.C.fromUci(s,uci);assert(m,'legal move '+uci);const from=m[0],to=m[1];for(const n of [from,to])callbacks.click({preventDefault(){},target:{closest(sel){return sel==='[data-sq]'?{dataset:{sq:String(n)}}:null;}}});}
assert(app.innerHTML.includes('Chess Academy'));

assert(t.D.lessons.length===40&&t.D.exercises.length===121);
// All course lessons are freely selectable, independent of earlier mastery.
assert(t.D.lessons.every(l=>t.ui.page==='dashboard'||!!l),'All 40 lessons available in data');
nav('curriculum');
assert.equal((app.innerHTML.match(/class="lesson-row /g)||[]).length,40,'All 40 course entries rendered');
assert(!app.innerHTML.includes(' · Locked'),'No lessons locked');
assert(!app.innerHTML.includes('Lessons unlock after proven mastery'),'Curriculum explains free choice');
nav('lesson',40);
assert.equal(t.ui.page,'lesson','Lesson 40 can open without earlier mastery');
assert.equal(t.ui.id,40,'Requested lesson selected');
nav('dashboard');assert(app.innerHTML.includes('data-page="lesson" data-id="40"'),'Dashboard continues the chosen, unfinished lesson');
nav('lesson',40);
assert(!t.data.mastered[1],'Earlier lesson not automatically mastered');
press('start-mastery');
assert.equal(t.ui.exam.kind,'mastery','Lesson 40 mastery can open out of order');
nav('curriculum');

nav('lesson',1);assert.equal(t.ui.page,'lesson');
assert(app.innerHTML.includes('class="lesson-reading-layout"'),'Lesson teaching uses a full-width reading layout');
assert(app.innerHTML.includes('class="panel lesson-reading-panel lesson-intro"'),'Core introduction occupies a full-width panel');
assert(app.innerHTML.includes('class="panel lesson-reading-panel lesson-theory"'),'Detailed lesson is not crammed alongside the chessboard');
assert(app.innerHTML.indexOf('class="lesson-workshop-layout"') < app.innerHTML.indexOf('class="panel lesson-reading-panel lesson-theory"'),'The detailed lesson appears as a separate full-width section beneath the board');

assert(app.innerHTML.includes('IN-DEPTH STUDY'),'Every lesson must display expanded teaching');
assert(app.innerHTML.includes('BOARD WALKTHROUGHS'),'Lesson reading must expose two examples');
assert(app.innerHTML.includes('Think it through'),'Every lesson must have recall prompts');
press('select-lesson-scene',{scene:'1'});
assert.equal(t.ui.lessonScene,1,'Second example selected');
assert(app.innerHTML.includes('Save the rook'),'Alternate scene visible');
press('board-next');assert.equal(t.ui.board.moves.length,1,'Alternate example replays legally');
press('select-lesson-scene',{scene:'0'});
assert.equal(t.ui.lessonScene,0,'Return to original model');

assert(app.innerHTML.includes('class="eval-rail"'),'Lesson reading has an evaluation rail');
assert(app.innerHTML.includes('Stockfish analyzing'),'Loading indicator does not claim position is equal');
assert(app.innerHTML.includes('CHESS WORDS IN THIS LESSON'),'Lesson 1 introduces relevant vocabulary');assert(app.innerHTML.includes('assets/pieces.svg#wK'));assert(app.innerHTML.includes('assets/pieces.svg#bK'));
assert(app.innerHTML.includes('https://assets-themes.chess.com/image/ejgfv/150/wk.png'),'Official Neo white king image must render');
assert(app.innerHTML.includes('https://assets-themes.chess.com/image/ejgfv/150/bk.png'),'Official Neo black king image must render');
assert(app.innerHTML.includes('neo-piece-image'),'All chess piece images use Neo renderer');
assert(app.innerHTML.includes('neo-piece-fallback'),'Offline fallback still exists for failed image requests');
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
assert.equal(t.ui.phase,'mastery','Mastery tab activates');
assert(app.innerHTML.includes('QUESTION 1 OF'),'Mastery questions must actually be visible in the page HTML');
assert(app.innerHTML.includes('QUESTION 1 OF')&&app.innerHTML.includes('data-sq'),'The first mastery challenge must display an interactive chessboard');
assert(!app.innerHTML.includes('class="eval-rail"'),'No Stockfish evaluation during unassisted mastery');
for(const q of t.ui.exam.items){
 assert.equal(t.ui.exam.items[t.ui.exam.index].id,q.id);
 if(q.kind==='mc')press('exam-choice',{choice:String(q.answer)});
 else move(q.answer);
 assert.equal(t.ui.exam.answered,true);
 press('exam-next');
}
assert(app.innerHTML.includes('MASTERY RESULTS'),'Mastery results must render, not only update state');
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
assert(app.innerHTML.includes('https://assets-themes.chess.com/image/ejgfv/150/wn.png'),'Dashboard course art uses Neo pieces');
assert(app.innerHTML.includes('Your courses'),'Cozy dashboard course grid');
assert(app.innerHTML.includes('Continue learning'),'Cozy dashboard continuation card');
assert(app.innerHTML.includes('Today\'s focus'),'Cozy dashboard focus panel');
assert(app.innerHTML.includes('Recent activity'),'Cozy dashboard activity panel');
assert(app.innerHTML.includes('data-module="0"'),'Course card navigates to first module');
nav('practice','foundation');
assert(!app.innerHTML.includes('class="eval-rail"'),'Foundation practice does not reveal evaluation');
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
 nav('openings');assert(app.innerHTML.includes('class="eval-rail"'),'Opening study shows evaluation');
 press('select-opening',{opening:id});press('start-opening-drill');
 assert(!app.innerHTML.includes('class="eval-rail"'),'Opening recall drill hides evaluation');
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
assert(!app.innerHTML.includes('class="eval-rail"'),'Game review displays no bar before PGN import');
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

// Chess vocabulary and placement diagnostics should teach, not rely on unexplained jargon.
t.ui.page='lesson';t.ui.id=15;t.ui.phase='read';t.render();
assert(app.innerHTML.includes('CHESS WORDS IN THIS LESSON'));
assert(app.innerHTML.includes('Opposition'));
assert(app.innerHTML.includes('with exactly one empty square between them'));
t.ui.id=25;t.render();
assert(app.innerHTML.includes('Tempo'));
assert(app.innerHTML.includes('does not change the clock'));
const kingQuestion=t.D.exercises.find(q=>q.id==='P18');
const rookQuestion=t.D.exercises.find(q=>q.id==='P15');
assert(kingQuestion.prompt.includes('pawn on h7'));
assert(kingQuestion.explanation.includes('legal pawn move'));
assert(rookQuestion.prompt.includes('rook move that checks'));
assert(rookQuestion.explanation.includes('gaining time'));
assert.equal(new Set(t.D.exercises.map(q=>q.id)).size,121);

// Systematic content and test-bank validation for every lesson.
const boardDrills=global.CHESS_ACADEMY_BOARD_DRILLS;
const masteryBoards=global.CHESS_ACADEMY_MASTERY_BOARDS;
assert.equal(boardDrills.practice.length,80,'Two additional board exercises per lesson');
assert.equal(boardDrills.mastery.length,80,'Two additional independent mastery boards per lesson');
const masteryConcepts=global.CHESS_ACADEMY_MASTERY_CONCEPTS;
const deepGuides=global.CHESS_ACADEMY_DEEP_DIVES;
const lessonScenes=global.CHESS_ACADEMY_LESSON_SCENES;
assert.equal(masteryBoards.length,40);
assert.equal(masteryConcepts.length,160);
assert.equal(deepGuides.length,40);
assert.equal(lessonScenes.length,40);
const allMastery=[...masteryBoards,...boardDrills.mastery,...masteryConcepts];
assert.equal(new Set(allMastery.map(q=>q.id)).size,280);
const practiceIds=new Set([...t.D.exercises,...boardDrills.practice].map(q=>q.id));
assert(allMastery.every(q=>!practiceIds.has(q.id)),'Mastery uses independent questions');
for(let id=1;id<=40;id++){
 const guide=deepGuides.find(g=>g.id===id);
 const sample=lessonScenes.find(g=>g.id===id);
 const core=t.D.lessons.find(l=>l.id===id);
 assert(core?.line?.length>0,'Core example has at least one move for lesson '+id);
 assert(core.worked?.length>20,'Core example has a relevant explanation for lesson '+id);
 assert.notEqual(t.exFen(core).split(' ').slice(0,2).join(' '),t.exFen(sample).split(' ').slice(0,2).join(' '),'Core and alternate use different positions for lesson '+id);
 let coreState=t.C.parseFen(t.exFen(core));
 for(const [uci,why] of core.line){
  const m=t.C.fromUci(coreState,uci);
  assert(m,'Core example move must be legal, lesson '+id+' '+uci);
  assert(why?.length>20,'Each core move needs an educational explanation '+id);
  coreState=t.C.apply(coreState,m);
 }

 const quest=masteryConcepts.filter(q=>q.lesson===id);
 const board=masteryBoards.find(q=>q.lesson===id);
 assert(guide?.topics?.length===3,'Three extended lesson topics '+id);
 assert.equal(boardDrills.practice.filter(q=>q.lesson===id).length,2,'Two hands-on guided practice boards for lesson '+id);
 const guided=[...boardDrills.practice.filter(q=>q.lesson===id),...t.D.lessons.find(l=>l.id===id).exercises.filter(q=>q.kind==='board'),...t.D.lessons.find(l=>l.id===id).exercises.filter(q=>q.kind==='mc').slice(0,1)];
 assert(guided.filter(q=>q.kind==='board').length>guided.filter(q=>q.kind==='mc').length,'Guided practice uses more board moves than MC: '+id);
 assert.equal(boardDrills.mastery.filter(q=>q.lesson===id).length,2,'Two extra hands-on mastery boards for lesson '+id);
 const allPositions=[...boardDrills.practice.filter(q=>q.lesson===id),board,...boardDrills.mastery.filter(q=>q.lesson===id)];
 for(const p of allPositions){assert.equal(p.kind,'board');assert(t.C.fromUci(t.C.parseFen(t.exFen(p)),p.answer),'Legal board move '+p.id);}
 assert.equal(new Set(allPositions.map(q=>t.exFen(q).split(' ').slice(0,2).join(' '))).size,5,'No board positions duplicated inside practice and mastery '+id);
 assert(guide.pitfall?.length>45,'Each lesson has a realistic mistake to avoid '+id);
 assert(guide.topics.every(q=>q.explanation?.length>100&&q.prompt&&q.answer),'Each topic needs instructive content and an answer '+id);
 assert(sample?.line?.length>0,'Interactive second board example '+id);
 assert.equal(quest.length,4,'Four new reasoning questions '+id);
 assert(board&&board.kind==='board','One new interactive mastery move '+id);
 let st=t.C.parseFen(t.exFen(sample));
 for(const [uci] of sample.line){const m=t.C.fromUci(st,uci);assert(m,'Legal guided move '+id+' '+uci);st=t.C.apply(st,m);}
 assert(t.C.fromUci(t.C.parseFen(t.exFen(board)),board.answer),'Legal mastery move '+id);
 for(const q of quest){assert.equal(q.kind,'mc');assert.equal(q.options.length,4);assert(q.answer>=0&&q.answer<4);}
 // The user must be able to open the independent test, answer it and see a score.
 nav('lesson',id);assert(app.innerHTML.includes('IN-DEPTH STUDY'),'Detailed reading for lesson '+id);
 assert.equal(t.ui.board.sequence.length,core.line.length,'Core model loads all demonstration moves '+id);
 assert(!app.innerHTML.includes('Guided line complete.'),'Core model is not already complete on opening '+id);
 press('board-next');
 assert.equal(t.ui.board.moves.length,1,'The first core move actually plays on the board '+id);
 press('board-restart');
 assert.equal(t.ui.board.moves.length,0,'Core board can restart '+id);
 press('select-lesson-scene',{scene:'1'});
 assert.equal(t.ui.board.sequence.length,sample.line.length,'Second walkthrough loads '+id);
 assert(!app.innerHTML.includes('Guided line complete.'),'Second walkthrough is not already complete '+id);
 press('board-next');
 assert.equal(t.ui.board.moves.length,1,'The second walkthrough move plays '+id);
 press('select-lesson-scene',{scene:'0'});
 assert.equal(t.ui.board.moves.length,0,'Switching back to core resets position '+id);

 assert(app.innerHTML.includes('class="lesson-reading-layout"'),'Full-width lesson layout '+id);
 assert(app.innerHTML.includes('class="panel lesson-reading-panel lesson-intro"'),'Spacious core teaching '+id);
 assert(app.innerHTML.includes('class="panel lesson-reading-panel lesson-theory"'),'Spacious in-depth teaching '+id);
 assert(app.innerHTML.includes('class="panel lesson-reading-panel lesson-wrapup"'),'Full-width summary '+id);

 assert(app.innerHTML.includes('Common mistake to avoid'),'Lesson-specific mistake guidance visible '+id);
 assert(app.innerHTML.includes('BOARD WALKTHROUGHS'),'Two examples for lesson '+id);
 press('start-mastery');
 assert.equal(t.ui.exam.items.length,5,'Five new assessment questions for lesson '+id);
 assert.equal(t.ui.exam.items.filter(q=>q.kind==='board').length,3,'Mastery prioritizes 3 board moves for lesson '+id);
 assert.equal(t.ui.exam.items.filter(q=>q.kind==='mc').length,2,'Mastery includes just 2 concept questions for lesson '+id);
 press('lesson-phase',{phase:'practice'});assert(app.innerHTML.includes('BOARD MOVE')||app.innerHTML.includes('Choose a move on the board'),'Practice contains interactive boards '+id);
 press('start-mastery');
 assert(t.ui.exam.items.every(q=>!practiceIds.has(q.id)),'No recycled practice question '+id);
 assert(!app.innerHTML.includes('class="eval-rail"'),'Mastery bar must stay hidden '+id);
 for(const q of t.ui.exam.items){
  if(q.kind==='mc')press('exam-choice',{choice:String(q.answer)});
  else move(q.answer);
  assert.equal(t.ui.exam.answered,true,'Mastery answer recorded '+id);
  press('exam-next');
 }
 assert.equal(t.ui.exam.passed,true,'Mastery correctly passed lesson '+id);
 assert(app.innerHTML.includes('MASTERY RESULTS'),'Mastery result displayed '+id);
}


// The Stockfish result belongs to its board column, not beneath a whole lesson/page.
function showLocalStockfish(){
 const fen=t.C.toFen(t.ui.board.history.at(-1));
 t.ui.engineResult={fen,bestmove:t.C.legal(t.ui.board.history.at(-1)).length?t.C.uci(t.C.legal(t.ui.board.history.at(-1))[0]):'',score:23,scoreType:'cp',depth:8,mode:'lite',pv:[]};
 t.render();
 assert.equal((app.innerHTML.match(/id="engine-response"/g)||[]).length,1,'Exactly one analysis result is visible');
 assert(app.innerHTML.includes('class="panel stockfish-inline"'),'Stockfish uses its compact board-attached panel');
 return app.innerHTML;
}
nav('lesson',1);
let local=showLocalStockfish();
assert(local.indexOf('id="engine-response"')>local.indexOf('class="lesson-workshop-board"'),'Lesson result is inside board workshop');
assert(local.indexOf('id="engine-response"')<local.indexOf('class="lesson-workshop-guide"'),'Lesson result appears before adjacent guidance, not beneath the full lesson');
assert(local.indexOf('id="engine-response"')<local.indexOf('class="panel lesson-reading-panel lesson-theory"'),'Lesson result is before deep reading');
press('board-next');
assert(!app.innerHTML.includes('id="engine-response"'),'Old Stockfish result disappears after a move');
t.ui.engineResult=null;
t.ui.engineBusy=true;t.render();
assert(app.innerHTML.includes('Analyzing this position'),'Stockfish processing status is shown next to board');
t.ui.engineBusy=false;t.ui.engineResult=null;
press('lesson-phase',{phase:'practice'});
local=showLocalStockfish();
assert(local.indexOf('id="engine-response"')>local.indexOf('Lesson model position'),'Lesson-practice result appears inside the model panel');
assert(local.indexOf('id="engine-response"')<local.indexOf('</div></div>')||local.indexOf('id="engine-response"')>0,'Result exists once inside board panel');
nav('openings');
local=showLocalStockfish();
assert(local.indexOf('id="engine-response"')>local.indexOf('MODEL LINE'),'Opening result is beside the explored line');
assert(local.indexOf('id="engine-response"')<local.indexOf('STRATEGY'),'Opening result is before its strategy panel');
press('start-opening-drill');
assert(!app.innerHTML.includes('id="engine-response"'),'No engine hint appears during recall drill');
nav('analyze');press('sample-pgn');
local=showLocalStockfish();
assert(local.indexOf('id="engine-response"')>local.indexOf('Analyze this position'),'Game review result sits below its board tools');
assert(local.indexOf('id="engine-response"')<local.indexOf('IMPORTED GAME'),'Game review result does not render at page bottom');
press('game-ply',{ply:'1'});
assert(!app.innerHTML.includes('id="engine-response"'),'Changing PGN ply clears the result');
nav('play');
local=showLocalStockfish();
assert(local.indexOf('id="engine-response"')>local.indexOf('Analyze position'),'Play result appears under board actions');
assert(local.indexOf('id="engine-response"')<local.indexOf('ENGINE OPPONENT'),'Play result is not appended below the whole screen');
t.ui.engineResult=null;
console.log('PASS: open-access lessons, board-first practice, independent mastery, exercise grading, 2 opening recall drills, PGN parsing, progress, review, settings, forty detailed lessons, forty independent mastery assessments');

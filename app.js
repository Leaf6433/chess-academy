/* Chess Academy 2 — original browser learning platform. Stockfish.js engine is third-party GPLv3. */
(()=>{
'use strict';
const C=window.Chess,D=window.COURSE,engine=new window.EngineService();
if(!C||!D)throw Error('Missing Chess Academy course dependencies.');
const STORAGE='chess.academy.v2.progress';
const $=id=>document.getElementById(id);
const escapeHTML=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const a=x=>escapeHTML(x);
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const lessonOrder=D.modules.flatMap(m=>m.ids), lessons=new Map(D.lessons.map(l=>[l.id,l])),questions=new Map(D.exercises.map(e=>[e.id,e]));
const starter=()=>({version:2,mastered:{},placementCredit:{},opened:{},studied:{},completed:{},attempts:{},review:{},practiceSolved:{},lastLesson:1,placement:null,starred:[],repertoire:[],openingDrills:{},games:[],journal:[],settings:{mode:'lite',depth:11,reviewLimit:40},created:Date.now()});
function load(){try{const raw=JSON.parse(localStorage.getItem(STORAGE));if(raw?.version===2)return {...starter(),...raw,opened:{...(raw.opened||raw.studied||{})},studied:raw.opened?raw.studied||{}:{},completed:raw.completed||{},settings:{...starter().settings,...raw.settings}};}catch(e){}const first=starter();try{const older=JSON.parse(localStorage.getItem('chess.academy.800-1200.progress.v1'));if(older){first.studied=Object.fromEntries((older.completed||[]).map(x=>[x,Date.now()]));first.lastLesson=Number(older.recent)||1;}}catch(e){}return first;}
let data=load();
const ui={preview:null,page:'dashboard',id:1,phase:'read',board:null,exam:null,practiceId:null,notice:'',error:'',search:'',filter:'all',moduleOpen:0,menu:false,showHint:false,attemptWrong:0,feedback:null,feedbackGood:false,practiceOptionOrder:null,game:null,gamePly:0,engineState:null,engineResult:null,engineBusy:false,gameReviewBusy:false,gameReviewText:'',cancelReview:false,openingId:'italian',openingPhase:'explore',playSide:1,playing:false,pgnText:'',progressText:'',reflect:false,extraDetails:false};
const now=()=>Date.now();
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(data));}catch(err){ui.notice='Browser storage is unavailable or full. Export your progress regularly.';}}
function isMastered(id){return !!data.mastered[id]||!!data.placementCredit[id];}
function lessonStatus(id){return data.mastered[id]?'Mastered':data.completed[id]?'Completed · mastery pending':data.studied[id]?'Studied · practice pending':data.placementCredit[id]?'Placement credit · not studied':'Not studied';}
function allMastered(){return lessonOrder.filter(isMastered).length;}
function nextLesson(){return lessonOrder.find(id=>!isMastered(id))||lessonOrder[lessonOrder.length-1];}
function unlocked(id){const at=lessonOrder.indexOf(Number(id));return at===0||lessonOrder.slice(0,at).every(isMastered);}
function canResume(id){return lessons.has(id)&&(unlocked(id)||isMastered(id));}
function dueCount(){return Object.values(data.review).filter(x=>x.due<=now()).length;}
function percent(n,d){return d?Math.round(n/d*100):0;}
function exFen(q){return typeof q.fen==='string'?q.fen:C.toFen(C.after(C.START_FEN,q.fen.after));}
function renderBars(label,val,total){return `<div style="display:flex;justify-content:space-between;margin:8px 0 7px"><small class="muted">${a(label)}</small><small class="strong">${val}/${total}</small></div><div class="progress-bar"><span style="width:${percent(val,total)}%"></span></div>`;}
function makeBoard(fen,sequence=[],kind='lesson'){return {initial:fen,history:[C.parseFen(fen)],sequence:sequence||[],moves:[],labels:[],selected:-1,pending:null,last:null,flip:false,kind,guided:true,error:'',claim:''};}
function bs(b){return b.history[b.history.length-1];}
function makeNav(id,label,icon,badge){return `<button class="navitem ${ui.page===id?'active':''}" data-page="${id}"><span class="navicon">${icon}</span>${label}${badge?`<span class="nav-badge">${badge}</span>`:''}</button>`;}
function wrap(body,title){
 const d=allMastered(),progress=percent(d,lessonOrder.length);
 $('app').innerHTML=`<div class="app"><div class="shade ${ui.menu?'open':''}" data-action="close-menu"></div><aside class="sidebar ${ui.menu?'open':''}"><div class="brand"><div class="brand-icon">♞</div><div class="brand-text"><strong>Chess Academy</strong><small>Mastery course · 2.0</small></div></div><div class="navhead">LEARN</div>
 ${makeNav('dashboard','Dashboard','⌂')}${makeNav('curriculum','My curriculum','▤')}${makeNav('placement','Placement test','◈')}${makeNav('practice','Practice','◎',dueCount())}${makeNav('openings','Opening laboratory','♗')}
 <div class="navhead">DEVELOP</div>${makeNav('analyze','Analyze games','◫')}${makeNav('play','Play Stockfish','♟')}${makeNav('progress','My progress','▥')}${makeNav('sources','Theory & sources','▣')}${makeNav('settings','Settings','⚙')}
 <div class="sidebar-bottom"><div class="side-mini"><div class="muted strong" style="font-size:11px">ACADEMY PROGRESS</div><div class="big">${progress}%</div><div class="progress-bar"><span style="width:${progress}%"></span></div><div class="little" style="margin-top:10px">${d} of ${lessonOrder.length} lessons mastered or credited</div></div></div></aside>
 <div class="main"><header class="top"><div style="display:flex;align-items:center;min-width:0"><button class="mobile-toggle" data-action="menu" aria-label="Open navigation">☰</button><div class="topnav">CHESS ACADEMY &nbsp; / &nbsp; <b>${a(title)}</b></div></div><div class="topright"><span class="small-tag">♞ &nbsp; ${data.placement?'Personalized track':'800–1000 starting track'}</span><div class="avatar">♘</div></div></header><div class="page" id="main-content">${ui.notice?`<div class="notice" role="status">${a(ui.notice)} <button class="link" data-action="dismiss">Dismiss</button></div>`:''}${body}<div class="footer">Chess Academy · Research-based curriculum, original explanations and exercises. Stockfish 19 for analysis. Progress currently stays on this device; export it in Settings. No automatic online account sync yet.</div></div></div></div>`;
}
function header(eyebrow,title,sub){return `<div class="course-header"><div class="eyebrow">${a(eyebrow)}</div><h1>${a(title)}</h1>${sub?`<p class="kicker" style="margin-top:11px">${a(sub)}</p>`:''}</div>`;}
function stats(){return `<div class="stats"><div class="stat"><span class="stat-symbol">◉</span><div class="label">Mastered or credited</div><div class="value">${percent(allMastered(),lessonOrder.length)}%</div><div class="detail">${allMastered()} / ${lessonOrder.length} lessons</div></div><div class="stat"><span class="stat-symbol">◎</span><div class="label">Due reviews</div><div class="value">${dueCount()}</div><div class="detail">Spaced repetition</div></div><div class="stat"><span class="stat-symbol">✦</span><div class="label">Practice solved</div><div class="value">${Object.keys(data.practiceSolved).length}</div><div class="detail">Individual exercises</div></div><div class="stat"><span class="stat-symbol">♙</span><div class="label">Imported games</div><div class="value">${data.games.length}</div><div class="detail">PGN reviews saved</div></div></div>`;}
function moduleCard(m,i){const count=m.ids.filter(isMastered).length;return `<button class="module-card" data-page="curriculum" data-module="${i}"><div class="module-head"><div class="module-icon">${m.icon}</div><span class="chip ${count===m.ids.length?'':'grey'}">${count===m.ids.length?'Mastered':`${count} / ${m.ids.length} credited or mastered`}</span></div><h3>${a(m.name)}</h3><p>${a(m.subtitle)}</p><div class="progress-bar"><span style="width:${percent(count,m.ids.length)}%"></span></div></button>`;}
function dashboard(){let id=nextLesson(),l=lessons.get(id),ready=canResume(id),due=dueCount();const nextReview=Object.keys(data.review).find(x=>data.review[x].due<=now());wrap(`
 <div class="hero"><div><div class="eyebrow">YOUR LEARNING PATH</div><h1>Learn deeply.<br><span class="highlight">Play with confidence.</span></h1><p class="kicker">A structured chess course that tests what you can apply, not just what you can remember. Work toward mastery at your own pace.</p></div><div class="hero-graphic"><span class="knight">♞</span><span class="ring"></span></div></div>${stats()}
 ${!data.placement?`<div class="panel" style="border-color:#597348;background:linear-gradient(120deg,#253a27,#1b2920)"><div class="eyebrow">START HERE</div><h2 style="margin:10px 0">Find your starting level</h2><p class="panel-desc">Take a short, unassisted diagnostic. Your results suggest which skills to focus on, and strong foundational answers can award placement credit.</p><button class="btn" data-action="start-placement">Take placement assessment →</button></div>`:''}
 <div class="cols-2"><div><div class="panel"><div class="panel-title"><h3>Continue your learning path</h3><span class="chip">Mastery required</span></div><div class="task-card"><div class="eyebrow">NEXT LESSON · ${lessonOrder.indexOf(id)+1} OF ${lessonOrder.length}</div><h2>${a(l.title)}</h2><p>${a(l.target)}</p><div class="btn-row"><button class="btn" data-page="lesson" data-id="${id}">Start lesson →</button><button class="btn ghost" data-page="curriculum">View curriculum</button></div></div></div><div class="panel"><div class="panel-title"><h3>Course modules</h3><button class="link" data-page="curriculum">View all →</button></div><div class="module-grid">${D.modules.map(moduleCard).join('')}</div></div></div>
 <div><div class="panel"><div class="panel-title"><h3>Practice that sticks</h3><span class="chip ${due?'gold':'grey'}">${due} due</span></div><p class="panel-desc">Missed ideas come back on a schedule. We focus on transferring knowledge into unfamiliar positions, not writing an explanation every move.</p>${nextReview?`<div class="mini-panel"><strong>${a(questions.get(nextReview)?.prompt||'Review your latest mistake')}</strong><p class="helper" style="margin-top:8px">A past concept is ready for review.</p></div>`:`<div class="mini-panel">✓ You're up to date on scheduled reviews.</div>`}<div class="btn-row" style="margin-top:15px"><button class="btn secondary" data-page="practice" data-filter="due">${due?'Review now →':'Open practice →'}</button></div></div>
 <div class="panel"><div class="panel-title"><h3>Your chess toolkit</h3></div><div class="grid-lines"><div><strong>♗ Opening laboratory</strong><p class="helper">Compare options before committing to a repertoire.</p><button class="link" data-page="openings">Explore openings →</button></div><div class="divider"></div><div><strong>◫ Analyze your games</strong><p class="helper">Import PGNs and use Stockfish to find missed chances.</p><button class="link" data-page="analyze">Open game analysis →</button></div><div class="divider"></div><div><strong>♘ Engine sparring</strong><p class="helper">Play reduced-depth Stockfish to practice under pressure.</p><button class="link" data-page="play">Play a game →</button></div></div></div></div></div>
 `,'Dashboard');}
function lessonRow(l,i){const done=!!data.mastered[l.id],credited=!!data.placementCredit[l.id],studied=!!data.studied[l.id],lock=!unlocked(l.id)&&!isMastered(l.id),current=nextLesson()===l.id;return `<button class="lesson-row ${lock?'locked':''}" data-page="lesson" data-id="${l.id}" ${lock?'disabled':''}><div class="number ${done||credited?'complete':''}">${done?'✓':credited?'◇':studied?'◉':lock?'🔒':String(i+1).padStart(2,'0')}</div><div class="lesson-row-main"><strong>${a(l.title)}</strong><p>${a(l.target)}</p></div><span class="right-detail">${lessonStatus(l.id)}${current?' · Next up':''}${lock?' · Locked':''} · ${l.length} min</span></button>`;}
function curriculum(){const q=ui.search.toLowerCase().trim();wrap(`${header('LEARNING PATH','Your curriculum','40 original lessons across seven skill domains. Each lesson includes guided study, exercises, and a mastery assessment. Lessons unlock after proven mastery.')}
 <div class="toolbar"><input id="course-search" class="input search" placeholder="Search lessons and topics…" value="${a(ui.search)}"><span class="chip">${allMastered()} / ${lessonOrder.length} mastered or credited</span><button class="btn ghost small" data-page="placement">Placement test</button></div>
 ${D.modules.map((m,mi)=>{const ls=m.ids.map(id=>lessons.get(id)).filter(l=>!q||(l.title+' '+l.target).toLowerCase().includes(q));if(!ls.length)return '';return `<div class="panel"><div class="panel-title"><div><div class="eyebrow">MODULE ${mi+1} · ${m.ids.length} LESSONS</div><h2 style="margin-top:6px">${m.icon} &nbsp;${a(m.name)}</h2><p class="helper" style="margin-top:7px">${a(m.subtitle)}</p></div><span class="chip">${m.ids.filter(isMastered).length} / ${m.ids.length}</span></div><div class="lesson-list">${ls.map(l=>lessonRow(l,lessonOrder.indexOf(l.id))).join('')}</div></div>`}).join('')}
 `,'Curriculum');}
function boardHTML(b,{small=false,viewOnly=false}={}){
 if(!b)return '';
 const s=bs(b),valid=C.legal(s),sel=valid.filter(m=>m[0]===b.selected).map(m=>m[1]);const rows=[];
 for(let r=0;r<8;r++)for(let f=0;f<8;f++){
  const row=b.flip?7-r:r,file=b.flip?7-f:f,i=row*16+file;
  const p=s.b[i],target=sel.includes(i),selected=b.selected===i,last=b.last?.includes(i);
  const dark=(row+file)%2===1;
  rows.push(`<button ${viewOnly?'disabled':''} class="sq ${dark?'dark':'light'} ${selected?'selected':''} ${last?'last':''} ${target?(p!=='.'?'capture':'target'):''}" aria-label="${a(C.sq(i))} ${p==='.'?'empty':p}" data-sq="${i}"><span class="piece ${C.side(p)===1?'white':'black'}">${C.glyph[p]}</span>${(b.flip?row===0:row===7)?`<span class="coord file">${C.sq(i)[0]}</span>`:''}${(b.flip?file===7:file===0)?`<span class="coord rank">${8-row}</span>`:''}</button>`);
 }
 return `<div class="board-frame"><div class="board" role="group" aria-label="Interactive chess board">${rows.join('')}</div></div>`;
}
function boardControls(b,{engineAction=false}={}){if(!b)return '';
 const step=b.guided?b.sequence[b.moves.length]:null;
 const done=b.moves.length>=b.sequence.length;
 return `<div class="btn-row" style="margin-top:13px"><button class="btn ghost small" data-action="board-back" ${b.moves.length?'':'disabled'}>← Back</button><button class="btn secondary small" data-action="board-next" ${step?'':'disabled'}>Next move →</button><button class="btn ghost small" data-action="board-restart">Restart</button><button class="btn ghost small" data-action="board-flip">⇅ Flip</button></div>
 ${b.pending?`<div class="feedback gold">Choose your promotion: ${b.pending.map(m=>`<button class="btn small" data-action="promote" data-uci="${C.uci(m)}">${{q:'Queen',r:'Rook',b:'Bishop',n:'Knight'}[m[2]]}</button>`).join(' ')}</div>`:''}
 ${b.error?`<div class="feedback bad" role="status">${a(b.error)}</div>`:''}
 ${step?`<div class="feedback info"><strong>Next: ${a(C.label(bs(b),C.fromUci(bs(b),step[0])||C.legal(bs(b))[0]))}</strong><br>${a(step[1])}</div>`:b.kind==='lesson'||b.kind==='opening'?`<div class="feedback">Guided line complete. Explore legal continuations or restart to practice it again.</div>`:''}
 ${b.moves.length?`<div class="move-list" aria-label="Replay moves">${b.labels.map((m,i)=>`<button class="move ${i===b.moves.length-1?'active':''}" data-action="board-jump" data-ply="${i+1}" title="Replay to this move">${a(m)}</button>`).join('')}</div>`:''}${engineAction?`<button class="btn ghost small" data-action="analyze-position">♞ Ask Stockfish about this position</button>`:''}`;
}
function initLesson(id,phase='read'){
 const l=lessons.get(Number(id));if(!l)return;if(!unlocked(l.id)&&!isMastered(l.id)){ui.notice='Finish the preceding lessons to unlock this one.';return curriculum();}
 ui.id=l.id;ui.phase=phase;ui.practiceId=null;ui.exam=null;ui.board=makeBoard(typeof l.fen==='string'?l.fen:exFen(l),l.line,'lesson');data.lastLesson=l.id;data.opened[l.id]=now();save();ui.page='lesson';render();
}
function lessonPage(){let l=lessons.get(ui.id),mod=D.modules[l.module],index=lessonOrder.indexOf(l.id),done=!!data.mastered[l.id];let qCount=l.exercises.length;
 const top=`${header(`MODULE ${l.module+1} / LESSON ${index+1}`,l.title,l.target)}<div class="btn-row" style="margin:-4px 0 18px"><span class="chip ${done?'':'gold'}">${done?'✓ Mastered':data.placementCredit[l.id]?'◇ Placement credit · not mastery':data.studied[l.id]?'◉ Studied':'Mastery required'}</span><span class="chip grey">${l.length} min target · ${qCount} checks</span><button class="btn ghost small" data-page="curriculum">← All lessons</button></div>
 <div class="lesson-steps"><button class="phase ${ui.phase==='read'?'current':'done'}" data-action="lesson-phase" data-phase="read">1. Learn the concept</button><button class="phase ${ui.phase==='practice'?'current':''}" data-action="lesson-phase" data-phase="practice">2. Guided practice</button><button class="phase ${ui.phase==='mastery'?'current':''}" data-action="start-mastery">3. Mastery check</button></div>`;
 if(ui.phase==='mastery'&&ui.exam)return assessmentPage(top);
 if(ui.phase==='read'){
  const body=`<div class="layout-board"><div>${boardHTML(ui.board)}${boardControls(ui.board,{engineAction:true})}</div><div class="panel" style="margin-bottom:0"><div class="eyebrow">LEARN</div><h2 style="margin:8px 0 15px">The key idea</h2><p class="helper" style="margin-bottom:12px">Use Next move to watch the example unfold, Back to review it, or select a played move below the board to return to that position.</p><div class="lesson-notes">${l.body.map(p=>`<p>${a(p)}</p>`).join('')}</div>${l.worked?`<div class="feedback info">${a(l.worked)}</div>`:''}<div class="divider"></div><h3>Remember these ideas</h3><div class="checklist" style="margin:13px 0">${l.takeaways.map(t=>`<div class="check"><span class="checkmark">✓</span><span>${a(t)}</span></div>`).join('')}</div><button class="btn" data-action="lesson-phase" data-phase="practice">Practice what you learned →</button><div class="section-label">THEORY & FURTHER READING</div>${l.refs.map(ref=>{const s=D.sources.find(x=>x.id===ref);return s?`<div style="margin-bottom:7px"><a class="source-link" target="_blank" rel="noopener noreferrer" href="${a(s.url)}">${a(s.title)} ↗</a></div>`:''}).join('')}<div style="margin-top:9px"><a class="source-link" href="https://lichess.org/training/themes" target="_blank" rel="noopener noreferrer">Lichess tactical themes ↗</a></div></div></div>`;
  return wrap(top+body+(ui.engineResult?engineResponse():'') ,'Lesson');
 }
 if(ui.phase==='practice'){
  const lqs=l.exercises;
  const solved=lqs.filter(e=>!!data.practiceSolved[e.id]).length;
  return wrap(top+`<div class="cols-2"><div class="panel"><div class="panel-title"><h3>Practice this lesson</h3><span class="chip">${solved}/${lqs.length} completed</span></div><p class="panel-desc">Solve the concept checks. A wrong answer can be retried, with hints available. Your mastery check will be unassisted and mainly based on making the right decisions.</p><div class="grid-lines">${lqs.map((e,i)=>`<button class="lesson-row" data-action="open-question" data-qid="${a(e.id)}"><span class="number ${data.practiceSolved[e.id]?'complete':''}">${data.practiceSolved[e.id]?'✓':i+1}</span><span class="lesson-row-main"><strong>${a(e.prompt)}</strong><p>${e.kind==='board'?'Choose a move on the board':'Choose an answer'} · ${data.practiceSolved[e.id]?'Practiced':'Not yet practiced'}</p></span><span class="right-detail">›</span></button>`).join('')}</div><div class="divider"></div><button class="btn" data-action="start-mastery">Take mastery assessment →</button><p class="helper" style="margin-top:12px">Passing requires at least 80% without hints, including any board-move questions. Failed skills return to practice and spaced review.</p></div><div class="panel"><h3>Lesson model position</h3><p class="panel-desc">Try the line again, or analyze this position with Stockfish.</p>${boardHTML(ui.board)}${boardControls(ui.board,{engineAction:true})}</div></div>${ui.engineResult?engineResponse():''}`,'Lesson');
 }
 return wrap(top,'Lesson');
}
function qCard(e,note=''){return `<div class="panel" style="margin-bottom:16px"><div class="eyebrow">${note||(e.kind==='board'?'BOARD PRACTICE':'CONCEPT PRACTICE')} · ${e.kind==='board'?'PLAY THE MOVE':'CHOOSE AN ANSWER'}</div><h2 style="font-size:21px;margin:9px 0 12px">${a(e.prompt)}</h2>${e.kind==='mc'?'':`<p class="helper">Click a piece, then its destination. Legal destinations are highlighted.</p>`}</div>`;}
function openPractice(id,mode='practice'){const e=questions.get(id);if(!e)return;setupQuestionPreview(e);ui.practiceId=id;ui.phase='single';ui.exam=null;ui.page='exercise';ui.board=makeBoard(exFen(e),[],'question');ui.feedback=null;ui.feedbackGood=false;ui.showHint=false;ui.attemptWrong=0;ui.practiceOptionOrder=shuffle(e.options?.map((_,i)=>i)||[]);render();}
function practiceQuestion(){const q=questions.get(ui.practiceId);if(!q)return practicePage();const l=lessons.get(q.lesson);
 const order=ui.practiceOptionOrder||q.options?.map((_,i)=>i)||[];
 let controls=q.kind==='mc'?`<div class="options">${order.map((orig,i)=>`<button class="puzzle-option ${ui.feedback&&orig===q.answer?'correct':''}" data-action="choose-question" data-choice="${orig}" ${ui.feedback?'disabled':''}><span class="letter">${String.fromCharCode(65+i)}</span>${a(q.options[orig])}</button>`).join('')}</div>`:boardHTML(ui.board);
 let follow=`<div class="btn-row" style="margin-top:14px">${!ui.feedback?`<button class="btn ghost small" data-action="hint">${ui.showHint?'Hide hint':'Show a hint'}</button>${ui.attemptWrong>=2?`<button class="btn ghost small" data-action="reveal-answer">Show explanation</button>`:''}`:`<button class="btn" data-page="practice">Back to practice →</button><button class="btn secondary" data-action="open-next-question">Another question →</button>`}<button class="btn ghost small" data-page="lesson" data-id="${q.lesson}">Return to lesson</button></div>`;
 wrap(`${header('PRACTICE · '+l.title,'Apply the idea','Wrong answers are opportunities to learn. Try again, or reveal a short hint.')}
 <div class="layout-board"><div>${q.kind==='mc'?conceptOrBoard(q):controls}${q.kind==='board'&&ui.feedbackGood?`<div class="feedback">Your move has been played on the board.</div>`:''}</div><div>${qCard(q)}${q.kind==='mc'?controls:''}${ui.showHint&&!ui.feedback?`<div class="feedback gold">Hint: ${a(q.hint)}</div>`:''}${ui.attemptWrong&&!ui.feedback?`<div class="feedback bad">Not quite. Recheck the position and try another idea. ${ui.attemptWrong>=2?'You can reveal the answer now.':''}</div>`:''}${ui.feedback?`<div class="feedback ${ui.feedbackGood?'':'gold'}">${a(ui.feedback)}</div>`:''}${follow}</div></div>`,'Practice');
}

function questionPreviewMoves(q){
 const after=q.fen&&typeof q.fen==='object'&&Array.isArray(q.fen.after)?q.fen.after:null;
 if(after)return after.slice();
 const match=q.prompt.match(/(?:after|following)\s+(1\.\s*d4\s+d5\s+2\.\s*c4)\b/i);
 if(!match)return [];
 const tokens=match[1].replace(/\d+\./g,' ').trim().split(/\s+/);
 let state=C.parseFen(C.START_FEN),out=[];
 for(const token of tokens){const m=C.legal(state).find(x=>C.san(state,x).replace(/[+#]/g,'')===token.replace(/[+#]/g,''));if(!m)return [];out.push(C.uci(m));state=C.apply(state,m);}
 return out;
}
function setupQuestionPreview(q){
 const moves=questionPreviewMoves(q);
 if(!moves.length){ui.preview=null;return;}
 try{const states=[C.parseFen(C.START_FEN)];for(const u of moves){const prior=states[states.length-1],move=C.fromUci(prior,u);if(!move)throw Error('Illegal preview move');states.push(C.apply(prior,move));}ui.preview={moves,index:moves.length,states};}
 catch(e){ui.preview=null;}
}
function questionReplay(){
 const p=ui.preview;if(!p)return '';
 const state=p.states[p.index],prior=p.index?p.states[p.index-1]:null,move=prior?C.fromUci(prior,p.moves[p.index-1]):null;
 const sample={history:[state],selected:-1,last:move?[move[0],move[1]]:null,flip:false};
 const labels=p.moves.map((u,i)=>{const m=C.fromUci(p.states[i],u);return m?C.label(p.states[i],m):u;});
 return `<div class="question-replay"><div class="eyebrow">POSITION REPLAY · ANSWER NOT SHOWN</div>${boardHTML(sample,{viewOnly:true})}
 <div class="btn-row" style="margin-top:10px"><button class="btn ghost small" data-action="preview-start" ${p.index===0?'disabled':''}>|← Start</button><button class="btn ghost small" data-action="preview-back" ${p.index===0?'disabled':''}>← Back</button><button class="btn secondary small" data-action="preview-next" ${p.index===p.moves.length?'disabled':''}>Next →</button><button class="btn ghost small" data-action="preview-end" ${p.index===p.moves.length?'disabled':''}>End →|</button></div>
 <div class="move-list">${labels.map((t,i)=>`<button class="move ${p.index===i+1?'active':''}" data-action="preview-jump" data-ply="${i+1}">${a(t)}</button>`).join('')}</div>
 <p class="helper" style="margin-top:8px">Replay the moves supplied in the prompt without revealing the answer.</p></div>`;
}

function conceptOrBoard(q){if(ui.preview&&q.kind==='mc')return questionReplay();return q.kind==='mc'&&exFen(q)===C.START_FEN?`<div class="concept-card"><div class="concept-glyph">♞</div><div class="eyebrow">CHESS REASONING</div><h3>Think before choosing</h3><p class="helper">Apply what you learned. The question, not an unrelated board, is your focus here.</p></div>`:boardHTML(ui.board);}
function schedule(qid,correct,hinted=false){const prior=data.review[qid]||{streak:0,interval:1};const streak=(correct&&!hinted)?prior.streak+1:0;const intervals=[1,1,3,7,14,30,60];const days=intervals[Math.min(streak,intervals.length-1)];data.review[qid]={streak,interval:days,due:now()+days*86400000,seen:(prior.seen||0)+1};save();}
function solvePractice(good,explanation,assisted=false){const id=ui.practiceId;if(good){ui.feedback=explanation;ui.feedbackGood=!assisted;data.practiceSolved[id]={at:now(),assisted:!!assisted};const lesson=lessons.get(questions.get(id)?.lesson);if(lesson&&lesson.exercises.every(e=>data.practiceSolved[e.id]))data.completed[lesson.id]={at:now()};schedule(id,!assisted,assisted);}else{ui.attemptWrong++;schedule(id,false);save();}render();}
function startAssessment(kind,id=null){
 let items;
 if(kind==='placement'){
  const picks=[1,2,3,4,5,6,7,9,10,11,12,14,15,16,17,18,20,21,24,27,28,29,30,31,35,36,37,38,39,40];
  items=picks.map(lid=>lessons.get(lid)).filter(Boolean).map(l=>l.exercises.find(e=>e.kind==='board')||l.exercises[0]);
  // 30 positions/knowledge checks, shorter when appropriate; 2–3 per domain.
  items=[1,2,3,4,5,6,7,9,10,11,12,14,15,17,18,20,21,24,27,29,30,31,35,36,37,39,40].map(id=>lessons.get(id).exercises[0]);
 }else{
  const l=lessons.get(Number(id));if(!l)return;if(!canResume(l.id))return;
  items=l.exercises.slice();
 }
 ui.exam={kind,lessonId:id,items,index:0,results:[],answered:null,showReview:false};ui.page=kind==='placement'?'placement':'lesson';if(kind==='mastery')ui.phase='mastery';setupExamBoard();render();
}
function setupExamBoard(){const q=ui.exam?.items[ui.exam.index];if(q)setupQuestionPreview(q);else ui.preview=null;ui.board=q?makeBoard(exFen(q),[],'question'):null;if(ui.exam)ui.exam.optionOrder=shuffle(q?.options?.map((_,i)=>i)||[]);ui.feedback=null;ui.feedbackGood=false;}
function submitExam(good){const exam=ui.exam;if(!exam||exam.answered!==null)return;const q=exam.items[exam.index];exam.answered=good;exam.results.push({id:q.id,ok:good});if(!good)schedule(q.id,false);render();}
function nextExam(){const x=ui.exam;if(!x||x.answered===null)return;x.index++;x.answered=null;if(x.index>=x.items.length){finishAssessment();return;}setupExamBoard();render();}
function finishAssessment(){const ex=ui.exam;if(!ex)return;
 ex.showReview=true;
 const score=ex.results.filter(x=>x.ok).length,total=ex.results.length,ratio=score/total;
 if(ex.kind==='mastery'){
  const l=lessons.get(ex.lessonId),hasBoard=l.exercises.some(e=>e.kind==='board');
  const missedBoard=hasBoard&&ex.results.some(r=>questions.get(r.id).kind==='board'&&!r.ok);
  ex.passed=ratio>=.8&&!missedBoard;
  data.attempts[l.id]=[...(data.attempts[l.id]||[]),{time:now(),correct:score,total,passed:ex.passed}].slice(-20);
  if(ex.passed){data.mastered[l.id]={at:now(),score,total};data.studied[l.id]=data.studied[l.id]||now();data.completed[l.id]=data.completed[l.id]||{at:now()};data.lastLesson=nextLesson();}
  // Any incorrect items are already scheduled; correctly answered items get delayed retention checks too.
  for(const r of ex.results){if(r.ok)schedule(r.id,true);}
 }else{
  const byMod=D.modules.map((m,mod)=>{
   const results=ex.results.filter(r=>lessons.get(questions.get(r.id).lesson)?.module===mod);
   return {module:mod,correct:results.filter(r=>r.ok).length,total:results.length};
  });
  data.placement={at:now(),correct:score,total,domains:byMod};
  // Limited exemption: only an excellent, fully correct foundation section can credit its first lesson.
  if(byMod[0].total>=3&&byMod[0].correct===byMod[0].total){data.placementCredit[1]={at:now(),reason:'Unassisted placement'};}
  if(byMod[1].total>=3&&byMod[1].correct===byMod[1].total&&data.placementCredit[1]){data.placementCredit[2]={at:now(),reason:'Unassisted placement'};}
 }
 save();render();
}
function assessmentPage(pre=''){
 const x=ui.exam;if(!x)return '';
 if(x.showReview){const correct=x.results.filter(v=>v.ok).length;
  return `${pre}<div class="panel" style="max-width:830px"><div class="eyebrow">${x.kind==='placement'?'PLACEMENT RESULTS':'MASTERY RESULTS'}</div><h1 style="margin:10px 0">${x.kind==='mastery'?(x.passed?'Lesson mastered!':'Review and retry'): 'Your starting-point assessment'}</h1><div style="font:800 49px var(--head);color:var(--green2);margin:12px 0">${correct}/${x.results.length}</div><p class="panel-desc">${x.kind==='placement'?'This diagnostic identifies familiar ideas. It is not an official chess rating, and only very strong foundational performance earns limited placement credit.':x.passed?'You demonstrated this lesson without hints. Its concepts will appear again in spaced review.':'This check did not meet the 80% threshold or missed a board exercise. Practice the missed ideas and try again. No penalty for repeating.'}</p>${x.kind==='placement'?`<div class="grid-lines">${data.placement.domains.map(b=>`<div>${renderBars(D.modules[b.module].name,b.correct,b.total)}</div>`).join('')}</div>`:''}
 <div class="section-label">YOUR ANSWERS</div><div class="grid-lines">${x.results.map(v=>`<div class="mini-panel"><span class="chip ${v.ok?'':'red'}">${v.ok?'✓ Correct':'✕ Review'}</span><p class="helper" style="margin-top:8px">${a(questions.get(v.id).prompt)}</p>${!v.ok?`<p style="font-size:12px;margin-top:8px">${a(questions.get(v.id).explanation)}</p>`:''}</div>`).join('')}</div>
 <div class="btn-row" style="margin-top:20px">${x.kind==='placement'?`<button class="btn" data-page="curriculum">Go to your course →</button>`:`<button class="btn" data-page="lesson" data-id="${x.lessonId}">${x.passed?'Continue learning →':'Return to lesson →'}</button><button class="btn secondary" data-action="start-mastery" data-id="${x.lessonId}">Retry this assessment</button>`}</div></div>`;
 }
 const q=x.items[x.index];
 const answered=x.answered!==null;
 const order=x.optionOrder||q.options?.map((_,i)=>i)||[];
 const controls=q.kind==='mc'?`<div class="options">${order.map((orig,i)=>`<button class="puzzle-option ${answered&&orig===q.answer?'correct':''}" data-action="exam-choice" data-choice="${orig}" ${answered?'disabled':''}><span class="letter">${'ABCD'[i]}</span>${a(q.options[orig])}</button>`).join('')}</div>`:`<p class="helper">Move the piece on the board. Only the first attempted move counts in an unassisted assessment.</p>`;
 const title=x.kind==='placement'?'Placement assessment':'Lesson mastery assessment';
 const progressMeter=x.items.map((q,i)=>`<span class="${i<x.results.length?(x.results[i].ok?'good':'wrong'):''}"></span>`).join('');
 return `${pre||header('DIAGNOSTIC','Find your strengths','Answer without hints. Your score will help choose a sensible starting point.')}
 <div class="cols-2"><div class="panel"><div class="eyebrow">QUESTION ${x.index+1} OF ${x.items.length}</div><div class="test-meter">${progressMeter}</div><h2 style="margin:15px 0">${a(q.prompt)}</h2>${q.kind==='mc'?controls:''}${answered?`<div class="feedback ${x.answered?'':'bad'}">${x.answered?'✓ Correct.':'Not quite.'} ${a(q.explanation)}</div><button class="btn" data-action="exam-next">${x.index===x.items.length-1?'See my results →':'Next question →'}</button>`:'<p class="helper" style="margin-top:10px">Choose carefully. No hints in assessments.</p>'}</div><div><div class="panel"><div class="eyebrow">${q.kind==='board'?'INTERACTIVE POSITION':'CONCEPT CHECK'}</div>${conceptOrBoard(q)}</div>${x.kind==='placement'?'<p class="helper">This assessment covers a broad range of topics, so tougher questions are normal.</p>':''}</div></div>`;
}
function placement(){if(ui.exam?.kind==='placement')return wrap(assessmentPage(),'Placement');const previous=data.placement;
 wrap(`${header('PERSONALIZED ENTRY','Placement assessment','An unassisted diagnostic helps locate your strengths. It is not an official chess rating.')}
 <div class="cols-2"><div class="panel"><div class="eyebrow">HOW IT WORKS</div><h2 style="margin:10px 0">Check your starting point</h2><p class="panel-desc">27 questions across tactical awareness, openings, middlegames, endgames and review habits. Most questions involve selecting an answer, with some moves played on the board. Take your time; no hints or penalties.</p><div class="checklist"><div class="check"><span class="checkmark">✓</span>Use the results to see weaker subject areas.</div><div class="check"><span class="checkmark">✓</span>Excellent foundational results can unlock limited placement credit.</div><div class="check"><span class="checkmark">✓</span>Every later lesson requires independent mastery.</div></div><div class="btn-row" style="margin-top:22px"><button class="btn" data-action="start-placement">${previous?'Retake assessment':'Begin assessment'} →</button><button class="btn ghost" data-page="curriculum">Browse curriculum</button></div></div><div class="panel"><h3>Previous result</h3>${previous?`<div class="value" style="font:800 42px var(--head);margin:13px 0">${previous.correct}/${previous.total}</div>${previous.domains.map(d=>renderBars(D.modules[d.module].name,d.correct,d.total)).join('')}`:'<p class="panel-desc">No assessment taken yet. You can still start at Lesson 1.</p>'}</div></div>`,'Placement');}
function renderPracticeFilters(){return [['all','All skills'],['due',`Due reviews (${dueCount()})`],['tactics','Tactics'],['opening','Openings'],['endgame','Endgames'],['mistakes',`My game mistakes (${data.journal.length})`]].map(([id,label])=>`<button class="btn ${ui.filter===id?'active':'ghost'} small" data-action="practice-filter" data-filter="${id}">${label}</button>`).join('');}
function practicePage(){
 const due=Object.keys(data.review).filter(id=>data.review[id].due<=now());
 const journalDue=ui.filter==='due'?data.journal.filter(m=>due.includes(m.id)):[];
 let bank=D.exercises;
 if(ui.filter==='due')bank=due.map(id=>questions.get(id)).filter(Boolean);
 if(ui.filter==='tactics')bank=bank.filter(e=>lessons.get(e.lesson).module===1);
 if(ui.filter==='opening')bank=bank.filter(e=>[2,3].includes(lessons.get(e.lesson).module));
 if(ui.filter==='endgame')bank=bank.filter(e=>lessons.get(e.lesson).module===5);
 if(ui.filter==='mistakes')bank=[];
 bank=bank.slice(0,ui.filter==='all'?70:90);
 wrap(`${header('PRACTICE STUDIO','Train what matters','Choose specific skills or work through reviews scheduled from your mistakes. Most activities require only moves or short selections.')}
 <div class="toolbar">${renderPracticeFilters()}</div>
 ${ui.filter==='mistakes'?`${data.journal.length?`<div class="grid-lines">${data.journal.slice().reverse().map((m,i)=>`<div class="review-item"><div><span class="chip red">${a(m.label)} · −${m.loss} cp</span><p>${a(m.title)}</p><p class="helper">${a(m.explanation)}</p></div><button class="btn secondary small" data-action="journal-puzzle" data-jid="${a(m.id)}">Retry position →</button></div>`).join('')}</div>`:`<div class="empty"><div class="symbol">♞</div><h3>No game mistakes saved yet</h3><p>Import a PGN under Analyze games, run a Stockfish review, then save a missed position for practice.</p><button class="btn" data-page="analyze">Import a game →</button></div>`}`:
 (bank.length||journalDue.length)?`<div class="grid-lines">${journalDue.map(m=>`<div class="review-item"><div><span class="chip gold">GAME REVIEW · ${a(m.label)}</span><p>${a(m.title)}</p></div><button class="btn secondary small" data-action="journal-puzzle" data-jid="${a(m.id)}">Retry position →</button></div>`).join('')}${bank.map(e=>`<div class="review-item"><div style="min-width:0"><span class="chip ${data.practiceSolved[e.id]?'':'grey'}">${e.kind==='board'?'BOARD MOVE':'CONCEPT'} · ${a(e.id)}</span><p style="margin-top:8px;font-weight:700">${a(e.prompt)}</p><p class="helper">${a(lessons.get(e.lesson).title)} ${data.practiceSolved[e.id]?'· Practiced':''}</p></div><button class="btn secondary small" data-action="open-question" data-qid="${a(e.id)}">Practice →</button></div>`).join('')}</div>`:`<div class="empty"><div class="symbol">✓</div><h3>Nothing due right now</h3><p>Continue your course or choose another practice category. Reviews automatically come back after one, three, seven and more days.</p><button class="btn" data-page="curriculum">Browse lessons</button></div>`}
 `,'Practice');
}
function sourcePage(){wrap(`${header('CITABLE CHESS THEORY','Know where the material comes from','Opening moves and teaching methods are grounded in established resources. Explanations and exercises in Chess Academy are original; references do not imply endorsement.')}
 <div class="panel"><h2>Original coursebook</h2><p class="panel-desc">The previous Volume 1 reference coursebook is included for optional offline study. The interactive course expands beyond it.</p><a class="source-link" href="coursebook.pdf" target="_blank" rel="noopener">Open the coursebook PDF ↗</a></div><div class="panel"><h2>Learning approach</h2><p class="panel-desc">Progressively harder motifs, guided demonstration, unassisted practice and spaced repetition draw on established chess teaching methods such as the Steps Method and online training platforms. Stockfish moves provide calculation, not automatic human-quality teaching.</p></div><div class="src-list">${D.sources.map(s=>`<div class="src"><div><span class="source-no">${a(s.id)}</span><strong>${a(s.title)}</strong></div><p>${a(s.about)}</p><a href="${a(s.url)}" target="_blank" rel="noopener noreferrer">Read the source ↗</a></div>`).join('')}</div>
 <div class="panel" style="margin-top:20px"><h3>Engine license</h3><p class="panel-desc">Stockfish.js 19 is distributed under the GNU General Public License version 3 (GPLv3). The unmodified JavaScript and WebAssembly binaries in this package are from the files you supplied. Consult THIRD_PARTY_NOTICES.md, LICENSE-GPL-3.0.txt and the Stockfish.js source repository for license and corresponding source.</p><a target="_blank" rel="noopener noreferrer" href="https://github.com/nmrugg/stockfish.js">View Stockfish.js source ↗</a></div>`,'Theory & sources');}
function openingLines(){return [
 {id:'italian',name:'Italian Game',side:'White',intro:'Natural development, pressure on f7, and the c3–d4 break.',type:'Open games',line:['e2e4','e7e5','g1f3','b8c6','f1c4','f8c5','c2c3','g8f6','d2d3'],ideas:['Develop the knight with pressure on e5','Bring bishop to c4 to influence f7','Prepare d4 with c3 and protect e4'],ref:'S05'},
 {id:'scotch',name:'Scotch Game',side:'White',intro:'An early central break and an open game.',type:'Open games',line:['e2e4','e7e5','g1f3','b8c6','d2d4','e5d4','f3d4'],ideas:['Push d4 early','Accept more open central lines','Develop quickly rather than hunting pawns'],ref:'S03'},
 {id:'ruy',name:'Ruy Lopez',side:'White',intro:'Pressure on the e5 defender and flexible long-term play.',type:'Open games',line:['e2e4','e7e5','g1f3','b8c6','f1b5','a7a6','b5a4','g8f6','e1g1'],ideas:['Pressure the c6 knight','Maintain central tension','Castle and build pressure'],ref:'S03'},
 {id:'london',name:'London System',side:'White',intro:'A solid d4-based setup with early bishop development.',type:'Queen pawn',line:['d2d4','d7d5','g1f3','g8f6','c1f4','e7e6','e2e3'],ideas:['Develop bishop before closing the chain','React to the opponent instead of playing automatically','Build a safe king and sound center'],ref:'S03'},
 {id:'qg',name:'Queen’s Gambit',side:'White',intro:'Challenge the d5 pawn and learn central pawn tension.',type:'Queen pawn',line:['d2d4','d7d5','c2c4','e7e6','b1c3','g8f6'],ideas:['Challenge the central d5 pawn','Develop knights behind pawn support','Choose when to resolve tension'],ref:'S07'},
 {id:'caro',name:'Caro-Kann',side:'Black',intro:'Support ...d5 with ...c6 and develop a sound structure.',type:'vs 1.e4',line:['e2e4','c7c6','d2d4','d7d5','b1c3','d5e4','c3e4','c8f5'],ideas:['Support ...d5','Activate light-squared bishop before ...e6','Use safe central pressure'],ref:'S06'},
 {id:'french',name:'French Defense',side:'Black',intro:'Use ...e6 and ...d5 to challenge the central pawn chain.',type:'vs 1.e4',line:['e2e4','e7e6','d2d4','d7d5','b1c3','g8f6','e4e5'],ideas:['Challenge the e4 pawn','Prepare pawn breaks against White’s chain','Understand the c8 bishop challenge'],ref:'S03'},
 {id:'sicilian',name:'Sicilian Defense',side:'Black',intro:'Asymmetrical central struggle and unbalanced positions.',type:'vs 1.e4',line:['e2e4','c7c5','g1f3','d7d6','d2d4','c5d4','f3d4','g8f6'],ideas:['Challenge d4 from the flank','Understand asymmetric structure','Avoid memorizing sharp branches without understanding'],ref:'S03'},
 {id:'qgd',name:'Queen’s Gambit Declined',side:'Black',intro:'Reinforce d5 with ...e6 and develop solidly.',type:'vs 1.d4',line:['d2d4','d7d5','c2c4','e7e6','b1c3','g8f6','c1g5','f8e7'],ideas:['Support d5','Develop and castle','Prepare a timely ...c5 break'],ref:'S07'},
 {id:'slav',name:'Slav Defense',side:'Black',intro:'Support the center with ...c6 while retaining bishop options.',type:'vs 1.d4',line:['d2d4','d7d5','c2c4','c7c6','g1f3','g8f6'],ideas:['Use ...c6 to reinforce d5','Retain light-bishop flexibility','Know when ...dxc4 is playable'],ref:'S07'}
 ];}
function openingPage(){const lines=openingLines();const op=lines.find(o=>o.id===ui.openingId)||lines[0];const selected=data.repertoire.includes(op.id);
 const chooser=`<div class="repertoire-grid">${lines.map(o=>`<div class="repertoire-card"><div class="btn-row"><span class="chip ${o.side==='Black'?'gold':''}">${o.side}</span><span class="chip grey">${a(o.type)}</span></div><strong>${a(o.name)}</strong><p>${a(o.intro)}</p><div class="btn-row"><button class="btn ${ui.openingId===o.id?'active':'secondary'} small" data-action="select-opening" data-opening="${o.id}">${ui.openingId===o.id?'Selected':'Explore line'}</button><button class="btn ghost small" data-action="toggle-repertoire" data-opening="${o.id}">${data.repertoire.includes(o.id)?'★ Saved':'☆ Shortlist'}</button></div></div>`).join('')}</div>`;
 const t=op.line.map(u=>[u,`A model move in the ${op.name}. Compare the resulting activity, center, and threats.`]);
 if(!ui.board||!['opening','opening-drill'].includes(ui.board.kind)||ui.board.opening!==op.id){ui.board=makeBoard(C.START_FEN,t,'opening');ui.board.opening=op.id;ui.openingPhase='explore';}
 wrap(`${header('OPENING LABORATORY','Explore before you commit','Compare sound opening choices, study the ideas behind the moves, then shortlist the systems you enjoy.')}
 <div class="panel"><div class="panel-title"><h3>Opening choices</h3><span class="chip">${data.repertoire.length} shortlisted</span></div>${chooser}</div>
 <div class="layout-board"><div><div class="eyebrow">${ui.openingPhase==='drill'?'RECALL TRAINING':'MODEL LINE'} · ${a(op.name)}</div><div style="margin-top:12px">${boardHTML(ui.board)}${ui.openingPhase==='drill'?openingDrillControls(op):boardControls(ui.board,{engineAction:true})}</div></div><div class="panel"><div class="eyebrow">STRATEGY</div><h2 style="margin:8px 0">${a(op.name)}</h2><p class="panel-desc">${a(op.intro)}</p><h3>Typical ideas</h3><div class="checklist" style="margin:15px 0">${op.ideas.map(t=>`<div class="check"><span class="checkmark">✓</span>${a(t)}</div>`).join('')}</div><button class="btn" data-action="toggle-repertoire" data-opening="${op.id}">${selected?'Remove from shortlist':'Add to my shortlist ☆'}</button><div class="divider"></div><h3>Try it</h3><p class="panel-desc">Step through the standard model line with Next or move the pieces yourself. Deviation turns the board into free play. Use Stockfish for alternatives, but remember engines do not teach strategy by themselves.</p><div class="btn-row"><button class="btn" data-action="start-opening-drill">${ui.openingPhase==='drill'?'Restart recall drill':'Practice from memory →'}</button><button class="btn secondary" data-action="exit-opening-drill">${ui.openingPhase==='drill'?'Back to explanation':'Restart model line'}</button></div><p class="helper" style="margin-top:12px">Reference: ${a(D.sources.find(s=>s.id===op.ref)?.title||'Established opening principles')}</p></div></div>${ui.engineResult?engineResponse():''}`,'Opening laboratory');
}
function startOpeningDrill(){
 const op=openingLines().find(o=>o.id===ui.openingId);if(!op)return;
 ui.openingPhase='drill';ui.playSide=op.side==='Black'?-1:1;ui.openingDrillMistakes=0;
 const sequence=op.line.map(u=>[u,'']);const b=makeBoard(C.START_FEN,sequence,'opening-drill');b.opening=op.id;b.flip=ui.playSide===-1;ui.board=b;
 // Let the model opponent make its first move if you train as Black.
 if(ui.playSide===-1){const m=C.fromUci(bs(b),sequence[0][0]);if(m)applyBoardMove(b,m,false);}
 render();
}
function openingDrillControls(op){
 const b=ui.board,completed=b.moves.length>=b.sequence.length,prev=data.openingDrills[op.id];
 return `<div class="feedback ${completed?'good':'info'}" role="status">${completed?`✓ Line recalled! ${ui.openingDrillMistakes?'Review the missed moves and try for a clean run.':'Excellent—no hints or mistakes.'}`:`Your turn as ${a(op.side)}. Find the next model move without highlighted hints. ${ui.openingDrillMistakes>=2?'Need help? Review the original line and return here.':''}`}</div>
 ${b.error?`<div class="feedback bad">${a(b.error)}</div>`:''}
 <div class="btn-row"><button class="btn ghost small" data-action="exit-opening-drill">← Study line</button><button class="btn secondary small" data-action="start-opening-drill">↻ Try again</button></div>
 ${prev?`<p class="helper">Practice runs: ${prev.attempts}. Clean recalls: ${prev.clean||0}.</p>`:''}`;
}
function openingDrillMove(m){const b=ui.board;const expected=b.sequence[b.moves.length];if(!expected)return;
 if(C.uci(m)!==expected[0]){ui.openingDrillMistakes++;b.error='That move is legal, but it is not the move in this studied variation. Try again.';if(ui.openingDrillMistakes>=3){const next=C.fromUci(bs(b),expected[0]);if(next)b.error+=' Study hint: '+C.san(bs(b),next)+'.';}return render();}
 applyBoardMove(b,m,false);
 while(b.moves.length<b.sequence.length&&bs(b).t!==ui.playSide){const x=C.fromUci(bs(b),b.sequence[b.moves.length][0]);if(!x)break;applyBoardMove(b,x,false);}
 if(b.moves.length===b.sequence.length){const old=data.openingDrills[b.opening]||{attempts:0,clean:0};data.openingDrills[b.opening]={attempts:old.attempts+1,clean:(old.clean||0)+(ui.openingDrillMistakes===0?1:0),last:now()};save();}
 render();
}
function cpScore(info){if(!info)return null;if(info.scoreType==='cp')return info.score;if(info.scoreType==='mate')return (info.score>0?1:-1)*(10000-Math.min(100,Math.abs(info.score))*10);return null;}
function uciLabel(fen,move){try{const st=C.parseFen(fen),m=C.fromUci(st,move);return m?C.san(st,m):move;}catch(e){return move;}}
function coachText(fen,result){if(!result||!result.bestmove)return 'The engine did not provide a best move.';
 const s=C.parseFen(fen),m=C.fromUci(s,result.bestmove);if(!m)return 'Stockfish suggests '+result.bestmove+'. Compare its top continuation with your plan.';
 const piece=s.b[m[0]].toLowerCase(),capt=s.b[m[1]]!=='.',check=C.san(s,m).includes('+'),mate=C.san(s,m).includes('#');
 if(mate)return 'A forced checkmate is available. The engine’s move ends the game immediately.';
 if(m[3]==='castle')return 'Castling improves king safety and helps connect your rooks. Check whether any concrete threat overrides it.';
 if(check)return 'This move gives check, forcing the opponent to respond. Compare the replies before choosing a quiet move.';
 if(capt)return 'The engine prefers a capture here. Examine the material balance and the opponent’s best recapture.';
 if(piece==='p')return 'A pawn move changes the center, space or open lines. Check the immediate exchanges and newly opened squares.';
 if(piece==='n'||piece==='b')return 'This improves or redirects a minor piece. Look at which squares and pieces it now influences.';
 return 'This is Stockfish’s strongest calculated continuation at the displayed search depth. Compare the threats and replies shown in its principal variation.';
}
function mistakeReason(afterFen,replyUci){
 if(!replyUci)return 'Review the opponent’s strongest reply to understand what changed.';
 try{
  const s=C.parseFen(afterFen),m=C.fromUci(s,replyUci);if(!m)return 'Inspect the continuation for the tactical consequence.';
  const san=C.san(s,m),captured=m[3]==='ep'?'p':s.b[m[1]].toLowerCase();
  const names={p:'pawn',n:'knight',b:'bishop',r:'rook',q:'queen'};
  if(san.includes('#'))return `The opponent can respond with ${san}, delivering checkmate.`;
  if(captured!=='.'&&names[captured])return `The opponent can respond with ${san}, capturing a ${names[captured]}. Check whether that capture can be answered.`;
  if(san.includes('+'))return `The opponent has the forcing check ${san}. Look at the follow-up before choosing your move.`;
  return `Compare the opponent’s calculated reply ${san} with the position after the engine’s recommended alternative.`;
 }catch(e){return 'Compare the forcing replies to the played move and to the suggested alternative.';}
}
function engineResponse(){const r=ui.engineResult;if(!r)return '';return `<div class="panel" id="engine-response"><div class="panel-title"><h3>♞ Stockfish position analysis</h3><span class="chip ${r.error?'red':''}">${a(r.error?'Unavailable':r.mode||'Engine')}</span></div>${r.error?`<div class="feedback bad">${a(r.error)}</div>`:`<div class="cols-2"><div><div class="eyebrow">ENGINE RECOMMENDATION</div><h2 style="margin:9px 0">${a(uciLabel(r.fen,r.bestmove))}</h2><div class="helper">Depth ${r.depth||'?'} · ${r.scoreType==='mate'?`Mate in ${r.score}`:`${r.score!=null?(r.score/100).toFixed(2):'—'} pawns (side to move)`}</div><p class="panel-desc">${a(coachText(r.fen,r))}</p></div><div><div class="eyebrow">CALCULATED LINE (UCI)</div><p class="engine-result">${a((r.pv||[]).slice(0,12).join(' · ')||r.bestmove)}</p><p class="helper" style="margin-top:9px">Engine analysis is approximate and may change with depth. Explanations are rules-based, not generated by Stockfish itself.</p></div></div>`}</div>`;}
async function analysePosition(){if(ui.engineBusy)return;const board=ui.board;if(!board)return;ui.engineBusy=true;ui.engineResult=null;ui.notice='Stockfish is analyzing this position…';render();try{const fen=C.toFen(bs(board));await engine.start(data.settings.mode);let result=await engine.analyze(fen,{depth:data.settings.depth,movetime:data.settings.mode==='full'?700:320});ui.engineResult={...result,fen};ui.notice='';}catch(err){ui.engineResult={error:err.message};ui.notice='';}finally{ui.engineBusy=false;render();}}
function initGame(){ui.game=null;ui.gamePly=0;ui.pgnText='';ui.board=makeBoard(C.START_FEN,[],'analysis');ui.engineResult=null;ui.gameReviewBusy=false;ui.gameReviewText='';}
function getGameMoves(text){
 const tags={};String(text).replace(/^\s*\[([^\s]+)\s+"((?:\\.|[^"])*)"\s*\]\s*$/gm,(_full,k,v)=>(tags[k]=v,''));
 let txt=String(text).replace(/^\s*\[[^\r\n]*\]\s*$/gm,' ').replace(/\{[^}]*\}/g,' ').replace(/;[^\r\n]*/g,' ').replace(/\$\d+/g,' ').replace(/\d+\.(?:\.\.)?/g,' ').replace(/(?:1-0|0-1|1\/2-1\/2|\*)/g,' ');
 // Remove nested parenthesized variations, keeping the main line.
 let cleaned='',depth=0;for(const c of txt){if(c==='('){depth++;continue;}if(c===')'){depth=Math.max(0,depth-1);continue;}if(!depth)cleaned+=c;}
 const tokens=cleaned.split(/\s+/).map(x=>x.trim()).filter(Boolean);
 let state=C.parseFen(tags.FEN||C.START_FEN),states=[C.toFen(state)],moves=[],sans=[];
 for(const token of tokens){
  if(moves.length>=400)throw Error('Games longer than 400 half-moves are not supported in this version.');
  const goal=token.replace(/[!?+#]+$/g,'').replace(/0/g,'O').replace(/e\.p\.$/,'').replace(/\s/g,'');
  const found=C.legal(state).find(m=>C.san(state,m).replace(/[+#]/g,'')===goal||C.uci(m)===token);
  if(!found)throw Error(`Could not read PGN move “${token}” at ply ${moves.length+1}. Check the PGN format, comments, or FEN tag.`);
  sans.push(C.label(state,found));moves.push(C.uci(found));state=C.apply(state,found);states.push(C.toFen(state));
 }
 if(!moves.length)throw Error('No legal mainline moves found in that PGN.');
 return {tags,moves,states,sans,raw:text,review:[],time:now()};
}
function gameView(){if(!ui.game)return `<div class="empty"><div class="symbol">♞</div><h3>Import your first game</h3><p>Paste a PGN below, or upload a .pgn file exported from Chess.com or Lichess. We analyze the mainline positions only; private account connection isn't needed.</p></div>`;
 const g=ui.game,ply=ui.gamePly;
 return `<div class="layout-board"><div>${boardHTML(ui.board)}<div class="btn-row" style="margin-top:12px"><button class="btn ghost small" data-action="game-ply" data-ply="${clamp(ply-1,0,g.moves.length)}">← Previous</button><button class="btn secondary small" data-action="game-ply" data-ply="${clamp(ply+1,0,g.moves.length)}">Next →</button><button class="btn ghost small" data-action="board-flip">Flip</button><button class="btn ghost small" data-action="analyze-position">Analyze this position</button></div><div class="move-list">${g.sans.map((m,i)=>`<button class="move ${i+1===ply?'active':''}" data-action="game-ply" data-ply="${i+1}">${a(m)}</button>`).join('')}</div></div><div class="panel"><div class="eyebrow">IMPORTED GAME</div><h2 style="margin:8px 0">${a(g.tags.White||'White')} vs ${a(g.tags.Black||'Black')}</h2><p class="helper">${a(g.tags.Event||'PGN import')} · ${g.moves.length} half-moves · ${ply===0?'Starting position':g.sans[ply-1]}</p><div class="divider"></div><h3>Stockfish review</h3><p class="panel-desc">Review ${Math.min(g.moves.length,data.settings.reviewLimit)} half-moves to identify significant evaluation drops, compare alternatives, and save missed positions as personalized drills. Deeper and longer reviews take more time.</p><div class="toolbar"><label class="helper" for="review-limit">Review length</label><select id="review-limit" class="select">${[40,80,160,400].map(n=>`<option value="${n}" ${data.settings.reviewLimit===n?'selected':''}>${n===400?'Up to 400':'First '+n} half-moves</option>`).join('')}</select></div>${ui.gameReviewBusy?`<div class="feedback info" id="analyze-progress">${a(ui.gameReviewText||'Analyzing game…')}</div><button class="btn ghost small" data-action="cancel-review">Stop after current position</button>`:`<div class="btn-row"><button class="btn" data-action="review-game">♞ Review game</button><button class="btn ghost" data-action="analyze-position">Single position</button></div>`}${g.review?.length?`<div class="section-label">REVIEW FINDINGS</div><div class="grid-lines">${g.review.slice(0,15).map(m=>`<div class="mini-panel"><span class="chip ${m.loss>=180?'red':'gold'}">${a(m.label)} · ${m.loss} cp</span><p style="font-weight:700;margin:7px 0">${a(m.title)}</p><p class="helper">${a(m.explanation)}</p><button class="link" data-action="game-ply" data-ply="${m.ply}">Inspect position →</button> <button class="link" data-action="save-mistake" data-ply="${m.ply}">Save for practice ☆</button></div>`).join('')}</div>`:''}</div></div>`;
}
function renderAnalysis(){if(!ui.board||ui.board.kind!=='analysis')ui.board=makeBoard(C.START_FEN,[],'analysis');wrap(`${header('ENGINE LAB','Analyze your games','Import a Chess.com or Lichess PGN, inspect each move, and use Stockfish for concrete alternatives. All analysis runs in your browser.')}
 <div class="panel"><div class="panel-title"><h3>Import a PGN</h3><button class="btn ghost small" data-action="load-pgn-file">↑ Upload .pgn</button></div><textarea id="pgn-text" class="input pgn-area" placeholder='Paste a PGN here, e.g. [White "Me"] and the moves…'>${a(ui.pgnText)}</textarea><div class="btn-row" style="margin-top:11px"><button class="btn" data-action="parse-pgn">Load game →</button><button class="btn ghost" data-action="sample-pgn">Try example game</button>${data.games.length?`<button class="btn ghost" data-action="latest-game">Open saved game</button>`:''}</div><p class="helper" style="margin-top:10px">Supports standard SAN mainlines, headers, comments and nested variations (ignored). An incorrect or unsupported move produces an explicit error instead of a fabricated board.</p></div>
 ${ui.error?`<div class="feedback bad">${a(ui.error)}</div>`:''}${gameView()}${ui.engineResult?engineResponse():''}
 <div class="panel" style="margin-top:20px"><h3>Personal mistake journal</h3><p class="panel-desc">Saved game mistakes become playable “find the better move” puzzles. Engine scores are approximate, not verdicts on your chess intelligence.</p><div class="btn-row"><span class="chip">${data.journal.length} saved positions</span><button class="btn secondary small" data-page="practice" data-filter="mistakes">Open mistake drills →</button></div></div>`,'Game analysis');}
function setGamePly(ply){if(!ui.game)return;ui.gamePly=clamp(ply,0,ui.game.moves.length);const flip=ui.board?.flip||false;ui.board=makeBoard(ui.game.states[ui.gamePly],[],'analysis');ui.board.flip=flip;ui.engineResult=null;render();}
async function reviewGame(){if(!ui.game||ui.gameReviewBusy)return;const game=ui.game;ui.gameReviewBusy=true;ui.cancelReview=false;ui.gameReviewText='Starting Stockfish…';ui.notice='';render();try{
 await engine.start(data.settings.mode);const findings=[];const n=Math.min(data.settings.reviewLimit||40,game.moves.length);let cachedPrior=null;
 for(let i=0;i<n;i++){
  if(ui.cancelReview)break;
  const before=game.states[i],after=game.states[i+1];const b=cachedPrior||await engine.analyze(before,{depth:9,movetime:160});
  const ainfo=await engine.analyze(after,{depth:9,movetime:160});cachedPrior=ainfo;
  const beforeCp=cpScore(b),afterCp=cpScore(ainfo);if(beforeCp==null||afterCp==null)continue;
  const loss=clamp(Math.round(beforeCp+afterCp),0,10000);
  if(loss>=80&&b.bestmove&&C.fromUci(C.parseFen(before),b.bestmove)){
   const played=game.moves[i],name=game.sans[i];const best=b.bestmove;let label=loss>=260?'Major mistake':loss>=140?'Mistake':'Inaccuracy';
   const suggestion=best?uciLabel(before,best):'an alternative';
   const explanation=`After ${name}, ${mistakeReason(after,ainfo.bestmove)} Stockfish preferred ${suggestion}; this was about ${(loss/100).toFixed(1)} pawns better at the sampled depth.`;
   findings.push({id:'G'+game.time+'-'+i,ply:i,fen:before,played,best,loss,label,title:`${name} · better: ${suggestion}`,explanation,depth:b.depth||9});
  }
  ui.gameReviewText=`Analyzed ${i+1} of ${n} half-moves · ${findings.length} moments to study`;
  const progress=$('analyze-progress');if(progress)progress.textContent=ui.gameReviewText;
 }
 game.review=findings;data.games=[{raw:game.raw,tags:game.tags,when:now(),review:findings.slice(0,30)},...data.games.filter(x=>x.raw!==game.raw)].slice(0,8);save();ui.notice=ui.cancelReview?`Review stopped. Saved ${findings.length} findings from the positions checked so far.`:`Stockfish review complete: ${findings.length} noteworthy evaluation drops among ${n} half-moves checked. Review depth was limited; investigate surprising labels.`;
 }catch(err){ui.error='Game review could not finish: '+err.message;}finally{ui.gameReviewBusy=false;render();}
}
function saveMistake(ply){const m=ui.game?.review?.find(x=>x.ply===ply);if(!m)return;if(data.journal.some(x=>x.id===m.id)){ui.notice='Already saved in your mistake journal.';return render();}
 data.journal=[...data.journal,m].slice(-80);save();ui.notice='Saved this position to your mistake journal.';render();}
function launchJournal(id){const m=data.journal.find(v=>v.id===id);if(!m)return;ui.practiceId=null;ui.journalId=id;ui.page='journal';ui.board=makeBoard(m.fen,[],'question');ui.attemptWrong=0;ui.feedback=null;ui.feedbackGood=false;render();}
function journalPage(){const m=data.journal.find(v=>v.id===ui.journalId);if(!m)return practicePage();wrap(`${header('YOUR GAME · CORRECT THE MISTAKE','Find the better move','Try a different continuation in the position from your actual game. One engine best move is used for this exercise; other good moves may also exist.')}
 <div class="layout-board"><div>${boardHTML(ui.board)}</div><div class="panel"><div class="eyebrow">PERSONAL DRILL</div><h2 style="margin:8px 0">${a(m.title)}</h2><p class="panel-desc">Find Stockfish’s preferred move rather than repeating ${a(uciLabel(m.fen,m.played))}.</p>${ui.feedback?`<div class="feedback ${ui.feedbackGood?'':'gold'}">${a(ui.feedback)}</div>`:`<p class="helper">Choose a legal move. A short explanation will follow.</p>`}<div class="btn-row"><button class="btn ghost small" data-page="practice" data-filter="mistakes">← Mistake journal</button><button class="btn ghost small" data-action="reveal-journal">Show suggested move</button></div></div></div>`,'Mistake correction');}
function playPage(){if(!ui.board||ui.board.kind!=='play')ui.board=makeBoard(C.START_FEN,[],'play');const s=bs(ui.board),st=C.status(ui.board.history);wrap(`${header('PRACTICE GAME','Play against Stockfish','Apply your opening, tactics and endgame knowledge in a game. Use reduced engine search for a gentler opponent; it is not a calibrated Elo rating.')}
 <div class="layout-board"><div>${boardHTML(ui.board)}<div class="btn-row" style="margin-top:12px"><button class="btn ghost small" data-action="new-computer-game">↻ New game</button><button class="btn ghost small" data-action="board-flip">⇅ Flip</button><button class="btn ghost small" data-action="analyze-position">Analyze position</button></div><div class="move-list">${ui.board.labels.map(x=>`<span class="move">${a(x)}</span>`).join('')}</div></div>
 <div class="panel"><div class="eyebrow">ENGINE OPPONENT</div><h2 style="margin:9px 0">${a(st.text)}</h2><p class="panel-desc">Stockfish makes its move after yours. “Gentle” uses a shallow search; “Challenging” searches further. The same engine computes the moves.</p><div class="toolbar"><label class="helper" for="difficulty">Difficulty</label><select id="difficulty" class="select"><option value="2" ${ui.playDepth===2?'selected':''}>Gentle · depth 2</option><option value="5" ${(!ui.playDepth||ui.playDepth===5)?'selected':''}>Moderate · depth 5</option><option value="9" ${ui.playDepth===9?'selected':''}>Challenging · depth 9</option></select></div><p class="helper">You play White. ${ui.playing?'Stockfish is thinking…':'Click a White piece and a legal destination.'} We do not use unsupported strength or Elo claims.</p><div class="divider"></div><h3>After the game</h3><p class="panel-desc">Copy your game's PGN from the menu below to review it. A normal practice game may also be used to find new mistakes.</p><button class="btn secondary" data-action="copy-play-pgn">Copy game PGN</button></div></div>${ui.engineResult?engineResponse():''}`,'Play Stockfish');}
async function computerReply(){if(ui.playing)return;const b=ui.board;if(b.kind!=='play'||C.status(b.history).done||bs(b).t!==-1)return;ui.playing=true;render();try{await engine.start('lite');const move=await engine.bestmove(C.toFen(bs(b)),ui.playDepth||5);const m=C.fromUci(bs(b),move);if(m&&ui.board===b){applyBoardMove(b,m,false);}}catch(e){ui.notice='Computer move failed: '+e.message;}finally{ui.playing=false;render();}}
function progressPage(){let attempts=Object.values(data.attempts).flat(),passed=attempts.filter(x=>x.passed).length;wrap(`${header('YOUR LEARNING RECORD','See what you have mastered','Lesson completion is earned through unassisted assessments. Due reviews test whether you retain skills over time.')}${stats()}
 <div class="cols-2"><div class="panel"><h3>Course mastery by module</h3><div class="grid-lines" style="margin-top:17px">${D.modules.map(m=>`<div>${renderBars(m.name,m.ids.filter(isMastered).length,m.ids.length)}</div>`).join('')}</div></div><div class="panel"><h3>Performance</h3><div class="stats" style="grid-template-columns:repeat(2,1fr);margin-top:16px"><div class="mini-panel"><div class="muted">Mastery attempts</div><h2>${attempts.length}</h2></div><div class="mini-panel"><div class="muted">Tests passed</div><h2>${passed}</h2></div></div><h3 style="margin-top:20px">Study and review</h3><p class="panel-desc">${Object.keys(data.studied).length} lessons opened · ${dueCount()} scheduled reviews due. Do not confuse course progress with an official online chess rating.</p><div class="btn-row"><button class="btn secondary" data-page="practice" data-filter="due">Practice due reviews</button><button class="btn ghost" data-page="settings">Back up data</button></div></div></div><div class="panel"><div class="panel-title"><h3>Latest mastery attempts</h3></div>${attempts.length?`<div class="grid-lines">${Object.entries(data.attempts).flatMap(([id,list])=>list.map(x=>({id,...x}))).sort((x,y)=>y.time-x.time).slice(0,15).map(x=>`<div class="review-item"><div><strong>${a(lessons.get(Number(x.id))?.title)}</strong><p>${new Date(x.time).toLocaleDateString()} · ${x.correct}/${x.total} correct</p></div><span class="chip ${x.passed?'':'red'}">${x.passed?'Passed':'Retry'}</span></div>`).join('')}</div>`:`<div class="empty"><p>No mastery assessments completed yet.</p></div>`}</div>`,'Progress');}
function settingsPage(){const st=engine.getStatus();wrap(`${header('APP SETTINGS','Make it yours','Local progress is fully usable without an account. Cross-device sync can be added after hosting and account setup.')}
 <div class="cols-2"><div class="panel"><h3>Stockfish configuration</h3><p class="panel-desc">The supplied Stockfish 19 Lite engine works on ordinary modern browsers. Full multithreaded Stockfish requires a secure cross-origin-isolated site with the correct headers.</p><div class="grid-lines"><div><label for="engine-mode" class="helper">Engine profile</label><select id="engine-mode" class="select" style="width:100%;margin-top:6px"><option value="lite" ${data.settings.mode==='lite'?'selected':''}>Lite, single-threaded · fast and portable</option><option value="full" ${data.settings.mode==='full'?'selected':''} ${st.canFull?'':'disabled'}>Full, multithreaded · advanced analysis ${st.canFull?'':'(hosting headers required)'}</option></select></div><div><label for="engine-depth" class="helper">Position analysis depth</label><select id="engine-depth" class="select" style="width:100%;margin-top:6px">${[6,9,11,14,18].map(d=>`<option value="${d}" ${data.settings.depth===d?'selected':''}>Depth ${d}${d>=14?' · slower':''}</option>`).join('')}</select></div><button class="btn secondary" data-action="engine-test">Test Stockfish engine</button><div class="mini-panel"><span class="status-dot ${st.ready?'ready':''}"></span> ${a(st.ready?`Running ${st.mode}`:st.loading?'Loading…':'Not running')}<p class="helper">${a(st.error||'Stockfish starts when requested. It runs on this device, not a remote analysis server.')}</p></div></div></div>
 <div class="panel"><h3>Progress storage and backup</h3><p class="panel-desc">Your lessons, study results, reminders, repertoires and mistake journal are saved in this browser's local storage. They do not automatically sync with another device. An optional cloud account requires a separately configured backend.</p><div class="btn-row"><button class="btn" data-action="export">↓ Export progress .json</button><button class="btn secondary" data-action="progress-file">↑ Import backup</button></div><div class="divider"></div><h3>Installation</h3><p class="panel-desc">Use the included <span class="inline-code">start-server.bat</span> (Windows) or <span class="inline-code">python server.py</span>. This enables browser engine workers. Directly opening the HTML as a <span class="inline-code">file://</span> page may block WebAssembly and storage features.</p><p class="helper">PWA install depends on your browser and a secure hosting context. Your course remains free.</p></div></div><div class="panel"><h3>Privacy and limitations</h3><p class="panel-desc">No cloud account, automatic game fetching, AI text interpretation, or server-side database is included in this package. Stockfish identifies candidate moves and evaluations; concise explanations are limited to verified, rules-based ideas plus authored course feedback.</p></div>`,'Settings');}
function render(){switch(ui.page){case'dashboard':dashboard();break;case'curriculum':curriculum();break;case'lesson':lessonPage();break;case'exercise':practiceQuestion();break;case'placement':placement();break;case'practice':practicePage();break;case'openings':openingPage();break;case'analyze':renderAnalysis();break;case'journal':journalPage();break;case'play':playPage();break;case'progress':progressPage();break;case'sources':sourcePage();break;case'settings':settingsPage();break;default:dashboard();}}
function nav(page,arg=null){if(page==='lesson')return initLesson(Number(arg||nextLesson()));ui.page=page;ui.menu=false;ui.notice='';ui.engineResult=null;if(page==='placement'&&ui.exam?.kind!=='placement')ui.exam=null;
 if(page==='curriculum'&&arg!=null)ui.moduleOpen=Number(arg);
 if(page==='practice'&&arg!=null)ui.filter=arg;
 if(page==='analyze'&&!ui.board)initGame();
 if(page==='play'){ui.board=makeBoard(C.START_FEN,[],'play');ui.playing=false;ui.playDepth=ui.playDepth||5;}
 if(page==='openings'){ui.board=null;ui.openingPhase='explore';}
 render();window.scrollTo?.({top:0,behavior:'instant'});
}
function chooseSquare(i){const b=ui.board;if(!b)return;if(b.kind==='opening-drill'&&b.moves.length===b.sequence.length)return;const s=bs(b),legal=C.legal(s);
 if((ui.exam&&!ui.exam.showReview&&ui.exam.answered!==null)||ui.playing)return;
 if(b.kind==='play'&&s.t!==1)return;
 const side=C.side(s.b[i]);if(side===s.t){b.selected=b.selected===i?-1:i;b.error='';return render();}
 const choices=legal.filter(m=>m[0]===b.selected&&m[1]===i);
 if(choices.length===1)return handleMove(choices[0]);
 if(choices.length>1){b.pending=choices;return render();}
 b.error='Select a piece and then a highlighted legal square.';render();
}
function applyBoardMove(b,m,rerender=true){const s=bs(b);const san=C.label(s,m);b.history.push(C.apply(s,m));b.moves.push(C.uci(m));b.labels.push(san);b.last=[m[0],m[1]];b.selected=-1;b.pending=null;b.error='';b.guided=b.sequence.every((x,i)=>!b.moves[i]||b.moves[i]===x[0]);if(rerender)render();}
function handleMove(m){const b=ui.board;if(!b)return;
 if(ui.page==='openings'&&b.kind==='opening-drill')return openingDrillMove(m);
 if(ui.page==='journal'){
  const found=data.journal.find(x=>x.id===ui.journalId);if(!found)return;
  if(C.uci(m)===found.best){applyBoardMove(b,m,false);ui.feedback='Good: '+found.explanation;ui.feedbackGood=true;schedule(found.id,true);}
  else{ui.attemptWrong++;schedule(found.id,false);ui.feedback=`This legal move was not Stockfish’s top choice in the saved analysis. The suggested move was ${uciLabel(found.fen,found.best)}.`;ui.feedbackGood=false;}
  return render();
 }
 if(ui.exam&&((ui.page==='placement'&&ui.exam.kind==='placement')||(ui.page==='lesson'&&ui.phase==='mastery'&&ui.exam.kind==='mastery'))){
  const q=ui.exam.items[ui.exam.index];if(!q||q.kind!=='board')return;
  const good=C.uci(m)===q.answer;if(good)applyBoardMove(b,m,false);submitExam(good);return;
 }
 if(ui.page==='exercise'){
  const q=questions.get(ui.practiceId);if(q?.kind!=='board'||ui.feedback)return;
  if(C.uci(m)===q.answer){applyBoardMove(b,m,false);solvePractice(true,q.explanation,ui.showHint||ui.attemptWrong>0);}else solvePractice(false,q.explanation);return;
 }
 if(ui.page==='play'){applyBoardMove(b,m,false);render();computerReply();return;}
 if(ui.page==='analyze'){applyBoardMove(b,m);return;}
 applyBoardMove(b,m);
}
function navigateBoardBack(){const b=ui.board;if(!b||b.moves.length===0)return;b.history.pop();b.moves.pop();b.labels.pop();b.last=null;b.selected=-1;b.pending=null;b.guided=b.moves.every((x,i)=>x===b.sequence[i]?.[0]);b.error='';render();}
function navigateBoardNext(){const b=ui.board;if(!b||b.kind==='question'||!b.guided)return;const item=b.sequence[b.moves.length];if(!item)return;const m=C.fromUci(bs(b),item[0]);if(m)applyBoardMove(b,m);}
function restartBoard(){const b=ui.board;if(!b)return;ui.board=makeBoard(b.initial,b.sequence,b.kind);ui.board.flip=b.flip;ui.board.opening=b.opening;ui.engineResult=null;render();}
function shuffle(items){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function boardOrMCchoice(answer){const e=ui.exam;if(!e||e.answered!==null)return;const q=e.items[e.index];if(q.kind!=='mc')return;submitExam(answer===q.answer);}
function chooseMC(answer){const q=questions.get(ui.practiceId);if(!q||ui.feedback||q.kind!=='mc')return;solvePractice(Number(answer)===q.answer,q.explanation,ui.showHint||ui.attemptWrong>0);}
function exportProgress(){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='Chess-Academy-progress-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function escapePGNTag(s){return String(s||'').replace(/["\\]/g,'');}
function gamePgnFromBoard(b){let result='[Event "Chess Academy practice"]\n[White "Student"]\n[Black "Stockfish Lite"]\n\n';for(let i=0;i<b.labels.length;i++)result+=(i%2===0?Math.floor(i/2)+1+'. ':'')+b.labels[i].replace(/^\d+(?:\.\.\.|\.)\s*/,'')+' ';return result+'*';}
async function loadPGNfile(file){if(!file)return;ui.pgnText=await file.text();nav('analyze');}
async function loadBackup(file){try{const d=JSON.parse(await file.text());if(d.version!==2||!d.mastered||!d.review)throw Error('Not a Chess Academy 2.0 progress backup.');data={...starter(),...d,opened:{...(d.opened||d.studied||{})},studied:d.opened?d.studied||{}:{},completed:d.completed||{}};save();ui.notice='Progress backup restored successfully.';nav('dashboard');}catch(e){ui.notice='Backup import failed: '+e.message;render();}}
function action(name,el){switch(name){
 case'menu':ui.menu=!ui.menu;return render();case'close-menu':ui.menu=false;return render();case'dismiss':ui.notice='';return render();
 case'start-placement':return startAssessment('placement');
 case'lesson-phase':ui.phase=el.dataset.phase;if(ui.phase==='practice'){data.studied[ui.id]=data.studied[ui.id]||now();save();}ui.board=makeBoard(lessons.get(ui.id).fen,lessons.get(ui.id).line,'lesson');return render();
 case'start-mastery':return startAssessment('mastery',Number(el.dataset.id||ui.id));
 case'exam-choice':return boardOrMCchoice(Number(el.dataset.choice));case'exam-next':return nextExam();
 case'open-question':return openPractice(el.dataset.qid);
 case'choose-question':return chooseMC(Number(el.dataset.choice));
 case'hint':ui.showHint=!ui.showHint;return render();
 case'reveal-answer':{const e=questions.get(ui.practiceId);if(!e)return;return solvePractice(true,e.explanation,true);}
 case'open-next-question':{const list=D.exercises.filter(e=>e.id!==ui.practiceId);return openPractice(list[Math.floor(Math.random()*list.length)].id);}
 case'practice-filter':ui.filter=el.dataset.filter;return render();
 case'preview-start':case'preview-back':case'preview-next':case'preview-end':case'preview-jump':{const p=ui.preview;if(!p)return;const count=p.moves.length;p.index=name==='preview-start'?0:name==='preview-back'?Math.max(0,p.index-1):name==='preview-next'?Math.min(count,p.index+1):name==='preview-end'?count:Math.max(0,Math.min(count,Number(el.dataset.ply)));return render();}
 case'board-jump':{const target=Number(el.dataset.ply);if(!ui.board||ui.board.kind==='question')return;while(ui.board.moves.length>target){ui.board.history.pop();ui.board.moves.pop();ui.board.labels.pop();}ui.board.last=null;ui.board.selected=-1;ui.board.pending=null;ui.board.guided=ui.board.moves.every((u,i)=>u===ui.board.sequence[i]?.[0]);return render();}
 case'board-back':return navigateBoardBack();case'board-next':return navigateBoardNext();case'board-restart':return restartBoard();case'board-flip':ui.board.flip=!ui.board.flip;return render();
 case'promote':{const m=ui.board?.pending?.find(x=>C.uci(x)===el.dataset.uci);if(m)handleMove(m);return;}
 case'analyze-position':return analysePosition();
 case'select-opening':ui.openingId=el.dataset.opening;ui.openingPhase='explore';ui.board=null;ui.engineResult=null;return render();
 case'toggle-repertoire':{const id=el.dataset.opening;if(data.repertoire.includes(id))data.repertoire=data.repertoire.filter(x=>x!==id);else data.repertoire.push(id);save();return render();}
 case'start-opening-drill':return startOpeningDrill();
 case'exit-opening-drill':ui.openingPhase='explore';ui.board=null;return render();
 case'restart-opening':return restartBoard();
 case'load-pgn-file':return $('import-pgn').click();
 case'parse-pgn':try{ui.error='';ui.game=getGameMoves($('pgn-text').value);ui.pgnText=$('pgn-text').value;ui.gamePly=0;ui.board=makeBoard(ui.game.states[0],[],'analysis');ui.engineResult=null;return render();}catch(e){ui.error=e.message;return render();}
 case'sample-pgn':{ui.pgnText='[Event "Example Italian Game"]\n[White "Student"]\n[Black "Opponent"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O O-O 7. Re1 a6 8. Bb3 Ba7 9. h3 h6 *';try{ui.game=getGameMoves(ui.pgnText);ui.gamePly=0;ui.board=makeBoard(ui.game.states[0],[],'analysis');ui.error='';}catch(e){ui.error=e.message;}return render();}
 case'latest-game':{const x=data.games[0];if(!x)return;try{ui.game=getGameMoves(x.raw);ui.game.review=x.review||[];ui.pgnText=x.raw;ui.gamePly=0;ui.board=makeBoard(ui.game.states[0],[],'analysis');ui.error='';}catch(e){ui.error=e.message;}return render();}
 case'game-ply':return setGamePly(Number(el.dataset.ply));
 case'review-game':return reviewGame();case'cancel-review':ui.cancelReview=true;ui.gameReviewText='Finishing the current search…';return render();case'save-mistake':return saveMistake(Number(el.dataset.ply));
 case'journal-puzzle':return launchJournal(el.dataset.jid);
 case'reveal-journal':{const m=data.journal.find(x=>x.id===ui.journalId);ui.feedback=m?`Suggested: ${uciLabel(m.fen,m.best)}. ${m.explanation}`:'';ui.feedbackGood=false;return render();}
 case'new-computer-game':ui.board=makeBoard(C.START_FEN,[],'play');ui.playing=false;return render();
 case'copy-play-pgn':{const p=gamePgnFromBoard(ui.board);if(navigator.clipboard?.writeText)navigator.clipboard.writeText(p).then(()=>{ui.notice='Game PGN copied.';render();}).catch(()=>{ui.notice='Clipboard unavailable; open the browser developer console to copy the game.';render();});else{ui.notice='Clipboard requires HTTPS or localhost.';render();}return;}
 case'export':return exportProgress();case'progress-file':return $('import-progress').click();
 case'engine-test':ui.notice='Testing Stockfish…';render();engine.start(data.settings.mode).then(()=>engine.analyze(C.START_FEN,{depth:5,movetime:150})).then(x=>{ui.notice=`Stockfish ready: ${x.bestmove} at depth ${x.depth||5}.`;render();}).catch(e=>{ui.notice='Engine test failed: '+e.message;render();});return;
 }}
document.addEventListener('click',e=>{
 const sq=e.target.closest?.('[data-sq]');if(sq){e.preventDefault();chooseSquare(Number(sq.dataset.sq));return;}
 const btn=e.target.closest?.('[data-page],[data-action]');if(!btn)return;
 e.preventDefault();if(btn.dataset.page){const pg=btn.dataset.page;if(pg==='lesson')nav('lesson',btn.dataset.id);else nav(pg,btn.dataset.filter??btn.dataset.module??null);return;}
 if(btn.dataset.action)action(btn.dataset.action,btn);
});
document.addEventListener('change',e=>{
 if(e.target.id==='import-pgn'){loadPGNfile(e.target.files?.[0]);e.target.value='';}
 if(e.target.id==='import-progress'){loadBackup(e.target.files?.[0]);e.target.value='';}
 if(e.target.id==='engine-mode'){data.settings.mode=e.target.value;engine.stop();save();render();}
 if(e.target.id==='engine-depth'){data.settings.depth=Number(e.target.value);save();render();}
 if(e.target.id==='difficulty'){ui.playDepth=Number(e.target.value);}
 if(e.target.id==='review-limit'){data.settings.reviewLimit=Number(e.target.value);save();render();}
});
document.addEventListener('input',e=>{if(e.target.id==='course-search'){ui.search=e.target.value;const pos=e.target.selectionStart;curriculum();const input=$('course-search');input?.focus();input?.setSelectionRange(pos,pos);}if(e.target.id==='pgn-text')ui.pgnText=e.target.value;});
engine.onState=()=>{};
ui.id=canResume(data.lastLesson)?data.lastLesson:nextLesson();
render();
window.__CHESS_ACADEMY_TEST__={C,D,engine,get data(){return data;},get ui(){return ui;},nav,startAssessment,getGameMoves,exFen,coachText,render,save,setGamePly,reviewGame};
})();

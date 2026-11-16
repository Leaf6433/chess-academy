const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const app={innerHTML:''},events={},timers=[];
const sandbox={console,Promise,Math:Object.assign(Object.create(Math),{random:()=>0}),Date,Map,Set,URL,location:{href:'http://localhost/'},navigator:{},localStorage:{getItem(){return null},setItem(){}},document:{getElementById(id){return id==='app'?app:null},addEventListener(name,fn){events[name]=fn}},scrollTo(){},setTimeout(fn,ms){timers.push({fn,ms});return timers.length},clearTimeout(){}};
sandbox.window=sandbox;
sandbox.EngineService=class{constructor(){this.ready=true}getStatus(){return {ready:true,mode:'lite'}}start(){return Promise.resolve()}bestmove(){return Promise.resolve('e7e5')}};
vm.createContext(sandbox);
for(const file of ['chess-engine.js','course-data-v2.js','foundation-drills.js','board-drills.js','mastery-positions.js','mastery-concepts.js','lesson-deep-dives.js','lesson-scenes.js','board-workshops.js','opening-study.js','puzzle-bank.js','bot-opponents.js','app.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),sandbox);
const t=sandbox.__CHESS_ACADEMY_TEST__;
const click=dataset=>events.click({preventDefault(){},target:{closest(sel){return sel==='[data-sq]'?(dataset.sq?{dataset}:null):dataset.action?{dataset}:null}}});
function whiteMove(){for(const sq of ['e2','e4'])click({sq:String(t.C.index(sq))});}
async function flush(){for(let i=0;i<8;i++)await Promise.resolve();}
(async()=>{
 t.nav('play');assert(app.innerHTML.includes('Sprout · ~250'));
 whiteMove();const old=t.ui.board;assert(t.ui.playing);assert.equal(old.moves.length,1,'Bot does not respond instantly');
 assert(timers.some(x=>x.ms>=650&&x.ms<=1000));
 click({action:'new-computer-game'});const fresh=t.ui.board;
 timers.splice(0).forEach(x=>x.fn());await flush();assert.equal(fresh.moves.length,0,'Old reply cannot enter new game');
 whiteMove();const live=t.ui.board;timers.splice(0).forEach(x=>x.fn());await flush();
 assert.equal(live.moves.length,2);assert(!t.ui.playing);assert.equal(live.history.at(-1).t,1);
 // Navigate away during the next game pause.
 click({action:'new-computer-game'});whiteMove();t.nav('curriculum');assert(!t.ui.playing);
 timers.splice(0).forEach(x=>x.fn());await flush();assert.equal(t.ui.page,'curriculum');
 console.log('PASS: beginner default, delayed legal replies, cancellation on new game and navigation');
})().catch(e=>{console.error(e);process.exitCode=1});

const assert=require('node:assert/strict'),C=require('../chess-engine.js'),B=require('../bot-opponents.js');
const state=C.after(C.START_FEN,['e2e4']);
let seed=52;const rng=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
let counts=[];
for(const level of B.levels){let weak=0;for(let i=0;i<300;i++){const move=B.candidate(C,state,level,rng);if(move){weak++;assert(C.fromUci(state,move));}}counts.push(weak);}
assert.equal(B.levels.length,16);assert(counts[0]>270&&counts[0]>counts[3]&&counts[3]>counts[7]&&counts[7]>counts[11]);
assert(B.levels.every((b,i)=>!i||b.rating>B.levels[i-1].rating&&b.mistakes<=B.levels[i-1].mistakes&&b.depth>=B.levels[i-1].depth));
assert.equal(counts.at(-1),0);assert.equal(B.get('missing').id,'sprout');
assert.equal(B.delay(()=>0),650);assert.equal(B.delay(()=>.9999),1000);
(async()=>{
 let starts=0,depth;
 const engine={async start(){starts++},async bestmove(fen,d){depth=d;return 'e7e5'}};
 assert(C.fromUci(state,await B.choose(C,state,B.levels[0],engine,()=>0)));
 assert.equal(starts,0,'Weak choice does not require Stockfish startup');
 assert.equal(await B.choose(C,state,B.levels.at(-1),engine,()=>.99),'e7e5');assert.equal(depth,18);
 console.log('PASS: sixteen bot profiles, legal weak moves, decreasing mistake rates, engine depth and short reply delay');
})().catch(e=>{console.error(e);process.exitCode=1});

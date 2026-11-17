/* Practice levels are estimates, not measured Elo or Chess.com bot ratings. */
(function(root){
'use strict';
const levels=[
 {id:'seedling',name:'Seedling',rating:100,depth:1,mistakes:.97,description:'First game: almost always plays without spotting tactical threats.'},
 {id:'sprout',name:'Sprout',rating:250,depth:1,mistakes:.85,description:'First steps: often overlooks threats and leaves pieces unprotected.'},
 {id:'moss',name:'Moss',rating:325,depth:1,mistakes:.75,description:'Early beginner: frequent oversights with a few stronger moves.'},
 {id:'pebble',name:'Pebble',rating:400,depth:1,mistakes:.65,description:'Beginner: spots some captures, but makes frequent mistakes.'},
 {id:'brook',name:'Brook',rating:525,depth:1,mistakes:.55,description:'Beginner practice: a smaller step up from Pebble.'},
 {id:'fern',name:'Fern',rating:650,depth:2,mistakes:.45,description:'Learning: finds simple tactics, but regularly misses threats.'},
 {id:'birch',name:'Birch',rating:775,depth:2,mistakes:.36,description:'Building skills: finds more tactics, but still leaves chances.'},
 {id:'willow',name:'Willow',rating:900,depth:3,mistakes:.28,description:'Developing: usually notices captures, with occasional serious mistakes.'},
 {id:'maple',name:'Maple',rating:1050,depth:4,mistakes:.21,description:'Intermediate practice: more reliable, with occasional oversights.'},
 {id:'oak',name:'Oak',rating:1200,depth:5,mistakes:.14,description:'Club practice: more consistent, but still gives chances.'},
 {id:'pine',name:'Pine',rating:1400,depth:6,mistakes:.08,description:'Club challenge: stronger calculation with some mistakes.'},
 {id:'cedar',name:'Cedar',rating:1600,depth:8,mistakes:.04,description:'Advanced practice: stronger calculation and fewer oversights.'},
 {id:'aspen',name:'Aspen',rating:1800,depth:10,mistakes:.02,description:'Advanced challenge: deeper calculation and rare oversights.'},
 {id:'summit',name:'Summit',rating:2000,depth:12,mistakes:0,description:'Expert practice: consistent play without intentional mistakes.'}
 ,{id:'ridge',name:'Ridge',rating:2200,depth:15,mistakes:0,description:'Expert challenge: searches deeper without intentional mistakes.'}
 ,{id:'peak',name:'Peak',rating:2400,depth:18,mistakes:0,description:'Maximum challenge: deepest search; actual strength depends on your device.'}
];
const values={p:100,n:320,b:330,r:500,q:900,k:0};
function material(C,state,side){return state.b.reduce((sum,p)=>sum+(p==='.'?0:C.side(p)*side*values[p.toLowerCase()]),0);}
function looseScore(C,state,move){
 const next=C.apply(state,move),side=state.t;
 const replies=C.legal(next);
 if(!replies.length)return C.checked(next)?100000:0;
 let worst=Infinity;
 for(const reply of replies){const after=C.apply(next,reply);worst=Math.min(worst,material(C,after,side));}
 return worst;
}
function candidate(C,state,level,rng=Math.random){
 const legal=C.legal(state);
 if(!legal.length)return null;
 if(rng()>=level.mistakes)return null; // Ask Stockfish for the stronger choice.
 // Most weak moves are ordinary random moves. Some deliberately overlook
 // material threats, making the beginner levels meaningfully beatable.
 let pool=legal;
 if(rng()<.4){const ranked=legal.map(move=>({move,score:looseScore(C,state,move)})).sort((a,b)=>a.score-b.score);pool=ranked.slice(0,Math.max(1,Math.ceil(ranked.length*.4))).map(x=>x.move);}
 return C.uci(pool[Math.min(pool.length-1,Math.floor(rng()*pool.length))]);
}

const specials=[{id:'levy-rook',name:'Levy',depth:12,mistakes:0,description:'Unofficial fan-made rook challenge. Plays strongly, seeks a rook sacrifice every game, and becomes willing to sacrifice material after move 12. You can decline the offer; a short game may end before one is possible.'}];
function rookOffers(C,state){
 return C.legal(state).filter(move=>{
  if(state.b[move[0]].toLowerCase()!=='r'||values[state.b[move[1]].toLowerCase()]>=500)return false;
  const next=C.apply(state,move);
  return C.legal(next).some(reply=>{
   if(reply[1]!==move[1])return false;
   if(values[next.b[reply[0]].toLowerCase()]<500)return true;
   const after=C.apply(next,reply);
   return !C.legal(after).some(recapture=>recapture[1]===reply[1]);
  });
 });
}
function confirmSacrifice(C,state,memory){
 if(memory.offeredSquare!=null){
  if(state.b[memory.offeredSquare]!==memory.rookPiece)memory.sacrificed=true;
  memory.offeredSquare=null;
 }
}
function evaluationForMover(result){
 if(result.scoreType==='mate')return result.score===0?100000:result.score>0?-100000:100000;
 return Number.isFinite(result.score)?-result.score:-Infinity;
}
async function rookChallenge(C,state,engine,memory,isCurrent){
 confirmSacrifice(C,state,memory);
 await engine.start('lite');
 const best=await engine.bestmove(C.toFen(state),12);
 const bestMove=C.fromUci(state,best);if(!bestMove)return C.uci(C.legal(state)[0]);
 if(memory.sacrificed)return best;
 const offers=rookOffers(C,state);
 const score=async move=>{if(!isCurrent())throw Error('Game changed.');return evaluationForMover(await engine.analyze(C.toFen(C.apply(state,move)),{depth:8,movetime:80}));};
 const baseline=await score(bestMove);
 let chosen=null,chosenScore=-Infinity;
 for(const move of offers){
  const value=C.uci(move)===best?baseline:await score(move);
  if(value>chosenScore){chosen=move;chosenScore=value;}
 }
 // The challenge eventually takes precedence over material preservation.
 if(chosen&&(chosenScore>=baseline-125||state.full>=12)){
  memory.offerUci=C.uci(chosen);memory.offeredSquare=chosen[1];memory.rookPiece=state.b[chosen[0]];
  return memory.offerUci;
 }
 // Activate a rook if it can do so without substantially worsening the position.
 let active=null,activeScore=baseline-60;
 for(const move of C.legal(state).filter(m=>state.b[m[0]].toLowerCase()==='r'&&(m[1]>>4)!==(m[0]>>4))){
  const value=await score(move);
  if(value>activeScore){active=move;activeScore=value;}
 }
 memory.offerUci=null;
 return active?C.uci(active):best;
}

async function choose(C,state,level,engine,rng=Math.random,memory={},isCurrent=()=>true){
 if(level.id==='levy-rook')return rookChallenge(C,state,engine,memory,isCurrent);
 const weak=candidate(C,state,level,rng);if(weak)return weak;
 await engine.start('lite');return engine.bestmove(C.toFen(state),level.depth);
}
const api={levels,specials,rookOffers,confirmSacrifice,get:id=>[...levels,...specials].find(x=>x.id===id)||levels.find(x=>x.id==='sprout'),candidate,choose,delay:rng=>650+Math.floor((rng||Math.random)()*351)};
root.BotOpponents=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

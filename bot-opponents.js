/* Practice levels are estimates, not measured Elo or Chess.com bot ratings. */
(function(root){
'use strict';
const levels=[
 {id:'sprout',name:'Sprout',rating:250,depth:1,mistakes:.85,description:'First steps: often overlooks threats and leaves pieces unprotected.'},
 {id:'pebble',name:'Pebble',rating:400,depth:1,mistakes:.65,description:'Beginner: spots some captures, but makes frequent mistakes.'},
 {id:'fern',name:'Fern',rating:650,depth:2,mistakes:.45,description:'Learning: finds simple tactics, but regularly misses threats.'},
 {id:'willow',name:'Willow',rating:900,depth:3,mistakes:.28,description:'Developing: usually notices captures, with occasional serious mistakes.'},
 {id:'oak',name:'Oak',rating:1200,depth:5,mistakes:.14,description:'Club practice: more consistent, but still gives chances.'},
 {id:'cedar',name:'Cedar',rating:1600,depth:8,mistakes:.04,description:'Advanced practice: stronger calculation and fewer oversights.'},
 {id:'summit',name:'Summit',rating:2000,depth:12,mistakes:0,description:'Expert practice: the strongest available opponent.'}
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
async function choose(C,state,level,engine,rng=Math.random){
 const weak=candidate(C,state,level,rng);if(weak)return weak;
 await engine.start('lite');return engine.bestmove(C.toFen(state),level.depth);
}
const api={levels,get:id=>levels.find(x=>x.id===id)||levels[0],candidate,choose,delay:rng=>650+Math.floor((rng||Math.random)()*351)};
root.BotOpponents=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

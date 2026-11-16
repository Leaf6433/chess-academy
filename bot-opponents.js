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
async function choose(C,state,level,engine,rng=Math.random){
 const weak=candidate(C,state,level,rng);if(weak)return weak;
 await engine.start('lite');return engine.bestmove(C.toFen(state),level.depth);
}
const api={levels,get:id=>levels.find(x=>x.id===id)||levels.find(x=>x.id==='sprout'),candidate,choose,delay:rng=>650+Math.floor((rng||Math.random)()*351)};
root.BotOpponents=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

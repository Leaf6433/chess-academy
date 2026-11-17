const assert=require('node:assert/strict'),C=require('../chess-engine.js'),B=require('../bot-opponents.js');
module.exports=(async()=>{
 const level=B.get('levy-rook');assert.equal(level.id,'levy-rook');assert.equal(B.levels.length,16);assert.equal(B.specials.length,1);
 const late=C.parseFen('4r2k/8/8/3P4/8/8/8/7K b - - 0 12');
 const early=C.parseFen('4r2k/8/8/3P4/8/8/8/7K b - - 0 5');
 assert(B.rookOffers(C,late).some(m=>C.uci(m)==='e8e6'));
 let searches=0;
 const engine={async start(){},async bestmove(fen,depth){assert.equal(depth,12);const s=C.parseFen(fen);return C.fromUci(s,'e8e7')?'e8e7':C.uci(C.legal(s)[0]);},async analyze(fen){searches++;return {scoreType:'cp',score:C.parseFen(fen).b[C.index('e6')]==='r'?600:0};}};
 const memory={};const move=await B.choose(C,late,level,engine,()=>.99,memory);
 assert.equal(move,'e8e6','Deadline chooses a real rook offer even at material cost');assert.equal(memory.offerUci,move);assert(searches>0);
 const offered=C.apply(late,C.fromUci(late,move)),accepted=C.apply(offered,C.fromUci(offered,'d5e6'));
 await B.choose(C,accepted,level,engine,()=>.99,memory);assert(memory.sacrificed,'Accepted sacrifice is remembered');
 const attempts=searches;await B.choose(C,accepted,level,engine,()=>.99,memory);assert.equal(searches,attempts,'After sacrifice, uses strong play rather than forcing another');
 const safe=await B.choose(C,early,level,engine,()=>.99,{});assert(!B.rookOffers(C,early).some(m=>C.uci(m)===safe),'Early play avoids a needless six-pawn loss');
 const declined=C.apply(offered,C.fromUci(offered,'h1g1'));const retry={offeredSquare:C.index('e6'),rookPiece:'r'};B.confirmSacrifice(C,declined,retry);assert(!retry.sacrificed,'Declined offer is not counted as a completed sacrifice');
 const noRooks=C.parseFen('7k/8/8/8/8/8/8/7K b - - 0 20');assert.equal(B.rookOffers(C,noRooks).length,0);
 console.log('PASS: rook challenge offers a legal sacrifice, protects early strength, tracks acceptance and decline, and resumes strong play');
})().catch(e=>{console.error(e);process.exitCode=1;throw e});

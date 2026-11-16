const assert=require('node:assert/strict');
const C=require('../chess-engine.js');
const motion=require('../piece-motion.js');
assert.deepEqual(motion.tracks([116,118,'','castle']),[[116,118],[119,117]]);
assert.deepEqual(motion.tracks([4,2,'','castle']),[[4,2],[0,3]]);
assert.deepEqual(motion.point(C.index('e2'),false),[4,6]);
assert.deepEqual(motion.point(C.index('e2'),true),[3,1]);
const animations=[];
let currentBoard,layer,reduced=false;
const classes=()=>({values:new Set(),add(x){this.values.add(x)},remove(x){this.values.delete(x)}});
function makeBoard(){return {classList:classes(),appendChild(el){this.layer=el}};}
global.Element=class{animate(){}};
global.document={querySelector(){return currentBoard},createElement(){
 layer={innerHTML:'',setAttribute(){},remove(){this.removed=true},querySelector(selector){
  const square=Number(selector.match(/"(\d+)"/)[1]);
  assert(this.innerHTML.includes('data-motion-square="'+square+'"'),'Moving piece exists in the pre-move position');
  return {style:{},animate(frames,options){
   let resolve,reject;
   const finished=new Promise((yes,no)=>{resolve=yes;reject=no});
   const animation={frames,options,finished,finish:resolve,cancel(){reject(Error('cancelled'))}};
   animations.push(animation);return animation;
  }};
 }};return layer;
}};
global.matchMedia=()=>({matches:reduced});
function step(state,uci){const move=C.fromUci(state,uci);return {before:state,move,after:C.apply(state,move)};}
const draw=code=>'<piece>'+code+'</piece>';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
 const first=step(C.parseFen(C.START_FEN),'e2e4'),reply=step(first.after,'e7e5');
 const model={flip:false,motionQueue:[first,reply]};currentBoard=makeBoard();motion.play(model,draw);
 assert(model.motionActive);assert.equal(animations.length,1,'Opponent waits for player animation');
 assert.equal(animations[0].options.duration,200);
 assert.equal(animations[0].frames[1].transform,'translate(0%,-200%)');
 currentBoard=makeBoard();motion.play(model,draw);
 assert.equal(currentBoard.layer,layer,'Rerender preserves active movement');
 animations[0].finish();await tick();
 await new Promise(resolve=>setTimeout(resolve,motion.GAP+10));
 assert.equal(animations.length,2,'Reply animates separately');
 animations[1].finish();await tick();assert(!model.motionActive);assert(layer.removed);
 // Promotion is displayed as a pawn until arrival, then becomes the new piece.
 const promotion=step(C.parseFen('7k/P7/8/8/8/8/8/7K w - - 0 1'),'a7a8q');
 const promoting={flip:true,motionQueue:[promotion]};motion.play(promoting,draw);
 assert(layer.innerHTML.includes('<piece>wp</piece>'));
 animations.at(-1).finish();await tick();
 assert(layer.innerHTML.includes('<piece>wq</piece>')&&!layer.innerHTML.includes('<piece>wp</piece>'),'Promotion changes on arrival');
 const capture=step(C.parseFen('r6k/8/8/8/8/8/8/R6K w - - 0 1'),'a1a8');
 motion.play({flip:false,motionQueue:[capture]},draw);
 assert(layer.innerHTML.includes('<piece>br</piece>'),'Captured piece remains until arrival');
 animations.at(-1).finish();await tick();assert(!layer.innerHTML.includes('<piece>br</piece>'));
 const castle=step(C.parseFen('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1'),'e1g1');
 const castling={flip:false,motionQueue:[castle]},count=animations.length;motion.play(castling,draw);
 assert.equal(animations.length,count+2,'King and rook glide together');
 motion.cancel();await tick();assert(!castling.motionActive,'Navigation unlocks input');
 reduced=true;const quiet={motionQueue:[first]};motion.play(quiet,draw);
 assert(!quiet.motionActive);assert.equal(quiet.motionQueue.length,0,'Reduced motion skips playback without losing the move');
 console.log('PASS: ordered move/reply animations, castling tracks, board orientation, rerenders, cancellation, promotion setup and reduced motion');
})().catch(error=>{console.error(error);process.exitCode=1});

/* Visual playback only: chess rules and scoring remain synchronous. */
(function(root){
'use strict';
const DURATION=200,GAP=65;
let active=null;
function point(square,flip){const file=square&7,row=square>>4;return [flip?7-file:file,flip?7-row:row];}
function tracks(move){
 const [from,to,,flag]=move,result=[[from,to]];
 if(flag==='castle')result.push(to>from?[from+3,from+1]:[from-4,from-1]);
 return result;
}
function cancel(){
 if(!active)return;
 const run=active;active=null;run.cancelled=true;
 for(const animation of run.animations)animation.cancel();
 run.layer.remove();run.board.classList.remove('motion-playing');run.model.motionActive=false;
}
function play(model,pieceHTML){
 const steps=model?.motionQueue?.splice(0)||[];
 const board=root.document?.querySelector?.('[data-live-board]');
 if(!board||!root.Element?.prototype.animate||root.matchMedia?.('(prefers-reduced-motion: reduce)').matches){cancel();return;}
 if(active&&active.model===model&&active.flip===model.flip){
  active.steps.push(...steps);
  active.board.classList.remove('motion-playing');active.board=board;
  board.appendChild(active.layer);board.classList.add('motion-playing');return;
 }
 cancel();if(!steps.length)return;
 const layer=root.document.createElement('div');layer.className='piece-motion-layer';layer.setAttribute('aria-hidden','true');
 board.appendChild(layer);board.classList.add('motion-playing');model.motionActive=true;
 const run={board,layer,model,flip:model.flip,steps,animations:[],cancelled:false};active=run;
 const paint=state=>{
  layer.innerHTML=state.b.map((piece,square)=>{
   if((square&0x88)||piece==='.')return '';
   const [x,y]=point(square,model.flip),code=(piece===piece.toUpperCase()?'w':'b')+piece.toLowerCase();
   return '<div class="motion-piece" data-motion-square="'+square+'" style="left:'+x*12.5+'%;top:'+y*12.5+'%">'+pieceHTML(code)+'</div>';
  }).join('');
 };
 // Paint immediately, before the browser can display the final logical position.
 paint(steps[0].before);
 (async()=>{
  try{
   for(const step of steps){
    if(run.cancelled)return;
    paint(step.before);
    run.animations=tracks(step.move).map(([from,to])=>{
     const piece=layer.querySelector('[data-motion-square="'+from+'"]');
     const [x,y]=point(from,model.flip),[tx,ty]=point(to,model.flip);
     piece.style.zIndex='2';
     return piece.animate([{transform:'translate(0,0)'},{transform:'translate('+((tx-x)*100)+'%,'+((ty-y)*100)+'%)'}],{duration:DURATION,easing:'cubic-bezier(.25,.65,.3,1)',fill:'forwards'});
    });
    await Promise.all(run.animations.map(animation=>animation.finished));
    if(run.cancelled)return;
    paint(step.after); // Captures, en passant and promotion resolve on arrival.
    if(step!==steps.at(-1))await new Promise(resolve=>setTimeout(resolve,GAP));
   }
  }catch(error){/* Navigation may cancel an in-flight animation. */}
  finally{if(active===run)cancel();}
 })();
}
const api={play,cancel,point,tracks,DURATION,GAP};
root.PieceMotion=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

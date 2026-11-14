/* Chess Academy offline shell: fresh app code when online, cached fallback when offline. */
const NAME='chess-academy-board-workshops-2026-11-13-v1';
const CORE=['./','./index.html','./styles.css','./app.js','./opening-study.js','./board-workshops.js','./puzzle-bank.js','./chess-engine.js','./course-data-v2.js','./foundation-drills.js','./board-drills.js','./mastery-positions.js','./mastery-concepts.js','./lesson-deep-dives.js','./lesson-scenes.js','./engine-service.js','./supabase-config.js','./account-client.js','./manifest.webmanifest','./assets/favicon.svg','./assets/pieces.svg','./assets/study-hero.svg'];
self.addEventListener('install',event=>event.waitUntil(
 caches.open(NAME).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())
));
self.addEventListener('activate',event=>event.waitUntil(
 caches.keys().then(names=>Promise.all(names.filter(name=>name.startsWith('chess-academy-')&&name!==NAME).map(name=>caches.delete(name)))).then(()=>self.clients.claim())
));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin)return;
 const appResource=event.request.mode==='navigate'||/\.(?:html|js|css)$/.test(url.pathname);
 if(appResource){
  event.respondWith(fetch(event.request).then(response=>{
   if(response.ok){const copy=response.clone();event.waitUntil(caches.open(NAME).then(cache=>cache.put(event.request,copy)));}
   return response;
  }).catch(()=>caches.match(event.request,{ignoreSearch:true}).then(hit=>hit||Response.error())));
  return;
 }
 event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{
  if(response.ok){const copy=response.clone();event.waitUntil(caches.open(NAME).then(cache=>cache.put(event.request,copy)));}
  return response;
 })));
});

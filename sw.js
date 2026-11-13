/* Offline lesson shell; Full Stockfish is intentionally not precached. */
const NAME='chess-academy-2-accounts-live-v2';
const CORE=['./','./index.html','./styles.css','./app.js','./chess-engine.js','./course-data-v2.js','./foundation-drills.js','./engine-service.js','./supabase-config.js','./account-client.js','./manifest.webmanifest','./assets/favicon.svg','./assets/pieces.svg','./engine/stockfish-19-lite-single.js','./engine/stockfish-19-lite-single.wasm'];
self.addEventListener('install',event=>event.waitUntil(caches.open(NAME).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(x=>x.startsWith('chess-academy-')&&x!==NAME).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(url.origin!==location.origin)return;
 event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{if(response.ok&&url.pathname.endsWith('.wasm')&&url.pathname.includes('lite')){const copy=response.clone();caches.open(NAME).then(cache=>cache.put(event.request,copy));}return response;})));
});

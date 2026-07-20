/* Been There service worker — makes the app installable.
   The map library and map data load from a CDN, so full offline use
   isn't guaranteed, but your visited list (localStorage) is always local. */
const CACHE = 'beenthere-v1';
const ASSETS = ['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-180.png'];
self.addEventListener('install', (e)=>{ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{})); });
self.addEventListener('activate', (e)=>{ e.waitUntil((async()=>{ const k=await caches.keys(); await Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x))); await self.clients.claim(); })()); });
self.addEventListener('fetch', (e)=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return; // let CDN requests go straight to network
  const isHTML = req.mode==='navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/');
  if(isHTML){
    e.respondWith(fetch(req).then(res=>{ const c=res.clone(); caches.open(CACHE).then(x=>x.put(req,c)).catch(()=>{}); return res; }).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html'))));
  }else{
    e.respondWith(caches.match(req).then(r=>r||fetch(req)));
  }
});

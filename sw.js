// sw.js — cache-first para app + íconos (versionado para forzar actualización)
const CACHE = 'oasis-pwa-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-120.png',
  './icons/icon-152.png',
  './icons/icon-167.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e)=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.map(k=> k===CACHE?null:caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e)=>{
  e.respondWith(
    caches.match(e.request).then(res=>{
      if(res) return res;
      return fetch(e.request).then(net=>{
        if(e.request.method==='GET' && new URL(e.request.url).origin===location.origin){
          const copy = net.clone();
          caches.open(CACHE).then(c=>c.put(e.request, copy));
        }
        return net;
      }).catch(()=> caches.match('./index.html'));
    })
  );
});

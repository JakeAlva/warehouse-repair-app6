// Offline-first service worker v6
const CACHE_NAME = 'warehouse-repair-v6';
const ASSETS = [
  './',
  './index.html',
  './app_v6.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/xlsx@0.19.3/dist/xlsx.full.min.js'
];
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try { await cache.addAll(ASSETS); } catch(e){}
    self.skipWaiting();
  })());
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});
self.addEventListener('fetch', (e) => {
  e.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(e.request, {ignoreSearch:true});
    if (cached) return cached;
    try {
      const res = await fetch(e.request);
      cache.put(e.request, res.clone());
      return res;
    } catch (err) {
      if (e.request.mode === 'navigate') return await cache.match('./');
      throw err;
    }
  })());
});

// Bugle Ridge 1.1.0 (202609150025)
const CACHE = 'bugle-ridge-202609150025';
const FILES = ["./","index.html","style.css","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/maskable-512.png","icons/apple-touch-icon.png","js/core.js","js/data.js","js/sprites.js","js/animals.js","js/season.js","js/camp.js","js/glass.js","js/stalk.js","js/call.js","js/shot.js","js/range.js","js/debrief.js"];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin || e.request.url.endsWith('.apk')) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const net = fetch(e.request, { cache: 'no-cache' }).then(r => { if (r.ok) cache.put(e.request, r.clone()); return r; });
    const timeout = new Promise(res => setTimeout(() => res(null), 2500));
    try {
      const r = await Promise.race([net, timeout]);
      if (r) return r;
    } catch (_) {}
    const hit = await caches.match(e.request, { ignoreSearch: true });
    return hit || net;
  })());
});

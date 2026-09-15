// Bugle Ridge 1.2.0 (202609151222)
const CACHE = 'bugle-ridge-202609151222';
const FILES = ["./","index.html","style.css","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/maskable-512.png","icons/apple-touch-icon.png","js/core.js","js/data.js","js/sprites.js","js/animals.js","js/season.js","js/camp.js","js/glass.js","js/stalk.js","js/call.js","js/shot.js","js/range.js","js/debrief.js"];
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys(), installed = keys.some(k => k.startsWith('bugle-ridge-2'));
    const ok = await (await caches.open('bugle-ridge-control')).match('update-ok');
    if (installed && !ok) throw new Error('Updates install only when the player asks.');
    await (await caches.open(CACHE)).addAll(FILES);
  })());
});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('bugle-ridge-2') && k !== CACHE).map(k => caches.delete(k)));
    await (await caches.open('bugle-ridge-control')).delete('update-ok');
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  if (/version.json|.apk$/.test(e.request.url)) return;  // always straight to the network
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request)));
});

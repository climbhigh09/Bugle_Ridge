#!/usr/bin/env node
// Builds the shareable web version from www/:
//   dist/web/                 static offline PWA — upload to GitHub Pages, Netlify, or any https host
//   dist/bugle-ridge-web.zip  the same folder, zipped
//   dist/artifact.html        one self-contained page (inline CSS + JS)
const fs = require('fs'), path = require('path'), zlib = require('zlib'), { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..'), WWW = path.join(ROOT, 'www'), DIST = path.join(ROOT, 'dist'), WEB = path.join(DIST, 'web');
const SCRIPTS = ['core', 'data', 'sprites', 'animals', 'season', 'camp', 'glass', 'stalk', 'call', 'shot', 'range', 'debrief'].map(n => `js/${n}.js`);
const VERSION = '1.0.0';
const BUILD = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);

// ---------- icons: rasterise android/res/drawable/icon.xml (24×24 pixel art) to PNG ----------
function pathPoly(d) {
  const pts = []; let x = 0, y = 0, m;
  const re = /([Mhvz])\s*([-\d.]*)(?:,([-\d.]+))?/g;
  while ((m = re.exec(d))) {
    if (m[1] === 'M') { x = +m[2]; y = +m[3]; pts.push([x, y]); }
    else if (m[1] === 'h') { x += +m[2]; pts.push([x, y]); }
    else if (m[1] === 'v') { y += +m[2]; pts.push([x, y]); }
  }
  return pts;
}
function inside(poly, px, py) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}
function iconGrid() {
  const xml = fs.readFileSync(path.join(ROOT, 'android/res/drawable/icon.xml'), 'utf8');
  const layers = [...xml.matchAll(/fillColor="(#[0-9A-Fa-f]{6})"\s+android:pathData="([^"]+)"/g)].map(m => [m[1], pathPoly(m[2])]);
  const grid = [];
  for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
    let c = layers[0][0];
    for (const [col, poly] of layers) if (inside(poly, x + 0.5, y + 0.5)) c = col;
    grid.push(c);
  }
  return grid;
}
const CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = buf => { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function png(size, grid, safeZone) {
  const scale = Math.floor(size * (safeZone ? 0.8 : 1) / 24), off = Math.floor((size - scale * 24) / 2), bg = rgb(grid[0]);
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1);
    for (let x = 0; x < size; x++) {
      const gx = Math.floor((x - off) / scale), gy = Math.floor((y - off) / scale);
      const c = gx >= 0 && gx < 24 && gy >= 0 && gy < 24 ? rgb(grid[gy * 24 + gx]) : bg, i = row + 1 + x * 4;
      raw[i] = c[0]; raw[i + 1] = c[1]; raw[i + 2] = c[2]; raw[i + 3] = 255;
    }
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4), crc = Buffer.alloc(4), td = Buffer.concat([Buffer.from(type), data]);
    len.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(td));
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

// ---------- assemble ----------
fs.rmSync(WEB, { recursive: true, force: true });
fs.mkdirSync(path.join(WEB, 'js'), { recursive: true });
fs.mkdirSync(path.join(WEB, 'icons'), { recursive: true });
fs.copyFileSync(path.join(WWW, 'style.css'), path.join(WEB, 'style.css'));
SCRIPTS.forEach(s => fs.copyFileSync(path.join(WWW, s), path.join(WEB, s)));

const grid = iconGrid();
const ICONS = { 'icons/icon-192.png': png(192, grid), 'icons/icon-512.png': png(512, grid), 'icons/maskable-512.png': png(512, grid, true), 'icons/apple-touch-icon.png': png(180, grid) };
Object.entries(ICONS).forEach(([f, buf]) => fs.writeFileSync(path.join(WEB, f), buf));

// the app markup (canvas, nav, HUD, overlay) comes straight from www/index.html so the builds can't drift
const APP = fs.readFileSync(path.join(WWW, 'index.html'), 'utf8').match(/<div id="app">[\s\S]*?\n<\/div>/)[0];

fs.writeFileSync(path.join(WEB, 'index.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#07080b">
<meta name="description" content="Bugle Ridge: an offline spot-and-stalk elk and moose hunting game, Colorado to Alaska.">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="apple-mobile-web-app-title" content="Bugle Ridge">
<title>Bugle Ridge</title>
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="stylesheet" href="style.css">
</head>
<body>
${APP}
${SCRIPTS.map(s => `<script src="${s}"></script>`).join('\n')}
<script>
BR.start();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || /^(localhost|127\\.0\\.0\\.1)$/.test(location.hostname))) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
</script>
</body>
</html>
`);

fs.writeFileSync(path.join(WEB, 'manifest.webmanifest'), JSON.stringify({
  name: 'Bugle Ridge', short_name: 'Bugle Ridge', description: 'Offline spot-and-stalk elk and moose hunting.',
  id: './', start_url: './', scope: './', display: 'standalone', orientation: 'portrait',
  background_color: '#07080b', theme_color: '#07080b',
  icons: [
    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
}, null, 2));

// Cache-first service worker: after one visit the game runs with no signal. A new build bumps the cache name.
const CACHED = ['./', 'index.html', 'style.css', 'manifest.webmanifest', ...Object.keys(ICONS), ...SCRIPTS];
fs.writeFileSync(path.join(WEB, 'sw.js'), `// Bugle Ridge ${VERSION} (${BUILD})
const CACHE = 'bugle-ridge-${BUILD}';
const FILES = ${JSON.stringify(CACHED)};
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request)));
});
`);

const apk = path.join(DIST, `bugle-ridge-${VERSION}.apk`);
if (fs.existsSync(apk)) fs.copyFileSync(apk, path.join(WEB, 'bugle-ridge.apk'));

// Single-file page for a Claude artifact: inline everything (the host supplies doctype/head/body).
const css = fs.readFileSync(path.join(WWW, 'style.css'), 'utf8');
const js = SCRIPTS.map(s => fs.readFileSync(path.join(WWW, s), 'utf8')).join('\n');
fs.writeFileSync(path.join(DIST, 'artifact.html'), `<title>Bugle Ridge</title>
<style>
${css}</style>
${APP}
<script>
${js}
BR.start();
</script>
`);

execSync('rm -f bugle-ridge-web.zip && zip -qr bugle-ridge-web.zip web', { cwd: DIST });

// Mirror the web build into docs/ for GitHub Pages (docs/storyboard is hand-made and kept).
const DOCS = path.join(ROOT, 'docs');
fs.mkdirSync(DOCS, { recursive: true });
fs.readdirSync(DOCS).filter(f => f !== 'storyboard').forEach(f => fs.rmSync(path.join(DOCS, f), { recursive: true, force: true }));
fs.cpSync(WEB, DOCS, { recursive: true });
console.log(`web build ${BUILD}: ${WEB}\nzip: ${path.join(DIST, 'bugle-ridge-web.zip')}\nartifact: ${path.join(DIST, 'artifact.html')}`);

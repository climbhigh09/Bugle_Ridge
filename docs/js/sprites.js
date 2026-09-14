// Bugle Ridge — animal sprites: anatomy drawn as shapes in world units (≈1 in), rasterised at game resolution,
// lit from the upper left and dithered. Cached per species/pose/scale. Also answers hit tests for the shot.
(function () {
  const BR = window.BR, A = (BR.SPR = {});
  const K = (A.K = 0.68);
  const BAY = BR.BAYER;

  const PAL = (A.PAL = {
    elkHide: { g: 'b', r: ['#dcc198', '#c4a372', '#a07c50', '#735636'] },
    cowHide: { g: 'b', r: ['#d3ad80', '#b88f60', '#936e44', '#664a2c'] },
    elkMane: { g: 'b', r: ['#7c5a3c', '#5f4229', '#46301d', '#2e1f12'] },
    cowNeck: { g: 'b', r: ['#957150', '#78583b', '#5b422b', '#3d2c1c'] },
    elkLeg: { g: 'b', r: ['#6e5036', '#533b26', '#3d2b1b', '#261a10'] },
    elkLegFar: { g: 'b', r: ['#533b26', '#3d2b1b', '#2c1f13', '#1c130b'] },
    rump: { g: 'b', r: ['#f2e2c0', '#dfca9f', '#c2aa7d', '#98825c'] },
    muzzle: { g: 'b', r: ['#5a4230', '#46331f', '#342516', '#22180e'] },
    hoof: { g: 'b', r: ['#2a211a', '#1e1812', '#15100c', '#0c0907'] },
    earIn: { g: 'b', r: ['#c4a486', '#a4846a', '#86684f', '#664e3a'] },
    antler: { g: 'a', r: ['#e9dcc0', '#c8b28a', '#9c8762', '#6a5a42'] },
    antlerFar: { g: 'a', r: ['#b4a07c', '#958262', '#74644a', '#4e4232'] },
    tip: { g: 'a', r: ['#fbf6ea', '#ece2cc', '#d2c4a4', '#b0a080'] },
    mBody: { g: 'b', r: ['#5e4b3b', '#433428', '#2e231b', '#1b140f'] },
    mBodyFar: { g: 'b', r: ['#433428', '#2e231b', '#201812', '#120d0a'] },
    mLeg: { g: 'b', r: ['#c2b6a2', '#9e917e', '#786c5c', '#50483e'] },
    mLegFar: { g: 'b', r: ['#8e8270', '#6e6456', '#524a40', '#36302a'] },
    mMuzzle: { g: 'b', r: ['#7a6550', '#5e4d3c', '#46392c', '#2e251c'] },
    mAntler: { g: 'a', r: ['#d2bc90', '#ad9468', '#836e4c', '#584a36'] },
    mAntlerFar: { g: 'a', r: ['#94825f', '#776848', '#584c36', '#3c3326'] },
    wGrey: { g: 'b', r: ['#b0a99b', '#8a8376', '#635d54', '#3e3a35'], fur: '#d6cfc0' },
    wSaddle: { g: 'b', r: ['#716a60', '#555048', '#3c3833', '#262320'] },
    wCream: { g: 'b', r: ['#e3d7bf', '#c8b89b', '#a09074', '#706350'] },
    wLegFar: { g: 'b', r: ['#9e927c', '#7c725f', '#5a5245', '#3a342c'] },
    wBlack: { g: 'b', r: ['#4a4744', '#34322f', '#232120', '#141312'], fur: '#6a6560' },
    wBlackFar: { g: 'b', r: ['#34322f', '#232120', '#171615', '#0c0b0b'] },
    wBlackGrey: { g: 'b', r: ['#7a746c', '#5e5952', '#45413c', '#2c2a27'] },
    wTailTip: { g: 'b', r: ['#2a2724', '#1e1c1a', '#141312', '#0c0b0a'] },
    gFur: { g: 'b', r: ['#c9a676', '#977149', '#6b4d31', '#41301e'], fur: '#e6dac4' },
    gLeg: { g: 'b', r: ['#6c4f34', '#503a26', '#3a2a1a', '#231911'] },
    gLegFar: { g: 'b', r: ['#503a26', '#3a2a1a', '#291d12', '#18110b'] },
    gSnout: { g: 'b', r: ['#b08a60', '#8e6c48', '#6c5034', '#4a3624'] },
    foam: { g: 'b', r: ['#cdb488', '#b59a6a', '#94794e', '#6c5838'] },
    foamDark: { g: 'b', r: ['#9c8258', '#846a46', '#6a5436', '#4a3a26'] },
    eye: { g: 'x', r: ['#0a0706'] },
    eyeAmber: { g: 'x', r: ['#c8962e'] },
    nose: { g: 'x', r: ['#0c0b0a'] },
    mouth: { g: 'x', r: ['#2a1210'] },
    claw: { g: 'x', r: ['#e8dcc0'] }
  });
  const NAMES = Object.keys(PAL), IDX = Object.fromEntries(NAMES.map((n, i) => [n, i]));
  const HEX = {};
  const rgb = h => HEX[h] || (HEX[h] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)));

  // ---------- geometry helpers ----------
  A.deg = d => d * Math.PI / 180;
  A.P = s => new Path2D(s);
  A.tube = (g, pts) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0, r0] = pts[i], [x1, y1, r1] = pts[i + 1], L = Math.hypot(x1 - x0, y1 - y0) || 1, nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
      g.beginPath(); g.moveTo(x0 + nx * r0, y0 + ny * r0); g.lineTo(x1 + nx * r1, y1 + ny * r1); g.lineTo(x1 - nx * r1, y1 - ny * r1); g.lineTo(x0 - nx * r0, y0 - ny * r0); g.fill();
    }
    pts.forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); });
  };
  A.ell = (g, x, y, rx, ry) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); };
  A.rot = (a, x, y) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
  A.hp = (H, x, y) => { const [a, b] = A.rot(H.a, x, y); return [H.x + a, H.y + b]; };
  A.inHead = (g, H) => { g.translate(H.x, H.y); g.rotate(H.a); };
  A.neck = (base, att) => {
    const L = Math.hypot(att[0] - base[0], att[1] - base[1]) || 1;
    let nx = -(att[1] - base[1]) / L, ny = (att[0] - base[0]) / L;
    if (ny < 0) { nx = -nx; ny = -ny; }
    return { mid: [(base[0] + att[0]) / 2 + 1, (base[1] + att[1]) / 2 - 1], N: [nx, ny], T: [(att[0] - base[0]) / L, (att[1] - base[1]) / L] };
  };

  // ---------- raster ----------
  // parts: [{c: palette name, d: draw(g), t: alpha threshold, leg: true}]. opt: {down: lie the animal down (no legs), remap: {from: to}, flip}
  const W0 = 260, H0 = 220, GY = 190, CX = 110;
  A.raster = (parts, scale, opt) => {
    opt = opt || {};
    const w = W0, h = H0, n = w * h, cls = new Int16Array(n).fill(-1);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d', { willReadFrequently: true });
    for (const p of parts) {
      if (opt.down && p.leg) continue;
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
      g.setTransform(K * scale * (opt.flip ? -1 : 1), 0, 0, K * scale, CX, GY);
      if (opt.down) g.translate(0, opt.down);
      g.fillStyle = '#fff';
      g.save(); p.d(g); g.restore();
      const img = g.getImageData(0, 0, w, h);
      const d = img && img.data;
      if (!d) continue;
      const name = (opt.remap && opt.remap[p.c]) || p.c, id = IDX[name], t = p.t || 120;
      if (id == null) throw new Error('No sprite colour ' + name);
      for (let i = 0; i < n; i++) if (d[i * 4 + 3] >= t) cls[i] = id;
    }
    let x0 = w, x1 = -1, y0 = h, y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (cls[y * w + x] >= 0) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    const grp = i => (cls[i] < 0 ? null : PAL[NAMES[cls[i]]].g);
    const mask = new Uint8Array(n);
    const out = g.createImageData(w, h), o = out && out.data;
    if (o && x1 >= x0) {
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const i = y * w + x; if (cls[i] < 0) continue;
        const P = PAL[NAMES[cls[i]]], G = P.g;
        mask[i] = G === 'a' ? 2 : 1;
        let col;
        if (G === 'x') col = P.r[0];
        else {
          const inG = (xx, yy) => { if (xx < 0 || yy < 0 || xx >= w || yy >= h) return false; const q = grp(yy * w + xx); return q === G || (G === 'b' && q === 'x'); };
          let u = 0, dn = 0, l = 0, r = 0;
          while (u < 10 && inG(x, y - u - 1)) u++;
          while (dn < 10 && inG(x, y + dn + 1)) dn++;
          while (l < 10 && inG(x - l - 1, y)) l++;
          while (r < 10 && inG(x + r + 1, y)) r++;
          let k;
          if (G === 'a') k = u === 0 ? 0 : dn === 0 ? 2 : 1;
          else {
            const v = 0.62 * (dn - u) / (dn + u + 1) + 0.38 * (r - l) / (r + l + 1) + (BAY[(y & 3) * 4 + (x & 3)] - 0.5) * 0.34;
            k = v > 0.4 ? 0 : v > -0.02 ? 1 : v > -0.42 ? 2 : 3;
            if (dn === 0) k = 3; else if (dn === 1 && k < 2) k = 2;
          }
          col = P.r[k];
          if (P.fur && k <= 1 && u < 4 && BAY[((y + 1) & 3) * 4 + ((x + 2) & 3)] < 0.13) col = P.fur;
        }
        const [R, Gc, B] = rgb(col), j = i * 4;
        o[j] = R; o[j + 1] = Gc; o[j + 2] = B; o[j + 3] = 255;
      }
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h); g.putImageData(out, 0, 0);
    }
    if (x1 < x0) { x0 = x1 = CX; y0 = y1 = GY; }
    return {
      canvas: c, x0, x1, y0, y1, gy: GY, cx: CX, px: K * scale, flip: !!opt.flip,
      // body hit test in sprite-canvas pixels
      body: (px, py) => { px = Math.round(px); py = Math.round(py); return px >= 0 && py >= 0 && px < w && py < h && mask[py * w + px] === 1; },
      // sprite pixel → world units (facing right, ground 0)
      world: (px, py) => [((px - CX) / (K * scale)) * (opt.flip ? -1 : 1), (py - GY) / (K * scale) - (opt.down || 0)]
    };
  };

  // ---------- cache + animal mapping ----------
  const cache = new Map();
  A.get = (animal, pose, scale, opt) => {
    scale = Math.max(0.08, Math.round(scale * 20) / 20);
    opt = opt || A.poseOpt(pose, animal.sp);
    const key = JSON.stringify([animal.sp, animal.sex, animal.pts, animal.spread, animal.brows, animal.black, animal.calf, pose, scale, opt || null]);
    if (cache.has(key)) return cache.get(key);
    const parts = A.parts(animal, pose);
    const sc = scale * (animal.calf ? 0.7 : animal.sp === 'elk' && animal.sex === 'cow' ? 0.9 : 1);
    const spr = A.raster(parts, sc, opt);
    if (cache.size > 80) cache.delete(cache.keys().next().value);
    cache.set(key, spr);
    return spr;
  };
  // draw a cached sprite so its ground point lands at (x, groundY) and its centre at x
  A.draw = (g, spr, x, groundY) => {
    const dx = Math.round(x - (spr.x0 + spr.x1) / 2), dy = Math.round(groundY - spr.gy);
    g.drawImage(spr.canvas, dx, dy);
    return { dx, dy };
  };
})();

// Bugle Ridge storyboard — pixel helpers + scenes 1–4 (120×150 logical px)
(function () {
  const P = {
    night: '#0c0f17', dusk: '#1a2031', dawn: '#39334f', glow: '#b8694a', amber: '#e3a646',
    far: '#262d3d', far2: '#303849', mid: '#27352c', timber: '#16241b', timber2: '#1f3024',
    tree: '#1c2e22', tree2: '#26402d', aspen: '#b8923e', aspen2: '#8a6d2f',
    meadow: '#46553a', meadow2: '#5d6c46', meadow3: '#6f7c50', dirt: '#4a3e30',
    hide: '#8f633a', mane: '#4d3423', rump: '#cdb07e', leg: '#33251a', antler: '#ddd0b3',
    bone: '#e9dfcb', blood: '#b7413c', wind: '#86b36f', water: '#2f4b5e', rock: '#595955', rock2: '#747169',
    fire: '#f2b04a', fire2: '#d8602e', skin: '#a67c58', camo: '#5b5a3d', camo2: '#44432d', hat: '#2a2820', star: '#cfc6b2'
  };
  const W = 120, H = 150;
  function ctx(id) { const c = document.getElementById(id); if (!c) return null; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return x; }
  function R(x, X, Y, w, h, c) { x.fillStyle = c; x.fillRect(Math.round(X), Math.round(Y), Math.round(w), Math.round(h)); }
  function rng(s) { s = s >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function bands(x, list) {
    for (let i = 0; i < list.length; i++) {
      const y0 = list[i][0], y1 = i + 1 < list.length ? list[i + 1][0] : H;
      R(x, 0, y0, W, y1 - y0, list[i][1]);
      if (i > 0) for (let X = 0; X < W; X += 2) R(x, X, y0, 1, 1, list[i - 1][1]);
    }
  }
  function ry(X, base, amp, f, s) { return Math.round(base + Math.sin(X * f + s) * amp + Math.sin(X * f * 2.7 + s * 1.7) * amp * 0.45 + Math.sin(X * f * 6.3 + s * 2.9) * amp * 0.18); }
  function ridge(x, base, amp, f, s, c) { for (let X = 0; X < W; X++) { const y = ry(X, base, amp, f, s); R(x, X, y, 1, H - y, c); } }
  function pine(x, X, Y, h, c, c2) {
    for (let i = 0; i < h; i++) {
      let w = 1 + 2 * Math.floor(i * 0.3);
      if (i > 3 && i % 3 === 0) w = Math.max(1, w - 2);
      R(x, X - (w >> 1), Y - h + i, w, 1, c);
      if (c2 && w > 2) R(x, X + 1, Y - h + i, w >> 1, 1, c2);
    }
    R(x, X, Y, 1, 1, P.leg);
  }
  function aspen(x, X, Y, r) {
    for (let j = -r; j <= r; j++) { const w = Math.round(Math.sqrt(r * r - j * j)); R(x, X - w, Y + j, w * 2 + 1, 1, j > 0 ? P.aspen2 : P.aspen); }
    R(x, X, Y + r, 1, 3, P.bone);
  }
  function stars(x, n, maxY, seed) { const r = rng(seed); for (let i = 0; i < n; i++) R(x, r() * W, r() * maxY, 1, 1, r() < 0.3 ? P.star : '#6d6a66'); }
  function sprite(x, rows, cols, X, Y, s, flip, skip) {
    const w = rows[0].length;
    for (let j = 0; j < rows.length; j++) for (let i = 0; i < w; i++) {
      const ch = rows[j][i];
      if (ch === '.' || (skip && skip.indexOf(ch) >= 0)) continue;
      R(x, X + (flip ? w - 1 - i : i) * s, Y + j * s, s, s, cols[ch]);
    }
  }
  const pad = (a, n) => a.map(r => r.padEnd(n, '.'));
  const ELK = pad([
    '......a..a..a',
    '.......a.a.a.a',
    '........aaaaaa.a',
    '.............aaa',
    '..............ahh',
    '..............hhhhh',
    '.............hhhhhhh',
    '............hhh...hh',
    '..rbbbbbbbbbhhh',
    '.rrbbbbbbbbbbhh',
    '.rrbbbbbbbbbbbb',
    '.rrbbbbbbbbbbbb',
    '..rbbbbbbbbbbb',
    '..l.l.......l.l',
    '..l.l.......l.l',
    '..l..l......l..l'
  ], 22);
  const ECOL = { a: P.antler, h: P.mane, b: P.hide, r: P.rump, l: P.leg };
  const HUNT = pad(['...kk', '..kkkk', '...ss', '..gggg.w', '.gggggg.w', '.ggGgg..w', '..ggg...w', '..gGgg.w', '.gg..gg', '.g....g'], 10);
  const HCOL = { k: P.hat, s: P.skin, g: P.camo, G: P.camo2, w: '#3b2a1c' };
  function tiny(x, X, Y, flip, bull) {
    const d = flip ? -1 : 1, px = (i, j, c) => R(x, X + i * d, Y + j, 1, 1, c);
    for (let i = 0; i < 4; i++) { px(i, 0, P.hide); px(i, 1, P.hide); }
    px(0, 0, P.rump); px(0, 1, P.rump); px(4, -1, P.mane); px(4, 0, P.mane); px(5, -1, P.mane);
    px(0, 2, P.leg); px(3, 2, P.leg);
    if (bull) { px(4, -2, P.antler); px(3, -3, P.antler); px(5, -3, P.antler); }
  }
  function grass(x, y0, n, seed, cols) { const r = rng(seed); for (let i = 0; i < n; i++) R(x, r() * W, y0 + r() * (H - y0), 1, 1, cols[(r() * cols.length) | 0]); }

  window.BR = { P, W, H, ctx, R, rng, bands, ry, ridge, pine, aspen, stars, sprite, pad, ELK, ECOL, HUNT, HCOL, tiny, grass };

  // 1 — Camp, first light
  (function () {
    const x = ctx('s1'); if (!x) return;
    bands(x, [[0, P.night], [38, P.dusk], [62, P.dawn], [80, P.glow]]);
    stars(x, 22, 36, 7);
    ridge(x, 84, 7, 0.045, 1.2, P.far);
    for (let X = 0; X < W; X++) R(x, X, ry(X, 84, 7, 0.045, 1.2), 1, 1, '#6b4a45');
    ridge(x, 98, 5, 0.07, 3.1, P.mid);
    for (let X = 2; X < W; X += 5) pine(x, X, ry(X, 98, 5, 0.07, 3.1) + 3, 6 + ((X * 7) % 5), P.tree);
    for (let X = -2; X < W; X += 7) pine(x, X, 114, 14 + ((X * 13) % 7), P.timber, P.tree);
    R(x, 0, 112, W, H - 112, '#141c16');
    for (let X = 0; X < W; X += 2) R(x, X, 112, 1, 1, P.mid);
    for (let Y = 112; Y < H; Y++) for (let X = 56; X < 114; X++) {
      const d = Math.hypot(X - 84, (Y - 132) * 1.6);
      if (d < 24 && ((X + Y) & 1) === 0) R(x, X, Y, 1, 1, d < 13 ? '#5a3a22' : '#2e2419');
    }
    for (let j = 0; j < 18; j++) {
      const w = Math.round(j * 0.8);
      R(x, 30 - w, 116 + j, w * 2 + 1, 1, j < 3 ? '#8a8466' : '#6c674f');
      R(x, 31, 116 + j, w, 1, '#57533f');
    }
    for (let j = 8; j < 18; j++) { const w = Math.round((j - 8) * 0.35); R(x, 30 - w, 116 + j, w * 2 + 1, 1, '#1e1d17'); }
    R(x, 77, 134, 15, 2, '#4a3322'); R(x, 80, 135, 9, 2, '#3a281a');
    const fw = [1, 1, 2, 3, 3, 4, 5, 5, 5, 4];
    for (let j = 0; j < fw.length; j++) {
      const w = fw[j];
      R(x, 84 - w, 124 + j, w * 2 + 1, 1, P.fire2);
      if (w > 1) R(x, 85 - w, 124 + j, w * 2 - 1, 1, P.fire);
      if (w > 3) R(x, 83, 124 + j, 3, 1, P.bone);
    }
    R(x, 86, 120, 1, 1, P.fire); R(x, 81, 117, 1, 1, P.fire2);
    // pack + bow leaning on a stump
    R(x, 52, 126, 6, 8, '#4c4a36'); R(x, 53, 125, 4, 1, '#5e5b43'); R(x, 60, 118, 1, 16, '#3b2a1c'); R(x, 61, 117, 1, 2, '#3b2a1c'); R(x, 61, 133, 1, 2, '#3b2a1c');
  })();

  // 2 — Glassing through binoculars
  (function () {
    const x = ctx('s2'); if (!x) return;
    const off = document.createElement('canvas'); off.width = W; off.height = H;
    const o = off.getContext('2d'); o.imageSmoothingEnabled = false;
    bands(o, [[0, P.dusk], [16, P.dawn], [30, P.glow]]);
    ridge(o, 40, 5, 0.05, 2, P.far2);
    ridge(o, 54, 6, 0.035, 0.4, P.meadow);
    const r = rng(11);
    for (let i = 0; i < 700; i++) { const X = (r() * W) | 0, Y = (55 + r() * 95) | 0; if (Y > ry(X, 54, 6, 0.035, 0.4) + 1) R(o, X, Y, 1, 1, r() < 0.5 ? P.meadow2 : '#3d4a32'); }
    for (let Y = 60; Y < H + 8; Y += 3) for (let X = 0; X < W; X += 3) {
      const band = Math.sin(X * 0.08 - Y * 0.05) + Math.sin(X * 0.02 + Y * 0.07) * 0.7;
      if (band > 0.85 && Math.hypot(X - 54, (Y - 93) * 1.4) > 22) pine(o, X + (Y % 2), Y, 5 + ((X + Y) % 3), P.timber, P.tree);
    }
    [[18, 70], [24, 73], [99, 66], [105, 70], [94, 124]].forEach(([X, Y]) => aspen(o, X, Y, 3));
    tiny(o, 42, 92, false, false); tiny(o, 47, 94, false, false); tiny(o, 53, 96, true, false);
    tiny(o, 66, 93, true, false); tiny(o, 57, 89, false, true);
    x.drawImage(off, 0, 0);
    x.fillStyle = 'rgba(6,8,12,.74)'; x.fillRect(0, 0, W, H);
    const C = [[44, 96], [76, 96]], rad = 24;
    x.save(); x.beginPath();
    x.arc(C[0][0], C[0][1], rad, 0, Math.PI * 2); x.moveTo(C[1][0] + rad, C[1][1]); x.arc(C[1][0], C[1][1], rad, 0, Math.PI * 2);
    x.clip(); x.drawImage(off, 40, 84, 27, 16, 20, 72, 81, 48); x.restore();
    for (let k = 0; k < 2; k++) for (let a = 0; a < 360; a += 1.5) {
      const X = C[k][0] + Math.cos(a * Math.PI / 180) * rad, Y = C[k][1] + Math.sin(a * Math.PI / 180) * rad;
      const o2 = C[1 - k]; if (Math.hypot(X - o2[0], Y - o2[1]) < rad - 0.5) continue;
      R(x, X, Y, 1, 1, '#030406');
    }
    const bx = 68, by = 76, bw = 22, bh = 22, a = P.amber;
    R(x, bx, by, 4, 1, a); R(x, bx, by, 1, 4, a); R(x, bx + bw - 3, by, 4, 1, a); R(x, bx + bw, by, 1, 4, a);
    R(x, bx, by + bh, 4, 1, a); R(x, bx, by + bh - 3, 1, 4, a); R(x, bx + bw - 3, by + bh, 4, 1, a); R(x, bx + bw, by + bh - 3, 1, 4, a);
  })();

  // 3 — Stalk plan on a topo map
  (function () {
    const x = ctx('s3'); if (!x) return;
    const h = (X, Y) => Math.sin(X * 0.045 + 0.6) * 1.1 + Math.cos(Y * 0.035 - X * 0.012) * 1.3 + Math.sin((X + Y) * 0.028) * 0.7 - Y * 0.012;
    const t = (X, Y) => Math.sin(X * 0.11 + Y * 0.04) + Math.cos(Y * 0.09 - X * 0.05) * 0.9 + Math.sin((X - Y) * 0.07) * 0.5;
    for (let Y = 0; Y < H; Y++) for (let X = 0; X < W; X++) {
      const b = Math.floor(h(X, Y) * 3), timber = t(X, Y) > 0.75;
      let c = timber ? (((X * 7 + Y * 13) % 5) ? P.timber2 : P.tree2) : ((b & 1) ? P.meadow : '#4f5f3e');
      if (b !== Math.floor(h(X + 1, Y) * 3) || b !== Math.floor(h(X, Y + 1) * 3)) c = timber ? '#0f1812' : '#34402a';
      if (Math.abs(Y - (18 + X * 1.05 + Math.sin(X * 0.12) * 5)) < 1.2) c = P.water;
      R(x, X, Y, 1, 1, c);
    }
    [[84, 40], [89, 43], [86, 46], [93, 39], [80, 45]].forEach(([X, Y], i) => { R(x, X, Y, 2, 1, P.hide); R(x, X - 1, Y, 1, 1, P.rump); if (i === 0) { R(x, X + 1, Y - 1, 1, 1, P.antler); R(x, X + 2, Y - 2, 1, 1, P.antler); } });
    const pts = [[16, 136], [26, 112], [44, 96], [58, 72], [76, 54]];
    for (let s = 0; s < pts.length - 1; s++) {
      const [x0, y0] = pts[s], [x1, y1] = pts[s + 1], n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      for (let k = 0; k <= n; k++) if (k % 3 !== 2) R(x, x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, 1, 1, P.amber);
    }
    pts.slice(1).forEach(([X, Y]) => { R(x, X - 1, Y - 1, 3, 3, P.bone); R(x, X, Y, 1, 1, '#1a1f29'); });
    R(x, 14, 134, 5, 5, P.amber); R(x, 15, 135, 3, 3, '#2a2213');
    R(x, 96, 5, 20, 20, '#0b0d12'); R(x, 96, 5, 20, 1, '#2d3441');
    for (let k = 0; k <= 10; k++) R(x, 111 - k, 9 + k, 1, 1, P.wind);
    R(x, 101, 19, 4, 1, P.wind); R(x, 101, 16, 1, 4, P.wind);
  })();

  // 4 — The stalk
  (function () {
    const x = ctx('s4'); if (!x) return;
    bands(x, [[0, P.dusk], [20, P.dawn], [34, P.glow]]);
    ridge(x, 42, 6, 0.05, 1, P.far2);
    ridge(x, 62, 4, 0.06, 2.2, P.mid);
    for (let X = 66; X < W + 4; X += 4) pine(x, X, ry(X, 62, 4, 0.06, 2.2) + 22, 18 + ((X * 5) % 7), P.timber, P.tree);
    R(x, 0, 94, W, H - 94, P.meadow);
    for (let X = 0; X < W; X += 2) R(x, X, 94, 1, 1, P.mid);
    grass(x, 95, 420, 3, [P.meadow2, '#3d4a32', P.meadow3]);
    const r = rng(5);
    for (let i = 0; i < 90; i++) R(x, 60 + r() * 26, 121 + r() * 7, 1, 1, r() < 0.5 ? P.rock : P.rock2);
    sprite(x, ELK, ECOL, 90, 80, 1, false, 'a');
    sprite(x, ELK, ECOL, 60, 80, 1, true, 'a');
    R(x, 67, 70, 2, 5, P.amber); R(x, 67, 76, 2, 2, P.amber);
    sprite(x, HUNT, HCOL, 14, 94, 2, false);
    for (let X = 0; X < 60; X++) {
      const y = Math.round(112 - X * 0.09);
      R(x, X, y, 1, 6, '#4a3624'); R(x, X, y, 1, 1, '#6f5236');
      if (X % 5 === 0) R(x, X, y + 3, 1, 1, '#2f2217');
    }
    R(x, 38, 103, 1, 6, '#4a3624'); R(x, 37, 102, 1, 2, '#4a3624'); R(x, 52, 101, 1, 6, '#4a3624'); R(x, 53, 99, 1, 3, '#4a3624');
    for (let Y = 128; Y < H; Y++) for (let X = 0; X < W; X++) {
      const m = 138 + Math.sin(X * 0.16) * 5 + Math.sin(X * 0.05 + 1) * 4;
      if (Y > m) R(x, X, Y, 1, 1, ((X + Y) & 1) ? '#2c3a28' : '#364630');
    }
  })();
})();

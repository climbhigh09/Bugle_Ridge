// Bugle Ridge campaign board: pixel helpers and "graphics 5" animals (shaded, lit from upper left).
(function () {
  const X = (window.PX = {});
  X.R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const R = X.R;
  X.rng = s => { s = s >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  const BAYER = (X.BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16));
  const cache = {};
  X.mix = (a, b, t) => {
    t = Math.round(t * 24) / 24; const k = a + b + t; if (cache[k]) return cache[k];
    const p = (h, i) => parseInt(h.slice(i, i + 2), 16), c = i => Math.round(p(a, i) + (p(b, i) - p(a, i)) * t).toString(16).padStart(2, '0');
    return (cache[k] = '#' + c(1) + c(3) + c(5));
  };
  X.shade = (c, t) => (t >= 0 ? X.mix(c, '#fff4dc', t) : X.mix(c, '#03040a', -t));
  X.dith = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];
  // vertical gradient through [[y, colour], ...], ordered-dithered between 12 steps
  X.sky = (g, W, stops, H) => {
    for (let i = 0; i < stops.length - 1; i++) {
      const [y0, c0] = stops[i], [y1, c1] = stops[i + 1];
      for (let y = y0; y < y1; y++) {
        const t = (y - y0) / (y1 - y0) * 12, lo = Math.floor(t), fr = t - lo;
        R(g, 0, y, W, 1, X.mix(c0, c1, lo / 12));
        const hi = X.mix(c0, c1, Math.min(1, (lo + 1) / 12));
        for (let x = 0; x < W; x++) if (X.dith(x, y) < fr) R(g, x, y, 1, 1, hi);
      }
    }
    const last = stops[stops.length - 1];
    if (H && last[0] < H) R(g, 0, last[0], W, H - last[0], last[1]);
  };
  X.ry = (x, base, amp, f, s) => Math.round(base + Math.sin(x * f + s) * amp + Math.sin(x * f * 2.7 + s * 1.7) * amp * 0.45 + Math.sin(x * f * 6.3 + s * 2.9) * amp * 0.18);
  // ridge with haze, sunlit faces and optional snow above a height
  X.ridge = (g, W, H, base, amp, f, s, c, snowY) => {
    const lit = X.shade(c, 0.12), dark = X.shade(c, -0.16);
    for (let x = 0; x < W; x++) {
      const y = X.ry(x, base, amp, f, s), sl = X.ry(x + 2, base, amp, f, s) - X.ry(x - 2, base, amp, f, s);
      R(g, x, y, 1, H - y, c);
      for (let j = 0; j < 26; j++) if (X.dith(x, y + j) < 0.75 - j / 34) R(g, x, y + j, 1, 1, sl < 0 ? lit : sl > 0 ? dark : c);
      if (snowY != null && y < snowY) {
        const d = snowY - y;
        for (let j = 0; j < Math.min(d, 7); j++) if (X.dith(x, y + j) < 1 - j / 7) R(g, x, y + j, 1, 1, sl <= 0 ? '#e8ecf2' : '#a9b3c4');
      }
    }
  };
  // spruce with 4-tone ramp and tiered boughs
  X.pine = (g, x, y, h, c) => {
    const hi = X.shade(c, 0.2), lt = X.shade(c, 0.08), sh = X.shade(c, -0.2), dk = X.shade(c, -0.35);
    for (let i = 0; i < h; i++) {
      const tp = (i % 5) / 4, half = Math.round(i * 0.28 * (0.55 + 0.45 * tp)), yy = y - h + i;
      R(g, x - half, yy, half * 2 + 1, 1, c);
      if (half > 0) { R(g, x - half, yy, Math.max(1, half >> 1), 1, lt); R(g, x + 1, yy, half, 1, sh); }
      if (tp === 1 && half > 1) { R(g, x - half, yy, 1, 1, hi); R(g, x + half, yy, 1, 1, dk); }
    }
    R(g, x, y - 1, 1, 2, '#2a1f16');
  };
  X.aspen = (g, x, y, r, gold) => {
    const c = gold || '#c99a3e', ramp = [X.shade(c, 0.25), c, X.shade(c, -0.2), X.shade(c, -0.38)];
    for (let j = -r; j <= r; j++) for (let i = -r - 1; i <= r + 1; i++) {
      const d = Math.hypot(i / 1.15, j) / r; if (d > 1 || (d > 0.8 && X.dith(x + i, y + j) > 0.5)) continue;
      const t = (i + j) / (2 * r) + (X.dith(x + i, y + j) - 0.5) * 0.4;
      R(g, x + i, y + j, 1, 1, ramp[t < -0.45 ? 0 : t < 0.05 ? 1 : t < 0.45 ? 2 : 3]);
    }
    R(g, x, y + r, 1, Math.round(r * 1.3), '#e4dfd2'); R(g, x + 1, y + r, 1, Math.round(r * 1.3), '#a9a293');
    R(g, x, y + r + 2, 1, 1, '#2e2a26');
  };
  X.grass = (g, W, H, y0, n, seed, cols) => {
    const r = X.rng(seed);
    for (let i = 0; i < n; i++) {
      const x = r() * W, y = y0 + r() * (H - y0), c = cols[(r() * cols.length) | 0], t = 1 + ((y - y0) / (H - y0)) * 3;
      R(g, x, y - t, 1, t, c); if (r() < 0.5) R(g, x, y - t, 1, 1, X.shade(c, 0.2));
    }
  };
  // filled ellipse with a lighting ramp (light from upper-left)
  X.blob = (g, cx, cy, rx, ry, ramp, rim) => {
    for (let y = Math.floor(-ry); y <= ry; y++) for (let x = Math.floor(-rx); x <= rx; x++) {
      const d = (x * x) / (rx * rx) + (y * y) / (ry * ry); if (d > 1) continue;
      const l = (-x / rx) * 0.35 + (-y / ry) * 0.65 + (X.dith(cx + x, cy + y) - 0.5) * 0.35;
      let k = l > 0.45 ? 0 : l > 0.05 ? 1 : l > -0.4 ? 2 : 3;
      if (rim && d > 0.8 && y > 0) k = 3;
      R(g, cx + x, cy + y, 1, 1, ramp[k]);
    }
  };
  const thick = (g, x0, y0, x1, y1, w, c) => {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let k = 0; k <= n; k++) R(g, x0 + (x1 - x0) * k / n - (w >> 1), y0 + (y1 - y0) * k / n - (w >> 1), w, w, c);
  };
  X.thick = thick;

  // Elk at graphics 5. (x,y) = ground under the belly; s = scale; dir 1 = facing right. opts: bull, points(4–7), headDown, cowCoat
  X.elk = (g, x, y, s, dir, o) => {
    o = o || {};
    const f = (px, py) => [x + px * s * dir, y + py * s];
    const HIDE = ['#c49460', '#a3743f', '#835a2f', '#5c3e20'], MANE = ['#6a4a30', '#523723', '#3c2819', '#281a10'], RUMP = ['#f0dcb0', '#dcc190', '#c2a472', '#9c8058'];
    const leg = (px, far) => { const [lx, ly] = f(px, -6); R(g, lx - s * 0.6, ly, s * 1.3, 11 * s, far ? '#2a1d13' : '#3c2b1c'); R(g, lx - s * 0.6, ly + 11 * s, s * 1.5, s, '#120c08'); };
    leg(-6, true); leg(7, true);
    const [bx, by] = f(0, -11);
    X.blob(g, bx, by, 12 * s, 6.5 * s, o.cowCoat || HIDE, true);
    const [rx, ry2] = f(-9.5, -11.5); X.blob(g, rx, ry2, 3.2 * s, 5 * s, RUMP);
    leg(-8, false); leg(5, false);
    // neck + mane
    const hx = o.headDown ? 17 : 15, hy = o.headDown ? -3 : -21;
    for (let t = 0; t <= 1; t += 0.04) {
      const px = 8 + (hx - 8) * t, py = -13 + (hy + 2 - -13) * t, w = (5.2 - t * 2.2) * s;
      const [nx, ny] = f(px, py); X.blob(g, nx, ny, w, w * 0.9, MANE);
    }
    const [hx2, hy2] = f(hx + 1.5, hy); X.blob(g, hx2, hy2, 3.6 * s, 2.4 * s, HIDE);
    const [mx, my] = f(hx + 4.5, hy + 0.8); X.blob(g, mx, my, 2 * s, 1.6 * s, ['#6e5238', '#57402b', '#3f2e1f', '#2a1e14']);
    const [ex, ey] = f(hx + 1.8, hy - 0.8); R(g, ex, ey, Math.max(1, s * 0.8), Math.max(1, s * 0.8), '#0a0705');
    const [kx, ky] = f(hx - 1, hy - 2.8); R(g, kx - s * 0.5, ky - 2 * s, s * 1.2, 2.4 * s, '#8a6440');
    if (o.bull) {
      const pts = o.points || 6, A = '#d7c7a2', T = '#f6efdc';
      const base = f(hx, hy - 2.5), tip = f(hx - 13, hy - 20), mid = f(hx - 2, hy - 15);
      const bez = t => [(1 - t) * (1 - t) * base[0] + 2 * (1 - t) * t * mid[0] + t * t * tip[0], (1 - t) * (1 - t) * base[1] + 2 * (1 - t) * t * mid[1] + t * t * tip[1]];
      let prev = base;
      for (let t = 0.05; t <= 1.001; t += 0.05) { const p = bez(t); thick(g, prev[0], prev[1], p[0], p[1], Math.max(1, Math.round(s * (1.3 - t * 0.6))), A); prev = p; }
      for (let i = 0; i < pts - 1; i++) {
        const t = 0.1 + i * (0.85 / (pts - 1)), [px, py] = bez(t), len = (i === 0 ? 6 : i === 3 ? 8 : 6.5) * s;
        const tx = px + dir * len * (i === 0 ? 0.9 : 0.55), ty = py - len * (i === 0 ? 0.35 : 0.85);
        thick(g, px, py, tx, ty, Math.max(1, Math.round(s * 0.8)), A); R(g, tx, ty, Math.max(1, s * 0.8), Math.max(1, s * 0.8), T);
      }
      R(g, tip[0], tip[1], Math.max(1, s), Math.max(1, s), T);
    }
  };

  X.moose = (g, x, y, s, dir) => {
    const f = (px, py) => [x + px * s * dir, y + py * s];
    const HIDE = ['#4a3a2e', '#3a2c22', '#2a1f18', '#1a130e'];
    const leg = (px, far) => { const [lx, ly] = f(px, -6); R(g, lx, ly, s * 1.4, 13 * s, far ? '#1a130e' : '#6e5c48'); };
    leg(-7, true); leg(8, true);
    const [bx, by] = f(0, -13); X.blob(g, bx, by, 13 * s, 7.5 * s, HIDE, true);
    const [hx, hy] = f(9, -19); X.blob(g, hx, hy, 5 * s, 5 * s, HIDE);
    leg(-9, false); leg(6, false);
    for (let t = 0; t <= 1; t += 0.1) { const [nx, ny] = f(12 + t * 5, -18 + t * 4); X.blob(g, nx, ny, 3 * s, 2.6 * s, HIDE); }
    const [mx, my] = f(19, -13.5); X.blob(g, mx, my, 3 * s, 2.2 * s, ['#3e3026', '#30251d', '#221a14', '#140f0b']);
    const [ex, ey] = f(15, -17.5); R(g, ex, ey, s, s, '#050302');
    const [bl, bly] = f(15, -10); R(g, bl, bly, s * 1.2, 4 * s, '#2a1f18');
    const [px, py] = f(12, -21);
    for (let i = -9; i <= 9; i++) { const yy = py - Math.abs(Math.sin(i * 0.3)) * 3 * s; R(g, px + i * s, yy, s, 3 * s, i % 3 === 0 ? '#e8dcbc' : '#b8a57c'); if (i % 3 === 0) R(g, px + i * s, yy - 3 * s, s, 3 * s, '#f0e6cc'); }
  };

  X.wolf = (g, x, y, s, dir) => {
    const f = (px, py) => [x + px * s * dir, y + py * s];
    const FUR = ['#b8b0a0', '#8e877a', '#645e55', '#3e3a35'];
    const [bx, by] = f(0, -6); X.blob(g, bx, by, 6 * s, 2.8 * s, FUR);
    const [hx, hy] = f(6.5, -8); X.blob(g, hx, hy, 2.4 * s, 2 * s, FUR);
    const [sx, sy] = f(9, -7.4); R(g, sx - s, sy, 2 * s, s, '#3e3a35');
    const [ea, eb] = f(6, -10.5); R(g, ea, eb, s, s * 1.5, '#645e55');
    [-4, -2, 3, 5].forEach(p => { const [lx, ly] = f(p, -4); R(g, lx, ly, s, 4 * s, '#4e4a44'); });
    const [tx, ty] = f(-7, -6); X.thick(g, tx, ty, tx - dir * 4 * s, ty + 3 * s, Math.max(1, s), '#645e55');
  };

  X.bear = (g, x, y, s, dir) => {
    const f = (px, py) => [x + px * s * dir, y + py * s];
    const FUR = ['#a8845a', '#7e5f3c', '#5a4229', '#3a2a1a'];
    [-5, -2, 4, 7].forEach(p => { const [lx, ly] = f(p, -5); R(g, lx - s, ly, 2.4 * s, 5 * s, '#3a2a1a'); });
    const [bx, by] = f(0, -9); X.blob(g, bx, by, 9 * s, 5.5 * s, FUR, true);
    const [hump, hy] = f(3, -13); X.blob(g, hump, hy, 4 * s, 3 * s, FUR);
    const [hx, hy2] = f(10, -9); X.blob(g, hx, hy2, 3.2 * s, 2.8 * s, FUR);
    const [sx, sy] = f(13, -8); R(g, sx - s, sy, 2 * s, 1.5 * s, '#2a1e14');
    const [ea, eb] = f(9, -12.2); R(g, ea, eb, s * 1.2, s * 1.2, '#5a4229');
  };
})();

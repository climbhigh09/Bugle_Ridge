// Bugle Ridge storyboard — scenes 5–8
(function () {
  if (!window.BR) return;
  const { P, W, H, ctx, R, rng, bands, ry, ridge, pine, stars, sprite, pad, ELK, ECOL, HUNT, HCOL, grass } = window.BR;

  // 5 — Calling in dark timber
  (function () {
    const x = ctx('s5'); if (!x) return;
    R(x, 0, 0, W, H, '#101a14');
    for (let Y = 0; Y < H; Y++) for (let X = 0; X < W; X++) if ((X + Y * 0.5) % 40 < 6 && ((X + Y) & 1) === 0) R(x, X, Y, 1, 1, '#1d2b20');
    for (let X = -4; X < W; X += 9) pine(x, X, 120 + ((X * 3) % 8), 40 + ((X * 7) % 12), '#15231a', '#182a1e');
    R(x, 0, 118, W, H - 118, '#1f2a1c');
    grass(x, 119, 360, 9, ['#2a3322', '#3a3424', '#172014']);
    [104, 86].forEach(X => pine(x, X, 126, 66, P.timber, P.tree));
    sprite(x, ELK, ECOL, 44, 104, 1, true);
    [[44, 108], [42, 107], [40, 105], [43, 105], [38, 103], [41, 102]].forEach(([X, Y], i) => R(x, X, Y, 1, 1, i % 2 ? '#7d878c' : '#a9b1b3'));
    R(x, 0, 0, 9, H, '#2a2118');
    for (let Y = 4; Y < H; Y += 7) R(x, 2 + (Y % 3), Y, 2, 3, '#1b150f');
    R(x, 9, 0, 1, H, '#3a2e22');
    sprite(x, HUNT, HCOL, 10, 116, 2, false);
    for (let j = 0; j < 22; j++) R(x, W - 30 + j, 0, 30 - j, 1, '#0b120d');
    for (let j = 0; j < 14; j++) R(x, 10, j, 24 - j * 1.6, 1, '#0b120d');
  })();

  // 6 — The shot, through the bow sight
  (function () {
    const x = ctx('s6'); if (!x) return;
    bands(x, [[0, P.dawn], [26, '#5a4452'], [40, P.glow]]);
    ridge(x, 50, 5, 0.05, 0.8, P.far2);
    for (let X = 0; X < W + 4; X += 5) pine(x, X, 102, 22 + ((X * 11) % 9), P.timber, P.tree);
    R(x, 0, 100, W, H - 100, P.meadow);
    grass(x, 101, 500, 21, [P.meadow2, '#3d4a32', P.meadow3]);
    sprite(x, ELK, ECOL, 27, 58, 3, false);
    const cx = 61, cy = 89;
    for (let a = 0; a < 360; a += 12) R(x, cx + Math.cos(a * Math.PI / 180) * 5, cy + Math.sin(a * Math.PI / 180) * 5, 1, 1, '#c25a4c');
    for (let Y = 0; Y < H; Y++) for (let X = 0; X < W; X++) {
      const d = Math.hypot(X - cx, Y - cy);
      if (d > 32 && ((X + Y) & 1) === 0) R(x, X, Y, 1, 1, '#07080b');
      else if (d > 19 && d <= 21.5) R(x, X, Y, 1, 1, '#0a0b0e');
    }
    [[-10, P.wind], [-5, P.amber], [0, '#e25b4f'], [5, P.wind], [10, P.amber]].forEach(([dy, c]) => {
      R(x, cx - 18, cy + dy, 17, 1, '#0a0b0e'); R(x, cx - 1, cy + dy, 2, 2, c);
    });
    R(x, cx - 5, cy + 15, 11, 3, '#0a0b0e'); R(x, cx - 4, cy + 16, 9, 1, '#2f4a33'); R(x, cx, cy + 16, 2, 1, P.bone);
  })();

  // 7 — Blood trail and a downed bull
  (function () {
    const x = ctx('s7'); if (!x) return;
    R(x, 0, 0, W, H, P.meadow);
    grass(x, 0, 900, 33, [P.meadow2, '#3d4a32', P.meadow3, '#394530']);
    const cxAt = Y => 60 + Math.sin(Y * 0.05) * 12 + (150 - Y) * 0.05;
    for (let Y = 20; Y < H; Y++) { const c = cxAt(Y); R(x, c - 3, Y, 7, 1, P.dirt); if (Y & 1) { R(x, c - 4, Y, 1, 1, P.dirt); R(x, c + 4, Y, 1, 1, '#3d4a32'); } }
    for (let Y = 140; Y > 30; Y -= 12) { const c = cxAt(Y); R(x, c - 2, Y, 1, 2, '#2c241b'); R(x, c - 1, Y, 1, 2, '#2c241b'); R(x, c + 1, Y + 5, 1, 2, '#2c241b'); R(x, c + 2, Y + 5, 1, 2, '#2c241b'); }
    const r = rng(8);
    for (let Y = 132; Y > 26; Y -= 3 + ((r() * 4) | 0)) {
      const c = cxAt(Y), n = Y < 70 ? 3 : 1;
      for (let k = 0; k < n; k++) R(x, c - 5 + r() * 10, Y + r() * 2, 1 + (r() < 0.3 ? 1 : 0), 1, P.blood);
    }
    for (let k = 0; k < 9; k++) R(x, 38 + k, 104 - k * 0.6, 1, 1, '#d8cfb8');
    R(x, 37, 104, 1, 1, P.blood); R(x, 36, 105, 1, 1, P.blood); R(x, 46, 98, 2, 1, P.amber); R(x, 45, 99, 2, 1, P.amber);
    for (let X = -3; X < W + 4; X += 6) pine(x, X, 18 + ((X * 7) % 5), 20 + ((X * 3) % 7), P.timber, P.tree);
    R(x, 54, 26, 26, 3, '#2a3325');
    sprite(x, ELK, ECOL, 57, 14, 1, false, 'l');
  })();

  // 8 — Campfire debrief with Hank
  (function () {
    const x = ctx('s8'); if (!x) return;
    R(x, 0, 0, W, H, P.night);
    stars(x, 46, 70, 14);
    ridge(x, 70, 8, 0.04, 2.4, '#151b27');
    ridge(x, 90, 5, 0.07, 0.3, '#10151d');
    for (let X = 0; X < W; X += 4) pine(x, X, ry(X, 90, 5, 0.07, 0.3) + 10, 10 + ((X * 7) % 8), '#0b1014');
    R(x, 0, 112, W, H - 112, '#0e1210');
    for (let Y = 96; Y < H; Y++) for (let X = 22; X < 100; X++) {
      const d = Math.hypot(X - 60, (Y - 128) * 1.5);
      if (d < 34 && ((X + Y) & 1) === 0) R(x, X, Y, 1, 1, d < 16 ? '#5a3a22' : d < 26 ? '#3a2819' : '#1f1a14');
    }
    const MEN = pad(['..kkkk', '.kkkkkkkk', '..ssss', '..sEss', '..eeee', '.cccccc', 'cccCcccc', 'cCccccCc', 'cccccccc', '.jjjjjjj', '.jjjjjjjjj', '......jjbb'], 10);
    sprite(x, MEN, { k: '#3a3226', s: '#b98a62', E: '#2a1f18', e: '#cfc6b2', c: '#7a3b2e', C: '#4f2620', j: '#34445a', b: '#2a2018' }, 20, 106, 2, false);
    sprite(x, HUNT, HCOL, 80, 114, 2, true);
    R(x, 52, 134, 17, 2, '#4a3322'); R(x, 55, 135, 11, 2, '#3a281a');
    const fw = [1, 1, 2, 2, 3, 4, 4, 5, 5, 5, 4];
    for (let j = 0; j < fw.length; j++) {
      const w = fw[j];
      R(x, 60 - w, 123 + j, w * 2 + 1, 1, P.fire2);
      if (w > 1) R(x, 61 - w, 123 + j, w * 2 - 1, 1, P.fire);
      if (w > 3) R(x, 59, 123 + j, 3, 1, P.bone);
    }
    R(x, 63, 118, 1, 1, P.fire); R(x, 57, 114, 1, 1, P.fire2); R(x, 61, 109, 1, 1, P.fire2);
    R(x, 44, 124, 3, 4, '#6b6f73'); R(x, 45, 121, 1, 2, '#555a5e');
  })();
})();

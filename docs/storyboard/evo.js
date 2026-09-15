// Bugle Ridge campaign board: hunter evolution sprites (30×40), trail map, and the 3-vs-5 comparison.
(function () {
  const X = window.PX, R = X.R;
  const ctx = id => { const c = document.getElementById(id); if (!c) return null; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return g; };

  // One standing hunter, front three-quarter. stage 0–5 layers gear, clothes and age.
  function hunter(g, ox, oy, st, small) {
    const P = (x, y, w, h, c) => R(g, ox + x, oy + y, w, h, c);
    const skin = '#c49a74', skinSh = '#9a7456';
    const jacket = st === 4 ? ['#4f5a44', '#3c4534', '#2b3226'] : st === 5 ? ['#8e3c2e', '#6c2c22', '#4c1e18'] : ['#6f6c4a', '#57543a', '#3e3c2a'];
    const pants = st === 4 ? ['#2a2e2a', '#1c201c'] : ['#5a5a44', '#44442f'];
    const hair = st >= 5 ? '#a9a49a' : '#5a4230';
    // pack behind shoulders
    if (st >= 2) { P(7, 5, 2, 20, '#3a3a36'); P(21, 5, 2, 20, '#3a3a36'); P(8, 4, 14, 2, '#3a3a36'); }
    if (st >= 2) P(9, 12, 12, 13, st === 4 ? '#3a4432' : '#54573e');
    else if (st >= 0) P(9, 14, 12, 9, '#4d4a36');
    if (st === 3) { X.thick(g, ox + 9, oy + 4, ox + 5, oy - 2, 1, '#e2d6b8'); X.thick(g, ox + 6, oy + 1, ox + 3, oy + 1, 1, '#e2d6b8'); X.thick(g, ox + 21, oy + 4, ox + 25, oy - 2, 1, '#e2d6b8'); X.thick(g, ox + 24, oy + 1, ox + 27, oy + 1, 1, '#e2d6b8'); }
    // legs + boots
    P(11, 27, 4, 9, pants[0]); P(16, 27, 4, 9, pants[1]); P(14, 27, 1, 5, pants[1]);
    if (st === 4) { P(10, 29, 5, 7, '#1a1e1a'); P(16, 29, 5, 7, '#141814'); }
    P(10, 36, 5, 2, '#2a1e14'); P(16, 36, 5, 2, '#1e150e'); P(10, 37, 5, 1, '#120c08'); P(16, 37, 5, 1, '#120c08');
    // torso with 3-tone shading
    P(10, 14, 11, 13, jacket[1]); P(10, 14, 4, 13, jacket[0]); P(18, 14, 3, 13, jacket[2]);
    if (st !== 5 && st !== 4) for (let y = 15; y < 26; y += 3) { P(12 + (y % 2), y, 2, 1, jacket[2]); P(16, y + 1, 2, 1, jacket[0]); }
    if (st === 5) for (let y = 14; y < 27; y += 3) P(10, y, 11, 1, '#b8594a');
    if (st === 1) { P(10, 14, 11, 10, '#e0661e'); P(10, 14, 3, 10, '#f08236'); P(18, 14, 3, 10, '#b44e14'); P(15, 14, 1, 10, '#8a3a10'); }
    P(10, 26, 11, 1, '#2a2418');
    if (st === 3) { P(19, 22, 2, 4, '#c8322a'); P(19, 22, 2, 1, '#e6e0d0'); }
    // arms
    P(8, 15, 2, 10, jacket[0]); P(21, 15, 2, 10, jacket[2]); P(8, 25, 2, 2, skin); P(21, 25, 2, 2, skinSh);
    // head
    P(12, 7, 7, 7, skin); P(17, 7, 2, 7, skinSh); P(13, 10, 1, 1, '#1a120c'); P(16, 10, 1, 1, '#1a120c');
    if (st >= 1) P(12, 12, 7, st >= 3 ? 3 : 1, st === 1 ? '#7a6048' : hair);
    if (st >= 2) { P(12, 11, 1, 3, hair); P(18, 11, 1, 3, hair); }
    if (st >= 3) P(13, 14, 5, 1, hair);
    // hats
    if (st === 0 || st === 2) { P(11, 5, 8, 3, st === 2 ? '#4a4636' : '#6f6c4a'); P(17, 7, 4, 1, st === 2 ? '#3a3628' : '#57543a'); }
    if (st === 1) { P(11, 5, 8, 3, '#e0661e'); P(11, 5, 3, 3, '#f08236'); P(10, 7, 10, 1, '#b44e14'); }
    if (st === 3) { P(11, 4, 8, 4, '#4a3a2a'); P(9, 7, 12, 1, '#3a2c1e'); }
    if (st === 4) { P(11, 4, 8, 4, '#3c4534'); P(10, 7, 10, 2, '#2b3226'); }
    if (st === 5) { P(11, 3, 8, 5, '#5a4630'); P(8, 7, 14, 1, '#3b2f22'); P(11, 6, 8, 1, '#2a2016'); }
    // weapons / props
    if (st === 0) { X.thick(g, ox + 24, oy + 10, ox + 26, oy + 20, 1, '#4a3322'); X.thick(g, ox + 26, oy + 20, ox + 24, oy + 30, 1, '#4a3322'); X.thick(g, ox + 24, oy + 10, ox + 24, oy + 30, 1, '#8a8272'); }
    if (st === 1 || st === 4) { X.thick(g, ox + 7, oy + 28, ox + 24, oy + 6, 1, '#2a2a2a'); X.thick(g, ox + 9, oy + 25, ox + 12, oy + 21, 2, '#5a3e24'); }
    if (st === 2) { X.thick(g, ox + 24, oy + 16, ox + 26, oy + 37, 1, '#8a8a84'); X.thick(g, ox + 6, oy + 30, ox + 22, oy + 2, 1, '#2a2a2a'); P(ox ? 21 : 21, 1, 3, 3, '#1a1a1a'); }
    if (st === 3) { X.thick(g, ox + 22, oy + 3, ox + 27, oy - 3, 1, '#6a6a64'); X.thick(g, ox + 22, oy + 3, ox + 25, oy - 4, 1, '#6a6a64'); P(24, -6, 4, 3, '#3a3a36'); }
    if (st === 4) { P(0, 28, 6, 8, '#d8d0bc'); P(0, 28, 6, 1, '#b8ae98'); P(1, 30, 4, 1, '#a8a088'); }
    if (st === 5) { P(22, 23, 3, 3, '#d0d0c8'); P(25, 24, 1, 2, '#8a8a84'); }
  }

  const bg = (g, st) => {
    const skies = [['#2a2a46', '#c07a54'], ['#3a4658', '#8a9aac'], ['#28354a', '#b0885c'], ['#3a2c3e', '#d08a4c'], ['#2e3a44', '#6e8290'], ['#0a0d16', '#1e2436']];
    X.sky(g, 30, [[0, skies[st][0]], [30, skies[st][1]], [40, skies[st][1]]]);
    R(g, 0, 34, 30, 6, st === 1 ? '#dfe4ea' : st === 5 ? '#141810' : st === 4 ? '#3e4a3a' : '#3a4630');
    if (st === 5) { R(g, 3, 36, 5, 2, '#e3a646'); R(g, 4, 35, 3, 1, '#f2c060'); }
  };
  for (let st = 0; st < 6; st++) {
    const g = ctx('evo' + st); if (!g) continue;
    bg(g, st);
    if (st === 5) {
      g.save(); g.translate(-6, 1); hunter(g, 0, 0, 5); g.restore();
      // Grandpa Sam: stooped, grey beard, old felt hat, walking stick
      const S = (x, y, w, h, c) => R(g, 19 + x, 13 + y, w, h, c);
      S(0, 0, 8, 2, '#5a4a38'); S(-1, 2, 10, 1, '#3e3226'); S(2, 3, 5, 5, '#c49a74'); S(6, 3, 1, 5, '#9a7456'); S(3, 5, 1, 1, '#1a120c');
      S(2, 6, 5, 3, '#d8d4cc'); S(3, 9, 3, 1, '#b0aca4');
      S(1, 9, 7, 9, '#5a6a7a'); S(1, 9, 2, 9, '#6e7e8e'); S(6, 9, 2, 9, '#46545f');
      S(2, 18, 2, 6, '#4a4232'); S(5, 18, 2, 6, '#3a3426'); S(1, 24, 3, 1, '#1e150e'); S(5, 24, 3, 1, '#1e150e');
      X.thick(g, 29, 22, 30, 38, 1, '#6a5038');
    } else hunter(g, 0, 1, st);
  }

  // trail map: mountain ranges left→right, a dashed trail with six stops, the Alaska coast at the end
  (function () {
    const g = ctx('trail'); if (!g) return; const W = 480, H = 150;
    X.sky(g, W, [[0, '#0f1320'], [60, '#2a2e48'], [104, '#8a5a52'], [118, '#c7824e']], H);
    const r = X.rng(5); for (let i = 0; i < 70; i++) R(g, r() * W, r() * 55, 1, 1, r() < 0.3 ? '#d8cfbc' : '#6d6a76');
    X.ridge(g, W, H, 92, 16, 0.02, 1.4, '#3a3f5a', 86);
    X.ridge(g, W, H, 108, 11, 0.035, 3.3, '#2c3346', 98);
    for (let x = 0; x < W; x += 4) X.pine(g, x + (x % 3), X.ry(x, 118, 5, 0.06, 0.4) + 6, 7 + ((x * 7) % 6), '#18261c');
    R(g, 0, 124, W, 26, '#141c16');
    X.grass(g, W, H, 124, 500, 9, ['#26331f', '#1e2a1a', '#34402a']);
    for (let x = 400; x < W; x++) for (let y = 122 + Math.round(Math.sin(x * 0.08) * 2); y < H; y++) R(g, x, y, 1, 1, X.dith(x, y) < 0.5 ? '#24425a' : '#2e5470');
    const stops = [[40, 132], [118, 136], [196, 130], [278, 136], [370, 130], [448, 134]];
    for (let i = 0; i < stops.length - 1; i++) {
      const [x0, y0] = stops[i], [x1, y1] = stops[i + 1], n = x1 - x0;
      for (let k = 0; k <= n; k += 1) if (k % 4 < 2) R(g, x0 + k, y0 + (y1 - y0) * k / n + Math.sin(k * 0.12) * 3, 1, 1, '#e3a646');
    }
    stops.forEach(([x, y], i) => { R(g, x - 3, y - 3, 7, 7, '#07080b'); R(g, x - 2, y - 2, 5, 5, i === 5 ? '#f2b04a' : '#e3a646'); R(g, x - 1, y - 1, 3, 3, '#2a2213'); });
    // stop icons
    X.aspen(g, 30, 104, 4, '#d7a646'); X.aspen(g, 50, 108, 3, '#d7a646');
    X.elk(g, 60, 128, 1, -1, { bull: true, points: 6 });
    for (let i = 0; i < 40; i++) R(g, 100 + r() * 36, 96 + r() * 26, 1, 1, '#e8ecf2');
    R(g, 124, 122, 3, 4, '#e0661e');
    X.wolf(g, 206, 124, 1, 1);
    X.bear(g, 292, 128, 1, -1);
    X.moose(g, 382, 124, 1, 1);
    for (let j = 0; j < 8; j++) R(g, 452 - j, 118 + j, j * 2 + 1, 1, j < 3 ? '#f2b04a' : '#d8602e');
  })();

  // same scene twice: today's look at 120×160 vs the target at 240×320
  (function () {
    const g3 = ctx('cmp3');
    if (g3) {
      const W = 120, H = 160;
      [[0, '#1a2031'], [36, '#39334f'], [56, '#b8694a']].forEach(([y, c], i, a) => R(g3, 0, y, W, (a[i + 1] ? a[i + 1][0] : 70) - y, c));
      for (let x = 0; x < W; x++) { const y = X.ry(x, 70, 6, 0.05, 1); R(g3, x, y, 1, H - y, '#303849'); }
      for (let x = 0; x < W; x++) { const y = X.ry(x, 86, 3, 0.07, 2); R(g3, x, y, 1, H - y, '#27352c'); }
      for (let x = 0; x < W; x += 5) for (let i = 0; i < 12; i++) { const w = 1 + 2 * Math.floor(i * 0.3); R(g3, x - (w >> 1), 88 + i, w, 1, '#16241b'); }
      R(g3, 0, 100, W, 60, '#46553a');
      const rr = X.rng(3); for (let i = 0; i < 180; i++) R(g3, rr() * W, 100 + rr() * 60, 1, 1, rr() < 0.5 ? '#5d6c46' : '#3d4a32');
      const E = ['......a..a', '.......a.aa', '..........ahh', '..........hhhh', '..rbbbbbbbhh', '.rrbbbbbbbb', '.rrbbbbbbbb', '..l.l....l.l', '..l.l....l.l'];
      const C = { a: '#ddd0b3', h: '#4d3423', b: '#8f633a', r: '#cdb07e', l: '#33251a' };
      E.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== '.') R(g3, 50 + i * 2, 102 + j * 2, 2, 2, C[ch]); }));
    }
    const g = ctx('cmp5'); if (!g) return;
    const W = 240, H = 320;
    X.sky(g, W, [[0, '#1c2036'], [70, '#4a3a5a'], [112, '#b86e58'], [132, '#e39a5c']], H);
    for (let y = 104; y < 140; y++) for (let x = 120; x < W; x++) { const d = Math.hypot((x - 196) / 2.2, y - 136) / 40; if (d < 1 && X.dith(x, y) < (1 - d) * 0.8) R(g, x, y, 1, 1, '#f0b070'); }
    X.ridge(g, W, H, 118, 16, 0.02, 2.2, '#4a4468', 110);
    X.ridge(g, W, H, 140, 10, 0.035, 0.6, '#35384e');
    for (let x = 0; x < W; x += 5) X.pine(g, x, X.ry(x, 168, 4, 0.05, 1) + 8, 14 + ((x * 7) % 10), X.mix('#1a2a20', '#35384e', 0.35));
    [[22, 172], [36, 176], [206, 170], [222, 174]].forEach(([x, y]) => X.aspen(g, x, y, 7));
    for (let x = -2; x < W; x += 7) X.pine(g, x, 190 + ((x * 3) % 6), 34 + ((x * 11) % 16), '#1a2a20');
    X.sky(g, W, [[186, '#4f6040'], [250, '#44553a'], [320, '#2e3a28']]);
    X.grass(g, W, H, 188, 2200, 21, ['#6a7c4c', '#56673f', '#3e4c30', '#7f8454', '#8a7a4e']);
    for (let x = 0; x < W; x++) R(g, x, 200 + Math.round((x - 130) * -0.02), 1, 1, '#1a2016');
    X.elk(g, 118, 232, 2, 1, { bull: true, points: 6 });
    for (let i = 0; i < 6; i++) R(g, 172 + i * 3, 172 - i, 2, 1, i % 2 ? '#c8ccd0' : '#e8ecf0');
    for (let x = 0; x < W; x += 2) { const h = 8 + ((x * 7) % 14); R(g, x, H - h, 1, h, x % 4 ? '#26301f' : '#1d2618'); R(g, x, H - h, 1, 1, '#4a5a38'); }
  })();
})();

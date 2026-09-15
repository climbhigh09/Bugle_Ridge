// Bugle Ridge campaign board: one 240×320 phone frame per chapter, drawn at the "graphics 5" target.
(function () {
  const X = window.PX, R = X.R, W = 240, H = 320;
  const ctx = id => { const c = document.getElementById(id); if (!c) return null; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return g; };
  const label = (g, x, y, text, col) => {
    g.font = '600 9px "IBM Plex Mono", ui-monospace, monospace';
    const w = Math.ceil(g.measureText(text).width) + 8;
    R(g, x, y, w, 13, 'rgba(7,8,11,.82)'); R(g, x, y, 2, 13, col || '#e3a646');
    g.fillStyle = col || '#e3a646'; g.fillText(text, x + 5, y + 10);
  };
  const reticle = (g, cx, cy, r, col) => {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (Math.hypot(x - cx, y - cy) > r && X.dith(x, y) < 0.9) R(g, x, y, 1, 1, '#050608');
    for (let a = 0; a < 360; a += 2) R(g, cx + Math.cos(a * Math.PI / 180) * r, cy + Math.sin(a * Math.PI / 180) * r, 2, 2, '#050608');
    R(g, cx - r, cy, r - 6, 1, col); R(g, cx + 6, cy, r - 6, 1, col); R(g, cx, cy - r, 1, r - 6, col); R(g, cx, cy + 6, 1, r - 6, col);
    R(g, cx - r, cy - 1, 18, 3, col); R(g, cx + r - 18, cy - 1, 18, 3, col); R(g, cx - 1, cy + r - 18, 3, 18, col);
  };

  // Ch1 — Colorado archery: sunrise bench, aspen branch across the lane to a 5×5 at 34 yd
  (function () {
    const g = ctx('ch1'); if (!g) return;
    X.sky(g, W, [[0, '#23284a'], [70, '#5a4a6a'], [110, '#c97a58'], [128, '#f0a868']], H);
    X.ridge(g, W, H, 112, 14, 0.022, 1.2, '#5a5478', 104);
    X.ridge(g, W, H, 136, 9, 0.04, 2.6, '#3e4258');
    for (let x = 0; x < W; x += 6) X.pine(g, x, X.ry(x, 162, 5, 0.05, 0.3) + 8, 16 + ((x * 7) % 10), '#24362a');
    [[30, 160], [48, 166], [180, 158], [198, 164], [214, 160]].forEach(([x, y]) => X.aspen(g, x, y, 8, '#d9a444'));
    X.sky(g, W, [[180, '#6a7a48'], [240, '#56673f'], [320, '#3a4a2e']]);
    X.grass(g, W, H, 182, 2600, 4, ['#8a8a52', '#6a7c4c', '#56673f', '#9a8a56']);
    X.elk(g, 104, 250, 3, 1, { bull: true, points: 5 });
    // foreground aspen branch cutting the lane
    X.thick(g, -4, 150, 250, 236, 3, '#4a3e30'); X.thick(g, -4, 148, 250, 234, 1, '#8a7a62');
    X.thick(g, 90, 185, 120, 170, 2, '#4a3e30'); X.thick(g, 170, 211, 200, 196, 2, '#4a3e30');
    const r = X.rng(12);
    for (let i = 0; i < 90; i++) {
      const t = r(), bx = -4 + t * 254, by = 150 + t * 86 + (r() - 0.5) * 22;
      X.blob(g, bx, by, 3, 2, ['#f2c460', '#d9a444', '#b07e2e', '#7a5620']);
    }
    for (let x = 0; x < W; x += 2) { const h = 10 + ((x * 7) % 16); R(g, x, H - h, 1, h, x % 4 ? '#2a3420' : '#1f281a'); R(g, x, H - h, 1, 1, '#6a7a48'); }
    label(g, 8, 8, '34 YD · BRANCH IN LANE');
  })();

  // Ch2 — Colorado 2nd rifle: first snow, cow tag, crosshairs red on the bull
  (function () {
    const g = ctx('ch2'); if (!g) return;
    X.sky(g, W, [[0, '#6e7c8e'], [90, '#a4b0bc'], [140, '#c4ccd4']], H);
    X.ridge(g, W, H, 110, 16, 0.02, 3.1, '#7e8898', 140);
    X.ridge(g, W, H, 138, 8, 0.04, 1.2, '#5e6a78', 150);
    for (let x = 0; x < W; x += 5) { X.pine(g, x, 176 + ((x * 3) % 6), 26 + ((x * 11) % 14), '#2a3a34'); R(g, x - 2, 158 + ((x * 5) % 10), 5, 1, '#e8ecf0'); }
    X.sky(g, W, [[172, '#d8dee6'], [260, '#e8ecf2'], [320, '#c8d0da']]);
    const r = X.rng(7); for (let i = 0; i < 500; i++) R(g, r() * W, 172 + r() * 148, 1, 1, r() < 0.5 ? '#b4bcc8' : '#f4f6f8');
    X.elk(g, 60, 214, 1, 1, { cowCoat: ['#b08a60', '#8e6a44', '#6e5032', '#4a3622'] });
    X.elk(g, 88, 218, 1, -1, { headDown: true, cowCoat: ['#b08a60', '#8e6a44', '#6e5032', '#4a3622'] });
    X.elk(g, 160, 214, 1, -1, {});
    X.elk(g, 124, 222, 2, 1, { bull: true, points: 6 });
    for (let i = 0; i < 260; i++) R(g, r() * W, r() * H, 1, 1 + (r() < 0.2 ? 1 : 0), '#f4f6f8');
    reticle(g, 124, 196, 62, '#e0443a');
    label(g, 8, 8, 'TAG: ANTLERLESS', '#e3a646');
    label(g, 8, 24, 'NOT A LEGAL ANIMAL', '#e0443a');
  })();

  // Ch3 — Idaho: canyon at dawn, bunched herd in timber, wolf on the slope above, angle rangefinder
  (function () {
    const g = ctx('ch3'); if (!g) return;
    X.sky(g, W, [[0, '#1e2a40'], [60, '#4a5a70'], [96, '#b0885c']], H);
    X.ridge(g, W, H, 74, 22, 0.018, 0.9, '#5a6070', 70);
    // far canyon wall
    for (let x = 0; x < W; x++) { const y = X.ry(x, 96, 10, 0.03, 2.2); for (let yy = y; yy < 250; yy++) R(g, x, yy, 1, 1, X.dith(x, yy) < (yy - y) / 180 ? '#44503c' : '#5a6446'); }
    for (let y = 130; y < 250; y += 3) for (let x = 0; x < W; x += 3) if (Math.sin(x * 0.04 + y * 0.03) + Math.sin(x * 0.013 - y * 0.05) * 0.8 > 0.7) X.pine(g, x + (y % 2), y, 5 + ((x + y) % 3), '#1c2c22');
    for (let i = 0; i < 9; i++) { const x = 110 + (i % 4) * 5 + (i * 7 % 3), y = 186 + (i % 3) * 3; R(g, x, y, 3, 2, '#a3743f'); R(g, x, y, 1, 2, '#dcc190'); }
    X.wolf(g, 150, 150, 1, -1);
    // near slope, steep, dark rimrock
    for (let x = 0; x < W; x++) { const y = Math.round(250 - x * 0.35 + Math.sin(x * 0.1) * 4); for (let yy = y; yy < H; yy++) R(g, x, yy, 1, 1, X.dith(x, yy) < 0.4 ? '#2a2420' : '#3a322a'); R(g, x, y, 1, 1, '#6a5a48'); }
    for (let x = 4; x < 120; x += 9) X.pine(g, x, Math.round(250 - x * 0.35) + 4, 18 + ((x * 5) % 8), '#15201a');
    R(g, 150, 262, 82, 38, 'rgba(7,8,11,.86)'); R(g, 150, 262, 82, 1, '#e3a646');
    g.font = '600 15px "IBM Plex Mono", monospace'; g.fillStyle = '#e3a646'; g.fillText('412 yd', 158, 281);
    g.font = '500 10px "IBM Plex Mono", monospace'; g.fillStyle = '#9c978b'; g.fillText('−28° · shoot 364', 158, 294);
    label(g, 8, 8, 'WOLF SIGN · HERD SILENT', '#d0625a');
  })();

  // Ch4 — Montana: evening breaks, bull on the far coulee edge, pickup dust on the two-track, dial turret
  (function () {
    const g = ctx('ch4'); if (!g) return;
    X.sky(g, W, [[0, '#2a2440'], [70, '#7a4a52'], [118, '#e08a4a'], [132, '#f4b060']], H);
    X.ridge(g, W, H, 128, 8, 0.02, 1.8, '#6a4e52');
    for (let band = 0; band < 4; band++) {
      const base = 146 + band * 26, c = ['#8a6a4e', '#7a5c42', '#6a5038', '#5a442e'][band];
      for (let x = 0; x < W; x++) { const y = X.ry(x, base, 6 - band, 0.03 + band * 0.01, band * 1.7); R(g, x, y, 1, H - y, c); if (X.dith(x, y) < 0.6) R(g, x, y, 1, 1, X.shade(c, 0.25)); }
      const r = X.rng(20 + band); for (let i = 0; i < 60 + band * 40; i++) { const x = r() * W, y = base + 4 + r() * 20; X.blob(g, x, y, 1 + band * 0.5, 1 + band * 0.3, ['#9aa07a', '#7e865e', '#646a48', '#4a4e36']); }
      for (let x = 0; x < W; x += 7) if (band === 1 && Math.sin(x * 0.07) > 0.4) X.pine(g, x, X.ry(x, base, 5, 0.04, 1.7) + 12, 12, '#3a3a2a');
    }
    X.elk(g, 70, 166, 1, 1, { bull: true, points: 6 });
    // two-track + dust
    for (let x = 120; x < W; x++) R(g, x, 180 + (x - 120) * 0.12, 1, 1, '#b89a70');
    R(g, 196, 184, 10, 4, '#d8d4c8'); R(g, 198, 181, 6, 3, '#aab0b8'); R(g, 197, 188, 2, 2, '#1a1a1a'); R(g, 204, 188, 2, 2, '#1a1a1a');
    for (let i = 0; i < 40; i++) X.blob(g, 170 + i * 0.7, 184 - i * 0.2 + Math.sin(i) * 2, 3 + i * 0.08, 2 + i * 0.05, ['#e8caa0', '#d8b88c', '#c4a47a', '#b0906a']);
    reticle(g, 70, 150, 58, '#e8e0cc');
    for (let i = 1; i <= 5; i++) R(g, 69, 150 + i * 6, 3, 1, '#e8e0cc');
    label(g, 8, 8, 'DIAL 460 · WIND 8 MPH →');
    label(g, 8, 24, 'BROW-TINED BULL · CHECK', '#e3a646');
  })();

  // Ch5 — Alaska: willow flats at dusk, bull moose across the slough, raft on the gravel bar
  (function () {
    const g = ctx('ch5'); if (!g) return;
    X.sky(g, W, [[0, '#1a2238'], [80, '#4a4a68'], [128, '#c0785a'], [146, '#e8a060']], H);
    X.ridge(g, W, H, 118, 20, 0.015, 2.4, '#4a4a66', 118);
    X.ridge(g, W, H, 146, 6, 0.03, 0.5, '#2c3440');
    for (let x = 0; x < W; x += 4) X.pine(g, x, 160 + ((x * 3) % 5), 14 + ((x * 11) % 10), '#1a2620');
    for (let y = 160; y < 214; y++) for (let x = 0; x < W; x++) if (X.dith(x, y) < 0.7) R(g, x, y, 1, 1, X.mix('#6a6a3a', '#8a7a3e', (Math.sin(x * 0.15 + y * 0.3) + 1) / 2));
    X.moose(g, 130, 214, 3, -1);
    // slough with reflections
    for (let y = 214; y < 270; y++) for (let x = 0; x < W; x++) {
      const sy = 214 - (y - 214) * 1.4;
      const refl = sy > 128 && sy < 160 ? '#b0705a' : sy < 128 ? '#5a5070' : '#2c3440';
      R(g, x, y, 1, 1, X.dith(x, y) < 0.3 + ((y + (x >> 3)) % 5 === 0 ? 0.5 : 0) ? '#1e2a36' : refl);
    }
    X.sky(g, W, [[270, '#6a6458'], [320, '#4a463e']]);
    const r = X.rng(31); for (let i = 0; i < 600; i++) R(g, r() * W, 270 + r() * 50, 2, 1, r() < 0.5 ? '#8a8474' : '#3a3630');
    X.blob(g, 60, 290, 30, 9, ['#c8a830', '#a88a22', '#7a6418', '#4a3c0e']); R(g, 34, 286, 52, 2, '#e8c84a');
    R(g, 100, 280, 3, 18, '#6a4a2a'); X.thick(g, 102, 280, 96, 262, 1, '#6a4a2a');
    label(g, 8, 8, 'SPREAD 48–52" · BROWS: 3? 4?');
  })();

  // Epilogue — the fire: you in Hank's seat with his mug, Sam across with the Scout bow
  (function () {
    const g = ctx('ch6'); if (!g) return;
    X.sky(g, W, [[0, '#06080f'], [170, '#141a2a']], H);
    const r = X.rng(44); for (let i = 0; i < 120; i++) R(g, r() * W, r() * 150, 1, 1, r() < 0.25 ? '#e8e0cc' : '#6a6878');
    X.ridge(g, W, H, 150, 14, 0.02, 1.2, '#121828');
    for (let x = 0; x < W; x += 5) X.pine(g, x, 196 + ((x * 3) % 6), 26 + ((x * 7) % 14), '#0a0f12');
    R(g, 0, 196, W, 124, '#0e120e');
    for (let y = 196; y < H; y++) for (let x = 0; x < W; x++) { const d = Math.hypot(x - 120, (y - 262) * 1.6) / 90; if (d < 1 && X.dith(x, y) > d) R(g, x, y, 1, 1, d < 0.25 ? '#8a5430' : d < 0.55 ? '#5a3a22' : '#2e2217'); }
    // logs + fire
    R(g, 20, 262, 60, 8, '#4a3624'); R(g, 20, 262, 60, 2, '#7a5a3a'); R(g, 160, 262, 60, 8, '#4a3624'); R(g, 160, 262, 60, 2, '#7a5a3a');
    R(g, 104, 272, 32, 4, '#3a281a'); R(g, 108, 270, 24, 3, '#5a3e28');
    const fw = [1, 2, 2, 3, 4, 5, 6, 7, 8, 8, 9, 9, 8, 7];
    fw.forEach((w, j) => { R(g, 120 - w, 256 + j, w * 2 + 1, 1, '#d8602e'); if (w > 2) R(g, 121 - w + 1, 256 + j, (w - 1) * 2, 1, '#f2b04a'); if (w > 5) R(g, 117, 256 + j, 6, 1, '#fff0c8'); });
    // you (guide), seated left, facing right: hat, grey beard, plaid coat, mug
    const Y = (x, y, w, h, c) => R(g, 34 + x, 216 + y, w, h, c);
    Y(4, 0, 16, 2, '#3b2f22'); Y(7, -6, 10, 7, '#5a4630'); Y(7, -2, 10, 1, '#2a2016');
    Y(8, 2, 9, 8, '#c49a74'); Y(14, 2, 3, 8, '#9a7456'); Y(13, 5, 1, 1, '#1a120c');
    Y(8, 8, 10, 5, '#b8b2a6'); Y(10, 12, 6, 2, '#8a857a');
    Y(5, 14, 14, 18, '#8e3c2e'); Y(5, 14, 5, 18, '#a8483a'); Y(15, 14, 4, 18, '#6c2c22'); for (let k = 0; k < 18; k += 4) Y(5, 14 + k, 14, 1, '#c0685a');
    Y(18, 22, 8, 4, '#6c2c22'); Y(25, 20, 5, 6, '#d0d0c8'); Y(30, 21, 2, 3, '#8a8a84'); Y(26, 17, 1, 2, '#7a7e82');
    Y(6, 32, 22, 6, '#3d4d64'); Y(22, 38, 6, 8, '#3d4d64'); Y(21, 45, 9, 3, '#2a1e14');
    // Grandpa Sam, seated right, facing left: felt hat, white beard, wool shirt, old rifle across his knees
    const S = (x, y, w, h, c) => R(g, 170 + x, 222 + y, w, h, c);
    S(-1, -4, 16, 2, '#3b2f22'); S(2, -9, 10, 6, '#5a4a38'); S(2, -4, 10, 1, '#2a2016');
    S(3, -2, 9, 8, '#c49a74'); S(3, -2, 2, 8, '#9a7456'); S(5, 1, 1, 1, '#1a120c');
    S(2, 4, 10, 5, '#e4e0d8'); S(4, 8, 6, 2, '#b8b4ac');
    S(0, 10, 14, 17, '#4e5e6e'); S(10, 10, 4, 17, '#62727e'); S(0, 10, 3, 17, '#3a4854'); for (let k = 0; k < 17; k += 4) S(0, 10 + k, 14, 1, '#3a4854');
    S(-8, 27, 22, 5, '#4a4232'); S(-8, 32, 5, 8, '#4a4232'); S(-10, 39, 8, 3, '#1e150e');
    X.thick(g, 146, 250, 196, 244, 2, '#5a3e24'); X.thick(g, 146, 250, 160, 248, 1, '#2a2a2a');
    label(g, 8, 8, 'NIGHT 1 · YOUR DEBRIEF');
  })();
})();

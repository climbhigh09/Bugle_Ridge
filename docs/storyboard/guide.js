// Bugle Ridge storyboard draft 5: the guide season ("Calling for Sam") and the realism pass.
// Frames use the game's own sprites (sprites.js, animals.js, people.js), so they show what will ship.
(function () {
  const X = window.PX, R = X.R, SPR = window.BR.SPR, W = 240, H = 320;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const ctx = id => { const c = document.getElementById(id); if (!c) return null; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return g; };
  const label = (g, x, y, text, col) => {
    g.font = '600 9px "IBM Plex Mono", ui-monospace, monospace';
    const w = Math.ceil(g.measureText(text).width) + 8;
    R(g, x, y, w, 13, 'rgba(7,8,11,.84)'); R(g, x, y, 2, 13, col || '#e3a646');
    g.fillStyle = col || '#e3a646'; g.fillText(text, x + 5, y + 10);
  };
  const tag = (g, x, y, text, col) => { g.font = '600 8px "IBM Plex Mono", monospace'; g.fillStyle = col || '#ebe2cf'; g.fillText(text, x, y); };
  const elk = (g, an, pose, s, x, y, flip) => SPR.draw(g, SPR.get(an, pose, s, flip ? { flip: true } : null), x, y);
  const person = (g, who, pose, x, y, s, flip) => window.BR.person(g, who, pose, x, y, s, flip);
  const BULL = { sp: 'elk', sex: 'bull', pts: 6 }, COW = { sp: 'elk', sex: 'cow' };
  const dashed = (g, x0, y0, x1, y1, c) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let k = 0; k <= n; k++) if (k % 4 < 2) R(g, x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, 1, 1, c); };

  // September dawn timber edge, shared by the field frames
  function meadow(g, seed, dusk) {
    X.sky(g, W, dusk ? [[0, '#231f38'], [70, '#43304a'], [118, '#c8744a']] : [[0, '#2a3350'], [70, '#55536e'], [118, '#c98a5e']], H);
    X.ridge(g, W, H, 104, 12, 0.025, 1.4 + seed, '#4c4a66');
    X.ridge(g, W, H, 128, 8, 0.04, 2.2 + seed, '#33402f');
    for (let x = -2; x < W; x += 6) X.pine(g, x, X.ry(x, 156, 5, 0.06, seed) + 10, 20 + ((x * 7 + seed * 13) % 14), '#1c2c21');
    X.sky(g, W, [[160, '#5f6b3e'], [230, '#4e5c36'], [320, '#34402a']]);
    X.grass(g, W, H, 162, 2200, 3 + seed, ['#7a7e4a', '#62703f', '#4e5c36', '#8c8250']);
  }
  function timber(g, seed) {
    X.sky(g, W, [[0, '#0e1712'], [150, '#1a2a1f'], [226, '#24321f']], H);
    for (let x = -4; x < W; x += 9) X.pine(g, x, 206 + ((x * 3 + seed) % 10), 70 + ((x * 7 + seed) % 30), '#18281d');
    X.sky(g, W, [[222, '#34402a'], [320, '#222b1b']]);
    X.grass(g, W, H, 224, 1400, 9 + seed, ['#3e4a2c', '#4a4630', '#2a3420', '#5a5236']);
  }
  const trunk = (g, x, y0, y1, w) => { R(g, x, y0, w, y1 - y0, '#2a1e15'); R(g, x, y0, 1, y1 - y0, '#4a3828'); R(g, x + w - 1, y0, 1, y1 - y0, '#15100b'); };

  const FRAMES = {
    // 1. Locate: before light, a location bugle from the ridge
    g1(g) {
      X.sky(g, W, [[0, '#0b0f1c'], [90, '#1d2340'], [150, '#4a3e5c']], H);
      const r = X.rng(5); for (let i = 0; i < 70; i++) R(g, r() * W, r() * 110, 1, 1, r() < 0.3 ? '#e8e0cc' : '#7c7a8c');
      X.ridge(g, W, H, 150, 14, 0.02, 0.6, '#262a3c');
      X.ridge(g, W, H, 184, 10, 0.035, 2, '#1a2026');
      for (let x = 120; x < W; x += 7) X.pine(g, x, X.ry(x, 184, 10, 0.035, 2) + 6, 12 + ((x * 5) % 8), '#121a18');
      elk(g, BULL, 'bugle', 0.22, 196, X.ry(196, 184, 10, 0.035, 2) + 2, true);
      for (let k = 0; k < 3; k++) for (let a = -40; a <= 40; a += 6) { const t = a * Math.PI / 180; R(g, 196 - 12 - k * 6 - Math.cos(t) * (4 + k * 6), 174 + Math.sin(t) * (4 + k * 6), 1, 1, '#e3a646'); }
      // our ridge, foreground
      for (let x = 0; x < W; x++) { const y = Math.round(232 + Math.sin(x * 0.03) * 6 + x * 0.12); R(g, x, y, 1, H - y, '#0d1210'); R(g, x, y, 1, 1, '#2e3a30'); }
      person(g, 'hunter', 'bow', 60, 240, 0.95);
      person(g, 'sam', 'bow', 30, 238, 0.95);
      for (let k = 0; k < 3; k++) for (let a = -30; a <= 30; a += 6) { const t = a * Math.PI / 180; R(g, 74 + k * 7 + Math.cos(t) * (4 + k * 7), 190 + Math.sin(t) * (4 + k * 7), 1, 1, '#93a67a'); }
      label(g, 8, 8, '5:52 AM · LOCATION BUGLE');
      label(g, 8, 24, 'ANSWER · ≈400 YD · NE', '#93a67a');
      label(g, 8, 290, 'CLOSE TO 100 YD. NO MORE CALLING.', '#7fa3c4');
    },
    // 2. Setup map: the core new mechanic
    g2(g) {
      // top-down: uphill is up, 1 px ≈ 1.5 yd
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const m = Math.sin(x * 0.05) * Math.cos(y * 0.045) + Math.sin((x + y) * 0.021) * 0.6;
        R(g, x, y, 1, 1, m > 0.55 ? '#5e6e44' : m < -0.6 ? '#6a6a46' : X.dith(x, y) < 0.5 ? '#52623c' : '#4c5a37');
      }
      const r = X.rng(21), blob = (cx, cy, n, rad) => { for (let i = 0; i < n; i++) { const a = r() * 6.28, d = r() * rad, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d; X.blob(g, x, y, 4, 4, ['#3c5a3a', '#2c4a2e', '#1e3622', '#122216']); } };
      blob(40, 60, 26, 30); blob(200, 40, 18, 26); blob(52, 190, 22, 26); blob(196, 214, 14, 18); blob(170, 150, 6, 8); blob(132, 262, 10, 14);
      // a draw (low line) the caller hides in
      for (let x = 60; x < 220; x++) { const y = Math.round(250 + Math.sin(x * 0.05) * 6); R(g, x, y, 1, 3, '#3a4428'); R(g, x, y - 1, 1, 1, '#76804e'); }
      // wind from the west → scent drifts east
      R(g, 186, 278, 46, 30, 'rgba(7,8,11,.82)'); for (let x = 194; x < 222; x++) R(g, x, 296, 1, 1, '#86b36f'); R(g, 219, 294, 3, 5, '#86b36f'); tag(g, 192, 289, 'WIND W', '#86b36f');
      // bull's last spot and his downwind swing
      const B = [104, 70], S = [150, 160], C = [118, 246];
      R(g, B[0] - 4, B[1] - 2, 8, 4, '#a3743f'); R(g, B[0] + 3, B[1] - 4, 2, 3, '#4d3423'); R(g, B[0] + 3, B[1] - 7, 1, 3, '#ddd0b3'); R(g, B[0] + 5, B[1] - 7, 1, 3, '#ddd0b3');
      tag(g, B[0] - 22, B[1] - 10, 'BULL', '#e3a646');
      // Sam: in front of the tree, 35-yd ring
      for (let a = 0; a < 360; a += 5) { const t = a * Math.PI / 180; R(g, S[0] + Math.cos(t) * 23, S[1] + Math.sin(t) * 23, 1, 1, 'rgba(235,226,207,.7)'); }
      [[-20, -30], [10, -34], [24, -6]].forEach(([dx, dy]) => dashed(g, S[0], S[1], S[0] + dx, S[1] + dy, '#ebe2cf'));
      R(g, S[0] - 3, S[1] - 3, 7, 7, '#07080b'); R(g, S[0] - 2, S[1] - 2, 5, 5, '#ebe2cf'); tag(g, S[0] + 8, S[1] + 14, 'SAM', '#ebe2cf');
      R(g, C[0] - 3, C[1] - 3, 7, 7, '#07080b'); R(g, C[0] - 2, C[1] - 2, 5, 5, '#e3a646'); tag(g, C[0] - 30, C[1] + 3, 'YOU', '#e3a646');
      dashed(g, S[0], S[1] + 4, C[0] + 2, C[1] - 4, '#9c978b'); tag(g, 140, 210, '60 YD', '#9c978b');
      label(g, 8, 8, 'PLACE SAM, THEN YOURSELF');
      R(g, 6, 284, 170, 30, 'rgba(7,8,11,.84)');
      tag(g, 12, 296, 'ONLY THE WIND IS SHOWN.', '#93a67a'); tag(g, 12, 307, 'READ HIS SWING YOURSELF.', '#93a67a');
    },
    // 3. Calling: the bull comes to your sound and walks past Sam
    g3(g) {
      timber(g, 2);
      trunk(g, 104, 60, 262, 6); X.pine(g, 107, 262, 150, '#132219');
      elk(g, BULL, 'walk', 0.62, 196, 248, true);
      person(g, 'sam', 'bow', 92, 266, 1.0, false);
      person(g, 'hunter', 'bow', 22, 270, 0.85, false);
      for (let k = 0; k < 3; k++) for (let a = -30; a <= 30; a += 8) { const t = a * Math.PI / 180; R(g, 32 + k * 6 + Math.cos(t) * (3 + k * 6), 214 + Math.sin(t) * (3 + k * 6), 1, 1, '#e3a646'); }
      R(g, 0, 282, W, 38, 'rgba(7,8,11,.86)');
      R(g, 22, 292, 1, 7, '#e3a646'); R(g, 92, 292, 1, 7, '#ebe2cf'); R(g, 196, 292, 1, 7, '#c28d58');
      for (let x = 22; x < 196; x += 2) R(g, x, 295, 1, 1, '#4a4f5a');
      tag(g, 14, 310, 'YOU', '#e3a646'); tag(g, 46, 291, '60 YD', '#9c978b'); tag(g, 84, 310, 'SAM', '#ebe2cf'); tag(g, 132, 291, '40 YD', '#9c978b'); tag(g, 184, 310, 'BULL', '#c28d58');
      label(g, 8, 8, 'COW MEW · BEHIND SAM');
      label(g, 8, 24, 'HE COMES TO THE SOUND, NOT TO SAM', '#93a67a');
    },
    // 4. The hang-up
    g4(g) {
      meadow(g, 1);
      X.pine(g, 150, 208, 70, '#1c2c21'); X.pine(g, 172, 212, 60, '#16241a');
      elk(g, BULL, 'alert', 0.5, 160, 206, true);
      for (let i = 0; i < 40; i++) X.blob(g, 120 + (i * 37) % 90, 196 + (i * 13) % 18, 3, 2, ['#3e5a30', '#2e4a26', '#20361c', '#14240f']);
      person(g, 'sam', 'bow', 70, 278, 1.05, false);
      label(g, 8, 8, 'HUNG UP · 80 YD');
      label(g, 8, 24, 'HE CAN’T SEE A COW', '#d0625a');
      R(g, 6, 284, 228, 30, 'rgba(7,8,11,.86)');
      tag(g, 12, 297, 'BACK OFF CALLING', '#e3a646'); tag(g, 112, 297, 'GO SILENT 20 MIN', '#e3a646'); tag(g, 12, 309, 'SLIP CLOSER', '#e3a646'); tag(g, 112, 309, 'RAKE A TREE', '#e3a646');
    },
    // 5. Draw timing: head behind the tree
    g5(g) {
      timber(g, 4);
      const spr = SPR.get(BULL, 'walk', 0.95, { flip: true }), at = SPR.draw(g, spr, 176, 262);
      const hx = at.dx + spr.x0;  // facing left: the head is the sprite's left edge
      trunk(g, hx - 4, 0, 266, 22);
      person(g, 'sam', 'draw', 52, 290, 1.35, false);
      label(g, 8, 8, 'HIS EYES ARE BEHIND THE TREE');
      label(g, 8, 24, 'SIGNAL: DRAW NOW', '#93a67a');
      label(g, 8, 296, 'SAM CAN HOLD ≈30 S. SHAKY PAST 20.', '#7fa3c4');
    },
    // 6. Cow parade: cows first, don't draw
    g6(g) {
      meadow(g, 3);
      elk(g, BULL, 'walk', 0.55, 204, 214, true);
      elk(g, COW, 'walk', 1.05, 150, 268, true);
      elk(g, COW, 'walk', 0.85, 76, 244, true);
      person(g, 'sam', 'bow', 30, 300, 1.15, false);
      label(g, 8, 8, 'COWS AT 20 YD · BULL AT 45');
      label(g, 8, 24, 'DRAW NOW AND A COW SEES IT', '#d0625a');
    },
    // 7. The shot is Sam's: over his shoulder, stopped broadside
    g7(g) {
      meadow(g, 5);
      elk(g, BULL, 'stand', 0.95, 160, 250, false);
      person(g, 'sam', 'draw', 46, 345, 2.4, false);
      label(g, 8, 8, 'MEW · HE STOPS · 28 YD');
      label(g, 8, 24, 'SAM SHOOTS. YOU WATCH THE HIT.', '#93a67a');
    },
    // 8. After the shot
    g8(g) {
      meadow(g, 7, true);
      elk(g, BULL, 'walk', 0.42, 190, 196, true);
      const r = X.rng(8); for (let i = 0; i < 14; i++) R(g, 60 + i * 9 + r() * 4, 262 - i * 3.5 + r() * 4, 2, 1, '#b7413c');
      person(g, 'sam', 'bow', 36, 292, 1.0, false);
      person(g, 'hunter', 'bow', 70, 294, 1.0, false);
      label(g, 8, 8, 'HUNCHED, UPHILL, SLOW');
      label(g, 8, 24, 'LIVER? WAIT 4 HOURS', '#e3a646');
      R(g, 140, 276, 92, 38, 'rgba(7,8,11,.86)');
      tag(g, 146, 289, 'LUNGS   30 MIN', '#93a67a'); tag(g, 146, 299, 'LIVER   4 H', '#e3a646'); tag(g, 146, 309, 'GUT     6 H+', '#d0625a');
    },
    // 9. The fire: two hunters coach each other
    g9(g) {
      X.sky(g, W, [[0, '#060910'], [200, '#141a2a']], H);
      const r = X.rng(9); for (let i = 0; i < 90; i++) R(g, r() * W, r() * 170, 1, 1, r() < 0.3 ? '#e8e0cc' : '#6c6a7c');
      X.ridge(g, W, H, 176, 12, 0.025, 1, '#101622');
      for (let x = -2; x < W; x += 10) X.pine(g, x, 232, 26 + ((x * 13) % 12), '#0a0f13');
      X.sky(g, W, [[232, '#101610'], [320, '#070908']]);
      for (let y = 236; y < H; y++) for (let x = 60; x < 220; x++) { const d = Math.hypot(x - 140, (y - 284) * 1.7) / 70; if (d < 1 && X.dith(x, y) > d) R(g, x, y, 1, 1, d < 0.3 ? '#74482a' : d < 0.6 ? '#4a321f' : '#2b2117'); }
      R(g, 128, 286, 25, 4, '#4a3322'); const fl = [1, 1, 2, 2, 3, 4, 4, 5, 5, 5, 4];
      fl.forEach((w, j) => { R(g, 140 - w, 274 + j, w * 2 + 1, 1, '#d8602e'); if (w > 1) R(g, 141 - w, 274 + j, w * 2 - 1, 1, '#f2b04a'); });
      person(g, 'sam', 'sit', 80, 296, 1.35, false);
      person(g, 'hunter', 'sit', 196, 298, 1.35, true);
      label(g, 8, 8, 'WHAT DOES SAM NEED TO HEAR?');
      label(g, 8, 24, 'SAM: “YOU CALLED TOO MUCH.”', '#c28d58');
    }
  };

  const BEATS = [
    ['g1', 'Locate', 'Before light, you blow one location bugle from the ridge. A bull answers. You close to about 100 yards of him without calling again.', 'Bugling every hundred yards on the way in is how hunters bump bulls.'],
    ['g2', 'Set up', 'A top-down map: the bull’s last spot, the wind, the cover. Tap where Sam sits, then where you call from.', 'Only the wind is shown. Get it right: Sam 40–80 yd ahead of you, on the side the bull swings to, in front of cover, with lanes inside 35 yd. Sam tells you at the fire what you got wrong.'],
    ['g3', 'Call', 'You call from behind Sam. The bull walks to your sound, so his path crosses Sam’s lanes if you placed Sam right.', 'Cow mew, estrus whine, location or challenge bugle, rake, go silent, back away calling.'],
    ['g4', 'The hang-up', 'He stops at 80 yards because he can’t see a cow where the sound is.', 'Back away while calling and pull him through Sam’s lane, go quiet for 20 minutes, slip closer, or rake.'],
    ['g5', 'Draw timing', 'You signal the draw. Signal it while his eyes are behind a tree.', 'Signal while he’s looking and he busts. Signal too early and Sam shakes past 20 seconds, then lets down at 30.'],
    ['g6', 'Cow parade', 'The cows come first and walk past Sam at 20 yards. The bull hangs back at 45.', 'Any draw now gets seen. Wait for the bull.'],
    ['g7', 'Sam’s shot', 'The shot is Sam’s, seen over his shoulder. You mew to stop the bull and Sam releases.', 'Range, angle, stopped or walking, Sam’s nerves and Sam’s skill decide the hit. A walking bull gets hit back.'],
    ['g8', 'After the shot', 'How the bull ran tells you about the hit. You decide how long to wait.', 'Lungs: 30 minutes. Liver: 4 hours. Gut: 6 or more. Push him early and you may not find him.'],
    ['g9', 'The fire', 'You pick the one thing Sam needs to hear. Then Sam tells you what you did wrong.', 'The right lesson makes Sam steadier tomorrow. His note on your calling shows up on the setup map the next day.']
  ];

  const SAM = [
    ['Range', '35 yards with his old recurve. He passes on anything farther, and says so.'],
    ['Legs', 'About 3 miles a day. A long walk today means a short one tomorrow.'],
    ['Nerves', 'Climb as a bull closes. A bugling bull shakes him more than a quiet cow.'],
    ['Hold', 'About 30 seconds at full draw. Past 20 he starts to shake.'],
    ['Skill', 'Every right lesson at the fire steadies him. A wrong one doesn’t.'],
    ['Eyes', 'Good. He spots blood you’d walk past, and he never shoots something illegal.']
  ];

  const DAYS = [
    ['Day 1', 'Sam’s recurve leans on the truck. “Hank built the string. Don’t tell anybody it’s older than you.”'],
    ['Day 2', 'Peak rut. Bulls answer from everywhere. The lesson is restraint: one bull, one setup.'],
    ['Day 3', 'At lunch Sam tells about the time Hank called a bull straight to him and then sneezed.'],
    ['Day 4', 'Pressure arrives. A guy with a bugle tube is working your bull from the next ridge.'],
    ['Day 5', 'Sam’s legs give out by ten. The evening hunt has to be close to the truck.'],
    ['Day 6', 'The bulls go quiet. Silent bulls, long waits, and setups that only pay off if you sit 30 minutes after the last call.'],
    ['Day 7', 'Last light at the fire with Hank’s mug, tag filled or not. Sam doesn’t say much.']
  ];

  const FAILS = [
    ['Sam placed behind you, or past the bull', 'The bull walks to you, never through Sam’s lanes. The debrief shows his real path on the map.'],
    ['Sam upwind of the swing', 'The bull circles downwind, smells you both, and leaves.'],
    ['Draw while he’s looking', 'Busted. The bull barks and leaves. You can bark back to stop him for a few seconds.'],
    ['Draw too early', 'Sam shakes, then lets down. The bull hears the arrow rattle or just keeps walking.'],
    ['Overcalling', 'A bull that hangs up while you keep calling figures it out. He fades away.'],
    ['Pushed a liver hit', 'He beds, then gets up and leaves. You lose the next day looking for him, the same as in the main game.'],
    ['Sam’s legs', 'Pick the far basin twice in a row and Sam’s done by mid-morning the next day.'],
    ['Every exit', 'Back and Menu on every screen. Leaving a setup ends that hunt, as it does now.']
  ];

  const REAL = [
    ['R1', 'Calling', 'Silent bull', 'A bull answers once, goes quiet, and walks in 20–30 minutes later from downwind. Leaving early can mean he shows up after you’re gone.', 'Eastmans, GoHunt', 'https://blog.eastmans.com/calling-mature-bulls-in-september/'],
    ['R2', 'Calling', 'Back away while calling', 'Fixes a hang-up when you’re alone too: your calls move away from him and pull him forward.', 'MeatEater', 'https://www.themeateater.com/hunt/elk/what-you-need-to-know-about-elk-hunting'],
    ['R3', 'Calling', 'Location vs. challenge bugle', 'A short location bugle finds bulls. A challenge bugle close in can bring a satellite running, or make a herd bull gather his cows and leave.', 'RMEF, MeatEater', 'https://www.rmef.org/media/how-to-master-elk-bugles/'],
    ['R4', 'Calling', 'Sound like elk', 'Long raking and stick-breaking help. Estrus whines more than twice in a few minutes make him suspicious.', 'MeatEater (Phelps), RMEF', 'https://www.themeateater.com/hunt/big-game/youre-being-too-quiet-in-the-elk-woods'],
    ['R5', 'Shot', 'Mew to stop him', 'A soft cow mew stops a walking bull for the shot. Shooting a walking bull puts the hit back.', 'Mossy Oak', 'https://www.mossyoak.com/our-obsession/blogs/elk/elk-hunting-with-a-caller-cameraman-and-shooter'],
    ['R6', 'Shot', 'Draw behind cover', 'Draw only when his eyes are behind a tree or he looks away. Hold too long and you shake.', 'Elk101, Montana Outdoor', 'https://www.elk101.com/2016/08/the-1-elk-hunting-mistake/'],
    ['R7', 'Rut', 'Real rut calendar', 'Each day shows its date and rut phase: pre-rut in early September, peak Sept 17–27, post-rut in October. Unbred cows come back in season in early October, so some bulls answer late.', 'Eastmans, MeatEater', 'https://www.themeateater.com/hunt/general/why-you-should-still-carry-elk-calls-after-the-rut'],
    ['R8', 'Wind', 'Four thermal phases', 'Air drains downhill at dawn, rises from mid-morning, swirls in mid-afternoon, and drains again at dusk.', 'MeatEater, GoHunt', 'https://www.themeateater.com/hunt/big-game/spot-and-stalk-techniques-for-big-game'],
    ['R9', 'Glassing', 'Wait for him to stand', 'Elk you lose for 30 minutes are probably bedded. You stalk to where he’ll stand up, and “wait for him to stand” becomes a choice.', 'MeatEater', 'https://www.themeateater.com/hunt/big-game/spot-and-stalk-techniques-for-big-game'],
    ['R10', 'Recovery', 'Real wait times and hit signs', 'Lungs about 30 minutes, liver 4 hours, gut 6 or more. The bull’s reaction hints at the hit, and wounded elk tend to go uphill.', 'MeatEater, RMEF', 'https://www.themeateater.com/hunt/big-game/how-to-blood-trail-and-track-game-animals'],
    ['R11', 'Meat', 'Loads and trips', 'A boned bull is 3–5 loads of 50–70 lb. In grizzly country you hang meat about 200 yards from the carcass and come back to it upwind.', 'MeatEater', 'https://www.themeateater.com/hunt/big-game/how-to-make-your-backcountry-packout-easier'],
    ['R12', 'Bears', 'Calling draws bears', 'In Montana, elk calls can bring a grizzly instead of a bull. Bear spray into a headwind blows back on you.', 'MeatEater', 'https://www.themeateater.com/conservation/wildlife-management/elk-hunter-attacked-by-grizzly-latest-in-growing-bear-problem'],
    ['R13', 'Pressure', 'Interrupted setups', 'A side-by-side drives through the clearing, or another hunter walks in on your bull.', 'MeatEater', 'https://www.themeateater.com/hunt/elk/31-day-elk-hunt-part-2-bad-luck-and-good-buddies']
  ];

  const $ = id => document.getElementById(id);
  if ($('beats5')) $('beats5').innerHTML = BEATS.map(([id, h, what, rule], i) => `
    <article class="gbeat">
      <canvas id="${id}" width="240" height="320" aria-label="${esc(h)}: ${esc(what)}"></canvas>
      <div class="gtext"><span class="gnum">${i + 1}</span><h3>${esc(h)}</h3><p>${esc(what)}</p><p class="rule">${esc(rule)}</p></div>
    </article>`).join('');
  if ($('sam5')) $('sam5').innerHTML = SAM.map(([k, v]) => `<div><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('');
  if ($('days5')) $('days5').innerHTML = DAYS.map(([d, t]) => `<li><b>${esc(d)}</b><span>${esc(t)}</span></li>`).join('');
  if ($('fails5')) $('fails5').innerHTML = FAILS.map(([k, v]) => `<div><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('');
  if ($('real5')) $('real5').innerHTML = `<thead><tr><th>#</th><th>Change</th><th>Where</th><th>Source</th></tr></thead><tbody>` +
    REAL.map(([n, area, h, d, src, url]) => `<tr><td class="rid">${n}</td><td class="dial">${esc(h)}<small>${esc(d)}</small></td><td><span class="note">${esc(area)}</span></td><td><a href="${url}" target="_blank" rel="noopener">${esc(src)}</a></td></tr>`).join('') + '</tbody>';

  const draw = () => Object.entries(FRAMES).forEach(([id, f]) => { const g = ctx(id); if (g) { try { f(g); } catch (e) { console.error(id, e); } } });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw); else draw();
})();

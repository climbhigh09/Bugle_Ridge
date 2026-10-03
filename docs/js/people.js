// Bugle Ridge — people for BR.SPR, built like the animals: anatomy in inches, rasterised, lit from the upper left.
// Hank and Sam sit on a log with a mug. The hunter sits at the fire, stands with a bow or a slung rifle (blaze orange
// in rifle season), or in native mode crouches in a loincloth with a knife.
(function () {
  const BR = window.BR, A = BR.SPR, { tube, ell } = A;

  A.addPal({
    skin: { g: 'b', r: ['#e2b28c', '#c29272', '#98694e', '#66402e'] },
    skinFar: { g: 'b', r: ['#b88a68', '#9a6e52', '#76503a', '#4c3224'] },
    weathered: { g: 'b', r: ['#d8a27a', '#b47e5a', '#885a40', '#5a3a28'] },
    white: { g: 'b', r: ['#f4f0e6', '#dcd6c8', '#b0aa9a', '#7c766a'] },
    grey: { g: 'b', r: ['#bcb8b0', '#9a968e', '#76726c', '#4e4c48'] },
    hairDark: { g: 'b', r: ['#5e4632', '#443022', '#2e2016', '#1a120c'] },
    beard: { g: 'b', r: ['#9a7656', '#7a5a40', '#5a422e', '#3a2a1c'] },
    felt: { g: 'b', r: ['#8c6c4c', '#6c5238', '#503a28', '#302218'] },
    band: { g: 'b', r: ['#3a2a1e', '#2e2016', '#22170f', '#150e09'] },
    plaid: { g: 'b', r: ['#c85442', '#a44232', '#7e3026', '#501e18'] },
    plaidLine: { g: 'b', r: ['#5a2c26', '#44201c', '#301614', '#1e0c0c'] },
    jeans: { g: 'b', r: ['#687ea0', '#506686', '#3a4c66', '#263444'] },
    jeansFar: { g: 'b', r: ['#4e6484', '#3a4c66', '#2a384a', '#1a2430'] },
    boot: { g: 'b', r: ['#7a583c', '#5c402a', '#422e1c', '#281a10'] },
    log: { g: 'b', r: ['#866c52', '#68523a', '#4c3c2a', '#2e2419'] },
    logEnd: { g: 'x', r: ['#b99b6d'] },
    mug: { g: 'b', r: ['#6e8eac', '#527292', '#3c5672', '#28394e'], fur: '#e2eaf0' },
    camo: { g: 'b', r: ['#8c8862', '#706d4c', '#56543a', '#383726'], fur: '#aaa67e' },
    camoFar: { g: 'b', r: ['#6c6a4a', '#545238', '#3e3c29', '#28271a'] },
    camoDark: { g: 'b', r: ['#524e36', '#3e3c2a', '#2e2c1f', '#1d1c13'] },
    cap: { g: 'b', r: ['#6e6a52', '#565240', '#403e30', '#2a281f'] },
    blaze: { g: 'b', r: ['#ff8c3c', '#f06c20', '#c45014', '#88360c'] },
    canvasCoat: { g: 'b', r: ['#c6a66e', '#a68854', '#80683e', '#56442a'] },
    canvasFar: { g: 'b', r: ['#a08250', '#7c643a', '#5c4a2c', '#3c301c'] },
    wool: { g: 'b', r: ['#706e66', '#5a5850', '#44423e', '#2e2d2a'] },
    woolFar: { g: 'b', r: ['#56544e', '#44423e', '#32312e', '#21201e'] },
    hide: { g: 'b', r: ['#c4a272', '#a48256', '#80623e', '#544028'] },
    pack: { g: 'b', r: ['#6c6a4e', '#54523c', '#3e3c2c', '#28271c'] },
    blade: { g: 'a', r: ['#f4f7f9', '#cad0d5', '#9099a0', '#5c646a'] },
    grip: { g: 'a', r: ['#e4d6b6', '#beaa86', '#907e5e', '#605242'] },
    bowLimb: { g: 'a', r: ['#6c6c5a', '#4c4c3e', '#36362c', '#20201a'] },
    stock: { g: 'a', r: ['#8c6642', '#6c4e32', '#4e3822', '#302216'] },
    steel: { g: 'a', r: ['#707478', '#4a4d50', '#323436', '#1c1d1e'] },
    string: { g: 'x', r: ['#d2c9b0'] },
    phone: { g: 'x', r: ['#141618'] },
    glow: { g: 'x', r: ['#9fd0e8'] },
    lens: { g: 'x', r: ['#8e9496'] },
    lip: { g: 'x', r: ['#6e4032'] },
    samCap: { g: 'b', r: ['#a8645a', '#884c42', '#683830', '#44241e'] },
    shaft: { g: 'x', r: ['#c9b48c'] }
  });

  const poly = (g, pts) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
  // fill a shape, then keep only a pattern inside it (plaid lines, camo blotches, a vest)
  const inside = (shape, pattern) => g => { shape(g); g.globalCompositeOperation = 'source-in'; pattern(g); };
  const plaid = g => { for (let x = -40; x < 50; x += 4.6) g.fillRect(x, -100, 1.3, 110); for (let y = -100; y < 10; y += 4.6) g.fillRect(-40, y, 90, 1.3); };
  const BLOTS = [[-6, -60, 3.5, 2], [3, -54, 4, 2.2], [-3, -46, 3, 2.5], [6, -41, 3.5, 1.8], [-5, -34, 4, 2], [4, -27, 3, 2.4], [-2, -20, 3.6, 1.8],
    [12, -30, 3, 2], [16, -22, 3.4, 1.6], [10, -12, 2.6, 2.2], [1, -7, 3, 1.6], [-8, -14, 2.8, 2], [14, -48, 2.8, 1.8], [-10, -52, 3, 2]];
  const camo = g => BLOTS.forEach(([x, y, rx, ry]) => { ell(g, x, y, rx, ry); ell(g, x + rx * 0.9, y + ry * 0.6, rx * 0.6, ry * 0.8); });
  const dome = (g, x, y, rx, ry) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, Math.PI, 0); g.closePath(); g.fill(); };
  const boot = (g, x) => poly(g, [[x - 3.2, -5.5], [x + 2.4, -5.5], [x + 6.6, -2.4], [x + 6.8, 0], [x - 3.4, 0]]);

  // ---------------- faces (head centre hx, hy; facing right) ----------------
  function face(add, hx, hy, who) {
    const skin = who === 'hank' ? 'weathered' : 'skin';
    add(skin, g => { ell(g, hx, hy, 4.3, 5); ell(g, hx + 4.3, hy + 0.9, 1.2, 1.3); ell(g, hx + 2.2, hy + 3.8, 2.4, 1.8); });
    add('skinFar', g => ell(g, hx - 0.8, hy + 0.3, 1.1, 1.6));
    if (who === 'hank') {
      add('white', g => { ell(g, hx - 3.2, hy - 0.8, 1.7, 3); poly(g, [[hx - 1.8, hy + 0.8], [hx + 1.6, hy + 1.6], [hx + 5, hy + 1.8], [hx + 4.8, hy + 4.8], [hx + 2.6, hy + 7.8], [hx - 0.6, hy + 6.8], [hx - 2.6, hy + 3]]); });
      add('lip', g => g.fillRect(hx + 3, hy + 2.6, 1.8, 0.6), 60);
      add('felt', g => { ell(g, hx + 0.6, hy - 4.2, 8.2, 1.5); poly(g, [[hx - 3.8, hy - 4.4], [hx - 3.3, hy - 9], [hx - 1, hy - 10.2], [hx + 0.9, hy - 9.3], [hx + 2.9, hy - 10.2], [hx + 4.9, hy - 9], [hx + 5.3, hy - 4.4]]); });
      add('band', g => g.fillRect(hx - 3.7, hy - 6.4, 9, 1.4));
    } else if (who === 'sam') {
      add('grey', g => { ell(g, hx - 3.3, hy - 0.2, 1.6, 2.6); ell(g, hx + 3.6, hy + 2.2, 1.9, 0.8); poly(g, [[hx - 1.5, hy + 2], [hx + 4.4, hy + 3], [hx + 3.4, hy + 5.8], [hx - 0.5, hy + 5.4]]); });
      add('samCap', g => { dome(g, hx - 0.3, hy - 3.2, 4.6, 3.6); g.fillRect(hx - 4.8, hy - 4.2, 9.2, 1.6); });
      add('lens', g => g.fillRect(hx + 1.6, hy - 1.5, 2.6, 0.45), 60);
    } else {
      add('hairDark', g => ell(g, hx - 3, hy - 0.6, 1.6, 2.6));
      add('beard', g => poly(g, [[hx - 1.2, hy + 2.8], [hx + 1.4, hy + 3.4], [hx + 4.4, hy + 3.4], [hx + 3.8, hy + 5], [hx + 1.6, hy + 6.2], [hx - 1.2, hy + 4.8]]));
      add('lip', g => g.fillRect(hx + 3.2, hy + 2.8, 1.6, 0.6), 60);
    }
    add('eye', g => ell(g, hx + 2.5, hy - 0.8, 0.65, 0.65), 60);
  }
  function hunterHat(add, hx, hy, blaze) {
    add(blaze ? 'blaze' : 'cap', g => { dome(g, hx - 0.4, hy - 2.9, 4.7, 3.6); poly(g, [[hx + 3, hy - 3.9], [hx + 8.6, hy - 3.4], [hx + 8.6, hy - 2.5], [hx + 3.4, hy - 2.7]]); });
  }

  // ---------------- seated on a log: Hank, Sam, the hunter ----------------
  const DRESS = {
    hank: { coat: 'plaid', far: 'plaid', line: 'plaidLine', legs: 'jeans', legsFar: 'jeansFar', lean: 1, mug: true },
    sam: { coat: 'canvasCoat', far: 'canvasFar', legs: 'wool', legsFar: 'woolFar', lean: 3.2, mug: true },
    hunter: { coat: 'camo', far: 'camoFar', blots: 'camoDark', legs: 'camo', legsFar: 'camoFar', lean: 0.5 }
  };
  function seated(who, pose) {
    const parts = [], add = (c, d, t) => parts.push({ c, d, t }), D = DRESS[who], L = D.lean;
    const sx = 4 + L, sy = who === 'sam' ? -36.5 : -38, hx = 8 + L * 1.3, hy = sy - 10.5;
    add('log', g => tube(g, [[-16, -6.5, 6.5], [13, -6.5, 6.5]]));
    add('logEnd', g => ell(g, 13.4, -6.5, 2, 5.6), 90);
    add('band', g => { g.fillRect(-12, -9, 7, 0.7); g.fillRect(-2, -4.5, 9, 0.7); }, 60);
    // far leg and far arm, then the body
    add(D.legsFar, g => tube(g, [[0, -18, 4.2], [13, -20, 3.8], [15, -5, 2.5]]));
    add('boot', g => boot(g, 15));
    const phone = pose === 'phone', near = phone ? [[sx + 1, -36, 3], [13, -33, 2.6], [hx + 0.6, hy + 2.2, 2.2]]
      : D.mug ? [[sx + 0.5, sy + 1, 3], [9 + L * 0.5, -28, 2.6], [15, -27, 2.3]] : [[sx + 0.5, sy + 1, 3], [11, -28, 2.6], [17, -21, 2.2]];
    const farArm = [[sx - 1, sy + 1, 2.8], [10, -27, 2.4], [who === 'hunter' && !phone ? 17 : 14, who === 'hunter' && !phone ? -22 : -21, 2.1]];
    add(D.far, g => tube(g, farArm));
    add('skinFar', g => ell(g, farArm[2][0] + 0.8, farArm[2][1] + 0.4, 1.9, 1.7));
    const torso = g => tube(g, [[0, -19, 7.2], [1.5 + L * 0.6, -29, 7.6], [sx, sy, 7]]);
    const legNear = g => tube(g, [[1, -16.5, 4.6], [16, -18, 4.1], [18.5, -5, 2.8]]);
    const armNear = g => tube(g, near);
    add(D.coat, torso);
    add(D.legs, legNear);
    if (D.line) { add(D.line, inside(torso, plaid)); add(D.line, inside(g => tube(g, farArm), plaid)); }
    if (D.blots) { add(D.blots, inside(torso, camo)); add(D.blots, inside(legNear, camo)); }
    add('boot', g => boot(g, 18.5));
    add('skin', g => tube(g, [[sx + 1, sy - 3, 2.5], [hx - 1.5, hy + 4.5, 2.5]]));
    face(add, hx, hy, who);
    if (who === 'hunter') hunterHat(add, hx, hy, false);
    if (phone) add('phone', g => { g.save(); g.translate(hx - 0.6, hy + 0.6); g.rotate(0.35); g.fillRect(-1.2, -3.4, 2.4, 6.6); g.restore(); }, 60);
    add(D.coat, armNear);
    if (D.line) add(D.line, inside(armNear, plaid));
    if (D.blots) add(D.blots, inside(armNear, camo));
    const hand = near[2];
    add('skin', g => ell(g, hand[0] + (phone ? 0 : 1), hand[1] - (phone ? 0 : 0.5), 2, 1.9));
    if (D.mug && !phone) {
      add('mug', g => { g.fillRect(15.4, -33.6, 4.8, 6.6); ell(g, 17.8, -27, 2.4, 0.8); });
      add('band', g => ell(g, 17.8, -33.6, 2.4, 0.7), 60);
    }
    if (phone) add('glow', g => g.fillRect(hx - 2.2, hy - 2.4, 0.6, 4), 60);
    return parts;
  }

  // ---------------- standing hunter: bow, or rifle on the sling in blaze orange ----------------
  // who: 'hunter' (camo, pack) or 'sam' (canvas coat, wool pants, his old recurve). pose: bow, rifle, or draw (at full draw, facing right)
  const STAND = { hunter: { coat: 'camo', far: 'camoFar', blots: 'camoDark' }, sam: { coat: 'canvasCoat', far: 'canvasFar', legs: 'wool', legsFar: 'woolFar' } };
  function standing(pose, who) {
    who = STAND[who] ? who : 'hunter';
    const parts = [], add = (c, d, t) => parts.push({ c, d, t }), rifle = pose === 'rifle', draw = pose === 'draw', hx = 4.5, hy = -68.5, D = STAND[who];
    if (draw) return drawn(who, D, add, parts, hx, hy);
    if (!rifle && who === 'hunter') add('pack', g => { tube(g, [[-7.5, -58, 3.6], [-8.6, -45, 4.2]]); });
    if (rifle) {
      add('stock', g => poly(g, [[-8, -38], [-3.8, -38], [-2.4, -51], [-3.4, -57], [-6.4, -57], [-6.2, -48]]));
      add('steel', g => { tube(g, [[-3.6, -56, 1], [-1.6, -88, 0.6]]); tube(g, [[-6.4, -60, 1.3], [-5.2, -73, 1.2]]); ell(g, -6.5, -59.5, 1.7, 1.2); ell(g, -5.1, -73.5, 1.5, 1.1); });
    }
    const farArm = rifle ? [[1, -57, 2.9], [-1, -47, 2.5], [0, -38, 2.2]] : [[1, -57, 2.9], [8, -50, 2.5], [14, -46, 2.2]];
    add(D.legsFar || D.far, g => tube(g, [[-1, -37, 4.6], [-3, -20, 3.6], [-5.5, -4.5, 2.7]]));
    add('boot', g => boot(g, -5.5));
    add(D.far, g => tube(g, farArm));
    add('skinFar', g => ell(g, farArm[2][0] + 0.4, farArm[2][1] + 0.4, 2, 1.9));
    const torso = g => tube(g, [[0, -37, 7], [0.6, -48, 7.6], [1.6, -58, 7.2]]);
    const legNear = g => tube(g, [[1, -37, 4.8], [3, -20, 3.8], [4, -4.5, 2.9]]);
    const armNear = rifle ? [[2, -57, 3.1], [7, -48, 2.7], [4, -56, 2.3]] : [[2, -57, 3.1], [3, -47, 2.7], [7, -40, 2.4]];
    add(D.coat, torso);
    add(D.legs || D.coat, legNear);
    if (D.blots) { add(D.blots, inside(torso, camo)); add(D.blots, inside(legNear, camo)); }
    if (rifle) add('blaze', inside(torso, g => g.fillRect(-12, -61, 24, 22)));
    add('boot', g => boot(g, 4));
    if (rifle) add('band', g => tube(g, [[3.6, -59, 0.6], [-1.5, -49, 0.6], [-6, -41, 0.6]]));
    add('skin', g => tube(g, [[2.5, -61, 2.5], [hx - 1.6, hy + 4.4, 2.5]]));
    face(add, hx, hy, who);
    if (who === 'hunter') hunterHat(add, hx, hy, rifle);
    if (!rifle) {
      add('bowLimb', g => { tube(g, [[15, -51, 1.3], [15, -41, 1.3]]); tube(g, [[15, -51, 0.9], [14, -59, 0.8], [12.2, -66, 0.6]]); tube(g, [[15, -41, 0.9], [14, -33, 0.8], [12.2, -26, 0.6]]); ell(g, 12, -66.4, 1.3, 1.3); ell(g, 12, -25.6, 1.3, 1.3); });
      add('string', g => tube(g, [[11, -66, 0.4], [11, -26, 0.4]]), 50);
      add('skinFar', g => ell(g, 15.2, -46, 2, 2.2));
    }
    add(D.coat, g => tube(g, armNear));
    if (D.blots) add(D.blots, inside(g => tube(g, armNear), camo));
    if (rifle) add('blaze', inside(g => tube(g, armNear), g => g.fillRect(-4, -61, 12, 8)));
    add('skin', g => ell(g, armNear[2][0] + 0.5, armNear[2][1] + 0.4, 2, 2));
    return parts;
  }

  // at full draw: bow arm straight out, string hand anchored at the jaw, arrow on the rest
  function drawn(who, D, add, parts, hx, hy) {
    const bx = 21, anchor = [hx + 2.6, hy + 4.2];
    add(D.legsFar || D.far, g => tube(g, [[-1, -37, 4.6], [-4, -20, 3.6], [-7, -4.5, 2.7]]));
    add('boot', g => boot(g, -7));
    const torso = g => tube(g, [[0, -37, 7], [0.6, -48, 7.6], [1.6, -58, 7.2]]);
    const legNear = g => tube(g, [[1, -37, 4.8], [4, -20, 3.8], [6, -4.5, 2.9]]);
    add(D.coat, torso); add(D.legs || D.coat, legNear);
    if (D.blots) { add(D.blots, inside(torso, camo)); add(D.blots, inside(legNear, camo)); }
    add('boot', g => boot(g, 6));
    add('skin', g => tube(g, [[2.5, -61, 2.5], [hx - 1.6, hy + 4.4, 2.5]]));
    face(add, hx, hy, who);
    if (who === 'hunter') hunterHat(add, hx, hy, false);
    add('bowLimb', g => { tube(g, [[bx, -62, 1.3], [bx, -52, 1.3]]); tube(g, [[bx, -62, 0.9], [bx - 3, -71, 0.8], [bx - 6.5, -78, 0.6]]); tube(g, [[bx, -52, 0.9], [bx - 3, -43, 0.8], [bx - 6.5, -36, 0.6]]); ell(g, bx - 6.7, -78.3, 1.2, 1.2); ell(g, bx - 6.7, -35.7, 1.2, 1.2); });
    add('string', g => { tube(g, [[bx - 6.7, -78, 0.35], [...anchor, 0.35]]); tube(g, [[bx - 6.7, -36, 0.35], [...anchor, 0.35]]); }, 50);
    add('shaft', g => tube(g, [[...anchor, 0.45], [bx + 4, -57.5, 0.45]]), 50);
    add(D.coat, g => tube(g, [[1, -58, 3], [10, -58, 2.6], [bx - 1.5, -57.5, 2.3]]));
    add('skin', g => ell(g, bx, -57, 2.1, 2.2));
    add(D.coat, g => tube(g, [[2, -57, 3.1], [-5, -58, 2.7], [anchor[0] - 1, anchor[1] + 1, 2.3]]));
    if (D.blots) add(D.blots, inside(g => tube(g, [[2, -57, 3.1], [-5, -58, 2.7], [anchor[0] - 1, anchor[1] + 1, 2.3]]), camo));
    add('skin', g => ell(g, anchor[0], anchor[1] + 0.6, 2, 2));
    return parts;
  }

  // ---------------- native mode: loincloth, knife, crouched on the stalk ----------------
  function native() {
    const parts = [], add = (c, d, t) => parts.push({ c, d, t }), hx = 18.5, hy = -51;
    add('skinFar', g => { tube(g, [[-3, -29, 4.5], [2, -14, 3.8], [-10, -5.5, 2.5]]); tube(g, [[-10, -3.2, 1.7], [-15.5, -1.6, 1.4]]); });
    const farArm = [[9, -46, 2.8], [12, -35, 2.3], [16, -25, 2]];
    add('skinFar', g => { tube(g, farArm); ell(g, 16.8, -24.4, 1.9, 1.6); });
    add('skin', g => tube(g, [[-3, -31, 6.2], [3, -38, 7], [9, -45, 6.6]]));
    add('skin', g => { tube(g, [[-2, -29, 4.8], [11, -22, 4], [8, -5, 2.6]]); tube(g, [[7, -2.2, 1.8], [13.5, -1.2, 1.4]]); });
    add('hide', g => { tube(g, [[-8.5, -29.5, 1.4], [5, -34, 1.4]]); poly(g, [[1, -33.5], [5.6, -34.6], [7.4, -24], [3, -23.4]]); poly(g, [[-8.6, -30], [-4.6, -31.2], [-6, -21], [-10.2, -22]]); });
    add('band', g => { tube(g, [[-8.5, -30.4, 0.5], [5, -34.9, 0.5]]); }, 60);
    add('skin', g => tube(g, [[12, -48, 2.4], [hx - 2.4, hy + 3.5, 2.4]]));
    add('skin', g => { ell(g, hx, hy, 4.2, 4.8); ell(g, hx + 4.2, hy + 0.9, 1.2, 1.3); });
    add('skinFar', g => ell(g, hx - 0.8, hy + 0.3, 1.1, 1.6));
    add('hairDark', g => {
      ell(g, hx - 1, hy - 2.8, 4.8, 3.2); tube(g, [[hx - 3, hy - 2, 2.3], [hx - 5, hy + 4, 1.6]]);
    });
    add('beard', g => poly(g, [[hx - 1.4, hy + 2.2], [hx + 1.4, hy + 3], [hx + 4.6, hy + 3], [hx + 4.2, hy + 5.2], [hx + 1.6, hy + 7], [hx - 1.6, hy + 4.8]]));
    add('eye', g => ell(g, hx + 2.5, hy - 0.8, 0.65, 0.65), 60);
    const arm = [[10, -45, 3], [16, -37, 2.6], [22, -35, 2.3]];
    add('skin', g => { tube(g, arm); ell(g, 22.8, -35.2, 2, 1.9); });
    add('grip', g => tube(g, [[20.6, -35.3, 0.9], [24.6, -35.8, 0.9]]));
    add('blade', g => poly(g, [[24.4, -37], [31, -36.5], [32.4, -35.5], [24.4, -34.6]]), 60);
    return parts;
  }

  const baseParts = A.parts;
  A.parts = (an, pose) => {
    if (an.sp !== 'human') return baseParts(an, pose);
    if (an.sex === 'native') return native();
    if (pose === 'bow' || pose === 'rifle' || pose === 'draw') return standing(pose, an.sex);
    return seated(an.sex, pose);
  };
  // draw someone with their feet at (x, groundY)
  BR.person = (g, who, pose, x, groundY, scale, flip) => A.draw(g, A.get({ sp: 'human', sex: who }, pose, scale, flip ? { flip: true } : null), x, groundY);
})();

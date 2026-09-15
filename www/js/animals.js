// Bugle Ridge — elk, moose, wolf and grizzly bodies for BR.SPR. Elk antlers are straight-segmented (no curves):
// beams run back and up over the shoulders, brow and bez point forward over the face, royal (4th) is longest.
(function () {
  const BR = window.BR, A = BR.SPR, { P, tube, ell, hp, inHead, deg, neck } = A;

  // ---------------- elk ----------------
  const ELEGS = {
    stand: { nf: [[25, -31, 4.4], [25, -26, 3.4], [25.5, -17, 2.3], [26, -5, 1.6], [26.5, -1.5]], ff: [[19, -31, 4], [19.5, -26, 3.1], [20, -17, 2.1], [20.5, -5, 1.5], [21, -1.5]],
      nh: [[-27, -31, 4.8], [-28.5, -26, 3.8], [-31.5, -18.5, 2.3], [-29, -5, 1.6], [-28, -1.5]], fh: [[-22, -31, 4.4], [-23.5, -26, 3.4], [-26.5, -18.5, 2.1], [-24, -5, 1.5], [-23, -1.5]] },
    walk: { nf: [[25, -31, 4.4], [23.5, -26, 3.4], [22, -17, 2.3], [19, -5, 1.6], [18.5, -1.5]], ff: [[19, -31, 4], [23, -26, 3.1], [27, -18, 2.1], [31, -6, 1.5], [32, -2]],
      nh: [[-27, -31, 4.8], [-25.5, -26, 3.8], [-25.5, -20, 2.3], [-19, -8, 1.6], [-17, -4.5]], fh: [[-22, -31, 4.4], [-26, -26, 3.4], [-30, -19, 2.1], [-31, -5, 1.5], [-31.5, -1.5]] }
  };
  const HEAD = 'M -3,-3 Q 4,-6 11,-4.5 L 22,-1.5 Q 25,0 25,2.5 Q 24.5,5 22,5 L 19,6 Q 12,7.5 5,7 Q -2,6.5 -3,2 Z';
  const HEAD_OPEN = 'M -3,-3 Q 4,-6 11,-4.5 L 22,-1.5 Q 25,0 25,2.5 L 21,3.2 Q 12,3.5 5,4 Q -2,5 -3,2 Z';
  const JAW = 'M -2,-0.5 L 16,-0.8 Q 18,0.5 16.5,2.4 L 1,3.2 Q -3,2 -2,-0.5 Z';
  const EBODY = P('M -30,-56 Q -24,-60 -16,-59 Q -2,-56 8,-58 Q 16,-61 22,-60 Q 32,-56 34,-46 Q 36,-36 28,-31 Q 10,-28 -6,-30 Q -20,-31 -27,-35 Q -36,-38 -37,-46 Q -37,-53 -30,-56 Z');

  // racks in the frame of a head held 35° nose-down, pedicle at (0,0)
  const BEAM = [[0, 0, 1.7], [-5, -12, 1.6], [-14, -24, 1.45], [-26, -32, 1.3], [-38, -35, 1.15], [-46, -41, 0.95]];
  const TINE = { g1: [[-0.5, -2], [14, -7]], g2: [[-2.5, -7], [11, -16]], g3: [[-12, -21], [-4, -34]], g4: [[-22, -29], [-15, -50]], g5: [[-33, -34], [-29, -48]], g6: [[-41, -37], [-41, -48]] };
  function rackDef(pts) {
    if (pts <= 1) return { beam: [[0, 0, 1.3], [-3, -10, 1.1], [-6, -19, 0.8]], tines: [], sc: 1 };
    if (pts === 2) return { beam: [[0, 0, 1.4], [-5, -11, 1.3], [-10, -22, 1.0], [-15, -30, 0.8]], tines: [[[-7, -16], [-1, -27]]], sc: 1 };
    const sets = { 3: ['g1', 'g3'], 4: ['g1', 'g3', 'g4'], 5: ['g1', 'g2', 'g3', 'g4'], 6: ['g1', 'g2', 'g3', 'g4', 'g5'], 7: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'] };
    const beam = pts <= 4 ? BEAM.slice(0, 5) : BEAM;
    return { beam, tines: sets[Math.min(7, pts)].map(k => TINE[k]), sc: pts <= 4 ? 0.8 : 1 };
  }
  function drawRack(g, def, part) {
    const s = def.sc, B = def.beam.map(([x, y, r]) => [x * s, y * s, r]);
    if (part === 'beam') {
      tube(g, B);
      def.tines.forEach(([a, b]) => tube(g, [[a[0] * s, a[1] * s, 1.25], [b[0] * s, b[1] * s, 0.6]]));
    } else {
      def.tines.forEach(([a, b]) => { const m = [a[0] + (b[0] - a[0]) * 0.72, a[1] + (b[1] - a[1]) * 0.72]; tube(g, [[m[0] * s, m[1] * s, 0.8], [b[0] * s, b[1] * s, 0.6]]); });
      const e = B[B.length - 1], p = B[B.length - 2];
      tube(g, [[p[0] + (e[0] - p[0]) * 0.65, p[1] + (e[1] - p[1]) * 0.65, e[2] + 0.05], e]);
    }
  }

  function elk(an, o) {
    const cow = an.sex === 'cow', H = { x: o.poll[0], y: o.poll[1], a: deg(o.a) }, legs = ELEGS[o.legs || 'stand'];
    const hide = cow ? 'cowHide' : 'elkHide', dark = cow ? 'cowNeck' : 'elkMane', parts = [];
    const add = (c, d, t, leg) => parts.push({ c, d, t, leg });
    const headPath = P(o.mouth ? HEAD_OPEN : HEAD), def = cow ? null : rackDef(an.pts);
    const rack = (far, part) => g => { inHead(g, H); g.translate(3, -5); g.rotate(-deg(35)); if (far) { g.translate(-2.5, -1.8); g.scale(0.96, 0.96); } drawRack(g, def, part); };
    const leg = (p, cls) => {
      add(cls, g => tube(g, p.slice(0, 4).map(([x, y, r]) => [x, y, r + 0.35]).concat([[p[4][0], p[4][1] - 0.8, 1.2]])), 0, true);
      add('hoof', g => { const [x, y] = p[4]; g.beginPath(); g.moveTo(x - 1.7, y - 1.3); g.lineTo(x + 1.5, y - 1.3); g.lineTo(x + 2.7, y + 1.5); g.lineTo(x - 1.9, y + 1.5); g.fill(); }, 0, true);
    };
    if (def) { add('antlerFar', rack(true, 'beam'), 50); add('antler', rack(true, 'tips'), 50); }
    leg(legs.ff, 'elkLegFar'); leg(legs.fh, 'elkLegFar');
    add(hide, g => g.fill(EBODY));
    add(dark, g => { g.clip(EBODY); ell(g, -29.5, -47, 7, 11); });
    add('rump', g => { g.clip(EBODY); ell(g, -30, -47, 5.2, 9); });
    add('rump', g => tube(g, [[-32.5, -55, 1.5], [-34, -52, 1.3]]));
    add('elkLeg', g => { g.clip(EBODY); g.beginPath(); g.moveTo(-40, -35); g.bezierCurveTo(-10, -37, 10, -34, 40, -38); g.lineTo(40, 0); g.lineTo(-40, 0); g.fill(); });
    leg(legs.nh, 'elkLeg'); leg(legs.nf, 'elkLeg');
    const base = cow ? [25, -51] : [26, -51], att = hp(H, 3, 3), nk = neck(base, att), N = nk.N, T = nk.T;
    const nr = cow ? [7.5, 6.2, 5] : [9.5, 8.5, 6.5];
    add(dark, g => tube(g, [[...base, nr[0]], [...nk.mid, nr[1]], [...att, nr[2]]]));
    if (!cow) {
      add(dark, g => tube(g, [[base[0] + N[0] * 4, base[1] + N[1] * 4, 9], [nk.mid[0] + N[0] * 5, nk.mid[1] + N[1] * 5, 8], [att[0] + N[0] * 3, att[1] + N[1] * 3, 5.5]]));
      add(dark, g => [0.3, 0.5, 0.7].forEach(k => {
        const p = [base[0] + (att[0] - base[0]) * k + N[0] * 11, base[1] + (att[1] - base[1]) * k + N[1] * 11];
        g.beginPath(); g.moveTo(p[0] + T[0] * 2.5 - N[0] * 3, p[1] + T[1] * 2.5 - N[1] * 3); g.lineTo(p[0] - T[0] * 2.5 - N[0] * 3, p[1] - T[1] * 2.5 - N[1] * 3); g.lineTo(p[0] + N[0] * 3, p[1] + N[1] * 3); g.fill();
      }));
    }
    add(dark, g => { inHead(g, H); g.fill(headPath); });
    add('muzzle', g => { inHead(g, H); g.clip(headPath); ell(g, 22.5, 2, 4.2, 4.5); });
    if (o.mouth) {
      add('mouth', g => { inHead(g, H); const [jx, jy] = A.rot(deg(o.mouth), 16.5, 1); g.beginPath(); g.moveTo(5, 4); g.lineTo(23, 3); g.lineTo(5 + jx, 4 + jy); g.fill(); }, 60);
      add(dark, g => { inHead(g, H); g.translate(5, 4); g.rotate(deg(o.mouth)); g.fill(P(JAW)); });
    }
    if (!o.dead) add('eye', g => { inHead(g, H); ell(g, 9.5, -1.8, 1.15, 0.95); }, 60);
    const ear = o.earsForward
      ? [[0, -4.5, cow ? 2.4 : 2.1], [2, -11, cow ? 2.8 : 2.4], [3, cow ? -16 : -14, 0.9]]
      : [[-1, -3.5, cow ? 2.4 : 2.1], [-6, cow ? -10 : -8, cow ? 2.8 : 2.4], [cow ? -11 : -10.5, cow ? -14 : -11, 0.9]];
    add(dark, g => { inHead(g, H); tube(g, ear); });
    if (o.earsForward) add('earIn', g => { inHead(g, H); tube(g, [[1.4, -6, 1], [2.6, -11, 1.1]]); }, 90);
    if (def) { add('antler', rack(false, 'beam'), 50); add('tip', rack(false, 'tips'), 50); }
    return parts;
  }

  // ---------------- moose ----------------
  const MLEGS = {
    stand: { nf: [[31, -38, 5.5], [32, -28, 3.8], [32.5, -21, 2.8], [33, -6, 2], [33.5, -1.8]], ff: [[25, -38, 5], [25.5, -28, 3.4], [26, -21, 2.5], [26.5, -6, 1.8], [27, -1.8]],
      nh: [[-34, -42, 6], [-37, -31, 4.4], [-41, -23, 2.9], [-38, -6, 2], [-37, -1.8]], fh: [[-29, -42, 5.5], [-32, -31, 4], [-36, -23, 2.6], [-33, -6, 1.8], [-32, -1.8]] },
    walk: { nf: [[31, -38, 5.5], [30, -28, 3.8], [29, -21, 2.8], [26, -6, 2], [25.5, -1.8]], ff: [[25, -38, 5], [29, -29, 3.4], [33, -22, 2.5], [38, -8, 1.8], [39.5, -3.5]],
      nh: [[-34, -42, 6], [-34, -31, 4.4], [-35.5, -24, 2.9], [-28, -10, 2], [-26, -5.5]], fh: [[-29, -42, 5.5], [-34, -31, 4], [-39, -23, 2.6], [-40, -6, 1.8], [-40.5, -1.8]] }
  };
  const MBODY = P('M -40,-64 Q -30,-70 -14,-70 Q 4,-72 14,-79 Q 24,-83 32,-74 Q 42,-64 40,-50 Q 38,-40 30,-38 Q 8,-34 -14,-37 Q -30,-38 -38,-42 Q -46,-48 -44,-58 Q -43,-62 -40,-64 Z');
  const MHEAD = P('M -2,-3 Q 6,-7.5 14,-5.5 Q 25,-5.5 30.5,-2.5 Q 36,1.5 34.5,6.5 Q 32,10.5 27,9.5 L 22,8.5 Q 12,9.5 4,8.5 Q -2.5,6.5 -2,-3 Z');
  // palm length follows spread; the brow palm carries one point per brow tine so they can be counted in the scope
  function palmPath(spread, brows) {
    const L = Math.max(0.75, Math.min(1.3, spread / 50)), p = [[0, 0], [-10 * L, 1], [-24 * L, 0], [-34 * L, -3], [-40 * L, -8]];
    const n = 5;
    for (let k = 0; k < n; k++) { const x = -39 * L + k * ((39 * L - 8) / (n - 1)); p.push([x, -17 - (k % 2) * 3]); p.push([x + (39 * L - 8) / (n - 1) / 2, -11.5]); }
    for (let k = 0; k < brows; k++) {
      const t = brows === 1 ? 0.5 : k / (brows - 1), bx = -1 + 10 * t, by = -13 + 7 * t;
      p.push([bx + 1.8, by - 3.6]); p.push([bx + 2.8, by + 0.2]);
    }
    p.push([5, -2]);
    return P('M ' + p.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' L ') + ' Z');
  }
  function moose(an, o) {
    const H = { x: o.poll[0], y: o.poll[1], a: deg(o.a) }, legs = MLEGS[o.legs || 'stand'], parts = [], bull = an.sex !== 'cow';
    const add = (c, d, t, leg) => parts.push({ c, d, t, leg });
    const PALM = bull ? palmPath(an.spread || 50, an.brows || 3) : null;
    const palm = far => g => { inHead(g, H); g.translate(1, -7); g.rotate(-deg(42)); if (far) { g.translate(-3, -2.5); g.scale(0.94, 0.94); } g.fill(PALM); };
    const leg = (p, pale, dark) => {
      add(pale, g => tube(g, p.slice(0, 4).concat([[p[4][0], p[4][1] - 0.8, 1.5]])), 0, true);
      add('hoof', g => { const [x, y] = p[4]; g.beginPath(); g.moveTo(x - 2, y - 1.4); g.lineTo(x + 1.8, y - 1.4); g.lineTo(x + 3.2, y + 1.8); g.lineTo(x - 2.2, y + 1.8); g.fill(); }, 0, true);
      add(dark, g => tube(g, p.slice(0, 3).map(([x, y, r]) => [x, y, r + 0.2])), 0, true);
    };
    if (bull) add('mAntlerFar', palm(true), 90);
    leg(legs.ff, 'mLegFar', 'mBodyFar'); leg(legs.fh, 'mLegFar', 'mBodyFar');
    add('mBody', g => g.fill(MBODY));
    leg(legs.nh, 'mLeg', 'mBody'); leg(legs.nf, 'mLeg', 'mBody');
    const base = [28, -62], att = hp(H, 3, 4), nk = neck(base, att);
    add('mBody', g => tube(g, [[...base, 12], [...nk.mid, 10], [...att, 7.5]]));
    const bell = hp(H, 8, 8.5);
    add('mBody', g => tube(g, [[bell[0], bell[1], 2], [bell[0] + 0.5, bell[1] + 6, 1.5], [bell[0], bell[1] + (bull ? 12 : 7), 2.2]]));
    add('mBody', g => { inHead(g, H); g.fill(MHEAD); });
    add('mMuzzle', g => { inHead(g, H); g.clip(MHEAD); g.fillRect(21, -8, 20, 20); });
    add('mouth', g => { inHead(g, H); tube(g, [[24, 8.2, 0.5], [31, 8.8, 0.5]]); }, 60);
    add('nose', g => { inHead(g, H); ell(g, 32, 1.5, 1.2, 0.8); }, 60);
    if (!o.dead) add('eye', g => { inHead(g, H); ell(g, 11, -2.8, 1.1, 0.9); }, 60);
    add('mBody', g => { inHead(g, H); tube(g, [[-1, -5, 2.6], [-3.5, -11, 3.1], [-6, -17, 0.9]]); });
    if (bull) add('mAntler', palm(false), 90);
    return parts;
  }

  // ---------------- wolf ----------------
  const WLEGS = {
    stand: { nf: [[11, -19, 3.2], [11.5, -12, 2], [12, -6, 1.4], [12.5, -2.2, 1.2], [13.5, -0.9]], ff: [[7, -19, 3], [7.5, -12, 1.9], [8, -6, 1.3], [8.5, -2.2, 1.1], [9.5, -0.9]],
      nh: [[-16, -22, 4.6], [-18, -14, 2.4], [-20.5, -9, 1.5], [-19, -2.5, 1.2], [-17.5, -0.9]], fh: [[-13, -22, 4.2], [-15, -14, 2.2], [-17.5, -9, 1.4], [-16, -2.5, 1.1], [-14.5, -0.9]] },
    trot: { nf: [[11, -19, 3.2], [14, -13, 2], [17, -8, 1.4], [20, -4, 1.2], [21, -2.5]], ff: [[7, -19, 3], [5.5, -12, 1.9], [4, -6, 1.3], [3, -2.2, 1.1], [4, -0.9]],
      nh: [[-16, -22, 4.6], [-20, -14, 2.4], [-24, -9, 1.5], [-27, -3.5, 1.2], [-26, -1.5]], fh: [[-13, -22, 4.2], [-13, -14, 2.2], [-14.5, -9, 1.4], [-9, -4, 1.1], [-7.5, -3]] }
  };
  const WBODY = P('M -20,-30 Q -8,-33 6,-32 Q 13,-31 16,-26 Q 17,-19 11,-16 Q 4,-15 -2,-18 Q -10,-21 -16,-20 Q -23,-21 -23,-26 Q -23,-29 -20,-30 Z');
  const WHEAD = P('M -2.5,-3 Q 1.5,-6 6.5,-4.2 L 15,-1.6 Q 16.5,0 15,1.6 L 12,2.6 Q 6,4.5 0,4 Q -3,2.5 -2.5,-3 Z');
  const WMUZ = P('M 5,-1 L 15,0 Q 15.5,1.6 13,2.6 Q 6,4.6 0,4 Q -2,3 -1.5,1 Z');
  function wolf(an, o) {
    const H = { x: o.poll[0], y: o.poll[1], a: deg(o.a) }, legs = WLEGS[o.legs || 'stand'], parts = [], add = (c, d, t, leg) => parts.push({ c, d, t, leg });
    const black = !!an.black, G = black ? 'wBlack' : 'wGrey', CR = black ? 'wBlackGrey' : 'wCream', FAR = black ? 'wBlackFar' : 'wLegFar', SAD = black ? 'wBlackFar' : 'wSaddle';
    const leg = (p, cls) => { add(cls, g => tube(g, p.slice(0, 4)), 0, true); add(cls, g => ell(g, p[4][0], p[4][1], 2.1, 1), 0, true); };
    const tail = o.legs === 'trot' ? [[-21, -29, 2], [-27, -26.5, 3], [-33, -23.5, 3], [-37, -21.5, 1.9]] : [[-21, -29, 2], [-24.5, -22, 3], [-27, -15, 3.1], [-28, -9, 2.2]];
    add(SAD, g => { inHead(g, H); g.fill(P('M -3.2,-3.6 L 0.6,-4 L -2.4,-10.2 Z')); });
    leg(legs.ff, FAR); leg(legs.fh, FAR);
    add(G, g => tube(g, tail));
    add('wTailTip', g => tube(g, [[tail[2][0] * 0.35 + tail[3][0] * 0.65, tail[2][1] * 0.35 + tail[3][1] * 0.65, 2.7], tail[3]]));
    add(G, g => g.fill(WBODY));
    add(SAD, g => { g.clip(WBODY); ell(g, -4, -33, 16, 5.5); });
    add(CR, g => { g.clip(WBODY); g.beginPath(); g.moveTo(-24, -20); g.bezierCurveTo(-8, -22, 4, -19, 18, -21); g.lineTo(18, 0); g.lineTo(-24, 0); g.fill(); });
    leg(legs.nh, CR); leg(legs.nf, CR);
    const base = [9, -27], att = hp(H, 1, 1), nk = neck(base, att), N = nk.N;
    add(G, g => tube(g, [[...base, 6.5], [...nk.mid, 5.4], [...att, 4.6]]));
    add(CR, g => tube(g, [[13, -21, 3.6], [nk.mid[0] + N[0] * 2.4, nk.mid[1] + N[1] * 2.4, 4], [att[0] + N[0] * 2, att[1] + N[1] * 2, 3.2]]));
    add(G, g => { inHead(g, H); g.fill(WHEAD); });
    add(CR, g => { inHead(g, H); g.clip(WHEAD); g.fill(WMUZ); });
    add('nose', g => { inHead(g, H); ell(g, 15.2, -0.6, 1.2, 1); }, 60);
    if (!o.dead) add(black ? 'eyeAmber' : 'eye', g => { inHead(g, H); ell(g, 5.6, -2.3, 0.95, 0.8); }, 60);
    add(G, g => { inHead(g, H); g.fill(P('M -1.2,-4 L 3.2,-4.4 L 0.4,-11 Z')); });
    return parts;
  }

  // ---------------- grizzly: thick through the body, modest shoulder hump ----------------
  const GLEGS = {
    stand: { nf: [[22, -18, 7], [23, -10, 5.8], [24, -4.5, 4.8]], ff: [[16, -18, 6.4], [16.5, -10, 5.2], [17, -4.5, 4.4]], nh: [[-25, -20, 8.5], [-26, -10, 6], [-25.5, -4.5, 5]], fh: [[-19, -20, 8], [-20, -10, 5.6], [-19.5, -4.5, 4.6]] },
    walk: { nf: [[22, -18, 7], [26, -10, 5.8], [29, -5.5, 4.8]], ff: [[16, -18, 6.4], [14.5, -10, 5.2], [13, -4.5, 4.4]], nh: [[-25, -20, 8.5], [-22, -11, 6], [-18, -6, 5]], fh: [[-19, -20, 8], [-23, -10, 5.6], [-26, -4.5, 4.6]] },
    charge: { nf: [[24, -17, 6.8], [32, -11, 5.4], [38, -7, 4.6]], ff: [[16, -17, 6.4], [18, -9, 5], [21, -4.5, 4.4]], nh: [[-22, -20, 8], [-14, -12, 5.8], [-6, -6, 4.8]], fh: [[-26, -20, 8], [-33, -13, 5.8], [-40, -8, 4.8]] }
  };
  const GBODY = P('M -32,-30 Q -20,-37 -2,-38 Q 6,-43 14,-42 Q 25,-40 30,-30 Q 32,-17 23,-10 Q 6,-7 -12,-8 Q -30,-9 -36,-17 Q -39,-26 -32,-30 Z');
  const GHEAD = P('M -4,-6 Q 2,-9.5 8,-7 Q 10.5,-5 12.5,-4.6 L 18.5,-2.6 Q 21,-0.5 19,2 L 12,4 Q 3,6.5 -4,3.5 Q -6,-1 -4,-6 Z');
  const GSNOUT = P('M 11,-4.4 L 18.5,-2.6 Q 21,-0.5 19,2 L 12,4 Q 9.5,1 11,-4.4 Z');
  const foot = (g, x, y) => { g.beginPath(); g.moveTo(x - 3.5, y - 1); g.lineTo(x + 4, y - 1); g.quadraticCurveTo(x + 7.5, y + 1, x + 7.5, y + 4.5); g.lineTo(x - 4, y + 4.5); g.fill(); };
  const claws = (g, x, y) => { tube(g, [[x + 5.5, y + 2.4, 0.55], [x + 9.5, y + 4.1, 0.4]]); tube(g, [[x + 5.5, y + 3.9, 0.55], [x + 9.3, y + 4.9, 0.4]]); };
  function gHead(add, H, o) {
    const hd = g => { inHead(g, H); g.scale(1.3, 1.3); };
    add('gLegFar', g => { hd(g); ell(g, -3.5, -6.8, o.earsPinned ? 1.3 : 2, o.earsPinned ? 1 : 2); });
    add('gFur', g => { hd(g); g.fill(GHEAD); });
    add('gSnout', g => { hd(g); g.fill(GSNOUT); });
    add('nose', g => { hd(g); ell(g, 19.4, -1.4, 1.4, 1.1); }, 60);
    if (!o.dead) add('eye', g => { hd(g); ell(g, 7.5, -3.6, 0.95, 0.85); }, 60);
    add('gFur', g => { hd(g); ell(g, 0.5, -7.4, o.earsPinned ? 1.4 : 2.4, o.earsPinned ? 1.1 : 2.3); });
  }
  function griz(an, o) {
    const H = { x: o.poll[0], y: o.poll[1], a: deg(o.a) }, legs = GLEGS[o.legs || 'stand'], parts = [], add = (c, d, t, leg) => parts.push({ c, d, t, leg });
    const tilt = g => { g.translate(0, -25); g.rotate(deg(o.tilt || 0)); g.translate(0, 25); };
    const leg = (p, cls, front) => { const [x, y] = p[2]; add(cls, g => tube(g, p), 0, true); add(cls, g => foot(g, x, y), 0, true); if (front) add('claw', g => claws(g, x, y), 70, true); };
    leg(legs.ff, 'gLegFar', true); leg(legs.fh, 'gLegFar', false);
    add('gFur', g => { tilt(g); g.fill(GBODY); ell(g, 9, -39, 6.5, 4.2); });
    add('gFur', g => { tilt(g); for (let x = -28; x < 20; x += 4) { g.beginPath(); g.moveTo(x, -9.5); g.lineTo(x + 4, -9); g.lineTo(x + 1.5, -6); g.fill(); } });
    leg(legs.nh, 'gLeg', false); leg(legs.nf, 'gLeg', true);
    const att = hp(H, -1, 0);
    add('gFur', g => tube(g, [[21, -28, 11], [(21 + att[0]) / 2, (-28 + att[1]) / 2, 9.5], [...att, 8.5]]));
    gHead(add, H, o);
    return parts;
  }

  // ---------------- poses ----------------
  const POSES = {
    elk: { stand: { poll: [40, -86], a: 38 }, alert: { poll: [38, -88], a: 20, earsForward: true }, walk: { poll: [44, -76], a: 50, legs: 'walk' }, feed: { poll: [47, -26], a: 80 },
      bugle: { poll: [50, -80], a: -28, mouth: 22 }, dead: { poll: [52, -30], a: 100, dead: true } },
    cow: { stand: { poll: [38, -80], a: 35 }, alert: { poll: [36, -88], a: 18, earsForward: true }, walk: { poll: [42, -72], a: 45, legs: 'walk' }, feed: { poll: [45, -25], a: 80 },
      dead: { poll: [50, -30], a: 100, dead: true } },
    moose: { stand: { poll: [52, -72], a: 42 }, alert: { poll: [50, -82], a: 14 }, walk: { poll: [54, -68], a: 50, legs: 'walk' }, feed: { poll: [58, -52], a: 70 }, dead: { poll: [56, -40], a: 95, dead: true } },
    wolf: { stand: { poll: [19, -38], a: 8 }, alert: { poll: [19, -38], a: 8 }, walk: { poll: [19, -31], a: 22, legs: 'trot' }, feed: { poll: [20, -22], a: 60 }, dead: { poll: [20, -16], a: 40, dead: true } },
    griz: { stand: { poll: [31, -26], a: 16 }, alert: { poll: [31, -30], a: 4 }, walk: { poll: [31, -26], a: 16, legs: 'walk' }, feed: { poll: [32, -11], a: 58 },
      charge: { poll: [38, -20], a: 22, legs: 'charge', tilt: 5, earsPinned: true }, dead: { poll: [34, -14], a: 40, dead: true } }
  };
  A.parts = (an, pose) => {
    const key = an.sp === 'elk' ? (an.sex === 'cow' ? 'cow' : 'elk') : an.sp, set = POSES[key];
    const o = set[pose] || set.stand;
    if (an.sp === 'moose') return moose(an, o);
    if (an.sp === 'wolf') return wolf(an, o);
    if (an.sp === 'griz') return griz(an, o);
    return elk(an, o);
  };
  A.poseOpt = (pose, sp) => (pose === 'dead' ? { down: { elk: 26, moose: 34, wolf: 14, griz: 8 }[sp] || 26 } : null);

  // ---------------- hit zones (world units, facing right) ----------------
  // Vitals sit just behind the front leg: lungs centred a hand behind the crease, heart low and tight to the leg.
  const Z = {
    elk: { vit: [10, -43, 8.5, 7], heart: [15, -35, 3], sh: [18, 36, -62, -44], spineY: -55, neckX: 34, liver: [-4, 1], hamX: -22, legY: -30 },
    moose: { vit: [15, -54, 10, 9], heart: [21, -45, 3.5], sh: [24, 44, -82, -58], spineY: -72, neckX: 44, liver: [0, 5], hamX: -28, legY: -38 },
    wolf: { vit: [3, -24, 4, 4], heart: [6, -20, 1.8], sh: [8, 17, -33, -25], spineY: -30, neckX: 16, liver: [-5, -2], hamX: -14, legY: -16 },
    griz: { vit: [8, -24, 7, 6], heart: [12, -17, 2.5], sh: [14, 30, -44, -26], spineY: -36, neckX: 30, liver: [-5, 0], hamX: -22, legY: -10 }
  };
  A.zone = (sp, wx, wy, angle, onBody) => {
    if (!onBody) return 'miss';
    const z = Z[sp] || Z.elk, off = angle === 'quartering-away' ? -3 : angle === 'quartering-to' ? 3 : 0;
    const [vx, vy, rx, ry] = z.vit, cx = vx + off;
    if (wy > z.legY) return 'leg';
    if (wx > z.neckX) return 'neck';
    if (Math.hypot(wx - (z.heart[0] + off), wy - z.heart[1]) < z.heart[2]) return 'heart';
    if (Math.hypot((wx - cx) / rx, (wy - vy) / ry) < 1) return angle === 'quartering-to' && wx > cx ? 'shoulder' : 'vitals';
    if (wy < z.spineY) return 'spine';
    if (wx >= z.sh[0] - (angle === 'quartering-to' ? 5 : 0) && wx <= z.sh[1] && wy >= z.sh[2] && wy <= z.sh[3]) return 'shoulder';
    if (wx >= z.liver[0] + off && wx <= z.liver[1] + off) return angle === 'quartering-away' ? 'vitals' : 'liver';
    if (wx < z.hamX) return 'ham';
    return 'paunch';
  };
  A.vitals = sp => Z[sp] || Z.elk;
})();

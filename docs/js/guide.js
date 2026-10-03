// Bugle Ridge — Calling for Sam (the epilogue). You locate a bull, place Sam and yourself on a top-down setup
// map (only the wind is shown), call him in, signal Sam's draw and mew to stop the bull. Sam takes the shot.
// Map units are stalk-map pixels: 1 px = 3 yd, uphill is up.
(function () {
  const BR = window.BR, { P, W, H, R } = BR;
  const YD = 3, yd = px => px * YD, px = y => y / YD;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  const legalNow = () => { const l = BR.ch().light, c = BR.S.clock; return !l || (c >= l[0] && c <= l[1]); };
  const client = () => BR.ch().client || { range: 35, legs: 3, hold: 30, drawTime: 1.4 };

  // ---------------- Sam's legs: about 3 miles a day; overdo it and tomorrow is shorter ----------------
  BR.samLegs = () => {
    const S = BR.S, full = client().legs;
    if (!S.samLegs || S.samLegs.day !== S.day) {
      const prev = S.samLegs, carry = prev && prev.day === S.day - 1 ? Math.min(0, prev.left) : 0;
      S.samLegs = { day: S.day, left: Math.max(0.6, full + carry) };
    }
    return Math.max(0, S.samLegs.left);
  };
  BR.useLegs = mi => { BR.samLegs(); BR.S.samLegs.left -= mi; };

  // ---------------- LOCATE: a location bugle from the ridge, then close in quietly ----------------
  let ridgeBg = null;
  function ridgeArt() {
    if (ridgeBg) return ridgeBg;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    BR.bands(g, [[0, '#0b0f1c'], [90, '#1d2340'], [150, '#4a3e5c'], [175, '#7a5560']]);
    BR.stars(g, 70, 110, 3);
    BR.ridge(g, 150, 14, 0.02, 0.6, '#262a3c');
    BR.ridge(g, 184, 10, 0.035, 2, '#1a2026');
    for (let X = 120; X < W; X += 7) BR.pine(g, X, BR.ry(X, 184, 10, 0.035, 2) + 6, 12 + ((X * 5) % 8), '#121a18');
    for (let X = 0; X < W; X++) { const y = Math.round(232 + Math.sin(X * 0.03) * 6 + X * 0.12); R(g, X, y, 1, H - y, '#0d1210'); R(g, X, y, 1, 1, '#2e3a30'); }
    return (ridgeBg = c);
  }

  BR.scenes.locate = {
    enter(a) {
      const S = BR.S, e = S.enc || (S.enc = { area: a.area });
      this.area = BR.area(e.area);
      if (!e.loc) e.loc = { tries: 0, answer: null, msg: S.part === 'morning' ? 'Grey light on the ridge. Sam’s breathing hard from the walk.' : 'Evening. The thermals are still going uphill.' };
      this.hud();
    },
    draw(g) {
      g.drawImage(ridgeArt(), 0, 0);
      const L = BR.S.enc.loc;
      if (L.answer) BR.SPR.draw(g, BR.SPR.get({ sp: 'elk', sex: 'bull', pts: L.answer.pts }, 'bugle', 0.22, { flip: true }), L.answer.dx > 0 ? 196 : 150, BR.ry(L.answer.dx > 0 ? 196 : 150, 184, 10, 0.035, 2) + 2);
      BR.person(g, 'sam', 'bow', 30, 238, 0.95);
      BR.person(g, 'hunter', 'bow', 60, 240, 0.95);
    },
    hud() {
      const S = BR.S, L = S.enc.loc, ans = L.answer, over = S.part === 'morning' ? S.clock >= 10.5 : S.clock >= BR.dark() - 0.4;
      BR.hud(`
        <div class="row"><span class="t">LOCATING · ${BR.dayInfo(S.day).rut.toUpperCase()}</span><span class="hi">${BR.fmt(S.clock)}</span></div>
        <div class="quote">${BR.esc(L.msg)}</div>
        ${ans ? `<div class="row sm"><span>Bull answered</span><span class="hi">≈${ans.yd} yd · ${ans.dir}</span></div>` : ''}
        <div class="sp"></div>
        ${ans ? BR.btn('close', 'Close in quietly', 'go', null, over, `Get within about 100 yards. No calling on the way.`) : ''}
        <div class="g2">
          ${BR.btn('bugle', 'Location bugle', ans ? '' : 'go', null, over || L.tries >= 4, 'One short bugle, then listen')}
          ${BR.btn('glass', 'Glass instead', '', null, over)}
        </div>
        ${BR.btn('leave', 'Head back to camp')}`);
    },
    act(a) {
      const S = BR.S, e = S.enc, L = e.loc, ch = BR.ch(), r = Math.random;
      if (a === 'leave') { if (!L.answer) BR.log('noelk', { area: e.area }); BR.endHunt(); return; }
      if (a === 'glass') { BR.go('glass', { area: e.area }); return; }
      if (a === 'bugle') {
        L.tries++; BR.pass(8);
        const rut = BR.rutPhase(ch, S.day).level * ch.callShy(S.day);
        const p = this.area.elk * Math.min(0.9, 0.2 + rut * 0.32) * (e.spooked ? 0.6 : 1) / (1 + (L.tries - 1) * 0.35);
        if (r() < p) {
          const a2 = BR.group(BR.rng((Date.now() % 99991) + L.tries), ch), bull = a2.find(x => x.sex === 'bull') || { sp: 'elk', sex: 'bull', pts: 5 };
          const cows = a2.filter(x => x.sex === 'cow' && !x.calf).length;
          L.answer = { yd: Math.round((220 + r() * 260) / 10) * 10, dir: ['north', 'northeast', 'east', 'northwest', 'west'][(r() * 5) | 0], dx: r() < 0.5 ? 1 : -1, pts: bull.pts, cows: r() < 0.6 ? Math.max(2, cows) : 0, silent: r() < 0.22 + (1 - ch.callShy(S.day)) * 0.5 };
          L.animal = bull;
          L.msg = L.answer.cows ? 'A bugle rolls back across the basin, then glunks and chuckles. A herd bull with cows.' : 'One bugle answers, high and broken off. A satellite, alone.';
          BR.vibe(30);
        } else L.msg = ['Nothing. A raven, and the creek.', 'Your bugle dies out in the timber. No answer.', 'A far-off answer, maybe. Then nothing.'][(r() * 3) | 0];
      } else if (a === 'close') {
        const ans = L.answer;
        BR.pass(Math.max(10, (ans.yd - 100) / 25));
        e.g = null;
        BR.go('setup');
        return;
      }
      this.hud(); BR.draw(); BR.save();
    },
    back() { BR.confirm('Leave this ridge?', 'Head back to camp. This hunt is over.', 'Head back', () => this.act('leave')); }
  };

  // ---------------- the setup map ----------------
  function mapOf(e) {
    const c = BR.planCache;
    if (c && c.seed === e.g.seed && c.look === BR.ch().look) return c;
    const M = BR.stalkMap, grid = M.genMap(BR.area(e.area), e.g.seed, { x: e.g.B.x, y: e.g.B.y });
    return (BR.planCache = { seed: e.g.seed, look: BR.ch().look, grid, canvas: M.renderMap(grid, e.g.seed, false) });
  }
  const terr = (e, p) => BR.stalkMap.TER[BR.stalkMap.terrainAt(mapOf(e).grid, p.x, p.y)];
  // concealment and lanes for someone sitting at p, facing toward f: in front of cover, with open lanes, is right
  function spotQuality(e, p, f) {
    const here = terr(e, p), dx = p.x - f.x, dy = p.y - f.y, L = Math.hypot(dx, dy) || 1, back = { x: p.x + dx / L * 3, y: p.y + dy / L * 3 };
    const behind = terr(e, back);
    let open = 0, n = 0;
    for (let k = -2; k <= 2; k++) for (let rr = 4; rr <= 11; rr += 3.5) {
      const a = Math.atan2(-dy, -dx) + k * 0.35, q = { x: p.x + Math.cos(a) * rr, y: p.y + Math.sin(a) * rr };
      n++; if (terr(e, q).cover < 0.5) open++;
    }
    const lanes = open / n;
    const cover = here.cover >= 0.9 ? 'timber' : (here.cover < 0.5 && behind.cover >= 0.5) || here.name === 'deadfall' ? 'front' : 'open';
    return { cover, lanes, here: here.name };
  }

  function newSetup(e) {
    const S = BR.S, L = e.loc, r = Math.random, seed = ((Date.now() % 100000) + S.day * 7) | 0;
    const B = { x: 80 + r() * 80, y: 90 + r() * 40 };
    const A = { x: B.x + (r() - 0.5) * 30, y: B.y + px(95 + r() * 15) };
    e.g = { seed, B, A, sam: null, me: null, phase: 'place', msg: 'Tap where Sam sits. Then tap where you’ll call from.', animal: L.animal, herd: L.answer.cows, silent: L.answer.silent,
      interest: 18, susp: 0, t: 0, hung: false, hangYd: 70 + r() * 25, turns: 0, hist: [], estrus: [], cows: [], done: false, seen: false };
  }

  BR.scenes.setup = {
    enter() {
      const e = BR.S.enc;
      if (!e.g) newSetup(e);
      this.m = mapOf(e);
      this.hud();
    },
    view() { const e = BR.S.enc, g = e.g, c = lerp(g.A, g.B, 0.4); return { z: 2, x0: BR.clamp(c.x - W / 4, 0, W / 2), y0: BR.clamp(c.y - H / 4, 0, H / 2) }; },
    draw(g) { drawMap(g, this.view(), true); },
    up(p) {
      const e = BR.S.enc, G = e.g; if (G.phase !== 'place') return;
      const v = this.view(), m = { x: v.x0 + p.x / v.z, y: v.y0 + p.y / v.z };
      if (dist(m, G.B) < px(45)) { G.msg = 'Too close to where he bugled. He’d see you set up.'; }
      else if (dist(m, G.A) > px(170)) { G.msg = 'Too far. You’d bump him getting there.'; }
      else if (!G.sam || (G.sam && G.me)) { G.sam = m; G.me = null; G.msg = 'Sam’s spot. Now tap where you’ll call from.'; }
      else { G.me = m; G.msg = `You and Sam are ${Math.round(yd(dist(G.sam, G.me)))} yards apart.`; }
      BR.draw(); this.hud(); BR.save();
    },
    hud() {
      const S = BR.S, G = S.enc.g, c = BR.conditions(), sc = BR.scent(BR.area(S.enc.area), S.clock);
      const ready = G.sam && G.me;
      BR.hud(`
        <div class="row"><span class="t">SET UP · UPHILL IS UP</span><span class="hi">${BR.fmt(S.clock)}</span></div>
        <div class="row sm"><span>Wind from <span class="ok">${c.from} ${c.mph} mph</span> · thermals ${BR.thermalText(sc.thermal)}</span></div>
        <div class="row sm"><span class="dim">${BR.esc(G.msg)}</span></div>
        <div class="row sm"><span class="dim">Sam’s ring is ${client().range} yards. The arrow is your scent drifting.</span></div>
        <div class="sp"></div>
        ${BR.btn('go', 'Set up and start calling', 'go', null, !ready)}
        <div class="g2">${BR.btn('clear', 'Start over', '', null, !G.sam)}${BR.btn('leave', 'Back out')}</div>`);
    },
    act(a) {
      const S = BR.S, e = S.enc, G = e.g;
      if (a === 'clear') { G.sam = G.me = null; G.msg = 'Tap where Sam sits.'; BR.draw(); this.hud(); return; }
      if (a === 'leave') { BR.endHunt(); return; }
      if (a === 'go' && G.sam && G.me) {
        BR.pass(6);
        G.phase = 'call';
        G.C = { x: G.me.x, y: G.me.y };
        G.q = spotQuality(e, G.sam, G.B);
        { const sc0 = BR.scent(BR.area(e.area), S.clock); G.sc0 = { x: sc0.x, y: sc0.y }; }
        planPath(e);
        const ahead = yd(dist(G.me, G.B) - dist(G.sam, G.B)), closest = Math.round(yd(G.closest.d));
        G.log = { ahead: Math.round(ahead), apart: Math.round(yd(dist(G.sam, G.me))), cover: G.q.cover, lanes: +G.q.lanes.toFixed(2), closest, downwindSide: G.downwindSide };
        BR.log('setup', G.log);
        G.msg = 'Sam nocks an arrow and gives you a thumbs-up. Your move.';
        BR.go('guideCall');
      }
    },
    back() { BR.confirm('Back out?', 'Leave this bull and head back to camp.', 'Back out', () => this.act('leave')); }
  };

  // The bull walks toward the sound, angling to get downwind of it before he commits: his path ends at a point
  // 40 yards downwind of the caller. Where that line passes Sam decides whether Sam gets a shot.
  function planPath(e) {
    const G = e.g, sc = BR.scent(BR.area(e.area), BR.S.clock);
    G.D = { x: G.C.x + sc.x * px(40), y: G.C.y + sc.y * px(40) };
    let best = { t: 0, d: 1e9 };
    for (let t = 0; t <= 1; t += 0.01) { const p = lerp(G.B, G.D, t), d = dist(p, G.sam); if (d < best.d) best = { t, d }; }
    G.closest = best;
    // which side of the caller's line is Sam on, relative to the wind
    const lx = G.C.x - G.B.x, ly = G.C.y - G.B.y, side = (G.sam.x - G.B.x) * ly - (G.sam.y - G.B.y) * lx, wside = sc.x * ly - sc.y * lx;
    G.downwindSide = Math.sign(side) === Math.sign(wside);
    G.pos = { x: G.B.x, y: G.B.y };
  }

  function drawMap(g, v, placing) {
    const S = BR.S, e = S.enc, G = e.g, m = mapOf(e), z = v.z;
    g.drawImage(m.canvas, v.x0, v.y0, W / z, H / z, 0, 0, W, H);
    const T = p => [Math.round((p.x - v.x0) * z), Math.round((p.y - v.y0) * z)];
    // where he last bugled
    const [bx, by] = T(G.B);
    if (G.phase === 'place' || !G.seen) { BR.ring(g, bx, by, 5, P.amber, 30); R(g, bx - 1, by - 1, 3, 3, P.amber); }
    // Sam's ring
    if (G.sam) { const [sx, sy] = T(G.sam); BR.ring(g, sx, sy, px(client().range) * z, 'rgba(233,223,203,.55)', 6); R(g, sx - 3, sy - 3, 7, 7, P.ink); R(g, sx - 2, sy - 2, 5, 5, P.bone); if (G.drawn) R(g, sx - 1, sy - 6, 3, 2, P.bone); }
    if (G.me) { const [mx, my] = T(G.C || G.me); R(g, mx - 3, my - 3, 7, 7, P.ink); R(g, mx - 2, my - 2, 5, 5, P.amber); }
    // the bull and his cows, when you can see them
    if (G.phase !== 'place' && G.pos && G.seen) {
      const dir = G.D ? Math.sign(G.D.x - G.B.x) || 1 : 1;
      G.cows.forEach(cw => { const [cx, cy] = T(cw); BR.animalTop(g, { a: { sp: 'elk', sex: 'cow' }, dx: dir }, cx, cy, z, true); });
      const [ex, ey] = T(G.pos);
      BR.animalTop(g, { a: G.animal, dx: dir }, ex, ey, z, G.looking);
      if (G.looking) R(g, ex, ey - 7 * z, z, 3 * z, G.lookAt === 'sam' ? P.blood : P.amber);
    }
    // wind: your scent drifting
    const sc = BR.scent(BR.area(e.area), S.clock);
    R(g, W - 26, 32, 22, 22, 'rgba(7,8,11,.8)');
    const cx = W - 15, cy = 43;
    BR.line(g, cx - sc.x * 8, cy - sc.y * 8, cx + sc.x * 8, cy + sc.y * 8, P.wind);
    R(g, cx + sc.x * 8 - 1, cy + sc.y * 8 - 1, 3, 3, P.wind);
  }

  // ---------------- CALLING: turns while he's out there, real time once he's close to Sam ----------------
  const NOTE = {
    cow: 'You mew softly, like a cow feeding.', estrus: 'A long estrus whine.', locate: 'One short location bugle.',
    challenge: 'A screaming challenge bugle and a chuckle.', rake: 'You rake a sapling hard and snap branches for two minutes.',
    wait: 'You sit still and say nothing.', backoff: 'You back away 30 yards, mewing as you go.', closer: 'You slip 30 yards toward him.'
  };
  BR.scenes.guideCall = {
    enter(a) {
      const e = BR.S.enc;
      if (!e || !e.g || !e.g.C) { BR.endHunt(); return; }
      this.m = mapOf(e);
      if (e.g.phase === 'close' && a && a.resume) { e.g.phase = 'call'; e.g.msg = 'He’s close. Make your move.'; }
      this.hud();
      if (e.g.phase === 'close') BR.animate();
    },
    exit() { BR.stop(); },
    pause() { const G = BR.S.enc && BR.S.enc.g; if (G && G.phase === 'close') { G.paused = true; } },
    resume() { const G = BR.S.enc.g; if (G.phase === 'close') { G.paused = false; BR.animate(); } },
    view() {
      const G = BR.S.enc.g;
      if (G.phase === 'close') return { z: 3, x0: BR.clamp(G.sam.x - W / 6, 0, W - W / 3), y0: BR.clamp(G.sam.y - H / 6, 0, H - H / 3) };
      const c = lerp(G.C, G.B, 0.45);
      return { z: 2, x0: BR.clamp(c.x - W / 4, 0, W / 2), y0: BR.clamp(c.y - H / 4, 0, H / 2) };
    },
    draw(g) { drawMap(g, this.view(), false); },
    yardsTo(p) { return Math.round(yd(dist(BR.S.enc.g.pos, p))); },
    hud() {
      const S = BR.S, G = S.enc.g, close = G.phase === 'close', ch = BR.ch();
      const toSam = this.yardsTo(G.sam), toMe = this.yardsTo(G.C);
      const head = `<div class="row"><span class="t">${close ? 'HE’S IN · REAL TIME' : 'CALLING FOR SAM'}</span><span class="hi">${G.seen ? toSam + ' yd from Sam' : 'unseen'}</span></div>
        <div class="row sm"><span class="${G.turns ? 'toast' : 'dim'}" id="gc-msg">${BR.esc(G.msg)}</span></div>`;
      if (close) {
        BR.hud(head + `
          <div class="row"><span>SAM</span><span id="gc-sam"></span></div>
          <div class="row sm"><span class="dim" id="gc-look"></span><span class="dim">${BR.fmt(S.clock)}</span></div>
          <div class="sp"></div>
          <div class="g2"><button class="btn go" data-act="draw" id="gc-draw">Signal: draw</button><button class="btn" data-act="mew" id="gc-mew">Mew to stop him</button></div>`);
        this.upd();
        return;
      }
      const reeds = !!S.items.reeds, locked = G.done;
      BR.hud(head + `
        <div class="row sm"><span class="dim">${G.seen ? `You can see him · ${toMe} yd from you` : 'You can hear him, not see him'}</span><span class="dim">${BR.fmt(S.clock)}</span></div>
        <div class="sp"></div>
        <div class="g2">
          ${BR.btn('cow', 'Cow mew', '', null, locked)}
          ${BR.btn('estrus', reeds ? 'Estrus whine' : 'Estrus whine (reeds)', '', null, locked || !reeds)}
          ${BR.btn('locate', 'Location bugle', '', null, locked)}
          ${BR.btn('challenge', 'Challenge bugle', '', null, locked)}
          ${BR.btn('rake', 'Rake a tree', '', null, locked)}
          ${BR.btn('wait', 'Go silent · 10 min', '', null, locked)}
          ${BR.btn('backoff', 'Back off, calling', '', null, locked)}
          ${G.hung && !locked ? BR.btn('closer', 'Slip closer') : BR.btn('leave', 'Leave', locked ? 'go' : '')}
        </div>`);
    },
    upd() {
      const $ = id => document.getElementById(id), G = BR.S.enc.g; if (!$('gc-sam')) return;
      const hold = client().hold, left = G.drawn ? BR.clamp(1 - G.holdT / hold, 0, 1) : 1;
      $('gc-msg').textContent = G.msg;
      $('gc-sam').innerHTML = G.drawing ? 'drawing…' : G.drawn ? BR.meter(Math.ceil(left * 5), 5, left < 0.3 ? 'bad' : left < 0.6 ? 'warn' : '') : '<span class="dim">waiting on your signal</span>';
      $('gc-look').textContent = G.stopped > 0 ? 'Stopped, looking for the cow.' : G.looking ? (G.lookAt === 'sam' ? 'He’s looking right at Sam.' : 'Head up, looking around.') : 'Head down, walking.';
      $('gc-draw').disabled = G.drawn || G.drawing;
      $('gc-mew').disabled = G.stopped > 0;
    },
    act(a) {
      const S = BR.S, G = S.enc.g;
      if (a === 'leave') {
        // R1: a silent bull that was still coming shows up after you walk out
        if (G.silent && G.interest - G.susp > 10 && this.yardsTo(G.C) < 220) { BR.log('leftEarly', { yd: this.yardsTo(G.C) }); this.end({ kind: 'leftEarly' }); return; }
        if (!G.turns) BR.log('noelk', { area: S.enc.area, via: 'call' });
        BR.endHunt(); return;
      }
      if (G.phase === 'close') { this.signal(a); return; }
      this.turn(a);
    },
    // ----- turn phase -----
    turn(action) {
      const S = BR.S, ch = BR.ch(), e = S.enc, G = e.g, r = Math.random, rut = BR.rutPhase(ch, S.day).level * ch.callShy(S.day);
      BR.pass(action === 'wait' ? 10 : action === 'rake' ? 4 : action === 'backoff' || action === 'closer' ? 5 : 3);
      G.turns++; G.hist.push(action);
      let msg = NOTE[action] + ' ';
      if (S.part === 'evening' && S.clock >= BR.dark()) return this.end({ kind: 'dark' });
      if (S.part === 'morning' && S.clock >= 11.5) { G.msg = 'Midday. He’s bedded somewhere in the timber.'; G.done = true; return this.after(); }
      const bull = G.animal, toMe = yd(dist(G.pos, G.C)), recentCalls = G.hist.slice(-4).filter(h => ['cow', 'estrus', 'locate', 'challenge'].includes(h)).length;
      if (['cow', 'estrus', 'locate', 'challenge'].includes(action) && recentCalls >= 4) { G.susp += 14; msg += 'That’s a lot of calling. '; }
      if (action === 'cow') G.interest += 8 + 5 * rut + (toMe < 110 ? 6 : 0);
      else if (action === 'estrus') {
        G.estrus.push(S.clock);
        const recent = G.estrus.filter(t => S.clock - t < 0.15).length;  // R4: more than two whines in ~9 minutes sounds wrong
        if (recent > 2) { G.susp += 22; msg += 'Too much whining. '; } else G.interest += 12 + 12 * (rut - 1);
      } else if (action === 'locate') { G.interest += toMe > 150 ? 6 + 4 * rut : 1; }
      else if (action === 'challenge') {
        // R3: a satellite comes running; a herd bull may gather his cows and leave instead
        if (G.herd && toMe < 160) {
          if (r() < 0.45) { G.interest -= 25; G.pushed = true; msg += 'He gathers his cows and pushes them away. '; }
          else { G.interest += 26; msg += 'He screams back and comes, raking! '; G.advance = 30; }
        } else if (!G.herd) { G.interest += toMe < 160 ? 24 : 10; if (toMe < 160) G.advance = 25; }
        else G.interest += 8;
      } else if (action === 'rake') { G.interest += toMe < 160 ? 14 : 5; G.susp = Math.max(0, G.susp - 8); }
      else if (action === 'wait') {
        G.susp = Math.max(0, G.susp - 12);
        if (G.hung && r() < 0.5) { G.hung = false; G.interest += 10; msg += 'Twenty minutes of nothing, then a branch cracks. He’s coming, quiet. '; G.silent = true; }
        else if (toMe > 150) G.interest -= 3;
      } else if (action === 'backoff') {
        // R2: pull the caller back so the bull has to come forward to find the cow, ideally past Sam
        const dx = G.C.x - G.pos.x, dy = G.C.y - G.pos.y, L = Math.hypot(dx, dy) || 1;
        G.C = { x: BR.clamp(G.C.x + dx / L * px(30), 4, W - 4), y: BR.clamp(G.C.y + dy / L * px(30), 4, H - 4) };
        const sc = BR.scent(BR.area(e.area), S.clock);
        G.D = { x: G.C.x + sc.x * px(40), y: G.C.y + sc.y * px(40) };
        if (G.hung) { G.hung = false; G.interest += 18; G.susp = Math.max(0, G.susp - 10); msg += 'He follows the sound. '; G.advance = 30; }
      } else if (action === 'closer') {
        const dx = G.pos.x - G.C.x, dy = G.pos.y - G.C.y, L = Math.hypot(dx, dy) || 1;
        G.C = { x: G.C.x + dx / L * px(30), y: G.C.y + dy / L * px(30) };
        const sc = BR.scent(BR.area(e.area), S.clock);
        G.D = { x: G.C.x + sc.x * px(40), y: G.C.y + sc.y * px(40) };
        if (terr(e, G.C).cover < 0.5 && r() < 0.55) return this.end({ kind: 'bust', cause: 'movement', yd: Math.round(yd(dist(G.pos, G.C))), terrain: terr(e, G.C).name, guide: true });
        if (r() < 0.5) { G.hung = false; G.interest += 15; msg += 'He hears you close and commits. '; G.advance = 25; }
      }
      // R13: pressure interrupts setups
      const pr = ch.pressure ? ch.pressure(S.day) : 0;
      if (r() < pr * 0.05) return this.end({ kind: 'bumped', cause: r() < 0.5 ? 'atv' : 'hunter', guide: true });
      G.interest = BR.clamp(G.interest, 0, 100); G.susp = BR.clamp(G.susp, 0, 100);
      const net = G.interest - G.susp;
      if (G.hung && !G.advance) msg += r() < 0.5 ? 'He’s still out there, bugling at nothing. ' : 'He’s hung up, waiting for the cow to show. ';
      else if (net > 15 || G.advance) {
        const step = px(G.advance || 20 + r() * 25); G.advance = 0;
        G.msg = msg.trim();
        if (this.walk(step)) return;
        if (!G.silent && bull.sex === 'bull' && r() < 0.5 + rut * 0.2) msg += 'He bugles back, closer.';
        else msg += G.silent ? '' : 'Brush cracks. He’s coming.';
      } else if (net < -10) { G.t = Math.max(0, G.t - 0.12); msg += 'Quiet. He’s drifting off.'; }
      else msg += G.silent ? '' : 'He answers but holds.';
      // hang-up: he stops short of where the cow should be when he can't see one
      const nowMe = yd(dist(G.pos, G.C));
      if (!G.hung && !G.passedHang && nowMe <= G.hangYd && G.t < G.closest.t - 0.04 && G.interest < 70) { G.hung = true; G.passedHang = true; msg += ` He hangs up at ${Math.round(nowMe / 5) * 5} yards. He can’t see a cow.`; }
      if (G.susp >= 80) return this.end({ kind: 'hangup', cause: 'overcall', yd: Math.round(nowMe), guide: true });
      if (G.t <= 0.001 && net < -20) return this.end({ kind: 'hangup', cause: G.pushed ? 'bugle' : 'interest', yd: Math.round(nowMe), guide: true });
      G.msg = msg.trim();
      if (this.scentCheck()) return;
      // close enough to Sam's lanes: switch to real time
      if (yd(dist(G.pos, G.sam)) <= 65 || G.t >= G.closest.t - 0.06) { this.goClose(); return; }
      this.after();
    },
    // he walks a few yards at a time, so nothing he does between calls is skipped
    walk(step) {
      const G = BR.S.enc.g, L = dist(G.B, G.D) || 1;
      for (let done = 0; done < step && G.t < 1; done += px(3)) {
        G.t = Math.min(1, G.t + Math.min(px(3), step - done) / L);
        G.pos = lerp(G.B, G.D, G.t);
        G.seen = G.seen || yd(Math.min(dist(G.pos, G.sam), dist(G.pos, G.C))) < (terr(BR.S.enc, G.pos).cover >= 0.5 ? 60 : 160);
        if (G.herd) { G.cows = []; for (let k = 0; k < Math.min(3, G.herd); k++) G.cows.push(lerp(G.B, G.D, Math.min(1, G.t + (0.05 + k * 0.03)))); }
        if (this.scentCheck()) return true;
        if (yd(dist(G.pos, G.sam)) <= 65 || G.t >= G.closest.t - 0.06) { this.goClose(); return true; }
      }
      return false;
    },
    // the bull smells whoever he gets downwind of
    scentCheck() {
      const S = BR.S, e = S.enc, G = e.g, sc = BR.scent(BR.area(e.area), S.clock);
      const pts = G.cows.concat([G.pos]);
      for (const who of ['sam', 'me']) {
        const at = who === 'sam' ? G.sam : G.C;
        for (const p of pts) {
          // the bull is scent-checking and winds you to 90 yd; a feeding cow only catches it close and straight downwind
          const dx = p.x - at.x, dy = p.y - at.y, d = Math.hypot(dx, dy), cow = p !== G.pos;
          if (d > 0 && yd(d) < (cow ? 45 : 90) && (sc.x * dx + sc.y * dy) / d > (cow ? 0.88 : 0.75)) {
            this.end({ kind: 'bust', cause: who === 'sam' ? 'samScent' : 'circled', yd: Math.round(yd(d)), thermal: sc.thermal, guide: true, past: G.t > G.closest.t, phase: G.phase, shifted: G.sc0 ? sc.x * G.sc0.x + sc.y * G.sc0.y < 0.5 : false, cow: p !== G.pos });
            return true;
          }
        }
      }
      return false;
    },
    goClose() {
      const G = BR.S.enc.g;
      G.phase = 'close'; G.seen = true; G.looking = false; G.lookT = 2; G.stopped = 0; G.drawn = false; G.drawing = 0; G.holdT = 0; G.paused = false;
      G.msg = G.herd ? 'Cows first. They’re feeding toward Sam with the bull behind them.' : 'Antlers in the timber. He’s coming to the sound.';
      BR.vibe(40);
      this.hud(); BR.draw(); BR.save();
      BR.animate();
    },
    after() { this.hud(); BR.draw(); BR.save(); },
    // ----- real-time phase -----
    signal(a) {
      const G = BR.S.enc.g, r = Math.random;
      if (a === 'draw' && !G.drawn && !G.drawing && !legalNow()) { const l = BR.ch().light; G.msg = `Sam shakes his head. “Not legal yet. Shooting light’s ${BR.fmt(BR.S.clock < l[0] ? l[0] : l[1])}.”`; this.upd(); return; }
      if (a === 'draw' && !G.drawn && !G.drawing) {
        G.drawing = client().drawTime + (yd(dist(G.sam, G.C)) > 100 ? 1.5 : 0);  // hand signals past 100 yd are slow to read
        // R6: drawing while he's looking at Sam, or with a cow on top of him, gets seen
        const q = G.q, ex = q.cover === 'open' ? 1.4 : q.cover === 'timber' ? 0.8 : 0.6;
        const cowNear = G.cows.some(c => yd(dist(c, G.sam)) < 30), d = yd(dist(G.pos, G.sam));
        const p = (G.looking && d < 60 ? 0.55 : d < 60 ? 0.05 : 0.02) * ex + (cowNear ? 0.45 : 0);
        G.drawLog = { looking: G.looking, cowNear, yd: Math.round(d) };
        if (r() < p) { this.end({ kind: 'bust', cause: cowNear ? 'cowSaw' : 'samSeen', yd: Math.round(d), guide: true }); return; }
        G.msg = 'You flick your hand. Sam comes to full draw.';
      } else if (a === 'mew' && !(G.stopped > 0)) {
        G.stopped = 3.5 + r() * 2.5; G.looking = true; G.lookAt = 'caller'; G.lookT = 1.6;
        G.mews = (G.mews || 0) + 1;
        G.msg = G.mews > 2 ? 'Another mew. He stares hard toward you.' : 'You mew. He stops and looks for the cow.';
        if (G.mews > 2) G.susp += 25;
      }
      this.upd();
    },
    tick(dt) {
      const S = BR.S, G = S.enc && S.enc.g;
      if (!G || G.phase !== 'close' || G.paused) return false;
      const r = Math.random, cl = client();
      BR.pass(dt / 6);  // ~10 game seconds per real second
      // Sam
      if (G.drawing) { G.drawing -= dt; if (G.drawing <= 0) { G.drawing = 0; G.drawn = true; G.holdT = 0; BR.vibe(12); } }
      if (G.drawn) {
        G.holdT += dt;
        if (G.holdT > cl.hold) { G.drawn = false; G.letDowns = (G.letDowns || 0) + 1; G.msg = 'Sam’s arms give out. He lets down.'; if (yd(dist(G.pos, G.sam)) < 40 && G.looking && r() < 0.4) return this.end({ kind: 'bust', cause: 'samSeen', yd: this.yardsTo(G.sam), guide: true }); }
      }
      // the bull: head up, head down; stops when you mew
      G.lookT -= dt;
      if (G.lookT <= 0) { G.looking = !G.looking; G.lookAt = G.looking && G.q.cover === 'open' && r() < 0.5 ? 'sam' : 'around'; G.lookT = G.looking ? 1.2 + r() * 1.6 : 1.8 + r() * 2.6; }
      if (G.stopped > 0) G.stopped -= dt;
      else {
        const L = dist(G.B, G.D) || 1, speed = px(1.4) * (G.silent ? 0.8 : 1);
        G.t = Math.min(1, G.t + speed * dt / L);
        G.pos = lerp(G.B, G.D, G.t);
        if (G.herd) G.cows = G.cows.map((c, k) => lerp(G.B, G.D, Math.min(1, G.t + 0.05 + k * 0.03)));
      }
      const d = yd(dist(G.pos, G.sam)), range = cl.range;
      // Sam shoots: stopped in his lane, or (sometimes) walking when he's about to leave the ring
      const leaving = G.t > G.closest.t && d > range - 4;
      G.closeT = (G.closeT || 0) + dt;
      if (G.closeT > 150) return this.end({ kind: 'hangup', cause: 'interest', yd: Math.round(d), guide: true });  // he loses interest and feeds off
      if (G.drawn && d <= range && legalNow() && (G.stopped > 0.3 || (leaving && r() < dt * 1.2))) return this.shoot(d, G.stopped <= 0.3);
      if (G.t >= 1) return this.scentCheck() ? false : this.end({ kind: 'bust', cause: 'circled', yd: Math.round(yd(dist(G.pos, G.C))), guide: true });
      if (G.t > G.closest.t + 0.12 && d > range + 15) { G.phase = 'call'; G.msg = `He walked past Sam at ${Math.round(yd(G.closest.d))} yards, out of his range. He’s getting below you.`; G.drawn = false; this.after(); return false; }
      if (this.scentCheck()) return false;
      this.upd();
      return true;
    },
    shoot(d, walking) {
      const S = BR.S, e = S.enc, G = e.g, r = Math.random, nervy = (G.animal.sex === 'bull' ? 0.12 : 0.04) + (G.animal.pts >= 6 ? 0.05 : 0);
      const shake = G.holdT > client().hold * 0.66 ? 0.15 : 0, skill = (S.guideSkill || 0) * 0.05;
      const lanes = G.q.lanes, blocked = r() > 0.35 + lanes * 0.65;
      const dx = G.D.x - G.B.x, dy = G.D.y - G.B.y, sx = G.sam.x - G.pos.x, sy = G.sam.y - G.pos.y, dot = (dx * sx + dy * sy) / ((Math.hypot(dx, dy) * Math.hypot(sx, sy)) || 1);
      const angle = dot > 0.5 ? 'quartering-to' : dot < -0.5 ? 'quartering-away' : 'broadside';
      const p = 0.97 - Math.max(0, d - 20) * 0.01 - (walking ? 0.4 : 0) - nervy - shake + skill - (angle === 'quartering-to' ? 0.25 : 0);
      let zone;
      if (blocked && r() < 0.6) zone = 'miss';
      else if (r() < p) zone = r() < 0.15 ? 'heart' : 'vitals';
      else if (walking) zone = ['liver', 'paunch', 'paunch', 'ham'][(r() * 4) | 0];
      else zone = ['miss', 'miss', 'miss', 'shoulder', 'liver', 'paunch'][(r() * 6) | 0];
      if (angle === 'quartering-to' && zone === 'vitals' && r() < 0.35) zone = 'shoulder';
      const deflected = blocked && zone === 'miss';
      S.stats.shots++;
      e.shotResult = {
        animal: G.animal, sp: 'elk', zone, range: Math.round(d), est: Math.round(d), weapon: 'bow', held: null, ke: 48, fatigue: +(G.holdT / client().hold).toFixed(2),
        angle, from: 'call', high: r() < 0.5, wind: 0, windHeld: 0, gr: 600, blades: true, guide: true, deflected, walking, clock: +S.clock.toFixed(3)
      };
      BR.log('samShot', { yd: Math.round(d), walking, zone, angle, holdT: +G.holdT.toFixed(1) });
      G.phase = 'shot';
      BR.go('samShot');
      return false;
    },
    end(o) {
      const S = BR.S, G = S.enc.g;
      if (G) { G.phase = 'done'; G.drawn = false; }
      if (o.kind === 'bust') { S.stats.busts++; BR.vibe(160); }
      BR.log(o.kind, Object.assign({ via: 'guide' }, o));
      BR.go('outcome', o);
      return false;
    },
    back() {
      const G = BR.S.enc.g; if (G.phase === 'close') G.paused = true;
      BR.confirm('Leave this setup?', 'Wave Sam in and head back to camp.', 'Leave', () => this.act('leave'));
    }
  };

  // ---------------- Sam's shot, over his shoulder ----------------
  const REACT = {
    heart: 'He mule-kicks and tears off in a dead sprint.', vitals: 'He bucks at the hit and runs hard.', liver: 'He hunches up and walks off slow, uphill.',
    paunch: 'He hunches, tail clamped, and walks off.', shoulder: 'He lunges forward, the arrow wagging out of his shoulder.', ham: 'He kicks out behind and runs.',
    spine: 'He drops hard at the shot.', neck: 'He jerks his head and trots off.', miss: 'The arrow sails past. He jumps, looks around, and trots off.'
  };
  BR.samReaction = z => REACT[z] || REACT.vitals;
  BR.scenes.samShot = {
    enter() {
      const e = BR.S.enc, res = e.shotResult; if (!res) { BR.endHunt(); return; }
      this.flip = Math.random() < 0.5;
      this.scale = BR.clamp(34 / res.range, 0.3, 1.1);
      this.spr = BR.SPR.get(res.animal, 'stand', this.scale, { flip: this.flip });
      this.t = 0; this.done = false;
      this.hud();
      BR.animate();
    },
    exit() { BR.stop(); },
    tick(dt) { this.t += dt; if (this.t > 0.9) { this.done = true; this.hud(); return false; } return true; },
    resume() { if (!this.done) BR.animate(); },
    target() {
      const res = BR.S.enc.shotResult, z = BR.SPR.vitals('elk'), s = this.spr, fs = this.flip ? -1 : 1;
      const W0 = { vitals: [z.vit[0], z.vit[1]], heart: z.heart, liver: [z.liver[0] - 2, -46], paunch: [-12, -40], ham: [z.hamX - 4, -48], shoulder: [26, -50], spine: [0, z.spineY - 2], neck: [z.neckX + 4, -62], miss: [8, -78] }[res.zone] || z.vit;
      const dx = Math.round(Math.min(W / 2 + 34 - (s.x0 + s.x1) / 2, W - 6 - s.x1)), dy = 208 - s.gy;
      return { dx, dy, x: dx + s.cx + W0[0] * s.px * fs, y: dy + s.gy + W0[1] * s.px };
    },
    draw(g) {
      g.drawImage(BR.archery.meadowBg(false, BR.ch().look), 0, 0);
      const tg = this.target(), res = BR.S.enc.shotResult, ran = this.t > 0.45 && res.zone !== 'spine';
      g.drawImage(this.spr.canvas, tg.dx + (ran ? (this.flip ? 1 : -1) * (this.t - 0.45) * 90 : 0), tg.dy);
      BR.person(g, 'sam', this.t < 0.25 ? 'draw' : 'bow', 46, 345, 2.4);
      if (this.t >= 0.2 && this.t < 0.45) {
        const k = (this.t - 0.2) / 0.25, sx = 92, sy = 215, ex = tg.x + (ran ? 0 : 0), ey = tg.y;
        R(g, sx + (ex - sx) * k, sy + (ey - sy) * k, 3, 1, '#d8cfb8');
      }
      if (this.t >= 0.4 && this.t < 0.6 && res.zone !== 'miss') { R(g, tg.x - 1, tg.y - 1, 3, 3, P.bone); R(g, tg.x, tg.y, 1, 1, P.blood); }
    },
    hud() {
      const S = BR.S, res = S.enc.shotResult;
      BR.hud(`
        <div class="row"><span class="t">SAM’S SHOT · ${res.range} YD</span><span class="hi">${res.walking ? 'walking' : 'stopped'} · ${res.angle}</span></div>
        <div class="quote">${this.done ? BR.esc(BR.samReaction(res.zone)) : 'Sam settles his pin behind the shoulder…'}</div>
        <div class="sp"></div>
        ${this.done ? BR.btn('go', res.zone === 'miss' ? 'Watch him go' : 'Mark where he went', 'go') : ''}`);
    },
    act() {
      const res = BR.S.enc.shotResult; if (!this.done) return;
      if (res.zone === 'miss') { BR.log('miss', res); BR.go('outcome', { kind: 'miss', high: res.high, range: res.range, weapon: 'bow', deflected: res.deflected, guide: true }); }
      else BR.go('recover');
    },
    back() { this.act(); }
  };
})();

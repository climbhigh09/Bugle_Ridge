// Bugle Ridge — the shot (hold to draw, slide to settle, lift to release) and recovery (read the sign, pick the wait, follow blood).
(function () {
  const BR = window.BR, { P, W, H, R } = BR;
  const FRONT = BR.pad([
    'A.A......A.A', '.aa.a..a.aa.', '..aaa..aaa..', '...nnhhnn...', '....hhhh....', '....ehhe....', '....hhhh....', '....hmmh....',
    '..bbnnnnbb..', '.bBbnnnnbBb.', '.bBbbddbbBb.', '.bbbbddbbbb.', '..sbbbbbbs..', '..l......l..', '..l......l..', '..k......k..'
  ], 12);
  // pin colours live in BR.PIN_COLS (core.js) so the sight, the range, and every legend agree
  const GAP = 6;
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
  const ANGLE = { broadside: 'broadside', 'quartering-to': 'quartering to you', 'quartering-away': 'quartering away', facing: 'facing you' };

  function zoneAt(angle, sx, sy) {
    if (angle === 'facing') {
      if (sy >= 13) return (sx >= 1.5 && sx <= 3.5) || (sx >= 8.5 && sx <= 10.5) ? 'leg' : 'miss';
      if (sy < 3) return 'miss';
      if (sy < 8.5) return sx >= 3 && sx <= 9 ? 'neck' : 'miss';
      if (Math.hypot(sx - 6, (sy - 10.5) * 1.1) < 1.1) return 'vitals';
      return sx >= 1 && sx < 11 && sy < 13 ? 'shoulder' : 'miss';
    }
    const vx = angle === 'quartering-away' ? 10.3 : angle === 'quartering-to' ? 11.8 : 11.2;
    if (sy >= 13 && sy < 16) return (sx >= 2 && sx < 6) || (sx >= 12 && sx < 16) ? 'leg' : 'miss';
    if (sy >= 4 && sy < 8 && sx >= 12 && sx < 20) return 'neck';
    if (sy < 8 || sy >= 13 || sx < 1 || sx >= 15) return 'miss';
    if (sy < 8.8 && sx >= 2) return 'spine';
    if (Math.hypot(sx - (vx + 0.6), (sy - 12) * 1.3) < 0.8) return 'heart';
    if (Math.hypot((sx - vx) / 1.9, (sy - 10.8) / 1.5) < 1) return angle === 'quartering-to' && sx > vx - 0.2 && sy < 11.5 ? 'shoulder' : 'vitals';
    if ((sy < 10.4 && sx >= vx + 0.8) || sx >= 12.5) return 'shoulder';
    if (angle === 'quartering-to' && sx >= 10.4 && sy < 11.6) return 'shoulder';
    if (sx >= vx - 2.8 && sx < vx - 1.3) return angle === 'quartering-away' ? 'vitals' : 'liver';
    return sx >= 4.5 ? 'paunch' : 'ham';
  }

  function meadowBg(timber) {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const o = c.getContext('2d');
    if (timber) {
      BR.bands(o, [[0, '#0b130e'], [110, '#15221a'], [160, '#1b2a1f']]);
      for (let Y = 0; Y < 160; Y++) for (let X = 0; X < W; X++) {
        const s = (X + Y * 0.55) % 60;
        if (s < 9 && BR.BAYER[(Y & 3) * 4 + (X & 3)] < 0.4 * (1 - Math.abs(s - 4.5) / 4.5)) R(o, X, Y, 1, 1, '#2f4533');
      }
      for (let X = -4; X < W; X += 7) BR.pine(o, X, 150 + ((X * 3) % 8), 60 + ((X * 7) % 20), '#1a2c20');
      for (let X = 3; X < W; X += 14) BR.pine(o, X, 162 + ((X * 5) % 6), 90 + ((X * 11) % 20), '#132219');
      BR.bands(o, [[158, '#26321f'], [H, '#141c12']]);
      BR.grass(o, 159, 1100, 3, ['#2e3824', '#3e3726', '#1a2316', '#4a4030']);
    } else {
      BR.bands(o, [[0, '#2a2946'], [40, P.dawn], [70, '#9a5d52'], [86, P.glow]]);
      BR.ridge(o, 72, 10, 0.03, 2.4, BR.mix(P.far2, P.dawn, 0.5));
      BR.ridge(o, 88, 7, 0.04, 0.8, P.far2);
      for (let X = 0; X < W + 4; X += 5) BR.pine(o, X, 152, 26 + ((X * 11) % 16), P.timber);
      [[22, 140], [30, 143], [138, 139], [147, 142], [156, 140]].forEach(([x, y]) => BR.aspen(o, x, y, 5));
      BR.bands(o, [[150, '#56673f'], [200, P.meadow], [H, '#34422c']]);
      BR.grass(o, 151, 1400, 21, [P.meadow2, P.meadowD, P.meadow3, '#7a7a4e']);
      for (let X = 0; X < W; X += 2) { const hh = 4 + ((X * 7) % 9); R(o, X, H - hh, 1, hh, X & 2 ? '#26301f' : '#1d2618'); }
    }
    return c;
  }
  let mask = null;
  function peepMask() {
    if (mask) return mask;
    mask = document.createElement('canvas'); mask.width = W * 2; mask.height = H * 2;
    const o = mask.getContext('2d');
    for (let Y = 0; Y < H * 2; Y++) for (let X = (Y & 1); X < W * 2; X += 2) if (Math.hypot(X - W, Y - H) > 34) R(o, X, Y, 1, 1, P.ink);
    return mask;
  }
  // peep view + pin housing: each pin sits where an arrow at that yardage lands; level bubble follows sway
  function drawSight(g, hx, hy, pins, mid, k, swx) {
    g.drawImage(peepMask(), hx - W, hy - H);
    BR.ring(g, hx, hy, 16, P.ink, 3); BR.ring(g, hx, hy, 17, P.ink, 3);
    pins.forEach(pin => {
      const py = Math.round(hy + (pin - mid) / 10 * GAP * k);
      R(g, hx - 15, py, 14, 1, P.ink);
      R(g, hx - 1, py, 2, 2, BR.PIN_COLS[pin]);
    });
    R(g, hx - 5, hy + 12, 11, 3, P.ink); R(g, hx - 4, hy + 13, 9, 1, '#2f4a33'); R(g, hx + Math.round(swx), hy + 13, 2, 1, P.bone);
  }
  BR.archery = { GAP, gauss, zoneAt, meadowBg, peepMask, drawSight };

  BR.scenes.shot = {
    enter() {
      const S = BR.S, e = S.enc, sh = e.shot, bow = BR.bow();
      this.bow = bow;
      this.pins = bow.pins;
      this.mid = bow.pins[(bow.pins.length - 1) >> 1];
      this.k = bow.fps > 255 ? 0.85 : 1;
      this.bg = meadowBg(sh.from === 'call');
      this.front = sh.angle === 'facing';
      this.s = BR.clamp(Math.round(110 / sh.range), 1, 5);
      this.sw = (this.front ? 12 : 22) * this.s;
      this.flip = !this.front && Math.random() < 0.5;
      this.ex = Math.round(W / 2 - this.sw / 2 + 6);
      this.ey = 156 - 16 * this.s;
      const vs = this.front ? { x: 6, y: 10.5 } : { x: this.flip ? 22 - 11.2 : 11.2, y: 10.8 };
      this.vit = { x: this.ex + vs.x * this.s, y: this.ey + vs.y * this.s };
      this.aim = { x: W / 2 + (Math.random() - 0.5) * 30, y: this.vit.y - 18 + Math.random() * 10 };
      if (sh.est == null) sh.est = S.items.rangefinder ? sh.range : Math.round(sh.range * (1 + (Math.random() - 0.5) * 0.3) / 5) * 5;
      this.phase = 'ready'; this.t = 0; this.holdT = 0; this.last = null;
      this.window = Math.max(3, (sh.from === 'call' ? 4 + Math.random() * 5 : 5 + Math.random() * 6) - (sh.alert || 0) / 25);
      this.drawTime = 0.5 + Math.max(0, bow.lb - 50 - S.strength * 4) * 0.04;
      this.budget = Math.max(3, 7 + S.strength * 2 - Math.max(0, bow.lb - 55) * 0.35 - (bow.lb > 55 && S.strength < 1 ? 2 : 0));
      this.msg = 'Hold on the elk to draw. Slide to settle. Lift to shoot.';
      this.hud();
      BR.animate();
    },
    resume() { BR.animate(); },
    fatigue() { return this.phase === 'full' ? BR.clamp(this.holdT / this.budget, 0, 1.3) : 0; },
    sway() {
      if (this.phase !== 'full') return { x: 0, y: 0 };
      const S = BR.S, f = this.fatigue(), buck = BR.clamp(1 - this.holdT / 3, 0, 1) * (S.enc.shot.bull ? 1.4 : 0.6);
      const amp = Math.max(0.3, 0.7 - S.strength * 0.12) + f * f * 3.5 + buck, t = this.holdT;
      return { x: amp * (Math.sin(t * 1.7) + 0.5 * Math.sin(t * 4.3)), y: amp * 0.8 * (Math.sin(t * 1.3 + 1) + 0.4 * Math.sin(t * 5.1)) };
    },
    tick(dt) {
      if (this.phase === 'done') return false;
      const S = BR.S, sh = S.enc.shot;
      if (this.phase === 'flight') { this.t += dt; if (this.t > 0.7) { this.resolve(); return false; } return true; }
      this.window -= dt;
      if (this.window <= 0) {
        if (Math.random() < 0.45 && this.phase === 'ready') {
          const opts = ['broadside', 'quartering-away', 'quartering-to'];
          sh.angle = opts[(Math.random() * opts.length) | 0];
          this.phase = 'done';
          BR.go('shot');
          return false;
        }
        return this.finish({ kind: 'walked' });
      }
      if (this.phase === 'drawing') {
        this.t += dt;
        if (this.t >= this.drawTime) { this.phase = 'full'; this.holdT = 0; BR.vibe(12); }
      } else if (this.phase === 'full') {
        this.holdT += dt;
        if (this.holdT > this.budget + 1.5) { this.phase = 'ready'; this.msg = 'Your arms gave out. You let down.'; this.spotCheck(0.6); }
      }
      this.upd();
      return true;
    },
    spotCheck(mult) {
      const sh = BR.S.enc.shot;
      const p = ({ facing: 0.35, 'quartering-to': 0.2, broadside: 0.06, 'quartering-away': 0.02 }[sh.angle]) * (0.5 + (sh.alert || 0) / 100) * mult * (sh.range < 40 ? 1.3 : 0.8);
      if (Math.random() < p) { BR.S.stats.busts++; this.finish({ kind: 'bust', cause: 'drew', angle: sh.angle, yd: sh.range }); return true; }
      return false;
    },
    down(p) {
      if (this.phase !== 'ready') return;
      this.last = p;
      this.phase = 'drawing'; this.t = 0;
      this.spotCheck(1);
    },
    move(p) {
      if (!this.last || (this.phase !== 'drawing' && this.phase !== 'full')) return;
      this.aim.x = BR.clamp(this.aim.x + (p.x - this.last.x) * 0.6, 10, W - 10);
      this.aim.y = BR.clamp(this.aim.y + (p.y - this.last.y) * 0.6, 10, H - 10);
      this.last = p;
    },
    up() {
      this.last = null;
      if (this.phase === 'drawing') { this.phase = 'ready'; this.msg = 'You let down before full draw.'; }
      else if (this.phase === 'full') this.release();
    },
    release() {
      const S = BR.S, sh = S.enc.shot, sw = this.sway(), disp = 0.6 * (sh.range / 30);
      const hx = this.aim.x + sw.x, hy = this.aim.y + sw.y;
      const ix = hx + gauss() * disp, iy = hy + (sh.range - this.mid) / 10 * GAP * this.k + gauss() * disp;
      let sx = (ix - this.ex) / this.s; const sy = (iy - this.ey) / this.s;
      if (this.flip) sx = 22 - sx;
      const zone = zoneAt(sh.angle, sx, sy);
      let pinUsed = this.pins[0], bd = 1e9;
      this.pins.forEach(pin => { const py = hy + (pin - this.mid) / 10 * GAP * this.k; const d = Math.abs(py - this.vit.y); if (d < bd) { bd = d; pinUsed = pin; } });
      S.stats.shots++;
      S.enc.shotResult = {
        zone, range: sh.range, est: sh.est, pinUsed, fatigue: +this.fatigue().toFixed(2), angle: sh.angle, bull: sh.bull,
        ke: BR.ke(this.bow), gr: this.bow.gr, blades: !!S.items.fixedBlades, high: iy < this.vit.y, from: sh.from
      };
      this.impact = { x: ix, y: iy };
      this.phase = 'flight'; this.t = 0;
      BR.vibe(30);
    },
    resolve() {
      const r = BR.S.enc.shotResult;
      this.phase = 'done';
      if (r.zone === 'miss') { BR.log('miss', r); BR.go('outcome', { kind: 'miss', high: r.high, range: r.range }); }
      else BR.go('recover');
    },
    finish(o) {
      this.phase = 'done';
      const sh = BR.S.enc.shot;
      BR.log(o.kind, Object.assign({ range: sh.range, angle: sh.angle }, o));
      BR.go('outcome', o);
      return false;
    },
    draw(g) {
      const S = BR.S, sh = S.enc.shot;
      g.drawImage(this.bg, 0, 0);
      const ran = this.phase === 'flight' && this.t > 0.25;
      if (this.front) BR.sprite(g, FRONT, BR.ECOL, this.ex, this.ey, this.s, false, sh.bull ? '' : 'aA');
      else BR.sprite(g, BR.ELK, BR.ECOL, this.ex + (ran ? (this.flip ? -1 : 1) * this.t * 40 : 0), this.ey, this.s, this.flip, sh.bull ? '' : 'aA');
      if (this.phase === 'flight') { if (this.t < 0.35) { R(g, this.impact.x - 1, this.impact.y - 1, 3, 3, P.bone); R(g, this.impact.x, this.impact.y, 1, 1, P.blood); } return; }
      if (this.phase === 'ready') {
        R(g, W / 2 - 1, H - 40, 2, 40, '#3b2a1c');
        return;
      }
      const sw = this.sway(), rise = this.phase === 'drawing' ? (1 - this.t / this.drawTime) * 90 : 0;
      const hx = Math.round(this.aim.x + sw.x), hy = Math.round(this.aim.y + sw.y + rise);
      drawSight(g, hx, hy, this.pins, this.mid, this.k, sw.x);
    },
    hud() {
      BR.hud(`
        <div class="row"><span class="t" id="sh-range"></span><span class="dim" id="sh-angle"></span></div>
        <div class="row"><span>HOLD</span><span id="sh-hold"></span></div>
        <div class="row sm"><span id="sh-msg" class="dim"></span></div>
        <div class="row sm"><span class="dim" id="sh-bow"></span></div>
        <div class="sp"></div>
        <div class="g2">${BR.btn('wait', 'Wait for a better angle')}${BR.btn('pass', 'Let him walk')}</div>`);
      this.upd();
    },
    upd() {
      const $ = id => document.getElementById(id); if (!$('sh-range')) return;
      const S = BR.S, sh = S.enc.shot;
      $('sh-range').textContent = S.items.rangefinder ? `${sh.range} yd · ${sh.bull ? 'BULL' : 'COW'}` : `About ${sh.est} yd? · ${sh.bull ? 'BULL' : 'COW'}`;
      $('sh-angle').textContent = ANGLE[sh.angle];
      const left = this.phase === 'full' ? BR.clamp(1 - this.holdT / this.budget, 0, 1) : 1;
      $('sh-hold').innerHTML = BR.meter(Math.ceil(left * 5), 5, left < 0.3 ? 'bad' : left < 0.6 ? 'warn' : '');
      $('sh-msg').textContent = this.phase === 'full' ? (this.fatigue() > 0.8 ? 'Pin’s swimming. Shoot or let down.' : 'Settle the pin. Lift to shoot.') : this.phase === 'drawing' ? 'Drawing…' : this.msg;
      $('sh-bow').innerHTML = `PINS ${BR.pinLegend(this.pins)}`;
    },
    act(a) {
      const sh = BR.S.enc.shot;
      if (this.phase !== 'ready') return;
      if (a === 'pass') {
        const bad = sh.angle === 'facing' || sh.angle === 'quartering-to' || sh.range > Math.max(...this.pins) + 10;
        this.finish({ kind: 'passed', good: bad });
      } else if (a === 'wait') {
        const r = Math.random();
        BR.pass(1);
        if (r < 0.4) { sh.angle = 'broadside'; this.phase = 'done'; BR.go('shot'); }
        else if (r < 0.75) { this.msg = 'He holds the same angle.'; this.window = Math.max(this.window - 1.5, 1); this.upd(); }
        else this.finish({ kind: 'walked' });
      }
    },
    back() {
      if (this.phase === 'flight' || this.phase === 'done') return;
      this.phase = 'ready'; this.last = null;
      BR.confirm('Let him walk?', 'Lower your bow and let this one go.', 'Let him walk', () => this.act('pass'));
    }
  };

  // ---------------- RECOVERY ----------------
  function model(res) {
    const ke = res.ke, blades = res.blades, r = Math.random();
    switch (res.zone) {
      case 'heart': return { sign: 'Bright red blood, heavy spray. You heard him crash inside 80 yards.', need: 0, lethal: 1, trail: 6 };
      case 'vitals': return { sign: 'Pink, frothy blood with tiny bubbles on the arrow.', need: 0.5, lethal: 1, trail: 9 };
      case 'liver': return { sign: 'Dark red blood on the arrow. No bubbles.', need: 4, lethal: 0.95, trail: 12 };
      case 'paunch': return { sign: 'Green-brown matter and a sour smell on the arrow.', need: 8, lethal: 0.85, trail: 14 };
      case 'shoulder':
        if (ke >= 65 && blades) return { sign: 'Arrow buried through the shoulder. Bright blood right away.', need: 1, lethal: 0.9, trail: 10 };
        if (ke >= 65) return { sign: 'Arrow snapped off 8 inches deep. Some bright blood.', need: 4, lethal: 0.5, trail: 12 };
        if (blades) return { sign: 'Broken arrow. Maybe 5 inches of blood on the shaft.', need: 4, lethal: 0.25, trail: 12 };
        return { sign: 'Arrow bounced out. Two inches of blood on the tip and a folded blade.', need: 4, lethal: 0.05, trail: 10 };
      case 'spine': return r < 0.35
        ? { sign: 'He dropped where he stood. You put a follow-up arrow in him.', need: 0, lethal: 1, trail: 2 }
        : { sign: 'Tan hair cut high, little blood. The arrow went over his lungs.', need: 2, lethal: 0.05, trail: 8 };
      case 'neck': return { sign: 'Neck hair and bright blood, but not much of it.', need: 2, lethal: 0.25, trail: 10 };
      case 'ham': return { sign: 'Bright blood and pale rump hair.', need: 2, lethal: 0.2, trail: 11 };
      default: return { sign: 'Bone chips and a little blood. He ran off sound.', need: 2, lethal: 0.02, trail: 9 };
    }
  }

  BR.scenes.recover = {
    enter() {
      const S = BR.S, e = S.enc;
      if (!e.rec) {
        const m = model(e.shotResult), seed = (Math.random() * 1e6) | 0, r = BR.rng(seed), pts = [];
        let x = 90, y = 228;
        for (let i = 0; i < m.trail; i++) { pts.push({ x: Math.round(x), y: Math.round(y) }); x = BR.clamp(x + (r() - 0.5) * 40, 16, W - 16); y -= 200 / m.trail; }
        e.rec = { m, lethal: Math.random() < m.lethal, phase: 'sign', waited: 0, found: 0, pts, seed, stop: m.trail };
      }
      this.bg = this.ground(e.rec.seed);
      this.startPulse();
      this.hud();
    },
    // Only the first drop pulses (2 redraws a second until it's tapped). After that you're on your own.
    startPulse() {
      clearInterval(this.pulseTimer); this.pulseTimer = null;
      const rec = BR.S.enc.rec;
      if (rec.phase !== 'track' || rec.found > 0) return;
      this.pulseOn = true;
      this.pulseTimer = setInterval(() => { this.pulseOn = !this.pulseOn; BR.draw(); }, 450);
    },
    exit() { clearInterval(this.pulseTimer); this.pulseTimer = null; },
    ground(seed) {
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const o = c.getContext('2d');
      R(o, 0, 0, W, H, P.meadow);
      BR.grass(o, 0, 2600, seed, [P.meadow2, P.meadowD, P.meadow3, '#394530']);
      for (let X = -3; X < W + 4; X += 7) BR.pine(o, X, 22 + ((X * 7) % 6), 22 + ((X * 3) % 8), P.timber, P.tree);
      return c;
    },
    draw(g) {
      const rec = BR.S.enc.rec;
      g.drawImage(this.bg, 0, 0);
      if (rec.phase === 'sign') {
        R(g, 70, 150, 40, 1, '#d8cfb8'); R(g, 108, 149, 3, 3, P.amber);
        const col = { vitals: '#e0707a', heart: P.blood, liver: '#6a2a28', paunch: '#6b6a3a' }[BR.S.enc.shotResult.zone] || P.blood;
        R(g, 72, 150, 14, 1, col); R(g, 74, 151, 6, 1, col);
        return;
      }
      for (let i = 0; i < Math.min(rec.found, rec.pts.length); i++) {
        const p = rec.pts[i];
        R(g, p.x, p.y, 2, 1, P.blood); R(g, p.x + 3, p.y + 2, 1, 1, P.blood);
      }
      const nxt = rec.pts[rec.found];
      if (rec.phase === 'track' && nxt && rec.found < rec.stop) {
        if (rec.found > 0) R(g, nxt.x, nxt.y, 1, 1, '#8a3a36');
        else if (this.pulseOn) { R(g, nxt.x - 3, nxt.y - 3, 7, 7, '#3a1614'); R(g, nxt.x - 2, nxt.y - 2, 5, 5, '#7a2622'); R(g, nxt.x - 1, nxt.y - 1, 3, 3, '#e0504a'); }
        else R(g, nxt.x - 1, nxt.y - 1, 2, 2, P.blood);
      }
      if (rec.phase === 'found') { const p = rec.pts[rec.pts.length - 1]; BR.sprite(g, BR.ELK, BR.ECOL, p.x - 22, p.y - 26, 2, false, BR.S.enc.shotResult.bull ? 'lk' : 'lkaA'); }
    },
    up(p) {
      const S = BR.S, rec = S.enc.rec;
      if (rec.phase !== 'track') return;
      const nxt = rec.pts[rec.found];
      if (nxt && Math.hypot(p.x - nxt.x, p.y - nxt.y) < 12) {
        rec.found++; BR.vibe(10);
        clearInterval(this.pulseTimer); this.pulseTimer = null;
        if (rec.found >= rec.pts.length) { rec.phase = 'found'; BR.vibe(80); }
        else if (rec.found >= rec.stop) rec.phase = 'dry';
      } else { BR.pass(2); this.msg = 'No sign there.'; }
      BR.draw(); this.hud(); BR.save();
    },
    hud() {
      const S = BR.S, e = S.enc, rec = e.rec, res = e.shotResult;
      let body;
      if (rec.phase === 'sign') {
        body = `<div class="row"><span class="t">ARROW HIT · ${res.range} YD</span><span class="hi">${BR.fmt(S.clock)}</span></div>
          <div class="quote">${rec.m.sign}</div>
          <div class="tagline">Read the sign, then decide how long to let him lie down.</div>
          <div class="sp"></div>
          <div class="g2">${BR.btn('wait', 'Track now', '', 0)}${BR.btn('wait', 'Wait 30 min', '', 0.5)}${BR.btn('wait', 'Wait 4 hours', '', 4)}${BR.btn('wait', 'Back at first light', '', 9)}</div>`;
      } else if (rec.phase === 'track') {
        const first = rec.found === 0;
        body = `<div class="row"><span class="t">BLOOD TRAIL</span><span class="hi">${rec.found} drop${rec.found === 1 ? '' : 's'} found</span></div>
          <div class="quote">${first ? 'He ran off. Tap the pulsing drop of blood to start trailing him.' : 'Find and tap the next drop of blood.'}</div>
          <div class="row sm"><span class="${this.msg ? 'toast' : 'dim'}">${this.msg || (first ? 'Each drop you find leads to the next one.' : 'Look close. Some drops are a single speck.')}</span></div><div class="sp"></div>`;
        this.msg = null;
      } else if (rec.phase === 'dry') {
        body = `<div class="row"><span class="t bad">THE BLOOD’S RUN OUT</span><span class="hi">${BR.fmt(S.clock)}</span></div>
          <div class="tagline">No more sign. You can grid-search the timber or call it.</div><div class="sp"></div>
          ${BR.btn('grid', 'Grid-search for 2 hours', 'go')}${BR.btn('lost', 'Mark it and head back', '')}`;
      } else {
        const meat = res.bull ? 230 : 170, trips = Math.ceil(meat / 80), miles = BR.AREAS[e.area].miles, hrs = Math.round(trips * miles * 2 / 1.5);
        body = `<div class="row"><span class="t ok">${res.bull ? 'BULL DOWN' : 'COW DOWN'}</span><span class="hi">${BR.fmt(S.clock)}</span></div>
          <div class="quote">There he is. ${res.range} yards, ${res.zone === 'vitals' ? 'double lung' : res.zone}.</div>
          <div class="row sm"><span>PACK-OUT</span><span class="hi">≈${meat} lb boned</span></div>
          <div class="row sm dim"><span>${trips} trips · ${miles} mi each way · ≈${hrs} hours</span></div>
          <div class="sp"></div>${BR.btn('pack', 'Quarter him and start packing', 'go')}`;
      }
      BR.hud(body);
    },
    act(a, arg) {
      const S = BR.S, e = S.enc, rec = e.rec, res = e.shotResult;
      if (a === 'wait') {
        const h = +arg;
        rec.waited = h; BR.pass(h * 60);
        const pushed = h < rec.m.need;
        const found = rec.lethal && (!pushed || Math.random() < (rec.m.need >= 4 ? 0.25 : 0.85));
        rec.pushed = pushed;
        if (!found) rec.stop = Math.max(2, Math.floor(rec.pts.length * 0.6));
        rec.phase = 'track';
        if (h >= 4 && S.part === 'morning') S.part = 'evening';
        this.startPulse();
      } else if (a === 'grid') {
        BR.pass(120);
        if (rec.lethal && Math.random() < 0.15) { rec.found = rec.pts.length; rec.phase = 'found'; }
        else return this.lose();
      } else if (a === 'lost') return this.lose();
      else if (a === 'pack') {
        S.tag = { bull: res.bull, day: S.day, zone: res.zone, range: res.range, area: e.area };
        BR.log('kill', Object.assign({ waited: rec.waited, pushed: rec.pushed }, res));
        S.part = 'evening';
        BR.endHunt();
        return;
      }
      BR.draw(); this.hud(); BR.save();
    },
    lose() {
      const S = BR.S, e = S.enc, rec = e.rec;
      S.stats.wounds++;
      BR.log('lost', Object.assign({ waited: rec.waited, need: rec.m.need, pushed: !!rec.pushed }, e.shotResult));
      BR.go('outcome', { kind: 'lost', zone: e.shotResult.zone });
    },
    back() {
      if (BR.S.enc.rec.phase === 'found') return;
      BR.confirm('Give up on him?', 'Mark the spot and head back. He’s lost.', 'Give up', () => this.lose());
    }
  };
})();

// Bugle Ridge — the shot (bow: hold to draw, settle a pin, lift to release · rifle: hold to shoulder, settle the crosshair or a hash mark, lift to fire)
// and recovery (read the sign, pick the wait, follow blood, walk up and tag). No ID help: what you see in the sight is what you get.
(function () {
  const BR = window.BR, { P, W, H, R } = BR;
  const GAP = 6, GROUND = 156;
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
  const ANGLE = { broadside: 'broadside', 'quartering-to': 'quartering to you', 'quartering-away': 'quartering away' };

  const bgCache = {};
  function meadowBg(timber, look) {
    const key = (timber ? 't' : 'm') + look;
    if (bgCache[key]) return bgCache[key];
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const o = c.getContext('2d'); o.imageSmoothingEnabled = false;
    const snow = look === 'snow', breaks = look === 'breaks', ak = look === 'ak';
    if (timber) {
      BR.bands(o, [[0, '#0b130e'], [110, '#15221a'], [160, '#1b2a1f']]);
      for (let X = -4; X < W; X += 7) BR.pine(o, X, 150 + ((X * 3) % 8), 60 + ((X * 7) % 20), '#1a2c20');
      for (let X = 3; X < W; X += 14) BR.pine(o, X, 162 + ((X * 5) % 6), 90 + ((X * 11) % 20), '#132219');
      BR.bands(o, [[158, snow ? '#8a949e' : '#26321f'], [H, snow ? '#5a646e' : '#141c12']]);
      BR.grass(o, 159, 1100, 3, snow ? ['#c8d0da', '#a8b0ba'] : ['#2e3824', '#3e3726', '#1a2316', '#4a4030']);
    } else {
      BR.bands(o, snow ? [[0, '#5a6674'], [60, '#8a94a0'], [90, '#b4bcc6']] : ak ? [[0, '#3a4458'], [60, '#6a7486'], [90, '#9a8a7a']] : [[0, '#2a2946'], [40, P.dawn], [70, '#9a5d52'], [86, P.glow]]);
      BR.ridge(o, 72, 10, 0.03, 2.4, snow ? '#7e8898' : BR.mix(P.far2, P.dawn, 0.5));
      BR.ridge(o, 88, 7, 0.04, 0.8, snow ? '#5e6a78' : P.far2);
      if (!breaks) for (let X = 0; X < W + 4; X += 5) BR.pine(o, X, 152, 26 + ((X * 11) % 16), P.timber);
      if (look === 'sept') [[22, 140], [30, 143], [138, 139], [147, 142], [156, 140]].forEach(([x, y]) => BR.aspen(o, x, y, 5));
      const g0 = snow ? '#c4ccd6' : breaks ? '#8a8058' : ak ? '#6a6a3e' : '#56673f', g1 = snow ? '#9aa4b0' : breaks ? '#6e6a4a' : ak ? '#4e5236' : '#34422c';
      BR.bands(o, [[150, g0], [H, g1]]);
      BR.grass(o, 151, 1400, 21, snow ? ['#e8ecf0', '#b4bcc8', '#d8dee6'] : breaks ? ['#a09468', '#7e7652', '#b0a478'] : [P.meadow2, P.meadowD, P.meadow3, '#7a7a4e']);
    }
    return (bgCache[key] = c);
  }
  let mask = null;
  function peepMask() {
    if (mask) return mask;
    mask = document.createElement('canvas'); mask.width = W * 2; mask.height = H * 2;
    const o = mask.getContext('2d');
    for (let Y = 0; Y < H * 2; Y++) for (let X = (Y & 1); X < W * 2; X += 2) if (Math.hypot(X - W, Y - H) > 34) R(o, X, Y, 1, 1, P.ink);
    return mask;
  }
  let scopeMask = null;
  function drawSight(g, hx, hy, pins, mid, k, swx) {
    g.drawImage(peepMask(), hx - W, hy - H);
    BR.ring(g, hx, hy, 16, P.ink, 3); BR.ring(g, hx, hy, 17, P.ink, 3);
    pins.forEach(pin => { const py = Math.round(hy + (pin - mid) / 10 * GAP * k); R(g, hx - 15, py, 14, 1, P.ink); R(g, hx - 1, py, 2, 2, BR.PIN_COLS[pin]); });
    R(g, hx - 5, hy + 12, 11, 3, P.ink); R(g, hx - 4, hy + 13, 9, 1, '#2f4a33'); R(g, hx + Math.round(swx), hy + 13, 2, 1, P.bone);
  }
  function drawScope(g, hx, hy, marks) {
    if (!scopeMask) {
      scopeMask = document.createElement('canvas'); scopeMask.width = W * 2; scopeMask.height = H * 2;
      const o = scopeMask.getContext('2d'); o.fillStyle = '#050608';
      for (let Y = 0; Y < H * 2; Y++) for (let X = 0; X < W * 2; X++) if (Math.hypot(X - W, Y - H) > 70) o.fillRect(X, Y, 1, 1);
    }
    g.drawImage(scopeMask, hx - W, hy - H);
    BR.ring(g, hx, hy, 70, '#050608', 1);
    R(g, hx - 70, hy - 1, 52, 3, '#050608'); R(g, hx + 18, hy - 1, 52, 3, '#050608'); R(g, hx - 1, hy - 70, 3, 52, '#050608'); R(g, hx - 1, hy + 18, 3, 52, '#050608');
    R(g, hx - 18, hy, 36, 1, '#050608'); R(g, hx, hy - 18, 1, 36, '#050608');
    marks.forEach((m, i) => { const y = Math.round(hy + m); if (m > 1 && m < 18) R(g, hx - 3 + i, y, 7 - i * 2, 1, '#050608'); else if (m >= 18) R(g, hx - 1, y, 3, 1, '#050608'); });
  }
  BR.archery = { GAP, gauss, meadowBg, peepMask, drawSight };

  BR.scenes.shot = {
    enter() {
      const S = BR.S, e = S.enc, sh = e.shot, ch = BR.ch();
      if (!sh.options || !sh.options.length) { BR.endHunt(); return; }
      sh.i = BR.clamp(sh.i || 0, 0, sh.options.length - 1);
      const opt = sh.options[sh.i];
      this.animal = opt.a; this.range = opt.range; this.angle = opt.angle;
      this.rifle = ch.weapon === 'rifle';
      this.guide = !!ch.guide;
      const spScale = this.animal.sp === 'moose' ? 0.8 : 1;
      if (this.rifle) {
        this.rf = BR.rifle();
        this.zoom = BR.clamp(this.range / 45, 1, BR.zoomMax());
        this.scale = BR.clamp(40 / (this.range / this.zoom), 0.2, 1.5) * spScale;
      } else {
        this.bow = BR.bow(); this.pins = this.bow.pins; this.mid = this.pins[(this.pins.length - 1) >> 1]; this.k = this.bow.fps > 255 ? 0.85 : 1;
        this.scale = BR.clamp(40 / this.range, 0.25, 1.5) * spScale;
      }
      this.flip = Math.random() < 0.5;
      this.spr = BR.SPR.get(this.animal, sh.from === 'glass' && Math.random() < 0.4 ? 'feed' : 'stand', this.scale, { flip: this.flip });
      this.pos = { dx: Math.round(W / 2 + 6 - (this.spr.x0 + this.spr.x1) / 2), dy: GROUND - this.spr.gy };
      const z = BR.SPR.vitals(this.animal.sp), fs = this.flip ? -1 : 1;
      this.vit = { x: this.pos.dx + this.spr.cx + z.vit[0] * this.spr.px * fs, y: this.pos.dy + this.spr.gy + z.vit[1] * this.spr.px };
      this.aim = { x: W / 2 + (Math.random() - 0.5) * 30, y: this.vit.y - 18 + Math.random() * 10 };
      if (opt.est == null) opt.est = S.items.rangefinder ? this.range : Math.round(this.range * (1 + (Math.random() - 0.5) * 0.3) / 5) * 5;
      if (opt.wind == null) { const c = BR.conditions(); opt.wind = Math.round(c.mph * (0.4 + Math.random() * 0.6)) * (Math.random() < 0.5 ? -1 : 1); }
      this.phase = 'ready'; this.t = 0; this.holdT = 0; this.last = null; this.impact = null;
      this.window = Math.max(3, (sh.from === 'call' ? 4 + Math.random() * 5 : sh.from === 'glass' ? 9 + Math.random() * 6 : 5 + Math.random() * 6) - (sh.alert || 0) / 25);
      this.drawTime = this.rifle ? 0.35 : 0.5 + Math.max(0, this.bow.lb - 50 - S.strength * 4) * 0.04;
      this.budget = this.rifle ? 9 : Math.max(3, 7 + S.strength * 2 - Math.max(0, this.bow.lb - 55) * 0.35 - (this.bow.lb > 55 && S.strength < 1 ? 2 : 0));
      this.msg = this.guide ? 'Sam’s on the rifle. You spot. Hold on the screen to get him set.' : this.rifle ? 'Hold to shoulder the rifle. Slide to settle. Lift to fire.' : 'Hold on the screen to draw. Slide to settle. Lift to shoot.';
      this.hud();
      BR.animate();
    },
    resume() { BR.animate(); },
    exit() { BR.stop(); },
    fatigue() { return this.phase === 'full' ? BR.clamp(this.holdT / this.budget, 0, 1.3) : 0; },
    sway() {
      if (this.phase !== 'full') return { x: 0, y: 0 };
      const S = BR.S, f = this.fatigue(), t = this.holdT;
      let base, buck = BR.clamp(1 - this.holdT / 3, 0, 1) * (this.animal.sex === 'bull' ? 1.2 : 0.6) + (BR.S.enc.shot.alert || 0) / 120;
      if (this.rifle) base = S.items.tripod ? 0.3 : S.items.sticks ? 0.6 : 1.1;
      else base = Math.max(0.3, 0.7 - S.strength * 0.12);
      let amp = base + f * f * 3.5 + buck;
      if (this.guide) amp *= Math.max(1.05, 1.7 - 0.2 * S.guideSkill);
      return { x: amp * (Math.sin(t * 1.7) + 0.5 * Math.sin(t * 4.3)), y: amp * 0.8 * (Math.sin(t * 1.3 + 1) + 0.4 * Math.sin(t * 5.1)) };
    },
    marks() { // BDC hash marks for 300/400/500 at the current range and magnification
      const px = this.spr.px, rf = this.rf;
      return [300, 400, 500].map(Rm => BR.drop(Rm, rf) * (this.range / Rm) * px);
    },
    tick(dt) {
      if (this.phase === 'done') return false;
      if (this.phase === 'flight') { this.t += dt; if (this.t > 0.7) { this.resolve(); return false; } return true; }
      this.window -= dt;
      if (this.window <= 0) {
        if (Math.random() < 0.45 && this.phase === 'ready') { const o = BR.S.enc.shot.options[BR.S.enc.shot.i]; o.angle = ['broadside', 'quartering-away', 'quartering-to'][(Math.random() * 3) | 0]; this.phase = 'done'; BR.go('shot'); return false; }
        return this.finish({ kind: 'walked' });
      }
      if (this.phase === 'drawing') { this.t += dt; if (this.t >= this.drawTime) { this.phase = 'full'; this.holdT = 0; BR.vibe(12); } }
      else if (this.phase === 'full') {
        this.holdT += dt;
        if (this.holdT > this.budget + 1.5) { this.phase = 'ready'; this.msg = this.rifle ? 'You came off the rifle to catch your breath.' : 'Your arms gave out. You let down.'; this.spotCheck(0.6); }
      }
      this.upd();
      return true;
    },
    spotCheck(mult) {
      const sh = BR.S.enc.shot;
      let p = ({ 'quartering-to': 0.2, broadside: 0.06, 'quartering-away': 0.02 }[this.angle]) * (0.5 + (sh.alert || 0) / 100) * mult * (this.range < 40 ? 1.3 : 0.8);
      if (this.rifle) p *= this.range > 200 ? 0.05 : 0.4;
      if (Math.random() < p) { BR.S.stats.busts++; this.finish({ kind: 'bust', cause: 'drew', angle: this.angle, yd: this.range }); return true; }
      return false;
    },
    down(p) {
      if (this.phase !== 'ready') return;
      if (this.guide && this.range > 250) { this.msg = 'Sam: “Too far for me. Get me closer.”'; this.upd(); return; }
      this.last = p; this.phase = 'drawing'; this.t = 0;
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
      if (this.phase === 'drawing') { this.phase = 'ready'; this.msg = this.rifle ? 'You came off the rifle before you settled.' : 'You let down before full draw.'; }
      else if (this.phase === 'full') this.release();
    },
    release() {
      const S = BR.S, e = S.enc, sh = e.shot, opt = sh.options[sh.i], sw = this.sway(), hx = this.aim.x + sw.x, hy = this.aim.y + sw.y, px = this.spr.px;
      let ix, iy, ke, held;
      if (this.rifle) {
        const rf = this.rf, drift = BR.drift(this.range, rf, Math.abs(opt.wind)) * Math.sign(opt.wind), disp = 0.25 * (this.range / 100) * (S.items.tripod ? 0.7 : 1) * px;
        ix = hx + drift * px + gauss() * disp;
        iy = hy + BR.drop(this.range, rf) * px + gauss() * disp;
        ke = BR.energy(this.range, rf);
        const mk = this.marks(), off = this.vit.y - hy;
        held = off < mk[0] / 2 ? 200 : [300, 400, 500][mk.reduce((b, m, i) => (Math.abs(m - off) < Math.abs(mk[b] - off) ? i : b), 0)];
      } else {
        const disp = 0.6 * (this.range / 30);
        ix = hx + gauss() * disp; iy = hy + (this.range - this.mid) / 10 * GAP * this.k + gauss() * disp;
        ke = BR.ke(this.bow);
        held = this.pins[0]; let bd = 1e9;
        this.pins.forEach(pin => { const d = Math.abs(hy + (pin - this.mid) / 10 * GAP * this.k - this.vit.y); if (d < bd) { bd = d; held = pin; } });
      }
      const sxp = ix - this.pos.dx, syp = iy - this.pos.dy, onBody = this.spr.body(sxp, syp), [wx, wy] = this.spr.world(sxp, syp);
      const zone = BR.SPR.zone(this.animal.sp, wx, wy, this.angle, onBody);
      S.stats.shots++;
      e.shotResult = {
        animal: this.animal, sp: this.animal.sp, zone, range: this.range, est: opt.est, weapon: this.rifle ? 'rifle' : 'bow', held, ke,
        fatigue: +this.fatigue().toFixed(2), angle: this.angle, from: sh.from, high: iy < this.vit.y, wind: opt.wind,
        windHeld: Math.round((this.vit.x - hx) / px), gr: this.bow ? this.bow.gr : 0, blades: !!S.items.fixedBlades, guide: this.guide
      };
      this.impact = { x: ix, y: iy, seen: !this.rifle || S.items.suppressor || this.rf.recoil < 22 };
      this.phase = 'flight'; this.t = 0;
      BR.vibe(this.rifle ? 60 : 30);
    },
    resolve() {
      const r = BR.S.enc.shotResult;
      this.phase = 'done';
      if (r.zone === 'miss') { BR.log('miss', r); BR.go('outcome', { kind: 'miss', high: r.high, range: r.range, weapon: r.weapon }); }
      else BR.go('recover');
    },
    finish(o) {
      this.phase = 'done';
      BR.log(o.kind, Object.assign({ range: this.range, angle: this.angle }, o));
      BR.go('outcome', o);
      return false;
    },
    draw(g) {
      g.drawImage(meadowBg(BR.S.enc.shot.from === 'call', BR.ch().look), 0, 0);
      const ran = this.phase === 'flight' && this.t > 0.25 && this.impact;
      g.drawImage(this.spr.canvas, this.pos.dx + (ran ? (this.flip ? -1 : 1) * this.t * 40 : 0), this.pos.dy);
      if (this.phase === 'flight') {
        if (this.t < 0.35 && this.impact.seen) { R(g, this.impact.x - 1, this.impact.y - 1, 3, 3, P.bone); R(g, this.impact.x, this.impact.y, 1, 1, P.blood); }
        if (this.rifle && !this.impact.seen) R(g, 0, 0, W, H, 'rgba(12,12,14,.55)');
        return;
      }
      if (this.phase === 'ready') {
        if (this.rifle) { R(g, W / 2 - 18, H - 24, 36, 24, '#2a2a2a'); R(g, W / 2 - 6, H - 30, 12, 8, '#1a1a1a'); }
        else R(g, W / 2 - 1, H - 40, 2, 40, '#3b2a1c');
        return;
      }
      const sw = this.sway(), rise = this.phase === 'drawing' ? (1 - this.t / this.drawTime) * 90 : 0;
      const hx = Math.round(this.aim.x + sw.x), hy = Math.round(this.aim.y + sw.y + rise);
      if (this.rifle) drawScope(g, hx, hy, this.marks());
      else drawSight(g, hx, hy, this.pins, this.mid, this.k, sw.x);
    },
    hud() {
      const S = BR.S, sh = S.enc.shot, n = sh.options.length;
      BR.hud(`
        <div class="row"><span class="t" id="sh-range"></span><span class="dim" id="sh-angle"></span></div>
        <div class="row"><span>HOLD</span><span id="sh-hold"></span></div>
        <div class="row sm"><span id="sh-msg" class="dim"></span></div>
        <div class="row sm"><span class="dim" id="sh-gear"></span></div>
        <div class="sp"></div>
        <div class="g2">${n > 1 ? BR.btn('next', `Next animal (${sh.i + 1}/${n})`) : BR.btn('wait', 'Wait for a better angle')}${BR.btn('pass', 'Pass')}</div>`);
      this.upd();
    },
    upd() {
      const $ = id => document.getElementById(id); if (!$('sh-range')) return;
      const S = BR.S, opt = S.enc.shot.options[S.enc.shot.i];
      $('sh-range').textContent = S.items.rangefinder ? `${this.range} yd` : `About ${opt.est} yd?`;
      $('sh-angle').textContent = ANGLE[this.angle] || this.angle;
      const left = this.phase === 'full' ? BR.clamp(1 - this.holdT / this.budget, 0, 1) : 1;
      $('sh-hold').innerHTML = BR.meter(Math.ceil(left * 5), 5, left < 0.3 ? 'bad' : left < 0.6 ? 'warn' : '');
      $('sh-msg').textContent = this.phase === 'full' ? (this.fatigue() > 0.8 ? 'Crosshair’s swimming. Shoot or come off it.' : 'Settle it. Lift to shoot.') : this.phase === 'drawing' ? '…' : this.msg;
      if (this.rifle) {
        const w = opt.wind;
        $('sh-gear').innerHTML = `${this.rf.name} · ${this.zoom.toFixed(0)}× · wind ${Math.abs(w)} mph from the ${w < 0 ? 'left' : 'right'} · marks 300/400/500`;
      } else $('sh-gear').innerHTML = `PINS ${BR.pinLegend(this.pins)}`;
    },
    act(a) {
      const S = BR.S, sh = S.enc.shot;
      if (this.phase !== 'ready') return;
      if (a === 'next') { sh.i = (sh.i + 1) % sh.options.length; BR.pass(0.5); this.phase = 'done'; BR.go('shot'); }
      else if (a === 'pass') this.finish({ kind: 'passed' });
      else if (a === 'wait') {
        const r = Math.random(); BR.pass(1);
        if (r < 0.4) { sh.options[sh.i].angle = 'broadside'; this.phase = 'done'; BR.go('shot'); }
        else if (r < 0.75) { this.msg = 'It holds the same angle.'; this.window = Math.max(this.window - 1.5, 1); this.upd(); }
        else this.finish({ kind: 'walked' });
      }
    },
    back() {
      if (this.phase === 'flight' || this.phase === 'done') return;
      this.phase = 'ready'; this.last = null;
      BR.confirm('Pass on this one?', 'Lower the weapon and let it go.', 'Pass', () => this.act('pass'));
    }
  };

  // ---------------- RECOVERY ----------------
  function model(res) {
    const ke = res.ke, blades = res.blades, r = Math.random, rifle = res.weapon === 'rifle';
    if (rifle) switch (res.zone) {
      case 'heart': return { sign: 'Ran sixty yards and piled up. Bright blood where it stood.', need: 0, lethal: 1, trail: 6 };
      case 'vitals': return { sign: 'Hunched at the shot and bolted. Pink, frothy blood where it stood.', need: 0.5, lethal: 1, trail: 8 };
      case 'liver': return { sign: 'Walked off slow and humped up. Dark red blood.', need: 4, lethal: 0.95, trail: 12 };
      case 'paunch': return { sign: 'Kicked and hunched. Green matter in the blood.', need: 8, lethal: 0.85, trail: 14 };
      case 'shoulder': return ke >= 1500 ? { sign: 'Dropped, got up, and went forty yards. Bone chips and bright blood.', need: 1, lethal: 0.95, trail: 8 } : { sign: 'Bone chips and a little blood. Went off on three legs.', need: 4, lethal: 0.5, trail: 11 };
      case 'spine': return r() < 0.4 ? { sign: 'Dropped in its tracks.', need: 0, lethal: 1, trail: 2 } : { sign: 'Dropped, then got up and ran. Hair, and very little blood.', need: 2, lethal: 0.35, trail: 9 };
      case 'neck': return { sign: 'Neck hair and bright blood, but not much of it.', need: 2, lethal: 0.4, trail: 10 };
      case 'ham': return { sign: 'Bucked at the shot. Bright blood and hair.', need: 2, lethal: 0.35, trail: 11 };
      default: return { sign: 'Went off on three legs. Bone chips on the ground.', need: 2, lethal: 0.05, trail: 9 };
    }
    switch (res.zone) {
      case 'heart': return { sign: 'Bright red blood, heavy spray. You heard it crash inside 80 yards.', need: 0, lethal: 1, trail: 6 };
      case 'vitals': return { sign: 'Pink, frothy blood with tiny bubbles on the arrow.', need: 0.5, lethal: 1, trail: 9 };
      case 'liver': return { sign: 'Dark red blood on the arrow. No bubbles.', need: 4, lethal: 0.95, trail: 12 };
      case 'paunch': return { sign: 'Green-brown matter and a sour smell on the arrow.', need: 8, lethal: 0.85, trail: 14 };
      case 'shoulder':
        if (ke >= 65 && blades) return { sign: 'Arrow buried through the shoulder. Bright blood right away.', need: 1, lethal: 0.9, trail: 10 };
        if (ke >= 65) return { sign: 'Arrow snapped off 8 inches deep. Some bright blood.', need: 4, lethal: 0.5, trail: 12 };
        if (blades) return { sign: 'Broken arrow. Maybe 5 inches of blood on the shaft.', need: 4, lethal: 0.25, trail: 12 };
        return { sign: 'Arrow bounced out. Two inches of blood on the tip and a folded blade.', need: 4, lethal: 0.05, trail: 10 };
      case 'spine': return r() < 0.35 ? { sign: 'Dropped where it stood. You put a follow-up arrow in.', need: 0, lethal: 1, trail: 2 } : { sign: 'Hair cut high, little blood. The arrow went over the lungs.', need: 2, lethal: 0.05, trail: 8 };
      case 'neck': return { sign: 'Neck hair and bright blood, but not much of it.', need: 2, lethal: 0.25, trail: 10 };
      case 'ham': return { sign: 'Bright blood and pale rump hair.', need: 2, lethal: 0.2, trail: 11 };
      default: return { sign: 'Bone chips and a little blood. It ran off sound.', need: 2, lethal: 0.02, trail: 9 };
    }
  }

  const groundCache = {};
  BR.scenes.recover = {
    groundCanvas(seed) {
      const look = BR.ch().look, key = seed + look;
      if (groundCache[key]) return groundCache[key];
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const o = c.getContext('2d'), snow = look === 'snow';
      R(o, 0, 0, W, H, snow ? '#c4ccd6' : look === 'breaks' ? '#7e7652' : P.meadow);
      BR.grass(o, 0, 2600, seed, snow ? ['#e8ecf0', '#b4bcc8', '#d8dee6'] : [P.meadow2, P.meadowD, P.meadow3, '#394530']);
      for (let X = -3; X < W + 4; X += 7) BR.pine(o, X, 22 + ((X * 7) % 6), 22 + ((X * 3) % 8), P.timber, P.tree);
      if (Object.keys(groundCache).length > 6) for (const k in groundCache) delete groundCache[k];
      return (groundCache[key] = c);
    },
    enter() {
      const S = BR.S, e = S.enc;
      if (!e.shotResult) { BR.endHunt(); return; }
      if (!e.rec) {
        const m = model(e.shotResult), seed = (Math.random() * 1e6) | 0, r = BR.rng(seed), pts = [];
        let x = 90, y = 228;
        for (let i = 0; i < m.trail; i++) { pts.push({ x: Math.round(x), y: Math.round(y) }); x = BR.clamp(x + (r() - 0.5) * 40, 16, W - 16); y -= 200 / m.trail; }
        e.rec = { m, lethal: Math.random() < m.lethal, phase: 'sign', waited: 0, found: 0, pts, seed, stop: m.trail };
      }
      this.bg = this.groundCanvas(e.rec.seed);
      this.startPulse();
      this.hud();
    },
    startPulse() {
      clearInterval(this.pulseTimer); this.pulseTimer = null;
      const rec = BR.S.enc && BR.S.enc.rec;
      if (!rec || rec.phase !== 'track' || rec.found > 0) return;
      this.pulseOn = true;
      this.pulseTimer = setInterval(() => { this.pulseOn = !this.pulseOn; BR.draw(); }, 450);
    },
    exit() { clearInterval(this.pulseTimer); this.pulseTimer = null; },
    pause() { clearInterval(this.pulseTimer); this.pulseTimer = null; },
    resume() { this.startPulse(); },
    draw(g) {
      const e = BR.S.enc, rec = e.rec, res = e.shotResult;
      g.drawImage(this.bg, 0, 0);
      if (rec.phase === 'sign') {
        const col = { vitals: '#e0707a', heart: P.blood, liver: '#6a2a28', paunch: '#6b6a3a' }[res.zone] || P.blood;
        if (res.weapon === 'bow') { R(g, 70, 150, 40, 1, '#d8cfb8'); R(g, 108, 149, 3, 3, P.amber); R(g, 72, 150, 14, 1, col); R(g, 74, 151, 6, 1, col); }
        else { for (let i = 0; i < 7; i++) R(g, 84 + (i * 5) % 13, 150 + (i * 3) % 7, 2, 1, col); }
        return;
      }
      for (let i = 0; i < Math.min(rec.found, rec.pts.length); i++) { const p = rec.pts[i]; R(g, p.x, p.y, 2, 1, P.blood); R(g, p.x + 3, p.y + 2, 1, 1, P.blood); }
      const nxt = rec.pts[rec.found];
      if (rec.phase === 'track' && nxt && rec.found < rec.stop) {
        if (rec.found > 0) R(g, nxt.x, nxt.y, 1, 1, '#8a3a36');
        else if (this.pulseOn) { R(g, nxt.x - 3, nxt.y - 3, 7, 7, '#3a1614'); R(g, nxt.x - 2, nxt.y - 2, 5, 5, '#7a2622'); R(g, nxt.x - 1, nxt.y - 1, 3, 3, '#e0504a'); }
        else R(g, nxt.x - 1, nxt.y - 1, 2, 2, P.blood);
      }
      if (rec.phase === 'found') { const p = rec.pts[rec.pts.length - 1], a = res.animal; BR.SPR.draw(g, BR.SPR.get(a, 'dead', a.sp === 'moose' ? 0.5 : a.sp === 'wolf' ? 0.9 : 0.6), p.x, p.y + 4); }
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
        body = `<div class="row"><span class="t">HIT · ${res.range} YD</span><span class="hi">${BR.fmt(S.clock)}</span></div>
          <div class="quote">${rec.m.sign}</div>
          <div class="tagline">Read the sign, then decide how long to let it lie down.</div>
          <div class="sp"></div>
          <div class="g2">${BR.btn('wait', 'Track now', '', 0)}${BR.btn('wait', 'Wait 30 min', '', 0.5)}${BR.btn('wait', 'Wait 4 hours', '', 4)}${BR.btn('wait', 'Back at first light', '', 9)}</div>`;
      } else if (rec.phase === 'track') {
        const first = rec.found === 0;
        body = `<div class="row"><span class="t">BLOOD TRAIL</span><span class="hi">${rec.found} drop${rec.found === 1 ? '' : 's'} found</span></div>
          <div class="quote">${first ? 'It ran off. Tap the pulsing drop of blood to start trailing.' : 'Find and tap the next drop of blood.'}</div>
          <div class="row sm"><span class="${this.msg ? 'toast' : 'dim'}">${this.msg || (first ? 'Each drop you find leads to the next one.' : 'Look close. Some drops are a single speck.')}</span></div><div class="sp"></div>`;
        this.msg = null;
      } else if (rec.phase === 'dry') {
        body = `<div class="row"><span class="t bad">THE BLOOD’S RUN OUT</span><span class="hi">${BR.fmt(S.clock)}</span></div>
          <div class="tagline">No more sign. You can grid-search the timber or call it.</div><div class="sp"></div>
          ${BR.btn('grid', 'Grid-search for 2 hours', 'go')}${BR.btn('lost', 'Mark it and head back', '')}`;
      } else {
        body = `<div class="row"><span class="t ok">DOWN</span><span class="hi">${BR.fmt(S.clock)}</span></div>
          <div class="quote">There it is: a ${BR.describe(res.animal)}. ${res.range} yards, ${res.zone === 'vitals' ? 'double lung' : res.zone}.</div>
          <div class="sp"></div>${BR.btn('tag', 'Walk up and tag it', 'go')}`;
      }
      BR.hud(body);
    },
    act(a, arg) {
      const S = BR.S, e = S.enc, rec = e.rec, res = e.shotResult;
      if (a === 'wait') {
        const h = +arg;
        rec.waited = h; BR.pass(h * 60);
        const pushed = h < rec.m.need, found = rec.lethal && (!pushed || Math.random() < (rec.m.need >= 4 ? 0.25 : 0.85));
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
      else if (a === 'tag') {
        const reason = BR.legal(res.animal);
        BR.log('recovered', Object.assign({ waited: rec.waited, pushed: rec.pushed }, res));
        if (reason) {
          S.verdict = { illegal: true, reason }; S.over = true; S.stats.violations++;
          BR.log('illegal', { reason, desc: BR.describe(res.animal) });
          BR.go('outcome', { kind: 'illegal', reason }); return;
        }
        if (res.sp === 'wolf' || res.sp === 'griz') { S.stats.predators++; BR.log('predator', { sp: res.sp }); BR.go('outcome', { kind: 'predator', sp: res.sp }); return; }
        BR.go('meat'); return;
      }
      BR.draw(); this.hud(); BR.save();
    },
    lose() {
      const S = BR.S, e = S.enc, rec = e.rec;
      S.stats.wounds++;
      BR.skipDay('searching');
      BR.log('lost', Object.assign({ waited: rec.waited, need: rec.m.need, pushed: !!rec.pushed }, e.shotResult));
      BR.go('outcome', { kind: 'lost', zone: e.shotResult.zone });
    },
    back() {
      const rec = BR.S.enc.rec;
      if (rec.phase === 'found') return;
      BR.confirm('Give up on it?', 'Mark the spot and head back. You’ll spend tomorrow looking.', 'Give up', () => this.lose());
    }
  };
})();

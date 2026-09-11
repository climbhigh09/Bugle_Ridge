// Bugle Ridge — practice range: a foam 3D elk at a known yardage. Learn which pin is which, how long you can hold,
// and what the wrong pin does. No time passes unless it's the midday strength session.
(function () {
  const BR = window.BR, { P, W, H, R } = BR;
  const FOAM = { a: '#000000', A: '#000000', n: '#8a7050', h: '#9c8258', e: '#3a3024', m: '#3a3024', b: '#b59a6a', B: '#c4a978', s: '#8f7a54', d: '#7a6448', r: '#cbb68c', l: '#6a5840', k: '#4a3e2e' };
  const STEPS = [20, 30, 40];
  const SESSION = 6;

  BR.scenes.range = {
    enter(a) {
      const S = BR.S;
      this.back_ = (a && a.back) || 'camp';
      this.midday = !!(a && a.midday);
      if (!S.range) S.range = { step: 0, done: false };
      this.bow = BR.bow();
      this.pins = this.bow.pins;
      this.mid = this.pins[(this.pins.length - 1) >> 1];
      this.k = this.bow.fps > 255 ? 0.85 : 1;
      this.budget = Math.max(3, 7 + S.strength * 2 - Math.max(0, this.bow.lb - 55) * 0.35 - (this.bow.lb > 55 && S.strength < 1 ? 2 : 0));
      this.drawTime = 0.5 + Math.max(0, this.bow.lb - 50 - S.strength * 4) * 0.04;
      this.bg = BR.archery.meadowBg(false);
      this.shots = 0; this.msg = null; this.pendingDist = null; this.last = null;
      this.setDist(S.range.done ? 30 : STEPS[Math.min(S.range.step, STEPS.length - 1)]);
      this.hud();
    },
    exit() { BR.stop(); },
    pause() { if (this.phase === 'drawing' || this.phase === 'full') { this.phase = 'ready'; this.last = null; } },
    setDist(yd) {
      this.dist = yd;
      this.arrows = [];
      this.s = BR.clamp(Math.round(110 / yd), 1, 5);
      this.ex = Math.round(W / 2 - 11 * this.s + 6);
      this.ey = 156 - 16 * this.s;
      this.vit = { x: this.ex + 11.2 * this.s, y: this.ey + 10.8 * this.s };
      this.aim = { x: W / 2 + (Math.random() - 0.5) * 30, y: this.vit.y - 16 };
      this.phase = 'ready'; this.t = 0; this.holdT = 0;
    },
    fatigue() { return this.phase === 'full' ? BR.clamp(this.holdT / this.budget, 0, 1.3) : 0; },
    sway() {
      if (this.phase !== 'full') return { x: 0, y: 0 };
      const f = this.fatigue(), amp = Math.max(0.3, 0.7 - BR.S.strength * 0.12) + f * f * 3.5, t = this.holdT;
      return { x: amp * (Math.sin(t * 1.7) + 0.5 * Math.sin(t * 4.3)), y: amp * 0.8 * (Math.sin(t * 1.3 + 1) + 0.4 * Math.sin(t * 5.1)) };
    },
    tick(dt) {
      if (this.phase === 'drawing') {
        this.t += dt;
        if (this.t >= this.drawTime) { this.phase = 'full'; this.holdT = 0; BR.vibe(12); }
      } else if (this.phase === 'full') {
        this.holdT += dt;
        if (this.holdT > this.budget + 1.5) { this.phase = 'ready'; this.msg = 'Your arms gave out and you let down. Shoot sooner, or build strength at midday.'; this.hud(); return false; }
      } else if (this.phase === 'flight') {
        this.t += dt;
        if (this.t > 0.35) {
          this.phase = 'ready';
          if (this.pendingDist) { this.setDist(this.pendingDist); this.pendingDist = null; }
          this.hud();
          return false;
        }
      } else return false;
      this.upd();
      return true;
    },
    down(p) {
      if (this.phase !== 'ready') return;
      this.last = p; this.phase = 'drawing'; this.t = 0;
      BR.animate();
    },
    move(p) {
      if (!this.last || (this.phase !== 'drawing' && this.phase !== 'full')) return;
      this.aim.x = BR.clamp(this.aim.x + (p.x - this.last.x) * 0.6, 10, W - 10);
      this.aim.y = BR.clamp(this.aim.y + (p.y - this.last.y) * 0.6, 10, H - 10);
      this.last = p;
    },
    up() {
      this.last = null;
      if (this.phase === 'drawing') { this.phase = 'ready'; this.msg = 'You let down before full draw. Keep holding until the sight settles.'; this.hud(); }
      else if (this.phase === 'full') this.release();
    },
    release() {
      const { GAP, gauss, zoneAt } = BR.archery;
      const sw = this.sway(), disp = 0.5 * (this.dist / 30), hx = this.aim.x + sw.x, hy = this.aim.y + sw.y;
      const ix = hx + gauss() * disp, iy = hy + (this.dist - this.mid) / 10 * GAP * this.k + gauss() * disp;
      const zone = zoneAt('broadside', (ix - this.ex) / this.s, (iy - this.ey) / this.s);
      let pinUsed = this.pins[0], bd = 1e9;
      this.pins.forEach(pin => { const d = Math.abs(hy + (pin - this.mid) / 10 * GAP * this.k - this.vit.y); if (d < bd) { bd = d; pinUsed = pin; } });
      this.arrows.push({ sx: (ix - this.ex) / this.s, sy: (iy - this.ey) / this.s });
      if (this.arrows.length > 6) this.arrows.shift();
      this.shots++;
      this.msg = this.coach(zone, pinUsed, ix, iy, this.fatigue());
      this.phase = 'flight'; this.t = 0;
      BR.vibe(20);
    },
    offset(x, y) {
      if (Math.abs(x) <= 2 && Math.abs(y) <= 2) return 'dead center';
      const p = [];
      if (Math.abs(y) > 2) p.push(`${Math.abs(y)} in. ${y > 0 ? 'low' : 'high'}`);
      if (Math.abs(x) > 2) p.push(`${Math.abs(x)} in. ${x > 0 ? 'right' : 'left'}`);
      return p.join(', ');
    },
    coach(zone, pinUsed, ix, iy, f) {
      const S = BR.S, maxPin = Math.max(...this.pins), right = this.pins.includes(this.dist) ? this.dist : null;
      const inY = Math.round((iy - this.vit.y) / this.s * 4), inX = Math.round((ix - this.vit.x) / this.s * 4);
      const good = zone === 'vitals' || zone === 'heart';
      let text = good ? `Vitals, ${this.offset(inX, inY)}.` : zone === 'miss' ? `Missed the target, ${this.offset(inX, inY)}.` : `Hit the ${zone}, ${this.offset(inX, inY)} of the vitals.`;
      if (right && pinUsed !== right) text += ` You held your ${pinUsed} pin (${BR.PIN_NAMES[pinUsed]}). At ${this.dist} yards use the ${right} pin (${BR.PIN_NAMES[right]}).`;
      else if (!right) text += ` Your sight stops at ${maxPin}. Hold the ${maxPin} pin high, about one pin-gap for every 10 yards past it.`;
      if (f > 0.8) text += ' The pin was swimming. Shoot sooner.';
      if (!S.range.done && good && pinUsed === right) {
        S.range.step++;
        if (S.range.step >= STEPS.length) { S.range.done = true; text += ' That’s the drill. Pick any distance now, or head out.'; }
        else { text += ` Good. Now ${STEPS[S.range.step]} yards.`; this.pendingDist = STEPS[S.range.step]; }
        BR.save();
      }
      return text;
    },
    draw(g) {
      const { drawSight } = BR.archery, s = this.s;
      g.drawImage(this.bg, 0, 0);
      R(g, this.ex + 3 * s, 156, 12 * s, 2, '#2a2318');
      BR.sprite(g, BR.ELK, FOAM, this.ex, this.ey, s, false, 'aA');
      const vx = this.vit.x, vy = this.vit.y;
      for (let a = 0; a < 360; a += Math.max(4, 16 / s)) R(g, vx + Math.cos(a * Math.PI / 180) * 1.9 * s, vy + Math.sin(a * Math.PI / 180) * 1.5 * s, 1, 1, '#4a3a28');
      R(g, vx - 1, vy - 1, 2, 2, '#4a3a28');
      for (const ar of this.arrows) {
        const x = Math.round(this.ex + ar.sx * s), y = Math.round(this.ey + ar.sy * s);
        BR.line(g, x, y, x - 4, y - 3, '#2a2520');
        R(g, x - 6, y - 5, 2, 2, P.amber); R(g, x, y, 1, 1, '#111111');
      }
      if (this.phase !== 'drawing' && this.phase !== 'full') { R(g, W / 2 - 1, H - 40, 2, 40, '#3b2a1c'); return; }
      const sw = this.sway(), rise = this.phase === 'drawing' ? (1 - this.t / this.drawTime) * 90 : 0;
      drawSight(g, Math.round(this.aim.x + sw.x), Math.round(this.aim.y + sw.y + rise), this.pins, this.mid, this.k, sw.x);
    },
    hud() {
      const S = BR.S;
      const task = S.range.done
        ? `<div class="g5">${[20, 30, 40, 50, 60].map(d => BR.btn('dist', String(d), d === this.dist ? 'sel' : '', d)).join('')}</div>`
        : `<div class="row sm"><span class="hi">Step ${S.range.step + 1} of 3: put the ${STEPS[S.range.step]}-yard pin (${BR.PIN_NAMES[STEPS[S.range.step]]}) on the ring behind the shoulder.</span></div>`;
      const count = this.midday ? `${Math.min(this.shots, SESSION)}/${SESSION} for strength` : `${this.shots} arrow${this.shots === 1 ? '' : 's'}`;
      const earned = this.midday && this.shots >= SESSION;
      BR.hud(`
        <div class="row"><span class="t">RANGE · ${this.dist} YD</span><span class="dim">${count}</span></div>
        <div class="row sm"><span>PINS ${BR.pinLegend(this.pins)}</span><span id="rg-hold"></span></div>
        <div class="row sm"><span class="${this.msg ? 'toast' : 'dim'}">${this.msg || 'Press and hold on the target to draw. Slide to settle the pin. Lift to shoot.'}</span></div>
        ${task}
        <div class="sp"></div>
        ${BR.btn('done', earned ? (S.strength < 3 ? 'Done · strength +1' : 'Done · strength maxed') : 'Done', 'go')}`);
      this.upd();
    },
    upd() {
      const el = document.getElementById('rg-hold');
      if (!el) return;
      const left = this.phase === 'full' ? BR.clamp(1 - this.holdT / this.budget, 0, 1) : 1;
      el.innerHTML = 'HOLD ' + BR.meter(Math.ceil(left * 5), 5, left < 0.3 ? 'bad' : left < 0.6 ? 'warn' : '');
    },
    act(a, arg) {
      if (a === 'dist') { this.setDist(+arg); this.msg = null; this.hud(); BR.draw(); }
      else if (a === 'done') this.done();
    },
    done() {
      const S = BR.S;
      if (this.midday) {
        if (this.shots >= SESSION) {
          if (S.strength < 3) S.strength++;
          BR.log('practice', { strength: S.strength });
          S.part = 'evening'; S.clock = 16;
        }
        BR.go('camp');
        return;
      }
      BR.go(this.back_);
    },
    back() { this.done(); }
  };
})();

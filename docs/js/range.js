// Bugle Ridge — practice range. Bow: a foam 3D elk at 20/30/40 to learn the pins. Rifle: steel-backed foam elk at
// 200/300/400/500 to learn the crosshair and hash-mark holds. No time passes unless it's the midday session.
(function () {
  const BR = window.BR, { P, W, H, R } = BR;
  const GROUND = 208, SESSION = 6;
  const BOW_STEPS = [20, 30, 40], RIFLE_STEPS = [200, 300, 400, 500];
  const FOAM = { cowHide: 'foam', cowNeck: 'foamDark', elkLeg: 'foamDark', elkLegFar: 'foamDark', rump: 'foam', muzzle: 'foamDark', hoof: 'foamDark', earIn: 'foam' };
  const TARGET = { sp: 'elk', sex: 'cow', pts: 0 };

  BR.scenes.range = {
    enter(a) {
      const S = BR.S;
      this.back_ = (a && a.back) || 'camp';
      this.midday = !!(a && a.midday);
      this.rifle = BR.ch().weapon === 'rifle';
      this.steps = this.rifle ? RIFLE_STEPS : BOW_STEPS;
      this.key = this.rifle ? 'rifleRange' : 'range';
      if (!S[this.key]) S[this.key] = { step: 0, done: false };
      if (this.rifle) { this.rf = BR.rifle(); this.budget = 9; this.drawTime = 0.35; }
      else {
        this.bow = BR.bow(); this.pins = this.bow.pins; this.mid = this.pins[(this.pins.length - 1) >> 1]; this.k = this.bow.fps > 255 ? 0.85 : 1;
        this.budget = Math.max(3, 7 + S.strength * 2 - Math.max(0, this.bow.lb - 55) * 0.35 - (this.bow.lb > 55 && S.strength < 1 ? 2 : 0));
        this.drawTime = 0.5 + Math.max(0, this.bow.lb - 50 - S.strength * 4) * 0.04;
      }
      this.shots = 0; this.msg = null; this.pendingDist = null; this.last = null;
      const st = S[this.key];
      this.setDist(st.done ? this.steps[1] : this.steps[Math.min(st.step, this.steps.length - 1)]);
      this.hud();
    },
    exit() { BR.stop(); },
    pause() { if (this.phase === 'drawing' || this.phase === 'full') { this.phase = 'ready'; this.last = null; } },
    setDist(yd) {
      this.dist = yd; this.arrows = [];
      if (this.rifle) { this.zoom = BR.clamp(yd / 45, 1, BR.zoomMax()); this.sc = BR.clamp(48 / (yd / this.zoom), 0.27, 1.35); }
      else this.sc = BR.clamp(40 / yd, 0.3, 1.35);
      this.spr = BR.SPR.get(TARGET, 'stand', this.sc, { remap: FOAM });
      this.pos = { dx: Math.round(W / 2 + 8 - (this.spr.x0 + this.spr.x1) / 2), dy: GROUND - this.spr.gy };
      const z = BR.SPR.vitals('elk');
      this.vit = { x: this.pos.dx + this.spr.cx + z.vit[0] * this.spr.px, y: this.pos.dy + this.spr.gy + z.vit[1] * this.spr.px, rx: z.vit[2] * this.spr.px, ry: z.vit[3] * this.spr.px };
      this.aim = { x: W / 2 + (Math.random() - 0.5) * 40, y: this.vit.y - 21 };
      this.phase = 'ready'; this.t = 0; this.holdT = 0;
    },
    marks() { return [300, 400, 500].map(Rm => BR.drop(Rm, this.rf) * (this.dist / Rm) * this.spr.px); },
    fatigue() { return this.phase === 'full' ? BR.clamp(this.holdT / this.budget, 0, 1.3) : 0; },
    sway() {
      if (this.phase !== 'full') return { x: 0, y: 0 };
      const f = this.fatigue(), t = this.holdT, S = BR.S;
      const base = this.rifle ? (S.items.tripod ? 0.3 : 0.55) : Math.max(0.3, 0.7 - S.strength * 0.12);
      const amp = base + f * f * 3.5;
      return { x: amp * (Math.sin(t * 1.7) + 0.5 * Math.sin(t * 4.3)), y: amp * 0.8 * (Math.sin(t * 1.3 + 1) + 0.4 * Math.sin(t * 5.1)) };
    },
    tick(dt) {
      if (this.phase === 'drawing') { this.t += dt; if (this.t >= this.drawTime) { this.phase = 'full'; this.holdT = 0; BR.vibe(12); } }
      else if (this.phase === 'full') {
        this.holdT += dt;
        if (this.holdT > this.budget + 1.5) { this.phase = 'ready'; this.msg = this.rifle ? 'You came off the rifle. Settle and squeeze sooner.' : 'Your arms gave out and you let down. Shoot sooner, or build strength at midday.'; this.hud(); return false; }
      } else if (this.phase === 'flight') {
        this.t += dt;
        if (this.t > 0.35) { this.phase = 'ready'; if (this.pendingDist) { this.setDist(this.pendingDist); this.pendingDist = null; } this.hud(); return false; }
      } else return false;
      this.upd();
      return true;
    },
    down(p) { if (this.phase !== 'ready') return; this.last = p; this.phase = 'drawing'; this.t = 0; BR.animate(); },
    move(p) {
      if (!this.last || (this.phase !== 'drawing' && this.phase !== 'full')) return;
      this.aim.x = BR.clamp(this.aim.x + (p.x - this.last.x) * 0.6, 10, W - 10);
      this.aim.y = BR.clamp(this.aim.y + (p.y - this.last.y) * 0.6, 10, H - 10);
      this.last = p;
    },
    up() {
      this.last = null;
      if (this.phase === 'drawing') { this.phase = 'ready'; this.msg = this.rifle ? 'Settle the crosshair before you lift.' : 'You let down before full draw. Keep holding until the sight settles.'; this.hud(); }
      else if (this.phase === 'full') this.release();
    },
    release() {
      const { GAP, gauss } = BR.archery;
      const sw = this.sway(), hx = this.aim.x + sw.x, hy = this.aim.y + sw.y, px = this.spr.px;
      let ix, iy, held;
      if (this.rifle) {
        const disp = 0.2 * (this.dist / 100) * px;
        ix = hx + gauss() * disp; iy = hy + BR.drop(this.dist, this.rf) * px + gauss() * disp;
        const mk = this.marks(), off = this.vit.y - hy;
        held = off < mk[0] / 2 ? 200 : [300, 400, 500][mk.reduce((b, m, i) => (Math.abs(m - off) < Math.abs(mk[b] - off) ? i : b), 0)];
      } else {
        const disp = 0.5 * (this.dist / 30);
        ix = hx + gauss() * disp; iy = hy + (this.dist - this.mid) / 10 * GAP * this.k + gauss() * disp;
        held = this.pins[0]; let bd = 1e9;
        this.pins.forEach(pin => { const d = Math.abs(hy + (pin - this.mid) / 10 * GAP * this.k - this.vit.y); if (d < bd) { bd = d; held = pin; } });
      }
      const sx = ix - this.pos.dx, sy = iy - this.pos.dy, on = this.spr.body(sx, sy), [wx, wy] = this.spr.world(sx, sy);
      const zone = BR.SPR.zone('elk', wx, wy, 'broadside', on);
      this.arrows.push({ x: ix, y: iy });
      if (this.arrows.length > 6) this.arrows.shift();
      this.shots++;
      this.msg = this.coach(zone, held, ix, iy, this.fatigue());
      this.phase = 'flight'; this.t = 0;
      BR.vibe(this.rifle ? 40 : 20);
    },
    offset(x, y) {
      if (Math.abs(x) <= 2 && Math.abs(y) <= 2) return 'dead center';
      const p = [];
      if (Math.abs(y) > 2) p.push(`${Math.abs(y)} in. ${y > 0 ? 'low' : 'high'}`);
      if (Math.abs(x) > 2) p.push(`${Math.abs(x)} in. ${x > 0 ? 'right' : 'left'}`);
      return p.join(', ');
    },
    coach(zone, held, ix, iy, f) {
      const S = BR.S, st = S[this.key], px = this.spr.px;
      const inY = Math.round((iy - this.vit.y) / px), inX = Math.round((ix - this.vit.x) / px), good = zone === 'vitals' || zone === 'heart';
      let text = good ? `Vitals, ${this.offset(inX, inY)}.` : zone === 'miss' ? `Missed the target, ${this.offset(inX, inY)}.` : `Hit the ${zone}, ${this.offset(inX, inY)} of the vitals.`;
      let right;
      if (this.rifle) {
        right = this.dist <= 250 ? 200 : this.dist;
        const name = { 200: 'the crosshair', 300: 'the first hash mark', 400: 'the second hash mark', 500: 'the third hash mark' };
        if (held !== right) text += ` You held ${name[held]}. At ${this.dist} yards hold ${name[right]}.`;
      } else {
        const maxPin = Math.max(...this.pins);
        right = this.pins.includes(this.dist) ? this.dist : null;
        if (right && held !== right) text += ` You held your ${held} pin (${BR.PIN_NAMES[held]}). At ${this.dist} yards use the ${right} pin (${BR.PIN_NAMES[right]}).`;
        else if (!right) text += ` Your sight stops at ${maxPin}. Hold the ${maxPin} pin high, about one pin-gap for every 10 yards past it.`;
      }
      if (f > 0.8) text += this.rifle ? ' The crosshair was swimming. Squeeze sooner.' : ' The pin was swimming. Shoot sooner.';
      if (!st.done && good && held === right) {
        st.step++;
        if (st.step >= this.steps.length) { st.done = true; text += ' That’s the drill. Pick any distance now, or head out.'; }
        else { text += ` Good. Now ${this.steps[st.step]} yards.`; this.pendingDist = this.steps[st.step]; }
        BR.save();
      }
      return text;
    },
    draw(g) {
      g.drawImage(BR.archery.meadowBg(false, BR.ch().look), 0, 0);
      g.drawImage(this.spr.canvas, this.pos.dx, this.pos.dy);
      // scoring lines like a 3D foam target: the vital ring and the heart ring inside it
      const v = this.vit, z = BR.SPR.vitals('elk'), px = this.spr.px;
      const ring = (cx, cy, rx, ry, col, w) => {
        const steps = Math.max(48, Math.round((rx + ry) * 8));
        for (let i = 0; i < steps; i++) {
          const t = i / steps * Math.PI * 2;
          R(g, Math.round(cx + Math.cos(t) * rx), Math.round(cy + Math.sin(t) * ry), w, w, col);
        }
      };
      const hcx = this.pos.dx + this.spr.cx + z.heart[0] * px, hcy = this.pos.dy + this.spr.gy + z.heart[1] * px, hr = Math.max(1.5, z.heart[2] * px);
      ring(v.x, v.y, v.rx + 0.8, v.ry + 0.8, '#f2e6c8', 1);
      ring(v.x, v.y, v.rx, v.ry, '#2a1c10', px > 0.5 ? 2 : 1);
      ring(hcx, hcy, hr, hr, '#b3372f', 1);
      if (px > 0.45) { R(g, Math.round(v.x - v.rx - 7), Math.round(v.y - 3), 5, 1, '#2a1c10'); R(g, Math.round(v.x + v.rx + 3), Math.round(v.y - 3), 5, 1, '#2a1c10'); }
      for (const ar of this.arrows) {
        const x = Math.round(ar.x), y = Math.round(ar.y);
        if (this.rifle) { R(g, x - 1, y - 1, 3, 3, '#111111'); R(g, x, y, 1, 1, '#e9dfcb'); }
        else { BR.line(g, x, y, x - 5, y - 4, '#2a2520'); R(g, x - 7, y - 6, 2, 2, P.amber); R(g, x, y, 1, 1, '#111111'); }
      }
      if (this.phase !== 'drawing' && this.phase !== 'full') {
        if (this.rifle) { R(g, W / 2 - 24, H - 32, 48, 32, '#2a2a2a'); R(g, W / 2 - 8, H - 40, 16, 10, '#1a1a1a'); }
        else R(g, W / 2 - 1, H - 53, 3, 53, '#3b2a1c');
        return;
      }
      const sw = this.sway(), rise = this.phase === 'drawing' ? (1 - this.t / this.drawTime) * 120 : 0;
      const hx = Math.round(this.aim.x + sw.x), hy = Math.round(this.aim.y + sw.y + rise);
      if (this.rifle) BR.archery.drawScope(g, hx, hy, this.marks());
      else BR.archery.drawSight(g, hx, hy, this.pins, this.mid, this.k, sw.x);
    },
    hud() {
      const S = BR.S, st = S[this.key];
      const dists = this.rifle ? [100, 200, 300, 400, 500] : [20, 30, 40, 50, 60];
      const stepName = this.rifle ? { 200: 'crosshair', 300: 'first hash mark', 400: 'second hash mark', 500: 'third hash mark' } : null;
      const task = st.done
        ? `<div class="g5">${dists.map(d => BR.btn('dist', String(d), d === this.dist ? 'sel' : '', d)).join('')}</div>`
        : this.rifle
          ? `<div class="row sm"><span class="hi">Step ${st.step + 1} of 4: ${this.steps[st.step]} yards. Hold the ${stepName[this.steps[st.step]]} on the ring behind the shoulder.</span></div>`
          : `<div class="row sm"><span class="hi">Step ${st.step + 1} of 3: put the ${this.steps[st.step]}-yard pin (${BR.PIN_NAMES[this.steps[st.step]]}) on the ring behind the shoulder.</span></div>`;
      const count = this.midday && !this.rifle ? `${Math.min(this.shots, SESSION)}/${SESSION} for strength` : `${this.shots} shot${this.shots === 1 ? '' : 's'}`;
      const earned = this.midday && !this.rifle && this.shots >= SESSION;
      const legend = this.rifle ? `${this.rf.name} · ${this.zoom.toFixed(0)}× · zero 200 · marks 300/400/500` : `PINS ${BR.pinLegend(this.pins)}`;
      BR.hud(`
        <div class="row"><span class="t">${this.rifle ? 'RIFLE RANGE' : 'RANGE'} · ${this.dist} YD</span><span class="dim">${count}</span></div>
        <div class="row sm"><span>${legend}</span><span id="rg-hold"></span></div>
        <div class="row sm"><span class="${this.msg ? 'toast' : 'dim'}">${this.msg || (this.rifle ? 'Press and hold to get on the rifle. Slide to settle. Lift to fire.' : 'Press and hold on the target to draw. Slide to settle the pin. Lift to shoot.')}</span></div>
        ${task}
        <div class="sp"></div>
        ${BR.btn('done', earned ? (S.strength < 3 ? 'Done · strength +1' : 'Done · strength maxed') : 'Done', 'go')}`);
      this.upd();
    },
    upd() {
      const el = document.getElementById('rg-hold'); if (!el) return;
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
        if (!this.rifle && this.shots >= SESSION) { if (S.strength < 3) S.strength++; BR.log('practice', { strength: S.strength }); }
        if (this.shots > 0) { S.part = 'evening'; S.clock = 16; }
        BR.go('camp'); return;
      }
      BR.go(this.back_);
    },
    back() { this.done(); }
  };
})();

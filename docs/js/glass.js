// Bugle Ridge — glassing: drag to pan a wide hillside, press-and-hold for the binocular loupe, let go on an animal to mark it.
// Nothing identifies the animal for you: the loupe shows antlers, the scope shows points.
(function () {
  const BR = window.BR, { P, W, H, R } = BR;
  const PW = 720, LOUPE = 45, MAG = 3, FENCE = 400;

  function buildPano(area, seed, part, look, zone) {
    const c = document.createElement('canvas'); c.width = PW; c.height = H;
    const o = c.getContext('2d'); o.imageSmoothingEnabled = false;
    const snow = look === 'snow';
    if (part === 'evening') BR.bands(o, [[0, '#231f38'], [40, '#43304a'], [69, '#6e4446'], [85, P.glow]], PW, H);
    else if (snow) BR.bands(o, [[0, '#2a3040'], [35, '#4a5060'], [64, '#8a8a90'], [80, '#a8a8aa']], PW, H);
    else BR.bands(o, [[0, P.dusk], [35, P.dawn], [64, P.glow], [80, '#c98a5a']], PW, H);
    const s1 = (seed % 7) * 0.9, s2 = (seed % 11) * 0.3;
    const ground = snow ? '#b4bcc6' : look === 'breaks' ? '#6e6a4a' : P.meadow, g2 = snow ? '#d8dee6' : look === 'breaks' ? '#8a8058' : P.meadow2, gd = snow ? '#8a949e' : look === 'breaks' ? '#55523a' : P.meadowD;
    BR.ridge(o, 72, 16, 0.009, s1 * 1.7, BR.mix(P.far2, P.dawn, 0.45), PW, H);
    BR.ridge(o, 88, 11, 0.015, s1, P.far2, PW, H);
    BR.ridge(o, 109, 13, 0.009, s2, ground, PW, H);
    const r = BR.rng(seed), top = X => BR.ry(X, 109, 13, 0.009, s2);
    const haze = BR.mix(ground, P.far2, 0.5), dry = BR.mix(ground, P.aspen2, 0.35);
    for (let X = 0; X < PW; X++) {
      const t0 = top(X);
      for (let Y = t0 + 1; Y < H; Y++) {
        const b = BR.BAYER[(Y & 3) * 4 + (X & 3)], far = 1 - (Y - t0) / 93;
        if (b < far * 0.65) R(o, X, Y, 1, 1, haze);
        else if (!snow && Math.sin(X * 0.013 + seed) * Math.cos(Y * 0.07 - X * 0.004) > 0.45 && b < 0.4) R(o, X, Y, 1, 1, dry);
        else if (Y > 261 && b < (Y - 261) / 93) R(o, X, Y, 1, 1, gd);
      }
    }
    for (let i = 0; i < 4600; i++) { const X = (r() * PW) | 0, Y = (107 + r() * 213) | 0; if (Y > top(X) + 16) R(o, X, Y, 1, 1, r() < 0.5 ? g2 : gd); }
    const th = 1.25 - (area.mix.timber + area.mix.deadfall * 0.4) * 1.5;
    const tm = (X, Y) => Math.sin(X * 0.035 - Y * 0.05 + seed) + Math.sin(X * 0.011 + Y * 0.06 + seed * 0.7) * 0.8 > th;
    for (let Y = 117; Y < H + 8; Y += 3) for (let X = 0; X < PW; X += 3) {
      if (Y > top(X) + 5 && tm(X / 1.333, Y / 1.333)) {
        const fade = BR.clamp(1 - (Y - top(X)) / 80, 0, 0.5), ph = 3 + Math.floor((Y - 107) / 40) + ((X + Y) % 2);
        BR.pine(o, X + (Y % 2), Y, ph, BR.mix(P.timber, P.far2, fade));
        if (snow && (X + Y) % 2) R(o, X + (Y % 2) - 1, Y - ph, 3, 1, '#e8ecf0');
      }
    }
    if (area.mix.deadfall > 0.2) for (let i = 0; i < 250; i++) {
      const X = r() * PW, Y = 120 + r() * 200; if (Y < top(X | 0) + 4) continue;
      if (r() < 0.5) R(o, X, Y - 6, 1, 6 + r() * 4, '#6b665c'); else BR.line(o, X, Y, X + 4, Y - 1, '#5a5048');
    }
    if (look === 'sept' && area.mix.open > 0.45) for (let i = 0; i < 20; i++) { const X = 10 + r() * (PW - 20), Y = 128 + r() * 147; if (!tm(X / 1.333, Y / 1.333)) BR.aspen(o, X | 0, Y | 0, 4); }
    for (let i = 0; i < area.mix.shale * 40; i++) {
      const X = r() * PW, Y = 133 + r() * 133;
      for (let k = 0; k < 40; k++) R(o, X + (r() - 0.5) * 16, Y + r() * 8, 1, 1, r() < 0.5 ? P.rock : P.rock2);
    }
    if (zone) for (let Y = top(FENCE) + 2; Y < H; Y += 5) { R(o, FENCE + Math.round(Math.sin(Y * 0.05) * 3), Y, 1, 3, '#3a2e22'); if (Y % 10 === 0) R(o, FENCE + Math.round(Math.sin(Y * 0.05) * 3) - 2, Y + 1, 5, 1, '#8a8272'); }
    return { canvas: c, tm: (X, Y) => tm(X / 1.333, Y / 1.333) };
  }

  function makeGroups(area, seed, part, ch, enc, tm) {
    const r = BR.rng(seed * 7 + 13), groups = [];
    let density = area.elk * (enc.spooked ? 0.5 : 1) * (enc.howled ? 0.3 : 1);
    const place = (spread, avoid) => {
      let gx, gy, tries = 0;
      do { gx = 53 + r() * (PW - 106); gy = 139 + r() * 115; tries++; } while ((tm(gx, gy) || groups.some(g => Math.abs(g.x - gx) < (avoid || 120))) && tries < 80);
      return [gx, gy];
    };
    const addGroup = (animals, spread) => {
      const [gx, gy] = place(spread);
      const elk = animals.map(a => ({
        a: Object.assign({}, a, { zoneOut: ch.zone ? gx > FENCE : false }),
        x: gx + (r() - 0.5) * spread, y: gy + (r() - 0.5) * 10, flip: r() < 0.5, feed: r() < 0.6,
        hideAt: part === 'morning' ? area.sun + 0.3 + r() * 1.0 : 99, showAt: part === 'evening' ? 17 + r() * 1.3 : 0
      }));
      groups.push({ id: groups.length, x: gx, y: gy, elk, found: false });
    };
    const n = r() < density ? (r() < 0.4 ? 2 : 1) : 0;
    for (let k = 0; k < n; k++) addGroup(BR.group(r, ch), ch.species === 'moose' ? 13 : 26);
    if (ch.wolves && r() < ch.wolves) { const k = 1 + ((r() * 3) | 0), black = r() < 0.3; addGroup(Array.from({ length: k }, (_, i) => ({ sp: 'wolf', sex: 'wolf', black: black && i === 0 })), 18); }
    const bearOdds = (ch.bears || 0) * (area.bear ? 2 : 1);
    if (bearOdds && r() < bearOdds) addGroup([{ sp: 'griz', sex: 'bear' }], 2);
    return groups;
  }

  const vis = (k, clock) => clock >= k.showAt && clock < k.hideAt;
  const groupDist = gr => Math.round(BR.clamp(280 + (254 - gr.y) * 2.9, 280, 640));
  BR.glassDist = groupDist;
  const NOUN = { elk: ['elk', 'elk'], moose: ['moose', 'moose'], wolf: ['wolf', 'wolves'], griz: ['bear', 'bears'] };

  function tinyAnimal(g, k, x, y, s) {
    const a = k.a, d = k.flip ? -1 : 1, px = (i, j, c) => R(g, x + i * d * s, y + j * s, s, s, c);
    if (a.sp === 'wolf') {
      const c = a.black ? '#2a2826' : '#8a8376';
      for (let i = 0; i < 4; i++) px(i, 0, c);
      px(0, 1, c); px(3, 1, c); px(4, k.feed ? 1 : -1, c); px(-1, 1, a.black ? '#141312' : '#3e3a35');
      return;
    }
    if (a.sp === 'griz') {
      for (let i = 0; i < 5; i++) { px(i, 0, '#8e6c48'); px(i, 1, '#6b4d31'); }
      px(2, -1, '#977149'); px(0, 2, '#3a2a1a'); px(4, 2, '#3a2a1a'); px(5, k.feed ? 1 : 0, '#6b4d31');
      return;
    }
    if (a.sp === 'moose') {
      for (let i = 0; i < 5; i++) { px(i, 0, '#3a2c22'); px(i, 1, '#2a2019'); }
      px(0, 2, '#b8ab96'); px(4, 2, '#b8ab96'); px(0, 3, '#b8ab96'); px(4, 3, '#b8ab96');
      px(5, k.feed ? 1 : 0, '#3a2c22'); px(6, k.feed ? 2 : 1, '#3a2c22');
      if (a.sex === 'bull') { px(4, -1, '#c7b087'); px(5, -1, '#c7b087'); px(3, -1, '#c7b087'); }
      return;
    }
    for (let i = 0; i < 4; i++) { px(i, 0, P.hide); px(i, 1, P.hide); }
    px(0, 0, P.rump); px(0, 1, P.rump); px(0, 2, P.leg); px(3, 2, P.leg);
    if (k.feed) { px(4, 1, P.mane); px(5, 2, P.mane); }
    else { px(4, -1, P.mane); px(4, 0, P.mane); px(5, -1, P.mane); }
    if (a.sex === 'bull' && !k.feed) {
      if (a.pts <= 2) px(4, -2, P.antler);
      else { px(4, -2, P.antler); px(3, -3, P.antler); px(5, -3, P.antler); }
    }
  }

  BR.scenes.glass = {
    enter(a) {
      const S = BR.S, ch = BR.ch();
      if (!S.enc) S.enc = { area: a.area };
      const e = S.enc;
      this.area = BR.area(e.area);
      this.job = !!e.job;
      if (!e.seed) e.seed = (S.seed * 13 + S.day * 101 + (S.part === 'evening' ? 57 : 0) + e.area.length * 7) >>> 0;
      this.pano = buildPano(this.area, e.seed, S.part, ch.look, ch.zone);
      if (!e.groups) { e.groups = makeGroups(this.area, e.seed, S.part, ch, e, this.pano.tm); e.view = 240; e.startClock = S.clock; }
      this.mode = null; this.touch = null; this.msg = null; this.lastDraw = 0;
      clearInterval(this.timer); this.timer = null;
      this.wake();
      this.hud();
    },
    wake() { this.lastInput = performance.now(); if (!this.timer) this.timer = setInterval(() => this.slow(), 1000); },
    exit() { clearInterval(this.timer); this.timer = null; clearTimeout(this.holdTimer); },
    pause() { clearInterval(this.timer); this.timer = null; },
    over() { const S = BR.S; return S.part === 'morning' ? S.clock >= 11 : S.clock >= BR.dark(); },
    slow() {
      const S = BR.S, e = S.enc; if (!e || !e.groups) return;
      if (performance.now() - this.lastInput > 6000 && !this.touch) { clearInterval(this.timer); this.timer = null; return; }
      const before = this.visibleCount();
      BR.pass(1);
      const r = Math.random;
      e.groups.forEach(gr => gr.elk.forEach(k => { if (r() < 0.12) k.feed = !k.feed; if (r() < 0.04) k.flip = !k.flip; if (r() < 0.2) k.x += (r() - 0.5) * 0.8; }));
      // public land: sooner or later somebody walks in on them
      const pr = BR.ch().pressure ? BR.ch().pressure(S.day) : 0, seenGroups = e.groups.filter(g => g.found && g.elk.some(k => vis(k, S.clock)));
      if (pr && seenGroups.length && !e.bumped && Math.random() < pr * 0.012) {
        e.bumped = true;
        seenGroups.forEach(g => g.elk.forEach(k => { k.hideAt = S.clock; }));
        this.msg = BR.ch().weapon === 'rifle' ? 'An orange vest tops the far ridge. Everything bolts for the timber.' : 'Another bowhunter bugles from the next ridge and walks right into them.';
        BR.log('bumped', { via: 'glass' });
        BR.vibe(60);
      }
      if (this.over() && !this.msg) this.msg = S.part === 'morning' ? 'It’s warm. Everything’s bedded in the timber.' : 'Too dark to shoot. Head back.';
      if (this.mode !== 'pan') BR.draw();
      if (this.visibleCount() !== before || Math.round(S.clock * 60) % 5 === 0) this.hud();
    },
    visibleCount() { const c = BR.S.clock; let n = 0; BR.S.enc.groups.forEach(g => g.elk.forEach(k => { if (vis(k, c)) n++; })); return n; },
    target() {
      const c = BR.S.clock, f = BR.S.enc.groups.filter(g => g.found && g.elk.some(k => vis(k, c)));
      return f.length ? f[f.length - 1] : null;
    },
    draw(g) {
      const e = BR.S.enc, v = Math.round(e.view), clock = BR.S.clock;
      g.drawImage(this.pano.canvas, v, 0, W, H, 0, 0, W, H);
      for (const gr of e.groups) {
        let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
        for (const k of gr.elk) {
          if (!vis(k, clock)) continue;
          const sx = Math.round(k.x - v), sy = Math.round(k.y);
          if (sx < -6 || sx > W + 6) continue;
          const d = k.flip ? -1 : 1, col = k.a.sp === 'moose' ? '#2e231b' : k.a.sp === 'wolf' ? (k.a.black ? '#2a2826' : '#7a746a') : k.a.sp === 'griz' ? '#6b4d31' : '#7d5a38';
          R(g, sx, sy, 3 * d, 2, col);
          if (k.a.sp === 'elk') R(g, sx, sy, 1, 2, P.rump);
          if (!k.feed) R(g, sx + 3 * d, sy - 1, 1, 1, k.a.sp === 'elk' ? P.mane : col);
          x0 = Math.min(x0, sx - 4); x1 = Math.max(x1, sx + 4); y0 = Math.min(y0, sy - 4); y1 = Math.max(y1, sy + 4);
        }
        if (gr.found && x1 > x0) {
          const a = P.amber;
          R(g, x0, y0, 3, 1, a); R(g, x0, y0, 1, 3, a); R(g, x1 - 2, y0, 3, 1, a); R(g, x1, y0, 1, 3, a);
          R(g, x0, y1, 3, 1, a); R(g, x0, y1 - 2, 1, 3, a); R(g, x1 - 2, y1, 3, 1, a); R(g, x1, y1 - 2, 1, 3, a);
        }
      }
      if (this.mode === 'loupe' && this.touch) this.drawLoupe(g, this.touch.x, this.touch.y, v, clock);
    },
    drawLoupe(g, tx, ty, v, clock) {
      const lx = BR.clamp(Math.round(tx), LOUPE + 2, W - LOUPE - 2), ly = BR.clamp(Math.round(ty) - 77, LOUPE + 2, H - LOUPE - 2), src = (LOUPE * 2) / MAG;
      g.save();
      g.beginPath(); g.arc(lx, ly, LOUPE, 0, Math.PI * 2); g.clip();
      g.drawImage(this.pano.canvas, tx + v - src / 2, ty - src / 2, src, src, lx - LOUPE, ly - LOUPE, LOUPE * 2, LOUPE * 2);
      for (const gr of BR.S.enc.groups) for (const k of gr.elk) {
        if (!vis(k, clock)) continue;
        const dx = (k.x - (tx + v)) * MAG + lx, dy = (k.y - ty) * MAG + ly;
        if (Math.abs(dx - lx) > LOUPE + 16 || Math.abs(dy - ly) > LOUPE + 12) continue;
        tinyAnimal(g, k, Math.round(dx), Math.round(dy), MAG);
      }
      g.restore();
      BR.ring(g, lx, ly, LOUPE, P.ink, 2); BR.ring(g, lx, ly, LOUPE + 1, P.ink, 2);
      R(g, lx - 3, ly, 2, 1, P.amber); R(g, lx + 2, ly, 2, 1, P.amber); R(g, lx, ly - 3, 1, 2, P.amber); R(g, lx, ly + 2, 1, 2, P.amber);
    },
    down(p) {
      this.wake();
      this.touch = { x: p.x, y: p.y, sx: p.x, view: BR.S.enc.view };
      this.mode = 'pending';
      clearTimeout(this.holdTimer);
      this.holdTimer = setTimeout(() => { if (this.mode === 'pending') { this.mode = 'loupe'; BR.draw(); } }, 170);
    },
    move(p) {
      const t = this.touch; if (!t) return;
      t.x = p.x; t.y = p.y;
      if (this.mode === 'pending' && Math.abs(p.x - t.sx) > 4) this.mode = 'pan';
      if (this.mode === 'pan') BR.S.enc.view = BR.clamp(t.view - (p.x - t.sx), 0, PW - W);
      if (this.mode === 'pan' || this.mode === 'loupe') { const now = performance.now(); if (now - this.lastDraw > 33) { this.lastDraw = now; BR.draw(); } }
    },
    up(p, cancel) {
      clearTimeout(this.holdTimer);
      const m = this.mode;
      this.mode = null;
      if (m === 'loupe' && !cancel && this.touch) this.mark(this.touch.x, this.touch.y);
      this.touch = null;
      BR.draw(); BR.save();
    },
    mark(tx, ty) {
      const S = BR.S, e = S.enc, px = tx + e.view, clock = S.clock;
      let best = null, bd = 6;
      e.groups.forEach(gr => gr.elk.forEach(k => { if (!vis(k, clock)) return; const d = Math.hypot(k.x + (k.flip ? -1 : 1) - px, k.y - ty); if (d < bd) { bd = d; best = gr; } }));
      if (!best) { this.msg = 'Nothing there. Pick apart the timber edges.'; this.hud(); return; }
      if (best.found) { this.msg = 'Already marked those.'; this.hud(); return; }
      best.found = true;
      S.stats.spotted++;
      BR.log('spot', { area: e.area, sp: best.elk[0].a.sp, n: best.elk.length });
      BR.vibe(40);
      const sp = best.elk[0].a.sp;
      this.msg = sp === 'wolf' ? 'Grey shapes moving along the timber.' : sp === 'griz' ? 'A big brown hump turning rocks.' : 'Marked. Get the glass on them.';
      this.hud();
    },
    counts() {
      const c = BR.S.clock, n = {};
      BR.S.enc.groups.filter(g => g.found).forEach(g => g.elk.forEach(k => { if (vis(k, c)) n[k.a.sp] = (n[k.a.sp] || 0) + 1; }));
      return Object.entries(n).map(([sp, k]) => `${k} ${NOUN[sp][k === 1 ? 0 : 1]}`).join(' · ');
    },
    hud() {
      const S = BR.S, ch = BR.ch(), e = S.enc, t = this.target(), over = this.over();
      const counts = this.counts();
      let status = this.msg || 'Drag to pan · hold to glass · let go on an animal';
      if (t && !this.msg) {
        const leaving = S.part === 'morning' && S.clock > Math.min(...t.elk.map(k => k.hideAt)) - 0.35;
        status = `≈${groupDist(t)} yd · ${leaving ? 'moving toward the timber' : 'feeding in the open'}`;
      }
      const rifle = ch.weapon === 'rifle';
      let btns;
      if (this.job) {
        let bulls = 0; e.groups.forEach(g => { if (g.found) g.elk.forEach(k => { if (k.a.sex === 'bull') bulls++; }); });
        btns = BR.btn('report', 'Report back to the outfitter', 'go', null, false, `$60 × ${bulls} bull${bulls === 1 ? '' : 's'} = $${60 * bulls}`);
      } else {
        const callable = !t || (t.elk[0].a.sp !== 'wolf' && t.elk[0].a.sp !== 'griz');
        const d = t ? groupDist(t) : 0, cap = ch.guide ? 250 : 500, far = t && d > cap;
        btns = (rifle ? BR.btn('shoot', 'Shoot from here', t && !over && !far ? 'go' : '', null, !t || over || far, !t ? 'Mark something first' : far ? (ch.guide ? `≈${d} yd · too far for Sam` : `≈${d} yd · too far to shoot from here`) : `Get on the rifle off your pack · ≈${d} yd`) : '')
          + BR.btn('plan', 'Plan a stalk', !rifle && t && !over ? 'go' : '', null, !t || over, t ? 'Map the approach' : 'Spot something first')
          + BR.btn('call', 'Set up and call', '', null, over || !callable, t ? 'From cover below them' : 'Blind, hoping one is close')
          + BR.btn('leave', 'Head back to camp', '');
      }
      BR.hud(`
        <div class="row"><span class="t">${this.job ? 'SCOUTING' : 'GLASSING'}</span><span class="hi">${BR.fmt(S.clock)}</span></div>
        <div class="row"><span>SPOTTED</span>${counts ? `<span class="hi">${counts}</span>` : '<span class="dim">Nothing yet</span>'}</div>
        <div class="row sm"><span class="${this.msg ? 'toast' : 'dim'}">${status}</span></div>
        <div class="sp"></div>${btns}`);
      this.msg = null;
    },
    act(a) {
      const S = BR.S, e = S.enc, t = this.target(), c = S.clock;
      if (a === 'plan' && t) {
        e.target = { x: t.x / 3, dist: groupDist(t), animals: t.elk.filter(k => vis(k, c)).map(k => ({ a: k.a, hideAt: k.hideAt })), zoneX: BR.ch().zone ? FENCE / 3 : null };
        e.map = null; e.elk = null; e.route = []; e.st = null;
        BR.go('plan');
      } else if (a === 'shoot' && t) {
        const d = groupDist(t), r = Math.random;
        e.shot = { options: t.elk.filter(k => vis(k, c)).map(k => ({ a: k.a, range: Math.round(d + (r() - 0.5) * 16), angle: r() < 0.55 ? 'broadside' : r() < 0.5 ? 'quartering-away' : 'quartering-to' })), i: 0, from: 'glass', alert: 0 };
        BR.go('shot');
      } else if (a === 'call') {
        const lead = t ? t.elk[0].a : null;
        BR.go('call', { area: e.area, dist: t ? Math.max(140, groupDist(t) - 260) : null, bull: lead ? lead.sex === 'bull' : null, blind: !t });
      } else if (a === 'report') {
        let bulls = 0; e.groups.forEach(g => { if (g.found) g.elk.forEach(k => { if (k.a.sex === 'bull') bulls++; }); });
        S.cash += 60 * bulls; S.stats.jobs++;
        BR.log('job', { kind: 'scout', pay: 60 * bulls });
        BR.endHunt();
      } else if (a === 'leave') {
        if (!e.groups.some(g => g.found)) BR.log('noelk', { area: e.area });
        BR.endHunt();
      }
    },
    back() { BR.confirm('Leave this hunt?', `Head back to camp. The ${BR.S.part} hunt is over.`, 'Head back', () => this.act('leave')); }
  };
})();

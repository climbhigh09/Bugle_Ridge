// Bugle Ridge — glassing: drag to pan a wide hillside, press-and-hold for the binocular loupe, let go on an elk to mark it.
(function () {
  const BR = window.BR, { P, W, H, R } = BR;
  const PW = 540, LOUPE = 34, MAG = 3;

  function buildPano(area, seed, part) {
    const c = document.createElement('canvas'); c.width = PW; c.height = H;
    const o = c.getContext('2d'); o.imageSmoothingEnabled = false;
    if (part === 'evening') BR.bands(o, [[0, '#231f38'], [30, '#43304a'], [52, '#6e4446'], [64, P.glow]], PW, H);
    else BR.bands(o, [[0, P.dusk], [26, P.dawn], [48, P.glow], [60, '#c98a5a']], PW, H);
    const s1 = (seed % 7) * 0.9, s2 = (seed % 11) * 0.3;
    BR.ridge(o, 54, 12, 0.012, s1 * 1.7, BR.mix(P.far2, P.dawn, 0.45), PW, H);
    BR.ridge(o, 66, 8, 0.02, s1, P.far2, PW, H);
    BR.ridge(o, 82, 10, 0.012, s2, P.meadow, PW, H);
    const r = BR.rng(seed), top = X => BR.ry(X, 82, 10, 0.012, s2);
    // atmospheric haze on the far hillside, dry grass patches, darker foreground
    const haze = BR.mix(P.meadow, P.far2, 0.5), dry = BR.mix(P.meadow, P.aspen2, 0.35);
    for (let X = 0; X < PW; X++) {
      const t0 = top(X);
      for (let Y = t0 + 1; Y < H; Y++) {
        const b = BR.BAYER[(Y & 3) * 4 + (X & 3)], far = 1 - (Y - t0) / 70;
        if (b < far * 0.65) R(o, X, Y, 1, 1, haze);
        else if (Math.sin(X * 0.013 + seed) * Math.cos(Y * 0.07 - X * 0.004) > 0.45 && b < 0.4) R(o, X, Y, 1, 1, dry);
        else if (Y > 196 && b < (Y - 196) / 70) R(o, X, Y, 1, 1, P.meadowD);
      }
    }
    for (let i = 0; i < 2600; i++) { const X = (r() * PW) | 0, Y = (80 + r() * 160) | 0; if (Y > top(X) + 12) R(o, X, Y, 1, 1, r() < 0.5 ? P.meadow2 : P.meadowD); }
    const th = 1.25 - (area.mix.timber + area.mix.deadfall * 0.4) * 1.5;
    const tm = (X, Y) => Math.sin(X * 0.035 - Y * 0.05 + seed) + Math.sin(X * 0.011 + Y * 0.06 + seed * 0.7) * 0.8 > th;
    for (let Y = 88; Y < H + 8; Y += 3) for (let X = 0; X < PW; X += 3) {
      if (Y > top(X) + 4 && tm(X, Y)) {
        const fade = BR.clamp(1 - (Y - top(X)) / 60, 0, 0.5);
        BR.pine(o, X + (Y % 2), Y, 3 + Math.floor((Y - 80) / 40) + ((X + Y) % 2), BR.mix(P.timber, P.far2, fade));
      }
    }
    if (area.mix.deadfall > 0.2) {
      for (let i = 0; i < 140; i++) {
        const X = r() * PW, Y = 90 + r() * 150; if (Y < top(X | 0) + 3) continue;
        if (r() < 0.5) R(o, X, Y - 6, 1, 6 + r() * 4, '#6b665c'); else BR.line(o, X, Y, X + 4, Y - 1, '#5a5048');
      }
    }
    if (area.mix.open > 0.45) for (let i = 0; i < 14; i++) { const X = 10 + r() * (PW - 20), Y = 96 + r() * 110; if (!tm(X, Y)) BR.aspen(o, X | 0, Y | 0, 3); }
    for (let i = 0; i < area.mix.shale * 30; i++) {
      const X = r() * PW, Y = 100 + r() * 100;
      for (let k = 0; k < 40; k++) R(o, X + (r() - 0.5) * 16, Y + r() * 8, 1, 1, r() < 0.5 ? P.rock : P.rock2);
    }
    return { canvas: c, tm };
  }

  function makeGroups(area, seed, part, day, tm) {
    const r = BR.rng(seed * 7 + 13), groups = [], rut = BR.dayInfo(day).rutLevel;
    const n = r() < area.elk ? (r() < 0.4 ? 2 : 1) : 0;
    for (let k = 0; k < n; k++) {
      let gx, gy, tries = 0;
      do { gx = 40 + r() * (PW - 80); gy = 104 + r() * 86; tries++; } while ((tm(gx, gy) || (k && Math.abs(gx - groups[0].x) < 90)) && tries < 80);
      const size = 2 + Math.floor(r() * 5), elk = [];
      for (let i = 0; i < size; i++) {
        elk.push({
          x: gx + (r() - 0.5) * 20, y: gy + (r() - 0.5) * 8, bull: false, flip: r() < 0.5, feed: r() < 0.6,
          hideAt: part === 'morning' ? area.sun + 0.3 + r() * 1.0 : 99,
          showAt: part === 'evening' ? 17 + r() * 1.3 : 0
        });
      }
      if (r() < 0.45 + rut * 0.2) elk[0].bull = true;
      groups.push({ id: k, x: gx, y: gy, elk, found: false, bulls: 0, cows: 0 });
    }
    return groups;
  }

  const vis = (k, clock) => clock >= k.showAt && clock < k.hideAt;
  const groupDist = gr => Math.round(BR.clamp(300 + (200 - gr.y) * 3.2, 280, 640));

  BR.scenes.glass = {
    enter(a) {
      const S = BR.S;
      if (!S.enc) S.enc = { area: a.area };
      const e = S.enc;
      this.area = BR.AREAS[e.area];
      this.job = !!e.job;
      if (!e.seed) e.seed = (S.seed * 13 + S.day * 101 + (S.part === 'evening' ? 57 : 0) + e.area.length * 7) >>> 0;
      this.pano = buildPano(this.area, e.seed, S.part);
      if (!e.groups) { e.groups = makeGroups(this.area, e.seed, S.part, S.day, this.pano.tm); e.view = 180; e.startClock = S.clock; }
      this.mode = null; this.touch = null; this.msg = null; this.lastDraw = 0;
      clearInterval(this.timer); this.timer = null;
      this.wake();
      this.hud();
    },
    // daylight only burns while you're actually glassing; idle for 6 s and the clock (and all redraws) stop
    wake() {
      this.lastInput = performance.now();
      if (!this.timer) this.timer = setInterval(() => this.slow(), 1000);
    },
    exit() { clearInterval(this.timer); this.timer = null; clearTimeout(this.holdTimer); },
    over() { const S = BR.S; return S.part === 'morning' ? S.clock >= 11 : S.clock >= 19.6; },

    // one tick per real second: a minute of daylight passes, elk shuffle (the "tells"), bedding and dark are enforced
    slow() {
      const S = BR.S, e = S.enc; if (!e || !e.groups) return;
      if (performance.now() - this.lastInput > 6000 && !this.touch) { clearInterval(this.timer); this.timer = null; return; }
      const before = this.visibleCount();
      BR.pass(1);
      const r = Math.random;
      e.groups.forEach(gr => gr.elk.forEach(k => { if (r() < 0.12) k.feed = !k.feed; if (r() < 0.04) k.flip = !k.flip; if (r() < 0.2) k.x += (r() - 0.5) * 0.8; }));
      if (this.over() && !this.msg) this.msg = S.part === 'morning' ? 'It’s warm. Elk are bedded in the timber.' : 'Too dark to shoot. Head back.';
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
          const d = k.flip ? -1 : 1;
          R(g, sx, sy, 3 * d, 2, '#7d5a38'); R(g, sx, sy, 1, 2, P.rump);
          if (!k.feed) R(g, sx + 3 * d, sy - 1, 1, 1, P.mane);
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
      const lx = BR.clamp(Math.round(tx), LOUPE + 2, W - LOUPE - 2), ly = BR.clamp(Math.round(ty) - 58, LOUPE + 2, H - LOUPE - 2);
      const src = (LOUPE * 2) / MAG;
      g.save();
      g.beginPath(); g.arc(lx, ly, LOUPE, 0, Math.PI * 2); g.clip();
      g.drawImage(this.pano.canvas, tx + v - src / 2, ty - src / 2, src, src, lx - LOUPE, ly - LOUPE, LOUPE * 2, LOUPE * 2);
      for (const gr of BR.S.enc.groups) for (const k of gr.elk) {
        if (!vis(k, clock)) continue;
        const dx = (k.x - (tx + v)) * MAG + lx, dy = (k.y - ty) * MAG + ly;
        if (Math.abs(dx - lx) > LOUPE + 16 || Math.abs(dy - ly) > LOUPE + 12) continue;
        BR.tiny(g, Math.round(dx), Math.round(dy), k.flip, k.bull, !k.feed, MAG);
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
      if (this.mode === 'pan' || this.mode === 'loupe') {
        const now = performance.now();
        if (now - this.lastDraw > 33) { this.lastDraw = now; BR.draw(); }
      }
    },
    up(p, cancel) {
      clearTimeout(this.holdTimer);
      const m = this.mode;
      this.mode = null;
      if (m === 'loupe' && !cancel) this.mark(this.touch.x, this.touch.y);
      this.touch = null;
      BR.draw();
      BR.save();
    },
    mark(tx, ty) {
      const S = BR.S, e = S.enc, px = tx + e.view, clock = S.clock;
      let best = null, bd = 6;
      e.groups.forEach(gr => gr.elk.forEach(k => { if (!vis(k, clock)) return; const d = Math.hypot(k.x + (k.flip ? -1 : 1) - px, k.y - ty); if (d < bd) { bd = d; best = gr; } }));
      if (!best) { this.msg = 'Nothing there. Pick apart the timber edges.'; this.hud(); return; }
      if (best.found) { this.msg = 'Already marked that bunch.'; this.hud(); return; }
      best.found = true;
      best.elk.forEach(k => { if (vis(k, clock)) { if (k.bull) best.bulls++; else best.cows++; } });
      S.stats.bullsSpotted += best.bulls;
      BR.log('spot', { bulls: best.bulls, cows: best.cows, area: e.area });
      BR.vibe(40);
      this.msg = best.bulls ? 'Bull! Antlers catching the light.' : 'Cows. Where there’s cows…';
      this.hud();
    },

    hud() {
      const S = BR.S, e = S.enc, t = this.target(), found = e.groups.filter(g => g.found);
      let bulls = 0, cows = 0;
      found.forEach(g => { bulls += g.bulls; cows += g.cows; });
      const spotted = found.length ? `<span class="hi">${bulls} bull${bulls === 1 ? '' : 's'} · ${cows} cow${cows === 1 ? '' : 's'}</span>` : '<span class="dim">Nothing yet</span>';
      let status = this.msg || 'Drag to pan · hold to glass · let go on an elk';
      if (t && !this.msg) {
        const leaving = S.part === 'morning' && S.clock > Math.min(...t.elk.map(k => k.hideAt)) - 0.35;
        status = `≈${groupDist(t)} yd · ${leaving ? 'feeding toward the timber' : 'feeding in the open'}`;
      }
      const over = this.over();
      let btns;
      if (this.job) {
        btns = BR.btn('report', 'Report back to Dell', 'go', null, false, `$60 × ${bulls} bull${bulls === 1 ? '' : 's'} = $${60 * bulls}`);
      } else {
        btns = BR.btn('plan', 'Plan a stalk', t && !over ? 'go' : '', null, !t || over, t ? 'Map the approach' : 'Spot elk first')
          + BR.btn('call', 'Set up and call', '', null, over, t ? 'From the timber edge below them' : 'Blind, hoping a bull is close')
          + BR.btn('leave', 'Head back to camp', '');
      }
      BR.hud(`
        <div class="row"><span class="t">${this.job ? 'SCOUTING FOR DELL' : 'GLASSING · 10×42'}</span><span class="hi">${BR.fmt(S.clock)}</span></div>
        <div class="row"><span>SPOTTED</span>${spotted}</div>
        <div class="row sm"><span class="${this.msg ? 'toast' : 'dim'}">${status}</span></div>
        <div class="sp"></div>${btns}`);
      this.msg = null;
    },

    act(a) {
      const S = BR.S, e = S.enc, t = this.target();
      if (a === 'plan' && t) {
        e.target = { x: t.x / 3, dist: groupDist(t), elk: t.elk.filter(k => vis(k, S.clock)).map(k => ({ bull: k.bull, hideAt: k.hideAt })) };
        e.map = null; e.elk = null; e.route = []; e.st = null;
        BR.go('plan');
      } else if (a === 'call') {
        const bull = t ? t.elk.some(k => k.bull) : null;
        e.groups = null;
        BR.go('call', { area: e.area, dist: t ? Math.max(140, groupDist(t) - 260) : null, bull, blind: !t });
      } else if (a === 'report') {
        let bulls = 0; e.groups.forEach(g => { bulls += g.bulls; });
        S.cash += 60 * bulls; S.stats.jobs++;
        BR.log('job', { kind: 'scout', pay: 60 * bulls });
        BR.endHunt();
      } else if (a === 'leave') {
        if (!e.groups.some(g => g.found)) BR.log('noelk', { area: e.area, arrived: e.startClock, left: S.clock });
        BR.endHunt();
      }
    },
    back() { BR.confirm('Leave this hunt?', `Head back to camp. The ${BR.S.part} hunt is over.`, 'Head back', () => this.act('leave')); }
  };
})();

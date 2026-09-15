// Bugle Ridge — stalk planning on a topo map, then the real-time creep. Uphill is always the top of the map. 1 px = 3 yd.
(function () {
  const BR = window.BR, { P, W, H, R } = BR;
  const CELL = 6, CW = 40, CH = 54, YD = 3, START = { x: 120, y: 304 };
  const OPEN = 0, TIMBER = 1, DEAD = 2, SHALE = 3;
  const TER = [
    { name: 'open', speed: 1.0, noise: 0.15, sight: 100, cover: 0 },
    { name: 'timber', speed: 0.8, noise: 0.3, sight: 24, cover: 0.9 },
    { name: 'deadfall', speed: 0.5, noise: 1.0, sight: 50, cover: 0.6 },
    { name: 'shale', speed: 0.7, noise: 1.3, sight: 100, cover: 0 }
  ];
  // Pace in px per real second (1 px = 3 yd, 1 real second = 1 in-game minute), before terrain:
  // hike 60 yd/min when more than 150 yd out and unseen · sneak 24 yd/min · creep 10 yd/min inside 60 yd.
  const PACE = { hike: 20, sneak: 8, creep: 3.5 };
  const paceFor = (dist, ter) => (dist > 50 && (ter.cover >= 0.5 || dist > ter.sight) ? 'hike' : dist > 20 ? 'sneak' : 'creep');
  BR.stalkPace = paceFor;
  BR.maxShot = () => (BR.ch().weapon === 'bow' ? 80 : 600);

  function quantile(arr, q) { const s = arr.slice().sort((a, b) => a - b); return s[BR.clamp(Math.floor(q * s.length), 0, s.length - 1)]; }
  function genMap(area, seed, elkC) {
    const n1 = (x, y) => Math.sin(x * 0.31 + seed) + Math.sin(y * 0.23 - x * 0.11 + seed * 0.3) * 0.9 + Math.sin((x + y) * 0.17 + seed * 0.7) * 0.6;
    const n2 = (x, y) => Math.sin(x * 0.53 - y * 0.21 + seed * 1.3) + Math.cos(y * 0.47 + x * 0.13 + seed * 0.9) * 0.8;
    const n3 = (x, y) => Math.sin(x * 0.19 + y * 0.41 + seed * 2.1) + Math.sin(x * 0.61 - seed) * 0.5;
    const v1 = [], v2 = [], v3 = [];
    for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) { v1.push(n1(x, y)); v2.push(n2(x, y)); v3.push(n3(x, y)); }
    const m = area.mix;
    const t1 = quantile(v1, 1 - m.timber), t2 = quantile(v2, 1 - m.deadfall / Math.max(0.05, 1 - m.timber)), t3 = quantile(v3, 1 - m.shale / Math.max(0.05, 1 - m.timber - m.deadfall));
    const grid = new Array(CW * CH);
    for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
      const i = y * CW + x, cx = x * CELL + 3, cy = y * CELL + 3;
      let t = OPEN;
      if (v1[i] > t1) t = TIMBER; else if (m.deadfall > 0 && v2[i] > t2) t = DEAD; else if (m.shale > 0 && v3[i] > t3) t = SHALE;
      if (Math.hypot(cx - elkC.x, cy - elkC.y) < 20 || Math.hypot(cx - START.x, cy - START.y) < 10) t = OPEN;
      grid[i] = t;
    }
    return grid;
  }
  function terrainAt(grid, X, Y) {
    const jx = X + Math.sin(Y * 0.7 + X * 0.3) * 2.5, jy = Y + Math.cos(X * 0.6 - Y * 0.2) * 2.5;
    return grid[BR.clamp((jy / CELL) | 0, 0, CH - 1) * CW + BR.clamp((jx / CELL) | 0, 0, CW - 1)];
  }
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const hash = (x, y, s) => { let n = (x * 374761393 + y * 668265263 + s * 1442695) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  function renderMap(grid, seed, snow) {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const o = c.getContext('2d'), img = o.createImageData(W, H), d = img.data;
    const C = {
      tBase: hex('#17271b'), tCrown: hex(snow ? '#5a6e62' : '#2e4c33'), tMid: hex('#213a26'), tShadow: hex('#0c150e'),
      o1: hex(snow ? '#c4ccd6' : '#52643f'), o2: hex(snow ? '#b4bcc8' : '#4a5b3a'), oDry: hex(snow ? '#d8dee6' : '#6b6a45'), oTuft: hex(snow ? '#9aa4b0' : '#687c4b'),
      dBase: hex(snow ? '#a0a8b2' : '#4b5034'), dLog: hex('#9a907c'), dLogSh: hex('#2e2a1f'), s1: hex('#5f5e59'), s2: hex('#88857c'), s3: hex('#42413d')
    };
    const hgt = (X, Y) => Math.sin(X * 0.03 + seed * 0.1) * 1.2 + Math.cos(Y * 0.025 - X * 0.01) * 1.1 - Y * 0.02 + Math.sin((X - Y) * 0.07 + seed) * 0.18;
    for (let Y = 0; Y < H; Y++) for (let X = 0; X < W; X++) {
      const t = terrainAt(grid, X, Y);
      const gx = hgt(X + 1, Y) - hgt(X - 1, Y), gy = hgt(X, Y + 1) - hgt(X, Y - 1);
      let light = 1 + BR.clamp((gx + gy + 0.04) * 7, -0.3, 0.3);
      const band = Math.floor(hgt(X, Y) * 3);
      if (band !== Math.floor(hgt(X + 1, Y) * 3) || band !== Math.floor(hgt(X, Y + 1) * 3)) light *= 0.88;
      let col;
      if (t === TIMBER) {
        const cx = Math.floor(X / 4), cy = Math.floor(Y / 4);
        const dx = X - (cx * 4 + 1 + hash(cx, cy, seed) * 2), dy = Y - (cy * 4 + 1 + hash(cy, cx, seed + 1) * 2), rr = Math.hypot(dx, dy);
        col = rr < 1 ? C.tCrown : rr < 1.9 ? (dx + dy > 0.5 ? C.tShadow : C.tMid) : C.tBase;
      } else if (t === DEAD) {
        const cx = Math.floor(X / 5), cy = Math.floor(Y / 5), hx = hash(cx, cy, seed + 7), ly = Y - cy * 5;
        const u = (X - cx * 5) - ly * (hx > 0.67 ? 1 : -1) - (hx > 0.67 ? 0 : 4);
        col = hx > 0.35 && ly < 4 && Math.abs(u) < 0.6 ? C.dLog : hx > 0.35 && ly < 4 && Math.abs(u - 1) < 0.6 ? C.dLogSh : C.dBase;
      } else if (t === SHALE) {
        const hs = hash(X, Y, seed + 3);
        col = hs < 0.18 ? C.s2 : hs < 0.36 ? C.s3 : C.s1;
      } else {
        const moist = Math.sin(X * 0.05 + seed) * Math.cos(Y * 0.045 - seed);
        col = moist > 0.35 ? C.o1 : moist < -0.45 ? C.oDry : C.o2;
        if (hash(X, Y, seed + 5) < 0.07) col = C.oTuft;
        if (terrainAt(grid, X - 2, Y - 2) === TIMBER || terrainAt(grid, X - 1, Y - 3) === TIMBER) light *= 0.7;
      }
      const i = (Y * W + X) * 4;
      d[i] = Math.min(255, col[0] * light); d[i + 1] = Math.min(255, col[1] * light); d[i + 2] = Math.min(255, col[2] * light); d[i + 3] = 255;
    }
    o.putImageData(img, 0, 0);
    return c;
  }
  function mapFor(e) {
    const c = BR.planCache;
    if (c && c.seed === e.map.seed && c.look === BR.ch().look) return c;
    const grid = genMap(BR.area(e.area), e.map.seed, { x: e.map.ex, y: e.map.ey });
    return (BR.planCache = { seed: e.map.seed, look: BR.ch().look, grid, canvas: renderMap(grid, e.map.seed, BR.ch().look === 'snow') });
  }

  const TOP = { elk: [P.hide, P.rump, P.mane], moose: ['#3a2c22', '#2a2019', '#2a2019'], wolf: ['#8a8376', '#6a645c', '#5a554e'], griz: ['#8e6c48', '#6b4d31', '#6b4d31'] };
  function animalTop(g, k, x, y, z, headUp) {
    const a = k.a, f = k.dx > 0, c = TOP[a.sp] || TOP.elk, len = a.sp === 'wolf' ? 3 : a.sp === 'moose' ? 5 : 4;
    R(g, x - 2 * z, y - z, len * z, 2 * z, a.black ? '#2a2826' : c[0]);
    R(g, f ? x - 2 * z : x + (len - 3) * z, y - z, z, 2 * z, c[1]);
    R(g, f ? x + (len - 2) * z : x - 3 * z, y - (headUp ? z : 0), z, z, c[2]);
    if (a.sex === 'bull') { const col = a.sp === 'moose' ? '#c7b087' : P.antler; R(g, f ? x + (len - 2) * z : x - 3 * z, y - 2 * z, z, z, col); if (a.pts !== 1) R(g, f ? x + (len - 3) * z : x - 2 * z, y - 2 * z, z, z, col); }
  }
  function windBox(g, sc, label) {
    R(g, W - 26, 32, 22, 22, 'rgba(7,8,11,.8)');
    const cx = W - 15, cy = 43;
    BR.line(g, cx - sc.x * 8, cy - sc.y * 8, cx + sc.x * 8, cy + sc.y * 8, label);
    R(g, cx + sc.x * 8 - 1, cy + sc.y * 8 - 1, 3, 3, label);
  }
  function fence(g, zx, x0, y0, z) {
    if (zx == null) return;
    for (let Y = 0; Y < H; Y += 4) { const x = Math.round((zx + Math.sin(Y * 0.05) * 1 - x0) * z); R(g, x, Y, 1, 2, '#3a2e22'); if (Y % 8 === 0) R(g, x - 1, Y, 3, 1, '#8a8272'); }
  }

  function routeStats(grid, area, e, startClock) {
    const pts = [START].concat(e.route), ec = { x: e.map.ex, y: e.map.ey };
    let open = 0, total = 0, noise = 0, minutes = 0, scentAt = -1;
    for (let s = 0; s < pts.length - 1; s++) {
      const a = pts[s], b = pts[s + 1], L = Math.hypot(b.x - a.x, b.y - a.y), n = Math.max(1, Math.ceil(L / 2)), step = L / n;
      for (let k = 0; k < n; k++) {
        const x = a.x + (b.x - a.x) * k / n, y = a.y + (b.y - a.y) * k / n, ter = TER[terrainAt(grid, x, y)];
        const pace = PACE[paceFor(Math.hypot(ec.x - x, ec.y - y), ter)];
        total += step; if (ter.cover < 0.5) open += step; noise += ter.noise * step; minutes += step / (pace * ter.speed);
        if (scentAt < 0) {
          const sc = BR.scent(area, startClock + minutes / 60), dx = ec.x - x, dy = ec.y - y, d = Math.hypot(dx, dy);
          if (d > 0 && d < 83 && (sc.x * dx + sc.y * dy) / d > 0.72) scentAt = s + 1;
        }
      }
    }
    const last = pts[pts.length - 1];
    return { cover: total ? Math.round(100 * (1 - open / total)) : 0, noise: total ? noise / total : 0, minutes: Math.round(minutes), arrive: startClock + minutes / 60, endYd: Math.round(Math.hypot(last.x - ec.x, last.y - ec.y) * YD), scentAt };
  }

  // ---------------- PLAN ----------------
  BR.scenes.plan = {
    enter() {
      const S = BR.S, e = S.enc;
      this.area = BR.area(e.area);
      if (!e.map) {
        const ex = BR.clamp(e.target.x, 30, 210), ey = BR.clamp(START.y - e.target.dist / YD, 16, 200), seed = (e.seed || 1) + 911, r = BR.rng(seed);
        e.map = { seed, ex, ey };
        e.elk = e.target.animals.map(k => ({ x: ex + (r() - 0.5) * 22, y: ey + (r() - 0.5) * 12, a: k.a, hideAt: k.hideAt, dx: r() < 0.5 ? 1 : -1, up: false }));
        let lead = e.elk.findIndex(k => k.a.sex === 'cow'); if (lead < 0) lead = 0;
        e.elk[lead].lead = true;
        e.route = [];
      }
      this.m = mapFor(e);
      this.hud();
    },
    draw(g) {
      const S = BR.S, e = S.enc;
      g.drawImage(this.m.canvas, 0, 0);
      fence(g, e.target.zoneX, 0, 0, 1);
      e.elk.forEach(k => animalTop(g, k, Math.round(k.x), Math.round(k.y), 1, false));
      const pts = [START].concat(e.route);
      for (let s = 0; s < pts.length - 1; s++) BR.line(g, pts[s].x, pts[s].y, pts[s + 1].x, pts[s + 1].y, P.amber, 3);
      e.route.forEach(p => { R(g, p.x - 1, p.y - 1, 3, 3, P.bone); R(g, p.x, p.y, 1, 1, P.ink); });
      R(g, START.x - 2, START.y - 2, 5, 5, P.amber); R(g, START.x - 1, START.y - 1, 3, 3, '#2a2213');
      if (S.items.windChecker) {
        const st = routeStats(this.m.grid, this.area, e, S.clock), sc = BR.scent(this.area, st.arrive), last = pts[pts.length - 1];
        BR.line(g, last.x, last.y, last.x + sc.x * 40, last.y + sc.y * 40, P.wind, 2);
        windBox(g, sc, P.wind);
      } else { const c = BR.conditions(), v = BR.DIRS[c.from]; windBox(g, { x: -v[0], y: -v[1] }, P.bone); }
    },
    up(p) {
      const e = BR.S.enc, last = e.route[e.route.length - 1];
      if (last && Math.hypot(p.x - last.x, p.y - last.y) < 9) e.route.pop();
      else if (e.route.length < 4) e.route.push({ x: Math.round(BR.clamp(p.x, 2, W - 2)), y: Math.round(BR.clamp(p.y, 2, H - 2)) });
      BR.draw(); this.hud(); BR.save();
    },
    hud() {
      const S = BR.S, e = S.enc, has = !!S.items.windChecker, st = routeStats(this.m.grid, this.area, e, S.clock), c = BR.conditions();
      const noiseBars = Math.round(BR.clamp(st.noise, 0, 1.25) * 4), has1 = e.route.length > 0;
      const scent = has ? (st.scentAt > 0 ? `<span class="bad">Scent reaches them near waypoint ${st.scentAt}</span>` : '<span class="ok">Scent stays clear of them</span>')
        : `<span class="dim">Wind from ${c.from} ${c.mph} · sun on slope ${BR.fmt(this.area.sun)}</span>`;
      BR.hud(`
        <div class="row"><span class="t">STALK PLAN · UPHILL IS UP</span><span class="hi">${has1 ? '≈' + st.minutes + ' min' : ''}</span></div>
        <div class="row"><span>COVER ${BR.meter(Math.round(st.cover / 20), 5)}</span><span>NOISE ${BR.meter(noiseBars, 5, noiseBars > 2 ? 'warn' : '')}</span></div>
        <div class="row sm"><span>${has1 ? `Ends ${st.endYd} yd out · arrive ${BR.fmt(st.arrive)}` : 'Tap the map to drop up to 4 waypoints.'}</span></div>
        <div class="row sm">${scent}</div>
        <div class="sp"></div>
        ${BR.btn('go', 'Start stalk', 'go', null, !has1)}
        <div class="g2">${BR.btn('clear', 'Clear route', '', null, !has1)}${BR.btn('leave', 'Back to camp', '')}</div>`);
    },
    act(a) {
      const e = BR.S.enc;
      if (a === 'go') { e.st = null; BR.go('stalk'); }
      else if (a === 'clear') { e.route = []; BR.draw(); this.hud(); }
      else if (a === 'leave') BR.endHunt();
    },
    back() { BR.go('glass'); }
  };

  // ---------------- STALK ----------------
  BR.scenes.stalk = {
    enter(a) {
      const S = BR.S, e = S.enc;
      this.area = BR.area(e.area);
      this.m = mapFor(e);
      if (!e.st) e.st = { hx: START.x, hy: START.y, seg: 0, alert: 0, scent: 0, look: false, lookT: 3, moveA: 0, noiseA: 0, warned: false };
      this.holding = false; this.done = false; this.flashT = 0; this.flashMsg = ''; this.hudT = 0; this.saveT = 5; this.idle = 0; this.pace = 'sneak';
      this.paused = !!a.resume;
      this.hud();
      if (!this.paused) BR.animate();
    },
    pause() { this.holding = false; this.paused = true; },
    resume() { this.upd(); },
    hold(name, on) {
      if (name !== 'creep') return;
      this.holding = on;
      if (on && this.paused) { this.paused = false; BR.animate(); }
    },
    flash(msg) { this.flashMsg = msg; this.flashT = 2.2; },
    nearest() {
      const e = BR.S.enc, st = e.st; let best = null, bd = 1e9;
      e.elk.forEach(k => { if (k.gone) return; const d = Math.hypot(k.x - st.hx, k.y - st.hy); if (d < bd) { bd = d; best = k; } });
      return best ? { k: best, px: bd, yd: Math.round(bd * YD) } : null;
    },
    tick(dt) {
      const S = BR.S, e = S.enc, st = e.st, ch = BR.ch();
      if (this.paused || this.done) return false;
      if (!this.holding) {
        this.idle += dt;
        if (this.idle > 2 && st.alert <= 1 && !st.look && st.scent <= 0) { this.paused = true; this.upd(); BR.save(); return false; }
      } else this.idle = 0;
      BR.pass(dt);
      const clock = S.clock;
      if (S.part === 'evening' && clock >= BR.dark()) return this.end({ kind: 'dark' });
      const route = [START].concat(e.route), here = TER[terrainAt(this.m.grid, st.hx, st.hy)];
      const live = e.elk.filter(k => !k.gone);
      const n0 = this.nearest();
      this.pace = paceFor(n0 ? n0.px : 999, here);
      const pf = PACE[this.pace] / PACE.sneak;
      let moving = false;
      if (this.holding) {
        let target = null;
        if (st.seg < route.length - 1) target = route[st.seg + 1];
        else { const n = this.nearest(); if (n && n.px > 10) target = n.k; }
        if (target) {
          const dx = target.x - st.hx, dy = target.y - st.hy, L = Math.hypot(dx, dy);
          const step = PACE[this.pace] * here.speed * dt;
          if (L <= step) { st.hx = target.x; st.hy = target.y; if (st.seg < route.length - 1) st.seg++; }
          else { st.hx += dx / L * step; st.hy += dy / L * step; }
          moving = true;
        }
      }
      for (const k of e.elk) {
        if (k.gone) continue;
        if (clock >= k.hideAt) k.leaving = true;
        if (k.leaving) { k.y -= 3 * dt; k.x += k.dx * 1.2 * dt; if (terrainAt(this.m.grid, k.x, k.y) === TIMBER || k.y < 2) k.gone = true; }
        else if (Math.random() < dt * 0.3) { k.x += (Math.random() - 0.5) * 2; if (Math.random() < 0.25) k.dx = -k.dx; k.up = Math.random() < 0.3; }
      }
      if (!live.length) return this.end({ kind: 'gone' });
      const lead = live.find(k => k.lead) || live[0];
      const ldx = lead.x - st.hx, ldy = lead.y - st.hy, ld = Math.hypot(ldx, ldy) || 1;
      st.lookT -= dt;
      if (st.lookT <= 0) {
        st.look = !st.look;
        st.lookT = st.look ? 1.5 + Math.random() * 2 + st.alert / 40 : Math.max(1.2, 3 + Math.random() * 5 - st.alert / 30);
        if (st.look && ld < here.sight) BR.vibe(st.alert > 40 ? 45 : 20);
      }
      if (st.look && ld < here.sight) {
        const close = 1 - ld / here.sight;
        if (moving) { const add = (30 + 50 * close) * dt * pf; st.alert += add; st.moveA += add; }
        else if (here.cover < 0.5 && close > 0.5) st.alert += 4 * dt;
        else st.alert -= 3 * dt;
      } else st.alert -= 6 * dt;
      if (moving && ld < 100 && Math.random() < here.noise * 0.28 * dt * pf) {
        const add = ld < 40 ? 30 : ld < 70 ? 18 : 8;
        st.alert += add; st.noiseA += add;
        this.flash(here.name === 'deadfall' ? 'Stick snapped!' : here.name === 'shale' ? 'Rocks clattered!' : 'Brush scraped your pack.');
      }
      const sc = BR.scent(this.area, clock), dot = (sc.x * ldx + sc.y * ldy) / ld;
      if (ld < 83 && dot > 0.72) {
        st.scent += dt * (dot - 0.72) * 6 * (1.3 - ld / 83);
        if (st.scent > 0.25 && !st.warned) { st.warned = true; this.flash('A nose is up. The wind’s wrong.'); BR.vibe(30); }
      } else st.scent = Math.max(0, st.scent - dt * 0.2);
      st.alert = BR.clamp(st.alert, 0, 100);
      if (ch.pressure && moving && Math.random() < ch.pressure(S.day) * dt * 0.0015) return this.end({ kind: 'bumped' });
      if (ch.bears && moving && here.cover >= 0.5 && !(S.sprayed && S.sprayed[e.area] === S.day) && Math.random() < dt * 0.0012 * (this.area.bear ? 2 : 1)) {
        return this.end({ kind: BR.bearCharge(e.area) === 'sprayed' ? 'sprayed' : 'charge', where: 'timber' });
      }
      if (st.scent >= 1) return this.end({ kind: 'bust', cause: 'scent', thermal: sc.thermal, from: sc.from, yd: Math.round(ld * YD), sun: this.area.sun });
      if (st.alert >= 100) return this.end({ kind: 'bust', cause: st.noiseA > st.moveA ? 'noise' : 'movement', yd: Math.round(ld * YD), terrain: here.name });
      this.flashT -= dt;
      this.hudT -= dt; if (this.hudT <= 0) { this.hudT = 0.25; this.upd(); }
      this.saveT -= dt; if (this.saveT <= 0) { this.saveT = 5; BR.save(); }
      return true;
    },
    end(o) {
      this.done = true;
      const S = BR.S;
      if (o.kind === 'bust') { S.stats.busts++; BR.vibe(160); }

      BR.log(o.kind, Object.assign({ via: 'stalk' }, o));
      BR.go('outcome', o);
      return false;
    },
    draw(g) {
      const S = BR.S, e = S.enc, st = e.st, n = this.nearest();
      const z = n && n.px < 30 ? 3 : n && n.px < 75 ? 2 : 1, hw = W / (2 * z), hh = H / (2 * z);
      const cx = z === 1 ? W / 2 : BR.clamp((st.hx + n.k.x) / 2, hw, W - hw), cy = z === 1 ? H / 2 : BR.clamp((st.hy + n.k.y) / 2, hh, H - hh);
      const x0 = Math.round(cx - hw), y0 = Math.round(cy - hh);
      g.drawImage(this.m.canvas, x0, y0, W / z, H / z, 0, 0, W, H);
      fence(g, e.target.zoneX, x0, y0, z);
      const T = (x, y) => [Math.round((x - x0) * z), Math.round((y - y0) * z)];
      const route = [START].concat(e.route);
      for (let s = st.seg; s < route.length - 1; s++) {
        const a = s === st.seg ? { x: st.hx, y: st.hy } : route[s], b = route[s + 1], A = T(a.x, a.y), B = T(b.x, b.y);
        BR.line(g, A[0], A[1], B[0], B[1], 'rgba(227,166,70,.6)', 3);
      }
      for (const k of e.elk) {
        if (k.gone) continue;
        const [x, y] = T(k.x, k.y);
        animalTop(g, k, x, y, z, k.lead ? st.look : k.up);
        if (k.lead && st.look) { const col = st.alert > 60 ? P.blood : P.amber; R(g, x, y - 8 * z, z, 3 * z, col); R(g, x, y - 4 * z, z, z, col); }
      }
      const [hx, hy] = T(st.hx, st.hy);
      if (z > 1) BR.ring(g, hx, hy, (Math.min(BR.maxShot(), 80) / YD) * z, 'rgba(227,166,70,.35)', 6);
      if (S.items.windChecker) { const sc = BR.scent(this.area, S.clock); BR.line(g, hx, hy, hx + sc.x * 30 * z, hy + sc.y * 30 * z, P.wind, 3); }
      R(g, hx - 2 * z, hy - 2 * z, 5 * z, 5 * z, P.ink); R(g, hx - z, hy - z, 3 * z, 3 * z, P.amber); R(g, hx, hy, z, z, P.ink);
    },
    hud() {
      BR.hud(`
        <div class="row"><span class="t" id="st-mode">STALKING</span><span class="hi" id="st-yd"></span></div>
        <div class="row"><span>LEAD ANIMAL</span><span id="st-meter"></span></div>
        <div class="row sm"><span id="st-msg"></span><span class="dim" id="st-clock"></span></div>
        ${BR.S.items.windChecker ? '<div class="row sm"><span>Scent: <span id="st-scent"></span></span></div>' : ''}
        <div class="sp"></div>
        <div class="g2"><button class="btn go" id="st-shoot" data-act="shoot" disabled>Shoot</button><button class="btn" data-act="call">Call from here</button></div>
        ${BR.holdBtn('creep', 'HOLD TO CREEP · LIFT TO FREEZE')}`);
      this.upd();
    },
    upd() {
      const S = BR.S, e = S.enc, st = e.st, n = this.nearest(); if (!n) return;
      const $ = id => document.getElementById(id);
      if (!$('st-yd')) return;
      $('st-mode').textContent = this.holding ? { hike: 'HIKING', sneak: 'SNEAKING', creep: 'CREEPING' }[this.pace] : 'STALKING';
      $('st-yd').textContent = n.yd + ' yd';
      $('st-meter').innerHTML = BR.meter(Math.ceil(st.alert / 20), 5, st.alert > 60 ? 'bad' : st.alert > 25 ? 'warn' : '');
      $('st-clock').textContent = BR.fmt(S.clock);
      const route = [START].concat(e.route);
      let msg, cls = 'dim';
      if (this.paused) msg = 'Holding still. Hold to creep.';
      else if (this.flashT > 0) { msg = this.flashMsg; cls = 'toast'; }
      else if (st.look && st.alert > 60) { msg = 'The lead animal is staring at you. Freeze.'; cls = 'bad'; }
      else if (st.look) { msg = 'A head’s up.'; cls = 'hi'; }
      else if (st.seg >= route.length - 1) msg = 'End of route. Hold to close in.';
      else msg = 'Feeding.';
      $('st-msg').className = cls; $('st-msg').textContent = msg;
      if ($('st-scent')) {
        const sc = BR.scent(this.area, S.clock), lead = e.elk.find(k => k.lead && !k.gone) || n.k;
        const dx = lead.x - st.hx, dy = lead.y - st.hy, dot = (sc.x * dx + sc.y * dy) / (Math.hypot(dx, dy) || 1);
        $('st-scent').innerHTML = dot > 0.72 ? '<span class="bad">drifting toward them</span>' : dot > 0.3 ? '<span class="hi">close to them</span>' : '<span class="ok">away from them</span>';
      }
      const b = $('st-shoot'), inRange = n.yd <= BR.maxShot();
      b.disabled = !inRange;
      b.textContent = inRange ? `Shoot · ${n.yd} yd` : 'Shoot';
    },
    act(a) {
      const S = BR.S, e = S.enc, st = e.st, zx = e.target.zoneX;
      if (a === 'shoot') {
        const r = Math.random;
        const opts = e.elk.filter(k => !k.gone).map(k => ({ k, yd: Math.round(Math.hypot(k.x - st.hx, k.y - st.hy) * YD) })).filter(o => o.yd <= BR.maxShot()).sort((p, q) => p.yd - q.yd);
        if (!opts.length) return;
        e.shot = { options: opts.map(o => ({ a: Object.assign({}, o.k.a, { zoneOut: zx != null ? o.k.x > zx : false }), range: o.yd, angle: r() < 0.5 ? 'broadside' : r() < 0.6 ? 'quartering-away' : 'quartering-to' })), i: 0, from: 'stalk', alert: st.alert };
        this.done = true;
        BR.go('shot');
      } else if (a === 'call') {
        const n = this.nearest();
        this.done = true;
        BR.go('call', { area: e.area, dist: n ? n.yd : 150, bull: e.elk.some(k => k.a.sex === 'bull' && !k.gone), fromStalk: true });
      }
    },
    back() { this.holding = false; BR.confirm('Back out of this stalk?', 'You slip away without spooking them, but this hunt is over.', 'Back out', () => BR.endHunt()); }
  };
})();

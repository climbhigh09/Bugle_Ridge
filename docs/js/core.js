// Bugle Ridge — engine: pixel helpers, sprites, render-on-demand loop, input, save.
(function () {
  'use strict';
  const BR = (window.BR = {});
  BR.VERSION = '1.0.0';
  window.addEventListener('error', e => console.error('JS error: ' + e.message + ' @' + e.filename + ':' + e.lineno));
  const W = (BR.W = 180), H = (BR.H = 240);

  const P = (BR.P = {
    night: '#0c0f17', dusk: '#1a2031', dawn: '#39334f', glow: '#b8694a', amber: '#e3a646',
    far: '#262d3d', far2: '#303849', mid: '#27352c', timber: '#16241b', timber2: '#1f3024',
    tree: '#1c2e22', tree2: '#26402d', aspen: '#b8923e', aspen2: '#8a6d2f',
    meadow: '#46553a', meadow2: '#5d6c46', meadow3: '#6f7c50', meadowD: '#3d4a32', dirt: '#4a3e30',
    hide: '#8f633a', mane: '#4d3423', rump: '#cdb07e', leg: '#33251a', antler: '#ddd0b3',
    bone: '#e9dfcb', blood: '#b7413c', wind: '#86b36f', water: '#2f4b5e', rock: '#595955', rock2: '#747169',
    fire: '#f2b04a', fire2: '#d8602e', skin: '#a67c58', camo: '#5b5a3d', camo2: '#44432d', hat: '#2a2820',
    star: '#cfc6b2', ink: '#07080b', log: '#4a3624', logHi: '#6f5236'
  });

  // ---------- drawing ----------
  function R(g, X, Y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(X), Math.round(Y), Math.round(w), Math.round(h)); }
  function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  // colour helpers (hex in, hex out, cached) + 4×4 ordered dither for smooth pixel-art gradients
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);
  const mixCache = {};
  function mix(a, b, t) {
    t = Math.round(t * 16) / 16;
    const k = a + b + t;
    if (mixCache[k]) return mixCache[k];
    const p = (h, i) => parseInt(h.slice(i, i + 2), 16), ch = i => Math.round(p(a, i) + (p(b, i) - p(a, i)) * t).toString(16).padStart(2, '0');
    return (mixCache[k] = '#' + ch(1) + ch(3) + ch(5));
  }
  function shade(c, t) { return t >= 0 ? mix(c, '#fff1d6', t) : mix(c, '#04050a', -t); }
  // gradient between successive stops [[y, colour], ...]; the last stop fills to the bottom
  function bands(g, list, w, h) {
    w = w || W; h = h || H;
    const STEPS = 8;
    for (let i = 0; i < list.length; i++) {
      const y0 = list[i][0], y1 = i + 1 < list.length ? list[i + 1][0] : h;
      const c0 = list[i][1], c1 = i + 1 < list.length ? list[i + 1][1] : c0;
      if (c0 === c1) { R(g, 0, y0, w, y1 - y0, c0); continue; }
      for (let y = y0; y < y1; y++) {
        const t = (y - y0) / (y1 - y0) * STEPS, lo = Math.floor(t), fr = t - lo;
        R(g, 0, y, w, 1, mix(c0, c1, lo / STEPS));
        g.fillStyle = mix(c0, c1, Math.min(1, (lo + 1) / STEPS));
        const row = (y & 3) * 4;
        for (let x = 0; x < w; x++) if (BAYER[row + (x & 3)] < fr) g.fillRect(x, y, 1, 1);
      }
    }
  }
  function ry(X, base, amp, f, s) {
    return Math.round(base + Math.sin(X * f + s) * amp + Math.sin(X * f * 2.7 + s * 1.7) * amp * 0.45 + Math.sin(X * f * 6.3 + s * 2.9) * amp * 0.18);
  }
  // ridgeline with a rim of light and faceted slopes (sun from the left)
  function ridge(g, base, amp, f, s, c, w, h) {
    w = w || W; h = h || H;
    const lit = shade(c, 0.06), dark = shade(c, -0.1), rim = shade(c, 0.1);
    for (let X = 0; X < w; X++) {
      const y = ry(X, base, amp, f, s), slope = ry(X + 3, base, amp, f, s) - ry(X - 3, base, amp, f, s);
      R(g, X, y, 1, h - y, c);
      const face = slope < -1 ? lit : slope > 1 ? dark : null;
      if (face) for (let j = 1; j < 20 && y + j < h; j++) if (BAYER[((y + j) & 3) * 4 + (X & 3)] < 0.8 - j / 25) R(g, X, y + j, 1, 1, face);
      if (slope < 0) R(g, X, y, 1, 1, rim);
    }
  }
  // tiered spruce: lit left edge, shaded right half, bough tips catching light
  function pine(g, X, Y, h, c, c2) {
    const hi = shade(c, 0.12), sh = c2 || shade(c, -0.18);
    for (let i = 0; i < h; i++) {
      const tierPos = (i % 4) / 3;
      const half = Math.round(i * 0.3 * (0.62 + 0.38 * tierPos));
      const y = Y - h + i;
      R(g, X - half, y, half * 2 + 1, 1, c);
      if (half > 1) R(g, X + 1, y, half, 1, sh);
      if (tierPos === 1 && half > 1) { R(g, X - half, y, 1, 1, hi); R(g, X - half - 1, y + 1, 1, 1, c); R(g, X + half + 1, y + 1, 1, 1, sh); }
    }
    R(g, X, Y - 1, 1, 2, '#2a1f16');
  }
  // September aspen: gold crown with three tones and gaps, white trunk with a dark eye
  function aspen(g, X, Y, r) {
    for (let j = -r; j <= r; j++) {
      const w = Math.round(Math.sqrt(r * r - j * j) * 1.15);
      for (let i = -w; i <= w; i++) {
        if (Math.abs(i) === w && ((X + i) * 3 + (Y + j) * 5) % 3 === 0) continue;
        const t = (i + j) / (2 * r);
        R(g, X + i, Y + j, 1, 1, t < -0.4 ? '#d6a94a' : t < 0.3 ? P.aspen : P.aspen2);
      }
    }
    R(g, X, Y + r, 1, 4, '#d9d4c4'); R(g, X, Y + r + 2, 1, 1, '#3a3530');
  }
  function stars(g, n, maxY, seed, w) { const r = rng(seed); w = w || W; for (let i = 0; i < n; i++) R(g, r() * w, r() * maxY, 1, 1, r() < 0.3 ? P.star : '#6d6a66'); }
  function grass(g, y0, n, seed, cols, w, h) {
    const r = rng(seed); w = w || W; h = h || H;
    for (let i = 0; i < n; i++) {
      const x = r() * w, y = y0 + r() * (h - y0), c = cols[(r() * cols.length) | 0];
      R(g, x, y, 1, 1, c);
      if (r() < 0.35) R(g, x, y - 1, 1, 1, shade(c, 0.14));
    }
  }
  function sprite(g, rows, cols, X, Y, s, flip, skip) {
    const w = rows[0].length;
    for (let j = 0; j < rows.length; j++) for (let i = 0; i < w; i++) {
      const ch = rows[j][i];
      if (ch === '.' || (skip && skip.indexOf(ch) >= 0)) continue;
      R(g, X + (flip ? w - 1 - i : i) * s, Y + j * s, s, s, cols[ch]);
    }
  }
  function line(g, x0, y0, x1, y1, c, dash) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let k = 0; k <= n; k++) if (!dash || k % dash !== dash - 1) R(g, x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, 1, 1, c);
  }
  function ring(g, cx, cy, r, c, step) { for (let a = 0; a < 360; a += step || 4) R(g, cx + Math.cos(a * Math.PI / 180) * r, cy + Math.sin(a * Math.PI / 180) * r, 1, 1, c); }
  function checker(g, X, Y, w, h, c) { for (let j = 0; j < h; j++) for (let i = (j & 1); i < w; i += 2) R(g, X + i, Y + j, 1, 1, c); }
  function flame(g, cx, top) {
    const fw = [1, 1, 2, 2, 3, 4, 4, 5, 5, 5, 4];
    for (let j = 0; j < fw.length; j++) {
      const w = fw[j] + ((Math.random() < 0.3) ? 1 : 0) * (j > 3 ? 1 : 0);
      R(g, cx - w, top + j, w * 2 + 1, 1, P.fire2);
      if (w > 1) R(g, cx - w + 1, top + j, w * 2 - 1, 1, P.fire);
      if (w > 3) R(g, cx - 1, top + j, 3, 1, P.bone);
    }
  }

  const pad = (a, n) => a.map(r => r.padEnd(n, '.'));
  // 22×16, facing right. a/A antler + ivory tips, n dark mane, h head, e eye, m nose, b hide, B sunlit back, s belly shadow, d brisket, r rump, l legs, k hooves
  const ELK = pad([
    '............A.A', '........A...a.a...A', '.........aa.a.a..a', '..........aaaaaaa', '..............naa',
    '..............nhhhhh', '.............nnhhehhh', '............nnnhhhhm', '..rbBBBBBBBBnnn', '.rrbBBBBbbbbbnn',
    '.rrbbbbbbbbbbbd', '.rrbbbbbbbbbbbd', '..rsssssssssbdd', '..l.l.......l.l', '..l.l.......l.l', '..k..k......k..k'
  ], 22);
  // head-down feeding pose (same body, head dropped to grass)
  const ELK_FEED = pad([
    '', '', '', '', '', '', '', '',
    '..rbbbbbbbbbhh', '.rrbbbbbbbbbbhhh', '.rrbbbbbbbbbbbhhh', '.rrbbbbbbbbbbb.hhh', '..rbbbbbbbbbbb..hhh', '..l.l.......l.l..hh', '..l.l.......l.l', '..l..l......l..l'
  ], 22);
  const ECOL = { a: '#d2c09a', A: '#f2ead6', n: '#3d2a1b', h: '#6b4a2f', e: '#110c09', m: '#1c1511', b: '#93683e', B: '#a57848', s: '#5c4027', d: '#47311f', r: '#d9c08e', l: '#34261a', k: '#18120e' };
  const HUNT = pad(['...kk', '..kKkk', '...ss', '..gGgg.w', '.gGggGg.w', '.ggGgg..w', '..gggD..w', '..gGgD.w', '.gg..gg', '.D....D'], 10);
  const HCOL = { k: P.hat, K: '#4a4436', s: '#b08560', g: P.camo, G: '#716e4b', D: '#2c2a20', w: '#4a3322' };
  // Hank, 20×26, sitting on a log facing right: felt hat, white beard, plaid wool coat, coffee mug, jeans, boots
  const MENTOR = pad([
    '......KKKK', '.....KKKKKK', '.....KkkkkK', '..KKKKKKKKKKKK', '......sSSSS', '......sSESSS', '......sSSSSSS',
    '.......wWWWW', '.......wWWW', '........wW', '....jJJJJJJ', '...jJLJJLJJJ', '...jJJJJJJJJSSM', '...jLJJLJJJJSSMm',
    '...jJJJJJJJ...Mm', '...jJJLJJJJ', '...jjJJJJJPPPPPP', '..GGpPPPPPPPPPPPP', '.GGGGpppppppppPPP', '.GGGGGGGGGG...PPP',
    '.gGGGGGGGGg...PPP', '..gggggggg....PPp', '..............PPp', '.............BBBBB', '.............BBBBBB', '.............bbbbbb'
  ], 20);
  const MCOL = {
    K: '#3b2f22', k: '#6a5238', S: '#c89a74', s: '#8e664c', E: '#1a120c', W: '#dcd6c8', w: '#a8a292',
    J: '#8e3c2e', j: '#5a2420', L: '#c0685a', P: '#3d4d64', p: '#2a3546', B: '#3a2a1c', b: '#1a120c',
    M: '#d0d0c8', m: '#8a8a84', G: '#5a4028', g: '#3a2a1a'
  };
  // the hunter, 16×19, sitting on a log facing right: ball cap, camo, boots
  const HUNT_SIT = pad([
    '.....CCCC', '....CCCCCcc', '.....sSSSS', '.....sSSES', '.....sSSSSS', '.....TTTTS', '....aAAAOAA', '...aAOAAAAAA',
    '...aAAaAAAASS', '...aAAAAOAA', '...aaAAAAAA', '..GaPPPPPPPPP', '.GGGpppppppPPP', '.GGGGGGGG..PPP', '.gGGGGGGg..PPP',
    '..gggggg...PPp', '...........PPp', '..........BBBBB', '..........bbbbb'
  ], 16);
  const HSCOL = {
    C: '#4a4636', c: '#2e2b22', S: '#b88c66', s: '#7e5c42', E: '#1a120c', T: '#5a4636', A: '#5b5a3d', a: '#3e3d29',
    O: '#77744f', P: '#4a4a38', p: '#34342a', B: '#2c2a20', b: '#16140f', G: '#5a4028', g: '#3a2a1a'
  };
  function tiny(g, X, Y, flip, bull, headUp, s) {
    s = s || 1;
    const d = flip ? -1 : 1, px = (i, j, c) => R(g, X + i * d * s, Y + j * s, s, s, c);
    for (let i = 0; i < 4; i++) { px(i, 0, P.hide); px(i, 1, P.hide); }
    px(0, 0, P.rump); px(0, 1, P.rump); px(0, 2, P.leg); px(3, 2, P.leg);
    if (headUp === false) { px(4, 1, P.mane); px(5, 2, P.mane); }
    else { px(4, -1, P.mane); px(4, 0, P.mane); px(5, -1, P.mane); }
    if (bull) { px(4, -2, P.antler); px(3, -3, P.antler); px(5, -3, P.antler); }
  }

  Object.assign(BR, { BAYER, mix, shade, R, rng, bands, ry, ridge, pine, aspen, stars, grass, sprite, line, ring, checker, flame, pad, ELK, ELK_FEED, ECOL, HUNT, HCOL, MENTOR, MCOL, HUNT_SIT, HSCOL, tiny });
  BR.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  BR.lerp = (a, b, t) => a + (b - a) * t;
  BR.dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  // ---------- scene manager: draws only when asked, ticks at ≤30 fps only while a scene animates ----------
  const cv = document.getElementById('scene');
  const g = (BR.g = cv.getContext('2d'));
  g.imageSmoothingEnabled = false;
  const hudEl = document.getElementById('hud');
  const navBack = document.getElementById('nav-back'), navMenu = document.getElementById('nav-menu'), overlay = document.getElementById('overlay');
  BR.scenes = {};
  let cur = null, raf = 0, lastT = 0;

  function frame(ts) {
    raf = 0;
    if (!cur) return;
    if (lastT && ts - lastT < 32) { raf = requestAnimationFrame(frame); return; }
    const dt = lastT ? Math.min(0.1, (ts - lastT) / 1000) : 0.033;
    lastT = ts;
    const more = cur.tick ? cur.tick(dt) : false;
    BR.draw();
    if (more) raf = requestAnimationFrame(frame); else lastT = 0;
  }
  BR.animate = () => { if (!raf) { lastT = 0; raf = requestAnimationFrame(frame); } };
  BR.stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; lastT = 0; };
  BR.draw = () => { if (cur && cur.draw) { g.imageSmoothingEnabled = false; cur.draw(g); } };
  BR.go = (name, args) => {
    if (cur && cur.exit) cur.exit();
    BR.stop();
    hideOverlay();
    cur = BR.scenes[name];
    if (!cur) throw new Error('No scene ' + name);
    BR.S.scene = name;
    BR.S.sceneArgs = args || null;
    if (cur.enter) cur.enter(args || {});
    navBack.disabled = !cur.back;
    BR.draw();
    BR.save();
  };
  BR.refresh = () => { if (cur && cur.hud) cur.hud(); };
  BR.hud = html => { hudEl.innerHTML = html; };

  // canvas uses object-fit: cover, so account for the cropped edges when mapping touches
  function pt(e) {
    const r = cv.getBoundingClientRect(), s = Math.max(r.width / W, r.height / H);
    return { x: (e.clientX - r.left - (r.width - W * s) / 2) / s, y: (e.clientY - r.top - (r.height - H * s) / 2) / s };
  }
  cv.addEventListener('pointerdown', e => { try { cv.setPointerCapture(e.pointerId); } catch (_) {} if (cur && cur.down) cur.down(pt(e)); });
  cv.addEventListener('pointermove', e => { if (cur && cur.move) cur.move(pt(e)); });
  cv.addEventListener('pointerup', e => { if (cur && cur.up) cur.up(pt(e)); });
  cv.addEventListener('pointercancel', e => { if (cur && cur.up) cur.up(pt(e), true); });

  hudEl.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b || b.disabled || !cur || !cur.act) return;
    cur.act(b.dataset.act, b.dataset.arg, b);
  });
  hudEl.addEventListener('pointerdown', e => {
    const b = e.target.closest('[data-hold]');
    if (!b || !cur || !cur.hold) return;
    e.preventDefault();
    try { b.setPointerCapture(e.pointerId); } catch (_) {}
    b.classList.add('on');
    cur.hold(b.dataset.hold, true);
  });
  const release = e => {
    const b = e.target.closest && e.target.closest('[data-hold]');
    if (!b) return;
    b.classList.remove('on');
    if (cur && cur.hold) cur.hold(b.dataset.hold, false);
  };
  hudEl.addEventListener('pointerup', release);
  hudEl.addEventListener('pointercancel', release);

  // ---------- HUD snippets ----------
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  BR.esc = esc;
  BR.btn = (act, label, cls, arg, disabled, sub) =>
    `<button class="btn ${cls || ''}" data-act="${act}"${arg != null ? ` data-arg="${esc(arg)}"` : ''}${disabled ? ' disabled' : ''}>${label}${sub ? `<small>${sub}</small>` : ''}</button>`;
  BR.holdBtn = (name, label) => `<button class="btn hold" data-hold="${name}">${label}</button>`;
  BR.meter = (v, n, cls) => { let s = `<span class="meter ${cls || ''}">`; for (let i = 0; i < n; i++) s += `<i class="${i < v ? 'f' : ''}"></i>`; return s + '</span>'; };
  BR.fmt = h => {
    let hh = Math.floor(h), mm = Math.round((h - hh) * 60);
    if (mm === 60) { hh++; mm = 0; }
    return (((hh + 11) % 12) + 1) + ':' + String(mm).padStart(2, '0') + (hh >= 12 ? ' PM' : ' AM');
  };

  // ---------- save / platform ----------
  const KEY = 'bugle-ridge-save-v3';
  BR.newGame = () => {
    BR.S = {
      v: 3, seed: (Date.now() % 1000003) | 0, year: 1, chapter: 0, day: 1, days: 7, clock: 5.5, part: 'morning',
      cash: 250, bow: 'scout', rifle: null, items: {}, strength: 0, tag: null, tags: { wolf: false, grizzly: false, grizApplied: false },
      camp: null, drank: false, skipDays: 0, guideSkill: 0, over: false, verdict: null, finished: false, range: null,
      stats: { busts: 0, shots: 0, wounds: 0, spotted: 0, jobs: 0, seasons: 0, filled: 0, violations: 0, predators: 0 },
      history: [], events: [], lesson: null, lessonDay: 0, suggest: null, enc: null, ridge: false, scene: 'title', sceneArgs: null
    };
  };
  BR.save = () => { try { localStorage.setItem(KEY, JSON.stringify(BR.S)); } catch (_) {} };
  BR.load = () => { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 3) { BR.S = s; return true; } } catch (_) {} return false; };
  BR.wipe = () => { try { localStorage.removeItem(KEY); } catch (_) {} };
  BR.pass = min => { BR.S.clock += min / 60; };
  BR.log = (type, data) => { BR.S.events.push(Object.assign({ type, day: BR.S.day, clock: BR.S.clock }, data || {})); };
  BR.vibe = ms => { try { if (window.Android) window.Android.vibrate(ms | 0); else if (navigator.vibrate) navigator.vibrate(ms); } catch (_) {} };
  // Ridge mode: the Android app dims its window; a browser can't touch brightness, so it darkens the page instead.
  BR.setRidge = on => {
    BR.S.ridge = !!on;
    try { if (window.Android) window.Android.setDim(!!on); else document.body.classList.toggle('ridge', !!on); } catch (_) {}
    BR.save();
  };

  // ---------- sight pins: one colour per yardage, used on the sight and in every legend ----------
  BR.PIN_COLS = { 20: '#86b36f', 30: '#e3a646', 40: '#e25b4f', 50: '#6fa8d6', 60: '#e9dfcb' };
  BR.PIN_NAMES = { 20: 'green', 30: 'yellow', 40: 'red', 50: 'blue', 60: 'white' };
  BR.pinLegend = pins => pins.map(p => `<span class="pin" style="background:${BR.PIN_COLS[p]}"></span>${p}`).join('');

  // ---------- always-present Back + Menu, bottom-sheet overlays ----------
  function hideOverlay() { overlay.hidden = true; overlay.innerHTML = ''; BR.overlayHandlers = null; }
  BR.showOverlay = (html, handlers) => {
    const wasOpen = !overlay.hidden;
    overlay.innerHTML = `<div class="sheet">${html}</div>`;
    overlay.hidden = false;
    BR.overlayHandlers = handlers;
    if (!wasOpen) { if (cur && cur.pause) cur.pause(); BR.stop(); }
  };
  BR.closeOverlay = () => { hideOverlay(); if (cur && cur.resume) cur.resume(); };
  BR.confirm = (title, body, yes, onYes) => BR.showOverlay(
    `<div class="t hi">${title}</div><div class="tagline">${body}</div>${BR.btn('yes', yes, 'go')}${BR.btn('no', 'Cancel')}`,
    { yes: () => { hideOverlay(); onYes(); }, no: () => BR.closeOverlay() });
  overlay.addEventListener('click', e => {
    if (e.target === overlay) { BR.closeOverlay(); return; }
    const b = e.target.closest('[data-act]');
    if (!b || b.disabled || !BR.overlayHandlers) return;
    const h = BR.overlayHandlers[b.dataset.act];
    if (h) h(b.dataset.arg);
  });

  const LEAVE_OK = ['camp', 'debrief', 'title', 'season', 'intro', 'sam', 'campsite'];
  BR.openMenu = () => {
    const S = BR.S, here = S.scene, ok = LEAVE_OK.includes(here), why = 'Finish or leave this hunt first', bowCh = BR.ch().weapon === 'bow';
    BR.showOverlay(`
      <div class="row"><span class="t hi">MENU</span><span class="dim">Day ${S.day}/${S.days} · ${BR.fmt(S.clock)} · $${S.cash}</span></div>
      <div class="list">
        ${BR.btn('resume', 'Resume', 'go')}
        ${bowCh ? BR.btn('range', 'Practice range', '', null, !ok, ok ? 'Learn your pins. No time passes.' : why) : ''}
        ${BR.btn('shop', 'Gear & shop', '', null, !ok, ok ? `$${S.cash} to spend` : why)}
        ${BR.btn('help', 'How to play')}
        ${BR.btn('ridge', 'Ridge mode: ' + (S.ridge ? 'ON' : 'off'), '', null, false, 'Dims the screen so your face doesn’t glow on the hill')}
        ${BR.btn('new', 'Start over with a new hunter')}
      </div>`, {
      resume: () => BR.closeOverlay(),
      range: () => BR.go('range', { back: here }),
      shop: () => BR.go('shop', { back: here }),
      help: () => BR.openHelp(),
      ridge: () => { BR.setRidge(!S.ridge); BR.openMenu(); },
      new: () => BR.confirm('Start over?', 'This wipes everything: chapter, cash, gear, and strength.', 'Wipe and start over', () => {
        const ridge = BR.S.ridge; BR.newGame(); BR.S.ridge = ridge; BR.startSeason(0);
      })
    });
  };
  BR.openHelp = () => BR.showOverlay(`
    <div class="t hi">HOW TO PLAY</div>
    <div class="list help">
      <p><b>Camp.</b> Check the wind, the rut, and when the sun hits each slope. Thermals drain downhill until the sun warms a slope, then rise until evening.</p>
      <p><b>Glassing.</b> Drag to pan. Press and hold for binoculars. Let go on an elk to mark it.</p>
      <p><b>Stalk plan.</b> Tap the map for up to 4 waypoints. Uphill is the top. Stay in cover, off noisy deadfall and shale, and keep your scent off them.</p>
      <p><b>Stalking.</b> Hold to creep, lift to freeze. Move only when the lead cow’s head is down. The phone buzzes when she looks up.</p>
      <p><b>Calling.</b> Match the call to the rut. Call, then wait. Bulls swing downwind; slip crosswind if he does.</p>
      <p><b>Bow.</b> Press and hold on the screen to draw, slide to put the right pin on the vitals, lift to shoot. Your pins: ${BR.pinLegend(BR.bow().pins)}. Past your last pin, hold high.</p>
      <p><b>Rifle.</b> Press and hold to shoulder the rifle, slide the crosshair onto the vitals, lift to shoot. Zeroed at 200 yards. The hash marks below the crosshair are your 300, 400 and 500-yard holds. Hold into the wind.</p>
      <p><b>The tag.</b> Sam tells you the rules before each season. Nobody reminds you in the field. Shoot an illegal animal and the season is over.</p>
      <p><b>Camp.</b> Pick a campsite, choose where to get water and whether to treat it, and take care of the meat after a kill. Untreated water from a bad source can kill you.</p>
      <p><b>Blood trail.</b> Read the arrow, pick how long to wait, then tap each drop of blood.</p>
    </div>
    ${BR.btn('menu', 'Back to menu')}`, { menu: () => BR.openMenu() });

  BR.back = () => {
    if (!overlay.hidden) { BR.closeOverlay(); return true; }
    if (cur && cur.back) { cur.back(); return true; }
    return false;
  };
  navBack.addEventListener('click', () => BR.back());
  navMenu.addEventListener('click', () => { if (overlay.hidden) BR.openMenu(); else BR.closeOverlay(); });

  window.BRPause = () => { if (cur && cur.pause) cur.pause(); BR.stop(); BR.save(); };
  window.BRBack = () => BR.back();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.BRPause();
    else if (cur && cur.resume && overlay.hidden) cur.resume();
  });

  BR.start = () => {
    if (!BR.load()) BR.newGame();
    if (BR.S.ridge) BR.setRidge(true);
    const name = BR.scenes[BR.S.scene] ? BR.S.scene : 'title';
    BR.go(name, Object.assign({ resume: true }, BR.S.sceneArgs || {}));
  };
})();

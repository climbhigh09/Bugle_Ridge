// Headless career fuzzer for Bugle Ridge (node tools/test/harness3.js [careers] [maxSteps]): plays whole careers through every chapter with random choices,
// save/reloads at random moments, and checks invariants after every step. Canvas is stubbed, so hit zones are randomised.
const fs = require('fs'), vm = require('vm');
const dir = require('path').resolve(__dirname, '../../www/js') + '/';
const FILES = require('fs').readFileSync(require('path').resolve(__dirname, '../../www/index.html'), 'utf8').match(/js\/(\w+)\.js/g).map(m => m.slice(3, -3));
const noop = () => {};
const CTX = {};
['fillRect', 'clearRect', 'drawImage', 'beginPath', 'moveTo', 'lineTo', 'closePath', 'fill', 'stroke', 'arc', 'ellipse', 'save', 'restore', 'translate', 'rotate', 'scale', 'setTransform', 'clip', 'fillText', 'putImageData', 'quadraticCurveTo', 'bezierCurveTo', 'rect', 'strokeRect'].forEach(k => { CTX[k] = noop; });
CTX.measureText = () => ({ width: 10 });
CTX.createImageData = (w, h) => ({ data: new Uint8ClampedArray(4) });
CTX.getImageData = () => ({ data: new Uint8ClampedArray(4) });
const ctx2d = () => CTX;
const canvas = () => ({ width: 0, height: 0, getContext: () => ctx2d(), addEventListener() {}, setPointerCapture() {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 360, height: 480 }) });
const el = extra => Object.assign({ innerHTML: '', hidden: true, disabled: false, textContent: '', className: '', addEventListener() {} }, extra || {});
const els = { scene: canvas(), hud: el(), 'nav-back': el(), 'nav-menu': el(), overlay: el() };
const store = {};
const sb = {
  console, Math, JSON, Date, setTimeout: () => 0, clearTimeout() {}, setInterval: () => 1, clearInterval() {}, performance: { now: () => Date.now() },
  requestAnimationFrame: () => 1, cancelAnimationFrame() {}, navigator: {}, addEventListener() {}, Path2D: function () {},
  localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; }, removeItem: k => { delete store[k]; } },
  document: { getElementById: id => els[id] || null, createElement: () => canvas(), addEventListener() {}, hidden: false, body: { classList: { toggle() {} } } }
};
sb.window = sb;
vm.createContext(sb);
for (const f of FILES) vm.runInContext(fs.readFileSync(dir + f + '.js', 'utf8'), sb, { filename: f + '.js' });
const BR = sb.BR, rnd = Math.random, pick = a => a[(rnd() * a.length) | 0];
// sprites: skip rasterising; a fixed box with a body everywhere
const FAKE = { canvas: canvas(), x0: 60, x1: 160, y0: 80, y1: 190, gy: 190, cx: 110, px: 0.68, flip: false, body: () => true, world: (x, y) => [x - 110, y - 190] };
BR.SPR.get = () => FAKE;
const ZONES = ['vitals', 'vitals', 'heart', 'liver', 'paunch', 'shoulder', 'spine', 'neck', 'ham', 'leg', 'miss', 'miss'];
BR.SPR.zone = () => pick(ZONES);
const sc = () => BR.scenes[BR.S.scene];
let SMART = true;
const EV = {};
const _log = BR.log; BR.log = (t, d) => { if (BR.S.chapter === +(process.env.START || -1)) { const k = (SMART ? 'S ' : 'r ') + t + (d && d.cause ? ':' + d.cause : '') + (d && d.cause === 'samScent' ? (d.cow ? ' cow' : '') + (d.past ? ' past' : ' before') + (d.shifted ? ' shifted' : '') + ' ' + d.phase : '') + (d && d.reason ? ':' + d.reason.slice(0, 40) : ''); EV[k] = (EV[k] || 0) + 1; } return _log(t, d); };
const tally = {}, bump = k => { tally[k] = (tally[k] || 0) + 1; };

function step() {
  const S = BR.S, name = S.scene, s = sc(), ch = BR.ch();
  switch (name) {
    case 'title': s.act(rnd() < 0.8 ? 'continue' : 'ridge'); if (BR.S.scene === 'title') s.act('continue'); break;
    case 'sam': if (rnd() < 0.5) s.act('wolf'); if (rnd() < 0.5) s.act('griz'); s.act('go'); break;
    case 'campsite': s.act('camp', pick(ch.camps).id); break;
    case 'intro': s.act(rnd() < 0.5 ? 'range' : 'skip'); break;
    case 'camp':
      if (S.part === 'morning' && !S.drank) { s.act('src', pick(BR.campData().water)); if (BR.S.scene === 'camp') s.act('drink', s.src === 'jug' ? 'none' : pick(['filter', 'tablets', 'boil', 'none', 'none'])); }
      else if (S.part === 'midday') s.act(ch.weapon === 'bow' && rnd() < 0.3 ? 'practice' : rnd() < 0.2 ? 'shop' : 'nap');
      else if (rnd() < 0.08 && !ch.guide) s.act(S.part === 'morning' ? 'job' : 'pack', ch.areas.find(a => !a.callOnly).id);
      else s.act('area', pick(ch.areas).id);
      break;
    case 'glass': {
      for (let i = 0; i < 4; i++) { s.lastInput = Date.now(); s.slow(); }
      const e = S.enc, vis = k => S.clock >= k.showAt && S.clock < k.hideAt;
      const g = e.groups.find(g2 => !g2.found && g2.elk.some(vis));
      if (g && rnd() < 0.9) { const k = g.elk.find(vis); e.view = Math.max(0, Math.min(360, k.x - 90)); s.mark(k.x - e.view, k.y); }
      const t = s.target(), r = rnd();
      if (e.job) s.act('report');
      else if (t && ch.weapon === 'rifle' && r < 0.45) s.act('shoot');
      else if (t && r < 0.8) s.act('plan');
      else if (r < 0.9) s.act('call'); else s.act('leave');
      if (BR.S.scene === 'call' && BR.S.enc && BR.S.enc.call === undefined) bump('call-without-state');
      break;
    }
    case 'plan': {
      const e = S.enc;
      s.up({ x: e.map.ex + (rnd() - 0.5) * 60, y: (e.map.ey + 228) / 2 });
      s.up({ x: e.map.ex + (rnd() - 0.5) * 30, y: e.map.ey + 25 });
      s.draw(ctx2d()); s.hud(); s.act('go');
      break;
    }
    case 'stalk': {
      s.hold('creep', true);
      for (let i = 0; i < 5000 && BR.S.scene === 'stalk'; i++) {
        if (i % 400 === 399 && rnd() < 0.3) { s.hold('creep', false); for (let j = 0; j < 100; j++) s.tick(0.033); s.hold('creep', true); }
        s.tick(0.033);
        if (i % 30 === 0) { s.draw(ctx2d()); s.upd(); }
        const n = s.nearest();
        if (n && n.yd <= Math.min(BR.maxShot(), 60) && rnd() < 0.05) { s.act(rnd() < 0.85 ? 'shoot' : 'call'); break; }
      }
      if (BR.S.scene === 'stalk') { s.act('shoot'); if (BR.S.scene === 'stalk') { bump('STUCK stalk'); BR.endHunt(); } }
      break;
    }
    case 'call': {
      const c = S.enc.call, acts = ['cow', 'bugle', 'rake', 'wait', 'move', 'estrus', 'wait', 'cow'];
      if (c.present && c.dist <= 60 && rnd() < 0.6) s.act('shoot');
      else if (c.dead) s.act('leave');
      else { let a = pick(acts); if (a === 'estrus' && !(ch.species === 'moose' || S.items.reeds)) a = 'cow'; if (a === 'move' && !(c.dist <= 200 && c.present)) a = 'wait'; s.act(a); }
      if (BR.S.scene === 'call') s.draw(ctx2d());
      break;
    }
    case 'shot': {
      const r = rnd();
      if (r < 0.06) { s.act('pass'); break; }
      if (r < 0.12) { s.act(S.enc.shot.options.length > 1 ? 'next' : 'wait'); break; }
      s.down({ x: 90, y: 120 });
      if (s.phase === 'ready' && s.guide) { s.act('pass'); break; }
      for (let i = 0; i < 400 && s.phase === 'drawing'; i++) s.tick(0.033);
      if (s.phase === 'full') {
        for (let i = 0; i < 20; i++) { s.move({ x: 90 + (rnd() - 0.5) * 6, y: 120 + (rnd() - 0.5) * 6 }); s.tick(0.033); }
        s.draw(ctx2d()); s.upd(); s.up();
        for (let i = 0; i < 40 && BR.S.scene === 'shot' && s.phase === 'flight'; i++) s.tick(0.033);
      }
      if (BR.S.scene === 'shot') for (let i = 0; i < 600 && BR.S.scene === 'shot' && s.phase === 'ready'; i++) s.tick(0.1);
      break;
    }
    case 'recover': {
      const rec = S.enc.rec;
      if (rec.phase === 'sign') s.act('wait', String(SMART ? [0, 0.5, 4, 9].find(h => h >= rec.m.need) : pick([0, 0.5, 4, 9])));
      else if (rec.phase === 'track') { if (rnd() < 0.1) s.up({ x: 1, y: 1 }); const p = rec.pts[rec.found]; s.up({ x: p.x, y: p.y }); }
      else if (rec.phase === 'dry') s.act(rnd() < 0.5 ? 'grid' : 'lost');
      else if (rec.phase === 'found') s.act('tag');
      if (BR.S.scene === 'recover') s.draw(ctx2d());
      break;
    }
    case 'meat': {
      const m = S.enc.meat;
      if (m.step === 'method') s.act('method', pick(['boned', 'quarters', 'whole']));
      else if (m.step === 'hang') s.act('hang', pick(['shade', 'creek', 'sun', 'ground']));
      else s.act('done');
      if (BR.S.scene === 'meat') s.draw(ctx2d());
      break;
    }
    case 'outcome': s.draw(ctx2d()); s.act('back'); break;
    case 'debrief': {
      s.draw(ctx2d());
      if (ch.guide && S.lesson.picked == null) s.act('pick', String((rnd() * 3) | 0));
      if (rnd() < 0.4 && S.lesson.gear) s.act('buy', S.lesson.gear);
      s.act('sleep');
      break;
    }
    case 'shop': s.draw(ctx2d()); ['windChecker', 'reeds', 'fixedBlades', 'rangefinder', 'sticks', 'tripod', 'scope312', 'suppressor', 'filter', 'gameBags', 'framePack', 'bow:talon', 'bow:apex', 'rifle:65cm', 'rifle:7prc', 'rifle:338wm'].forEach(id => { if (rnd() < 0.2) s.act('buy', id); }); s.act('back'); break;
    case 'season': s.draw(ctx2d()); s.act('next'); break;
    case 'dead': s.act('again'); break;
    case 'finale': if (S.nativeOpen && rnd() < 0.3) { s.act('native'); break; } return 'finished';
    case 'bridge': s.act('go'); break;
    case 'locate': { const L = S.enc.loc; if (L.answer && rnd() < 0.85) s.act('close'); else if (L.tries < 4 && rnd() < 0.85) s.act('bugle'); else s.act(rnd() < 0.5 ? 'glass' : 'leave'); break; }
    case 'setup': {
      const G = S.enc.g, v = s.view(), T = m => ({ x: (m.x - v.x0) * v.z, y: (m.y - v.y0) * v.z });
      let mid = { x: G.A.x + (G.B.x - G.A.x) * (0.3 + rnd() * 0.35) + (rnd() - 0.5) * 30, y: G.A.y + (G.B.y - G.A.y) * (0.3 + rnd() * 0.35) };
      let me = { x: G.A.x + (rnd() - 0.5) * 8, y: G.A.y };
      if (SMART) {  // caller downwind of the bull (scent drifts away from him); Sam 60 yd toward the bull from the caller, 15 yd off the line
        const sc = BR.scent(BR.area(S.enc.area), S.clock);
        const side0 = rnd() < 0.5 ? 1 : -1;  // crosswind of the bull, a little downwind
        me = { x: G.B.x - sc.y * 33 * side0 + sc.x * 10, y: G.B.y + sc.x * 33 * side0 + sc.y * 10 };
        const ax = me.x - G.A.x, ay = me.y - G.A.y, al = Math.hypot(ax, ay); if (al > 54) { me = { x: G.A.x + ax / al * 54, y: G.A.y + ay / al * 54 }; }
        const dx = G.B.x - me.x, dy = G.B.y - me.y, L = Math.hypot(dx, dy) || 1, side = rnd() < 0.5 ? 1 : -1;
        mid = { x: me.x + dx / L * 15 + sc.x * 6, y: me.y + dy / L * 15 + sc.y * 6 };  // on the downwind side of his line
      }
      s.up(T(mid)); s.up(T(me)); s.draw(ctx2d()); s.hud();
      if (G.sam && G.me) s.act('go'); else s.act(rnd() < 0.5 ? 'leave' : 'clear');
      if (BR.S.scene === 'setup') s.act('leave');
      break;
    }
    case 'guideCall': {
      const G = S.enc.g;
      if (G.phase === 'close') {
        for (let i = 0; i < 4000 && BR.S.scene === 'guideCall' && G.phase === 'close'; i++) {
          const d = Math.hypot(G.pos.x - G.sam.x, G.pos.y - G.sam.y) * 3;
          if (!G.drawn && !G.drawing && d < 45 && (SMART ? !G.looking && !G.cows.some(c => Math.hypot(c.x - G.sam.x, c.y - G.sam.y) * 3 < 30) : rnd() < 0.02)) s.act('draw');
          if (G.drawn && !(G.stopped > 0) && d < 36 && rnd() < (SMART ? 0.2 : 0.01)) s.act('mew');
          s.tick(0.05); if (i % 40 === 0) s.draw(ctx2d());
        }
        if (BR.S.scene === 'guideCall' && G.phase === 'close') { bump('STUCK guideCall'); s.act('leave'); }
        break;
      }
      const acts = ['cow', 'cow', 'rake', 'wait', 'locate', 'challenge', 'backoff', 'estrus', 'wait'];
      if (G.done) { s.act('leave'); break; }
      let a = pick(acts); if (a === 'estrus' && !S.items.reeds) a = 'cow';
      if (G.hung && rnd() < 0.3) a = pick(['backoff', 'wait', 'closer']);
      if (rnd() < 0.02) a = 'leave';
      s.act(a); if (BR.S.scene === 'guideCall') s.draw(ctx2d());
      break;
    }
    case 'samShot': { for (let i = 0; i < 60 && !s.done; i++) s.tick(0.05); s.draw(ctx2d()); s.act('go'); break; }
    case 'native': s.act(rnd() < 0.8 ? 'go' : 'fire'); break;
    case 'nativeEnd': if (rnd() < 0.5) s.act('again'); else return 'finished'; break;
    case 'range': {
      for (let n = 0; n < 7; n++) {
        s.down({ x: 90, y: 120 });
        for (let i = 0; i < 300 && s.phase === 'drawing'; i++) s.tick(0.033);
        if (s.phase === 'full') { for (let i = 0; i < 10; i++) s.tick(0.033); s.draw(ctx2d()); s.up(); for (let i = 0; i < 30 && s.phase === 'flight'; i++) s.tick(0.033); }
      }
      if (S[s.key] && S[s.key].done && rnd() < 0.4) s.act('dist', String(pick(s.steps)));
      s.draw(ctx2d()); s.act('done');
      break;
    }
    default: throw new Error('unknown scene ' + name);
  }
}

function invariants(where) {
  const S = BR.S;
  const bad = [];
  if (!BR.scenes[S.scene]) bad.push('scene ' + S.scene);
  if (!Number.isFinite(S.clock)) bad.push('clock ' + S.clock);
  if (!(S.cash >= 0)) bad.push('cash ' + S.cash);
  if (S.day < 1 || S.day > S.days + 3) bad.push('day ' + S.day);
  if (!(S.chapter >= 0 && S.chapter < BR.CHAPTERS.length)) bad.push('chapter ' + S.chapter);
  const js = JSON.stringify(S);
  if (/NaN|Infinity/.test(js)) bad.push('NaN in state');
  if (bad.length) throw new Error(`invariant @${where}: ${bad.join(', ')}`);
}

const N = +process.argv[2] || 60, MAXSTEPS = +process.argv[3] || 20000;
let errors = 0;
const reach = {}, t0 = Date.now();
for (let n = 0; n < N; n++) {
  SMART = rnd() < 0.7; BR.wipe(); BR.newGame(); if (process.env.START) { BR.S.finished = false; BR.S.chapter = +process.env.START; } BR.startSeason(+(process.env.START || 0));
  let steps = 0, last = '', repeat = 0, prevKey = '';
  try {
    while (steps++ < MAXSTEPS) {
      last = BR.S.scene;
      const key = BR.S.scene + BR.S.day + BR.S.part + BR.S.chapter + BR.S.year + Math.round(BR.S.clock * 10);
      repeat = key === prevKey ? repeat + 1 : 0; prevKey = key;
      if (repeat > 400) throw new Error('stuck in ' + key);
      if (rnd() < 0.01) { BR.save(); BR.start(); bump('reload'); }
      if (rnd() < 0.01) { BR.back(); const h = BR.overlayHandlers; if (h) { if (rnd() < 0.5 && h.yes) h.yes(); else if (h.no) h.no(); else BR.closeOverlay(); } }
      if (rnd() < 0.005) { BR.openMenu(); BR.overlayHandlers.help(); BR.overlayHandlers.menu(); BR.overlayHandlers.resume(); }
      if (step() === 'finished') { bump('FINISHED'); break; }
      if (process.env.START && BR.S.history.length) break;
      invariants(last + '→' + BR.S.scene);
      reach[BR.S.chapter] = Math.max(reach[BR.S.chapter] || 0, 1);
    }
    if (steps >= MAXSTEPS) bump('ran out of steps (chapter ' + BR.S.chapter + ')');
    BR.S.events.concat(BR.S.history.map(h => ({ type: 'season:' + (h.filled ? 'filled' : h.verdict ? 'violation' : 'soup') }))).forEach(x => bump(x.type));
    bump('deaths:' + (BR.S.stats.seasons > 0 ? 0 : 0));
  } catch (e) {
    errors++;
    if (errors <= 5) console.log(`ERROR (career ${n}, after scene ${last}, step ${steps}):\n`, e.stack.split('\n').slice(0, 6).join('\n'));
  }
}
console.log(`careers ${N} · errors ${errors} · ${((Date.now() - t0) / 1000).toFixed(1)} s · chapters reached ${Object.keys(reach).join(',')}`);
const keys = ['FINISHED', 'reload', 'season:filled', 'season:soup', 'season:violation', 'dysentery', 'illegal', 'lostday', 'predator', 'kill', 'lost', 'miss', 'charge', 'bust', 'spot', 'water', 'camp'];
console.log(Object.fromEntries(keys.map(k => [k, tally[k] || 0])));
console.log(Object.fromEntries(Object.entries(tally).filter(([k]) => /STUCK|ran out|without/.test(k))));
if (process.env.START) console.log('events', EV);

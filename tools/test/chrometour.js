// Runs inside the game page. Each step drives the real game into a state and returns {shot} for a screenshot.
(function () {
  const BR = window.BR;
  const fresh = ch => { BR.wipe(); BR.newGame(); BR.S.cash = 5000; BR.startSeason(ch); };
  const toCamp = () => { const S = BR.S; BR.scenes.sam.act('go'); BR.scenes.campsite.act('camp', BR.ch().camps[0].id); if (S.scene === 'intro') BR.scenes.intro.act('skip'); S.drank = true; BR.go('camp'); };
  const glassWithTarget = () => {
    const S = BR.S, ch = BR.ch(), area = ch.areas.find(a => !a.callOnly);
    S.enc = { area: area.id }; BR.go('glass', { area: area.id });
    const e = S.enc, g = BR.scenes.glass;
    if (!e.groups.length) e.groups.push({ id: 0, x: 200, y: 150, found: false, elk: BR.group(BR.rng(3), ch).map((a, i) => ({ a, x: 200 + i * 6, y: 150, flip: false, feed: false, hideAt: 99, showAt: 0 })) });
    e.groups.forEach(gr => gr.elk.forEach(k => { k.hideAt = 99; k.showAt = 0; }));
    const k = e.groups[0].elk[0]; e.view = Math.max(0, Math.min(360, k.x - 90)); g.mark(k.x - e.view, k.y);
    BR.draw(); g.hud();
    return g;
  };
  const shotAt = (animals, range, from) => {
    const S = BR.S; S.enc = S.enc || { area: BR.ch().areas[0].id };
    S.enc.shot = { options: animals.map(a => ({ a, range, angle: 'broadside', est: range, wind: 4 })), i: 0, from: from || 'stalk', alert: 0, walking: false };
    BR.go('shot'); const s = BR.scenes.shot; BR.stop();
    s.phase = 'full'; s.holdT = 0.2; s.aim = { x: s.vit.x, y: s.vit.y - (s.rifle ? BR.drop(range, s.rf) * s.spr.px : (range - s.mid) / 10 * 6 * s.k) };
    BR.draw(); s.upd();
    return s;
  };
  const STEPS = {
    'title': () => { fresh(0); BR.go('title'); return { shot: '01-title' }; },
    'sam-colorado': () => { fresh(0); return { shot: '02-sam-co' }; },
    'campsite': () => { BR.scenes.sam.act('go'); return { shot: '03-campsite' }; },
    'camp-water': () => { BR.scenes.campsite.act('camp', 'creek'); if (BR.S.scene === 'intro') BR.scenes.intro.act('skip'); return { shot: '04-camp-water', note: BR.S.scene }; },
    'camp-areas': () => { BR.S.drank = true; BR.go('camp'); return { shot: '05-camp-areas' }; },
    'glass-co': () => { glassWithTarget(); BR.scenes.glass.mode = 'loupe'; const e = BR.S.enc, k = e.groups[0].elk[0]; BR.scenes.glass.touch = { x: k.x - e.view, y: k.y }; BR.draw(); BR.scenes.glass.mode = null; BR.scenes.glass.touch = null; return { shot: '06-glass-co' }; },
    'plan': () => { BR.scenes.glass.act('plan'); const p = BR.scenes.plan; p.up({ x: 70, y: 180 }); p.up({ x: BR.S.enc.map.ex - 10, y: BR.S.enc.map.ey + 30 }); return { shot: '07-plan' }; },
    'stalk': () => { BR.scenes.plan.act('go'); const e = BR.S.enc; BR.stop(); e.st.hx = e.elk[0].x - 12; e.st.hy = e.elk[0].y + 10; e.st.seg = 99; BR.draw(); BR.scenes.stalk.upd(); return { shot: '08-stalk', note: BR.scenes.stalk.nearest().yd + ' yd' }; },
    'call-co': () => { BR.go('call', { area: 'wallow', dist: 45, bull: true }); const c = BR.S.enc.call; c.present = true; c.dist = 45; c.animal = { sp: 'elk', sex: 'bull', pts: 6 }; c.steam = 1; BR.draw(); BR.scenes.call.hud(); return { shot: '09-call-co' }; },
    'bow-shot-6x6': () => { const s = shotAt([{ sp: 'elk', sex: 'bull', pts: 6 }], 32); return { shot: '10-bow-6x6' }; },
    'bow-vitals-hit': () => { const s = BR.scenes.shot; s.aim = { x: s.vit.x, y: s.vit.y - (s.range - s.mid) / 10 * 6 * s.k }; s.holdT = 0.01; const orig = BR.archery.gauss; s.release(); const z = BR.S.enc.shotResult.zone; return { note: 'zone=' + z }; },
    'recover-found': () => { BR.go('recover'); const r = BR.S.enc.rec; r.phase = 'found'; r.found = r.pts.length; BR.draw(); BR.scenes.recover.hud(); return { shot: '11-recover' }; },
    'meat': () => { BR.go('meat'); return { shot: '12-meat' }; },
    'range': () => { BR.go('range', { back: 'camp' }); return { shot: '13-range' }; },
    'rifle-cow-tag': () => { fresh(1); toCamp(); shotAt([{ sp: 'elk', sex: 'bull', pts: 1 }, { sp: 'elk', sex: 'cow', pts: 0 }], 280, 'glass'); return { shot: '14-rifle-co-spike' }; },
    'sam-idaho': () => { fresh(2); return { shot: '15-sam-idaho' }; },
    'glass-idaho-fence': () => { toCamp(); glassWithTarget(); BR.S.enc.view = 220; BR.draw(); return { shot: '16-glass-idaho' }; },
    'wolf-shot': () => { shotAt([{ sp: 'wolf', sex: 'wolf', black: true }], 180, 'glass'); return { shot: '17-wolf' }; },
    'griz-montana': () => { fresh(3); toCamp(); shotAt([{ sp: 'griz', sex: 'bear' }], 150, 'glass'); return { shot: '18-griz' }; },
    'mt-forky': () => { shotAt([{ sp: 'elk', sex: 'bull', pts: 2 }], 220, 'glass'); return { shot: '19-mt-forkhorn' }; },
    'charge': () => { BR.go('outcome', { kind: 'charge' }); return { shot: '20-charge' }; },
    'ak-moose-4brow': () => { fresh(4); toCamp(); shotAt([{ sp: 'moose', sex: 'bull', spread: 46, brows: 4 }], 160, 'glass'); return { shot: '21-moose-4brow' }; },
    'ak-moose-2brow': () => { shotAt([{ sp: 'moose', sex: 'bull', spread: 44, brows: 2 }], 160, 'glass'); return { shot: '22-moose-2brow' }; },
    'ak-call': () => { BR.go('call', { area: 'slough', dist: 70, bull: true }); const c = BR.S.enc.call; c.present = true; c.dist = 70; c.animal = { sp: 'moose', sex: 'bull', spread: 54, brows: 3 }; BR.draw(); BR.scenes.call.hud(); return { shot: '23-ak-call' }; },
    'epilogue-debrief': () => { fresh(5); toCamp(); BR.S.part = 'night'; BR.go('debrief'); return { shot: '24-epilogue-debrief' }; },
    'dead': () => { BR.go('dead'); return { shot: '25-dead' }; },
    'guide-camp': () => { fresh(5); toCamp(); BR.S.part = 'morning'; BR.go('camp'); const t = document.getElementById('hud').textContent; if (!/Sam’s legs/.test(t) || !/Sep 18/.test(t)) throw new Error('guide camp hud: ' + t.slice(0, 120)); return { shot: '30-guide-camp' }; },
    'guide-locate': () => {
      BR.S.enc = { area: 'burn' }; BR.go('locate', { area: 'burn' });
      const L = BR.S.enc.loc; L.answer = { yd: 340, dir: 'northeast', dx: 1, pts: 6, cows: 4, silent: false }; L.animal = { sp: 'elk', sex: 'bull', pts: 6 }; L.msg = 'A bugle rolls back across the basin, then glunks and chuckles. A herd bull with cows.';
      BR.draw(); BR.scenes.locate.hud(); return { shot: '31-guide-locate' };
    },
    'guide-setup': () => {
      BR.scenes.locate.act('close');
      const s = BR.scenes.setup, G = BR.S.enc.g, v = s.view(), T = m => ({ x: (m.x - v.x0) * v.z, y: (m.y - v.y0) * v.z }), sc = BR.scent(BR.area('burn'), BR.S.clock);
      let me = { x: G.B.x - sc.y * 33 + sc.x * 10, y: G.B.y + sc.x * 33 + sc.y * 10 };
      const ax = me.x - G.A.x, ay = me.y - G.A.y, al = Math.hypot(ax, ay); if (al > 54) me = { x: G.A.x + ax / al * 54, y: G.A.y + ay / al * 54 };
      const dx = G.B.x - me.x, dy = G.B.y - me.y, L = Math.hypot(dx, dy);
      s.up(T({ x: me.x + dx / L * 15 + sc.x * 6, y: me.y + dy / L * 15 + sc.y * 6 })); s.up(T(me));
      if (!G.sam || !G.me) throw new Error('placement rejected: ' + G.msg);
      return { shot: '32-guide-setup', note: G.msg };
    },
    'guide-calling': () => { BR.scenes.setup.act('go'); const G = BR.S.enc.g; G.seen = true; G.pos = { x: G.B.x + (G.D.x - G.B.x) * 0.3, y: G.B.y + (G.D.y - G.B.y) * 0.3 }; G.t = 0.3; BR.draw(); BR.scenes.guideCall.hud(); return { shot: '33-guide-calling', note: 'closest ' + Math.round(G.closest.d * 3) + ' yd · downwind side ' + G.downwindSide }; },
    'guide-close': () => {
      const sc = BR.scenes.guideCall, G = BR.S.enc.g; sc.goClose(); BR.stop();
      G.t = Math.max(0, G.closest.t - 0.08); G.pos = { x: G.B.x + (G.D.x - G.B.x) * G.t, y: G.B.y + (G.D.y - G.B.y) * G.t };
      G.cows = []; G.looking = false; G.drawn = true; G.holdT = 6; BR.draw(); sc.upd(); return { shot: '34-guide-close' };
    },
    'guide-samshot': () => {
      const sc = BR.scenes.guideCall, G = BR.S.enc.g; BR.S.clock = Math.max(BR.S.clock, 7.5); G.stopped = 3;
      sc.shoot(26, false); const ss = BR.scenes.samShot; BR.stop(); for (let i = 0; i < 30; i++) ss.tick(0.05); BR.draw();
      return { shot: '35-guide-samshot', note: 'zone ' + BR.S.enc.shotResult.zone };
    },
    'guide-recover': () => { BR.scenes.samShot.act(); if (BR.S.scene === 'recover') return { shot: '36-guide-recover' }; return { shot: '36-guide-miss', note: BR.S.scene }; },
    'guide-debrief': () => { BR.S.part = 'night'; BR.S.lessonDay = 0; BR.go('debrief'); BR.scenes.debrief.act('pick', '0'); return { shot: '37-guide-debrief' }; },
    'shot-walking': () => {
      fresh(0); toCamp(); BR.S.enc = { area: 'wallow' };
      BR.S.enc.shot = { options: [{ a: { sp: 'elk', sex: 'bull', pts: 6 }, range: 30, angle: 'broadside' }], i: 0, from: 'call', alert: 0, walking: true };
      BR.go('shot'); BR.stop(); const s = BR.scenes.shot; if (!s.walking || !document.querySelector('[data-act="mew"]')) throw new Error('no walking/mew');
      const x0 = s.pos.dx; s.tick(1); if (s.pos.dx === x0) throw new Error('walking bull did not move'); BR.draw(); return { shot: '38-shot-walking' };
    },
    'shot-mew': () => { const s = BR.scenes.shot; s.act('mew'); if (s.walking) throw new Error('mew did not stop him'); BR.draw(); return { shot: '39-shot-mew' }; },
    'glass-bedded': () => {
      BR.S.part = 'morning'; BR.S.clock = 9.5; const g = glassWithTarget(), e = BR.S.enc;
      e.groups.forEach(gr => gr.elk.forEach(k => { k.hideAt = 9.4; }));
      g.hud(); if (!document.querySelector('[data-act="standwait"]')) throw new Error('no wait-for-them-to-stand');
      g.act('standwait'); if (BR.S.part !== 'evening' || BR.S.scene !== 'glass') throw new Error('standwait went to ' + BR.S.scene + ' ' + BR.S.part);
      return { shot: '40-glass-stood', note: 'clock ' + BR.fmt(BR.S.clock) };
    },
    'thermal-phases': () => { const a = BR.area('bench'), t = [6, 10, 15, 18.5].map(c => BR.thermal(c, a)); if (t.join() !== 'down,up,swirl,down') throw new Error(t.join()); return { note: t.join(' ') }; },
    'rut-calendar': () => { const out = BR.CHAPTERS.map((c, i) => c.name + ' ' + BR.date(c, 1).label + ' ' + BR.rutPhase(c, 1).label); return { note: out.join(' | ') }; },
    'finale': () => { BR.S.finished = true; BR.go('finale'); return { shot: '26-finale' }; },
    'menu': () => { BR.go('camp'); BR.openMenu(); return { shot: '27-menu' }; },
    'sprites-all': () => {
      BR.closeOverlay();
      const list = [
        [{ sp: 'elk', sex: 'bull', pts: 7 }, 'stand'], [{ sp: 'elk', sex: 'bull', pts: 5 }, 'walk'], [{ sp: 'elk', sex: 'bull', pts: 4 }, 'feed'], [{ sp: 'elk', sex: 'bull', pts: 6 }, 'bugle'],
        [{ sp: 'elk', sex: 'bull', pts: 1 }, 'stand'], [{ sp: 'elk', sex: 'bull', pts: 2 }, 'alert'], [{ sp: 'elk', sex: 'cow' }, 'alert'], [{ sp: 'elk', sex: 'cow', calf: true }, 'walk'],
        [{ sp: 'moose', sex: 'bull', spread: 60, brows: 5 }, 'stand'], [{ sp: 'moose', sex: 'cow' }, 'walk'], [{ sp: 'wolf', sex: 'wolf' }, 'walk'], [{ sp: 'griz', sex: 'bear' }, 'walk'],
        [{ sp: 'griz', sex: 'bear' }, 'charge'], [{ sp: 'elk', sex: 'bull', pts: 6 }, 'dead'], [{ sp: 'moose', sex: 'bull', spread: 50, brows: 3 }, 'dead'], [{ sp: 'wolf', sex: 'wolf', black: true }, 'stand']
      ];
      const c = document.getElementById('scene'), g = c.getContext('2d');
      g.fillStyle = '#39452f'; g.fillRect(0, 0, 180, 240);
      const empty = [];
      list.forEach(([a, pose], i) => {
        const spr = BR.SPR.get(a, pose, 0.42);
        if (spr.x1 <= spr.x0) empty.push(a.sp + ':' + pose);
        BR.SPR.draw(g, spr, 23 + (i % 4) * 45, 52 + Math.floor(i / 4) * 58);
      });
      BR.stop();
      return { shot: '28-sprites', note: empty.length ? 'EMPTY ' + empty.join(',') : 'all sprites drawn' };
    },
    'vitals-zones': () => {
      const res = ['elk', 'moose', 'wolf', 'griz'].map(sp => {
        const a = { sp, sex: sp === 'elk' || sp === 'moose' ? 'bull' : 'x', pts: 6, spread: 50, brows: 3 };
        const spr = BR.SPR.get(a, 'stand', 1), z = BR.SPR.vitals(sp);
        const px = spr.cx + z.vit[0] * spr.px, py = spr.gy + z.vit[1] * spr.px;
        const on = spr.body(px, py), [wx, wy] = spr.world(px, py);
        return `${sp}:${BR.SPR.zone(sp, wx, wy, 'broadside', on)}`;
      });
      if (res.some(r => !r.endsWith('vitals'))) throw new Error('vitals mismatch ' + res.join(' '));
      return { note: res.join(' ') };
    }
  };
  window.TOUR = { list: () => Object.keys(STEPS), run: name => STEPS[name]() };
})();

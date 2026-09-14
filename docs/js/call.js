// Bugle Ridge — calling. Turn-based: each call or wait spends a few minutes; the animal answers, closes, hangs up, or circles downwind.
// Elk chapters call elk; Alaska calls moose. What comes in is whatever comes in: check it before you shoot.
(function () {
  const BR = window.BR, { P, W, H, R } = BR;
  const angDiff = (a, b) => ((b - a + 540) % 360) - 180;

  const VOC = {
    elk: { cow: 'Cow mew', estrus: 'Estrus whine', bugle: 'Bugle', rake: 'Rake a tree', answer: 'He bugles back, closer.', close: 'Brush cracks. Something’s coming.', far: 'Far off, a bugle. Then nothing.', hold: 'He chuckles but holds.' },
    moose: { cow: 'Cow moose call', estrus: 'Cow grunt series', bugle: 'Bull grunt', rake: 'Rake the willows', answer: 'A deep grunt back, closer.', close: 'Willows crack and sway. Something’s coming.', far: 'A grunt far down the slough. Then nothing.', hold: 'He grunts and holds in the willows.' }
  };

  let bgCache = null;
  function timberBg(look) {
    if (bgCache && bgCache.look === look) return bgCache.c;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const o = c.getContext('2d'); o.imageSmoothingEnabled = false;
    const snow = look === 'snow';
    BR.bands(o, [[0, '#0b130e'], [120, '#15221a'], [170, '#1b2a1f']]);
    for (let Y = 0; Y < 175; Y++) for (let X = 0; X < W; X++) { const s = (X + Y * 0.55) % 56; if (s < 9 && BR.BAYER[(Y & 3) * 4 + (X & 3)] < 0.45 * (1 - Math.abs(s - 4.5) / 4.5) * (1 - Y / 220)) R(o, X, Y, 1, 1, '#2f4533'); }
    for (let X = -4; X < W; X += 7) BR.pine(o, X, 150 + ((X * 3) % 8), 60 + ((X * 7) % 18), '#1a2c20');
    for (let X = 2; X < W; X += 13) BR.pine(o, X, 172 + ((X * 5) % 6), 78 + ((X * 11) % 20), '#132219');
    BR.bands(o, [[168, snow ? '#8a949e' : '#24301f'], [H, snow ? '#5a646e' : '#161e14']]);
    BR.grass(o, 170, 900, 7, snow ? ['#c8d0da', '#a8b0ba', '#e8ecf0'] : ['#2e3824', '#3e3726', '#1a2316', '#4a4030']);
    for (let X = 60; X < 150; X++) { const y = Math.round(196 + (X - 60) * 0.06); R(o, X, y, 1, 4, '#3e2e20'); R(o, X, y, 1, 1, snow ? '#e8ecf0' : '#6a5238'); }
    bgCache = { look, c };
    return c;
  }

  BR.scenes.call = {
    enter(a) {
      const S = BR.S, ch = BR.ch();
      if (!S.enc) S.enc = { area: a.area };
      const e = S.enc;
      this.area = BR.area(e.area || a.area);
      this.voc = VOC[ch.species];
      if (!e.call) {
        const rut = ch.rut(S.day), r = Math.random, blind = !!a.blind;
        const present = blind ? r() < this.area.elk * (e.spooked ? 0.5 : 1) * (e.howled ? 0.3 : 1) * 0.7 + rut * 0.08 : true;
        const g = BR.group(BR.rng((Date.now() % 100000) + 7), ch);
        let responder = g.find(x => x.sex === 'bull') || g[0];
        if (ch.species === 'elk' && r() < (rut < 0.5 ? 0.45 : 0.15)) responder = g.find(x => x.sex === 'cow') || responder;
        const sc0 = BR.scent(this.area, S.clock), sb0 = Math.atan2(sc0.x, -sc0.y) * 180 / Math.PI;
        let face = (r() - 0.5) * 50;
        if (Math.abs(angDiff(sb0, face)) < 60) face = sb0 + (r() < 0.5 ? 70 : -70);
        e.call = {
          present, animal: responder, herd: blind ? r() < 0.5 : a.bull === true, dist: Math.round(a.dist || 180 + r() * 160),
          interest: blind ? 5 : 15, susp: 0, rel: face, face, hist: [], turns: 0, estrus: 0, pushed: false, angle: null, steam: 0, dead: false,
          msg: blind ? 'You slip into cover and settle in.' : 'You set up in cover below them. Wind check.'
        };
      }
      this.hud();
    },
    draw(g) {
      const c = BR.S.enc.call;
      g.drawImage(timberBg(BR.ch().look), 0, 0);
      const far = c.present && c.dist <= 150 && c.dist > 95, near = c.present && c.dist <= 95;
      if (far) this.drawAnimal(g, c);
      BR.pine(g, 172, 186, 150, '#0f1c13');
      R(g, 171, 170, 3, 18, '#241a12');
      if (near) this.drawAnimal(g, c);
      R(g, 0, 0, 14, H, '#271e15'); R(g, 12, 0, 2, H, '#45362a'); R(g, 0, 0, 3, H, '#1a130d');
      for (let Y = 4; Y < H; Y += 9) R(g, 4 + (Y % 4), Y, 4, 5, '#1b150f');
      BR.sprite(g, BR.HUNT, BR.HCOL, 12, 196, 3, false);
      for (let j = 0; j < 20; j++) R(g, 14, j, 30 - j * 1.5, 1, '#0a110c');
    },
    drawAnimal(g, c) {
      const rel = BR.clamp(angDiff(c.face, c.rel) / 90, -1, 1);
      const scale = BR.clamp(40 / Math.max(20, c.dist), 0.3, 1.2) * (c.animal.sp === 'moose' ? 0.8 : 1);
      const feet = Math.round(172 + (1 - Math.min(c.dist, 160) / 160) * 52);
      const pose = c.steam && c.animal.sex === 'bull' && c.animal.sp === 'elk' ? 'bugle' : 'walk';
      const spr = BR.SPR.get(c.animal, pose, scale, { flip: c.angle ? c.angle !== 'broadside' || rel < 0 : rel < 0 });
      BR.SPR.draw(g, spr, W * 0.58 + rel * 50, feet);
    },
    hud() {
      const S = BR.S, ch = BR.ch(), c = S.enc.call, v = this.voc, has = S.items;
      const yd = !c.present || c.dist > 150 ? '<span class="dim">unseen</span>' : `≈${Math.round(c.dist / 5) * 5} yd`;
      const scent = has.windChecker ? (() => { const sc = BR.scent(this.area, S.clock); return `<div class="row sm"><span>Scent drifting <span class="ok">${BR.compass(sc.x, sc.y)}</span> · thermals ${sc.thermal}hill</span></div>`; })() : '';
      const canShoot = c.present && c.dist <= Math.min(BR.maxShot(), ch.weapon === 'bow' ? 60 : 200);
      const locked = c.dead, estrusOK = ch.species === 'moose' || has.reeds;
      BR.hud(`
        <div class="row"><span class="t">CALLING · ${BR.dayInfo(S.day).rut.toUpperCase()}</span><span class="hi">${yd}</span></div>
        <div class="row sm"><span class="${c.turns ? 'toast' : 'dim'}">${c.msg}</span></div>
        ${scent}
        <div class="sp"></div>
        ${canShoot ? BR.btn('shoot', `Shoot · ${c.dist} yd`, 'go') : ''}
        <div class="g2">
          ${BR.btn('cow', v.cow, '', null, locked)}
          ${BR.btn('estrus', estrusOK ? v.estrus : v.estrus + ' (reeds)', '', null, locked || !estrusOK)}
          ${BR.btn('bugle', v.bugle, '', null, locked)}
          ${BR.btn('rake', v.rake, '', null, locked)}
          ${BR.btn('wait', 'Wait quietly', '', null, locked)}
          ${c.dist <= 200 && c.present ? BR.btn('move', 'Slip crosswind', '', null, locked) : BR.btn('leave', 'Leave', '')}
        </div>`);
    },
    act(a) {
      const S = BR.S, e = S.enc, c = e.call;
      if (a === 'leave') { if (!c.present) BR.log('noelk', { area: e.area, via: 'call' }); BR.endHunt(); return; }
      if (a === 'shoot') { e.shot = { options: [{ a: c.animal, range: Math.round(c.dist), angle: c.angle || 'broadside' }], i: 0, from: 'call', alert: c.susp }; BR.go('shot'); return; }
      this.turn(a);
    },
    turn(action) {
      const S = BR.S, ch = BR.ch(), e = S.enc, c = e.call, v = this.voc, rut = ch.rut(S.day) * ch.callShy(S.day), r = Math.random;
      BR.pass(action === 'wait' ? 8 : action === 'move' ? 6 : 4);
      c.turns++; c.steam = 0;
      const calls = ['cow', 'estrus', 'bugle'], recent = c.hist.slice(-3).filter(h => calls.includes(h)).length;
      c.hist.push(action);
      let msg = '';
      if (S.part === 'evening' && S.clock >= 19.6) return this.end({ kind: 'dark' });
      if (S.part === 'morning' && S.clock >= 11.5) { c.msg = 'Midday. Everything’s bedded.'; c.dead = true; return this.after(); }
      if (!c.present) {
        msg = action === 'wait' ? 'A squirrel chatters. Nothing else.' : r() < 0.25 ? v.far : 'Nothing answers.';
        if (c.turns >= 6) { msg = 'Nothing’s answering here. Try another spot.'; c.dead = true; }
        c.msg = msg; return this.after();
      }
      const d = c.dist, bull = c.animal.sex === 'bull';
      if (action === 'cow') { c.interest += 10 + 6 * rut + (d < 70 ? 8 : 0); if (recent >= 2) { c.susp += 12; msg = 'That’s a lot of calling for one cow. '; } }
      else if (action === 'estrus') { c.estrus++; c.interest += (bull ? 12 + 14 * (rut - 1) : 2); c.susp += c.estrus >= 2 ? 14 : 3; }
      else if (action === 'bugle') {
        if (!bull) { c.susp += 10; msg = 'She stops and stares toward the sound. '; }
        else if (c.herd) {
          if (d > 120) { c.interest += 8 + 8 * rut; if (r() < 0.3) { c.dist += 35; c.pushed = true; msg = 'He answers and pushes his cows away. '; } }
          else if (r() < 0.5) { c.interest += 30; c.dist -= 25; msg = 'He comes in hot, raking and grunting! '; }
          else { c.dist += 45; c.interest -= 12; c.pushed = true; msg = 'He gathers his cows and moves off. '; }
        } else if (d < 150) { c.interest -= 10; c.susp += 6; msg = 'He goes quiet. You may have scared him. '; }
        else c.interest += 6;
        if (recent >= 2) c.susp += 8;
      } else if (action === 'rake') { c.interest += d < 110 ? (bull ? 16 : 4) : 4; c.susp = Math.max(0, c.susp - 3); }
      else if (action === 'wait') {
        c.susp = Math.max(0, c.susp - 10); if (d > 110) c.interest -= 3;
        if (d <= 60 && c.angle !== 'broadside' && r() < 0.5) { c.angle = 'broadside'; msg = 'Turns broadside, looking for the call. '; }
      } else if (action === 'move') {
        const sc0 = BR.scent(this.area, S.clock), sb = Math.atan2(sc0.x, -sc0.y) * 180 / Math.PI, df = angDiff(sb, c.rel);
        c.rel = sb + (df >= 0 ? 95 : -95);
        if (d < 100) { c.susp += 18; msg = 'You ease 40 yards crosswind. It may have caught the movement. '; } else msg = 'You slip 40 yards crosswind and set up again. ';
      }
      c.interest = BR.clamp(c.interest, 0, 100); c.susp = BR.clamp(c.susp, 0, 100);
      const net = c.interest - c.susp;
      if (action !== 'move') {
        if (net > 20) {
          if (c.dist < 95 && r() < 0.3 && action !== 'rake' && action !== 'cow') msg += `Hangs up at ${Math.round(c.dist / 5) * 5} yards, looking for the call.`;
          else { c.dist = Math.max(18, c.dist - (18 + r() * 30)); msg += bull && r() < 0.35 + rut * 0.2 ? v.answer : v.close; c.steam = 1; }
        } else if (net < -10) { c.dist += 25 + r() * 30; msg += 'Quiet. It’s drifting away.'; }
        else msg += r() < 0.5 ? v.hold : 'Silence. Thinking about it.';
      }
      const sc = BR.scent(this.area, S.clock), sb = Math.atan2(sc.x, -sc.y) * 180 / Math.PI, offWind = Math.abs(angDiff(sb, c.rel));
      if (c.dist < 200 && c.interest > 25 && action !== 'move' && offWind > 30 && r() < 0.3) { const df = angDiff(c.rel, sb); c.rel += Math.sign(df) * Math.min(Math.abs(df) - 10, 15 + r() * 10); msg += ' Swinging downwind.'; }
      if (c.dist <= 60 && !c.angle) c.angle = r() < 0.45 ? 'quartering-to' : r() < 0.5 ? 'quartering-away' : 'broadside';
      if (c.dist <= 45 && calls.includes(action) && r() < 0.35) c.susp += 20;
      c.msg = msg;
      const downwind = c.dist < 170 && Math.abs(angDiff(sb, c.rel)) < 30;
      if (downwind && !c.windWarned) { c.windWarned = true; c.msg += ' Getting downwind of you.'; return this.after(); }
      if (downwind && r() < 0.6) return this.end({ kind: 'bust', cause: 'circled', yd: Math.round(c.dist), from: sc.from, thermal: sc.thermal, sun: this.area.sun });
      if (c.susp >= 80) return this.end({ kind: 'hangup', cause: 'overcall', yd: Math.round(c.dist) });
      if (c.dist > 340) return this.end({ kind: 'hangup', cause: c.pushed ? 'bugle' : 'interest', yd: Math.round(c.dist) });
      this.after();
    },
    after() { this.hud(); BR.draw(); BR.save(); },
    end(o) {
      const S = BR.S;
      if (o.kind === 'bust') { S.stats.busts++; BR.vibe(160); }
      BR.log(o.kind, Object.assign({ via: 'call' }, o));
      BR.go('outcome', o);
    },
    back() { BR.confirm('Leave this setup?', 'Head back to camp. This hunt is over.', 'Leave', () => this.act('leave')); }
  };
})();

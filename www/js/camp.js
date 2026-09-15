// Bugle Ridge — title, Hank's range offer, camp (water, morning / midday / evening), day flow. Screen 240×320.
(function () {
  const BR = window.BR, { P, W, H, R } = BR;

  function sky(g, part, look) {
    const snow = look === 'snow' || look === 'ak';
    if (part === 'morning') BR.bands(g, snow ? [[0, '#141a26'], [80, '#2a3040'], [128, '#4a4a5c'], [165, '#8a6a64']] : [[0, P.night], [80, P.dusk], [128, P.dawn], [165, P.glow]]);
    else if (part === 'midday') BR.bands(g, snow ? [[0, '#5a6674'], [93, '#7a8694'], [150, '#98a2ae']] : [[0, '#26344a'], [93, '#30425e'], [150, '#4a5d76']]);
    else if (part === 'evening') BR.bands(g, [[0, '#231f38'], [80, '#43304a'], [128, '#6e4446'], [160, P.glow]]);
    else BR.bands(g, [[0, '#060910'], [200, '#141a2a']]);
  }

  const artCache = {};
  function drawCamp(g, part, look) {
    const night = part === 'night', mid = part === 'midday', fire = !mid, fx = 165, snow = look === 'snow';
    sky(g, part, look);
    if (!mid) BR.stars(g, night ? 110 : 40, night ? 160 : 80, 7);
    if (part === 'morning' || part === 'evening') {
      const sky0 = part === 'morning' ? P.glow : '#b8694a', sun = part === 'morning' ? '#e39a5c' : '#dc7a4c';
      for (let Y = 128; Y < 181; Y++) for (let X = 107; X < W; X++) {
        const d = Math.hypot((X - 197) / 2.4, Y - 179) / 45;
        if (d >= 1) continue;
        const v = (1 - d) * 1.6, b = BR.BAYER[(Y & 3) * 4 + (X & 3)];
        if (b < v - 1) R(g, X, Y, 1, 1, sun); else if (b < v) R(g, X, Y, 1, 1, BR.mix(sky0, sun, 0.5));
      }
    }
    BR.ridge(g, 157, 16, 0.0165, 4.2, night ? '#121824' : mid ? '#4a5870' : BR.mix(P.far, P.dawn, 0.5));
    BR.ridge(g, 176, 13, 0.0225, 1.2, mid ? '#36435a' : night ? '#0f141e' : P.far);
    if (snow || look === 'ak') for (let X = 0; X < W; X++) { const y = BR.ry(X, 157, 16, 0.0165, 4.2); for (let j = 0; j < 8; j++) if (BR.BAYER[((y + j) & 3) * 4 + (X & 3)] < 1 - j / 8) R(g, X, y + j, 1, 1, night ? '#3a4050' : '#d8dee6'); }
    BR.ridge(g, 200, 9, 0.0375, 3.1, night ? '#0c1118' : P.mid);
    for (let X = 2; X < W; X += 7) BR.pine(g, X, BR.ry(X, 200, 9, 0.0375, 3.1) + 5, 11 + ((X * 7) % 8), night ? '#0a0f13' : P.tree);
    if (!night && look === 'sept') [[69, 213], [80, 217], [91, 212], [211, 215], [221, 219]].forEach(([x, y]) => BR.aspen(g, x, y, 5));
    for (let X = -2; X < W; X += 10) BR.pine(g, X, 235, 24 + ((X * 13) % 12), night ? '#0a0f13' : P.timber);
    BR.bands(g, [[232, night ? '#101610' : snow ? '#9aa4b0' : '#1a241b'], [H, night ? '#070908' : snow ? '#6a7480' : '#0c120d']]);
    BR.grass(g, 235, 750, 3, night ? ['#141b14', '#0c100c'] : snow ? ['#c8d0da', '#e8ecf0', '#8a949e'] : ['#26331f', '#1b271a', '#2f3d27']);
    if (fire) for (let Y = 221; Y < H; Y++) for (let X = 93; X < W; X++) {
      const d = Math.hypot(X - fx, (Y - 276) * 1.7) / 58;
      if (d < 1 && BR.BAYER[(Y & 3) * 4 + (X & 3)] > d) R(g, X, Y, 1, 1, d < 0.3 ? '#74482a' : d < 0.6 ? '#4a321f' : '#2b2117');
    }
    // tent
    for (let j = 0; j < 35; j++) {
      const w = Math.round(j * 0.8);
      R(g, 59 - w, 240 + j, w + 1, 1, j < 4 ? '#8a8466' : '#5e5944');
      R(g, 60, 240 + j, w, 1, fire ? BR.mix('#6c674f', '#c08a52', 0.3 + j / 100) : '#7a7560');
    }
    for (let j = 16; j < 35; j++) { const w = Math.round((j - 16) * 0.4); R(g, 59 - w, 240 + j, w * 2 + 1, 1, '#16150f'); }
    BR.line(g, 59, 240, 93, 275, '#3e3a2c'); BR.line(g, 59, 240, 25, 275, '#3e3a2c');
    R(g, 27, 275, 69, 1, '#0a0d0a');
    for (let a = 0; a < 360; a += 24) R(g, fx + Math.cos(a * Math.PI / 180) * 12, 281 + Math.sin(a * Math.PI / 180) * 4, 2, 1, fire ? '#6a5a4a' : '#4a4640');
    R(g, fx - 11, 280, 23, 3, '#4a3322'); R(g, fx - 11, 280, 23, 1, '#6a4a30'); R(g, fx - 7, 282, 15, 2, '#3a281a');
    if (mid) { R(g, fx - 4, 277, 9, 3, '#3a3530'); for (let i = 0; i < 18; i++) R(g, fx + Math.sin(i * 0.9) * 2, 273 - i * 2, 1, 1, i % 2 ? '#5b5f63' : '#7a7e82'); }
    if (!night) {
      R(g, 104, 261, 11, 15, '#4c4a36'); R(g, 112, 262, 3, 14, fire ? '#7a6644' : '#5e5b43'); R(g, 105, 260, 8, 1, '#5e5b43'); R(g, 106, 265, 6, 3, '#3a3828');
      R(g, 120, 248, 1, 29, '#3b2a1c'); R(g, 121, 247, 1, 3, '#3b2a1c'); R(g, 121, 275, 1, 3, '#3b2a1c'); BR.line(g, 122, 249, 122, 275, '#8a8272', 2);
    }
    if (mid) {
      R(g, 200, 253, 19, 19, '#8a7a4a'); R(g, 200, 253, 19, 3, '#a08e58'); R(g, 216, 253, 3, 19, '#6e613a');
      BR.ring(g, 209, 262, 5, P.blood, 10); R(g, 208, 261, 3, 3, P.blood); R(g, 201, 272, 1, 5, '#3b2a1c'); R(g, 216, 272, 1, 5, '#3b2a1c');
    }
  }
  BR.campArt = (g, part) => {
    const look = BR.S ? BR.ch().look : 'sept', key = part + look;
    if (!artCache[key]) {
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const o = c.getContext('2d'); o.imageSmoothingEnabled = false;
      drawCamp(o, part, look);
      artCache[key] = c;
    }
    g.drawImage(artCache[key], 0, 0);
    if (part !== 'midday') { BR.flame(g, 165, 266); BR.flame(g, 161, 268); }
  };
  BR.fireFolk = g => { // Hank on his log, the hunter across the fire
    BR.sprite(g, BR.MENTOR, BR.MCOL, 96, 222, 2, false);
    BR.sprite(g, BR.HUNT_SIT, BR.HSCOL, 190, 238, 2, true);
  };

  BR.endHunt = () => {
    const S = BR.S;
    S.enc = null;
    if (S.part === 'morning') { S.part = 'midday'; S.clock = Math.max(S.clock, 11.5); BR.go('camp'); }
    else { S.part = 'night'; S.clock = Math.max(S.clock, 20.5); BR.go('debrief'); }
  };

  // Offer the right range once per weapon type, the night before the first season that uses it.
  BR.needsRange = () => {
    const S = BR.S, rifle = BR.ch().weapon === 'rifle';
    return rifle ? !(S.rifleRange && S.rifleRange.done) && !S.rifleOffered : !(S.range && S.range.done) && !S.rangeOffered;
  };

  const started = S => S.events.length > 0 || S.day > 1 || S.chapter > 0 || S.year > 1 || !!S.camp;
  BR.scenes.title = {
    enter() { this.confirm = false; this.hud(); },
    draw(g) { BR.campArt(g, 'morning'); },
    hud() {
      const S = BR.S, ch = BR.ch(), upd = S.lastVersion && S.lastVersion !== BR.VERSION;
      BR.hud(`
        <div class="row"><span class="t hi" style="font-size:24px">BUGLE RIDGE</span><span class="dim sm">v${BR.VERSION}</span></div>
        <div class="tagline">${upd ? `<span class="ok">Updated to v${BR.VERSION}.</span> ` : ''}Spot-and-stalk elk and moose, Colorado to Alaska.</div>
        <div class="sp"></div>
        ${started(S) ? BR.btn('continue', 'Continue', 'go', null, false, `Year ${S.year} · ${ch.name}: ${ch.sub} · day ${S.day}/${S.days}`) : ''}
        ${BR.btn('new', this.confirm ? 'Tap again to wipe this hunter' : started(S) ? 'Start over with a new hunter' : 'Start hunting', started(S) ? '' : 'go')}
        ${BR.btn('ridge', 'Ridge mode: ' + (S.ridge ? 'ON' : 'off'), '', null, false, 'Dims this app so your face doesn’t glow on the hill')}`);
      S.lastVersion = BR.VERSION; BR.save();
    },
    act(a) {
      const S = BR.S;
      if (a === 'continue') BR.go(S.finished && !S.camp ? 'finale' : S.camp ? 'camp' : 'sam');
      else if (a === 'ridge') { BR.setRidge(!S.ridge); this.hud(); }
      else if (a === 'new') {
        if (started(S) && !this.confirm) { this.confirm = true; this.hud(); return; }
        const ridge = S.ridge;
        BR.newGame(); BR.S.ridge = ridge; BR.S.lastVersion = BR.VERSION; BR.startSeason(0);
      }
    }
  };

  BR.scenes.intro = {
    enter() { const S = BR.S; if (BR.ch().weapon === 'rifle') S.rifleOffered = true; else S.rangeOffered = true; this.hud(); },
    draw(g) { BR.campArt(g, 'night'); BR.fireFolk(g); },
    hud() {
      const rifle = BR.ch().weapon === 'rifle';
      BR.hud(`
        <div class="row"><span class="t hi">HANK</span><span class="dim">Camp · the night before</span></div>
        <div class="quote">${rifle
          ? '“That old ’06 is zeroed at two hundred. Know where it hits at three, four and five hundred before you point it at an elk. Or don’t, and find out the hard way.”'
          : '“Your granddad could put an arrow through a paper plate at forty. Let’s see what you’ve got. Fling some arrows at the range, or don’t, and find out on a bull.”'}</div>
        <div class="sp"></div>
        ${BR.btn('range', rifle ? 'Shoot the rifle range' : 'Shoot the practice range', 'go', null, false, rifle ? 'Learn your hash-mark holds' : 'Learn your pins and how long you can hold')}
        ${BR.btn('skip', 'Skip it and go hunting', '', null, false, 'Your call')}`);
    },
    act(a) { if (a === 'range') BR.go('range', { back: 'camp' }); else BR.go('camp'); },
    back() { BR.go('campsite'); }
  };

  BR.scenes.camp = {
    enter() {
      const S = BR.S;
      if (S.part === 'night') { BR.go('debrief'); return; }
      if (!S.camp) { BR.go('campsite'); return; }
      this.src = null;
      // same water as yesterday unless you change it: one decision, not seven
      const cp = BR.campData();
      if (S.part === 'morning' && !S.drank && S.water && cp.water.includes(S.water.src)) { if (!BR.drink(S.water.src, S.water.method)) return; }
      this.hud();
    },
    draw(g) { BR.campArt(g, BR.S.part); },
    back() { BR.go('title'); },
    hud() {
      const S = BR.S, ch = BR.ch(), c = BR.conditions(), part = S.part, cp = BR.campData();
      const head = `
        <div class="row"><span class="t">${part === 'midday' ? 'MIDDAY' : ch.name.toUpperCase()} · DAY ${S.day}/${S.days}</span><span class="hi">${BR.fmt(S.clock)}</span></div>
        <div class="row sm"><span><span class="hi">${c.rut}</span> · ${c.sky}</span><span class="dim">$${S.cash}</span></div>`;
      if (part === 'morning' && !S.drank) {
        if (!this.src) {
          BR.hud(head + `<div class="tagline">${cp.name}. You need water for the day.</div>
            <div class="list">${cp.water.map(w => BR.btn('src', BR.WATER[w].name, '', w)).join('')}</div>`);
        } else {
          const safe = this.src === 'jug';
          BR.hud(head + `<div class="tagline">${BR.WATER[this.src].name}. ${safe ? 'Straight from town.' : 'How do you treat it? You’ll do the same each day until you change it.'}</div>
            <div class="list">
              ${safe ? BR.btn('drink', 'Fill your bottles', 'go', 'none') : ''}
              ${!safe && S.items.filter ? BR.btn('drink', 'Filter it', '', 'filter', false, 'A few minutes') : ''}
              ${!safe ? BR.btn('drink', 'Tablets', '', 'tablets', false, '30 minutes before it’s safe') : ''}
              ${!safe ? BR.btn('drink', 'Boil it', '', 'boil', false, '20 minutes of stove time') : ''}
              ${!safe ? BR.btn('drink', 'Drink it straight', '', 'none', false, 'No time lost') : ''}
            </div>`);
        }
        return;
      }
      const water = S.water ? `<div class="row sm"><span class="dim">Water: ${BR.WATER[S.water.src].name.toLowerCase()}${S.water.src === 'jug' ? '' : ', ' + { none: 'untreated', filter: 'filtered', tablets: 'tablets', boil: 'boiled' }[S.water.method]}</span><button class="btn" style="width:auto;min-height:32px;padding:4px 10px" data-act="water">Change</button></div>` : '';
      if (part === 'midday') {
        const gear = ch.weapon === 'bow' ? `${BR.bow().name} · ${BR.bow().lb} lb` : BR.rifle().name;
        BR.hud(head + `
          <div class="tagline">Everything’s bedded. Good time to fix what went wrong this morning.</div>
          <div class="list">
            ${BR.btn('practice', ch.weapon === 'bow' ? 'Practice at the range' : 'Shoot the rifle range', '', null, false, ch.weapon === 'bow' ? `Shoot 6 arrows · draw strength ${S.strength}/3` : 'Check your holds before the evening hunt')}
            ${BR.btn('nap', 'Nap in the shade', '', null, false, 'Head out fresh for the evening hunt')}
            ${BR.btn('shop', 'Gear & shop', '', null, false, gear)}
          </div>${water}`);
        return;
      }
      const thermal = part === 'morning' ? 'Thermals downhill until the sun hits' : 'Thermals uphill until ~6:20 PM';
      const howl = c.howl && part === 'morning' ? `<div class="row sm"><span class="bad">Wolves howled toward the ${BR.area(c.howl).name.toLowerCase()} at first light.</span></div>` : '';
      const areas = ch.areas.map(a => BR.btn('area', a.name, '', a.id, false,
        `${(a.miles * cp.hike).toFixed(1)} mi · ${a.callOnly ? 'calling' : 'glassing'}${part === 'morning' ? ' · sun on slope ' + BR.fmt(a.sun) : ''}`)).join('');
      const glassArea = ch.areas.find(a => !a.callOnly);
      const job = ch.guide ? '' : part === 'morning'
        ? BR.btn('job', 'Scout for an outfitter', '', glassArea.id, false, '$60 per bull you find · uses the morning')
        : BR.btn('pack', 'Pack out a client’s animal', '', null, false, '$180 · uses the evening');
      BR.hud(head + `
        <div class="row sm"><span>Wind from <span class="ok">${c.from} ${c.mph} mph</span> · ${thermal.toLowerCase()}</span></div>${howl}
        <div class="list">${areas}${job}</div>${water}`);
    },
    act(a, arg) {
      const S = BR.S, cp = BR.campData();
      if (a === 'src') { this.src = arg; this.hud(); return; }
      if (a === 'drink') { S.water = { src: this.src, method: arg }; if (BR.drink(this.src, arg)) { this.src = null; this.hud(); } return; }
      if (a === 'water') { S.water = null; if (S.part === 'morning') S.drank = false; this.src = null; this.hud(); return; }
      if ((a === 'area' || a === 'job') && BR.bearTrap(arg)) { BR.save(); BR.go('dead', { cause: 'bear' }); return; }
      if (a === 'area') {
        const area = BR.area(arg), c = BR.conditions();
        BR.pass(area.miles * 25 * cp.hike);
        S.enc = { area: arg, spooked: Math.random() < cp.spook, howled: c.howl === arg && S.part === 'morning' };
        BR.go(area.callOnly ? 'call' : 'glass', { area: arg, blind: area.callOnly });
      } else if (a === 'job') {
        BR.pass(20);
        S.enc = { area: arg, job: true };
        BR.go('glass', { area: arg, job: true });
      } else if (a === 'pack') {
        S.cash += 180; S.stats.jobs++;
        BR.log('job', { kind: 'pack', pay: 180 });
        S.part = 'night'; S.clock = 21.5;
        BR.go('debrief');
      } else if (a === 'practice') BR.go('range', { back: 'camp', midday: true });
      else if (a === 'nap') { S.part = 'evening'; S.clock = 16; BR.go('camp'); }
      else if (a === 'shop') BR.go('shop', { back: 'camp' });
    }
  };
})();

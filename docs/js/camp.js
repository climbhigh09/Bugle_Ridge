// Bugle Ridge — title, Hank's range offer, camp (water, morning / midday / evening), day flow.
(function () {
  const BR = window.BR, { P, W, H, R } = BR;

  function sky(g, part, look) {
    const snow = look === 'snow' || look === 'ak';
    if (part === 'morning') BR.bands(g, snow ? [[0, '#141a26'], [60, '#2a3040'], [96, '#4a4a5c'], [124, '#8a6a64']] : [[0, P.night], [60, P.dusk], [96, P.dawn], [124, P.glow]]);
    else if (part === 'midday') BR.bands(g, snow ? [[0, '#5a6674'], [70, '#7a8694'], [112, '#98a2ae']] : [[0, '#26344a'], [70, '#30425e'], [112, '#4a5d76']]);
    else if (part === 'evening') BR.bands(g, [[0, '#231f38'], [60, '#43304a'], [96, '#6e4446'], [120, P.glow]]);
    else BR.bands(g, [[0, '#060910'], [150, '#141a2a']]);
  }

  const artCache = {};
  function drawCamp(g, part, look) {
    const night = part === 'night', mid = part === 'midday', fire = !mid, fx = 124, snow = look === 'snow';
    sky(g, part, look);
    if (!mid) BR.stars(g, night ? 70 : 26, night ? 120 : 60, 7);
    if (part === 'morning' || part === 'evening') {
      const sky0 = part === 'morning' ? P.glow : '#b8694a', sun = part === 'morning' ? '#e39a5c' : '#dc7a4c';
      for (let Y = 96; Y < 136; Y++) for (let X = 80; X < W; X++) {
        const d = Math.hypot((X - 148) / 2.4, Y - 134) / 34;
        if (d >= 1) continue;
        const v = (1 - d) * 1.6, b = BR.BAYER[(Y & 3) * 4 + (X & 3)];
        if (b < v - 1) R(g, X, Y, 1, 1, sun); else if (b < v) R(g, X, Y, 1, 1, BR.mix(sky0, sun, 0.5));
      }
    }
    BR.ridge(g, 118, 12, 0.022, 4.2, night ? '#121824' : mid ? '#4a5870' : BR.mix(P.far, P.dawn, 0.5));
    BR.ridge(g, 132, 10, 0.03, 1.2, mid ? '#36435a' : night ? '#0f141e' : P.far);
    if (snow || look === 'ak') for (let X = 0; X < W; X++) { const y = BR.ry(X, 118, 12, 0.022, 4.2); for (let j = 0; j < 6; j++) if (BR.BAYER[((y + j) & 3) * 4 + (X & 3)] < 1 - j / 6) R(g, X, y + j, 1, 1, night ? '#3a4050' : '#d8dee6'); }
    BR.ridge(g, 150, 7, 0.05, 3.1, night ? '#0c1118' : P.mid);
    for (let X = 2; X < W; X += 6) BR.pine(g, X, BR.ry(X, 150, 7, 0.05, 3.1) + 4, 8 + ((X * 7) % 6), night ? '#0a0f13' : P.tree);
    if (!night && look === 'sept') [[52, 160], [60, 163], [68, 159], [158, 161], [166, 164]].forEach(([x, y]) => BR.aspen(g, x, y, 4));
    for (let X = -2; X < W; X += 8) BR.pine(g, X, 176, 18 + ((X * 13) % 9), night ? '#0a0f13' : P.timber);
    BR.bands(g, [[174, night ? '#101610' : snow ? '#9aa4b0' : '#1a241b'], [H, night ? '#070908' : snow ? '#6a7480' : '#0c120d']]);
    BR.grass(g, 176, 420, 3, night ? ['#141b14', '#0c100c'] : snow ? ['#c8d0da', '#e8ecf0', '#8a949e'] : ['#26331f', '#1b271a', '#2f3d27']);
    if (fire) for (let Y = 166; Y < H; Y++) for (let X = 70; X < 178; X++) {
      const d = Math.hypot(X - fx, (Y - 207) * 1.7) / 44;
      if (d < 1 && BR.BAYER[(Y & 3) * 4 + (X & 3)] > d) R(g, X, Y, 1, 1, d < 0.3 ? '#74482a' : d < 0.6 ? '#4a321f' : '#2b2117');
    }
    for (let j = 0; j < 26; j++) {
      const w = Math.round(j * 0.8);
      R(g, 44 - w, 180 + j, w + 1, 1, j < 3 ? '#8a8466' : '#5e5944');
      R(g, 45, 180 + j, w, 1, fire ? BR.mix('#6c674f', '#c08a52', 0.3 + j / 80) : '#7a7560');
    }
    for (let j = 12; j < 26; j++) { const w = Math.round((j - 12) * 0.4); R(g, 44 - w, 180 + j, w * 2 + 1, 1, '#16150f'); }
    BR.line(g, 44, 180, 70, 206, '#3e3a2c'); BR.line(g, 44, 180, 18, 206, '#3e3a2c');
    R(g, 20, 206, 52, 1, '#0a0d0a');
    for (let a = 0; a < 360; a += 30) R(g, fx + Math.cos(a * Math.PI / 180) * 9, 211 + Math.sin(a * Math.PI / 180) * 3, 2, 1, fire ? '#6a5a4a' : '#4a4640');
    R(g, fx - 8, 210, 17, 2, '#4a3322'); R(g, fx - 8, 210, 17, 1, '#6a4a30'); R(g, fx - 5, 211, 11, 2, '#3a281a');
    if (mid) { R(g, fx - 3, 208, 7, 2, '#3a3530'); for (let i = 0; i < 14; i++) R(g, fx + Math.sin(i * 0.9) * 2, 205 - i * 2, 1, 1, i % 2 ? '#5b5f63' : '#7a7e82'); }
    if (!night) {
      R(g, 78, 196, 8, 11, '#4c4a36'); R(g, 84, 197, 2, 10, fire ? '#7a6644' : '#5e5b43'); R(g, 79, 195, 6, 1, '#5e5b43'); R(g, 80, 199, 4, 2, '#3a3828');
      R(g, 90, 186, 1, 22, '#3b2a1c'); R(g, 91, 185, 1, 2, '#3b2a1c'); R(g, 91, 206, 1, 2, '#3b2a1c'); BR.line(g, 92, 187, 92, 206, '#8a8272', 2);
    }
    if (mid) {
      R(g, 150, 190, 14, 14, '#8a7a4a'); R(g, 150, 190, 14, 2, '#a08e58'); R(g, 162, 190, 2, 14, '#6e613a');
      BR.ring(g, 157, 197, 4, P.blood, 10); R(g, 156, 196, 2, 2, P.blood); R(g, 151, 204, 1, 4, '#3b2a1c'); R(g, 162, 204, 1, 4, '#3b2a1c');
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
    if (part !== 'midday') BR.flame(g, 124, 199);
  };

  // End the current hunt (morning → midday, evening → night debrief).
  BR.endHunt = () => {
    const S = BR.S;
    S.enc = null;
    if (S.part === 'morning') { S.part = 'midday'; S.clock = Math.max(S.clock, 11.5); BR.go('camp'); }
    else { S.part = 'night'; S.clock = Math.max(S.clock, 20.5); BR.go('debrief'); }
  };

  BR.scenes.title = {
    enter() { this.confirm = false; this.hud(); },
    draw(g) { BR.campArt(g, 'morning'); },
    hud() {
      const S = BR.S, started = S.events.length > 0 || S.day > 1 || S.chapter > 0 || S.year > 1 || !!S.camp;
      const ch = BR.ch();
      BR.hud(`
        <div class="row"><span class="t hi" style="font-size:24px">BUGLE RIDGE</span><span class="dim sm">v${BR.VERSION}</span></div>
        <div class="tagline">Spot-and-stalk elk and moose, Colorado to Alaska.</div>
        <div class="sp"></div>
        ${started ? BR.btn('continue', 'Continue', 'go', null, false, `Year ${S.year} · ${ch.name}: ${ch.sub} · day ${S.day}/${S.days}`) : ''}
        ${BR.btn('new', this.confirm ? 'Tap again to wipe this hunter' : started ? 'Start over with a new hunter' : 'Start hunting', started ? '' : 'go')}
        ${BR.btn('ridge', 'Ridge mode: ' + (S.ridge ? 'ON' : 'off'), '', null, false, 'Dims this app so your face doesn’t glow on the hill')}`);
    },
    act(a) {
      const S = BR.S, started = S.events.length > 0 || S.day > 1 || S.chapter > 0 || S.year > 1 || !!S.camp;
      if (a === 'continue') BR.go(S.finished && !S.camp ? 'finale' : S.camp ? 'camp' : 'sam');
      else if (a === 'ridge') { BR.setRidge(!S.ridge); this.hud(); }
      else if (a === 'new') {
        if (started && !this.confirm) { this.confirm = true; this.hud(); return; }
        const ridge = S.ridge;
        BR.newGame(); BR.S.ridge = ridge; BR.startSeason(0);
      }
    }
  };

  BR.scenes.intro = {
    enter() { this.hud(); },
    draw(g) { BR.campArt(g, 'night'); BR.sprite(g, BR.MENTOR, BR.MCOL, 70, 162, 2, false); },
    hud() {
      BR.hud(`
        <div class="row"><span class="t hi">HANK</span><span class="dim">Camp · the night before</span></div>
        <div class="quote">“Your granddad could put an arrow through a paper plate at forty. Let’s see what you’ve got. Fling some arrows at the range, or don’t, and find out on a bull.”</div>
        <div class="sp"></div>
        ${BR.btn('range', 'Shoot the practice range', 'go', null, false, 'Learn your pins and how long you can hold')}
        ${BR.btn('skip', 'Skip it and go hunting', '', null, false, 'Your call')}`);
    },
    act(a) { if (a === 'range') BR.go('range', { back: 'camp' }); else BR.go('camp'); },
    back() { BR.go('campsite'); }
  };

  BR.scenes.camp = {
    enter() {
      if (BR.S.part === 'night') { BR.go('debrief'); return; }
      if (!BR.S.camp) { BR.go('campsite'); return; }
      this.src = null;
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
          BR.hud(head + `<div class="tagline">${BR.WATER[this.src].name}. ${safe ? 'Straight from town.' : 'How do you treat it?'}</div>
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
      if (part === 'midday') {
        const bowCh = ch.weapon === 'bow', gear = bowCh ? `${BR.bow().name} · ${BR.bow().lb} lb` : BR.rifle().name;
        BR.hud(head + `
          <div class="tagline">Everything’s bedded. Good time to fix what went wrong this morning.</div>
          <div class="list">
            ${bowCh ? BR.btn('practice', 'Practice at the range', '', null, false, `Shoot 6 arrows · draw strength ${S.strength}/3`) : ''}
            ${BR.btn('nap', 'Nap in the shade', '', null, false, 'Head out fresh for the evening hunt')}
            ${BR.btn('shop', 'Gear & shop', '', null, false, gear)}
          </div>`);
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
        <div class="row sm"><span>Wind from <span class="ok">${c.from} ${c.mph} mph</span></span></div>
        <div class="tagline">${thermal}.</div>${howl}
        <div class="list">${areas}${job}</div>`);
    },
    act(a, arg) {
      const S = BR.S, ch = BR.ch(), cp = BR.campData();
      if (a === 'src') { this.src = arg; this.hud(); return; }
      if (a === 'drink') { if (BR.drink(this.src, arg)) { this.src = null; this.hud(); } return; }
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

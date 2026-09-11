// Bugle Ridge — title, camp (morning / midday / evening), day flow.
(function () {
  const BR = window.BR, { P, W, H, R } = BR;

  function sky(g, part) {
    if (part === 'morning') BR.bands(g, [[0, P.night], [60, P.dusk], [96, P.dawn], [124, P.glow]]);
    else if (part === 'midday') BR.bands(g, [[0, '#26344a'], [70, '#30425e'], [112, '#4a5d76']]);
    else if (part === 'evening') BR.bands(g, [[0, '#231f38'], [60, '#43304a'], [96, '#6e4446'], [120, P.glow]]);
    else BR.bands(g, [[0, '#060910'], [150, '#141a2a']]);
  }

  // Camp art is drawn once per time of day and cached; only the flame is redrawn.
  const artCache = {};
  function drawCamp(g, part) {
    const night = part === 'night', mid = part === 'midday', fire = !mid, fx = 124;
    sky(g, part);
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
    BR.ridge(g, 150, 7, 0.05, 3.1, night ? '#0c1118' : P.mid);
    for (let X = 2; X < W; X += 6) BR.pine(g, X, BR.ry(X, 150, 7, 0.05, 3.1) + 4, 8 + ((X * 7) % 6), night ? '#0a0f13' : P.tree);
    if (!night) [[52, 160], [60, 163], [68, 159], [158, 161], [166, 164]].forEach(([x, y]) => BR.aspen(g, x, y, 4));
    for (let X = -2; X < W; X += 8) BR.pine(g, X, 176, 18 + ((X * 13) % 9), night ? '#0a0f13' : P.timber);
    BR.bands(g, [[174, night ? '#101610' : '#1a241b'], [H, night ? '#070908' : '#0c120d']]);
    BR.grass(g, 176, 420, 3, night ? ['#141b14', '#0c100c'] : ['#26331f', '#1b271a', '#2f3d27']);
    if (fire) for (let Y = 166; Y < H; Y++) for (let X = 70; X < 178; X++) {
      const d = Math.hypot(X - fx, (Y - 207) * 1.7) / 44;
      if (d < 1 && BR.BAYER[(Y & 3) * 4 + (X & 3)] > d) R(g, X, Y, 1, 1, d < 0.3 ? '#74482a' : d < 0.6 ? '#4a321f' : '#2b2117');
    }
    // tent: shaded left face, firelit right face, guy lines
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
    if (!artCache[part]) {
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const o = c.getContext('2d'); o.imageSmoothingEnabled = false;
      drawCamp(o, part);
      artCache[part] = c;
    }
    g.drawImage(artCache[part], 0, 0);
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
      const S = BR.S, started = S.events.length > 0 || S.day > 1 || S.part !== 'morning';
      BR.hud(`
        <div class="row"><span class="t hi" style="font-size:24px">BUGLE RIDGE</span><span class="dim sm">v${BR.VERSION}</span></div>
        <div class="tagline">Colorado · over-the-counter archery · seven days in the September rut.</div>
        <div class="sp"></div>
        ${started && !S.over ? BR.btn('continue', 'Continue', 'go', null, false, `Day ${S.day}/${S.days} · $${S.cash}`) : ''}
        ${BR.btn('new', this.confirm ? 'Tap again to wipe this season' : started ? 'Start a new season' : 'Start the season', started && !S.over ? '' : 'go')}
        ${BR.btn('ridge', 'Ridge mode: ' + (S.ridge ? 'ON' : 'off'), '', null, false, 'Dims this app so your face doesn’t glow on the hill')}`);
    },
    act(a) {
      const S = BR.S;
      if (a === 'continue') BR.go('camp');
      else if (a === 'ridge') { BR.setRidge(!S.ridge); this.hud(); }
      else if (a === 'new') {
        const started = S.events.length > 0 || S.day > 1 || S.part !== 'morning';
        if (started && !S.over && !this.confirm) { this.confirm = true; this.hud(); return; }
        const ridge = S.ridge;
        BR.newGame(); BR.S.ridge = ridge; BR.go('intro');
      }
    }
  };

  // Night before the opener: Hank offers the range. Skipping is allowed, and it's its own penalty.
  BR.scenes.intro = {
    enter() { this.hud(); },
    draw(g) { BR.campArt(g, 'night'); BR.sprite(g, BR.MENTOR, BR.MCOL, 70, 162, 2, false); },
    hud() {
      BR.hud(`
        <div class="row"><span class="t hi">HANK</span><span class="dim">Camp · the night before</span></div>
        <div class="quote">“Before you go chasing bulls, fling some arrows at the range. You ought to know which pin is which yardage. Or don’t, and find out on a bull.”</div>
        <div class="sp"></div>
        ${BR.btn('range', 'Shoot the practice range', 'go', null, false, 'Learn your pins and how long you can hold')}
        ${BR.btn('skip', 'Skip it and go hunting', '', null, false, 'Your call')}`);
    },
    act(a) { if (a === 'range') BR.go('range', { back: 'camp' }); else BR.go('camp'); },
    back() { BR.go('title'); }
  };

  BR.scenes.camp = {
    enter() {
      if (BR.S.part === 'night') { BR.go('debrief'); return; }
      this.hud();
    },
    draw(g) { BR.campArt(g, BR.S.part); },
    back() { BR.go('title'); return true; },
    hud() {
      const S = BR.S, c = BR.conditions(), part = S.part;
      const head = `
        <div class="row"><span class="t">${part === 'midday' ? 'MIDDAY' : 'COLORADO'} · DAY ${S.day}/${S.days}</span><span class="hi">${BR.fmt(S.clock)}</span></div>
        <div class="row sm"><span>Rut: <span class="hi">${c.rut}</span> · ${c.sky}</span><span class="dim">$${S.cash}</span></div>`;
      if (part === 'midday') {
        const bow = BR.bow();
        BR.hud(head + `
          <div class="tagline">Elk are bedded in the timber. Good time to fix what went wrong this morning.</div>
          <div class="list">
            ${BR.btn('practice', 'Practice at the range', '', null, false, `Shoot 6 arrows · draw strength ${S.strength}/3`)}
            ${BR.btn('nap', 'Nap in the shade', '', null, false, 'Head out fresh for the evening hunt')}
            ${BR.btn('shop', 'Gear & shop', '', null, false, `${bow.name} · ${bow.lb} lb · ${BR.ke(bow)} ft·lb`)}
          </div>`);
        return;
      }
      const thermal = part === 'morning' ? 'Thermals downhill until the sun hits' : 'Thermals uphill until ~6:20 PM';
      const areas = Object.values(BR.AREAS).map(a => BR.btn('area', a.name, '', a.id, false,
        `${a.miles} mi · ${a.callOnly ? 'calling' : 'glassing'}${part === 'morning' ? ' · sun on slope ' + BR.fmt(a.sun) : ''}`)).join('');
      const job = part === 'morning'
        ? BR.btn('job', 'Scout for Dell’s outfit', '', null, false, '$60 per bull you find · uses the morning')
        : BR.btn('pack', 'Help pack out a client’s bull', '', null, false, '$180 · uses the evening');
      BR.hud(head + `
        <div class="row sm"><span>Wind from <span class="ok">${c.from} ${c.mph} mph</span></span></div>
        <div class="tagline">${thermal}.</div>
        <div class="list">${areas}${job}${BR.btn('menu', 'Menu', '')}</div>`);
    },
    act(a, arg) {
      const S = BR.S;
      if (a === 'area') {
        const area = BR.AREAS[arg];
        BR.pass(area.miles * 25);
        S.enc = { area: arg };
        BR.go(area.callOnly ? 'call' : 'glass', { area: arg, blind: area.callOnly });
      } else if (a === 'job') {
        BR.pass(20);
        S.enc = { area: 'bench', job: true };
        BR.go('glass', { area: 'bench', job: true });
      } else if (a === 'pack') {
        S.cash += 180; S.stats.jobs++;
        BR.log('job', { kind: 'pack', pay: 180 });
        S.part = 'night'; S.clock = 21.5;
        BR.go('debrief');
      } else if (a === 'practice') {
        BR.go('range', { back: 'camp', midday: true });
      } else if (a === 'nap') {
        S.part = 'evening'; S.clock = 16;
        BR.go('camp');
      } else if (a === 'shop') BR.go('shop', { back: 'camp' });
      else if (a === 'menu') BR.go('title');
    }
  };
})();

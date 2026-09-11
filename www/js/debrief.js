// Bugle Ridge — hunt outcomes, Hank's campfire debrief (picks the one lesson that matters), the shop, and season end.
(function () {
  const BR = window.BR, { P, W, H, R } = BR;

  const OUT = {
    bust: o => ({
      scent: ['BUSTED · SCENT', 'The lead cow barked and the whole bunch crashed into the timber. She never looked your way.'],
      movement: ['BUSTED · SEEN', `She pinned you at ${o.yd} yards. One bark and they were gone.`],
      noise: ['BUSTED · NOISE', `That last crunch on the ${o.terrain || 'slope'} was one too many.`],
      circled: ['BUSTED · WINDED', `He swung downwind at ${o.yd} yards, caught your scent, and crashed off.`],
      drew: ['BUSTED · CAUGHT DRAWING', 'He saw your bow come up and was gone in two jumps.']
    }[o.cause]),
    gone: () => ['THEY BEDDED', 'They fed into the dark timber before you got there.'],
    dark: () => ['OUT OF LIGHT', 'Legal light’s gone. You pick your way back by headlamp.'],
    hangup: o => ({
      overcall: ['HE WENT QUIET', 'Too much calling. He hung up and slipped away.'],
      bugle: ['HE HERDED HIS COWS OFF', 'Your bugle told him to gather his cows and leave. He did.'],
      interest: ['HE LOST INTEREST', 'His bugles got farther off, then stopped.']
    }[o.cause]),
    miss: o => [`CLEAN MISS · ${o.high ? 'HIGH' : 'LOW'}`, `The arrow sailed ${o.high ? 'over' : 'under'} his back at ${o.range} yards. He ran 50 yards and stared back.`],
    walked: () => ['HE WALKED', 'He stepped into the timber before you got a shot off.'],
    passed: o => o.good ? ['YOU LET HIM WALK', 'No ethical shot. Hank would approve.'] : ['YOU LET HIM WALK', 'He was right there. Could have been the one.'],
    lost: () => ['LOST HIM', 'You searched until dark and never found him. That one will sit with you.']
  };

  BR.scenes.outcome = {
    enter(o) {
      this.o = o;
      const f = OUT[o.kind] ? OUT[o.kind](o) : ['HUNT OVER', ''];
      this.title = f[0]; this.text = f[1];
      this.hud();
    },
    draw(g) {
      const o = this.o;
      BR.bands(g, BR.S.part === 'evening' ? [[0, '#231f38'], [50, '#43304a'], [80, P.glow]] : [[0, P.dusk], [40, P.dawn], [70, P.glow]]);
      BR.ridge(g, 96, 8, 0.03, 2.2, P.far2);
      for (let X = 0; X < W + 4; X += 5) BR.pine(g, X, 150, 26 + ((X * 11) % 14), P.timber, P.tree);
      BR.bands(g, [[148, '#56673f'], [H, '#34422c']]);
      BR.grass(g, 149, 900, 5, [P.meadow2, P.meadowD, P.meadow3]);
      if (o.kind === 'bust' || o.kind === 'miss' || o.kind === 'hangup') {
        for (let i = 0; i < 4; i++) BR.sprite(g, BR.ELK, BR.ECOL, 30 + i * 30, 132 - (i % 2) * 6, 1, true, i ? 'aA' : '');
        for (let i = 0; i < 20; i++) R(g, 40 + Math.random() * 110, 146 + Math.random() * 6, 2, 1, '#6a5a44');
      }
      BR.sprite(g, BR.HUNT, BR.HCOL, 20, 200, 3, false);
    },
    hud() {
      const S = BR.S;
      BR.hud(`
        <div class="row"><span class="t ${this.o.kind === 'passed' ? 'ok' : 'bad'}">${this.title}</span><span class="hi">${BR.fmt(S.clock)}</span></div>
        <div class="quote">${this.text}</div>
        <div class="tagline">Hank will want to hear about it tonight.</div>
        <div class="sp"></div>
        ${BR.btn('back', S.part === 'morning' ? 'Head back for midday' : 'Head back to camp', 'go')}`);
    },
    act() { BR.endHunt(); },
    back() { BR.endHunt(); return true; }
  };

  // ---- Hank's lesson picker: most important thing that happened today ----
  function lesson(S) {
    const ev = S.events.filter(x => x.day === S.day), bow = BR.bow(), has = S.items;
    const find = t => ev.filter(x => x.type === t).pop();
    let x;
    if ((x = find('lost'))) {
      if (x.zone === 'shoulder' && x.ke < 65) return { q: `His shoulder blade stopped that ${x.gr}-grain arrow. At ${x.ke} foot-pounds you had no margin for a bad angle.`, skill: 'Wait for the near front leg to step forward, or pass on quartering-to shots.', gear: bow.id === 'scout' ? 'talon' : 'fixedBlades' };
      if (x.zone === 'shoulder' && !x.blades) return { q: 'Mechanicals open up on bone and quit. You had the energy; your broadhead didn’t.', skill: 'Aim a hand’s width behind the crease, not on the shoulder.', gear: 'fixedBlades' };
      if (x.pushed && x.zone === 'liver') return { q: 'Dark blood, no bubbles: that’s liver. You jumped him out of his bed and he never stopped.', skill: 'Give a liver hit four hours before you take a step.', gear: null };
      if (x.pushed && x.zone === 'paunch') return { q: 'Green on the arrow means gut. You back out and come back at first light. Every time.', skill: 'Read the arrow before you pick the wait.', gear: null };
      if (Math.abs(x.pinUsed - x.range) >= 8) return { q: `He was ${x.range} yards and you held your ${x.pinUsed} pin. That’s a hit in the wrong place instead of the lungs.`, skill: 'Range everything before you draw.', gear: has.rangefinder ? null : 'rangefinder' };
      if (x.fatigue > 0.8) return { q: 'You held until your pin was swimming, then punched it.', skill: 'Draw later. When his head goes behind a tree, then draw.', gear: null, practice: true };
      return { q: `You hit him in the ${x.zone}. No blood trail is worth that feeling.`, skill: 'Only shoot broadside or quartering away, inside your longest pin.', gear: null };
    }
    if ((x = find('kill'))) return { q: `That’s how it’s done. ${x.range} yards, ${x.zone === 'vitals' ? 'both lungs' : x.zone}. Now the real work starts.`, skill: 'Get the quarters hung in the shade and cooling tonight.', gear: null, good: true };
    if ((x = find('miss'))) {
      const diff = x.range - x.pinUsed;
      if (bow.id === 'scout' && x.range > 42) return { q: `${x.range} yards with a sight that stops at 40. You were guessing.`, skill: 'Close the distance or pass. Gap-shooting elk is how you wound them.', gear: 'talon' };
      if (Math.abs(diff) >= 6) return { q: `He was ${x.range} yards. You held for ${x.pinUsed}. That’s about ${Math.round(Math.abs(diff) * 0.9)} inches ${diff > 0 ? 'low' : 'high'} at that distance.`, skill: 'Range everything first. Distances in the timber and across parks fool everybody.', gear: has.rangefinder ? null : 'rangefinder' };
      return { q: 'You held too long and the pin wandered off him right as you touched it.', skill: 'Practice at midday. More strength means a longer, steadier hold.', gear: null, practice: true };
    }
    if ((x = find('bust'))) {
      if (x.cause === 'scent' && x.thermal === 'up') return { q: `She never saw you. She smelled you. The sun hit that slope at ${BR.fmt(x.sun)} and your wind went uphill.`, skill: 'Get above them, or be set up before the sun hits the slope.', gear: has.windChecker ? null : 'windChecker' };
      if (x.cause === 'scent' && x.thermal === 'down') return { q: 'Air sinks when the slope’s in shade. Your scent slid right down onto them.', skill: 'When the air is sinking, come in from below or from the side.', gear: has.windChecker ? null : 'windChecker' };
      if (x.cause === 'scent') return { q: `Wind was out of the ${x.from} and you walked right up it with your scent ahead of you.`, skill: 'Swing wide and come in with the wind in your face.', gear: has.windChecker ? null : 'windChecker' };
      if (x.cause === 'circled') return { q: 'He did what bulls do: swung downwind to check that cow before he committed. Your scent was sitting right there.', skill: 'Set up with his downwind side open or blocked, or slip crosswind when he starts circling.', gear: has.windChecker ? null : 'windChecker' };
      if (x.cause === 'drew') return { q: `He was ${x.angle === 'facing' ? 'looking right at you' : 'quartered your way'} when you drew. Elk see a bow come up.`, skill: 'Draw when his eyes are behind a tree or he’s looking past you.', gear: null };
      if (x.cause === 'noise') return { q: 'Deadfall and shale carry a long way. You crunched your way in.', skill: 'Route around the noisy ground even when it’s longer.', gear: null };
      return { q: 'You moved while her head was up. The lead cow is the one hunting you out there.', skill: 'Watch her, not the bull. Move only when her head’s down.', gear: null };
    }
    if ((x = find('hangup'))) {
      if (x.cause === 'overcall') return { q: 'You called like a whole herd was in heat. A real cow mews, then goes quiet and feeds.', skill: 'Call, then wait. Let him come looking.', gear: has.reeds ? null : 'reeds' };
      if (x.cause === 'bugle') return { q: 'You bugled at a herd bull inside 120 yards. He did what herd bulls do: gathered his cows and left.', skill: 'Up close on a herd bull, cow calls pull and bugles push.', gear: null };
      return { q: 'He lost interest. Calls with nothing to back them up get old.', skill: 'Rake a tree and cow call softly. Sound like elk doing elk things.', gear: has.reeds ? null : 'reeds' };
    }
    if ((x = find('walked'))) return { q: 'He gave you a window and it closed. That’s elk hunting.', skill: 'Be drawn before he steps into the opening.', gear: null };
    if ((x = find('gone'))) return { q: 'You were too slow. Once the sun’s up they walk to bed, and they don’t wait for you.', skill: 'Plan a shorter route and move fast while they’re still feeding.', gear: null };
    if ((x = find('passed'))) return { q: x.good ? 'You let him walk rather than take a bad shot. That’s the hardest shot there is, and the right one.' : 'You let a good one walk. Trust your practice.', skill: x.good ? 'Keep doing exactly that.' : 'Broadside inside your pins is the shot you came for.', gear: null, good: x.good };
    if ((x = find('noelk'))) return { q: 'Empty basin. It happens more than anybody admits.', skill: 'If the parks are empty at first light, get in the timber and call.', gear: null };
    if ((x = find('job'))) return { q: `Good money today, $${x.pay}. Now go find your own.`, skill: 'Spend it where it fixes a real problem.', gear: S.suggest };
    if ((x = find('practice'))) return { q: 'Arms getting stronger. I can see it in your hold.', skill: 'Heavier bows and longer holds come from reps.', gear: null };
    return { q: 'Quiet day. Rest up.', skill: 'First light tomorrow.', gear: null };
  }

  BR.scenes.debrief = {
    enter() {
      const S = BR.S;
      if (S.lessonDay !== S.day) { S.lesson = lesson(S); S.lessonDay = S.day; if (S.lesson.gear) S.suggest = S.lesson.gear; }
      this.hud();
    },
    draw(g) {
      BR.campArt(g, 'night');
      BR.sprite(g, BR.MENTOR, BR.MCOL, 70, 162, 2, false);
      BR.sprite(g, BR.HUNT_SIT, BR.HSCOL, 138, 176, 2, true);
      if (BR.S.tag) { // the rack, leaned against the tent
        [[22, 190], [26, 186], [30, 184], [34, 187]].forEach(([x, y]) => BR.line(g, 28, 206, x, y, P.antler));
        [[40, 190], [44, 186], [48, 184], [52, 187]].forEach(([x, y]) => BR.line(g, 46, 206, x, y, P.antler));
      }
    },
    gearInfo(id) {
      if (!id) return null;
      if (BR.BOWS[id]) return { name: BR.BOWS[id].name + ` · ${BR.BOWS[id].lb} lb`, price: BR.BOWS[id].price, owned: BR.S.bow === id };
      return { name: BR.ITEMS[id].name, price: BR.ITEMS[id].price, owned: !!BR.S.items[id] };
    },
    hud() {
      const S = BR.S, L = S.lesson, gi = this.gearInfo(L.gear);
      const last = S.tag || S.day >= S.days;
      BR.hud(`
        <div class="row"><span class="t hi">HANK</span><span class="dim">Camp · night ${S.day} · $${S.cash}</span></div>
        <div class="list">
          <div class="quote">“${L.q}”</div>
          <div class="row sm"><span class="dim">SKILL</span><span style="text-align:right">${L.skill}</span></div>
          ${gi && !gi.owned ? BR.btn('buy', `${gi.name} · $${gi.price}`, 'go', L.gear, S.cash < gi.price, S.cash < gi.price ? `Need $${gi.price - S.cash} more. Dell pays for scouting.` : 'Hank’s pick') : ''}
        </div>
        <div class="g2">${BR.btn('shop', 'Gear & shop')}${BR.btn('sleep', last ? 'Wrap up season' : `Sleep · Day ${S.day + 1}`, 'go')}</div>`);
    },
    act(a, arg) {
      const S = BR.S;
      if (a === 'shop') BR.go('shop', { back: 'debrief' });
      else if (a === 'buy') { BR.buy(arg); this.hud(); }
      else if (a === 'sleep') {
        if (S.tag || S.day >= S.days) { S.over = true; BR.go('season'); return; }
        S.day++; S.part = 'morning'; S.clock = 5.5; S.enc = null;
        BR.go('camp');
      }
    }
  };

  BR.buy = id => {
    const S = BR.S;
    if (BR.BOWS[id]) { const b = BR.BOWS[id]; if (S.cash < b.price || S.strength < b.strength || S.bow === id) return false; S.cash -= b.price; S.bow = id; }
    else { const it = BR.ITEMS[id]; if (!it || S.items[id] || S.cash < it.price) return false; S.cash -= it.price; S.items[id] = true; }
    if (S.suggest === id) S.suggest = null;
    BR.vibe(20); BR.save();
    return true;
  };

  BR.scenes.shop = {
    enter(a) { this.back_ = (a && a.back) || 'camp'; this.hud(); },
    draw(g) { BR.campArt(g, BR.S.part === 'night' ? 'night' : BR.S.part); R(g, 0, 0, W, H, 'rgba(7,8,11,.35)'); },
    hud() {
      const S = BR.S, rows = [];
      Object.values(BR.BOWS).forEach(b => {
        if (S.bow === b.id) { rows.push(BR.btn('none', `${b.name} · in hand`, '', null, true, `${b.lb} lb · ${b.gr} gr · ${BR.ke(b)} ft·lb · pins ${b.pins.join('/')}`)); return; }
        const weak = S.strength < b.strength;
        rows.push(BR.btn('buy', `${b.name} · $${b.price}`, S.suggest === b.id ? 'go' : '', b.id, weak || S.cash < b.price,
          weak ? `Needs draw strength ${b.strength}. Practice at midday.` : `${b.lb} lb · ${b.gr} gr · ${BR.ke(b)} ft·lb · pins to ${Math.max(...b.pins)}`));
      });
      Object.entries(BR.ITEMS).forEach(([id, it]) => {
        rows.push(BR.btn('buy', S.items[id] ? `${it.name} · owned` : `${it.name} · $${it.price}`, S.suggest === id && !S.items[id] ? 'go' : '', id, S.items[id] || S.cash < it.price, it.blurb));
      });
      BR.hud(`
        <div class="row"><span class="t">GEAR &amp; SHOP</span><span class="hi">$${S.cash}</span></div>
        <div class="list">${rows.join('')}</div>
        ${BR.btn('back', 'Done')}`);
    },
    act(a, arg) {
      if (a === 'buy') { BR.buy(arg); this.hud(); }
      else if (a === 'back') BR.go(this.back_);
    },
    back() { BR.go(this.back_); return true; }
  };

  BR.scenes.season = {
    enter() { this.hud(); },
    back() { BR.go('title'); },
    draw(g) { BR.campArt(g, 'night'); if (BR.S.tag) BR.sprite(g, BR.ELK, BR.ECOL, 20, 200, 2, false, 'lk'); },
    hud() {
      const S = BR.S, t = S.tag, st = S.stats;
      BR.hud(`
        <div class="row"><span class="t ${t ? 'ok' : 'hi'}">${t ? (t.bull ? 'TAG FILLED · BULL' : 'TAG FILLED · COW') : 'TAG SOUP'}</span><span class="dim">Colorado archery</span></div>
        <div class="quote">${t ? `Day ${t.day}, ${t.range} yards in the ${BR.AREAS[t.area].name.toLowerCase()}.` : 'Seven days, no elk in the truck. Every elk hunter knows the feeling.'}</div>
        <div class="row sm"><span class="dim">Busts ${st.busts} · shots ${st.shots} · wounded ${st.wounds} · bulls glassed ${st.bullsSpotted}</span></div>
        <div class="sp"></div>
        ${BR.btn('again', 'Hunt another archery season', 'go', null, false, 'Keep your gear, cash, and strength')}
        ${BR.btn('title', 'Title screen')}`);
    },
    act(a) {
      const S = BR.S;
      if (a === 'again') {
        Object.assign(S, { day: 1, part: 'morning', clock: 5.5, tag: null, events: [], enc: null, over: false, lesson: null, lessonDay: 0, seed: (Date.now() % 1000003) | 0 });
        BR.go('camp');
      } else BR.go('title');
    }
  };
})();

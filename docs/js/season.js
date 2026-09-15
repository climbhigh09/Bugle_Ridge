// Bugle Ridge — the season around the hunt: Sam's call, campsite, water, meat care, lost days, death, season end, finale.
(function () {
  const BR = window.BR, { P, W, H, R } = BR;

  BR.startSeason = idx => {
    const S = BR.S, ch = BR.CHAPTERS[idx];
    Object.assign(S, {
      chapter: idx, day: 1, days: 7, clock: 5.5, part: 'morning', tag: null, events: [], enc: null, over: false, verdict: null,
      camp: null, drank: false, skipDays: 0, lesson: null, lessonDay: 0, seed: (Date.now() % 1000003) | 0,
      tags: { wolf: false, grizzly: false, grizApplied: false }, sprayed: {}
    });
    if (ch.weapon === 'rifle' && !S.rifle) S.rifle = '3006';
    BR.go('sam');
  };

  // a lost day is spent at the start of the next morning
  BR.skipDay = reason => { BR.S.skipDays = (BR.S.skipDays || 0) + 1; BR.log('lostday', { reason }); };

  // Pack-outs: a day per 5 miles from the truck for elk, twice that for moose and grizzly, a day for anything else.
  BR.packDays = (sp, areaId) => {
    const a = BR.area(areaId), per = Math.max(1, Math.ceil((a ? a.miles : 1) * 1.5 / 5));
    return sp === 'elk' ? per : sp === 'moose' || sp === 'griz' ? per * 2 : 1;
  };

  // Grizzly false charge. Spray turns the bear for the day; once it wears off it draws bears, so going back there is fatal.
  BR.bearCharge = area => {
    const S = BR.S;
    S.sprayed = S.sprayed || {};
    if (S.sprayed[area] === S.day) return 'gone';
    BR.vibe(300);
    if (S.items.bearSpray) { delete S.items.bearSpray; S.sprayed[area] = S.day; BR.log('sprayed', { area }); return 'sprayed'; }
    BR.skipDay('grizzly');
    return 'charged';
  };
  BR.bearTrap = area => { const d = BR.S.sprayed && BR.S.sprayed[area]; return d != null && BR.S.day > d; };

  BR.drink = (src, method) => {
    const S = BR.S, ch = BR.ch(), w = BR.WATER[src] || BR.WATER.creek;
    if (method === 'tablets') BR.pass(30); else if (method === 'boil') BR.pass(20); else if (method === 'filter') BR.pass(3);
    S.drank = true;
    let risk = method === 'none' ? w.risk : 0;
    if (ch.dysentery) risk += 1 / 200; // it finds everyone now and then
    BR.log('water', { src, method });
    if (Math.random() < risk) { BR.log('dysentery', { src, method }); BR.go('dead', { src, method }); return false; }
    BR.save();
    return true;
  };

  // ---------------- Sam's call ----------------
  BR.scenes.sam = {
    enter() { this.msg = null; this.hud(); },
    draw(g) {
      BR.campArt(g, 'night');
      BR.sprite(g, BR.HUNT_SIT, BR.HSCOL, 190, 238, 2, true);
      if (!BR.ch().guide) { R(g, 194, 247, 3, 6, '#1a1a1a'); R(g, 195, 248, 1, 4, '#9fd0e8'); }
      else BR.sprite(g, BR.MENTOR, BR.MCOL, 96, 222, 2, false);
    },
    hud() {
      const S = BR.S, ch = BR.ch(), guide = ch.guide;
      const seen = S.samSeen[ch.id] || 0;
      const opener = S.chapter === 0 && S.year === 1 && !seen ? 'You’re taking a week off from the city. Grandpa Sam calls the night before you leave.'
        : seen ? ['“Same rules as last time. Humor me.”', '“You know this. I’m telling you anyway.”', '“Write it on your hand this year.”'][seen % 3] : null;
      const lines = (opener ? [opener] : []).concat(ch.sam);
      let extra = '';
      if (ch.wolfTag) extra += BR.btn('wolf', S.tags.wolf ? 'Wolf tag · bought' : `Buy a wolf tag · $${ch.wolfTag}`, '', null, S.tags.wolf || S.cash < ch.wolfTag);
      if (ch.grizDraw) extra += BR.btn('griz', S.tags.grizApplied ? (S.tags.grizzly ? 'Grizzly draw · you drew a tag' : 'Grizzly draw · unsuccessful') : 'Apply for the grizzly draw · $15', '', null, S.tags.grizApplied || S.cash < 15, S.tags.grizApplied ? '' : 'Odds are about 1 in 20');
      BR.hud(`
        <div class="row"><span class="t hi">GRANDPA SAM</span><span class="dim">${guide ? 'At the truck' : 'On the phone'} · Year ${S.year}</span></div>
        <div class="row sm"><span class="t">${ch.name.toUpperCase()} · ${ch.sub}</span><span class="dim">$${S.cash}</span></div>
        <div class="list">${lines.map(l => `<div class="quote">${BR.esc(l)}</div>`).join('')}${extra}</div>
        ${BR.btn('go', 'Drive to camp', 'go')}`);
    },
    act(a) {
      const S = BR.S, ch = BR.ch();
      if (a === 'wolf' && !S.tags.wolf && S.cash >= ch.wolfTag) { S.cash -= ch.wolfTag; S.tags.wolf = true; BR.save(); this.hud(); }
      else if (a === 'griz' && !S.tags.grizApplied && S.cash >= 15) { S.cash -= 15; S.tags.grizApplied = true; S.tags.grizzly = Math.random() < 0.05; BR.save(); this.hud(); }
      else if (a === 'go') { S.samSeen[ch.id] = (S.samSeen[ch.id] || 0) + 1; BR.go('campsite'); }
    },
    back() { BR.go('title'); }
  };

  // ---------------- campsite ----------------
  BR.scenes.campsite = {
    enter() { this.hud(); },
    draw(g) { BR.campArt(g, 'evening'); },
    hud() {
      const ch = BR.ch();
      BR.hud(`
        <div class="row"><span class="t">PICK A CAMPSITE</span><span class="dim">${ch.name} · ${ch.sub}</span></div>
        <div class="tagline">Where you sleep sets how far you walk, where your water comes from, and what hears you.</div>
        <div class="list">${ch.camps.map(c => BR.btn('camp', c.name, '', c.id, false, `${c.blurb} Water: ${c.water.map(w => BR.WATER[w].name.toLowerCase()).join(', ')}.`)).join('')}</div>`);
    },
    act(a, arg) {
      const S = BR.S;
      if (a !== 'camp') return;
      S.camp = arg;
      BR.log('camp', { camp: arg });
      if (BR.needsRange()) BR.go('intro'); else BR.go('camp');
    },
    back() { BR.go('sam'); }
  };
  BR.campData = () => { const ch = BR.ch(); return ch.camps.find(c => c.id === BR.S.camp) || ch.camps[0]; };

  // ---------------- meat care ----------------
  const METHODS = {
    boned: { name: 'Gutless, boned out', blurb: 'Cools fastest. Lightest to pack.', spoil: 0.06, weight: 1 },
    quarters: { name: 'Quarters on the bone', blurb: 'Keeps the bone in. Holds heat in the hams.', spoil: 0.2, weight: 1.35 },
    whole: { name: 'Gut it and drag it whole', blurb: 'Quick. Slow to cool.', spoil: 0.5, weight: 1.9 }
  };
  const HANGS = {
    shade: { name: 'Hang it in the shade, 100 yd off', blurb: 'North side of the timber, away from the carcass.', f: 1, pred: 0 },
    creek: { name: 'Hang it over the creek', blurb: 'Cold air off the water.', f: 0.8, pred: 0.05 },
    sun: { name: 'Pile it in the meadow', blurb: 'Close and easy to find.', f: 2.2, pred: 0.15 },
    ground: { name: 'Leave it by the carcass', blurb: 'Come back for it in the morning.', f: 1.6, pred: 0.3 }
  };
  BR.scenes.meat = {
    enter() { const e = BR.S.enc; if (!e.meat) e.meat = { step: 'method' }; this.hud(); },
    draw(g) {
      const e = BR.S.enc, a = e.shotResult.animal;
      g.drawImage(BR.scenes.recover.groundCanvas(e.rec ? e.rec.seed : 7), 0, 0);
      BR.SPR.draw(g, BR.SPR.get(a, 'dead', a.sp === 'moose' ? 1 : 1.3), 120, 226);
    },
    hud() {
      const S = BR.S, e = S.enc, m = e.meat, ch = BR.ch(), a = e.shotResult.animal;
      if (m.step === 'method') {
        BR.hud(`<div class="row"><span class="t ok">TAG ON HIM</span><span class="hi">${BR.fmt(S.clock)}</span></div>
          <div class="tagline">${ch.temp >= 0.7 ? 'It’s warm. The clock on the meat started when he went down.' : 'It’s cold enough to buy you some time.'}</div>
          <div class="list">${Object.entries(METHODS).map(([k, v]) => BR.btn('method', v.name, '', k, false, v.blurb)).join('')}</div>`);
      } else if (m.step === 'hang') {
        BR.hud(`<div class="row"><span class="t">WHERE DOES THE MEAT GO?</span><span class="hi">${METHODS[m.method].name}</span></div>
          <div class="list">${Object.entries(HANGS).map(([k, v]) => BR.btn('hang', v.name, '', k, false, v.blurb)).join('')}</div>`);
      } else if (m.step === 'spray') {
        BR.hud(`<div class="row"><span class="t bad">BEAR SPRAY</span><span class="hi">${BR.fmt(S.clock)}</span></div>
          <div class="quote">${m.text}</div>
          <div class="tagline">There’s ${m.days - 1} more day${m.days === 2 ? '' : 's'} of meat still up there.</div>
          <div class="sp"></div>${BR.btn('goback', 'Go back for the rest')}${BR.btn('leaverest', 'Leave the rest on the mountain', 'go')}`);
      } else {
        const base = a.sp === 'moose' ? 550 : a.sex === 'cow' ? 170 : 230, saved = Math.round(base * (1 - m.spoil));
        const load = S.items.framePack ? 100 : 70, trips = Math.max(1, Math.ceil(saved * METHODS[m.method].weight / load));
        BR.hud(`<div class="row"><span class="t ${m.spoil > 0.3 ? 'bad' : 'ok'}">MEAT</span><span class="hi">${saved} lb saved</span></div>
          <div class="quote">${m.text}</div>
          <div class="row sm"><span class="dim">${m.truck} mi from the truck · ${m.days} day${m.days === 1 ? '' : 's'} packing · ${trips} trip${trips === 1 ? '' : 's'}</span><span class="dim">${Math.round(m.spoil * 100)}% lost</span></div>
          <div class="sp"></div>${BR.btn('done', 'Pack it out', 'go')}`);
      }
    },
    act(a, arg) {
      const S = BR.S, e = S.enc, m = e.meat, ch = BR.ch(), an = e.shotResult.animal;
      if (a === 'method') { m.method = arg; m.step = 'hang'; }
      else if (a === 'hang') {
        m.hang = arg;
        const h = HANGS[arg], M = METHODS[m.method];
        let spoil = M.spoil * ch.temp * h.f * (S.items.gameBags ? 0.7 : 1);
        if (ch.wolves || ch.bears) spoil += h.pred;
        m.days = BR.packDays(an.sp, e.area);
        m.truck = +(BR.area(e.area).miles * 1.5).toFixed(1);
        if (m.days > 1) spoil += (m.days - 1) * 0.06 * ch.temp * h.f;
        m.spoil = BR.clamp(spoil, 0, 0.95);
        const lines = [];
        if (m.spoil < 0.1) lines.push('Cool, clean meat. Hank would approve.');
        else if (m.method === 'quarters' && ch.temp >= 0.7) lines.push('The hams soured at the bone before they cooled.');
        else if (arg === 'sun') lines.push('Blowflies found it in the sun before you got back.');
        else if (h.pred && (ch.wolves || ch.bears)) lines.push('Something got into it overnight.');
        else lines.push('You lost some of it.');
        const bear = (ch.charge || 0) + BR.campData().bear;
        m.step = 'done';
        if (bear && Math.random() < bear) {
          const r = BR.bearCharge(e.area);
          if (r === 'charged') { m.charged = true; lines.push('Coming back for the second load, a grizzly false-charged you from 15 yards. You lose a day collecting yourself.'); }
          else if (r === 'sprayed') {
            lines.push('On the second load a grizzly came at you. You emptied the spray in its face and it turned.');
            if (m.days > 1) m.step = 'spray';
          }
        }
        m.text = lines.join(' ');
      } else if (a === 'goback') { BR.save(); BR.go('dead', { cause: 'bear' }); return; }
      else if (a === 'leaverest') {
        const kept = 1 / m.days;
        m.spoil = BR.clamp(1 - (1 - m.spoil) * kept, 0, 1);
        m.days = 1; m.left = true; m.step = 'done';
        m.text += ' You left the rest of the meat on the mountain.';
      } else if (a === 'done') {
        const violation = ch.meatOnBone && m.method === 'boned' ? 'The meat has to stay on the bone in this unit. You boned it out.'
          : m.spoil >= 0.6 ? 'Most of the meat spoiled. That’s wanton waste.' : null;
        BR.log('kill', Object.assign({ method: m.method, hang: m.hang, spoil: m.spoil }, e.shotResult));
        S.tag = { sp: an.sp, desc: BR.describe(an), day: S.day, range: e.shotResult.range, area: e.area, spoil: m.spoil };
        for (let i = 0; i < m.days; i++) BR.skipDay('packout');
        S.over = true;
        if (violation) { S.verdict = { illegal: true, reason: violation }; S.stats.violations++; BR.log('illegal', { reason: violation }); BR.go('outcome', { kind: 'illegal', reason: violation }); return; }
        S.part = 'evening';
        BR.endHunt();
        return;
      }
      BR.draw(); this.hud(); BR.save();
    },
  };

  // ---------------- death ----------------
  BR.scenes.dead = {
    enter(a) { const S = BR.S; this.cause = (a && a.cause) || 'dysentery'; this.years = S.year; this.hud(); },
    draw(g) {
      BR.campArt(g, 'night');
      R(g, 88, 200, 64, 80, '#6b6f73'); R(g, 93, 195, 54, 10, '#6b6f73'); R(g, 88, 200, 64, 3, '#8a8e92'); R(g, 149, 200, 3, 80, '#4a4e52');
      R(g, 101, 219, 37, 3, '#3a3e42'); R(g, 107, 229, 27, 3, '#3a3e42'); R(g, 104, 240, 32, 3, '#3a3e42');
      R(g, 80, 277, 80, 5, '#2a2318');
    },
    hud() {
      BR.hud(`
        <div class="row"><span class="t bad">${this.cause === 'bear' ? 'KILLED BY A GRIZZLY' : 'YOU HAVE DIED OF DYSENTERY'}</span><span class="dim">Year ${this.years}</span></div>
        <div class="quote">${this.cause === 'bear' ? 'You went back where you sprayed it. Spray that’s worn off draws bears in.' : 'Here lies a hunter. Tough on elk, soft on water.'}</div>
        <div class="tagline">Your gear, cash and progress are gone. A new hunter starts in Colorado.</div>
        <div class="sp"></div>${BR.btn('again', 'Start over', 'go')}`);
    },
    act() { const ridge = BR.S.ridge; BR.newGame(); BR.S.ridge = ridge; BR.startSeason(0); },
    back() { this.act(); }
  };

  // ---------------- season end ----------------
  BR.endSeason = () => {
    const S = BR.S, ch = BR.ch(), filled = !!S.tag && !(S.verdict && S.verdict.illegal);
    S.stats.seasons++;
    if (filled) S.stats.filled++;
    S.history.push({ year: S.year, chapter: ch.id, filled, tag: S.tag ? S.tag.desc : null, verdict: S.verdict ? S.verdict.reason : null });
    BR.go('season', { filled });
  };
  BR.scenes.season = {
    enter(a) { this.filled = BR.S.history.length ? BR.S.history[BR.S.history.length - 1].filled : !!(a && a.filled); this.hud(); },
    draw(g) {
      BR.campArt(g, 'night');
      const t = BR.S.tag;
      if (t && this.filled) BR.SPR.draw(g, BR.SPR.get({ sp: t.sp, sex: /cow/.test(t.desc) ? 'cow' : 'bull', pts: 6, spread: 52, brows: 4 }, 'dead', 0.9), 60, 290);
    },
    hud() {
      const S = BR.S, ch = BR.ch(), t = S.tag, st = S.stats, last = S.chapter >= BR.CHAPTERS.length - 1;
      let title, text, next;
      if (this.filled) {
        title = `TAG FILLED · ${t.desc.toUpperCase()}`;
        text = `${ch.name}, day ${t.day}, ${t.range} yards.`;
        next = S.finished ? 'Back to the trail map' : last ? 'Finish the trail' : `On to ${BR.CHAPTERS[S.chapter + 1].name}: ${BR.CHAPTERS[S.chapter + 1].sub}`;
      } else {
        const v = S.verdict && S.verdict.reason;
        title = v ? 'SEASON OVER' : 'TAG SOUP';
        text = v || `${S.days} days and no animal in the truck.`;
        next = S.finished ? 'Back to the trail map' : `Try ${ch.name} again next season`;
      }
      BR.hud(`
        <div class="row"><span class="t ${this.filled ? 'ok' : 'bad'}">${BR.esc(title)}</span><span class="dim">Year ${S.year}</span></div>
        <div class="quote">${BR.esc(text)}</div>
        <div class="row sm"><span class="dim">Seasons ${st.seasons} · tags filled ${st.filled} · busts ${st.busts} · wounded ${st.wounds}</span></div>
        ${this.filled || S.finished ? '' : '<div class="tagline">You keep your gear, cash and strength.</div>'}
        <div class="sp"></div>${BR.btn('next', next, 'go')}`);
    },
    act() {
      const S = BR.S;
      if (S.finished) { BR.go('finale'); return; }
      if (this.filled) {
        S.cash += 400;
        if (S.chapter >= BR.CHAPTERS.length - 1) { S.finished = true; BR.go('finale'); }
        else BR.go('bridge', { to: S.chapter + 1 });
      } else { S.year++; BR.startSeason(S.chapter); }
    }
  };


  // ---------------- between chapters: a few lines of story, never more ----------------
  const BRIDGE = {
    1: ['Hank drops a cow tag application on your dash in September. “Rifle season. Same country, harder elk.”'],
    2: ['Hank’s knee gives out on the pack-out. “Idaho’s still on,” he says. “I’ll run the radio from the trailhead.”'],
    3: ['A satellite message from Hank: “Montana. Public land, grizzlies, and a lot of orange. Hunt where they aren’t.”'],
    4: ['Hank calls in the spring. “One more float. Alaska. Book it before I come to my senses.”'],
    5: ['Hank’s float was his last trip. He gives you his coffee mug at the airstrip.', 'A year later Sam calls. He wants one more elk season, and he wants you to take him.']
  };
  BR.scenes.bridge = {
    enter(a) { this.to = a && a.to != null ? a.to : BR.S.chapter + 1; this.hud(); },
    draw(g) { BR.campArt(g, 'evening'); BR.fireFolk(g); },
    hud() {
      const next = BR.CHAPTERS[this.to];
      BR.hud(`
        <div class="row"><span class="t hi">${next.name.toUpperCase()}</span><span class="dim">${next.sub}</span></div>
        <div class="list">${(BRIDGE[this.to] || []).map(l => `<div class="quote">${BR.esc(l)}</div>`).join('')}</div>
        <div class="sp"></div>${BR.btn('go', 'Keep going', 'go')}`);
    },
    act() { BR.startSeason(this.to); }
  };
  // ---------------- finale / free play ----------------
  BR.scenes.finale = {
    enter() { this.hud(); },
    draw(g) {
      BR.campArt(g, 'night');
      BR.fireFolk(g);
    },
    hud() {
      const S = BR.S, st = S.stats;
      BR.hud(`
        <div class="row"><span class="t hi">THE TRAIL’S DONE</span><span class="dim">Year ${S.year}</span></div>
        <div class="quote">Sam sits by the fire a while with Hank’s old mug and doesn’t say much. “Same time next year,” he says.</div>
        <div class="row sm"><span class="dim">${st.seasons} seasons · ${st.filled} tags filled · ${st.predators} predators · ${st.violations} violations</span></div>
        <div class="list">${BR.CHAPTERS.map((c, i) => BR.btn('hunt', `${c.name}: ${c.sub}`, '', i)).join('')}</div>`);
    },
    act(a, arg) { if (a === 'hunt') BR.startSeason(+arg); },
    back() { BR.go('title'); }
  };
})();

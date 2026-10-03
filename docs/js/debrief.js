// Bugle Ridge — hunt outcomes, the campfire debrief (Hank picks the one lesson that matters; in the epilogue you pick it for Sam), and the shop.
(function () {
  const BR = window.BR, { P, W, H, R } = BR;

  const OUT = {
    bust: o => ({
      scent: ['BUSTED · SCENT', 'A bark, and the whole bunch crashed into the timber. They never looked your way.'],
      movement: ['BUSTED · SEEN', `She pinned you at ${o.yd} yards. One bark and they were gone.`],
      noise: ['BUSTED · NOISE', `That last crunch on the ${o.terrain || 'slope'} was one too many.`],
      circled: ['BUSTED · WINDED', `It swung downwind at ${o.yd} yards, caught your scent, and crashed off.`],
      drew: ['BUSTED · CAUGHT MOVING', 'It saw you come up and was gone in two jumps.'],
      samScent: ['BUSTED · SAM’S WIND', `He walked into Sam’s scent at ${o.yd} yards. One bark and he was gone.`],
      samSeen: ['BUSTED · SAM MOVED', `He was looking straight at Sam when Sam drew. ${o.yd} yards, and gone.`],
      cowSaw: ['BUSTED · THE COWS', `A cow ${o.yd < 25 ? 'right on top of Sam' : 'ahead of the bull'} caught Sam drawing. She barked, and the whole herd went.`]
    }[o.cause] || ['BUSTED', 'They’re gone.']),
    gone: () => ['THEY BEDDED', 'They fed into the dark timber before you got there.'],
    dark: () => ['OUT OF LIGHT', 'Legal light’s gone. You pick your way back by headlamp.'],
    hangup: o => ({
      overcall: ['IT WENT QUIET', 'Too much calling. It hung up and slipped away.'],
      bugle: ['HE HERDED HIS COWS OFF', 'You told him to gather his cows and leave. He did.'],
      interest: ['LOST INTEREST', 'The answers got farther off, then stopped.']
    }[o.cause] || ['IT WENT QUIET', '']),
    miss: o => o.guide ? (o.deflected ? ['DEFLECTED', 'Sam’s arrow ticked a branch and went wild.'] : ['SAM MISSED', `Sam’s arrow went ${o.high ? 'over his back' : 'under his chest'} at ${o.range} yards. He sat down hard on the log.`]) : o.deflected ? ['DEFLECTED', `The ${o.weapon === 'rifle' ? 'bullet' : 'arrow'} clipped the branch and went wild.`] : [`CLEAN MISS · ${o.high ? 'HIGH' : 'LOW'}`, `The ${o.weapon === 'rifle' ? 'bullet' : 'arrow'} went ${o.high ? 'over' : 'under'} it at ${o.range} yards.`],
    leftEarly: o => ['HE CAME ANYWAY', 'You walked out. Ten minutes later, from the ridge, you watched a bull walk into your setup without a sound.'],
    bumped: o => o.cause === 'atv' ? ['BUMPED · SIDE-BY-SIDE', 'A side-by-side rattled through the clearing at the wrong moment. Everything left.']
      : o.cause === 'hunter' ? ['BUMPED · ANOTHER HUNTER', 'Another hunter walked in on your bull, cow-calling. He blew out the whole basin.'] : ['BUMPED', BR.ch().weapon === 'rifle' ? 'Two orange vests walked right through them. Public land.' : 'Another bowhunter came crashing up the trail, cow calling. Everything left.'],
    walked: () => ['IT WALKED', 'It stepped into the timber before you got a shot off.'],
    passed: () => ['YOU PASSED', 'You let it go.'],
    lost: () => ['LOST IT', 'You searched until dark and never found it. Tomorrow goes to looking.'],
    charge: () => ['GRIZZLY', 'A grizzly came out of the timber at a run and stopped at 15 yards. Then it left. You need a day, and clean pants.'],
    illegal: o => ['SEASON OVER', o.reason + ' You tag it, call it in, and go home.'],
    predator: o => ['TAGGED', (o.sp === 'wolf' ? 'A wolf, with the tag to go with it.' : 'A grizzly. You drew the tag, and you filled it.') + ` Packing it out takes ${o.days || 1} day${(o.days || 1) === 1 ? '' : 's'}.`],
    blowback: () => ['SPRAY BLEW BACK', 'A grizzly came in to your calling. You sprayed into the wind and it blew straight back at you. The bear stopped at ten yards and left. You lose a day.'],
    sprayed: () => ['BEAR SPRAY', 'A grizzly came out of the timber at a run. You emptied the can in its face at 10 yards and it turned and crashed off.']
  };

  BR.scenes.outcome = {
    enter(o) { this.o = o; const f = OUT[o.kind] ? OUT[o.kind](o) : ['HUNT OVER', '']; this.title = f[0]; this.text = f[1]; this.hud(); },
    draw(g) {
      const o = this.o, look = BR.ch().look, snow = look === 'snow';
      BR.bands(g, BR.S.part === 'evening' ? [[0, '#231f38'], [67, '#43304a'], [107, P.glow]] : snow ? [[0, '#4a5462'], [80, '#8a94a0']] : [[0, P.dusk], [53, P.dawn], [93, P.glow]]);
      BR.ridge(g, 128, 11, 0.0225, 2.2, P.far2);
      for (let X = 0; X < W + 4; X += 6) BR.pine(g, X, 200, 34 + ((X * 11) % 18), P.timber);
      BR.bands(g, [[197, snow ? '#c4ccd6' : '#56673f'], [H, snow ? '#8a949e' : '#34422c']]);
      BR.grass(g, 199, 1600, 5, snow ? ['#e8ecf0', '#b4bcc8'] : [P.meadow2, P.meadowD, P.meadow3]);
      if (o.kind === 'charge') BR.SPR.draw(g, BR.SPR.get({ sp: 'griz', sex: 'bear' }, 'charge', 1.3, { flip: true }), 147, 275);
      if (o.kind === 'sprayed') BR.SPR.draw(g, BR.SPR.get({ sp: 'griz', sex: 'bear' }, 'walk', 1.1, { flip: false }), 190, 240);
      else if (['bust', 'miss', 'hangup', 'bumped'].includes(o.kind)) {
        const an = BR.ch().species === 'moose' ? { sp: 'moose', sex: 'cow' } : { sp: 'elk', sex: 'cow' };
        const spr = BR.SPR.get(an, 'walk', 0.4, { flip: true });
        for (let i = 0; i < 3; i++) BR.SPR.draw(g, spr, 67 + i * 48, 195 - (i % 2) * 5);
      }
      BR.person(g, 'hunter', BR.ch().weapon === 'bow' ? 'bow' : 'rifle', 46, 307, 1.1);
      if (BR.ch().guide) BR.person(g, 'sam', 'bow', 18, 305, 1.1);
    },
    hud() {
      const S = BR.S, bad = !['passed', 'predator', 'sprayed'].includes(this.o.kind);
      BR.hud(`
        <div class="row"><span class="t ${bad ? 'bad' : 'ok'}">${this.title}</span><span class="hi">${BR.fmt(S.clock)}</span></div>
        <div class="quote">${BR.esc(this.text)}</div>
        <div class="sp"></div>
        ${BR.btn('back', S.part === 'morning' && !S.over ? 'Head back for midday' : 'Head back to camp', 'go')}`);
    },
    act() { const S = BR.S; if (S.over) { S.part = 'evening'; } BR.endHunt(); },
    back() { this.act(); }
  };

  // ---------------- lesson picker ----------------
  // Calling for Sam: you pick what Sam needs to hear (skill); Sam tells you what you did (sam).
  function guideLesson(ev) {
    const find = t => ev.filter(x => x.type === t).pop(), setup = find('setup');
    let x;
    if ((x = find('samShot'))) {
      const res = find('kill') || find('recovered');
      if (x.walking) return { q: 'walking', skill: 'Wait for my mew. Shoot him stopped, never walking.', sam: res ? '“You never stopped him. I got lucky.”' : '“He never stopped. You have to stop him for me.”' };
      if (x.holdT > 20) return { q: 'shaky', skill: 'Don’t come to full draw until he’s almost in your lane.', sam: '“You had me at full draw forever. Signal later.”' };
      if (find('kill')) return { q: 'kill', skill: 'Pick one hair and shoot it. Same as today.', sam: pick(['“That’s the setup Hank would’ve drawn up.”', '“You put him right in my lap.”']), good: true };
      if (x.zone === 'miss') return { q: 'miss', skill: 'Pick a spot on the hair, not the whole elk.', sam: '“That’s on me. You did your part.”' };
      return { q: 'hit', skill: 'Wait for the near leg to step forward.', sam: '“You stopped him good. I pulled it.”' };
    }
    if ((x = find('bust'))) {
      if (x.cause === 'samScent') return { q: x.cause, skill: 'Sit still and trust where I put you.', sam: '“He walked through my wind. Put me where he can’t get below me.”' };
      if (x.cause === 'circled') return { q: x.cause, skill: 'Stay put when he circles. Don’t chase the shot.', sam: setup && !setup.downwindSide ? '“He swung to the other side. Bulls circle downwind. Put me there.”' : '“He got below you before he got to me. Set me farther out.”' };
      if (x.cause === 'samSeen') return { q: x.cause, skill: 'Draw only when his eyes are behind a tree.', sam: setup && setup.cover === 'open' ? '“You put me in the wide open and signaled while he stared at me.”' : '“You signaled while he was looking right at me.”' };
      if (x.cause === 'cowSaw') return { q: x.cause, skill: 'Let the cows walk by. The bull’s always last.', sam: '“Those cows were right on top of me. Wait for the bull.”' };
      if (x.cause === 'movement') return { q: x.cause, skill: 'When he hangs up, be patient.', sam: '“You crept in on him across the open. He saw you.”' };
    }
    if ((x = find('hangup'))) return x.cause === 'overcall' ? { q: 'overcall', skill: 'Be patient when the calling stops.', sam: '“You called too much. Real cows shut up and feed.”' } : x.cause === 'bugle' ? { q: 'herd', skill: 'Be patient when the calling stops.', sam: '“You challenged a herd bull and he took his cows home. Cow-call a herd bull.”' } : null;
    if (find('leftEarly')) return { q: 'left', skill: 'Sit thirty minutes after the last call.', sam: '“We walked out on a quiet bull. Hank always sat thirty minutes after the last call.”' };
    if (setup && setup.closest > 45 && find('walked')) return { q: 'wide', skill: 'Stay ready even when he’s out of range.', sam: `“He walked by me at ${setup.closest} yards. You put me in the wrong place.”` };
    return null;
  }

  function lesson(S) {
    const ev = S.events.filter(x => x.day === S.day), has = S.items, ch = BR.ch(), rifle = ch.weapon === 'rifle';
    const find = t => ev.filter(x => x.type === t).pop();
    let x;
    if (ch.guide) { const gl = guideLesson(ev); if (gl) return Object.assign({ gear: null }, gl); }
    if ((x = find('miss')) && x.deflected) return { q: 'You shot through a branch. An arrow finds every twig between you and the elk.', skill: 'If there’s brush in the lane, wait one step or move one step.', gear: null };
    if ((x = find('bumped'))) return { q: pick(['Public land. Somebody always walks in.', 'Nothing you did wrong. Somebody else walked in on them.', 'Crowds push elk. The ones that stay are the ones nobody can reach.']), skill: 'Go earlier, go farther, or hunt the pocket nobody wants to climb to.', gear: null };
    if ((x = find('illegal'))) return { q: `${x.reason} That ends the season.`, skill: 'Know exactly what your tag allows before you ever pick up the weapon.', gear: null };
    if ((x = find('sprayed'))) return { q: 'You sprayed a grizzly, and it worked. Now listen: when that spray wears off, the smell pulls bears in. Do not go back there this season.', skill: 'Never return to the place you sprayed.', gear: 'bearSpray' };
    if ((x = find('blowback'))) return { q: 'Spray into the wind comes right back at you. Check the wind before you ever need it.', skill: 'Bear spray works with the wind at your back. Into a headwind it’s useless.', gear: has.bearSpray ? null : 'bearSpray' };
    if ((x = find('leftEarly'))) return { q: 'He went quiet, so you walked out. He was coming the whole time.', skill: 'Sit thirty minutes after the last call. Silent bulls come in from downwind.', gear: null };
    if ((x = find('lostday')) && x.reason === 'grizzly') return { q: 'Everybody’s legs quit the first time a grizzly runs at them. You’re alive, and you lost a day.', skill: 'In bear country, make noise in the thick stuff and come into kill sites upwind.', gear: has.bearSpray ? null : 'bearSpray' };
    if ((x = find('lost'))) {
      if (x.weapon === 'rifle' && x.zone === 'shoulder') return { q: `At ${x.range} yards that bullet was carrying ${x.ke} foot-pounds. The shoulder soaked it up.`, skill: 'Get closer, or take the shot behind the shoulder.', gear: BR.rifle().id === '3006' || BR.rifle().id === '65cm' ? 'rifle:7prc' : null };
      if (x.weapon !== 'rifle' && x.zone === 'shoulder' && x.ke < 65) return { q: `The shoulder blade stopped that ${x.gr}-grain arrow. At ${x.ke} foot-pounds you had no margin for a bad angle.`, skill: 'Wait for the near front leg to step forward, or pass on quartering-to shots.', gear: S.bow === 'scout' ? 'bow:talon' : 'fixedBlades' };
      if (x.pushed && (x.zone === 'liver' || x.zone === 'paunch')) return { q: `${x.zone === 'liver' ? 'Dark blood, no bubbles: liver.' : 'Green in the blood means gut.'} You pushed it out of its bed and it never stopped.`, skill: 'Give a liver hit four hours and a gut hit overnight.', gear: null };
      if (!has.rangefinder && Math.abs((x.est || x.range) - x.range) >= 8) return { q: `It was ${x.range} yards. You guessed ${x.est}.`, skill: 'Range everything before you shoot.', gear: 'rangefinder' };
      if (x.fatigue > 0.8) return { q: 'You held until you were shaking, then touched it off.', skill: 'Get set before it steps out. Don’t hold forever.', gear: rifle ? (has.sticks ? 'tripod' : 'sticks') : null };
      return { q: `You hit it in the ${x.zone}. No blood trail is worth that feeling.`, skill: 'Only shoot broadside or quartering away, at a range you’ve practiced.', gear: null };
    }
    if ((x = find('kill'))) {
      if (x.spoil > 0.3) return { q: `You filled the tag and lost ${Math.round(x.spoil * 100)}% of the meat.`, skill: 'Gutless, boned out, hung in the shade. Every time it’s warm.', gear: has.gameBags ? null : 'gameBags' };
      return { q: `That’s how it’s done. ${x.range} yards, ${x.zone === 'vitals' ? 'both lungs' : x.zone}.`, skill: 'Get the meat cool and the quarters hung tonight.', gear: null, good: true };
    }
    if ((x = find('predator'))) return { q: x.sp === 'wolf' ? 'A wolf, legal and tagged. The elk will be a little less jumpy in that basin.' : 'A grizzly, on a tag almost nobody draws.', skill: 'Now back to the tag you came for.', gear: null, good: true };
    if ((x = find('miss'))) {
      if (x.weapon === 'rifle') {
        const right = [200, 300, 400, 500].reduce((b, m) => (Math.abs(m - x.range) < Math.abs(b - x.range) ? m : b), 200);
        if (!has.rangefinder && Math.abs(x.est - x.range) >= 25) return { q: `It was ${x.range} yards. You guessed ${x.est}. At that distance a guess is a miss.`, skill: 'Range it first. Every time.', gear: 'rangefinder' };
        if (x.held !== right) return { q: `It was ${x.range} yards and you held for ${x.held}. That bullet went ${x.high ? 'over' : 'under'}.`, skill: 'Crosshair to 250, first mark 300, second 400, third 500.', gear: null };
        if (Math.abs(x.wind) >= 6 && Math.abs(x.windHeld) < 3) return { q: `${Math.abs(x.wind)} mph of wind pushed that bullet right off the vitals.`, skill: 'Hold into the wind. More wind, more distance, more hold.', gear: null };
        return { q: 'You jerked it. The crosshair was moving when it went off.', skill: 'Get a rest. Squeeze, don’t slap.', gear: has.tripod ? null : has.sticks ? 'tripod' : 'sticks' };
      }
      if (BR.bow().pins.length === 3 && x.range > 42) return { q: `${x.range} yards with a sight that stops at 40. You were guessing.`, skill: 'Close the distance or pass.', gear: 'bow:talon' };
      if (Math.abs(x.range - x.held) >= 6) return { q: `It was ${x.range} yards and you held your ${x.held} pin.`, skill: 'Range everything first.', gear: has.rangefinder ? null : 'rangefinder' };
      return { q: 'You held too long and the pin wandered off right as you touched it.', skill: 'Practice at midday. More strength means a steadier hold.', gear: null, practice: true };
    }
    if ((x = find('bust'))) {
      if (x.cause === 'scent' && x.thermal === 'up') return { q: `They never saw you. They smelled you. The sun hit that slope at ${BR.fmt(x.sun)} and your wind went uphill.`, skill: 'Get above them, or be set before the sun hits the slope.', gear: has.windChecker ? null : 'windChecker' };
      if (x.cause === 'scent') return { q: 'Air sinks when the slope’s in shade. Your scent slid right down onto them.', skill: 'When the air is sinking, come in from below or from the side.', gear: has.windChecker ? null : 'windChecker' };
      if (x.cause === 'circled') return { q: 'It did what they do: swung downwind to check you out before it committed.', skill: 'Set up with the downwind side blocked, or slip crosswind when it starts circling.', gear: has.windChecker ? null : 'windChecker' };
      if (x.cause === 'drew') return { q: `It was ${x.angle === 'quartering-to' ? 'quartered your way' : 'looking'} when you moved.`, skill: 'Move when its eyes are behind a tree.', gear: null };
      if (x.cause === 'noise') return { q: 'Deadfall and shale carry a long way. You crunched your way in.', skill: 'Route around noisy ground, even when it’s longer.', gear: null };
      return { q: 'You moved while her head was up. The lead cow is the one hunting you.', skill: 'Watch her, not the bull. Move only when her head’s down.', gear: null };
    }
    if ((x = find('hangup'))) return x.cause === 'overcall' ? { q: 'You called like a whole herd. A real cow calls, then goes quiet and feeds.', skill: 'Call, then wait. Let it come looking.', gear: ch.weapon === 'bow' && !has.reeds ? 'reeds' : null } : { q: 'It lost interest.', skill: 'Rake and call soft. Sound like animals doing animal things.', gear: null };
    if ((x = find('walked'))) return { q: 'It gave you a window and it closed.', skill: 'Be ready before it steps into the opening.', gear: null };
    if ((x = find('gone'))) return { q: pick(['Too slow. Once the sun’s up they walk to bed.', 'They beat you to the timber. They always know the way.']), skill: 'Hike hard while you’re far out and hidden. Slow down only when you’re close.', gear: null };
    if ((x = find('passed'))) return { q: 'You let one walk. Only you know if that was right.', skill: 'If you’re not sure what it is, passing is always legal.', gear: null, good: true };
    if ((x = find('noelk'))) return { q: pick(['Empty country. It happens more than anybody admits.', 'Nothing home. Better you learn that at dawn than at noon.', 'You can’t kill them where they aren’t.']), skill: pick(['If the open is empty at first light, get in the timber.', 'Check the next drainage before you burn a morning.']), gear: null };
    if ((x = find('job'))) return { q: `Good money today, $${x.pay}. Now go find your own.`, skill: 'Spend it where it fixes a real problem.', gear: S.suggest };
    if ((x = find('practice'))) return { q: 'Arms getting stronger. I can see it in your hold.', skill: 'Heavier bows and longer holds come from reps.', gear: null };
    return { q: pick(['Quiet day. Rest up.', 'Sometimes the woods are just empty.', 'Days like this make the good ones.']), skill: 'First light tomorrow.', gear: null };
  }
  const pick = a => a[(Math.random() * a.length) | 0];
  BR.lesson = lesson;
  const DISTRACT = ['Shoot him walking before he gets away.', 'Draw the second you hear him coming.', 'Take the 45-yard shot if the lane’s open.', 'Stand up and look when he hangs up.', 'Shoot sooner, before he can think about it.'];

  const SPEAKER = ['HANK', 'HANK', 'HANK · on the radio', 'HANK · sat messenger', 'HANK', 'YOU'];
  BR.scenes.debrief = {
    enter() {
      const S = BR.S, ch = BR.ch();
      if (S.lessonDay !== S.day) {
        S.lesson = lesson(S); S.lessonDay = S.day;
        if (S.lesson.q === S.lastLessonQ) S.lesson.q = pick(['Same as yesterday, and you know it. ', 'I’m not saying it a third time. ']) + S.lesson.q;
        S.lastLessonQ = S.lesson.q.replace(/^(Same as yesterday, and you know it\. |I’m not saying it a third time\. )/, '');
        if (S.lesson.gear) S.suggest = S.lesson.gear;
        if (ch.guide) { const opts = [S.lesson.skill].concat(DISTRACT.sort(() => Math.random() - 0.5).slice(0, 2)); S.lesson.opts = opts.sort(() => Math.random() - 0.5); S.lesson.picked = null; }
      }
      this.hud();
    },
    draw(g) {
      BR.campArt(g, 'night');
      BR.fireFolk(g);
    },
    gearInfo(id) {
      if (!id) return null;
      const [kind, key] = id.includes(':') ? id.split(':') : ['item', id], S = BR.S;
      if (kind === 'bow') { const b = BR.BOWS[key]; return BR.ch().weapon === 'bow' ? { name: `${b.name} · ${b.lb} lb`, price: b.price, owned: S.bow === key } : null; }
      if (kind === 'rifle') { const r = BR.RIFLES[key]; return BR.ch().weapon === 'rifle' ? { name: r.name, price: r.price, owned: S.rifle === key } : null; }
      const it = BR.ITEMS[key]; if (!it || (it.weapon && it.weapon !== BR.ch().weapon) || (it.bears && !BR.ch().bears)) return null;
      return { name: it.name, price: it.price, owned: !!S.items[key] };
    },
    hud() {
      const S = BR.S, ch = BR.ch(), L = S.lesson, gi = this.gearInfo(L.gear), next = S.day + 1 + (S.skipDays || 0), last = S.over || next > S.days;
      const lost = S.skipDays ? `<div class="row sm"><span class="bad">You lose ${S.skipDays === 1 ? 'tomorrow' : S.skipDays + ' days'}.</span></div>` : '';
      let middle;
      if (ch.guide) {
        middle = L.picked == null
          ? `<div class="tagline">Sam looks at you across the fire. What does he need to hear about today?</div>${L.opts.map((o, i) => BR.btn('pick', o, '', i)).join('')}`
          : `<div class="quote">${L.picked ? 'Sam nods. “Hank used to say that exact thing.”' : 'Sam shrugs. “If you say so.”'}</div>
             <div class="row sm"><span class="dim">SAM ON YOU</span></div><div class="quote">${L.sam || pick(['“Good walk. Same time tomorrow.”', '“You’re getting the hang of that cow call.”', '“Quiet day. Your granddad’s too old for busy ones anyway.”'])}</div>`;
      } else {
        middle = `<div class="quote">“${L.q}”</div>
          <div class="row sm"><span class="dim">SKILL</span><span style="text-align:right">${L.skill}</span></div>
          ${gi && !gi.owned ? BR.btn('buy', `${gi.name} · $${gi.price}`, 'go', L.gear, S.cash < gi.price, S.cash < gi.price ? `Need $${gi.price - S.cash} more. Outfitters pay for scouting.` : 'Hank’s pick') : ''}`;
      }
      BR.hud(`
        <div class="row"><span class="t hi">${SPEAKER[S.chapter] || 'HANK'}</span><span class="dim">Night ${S.day} · $${S.cash}</span></div>
        <div class="list">${middle}${lost}</div>
        <div class="g2">${BR.btn('shop', 'Gear & shop')}${BR.btn('sleep', last ? 'End the season' : `Sleep · Day ${next}`, 'go', null, ch.guide && L.picked == null)}</div>`);
    },
    act(a, arg) {
      const S = BR.S;
      if (a === 'shop') BR.go('shop', { back: 'debrief' });
      else if (a === 'buy') { BR.buy(arg); this.hud(); }
      else if (a === 'pick') {
        const L = S.lesson; L.picked = L.opts[+arg] === L.skill;
        if (L.picked) S.guideSkill = Math.min(4, (S.guideSkill || 0) + 1);
        BR.save(); this.hud();
      } else if (a === 'sleep') {
        const next = S.day + 1 + (S.skipDays || 0);
        if (S.over || next > S.days) { BR.endSeason(); return; }
        S.day = next; S.skipDays = 0; S.part = 'morning'; S.clock = 5.5; S.enc = null; S.drank = false;
        BR.go('camp');
      }
    }
  };

  BR.buy = id => {
    const S = BR.S, [kind, key] = id.includes(':') ? id.split(':') : ['item', id];
    if (kind === 'bow') { const b = BR.BOWS[key]; if (!b || S.cash < b.price || S.strength < b.strength || S.bow === key) return false; S.cash -= b.price; S.bow = key; }
    else if (kind === 'rifle') { const r = BR.RIFLES[key]; if (!r || S.cash < r.price || S.rifle === key) return false; S.cash -= r.price; S.rifle = key; }
    else { const it = BR.ITEMS[key]; if (!it || S.items[key] || S.cash < it.price) return false; S.cash -= it.price; S.items[key] = true; }
    if (S.suggest === id) S.suggest = null;
    BR.vibe(20); BR.save();
    return true;
  };

  BR.scenes.shop = {
    enter(a) { this.back_ = (a && a.back) || 'camp'; this.hud(); },
    draw(g) { BR.campArt(g, BR.S.part === 'night' ? 'night' : BR.S.part); R(g, 0, 0, W, H, 'rgba(7,8,11,.35)'); },
    hud() {
      const S = BR.S, weapon = BR.ch().weapon, rows = [];
      if (weapon === 'bow') Object.values(BR.BOWS).forEach(b => {
        if (S.bow === b.id) { rows.push(BR.btn('none', `${b.name} · in hand`, '', null, true, `${b.lb} lb · ${b.gr} gr · ${BR.ke(b)} ft·lb · pins ${b.pins.join('/')}`)); return; }
        const weak = S.strength < b.strength;
        rows.push(BR.btn('buy', `${b.name} · $${b.price}`, S.suggest === 'bow:' + b.id ? 'go' : '', 'bow:' + b.id, weak || S.cash < b.price, weak ? `Needs draw strength ${b.strength}. Practice at midday.` : `${b.lb} lb · ${b.gr} gr · ${BR.ke(b)} ft·lb · pins to ${Math.max(...b.pins)}`));
      });
      else Object.values(BR.RIFLES).forEach(r => {
        const spec = `${r.load} · ${r.d400}" drop and ${r.e400} ft·lb at 400 · recoil ${r.recoil}`;
        if ((S.rifle || '3006') === r.id) { rows.push(BR.btn('none', `${r.name} · in hand`, '', null, true, spec)); return; }
        rows.push(BR.btn('buy', `${r.name} · $${r.price}`, S.suggest === 'rifle:' + r.id ? 'go' : '', 'rifle:' + r.id, S.cash < r.price, spec));
      });
      Object.entries(BR.ITEMS).forEach(([id, it]) => {
        if ((it.weapon && it.weapon !== weapon) || (it.bears && !BR.ch().bears)) return;
        rows.push(BR.btn('buy', S.items[id] ? `${it.name} · owned` : `${it.name} · $${it.price}`, S.suggest === id && !S.items[id] ? 'go' : '', id, S.items[id] || S.cash < it.price, it.blurb));
      });
      BR.hud(`
        <div class="row"><span class="t">GEAR &amp; SHOP</span><span class="hi">$${S.cash}</span></div>
        <div class="list">${rows.join('')}</div>
        ${BR.btn('back', 'Done')}`);
    },
    act(a, arg) { if (a === 'buy') { BR.buy(arg); this.hud(); } else if (a === 'back') BR.go(this.back_); },
    back() { BR.go(this.back_); }
  };
})();

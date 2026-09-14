// Bugle Ridge — campaign data: gear, cartridges, chapters (tags, areas, camps, animals), daily conditions, scent model.
(function () {
  const BR = window.BR;

  // ---------------- archery ----------------
  BR.BOWS = {
    scout: { id: 'scout', name: 'Ridgeback Scout', lb: 55, gr: 400, fps: 252, pins: [20, 30, 40], price: 0, strength: 0 },
    talon: { id: 'talon', name: 'Ridgeback Talon', lb: 62, gr: 450, fps: 262, pins: [20, 30, 40, 50, 60], price: 640, strength: 1 },
    apex: { id: 'apex', name: 'Cascade Apex', lb: 70, gr: 500, fps: 268, pins: [20, 30, 40, 50, 60], price: 1100, strength: 2 }
  };
  BR.ke = b => Math.round(b.gr * b.fps * b.fps / 450240);
  BR.bow = () => BR.BOWS[BR.S.bow];

  // ---------------- rifles: 200-yd zero. d400 = inches low at 400, e = ft·lb at muzzle / 400 ----------------
  BR.RIFLES = {
    '3006': { id: '3006', name: '.30-06 Springfield', note: 'Sam’s old rifle', load: '180 gr', d400: 26, e0: 2913, e400: 1680, recoil: 20, price: 0 },
    '65cm': { id: '65cm', name: '6.5 Creedmoor', load: '143 gr', d400: 21, e0: 2315, e400: 1520, recoil: 12, price: 900 },
    '7prc': { id: '7prc', name: '7mm PRC', load: '175 gr', d400: 15, e0: 3497, e400: 2490, recoil: 24, price: 1400 },
    '300wm': { id: '300wm', name: '.300 Win Mag', load: '200 gr', d400: 17, e0: 3607, e400: 2500, recoil: 31, price: 1300 },
    '338wm': { id: '338wm', name: '.338 Win Mag', load: '225 gr', d400: 19, e0: 3860, e400: 2310, recoil: 36, price: 1350 }
  };
  BR.rifle = () => BR.RIFLES[BR.S.rifle || '3006'];
  const DROP = [[0, -0.06], [100, -0.1], [200, 0], [300, 0.36], [400, 1], [500, 2], [600, 3.35], [700, 5.1]];
  BR.drop = (yd, rf) => { // inches low (+) or high (−)
    for (let i = 1; i < DROP.length; i++) if (yd <= DROP[i][0]) { const [a, fa] = DROP[i - 1], [b, fb] = DROP[i]; return rf.d400 * (fa + (fb - fa) * (yd - a) / (b - a)); }
    return rf.d400 * 5.1;
  };
  BR.energy = (yd, rf) => Math.round(rf.e0 * Math.pow(rf.e400 / rf.e0, yd / 400));
  BR.drift = (yd, rf, mph) => mph / 10 * Math.pow(yd / 100, 2) * 0.55 * (rf.d400 / 21);
  BR.zoomMax = () => (BR.S.items.scopeDial ? 16 : BR.S.items.scope312 ? 12 : 4);

  BR.ITEMS = {
    windChecker: { name: 'Wind checker', price: 8, blurb: 'Shows your scent drifting on the map.' },
    filter: { name: 'Water filter', price: 45, blurb: 'Treat water in a minute instead of half an hour.' },
    rangefinder: { name: 'Rangefinder', price: 420, blurb: 'Exact yardage at the shot. No more guessing.' },
    gameBags: { name: 'Game bags', price: 40, blurb: 'Meat cools faster and stays clean.' },
    framePack: { name: 'Frame pack', price: 300, blurb: 'Fewer trips on the pack-out.' },
    reeds: { name: 'Diaphragm reeds', price: 25, blurb: 'Unlocks the estrus call. Hands free at full draw.', weapon: 'bow' },
    fixedBlades: { name: 'Fixed-blade broadheads', price: 60, blurb: 'Hold together on bone better than mechanicals.', weapon: 'bow' },
    sticks: { name: 'Shooting sticks', price: 60, blurb: 'A steadier rest for standing shots.', weapon: 'rifle' },
    tripod: { name: 'Tripod rest', price: 300, blurb: 'Rock-steady for long shots.', weapon: 'rifle' },
    scope312: { name: '3–12× scope', price: 450, blurb: 'More magnification: count points at 400 yards.', weapon: 'rifle' },
    scopeDial: { name: '4–16× dial scope', price: 900, blurb: 'The most magnification. Judge antlers far off.', weapon: 'rifle' },
    suppressor: { name: 'Hushline 30 Ti suppressor', price: 1100, blurb: 'Less recoil and noise. You see your own hit.', weapon: 'rifle' }
  };

  // ---------------- water ----------------
  BR.WATER = {
    jug: { name: 'Water jugs from town', risk: 0 },
    spring: { name: 'Spring', risk: 1 / 60 },
    creek: { name: 'Creek', risk: 1 / 30 },
    river: { name: 'River', risk: 1 / 30 },
    pond: { name: 'Beaver pond', risk: 1 / 12 },
    wallow: { name: 'Wallow seep', risk: 1 / 8 },
    tank: { name: 'Stock tank', risk: 1 / 8 }
  };

  const M = (open, timber, deadfall, shale) => ({ open, timber, deadfall, shale });
  const pick = (r, a) => a[(r() * a.length) | 0];

  // ---------------- animals ----------------
  function elkGroup(r, mix) {
    const out = [], cows = mix.cows[0] + ((r() * (mix.cows[1] - mix.cows[0] + 1)) | 0);
    for (let i = 0; i < cows; i++) out.push({ sp: 'elk', sex: 'cow', pts: 0, calf: r() < mix.calves });
    if (r() < mix.bull) { const pts = pick(r, mix.pts); out.unshift({ sp: 'elk', sex: 'bull', pts }); }
    if (mix.bull2 && r() < mix.bull2) out.push({ sp: 'elk', sex: 'bull', pts: pick(r, mix.pts) });
    return out;
  }
  function mooseGroup(r) {
    const out = [], n = 1 + (r() < 0.4 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      if (r() < 0.72) {
        const spread = Math.round(Math.max(30, Math.min(66, 49 + (r() + r() + r() - 1.5) * 16)));
        const brows = Math.max(1, Math.min(5, Math.round(1 + (spread - 34) / 8 + (r() - 0.5) * 2.2)));
        out.push({ sp: 'moose', sex: 'bull', spread, brows });
      } else out.push({ sp: 'moose', sex: 'cow', spread: 0, brows: 0 });
    }
    return out;
  }
  BR.describe = a => {
    if (a.sp === 'wolf') return a.black ? 'black wolf' : 'grey wolf';
    if (a.sp === 'griz') return 'grizzly';
    if (a.sp === 'moose') return a.sex === 'cow' ? 'cow moose' : `${a.spread}" bull moose, ${a.brows} brow tines`;
    if (a.sex === 'cow') return a.calf ? 'elk calf' : 'cow elk';
    return a.pts === 1 ? 'spike bull' : a.pts === 2 ? 'forkhorn bull' : `${a.pts}-point bull`;
  };

  // ---------------- chapters ----------------
  const CO_AREAS = {
    bench: { id: 'bench', name: 'North bench', blurb: 'Open parks on a south face. Long glassing.', miles: 0.8, sun: 8.7, mix: M(0.55, 0.3, 0.05, 0.1), elk: 0.85 },
    burn: { id: 'burn', name: 'The old burn', blurb: 'Heavy feed, deadfall everywhere. Noisy going.', miles: 2.1, sun: 7.9, mix: M(0.4, 0.12, 0.4, 0.08), elk: 0.9 },
    wallow: { id: 'wallow', name: 'Dark timber wallow', blurb: 'North-facing timber. Call, don’t glass.', miles: 1.4, sun: 10.3, mix: M(0.08, 0.8, 0.12, 0), elk: 0.75, callOnly: true }
  };
  const camp = (id, name, blurb, hike, spook, water, bear) => ({ id, name, blurb, hike, spook, water, bear: bear || 0 });

  BR.CHAPTERS = [
    {
      id: 'co-arch', name: 'Colorado', sub: 'Archery · September rut', weapon: 'bow', species: 'elk', temp: 1, look: 'sept',
      rut: d => (d <= 2 ? 1 : d <= 6 ? 2 : 1.5), callShy: d => (d >= 4 ? 0.75 : 1), wolves: 0, bears: 0, dysentery: true,
      areas: [CO_AREAS.bench, CO_AREAS.burn, CO_AREAS.wallow],
      camps: [camp('trailhead', 'Truck at the trailhead', 'Warm and dry. Longer hikes in the dark.', 1.5, 0, ['jug']),
        camp('spike', 'Spike camp in the basin', 'Short walks. Your noise can push elk out.', 0.5, 0.2, ['wallow', 'pond']),
        camp('creek', 'Creek bottom', 'Water close by. Cold at night.', 1, 0.05, ['creek', 'spring'])],
      elk: { cows: [2, 6], calves: 0.35, bull: 0.62, pts: [1, 4, 5, 5, 6, 6, 6, 7] },
      legal: a => (a.sp === 'elk' ? null : 'wrong species'),
      sam: ['Your tag is an over-the-counter archery elk tag. A bull or a cow, either one is legal.',
        'Legal light is half an hour before sunrise to half an hour after sunset.',
        'Hank and I hunted that country for thirty years. Tell him I said to go easy on you. He won’t.']
    },
    {
      id: 'co-rifle', name: 'Colorado', sub: '2nd rifle · October', weapon: 'rifle', species: 'elk', temp: 0.3, look: 'snow',
      rut: () => 0.3, callShy: () => 0.55, wolves: 0, bears: 0, dysentery: true,
      areas: [Object.assign({}, CO_AREAS.bench, { blurb: 'Snowy parks. Elk feed out at first and last light.' }), CO_AREAS.burn,
        Object.assign({}, CO_AREAS.wallow, { name: 'Dark timber', blurb: 'Bedded elk. Calls barely work after the rut.' })],
      camps: [camp('trailhead', 'Truck at the trailhead', 'Heater in the truck. Long cold hikes.', 1.5, 0, ['jug']),
        camp('bench', 'Wall tent on the bench', 'Closer to the elk. Smoke carries.', 0.8, 0.1, ['spring', 'pond']),
        camp('creek', 'Creek bottom', 'Frozen at the edges. Cold sink at night.', 1, 0.05, ['creek'])],
      elk: { cows: [4, 9], calves: 0.4, bull: 0.5, bull2: 0.15, pts: [1, 1, 2, 4, 5, 6, 6] },
      legal: a => (a.sp !== 'elk' ? 'wrong species' : a.sex === 'bull' ? (a.pts === 1 ? 'A spike is a bull. Your tag was antlerless.' : 'That was a bull. Your tag was antlerless.') : null),
      giveRifle: true,
      sam: ['You drew a second-season cow tag. Antlerless only. A spike has antlers, so a spike is a bull.',
        'Wear your orange.',
        'Take my old .30-06. It’s zeroed at two hundred yards.']
    },
    {
      id: 'idaho', name: 'Idaho', sub: 'Zone tag · wolf country', weapon: 'rifle', species: 'elk', temp: 0.7, look: 'breaks',
      rut: () => 0.7, callShy: () => 0.45, wolves: 0.4, bears: 0, dysentery: true, zone: true, wolfTag: 32,
      areas: [{ id: 'canyon', name: 'Canyon face', blurb: 'Steep and open across the river. Long shots.', miles: 1.6, sun: 8.2, mix: M(0.5, 0.3, 0, 0.2), elk: 0.8 },
        { id: 'draw', name: 'Brushy draw', blurb: 'Thick brush and deadfall. Close encounters.', miles: 1.1, sun: 9.4, mix: M(0.35, 0.35, 0.3, 0), elk: 0.7 },
        { id: 'riverbench', name: 'River bench', blurb: 'Open grass above the river. Early feed.', miles: 2.8, sun: 7.6, mix: M(0.62, 0.28, 0.05, 0.05), elk: 0.85 }],
      camps: [camp('river', 'River camp', 'Water and a fire ring. A long climb every morning.', 1.3, 0, ['river']),
        camp('ridge', 'Spike camp on the ridge', 'Above the elk. Wind carries your camp.', 0.5, 0.15, ['spring', 'wallow']),
        camp('trailhead', 'Trailhead', 'The truck. The longest walk.', 1.8, 0, ['jug'])],
      elk: { cows: [2, 5], calves: 0.3, bull: 0.55, pts: [1, 2, 4, 5, 5, 6] },
      legal: a => (a.sp !== 'elk' ? 'wrong species' : a.sex === 'cow' ? 'Your tag was antlered elk only.' : a.zoneOut ? 'He was east of the fence line. Wrong zone.' : null),
      sam: ['Idaho zone tag. Antlered elk only, and spikes count.',
        'Your zone ends at the fence line on the Big Creek divide. West of the fence is yours. East isn’t, no matter where the elk walk.',
        'Wolf tags are cheap over there. If you’re going to shoot a wolf, buy the tag first.']
    },
    {
      id: 'montana', name: 'Montana', sub: 'Public land · brow-tined bulls', weapon: 'rifle', species: 'elk', temp: 0.25, look: 'breaks',
      rut: () => 0.2, callShy: () => 0.5, wolves: 0.25, bears: 0.2, dysentery: true, wolfTag: 50, grizDraw: true, charge: 0.3,
      areas: [{ id: 'coulee', name: 'Coulee breaks', blurb: 'Big open country, little cover.', miles: 3.2, sun: 7.8, mix: M(0.75, 0.1, 0, 0.15), elk: 0.8 },
        { id: 'bma', name: 'Block Management ranch', blurb: 'Sign in at the box. Walk-in only.', miles: 1.0, sun: 8, mix: M(0.7, 0.15, 0.15, 0), elk: 0.7 },
        { id: 'pocket', name: 'Timbered pocket', blurb: 'The spot nobody walks to. Grizzly sign.', miles: 4.5, sun: 9.6, mix: M(0.3, 0.6, 0.1, 0), elk: 0.9, bear: true }],
      camps: [camp('truck', 'Truck at the sign-in box', 'Warm. Every hunt is a long walk.', 1.6, 0, ['jug']),
        camp('spike', 'Spike camp in the timber', 'Close to the pocket. Bears come through.', 0.5, 0.2, ['pond', 'spring'], 0.15),
        camp('coulee', 'Coulee camp', 'Out of the wind. Stock tank water.', 1, 0.05, ['tank'], 0.05)],
      elk: { cows: [3, 7], calves: 0.35, bull: 0.6, pts: [1, 2, 2, 4, 5, 6] },
      legal: a => (a.sp !== 'elk' ? 'wrong species' : a.sex === 'cow' ? 'Your tag was bulls only.' : a.pts < 3 ? 'No brow tines. This district is brow-tined bulls only.' : null),
      sam: ['Montana general tag. It has to be a brow-tined bull in that district. No spikes, no forkhorns.',
        'A grizzly tag is a draw, and almost nobody gets one. If you didn’t draw, leave the bears alone.',
        'Hang your meat a hundred yards off the carcass and come back into the wind.']
    },
    {
      id: 'alaska', name: 'Alaska', sub: 'Moose · float hunt', weapon: 'rifle', species: 'moose', temp: 0.55, look: 'ak',
      rut: () => 1.4, callShy: () => 1, wolves: 0, bears: 0.3, dysentery: false, grizDraw: true, charge: 0.35, meatOnBone: true, sameDayAirborne: true,
      areas: [{ id: 'willows', name: 'Willow flats', blurb: 'Glass the willows at first light.', miles: 0.6, sun: 8.8, mix: M(0.5, 0.15, 0.35, 0), elk: 0.85 },
        { id: 'slough', name: 'Slough bend', blurb: 'Call from the bank. Patience.', miles: 1.2, sun: 9.5, mix: M(0.2, 0.5, 0.3, 0), elk: 0.8, callOnly: true },
        { id: 'burnridge', name: 'Burn ridge', blurb: 'Climb for a view over the river.', miles: 2.2, sun: 8.2, mix: M(0.5, 0.3, 0.2, 0), elk: 0.7 }],
      camps: [camp('bar', 'Gravel bar', 'Raft close. Open to the wind.', 0.6, 0, ['river'], 0.1),
        camp('willow', 'Willow camp', 'Sheltered and close. Bear trails through it.', 0.4, 0.15, ['pond'], 0.2),
        camp('ridge', 'Ridge camp', 'A view and a spring. A climb with meat.', 1.1, 0, ['spring'], 0.05)],
      legal: (a, S) => (S.day === 1 ? 'You flew in that morning. No hunting the same day you’re airborne.' : a.sp !== 'moose' ? 'wrong species' : a.sex === 'cow' ? 'A cow moose. Bulls only.' : (a.spread >= 50 || a.brows >= 4) ? null : `Sub-legal bull: ${a.spread}-inch spread and ${a.brows} brow tines.`),
      sam: ['A legal bull has a 50-inch spread or four brow tines on one side. Count the brow tines. The spread lies to you on the water.',
        'You can’t hunt the same day you fly in.',
        'In that unit the meat stays on the bone until it’s out of the field. Don’t bone it out.',
        'Hank’s going with you. His last float, he says.']
    },
    {
      id: 'epilogue', name: 'Colorado', sub: 'Grandpa Sam’s hunt', weapon: 'rifle', species: 'elk', temp: 0.3, look: 'snow', guide: true,
      rut: () => 0.3, callShy: () => 0.6, wolves: 0, bears: 0, dysentery: true,
      areas: [Object.assign({}, CO_AREAS.bench, { miles: 0.4, blurb: 'Short walk. Sam can glass from the truck.' }),
        Object.assign({}, CO_AREAS.burn, { miles: 1, blurb: 'Rough going for old legs.' }),
        Object.assign({}, CO_AREAS.wallow, { miles: 0.7, name: 'Dark timber', blurb: 'Still-hunt slow.' })],
      camps: [camp('trailhead', 'Truck at the trailhead', 'Sam sleeps warm.', 1, 0, ['jug']),
        camp('creek', 'Creek camp', 'The old camp spot. Sam’s pick.', 0.8, 0.05, ['creek', 'spring'])],
      elk: { cows: [3, 8], calves: 0.4, bull: 0.55, pts: [1, 2, 4, 5, 6] },
      legal: a => (a.sp !== 'elk' ? 'wrong species' : a.sex === 'cow' ? 'Sam’s tag was a bull tag.' : null),
      sam: ['Sam’s tag is a Colorado rifle bull tag. Any antlers.',
        'He can’t walk far anymore, and he won’t shoot past 250 yards.',
        'You pick the ground. He takes the shot.']
    }
  ];
  BR.ch = () => BR.CHAPTERS[BR.S.chapter];
  BR.group = (r, ch) => (ch.species === 'moose' ? mooseGroup(r) : elkGroup(r, ch.elk));
  BR.legal = a => {
    const S = BR.S;
    if (a.sp === 'wolf') return S.tags.wolf ? null : 'You shot a wolf without a wolf tag.';
    if (a.sp === 'griz') return S.tags.grizzly ? null : 'You shot a grizzly without a grizzly tag.';
    return BR.ch().legal(a, S);
  };
  BR.area = id => BR.ch().areas.find(a => a.id === id);

  // ---------------- conditions ----------------
  const DIRS = (BR.DIRS = { N: [0, -1], NE: [0.707, -0.707], E: [1, 0], SE: [0.707, 0.707], S: [0, 1], SW: [-0.707, 0.707], W: [-1, 0], NW: [-0.707, -0.707] });
  BR.dayInfo = day => {
    const S = BR.S, r = BR.rng(S.seed * 31 + day * 977 + S.chapter * 131);
    const amDirs = ['NE', 'E', 'SW', 'W', 'N', 'SW'], pmDirs = ['SW', 'W', 'SW', 'NW', 'S', 'W'];
    const ch = BR.ch(), rutLevel = ch.rut(day);
    const rut = ch.species === 'moose' ? 'Moose rut' : rutLevel >= 1.8 ? 'Peak rut' : rutLevel >= 0.9 ? 'Rut building' : 'Post-rut';
    const info = {
      rut, rutLevel,
      am: { from: amDirs[(r() * amDirs.length) | 0], mph: 2 + Math.round(r() * 5) },
      pm: { from: pmDirs[(r() * pmDirs.length) | 0], mph: 4 + Math.round(r() * 7) },
      sky: ch.look === 'snow' ? pick(r, ['Snowing', 'Clear, cold', 'Grey, flurries']) : ch.look === 'ak' ? pick(r, ['Drizzle', 'Low clouds', 'Clear, cool']) : pick(r, ['Clear', 'Frost, clear', 'High clouds', 'Breezy'])
    };
    info.howl = ch.wolves && r() < ch.wolves * 0.6 ? ch.areas[(r() * ch.areas.length) | 0].id : null;
    return info;
  };
  BR.thermal = (clock, area) => (clock < area.sun ? 'down' : clock < 18.3 ? 'up' : 'down');
  BR.scent = (area, clock) => {
    const d = BR.dayInfo(BR.S.day), w = clock >= 12 ? d.pm : d.am, wv = DIRS[w.from];
    const ww = Math.min(1, w.mph / 9), th = BR.thermal(clock, area), tw = 1 - ww * 0.6;
    const x = -wv[0] * ww, y = -wv[1] * ww + (th === 'down' ? 1 : -1) * tw, m = Math.hypot(x, y) || 1;
    return { x: x / m, y: y / m, from: w.from, mph: w.mph, thermal: th };
  };
  BR.compass = (x, y) => ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(((Math.atan2(x, -y) * 180 / Math.PI + 360) % 360) / 45) % 8];
  BR.conditions = () => {
    const d = BR.dayInfo(BR.S.day), w = BR.S.clock >= 12 ? d.pm : d.am;
    return { rut: d.rut, rutLevel: d.rutLevel, from: w.from, mph: w.mph, sky: d.sky, howl: d.howl };
  };
})();

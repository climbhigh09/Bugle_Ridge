// Bugle Ridge — Colorado archery slice data: gear, areas, daily conditions, scent model.
(function () {
  const BR = window.BR;

  BR.BOWS = {
    scout: { id: 'scout', name: 'Ridgeback Scout', lb: 55, gr: 400, fps: 252, pins: [20, 30, 40], price: 0, strength: 0 },
    talon: { id: 'talon', name: 'Ridgeback Talon', lb: 62, gr: 450, fps: 262, pins: [20, 30, 40, 50, 60], price: 640, strength: 1 }
  };
  BR.ke = b => Math.round(b.gr * b.fps * b.fps / 450240);
  BR.bow = () => BR.BOWS[BR.S.bow];

  BR.ITEMS = {
    windChecker: { name: 'Wind checker', price: 8, blurb: 'Shows your scent drifting on the map.' },
    reeds: { name: 'Diaphragm reeds', price: 25, blurb: 'Unlocks the estrus call. Hands free at full draw.' },
    fixedBlades: { name: 'Fixed-blade broadheads', price: 60, blurb: 'Hold together on bone better than mechanicals.' },
    rangefinder: { name: 'Rangefinder', price: 420, blurb: 'Exact yardage at the shot. No more guessing.' }
  };

  // sun = hour the sun hits the slope (thermals flip upslope). Uphill is always the top of the map.
  BR.AREAS = {
    bench: { id: 'bench', name: 'North bench', blurb: 'Open parks on a south face. Long glassing.', miles: 0.8, sun: 8.7, mix: { open: 0.55, timber: 0.3, deadfall: 0.05, shale: 0.1 }, elk: 0.85 },
    burn: { id: 'burn', name: 'The old burn', blurb: 'Heavy feed, deadfall everywhere. Noisy going.', miles: 2.1, sun: 7.9, mix: { open: 0.4, timber: 0.12, deadfall: 0.4, shale: 0.08 }, elk: 0.9 },
    wallow: { id: 'wallow', name: 'Dark timber wallow', blurb: 'North-facing timber. Call, don’t glass.', miles: 1.4, sun: 10.3, mix: { open: 0.08, timber: 0.8, deadfall: 0.12, shale: 0 }, elk: 0.75, callOnly: true }
  };

  const DIRS = (BR.DIRS = { N: [0, -1], NE: [0.707, -0.707], E: [1, 0], SE: [0.707, 0.707], S: [0, 1], SW: [-0.707, 0.707], W: [-1, 0], NW: [-0.707, -0.707] });
  const RUT = ['Building', 'Building', 'Peak', 'Peak', 'Peak', 'Peak', 'Peak, bulls hoarse'];

  BR.dayInfo = day => {
    const r = BR.rng(BR.S.seed * 31 + day * 977);
    const amDirs = ['NE', 'E', 'SW', 'W', 'N', 'SW'], pmDirs = ['SW', 'W', 'SW', 'NW', 'S', 'W'];
    const rutLevel = day <= 2 ? 1 : day <= 6 ? 2 : 1.5;
    return {
      rut: RUT[Math.min(day, 7) - 1], rutLevel,
      am: { from: amDirs[(r() * amDirs.length) | 0], mph: 2 + Math.round(r() * 5) },
      pm: { from: pmDirs[(r() * pmDirs.length) | 0], mph: 4 + Math.round(r() * 7) },
      sky: ['Clear', 'Frost, clear', 'High clouds', 'Clear', 'Breezy'][(r() * 5) | 0]
    };
  };

  BR.thermal = (clock, area) => (clock < area.sun ? 'down' : clock < 18.3 ? 'up' : 'down');

  // Where scent travels: a blend of wind (strong when it blows) and thermals (strong when it doesn't).
  BR.scent = (area, clock) => {
    const d = BR.dayInfo(BR.S.day), w = clock >= 12 ? d.pm : d.am, wv = DIRS[w.from];
    const ww = Math.min(1, w.mph / 9), th = BR.thermal(clock, area), tw = 1 - ww * 0.6;
    let x = -wv[0] * ww, y = -wv[1] * ww + (th === 'down' ? 1 : -1) * tw;
    const m = Math.hypot(x, y) || 1;
    return { x: x / m, y: y / m, from: w.from, mph: w.mph, thermal: th };
  };
  BR.compass = (x, y) => {
    const a = (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360;
    return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(a / 45) % 8];
  };
  BR.conditions = () => {
    const d = BR.dayInfo(BR.S.day), w = BR.S.clock >= 12 ? d.pm : d.am;
    return { rut: d.rut, rutLevel: d.rutLevel, from: w.from, mph: w.mph, sky: d.sky };
  };
})();

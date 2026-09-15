// Storyboard frames draw animals with the game's own sprites, so the board shows exactly what's in the build.
(function () {
  const X = window.PX, SPR = window.BR.SPR;
  X.elk = (g, x, y, s, dir, o) => { o = o || {}; SPR.draw(g, SPR.get({ sp: 'elk', sex: o.bull ? 'bull' : 'cow', pts: o.points || 6 }, o.headDown ? 'feed' : 'stand', s / 2.6, { flip: dir < 0 }), x, y + 6 * s); };
  X.moose = (g, x, y, s, dir) => SPR.draw(g, SPR.get({ sp: 'moose', sex: 'bull', spread: 50, brows: 3 }, 'stand', s / 2.6, { flip: dir < 0 }), x, y + 7 * s);
  X.wolf = (g, x, y, s, dir) => SPR.draw(g, SPR.get({ sp: 'wolf', sex: 'wolf' }, 'walk', s * 0.6, { flip: dir < 0 }), x, y);
  X.bear = (g, x, y, s, dir) => SPR.draw(g, SPR.get({ sp: 'griz', sex: 'bear' }, 'walk', s * 0.5, { flip: dir < 0 }), x, y);
})();

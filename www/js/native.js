// Bugle Ridge — native mode, the easter egg. Unlocked by finishing the trail with every tag filled on the first shot
// (no misses, no lost animals, nothing illegal). No rifle, no boots, no wind checker: a loincloth and a knife.
// Get within 10 yards of a Montana grizzly without being winded, heard or seen, and he's yours.
(function () {
  const BR = window.BR;
  BR.KNIFE_YD = 10;

  BR.startNative = () => {
    const S = BR.S, idx = BR.CHAPTERS.findIndex(c => c.id === 'montana');
    S.native = S.native || { tries: 0, won: 0 };
    S.native.tries++;
    Object.assign(S, { chapter: idx, day: 1, seed: (Date.now() % 1000003) | 0, clock: 7 + Math.random() * 1.5, part: 'morning', camp: null, tag: null, over: false, verdict: null, events: [] });
    const ch = BR.ch(), area = ch.areas.find(a => a.bear) || ch.areas[0];
    S.enc = {
      area: area.id, native: true, seed: (Date.now() % 100003) | 0,
      target: { x: 50 + Math.random() * 140, dist: 230 + Math.random() * 160, animals: [{ a: { sp: 'griz', sex: 'bear' }, hideAt: S.clock + 2.5 }] }
    };
    BR.save();
    BR.go('plan');
  };

  BR.scenes.native = {
    enter() { this.hud(); },
    draw(g) {
      BR.campArt(g, 'night');
      BR.person(g, 'sam', 'sit', 112, 275, 1.35);
      BR.person(g, 'native', 'crouch', 206, 278, 1.2, true);
    },
    hud() {
      const S = BR.S, n = S.native || {};
      BR.hud(`
        <div class="row"><span class="t hi">NATIVE MODE</span><span class="dim">${n.tries ? `Tries ${n.tries}` : 'Montana · grizzly'}</span></div>
        <div class="quote">“Every animal on one shot,” Sam says. “Your great-grandad claimed he killed a grizzly with a knife. Nobody believed him either.”</div>
        <div class="tagline">No rifle, no boots, no wind checker. A loincloth and a knife. Get within ${BR.KNIFE_YD} yards of the grizzly and he’s yours.</div>
        <div class="sp"></div>
        ${BR.btn('go', 'Strip down and go', 'go')}
        ${BR.btn('fire', 'Stay by the fire')}`);
    },
    act(a) { if (a === 'go') BR.startNative(); else this.back(); },
    back() { BR.S.enc = null; BR.go('finale'); }
  };

  const LINES = {
    won: [null, 'You walk into camp in a loincloth dragging a grizzly hide. Sam doesn’t say anything for a full minute. “Well,” he says. “I owe your great-grandad an apology.”'],
    bust: {
      scent: ['He swung his nose into the wind, stood up, and popped his jaws. The false charge stopped at eight yards. You were not wearing pants for it.'],
      noise: ['Bare feet or not, something cracked. He woofed, came at you, and pulled up short before crashing off into the timber.'],
      movement: ['He caught you moving. He bluffed hard, veered off at the last second, and was gone.']
    },
    gone: ['He fed over the rise and into the timber. The berries were better somewhere else.'],
    left: ['You backed out and walked home barefoot. Everyone at camp pretends not to notice.']
  };

  BR.scenes.nativeEnd = {
    enter(o) {
      const S = BR.S;
      this.o = o || { kind: 'gone' };
      if (this.o.kind === 'won' && !this.o.counted) { this.o.counted = true; S.native.won++; BR.log('nativeWin', { yd: this.o.yd }); }
      S.enc = null; S.sceneArgs = this.o;
      BR.save();
      this.hud();
    },
    draw(g) {
      const k = this.o.kind;
      if (k === 'left') BR.campArt(g, 'evening');
      else g.drawImage(BR.archery.meadowBg(false, 'breaks'), 0, 0);
      if (k === 'won') {
        BR.SPR.draw(g, BR.SPR.get({ sp: 'griz', sex: 'bear' }, 'dead', 1.1), 150, 292);
        BR.person(g, 'native', 'crouch', 72, 292, 1.2);
      } else if (k === 'bust') {
        BR.SPR.draw(g, BR.SPR.get({ sp: 'griz', sex: 'bear' }, 'charge', 1.2, { flip: true }), 160, 280);
        BR.person(g, 'native', 'crouch', 58, 290, 1.2);
      } else BR.person(g, 'native', 'crouch', k === 'left' ? 206 : 120, k === 'left' ? 278 : 290, 1.2, k === 'left');
    },
    hud() {
      const o = this.o, won = o.kind === 'won';
      const lines = won ? [`${o.yd} yards. He never knew you were there.`, LINES.won[1]] : o.kind === 'bust' ? LINES.bust[o.cause] || LINES.bust.movement : LINES[o.kind] || LINES.gone;
      BR.hud(`
        <div class="row"><span class="t ${won ? 'ok' : 'bad'}">${won ? 'GRIZZLY · WITH A KNIFE' : o.kind === 'bust' ? 'BUSTED' : 'NO GRIZZLY'}</span><span class="dim">${o.yd ? o.yd + ' yd' : ''}</span></div>
        <div class="list">${lines.map(l => `<div class="quote">${BR.esc(l)}</div>`).join('')}</div>
        <div class="sp"></div>
        <div class="g2">${BR.btn('again', won ? 'Another bear' : 'Try again', 'go')}${BR.btn('fire', 'Back to the fire')}</div>`);
    },
    act(a) { if (a === 'again') BR.startNative(); else this.back(); },
    back() { BR.go('finale'); }
  };
})();

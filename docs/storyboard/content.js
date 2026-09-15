// Bugle Ridge campaign board: chapter boards, difficulty ramp, tag cards.
(function () {
  const CH = [
    {
      id: 'ch1', num: 'Chapter 1 · September', name: 'Colorado', sub: 'Archery rut · over-the-counter tag',
      pitch: 'The built chapter, rebalanced. Early-season bulls answer, so this is where you learn wind, thermals, pins, and the lead cow. The last two days show a preview of what’s coming: pressured bulls go quiet after opening weekend.',
      frame: 'Sunrise on the north bench. An aspen branch cuts across the lane to a 5×5 at 34 yd. First blocked-shot lesson: wait one step.',
      law: 'Either-sex archery tag. Legal light is 30 min before sunrise to 30 min after sunset, and a shot at 7:14 PM when legal light ended at 7:12 is a violation.',
      threat: 'Other bowhunters. A “bull” bugling back from the next ridge is a guy with a tube, and he walks into your setup.',
      harder: 'Days 1–3 bulls are vocal. Days 4–7 are pressured: they answer once, then go silent and circle.',
      mech: 'Blocked-shot lesson, bull types, hike mode, sun-glare contrast.',
      gear: '55-lb Scout → 62-lb Talon · wind checker · rangefinder',
      hank: '“He told you where he was. Now he’s telling you he’s done talking. Go find him.”'
    },
    {
      id: 'ch2', num: 'Chapter 2 · October', name: 'Colorado', sub: '2nd rifle · you drew a cow tag',
      pitch: 'The rut is over and it’s snowing. Your license is antlerless only. Bulls will walk past you all week, and shooting one ends the season. The point is patience, and picking the right cow.',
      frame: 'First snow in a park at 280 yd. A 6×6 steps out broadside with the cows. Your tag says cow. Crosshairs on the bull turn the reticle red.',
      law: 'Antlerless tag. A bull, even a spike with 3-inch antlers, is a violation. Hunter orange is required. Shoot a mature cow, not the calf beside her; Hank will ask.',
      threat: 'Orange dots everywhere. Road hunters push the herd into dark timber by 8 AM on opening day.',
      harder: 'Post-rut elk barely answer calls. A cow call only stops one for a second. Fresh snow makes tracking easy, and makes your noise loud.',
      mech: 'Rifles: cartridge drop, holdover, shooting sticks, legal-animal check, tracking in snow.',
      gear: '.30-06 → 6.5 Creedmoor · 3–12× scope · orange vest · shooting sticks',
      hank: '“Every bull that walks past is a free lesson. Shoot the old lead cow and you’ll eat better than the guy with the horns.”'
    },
    {
      id: 'ch3', num: 'Chapter 3 · September–October', name: 'Idaho', sub: 'Wolf country · river breaks',
      pitch: 'Steep country and quiet elk. Wolves have taught these herds to bunch up in timber, keep moving, and stay silent. Calls mostly don’t work. Glassing at first light and still-hunting timber do.',
      frame: 'Across a canyon at dawn: a bunched herd in timber, a wolf crossing the open slope above them. The rangefinder reads 412 yd at −28°.',
      law: 'Zone tag. It’s good on your side of the ridge only, and the herd feeds across the boundary at 9 AM. Optional wolf tag.',
      threat: 'Wolves. Howls blow out a basin for the day. Meat left overnight gets found. Hank’s knee is gone, so he’s on the radio.',
      harder: 'Call-shy herds. Steep shot angles (range what the arrow sees, not the slope). Canyon thermals swirl twice a day. Brushy draws block half your lanes.',
      mech: 'Angle-compensated range, zone boundaries, wolf behavior, brush deflection, radio check-ins with Hank.',
      gear: 'Angle rangefinder · 7mm PRC · suppressor · frame pack · 70-lb Apex',
      hank: '(radio) “If they ain’t talking, they ain’t gonna talk. Get above that timber before the sun does.”'
    },
    {
      id: 'ch4', num: 'Chapter 4 · October–November', name: 'Montana', sub: 'Public land · pressure · grizzlies',
      pitch: 'Big open breaks with little cover and lots of other hunters. Pressure pushes elk onto private ground by sunup. Access is its own puzzle, and in the southwest, grizzlies find kills fast.',
      frame: 'Evening in the breaks. A bull on the far coulee edge at 460 yd, crosswind. A pickup’s dust on the two-track behind him. The dial turret is set for 460.',
      law: 'General tag with a brow-tined bull rule in this district. Block Management land means you sign in, and some areas are walk-in only. A shoulder-season cow tag is good on private land, with permission.',
      threat: 'Grizzlies at the kill: hang meat 100+ yd away and come back upwind. A grizzly only ever false-charges, but it costs you a day. Other hunters bump your stalk.',
      harder: 'Elk go nocturnal onto private ground. Stalks are long with thin cover and crosswind approaches. 400+ yd tests your discipline. Pack-outs run 5+ miles.',
      mech: 'Access permissions, brow-tine judging through the spotter, grizzly kill-site loop, other-hunter AI, multi-day pack-out.',
      gear: '.300 Win Mag or dial turret · 15×56 on tripod · bear spray · game bags',
      hank: '(sat messenger) “Elk went where the guns ain’t. Find the pocket nobody walks to.”'
    },
    {
      id: 'ch5', num: 'Chapter 5 · September', name: 'Alaska', sub: 'Moose on a float hunt',
      pitch: 'The finale, and the hardest decision in the game: is he legal? You have a raft, a pickup date, 700 lb of meat, and weather that doesn’t care about your schedule. Hank rides along one last time.',
      frame: 'Willow flats at dusk. A bull moose grunts back across the slough. His spread looks like 50", maybe 48". Count the brow tines.',
      law: 'Legal bull: a 50" spread or 4+ brow tines on one side. No hunting the same day you fly in. In many units the meat must stay on the bone until it’s out of the field. Evidence of sex stays attached.',
      threat: 'Grizzlies on the kill (false charges cost a day). River crossings with a loaded raft. Weather pins the floatplane, so meat has to keep for days.',
      harder: 'Judging a legal bull (misjudge and you lose the season). Moose calling: cow grunts, raking, patience measured in hours. Moving 700 lb of meat.',
      mech: 'Antler judging, float timeline, meat care and spoilage, camp electric fence, weather days.',
      gear: '.338 Win Mag · 600-gr arrows · raft · meat bags · electric fence',
      hank: '“Brows first. Spread lies to you on the water. Brows don’t.”'
    },
    {
      id: 'ch6', num: 'Epilogue', name: 'The fire', sub: 'Grandpa Sam’s hunt',
      pitch: 'Back in Colorado, with some grey in your beard. Your grandfather Sam, who hunted this country with Hank decades ago, wants one more elk season. His legs are slow and his eyes are good. You pick the ground, the camp and the shot he can make. At night you give the debrief. Replayable after the campaign.',
      frame: 'Night camp. You sit where Hank sat, with Hank’s mug. Grandpa Sam sits across the fire with his old .30-06 across his knees.',
      law: 'Sam’s tag, your call. The same rules apply to him: an illegal animal ends the season, a wounded one costs the day.',
      threat: 'Old legs on the steep stuff. Plan hunts he can walk, and a shot he can make.',
      harder: 'Reverse debrief: pick the one thing that went wrong on Sam’s hunt. Get it right and he does better the next day.',
      mech: 'Guide mode, the reverse debrief, free-play for any unlocked state.',
      gear: 'Hank’s old mug. Sam’s .30-06, the one you started with.',
      hank: 'Sam: “Hank used to say that exact thing.”'
    }
  ];

  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  document.getElementById('chapters').innerHTML = CH.map(c => `
    <article class="chap">
      <figure class="frame"><canvas id="${c.id}" width="240" height="320" aria-label="${esc(c.frame)}"></canvas><figcaption>${esc(c.frame)}</figcaption></figure>
      <div>
        <div class="chap-head"><span class="chap-num">${c.num}</span><h3>${c.name}</h3><span class="sub">${c.sub}</span></div>
        <p class="pitch">${esc(c.pitch)}</p>
        <dl class="beats">
          <div class="beat law"><dt>Tag &amp; law</dt><dd>${esc(c.law)}</dd></div>
          <div class="beat threat"><dt>New threat</dt><dd>${esc(c.threat)}</dd></div>
          <div class="beat harder"><dt>Harder elk</dt><dd>${esc(c.harder)}</dd></div>
          <div class="beat"><dt>New in play</dt><dd>${esc(c.mech)}</dd></div>
          <div class="beat wide"><dt>Gear</dt><dd>${esc(c.gear)}</dd></div>
          <div class="beat wide"><dt>At the fire</dt><dd class="hank">${esc(c.hank)}</dd></div>
        </dl>
      </div>
    </article>`).join('');

  // difficulty dials, 0–5 per chapter (CO arch, CO rifle, ID, MT, AK, epilogue)
  const RAMP = [
    ['Elk wariness', 'How fast the lead cow pins you', [1, 2, 3, 4, 3, 2], ''],
    ['Call-shy', 'How often calls push elk away', [1, 4, 4, 3, 2, 1], 'blue'],
    ['Hunting pressure', 'Other hunters bumping elk', [2, 5, 2, 5, 1, 2], ''],
    ['Wind complexity', 'Thermal swirl, gusts, canyons', [2, 2, 5, 3, 3, 2], 'blue'],
    ['Shot obstacles', 'Brush, angles, arrow arc', [1, 2, 4, 3, 3, 2], 'blue'],
    ['Predators', 'Wolves, grizzlies', [0, 0, 4, 4, 5, 0], 'red'],
    ['Tag complexity', 'What the license lets you shoot', [1, 3, 4, 4, 5, 3], ''],
    ['Pack-out', 'Miles × pounds', [1, 2, 3, 4, 5, 1], '']
  ];
  const names = ['CO arch', 'CO rifle', 'Idaho', 'Montana', 'Alaska', 'Epilogue'];
  const pips = (n, cls) => `<span class="pips ${cls}" aria-label="${n} of 5">${[0, 1, 2, 3, 4].map(i => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</span>`;
  document.getElementById('ramp').innerHTML =
    `<thead><tr><th>Dial</th>${names.map(n => `<th class="ch">${n}</th>`).join('')}</tr></thead><tbody>` +
    RAMP.map(([d, s, v, cls]) => `<tr><td class="dial">${d}<small>${s}</small></td>${v.map(n => `<td>${pips(n, cls)}</td>`).join('')}</tr>`).join('') +
    '</tbody>';

  const TAGS = [
    ['Antlerless', 'Cow tag, bulls everywhere', 'The big bull steps out first. Your crosshairs turn red on anything with antlers.', 'Shoot a bull: season over'],
    ['Antler rule', '4-point or brow-tined bull', 'A raghorn with 3 points on one side isn’t legal. Count through the glass before you shoot.', 'Sub-legal bull: season over'],
    ['Zone / unit', 'Tag good on one side of the ridge', 'The boundary shows on your map. Elk don’t care about it, and following them across doesn’t make it legal.', 'Wrong zone: season over'],
    ['Legal light', '30 min before sunrise to 30 min after sunset', 'The HUD clock turns amber 5 minutes before legal light ends and red after.', 'After legal light: season over'],
    ['Access', 'Block Management · private land', 'Sign in at the box. Some ground is walk-in only. Permission covers that ranch, not the neighbor’s.', 'Trespass: season over'],
    ['Moose', '50" or 4 brow tines', 'Spread is hard to judge on water. Brow tines don’t lie. Same-day-airborne: no hunting the day you fly in.', 'Sub-legal moose: season over'],
    ['Meat & evidence', 'Salvage rules', 'All edible meat comes out. Evidence of sex stays attached. In some units, meat on the bone until out of the field.', 'Wanton waste: season over'],
    ['Wolf tag', 'Optional, Idaho & Montana', 'Carry the tag and a wolf crossing the park is legal game. Buy one for grizzly country too, where the unit allows it.', 'No tag: season over']
  ];
  document.getElementById('tags').innerHTML = TAGS.map(([type, h, p, cost]) =>
    `<div class="tag"><span class="type">${type}</span><h4>${esc(h)}</h4><p>${esc(p)}</p><span class="cost">${esc(cost)}</span></div>`).join('');
})();

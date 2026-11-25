/* ================= MACHHAR MAARO · ROUND 9 · 300 LEVELS PER CHARACTER =================
   20 worlds x 15 = 300 levels for every character.
   8 new mission types (28 in total) + level twists so nights do not feel repeated.
========================================================================================= */
R9.MAXL = 300;
/* ---------- new mission types ---------- */
Object.assign(TASKS, {
  golden: { icon: '✨', name: 'Golden Hunt' }, chain: { icon: '⚡', name: 'Double Trouble' }, facesafe: { icon: '😴', name: 'Guard the Face', timed: true },
  rush: { icon: '🏃', name: 'Rush Hour', timed: true }, giant: { icon: '🦣', name: 'Big Boys' }, tiny: { icon: '🐜', name: 'Tiny Terrors' },
  crescendo: { icon: '📈', name: 'Midnight Rush', timed: true }, storm: { icon: '🌪️', name: 'Storm Night', timed: true }
});
R9.NEWT = ['golden', 'chain', 'facesafe', 'rush', 'giant', 'tiny', 'crescendo', 'storm'];
R9.TWIST = {
  fast: { i: '⚡', t: 'Fast mosquitoes' }, swarm: { i: '🦟', t: 'Bigger swarms' }, heavy: { i: '🛡️', t: 'Every mosquito takes 2 hits' },
  gusts: { i: '🌬️', t: 'Wind gusts push mosquitoes' }, flicker: { i: '💡', t: 'Lights keep flickering' }
};
/* ---------- extra worlds ---------- */
(function () {
  const NAMES = [
    ['Monsoon Bedroom', '🌧️'], ['Harvest Village', '🌾'], ['Exam Hostel', '📚'], ['Sangeet Night', '🎶'], ['Royal Court', '🏰'],
    ['Summer Bedroom', '☀️'], ['Diwali Village', '🪔'], ['Hostel Fest', '🎸'], ['Mehendi Night', '🌿'], ['Mosquito Fortress', '⚔️'],
    ['Winter Bedroom', '❄️'], ['Holi Village', '🎨'], ['Final Exams', '🧪'], ['Grand Wedding', '💍'], ['Emperor\'s Palace', '👑']
  ];
  const STORIES = ['The mosquitoes are back, stronger than ever…', 'A new season, a new army…', 'They learned from every night you won…', 'Tonight they come from every window…'];
  for (let i = 0; i < 15; i++) { const base = WORLDS[i % 5]; WORLDS.push(Object.assign({}, base, { name: NAMES[i][0], icon: NAMES[i][1], tier: 'expert', story: STORIES })); }
  const PLAN2 = [
    ['golden', 'kill', 'chain', 'facesafe', 'boss', 'rush', 'survive', 'giant', 'air', 'boss', 'tiny', 'crescendo', 'hunt', 'storm', 'boss'],
    ['chain', 'nobite', 'golden', 'combo', 'boss', 'giant', 'dark', 'tiny', 'rush', 'boss', 'multi', 'facesafe', 'waves', 'crescendo', 'boss'],
    ['tiny', 'storm', 'limzap', 'golden', 'boss', 'facesafe', 'timeattack', 'chain', 'rani', 'boss', 'rush', 'jugnu', 'giant', 'score', 'boss'],
    ['crescendo', 'giant', 'swipe', 'chain', 'boss', 'golden', 'sleepwalk', 'storm', 'limbat', 'boss', 'tiny', 'powercut', 'facesafe', 'rush', 'boss'],
    ['rush', 'golden', 'collect', 'tiny', 'boss', 'crescendo', 'air', 'facesafe', 'chain', 'boss', 'storm', 'nobite', 'giant', 'waves', 'boss']
  ];
  const TW = Object.keys(R9.TWIST), seeded2 = typeof seeded === 'function' ? seeded : (s => () => ((s = (s * 16807) % 2147483647) / 2147483647));
  let bi = 0;
  for (let w = 5; w < 20; w++) for (let p = 1; p <= 15; p++) {
    const n = w * 15 + p, r = seeded2(n * 13 + 7), task = PLAN2[(w - 5) % 5][p - 1];
    const wc = 4 + (w - 4) * 0.35; // targets grow slowly after world 5
    const L = { n, w, p, task, diff: Math.min(2.5, 2.0 + (w - 5) * 0.025 + p * 0.004), tier: 'expert', huntType: LEVELS[74].huntType };
    if (task === 'boss') { L.boss = BOSS_ORDER[bi++ % BOSS_ORDER.length]; L.bossHpK = Math.min(1.6, 1 + (w - 4) * 0.05); }
    switch (task) {
      case 'survive': case 'dark': case 'multi': case 'powercut': case 'facesafe': case 'storm': L.len = Math.round(44 + wc * 4); break;
      case 'crescendo': L.len = 60; break;
      case 'sleepwalk': L.len = 48; break;
      case 'nobite': L.len = Math.round(42 + wc * 3); L.maxBites = 3; break;
      case 'kill': case 'giant': case 'tiny': L.target = Math.round(30 + p + wc * 9); break;
      case 'rush': L.target = Math.round(28 + wc * 6); L.len = 40; break;
      case 'golden': L.target = Math.round(8 + wc); break;
      case 'chain': L.target = Math.round(6 + wc); break;
      case 'air': L.target = Math.round(18 + p + wc * 4); break;
      case 'combo': L.target = Math.round(18 + wc * 4); L.len = 45; break;
      case 'hunt': L.target = Math.round(10 + wc * 2); break;
      case 'limbat': L.target = Math.round(22 + wc * 4); break;
      case 'limzap': L.target = Math.round(22 + wc * 4); L.zaps = Math.round(L.target * 1.55); break;
      case 'rani': L.target = 5; L.len = 45; break;
      case 'timeattack': L.target = Math.round(28 + wc * 6); L.len = 30; break;
      case 'score': L.target = Math.round(12000 + wc * 2000); L.len = 40; break;
      case 'waves': L.target = 5; break;
      case 'swipe': L.target = Math.round(32 + wc * 6); break;
      case 'collect': L.target = Math.round(12 + wc); break;
      case 'jugnu': L.target = Math.round(30 + wc * 5); break;
    }
    const keys = Object.keys(STAR_OBJ).filter(k => !(task === 'nobite' && k === 'bites5') && !(task === 'air' && k === 'air10') && !(task === 'combo' && k === 'combo15'));
    const a = keys[Math.floor(r() * keys.length)]; let b; do { b = keys[Math.floor(r() * keys.length)]; } while (b === a);
    L.stars = [a, b]; L.story = WORLDS[w].story[Math.floor(r() * WORLDS[w].story.length)];
    if (task !== 'boss') L.r9tw = TW[Math.floor(r() * TW.length)];
    LEVELS.push(L);
  }
  // twists from Level 16: every other normal level
  LEVELS.forEach(L => { if (L.n >= 16 && L.n <= 75 && L.task !== 'boss' && L.n % 2 === 0) L.r9tw = TW[L.n % TW.length]; });
  // a few of the new missions inside worlds 2-5 too, so early nights also feel fresh
  const swap = { 17: 'golden', 23: 'chain', 29: 'giant', 33: 'facesafe', 38: 'tiny', 44: 'rush', 48: 'crescendo', 52: 'storm', 58: 'golden', 63: 'chain', 67: 'giant', 71: 'storm' };
  for (const k in swap) { const L = LEVELS[k - 1]; if (!L || L.task === 'boss') continue; const t = swap[k]; L.task = t; delete L.len; delete L.target; delete L.maxBites;
    if (['facesafe', 'storm'].includes(t)) L.len = 40 + L.w * 5; else if (t === 'crescendo') L.len = 55; else if (t === 'rush') { L.target = 22 + L.w * 6; L.len = 40; } else if (t === 'golden') L.target = 6 + L.w; else if (t === 'chain') L.target = 5 + L.w; else L.target = 28 + L.w * 8; }
})();

/* ---------- goals, progress, win / lose ---------- */
(function () {
  const _gt = window.goalText;
  window.goalText = function (L) {
    const who = (typeof CW !== 'undefined' && CW && CW.who) || 'them';
    switch (L.task) {
      case 'golden': return `Catch ${L.target} golden mosquitoes before they fly away`;
      case 'chain': return `Get ${L.target} double kills (2 mosquitoes in one swing)`;
      case 'facesafe': return `${L.len} seconds. One bite on the face and you fail`;
      case 'rush': return `Rush hour! Swat ${L.target} fast mosquitoes in ${L.len} seconds`;
      case 'giant': return `Swat ${L.target} big mosquitoes. Each one takes 2 hits`;
      case 'tiny': return `Swat ${L.target} tiny, super fast mosquitoes`;
      case 'crescendo': return `Keep ${who} asleep for ${L.len} seconds. It gets crazier every second`;
      case 'storm': return `Keep ${who} asleep for ${L.len} seconds through the storm`;
    }
    return _gt.apply(this, arguments);
  };
  const _pr = window.progress;
  window.progress = function () {
    const st = G.st;
    switch (CL.task) {
      case 'golden': return { cur: st.r9g || 0, max: CL.target, txt: `✨ ${Math.min(st.r9g || 0, CL.target)} / ${CL.target} golden` };
      case 'chain': return { cur: st.r9c || 0, max: CL.target, txt: `⚡ ${Math.min(st.r9c || 0, CL.target)} / ${CL.target} doubles` };
      case 'rush': case 'giant': case 'tiny': return { cur: G.kills, max: CL.target, txt: `🦟 ${Math.min(G.kills, CL.target)} / ${CL.target}` };
      case 'facesafe': return { cur: G.t, max: CL.len, txt: `😴 Face bites: ${st.faceBites} / 0` };
    }
    return _pr.apply(this, arguments);
  };
  const _cg = window.checkGoal;
  window.checkGoal = function () {
    const t = CL.task;
    if (R9.NEWT.includes(t)) {
      if (t === 'facesafe' && G.st.faceBites > 0) return failLevel('FACE BITTEN! 😫', 'Guard the face first, chase later');
      const p = progress();
      if (['golden', 'chain', 'rush', 'giant', 'tiny'].includes(t) && p.cur >= p.max) return winLevel();
      if (CL.len && G.t >= CL.len) { if (['facesafe', 'crescendo', 'storm'].includes(t)) return winLevel(); return failLevel('TIME UP! ⏰', `Only ${p.max - p.cur} to go!`); }
      return;
    }
    return _cg.apply(this, arguments);
  };
})();
/* ---------- mechanics ---------- */
(function () {
  const _sp = window.spawnMosq;
  window.spawnMosq = function (type, x, y, extra) {
    const t = CL && CL.task;
    if (t === 'tiny' && (type === 'normal' || !type)) type = 'bachcha';
    const m = _sp.call(this, type, x, y, extra); if (!m) return m;
    if (t === 'giant' && !m.boss) { m.size = (m.size || 1) * 1.45; m.hp = Math.max(2, (m.hp || 1) + 1); }
    if (t === 'tiny' && m.sp) m.sp *= 1.25;
    if (t === 'rush' && m.sp) m.sp *= 1.3;
    const tw = CL && CL.r9tw;
    if (tw === 'fast' && m.sp) m.sp *= 1.15;
    if (tw === 'heavy' && !m.boss && (m.hp || 1) < 2) m.hp = 2;
    return m;
  };
  const _sm = HZ.spawnMul.bind(HZ);
  HZ.spawnMul = function () {
    let k = _sm(); if (!CL) return k;
    if (CL.task === 'rush') k *= 0.72;
    if (CL.task === 'crescendo' && CL.len) k *= Math.max(0.42, 1 - (G.t / CL.len) * 0.6);
    if (CL.r9tw === 'swarm') k *= 0.8;
    return k;
  };
  const _kill = window.kill;
  window.kill = function (m, how) {
    const was = m && m.dead, r = _kill.apply(this, arguments);
    if (m && !was && m.dead && state === 'play') {
      const now = performance.now();
      if (m.r9gold) { G.st.r9g = (G.st.r9g || 0) + 1; G.coins += 5; pop('✨ GOLDEN! +5', m.x, m.y - 30 * S, 20, '#e8c15a', 0.9); }
      if (CL.task === 'chain') { if (now - (G.r9lk || 0) < 550 && !G.r9inCh) { G.st.r9c = (G.st.r9c || 0) + 1; G.r9inCh = 1; pop('⚡ DOUBLE!', m.x, m.y - 40 * S, 24, '#7fd4ff', 0.9); } else if (now - (G.r9lk || 0) >= 550) G.r9inCh = 0; G.r9lk = now; }
    }
    return r;
  };
  const _bs = window.spawnBoss;
  window.spawnBoss = function () { const m = _bs.apply(this, arguments); if (m && CL && CL.bossHpK && !m.child) { m.hp = m.maxhp = Math.round(m.maxhp * CL.bossHpK); } return m; };
  const _sl = window.startLevel;
  window.startLevel = function () { const r = _sl.apply(this, arguments); G.r9gT = 1.5; G.r9wT = 6; G.r9fT = 8; G.r9lk = 0; G.r9inCh = 0; if (CL && CL.r9tw && state === 'play') setTimeout(() => { if (state === 'play') FEED.add(`${R9.TWIST[CL.r9tw].i} Twist: ${R9.TWIST[CL.r9tw].t}`); }, 1500); return r; };
})();
R9.lvTick = function (dt) {
  if (state !== 'play' || !CL) return;
  if (CL.task === 'golden') {
    G.r9gT -= dt; if (G.r9gT <= 0) { G.r9gT = 2.4 + Math.random(); const m = spawnMosq('normal', Math.random() < 0.5 ? -20 * S : W + 20 * S, H * (0.25 + Math.random() * 0.35)); if (m) { m.r9gold = 4.5; if (m.sp) m.sp *= 1.2; } }
    for (const m of G.mosq) if (m.r9gold && !m.dead) { m.r9gold -= dt; if (m.r9gold <= 0) { m.dead = true; pop('flew away 💨', m.x, m.y - 20 * S, 14, '#d9ccff', 0.7); } }
  }
  if (CL.task === 'storm' || CL.r9tw === 'gusts') { G.r9wT -= dt; if (G.r9wT <= 0) { G.r9wT = 6 + Math.random() * 3; G.fx.ulta = 1.6; pop('🌬️ GUST!', W / 2, H * 0.32, 26, '#fff', 0.8); for (const m of G.mosq) if (!m.dead && !m.boss) { m.vx = (m.vx || 0) + (Math.random() < 0.5 ? -1 : 1) * 260 * S; } } }
  if (CL.r9tw === 'flicker') { G.r9fT -= dt; if (G.r9fT <= 0) { G.r9fT = 8 + Math.random() * 4; G.fx.dark = 1.8; } }
};
(function () {
  let last = performance.now();
  const _dr = window.drawRacket;
  window.drawRacket = function () {
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
    try {
      R9.lvTick(dt);
      if (state === 'play') for (const m of G.mosq) if (m.r9gold && !m.dead) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(m.x, m.y, 2, m.x, m.y, 30 * S); g.addColorStop(0, 'rgba(255,215,120,.85)'); g.addColorStop(1, 'rgba(255,215,120,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(m.x, m.y, 30 * S, 0, 7); ctx.fill(); ctx.restore(); }
    } catch (e) { }
    return _dr.apply(this, arguments);
  };
})();
/* twist chip on the level card */
(function () {
  const _si = window.showIntro;
  window.showIntro = function (n) {
    const r = _si.apply(this, arguments);
    const L = LEVELS[n - 1], b = $('iStart');
    const anchor = document.querySelector('#intro .icBst') || (b && b.parentElement);
    if (L && L.r9tw && anchor && state === 'intro' && !document.querySelector('.r9Tw')) { const d = document.createElement('div'); d.className = 'r9Tw'; d.innerHTML = `<b>${R9.TWIST[L.r9tw].i} TWIST</b> ${R9.TWIST[L.r9tw].t}`; anchor.before(d); }
    return r;
  };
})();
R7.css(`
.r9Tw,.r9NewM{margin:8px 0 2px;padding:8px 12px;border-radius:14px;font:600 12.5px/1.35 Inter,sans-serif;text-align:left;color:#fff;background:rgba(127,212,255,.12);border:1px solid rgba(127,212,255,.45)}
.r9Tw b,.r9NewM b{font-weight:900;color:#7fd4ff;margin-right:4px}.r9NewM{background:rgba(154,109,245,.18);border-color:#9a6df5}.r9NewM b{color:#cbb8ff;display:block}
`);

/* START button always visible: sticky dock at the bottom of the level card (small phones, long cards) */
R7.css(`
#introCard .iGo{position:sticky;bottom:0;z-index:3;margin:12px -14px -14px;padding:14px 14px 14px;border-radius:0 0 22px 22px;background:#24106a}
#introCard .iGo::before{content:'';position:absolute;left:0;right:0;top:-22px;height:22px;background:linear-gradient(180deg,rgba(36,16,106,0),#24106a);pointer-events:none}
body.bnr #introCard .iGo{bottom:0}
@media (max-height:780px){#introCard{padding:12px 12px 12px}#introCard .iGo{margin:8px -12px -12px;padding:12px}.iGoal{font-size:14.5px!important;margin-top:6px!important}#introCard .r9Tw{margin:6px 0 0;padding:6px 10px}}
`);

/* CLEAN level card: fewer boxes, one clear hero, chips instead of tiles, START always visible */
R9.cleanIntro = function () {
  const c = document.getElementById('introCard'); if (!c || c.querySelector('.r9Hd')) return;
  const q = s => c.querySelector(s), top = q('.iTop'), hero = q('#iChar');
  if (!top || !hero) { c.classList.remove('r9Clean'); return; }
  c.classList.add('r9Clean');
  // header: character + world + hearts in ONE slim row
  const hd = document.createElement('div'); hd.className = 'r9Hd'; top.before(hd); hd.appendChild(hero);
  const side = document.createElement('div'); side.className = 'r9HdR';
  const tier = top.querySelector('.tier'), heart = top.querySelector('.iHeart'), kick = top.querySelector('.kick');
  if (tier) side.appendChild(tier); if (heart) side.appendChild(heart); hd.appendChild(side);
  const info = hero.querySelector('.icInfo'), nm = hero.querySelector('.icN');
  if (kick && nm) { const k = document.createElement('span'); k.className = 'r9Kick'; k.textContent = kick.textContent; nm.after(k); }
  const ms = [...hero.querySelectorAll('.icM')].map(m => (m.querySelector('small') || {}).textContent + ' ' + (m.querySelector('b') || {}).textContent);
  if (info && ms.length) { const m = document.createElement('span'); m.className = 'r9Meta'; m.textContent = ms.join('  ·  '); info.appendChild(m); }
  top.remove();
  // twist: a plain line right under the goal
  const tw = q('.r9Tw'), goal = q('.iGoal'); if (tw && goal) { tw.className = 'r9TwL'; goal.after(tw); }
  // hazards / army: small chips
  const row = q('.iRow'); if (row) row.classList.add('r9Chips');
  // star goals: no long list on the card, just a chip; details open on tap
  const st = q('.iStars');
  if (st && row) {
    const items = [...st.children].map(d => ({ ok: d.classList.contains('ok'), t: d.textContent.replace(/^[★☆]/, '').trim() }));
    const got = items.filter(x => x.ok).length;
    const b = document.createElement('button'); b.className = 'iTile'; b.id = 'r9StarB';
    b.innerHTML = `<span class="ie">${got ? '⭐' : '☆'}</span><b>${got}/${items.length} stars</b>`;
    b.onclick = () => sheet(`<div class="kick">EARN 3 STARS</div><div class="shList">${items.map(x => `<div>${x.ok ? '⭐' : '☆'} <b>${x.t}</b></div>`).join('')}</div>`);
    row.appendChild(b); st.remove();
  }
  // tough warning: one short line just above the boosters
  const w = q('.icWarn'), bst = q('.icBst'); if (w && bst) { w.innerHTML = '⚠️ <b>Tough level</b> · take a booster 👇'; bst.before(w); }
};
(function () {
  const _si = window.showIntro;
  window.showIntro = function (n) { const r = _si.apply(this, arguments); try { R9.cleanIntro(); } catch (e) { } return r; };
})();
R7.css(`
#introCard.r9Clean{padding:12px 14px 14px}
#introCard.r9Clean .r9Hd{display:flex;align-items:center;gap:8px;padding:6px 10px 6px 6px;border-radius:18px;background:rgba(10,4,30,.28)}
#introCard.r9Clean .icHero{flex:1;min-width:0;margin:0;padding:0;border:0;background:none;box-shadow:none;gap:10px}
#introCard.r9Clean .icPic{width:46px;height:46px;border-width:2px;box-shadow:0 0 12px rgba(154,109,245,.6)}
#introCard.r9Clean .icInfo{gap:1px}
#introCard.r9Clean .icN{font-size:15px}#introCard.r9Clean .icN i{margin-left:6px}
#introCard.r9Clean .icM,#introCard.r9Clean .icPd{display:none}
#introCard.r9Clean .r9Kick{font:800 9.5px Inter;letter-spacing:1.4px;text-transform:uppercase;color:#cbb8ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#introCard.r9Clean .r9Meta{font:600 10.5px Inter;color:rgba(255,255,255,.7);white-space:nowrap}
#introCard.r9Clean .r9HdR{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex:none}
#introCard.r9Clean .r9HdR .iHeart{margin:0}
#introCard.r9Clean .iLv{margin-top:16px}
#introCard.r9Clean .r9TwL{margin:8px 0 0;font:600 12.5px/1.35 Inter;color:#d8f1ff}#introCard.r9Clean .r9TwL b{color:#7fd4ff;font-weight:900;margin-right:4px}
#introCard.r9Clean .r9Chips{display:flex;justify-content:center;flex-wrap:wrap;gap:8px;margin-top:14px}
body #introCard.r9Clean .r9Chips .iTile{flex-direction:row;gap:6px;padding:7px 14px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(154,109,245,.55);box-shadow:none;font:800 12.5px Inter}
#introCard.r9Clean .r9Chips .iTile .ie{font-size:15px;line-height:1}#introCard.r9Clean .r9Chips .iTile .ie img{width:18px;height:18px;vertical-align:middle}
#introCard.r9Clean .r9Chips .iTile small{display:none}
#introCard.r9Clean .r9Chips .iTile .nw{position:static;margin-left:4px}
#introCard.r9Clean .iStars{flex-direction:row;flex-wrap:wrap;justify-content:center;gap:4px 14px;margin-top:14px}
#introCard.r9Clean .iStars div{padding:0;background:none;gap:4px;font:600 12px Inter;color:#cfc4f0}
#introCard.r9Clean .iStars .ok{background:none;color:#fff}
#introCard.r9Clean .icWarn{margin:14px 0 0;padding:0;border:0;background:none;animation:none;text-align:center;font:600 12px Inter;color:#ffb3c8}
#introCard.r9Clean .icBst{margin-top:8px}
#introCard.r9Clean .iGo{justify-content:center}
#introCard.r9Clean #iStart{padding:15px 10px;white-space:nowrap;display:flex;align-items:center;justify-content:center;gap:8px;text-align:center}
#introCard.r9Clean .iBest{margin-top:8px}
@media (max-height:740px){#introCard.r9Clean .iLv{margin-top:10px;font-size:30px!important}#introCard.r9Clean .r9Chips,#introCard.r9Clean .iStars,#introCard.r9Clean .icWarn{margin-top:10px}}
`);

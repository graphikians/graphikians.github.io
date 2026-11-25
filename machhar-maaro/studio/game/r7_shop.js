/* ================= MACHHAR MAARO · ROUND 7 · SHOP, BOOSTER, SAMAN, HERO, MUSHKIL LEVEL, BOSS =================
   - Shop ab 60 se 80 level mein khatam hogi (pehle 10 mein ho jaati thi)
   - 12 booster, 12 "ek level ka saman" (torch, machhardani, coil…), 12 ghar upgrade, 10 deals
   - Level 1 se 5 aasaan, 6 se asli khel · Boss 2.2X taakat + andhera (light dheere jaati, 3 sec andhera, dheere wapas)
   - 8 painted hero, har ek ki khaasiyat
================================================================================================= */
/* ---------- 1. keemat badhao ---------- */
RACKETS.forEach(r => { if (!r.price) return; r.price = r.cur === 'g' ? Math.round(r.price * 1.5) : Math.round(r.price * 2.6 / 50) * 50; });
const RK_IMG = { sasta: 'r_sasta', jaali: 'r_jaali', turbo: 'r_turbo', cricket: 'r_cricket', thunder: 'r_thunder', laser: 'r_laser', frost: 'r_frost', magnet: 'r_magnet', tesla: 'r_tesla', boomerang: 'r_boomerang', brahmastra: 'r_brahmastra', sanxai: 'r_sanxai' };
window.upCost = lv => Math.round(160 * Math.pow(1.6, lv));

/* ---------- 2. boosters: 12 ---------- */
BOOSTERS.length = 0;
BOOSTERS.push(
  { id: 'coil', icon: '🌀', img: 'p_coil', name: 'Coil', desc: 'Mosquitoes slow for the first 8 sec', price: 220 },
  { id: 'shield', icon: '🛡️', img: 'p_shield', name: 'Shield', desc: 'No bites for the first 8 sec', price: 280 },
  { id: 'battery', icon: '🔋', img: 'p_battery', name: 'Super Battery', desc: 'Battery 50% bigger', price: 260 },
  { id: 'mega', icon: '⚡', img: 'p_mega', name: 'Free Mega', desc: '3 free Mega Zaps', price: 340 },
  { id: 'x2', icon: '🪙', img: 'p_x2', name: 'Double Coins', desc: 'Double coins this level', price: 420 },
  { id: 'slow', icon: '🐌', img: 'p_slow', name: 'Slow Motion', desc: 'Mosquitoes very slow for 15 sec', price: 360 },
  { id: 'freeze', icon: '❄️', img: 'p_freeze', name: 'Freeze', desc: 'No new mosquitoes for the first 6 sec', price: 300 },
  { id: 'heart', icon: '💗', img: 'p_heart', name: 'Second Chance', desc: 'Saves the night once when sleep is about to break', price: 520 },
  { id: 'time', icon: '⏱️', img: 'p_time', name: 'Time Bonus', desc: '8 sec less on timed levels', price: 300 },
  { id: 'chain', icon: '🔗', img: 'p_chain', name: 'Combo Lock', desc: 'Combo will not break for 20 sec', price: 320 },
  { id: 'aim', icon: '🎯', img: 'p_aim', name: 'Auto Aim', desc: 'Racket 30% bigger for 20 sec', price: 380 },
  { id: 'rage', icon: '🔥', img: 'p_rage', name: 'Rage Mode', desc: 'Double damage for 15 sec (best for bosses)', price: 450 }
);
const BIMG = {}; BOOSTERS.forEach(b => BIMG[b.id] = b.img);
R7.BIMG = BIMG;

/* ---------- 3. ek level ka saman: 12 ---------- */
const SAMAN = [
  { id: 'torch', img: 'c_torch', name: 'Torch', desc: '10 sec of light in the dark', price: 180, fx: 'torch', d: 10 },
  { id: 'tent', img: 'c_tent', name: 'Mosquito Net', desc: 'No bites for 15 sec', price: 260, fx: 'shield', d: 15 },
  { id: 'coil', img: 'c_coil', name: 'Coil', desc: 'Mosquitoes slow for 12 sec', price: 160, fx: 'coil', d: 12 },
  { id: 'inverter', img: 'c_inverter', name: 'Inverter', desc: 'No power cuts for 25 sec', price: 300, fx: 'inv', d: 25 },
  { id: 'earplug', img: 'c_earplug', name: 'Earplugs', desc: 'Noise will not break sleep for 20 sec', price: 200, fx: 'ear', d: 20 },
  { id: 'cream', img: 'c_cream', name: 'Cream', desc: 'Instant 6 sec shield', price: 120, fx: 'shield', d: 6 },
  { id: 'mesh', img: 'c_mesh', name: 'Mesh', desc: 'Half the mosquitoes for 20 sec', price: 220, fx: 'mesh', d: 20 },
  { id: 'fan', img: 'c_fan', name: 'Turbo Fan', desc: 'Blows every mosquito away', price: 240, act: 'fan' },
  { id: 'cooler', img: 'c_cooler', name: 'Cooler', desc: 'Cools the racket + slows mosquitoes', price: 200, act: 'cooler' },
  { id: 'chai', img: 'c_chai', name: 'Chai', desc: 'Racket will not overheat for 12 sec', price: 140, fx: 'chai', d: 12 },
  { id: 'magnet', img: 'c_magnet', name: 'Magnet', desc: 'Double coins per mosquito for 20 sec', price: 260, fx: 'magnet', d: 20 },
  { id: 'pillow', img: 'c_pillow', name: 'Pillow', desc: 'Everyone\'s sleep +25%', price: 280, act: 'pillow' }
];
R7.SAMAN = SAMAN;

/* ---------- 4. ghar: 12 ---------- */
const GHAR_IMG = { jaali: 'g_jaali', pankha: 'g_pankha', cream: 'g_cream', tube: 'g_tube', powerbank: 'g_powerbank', net: 'g_net', cooler: 'g_cooler', ac: 'g_ac', inverter: 'g_inverter', killer: 'g_killer', tulsi: 'g_tulsi', door: 'g_door' };
GHAR.forEach(g => { g.price = g.cur === 'g' ? Math.round(g.price * 1.5) : Math.round(g.price * 2.4 / 50) * 50; });
GHAR.push(
  { id: 'cooler', icon: '💨', name: 'Air Cooler', desc: 'Mosquitoes always 5% slower', price: 7500, cur: 'c' },
  { id: 'ac', icon: '❄️', name: 'Split AC', desc: 'Mosquitoes 8% slower, deeper sleep', price: 160, cur: 'g' },
  { id: 'inverter', icon: '🔋', name: 'Inverter', desc: 'Power cuts last half as long', price: 9000, cur: 'c' },
  { id: 'killer', icon: '🔵', name: 'Mosquito Killer', desc: 'Zaps one mosquito every 15 sec', price: 220, cur: 'g' },
  { id: 'tulsi', icon: '🌿', name: 'Basil Plant', desc: 'Sleep breaks 5% slower', price: 6000, cur: 'c' },
  { id: 'door', icon: '🚪', name: 'Mesh Door', desc: '8% fewer mosquitoes', price: 11000, cur: 'c' }
);

/* ---------- 5. HERO: 8 painted ---------- */
const HEROES = [
  { id: 'hero', img: 'hr_hero', n: 'Super Hero', perk: 'Racket 6% bigger', un: 'free' },
  { id: 'heroine', img: 'hr_heroine', n: 'Super Heroine', perk: 'Battery charges 8% faster', un: 'free' },
  { id: 'ninja', img: 'hr_ninja', n: 'Ninja', perk: 'Racket overheats less', un: 'free' },
  { id: 'astro', img: 'hr_astro', n: 'Astronaut', perk: 'Mosquitoes 5% slower', un: 'free' },
  { id: 'jaadu', img: 'hr_jaadu', n: 'Magician', perk: '10% more coins', un: 'lv', v: 10 },
  { id: 'sher', img: 'hr_sher', n: 'Tiger', perk: 'Combos last longer', un: 'lv', v: 20 },
  { id: 'babbar', img: 'hr_babbar', n: 'Lion King', perk: '25% more damage to bosses', un: 'g', v: 60 },
  { id: 'robot', img: 'hr_robot', n: 'Robo Racket', perk: 'Battery 20% bigger', un: 'ad', v: 5 }
];
R7.HEROES = HEROES;
R7.hero = () => SV().hero || null;
R7.heroOwned = h => h.un === 'free' || SV().heroes[h.id] || (h.un === 'lv' && (SAVE.unlocked || 1) > h.v);
R7.perk = id => R7.hero() === id;
META.persona = function (cb) {
  const sv = SV(), cur = sv.hero || 'hero';
  const card = h => { const own = R7.heroOwned(h), lock = h.un === 'lv' ? `After Level ${h.v}` : h.un === 'g' ? `💎 ${h.v}` : h.un === 'ad' ? `📺 ${sv.heroAds}/${h.v} ad` : '';
    return `<button class="hrC ${h.id === cur ? 'sel' : ''} ${own ? '' : 'lock'}" data-hr="${h.id}"><img src="${R7.A(h.img)}" alt=""><b>${h.n}</b><small>${h.perk}</small>${own ? '' : `<em>${h.un === 'lv' ? '🔒 ' : ''}${lock}</em>`}</button>`; };
  this.modal(`<div class="kick">FIRST NIGHT SAVED! 🌙</div><div class="big" style="font-size:26px">PICK YOUR HERO</div><div class="sub">Every hero has a power · this hero shows on the leaderboard</div>
    <div class="hrGrid">${HEROES.map(card).join('')}</div>
    <input id="pName" class="pin2" placeholder="Hero name" maxlength="14" value="${SAVE.pname && SAVE.pname !== 'Player' ? SAVE.pname : ''}">
    <div class="chip" style="margin-top:8px">🎁 Hero reward: 💎 +3</div>`, 'HERO READY ⚡', () => {
    SAVE.pname = ($('pName') && $('pName').value.trim()) || SAVE.pname || 'Racket Hero'; sv.hero = sv.hero || 'hero'; SAVE.avatar = '🦸';
    if (!SAVE.heroDone) SAVE.gems = (SAVE.gems || 0) + 3; SAVE.heroDone = 1; RKC = null; save(); sfx.power(); cb && cb();
  });
  document.querySelectorAll('[data-hr]').forEach(b => b.onclick = () => {
    const h = HEROES.find(x => x.id === b.dataset.hr);
    if (!R7.heroOwned(h)) {
      if (h.un === 'g') { if (SAVE.gems < h.v) return toast(`You need 💎 ${h.v - SAVE.gems} more`); SAVE.gems -= h.v; sv.heroes[h.id] = 1; save(); REWARD.show({ img: h.img, kick: 'NEW HERO', t: h.n, sub: h.perk }); }
      else if (h.un === 'ad') { showAd(() => { sv.heroAds++; if (sv.heroAds >= h.v) { sv.heroes[h.id] = 1; REWARD.show({ img: h.img, kick: 'AD EXCLUSIVE HERO', t: h.n, sub: h.perk }); } save(); META.persona(cb); }); return; }
      else return toast(`🔒 Clear Level ${h.v}`);
    }
    sv.hero = h.id; RKC = null; save(); sfx.coin(); vib(10);
    document.querySelectorAll('[data-hr]').forEach(x => x.classList.toggle('sel', x === b)); b.classList.remove('lock'); const em = b.querySelector('em'); if (em) em.remove();
  });
  this.x('Identity / Ownership (Apna Hero)');
};

/* ---------- 6. stats wrapper: hero perks + booster ---------- */
(function () {
  const _rk = window.rkStats;
  window.rkStats = function (id) {
    const r = _rk(id);
    if (R7.perk('hero')) r.r *= 1.06; if (R7.perk('heroine')) r.regen *= 1.08;
    if (typeof G !== 'undefined' && G.fx && G.fx.aim > 0) r.r *= 1.3;
    return r;
  };
})();

/* ---------- 7. level shuru: boosters, hero, mushkil ---------- */
(function () {
  const _sl = window.startLevel;
  window.startLevel = function (n, boosts) {
    _sl.apply(this, arguments);
    const b = boosts || {};
    if (b.x2) G.r7x2 = 1; else G.r7x2 = 0;
    if (b.slow) G.fx.coil = Math.max(G.fx.coil || 0, 15);
    if (b.freeze) G.spawnT = 6;
    G.r7heart = b.heart ? 1 : 0;
    if (b.time && CL.len) G.t = 8;
    if (b.chain) G.fx.chain = 20;
    if (b.aim) { G.fx.aim = 20; RKC = null; }
    if (b.rage) G.fx.rage = 15;
    if (R7.perk('robot')) { G.batMax *= 1.2; G.bat = G.batMax; }
    if (CL.boss) G.r7bo = { t: 0 };
    G.r7killT = 15;
    R7.qb.build();
  };
  // spawn rate: L1-5 aasaan, 6+ mushkil, Dil ke Rishte aur Yamlok sabse mushkil
  const _sm = HZ.spawnMul.bind(HZ);
  HZ.spawnMul = function () {
    let k = _sm(); const n = CL.n || 1, id = CW && CW.cid;
    if (CL.yam) k *= 0.72; else if (n <= 5) k *= 1.3; else k *= Math.max(0.74, 0.92 - n * 0.0025);
    if (id && CHARS[id] && CHARS[id].dil) k *= 0.82;
    if (id === 'padoswali') k *= 0.72;
    if (G.fx.mesh > 0) k *= 1.9;
    if (hasGhar('door')) k *= 1.08;
    return k;
  };
  // machhar ki raftaar
  const _sp = window.spawnMosq;
  window.spawnMosq = function () {
    const m = _sp.apply(this, arguments);
    if (m && m.sp) { let k = 1; if (CL.n > 5 && !CL.ev) k *= 1 + Math.min(0.22, (CL.n - 5) * 0.004); if (CL.n <= 5) k *= 0.97; if (R7.perk('astro')) k *= 0.95; if (hasGhar('cooler')) k *= 0.95; if (hasGhar('ac')) k *= 0.92; m.sp *= k; }
    return m;
  };
  // boss: 2.2X taakat
  const _sb = window.spawnBoss;
  window.spawnBoss = function (key, x, o) {
    const m = _sb.apply(this, arguments);
    if (m && !m.fake && !(o && (o.child || o.hp))) { m.hp = m.maxhp = Math.round(m.maxhp * (CL.yam ? 2.4 : 2.2)); }
    return m;
  };
  // damage: rage + babbar sher
  const _hit = window.hit;
  window.hit = function (m, fx, fy, dmg = 1, how) { let d = dmg; if (G.fx.rage > 0) d *= 2; if (m && m.boss && R7.perk('babbar')) d *= 1.25; return _hit.call(this, m, fx, fy, d, how); };
  // magnet: coins 2 guna
  const _kill = window.kill;
  window.kill = function (m, how) { const was = m.dead; const r = _kill.apply(this, arguments); if (!was && m.dead && G.fx.magnet > 0) G.coins += m.coin || 1; return r; };
  // doosra mauka
  const _wake = window.wake;
  window.wake = function () { if (state === 'play' && G.r7heart) { G.r7heart = 0; G.sleepers.forEach(s => s.neend = Math.max(s.neend, 60)); G.fx.shield = 4; G.flash = 0.6; G.flashCol = '255,140,170'; sfx.power(); FEED.add('💗 Second chance'); return; } return _wake.apply(this, arguments); };
  // coins x2 + jaadugar
  const _sw = window.showWin;
  window.showWin = function () { if (!CL.yam) { if (G.r7x2) G.coins *= 2; if (R7.perk('jaadu')) G.coins = Math.round(G.coins * 1.1); } return _sw.apply(this, arguments); };
  // har frame: perks, saman effects, boss andhera, killer
  const _tk = META.tick;
  META.tick = function (dt, gdt) {
    _tk.call(META, dt, gdt);
    if (state !== 'play') return;
    if (R7.perk('ninja')) ptr.heat = Math.max(0, ptr.heat - 6 * gdt);
    if (G.fx.chai > 0) { ptr.heat = 0; ptr.hotT = 0; }
    if ((G.fx.chain > 0 || R7.perk('sher')) && G.combo > 0) G.comboT = Math.max(G.comboT, G.fx.chain > 0 ? 0.8 : G.comboT + 0.12 * gdt);
    if (hasGhar('tulsi')) for (const s of G.sleepers) s.neend = Math.min(100, s.neend + 0.25 * gdt);
    if (hasGhar('killer')) { G.r7killT -= gdt; if (G.r7killT <= 0) { G.r7killT = 15; const m = G.mosq.find(x => !x.dead && !x.boss); if (m) { bolt(W * 0.9, H * 0.5, m.x, m.y, 0.3, 1); kill(m, 'tap'); } } }
    R7.boTick(gdt);
  };
})();

/* ---------- 8. BOSS ANDHERA: light dheere jaati hai, 3 sec andhera, dheere wapas ---------- */
R7.BO = { cyc: 13, fade: 2, dark: 3 };
R7.boTick = function (gdt) {
  const b = G.r7bo; if (!b || !CL.boss || !G.bosses.some(x => !x.dead)) { G.r7dk = G.fx.inv > 0 ? 0 : G.r7dk ? Math.max(0, G.r7dk - gdt) : 0; return; }
  b.t += gdt; const C = R7.BO, inv = G.fx.inv > 0 || hasGhar('inverter'), dark = inv ? C.dark * 0.5 : C.dark, t = b.t % C.cyc, s0 = C.cyc - (C.fade * 2 + dark);
  let k = 0; if (t > s0 && t <= s0 + C.fade) k = (t - s0) / C.fade; else if (t > s0 + C.fade && t <= s0 + C.fade + dark) k = 1; else if (t > s0 + C.fade + dark) k = 1 - (t - s0 - C.fade - dark) / C.fade;
  if (G.fx.inv > 0) k = 0;
  if (k > 0.05 && !b.warn && t > s0) { b.warn = 1; FEED.add('🌑 Power is going out'); tone(200, 90, 0.8, 0.12, 'sawtooth'); }
  if (t < s0) b.warn = 0;
  if (k >= 1) for (const m of G.bosses) if (!m.dead && m.hp < m.maxhp) m.hp = Math.min(m.maxhp, m.hp + m.maxhp * 0.012 * gdt);
  G.r7dk = k;
};
(function () {
  const _dd = window.drawDark;
  window.drawDark = function (time) {
    const k = G.r7dk || 0, torch = G.fx.torch > 0, inv = G.fx.inv > 0;
    const baseOn = (CL.task === 'dark' || G.fx.dark > 0 || (CL.task === 'powercut' && G.flickOn > 0) || HZ.dark()) && (state === 'play' || state === 'clear');
    if (inv) return;
    if (!baseOn && k <= 0) return _dd.call(this, time);
    if (baseOn && !torch && k <= 0) return _dd.call(this, time);
    // apna andhera (boss blackout ya torch ke saath)
    const a = (baseOn ? 1 : k) * (torch ? 0.42 : 0.93);
    dkx.setTransform(DPR, 0, 0, DPR, 0, 0); dkx.globalCompositeOperation = 'source-over'; dkx.clearRect(0, 0, W, H);
    dkx.fillStyle = `rgba(2,1,10,${a})`; dkx.fillRect(0, 0, W, H); dkx.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r, al) => { const g = dkx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(0,0,0,${al})`); g.addColorStop(0.6, `rgba(0,0,0,${al * 0.7})`); g.addColorStop(1, 'rgba(0,0,0,0)'); dkx.fillStyle = g; dkx.beginPath(); dkx.arc(x, y, r, 0, 7); dkx.fill(); };
    if (ptr.vis > 0) hole(ptr.x, ptr.y, (torch ? 230 : 140) * S, 0.95 * ptr.vis);
    for (const s of G.sleepers) hole(s.x + 20 * S, s.y, 70 * S, 0.5);
    for (const b of G.bolts) { const p = b.pts[b.pts.length - 1]; hole(p[0], p[1], 60 * S, b.life / b.max); }
    for (const it of G.items) hole(it.x, it.y, 40 * S, 0.8);
    for (const m of G.mosq) if (m.boss && !m.dead) hole(m.x, m.y, 26 * S, 0.35);
    if (G.flash > 0) { dkx.fillStyle = `rgba(0,0,0,${Math.min(1, G.flash)})`; dkx.fillRect(0, 0, W, H); }
    ctx.drawImage(dk, 0, 0, W, H);
    if (k >= 1 && !baseOn) { for (const m of G.mosq) if (m.boss && !m.dead) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.5 + Math.sin(time * 6) * 0.2; ctx.fillStyle = `rgb(${ELEC})`; ctx.beginPath(); ctx.arc(m.x - 10 * S, m.y - 8 * S, 3 * S, 0, 7); ctx.arc(m.x + 10 * S, m.y - 8 * S, 3 * S, 0, 7); ctx.fill(); ctx.restore(); } }
  };
  // earplugs / inverter: shor aur bijli
  const _hd = HZ.dark.bind(HZ); HZ.dark = function () { return G.fx && G.fx.inv > 0 ? false : _hd(); };
})();

/* ---------- 9. QUICK BAR: level ke andar saman use karo ---------- */
R7.qb = {
  el: null,
  build() {
    if (!this.el) { this.el = document.createElement('div'); this.el.id = 'r7qb'; document.body.appendChild(this.el); this.el.addEventListener('pointerdown', e => { e.stopPropagation(); const b = e.target.closest('[data-qb]'); if (b) this.use(b.dataset.qb); }); }
    const sv = SV(), own = SAMAN.filter(s => sv.saman[s.id] > 0).slice(0, 4);
    this.el.innerHTML = own.map(s => `<button data-qb="${s.id}"><img src="${R7.A(s.img)}" alt=""><i>${sv.saman[s.id]}</i><span class="cd"></span></button>`).join('');
    this.el.style.display = own.length ? '' : 'none';
  },
  use(id) {
    const sv = SV(), s = SAMAN.find(x => x.id === id); if (!s || !(sv.saman[id] > 0) || state !== 'play') return;
    sv.saman[id]--; save(); sfx.power(); vib([15, 20, 15]);
    if (s.fx) { G.fx[s.fx] = Math.max(G.fx[s.fx] || 0, s.d); if (s.fx === 'inv') G.r7dk = 0; }
    if (s.act === 'fan') useItem({ kind: 'good', key: 'pankha', x: W / 2, y: H / 2 });
    if (s.act === 'cooler') { ptr.heat = 0; ptr.hotT = 0; G.fx.coil = Math.max(G.fx.coil || 0, 8); }
    if (s.act === 'pillow') for (const x of G.sleepers) x.neend = Math.min(100, x.neend + 25);
    FEED.add(`${R7.emo(s.name) || '✨'} ${s.name}`);
    G.flash = 0.25; G.flashCol = '127,212,255';
    this.build();
  }
};
setInterval(() => { if (R7.qb.el) R7.qb.el.classList.toggle('on', state === 'play'); }, 200);
// in-game chips ke label
(function () { const L = { torch: '🔦 Torch', inv: '🔋 Inverter', ear: '🎧 Earplugs', mesh: '🪟 Mesh', chai: '☕ Chai', magnet: '🧲 Magnet', chain: '🔗 Combo', aim: '🎯 Aim', rage: '🔥 Rage' }; R7.FXL = L; })();
// earplugs: shor ka asar nahi (game.js mein noise check hota hai shield se)
(function () { const _q = RISHTE.q.bind(RISHTE); RISHTE.q = function () { if (G.fx && G.fx.ear > 0 && state === 'play') return 'deaf'; return _q(); }; })();

/* ---------- 10. SHOP: naya design aur naye tab ---------- */
R7.adLeft = () => { const sv = SV(), t = R7.today() + ''; if (sv.samanAd.d !== t) sv.samanAd = { d: t, n: 0 }; return 3 - sv.samanAd.n; };
R7.useAdSlot = () => { const sv = SV(); R7.adLeft(); sv.samanAd.n++; save(); };
(function () {
  const tabs = document.querySelector('#shop .tabs');
  if (tabs) tabs.innerHTML = `<button class="tab" data-t="rackets">🏸 Rackets</button><button class="tab" data-t="saman">🔦 Items</button><button class="tab" data-t="boosters">🎒 Boosters</button><button class="tab" data-t="upgrade">⬆️ Upgrade</button><button class="tab" data-t="ghar">🏠 Home</button><button class="tab" data-t="deals">🎁 Deals</button>`;
  document.querySelectorAll('#shop .tab').forEach(t => t.onclick = () => { shopTab = t.dataset.t; sfx.coin(); renderShop(); });
  const _rs = window.renderShop;
  const pay = (price, cur) => { if (cur === 'g' ? SAVE.gems < price : SAVE.coins < price) { sfx.low(); toast(cur === 'g' ? `You need ${price - SAVE.gems} more gems` : `You need ${fmt(price - SAVE.coins)} more coins`); return false; } if (cur === 'g') SAVE.gems -= price; else SAVE.coins -= price; return true; };
  const card = (img, name, desc, cnt, btns, cls = '') => `<div class="shC ${cls}"><div class="shI">${R7.img(img)}${cnt !== '' && cnt !== undefined ? `<i>x${cnt}</i>` : ''}</div><b>${name}</b><small>${desc}</small><div class="shB">${btns}</div></div>`;
  const CHESTS = [
    { id: 'wood', img: 'x_wood', n: 'Wooden Chest', d: '3 items + coins', p: 0, cur: 'ad', r: [2, 100, 0] },
    { id: 'silver', img: 'x_silver', n: 'Silver Chest', d: '5 items + 2 boosters', p: 1500, cur: 'c', r: [5, 250, 0, 2] },
    { id: 'gold', img: 'x_gold', n: 'Gold Chest', d: '8 items + 3 boosters + gems', p: 45, cur: 'g', r: [8, 500, 5, 3] },
    { id: 'diamond', img: 'x_diamond', n: 'Diamond Chest', d: '15 items + 6 boosters + 20 💎', p: 110, cur: 'g', r: [15, 1200, 20, 6] }
  ];
  R7.openChest = function (c) {
    const sv = SV(), [ns, co, gm, nb] = c.r, got = {};
    for (let i = 0; i < ns; i++) { const s = SAMAN[(Math.random() * SAMAN.length) | 0]; sv.saman[s.id] = (sv.saman[s.id] || 0) + 1; got[s.id] = (got[s.id] || 0) + 1; }
    for (let i = 0; i < (nb || 0); i++) { const b = BOOSTERS[(Math.random() * BOOSTERS.length) | 0]; SAVE.boost[b.id] = (SAVE.boost[b.id] || 0) + 1; }
    SAVE.coins += co; SAVE.gems += gm; save();
    REWARD.show({ img: c.img, kick: c.n.toUpperCase() + ' OPENED!', t: `${ns} items${nb ? ` + ${nb} boosters` : ''}`, sub: `🪙 +${co}${gm ? ` · 💎 +${gm}` : ''}`, to: '#sCoins', cb: () => renderShop() });
  };
  window.renderShop = function () {
    const sv = SV();
    if (shopTab === 'upgrade' || shopTab === 'rackets_old') { _rs(); }
    $('sCoins').innerHTML = `<span class="pill"><span class="coin"></span><b>${fmt(SAVE.coins)}</b></span><span class="pill">${R7.img('gem')}<b>${SAVE.gems}</b></span>`;
    document.querySelectorAll('#shop .tab').forEach(t => t.classList.toggle('on', t.dataset.t === shopTab));
    if (shopTab === 'upgrade') return;
    let h = ''; const al = R7.adLeft();
    if (shopTab === 'rackets') {
      h = '<div class="shGrid">' + RACKETS.map(r => { const own = SAVE.owned.includes(r.id), eq = SAVE.equip === r.id, R2 = RARITY[r.rar];
        const btn = eq ? '<button class="buy eqd" disabled>✓ EQUIPPED</button>' : own ? `<button class="buy eq" data-eq="${r.id}">EQUIP</button>` : priceBtn(r.price, r.cur, `data-buy="${r.id}"`);
        return `<div class="shC rk ${eq ? 'on' : ''}" style="--rc:${R2.col}"><span class="rr7">${R2.name}</span><div class="shI">${R7.img(RK_IMG[r.id] || 'racket')}</div><b>${r.name}</b><small>${r.sp}</small><div class="shB">${own ? '' : `<button class="try" data-try="${r.id}">📺 try 1 level</button>`}${btn}</div></div>`; }).join('') + '</div>';
    } else if (shopTab === 'saman') {
      h = `<div class="shNote">🔦 One level items · tap them at the bottom left during play · 📺 ${al}/3 free today</div><div class="shGrid">` + SAMAN.map(s => card(s.img, s.name, s.desc, sv.saman[s.id] || 0, `${priceBtn(s.price, 'c', `data-sm="${s.id}"`)}<button class="try" data-sma="${s.id}" ${al > 0 ? '' : 'disabled'}>📺 FREE</button>`)).join('') + '</div>';
    } else if (shopTab === 'boosters') {
      h = '<div class="shNote">🎒 Pick before a level starts · a must on hard levels</div><div class="shGrid">' + BOOSTERS.map(b => card(b.img, b.name, b.desc, SAVE.boost[b.id] || 0, priceBtn(b.price, 'c', `data-bb="${b.id}"`))).join('') + '</div>';
    } else if (shopTab === 'ghar') {
      h = '<div class="shNote">🏠 Permanent · works in every level</div><div class="shGrid">' + GHAR.map(g => card(GHAR_IMG[g.id] || 'g_jaali', g.name, g.desc, '', hasGhar(g.id) ? '<button class="buy eqd" disabled>✓ INSTALLED</button>' : priceBtn(g.price, g.cur, `data-gh="${g.id}"`), hasGhar(g.id) ? 'on' : '')).join('') + '</div>';
    } else if (shopTab === 'deals') {
      if (SAVE.adDay !== today()) { SAVE.adDay = today(); SAVE.adCount = 0; save(); }
      const seed = seeded(new Date().getDate() + new Date().getMonth() * 31)(), pool = RACKETS.filter(r => r.price > 0 && !SAVE.owned.includes(r.id)), dealR = pool[Math.floor(seed * 8) % Math.max(1, pool.length)];
      const free = 3 - SAVE.adCount;
      h = '<div class="shGrid">' + CHESTS.map(c => card(c.img, c.n, c.d, '', c.cur === 'ad' ? `<button class="try" data-ch="${c.id}" ${free > 0 ? '' : 'disabled'}>📺 FREE (${free})</button>` : priceBtn(c.p, c.cur, `data-ch="${c.id}"`))).join('')
        + card('x_coins2', 'Free Coins', 'Watch an ad, +300 coins', '', `<button class="try" data-ad="coins" ${free > 0 ? '' : 'disabled'}>📺 FREE (${free})</button>`)
        + card('x_gems1', 'Free Gems', 'Watch an ad, +5 gems', '', `<button class="try" data-ad="gems" ${free > 0 ? '' : 'disabled'}>📺 FREE (${free})</button>`)
        + (sv.deals.starter ? '' : card('x_starter', 'Starter Pack', '6 items + 3 boosters · one time only', '', priceBtn(900, 'c', 'data-dl="starter"'), 'hot'))
        + card('x_mega', 'Mega Item Box', '12 items at once', '', priceBtn(40, 'g', 'data-dl="mega"'))
        + card('x_vip', 'VIP Night', '1.5X coins for 24 hours', '', sv.deals.vip > Date.now() ? `<button class="buy eqd" disabled>✓ ${R7.fmtLeft(sv.deals.vip - Date.now())}</button>` : `<button class="try" data-dl="vip">📺 3 ad (${sv.deals.vipAds || 0}/3)</button>`)
        + (dealR ? card(RK_IMG[dealR.id], 'TODAY\'S DEAL', `${dealR.name} · 30% OFF`, '', priceBtn(Math.round(dealR.price * 0.7), dealR.cur, `data-deal="${dealR.id}"`), 'hot') : '') + '</div>';
    }
    $('shopBody').innerHTML = h;
    const B = $('shopBody');
    B.querySelectorAll('[data-eq]').forEach(b => b.onclick = () => { SAVE.equip = b.dataset.eq; RKC = null; save(); sfx.power(); renderShop(); });
    B.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => { const r = RACKETS.find(x => x.id === b.dataset.buy); if (!pay(r.price, r.cur)) return; SAVE.owned.push(r.id); SAVE.equip = r.id; RKC = null; save(); REWARD.show({ img: RK_IMG[r.id], kick: 'NEW RACKET', t: r.name, sub: r.sp, cb: renderShop }); });
    B.querySelectorAll('[data-deal]').forEach(b => b.onclick = () => { const r = RACKETS.find(x => x.id === b.dataset.deal); if (!pay(Math.round(r.price * 0.7), r.cur)) return; SAVE.owned.push(r.id); SAVE.equip = r.id; RKC = null; save(); REWARD.show({ img: RK_IMG[r.id], kick: 'DEAL CLAIMED', t: r.name, cb: renderShop }); });
    B.querySelectorAll('[data-try]').forEach(b => b.onclick = () => showAd(() => { SAVE.trial = b.dataset.try; RKC = null; save(); toast('Play your next level with this racket! 🎁'); renderShop(); }));
    B.querySelectorAll('[data-bb]').forEach(b => b.onclick = () => { const bo = BOOSTERS.find(x => x.id === b.dataset.bb); if (!pay(bo.price, 'c')) return; SAVE.boost[bo.id] = (SAVE.boost[bo.id] || 0) + 1; save(); sfx.coin(); renderShop(); });
    B.querySelectorAll('[data-sm]').forEach(b => b.onclick = () => { const s = SAMAN.find(x => x.id === b.dataset.sm); if (!pay(s.price, 'c')) return; sv.saman[s.id] = (sv.saman[s.id] || 0) + 1; save(); sfx.coin(); renderShop(); });
    B.querySelectorAll('[data-sma]').forEach(b => b.onclick = () => { if (R7.adLeft() <= 0) return toast('Daily limit reached. Come back tomorrow'); const s = SAMAN.find(x => x.id === b.dataset.sma); showAd(() => { R7.useAdSlot(); sv.saman[s.id] = (sv.saman[s.id] || 0) + 1; save(); REWARD.show({ img: s.img, kick: 'FREE ITEM', t: s.name, sub: s.desc, cb: renderShop }); }); });
    B.querySelectorAll('[data-gh]').forEach(b => b.onclick = () => { const g = GHAR.find(x => x.id === b.dataset.gh); if (!pay(g.price, g.cur)) return; SAVE.ghar.push(g.id); RKC = null; save(); REWARD.show({ img: GHAR_IMG[g.id], kick: 'INSTALLED AT HOME', t: g.name, sub: g.desc, cb: renderShop }); });
    B.querySelectorAll('[data-ch]').forEach(b => b.onclick = () => { const c = CHESTS.find(x => x.id === b.dataset.ch); if (c.cur === 'ad') { if (SAVE.adCount >= 3) return; showAd(() => { SAVE.adCount++; R7.openChest(c); }); } else { if (!pay(c.p, c.cur)) return; R7.openChest(c); } });
    B.querySelectorAll('[data-ad]').forEach(b => b.onclick = () => { if (SAVE.adCount >= 3) return toast('Daily limit reached. Come back tomorrow'); showAd(() => { SAVE.adCount++; const g = b.dataset.ad === 'gems'; if (g) SAVE.gems += 5; else SAVE.coins += 300; save(); REWARD.show({ img: g ? 'x_gems1' : 'x_coins2', kick: 'FREE', t: g ? '💎 +5 GEMS' : '🪙 +300 COINS', to: '#sCoins', cb: renderShop }); }); });
    B.querySelectorAll('[data-dl]').forEach(b => b.onclick = () => {
      const k = b.dataset.dl;
      if (k === 'starter') { if (!pay(900, 'c')) return; sv.deals.starter = 1; R7.openChest({ img: 'x_starter', n: 'Starter Pack', r: [6, 0, 0, 3] }); }
      if (k === 'mega') { if (!pay(40, 'g')) return; R7.openChest({ img: 'x_mega', n: 'Mega Item Box', r: [12, 0, 0, 0] }); }
      if (k === 'vip') showAd(() => { sv.deals.vipAds = (sv.deals.vipAds || 0) + 1; if (sv.deals.vipAds >= 3) { sv.deals.vipAds = 0; sv.deals.vip = Date.now() + DAY; REWARD.show({ img: 'x_vip', kick: 'VIP NIGHT ON', t: '1.5X coins for 24 hours' }); } save(); renderShop(); });
    });
  };
  // VIP: coins 1.5X
  const _sw2 = window.showWin; window.showWin = function () { if (!CL.yam && SV().deals.vip > Date.now()) G.coins = Math.round(G.coins * 1.5); return _sw2.apply(this, arguments); };
})();

/* ---------- 11. Level 5 ke baad: "Asli khel ab shuru" ---------- */
(function () {
  const _sw = window.showWin;
  window.showWin = function (st) {
    _sw.apply(this, arguments);
    if (CL && CL.n === 5 && !CL.yam && !CL.ev && !SV().l5) {
      SV().l5 = 1; SAVE.boost.coil = (SAVE.boost.coil || 0) + 1; SAVE.boost.shield = (SAVE.boost.shield || 0) + 1; save();
      setTimeout(() => META.modal(`<div class="l5"><div class="l5W">⚠️</div><div class="kick">TRAINING OVER</div><div class="big" style="font-size:30px">THE REAL GAME STARTS NOW!</div>
        <div class="sub">From Level 6 mosquitoes get smarter, faster and more. It is tough without boosters.</div>
        <div class="l5G">${R7.img('p_coil')}${R7.img('p_shield')}</div><div class="chip">🎁 Gift: 1 Coil + 1 Shield booster</div>
        <div class="sub" style="font-size:11px">Tap a booster on the level card to take it 👆</div></div>`, 'I AM READY ⚡', () => { }), 1800);
    }
  };
})();

/* ---------- 12. CSS ---------- */
R7.css(`
.hrGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:10px 0}
.hrC{position:relative;border-radius:14px;border:1.5px solid rgba(255,255,255,.15);background:linear-gradient(170deg,rgba(154,109,245,.35),rgba(28,12,79,.6));color:#fff;padding:5px 2px 6px;display:flex;flex-direction:column;align-items:center;min-width:0}
.hrC img{width:100%;height:72px;object-fit:contain;filter:drop-shadow(0 4px 8px rgba(0,0,0,.4))}
.hrC b{font:800 10px/1.1 Poppins;margin-top:2px}.hrC small{font:600 8px/1.15 Poppins;opacity:.8;min-height:18px}
.hrC.sel{border-color:#fff;background:linear-gradient(170deg,#9a6df5,#4a1fa8);box-shadow:0 0 0 2px rgba(255,255,255,.4),0 0 18px rgba(154,109,245,.8)}
.hrC.sel:after{content:'✓';position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;background:#fff;color:#4a1fa8;font:900 12px/20px Poppins}
.hrC.lock img{filter:grayscale(1) brightness(.45)}
.hrC em{position:absolute;top:30px;left:2px;right:2px;font:800 9px Poppins;font-style:normal;background:rgba(10,4,30,.85);border-radius:8px;padding:3px 2px}
#r7qb{position:fixed;left:8px;bottom:84px;z-index:20;display:flex;flex-direction:column;gap:8px;opacity:0;pointer-events:none;transition:opacity .2s}
#r7qb.on{opacity:1;pointer-events:auto}
#r7qb button{position:relative;width:50px;height:50px;border-radius:16px;border:2px solid rgba(255,255,255,.55);background:radial-gradient(circle at 50% 35%,rgba(154,109,245,.85),rgba(28,12,79,.9));padding:4px;box-shadow:0 0 14px rgba(127,212,255,.45)}
#r7qb img{width:100%;height:100%;object-fit:contain}
#r7qb i{position:absolute;right:-5px;top:-6px;background:#fff;color:#4a1fa8;font:900 10px Poppins;font-style:normal;border-radius:8px;padding:1px 5px}
.shGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;width:100%}
.shNote{font:600 11px Poppins;color:#d9ccff;margin:0 0 10px;text-align:center}
.shC{position:relative;border-radius:18px;padding:10px 8px;background:linear-gradient(165deg,rgba(255,255,255,.12),rgba(255,255,255,.03));border:1px solid rgba(255,255,255,.16);display:flex;flex-direction:column;align-items:center;text-align:center}
.shC.on{border-color:#fff;box-shadow:0 0 16px rgba(154,109,245,.6)}.shC.hot{border-color:rgb(127,212,255);box-shadow:0 0 18px rgba(127,212,255,.35)}
.shC.rk{--rc:#fff;border-color:color-mix(in srgb,var(--rc) 55%,transparent)}
.shC .rr7{position:absolute;top:8px;left:8px;font:900 8px Poppins;letter-spacing:1px;color:var(--rc)}
.shI{position:relative;width:84px;height:84px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 8px 10px rgba(0,0,0,.4))}
.shI img{max-width:100%;max-height:100%;object-fit:contain}
.shI i{position:absolute;right:-8px;top:-4px;background:#fff;color:#4a1fa8;font:900 11px Poppins;font-style:normal;border-radius:9px;padding:1px 6px}
.shC b{font:800 13px Poppins;margin-top:4px}.shC small{font:600 10px/1.25 Poppins;opacity:.78;min-height:26px;margin:2px 0 6px}
.shB{display:flex;flex-direction:column;gap:5px;width:100%;margin-top:auto}.shB .buy,.shB .try{width:100%;padding:8px 4px;font-size:12px}
.shB .try{border:0;border-radius:12px;background:linear-gradient(180deg,rgba(127,212,255,.35),rgba(116,58,232,.4));color:#fff;font:800 11px Poppins}
.shB .try:disabled{opacity:.4}
#shop .tabs{flex-wrap:wrap;justify-content:center}
#sCoins{display:flex;gap:8px;justify-content:center}
.l5{text-align:center}.l5W{font-size:56px;animation:rwBob 1s infinite}.l5G{display:flex;justify-content:center;gap:14px;margin:10px 0}.l5G img{width:70px;height:70px;object-fit:contain;filter:drop-shadow(0 0 12px rgba(127,212,255,.7))}
`);

/* ---------- 13. POWER-UP HIGHLIGHT: roshni ka khamba, ghoomta ghera, painted icon, HUD tak udaan, timer ring ---------- */
R7.need(['c_fan', 'x_coins1', 'x_gems1', 'c_torch', 'c_tent', 'c_coil', 'c_inverter', 'c_earplug', 'c_mesh', 'c_chai', 'c_magnet']);
R7.ITIMG = { coil: 'p_coil', pankha: 'c_fan', shield: 'p_shield', battery: 'p_battery', bag: 'x_coins1', gem: 'x_gems1' };
R7.FXIMG = { coil: 'p_coil', shield: 'p_shield', torch: 'c_torch', inv: 'c_inverter', ear: 'c_earplug', mesh: 'c_mesh', chai: 'c_chai', magnet: 'c_magnet', chain: 'p_chain', aim: 'p_aim', rage: 'p_rage' };
(function () {
  const _do = window.drawObjects;
  window.drawObjects = function (time) {
    for (const it of G.items) if (it.kind === 'good' || it.kind === 'mystery') {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createLinearGradient(it.x, 0, it.x, it.y); g.addColorStop(0, 'rgba(127,212,255,0)'); g.addColorStop(1, `rgba(127,212,255,${0.28 + Math.sin(time * 6) * 0.08})`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(it.x - 10 * S, 0); ctx.lineTo(it.x + 10 * S, 0); ctx.lineTo(it.x + 30 * S, it.y); ctx.lineTo(it.x - 30 * S, it.y); ctx.fill(); ctx.restore();
    }
    _do.call(this, time);
    for (const it of G.items) {
      if (it.kind !== 'good' && it.kind !== 'mystery') continue;
      ctx.save(); ctx.translate(it.x, it.y);
      ctx.strokeStyle = `rgb(${ELEC})`; ctx.lineWidth = 2.5 * S; ctx.setLineDash([6 * S, 5 * S]); ctx.lineDashOffset = -time * 40; ctx.beginPath(); ctx.arc(0, 0, 27 * S, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      const im = it.kind === 'good' && ART.i[R7.ITIMG[it.key]];
      if (im && im.width) { const bob = Math.sin(time * 5 + it.ph) * 3 * S, w = 40 * S; ctx.fillStyle = 'rgba(28,12,79,.92)'; ctx.beginPath(); ctx.arc(0, 0, 19 * S, 0, 7); ctx.fill(); ctx.shadowColor = `rgb(${ELEC})`; ctx.shadowBlur = 16 * S; ctx.drawImage(im, -w / 2, -w / 2 + bob, w, w * im.height / im.width); }
      ctx.restore();
    }
  };
  const _ui = window.useItem;
  window.useItem = function (it) { const r = _ui.apply(this, arguments); if (it.kind === 'good' && R7.ITIMG[it.key]) (G.r7fly = G.r7fly || []).push({ k: R7.ITIMG[it.key], x: it.x, y: it.y, t: 0 }); return r; };
  const _dp = window.drawPops;
  window.drawPops = function (time) {
    _dp.apply(this, arguments);
    if (state !== 'play' && state !== 'clear') return;
    // udte icon
    if (G.r7fly) { for (const f of G.r7fly) { f.t += 1 / 60; const k = Math.min(1, f.t / 0.6), e = 1 - Math.pow(1 - k, 3), tx = W - 30 * S, ty = H * 0.25, x = f.x + (tx - f.x) * e, y = f.y + (ty - f.y) * e - Math.sin(k * Math.PI) * 60 * S, im = ART.i[f.k]; if (im && im.width) { const w = (46 - 20 * e) * S; ctx.save(); ctx.globalAlpha = 1 - Math.max(0, k - 0.85) * 6; ctx.shadowColor = `rgb(${ELEC})`; ctx.shadowBlur = 20 * S; ctx.drawImage(im, x - w / 2, y - w / 2, w, w * im.height / im.width); ctx.restore(); } } G.r7fly = G.r7fly.filter(f => f.t < 0.62); }
    // chalu power ke timer ring (right side)
    G.r7max = G.r7max || {}; let y = H * 0.25; const x = W - 26 * S;
    for (const k in R7.FXIMG) {
      const v = G.fx[k]; if (!(v > 0)) { delete G.r7max[k]; continue; }
      if (!G.r7max[k] || v > G.r7max[k]) G.r7max[k] = v;
      const im = ART.i[R7.FXIMG[k]], p = v / G.r7max[k], r = 17 * S;
      ctx.save(); ctx.fillStyle = 'rgba(18,8,48,.85)'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 3 * S; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
      ctx.strokeStyle = v < 2.5 && Math.sin(time * 18) > 0 ? '#ff6b8a' : `rgb(${ELEC})`; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + 6.283 * p); ctx.stroke();
      if (im && im.width) { const w = 24 * S; ctx.drawImage(im, x - w / 2, y - w / 2, w, w * im.height / im.width); }
      ctx.restore(); y += 42 * S;
    }
  };
})();

/* ---------- 14. SPECIAL LOOK (sirf ad se) : diary mein ---------- */
R7.outfitBtn = function (id) {
  const sv = SV(), k = R7.OVK[id]; if (!k) return '';
  sv.ovOwn = sv.ovOwn || {}; const own = sv.ovOwn[id], n = sv.ovAds[id] || 0;
  return `<button class="ovBtn ${own ? 'own' : ''} ${sv.outfit[id] ? 'on' : ''}" data-ov="${id}"><img src="${R7.A('ov_' + k)}" alt=""><span><b>👗 Special Look</b><small>${own ? (sv.outfit[id] ? '✓ wearing · tap to remove' : 'tap to wear') : `📺 ads only · ${n}/3`}</small></span></button>`;
};
R7.outfitTap = function (id) {
  const sv = SV(); sv.ovOwn = sv.ovOwn || {};
  if (sv.ovOwn[id]) { sv.outfit[id] = !sv.outfit[id]; save(); sfx.power(); return R7.diary(id); }
  showAd(() => { sv.ovAds[id] = (sv.ovAds[id] || 0) + 1; if (sv.ovAds[id] >= 3) { sv.ovOwn[id] = 1; sv.outfit[id] = 1; REWARD.show({ img: 'ov_' + R7.OVK[id], kick: 'AD EXCLUSIVE LOOK', t: `${CHARS[id].n}\'s Special Look`, sub: 'This look now shows in bed ✨' }); } save(); R7.diary(id); });
};
(function () {
  const _d = R7.diary;
  R7.diary = function (sel) { _d(sel); const h = document.querySelector('#metaBody .dHead'); if (!h) return; const id = sel || (R7.pend()[0] && R7.pend()[0].id) || RISHTE.cid(0); const d = document.createElement('div'); d.innerHTML = R7.outfitBtn(id); if (d.firstChild) { h.after(d.firstChild); const b = document.querySelector('[data-ov]'); b.onclick = () => R7.outfitTap(id); } };
})();
R7.css(`.ovBtn{display:flex;align-items:center;gap:10px;width:100%;border:1.5px solid rgb(127,212,255);border-radius:16px;background:linear-gradient(135deg,rgba(127,212,255,.22),rgba(116,58,232,.35));color:#fff;padding:6px 10px;margin:6px 0;text-align:left}
.ovBtn img{width:86px;height:54px;object-fit:cover;border-radius:10px;filter:grayscale(.7) brightness(.7)}.ovBtn.own img{filter:none}
.ovBtn b{display:block;font:800 13px Poppins}.ovBtn small{font:600 11px Poppins;opacity:.85}.ovBtn.on{border-color:#fff;box-shadow:0 0 16px rgba(127,212,255,.6)}`);

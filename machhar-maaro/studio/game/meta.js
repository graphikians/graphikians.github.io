/* ================= MACHHAR MAARO — META / PSYCHOLOGY LAYER ================= */
MT.heera = { name: 'Diamond Mosquito', emoji: '💎', tier: 'pro', sp: 260, size: 1.15, hp: 1, wa: 1.2, wf: 6, dmg: 0, pts: 500, coin: 50, body: '#e9e1ff', unlock: 999, desc: 'Super rare! Escapes in 6 seconds' };
const RANKS = [[1, 'Rookie Swatter', '🌱'], [5, 'Racket Rider', '🏸'], [10, 'Zap Master', '⚡'], [15, 'Mosquito Doom', '🔥'], [20, 'Sleep Guardian', '🛡️'], [30, 'Sleep Legend', '👑']];
const PERSONA = { student: ['🎒', 'Student'], business: ['💼', 'Business Owner'], parent: ['👨‍👩‍👧', 'Parent'], pro: ['🧑‍💻', 'Professional'] };
const AVATARS = ['🦸‍♂️', '🦸‍♀️', '🥷', '🧑‍🚀', '🧙', '🐯', '🦁', '🤖'];
const TIPS = { all: ['Do not zap near the ear. The noise breaks sleep', 'Do not stay in one spot. The racket overheats', 'If the glass shakes, TAP it right away', 'Keep the combo going. Bonus every 5 kills', 'A beep warns you before the power goes out', 'Play with a booster. 3 stars get much easier', 'Swipe the cat away or something will fall', 'If the fan stops, tap the switch 🔌'] };
const MISSION_POOL = [
  { id: 'kills', t: n => `Swat ${n} mosquitoes`, n: [40, 60, 80], r: [80, 0] },
  { id: 'air', t: n => `${n} air kills`, n: [15, 25], r: [100, 0] },
  { id: 'levels', t: n => `Win ${n} levels`, n: [2, 3], r: [120, 1] },
  { id: 'stars3', t: () => `Get 3 ⭐ on any level`, n: [1], r: [0, 2] },
  { id: 'defuse', t: n => `Defuse ${n} traps`, n: [2, 3], r: [100, 0] },
  { id: 'collect', t: n => `Catch ${n} power-ups`, n: [3, 5], r: [80, 0] },
  { id: 'fever', t: () => `Trigger FEVER MODE 🔥`, n: [1], r: [0, 2] },
  { id: 'heera', t: () => `Catch a Diamond Mosquito 💎`, n: [1], r: [0, 3] },
  { id: 'combo', t: n => `Build a ${n} combo`, n: [12, 15], r: [100, 1] }
];
const ACH = [
  ['k1', '🎯', 'First Hunt', 'First mosquito swatted', s => s.tk >= 1], ['k100', '💯', 'Century', '100 mosquitoes', s => s.tk >= 100], ['k1000', '🏆', 'Thousand Hands', '1,000 mosquitoes', s => s.tk >= 1000],
  ['b1', '👑', 'Boss Killer', 'First boss defeated', s => s.tb >= 1], ['b5', '🗡️', 'Boss Hunter', '5 boss', s => s.tb >= 5],
  ['c20', '🔥', 'Combo King', '20 combo', s => s.bc >= 20], ['f1', '🌋', 'Fever!', 'First Fever Mode', s => s.tf >= 1],
  ['h1', '💎', 'Diamond Found', 'First Diamond Mosquito', s => s.th >= 1], ['h10', '💠', 'Heera Collector', '10 Diamond Mosquitoes', s => s.th >= 10],
  ['s10', '⭐', 'Star Collector', '30 stars', s => s.ts >= 30], ['kosh10', '📖', 'Mosquito Expert', '10 cards in the Codex', s => s.kc >= 10], ['koshall', '🧠', 'Mosquito Encyclopedia', 'All 29 cards', s => s.kc >= 29],
  ['st7', '📅', 'Full Week', '7 day streak', s => s.sk >= 7], ['lv10', '🎖️', 'Zap Master', 'Player Level 10', s => s.pl >= 10], ['d20', '🛡️', 'Trap Expert', '20 trap defuse', s => s.td >= 20]
];
const SPIN = [['🪙', '50 coins', 'c', 50, 22], ['🪙', '100 coins', 'c', 100, 18], ['💎', '2 gems', 'g', 2, 14], ['🌀', 'Coil', 'b', 'coil', 12], ['🪙', '250 coins', 'c', 250, 10], ['🛡️', 'Shield', 'b', 'shield', 10], ['💎', '5 gems', 'g', 5, 9], ['💰', '600 coins', 'c', 600, 5]];
const dayKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const dayNum = (d = new Date()) => Math.floor((d - new Date(2026, 0, 1)) / 864e5);

const META = {
  init() {
    const d = { xp: 0, plv: 1, kosh: {}, ach: {}, bests: {}, stats: { tk: 0, tb: 0, bc: 0, tf: 0, th: 0, td: 0 }, streak: 0, lastDay: -1, shield: 0, claimedDay: -1, missions: null, spinDay: -1, spinExtra: 0, lastSeen: 0, xray: false, league: null, overs: 0, newCards: [] };
    for (const k in d) if (SAVE[k] === undefined) SAVE[k] = d[k];
    for (const k in d.stats) if (SAVE.stats[k] === undefined) SAVE.stats[k] = 0;
    this.ensureMissions(); save();
  },
  /* ---------- X-RAY ---------- */
  x(label) {
    if (!SAVE.xray) return;
    const box = $('xray'); const el = document.createElement('div'); el.className = 'xchip'; el.innerHTML = `🧠 <b>${label}</b>`;
    box.prepend(el); setTimeout(() => el.classList.add('out'), 2200); setTimeout(() => el.remove(), 2700);
    while (box.children.length > 4) box.lastChild.remove();
  },
  /* ---------- events ---------- */
  happyHour() { const h = new Date().getHours(); return h === 20; },
  weekend() { const d = new Date().getDay(); return d === 0 || d === 6; },
  eventBanner() {
    const out = [];
    if (this.happyHour()) out.push('🌙 HAPPY HOUR (8 to 9 PM): 2X COINS on every level, live now');
    if (this.weekend()) out.push('🎉 WEEKEND MOSQUITO ARMY: 2X XP today and tomorrow');
    return out;
  },
  /* ---------- XP & rank ---------- */
  need(l) { return 100 + l * 60; },
  rank(l = SAVE.plv) { let r = RANKS[0]; for (const x of RANKS) if (l >= x[0]) r = x; return r; },
  addXP(v) {
    v = Math.round(v * (this.weekend() ? 2 : 1)); SAVE.xp += v; let ups = 0;
    while (SAVE.xp >= this.need(SAVE.plv)) { SAVE.xp -= this.need(SAVE.plv); SAVE.plv++; ups++; }
    return ups;
  },
  /* ---------- in-game hooks ---------- */
  onStart() {
    G.fever = 0; G.feverUsed = false; G.heeraT = rnd(25, 45); G.bestPrev = SAVE.bests[CL.n] || 0; G.bestPopped = false; G.xrT = {}; G.newCardsRun = [];
    if (this.happyHour()) { pop('🌙 HAPPY HOUR — 2X COINS', W / 2, H * 0.52, 18, '#fff', 1.6); this.x('Genuine Urgency (Happy Hour)'); }
  },
  onKill(m, near) {
    const s = SAVE.stats; s.tk++;
    if (!SAVE.kosh[m.t]) { SAVE.kosh[m.t] = 0; SAVE.newCards.push(m.t); G.newCardsRun.push(m.t); pop(`📖 NEW CARD: ${MT[m.t].emoji} ${MT[m.t].name}!`, W / 2, H * 0.58, 18, '#fff', 1.4); sfx.chest(); this.x('Collection / Completion'); }
    SAVE.kosh[m.t]++;
    const tierUp = { 10: 'BRONZE', 50: 'SILVER', 200: 'GOLD' }[SAVE.kosh[m.t]];
    if (tierUp) { pop(`${MT[m.t].emoji} card is now ${tierUp}!`, W / 2, H * 0.62, 15, '#d9ccff', 1.2); this.x('Collection Tier'); }
    this.mission('kills', 1); if (!near) this.mission('air', 1);
    if (m.t === 'heera') { s.th++; this.mission('heera', 1); }
    if (G.combo > s.bc) s.bc = G.combo;
    this.mission('combo', 0, G.combo);
  },
  ev(id) { if (id === 'defuse') { SAVE.stats.td++; this.mission('defuse', 1); } if (id === 'collect') this.mission('collect', 1); },
  onBoss() { SAVE.stats.tb++; },
  startFever() {
    G.fever = 6; G.feverUsed = true; SAVE.stats.tf++; this.mission('fever', 1);
    pop('🔥 FEVER MODE! 🔥', W / 2, H * 0.36, 46, '#fff', 1.4); pop('3X POINTS · AUTO CHAIN', W / 2, H * 0.36 + 40 * S, 18, '#d9ccff', 1.4);
    sfx.phase(); vib([30, 30, 30, 30, 60]); G.flash = 0.5; G.flashCol = '154,109,245'; slow(0.4);
    this.x('Peak Dopamine (Fever Mode)');
  },
  tick(dt, gdt) {
    if (state !== 'play') return;
    if (G.combo >= 15 && !(G.fever > 0) && !G.feverLock) { G.feverLock = true; this.startFever(); }
    if (G.combo < 5) G.feverLock = false;
    if (G.fever > 0) {
      G.fever -= gdt; G.feverBeat = (G.feverBeat || 0) - gdt;
      if (G.feverBeat <= 0) { G.feverBeat = 0.25; const k = [0, 4, 7, 9][Math.floor(G.t * 4) % 4]; tone(NOTES[k] * 0.5, NOTES[k] * 0.5, 0.18, 0.08, 'sawtooth'); }
      if (G.fever <= 0) pop('Fever over. Get a 15 combo again!', W / 2, H * 0.4, 16, '#d9ccff', 1.2);
    }
    // heera machhar
    if (CL.n >= 2 && CL.task !== 'boss') { G.heeraT -= gdt; if (G.heeraT <= 0) { G.heeraT = rnd(40, 70); this.spawnHeera(); } }
    // personal best
    if (G.bestPrev > 0 && !G.bestPopped && G.score > G.bestPrev) { G.bestPopped = true; pop('🏆 NEW RECORD!', W / 2, H * 0.3, 34, '#fff', 1.3); sfx.chest(); this.x('Self-Competition (Personal Best)'); }
    // xray once-per-level labels
    const once = (k, l) => { if (!G.xrT[k]) { G.xrT[k] = 1; this.x(l); } };
    if (G.combo === 5) once('c5', 'Flow State (Combo)');
    if (CL.len && CL.len - G.t <= 10) once('urg', 'Urgency / Arousal (Timer)');
    if (minNeend() < 35) once('neend', 'Loss Aversion (Neend khatre mein)');
    if (G.items.some(i => i.kind === 'trap')) once('trap', 'Risk vs Reward (Trap)');
    if (G.items.some(i => i.kind === 'mystery')) once('mys', 'Variable Reward (Mystery Box)');
  },
  spawnHeera() {
    const [x, y] = edgePos(); const m = spawnMosq('normal', x, y, { t: 'heera', heera: true, life: 6, sp: 260 * S, size: 1.15, pts: 500, coin: 50, hp: 1, maxhp: 1, wa: 1.2, wf: 6 });
    m.wp = { x: rnd(W * 0.15, W * 0.85), y: rnd(H * 0.2, H * 0.55) };
    pop('💎 DIAMOND MOSQUITO! QUICK!', W / 2, H * 0.28, 24, '#fff', 1.4); sfx.power(); vib([20, 20, 20]);
    this.x('Variable Reward + Rarity (Heera)');
  },
  updHeera(m, gdt) {
    m.life -= gdt;
    if (m.life <= 0) { m.dead = true; pop('IT ESCAPED! 😭 next time…', m.x, m.y - 30 * S, 18, '#fff', 1.2); this.x('Near-miss (Heera bhaaga)'); return; }
    const d = Math.hypot(m.wp.x - m.x, m.wp.y - m.y);
    if (d < 40 * S) m.wp = { x: rnd(W * 0.1, W * 0.9), y: rnd(H * 0.18, H * 0.6) };
    if (m.life < 1.2) m.wp = { x: m.x < W / 2 ? -200 * S : W + 200 * S, y: m.y - 100 * S };
    const k = Math.min(1, gdt * 4); m.vx += ((m.wp.x - m.x) / (d || 1) * m.sp - m.vx) * k; m.vy += ((m.wp.y - m.y) / (d || 1) * m.sp - m.vy) * k;
    m.x += m.vx * gdt; m.y += m.vy * gdt; m.dir = m.vx > 0 ? 1 : -1;
    if (Math.random() < 0.5) G.parts.push({ x: m.x, y: m.y, vx: rnd(-20, 20) * S, vy: rnd(-20, 20) * S, life: 0.5, max: 0.5, size: rnd(1, 2.5) * S, col: '#ffffff', g: 0 });
  },
  heeraKilled(m) { G.gems += 3; slow(0.8); G.flash = 0.6; G.flashCol = '233,225,255'; pop('💎 DIAMOND MOSQUITO! +3 GEMS +500', W / 2, H * 0.4, 28, '#fff', 1.6); for (let i = 0; i < 40; i++) sparks(m.x, m.y, 1, 400, ['#fff', '#e9e1ff', `rgb(${ELEC})`]); sfx.chest(); vib([40, 30, 80]); },
  /* ---------- missions ---------- */
  ensureMissions() {
    if (SAVE.missions && SAVE.missions.day === dayKey()) return;
    const r = seeded(dayNum() * 13 + 7), pool = MISSION_POOL.slice(); const list = [{ id: 'open', t: 'Open the game today', n: 1, cur: 1, r: [20, 0], claimed: false }];
    for (let i = 0; i < 3; i++) { const j = Math.floor(r() * pool.length), p = pool.splice(j, 1)[0], n = p.n[Math.floor(r() * p.n.length)]; list.push({ id: p.id, t: p.t(n), n, cur: 0, r: p.r, claimed: false }); }
    SAVE.missions = { day: dayKey(), list, bonus: false };
  },
  mission(id, add, setMax) {
    if (!SAVE.missions) return;
    for (const m of SAVE.missions.list) if (m.id === id && m.cur < m.n) {
      m.cur = setMax !== undefined ? Math.max(m.cur, setMax) : m.cur + add; m.cur = Math.min(m.n, m.cur);
      if (m.cur >= m.n && state === 'play') { pop(`🎯 MISSION DONE: ${m.t}`, W / 2, H * 0.66, 15, `rgb(${ELEC})`, 1.4); sfx.coin(); this.x('Goal Gradient (Daily Mission)'); }
    }
  },
  missionsReady() { return SAVE.missions ? SAVE.missions.list.filter(m => m.cur >= m.n && !m.claimed).length : 0; },
  /* ---------- after level ---------- */
  afterWin(st, n) {
    const secret = CHARS[CW.cid] && CHARS[CW.cid].secret; if (!secret) SAVE.bests[n] = Math.max(SAVE.bests[n] || 0, G.score);
    this.mission('levels', 1); if (st === 3) this.mission('stars3', 1);
    if (CL.boss) this.onBoss();
    const xp = G.kills * 2 + 30 + st * 10 + (CL.boss ? 100 : 0);
    const ups = this.addXP(xp); if (!secret) this.league(G.score);
    let hh = 0; if (this.happyHour()) { hh = earned; SAVE.coins += hh; }
    save();
    const r = this.rank();
    $('wXP').innerHTML = `<div class="xprow"><span>${r[2]} Lv ${SAVE.plv} · ${r[1]}</span><span>+${xp} XP${this.weekend() ? ' (2X weekend)' : ''}</span></div><div class="xpbar"><i style="width:${SAVE.xp / this.need(SAVE.plv) * 100}%"></i></div>${hh ? `<div class="chip">🌙 Happy Hour bonus: +${hh} coins</div>` : ''}`;
    // next chest progress (endowed progress)
    const toChest = 3 - (n % 3 === 0 ? 3 : n % 3);
    $('wNextChest').innerHTML = n < 300 ? `<div class="dots">${[1, 2, 3].map(i => `<i class="${i <= (n % 3 || 3) ? 'on' : ''}"></i>`).join('')}</div>${toChest ? `Just <b>${toChest} more level${toChest > 1 ? 's' : ''}</b> → 🎁 CHEST` : '🎁 Chest unlocked!'}` : '';
    this.x('Next-Value (Agla reward dikhao)');
    const newA = this.checkAch();
    setTimeout(() => { const next = () => { if (ups) this.levelUp(ups); else if (newA.length) this.showAch(newA); }; if (!SAVE.heroDone) this.persona(next); else next(); }, 1700);
    if (G.newCardsRun && G.newCardsRun.length) { const nk = G.newCardsRun.slice(); setTimeout(() => nk.forEach(k => { const mt = MT[k] || {}; REWARD.show({ img: (window.ART && ART.i['t_' + k]) ? 't_' + k : 'm4', kick: '📖 NEW CODEX CARD', t: mt.name || 'New mosquito', sub: mt.desc || 'Added to the Codex' }); }), 2600); }
  },
  afterLose() {
    SAVE.overs++; SAVE.bests[CL.n] = Math.max(SAVE.bests[CL.n] || 0, G.score); this.addXP(G.kills * 2); this.checkAch(); save();
    this.x('Near-miss Effect ("itna paas")'); this.x('Loss Aversion (Revive)');
    const tips = TIPS.all;
    $('oTip').innerHTML = `<b>💡 Pro Tip:</b> ${tips[SAVE.overs % tips.length]}` + '';
    this.x('Personalization (Tip)');
  },
  levelUp(ups) {
    const r = this.rank(), g = 2 * ups; SAVE.gems += g; save();
    this.modal(`<div class="lvup">LEVEL UP!</div><div class="bigrank">${r[2]}</div><div class="big">PLAYER LEVEL ${SAVE.plv}</div><div class="sub">Title: <b>${r[1]}</b></div><div class="coins">💎 +${g}</div>
      <div class="teaser">Next title: ${(RANKS.find(x => x[0] > SAVE.plv) || ['', 'MAX'])[1]} ${(RANKS.find(x => x[0] > SAVE.plv) || [''])[0] ? '(Level ' + RANKS.find(x => x[0] > SAVE.plv)[0] + ')' : ''}</div>`, 'AWESOME ▶', () => { const a = this.checkAch(); if (a.length) this.showAch(a); });
    sfx.clear(); setTimeout(() => sfx.chest(), 300); vib([40, 40, 80]); this.x('Progress & Aspiration (Level Up)');
  },
  checkAch() {
    const s = Object.assign({}, SAVE.stats, { ts: Object.values(SAVE.stars).reduce((a, b) => a + b, 0), kc: Object.keys(SAVE.kosh).length, sk: SAVE.streak, pl: SAVE.plv });
    const got = []; for (const a of ACH) if (!SAVE.ach[a[0]] && a[4](s)) { SAVE.ach[a[0]] = 1; SAVE.gems += 2; got.push(a); }
    if (got.length) save(); return got;
  },
  showAch(list) { list.forEach((a, i) => setTimeout(() => { toast(`🏅 ACHIEVEMENT: ${a[1]} ${a[2]} · 💎+2`); sfx.chest(); this.x('Achievement (Mastery)'); }, i * 1900)); },
  /* ---------- league (AI rivals, clearly labelled) ---------- */
  league(add) {
    const wk = Math.floor(dayNum() / 7);
    if (!SAVE.league || SAVE.league.wk !== wk) SAVE.league = { wk, pts: 0, div: (SAVE.league && SAVE.league.div) || 0 };
    SAVE.league.pts += Math.round(add / 10);
  },
  rivals() {
    const wk = Math.floor(dayNum() / 7), r = seeded(wk * 31 + 5), dayIn = (dayNum() % 7) + 1;
    const names = ['Clever Chintu', 'Racket Raju', 'Zappy Zoya', 'Sleepy Ninja', 'Buzzy Bunty', 'Coil Kaka', 'Turbo Tara', 'Fan Pappu', 'Net Meena'];
    return names.map(n => ({ n: n + ' (AI)', p: Math.round((60 + r() * 140) * dayIn * (1 + (SAVE.league ? SAVE.league.div : 0) * 0.4)) }));
  },
  /* ---------- daily login / welcome back ---------- */
  onMap() {
    const today = dayNum(), now = Date.now();
    const gap = SAVE.lastSeen ? (now - SAVE.lastSeen) / 36e5 : 0; SAVE.lastSeen = now;
    this.ensureMissions();
    if (SAVE.lastDay !== today) {
      if (SAVE.lastDay === today - 1) SAVE.streak++;
      else if (SAVE.lastDay === today - 2 && SAVE.shield > 0) { SAVE.shield--; SAVE.streak++; toast('🛡️ Streak Shield saved your streak!'); }
      else SAVE.streak = 1;
      SAVE.lastDay = today; save();
    }
    save();
    if (gap > 20) { setTimeout(() => this.welcomeBack(), 300); return; }
    if (SAVE.claimedDay !== today) setTimeout(() => this.daily(), 400);
  },
  welcomeBack() {
    SAVE.coins += 100; SAVE.gems += 2; save();
    this.modal(`<div class="bigrank">🎁</div><div class="big">WELCOME BACK!</div><div class="sub">The mosquitoes multiplied without you… your family needs you!</div><div class="coins">${coinH(100)} &nbsp; 💎 +2</div>`, 'LET\'S GO ▶', () => { if (SAVE.claimedDay !== dayNum()) this.daily(); else renderMap(); });
    this.x('Follow-up Loop (Welcome back)');
  },
  daily() {
    const REW = [['c', 50], ['c', 75], ['g', 1], ['c', 100], ['g', 2], ['c', 150], ['g', 5]];
    const d = ((SAVE.streak - 1) % 7);
    const cells = REW.map((r, i) => `<div class="dcell ${i < d ? 'done' : i === d ? 'today' : ''}"><small>DAY ${i + 1}</small><span>${r[0] === 'g' ? '💎' : '🪙'}</span><b>${r[0] === 'g' ? r[1] : r[1]}</b>${i === 6 ? '<em>+🛡️</em>' : ''}</div>`).join('');
    this.modal(`<div class="kick">DAILY REWARD</div><div class="big">🔥 ${SAVE.streak} DAY STREAK</div><div class="sub">Come back daily for bigger rewards. Streak Shield on Day 7!</div><div class="dgrid">${cells}</div>`, 'CLAIM 🎁', () => {
      const r = REW[d]; if (r[0] === 'g') SAVE.gems += r[1]; else SAVE.coins += r[1]; if (d === 6) SAVE.shield++; SAVE.claimedDay = dayNum(); save(); sfx.chest(); vib([30, 30, 60]);
      toast(`${r[0] === 'g' ? '💎' : '🪙'} +${r[1]} claimed!`); renderMap(); this.checkAch();
    });
    this.x('Streak / Habit (Daily Login)');
  },
  /* ---------- screens ---------- */
  modal(html, btn, cb) {
    const el = $('meta'); $('metaBody').innerHTML = html + `<button class="btn pulse" id="metaOk">${btn}</button>`; el.classList.remove('hide');
    $('metaOk').onclick = () => { el.classList.add('hide'); cb && cb(); };
  },
  panel(html) { const el = $('meta'); $('metaBody').innerHTML = html + `<button class="btn2" id="metaOk" style="margin-top:16px">Close</button>`; el.classList.remove('hide'); $('metaOk').onclick = () => { el.classList.add('hide'); renderMap(); }; },
  hub() {
    const r = this.rank(), need = this.need(SAVE.plv), mr = this.missionsReady(), spinFree = SAVE.spinDay !== dayNum(), nc = SAVE.newCards.length, ev = this.eventBanner();
    const pa = [SAVE.avatar || '🦸‍♂️'];
    return `<div class="hub"><div class="pcard"><div class="av">${pa[0]}</div><div style="flex:1"><div class="pn">${SAVE.pname || 'Player'} <span class="rk">${r[2]} ${r[1]}</span></div>
      <div class="xprow"><span>Lv ${SAVE.plv}</span><span>${SAVE.xp}/${need} XP</span></div><div class="xpbar"><i style="width:${SAVE.xp / need * 100}%"></i></div></div>
      <div class="strk">🔥<b>${SAVE.streak}</b><small>streak</small></div></div>
      <div class="hstat"><span>🌙 Nights saved: <b>${SAVE.nightsTotal || 0}</b></span><span>❤️ ${RISHTE.hearts()}/5 ${RISHTE.heartTime()}</span><span>⭐ ${SAVE.starBank || 0} for the room</span></div>
      <div class="hbtns">
        <button data-h="missions">🎯<span>Missions</span>${mr ? `<i class="dot">${mr}</i>` : ''}</button>
        <button data-h="spin">🎡<span>Spin</span>${spinFree ? '<i class="dot">1</i>' : ''}</button>
        <button data-h="kosh">📖<span>Codex</span>${nc ? `<i class="dot">${nc}</i>` : ''}</button>
        <button data-h="league">🏆<span>League</span></button>
        <button data-h="ach">🏅<span>Badges</span></button>
        <button data-h="xray" class="${SAVE.xray ? 'xon' : ''}">🧠<span>X-Ray</span></button>${RISHTE.hubButtons()}
      </div>${ev.map(e => `<div class="evb">${e}</div>`).join('')}</div>`;
  },
  bindHub() {
    document.querySelectorAll('.hbtns button').forEach(b => b.onclick = () => { sfx.coin(); const h = b.dataset.h;
      if (h === 'missions') this.showMissions(); if (h === 'spin') this.showSpin(); if (h === 'kosh') this.showKosh(); if (h === 'league') this.showLeague(); if (h === 'ach') this.showAchList();
      if (h === 'xray') { SAVE.xray = !SAVE.xray; save(); renderMap(); toast(SAVE.xray ? '🧠 X-Ray ON: har psychology trigger screen pe dikhega' : 'X-Ray OFF'); if (SAVE.xray) this.x('X-Ray mode chalu'); }
    });
    RISHTE.bindHub();
    if (this.missionsReady() || SAVE.spinDay !== dayNum() || SAVE.newCards.length) this.x('Attention Trigger (Red Dot)');
  },
  showMissions() {
    const M = SAVE.missions, all = M.list.every(m => m.claimed);
    this.panel(`<div class="kick">DAILY MISSIONS</div><div class="big" style="font-size:34px">🎯 MISSIONS</div>
      <div class="mlist">${M.list.map((m, i) => `<div class="mrow ${m.claimed ? 'cl' : ''}"><div style="flex:1"><b>${m.t}</b><div class="xpbar"><i style="width:${m.cur / m.n * 100}%"></i></div><small>${m.cur}/${m.n} · Reward: ${m.r[0] ? '🪙' + m.r[0] : ''} ${m.r[1] ? '💎' + m.r[1] : ''}</small></div>
      ${m.claimed ? '✅' : m.cur >= m.n ? `<button class="buy" data-cl="${i}">CLAIM</button>` : ''}</div>`).join('')}</div>
      <div class="teaser">${all ? (M.bonus ? '✅ Today\'s bonus chest claimed' : '<button class="buy" id="mBonus">🎁 ALL DONE: CLAIM BONUS CHEST</button>') : '🎁 Finish all missions = BONUS CHEST'}</div>`);
    this.x('Goal Gradient + Endowed Progress');
    document.querySelectorAll('[data-cl]').forEach(b => b.onclick = () => { const m = M.list[+b.dataset.cl]; m.claimed = true; SAVE.coins += m.r[0]; SAVE.gems += m.r[1]; save(); sfx.chest(); this.showMissions(); });
    const mb = $('mBonus'); if (mb) mb.onclick = () => { M.bonus = true; const c = Math.round(rnd(150, 300)), g = 3; SAVE.coins += c; SAVE.gems += g; save(); sfx.chest(); vib([30, 30, 60]); toast(`🎁 Bonus chest: 🪙${c} 💎${g}`); this.showMissions(); };
  },
  showSpin() {
    const free = SAVE.spinDay !== dayNum(), canAd = SAVE.spinExtra < 2;
    const seg = 360 / SPIN.length;
    const grad = SPIN.map((s, i) => `${i % 2 ? '#743ae8' : '#9a6df5'} ${i * seg}deg ${(i + 1) * seg}deg`).join(',');
    this.panel(`<div class="kick">LUCKY SPIN</div><div class="big" style="font-size:34px">🎡 SPIN</div>
      <div class="wheelwrap"><div class="pin">▼</div><div class="wheel" id="wheel" style="background:conic-gradient(${grad})">${SPIN.map((s, i) => `<span style="transform:rotate(${i * seg + seg / 2}deg) translateY(-118px)">${s[0]}<small>${s[1]}</small></span>`).join('')}</div></div>
      <button class="btn" id="spinGo" ${free ? '' : 'style="display:none"'}>FREE SPIN ▶</button>
      <button class="adbtn" id="spinAd" ${!free && canAd ? '' : 'style="display:none"'}>📺 ONE MORE SPIN<small>WATCH AD (${2 - SAVE.spinExtra} left)</small></button>
      ${!free && !canAd ? '<div class="sub">Free spin again tomorrow 🌙</div>' : ''}
      <details class="odds"><summary>See odds</summary>${SPIN.map(s => `${s[0]} ${s[1]}: ${s[4]}%`).join(' · ')}</details>`);
    this.x('Variable Reward + Anticipation (Spin)');
    const go = () => {
      let r = Math.random() * 100, idx = 0; for (let i = 0; i < SPIN.length; i++) { r -= SPIN[i][4]; if (r <= 0) { idx = i; break; } }
      const wh = $('wheel'), target = 360 * 6 + (360 - (idx * seg + seg / 2));
      wh.style.transition = 'transform 4.2s cubic-bezier(.15,.85,.2,1)'; wh.style.transform = `rotate(${target}deg)`;
      let t = 0; const iv = setInterval(() => { t++; tone(1200, 1200, 0.02, 0.05, 'square'); if (t > 30) clearInterval(iv); }, 60 + t * 4);
      setTimeout(() => { const s = SPIN[idx]; if (s[2] === 'c') SAVE.coins += s[3]; else if (s[2] === 'g') SAVE.gems += s[3]; else SAVE.boost[s[3]] = (SAVE.boost[s[3]] || 0) + 1; save(); sfx.chest(); vib([30, 30, 80]); this.modal(`<div class="bigrank">${s[0]}</div><div class="big">${s[1]}!</div><div class="sub">Your lucky spin reward</div>`, 'NICE ▶', () => this.showSpin()); }, 4400);
    };
    const g = $('spinGo'); if (g) g.onclick = () => { g.disabled = true; SAVE.spinDay = dayNum(); save(); go(); };
    const a = $('spinAd'); if (a) a.onclick = () => { $('meta').classList.add('hide'); showAd(() => { SAVE.spinExtra++; save(); this.showSpin(); setTimeout(go, 300); }); };
  },
  showKosh() {
    const keys = MT_KEYS.concat(['heera']), got = keys.filter(k => SAVE.kosh[k] !== undefined).length, nw = SAVE.newCards.slice(); SAVE.newCards = []; save();
    this.panel(`<div class="kick">MOSQUITO CODEX</div><div class="big" style="font-size:34px">📖 ${got} / ${keys.length}</div><div class="xpbar" style="max-width:360px;margin:8px auto"><i style="width:${got / keys.length * 100}%"></i></div><div class="sub">All cards = 💎 +50 and the "Mosquito Encyclopedia" badge</div>
      <div class="kgrid">${keys.map(k => { const c = SAVE.kosh[k], m = MT[k], tier = c >= 200 ? 'gold' : c >= 50 ? 'silver' : c >= 10 ? 'bronze' : '';
        return c === undefined ? `<div class="kc lock"><span>❔</span><b>???</b><small>${TIERS[m.tier].name}</small></div>` : `<div class="kc ${tier} ${nw.includes(k) ? 'nw' : ''}"><span>${m.emoji}</span><b>${m.name}</b><small>${m.desc}</small><em>${c} swatted ${tier ? '· ' + tier.toUpperCase() : `· ${10 - c > 0 ? (10 - c) + ' more = BRONZE' : ''}`}</em></div>`; }).join('')}</div>`);
    if (got >= keys.length && !SAVE.ach.koshall) { SAVE.gems += 50; save(); }
    this.x('Collection / Completion (Kosh)');
  },
  showLeague() {
    this.league(0); const me = { n: (SAVE.pname || 'You') + ' (YOU)', p: SAVE.league.pts, me: 1 };
    const list = this.rivals().concat([me]).sort((a, b) => b.p - a.p), pos = list.indexOf(me) + 1, divs = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Legend'];
    this.panel(`<div class="kick">WEEKLY LEAGUE · ${divs[Math.min(4, SAVE.league.div)]}</div><div class="big" style="font-size:34px">🏆 RANK #${pos}</div>
      <div class="sub">Top 3 = next division · resets every week</div>
      <div class="lg">${list.map((r, i) => `<div class="lrow ${r.me ? 'me' : ''} ${i < 3 ? 'up' : ''}"><b>${i + 1}</b><span>${r.n}</span><em>${fmt(r.p)}</em></div>`).join('')}</div>
      <div class="teaser">${pos > 3 ? `${fmt(list[2].p - me.p + 1)} more points to reach the Top 3!` : '🔥 You are in the promotion zone!'}</div>
      <div class="sub" style="font-size:11px;opacity:.7">Rivals are AI players for now. Real players and city leaderboards are coming soon.</div>`);
    this.x('Social Comparison (League)');
  },
  showAchList() {
    this.panel(`<div class="kick">BADGES</div><div class="big" style="font-size:34px">🏅 ${Object.keys(SAVE.ach).length} / ${ACH.length}</div>
      <div class="kgrid">${ACH.map(a => `<div class="kc ${SAVE.ach[a[0]] ? 'gold' : 'lock'}"><span>${SAVE.ach[a[0]] ? a[1] : '🔒'}</span><b>${a[2]}</b><small>${a[3]}</small></div>`).join('')}</div>`);
  },
  persona(cb) {
    const av = SAVE.avatar || AVATARS[0];
    this.modal(`<div class="kick">FIRST NIGHT SAVED! 🌙</div><div class="big" style="font-size:30px">CREATE YOUR HERO</div><div class="sub">This name and face show on the leaderboard</div>
      <div class="heroPrev" id="hPrev">${av}</div>
      <div class="pgrid av8">${AVATARS.map(a => `<button class="pbtn ${a === av ? 'sel' : ''}" data-a="${a}">${a}</button>`).join('')}</div>
      <input id="pName" class="pin2" placeholder="Hero name" maxlength="14" value="${SAVE.pname && SAVE.pname !== 'Player' ? SAVE.pname : ''}">
      <div class="chip" style="margin-top:12px">🎁 Hero reward: 💎 +3</div>`, 'HERO READY ⚡', () => { SAVE.pname = ($('pName') && $('pName').value.trim()) || SAVE.pname || 'Racket Hero'; SAVE.avatar = SAVE.avatar || AVATARS[0]; if (!SAVE.heroDone) SAVE.gems = (SAVE.gems || 0) + 3; SAVE.heroDone = 1; save(); sfx.power(); cb && cb(); });
    document.querySelectorAll('.pbtn[data-a]').forEach(b => b.onclick = () => { SAVE.avatar = b.dataset.a; $('hPrev').textContent = b.dataset.a; $('hPrev').classList.remove('bump'); void $('hPrev').offsetWidth; $('hPrev').classList.add('bump'); document.querySelectorAll('.pbtn[data-a]').forEach(x => x.classList.toggle('sel', x === b)); sfx.coin(); });
    this.x('Identity / Ownership (Apna Hero)');
  },
  shareText() { return `🦟 I scored ${fmt(G.score)} on Level ${CL.n} in MACHHAR MAARO with a ${G.st.maxCombo} combo 🔥 Can you beat me? · A SANX Graphikians Game`; }
};
META.init();
window.META = META;

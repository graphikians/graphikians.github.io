/* ================= MACHHAR MAARO v3 — ENGINE ================= */
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
let W, H, DPR, S, bg, dk, dkx, bed, theme = 'bedroom';
let state = 'menu', CL = LEVELS[0], CW = WORLDS[0];

/* ---------- save ---------- */
let SAVE = { unlocked: 1, stars: {}, coins: 0, gems: 5, owned: ['sasta'], equip: 'sasta', upg: {}, boost: { coil: 1, shield: 1, battery: 0, mega: 0 }, ghar: [], best: 0, trial: null, adDay: '', adCount: 0 };
try { const s = JSON.parse(localStorage.getItem('mm_save3') || 'null'); if (s) SAVE = Object.assign(SAVE, s); } catch (e) {}
const save = () => { try { localStorage.setItem('mm_save3', JSON.stringify(SAVE)); } catch (e) {} };
const hasGhar = id => SAVE.ghar.includes(id);
function rkStats(id) {
  const b = RACKETS.find(r => r.id === id) || RACKETS[0], u = SAVE.upg[b.id] || { a: 0, b: 0, p: 0 };
  return Object.assign({}, b, { r: b.r * (1 + 0.04 * u.a), regen: b.regen * (1 + 0.06 * u.b) * (hasGhar('powerbank') ? 1.2 : 1), cost: b.cost * (1 - 0.03 * u.b), pow: b.pow + 0.03 * u.p, lv: u });
}
let RKC = null;
const RK = () => RKC || (RKC = rkStats(SAVE.trial || SAVE.equip));

/* ---------- layout ---------- */
function resize() {
  DPR = Math.min(window.R7 && R7.low ? 1.5 : 2, window.devicePixelRatio || 1);
  W = innerWidth; H = innerHeight;
  cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  S = Math.min(W / 400, H / 720);
  layoutBed();
  dk = document.createElement('canvas'); dk.width = W * DPR; dk.height = H * DPR; dkx = dk.getContext('2d');
  buildBg();
  if (G.sleepers && G.sleepers.length) G.sleepers = makeSleepers(G.sleepers);
}
addEventListener('resize', resize);
function setTheme(t) { if (theme !== t) { theme = t; G.lamp = null; buildBg(); } }

/* ---------- state ---------- */
const G = { t: 0, score: 0, disp: 0, combo: 0, comboT: 0, kills: 0, coins: 0, gems: 0, bat: 100, batMax: 100,
  mosq: [], parts: [], pops: [], bolts: [], items: [], eggs: [], bombs: [], jugnus: [], popups: [], rings: [], laser: [], annQ: [], ann: null,
  sleepers: [], shake: 0, slowT: 0, ts: 1, spawnT: 1, flash: 0, flashCol: '255,255,255', fan: 0, fanBoost: 0, fx: {},
  megaRing: 0, megaX: 0, megaY: 0, bosses: [], bossSpawnT: 0, revived: false, lamp: null, trapT: 12, snoreT: 2,
  st: {}, cine: null, cracks: null, shards: [], wave: 0, waveLeft: 0, waveT: 0, ranisSpawned: 0, raniT: 0, freeMega: 0,
  zapsLeft: 0, hbT: 0, pulse: 0, lastSec: 99, cmdT: 0, flickT: 4, flickOn: 0, boomer: null, zapCount: 0, rainT: 0, itemT: 4 };
const ptr = { down: false, x: -999, y: -999, lx: 0, ly: 0, downAt: 0, moved: 0, vis: 0, ang: -0.5, zapT: 0, actKills: 0, charge: 0, heat: 0, hotT: 0, lastZx: -999, lastZy: -999, still: 0, teslaT: 0, sixT: 0 };

function layoutBed() {
  const multi = CL && CL.task === 'multi';
  const base = multi ? 600 : 340, bsc = clamp(W * (multi ? 0.95 : 0.74) / (base * S), multi ? 0.45 : 0.82, multi ? 1.5 : 1.75);
  const bw = base * S * bsc;
  const bx = multi ? W / 2 - bw / 2 + 4 * S : clamp(W / 2 - bw / 2 + 30 * S * bsc, 70 * S * bsc, W - bw - 10 * S);
  bed = { x: bx, y: H * 0.80, w: bw, h: H * 0.12, u: S * bsc, sc: bsc };
}
function makeSleepers(prev) {
  layoutBed();
  const arr = [];
  const mk = (kind, x, sc, end, pose) => { sc *= bed.sc; const o = { kind, x, y: bed.y - 27 * S * sc, sc, end, neend: 100, bitten: 0, noiseCd: 0, karvT: rnd(10, 16), wig: 0, pose: pose || 'back', prevPose: pose || 'back', poseT: 0, marks: [], scratch: 0, scratchAt: 0 }; o.pts = posePts(o); return o; };
  if (CL.task === 'multi') {
    const u = bed.u, x1 = bed.x + 40 * u, x2 = bed.x + bed.w * 0.37, x3 = bed.x + bed.w * 0.7;
    arr.push(mk(CW.sleeper, x1, 0.85, x2 - 44 * u, 'back'), mk('mummy', x2, 0.82, x3 - 44 * u, 'side'), mk('bachcha', x3, 0.72, bed.x + bed.w - 24 * u, 'sprawl'));
  } else if (CW.cid && CHARS[CW.cid] && CHARS[CW.cid].q === 'baby') {
    arr.push(mk(CW.sleeper, bed.x + 42 * bed.u, 1, bed.x + bed.w * 0.56, 'back'), mk('bachcha', bed.x + bed.w * 0.62, 0.62, bed.x + bed.w - 26 * bed.u, 'back'));
    arr[1].cid = 'bachcha';
  } else arr.push(mk(CW.sleeper, bed.x + 42 * bed.u, 1, bed.x + bed.w - (theme === 'hostel' ? 44 : 26) * bed.u, CW.cid && CHARS[CW.cid] && CHARS[CW.cid].q === 'kicker' ? 'sprawl' : 'back'));
  arr[0].main = true;
  arr.forEach((s, i) => { if (i === 0) s.cid = CW.cid || s.kind; else s.cid = s.cid || s.kind; const ch = CHARS[s.cid]; s.look = LOOK[ch ? ch.look : s.kind] || {}; });
  if (CL.task === 'sleepwalk') { const s = arr[0]; s.walk = true; s.x = W * 0.2; s.y = H * 0.55; s.dir = 1; s.pts = [{ x: 0, y: 0, face: 1 }, { x: 0, y: 45 * S }, { x: 10 * S, y: 95 * S }]; }
  if (prev) arr.forEach((s, i) => { if (prev[i]) { s.neend = prev[i].neend; if (s.walk) s.x = clamp(prev[i].x, W * 0.15, W * 0.85); } });
  return arr;
}
const mainS = () => G.sleepers[0];
const minNeend = () => Math.min(...G.sleepers.map(s => s.neend));
/* har insaan ki neend alag: dadi/bachche jaldi uthte hain */
const SENS_MAP = { dadi: 1.6, dada: 1.4, nani: 1.6, nana: 1.4, bachcha: 1.5, baby: 1.7, mummy: 1.15, behen: 1.1 };
const SENS = s => SENS_MAP[s.cid] || SENS_MAP[s.kind] || 1;
function applySens() { for (const s of G.sleepers) { if (s._pn === undefined) s._pn = s.neend; const d = s._pn - s.neend; if (d > 0) s.neend -= d * (SENS(s) - 1); s._pn = s.neend; } }

/* ---------- level start ---------- */
let useBoost = {};
function startLevel(n, boosts) {
  CL = typeof n === 'object' ? n : LEVELS[n - 1]; CW = RISHTE.withChar(WORLDS[CL.w]); setTheme(CW.theme); RKC = null; G.fw = []; G.fwT = 2;
  Object.assign(G, { t: 0, score: 0, disp: 0, combo: 0, comboT: 0, kills: 0, coins: 0, gems: 0, bat: 100, batMax: 100, mosq: [], parts: [], pops: [], bolts: [], items: [], eggs: [], bombs: [], jugnus: [], popups: [], rings: [], laser: [], annQ: [], ann: null,
    spawnT: 1.4, flash: 0, fanBoost: 0, fx: {}, bosses: [], bossSpawnT: CL.task === 'boss' ? 2 : 0, revived: false, trapT: rnd(9, 14), cine: null, cracks: null, shards: [],
    wave: 0, waveLeft: 0, waveT: 1.5, ranisSpawned: 0, raniT: 1, freeMega: 0, zapsLeft: CL.zaps || 0, hbT: 0, pulse: 0, lastSec: 99, cmdT: 0, flickT: 4, flickOn: 0, boomer: null, zapCount: 0, rainT: 0, itemT: 4,
    st: { bites: 0, faceBites: 0, maxCombo: 0, air: 0, megaUsed: 0, trapsHit: 0, overheated: 0, defused: 0, collected: 0, jugnuHits: 0, type: {}, raniKilled: 0, noise: 0 } });
  G.sleepers = makeSleepers();
  Object.assign(ptr, { heat: 0, hotT: 0, down: false, vis: 0 });
  useBoost = boosts || {};
  if (useBoost.coil) G.fx.coil = 8;
  if (useBoost.shield) G.fx.shield = 8;
  if (useBoost.battery) { G.batMax = 150; G.bat = 150; }
  if (useBoost.mega) G.freeMega = 3;
  if (hasGhar('cream')) G.fx.shield = Math.max(G.fx.shield || 0, 4);
  if (CL.task === 'jugnu') for (let i = 0; i < 5; i++) spawnJugnu();
  state = 'play'; META.onStart(); HZ.start();
  pop(CL.ev ? 'EVENT LEVEL!' : CL.task === 'boss' ? 'BOSS FIGHT!' : `LEVEL ${CL.n}`, W / 2, H * 0.4, 50, '#fff', 1.5);
  pop(TASKS[CL.task].icon + ' ' + TASKS[CL.task].name, W / 2, H * 0.4 + 44 * S, 22, '#d9ccff', 1.5);
}

/* ---------- spawning ---------- */
const TW = { easy: 4, medium: 3, hard: 2.2, pro: 1.6, expert: 1.3 };
function pickType() {
  const n = CL.n, pool = MT_KEYS.filter(k => MT[k].unlock <= n && k !== 'bachcha');
  let tot = 0; const ws = pool.map(k => {
    let w = TW[MT[k].tier];
    if (CL.newType === k) w *= 3; if (CL.task === 'hunt' && CL.huntType === k) w *= 3;
    if (k === 'rani') w *= 0.35; if (n - MT[k].unlock > 25) w *= 0.6; if (k === 'mafia') w *= 0.5;
    tot += w; return w;
  });
  let r = Math.random() * tot; for (let i = 0; i < pool.length; i++) { r -= ws[i]; if (r <= 0) return pool[i]; }
  return 'normal';
}
function edgePos() {
  const side = Math.random();
  if (side < 0.38) return [-30 * S, rnd(H * 0.1, H * 0.6)];
  if (side < 0.76) return [W + 30 * S, rnd(H * 0.1, H * 0.6)];
  return [rnd(W * 0.1, W * 0.9), -30 * S];
}
function spawnMosq(type, x, y, extra) {
  type = type || pickType();
  if (x === undefined) [x, y] = edgePos();
  const c = MT[type];
  const spd = c.sp * S * (CL.diff || 1) * (hasGhar('pankha') ? 0.93 : 1) * (RISHTE.q() === 'snore' ? 1.1 : 1) * (RISHTE.has('ac') ? 0.95 : 1);
  const tierSmart = { easy: 0, medium: 0.15, hard: 0.35, pro: 0.5, expert: 0.65 }[TIER_ORDER[Math.min(4, CL.w + (CL.p > 10 ? 1 : 0))]];
  const m = Object.assign({ t: type, x, y, vx: 0, vy: 0, sp: spd, size: c.size, hp: c.hp, maxhp: c.hp, wa: c.wa, wf: c.wf, dmg: c.dmg, pts: c.pts, coin: c.coin,
    ph: Math.random() * 10, flap: Math.random() * 10, stage: 0, state: 'fly', biteT: 0.4, fed: 0, hitCd: 0, dir: 1, hurt: 0, sT: rnd(2.5, 4), retT: 0,
    smart: type === 'chalak' ? 1 : tierSmart, wp: { x: rnd(W * 0.15, W * 0.85), y: rnd(H * 0.18, H * 0.58) }, trail: [] }, extra || {});
  chooseTarget(m);
  if (['phone', 'gamer'].includes(RISHTE.q()) && G.sleepers[0] && Math.random() < 0.5 && !extra) m.wp = { x: G.sleepers[0].x + 34 * S + rnd(-30, 30) * S, y: bed.y - rnd(50, 90) * S };
  G.mosq.push(m);
  if (type === 'clone' && !m.decoy) for (let i = 0; i < 2; i++) spawnMosq('clone', x + rnd(-40, 40) * S, y + rnd(-30, 30) * S, { decoy: true, hp: 1, pts: 0, coin: 0, dmg: 0 });
  if (type === 'mafia' && !m.follow) for (let i = 1; i <= 2; i++) spawnMosq('mafia', x, y, { follow: m, fo: { x: -i * 26 * S, y: (i % 2 ? 1 : -1) * 18 * S } });
  return m;
}
function chooseTarget(m, avoid) {
  const ss = G.sleepers; if (!ss.length) return;
  const s = ss[(Math.random() * ss.length) | 0];
  let i = (Math.random() * s.pts.length) | 0;
  if ((avoid || m.smart > 0.5) && ptr.vis > 0) {
    let best = -1; s.pts.forEach((p, k) => { const d = Math.hypot(s.x + p.x - ptr.x, s.y + p.y - ptr.y); if (d > best) { best = d; i = k; } });
  }
  m.ts = s; m.ti = i;
}
const tpos = m => { const s = m.ts, p = s.pts[m.ti] || s.pts[0]; return [s.x + p.x, s.y + p.y]; };
function spawnBoss(key, x, opts) {
  const b = BOSSES[key];
  const m = Object.assign({ boss: true, key, b, x: x !== undefined ? x : W / 2, y: -90 * S, vx: 0, vy: 0, size: 3.1, hp: b.hp, maxhp: b.hp, ph: 0, flap: 0, dir: 1, hurt: 0, hitCd: 0,
    mode: 'enter', timer: 1.6, sumT: 4, phase: 1, act: 0, tired: 0, wp: { x: W / 2, y: H * 0.3 }, pts: 1000, coin: 80, enraged: false, guards: 0, books: 0 }, opts || {});
  G.mosq.push(m); if (!m.fake) G.bosses.push(m);
  return m;
}
function introBoss() {
  const b = BOSSES[CL.boss];
  if (b.twin) { spawnBoss(CL.boss, W * 0.35); spawnBoss(CL.boss, W * 0.65, { twinB: true }); }
  else spawnBoss(CL.boss);
  G.bossCard = { t: 0, b }; sfx.boss(); shake(14); vib([60, 40, 60]); slow(0.8);
}
function spawnJugnu() { G.jugnus.push({ x: rnd(W * 0.1, W * 0.9), y: rnd(H * 0.2, H * 0.65), ph: Math.random() * 10, wp: { x: rnd(W * 0.1, W * 0.9), y: rnd(H * 0.2, H * 0.65) } }); }

/* ---------- fx helpers ---------- */
let ANN_PRI = 0;
function pop(txt, x, y, size, col, life = 0.9, rise = 40) {
  if (state === 'play' && Math.abs(x - W / 2) < 2 && String(txt).length > 3) return ann(txt, size, col, life, ANN_PRI);
  if (state === 'play' && size > 15) size = 15 + (size - 15) * 0.35; // khel ke beech chhota text
  G.pops.push({ txt, x, y, size, col, life, max: life, rise });
}
/* Announcement queue: centre messages ek waqt pe ek, max 2 line, baaki line mein */
function ann(txt, size, col, life, pri) {
  const now = performance.now(); if (!G.annQ) G.annQ = [];
  const q = G.annQ, last = G.annLast && (G.annLast === G.ann || q.includes(G.annLast)) ? G.annLast : null;
  if (last && now - last.at < 40) { if (last.lines.length < 2) last.lines.push({ txt, size: Math.min(size, 22), col }); return; } // same frame = same message; 3rd line drop
  const all = (G.ann ? [G.ann] : []).concat(q);
  if (all.some(a => a.lines[0].txt === txt)) return;
  const a = { lines: [{ txt, size: Math.min(size, 34), col }], life: clamp(life, 0.9, 2.2), t: 0, at: now, pri }; G.annLast = a;
  if (pri) { q.unshift(a); if (G.ann && !G.ann.pri) G.ann.life = Math.min(G.ann.life, G.ann.t + 0.12); }
  else { q.push(a); while (q.length > 2) { const i = q.findIndex(x => !x.pri); q.splice(i < 0 ? 0 : i, 1); } }
}
function annUpdate(dt) {
  const q = G.annQ || (G.annQ = []);
  if (G.ann) { G.ann.t += dt; if (q.length && G.ann.t > 0.7 && !G.ann.pri) G.ann.life = Math.min(G.ann.life, G.ann.t + 0.15); if (G.ann.t >= G.ann.life) G.ann = null; }
  if (!G.ann && q.length) { G.ann = q.shift(); G.ann.t = 0; }
}
function sparks(x, y, n, spd, cols, g = 120) {
  for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = rnd(0.3, 1) * spd * S;
    G.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rnd(0.25, 0.6), max: 0.6, size: rnd(1.2, 3.2) * S, col: cols[(Math.random() * cols.length) | 0], g: g * S }); }
}
function smoke(x, y, n) { for (let i = 0; i < n; i++) G.parts.push({ x: x + rnd(-10, 10) * S, y, vx: rnd(-20, 20) * S, vy: rnd(-80, -40) * S, life: rnd(0.6, 1.1), max: 1.1, size: rnd(6, 12) * S, col: 'smoke', g: -20 * S }); }
function bolt(x1, y1, x2, y2, life = 0.16, w = 1) {
  const pts = [], n = 9, dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
  for (let i = 0; i <= n; i++) { const k = i / n, j = (i === 0 || i === n) ? 0 : rnd(-1, 1) * Math.min(22 * S, len * 0.18); pts.push([x1 + dx * k + nx * j, y1 + dy * k + ny * j]); }
  G.bolts.push({ pts, life, max: life, w });
}
const slow = d => { G.slowT = Math.max(G.slowT, d); };
const shake = a => { G.shake = Math.max(G.shake, a * S); };
let popCd = {};
function popOnce(key, cd, ...a) { const now = performance.now(); if ((popCd[key] || 0) > now) return; popCd[key] = now + cd * 1000; pop(...a); }

/* ---------- combat ---------- */
const R = () => 46 * S * RK().r * (G.fx.small > 0 ? 0.6 : 1);
function distSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy || 1, t = clamp(((px - x1) * dx + (py - y1) * dy) / l2, 0, 1);
  return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t));
}
function zapNoise(x, y) {
  for (const s of G.sleepers) {
    if (Math.hypot(x - s.x, y - s.y) < 62 * S && s.noiseCd <= 0 && !(G.fx.shield > 0)) {
      s.neend -= (window.R7 && R7.noiseK ? R7.noiseK() : 1) * 1.3 * ({ light: 2, secret: 1.5, silent: 2.6, deaf: 0 }[RISHTE.q()] ?? 1); s.noiseCd = 0.4; G.st.noise++;
      popOnce('shor', 1.2, 'TOO LOUD! 🔊 Do not zap near the ear', s.x + 40 * S, s.y - 60 * S, 13, '#d9ccff', 0.9);
      sfx.noise();
    }
  }
}
const canZap = () => { if (ptr.hotT > 0) { popOnce('hot', 0.8, 'RACKET GARAM! 🔥', ptr.x, ptr.y - 60 * S, 18, '#fff', 0.7); return false; } if (G.fx.jam > 0) { popOnce('jam', 0.8, 'RACKET JAM! 🥶', ptr.x, ptr.y - 60 * S, 18, '#fff', 0.7); return false; } return true; };
function addHeat(v) {
  ptr.heat = Math.min(100, ptr.heat + v);
  if (ptr.heat >= 100 && ptr.hotT <= 0) { ptr.hotT = 2; ptr.heat = 100; G.st.overheated++; sfx.hot(); vib([30, 30, 30]); pop('RACKET OVERHEATED! 🔥', W / 2, H * 0.5, 26, '#fff', 1.1); pop('Do not stay still. Keep moving!', W / 2, H * 0.5 + 30 * S, 15, '#d9ccff', 1.1); }
}
let chaining = false;
function hit(m, fx, fy, dmg = 1, how = 'tap') {
  if (m.dead || m.hitCd > 0) return false;
  if (m.t === 'ghost' && !m.solid) { popOnce('ghost', 0.6, 'PHASED! 👻 wait for the glow', m.x, m.y - 30 * S, 15, '#d9ccff', 0.6); return false; }
  if (m.t === 'shieldwala' && how !== 'mega' && (fx - m.x) * m.dir > 0) {
    m.hitCd = 0.25; sfx.block(); sparks(m.x + m.dir * 14 * S, m.y, 8, 140, ['#fff', `rgb(${ELEC})`]);
    popOnce('blk', 0.7, 'BLOCKED! 🛡️ hit from BEHIND', m.x, m.y - 30 * S, 16, '#fff', 0.7); return false;
  }
  const rk = RK(); let crit = Math.random() < rk.pow;
  m.hitCd = m.boss ? 0.12 : 0.18;
  if (m.boss) return hitBoss(m, fx, fy, dmg * (crit ? 2 : 1), crit, how);
  m.hp -= dmg * (crit ? 2 : 1); m.lastHit = 0;
  bolt(fx, fy, m.x, m.y);
  if (crit) pop('CRIT! 💥', m.x, m.y - 34 * S, 15, '#fff', 0.5);
  if (rk.id === 'frost') G.mosq.forEach(o => { if (!o.boss && Math.hypot(o.x - m.x, o.y - m.y) < 90 * S) o.frozen = 2; });
  if (m.hp > 0) {
    m.hurt = 0.25; sfx.crack(); sparks(m.x, m.y, 8, 160, ['#fff', `rgb(${ELEC})`]);
    pop(m.t === 'helmet' && m.hp === 1 ? 'HELMET BROKEN!' : m.t === 'electric' ? `⚡ ${m.hp} more!` : 'CRACK!', m.x, m.y - 20 * S, 15, '#d9ccff', 0.5); shake(3);
    const a = Math.atan2(m.y - fy, m.x - fx); m.vx += Math.cos(a) * 200 * S; m.vy += Math.sin(a) * 200 * S;
    if (m.state === 'bite') { m.state = 'fly'; m.stage = 1; chooseTarget(m, true); }
    return false;
  }
  kill(m, how); return true;
}
function kill(m, how) {
  m.dead = true;
  if (m.decoy) { sparks(m.x, m.y, 12, 150, [P2, '#fff']); pop('FAKE! 👥', m.x, m.y - 20 * S, 15, '#d9ccff', 0.5); sfx.miss(); return; }
  const near = G.sleepers.some(s => s.pts.some(p => Math.hypot(m.x - s.x - p.x, m.y - s.y - p.y) < 110 * S));
  G.kills++; G.st.type[m.t] = (G.st.type[m.t] || 0) + 1; if (m.t === 'rani') G.st.raniKilled++;
  let pts = m.pts;
  if (!near) { G.combo++; G.comboT = 1.6; G.st.air++; pts *= 2; } else { G.comboT = Math.max(G.comboT, 0.6); }
  G.st.maxCombo = Math.max(G.st.maxCombo, G.combo);
  const mult = 1 + Math.floor(G.combo / 5); pts *= mult * (G.fever > 0 ? 3 : 1);
  if (RK().id === 'cricket' && how === 'swipe' && ptr.speed > 1400 * S) { pts = Math.round(pts * 1.5); popOnce('six', 0.6, 'SIXER! 🏏', m.x, m.y - 50 * S, 22, '#fff', 0.7); }
  sparks(m.x, m.y, 16, 260, ['#ffffff', `rgb(${ELEC})`, `rgb(${ELEC})`, P2]);
  if (m.fed > 0) sparks(m.x, m.y, 10, 140, [P2, P1, '#c7b0ff']);
  G.parts.push({ x: m.x, y: m.y, vx: 0, vy: 0, life: 0.25, max: 0.25, size: 26 * S * m.size, col: 'ring', g: 0 });
  sfx.zap(); sfx.kill(G.combo); vib(m.size > 1.4 ? 35 : 14); shake(m.size > 1.4 ? 7 : 3);
  if (m.state === 'bite') { pts += 30; pop('BACHA LIYA! +30', m.x, m.y - 26 * S, 16, '#fff', 0.8); }
  G.score += pts; G.coins += m.coin;
  META.onKill(m, near); if (m.t === 'heera') META.heeraKilled(m);
  pop((near ? '+' : 'HAWA +') + pts, m.x, m.y, 14 + Math.min(10, G.combo), near ? '#d9ccff' : `rgb(${ELEC})`, 0.6, 50);
  if (m.t === 'split') for (let i = 0; i < 2; i++) spawnMosq('bachcha', m.x + rnd(-10, 10) * S, m.y, { stage: 1 });
  if (m.t === 'ninja' || m.t === 'chameleon') pop('GOT IT! 🎯', m.x, m.y - 40 * S, 16, '#fff', 0.7);
  if (m.t === 'doctor') pop('DOCTOR DOWN! ➕', m.x, m.y - 40 * S, 16, '#fff', 0.7);
  if (!chaining && Math.random() < (CL.task === 'collect' ? 0.3 : 0.07)) dropItem(m.x, m.y, 'good');
  const cm = { 5: 'GREAT!', 10: 'DEADLY!', 15: 'AWESOME!', 20: 'MOSQUITO DOOM!', 30: 'LEGEND! 👑' };
  if (!near && (cm[G.combo] || (G.combo > 30 && G.combo % 10 === 0))) {
    pop(cm[G.combo] || 'UNSTOPPABLE!', W / 2, H * 0.34, 40, '#fff', 1.2, 30); pop(`x${mult} COMBO`, W / 2, H * 0.34 + 38 * S, 20, '#d9ccff', 1.2, 30);
    G.flash = 0.25; G.flashCol = '154,109,245'; vib([20, 30, 40]); if (G.combo >= 10) { slow(0.45); sfx.whoosh(); }
  }
  const rk = RK(), ch = Math.max(rk.id === 'thunder' ? 2 : (rk.id === 'brahmastra' || rk.id === 'sanxai') ? 1 : 0, G.fever > 0 ? 1 : 0);
  if (ch && !chaining) {
    chaining = true;
    G.mosq.filter(o => !o.dead && !o.boss && o !== m && Math.hypot(o.x - m.x, o.y - m.y) < 150 * S).sort((a, b) => Math.hypot(a.x - m.x, a.y - m.y) - Math.hypot(b.x - m.x, b.y - m.y)).slice(0, ch)
      .forEach(o => { o.hitCd = 0; hit(o, m.x, m.y, 1, 'chain'); });
    chaining = false;
  }
}
function hitBoss(m, fx, fy, dmg, crit, how) {
  bolt(fx, fy, m.x, m.y);
  if (m.fake) { m.dead = true; sparks(m.x, m.y, 30, 220, [P2, '#fff']); pop('FAKE! Look for the real shadow', m.x, m.y - 50 * S, 16, '#fff', 0.8); sfx.tele(); return true; }
  if (m.guards > 0 || m.books > 0) { sfx.block(); popOnce('bblk', 0.7, m.books > 0 ? 'BOOK SHIELD! 📚 Break the books first' : 'BODYGUARDS! 🕴️ Take them out first', m.x, m.y - 70 * S, 15, '#fff', 0.8); return false; }
  if (m.tired > 0) dmg *= 2;
  m.hp -= dmg; m.hurt = 0.2; G.score += 15 * dmg; sfx.crack(); sparks(m.x, m.y, 10, 200, ['#fff', `rgb(${ELEC})`]); shake(3);
  if (crit) pop('CRIT! 💥', m.x, m.y - 60 * S, 18, '#fff', 0.5);
  if (m.tired > 0) popOnce('tired', 0.5, '2X DAMAGE!', m.x, m.y - 80 * S, 16, `rgb(${ELEC})`, 0.5);
  if (m.mode === 'dash' || m.mode === 'warn') { m.mode = 'tired'; m.tired = 1.4; pop('DASH ROKA! +100', m.x, m.y - 50 * S, 22, '#fff', 0.9); G.score += 100; slow(0.25); sfx.whoosh(); }
  const ph = m.hp / m.maxhp <= 0.33 ? 3 : m.hp / m.maxhp <= 0.66 ? 2 : 1;
  if (ph > m.phase && m.hp > 0) bossPhase(m, ph);
  if (m.hp <= 0) { bossDie(m); return true; }
  return false;
}
function bossPhase(m, ph) {
  m.phase = ph; sfx.phase(); sfx.roar(); shake(14); G.flash = 0.5; G.flashCol = '154,109,245'; slow(0.5);
  pop(`PHASE ${ph}!`, W / 2, H * 0.3, 40, '#fff', 1.3); pop(ph === 3 ? 'NOW HE IS ANGRY! 😡' : 'The boss got faster!', W / 2, H * 0.3 + 36 * S, 18, '#d9ccff', 1.3);
  if (m.b.moves.includes('guards')) spawnGuards(m);
  if (m.b.moves.includes('split') && ph === 2 && !m.child) { m.hp = Math.ceil(m.hp / 2); m.maxhp = m.maxhp / 2; const c = spawnBoss(m.key, m.x + 60 * S, { hp: m.hp, maxhp: m.maxhp, child: true, phase: 2, mode: 'hover', y: m.y }); m.child = true; c.size = m.size = 2.5; pop('THE BOSS SPLIT IN TWO! 🌧️', W / 2, H * 0.36, 18, '#fff', 1.2); }
  for (let i = 0; i < 3; i++) spawnMosq(m.b.summon, m.x, m.y, { stage: 1 });
}
function bossDie(m) {
  m.dead = true; G.score += m.pts; G.coins += m.coin;
  for (let i = 0; i < 6; i++) setTimeout(() => { sparks(m.x + rnd(-50, 50) * S, m.y + rnd(-50, 50) * S, 34, 340, ['#fff', `rgb(${ELEC})`, P2, P1]); sfx.mega(); shake(16); }, i * 130);
  for (let i = 0; i < 18; i++) { const a = i / 18 * 6.283; bolt(m.x, m.y, m.x + Math.cos(a) * 220 * S, m.y + Math.sin(a) * 220 * S, 0.5, 1.5); }
  G.mosq.forEach(o => { if (o.guard === m) o.hp = 1; });
  const alive = G.bosses.filter(b => !b.dead);
  if (alive.length) { alive.forEach(o => { if (!o.enraged) { o.enraged = true; bossPhase(o, 3); } }); pop('ONE DOWN… THE OTHER WENT CRAZY! 😡', W / 2, H * 0.3, 20, '#fff', 1.4); return; }
  pop(`${m.b.name} DOWN! 💥`, W / 2, H * 0.35, 30, '#fff', 1.8); pop('+1000', m.x, m.y, 34, `rgb(${ELEC})`, 1.2);
  G.flash = 0.9; G.flashCol = '235,235,255'; slow(1.0); vib([80, 40, 120]); G.gems += 5;
  winLevel();
}
function spawnGuards(m) { m.guards = 4; for (let i = 0; i < 4; i++) spawnMosq(m.key === 'ranimaa' ? 'motu' : 'helmet', m.x, m.y, { guard: m, ga: i / 4 * 6.283, hp: 2, maxhp: 2 }); pop('BODYGUARDS AAYE! 🕴️', m.x, m.y + 70 * S, 16, '#fff', 0.9); }
function multiPop(n, x, y) { if (n < 2) return; pop(n === 2 ? 'DOUBLE!' : n === 3 ? 'TRIPLE!' : `MULTI x${n}!`, x, y - 60 * S, 26, '#fff', 0.9); G.score += n * 15; shake(5); }

function hitAt(x, y, rad, how, dmg = 1) {
  let n = 0;
  for (const m of G.mosq) if (!m.dead && Math.hypot(m.x - x, m.y - y) < rad + 10 * S * m.size * (m.boss ? 1.6 : 1)) { if (hit(m, x, y, dmg, how)) n++; if (!m.boss) zapNoise(m.x, m.y); }
  for (const e of G.eggs) if (!e.dead && Math.hypot(e.x - x, e.y - y) < rad + 8 * S) { e.dead = true; G.score += 15; pop('EGG SMASHED! 🥚', e.x, e.y - 20 * S, 14, '#fff', 0.6); sparks(e.x, e.y, 8, 120, ['#fff', P2]); }
  for (const b of G.bombs) if (!b.dead && Math.hypot(b.x - x, b.y - y) < rad + 10 * S) { b.dead = true; G.score += 30; G.st.defused++; pop('BOMB DEFUSE! +30', b.x, b.y - 20 * S, 15, '#fff', 0.6); sfx.defuse(); sparks(b.x, b.y, 12, 160, ['#fff', `rgb(${ELEC})`]); }
  for (const j of G.jugnus) if (!j.dead && Math.hypot(j.x - x, j.y - y) < rad) { j.dead = true; G.st.jugnuHits++; G.score = Math.max(0, G.score - 100); pop(`DO NOT HIT FIREFLIES! 😢 (${G.st.jugnuHits}/3)`, j.x, j.y - 30 * S, 18, '#fff', 1); sfx.trap(); vib(80); setTimeout(spawnJugnu, 3000); }
  for (const it of G.items) if (!it.got && Math.hypot(it.x - x, it.y - y) < rad + 22 * S) useItem(it);
  return n;
}
function closePopups(x, y) {
  for (const p of G.popups) if (!p.dead && x > p.x && x < p.x + p.w && y > p.y && y < p.y + p.h) { p.dead = true; G.score += 50; pop('SCAM BLOCKED! 🛡️ +50', x, y, 18, '#fff', 0.8); sfx.defuse(); return true; }
  return false;
}
function zapAt(x, y) {
  if (closePopups(x, y)) return 0;
  if (CL.task === 'swipe') { for (const it of G.items) if (!it.got && Math.hypot(it.x - x, it.y - y) < R() + 22 * S) useItem(it); popOnce('swonly', 1.5, 'SWIPE only! 👆', x, y - 50 * S, 15, '#d9ccff', 0.7); return 0; }
  if (!canZap()) return 0;
  const cost = 3 * RK().cost;
  if (G.bat < cost) { lowBat(x, y); return 0; }
  if (CL.task === 'limzap') { if (G.zapsLeft <= 0) { popOnce('nz', 1, 'OUT OF ZAPS!', x, y - 50 * S, 18, '#fff', 0.7); return 0; } G.zapsLeft--; }
  G.bat -= cost; ptr.zapT = 0.18; G.zapCount++;
  // AIM ASSIST: ungli thodi chook jaaye to bhi paas wala machhar lock ho jaata hai
  const rr = R(); let tx = x, ty = y;
  const inR = G.mosq.some(m => !m.dead && !m.decoy && Math.hypot(m.x - x, m.y - y) < rr + 10 * S * m.size * (m.boss ? 1.6 : 1));
  if (!inR) {
    const tg = G.mosq.filter(m => !m.dead && !m.decoy && !(m.t === 'ghost' && !m.solid) && Math.hypot(m.x - x, m.y - y) < rr * 2.1 + 14 * S * m.size * (m.boss ? 1.6 : 1)).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
    if (tg) { tx = tg.x; ty = tg.y; bolt(x, y, tx, ty, 0.12, 0.9); }
  }
  const before = G.kills;
  let n = hitAt(tx, ty, rr, 'tap'); HZ.zapped(x, y, rr);
  const killed = G.kills > before, dz = Math.hypot(x - ptr.lastZx, y - ptr.lastZy);
  // garmi sirf khaali tap pe; maarne pe racket thanda hota hai + aadhi battery wapas
  if (killed) { ptr.heat = Math.max(0, ptr.heat - 6); G.bat = Math.min(G.batMax, G.bat + cost * 0.6); } else addHeat(dz < 50 * S ? 9 : 2);
  ptr.lastZx = x; ptr.lastZy = y;
  if (RK().id === 'sanxai') {
    const t = G.mosq.filter(m => !m.dead && !m.decoy && Math.hypot(m.x - x, m.y - y) < 220 * S).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
    if (t) { bolt(x, y, t.x, t.y, 0.25, 1.2); if (hit(t, x, y, 1, 'ai')) n++; }
  }
  if (RK().id === 'brahmastra' && G.zapCount % 10 === 0) { G.freeMega++; mega(x, y); pop('BRAHMASTRA! 🔱', x, y - 80 * S, 26, '#fff', 0.9); }
  if (n === 0) { sfx.miss(); sparks(x, y, 5, 90, [`rgb(${ELEC})`, '#fff']); bolt(x + rnd(-1, 1) * 20 * S, y + rnd(-1, 1) * 20 * S, x + rnd(-1, 1) * 20 * S, y + rnd(-1, 1) * 20 * S, 0.08, 0.6); }
  zapNoise(x, y);
  return n;
}
function swing(x1, y1, x2, y2) {
  if (!canZap()) return 0;
  const rk = RK(), rad = R() * 0.8 * (rk.id === 'laser' ? 1.5 : 1);
  // DRAG = battery tez khaata hai (soch ke ghumao); khinchte waqt recharge band
  { const dist = Math.hypot(x2 - x1, y2 - y1), k = CL.task === 'swipe' ? 0.35 : 1; G.bat = Math.max(0, G.bat - dist / S * 0.026 * rk.cost * k); G.dragT = 0.7; if (G.bat <= 0.5) { lowBat(x2, y2); return 0; } }
  if (rk.id === 'laser') G.laser.push({ x1, y1, x2, y2, life: 0.35 });
  HZ.swipe(x1, y1, x2, y2); HZ.zapSeg(x1, y1, x2, y2, rad * 0.6);
  let n = 0;
  for (const it of G.items) if (!it.got && distSeg(it.x, it.y, x1, y1, x2, y2) < rad + 20 * S) useItem(it);
  for (const b of G.bombs) if (!b.dead && distSeg(b.x, b.y, x1, y1, x2, y2) < rad) hitAt(b.x, b.y, 1, 'swipe');
  for (const e of G.eggs) if (!e.dead && distSeg(e.x, e.y, x1, y1, x2, y2) < rad) hitAt(e.x, e.y, 1, 'swipe');
  for (const j of G.jugnus) if (!j.dead && distSeg(j.x, j.y, x1, y1, x2, y2) < rad * 0.7) hitAt(j.x, j.y, 1, 'swipe');
  for (const m of G.mosq) {
    if (m.dead || m.hitCd > 0) continue;
    if (distSeg(m.x, m.y, x1, y1, x2, y2) < rad + 8 * S * m.size * (m.boss ? 1.6 : 1)) {
      const c = (CL.task === 'swipe' ? 2 : 3) * rk.cost; if (G.bat < c) { lowBat(x2, y2); break; }
      if (CL.task === 'limzap') { if (G.zapsLeft <= 0) break; G.zapsLeft--; }
      G.bat -= c; ptr.zapT = 0.18; addHeat(2);
      if (hit(m, x2, y2, 1, 'swipe')) n++;
      if (!m.boss) zapNoise(m.x, m.y);
    }
  }
  return n;
}
function lowBat(x, y) { popOnce('lb', 0.8, 'BATTERY EMPTY! 🔋', x, y - 50 * S, 18, '#d9ccff', 0.8); sfx.low(); }
function mega(x, y) {
  if (CL.task === 'swipe') return;
  if (!canZap()) return;
  const rk = RK(), c = 30 * rk.cost;
  if (G.freeMega > 0) G.freeMega--; else { if (G.bat < c) { lowBat(x, y); return; } G.bat -= c; }
  if (CL.task === 'limzap') { if (G.zapsLeft < 3) { popOnce('nz', 1, 'OUT OF ZAPS!', x, y - 50 * S, 18, '#fff', 0.7); return; } G.zapsLeft -= 3; }
  G.st.megaUsed++;
  if (rk.id === 'boomerang') { G.boomer = { t: 0, x, y }; pop('BOOMERANG! 🪃', x, y - 40 * S, 30, '#fff', 0.9); sfx.whoosh(); return; }
  const rad = 165 * S * rk.r; HZ.zapped(x, y, rad); G.megaRing = 0.5; G.megaX = x; G.megaY = y;
  for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283; bolt(x, y, x + Math.cos(a) * rad, y + Math.sin(a) * rad, 0.3, 1.3); }
  for (const m of G.mosq) m.hitCd = Math.hypot(m.x - x, m.y - y) < rad ? 0 : m.hitCd;
  const n = hitAt(x, y, rad, 'mega', 1) ;
  G.mosq.forEach(m => { if (m.boss && !m.dead && Math.hypot(m.x - x, m.y - y) < rad) { m.hitCd = 0; hit(m, x, y, 2, 'mega'); } });
  sfx.mega(); vib([40, 30, 60]); shake(14); G.flash = 0.35; G.flashCol = ELEC; addHeat(20);
  pop('MEGA ZAP!', x, y - 40 * S, 34, '#fff', 0.9); multiPop(n, x, y); if (n >= 3) slow(0.4);
}

/* ---------- items & traps ---------- */
function dropItem(x, y, kind, key) {
  if (kind === 'good') key = key || GOOD_KEYS[(Math.random() * (GOOD_KEYS.length - (Math.random() < 0.8 ? 1 : 0))) | 0];
  else if (kind === 'trap') key = key || TRAP_KEYS[(Math.random() * TRAP_KEYS.length) | 0];
  G.items.push({ kind, key, x, y, vy: kind === 'trap' ? 30 * S : -60 * S, life: kind === 'trap' ? 99 : 7, ph: Math.random() * 6, disguise: null });
  if (kind === 'good') pop('POWER-UP! 🎁', x, y - 30 * S, 14, '#fff', 0.7);
  return G.items[G.items.length - 1];
}
function useItem(it) {
  it.got = true;
  if (it.kind === 'trap') { G.st.defused++; META.ev('defuse'); G.score += 200; sfx.defuse(); vib(20); pop('TRAP DEFUSED! +200', it.x, it.y - 20 * S, 20, '#fff', 0.9); sparks(it.x, it.y, 22, 220, ['#fff', `rgb(${ELEC})`]); return; }
  if (it.kind === 'mystery') { if (Math.random() < 0.55) { it.kind = 'good'; it.key = GOOD_KEYS[(Math.random() * GOOD_KEYS.length) | 0]; } else { triggerTrap(it.x, it.y, TRAP_KEYS[(Math.random() * TRAP_KEYS.length) | 0]); return; } }
  const d = ITEMS[it.key]; G.st.collected++; META.ev('collect');
  sfx.power(); vib([15, 20, 15]); G.flash = 0.3; G.flashCol = '199,176,255';
  pop(d.name, W / 2, H * 0.45, 30, '#fff', 1.1); sparks(it.x, it.y, 20, 220, ['#fff', P2, `rgb(${ELEC})`]);
  if (it.key === 'coil') G.fx.coil = 6;
  if (it.key === 'shield') G.fx.shield = 6;
  if (it.key === 'battery') G.bat = G.batMax;
  if (it.key === 'bag') { G.coins += 25; sfx.coin(); }
  if (it.key === 'gem') { G.gems += 1; sfx.coin(); }
  if (it.key === 'pankha') {
    G.fanBoost = 3;
    for (const m of G.mosq) if (!m.dead && !m.boss) { m.state = 'fly'; m.stage = 0; m.vx = (m.x < W / 2 ? -1 : 1) * 520 * S; m.vy = -260 * S; m.wp = { x: rnd(W * 0.15, W * 0.85), y: rnd(H * 0.15, H * 0.4) }; m.stunT = 1.2; }
  }
}
function triggerTrap(x, y, key) {
  const d = ITEMS[key]; G.st.trapsHit++;
  sfx.trap(); vib([60, 30, 60]); shake(8); G.flash = 0.4; G.flashCol = '20,10,40';
  pop(d.icon + ' ' + d.name, W / 2, H * 0.42, 30, '#fff', 1.3); pop('TRAP HIT!', W / 2, H * 0.42 + 32 * S, 16, '#d9ccff', 1.3);
  if (d.fx === 'karvat') { G.sleepers.forEach(s => { s.wig = 0.7; if (!s.walk) setPose(s); }); G.mosq.forEach(m => { if (!m.boss) chooseTarget(m); }); return; }
  G.fx[d.fx] = Math.max(G.fx[d.fx] || 0, d.dur);
  if (d.fx === 'double') for (let i = 0; i < 5; i++) spawnMosq();
  if (d.fx === 'small') RKC = null;
}

/* ---------- input ---------- */
cv.addEventListener('pointerdown', e => {
  if (state !== 'play') return;
  const x = e.clientX, y = e.clientY;
  if (HZ.tap(x, y)) { ptr.x = x; ptr.y = y; ptr.vis = 1; return; }
  Object.assign(ptr, { down: true, x, y, lx: x, ly: y, downAt: performance.now(), moved: 0, vis: 1, charge: 0, chargedFx: false, lastT: performance.now() });
  multiPop(zapAt(x, y), x, y);
  try { cv.setPointerCapture(e.pointerId); } catch (er) {}
});
cv.addEventListener('pointermove', e => {
  const x = e.clientX, y = e.clientY;
  if (!ptr.down) { if (e.pointerType === 'mouse') { ptr.x = x; ptr.y = y; } return; }
  const now = performance.now(), dtm = Math.max(1, now - (ptr.lastT || now)) / 1000; ptr.lastT = now;
  ptr.lx = ptr.x; ptr.ly = ptr.y; ptr.x = x; ptr.y = y;
  const d = Math.hypot(x - ptr.lx, y - ptr.ly); ptr.moved += d; ptr.speed = d / dtm;
  if (d > 1) ptr.ang = clamp(ptr.ang + (x - ptr.lx) * 0.01, -1.2, 0.4);
  if (state === 'play' && d > 2) ptr.actKills += swing(ptr.lx, ptr.ly, x, y);
});
const up = () => {
  if (!ptr.down) return; ptr.down = false;
  if (state === 'play' && ptr.charge >= 1) mega(ptr.x, ptr.y);
  if (ptr.actKills >= 2) multiPop(ptr.actKills, ptr.x, ptr.y);
  ptr.actKills = 0; ptr.charge = 0;
};
cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

/* ---------- boss AI ---------- */
function bossMove(m, tx, ty, sp, gdt) {
  const dx = tx - m.x, dy = ty - m.y, d = Math.hypot(dx, dy) || 1, k = Math.min(1, gdt * 3);
  m.vx += (dx / d * sp - m.vx) * k; m.vy += (dy / d * sp - m.vy) * k; m.x += m.vx * gdt; m.y += m.vy * gdt;
  if (Math.abs(m.vx) > 8) m.dir = m.vx > 0 ? 1 : -1; return d;
}
function updateBoss(m, gdt) {
  const b = m.b, spM = (1 + 0.2 * (m.phase - 1)) * (m.enraged ? 1.15 : 1) * (G.fx.coil > 0 ? 0.6 : 1) * (G.fx.turbo > 0 ? 1.3 : 1);
  m.timer -= gdt; m.sumT -= gdt; m.tired -= gdt;
  m.guards = G.mosq.filter(o => !o.dead && o.guard === m).length;
  if (m.books > 0) m.bookA = (m.bookA || 0) + gdt * 2;
  const tgt = mainS();
  if (m.mode === 'enter') { bossMove(m, m.x, H * 0.3, 160 * S, gdt); if (m.timer <= 0) { m.mode = 'hover'; m.timer = 1.5; if (!m.fake) pop(`"${b.taunt}"`, W / 2, H * 0.22, 15, '#fff', 2, 10); } return; }
  if (m.mode === 'hover' || m.mode === 'tired') {
    const sp = (m.mode === 'tired' ? 40 : 120) * S * spM;
    const d = bossMove(m, m.wp.x + Math.sin(m.ph * 2) * 30 * S, m.wp.y + Math.cos(m.ph * 3) * 14 * S, sp, gdt);
    if (d < 30 * S) m.wp = { x: rnd(W * 0.2, W * 0.8), y: rnd(H * 0.15, H * 0.42) };
    if (m.mode === 'tired' && m.tired <= 0) { m.mode = 'hover'; m.timer = rnd(1.2, 2) / spM; }
    if (m.mode === 'hover' && m.timer <= 0) doBossAct(m);
  } else if (m.mode === 'warn') {
    m.x += Math.sin(m.ph * 60) * 1.5 * S; m.aim = [tgt.x + 20 * S, tgt.y - 6 * S];
    if (m.timer <= 0) m.mode = 'dash';
  } else if (m.mode === 'dash') {
    const [tx, ty] = m.aim || [tgt.x, tgt.y];
    const d = bossMove(m, tx, ty, b.sp * S * spM, gdt);
    if (d < 28 * S) {
      if (!m.fake) {
        if (G.fx.shield > 0) pop('SHIELD! 🛡️', tx, ty - 50 * S, 18, '#fff', 0.7);
        else { tgt.neend -= 12; tgt.bitten = 0.9; G.st.bites++; G.st.faceBites++; pop('-12 😫', tx + 20 * S, ty - 30 * S, 22, '#c7b0ff', 0.8); sfx.bite(); vib(80); shake(12); }
      }
      m.mode = 'tired'; m.tired = 1.6; m.wp = { x: rnd(W * 0.2, W * 0.8), y: rnd(H * 0.2, H * 0.4) };
      if (!m.fake) pop('EXHAUSTED! 2X DAMAGE 🎯', m.x, m.y - 70 * S, 15, `rgb(${ELEC})`, 1);
    }
  } else if (m.mode === 'beat') {
    m.beatT -= gdt;
    if (m.beatT <= 0) {
      m.beats--; m.beatT = 0.42; tone(110, 60, 0.15, 0.4); shake(6); G.rings.push({ x: m.x, y: m.y, r: 0, max: 140 * S, a: 0.6 });
      if (m.beats <= 0) { m.mode = 'tired'; m.tired = 1.5; return; }
      m.aim = [tgt.x + rnd(-80, 160) * S, tgt.y - rnd(30, 120) * S];
    }
    if (m.aim) bossMove(m, m.aim[0], m.aim[1], 520 * S, gdt);
    if (m.aim && Math.hypot(m.x - tgt.x, m.y - tgt.y) < 40 * S && !m.beatHit) { m.beatHit = 1; tgt.neend -= 6; G.st.bites++; pop('-6 🎵', tgt.x, tgt.y - 40 * S, 18, '#c7b0ff', 0.7); }
  } else if (m.mode === 'drain') {
    m.timer2 -= gdt; bossMove(m, m.wp.x, m.wp.y, 60 * S, gdt);
    if (ptr.vis > 0 && Math.hypot(ptr.x - m.x, ptr.y - m.y) < 300 * S) { G.bat = Math.max(0, G.bat - 14 * gdt); m.draining = 1; popOnce('drn', 1.2, 'BATTERY BEING DRAINED! 🪫 Move away', ptr.x, ptr.y - 70 * S, 15, '#fff', 0.8); } else m.draining = 0;
    if (m.timer2 <= 0) { m.mode = 'hover'; m.timer = 1.5; m.draining = 0; }
  }
  // summons
  if (m.sumT <= 0 && !m.fake) { m.sumT = (7 - m.phase) / (m.enraged ? 1.3 : 1); for (let i = 0; i < 2 + m.phase; i++) spawnMosq(b.summon, m.x + rnd(-30, 30) * S, m.y + rnd(-20, 20) * S, { stage: 1 }); pop('CALLED THE ARMY! 🦟', m.x, m.y + 70 * S, 15, '#d9ccff', 0.8); }
}
function doBossAct(m) {
  const b = m.b, mv = b.moves;
  let act = mv[(m.act++) % mv.length];
  if (m.fake) act = 'dash';
  if (act !== 'dash' && Math.random() < 0.35) act = 'dash';
  const tgt = mainS();
  switch (act) {
    case 'dash': m.mode = 'warn'; m.timer = Math.max(0.35, 0.75 - 0.12 * m.phase); m.aim = [tgt.x + 20 * S, tgt.y - 6 * S]; if (!m.fake) pop('⚠️', m.x, m.y - 70 * S, 34, '#fff', 0.6, 10); break;
    case 'teleport':
      sparks(m.x, m.y, 25, 220, [P2, '#fff']); sfx.tele(); m.x = rnd(W * 0.15, W * 0.85); m.y = rnd(H * 0.15, H * 0.45); m.vx = m.vy = 0; sparks(m.x, m.y, 25, 220, [P2, '#fff']);
      pop('VANISHED! 💨', m.x, m.y - 60 * S, 18, '#fff', 0.7); m.timer = 0.8; break;
    case 'yawn': m.mode = 'tired'; m.tired = 2.6; pop('YAAAWN… 🥱 (asleep, hit it now!)', m.x, m.y - 70 * S, 16, '#fff', 1.4); for (let i = 0; i < 3; i++) spawnMosq('sust', m.x, m.y, { stage: 1 }); break;
    case 'books': if (m.books <= 0) { m.books = 3; for (let i = 0; i < 3; i++) spawnMosq('helmet', m.x, m.y, { guard: m, ga: i / 3 * 6.283, book: true, hp: 1, maxhp: 1, pts: 30 }); pop('BOOK SHIELD! 📚', m.x, m.y - 70 * S, 18, '#fff', 1); } m.timer = 2; break;
    case 'beat': m.mode = 'beat'; m.beats = 3 + m.phase; m.beatT = 0.2; m.beatHit = 0; pop('BEAT DROP! 🎵', m.x, m.y - 70 * S, 20, '#fff', 0.9); break;
    case 'bass': G.rings.push({ x: m.x, y: m.y, r: 0, max: Math.max(W, H), a: 1, bass: true, sp: 420 * S }); sfx.roar(); shake(10); pop('BASS DROP! 🔊 keep the racket away', m.x, m.y - 70 * S, 16, '#fff', 1); m.timer = 2; break;
    case 'train': { const y = rnd(H * 0.3, H * 0.6), dir = Math.random() < 0.5 ? 1 : -1; for (let i = 0; i < 6 + m.phase * 2; i++) spawnMosq('tez', dir > 0 ? -40 * S - i * 34 * S : W + 40 * S + i * 34 * S, y + Math.sin(i) * 10 * S, { train: dir, stage: 1 }); pop('CHOO CHOO! 🚂 TRAIN INCOMING', W / 2, y - 40 * S, 18, '#fff', 1.1); tone(600, 500, 0.6, 0.15, 'square'); m.timer = 2.5; break; }
    case 'guards': if (m.guards <= 0) spawnGuards(m); m.timer = 2; break;
    case 'drain': m.mode = 'drain'; m.timer2 = 3; pop('OVERTIME! 💼 BATTERY STOLEN', m.x, m.y - 70 * S, 16, '#fff', 1); break;
    case 'split': case 'rain': G.rainT = 4; for (let i = 0; i < 4; i++) spawnMosq('bachcha', rnd(W * 0.1, W * 0.9), -20 * S, { stage: 1 }); pop('RAIN! 🌧️', W / 2, H * 0.25, 20, '#fff', 1); m.timer = 2; break;
    case 'clones': for (let i = 0; i < 2; i++) spawnBoss(m.key, rnd(W * 0.2, W * 0.8), { fake: true, y: rnd(H * 0.15, H * 0.4), hp: 1, maxhp: 1, mode: 'hover', timer: rnd(0.5, 1.5), size: m.size, b: m.b }); m.x = rnd(W * 0.2, W * 0.8); pop('CLONES! Only the real one has a SHADOW', W / 2, H * 0.25, 17, '#fff', 1.2); m.timer = 1.5; break;
    case 'otp': for (let i = 0; i < 1 + Math.floor(m.phase / 2); i++) G.popups.push({ x: rnd(10, W - 250 * S), y: rnd(H * 0.25, H * 0.65), w: Math.min(W - 20, 240 * S), h: 70 * S, life: 6, code: Math.floor(rnd(1000, 9999)) }); pop('FAKE OTP! Tap to close it 📵', W / 2, H * 0.2, 16, '#fff', 1.2); m.timer = 2; break;
    case 'fakeitems': for (let i = 0; i < 2; i++) { const it = dropItem(rnd(W * 0.15, W * 0.85), rnd(H * 0.2, H * 0.4), 'trap'); it.disguise = GOOD_KEYS[(Math.random() * 4) | 0]; it.vy = 15 * S; } pop('Free power-ups?? 🤔', W / 2, H * 0.3, 16, '#fff', 1); m.timer = 2; break;
    case 'eggs': for (let i = 0; i < 2 + m.phase; i++) G.eggs.push({ x: m.x + rnd(-60, 60) * S, y: m.y + rnd(20, 60) * S, t: 3.2, vy: 40 * S }); pop('EGGS! 🥚 smash them fast', m.x, m.y - 70 * S, 16, '#fff', 1); m.timer = 2; break;
    case 'command': G.cmdT = 6; spawnMosq('mafia'); pop('ARMY, GET SMART! 🎖️', W / 2, H * 0.25, 20, '#fff', 1.1); m.timer = 2; break;
    default: m.mode = 'warn'; m.timer = 0.6;
  }
}

/* ---------- update ---------- */
const timedTask = () => !!(CL.len);
const timeLeft = () => CL.len ? Math.max(0, CL.len - G.t) : 0;
function update(dt) {
  if (G.ready > 0) { G.ready -= dt; G.ts = 0; if (G.ready <= 0) G.ts = 1; }
  else if (G.hs > 0) { G.hs -= dt; G.ts = G.hs > 0 ? 0.03 : (G.slowT > 0 ? 0.22 : 1); }
  else if (G.slowT > 0) { G.slowT -= dt; G.ts += (0.22 - G.ts) * Math.min(1, dt * 20); } else G.ts += (1 - G.ts) * Math.min(1, dt * 6);
  const gdt = dt * G.ts;
  const powercut = CL.task === 'powercut' && state === 'play';
  G.fan += gdt * (powercut ? 0.3 : 9 + (G.fanBoost > 0 ? 30 : 0)) * HZ.fanMul(); G.fanBoost -= gdt;
  G.disp += (G.score - G.disp) * Math.min(1, dt * 8);
  if (state === 'play') {
    G.t += gdt;
    for (const k in G.fx) { G.fx[k] -= gdt; if (G.fx[k] <= 0) { delete G.fx[k]; if (k === 'small') RKC = null; } }
    if (G.bossSpawnT > 0) { G.bossSpawnT -= gdt; if (G.bossSpawnT <= 0) introBoss(); }
    if (G.bossCard) { G.bossCard.t += dt; if (G.bossCard.t > 2.6) G.bossCard = null; }
    // spawns
    if (CL.task === 'waves') updateWaves(gdt);
    else {
      G.spawnT -= gdt;
      const prog = CL.len ? G.t / CL.len : CL.target ? progress().cur / CL.target : 0.4;
      let base = 1.3 * Math.pow(0.975, CL.p) * (1 - 0.09 * CL.w) * (1 - 0.3 * clamp(prog, 0, 1));
      if (CL.task === 'boss') base = 2.8; if (powercut) base *= 0.65; if (G.fx.double > 0) base *= 0.5; if (hasGhar('jaali')) base *= 1.1;
      if (CL.task === 'timeattack' || CL.task === 'score' || CL.task === 'combo') base *= 0.7;
      { const qq = RISHTE.q(); if (qq === 'early') base *= 0.85; if (qq === 'phone' || qq === 'gamer') base *= 0.9; } base *= HZ.spawnMul();
      if (G.spawnT <= 0) {
        spawnMosq();
        if (CL.n >= 4 && Math.random() < 0.12) { for (let i = 0; i < 3; i++) spawnMosq(CL.n >= 4 ? 'bachcha' : 'normal'); popOnce('jh', 3, 'SWARM INCOMING! 🦟🦟', W / 2, H * 0.25, 20, '#d9ccff', 1); }
        G.spawnT = Math.max(0.28, base) * rnd(0.7, 1.2);
      }
    }
    if (CL.task === 'rani' && G.ranisSpawned < CL.target) { G.raniT -= gdt; if (G.raniT <= 0) { G.raniT = 6; G.ranisSpawned++; spawnMosq('rani'); pop('THE QUEEN IS HERE! 👑', W / 2, H * 0.25, 22, '#fff', 1); } }
    if (CL.task === 'collect') { G.itemT -= gdt; if (G.itemT <= 0) { G.itemT = rnd(3, 5); Math.random() < 0.3 ? (G.items.push({ kind: 'mystery', key: 'mys', x: rnd(W * 0.15, W * 0.85), y: rnd(H * 0.2, H * 0.55), vy: 0, life: 7, ph: 0 })) : dropItem(rnd(W * 0.15, W * 0.85), rnd(H * 0.2, H * 0.55), 'good'); } }
    if (CL.n >= 4 && CL.task !== 'boss' || (CL.task === 'boss' && CL.w >= 2)) {
      G.trapT -= gdt;
      if (G.trapT <= 0) { G.trapT = rnd(9, 15) / (1 + CL.w * 0.15); if (Math.random() < 0.6) dropItem(rnd(W * 0.15, W * 0.85), -20 * S, 'trap'); else G.items.push({ kind: 'mystery', key: 'mys', x: rnd(W * 0.15, W * 0.85), y: rnd(H * 0.2, H * 0.5), vy: 0, life: 7, ph: 0 }); }
    }
    if (powercut) { G.flickT -= gdt; if (G.flickT <= 0) { G.flickOn = 1.3; G.flickT = rnd(3, 6); sfx.hot(); } G.flickOn -= gdt; }
    // battery & heat
    const regen = CL.task === 'limbat' ? 0 : 15.6 * RK().regen;
    G.dragT = (G.dragT || 0) - gdt; G.bat = Math.min(G.batMax, G.bat + (G.dragT > 0 ? 0 : regen) * gdt - (G.fx.leak > 0 ? 12 * gdt : 0)); G.bat = Math.max(0, G.bat);
    if (ptr.down) { const sd = Math.hypot(ptr.x - (ptr.sx || ptr.x), ptr.y - (ptr.sy || ptr.y)); ptr.still = sd < 6 * S ? ptr.still + gdt : 0; ptr.sx = ptr.x; ptr.sy = ptr.y; if (ptr.still > 0.6) addHeat(32 * gdt); }
    ptr.heat = Math.max(0, ptr.heat - (ptr.down && ptr.still > 0.6 ? 0 : 38) * gdt);
    if (ptr.hotT > 0) { ptr.hotT -= gdt; if (Math.random() < 0.3) smoke(ptr.x, ptr.y - 10 * S, 1); if (ptr.hotT <= 0) ptr.heat = 30; }
    // tesla
    if (RK().id === 'tesla' && ptr.down && ptr.hotT <= 0) { ptr.teslaT -= gdt; if (ptr.teslaT <= 0) { ptr.teslaT = 0.8; const t = G.mosq.filter(m => !m.dead && Math.hypot(m.x - ptr.x, m.y - ptr.y) < 160 * S)[0]; if (t && G.bat > 2) { G.bat -= 2; bolt(ptr.x, ptr.y, t.x, t.y, 0.25, 1.2); hit(t, ptr.x, ptr.y, 1, 'tesla'); sfx.zap(); } } }
    // boomerang
    if (G.boomer) { const b = G.boomer; b.t += gdt; const a = b.t / 1.4 * 6.283; const bx = W / 2 + Math.cos(a + Math.PI) * W * 0.4 + (b.x - W / 2) * (1 - b.t / 1.4), by = H * 0.45 + Math.sin(a) * H * 0.28; b.px = bx; b.py = by; b.rot = b.t * 30; hitAt(bx, by, R() * 1.2, 'boom'); sparks(bx, by, 2, 80, [`rgb(${ELEC})`, '#fff']); if (b.t >= 1.4) G.boomer = null; }
    // combo
    G.comboT -= gdt; if (G.comboT <= 0 && G.combo > 0) { if (G.combo >= 5) pop(`${G.combo} COMBO`, W / 2, H * 0.3, 18, '#bfaef0', 0.7); G.combo = 0; }
    if (ptr.down && ptr.moved < 16 * S) {
      ptr.charge = clamp((performance.now() - ptr.downAt - 280) / 520, 0, 1);
      if (ptr.charge >= 1 && !ptr.chargedFx) { ptr.chargedFx = true; vib(10); tone(880, 1760, 0.12, 0.06); }
    } else { ptr.charge = 0; ptr.chargedFx = false; }
    G.snoreT -= gdt; if (G.snoreT <= 0) { G.snoreT = 3.4; if (mainS().bitten <= 0) sfx.snore(); }
    // heartbeat timer
    if (timedTask()) {
      const rem = timeLeft(), sec = Math.ceil(rem);
      if (rem <= 10 && rem > 0) {
        G.hbT -= dt; if (G.hbT <= 0) { sfx.heart(1 + (10 - rem) / 8); G.hbT = 0.35 + rem * 0.05; G.pulse = 1; vib(15); }
        if (sec !== G.lastSec) { sfx.tick(); if (sec === 5) pop('5 SECONDS LEFT! ⏰', W / 2, H * 0.36, 30, '#fff', 1); if (sec === 3) pop('3…', W / 2, H * 0.44, 46, '#fff', 0.8); if (sec === 2) pop('2…', W / 2, H * 0.44, 50, '#fff', 0.8); if (sec === 1) pop('1…', W / 2, H * 0.44, 54, '#fff', 0.8); }
      }
      G.lastSec = sec;
    }
  }
  G.pulse = Math.max(0, G.pulse - dt * 3);
  // sleepers
  for (const s of G.sleepers) {
    s.bitten -= gdt; s.noiseCd -= gdt; s.wig = Math.max(0, s.wig - gdt);
    if (state === 'play') {
      if (s.walk) { s.x += s.dir * 32 * S * gdt; if (s.x > W * 0.85) s.dir = -1; if (s.x < W * 0.15) s.dir = 1; }
      else { s.karvT -= gdt; if (s.karvT <= 0) { s.karvT = s.main && ['kicker', 'tosser'].includes(RISHTE.q()) ? rnd(5, 8) : rnd(10, 16); s.wig = 0.6; setPose(s); let kn = 0; G.mosq.forEach(m => { if (m.ts === s && m.state === 'bite' && !m.boss) { m.state = 'fly'; m.stage = 1; m.vy = -200 * S; chooseTarget(m); kn++; } }); pop(kn ? 'ROLLED OVER! 🔄 mosquitoes scattered' : 'ROLLED OVER! 🔄', s.x + 60 * S, s.y - 50 * S, 15, '#d9ccff', 0.8); } }
    }
  }
  // mosquitoes
  let biters = new Set(), flyCount = 0, panSum = 0, nearest = 1e9;
  const coil = G.fx.coil > 0 ? 0.4 : 1, turbo = G.fx.turbo > 0 ? 1.5 : 1, ulta = G.fx.ulta > 0 ? 1.6 : 1;
  const leaders = G.mosq.filter(o => !o.dead && (o.t === 'leader' || o.t === 'commander' || o.t === 'doctor'));
  for (const m of G.mosq) {
    if (m.dead) continue;
    m.flap += gdt * 70; m.ph += gdt; m.hitCd -= gdt; m.hurt -= gdt;
    if (m.trail) { m.trail.unshift([m.x, m.y]); if (m.trail.length > 4) m.trail.pop(); }
    if (state === 'wake' || state === 'clear' || state === 'fail') { m.vy -= 300 * S * gdt; m.x += m.vx * gdt; m.y += m.vy * gdt; continue; }
    if (state !== 'play' && state !== 'menu') continue;
    if (m.boss) { flyCount += 2; panSum += ((m.x / W) * 2 - 1) * 2; updateBoss(m, gdt); continue; }
    if (m.heera) { META.updHeera(m, gdt); continue; }
    if (m.ear) { HZ.earMove(m, gdt); continue; }
    if (m.glassSit > 0) continue;
    if (m.frozen > 0) { m.frozen -= gdt; continue; }
    if (m.guard) { const g = m.guard; if (g.dead) { m.guard = null; } else { m.ga += gdt * (m.book ? 2.4 : 1.6); m.x = g.x + Math.cos(m.ga) * 70 * S; m.y = g.y + Math.sin(m.ga) * 50 * S; m.dir = Math.cos(m.ga + 1.57) > 0 ? 1 : -1; if (m.book) g.books = G.mosq.filter(o => !o.dead && o.guard === g && o.book).length; continue; } }
    if (m.train) { m.x += m.train * 320 * S * gdt * coil; m.dir = m.train; if ((m.train > 0 && m.x > W + 60 * S) || (m.train < 0 && m.x < -60 * S)) m.dead = true; continue; }
    if (m.stunT > 0) { m.stunT -= gdt; m.vx *= 0.97; m.vy *= 0.97; m.x += m.vx * gdt; m.y += m.vy * gdt; continue; }
    // type behaviours
    m.sT -= gdt;
    if (m.t === 'rani' && state === 'play' && m.sT <= 0) { m.sT = 4.2; for (let i = 0; i < 2; i++) spawnMosq('bachcha', m.x, m.y); pop('BABIES! 🐣', m.x, m.y - 30 * S, 14, '#d9ccff', 0.7); }
    if (m.t === 'teleporter' && m.sT <= 0) { m.sT = rnd(2.5, 3.5); sparks(m.x, m.y, 10, 120, [P2, '#fff']); m.x = clamp(m.x + rnd(-150, 150) * S, 20, W - 20); m.y = clamp(m.y + rnd(-100, 60) * S, 40, H * 0.75); sparks(m.x, m.y, 10, 120, [P2, '#fff']); if (m.state === 'bite') m.state = 'fly'; }
    if (m.t === 'bomber' && m.sT <= 0 && m.y < bed.y - 120 * S) { m.sT = 4; G.bombs.push({ x: m.x, y: m.y + 10 * S, vy: 30 * S }); popOnce('bomb', 2, 'ITCH BOMB! 💣 zap it', m.x, m.y - 30 * S, 14, '#fff', 0.7); }
    if (m.t === 'doctor' && m.sT <= 0) { m.sT = 2.5; m.healFx = 0.5; G.mosq.forEach(o => { if (!o.dead && !o.boss && o !== m && Math.hypot(o.x - m.x, o.y - m.y) < 150 * S && o.hp < o.maxhp) { o.hp = o.maxhp; pop('+HEAL', o.x, o.y - 20 * S, 12, '#fff', 0.5); } }); }
    if (m.t === 'electric') { m.lastHit = (m.lastHit || 0) + gdt; if (m.lastHit > 1.1 && m.hp < m.maxhp) { m.hp = m.maxhp; m.lastHit = 0; popOnce('ele' + m.ph, 1, 'RECHARGE! ⚡', m.x, m.y - 20 * S, 12, '#fff', 0.5); } }
    if (m.t === 'ghost') { const cyc = (m.ph % 2.9); m.solid = cyc < 1.3; }
    if (m.t === 'timefreeze' && m.sT <= 0) { m.sT = 7; G.fx.jam = Math.max(G.fx.jam || 0, 1); pop('⏸️ TIME FREEZE!', W / 2, H * 0.4, 24, '#fff', 0.8); G.flash = 0.3; G.flashCol = '127,212,255'; }
    if (m.t === 'batterychor' && ptr.vis > 0 && Math.hypot(ptr.x - m.x, ptr.y - m.y) < R() * 1.6) { G.bat = Math.max(0, G.bat - 18 * gdt); popOnce('bch', 1.5, 'BATTERY CHOR! 🪫', m.x, m.y - 30 * S, 14, '#fff', 0.6); }
    if (m.t === 'kamikaze' && m.stage === 1 && !m.kami) { m.kami = 1; m.lockT = 0.8; }
    if (m.kami === 1) { m.lockT -= gdt; m.x += Math.sin(m.ph * 70) * 1.2 * S; if (m.lockT <= 0) m.kami = 2; continue; }
    if (m.kami === 2) { const [tx, ty] = tpos(m), d = Math.hypot(tx - m.x, ty - m.y); m.vx = (tx - m.x) / d * 430 * S * coil; m.vy = (ty - m.y) / d * 430 * S * coil; m.x += m.vx * gdt; m.y += m.vy * gdt; m.dir = m.vx > 0 ? 1 : -1;
      if (d < 18 * S) { m.dead = true; if (!(G.fx.shield > 0)) { m.ts.neend -= 10; G.st.bites++; G.st.faceBites++; m.ts.bitten = 0.8; } pop('KAMIKAZE! 💥 -10', m.x, m.y - 20 * S, 18, '#fff', 0.8); sparks(m.x, m.y, 20, 200, [P2, '#fff']); sfx.thud(); shake(8); } continue; }
    if (m.follow) { if (m.follow.dead) m.follow = null; else { const f = m.follow; m.x += (f.x + m.fo.x * f.dir - m.x) * Math.min(1, gdt * 5); m.y += (f.y + m.fo.y - m.y) * Math.min(1, gdt * 5); m.dir = f.dir; if (f.state === 'bite' && m.state === 'fly') { m.state = 'bite'; m.ts = f.ts; m.ti = (f.ti + 1) % f.ts.pts.length; m.biteT = 0.4; } if (m.state === 'fly') continue; } }
    let buff = 1, smart = m.smart; if (G.cmdT > 0) smart = 1;
    for (const l of leaders) if (l !== m && Math.hypot(l.x - m.x, l.y - m.y) < 160 * S) { if (l.t === 'leader') buff = 1.25; if (l.t === 'commander') { smart = 1; buff = Math.max(buff, 1.1); } }
    if (m.state === 'fly') {
      flyCount++; panSum += (m.x / W) * 2 - 1;
      if (m.decoy && m.stage === 1) { const [tx, ty] = tpos(m); if (Math.hypot(tx - m.x, ty - m.y) < 30 * S) { m.dead = true; sparks(m.x, m.y, 8, 100, [P2]); continue; } }
      let [tx, ty] = m.stage === 0 ? [m.wp.x, m.wp.y] : tpos(m);
      // smart: avoid racket
      m.retT -= gdt;
      if (smart > 0 && ptr.vis > 0 && m.stage === 1 && m.retT <= 0 && Math.hypot(ptr.x - tx, ptr.y - ty) < 110 * S && Math.random() < smart) { chooseTarget(m, true); m.retT = 1.2; [tx, ty] = tpos(m); if (smart >= 1) popOnce('chalak', 3, 'Sly! 🦊 it ran from the racket', m.x, m.y - 30 * S, 13, '#d9ccff', 0.7); }
      const dx = tx - m.x, dy = ty - m.y, d = Math.hypot(dx, dy) || 1;
      nearest = Math.min(nearest, Math.hypot(m.x - mainS().x, m.y - mainS().y));
      if (m.stage === 0 && d < 40 * S) m.stage = 1;
      let a = Math.atan2(dy, dx) + Math.sin(m.ph * m.wf) * m.wa * (m.stage === 1 && d < 80 * S ? 0.3 : 1);
      let sp = m.sp * coil * turbo * buff * HZ.spMul() * (m.stage === 1 ? ulta : 1) * (m.stage === 1 && d < 120 * S ? 0.75 : 1);
      let vx = Math.cos(a) * sp, vy = Math.sin(a) * sp;
      if (smart > 0 && ptr.vis > 0) { const pd = Math.hypot(m.x - ptr.x, m.y - ptr.y); if (pd < 110 * S) { const f = (1 - pd / (110 * S)) * smart * 1.4; vx += (m.x - ptr.x) / pd * sp * f; vy += (m.y - ptr.y) / pd * sp * f; } }
      if (RK().id === 'magnet' && ptr.vis > 0) { const pd = Math.hypot(m.x - ptr.x, m.y - ptr.y); if (pd < 190 * S) { vx += (ptr.x - m.x) / pd * 140 * S; vy += (ptr.y - m.y) / pd * 140 * S; } }
      const k = Math.min(1, gdt * 3.2);
      m.vx += (vx - m.vx) * k; m.vy += (vy - m.vy) * k;
      m.x += m.vx * gdt; m.y += m.vy * gdt;
      if (Math.abs(m.vx) > 5) m.dir = m.vx > 0 ? 1 : -1;
      if (m.stage === 1 && d < 12 * S && state === 'play' && !m.decoy) { m.state = 'bite'; m.biteT = 0.45; }
    } else {
      biters.add(m.ts);
      const [tx, ty] = tpos(m);
      m.x = tx + Math.sin(m.ph * 40) * 0.8 * S; m.y = ty + Math.cos(m.ph * 33) * 0.8 * S;
      if (smart >= 1 && ptr.vis > 0 && Math.hypot(ptr.x - m.x, ptr.y - m.y) < 90 * S) { m.state = 'fly'; m.stage = 1; m.retT = 0; chooseTarget(m, true); continue; }
      if (state === 'play') {
        m.biteT += gdt;
        if (m.biteT >= 0.9) {
          m.biteT = 0;
          if (G.fx.shield > 0) pop('🛡️', m.x, m.y - 14 * S, 16, '#fff', 0.5);
          else {
            const face = (m.ts.pts[m.ti] || {}).face; let dmg = m.dmg * (face && hasGhar('net') ? 0.8 : 1);
            { const qq = m.ts.main ? RISHTE.q() : ''; if (qq === 'deaf') dmg *= 1.15; if (qq === 'dog') { dmg *= 1.3; popOnce('bark', 1.2, 'WOOF WOOF! 🐶', m.ts.x + 40 * S, m.ts.y - 60 * S, 18, '#fff', 0.8); tone(300, 200, 0.08, 0.2, 'square'); tone(320, 210, 0.08, 0.2, 'square', 0.12); }
              if (qq === 'facepack') { if (face) { dmg = 0; popOnce('fp', 1.5, 'THE FACE PACK SAVED HER! 😎', m.x, m.y - 30 * S, 14, '#fff', 0.7); } else dmg *= 1.3; } if (face && RISHTE.has('net')) dmg *= 0.85; }
            m.ts.neend -= dmg * (m.ts.kOff > 0.5 ? 2 : 1); m.fed = Math.min(1, m.fed + 0.25); m.ts.bitten = 0.7; G.st.bites++; if (face) G.st.faceBites++; if (!m.ts.walk) addMark(m.ts, m.ti);
            if (m.t === 'vampire' && m.hp < 5) { m.hp++; m.maxhp = Math.max(m.maxhp, m.hp); m.size = Math.min(1.8, m.size + 0.1); }
            pop('-' + Math.round(dmg) + (face ? ' 😣' : ''), m.x, m.y - 14 * S, 15, '#c7b0ff', 0.6); sfx.bite(); vib(25); shake(2);
          }
        }
      }
    }
  }
  G.cmdT -= gdt;
  G.mosq = G.mosq.filter(m => !m.dead && m.y > -320 * S && m.y < H + 200 * S);
  // eggs, bombs, jugnus, rings, popups
  for (const e of G.eggs) { if (e.dead) continue; e.vy *= 0.95; e.y += e.vy * gdt; e.t -= gdt; if (e.t <= 0) { e.dead = true; for (let i = 0; i < 2; i++) spawnMosq('bachcha', e.x, e.y, { stage: 1 }); pop('🐣🐣', e.x, e.y - 14 * S, 14, '#fff', 0.5); } }
  G.eggs = G.eggs.filter(e => !e.dead);
  for (const b of G.bombs) { if (b.dead) continue; b.vy += 60 * S * gdt; b.y += b.vy * gdt; const s = G.sleepers.find(s => Math.abs(b.x - (s.x + 80 * S)) < 170 * S); if (b.y > bed.y - 20 * S) { b.dead = true; sparks(b.x, b.y, 16, 160, [P2, '#c7b0ff']); if (s && !(G.fx.shield > 0)) { s.neend -= 6; s.bitten = 0.8; pop('ITCHY! 😖 -6', b.x, b.y - 30 * S, 16, '#fff', 0.8); } sfx.thud(); } }
  G.bombs = G.bombs.filter(b => !b.dead);
  for (const j of G.jugnus) { if (j.dead) continue; j.ph += gdt; const d = Math.hypot(j.wp.x - j.x, j.wp.y - j.y); if (d < 20 * S) j.wp = { x: rnd(W * 0.1, W * 0.9), y: rnd(H * 0.2, H * 0.68) }; j.x += (j.wp.x - j.x) / d * 50 * S * gdt; j.y += (j.wp.y - j.y) / d * 50 * S * gdt + Math.sin(j.ph * 3) * 0.5 * S; }
  G.jugnus = G.jugnus.filter(j => !j.dead);
  for (const r of G.rings) { r.r += (r.sp || 500 * S) * gdt; r.a *= 0.98; if (r.bass && !r.hitP && ptr.vis > 0 && Math.abs(Math.hypot(ptr.x - r.x, ptr.y - r.y) - r.r) < 20 * S) { r.hitP = 1; G.bat = Math.max(0, G.bat - 25); pop('BASS DROP! -25 🔋', ptr.x, ptr.y - 50 * S, 18, '#fff', 0.8); shake(8); vib(60); } }
  G.rings = G.rings.filter(r => r.r < r.max);
  if (state === 'play') for (const p of G.popups) { if (p.dead) continue; p.life -= gdt; if (p.life <= 0) { p.dead = true; mainS().neend -= 6; pop('SCAMMED! 😱 -6', p.x + p.w / 2, p.y, 18, '#fff', 0.9); sfx.trap(); } }
  G.popups = G.popups.filter(p => !p.dead);
  G.rainT -= gdt;
  // items
  for (const it of G.items) {
    it.ph += gdt;
    if (it.kind === 'trap') { it.y += it.vy * gdt; if (state === 'play' && it.y > bed.y - 40 * S) { it.got = true; triggerTrap(it.x, it.y, it.key); } }
    else { it.life -= gdt; it.vy *= 0.96; it.y += it.vy * gdt + Math.sin(it.ph * 3) * 0.3 * S; }
  }
  G.items = G.items.filter(it => !it.got && it.life > 0);
  for (const l of G.laser) l.life -= gdt; G.laser = G.laser.filter(l => l.life > 0);
  if (state === 'play') {
    applySens();
    if (minNeend() <= 0) { G.sleepers.forEach(s => s.neend = Math.max(0, s.neend)); wake(); }
    else { for (const s of G.sleepers) if (!biters.has(s)) s.neend = Math.min(100, s.neend + 0.5 * gdt); checkGoal(); }
  }
  // buzz
  if (AC && buzzGain) {
    const n = state === 'play' ? flyCount + biters.size * 2 : 0;
    buzzGain.gain.setTargetAtTime(muted ? 0 : Math.min(0.055, 0.011 * n), AC.currentTime, 0.08);
    if (buzzPan && flyCount) buzzPan.pan.setTargetAtTime(clamp(panSum / flyCount, -0.9, 0.9), AC.currentTime, 0.1);
    buzzOsc.frequency.setTargetAtTime(480 + clamp(300 - nearest / S, 0, 300) * 0.6 + (G.ts < 0.6 ? -200 : 0) + (G.bosses.some(b => !b.dead) ? -150 : 0), AC.currentTime, 0.1);
  }
  for (const p of G.parts) { p.life -= gdt; p.vy += p.g * gdt; p.x += p.vx * gdt; p.y += p.vy * gdt; p.vx *= 0.97; }
  G.parts = G.parts.filter(p => p.life > 0);
  for (const b of G.bolts) b.life -= gdt; G.bolts = G.bolts.filter(b => b.life > 0);
  for (const p of G.pops) p.life -= dt; G.pops = G.pops.filter(p => p.life > 0); annUpdate(dt);
  G.shake *= Math.pow(0.002, dt); G.flash = Math.max(0, G.flash - dt * 1.6);
  G.megaRing = Math.max(0, G.megaRing - gdt);
  ptr.zapT -= dt; if (!ptr.down) ptr.vis = Math.max(0, ptr.vis - dt * 2.5);
  META.tick(dt, gdt);
  if (G.cine) updateCine(dt);
  for (const s of G.shards) { s.vy += 1400 * S * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.r += s.vr * dt; }
  G.shards = G.shards.filter(s => s.y < H + 100);
}

function updateWaves(gdt) {
  if (G.waveLeft > 0) { G.spawnT -= gdt; if (G.spawnT <= 0) { spawnMosq(); G.waveLeft--; G.spawnT = 0.42; } return; }
  const alive = G.mosq.filter(m => !m.dead && !m.decoy).length;
  if (alive === 0) {
    if (G.wave >= 5) { winLevel(); return; }
    G.waveT -= gdt;
    if (G.waveT <= 0) { G.wave++; G.waveLeft = 5 + G.wave * 2 + CL.w * 2; G.waveT = 2; pop(`WAVE ${G.wave} / 5 🌊`, W / 2, H * 0.38, 40, '#fff', 1.3); sfx.roar(); }
    else if (G.wave > 0 && G.waveT > 1.95) { pop(`WAVE ${G.wave} CLEAR! ✅`, W / 2, H * 0.38, 30, `rgb(${ELEC})`, 1.2); sfx.clear(); }
  }
}
function progress() {
  const t = CL.task, st = G.st;
  switch (t) {
    case 'kill': case 'swipe': case 'jugnu': case 'limbat': case 'limzap': case 'timeattack': return { cur: G.kills, max: CL.target, txt: `🦟 ${Math.min(G.kills, CL.target)} / ${CL.target}` };
    case 'air': return { cur: st.air, max: CL.target, txt: `🌪️ ${Math.min(st.air, CL.target)} / ${CL.target} air` };
    case 'hunt': { const c = st.type[CL.huntType] || 0; return { cur: c, max: CL.target, txt: `${MT[CL.huntType].emoji} ${Math.min(c, CL.target)} / ${CL.target}` }; }
    case 'combo': return { cur: st.maxCombo, max: CL.target, txt: `🔥 best ${st.maxCombo} / ${CL.target}` };
    case 'score': return { cur: G.score, max: CL.target, txt: `💯 ${fmt(Math.min(G.score, CL.target))} / ${fmt(CL.target)}` };
    case 'rani': return { cur: st.raniKilled, max: CL.target, txt: `👑 ${st.raniKilled} / ${CL.target}` };
    case 'collect': return { cur: st.collected, max: CL.target, txt: `🎁 ${Math.min(st.collected, CL.target)} / ${CL.target}` };
    case 'waves': return { cur: Math.max(0, G.wave - 1), max: 5, txt: `🌊 Wave ${Math.max(1, G.wave)} / 5` };
    case 'nobite': return { cur: st.bites, max: CL.maxBites, txt: `🚫 Bites: ${st.bites} / ${CL.maxBites}` };
    case 'boss': { const b = G.bosses.filter(b => !b.dead); return { cur: 0, max: 1, txt: '' }; }
  }
  return { cur: G.t, max: CL.len, txt: '' };
}
function checkGoal() {
  const t = CL.task, p = progress(), st = G.st;
  if (t === 'jugnu' && st.jugnuHits >= 3) return failLevel('3 FIREFLIES HIT! 😢', 'Fireflies are friends. Hit only mosquitoes');
  if (t === 'nobite' && st.bites > CL.maxBites) return failLevel(`MORE THAN ${CL.maxBites} BITES!`, 'Do not let mosquitoes reach the bed');
  if (t === 'limbat' && G.bat < 2 && G.kills < CL.target && !G.items.some(i => i.key === 'battery')) return failLevel('BATTERY EMPTY! 🪫', 'Make every zap count. Do not miss');
  if (t === 'limzap' && G.zapsLeft <= 0 && G.kills < CL.target) return failLevel('OUT OF ZAPS! 🎯', `Only ${CL.target - G.kills} mosquitoes to go!`);
  if (['kill', 'swipe', 'jugnu', 'limbat', 'limzap', 'air', 'hunt', 'rani', 'collect', 'combo', 'score', 'timeattack'].includes(t) && p.cur >= p.max) return winLevel();
  if (CL.len && G.t >= CL.len) {
    if (['survive', 'dark', 'multi', 'powercut', 'sleepwalk', 'nobite'].includes(t)) return winLevel();
    const left = p.max - p.cur;
    return failLevel('TIME UP! ⏰', t === 'score' ? `Only ${fmt(left)} points to go!` : t === 'combo' ? `Combo reached ${p.cur}. You needed ${CL.target}` : `Only ${left} to go!`);
  }
}

/* ---------- flow ---------- */
function winLevel() {
  if (state !== 'play') return;
  state = 'clear'; uiPlaying(false);
  for (const m of G.mosq) if (!m.dead) { bolt(W / 2, H * 0.135, m.x, m.y, 0.4, 1.2); sparks(m.x, m.y, 12, 200, ['#fff', `rgb(${ELEC})`, P2]); m.dead = true; G.score += 10; }
  G.items = []; G.popups = []; G.bombs = []; G.eggs = [];
  if (CL.task !== 'boss') { G.flash = 0.6; G.flashCol = ELEC; slow(0.6); sfx.mega(); shake(8); pop('MISSION PAAR! ✅', W / 2, H * 0.4, 44, '#fff', 1.4, 20); }
  setTimeout(() => sfx.clear(), 350);
  const objs = CL.stars.map(k => STAR_OBJ[k].ok(G.st, { minNeend: minNeend() }));
  G.sleepers.forEach(s => { if (s.pose === 'side') { s.prevPose = 'side'; s.pose = 'back'; s.poseT = 0.7; } });
  const mo = (CHARS[CW.cid] || CHARS.papa).morn;
  G.cine = { type: 'morning', t: CL.task === 'boss' ? -1.8 : -0.9, st: 1 + objs.filter(Boolean).length, objs, line: mo[(Math.random() * mo.length) | 0] };
}
function failLevel(title, msg) {
  if (state !== 'play') return;
  state = 'fail'; uiPlaying(false); ptr.down = false;
  G.cine = { type: 'fail', t: 0, title, msg }; sfx.trap(); shake(10); vib([80, 40, 80]); slow(1);
  for (const m of G.mosq) { m.laugh = 1.6; m.vx = rnd(-160, 160) * S; m.vy = rnd(-260, -80) * S; }
  sfx.laugh();
}
function wake() {
  if (state !== 'play') return;
  state = 'wake'; uiPlaying(false); ptr.down = false;
  G.cine = { type: 'wake', t: 0, step: 0, freeze: 0 };
  G.wakeS = G.sleepers.reduce((a, s) => s.neend < a.neend ? s : a, G.sleepers[0]);
  sfx.heart(1.4); vib(40);
}
function updateCine(dt) {
  const c = G.cine;
  if (c.freeze > 0) { c.freeze -= dt; return; }
  c.t += dt;
  if (c.type === 'fail') { if (c.t > 2 && !c.done) { c.done = 1; showOver('fail', c.title, c.msg); } return; }
  if (c.type === 'morning') { if (c.t > 0.3 && !c.birds) { c.birds = 1; [0, 0.15, 0.3, 0.6, 0.75, 1.1].forEach(d => tone(2400 + Math.random() * 800, 3300, 0.08, 0.05, 'sine', d)); } if (c.t > 1.1 && !c.vo) { c.vo = 1; sfx.chest(); vib([20, 40, 20]); } if (c.t > 3.8 && !c.done) { c.done = 1; showWin(c.st, c.objs); } return; }
  const s = G.wakeS;
  if (c.step === 0 && c.t > 0.35) { c.step = 1; sfx.heart(1.6); vib(50); }
  if (c.step === 1 && c.t > 0.75) {
    c.step = 2; sfx.shout(); shake(16); vib([80, 40, 80]); G.flash = 0.5; G.flashCol = '154,109,245';
    G.rings.push({ x: s.x, y: s.y, r: 0, max: Math.max(W, H), a: 1, sp: 1400 * S });
    for (const m of G.mosq) { m.laugh = 2.4; m.vx = rnd(-200, 200) * S; m.vy = rnd(-300, -100) * S; m.state = 'fly'; }
    setTimeout(() => sfx.laugh(), 300);
  }
  if (c.step === 2 && c.t > 1.95) { c.step = 3; sfx.throwW(); }
  if (c.step === 3 && c.t > 2.5) {
    c.step = 4; c.freeze = 0.2; sfx.impact(); vib([200, 60, 120]); shake(34); G.flash = 1; G.flashCol = '255,255,255';
    makeCracks(W / 2, H * 0.44);
  }
  if (c.step === 4 && c.t > 4.1) { c.step = 5; showOver('wake'); }
}
function makeCracks(x, y) {
  const lines = [], n = 16, reach = Math.max(W, H) * 0.75;
  for (let i = 0; i < n; i++) {
    let a = i / n * 6.283 + rnd(-0.15, 0.15), px = x, py = y; const pts = [[px, py]], len = rnd(0.45, 1) * reach;
    let d = 0; while (d < len) { const st = rnd(18, 50) * S; a += rnd(-0.25, 0.25); px += Math.cos(a) * st; py += Math.sin(a) * st; d += st; pts.push([px, py]);
      if (Math.random() < 0.18) { let ba = a + rnd(-0.9, 0.9), bx = px, by = py; const bp = [[bx, by]]; for (let k = 0; k < 4; k++) { ba += rnd(-0.3, 0.3); bx += Math.cos(ba) * rnd(15, 35) * S; by += Math.sin(ba) * rnd(15, 35) * S; bp.push([bx, by]); } lines.push(bp); } }
    lines.push(pts);
  }
  const rings = [];
  for (const rr2 of [40, 85, 150, 240]) { const pts = []; for (let i = 0; i <= 24; i++) { const a = i / 24 * 6.283, r = (rr2 + rnd(-12, 12)) * S; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } rings.push(pts); }
  G.cracks = { x, y, lines, rings };
  for (let i = 0; i < 40; i++) { const a = Math.random() * 6.283, v = rnd(100, 700) * S; G.shards.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 300 * S, r: Math.random() * 6, vr: rnd(-10, 10), s: rnd(4, 14) * S }); }
}
function revive() {
  G.revived = true; G.cine = null; G.cracks = null; G.shards = [];
  G.sleepers.forEach(s => s.neend = Math.max(s.neend, 55)); G.bat = G.batMax; G.flash = 0.6; G.flashCol = ELEC;
  for (const m of G.mosq) if (!m.boss) m.dead = true;
  G.bosses.forEach(b => { if (!b.dead) { b.mode = 'hover'; b.timer = 2; b.wp = { x: W / 2, y: H * 0.25 }; b.y = H * 0.25; } });
  if (CL.len) G.t = Math.min(G.t, CL.len - 8);
  if (CL.task === 'nobite') G.st.bites = Math.min(G.st.bites, CL.maxBites - 1);
  if (CL.task === 'jugnu') G.st.jugnuHits = Math.min(G.st.jugnuHits, 2);
  if (CL.task === 'limzap') G.zapsLeft += 10;
  SAVE.hearts = Math.min(5, SAVE.hearts + 1); save();
  state = 'play'; uiPlaying(true);
  pop('BACK IN THE GAME! 💪', W / 2, H * 0.42, 34, '#fff', 1.3); sfx.power(); G.fx.shield = 3;
}

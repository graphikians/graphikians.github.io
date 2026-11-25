/* ================= BEAT SANX — events (v1.7 "Event Season") =================
   Every Monday 3 events are featured from a pool of 14 (1 classic with a weekly twist,
   1 new-twist event, 1 high-reward hard event). Saturday + Sunday add a Weekend Special.
   An event does not come back for 3 weeks. Champion name, face and line change every week.
   All event screens share ONE game-style template: animated hero scene, chest road,
   energy tokens, a glowing PLAY button with a Sanx taunt, and chests that pay out
   with coins flying to the counter (no full re-render, no jerk).
   Festivals repeat every year by themselves (D.festWin) and an online calendar file can
   add or move festivals without an app update. Arena (5 premium daily events) stays. */
'use strict';
const EV = (() => {
  const $ = id => document.getElementById(id);
  const fmt = n => UI.fmt(n);
  const st = () => S.st;
  const E = k => (st().ev[k] = st().ev[k] || {});
  const acc = r => r.taps ? Math.max(0.6, r.correct / r.taps) : 0.6;
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const esc = s => UI.esc(s);
  const DAY = 864e5;
  let curEv = null, lastTapEl = null;
  document.addEventListener('pointerdown', e => { const b = e.target.closest && e.target.closest('[data-act]'); if (b) lastTapEl = b; }, true);

  /* ---------- time helpers ---------- */
  const dayEnd = () => { const d = new Date(); d.setHours(24, 0, 0, 0); return d.getTime(); };
  const mondayOf = (d = new Date()) => { const t = new Date(d); t.setHours(0, 0, 0, 0); t.setDate(t.getDate() - ((t.getDay() + 6) % 7)); return t; };
  const weekEnd = () => mondayOf().getTime() + 7 * DAY;
  const dow = () => (new Date().getDay() + 6) % 7;          // Mon 0 ... Sun 6
  const surge = () => { const n = new Date(), s = n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds(), p = D.TOUR.surgeEveryH * 3600, pos = s % p; return pos < D.TOUR.surgeMins * 60 ? { on: true, left: D.TOUR.surgeMins * 60 - pos } : { on: false, in: p - pos }; };
  const lastHour = () => new Date().getHours() === 23;
  function seedRnd(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
  const hashS = str => [...String(str)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

  /* ================= EVENT SEASON ================= */
  const EPOCH = new Date(2026, 10, 23).getTime();   // Monday 23 Nov 2026
  const weekNo = (d = new Date()) => Math.round((mondayOf(d).getTime() - EPOCH) / (7 * DAY));
  const CLASSIC = ['bts', 'champ', 'oma', 'bco', 'tour', 'mania'];
  const TWIST = ['blackout', 'treasure', 'eyespy', 'rush'];
  const HARD = ['king', 'sudden', 'double', 'marathon'];
  const md = (a, n) => ((a % n) + n) % n;
  const featured = (w = weekNo()) => [CLASSIC[md(w, 6)], TWIST[md(w, 4)], HARD[md(w, 4)]];
  const weekendId = (w = weekNo()) => HARD[md(w + 2, 4)];
  const weekendOn = () => dow() >= 5 || new URLSearchParams(location.search).has('weekend');
  const liveIds = () => featured().concat(weekendOn() ? [weekendId()] : []);
  const isLive = id => liveIds().includes(id) || new URLSearchParams(location.search).has('evall');
  const isWeekend = id => weekendOn() && id === weekendId() && !featured().includes(id);
  const isNewWeek = id => { const w = weekNo(); return !featured(w - 1).includes(id) && weekendId(w - 1) !== id; };
  /* weekly twist on the classic event */
  const TW = [
    { id: 'gold',  name: 'Gold Rush',  d: 'Coins ×1.5 all week', coin: 1.5, pts: 1 },
    { id: 'turbo', name: 'Turbo Week', d: 'Faster flashes · points ×1.3', speed: 0.85, pts: 1.3 },
    { id: 'iron',  name: 'Iron Hearts', d: '2 hearts only · points ×1.5', hearts: 2, pts: 1.5 },
    { id: 'big',   name: 'Big Boards', d: 'Bigger boards sooner · points ×1.2', big: true, pts: 1.2 },
    { id: 'mix',   name: 'Mode Mix',   d: 'A new mode every round · points ×1.4', mix: true, pts: 1.4 }
  ];
  const twist = (w = weekNo()) => TW[md(w, 5)];
  function twApply(ev) {
    const t = twist();
    if (t.coin) ev.coinMult = (ev.coinMult || 1) * t.coin;
    if (t.speed) ev.speed = (ev.speed || 1) * t.speed;
    if (t.hearts && ev.hearts > t.hearts) ev.hearts = t.hearts;
    if (t.big) ev.gridAt = i => [3, 3, 3, 3, 4, 4, 4, 5, 5, 5][i % 10];
    if (t.mix && !ev.modeAtRound && !ev.modeAt) { const pool = D.EV_MIX; ev.modeAtRound = i => i < 1 ? 'classic' : pool[Math.floor(Math.random() * pool.length)]; }
    ev.twist = t.id;
    return ev;
  }
  const PREM = () => D.AVATARS.filter(a => a.set === 'premium');

  /* ---------- meta for all 14 season events ---------- */
  const META = {
    bts:      { name: 'Beat the Sanx',      icon: 'skull',   scene: 'ring',      c1: '#e11d48', c2: '#3b0518', tag: 'Bet coins. Beat Sanx before the clock.' },
    champ:    { name: 'Beat the Champion',  icon: 'crown',   scene: 'throne',    c1: '#a16207', c2: '#2a1500', tag: 'Dethrone this week\'s AI champion.' },
    oma:      { name: 'One Man Army',       icon: 'army',    scene: 'army',      c1: '#4d7c0f', c2: '#0f1a05', tag: 'Outlast 5 AI soldiers. Sudden death.' },
    bco:      { name: 'Beat the Coins',     icon: 'vault',   scene: 'vault',     c1: '#b45309', c2: '#1f1003', tag: 'Raid the vault. Max coins in one run.' },
    tour:     { name: 'World Flash Tour',   icon: 'globe',   scene: 'globe',     c1: '#0369a1', c2: '#03142a', tag: '4 cities. Clear one to fly to the next.' },
    mania:    { name: 'Sanx Mania',         icon: 'flame',   scene: 'stage',     c1: '#7c3aed', c2: '#16052e', tag: 'Weekly score chase on the big stage.' },
    blackout: { name: 'Blackout',           icon: 'moon',    scene: 'city',      c1: '#312e81', c2: '#05030f', tag: 'The city is dark. Only your torch shows the tiles.' },
    treasure: { name: 'Treasure Hunt',      icon: 'map',     scene: 'map',       c1: '#a16207', c2: '#1f1003', tag: 'Every round you clear digs one step to the treasure.' },
    eyespy:   { name: 'Eye Spy Week',       icon: 'eye',     scene: 'detective', c1: '#4c1d95', c2: '#0c0420', tag: 'Every round is Eye Spy. Find the hidden tiles.' },
    rush:     { name: 'Rush Hour',          icon: 'clock',   scene: 'traffic',   c1: '#b91c1c', c2: '#1a0505', tag: 'Faster every round. A timer on every round.' },
    king:     { name: 'King of the Hill',   icon: 'crown',   scene: 'mountain',  c1: '#4338ca', c2: '#0b0520', tag: 'Climb past 5 AI rivals to the crown.' },
    sudden:   { name: 'Sudden Death',       icon: 'skull',   scene: 'lava',      c1: '#c2410c', c2: '#1a0505', tag: 'One heart. One mistake. Rewards ×5.' },
    double:   { name: 'Double or Nothing',  icon: 'dice',    scene: 'casino',    c1: '#047857', c2: '#02140e', tag: 'The pot doubles every round. Bank it or lose it.' },
    marathon: { name: 'Memory Marathon',    icon: 'flag',    scene: 'track',     c1: '#b91c1c', c2: '#120634', tag: 'One long run. Hearts never refill.' }
  };
  const M = id => ({ id, ...META[id], period: isWeekend(id) ? 'WEEKEND SPECIAL' : 'THIS WEEK', end: weekEnd });

  /* ================= state ================= */
  function bts() { const e = E('bts'), k = S.dayKey(); if (e.day !== k) { e.day = k; e.att = 0; } e.streak = e.streak || 0; e.wins = e.wins || 0; return e; }
  function oma() { const e = E('oma'), k = S.weekKey(); if (e.wk !== k) Object.assign(e, { wk: k, att: 0, best: 0, beaten: 0, claimed: [] }); return e; }
  const skillTiles = () => { const a = st().skill || []; return a.length ? Math.max(...a) : 6; };
  function btc() { const e = E('btc'), k = S.weekKey(), d = S.dayKey(); if (e.wk !== k || !e.tiles) Object.assign(e, { wk: k, best: 0, claimed: [], throne: false, lvl: 0, tiles: Math.max(D.BTC.minTiles, skillTiles() + D.BTC.lead) }); if (e.day !== d) { e.day = d; e.att = 0; } return e; }
  function bco() { const e = E('bco'), d = S.dayKey(); if (e.day !== d) { const y = new Date(); y.setDate(y.getDate() - 1); e.streak = e.played === S.dayKey(y) ? (e.streak || 0) + 1 : (e.played === d ? e.streak : 0); Object.assign(e, { day: d, best: 0, claimed: [], att: 0 }); } return e; }
  function tour() { const e = E('tour2'), k = S.weekKey(); if (e.wk !== k) Object.assign(e, { wk: k, best: {}, att: {}, claimed: [] }); return e; }
  function mania() {
    const e = E('mania2'), k = S.weekKey(), d = S.dayKey();
    if (e.wk !== k) { if (e.wk && e.best > 0) { const dv = [...D.MANIA.divisions].reverse().find(x => e.best >= x.at); S.grant(dv.reward); setTimeout(() => UI.toast(`Sanx Mania: ${dv.name} division reward added`, 'trophy'), 800); } Object.assign(e, { wk: k, best: 0, claimed: [] }); }
    if (e.day !== d) { e.day = d; e.att = 0; } return e;
  }
  const W_CHAMPS = [
    { name: 'Vortex', mode: 'chaos', line: 'Chaos is my home.' }, { name: 'Nexa', mode: 'classic', line: 'Nobody has come close.' }, { name: 'Bolt', mode: 'speed', line: 'Speed is my language.' },
    { name: 'Raven', mode: 'ghost', line: 'I play in the dark.' }, { name: 'Frost', mode: 'focus', line: 'Zero mistakes. Ever.' }, { name: 'Titan', mode: 'reverse', line: 'Backwards is easy.' },
    { name: 'Zenith', mode: 'eye', line: 'I see what you miss.' }, { name: 'Cipher', mode: 'rush', line: 'Keep up with the beat.' }];
  const champ = () => { const w = weekNo(), b = W_CHAMPS[md(w, W_CHAMPS.length)], e = btc(), av = PREM()[md(w * 7, 40)]; return { ...b, name: b.name + (e.lvl ? ' ' + D.ROMAN[e.lvl + 1] : ''), tiles: e.tiles, score: D.champScore(e.tiles), img: `img/av/${av.id}.webp` }; };
  const bounty = () => Math.round(Math.min(D.BTC.bountyMax, D.BTC.bountyBase + dow() * D.BTC.bountyDay) * Math.pow(D.BTC.bountyGrow, btc().lvl || 0));
  const maniaPhase = () => { const d = dow(); return d <= 2 ? D.MANIA.phases[0] : d <= 5 ? D.MANIA.phases[1] : D.MANIA.phases[2]; };
  /* +1 try per event per day with a rewarded ad */
  const bonus = id => { const e = E('xtra'), d = S.dayKey(); if (e.d !== d) { e.d = d; e.n = {}; } return e.n[id] || 0; };
  const addBonus = id => { bonus(id); const e = E('xtra'); e.n[id] = (e.n[id] || 0) + 1; S.save(); };

  /* ================= WEEKLY POOL EVENTS ================= */
  const R5 = (...a) => a;
  const POOL = {
    blackout: { tries: 5, hearts: 3, mode: 'classic', metric: 'tiles', unit: 'tiles', ms: [5, 7, 9, 11, 13], rw: R5({ coins: 200 }, { coins: 450 }, { coins: 900, gems: 2 }, { coins: 1800, gems: 4 }, { coins: 4000, gems: 8 }), play: 'LIGHT THE TORCH', cfg: { blackout: true },
      taunts: ['Scared of the dark?', 'I can see in the dark. Can you?', 'One torch. That is all you get.'], rules: ['The board goes dark. Only the flashing tile lights up like a torch.', 'Pattern starts at 2 tiles, +1 every round. Modes join as you go.', '3 hearts.', 'Rewards by your longest pattern this week.'] },
    treasure: { tries: 5, hearts: 3, mode: 'classic', metric: 'digs', unit: 'digs', ms: [10, 25, 45, 70, 100], rw: R5({ coins: 250 }, { coins: 600 }, { coins: 1200, gems: 2 }, { coins: 2500, gems: 5 }, { coins: 6000, gems: 12 }), play: 'START DIGGING', total: true,
      taunts: ['The treasure is mine. Dig all you want.', 'X marks the spot. Good luck finding it.', 'Every wrong tap buries it deeper.'], rules: ['Every round you clear digs one step.', 'Digs add up all week, across all your tries.', 'Chests wait along the road. The big treasure is at 100 digs.', '3 hearts per try.'] },
    eyespy: { tries: 5, hearts: 3, mode: 'eye', metric: 'tiles', unit: 'tiles', ms: [4, 6, 8, 10, 12], rw: R5({ coins: 200 }, { coins: 450 }, { coins: 900, gems: 2 }, { coins: 1800, gems: 4 }, { coins: 4000, gems: 8 }), play: 'START THE CASE', cfg: { pureMode: true },
      taunts: ['The tiles hide. Your memory cannot.', 'A real detective never forgets.', 'Blink and the clue is gone.'], rules: ['Every round is Eye Spy: tiles hide behind an eye after they flash.', 'Tap where the tiles were, in order, to reveal them.', 'Pattern starts at 2 tiles, +1 every round. 3 hearts.', 'Rewards by your longest pattern this week.'] },
    rush: { tries: 5, hearts: 3, mode: 'speed', metric: 'tiles', unit: 'tiles', ms: [5, 7, 9, 11, 13], rw: R5({ coins: 220 }, { coins: 500 }, { coins: 1000, gems: 2 }, { coins: 2000, gems: 4 }, { coins: 4500, gems: 9 }), play: 'HIT THE GAS', cfg: { pureMode: true, stepTimer: true, rampSpeed: true },
      taunts: ['Traffic is moving. Are you?', 'Green light means GO.', 'Too slow. Honk honk.'], rules: ['Speed mode with a timer on every round.', 'Flashes get a little faster every round.', 'Pattern starts at 2 tiles, +1 every round. 3 hearts.', 'Rewards by your longest pattern this week.'] },
    king: { tries: 5, hearts: 3, mode: 'classic', metric: 'tiles', unit: 'tiles', king: true, play: 'CLIMB',
      taunts: ['The top is lonely. And it is mine.', 'Five climbers. One crown.', 'Look down. That is where you are.'], rules: ['5 AI climbers sit on the hill. Each one has a pattern length.', 'Beat a climber\'s length in one run to pass them.', 'Pass all five to take the crown.', 'Pattern starts at 2 tiles, +1 every round. 3 hearts.'] },
    sudden: { tries: 3, hearts: 1, mode: 'classic', metric: 'tiles', unit: 'tiles', ms: [4, 6, 8, 10, 12], rw: R5({ coins: 500 }, { coins: 1200 }, { coins: 2500, gems: 4 }, { coins: 5000, gems: 8 }, { coins: 12000, gems: 20 }), play: 'CROSS THE BRIDGE', cfg: { noRevive: true, coinMult: 5 }, danger: true,
      taunts: ['One mistake. That is all it takes.', 'The lava is hungry.', 'No hearts. No mercy.'], rules: ['ONE heart. One mistake ends the run. No revives.', 'Every round pays ×5 coins.', 'Pattern starts at 2 tiles, +1 every round.', 'Rewards by your longest pattern this week.'] },
    double: { tries: 3, hearts: 1, mode: 'classic', metric: 'bank', unit: 'coins banked', ms: [160, 640, 2560, 10240], rw: [{ gems: 1 }, { gems: 3 }, { gems: 8 }, { gems: 20 }], play: 'PLACE YOUR BET', cfg: { noRevive: true, pot: true }, danger: true,
      taunts: ['Double it. I dare you.', 'Bank now, coward.', 'The house always wins.'], rules: ['The pot starts at 20 coins and DOUBLES every round you clear.', 'From round 3 you choose: BANK the pot, or play on to double it.', 'One mistake = the pot is gone. Nothing.', 'Diamond rewards for your biggest bank this week.'] },
    marathon: { tries: 5, hearts: 3, mode: 'classic', metric: 'rounds', unit: 'rounds', ms: [10, 20, 30, 40, 50], rw: R5({ coins: 300 }, { coins: 700 }, { coins: 1500, gems: 3 }, { coins: 3000, gems: 6 }, { coins: 7000, gems: 14 }), play: 'START RUNNING', cfg: { noRevive: true, marathon: true },
      taunts: ['A marathon, not a sprint.', 'Your hearts will run out first.', 'Nobody finishes. Nobody.'], rules: ['One long run. 3 hearts that never refill. No revives.', 'Every 10 rounds pays an instant coin bonus.', 'Pattern starts at 2 tiles, +1 every round. Modes join as you go.', 'Rewards by the most rounds in one run this week.'] }
  };
  const PE = id => { const e = E('p_' + id), k = S.weekKey(), d = S.dayKey(); if (e.wk !== k) Object.assign(e, { wk: k, best: 0, total: 0, claimed: [] }); if (e.day !== d) { e.day = d; e.att = 0; } return e; };
  /* King of the Hill: 5 climbers set for the week around YOUR skill */
  const climbers = () => { const w = weekNo(), r = seedRnd(w * 977 + 13), b = Math.max(6, skillTiles()); const tl = [b - 2, b, b + 1, b + 2, b + 4]; return tl.map((t, i) => ({ name: D.AI_NAMES[Math.floor(r() * D.AI_NAMES.length)], tiles: t, i })); };
  const KING_RW = [{ coins: 300 }, { coins: 700 }, { coins: 1400, gems: 2 }, { coins: 3000, gems: 5 }, { coins: 8000, gems: 15 }];
  const poolMs = id => POOL[id].king ? climbers().map(c => c.tiles) : POOL[id].ms;
  const poolRw = id => (POOL[id].king ? KING_RW : POOL[id].rw).map(r => { if (!isWeekend(id)) return r; const o = {}; if (r.coins) o.coins = r.coins * 2; if (r.gems) o.gems = r.gems * 2; return o; });
  const poolVal = id => { const e = PE(id); return POOL[id].total ? e.total || 0 : e.best || 0; };

  /* ================= status / ribbons ================= */
  const OMA_RANKS = ['Recruit', 'Soldier', 'Sergeant', 'Lieutenant', 'Colonel', 'General'];
  const OMA_RW = [{ coins: 50 }, { coins: 150 }, { coins: 300, shields: 1 }, { coins: 600 }, { coins: 1200, xp: 500 }, { coins: 3000, shields: 2, xp: 1000 }];
  function status(id) {
    const b = bonus(id);
    if (POOL[id]) { const e = PE(id); return { left: POOL[id].tries + b - e.att, max: POOL[id].tries }; }
    if (id === 'bts') { const e = bts(); return { left: D.BTS.attempts + b - e.att, max: D.BTS.attempts }; }
    if (id === 'champ') { const e = btc(); return { left: D.BTC.attempts + b - e.att, max: D.BTC.attempts }; }
    if (id === 'oma') { const e = oma(); return { left: D.OMA.attempts + b - e.att, max: D.OMA.attempts }; }
    if (id === 'bco') { const e = bco(); return { left: 5 + b - e.att, max: 5 }; }
    if (id === 'mania') { const e = mania(); return { left: 5 + b - e.att, max: 5 }; }
    if (id === 'tour') { const e = tour(); const sum = D.TOUR.stages.filter(s => tourOpen(s.id)).reduce((a, s) => a + (s.attempts - (e.att[s.id] || 0)), 0) + b; return { left: sum, max: null }; }
    return { left: 0, max: 0 };
  }
  function readyReward(id) {
    try {
      if (POOL[id]) { const v = poolVal(id), e = PE(id); return poolMs(id).some((m, i) => v >= m && !e.claimed.includes(i)); }
      if (id === 'champ') { const e = btc(), c = champ(); return D.BTC.rewards.some((w, i) => e.best >= c.score * w.pct && !e.claimed.includes(i)) || (e.best >= c.score && !e.claimed.includes('throne')); }
      if (id === 'oma') { const e = oma(); return e.att > 0 && OMA_RANKS.some((n, i) => e.beaten >= i && !e.claimed.includes(i)); }
      if (id === 'bco') { const e = bco(); return D.BCOINS.tiers.some((t, i) => e.best >= t.at && !e.claimed.includes(i)); }
      if (id === 'tour') { const e = tour(); return D.TOUR.stages.some((s, i) => (e.best[s.id] || 0) >= s.goal && !e.claimed.includes(i)); }
      if (id === 'mania') { const e = mania(); return D.MANIA.milestones.some((m, i) => e.best >= m.s && !e.claimed.includes(i)); }
    } catch (e) { }
    return false;
  }
  function ribbon(id) {
    const leftMs = weekEnd() - Date.now();
    if (readyReward(id)) return { t: 'REWARD READY', cls: 'rd' };
    if (isWeekend(id)) return { t: 'WEEKEND ×2', cls: 'wk' };
    if (leftMs < 12 * 36e5) return { t: 'ENDING SOON', cls: 'end' };
    if (isNewWeek(id)) return { t: 'NEW THIS WEEK', cls: 'nw' };
    return { t: 'LIVE', cls: 'live' };
  }
  function badgeCount() { return liveIds().filter(id => (status(id).left || 0) > 0).length + festLive().length + D.ARENA.filter(a => arenaLeft(a.id) > 0).length; }

  /* ---------- ARENA ---------- */
  const AR = id => { const e = E('ar_' + id), d = S.dayKey(); if (e.day !== d) Object.assign(e, { day: d, att: 0 }); e.best = e.best || 0; e.claimed = e.claimed || []; return e; };
  const arenaLeft = id => D.ARENA_TRIES + bonus('ar_' + id) - AR(id).att;
  const dayIndex = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / DAY);
  const evOfDay = () => { const l = liveIds(); return l[dayIndex() % l.length]; };

  /* ================= FESTIVALS ================= */
  /* online calendar: graphikians.github.io/beat-sanx/fest.json, checked once a week.
     { dates: { id: { "2030": "MM-DD" } }, add: [festival objects], off: [ids] } */
  const CAL_URL = 'https://graphikians.github.io/beat-sanx/fest.json';
  function calApply() {
    const c = st().festCal; if (!c || !c.data) return;
    const d = c.data;
    try {
      for (const id in (d.dates || {})) { const f = D.FESTS.find(x => x.id === id); if (f) { f.date = f.date || {}; f.date.on = Object.assign({}, f.date.on || {}, d.dates[id]); } }
      for (const f of (d.add || [])) if (f && f.id && !D.FESTS.find(x => x.id === f.id) && f.date && f.kind && f.rules && f.theme && f.reward) { if (D.skin(f.skin).id !== f.skin) f.skin = 'f_lunar'; D.FESTS.push(f); }
      for (const f of D.FESTS) f.off = (d.off || []).includes(f.id);
    } catch (e) { }
  }
  async function calSync() {
    const c = st().festCal || {};
    if (c.t && Date.now() - c.t < 7 * DAY) return;
    if (typeof fetch === 'undefined' || (typeof NET !== 'undefined' && !NET.ok)) return;
    try { const r = await fetch(CAL_URL + '?v=' + weekNo(), { cache: 'no-store' }); if (!r.ok) return; const data = await r.json(); st().festCal = { t: Date.now(), data }; S.save(); calApply(); } catch (e) { }
  }
  const festRange = f => { const y = new Date().getFullYear(), now = Date.now(); for (const yy of [y - 1, y, y + 1]) { const w = D.festWin(f, yy); if (w && now >= w.start && now < w.end) return { ...w, live: true }; } let best = null; for (const yy of [y, y + 1, y + 2]) { const w = D.festWin(f, yy); if (w && w.start > now && (!best || w.start < best.start)) best = { ...w, live: false }; } return best; };
  function festLive() {
    const q = new URLSearchParams(location.search).get('fest'), now = Date.now();
    if (q) { const f = D.FESTS.find(x => x.id === q); if (f) return [{ f, live: true, start: now - DAY, end: now + 3 * DAY }]; }
    return D.FESTS.filter(f => !f.off).map(f => { const r = festRange(f); return r && r.live ? { f, ...r } : null; }).filter(Boolean);
  }
  function fest() {
    const l = festLive(); if (l.length) return l[0];
    const nx = D.FESTS.filter(f => !f.off).map(f => { const r = festRange(f); return r ? { f, ...r } : null; }).filter(Boolean).sort((a, b) => a.start - b.start)[0];
    return nx ? { ...nx, live: false } : null;
  }
  const festInfo = id => { const f = D.FESTS.find(x => x.id === id); const l = festLive().find(x => x.f.id === id); return l || { f, ...(festRange(f) || { start: 0, end: 0 }), live: false }; };
  const FS = id => { const e = st().fest[id] = st().fest[id] || { won: false, claimed: [], count: 0, nights: [], advent: [], att: 0, day: '' }; const inf = festInfo(id); const yk = inf.start ? String(new Date(inf.start).getFullYear()) : ''; if (yk && e.yr && e.yr !== yk) Object.assign(e, { won: false, claimed: [], count: 0, nights: [], advent: [], best: 0, fm: [] }); if (yk) e.yr = yk; e.fm = e.fm || []; e.best = e.best || 0; const d = S.dayKey(); if (e.day !== d) { e.day = d; e.att = 0; } return e; };
  const festTries = id => 3 + bonus('f_' + id) - FS(id).att;
  const festDayIdx = (id, max) => { const inf = festInfo(id); return Math.max(0, Math.min(max, Math.floor((Date.now() - inf.start) / DAY))); };

  /* ---------- home hero card + once-a-day popup ---------- */
  function heroInfo() {
    const fl = festLive();
    if (fl.length) { const fs = fl[0], f = fs.f; return { id: f.id, act: 'live', icon: f.icon, k: `${f.fest.toUpperCase()} EVENT · ${UI.left(fs.end)} LEFT`, name: f.name, sub: f.tag, c1: f.theme[0], c2: f.theme[1], rib: { t: 'FESTIVAL', cls: 'fest' } }; }
    const id = evOfDay(), m = M(id), sv = status(id);
    return { id, act: 'live', icon: m.icon, k: `${isWeekend(id) ? 'WEEKEND SPECIAL' : 'EVENT OF THE DAY'} · ${UI.left(weekEnd())} LEFT`, name: m.name, sub: sv.left > 0 ? m.tag : 'Come back for more tries', c1: m.c1, c2: m.c2, rib: ribbon(id) };
  }
  function openHero() { const fl = festLive(); if (fl.length) openFest(fl[0].f.id); else open(evOfDay()); }
  function dayPopup() {
    const s = st(), d = S.dayKey();
    if (s.evPopDay === d || !s.seenTut || s.stats.runs < 1) return false;
    s.evPopDay = d; S.save();
    const h = heroInfo();
    UI.modal(`<div class="evPop" style="--la:${h.c1};--lb:${h.c2}"><div class="rwRays"></div><span class="lvRib ${h.rib.cls}">${h.rib.t}</span><div class="epIc">${ART.ic(h.icon)}</div><div class="mdK">${h.k}</div><div class="mdT">${h.name}</div><div class="mdS">${h.sub}</div>
      <button class="btn big pulse" data-act="evPopGo">${ART.ic('play')} PLAY NOW</button><button class="btn ghost" data-act="closeModal">Later</button></div>`, 'evPopM');
    return true;
  }

  /* ================= HUB ================= */
  function renderHub() {
    calSync();
    const w = weekNo(), tw = twist(w);
    const card = id => {
      const m = M(id), sv = status(id), off = sv.left <= 0, rb = ribbon(id);
      const extra = id === 'tour' && surge().on ? '<em class="live">FLASH SURGE ×3</em>' : id === 'champ' ? `<em>Bounty ${fmt(bounty())}</em>` : id === 'mania' ? `<em>${maniaPhase().name}</em>` : CLASSIC.includes(id) ? `<em>${tw.name}</em>` : isWeekend(id) ? '<em>Rewards ×2</em>' : '';
      return `<div class="evCard th-${id} ${off ? 'off' : ''}" style="--la:${m.c1};--lb:${m.c2}"><button class="evMain" data-ev="${id}"><span class="lvRib ${rb.cls}">${rb.t}</span><span class="evIc">${ART.ic(m.icon)}</span><span class="evTx"><small>${m.period}</small><b>${m.name}</b><span>${m.tag}</span>${extra}</span>
        <span class="evR"><em class="evTime">${ART.ic('clock')} ${UI.left(weekEnd())}</em><i>${off ? 'Done' : sv.max ? sv.left + '/' + sv.max : sv.left + ' left'}</i></span></button><button class="evInfo" data-act="rules:${id}">${ART.ic('info')}</button></div>`;
    };
    const fl = festLive(), nx = fest();
    const fcard = fs => `<button class="festCard" data-act="ev:fest:${fs.f.id}" style="--la:${fs.f.theme[0]};--lb:${fs.f.theme[1]}"><span class="lvRib fest">FESTIVAL · ${UI.left(fs.end)} LEFT</span><span class="fcIc">${ART.ic(fs.f.icon)}</span><span class="evTx"><small>${fs.f.fest.toUpperCase()}</small><b>${fs.f.name}</b><span>${fs.f.tag}</span></span>${ART.ic('next')}</button>`;
    const fc = fl.length ? fl.map(fcard).join('') : nx ? `<div class="festCard soon" style="--la:${nx.f.theme[0]};--lb:${nx.f.theme[1]}"><span class="fcIc">${ART.ic(nx.f.icon)}</span><span class="evTx"><small>COMING SOON · ${nx.f.fest.toUpperCase()}</small><b>${nx.f.name}</b><span>Starts in ${UI.left(nx.start)} · win the ${D.skin(nx.f.skin).name} skin</span></span><button class="evInfo" data-act="rules:${nx.f.id}">${ART.ic('info')}</button></div>` : '';
    const evL = !S.feat('events');
    const nextW = featured(w + 1).map(id => `<div>${ART.ic(META[id].icon)}<b>${META[id].name}</b><small>next week</small></div>`).join('');
    $('events').innerHTML = `${UI.topbar()}<div class="pgT">Events <span class="pgSub">${evL ? ART.ic('lock') + ' Level ' + D.UNLOCK.events.lv : badgeCount() + ' live'}</span></div><div class="pgBody ${evL ? 'evLocked' : ''}">
      ${evL ? `<div class="nextUnl big">${ART.ic('lock')}<span><b>All events unlock at Level ${D.UNLOCK.events.lv}</b><small>Daily Beat is open for everyone · play it now!</small></span></div>` : ''}
      ${fc}
      ${(() => { const db = S.dbeatToday(); return `${db.lost && !db.done ? `<button class="saveStreak" data-act="dbSave">${ART.ic('fire')}<span><b>Your ${db.lost}-day Daily Beat streak broke!</b><small>Watch an ad to save it</small></span><em>${ART.ic('ad')} SAVE</em></button>` : ''}<div class="dailyRow"><button class="dailyCard ${db.done ? 'off' : ''}" data-act="dbeat"><div class="dcL"><small>DAILY BEAT #${db.no}</small><b>${db.done ? `You ${db.score} · Sanx ${D.sanxScore(db.no)}` : 'Same pattern for the whole world'}</b><span>${db.done ? 'New pattern at midnight' : `Sanx got ${D.sanxScore(db.no)} today. One try.`}</span></div><div class="dcR">${db.done ? ART.ic('check') : ART.ic('play')}</div></button><button class="evInfo" data-act="rules:daily">${ART.ic('info')}</button></div>`; })()}
      <div class="seasonHead">${ART.ic('calendar')}<span><b>Event Season · Week ${w + 1}</b><small>3 new events every Monday${weekendOn() ? ' · Weekend Special is live' : ' · Weekend Special on Sat-Sun'}</small></span><em>${UI.left(weekEnd())}</em></div>
      ${liveIds().map(card).join('')}
      <div class="secT">Coming next week <span class="muted">new lineup on Monday</span></div><div class="nextWeek">${nextW}</div>
      <div class="secT">Arena <span class="muted">Premium daily challenges</span></div>
      ${!S.feat('arena') ? `<div class="nextUnl big">${ART.ic('lock')}<span><b>5 Arena events</b><small>unlock at Level ${D.UNLOCK.arena.lv}</small></span></div>` : ''}
      <div class="arenaGrid" style="${S.feat('arena') ? '' : 'display:none'}">${D.ARENA.map(a => { const left = arenaLeft(a.id), e = AR(a.id); return `<button class="arCard ${left <= 0 ? 'off' : ''}" data-act="ev:arena:${a.id}"><span class="arIc">${ART.ic(a.icon)}</span><b>${a.name}</b><small>${a.tag}</small><em>${left > 0 ? left + ' tries' : 'Done'} · best ${e.best || 0}</em></button>`; }).join('')}</div></div>`;
  }

  function daily() { UI.dbeat(false); }

  /* ================= SHARED GAME-STYLE TEMPLATE ================= */
  const chestIc = (tier = 0) => { const c = ['#cd7f32', '#c0c7d6', '#ffd24a', '#9a6df5', '#ff4dd8', '#2ee59d'][Math.max(0, Math.min(5, tier))]; return `<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="5" y="16" width="30" height="18" rx="3" fill="${c}"/><path d="M5 18q15-14 30 0" fill="${c}" stroke="#0004" stroke-width="1.5"/><rect x="5" y="20" width="30" height="3" fill="#0003"/><rect x="17" y="19" width="6" height="8" rx="1.5" fill="#fff8"/><rect x="5" y="16" width="30" height="18" rx="3" fill="none" stroke="#0005" stroke-width="1.5"/></svg>`; };
  const rwTxt = r => [r.coins ? ART.coin(13) + UI.short(r.coins) : '', r.gems ? ART.gem(13) + r.gems : '', r.shields ? ART.shieldC(13) + r.shields : '', r.skin ? 'Skin' : ''].filter(Boolean).join(' ') || '—';
  const meImg = () => S.avatarImg() ? `<img src="${S.avatarImg()}" alt="">` : ART.me('none');
  function energy(left, max, kind = 'zap') {
    const n = Math.max(max || 0, 0), l = Math.max(0, left);
    const lbl = kind === 'heart' ? 'HEARTS' : 'ENERGY';
    if (!n) return `<div class="evEnergy"><span>${lbl}</span><div><b>${l} left</b></div></div>`;
    let s = ''; for (let i = 0; i < Math.max(n, l); i++) s += ART.ic(kind === 'heart' ? 'heart' : 'zap', (i < l ? '' : 'off ') + (kind === 'heart' ? 'hrt' : ''));
    return `<div class="evEnergy"><span>${lbl} · ${l}/${n}</span><div>${s}</div></div>`;
  }
  /* "no energy left" -> watch an ad for one more (once per event per day) */
  const goBtn = (id, left, label, act, cls = '', sub = '') => {
    const b = left > 0 ? `<button class="btn big pulse ${cls}" data-act="ev:${act}">${ART.ic('play')} ${label}</button>`
      : bonus(id) < D.ADCAP.extraTry ? `<button class="btn big alt pulse" data-act="ev:extra:${id}">${ART.ic('ad')} WATCH AD · +1 ENERGY</button>` : `<button class="btn big off">No energy left · back tomorrow</button>`;
    return `<div class="evPlay">${b}<div class="evSub">${sub || (left > 0 ? 'Out of energy later? Watch an ad for +1' : 'Energy refills at midnight')}</div></div>`;
  };
  /* chest road: nodes {lbl, sub, rw, ok, claimed, key, tier} */
  function road(title, sub, nodes) {
    const done = nodes.filter(n => n.ok).length, p = nodes.length > 1 ? Math.max(0, (done - 1) / (nodes.length - 1)) : done ? 1 : 0;
    return `<div class="evPath"><div class="epPT"><span>${title}</span><small>${sub || ''}</small></div><div class="epNodes" style="--n:${nodes.length};--p:${p.toFixed(3)}">${nodes.map((n, i) => {
      const cls = n.claimed ? 'done' : n.ok ? 'ready' : '';
      return `<button class="epNode ${cls}" data-act="${n.ok && !n.claimed && n.key ? 'ev:claim:' + n.key : 'none'}"><span class="epChest">${n.claimed ? ART.ic('check') : chestIc(n.tier != null ? n.tier : i)}</span><i class="epCl">OPEN</i><b>${n.lbl}</b><small>${n.claimed ? 'Collected' : n.sub || rwTxt(n.rw || {})}</small></button>`;
    }).join('')}</div></div>`;
  }
  const board = (rows, meScore) => {
    const all = rows.map(r => ({ ...r, ai: true })).concat([{ name: st().name, score: meScore, me: true }]).sort((a, b) => b.score - a.score);
    return `<div class="evLb"><div class="secT">Leaderboard <span class="muted">You vs AI</span></div><div class="lbList">${all.map((r, i) => `<div class="lbRow ${r.me ? 'me' : ''} ${i < 3 ? 'top' + (i + 1) : ''}"><span class="lbN">${i + 1}</span>${ART.lbAv(r)}<span class="lbName">${esc(r.name)} ${r.ai ? '<em class="aiTag">AI</em>' : '<em class="youTag">YOU</em>'}</span><b>${fmt(r.score)}</b></div>`).join('')}</div></div>`;
  };
  const aiRows = (seedKey, n, top, low) => { const r = seedRnd(hashS(seedKey)); return Array.from({ length: n }, (_, i) => ({ name: D.AI_NAMES[Math.floor(r() * D.AI_NAMES.length)] + (i > 7 ? i : ''), score: Math.min(Math.round(top), Math.round(low + (top - low) * Math.pow(1 - i / n, 1.6) * (0.85 + r() * 0.15))) })).sort((a, b) => b.score - a.score); };
  const rulesList = list => `<div class="evRules"><div class="secT">How it works</div><ol class="rlList">${list.map(r => `<li>${r}</li>`).join('')}</ol></div>`;
  /* o: { m, hero:{key,...}, chips:[html], panel, energy, play, road, extra } */
  function screen(o) {
    const m = o.m, scroll = $('event').querySelector('.evBody');
    const keep = scroll && $('event').dataset.ev === m.id ? scroll.scrollTop : 0;
    $('event').dataset.ev = m.id;
    $('event').innerHTML = `<div class="arenaBg th-${m.id}" style="--la:${m.c1};--lb:${m.c2}"><i></i><i></i><i></i></div>
      <div class="evTop"><button class="iconBtn" data-go="events">${ART.ic('back')}</button><div><small>${m.period}</small><b>${esc(m.name)}</b></div><span class="evCoins" id="evCoins">${ART.coin(16)}<b>${UI.short(st().coins)}</b></span><button class="rulesBtn" data-act="rules:${o.rulesId || m.id}">${ART.ic('info')}</button></div>
      <div class="evChips">${(o.chips || []).join('')}</div>
      <div class="evBody">${EVS.hero(o.hero.key, { a: m.c1, b: m.c2, ...o.hero })}${o.panel || ''}${o.energy || ''}${o.play || ''}${o.road || ''}${o.extra || ''}</div>`;
    if (keep) $('event').querySelector('.evBody').scrollTop = keep;
    UI.show('event'); ADS.banner(true); SND.music(true);
  }
  const chip = (ic, t, cls = '') => `<span class="${cls}">${ART.ic(ic)}${t}</span>`;
  const timeChip = m => chip('clock', `${UI.left(m.end())} left`);
  const twChip = () => { const t = twist(); return chip('sparkle', `${t.name}: ${t.d}`, 'tw'); };

  /* ---------- claim in place: the chest pops, coins fly to the counter, nothing re-renders ---------- */
  function paid(r, label) {
    if (!r) return;
    S.grant(r); S.save();
    const el = lastTapEl && lastTapEl.closest && lastTapEl.closest('.epNode');
    const box = $('evCoins');
    if (el) {
      el.classList.remove('ready'); el.classList.add('done', 'pop'); el.dataset.act = 'none';
      el.querySelector('.epChest').innerHTML = ART.ic('check'); const sm = el.querySelector('small'); if (sm) sm.textContent = 'Collected';
      if (r.coins) FX.flyCoins(el, box, Math.min(12, 4 + Math.round(r.coins / 400)));
      setTimeout(() => { if (box) { box.querySelector('b').textContent = UI.short(st().coins); box.classList.remove('bump'); void box.offsetWidth; box.classList.add('bump'); } }, 720);
    }
    SND.coin();
    const extra = [r.gems ? `+${r.gems} diamonds` : '', r.shields ? `+${r.shields} shields` : '', r.skin ? `${D.skin(r.skin).name} skin unlocked` : '', r.xp ? `+${r.xp} XP` : ''].filter(Boolean).join(' · ');
    UI.toast(`${label}${r.coins ? ` +${fmt(r.coins)} coins` : ''}${extra ? ' · ' + extra : ''}`, r.skin ? 'sparkle' : 'gift');
  }

  function open(id) {
    if (typeof id === 'object') id = id.id;
    if (String(id).startsWith('ar:')) return openArena(id.slice(3));
    if (D.FESTS.find(f => f.id === id)) return openFest(id);
    if (!META[id]) id = evOfDay();
    if (!isLive(id)) { UI.toast(`${META[id].name} is not live this week`, 'calendar'); return UI.show('events'); }
    curEv = id;
    if (POOL[id]) return openPool(id);
    ({ bts: openBTS, champ: openChamp, oma: openOMA, bco: openBCO, tour: openTour, mania: openMania })[id]();
  }
  const evStart = (cfg) => { S.passAdd('event'); S.st.stats.evRuns = (S.st.stats.evRuns || 0) + 1; G.start(cfg); };

  /* ===== 1. BEAT THE SANX ===== */
  let btsTier = 0, btsIns = false;
  function openBTS() {
    const e = bts(), m = M('bts'), left = status('bts').left, tw = twist();
    const sb = [...D.BTS.streak].reverse().find(x => e.streak >= x.n);
    const rwM = (sb ? sb.m : 1) * (tw.coin || 1) * (tw.pts || 1);
    const t = D.BTS.tiers[btsTier], cost = btsIns ? Math.round(t.entry * (1 + D.BTS.insurance)) : t.entry;
    const clock = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    const tiers = D.BTS.tiers.map((x, i) => { const lock = e.wins < x.unlock; return `<button class="${i === btsTier ? 'sel' : ''} ${lock ? 'locked' : ''}" data-act="ev:btsTier:${i}"><b>${x.tiles}</b><small>${lock ? x.unlock + ' wins' : clock(x.secs) + ' · ' + UI.short(Math.round(x.reward * rwM))}</small></button>`; }).join('');
    const nodes = D.BTS.streak.map((s, i) => ({ lbl: `${s.n} wins`, sub: `Prize ×${s.m}`, ok: e.streak >= s.n, claimed: e.streak >= s.n, tier: i + 1 }));
    screen({ m, chips: [timeChip(m), twChip()],
      hero: { key: 'ring', mood: e.streak ? 'angry' : 'smug', hp: Math.max(8, 100 - e.streak * 22), hpTxt: e.streak ? `${e.streak} win streak` : 'full power', taunt: pick(['You think you can beat me?', 'Every round you fail, I keep your coins.', 'I dare you to pick 12.', 'Your coins are safe... until they are not.']), tmood: 'angry' },
      panel: `<div class="evPanel"><div class="epH"><div><div class="epK">PICK YOUR FIGHT</div><div class="epT">Reach ${t.tiles} tiles</div></div><div class="epR">Bet ${UI.short(cost)}</div></div><div class="epSel">${tiers}</div>
        <button class="evIns" data-act="ev:btsIns">${ART.shieldC(20)}<span><b>Coin insurance</b><small>+30% bet · 50% back if you lose</small></span><i class="sw ${btsIns ? 'on' : ''}"></i></button>
        <div class="epStats"><div><b>${e.streak}</b><small>Win streak${sb ? ` ×${sb.m}` : ''}</small></div><div><b>${e.wins}</b><small>Total wins</small></div><div><b>${clock(t.secs)}</b><small>Clock</small></div></div></div>`,
      energy: energy(left, D.BTS.attempts), play: goBtn('bts', left, `FIGHT · BET ${UI.short(cost)}`, 'btsGo', 'danger', 'Starts at 2 tiles, +1 every round · 3 hearts · +30s once with an ad'),
      road: road('WIN STREAK BONUS', 'a streak raises the prize', nodes) });
  }
  function btsGo() {
    const e = bts(), t = D.BTS.tiers[btsTier], tw = twist();
    if (status('bts').left <= 0) return UI.toast('No energy left today', 'clock');
    if (e.wins < t.unlock) return UI.toast(`Win ${t.unlock} times to unlock`, 'lock');
    const cost = btsIns ? Math.round(t.entry * (1 + D.BTS.insurance)) : t.entry;
    if (!NET.gate()) return;
    if (!S.spend('coins', cost)) return UI.toast('Not enough coins', 'coins');
    e.att++; S.save(); S.quest('event');
    const ins = btsIns; const fired = {};
    evStart({ mode: 'classic', ev: twApply({
      id: 'bts', name: 'BEAT THE SANX', icon: 'skull', title: `Reach ${t.tiles} tiles`, hearts: 3, timer: t.secs, timerRunsAlways: true, noRevive: true, boss: false, timeAd: true, theme: [META.bts.c1, META.bts.c2], rounds: t.tiles - 1,
      onStep: R => { G.info(`${R.maxLen} / ${t.tiles} tiles`); return R.maxLen >= t.tiles ? 'win' : null; },
      onTick: R => {
        if (!fired.h && R.timeLeft < t.secs / 2) { fired.h = 1; G.say(pick(['Halfway... sweating yet?', 'Not bad. I have seen better.', 'Tick tock.']), 'smug'); }
        if (!fired.f && R.timeLeft < 10) { fired.f = 1; G.say('10 seconds. DO. NOT. BLINK.', 'angry'); }
      },
      onEnd: r => {
        const sb = [...D.BTS.streak].reverse().find(x => e.streak + (r.won ? 1 : 0) >= x.n);
        let msg; const g = {};
        if (r.won) { e.streak++; e.wins++; st().stats.btsWins++; g.coins = Math.round(t.reward * (sb ? sb.m : 1) * (tw.coin || 1) * (tw.pts || 1)); S.grant(g); msg = pick(['I did not think you had it. Well played.', 'Beginner\'s luck. Come back tomorrow.', 'Fine. You earned it. This time.']); }
        else { e.streak = 0; if (ins) { g.coins = Math.round(t.entry * D.BTS.refund); S.grant(g); } msg = pick(['Your coins are mine now.', 'Did you really think you could beat me?', 'So close. Too bad.']); }
        S.save(); S.checkAch();
        result({ won: r.won, mood: r.won ? 'shock' : 'laugh', title: r.won ? 'SANX BEATEN!' : r.why === 'time' ? 'TIME UP' : 'SANX WINS', big: `${r.tiles}/${t.tiles}`, sub: 'tiles', line: msg, g, refund: !r.won && ins, id: 'bts' });
      }
    }) });
  }

  /* ===== 2. BEAT THE CHAMPION ===== */
  function btcScore(r) { return Math.round(Math.pow(r.tiles, 2) * 110 * Math.min(3, 1 + r.maxCombo / 8) * acc(r) * (1 + 0.08 * r.prestige) * (twist().pts || 1)); }
  function openChamp() {
    const e = btc(), c = champ(), m = M('champ'), left = status('champ').left, gap = c.score - e.best;
    const prox = e.throne ? 'Throne taken!' : e.best ? (gap / c.score <= 0.05 ? `Only ${fmt(gap)} behind!` : `${fmt(gap)} to dethrone`) : 'First attempt';
    const nodes = D.BTC.rewards.map((w, i) => ({ lbl: `${Math.round(w.pct * 100)}%`, sub: rwTxt({ coins: w.coins }), ok: e.best >= c.score * w.pct, claimed: e.claimed.includes(i), key: 'btc:' + i, tier: i }))
      .concat([{ lbl: 'Throne', sub: `${UI.short(bounty())} + 2 shields`, ok: e.best >= c.score, claimed: false, key: 'btc:throne', tier: 4 }]);
    screen({ m, chips: [timeChip(m), chip('coins', `Bounty ${fmt(bounty())}`, 'hot'), twChip()],
      hero: { key: 'throne', name: c.name, img: c.img, hp: e.best ? Math.max(4, 100 - e.best / c.score * 100) : 100, hpLabel: 'HP', hpTxt: prox, lvl: e.lvl || 0, taunt: c.line, tmood: 'smug' },
      panel: `<div class="evPanel"><div class="epH"><div><div class="epK">CHAMPION ${D.ROMAN[(e.lvl || 0) + 1]} · ${D.MODE[c.mode].name.toUpperCase()}</div><div class="epT">Beat ${fmt(c.score)} points</div></div><div class="epR">${c.tiles} tiles</div></div>
        <div class="epProg"><div class="epPL"><span>Your best ${fmt(e.best)}</span><span>${fmt(c.score)}</span></div><span class="escBar gold"><i style="width:${Math.min(100, e.best / c.score * 100)}%"></i></span></div></div>`,
      energy: energy(left, D.BTC.attempts, 'heart'), play: goBtn('champ', left, `CHALLENGE ${esc(c.name.toUpperCase())}`, 'champGo'),
      road: road('WEEKLY BOUNTY ROAD', 'get close for chests', nodes),
      extra: board(aiRows(e.wk + 'c', 6, c.score * 0.97, c.score * 0.35).concat([{ name: c.name + ' (Champion)', score: c.score, av: c.img }]), e.best) });
  }
  function champGo() {
    const e = btc(), c = champ();
    if (status('champ').left <= 0) return UI.toast('No hearts left today', 'clock');
    if (!NET.gate()) return;
    e.att++; S.save(); S.quest('event');
    evStart({ mode: c.mode, ev: twApply({ id: 'champ', name: 'BEAT THE CHAMPION', icon: 'crown', title: `Beat ${fmt(c.score)} · ${c.tiles} tiles`, hearts: 3, noRevive: false, startLevel: 1, theme: [META.champ.c1, META.champ.c2],
      onEnd: r => { const sc = btcScore(r), pb = sc > e.best; if (pb) e.best = sc; if (sc >= c.score) e.throne = true; S.save();
        result({ won: sc >= c.score, mood: sc >= c.score ? 'shock' : 'smug', title: sc >= c.score ? 'NEW CHAMPION!' : pb ? 'NEW PERSONAL BEST' : 'TRY AGAIN', big: fmt(sc), sub: 'points', line: sc >= c.score ? `${c.name} has been dethroned!` : `${fmt(Math.max(0, c.score - sc))} points short of ${c.name}`, id: 'champ' }); } }) });
  }

  /* ===== 3. ONE MAN ARMY ===== */
  function omaScore(r, beaten) { return Math.round((Math.pow(r.tiles, 2) * 50 * (1 + beaten * 0.6) * Math.min(2.5, 1 + r.maxCombo / 10) + r.perfect * 200) * (twist().pts || 1)); }
  function openOMA() {
    const e = oma(), m = M('oma'), left = status('oma').left;
    const sold = D.OMA.rivals.map((r, i) => ({ name: r.name, short: r.name.split(' ').pop(), at: r.at, down: i < e.beaten, next: i === e.beaten }));
    const nodes = OMA_RANKS.map((n, i) => ({ lbl: n.length > 8 ? n.slice(0, 6) + '.' : n, sub: i ? `${i} down` : 'Enter', ok: e.att > 0 && e.beaten >= i, claimed: e.claimed.includes(i), key: 'oma:' + i, tier: Math.min(5, i) }));
    screen({ m, chips: [timeChip(m), chip('skull', `Sudden death every ${D.OMA.suddenEvery}th tile`), twChip()],
      hero: { key: 'army', soldiers: sold, me: meImg(), taunt: e.beaten >= 5 ? 'A one man army. Respect.' : `${5 - e.beaten} soldiers stand in your way.`, tmood: 'angry' },
      panel: `<div class="evPanel"><div class="epStats"><div><b>${OMA_RANKS[e.beaten]}</b><small>Your rank</small></div><div><b>${fmt(e.best)}</b><small>Best score</small></div><div><b>${e.beaten}/5</b><small>Eliminated</small></div></div></div>`,
      energy: energy(left, D.OMA.attempts), play: goBtn('oma', left, 'DEPLOY', 'omaGo', '', 'Classic ladder from 2 tiles · 3 hearts · no revives'),
      road: road('RANK REWARDS', 'eliminate soldiers', nodes), extra: board(aiRows(e.wk + 'o', 7, 280000, 30000), e.best) });
  }
  function omaGo() {
    const e = oma(); if (status('oma').left <= 0) return UI.toast('No energy left this week', 'clock');
    if (!NET.gate()) return;
    e.att++; S.save(); S.quest('event'); let down = 0;
    evStart({ mode: 'classic', ev: twApply({ id: 'oma', name: 'ONE MAN ARMY', icon: 'army', title: 'Survive', hearts: 3, noRevive: true, boss: false, startLevel: 1, theme: [META.oma.c1, META.oma.c2], rounds: 13,
      sudden: R => R.seq.length % D.OMA.suddenEvery === 0,
      onStep: R => { const r = D.OMA.rivals[down]; if (r && R.maxLen >= r.at) { down++; S.grant({ coins: r.bounty }); G.info(`${r.name} eliminated! +${r.bounty}`); } },
      onEnd: r => { e.beaten = Math.max(e.beaten, down); const sc = omaScore(r, down); if (sc > e.best) e.best = sc; S.save();
        result({ won: down > 0, soft: down < 3, mood: down >= 3 ? 'shock' : 'laugh', title: down === 5 ? 'LAST MAN STANDING' : `${down} ELIMINATED`, big: fmt(sc), sub: 'points', line: `Longest pattern: ${r.tiles} tiles`, id: 'oma' }); } }) });
  }

  /* ===== 4. BEAT THE COINS ===== */
  function bcoCoins(r, tierMult, jackpot) { const e = bco(); const sm = e.streak >= 7 ? 2 : e.streak >= 5 ? 1.7 : e.streak >= 3 ? 1.4 : e.streak >= 2 ? 1.2 : 1; return Math.round(r.tiles * r.tiles * 8 * Math.min(2.5, 1 + r.maxCombo / 10) * Math.max(0.7, acc(r)) * sm * tierMult * (jackpot ? 2 : 1) * (lastHour() ? 1.5 : 1) * (1 + 0.05 * r.prestige) * (twist().coin || 1)); }
  function openBCO() {
    const e = bco(), m = M('bco'), left = status('bco').left;
    const next = D.BCOINS.tiers.find(t => e.best < t.at);
    const nodes = D.BCOINS.tiers.map((t, i) => ({ lbl: t.name.length > 8 ? t.name.slice(0, 5) + '.' : t.name, sub: rwTxt({ coins: t.reward }), ok: e.best >= t.at, claimed: e.claimed.includes(i), key: 'bco:' + i, tier: i }));
    screen({ m, chips: [timeChip(m), chip('fire', `${e.streak || 0} day streak`), lastHour() ? chip('zap', 'Last hour ×1.5', 'hot') : twChip()],
      hero: { key: 'vault', big: fmt(e.best), sub: next ? `${fmt(next.at - e.best)} to ${next.name}` : 'Diamond tier reached!', pct: next ? e.best / next.at * 100 : 100, taunt: pick(['My vault. My coins. Hands off.', 'Hit 15 combo and I lose double.', 'The alarm is on. Go.']), tmood: 'smug' },
      energy: energy(left, 5), play: goBtn('bco', left, 'RAID THE VAULT', 'bcoGo', '', '15+ combo = JACKPOT ×2 · play daily for a streak bonus'),
      road: road('VAULT TIERS', 'best raid today', nodes), extra: board(aiRows(e.day + 'b', 6, 8200, 800), e.best) });
  }
  function bcoGo() {
    const e = bco(); if (status('bco').left <= 0) return UI.toast('No raids left today', 'clock');
    if (!NET.gate()) return;
    e.att++; e.played = S.dayKey(); S.save(); S.quest('event');
    evStart({ mode: 'classic', ev: twApply({ id: 'bco', name: 'BEAT THE COINS', icon: 'vault', title: 'Vault raid', hearts: 3, noRevive: false, startLevel: 1, theme: [META.bco.c1, META.bco.c2],
      onLevel: R => { const room = [...D.BCOINS.rooms].reverse().find(x => R.levelsDone + 1 >= x.at); G.info(`Entering: ${room.n}`); },
      onEnd: r => { const jack = r.maxCombo >= 15, tier = [...D.BCOINS.tiers].reverse().find(t => e.best >= t.at); const c = bcoCoins(r, tier ? tier.mult : 1, jack); S.grant({ coins: c }); if (c > e.best) e.best = c; S.save();
        result({ won: true, soft: true, mood: c > 1500 ? 'shock' : 'smug', title: jack ? 'JACKPOT RAID!' : 'RAID COMPLETE', big: fmt(c), sub: 'coins raided', line: `Longest pattern: ${r.tiles} tiles`, g: { coins: c }, id: 'bco' }); } }) });
  }

  /* ===== 5. WORLD FLASH TOUR (weekly: clear a city to fly on, or wait for the day it opens) ===== */
  const CITIES = ['Tokyo', 'Rio', 'Cairo', 'New York'];
  const tourOpen = sid => { if (sid === 1) return true; const e = tour(), prev = D.TOUR.stages.find(s => s.id === sid - 1); return (e.best[prev.id] || 0) >= prev.goal || dow() >= (sid - 1) * 2; };
  let tourStage = 1, tourMode = null;
  function tourScore(r, stg, sg) { return Math.round(Math.pow(r.tiles, 2) * 120 * Math.min(3, 1 + r.maxCombo / 8) * acc(r) * stg.mult * (1 + 0.08 * r.prestige) * (sg ? D.TOUR.surgeMult : 1) * (twist().pts || 1)); }
  function openTour() {
    const e = tour(), m = M('tour'), sg = surge();
    if (!tourOpen(tourStage)) tourStage = 1;
    const stg = D.TOUR.stages.find(s => s.id === tourStage);
    const modes = (stg.modes.length ? stg.modes : D.MODES.map(x => x.id).filter(x => !['zen', 'blitz', 'twin'].includes(x))).filter(x => S.unlocked(x));
    if (!tourMode || !modes.includes(tourMode)) tourMode = modes[0] || 'classic';
    const pins = D.TOUR.stages.map((s, i) => ({ name: `${CITIES[i]} ×${s.mult}`, st: (e.best[s.id] || 0) >= s.goal ? 'done' : s.id === tourStage ? 'now' : tourOpen(s.id) ? 'open' : 'lock' }));
    const left = stg.attempts + bonus('tour') - (e.att[stg.id] || 0);
    const nodes = D.TOUR.stages.map((s, i) => ({ lbl: CITIES[i], sub: rwTxt({ coins: D.TOUR.rewards[i + 1] }), ok: (e.best[s.id] || 0) >= s.goal, claimed: e.claimed.includes(i), key: 'tour:' + i, tier: i + 1 }));
    screen({ m, chips: [timeChip(m), chip('zap', sg.on ? `SURGE ×3 · ${Math.ceil(sg.left / 60)}m` : `Surge ×3 in ${Math.floor(sg.in / 3600)}h ${Math.floor(sg.in % 3600 / 60)}m`, sg.on ? 'hot' : ''), twChip()],
      hero: { key: 'globe', pins, taunt: `${CITIES[tourStage - 1]} is ${['easy', 'fast', 'dark', 'brutal'][tourStage - 1]}. Blink and you lose.`, tmood: 'smug' },
      panel: `<div class="evPanel"><div class="epH"><div><div class="epK">STOP ${tourStage} OF 4 · ${stg.name.toUpperCase()}</div><div class="epT">${CITIES[tourStage - 1]}</div></div><div class="epR">×${stg.mult} pts</div></div>
        <div class="epSel four">${D.TOUR.stages.map((s, i) => `<button class="${s.id === tourStage ? 'sel' : ''} ${tourOpen(s.id) ? '' : 'locked'}" data-act="ev:tourStage:${s.id}"><b>${CITIES[i].split(' ')[0]}</b><small>${tourOpen(s.id) ? (e.best[s.id] || 0) >= s.goal ? 'cleared' : '×' + s.mult : ['', 'Wed', 'Fri', 'Sun'][i] + ' or clear'}</small></button>`).join('')}</div>
        <div class="epSel">${modes.slice(0, 6).map(x => `<button class="${x === tourMode ? 'sel' : ''}" data-act="ev:tourMode:${x}">${ART.ic(D.MODE[x].icon)}<small>${D.MODE[x].name}</small></button>`).join('')}</div>
        <div class="epProg"><div class="epPL"><span>Best ${fmt(e.best[stg.id] || 0)}</span><span>Goal ${fmt(stg.goal)}</span></div><span class="escBar"><i style="width:${Math.min(100, (e.best[stg.id] || 0) / stg.goal * 100)}%"></i></span></div></div>`,
      energy: energy(left, stg.attempts), play: goBtn('tour', left, `FLY TO ${CITIES[tourStage - 1].toUpperCase()}`, 'tourGo'),
      road: road('TOUR REWARDS', 'clear each city', nodes), extra: board(aiRows(e.wk + 't' + stg.id, 7, stg.goal * 2.2, stg.goal * 0.3), e.best[stg.id] || 0) });
  }
  function tourGo() {
    const e = tour(), stg = D.TOUR.stages.find(s => s.id === tourStage), used = e.att[stg.id] || 0;
    if (used >= stg.attempts + bonus('tour')) return UI.toast('No energy left for this city', 'clock');
    if (!NET.gate()) return;
    e.att[stg.id] = used + 1; S.save(); S.quest('event');
    const sg = surge().on;
    evStart({ mode: tourMode, ev: twApply({ id: 'tour', name: 'WORLD FLASH TOUR', icon: 'globe', title: `${CITIES[stg.id - 1]} · ${stg.name}`, hearts: 3, startLevel: 1, theme: [META.tour.c1, META.tour.c2],
      onEnd: r => { const sc = tourScore(r, stg, sg), pb = sc > (e.best[stg.id] || 0); if (pb) e.best[stg.id] = sc; S.save();
        result({ won: sc >= stg.goal, mood: sc >= stg.goal ? 'shock' : 'smug', title: sc >= stg.goal ? `${CITIES[stg.id - 1].toUpperCase()} CLEARED!` : pb ? 'NEW BEST' : 'KEEP PUSHING', big: fmt(sc), sub: 'points' + (sg ? ' · surge ×3' : ''), line: `Goal: ${fmt(stg.goal)}`, id: 'tour' }); } }) });
  }

  /* ===== 6. SANX MANIA (weekly: Qualifier Mon-Wed, Championship Thu-Sat, Grand Final Sun) ===== */
  let maniaMode = 'classic';
  function maniaScore(r, ph) { return Math.round(Math.pow(r.tiles, 2) * 90 * Math.min(3, 1 + r.maxCombo / 8) * acc(r) * ph.mult * (twist().pts || 1)); }
  function openMania() {
    const e = mania(), m = M('mania'), ph = maniaPhase(), left = status('mania').left;
    const modes = D.MODES.filter(x => S.unlocked(x.id) && x.id !== 'zen' && x.id !== 'blitz');
    if (!modes.find(x => x.id === maniaMode)) maniaMode = 'classic';
    const divs = D.MANIA.divisions, cur = [...divs].reverse().find(d => e.best >= d.at), nx = divs[divs.indexOf(cur) + 1];
    const nodes = D.MANIA.milestones.map((x, i) => ({ lbl: UI.short(x.s), sub: i === 4 ? 'Sanx skin' : rwTxt(x), ok: e.best >= x.s, claimed: e.claimed.includes(i), key: 'mania:' + i, tier: i }));
    screen({ m, chips: [timeChip(m), chip('flame', `${ph.name} ×${ph.mult}`, 'hot'), twChip()],
      hero: { key: 'stage', big: cur.name.toUpperCase(), sub: nx ? `${fmt(nx.at - e.best)} points to ${nx.name}` : 'Top division!', taunt: pick(['The crowd came to see ME.', 'Louder! Oh wait, they are booing you.', 'Grand Final on Sunday. Be there.']), tmood: 'laugh' },
      panel: `<div class="evPanel"><div class="epH"><div><div class="epK">DIVISION LEAGUE · RESETS MONDAY</div><div class="epT">${cur.name}</div></div><div class="epR">${rwTxt(cur.reward)}</div></div>
        <div class="epSel">${modes.slice(0, 6).map(x => `<button class="${x.id === maniaMode ? 'sel' : ''}" data-act="ev:maniaMode:${x.id}">${ART.ic(x.icon)}<small>${x.name}</small></button>`).join('')}</div>
        <div class="epStats"><div><b>${fmt(e.best)}</b><small>Best this week</small></div><div><b>×${ph.mult}</b><small>${ph.name}</small></div><div><b>${nx ? nx.name.split(' ')[0] : 'MAX'}</b><small>Next division</small></div></div></div>`,
      energy: energy(left, 5), play: goBtn('mania', left, 'TAKE THE STAGE', 'maniaGo'),
      road: road('MILESTONES', 'best score this week', nodes), extra: board(aiRows(e.wk + 'm', 7, 150000, 12000), e.best) });
  }
  function maniaGo() {
    const e = mania(); if (status('mania').left <= 0) return UI.toast('No energy left today', 'clock');
    if (!NET.gate()) return;
    e.att++; S.save(); S.quest('event'); const ph = maniaPhase();
    evStart({ mode: maniaMode, ev: twApply({ id: 'mania', name: 'SANX MANIA', icon: 'flame', title: ph.name, hearts: 3, startLevel: 1, theme: [META.mania.c1, META.mania.c2],
      onEnd: r => { const sc = maniaScore(r, ph), pb = sc > e.best; if (pb) e.best = sc; S.save();
        result({ won: pb, soft: true, mood: pb ? 'shock' : 'laugh', title: pb ? 'NEW WEEKLY BEST' : 'MANIA RUN', big: fmt(sc), sub: 'points', line: `${ph.name} · ×${ph.mult}`, id: 'mania' }); } }) });
  }

  /* ================= POOL EVENT SCREEN (one template, eight events) ================= */
  function openPool(id) {
    const P = POOL[id], e = PE(id), m = M(id), left = status(id).left, ms = poolMs(id), rw = poolRw(id), v = poolVal(id), wk = isWeekend(id);
    const cl = P.king ? climbers() : null;
    const nodes = ms.map((x, i) => ({ lbl: P.king ? cl[i].name : UI.short(x), sub: P.king ? `${x} tiles` : rwTxt(rw[i]), ok: v >= x, claimed: e.claimed.includes(i), key: `p:${id}:${i}`, tier: i + (P.king && i === 4 ? 1 : 0) }));
    const nextM = ms.find(x => v < x), pct = nextM ? v / nextM * 100 : 100;
    const heroO = { key: m.scene, taunt: pick(P.taunts), tmood: P.danger ? 'angry' : 'smug', me: meImg() };
    if (P.king) { const passed = cl.filter(c => e.best >= c.tiles).length; const CX = [28, 40, 53, 65, 78], CY = [74, 62, 51, 41, 31]; heroO.climbers = cl.map((c, i) => ({ name: c.name, passed: e.best >= c.tiles, x: CX[i], y: CY[i] })).concat([{ me: true, x: passed >= 5 ? 50 : passed ? CX[passed - 1] - 10 : 12, y: passed >= 5 ? 22 : passed ? CY[passed - 1] - 4 : 78 }]); }
    else if (P.metric === 'digs') { heroO.pct = Math.min(100, v); heroO.big = `${v}`; heroO.sub = nextM ? `${nextM - v} digs to the next chest` : 'Treasure found!'; }
    else if (P.metric === 'bank') { heroO.big = fmt(e.best || 0); heroO.sub = 'biggest bank this week'; }
    else if (P.metric === 'rounds') { heroO.pct = Math.min(100, v / 50 * 100); heroO.big = `${v}`; heroO.sub = 'most rounds in one run'; }
    else { heroO.big = `${v}`; heroO.sub = nextM ? `best this week · next chest at ${nextM}` : 'best this week · all chests open'; }
    screen({ m, chips: [timeChip(m), wk ? chip('sparkle', 'Weekend Special · rewards ×2', 'hot') : isNewWeek(id) ? chip('sparkle', 'New this week', 'hot') : '', P.hearts === 1 ? chip('skull', 'One heart only') : chip('heart', `${P.hearts} hearts`)].filter(Boolean),
      hero: heroO,
      panel: `<div class="evPanel"><div class="epH"><div><div class="epK">${P.total ? 'ADDS UP ALL WEEK' : 'YOUR BEST THIS WEEK'}</div><div class="epT">${P.king ? `${cl.filter(c => e.best >= c.tiles).length} of 5 climbers passed` : `${fmt(v)} ${P.unit}`}</div></div><div class="epR">${nextM ? `next ${UI.short(nextM)}` : 'MAX'}</div></div>
        <div class="epProg"><span class="escBar"><i style="width:${Math.min(100, pct)}%"></i></span></div>
        <div class="epStats"><div><b>${e.att || 0}</b><small>Runs today</small></div><div><b>${P.hearts}</b><small>Hearts</small></div><div><b>${P.cfg && P.cfg.coinMult ? '×' + P.cfg.coinMult * (wk ? 2 : 1) : wk ? '×2' : '×1'}</b><small>Coins</small></div></div></div>`,
      energy: energy(left, P.tries), play: goBtn(id, left, P.play, 'poolGo:' + id, P.danger ? 'danger' : ''),
      road: road(P.king ? 'CLIMBERS TO PASS' : 'CHEST ROAD', P.king ? 'beat their length' : `by ${P.unit}`, nodes), extra: rulesList(P.rules) });
  }
  function poolGo(id) {
    const P = POOL[id], e = PE(id);
    if (status(id).left <= 0) return UI.toast('No energy left today', 'clock');
    if (!NET.gate()) return;
    e.att++; S.save(); S.quest('event');
    const ev = { id: 'p_' + id, poolId: id, name: META[id].name.toUpperCase(), icon: META[id].icon, title: META[id].tag, hearts: P.hearts, noRevive: false, boss: false, startLevel: 1, theme: [META[id].c1, META[id].c2], ...(P.cfg || {}) };
    if (isWeekend(id)) ev.coinMult = (ev.coinMult || 1) * 2;
    let dug = 0, pot = 0, banked = 0, n = 0;
    if (P.cfg && P.cfg.rampSpeed) ev.speedAt = (lv, R) => Math.max(0.55, 1 - R.stepIdx * 0.035);
    if (P.total) ev.onStep = () => { dug++; e.total = (e.total || 0) + 1; S.save(); if (e.total % 5 === 0) G.info(`${e.total} digs!`); };
    if (P.cfg && P.cfg.marathon) ev.onStep = R => { if (R.stepsDone % 10 === 0) { const c = 60 * R.stepsDone / 10 * (isWeekend(id) ? 2 : 1); S.grant({ coins: c }); G.info(`${R.stepsDone} rounds! +${c}`); } };
    if (P.cfg && P.cfg.pot) ev.onStep = () => {
      n++; pot = Math.min(40960, 20 * Math.pow(2, n - 1)); G.info(`Pot: ${fmt(pot)} coins`);
      if (n < 3) return null;
      return G.pauseFor(async () => {
        const v = await UI.ask(`<div class="mdK">Round ${n} cleared</div><div class="dnPot">${ART.coin(30)}<b>${fmt(pot)}</b></div><div class="mdT">Bank it or double it?</div><div class="mdS">Next round pays <b>${fmt(Math.min(40960, pot * 2))}</b>. One mistake and you get nothing.</div>
          <div class="dnChoice"><button class="btn big alt" data-pick="bank">${ART.ic('vault')} BANK</button><button class="btn big pulse danger" data-pick="double">${ART.ic('dice')} DOUBLE</button></div>`, 'dnM');
        if (v === 'bank') banked = pot;
        return false;
      }).then(() => banked ? 'win' : null);
    };
    ev.onEnd = r => {
      const g = {}; let won = false, title, big, sub, line;
      if (P.cfg && P.cfg.pot) { won = !!banked; if (won) { g.coins = banked; S.grant(g); e.best = Math.max(e.best || 0, banked); } title = won ? 'BANKED!' : 'NOTHING!'; big = fmt(banked || pot); sub = won ? 'coins banked' : 'coins lost'; line = won ? 'Smart. Or scared?' : 'The house always wins.'; }
      else if (P.total) { won = dug > 0; title = dug ? `+${dug} DIGS` : 'NO DIGS'; big = e.total; sub = 'digs this week'; line = `Longest pattern: ${r.tiles} tiles`; }
      else if (P.metric === 'rounds') { const rd = r.steps; won = rd > (e.best || 0); e.best = Math.max(e.best || 0, rd); title = won ? 'NEW BEST RUN' : 'RUN OVER'; big = rd; sub = 'rounds in one run'; line = `Longest pattern: ${r.tiles} tiles`; }
      else { won = r.tiles > (e.best || 0); e.best = Math.max(e.best || 0, r.tiles); title = won ? 'NEW BEST' : META[id].name.toUpperCase(); big = r.tiles; sub = 'tiles'; line = P.king ? `${climbers().filter(c => e.best >= c.tiles).length} of 5 climbers passed` : `${r.steps} rounds cleared`; }
      S.save();
      result({ won, soft: !(P.cfg && P.cfg.pot), mood: won ? 'shock' : 'laugh', title, big, sub, line, g, id });
    };
    evStart({ mode: P.mode, ev });
  }

  /* ================= ARENA ================= */
  function openArena(id) {
    curEv = 'ar:' + id;
    const a = D.ARENA.find(x => x.id === id), e = AR(id), left = arenaLeft(id);
    const m = { id: 'ar_' + id, name: a.name, period: 'ARENA · DAILY', end: dayEnd, c1: '#743ae8', c2: '#14063a' };
    const nodes = D.ARENA_RW.map((w, i) => ({ lbl: `${w.t} tiles`, rw: w, ok: e.best >= w.t, claimed: e.claimed.includes(i), key: 'ar:' + id + ':' + i, tier: i }));
    screen({ m, rulesId: 'arena_' + id, chips: [chip('clock', `${UI.left(dayEnd())} left`), chip('heart', `${a.hearts} hearts`)],
      hero: { key: 'arena', icon: a.icon, big: `${e.best || 0}`, sub: 'best pattern today', taunt: pick(['The Arena eats rookies.', 'Show me what you have got.', 'Nobody leaves the Arena smiling.']), tmood: 'smug' },
      panel: `<div class="evPanel"><div class="epH"><div><div class="epK">ARENA</div><div class="epT">${esc(a.tag)}</div></div></div></div>`,
      energy: energy(left, D.ARENA_TRIES), play: goBtn('ar_' + id, left, `PLAY ${a.name.toUpperCase()}`, 'arenaGo:' + id),
      road: road('REWARDS TODAY', 'longest pattern', nodes), extra: rulesList(a.rules) });
  }
  function arenaGo(id) {
    const a = D.ARENA.find(x => x.id === id), e = AR(id);
    if (arenaLeft(id) <= 0) return UI.toast('No energy left today', 'clock');
    if (!NET.gate()) return;
    e.att++; S.save(); S.quest('event');
    const ev = { id: 'ar_' + id, name: a.name.toUpperCase(), icon: a.icon, title: a.tag, hearts: a.hearts, noRevive: id !== 'tower', maxAdRevive: id === 'tower' ? 1 : 0, boss: false, theme: ['#743ae8', '#14063a'] };
    let mode = 'classic', floor = 0;
    if (id === 'gauntlet') { const cyc = ['classic', 'reverse', 'chaos', 'ghost', 'negative', 'speed']; ev.modeAtRound = i => cyc[Math.floor(i / 3) % cyc.length]; }
    if (id === 'tower') ev.onStep = R => { const f = Math.floor(R.maxLen / 2); if (f > floor) { floor = f; const c = 40 * f; S.grant({ coins: c }); G.info(`Floor ${f}! +${c} coins`); } };
    if (id === 'speedrun') { mode = 'speed'; ev.stepTimer = true; ev.pureMode = true; }
    if (id === 'bossrush') { ev.speed = D.BOSS_SPEED; ev.coinMult = 3; }
    if (id === 'roulette') { const pool = D.MODES.filter(x => S.unlocked(x.id) && !['twin', 'blitz', 'zen'].includes(x.id)).map(x => x.id); ev.modeAtRound = () => pool[Math.floor(Math.random() * pool.length)]; }
    ev.onEnd = r => { const pb = r.tiles > (e.best || 0); if (pb) e.best = r.tiles; S.save();
      result({ won: pb, soft: true, mood: pb ? 'shock' : 'laugh', title: pb ? 'NEW BEST TODAY' : a.name.toUpperCase(), big: r.tiles, sub: 'tiles', line: id === 'tower' ? `You reached floor ${floor}` : `${r.steps} rounds cleared`, id: 'ar:' + id }); };
    evStart({ mode, ev });
  }

  /* ================= FESTIVAL EVENTS ================= */
  /* what counts as progress for each festival kind */
  const festMetric = f => ({ speed: 'steps', tri: 'levels', marathon: 'levels', spooky: 'levels', twin: 'pairs', duo: 'pairs', collect: 'count', diya: 'count' })[f.kind] || 'rounds';
  const festNoun = f => f.noun || ({ kite: 'kites cut', advent: 'rounds', ghost: 'rounds', holi: 'rounds', nights: 'rounds', speed: 'steps', tri: 'levels', marathon: 'levels', spooky: 'levels', twin: 'pairs', duo: 'pairs', collect: 'modaks', diya: 'lamps lit', steps: 'rounds' })[f.kind] || 'rounds';
  function openFest(id) {
    const inf = festInfo(id), f = inf.f, live = inf.live; curEv = id;
    const e = FS(id), tries = festTries(id), sk = D.skin(f.skin), own = st().skins.includes(f.skin), metric = festMetric(f);
    const m = { id: 'f_' + id, name: f.name, period: `${f.fest.toUpperCase()} · FESTIVAL`, end: () => live ? inf.end : inf.start, c1: f.theme[0], c2: f.theme[1] };
    const val = metric === 'count' ? e.count : e.best || 0;
    const goal = f.goal;
    let nodes, panel = '';
    if (metric === 'count') {
      const ms = f.kind === 'diya' ? [25, 50, 75, 100] : [11, 21, 51];
      nodes = ms.map((x, i) => ({ lbl: `${x}`, sub: x === goal ? `${sk.name} skin` : rwTxt({ coins: Math.round(f.reward.coins * (i + 1) / (ms.length * 2)) }), ok: e.count >= x, claimed: e.claimed.includes(i), key: `fest:${id}:${i}`, tier: x === goal ? 5 : i }));
    } else {
      const fr = [0.25, 0.5, 0.75], coins = [100, 200, 400];
      nodes = fr.map((p, i) => { const t = Math.max(1, Math.round(goal * p)); return { lbl: `${t}`, sub: rwTxt({ coins: coins[i] }), ok: val >= t, claimed: e.fm.includes(i), key: `fm:${id}:${i}`, tier: i }; })
        .concat([{ lbl: `${goal}`, sub: `${sk.name} skin`, ok: e.won, claimed: e.won, tier: 5 }]);
    }
    if (f.kind === 'nights') {
      const night = festDayIdx(id, 8);
      panel = `<div class="evPanel"><div class="epK">9 NIGHTS · TONIGHT: NIGHT ${night + 1}</div><div class="nights">${f.nights.map((x, i) => `<div class="night ${e.nights.includes(i) ? 'lit' : ''} ${i === night ? 'now' : ''} ${i > night ? 'locked' : ''}"><small>Night ${i + 1}</small>${ART.ic(D.MODE[x].icon)}<b>${D.MODE[x].name}</b></div>`).join('')}</div></div>`;
    } else if (f.kind === 'advent') {
      const day = festDayIdx(id, 10), d0 = new Date(inf.start).getDate();
      panel = `<div class="evPanel"><div class="epK">A GIFT EVERY DAY</div><div class="advent">${Array.from({ length: 11 }, (_, i) => `<button class="adv ${e.advent.includes(i) ? 'got' : ''} ${i === day && !e.advent.includes(i) ? 'now' : ''} ${i > day ? 'locked' : ''}" data-act="${i === day && !e.advent.includes(i) && live ? 'ev:advent:' + i : 'none'}"><small>${d0 + i}</small>${ART.ic(e.advent.includes(i) ? 'check' : 'gift')}</button>`).join('')}</div></div>`;
    }
    const skinRow = `<div class="festSkin">${'<div class="miniBoard">' + sk.colors.map((c, i) => `<span class="tile" style="--c:${c}"><span class="tFace">${ART.tileIc(sk.icons[i])}</span></span>`).join('') + '</div>'}<div><b>${sk.name} skin</b><small>${own ? 'Unlocked!' : 'Limited: only during ' + f.fest}</small></div>${own ? (st().skin === f.skin ? `<span class="eqTag">${ART.ic('check')}</span>` : `<button class="btn sm ghost" data-equip="skin:${f.skin}">Equip</button>`) : ART.ic('lock')}</div>`;
    const scene = EVS.FEST_SCENE[id] || 'arena';
    const shown = Math.min(val, goal * 2);
    const play = live ? goBtn('f_' + id, tries, `PLAY ${f.name.toUpperCase()}`, 'festGo:' + id) : `<div class="evPlay"><button class="btn big off">${Date.now() > inf.end ? 'Festival ended · back next year' : 'Starts in ' + UI.left(inf.start)}</button></div>`;
    screen({ m, rulesId: id, chips: [chip('clock', live ? `${UI.left(inf.end)} left` : Date.now() > inf.end ? 'Ended' : `Starts in ${UI.left(inf.start)}`), chip('gift', `${rwTxt({ coins: f.reward.coins, gems: f.reward.gems })} + skin`, 'hot')],
      hero: { key: scene, icon: f.icon, c1: f.theme[0], c2: f.theme[1], lit: Math.round(Math.min(1, val / goal) * 9), taunt: e.won ? `Fine. Happy ${f.fest}. You won.` : pick([`Happy ${f.fest}! Now lose.`, `${f.fest} gift? Earn it.`, 'This skin is mine. Come take it.']), tmood: e.won ? 'shock' : 'smug', extra: ['fireworks'].includes(scene) ? '' : `<div class="escStat"><b>${shown}/${goal}</b><small>${festNoun(f)}${metric === 'count' ? ' · adds up' : ' · best run'}</small></div>`, big: `${shown}/${goal}`, sub: festNoun(f) },
      panel: panel + `<div class="evPanel">${skinRow}<div class="epStats"><div><b>${e.won ? 'WON' : '—'}</b><small>Status</small></div><div><b>${shown}</b><small>${metric === 'count' ? 'Collected' : 'Best run'}</small></div><div><b>${goal}</b><small>Goal</small></div></div></div>`,
      energy: live ? energy(tries, 3) : '', play, road: road('FESTIVAL ROAD', metric === 'count' ? 'adds up all festival' : 'best run', nodes), extra: rulesList(f.rules) });
  }
  function festGo(id) {
    const f = D.FESTS.find(x => x.id === id), e = FS(id);
    if (festTries(id) <= 0) return UI.toast('No energy left today', 'clock');
    if (!NET.gate()) return;
    e.att++; S.save(); S.quest('event');
    let n = 0;
    const night = festDayIdx(id, 8);
    const ev = { id: 'f_' + id, fid: id, name: f.name.toUpperCase(), icon: f.icon, title: f.fest, hearts: 3, noRevive: true, boss: false, startLevel: 1, skin: f.skin, theme: f.theme, pureMode: !!f.pureMode,
      ladder: ['speed', 'tri', 'marathon', 'collect', 'spooky'].includes(f.kind) ? false : undefined };
    const mode = f.kind === 'nights' ? f.nights[night] : f.mode;
    if (f.kind === 'kite' || f.kind === 'steps') { ev.rounds = f.goal; ev.onStep = () => { n++; G.info(n >= f.goal ? `Last one! ${festNoun(f)}` : `${n}/${f.goal} ${festNoun(f)}`); return n >= f.goal ? 'win' : null; }; if (f.kind === 'kite') ev.onWrong = () => G.info('Your kite got cut!'); }
    if (f.kind === 'tri') { ev.levels = f.goal; ev.speedAt = lv => Math.pow(0.92, lv - 1); ev.onLevel = R => R.levelsDone >= f.goal ? 'win' : null; }
    if (f.kind === 'twin' || f.kind === 'duo') { ev.gridMix = false; ev.onStep = R => { n += R.seq.length; G.info(`${Math.min(n, f.goal)}/${f.goal} pairs`); return n >= f.goal ? 'win' : null; }; }
    if (f.kind === 'ghost' || f.kind === 'advent' || f.kind === 'nights') { ev.rounds = f.goal; ev.onStep = () => { n++; return n >= f.goal ? 'win' : null; }; }
    if (f.kind === 'holi') { ev.rounds = f.goal; ev.beforeShow = (R, paint) => paint(true); ev.onStep = () => { n++; G.info('Colors swapped!'); return n >= f.goal ? 'win' : null; }; }
    if (f.kind === 'marathon') { ev.levels = f.goal; ev.noRevive = false; ev.maxAdRevive = 1; ev.onLevel = R => { if (R.levelsDone % 5 === 0) { S.grant({ coins: 150 }); G.info(`${R.levelsDone} levels! +150`); } return R.levelsDone >= f.goal ? 'win' : null; }; }
    if (f.kind === 'collect') { ev.noRevive = false; ev.onLevel = () => { const k = 1 + Math.floor(Math.random() * 3); e.count = Math.min(f.goal * 2, e.count + k); n += k; S.save(); G.info(`+${k} ${festNoun(f)}!`); }; }
    if (f.kind === 'diya') { ev.noRevive = false; ev.onStep = () => { e.count = Math.min(f.goal * 2, e.count + 1); n++; S.save(); }; }
    if (f.kind === 'spooky') { ev.levels = f.goal; ev.modeAt = lv => lv % 2 ? 'ghost' : 'chaos'; ev.onLevel = R => R.levelsDone >= f.goal ? 'win' : null; }
    if (f.kind === 'speed') { ev.gridMix = false; ev.timer = f.secs; ev.timerRunsAlways = true; ev.timePenalty = true; ev.timeWin = true; ev.hearts = 0; }
    ev.onEnd = r => {
      let won = r.won;
      if (f.kind === 'speed') won = r.steps >= f.goal;
      if (f.kind === 'collect' || f.kind === 'diya') won = false;
      const metric = festMetric(f);
      const v = metric === 'steps' ? r.steps : metric === 'levels' ? r.levels : metric === 'pairs' ? Math.min(n, f.goal) : n || r.steps;
      if (metric !== 'count') e.best = Math.max(e.best || 0, won ? f.goal : v);
      let g = {};
      if (won) {
        if (f.kind === 'nights') { if (!e.nights.includes(night)) e.nights.push(night); if (e.nights.length >= 9 && !e.won) { e.won = true; g = { ...f.reward }; delete g.chest; S.grant({ skin: f.skin }); g.skin = f.skin; } else g = { coins: 300 }; }
        else if (!e.won) { e.won = true; g = { coins: f.reward.coins, gems: f.reward.gems, skin: f.skin }; S.grant({ skin: f.skin }); }
        else g = { coins: Math.round(f.reward.coins * 0.2) };
        S.grant({ coins: g.coins, gems: g.gems });
        if (g.skin) S.st.stats.festWins = (S.st.stats.festWins || 0) + 1;
      }
      S.save();
      const big = metric === 'count' ? `+${n}` : f.kind === 'speed' ? r.steps : metric === 'pairs' || f.kind === 'kite' || f.kind === 'steps' ? `${Math.min(n, f.goal)}/${f.goal}` : metric === 'levels' ? r.levels : r.tiles;
      const sub = metric === 'count' ? `${festNoun(f)} · total ${e.count}` : f.kind === 'kite' || f.kind === 'steps' ? festNoun(f) : metric === 'pairs' ? 'pairs' : metric === 'levels' ? 'levels' : f.kind === 'speed' ? 'steps' : 'tiles';
      result({ won: won || metric === 'count', soft: !g.skin, mood: won ? 'shock' : 'laugh', title: won ? (g.skin ? `${D.skin(f.skin).name.toUpperCase()} SKIN UNLOCKED!` : 'FESTIVAL WIN!') : metric === 'count' ? 'NICE RUN' : 'SO CLOSE', big, sub, line: f.tag, g, id: 'f_' + id, fest: id });
      if (g.skin) FX.win('fireworks');
    };
    evStart({ mode, ev });
  }

  /* ---------- result modal (+ post-run nudge) ---------- */
  function result(o) {
    SND[o.won ? 'win' : 'lose']();
    if (o.won && !o.soft) S.st.stats.evWins = (S.st.stats.evWins || 0) + 1;
    S.save();
    UI.show('event');
    const g = o.g && (o.g.coins || o.g.gems || o.g.skin) ? `<div class="rwItems">${UI.rwItems(o.g)}${o.refund ? '<div class="rwI"><small>insurance refund</small></div>' : ''}</div>` : '';
    const isSeason = META[o.id];
    const next = liveIds().filter(id => id !== o.id && status(id).left > 0)[0];
    const sv = isSeason ? status(o.id) : null;
    const nudge = sv && sv.left > 0 ? `<div class="nudge">${ART.ic('fire')} ${sv.left} energy left · go again!</div>` : next ? `<button class="nudge" data-act="ev:goto:${next}">${ART.ic(META[next].icon)} Next: <b>${META[next].name}</b> ${ART.ic('next')}</button>` : '';
    UI.modal(`<div class="evRes"><div class="rwRays"></div><div class="erFace">${ART.sanx(o.mood)}</div><div class="mdK">${o.title}</div><div class="erBig"><span id="erN">${o.big}</span><small>${o.sub}</small></div><div class="mdS">${o.line}</div>${g}${nudge}
      <button class="btn big" data-act="ev:back">CONTINUE</button>${UI.clipBtn(G.last)}<button class="btn ghost" data-act="ev:share">${ART.ic('share')} Share</button></div>`, 'evResM');
    if (o.g && o.g.coins) setTimeout(() => FX.flyCoins(document.querySelector('.evRes .rwI')), 400);
    lastEv = o;
  }
  let lastEv = null;

  /* ---------- claims (in place, no re-render) ---------- */
  function claim(key) {
    const [ev, i, j] = key.split(':'); let r = null, label = 'Chest';
    if (ev === 'btc') { const e = btc(), c = champ(); if (i !== 'throne' && e.claimed.includes(+i)) return; if (i === 'throne') { if (e.best < c.score) return; r = { coins: bounty(), shields: 2 }; e.lvl = (e.lvl || 0) + 1; e.tiles += D.BTC.ladderStep; e.best = 0; e.throne = false; S.grant(r); S.save(); UI.toast(`Champion ${D.ROMAN[e.lvl + 1]} has arrived!`, 'crown'); return openChamp(); } const w = D.BTC.rewards[+i]; if (e.best < c.score * w.pct) return; r = { coins: w.coins }; e.claimed.push(+i); label = w.label; }
    if (ev === 'oma') { const e = oma(); if (e.claimed.includes(+i) || e.beaten < +i || !e.att) return; r = OMA_RW[+i]; e.claimed.push(+i); label = OMA_RANKS[+i]; }
    if (ev === 'bco') { const e = bco(), t = D.BCOINS.tiers[+i]; if (e.claimed.includes(+i) || e.best < t.at) return; r = { coins: t.reward }; e.claimed.push(+i); label = t.name + ' tier'; }
    if (ev === 'tour') { const e = tour(), s = D.TOUR.stages[+i]; if (e.claimed.includes(+i) || (e.best[s.id] || 0) < s.goal) return; r = { coins: D.TOUR.rewards[+i + 1] }; e.claimed.push(+i); label = CITIES[+i]; }
    if (ev === 'mania') { const e = mania(), x = D.MANIA.milestones[+i]; if (e.claimed.includes(+i) || e.best < x.s) return; r = x; e.claimed.push(+i); label = 'Milestone'; }
    if (ev === 'p') { const e = PE(i), ms = poolMs(i), k = +j; if (e.claimed.includes(k) || poolVal(i) < ms[k]) return; r = poolRw(i)[k]; e.claimed.push(k); label = META[i].name; if (POOL[i].king && k === 4) UI.toast('You are the KING OF THE HILL!', 'crown'); }
    if (ev === 'ar') { const e = AR(i), w = D.ARENA_RW[+j]; if (e.claimed.includes(+j) || e.best < w.t) return; e.claimed.push(+j); r = { coins: w.coins, gems: w.gems }; label = 'Arena'; }
    if (ev === 'fest') { const f = D.FESTS.find(x => x.id === i), e = FS(i), k = +j, ms = f.kind === 'diya' ? [25, 50, 75, 100] : [11, 21, 51]; if (e.claimed.includes(k) || e.count < ms[k]) return; e.claimed.push(k); r = ms[k] === f.goal ? { coins: f.reward.coins, gems: f.reward.gems, skin: f.skin } : { coins: Math.round(f.reward.coins * (k + 1) / (ms.length * 2)) }; if (r.skin && !e.won) { e.won = true; S.st.stats.festWins = (S.st.stats.festWins || 0) + 1; } label = f.name; }
    if (ev === 'fm') { const f = D.FESTS.find(x => x.id === i), e = FS(i), k = +j, t = Math.max(1, Math.round(f.goal * [0.25, 0.5, 0.75][k])); if (e.fm.includes(k) || (e.best || 0) < t) return; e.fm.push(k); r = { coins: [100, 200, 400][k] }; label = f.name; }
    if (r) paid(r, label);
  }
  async function extra(id) {
    if (bonus(id) >= D.ADCAP.extraTry) return UI.toast('Extra energy used today', 'clock');
    if (!(await ADS.rewarded('extraTry'))) return;
    addBonus(id); UI.toast('+1 energy!', 'check');
    if (id.startsWith('f_')) openFest(id.slice(2)); else if (id.startsWith('ar_')) openArena(id.slice(3)); else open(id);
  }
  function advent(i) {
    const id = 'xmas', e = FS(id); if (e.advent.includes(+i)) return;
    e.advent.push(+i); S.save();
    const n = +i, r = n === 10 ? { coins: 1000, gems: 10 } : n % 3 === 2 ? { gems: 3 } : { coins: 150 + n * 30 };
    const el = lastTapEl && lastTapEl.closest ? lastTapEl.closest('.adv') : null; S.grant(r); SND.coin();
    if (el) { el.classList.remove('now'); el.classList.add('got'); const sv = el.querySelector('svg'); if (sv) sv.outerHTML = ART.ic('check'); el.dataset.act = 'none'; if (r.coins) FX.flyCoins(el, $('evCoins')); }
    UI.toast(`Gift ${n + 1} of 11: ${r.coins ? '+' + r.coins + ' coins' : '+' + r.gems + ' diamonds'}`, 'gift');
    setTimeout(() => { const b = $('evCoins'); if (b) b.querySelector('b').textContent = UI.short(st().coins); }, 720);
  }

  /* ---------- rules for season events (shown by the (i) button) ---------- */
  function rules(id) {
    if (POOL[id]) return { name: META[id].name, list: POOL[id].rules };
    if (id && id.startsWith('arena_')) { const a = D.ARENA.find(x => x.id === id.slice(6)); return a ? { name: a.name, list: a.rules } : null; }
    return null;
  }

  /* ---------- action router ---------- */
  function act(a) {
    const [k, v] = a.split(':');
    switch (k) {
      case 'btsTier': btsTier = +v; openBTS(); break;
      case 'btsIns': btsIns = !btsIns; openBTS(); break;
      case 'btsGo': btsGo(); break;
      case 'champGo': champGo(); break;
      case 'omaGo': omaGo(); break;
      case 'bcoGo': bcoGo(); break;
      case 'tourStage': if (!tourOpen(+v)) { UI.toast('Clear the city before, or wait for its day', 'lock'); break; } tourStage = +v; openTour(); break;
      case 'tourMode': tourMode = v; openTour(); break;
      case 'tourGo': tourGo(); break;
      case 'maniaMode': maniaMode = v; openMania(); break;
      case 'maniaGo': maniaGo(); break;
      case 'poolGo': poolGo(v); break;
      case 'claim': claim(a.split(':').slice(1).join(':')); break;
      case 'extra': extra(a.split(':').slice(1).join(':')); break;
      case 'fest': openFest(v); break;
      case 'festGo': festGo(v); break;
      case 'advent': advent(v); break;
      case 'arena': openArena(v); break;
      case 'arenaGo': arenaGo(v); break;
      case 'goto': UI.closeModal(); open(v); break;
      case 'back': UI.closeModal(); ADS.inter('run').then(() => open(curEv)); break;
      case 'share': if (lastEv) SH.send('result', { k: lastEv.title, mood: lastEv.mood, big: String(lastEv.big).replace(/<[^>]+>/g, ''), sub: lastEv.sub, line: 'Beat that in Beat Sanx!' }, `🔥 ${lastEv.title}: ${String(lastEv.big).replace(/<[^>]+>/g, '')} ${lastEv.sub} on Beat Sanx! Can you beat it?`); break;
    }
  }
  calApply();
  const LIST = Object.keys(META).map(id => ({ id, ...META[id] }));
  return { renderHub, open, act, daily, badgeCount, LIST, fest, festLive, heroInfo, openHero, dayPopup, openFest, rules, liveIds, featured, weekNo, twist, META, POOL };
})();

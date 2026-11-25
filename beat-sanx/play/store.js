/* ================= BEAT SANX — save data + economy ================= */
'use strict';
const S = (() => {
  const KEY = 'beatsanx_v1';
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  const weekKey = (d = new Date()) => { const t = new Date(d); t.setHours(0, 0, 0, 0); t.setDate(t.getDate() - ((t.getDay() + 6) % 7)); return 'w' + dayKey(t); };
  const monthKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}`;
  const fresh = () => ({
    v: 1, name: 'Player', coins: 300, gems: 5, shields: 1, xp: 0,
    modeLv: {}, bestLv: {}, skin: 'classic', skins: ['classic'],
    boosters: { slow: 1, heart: 1, double: 0, shield: 0, hint: 1 },
    prestige: 0,
    stats: { levelsTotal: 0, bosses: 0, bestCombo: 0, modesCleared: [], dailies: 0, quests: 0, btsWins: 0, runs: 0, bestRun: 0, taps: 0, correct: 0, earned: 0, played: 0 },
    ach: {},
    login: { last: '', streak: 0, day: 0, pending: false },
    quests: { day: '', list: [], bonus: false, modes: [] },
    daily: { day: '', done: false },
    spin: { day: '', free: 1, ads: 0 },
    noAds: false,
    ads: { clears: 0, lastInter: 0, runs: 0 },
    ev: {}, lb: { wk: '', claimed: false }, rival: { wk: '', beaten: false },
    set: { sfx: true, music: true, vib: true, bg: true },
    seenTut: false, created: Date.now(),
    pid: '', cos: {}, own: {}, trials: {}, trialDay: { d: '', n: 0 }, badges: [], collect: [],
    imp: { best: 0, day: '', entries: 0, gemDay: {}, wins: 0 },
    chal: { sent: [], played: [], log: [] },
    pass: { wk: '', pts: 0, got: [], gold: false, goldAds: 0, got2: [], mis: [] },
    cstars: {}, skill: [],
    avatar: '', avOwned: ['ace', 'nova'], mem: { best: 0, hist: [] }, dbeat: { day: '', no: 0, done: false, score: 0, win: false, practice: 0, streak: 0, last: 0, best: 0 }, unlockSeen: [], v14: false,
    lastSeen: 0, fest: {}, cap: { d: '', c: {} }, shareDay: '', lucky: 0
  });
  let st;
  try { st = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { st = fresh(); }
  st.stats = Object.assign(fresh().stats, st.stats); st.set = Object.assign(fresh().set, st.set);
  st.boosters = Object.assign(fresh().boosters, st.boosters);
  for (const k of ['cos', 'own', 'trials', 'fest']) st[k] = st[k] || {};
  st.imp = Object.assign(fresh().imp, st.imp); st.chal = Object.assign(fresh().chal, st.chal); st.pass = Object.assign(fresh().pass, st.pass);
  st.badges = st.badges || []; st.collect = st.collect || [];
  st.avOwned = st.avOwned || ['ace', 'nova']; for (const a of D.AVATARS) if (a.unlock && a.unlock.free && !st.avOwned.includes(a.id)) st.avOwned.push(a.id); st.mem = Object.assign(fresh().mem, st.mem); st.dbeat = Object.assign(fresh().dbeat, st.dbeat); st.unlockSeen = st.unlockSeen || [];
  st.bg = Object.assign({ own: ['glow', 'aurora', 'spot'], on: 'glow', trial: null, tday: { d: '', n: 0 } }, st.bg || {}); st.starChests = st.starChests || []; st.modeSeen = st.modeSeen || {}; st.twistFree = st.twistFree || {};
  /* v1.4 migration: retired boosters become coins; old players keep every feature unlocked */
  if (!st.v14) {
    let refund = 0;
    st.coins += refund; st.v14refund = refund;
    st.unlockSeen = Object.keys(D.UNLOCK).filter(k => Math.max(1, ...Object.values(st.bestLv || {}), ...Object.values(st.modeLv || {})) >= D.UNLOCK[k].lv);
    st.mem.best = Math.max(st.mem.best, ...(st.skill || [0]), (st.pass && st.pass.bestTiles) || 0, (st.imp && st.imp.best) || 0);
    st.v14 = true;
  }
  if (!st.pid) { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let id = ''; for (let i = 0; i < 6; i++) id += A[Math.floor(Math.random() * A.length)]; st.pid = id; }
  let saveT = 0;
  const save = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }, 60); };
  const saveNow = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } };

  const listeners = [];
  const emit = () => listeners.forEach(f => { try { f(); } catch (e) { } });

  const api = {
    get st() { return st; }, dayKey, weekKey, monthKey, save, saveNow,
    on(f) { listeners.push(f); },
    mult() { return D.prestigeMult(st.prestige); },
    add(kind, n) {
      if (!n) return;
      if (kind === 'coins') { st.coins = Math.max(0, Math.round(st.coins + n)); if (n > 0) api.quest('earn', n, true); }
      else if (kind === 'gems') st.gems = Math.max(0, st.gems + n);
      else if (kind === 'shields') st.shields = Math.max(0, st.shields + n);
      else if (kind === 'xp') st.xp += Math.round(n);
      save(); emit(); api.checkAch();
    },
    spend(kind, n) { if (st[kind] < n) return false; st[kind] -= n; save(); emit(); return true; },
    grant(r) { // r: {coins, gems, shields, xp, boost, chest, skin}
      if (r.coins) api.add('coins', r.coins); if (r.gems) api.add('gems', r.gems);
      if (r.shields) api.add('shields', r.shields); if (r.xp) api.add('xp', r.xp);
      if (r.boost && !D.BOOST_ACTIVE.includes(r.boost)) { api.add('coins', Math.round((D.BOOST[r.boost] ? D.BOOST[r.boost].coins : 400) * 0.8)); }
      else if (r.boost) { st.boosters[r.boost] = Math.min(9, (st.boosters[r.boost] || 0) + 1); save(); emit(); }
      if (r.skin && !st.skins.includes(r.skin)) { st.skins.push(r.skin); save(); emit(); }
    },
    lv(mode) { return st.modeLv[mode] || 1; },
    best() { return Math.max(1, ...Object.values(st.bestLv), ...Object.values(st.modeLv)); },
    unlocked(mode) { return mode === 'zen' || api.best() >= D.MODE[mode].unlock; },
    /* v1.4 features that open with progress (classic level) */
    boostOpen(id) { return api.best() >= (D.BOOST_LV[id] || 1); },
    feat(id) { const u = D.UNLOCK[id]; return !u || api.best() >= u.lv || st.unlockSeen.includes(id); },
    /* newly reached unlocks that were not announced yet */
    newUnlocks() { const out = Object.keys(D.UNLOCK).filter(k => api.best() >= D.UNLOCK[k].lv && !st.unlockSeen.includes(k)); if (out.length) { st.unlockSeen.push(...out); save(); } return out; },
    avatarImg() { const a = st.avatar && D.AV[st.avatar]; return a ? `img/av/${a.id}.webp` : null; },
    /* v1.7 avatar unlocks: what each collection avatar needs and how far the player is */
    avReq(a) {
      const u = a.unlock || {}, s = st.stats;
      const stars = Object.values(st.cstars || {}).reduce((x, r) => x + ((r && r.s) || 0), 0);
      const streak = Math.max(s.bestStreak || 0, st.login.streak || 0);
      const R = (cur, need, txt) => ({ ok: cur >= need, cur: Math.min(cur, need), need, txt });
      if (u.free) return R(1, 1, 'Free');
      if (u.lv) return R(api.best(), u.lv, `Reach level ${u.lv}`);
      if (u.evWins) return R(s.evWins || 0, u.evWins, `Win ${u.evWins} events`);
      if (u.festWins) return R(s.festWins || 0, u.festWins, 'Win a festival event');
      if (u.stars) return R(stars, u.stars, `Earn ${u.stars} Challenge stars`);
      if (u.streak) return R(streak, u.streak, `${u.streak}-day login streak`);
      if (u.ads) return R(st.adsTotal || 0, u.ads, `Watch ${u.ads} reward ads`);
      if (u.mem) return R(st.mem.best || 0, u.mem, `Memory Score ${u.mem}+`);
      return R(0, 1, 'Locked');
    },
    avCheck() {
      const got = [];
      for (const a of D.AVATARS) if (a.set === 'collection' && !st.avOwned.includes(a.id) && api.avReq(a).ok) { st.avOwned.push(a.id); got.push(a); }
      if (got.length) { st.avNew = (st.avNew || []).concat(got.map(a => a.id)); save(); }
      return got;
    },
    /* Memory Score */
    memBest() { return st.mem.best || 0; },
    memAdd(n, src) { if (!n) return false; st.mem.hist = (st.mem.hist || []).concat([{ n, src, t: Date.now() }]).slice(-30); const rec = n > st.mem.best; if (rec) st.mem.best = n; save(); emit(); return rec; },
    dbeatToday() { const no = D.dbeatNo(); const d = st.dbeat; if (d.no !== no) { Object.assign(d, { day: dayKey(), no, done: false, score: 0, win: false, practice: 0 }); if ((d.last || 0) < no - 1) { d.lost = d.streak >= 2 && d.last === no - 2 ? d.streak : 0; d.streak = 0; } save(); } return d; },
    /* rewarded ad: missed exactly one day -> keep the streak */
    dbeatSave() { const d = api.dbeatToday(); if (!d.lost) return false; d.streak = d.lost; d.last = d.no - 1; d.lost = 0; save(); emit(); return true; },
    dbeatDone(score, win) { const d = api.dbeatToday(); if (d.done) return d; d.done = true; d.score = score; d.win = win; d.streak = d.last === d.no - 1 ? d.streak + 1 : 1; d.last = d.no; d.lost = 0; d.best = Math.max(d.best || 0, score); save(); emit(); return d; },

    /* ---------- daily rollover ---------- */
    rollover() {
      const today = dayKey();
      if (st.login.last !== today) {
        const y = new Date(); y.setDate(y.getDate() - 1);
        const kept = st.login.last === dayKey(y);
        st.login.lost = !kept && st.login.last && st.login.streak >= 2 ? st.login.streak : 0;
        st.login.streak = kept ? st.login.streak + 1 : 1; st.stats.bestStreak = Math.max(st.stats.bestStreak || 0, st.login.streak);
        st.login.day = (st.login.day % 7) + 1; if (st.login.streak === 1) st.login.day = 1;
        st.login.last = today; st.login.pending = true;
      }
      if (st.quests.day !== today) {
        const seed = +today.replace(/\D/g, '');
        const pool = [...D.QUESTS]; const pick = [];
        let s = seed; const rnd = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
        while (pick.length < 3 && pool.length) pick.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0].id);
        st.quests = { day: today, list: pick.map(id => ({ id, p: 0, done: false, claimed: false })), bonus: false, modes: [] };
      }
      if (st.spin.day !== today) st.spin = { day: today, free: 1, ads: 0 };
      if (st.daily.day !== today) st.daily = { day: today, done: false };
      save();
    },

    /* ---------- quests ---------- */
    quest(kind, val = 1, add = true) {
      let changed = false;
      for (const q of st.quests.list) {
        const def = D.QUESTS.find(x => x.id === q.id); if (!def || q.done) continue;
        if (def.k !== kind) continue;
        q.p = add ? q.p + val : Math.max(q.p, val);
        if (q.p >= def.n) { q.p = def.n; q.done = true; if ((typeof UI !== 'undefined')) UI.toast(`Quest done: ${def.t}`, 'check'); }
        changed = true;
      }
      if (changed) { save(); emit(); }
    },
    questMode(mode) {
      if (!st.quests.modes.includes(mode)) { st.quests.modes.push(mode); api.quest('modes', st.quests.modes.length, false); }
    },
    claimQuest(id) {
      const q = st.quests.list.find(x => x.id === id); const def = D.QUESTS.find(x => x.id === id);
      if (!q || !q.done || q.claimed) return 0; q.claimed = true; st.stats.quests++;
      api.add('coins', def.coins); save(); return def.coins;
    },

    /* ---------- achievements ---------- */
    achVal(k) {
      const s = st.stats;
      return { levelsTotal: s.levelsTotal, bestLevel: api.best(), bosses: s.bosses, bestCombo: s.bestCombo, modesCleared: s.modesCleared.length, streak: st.login.streak, dailies: s.dailies, quests: s.quests, btsWins: s.btsWins, skins: st.skins.length, prestige: st.prestige, coins: st.coins }[k] || 0;
    },
    checkAch() {
      for (const a of D.ACH) {
        if (st.ach[a.id]) continue;
        if (api.achVal(a.k) >= a.n) {
          st.ach[a.id] = Date.now(); st.coins += a.c; save();
          if ((typeof UI !== 'undefined')) setTimeout(() => UI.achToast(a), 400);
        }
      }
    },
    /* ---------- player id ---------- */
    pid() { return 'BS-' + st.pid; },
    /* ---------- cosmetics: own / equip / 30-min ad trials ---------- */
    owns(cat, id) { if (cat === 'skin') return st.skins.includes(id); const d = D.COS[cat] && D.COS[cat][0]; return (d && d.id === id) || (st.own[cat] || []).includes(id); },
    giveCos(cat, id) { if (cat === 'skin') { if (!st.skins.includes(id)) st.skins.push(id); } else { st.own[cat] = st.own[cat] || []; if (!st.own[cat].includes(id)) st.own[cat].push(id); } save(); emit(); },
    trial(cat) { const t = st.trials[cat]; return t && t.until > Date.now() ? t : null; },
    active(cat) { const t = api.trial(cat); if (t) return t.id; if (cat === 'skin') return st.skin; return st.cos[cat] || D.COS_TABS.find(x => x.id === cat).def; },
    trialsLeft() { const d = dayKey(); if (st.trialDay.d !== d) st.trialDay = { d, n: 0 }; return D.TRIAL_MAX_DAY - st.trialDay.n; },
    startTrial(cat, id) { if (api.trialsLeft() <= 0) return false; st.trialDay.n++; st.trials[cat] = { id, until: Date.now() + D.TRIAL_MIN * 6e4 }; save(); emit(); return true; },
    expiredTrials() { const out = []; for (const [cat, t] of Object.entries(st.trials)) if (t && t.until <= Date.now() && !t.told) out.push({ cat, ...t }); return out; },
    /* ---------- daily caps for rewarded-ad placements ---------- */
    cap(key, max) { const d = dayKey(); if (st.cap.d !== d) st.cap = { d, c: {} }; return Math.max(0, max - (st.cap.c[key] || 0)); },
    useCap(key) { const d = dayKey(); if (st.cap.d !== d) st.cap = { d, c: {} }; st.cap.c[key] = (st.cap.c[key] || 0) + 1; save(); },
    /* ---------- Sanx Pass ---------- */
    passTouch() { const wk = 'S' + Math.floor((Date.now() + 3 * 864e5) / (14 * 864e5)); if (st.pass.wk !== wk) st.pass = { wk, pts: 0, got: [], gold: false, goldAds: 0, got2: [], mis: [], base: { levelsTotal: st.stats.levelsTotal || 0, chalWins: st.stats.chalWins || 0, bosses: st.stats.bosses || 0, evRuns: st.stats.evRuns || 0 }, bestTiles: 0 }; st.pass.got2 = st.pass.got2 || []; st.pass.mis = st.pass.mis || []; return st.pass; },
    passEnd() { const n = Math.floor((Date.now() + 3 * 864e5) / (14 * 864e5)) + 1; return n * 14 * 864e5 - 3 * 864e5; },
    passAdd(kind, mult = 1) { const p = api.passTouch(); const v = (D.PASS.pts[kind] || 0) * mult; p.pts = Math.min(D.PASS.tiers * D.PASS.per, p.pts + v); save(); emit(); return v; },
    passTier() { return Math.floor(api.passTouch().pts / D.PASS.per); },
    reset() { st = fresh(); saveNow(); location.reload(); }
  };
  return api;
})();

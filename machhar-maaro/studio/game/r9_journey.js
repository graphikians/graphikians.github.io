/* ================= MACHHAR MAARO · ROUND 9 · ONE JOURNEY PER CHARACTER =================
   Every character has their own level, stars and best scores (300 levels each).
   Switching character loads that character's journey. The whole game is done only when
   every character finishes. Hospital and death only block that character.
   New characters start at Level 1 but a little harder than the first one.
   Love characters pay 1.5X coins and keep inviting the player back.
========================================================================================= */
R9.jr = () => { const s = R9.sv(); s.jr = s.jr || {}; return s.jr; };
(function migrate() {
  const s = R9.sv();
  if (!s.jrA) { const id = SAVE.curChar && CHARS[SAVE.curChar] ? SAVE.curChar : 'papa'; s.jrA = id; s.jrFirst = id; R9.jr()[id] = { u: SAVE.unlocked || 1, s: SAVE.stars || {}, b: SAVE.bests || {} }; }
  if (!SAVE.curChar || !CHARS[SAVE.curChar]) SAVE.curChar = s.jrA;
  if (SAVE.curChar !== s.jrA) SAVE.curChar = s.jrA;
  save();
})();
R9.first = () => R9.sv().jrFirst || 'papa';
R9.lvOf = id => id === R9.sv().jrA ? (SAVE.unlocked || 1) : ((R9.jr()[id] || {}).u || 1);
R9.starsOf = id => { const st = id === R9.sv().jrA ? SAVE.stars : ((R9.jr()[id] || {}).s || {}); return Object.values(st).reduce((a, b) => a + (b || 0), 0); };
R9.maxLv = () => { let m = SAVE.unlocked || 1; const j = R9.jr(); for (const k in j) m = Math.max(m, j[k].u || 1); return m; };
R9.switchTo = function (id) {
  const s = R9.sv(); if (!id || !CHARS[id] || id === s.jrA) return;
  R9.jr()[s.jrA] = { u: SAVE.unlocked || 1, s: SAVE.stars || {}, b: SAVE.bests || {} };
  const n = R9.jr()[id] || { u: 1, s: {}, b: {} };
  SAVE.unlocked = n.u; SAVE.stars = n.s; SAVE.bests = n.b; s.jrA = id; save();
};
/* SAVE.curChar becomes the journey switch (null = keep the current one) */
(function () {
  let cc = SAVE.curChar;
  Object.defineProperty(SAVE, 'curChar', { configurable: true, enumerable: true, get: () => cc, set: v => { if (!v || !CHARS[v]) return; R9.switchTo(v); cc = v; } });
})();
/* the playing character is always the chosen one */
RISHTE.cid = function () { if (typeof CL !== 'undefined' && CL && CL.r9char) return CL.r9char; return SAVE.curChar || 'papa'; };

/* hospital / death only block that character */
R9.patient = () => { const id = SAVE.curChar, h = R9.sv().hosp[id]; return h && h.v2 ? id : null; };
R9.anyPatient = () => { const h = R9.sv().hosp; return Object.keys(h).find(k => h[k] && h[k].v2) || null; };
(function () {
  const _si = window.showIntro;
  window.showIntro = function (n) {
    const id = SAVE.curChar;
    if (typeof n === 'number' && n <= 300 && R7.status(id) === 'dead') return R7.pickChar(id);
    return _si.apply(this, arguments);
  };
  // event levels: only blocked if that event's character is sick
  const _ep = R9.evPlay; R9.evPlay = function (id) { const def = R9.evDef(id), c = def.char || SAVE.curChar; if (R9.rec(c) && R9.rec(c).v2) return R9.hospScreen(c); if (R7.status(c) === 'dead') { toast(`👻 Bring ${CHARS[c].n} back from Yamlok first`); return R7.pickChar(c); } const pp = R9.patient; R9.patient = () => null; try { return _ep.apply(this, arguments); } finally { R9.patient = pp; } };
  // pick sheet / family cards: show each character's level
  const _cc = R7.charCard; R7.charCard = function (id) { let h = _cc.apply(this, arguments); const lv = R9.lvOf(id), done = Math.min(300, lv - 1); return h.replace(/<\/button>\s*$/, `<i class="r9Lv">Lv ${Math.min(300, lv)}<s style="width:${done / 300 * 100}%"></s></i></button>`); };
})();
/* features unlock from the best journey, not the current one */
(function () {
  R8.shaadiState = function () { if (R9.maxLv() < 6) return 'lock'; try { const s = R7.sh(); if (s.start == null) return 'new'; const d = Math.min(7, R7.shDay()); return R7.shDayDone(d) ? 'done' : 'todo'; } catch (e) { return 'new'; } };
  R9.evUnlocked = def => R9.maxLv() >= (def.id === 'season' ? 3 : 4);
  R8.HINTS.forEach(h => { const w = h.when; h.when = () => { const u = SAVE.unlocked; SAVE.unlocked = R9.maxLv(); try { return w(); } finally { SAVE.unlocked = u; } }; });
  R7.heroOwned = h => h.un === 'free' || SV().heroes[h.id] || (h.un === 'lv' && R9.maxLv() > h.v);
  const _sp = R7.shaadiPanel; R7.shaadiPanel = function () { const u = SAVE.unlocked; SAVE.unlocked = R9.maxLv(); try { return _sp.apply(this, arguments); } finally { SAVE.unlocked = u; } };
})();
/* new characters: Level 1 but a bit harder; love characters: 1.5X coins */
(function () {
  const newChar = () => CL && !CL.ev && !CL.yam && !CL.shaadi && CL.n <= 10 && SAVE.curChar !== R9.first();
  const _sp = window.spawnMosq; window.spawnMosq = function () { const m = _sp.apply(this, arguments); if (m && m.sp && newChar()) m.sp *= 1.08; return m; };
  const _sm = HZ.spawnMul.bind(HZ); HZ.spawnMul = function () { let k = _sm(); if (newChar()) k *= 0.9; return k; };
  const _sw = window.showWin; window.showWin = function () { if (CL && !CL.ev && !CL.yam && !CL.shaadi && CHARS[CW.cid] && CHARS[CW.cid].dil) G.coins = Math.round(G.coins * 1.5); return _sw.apply(this, arguments); };
})();
/* map hero: always the chosen character */
R8.hero = (function () { const base = R8.hero; return function () { return base.apply(this, arguments); }; })();

/* vaccine: instant discharge from any stage */
R9.vac = () => R9.sv().r9.vac || 0;
R9.addVac = n => { const s = R9.sv(); s.r9.vac = (s.r9.vac || 0) + n; save(); };
(function () {
  const _hs = R9.hospScreen;
  R9.hospScreen = function (id) {
    _hs.apply(this, arguments);
    if (!R9.rec(id) || !R9.vac()) return;
    const box = document.querySelector('#metaBody .r9HAds'); if (!box) return;
    const b = document.createElement('button'); b.className = 'r9Vac'; b.innerHTML = `💉 <b>USE VACCINE</b><small>${R9.vac()} left · discharge now, any stage</small>`;
    box.before(b);
    b.onclick = () => { R9.sv().r9.vac--; save(); $('meta').classList.add('hide'); R9.discharge(id, 'vac'); };
  };
})();

/* family page: whole game progress */
(function () {
  const _rm = window.renderMap; window.renderMap = function () {
    _rm.apply(this, arguments);
    if (R8.tab !== 'rishte') return;
    const ids = PUBLIC_IDS.concat(R7.DIL).filter(i => CHARS[i]), tot = ids.length * 300, done = ids.reduce((a, i) => a + Math.min(300, R9.lvOf(i) - 1), 0);
    const pg = document.querySelector('#mapBody .r8Page'); if (!pg) return;
    const d = document.createElement('div'); d.className = 'r9Game'; d.innerHTML = `<b>🏆 WHOLE GAME</b><span class="r7bar"><i style="width:${done / tot * 100}%"></i></span><small>${done} / ${tot} levels · every person has their own 300 nights</small>`;
    pg.appendChild(d);
  };
})();

/* love characters keep calling the player back */
(function () {
  const _l = R9.PM.list.bind(R9.PM);
  R9.PM.list = function () {
    const L = _l(), dil = R7.DIL.filter(i => CHARS[i] && i !== SAVE.curChar && R7.status(i) === 'ok');
    if (dil.length && R9.maxLv() >= 3) {
      const id = dil[R7.today() % dil.length], C = CHARS[id], lv = R9.lvOf(id);
      L.splice(1, 0, { k: 'dil_' + id, h: 4, img: R7.face(id), t: `${C.n} is waiting for you 💞`, s: `Level ${lv} · HARD · 1.5X coins on every win`, b: `💞 PLAY WITH ${C.n.toUpperCase()}`, go: () => { SAVE.curChar = id; renderMap(); showIntro(Math.min(300, R9.lvOf(id))); } });
    }
    return L;
  };
})();

R7.css(`
.r9Lv{position:relative;display:block;margin-top:3px;height:15px;border-radius:8px;background:rgba(10,4,36,.75);font:800 10px/15px Inter;font-style:normal;color:#fff;text-align:center;overflow:hidden;z-index:0}
.r9Lv s{position:absolute;left:0;top:0;bottom:0;background:rgba(127,212,255,.35);z-index:-1}
.r9Game{margin-top:10px;padding:10px 12px;border-radius:16px;background:rgba(127,212,255,.1);border:1px solid rgba(127,212,255,.4);display:flex;flex-direction:column;gap:5px}.r9Game b{font:900 13px Inter}.r9Game small{font:600 11px Inter;opacity:.85}.r9Game .r7bar{height:8px}
.r9Vac{display:flex;flex-direction:column;align-items:center;width:100%;margin-top:10px;padding:10px;border:0;border-radius:16px;color:#fff;background:linear-gradient(180deg,#5fd0ff,#2f7bff);box-shadow:0 4px 0 #163b9a;font-family:Inter}.r9Vac b{font:900 16px Inter}.r9Vac small{font:600 11px Inter;opacity:.9}
`);

/* ================= MACHHAR MAARO STUDIO · ENGINE PRELUDE =================
   Loaded before the real game inside the Studio's hidden engine frame.
   It takes control of time, randomness, input and sound so the REAL game can be
   played frame by frame: same seed = same video, every time, on any device.
     · game time (performance.now, timers, requestAnimationFrame) moves only when the Studio says so
     · Math.random is seeded
     · canvas is always 1080×1920 (540×960 CSS at 2x)
     · sound: muted, live (preview) or offline (frame-exact capture of the game's own sounds)
     · storage is in memory (never touches the player's real save)
=========================================================================== */
(function () {
  const NAT = {
    setTimeout: window.setTimeout.bind(window), clearTimeout: window.clearTimeout.bind(window),
    perf: performance.now.bind(performance), AC: window.AudioContext || window.webkitAudioContext
  };
  const STU = window.STU = { GT: 0, VT: 0, audioMode: 'mute', noRender: false, NAT, events: [] };

  /* ---------- time ---------- */
  performance.now = () => STU.GT;
  const D0 = 1767225600000; Date.now = () => D0 + STU.GT;

  /* ---------- seeded randomness ---------- */
  let sd = 1;
  Math.random = function () { sd = (sd + 0x6D2B79F5) | 0; let t = Math.imul(sd ^ (sd >>> 15), 1 | sd); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  STU.seed = s => { sd = (s >>> 0) || 1; };

  /* ---------- fixed 1080×1920 canvas ---------- */
  Object.defineProperty(window, 'devicePixelRatio', { get: () => 2, configurable: true });

  /* ---------- frames & timers on game time ---------- */
  let rafQ = [], timers = [], tid = 1;
  window.requestAnimationFrame = cb => { rafQ.push(cb); return rafQ.length; };
  window.cancelAnimationFrame = () => { };
  window.setTimeout = (fn, ms, ...a) => { const id = tid++; timers.push({ id, at: STU.GT + Math.max(0, +ms || 0), fn, a }); return id; };
  window.setInterval = (fn, ms, ...a) => { const id = tid++, ev = Math.max(16, +ms || 16); timers.push({ id, at: STU.GT + ev, fn, a, ev }); return id; };
  window.clearTimeout = window.clearInterval = id => { timers = timers.filter(t => t.id !== id); };
  function runTimers() {
    for (let g = 0; g < 400; g++) {
      let due = null, di = -1;
      for (let i = 0; i < timers.length; i++) if (timers[i].at <= STU.GT && (!due || timers[i].at < due.at)) { due = timers[i]; di = i; }
      if (!due) break;
      if (due.ev) { due.at += due.ev; if (due.at <= STU.GT) due.at = STU.GT + due.ev; } else timers.splice(di, 1);
      try { if (typeof due.fn === 'function') due.fn(...due.a); } catch (e) { console.warn('[stu timer]', e); }
    }
  }
  /* advance the game by gdt seconds (speed 1 = real time, 0.3 = slow motion) */
  STU.step = function (gdt, render = true) {
    STU.noRender = !render;
    STU.GT += gdt * 1000;
    runTimers();
    try { botTick(); } catch (e) { console.warn('[stu bot]', e); }
    const q = rafQ; rafQ = [];
    for (const cb of q) { try { cb(STU.GT); } catch (e) { console.warn('[stu raf]', e); } }
    if (STU.floor != null) { try { for (const s of G.sleepers) if (s.neend < STU.floor) s.neend = STU.floor; } catch (e) { } }
    STU.noRender = false;
  };

  /* ---------- no TTS, no vibration, memory storage ---------- */
  try { Object.defineProperty(window, 'speechSynthesis', { value: { speak() { }, cancel() { }, getVoices: () => [], pause() { }, resume() { } }, configurable: true }); } catch (e) { }
  window.SpeechSynthesisUtterance = function () { };
  try { navigator.vibrate = () => false; } catch (e) { }
  const mem = new Map();
  const store = { getItem: k => mem.has(k) ? mem.get(k) : null, setItem: (k, v) => mem.set(k, String(v)), removeItem: k => mem.delete(k), clear: () => mem.clear(), key: i => [...mem.keys()][i] || null, get length() { return mem.size; } };
  try { Object.defineProperty(window, 'localStorage', { value: store, configurable: true }); } catch (e) { }
  /* first launch must not show tutorials */
  for (const k of ['play', 'far', 'rishte', 'shop', 'shaadi', 'boost']) store.setItem('mmHint_' + k, '1');

  /* ---------- sound ---------- */
  let OC = null;
  window.AudioContext = window.webkitAudioContext = function () {
    if (STU.audioMode === 'offline' && OC) return OC;
    return new NAT.AC();
  };
  const pv = Object.getOwnPropertyDescriptor(AudioParam.prototype, 'value');
  Object.defineProperty(AudioParam.prototype, 'value', {
    configurable: true, get() { return pv.get.call(this); },
    set(v) { if (STU.audioMode === 'offline') { try { this.cancelScheduledValues(STU.VT); this.setValueAtTime(v, STU.VT); } catch (e) { } } else pv.set.call(this, v); }
  });
  /* switch the game's sound to a new mode. offline = capture of exactly `secs` seconds */
  STU.audio = function (mode, secs) {
    try { if (AC && AC.close && STU.audioMode === 'live') AC.close(); } catch (e) { }
    try { AC = null; master = null; buzzOsc = null; buzzGain = null; buzzPan = null; } catch (e) { }
    try { AU.rv = null; AU.rvIn = null; } catch (e) { }
    STU.audioMode = mode; OC = null;
    if (mode === 'mute') { try { muted = true; } catch (e) { } return; }
    try { muted = false; } catch (e) { }
    if (mode === 'offline') {
      OC = new OfflineAudioContext(2, Math.ceil(48000 * (secs + 0.5)), 48000);
      Object.defineProperty(OC, 'currentTime', { get: () => STU.VT, configurable: true });
      OC.resume = () => Promise.resolve(); OC.suspend = () => Promise.resolve();
      Object.defineProperty(OC, 'state', { get: () => 'running', configurable: true });
    }
    try { if (window.MUS) MUS.on = false; } catch (e) { }
    try { initAudio(); } catch (e) { console.warn(e); }
    try { if (window.MUS) { MUS.on = false; MUS.stop && MUS.stop(); } } catch (e) { }
  };
  STU.renderAudio = async function () { if (!OC) return null; const b = await OC.startRendering(); OC = null; STU.audioMode = 'mute'; try { AC = null; muted = true; } catch (e) { } return b; };
  STU.liveCtx = () => { try { return STU.audioMode === 'live' ? AC : null; } catch (e) { return null; } };

  /* ---------- input (dispatched to the real game canvas) ---------- */
  const P = (type, x, y, pt) => { try { cv.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, pointerId: 1, bubbles: true, pointerType: pt || 'touch' })); } catch (e) { } };
  STU.ptr = P;

  /* ---------- autopilot (plays like a good human) ---------- */
  const B = STU.bot = { mode: 'idle', react: 200, gap: 110, acc: 0.9, saveAt: 28, tgt: null, due: 0, upAt: 0, gx: 270, gy: 600, glide: 0.22 };
  STU.setBot = o => { Object.assign(B, o); B.tgt = null; B.due = STU.GT + 200; };
  function botTick() {
    if (typeof state === 'undefined' || state !== 'play') return;
    const now = STU.GT;
    if (B.upAt && now >= B.upAt) { P('pointerup', B.gx, B.gy); B.upAt = 0; }
    if (B.mode === 'idle') return;
    let active = true;
    if (B.mode === 'save') active = minNeend() <= B.saveAt || B.saved; if (active && B.mode === 'save') B.saved = 1;
    /* hazards first (glass, alarm, phone...) */
    try {
      const O = HZ.o, on = HZ.on, list = [];
      if (on.glass && O.glass && (O.glass.st === 'wobble' || O.glass.st === 'fall')) list.push(HZ.pos('glass'));
      if (on.alarm && O.alarm && O.alarm.st === 'ring') list.push(HZ.pos('alarm'));
      if (on.phone && O.phone && O.phone.st === 'ring') list.push(HZ.pos('phone'));
      if (on.frame && O.frame && O.frame.st === 'tilt') list.push(HZ.pos('frame'));
      if (on.pankha && O.pankha && O.pankha.st === 'off') list.push(HZ.pos('switch'));
      if (active && list.length && now > B.due) { const p = list[0]; P('pointerdown', p[0], p[1] - 10); B.upAt = now + 60; B.due = now + 260; return; }
    } catch (e) { }
    const live = G.mosq.filter(m => !m.dead && m.x > 4 && m.x < W - 4 && m.y > 50 && m.y < H - 10);
    if (B.tgt && (B.tgt.dead || !live.includes(B.tgt))) B.tgt = null;
    if (!B.tgt && live.length) {
      const s = G.sleepers[0] || { x: W / 2, y: H * 0.7 };
      const bossFirst = live.find(m => m.boss && m.mode !== 'enter');
      live.sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y));
      B.tgt = (bossFirst && Math.random() < 0.6) ? bossFirst : live[0];
      B.due = Math.max(B.due, now + B.react * (0.75 + Math.random() * 0.5));
    }
    /* glide the racket towards the target like a hand */
    const tx = B.tgt ? B.tgt.x : W * 0.5, ty = B.tgt ? B.tgt.y : H * 0.55;
    B.gx += (tx - B.gx) * B.glide; B.gy += (ty - B.gy) * B.glide;
    if (!B.upAt) P('pointermove', B.gx, B.gy, 'mouse');
    if (active && B.tgt && now >= B.due) {
      const m = B.tgt, miss = Math.random() > B.acc, r = miss ? 42 * S : 5 * S, a = Math.random() * 6.28;
      const x = m.x + Math.cos(a) * r, y = m.y + Math.sin(a) * r; B.gx = x; B.gy = y;
      P('pointerdown', x, y); B.upAt = now + 70; B.due = now + B.gap * (0.8 + Math.random() * 0.4);
      if (miss || !m.boss) B.tgt = null;
    }
    /* grab good power-ups sometimes */
    if (active && now > B.due) for (const it of G.items) if (it.kind === 'good' && Math.random() < 0.05) { P('pointerdown', it.x, it.y); B.upAt = now + 60; B.due = now + 200; break; }
  }

  /* ---------- after the game has loaded ---------- */
  STU.boot = async function () {
    /* no render while fast-forwarding */
    const _r = window.render; window.render = function () { if (STU.noRender) return; return _r.apply(this, arguments); };
    try { if (window.R7) Object.defineProperty(R7, 'low', { get: () => false, set() { }, configurable: true }); } catch (e) { }
    try { resize(); } catch (e) { }
    try { if (window.MUS) { MUS.on = false; MUS.start = () => { }; MUS.sched = () => { }; MUS.vol = () => { }; if (MUS.iv) clearInterval(MUS.iv); MUS.iv = null; } } catch (e) { }
    const css = document.createElement('style');
    css.textContent = 'body>*:not(#c){visibility:hidden!important;pointer-events:none!important} #c{position:fixed;left:0;top:0} *{animation-play-state:paused!important}';
    document.head.appendChild(css);
    try { await document.fonts.ready; } catch (e) { }
    STU.audio('mute');
    return true;
  };
  /* wait until every picture the game asked for is decoded (real time) */
  STU.images = function (extra) {
    try { if (extra && window.R7) R7.need(extra); } catch (e) { }
    return new Promise(res => {
      const t0 = NAT.perf();
      const chk = () => {
        let ok = true; try { for (const k in ART.i) { const im = ART.i[k]; if (im && im.tagName === 'IMG' && !im.complete) { ok = false; break; } } } catch (e) { }
        if (ok || NAT.perf() - t0 > 12000) res(ok); else NAT.setTimeout(chk, 60);
      };
      chk();
    });
  };
  /* prepare a fresh save for a shot */
  STU.setup = function (o = {}) {
    STU.seed(o.seed || 1);
    try {
      if (o.char && SAVE.curChar !== o.char) SAVE.curChar = o.char;
      SAVE.unlocked = 300; SAVE.coins = 2400; SAVE.gems = 60;
      const rk = o.racket || 'sasta'; if (!SAVE.owned.includes(rk)) SAVE.owned.push(rk); SAVE.equip = rk; SAVE.trial = null; RKC = null;
      const sv = SV(); sv.saman = sv.saman || {}; for (const s of (R7.SAMAN || [])) sv.saman[s.id] = 3;
      if (window.R9 && R9.sv) { R9.sv().hosp = {}; }
    } catch (e) { console.warn('[stu setup]', e); }
  };
  /* start a real level */
  STU.start = function (n, boosts) {
    STU.events = [];
    try { startLevel(n, boosts || {}); } catch (e) { console.warn('[stu start]', e); }
    try { if (typeof ptr !== 'undefined') { ptr.x = W / 2; ptr.y = H * 0.55; } } catch (e) { }
    B.gx = W / 2; B.gy = H * 0.55; B.saved = 0;
    return { task: CL.task, boss: CL.boss || null, n: CL.n, w: CL.w, world: (window.CW && CW.name) || '' };
  };
  /* special worlds: hospital and Yamlok use real game levels */
  STU.level = function (kind, i, ch) {
    try {
      if (kind === 'hosp') { const pool = LEVELS.filter(l => l.task === 'survive' && !l.boss), base = pool[Math.min(pool.length - 1, i || 1)] || LEVELS[5]; return Object.assign({}, base, { n: 700 + (i || 0), r9: 'hosp', r9char: ch || 'papa', r9theme: 'r_hosp', ev: 'r9', boss: null, newType: null }); }
      if (kind === 'yam') { const L = R7.YAM[Math.min(14, i || 0)]; return Object.assign({}, L, { yam: ch || 'papa' }); }
    } catch (e) { console.warn('[stu level]', e); }
    return i || 1;
  };
  /* scripted moments */
  STU.act = function (a, v) {
    try {
      if (a === 'swarm') { for (let i = 0; i < (v || 8); i++) spawnMosq(i % 3 ? 'bachcha' : 'normal'); }
      else if (a === 'fever') { G.fever = v || 6; }
      else if (a === 'bossLow') { for (const m of G.mosq) if (m.boss && !m.fake && !m.dead) { m.hp = Math.max(2, Math.round(m.maxhp * (v || 0.12))); m.guards = 0; m.books = 0; if (m.mode === 'enter') m.mode = 'idle'; } }
      else if (a === 'bossKill') { for (const m of G.mosq) if (m.boss && !m.fake && !m.dead) { m.guards = 0; m.books = 0; hitBoss(m, W / 2, H * 0.135, 9999, true, 'tap'); } }
      else if (a === 'sleep') { for (const s of G.sleepers) s.neend = v; }
      else if (a === 'item') { const sv = SV(); sv.saman[v] = Math.max(1, sv.saman[v] || 0); R7.qb.use(v); }
      else if (a === 'mega') { mega(v ? v[0] : W / 2, v ? v[1] : H * 0.45); }
      else if (a === 'win') { winLevel(); }
      else if (a === 'spawn') { for (let i = 0; i < (v.n || 1); i++) spawnMosq(v.k); }
    } catch (e) { console.warn('[stu act]', a, e); }
  };
  STU.info = function () {
    try {
      const boss = G.mosq.find(m => m.boss && !m.fake);
      return { state, t: G.t, score: G.score, combo: G.combo, kills: G.kills, sleep: minNeend(), mosq: G.mosq.filter(m => !m.dead).length,
        boss: boss ? { x: boss.x, y: boss.y, hp: boss.hp, max: boss.maxhp, name: boss.b && boss.b.name } : null,
        sleeper: G.sleepers[0] ? { x: G.sleepers[0].x, y: G.sleepers[0].y } : null, cine: G.cine ? G.cine.type : null, W, H };
    } catch (e) { return { state: 'err' }; }
  };
  STU.canvas = () => document.getElementById('c');
  /* game sounds on/off without touching the music (cards, outro, fast-forward) */
  STU.mute = function (b) { try { muted = !!b; if (b && buzzGain) buzzGain.gain.value = 0; } catch (e) { } };
  /* invisible safety net: sleep never drops below this (null = off) */
  STU.floor = null;
  /* game data for the Studio (names, worlds, rackets, bosses...) */
  STU.data = function () {
    const o = {};
    try { o.levels = LEVELS.map(L => ({ n: L.n, w: L.w, task: L.task, boss: L.boss || null, tw: L.tw || L.r9tw || null, tier: L.tier })); } catch (e) { o.levels = []; }
    try { o.worlds = WORLDS.map(w => ({ name: w.name, theme: w.theme, who: w.who, sleeper: w.sleeper })); } catch (e) { }
    try { o.bosses = Object.fromEntries(Object.entries(BOSSES).map(([k, b]) => [k, { name: b.name, taunt: b.taunt, tier: b.tier, hp: b.hp }])); } catch (e) { }
    try { o.rackets = RACKETS.map(r => ({ id: r.id, name: r.name, rar: r.rar, sp: r.sp, r: r.r, regen: r.regen, pow: r.pow })); } catch (e) { }
    try { o.chars = Object.fromEntries(Object.entries(CHARS).map(([k, c]) => [k, { n: c.n, qd: c.qd, secret: !!c.secret }])); } catch (e) { }
    try { o.saman = R7.SAMAN.map(s => ({ id: s.id, img: s.img, name: s.name, desc: s.desc })); } catch (e) { }
    try { o.boosters = BOOSTERS.map(b => ({ id: b.id, name: b.name, desc: b.desc })); } catch (e) { }
    try { o.tasks = Object.fromEntries(Object.entries(TASKS).map(([k, t]) => [k, { name: t.name, icon: t.icon }])); } catch (e) { }
    try { o.twists = Object.fromEntries(Object.entries(R9.TWIST).map(([k, t]) => [k, { name: t.t || k, icon: t.i || '' }])); } catch (e) { }
    try { o.love = R9.LOVE.map(l => ({ id: l.id, name: l.n, char: l.char, days: l.days, d: l.d })); } catch (e) { }
    try { o.keyOf = Object.assign({}, R7.KEY || {}); } catch (e) { }
    return o;
  };
})();

/* ================= BEAT SANX — core game engine =================
   One run = continuous levels in a mode until hearts run out.
   v1.3: a level starts at 3 tiles and adds ONE new tile per round up to the level target
   (old part replays fast, the new tile is marked NEW). Wrong tap = lose a heart, the same round replays.
   LADDER runs (duels, events, challenges): pattern starts at 2 and grows +1 every round, forever.
   Events plug in through cfg.ev hooks.
   v1.2: grids 3x3 / 4x4 / 5x5, worlds, ad-safe 3-2-1 countdown,
   IMPOSSIBLE 100 (cfg.imp), Friend Challenge pure seeded runs (cfg.chal),
   Lucky Box, trial expiry popups, cosmetics (shape / flash / tap fx / win fx). */
'use strict';
const G = (() => {
  const $ = id => document.getElementById(id);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let R = null;          // current run
  let token = 0;         // cancels async loops on quit/restart
  let gridN = 0;

  /* seeded random (Friend Challenge must give both players the same pattern) */
  const hash = (...a) => { let h = 2166136261 >>> 0; for (const v of a) { const s = String(v); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } h ^= 0x9e37; } return h >>> 0; };
  const mulberry = seed => { let t = seed >>> 0; return () => { t = (t + 0x6D2B79F5) >>> 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; };
  const rndOf = (rng, n) => Math.floor(rng() * n);
  const rnd = n => Math.floor(Math.random() * n);

  /* ---------- build DOM once ---------- */
  function build() {
    const el = $('game');
    el.innerHTML = `
    <div class="gFx" id="gFx"></div>
    <div class="gHud">
      <button class="gPause" id="gQuit" aria-label="Pause">${ART.ic('menu')}</button>
      <div id="gHearts" class="hearts"></div>
      <div id="gLevel" class="gPill">LEVEL 1</div>
      <div class="gCoins" id="gCoinsBox">${ART.coin(18)}<b id="gCoins">0</b></div>
    </div>
    <div class="gHide"><span id="gMode"></span><span id="gWorld"></span></div>
    <div id="gTimer" class="gTimer hide"><i id="gTimerFill"></i><span id="gTimerTxt"></span></div>
    <div class="gMsgBox"><div id="gMsg" class="gMsg"></div></div>
    <div id="gBoardWrap" class="boardWrap"><div id="gBoard" class="board"></div></div>
    <div id="gTileCt" class="gTileCt"><b id="gTileTx">GET READY</b><div class="gProg"><i id="gProgFill"></i></div><div class="gRounds" id="gRounds"></div></div>
    <div id="gBoosts" class="gBoosts"></div>
    <div id="gInfo" class="gInfo"></div>
    <div id="gBanner" class="gBanner hide"></div>
    <div id="gCount" class="gCount hide"></div>
    <div id="gCard" class="gCard hide"></div>`;
    $('gQuit').onclick = () => pause();
    $('gBoosts').addEventListener('click', e => { const b = e.target.closest('[data-bs]'); if (b) boostTap(b.dataset.bs); });
    buildBoard(3);
  }
  function buildBoard(g) {
    if (gridN === g) return;
    gridN = g;
    const b = $('gBoard'); b.innerHTML = ''; b.style.setProperty('--g', g); b.dataset.g = g;
    for (let i = 0; i < g * g; i++) {
      const t = document.createElement('button'); t.className = 'tile'; t.dataset.i = i;
      t.innerHTML = '<span class="tGlow"></span><span class="tFace"></span><span class="tEye">' + ART.ic('eye') + '</span><span class="tFx"></span>';
      t.addEventListener('pointerdown', e => { e.preventDefault(); tap(i); });
      b.appendChild(t);
    }
  }

  /* ---------- helpers ---------- */
  const tiles = () => [...$('gBoard').children];
  const N = () => gridN * gridN;
  function skinNow() {
    if (R && R.ev && R.ev.skin) return D.skin(R.ev.skin);
    return D.skin(S.active('skin'));
  }
  function paintSkin(shuffle) {
    const sk = skinNow(), b = $('gBoard');
    b.dataset.anim = sk.anim || '';
    b.dataset.shape = S.active('shape');
    b.dataset.flash = S.active('flash');
    let order = null;
    if (shuffle) { order = [...Array(9).keys()]; for (let i = 8; i > 0; i--) { const j = rnd(i + 1); [order[i], order[j]] = [order[j], order[i]]; } }
    const EXTRA = ['diamond', 'flame', 'drop', 'leaf', 'cloud', 'crown', 'plus', 'x', 'comet', 'planet', 'rocket', 'compass', 'chip', 'shield', 'square', 'skull'];
    tiles().forEach((t, i) => {
      const k = order ? order[i % 9] : i % 9, v = Math.floor(i / 9);
      t.style.setProperty('--c', sk.colors[k]);
      t.dataset.v = v;
      t.querySelector('.tFace').innerHTML = ART.tileIc(v ? EXTRA[(i - 9) % EXTRA.length] : sk.icons[k]);
    });
  }
  function lit(idxs, on, cls = 'on') { tiles().forEach((t, i) => { if (idxs.includes(i)) { t.classList.toggle(cls, on); if (on && cls === 'on' && typeof BG !== 'undefined') BG.pulse(getComputedStyle(t).getPropertyValue('--c')); } }); if (cls === 'on' && typeof REC !== 'undefined' && REC.recording) REC.evt(on ? 'lit' : 'unlit', { i: idxs.slice() }); }
  function clearFx() { tiles().forEach(t => t.classList.remove('on', 'ok', 'bad', 'decoy', 'hintT', 'dark', 'newT', 'hole', 'xray', 'fogL', 'eyeC', 'rev')); }
  /* Sanx taunts never show during play (they distract). They are kept and shown in the
     between-level banner. Useful facts (eliminated, floor reached ...) use info(). */
  function say(txt, mood = 'smug') { if (!R) return; R.taunt = { txt, mood }; }
  function info(txt) {
    if (!R) return;
    const el = $('gInfo'); el.textContent = txt; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    clearTimeout(R.infoT); R.infoT = setTimeout(() => el.classList.remove('show'), 1600);
  }
  const msg = (t, cls = '') => { const m = $('gMsg'); m.textContent = t; m.className = 'gMsg ' + cls; if (t) { m.classList.remove('pop'); void m.offsetWidth; m.classList.add('pop'); } };
  function hud() {
    if (!R) return;
    if (typeof REC !== 'undefined' && REC.recording) { const k = [R.level, R.hearts, R.coins, gridN].join(); if (k !== R._recHud) { R._recHud = k; REC.evt('hud', { level: R.level, hearts: R.imp ? 3 : R.hearts, max: R.imp ? 3 : R.maxHearts, coins: R.coins, g: gridN }); } }
    const h = $('gHearts');
    if (R.imp) h.innerHTML = `<span class="impTag">${R.imp.grid}×${R.imp.grid}${R.imp.cp ? ` · ${ART.ic('flag')} ${R.imp.cp}` : ''}</span>`;
    else if (R.noHearts) h.innerHTML = R.mode === 'zen' ? `<span class="zenTag">${ART.ic('leaf')}</span>` : '';
    else { let s2 = ''; for (let i = 0; i < Math.max(R.maxHearts, R.hearts); i++) s2 += ART.heartC(22, i < R.hearts); h.innerHTML = s2; }
    /* one clear pill: what level, and what is special about it (boss / bonus / twist / mode) */
    const L = $('gLevel'), m = R.mode, special = m !== 'classic' && (R.twist || R.evMode) ? `${ART.ic(D.MODE[m].icon)} ${D.MODE[m].name.toUpperCase()} · ` : '';
    let txt, cls = 'gPill';
    if (R.imp) txt = `TILES ${R.imp.len} / ${R.imp.target}`;
    else if (R.dbeat) txt = `DAILY BEAT · ${R.seq.length || R.ladder.start} TILES`;
    else if (R.test) txt = `MEMORY TEST · ${R.seq.length || R.ladder.start} TILES`;
    else if (R.chal) txt = R.chal.role === 'play' ? `BEAT ${R.chal.target} TILES` : `DUEL · ${R.seq.length || R.ladder.start} TILES`;
    else if (R.ladder) txt = `${special}${R.ev && R.ev.short ? R.ev.short : 'STAGE ' + (R.level - (R.startLevel || 1) + 1)}`;
    else if (R.blitz) txt = `STEPS ${R.stepsDone}`;
    else txt = `${R.boss ? 'BOSS · ' : R.bonus ? 'BONUS ×3 · ' : ''}${special}LEVEL ${R.level}`;
    if (R.boss) cls += ' boss'; else if (R.bonus) cls += ' bonus'; else if (special) cls += ' twist';
    if (L.innerHTML !== txt) L.innerHTML = txt;
    L.className = cls;
    $('gCoins').textContent = R.coins.toLocaleString();
    rounds();
    boosts();
  }
  /* 3 small dots under the counter = rounds of this level */
  function rounds() {
    const el = $('gRounds'); if (!R || R.ladder || R.imp || R.daily || R.blitz || !R.steps.length || R.steps.length > 6) { el.innerHTML = ''; return; }
    el.innerHTML = R.steps.map((_, i) => `<i class="${i < R.stepIdx ? 'done' : i === R.stepIdx ? 'cur' : ''}"></i>`).join('');
  }
  /* ---------- v1.7 booster row ----------
     owned boosters are instant (no ad). One ad booster per level: REPLAY (the pattern plays again,
     you continue from the same tile). No ad ever interrupts a round you are tapping in,
     except Replay which the player asks for. 2nd Chance is offered with an ad after a wrong tap.
     IMPOSSIBLE 100: one Replay booster, up to 10 per run. */
  const BOOST_ON = () => R && !R.pure && !R.dbeat && !R.test && !R.imp && !(R.ev && /^ch_/.test(R.ev.id));
  const hasClock = () => R && (R.blitz || R.mode === 'speed' || R.mode === 'rush' || (R.ev && (R.ev.timer || R.ev.stepTimer)));
  const left = b => b === 'hint' ? R.hintLeft : b === 'xray' ? R.xrayLeft : b === 'skip' ? R.skipLeft : b === 'second' ? R.secondLeft : b === 'shield' ? (R.shieldAuto ? 1 : 0) : b === 'combo' ? R.comboKeep : b === 'freeze' ? (frozen() ? 1 : -1) : -1;
  function slots() {
    if (R && R.imp) return [{ b: 'replay', k: 'imp' }];
    if (!BOOST_ON()) return [];
    const out = R.boosts.slice(0, 3).map(b => ({ b, k: 'own' }));
    out.push({ b: 'replay', k: 'ad' });
    if (R.showTimeAd && !R.timeAdUsed) out.push({ b: 'time', k: 'ad' });
    return out.slice(0, 6);
  }
  function boosts() {
    const el = $('gBoosts'); if (!el || !R) return;
    const sl = slots();
    if (!sl.length) { if (el.innerHTML) el.innerHTML = ''; el.classList.add('none'); return; }
    el.classList.remove('none');
    const html = sl.map(({ b, k }) => {
      if (b === 'time') return `<button class="bs ad" data-bs="ad:time">${ART.ic('clock')}<small>+30s</small><em>${ART.ic('ad')}</em></button>`;
      if (b === 'replay') {
        if (k === 'imp') { const n = D.IMP.replays - R.imp.rep; return n > 0 ? `<button class="bs ad rep" data-bs="imp:replay">${ART.ic('refresh')}<small>Replay</small><em class="n">${n}</em><i class="adMini">${ART.ic('ad')}</i></button>` : `<button class="bs used" data-bs="none">${ART.ic('refresh')}<small>USED</small></button>`; }
        return R.adB.replay ? `<button class="bs used" data-bs="none">${ART.ic('refresh')}<small>USED</small></button>` : `<button class="bs ad rep" data-bs="ad:replay">${ART.ic('refresh')}<small>Replay</small><em>${ART.ic('ad')}</em></button>`;
      }
      const B = D.BOOST[b], n = left(b), tapable = D.TAP_BOOSTS.includes(b);
      if (n > 0) return `<button class="bs own ${tapable ? 'tap' : 'on'}" data-bs="own:${b}">${ART.ic(B.icon)}<small>${tapable ? B.name.split(' ')[0] : 'ON'}</small><em class="n">${n}</em></button>`;
      if (n === -1) return `<button class="bs own on" data-bs="none">${ART.ic(B.icon)}<small>ACTIVE</small></button>`;
      return `<button class="bs used" data-bs="none">${ART.ic(B.icon)}<small>USED</small></button>`;
    }).join('');
    if (el.innerHTML !== html) el.innerHTML = html;
  }
  function useOwn(b) {
    if (b === 'hint') return useHint();
    if (b === 'xray') return xray(true);
    if (b === 'skip') return skipLevel();
  }
  async function boostTap(key) {
    if (!R || R.ended || key === 'none') return;
    const [k, b] = key.split(':');
    if (R.phase !== 'input') return info('Use it on your turn');
    if (k === 'own') return useOwn(b);
    if (b === 'time') return adTime();
    if (b === 'replay') return adReplay(k === 'imp');
  }
  /* between levels only: refill owned tap boosters that ran out this level (never mid-round) */
  async function refillOffer() {
    if (!BOOST_ON() || R.ev) return;
    const empty = R.boosts.filter(b => D.TAP_BOOSTS.includes(b) && b !== 'xray' && left(b) <= 0 && !(R.refilled || {})[b]);
    if (!empty.length) return;
    R.refilled = R.refilled || {};
    await midRun(async () => {
      const v = await UI.ask(`<div class="mdK">Between levels</div><div class="mdT">Refill your boosters?</div><div class="rfRow">${empty.map(b => `<span>${ART.ic(D.BOOST[b].icon)}<b>${D.BOOST[b].name}</b></span>`).join('')}</div><div class="mdS">Watch one ad to refill them for the next level.</div>
        <button class="btn big pulse" data-pick="ad">${ART.ic('ad')} REFILL</button><button class="btn ghost" data-pick="no">No thanks</button>`, 'refillM');
      if (v !== 'ad') return false;
      const ok = await ADS.rewarded('boost');
      if (ok) empty.forEach(b => { R.refilled[b] = 1; if (b === 'hint') R.hintLeft++; if (b === 'skip') R.skipLeft++; });
      return ok;
    });
  }
  /* ---------- v1.6 mode / twist card: demo + GOT IT (first 3 times), short banner later ---------- */
  function modeCard(m, kicker) {
    const M = D.MODE[m], H = D.MODE_HOW[m] || { demo: 'same', txt: M.tag };
    const seen = (S.st.modeSeen = S.st.modeSeen || {});
    if ((seen[m] || 0) >= 3 || R.pure) return banner(`<div class="bnK">${kicker}</div><div class="bnT bnIc">${ART.ic(M.icon)}</div><div class="bnS big">${M.name} · ${M.tag}</div>`, 'bonus', 1500);
    seen[m] = (seen[m] || 0) + 1; S.save();
    const t = token; R.paused = true; SND.beat.pause();
    return new Promise(res => {
      const c = $('gCard');
      c.innerHTML = `<div class="gcIn"><div class="gcK">${kicker}</div><div class="gcT">${ART.ic(M.icon)} ${M.name.toUpperCase()}</div>
        <div class="gcDemo" data-d="${H.demo}">${Array.from({ length: 9 }, (_, i) => `<i data-i="${i}"><b>${H.demo === 'eye' ? ART.ic('eye') : ''}</b></i>`).join('')}</div>
        <div class="gcTx">${H.txt}</div><button class="btn big pulse" id="gcOk">${ART.ic('check')} GOT IT</button></div>`;
      c.className = 'gCard show';
      const cells = [...c.querySelectorAll('.gcDemo i')], pat = [1, 5, 6, 2];
      let alive = true;
      (async () => {
        while (alive) {
          cells.forEach(x => x.className = '');
          const p = H.demo === 'rush' ? [0, 4, 8, 3, 1, 5] : pat;
          for (const i of p) { if (!alive) return; cells[i].classList.add('on'); await sleep(H.demo === 'rush' ? 260 : 420); cells[i].classList.remove('on'); await sleep(120); }
          await sleep(350); if (!alive) return;
          const ans = H.demo === 'rev' ? p.slice().reverse() : H.demo === 'rush' ? p.slice(-3) : p;
          if (H.demo === 'eye') cells.forEach(x => x.classList.add('eye'));
          for (const [k, i] of ans.entries()) { if (!alive) return; cells[i].classList.remove('eye'); cells[i].classList.add('tap'); cells[i].dataset.n = k + 1; await sleep(480); }
          await sleep(900);
        }
      })();
      $('gcOk').onclick = async () => {
        alive = false; c.className = 'gCard hide'; c.innerHTML = '';
        if (t !== token || !R) return res();
        R.paused = false; SND.beat.resume(); res();
      };
    });
  }
  /* big "TILE 3 OF 5" counter + progress bar (replaces the old dots) */
  function dots(total, done) {
    if (!R) return;
    const w = R.phase === 'show';
    $('gTileTx').innerHTML = w ? `TILE <span>${done}</span> / ${total}` : `<span>${Math.min(done, total)}</span> / ${total}`;
    if (!w && done >= total) $('gTileTx').innerHTML = 'DONE!';
    $('gProgFill').style.width = (total ? done / total * 100 : 0) + '%';
    $('gTileCt').classList.toggle('watch', w);
  }
  function setWorld() {
    const w = D.world(R.level);
    $('gWorld').textContent = R.dbeat ? 'Same pattern for every player today' : R.test ? `Memory Score ${S.memBest()} · ${D.memRank(S.memBest()).name}` : R.imp ? `Target ${R.imp.target} tiles · ${D.IMP.coins(R.imp.target, R.imp.grid).toLocaleString('en-IN')} coins` : R.chal ? (R.chal.role !== 'play' ? (R.chal.role === 'world' ? 'Live duel · go as far as you can' : 'Set the score: longest pattern') : `Beat ${R.chal.target} tiles`) : R.ev ? R.ev.title : (R.daily ? 'Daily Challenge' : `World ${D.WORLDS.indexOf(D.WORLDS.find(x => x.name === w.name)) + 1} · ${w.name}`);
    const th = R.ev && R.ev.theme;
    $('game').style.setProperty('--wa', R.boss ? '#3a0820' : th ? th[0] + '55' : w.a); $('game').style.setProperty('--wb', R.boss ? '#12030a' : th ? '#07041a' : w.b);
    $('game').classList.toggle('isBoss', R.boss); $('game').classList.toggle('isBonus', R.bonus);
  }

  /* ---------- 3-2-1 after any ad / popup so nothing is missed ---------- */
  async function countdown() {
    const t = token, c = $('gCount');
    c.classList.remove('hide');
    for (const n of ['READY?', '3', '2', '1']) {
      if (t !== token) { c.classList.add('hide'); return; }
      c.innerHTML = `<b class="${n.length > 1 ? 'rd' : ''}">${n}</b>`; SND.tick();
      await sleep(n.length > 1 ? 700 : 620);
    }
    c.classList.add('hide');
  }
  /* any pop-up shown in the middle of a run goes through here */
  async function midRun(fn) {
    const t = token; R.paused = true; SND.beat.pause();
    let adShown = false;
    try { adShown = !!(await fn()); } catch (e) { }
    if (t !== token || !R) return false;
    UI.show('game'); ADS.banner(false);
    if (adShown) await countdown();
    if (t !== token || !R) return false;
    R.paused = false; SND.beat.resume();
    return t === token;
  }

  /* ---------- start ---------- */
  function start(cfg) {
    token++;
    const mode = cfg.mode || 'classic';
    const st = S.st, ev = cfg.ev || null;
    const blitz = mode === 'blitz';
    const pure = !!cfg.chal;
    const ladCfg = cfg.ladder || (pure ? D.CHAL.ladder : null) || (ev && ev.ladder !== false ? {} : null);
    R = {
      cfg, mode, baseMode: mode, ev, daily: cfg.daily || null, blitz, chal: cfg.chal || null, pure,
      imp: cfg.imp ? { target: cfg.imp.target, grid: cfg.imp.grid || 3, len: 1, rep: 0, cp: 0, seq: [], cleared: 0 } : null,
      level: ev ? (ev.startLevel || 1) : (cfg.daily || blitz || pure || cfg.imp) ? 1 : S.lv(mode),
      startLevel: 0, levelsDone: 0, stepsDone: 0, stepIdx: 0, steps: [],
      seq: [], input: 0, phase: 'idle',
      hearts: D.HEARTS, maxHearts: D.HEARTS, noHearts: mode === 'zen' || blitz || !!cfg.imp || !!(ev && ev.timePenalty),
      coins: 0, xp: 0, combo: 0, maxCombo: 0, correct: 0, taps: 0, perfectLv: 0, lvWrong: 0,
      fails: 0, adapt: 1, boss: false, bonus: false, revived: 0, adContinues: 0, shieldAuto: false,
      hintLeft: 0, booster: cfg.booster || null, coinMul: 1, doubled: false, replays: 0, timeAdUsed: false,
      timeLeft: 0, timer: null, sayT: 0, startT: Date.now(), ended: false, shows: 0, passPts: 0,
      ladder: ladCfg ? { start: ladCfg.start || 2, grid: ladCfg.grid || (ev && ev.grid) || 3 } : null,
      maxLen: 0, lvCoins: 0, boosts: [], xrayLeft: 0, xrayPer: 0, skipLeft: 0, secondLeft: 0, comboKeep: 0, timeMul: 1, passMul: 1, fogLens: false, luckyEvery: D.LUCKY_EVERY
    };
    if (pure && D.CHAL.ladder.hearts) { R.hearts = R.maxHearts = D.CHAL.ladder.hearts; }
    R.test = !!cfg.test; R.dbeat = cfg.dbeat || null;
    if (ev && mode === 'classic' && !ev.modeAt && !ev.modeAtRound && !/^ch_/.test(ev.id) && !ev.timePenalty && !ev.pureMode) {
      /* v1.6 event mode ladder: easy classic start, new modes join as the player nears the win */
      if (ladCfg) ev.modeAtRound = i => { const k = Math.floor(i / 2); return k < D.EV_LADDER.length ? D.EV_LADDER[k] : D.EV_MIX[Math.floor(Math.random() * D.EV_MIX.length)]; };
      else ev.modeAt = lv => { const k = lv - (ev.startLevel || 1); return k < D.EV_LADDER.length ? D.EV_LADDER[k] : D.EV_MIX[(k * 7) % D.EV_MIX.length]; };
    }
    if (cfg.hearts) { R.hearts = R.maxHearts = cfg.hearts; }
    R.startLevel = R.level;
    R.seed = pure ? cfg.chal.seed : R.dbeat ? hash('dbeat', R.dbeat.no) : 0;
    if (ev && ev.hearts != null) { R.hearts = R.maxHearts = ev.hearts; if (ev.hearts === 0) R.noHearts = true; }
    // boosters: up to 3 per run, never in duels / events / IMPOSSIBLE
    const want = (cfg.boosters || (cfg.booster ? [cfg.booster] : [])).slice(0, D.MAX_BOOSTS);
    const applyB = b => {
      if (b === 'slow') R.adapt = 1.3;
      if (b === 'heart') { R.hearts++; R.maxHearts++; }
      if (b === 'double') R.coinMul *= 2;
      if (b === 'magnet') R.coinMul *= 1.5;
      if (b === 'shield') R.shieldAuto = true;
      if (b === 'hint') R.hintLeft++;
      if (b === 'freeze') R.timeMul = 1.5;
      if (b === 'xray') R.xrayPer = 2;
      if (b === 'second') R.secondLeft = 1;
      if (b === 'lucky') R.luckyEvery = 2;
      if (b === 'xp') R.xpBoost = 2;
      if (b === 'combo') R.comboKeep = 1;
      if (b === 'skip') R.skipLeft = 1;
      if (b === 'fog') R.fogLens = true;
      if (b === 'pass') R.passMul = 2;
      R.boosts.push(b);
    };
    if (!ev && !pure && !cfg.imp && !ladCfg) want.forEach(b => { if (st.boosters[b] > 0) { st.boosters[b]--; applyB(b); } });
    S.save();
    if (cfg.freeBoost && !ladCfg && !R.boosts.includes(cfg.freeBoost)) applyB(cfg.freeBoost);
    R.booster = R.boosts[0] || null;
    const se = D.season();
    if (se.id === 'coin' && !ev && !pure) R.coinMul *= 2;
    R.xpMul = (se.id === 'xp' ? 2 : 1) * (R.xpBoost || 1);

    $('gMode').textContent = R.imp ? 'IMPOSSIBLE 100' : R.chal ? 'DUEL LADDER' : R.dbeat ? `DAILY BEAT #${R.dbeat.no}${R.dbeat.practice ? ' · PRACTICE' : ''}` : R.test ? 'MEMORY TEST' : ev ? ev.name : D.MODE[mode].name.toUpperCase();
    $('game').dataset.gm = mode;
    $('game').classList.toggle('isImp', !!R.imp); $('game').classList.toggle('isChal', pure); $('game').classList.toggle('isBlackout', !!(ev && ev.blackout));
    buildBoard(gridFor(R.level)); paintSkin(); clearFx();
    if (blitz || (ev && ev.timer)) { R.timeLeft = blitz ? D.BLITZ_SECS : ev.timer; R.timeMax = R.timeLeft; startClock(); }
    else $('gTimer').classList.add('hide');
    R.adB = {}; R.twistFree = R.twistFree || {};
    S.st.stats.played++; S.questMode(mode); S.save();
    UI.show('game'); ADS.banner(false); SND.music(false);
    if (typeof REC !== 'undefined' && REC.armed) REC.begin();
    SND.beat.onKick = null;   /* v1.5: no board zoom on every beat (distracting) */
    SND.beat.start(bpmNow(), 'light');
    intro().then(() => { if (R && !R.ended) R.imp ? impRound(true) : beginLevel(true); });
  }
  const gridFor = lv => R && R.imp ? R.imp.grid : R && R.ladder ? R.ladder.grid : R && R.daily ? 3 : R && R.ev ? (R.ev.grid || 3) : D.gridFor(lv);
  /* v1.7 event grid mix (never in duels, Daily Beat, Memory Test or Challenges: those keep a fixed grid) */
  const mixOn = () => R && R.ev && !R.pure && !R.dbeat && !R.test && !/^ch_/.test(R.ev.id) && !R.ev.grid && R.ev.gridMix !== false;
  /* the 3x3 pattern is kept; on a bigger board every 3x3 cell maps to one tile inside its zone,
     so the player keeps building the same pattern while the board gets bigger */
  function zoneMap(g) {
    const Z = g === 4 ? [[0], [1, 2], [3]] : [[0, 1], [2], [3, 4]], m = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const zr = Z[r][rnd(Z[r].length)], zc = Z[c][rnd(Z[c].length)]; m.push(zr * g + zc); }
    return m;
  }
  async function mixGrid(i, total) {
    const t = token, g = R.ev.gridAt ? R.ev.gridAt(i) : D.evGrid(i, total);
    if (g === gridN) return true;
    const up = g > gridN;
    buildBoard(g); paintSkin(); R.gmap = g > 3 ? zoneMap(g) : null;
    SND.whoosh && SND.whoosh();
    await banner(`<div class="bnK">${up ? 'BIG BOARD!' : 'BACK TO 3×3'}</div><div class="bnT">${g}×${g}</div><div class="bnS big">${up ? 'Same pattern, bigger board · coins ×' + D.GRID_MULT[g] : 'Breathe. Same pattern continues'}</div>`, up ? 'bonus' : 'intro', up ? 1600 : 1100, up ? 'shock' : null);
    return t === token;
  }
  const P = v => R && R.gmap ? R.gmap[v] : v;

  /* ---------- beat helpers (v1.4) ---------- */
  function bpmNow() {
    if (!R) return 100;
    if (R.imp) return Math.min(140, 92 + R.imp.len * 2);
    if (R.ladder) return D.bpmLadder(R.seq.length || R.ladder.start);
    if (R.daily || R.ev) return 100;
    return D.bpmFor(R.level);
  }
  function kickPulse() {
    if (!R || R.paused || R.ended) return;
    const w = $('gBoardWrap'); w.classList.remove('kick'); void w.offsetWidth; w.classList.add('kick');
  }
  function groove(mode) { if (!R) return; SND.beat.start(bpmNow(), mode); SND.beat.tempo(bpmNow()); SND.beat.mode(mode); }
  const isClassicRun = () => R && !R.ev && !R.daily && !R.ladder && !R.pure && !R.imp && !R.blitz && R.baseMode === 'classic';

  /* mode banner so the player always knows the rules of what they are playing */
  async function intro() {
    const t = token;
    let k, big, sub;
    if (R.imp) { k = 'IMPOSSIBLE 100'; big = R.imp.target; sub = 'Pattern grows 1 tile every round'; }
    else if (R.dbeat) { k = `DAILY BEAT #${R.dbeat.no}`; big = D.sanxScore(R.dbeat.no); sub = R.dbeat.practice ? 'Practice run · your official score stays the same' : 'Sanx remembered this many. Same pattern for the whole world. One mistake ends it.'; }
    else if (R.test) { k = 'MEMORY TEST'; big = ART.ic('brain'); sub = `Starts at ${D.TEST.start} tiles, +1 every round. ${D.TEST.hearts} mistakes and it ends. No boosters.`; }
    else if (R.chal) { k = 'DUEL LADDER'; big = R.chal.role !== 'play' ? 'GO!' : `${R.chal.target + 1}+`; sub = R.chal.role !== 'play' ? 'Starts at 2 tiles, +1 every round. Go as far as you can' : `Remember a pattern longer than ${R.chal.target} tiles`; }
    else if (R.ev) { k = R.ev.name; big = ART.ic(R.ev.icon || 'trophy'); sub = R.ladder ? `${R.ev.title} · starts at ${R.ladder.start} tiles, +1 every round` : R.ev.title; }
    else if (!R.daily && !R.blitz && S.st.stats.runs < 1) { k = 'HOW TO PLAY'; big = ART.ic('zap'); sub = 'Tiles flash. Tap them in the same order. Every round adds ONE new tile.'; }
    else { const m = D.MODE[R.mode]; k = m.name.toUpperCase(); big = ART.ic(m.icon); sub = R.daily ? 'One pattern. One shot.' : m.tag; }
    await banner(`<div class="bnK">${k}</div><div class="bnT ${typeof big === 'string' && big.startsWith('<svg') ? 'bnIc' : ''}">${big}</div><div class="bnS big">${sub}</div>`, 'intro', S.st.stats.runs > 5 ? 1150 : 1700);
    return t === token;
  }

  function startClock() {
    $('gTimer').classList.remove('hide');
    clearInterval(R.timer);
    const t0 = token;
    R.timer = setInterval(() => {
      if (!R || t0 !== token || R.paused || R.ended) return;
      if ((R.phase === 'show' && !R.blitz && !(R.ev && R.ev.timerRunsAlways)) || frozen()) { drawClock(); return; }
      R.timeLeft = Math.max(0, R.timeLeft - 0.1); drawClock();
      if (R.timeLeft <= 10 && Math.abs(R.timeLeft - Math.round(R.timeLeft)) < 0.05) SND.tick();
      if (R.ev && R.ev.timeAd && !R.timeAdUsed && R.timeLeft < 15 && S.cap('bts30', 99) > 0 && !R.showTimeAd) { R.showTimeAd = true; hud(); }
      if (R.ev && R.ev.onTick) R.ev.onTick(R);
      if (R.timeLeft <= 0) { clearInterval(R.timer); timeUp(); }
    }, 100);
  }
  const frozen = () => R && R.frozenUntil && Date.now() < R.frozenUntil;
  function drawClock() {
    if (!R) return;
    $('gTimer').classList.toggle('frozen', !!frozen());
    const max = R.stepTimer ? R.stepTimerMax : R.timeMax, left = R.stepTimer ? R.stepTimerLeft : R.timeLeft;
    $('gTimerFill').style.width = Math.max(0, left / max * 100) + '%';
    $('gTimer').classList.toggle('low', left < Math.min(R.imp ? 5 : 10, max * 0.25));
    $('gTimerTxt').textContent = left >= 60 ? `${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')}` : `${left.toFixed(left < 10 ? 1 : 0)}s`;
  }

  async function beginLevel(first) {
    const t = token;
    // trial ended mid-game? ask before the next level (never mid-level)
    if (!first && !R.pure) {
      const ex = S.expiredTrials();
      if (ex.length) { await midRun(() => UI.trialEnded(ex)); if (t !== token) return; paintSkin(); }
    }
    let evNew = null;
    if (R.ev && R.ev.modeAt) { const m0 = R.mode; R.mode = R.ev.modeAt(R.level, R); $('game').dataset.gm = R.mode; R.evMode = R.mode !== 'classic'; if (R.mode !== m0 && !first) evNew = R.mode; else if (first && R.mode !== 'classic') evNew = R.mode; }
    let twist = null;
    if (isClassicRun()) {
      twist = D.twistFor(R.level); if (twist && !S.unlocked(twist)) twist = null; R.mode = twist || 'classic'; $('game').dataset.gm = R.mode;
      $('gMode').textContent = twist ? `TWIST · ${D.MODE[twist].name.toUpperCase()}` : 'CLASSIC';
    }
    R.twist = twist; R.adB = {};
    const mixL = !R.ladder && mixOn();
    const g = mixL ? D.evGrid(R.levelsDone, R.ev.levels || 0) : R.ladder && mixOn() ? gridN || 3 : gridFor(R.level), grew = g !== gridN;
    buildBoard(g); paintSkin(); if (!R.ladder) R.gmap = null;
    R.steps = D.levelSteps(R.level); R.stepIdx = 0; R.lvWrong = 0; R.lvCoins = 0; R.xrayLeft = R.xrayPer;
    if (R.ladder) { R.steps = Array.from({ length: 200 }, (_, k) => R.ladder.start + k); }
    R.boss = !R.ladder && !R.blitz && !R.daily && D.isBoss(R.level) && (!R.ev || R.ev.boss !== false);
    R.bonus = !R.ladder && !R.pure && !R.boss && !R.blitz && !R.ev && !R.daily && R.mode !== 'zen' && R.level >= 5 && Math.random() < D.BONUS_CHANCE;
    if (R.daily) R.steps = [R.daily.length];
    if (R.ev && R.ev.sudden && R.ev.sudden(R)) { R.sudden = true; R.heartsBefore = R.hearts; R.hearts = 1; say('SUDDEN DEATH. One mistake = out.', 'angry', 2600); }
    else if (R.sudden) { R.sudden = false; R.hearts = R.heartsBefore; }
    setWorld(); hud();
    const w = D.world(R.level), newWorld = !first && !R.ev && !R.daily && R.level === w.min && R.level > 1;
    if (grew && !first) await banner(`<div class="bnK">${g > 3 ? 'BIG BOARD!' : 'NEW GRID'}</div><div class="bnT">${g}×${g}</div><div class="bnS">${g * g} tiles now. Stay sharp!</div>`, 'bonus', 1700, 'shock');
    else if (newWorld) await banner(`<div class="bnK">NEW WORLD</div><div class="bnT bnIc">${ART.ic(w.icon)}</div><div class="bnS big">${w.name}</div>`, 'intro', 1600);
    if (t !== token) return;
    groove(R.boss ? 'hype' : 'full');
    if (twist) { SND.whoosh(); await modeCard(twist, 'TWIST LEVEL'); if (t !== token) return; }
    else if (evNew) { SND.whoosh(); await modeCard(evNew, 'NEW MODE'); if (t !== token) return; }
    else if (first && !R.ev && !R.pure && !R.imp && !R.dbeat && !R.test && R.mode !== 'classic' && D.MODE_HOW[R.mode] && !((S.st.modeSeen || {})[R.mode])) { await modeCard(R.mode, 'HOW TO PLAY'); if (t !== token) return; }
    if (R.boss) { SND.boss(); await banner(`<div class="bnK">BOSS LEVEL</div><div class="bnT">${R.level}</div><div class="bnS">Faster flashes · Big reward</div><div class="bnTaunt">"${pick(D.SANX.boss)}"</div>`, 'boss', 1900, 'angry'); }
    else if (R.bonus) { await banner(`<div class="bnK">BONUS LEVEL</div><div class="bnT">×3</div><div class="bnS">Triple coins this level</div>`, 'bonus', 1300); }
    if (t !== token) return;
    R.seq = [];
    nextStep(true);
  }

  function makeSeq(len) {
    if (R.daily) return R.daily.slice();
    const n = R.gmap ? 9 : N(), rng = R.pure || R.dbeat ? mulberry(hash(R.seed, R.level, R.stepIdx)) : Math.random;
    const s = R.seq.slice(0, len);
    while (s.length < len) {
      if (R.mode === 'twin') { const a = rndOf(rng, n); let b = rndOf(rng, n); while (b === a) b = rndOf(rng, n); s.push([a, b]); }
      else { let v = rndOf(rng, n); if (s.length && v === s[s.length - 1] && rng() < 0.6) v = rndOf(rng, n); s.push(v); }
    }
    return s;
  }

  async function nextStep(fresh) {
    const t = token;
    const len = R.steps[R.stepIdx];
    if (R.ev && R.ev.modeAtRound && fresh) {
      const m = R.ev.modeAtRound(R.stepIdx, R);
      if (m && m !== R.mode) { R.mode = m; R.evMode = m !== 'classic'; $('game').dataset.gm = m; $('gMode').textContent = `${R.ev.name} · ${D.MODE[m].name.toUpperCase()}`; hud(); await modeCard(m, 'NEXT MODE'); if (t !== token) return; }
    }
    if (fresh && R.ladder && mixOn()) { if (!(await mixGrid(R.stepIdx, R.ev.rounds || 0))) return; }
    if (fresh) {
      if (R.mode === 'rush') {
        /* Rhythm Rush: a fresh pattern each round; ask for the LAST N in order */
        if (R.ladder) { R.ask = D.rushAskLadder(len); R.seq = []; R.seq = makeSeq(len); }
        else { const P = D.rushPlan(R.level); R.ask = P.ask; R.seq = []; R.seq = makeSeq(P.blink[Math.min(R.stepIdx, 2)]); }
      } else { R.ask = 0; R.seq = makeSeq(len); }
    }
    if (R.ladder || R.imp) SND.beat.tempo(bpmNow());
    if (R.ladder && R.ev && R.ev.sudden) { const sd = R.ev.sudden(R); if (sd && !R.sudden) { R.sudden = true; R.heartsBefore = R.hearts; R.hearts = 1; info('SUDDEN DEATH · 1 heart'); hud(); } else if (!sd && R.sudden) { R.sudden = false; R.hearts = Math.max(1, R.heartsBefore); hud(); } }
    if (R.ev && R.ev.beforeShow) R.ev.beforeShow(R, paintSkin);
    await sleep(fresh ? 450 : 650); if (t !== token) return;
    await show(); if (t !== token) return;
    startInput();
  }
  function startInput() {
    R.phase = 'input'; R.input = 0; R.got = []; R.rBeat = 0; R.rT0 = Date.now(); if (typeof BG !== 'undefined') BG.dim(false);
    dots(need(), 0);
    const m = R.mode;
    msg(m === 'rush' ? `LAST ${R.ask} · IN ORDER` : m === 'twin' ? 'TAP BOTH TILES' : m === 'negative' ? 'TAP THE DARK TILES' : m === 'reverse' ? 'BACKWARDS!' : m === 'ghost' ? 'FROM MEMORY' : m === 'eye' ? 'TAP TO REVEAL' : m === 'chaos' ? 'REAL TILES ONLY' : 'YOUR TURN', 'go');
    if (m === 'ghost') tiles().forEach(x => { x.classList.add('dark'); if (R.fogLens) x.classList.add('fogL'); });
    if (m === 'eye') tiles().forEach(x => x.classList.add('eyeC'));
    hud(); armXray();
    if (R.imp) { roundTimer(D.IMP.secs(R.seq.length, R.imp.grid)); return; }
    if (m === 'rush') { roundTimer((R.ladder ? R.ask * 1.4 + 3 : D.rushPlan(R.level).secs) * R.timeMul); return; }
    if (m === 'speed' || (R.ev && R.ev.stepTimer)) roundTimer(Math.max(3, R.seq.length * 0.95 + 1.5) * R.timeMul);
  }
  const need = () => R.mode === 'rush' ? R.ask : R.seq.length;
  const expAt = k => R.mode === 'rush' ? R.seq[R.seq.length - R.ask + k] : R.mode === 'reverse' ? R.seq[R.seq.length - 1 - k] : R.seq[k];
  /* X-Ray booster: no tap for 3 seconds -> the next correct tile glows softly (2 per level) */
  function armXray() {
    clearTimeout(R.xrayT);
    if (!(R.xrayLeft > 0) || R.phase !== 'input') return;
    const t0 = token, inp = R.input, sq = R.seq;
    R.xrayT = setTimeout(() => { if (t0 === token && R && R.phase === 'input' && R.input === inp && R.seq === sq) xray(false); }, 3000);
  }
  function xray(manual) {
    if (!R || R.phase !== 'input' || !(R.xrayLeft > 0)) return;
    const exp = R.mode === 'twin' ? R.seq[R.input].map(P).find(x => !R.got.includes(x)) : P(expAt(R.input));
    R.xrayLeft--; const el = tiles()[exp]; if (!el) return;
    el.classList.add('xray'); setTimeout(() => el.classList.remove('xray'), 1400);
    info(manual ? 'X-Ray!' : 'Stuck? X-Ray shows the next tile'); hud();
  }
  function roundTimer(secs) {
    R.stepTimerMax = R.stepTimerLeft = secs;
    R.stepTimer = true; $('gTimer').classList.remove('hide');
    const t0 = token, sq = R.seq;
    clearInterval(R.stepClock);
    R.stepClock = setInterval(() => {
      if (!R || t0 !== token || R.paused) return;
      if (R.phase !== 'input' || R.seq !== sq) { clearInterval(R.stepClock); return; }
      if (frozen()) { drawClock(); return; }
      R.stepTimerLeft = Math.max(0, R.stepTimerLeft - 0.1); drawClock();
      if (R.imp && R.stepTimerLeft <= 5 && Math.abs(R.stepTimerLeft - Math.round(R.stepTimerLeft)) < 0.05) SND.tick();
      if (R.stepTimerLeft <= 0) { clearInterval(R.stepClock); wrong(-1, 'TIME UP!'); }
    }, 100);
  }

  async function show() {
    const t = token; R.phase = 'show'; R.shows++; if (typeof BG !== 'undefined') BG.dim(true);
    clearFx(); dots(R.seq.length, 0); hud();
    const grow = R.stepIdx > 0 && !R.imp && !R.daily && R.seq.length > 1;
    msg(R.mode === 'rush' ? `WATCH · LAST ${R.ask} COUNT` : R.boss ? 'MEMORIZE FAST' : R.mode === 'negative' ? 'WATCH THE BLACK HOLE' : R.mode === 'chaos' ? 'IGNORE THE FAKES' : R.mode === 'eye' ? 'WATCH · THEY WILL HIDE' : 'WATCH', 'watch');
    const n = N();
    let dur, gap;
    if (R.imp) { dur = D.IMP.flash; gap = D.IMP.gap; }
    else {
      const base = D.MODE[R.mode].flash, twist = R.ev || R.daily ? 1 : D.speedFor(R.level);
      const evSp = R.ev && R.ev.speedAt ? R.ev.speedAt(R.level, R) : R.ev && R.ev.speed ? R.ev.speed : 1;
      dur = Math.round(base * (R.pure || R.dbeat || R.test ? 1 : R.adapt) * (R.boss ? D.BOSS_SPEED : 1) * evSp * twist);
      gap = Math.round(D.GAP * Math.max(0.8, R.pure || R.dbeat || R.test ? 1 : R.adapt));
    }
    const drng = R.pure ? mulberry(hash(R.seed, R.level, R.stepIdx, 'd', R.shows)) : Math.random;
    const last = R.seq.length - 1;
    const onBeat = SND.beat.on, bm = SND.beat.beatMs();
    /* v1.6: every tile flashes for the SAME time with the SAME gap (no fast replay of the old part).
       The new tile is only marked NEW. Rhythm Rush blinks on half beats on purpose. */
    const rush = R.mode === 'rush';
    if (rush) { dur = Math.round(Math.min(dur, 300)); gap = Math.round(Math.max(110, gap * 0.6)); }
    for (let k = 0; k < R.seq.length; k++) {
      const isNew = grow && k === last && !rush;
      let d0 = dur;
      if (onBeat) {
        const want = d0 + gap, div = rush ? 2 : (want < bm * 0.7 ? 2 : 1);
        if (k === 0) await sleep(250);
        if (t !== token) return;
        await sleep(SND.beat.untilNext(div));
        d0 = Math.min(d0, (div === 2 ? bm / 2 : bm) * 0.8);
      } else await sleep(k === 0 ? 300 : gap);
      if (t !== token) return;
      while (R.paused) { await sleep(120); if (t !== token) return; }
      const v = R.mode === 'twin' ? R.seq[k].map(P) : P(R.seq[k]);
      if (R.mode === 'twin') { lit(v, true); if (isNew) lit(v, true, 'newT'); SND.tile(v[0], d0 / 1000); SND.tile(v[1], d0 / 1000); }
      else if (R.mode === 'negative') { lit([...Array(n).keys()].filter(x => x !== v), true); lit([v], true, 'hole'); if (isNew) lit([v], true, 'newT'); SND.tile(v, d0 / 1000); }
      else { lit([v], true); if (isNew) lit([v], true, 'newT'); SND.tile(v, Math.max(0.12, d0 / 1000)); }
      if (R.mode === 'chaos' && R.seq.length > 2 && drng() < 0.55) {
        const d = (v + 1 + rndOf(drng, n - 1)) % n;
        setTimeout(() => { if (t !== token) return; lit([d], true, 'decoy'); SND.decoy(); setTimeout(() => lit([d], false, 'decoy'), d0 * 0.55); }, d0 * 0.3);
      }
      dots(R.seq.length, k + 1);
      await sleep(d0); if (t !== token) return;
      clearFx();
    }
    await sleep(260);
  }

  /* ---------- input ---------- */
  function tap(i) {
    if (!R || R.phase !== 'input' || R.paused) return;
    R.taps++; S.st.stats.taps++;
    const tEl = tiles()[i];
    if (R.mode === 'twin') {
      const pair = R.seq[R.input].map(P);
      if (pair.includes(i) && !R.got.includes(i)) {
        R.got.push(i); good(tEl, i);
        if (R.got.length === 2) { R.got = []; R.input++; dots(R.seq.length, R.input); if (R.input >= R.seq.length) stepDone(); }
      } else if (!R.got.includes(i)) wrong(i);
      return;
    }
    const exp = P(expAt(R.input));
    if (i === exp) {
      if (R.mode === 'eye') { tEl.classList.remove('eyeC'); tEl.classList.add('rev'); }
      good(tEl, i); R.input++; dots(need(), R.input);
      if (R.input >= need()) stepDone();
    } else wrong(i, null, exp);
  }

  function good(tEl, i) {
    if (typeof REC !== 'undefined' && REC.recording) REC.evt('tap', { i });
    R.correct++; S.st.stats.correct++; R.combo++; R.maxCombo = Math.max(R.maxCombo, R.combo);
    SND.tap(i); SND.vib(12);
    const hit = SND.beat.on && SND.beat.err(2) < 0.075;
    if (hit) R.rBeat = (R.rBeat || 0) + 1;
    tEl.classList.remove('ok', 'beatHit'); void tEl.offsetWidth; tEl.classList.add('ok'); if (hit) tEl.classList.add('beatHit');
    setTimeout(() => tEl.classList.remove('ok', 'beatHit'), 300);
    FX.tap(tEl, S.active('tap'), getComputedStyle(tEl).getPropertyValue('--c'));
    const c = D.combo(R.combo); if (R.combo === c.min && c.mult > 1) { SND.combo(R.combo); flyText(c.label, 'combo'); }
    if (R.combo > S.st.stats.bestCombo) { S.st.stats.bestCombo = R.combo; }
    S.quest('combo', R.combo, false);
    hud(); armXray();
  }

  async function stepDone() {
    const t = token; R.phase = 'wait'; clearInterval(R.stepClock); R.stepTimer = false;
    if (R.imp) { impCleared(); return; }
    if (R.ev && R.ev.timer) { /* keep main clock */ } else if (R.mode === 'speed' || (R.ev && R.ev.stepTimer)) $('gTimer').classList.add('hide');
    R.stepsDone++; clearTimeout(R.xrayT);
    if (R.seq.length >= (R.clipSeq ? R.clipSeq.length : 0) && R.mode !== 'twin') R.clipSeq = R.seq.slice();
    R.maxLen = Math.max(R.maxLen, R.seq.length);
    const cm = D.combo(R.combo).mult;
    const c = R.pure ? 0 : R.dbeat ? (R.dbeat.practice ? 0 : D.DBEAT.coins) : Math.round(D.coinsRound(R.seq.length, gridN) * cm * R.coinMul * (R.bonus ? 3 : 1) * (R.mode === 'zen' ? 0.5 : 1) * S.mult() * (R.ev && R.ev.coinMult ? R.ev.coinMult : 1));
    if (c) { earn(c); prizeFly(c); }
    /* v1.4 round grade: PERFECT (every tap on the beat) > GREAT (fast) > NICE */
    const L = R.seq.length, per = (Date.now() - (R.rT0 || Date.now())) / 1000 / Math.max(1, L);
    let grade = 'NICE!';
    if (L >= 3 && R.rBeat >= L) {
      grade = 'PERFECT!'; R.perfects = (R.perfects || 0) + 1; SND.perfect();
      const pb = R.pure ? 0 : Math.max(5, Math.round(c * 0.5)); if (pb) { earn(pb); flyText(`PERFECT RHYTHM +${pb}`, 'combo'); }
      else flyText('PERFECT RHYTHM', 'combo');
    } else if (per < 0.55 && L >= 3) { grade = 'GREAT!'; flyText('GREAT!', 'great'); }
    if (R.ladder && !R.pure) { const xp = Math.round(L * 3 * (R.xpMul || 1)); R.xp += xp; S.add('xp', xp); }
    SND.step(); msg(grade, 'ok'); dots(need(), need()); hud();
    if (R.ev && R.ev.onStep) { let r = R.ev.onStep(R); if (r && r.then) { r = await r; if (t !== token) return; } if (r === 'win') { finish(true); return; } }
    if (R.blitz) { R.level++; R.steps = D.levelSteps(R.level); R.stepIdx = 0; hud(); nextStep(true); return; }
    if (R.ladder) {
      if (R.chal && R.chal.role === 'play' && R.maxLen > R.chal.target) { FX.win(S.active('win')); await banner(`<div class="bnK">YOU BEAT IT</div><div class="bnT">${R.maxLen}</div><div class="bnS big">tiles · more than ${R.chal.target}!</div>`, 'win', 1700, 'shock'); finish(true); return; }
      R.stepIdx++;
      if (R.stepIdx % D.LADDER_LV === 0) {
        R.levelsDone++; R.level++; S.st.stats.levelsTotal++;
        if (R.ev && R.ev.onLevel) { const r = R.ev.onLevel(R); if (r === 'win') { FX.win(S.active('win')); finish(true); return; } }
        if (R.ev && R.ev.modeAt) { const m0 = R.mode; R.mode = R.ev.modeAt(R.level, R); R.evMode = R.mode !== 'classic'; $('game').dataset.gm = R.mode; R.adB = {}; if (R.mode !== m0) { hud(); await modeCard(R.mode, 'NEW MODE'); if (t !== token) return; } }
        R.adB = {};
      }
      if (R.stepIdx >= R.steps.length) { finish(true); return; }
      hud(); if (t !== token) return;
      await sleep(250); if (t !== token) return;
      nextStep(true); return;
    }
    R.stepIdx++;
    if (R.stepIdx >= R.steps.length) { await levelClear(); return; }
    hud(); if (t !== token) return;
    nextStep(true);
  }

  function earn(c) { R.coins += c; R.lvCoins = (R.lvCoins || 0) + c; S.add('coins', c); S.st.stats.earned += c; $('gCoins').textContent = R.coins.toLocaleString(); }
  function prizeFly(c) { const box = $('gCoinsBox'); box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop'); const f = document.createElement('em'); f.className = 'coinFly'; f.textContent = '+' + c; box.appendChild(f); setTimeout(() => f.remove(), 900); }

  async function levelClear() {
    if (typeof REC !== 'undefined' && REC.recording) REC.evt('clear', { lv: R.level, len: R.seq.length });
    const t = token; const lv = R.level, st = S.st;
    R.levelsDone++; st.stats.levelsTotal++; R.fails = 0; R.adapt = R.booster === 'slow' ? 1.3 : 1;
    if (R.lvWrong === 0) { R.perfectLv++; S.quest('perfect'); }
    const cm = D.combo(R.combo).mult;
    let coins = Math.round(D.coinsLevel(R.steps, gridN, lv) * cm * R.coinMul * (R.bonus ? 3 : 1) * (R.mode === 'zen' ? 0.5 : 1) * S.mult() * (R.ev && R.ev.coinMult ? R.ev.coinMult : 1));
    let xp = Math.round(D.xpLevel(R.steps, gridN) * R.xpMul);
    let extra = '';
    if (R.boss) {
      const bm = D.season().id === 'boss' ? 2 : 1;
      coins += D.BOSS_COINS * bm; st.stats.bosses++; S.quest('boss'); R.bossWins = (R.bossWins || 0) + 1;
      S.grant({ gems: 1 * bm }); extra = `<div class="bnR">${ART.gem(16)} +${bm} · Boss chest!</div>`;
      R.chest = !R.pure;
      R.passPts += S.passAdd('boss') * R.passMul;
    }
    if (D.season().id === 'gem' && Math.random() < 0.25 && !R.pure) { S.grant({ gems: 1 }); extra += `<div class="bnR">${ART.gem(16)} Diamond Rain +1</div>`; }
    earn(coins); R.xp += xp; S.add('xp', xp);
    R.passPts += S.passAdd('level') * R.passMul;
    if (!st.stats.modesCleared.includes(R.mode)) st.stats.modesCleared.push(R.mode);
    S.quest('levels'); S.quest('mode:' + R.mode);
    // persist progress
    if (!R.ev && !R.daily && !R.blitz && !R.pure) {
      st.modeLv[R.baseMode] = lv + 1; st.bestLv[R.baseMode] = Math.max(st.bestLv[R.baseMode] || 0, lv + 1);
      const newModes = D.MODES.filter(m => m.unlock === lv + 1 && m.id !== R.baseMode);
      if (newModes.length) setTimeout(() => UI.toast(`New mode unlocked: ${newModes.map(m => m.name).join(', ')}`, 'sparkle'), 1800);
    }
    st.ads.clears++; S.save(); S.checkAch();
    SND.beat.fill(); SND.crash(); SND.level(); SND.vib([20, 40, 30]);
    if (R.daily) { finish(true); return; }
    if (R.ev && R.ev.onLevel) { const r = R.ev.onLevel(R); if (r === 'win') { FX.win(S.active('win')); finish(true); return; } }
    /* v1.4 mystery card: a small surprise on ~30% of level clears (variable reward, no extra screen) */
    if (!R.pure && !R.ev && !R.daily && Math.random() < 0.3) {
      const roll = Math.random(), m = roll < 0.45 ? { coins: 40 + Math.floor(Math.random() * 8) * 20 } : roll < 0.8 ? { boost: D.BOOST_ACTIVE[Math.floor(Math.random() * D.BOOST_ACTIVE.length)] } : roll < 0.95 ? { gems: 1 } : { shields: 1 };
      S.grant(m); if (m.coins) { R.coins += m.coins; R.lvCoins += m.coins; }
      extra += `<div class="bnR myst">${ART.ic('gift')} Mystery card: ${m.coins ? `+${m.coins} coins` : m.boost ? `+1 ${D.BOOST[m.boost].name}` : m.gems ? '+1 gem' : '+1 shield'}</div>`;
    }
    const ms = D.MILESTONES[R.levelsDone];
    /* v1.8: run milestones pay only on a NEW personal-best run (not again on every short run) */
    if (ms && !R.pure && !R.ev && !R.daily && R.levelsDone > (st.stats.bestRun || 0)) { earn(ms); extra += `<div class="bnR">${ART.coin(16)} New best run · +${ms}</div>`; }
    const nearPB = !R.ev && st.stats.bestRun > 0 && R.levelsDone >= st.stats.bestRun - 1 && R.levelsDone <= st.stats.bestRun + 1;
    if (R.levelsDone > st.stats.bestRun && st.stats.bestRun > 0 && !R.pbShown && !R.ev && !R.pure) { R.pbShown = true; extra += `<div class="bnR pb">NEW RECORD RUN!</div>`; }
    else if (nearPB && R.levelsDone === st.stats.bestRun) extra += `<div class="bnR pb">Matching your best run</div>`;
    FX.win(S.active('win'));
    const nb = D.levelLen(lv + 1) > D.levelLen(lv) ? `<div class="bnR pb">Next level: ${D.levelLen(lv + 1)} tiles</div>` : D.gridFor(lv + 1) !== D.gridFor(lv) ? `<div class="bnR">Next: ${D.gridFor(lv + 1)}×${D.gridFor(lv + 1)} grid</div>` : '';
    const tt = R.boss ? pick(D.SANX.win) : (R.taunt && R.taunt.txt) || (Math.random() < 0.5 ? pick(D.SANX.home) : '');
    R.taunt = null;
    await banner(`<div class="bnK">LEVEL CLEAR</div><div class="bnT">${lv}</div><div class="bnR">${ART.coin(16)} +${coins.toLocaleString()} &nbsp; <span class="xpT">+${xp} XP</span></div>${extra}${nb}${tt ? `<div class="bnTaunt">"${tt}"</div>` : ''}`, R.boss ? 'bossWin' : 'win', R.boss ? 2000 : 1500, tt ? (R.boss ? 'shock' : 'smug') : null);
    if (t !== token) return;
    if (R.chest) {
      R.chest = false;
      await midRun(async () => { await UI.chest('bronze', true, 'Boss reward'); return UI.bossExtraChest(); });
      if (t !== token) return;
    }
    // Lucky Box every 4th clear (normal runs)
    if (!R.ev && !R.pure && !R.daily && R.levelsDone % R.luckyEvery === 0) {
      await midRun(() => UI.lucky(lv)); if (t !== token) return;
    }
    await refillOffer(); if (t !== token) return;
    // natural break: interstitial (rules inside ADS). never inside challenges
    if (!R.pure && !(R.ev && /^ch_/.test(R.ev.id))) { await midRun(() => ADS.inter('level')); if (t !== token) return; }
    R.level++; beginLevel(false);
  }

  function wrong(i, why, exp) {
    if (typeof REC !== 'undefined' && REC.recording) REC.evt('wrong', { i: i == null ? -1 : i });
    if (R.phase !== 'input') return;
    const t = token;
    clearInterval(R.stepClock); clearTimeout(R.xrayT);
    if (R.comboKeep > 0 && R.combo > 0) { R.comboKeep--; info('Combo Keeper saved your combo'); } else R.combo = 0;
    R.lvWrong++;
    if (i >= 0) { const el = tiles()[i]; el.classList.remove('eyeC'); el.classList.add('bad'); setTimeout(() => el.classList.remove('bad'), 420); }
    if (exp != null && R.imp) { const el = tiles()[exp]; el.classList.add('hintT'); setTimeout(() => el.classList.remove('hintT'), 900); }
    SND.wrong(); SND.vib([60, 40, 60]); SND.beat.drop();
    $('gBoardWrap').classList.remove('shake'); void $('gBoardWrap').offsetWidth; $('gBoardWrap').classList.add('shake');
    if (R.mode === 'zen') { // hint and keep going
      if (exp != null) { const el = tiles()[exp]; el.classList.add('hintT'); setTimeout(() => el.classList.remove('hintT'), 900); }
      msg('TRY THAT ONE', 'bad'); hud(); return;
    }
    R.phase = 'wait'; hud();
    if (R.imp) { msg(why || 'WRONG!', 'bad'); setTimeout(() => { if (t === token) impFail(); }, 800); return; }
    if (R.blitz || (R.ev && R.ev.timePenalty)) { R.timeLeft = Math.max(0, R.timeLeft - 3); flyText('−3s', 'bad'); msg('−3 SECONDS', 'bad'); hud(); setTimeout(() => { if (t === token && R.timeLeft > 0) nextStep(false); }, 500); return; }
    if (R.ev && R.ev.onWrong) R.ev.onWrong(R);
    /* v1.6: the first mistake on a twist / new mode is free and tells you why */
    const special = R.twist || (R.evMode && R.mode !== 'classic' ? R.mode : null);
    if (special && !R.pure && !R.dbeat && !(S.st.twistFree || {})[R.mode]) {
      S.st.twistFree = S.st.twistFree || {}; S.st.twistFree[R.mode] = 1; S.save();
      msg(`${D.MODE[R.mode].name.toUpperCase()}! ${D.MODE[R.mode].tag.toUpperCase()}`, 'bad'); info('Free mistake · no heart lost'); hud();
      setTimeout(() => { if (t === token) nextStep(false); }, 1500); return;
    }
    if (R.secondLeft > 0) { R.secondLeft--; msg('2ND CHANCE · NO HEART LOST', 'ok'); hud(); setTimeout(() => { if (t === token) nextStep(false); }, 900); return; }
    if (BOOST_ON() && !R.adB.second && R.hearts > 1 && !R.noHearts && !(R.ev && R.ev.noRevive)) {
      R.adB.second = 1; msg(why || 'WRONG!', 'bad');
      setTimeout(async () => {
        if (t !== token) return;
        const v = await secondOffer(); if (t !== token || !R) return;
        if (v === 'ok') { msg('2ND CHANCE · NO HEART LOST', 'ok'); hud(); setTimeout(() => { if (t === token) nextStep(false); }, 500); }
        else loseHeart(why);
      }, 550);
      return;
    }
    loseHeart(why);
  }
  function loseHeart(why) {
    const t = token;
    R.hearts--; R.fails++;
    if (R.fails >= 2 && !R.pure && !R.dbeat && !R.test) R.adapt = Math.min(1.45, R.adapt * 1.1);   // invisible mercy (not in challenges)
    msg(why || 'WRONG!', 'bad'); hud();
    if (R.hearts <= 0) {
      if (R.shieldAuto) { R.shieldAuto = false; R.hearts = R.maxHearts; hud(); msg('SHIELD SAVED YOU', 'ok'); setTimeout(() => { if (t === token) nextStep(false); }, 900); return; }
      setTimeout(() => { if (t === token) gameOver(); }, 650);
      return;
    }
    if (Math.random() < 0.6) say(pick(D.SANX.lose), 'laugh');
    setTimeout(() => { if (t === token) nextStep(false); }, 800);
  }

  /* Skip Level booster: counts as cleared, no coins for that level */
  function skipLevel() {
    if (!R || !(R.skipLeft > 0) || R.ladder || R.ev || R.phase !== 'input') return;
    R.skipLeft--; R.phase = 'wait'; clearInterval(R.stepClock); clearTimeout(R.xrayT); clearFx(); tiles().forEach(x => x.classList.remove('dark'));
    const t = token, st = S.st;
    if (!R.daily && !R.blitz && !R.pure) { st.modeLv[R.baseMode] = R.level + 1; st.bestLv[R.baseMode] = Math.max(st.bestLv[R.baseMode] || 0, R.level + 1); S.save(); }
    R.levelsDone++;
    banner(`<div class="bnK">LEVEL SKIPPED</div><div class="bnT">${R.level}</div><div class="bnS">On to level ${R.level + 1}</div>`, 'intro', 1200).then(() => { if (t !== token) return; R.level++; beginLevel(false); });
  }

  function timeUp() { if (!R || R.ended) return; R.phase = 'wait'; clearFx(); R.showTimeAd = false; if (R.ev && R.ev.onTimeUp) { R.ev.onTimeUp(R); } finish(R.blitz || (R.ev && R.ev.timeWin) ? true : false, 'time'); }

  function useHint() {
    if (!R || R.hintLeft <= 0 || R.phase !== 'input') return;
    R.hintLeft--; hud();
    replayPattern();
  }
  /* replay the whole pattern; keep = continue from the tile the player was on */
  function replayPattern(keep) {
    R.phase = 'wait'; const t = token; clearInterval(R.stepClock);
    tiles().forEach(x => x.classList.remove('dark'));
    show().then(() => {
      if (t !== token) return;
      startInput();
      if (keep > 0 && R.mode !== 'twin') { R.input = keep; dots(need(), keep); info(`Continue from tile ${keep + 1}`); }
    });
  }
  /* v1.7 REPLAY booster (rewarded): normal game 1 per level, IMPOSSIBLE 100 up to 10 per run */
  async function adReplay(imp) {
    if (!R || R.phase !== 'input') return;
    if (imp ? R.imp.rep >= D.IMP.replays : R.adB.replay) return;
    const keep = R.input;
    R.phase = 'wait'; clearInterval(R.stepClock); clearTimeout(R.xrayT);
    let ok = false;
    const go = await midRun(async () => { ok = await ADS.rewarded('replay'); return ok; });
    if (!go || !R) return;
    if (!ok) { info('Ad not ready. Try again'); startInput(); R.input = keep; dots(need(), keep); return; }
    if (imp) R.imp.rep++; else R.adB.replay = 1;
    R.replays++; hud(); replayPattern(keep);
  }
  /* v1.7 2nd Chance after a wrong tap: watch an ad, keep the heart, the round replays */
  function secondOffer() {
    const t = token; R.paused = true; SND.beat.pause();
    return new Promise(res => {
      const c = $('gCard');
      c.innerHTML = `<div class="gcIn sc"><div class="gcK">WRONG TILE</div><div class="gcT">${ART.ic('refresh')} 2ND CHANCE?</div><div class="gcTx">Keep your heart. The pattern plays again.</div><div class="scBar"><i></i></div><button class="btn big pulse" id="scAd">${ART.ic('ad')} WATCH AD</button><button class="btn ghost" id="scNo">No, lose a heart</button></div>`;
      c.className = 'gCard show';
      let done = false;
      const end = v => { if (done) return; done = true; clearTimeout(tm); c.className = 'gCard hide'; c.innerHTML = ''; res(v); };
      const tm = setTimeout(() => end(false), 6000);
      $('scNo').onclick = () => end(false);
      $('scAd').onclick = async () => {
        if (done) return; done = true; clearTimeout(tm); c.className = 'gCard hide'; c.innerHTML = '';
        let ok = false;
        await midRun(async () => { ok = await ADS.rewarded('second'); return ok; });
        res(t === token && ok ? 'ok' : false);
      };
    }).then(v => { if (t === token && R && v !== 'ok') { R.paused = false; SND.beat.resume(); } return v; });
  }
  /* rewarded: +30 seconds (Beat the Sanx) */
  async function adTime() {
    if (!R || R.timeAdUsed) return;
    R.showTimeAd = false; hud();
    const phase = R.phase; let ok = false;
    const go = await midRun(async () => { ok = await ADS.rewarded('time'); return ok; });
    if (!go) return;
    if (ok) { R.timeAdUsed = true; S.useCap('bts30'); R.timeLeft += 30; R.timeMax = Math.max(R.timeMax, R.timeLeft); drawClock(); flyText('+30s', 'combo'); }
    if (phase === 'input' && R.phase === 'input') { /* keep going */ }
  }

  /* ================= IMPOSSIBLE 100 ================= */
  async function impRound(first) {
    const t = token, I = R.imp;
    if (first) { const rng = Math.random, nn = I.grid * I.grid; I.seq = []; for (let k = 0; k < I.target; k++) { let v = rndOf(rng, nn); if (k && v === I.seq[k - 1] && rng() < 0.6) v = rndOf(rng, 9); I.seq.push(v); } }
    R.seq = I.seq.slice(0, I.len); R.steps = [I.len]; R.stepIdx = 0;
    setWorld(); hud();
    await sleep(first ? 300 : 500); if (t !== token) return;
    await show(); if (t !== token) return;
    startInput();
  }
  async function impCleared() {
    const t = token, I = R.imp;
    I.cleared = I.len; R.stepsDone++;
    SND.step(); msg(I.len === I.target ? 'IMPOSSIBLE!' : 'NICE!', 'ok'); $('gTimer').classList.add('hide');
    if (I.len >= I.target) { FX.win(S.active('win')); SND.win(); await banner(`<div class="bnK">YOU DID IT</div><div class="bnT">${I.target}</div><div class="bnS big">tiles from memory</div>`, 'win', 2000, 'shock'); finish(true, 'imp'); return; }
    if (I.len % D.IMP.checkpointEvery === 0) {
      await midRun(async () => { const r = await UI.impCheckpoint(I.len); if (r) { I.cp = I.len; hud(); } return r; });
      if (t !== token) return;
    } else await sleep(350);
    I.len++; impRound(false);
  }
  async function impFail() {
    const t = token, I = R.imp;
    R.paused = true; SND.beat.pause();
    const keep = R.input;
    const choice = await UI.impFail({ len: I.len, at: keep + 1, cleared: I.cleared, target: I.target, repLeft: D.IMP.replays - I.rep, cp: I.cp, grid: I.grid });
    if (t !== token) return;
    R.paused = false; UI.show('game'); if (choice !== 'end') SND.beat.resume();
    if (choice === 'rep') { I.rep++; R.replays++; hud(); await countdown(); if (t !== token) return; replayPattern(keep); return; }
    if (choice === 'cp') { I.len = I.cp; I.cp = 0; hud(); await countdown(); if (t !== token) return; impRound(false); return; }
    finish(false, 'imp');
  }

  /* ---------- end of run ---------- */
  function result(won, why) {
    return {
      clip: R.clipSeq && R.clipSeq.length >= 2 ? { seq: R.clipSeq, grid: gridN, colors: skinNow().colors.slice() } : null,
      mode: R.ev ? R.mode : R.baseMode, ev: R.ev, test: R.test, dbeat: R.dbeat, newBest: R.newMem || false, daily: !!R.daily, chal: R.chal, imp: R.imp, won, why, levels: R.levelsDone, steps: R.stepsDone, tiles: R.maxLen, ladder: !!R.ladder, coins: R.coins, xp: R.xp, boosts: R.boosts,
      maxCombo: R.maxCombo, correct: R.correct, taps: R.taps, perfect: R.perfectLv, level: R.level, startLevel: R.startLevel,
      time: (Date.now() - R.startT) / 1000, prestige: S.st.prestige, passPts: R.passPts
    };
  }
  function stopAll() { clearInterval(R && R.timer); clearInterval(R && R.stepClock); }

  function gameOver() {
    if (!R || R.ended) return;
    if (R.pure || R.dbeat || (R.ev && R.ev.noRevive)) { SND.beat.stop(true); finish(false, 'hearts'); return; }
    R.phase = 'over'; clearFx(); tiles().forEach(x => x.classList.remove('dark'));
    SND.beat.stop(true);
    const st = S.st;
    /* v1.4 near-miss: tell the player exactly how close they were (always the truth) */
    let near = '';
    const bestT = Math.max(...(st.skill || [0]), (S.passTouch().bestTiles || 0));
    if (R.ladder && bestT > 0 && R.maxLen >= bestT - 1 && R.maxLen < bestT) near = `Only ${bestT - R.maxLen} tile from your best (${bestT})!`;
    else if (R.ladder && R.chal && R.chal.role === 'play') near = `${R.chal.target + 1 - R.maxLen} more tile${R.chal.target + 1 - R.maxLen > 1 ? 's' : ''} would have won it`;
    else if (!R.ladder && R.steps.length && R.stepIdx > 0) near = R.stepIdx === R.steps.length - 1 ? `So close! Last round of Level ${R.level}` : `${R.stepIdx} of ${R.steps.length} rounds done on Level ${R.level}`;
    if (R.twist || (R.evMode && R.mode !== 'classic')) near = `This was a ${D.MODE[R.mode].name.toUpperCase()} level: ${D.MODE[R.mode].tag}.` + (near ? ' ' + near : '');
    const nearPB = !R.ev && st.stats.bestRun > 0 && R.levelsDone >= st.stats.bestRun - 1 && R.levelsDone < st.stats.bestRun;
    say(nearPB ? pick(D.SANX.near) : pick(D.SANX.lose), 'laugh');
    SND.lose();
    const maxAd = R.ev && R.ev.maxAdRevive != null ? R.ev.maxAdRevive : D.ADCAP.contAd;
    UI.gameOver({
      levels: R.levelsDone, coins: R.coins, level: R.level, mode: R.baseMode, nearPB, near, best: st.stats.bestRun, label: R.ladder ? `${R.maxLen} tiles` : `Level ${R.level}`,
      canShield: st.shields > 0 && !(R.ev && (R.ev.noRevive || R.ev.adOnly)),
      canAd: R.adContinues < maxAd && !(R.ev && R.ev.noRevive),
      adN: R.adContinues, adMax: maxAd,
      canDouble: !R.doubled && R.coins >= 30 && !R.ev,
      ev: R.ev
    });
  }
  async function revive(how) {
    if (!R) return;
    if (how === 'shield') { if (!S.spend('shields', 1)) return; }
    if (how === 'ad') R.adContinues++;
    R.revived++; R.hearts = R.ev && R.ev.reviveHearts ? R.ev.reviveHearts : R.maxHearts; R.fails = 0; R.adapt = Math.min(1.35, R.adapt * 1.05);
    UI.show('game'); hud(); groove(R.boss ? 'hype' : 'full');
    const t = token;
    if (how === 'ad') { await countdown(); if (t !== token) return; nextStep(false); return; }
    setTimeout(() => { if (t === token) nextStep(false); }, 600);
  }
  function doubleCoins() { if (!R || R.doubled) return 0; R.doubled = true; const b = R.coins; S.add('coins', b); R.coins += b; return b; }

  function finish(won, why) {
    if (!R || R.ended) return;
    R.ended = true; stopAll(); R.phase = 'over'; token++; SND.beat.stop(why !== 'quit');
    $('gCount').classList.add('hide');
    const st = S.st;
    if (R.ladder && R.maxLen) R.newMem = S.memAdd(R.maxLen, R.dbeat ? 'daily' : R.test ? 'test' : R.chal ? 'duel' : 'event');
    const res = result(won, why); lastResult = res;
    /* v1.8 rating popup: only after a happy run (event/daily/IMPOSSIBLE win, new best run, boss beaten, new memory best) */
    const happy = (won && (R.ev || R.imp || R.daily || R.dbeat)) || (!R.ev && !R.daily && !R.pure && !R.imp && R.levelsDone > st.stats.bestRun && st.stats.bestRun > 0) || R.bossWins > 0 || R.newMem;
    if (happy && !R.chal && typeof RATE !== 'undefined') RATE.maybe(R.ev ? 'event' : R.imp ? 'imp' : 'run');
    if (typeof REC !== 'undefined' && REC.recording) REC.end(res);
    st.stats.runs++; st.ads.runs++;
    if (!R.ev && !R.daily && !R.pure && !R.imp && R.levelsDone > st.stats.bestRun) st.stats.bestRun = R.levelsDone;
    if (R.blitz) { st.blitzBest = Math.max(st.blitzBest || 0, R.stepsDone); }
    if (R.ladder && !R.chal && R.maxLen) { st.skill = (st.skill || []).concat([R.maxLen]).slice(-10); }
    if (R.maxLen) { const p = S.passTouch(); p.bestTiles = Math.max(p.bestTiles || 0, R.maxLen); }
    S.save(); S.checkAch();
    const ev = R.ev, daily = R.daily;
    if (R.imp) { UI.impEnd(res); return; }
    if (R.dbeat) { UI.dbeatEnd(res); return; }
    if (R.test) { UI.testEnd(res); return; }
    if (R.chal) { CH.onEnd(res); return; }
    if (ev && ev.onEnd) { ev.onEnd(res); return; }
    if (daily) { UI.dailyEnd(res); return; }
    UI.runEnd(res);
  }
  function endFromOver() { finish(false, 'hearts'); }

  function pause() {
    if (!R || R.ended) return;
    R.paused = true; SND.beat.pause();
    UI.pause(() => { R.paused = false; SND.beat.resume(); }, () => { if (R.phase === 'show' || R.phase === 'wait') token++; finish(false, 'quit'); }, R.pure);
  }

  function flyText(t, cls) {
    const f = document.createElement('div'); f.className = 'fly ' + cls; f.textContent = t;
    $('game').appendChild(f); setTimeout(() => f.remove(), 1100);
  }
  function banner(html, cls, ms, mood) {
    return new Promise(res => {
      const b = $('gBanner');
      b.innerHTML = (mood ? `<div class="bnFace">${ART.sanx(mood)}</div>` : '') + html;
      b.className = 'gBanner show ' + cls;
      setTimeout(() => { b.className = 'gBanner hide'; res(); }, ms);
    });
  }
  const pick = a => a[rnd(a.length)];

  let lastResult = null;
  return { build, start, revive, doubleCoins, endFromOver, say, info, paintSkin, hash, mulberry, tileOf: v => P(v), pauseFor: fn => midRun(fn), get run() { return R; }, get last() { return lastResult; }, quitSilently() { token++; SND.beat.stop(); if (typeof REC !== 'undefined' && REC.recording) REC.disarm(); if (R) { stopAll(); R.ended = true; } } };
})();

/* ================= BEAT SANX — screens & UI ================= */
'use strict';
const UI = (() => {
  const $ = id => document.getElementById(id);
  const fmt = n => Math.round(n).toLocaleString('en-IN');
  const h = (strs, ...v) => strs.reduce((a, s, i) => a + s + (i < v.length ? v[i] : ''), '');
  let cur = 'home', selMode = null, selBoosts = [], freeBoost = null;

  /* ---------- core screen switching ---------- */
  /* v1.4 WEB: the browser version (shared links) = Daily Beat + Memory Test + "get the app" */
  const WEB = !!window.BS_WEB;
  const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.sanxgraphikians.beatsanx&referrer=utm_source%3Dweb_daily';
  const getApp = (t = 'GET THE FREE APP') => `<a class="btn ${WEB ? 'alt' : 'hide'} getApp" href="${PLAY_URL}" target="_blank" rel="noopener">${ART.ic('play')} ${t}</a>`;
  function renderWeb() {
    const db = S.dbeatToday(), sx = D.sanxScore(db.no), mb = S.memBest(), rk = D.memRank(mb);
    $('home').innerHTML = h`<div class="web">
      <div class="hero sm"><div class="heroBg"></div><div class="heroSanx">${ART.sanx('smug')}</div>
      <div class="heroBubble">${db.done ? `You ${db.score} · me ${sx}. Tomorrow again!` : D.SANX.daily[db.no % D.SANX.daily.length].replace('{s}', sx)}</div>
      <img class="heroLogo" src="img/logo.png" alt="Beat Sanx"></div>
      <div class="webK">How many tiles can you remember?</div>
      <button class="dbCard big ${db.done ? 'done' : ''}" data-act="dbeat"><span class="dbK">DAILY BEAT #${db.no} · SAME PATTERN FOR THE WHOLE WORLD</span>
        ${db.done ? `<b class="dbScore">${db.score}<i>vs</i>${sx}</b><small>${ART.ic('share')} Share your grid</small>` : `<b class="dbScore">${sx}<i>tiles · Sanx today</i></b><small>${ART.ic('play')} PLAY NOW · one try</small>`}</button>
      <button class="msCard big" data-act="test"><span class="dbK">MEMORY TEST · UNLIMITED</span><b class="msN">${mb || '?'}</b><small>${mb ? rk.name : 'Find your Memory Score'}</small><span class="msGo">${ART.ic('brain')} TEST</span></button>
      <div class="webApp"><b>Want more?</b><span>500+ levels · duels with friends · live events · 100 avatars</span>${getApp('GET BEAT SANX FREE')}</div>
    </div>`;
  }
  /* v1.4: 3 tabs. Compete = Events + Challenges/Duels, Me = Profile + Shop (segment bar on top) */
  const GROUP = { home: 'home', events: 'compete', chall: 'compete', shop: 'me', profile: 'me' };
  const SEGS = { compete: [['events', 'trophy', 'Events', 'events'], ['chall', 'swords', 'Duels & Challenges', 'duel']], me: [['profile', 'user', 'Profile'], ['shop', 'cart', 'Shop']] };
  let lastSub = { compete: 'events', me: 'profile' };
  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === id));
    cur = id;
    const tab = ['home', 'chall', 'events', 'shop', 'profile'].includes(id);
    $('nav').classList.toggle('hide', !tab || WEB);
    document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.go === id));
    document.body.dataset.scr = id;
    if (tab) { render(id); navLocks(); ADS.banner(id !== 'home'); SND.music(true); setTimeout(avUnlockCheck, 1200); }
  }
  function segBar(id) {
    const g = GROUP[id]; if (!SEGS[g]) return; lastSub[g] = id;
    const scr = $(id), tb = scr.querySelector('.topbar'); if (!tb || scr.querySelector('.segBar')) return;
    tb.insertAdjacentHTML('afterend', `<div class="segBar">${SEGS[g].map(([sid, ic, t, f]) => { const lock = f && !S.feat(f); return `<button class="${sid === id ? 'on' : ''} ${lock ? 'locked' : ''}" data-act="${lock ? 'locked:' + f : 'seg:' + sid}">${ART.ic(lock ? 'lock' : ic)}<span>${t}</span>${lock ? `<small>Lv ${D.UNLOCK[f].lv}</small>` : ''}</button>`; }).join('')}</div>`);
  }
  function goGroup(g) {
    if (g === 'home') return show('home');
    if (g === 'compete') { if (!S.feat('duel')) return lockedToast('duel'); const t = lastSub.compete === 'events' && !S.feat('events') ? 'chall' : lastSub.compete; return show(t); }
    if (g === 'me') { if (lastSub.me === 'shop') SHOP.tab('home'); return show(lastSub.me); }
  }
  function navLocks() { const b = document.querySelector('#nav [data-go=events]'); if (b) b.classList.toggle('lockedNav', !S.feat('events')); }
  function lockedToast(id) { const u = D.UNLOCK[id]; toast(`${u.name} unlocks at Level ${u.lv} · keep playing!`, 'lock'); }
  /* announce features that just opened */
  function announceUnlocks() {
    const n = S.newUnlocks(); if (!n.length) return;
    const u = D.UNLOCK[n[0]];
    setTimeout(() => modal(h`<div class="rwRays"></div><div class="unlIc">${ART.ic(u.icon)}</div><div class="mdK">New unlocked</div><div class="mdT">${u.name}</div><div class="mdS">${n.length > 1 ? `+ ${n.slice(1).map(k => D.UNLOCK[k].name).join(', ')}` : 'Something new to play. Go check it out!'}</div><button class="btn big pulse" data-act="unlGo:${n[0]}">${ART.ic('play')} OPEN</button><button class="btn ghost" data-act="closeModal">Later</button>`, 'rw'), 500);
    SND.win();
  }
  function render(id) { ({ home: renderHome, chall: renderChall, events: () => EV.renderHub(), shop: () => SHOP.render(), profile: renderProfile })[id](); }
  function topbar() {
    const st = S.st, r = D.rank(st.xp);
    return h`<div class="topbar">
      <button class="rankChip" data-act="profile"><span class="rcAv">${ART.me(S.active('frame'))}</span><span class="rcTx"><b>${esc(st.name)}</b><small>${r.name}${st.prestige ? ' · ' + D.ROMAN[Math.min(10, st.prestige)] : ''}</small></span></button>
      <div class="curs">
        <button class="cur" data-act="shop">${ART.coin(18)}<b>${short(st.coins)}</b></button>
        <button class="cur" data-act="shop:gems">${ART.gem(18)}<b>${short(st.gems)}</b></button>
        <button class="cur" data-act="shop:boost">${ART.shieldC(18)}<b>${st.shields}</b></button>
      </div></div>`;
  }
  const short = n => n >= 1e7 ? (n / 1e7).toFixed(n >= 1e8 ? 0 : 1) + 'Cr' : n >= 1e5 ? (n / 1e5).toFixed(n >= 1e6 ? 0 : 1) + 'L' : fmt(n);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- HOME ---------- */
  function renderHome() {
    if (WEB) return renderWeb();
    const st = S.st;
    if (!selMode || !S.unlocked(selMode)) selMode = st.lastMode && S.unlocked(st.lastMode) ? st.lastMode : 'classic';
    const m = D.MODE[selMode], lv = S.lv(selMode), se = D.season();
    const qDone = st.quests.list.filter(q => q.done && !q.claimed).length;
    const spinRdy = st.spin.free > 0;
    const line = D.SANX.home[Math.floor(Date.now() / 9000) % D.SANX.home.length];
    const live = EV.heroInfo();
    const pass = S.passTouch(), ptier = S.passTier(), pReady = Array.from({ length: ptier }, (_, i) => i).filter(i => !pass.got.includes(i)).length;
    const chalN = CH.pendingCount();
    const evL = !S.feat('events'), impL = !S.feat('imp'), duL = !S.feat('duel');
    const lk = id => `<span class="lkTag">${ART.ic('lock')} LEVEL ${D.UNLOCK[id].lv}</span>`;
    const lockQ = (id, act, ic, t, sub, dot) => S.feat(id) ? qa(act, ic, t, sub, dot) : `<button class="qa locked" data-act="locked:${id}">${ART.ic('lock')}<b>${t}</b><small>Lv ${D.UNLOCK[id].lv}</small></button>`;
    $('home').innerHTML = h`${topbar()}
    <div class="hero">
      <div class="heroBg"></div>
      <div class="heroSanx">${ART.sanx('smug')}</div>
      <div class="heroBubble">${line}</div>
      <img class="heroLogo" src="img/logo.png" alt="Beat Sanx">
      <button class="season" data-act="season">${ART.ic(se.icon)}<span><b>${se.name}</b> · ${se.desc}</span><em>${left(se.end)}</em></button>
    </div>
    <button class="liveCard th-${live.id} ${evL ? 'locked' : ''}" data-act="${evL ? 'locked:events' : live.act}" style="--la:${live.c1};--lb:${live.c2}">
      <span class="lvRib ${evL ? 'lock' : live.rib.cls}">${evL ? `${ART.ic('lock')} LEVEL ${D.UNLOCK.events.lv}` : live.rib.t}</span>
      <span class="lvIc">${ART.ic(live.icon)}</span>
      <span class="lvTx"><small>${live.k}</small><b>${live.name}</b><em>${evL ? 'Events unlock at Level ' + D.UNLOCK.events.lv + ' · keep playing!' : live.sub}</em></span>
      <span class="lvGo">${ART.ic(evL ? 'lock' : 'play')}</span>
    </button>
    <div class="featRow">
      <button class="feat impF ${impL ? 'locked' : ''}" data-act="${impL ? 'locked:imp' : 'imp'}">${impL ? lk('imp') : '<span class="ftK">CHALLENGE</span>'}<b>IMPOSSIBLE <i>100</i></b><small>${st.imp.best ? 'Your best: ' + st.imp.best + ' tiles' : 'How much can you remember?'}</small>${ART.ic('brain', 'ftIc')}</button>
      <button class="feat chF ${duL ? 'locked' : ''}" data-act="${duL ? 'locked:duel' : 'chal'}">${chalN && !duL ? `<i class="dot"></i>` : ''}${duL ? lk('duel') : `<span class="ftK">${chalN ? chalN + ' WAITING' : '2× COINS'}</span>`}<b>DUEL A FRIEND</b><small>Same pattern. Winner takes 2×</small>${ART.ic('swords', 'ftIc')}</button>
    </div>
    <div class="playZone">
      <button class="modePick" data-act="modes">
        <span class="mpIc">${ART.ic(m.icon)}</span>
        <span class="mpTx"><small>MODE · TAP TO CHANGE</small><b>${m.name}</b></span>
        <span class="mpLv">${selMode === 'blitz' ? 'Best ' + (st.blitzBest || 0) : 'Lv ' + lv}</span>
        ${ART.ic('next', 'mpArr')}
      </button>
      <button class="playBtn" data-act="ready"><span>${ART.ic('play')}PLAY</span><small>${selMode === 'blitz' ? '90 second race' : `Level ${lv} · ${D.levelLen(lv)} tiles · ${D.gridFor(lv)}×${D.gridFor(lv)}`}</small></button>
    </div>
    <div class="quick">
      ${lockQ('quests', 'quests', 'flag', 'Quests', `${st.quests.list.filter(q => q.claimed).length}/3`, qDone > 0)}
      ${lockQ('spin', 'spin', 'sparkle', 'Spin', spinRdy ? 'Free' : 'Ad', spinRdy)}
      ${lockQ('pass', 'pass', 'ticket', 'Pass', `Tier ${ptier}`, pReady > 0)}
      ${qa('rank', 'bars', 'Ranking', 'Weekly', !!pendingLB())}
      ${qa('chests', 'gift', 'Chests', 'Loot', false)}
    </div>`;
  }
  /* the next feature that will open (anticipation) */
  function nextUnlockStrip() {
    const b = S.best(), n = Object.entries(D.UNLOCK).find(([k, u]) => b < u.lv);
    if (!n) return '';
    const [k, u] = n, prev = Object.values(D.UNLOCK).filter(x => x.lv <= b).reduce((a, x) => Math.max(a, x.lv), 1);
    return `<div class="nextUnl">${ART.ic(u.icon)}<span><b>${u.name}</b><small>unlocks at Level ${u.lv}</small></span><div class="bar"><i style="width:${Math.min(100, (b - prev) / Math.max(1, u.lv - prev) * 100)}%"></i></div></div>`;
  }
  const qa = (act, ic, t, s, dot) => `<button class="qa" data-act="${act}">${dot ? '<i class="dot"></i>' : ''}${ART.ic(ic)}<b>${t}</b><small>${s}</small></button>`;
  function left(end) { const d = end - Date.now(); if (d <= 0) return 'now'; const dd = Math.floor(d / 864e5), hh = Math.floor(d % 864e5 / 36e5), mm = Math.floor(d % 36e5 / 6e4); return dd > 0 ? `${dd}d ${hh}h` : hh > 0 ? `${hh}h ${mm}m` : `${mm}m`; }

  /* ---------- MODE SHEET → READY SCREEN ---------- */
  const MODE_RULES = {
    classic: ['Watch the tiles light up', 'Tap them in the same order', 'Every round adds ONE new tile (marked NEW)'],
    reverse: ['Watch the pattern', 'Tap it BACKWARDS: last tile first', 'Your brain will hate this'],
    speed: ['Tiles flash very fast', 'A timer runs while you tap', 'Too slow = lose a heart'],
    twin: ['Two tiles light together', 'Tap both tiles of every pair', 'Any order inside a pair'],
    chaos: ['Fake tiles GLITCH: grey, crossed out, shaking', 'Ignore every glitch tile', 'Tap only the real pattern'],
    ghost: ['Watch the pattern', 'Then every tile turns to fog: no color, no icon', 'Tap from pure memory'],
    negative: ['All tiles light up except one', 'That one becomes a BLACK HOLE', 'Tap the black holes in order · counter shows how many are left'],
    focus: ['Super short flashes', 'Blink and you miss it', 'Full focus!'],
    blitz: ['90 seconds on the clock', 'Clear as many steps as you can', 'Wrong tap = minus 3 seconds'],
    zen: ['No hearts. No fail.', 'Wrong tap shows the right tile', 'Half coins, full relax'],
    rush: ['Many tiles blink fast, on the beat', 'Then tap only the LAST few, in order', 'All correct = coins · wrong tap = 1 heart'],
    eye: ['Watch the tiles flash', 'Every tile hides behind an eye', 'Tap where they were · a right tap reveals it']
  };
  function modeSheet() {
    const st = S.st;
    const grid = D.MODES.map(m => {
      const un = S.unlocked(m.id), lv = S.lv(m.id);
      return `<button class="mCard ${un ? '' : 'locked'} ${m.id === selMode ? 'sel' : ''}" data-mode="${m.id}">
        <span class="mcIc">${ART.ic(un ? m.icon : 'lock')}</span><b>${m.name}</b>
        <small>${un ? m.tag : 'Unlocks at level ' + m.unlock}</small>
        ${un ? `<em>${m.id === 'blitz' ? 'Best ' + (st.blitzBest || 0) : 'Lv ' + lv}</em>` : ''}</button>`;
    }).join('');
    sheet(h`<div class="shT">Choose mode</div><div class="shS">Tap a mode to see its rules and play</div><div class="mGrid">${grid}</div>`, 'modes');
  }
  function readySheet(mode) {
    selMode = mode; const st = S.st, m = D.MODE[mode], lv = S.lv(mode);
    selBoosts = selBoosts.filter(b => (st.boosters[b] || 0) > 0);
    const boosts = boostGrid();
    const _unused = D.BOOSTERS.map(b => { const on = selBoosts.includes(b.id), n = (st.boosters[b.id] || 0) - (on ? 1 : 0); if (!S.boostOpen(b.id)) return `<button class="bst lockB" data-act="lockB:${b.id}">${ART.ic('lock')}<i>Lv ${D.BOOST_LV[b.id]}</i><small>${b.name}</small></button>`; return `<button class="bst ${on ? 'sel' : ''} ${n <= 0 && !on ? 'empty' : ''}" data-boost="${b.id}">${on ? '<span class="minus">−1</span>' : ''}${ART.ic(b.icon)}<i>${n}</i><small>${b.name}</small></button>`; }).join('');
    const fbLeft = S.cap('freeBoost', D.ADCAP.freeBoost);
    sheet(h`<div class="rdHead"><span class="rdIc">${ART.ic(m.icon)}</span><div><small>${mode === 'blitz' ? 'BEST ' + (st.blitzBest || 0) + ' STEPS' : 'LEVEL ' + lv + ' · ' + D.world(lv).name.toUpperCase()}</small><b>${m.name}</b></div></div>
      <div class="rdBody"><div class="demo" id="demo" data-m="${mode}">${Array.from({ length: 9 }, (_, i) => `<i style="--c:${D.SKINS[0].colors[i]}"></i>`).join('')}</div>
      <ol class="rdRules">${MODE_RULES[mode].map(r => `<li>${r}</li>`).join('')}</ol></div>
      <div class="shT sm">Boosters <span class="selN" id="selN">${selBoosts.length} of ${D.MAX_BOOSTS} selected</span></div><div class="bGrid" id="bGrid">${boosts}</div>
      <div class="bDesc" id="bDesc">${boostDesc()}</div>
      <div class="getB"><button data-act="shop:boost">${ART.coin(15)} Get more with coins</button>${freeBoost ? `<span class="fbOn">${ART.ic('check')} Free ${D.BOOST[freeBoost].name}</span>` : fbLeft > 0 ? `<button data-act="freeBoost"><span class="adt">AD</span> 1 free · ${fbLeft} left</button>` : `<span class="muted">Free boosters used today</span>`}</div>
      ${CREATOR_UI() ? `<button class="recTog ${recOn ? 'on' : ''}" data-act="recTog"><span class="rcDot"></span><span><b>Record my reaction</b><small>Your face + the game → auto-edited video</small></span><em>${recOn ? 'ON' : 'OFF'}</em></button>` : ''}
      <button class="btn big pulse" data-act="playSel">${ART.ic('play')} PLAY ${m.name.toUpperCase()}</button>`, 'ready');
    demoLoop(mode);
  }
  function boostGrid() {
    const st = S.st;
    return D.BOOSTERS.map(b => { const on = selBoosts.includes(b.id), n = (st.boosters[b.id] || 0) - (on ? 1 : 0); if (!S.boostOpen(b.id)) return `<button class="bst lockB" data-act="lockB:${b.id}">${ART.ic('lock')}<i>Lv ${D.BOOST_LV[b.id]}</i><small>${b.name}</small></button>`; return `<button class="bst ${on ? 'sel' : ''} ${n <= 0 && !on ? 'empty' : ''}" data-boost="${b.id}">${on ? '<span class="minus">−1</span>' : ''}${ART.ic(b.icon)}<i>${n}</i><small>${b.name}</small></button>`; }).join('');
  }
  const boostDesc = () => selBoosts.length ? selBoosts.map(b => `<b>${D.BOOST[b].name}</b>: ${D.BOOST[b].desc}`).join('<br>') : 'Tap to use (count goes down) · tap again to put back · max 3 per run';
  /* only the booster block changes: no sheet re-open, no jerk */
  function readyBoosts() {
    const g = $('bGrid'); if (!g) return readySheet(selMode);
    const t = document.createElement('div'); t.innerHTML = boostGrid();
    [...t.children].forEach((nb, i) => { const ob = g.children[i]; if (ob && ob.outerHTML !== nb.outerHTML) ob.replaceWith(nb); });
    $('bDesc').innerHTML = boostDesc(); $('selN').textContent = `${selBoosts.length} of ${D.MAX_BOOSTS} selected`;
  }
  /* tiny animated demo of the mode's rule */
  function demoLoop(mode) {
    const el = $('demo'); if (!el) return;
    const t = [...el.children], seq = [0, 4, 2, 6];
    const clr = () => t.forEach(x => x.className = '');
    const run = async () => {
      while (document.getElementById('demo') === el) {
        el.dataset.ph = 'watch'; clr();
        for (const v of seq.slice(0, 3)) {
          if (mode === 'twin') { t[v].className = 'on'; t[(v + 4) % 9].className = 'on'; }
          else if (mode === 'negative') t.forEach((x, i) => x.className = i === v ? 'dk' : 'on');
          else t[v].className = 'on';
          if (mode === 'chaos') t[(v + 3) % 9].className = 'fake';
          await new Promise(r => setTimeout(r, mode === 'focus' || mode === 'speed' ? 260 : 520)); clr();
          await new Promise(r => setTimeout(r, 160));
          if (document.getElementById('demo') !== el) return;
        }
        el.dataset.ph = 'tap';
        if (mode === 'ghost') t.forEach(x => x.className = 'gh');
        const order = mode === 'reverse' ? seq.slice(0, 3).reverse() : seq.slice(0, 3);
        for (const v of order) { t[v].className = (mode === 'ghost' ? 'gh ' : '') + 'tp'; await new Promise(r => setTimeout(r, 480)); if (document.getElementById('demo') !== el) return; t[v].className = mode === 'ghost' ? 'gh' : ''; }
        await new Promise(r => setTimeout(r, 700));
      }
    };
    run();
  }

  function play(mode, opts = {}) {
    if (!NET.gate()) return;
    closeSheet();
    S.st.lastMode = mode; S.save();
    const bs = selBoosts.filter(b => S.st.boosters[b] > 0); selBoosts = [];
    const fb = freeBoost; freeBoost = null;
    G.start(Object.assign({ mode, boosters: bs, freeBoost: fb }, opts));
  }

  /* ---------- SHEETS / MODALS ---------- */
  /* v1.6: re-rendering an open sheet only swaps its content (no close/re-open jerk, scroll kept) */
  function sheet(html, cls = '') {
    const s = $('sheet'), box = s.querySelector('.shBox');
    const inner = `<button class="shX" data-act="closeSheet">${ART.ic('close')}</button>${html}`;
    if (box && s.classList.contains('on') && s.dataset.cls === cls) { const y = box.scrollTop; box.innerHTML = inner; box.scrollTop = y; return false; }
    s.className = 'on ' + cls; s.dataset.cls = cls;
    s.innerHTML = `<div class="shBack" data-act="closeSheet"></div><div class="shBox">${inner}</div>`;
    return true;
  }
  function closeSheet() { $('sheet').className = ''; $('sheet').innerHTML = ''; $('sheet').dataset.cls = ''; }
  function modal(html, cls = '') {
    const m = $('modal'); m.className = 'on ' + cls; m.innerHTML = `<div class="mdBox">${html}</div>`;
  }
  function closeModal() { $('modal').className = ''; $('modal').innerHTML = ''; }
  /* modal that resolves with the data-pick value of the pressed button */
  function ask(html, cls = '') {
    return new Promise(res => {
      modal(html, cls);
      $('modal').querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); const v = b.dataset.pick; SND.click(); closeModal(); res(v); }));
    });
  }
  function toast(t, ic = 'info') {
    const el = document.createElement('div'); el.className = 'toast'; el.innerHTML = ART.ic(ic) + `<span>${t}</span>`;
    $('toasts').appendChild(el); setTimeout(() => el.classList.add('out'), 2300); setTimeout(() => el.remove(), 2800);
  }
  function achToast(a) {
    const el = document.createElement('div'); el.className = 'toast ach';
    el.innerHTML = `${ART.ic('trophy')}<span><small>ACHIEVEMENT</small><b>${a.t}</b></span><em>${ART.coin(14)}+${a.c}</em>`;
    $('toasts').appendChild(el); SND.coin(); setTimeout(() => el.classList.add('out'), 2800); setTimeout(() => el.remove(), 3300);
    refresh();
  }
  function refresh() { if (['home', 'chall', 'shop', 'profile', 'events'].includes(cur)) render(cur); }

  /* ---------- QUESTS (reroll + double with ads) ---------- */
  function questsSheet() {
    const st = S.st, rr = S.cap('questReroll', D.ADCAP.questReroll);
    const rows = st.quests.list.map(q => {
      const d = D.QUESTS.find(x => x.id === q.id); const pct = Math.min(100, q.p / d.n * 100);
      return `<div class="qRow ${q.claimed ? 'claimed' : ''}"><div class="qTx"><b>${d.t}</b><div class="bar"><i style="width:${pct}%"></i></div><small>${fmt(q.p)}/${fmt(d.n)}</small></div>
      ${q.claimed ? `<span class="qOk">${ART.ic('check')}</span>` : q.done ? `<div class="qBtns"><button class="btn sm" data-claim="${q.id}">${ART.coin(14)} ${d.coins}</button><button class="tryBtn" data-act="qDouble:${q.id}">${ART.ic('ad')} 2× ${d.coins * 2}</button></div>` : `<div class="qBtns"><span class="qRw">${ART.coin(14)} ${d.coins}</span>${rr > 0 ? `<button class="tryBtn" data-act="qReroll:${q.id}">${ART.ic('refresh')} New quest</button>` : ''}</div>`}</div>`;
    }).join('');
    const all = st.quests.list.every(q => q.claimed);
    sheet(h`<div class="shT">Daily quests</div><div class="shS">New quests every day at midnight${rr > 0 ? ' · Swap 1 quest a day with an ad' : ''}</div>${rows}
      <div class="qBonus ${all ? (st.quests.bonus ? 'claimed' : 'ready') : ''}">${ART.gem(20)}<span><b>Finish all 3</b><small>Bonus ${D.QUEST_ALL_GEMS} diamonds</small></span>
      ${all && !st.quests.bonus ? '<button class="btn sm" data-act="questBonus">Claim</button>' : st.quests.bonus ? ART.ic('check') : ''}</div>`);
  }
  async function questAd(kind, id) {
    const st = S.st, q = st.quests.list.find(x => x.id === id); if (!q) return;
    if (kind === 'qReroll') {
      if (S.cap('questReroll', D.ADCAP.questReroll) <= 0 || q.done) return;
      if (!(await ADS.rewarded('quest'))) return;
      const pool = D.QUESTS.filter(x => !st.quests.list.some(y => y.id === x.id));
      const n = pool[Math.floor(Math.random() * pool.length)]; Object.assign(q, { id: n.id, p: 0, done: false, claimed: false });
      S.useCap('questReroll'); S.save(); toast('New quest!', 'refresh'); questsSheet(); return;
    }
    if (kind === 'qDouble') {
      if (!q.done || q.claimed) return;
      if (!(await ADS.rewarded('quest'))) return;
      const c = S.claimQuest(id); if (c) { S.add('coins', c); S.passAdd('quest'); SND.coin(); toast(`+${fmt(c * 2)} coins`, 'check'); }
      questsSheet(); refresh();
    }
  }

  /* ---------- SPIN: casino wheel ---------- */
  function spinSheet() {
    const st = S.st, n = D.SPIN.length, seg = 360 / n;
    const cols = ['#743ae8', '#2b0e6b', '#9a6df5', '#4c1d95'];
    let paths = '', labels = '', bulbs = '';
    D.SPIN.forEach((p, i) => {
      const a0 = (i * seg - 90) * Math.PI / 180, a1 = ((i + 1) * seg - 90) * Math.PI / 180;
      const jack = p.kind === 'gems' && p.v >= 10;
      paths += `<path d="M150 150 L${150 + 128 * Math.cos(a0)} ${150 + 128 * Math.sin(a0)} A128 128 0 0 1 ${150 + 128 * Math.cos(a1)} ${150 + 128 * Math.sin(a1)}Z" fill="${jack ? 'url(#jk)' : cols[i % 4]}" stroke="#ffffff22" stroke-width="2"/>`;
      const am = (i + 0.5) * seg;
      labels += `<g transform="rotate(${am} 150 150)"><g transform="translate(150 44)">${spinIcon(p)}</g><text x="150" y="98" transform="rotate(-90 150 98)" text-anchor="middle" dominant-baseline="middle" class="spT ${jack ? 'jk' : ''}">${spinLabel(p)}</text></g>`;
    });
    for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; bulbs += `<circle class="bulb b${i % 2}" cx="${150 + 141 * Math.cos(a)}" cy="${150 + 141 * Math.sin(a)}" r="4.5"/>`; }
    const canAd = st.spin.ads < D.SPIN_AD_MAX;
    sheet(h`<div class="shT center">Lucky spin</div><div class="shS center">Swipe the wheel or tap spin · Jackpot = ${ART.gem(13)} 10</div>
      <div class="wheelWrap" id="wheelWrap"><div class="pin" id="pin"><svg viewBox="0 0 40 52"><path d="M20 50 L4 14 A17 17 0 1 1 36 14Z" fill="#fff" stroke="#743ae8" stroke-width="3"/><circle cx="20" cy="17" r="7" fill="#743ae8"/></svg></div>
        <svg class="wheelSvg" viewBox="0 0 300 300"><defs><radialGradient id="jk"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#c4a7ff"/></radialGradient><linearGradient id="rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c4a7ff"/><stop offset=".5" stop-color="#743ae8"/><stop offset="1" stop-color="#2b0e6b"/></linearGradient></defs>
          <circle cx="150" cy="150" r="148" fill="url(#rim)"/><circle cx="150" cy="150" r="133" fill="#120634"/>${bulbs}
          <g id="wheel" style="transform-origin:150px 150px">${paths}${labels}</g>
          <circle cx="150" cy="150" r="30" fill="#1a0b3d" stroke="url(#rim)" stroke-width="5"/></svg>
        <div class="wheelHub">${ART.icon(48)}</div></div>
      <div class="spinBtns">
        ${st.spin.free > 0 ? `<button class="btn big pulse" data-act="spinFree">${ART.ic('sparkle')} FREE SPIN</button>` : `
        <button class="btn big ${canAd ? 'pulse' : 'off'}" data-act="spinAd">${ART.ic('ad')} Watch ad · Spin <small>${D.SPIN_AD_MAX - st.spin.ads} left</small></button>
        <button class="btn ghost" data-act="spinGem">${ART.gem(16)} ${D.SPIN_GEMS} · Spin</button>`}
      </div>`, 'spin');
    // swipe to spin
    const ww = $('wheelWrap'); let y0 = null, x0 = null;
    ww.addEventListener('pointerdown', e => { y0 = e.clientY; x0 = e.clientX; });
    ww.addEventListener('pointerup', e => { if (y0 == null) return; const d = Math.hypot(e.clientX - x0, e.clientY - y0); y0 = null; if (d > 40) { const b = document.querySelector('[data-act=spinFree],[data-act=spinAd]'); if (b && !b.classList.contains('off')) b.click(); } });
  }
  function spinLabel(p) { return p.kind === 'coins' ? p.v : p.kind === 'gems' ? (p.v >= 10 ? 'JACKPOT' : '×' + p.v) : p.kind === 'shield' ? 'SHIELD' : D.BOOST[p.v].name.split(' ')[0].toUpperCase(); }
  function spinIcon(p) { const sv = p.kind === 'coins' ? ART.coin(26) : p.kind === 'gems' ? ART.gem(26) : p.kind === 'shield' ? ART.shieldC(26) : ART.ic(D.BOOST[p.v].icon); return sv.replace('<svg ', '<svg x="-13" y="-13" width="26" height="26" ').replace(/class="ic[^"]*"/, 'class="ic" style="color:#fff"'); }
  let spinning = false;
  function doSpin(after) {
    if (spinning) return; spinning = true;
    const tot = D.SPIN.reduce((a, p) => a + p.w, 0); let r = Math.random() * tot, idx = 0;
    for (let i = 0; i < D.SPIN.length; i++) { r -= D.SPIN[i].w; if (r <= 0) { idx = i; break; } }
    const seg = 360 / D.SPIN.length, target = 360 * 7 - (idx + 0.5) * seg + (Math.random() - 0.5) * seg * 0.5;
    const w = $('wheel'), pin = $('pin'); w.style.transition = 'transform 5.2s cubic-bezier(.08,.6,.08,1)'; w.style.transform = `rotate(${target}deg)`;
    document.querySelectorAll('.spinBtns .btn').forEach(b => b.classList.add('off'));
    $('wheelWrap').classList.add('spinning');
    // ticking pointer that slows down with the wheel
    let tk = 40; const tick = () => { if (!spinning) return; SND.spin(); pin.classList.remove('tk'); void pin.offsetWidth; pin.classList.add('tk'); tk *= 1.09; if (tk < 600) setTimeout(tick, tk); };
    tick();
    S.quest('spin');
    setTimeout(() => {
      spinning = false; const p = D.SPIN[idx];
      $('wheelWrap') && $('wheelWrap').classList.remove('spinning');
      const g = p.kind === 'coins' ? { coins: p.v } : p.kind === 'gems' ? { gems: p.v } : p.kind === 'shield' ? { shields: p.v } : { boost: p.v };
      S.grant(g); SND.win(); FX.win(p.kind === 'gems' && p.v >= 10 ? 'fireworks' : 'confetti');
      spinWin(g, p.kind === 'gems' && p.v >= 10);
    }, 5400);
  }
  async function spinWin(g, jack) {
    const can2 = S.cap('spin2x', 3) > 0;
    const v = await ask(h`<div class="rwRays"></div><div class="mdK">${jack ? 'JACKPOT!' : 'You won!'}</div><div class="rwItems">${rwItems(g)}</div>
      ${can2 ? `<button class="btn big pulse" data-pick="2x">${ART.ic('ad')} DOUBLE IT</button>` : ''}<button class="btn ${can2 ? 'ghost' : 'big'}" data-pick="ok">${can2 ? 'Take it' : 'AWESOME'}</button>`, 'rw');
    if (v === '2x' && await ADS.rewarded('spin2x')) { S.useCap('spin2x'); S.grant(g); reward(g, 'Doubled!'); }
    refresh(); if ($('sheet').classList.contains('spin')) spinSheet();
  }

  /* ---------- REWARD POPUP ---------- */
  function rwItems(g) {
    const items = [];
    if (g.coins) items.push(`${ART.coin(40)}<b>+${fmt(g.coins)}</b><small>COINS</small>`);
    if (g.gems) items.push(`${ART.gem(40)}<b>+${g.gems}</b><small>DIAMONDS</small>`);
    if (g.shields) items.push(`${ART.shieldC(40)}<b>+${g.shields}</b><small>SHIELDS</small>`);
    if (g.boost) items.push(`<span class="rbIc">${ART.ic(D.BOOST[g.boost].icon)}</span><b>${D.BOOST[g.boost].name}</b>`);
    if (g.xp) items.push(`<span class="xpBig">XP</span><b>+${fmt(g.xp)}</b>`);
    if (g.skin) items.push(`<span class="rbIc">${ART.ic('sparkle')}</span><b>${D.skin(g.skin).name} skin</b>`);
    if (g.badge) items.push(`<span class="rbIc">${ART.ic(D.BADGES[g.badge].icon)}</span><b>${D.BADGES[g.badge].name} badge</b>`);
    if (g.item) items.push(`<span class="rbIc">${ART.ic('palette')}</span><b>${g.item}</b>`);
    return items.map((i, k) => `<div class="rwI ${k === 0 && g.coins ? 'gold' : ''}" style="--d:${k * 90}ms">${i}</div>`).join('');
  }
  /* game-style reward popup: ribbon title, item cards, COLLECT (+ optional ad double) */
  function reward(g, title = 'Reward', after, dbl) {
    modal(h`<div class="rw2"><div class="rwRib"><span>${title}</span></div><div class="rwItems">${rwItems(g)}</div>
      <button class="btn big collect" data-act="closeModal">COLLECT</button>${dbl ? `<button class="btn alt dblAd" data-act="rwDouble">${ART.ic('ad')} Double it</button>` : ''}</div>`, 'rw');
    SND.coin(); if (after) modalAfter = after;
    rwLast = dbl ? g : null;
    if (g.coins) setTimeout(() => FX.flyCoins(document.querySelector('.rwI'), null, 8), 300);
  }
  let rwLast = null;
  let modalAfter = null;

  /* ---------- CHEST ---------- */
  /* 3-step chest: tap 3 times to crack -> it bursts open -> loot cards flip in */
  function chest(tier, free, title) {
    return new Promise(res => {
      const c = D.CHESTS.find(x => x.id === tier);
      const rr = ([a, b]) => a + Math.floor(Math.random() * (b - a + 1));
      const loot = { coins: rr(c.coins), gems: rr(c.gems), shields: rr(c.shields) };
      if (Math.random() < c.boost) loot.boost = D.BOOSTERS[Math.floor(Math.random() * D.BOOSTERS.length)].id;
      modal(h`<div class="ch3"><div class="mdK">${title || (free ? 'Free chest' : c.name)}</div><div class="ch3T">${c.name}</div>
        <div class="chestBox" style="--cc:${c.color}" id="chestBox">${chestSvg(c.color)}</div>
        <div class="ch3Tap" id="chTap"><b>TAP!</b><small id="chLeft">Tap the chest to open</small></div><div class="ch3Cards" id="chCards"></div></div>`, 'chest');
      const box = $('chestBox'); let taps = 0, opened = false;
      const open = () => {
        if (opened) return; opened = true; box.classList.add('open'); SND.win(); $('chTap').classList.add('hide');
        const cards = [];
        if (loot.coins) cards.push(['COMMON', ART.coin(54), '+' + fmt(loot.coins), 'coins', 'c']);
        if (loot.gems) cards.push(['RARE', ART.gem(54), '+' + loot.gems, 'diamonds', 'r']);
        if (loot.shields) cards.push(['RARE', ART.shieldC(54), '+' + loot.shields, 'shields', 'r']);
        if (loot.boost) cards.push(['EPIC', `<span class="rbIc">${ART.ic(D.BOOST[loot.boost].icon)}</span>`, D.BOOST[loot.boost].name, 'booster', 'e']);
        setTimeout(() => {
          $('chCards').innerHTML = cards.map(([r, ic, b, s2, k], i) => `<div class="lootC ${k}" style="--d:${i * 160}ms"><small>${r}</small><div class="lcIc">${ic}</div><b>${b}</b><span>${s2}</span></div>`).join('') + `<button class="btn big collect" data-act="chestDone">COLLECT ALL</button>`;
          box.classList.add('away'); S.grant(loot); SND.coin();
          chestRes = () => { closeModal(); res(); };
        }, 700);
      };
      box.onclick = () => {
        if (opened || taps) return; taps = 1; SND.tap(3);
        box.classList.remove('hit'); void box.offsetWidth; box.classList.add('hit', 'c3', 'burst');
        const l = $('chLeft'); if (l) l.textContent = 'Opening!';
        setTimeout(open, 260);
      };
      setTimeout(() => { if (!opened && taps === 0) { const l = $('chLeft'); if (l) l.textContent = 'Tap the chest!'; } }, 2500);
    });
  }
  let chestRes = null;
  /* v1.6: 3D chest (front + side faces, bevelled lid, metal trims, light sweep) */
  const chestSvg = c => `<div class="ch3d"><div class="ch3dGlow" style="--cc:${c}"></div><svg viewBox="0 0 220 190" style="overflow:visible"><defs>
    <linearGradient id="cwF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b2fc4"/><stop offset=".55" stop-color="#3a1590"/><stop offset="1" stop-color="#1e0858"/></linearGradient>
    <linearGradient id="cwS" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a0e70"/><stop offset="1" stop-color="#14053a"/></linearGradient>
    <linearGradient id="cwT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5cf0"/><stop offset="1" stop-color="#4a1fb0"/></linearGradient>
    <linearGradient id="cm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${c}"/><stop offset="1" stop-color="#2b0e6b"/></linearGradient>
    <linearGradient id="cSw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <clipPath id="cClip"><rect x="20" y="84" width="150" height="90" rx="10"/></clipPath></defs>
    <ellipse cx="108" cy="180" rx="96" ry="10" fill="#000" opacity=".5"/>
    <g class="cBody">
      <path d="M170 84 L196 70 L196 156 L170 174 Z" fill="url(#cwS)" stroke="#0c0326" stroke-width="4" stroke-linejoin="round"/>
      <rect x="20" y="84" width="150" height="90" rx="10" fill="url(#cwF)" stroke="#0c0326" stroke-width="4"/>
      <path d="M20 112h150M20 142h150" stroke="#12043a" stroke-width="3" opacity=".55"/>
      <rect x="20" y="84" width="20" height="90" rx="5" fill="url(#cm)" stroke="#0c0326" stroke-width="3.5"/><rect x="150" y="84" width="20" height="90" rx="5" fill="url(#cm)" stroke="#0c0326" stroke-width="3.5"/>
      <path d="M182 77 L182 163" stroke="url(#cm)" stroke-width="9"/>
      <g clip-path="url(#cClip)"><rect class="cSweep" x="-60" y="80" width="50" height="100" fill="url(#cSw)" transform="skewX(-20)"/></g>
      <circle cx="95" cy="138" r="10" fill="#c4a7ff" stroke="#fff" stroke-width="3"/>
      <path class="crk k1" d="M58 108 l14 12 -8 14 16 10" stroke="#fff" stroke-width="3" fill="none"/><path class="crk k2" d="M136 104 l-12 14 10 12 -14 16" stroke="#fff" stroke-width="3" fill="none"/><path class="crk k3" d="M92 88 l8 14 -10 10 8 14" stroke="#fff" stroke-width="3" fill="none"/></g>
    <g class="cLid">
      <path d="M172 88 L198 74 Q197 38 150 18 Q172 34 172 88Z" fill="url(#cwS)" stroke="#0c0326" stroke-width="4" stroke-linejoin="round"/>
      <path d="M16 88 Q16 22 95 22 Q174 22 174 88 Z" fill="url(#cwT)" stroke="#0c0326" stroke-width="4.5"/>
      <path d="M34 60 Q46 34 80 30" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".45" fill="none"/>
      <path d="M30 88 Q30 38 50 32 L50 88Z M140 88 L140 32 Q160 38 160 88Z" fill="url(#cm)" stroke="#0c0326" stroke-width="3.5"/>
      <path d="M16 88h158" stroke="url(#cm)" stroke-width="10"/>
      <rect x="79" y="72" width="32" height="40" rx="8" fill="url(#cm)" stroke="#0c0326" stroke-width="3.5"/><circle cx="95" cy="90" r="6" fill="#0c0326"/><path d="M95 92v10" stroke="#0c0326" stroke-width="4"/></g>
    <ellipse class="cGlow" cx="95" cy="88" rx="82" ry="14" fill="#fff"/></svg></div>`;
  function chestsSheet() {
    const rows = D.CHESTS.map(c => `<div class="chRow"><div class="chIc" style="--cc:${c.color}">${chestSvg(c.color)}</div><div class="chTx"><b>${c.name}</b><small>${c.coins[0]}-${c.coins[1]} coins · ${c.gems[0]}-${c.gems[1]} diamonds${c.boost >= 0.9 ? ' · booster' : ''}</small></div><button class="btn sm" data-chest="${c.id}">${ART.coin(14)} ${fmt(c.price)}</button></div>`).join('');
    sheet(`<div class="shT">Mystery chests</div><div class="shS">Boss levels also drop a free Bronze chest</div>${rows}`);
  }
  /* after a boss chest: watch an ad for a 2nd (silver) chest */
  async function bossExtraChest() {
    const v = await ask(h`<div class="mdK">Boss bonus</div><div class="chestBox shaking sm">${chestSvg('#c0c7d6')}</div><div class="mdT">Open a 2nd chest?</div><div class="mdS">Watch an ad and open a Silver chest too.</div>
      <button class="btn big pulse" data-pick="ad">${ART.ic('ad')} OPEN SILVER CHEST</button><button class="btn ghost" data-pick="no">No thanks</button>`, 'chest');
    if (v !== 'ad') return false;
    const ok = await ADS.rewarded('bossChest'); if (!ok) return true;
    await chest('silver', true, 'Bonus chest'); return true;
  }

  /* ---------- LUCKY BOX (every 4th level clear) ---------- */
  async function lucky(lv) {
    const c = D.luckyCoins(lv);
    const v = await ask(h`<div class="rwRays"></div><div class="mdK">Lucky box</div><div class="luckyBox">${ART.ic('dice')}</div><div class="mdT">${fmt(c)} coins inside</div><div class="mdS">Watch an ad and get 3×: <b>${fmt(c * 3)}</b> coins</div>
      <button class="btn big pulse" data-pick="ad">${ART.ic('ad')} OPEN 3× · ${fmt(c * 3)}</button><button class="btn ghost" data-pick="skip">Take ${fmt(c)}</button>`, 'rw lucky');
    let g = { coins: c }, ad = false;
    if (v === 'ad') { ad = true; if (await ADS.rewarded('lucky')) g = { coins: c * 3 }; }
    S.grant(g); if (G.run) G.run.coins += g.coins; SND.coin(); toast(`Lucky box +${fmt(g.coins)}`, 'coins');
    return ad;
  }

  /* ---------- trial ended (before the next level) ---------- */
  async function trialEnded(list) {
    list.forEach(t => { S.st.trials[t.cat].told = true; }); S.save();
    const names = list.map(t => t.cat === 'skin' ? D.skin(t.id).name : D.cos(t.cat, t.id).name).join(', ');
    const canRenew = S.trialsLeft() > 0;
    const v = await ask(h`<div class="mdK">Trial ended</div><div class="mdT">${names}</div><div class="mdS">Your 30 minutes are over. Keep it for 30 more?</div>
      ${canRenew ? `<button class="btn big pulse" data-pick="ad">${ART.ic('ad')} 30 MORE MINUTES</button>` : '<div class="mdS">No trials left today</div>'}<button class="btn ghost" data-pick="no">Continue without</button>`);
    if (v !== 'ad') return false;
    if (!(await ADS.rewarded('trial'))) return true;
    S.st.trialDay.n++; list.forEach(t => { S.st.trials[t.cat] = { id: t.id, until: Date.now() + D.TRIAL_MIN * 6e4 }; }); S.save();
    toast('30 more minutes!', 'clock'); return true;
  }

  /* ---------- LOGIN CALENDAR + streak saver ---------- */
  function loginModal() {
    const st = S.st, day = st.login.day;
    const cells = D.LOGIN.map((r, i) => {
      const d = i + 1, cls = d < day ? 'past' : d === day ? 'today' : '';
      const ic = r.chest ? ART.ic('gift') : r.gems ? ART.gem(22) : r.shields ? ART.shieldC(22) : ART.coin(22);
      const v = r.chest ? 'Chest' : r.gems ? '+' + r.gems : r.shields ? '+' + r.shields : '+' + r.coins;
      return `<div class="lgDay ${cls} ${d === 7 ? 'big' : ''}"><small>Day ${d}</small>${ic}<b>${v}</b>${d < day ? `<i>${ART.ic('check')}</i>` : ''}</div>`;
    }).join('');
    const lost = st.login.lost || 0;
    modal(h`<div class="mdK">Daily reward</div><div class="mdT">Day ${day} · ${st.login.streak} day streak</div>
      ${lost >= 2 ? `<button class="saver" data-act="saveStreak">${ART.ic('fire')}<span><b>Your ${lost}-day streak broke!</b><small>Watch an ad to save it</small></span>${ART.ic('ad')}</button>` : ''}
      <div class="lgGrid">${cells}</div>
      <button class="btn big" data-act="claimLogin">CLAIM</button><button class="btn ghost" data-act="claimLogin2">${ART.ic('ad')} Claim 2× with ad</button>`, 'login');
  }
  async function claimLogin(double) {
    const st = S.st, r = D.LOGIN[st.login.day - 1];
    if (double) { const ok = await ADS.rewarded('login'); if (!ok) return; }
    st.login.pending = false; S.save();
    const m = double ? 2 : 1; const g = { coins: (r.coins || 0) * m, gems: (r.gems || 0) * m, shields: (r.shields || 0) * m };
    S.grant(g); closeModal();
    if (r.chest) await chest(r.chest, true);
    reward(g, 'Daily reward', () => setTimeout(afterLogin, 300)); refresh();
  }
  async function saveStreak() {
    const st = S.st; if (!st.login.lost) return;
    if (!(await ADS.rewarded('streak'))) return;
    st.login.streak = st.login.lost + 1; st.login.day = ((st.login.lost) % 7) + 1; st.login.lost = 0; S.save();
    toast(`Streak saved: ${st.login.streak} days!`, 'fire'); loginModal();
  }

  /* ---------- WEEKLY RANKING (AI rivals, labeled) ---------- */
  function aiBoard(wk, myScore) {
    let s = 0; for (const ch of wk) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
    const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
    const base = Math.max(6, myScore);
    const rows = Array.from({ length: 9 }, (_, i) => ({ name: D.AI_NAMES[(s + i * 5) % D.AI_NAMES.length], ai: true, score: Math.max(2, Math.round(base * (0.35 + rnd() * 1.3) + rnd() * 8)) }));
    rows.push({ name: S.st.name, me: true, score: myScore });
    return rows.sort((a, b) => b.score - a.score);
  }
  function lbTouch() {
    const st = S.st, wk = S.weekKey();
    if (st.lb.wk !== wk) {
      if (st.lb.wk && st.lb.score > 0) { const b = aiBoard(st.lb.wk, st.lb.score); st.lb.lastRank = b.findIndex(r => r.me) + 1; st.lb.lastPending = st.lb.lastRank <= 3; }
      st.lb.wk = wk; st.lb.score = 0; S.save();
    }
  }
  const LB_REWARD = [10, 6, 3];
  function pendingLB() { lbTouch(); return S.st.lb.lastPending ? S.st.lb.lastRank : 0; }
  function rankSheet() {
    lbTouch();
    const st = S.st, b = aiBoard(st.lb.wk, st.lb.score || 0);
    const rows = b.map((r, i) => `<div class="lbRow ${r.me ? 'me' : ''} ${i < 3 ? 'top' + (i + 1) : ''}"><span class="lbN">${i + 1}</span>${ART.lbAv(r)}<span class="lbName">${esc(r.name)} ${r.ai ? '<em class="aiTag">AI</em>' : '<em class="youTag">YOU</em>'}</span><b>${r.score}</b></div>`).join('');
    const pend = pendingLB();
    sheet(h`<div class="shT">Weekly ranking</div><div class="shS">You vs AI rivals · levels cleared this week · resets Monday</div>
      ${pend ? `<div class="lbClaim">${ART.ic('trophy')}<span>Last week you finished <b>#${pend}</b></span><button class="btn sm" data-act="lbClaim">${ART.gem(14)} ${LB_REWARD[pend - 1]}</button></div>` : ''}
      <div class="lbList">${rows}</div><div class="lbRw">Top 3 on Monday win ${ART.gem(14)} 10 / 6 / 3</div>`);
  }

  /* ---------- SANX PASS SEASON (14 days · free track + Gold track · missions) ---------- */
  function passIc(r) { return r.skin ? ART.ic('crown') : r.chest ? ART.ic('gift') : r.gems ? ART.gem(20) : r.boost ? ART.ic(D.BOOST[r.boost].icon) : ART.coin(20); }
  function passTx(r) { return r.skin ? 'Elite skin' : r.chest ? D.CHESTS.find(c => c.id === r.chest).name.split(' ')[0] : r.gems ? '+' + r.gems : r.boost ? D.BOOST[r.boost].name.split(' ')[0] : '+' + r.coins; }
  function misProg(p, m) { const st = S.st.stats; if (m.k === 'bestTiles') return p.bestTiles || 0; return (st[m.k] || 0) - ((p.base || {})[m.k] || 0); }
  /* v1.6 Sanx Pass: vertical ladder. tier line in the middle, free left, Premium (crown) right */
  let passTab = 'rw';
  function passSheet(tab) {
    if (tab) passTab = tab;
    const p = S.passTouch(), tier = S.passTier(), into = p.pts % D.PASS.per;
    const cell = (r, i, prem) => {
      const ok = i < tier, got = prem ? p.got2.includes(i) : p.got.includes(i), lk = prem && !p.gold, can = ok && !got && !lk;
      return `<button class="pvR ${prem ? 'prem' : 'free'} ${ok ? 'ok' : ''} ${got ? 'got' : ''} ${can ? 'can' : ''} ${lk ? 'lk' : ''}" data-act="${can ? (prem ? 'passClaim2:' : 'passClaim:') + i : 'none'}">
        <span class="pvIc">${passIc(r)}</span><b>${passTx(r)}</b>${got ? `<i class="pvOk">${ART.ic('check')}</i>` : lk ? `<i class="pvLk">${ART.ic('lock')}</i>` : can ? '<em>CLAIM</em>' : ''}</button>`;
    };
    const rows = Array.from({ length: D.PASS.tiers }, (_, i) => `<div class="pvRow ${i < tier ? 'ok' : ''} ${i === tier ? 'now' : ''} ${i === D.PASS.tiers - 1 ? 'final' : ''}">
        ${cell(D.PASS.reward(i), i, false)}<div class="pvNode"><span>${i + 1}</span></div>${cell(D.PASS.gold(i), i, true)}</div>`).join('');
    const ready = Array.from({ length: tier }, (_, i) => i).filter(i => !p.got.includes(i) || (p.gold && !p.got2.includes(i))).length;
    const misDone = D.PASS.missions.filter(m => !p.mis.includes(m.id) && misProg(p, m) >= m.n).length;
    const mis = D.PASS.missions.map(m => { const v = Math.min(m.n, Math.max(0, misProg(p, m))), done = v >= m.n, cl = p.mis.includes(m.id); return `<div class="qRow ${cl ? 'claimed' : ''}"><div class="qTx"><b>${m.t}</b><div class="bar"><i style="width:${v / m.n * 100}%"></i></div><small>${v}/${m.n}</small></div>${cl ? `<span class="qOk">${ART.ic('check')}</span>` : done ? `<button class="btn sm pulse" data-act="passMis:${m.id}">+${m.pts} pts</button>` : `<span class="qRw">+${m.pts} pts</span>`}</div>`; }).join('');
    const body = passTab === 'rw' ? h`
      ${p.gold ? `<div class="pvPremOn">${ART.ic('crown')} PREMIUM TRACK UNLOCKED</div>` : `<button class="pvPremBtn" data-act="passGold">${ART.ic('crown')}<span><b>Unlock Premium free</b><small>Watch ${D.PASS.goldAds - (p.goldAds || 0)} more ad${D.PASS.goldAds - (p.goldAds || 0) > 1 ? 's' : ''} · extra reward every tier · never real money</small></span><em>${p.goldAds || 0}/${D.PASS.goldAds}</em></button>`}
      ${ready ? `<button class="btn big pulse" data-act="passAll">${ART.ic('gift')} CLAIM ALL (${ready})</button>` : ''}
      <div class="pvKey"><span>FREE</span><span>TIER</span><span class="pr">${ART.ic('crown')} PREMIUM</span></div>
      <div class="pvLadder">${rows}</div>` : h`<div class="secT">Season missions</div>${mis}
      <div class="secT">Earn points</div><div class="psHow">
        <span>Level clear <b>+${D.PASS.pts.level}</b></span><span>Boss <b>+${D.PASS.pts.boss}</b></span><span>Event run <b>+${D.PASS.pts.event}</b></span><span>Quest <b>+${D.PASS.pts.quest}</b></span><span>Daily <b>+${D.PASS.pts.daily}</b></span><span>IMPOSSIBLE 100 win <b>+${D.PASS.pts.imp}</b></span><span>Duel win <b>+${D.PASS.pts.chal}</b></span><span>${ART.ic('ticket')} Pass Boost booster <b>2×</b></span></div>`;
    const fresh = sheet(h`<div class="pvHead"><span class="pvCrown">${ART.ic('crown')}</span><div><small>SEASON · ENDS IN ${left(S.passEnd()).toUpperCase()}</small><b>Sanx Pass</b></div><em>Tier <b>${tier}</b>/${D.PASS.tiers}</em></div>
      <div class="bar xp"><i style="width:${tier >= D.PASS.tiers ? 100 : into / D.PASS.per * 100}%"></i></div><div class="shS">${tier >= D.PASS.tiers ? 'Pass complete!' : `${into}/${D.PASS.per} points to tier ${tier + 1}`}</div>
      <div class="pvTabs"><button class="${passTab === 'rw' ? 'on' : ''}" data-act="passTab:rw">${ART.ic('gift')} Rewards${ready ? `<i class="dot"></i>` : ''}</button><button class="${passTab === 'mis' ? 'on' : ''}" data-act="passTab:mis">${ART.ic('flag')} Missions${misDone ? `<i class="dot"></i>` : ''}</button></div>
      ${body}`, 'pass');
    if (passTab === 'rw' && (fresh || tab)) setTimeout(() => { const n = document.querySelector('.pvRow.now') || document.querySelector('.pvRow.final'); const box = document.querySelector('#sheet .shBox'); if (n && box) box.scrollTop = Math.max(0, n.offsetTop - box.clientHeight / 2 + 30); }, 60);
  }
  async function passGold() {
    const p = S.passTouch(); if (p.gold) return;
    if (!(await ADS.rewarded('passGold'))) return;
    p.goldAds = (p.goldAds || 0) + 1; if (p.goldAds >= D.PASS.goldAds) { p.gold = true; toast('Premium track unlocked!', 'crown'); FX.win('fireworks'); } S.save(); passSheet();
  }
  async function passClaim2(i) {
    const p = S.passTouch(); if (!p.gold || i >= S.passTier() || p.got2.includes(i)) return;
    p.got2.push(i); S.save();
    const r = { ...D.PASS.gold(i) };
    if (r.chest) { const c = r.chest; delete r.chest; await chest(c, true, 'Premium reward'); } else { S.grant(r); reward(r, `Premium tier ${i + 1}`); }
    passSheet(); refresh();
  }
  function passMis(id) {
    const p = S.passTouch(), m = D.PASS.missions.find(x => x.id === id); if (!m || p.mis.includes(id) || misProg(p, m) < m.n) return;
    p.mis.push(id); p.pts = Math.min(D.PASS.tiers * D.PASS.per, p.pts + m.pts); S.save(); toast(`+${m.pts} Pass points`, 'ticket'); passSheet();
  }

  /* ---------- CHALLENGES TAB: 10 ladder challenges x 3 stars, 30 stars = Legendary skin ---------- */
  const starsOf = id => (S.st.cstars[id] || {}).s || 0;
  const totalStars = () => D.CHALLENGES.reduce((a, c) => a + starsOf(c.id), 0);
  /* v1.6 STAR ROAD: hero ring, big NEXT card, a road of challenges, chests at 10/20/30 stars */
  const chLocked = c => !S.feat('chall') || (c.mode !== 'classic' && !S.unlocked(c.mode));
  function ring(v, max, sz = 112) {
    const r = sz / 2 - 9, C = 2 * Math.PI * r, f = Math.min(1, v / max);
    return `<svg class="srRing" viewBox="0 0 ${sz} ${sz}" width="${sz}" height="${sz}"><defs><linearGradient id="srG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c4a7ff"/><stop offset="1" stop-color="#743ae8"/></linearGradient></defs>
      <circle cx="${sz / 2}" cy="${sz / 2}" r="${r}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="10"/>
      <circle cx="${sz / 2}" cy="${sz / 2}" r="${r}" fill="none" stroke="url(#srG)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - f)}" transform="rotate(-90 ${sz / 2} ${sz / 2})"/></svg>`;
  }
  function renderChall() {
    const st = S.st, tot = totalStars(), own = st.skins.includes('starlord');
    st.starChests = st.starChests || [];
    const list = D.CHALLENGES.map((c, i) => ({ c, i, s: starsOf(c.id), best: (st.cstars[c.id] || {}).b || 0, lock: chLocked(c) }));
    const next = list.find(x => !x.lock && x.s < 3) || list.find(x => !x.lock) || list[0];
    const sk = D.skin('starlord');
    const chestNode = (k, x) => { const got = st.starChests.includes(k), rdy = tot >= x.stars && !got; return `<button class="srChest ${got ? 'got' : rdy ? 'rdy' : ''}" style="left:${x.stars / 30 * 100}%" data-act="${rdy ? 'schest:' + k : 'none'}">${ART.ic(got ? 'check' : 'gift')}<small>${x.stars}★</small></button>`; };
    const unlockTxt = c => !S.feat('chall') ? `Unlocks at Level ${D.UNLOCK.chall.lv}` : `Play ${D.MODE[c.mode].name}: unlocks at Level ${D.MODE[c.mode].unlock}`;
    const starsHtml = (c, s) => c.stars.map((t, k) => `<i class="${k < s ? 'on' : ''}">${ART.ic('star')}<em>${t}</em></i>`).join('');
    const nx = next.c;
    const road = list.map(({ c, i, s, best, lock }) => `<button class="srNode ${lock ? 'locked' : ''} ${s === 3 ? 'full' : ''} ${c === nx ? 'cur' : ''}" data-act="${lock ? (S.feat('chall') ? 'none' : 'locked:chall') : 'cplay:' + c.id}">
        <span class="srDot">${lock ? ART.ic('lock') : s === 3 ? ART.ic('check') : i + 1}</span>
        <span class="srTx"><b>${c.name}</b><small>${lock ? unlockTxt(c) : `${D.MODE[c.mode].name}${c.grid ? ' · ' + c.grid + '×' + c.grid : ''}${c.hearts ? ' · 1 heart' : ''} · best ${best}`}</small></span>
        <span class="ccSt">${starsHtml(c, s)}</span></button>`).join('');
    const impL = !S.feat('imp'), duL = !S.feat('duel'), mb = S.memBest(), rk = D.memRank(mb), nr = D.memNext(mb);
    $('chall').innerHTML = h`${topbar()}<div class="pgT">Challenges</div><div class="pgBody">
      <div class="srHero">
        <div class="srRingBox">${ring(tot, 30)}<div class="srRingTx"><b>${tot}</b><small>/ 30 ★</small></div></div>
        <div class="srHeroTx"><small>STAR ROAD</small><b>${own ? 'Star Legend unlocked' : 'Win the Star Legend skin'}</b><em>${own ? 'Collect stars for chest rewards' : `${30 - tot} stars to go`}</em>
          <div class="srSkin">${sk.colors.slice(0, 4).map((c, i) => `<span class="tile" style="--c:${c}"><span class="tFace">${ART.tileIc(sk.icons[i])}</span></span>`).join('')}</div></div>
        <div class="srTrack"><div class="srFill" style="width:${Math.min(100, tot / 30 * 100)}%"></div>${D.STAR_CHESTS.map((x, k) => chestNode(k, x)).join('')}</div>
      </div>
      <div class="srNext ${next.lock ? 'locked' : ''}">
        <div class="snK">${next.s === 3 ? 'ALL STARS · PLAY AGAIN' : 'NEXT CHALLENGE'} · ${next.i + 1}/10</div>
        <div class="snRow"><span class="snIc">${ART.ic(nx.icon)}</span><span class="snTx"><b>${nx.name}</b><small>${D.MODE[nx.mode].name} ladder · starts at 2 tiles, +1 every round</small></span></div>
        <div class="snStars">${nx.stars.map((t, k) => `<div class="${k < next.s ? 'on' : ''}">${ART.ic('star')}<b>${t}</b><small>tiles</small></div>`).join('')}</div>
        <button class="btn big pulse" data-act="${next.lock ? 'locked:chall' : 'cplay:' + nx.id}">${ART.ic(next.lock ? 'lock' : 'play')} ${next.lock ? 'LOCKED' : 'PLAY'}</button>
        <div class="snNote">${ART.ic('heart')} Out of hearts? Watch an ad for +1 heart</div>
      </div>
      <div class="secT">The road <span class="muted">3 stars each</span></div>
      <div class="srRoad">${road}</div>
      <div class="secT">More challenges</div>
      <div class="featRow">
        ${impL ? `<button class="feat impF locked" data-act="locked:imp"><span class="ftK">${ART.ic('lock')} LEVEL ${D.UNLOCK.imp.lv}</span><b>IMPOSSIBLE <i>100</i></b><small>The ultimate memory test</small>${ART.ic('brain', 'ftIc')}</button>` : `<button class="feat impF" data-act="imp"><span class="ftK">CHALLENGE</span><b>IMPOSSIBLE <i>100</i></b><small>${st.imp.best ? 'Your best: ' + st.imp.best + ' tiles' : 'How much can you remember?'}</small>${ART.ic('brain', 'ftIc')}</button>`}
        <button class="feat chF ${duL ? 'locked' : ''}" data-act="${duL ? 'locked:duel' : 'chal'}">${CH.pendingCount() && !duL ? `<i class="dot"></i>` : ''}<span class="ftK">${duL ? ART.ic('lock') + ' LEVEL ' + D.UNLOCK.duel.lv : 'DUEL LADDER'}</span><b>DUEL A FRIEND</b><small>Same pattern. Winner takes 2×</small>${ART.ic('swords', 'ftIc')}</button>
      </div>
      <button class="memCard" data-act="test"><span class="mcL"><small>MEMORY TEST · NO BOOSTERS</small><b>Memory Score ${mb || '?'}</b><em>${mb ? `${rk.name}${nr ? ` · ${nr.min - mb} tile${nr.min - mb > 1 ? 's' : ''} to ${nr.name}` : ''}` : 'How many tiles can you remember?'}</em></span><span class="mcGo">${ART.ic('brain')} TEST</span></button>
    </div>`;
  }
  /* star chest: one tap opens, optional 2× with a rewarded ad */
  async function starChest(k) {
    const st = S.st, x = D.STAR_CHESTS[k]; st.starChests = st.starChests || [];
    if (!x || st.starChests.includes(k) || totalStars() < x.stars) return;
    st.starChests.push(k); S.save();
    await chest(x.chest, true, `${x.stars} star chest`);
    const g = { coins: x.coins, gems: x.gems || 0 };
    if (x.skin && !st.skins.includes(x.skin)) S.grant({ skin: x.skin });
    S.grant(g); S.save();
    const pick = await ask(h`<div class="rwRays"></div><div class="mdK">${x.stars} STAR BONUS</div><div class="rwItems">${rwItems(g)}</div>${x.skin ? `<div class="mdS">+ Star Legend skin unlocked!</div>` : ''}
      <button class="btn big pulse" data-pick="ad">${ART.ic('ad')} WATCH AD · 2× BONUS</button><button class="btn ghost" data-pick="no">Collect</button>`, 'rw');
    if (pick === 'ad' && await ADS.rewarded('starChest')) { S.grant(g); S.save(); reward(g, '2× bonus'); }
    if (x.skin) { FX.win('fireworks'); }
    renderChall(); refresh();
  }
  function cPlay(id) {
    if (!NET.gate()) return; closeModal();
    const c = D.CHALLENGES.find(x => x.id === id);
    G.start({ mode: c.mode, ladder: { start: 2, grid: c.grid || 3 }, ev: { id: 'ch_' + id, name: c.name.toUpperCase(), icon: c.icon, title: `★ ${c.stars.join(' / ')} tiles`, hearts: c.hearts || 3, maxAdRevive: 1, adOnly: true, reviveHearts: 1, boss: false, ladder: true, grid: c.grid || 3, theme: ['#743ae8', '#14063a'],
      onStep: R => { const k = c.stars.filter(t => R.maxLen >= t).length; if (k > (R.cStars || 0)) { R.cStars = k; G.info('★'.repeat(k) + ` ${k} star${k > 1 ? 's' : ''}!`); } },
      onEnd: r => cEnd(c, r) } });
  }
  async function cEnd(c, r) {
    const st = S.st, rec = st.cstars[c.id] = st.cstars[c.id] || { s: 0, b: 0 };
    const k = c.stars.filter(t => r.tiles >= t).length, old = rec.s;
    rec.b = Math.max(rec.b, r.tiles); const g = { coins: 0, gems: 0 };
    for (let i = old; i < k; i++) { g.coins += D.STAR_RW[i].coins || 0; g.gems += D.STAR_RW[i].gems || 0; }
    rec.s = Math.max(old, k); S.grant(g); S.save();
    const full = k === 3 && old < 3;
    show('chall');
    await ADS.inter('run');
    modal(h`<div class="rw2"><div class="rwRib"><span>${c.name}</span></div><div class="cStars">${c.stars.map((t, i) => `<i class="${i < k ? 'on' : ''} ${i >= old && i < k ? 'new' : ''}" style="--d:${i * 220}ms">${ART.ic('star')}</i>`).join('')}</div>
      <div class="erBig"><span>${r.tiles}</span><small>tiles remembered</small></div><div class="mdS">${k === 3 ? 'All 3 stars!' : `Next star at ${c.stars[k]} tiles`}</div>
      ${g.coins || g.gems ? `<div class="rwItems">${rwItems(g)}</div>` : ''}
      ${full ? `<button class="btn big pulse" data-act="star3ad:${c.id}">${ART.ic('ad')} 3 STARS! WATCH AD · 2× ${fmt(D.STAR3_COINS * 2)} COINS</button>` : ''}
      <button class="btn big collect" data-act="cplay:${c.id}">${ART.ic('refresh')} TRY AGAIN</button><button class="btn ghost" data-act="closeModal">Back</button></div>`, 'rw');
    if (full) { S.grant({ coins: D.STAR3_COINS }); S.save(); }
    if (k > old) { SND.win(); FX.win('stars'); } else SND.lose();
    if (totalStars() >= D.STARS_FOR_SKIN && !st.skins.includes('starlord')) setTimeout(() => toast('30 stars! Claim the Star Legend skin', 'star'), 900);
  }
  function starSkin() { const st = S.st; if (totalStars() < D.STARS_FOR_SKIN || st.skins.includes('starlord')) return; S.grant({ skin: 'starlord' }); S.save(); reward({ skin: 'starlord' }, 'Star Legend'); renderChall(); }
  async function passClaim(i) {
    const p = S.passTouch(); if (i >= S.passTier() || p.got.includes(i)) return;
    p.got.push(i); S.save();
    const r = { ...D.PASS.reward(i) };
    if (r.chest) { const c = r.chest; delete r.chest; if (Object.keys(r).length) S.grant(r); await chest(c, true, 'Pass reward'); }
    else { S.grant(r); reward(r, `Pass tier ${i + 1}`); }
    if (i === D.PASS.tiers - 1) S.st.stats.passDone = (S.st.stats.passDone || 0) + 1;
    passSheet(); refresh();
  }
  async function passAll() {
    const p = S.passTouch(), tier = S.passTier(), sum = { coins: 0, gems: 0 }; const chests = [];
    const take = r => { if (r.coins) sum.coins += r.coins; if (r.gems) sum.gems += r.gems; if (r.boost) S.grant({ boost: r.boost }); if (r.skin) S.grant({ skin: r.skin }); if (r.chest) chests.push(r.chest); };
    for (let i = 0; i < tier; i++) { if (!p.got.includes(i)) { p.got.push(i); take(D.PASS.reward(i)); } if (p.gold && !p.got2.includes(i)) { p.got2.push(i); take(D.PASS.gold(i)); } }
    S.save(); S.grant(sum);
    for (const c of chests) await chest(c, true, 'Pass reward');
    reward(sum, 'Pass rewards'); passSheet(); refresh();
  }

  /* ---------- COMEBACK ---------- */
  function comeback(days) {
    const r = D.COMEBACK.r; S.grant(r);
    modal(h`<div class="rwRays"></div><div class="htFace">${ART.sanx('shock')}</div><div class="mdK">Welcome back</div><div class="mdT">${days} days without you?!</div><div class="mdS">Sanx missed beating you. Here is a comeback gift.</div><div class="rwItems">${rwItems(r)}<div class="rwI"><span class="rbIc">${ART.ic('gift')}</span><b>Silver chest</b></div></div><button class="btn big" data-act="comebackChest">OPEN GIFTS</button>`, 'rw');
  }

  /* ---------- PROFILE ---------- */
  function renderProfile() {
    const st = S.st, r = D.rank(st.xp), nx = D.nextRank(st.xp);
    const pct = nx ? (st.xp - r.xp) / (nx.xp - r.xp) * 100 : 100;
    const s = st.stats, acc = s.taps ? Math.round(s.correct / s.taps * 100) : 0;
    const best = S.best(), pAt = D.PRESTIGE_AT[st.prestige] || (100 + st.prestige * 20), canP = best >= pAt;
    const achs = D.ACH.map(a => { const got = st.ach[a.id]; const v = Math.min(a.n, S.achVal(a.k)); return `<div class="achRow ${got ? 'got' : ''}"><span class="achIc">${ART.ic(got ? 'trophy' : 'lock')}</span><div><b>${a.t}</b><small>${a.d}</small>${got ? '' : `<div class="bar"><i style="width:${v / a.n * 100}%"></i></div>`}</div><em>${ART.coin(12)}${a.c}</em></div>`; }).join('');
    const nAch = Object.keys(st.ach).length;
    const badges = st.badges.length ? st.badges.map(b => `<span class="badge">${ART.ic(D.BADGES[b].icon)}${D.BADGES[b].name}</span>`).join('') : '<span class="muted sm">Collect items, beat friends and IMPOSSIBLE 100 to earn badges</span>';
    $('profile').innerHTML = h`${topbar()}<div class="pgBody">
      <div class="pfHead"><button class="pfAv" data-act="avatars">${ART.me(S.active('frame'))}<i class="pfAvEd">${ART.ic('gear')}</i></button><div class="pfTx"><button class="pfName" data-act="rename">${esc(st.name)} ${ART.ic('gear')}</button>
        <div class="pfRank">${r.name}${st.prestige ? ` · Prestige ${D.ROMAN[Math.min(10, st.prestige)]}` : ''}</div>
        <button class="pidChip" data-act="copyId">${ART.ic('copy')} ${S.pid()}</button>
        <div class="bar xp"><i style="width:${pct}%"></i></div><small>${fmt(st.xp)} XP${nx ? ` · ${fmt(nx.xp - st.xp)} to ${nx.name}` : ' · Max rank'}</small></div></div>
      <div class="badgeRow">${badges}</div>
      <div class="stGrid">
        ${stat('Best level', best)}${stat('Best run', s.bestRun + ' lv')}${stat('Memory Score', S.memBest() + ' · ' + D.memRank(S.memBest()).name)}
        ${stat('Bosses', s.bosses)}${stat('Best combo', s.bestCombo)}${stat('Accuracy', acc + '%')}
      </div>
      <button class="collCard" data-act="weekly">${ART.ic('bars')}<div><b>Weekly brain report</b><small>Share your stats card on WhatsApp</small></div>${ART.ic('share')}</button>
      <button class="collCard" data-act="collection">${ART.ic('palette')}<div><b>My collection</b><small>${SHOP.ownedCount()} items · tap to see rewards</small></div>${ART.ic('next')}</button>
      <div class="prest ${canP ? 'ready' : ''}">${ART.ic('crown')}<div><b>Prestige ${D.ROMAN[Math.min(10, st.prestige + 1)]}</b><small>${canP ? 'Reset mode levels to 1. Keep coins, skins and items. Earn ' + D.prestigeMult(st.prestige + 1) + '× coins forever.' : `Reach level ${pAt} in any mode to unlock`}</small></div>${canP ? '<button class="btn sm" data-act="prestige">Prestige</button>' : `<em>${best}/${pAt}</em>`}</div>
      <div class="secT">Achievements <span class="muted">${nAch}/${D.ACH.length}</span></div><div class="achList">${achs}</div>
      <div class="secT">Settings</div>
      <div class="setList">
        ${tog('sfx', 'sound', 'Sound effects')}${tog('music', 'music', 'Music')}${tog('vib', 'vibrate', 'Vibration')}${tog('bg', 'image', 'Animated background')}
        <div class="volRow">${ART.ic('music')}<span>Music volume</span><input type="range" class="volR" data-vol="musicVol" min="0" max="1" step="0.05" value="${st.set.musicVol == null ? 0.7 : st.set.musicVol}"></div>
        <div class="volRow">${ART.ic('sound')}<span>Tile sound volume</span><input type="range" class="volR" data-vol="sfxVol" min="0" max="1" step="0.05" value="${st.set.sfxVol == null ? 1 : st.set.sfxVol}"></div>
        ${window.BS_PRIV ? `<button class="setRow" data-act="privOpts">${ART.ic('shield')}<span>Ad privacy choices</span>${ART.ic('next')}</button>` : ''}
        <button class="setRow" data-act="howto">${ART.ic('info')}<span>How to play</span>${ART.ic('next')}</button>
        <a class="setRow" href="https://graphikians.github.io/beat-sanx/privacy.html" target="_blank" rel="noopener">${ART.ic('lock')}<span>Privacy policy</span>${ART.ic('next')}</a>
      </div>
      <div class="ver">Beat Sanx v${window.BS_VERSION || '1.0'} · by SANX Graphikians</div></div>`;
  }
  const stat = (k, v) => `<div class="stC"><b>${v}</b><small>${k}</small></div>`;
  const tog = (k, ic, t) => `<button class="setRow" data-tog="${k}">${ART.ic(ic)}<span>${t}</span><i class="sw ${S.st.set[k] ? 'on' : ''}"></i></button>`;

  /* ---------- GAME OVER / RESULTS ---------- */
  function gameOver(o) {
    show('over');
    $('over').innerHTML = h`<div class="ovCard">
      <div class="ovFace">${ART.sanx('laugh')}</div>
      <div class="ovK">OUT OF HEARTS</div>
      <div class="ovT">${o.label || 'Level ' + o.level}</div>
      ${o.near ? `<div class="nearMiss">${o.near}</div>` : ''}
      ${o.nearPB ? `<div class="nearPB">${ART.ic('fire')} So close to your record of ${o.best} levels!</div>` : ''}
      <div class="ovS">${o.ev && o.ev.reviveHearts ? 'Keep your tiles and go on with 1 heart?' : 'Continue from this level?'}</div>
      <div class="ovBtns">
        ${o.canAd ? `<button class="btn big pulse" data-act="revAd">${ART.ic('ad')} ${o.ev && o.ev.reviveHearts ? 'Watch ad · +1 heart' : 'Watch ad · Continue'} ${o.adMax > 1 ? `<small>${o.adMax - o.adN} left</small>` : ''}</button>` : ''}
        ${o.canShield ? `<button class="btn big alt" data-act="revShield">${ART.shieldC(20)} Use shield <small>(${S.st.shields})</small></button>` : ''}
        <button class="btn ghost" data-act="giveUp">${o.canAd || o.canShield ? 'No thanks' : 'See result'}</button>
      </div></div>`;
  }
  function runEnd(r) {
    const st = S.st, rec = r.levels > 0 && r.levels >= st.stats.bestRun && !r.ev;
    show('result');
    const mood = r.levels >= 3 ? 'shock' : 'laugh';
    const line = r.levels >= 3 ? D.SANX.win[r.levels % D.SANX.win.length] : D.SANX.lose[r.levels % D.SANX.lose.length];
    const blitz = r.mode === 'blitz';
    $('result').innerHTML = h`<div class="resCard">
      <div class="resFace">${ART.sanx(mood)}<div class="heroBubble sm">${line}</div></div>
      <div class="resK">${blitz ? 'TIME UP' : 'RUN OVER'}</div>
      <div class="resBig"><span id="resN">0</span><small>${blitz ? 'steps' : r.levels === 1 ? 'level cleared' : 'levels cleared'}</small></div>
      ${rec ? `<div class="recTag">${ART.ic('trophy')} NEW BEST RUN</div>` : ''}
      <div class="resRow"><span>${ART.coin(18)} <b id="resC">0</b></span><span><b>+${fmt(r.xp)}</b> XP</span><span>Combo <b>${r.maxCombo}</b></span>${r.passPts ? `<span>${ART.ic('ticket')} <b>+${r.passPts}</b></span>` : ''}</div>
      ${!blitz ? `<div class="resNext">Next time you start at <b>Level ${S.lv(r.mode)}</b></div>` : ''}
      <div class="resAds">
      ${r.coins >= 30 && !G.run.doubled ? `<button class="btn alt" data-act="double">${ART.ic('ad')} 2× coins <small>+${fmt(r.coins)}</small></button>` : ''}
      ${r.passPts > 0 ? `<button class="btn alt" data-act="pass2x:${r.passPts}">${ART.ic('ad')} 2× Pass <small>+${r.passPts}</small></button>` : ''}</div>
      <div class="resBtns"><button class="btn big" data-act="again">${ART.ic('refresh')} PLAY AGAIN</button>${clipBtn(r)}
      <div class="row2"><button class="btn ghost" data-act="home">${ART.ic('home')} Home</button><button class="btn ghost" data-act="share">${ART.ic('share')} Share</button></div></div></div>`;
    FX.countUp($('resN'), blitz ? r.steps : r.levels, 700); FX.countUp($('resC'), r.coins, 1000);
    lbTouch(); st.lb.score = (st.lb.score || 0) + r.levels; S.save();
    announceUnlocks();
    lastRes = r;
    if (r.levels >= 5) SH.maybeRankUp();
  }
  let lastRes = null;
  function dailyEnd(r) {
    const st = S.st;
    if (r.won && !st.daily.done) { st.daily.done = true; st.stats.dailies++; S.grant({ coins: 200, xp: 300 }); S.passAdd('daily'); S.checkAch(); }
    const retry = !r.won && S.cap('dailyRetry', D.ADCAP.dailyRetry) > 0;
    show('result');
    $('result').innerHTML = h`<div class="resCard">
      <div class="resFace">${ART.sanx(r.won ? 'shock' : 'laugh')}</div>
      <div class="resK">DAILY CHALLENGE</div>
      <div class="resBig">${r.won ? 'WON' : 'FAILED'}</div>
      ${r.won ? `<div class="resRow"><span>${ART.coin(18)} <b>+200</b></span><span><b>+300</b> XP</span></div>` : `<div class="resNext">${retry ? 'One more shot?' : 'Come back tomorrow for a new pattern'}</div>`}
      ${retry ? `<button class="btn big pulse" data-act="dailyRetry">${ART.ic('ad')} Watch ad · Try again</button>` : ''}
      <div class="resBtns"><button class="btn ${retry ? 'ghost' : 'big'}" data-act="home">${ART.ic('home')} HOME</button><button class="btn ghost" data-act="share">${ART.ic('share')} Share</button></div></div>`;
    lastRes = r;
  }
  /* ================= v1.4 DAILY BEAT + MEMORY TEST ================= */
  const fillT = (a, m) => a[Math.floor(Math.random() * a.length)].replace(/\{s\}/g, m.s).replace(/\{n\}/g, m.n);
  function dbeat(practice) {
    if (!NET.gate()) return;
    const d = S.dbeatToday();
    if (d.done && !practice) { dbeatCard(); return; }
    closeSheet(); closeModal();
    G.start({ mode: 'classic', ladder: { start: D.DBEAT.start, grid: D.DBEAT.grid }, hearts: D.DBEAT.hearts, dbeat: { no: d.no, practice: !!practice } });
  }
  function startTest() { if (!NET.gate()) return; closeSheet(); closeModal(); G.start({ mode: 'classic', ladder: { start: D.TEST.start, grid: D.TEST.grid }, hearts: D.TEST.hearts, test: true }); }
  /* Wordle-style text: the same grid for everyone, no spoilers */
  function dbeatText(d) {
    const sx = D.sanxScore(d.no), n = d.score;
    const row = '🟪'.repeat(Math.min(n, 20)) + (n > 20 ? `+${n - 20}` : '') + '🟥';
    return `Beat Sanx #${d.no} 🧠 ${n} tiles\n${row}\nSanx: ${sx} ${d.win ? '→ I BEAT HIM 🏆' : '→ he wins today 😤'}${d.streak > 1 ? `\n🔥 ${d.streak}-day streak` : ''}\nSame pattern for everyone today. Can you beat ${n}?`;
  }
  function dbeatEnd(r) {
    const prac = r.dbeat.practice, n = r.tiles || 0, sx = D.sanxScore(r.dbeat.no), win = n > sx;
    let d = S.dbeatToday();
    if (!prac && !d.done) {
      d = S.dbeatDone(n, win);
      S.st.stats.dailies++; S.passAdd('daily');
      const bonus = win ? D.DBEAT.winBonus : 0; if (bonus) S.grant({ coins: bonus });
      S.grant({ xp: 100 + n * 20 }); S.checkAch();
      GR.postScore(d);
    }
    show('result');
    const line = fillT(win ? D.SANX.dwin : D.SANX.dlose, { s: sx, n });
    const pracLeft = S.cap('dbeatPrac', D.DBEAT.practiceAds);
    $('result').innerHTML = h`<div class="resCard dbEnd">
      <div class="resFace">${ART.sanx(win ? 'shock' : 'laugh')}<div class="heroBubble sm">${line}</div></div>
      <div class="resK">DAILY BEAT #${r.dbeat.no}${prac ? ' · PRACTICE' : ''}</div>
      <div class="dbVs"><div class="dbMe ${win ? 'win' : ''}"><b>${n}</b><small>YOU</small></div><div class="dbX">VS</div><div class="dbSx ${win ? '' : 'win'}"><b>${sx}</b><small>SANX</small></div></div>
      ${r.newBest ? `<div class="recTag">${ART.ic('trophy')} NEW MEMORY SCORE</div>` : ''}
      ${prac ? `<div class="resNext">Practice runs don't change your official score (${d.score}).</div>` : `<div class="dbStreak">${ART.ic('fire')} ${d.streak}-day streak${win ? ` · ${ART.coin(16)} +${D.DBEAT.winBonus} win bonus` : ''}</div>`}
      <div class="dbGrid">${'<i></i>'.repeat(Math.min(d.score || n, 24))}<i class="x"></i></div>
      <div class="dbPct" id="dbPct"></div>
      <div class="resNext">New pattern in <b>${left(new Date().setHours(24, 0, 0, 0))}</b></div>
      <div class="resBtns">
        <button class="btn big pulse" data-act="dbShare">${ART.ic('share')} SHARE MY SCORE</button>
        <button class="btn alt" data-act="groups">${ART.ic('users')} Group ranking</button>
        ${clipBtn(r)}
        ${pracLeft > 0 ? `<button class="btn alt" data-act="dbPractice">${ART.ic('ad')} Practice again <small>score stays</small></button>` : ''}
        ${getApp()}
        <div class="row2"><button class="btn ghost" data-act="home">${ART.ic('home')} Home</button><button class="btn ghost" data-act="test">${ART.ic('brain')} Memory Test</button></div></div></div>`;
    lastRes = r;
    if (!prac) GR.percentile(d.no, d.score).then(p => { const el = $('dbPct'); if (p && el) el.innerHTML = `${ART.ic('bars')} Better than <b>${p.pct}%</b> of ${fmt(p.n)} players today`; });
  }
  function dbeatCard() {
    const d = S.dbeatToday(), sx = D.sanxScore(d.no);
    modal(h`<div class="htFace">${ART.sanx(d.win ? 'shock' : 'smug')}</div><div class="mdK">Daily Beat #${d.no}</div><div class="mdT">${d.score} vs ${sx}</div>
      <div class="mdS">${d.win ? 'You beat Sanx today.' : 'Sanx won today.'} New pattern in ${left(new Date().setHours(24, 0, 0, 0))}.</div>
      <button class="btn big pulse" data-act="dbShare">${ART.ic('share')} SHARE</button>
      ${S.cap('dbeatPrac', D.DBEAT.practiceAds) > 0 ? `<button class="btn alt" data-act="dbPractice">${ART.ic('ad')} Practice run</button>` : ''}
      <button class="btn ghost" data-act="closeModal">Close</button>`);
  }
  function testEnd(r) {
    const n = r.tiles || 0, best = S.memBest(), rk = D.memRank(best), nx = D.memNext(best);
    show('result');
    const line = r.newBest ? 'Okay... that is actually impressive.' : n >= best - 1 && best > 0 ? 'So close to your best. Again!' : D.SANX.lose[n % D.SANX.lose.length];
    $('result').innerHTML = h`<div class="resCard tsEnd">
      <div class="resFace">${ART.sanx(r.newBest ? 'shock' : 'laugh')}<div class="heroBubble sm">${line}</div></div>
      <div class="resK">MEMORY TEST</div>
      <div class="resBig"><span id="resN">0</span><small>tiles remembered</small></div>
      ${r.newBest ? `<div class="recTag">${ART.ic('trophy')} NEW MEMORY SCORE</div>` : ''}
      <div class="msBadge">${ART.ic(rk.icon)}<div><small>MEMORY SCORE</small><b>${best} · ${rk.name}</b>${nx ? `<em>${nx.min - best} more tile${nx.min - best > 1 ? 's' : ''} to ${nx.name}</em>` : ''}</div></div>
      <div class="resRow"><span>${ART.coin(18)} <b>${fmt(r.coins)}</b></span><span><b>+${fmt(r.xp)}</b> XP</span></div>
      <div class="resAds">${r.coins >= 30 && !G.run.doubled && !WEB ? `<button class="btn alt" data-act="double">${ART.ic('ad')} 2× coins <small>+${fmt(r.coins)}</small></button>` : ''}</div>
      <div class="resBtns"><button class="btn big" data-act="test">${ART.ic('refresh')} TRY AGAIN</button>${clipBtn(r)}${getApp()}
      <div class="row2"><button class="btn ghost" data-act="home">${ART.ic('home')} Home</button><button class="btn ghost" data-act="share">${ART.ic('share')} Share</button></div></div></div>`;
    FX.countUp($('resN'), n, 700);
    lastRes = r;
  }
  /* ================= v1.4 SAVE CLIP: your run as a short game video ================= */
  /* v1.6: reaction / Save Clip live only in the laptop Studio (creator build), never in the app */
  const CREATOR_UI = () => !!window.BS_CREATOR && typeof REC !== 'undefined' && REC.ok();
  const clipBtn = r => window.BS_CREATOR && r && r.clip && (typeof CLIP !== 'undefined') && CLIP.canRecord() ? `<button class="btn alt clipBtn" data-act="clip">${ART.ic('play')} SAVE CLIP <small>video for Reels / Shorts</small></button>` : '';
  async function saveClip(r) {
    if (!r || !r.clip) return;
    const n = r.tiles || r.clip.seq.length, mb = S.memBest();
    const spec = { style: 'brag', seed: Date.now() % 1e6, avatar: S.avatarImg ? S.avatarImg() : null, level: S.lv('classic'), coins: S.st.coins, seq: r.clip.seq, grid: r.clip.grid, colors: r.clip.colors, score: n, name: S.st.name, rank: `Memory Score ${mb} · ${D.memRank(mb).name}`,
      mood: 'smug', mood2: n >= 9 ? 'shock' : 'laugh', sanxLine: n >= 9 ? `${n} tiles?! Okay, you are good.` : 'My memory is better. Prove me wrong.', cta: 'BEAT ME · PLAY FREE', footer: `Beat Sanx · Daily Beat #${D.dbeatNo()}`, bpm: 104 };
    modal(h`<div class="mdK">Making your video</div><div class="clipStage"><canvas id="clipCv"></canvas></div><div class="clipPg"><i id="clipPg"></i></div><div class="mdS" id="clipTx">Recording with sound · keep the app open</div>`, 'clipM');
    let out = null;
    try { out = await CLIP.make(spec, { canvas: $('clipCv'), onProgress: p => { const e = $('clipPg'); if (e) e.style.width = Math.round(p * 100) + '%'; } }); }
    catch (e) { closeModal(); toast('Could not make the video on this phone', 'x'); return; }
    closeModal();
    const text = `🧠 I remembered ${n} tiles on Beat Sanx. Can you beat me?`;
    const v = await ask(h`<div class="mdK">Your clip is ready</div><div class="mdT">${Math.round(out.secs)} sec · ${out.ext.toUpperCase()}</div><div class="mdS">Post it on Reels, Shorts, TikTok or WhatsApp status.</div><button class="btn big pulse" data-pick="share">${ART.ic('share')} SHARE / SAVE</button><button class="btn ghost" data-pick="no">Close</button>`);
    if (v === 'share') SH.fileShare(out.blob, `beat-sanx-${n}-tiles.${out.ext}`, text);
  }
  /* ================= v1.4 AVATAR PICKER ================= */
  let avSet = 'collection', avG = 'all', recOn = !!window.BS_CREATOR;
  function avatars() {
    const st = S.st, list = D.AVATARS.filter(a => a.set === avSet && (avG === 'all' || a.g === avG));
    const have = id => st.avOwned.includes(id), fresh = st.avNew || [];
    const nOwn = D.AVATARS.filter(a => a.set === avSet && have(a.id)).length, nAll = D.AVATARS.filter(a => a.set === avSet).length;
    const card = a => { const own = have(a.id), on = st.avatar === a.id, tier = D.AV_TIERS[a.tier];
      let sub, bar = '';
      if (on) sub = `${ART.ic('check')} Using`;
      else if (own) sub = fresh.includes(a.id) ? '<i class="avNewT">NEW</i>' : 'Tap to use';
      else if (a.set === 'premium') sub = `${ART.coin(13)} ${short(tier.coins)}`;
      else { const q = S.avReq(a); sub = esc(q.txt); bar = `<span class="avBar"><i style="width:${Math.round(q.cur / q.need * 100)}%"></i></span><span class="avNum">${short(q.cur)}/${short(q.need)}</span>`; }
      return `<button class="avCard t-${a.tier} ${on ? 'on' : ''} ${own ? '' : 'lock'}" data-act="avPick:${a.id}"><span class="avPic"><img src="img/av/${a.id}.webp" alt="" loading="lazy">${own ? '' : `<span class="avLk">${ART.ic('lock')}</span>`}</span><b>${esc(a.name)}</b><small>${sub}</small>${bar}${a.set === 'premium' ? `<em>${tier.name}</em>` : ''}</button>`; };
    sheet(h`<div class="shT">Your avatar</div><div class="shS">This is how other players see you in duels, rankings and your videos.</div>
      <div class="segBar"><button class="${avSet === 'collection' ? 'on' : ''}" data-act="avSet:collection">${ART.ic('star')}<span>Collection</span></button><button class="${avSet === 'premium' ? 'on' : ''}" data-act="avSet:premium">${ART.ic('crown')}<span>Premium</span></button></div>
      <div class="avHead"><b>${nOwn} / ${nAll}</b><small>${avSet === 'collection' ? 'unlocked · play to earn the rest' : 'owned · Rare 10K · Epic 50K · Mythic 2L · Legend 5L'}</small><span class="avBar big"><i style="width:${Math.round(nOwn / nAll * 100)}%"></i></span></div>
      <div class="avFil">${['all', 'm', 'f'].map(g => `<button class="${avG === g ? 'on' : ''}" data-act="avG:${g}">${{ all: 'All', m: 'Male', f: 'Female' }[g]}</button>`).join('')}</div>
      <div class="avGrid">${list.map(card).join('')}</div>
      ${st.avatar ? `<button class="btn ghost" data-act="avPick:">Use the Sanx face instead</button>` : ''}`, 'avs');
    if (fresh.length) { st.avNew = []; S.save(); }
  }
  async function avPick(id) {
    const st = S.st;
    if (!id) { st.avatar = ''; S.save(); avatars(); refresh(); return; }
    const a = D.AV[id]; if (!a) return;
    if (st.avOwned.includes(id)) { st.avatar = id; S.save(); toast(`${a.name} equipped`, 'check'); avatars(); refresh(); return; }
    if (a.set !== 'premium') { const q = S.avReq(a); toast(`${q.txt} · ${short(q.cur)}/${short(q.need)}`, 'lock'); return; }
    const price = D.AV_TIERS[a.tier].coins;
    if (st.coins < price) { toast(`You need ${short(price - st.coins)} more coins`, 'coin'); return; }
    const ok = await ask(h`<img class="avBuy" src="img/av/${a.id}.webp" alt=""><div class="mdK">${D.AV_TIERS[a.tier].name} avatar</div><div class="mdT">${esc(a.name)}</div><div class="mdS">Buy for ${ART.coin(16)} <b>${fmt(price)}</b> coins?</div><button class="btn big" data-pick="yes">${ART.ic('check')} BUY</button><button class="btn ghost" data-pick="no">Cancel</button>`);
    if (ok !== 'yes') { avatars(); return; }
    st.coins -= price; st.avOwned.push(id); st.avatar = id; S.save(); SND.win(); toast(`${a.name} is yours!`, 'crown'); avatars(); refresh();
  }
  /* v1.7: a collection avatar was earned -> one celebratory popup (never during play) */
  let avBusy = false;
  async function avUnlockCheck() {
    if (avBusy || cur === 'game' || $('modal').classList.contains('on')) return;
    const got = S.avCheck(); if (!got.length) return;
    avBusy = true;
    const a = got[0], more = got.length - 1;
    const v = await ask(h`<div class="avUnl"><div class="rwRays"></div><img src="img/av/${a.id}.webp" alt=""><div class="mdK">New avatar unlocked</div><div class="mdT">${esc(a.name)}</div><div class="mdS">${esc(S.avReq(a).txt)} ✓${more ? ` · +${more} more unlocked` : ''}</div>
      <button class="btn big pulse" data-pick="use">${ART.ic('check')} USE IT NOW</button><button class="btn ghost" data-pick="all">See all avatars</button></div>`, 'avUnlM');
    avBusy = false; SND.win && SND.win();
    if (v === 'use') { S.st.avatar = a.id; S.save(); toast(`${a.name} equipped`, 'check'); refresh(); }
    else if (v === 'all') { avSet = 'collection'; avatars(); }
  }
  function pause(resume, quit, pure) {
    modal(h`<div class="mdK">Paused</div><div class="mdT">Take a breath</div>
      ${pure ? '<div class="mdS">Ending a challenge run counts as your final score.</div>' : ''}
      <button class="btn big" data-act="resume">${ART.ic('play')} RESUME</button>
      <button class="btn ghost" data-act="quit">End run</button>
      <div class="pauseSets">${['sfx', 'music', 'vib'].map(k => `<button data-tog="${k}" class="${S.st.set[k] ? 'on' : ''}">${ART.ic(k === 'sfx' ? 'sound' : k === 'music' ? 'music' : 'vibrate')}</button>`).join('')}</div>`, 'pause');
    UI._resume = () => { closeModal(); resume(); }; UI._quit = () => { closeModal(); quit(); };
  }

  /* ================= IMPOSSIBLE 100 ================= */
  let impN = 10, impG = 3;
  function impSheet() {
    const st = S.st, I = st.imp, d = S.dayKey();
    if (I.day !== d) { I.day = d; I.entries = 0; S.save(); }
    I.bestG = I.bestG || { 3: I.best || 0 };
    impN = Math.max(D.IMP.min, Math.min(D.IMP.max, impN));
    const free = I.entries < D.IMP.freeEntries, gk = impG + ':' + impN, gemOk = (I.gemDay[gk] || '') !== d;
    const secs = D.IMP.secs(impN, impG), mins = Math.max(1, Math.round((impN * (impN + 1) / 2 * 0.75 + impN * secs * 0.35) / 60));
    const bestG = I.bestG[impG] || 0;
    sheet(h`<div class="impHead"><small>THE ULTIMATE MEMORY TEST</small><b>IMPOSSIBLE <i>100</i></b><span>${bestG ? `Your best on ${impG}×${impG}: <b>${bestG} tiles</b>` : 'Nobody has reached 100. Will you?'}</span><button class="rulesBtn" data-act="rules:imp">${ART.ic('info')} Rules</button></div>
      <div class="impGrid">${D.IMP.grids.map(g => `<button class="${g === impG ? 'on' : ''}" data-act="impG:${g}"><span class="igB" style="--g:${g}">${'<i></i>'.repeat(g * g)}</span><b>${g}×${g}</b><em>×${D.IMP.mult[g]} prize</em><small>best ${I.bestG[g] || 0}</small></button>`).join('')}</div>
      <div class="impPick"><button class="impPm" data-act="impN:-1">−</button><div class="impVal"><b id="impV">${impN}</b><small>tiles</small></div><button class="impPm" data-act="impN:1">+</button></div>
      <input type="range" id="impRange" min="${D.IMP.min}" max="${D.IMP.max}" value="${impN}" class="impRange">
      <div class="impChips">${D.IMP.quick.map(n => `<button class="${n === impN ? 'on' : ''}" data-act="impSet:${n}">${n}</button>`).join('')}</div>
      <div class="impRw"><div>${ART.coin(22)}<b>${short(D.IMP.coins(impN, impG))}</b><small>coins</small></div><div class="${gemOk ? '' : 'used'}">${ART.gem(22)}<b>${D.IMP.gems(impN, impG)}</b><small>${gemOk ? 'diamonds' : 'claimed today'}</small></div><div>${ART.ic('clock')}<b>${Math.round(secs)}s</b><small>to tap ${impN} tiles</small></div></div>
      <div class="impBoost">${ART.ic('refresh')}<span><b>Replay booster · ${D.IMP.replays} per run</b><small>Forgot? Watch an ad, the pattern plays again and you continue from the same tile.</small></span></div>
      ${impN >= 60 || impG > 3 ? `<div class="impWarn">${ART.ic('skull')} ${impG === 5 ? '5×5 is truly impossible. That is why it pays ×5.' : impG === 4 ? '4×4 pays ×3. Very few players finish it.' : impN === 100 ? 'Nobody has ever done this.' : 'Only the top 1% get here.'}</div>` : ''}
      <div class="impEntry ${free ? 'free' : ''}">${free ? `${ART.ic('gift')} 1 free entry today` : `${ART.ic('ad')} Free entry used today · more with ads`}</div>
      <button class="btn big pulse impGo" data-act="impGo">${free ? `${ART.ic('play')} START · ${impG}×${impG}` : `${ART.ic('ad')} WATCH AD · START`}</button>`, 'imp');
    const rg = $('impRange'); rg.oninput = () => { impN = +rg.value; $('impV').textContent = impN; }; rg.onchange = () => impSheet();
  }
  async function impGo() {
    if (!NET.gate()) return;
    const I = S.st.imp;
    if (I.entries >= D.IMP.freeEntries) { if (!(await ADS.rewarded('impEntry'))) return; }
    I.entries++; S.save(); closeSheet();
    G.start({ mode: 'classic', imp: { target: impN, grid: impG } });
  }
  async function impCheckpoint(len) {
    const v = await ask(h`<div class="mdK">Checkpoint</div><div class="cpFlag">${ART.ic('flag')}<b>${len}</b></div><div class="mdT">Save your progress?</div><div class="mdS">If you make a mistake later, restart from <b>${len} tiles</b> instead of giving up.</div>
      <button class="btn big pulse" data-pick="ad">${ART.ic('ad')} SAVE CHECKPOINT</button><button class="btn ghost" data-pick="skip">Skip</button>`);
    if (v !== 'ad') return false;
    return await ADS.rewarded('checkpoint');
  }
  async function impFail(o) {
    while (true) {
      const v = await ask(h`<div class="ovFace sm">${ART.sanx('laugh')}</div><div class="mdK">Mistake at tile ${o.at} of ${o.len}</div><div class="mdT">${o.cleared ? `You remembered ${o.cleared}!` : 'So soon?'}</div>
        ${o.repLeft > 0 ? `<button class="btn big pulse" data-pick="rep">${ART.ic('ad')} REPLAY · FROM TILE ${o.at}</button><div class="shS center">Pattern plays again · ${o.repLeft} replays left</div>` : ''}
        ${o.cp ? `<button class="btn big alt" data-pick="cp">${ART.ic('flag')} RESTART FROM ${o.cp}</button>` : ''}
        <button class="btn ghost" data-pick="end">End here</button>`, 'impFail');
      if (v === 'rep') {
        if (await ADS.rewarded('impCont')) return 'rep';
        const st = S.st, w = await ask(h`<div class="mdK">No ad right now</div><div class="mdT">Replay anyway?</div><div class="mdS">Use diamonds or coins instead.</div>
          <button class="btn big ${st.gems >= D.IMP.contGems ? 'pulse' : 'off'}" data-pick="gem">${ART.gem(18)} ${D.IMP.contGems} DIAMONDS</button><button class="btn big alt ${st.coins >= D.IMP.contCoins ? '' : 'off'}" data-pick="coin">${ART.coin(18)} ${fmt(D.IMP.contCoins)} COINS</button><button class="btn ghost" data-pick="back">Back</button>`);
        if (w === 'gem' && S.spend('gems', D.IMP.contGems)) return 'rep';
        if (w === 'coin' && S.spend('coins', D.IMP.contCoins)) return 'rep';
        if (w === 'gem' || w === 'coin') toast('Not enough', 'info');
        continue;
      }
      return v;
    }
  }
  function impEnd(r) {
    const st = S.st, I = st.imp, d = S.dayKey(), t = r.imp.target, won = r.won, gr = r.imp.grid || 3, gk = gr + ':' + t;
    const cleared = won ? t : r.imp.cleared;
    let g = {};
    if (won) { g.coins = D.IMP.coins(t, gr); if ((I.gemDay[gk] || '') !== d) { g.gems = D.IMP.gems(t, gr); I.gemDay[gk] = d; } I.wins++; S.passAdd('imp'); }
    else g.coins = Math.floor(cleared * cleared / 4 * D.IMP.mult[gr]);
    I.bestG = I.bestG || {}; const pb = cleared > (I.bestG[gr] || 0); if (pb) I.bestG[gr] = cleared; I.best = Math.max(I.best || 0, cleared);
    if (cleared >= 50) badge('imp50'); if (won && t >= 100) badge('imp100');
    S.grant(g); S.save();
    show('result');
    $('result').innerHTML = h`<div class="resCard imp">
      <div class="resFace">${ART.sanx(won ? 'shock' : cleared >= 20 ? 'angry' : 'laugh')}<div class="heroBubble sm">${won ? 'IMPOSSIBLE?! How...' : cleared >= 20 ? 'Your brain is scary.' : 'Ha! Told you.'}</div></div>
      <div class="resK">IMPOSSIBLE 100 · ${gr}×${gr} · TARGET ${t}</div>
      <div class="resBig"><span id="resN">0</span><small>tiles remembered</small></div>
      ${pb ? `<div class="recTag">${ART.ic('trophy')} NEW PERSONAL BEST</div>` : ''}
      <div class="resRow">${g.coins ? `<span>${ART.coin(18)} <b>+${fmt(g.coins)}</b></span>` : ''}${g.gems ? `<span>${ART.gem(18)} <b>+${g.gems}</b></span>` : ''}${won ? '' : `<span>Goal <b>${t}</b></span>`}</div>
      <div class="resAds">${g.coins >= 25 ? `<button class="btn alt" data-act="impDouble:${g.coins}">${ART.ic('ad')} 2× coins <small>+${fmt(g.coins)}</small></button>` : ''}</div>
      <div class="resBtns"><button class="btn big" data-act="imp">${ART.ic('refresh')} TRY AGAIN</button>${clipBtn(G.last)}
      <div class="row2"><button class="btn ghost" data-act="home">${ART.ic('home')} Home</button><button class="btn ghost" data-act="shareImp:${cleared}">${ART.ic('share')} Share</button></div></div></div>`;
    FX.countUp($('resN'), cleared, 900);
    if (won) FX.win('fireworks');
    lastRes = { imp: true, cleared, target: t };
  }

  /* badges */
  function badge(id) { const st = S.st; if (st.badges.includes(id)) return; st.badges.push(id); S.save(); setTimeout(() => toast(`New badge: ${D.BADGES[id].name}`, D.BADGES[id].icon), 600); }

  /* ---------- HOW TO PLAY / ONBOARDING ---------- */
  function howto(first) {
    modal(h`<div class="htFace">${first ? ART.icon(120, true) : ART.sanx('laugh')}</div>
      <div class="mdK">${first ? 'Sanx challenges you' : 'How to play'}</div>
      <div class="mdT">${first ? '"I remember everything. Bet you can\'t."' : 'Watch. Remember. Repeat.'}</div>
      <div class="htSteps">
        <div>${ART.ic('eye')}<span><b>Watch</b> the tiles light up</span></div>
        <div>${ART.ic('zap')}<span><b>Repeat</b> the same order</span></div>
        <div>${ART.ic('plus')}<span>Every round adds <b>one new tile</b></span></div>
        <div>${ART.ic('heart')}<span>Wrong tap costs a <b>heart</b></span></div>
        <div>${ART.ic('skull')}<span>Every 10th level is a <b>Boss</b></span></div>
      </div>
      <button class="btn big" data-act="${first ? 'firstPlay' : 'closeModal'}">${first ? 'ACCEPT CHALLENGE' : 'GOT IT'}</button>`, 'howto');
  }
  function rulesModal(id) {
    const fest = D.FESTS.find(f => f.id === id), er = EV.rules(id);
    const list = fest ? fest.rules : er ? er.list : D.RULES[id] || [];
    const name = fest ? fest.name : er ? er.name : ({ bts: 'Beat the Sanx', champ: 'Beat the Champion', oma: 'One Man Army', bco: 'Beat the Coins', tour: 'World Flash Tour', mania: 'Sanx Mania', daily: 'Daily Challenge', imp: 'IMPOSSIBLE 100', chal: 'Duel a Friend' })[id] || 'Rules';
    modal(h`<div class="mdK">Rules</div><div class="mdT">${name}</div><ol class="rlList">${list.map(r => `<li>${r}</li>`).join('')}</ol>${fest ? `<div class="rlRw">${ART.ic('gift')} Win: ${fest.reward.coins ? ART.coin(14) + fmt(fest.reward.coins) : ''} ${fest.reward.gems ? ART.gem(14) + fest.reward.gems : ''} + ${D.skin(fest.skin).name} skin</div>` : ''}<button class="btn big" data-act="closeModal">GOT IT</button>`, 'rules');
  }

  /* ---------- click router ---------- */
  async function onClick(e) {
    if (e.target.closest('#gBoard')) return;
    const t = e.target.closest('[data-act],[data-mode],[data-boost],[data-claim],[data-chest],[data-tab],[data-equip],[data-buyskin],[data-buyb],[data-tog],[data-go],[data-ev],[data-cos]');
    if (!t) return;
    if (t.closest('#modal') && t.dataset.pick) return;
    SND.click();
    const d = t.dataset;
    if (d.go) { if (d.go === 'events' && !S.feat('events')) { lockedToast('events'); } if (d.go === 'shop') SHOP.tab('home'); show(d.go); return; }
    if (d.ev) { if (!S.feat('events')) { lockedToast('events'); return; } EV.open(d.ev); return; }
    if (d.mode) { if (!S.unlocked(d.mode)) { toast(`Reach level ${D.MODE[d.mode].unlock} to unlock`, 'lock'); return; } selMode = d.mode; renderHome(); readySheet(d.mode); return; }
    if (d.boost) {
      if (selBoosts.includes(d.boost)) selBoosts = selBoosts.filter(b => b !== d.boost);
      else if (!S.st.boosters[d.boost]) { toast('None left · get more with coins or a free ad', 'coins'); return; }
      else if (selBoosts.length >= D.MAX_BOOSTS) { toast(`Max ${D.MAX_BOOSTS} boosters per run`, 'info'); return; }
      else selBoosts.push(d.boost);
      readyBoosts(); return;
    }
    if (d.claim) { const c = S.claimQuest(d.claim); if (c) { S.passAdd('quest'); SND.coin(); toast(`+${c} coins`, 'check'); } questsSheet(); refresh(); return; }
    if (d.chest) { const c = D.CHESTS.find(x => x.id === d.chest); if (!S.spend('coins', c.price)) { toast('Not enough coins', 'coins'); return; } closeSheet(); await chest(c.id); refresh(); return; }
    if (d.tab || d.equip || d.buyskin || d.buyb || d.cos) { SHOP.click(d, t); return; }
    if (d.tog) { S.st.set[d.tog] = !S.st.set[d.tog]; S.save(); if (d.tog === 'music') SND.music(S.st.set.music && cur !== 'game'); if (d.tog === 'bg' && typeof BG !== 'undefined') BG.refresh(); if (cur === 'profile') renderProfile(); else if (cur === 'shop') SHOP.render(); else t.classList.toggle('on', S.st.set[d.tog]); return; }
    const a = d.act; const st = S.st;
    if (!a || a === 'none') return;
    const [k, v] = a.split(':');
    const GATE = { imp: 'imp', pass: 'pass', spin: 'spin', quests: 'quests', chal: 'duel' };
    if (GATE[k] && !S.feat(GATE[k])) { lockedToast(GATE[k]); return; }
    if (!S.feat('events') && /^(ev|arena|ar[A-Z])/.test(k)) { lockedToast('events'); return; }
    switch (k) {
      case 'closeSheet': closeSheet(); break;
      case 'closeModal': closeModal(); if (modalAfter) { const f = modalAfter; modalAfter = null; f(); } break;
      case 'chestDone': if (chestRes) { const f = chestRes; chestRes = null; f(); } break;
      case 'rwDouble': if (rwLast && await ADS.rewarded('double')) { const g = rwLast; rwLast = null; S.grant(g); t.remove(); toast('Doubled!', 'coins'); FX.flyCoins(document.querySelector('.rwI')); } break;
      case 'cplay': cPlay(v); break;
      case 'cstarClaim': starSkin(); break;
      case 'passTab': passSheet(v); break;
      case 'schest': starChest(+v); break;
      case 'star3ad': { const bt = t; if (bt) bt.disabled = true; if (await ADS.rewarded('star3')) { S.grant({ coins: D.STAR3_COINS }); S.save(); reward({ coins: D.STAR3_COINS }, '2× star coins'); } else if (bt) bt.disabled = false; refresh(); } break;
      case 'passGold': passGold(); break;
      case 'passClaim2': passClaim2(+v); break;
      case 'passMis': passMis(v); break;
      case 'profile': show('profile'); break;
      case 'shop': if (v) SHOP.tab(v === 'gems' ? 'free' : v); show('shop'); break;
      case 'modes': modeSheet(); break;
      case 'ready': readySheet(selMode); break;
      case 'play': case 'playSel': if (k === 'playSel' && recOn && !REC.armed) { if (!(await REC.arm(new URLSearchParams(location.search).get('name')))) { recOn = false; break; } } play(selMode); break;
      case 'recTog': recOn = !recOn; readySheet(selMode); break;
      case 'testRec': recOn = true; if (!(await REC.arm())) { recOn = false; break; } startTest(); break;
      case 'freeBoost': { if (S.cap('freeBoost', D.ADCAP.freeBoost) <= 0) break; if (!(await ADS.rewarded('freeBoost'))) break; S.useCap('freeBoost'); freeBoost = D.BOOSTERS[Math.floor(Math.random() * D.BOOSTERS.length)].id; toast(`Free ${D.BOOST[freeBoost].name}!`, 'sparkle'); readySheet(selMode); break; }
      case 'season': { const se = D.season(); toast(`${se.name}: ${se.desc} · ends in ${left(se.end)}`, se.icon); break; }
      case 'daily': dbeat(false); break;
      case 'locked': lockedToast(v); break;
      case 'lockB': toast(`${D.BOOST[v].name} unlocks at Level ${D.BOOST_LV[v]}`, 'lock'); break;
      case 'clip': saveClip(lastRes && lastRes.clip ? lastRes : G.last); break;
      case 'avatars': avatars(); break;
      case 'avSet': avSet = v; avatars(); break;
      case 'avG': avG = v; avatars(); break;
      case 'avPick': avPick(v); break;
      case 'groups': case 'grNew': case 'grJoin': case 'grOpen': case 'grInvite': closeModal(); GR.act(k, v); break;
      case 'seg': if (v === 'shop') SHOP.tab('home'); show(v); break;
      case 'unlGo': closeModal(); ({ duel: () => show('chall'), chall: () => show('chall'), events: () => show('events'), arena: () => show('events'), imp: () => show('chall'), pass: () => { show('home'); setTimeout(() => document.querySelector('[data-act=pass]') && document.querySelector('[data-act=pass]').click(), 50); }, spin: () => show('home'), quests: () => show('home') })[v](); break;
      case 'dbShare': SH.textShare(dbeatText(S.dbeatToday())); break;
      case 'dbPractice': if (S.cap('dbeatPrac', D.DBEAT.practiceAds) <= 0) break; if (await ADS.rewarded('dbeatPrac')) { S.useCap('dbeatPrac'); dbeat(true); } break;
      case 'dbeat': dbeat(false); break;
      case 'dbSave': if (await ADS.rewarded('streak') && S.dbeatSave()) { toast('Streak saved!', 'fire'); renderHome(); } break;
      case 'test': await ADS.inter('run'); startTest(); break;
      case 'dailyRetry': if (S.cap('dailyRetry', D.ADCAP.dailyRetry) <= 0) break; if (await ADS.rewarded('dailyRetry')) { S.useCap('dailyRetry'); EV.daily(); } break;
      case 'events': show('events'); break;
      case 'live': EV.openHero(); break;
      case 'evPopGo': closeModal(); EV.openHero(); break;
      case 'weekly': SH.weekly(); break;
      case 'quests': questsSheet(); break;
      case 'qReroll': case 'qDouble': questAd(k, v); break;
      case 'questBonus': if (!st.quests.bonus) { st.quests.bonus = true; S.grant({ gems: D.QUEST_ALL_GEMS }); SND.win(); questsSheet(); refresh(); } break;
      case 'spin': spinSheet(); break;
      case 'spinFree': if (st.spin.free > 0 && !spinning) { st.spin.free--; S.save(); doSpin(); } break;
      case 'spinAd': if (spinning) break; if (st.spin.ads >= D.SPIN_AD_MAX) { toast('No more ad spins today', 'clock'); break; } if (await ADS.rewarded('spin')) { st.spin.ads++; S.save(); doSpin(); } break;
      case 'spinGem': if (spinning) break; if (!S.spend('gems', D.SPIN_GEMS)) { toast('Not enough diamonds', 'diamond'); break; } doSpin(); break;
      case 'pass': passSheet(); break;
      case 'passClaim': passClaim(+v); break;
      case 'passAll': passAll(); break;
      case 'pass2x': if (await ADS.rewarded('pass2x')) { const p = S.passTouch(); p.pts = Math.min(D.PASS.tiers * D.PASS.per, p.pts + (+v)); S.save(); t.remove(); toast(`+${v} Pass points`, 'ticket'); } break;
      case 'rank': rankSheet(); break;
      case 'lbClaim': { const p = pendingLB(); if (p) { st.lb.lastPending = false; S.save(); S.grant({ gems: LB_REWARD[p - 1] }); closeSheet(); reward({ gems: LB_REWARD[p - 1] }, `Weekly #${p}`); } break; }
      case 'chests': chestsSheet(); break;
      case 'claimLogin': claimLogin(false); break;
      case 'claimLogin2': claimLogin(true); break;
      case 'saveStreak': saveStreak(); break;
      case 'comebackChest': closeModal(); await chest(D.COMEBACK.chest, true, 'Comeback chest'); refresh(); break;
      case 'buyNoAds': SHOP.noAds(); break;
      case 'rename': modal(h`<div class="mdK">Player name</div><div class="mdT">What should Sanx call you?</div><input id="nameIn" class="nameIn" maxlength="14" value="${esc(st.name)}" autocomplete="off"><div class="nameErr" id="nameErr"></div><button class="btn big" data-act="saveName">SAVE</button><button class="btn ghost" data-act="closeModal">Cancel</button>`); setTimeout(() => { const i = $('nameIn'); if (i) { i.focus(); i.select(); i.oninput = () => { $('nameErr').textContent = ''; }; } }, 50); break;
      case 'saveName': { const n = ($('nameIn').value || '').trim(); if (!n) { $('nameErr').textContent = 'Enter a name first'; break; } st.name = n.slice(0, 14); S.save(); closeModal(); renderProfile(); toast('Name saved', 'check'); break; }
      case 'copyId': try { await navigator.clipboard.writeText(S.pid()); toast('Player ID copied', 'copy'); } catch (er) { toast(S.pid(), 'copy'); } break;
      case 'collection': SHOP.collection(); break;
      case 'prestige':
        modal(h`<div class="mdK">Prestige</div><div class="mdT">Start fresh, earn more</div><div class="mdS">All mode levels go back to 1. You keep coins, diamonds, skins and boosters. You get ${D.prestigeMult(st.prestige + 1)}× coins forever, 10 diamonds and the Prestige skin.</div><button class="btn big" data-act="doPrestige">${ART.ic('crown')} PRESTIGE</button><button class="btn ghost" data-act="closeModal">Not now</button>`);
        break;
      case 'doPrestige': st.prestige++; st.modeLv = {}; if (!st.skins.includes('prestige')) st.skins.push('prestige'); S.grant({ gems: 10 }); S.save(); S.checkAch(); closeModal(); SND.win(); reward({ gems: 10, skin: 'prestige' }, `Prestige ${D.ROMAN[Math.min(10, st.prestige)]}`); renderProfile(); break;
      case 'privOpts': if (window.BS_PRIV) window.BS_PRIV(); break;
      case 'howto': howto(false); break;
      case 'rules': rulesModal(v); break;
      case 'firstPlay': closeModal(); st.seenTut = true; S.save(); play('classic'); break;
      case 'revAd': { const ok = await ADS.rewarded('continue'); if (ok) G.revive('ad'); break; }
      case 'revShield': G.revive('shield'); break;
      case 'giveUp': G.endFromOver(); break;
      case 'double': { if (await ADS.rewarded('double')) { const b = G.doubleCoins(); t.remove(); toast(`+${fmt(b)} coins`, 'coins'); FX.flyCoins($('resC')); } break; }
      case 'impDouble': { if (await ADS.rewarded('double')) { S.add('coins', +v); t.remove(); toast(`+${fmt(+v)} coins`, 'coins'); FX.flyCoins(t); } break; }
      case 'again': await ADS.inter('run'); { const r = G.run; if (r && r.ev) EV.open(r.ev.id); else if (r && r.daily) show('home'); else play(r ? r.mode : selMode); } break;
      case 'home': await ADS.inter('run'); show('home'); afterHome(); break;
      case 'share': SH.result(lastRes || (G.run ? { mode: G.run.mode, levels: G.run.levelsDone } : null)); break;
      case 'shareImp': SH.imp(+v); break;
      case 'resume': UI._resume && UI._resume(); break;
      case 'quit': UI._quit && UI._quit(); break;
      case 'imp': if (!['home', 'chall'].includes(cur)) show('home'); impSheet(); break;
      case 'impN': impN = Math.max(D.IMP.min, Math.min(D.IMP.max, impN + (+v))); impSheet(); break;
      case 'impSet': impN = +v; impSheet(); break;
      case 'impG': impG = +v; impSheet(); break;
      case 'impGo': impGo(); break;
      case 'chal': CH.open(); break;
      default:
        if (k === 'ev') EV.act(a.slice(3), t);
        else if (k.startsWith('ch')) CH.act(a, t);
        else if (k.startsWith('sh') || k.startsWith('bg')) SHOP.act(a, t);
    }
  }
  /* home: login → comeback → event-of-the-day → challenge in clipboard */
  function afterHome() { const st = S.st; if (st.login.pending) setTimeout(loginModal, 300); else afterLogin(); }
  function afterLogin() {
    if ($('modal').classList.contains('on') || cur !== 'home') return;
    if (EV.dayPopup()) return;
    CH.checkClipboard();
  }

  function init() {
    document.body.addEventListener('click', onClick);
    document.body.addEventListener('input', e => { const r = e.target.closest && e.target.closest('.volR'); if (!r) return; S.st.set[r.dataset.vol] = +r.value; SND.setVol(); S.save(); if (r.dataset.vol === 'sfxVol') SND.tile(4, 0.2); });
    $('nav').innerHTML = [['home', 'home', 'Play'], ['chall', 'target', 'Challenges'], ['events', 'trophy', 'Events'], ['shop', 'cart', 'Shop'], ['profile', 'user', 'Me']].map(([id, ic, t]) => `<button data-go="${id}" class="${id === 'events' ? 'mid' : ''}"><span class="nvI">${ART.ic(ic)}</span><span>${t}</span><i class="nvDot"></i></button>`).join('');
    S.on(() => { if (['home', 'chall', 'shop', 'profile', 'events'].includes(cur)) { document.querySelectorAll('.curs .cur b').forEach((b, i) => b.textContent = short([S.st.coins, S.st.gems, S.st.shields][i % 3])); } });
    setInterval(() => { if (cur === 'home' && !$('sheet').classList.contains('on') && !$('modal').classList.contains('on')) renderHome(); }, 30000);
  }

  return { init, show, render, refresh, sheet, closeSheet, modal, closeModal, ask, toast, achToast, reward, rwItems, chest, chestSvg, bossExtraChest, lucky, trialEnded, gameOver, runEnd, dailyEnd, dbeat, dbeatEnd, testEnd, startTest, clipBtn, pause, howto, loginModal, afterHome, comeback, play, fmt, short, esc, left, topbar, badge, impCheckpoint, impFail, impEnd, avUnlockCheck, avatars, rulesModal, readySheet, get cur() { return cur; }, adProgress() { SHOP.adProgress(); } };
})();

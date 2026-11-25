/* ================= MACHHAR MAARO · ROUND 7 · SCREENS =================
   Mission card (zyada engaging), haar screen (naya), subah screen (naya), jeet screen (painted),
   Lucky Ticket: Chandi (free) + Sone ka (ad), WhatsApp card (chidhaane wala), kirdaar chuno sheet.
====================================================================== */
R7._im = {};
R7.load = k => new Promise(r => { if (R7._im[k]) return r(R7._im[k]); const im = new Image(); im.onload = () => { R7._im[k] = im; r(im); }; im.onerror = () => r(null); im.src = R7.A(k); });

/* ---------- 1. kirdaar chuno (sheet) ---------- */
R7.pickSheet = function (after) {
  const sh = sheet(`<div class="kick">WHO WILL YOU PROTECT?</div><div class="pkGrid">${PUBLIC_IDS.filter(i => i !== 'tommy').map(i => R7.charCard(i)).join('')}</div>
    <div class="rsDil" style="margin-top:8px"><div class="rsDilH"><span class="fl">🔥</span><div><b>HEART BONDS</b><small>hardest · biggest rewards</small></div><span class="hard">HARD</span></div><div class="pkGrid">${R7.DIL.map(i => R7.charCard(i, 1)).join('')}</div></div>`);
  sh.querySelectorAll('[data-rs]').forEach(b => b.onclick = () => { sh.className = ''; R7.pickChar(b.dataset.rs, after); });
};

/* ---------- 2. MISSION CARD ---------- */
R7.fails = n => (SV().fails = SV().fails || {})[n] || 0;
window.showIntro = function (n) {
  hideAll(); state = 'intro';
  const L = LEVELS[n - 1], w = WORLDS[L.w]; CL = L; CW = RISHTE.withChar(w); setTheme(CW.theme); G.sleepers = makeSleepers();
  const done = SAVE.objs && SAVE.objs[n] || [], sv = SV();
  pickBoost = {};
  const id = CW.cid, C = CHARS[id], hz = HZ.forLevel(L), seen = SAVE.hzSeen || {}, dmg = ({ easy: 20, medium: 30, hard: 40, pro: 40, expert: 50 })[L.tier];
  const stars = [['Complete the mission', !!SAVE.stars[n]]].concat(L.stars.map((k, i) => [STAR_OBJ[k].t, !!done[i]]));
  const p = R7.rp(id), bm = R7.bim(id), pd = R7.pend(id), hard = n > 5 && (L.boss || C.dil || R7.fails(n) >= 1 || L.tier === 'pro' || L.tier === 'expert');
  const adUsed = sv.boostAd[n] === R7.today();
  const own = BOOSTERS.filter(b => SAVE.boost[b.id] > 0);
  $('introCard').innerHTML = `
    <div class="iTop"><span class="kick">W${L.w + 1} · ${w.name}</span>${tierBadge(L.tier)}<span class="iHeart">❤️ ${RISHTE.hearts()}/5</span></div>
    <button class="icHero ${C.dil ? 'dil' : ''}" id="iChar">
      <span class="icPic">${R7.face(id) ? `<img src="${R7.A(R7.face(id))}" alt="">` : `<span class="em">${C.e}</span>`}</span>
      <span class="icInfo"><span class="icN">${C.n} ${C.dil ? '<em>HARD</em>' : ''} <i>change ▾</i></span>
        <span class="icM"><small>💞 Bond</small><span class="r7bar"><i style="width:${p}%"></i></span><b>${R7.rpTxt(p)}</b></span>
        <span class="icM bim ${bm > 70 ? 'hi' : ''}"><small>🦠 Sickness</small><span class="r7bar"><i style="width:${bm}%"></i></span><b>${Math.round(bm)}%</b></span>
        ${pd.length ? `<span class="icPd">📜 ${pd.length} request${pd.length > 1 ? 's' : ''} waiting · wakes up faster!</span>` : ''}</span>
    </button>
    <div class="iLv">${L.boss ? '👑 BOSS LEVEL' : 'LEVEL ' + n}</div>
    <div class="mname" style="margin-top:2px">${TASKS[L.task].icon} ${TASKS[L.task].name.toUpperCase()}</div>
    <div class="goal iGoal">${goalText(L)}</div>
    ${SAVE.bests && SAVE.bests[n] ? `<div class="iBest">🏆 Best ${fmt(SAVE.bests[n])}. Can you beat it?</div>` : ''}
    <div class="iRow">
      <button class="iTile" id="iHz"><span class="ie">${hz.length ? hz.slice(0, 3).map(k => HZDEF[k].i).join('') : '😌'}${hz.some(k => !seen[k]) ? '<i class="nw">NEW</i>' : ''}</span><b>${hz.length ? hz.length + ' hazards' : 'Calm night'}</b><small>💥 mistake -${dmg}% sleep</small></button>
      <button class="iTile" id="iFauj"><span class="ie">${L.boss ? R7.img('b_' + L.boss) : L.newType ? MT[L.newType].emoji : '🦟'}${L.newType ? '<i class="nw">NEW</i>' : ''}</span><b>${L.boss ? 'Boss' : 'Army'}</b><small>tap for info</small></button>
    </div>
    <div class="iStars">${stars.map(([t, ok]) => `<div class="${ok ? 'ok' : ''}"><i>${ok ? '★' : '☆'}</i>${t}</div>`).join('')}</div>
    ${hard ? `<div class="icWarn">⚠️ <b>Tough level!</b> ${L.boss ? 'The boss is very strong and the lights will go out.' : R7.fails(n) ? `You lost here ${R7.fails(n)} time${R7.fails(n) > 1 ? 's' : ''}.` : 'Most players lose here.'} Take a booster 👇</div>` : ''}
    <div class="icBst">${own.map(b => `<button class="bst2" data-b="${b.id}">${R7.img(b.img)}<i>x${SAVE.boost[b.id]}</i><small>${b.name}</small></button>`).join('')}
      <button class="bst2 ad ${adUsed ? 'used' : ''}" id="iAdB" ${adUsed ? 'disabled' : ''}><span>📺</span><small>${adUsed ? 'tomorrow' : 'FREE booster'}</small></button>
      <button class="bst2 more" id="iMoreB"><span>＋</span><small>Shop</small></button></div>
    ${SAVE.trial ? `<div class="iBest">🎁 Trial: ${RACKETS.find(r => r.id === SAVE.trial).name}</div>` : ''}
    <div class="iGo"><button class="iRound" id="iBack" title="Map">🗺️</button><button class="btn pulse" id="iStart">START ▶</button><button class="iRound" id="iShop" title="Shop">🏸</button></div>`;
  const card = $('introCard');
  const bind = () => card.querySelectorAll('.bst2[data-b]').forEach(b => b.onclick = () => { const k = b.dataset.b; pickBoost[k] = !pickBoost[k]; b.classList.toggle('sel', !!pickBoost[k]); sfx.coin(); vib(8); });
  bind();
  $('iBack').onclick = showMap; $('iShop').onclick = () => openShop('rackets', () => showIntro(n)); $('iMoreB').onclick = () => openShop('boosters', () => showIntro(n));
  $('iAdB').onclick = () => { if (adUsed) return; showAd(() => { sv.boostAd[n] = R7.today(); const b = BOOSTERS[(Math.random() * BOOSTERS.length) | 0]; SAVE.boost[b.id] = (SAVE.boost[b.id] || 0) + 1; save(); REWARD.show({ img: b.img, kick: 'FREE BOOSTER', t: b.name, sub: b.desc, cb: () => { showIntro(n); setTimeout(() => { const el = card.querySelector(`.bst2[data-b="${b.id}"]`); if (el) el.click(); }, 50); } }); }); };
  $('iStart').onclick = () => RISHTE.gate(() => { for (const k in pickBoost) if (pickBoost[k]) SAVE.boost[k]--; save(); hideAll(); startLevel(n, pickBoost); uiPlaying(true); });
  $('iChar').onclick = () => R7.pickSheet(() => showIntro(n));
  $('iHz').onclick = () => sheet(`<div class="kick">TONIGHT\'S HAZARDS</div><div class="shList">${hz.length ? hz.map(k => `<div>${HZDEF[k].i} <b>${HZDEF[k].n}</b>${seen[k] ? '' : ' <i class="nw">NEW</i>'}<small>${HZDEF[k].how}</small></div>`).join('') : '<div>😌 No hazards tonight</div>'}</div><div class="shNote">💥 Every mistake = sleep -${dmg}% (${TIERS[L.tier].name})</div>`);
  $('iFauj').onclick = () => sheet(`<div class="kick">${L.boss ? 'BOSS' : 'AAJ KI FAUJ'}</div>${L.newType ? `<div class="newm"><b>NEW MOSQUITO</b>${MT[L.newType].emoji} ${MT[L.newType].name}: ${MT[L.newType].desc}</div>` : ''}${lineup(L)}<div class="shNote">“${L.story}”</div><div class="hints">${hints(L)}</div>`);
  $('intro').classList.remove('hide'); $('intro').scrollTop = 0;
};

/* ---------- 3. HAAR SCREEN (naya) ---------- */
R7.angryImg = function (id) {
  R7._ang = R7._ang || {};
  if (R7.angry(id)) return R7.A(R7.angry(id));
  if (R7._ang[id]) return R7._ang[id];
  try {
    const F = FAM[id]; if (!F) return null; const bim = ART.i[F.b], fi = F.f && F.f[2] && ART.i[F.f[2]]; if (!bim || !bim.width) return null;
    const c = document.createElement('canvas'); c.width = bim.width + 30; c.height = bim.height + 40; const g = c.getContext('2d');
    g.drawImage(bim, 15, 30); if (fi && fi.width) { if (F.papa) g.drawImage(fi, 0, 2); else g.drawImage(fi, 15, 30, bim.width, bim.height); }
    return (R7._ang[id] = c.toDataURL('image/webp', 0.85));
  } catch (e) { return null; }
};
(function () {
  const ov = $('over'), keep = id => $(id);
  const nodes = { t: keep('oTitle'), s: keep('oShout'), m: keep('oMsg'), rv: keep('oRevive'), ag: keep('oAgain'), mp: keep('oMap') };
  const hid = document.createElement('div'); hid.style.display = 'none'; ['oIcon', 'oProg', 'oStats', 'oTip'].forEach(i => hid.appendChild($(i)));
  const wrap = document.createElement('div'); wrap.className = 'ovv';
  wrap.innerHTML = `<div class="ovStage"><div class="ovGlow"></div><img class="ovChar" id="oChar" alt=""><img class="ovKallu" src="${R7.A('kallu_hasta')}" alt=""><div class="ovHa">HA HA HA!</div></div><div class="ovT"></div><div class="ovBar" id="oBar"><i></i><span></span></div><div class="ovMsgW"></div><div class="ovRevW"></div><div class="ovRow"></div><div class="ovMeta" id="oMeta"></div>`;
  wrap.querySelector('.ovT').append(nodes.t, nodes.s); wrap.querySelector('.ovMsgW').append(nodes.m); wrap.querySelector('.ovRevW').append(nodes.rv); wrap.querySelector('.ovRow').append(nodes.ag, nodes.mp);
  nodes.rv.className = 'ovRev'; nodes.rv.innerHTML = `<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19"/><circle class="rg" cx="22" cy="22" r="19"/></svg><span class="rn" id="oRevN">5</span><span class="rvT"><b>REVIVE</b><small>📺 continue · sleep back to 55%</small></span>`;
  nodes.ag.className = 'btn2 ovAg'; nodes.ag.innerHTML = '↻ Retry'; nodes.mp.className = 'btn2 ovMp'; nodes.mp.innerHTML = '🗺️ Map';
  ov.innerHTML = ''; ov.append(wrap, hid);
  const _so = window.showOver;
  window.showOver = function (kind, title, msg) {
    _so.apply(this, arguments);
    const tok = R7.ovTok = (R7.ovTok || 0) + 1, sv0 = SV(); if (!CL.yam && !CL.ev) { sv0.fails = sv0.fails || {}; sv0.fails[CL.n] = (sv0.fails[CL.n] || 0) + 1; }
    const chk = () => { if (tok !== R7.ovTok) return; if (ov.classList.contains('hide')) return setTimeout(chk, 80); fill(kind); }; chk();
  };
  const fill = function (kind) {
    const sv = SV();     const id = (G.wakeS && G.wakeS.cid) || CW.cid, src = kind === 'wake' ? R7.angryImg(id) : null; if (kind === 'wake' && CHARS[id]) $('oTitle').textContent = CHARS[id].woke;
    const ch = $('oChar'); ch.src = src || R7.A('kallu_hasta'); ch.style.display = src ? '' : 'none'; ov.classList.toggle('noChar', !src);
    const p = progress(), pct = CL.len ? clamp(G.t / CL.len, 0, 1) : p.max ? clamp(p.cur / p.max, 0, 1) : 0.5;
    const bar = $('oBar'); bar.querySelector('i').style.width = '0%'; setTimeout(() => bar.querySelector('i').style.width = Math.round(pct * 100) + '%', 250);
    const pp = Math.round(pct * 100); bar.querySelector('span').textContent = pp >= 60 ? `${pp}% done · only ${100 - pp}% to go!` : `${pp}% done · you will get it next time!`;
    // revive: 5 sec ring
    clearInterval(revTimer); const rv = $('oRevive');
    if (!G.revived) { rv.classList.remove('gone'); rv.style.display = ''; let c = 5; $('oRevN').textContent = c; rv.classList.remove('run'); void rv.offsetWidth; rv.classList.add('run'); revTimer = setInterval(() => { c--; $('oRevN').textContent = Math.max(0, c); if (c <= 0) { clearInterval(revTimer); rv.classList.add('gone'); } }, 1000); }
    setTimeout(() => { const lb = R7.lastBim, m = $('oMeta'); if (!m) return; m.innerHTML = lb && lb.id ? `<span>🦠 ${CHARS[lb.id].n} sickness <b>+${lb.add}%</b> (${Math.round(R7.bim(lb.id))}%)</span><span>💞 Bond <b>${R7.rpTxt(R7.rp(lb.id))}</b> ▼</span>` : ''; }, 60);
    try { sfx.laugh(); } catch (e) { }
  };
})();

/* ---------- 4. SUBAH SCREEN (naya): raat se subah, khush jaagta kirdaar ---------- */
window.drawMorning = function () {
  const c = G.cine; if (!c || c.type !== 'morning' || c.t < 0 || c.r7) return; c.r7 = 1;
  const id = CW.cid, ro = ART.R0 && ART.R0() ? ART.R0().bg : 'room', el = document.createElement('div'); el.id = 'r7morn';
  const birds = Array.from({ length: 5 }, (_, i) => `<svg class="mnBird" style="--d:${0.4 + i * 0.18}s;--y:${18 + i * 7}%;--s:${0.7 + (i % 3) * 0.2}" viewBox="0 0 40 20"><path d="M0 10 Q10 0 20 10 Q30 0 40 10 Q30 5 20 14 Q10 5 0 10z"/></svg>`).join('');
  el.innerHTML = `<div class="mnRoom" style="background-image:url(${R7.A(ro)})"></div><div class="mnSky"></div><div class="mnGlow"></div>${birds}
    <div class="mnKick">GOOD MORNING!</div><img class="mnChar" src="${R7.A(R7.subah(id))}" alt=""><div class="mnBub">${c.line || ''}</div>
    <div class="mnStars">${[0, 1, 2].map(i => `<img class="${i < c.st ? 'on' : ''}" style="--i:${i}" src="${R7.A('star')}">`).join('')}</div>`;
  document.body.appendChild(el);
};
(function () {
  const clear = () => { const el = $('r7morn'); if (el) { el.classList.add('out'); setTimeout(() => el.remove(), 500); } };
  const _sw = window.showWin; window.showWin = function () { const r = _sw.apply(this, arguments); setTimeout(clear, 80); return r; };
  const _sm = window.showMap; window.showMap = function () { clear(); return _sm.apply(this, arguments); };
})();

/* ---------- 5. JEET SCREEN: painted kirdaar + rishta meter ---------- */
(function () {
  const hero = document.querySelector('#win .wHero'), title = $('wTitle');
  const art = document.createElement('div'); art.className = 'wArt'; art.innerHTML = `<img id="r7wChar" alt="">`; hero.insertBefore(art, title);
  const wa = document.querySelector('#win .wGo .sharebtn'); if (wa) { const row = document.createElement('div'); row.className = 'wWa'; row.appendChild(wa); wa.querySelector('span').textContent = 'Post a status · tease your friends 😏'; document.querySelector('#win .wGo').after(row); }
  const met = document.createElement('div'); met.className = 'wMet'; met.id = 'r7wMet'; document.querySelector('#win .wProg').after(met);
  const _sw = window.showWin;
  window.showWin = function (st, objs) {
    const id = CW && CW.cid, before = id ? R7.rp(id) : 0;
    _sw.apply(this, arguments);
    if (CL.ev || CL.yam || state !== 'win' && $('win').classList.contains('hide')) return;
    $('r7wChar').src = R7.A(CL.boss ? 'trophy' : R7.subah(id)); art.classList.toggle('boss', !!CL.boss);
    const after = R7.rp(id), bm = R7.bim(id), dif = after - before;
    $('wChE').innerHTML = R7.face(id) ? `<img class="wFace" src="${R7.A(R7.face(id))}">` : CHARS[id].e; $('wRl').textContent = `${CHARS[id].n} ${R7.rpTxt(after)}`; $('wRs').textContent = dif > 0 ? `💞 +${dif.toFixed(1)}%` : '💞 bond';
    const el = $('wRingR'); el.style.setProperty('--rp', 0); setTimeout(() => el.style.setProperty('--rp', Math.round(after)), 600);
    const pd = R7.pend(id).length, hs = Object.keys(SV().hosp);
    met.innerHTML = `<div class="wmR"><span>💞 Bond with ${CHARS[id].n}</span><b>${R7.rpTxt(after)}</b></div><div class="r7bar"><i id="r7wRb" style="width:${before}%"></i></div>
      <div class="wmR sm"><span>🦠 Sickness ${Math.round(bm)}%</span><span>${pd ? `📜 ${pd} request${pd > 1 ? 's' : ''} waiting` : '😊 no requests'}</span></div>
      ${hs.length ? `<div class="wmH">🏥 ${hs.map(h => CHARS[h].n).join(', ')} in hospital · 💊 this win = +1 medicine</div>` : ''}`;
    setTimeout(() => { const b = $('r7wRb'); if (b) b.style.width = after + '%'; }, 700);
  };
})();

/* ---------- 6. LUCKY TICKET: Chandi (free) + Sone ka (ad) ---------- */
NASHA.goldRoll = function () {
  const r = Math.random();
  if (r < 0.33) return { k: 'jack', t: '👑 JACKPOT!', c: 800, g: 8, big: 1 };
  if (r < 0.62) return { k: 'gems', t: '💎 10 GEMS!', g: 10 };
  if (r < 0.84) return { k: 'coins', t: '🪙 500 COINS!', c: 500 };
  return { k: 'pack', t: '🎒 3 BOOSTERS!', b3: 1 };
};
NASHA.ticket = function () {
  const box = $('wTicket'), nx = $('wNextCard'); if (!box) return;
  const R2 = this.roll(); box.style.display = ''; nx.style.display = 'none'; box.className = 'ticket tk2';
  box.innerHTML = `<div class="tk2H"><b>🎟️ LUCKY TICKET</b><span class="tk2T" id="tkT">⏳ this screen only</span></div>
    <div class="tk2R">
      <div class="tkSl" id="tkSl"><img class="tkBg" src="${R7.A('tk_silver')}" alt=""><div class="tkSRow">${R2.s.map((x, i) => `<div class="tkCell" data-i="${i}"><i>${x}</i><canvas></canvas></div>`).join('')}</div><div class="tkLab">SILVER · FREE</div><div class="tkRes" id="tkRes">👆 scratch all three</div></div>
      <button class="tkGl" id="tkAgain"><img class="tkBg" src="${R7.A('tk_gold')}" alt=""><span class="tkGsp"></span><div class="tkLab g">GOLD TICKET</div>
        <ul class="tkLad"><li>👑 Jackpot 800🪙+8💎</li><li>💎 10 gems</li><li>🪙 500 coins</li><li>🎒 3 boosters</li></ul><div class="tkGo">📺 OPEN</div><div class="tkOdds">1 in 3 chance of a jackpot</div></button>
    </div><div class="tk2N" id="tkN"></div>`;
  // chandi: khurchne wala
  const cells = [...box.querySelectorAll('.tkCell')], open = [false, false, false]; let done = false;
  cells.forEach(c => { const cv = c.querySelector('canvas'), r = c.getBoundingClientRect(); cv.width = 120; cv.height = 120; const g = cv.getContext('2d'); const gr = g.createLinearGradient(0, 0, 120, 120); gr.addColorStop(0, '#e9e6f5'); gr.addColorStop(0.5, '#b9b3d6'); gr.addColorStop(1, '#efecf9'); g.fillStyle = gr; g.fillRect(0, 0, 120, 120); g.fillStyle = 'rgba(116,58,232,.55)'; g.font = '900 34px Poppins'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', 60, 62); let n = 0;
    const scr = e => { const b = cv.getBoundingClientRect(), x = (e.clientX - b.left) / b.width * 120, y = (e.clientY - b.top) / b.height * 120; g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(x, y, 22, 0, 7); g.fill(); n++; if (n % 3 === 0) tone(900 + Math.random() * 400, 700, 0.03, 0.03, 'square'); if (n > 7) reveal(+c.dataset.i); };
    cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); scr(e); }); cv.addEventListener('pointermove', e => { if (e.buttons) scr(e); }); });
  const finish = () => {
    if (done) return; done = true;
    if (R2.c) SAVE.coins += R2.c; if (R2.g) SAVE.gems += R2.g; if (R2.b) SAVE.boost[R2.b] = (SAVE.boost[R2.b] || 0) + 1; save();
    const rw = [R2.c ? `🪙 +${R2.c}` : '', R2.g ? `💎 +${R2.g}` : '', R2.b ? '🎒 +1' : ''].filter(Boolean).join(' ');
    $('tkRes').innerHTML = `<b>${R2.t.split('!')[0]}!</b> ${rw}`; $('tkSl').classList.add(R2.near ? 'near' : 'won');
    [0, 4, 7].forEach((n, i) => tone(NOTES[n], NOTES[n], 0.2, 0.08, 'triangle', i * 0.07)); vib(30);
    const g = $('tkAgain'); if (g && !g.disabled) { g.classList.add('tease'); $('tkN').innerHTML = `👀 The gold ticket pays <b>5X</b>! Open it now`; }
  };
  const reveal = i => { if (open[i]) return; open[i] = true; cells[i].classList.add('open'); tone(700 + i * 180, 1100 + i * 220, 0.12, 0.09, 'triangle'); vib(12); const sh = R2.s.filter((_, k) => open[k]); if (open.filter(Boolean).length === 2 && sh[0] === sh[1]) { $('tkRes').innerHTML = `<b>🔥 ONE MORE! ${sh[0]}${sh[0]}…?</b>`; sfx.heart(1); } if (open.every(Boolean)) setTimeout(finish, 250); };
  cells.forEach((c, i) => c.addEventListener('dblclick', () => reveal(i)));
  // sone ka: ad
  let left = 25; const T = $('tkT'), gb = $('tkAgain');
  clearInterval(this._tkI); this._tkI = setInterval(() => { left--; if (!document.body.contains(T)) return clearInterval(this._tkI); T.textContent = `⏳ ${left}s · this screen only`; if (left <= 0) { clearInterval(this._tkI); if (!gb.dataset.open) { gb.disabled = true; gb.classList.add('exp'); gb.querySelector('.tkGo').textContent = 'next win'; T.textContent = '⌛ time up'; } } }, 1000);
  gb.onclick = () => {
    if (gb.dataset.open || gb.disabled) return;
    showAd(() => {
      gb.dataset.open = 1; clearInterval(this._tkI); const R = this.goldRoll();
      if (R.c) SAVE.coins += R.c; if (R.g) SAVE.gems += R.g; if (R.b3) for (let i = 0; i < 3; i++) { const b = BOOSTERS[(Math.random() * BOOSTERS.length) | 0]; SAVE.boost[b.id] = (SAVE.boost[b.id] || 0) + 1; } save();
      gb.classList.add('opened'); gb.querySelector('.tkGo').textContent = R.t; T.textContent = '✨ opened';
      REWARD.show({ img: R.k === 'jack' ? 'trophy' : R.k === 'gems' ? 'x_gems2' : R.k === 'coins' ? 'x_coins3' : 'x_starter', kick: 'GOLD TICKET', t: R.t, sub: [R.c ? `🪙 +${R.c}` : '', R.g ? `💎 +${R.g}` : '', R.b3 ? '🎒 3 boosters' : ''].filter(Boolean).join(' · '), to: '#wCoins' });
      if (R.big) { G.flash = 1; vib([80, 40, 80, 40, 200]); }
    });
  };
  META.x('Variable Reward + Anchoring (Chandi vs Sone)');
};

/* ---------- 7. WHATSAPP CARD: dost ko chidhaao ---------- */
R7.TAG = ['Night shift all night, zero credit in the morning 😤', 'Mosquitoes change route when they see me 😏', 'Mosquitoes are BANNED from my house 🚫', 'Papa has no idea I saved his sleep 😎', 'The racket swings, the mosquito falls ⚡', 'Even Kallu is scared of me 😈', 'Guardian of sleep, that is me 🛡️'];
SHARE.recordCard = async function () {
  const W2 = 1080, H2 = 1920, cv2 = document.createElement('canvas'); cv2.width = W2; cv2.height = H2; const c = cv2.getContext('2d'), s = this.stats();
  this.base(c, W2, H2);
  const [kal, hr] = await Promise.all([R7.load('kallu_haara'), R7.load((HEROES.find(h => h.id === R7.hero()) || HEROES[0]).img)]);
  c.textAlign = 'center'; c.textBaseline = 'middle';
  // Kallu haara hua, beech mein
  if (kal) { c.save(); c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = 50; c.drawImage(kal, W2 / 2 - 300, 250, 600, 600); c.restore();
    c.save(); c.translate(W2 / 2 + 250, 330); c.rotate(0.22); c.fillStyle = '#fff'; c.beginPath(); c.roundRect(-175, -46, 350, 92, 24); c.fill(); this.txt(c, 'DEFEATED 😵', 0, 4, 42, '#3b14a8', 900); c.restore(); }
  this.txt(c, 'I SWATTED', W2 / 2, 905, 74, '#e2d6ff', 900, '#2a1270', 10);
  const num = fmt(s.tk); let fs = 260; c.font = `900 ${fs}px Poppins`; while (c.measureText(num).width > W2 - 180 && fs > 120) { fs -= 6; c.font = `900 ${fs}px Poppins`; }
  this.txt(c, num, W2 / 2, 1085, fs, '#fff', 900, '#2a1270', 20, 'rgba(127,212,255,.95)');
  this.txt(c, 'MOSQUITOES', W2 / 2, 1260, 84, '#fff', 900, '#2a1270', 12);
  // challenge
  const g = c.createLinearGradient(0, 1340, 0, 1560); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#e4daff'); c.fillStyle = g; c.save(); c.shadowColor = 'rgba(127,212,255,.8)'; c.shadowBlur = 50; c.beginPath(); c.roundRect(80, 1340, W2 - 160, 220, 60); c.fill(); c.restore();
  { let f = 66; c.font = `900 ${f}px Poppins`; while (c.measureText('WHAT IS YOUR RECORD? 😏').width > W2 - 220) { f -= 2; c.font = `900 ${f}px Poppins`; } this.txt(c, 'WHAT IS YOUR RECORD? 😏', W2 / 2, 1420, f, '#3b14a8', 900); }
  c.font = '800 34px Poppins'; c.fillStyle = '#743ae8'; c.fillText('Play and prove it', W2 / 2, 1500);
  // hero badge
  const bw = 640, bx = W2 / 2 - bw / 2, by = 1610; c.fillStyle = 'rgba(10,4,30,.55)'; c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 3; c.beginPath(); c.roundRect(bx, by, bw, 120, 60); c.fill(); c.stroke();
  if (hr) c.drawImage(hr, bx + 14, by - 30, 130 * hr.width / hr.height, 150);
  c.textAlign = 'left'; this.txt(c, s.name, bx + 150, by + 44, 40, '#fff', 900); c.font = '800 26px Poppins'; c.fillStyle = 'rgb(127,212,255)'; c.fillText('🏆 ' + s.rank + '  ·  🔥 ' + s.combo + ' combo', bx + 150, by + 86); c.textAlign = 'center';
  c.font = 'italic 700 30px Poppins'; c.fillStyle = '#e2d6ff'; c.fillText('"' + R7.TAG[new Date().getDay()] + '"', W2 / 2, 1790);
  c.font = '800 28px Poppins'; c.fillStyle = '#fff'; c.fillText('📲 Search "Machhar Maaro" on the Play Store', W2 / 2, 1850);
  c.font = '700 22px Poppins'; c.fillStyle = '#b9a6ef'; c.fillText('A SANX Graphikians Game · ' + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), W2 / 2, 1888);
  return cv2;
};
SHARE.levelCard = async function () {
  const W2 = 1080, H2 = 1920, cv2 = document.createElement('canvas'); cv2.width = W2; cv2.height = H2; const c = cv2.getContext('2d'), s = this.stats();
  const id = CW.cid, ch = CHARS[id] || { n: 'Papa' }, st = SAVE.stars[CL.n] || 0;
  this.base(c, W2, H2);
  const img = await R7.load(R7.subah(id));
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = '800 34px Poppins'; c.fillStyle = 'rgb(127,212,255)'; c.fillText(`LEVEL ${CL.n} · ${WORLDS[CL.w].name.toUpperCase()}`, W2 / 2, 290);
  if (img) { c.save(); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 40; const w = 860, h = w * img.height / img.width; c.drawImage(img, W2 / 2 - w / 2, 330, w, h); c.restore(); }
  this.txt(c, `${ch.n.toUpperCase()}\'S SLEEP`, W2 / 2, 960, 80, '#fff', 900, '#2a1270', 12);
  this.txt(c, 'IS SAVED! 😴', W2 / 2, 1060, 100, '#fff', 900, '#2a1270', 14, 'rgba(154,109,245,.9)');
  [0, 1, 2].forEach(i => this.star(c, W2 / 2 + (i - 1) * 170, 1190 + (i === 1 ? -16 : 0), i === 1 ? 80 : 64, i < st));
  this.txt(c, fmt(G.score), W2 / 2, 1330, 120, '#fff', 900, null, 0, 'rgba(127,212,255,.8)');
  c.font = '700 30px Poppins'; c.fillStyle = '#e2d6ff'; c.fillText(`🦟 ${G.kills} swatted  ·  🔥 ${G.st.maxCombo} combo`, W2 / 2, 1410);
  this.challenge(c, W2, 1480, 'BET YOU CAN NOT 😏', `Beat ${fmt(G.score)} on Level ${CL.n}`);
  this.footer(c, W2, H2); return cv2;
};

/* ---------- 8. CSS ---------- */
R7.css(`
.pkGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;justify-items:center}
.pkGrid .rsC{width:100%}
/* mission card */
.icHero{display:flex;gap:12px;align-items:center;width:100%;border:1px solid rgba(255,255,255,.18);border-radius:18px;padding:8px 10px;margin:8px 0 6px;background:linear-gradient(135deg,rgba(154,109,245,.35),rgba(28,12,79,.55));color:#fff;text-align:left}
.icHero.dil{background:linear-gradient(135deg,rgba(255,61,110,.35),rgba(116,58,232,.5));border-color:rgba(255,140,170,.6)}
.icPic{width:70px;height:70px;border-radius:50%;overflow:hidden;flex:none;border:3px solid #fff;box-shadow:0 0 18px rgba(154,109,245,.8);background:#4a1fa8;display:flex;align-items:center;justify-content:center}
.icPic img{width:100%;height:100%;object-fit:cover;object-position:50% 12%}.icPic .em{font-size:36px}
.icInfo{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.icN{font:900 16px Poppins;display:flex;align-items:center;gap:6px}.icN em{font:900 9px Poppins;font-style:normal;background:#ff3d6e;padding:2px 6px;border-radius:6px;letter-spacing:1px}.icN i{margin-left:auto;font:700 10px Poppins;font-style:normal;opacity:.75}
.icM{display:grid;grid-template-columns:62px 1fr 38px;align-items:center;gap:6px}.icM small{font:700 10px Poppins;opacity:.85}.icM .r7bar{margin:0}.icM b{font:800 11px Poppins;text-align:right}
.icM.bim .r7bar i{background:linear-gradient(90deg,#9a6df5,#ff6b8a)}.icM.bim.hi b{color:#ff8fa8}
.icPd{font:700 10px Poppins;color:#ffd0dc}
.icWarn{margin:8px 0 2px;padding:8px 10px;border-radius:12px;background:rgba(255,61,110,.16);border:1px solid rgba(255,140,170,.55);font:600 11px/1.35 Poppins;text-align:left;animation:wPulse 1.6s infinite}
@keyframes wPulse{50%{box-shadow:0 0 16px rgba(255,61,110,.45)}}
.icBst{display:flex;gap:7px;overflow-x:auto;padding:8px 2px 4px;scrollbar-width:none}.icBst::-webkit-scrollbar{display:none}
.bst2{position:relative;flex:none;width:62px;border:1.5px solid rgba(255,255,255,.2);border-radius:14px;background:rgba(255,255,255,.07);color:#fff;padding:5px 2px 4px;display:flex;flex-direction:column;align-items:center}
.bst2 img{width:40px;height:40px;object-fit:contain}.bst2 span{font-size:26px;line-height:40px}.bst2 small{font:700 8.5px/1.1 Poppins;margin-top:2px;text-align:center}
.bst2 i{position:absolute;top:-6px;right:-4px;background:#fff;color:#4a1fa8;font:900 9px Poppins;font-style:normal;border-radius:8px;padding:1px 5px}
.bst2.sel{border-color:#fff;background:linear-gradient(170deg,#9a6df5,#4a1fa8);box-shadow:0 0 14px rgba(154,109,245,.9);transform:translateY(-2px)}
.bst2.sel:after{content:'✓';position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);background:#fff;color:#4a1fa8;border-radius:50%;width:16px;height:16px;font:900 10px/16px Poppins}
.bst2.ad{background:linear-gradient(170deg,rgba(127,212,255,.4),rgba(116,58,232,.5));border-color:rgb(127,212,255);animation:wPulse2 1.4s infinite}.bst2.ad.used{animation:none;opacity:.45}
@keyframes wPulse2{50%{box-shadow:0 0 14px rgba(127,212,255,.7)}}
.bst2.more{border-style:dashed}
#iFauj .ie img{width:34px;height:34px;object-fit:contain;vertical-align:middle}
/* over */
#over{justify-content:flex-start!important;padding-top:max(14px,env(safe-area-inset-top))!important;overflow-y:auto}
.ovv{width:100%;max-width:420px;margin:0 auto;display:flex;flex-direction:column;align-items:center;text-align:center;position:relative;z-index:2}
.ovStage{position:relative;width:100%;height:230px;margin-top:6px}
.ovGlow{position:absolute;left:50%;top:52%;width:300px;height:220px;transform:translate(-50%,-50%);background:radial-gradient(ellipse,rgba(255,61,110,.45),rgba(116,58,232,0) 70%);animation:spPulse 1.2s infinite}
.ovChar{position:absolute;left:2%;bottom:0;width:74%;max-height:220px;object-fit:contain;filter:drop-shadow(0 12px 24px rgba(0,0,0,.6));animation:ovShake .5s .1s ease-in-out 3,ovIn .45s cubic-bezier(.2,1.5,.4,1) both;transform-origin:50% 100%}
.ovKallu{position:absolute;right:-2%;top:2%;width:40%;filter:drop-shadow(0 8px 16px rgba(0,0,0,.5));animation:ovLaugh .35s ease-in-out infinite alternate,ovIn .5s .25s cubic-bezier(.2,1.5,.4,1) both}
#over.noChar .ovKallu{left:50%;right:auto;transform:translateX(-50%);width:56%}
.ovHa{position:absolute;right:4%;top:0;font:900 16px Poppins;color:#fff;transform:rotate(12deg);text-shadow:0 2px 0 #4a1fa8;animation:rwBlink .5s infinite}
@keyframes ovShake{20%{transform:translateX(-7px) rotate(-1.5deg)}40%{transform:translateX(7px) rotate(1.5deg)}60%{transform:translateX(-5px)}80%{transform:translateX(4px)}}
@keyframes ovIn{from{opacity:0;transform:scale(.6)}}
@keyframes ovLaugh{to{transform:rotate(-6deg) translateY(-4px)}}
.ovT #oTitle{font:900 30px/1.05 Poppins;margin-top:4px;text-shadow:0 4px 0 #4a1fa8,0 0 24px rgba(255,61,110,.6)}
.ovT #oShout{display:inline-block;margin-top:8px;background:#fff;color:#4a1fa8;font:800 14px Poppins;padding:6px 14px;border-radius:16px;position:relative}
.ovT #oShout:empty{display:none}
.ovT #oShout:before{content:'';position:absolute;top:-7px;left:30%;border:7px solid transparent;border-bottom-color:#fff;border-top:0}
.ovBar{position:relative;width:88%;height:26px;border-radius:14px;background:rgba(255,255,255,.1);margin:14px 0 4px;overflow:hidden;border:1px solid rgba(255,255,255,.2)}
.ovBar i{position:absolute;inset:0 auto 0 0;width:0;background:linear-gradient(90deg,#743ae8,#9a6df5,rgb(127,212,255));transition:width 1.1s cubic-bezier(.2,1,.3,1)}
.ovBar span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:800 11px Poppins;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.6)}
.ovMsgW #oMsg{font:700 13px Poppins;color:#ffd0dc;margin:4px 0}
.ovRev{position:relative;display:flex;align-items:center;gap:12px;width:88%;margin:10px 0 6px;padding:12px 16px;border:0;border-radius:22px;background:linear-gradient(180deg,#fff,#e5dcff);color:#3b14a8;box-shadow:0 0 0 3px rgba(255,255,255,.35),0 0 34px rgba(127,212,255,.8),0 10px 26px rgba(0,0,0,.4);animation:revP 1s infinite}
.ovRev svg{position:absolute;left:12px;top:50%;width:52px;height:52px;transform:translateY(-50%) rotate(-90deg)}
.ovRev circle{fill:none;stroke:rgba(116,58,232,.18);stroke-width:4}.ovRev circle.rg{stroke:#743ae8;stroke-linecap:round;stroke-dasharray:119.4;stroke-dashoffset:0}
.ovRev.run circle.rg{animation:revRing 5s linear forwards}
.ovRev .rn{width:52px;height:52px;flex:none;display:flex;align-items:center;justify-content:center;font:900 22px Poppins;position:relative}
.ovRev .rvT{display:flex;flex-direction:column;align-items:flex-start}.ovRev b{font:900 24px/1 Poppins;letter-spacing:1px}.ovRev small{font:700 11px Poppins;color:#743ae8;margin-top:3px}
.ovRev.gone{opacity:.35;animation:none;filter:grayscale(.8);pointer-events:none}
@keyframes revRing{to{stroke-dashoffset:119.4}}@keyframes revP{50%{transform:scale(1.03)}}
.ovRow{display:flex;gap:10px;width:88%}.ovRow .btn2{flex:1;margin:0!important}
.ovMeta{display:flex;flex-wrap:wrap;gap:6px 14px;justify-content:center;margin-top:10px;font:600 11px Poppins;color:#d9ccff}
/* morning */
#r7morn{position:fixed;inset:0;z-index:40;overflow:hidden;pointer-events:none}
#r7morn.out{animation:rwOut .5s forwards}
.mnRoom{position:absolute;inset:0;background-size:cover;background-position:30% bottom;animation:mnRoom 3.4s ease-in-out both}
.mnSky{position:absolute;inset:0;background:linear-gradient(180deg,#1a0b3d,#2a1270);mix-blend-mode:multiply;animation:mnSky 3.4s ease-in-out both}
.mnGlow{position:absolute;left:-20%;right:-20%;top:-30%;height:80%;background:radial-gradient(ellipse at 50% 0%,rgba(255,255,255,.75),rgba(217,204,255,.35) 40%,transparent 70%);opacity:0;animation:mnGlow 3.4s ease-in-out both}
.mnBird{position:absolute;left:-12%;top:var(--y);width:calc(34px * var(--s));fill:#fff;opacity:.9;animation:mnBird 3.2s var(--d) linear both}
.mnKick{position:absolute;top:13%;left:0;right:0;text-align:center;font:900 30px Poppins;color:#fff;letter-spacing:2px;text-shadow:0 4px 0 #743ae8,0 0 30px rgba(255,255,255,.9);opacity:0;animation:mnKick .6s .9s cubic-bezier(.2,1.6,.4,1) both}
.mnChar{position:absolute;left:3%;right:3%;width:94%;bottom:20%;filter:drop-shadow(0 16px 30px rgba(42,18,112,.5));animation:mnChar .9s .5s cubic-bezier(.2,1.4,.4,1) both}
.mnBub{position:absolute;left:8%;right:8%;bottom:11%;background:#fff;color:#3b14a8;border-radius:20px;padding:12px 14px;font:800 14px/1.35 Poppins;text-align:center;box-shadow:0 10px 30px rgba(42,18,112,.4);opacity:0;animation:mnKick .5s 1.5s cubic-bezier(.2,1.6,.4,1) both}
.mnBub:before{content:'';position:absolute;top:-10px;left:30%;border:10px solid transparent;border-bottom-color:#fff;border-top:0}
.mnStars{position:absolute;top:21%;left:0;right:0;display:flex;justify-content:center;gap:6px}
.mnStars img{width:46px;filter:grayscale(1) brightness(.6);opacity:0;animation:mnStar .45s calc(1.2s + var(--i) * .22s) cubic-bezier(.2,1.8,.4,1) both}.mnStars img.on{filter:drop-shadow(0 0 10px #fff)}
@keyframes mnRoom{0%{filter:brightness(.3) saturate(1.3)}100%{filter:brightness(1.15) saturate(.9)}}
@keyframes mnSky{0%{opacity:1}100%{opacity:.1}}
@keyframes mnGlow{0%{opacity:0}60%{opacity:1}100%{opacity:.8}}
@keyframes mnBird{0%{transform:translate(0,0) scale(1,1)}25%{transform:translate(35vw,-10px) scale(1,.6)}50%{transform:translate(70vw,5px) scale(1,1)}75%{transform:translate(100vw,-8px) scale(1,.6)}100%{transform:translate(130vw,0)}}
@keyframes mnKick{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:none}}
@keyframes mnChar{from{opacity:0;transform:translateY(60px) scale(.85)}to{opacity:1;transform:none}}
@keyframes mnStar{from{opacity:0;transform:scale(2.4) rotate(-40deg)}to{opacity:1;transform:none}}
/* win */
.wArt{position:relative;height:150px;display:flex;justify-content:center;align-items:flex-end;margin:-4px 0 -6px;z-index:2}
.wArt img{max-height:100%;max-width:92%;object-fit:contain;filter:drop-shadow(0 12px 24px rgba(0,0,0,.45));animation:mnChar .7s .15s cubic-bezier(.2,1.4,.4,1) both}
.wArt.boss img{max-height:130px;animation:mnChar .7s .15s cubic-bezier(.2,1.4,.4,1) both,rwBob 2s 1s infinite}
.wFace{width:100%;height:100%;object-fit:cover;object-position:50% 12%;border-radius:50%}
#wChE{overflow:hidden}
.wMet{width:100%;margin:8px 0 2px;padding:10px 12px;border-radius:16px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);text-align:left}
.wmR{display:flex;justify-content:space-between;font:700 12px Poppins}.wmR b{font:900 13px Poppins}.wmR.sm{font:600 10.5px Poppins;opacity:.85;margin-top:6px}
.wmH{margin-top:6px;font:700 11px Poppins;color:rgb(127,212,255)}
.wWa{width:100%;display:flex;justify-content:center;margin-top:10px}.wWa .waBtn{width:100%!important;justify-content:center;height:50px;font-size:14px!important}
/* tickets */
.tk2{padding:10px!important}
.tk2H{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.tk2H b{font:900 14px Poppins}.tk2T{font:700 10px Poppins;color:rgb(127,212,255)}
.tk2R{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.tkSl,.tkGl{position:relative;border-radius:14px;min-height:178px;overflow:hidden;padding:8px 6px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start}
.tkBg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.32}
.tkSl{background:linear-gradient(160deg,#cfd3e6,#8f8bb0);border:2px solid rgba(255,255,255,.6)}
.tkSRow{position:relative;display:flex;gap:4px;margin-top:8px}
.tkSl .tkCell{position:relative;width:44px;height:52px;border-radius:9px;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:inset 0 0 0 2px rgba(116,58,232,.3)}
.tkSl .tkCell i{font-size:24px;font-style:normal}.tkSl .tkCell canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none}.tkSl .tkCell.open canvas{opacity:0;transition:opacity .25s}
.tkLab{position:relative;font:900 10px Poppins;letter-spacing:1.5px;color:#2a1270;margin-top:8px}.tkLab.g{color:#3b1a00;margin-top:2px}
.tkSl .tkRes{position:relative;font:700 10.5px/1.25 Poppins;color:#2a1270;margin-top:6px;text-align:center}.tkSl .tkRes b{display:block;font-weight:900}
.tkSl.won{box-shadow:0 0 18px rgba(255,255,255,.8)}
.tkGl{border:2px solid #fff;background:linear-gradient(160deg,#f6d77a,#c9952f 45%,#743ae8);color:#2a1270;cursor:pointer;box-shadow:0 0 20px rgba(246,215,122,.55);animation:tkG 1.6s infinite}
.tkGsp{position:absolute;inset:-60%;background:conic-gradient(from 0deg,transparent 0 70%,rgba(255,255,255,.55) 80%,transparent 90%);animation:rwSpin 2.4s linear infinite}
.tkLad{position:relative;list-style:none;padding:0;margin:4px 0 0;font:800 9.5px/1.45 Poppins;text-align:left;color:#2a1270}
.tkGo{position:relative;margin-top:auto;background:#2a1270;color:#fff;font:900 12px Poppins;border-radius:10px;padding:6px 12px;box-shadow:0 0 12px rgba(127,212,255,.7)}
.tkOdds{position:relative;font:700 8px Poppins;color:#fff;margin-top:3px}
.tkGl.tease{animation:tkG .6s infinite;box-shadow:0 0 30px rgba(127,212,255,.9)}
.tkGl.exp{filter:grayscale(.85);opacity:.5;animation:none}.tkGl.opened{animation:none}
@keyframes tkG{50%{transform:scale(1.03)}}
.tk2N{margin-top:8px;font:700 11.5px Poppins;text-align:center;color:#fff;min-height:16px}.tk2N b{color:rgb(127,212,255)}
`);
/* purane canvas text shop/map ke peeche na dikhein */
(function () { const _os = window.openShop; window.openShop = function () { G.pops = []; G.annQ = []; return _os.apply(this, arguments); }; const _sm = window.showMap; window.showMap = function () { G.pops = []; return _sm.apply(this, arguments); }; })();
R7.css(`#win .wv{padding-bottom:64px}`);

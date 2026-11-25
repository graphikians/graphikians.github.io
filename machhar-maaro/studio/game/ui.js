/* ================= MACHHAR MAARO v3 — UI ================= */
const $ = id => document.getElementById(id);
const coinH = n => `<span class="coin"></span>${fmt(n)}`;
const SCREENS = ['menu', 'map', 'intro', 'win', 'over', 'shop', 'pause'];
const hideAll = () => SCREENS.forEach(id => $(id).classList.add('hide'));
function uiPlaying(on) { $('pauseBtn').classList.toggle('hide', !on); }
const totalStars = () => Object.values(SAVE.stars).reduce((a, b) => a + b, 0);
const tierBadge = t => `<span class="tier" style="background:${TIERS[t].bg}">${TIERS[t].name}</span>`;

/* ---------- map ---------- */
const OFFS = [0, 50, 80, 50, 0, -50, -80, -50, 0, 50, 80, 50, 0, -50, 0];
function renderMap() {
  $('mStars').textContent = `⭐ ${totalStars()}`;
  $('mCoins').innerHTML = coinH(SAVE.coins); $('mGems').textContent = `💎 ${SAVE.gems}`;
  let h = META.hub();
  WORLDS.forEach((w, wi) => {
    const first = wi * 15 + 1, locked = SAVE.unlocked < first;
    const ws = LEVELS.filter(l => l.w === wi).reduce((a, l) => a + (SAVE.stars[l.n] || 0), 0);
    const bosses = LEVELS.filter(l => l.w === wi && l.boss).map(l => BOSSES[l.boss].emoji).join(' ');
    h += `<div class="world ${locked ? 'lockw' : ''}"><div class="wi">${locked ? '🔒' : w.icon}</div><div style="flex:1"><div class="wtop">WORLD ${wi + 1} ${tierBadge(w.tier)}</div><h3>${w.name}</h3>
      <p>${locked ? `Beat every boss in World ${wi} to unlock` : `Keep ${w.who} asleep · Bosses: ${bosses}`}</p>
      <div class="wbar"><i style="width:${ws / 45 * 100}%"></i></div><p>⭐ ${ws} / 45</p></div></div><div class="path">`;
    LEVELS.filter(l => l.w === wi).forEach(l => {
      const lk = l.n > SAVE.unlocked, st = SAVE.stars[l.n] || 0, cur = l.n === SAVE.unlocked;
      const lab = l.boss ? '' : l.newType ? '<span class="lab">NEW 🦟</span>' : `<span class="lab dim">${TASKS[l.task].icon}</span>`;
      h += `<div class="node ${lk ? 'lock' : ''} ${l.boss ? 'boss' : ''} ${cur ? 'cur' : ''}" data-n="${l.n}" style="transform:translateX(${OFFS[l.p - 1]}px)">${lk ? '🔒' : l.boss ? BOSSES[l.boss].emoji : l.n}${lk ? '' : lab}
        ${lk ? '' : `<span class="st">${[0, 1, 2].map(i => `<span class="${i < st ? 'on' : 'off'}">★</span>`).join('')}</span>`}</div>`;
    });
    h += '</div>';
  });
  h += `<div class="soon">✨ New levels coming soon · keep your streak alive!</div>`;
  $('mapBody').innerHTML = h;
  META.bindHub();
  $('mapBody').querySelectorAll('.node').forEach(el => el.onclick = () => { const n = +el.dataset.n; if (n <= SAVE.unlocked) { initAudio(); showIntro(n); } });
}
function showMap() {
  hideAll(); state = 'map'; uiPlaying(false); G.mosq = []; G.items = []; G.cracks = null; G.cine = null; G.popups = [];
  renderMap(); $('map').classList.remove('hide'); META.onMap();
  setTimeout(() => { const c = $('mapBody').querySelector('.cur') || $('mapBody').querySelector(`[data-n="${SAVE.unlocked}"]`); if (c) c.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 60);
}

/* ---------- mission card ---------- */
let pickBoost = {};
function lineup(L) {
  if (L.boss) { const b = BOSSES[L.boss]; return `<div class="bosscard"><div class="be">${b.emoji}</div><div><b>${b.name}</b>${tierBadge(b.tier)}<p>"${b.taunt}"</p><p class="dim">Moves: ${b.moves.map(m => ({ dash: 'Dash', teleport: 'Teleport', yawn: 'Neend', books: 'Kitaab dhaal', beat: 'Beat attack', bass: 'Bass drop', train: 'Train', guards: 'Bodyguards', drain: 'Battery chori', split: 'Toot ke do', rain: 'Baarish', clones: 'Clones', otp: 'Fake OTP', fakeitems: 'Nakli power-up', eggs: 'Ande', command: 'Fauj command' }[m])).join(' · ')}</p></div></div>`; }
  const pool = MT_KEYS.filter(k => MT[k].unlock <= L.n && k !== 'bachcha').sort((a, b) => MT[b].unlock - MT[a].unlock).slice(0, 6);
  return `<div class="lineup">${pool.map(k => `<span class="mchip ${k === L.newType ? 'new' : ''}" title="${MT[k].desc}">${MT[k].emoji} ${MT[k].name}${k === L.newType ? ' <b>NEW</b>' : ''}</span>`).join('')}</div>`;
}
function hints(L) {
  const h = [];
  const R2 = { dark: '🌑 Use the racket glow to find them', powercut: '🔌 Fan off, the lights keep cutting out', swipe: '👆 No tap, no Mega Zap. Swipe only', limzap: '🎯 Count every zap. Misses cost you', limbat: '🪫 The battery will not recharge', jugnu: '✨ Glowing fireflies are friends. Do not hit them', multi: '👨‍👩‍👦 Three sleepers. If anyone wakes, you fail', sleepwalk: '🚶 Papa is sleepwalking. The target keeps moving', nobite: `🚫 More than ${L.maxBites} bites = fail`, waves: '🌊 A short break after every wave', rani: '👑 The Queen spawns babies. Hit her first', collect: '🎁 More power-ups fall. Avoid the traps' };
  if (R2[L.task]) h.push(R2[L.task]);
  h.push('💡 Air kills = 2x points + combo · staying still overheats the racket');
  if (L.n >= 4) h.push('⚠️ Zap the black TRAP orb before it lands = +200');
  return h.map(t => `<div class="chip">${t}</div>`).join('');
}
function sheet(html, onClose) {
  let sh = $('sheet'); if (!sh) { sh = document.createElement('div'); sh.id = 'sheet'; document.body.appendChild(sh); }
  sh.innerHTML = `<div class="shBg"></div><div class="shBox"><div class="shGrab"></div>${html}<button class="btn2 shX" style="margin-top:14px">Got it 👍</button></div>`;
  sh.className = 'on'; const close = () => { sh.className = ''; onClose && onClose(); };
  sh.querySelector('.shBg').onclick = close; sh.querySelector('.shX').onclick = close; return sh;
}
function showIntro(n) {
  hideAll(); state = 'intro';
  const L = LEVELS[n - 1], w = WORLDS[L.w]; CL = L; CW = RISHTE.withChar(w); setTheme(w.theme); G.sleepers = makeSleepers();
  const done = SAVE.objs && SAVE.objs[n] || [];
  pickBoost = {};
  const C = CHARS[CW.cid], hz = HZ.forLevel(L), seen = SAVE.hzSeen || {}, dmg = ({ easy: 20, medium: 30, hard: 40, pro: 40, expert: 50 })[L.tier];
  const stars = [['Complete the mission', !!SAVE.stars[n]]].concat(L.stars.map((k, i) => [STAR_OBJ[k].t, !!done[i]]));
  $('introCard').innerHTML = `
    <div class="iTop"><span class="kick">W${L.w + 1} · ${w.name}</span>${tierBadge(L.tier)}<span class="iHeart">❤️ ${RISHTE.hearts()}/5</span></div>
    <div class="iLv">${L.boss ? '👑 BOSS LEVEL' : 'LEVEL ' + n}</div>
    <div class="mname" style="margin-top:4px">${TASKS[L.task].icon} ${TASKS[L.task].name.toUpperCase()}</div>
    <div class="goal iGoal">${goalText(L)}</div>
    ${SAVE.bests && SAVE.bests[n] ? `<div class="iBest">🏆 Best ${fmt(SAVE.bests[n])}. Can you beat it?</div>` : ''}
    <div class="iRow">
      <button class="iTile" id="iChar"><span class="ie">${C.e}</span><b>${C.n} ▾</b><small>💜 Lv ${RISHTE.bondLv(RISHTE.rec(CW.cid).bond).lv}</small></button>
      <button class="iTile" id="iHz"><span class="ie">${hz.length ? hz.slice(0, 3).map(k => HZDEF[k].i).join('') : '😌'}${hz.some(k => !seen[k]) ? '<i class="nw">NEW</i>' : ''}</span><b>${hz.length ? hz.length + ' hazards' : 'Calm night'}</b><small>💥 mistake -${dmg}%</small></button>
      <button class="iTile" id="iFauj"><span class="ie">${L.boss ? BOSSES[L.boss].emoji : L.newType ? MT[L.newType].emoji : '🦟'}${L.newType ? '<i class="nw">NEW</i>' : ''}</span><b>${L.boss ? 'Boss' : 'Army'}</b><small>tap for info</small></button>
    </div>
    <div class="iStars">${stars.map(([t, ok]) => `<div class="${ok ? 'ok' : ''}"><i>${ok ? '★' : '☆'}</i>${t}</div>`).join('')}</div>
    <div class="iBst">${BOOSTERS.map(b => `<button class="bst" data-b="${b.id}" ${SAVE.boost[b.id] ? '' : 'disabled'}><span>${b.icon}</span><small>x${SAVE.boost[b.id] || 0}</small></button>`).join('')}</div>
    ${SAVE.trial ? `<div class="iBest">🎁 Trial: ${RACKETS.find(r => r.id === SAVE.trial).name}</div>` : ''}
    <div class="iGo"><button class="iRound" id="iBack" title="Map">🗺️</button><button class="btn pulse" id="iStart">START ▶</button><button class="iRound" id="iShop" title="Shop">🏸</button></div>`;
  const card = $('introCard');
  card.querySelectorAll('.bst').forEach(b => b.onclick = () => { const id = b.dataset.b; pickBoost[id] = !pickBoost[id]; b.classList.toggle('sel', !!pickBoost[id]); sfx.coin(); });
  $('iBack').onclick = showMap; $('iShop').onclick = () => openShop('rackets', () => showIntro(n));
  $('iStart').onclick = () => RISHTE.gate(() => { for (const k in pickBoost) if (pickBoost[k]) SAVE.boost[k]--; save(); hideAll(); startLevel(n, pickBoost); uiPlaying(true); });
  $('iChar').onclick = () => {
    const sh = sheet(`<div class="kick">WHO WILL YOU PROTECT?</div><div class="chgrid"><button class="chp ${!SAVE.curChar ? 'on' : ''}" data-cc="">${CHARS[w.sleeper].e} ${CHARS[w.sleeper].n}</button>${PUBLIC_IDS.filter(id => id !== w.sleeper).concat(diaryOpen ? SECRET_IDS : []).map(id => `<button class="chp ${SAVE.curChar === id ? 'on' : ''}" data-cc="${id}">${CHARS[id].e} ${CHARS[id].n}${CHARS[id].secret ? ' 🔒' : ''}</button>`).join('')}<button class="chp" data-cc="__diary">🔒 Secret</button></div><div class="shNote">${C.e} <b>${C.n}:</b> ${C.qd}</div>`);
    sh.querySelectorAll('[data-cc]').forEach(b => b.onclick = () => { const v = b.dataset.cc; sh.className = ''; if (v === '__diary') return RISHTE.askPin(() => RISHTE.diary()); SAVE.curChar = v || null; save(); sfx.power(); showIntro(n); });
  };
  $('iHz').onclick = () => sheet(`<div class="kick">TONIGHT\'S HAZARDS</div><div class="shList">${hz.length ? hz.map(k => `<div>${HZDEF[k].i} <b>${HZDEF[k].n}</b>${seen[k] ? '' : ' <i class="nw">NEW</i>'}<small>${HZDEF[k].how}</small></div>`).join('') : '<div>😌 No hazards tonight</div>'}</div><div class="shNote">💥 Every mistake = sleep -${dmg}% (${TIERS[L.tier].name})</div>`);
  $('iFauj').onclick = () => sheet(`<div class="kick">${L.boss ? 'BOSS' : 'TONIGHT\'S ARMY'}</div>${L.newType ? `<div class="newm"><b>NEW MOSQUITO</b>${MT[L.newType].emoji} ${MT[L.newType].name}: ${MT[L.newType].desc}</div>` : ''}${lineup(L)}<div class="shNote">“${L.story}”</div><div class="hints">${hints(L)}</div>`);
  $('intro').classList.remove('hide'); $('intro').scrollTop = 0;
}

/* ---------- results ---------- */
let earned = 0;
function statGrid() {
  return `<div class="stats"><div><b>${fmt(G.score)}</b>SCORE</div><div><b>${G.kills}</b>SWATTED</div><div><b>${G.st.maxCombo}</b>BEST COMBO</div><div><b>${G.st.air}</b>AIR KILLS</div></div>`;
}
function endTrial() { if (SAVE.trial) { SAVE.trial = null; RKC = null; save(); } }
function showWin(st, objs) {
  G.cine = null;
  if (CL.ev) return RISHTE.eventWin(st);
  const n = CL.n, first = !SAVE.stars[n], wasTrial = SAVE.trial;
  SAVE.stars[n] = Math.max(SAVE.stars[n] || 0, st);
  SAVE.objs = SAVE.objs || {}; const prev = SAVE.objs[n] || []; SAVE.objs[n] = objs.map((o, i) => o || prev[i]);
  SAVE.unlocked = Math.max(SAVE.unlocked, Math.min(300, n + 1));
  earned = (G.coins + st * 15 + (CL.boss ? 150 : 0)) * (NASHA.raat() ? 2 : 1);
  const gems = G.gems + (first && st === 3 ? 2 : 0);
  SAVE.coins += earned; SAVE.gems += gems; SAVE.best = Math.max(SAVE.best, G.score); endTrial(); save();
  const prevBest = (SAVE.bests && SAVE.bests[n]) || 0, C = CHARS[CW.cid];
  $('wKick').textContent = CL.boss ? `LEVEL ${n} · BOSS` : `LEVEL ${n} CLEARED`;
  $('wTitle').textContent = CL.boss ? 'BOSS DOWN! 👑' : st === 3 ? 'PERFECT NIGHT!' : 'SLEEP SAVED!';
  $('wObjs').innerHTML = CL.stars.map((k, i) => `<span class="${objs[i] ? '' : 'no'}">${objs[i] ? '★' : '☆'} ${STAR_OBJ[k].t}</span>`).join('');
  $('wStats').innerHTML = `<span>🦟 <b>${G.kills}</b></span><span>🔥 <b>${G.st.maxCombo}</b> combo</span><span>🌪️ <b>${G.st.air}</b> air</span>`;
  countUp($('wCoins'), earned, '+', true); $('wGems').textContent = '+' + gems; $('wGemC').style.opacity = gems ? 1 : 0.35;
  $('w2x').style.display = ''; $('w2x').disabled = false;
  const cb = $('wChest');
  if (first && (CL.p % 3 === 0 || CL.boss)) { cb.innerHTML = `<div class="chestbox"><div style="font-weight:800;font-size:13px">${CL.boss ? '👑 BOSS CHEST!' : '🎁 CHEST FOUND!'} Tap to open</div><div class="chest" id="chestEl">🎁</div></div>`; $('chestEl').onclick = openChest; } else cb.innerHTML = '';
  let t, e = '🌙', k = 'NEXT LEVEL';
  if (n >= 300) { t = 'All 300 levels cleared! You are a legend'; e = '🏆'; k = 'WELL DONE'; }
  else {
    const nx = LEVELS[n];
    if (nx.boss) { t = `BOSS: ${BOSSES[nx.boss].name}`; e = BOSSES[nx.boss].emoji; k = '⚠️ NEXT LEVEL'; }
    else if (nx.p === 1) { t = `New world: ${WORLDS[nx.w].name}`; e = '🗺️'; k = 'NEW WORLD UNLOCKED'; }
    else if (nx.newType) { t = `New mosquito: ${MT[nx.newType].name}`; e = MT[nx.newType].emoji; k = '👀 NEXT LEVEL'; }
    else { t = TASKS[nx.task].name; e = TASKS[nx.task].icon; }
    const nr = RACKETS.find(r => !SAVE.owned.includes(r.id) && r.cur === 'c');
    if (nr && nr.price <= SAVE.coins) { t = `You can buy the ${nr.name} now!`; e = nr.icon; k = '🏸 READY IN THE SHOP'; }
  }
  if (st < 3 && n < 300) { const miss = CL.stars.findIndex((s, i) => !objs[i]); if (miss >= 0) { t = `${3 - st} star${3 - st > 1 ? 's' : ''} left: ${STAR_OBJ[CL.stars[miss]].t}`; e = '⭐'; k = 'REPLAY FOR 3★'; } }
  $('wTeaser').textContent = t; $('wNxE').textContent = e; $('wNxK').textContent = k;
  $('wNext').style.display = n >= 300 ? 'none' : ''; $('wReplay').style.display = st < 3 ? '' : 'none';
  META.afterWin(st, n); RISHTE.onWin(st);
  // compact progress tiles
  const r = META.rank(), xpTxt = ($('wXP').textContent.match(/\+\d+ XP/) || [''])[0];
  $('wPlv').textContent = SAVE.plv; $('wRank').textContent = r[1]; $('wXPs').textContent = xpTxt;
  const bl = RISHTE.bondLv(RISHTE.rec(CW.cid).bond); $('wChE').textContent = C.e; $('wRl').textContent = `${C.n} Lv ${bl.lv}`; $('wRs').textContent = '💜 bond up';
  const toChest = 3 - (n % 3 === 0 ? 3 : n % 3); $('wCl').textContent = toChest ? `${toChest} more level${toChest > 1 ? 's' : ''}` : 'Chest unlocked!'; $('wCs').textContent = toChest ? '→ 🎁 CHEST' : '🎉';
  const setRing = (id, p) => { const el = $(id); el.style.setProperty('--rp', 0); setTimeout(() => el.style.setProperty('--rp', Math.round(p)), 500); };
  setRing('wRingXP', SAVE.xp / META.need(SAVE.plv) * 100); setRing('wRingR', bl.cur / bl.need * 100); setRing('wRingC', ((3 - toChest) % 3 || 3) / 3 * 100);
  const sc = $('wScore'); let c0 = 0; const ti = setInterval(() => { c0 = Math.min(G.score, c0 + Math.ceil(G.score / 28)); sc.textContent = fmt(c0); if (c0 >= G.score) clearInterval(ti); }, 30);
  $('wBest').style.display = !CHARS[CW.cid].secret && G.score > prevBest && prevBest > 0 ? '' : 'none';
  const cf = $('wConf'); cf.innerHTML = Array.from({ length: 34 }, (_, i) => { const a = rnd(-Math.PI, 0), d = rnd(90, 210); return `<i style="left:50%;background:${['#743ae8', '#9a6df5', '#fff', 'rgb(127,212,255)'][i % 4]};--x:${Math.cos(a) * d * 1.4}px;--y:${Math.sin(a) * d + 160}px;--r:${rnd(-720, 720)}deg;animation-delay:${0.25 + Math.random() * 0.25}s"></i>`; }).join('');
  const el = $('win'); el.classList.remove('hide'); el.scrollTop = 0;
  const ss = el.querySelectorAll('.star'); ss.forEach(s => s.classList.remove('on'));
  ss.forEach((s, i) => { if (i < st) setTimeout(() => { s.classList.add('on'); tone(NOTES[4 + i * 2], NOTES[4 + i * 2], 0.25, 0.14, 'triangle'); vib(20); }, 300 + i * 320); });
}
function countUp(el, val, pre, noCoin) { let c = 0, i = 0; const steps = 24, inc = val / steps; const iv = setInterval(() => { i++; c = Math.min(val, c + inc); el.innerHTML = `${noCoin ? '' : '<span class="coin"></span>'}${pre}${fmt(c)}`; if (i % 3 === 0) sfx.coin(); if (i >= steps) clearInterval(iv); }, 35); }
function openChest() {
  const el = $('chestEl'); if (!el || el.dataset.open) return; el.dataset.open = 1; el.classList.add('shake'); sfx.whoosh();
  setTimeout(() => {
    const r = Math.round(rnd(60, 200)), g = Math.random() < 0.35 ? Math.round(rnd(2, 5)) : 0, bk = Math.random() < 0.3 ? BOOSTERS[(Math.random() * 4) | 0] : null;
    SAVE.coins += r; SAVE.gems += g; if (bk) SAVE.boost[bk.id] = (SAVE.boost[bk.id] || 0) + 1; save(); sfx.chest(); vib([30, 30, 60]);
    el.parentElement.innerHTML = `<div style="font-weight:900;font-size:22px">✨ CHEST OPENED! ✨</div><div class="coins">${coinH(r)}${g ? ` &nbsp;💎 +${g}` : ''}</div>${bk ? `<div class="chip">${bk.icon} +1 ${bk.name} booster</div>` : ''}`;
  }, 1100);
}
let revTimer = null;
function showOver(kind, title, msg) {
  state = 'over'; endTrial(); RISHTE.useHeart();
  const p = progress();
  $('oIcon').textContent = kind === 'wake' ? '🩴' : '⏰';
  $('oTitle').textContent = kind === 'wake' ? ({ mummy: 'MUMMY WOKE UP!', bachcha: 'THE KID WOKE UP!' }[G.wakeS && G.wakeS.kind] || CW.woke) : title;
  $('oShout').textContent = kind === 'wake' ? `"${CW.shout.replace('|', ' ')}"` : '';
  if (kind === 'wake') {
    if (CL.boss) { const b = G.bosses.find(b => !b.dead); msg = `😤 The boss had only ${Math.max(1, Math.round((b ? b.hp / b.maxhp : 0.1) * 100))}% health left!`; }
    else if (CL.len) msg = `😤 Only ${Math.max(1, Math.ceil(CL.len - G.t))} seconds to go!`;
    else if (p.max) msg = `😤 Only ${Math.max(1, Math.round(p.max - p.cur))} more to go!`;
    else msg = '😤 So close!';
  }
  $('oMsg').textContent = msg || '';
  const pct = CL.len ? clamp(G.t / CL.len, 0, 1) : p.max ? clamp(p.cur / p.max, 0, 1) : 0.5;
  $('oProg').innerHTML = `<i style="width:${pct * 100}%"></i><span>${Math.round(pct * 100)}% mission done</span>`;
  $('oStats').innerHTML = statGrid();
  const rv = $('oRevive');
  if (G.revived) rv.style.display = 'none';
  else { rv.style.display = ''; rv.classList.remove('gone'); const rn = $('oRevN'); rn.style.animation = 'none'; void rn.offsetWidth; rn.style.animation = ''; let c = 6; $('oRevN').textContent = c; clearInterval(revTimer); revTimer = setInterval(() => { c--; $('oRevN').textContent = c; if (c <= 0) { clearInterval(revTimer); rv.classList.add('gone'); } }, 1000); }
  META.afterLose();
  $('over').classList.remove('hide');
}
let lastAdBack = null;
function showAd(cb) {
  const o = $('adov'); o.classList.remove('hide'); let n = 3; $('adN').textContent = n; const prev = state; state = 'ad';
  if (buzzGain) buzzGain.gain.value = 0;
  const iv = setInterval(() => { n--; $('adN').textContent = n; if (n <= 0) { clearInterval(iv); o.classList.add('hide'); state = prev; cb(); } }, 1000);
}

/* ---------- shop ---------- */
let shopTab = 'rackets', shopBack = null;
function openShop(tab, back) { shopTab = tab || 'rackets'; shopBack = back || showMap; hideAll(); state = 'shop'; renderShop(); $('shop').classList.remove('hide'); }
const upCost = lv => Math.round(120 * Math.pow(1.55, lv));
function priceBtn(price, cur, attr) { const can = cur === 'g' ? SAVE.gems >= price : SAVE.coins >= price; return `<button class="buy ${can ? '' : 'poor'}" ${attr}>${cur === 'g' ? '💎 ' + price : coinH(price)}</button>`; }
function statBar(lbl, v, max) { return `<div class="sbar"><span>${lbl}</span><i><b style="width:${clamp(v / max, 0.05, 1) * 100}%"></b></i></div>`; }
function today() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }
function renderShop() {
  $('sCoins').innerHTML = `${coinH(SAVE.coins)} &nbsp; 💎 ${SAVE.gems}`;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.t === shopTab));
  let h = '';
  if (shopTab === 'rackets') {
    h = '<div class="rgrid">' + RACKETS.map(r => {
      const own = SAVE.owned.includes(r.id), eq = SAVE.equip === r.id, R2 = RARITY[r.rar], st = rkStats(r.id);
      const btn = eq ? '<button class="buy eqd" disabled>✓ EQUIPPED</button>' : own ? `<button class="buy eq" data-eq="${r.id}">EQUIP</button>` : priceBtn(r.price, r.cur, `data-buy="${r.id}"`);
      return `<div class="rcard ${eq ? 'on' : ''}" style="--rc:${R2.col};--rg:${R2.glow}"><div class="rar">${R2.name}</div><div class="ricon">${r.icon}</div><h4>${r.name}</h4><p class="sp">${r.sp}</p>
        ${statBar('Area', st.r, 1.8)}${statBar('Battery', st.regen, 2.6)}${statBar('Power', st.pow + 0.05, 0.5)}
        ${own ? '' : `<button class="try" data-try="${r.id}">📺 try 1 level FREE</button>`}${btn}</div>`;
    }).join('') + '</div>';
  } else if (shopTab === 'upgrade') {
    const r = rkStats(SAVE.equip), u = SAVE.upg[r.id] || { a: 0, b: 0, p: 0 };
    const row = (k, name, desc) => `<div class="urow"><div><h4>${name}</h4><p>${desc}</p><div class="pips">${Array.from({ length: 10 }, (_, i) => `<i class="${i < u[k] ? 'on' : ''}"></i>`).join('')}</div></div>${u[k] >= 10 ? '<button class="buy eqd" disabled>MAX</button>' : priceBtn(upCost(u[k]), 'c', `data-up="${k}"`)}</div>`;
    h = `<div class="uhead"><span>${r.icon}</span><div><h3>${r.name}</h3>${`<span class="tier" style="background:${RARITY[r.rar].col};color:#1b0b4a">${RARITY[r.rar].name}</span>`}</div></div>
      ${row('a', '📏 Area', '+4% racket size per level')}${row('b', '🔋 Battery', '+6% charge, -3% drain per level')}${row('p', '💥 Power', '+3% CRIT chance (double damage)')}`;
  } else if (shopTab === 'boosters') {
    h = BOOSTERS.map(b => `<div class="urow"><div class="bi">${b.icon}</div><div><h4>${b.name} <small>x${SAVE.boost[b.id] || 0}</small></h4><p>${b.desc}</p></div>${priceBtn(b.price, 'c', `data-bb="${b.id}"`)}</div>`).join('');
  } else if (shopTab === 'ghar') {
    h = '<p class="dim" style="margin-bottom:10px">Home upgrades are permanent and work in every level</p>' + GHAR.map(g => `<div class="urow"><div class="bi">${g.icon}</div><div><h4>${g.name}</h4><p>${g.desc}</p></div>${hasGhar(g.id) ? '<button class="buy eqd" disabled>✓ INSTALLED</button>' : priceBtn(g.price, g.cur, `data-gh="${g.id}"`)}</div>`).join('');
  } else if (shopTab === 'deals') {
    if (SAVE.adDay !== today()) { SAVE.adDay = today(); SAVE.adCount = 0; save(); }
    const seed = seeded(new Date().getDate() + new Date().getMonth() * 31)(), dealR = RACKETS.filter(r => r.price > 0 && !SAVE.owned.includes(r.id))[Math.floor(seed * 8) % Math.max(1, RACKETS.filter(r => r.price > 0 && !SAVE.owned.includes(r.id)).length)];
    h = `<div class="urow"><div class="bi">💎</div><div><h4>Free Gems</h4><p>Watch an ad, +5 gems (${3 - SAVE.adCount}/3 left today)</p></div><button class="buy ${SAVE.adCount >= 3 ? 'poor' : ''}" data-ad="gems">📺 FREE</button></div>
      <div class="urow"><div class="bi">💰</div><div><h4>Free Coins</h4><p>Watch an ad, +150 coins</p></div><button class="buy ${SAVE.adCount >= 3 ? 'poor' : ''}" data-ad="coins">📺 FREE</button></div>
      ${dealR ? `<div class="urow deal"><div class="bi">${dealR.icon}</div><div><h4>TODAY\'S DEAL: ${dealR.name}</h4><p>30% OFF today only</p></div>${priceBtn(Math.round(dealR.price * 0.7), dealR.cur, `data-deal="${dealR.id}"`)}</div>` : ''}
      <div class="urow"><div class="bi">🚫</div><div><h4>Remove Ads</h4><p>One time purchase, coming soon</p></div><button class="buy poor">SOON</button></div>`;
  }
  $('shopBody').innerHTML = h;
  const B = $('shopBody');
  const pay = (price, cur) => { if (cur === 'g' ? SAVE.gems < price : SAVE.coins < price) { sfx.low(); toast(cur === 'g' ? `You need ${price - SAVE.gems} more gems` : `You need ${fmt(price - SAVE.coins)} more coins`); return false; } if (cur === 'g') SAVE.gems -= price; else SAVE.coins -= price; return true; };
  B.querySelectorAll('[data-eq]').forEach(b => b.onclick = () => { SAVE.equip = b.dataset.eq; RKC = null; save(); sfx.power(); renderShop(); });
  B.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => { const r = RACKETS.find(x => x.id === b.dataset.buy); if (!pay(r.price, r.cur)) return; SAVE.owned.push(r.id); SAVE.equip = r.id; RKC = null; save(); sfx.chest(); vib([30, 30, 60]); toast(`${r.icon} ${r.name} is yours!`); renderShop(); });
  B.querySelectorAll('[data-deal]').forEach(b => b.onclick = () => { const r = RACKETS.find(x => x.id === b.dataset.deal); if (!pay(Math.round(r.price * 0.7), r.cur)) return; SAVE.owned.push(r.id); SAVE.equip = r.id; RKC = null; save(); sfx.chest(); toast(`${r.icon} ${r.name} claimed!`); renderShop(); });
  B.querySelectorAll('[data-try]').forEach(b => b.onclick = () => showAd(() => { SAVE.trial = b.dataset.try; RKC = null; save(); toast('Play your next level with this racket! 🎁'); renderShop(); }));
  B.querySelectorAll('[data-up]').forEach(b => b.onclick = () => { const id = SAVE.equip, u = SAVE.upg[id] = SAVE.upg[id] || { a: 0, b: 0, p: 0 }, k = b.dataset.up; if (!pay(upCost(u[k]), 'c')) return; u[k]++; RKC = null; save(); sfx.power(); renderShop(); });
  B.querySelectorAll('[data-bb]').forEach(b => b.onclick = () => { const bo = BOOSTERS.find(x => x.id === b.dataset.bb); if (!pay(bo.price, 'c')) return; SAVE.boost[bo.id] = (SAVE.boost[bo.id] || 0) + 1; save(); sfx.coin(); renderShop(); });
  B.querySelectorAll('[data-gh]').forEach(b => b.onclick = () => { const g = GHAR.find(x => x.id === b.dataset.gh); if (!pay(g.price, g.cur)) return; SAVE.ghar.push(g.id); RKC = null; save(); sfx.chest(); toast(`${g.icon} ${g.name} installed!`); renderShop(); });
  B.querySelectorAll('[data-ad]').forEach(b => b.onclick = () => { if (SAVE.adCount >= 3) return toast('Daily limit reached. Come back tomorrow'); showAd(() => { SAVE.adCount++; if (b.dataset.ad === 'gems') SAVE.gems += 5; else SAVE.coins += 150; save(); sfx.chest(); renderShop(); }); });
}
let toastT = null;
function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 1800); }

/* ---------- buttons & boot ---------- */
document.querySelectorAll('.tab').forEach(t => t.onclick = () => { shopTab = t.dataset.t; renderShop(); });
$('playBtn').onclick = () => { initAudio(); if (SAVE.unlocked === 1 && !SAVE.stars[1]) showIntro(1); else showMap(); };
$('shopBtn').onclick = () => openShop('rackets', showMap);
$('sBack').onclick = () => (shopBack || showMap)();
$('wNext').onclick = () => showIntro(Math.min(300, CL.n + 1));
$('wReplay').onclick = () => showIntro(CL.n);
$('wMap').onclick = showMap;
$('w2x').onclick = () => { $('w2x').disabled = true; showAd(() => { SAVE.coins += earned; save(); $('w2x').style.display = 'none'; countUp($('wCoins'), earned * 2, '+', true); sfx.chest(); }); };
$('oRevive').onclick = () => { if ($('oRevive').classList.contains('gone')) return; clearInterval(revTimer); hideAll(); showAd(() => revive()); };
$('oAgain').onclick = () => { clearInterval(revTimer); if (CL.ev) { hideAll(); RISHTE.startEvent(CL.ev); } else showIntro(CL.n); };
$('oMap').onclick = () => { clearInterval(revTimer); showMap(); };
$('pauseBtn').onclick = () => { if (state !== 'play') return; state = 'pause'; if (buzzGain) buzzGain.gain.value = 0; $('pause').classList.remove('hide'); };
$('pResume').onclick = () => { $('pause').classList.add('hide'); state = 'play'; last = performance.now(); };
$('pMap').onclick = showMap;
$('mute').onclick = () => { initAudio(); muted = !muted; $('mute').textContent = muted ? '🔇' : '🔊'; if (master) master.gain.value = muted ? 0 : 0.9; };
$('menuBest').innerHTML = totalStars() ? `⭐ ${totalStars()} &nbsp; ${coinH(SAVE.coins)} &nbsp; 💎 ${SAVE.gems}` : '';

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.07, (now - last) / 1000); last = now;
  try { if (state !== 'pause' && state !== 'ad') update(dt); render(now / 1000); } catch (e) { window.__lastErr = e; console.error(e); }
  requestAnimationFrame(loop);
}

setInterval(() => { if (state === 'menu' && G.mosq.length < 5) spawnMosq('normal'); }, 900);
window.__mm = { startLevel, showIntro, showMap, SAVE, G, LEVELS, get state() { return state; }, winLevel, wake, openShop };

document.querySelectorAll('.sharebtn').forEach(b => b.onclick = () => { const t = META.shareText(); try { navigator.clipboard.writeText(t).then(() => toast('📋 Copied! Paste it on your WhatsApp status'), () => toast(t)); } catch (e) { toast(t); } META.x('Social Proof (Share / Challenge)'); });

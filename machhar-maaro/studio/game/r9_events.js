/* ================= MACHHAR MAARO · ROUND 9 · EVENTS =================
   Season event (or Weekly Challenge): 10 levels, Level 1 easy -> Level 10 hardest.
   Love events (Wife, Girlfriend, Crush, Neighbour, Bride): 5 levels each, reset weekly.
   Rewards on every level, chests on milestones. Ads: 2X reward, +3 tries, bonus chest.
===================================================================== */
R9.week = () => Math.floor((R7.today() + 3) / 7);
R9.LOVE = [
  { id: 'anniv', char: 'wife', n: 'Anniversary Week', i: '💍', d: '5 days to your anniversary. A new chapter opens every day.', days: ['Dinner Plans', 'Gift Shopping', 'Surprise Party', 'Old Photos', 'Anniversary Night'] },
  { id: 'valentine', char: 'gf', n: 'Valentine Week', i: '🌹', d: '5 days of love. A new chapter opens every day.', days: ['First Text', 'Rose Day', 'Chocolate Day', 'Teddy Day', 'Valentine Night'] },
  { id: 'confess', char: 'crush', n: 'Confession Week', i: '💌', d: '5 days to tell her. A new chapter opens every day.', days: ['First Smile', 'Coffee Chat', 'Late Night Call', 'The Letter', 'Confession Night'] },
  { id: 'navratri', char: 'padoswali', n: 'Navratri Week', i: '🪔', d: '5 nights of garba. A new chapter opens every day.', days: ['Garba Practice', 'New Outfit', 'Dandiya Night', 'Aarti Night', 'Final Garba'] },
  { id: 'honeymoon', char: 'dulhan', n: 'Honeymoon Week', i: '🏝️', d: '5 days after the wedding. A new chapter opens every day.', theme: 'r_dulhan', days: ['Packing', 'Airport Rush', 'Beach Day', 'Candle Dinner', 'Last Night'] }
];
R9.season = function () {
  const a = RISHTE.activeEvent();
  if (a) return { id: 'season', key: 's_' + a.id + '_' + new Date().getFullYear(), n: a.n, i: a.i, d: a.d, N: 10, ends: new Date(dOf(a.to).getTime() + 864e5) };
  const w = R9.week(), end = new Date((w * 7 - 3 + 7) * 864e5); end.setHours(0, 0, 0, 0);
  return { id: 'season', key: 'w_' + w, n: 'Weekly Challenge', i: '🏆', d: '10 nights, each one harder. Can you clear all ten?', N: 10, ends: end };
};
R9.evDef = function (id) {
  if (id === 'season') return R9.season();
  const L = R9.LOVE.find(x => x.id === id); if (!L) return null;
  return Object.assign({ key: 'l_' + id + '_' + R9.week(), N: 40, per: 1, ends: new Date((R9.week() * 7 - 3 + 7) * 864e5) }, L);
};
R9.evSt = function (def) { const sv = R9.sv(); sv.evs = sv.evs || {}; const t = R7.today(); let s = sv.evs[def.key]; if (!s) s = sv.evs[def.key] = { done: 0, day: t, tries: 5, cl: {} }; if (s.day !== t) { s.day = t; s.tries = Math.max(s.tries, 5); } return s; };
R9.evDay = () => Math.min(5, R7.today() - (R9.week() * 7 - 3) + 1);
R9.DP = [3, 5, 7, 10, 15]; R9.DS = [0, 3, 8, 15, 25];
R9.chOf = i => { let c = 0; while (c < 4 && i >= R9.DS[c + 1]) c++; return c; };
R9.chOpen = (def, c) => !def.per || c < R9.evDay() || !!(R9.evSt(def).early || {})[c];
R9.evUnlocked = def => (SAVE.unlocked || 1) >= (def.id === 'season' ? 3 : 4);
R9.REW = function (def, i) {
  if (def.N === 10) { if (i === 9) return { c: 1500, g: 20, b: 3, big: 1, vac: 1 }; if (i === 2 || i === 5) return { c: 150 + i * 60, b: 1 }; if (i === 3 || i === 7) return { c: 120 + i * 60, g: 5 }; return { c: 120 + i * 60 }; }
  if (i === 39) return { c: 2000, g: 40, b: 4, big: 1, bond: 1, vac: 1 }; const c = R9.chOf(i); if (i === R9.DS[c] + R9.DP[c] - 1) return { c: 250 + i * 15, g: 5 + c * 2, b: 1 }; return { c: 100 + i * 12 };
};
R9.rewTxt = r => [r.vac ? '💉 Vaccine' : '', r.c ? `🪙 ${fmt(r.c)}` : '', r.g ? `💎 ${r.g}` : '', r.b ? `🎒 ${r.b} booster${r.b > 1 ? 's' : ''}` : '', r.bond ? '💞 Bond +5%' : ''].filter(Boolean).join(' · ');
R9.TASKS10 = ['survive', 'kill', 'air', 'combo', 'nobite', 'timeattack', 'hunt', 'waves', 'dark', 'boss'];
R9.TASKS15 = ['survive', 'kill', 'combo', 'nobite', 'air', 'survive', 'kill', 'hunt', 'nobite', 'timeattack', 'combo', 'waves', 'nobite', 'kill', 'boss'];
R9.evLevel = function (def, i) {
  const N = def.N, task = N === 10 ? R9.TASKS10[i] : i === 39 ? 'boss' : i === 24 ? 'boss' : R9.TASKS15[i % 14], k = i / (N - 1);
  const wMax = Math.min(4, 1 + Math.floor(k * 3.5));
  let base;
  if (task === 'boss') { const bl = LEVELS.filter(l => l.boss && l.w <= wMax); base = bl[bl.length - 1] || LEVELS[4]; }
  else { const pool = LEVELS.filter(l => l.task === task && !l.boss && l.w <= wMax); base = pool[pool.length - 1] || LEVELS[1]; }
  const diff = 0.82 + k * 0.8;
  const L = Object.assign({}, base, { n: (N === 10 ? 600 : 650) + i, r9: 'ev', r9ev: def.id, r9i: i, ev: 'r9', story: def.per ? `Day ${R9.chOf(i) + 1}: ${def.days[R9.chOf(i)]} · level ${i - R9.DS[R9.chOf(i)] + 1} of ${R9.DP[R9.chOf(i)]}` : `${def.n} · level ${i + 1} of ${N}` });
  L.diff = diff * (1 + (base.w || 0) * 0.04);
  if (def.char) L.r9char = def.char; if (def.theme) L.r9theme = def.theme;
  if (L.target) L.target = Math.round(L.target * (0.75 + k * 0.6));
  if (task === 'nobite') L.maxBites = Math.max(1, 4 - Math.floor(k * 3));
  return L;
};
R9.evPlay = function (id, i) {
  const def = R9.evDef(id), s = R9.evSt(def);
  if (R9.patient()) return R9.hospScreen(R9.patient());
  if (i == null) i = Math.min(s.done, def.N - 1);
  if (s.tries <= 0 || (def.per && !R9.chOpen(def, R9.chOf(i)))) return R9.evPanel(id);
  RISHTE.gate(() => { $('meta').classList.add('hide'); const L = R9.evLevel(def, i); hideAll(); CL = L; startLevel(L, {}); uiPlaying(true); });
};
R9.toMap = function () { if (state !== 'map' || $('map').classList.contains('hide')) { R9.PM.shown = true; showMap(); } };
R9.evPanel = function (id) {
  R9.toMap();
  const def = R9.evDef(id), s = R9.evSt(def), cur = Math.min(s.done, def.N - 1), all = s.done >= def.N;
  const f = def.char && R7.face(def.char), lt = R7.fmtLeft(Math.max(0, def.ends - Date.now()));
  const node = i => { const r = R9.REW(def, i), st = i < s.done ? 'ok' : i === cur && !all ? 'cur' : 'lock'; return `<div class="r9N ${st} ${r.big ? 'big' : ''}"><b>${st === 'ok' ? '✓' : def.per ? i - R9.DS[R9.chOf(i)] + 1 : i + 1}</b><small>${r.big ? '🎁 CHEST' : r.b ? '🎒 +💎' + (r.g || '') : '🪙 ' + r.c}</small></div>`; };
  let body;
  if (def.per) {
    const day = R9.evDay(), tm = new Date(); tm.setHours(24, 0, 0, 0);
    const curC = R9.chOf(Math.min(39, s.done)), sel = R9._evSel && R9._evSel.id === id ? R9._evSel.c : curC;
    const tabs = def.days.map((dn, c) => { const a = R9.DS[c], P = R9.DP[c], open = R9.chOpen(def, c), done = s.done >= a + P;
      return `<button class="r9Dt ${c === sel ? 'sel' : ''} ${done ? 'ok' : ''} ${open ? '' : 'lk'}" data-dt="${c}"><small>DAY</small><b>${c + 1}</b><i>${done ? '✓' : open ? P + ' lv' : '🔒'}</i></button>`; }).join('');
    const a = R9.DS[sel], P = R9.DP[sel], open = R9.chOpen(def, sel), got = Math.max(0, Math.min(P, s.done - a));
    const grid = open ? `<div class="r9Dg ${P > 7 ? 'many' : ''}">${Array.from({ length: P }, (_, k) => node(a + k)).join('')}</div>`
      : `<div class="r9DL">🔒 <b>${P} levels</b> open ${sel === day ? 'in ' + R7.fmtLeft(tm - Date.now()) : 'on day ' + (sel + 1)}${sel === day && s.done >= a ? `<button class="adbtn" data-early="${sel}">📺 OPEN NOW</button>` : ''}</div>`;
    body = `<div class="r9Dts">${tabs}</div><div class="r9Day"><div class="r9DH"><b>Day ${sel + 1}: ${def.days[sel]}</b><span>${got}/${P}</span></div>${grid}</div>`;
  } else {
    body = `<div class="r9Path">${Array.from({ length: def.N }, (_, i) => `<div style="transform:translateX(${[0, 34, 54, 34, 0, -34, -54, -34][i % 8]}px)">${node(i)}</div>`).reverse().join('')}</div>`;
  }
  const chOpen = !def.per || R9.chOpen(def, R9.chOf(cur));
  const tm2 = new Date(); tm2.setHours(24, 0, 0, 0);
  const champ = s.champ === R7.today();
  const after = all ? `<div class="r9Done">🏆 <b>Event complete!</b><br><small>${def.char ? 'A new love week starts in ' + lt : 'Next event starts in ' + lt}</small></div>
      <div class="r9Champ"><b>👑 CHAMPION ROUND</b><small>One extra hard night every day · 💉 Vaccine + 💎 10</small>
      ${champ ? `<button class="adbtn" id="r9Ch2">📺 PLAY AGAIN<small>reward again</small></button>` : `<button class="btn pulse" id="r9ChGo" style="width:100%">👑 PLAY NOW</button>`}</div>`
    : s.tries <= 0 ? `<div class="r9ENo">Out of tries for today</div><div class="row" style="gap:8px;justify-content:center"><button class="adbtn" id="r9ETr">📺 +3 TRIES<small>watch an ad</small></button><button class="buy" id="r9ETg" style="width:auto;padding:12px 16px">💎 5</button></div>`
    : !chOpen ? `<div class="r9ENo">Today's chapter is done ✓</div><div class="sub">Day ${R9.chOf(cur) + 1} opens in ${R7.fmtLeft(tm2 - Date.now())}</div>`
    : `<button class="btn pulse" id="r9EGo" style="width:100%">▶ PLAY ${def.per ? 'DAY ' + (R9.chOf(cur) + 1) + ' · ' : ''}LEVEL ${def.per ? cur - R9.DS[R9.chOf(cur)] + 1 : cur + 1}</button><div class="r9ERew">Reward: ${R9.rewTxt(R9.REW(def, cur))}</div>`;
  META.panel(`<div class="r9E ${def.char ? 'love' : ''}">
    <div class="r9ETop"><span class="r9EPic">${f ? `<img src="${R7.A(f)}">` : def.i}</span><div><div class="kick">${def.char ? '💞 LOVE WEEK' : '🔥 EVENT'}</div><div class="r9ETt">${def.n}</div><div class="r9ETime">⏳ ends in ${lt} · ${def.N} levels</div></div></div>
    <div class="r9EBar"><span class="r7bar"><i style="width:${s.done / def.N * 100}%"></i></span><b>${s.done}/${def.N}</b></div>
    ${body}
    ${all ? '' : `<div class="r9Tries">${Array.from({ length: 5 }, (_, i) => `<i class="${i < s.tries ? 'on' : ''}">❤️</i>`).join('')}<span>${s.tries} tries today</span></div>`}
    ${after}
  </div>`);
  document.querySelectorAll('[data-dt]').forEach(b => b.onclick = () => { R9._evSel = { id, c: +b.dataset.dt }; sfx.coin && sfx.coin(); R9.evPanel(id); });
  const pth = document.querySelector('#metaBody .r9Path'); if (pth) { const c = pth.querySelector('.cur') || pth.querySelector('.lk'); setTimeout(() => { if (c) pth.scrollTop = c.offsetTop - pth.offsetTop - 40; }, 30); }
  const g = $('r9EGo'); if (g) g.onclick = () => R9.evPlay(id);
  const t = $('r9ETr'); if (t) t.onclick = () => showAd(() => { s.tries += 3; save(); R9.evPanel(id); });
  const tg = $('r9ETg'); if (tg) tg.onclick = () => { if (SAVE.gems < 5) return toast('Not enough 💎'); SAVE.gems -= 5; s.tries += 3; save(); R9.evPanel(id); };
  document.querySelectorAll('[data-early]').forEach(b => b.onclick = () => showAd(() => { s.early = s.early || {}; s.early[+b.dataset.early] = 1; save(); toast('🔓 Next day unlocked!'); R9.evPanel(id); }));
  const cg = $('r9ChGo'); if (cg) cg.onclick = () => R9.champPlay(id);
  const c2 = $('r9Ch2'); if (c2) c2.onclick = () => showAd(() => R9.champPlay(id, 1));
};
R9.champPlay = function (id, again) {
  const def = R9.evDef(id); R9._champ = { id, again };
  RISHTE.gate(() => { $('meta').classList.add('hide'); const L = R9.evLevel(def, def.N - 1); L.r9champ = 1; L.diff *= 1.12; L.story = '👑 Champion Round'; hideAll(); CL = L; startLevel(L, {}); uiPlaying(true); });
};
R9.giveRew = function (r, def) {
  SAVE.coins += r.c || 0; SAVE.gems += r.g || 0;
  for (let k = 0; k < (r.b || 0); k++) { const b = BOOSTERS[(Math.random() * BOOSTERS.length) | 0]; SAVE.boost[b.id] = (SAVE.boost[b.id] || 0) + 1; }
  if (r.vac) R9.addVac(r.vac);
  if (r.bond && def.char) { const sv = SV(); sv.pen[def.char] = Math.max(0, (sv.pen[def.char] || 0) - 5); }
  save();
};
(function () {
  const _sw = window.showWin;
  window.showWin = function (st) {
    if (CL && CL.r9 === 'ev') {
      const def = R9.evDef(CL.r9ev), s = R9.evSt(def), i = CL.r9i; G.cine = null; state = 'win'; SAVE.coins += G.coins; save();
      const mo = $('r7morn'); if (mo) mo.remove();
      if (CL.r9champ) { s.champ = R7.today(); SAVE.gems += 10; R9.addVac(1); save(); sfx.chest && sfx.chest(); META.modal(`<div class="drm home"><div class="drmPic"><img src="${R7.A('trophy')}"></div><div class="kick">👑 CHAMPION ROUND</div><div class="big" style="font-size:28px">YOU ARE THE CHAMPION!</div><div class="chip">💉 +1 Vaccine · 💎 +10 · 🪙 +${G.coins}</div><div class="sub" style="font-size:12px">A vaccine discharges anyone from hospital instantly</div></div>`, 'CONTINUE ▶', () => setTimeout(() => R9.evPanel(def.id), 30)); return; }
      const first = i >= s.done, r = R9.REW(def, i);
      if (first) { s.done = i + 1; R9.giveRew(r, def); }
      sfx.clear && sfx.clear(); if (r.big && first) setTimeout(() => sfx.chest && sfx.chest(), 500);
      const fin = first && i === def.N - 1;
      META.modal(`<div class="drm home"><div class="drmPic ${fin ? 'big' : ''}"><img src="${R7.A(def.char ? R7.subah(def.char) : fin ? 'trophy' : 'x_starter')}"></div>
        <div class="kick">${def.i} ${def.n.toUpperCase()} · LEVEL ${i + 1}/${def.N}</div><div class="big" style="font-size:28px">${fin ? 'EVENT COMPLETE! 🏆' : '⭐'.repeat(st) + ' CLEARED!'}</div>
        ${first ? `<div class="chip">${R9.rewTxt(r)} · 🪙 +${G.coins}</div><button class="adbtn" id="r9X2" style="margin-top:10px">📺 2X REWARD<small>${R9.rewTxt(r)} again</small></button>` : `<div class="sub">Already cleared · 🪙 +${G.coins}</div>`}</div>`, fin ? 'COLLECT 🏆' : 'NEXT ▶', () => setTimeout(() => R9.evPanel(def.id), 30));
      const x2 = $('r9X2'); if (x2) x2.onclick = () => { x2.disabled = true; showAd(() => { R9.giveRew(r, def); REWARD.show({ img: r.big ? 'x_gold' : 'x_coins2', kick: '2X REWARD', t: R9.rewTxt(r) }); }); };
      return;
    }
    return _sw.apply(this, arguments);
  };
  const _so = window.showOver;
  window.showOver = function () { if (CL && CL.r9 === 'ev') { const s = R9.evSt(R9.evDef(CL.r9ev)); s.tries = Math.max(0, s.tries - 1); save(); } return _so.apply(this, arguments); };
})();

/* events hub */
R9.evList = function () { return [R9.evDef('season')].concat(R9.LOVE.map(l => R9.evDef(l.id))); };
R9.evOpen = def => { const s = R9.evSt(def); return R9.evUnlocked(def) && (s.done < def.N ? (!def.per || R9.chOpen(def, R9.chOf(s.done))) : s.champ !== R7.today()); };
R9.eventsHub = function () {
  R9.toMap();
  const ss = R8.shaadiState();
  const card = def => { const s = R9.evSt(def), lk = !R9.evUnlocked(def), f = def.char && R7.face(def.char);
    return `<button class="r9EC ${def.char ? 'love' : 'season'} ${lk ? 'lk' : ''}" data-ev="${def.id}"><span class="r9ECp">${f ? `<img src="${R7.A(f)}">` : def.i}</span><span class="r9ECi"><b>${def.i} ${def.n}</b><small>${lk ? `🔒 Clear Level ${def.id === 'season' ? 3 : 4}` : s.done >= def.N ? '🏆 Complete' : `${def.per ? 'Day ' + (R9.chOf(Math.min(39, s.done)) + 1) + '/5 · ' : ''}${s.done}/${def.N} levels · ⏳ ${R7.fmtLeft(Math.max(0, def.ends - Date.now()))}`}</small><span class="r7bar"><i style="width:${s.done / def.N * 100}%"></i></span></span>${!lk && s.done < def.N ? '<em>PLAY</em>' : ''}</button>`; };
  const L = R9.evList();
  META.panel(`<div class="kick">LIMITED TIME</div><div class="big" style="font-size:30px">🎉 EVENTS</div>
    <button class="r9EC wed ${ss === 'lock' ? 'lk' : ''}" id="r9Wed"><span class="r9ECp"><img src="${R7.A('dulhan_h')}"></span><span class="r9ECi"><b>👰 Wedding Week</b><small>${ss === 'lock' ? '🔒 Clear Level 6' : ss === 'done' ? 'Today\'s ritual done ✓' : '7 days · 7 rituals · the hardest'}</small></span>${ss === 'lock' ? '' : '<em>OPEN</em>'}</button>
    ${card(L[0])}
    <div class="sect" style="margin-top:12px">💞 LOVE WEEKS · 5 DAYS · 40 LEVELS</div>
    ${L.slice(1).map(card).join('')}`);
  $('r9Wed').onclick = () => R8.openShaadi();
  document.querySelectorAll('[data-ev]').forEach(b => b.onclick = () => { const def = R9.evDef(b.dataset.ev); if (!R9.evUnlocked(def)) { sfx.low(); return toast(`🔒 Clear Level ${def.id === 'season' ? 3 : 4} first`); } sfx.coin(); R9.evPanel(def.id); });
};

/* nav: Wedding tab becomes Events (Wedding Week lives inside) */
(function () {
  const b = $('nv_shaadi'); if (b) { b.querySelector('b').textContent = 'Events'; b.querySelector('.ni').innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2l2.6 6.3 6.8.5-5.2 4.4 1.6 6.6L12 16.3 6.2 19.8l1.6-6.6L2.6 8.8l6.8-.5z"/></svg><i class="nb"></i>'; b.onclick = () => { R8.hintDone('shaadi'); sfx.coin(); R9.eventsHub(); }; }
  const _ns = R8.navSync; R8.navSync = function () { _ns.apply(this, arguments); const i = document.querySelector('#nv_shaadi .nb'); if (!i) return; const n = R9.evList().filter(R9.evOpen).length + (['todo', 'new'].includes(R8.shaadiState()) ? 1 : 0); i.textContent = n ? String(n) : ''; i.className = 'nb' + (n ? ' on' : ''); };
  const h = R8.HINTS.find(x => x.k === 'shaadi'); if (h) { h.t = 'Events give big rewards. New levels every week'; h.when = () => (SAVE.unlocked || 1) >= 4; }
})();

R7.css(`
.r9ETop{display:flex;gap:12px;align-items:center;text-align:left}
.r9EPic{width:72px;height:72px;flex:none;border-radius:20px;overflow:hidden;background:linear-gradient(160deg,#9a6df5,#4a1fa8);font-size:40px;line-height:72px;text-align:center;border:2px solid #fff}.r9EPic img{width:100%;height:100%;object-fit:cover}
.r9E.love .r9EPic{border-radius:50%;border-color:#ff8fc0}
.r9ETime{font:700 12px 'Inter';color:#7fd4ff;margin-top:2px}
.r9EBar{display:flex;align-items:center;gap:8px;font:800 13px 'Inter'}.r9EBar .r7bar{flex:1;height:10px}
.r9Path{display:flex;flex-direction:column;align-items:center;gap:6px;margin:10px 0;max-height:300px;overflow-y:auto;padding:6px 0}
.r9N{transform:translateX(var(--x));display:flex;flex-direction:column;align-items:center}
.r9N b{width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:900 18px 'Inter';background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.2);color:#cbb8ff}
.r9N small{font:700 10px 'Inter';opacity:.85;margin-top:2px}
.r9N.ok b{background:linear-gradient(180deg,#5fd0ff,#2f7bff);border-color:#fff;color:#fff}
.r9N.cur b{background:linear-gradient(180deg,#9a6df5,#743ae8);border-color:#fff;color:#fff;width:56px;height:56px;box-shadow:0 0 22px #9a6df5;animation:r9beat 1.2s infinite}
.r9N.big b{border-color:#e8c15a}
.r9Tries{display:flex;align-items:center;justify-content:center;gap:3px;margin:4px 0 10px;font:700 12px 'Inter'}.r9Tries i{font-style:normal;opacity:.25;font-size:16px}.r9Tries i.on{opacity:1}.r9Tries span{margin-left:6px;opacity:.8}
.r9ERew{font:700 12px 'Inter';margin-top:6px;opacity:.9}.r9ENo{font:800 14px 'Inter';margin:6px 0;color:#ff9cc4}.r9Done{font:800 14px 'Inter';padding:12px;border-radius:14px;background:rgba(127,212,255,.12)}
.r9EC{display:flex;align-items:center;gap:10px;width:100%;margin-top:8px;padding:10px;border-radius:18px;border:1.5px solid rgba(154,109,245,.55);background:linear-gradient(135deg,rgba(154,109,245,.28),rgba(30,12,80,.6));color:#fff;text-align:left}
.r9EC.season{border-color:#7fd4ff;background:linear-gradient(135deg,rgba(47,123,255,.35),rgba(30,12,80,.6))}.r9EC.love{border-color:rgba(255,143,192,.7)}.r9EC.wed{border-color:#fff}
.r9EC.lk{opacity:.55;filter:saturate(.5)}
.r9ECp{width:54px;height:54px;flex:none;border-radius:50%;overflow:hidden;background:#743ae8;font-size:30px;line-height:54px;text-align:center;border:2px solid #fff}.r9ECp img{width:100%;height:100%;object-fit:cover}
.r9ECi{flex:1;display:flex;flex-direction:column;gap:3px;min-width:0}.r9ECi b{font:800 15px 'Inter'}.r9ECi small{font:600 11px 'Inter';opacity:.85}.r9ECi .r7bar{height:6px}
.r9EC em{font-style:normal;font:900 12px 'Inter';padding:7px 12px;border-radius:12px;background:linear-gradient(180deg,#5fd0ff,#2f7bff);box-shadow:0 3px 0 #163b9a}
`);

R7.css(`
.r9Ch{display:flex;flex-direction:column;gap:8px;margin:10px 0;max-height:330px;overflow-y:auto;text-align:left}
.r9C{padding:8px 10px;border-radius:16px;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.12)}
.r9C.cur{border-color:#fff;background:rgba(154,109,245,.22);box-shadow:0 0 18px rgba(154,109,245,.45)}.r9C.ok{border-color:#7fd4ff}.r9C.lk{opacity:.75}
.r9CH{display:flex;align-items:center;gap:8px}.r9CH span{font:900 10px Inter;letter-spacing:1.5px;padding:3px 7px;border-radius:8px;background:#743ae8}.r9CH b{flex:1;font:800 14px Inter}.r9CH i{font:700 11px Inter;font-style:normal;opacity:.75}.r9CN.many{display:grid;grid-template-columns:repeat(5,1fr);gap:4px}.r9CN.many .r9N b{width:34px;height:34px;font-size:13px}.r9CN.many .r9N.cur b{width:38px;height:38px}.r9CN.many .r9N small{font-size:9px}.r9CH em{font-style:normal;color:#7fd4ff;font-weight:900}
.r9CN{display:flex;justify-content:space-around;margin-top:6px}.r9CN .r9N b{width:40px;height:40px;font-size:15px}.r9CN .r9N.cur b{width:46px;height:46px}
.r9CL{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:6px;font:700 12px Inter;opacity:.9}.r9CL .adbtn{padding:7px 10px;font-size:12px;width:auto}
.r9Champ{margin-top:10px;padding:12px;border-radius:18px;border:1.5px solid #e8c15a;background:linear-gradient(160deg,rgba(232,193,90,.18),rgba(40,16,100,.6));display:flex;flex-direction:column;gap:6px}.r9Champ b{font:900 16px Inter}.r9Champ small{font:600 12px Inter;opacity:.85}
`);

R7.css(`
.r9ETt{font:900 24px/1.1 Inter;color:#fff;margin:2px 0}
.r9Dts{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:12px 0 8px}
.r9Dt{display:flex;flex-direction:column;align-items:center;padding:6px 0;border-radius:14px;border:1.5px solid rgba(255,255,255,.15);background:rgba(255,255,255,.05);color:#fff;font-family:Inter}
.r9Dt small{font:800 9px Inter;letter-spacing:1.5px;opacity:.75}.r9Dt b{font:900 20px/1.1 Inter}.r9Dt i{font:700 10px Inter;font-style:normal;opacity:.85}
.r9Dt.ok{border-color:#7fd4ff;background:rgba(47,123,255,.25)}.r9Dt.lk{opacity:.55}.r9Dt.sel{border-color:#fff;background:linear-gradient(180deg,#9a6df5,#743ae8);box-shadow:0 0 16px rgba(154,109,245,.6);opacity:1}
.r9Day{padding:10px;border-radius:18px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)}
.r9DH{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;text-align:left}.r9DH b{font:800 15px Inter}.r9DH span{font:800 12px Inter;opacity:.8}
.r9Dg{display:grid;grid-template-columns:repeat(4,1fr);gap:8px 4px}.r9Dg.many{grid-template-columns:repeat(5,1fr)}
.r9Dg .r9N b{width:44px;height:44px;font-size:16px}.r9Dg.many .r9N b{width:38px;height:38px;font-size:14px}.r9Dg .r9N.cur b{width:48px;height:48px}.r9Dg .r9N small{font-size:9px}
.r9DL{display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px 0;font:600 13px Inter}.r9DL .adbtn{width:auto;padding:9px 16px}
`);

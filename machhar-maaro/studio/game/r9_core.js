/* ================= MACHHAR MAARO · ROUND 9 · HOSPITAL SYSTEM =================
   From Level 6, every game over admits the person to hospital.
   Sickness Meter = 10% per admit (10 admits = 100%, critical).
   10-40% General Ward: 2 easy rounds · 50-70% ICU: 3 medium rounds · 80-100% Critical: 3 hard rounds.
   Losing in Critical = one last chance by ad, otherwise death and Yamlok (hardest levels).
   Ads everywhere: revive (skip hospital), instant discharge, doctor visit, last chance, health checkup.
=============================================================================== */
window.R9 = window.R9 || {};
R9.HOSP_FROM = 6;
R9.sv = () => { const s = SV(); s.adm = s.adm || {}; s.r9 = s.r9 || {}; return s; };
R9.visits = id => R9.sv().adm[id] || 0;
R9.meter = id => Math.min(100, R9.visits(id) * 10);
R9.stage = m => m >= 80 ? 'crit' : m >= 50 ? 'icu' : 'ward';
R9.STAGE = {
  ward: { n: 'General Ward', need: 2, diff: 0.72, col: '#7fd4ff', icon: '🛏️', sub: '2 easy rounds to go home' },
  icu: { n: 'ICU', need: 3, diff: 0.95, col: '#9a6df5', icon: '🫀', sub: '3 rounds to go home' },
  crit: { n: 'CRITICAL', need: 3, diff: 1.22, col: '#ff4f8b', icon: '🚨', sub: '3 hard rounds · lose and it could be the end' }
};
R9.patient = () => { const h = R9.sv().hosp; return Object.keys(h).find(k => h[k] && h[k].v2) || null; };
R9.rec = id => R9.sv().hosp[id];

/* meter: everyone except the bride now follows admits */
(function () {
  const _bim = R7.bim; R7.bim = id => id === 'dulhan' ? _bim(id) : R9.meter(id);
  const _add = R7.addBim; R7.addBim = function (id, v) { if (id === 'dulhan') return _add.apply(this, arguments); return 0; };
  const _hl = R7.hospLeft; R7.hospLeft = id => { const h = SV().hosp[id]; if (h && h.v2 && h.stage !== 'crit') return R7.HOSP_MS; return _hl(id); };
  const _cd = R7.checkDeaths; R7.checkDeaths = function () { const sv = SV(), keep = {}; for (const k in sv.hosp) if (sv.hosp[k].v2 && sv.hosp[k].stage !== 'crit') { keep[k] = sv.hosp[k]; delete sv.hosp[k]; } const r = _cd.apply(this, arguments); Object.assign(sv.hosp, keep); return r; };
  const _gd = R7.giveDawa; R7.giveDawa = function () { const sv = SV(), keep = {}; for (const k in sv.hosp) if (sv.hosp[k].v2) { keep[k] = sv.hosp[k]; delete sv.hosp[k]; } const r = _gd.apply(this, arguments); Object.assign(sv.hosp, keep); return r; };
  const _il = R7.ilaaj; R7.ilaaj = function (id) { const h = SV().hosp[id]; if (h && h.v2) return R9.hospScreen(id); return _il.apply(this, arguments); };
  // Yamlok is now the hardest place in the game
  R7.YAM.forEach(L => { L.diff = (L.diff || 1.6) * 1.18; });
  const _sm = HZ.spawnMul.bind(HZ); HZ.spawnMul = function () { let k = _sm(); if (CL && CL.yam) k *= 0.86; return k; };
})();

R9.admit = function (id) {
  const sv = R9.sv(); if (!id || id === 'dulhan' || sv.dead[id]) return;
  sv.adm[id] = (sv.adm[id] || 0) + 1;
  const m = R9.meter(id), st = R9.stage(m);
  sv.hosp[id] = { v2: 1, stage: st, lv: 0, need: R9.STAGE[st].need, got: 0, t0: Date.now(), doc: 0, last: 0, disc: 0 };
  save();
  try { if (window.R7 && R7._notifPlan) R7._notifPlan(); } catch (e) { }
  return st;
};
R9.discharge = function (id, how) {
  const sv = R9.sv(); delete sv.hosp[id]; save();
  const m = R9.meter(id), C = CHARS[id];
  sfx.clear && sfx.clear();
  META.modal(`<div class="drm home"><div class="drmPic"><img src="${R7.A(R7.subah(id))}" alt=""></div><div class="kick">🏠 DISCHARGED</div><div class="big" style="font-size:30px">${C.n.toUpperCase()} IS HOME!</div>
    <div class="sub">${how === 'ad' ? 'The doctor sent them home early.' : 'Treatment complete. Back to protecting the nights!'}</div>
    <div class="r9Met"><span>🦠 Sickness</span><span class="r7bar"><i style="width:${m}%"></i></span><b>${m}%</b></div>
    <div class="sub" style="font-size:12px;opacity:.8">Every hospital visit adds 10%. At 80% the next visit is critical.</div>
    ${R9.visits(id) > 0 ? `<button class="adbtn" id="r9Chk" style="margin-top:8px">📺 HEALTH CHECKUP<small>Sickness −10%</small></button>` : ''}</div>`, 'CONTINUE ▶', () => showMap());
  const b = $('r9Chk'); if (b) b.onclick = () => { $('meta').classList.add('hide'); showAd(() => { sv.adm[id] = Math.max(0, (sv.adm[id] || 0) - 1); save(); REWARD.show({ img: 'u_heartplus', kick: 'HEALTH CHECKUP', t: '🦠 Sickness −10%', sub: `${C.n} feels better`, cb: () => showMap() }); }); };
};

/* hospital rounds */
R9.HTASK = { ward: ['survive', 'kill'], icu: ['survive', 'kill', 'nobite'], crit: ['nobite', 'survive', 'kill'] };
R9.hospLevel = function (id) {
  const h = R9.rec(id), S = R9.STAGE[h.stage], task = R9.HTASK[h.stage][h.lv % R9.HTASK[h.stage].length];
  const pool = LEVELS.filter(l => l.task === task && !l.boss && l.w <= (h.stage === 'crit' ? 3 : h.stage === 'icu' ? 2 : 1));
  const base = pool[Math.min(pool.length - 1, h.stage === 'ward' ? 1 : h.stage === 'icu' ? 3 : 5)] || LEVELS[5];
  const L = Object.assign({}, base, { n: 700 + h.lv, r9: 'hosp', r9char: id, r9theme: 'r_hosp', ev: 'r9', boss: null, newType: null, diff: (base.diff || 1) * S.diff, story: `${S.n} · round ${h.lv + 1} of ${h.need}` });
  if (L.target) L.target = Math.max(8, Math.round(L.target * (h.stage === 'ward' ? 0.6 : h.stage === 'icu' ? 0.85 : 1.05)));
  if (L.len) L.len = Math.round(L.len * (h.stage === 'ward' ? 0.75 : h.stage === 'icu' ? 0.9 : 1.1));
  if (task === 'nobite') L.maxBites = h.stage === 'crit' ? 2 : 4;
  return L;
};
Object.assign(ART.ROOMS, { r_hosp: { bg: 'room_hospital', bed: 'bed_hostel', top: 0.63, sw: [-999, -999] } });
R9.hospScreen = function (id) {
  if (R9.toMap) R9.toMap();
  const h = R9.rec(id); if (!h) return showMap();
  const C = CHARS[id], S = R9.STAGE[h.stage], m = R9.meter(id), f = R7.face(id);
  const steps = Array.from({ length: h.need }, (_, i) => `<i class="${i < h.lv ? 'ok' : i === h.lv ? 'cur' : ''}">${i < h.lv ? '✓' : i + 1}</i>`).join('');
  META.panel(`<div class="drm hosp r9H ${h.stage}"><div class="drmBg" style="background-image:url(${R7.A('room_hospital')})"></div>
    <div class="r9HTop"><span class="r9HPic">${f ? `<img src="${R7.A(f)}">` : C.e}<em>${S.icon}</em></span>
      <div><div class="kick" style="color:${S.col}">${S.icon} ${S.n.toUpperCase()}</div><div class="big" style="font-size:26px;margin:0">${C.n.toUpperCase()} IN HOSPITAL</div></div></div>
    <div class="r9Met"><span>🦠 Sickness</span><span class="r7bar"><i style="width:${m}%;background:${S.col}"></i></span><b>${m}%</b></div>
    <div class="r9Vis">🚑 Hospital visits: <b>${R9.visits(id)}</b> · ${h.stage === 'crit' ? '⚠️ <b>One more loss can be fatal</b>' : `${Math.max(0, Math.ceil((80 - m) / 10))} more visit${Math.ceil((80 - m) / 10) === 1 ? '' : 's'} to critical`}</div>
    <div class="r9Steps">${steps}</div><div class="sub" style="margin:2px 0 8px">${S.sub}</div>
    <button class="btn pulse" id="r9HGo" style="width:100%">🩺 PLAY ROUND ${h.lv + 1}</button>
    <div class="r9HAds">
      ${h.stage !== 'crit' ? `<button class="ilB ad" id="r9Disc"><img src="${R7.A('u_dawa')}"><b>Instant discharge</b><small>📺 watch ${h.stage === 'icu' ? 2 : 1} ad${h.stage === 'icu' ? 's' : ''}${h.disc ? ` · ${h.disc}/2` : ''}</small></button>` : ''}
      <button class="ilB ad" id="r9Doc" ${h.doc || h.need - h.lv <= 1 ? 'disabled' : ''}><img src="${R7.A('u_inject')}"><b>Doctor visit</b><small>📺 one round less</small></button>
      <button class="ilB" id="r9Gem"><img src="${R7.A('u_heartplus')}"><b>💎 ${h.stage === 'crit' ? 30 : h.stage === 'icu' ? 20 : 12}</b><small>discharge now</small></button>
    </div></div>`);
  $('r9HGo').onclick = () => { $('meta').classList.add('hide'); R9.hospPlay(id); };
  const d = $('r9Disc'); if (d) d.onclick = () => showAd(() => { h.disc = (h.disc || 0) + 1; save(); if (h.stage === 'ward' || h.disc >= 2) { $('meta').classList.add('hide'); R9.discharge(id, 'ad'); } else { toast('1 more ad to discharge'); R9.hospScreen(id); } });
  $('r9Doc').onclick = () => { if (h.doc) return; showAd(() => { h.doc = 1; h.need = Math.max(h.lv + 1, h.need - 1); save(); toast('🩺 The doctor removed one round'); R9.hospScreen(id); }); };
  $('r9Gem').onclick = () => { const g = h.stage === 'crit' ? 30 : h.stage === 'icu' ? 20 : 12; if (SAVE.gems < g) { sfx.low(); return toast(`You need ${g - SAVE.gems} more gems`); } SAVE.gems -= g; save(); $('meta').classList.add('hide'); R9.discharge(id, 'gem'); };
};
R9.hospPlay = function (id) { RISHTE.gate(() => { const L = R9.hospLevel(id); hideAll(); CL = L; startLevel(L, {}); uiPlaying(true); }); };
R9.lastChance = function (id) {
  const h = R9.rec(id), C = CHARS[id];
  META.modal(`<div class="drm dead"><div class="drmPic"><img class="drmFam" src="${R7.A('rota')}" alt=""></div><div class="kick" style="color:#ff4f8b">🚨 CRITICAL CONDITION</div><div class="big" style="font-size:28px">${C.n.toUpperCase()} IS SINKING</div>
    <div class="sub">This is the last chance. Save ${C.n} now or lose them forever.</div>
    <button class="r9Save" id="r9Save"><span class="r9Hb">💗</span><b>SAVE ${C.n.toUpperCase()}</b><small>📺 watch an ad · last chance</small></button></div>`, 'LET GO 💔', () => R9.die(id));
  const ok = $('metaOk'); if (ok) { ok.className = 'btn2'; ok.style.cssText = 'width:100%;margin-top:10px;opacity:.8'; }
  const b = $('r9Save'); b.onclick = () => { $('meta').classList.add('hide'); showAd(() => { h.last = 1; save(); REWARD.show({ img: 'u_heartplus', kick: 'SAVED!', t: `${C.n} is stable`, sub: 'Finish the treatment rounds', cb: () => R9.hospScreen(id) }); }); };
};
R9.die = function (id) { const sv = R9.sv(); delete sv.hosp[id]; sv.dead[id] = { jaan: 0, lv: 0, t: Date.now() }; save(); R7.drama('dead', id); };

/* character for hospital and event levels */
(function () {
  const _cid = RISHTE.cid.bind(RISHTE); RISHTE.cid = function (w) { if (typeof CL !== 'undefined' && CL && CL.r9char) return CL.r9char; return _cid(w); };
  const _wc = RISHTE.withChar; RISHTE.withChar = function (w) { const r = _wc.apply(this, arguments); if (typeof CL !== 'undefined' && CL && CL.r9theme) r.theme = CL.r9theme; return r; };
})();

/* win and loss for hospital levels; admit on normal level game over */
R9.pend = null;
(function () {
  const _sw = window.showWin;
  window.showWin = function (st, objs) {
    if (CL && CL.r9 === 'hosp') {
      const id = CL.r9char, h = R9.rec(id); G.cine = null; state = 'win'; SAVE.coins += G.coins; save();
      const mo = $('r7morn'); if (mo) mo.remove();
      if (!h) return showMap();
      h.lv++; save(); sfx.clear && sfx.clear();
      if (h.lv >= h.need) return R9.discharge(id, 'play');
      META.modal(`<div class="drm hosp"><div class="drmPic"><img src="${R7.A(R7.subah(id))}"></div><div class="kick">🩺 ROUND ${h.lv} CLEARED</div><div class="big" style="font-size:28px">${CHARS[id].n.toUpperCase()} IS RECOVERING</div><div class="r9Steps">${Array.from({ length: h.need }, (_, i) => `<i class="${i < h.lv ? 'ok' : i === h.lv ? 'cur' : ''}">${i < h.lv ? '✓' : i + 1}</i>`).join('')}</div><div class="sub">${h.need - h.lv} round${h.need - h.lv > 1 ? 's' : ''} left to go home</div></div>`, 'NEXT ROUND ▶', () => R9.hospPlay(id));
      return;
    }
    return _sw.apply(this, arguments);
  };
  const _so = window.showOver;
  window.showOver = function (kind) {
    const r = _so.apply(this, arguments);
    R9.pend = null;
    if (CL && !CL.ev && !CL.yam && !CL.shaadi && CL.n >= R9.HOSP_FROM && CL.n <= 300) R9.pend = (G.wakeS && G.wakeS.cid) || CW.cid;
    if (CL && CL.r9 === 'hosp') R9.pend = null;
    R9.overNote();
    return r;
  };
  const _rv = window.revive; window.revive = function () { R9.pend = null; return _rv.apply(this, arguments); };
})();
R9.overNote = function () {
  const ov = $('over'); let n = $('r9Note'); if (!n) { n = document.createElement('div'); n.id = 'r9Note'; const w = ov.querySelector('.r8Fail'); if (w) w.before(n); else return; }
  const id = R9.pend;
  if (CL && CL.r9 === 'hosp') { const h = R9.rec(CL.r9char); n.className = 'r9Note crit'; n.innerHTML = h && h.stage === 'crit' && !h.last ? `🚨 <b>Critical!</b> Revive now or ${CHARS[CL.r9char].n} may not survive` : `🩺 Hospital round lost. Revive or try again`; return; }
  if (!id) { n.className = 'r9Note off'; n.innerHTML = ''; return; }
  const next = Math.min(100, (R9.visits(id) + 1) * 10), st = R9.stage(next);
  n.className = 'r9Note ' + st;
  n.innerHTML = `🚑 Leave now and <b>${CHARS[id].n}</b> goes to <b>${R9.STAGE[st].n}</b> · Sickness <b>${next}%</b><br><small>Revive to skip the hospital</small>`;
};
/* retry and map from the game over screen */
R9.leaveOver = function (toMap) {
  clearInterval(revTimer);
  if (CL && CL.r9 === 'hosp') { const id = CL.r9char, h = R9.rec(id); if (h && h.stage === 'crit') { if (!h.last) return R9.lastChance(id); return R9.die(id); } return toMap ? showMap() : R9.hospScreen(id); }
  if (CL && CL.r9 === 'ev') return toMap ? showMap() : R9.evPlay(CL.r9ev, CL.r9i);
  if (R9.pend) { const id = R9.pend; R9.pend = null; R9.admit(id); return R9.admitModal(id); }
  if (toMap) return showMap();
  if (CL.ev) { hideAll(); return RISHTE.startEvent(CL.ev); }
  showIntro(CL.n);
};
R9.admitModal = function (id) {
  const h = R9.rec(id), S = R9.STAGE[h.stage], m = R9.meter(id), C = CHARS[id];
  try { sfx.heart && sfx.heart(1.4); } catch (e) { }
  META.modal(`<div class="drm hosp"><div class="drmBg" style="background-image:url(${R7.A('room_hospital')})"></div><div class="drmPic"><img class="drmFam" src="${R7.A('rota')}" alt=""></div>
    <div class="kick" style="color:${S.col}">🚑 ADMITTED · ${S.n.toUpperCase()}</div><div class="big" style="font-size:28px">${C.n.toUpperCase()} IN HOSPITAL!</div>
    <div class="r9Met"><span>🦠 Sickness</span><span class="r7bar"><i style="width:${m}%;background:${S.col}"></i></span><b>${m}%</b></div>
    <div class="sub">${S.sub}</div></div>`, '🩺 START TREATMENT', () => R9.hospScreen(id));
};
(function () { $('oAgain').onclick = () => R9.leaveOver(false); $('oMap').onclick = () => R9.leaveOver(true); })();

/* the patient blocks normal levels and events until discharged */
(function () {
  const _si = window.showIntro;
  window.showIntro = function (n) {
    if (typeof n === 'number' && n >= 600 && n < 800 && CL) { if (CL.r9 === 'hosp') return R9.hospScreen(CL.r9char); if (CL.r9 === 'ev') return R9.evPlay(CL.r9ev, CL.r9i); }
    const p = R9.patient(); if (p && typeof n === 'number' && n <= 300) return R9.hospScreen(p);
    return _si.apply(this, arguments);
  };
  const _hero = R8.hero; R8.hero = function () { const p = R9.patient(); if (!p) return _hero.apply(this, arguments); const c = SAVE.curChar; SAVE.curChar = p; const r = _hero.apply(this, arguments); SAVE.curChar = c; return r; };
})();

/* Level 6+ : the real game */
(function () {
  const _sp = window.spawnMosq; window.spawnMosq = function () { const m = _sp.apply(this, arguments); if (m && m.sp && CL && !CL.ev && !CL.yam && CL.n >= 6 && CL.n <= 300) m.sp *= 1.1; return m; };
  const _sm = HZ.spawnMul.bind(HZ); HZ.spawnMul = function () { let k = _sm(); if (CL && !CL.ev && !CL.yam && CL.n >= 6 && CL.n <= 300) k *= 0.84; return k; };
})();

/* cat and lizard are gone */
(function () { const _fl = HZ.forLevel.bind(HZ); HZ.forLevel = function (L) { return _fl(L).filter(k => k !== 'billi' && k !== 'chhipkali'); }; delete HZDEF.billi; delete HZDEF.chhipkali; })();

R7.css(`
.r9H .r9HTop{display:flex;gap:12px;align-items:center;text-align:left;margin-bottom:10px}
.r9HPic{position:relative;width:70px;height:70px;border-radius:50%;overflow:hidden;border:3px solid #fff;flex:none;background:#743ae8;font-size:38px;line-height:64px;text-align:center}.r9HPic img{width:100%;height:100%;object-fit:cover}.r9HPic em{position:absolute;right:-2px;bottom:-2px;font-style:normal;font-size:20px;line-height:1}
.r9H.crit .r9HPic{border-color:#ff4f8b;animation:r9beat 1s infinite}@keyframes r9beat{50%{box-shadow:0 0 0 8px rgba(255,79,139,.25)}}
.r9Met{display:flex;align-items:center;gap:8px;margin:8px 0;font:700 13px 'Inter',sans-serif}.r9Met .r7bar{flex:1;height:12px}.r9Met b{min-width:42px;text-align:right}
.r9Vis{font:600 12px 'Inter',sans-serif;opacity:.9;margin-bottom:8px}
.r9Steps{display:flex;justify-content:center;gap:10px;margin:8px 0}.r9Steps i{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:800 15px 'Inter';font-style:normal;background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.2)}
.r9Steps i.ok{background:#2f7bff;border-color:#7fd4ff}.r9Steps i.cur{border-color:#fff;box-shadow:0 0 14px #9a6df5;animation:r9beat 1.2s infinite}
.r9HAds{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:10px}.r9HAds .ilB small{font-size:10px}
.r9Save{display:flex;flex-direction:column;align-items:center;width:100%;margin-top:12px;padding:14px;border:0;border-radius:20px;color:#fff;background:linear-gradient(180deg,#ff6b9b,#d6336c);box-shadow:0 6px 0 #8f1d47,0 0 30px rgba(255,79,139,.6);animation:r9pulse 1s infinite}
.r9Save .r9Hb{font-size:34px;animation:r9beat2 .8s infinite}.r9Save b{font:900 20px 'Inter'}.r9Save small{font:600 12px 'Inter';opacity:.9}
@keyframes r9pulse{50%{transform:scale(1.03)}}@keyframes r9beat2{30%{transform:scale(1.25)}60%{transform:scale(1)}}
.r9Note{margin:6px auto 2px;max-width:400px;padding:8px 12px;border-radius:14px;font:600 13px/1.35 'Inter',sans-serif;text-align:center;background:rgba(127,212,255,.12);border:1px solid rgba(127,212,255,.4)}
.r9Note~* #oMeta span:first-child,#oMeta span:first-child{display:none}.r9Note small{opacity:.85;font-size:11px}.r9Note.icu{background:rgba(154,109,245,.18);border-color:#9a6df5}.r9Note.crit{background:rgba(255,79,139,.16);border-color:#ff4f8b;animation:r9beat 1.2s infinite}.r9Note.off{display:none}
`);
(function () { const _cc = R7.charCard; R7.charCard = function (id) { let h = _cc.apply(this, arguments); const r = R9.rec(id); if (r && r.v2) h = h.replace(/<em class="hs">[^<]*<\/em>/, `<em class="hs">${R9.STAGE[r.stage].icon} ${r.stage === 'crit' ? 'CRITICAL' : r.stage === 'icu' ? 'ICU' : 'Ward'}</em>`); return h; }; })();

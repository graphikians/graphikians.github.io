/* ================= MACHHAR MAARO · ROUND 8 · UX =================
   Banner safe area, bottom nav (Play · Family · Requests · Wedding · Shop),
   clean home with one big PLAY button, first time finger hints,
   forced request flow before a level, pro AD badge, settings.
================================================================== */
window.R8 = window.R8 || {};
R8.tab = 'play';
R8.ls = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };

/* ---------- 1. banner height (real height comes from native.js) ---------- */
document.documentElement.style.setProperty('--bnrH', '62px');
R8.setBanner = h => document.documentElement.style.setProperty('--bnrH', Math.max(50, Math.round(h)) + 'px');

/* ---------- 2. AD badge (replaces the TV emoji everywhere) ---------- */
R8.AD = '<span class="adB"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>AD</span>';
R8.adify = function (root) {
  if (!root || !root.querySelectorAll) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => n.nodeValue.indexOf('📺') >= 0 && !(n.parentNode && /^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName)) ? 1 : 2 });
  const list = []; while (w.nextNode()) list.push(w.currentNode);
  list.forEach(n => {
    const parts = n.nodeValue.split('📺'), f = document.createDocumentFragment();
    parts.forEach((p, i) => { if (i) { const s = document.createElement('span'); s.innerHTML = R8.AD; f.appendChild(s.firstChild); } if (p) f.appendChild(document.createTextNode(i ? p.replace(/^\s+/, ' ') : p)); });
    n.parentNode.replaceChild(f, n);
  });
};
new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) { if (n.nodeType === 1) R8.adify(n); else if (n.nodeType === 3 && n.nodeValue.indexOf('📺') >= 0 && n.parentNode) R8.adify(n.parentNode); } }).observe(document.body, { childList: true, subtree: true });
R8.adify(document.body);

/* ---------- 3. clean home ---------- */
R8.shaadiState = function () {
  if ((SAVE.unlocked || 1) < 6) return 'lock';
  try { const s = R7.sh(); if (s.start == null) return 'new'; const d = Math.min(7, R7.shDay()); return R7.shDayDone(d) ? 'done' : 'todo'; } catch (e) { return 'new'; }
};
R8.openShaadi = function () { if (R8.shaadiState() === 'lock') { sfx.low && sfx.low(); return toast('🔒 Clear Level 6 to start the Wedding Week'); } sfx.power(); R7.shaadiPanel(); };
R8.hero = function () {
  const id = RISHTE.cid(0), C = CHARS[id] || { n: 'Family', e: '🙂' }, n = Math.min(SAVE.unlocked || 1, LEVELS.length), L = LEVELS[n - 1];
  const st = R7.status(id), p = R7.rp(id), bm = R7.bim(id), pd = R7.pend(id).filter(d => !d.k.startsWith('T_')).length, f = R7.face(id);
  const btn = st === 'hosp' ? '🏥 TREAT ' + C.n.toUpperCase() : st === 'dead' ? '🕯️ SAVE ' + C.n.toUpperCase() : (L && L.boss ? '👑 BOSS LEVEL ' + n : 'PLAY LEVEL ' + n);
  return `<div class="r8Hero ${C.dil ? 'dil' : ''}">
    <div class="r8HTop"><span class="r8Hearts">❤️ <b>${RISHTE.hearts()}</b>/5 <small>${RISHTE.heartTime()}</small></span><span class="r8W">${L ? 'WORLD ' + (L.w + 1) + ' · ' + WORLDS[L.w].name : ''}</span></div>
    <button class="r8Who" id="r8Who"><span class="r8Pic">${f ? `<img src="${R7.A(f)}" alt="">` : `<span class="em">${C.e}</span>`}${st !== 'ok' ? `<i class="r8St ${st}">${st === 'hosp' ? '🏥' : '🕯️'}</i>` : ''}</span>
      <span class="r8Info"><span class="r8N">${C.n}${C.dil ? ' <em>HARD</em>' : ''}<i>change ▾</i></span>
      <span class="r8M"><small>💞 Bond</small><span class="r7bar"><i style="width:${p}%"></i></span><b>${R7.rpTxt(p)}</b></span>
      <span class="r8M bim ${bm > 70 ? 'hi' : ''}"><small>🦠 Sickness</small><span class="r7bar"><i style="width:${bm}%"></i></span><b>${Math.round(bm)}%</b></span>
      ${pd ? `<span class="r8Pd">📜 ${pd} request${pd > 1 ? 's' : ''} waiting</span>` : ''}</span></button>
    <button class="r8Play" id="r8Play"><span>${btn}</span><small>${L ? (L.boss ? BOSSES[L.boss].name : TASKS[L.task].name) : ''}</small></button>
  </div>`;
};
R8.KEEP = ['missions', 'spin', 'kosh', 'league', 'ach'];
const _r8rm = window.renderMap;
window.renderMap = function () {
  _r8rm.apply(this, arguments);
  const mb = $('mapBody'), hub = mb.querySelector('.hub'), strip = mb.querySelector('.rsStrip');
  document.body.classList.toggle('r8Rishte', R8.tab === 'rishte');
  if (hub) {
    hub.querySelectorAll('.hbtns button').forEach(b => { const k = b.dataset.h || b.dataset.r; if (!R8.KEEP.includes(k) && k !== 'kamra' && k !== 'events') b.remove(); });
    const hb = hub.querySelector('.hbtns'); if (hb) hb.classList.add('r8Quick');
  }
  const head = document.createElement('div'); head.className = 'r8Lv'; head.innerHTML = '<b>ALL LEVELS</b><small>replay for more stars</small>';
  const firstWorld = mb.querySelector('.world'); if (firstWorld) mb.insertBefore(head, firstWorld);
  const h = document.createElement('div'); h.innerHTML = R8.hero(); const heroEl = h.firstChild;
  if (R8.tab === 'rishte') {
    // family page: only the people
    [...mb.children].forEach(c => { if (c !== strip && c !== hub) c.remove(); });
    if (hub) { [...hub.children].forEach(c => { if (c !== strip) c.remove(); }); }
    if (strip) { const sb = strip.querySelector('#r7Shaadi'); if (sb) sb.remove(); mb.prepend(strip); }
    const t = document.createElement('div'); t.className = 'r8Page'; t.innerHTML = '<div class="kick">YOUR FAMILY</div><div class="r8PT">Who will you protect tonight?</div><button class="r8Link" id="r8Bonds">💞 Bond levels and rewards ›</button>';
    mb.prepend(t); $('r8Bonds').onclick = () => { sfx.coin(); RISHTE.rishte(); };
    if (hub && !hub.children.length) hub.remove();
  } else {
    if (strip) strip.remove();
    if (hub) { hub.querySelectorAll('.pcard,.hstat').forEach(e => e.remove()); }
    mb.prepend(heroEl);
    $('r8Play').onclick = () => { initAudio(); const id = RISHTE.cid(0), st = R7.status(id); if (st !== 'ok') return R7.pickChar(id); showIntro(Math.min(SAVE.unlocked || 1, LEVELS.length)); };
    $('r8Who').onclick = () => R7.pickSheet(() => renderMap());
  }
  R8.navSync();
};
// open the home at the top (the big button), not scrolled to a node
(function () { const si = Element.prototype.scrollIntoView; Element.prototype.scrollIntoView = function () { if (R8.noScroll && this.closest && this.closest('#mapBody')) return; return si.apply(this, arguments); }; })();
const _r8sm = window.showMap;
window.showMap = function () { R8.noScroll = true; const r = _r8sm.apply(this, arguments); $('map').scrollTop = 0; setTimeout(() => { R8.noScroll = false; }, 400); R8.hintSoon(); return r; };
R8.goTab = function (t) { R8.tab = t; sfx.coin && sfx.coin(); vib && vib(6); if (state !== 'map') showMap(); else { renderMap(); $('map').scrollTop = 0; } R8.hintSoon(); };

/* legal pages inside the game (work offline) */
R8.legal = function (file, title) {
  const o = document.createElement('div'); o.id = 'r8Leg';
  o.innerHTML = `<div class="r8LgH"><button id="r8LgX">‹ Back</button><b>${title}</b><span></span></div><iframe src="${file}"></iframe>`;
  document.body.appendChild(o);
  o.querySelector('#r8LgX').onclick = () => o.remove();
};
R7.css(`
#r8Leg{position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;background:#f6f2ff}
#r8Leg .r8LgH{display:flex;align-items:center;justify-content:space-between;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 10px;background:linear-gradient(135deg,#743ae8,#9a6df5);color:#fff;font:800 16px Inter,sans-serif}
#r8Leg .r8LgH button{background:rgba(255,255,255,.18);border:0;color:#fff;font:800 14px Inter,sans-serif;padding:8px 14px;border-radius:12px}
#r8Leg .r8LgH span{width:70px}
#r8Leg iframe{flex:1;border:0;width:100%;background:#fff}
.r8Leg button b{font-size:22px;opacity:.7;font-weight:600}
`);

/* ---------- 4. bottom nav ---------- */
R8.navIcon = {
  play: '<svg viewBox="0 0 24 24"><path d="M7 4.8v14.4c0 .8.9 1.3 1.6.9l11.3-7.2c.6-.4.6-1.3 0-1.7L8.6 3.9C7.9 3.5 7 4 7 4.8z"/></svg>',
  rishte: '<svg viewBox="0 0 24 24"><path d="M12 20.6s-7.6-4.5-9.3-9.6C1.6 7.6 3.6 4 7.1 4c2 0 3.6 1.1 4.9 2.8C13.3 5.1 14.9 4 16.9 4c3.5 0 5.5 3.6 4.4 7-1.7 5.1-9.3 9.6-9.3 9.6z"/></svg>',
  far: '<svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm2.5 7h7v1.7h-7zm0 3.6h7v1.7h-7zm0-7.2h4.5v1.7H8.5z"/></svg>',
  shaadi: '<svg viewBox="0 0 24 24"><path d="M9 8.2 7.4 5h9.2L15 8.2a6.5 6.5 0 1 1-6 0zM12 10a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2zM10.2 2h3.6l1.2 2H9z"/></svg>',
  shop: '<svg viewBox="0 0 24 24"><path d="M4 8h16l-1.3 11.2a2 2 0 0 1-2 1.8H7.3a2 2 0 0 1-2-1.8zm4 0V7a4 4 0 0 1 8 0v1h-2V7a2 2 0 0 0-4 0v1z"/></svg>'
};
R8.nav = (function () {
  const n = document.createElement('nav'); n.id = 'r8nav';
  n.innerHTML = [['play', 'Play'], ['rishte', 'Family'], ['far', 'Requests'], ['shaadi', 'Wedding'], ['shop', 'Shop']].map(([k, t]) => `<button data-nv="${k}" id="nv_${k}"><span class="ni">${R8.navIcon[k]}<i class="nb"></i></span><b>${t}</b></button>`).join('');
  document.body.appendChild(n);
  n.querySelectorAll('[data-nv]').forEach(b => b.onclick = () => {
    const k = b.dataset.nv; R8.hintDone(k);
    if (k === 'play' || k === 'rishte') return R8.goTab(k);
    if (k === 'far') { sfx.coin(); return R7.diary(); }
    if (k === 'shaadi') return R8.openShaadi();
    if (k === 'shop') { sfx.coin(); return openShop('rackets'); }
  });
  return n;
})();
R8.navSync = function () {
  const set = (k, v, cls) => { const i = document.querySelector(`#nv_${k} .nb`); if (!i) return; i.textContent = v || ''; i.className = 'nb' + (v ? ' on' : '') + (cls ? ' ' + cls : ''); };
  document.querySelectorAll('#r8nav [data-nv]').forEach(b => b.classList.toggle('act', b.dataset.nv === R8.tab));
  let sick = 0; try { sick = PUBLIC_IDS.concat(R7.DIL).filter(i => R7.status(i) !== 'ok').length; } catch (e) { }
  set('rishte', sick ? '!' : '', 'red');
  let pd = 0; try { pd = R7.pend().length; } catch (e) { }
  set('far', pd ? String(pd) : '');
  const ss = R8.shaadiState(); set('shaadi', ss === 'todo' || ss === 'new' ? '1' : ss === 'lock' ? '🔒' : '', ss === 'lock' ? 'lk' : '');
  const canBuy = (SAVE.coins || 0) >= 300 && !R8.ls('mmShopSeen' + R7.today());
  set('shop', canBuy ? 'NEW' : '', 'new');
};
setInterval(() => {
  const on = state === 'map' && !$('map').classList.contains('hide');
  document.body.classList.toggle('onMap', on);
  document.body.classList.toggle('inPlay', state === 'play' || state === 'pause' || state === 'ko');
  if (on) R8.navSync();
}, 300);
(function () { const _os = window.openShop; window.openShop = function () { R8.ls('mmShopSeen' + R7.today(), '1'); return _os.apply(this, arguments); }; })();

/* ---------- 5. first time finger hints ---------- */
R8.HINTS = [
  { k: 'play', sel: '#r8Play', t: 'Tap here to start the night', when: () => true },
  { k: 'far', sel: '#nv_far', t: 'A family member wants something. Fulfil requests to keep them happy', when: () => R7.pend().length > 0 },
  { k: 'rishte', sel: '#nv_rishte', t: 'Pick who you protect. Each person has their own bond and rewards', when: () => (SAVE.unlocked || 1) >= 3 },
  { k: 'shop', sel: '#nv_shop', t: 'Boosters, rackets and room items are here', when: () => (SAVE.unlocked || 1) >= 4 && (SAVE.coins || 0) >= 300 },
  { k: 'shaadi', sel: '#nv_shaadi', t: 'New chapter unlocked: the Wedding Week', when: () => (SAVE.unlocked || 1) >= 6 }
];
R8.hintDone = k => R8.ls('mmHint_' + k, '1');
R8.hintSoon = function () { clearTimeout(R8._ht); R8._ht = setTimeout(R8.hintTry, 1300); };
R8.blocked = () => state !== 'map' || $('map').classList.contains('hide') || !$('meta').classList.contains('hide') || document.querySelector('#sheet.on,.rwOv,#r7morn,#r7splash,#r7cine,.r8Ov');
R8.hintTry = function () {
  if (R8.blocked()) return R8.hintSoon();
  const h = R8.HINTS.find(x => !R8.ls('mmHint_' + x.k) && x.when() && document.querySelector(x.sel));
  if (h) R8.point(h.sel, h.t, () => { R8.hintDone(h.k); R8.hintSoon(); });
};
R8.point = function (sel, text, done) {
  const el = document.querySelector(sel); if (!el) return;
  document.querySelectorAll('.r8Hint').forEach(e => e.remove());
  const r = el.getBoundingClientRect(), d = document.createElement('div'); d.className = 'r8Hint';
  const up = r.top > innerHeight * 0.55, cx = r.left + r.width / 2;
  d.innerHTML = `<div class="r8Ring" style="left:${r.left - 6}px;top:${r.top - 6}px;width:${r.width + 12}px;height:${r.height + 12}px"></div>
    <div class="r8Fing ${up ? 'up' : ''}" style="left:${cx - 22}px;top:${up ? r.top - 64 : r.bottom + 4}px">${up ? '👇' : '👆'}</div>
    <div class="r8Tip ${up ? 'up' : ''}" style="${up ? `bottom:${innerHeight - r.top + 70}px` : `top:${r.bottom + 70}px`}">${text}</div>`;
  document.body.appendChild(d);
  const end = () => { d.remove(); done && done(); removeEventListener('pointerdown', end, true); };
  setTimeout(() => addEventListener('pointerdown', end, true), 250);
  setTimeout(() => { if (d.isConnected) end(); }, 9000);
};
// first booster pick on the mission card
(function () { const _si = window.showIntro; window.showIntro = function (n) { const r = _si.apply(this, arguments); R8.forceBind(n); if (n >= 4 && !R8.ls('mmHint_boost') && document.querySelector('.bst2')) setTimeout(() => { if (state === 'intro') { R8.point('.icBst', 'Boosters make hard nights easy. Tap one to take it along', () => R8.hintDone('boost')); } }, 700); return r; }; })();

/* ---------- 6. requests must be handled before the night ---------- */
R8.angry = null;
R8.forceBind = function (n) {
  const b = $('iStart'); if (!b) return;
  const orig = b.onclick;
  b.onclick = function (e) {
    const id = CW.cid, d = R7.pend(id).find(x => !x.k.startsWith('T_'));
    if (!d || CL.ev || CL.yam) return orig.call(this, e);
    R8.force(d, () => showIntro(n), () => orig.call(b, e));
  };
};
R8.force = function (d, back, go) {
  const i = R7.dInfo(d.k), C = CHARS[d.id], cost = d.g ? `${R7.img('gem')}<b>${d.g}</b>` : `<span class="coin"></span><b>${fmt(d.c)}</b>`;
  const can = SAVE.coins >= d.c && SAVE.gems >= d.g;
  const ov = document.createElement('div'); ov.className = 'r8Ov';
  ov.innerHTML = `<div class="r8Frc">
    <div class="r8FKick">BEFORE YOU SLEEP</div>
    <div class="r8FPic"><img src="${R7.A(i.img)}" alt=""><span class="r8FFace">${R7.face(d.id) ? `<img src="${R7.A(R7.face(d.id))}" alt="">` : C.e}</span></div>
    <div class="r8FT">${C.n} wants <b>${i.n}</b></div>
    <div class="r8FL">"${i.line}"</div>
    <div class="r8FWarn">Unhappy family members wake up faster</div>
    <button class="r8FBtn pay ${can ? '' : 'no'}" id="fPay"><span>GIVE IT</span><em>${cost}</em></button>
    ${d.half ? '' : `<button class="r8FBtn ad" id="fAd"><span>WATCH 📺 FOR HALF PRICE</span><em>${d.g ? R7.img('gem') + '<b>' + Math.round(d.g / 2) + '</b>' : '<span class="coin"></span><b>' + fmt(Math.round(d.c / 2)) + '</b>'}</em></button>`}
    <button class="r8FBtn no2" id="fNo"><span>REFUSE</span><em class="neg">💔 Bond −3% · wakes 2× faster</em></button>
    <button class="r8FX" id="fX">Back</button></div>`;
  document.body.appendChild(ov); requestAnimationFrame(() => ov.classList.add('on'));
  const close = () => { ov.remove(); };
  $('fX').onclick = () => { close(); };
  $('fPay').onclick = () => {
    if (!(SAVE.coins >= d.c && SAVE.gems >= d.g)) { sfx.low(); return toast(SAVE.coins < d.c ? `You need ${fmt(d.c - SAVE.coins)} more coins` : `You need ${d.g - SAVE.gems} more gems`); }
    SAVE.coins -= d.c; SAVE.gems -= d.g; close(); R7.completeDemand(d); renderMapSafe(); setTimeout(back, 300);
  };
  const ad = $('fAd'); if (ad) ad.onclick = () => showAd(() => { d.half = 1; d.c = Math.round(d.c / 2); d.g = Math.round(d.g / 2); save(); close(); toast('Half price unlocked!'); R8.force(d, back, go); });
  $('fNo').onclick = () => {
    const sv = SV(); sv.pen[d.id] = (sv.pen[d.id] || 0) + 3; sv.dem.pend = sv.dem.pend.filter(x => x.uid !== d.uid); save();
    R8.angry = d.id; sfx.low && sfx.low(); vib && vib([40, 40, 40]); close(); toast(`💔 ${C.n} is upset. Tonight will be harder`); go();
  };
};
function renderMapSafe() { try { if (state === 'map') renderMap(); } catch (e) { } }
(function () { const _sl = window.startLevel; window.startLevel = function () { const r = _sl.apply(this, arguments); if (R8.angry && CW.cid === R8.angry) { SENS_MAP[R8.angry] = (SENS_MAP[R8.angry] || 1) * 2; G.r8angry = 1; } R8.angry = null; return r; }; })();

/* ---------- 7. settings ---------- */
R8.settings = function () {
  const mus = window.MUS ? MUS.on : true, snd = !muted;
  META.panel(`<div class="kick">SETTINGS</div><div class="big" style="font-size:30px">⚙️ SETTINGS</div>
    <div class="r8Set">
      <button id="stMus" class="${mus ? 'on' : ''}"><span>🎵 Music</span><i></i></button>
      <button id="stSnd" class="${snd ? 'on' : ''}"><span>🔊 Sound effects</span><i></i></button>
      <button id="stLow" class="${R7.low ? 'on' : ''}"><span>⚡ Battery saver<small>smoother on older phones</small></span><i></i></button>
      <button id="stVib" class="${R8.ls('mmNoVib') ? '' : 'on'}"><span>📳 Vibration</span><i></i></button>
    </div>
    <div class="kick" style="margin-top:16px">LEGAL & PRIVACY</div>
    <div class="r8Set r8Leg">
      <button id="stPriv"><span>🔒 Privacy policy</span><b>›</b></button>
      <button id="stTerms"><span>📄 Terms of use</span><b>›</b></button>
      <button id="stAdP"><span>🛡️ Ad privacy choices<small>change your ad consent</small></span><b>›</b></button>
    </div>
    <div class="r8SetF">Machhar Maaro · Made by SANX Graphikians</div>`);
  const doc = (f, t) => { sfx.coin(); R8.legal(f, t); };
  $('stPriv').onclick = () => doc('privacy.html', 'Privacy policy');
  $('stTerms').onclick = () => doc('terms.html', 'Terms of use');
  $('stAdP').onclick = async () => { sfx.coin(); if (window.MM_PRIV_SHOW) { const ok = await window.MM_PRIV_SHOW(); if (!ok) toast('No ad privacy choices needed in your region'); } else toast('Ad privacy choices are available in the Play Store app'); };
  const tg = (id, f) => $(id).onclick = () => { f(); $(id).classList.toggle('on'); sfx.coin(); };
  tg('stMus', () => { const b = $('r7mus'); if (b) b.click(); });
  tg('stSnd', () => $('mute').click());
  tg('stLow', () => { R7.low = !R7.low; R8.ls('mmLow', R7.low ? '1' : '0'); if (R7.low && R7.applyLow) R7.applyLow(); else toast('Restart the game to apply'); });
  tg('stVib', () => R8.ls('mmNoVib', R8.ls('mmNoVib') ? '' : '1'));
};
(function () {
  const sb = $('shopBtn'); if (sb) { sb.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.7 7.7 0 0 0-1.7-1l-.4-2.6h-4l-.4 2.6a7.7 7.7 0 0 0-1.7 1l-2.5-1-2 3.5L4.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1c.5.4 1.1.7 1.7 1l.4 2.6h4l.4-2.6c.6-.3 1.2-.6 1.7-1l2.5 1 2-3.5zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/></svg>'; sb.classList.add('r8Gear'); sb.onclick = () => { sfx.coin(); R8.settings(); }; }
  try { const nv = navigator.vibrate && navigator.vibrate.bind(navigator); if (nv) navigator.vibrate = p => R8.ls('mmNoVib') ? false : nv(p); } catch (e) { }
})();

// canvas text needs the fonts ready
try { ['900 20px Poppins', '800 20px Poppins', '700 20px Poppins', '600 20px Poppins', '400 20px "Lilita One"', '700 20px "Baloo 2"'].forEach(f => document.fonts.load(f)); } catch (e) { }
// a hint goes away if its screen changes
setInterval(() => { const h = document.querySelector('.r8Hint'); if (h && (R8._hs !== state)) h.remove(); R8._hs = state; }, 300);

/* ---------- 8. CSS ---------- */
R7.css(`
:root{--bnrB:0px;--navH:66px}
body.bnr{--bnrB:calc(var(--bnrH) + env(safe-area-inset-bottom,0px))}
body.bnr .ov:not(#adov):not(#pause){padding-bottom:calc(var(--bnrB) + 18px)!important}
body.bnr #sheet .shBox{bottom:var(--bnrB);max-height:calc(88vh - var(--bnrB))}
body.bnr .r8Ov{padding-bottom:calc(var(--bnrB) + 12px)}
#fakeBnr{height:var(--bnrH)!important}
#map #mapBody{padding-bottom:calc(var(--navH) + var(--bnrB) + 24px)!important}
body:not(.inPlay) #mute,body:not(.inPlay) #r7mus{display:none!important}
#r8nav{position:fixed;left:0;right:0;bottom:var(--bnrB);z-index:8;height:var(--navH);display:none;justify-content:space-around;align-items:stretch;padding:0 4px;background:linear-gradient(180deg,#1d0f52,#120838);border-top:1px solid rgba(154,109,245,.45);box-shadow:0 -8px 24px rgba(0,0,0,.45)}
body:not(.bnr) #r8nav{padding-bottom:env(safe-area-inset-bottom,0px);height:calc(var(--navH) + env(safe-area-inset-bottom,0px))}
body.onMap #r8nav{display:flex}
#r8nav button{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;background:none;border:0;color:#b9a6ee;font:600 11px 'Baloo 2',Poppins,sans-serif;letter-spacing:.2px;position:relative;padding:6px 0 4px}
#r8nav .ni{position:relative;width:44px;height:30px;border-radius:15px;display:flex;align-items:center;justify-content:center;transition:background .2s}
#r8nav svg{width:22px;height:22px;fill:currentColor}
#r8nav button.act{color:#fff}#r8nav button.act .ni{background:linear-gradient(180deg,#9a6df5,#743ae8);box-shadow:0 4px 14px rgba(116,58,232,.6)}
#r8nav button[data-nv=play].act .ni{background:linear-gradient(180deg,#5fd0ff,#2f7bff)}
#r8nav .nb{display:none;position:absolute;top:-5px;right:-2px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#ff3d71;color:#fff;font:800 10px/18px Poppins;font-style:normal;border:2px solid #150a40}
#r8nav .nb.on{display:block}#r8nav .nb.new{background:#2f7bff}#r8nav .nb.lk{background:#3a2a77;font-size:9px}
.r8Hero{margin:14px 12px 10px;padding:14px 14px 16px;border-radius:24px;background:radial-gradient(ellipse at 50% -20%,rgba(154,109,245,.55),transparent 70%),linear-gradient(180deg,#2c1678,#170a45);border:1px solid rgba(154,109,245,.55);box-shadow:0 14px 34px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.12)}
.r8Hero.dil{border-color:#ff7ab0}
.r8HTop{display:flex;justify-content:space-between;align-items:center;font:600 12px 'Baloo 2',Poppins;color:#d9ccff;margin-bottom:10px}.r8HTop small{opacity:.7}.r8W{letter-spacing:1px;font-size:10px;opacity:.8;text-transform:uppercase;max-width:58%;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.r8Who{display:flex;gap:12px;align-items:center;width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:10px;color:#fff;text-align:left}
.r8Pic{position:relative;width:84px;height:84px;flex:none;border-radius:50%;overflow:hidden;background:radial-gradient(circle,#9a6df5,#3d1d9e);border:3px solid #fff;box-shadow:0 6px 18px rgba(0,0,0,.4)}
.r8Pic img{width:100%;height:100%;object-fit:cover}.r8Pic .em{font-size:46px;line-height:78px;display:block;text-align:center}
.r8St{position:absolute;right:0;bottom:0;font-style:normal;font-size:20px}
.r8Info{flex:1;display:flex;flex-direction:column;gap:5px;min-width:0}
.r8N{font:400 22px 'Lilita One',Poppins;letter-spacing:.3px}.r8N em{font:800 10px Poppins;font-style:normal;background:#ff3d71;padding:2px 6px;border-radius:6px;vertical-align:middle}.r8N i{font:600 11px Poppins;font-style:normal;opacity:.7;float:right;margin-top:6px}
.r8M{display:flex;align-items:center;gap:6px;font:600 11px 'Baloo 2',Poppins}.r8M small{width:66px;opacity:.85}.r8M .r7bar{flex:1}.r8M b{width:38px;text-align:right}
.r8M.bim.hi b{color:#ff6b8b}
.r8Pd{font:700 11px 'Baloo 2',Poppins;color:#ffd77a}
.r8Play{display:block;width:100%;margin-top:14px;padding:16px 10px 12px;border:0;border-radius:20px;color:#fff;background:linear-gradient(180deg,#5fd0ff 0%,#2f7bff 55%,#1f55d6 100%);box-shadow:0 7px 0 #163b9a,0 14px 28px rgba(47,123,255,.5),inset 0 2px 0 rgba(255,255,255,.45);animation:r8pl 1.8s ease-in-out infinite}
.r8Play span{display:block;font:400 30px/1 'Lilita One',Poppins;letter-spacing:.8px;text-shadow:0 3px 0 rgba(10,30,110,.55)}.r8Play small{display:block;margin-top:5px;font:700 12px 'Baloo 2',Poppins;opacity:.9;letter-spacing:.4px}
.r8Play:active{transform:translateY(5px);box-shadow:0 2px 0 #163b9a,0 6px 14px rgba(47,123,255,.5)}
@keyframes r8pl{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}
.hub .r8Quick{display:flex!important;grid-template-columns:none!important;overflow-x:auto;gap:8px;padding:2px 2px 6px;scrollbar-width:none}.hub .r8Quick::-webkit-scrollbar{display:none}
.hub .r8Quick button{flex:0 0 68px}
.r8Lv{display:flex;align-items:baseline;gap:8px;margin:18px 16px 6px;font:400 18px 'Lilita One',Poppins;color:#fff;letter-spacing:.5px}.r8Lv small{font:600 11px 'Baloo 2',Poppins;color:#b9a6ee}
.r8Page{padding:16px 16px 4px;text-align:left}.r8PT{font:400 24px 'Lilita One',Poppins;color:#fff;margin-top:2px}
.r8Link{margin-top:10px;background:rgba(154,109,245,.18);border:1px solid rgba(154,109,245,.5);color:#fff;border-radius:14px;padding:9px 14px;font:700 13px 'Baloo 2',Poppins}
body.r8Rishte .rsStrip .rsHead{display:none}body.r8Rishte .rsRow{display:grid!important;grid-template-columns:repeat(4,1fr);gap:8px;overflow:visible!important}body.r8Rishte .rsRow>*{width:auto!important;min-width:0!important}body.r8Rishte .rsStrip{margin-top:6px}
.r8Gear{width:38px;padding:0!important;display:flex;align-items:center;justify-content:center}
.adB{display:inline-flex!important;align-items:center;gap:2px;vertical-align:middle;padding:2px 6px 2px 4px!important;margin:0 2px;border-radius:7px;background:linear-gradient(180deg,#5fd0ff,#2f7bff)!important;color:#fff!important;font:800 10px/1.2 'Baloo 2',sans-serif!important;width:auto!important;height:auto!important;letter-spacing:.5px;box-shadow:0 2px 0 rgba(10,30,110,.5),inset 0 1px 0 rgba(255,255,255,.4)}
.adB svg{width:11px!important;height:11px!important}.bst2 .adB{font-size:13px!important;padding:4px 8px 4px 6px!important;margin:4px auto 2px}
.r8Hint{position:fixed;inset:0;z-index:95;pointer-events:none}
.r8Ring{position:fixed;border-radius:22px;border:3px solid #fff;box-shadow:0 0 0 9999px rgba(5,2,20,.55),0 0 22px #9a6df5;animation:r8ring 1.2s ease-in-out infinite}
@keyframes r8ring{50%{box-shadow:0 0 0 9999px rgba(5,2,20,.55),0 0 34px #5fd0ff}}
.r8Fing{position:fixed;font-size:44px;filter:drop-shadow(0 4px 6px rgba(0,0,0,.5));animation:r8f .9s ease-in-out infinite}.r8Fing.up{animation-name:r8fu}
@keyframes r8f{50%{transform:translateY(-10px)}}@keyframes r8fu{50%{transform:translateY(10px)}}
.r8Tip{position:fixed;left:24px;right:24px;text-align:center;background:#fff;color:#1c0a4f;border-radius:16px;padding:10px 14px;font:700 14px/1.3 'Baloo 2',Poppins;box-shadow:0 10px 30px rgba(0,0,0,.4)}
.r8Ov{position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;padding:12px 16px;overflow-y:auto;background:rgba(6,2,22,.0);transition:background .25s}
.r8Ov.on{background:rgba(6,2,22,.78)}
.r8Frc{width:100%;max-width:380px;text-align:center;color:#fff;padding:18px 16px 12px;border-radius:26px;background:radial-gradient(ellipse at 50% 0,rgba(255,122,176,.35),transparent 60%),linear-gradient(180deg,#2c1678,#140838);border:1px solid rgba(255,122,176,.6);box-shadow:0 20px 50px rgba(0,0,0,.6);transform:scale(.85);opacity:0;transition:.25s cubic-bezier(.2,.9,.3,1.3)}
.r8Ov.on .r8Frc{transform:none;opacity:1}
.r8FKick{font:800 11px Poppins;letter-spacing:2.5px;color:#ff9cc4}
.r8FPic{position:relative;width:118px;height:118px;margin:8px auto 4px;border-radius:24px;background:radial-gradient(circle,#4a2aa8,#1c0a4f);border:2px solid rgba(255,255,255,.2)}
.r8FPic>img{width:100%;height:100%;object-fit:contain;padding:10px}
.r8FFace{position:absolute;left:-14px;bottom:-12px;width:62px;height:62px;border-radius:50%;overflow:hidden;border:3px solid #fff;background:#743ae8;font-size:34px;line-height:56px}.r8FFace img{width:100%;height:100%;object-fit:cover}
.r8FT{font:400 24px 'Lilita One',Poppins;margin-top:6px}.r8FT b{color:#ffd77a;font-weight:400}
.r8FL{font:600 13px 'Baloo 2',Poppins;opacity:.85;margin:2px 0 8px}
.r8FWarn{font:700 11px 'Baloo 2',Poppins;color:#ff9cc4;margin-bottom:10px}
.r8FBtn{display:flex;width:100%;align-items:center;justify-content:space-between;gap:8px;margin:7px 0 0;padding:11px 14px;border-radius:16px;border:0;color:#fff;font:400 17px 'Lilita One',Poppins;letter-spacing:.4px}
.r8FBtn em{font-style:normal;display:flex;align-items:center;gap:4px;font:800 15px Poppins}.r8FBtn em img{width:18px;height:18px}
.r8FBtn.pay{background:linear-gradient(180deg,#9a6df5,#743ae8);box-shadow:0 5px 0 #4a1fb0}.r8FBtn.pay.no{filter:saturate(.4) brightness(.8)}
.r8FBtn.ad{background:linear-gradient(180deg,#5fd0ff,#2f7bff);box-shadow:0 5px 0 #163b9a;font-size:15px}
.r8FBtn.no2{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.18);font-size:15px}.r8FBtn em.neg{font:700 11px 'Baloo 2',Poppins;color:#ff9cc4}
.r8FX{margin-top:10px;background:none;border:0;color:#b9a6ee;font:600 13px 'Baloo 2',Poppins;padding:6px 16px}
.r8Set{display:flex;flex-direction:column;gap:8px;margin-top:12px}
.r8Set button{display:flex;justify-content:space-between;align-items:center;padding:13px 14px;border-radius:14px;border:1px solid rgba(154,109,245,.4);background:rgba(255,255,255,.05);color:#fff;font:700 15px 'Baloo 2',Poppins;text-align:left}
.r8Set small{display:block;font:500 11px 'Baloo 2';opacity:.7}
.r8Set i{width:44px;height:26px;border-radius:13px;background:#3a2a77;position:relative;flex:none;transition:.2s}.r8Set i:after{content:'';position:absolute;left:3px;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:.2s}
.r8Set .on i{background:#2f7bff}.r8Set .on i:after{left:21px}
.r8SetF{margin-top:14px;font:500 12px 'Baloo 2';opacity:.7}.r8SetF a{color:#9ad8ff}
`);
try { META.x = function () { }; SAVE.xray = false; } catch (e) { }

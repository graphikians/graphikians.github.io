/* ================= MACHHAR MAARO · ROUND 9 · UI =================
   Pro splash, dopamine welcome screen, engaging revive, popup manager,
   friendly notification ask (our popup first, system dialog only on YES).
================================================================== */

/* ---------- 1. splash ---------- */
R7.splash = function (done) {
  const el = document.createElement('div'); el.id = 'r7splash'; el.className = 'r9Sp';
  const word = (w, d) => w.split('').map((c, i) => `<span style="--d:${d + i * 0.06}s">${c}</span>`).join('');
  el.innerHTML = `<div class="spBg"></div><div class="spRays"></div>
    <div class="spShock"></div><div class="spShock s2"></div>
    <div class="spIcon2">${R7.img('appicon')}<i class="spArc a1"></i><i class="spArc a2"></i></div>
    <div class="spLogo"><div class="l1">${word('MACHHAR', 0.75)}</div><div class="l2">${word('MAARO', 1.15)}<b><svg class="bolt" viewBox="0 0 40 100"><path d="M24 0 4 56h14L10 100l28-62H22L32 0z"/></svg></b></div></div>
    <div class="spLoad"><i></i></div><div class="spTip">Charging the racket…</div>
    <div class="spBy">A SANX GRAPHIKIANS GAME</div>
    ${Array.from({ length: 14 }, (_, i) => `<i class="spSpark" style="--a:${i * 26}deg;--l:${90 + (i % 4) * 30}px;--t:${0.55 + (i % 3) * 0.05}s"></i>`).join('')}`;
  document.body.appendChild(el);
  try { setTimeout(() => { initAudio(); tone(80, 40, 0.5, 0.5, 'sawtooth'); noise(0.3, 0.3, 'lowpass', 1500, 0.002); }, 500); } catch (e) { }
  const tips = ['Charging the racket…', 'Waking up the mosquitoes…', 'Tucking Papa into bed…'];
  let k = 0; const ti = setInterval(() => { k++; const t = el.querySelector('.spTip'); if (t) t.textContent = tips[k % tips.length]; }, 900);
  const go = () => { if (el.dataset.out) return; el.dataset.out = 1; clearInterval(ti); el.classList.add('out'); setTimeout(() => { el.remove(); done && done(); }, 450); };
  setTimeout(go, 3000); el.addEventListener('pointerdown', () => setTimeout(go, 150));
};

/* ---------- 2. welcome screen ---------- */
R9.W = (function () {
  const m = $('menu'); [...m.children].forEach(c => { if (c.id !== 'playBtn') c.style.display = 'none'; }); $('playBtn').style.display = 'none';
  const w = document.createElement('div'); w.className = 'r9W'; m.appendChild(w); m.classList.add('r9Menu');
  return w;
})();
R9.giftReady = () => SAVE.claimedDay !== dayNum();
R9.welcome = function () {
  const ev = R9.evDef('season'), es = R9.evSt(ev), lv = Math.min(300, SAVE.unlocked || 1), s = SHARE.stats(), gr = R9.giftReady();
  const tm = new Date(); tm.setHours(24, 0, 0, 0); const left = R7.fmtLeft(tm - Date.now());
  R9.W.innerHTML = `<div class="wBg" style="background-image:url(${R7.A('room')})"></div><div class="wShade"></div>
    ${Array.from({ length: 10 }, (_, i) => `<img class="wCoin" src="${R7.A('coin')}" style="--x:${(i * 37) % 100}%;--d:${(i * 0.7) % 6}s;--s:${0.6 + (i % 3) * 0.25}">`).join('')}
    <div class="wTop"><span class="wMe">${s.av} <b>${s.name}</b></span><span class="wPill"><span class="coin"></span>${fmt(SAVE.coins || 0)}</span><span class="wPill">${R7.img('gem')}${SAVE.gems || 0}</span></div>
    <div class="wLogo"><div class="l1">MACHHAR</div><div class="l2">MAARO<b><svg class="bolt" viewBox="0 0 40 100"><path d="M24 0 4 56h14L10 100l28-62H22L32 0z"/></svg></b></div></div>
    <div class="wKal"><img src="${R7.A('kallu_hasta')}" alt=""><span class="wBub">${WELCOME.bubs[(Date.now() / 4000 | 0) % WELCOME.bubs.length]}</span></div>
    <div class="wRow">
      <button class="wCard gift ${gr ? 'ready' : ''}" id="wGift"><img src="${R7.A('x_gold')}"><b>${gr ? 'FREE GIFT!' : 'Next gift'}</b><small>${gr ? 'Tap to open' : left}</small>${gr ? '<i class="wDot">1</i>' : ''}</button>
      <button class="wCard ev" id="wEv"><span class="wEi">${ev.i}</span><b>${ev.n}</b><small>${es.done}/${ev.N} · ⏳ ${R7.fmtLeft(Math.max(0, ev.ends - Date.now()))}</small><span class="r7bar"><i style="width:${es.done / ev.N * 100}%"></i></span></button>
      <button class="wCard st" id="wSt"><span class="wEi">🔥</span><b>${SAVE.streak || 1} day${(SAVE.streak || 1) > 1 ? 's' : ''}</b><small>streak</small></button>
    </div>
    <div class="wRow2"><button id="wMis">🎯 Missions <b>${(SAVE.missions && SAVE.missions.list ? SAVE.missions.list.filter(m => m.cur >= m.n && !m.claimed).length : 0) || ''}</b></button><button id="wSpin">🎡 ${SAVE.spinDay !== dayNum() ? 'Free spin' : 'Lucky spin'}${SAVE.spinDay !== dayNum() ? ' <b>1</b>' : ''}</button><button id="wHrt">❤️ ${RISHTE.hearts()}/5</button></div>
    <button class="wPlay" id="wPlay"><span class="wRip"></span><span class="wRip r2"></span><b>PLAY</b><small>LEVEL ${lv}</small><i class="wShine"></i></button>
    <div class="wFoot"><button id="wRec">🦟 ${fmt(s.tk)} swatted</button><button id="wShop">🛒 Shop</button></div>`;
  const play = () => { sfx.power && sfx.power(); R9.burst($('wPlay')); setTimeout(() => $('playBtn').click(), 260); };
  $('wPlay').onclick = play;
  $('wGift').onclick = () => { initAudio(); if (R9.giftReady()) { R9.burst($('wGift')); META.daily(); const ok = $('metaOk'); if (ok) { const o = ok.onclick; ok.onclick = () => { o && o(); if (state === 'menu') { $('map').classList.add('hide'); R9.welcome(); } }; } } else toast(`Next free gift in ${left}`); };
  $('wEv').onclick = () => { initAudio(); $('playBtn').click(); setTimeout(() => R9.eventsHub(), 500); };
  const goMap = f => { initAudio(); $('playBtn').click(); setTimeout(f, 500); };
  $('wMis').onclick = () => goMap(() => META.showMissions()); $('wSpin').onclick = () => goMap(() => META.showSpin()); $('wHrt').onclick = () => toast(RISHTE.hearts() >= 5 ? '❤️ Hearts full. Go play!' : `Next ❤️ in ${RISHTE.heartTime()}`);
  $('wSt').onclick = () => toast(`🔥 Come back every day. Day 7 gives a Streak Shield!`);
  $('wRec').onclick = () => { sfx.coin && sfx.coin(); SHARE.open(); };
  $('wShop').onclick = () => $('mShop').click();
};
R9.burst = function (el) {
  if (!el) return; const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  for (let i = 0; i < 14; i++) { const c = document.createElement('img'); c.src = R7.A('coin'); c.className = 'r9Burst'; const a = Math.random() * 6.28, d = 60 + Math.random() * 90; c.style.cssText = `left:${cx}px;top:${cy}px;--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d}px`; document.body.appendChild(c); setTimeout(() => c.remove(), 800); }
  try { tone(900, 1500, 0.15, 0.08, 'triangle'); } catch (e) { }
};
(function () {
  let was = false;
  setInterval(() => { const on = state === 'menu' && !$('menu').classList.contains('hide'); if (on && !was) R9.welcome(); was = on; }, 300);
  const _f = WELCOME.fill; WELCOME.fill = function () { _f.apply(this, arguments); if (state === 'menu') R9.welcome(); };
  if (state === 'menu') R9.welcome();
})();

/* ---------- 3. revive that makes you tap ---------- */
(function () {
  let iv = null, last = -1;
  setInterval(() => {
    const ov = $('over'), rv = $('oRevive'); if (!rv) return;
    const on = state === 'over' && !ov.classList.contains('hide') && !rv.classList.contains('gone') && rv.style.display !== 'none';
    rv.classList.toggle('r9Rv', true);
    if (!on) { last = -1; rv.classList.remove('r9Hurry'); return; }
    const n = +($('oRevN').textContent || 0);
    if (n !== last) { last = n; try { tone(n <= 2 ? 1400 : 1000, n <= 2 ? 1400 : 1000, 0.06, 0.06, 'square'); vib(n <= 2 ? 25 : 10); } catch (e) { } rv.classList.toggle('r9Hurry', n <= 2); rv.classList.remove('r9Tk'); void rv.offsetWidth; rv.classList.add('r9Tk'); }
    const t = rv.querySelector('.rvT b'); if (t && !rv.dataset.free) t.textContent = R9.pend ? 'SKIP HOSPITAL' : CL && CL.r9 === 'hosp' ? 'SAVE THEM' : 'REVIVE';
  }, 150);
})();

/* ---------- 4. popup manager: one popup per map visit, never during play ---------- */
R9.PM = {
  cd: k => +(R8.ls('mmPM_' + k) || 0), mark: (k, h) => R8.ls('mmPM_' + k, String(Date.now() + h * 36e5)),
  can: k => Date.now() > R9.PM.cd(k),
  list() {
    const L = [], p = R9.patient();
    if (p) L.push({ k: 'hosp', h: 1, img: R7.face(p), t: `${CHARS[p].n} is in hospital`, s: `${R9.STAGE[R9.rec(p).stage].n} · finish the rounds to bring them home`, b: '🩺 GO TO HOSPITAL', go: () => R9.hospScreen(p) });
    const se = R9.evDef('season'), ss = R9.evSt(se);
    if (R9.evUnlocked(se) && ss.done < se.N) L.push({ k: 'ev_' + se.key, h: 10, e: se.i, t: se.n, s: `${se.N} levels · ⏳ ends in ${R7.fmtLeft(Math.max(0, se.ends - Date.now()))} · chest on Level 10`, b: '🎉 PLAY EVENT', go: () => R9.evPanel('season') });
    const love = R9.LOVE.map(l => R9.evDef(l.id)).filter(d => R9.evUnlocked(d) && R9.evSt(d).done < d.N);
    if (love.length) { const d = love[(R7.today()) % love.length]; L.push({ k: 'love_' + d.id, h: 8, img: R7.face(d.char), t: `${d.i} ${d.n}`, s: d.d, b: '💞 PLAY 5 LEVELS', go: () => R9.evPanel(d.id) }); }
    const ad = R9.sv().r9.giftAd || {}; if ((ad.d !== R7.today() || ad.n < 3) && (SAVE.unlocked || 1) >= 3) L.push({ k: 'adgift', h: 3, img: 'x_starter', t: 'Free booster gift', s: 'Watch a short ad and get 2 random boosters', b: '📺 GET 2 BOOSTERS', ad: 1, go: () => showAd(() => { const sv = R9.sv(), g = sv.r9.giftAd = sv.r9.giftAd && sv.r9.giftAd.d === R7.today() ? sv.r9.giftAd : { d: R7.today(), n: 0 }; g.n++; const got = []; for (let i = 0; i < 2; i++) { const b = BOOSTERS[(Math.random() * BOOSTERS.length) | 0]; SAVE.boost[b.id] = (SAVE.boost[b.id] || 0) + 1; got.push(b.name); } save(); REWARD.show({ img: 'x_starter', kick: 'FREE GIFT', t: '🎒 +2 BOOSTERS', sub: got.join(' + ') }); }) });
    if ((SAVE.coins || 0) >= 600) L.push({ k: 'shop', h: 12, img: 'x_silver', t: 'Today\'s shop deal', s: 'Chests, rackets and items. One deal is 30% off today', b: '🛒 OPEN SHOP', go: () => openShop('deals') });
    const pd = R7.pend(); if (pd.length) L.push({ k: 'req', h: 6, img: R7.face(pd[0].id), t: `${CHARS[pd[0].id].n} wants something`, s: `${R7.dInfo(pd[0].k).n} · unhappy family members wake up faster`, b: '📜 SEE REQUEST', go: () => R7.diary(pd[0].id) });
    return L;
  },
  shown: false,
  try() {
    if (this.shown || R8.blocked() || document.querySelector('.r9Pop,.r8Hint')) return;
    const it = this.list().find(x => this.can(x.k)); if (!it) return;
    this.shown = true; this.mark(it.k, it.h); this.show(it);
  },
  show(it) {
    const el = document.createElement('div'); el.className = 'r9Pop';
    el.innerHTML = `<div class="pCard"><button class="pX">✕</button><div class="pPic">${it.img ? `<img src="${R7.A(it.img)}">` : `<span>${it.e}</span>`}</div><div class="pT">${it.t}</div><div class="pS">${it.s}</div><button class="pGo ${it.ad ? 'ad' : ''}">${it.b}</button><button class="pLater">Later</button></div>`;
    document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on')); try { sfx.whoosh && sfx.whoosh(); } catch (e) { }
    const close = () => { el.classList.remove('on'); setTimeout(() => el.remove(), 250); };
    el.querySelector('.pX').onclick = close; el.querySelector('.pLater').onclick = close;
    el.querySelector('.pGo').onclick = () => { close(); it.go(); };
  }
};
(function () {
  const _sm = window.showMap; window.showMap = function () { R9.PM.shown = false; const r = _sm.apply(this, arguments); clearTimeout(R9._pmT); R9._pmT = setTimeout(function t() { if (state !== 'map') return; if (R8.blocked() || document.querySelector('.r8Hint')) { R9._pmT = setTimeout(t, 1500); return; } R9.PM.try(); }, 2600); return r; };
})();

/* ---------- 5. notifications: our popup first, after Level 3 ---------- */
R9.askNotif = async function () {
  if (!window.R9N) return; const st = await R9N.check(); if (st === 'granted') return;
  const sv = R9.sv(); if (sv.r9.nAsk && Date.now() - sv.r9.nAsk < 3 * DAY) return; sv.r9.nAsk = Date.now(); save();
  META.modal(`<div class="drm"><div class="drmPic small"><img src="${R7.A('x_gold')}"></div><div class="kick">STAY IN THE GAME</div><div class="big" style="font-size:26px">GET GIFT ALERTS 🔔</div>
    <div class="drmHow"><div>🎁 Your daily free gift is ready</div><div>🏥 Someone in the family needs you</div><div>🎉 A new event just started</div></div><div class="sub" style="font-size:12px">Only a few useful alerts. No spam.</div></div>`, '🔔 YES, ALERT ME', () => { R9N.ask(); });
  const b = document.createElement('button'); b.className = 'btn2'; b.style.cssText = 'width:100%;margin-top:8px'; b.textContent = 'Not now'; b.onclick = () => $('meta').classList.add('hide'); $('metaBody').appendChild(b);
};
(function () { const _sw = window.showWin; window.showWin = function () { const r = _sw.apply(this, arguments); if (CL && CL.n >= 3 && CL.n <= 300 && !CL.ev) setTimeout(() => { if (state === 'map') R9.askNotif(); else R9._askLater = 1; }, 400); return r; }; const _sm = window.showMap; window.showMap = function () { const r = _sm.apply(this, arguments); if (R9._askLater) { R9._askLater = 0; setTimeout(R9.askNotif, 1200); } return r; }; })();

R7.css(`
/* splash */
.r9Sp{position:fixed;inset:0;z-index:9999;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity .45s}
#r7splash.r9Sp{flex-direction:column;z-index:9999}.r9Sp .spIcon2,.r9Sp .spLogo,.r9Sp .spLoad,.r9Sp .spTip{position:relative;z-index:2}.r9Sp.out{opacity:0}
.r9Sp .spBg{position:absolute;inset:0;background:radial-gradient(circle at 50% 42%,#5b2ad0 0%,#2a0f7a 38%,#0a0424 75%)}
.r9Sp .spRays{position:absolute;left:50%;top:40%;width:900px;height:900px;margin:-450px;background:repeating-conic-gradient(rgba(154,109,245,.16) 0 8deg,transparent 8deg 22deg);animation:spSpin 14s linear infinite;opacity:0;animation:spSpin 14s linear infinite,spFade .6s .5s forwards}
@keyframes spSpin{to{transform:rotate(360deg)}}@keyframes spFade{to{opacity:1}}
.r9Sp .spShock{position:absolute;left:50%;top:40%;width:60px;height:60px;margin:-30px;border-radius:50%;border:4px solid #7fd4ff;opacity:0;animation:spShock .9s .55s ease-out forwards}.r9Sp .spShock.s2{animation-delay:.75s;border-color:#fff}
@keyframes spShock{0%{opacity:1;transform:scale(.2)}100%{opacity:0;transform:scale(9)}}
.spIcon2{position:relative;width:132px;height:132px;transform:translateY(-120vh);animation:spDrop .55s .1s cubic-bezier(.3,1.5,.5,1) forwards}
.spIcon2 img{width:100%;height:100%;border-radius:30px;box-shadow:0 0 0 4px rgba(255,255,255,.9),0 0 50px #7fd4ff,0 20px 40px rgba(0,0,0,.6)}
@keyframes spDrop{to{transform:none}}
.spArc{position:absolute;inset:-14px;border-radius:40px;border:3px solid transparent;border-top-color:#7fd4ff;border-right-color:#fff;animation:spSpin 1s linear infinite;opacity:.9}.spArc.a2{inset:-24px;animation-duration:1.6s;animation-direction:reverse;border-top-color:#9a6df5}
.spLogo{margin-top:26px;text-align:center;font-family:Inter,sans-serif;line-height:.95}
.spLogo span{display:inline-block;opacity:0;transform:translateY(40px) scale(1.8);animation:spLet .35s var(--d) cubic-bezier(.3,1.6,.5,1) forwards}
.spLogo .l1{font-weight:900;font-size:46px;color:#fff;letter-spacing:1px;text-shadow:0 4px 0 #3b14a8}
.spLogo .l2{font-weight:900;font-size:64px;filter:drop-shadow(0 5px 0 #3b14a8) drop-shadow(0 0 20px rgba(154,109,245,.8))}.spLogo .l2 span{background:linear-gradient(180deg,#fff,#c9b4ff);-webkit-background-clip:text;background-clip:text;color:transparent}
.spLogo .l2 b{display:inline-block;opacity:0;animation:spLet .3s 1.55s forwards,spZap .3s 1.85s 3}
@keyframes spLet{to{opacity:1;transform:none}}@keyframes spZap{50%{transform:scale(1.4) rotate(12deg)}}
.spLoad{width:200px;height:8px;border-radius:4px;background:rgba(255,255,255,.12);margin-top:30px;overflow:hidden}.spLoad i{display:block;height:100%;width:0;border-radius:4px;background:linear-gradient(90deg,#9a6df5,#7fd4ff);box-shadow:0 0 12px #7fd4ff;animation:spBar 2.6s .3s ease-in-out forwards}@keyframes spBar{to{width:100%}}
.spTip{margin-top:10px;font:600 13px Inter,sans-serif;color:#cbb8ff}
.spBy{position:absolute;bottom:calc(30px + env(safe-area-inset-bottom,0px));font:700 11px Inter,sans-serif;letter-spacing:4px;color:rgba(255,255,255,.7)}
.spSpark{position:absolute;left:50%;top:40%;width:6px;height:6px;margin:-3px;border-radius:50%;background:#fff;box-shadow:0 0 10px #7fd4ff;opacity:0;animation:spSp .7s var(--t) ease-out forwards}
@keyframes spSp{0%{opacity:1;transform:rotate(var(--a)) translateX(0)}100%{opacity:0;transform:rotate(var(--a)) translateX(var(--l))}}
/* welcome */
#menu.r9Menu{padding:0!important;justify-content:flex-start}
.r9W{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;overflow:hidden;font-family:Inter,sans-serif;color:#fff;padding:calc(12px + env(safe-area-inset-top,0px)) 16px 0}
body.bnr .r9W{padding-bottom:var(--bnrB)}
.r9W .wBg{position:absolute;inset:0;background-size:cover;background-position:center;filter:blur(2px) brightness(.55);transform:scale(1.05)}
.r9W .wShade{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 30%,rgba(116,58,232,.55),rgba(10,4,36,.92) 75%)}
.r9W>*:not(.wBg):not(.wShade):not(.wCoin){position:relative;z-index:1}
.wCoin{position:absolute;bottom:-40px;left:var(--x);width:calc(26px * var(--s));opacity:.75;animation:wUp 7s var(--d) linear infinite;z-index:0}
@keyframes wUp{0%{transform:translateY(0) rotate(0)}100%{transform:translateY(-110vh) rotate(540deg)}}
.wTop{display:flex;gap:6px;width:100%;align-items:center}.wMe{flex:1;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wMe b{font-weight:800}
.wPill{display:flex;align-items:center;gap:4px;padding:6px 10px;border-radius:14px;background:rgba(10,4,36,.6);border:1px solid rgba(154,109,245,.5);font-weight:800;font-size:13px}.wPill img{width:16px;height:16px}
.wLogo{position:relative;margin-top:4vh;text-align:center;line-height:.92;padding:4px 10px}
.wLogo .l1{font-weight:900;font-size:42px;letter-spacing:1px;text-shadow:0 4px 0 #3b14a8}
.wLogo .l2{white-space:nowrap;font-weight:900;font-size:66px;background:linear-gradient(180deg,#fff,#c9b4ff);-webkit-background-clip:text;color:transparent;filter:drop-shadow(0 5px 0 #3b14a8) drop-shadow(0 0 24px rgba(154,109,245,.9))}
.wLogo .l2 b{display:inline-block;animation:spZap 1.2s infinite}.bolt{width:.42em;height:.9em;fill:#7fd4ff;filter:drop-shadow(0 0 8px #7fd4ff);vertical-align:-.05em;margin-left:4px}
.wShine{position:absolute;top:0;bottom:0;left:-60%;width:40%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent);transform:skewX(-20deg);animation:wSh 3s infinite;pointer-events:none}
@keyframes wSh{0%,60%{left:-60%}100%{left:130%}}
.wKal{position:relative;height:25vh;min-height:130px;margin-top:-6px;animation:wFloat 2.4s ease-in-out infinite}.wKal img{height:100%;filter:drop-shadow(0 12px 20px rgba(0,0,0,.6))}
.wBub{position:absolute;right:-70px;top:4px;background:#fff;color:#2a1270;font:800 12px Inter;padding:7px 10px;border-radius:14px 14px 14px 2px;white-space:nowrap;box-shadow:0 6px 16px rgba(0,0,0,.35)}
@keyframes wFloat{50%{transform:translateY(-10px) rotate(-2deg)}}
.wRow{display:grid;grid-template-columns:1fr 1.35fr .8fr;gap:8px;width:100%;margin-top:2vh}
.wCard{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 6px;border-radius:18px;border:1.5px solid rgba(154,109,245,.55);background:rgba(20,8,60,.72);color:#fff;font-family:Inter}
.wCard img{width:46px;height:46px;object-fit:contain}.wCard b{font-weight:800;font-size:13px}.wCard small{font-size:10px;opacity:.85;font-weight:600}.wCard .r7bar{width:90%;height:5px;margin-top:3px}
.wEi{font-size:30px;line-height:46px}
.wCard.gift.ready{border-color:#fff;box-shadow:0 0 22px rgba(154,109,245,.9);animation:wGl 1.4s infinite}.wCard.gift.ready img{animation:wShake 1.6s infinite}
@keyframes wGl{50%{box-shadow:0 0 36px rgba(127,212,255,.9)}}@keyframes wShake{0%,70%,100%{transform:none}75%{transform:rotate(-10deg) scale(1.08)}85%{transform:rotate(10deg) scale(1.08)}}
.wCard.ev{border-color:#7fd4ff}.wDot{position:absolute;top:-6px;right:-4px;min-width:20px;height:20px;border-radius:10px;background:#ff3d71;font:900 11px/20px Inter;font-style:normal;border:2px solid #150a40}
.wRow2{display:flex;gap:8px;margin-top:10px}.wRow2 button{padding:8px 12px;border-radius:14px;border:1px solid rgba(154,109,245,.5);background:rgba(20,8,60,.72);color:#fff;font:700 12px Inter}.wRow2 b{display:inline-block;min-width:16px;padding:0 4px;border-radius:8px;background:#ff3d71;font-size:10px;margin-left:2px}.wRow2 b:empty{display:none}
.wPlay{position:relative;margin-top:auto;margin-bottom:12px;width:min(320px,86%);padding:16px 0 12px;border:0;border-radius:26px;color:#fff;overflow:hidden;background:linear-gradient(180deg,#5fd0ff,#2f7bff 55%,#1f55d6);box-shadow:0 8px 0 #163b9a,0 18px 40px rgba(47,123,255,.6),inset 0 2px 0 rgba(255,255,255,.5);animation:r8pl 1.6s ease-in-out infinite}
.wPlay b{display:block;font:900 40px/1 Inter;letter-spacing:3px;text-shadow:0 3px 0 rgba(10,30,110,.6)}.wPlay small{display:block;font:800 13px Inter;letter-spacing:2px;margin-top:4px;opacity:.95}
.wPlay:active{transform:translateY(6px);box-shadow:0 2px 0 #163b9a}
.wRip{position:absolute;left:50%;top:50%;width:20px;height:20px;margin:-10px;border-radius:50%;border:2px solid rgba(255,255,255,.7);animation:wRp 2s infinite}.wRip.r2{animation-delay:1s}
@keyframes wRp{0%{transform:scale(1);opacity:.8}100%{transform:scale(18);opacity:0}}
.wFoot{display:flex;gap:10px;margin-bottom:calc(14px + env(safe-area-inset-bottom,0px))}.wFoot button{padding:8px 14px;border-radius:14px;border:1px solid rgba(255,255,255,.25);background:rgba(10,4,36,.55);color:#fff;font:700 12px Inter}
.r9Burst{position:fixed;width:24px;height:24px;margin:-12px;z-index:9000;pointer-events:none;animation:r9Bu .75s ease-out forwards}
@keyframes r9Bu{to{transform:translate(var(--x),var(--y)) scale(.4);opacity:0}}
/* revive */
#oRevive.r9Rv{position:relative;transform-origin:center;animation:r9RvP 1s ease-in-out infinite;box-shadow:0 0 0 3px #fff,0 0 30px rgba(127,212,255,.9),0 10px 24px rgba(0,0,0,.4)!important}
#oRevive.r9Rv:before{content:'💗';position:absolute;left:-14px;top:-16px;font-size:30px;animation:r9beat2 .8s infinite;filter:drop-shadow(0 3px 6px rgba(0,0,0,.4))}
#oRevive.r9Tk{animation:r9RvP 1s ease-in-out infinite,r9Tick .25s}
#oRevive.r9Hurry{animation:r9RvP .5s ease-in-out infinite,r9Sh .4s infinite;box-shadow:0 0 0 3px #ff4f8b,0 0 34px rgba(255,79,139,.9)!important}
@keyframes r9RvP{50%{transform:scale(1.05)}}@keyframes r9Tick{50%{transform:scale(1.12)}}@keyframes r9Sh{25%{translate:-3px 0}75%{translate:3px 0}}
/* popup */
.r9Pop{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(6,2,22,0);transition:background .25s;font-family:Inter,sans-serif}
.r9Pop.on{background:rgba(6,2,22,.72)}
.r9Pop .pCard{position:relative;width:100%;max-width:340px;text-align:center;color:#fff;padding:20px 18px 12px;border-radius:26px;background:radial-gradient(ellipse at 50% 0,rgba(154,109,245,.55),transparent 60%),linear-gradient(180deg,#2c1678,#140838);border:1.5px solid rgba(154,109,245,.7);box-shadow:0 20px 50px rgba(0,0,0,.6);transform:scale(.8) translateY(20px);opacity:0;transition:.3s cubic-bezier(.2,.9,.3,1.3)}
.r9Pop.on .pCard{transform:none;opacity:1}
.pX{position:absolute;right:10px;top:10px;width:30px;height:30px;border-radius:50%;border:0;background:rgba(255,255,255,.12);color:#fff;font-size:14px}
.pPic{width:110px;height:110px;margin:0 auto 8px;border-radius:50%;overflow:hidden;background:radial-gradient(circle,#9a6df5,#3d1d9e);border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:56px}.pPic img{width:100%;height:100%;object-fit:cover}
.pT{font:900 22px Inter}.pS{font:600 13px/1.4 Inter;opacity:.88;margin:6px 0 12px}
.pGo{width:100%;padding:14px;border:0;border-radius:18px;color:#fff;font:900 16px Inter;background:linear-gradient(180deg,#9a6df5,#743ae8);box-shadow:0 5px 0 #4a1fb0}
.pGo.ad{background:linear-gradient(180deg,#5fd0ff,#2f7bff);box-shadow:0 5px 0 #163b9a}
.pLater{margin-top:8px;background:none;border:0;color:#b9a6ee;font:600 13px Inter;padding:6px}
`);

/* old cinematic (MAARO!) and the 2 AM hook intro are removed */
R7.cine = function (done) { const c = $('r7cine'); if (c) c.remove(); done && done(); };
try { PUNCH.hook = function (cb) { cb && cb(); }; } catch (e) { }
if (!R7.q.has('nosplash')) R7.splash(() => { });

/* ---------- PRO bottom nav: Play in the centre (raised), duotone icons ---------- */
(function () {
  const nav = document.getElementById('r8nav'); if (!nav) return;
  const ICON = {
    rishte: '<svg viewBox="0 0 24 24"><circle cx="8.3" cy="7.4" r="3.4" class="d2"/><path class="d2" d="M2 19.2c0-3.6 2.8-6.3 6.3-6.3 1.4 0 2.6.4 3.6 1.1-1.3 1.3-2.1 3.1-2.1 5.2v.9H3a1 1 0 0 1-1-1z"/><circle cx="16" cy="8.6" r="3.6"/><path d="M10.9 20.1c0-3.4 2.3-6 5.1-6s5.1 2.6 5.1 6c0 .5-.4.9-.9.9h-8.4a.9.9 0 0 1-.9-.9z"/></svg>',
    far: '<svg viewBox="0 0 24 24"><rect x="4" y="3.5" width="16" height="18" rx="3" class="d2"/><rect x="8.3" y="2" width="7.4" height="3.6" rx="1.4"/><path d="M8 12.4l2.6 2.6 5.4-5.4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><rect x="8" y="17" width="8" height="1.8" rx=".9"/></svg>',
    shaadi: '<svg viewBox="0 0 24 24"><path class="d2" d="M6 3h12v5.5a6 6 0 0 1-12 0z"/><path d="M6 4.5H3.5v2A3.5 3.5 0 0 0 6.6 10M18 4.5h2.5v2a3.5 3.5 0 0 1-3.1 3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M12 5.2l1.1 2.2 2.4.3-1.8 1.7.5 2.4-2.2-1.2-2.2 1.2.5-2.4-1.8-1.7 2.4-.3z"/><path d="M10.6 14.2h2.8v3.3h-2.8z"/><rect x="7.5" y="17.5" width="9" height="3.5" rx="1.2"/></svg>',
    shop: '<svg viewBox="0 0 24 24"><path class="d2" d="M4.2 8.2h15.6l-1.2 11.1A2 2 0 0 1 16.6 21H7.4a2 2 0 0 1-2-1.7z"/><path d="M8.2 10V7.2a3.8 3.8 0 0 1 7.6 0V10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 12.2l.9 1.9 2.1.3-1.5 1.5.4 2.1-1.9-1-1.9 1 .4-2.1-1.5-1.5 2.1-.3z"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M8.2 5.2v13.6c0 .9 1 1.4 1.7.9l10-6.8c.6-.4.6-1.3 0-1.8l-10-6.8c-.7-.5-1.7 0-1.7.9z"/></svg>'
  };
  const LBL = { rishte: 'Family', far: 'Requests', play: 'Play', shaadi: 'Events', shop: 'Shop' };
  const order = ['rishte', 'far', 'play', 'shaadi', 'shop'];
  order.forEach(k => {
    const b = document.getElementById('nv_' + k); if (!b) return;
    const ni = b.querySelector('.ni'), old = ni && ni.querySelector('svg');
    if (old) old.outerHTML = ICON[k];
    const t = b.querySelector('b'); if (t) t.textContent = LBL[k];
    nav.appendChild(b);
  });
  document.getElementById('nv_play').classList.add('r9Ctr');
})();
R7.css(`
#r8nav{overflow:visible;background:linear-gradient(180deg,rgba(32,16,88,.98),#10072f);border-top:1px solid rgba(154,109,245,.35);padding:0 6px}
#r8nav button{font:700 10.5px Inter,sans-serif;letter-spacing:.3px;color:#a993e8;gap:4px}
#r8nav .ni{width:46px;height:32px;border-radius:12px}
#r8nav svg{width:24px;height:24px;fill:currentColor}
#r8nav svg .d2{opacity:.42}
#r8nav button.act{color:#fff}
#r8nav button.act .ni{background:rgba(154,109,245,.22);box-shadow:inset 0 0 0 1px rgba(154,109,245,.55)}
#r8nav button.act svg .d2{opacity:.55}
#r8nav button.act::after{content:'';position:absolute;bottom:3px;left:50%;width:16px;height:3px;margin-left:-8px;border-radius:2px;background:linear-gradient(90deg,#9a6df5,#5fd0ff)}
#r8nav button:active .ni{transform:scale(.9)}
/* centre Play */
#r8nav button.r9Ctr{flex:1.15;justify-content:flex-end;padding-bottom:6px}
#r8nav button.r9Ctr .ni{position:absolute;top:-31px;left:50%;margin-left:-32px;width:64px;height:64px;border-radius:50%;background:linear-gradient(160deg,#b38cff 0%,#9a6df5 30%,#743ae8 70%,#5a24d0 100%)!important;box-shadow:0 0 0 5px #170a45,0 0 0 7px rgba(154,109,245,.55),0 10px 24px rgba(116,58,232,.7),inset 0 3px 0 rgba(255,255,255,.35),inset 0 -4px 0 rgba(40,10,110,.45)!important;color:#fff}
#r8nav button.r9Ctr svg{width:30px;height:30px;margin-left:3px;filter:drop-shadow(0 2px 2px rgba(30,6,90,.5))}
#r8nav button.r9Ctr .ni::before{content:'';position:absolute;inset:-7px;border-radius:50%;border:2px solid rgba(95,208,255,.55);animation:r9NavP 2.2s ease-out infinite;pointer-events:none}
@keyframes r9NavP{0%{transform:scale(.92);opacity:.9}100%{transform:scale(1.28);opacity:0}}
#r8nav button.r9Ctr b{color:#fff;font-weight:800}
#r8nav button.r9Ctr.act::after{display:none}
#r8nav button.r9Ctr:active .ni{transform:scale(.93)}
#r8nav button.r9Ctr .nb{top:2px;right:2px}
#r8nav .nb{top:-7px;right:-12px}
#r8nav button{color:#b8a5f0}
`);

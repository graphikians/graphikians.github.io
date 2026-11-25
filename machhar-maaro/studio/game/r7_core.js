/* ================= MACHHAR MAARO · ROUND 7 · CORE =================
   Text safai (dash nahi), khel ke beech text band (corner feed), KO bina kaali patti,
   kaanch ki darar band, inaam card (palat ke udta hai), WhatsApp button, splash, cinematic intro, banner jagah.
==================================================================== */
const R7 = {
  css(s) { const el = document.createElement('style'); el.textContent = s; document.head.appendChild(el); },
  A: k => (window.ART_DATA && ART_DATA[k]) || `art/${k}.webp`,
  img(k) { return `<img src="${R7.A(k)}" alt="" draggable="false">`; },
  emo: s => (String(s).match(/\p{Extended_Pictographic}(️|‍\p{Extended_Pictographic})*/gu) || []).join(''),
  web: !(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform()),
  q: new URLSearchParams(location.search)
};
window.R7 = R7;

/* ---------- 0. naye painted assets ko ART mein load karo ---------- */
R7.NEW_ART = ['wife', 'wife_g', 'wife_h', 'wife_d', 'girlfriend', 'girlfriend_g', 'girlfriend_h', 'girlfriend_d', 'crush', 'crush_g', 'crush_h', 'crush_d', 'padoswali', 'padoswali_g', 'padoswali_h', 'padoswali_d',
  'room_gf', 'room_crush', 'room_padoswali', 'room_yamlok', 'room_hospital', 'b_yamraj', 'b_chitragupt', 'b_yamdoot', 'b_kaal',
  'ov_papa', 'ov_mummy', 'ov_dadi', 'ov_dada', 'ov_bachcha', 'ov_dost', 'ov_dulha', 'ov_raja', 'ov_wife', 'ov_girlfriend', 'ov_crush', 'ov_padoswali',
  'p_coil', 'p_shield', 'p_battery', 'p_mega', 'p_x2', 'p_slow', 'p_freeze', 'p_heart', 'p_time', 'p_chain', 'p_aim', 'p_rage', 'u_halo', 'appicon'];
/* tasveerein sirf zaroorat pe load (phone ki memory bachao) */
R7.need = function (keys) { for (const k of [].concat(keys)) { if (!k || ART.i[k]) continue; const im = new Image(); im.decoding = 'async'; im.src = R7.A(k); ART.i[k] = im; } };
R7.need(['appicon', 'u_halo', 'p_coil', 'p_shield', 'p_battery', 'p_mega', 'p_x2', 'p_slow', 'p_freeze', 'p_heart', 'p_time', 'p_chain', 'p_aim', 'p_rage']);

/* ---------- 1. TEXT SAFAI: game mein kahin dash ya hyphen nahi ---------- */
R7.clean = function (s) {
  if (typeof s !== 'string' || !s || !/[—–-]/.test(s)) return s;
  return s.replace(/(^|\n)\s*[—–]\s*/g, '$1').replace(/\s*[—–]\s*$/g, '').replace(/\s*[—–]\s*/g, ', ')
    .replace(/(\p{L})-(?=\p{L})/gu, '$1 ').replace(/,\s*([,.!?])/g, '$1');
};
(function () {
  const P = CanvasRenderingContext2D.prototype;
  for (const fn of ['fillText', 'strokeText', 'measureText']) { const o = P[fn]; P[fn] = function (t, ...a) { return o.call(this, R7.clean(String(t)), ...a); }; }
  const fixNode = n => { if (n.nodeType === 3) { const v = R7.clean(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; return; } if (n.nodeType !== 1 || n.tagName === 'SCRIPT' || n.tagName === 'STYLE') return; if (n.placeholder) n.placeholder = R7.clean(n.placeholder); if (n.title) n.title = R7.clean(n.title); const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT); let t; while ((t = w.nextNode())) { const v = R7.clean(t.nodeValue); if (v !== t.nodeValue) t.nodeValue = v; } };
  new MutationObserver(ms => { for (const m of ms) { if (m.type === 'characterData') fixNode(m.target); else m.addedNodes.forEach(fixNode); } }).observe(document.documentElement, { subtree: true, childList: true, characterData: true });
  fixNode(document.body);
})();

/* ---------- 2. KHEL KE BEECH TEXT BAND: sab kuch upar kone mein chhote icon feed mein ---------- */
const FEED = {
  q: [],
  add(txt) {
    const s = String(txt), e = R7.emo(s) || '⚡', num = (s.match(/[+x×]?\d[\d,]*%?/) || [''])[0];
    let w = s.replace(/\p{Extended_Pictographic}(️|‍\p{Extended_Pictographic})*/gu, '').replace(/[!·:]/g, ' ').trim().split(/\s+/).filter(Boolean).slice(0, 3).join(' ');
    if (w.length > 17) w = w.slice(0, 16) + '…';
    const label = (num && !w.includes(num) ? num + ' ' : '') + w;
    if (this.q.some(f => f.e === e.slice(0, 4) && f.l === label)) return;
    this.q.unshift({ e: e.slice(0, 4), l: label, t: 0 }); if (this.q.length > 3) this.q.length = 3;
  },
  draw(dt) {
    if (!this.q.length) return;
    ctx.save(); ctx.textBaseline = 'middle';
    const x0 = 8 * S; let y = H * 0.165;
    for (const f of this.q) {
      f.t += dt; const a = Math.min(1, f.t / 0.15, (2.2 - f.t) / 0.35); if (a <= 0) continue;
      ctx.globalAlpha = a; ctx.font = `800 ${9.5 * S}px Poppins`;
      const tw = f.l ? ctx.measureText(f.l).width + 8 * S : 0, w = 26 * S + tw, h = 22 * S, sl = (1 - Math.min(1, f.t / 0.2)) * -30 * S;
      ctx.fillStyle = 'rgba(18,8,48,.78)'; ctx.beginPath(); ctx.roundRect(x0 + sl, y - h / 2, w, h, h / 2); ctx.fill();
      ctx.strokeStyle = 'rgba(154,109,245,.75)'; ctx.lineWidth = 1.2 * S; ctx.stroke();
      ctx.font = `${12 * S}px Poppins`; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText(f.e, x0 + sl + 13 * S, y + 0.5 * S);
      if (f.l) { ctx.font = `800 ${9.5 * S}px Poppins`; ctx.textAlign = 'left'; ctx.fillStyle = '#e9e1ff'; ctx.fillText(f.l, x0 + sl + 24 * S, y + 0.5 * S); }
      y += h + 5 * S;
    }
    this.q = this.q.filter(f => f.t < 2.2);
    ctx.restore(); ctx.textBaseline = 'alphabetic';
  }
};
window.FEED = FEED;
(function () {
  const _pop = window.pop;
  window.pop = function (txt, x, y, size, col, life, rise) {
    if (state === 'play') {
      const s = String(txt);
      if (Math.abs(x - W / 2) < 2) return FEED.add(s);
      if (/\p{L}{3,}/u.test(s)) { const e = R7.emo(s).slice(0, 4), n = (s.match(/[+\-]\d[\d,]*/) || [''])[0], t = (e + (n ? ' ' + n : '')).trim(); if (!t) return; return _pop(t, x, y, Math.min(size || 16, 18), col, life, rise); }
    }
    return _pop.apply(this, arguments);
  };
  window.ann = function (txt) { if (state === 'play') return FEED.add(txt); };
  window.drawAnn = function () { };
  let last = performance.now();
  const _dp = window.drawPops;
  window.drawPops = function () { _dp.apply(this, arguments); const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now; if (state === 'play' || state === 'ko') FEED.draw(dt); else FEED.q = []; };
  // machhar ki baatein: sirf emoji
  const _jt = JUICE.tick; JUICE.tick = function (dt, gdt) { _jt.call(this, dt, gdt); if (G.talks) for (const t of G.talks) if (!t._c) { t._c = 1; t.txt = R7.emo(t.txt).slice(0, 4) || '😈'; } };
})();

/* ---------- 3. KO: kaali pattiyan nahi, halka vignette ---------- */
PUNCH.drawKO = function () {
  const k = this.ko; if (!k) return;
  ctx.save();
  const a = Math.min(1, k.t / 0.25) * (k.t > 1 ? Math.max(0, 1 - (k.t - 1) / 0.25) : 1), g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.28, W / 2, H / 2, Math.max(W, H) * 0.72);
  g.addColorStop(0, 'rgba(10,4,30,0)'); g.addColorStop(1, `rgba(10,4,30,${0.62 * a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (k.t > 0.55) {
    const t2 = k.t - 0.55, sc = t2 < 0.12 ? 2.4 - t2 / 0.12 * 1.4 : 1, al = Math.min(1, t2 / 0.06);
    ctx.translate(W / 2, H * 0.5); ctx.rotate(-0.12); ctx.scale(sc, sc); ctx.globalAlpha = al; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const sz = 72 * S; ctx.font = `900 ${sz}px Poppins`; ctx.lineWidth = sz * 0.14; ctx.strokeStyle = '#4a1fa8'; ctx.strokeText('K.O.!', 0, 0); ctx.shadowColor = `rgb(${ELEC})`; ctx.shadowBlur = 28 * S; ctx.fillStyle = '#fff'; ctx.fillText('K.O.!', 0, 0);
  }
  ctx.restore(); ctx.textBaseline = 'alphabetic';
};

/* ---------- 4. haar pe kaanch ki darar band (bakwas lag rahi thi) ---------- */
window.makeCracks = function () { G.cracks = null; G.shards = []; };

/* ---------- 5. INAAM CARD: palat ke khulta hai, phir icon tak udta hai ---------- */
const REWARD = {
  q: [], busy: false,
  show(o) { this.q.push(o); if (!this.busy) this.next(); },
  next() {
    const o = this.q.shift(); if (!o) { this.busy = false; return; } this.busy = true;
    const el = document.createElement('div'); el.className = 'rwOv';
    const face = o.img ? `<img src="${R7.A(o.img)}" alt="">` : `<span class="rwE">${o.e || '🎁'}</span>`;
    el.innerHTML = `<div class="rwBurst"></div><div class="rwCard"><div class="rwIn"><div class="rwBack"><b>?</b><i>🦟</i></div><div class="rwFront"><div class="rwRays"></div><div class="rwPic">${face}</div><div class="rwKick">${o.kick || 'REWARD!'}</div><div class="rwT">${o.t || ''}</div>${o.sub ? `<div class="rwS">${o.sub}</div>` : ''}</div></div></div><div class="rwTap">tap to collect</div>`;
    document.body.appendChild(el);
    try { sfx.whoosh(); } catch (e) { }
    setTimeout(() => { el.classList.add('flip'); try { sfx.chest(); } catch (e) { } vib([20, 30, 50]); }, 380);
    let gone = false;
    const fly = () => {
      if (gone) return; gone = true; const card = el.querySelector('.rwCard'), tg = o.to && document.querySelector(o.to);
      if (tg && tg.offsetParent !== null) { const a = card.getBoundingClientRect(), b = tg.getBoundingClientRect(); card.style.setProperty('--fx', `${b.left + b.width / 2 - (a.left + a.width / 2)}px`); card.style.setProperty('--fy', `${b.top + b.height / 2 - (a.top + a.height / 2)}px`); el.classList.add('fly'); setTimeout(() => { tg.classList.remove('rwHit'); void tg.offsetWidth; tg.classList.add('rwHit'); try { sfx.coin(); } catch (e) { } }, 520); }
      else el.classList.add('fade');
      setTimeout(() => { el.remove(); o.cb && o.cb(); this.next(); }, 620);
    };
    el.onclick = () => { if (el.classList.contains('flip')) fly(); };
    setTimeout(fly, o.hold || 1900);
  }
};
window.REWARD = REWARD;

/* ---------- 6. WhatsApp button ---------- */
R7.WA = `<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="#fff" d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.4.7 4.7 1.9 6.7L3 29l6.9-2.2c1.9 1 4 1.6 6.1 1.6 7 0 12.7-5.7 12.7-12.7S23 3 16 3zm0 23.2c-2 0-3.9-.6-5.5-1.6l-.4-.2-4.1 1.3 1.3-4-.3-.4a10.5 10.5 0 1 1 9 4.9zm5.8-7.8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.6-1.9-1.7-2.2-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.2.2 2.4 3.7 5.8 5.1 2.9 1.1 3.4.9 4 .8.6-.1 1.9-.8 2.2-1.6.3-.8.3-1.4.2-1.6-.1-.1-.3-.2-.6-.4z"/></svg>`;
document.querySelectorAll('.sharebtn').forEach(b => { b.classList.add('waBtn'); b.innerHTML = `${R7.WA}<span>Post a status</span>`; });

/* ---------- 7. map ke upar coin / gem seedhe ---------- */
(function () {
  const _rm = window.renderMap;
  window.renderMap = function () { _rm.apply(this, arguments); $('mGems').innerHTML = `${R7.img('gem')}<b>${SAVE.gems}</b>`; $('mCoins').innerHTML = `<span class="coin"></span><b>${fmt(SAVE.coins)}</b>`; $('mStars').innerHTML = `${R7.img('star')}<b>${totalStars()}</b>`; };
})();

/* ---------- 8. banner ki jagah (app mein asli banner, demo mein ?bnr=1 se nakli) ---------- */
R7.BANNER_STATES = ['map', 'intro', 'win', 'over', 'shop', 'menu'];
R7.bannerWanted = () => !['play', 'ko', 'ad', 'wake', 'fail'].includes(state) && !$('r7morn') && !$('r7splash') && !$('r7cine') && ['map', 'intro', 'win', 'over', 'shop', 'menu', 'meta'].some(i => $(i) && !$(i).classList.contains('hide'));
setInterval(() => { document.body.classList.toggle('bnr', R7.bannerWanted() && (document.body.classList.contains('isApp') || R7.q.has('bnr'))); }, 250);
if (R7.q.has('bnr')) { const d = document.createElement('div'); d.id = 'fakeBnr'; d.innerHTML = '<b>Ad</b> Banner ad (320x50)'; document.body.appendChild(d); }

/* ---------- 9. SPLASH + CINEMATIC INTRO ---------- */
R7.splash = function (done) {
  const el = document.createElement('div'); el.id = 'r7splash';
  const t = 'A SANX GRAPHIKIANS GAME'.split('').map((c, i) => `<span style="--i:${i}">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
  el.innerHTML = `<div class="spGlow"></div><div class="spRing"></div><div class="spRing r2"></div><svg class="spBolt b1" viewBox="0 0 40 100"><path d="M24 0 4 56h14L10 100l28-62H22L32 0z"/></svg><svg class="spBolt b2" viewBox="0 0 40 100"><path d="M24 0 4 56h14L10 100l28-62H22L32 0z"/></svg><div class="spIcon">${R7.img('appicon')}</div><div class="spTxt">${t}</div><div class="spSweep"></div>`;
  document.body.appendChild(el);
  const go = () => { if (el.dataset.out) return; el.dataset.out = 1; el.classList.add('out'); setTimeout(() => { el.remove(); done && done(); }, 450); };
  setTimeout(go, 2500); el.addEventListener('pointerdown', () => setTimeout(go, 200));
};
R7.cine = function (done) {
  const el = document.createElement('div'); el.id = 'r7cine';
  el.innerHTML = `<div class="cnRoom" style="background-image:url(${R7.A('room')})"></div><div class="cnMoon"></div><div class="cnKallu">${R7.img('k1')}</div>
    <div class="cnPapa">${R7.img('papa')}</div><div class="cnDark"></div><div class="cnZz">z<i>z</i><b>z</b></div>
    <div class="cnRk">${R7.img('racket')}<i class="cnArc"></i></div><div class="cnFlash"></div>
    <div class="cnLogo"><div class="cnL1">MACHHAR</div><div class="cnL2">MAARO!</div></div><div class="cnSkip">tap to skip ▸</div>`;
  document.body.appendChild(el);
  const T = [];
  const at = (ms, f) => T.push(setTimeout(f, ms));
  const snd = f => { try { initAudio(); f(); } catch (e) { } };
  at(300, () => snd(() => { if (buzzGain) { buzzGain.gain.setTargetAtTime(0.06, AC.currentTime, 0.4); } }));
  at(1500, () => snd(() => { if (buzzGain) buzzGain.gain.setTargetAtTime(0.0, AC.currentTime, 0.2); tone(80, 40, 0.5, 0.35, 'sawtooth'); noise(0.5, 0.3, 'highpass', 2500, 0.01); }));
  at(1600, () => vib(30));
  at(2300, () => snd(() => { sfx.mega(); vib([40, 30, 80]); }));
  const end = () => { if (el.dataset.out) return; el.dataset.out = 1; T.forEach(clearTimeout); try { if (buzzGain) buzzGain.gain.value = 0; } catch (e) { } el.classList.add('out'); setTimeout(() => { el.remove(); done && done(); }, 420); };
  at(4300, end); el.addEventListener('pointerdown', end);
};
// splash now starts from r9_ui.js

/* ---------- 10. CSS ---------- */
R7.css(`
#fakeBnr{position:fixed;left:50%;bottom:0;transform:translateX(-50%);width:min(100vw,420px);height:56px;z-index:9000;background:#f4f2fa;color:#5b5578;font:600 11px Poppins;display:none;align-items:center;justify-content:center;gap:8px;border-top:1px solid #ddd}
#fakeBnr b{background:#8a8aa0;color:#fff;border-radius:3px;padding:1px 5px;font-size:10px}
body.bnr #fakeBnr{display:flex}
body.bnr #map #mapBody{padding-bottom:70px}
body.bnr .ov:not(#adov):not(#pause){padding-bottom:64px!important}
body.bnr #mute{bottom:66px}
#over .ovv{padding-bottom:56px}
.pill{display:inline-flex;align-items:center;gap:4px;line-height:1}
.pill img{width:15px;height:15px;object-fit:contain;display:block}
.pill b{font-weight:800;line-height:1}
.pill .coin{margin:0!important;vertical-align:0}
.rwHit{animation:rwHit .45s ease}
@keyframes rwHit{30%{transform:scale(1.35);filter:brightness(1.6)}}
.waBtn{background:linear-gradient(180deg,#2bd46a,#12a64a)!important;border:2px solid rgba(255,255,255,.55)!important;color:#fff!important;border-radius:999px!important;width:auto!important;padding:0 12px 0 8px!important;display:inline-flex!important;align-items:center;gap:6px;font:800 12px Poppins!important;box-shadow:0 6px 18px rgba(18,166,74,.45)!important;height:48px}
.waBtn svg{width:24px;height:24px;flex:none}
.waBtn span{white-space:nowrap}
/* reward card */
.rwOv{position:fixed;inset:0;z-index:300;display:flex;align-items:center;justify-content:center;flex-direction:column;background:radial-gradient(circle at 50% 45%,rgba(116,58,232,.55),rgba(8,3,26,.82));animation:rwIn .25s ease;perspective:900px}
.rwOv.fade{animation:rwOut .5s ease forwards}
.rwBurst{position:absolute;width:520px;height:520px;background:repeating-conic-gradient(rgba(255,255,255,.10) 0 9deg,transparent 9deg 22deg);border-radius:50%;animation:rwSpin 8s linear infinite;mask:radial-gradient(circle,#000 20%,transparent 68%);-webkit-mask:radial-gradient(circle,#000 20%,transparent 68%)}
.rwCard{width:220px;height:290px;position:relative;transition:transform .55s cubic-bezier(.5,0,.6,1),opacity .55s}
.rwOv.fly .rwCard{transform:translate(var(--fx),var(--fy)) scale(.12);opacity:.2}
.rwOv.fly .rwBurst,.rwOv.fly .rwTap{opacity:0;transition:opacity .3s}
.rwOv.fly{background:transparent;transition:background .4s}
.rwIn{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .6s cubic-bezier(.3,1.4,.5,1);transform:rotateY(180deg) scale(.6)}
.rwOv.flip .rwIn{transform:rotateY(0) scale(1)}
.rwBack,.rwFront{position:absolute;inset:0;border-radius:22px;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden}
.rwBack{transform:rotateY(180deg);background:linear-gradient(145deg,#9a6df5,#4a1fa8);border:3px solid rgba(255,255,255,.7);display:flex;align-items:center;justify-content:center;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.rwBack b{font:900 90px Poppins;color:#fff;text-shadow:0 0 30px rgba(127,212,255,.9)}.rwBack i{font-style:normal;font-size:30px}
.rwFront{background:linear-gradient(170deg,#ffffff,#efe8ff 55%,#d9ccff);border:3px solid #fff;box-shadow:0 0 0 3px #743ae8,0 0 50px rgba(154,109,245,.9),0 24px 60px rgba(0,0,0,.55);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;text-align:center}
.rwRays{position:absolute;inset:-40%;background:repeating-conic-gradient(rgba(154,109,245,.13) 0 10deg,transparent 10deg 20deg);animation:rwSpin 10s linear infinite}
.rwPic{position:relative;width:130px;height:130px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 10px 14px rgba(74,31,168,.45));animation:rwBob 1.6s ease-in-out infinite}
.rwPic img{max-width:100%;max-height:100%;object-fit:contain}.rwE{font-size:84px;line-height:1}
.rwKick{position:relative;font:800 11px Poppins;letter-spacing:3px;color:#743ae8;margin-top:6px}
.rwT{position:relative;font:900 22px/1.1 Poppins;color:#2a1270;margin-top:4px}
.rwS{position:relative;font:700 12px Poppins;color:#5b3fb0;margin-top:5px}
.rwTap{margin-top:22px;font:700 12px Poppins;color:#d9ccff;opacity:.8;animation:rwBlink 1.2s infinite}
@keyframes rwIn{from{opacity:0}}@keyframes rwOut{to{opacity:0}}@keyframes rwSpin{to{transform:rotate(360deg)}}@keyframes rwBob{50%{transform:translateY(-6px) scale(1.03)}}@keyframes rwBlink{50%{opacity:.35}}
/* splash */
#r7splash{position:fixed;inset:0;z-index:500;background:radial-gradient(circle at 50% 42%,#4d22b8 0%,#1c0a4f 45%,#07031a 100%);display:flex;align-items:center;justify-content:center;overflow:hidden}
#r7splash.out{animation:rwOut .45s ease forwards}
.spGlow{position:absolute;width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(154,109,245,.85),rgba(116,58,232,0) 70%);animation:spGlow 1.4s ease-out both,spPulse 1.6s 1.4s ease-in-out infinite}
.spRing{position:absolute;width:250px;height:250px;border-radius:50%;background:conic-gradient(from 0deg,transparent 0 55%,rgba(127,212,255,.0) 55%,rgba(127,212,255,.95) 80%,#fff 82%,transparent 84%);mask:radial-gradient(circle,transparent 63%,#000 64%,#000 70%,transparent 71%);-webkit-mask:radial-gradient(circle,transparent 63%,#000 64%,#000 70%,transparent 71%);animation:rwSpin 1.3s linear infinite,spRingIn .7s .2s ease-out both}
.spRing.r2{width:300px;height:300px;animation:rwSpin 2.2s linear infinite reverse,spRingIn .7s .45s ease-out both;opacity:.55;filter:hue-rotate(40deg)}
.spIcon{position:relative;width:170px;height:170px;border-radius:38px;overflow:hidden;box-shadow:0 0 0 3px rgba(255,255,255,.6),0 0 60px rgba(127,212,255,.75),0 20px 50px rgba(0,0,0,.6);animation:spIcon 1s cubic-bezier(.2,1.6,.4,1) .15s both}
.spIcon img{width:100%;height:100%;display:block}
.spBolt{position:absolute;width:46px;height:115px;fill:#fff;filter:drop-shadow(0 0 10px rgb(127,212,255)) drop-shadow(0 0 22px rgb(127,212,255));opacity:0}
.spBolt.b1{left:calc(50% - 150px);top:calc(50% - 150px);transform:rotate(-20deg);animation:spBolt .5s .55s both}
.spBolt.b2{right:calc(50% - 150px);top:calc(50% - 30px);transform:rotate(25deg) scaleX(-1);animation:spBolt .5s .8s both}
.spTxt{position:absolute;bottom:13%;left:0;right:0;text-align:center;font:800 13px Poppins;letter-spacing:4px;color:#fff}
.spTxt span{display:inline-block;opacity:0;animation:spLet .5s calc(.9s + var(--i) * .035s) cubic-bezier(.2,1.4,.4,1) both;text-shadow:0 0 14px rgba(127,212,255,.9)}
.spSweep{position:absolute;inset:0;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.18) 50%,transparent 60%);transform:translateX(-100%);animation:spSweep 1s 1.5s ease-in-out both}
@keyframes spGlow{from{transform:scale(.2);opacity:0}}@keyframes spPulse{50%{transform:scale(1.12);opacity:.8}}
@keyframes spRingIn{from{transform:scale(.3);opacity:0}}
@keyframes spIcon{0%{transform:scale(.2) rotate(-25deg);opacity:0;filter:brightness(3)}60%{filter:brightness(1.6)}100%{transform:none;opacity:1;filter:none}}
@keyframes spBolt{0%{opacity:0}20%{opacity:1}40%{opacity:.2}60%{opacity:1}100%{opacity:0}}
@keyframes spLet{from{opacity:0;transform:translateY(16px) scale(.6);filter:blur(6px)}to{opacity:1;transform:none;filter:none}}
@keyframes spSweep{to{transform:translateX(100%)}}
/* cinematic */
#r7cine{position:fixed;inset:0;z-index:480;background:#05020f;overflow:hidden}
#r7cine.out{animation:rwOut .42s ease forwards}
.cnRoom{position:absolute;inset:0;background-size:cover;background-position:30% bottom;filter:brightness(.28) saturate(1.2);animation:cnRoom 4.3s ease-in-out both}
.cnMoon{position:absolute;right:12%;top:13%;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle at 40% 40%,#fff,#e6dcff 45%,#b9a3ff 70%);box-shadow:0 0 60px 20px rgba(185,163,255,.45);animation:cnMoon 4.3s both}
.cnKallu{position:absolute;width:110px;top:14%;left:-30%;filter:brightness(0) drop-shadow(0 0 2px rgba(185,163,255,.6));animation:cnFly 1.9s .35s cubic-bezier(.4,.1,.5,1) both}
.cnKallu img{width:100%}
.cnPapa{position:absolute;left:4%;right:4%;bottom:21%;animation:cnPapa 4.3s both}.cnPapa img{width:100%;filter:brightness(.55)}
.cnDark{position:absolute;inset:0;background:radial-gradient(circle at 50% 70%,transparent 30%,rgba(5,2,15,.75) 80%)}
.cnZz{position:absolute;left:24%;bottom:43%;font:900 22px Poppins;color:#c7b0ff;opacity:0;animation:cnZz 1.6s .2s ease-out both}.cnZz i,.cnZz b{font-style:normal;display:inline-block;margin-left:4px;font-size:26px;transform:translateY(-10px)}.cnZz b{font-size:30px;transform:translateY(-22px)}
.cnRk{position:absolute;left:50%;bottom:-40%;width:180px;transform:translateX(-50%) rotate(-18deg);animation:cnRk .6s 1.75s cubic-bezier(.2,1.4,.4,1) both}
.cnRk img{width:100%;filter:drop-shadow(0 0 0 transparent);animation:cnRkGlow .5s 2.3s both}
.cnArc{position:absolute;inset:-20%;border-radius:50%;box-shadow:0 0 50px 20px rgba(127,212,255,.0);animation:cnArc .7s 2.3s both}
.cnFlash{position:absolute;inset:0;background:#fff;opacity:0;animation:cnFlash .55s 2.3s both}
.cnLogo{position:absolute;left:0;right:0;top:30%;text-align:center;opacity:0;animation:cnLogo .7s 2.45s cubic-bezier(.2,1.6,.4,1) both}
.cnL1{font:900 40px/1 Poppins;color:#fff;letter-spacing:2px;text-shadow:0 4px 0 #4a1fa8,0 0 30px rgba(154,109,245,.9)}
.cnL2{font:900 74px/1 Poppins;color:#fff;margin-top:2px;text-shadow:0 6px 0 #4a1fa8,0 0 40px rgb(127,212,255),0 0 80px rgba(127,212,255,.7);animation:cnShake .4s 2.5s both}
.cnSkip{position:absolute;right:16px;bottom:22px;font:700 11px Poppins;color:rgba(255,255,255,.55)}
@keyframes cnRoom{0%{transform:scale(1.15)}100%{transform:scale(1)}}
@keyframes cnMoon{0%{opacity:0;transform:scale(.8)}20%{opacity:1;transform:none}}
@keyframes cnFly{0%{left:-30%;transform:translateY(0) rotate(8deg)}50%{transform:translateY(-14px) rotate(-6deg)}100%{left:110%;transform:translateY(10px) rotate(8deg)}}
@keyframes cnPapa{0%{transform:translateY(20px);opacity:0}15%{opacity:1;transform:none}}
@keyframes cnZz{0%{opacity:0;transform:translate(0,0)}30%{opacity:1}100%{opacity:0;transform:translate(30px,-40px)}}
@keyframes cnRk{from{bottom:-40%}to{bottom:30%}}
@keyframes cnRkGlow{to{filter:drop-shadow(0 0 18px rgb(127,212,255)) drop-shadow(0 0 40px rgba(127,212,255,.8)) brightness(1.3)}}
@keyframes cnArc{0%{box-shadow:0 0 0 0 rgba(127,212,255,.9)}100%{box-shadow:0 0 80px 60px rgba(127,212,255,0)}}
@keyframes cnFlash{0%{opacity:0}15%{opacity:.85}100%{opacity:0}}
@keyframes cnLogo{from{opacity:0;transform:scale(2.6)}to{opacity:1;transform:none}}
@keyframes cnShake{20%{transform:translate(-6px,3px) rotate(-2deg)}40%{transform:translate(6px,-3px) rotate(2deg)}60%{transform:translate(-4px,2px)}80%{transform:translate(3px,-1px)}}
`);

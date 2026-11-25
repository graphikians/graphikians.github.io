/* ================= MACHHAR MAARO · ROUND 7C · GAMER TEST KE BAAD SUDHAAR =================
   1 mushkil dheere dheere · 2 khud adjust hone wala level · 3 pehla "bal bal bache" + pehla revive free
   4 jeet ke baad zyada se zyada 1 popup (baaki map pe) · 6 machhar ki ginti ki seema · 7 intro din mein 1 baar
   8 coins ka hisaab · 9 "kal aana" hook · combo meter · "bas 1 aur" auto next · dost ka record · jaldi "phir se"
========================================================================================== */
const TUNE = { userTap: 0 };
document.addEventListener('pointerdown', () => { TUNE.userTap = performance.now(); }, true);

/* ---------- 1 + 2 + 6. mushkil ka graph, DDA, machhar ki seema ---------- */
R7.dda = function () {
  const sv = SV(), n = CL && CL.n || 1, f = (sv.fails || {})[n] || 0, w3 = sv.w3 || 0;
  let k = 1; if (f >= 2) k *= 1.12; if (f >= 4) k *= 1.1; if (w3 >= 3) k *= 0.93; return k;
};
(function () {
  const _sm = HZ.spawnMul.bind(HZ);
  HZ.spawnMul = function () {
    let k = _sm(); const n = CL.n || 1;
    // purani L1-5 wali narmi ko naye graph se badlo
    if (!CL.yam && !CL.shaadi && !CL.ev) { if (n <= 5) k /= 1.3; k *= n <= 2 ? 1.25 : n <= 5 ? 0.95 : n <= 9 ? 0.8 : 0.92; }
    k *= R7.dda();
    const alive = G.mosq.filter(m => !m.dead && !m.boss).length, cap = 7 + Math.floor(Math.min(75, n > 800 ? 40 : n) / 6);
    if (alive >= cap) k *= 3.2;
    return k;
  };
  const _sp = window.spawnMosq;
  window.spawnMosq = function () { const m = _sp.apply(this, arguments); if (m && m.sp && !CL.ev) { const f = (SV().fails || {})[CL.n] || 0; if (f >= 2) m.sp *= 0.93; if (CL.n >= 3 && CL.n <= 5) m.sp *= 1.06; } return m; };
})();

/* ---------- 3. "bal bal bache" pal + mini boss + pehla revive free ---------- */
(function () {
  const _sl = window.startLevel;
  window.startLevel = function (n) {
    _sl.apply(this, arguments);
    G.r7tn = { burst: !CL.ev && !CL.yam && !CL.shaadi && CL.n >= 3 && CL.n <= 9 && !CL.boss ? 0.62 : 0, mini: !CL.boss && [4, 8].includes(CL.n) ? 0.45 : 0, cm: 0 };
  };
  const _tk = META.tick;
  META.tick = function (dt, gdt) {
    _tk.call(META, dt, gdt);
    const t = G.r7tn; if (!t || state !== 'play') return;
    const p = CL.len ? G.t / CL.len : Math.min(1, G.t / 40), s = G.sleepers[0];
    if (t.burst && p > t.burst && s) { t.burst = 0; for (let i = 0; i < 4; i++) { const a = Math.PI * (1.1 + i * 0.25), m = spawnMosq('normal', s.x + Math.cos(a) * 160 * S, s.y + Math.sin(a) * 120 * S - 60 * S); if (m) m.sp *= 1.25; } FEED.add('🦟 Swarm incoming!'); sfx.roar && sfx.roar(); G.shake = Math.max(G.shake || 0, 6); }
    if (t.mini && p > t.mini) { t.mini = 0; try { const m = spawnBoss('don', W * 0.85, { hp: 8, maxhp: 8, coin: 20, pts: 300 }); if (m) { m.mini = 1; FEED.add('😈 Mini Don is here'); } } catch (e) { } }
  };
  // pehla revive free (khiladi seekhe revive kya hai)
  const _so = window.showOver;
  window.showOver = function () {
    _so.apply(this, arguments);
    const sv = SV(); if (sv.freeRev) return;
    const tryIt = () => { const rv = $('oRevive'); if (!rv || $('over').classList.contains('hide')) return setTimeout(tryIt, 120); if (rv.dataset.free) return; rv.dataset.free = 1; const sm = rv.querySelector('small'); if (sm) sm.textContent = '🎁 FIRST ONE FREE · no ad'; rv.classList.add('free');
      const orig = rv.onclick; rv.onclick = () => { if (!sv.freeRev) { sv.freeRev = 1; save(); clearInterval(revTimer); const ad = window.showAd; window.showAd = cb => { window.showAd = ad; cb && cb(); }; } orig && orig(); delete rv.dataset.free; }; };
    tryIt();
  };
})();

/* ---------- 4. jeet/haar ke baad zyada se zyada 1 popup: baaki map pe ---------- */
(function () {
  R7.mapQ = [];
  const _rs = REWARD.show.bind(REWARD);
  REWARD.show = function (o) {
    const onEnd = ['win', 'over'].includes(state) || !$('win').classList.contains('hide') || !$('over').classList.contains('hide');
    const userDid = performance.now() - TUNE.userTap < 1800;
    if (onEnd && !userDid && !o.now) { if (!R7._endShown) { R7._endShown = 1; return _rs(o); } R7.mapQ.push(o); return; }
    return _rs(o);
  };
  const _w = window.showWin; window.showWin = function () { R7._endShown = 0; return _w.apply(this, arguments); };
  const _o = window.showOver; window.showOver = function () { R7._endShown = 0; return _o.apply(this, arguments); };
  const _sm = window.showMap; window.showMap = function () { const r = _sm.apply(this, arguments); if (R7.mapQ.length) { const q = R7.mapQ.splice(0); setTimeout(() => q.forEach(o => _rs(o)), 700); } return r; };
  // jeet pe purane text wale toast bhi chhote rakho
  const _t = window.toast; window.toast = function (m) { if (!$('win').classList.contains('hide') && performance.now() - TUNE.userTap > 1800 && /mila|Lv|unlock/i.test(m)) return; return _t.apply(this, arguments); };
})();

/* ---------- 7. intro din mein ek baar ---------- */
(function () {
  const k = 'mmCine', d = new Date().toDateString();
  const seen = (() => { try { return localStorage.getItem(k); } catch (e) { return null; } })();
  if (seen === d) { const c = $('r7cine'); if (c) c.remove(); R7.cine = function (done) { done && done(); }; }
  else { try { localStorage.setItem(k, d); } catch (e) { } }
})();

/* ---------- 8. coins ka hisaab: maare gaye machhar ke coins ki seema, star pe bonus ---------- */
(function () {
  const _sw = window.showWin;
  window.showWin = function (st) {
    if (CL && !CL.ev && !CL.yam && !CL.shaadi) { const cap = 90 + (CL.n || 1) * 10; if (G.coins > cap) G.coins = cap; G.coins += (st || 1) * 15; const sv = SV(); sv.w3 = st >= 3 ? (sv.w3 || 0) + 1 : 0; if (sv.fails) delete sv.fails[CL.n]; save(); }
    return _sw.apply(this, arguments);
  };
})();

/* ---------- 9. "kal aana" hook: map pe kal ka inaam + bahar jaate waqt ---------- */
R7.tomorrow = function () {
  const sv = SV(), sh = R7.sh(), items = [`🎁 Day ${((SAVE.streak || 0) % 7) + 1} reward`];
  items.push('📜 New request');
  if (sh.start != null && !sh.done && R7.shDay() < 7) items.push(`💍 Wedding: ${R7.SD[Math.min(6, R7.shDay())].n}`);
  for (const id in sv.hosp) items.push(`🏥 ${CHARS[id].n}: ${R7.fmtLeft(R7.hospLeft(id)).split(' ').slice(0, 2).join(' ')} left`);
  return items;
};
(function () {
  const _st = R7.strip;
  R7.strip = function () { return `<div class="kalBox"><b>⏰ TOMORROW:</b> ${R7.tomorrow().slice(0, 3).join(' · ')}</div>` + _st.call(this); };
  R7.exitModal = function (onExit) {
    META.modal(`<div class="drm"><div class="drmPic small"><img src="${R7.A('kallu_hasta')}"></div><div class="kick">LEAVING ALREADY?</div><div class="big" style="font-size:26px">COME BACK TOMORROW!</div><div class="drmHow">${R7.tomorrow().map(x => `<div>${x}</div>`).join('')}</div><div class="sub">Kallu will be waiting all night 😈</div></div>`, 'ONE MORE LEVEL ▶', () => { showIntro(Math.min(75, SAVE.unlocked || 1)); });
    const b = document.createElement('button'); b.className = 'btn2'; b.style.cssText = 'width:100%;margin-top:8px'; b.textContent = 'Exit'; b.onclick = () => { $('meta').classList.add('hide'); onExit && onExit(); }; const mb = $('metaBody'); if (mb) mb.appendChild(b);
  };
})();

/* ---------- COMBO METER: neeche patti bharti hai, full = FEVER + free Mega ---------- */
(function () {
  const _dp = window.drawPops;
  window.drawPops = function (time) {
    _dp.apply(this, arguments);
    if (state !== 'play' || CL.ev) return;
    const t = G.r7tn || (G.r7tn = {}); const want = G.fever > 0 ? 1 : Math.min(1, (G.combo || 0) / 15); t.cm = (t.cm || 0) + (want - (t.cm || 0)) * 0.18;
    if (G.fever > 0 && !t.feverMega) { t.feverMega = 1; G.freeMega = (G.freeMega || 0) + 1; FEED.add('⚡ Free Mega'); }
    if (!(G.fever > 0)) t.feverMega = 0;
    const w = W * 0.56, h = 7 * S, x = W / 2 - w / 2, y = H - 14 * S - (document.body.classList.contains('bnr') ? 0 : 0);
    ctx.save(); ctx.fillStyle = 'rgba(18,8,48,.7)'; ctx.beginPath(); ctx.roundRect(x - 2 * S, y - 2 * S, w + 4 * S, h + 4 * S, h); ctx.fill();
    const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#743ae8'); g.addColorStop(0.6, '#9a6df5'); g.addColorStop(1, `rgb(${ELEC})`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, Math.max(h, w * t.cm), h, h / 2); ctx.fill();
    if (t.cm > 0.98) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.5 + Math.sin(time * 14) * 0.3; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
    ctx.font = `${12 * S}px Poppins`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(G.fever > 0 ? '🔥' : '⚡', x - 12 * S, y + h / 2); ctx.restore(); ctx.textBaseline = 'alphabetic';
  };
})();

/* ---------- BAS 1 AUR: Agla Level 5 sec mein khud ---------- */
(function () {
  const _sw = window.showWin;
  window.showWin = function (st) {
    const r = _sw.apply(this, arguments);
    const nb = $('wNext'); if (!nb || CL.ev || CL.yam || CL.shaadi || nb.style.display === 'none') return r;
    clearInterval(R7._autoI); nb.classList.remove('auto'); const lab = nb.dataset.lab || nb.textContent; nb.dataset.lab = lab;
    let left = 7; const t0 = performance.now(), wv = $('win');
    const cancel = () => { clearInterval(R7._autoI); nb.classList.remove('auto'); nb.textContent = lab; wv.removeEventListener('pointerdown', cancel, true); wv.removeEventListener('scroll', cancel, true); };
    setTimeout(() => { if ($('win').classList.contains('hide')) return; wv.addEventListener('pointerdown', cancel, true); wv.addEventListener('scroll', cancel, true); nb.classList.add('auto');
      R7._autoI = setInterval(() => { if ($('win').classList.contains('hide') || document.querySelector('.rwOv') || !$('meta').classList.contains('hide')) { return; } left--; nb.textContent = `${lab} (${left})`; if (left <= 0) { cancel(); nb.click(); } }, 1000); }, 2500);
    return r;
  };
})();

/* ---------- DOST KA RECORD: link se aaye to "tod do" ---------- */
(function () {
  const r = +R7.q.get('r'), n = R7.q.get('n'); if (r > 0 && n) { SV().rival = { n: n.slice(0, 14), r }; save(); }
  const _st = R7.strip;
  R7.strip = function () { const rv = SV().rival, me = SAVE.tk || 0; return (rv ? `<div class="rivBox">🥊 <b>${rv.n}</b> swatted ${fmt(rv.r)} · you have ${fmt(me)} ${me > rv.r ? '<em>👑 YOU BEAT THEM!</em>' : `<em>${fmt(rv.r - me)} to go!</em>`}</div>` : '') + _st.call(this); };
  // share link mein apna record
  R7.shareLink = () => `https://machhar-maaro.netlify.app/?r=${SAVE.tk || 0}&n=${encodeURIComponent(SAVE.pname || 'Friend')}`;
})();

/* ---------- JALDI "PHIR SE": haar pe bada button ---------- */
R7.css(`
.ovRow .ovAg{flex:2!important;background:linear-gradient(180deg,#9a6df5,#743ae8)!important;border:2px solid #fff!important;font-size:18px!important;color:#fff!important}
.ovRev.free{background:linear-gradient(180deg,#e6fff0,#c9f5dc)}
.kalBox{margin:2px 2px 8px;padding:8px 10px;border-radius:12px;background:rgba(127,212,255,.12);border:1px dashed rgba(127,212,255,.6);font:600 10.5px Poppins;color:#e2f6ff}
.kalBox b{font-weight:900;color:rgb(127,212,255)}
.rivBox{margin:2px 2px 8px;padding:8px 10px;border-radius:12px;background:linear-gradient(90deg,rgba(255,61,110,.25),rgba(116,58,232,.3));border:1px solid rgba(255,140,170,.6);font:600 11px Poppins}
.rivBox em{font-style:normal;font-weight:900;color:#fff;background:#ff3d6e;border-radius:6px;padding:1px 6px;margin-left:4px}
#wNext.auto{animation:revP .8s infinite;box-shadow:0 0 0 3px rgba(255,255,255,.5),0 0 26px rgba(127,212,255,.8)}
`);

/* ---------- shor (kaan ke paas zap) ko samjhao + DDA ---------- */
R7.noiseK = () => { const f = (SV().fails || {})[CL.n] || 0; return f >= 3 ? 0.45 : f >= 2 ? 0.65 : 1; };
(function () {
  let lastWave = 0;
  const _tk = META.tick;
  META.tick = function (dt, gdt) {
    _tk.call(META, dt, gdt);
    if (state !== 'play') return;
    if (CL.task === 'waves' && G.wave !== lastWave) { lastWave = G.wave; const f = (SV().fails || {})[CL.n] || 0; if (f >= 2) G.waveLeft = Math.max(4, Math.round(G.waveLeft * (f >= 3 ? 0.65 : 0.8))); }
    if (G.wave === 0) lastWave = 0;
    // shor ka saaf ishaara: kaan ke paas laal lehrein
    const s = G.sleepers[0]; if (s && s.noiseCd > 0.25 && !G._noiseFeed) { G._noiseFeed = 1; FEED.add('🔊 Noise near the ear'); }
  };
  const _dp = window.drawPops;
  window.drawPops = function (time) { _dp.apply(this, arguments); if (state !== 'play') return; for (const s of G.sleepers) if (s.noiseCd > 0.05) { ctx.save(); ctx.strokeStyle = '#ff6b8a'; ctx.lineWidth = 2.5 * S; ctx.globalAlpha = Math.min(1, s.noiseCd * 2.4); for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(s.x - 4 * S, s.y - 6 * S, (10 + i * 9 + (0.4 - s.noiseCd) * 40) * S, -0.9, 0.9); ctx.stroke(); } ctx.restore(); } };
  const _so = window.showOver;
  window.showOver = function () {
    const noisy = (G.st.noise || 0) >= 4 && (G.st.noise || 0) > (G.st.bites || 0);
    const r = _so.apply(this, arguments);
    if (noisy) { const put = () => { if ($('over').classList.contains('hide')) return setTimeout(put, 150); const m = $('oMsg'); if (m) m.textContent = '🔊 The noise woke them! Do not zap near the ear, hit from a distance.'; }; put(); }
    return r;
  };
})();

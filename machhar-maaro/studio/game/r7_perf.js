/* ================= ROUND 8 · SPEED =================
   Tasveerein zaroorat pe · halki awaaz ki goonj · dheema phone mila to "low mode" (kam resolution, kam chamak)
==================================================== */
(function () {
  // level/kamre ke hisaab se tasveerein pehle se load
  const keysFor = id => { const k = R7.KEY[id], out = []; if (k) out.push(k, k + '_g', k + '_h'); if (R7.NF && R7.NF[id]) out.push(R7.NF[id]); if (R7.OLDG && R7.OLDG[id]) out.push(R7.OLDG[id]); if (R7.OVK[id] && SV().outfit[id]) out.push('ov_' + R7.OVK[id]); return out; };
  const _st = window.setTheme;
  window.setTheme = function (t) { const R = ART.ROOMS[t]; if (R) R7.need([R.bg, R.bed]); return _st.apply(this, arguments); };
  const _ms = window.makeSleepers;
  window.makeSleepers = function () { const r = _ms.apply(this, arguments); try { for (const s of r) R7.need(keysFor(s.cid || s.kind)); if (CW && CW.cid) R7.need(keysFor(CW.cid)); } catch (e) { } return r; };
  const _sl = window.startLevel;
  window.startLevel = function (n) {
    const L = typeof n === 'object' ? n : LEVELS[n - 1];
    if (L && L.boss) R7.need('b_' + L.boss);
    if (L && L.shaadi) R7.need(['dulhan', 'dulhan_g', 'dulhan_mehendi', 'dulhan_haldi', 'dulhan_shaadi', 'm_dholak', 'm_photo', 'm_baraati', 'b_shaadibigaad', 'room_dulhan', 'room_aangan']);
    if (L && L.yam) R7.need(['room_yamlok', 'b_yamdoot', 'b_chitragupt', 'b_yamraj']);
    return _sl.apply(this, arguments);
  };
  // pehla kirdaar abhi se
  try { R7.need(keysFor(RISHTE.cid(0))); } catch (e) { }
})();

/* ---------- halki goonj: convolver ki jagah sasta echo ---------- */
AU.init = function () {
  try {
    const inp = AC.createGain(), d1 = AC.createDelay(0.5), d2 = AC.createDelay(0.5), fb = AC.createGain(), lp = AC.createBiquadFilter(), out = AC.createGain();
    d1.delayTime.value = 0.09; d2.delayTime.value = 0.17; fb.gain.value = 0.28; lp.type = 'lowpass'; lp.frequency.value = 2400; out.gain.value = 0.35;
    inp.connect(d1); d1.connect(lp); lp.connect(d2); d2.connect(fb); fb.connect(d1); lp.connect(out); d2.connect(out); out.connect(master);
    this.rv = inp; this.rvIn = inp;
  } catch (e) { this.rv = null; this.rvIn = null; }
};

/* ---------- dheema phone: low mode ---------- */
R7.low = (() => { try { return localStorage.getItem('mmLow') === '1'; } catch (e) { return false; } })();
R7.applyLow = function () {
  if (!R7.low) return;
  FX.on = false; DPR = Math.min(DPR, 1.5); try { resize(); } catch (e) { }
  document.body.classList.add('low');
};
(function () {
  let slow = 0, t0 = performance.now(), frames = 0;
  const _r = window.render;
  window.render = function () {
    const r = _r.apply(this, arguments);
    if (state === 'play' && !R7.low) { frames++; const now = performance.now(); if (now - t0 > 2000) { const fps = frames * 1000 / (now - t0); slow = fps < 40 ? slow + 1 : Math.max(0, slow - 1); frames = 0; t0 = now; if (slow >= 3) { R7.low = true; try { localStorage.setItem('mmLow', '1'); } catch (e) { } R7.applyLow(); } } }
    return r;
  };
  R7.applyLow();
})();
// low mode mein canvas shadow (sabse mehnga) band
(function () { const P = CanvasRenderingContext2D.prototype, d = Object.getOwnPropertyDescriptor(P, 'shadowBlur'); if (!d || !d.set) return; Object.defineProperty(P, 'shadowBlur', { get() { return d.get.call(this); }, set(v) { d.set.call(this, R7.low ? 0 : v); }, configurable: true }); })();
R7.css(`body.low .rsDil:before,body.low .shBan:before,body.low .rwBurst,body.low .tkGsp,body.low .spSweep{display:none}`);

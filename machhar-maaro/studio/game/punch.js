/* ================= MACHHAR MAARO — "PUNCH" LAYER =================
   1. HOOK INTRO   — pehli baar KHELO dabate hi 4 sec ka cinematic (andhera, bhin-bhin paas aata, MAARO!)
   2. 3-2-1 MAARO  — har level duniya rukti hai, dhol ke saath countdown, phir dhamaka
   3. HIT-STOP     — har kill pe duniya ek pal jam jaati hai + safed impact frame + speed lines
   4. KO CAM       — aakhri machhar pe slow-mo zoom + "KHATAM!" stamp (fighting game jaisa)
   5. AUTO AGLA    — jeet ke baad chup baithe to agla level khud shuru (Netflix autoplay)
==================================================================== */
const PUNCH = {
  impacts: [],
  /* ---------- 1. hook intro ---------- */
  hook(cb) {
    initAudio();
    const el = document.createElement('div'); el.id = 'hook';
    el.innerHTML = `<div class="hkL" style="animation-delay:.2s">2 AM…</div><div class="hkL" style="animation-delay:1.1s">Papa is fast asleep 😴</div><div class="hkL hkB" style="animation-delay:2.1s">and THEN it arrived… 🦟</div><div class="hkSlam">SWAT!</div><div class="hkSkip">tap to skip</div>`;
    document.body.appendChild(el);
    // bhin-bhin paas aata hai (left → right, tez)
    try { if (buzzGain && !muted) { const t = AC.currentTime; buzzGain.gain.cancelScheduledValues(t); buzzGain.gain.setValueAtTime(0.0001, t); buzzGain.gain.exponentialRampToValueAtTime(0.25, t + 3); buzzOsc.frequency.setValueAtTime(420, t); buzzOsc.frequency.linearRampToValueAtTime(640, t + 3); if (buzzPan) { buzzPan.pan.setValueAtTime(-1, t); buzzPan.pan.linearRampToValueAtTime(0.9, t + 1.6); buzzPan.pan.linearRampToValueAtTime(0, t + 3); } } } catch (e) { }
    sfx.heart(0.6); setTimeout(() => sfx.heart(0.8), 900); setTimeout(() => sfx.heart(1), 1800);
    let done = false;
    const end = () => {
      if (done) return; done = true;
      try { if (buzzGain) { const t = AC.currentTime; buzzGain.gain.cancelScheduledValues(t); buzzGain.gain.setValueAtTime(0, t); } } catch (e) { }
      sfx.mega(); vib([40, 30, 120]); el.classList.add('slam');
      setTimeout(() => { el.classList.add('out'); cb(); }, 650); setTimeout(() => el.remove(), 1100);
    };
    const tm = setTimeout(end, 3300); el.onpointerdown = () => { clearTimeout(tm); end(); };
    META.x('Cold Open Hook (Pehle 4 second)');
  },
  /* ---------- 2. countdown ---------- */
  startReady() {
    if (CL.ev) return;
    G.ready = 2.3; G.rdLast = 4;
  },
  readyTick() {
    if (!(G.ready > 0)) return;
    const n = G.ready > 1.65 ? 3 : G.ready > 1.1 ? 2 : G.ready > 0.55 ? 1 : 0;
    if (n !== G.rdLast) { G.rdLast = n; if (n) { tone(150, 60, 0.18, 0.35); noise(0.08, 0.2, 'bandpass', 900, 0.002, 1); vib(18); } else { sfx.zap(); tone(90, 40, 0.5, 0.4, 'sawtooth'); noise(0.4, 0.35, 'lowpass', 2500, 0.005); G.flash = 0.45; G.flashCol = '127,212,255'; G.shake = 14; vib([30, 20, 60]); } }
  },
  drawReady() {
    if (!(G.ready > 0)) return;
    const n = G.ready > 1.65 ? 3 : G.ready > 1.1 ? 2 : G.ready > 0.55 ? 1 : 0, seg = n ? (G.ready - (n - 1) * 0.55 - 0.55) / 0.55 : G.ready / 0.55, k = 1 - clamp(seg, 0, 1);
    const txt = n ? String(n) : 'SWAT!', sc = n ? 1.6 - Math.min(1, k * 4) * 0.6 : 0.6 + Math.min(1, k * 5) * 0.6, a = n ? (k > 0.8 ? (1 - k) * 5 : 1) : 1;
    ctx.save(); ctx.fillStyle = `rgba(6,2,18,${0.35 * Math.min(1, G.ready)})`; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = a; ctx.translate(W / 2, H * 0.52); ctx.scale(sc, sc); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const sz = (n ? 110 : 64) * S; ctx.font = `900 ${sz}px Poppins`; ctx.lineWidth = sz * 0.12; ctx.strokeStyle = '#4a1fa8'; ctx.strokeText(txt, 0, 0);
    ctx.shadowColor = n ? P2 : `rgb(${ELEC})`; ctx.shadowBlur = 30 * S; ctx.fillStyle = '#fff'; ctx.fillText(txt, 0, 0);
    ctx.restore(); ctx.textBaseline = 'alphabetic';
  },
  /* ---------- 3. hit-stop + impact ---------- */
  onKill(m) {
    if (m.decoy) return;
    const big = m.size > 1.3 || m.kallu || m.heera;
    G.hs = Math.max(G.hs || 0, big ? 0.075 : 0.035);
    this.impacts.push({ x: m.x, y: m.y, t: 0, big, rot: Math.random() * 6 });
    G.lastK = { x: m.x, y: m.y, t: G.t };
  },
  drawImpacts(dt) {
    for (const p of this.impacts) {
      p.t += p.slow ? dt * 0.35 : dt; const k = p.t / (p.big ? 0.2 : 0.13), r = (p.big ? 26 : 16) * S + k * (p.big ? 70 : 42) * S;
      ctx.save(); ctx.globalAlpha = Math.max(0, 1 - k); ctx.strokeStyle = '#fff'; ctx.lineWidth = (p.big ? 7 : 4) * S * (1 - k) + 1;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.stroke();
      if (k < 0.5) { ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(p.x, p.y, (p.big ? 18 : 11) * S * (1 - k * 2), 0, 7); ctx.fill(); }
      ctx.lineWidth = 2.5 * S; ctx.strokeStyle = `rgba(${ELEC},${1 - k})`;
      for (let i = 0; i < 8; i++) { const a = p.rot + i * 0.785, r1 = r * 1.1, r2 = r * 1.1 + (p.big ? 34 : 20) * S * (1 - k); ctx.beginPath(); ctx.moveTo(p.x + Math.cos(a) * r1, p.y + Math.sin(a) * r1); ctx.lineTo(p.x + Math.cos(a) * r2, p.y + Math.sin(a) * r2); ctx.stroke(); }
      ctx.restore();
    }
    this.impacts = this.impacts.filter(p => p.t < 0.22);
  },
  /* ---------- 4. KO cam ---------- */
  ko: null,
  koTick(dt) {
    const k = this.ko; if (!k) return; k.t += dt; const sd = dt * 0.28;
    if (!k.s0) { k.s0 = 1; this.impacts.push({ x: k.x, y: k.y, t: 0, big: true, rot: 0, slow: 1 }); for (let i = 0; i < 40; i++) sparks(k.x, k.y, 1, rnd(120, 420), ['#fff', `rgb(${ELEC})`, P2]); }
    for (const c of (G.corpses || [])) { c.vy += 900 * S * sd; c.x += c.vx * sd; c.y += c.vy * sd; c.rot += c.vr * sd; }
    G.slowT = 0.1;
    if (k.t > 0.05 && !k.s1) { k.s1 = 1; tone(60, 30, 1.2, 0.5); noise(1, 0.3, 'lowpass', 600, 0.01); vib([100, 50, 200]); }
    if (k.t > 0.55 && !k.s2) { k.s2 = 1; [0, 4, 7, 12].forEach((n, i) => tone(NOTES[Math.min(10, n)], NOTES[Math.min(10, n)], 0.5, 0.1, 'triangle', i * 0.03)); G.flash = 0.5; G.flashCol = '255,255,255'; G.shake = 18; }
    if (k.t > 1.25) { this.ko = null; G.slowT = 0; state = 'play'; _pWin(); }
  },
  koCam() {
    const k = this.ko; if (!k) return null;
    const e = k.t < 0.35 ? 1 - Math.pow(1 - k.t / 0.35, 3) : k.t < 1.0 ? 1 : 1 - (k.t - 1) / 0.25;
    const z = 1 + 0.75 * clamp(e, 0, 1); return { z, fx: W / 2 + (k.x - W / 2) * clamp(e, 0, 1), fy: H / 2 + (k.y - H / 2) * clamp(e, 0, 1) };
  },
  drawKO() {
    const k = this.ko; if (!k) return;
    ctx.save(); const bars = Math.min(1, k.t / 0.25) * 70 * S; ctx.fillStyle = '#05020f'; ctx.fillRect(0, 0, W, bars); ctx.fillRect(0, H - bars, W, bars);
    if (k.t > 0.55) { const t2 = k.t - 0.55, sc = t2 < 0.12 ? 2.4 - t2 / 0.12 * 1.4 : 1, a = Math.min(1, t2 / 0.06);
      ctx.translate(W / 2, H * 0.5); ctx.rotate(-0.12); ctx.scale(sc, sc); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const sz = 72 * S; ctx.font = `900 ${sz}px Poppins`; ctx.lineWidth = sz * 0.14; ctx.strokeStyle = '#4a1fa8'; ctx.strokeText('K.O.!', 0, 0); ctx.shadowColor = `rgb(${ELEC})`; ctx.shadowBlur = 28 * S; ctx.fillStyle = '#fff'; ctx.fillText('K.O.!', 0, 0);
      ctx.shadowBlur = 0; ctx.font = `800 ${15 * S}px Poppins`; ctx.fillStyle = '#d9ccff'; ctx.fillText('💥 last mosquito 💥', 0, sz * 0.62); }
    else { ctx.textAlign = 'center'; ctx.font = `900 ${14 * S}px Poppins`; ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.9; ctx.fillText('L A S T   M O S Q U I T O', W / 2, bars - 24 * S); }
    ctx.restore(); ctx.textBaseline = 'alphabetic';
  },
  /* ---------- 5. auto agla ---------- */
  autoNext() {
    const win = $('win'), btn = $('wNext'); if (!btn || btn.style.display === 'none') return;
    clearInterval(this.anI); clearTimeout(this.anT); btn.style.removeProperty('--an'); btn.classList.remove('an'); btn.textContent = 'NEXT LEVEL ▶';
    let cancelled = false; const cancel = () => { cancelled = true; clearInterval(this.anI); clearTimeout(this.anT); btn.classList.remove('an'); btn.textContent = 'NEXT LEVEL ▶'; };
    win.addEventListener('pointerdown', cancel, { once: true });
    this.anT = setTimeout(() => {
      if (cancelled || win.classList.contains('hide') || !$('meta').classList.contains('hide')) return;
      let n = 4; btn.classList.add('an'); btn.textContent = `NEXT LEVEL ▶ ${n}`; sfx.tick();
      this.anI = setInterval(() => { if (cancelled || win.classList.contains('hide')) return clearInterval(this.anI); n--; sfx.tick(); if (n <= 0) { clearInterval(this.anI); btn.classList.remove('an'); btn.textContent = 'NEXT LEVEL ▶'; META.x('Autoplay (Agla level khud)'); btn.click(); } else btn.textContent = `NEXT LEVEL ▶ ${n}`; }, 1000);
    }, 6500);
  }
};

/* ---------- hooks ---------- */
const _pPlay = $('playBtn').onclick; $('playBtn').onclick = () => { if (!sessionStorage.mmHook) { sessionStorage.mmHook = 1; PUNCH.hook(_pPlay); } else _pPlay(); };
const _pStart = META.onStart; META.onStart = function () { _pStart.apply(this, arguments); PUNCH.startReady(); PUNCH.ko = null; G.lastK = null; };
const _pTick = META.tick; META.tick = function (dt, gdt) { _pTick.call(META, dt, gdt); };
const _pKill = window.kill; window.kill = function (m, how) { const was = m.dead; _pKill.apply(this, arguments); if (!was && m.dead && (state === 'play')) PUNCH.onKill(m); };
const _pWin = window.winLevel;
window.winLevel = function () {
  if (state !== 'play') return;
  const lk = G.lastK; if (CL.task === 'boss' || CL.ev || !lk || G.t - lk.t > 0.6) return _pWin();
  state = 'ko'; uiPlaying(false); PUNCH.ko = { x: lk.x, y: lk.y, t: 0 }; G.hs = 0; G.slowT = 0;
  META.x('KO Cam (Aakhri machhar)');
};
const _pCam = window.camera; window.camera = function () { return PUNCH.koCam() || _pCam(); };
let _pLast = performance.now();
const _pRender = window.render; window.render = function (time) {
  const now = performance.now(), dt = Math.min(0.05, (now - _pLast) / 1000); _pLast = now;
  if (state === 'play') PUNCH.readyTick();
  if (state === 'ko') PUNCH.koTick(dt);
  _pRender(time);
  ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (state === 'play' || state === 'ko') { const cam = camera(); ctx.save(); if (cam) { ctx.translate(cam.fx, cam.fy); ctx.scale(cam.z, cam.z); ctx.translate(-cam.fx, -cam.fy); } PUNCH.drawImpacts(dt); ctx.restore(); }
  if (state === 'play') PUNCH.drawReady();
  if (state === 'ko') PUNCH.drawKO();
  ctx.restore();
};
const _pShowWin = window.showWin; window.showWin = function () { _pShowWin.apply(this, arguments); if (!CL.ev) PUNCH.autoNext(); };

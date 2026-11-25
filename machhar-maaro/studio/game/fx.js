/* ================= MACHHAR MAARO — "CINEMA FX" LAYER =================
   1. BLOOM          — roshni wali cheezein (bijli, racket, sparks, text) asli glow karti hain
   2. LIGHTNING TRAIL— swipe pe bijli ki patli-moti ribbon, racket pe rengti bijli
   3. SPARK STREAKS  — chingaariyan lakeer banake udti hain (additive)
   4. GOD RAYS       — khidki se chaand ki roshni ki kirnein + tairti dhool
   5. IRIS OPEN      — level shuru pe andhere se gol roshni khulti hai
   6. CHROMA HIT     — bade dhamake pe screen ka rang-alag "glitch" jhatka
   7. UI MOTION      — har screen ke card ek-ek karke uchhal ke aate hain, button pe chamak
   Auto-quality: phone dheema pade to bloom khud band.
======================================================================== */
const FX = {
  on: true, slowF: 0, trail: [], arcs: [], irisT: 9,
  bc: null, bctx: null, ok: false,
  init() {
    this.bc = document.createElement('canvas'); this.bctx = this.bc.getContext('2d');
    this.ok = typeof this.bctx.filter === 'string';
    if (/fx=0/.test(location.search)) this.on = false;
  },
  /* ---------- bloom ---------- */
  bloom() {
    if (!this.on || !this.ok) return;
    const w = Math.max(1, (cv.width / 4) | 0), h = Math.max(1, (cv.height / 4) | 0);
    if (this.bc.width !== w || this.bc.height !== h) { this.bc.width = w; this.bc.height = h; }
    const b = this.bctx; b.globalCompositeOperation = 'copy'; b.filter = `brightness(0.62) contrast(5) saturate(1.3) blur(${Math.max(2, w / 70)}px)`;
    b.drawImage(cv, 0, 0, w, h); b.filter = 'none';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = state === 'ko' ? 0.8 : 0.55; ctx.drawImage(this.bc, 0, 0, cv.width, cv.height); ctx.restore();
  },
  /* ---------- chroma split on big hits ---------- */
  chroma() {
    const k = clamp((G.shake - 9) / 20, 0, 1); if (k <= 0 || !this.on) return;
    const o = 4 * k * DPR; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.22 * k;
    if (this.ok) { ctx.filter = 'hue-rotate(-60deg) saturate(3)'; ctx.drawImage(cv, -o, 0); ctx.filter = 'hue-rotate(80deg) saturate(3)'; ctx.drawImage(cv, o, 0); ctx.filter = 'none'; }
    else { ctx.drawImage(cv, -o, 0); ctx.drawImage(cv, o, 0); }
    ctx.restore();
  },
  /* ---------- world-space extras (after world, before HUD) ---------- */
  world(time, dt) {
    if (state !== 'play' && state !== 'menu' && state !== 'ko') return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // god rays from window (top-right)
    const ox = W * 0.86, oy = -H * 0.05;
    for (let i = 0; i < 4; i++) {
      const sway = Math.sin(time * 0.35 + i * 1.7) * 0.05, a = -2.15 + i * 0.12 + sway, len = H * 1.25, wd = (0.035 + (i % 2) * 0.02);
      const g = ctx.createLinearGradient(ox, oy, ox + Math.cos(a) * len, oy + Math.sin(a) * -len); g.addColorStop(0, `rgba(190,170,255,${0.07 + 0.03 * Math.sin(time * 0.8 + i)})`); g.addColorStop(1, 'rgba(154,109,245,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + Math.cos(a - wd) * len, oy - Math.sin(a - wd) * len); ctx.lineTo(ox + Math.cos(a + wd) * len, oy - Math.sin(a + wd) * len); ctx.closePath(); ctx.fill();
    }
    // floating glowing dust
    for (let i = 0; i < 16; i++) { const px = (Math.sin(i * 12.9 + time * 0.15) * 0.5 + 0.5) * W, py = ((i * 0.137 + time * 0.012 * (1 + i % 3)) % 1) * H * 0.75 + H * 0.05, f = 0.5 + 0.5 * Math.sin(time * 2 + i * 3); ctx.fillStyle = `rgba(210,195,255,${0.12 + f * 0.18})`; ctx.beginPath(); ctx.arc(px, py, (0.8 + f * 1.2) * S, 0, 7); ctx.fill(); }
    if (state === 'menu') { ctx.restore(); return; }
    // spark streaks: chingaari ki lakeer
    ctx.lineCap = 'round';
    for (const p of G.parts) {
      if (!p.vx || p.col === 'ring' || String(p.col).startsWith('rgba(200')) continue;
      const v = Math.hypot(p.vx, p.vy); if (v < 120 * S) continue;
      const a = clamp(p.life / (p.max || 1), 0, 1), l = Math.min(26 * S, v * 0.035);
      ctx.strokeStyle = String(p.col).startsWith('#') || String(p.col).startsWith('rgb') ? p.col : '#fff'; ctx.globalAlpha = a * 0.8; ctx.lineWidth = Math.max(1, p.size * 0.7);
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx / v * l, p.y - p.vy / v * l); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // lightning ribbon trail
    const now = performance.now();
    this.trail = this.trail.filter(p => now - p.t < 160);
    if (this.trail.length > 2) {
      const tr = this.trail;
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 1; i < tr.length; i++) {
          const k = i / tr.length, a = tr[i - 1], b = tr[i];
          ctx.strokeStyle = pass ? `rgba(255,255,255,${k * 0.9})` : `rgba(${ELEC},${k * 0.55})`; ctx.lineWidth = (pass ? 2.5 : 14) * S * k;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      // jagged bolt along trail
      ctx.strokeStyle = `rgba(${ELEC},.9)`; ctx.lineWidth = 1.4 * S; ctx.beginPath();
      tr.forEach((p, i) => { const j = (Math.random() - 0.5) * 12 * S; i ? ctx.lineTo(p.x + j, p.y + j) : ctx.moveTo(p.x, p.y); }); ctx.stroke();
    }
    // crawling arcs on racket rim
    if (ptr.vis > 0 && state === 'play') {
      const r = R() * 0.82, intensity = Math.min(1, (ptr.speed || 0) / (1600 * S) + G.combo * 0.04 + (G.fever > 0 ? 0.5 : 0) + 0.15);
      if (Math.random() < intensity) this.arcs.push({ a: Math.random() * 6.283, span: rnd(0.4, 1.1), life: 0.09 });
      for (const c of this.arcs) {
        c.life -= dt; ctx.strokeStyle = `rgba(${ELEC},${clamp(c.life / 0.09, 0, 1)})`; ctx.lineWidth = 1.6 * S; ctx.beginPath();
        for (let i = 0; i <= 6; i++) { const aa = c.a + c.span * i / 6 + ptr.ang, rr2 = r * (1 + (Math.random() - 0.5) * 0.22); const x = ptr.x + Math.cos(aa) * rr2, y = ptr.y + Math.sin(aa) * rr2 * 0.86; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke();
      }
      this.arcs = this.arcs.filter(c => c.life > 0);
    }
    ctx.restore();
  },
  /* ---------- iris open ---------- */
  iris(dt) {
    if (this.irisT > 0.7) return; this.irisT += dt;
    const k = clamp(this.irisT / 0.6, 0, 1), e = 1 - Math.pow(1 - k, 3), r = Math.hypot(W, H) * 0.6 * e + 1;
    ctx.save(); ctx.fillStyle = '#05020f'; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.moveTo(W / 2 + r, H * 0.55); ctx.arc(W / 2, H * 0.55, r, 0, 6.2832, true); ctx.closePath(); ctx.fill('evenodd');
    ctx.strokeStyle = `rgba(${ELEC},${1 - k})`; ctx.lineWidth = 4 * S; ctx.beginPath(); ctx.arc(W / 2, H * 0.55, r, 0, 7); ctx.stroke(); ctx.restore();
  },
  /* ---------- auto quality ---------- */
  perf(dt) {
    if (!this.on || /fx=1/.test(location.search)) return;
    if (dt > 0.026) this.slowF++; else this.slowF = Math.max(0, this.slowF - 0.5);
    if (this.slowF > 120) { this.on = false; console.log('FX: bloom off (slow device)'); }
  }
};
FX.init();
cv.addEventListener('pointermove', e => { if (!ptr.down || state !== 'play') return; const L = FX.trail[FX.trail.length - 1]; if (!L || Math.hypot(L.x - e.clientX, L.y - e.clientY) > 3) FX.trail.push({ x: e.clientX, y: e.clientY, t: performance.now() }); if (FX.trail.length > 40) FX.trail.shift(); });

/* ---------- hooks ---------- */
let _fxLast = performance.now();
const _fxPopups = window.drawPopups;
window.drawPopups = function () { const now = performance.now(), dt = Math.min(0.05, (now - _fxLast) / 1000); _fxLast = now; FX.world(performance.now() / 1000, dt); _fxPopups(); };
const _fxRender = window.render;
let _fxPrev = performance.now();
window.render = function (time) {
  const now = performance.now(), dt = Math.min(0.1, (now - _fxPrev) / 1000); _fxPrev = now;
  _fxRender(time);
  ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); FX.iris(dt); ctx.restore();
  FX.chroma(); FX.bloom(); FX.perf(dt);
};
const _fxStart = META.onStart; META.onStart = function () { _fxStart.apply(this, arguments); FX.irisT = 0; FX.trail = []; };

/* ---------- UI motion: screens ke card ek-ek karke uchhalte hain ---------- */
new MutationObserver(ms => ms.forEach(m => {
  const el = m.target; if (!el.classList || !el.classList.contains('ov')) return;
  if (!el.classList.contains('hide') && m.oldValue && m.oldValue.includes('hide')) { el.classList.remove('enter'); void el.offsetWidth; el.classList.add('enter'); clearTimeout(el._enT); el._enT = setTimeout(() => el.classList.remove('enter'), 1200); }
})).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });

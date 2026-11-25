/* ================= MACHHAR MAARO · ROUND 8 · VISIBLE ITEM EFFECTS =================
   Every item now shows on screen while it works:
   Mesh = glowing net on the screen edges + mosquitoes bouncing off + "blocked" counter
   Shield (tent, cream, shield booster) = mosquito net canopy over the bed
   Coil = smoke rising from a coil, Chai = steam on the racket, Magnet = gold aura,
   Earplugs = calm ring on sleepers, Inverter = glowing bulb.
==================================================================================== */
const R8T = () => performance.now() / 1000;
R8.fx = { bl: [], blT: 0, puffs: [] };
(function () {
  const _st = window.startLevel;
  window.startLevel = function () { const r = _st.apply(this, arguments); G.r8blocked = 0; R8.fx.bl = []; R8.fx.puffs = []; R8.fx.blT = 0; R8.fx.last = performance.now(); return r; };
})();
R8.fxTick = function () {
  const now = performance.now(), dt = Math.min(0.05, (now - (R8.fx.last || now)) / 1000); R8.fx.last = now;
  if (state !== 'play') return dt;
  const F = G.fx || {};
  // mesh: mosquitoes try to come in, hit the net, fall down
  if (F.mesh > 0) {
    R8.fx.blT -= dt;
    if (R8.fx.blT <= 0) {
      R8.fx.blT = 0.9 + Math.random() * 0.8;
      const side = (Math.random() * 3) | 0, m = 26 * S;
      const p = side === 0 ? { x: m, y: H * (0.2 + Math.random() * 0.5), vx: -1 } : side === 1 ? { x: W - m, y: H * (0.2 + Math.random() * 0.5), vx: 1 } : { x: W * (0.15 + Math.random() * 0.7), y: H * 0.13, vx: 0 };
      Object.assign(p, { t: 0, vy: -40 * S, side }); R8.fx.bl.push(p); G.r8blocked = (G.r8blocked || 0) + 1;
    }
  }
  for (const p of R8.fx.bl) { p.t += dt; if (p.t > 0.25) { p.vy += 520 * S * dt; p.y += p.vy * dt; p.x += p.vx * 18 * S * dt; } }
  R8.fx.bl = R8.fx.bl.filter(p => p.t < 1.4);
  // smoke and steam puffs
  if (F.coil > 0 && Math.random() < dt * 9) R8.fx.puffs.push({ k: 'smoke', x: W - 70 * S + Math.random() * 6 * S, y: H * 0.86, vx: -(Math.random() * 14 + 6) * S, vy: -(28 + Math.random() * 20) * S, t: 0, life: 2.6 });
  if (F.chai > 0 && ptr.vis > 0 && Math.random() < dt * 7) R8.fx.puffs.push({ k: 'steam', x: ptr.x + (Math.random() - 0.5) * 20 * S, y: ptr.y - 10 * S, vx: (Math.random() - 0.5) * 10 * S, vy: -(40 + Math.random() * 20) * S, t: 0, life: 1.1 });
  for (const p of R8.fx.puffs) { p.t += dt; p.x += p.vx * dt + Math.sin(p.t * 3 + p.y) * 0.3 * S; p.y += p.vy * dt; }
  R8.fx.puffs = R8.fx.puffs.filter(p => p.t < p.life);
  return dt;
};
// shield canopy over the bed (drawn with the bed, under the mosquitoes)
R8.drawCanopy = function (a) {
  const x = bed.x - 6 * S, w = bed.w + 12 * S, y = bed.y + 6 * S, h = Math.min(bed.w * 0.7, H * 0.36), ty = y - h, inset = w * 0.08;
  ctx.save(); ctx.globalAlpha = a;
  ctx.beginPath(); ctx.moveTo(x + inset, ty); ctx.lineTo(x + w - inset, ty); ctx.lineTo(x + w, y); ctx.lineTo(x, y); ctx.closePath();
  const g = ctx.createLinearGradient(0, ty, 0, y); g.addColorStop(0, 'rgba(210,230,255,.20)'); g.addColorStop(1, 'rgba(210,230,255,.08)'); ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(225,238,255,.22)'; ctx.lineWidth = 1;
  const st = 7 * S; ctx.beginPath(); for (let i = x - h; i < x + w + h; i += st) { ctx.moveTo(i, ty); ctx.lineTo(i + h * 0.5, y); ctx.moveTo(i, y); ctx.lineTo(i + h * 0.5, ty); } ctx.stroke();
  const sh = ctx.createLinearGradient(x, 0, x + w, 0), o = (R8T() * 0.25) % 1; sh.addColorStop(Math.max(0, o - 0.1), 'rgba(255,255,255,0)'); sh.addColorStop(o, 'rgba(255,255,255,.22)'); sh.addColorStop(Math.min(1, o + 0.1), 'rgba(255,255,255,0)'); ctx.fillStyle = sh; ctx.fillRect(x, ty, w, h);
  ctx.restore();
  ctx.strokeStyle = 'rgba(127,212,255,.85)'; ctx.lineWidth = 2.2 * S; ctx.shadowColor = '#7fd4ff'; ctx.shadowBlur = 10 * S;
  ctx.beginPath(); ctx.moveTo(x + inset, ty); ctx.lineTo(x + w - inset, ty); ctx.lineTo(x + w, y); ctx.moveTo(x + inset, ty); ctx.lineTo(x, y); ctx.stroke();
  ctx.restore();
};
(function () {
  R8.drawUnder = function () {
    if (state !== 'play' && state !== 'ko') return;
    const F = G.fx || {};
    if (F.shield > 0 && bed && !(G.sleepers[0] && G.sleepers[0].walk)) R8.drawCanopy(Math.min(1, F.shield * 2) * (F.shield < 2 ? 0.6 + Math.sin(R8T() * 18) * 0.4 : 1));
    // coil on the floor
    if (F.coil > 0) {
      const cx = W - 70 * S, cy = H * 0.875; ctx.save(); ctx.strokeStyle = '#2f6b3a'; ctx.lineWidth = 3.4 * S; ctx.beginPath();
      for (let t = 0; t < 14; t += 0.2) { const r = (2 + t * 1.1) * S; ctx.lineTo(cx + Math.cos(t) * r, cy + Math.sin(t) * r * 0.45); } ctx.stroke();
      ctx.fillStyle = `rgba(255,${120 + Math.sin(R8T() * 9) * 40 | 0},60,.95)`; ctx.shadowColor = '#ff8a3d'; ctx.shadowBlur = 8 * S; ctx.beginPath(); ctx.arc(cx + Math.cos(14) * 17.4 * S, cy + Math.sin(14) * 17.4 * S * 0.45, 2.4 * S, 0, 7); ctx.fill(); ctx.restore();
    }
    for (const p of R8.fx.puffs) if (p.k === 'smoke') { const k = p.t / p.life; ctx.fillStyle = `rgba(220,230,240,${0.22 * (1 - k)})`; ctx.beginPath(); ctx.arc(p.x, p.y, (5 + k * 22) * S, 0, 7); ctx.fill(); }
  };
  // over the mosquitoes: mesh frame, blocked bugs, steam, magnet aura
  const _dr = window.drawRacket;
  window.drawRacket = function () {
    try { R8.drawUnder(); R8.drawOver(); } catch (e) { }
    return _dr.apply(this, arguments);
  };
  R8.drawOver = function () {
    R8.fxTick();
    if (state !== 'play') return;
    const F = G.fx || {};
    if (F.mesh > 0) R8.drawMesh(Math.min(1, F.mesh * 2) * (F.mesh < 2 ? 0.6 + Math.sin(R8T() * 18) * 0.4 : 1));
    for (const p of R8.fx.bl) {
      const k = p.t; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.t > 0.25 ? p.t * 9 : 0); ctx.globalAlpha = Math.max(0, 1 - Math.max(0, k - 0.9) * 2);
      ctx.fillStyle = '#2a1d4a'; ctx.beginPath(); ctx.ellipse(0, 0, 6 * S, 3 * S, 0, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(220,230,255,.6)'; ctx.beginPath(); ctx.ellipse(-2 * S, -4 * S, 4 * S, 2 * S, -0.5, 0, 7); ctx.ellipse(2 * S, -4 * S, 4 * S, 2 * S, 0.5, 0, 7); ctx.fill();
      ctx.restore();
      if (k < 0.3) { ctx.strokeStyle = `rgba(127,212,255,${1 - k / 0.3})`; ctx.lineWidth = 2 * S; ctx.beginPath(); ctx.arc(p.x, p.y, (8 + k * 60) * S, 0, 7); ctx.stroke(); }
    }
    for (const p of R8.fx.puffs) if (p.k === 'steam') { const k = p.t / p.life; ctx.fillStyle = `rgba(255,255,255,${0.35 * (1 - k)})`; ctx.beginPath(); ctx.arc(p.x, p.y, (3 + k * 9) * S, 0, 7); ctx.fill(); }
    if (F.magnet > 0 && ptr.vis > 0) { const r = (46 + Math.sin(R8T() * 6) * 4) * S; ctx.save(); ctx.strokeStyle = 'rgba(232,193,90,.75)'; ctx.setLineDash([6 * S, 6 * S]); ctx.lineDashOffset = -R8T() * 40; ctx.lineWidth = 2.5 * S; ctx.beginPath(); ctx.arc(ptr.x, ptr.y, r, 0, 7); ctx.stroke(); ctx.restore(); }
    if (F.ear > 0) for (const s of G.sleepers) { if (s.x == null) continue; ctx.strokeStyle = `rgba(127,212,255,${0.35 + Math.sin(R8T() * 4) * 0.15})`; ctx.lineWidth = 2 * S; ctx.beginPath(); ctx.arc(s.hx || s.x, (s.hy || s.y) - 4 * S, 30 * S, 0, 7); ctx.stroke(); }
  };
})();
R8.drawMesh = function (a) {
  const e = 22 * S, st = 9 * S; ctx.save(); ctx.globalAlpha = a;
  ctx.beginPath(); ctx.rect(0, H * 0.1, e, H * 0.8); ctx.rect(W - e, H * 0.1, e, H * 0.8); ctx.rect(e, H * 0.1, W - 2 * e, e); ctx.save(); ctx.clip();
  ctx.fillStyle = 'rgba(127,212,255,.10)'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(200,235,255,.55)'; ctx.lineWidth = 1; ctx.beginPath();
  for (let i = -H; i < W + H; i += st) { ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.moveTo(i, H); ctx.lineTo(i + H, 0); } ctx.stroke(); ctx.restore();
  ctx.strokeStyle = '#7fd4ff'; ctx.lineWidth = 2 * S; ctx.shadowColor = '#7fd4ff'; ctx.shadowBlur = 10 * S;
  ctx.beginPath(); ctx.moveTo(e, H * 0.9); ctx.lineTo(e, H * 0.1 + e); ctx.lineTo(W - e, H * 0.1 + e); ctx.lineTo(W - e, H * 0.9); ctx.stroke(); ctx.shadowBlur = 0;
  // counter pill
  const txt = `MESH ON · ${G.r8blocked || 0} BLOCKED`; ctx.font = `800 ${11 * S}px "Baloo 2",Poppins`; const tw = ctx.measureText(txt).width + 22 * S, px = W / 2 - tw / 2, py = H * 0.1 + e + 8 * S;
  ctx.fillStyle = 'rgba(18,8,45,.85)'; ctx.beginPath(); ctx.roundRect(px, py, tw, 20 * S, 10 * S); ctx.fill(); ctx.strokeStyle = '#7fd4ff'; ctx.lineWidth = 1.2 * S; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, W / 2, py + 10.5 * S); ctx.textBaseline = 'alphabetic';
  ctx.restore();
};

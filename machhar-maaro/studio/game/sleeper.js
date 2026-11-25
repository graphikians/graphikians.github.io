/* ================= MACHHAR MAARO — PRO SLEEPER & BEDROOM ================= */
const SKIN = { papa: '#b98262', raja: '#b4805f', dadi: '#c08a6c', mummy: '#c48a6a', dost: '#c48a68', bachcha: '#cf9a76', dulha: '#b88060' };
const CLOTH = { papa: ['#f2f0fa', '#cfcbe0', 0], raja: ['#9a6df5', '#4a1fa8', 1], dadi: ['#ece6f8', '#743ae8', 1], mummy: ['#c7b0ff', '#8a5cf0', 1], dost: ['#3a5ab0', '#25407e', 1], bachcha: ['#7fd4ff', '#3f8fd0', 1], dulha: ['#f3eefa', '#9a6df5', 1] };
const POSES = ['back', 'side', 'sprawl'];
/* blanket profile: [fraction of body length, height above mattress in units] — same length so poses morph */
const PROF = {
  back: [[0.05, -9], [0.13, -25], [0.24, -33], [0.36, -31], [0.48, -27], [0.6, -25], [0.72, -19], [0.84, -16], [0.93, -17], [0.97, -25], [1.0, -11]],
  side: [[0.05, -13], [0.13, -40], [0.23, -43], [0.35, -31], [0.47, -39], [0.57, -47], [0.67, -40], [0.77, -34], [0.85, -37], [0.9, -22], [0.92, -8]],
  sprawl: [[0.05, -9], [0.13, -23], [0.24, -30], [0.36, -28], [0.48, -25], [0.6, -24], [0.7, -18], [0.77, -14], [0.82, -10], [0.85, -6], [0.86, -2]]
};
const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
function bodyLen(s) { return s.end - s.x; }
function posePts(s) {
  const u = S * s.sc, L = bodyLen(s), by = bed.y;
  const P = (dx, h, skin) => ({ x: dx, y: by + h - s.y, skin });
  if (s.pose === 'side') return [Object.assign(P(4 * u, -30 * u, 1), { face: 1 }), P(-8 * u, -2 * u, 1), P(0.57 * L, -48 * u), P(0.2 * L, -44 * u)];
  if (s.pose === 'sprawl') return [Object.assign(P(6 * u, -40 * u, 1), { face: 1 }), P(0.19 * L, 48 * u, 1), P(1.04 * L, 22 * u, 1), P(0.32 * L, -30 * u)];
  return [Object.assign(P(6 * u, -40 * u, 1), { face: 1 }), P(0.36 * L, -36 * u, 1), P(0.16 * L, -28 * u), P(0.97 * L, -27 * u)];
}
function setPose(s, p) {
  s.prevPose = s.pose; s.pose = p || POSES[(POSES.indexOf(s.pose) + 1 + (Math.random() < 0.5 ? 1 : 0)) % 3];
  if (s.pose === s.prevPose) s.pose = POSES[(POSES.indexOf(s.pose) + 1) % 3];
  s.poseT = 0.7; s.pts = posePts(s); s.marks = s.marks.filter(m => !m.skin || false);
}
function addMark(s, ti) { const p = s.pts[ti]; if (!p || !p.skin) return; s.marks.push({ x: p.x + rnd(-4, 4) * S, y: p.y + rnd(-3, 3) * S, t: 8, face: p.face }); if (s.marks.length > 8) s.marks.shift(); s.scratch = 1.3; s.scratchAt = ti; }

/* ---------- bed & bedroom furniture ---------- */
const _oldBedFrame = window.drawBedFrame;
function woodGrad(x0, y0, x1, y1, c) { const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, c[0]); g.addColorStop(0.5, c[1]); g.addColorStop(1, c[2]); return g; }
function clockTime() {
  let f = 0.35;
  if (state === 'play' || state === 'clear' || state === 'wake' || state === 'over' || state === 'fail') { if (CL.len) f = clamp(G.t / CL.len, 0, 1); else { const p = progress(); f = p.max ? clamp(p.cur / p.max, 0, 1) : 0.4; } }
  const mins = 60 + f * 300, h = Math.floor(mins / 60), m = Math.floor(mins % 60);
  return `${h}:${m < 10 ? '0' : ''}${m}`;
}
window.drawBedFrame = function () {
  if (theme === 'gaon' || theme === 'hostel') return _oldBedFrame();
  const { x, y, w, h } = bed, u = bed.u || S, floorY = y + h;
  const wood = theme === 'mahal' ? ['#5a3ab0', '#3a1d86', '#1f0e52'] : theme === 'shaadi' ? ['#e9e3fa', '#c9bfea', '#9a8fc9'] : ['#4a2a5e', '#331a45', '#1e0e2c'];
  const sheet = theme === 'mahal' ? ['#7a52d6', '#4a2aa0'] : theme === 'shaadi' ? ['#f4f1fd', '#d2c8f0'] : ['#ddd5f6', '#a99dd6'];
  // floor shadow
  const sg = ctx.createRadialGradient(x + w / 2, floorY + 4 * u, 0, x + w / 2, floorY + 4 * u, w * 0.62); sg.addColorStop(0, 'rgba(0,0,0,.55)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(x + w / 2, floorY + 4 * u, w * 0.62, 18 * u, 0, 0, 7); ctx.fill();
  // nightstand + props (bedroom)
  if (theme === 'bedroom' || theme === 'mahal') {
    const nw = 50 * u, nh = 64 * u, nx = x - nw - 18 * u, ny = floorY - nh;
    ctx.fillStyle = woodGrad(nx, 0, nx + nw, 0, wood); rr(ctx, nx, ny, nw, nh, 4 * u); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(nx, ny, nw, 4 * u);
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1.5 * u; rr(ctx, nx + 5 * u, ny + 12 * u, nw - 10 * u, 20 * u, 3 * u); ctx.stroke(); rr(ctx, nx + 5 * u, ny + 36 * u, nw - 10 * u, 20 * u, 3 * u); ctx.stroke();
    ctx.fillStyle = '#c7b0ff'; ctx.beginPath(); ctx.arc(nx + nw / 2, ny + 22 * u, 2.2 * u, 0, 7); ctx.arc(nx + nw / 2, ny + 46 * u, 2.2 * u, 0, 7); ctx.fill();
    // alarm clock
    const cx = nx + 16 * u, cy = ny - 13 * u;
    ctx.fillStyle = '#2a1a4a'; ctx.beginPath(); ctx.arc(cx - 8 * u, cy - 10 * u, 4 * u, 0, 7); ctx.arc(cx + 8 * u, cy - 10 * u, 4 * u, 0, 7); ctx.fill();
    ctx.fillStyle = '#5a46a0'; ctx.beginPath(); ctx.arc(cx, cy, 12 * u, 0, 7); ctx.fill();
    ctx.fillStyle = '#0a0620'; ctx.beginPath(); ctx.arc(cx, cy, 9.5 * u, 0, 7); ctx.fill();
    ctx.save(); ctx.shadowColor = `rgb(${ELEC})`; ctx.shadowBlur = 8 * u; ctx.fillStyle = `rgb(${ELEC})`; ctx.font = `800 ${6.5 * u}px Poppins`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(clockTime(), cx, cy + 0.5 * u); ctx.restore();
    ctx.fillStyle = 'rgba(127,212,255,.6)'; ctx.font = `700 ${3.5 * u}px Poppins`; ctx.textAlign = 'center'; ctx.fillText('AM', cx, cy + 6 * u);
    ctx.textBaseline = 'alphabetic';
    // glass of water
    const gx = nx + 36 * u, gy = ny - 18 * u;
    ctx.fillStyle = 'rgba(200,220,255,.18)'; ctx.beginPath(); ctx.moveTo(gx - 6 * u, gy); ctx.lineTo(gx + 6 * u, gy); ctx.lineTo(gx + 5 * u, gy + 18 * u); ctx.lineTo(gx - 5 * u, gy + 18 * u); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(127,212,255,.35)'; ctx.fillRect(gx - 5 * u, gy + 7 * u, 10 * u, 10.5 * u);
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1 * u; ctx.beginPath(); ctx.moveTo(gx - 6 * u, gy); ctx.lineTo(gx - 5 * u, gy + 18 * u); ctx.stroke();
  }
  // headboard
  const hbx = x - 14 * u, hbh = theme === 'mahal' ? 150 * u : 108 * u;
  ctx.fillStyle = woodGrad(hbx, 0, hbx + 22 * u, 0, wood);
  ctx.beginPath(); ctx.moveTo(hbx, floorY); ctx.lineTo(hbx, y - hbh + 14 * u); ctx.quadraticCurveTo(hbx, y - hbh, hbx + 11 * u, y - hbh); ctx.quadraticCurveTo(hbx + 22 * u, y - hbh, hbx + 22 * u, y - hbh + 14 * u); ctx.lineTo(hbx + 22 * u, floorY); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1.5 * u; rr(ctx, hbx + 5 * u, y - hbh + 18 * u, 12 * u, hbh - 30 * u, 4 * u); ctx.stroke();
  ctx.fillStyle = theme === 'mahal' ? '#c7b0ff' : wood[0]; ctx.beginPath(); ctx.arc(hbx + 11 * u, y - hbh - 4 * u, 6 * u, 0, 7); ctx.fill();
  // footboard
  const fbx = x + w - 8 * u;
  ctx.fillStyle = woodGrad(fbx, 0, fbx + 18 * u, 0, wood); rr(ctx, fbx, y - 38 * u, 18 * u, floorY - y + 38 * u, 5 * u); ctx.fill();
  ctx.fillStyle = theme === 'mahal' ? '#c7b0ff' : wood[0]; ctx.beginPath(); ctx.arc(fbx + 9 * u, y - 42 * u, 5 * u, 0, 7); ctx.fill();
  // legs
  for (const lx of [x + 10 * u, x + w - 26 * u]) { ctx.fillStyle = woodGrad(lx, 0, lx + 10 * u, 0, wood); ctx.fillRect(lx, y + 26 * u, 10 * u, floorY - y - 26 * u); ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(lx - 1 * u, y + 40 * u, 12 * u, 3 * u); }
  // side rail
  ctx.fillStyle = woodGrad(0, y + 16 * u, 0, y + 32 * u, wood); rr(ctx, x - 2 * u, y + 16 * u, w - 4 * u, 16 * u, 4 * u); ctx.fill();
  if (theme === 'mahal') { ctx.strokeStyle = '#c7b0ff'; ctx.lineWidth = 1.5 * u; rr(ctx, x + 2 * u, y + 19 * u, w - 12 * u, 10 * u, 3 * u); ctx.stroke(); }
  // mattress
  const mg = ctx.createLinearGradient(0, y - 4 * u, 0, y + 18 * u); mg.addColorStop(0, '#efeafc'); mg.addColorStop(1, '#a89cd8');
  ctx.fillStyle = mg; rr(ctx, x + 1 * u, y - 4 * u, w - 10 * u, 22 * u, 8 * u); ctx.fill();
  ctx.strokeStyle = 'rgba(116,58,232,.35)'; ctx.lineWidth = 1.2 * u; ctx.beginPath(); ctx.moveTo(x + 6 * u, y - 1 * u); ctx.lineTo(x + w - 14 * u, y - 1 * u); ctx.stroke();
  // bedsheet drape with folds
  const sh = ctx.createLinearGradient(0, y, 0, y + 40 * u); sh.addColorStop(0, sheet[0]); sh.addColorStop(1, sheet[1]);
  ctx.fillStyle = sh; ctx.beginPath(); ctx.moveTo(x - 2 * u, y + 2 * u); ctx.lineTo(x + w - 10 * u, y + 2 * u); ctx.lineTo(x + w - 9 * u, y + 34 * u);
  for (let xx = x + w - 9 * u; xx > x - 2 * u; xx -= 10 * u) ctx.quadraticCurveTo(xx - 5 * u, y + 38 * u + Math.sin(xx * 0.07) * 2 * u, xx - 10 * u, y + 34 * u);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(80,50,150,.22)'; ctx.lineWidth = 1.5 * u;
  for (let xx = x + 18 * u; xx < x + w - 20 * u; xx += 34 * u) { ctx.beginPath(); ctx.moveTo(xx, y + 6 * u); ctx.quadraticCurveTo(xx + 4 * u, y + 20 * u, xx - 2 * u, y + 34 * u); ctx.stroke(); }
  if (theme === 'shaadi') { ctx.fillStyle = P1; ctx.fillRect(x - 2 * u, y + 28 * u, w - 8 * u, 3 * u); }
  // chappal pair on floor (the weapon!)
  if (!(G.cine && G.cine.type === 'wake' && G.cine.t > 1.4)) {
    const cx2 = x + 28 * u, cy2 = floorY + 10 * u;
    for (const [dx, rot] of [[0, -0.25], [20 * u, 0.15]]) { ctx.save(); ctx.translate(cx2 + dx, cy2); ctx.rotate(rot); ctx.scale(1, 0.45);
      ctx.fillStyle = '#2a1a5a'; ctx.beginPath(); ctx.ellipse(0, 0, 7 * u, 15 * u, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#5a46a0'; ctx.beginPath(); ctx.ellipse(0, -1 * u, 6 * u, 13 * u, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = '#e9e1ff'; ctx.lineWidth = 2.2 * u; ctx.beginPath(); ctx.moveTo(-5 * u, 2 * u); ctx.lineTo(0, -8 * u); ctx.lineTo(5 * u, 2 * u); ctx.stroke(); ctx.restore(); }
  }
};

/* ---------- pillow ---------- */
function drawPillow(s, u) {
  const px = s.x - 6 * u, py = bed.y - 14 * u, pw = 92 * u, ph = 34 * u;
  ctx.fillStyle = 'rgba(40,20,90,.3)'; ctx.beginPath(); ctx.ellipse(px + 2 * u, py + ph * 0.42, pw * 0.5, ph * 0.22, 0, 0, 7); ctx.fill();
  const g = ctx.createLinearGradient(0, py - ph / 2, 0, py + ph / 2); g.addColorStop(0, '#fbfaff'); g.addColorStop(1, '#bdb2e6');
  ctx.fillStyle = g; ctx.beginPath();
  ctx.moveTo(px - pw / 2, py); ctx.bezierCurveTo(px - pw / 2 - 4 * u, py - ph / 2 - 2 * u, px - pw / 4, py - ph / 2 + 4 * u, px, py - ph / 2 + 3 * u);
  ctx.bezierCurveTo(px + pw / 4, py - ph / 2 + 4 * u, px + pw / 2 + 4 * u, py - ph / 2 - 2 * u, px + pw / 2, py);
  ctx.bezierCurveTo(px + pw / 2 + 4 * u, py + ph / 2 + 2 * u, px + pw / 4, py + ph / 2 - 3 * u, px, py + ph / 2 - 2 * u);
  ctx.bezierCurveTo(px - pw / 4, py + ph / 2 - 3 * u, px - pw / 2 - 4 * u, py + ph / 2 + 2 * u, px - pw / 2, py); ctx.fill();
  ctx.fillStyle = 'rgba(90,70,160,.22)'; ctx.beginPath(); ctx.ellipse(s.x + 2 * u, py - 2 * u, 24 * u, 8 * u, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(116,58,232,.25)'; ctx.lineWidth = 1 * u; ctx.beginPath(); ctx.moveTo(px - pw / 2 + 6 * u, py + 3 * u); ctx.quadraticCurveTo(px, py + 8 * u, px + pw / 2 - 6 * u, py + 3 * u); ctx.stroke();
}

/* ---------- blanket ---------- */
function profilePts(s, u, L, time) {
  const a = PROF[s.prevPose || s.pose], b = PROF[s.pose], k = s.poseT > 0 ? ease(1 - s.poseT / 0.7) : 1;
  const br = Math.sin(time * 1.7 + s.x * 0.01) * (s.wk ? 0 : 1), wig = s.wig > 0 ? Math.sin(s.wig * 40) * s.wig * 4 : 0;
  return b.map((p, i) => { const f = a[i][0] + (p[0] - a[i][0]) * k; let hgt = a[i][1] + (p[1] - a[i][1]) * k; if (i >= 1 && i <= 4) hgt *= 1 + br * 0.045; return [s.x + f * L, bed.y + (hgt + wig) * u]; });
}
function drawBlanket(s, u, L, pts) {
  const by = bed.y, bc = BLANKET[theme] || BLANKET.bedroom, drape = 30 * u;
  const x0 = s.x + 0.035 * L, last = pts[pts.length - 1];
  const path = () => {
    ctx.beginPath(); ctx.moveTo(x0, by - 4 * u);
    ctx.lineTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); }
    ctx.quadraticCurveTo(last[0] + 8 * u, last[1], last[0] + 6 * u, by + 4 * u);
    ctx.lineTo(last[0] + 7 * u, by + drape);
    for (let xx = last[0] + 7 * u; xx > x0 - 4 * u; xx -= 12 * u) ctx.quadraticCurveTo(xx - 6 * u, by + drape + 5 * u + Math.sin(xx * 0.09) * 2 * u, xx - 12 * u, by + drape + Math.sin(xx * 0.05) * 2 * u);
    ctx.lineTo(x0 - 4 * u, by - 2 * u); ctx.closePath();
  };
  ctx.save(); ctx.shadowColor = 'rgba(10,4,30,.55)'; ctx.shadowBlur = 14 * u; ctx.shadowOffsetY = 6 * u;
  const g = ctx.createLinearGradient(0, by - 50 * u, 0, by + drape); g.addColorStop(0, bc[0]); g.addColorStop(0.45, bc[1]); g.addColorStop(1, bc[2]);
  path(); ctx.fillStyle = g; ctx.fill(); ctx.restore();
  ctx.save(); path(); ctx.clip();
  // quilt stitching
  ctx.strokeStyle = 'rgba(255,255,255,.09)'; ctx.lineWidth = 1 * u; ctx.setLineDash([3 * u, 3 * u]);
  for (let i = -20; i < 40; i++) { const xx = x0 + i * 22 * u; ctx.beginPath(); ctx.moveTo(xx, by - 60 * u); ctx.lineTo(xx + 80 * u, by + drape); ctx.stroke(); ctx.beginPath(); ctx.moveTo(xx + 80 * u, by - 60 * u); ctx.lineTo(xx, by + drape); ctx.stroke(); }
  ctx.setLineDash([]);
  if (theme === 'gaon') { ctx.fillStyle = 'rgba(255,255,255,.3)'; for (let i = x0; i < last[0]; i += 14 * u) for (let j = by - 50 * u; j < by + drape; j += 12 * u) { ctx.beginPath(); ctx.arc(i + ((j / 12 | 0) % 2) * 7 * u, j, 1.5 * u, 0, 7); ctx.fill(); } }
  // body-shaped shading: folds following the contour
  ctx.strokeStyle = 'rgba(20,8,60,.28)'; ctx.lineWidth = 2.2 * u;
  for (const i of [2, 4, 6, 8]) { const p = pts[i]; if (!p) continue; ctx.beginPath(); ctx.moveTo(p[0] - 3 * u, p[1] + 6 * u); ctx.quadraticCurveTo(p[0] + 10 * u, (p[1] + by) / 2 + 6 * u, p[0] + 2 * u, by + drape - 4 * u); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 1.6 * u;
  for (const i of [3, 5, 7]) { const p = pts[i]; if (!p) continue; ctx.beginPath(); ctx.moveTo(p[0], p[1] + 8 * u); ctx.quadraticCurveTo(p[0] + 8 * u, (p[1] + by) / 2, p[0] + 3 * u, by - 2 * u); ctx.stroke(); }
  // mattress-edge crease + bottom shade
  const sh = ctx.createLinearGradient(0, by - 4 * u, 0, by + 10 * u); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(0.5, 'rgba(10,4,30,.35)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sh; ctx.fillRect(x0 - 10 * u, by - 4 * u, L + 30 * u, 14 * u);
  // border band
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x0 - 10 * u, by + drape - 7 * u, L + 30 * u, 3 * u);
  ctx.restore();
  // moon rim light on top contour
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(200,190,255,.35)'; ctx.lineWidth = 1.8 * u; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); } ctx.stroke(); ctx.restore();
}

/* ---------- limbs ---------- */
function limb(pts, w, skin, cloth, clothUntil) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(40,15,30,.45)'; ctx.lineWidth = w + 2.4 * S; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); ctx.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]); ctx.stroke();
  ctx.strokeStyle = skin; ctx.lineWidth = w; ctx.stroke();
  if (cloth) { ctx.strokeStyle = cloth; ctx.lineWidth = w + 2 * S; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); const t = clothUntil; ctx.lineTo(pts[0][0] + (pts[1][0] - pts[0][0]) * t, pts[0][1] + (pts[1][1] - pts[0][1]) * t); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = w * 0.25; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1] - w * 0.25); ctx.quadraticCurveTo(pts[1][0], pts[1][1] - w * 0.25, pts[2][0], pts[2][1] - w * 0.25); ctx.stroke();
}
function hand(x, y, r, skin, ang) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang || 0);
  ctx.fillStyle = 'rgba(40,15,30,.45)'; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.15, r * 0.95, 0, 0, 7); ctx.fill();
  ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.8, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(60,25,30,.35)'; ctx.lineWidth = 0.8 * S; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(r * 0.2, i * r * 0.35); ctx.lineTo(r * 0.95, i * r * 0.35); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.ellipse(-r * 0.2, -r * 0.3, r * 0.4, r * 0.2, 0, 0, 7); ctx.fill();
  ctx.restore();
}
function drawArm(s, u, L, time, front) {
  const sk = SKIN[s.kind] || SKIN.papa, cl = CLOTH[s.kind] || CLOTH.papa, by = bed.y, sleeve = cl[2] ? cl[0] : null;
  let sp, el, hd;
  if (s.pose === 'side') { if (front) return; sp = [s.x + 0.14 * L, by - 30 * u]; el = [s.x + 0.05 * L, by - 2 * u]; hd = [s.x - 6 * u, by - 2 * u]; }
  else if (s.pose === 'sprawl') { if (!front) return; const sw = Math.sin(time * 1.3) * 3 * u; sp = [s.x + 0.12 * L, by - 14 * u]; el = [s.x + 0.15 * L, by + 18 * u]; hd = [s.x + 0.18 * L + sw, by + 46 * u]; }
  else { if (!front) return; const top = f => { const pp = s._prof || []; for (let i = 0; i < pp.length - 1; i++) if (pp[i + 1][0] >= s.x + f * L) { const a = pp[i], b = pp[i + 1], k = (s.x + f * L - a[0]) / (b[0] - a[0] || 1); return a[1] + (b[1] - a[1]) * k; } return by - 25 * u; };
    sp = [s.x + 0.15 * L, top(0.15) + 3 * u]; el = [s.x + 0.25 * L, top(0.25) - 3 * u]; hd = [s.x + 0.36 * L, top(0.36) - 3 * u]; }
  if (s.scratch > 0 && s.pts[s.scratchAt]) { const t = s.pts[s.scratchAt], k = Math.min(1, s.scratch * 2), sx = s.x + t.x + Math.sin(time * 40) * 3 * u, sy = s.y + t.y + Math.cos(time * 37) * 2 * u; hd = [hd[0] + (sx - hd[0]) * k, hd[1] + (sy - hd[1]) * k]; el = [(sp[0] + hd[0]) / 2, Math.min(sp[1], hd[1]) - 22 * u * k]; }
  limb([sp, el, hd], 8.5 * u, sk, sleeve, 0.55);
  hand(hd[0], hd[1], 5.2 * u, sk, Math.atan2(hd[1] - el[1], hd[0] - el[0]));
}
function drawLeg(s, u, L, time) {
  if (s.pose !== 'sprawl' || (s.poseT > 0.35)) return;
  const sk = SKIN[s.kind] || SKIN.papa, cl = CLOTH[s.kind] || CLOTH.papa, by = bed.y, sw = Math.sin(time * 1.1) * 2 * u;
  const a = [s.x + 0.82 * L, by - 9 * u], b = [s.x + 0.97 * L, by - 11 * u], c = [s.x + 1.04 * L + sw, by + 24 * u];
  const paj = s.kind === 'papa' ? '#4a4a7a' : cl[1];
  ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(40,15,30,.45)'; ctx.lineWidth = 15 * u; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
  ctx.strokeStyle = paj; ctx.lineWidth = 13 * u; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.moveTo(a[0], a[1] - 4 * u); ctx.lineTo(b[0], b[1] - 4 * u); ctx.stroke();
  limb([b, [(b[0] + c[0]) / 2 + 2 * u, (b[1] + c[1]) / 2], c], 10 * u, sk, paj, 0.25);
  ctx.save(); ctx.translate(c[0], c[1]); ctx.rotate(0.3); ctx.fillStyle = 'rgba(40,15,30,.45)'; ctx.beginPath(); ctx.ellipse(4 * u, 4 * u, 10 * u, 5.5 * u, 0, 0, 7); ctx.fill(); ctx.fillStyle = sk; ctx.beginPath(); ctx.ellipse(4 * u, 4 * u, 9 * u, 4.5 * u, 0, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(60,25,30,.3)'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(11 * u, 1 * u + i * 2.2 * u, 1.1 * u, 0, 7); ctx.fill(); } ctx.restore();
}

/* ---------- faces ---------- */
function exprOf(s) {
  if (s.wk) return 'awake';
  if (s.scratch > 0 || s.bitten > 0) return 'itch';
  if (s.neend < 40) return 'restless';
  return 'calm';
}
function hairCap(kind, r, u) {
  // drawn in profile coords (facing +x, top = -y)
  const dark = '#1a1030';
  if (kind === 'dulha') {
    ctx.fillStyle = P1; ctx.beginPath(); ctx.ellipse(-r * 0.15, -r * 0.45, r * 1.15, r * 0.8, -0.2, Math.PI * 0.85, Math.PI * 2.05); ctx.fill();
    ctx.strokeStyle = P2; ctx.lineWidth = 2 * u; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(-r * 0.15, -r * 0.45 + i * 4 * u, r * 1.05, r * 0.6, -0.2, Math.PI * 1.05, Math.PI * 1.9); ctx.stroke(); }
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(r * 0.35, -r * 1.05, 3 * u, 0, 7); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6 * u; ctx.beginPath(); ctx.moveTo(r * 0.35, -r * 1.12); ctx.quadraticCurveTo(r * 0.5, -r * 1.7, r * 1.0, -r * 1.55); ctx.stroke();
    return;
  }
  const col = kind === 'dadi' ? '#e6e2f0' : kind === 'raja' ? '#120a20' : dark;
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, r * 1.04, Math.PI * 0.6, Math.PI * 1.62); ctx.quadraticCurveTo(r * 0.3, -r * 1.02, r * 0.42, -r * 0.84); ctx.quadraticCurveTo(-r * 0.05, -r * 0.62, -r * 0.3, -r * 0.1); ctx.quadraticCurveTo(-r * 0.45, r * 0.5, -r * 0.4, r * 0.88); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = kind === 'dadi' ? 'rgba(255,255,255,.6)' : 'rgba(154,109,245,.4)'; ctx.lineWidth = 1.2 * u;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(0, 0, r * (0.7 + i * 0.08), Math.PI * (1.05 + i * 0.04), Math.PI * (1.45 + i * 0.03)); ctx.stroke(); }
  if (kind === 'dadi' || kind === 'mummy') { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(-r * 1.05, -r * 0.35, r * 0.42, 0, 7); ctx.fill(); }
  if (kind === 'dost' || kind === 'bachcha') { ctx.fillStyle = col; for (let i = 0; i < 6; i++) { const a = Math.PI * (1.1 + i * 0.12); ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8); ctx.lineTo(Math.cos(a + 0.1) * r * 1.4, Math.sin(a + 0.1) * r * 1.4); ctx.lineTo(Math.cos(a + 0.22) * r * 0.85, Math.sin(a + 0.22) * r * 0.85); ctx.fill(); } }
  if (kind === 'dost') { ctx.strokeStyle = P1; ctx.lineWidth = 4 * u; ctx.beginPath(); ctx.arc(0, 0, r * 1.15, Math.PI * 1.15, Math.PI * 1.75); ctx.stroke(); ctx.fillStyle = P2; ctx.beginPath(); ctx.ellipse(-r * 0.1, r * 0.05, r * 0.3, r * 0.38, 0, 0, 7); ctx.fill(); }
  if (kind === 'raja') { ctx.fillStyle = '#e9e1ff'; ctx.beginPath(); ctx.moveTo(-r * 0.9, -r * 0.55); ctx.lineTo(-r * 0.95, -r * 1.25); ctx.lineTo(-r * 0.55, -r * 0.95); ctx.lineTo(-r * 0.3, -r * 1.45); ctx.lineTo(-r * 0.05, -r * 0.98); ctx.lineTo(r * 0.3, -r * 1.3); ctx.lineTo(r * 0.25, -r * 0.7); ctx.closePath(); ctx.fill(); ctx.fillStyle = P1; ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.95, 2.5 * u, 0, 7); ctx.fill(); }
}
function drawProfileHead(s, u, time) {
  const r = 23 * u, sk = SKIN[s.kind] || SKIN.papa, ex = exprOf(s), cl = CLOTH[s.kind] || CLOTH.papa;
  const sprawl = s.pose === 'sprawl', wake = s.wk || 0;
  ctx.save(); ctx.translate(s.x, s.y - wake * 18 * u); ctx.rotate(-Math.PI / 2 + (sprawl ? 0.28 : 0.06) + (s.wig > 0 ? Math.sin(s.wig * 50) * 0.08 : 0) + wake * 0.9);
  // neck + collar
  ctx.fillStyle = sk; rr(ctx, -7 * u, r * 0.5, 14 * u, r * 1.3, 6 * u); ctx.fill();
  ctx.fillStyle = cl[0]; rr(ctx, -9 * u, r * 1.35, 18 * u, r * 0.7, 5 * u); ctx.fill();
  if (s.kind === 'papa') { ctx.fillStyle = '#d8d4e8'; ctx.fillRect(-9 * u, r * 1.35, 18 * u, 2 * u); }
  // head base
  ctx.fillStyle = 'rgba(40,15,30,.45)'; ctx.beginPath(); ctx.arc(0, 0, r + 1.2 * u, 0, 7); ctx.ellipse(r * 0.45, r * 0.62, r * 0.6, r * 0.45, 0.3, 0, 7); ctx.fill();
  ctx.fillStyle = sk; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(r * 0.45, r * 0.62, r * 0.58, r * 0.42, 0.3, 0, 7); ctx.fill();
  // shading toward pillow side
  const sg = ctx.createLinearGradient(-r, 0, r, 0); sg.addColorStop(0, 'rgba(60,20,40,.35)'); sg.addColorStop(0.6, 'rgba(60,20,40,0)'); ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
  // cheek glow
  ctx.fillStyle = 'rgba(200,110,100,.18)'; ctx.beginPath(); ctx.arc(r * 0.45, r * 0.25, r * 0.28, 0, 7); ctx.fill();
  // stubble
  if (s.kind === 'papa' || s.kind === 'raja') { ctx.fillStyle = 'rgba(40,20,40,.16)'; ctx.beginPath(); ctx.ellipse(r * 0.55, r * 0.6, r * 0.42, r * 0.3, 0.3, 0, 7); ctx.fill(); }
  // ear
  ctx.fillStyle = sk; ctx.beginPath(); ctx.ellipse(-r * 0.12, r * 0.08, r * 0.2, r * 0.28, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(80,30,30,.5)'; ctx.lineWidth = 1 * u; ctx.beginPath(); ctx.arc(-r * 0.1, r * 0.08, r * 0.12, -1, 1.6); ctx.stroke();
  hairCap(s.kind, r, u);
  // nose
  ctx.fillStyle = sk; ctx.strokeStyle = 'rgba(70,30,30,.55)'; ctx.lineWidth = 1.1 * u;
  ctx.beginPath(); ctx.moveTo(r * 0.9, -r * 0.2); ctx.quadraticCurveTo(r * 1.38, r * 0.05, r * 0.95, r * 0.24); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(60,20,30,.6)'; ctx.beginPath(); ctx.arc(r * 1.02, r * 0.16, 1 * u, 0, 7); ctx.fill();
  // eyebrow
  ctx.strokeStyle = s.kind === 'dadi' ? '#cfc9dc' : '#1a1030'; ctx.lineWidth = 2.2 * u; ctx.lineCap = 'round'; ctx.beginPath();
  if (ex === 'awake') { ctx.moveTo(r * 0.42, -r * 0.62); ctx.lineTo(r * 0.85, -r * 0.42); }
  else if (ex === 'itch' || ex === 'restless') { ctx.moveTo(r * 0.42, -r * 0.5); ctx.lineTo(r * 0.85, -r * 0.6); }
  else { ctx.moveTo(r * 0.42, -r * 0.55); ctx.quadraticCurveTo(r * 0.65, -r * 0.66, r * 0.86, -r * 0.55); }
  ctx.stroke();
  // eye
  const ex0 = r * 0.63, ey0 = -r * 0.3;
  if (ex === 'awake') {
    ctx.save(); ctx.shadowColor = P2; ctx.shadowBlur = 12 * u; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(ex0, ey0, r * 0.2, r * 0.17, 0, 0, 7); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#1a0b4a'; ctx.beginPath(); ctx.arc(ex0 + r * 0.06, ey0, r * 0.09, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex0 + r * 0.09, ey0 - r * 0.04, r * 0.03, 0, 7); ctx.fill();
  } else if (ex === 'itch') {
    ctx.strokeStyle = '#2a1020'; ctx.lineWidth = 1.8 * u; ctx.beginPath(); ctx.moveTo(ex0 - r * 0.17, ey0 - r * 0.06); ctx.lineTo(ex0, ey0 + r * 0.04); ctx.lineTo(ex0 + r * 0.17, ey0 - r * 0.06); ctx.stroke();
  } else {
    ctx.strokeStyle = '#2a1020'; ctx.lineWidth = 1.7 * u; ctx.beginPath(); ctx.arc(ex0, ey0 - r * 0.06, r * 0.17, 0.25, Math.PI - 0.25); ctx.stroke();
    ctx.lineWidth = 1 * u; for (let i = 0; i < 3; i++) { const a = 0.6 + i * 0.45; ctx.beginPath(); ctx.moveTo(ex0 + Math.cos(a) * r * 0.17, ey0 - r * 0.06 + Math.sin(a) * r * 0.17); ctx.lineTo(ex0 + Math.cos(a) * r * 0.27, ey0 - r * 0.06 + Math.sin(a) * r * 0.27); ctx.stroke(); }
  }
  if (s.kind === 'dadi') { ctx.strokeStyle = 'rgba(220,220,240,.85)'; ctx.lineWidth = 1.2 * u; ctx.beginPath(); ctx.arc(ex0, ey0, r * 0.25, 0, 7); ctx.moveTo(ex0 - r * 0.25, ey0); ctx.lineTo(-r * 0.05, ey0 + r * 0.05); ctx.stroke(); }
  if (s.kind === 'mummy') { ctx.fillStyle = P1; ctx.beginPath(); ctx.arc(r * 0.82, -r * 0.62, 1.8 * u, 0, 7); ctx.fill(); }
  // mustache
  if (['papa', 'raja', 'dulha'].includes(s.kind)) {
    ctx.fillStyle = '#1a1030'; ctx.beginPath(); ctx.ellipse(r * 0.98, r * 0.36, r * 0.12, r * (s.kind === 'raja' ? 0.42 : 0.3), 0, 0, 7); ctx.fill();
    if (s.kind === 'raja') { ctx.strokeStyle = '#1a1030'; ctx.lineWidth = 2 * u; ctx.beginPath(); ctx.arc(r * 0.88, r * 0.82, r * 0.12, -1.5, 2); ctx.stroke(); ctx.beginPath(); ctx.arc(r * 0.88, -r * 0.08, r * 0.12, -2, 1.5); ctx.stroke(); }
  }
  // mouth
  const mx = r * 0.86, my = r * 0.55; ctx.lineCap = 'round';
  if (ex === 'awake') { ctx.fillStyle = '#3a1020'; ctx.beginPath(); ctx.ellipse(mx + r * 0.05, my, r * 0.12, r * 0.2, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(mx, my - r * 0.18, r * 0.12, r * 0.07); }
  else if (ex === 'itch' || ex === 'restless') { ctx.strokeStyle = '#3a1020'; ctx.lineWidth = 1.6 * u; ctx.beginPath(); ctx.moveTo(mx, my - r * 0.14); ctx.quadraticCurveTo(mx + r * 0.08, my - r * 0.04, mx, my + r * 0.02); ctx.quadraticCurveTo(mx + r * 0.08, my + r * 0.08, mx, my + r * 0.14); ctx.stroke(); }
  else {
    const open = sprawl || s.pose === 'back' ? 0.5 + 0.5 * Math.sin(time * 1.7 + s.x * 0.01) : 0;
    ctx.fillStyle = '#3a1020'; ctx.beginPath(); ctx.ellipse(mx + r * 0.04, my, r * 0.06 + open * r * 0.06, r * 0.1, 0, 0, 7); ctx.fill();
    if (sprawl) { ctx.strokeStyle = 'rgba(200,225,255,.7)'; ctx.lineWidth = 1.4 * u; ctx.beginPath(); ctx.moveTo(mx - r * 0.02, my + r * 0.08); ctx.quadraticCurveTo(mx - r * 0.3, my + r * 0.2, mx - r * 0.45, my + r * 0.12 + Math.sin(time * 2) * 2 * u); ctx.stroke(); }
  }
  // snot bubble — the universal "deep sleep" sign
  if (ex === 'calm' && state !== 'wake') {
    const ph = (time * 0.6 + s.x * 0.003) % 1, rb = (2 + 9 * Math.sin(ph * Math.PI)) * u * s.sc;
    if (ph < 0.92) {
      const bx = r * 1.22 + rb * 0.85, byy = r * 0.15;
      ctx.fillStyle = 'rgba(210,230,255,.28)'; ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1 * u;
      ctx.beginPath(); ctx.arc(bx, byy, rb, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc(bx - rb * 0.35, byy - rb * 0.35, rb * 0.22, 0, 7); ctx.fill();
    }
  }
  // sweat when restless
  if (ex === 'restless' || ex === 'itch') { ctx.fillStyle = 'rgba(180,220,255,.85)'; const sy = (time * 30) % 10; ctx.beginPath(); ctx.ellipse(r * 0.2, -r * 0.95 + sy * 0.3 * u, 2 * u, 3 * u, 0, 0, 7); ctx.fill(); }
  // bite bumps on face
  for (const mk of s.marks) if (mk.face) { ctx.fillStyle = 'rgba(196,96,82,.85)'; ctx.beginPath(); ctx.arc(r * 0.35 + (mk.x % 6), -r * 0.1 + (mk.y % 6), 2.6 * u, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(r * 0.33 + (mk.x % 6), -r * 0.14 + (mk.y % 6), 0.9 * u, 0, 7); ctx.fill(); }
  ctx.restore();
}
function drawFrontHead(s, u, time) {
  const r = 23 * u, sk = SKIN[s.kind] || SKIN.papa, ex = exprOf(s);
  ctx.save(); ctx.translate(s.x + 2 * u, s.y - 2 * u); ctx.rotate(-Math.PI / 2 + 0.12 + (s.wig > 0 ? Math.sin(s.wig * 50) * 0.08 : 0));
  const hairC = s.kind === 'dadi' ? '#e6e2f0' : '#1a1030';
  if (s.kind !== 'dulha') { ctx.fillStyle = hairC; ctx.beginPath(); ctx.ellipse(0, -r * 0.1, r * 1.08, r * 1.12, 0, 0, 7); ctx.fill(); }
  ctx.fillStyle = 'rgba(40,15,30,.45)'; ctx.beginPath(); ctx.ellipse(0, r * 0.08, r * 0.95, r * 1.08, 0, 0, 7); ctx.fill();
  ctx.fillStyle = sk; ctx.beginPath(); ctx.ellipse(0, r * 0.08, r * 0.9, r * 1.02, 0, 0, 7); ctx.fill();
  // squished cheek on pillow side (-x)
  ctx.beginPath(); ctx.ellipse(-r * 0.62, r * 0.42, r * 0.42, r * 0.36, 0, 0, 7); ctx.fill();
  const sg = ctx.createLinearGradient(-r, 0, r, 0); sg.addColorStop(0, 'rgba(60,20,40,.32)'); sg.addColorStop(0.5, 'rgba(60,20,40,0)'); ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(0, r * 0.08, r * 0.9, r * 1.02, 0, 0, 7); ctx.fill();
  // fringe / headgear
  if (s.kind === 'dulha') { ctx.fillStyle = P1; ctx.beginPath(); ctx.ellipse(0, -r * 0.55, r * 1.05, r * 0.6, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -r * 0.95, 3 * u, 0, 7); ctx.fill(); }
  else { ctx.fillStyle = hairC; ctx.beginPath(); ctx.ellipse(0, -r * 0.62, r * 0.9, r * 0.45, 0, Math.PI, 0); ctx.fill(); ctx.beginPath(); ctx.moveTo(-r * 0.6, -r * 0.6); ctx.quadraticCurveTo(-r * 0.1, -r * 0.2, r * 0.5, -r * 0.62); ctx.fill(); }
  if (s.kind === 'raja') { ctx.fillStyle = '#e9e1ff'; ctx.beginPath(); ctx.moveTo(-r * 0.6, -r * 0.85); ctx.lineTo(-r * 0.5, -r * 1.4); ctx.lineTo(-r * 0.2, -r * 1.05); ctx.lineTo(0, -r * 1.5); ctx.lineTo(r * 0.2, -r * 1.05); ctx.lineTo(r * 0.5, -r * 1.4); ctx.lineTo(r * 0.6, -r * 0.85); ctx.closePath(); ctx.fill(); }
  // ears
  ctx.fillStyle = sk; ctx.beginPath(); ctx.ellipse(r * 0.92, r * 0.05, r * 0.16, r * 0.24, 0, 0, 7); ctx.fill();
  // brows + eyes
  ctx.strokeStyle = s.kind === 'dadi' ? '#cfc9dc' : '#1a1030'; ctx.lineWidth = 2 * u; ctx.lineCap = 'round';
  for (const sx of [-1, 1]) {
    const exx = sx * r * 0.36, eyy = -r * 0.08;
    ctx.beginPath(); if (ex === 'itch' || ex === 'restless') { ctx.moveTo(exx - r * 0.16, eyy - r * 0.3 + sx * 2 * u); ctx.lineTo(exx + r * 0.16, eyy - r * 0.3 - sx * 2 * u); } else { ctx.moveTo(exx - r * 0.16, eyy - r * 0.28); ctx.quadraticCurveTo(exx, eyy - r * 0.38, exx + r * 0.16, eyy - r * 0.28); } ctx.stroke();
    ctx.lineWidth = 1.7 * u; ctx.beginPath();
    if (ex === 'itch') { ctx.moveTo(exx - r * 0.15, eyy - r * 0.05); ctx.lineTo(exx, eyy + r * 0.04); ctx.lineTo(exx + r * 0.15, eyy - r * 0.05); }
    else ctx.arc(exx, eyy - r * 0.05, r * 0.15, 0.3, Math.PI - 0.3);
    ctx.stroke(); ctx.lineWidth = 2 * u;
  }
  if (s.kind === 'dadi') { ctx.strokeStyle = 'rgba(220,220,240,.85)'; ctx.lineWidth = 1.2 * u; ctx.beginPath(); ctx.arc(-r * 0.36, -r * 0.1, r * 0.22, 0, 7); ctx.moveTo(-r * 0.14, -r * 0.1); ctx.arc(r * 0.36, -r * 0.1, r * 0.22, Math.PI, Math.PI * 3); ctx.stroke(); }
  if (s.kind === 'mummy') { ctx.fillStyle = P1; ctx.beginPath(); ctx.arc(0, -r * 0.42, 1.8 * u, 0, 7); ctx.fill(); }
  // nose
  ctx.strokeStyle = 'rgba(70,30,30,.55)'; ctx.lineWidth = 1.3 * u; ctx.beginPath(); ctx.moveTo(-r * 0.04, r * 0.05); ctx.quadraticCurveTo(r * 0.1, r * 0.28, -r * 0.08, r * 0.3); ctx.stroke();
  if (['papa', 'raja', 'dulha'].includes(s.kind)) { ctx.fillStyle = '#1a1030'; ctx.beginPath(); ctx.ellipse(0, r * 0.42, r * 0.26, r * 0.06, 0, 0, 7); ctx.fill(); }
  // mouth squished
  ctx.fillStyle = '#3a1020'; ctx.beginPath(); ctx.ellipse(-r * 0.12, r * 0.6, r * 0.12, r * 0.07, -0.3, 0, 7); ctx.fill();
  if (ex === 'calm') { ctx.strokeStyle = 'rgba(200,225,255,.7)'; ctx.lineWidth = 1.4 * u; ctx.beginPath(); ctx.moveTo(-r * 0.22, r * 0.64); ctx.quadraticCurveTo(-r * 0.45, r * 0.8, -r * 0.62, r * 0.75 + Math.sin(time * 2) * 2 * u); ctx.stroke(); }
  for (const mk of s.marks) if (mk.face) { ctx.fillStyle = 'rgba(196,96,82,.85)'; ctx.beginPath(); ctx.arc(r * 0.45 + (mk.x % 5), r * 0.3 + (mk.y % 5), 2.6 * u, 0, 7); ctx.fill(); }
  ctx.restore();
}
function drawSleepZ(s, u, time) {
  if (state !== 'play' && state !== 'menu' && state !== 'intro') return;
  const hx = s.x + 10 * u, hy = s.y - 30 * u, ex = exprOf(s);
  if (ex === 'calm') {
    for (let i = 0; i < 3; i++) {
      const k = (time * 0.4 + i / 3 + s.x * 0.002) % 1, a = Math.sin(k * Math.PI);
      ctx.save(); ctx.globalAlpha = a; ctx.translate(hx + k * 34 * u + Math.sin(k * 7) * 5 * u, hy - k * 60 * u); ctx.rotate(-0.2 + k * 0.3);
      ctx.font = `italic 900 ${(11 + k * 14) * u}px Poppins`; ctx.textAlign = 'center'; ctx.lineWidth = 3 * u; ctx.strokeStyle = 'rgba(40,12,110,.8)'; ctx.strokeText('Z', 0, 0);
      ctx.shadowColor = P2; ctx.shadowBlur = 10 * u; ctx.fillStyle = '#e9e1ff'; ctx.fillText('Z', 0, 0); ctx.restore();
    }
  } else if (state === 'play') {
    const L2 = { dadi: ['oh god…', 'ugh!', 'itchy…'], dost: ['5 more min…', 'ugh!', 'what…'], dulha: ['wedding…', 'ugh!', 'mummy…'], raja: ['guards…', 'ugh!', 'hmm!'], bachcha: ['mummaa…', 'ugh!', 'itchy…'] }[s.kind] || ['hmm…', 'ugh!', 'itchy…'];
    const t = ex === 'restless' ? '😣 waking up…' : L2[Math.floor(time * 1.5) % 3];
    ctx.font = `900 ${13 * u}px Poppins`; ctx.textAlign = 'center'; const w = ctx.measureText(t).width + 16 * u;
    ctx.fillStyle = 'rgba(255,255,255,.95)'; rr(ctx, hx + 10 * u - w / 2, hy - 30 * u, w, 22 * u, 11 * u); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx, hy - 9 * u); ctx.lineTo(hx + 6 * u, hy - 2 * u); ctx.lineTo(hx + 12 * u, hy - 9 * u); ctx.fill();
    ctx.fillStyle = '#2a1270'; ctx.fillText(t, hx + 10 * u, hy - 14 * u);
  }
}
window.drawPerson = function (s, time) {
  s.wk = (state === 'wake' || state === 'over') && G.cine && G.cine.type === 'wake' && G.wakeS === s ? clamp((G.cine.t - 0.7) / 0.25, 0, 1) : 0;
  if (G.cine && G.cine.type === 'morning') s.wk = clamp((G.cine.t - 0.8) / 0.5, 0, 1);
  if (s.walk) return drawWalker(s, time, s.wk);
  if (!s.pose) { s.pose = 'back'; s.marks = []; s.pts = posePts(s); }
  const u = S * s.sc, L = bodyLen(s);
  const dt = 1 / 60; if (s.poseT > 0) s.poseT -= dt; if (s.scratch > 0) s.scratch -= dt; for (const m of s.marks) m.t -= dt; s.marks = s.marks.filter(m => m.t > 0);
  drawPillow(s, u);
  const side = s.pose === 'side' && !(s.poseT > 0.35);
  if (side) drawArm(s, u, L, time, false);
  if (side) drawFrontHead(s, u, time); else drawProfileHead(s, u, time);
  const pts = profilePts(s, u, L, time); s._prof = pts;
  if (s.kOff > 0.02) { const ko = s.kOff, cl = (CLOTH[s.kind] || CLOTH.papa); ctx.fillStyle = s.kind === 'papa' ? '#4a4a7a' : cl[1]; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1] + 4 * u); for (const p of pts) ctx.lineTo(p[0], p[1] + 5 * u); ctx.lineTo(pts[pts.length - 1][0], bed.y + 2 * u); ctx.lineTo(pts[0][0], bed.y + 2 * u); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.translate(18 * u * ko, 44 * u * ko); ctx.globalAlpha = 1 - 0.25 * ko; drawBlanket(s, u, L, pts); ctx.restore(); } else drawBlanket(s, u, L, pts);
  drawLeg(s, u, L, time);
  if (!(s.poseT > 0.35)) drawArm(s, u, L, time, true);
  for (const mk of s.marks) if (!mk.face) { ctx.fillStyle = 'rgba(196,96,82,.85)'; ctx.beginPath(); ctx.arc(s.x + mk.x, s.y + mk.y, 2.6 * u, 0, 7); ctx.fill(); }
  drawSleepZ(s, u, time);
  if (G.sleepers.length > 1) { const w2 = 64 * S, ch = CHARS[s.cid] || CHARS[s.kind] || { e: '😴', n: s.kind }, sv = SENS(s), by = s.y - 64 * S; ctx.fillStyle = 'rgba(10,5,30,.8)'; rr(ctx, s.x - w2 / 2, by, w2, 9 * S, 4.5 * S); ctx.fill(); ctx.fillStyle = s.neend < 30 ? '#fff' : sv > 1.3 ? '#c7b0ff' : P2; rr(ctx, s.x - w2 / 2 + 1, by + 1, Math.max(4, (w2 - 2) * s.neend / 100), 7 * S, 3.5 * S); ctx.fill(); ctx.font = `800 ${8.5 * S}px Poppins`; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText(`${ch.e} ${ch.n}${sv > 1.3 ? ' ⚡' : ''}`, s.x, by - 5 * S); }
};

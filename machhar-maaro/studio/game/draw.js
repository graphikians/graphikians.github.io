/* ================= MACHHAR MAARO v3 — RENDER ================= */
function rr(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
  g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h);
  g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
}
/* ---------- backgrounds ---------- */
function starsBg(g, x, y, w, h, n) { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(255,255,255,${rnd(0.3, 1)})`; const s = rnd(0.8, 1.8) * S; g.fillRect(x + Math.random() * w, y + Math.random() * h, s, s); } }
function moon(g, mx, my, mr) {
  const mg = g.createRadialGradient(mx, my, 0, mx, my, mr * 4); mg.addColorStop(0, 'rgba(210,220,255,.5)'); mg.addColorStop(1, 'rgba(210,220,255,0)');
  g.fillStyle = mg; g.beginPath(); g.arc(mx, my, mr * 4, 0, 7); g.fill(); g.fillStyle = '#eef0ff'; g.beginPath(); g.arc(mx, my, mr, 0, 7); g.fill();
  g.fillStyle = 'rgba(160,165,210,.3)'; g.beginPath(); g.arc(mx - mr * .3, my - mr * .2, mr * .22, 0, 7); g.arc(mx + mr * .25, my + mr * .3, mr * .16, 0, 7); g.fill();
}
function beam(g, wx, wy, ww, wh, a) {
  g.save(); g.globalCompositeOperation = 'lighter';
  const gr = g.createLinearGradient(wx, wy, W * 0.3, H); gr.addColorStop(0, `rgba(140,130,255,${a})`); gr.addColorStop(1, 'rgba(140,130,255,0)');
  g.fillStyle = gr; g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx + ww, wy + wh); g.lineTo(W * 0.62, H); g.lineTo(W * 0.02, H); g.closePath(); g.fill(); g.restore();
}
function wallTex(g, col, n) { for (let i = 0; i < n; i++) { g.fillStyle = col.replace('A', (Math.random() * 0.03).toFixed(3)); g.fillRect(Math.random() * W, Math.random() * H * 0.72, rnd(20, 140) * S, rnd(20, 140) * S); } }
function floor(g, c1, c2) { const fy = H * 0.74, gr = g.createLinearGradient(0, fy, 0, H); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(0, fy, W, H - fy); g.fillStyle = 'rgba(154,109,245,.12)'; g.fillRect(0, fy, W, 2 * S); return fy; }
function buildBg() {
  bg = document.createElement('canvas'); bg.width = W * DPR; bg.height = H * DPR;
  const g = bg.getContext('2d'); g.scale(DPR, DPR);
  ({ gaon: bgGaon, hostel: bgHostel, shaadi: bgShaadi, mahal: bgMahal }[theme] || bgBedroom)(g);
  // soft depth blur pass
  try { const t = document.createElement('canvas'); t.width = bg.width; t.height = bg.height; const tg = t.getContext('2d'); tg.filter = `blur(${1.2 * DPR}px)`; tg.drawImage(bg, 0, 0); if (tg.filter !== 'none') bg = t; } catch (e) {}
}
function bgBedroom(g) {
  let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#170c3c'); gr.addColorStop(0.7, '#0d0727'); gr.addColorStop(1, '#07041a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  wallTex(g, 'rgba(154,109,245,A)', 70);
  // skirting + wallpaper stripes
  g.fillStyle = 'rgba(255,255,255,.015)'; for (let x = 0; x < W; x += 34 * S) g.fillRect(x, 0, 14 * S, H * 0.74);
  const fy = floor(g, '#1d1145', '#09051c');
  for (let x = 0; x < W; x += 60 * S) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x, fy, 1, H - fy); }
  const ww = Math.min(130 * S, W * 0.3), wh = ww * 1.25, wx = W - ww - 24 * S, wy = H * 0.15;
  gr = g.createLinearGradient(0, wy, 0, wy + wh); gr.addColorStop(0, '#0b1240'); gr.addColorStop(1, '#2c1a6c'); g.fillStyle = gr; g.fillRect(wx, wy, ww, wh);
  starsBg(g, wx, wy, ww, wh * 0.75, 30);
  g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip(); moon(g, wx + ww * 0.66, wy + wh * 0.28, 16 * S);
  g.fillStyle = '#120a33'; for (let x = wx; x < wx + ww; x += 14 * S) { const bh = rnd(15, 45) * S; g.fillRect(x, wy + wh - bh, 12 * S, bh); } g.restore();
  g.strokeStyle = 'rgba(80,60,150,.8)'; g.lineWidth = 1.5 * S; for (let x = wx + ww / 6; x < wx + ww; x += ww / 6) { g.beginPath(); g.moveTo(x, wy); g.lineTo(x, wy + wh); g.stroke(); }
  g.strokeStyle = '#3c2a78'; g.lineWidth = 7 * S; g.strokeRect(wx, wy, ww, wh); g.fillStyle = '#2a1a5a'; g.fillRect(wx - 10 * S, wy + wh, ww + 20 * S, 7 * S);
  G.curtain = { wx, wy, ww, wh };
  beam(g, wx, wy, ww, wh, 0.13);
  const aw = Math.min(88 * S, W * 0.22), ah = aw * 2.2, ax = 14 * S, ay = fy - ah + 6 * S;
  gr = g.createLinearGradient(ax, 0, ax + aw, 0); gr.addColorStop(0, '#3a3e66'); gr.addColorStop(0.5, '#4a4f7c'); gr.addColorStop(1, '#2a2d50'); g.fillStyle = gr; rr(g, ax, ay, aw, ah, 4 * S); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2 * S; g.beginPath(); g.moveTo(ax + aw / 2, ay + 6 * S); g.lineTo(ax + aw / 2, ay + ah - 6 * S); g.stroke();
  g.fillStyle = '#9aa0d0'; g.fillRect(ax + aw / 2 - 7 * S, ay + ah * 0.45, 3 * S, 16 * S); g.fillRect(ax + aw / 2 + 4 * S, ay + ah * 0.45, 3 * S, 16 * S);
  g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(ax + 6 * S, ay + 8 * S, 5 * S, ah - 16 * S);
  const cx2 = ax + aw + 26 * S, cy2 = H * 0.24, cw = 38 * S, ch = 50 * S;
  g.fillStyle = '#d6cff2'; g.fillRect(cx2, cy2, cw, ch); g.fillStyle = P1; g.fillRect(cx2, cy2, cw, 12 * S);
  g.fillStyle = '#3a2a6e'; g.font = `800 ${9 * S}px Poppins`; g.textAlign = 'center'; g.fillText('2026', cx2 + cw / 2, cy2 + ch * 0.52);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) g.fillRect(cx2 + 5 * S + c * 8 * S, cy2 + 30 * S + r * 6 * S, 4 * S, 3 * S);
  g.fillStyle = '#2b2552'; g.fillRect(W * 0.5 - 50 * S, H * 0.13, 100 * S, 7 * S); g.fillStyle = '#4a4580'; rr(g, W * 0.5 - 46 * S, H * 0.13 + 6 * S, 92 * S, 5 * S, 2.5 * S); g.fill();
  g.fillStyle = '#cfc8ea'; rr(g, cx2, H * 0.5, 34 * S, 22 * S, 3 * S); g.fill(); g.fillStyle = '#6a5aa8'; for (let i = 0; i < 3; i++) g.fillRect(cx2 + 5 * S + i * 9 * S, H * 0.5 + 6 * S, 5 * S, 10 * S);
}
function bgGaon(g) {
  let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#22122e'); gr.addColorStop(0.7, '#140a1c'); gr.addColorStop(1, '#0a0510'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(150,100,90,${Math.random() * 0.04})`; g.beginPath(); g.arc(Math.random() * W, Math.random() * H * 0.72, rnd(10, 60) * S, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.2 * S;
  for (let i = 0; i < 7; i++) { let x = Math.random() * W, y = Math.random() * H * 0.6; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += rnd(-12, 12) * S; y += rnd(6, 16) * S; g.lineTo(x, y); } g.stroke(); }
  floor(g, '#2a1820', '#0c060c');
  const ww = Math.min(110 * S, W * 0.28), wh = ww, wx = W - ww - 30 * S, wy = H * 0.18;
  gr = g.createLinearGradient(0, wy, 0, wy + wh); gr.addColorStop(0, '#081038'); gr.addColorStop(1, '#1c1a5a'); g.fillStyle = gr; g.fillRect(wx, wy, ww, wh);
  starsBg(g, wx, wy, ww, wh * 0.7, 45);
  g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip(); moon(g, wx + ww * 0.3, wy + wh * 0.3, 11 * S);
  g.fillStyle = '#0a0a1c'; for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(wx + ww * 0.7 + rnd(-20, 20) * S, wy + wh * 0.62 + rnd(-14, 10) * S, rnd(12, 20) * S, 0, 7); g.fill(); }
  g.fillRect(wx + ww * 0.68, wy + wh * 0.7, 6 * S, wh * 0.3); g.fillRect(wx, wy + wh * 0.88, ww, wh * 0.12); g.restore();
  g.strokeStyle = '#3a2418'; g.lineWidth = 3 * S; for (let x = wx + ww / 4; x < wx + ww - 2; x += ww / 4) { g.beginPath(); g.moveTo(x, wy); g.lineTo(x, wy + wh); g.stroke(); }
  g.strokeStyle = '#4a2e1e'; g.lineWidth = 9 * S; g.strokeRect(wx, wy, ww, wh);
  beam(g, wx, wy, ww, wh, 0.08);
  const lx = W * 0.22, ly = H * 0.33; G.lamp = { x: lx, y: ly };
  g.strokeStyle = '#555'; g.lineWidth = 1.5 * S; g.beginPath(); g.moveTo(lx, ly - 40 * S); g.lineTo(lx, ly - 22 * S); g.stroke();
  g.fillStyle = '#3a3a48'; rr(g, lx - 14 * S, ly - 24 * S, 28 * S, 7 * S, 3 * S); g.fill(); rr(g, lx - 15 * S, ly + 14 * S, 30 * S, 9 * S, 3 * S); g.fill();
  g.fillStyle = 'rgba(255,190,150,.25)'; rr(g, lx - 11 * S, ly - 18 * S, 22 * S, 33 * S, 9 * S); g.fill();
  g.fillStyle = '#ff9a6a'; g.beginPath(); g.ellipse(lx, ly, 3.5 * S, 7 * S, 0, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(lx, ly + 1.5 * S, 1.5 * S, 3.5 * S, 0, 0, 7); g.fill();
  const fy = H * 0.74, mx = 50 * S, my = fy + 14 * S;
  gr = g.createRadialGradient(mx - 8 * S, my - 10 * S, 2 * S, mx, my, 34 * S); gr.addColorStop(0, '#8a4a34'); gr.addColorStop(1, '#3a1a14'); g.fillStyle = gr; g.beginPath(); g.ellipse(mx, my, 30 * S, 28 * S, 0, 0, 7); g.fill();
  g.fillStyle = '#2a120e'; g.beginPath(); g.ellipse(mx, my - 26 * S, 13 * S, 5 * S, 0, 0, 7); g.fill();
  const px = W * 0.42, py = H * 0.2; g.fillStyle = '#5a3420'; g.fillRect(px, py, 46 * S, 56 * S); g.fillStyle = '#c9bfe0'; g.fillRect(px + 5 * S, py + 5 * S, 36 * S, 46 * S);
  g.fillStyle = '#6a5a8a'; g.beginPath(); g.arc(px + 23 * S, py + 22 * S, 8 * S, 0, 7); g.fill(); g.fillRect(px + 12 * S, py + 32 * S, 22 * S, 16 * S);
  g.fillStyle = '#3a2418'; g.fillRect(16 * S, H * 0.5, 96 * S, 5 * S);
  for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#8a90b8' : '#a8aed4'; g.beginPath(); g.ellipse(30 * S + i * 22 * S, H * 0.5 - 9 * S, 9 * S, 10 * S, 0, 0, 7); g.fill(); }
}
function bgHostel(g) {
  let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#101c3c'); gr.addColorStop(0.7, '#0a1128'); gr.addColorStop(1, '#050816'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  wallTex(g, 'rgba(127,160,255,A)', 50);
  const fy = floor(g, '#16224a', '#060a1a');
  g.strokeStyle = 'rgba(255,255,255,.05)'; g.lineWidth = 1;
  for (let x = 0; x < W; x += 40 * S) { g.beginPath(); g.moveTo(x, fy); g.lineTo(x - 30 * S, H); g.stroke(); }
  for (let y = fy + 20 * S; y < H; y += 26 * S) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  const ww = Math.min(130 * S, W * 0.3), wh = ww * 1.1, wx = W - ww - 22 * S, wy = H * 0.14;
  gr = g.createLinearGradient(0, wy, 0, wy + wh); gr.addColorStop(0, '#0a1240'); gr.addColorStop(1, '#25206a'); g.fillStyle = gr; g.fillRect(wx, wy, ww, wh);
  starsBg(g, wx, wy, ww, wh * 0.4, 18);
  g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip();
  for (let x = wx; x < wx + ww; x += 18 * S) { const bh = rnd(40, 85) * S; g.fillStyle = '#0c0f2c'; g.fillRect(x, wy + wh - bh, 16 * S, bh);
    for (let yy = wy + wh - bh + 5 * S; yy < wy + wh - 4 * S; yy += 8 * S) for (let xx = x + 3 * S; xx < x + 14 * S; xx += 5 * S) if (Math.random() < 0.35) { g.fillStyle = Math.random() < 0.5 ? 'rgba(160,210,255,.8)' : 'rgba(199,176,255,.8)'; g.fillRect(xx, yy, 2.2 * S, 3 * S); } }
  g.restore();
  g.strokeStyle = '#3a4a80'; g.lineWidth = 6 * S; g.strokeRect(wx, wy, ww, wh); g.lineWidth = 3 * S; g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.stroke();
  beam(g, wx, wy, ww, wh, 0.1);
  const p1x = W * 0.36, p1y = H * 0.17;
  g.fillStyle = P1; g.fillRect(p1x, p1y, 54 * S, 70 * S); g.fillStyle = '#fff'; g.font = `900 ${12 * S}px Poppins`; g.textAlign = 'center'; g.fillText('FOCUS', p1x + 27 * S, p1y + 30 * S);
  g.font = `700 ${7 * S}px Poppins`; g.fillText('TOPPER BANO', p1x + 27 * S, p1y + 44 * S);
  g.fillStyle = '#d9d3f5'; g.fillRect(p1x + 62 * S, p1y + 14 * S, 40 * S, 50 * S); g.fillStyle = '#2a3a80'; g.beginPath(); g.arc(p1x + 82 * S, p1y + 34 * S, 11 * S, 0, 7); g.fill();
  const bx = 14 * S, by = H * 0.3, bw2 = Math.min(84 * S, W * 0.21);
  g.fillStyle = '#25305e'; g.fillRect(bx, by, bw2, 150 * S);
  const cols = ['#743ae8', '#9a6df5', '#4f6bd8', '#d9d3f5', '#3a2a6e', '#7fb0ff'];
  for (let row = 0; row < 3; row++) { const yy = by + 8 * S + row * 48 * S; g.fillStyle = '#1a2246'; g.fillRect(bx + 4 * S, yy + 38 * S, bw2 - 8 * S, 4 * S);
    for (let x = bx + 6 * S; x < bx + bw2 - 10 * S; x += rnd(7, 11) * S) { const h = rnd(24, 36) * S; g.fillStyle = cols[(Math.random() * cols.length) | 0]; g.fillRect(x, yy + 38 * S - h, rnd(5, 8) * S, h); } }
  g.fillStyle = '#26305a'; g.fillRect(W * 0.5 - 50 * S, H * 0.11, 100 * S, 7 * S); g.fillStyle = '#46508a'; rr(g, W * 0.5 - 46 * S, H * 0.11 + 6 * S, 92 * S, 5 * S, 2.5 * S); g.fill();
  const tx = W - 120 * S, ty = H * 0.62;
  g.save(); g.globalCompositeOperation = 'lighter'; const lg = g.createRadialGradient(tx + 40 * S, ty - 20 * S, 0, tx + 40 * S, ty - 20 * S, 110 * S); lg.addColorStop(0, 'rgba(110,180,255,.28)'); lg.addColorStop(1, 'rgba(110,180,255,0)'); g.fillStyle = lg; g.fillRect(tx - 80 * S, ty - 130 * S, 240 * S, 240 * S); g.restore();
  g.fillStyle = '#2a2448'; g.fillRect(tx - 20 * S, ty, 140 * S, 8 * S); g.fillRect(tx - 14 * S, ty + 8 * S, 6 * S, 60 * S); g.fillRect(tx + 108 * S, ty + 8 * S, 6 * S, 60 * S);
  g.save(); g.translate(tx + 40 * S, ty); g.transform(1, 0, -0.25, 1, 0, 0); g.fillStyle = '#1a1a2e'; g.fillRect(-26 * S, -36 * S, 52 * S, 34 * S); g.fillStyle = '#8fc8ff'; g.fillRect(-23 * S, -33 * S, 46 * S, 28 * S); g.restore();
}
function bgShaadi(g) {
  let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#1a0d40'); gr.addColorStop(0.75, '#0e0728'); gr.addColorStop(1, '#06031a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // tent drapes
  const n = Math.ceil(W / (60 * S));
  for (let i = 0; i < n; i++) { const x = i * 60 * S; gr = g.createLinearGradient(x, 0, x + 60 * S, 0); gr.addColorStop(0, i % 2 ? '#3a1d86' : '#e8e2fa'); gr.addColorStop(0.5, i % 2 ? '#4a2aa0' : '#ffffff'); gr.addColorStop(1, i % 2 ? '#2a1460' : '#cfc6ee');
    g.globalAlpha = i % 2 ? 0.55 : 0.12; g.fillStyle = gr; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 60 * S, 0); g.lineTo(x + 54 * S, H * 0.74); g.lineTo(x + 6 * S, H * 0.74); g.closePath(); g.fill(); }
  g.globalAlpha = 1;
  // top scallops
  for (let x = 0; x < W; x += 40 * S) { g.fillStyle = '#4a2aa0'; g.beginPath(); g.arc(x + 20 * S, 0, 22 * S, 0, Math.PI); g.fill(); }
  // string lights
  for (let row = 0; row < 3; row++) { const y0 = H * (0.08 + row * 0.07); g.strokeStyle = 'rgba(255,255,255,.2)'; g.lineWidth = 1; g.beginPath();
    for (let x = 0; x <= W; x += 10 * S) g.lineTo(x, y0 + Math.sin(x / W * Math.PI * 3) * 18 * S); g.stroke();
    for (let x = 8 * S; x < W; x += 26 * S) { const y = y0 + Math.sin(x / W * Math.PI * 3) * 18 * S + 4 * S, c = ['255,255,255', '127,212,255', '199,176,255'][((x / (26 * S)) | 0) % 3];
      const rg = g.createRadialGradient(x, y, 0, x, y, 12 * S); rg.addColorStop(0, `rgba(${c},.9)`); rg.addColorStop(1, `rgba(${c},0)`); g.fillStyle = rg; g.beginPath(); g.arc(x, y, 12 * S, 0, 7); g.fill(); } }
  // mogra garlands
  for (const gx of [W * 0.12, W * 0.88]) for (let y = 0; y < H * 0.6; y += 9 * S) { g.fillStyle = 'rgba(245,245,255,.85)'; g.beginPath(); g.arc(gx + Math.sin(y * 0.05) * 3 * S, y, 3.5 * S, 0, 7); g.fill(); }
  floor(g, '#24124e', '#0a0520');
  // stacked chairs + DJ speaker
  const cx = W - 70 * S, cy = H * 0.74;
  for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#c9c2e6' : '#ece8fb'; g.fillRect(cx - 20 * S, cy - 40 * S - i * 10 * S, 40 * S, 6 * S); }
  g.fillStyle = '#c9c2e6'; g.fillRect(cx - 20 * S, cy - 40 * S, 4 * S, 40 * S); g.fillRect(cx + 16 * S, cy - 40 * S, 4 * S, 40 * S);
  g.fillStyle = '#14102a'; rr(g, 16 * S, H * 0.5, 54 * S, 110 * S, 6 * S); g.fill();
  for (const yy of [H * 0.5 + 30 * S, H * 0.5 + 80 * S]) { g.fillStyle = '#2a2450'; g.beginPath(); g.arc(43 * S, yy, 18 * S, 0, 7); g.fill(); g.fillStyle = '#0a0818'; g.beginPath(); g.arc(43 * S, yy, 8 * S, 0, 7); g.fill(); }
  g.fillStyle = '#fff'; g.font = `900 ${8 * S}px Poppins`; g.textAlign = 'center'; g.fillText('DJ', 43 * S, H * 0.5 + 8 * S);
  // banner
  g.fillStyle = P1; rr(g, W / 2 - 70 * S, H * 0.25, 140 * S, 34 * S, 8 * S); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 1.5 * S; rr(g, W / 2 - 66 * S, H * 0.25 + 4 * S, 132 * S, 26 * S, 6 * S); g.stroke();
  g.fillStyle = '#fff'; g.font = `800 ${11 * S}px Poppins`; g.fillText('SHUBH VIVAH', W / 2, H * 0.25 + 22 * S);
}
function bgMahal(g) {
  let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#12062e'); gr.addColorStop(0.7, '#0a0420'); gr.addColorStop(1, '#040112'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // giant window arch with moon
  const aw = Math.min(W * 0.5, 220 * S), ax = W / 2 - aw / 2, ay = H * 0.12, ah = H * 0.4;
  g.save(); g.beginPath(); g.moveTo(ax, ay + ah); g.lineTo(ax, ay + aw / 2); g.arc(W / 2, ay + aw / 2, aw / 2, Math.PI, 0); g.lineTo(ax + aw, ay + ah); g.closePath(); g.clip();
  gr = g.createLinearGradient(0, ay, 0, ay + ah); gr.addColorStop(0, '#1a1060'); gr.addColorStop(1, '#3a1d86'); g.fillStyle = gr; g.fillRect(ax, ay, aw, ah);
  starsBg(g, ax, ay, aw, ah * 0.6, 60); moon(g, W / 2, ay + aw * 0.4, 30 * S);
  g.fillStyle = '#0a0420'; for (let i = 0; i < 6; i++) { const x = ax + i * aw / 6, h = rnd(30, 90) * S; g.fillRect(x, ay + ah - h, aw / 7, h); g.beginPath(); g.moveTo(x, ay + ah - h); g.lineTo(x + aw / 14, ay + ah - h - 16 * S); g.lineTo(x + aw / 7, ay + ah - h); g.fill(); }
  g.restore();
  g.strokeStyle = '#c7b0ff'; g.lineWidth = 4 * S; g.beginPath(); g.moveTo(ax, ay + ah); g.lineTo(ax, ay + aw / 2); g.arc(W / 2, ay + aw / 2, aw / 2, Math.PI, 0); g.lineTo(ax + aw, ay + ah); g.stroke();
  beam(g, ax + aw * 0.2, ay + aw * 0.4, aw * 0.6, ah * 0.6, 0.12);
  // pillars
  for (const px of [W * 0.06, W * 0.94 - 30 * S]) { gr = g.createLinearGradient(px, 0, px + 30 * S, 0); gr.addColorStop(0, '#2a1860'); gr.addColorStop(0.5, '#5a3ab0'); gr.addColorStop(1, '#1a0e40'); g.fillStyle = gr; g.fillRect(px, H * 0.08, 30 * S, H * 0.66); g.fillStyle = '#c7b0ff'; g.fillRect(px - 6 * S, H * 0.08, 42 * S, 8 * S); g.fillRect(px - 6 * S, H * 0.72, 42 * S, 8 * S); }
  // chandelier
  const cx = W / 2, cy = H * 0.07; g.strokeStyle = 'rgba(199,176,255,.6)'; g.lineWidth = 1.5 * S; g.beginPath(); g.moveTo(cx, 0); g.lineTo(cx, cy); g.stroke();
  for (let i = -3; i <= 3; i++) { const x = cx + i * 16 * S, y = cy + Math.abs(i) * -3 * S + 10 * S; const rg = g.createRadialGradient(x, y, 0, x, y, 10 * S); rg.addColorStop(0, 'rgba(255,255,255,.9)'); rg.addColorStop(1, 'rgba(199,176,255,0)'); g.fillStyle = rg; g.beginPath(); g.arc(x, y, 10 * S, 0, 7); g.fill(); }
  floor(g, '#1a0e40', '#05021a');
  for (let x = 0; x < W; x += 50 * S) for (let y = H * 0.74; y < H; y += 25 * S) { g.fillStyle = ((x / (50 * S) + y / (25 * S)) | 0) % 2 ? 'rgba(199,176,255,.05)' : 'rgba(0,0,0,.15)'; g.fillRect(x, y, 50 * S, 25 * S); }
  // red→purple carpet
  g.fillStyle = 'rgba(116,58,232,.35)'; g.beginPath(); g.moveTo(W / 2 - 40 * S, H * 0.74); g.lineTo(W / 2 + 40 * S, H * 0.74); g.lineTo(W / 2 + 120 * S, H); g.lineTo(W / 2 - 120 * S, H); g.fill();
}

/* ---------- people ---------- */
function drawFan() {
  const cx = W / 2, cy = H * 0.055, r = Math.min(W * 0.36, 150 * S);
  if (theme === 'mahal' || theme === 'shaadi') return;
  ctx.fillStyle = '#2a2050'; ctx.fillRect(cx - 2 * S, 0, 4 * S, cy);
  ctx.save(); ctx.translate(cx, cy); ctx.scale(1, 0.22);
  for (let k = 0; k < 4; k++) { ctx.globalAlpha = k === 0 ? 0.55 : 0.12;
    for (let i = 0; i < 3; i++) { ctx.save(); ctx.rotate(G.fan - k * 0.09 + i * 2.094); ctx.fillStyle = theme === 'gaon' ? '#3a2a3a' : '#3d2f78'; ctx.beginPath(); ctx.ellipse(r * 0.55, 0, r * 0.48, 16 * S, 0, 0, 7); ctx.fill(); ctx.restore(); } }
  ctx.restore(); ctx.globalAlpha = 1;
  ctx.fillStyle = '#4a3c8c'; ctx.beginPath(); ctx.ellipse(cx, cy, 16 * S, 9 * S, 0, 0, 7); ctx.fill();
  // moving blade shadows on wall
  ctx.save(); ctx.globalAlpha = 0.06; ctx.fillStyle = '#000'; ctx.translate(cx, H * 0.22); ctx.scale(1, 0.35);
  for (let i = 0; i < 3; i++) { ctx.save(); ctx.rotate(G.fan * 0.5 + i * 2.094); ctx.beginPath(); ctx.ellipse(r * 0.9, 0, r * 0.8, 40 * S, 0, 0, 7); ctx.fill(); ctx.restore(); }
  ctx.restore();
}
function drawBedFrame() {
  const { x, y, w, h } = bed;
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h + 6 * S, w * 0.55, 10 * S, 0, 0, 7); ctx.fill();
  if (theme === 'gaon') {
    ctx.fillStyle = '#4a2c1c'; for (const lx of [x + 6 * S, x + w - 14 * S]) ctx.fillRect(lx, y + 4 * S, 9 * S, h * 0.95);
    ctx.fillStyle = '#6a4028'; rr(ctx, x, y + 2 * S, w, 9 * S, 3 * S); ctx.fill(); rr(ctx, x, y + 20 * S, w, 7 * S, 3 * S); ctx.fill();
    ctx.strokeStyle = 'rgba(220,190,160,.35)'; ctx.lineWidth = 1.3 * S;
    for (let i = x; i < x + w; i += 9 * S) { ctx.beginPath(); ctx.moveTo(i, y + 6 * S); ctx.lineTo(i + 12 * S, y + 22 * S); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i + 12 * S, y + 6 * S); ctx.lineTo(i, y + 22 * S); ctx.stroke(); }
    ctx.fillStyle = '#3b2a5a'; rr(ctx, x + 10 * S, y - 3 * S, w - 20 * S, 8 * S, 4 * S); ctx.fill();
  } else if (theme === 'hostel') {
    ctx.fillStyle = '#4a5488'; for (const lx of [x, x + w - 8 * S]) ctx.fillRect(lx, y - 150 * S, 8 * S, h + 150 * S);
    ctx.fillStyle = '#39427a'; rr(ctx, x, y - 120 * S, w, 10 * S, 3 * S); ctx.fill(); ctx.fillStyle = '#2b3466'; rr(ctx, x + 6 * S, y - 136 * S, w - 12 * S, 16 * S, 6 * S); ctx.fill();
    ctx.strokeStyle = '#5a64a0'; ctx.lineWidth = 3 * S; const lx = x + w - 30 * S;
    ctx.beginPath(); ctx.moveTo(lx, y - 110 * S); ctx.lineTo(lx, y); ctx.moveTo(lx + 18 * S, y - 110 * S); ctx.lineTo(lx + 18 * S, y); ctx.stroke();
    for (let ry = y - 95 * S; ry < y; ry += 22 * S) { ctx.beginPath(); ctx.moveTo(lx, ry); ctx.lineTo(lx + 18 * S, ry); ctx.stroke(); }
    ctx.fillStyle = '#39427a'; rr(ctx, x, y + 6 * S, w, h * 0.55, 4 * S); ctx.fill(); ctx.fillStyle = '#3a4a8a'; rr(ctx, x + 6 * S, y - 4 * S, w - 12 * S, 14 * S, 6 * S); ctx.fill();
  } else if (theme === 'shaadi') {
    ctx.fillStyle = '#e8e2fa'; rr(ctx, x - 4 * S, y - 2 * S, w + 8 * S, 22 * S, 8 * S); ctx.fill();
    ctx.fillStyle = P1; ctx.fillRect(x - 4 * S, y + 12 * S, w + 8 * S, 4 * S);
    for (let i = x; i < x + w; i += 18 * S) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(i + 9 * S, y + 22 * S, 4 * S, 0, 7); ctx.fill(); }
  } else if (theme === 'mahal') {
    const gr = ctx.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#5a3ab0'); gr.addColorStop(1, '#2a1460');
    ctx.fillStyle = gr; rr(ctx, x, y + 4 * S, w, h * 0.6, 8 * S); ctx.fill();
    ctx.strokeStyle = '#c7b0ff'; ctx.lineWidth = 2 * S; rr(ctx, x + 4 * S, y + 8 * S, w - 8 * S, h * 0.6 - 8 * S, 6 * S); ctx.stroke();
    ctx.fillStyle = '#3a1d86'; rr(ctx, x - 10 * S, y - 90 * S, 20 * S, h * 0.6 + 94 * S, 8 * S); ctx.fill(); ctx.fillStyle = '#c7b0ff'; ctx.beginPath(); ctx.arc(x, y - 92 * S, 9 * S, 0, 7); ctx.fill();
    ctx.fillStyle = '#4a2aa0'; rr(ctx, x + 6 * S, y - 4 * S, w - 12 * S, 16 * S, 7 * S); ctx.fill();
  } else {
    ctx.fillStyle = '#1e1238'; ctx.fillRect(x + 8 * S, y + h * 0.5, 8 * S, h * 0.6); ctx.fillRect(x + w - 16 * S, y + h * 0.5, 8 * S, h * 0.6);
    const gr = ctx.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#3a2466'); gr.addColorStop(1, '#22143f'); ctx.fillStyle = gr; rr(ctx, x, y + 6 * S, w, h * 0.62, 6 * S); ctx.fill();
    ctx.fillStyle = '#2b1a50'; rr(ctx, x - 6 * S, y - 46 * S, 14 * S, h * 0.62 + 52 * S, 5 * S); ctx.fill();
    ctx.fillStyle = '#4b3c8a'; rr(ctx, x + 6 * S, y - 4 * S, w - 12 * S, 16 * S, 7 * S); ctx.fill();
  }
}
const BLANKET = { bedroom: [P2, P1, '#3e1c96'], gaon: ['#5a6ac0', '#3d4a9a', '#24306a'], hostel: ['#4a6ad0', '#2e4a9a', '#1a2a6a'], shaadi: ['#c7b0ff', '#9a6df5', '#5b3fc4'], mahal: ['#9a6df5', '#5a2fb0', '#2a0f6e'] };
function drawHead(kind, hx, hy, sc, wk, bitten, time) {
  const hr = 19 * S * sc;
  if (kind === 'dadi' || kind === 'mummy') { ctx.fillStyle = kind === 'dadi' ? '#d8d4e4' : '#1a1030'; ctx.beginPath(); ctx.arc(hx - 18 * S * sc, hy - 6 * S * sc, 9 * S * sc, 0, 7); ctx.fill(); }
  ctx.fillStyle = kind === 'dost' || kind === 'bachcha' ? '#c48a68' : '#b98262'; ctx.beginPath(); ctx.arc(hx, hy, hr, 0, 7); ctx.fill();
  ctx.fillStyle = '#a06c50'; ctx.beginPath(); ctx.arc(hx + 16 * S * sc, hy - 2 * S * sc, 5 * S * sc, 0, 7); ctx.fill();
  const hair = (col, a0, a1) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(hx - 4 * S * sc, hy - 5 * S * sc, hr * 0.97, Math.PI * a0, Math.PI * a1); ctx.lineTo(hx - 4 * S * sc, hy - 5 * S * sc); ctx.fill(); };
  if (kind === 'papa' || kind === 'raja') { hair('#1a1030', 0.95, 1.75); ctx.fillStyle = '#20142e'; ctx.beginPath(); ctx.ellipse(hx + 10 * S * sc, hy + 6 * S * sc, (kind === 'raja' ? 13 : 9) * S * sc, 3 * S * sc, 0.2, 0, 7); ctx.fill(); }
  if (kind === 'raja') { ctx.fillStyle = '#e9e1ff'; ctx.beginPath(); ctx.moveTo(hx - 16 * S, hy - 14 * S); ctx.lineTo(hx - 12 * S, hy - 30 * S); ctx.lineTo(hx - 4 * S, hy - 20 * S); ctx.lineTo(hx + 2 * S, hy - 32 * S); ctx.lineTo(hx + 8 * S, hy - 20 * S); ctx.lineTo(hx + 14 * S, hy - 28 * S); ctx.lineTo(hx + 14 * S, hy - 14 * S); ctx.closePath(); ctx.fill(); ctx.fillStyle = P1; ctx.beginPath(); ctx.arc(hx + 1 * S, hy - 20 * S, 2.5 * S, 0, 7); ctx.fill(); }
  if (kind === 'dadi') { hair('#e4e0ee', 0.9, 1.8); }
  if (kind === 'mummy') { hair('#1a1030', 0.9, 1.8); ctx.fillStyle = P1; ctx.beginPath(); ctx.arc(hx + 8 * S * sc, hy - 13 * S * sc, 2 * S * sc, 0, 7); ctx.fill(); }
  if (kind === 'dulha') { ctx.fillStyle = P1; ctx.beginPath(); ctx.ellipse(hx - 6 * S, hy - 10 * S, 22 * S, 15 * S, -0.3, Math.PI, 0); ctx.fill(); ctx.fillStyle = P2; ctx.beginPath(); ctx.ellipse(hx - 6 * S, hy - 12 * S, 18 * S, 9 * S, -0.3, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(hx - 2 * S, hy - 22 * S, 3 * S, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5 * S; ctx.beginPath(); ctx.moveTo(hx - 2 * S, hy - 24 * S); ctx.quadraticCurveTo(hx + 6 * S, hy - 36 * S, hx + 10 * S, hy - 30 * S); ctx.stroke(); }
  if (kind === 'dost' || kind === 'bachcha') { ctx.fillStyle = '#120a20'; for (let i = 0; i < 7; i++) { const a = Math.PI * 0.85 + i * 0.16; ctx.beginPath(); ctx.moveTo(hx + Math.cos(a) * hr * 0.7, hy + Math.sin(a) * hr * 0.7); ctx.lineTo(hx + Math.cos(a) * hr * 1.35, hy + Math.sin(a) * hr * 1.35 - 3 * S); ctx.lineTo(hx + Math.cos(a + 0.12) * hr * 0.8, hy + Math.sin(a + 0.12) * hr * 0.8); ctx.fill(); } hair('#120a20', 0.95, 1.7);
    if (kind === 'dost') { ctx.strokeStyle = P1; ctx.lineWidth = 4 * S; ctx.beginPath(); ctx.arc(hx - 2 * S, hy, hr + 3 * S, Math.PI * 1.05, Math.PI * 1.65); ctx.stroke(); ctx.fillStyle = P2; ctx.beginPath(); ctx.ellipse(hx - 14 * S, hy + 2 * S, 6 * S, 8 * S, 0, 0, 7); ctx.fill(); } }
  if (kind !== 'dost' && kind !== 'dulha') { ctx.fillStyle = '#e0c2b0'; ctx.beginPath(); ctx.arc(hx - 12 * S * sc, hy + 1 * S * sc, 4 * S * sc, 0, 7); ctx.fill(); }
  if (wk) {
    ctx.save(); ctx.shadowColor = P2; ctx.shadowBlur = 14 * S; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(hx + 6 * S * sc, hy - 5 * S * sc, 5.5 * S * sc, 0, 7); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#2a0f6e'; ctx.beginPath(); ctx.arc(hx + 7 * S * sc, hy - 5 * S * sc, 2.4 * S * sc, 0, 7); ctx.fill();
    ctx.strokeStyle = '#1a1030'; ctx.lineWidth = 2.5 * S; ctx.beginPath(); ctx.moveTo(hx + 1 * S, hy - 13 * S); ctx.lineTo(hx + 12 * S, hy - 10 * S); ctx.stroke();
    ctx.fillStyle = '#3a1020'; ctx.beginPath(); ctx.ellipse(hx + 9 * S * sc, hy + 11 * S * sc, 5 * S * sc, 4 * S * sc * wk, 0, 0, 7); ctx.fill();
  } else {
    ctx.strokeStyle = '#3a2030'; ctx.lineWidth = 2 * S * sc; ctx.beginPath();
    if (bitten) { ctx.moveTo(hx + 2 * S * sc, hy - 8 * S * sc); ctx.lineTo(hx + 10 * S * sc, hy - 4 * S * sc); ctx.moveTo(hx + 2 * S * sc, hy - 2 * S * sc); ctx.lineTo(hx + 10 * S * sc, hy - 5 * S * sc); }
    else ctx.arc(hx + 6 * S * sc, hy - 6 * S * sc, 4 * S * sc, 0.2, Math.PI - 0.2);
    ctx.stroke();
    if (kind === 'dadi') { ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1.5 * S; ctx.beginPath(); ctx.arc(hx + 6 * S, hy - 5 * S, 6 * S, 0, 7); ctx.stroke(); }
  }
}
function drawPerson(s, time) {
  const wk = (state === 'wake' || state === 'over') && G.cine && G.cine.type === 'wake' && G.wakeS === s ? clamp((G.cine.t - 0.7) / 0.25, 0, 1) : 0;
  if (s.walk) return drawWalker(s, time, wk);
  const br = Math.sin(time * 1.7 + s.x) * 2.6 * S * (wk ? 0 : 1) * s.sc, y = bed.y, wig = Math.sin(s.wig * 30) * s.wig * 6 * S;
  ctx.fillStyle = '#d9d2f5'; ctx.beginPath(); ctx.ellipse(s.x - 4 * S, s.y + 10 * S, 34 * S * s.sc, 12 * S * s.sc, -0.05, 0, 7); ctx.fill();
  const bx0 = s.x + 22 * S * s.sc + wig, bx1 = s.end, top = y - 34 * S * s.sc - br, bc = BLANKET[theme] || BLANKET.bedroom;
  const gr = ctx.createLinearGradient(0, top, 0, y + 14 * S); gr.addColorStop(0, bc[0]); gr.addColorStop(0.5, bc[1]); gr.addColorStop(1, bc[2]);
  ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(bx0, y + 12 * S);
  ctx.bezierCurveTo(bx0 - 6 * S, top + 6 * S, bx0 + 30 * S, top - 4 * S, bx0 + (bx1 - bx0) * 0.35, top + 2 * S);
  ctx.bezierCurveTo(bx0 + (bx1 - bx0) * 0.6, top + 10 * S, bx0 + (bx1 - bx0) * 0.75, top - 2 * S, bx1 - 26 * S, top + 8 * S);
  ctx.quadraticCurveTo(bx1 + 4 * S, top + 14 * S, bx1, y + 14 * S); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.clip();
  if (theme === 'gaon') { ctx.fillStyle = 'rgba(255,255,255,.35)'; for (let i = bx0; i < bx1; i += 14 * S) for (let j = top; j < y + 14 * S; j += 12 * S) { ctx.beginPath(); ctx.arc(i + ((j / 12 | 0) % 2) * 7 * S, j, 1.6 * S, 0, 7); ctx.fill(); } }
  else if (theme === 'hostel') { ctx.fillStyle = 'rgba(255,255,255,.12)'; for (let i = bx0; i < bx1; i += 22 * S) ctx.fillRect(i, top - 10 * S, 8 * S, 80 * S); }
  else { ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 2 * S; for (let i = 1; i < 4; i++) { const fx = bx0 + (bx1 - bx0) * i / 4; ctx.beginPath(); ctx.moveTo(fx, top + 12 * S); ctx.quadraticCurveTo(fx + 12 * S, y - 10 * S, fx + 4 * S, y + 8 * S); ctx.stroke(); } }
  const sh = ctx.createLinearGradient(0, top, 0, y); sh.addColorStop(0, 'rgba(255,255,255,.18)'); sh.addColorStop(0.4, 'rgba(255,255,255,0)'); ctx.fillStyle = sh; ctx.fillRect(bx0, top - 10 * S, bx1 - bx0, 40 * S);
  ctx.restore();
  ctx.fillStyle = bc[1]; ctx.beginPath(); ctx.ellipse(bx1 - 18 * S, top + 10 * S, 16 * S * s.sc, 12 * S * s.sc, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#b07a5c'; ctx.lineWidth = 8 * S * s.sc; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(bx0 + 10 * S, top + 14 * S);
  if (s.arm) ctx.quadraticCurveTo(bx0 + 10 * S, top - 20 * S, bx0 + 30 * S, top - 14 * S - br); else ctx.quadraticCurveTo(bx0 + 40 * S * s.sc, top + 4 * S - br, bx0 + 66 * S * s.sc, top + 10 * S - br);
  ctx.stroke();
  drawHead(s.kind, s.x, s.y - wk * 30 * S, s.sc, wk, s.bitten > 0, time);
  if (!wk) sleepText(s, time);
  if (G.sleepers.length > 1) { const w2 = 60 * S; ctx.fillStyle = 'rgba(10,5,30,.7)'; rr(ctx, s.x - w2 / 2, s.y - 52 * S, w2, 7 * S, 3.5 * S); ctx.fill(); ctx.fillStyle = s.neend < 30 ? '#fff' : P2; rr(ctx, s.x - w2 / 2 + 1, s.y - 51 * S, Math.max(4, (w2 - 2) * s.neend / 100), 5 * S, 2.5 * S); ctx.fill(); }
}
function sleepText(s, time) {
  if (state !== 'play') return;
  const hx = s.x, hy = s.y;
  if (s.bitten <= 0) { ctx.textAlign = 'center'; for (let i = 0; i < 3; i++) { const k = ((time * 0.45 + i / 3 + s.x * 0.01) % 1); ctx.globalAlpha = Math.sin(k * Math.PI) * 0.9; ctx.fillStyle = '#d9ccff'; ctx.font = `800 ${(10 + k * 12) * S * s.sc}px Poppins`; ctx.fillText('z', hx + 14 * S + k * 26 * S + Math.sin(k * 6) * 4 * S, hy - 22 * S - k * 50 * S); } ctx.globalAlpha = 1; }
  else { ctx.fillStyle = '#fff'; ctx.font = `900 ${15 * S}px Poppins`; ctx.textAlign = 'center'; const L = { dadi: ['oh god…', 'ugh!', 'itchy…'], dost: ['5 more min…', 'ugh!', 'what…'], dulha: ['wedding…', 'ugh!', 'mummy…'], raja: ['guards…', 'ugh!', 'hmm!'], bachcha: ['mummaa…', 'ugh!', 'itchy…'] }[s.kind] || ['hmm…', 'ugh!', 'itchy…']; ctx.fillText(L[Math.floor(time * 1.5) % 3], hx + 30 * S, hy - 26 * S); }
}
function drawWalker(s, time, wk) {
  const x = s.x, y = s.y, st = Math.sin(time * 4) * (wk ? 0 : 1), d = s.dir;
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x, y + 120 * S, 34 * S, 8 * S, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#2a1a4a'; ctx.lineWidth = 9 * S; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 4 * S, y + 72 * S); ctx.lineTo(x - 4 * S + st * 14 * S, y + 118 * S); ctx.moveTo(x + 6 * S, y + 72 * S); ctx.lineTo(x + 6 * S - st * 14 * S, y + 118 * S); ctx.stroke();
  const bc = BLANKET[theme] || BLANKET.bedroom; const gr = ctx.createLinearGradient(0, y, 0, y + 80 * S); gr.addColorStop(0, bc[0]); gr.addColorStop(1, bc[2]);
  ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x - 24 * S, y + 14 * S); ctx.quadraticCurveTo(x, y + 4 * S, x + 26 * S, y + 14 * S); ctx.lineTo(x + 30 * S, y + 82 * S); ctx.lineTo(x - 30 * S, y + 82 * S); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#b07a5c'; ctx.lineWidth = 7 * S; ctx.beginPath(); ctx.moveTo(x + 10 * S * d, y + 26 * S); ctx.lineTo(x + 50 * S * d, y + 24 * S + st * 3 * S); ctx.moveTo(x - 4 * S * d, y + 28 * S); ctx.lineTo(x + 40 * S * d, y + 32 * S - st * 3 * S); ctx.stroke();
  ctx.save(); if (d < 0) { ctx.translate(2 * x, 0); ctx.scale(-1, 1); } drawHead(s.kind, x, y - wk * 10 * S, 1, wk, s.bitten > 0, time); ctx.restore();
  if (state === 'play') { ctx.fillStyle = '#d9ccff'; ctx.font = `800 ${13 * S}px Poppins`; ctx.textAlign = 'center'; ctx.fillText(s.bitten > 0 ? 'uff!' : 'zzz… 🚶', x, y - 32 * S); }
}
function drawNet() {
  if (theme !== 'gaon' || CL.task === 'sleepwalk') return;
  const { x, y, w } = bed, ty = y - 120 * S;
  ctx.strokeStyle = '#6a4028'; ctx.lineWidth = 3 * S; ctx.beginPath(); ctx.moveTo(x + 4 * S, y); ctx.lineTo(x + 4 * S, ty); ctx.moveTo(x + w - 4 * S, y); ctx.lineTo(x + w - 4 * S, ty); ctx.stroke();
  ctx.fillStyle = 'rgba(230,230,255,.05)'; ctx.beginPath(); ctx.moveTo(x + 4 * S, ty); ctx.lineTo(x + w - 4 * S, ty); ctx.lineTo(x + w + 6 * S, y + 4 * S); ctx.lineTo(x - 6 * S, y + 4 * S); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(230,230,255,.08)'; ctx.lineWidth = 1;
  for (let i = x - 20 * S; i < x + w + 20 * S; i += 6 * S) { ctx.beginPath(); ctx.moveTo(i, ty); ctx.lineTo(i, y + 4 * S); ctx.stroke(); }
  for (let j = ty; j < y; j += 6 * S) { ctx.beginPath(); ctx.moveTo(x - 10 * S, j); ctx.lineTo(x + w + 10 * S, j); ctx.stroke(); }
  ctx.restore();
}

/* ---------- mosquitoes ---------- */
function wings(s, m, big) {
  const f = Math.sin(m.flap) * 0.9;
  ctx.fillStyle = 'rgba(225,230,255,.42)'; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 0.8 * s;
  for (const off of [-0.15, 0.25]) { ctx.save(); ctx.rotate(-1.1 + f * 0.8 + off); ctx.beginPath(); ctx.ellipse(-8 * s, 0, (big ? 11 : 10) * s, (big ? 3.8 : 3.4) * s, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
}
function drawMosq(m, time) {
  if (m.boss) return drawBoss(m, time);
  const c = MT[m.t], s = m.size * S * 1.3;
  let alpha = 1;
  if (m.t === 'ninja' || m.t === 'chameleon') { const d = Math.hypot(m.x - ptr.x, m.y - ptr.y); alpha = ptr.vis > 0 ? clamp(1 - (d - 70 * S) / (90 * S), m.t === 'chameleon' ? 0.07 : 0.1, 1) : (m.t === 'chameleon' ? 0.07 : 0.1); if (m.hurt > 0) alpha = 1; }
  if (m.t === 'ghost') alpha = m.solid ? 1 : 0.22;
  // motion trail
  if (m.trail && m.trail.length > 2 && m.state === 'fly' && alpha > 0.5) { ctx.strokeStyle = `rgba(199,176,255,${0.18 * alpha})`; ctx.lineWidth = 3 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(m.x, m.y); for (const p of m.trail) ctx.lineTo(p[0], p[1]); ctx.stroke(); }
  if (m.t === 'heera') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 50 * S); g.addColorStop(0, 'rgba(255,255,255,.7)'); g.addColorStop(0.4, 'rgba(199,176,255,.4)'); g.addColorStop(1, 'rgba(154,109,245,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(m.x, m.y, 50 * S, 0, 7); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5 * S; for (let i = 0; i < 4; i++) { const a = time * 4 + i * 1.57; ctx.beginPath(); ctx.moveTo(m.x + Math.cos(a) * 20 * S, m.y + Math.sin(a) * 20 * S); ctx.lineTo(m.x + Math.cos(a) * 34 * S, m.y + Math.sin(a) * 34 * S); ctx.stroke(); }
    ctx.restore(); ctx.font = `900 ${11 * S}px Poppins`; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText(`💎 ${Math.max(0, m.life).toFixed(1)}s`, m.x, m.y - 40 * S); }
  // real clone shadow
  if (m.t === 'clone' && !m.decoy) { ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(m.x, m.y + 26 * s, 12 * s, 3 * s, 0, 0, 7); ctx.fill(); }
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(m.x, m.y);
  const auraC = m.t === 'ghost' && m.solid ? '255,255,255' : m.frozen > 0 ? '127,212,255' : '154,109,245';
  const ag = ctx.createRadialGradient(0, 0, 0, 0, 0, 26 * s); ag.addColorStop(0, `rgba(${auraC},${m.fed > 0 || m.t === 'ghost' ? .45 : .22})`); ag.addColorStop(1, `rgba(${auraC},0)`);
  ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(0, 0, 26 * s, 0, 7); ctx.fill();
  if (m.kami === 1) { ctx.strokeStyle = `rgba(255,255,255,${0.5 + Math.sin(time * 40) * 0.5})`; ctx.lineWidth = 2 * S; ctx.beginPath(); ctx.arc(0, 0, 22 * s, 0, 7); ctx.stroke(); }
  if (m.healFx > 0) { m.healFx -= 0.016; ctx.strokeStyle = `rgba(255,255,255,${m.healFx})`; ctx.lineWidth = 2 * S; ctx.beginPath(); ctx.arc(0, 0, (1 - m.healFx) * 150 * S, 0, 7); ctx.stroke(); }
  ctx.scale(m.dir, 1); ctx.rotate(m.state === 'bite' ? 0.5 : clamp(m.vy / (m.sp || 1), -1, 1) * 0.5);
  if (m.hurt > 0) ctx.translate(Math.sin(m.ph * 90) * 2 * S, 0);
  if (m.t === 'vampire') { ctx.fillStyle = '#1a0630'; ctx.beginPath(); ctx.moveTo(-2 * s, -3 * s); ctx.quadraticCurveTo(-20 * s, -2 * s, -24 * s, 10 * s); ctx.lineTo(-6 * s, 4 * s); ctx.closePath(); ctx.fill(); }
  ctx.strokeStyle = 'rgba(30,20,50,.9)'; ctx.lineWidth = 1.2 * s;
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-2 * s + i * 3 * s, 3 * s); ctx.quadraticCurveTo(-6 * s + i * 4 * s, 12 * s, -12 * s + i * 7 * s, 16 * s); ctx.stroke(); }
  const fat = 1 + m.fed * 0.7;
  ctx.fillStyle = m.fed > 0 ? '#8a5cf0' : m.frozen > 0 ? '#9fd8ff' : c.body;
  if (m.t === 'chameleon') ctx.fillStyle = `hsl(${250 + Math.sin(time * 2) * 20},40%,20%)`;
  ctx.beginPath(); ctx.ellipse(-10 * s, 2 * s, 10 * s * fat, 4.2 * s * fat, 0.25, 0, 7); ctx.fill();
  ctx.strokeStyle = m.t === 'doctor' ? 'rgba(116,58,232,.6)' : 'rgba(230,225,255,.55)'; ctx.lineWidth = 1.2 * s;
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-14 * s + i * 4 * s, -2 * s * fat); ctx.lineTo(-15 * s + i * 4 * s, 5 * s * fat); ctx.stroke(); }
  if (m.t === 'split') { ctx.setLineDash([2 * s, 2 * s]); ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-10 * s, -5 * s); ctx.lineTo(-10 * s, 7 * s); ctx.stroke(); ctx.setLineDash([]); }
  if (m.t === 'doctor') { ctx.fillStyle = P1; ctx.fillRect(-12 * s, 0, 6 * s, 2 * s); ctx.fillRect(-10 * s, -2 * s, 2 * s, 6 * s); }
  const dark = ['ninja', 'mafia', 'chameleon', 'kallu'].includes(m.t);
  ctx.fillStyle = dark ? '#1a1428' : m.t === 'doctor' ? '#d9d3f5' : '#4a3d78'; ctx.beginPath(); ctx.ellipse(0, 0, 5 * s, 4.2 * s, 0, 0, 7); ctx.fill();
  ctx.fillStyle = dark ? '#1a1428' : m.t === 'doctor' ? '#e9e1ff' : '#5a4b8e'; ctx.beginPath(); ctx.arc(6 * s, -1 * s, 3.4 * s, 0, 7); ctx.fill();
  if (m.t === 'ninja') { ctx.fillStyle = P1; ctx.fillRect(3 * s, -3 * s, 7 * s, 2 * s); ctx.strokeStyle = P1; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(3 * s, -2 * s); ctx.lineTo(-3 * s, -6 * s + Math.sin(m.ph * 20) * 2 * s); ctx.stroke(); }
  // eyes
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(7.2 * s, -2 * s, (m.t === 'bachcha' ? 2.2 : 1.6) * s, 0, 7); ctx.fill();
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(7.7 * s, -2 * s, 0.8 * s, 0, 7); ctx.fill();
  if (m.t === 'sust') { ctx.fillStyle = c.body; ctx.fillRect(5.4 * s, -4 * s, 3.6 * s, 2 * s); }
  if (!['normal', 'bachcha', 'sust'].includes(m.t)) { ctx.strokeStyle = '#000'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(5.6 * s, -4.2 * s); ctx.lineTo(9 * s, -3 * s); ctx.stroke(); }
  // accessories
  switch (m.t) {
    case 'kallu': NASHA.acc(s, m, time); break;
    case 'helmet': if (m.hp >= 2) { ctx.fillStyle = '#8a90b8'; ctx.beginPath(); ctx.arc(6 * s, -2 * s, 4.6 * s, Math.PI * 1.02, Math.PI * 2.05); ctx.fill(); ctx.fillStyle = '#c0c6e8'; ctx.fillRect(1.5 * s, -2.4 * s, 9.5 * s, 1.2 * s); } break;
    case 'rani': ctx.fillStyle = '#e9e1ff'; ctx.beginPath(); ctx.moveTo(3 * s, -4 * s); ctx.lineTo(4 * s, -8 * s); ctx.lineTo(6 * s, -5.5 * s); ctx.lineTo(8 * s, -8.5 * s); ctx.lineTo(9 * s, -4 * s); ctx.closePath(); ctx.fill(); break;
    case 'shieldwala': ctx.fillStyle = '#c0c6e8'; ctx.beginPath(); ctx.ellipse(13 * s, 0, 2.5 * s, 7 * s, 0, 0, 7); ctx.fill(); ctx.strokeStyle = P1; ctx.lineWidth = 1 * s; ctx.stroke(); break;
    case 'commander': ctx.fillStyle = '#2a2a4a'; ctx.fillRect(2 * s, -7 * s, 8 * s, 3 * s); ctx.fillRect(4 * s, -6 * s, 9 * s, 1.2 * s); ctx.fillStyle = '#e9e1ff'; ctx.beginPath(); ctx.arc(6 * s, -6 * s, 1 * s, 0, 7); ctx.fill(); break;
    case 'mafia': ctx.fillStyle = '#0a0812'; ctx.fillRect(1.5 * s, -6.5 * s, 9 * s, 2.5 * s); ctx.fillRect(3.5 * s, -9 * s, 5 * s, 3 * s); ctx.fillStyle = '#000'; ctx.fillRect(5 * s, -3 * s, 5 * s, 1.6 * s); break;
    case 'bomber': ctx.fillStyle = '#0a0812'; ctx.beginPath(); ctx.arc(0, 8 * s, 3.4 * s, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = .8 * s; ctx.beginPath(); ctx.moveTo(1 * s, 5 * s); ctx.lineTo(3 * s, 3 * s); ctx.stroke(); break;
    case 'batterychor': ctx.fillStyle = '#4fa9e8'; ctx.fillRect(-4 * s, 6 * s, 6 * s, 3.5 * s); ctx.fillStyle = '#fff'; ctx.fillRect(2 * s, 7 * s, 1 * s, 1.5 * s); break;
    case 'electric': ctx.strokeStyle = `rgba(${ELEC},.9)`; ctx.lineWidth = 1 * s; for (let i = 0; i < 3; i++) { const a = time * 9 + i * 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 8 * s, Math.sin(a) * 8 * s); ctx.lineTo(Math.cos(a + .4) * 12 * s, Math.sin(a + .4) * 10 * s); ctx.stroke(); } break;
    case 'timefreeze': ctx.strokeStyle = '#fff'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.arc(0, -10 * s, 3 * s, 0, 7); ctx.moveTo(0, -10 * s); ctx.lineTo(0, -12 * s); ctx.moveTo(0, -10 * s); ctx.lineTo(1.5 * s, -10 * s); ctx.stroke(); break;
    case 'teleporter': ctx.strokeStyle = `rgba(199,176,255,.7)`; ctx.lineWidth = 1 * s; ctx.beginPath(); for (let a = 0; a < 9; a += 0.4) ctx.lineTo(Math.cos(a + time * 5) * a * 1.4 * s - 8 * s, Math.sin(a + time * 5) * a * 1.4 * s); ctx.stroke(); break;
    case 'leader': ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(-4 * s, -3 * s); ctx.lineTo(-4 * s, -14 * s); ctx.stroke(); ctx.fillStyle = P2; ctx.beginPath(); ctx.moveTo(-4 * s, -14 * s); ctx.lineTo(4 * s, -12 * s); ctx.lineTo(-4 * s, -10 * s); ctx.fill(); break;
    case 'kamikaze': ctx.fillStyle = '#fff'; ctx.fillRect(3 * s, -4.4 * s, 7 * s, 1.4 * s); break;
    case 'chalak': ctx.strokeStyle = '#000'; ctx.lineWidth = .8 * s; ctx.beginPath(); ctx.arc(8 * s, 1 * s, 1.5 * s, 0.2, 2); ctx.stroke(); break;
  }
  ctx.strokeStyle = '#2a2040'; ctx.lineWidth = 1.1 * s; ctx.beginPath(); ctx.moveTo(9 * s, 0); ctx.lineTo(17 * s, m.state === 'bite' ? 6 * s : 2.5 * s); ctx.stroke();
  wings(s, m);
  if ((m.maxhp > 1) && m.hp < m.maxhp && m.t !== 'helmet') { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.moveTo(-14 * s, -3 * s); ctx.lineTo(-10 * s, 1 * s); ctx.lineTo(-12 * s, 4 * s); ctx.stroke(); }
  if (['tez', 'zigzag'].includes(m.t) && m.state === 'fly') { ctx.strokeStyle = `rgba(${ELEC},.5)`; ctx.lineWidth = 2 * s; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-22 * s - i * 4 * s, -3 * s + i * 3 * s); ctx.lineTo(-32 * s - i * 6 * s, -3 * s + i * 3 * s); ctx.stroke(); } }
  ctx.restore();
  if (m.laugh > 0) { m.laugh -= 0.016; ctx.font = `900 ${14 * S}px Poppins`; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.strokeStyle = 'rgba(40,12,110,.9)'; ctx.lineWidth = 3; const t = ['hehehe 😂', 'haha!', '😂😂'][(m.ph * 3 | 0) % 3]; ctx.strokeText(t, m.x, m.y - 26 * S); ctx.fillText(t, m.x, m.y - 26 * S); }
}
function drawBoss(m, time) {
  const s = 1.3 * m.size * S, k = m.key;
  if (!m.fake || true) { ctx.fillStyle = m.fake ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(m.x, m.y + 30 * s, 16 * s, 4 * s, 0, 0, 7); ctx.fill(); }
  // aim line
  if (m.mode === 'warn' && m.aim) { ctx.save(); ctx.setLineDash([8 * S, 8 * S]); ctx.lineDashOffset = -time * 60; ctx.strokeStyle = `rgba(255,255,255,${0.5 + Math.sin(time * 30) * 0.4})`; ctx.lineWidth = 3 * S; ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.aim[0], m.aim[1]); ctx.stroke(); ctx.restore(); }
  if (m.draining && ptr.vis > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(127,212,255,.6)'; ctx.lineWidth = 6 * S; ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(ptr.x, ptr.y); ctx.stroke(); ctx.restore(); }
  ctx.save(); ctx.translate(m.x, m.y);
  const hot = m.mode === 'warn' || m.mode === 'dash';
  const ag = ctx.createRadialGradient(0, 0, 0, 0, 0, 44 * s); ag.addColorStop(0, hot ? 'rgba(154,109,245,.7)' : m.tired > 0 ? 'rgba(127,212,255,.45)' : 'rgba(154,109,245,.3)'); ag.addColorStop(1, 'rgba(154,109,245,0)');
  ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(0, 0, 44 * s, 0, 7); ctx.fill();
  if (m.tired > 0) { ctx.strokeStyle = `rgba(${ELEC},${0.6 + Math.sin(time * 12) * 0.4})`; ctx.lineWidth = 3 * S; ctx.setLineDash([6 * S, 6 * S]); ctx.beginPath(); ctx.arc(0, 0, 30 * s, 0, 7); ctx.stroke(); ctx.setLineDash([]); ctx.font = `900 ${12 * S}px Poppins`; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText('💫 TIRED', 0, -34 * s); }
  if (m.guards > 0 || m.books > 0) { ctx.strokeStyle = 'rgba(199,176,255,.7)'; ctx.lineWidth = 3 * S; ctx.beginPath(); ctx.arc(0, 0, 26 * s, 0, 7); ctx.stroke(); }
  if (m.hurt > 0) ctx.globalAlpha = 0.6 + Math.sin(m.ph * 80) * 0.4;
  ctx.scale(m.dir, 1); ctx.rotate(m.mode === 'dash' ? 0.35 : Math.sin(m.ph * 2) * 0.08);
  ctx.strokeStyle = 'rgba(30,20,50,.9)'; ctx.lineWidth = 1.4 * s;
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-2 * s + i * 3 * s, 3 * s); ctx.quadraticCurveTo(-6 * s + i * 4 * s, 12 * s, -12 * s + i * 7 * s, 16 * s); ctx.stroke(); }
  if (k === 'maharaja' || k === 'general' || k === 'twins') { ctx.fillStyle = k === 'maharaja' ? P1 : '#2a1460'; ctx.beginPath(); ctx.moveTo(-2 * s, -3 * s); ctx.quadraticCurveTo(-24 * s, 0, -26 * s, 14 * s); ctx.lineTo(-6 * s, 5 * s); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = m.b.col; ctx.beginPath(); ctx.ellipse(-10 * s, 2 * s, 11 * s, 5 * s, 0.25, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(230,225,255,.6)'; ctx.lineWidth = 1.2 * s; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-15 * s + i * 4 * s, -3 * s); ctx.lineTo(-16 * s + i * 4 * s, 6 * s); ctx.stroke(); }
  ctx.fillStyle = '#4a3d78'; ctx.beginPath(); ctx.ellipse(0, 0, 5.5 * s, 4.6 * s, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#5a4b8e'; ctx.beginPath(); ctx.arc(6.5 * s, -1.5 * s, 4 * s, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(7.6 * s, -2.6 * s, 1.5 * s, 0, 7); ctx.fill(); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(8.1 * s, -2.6 * s, .7 * s, 0, 7); ctx.fill();
  ctx.strokeStyle = '#000'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(5.5 * s, -5 * s); ctx.lineTo(9.5 * s, -3.8 * s); ctx.stroke();
  const crown = () => { ctx.fillStyle = '#e9e1ff'; ctx.beginPath(); ctx.moveTo(3 * s, -5 * s); ctx.lineTo(4 * s, -10 * s); ctx.lineTo(6 * s, -7 * s); ctx.lineTo(7.5 * s, -11 * s); ctx.lineTo(9 * s, -7 * s); ctx.lineTo(10.5 * s, -10 * s); ctx.lineTo(10.5 * s, -5 * s); ctx.closePath(); ctx.fill(); ctx.fillStyle = P1; ctx.beginPath(); ctx.arc(7.3 * s, -7 * s, .9 * s, 0, 7); ctx.fill(); };
  switch (k) {
    case 'don': ctx.fillStyle = '#0a0a14'; rr(ctx, 4 * s, -4.4 * s, 7 * s, 2.6 * s, 1 * s); ctx.fill(); ctx.strokeStyle = '#e9e1ff'; ctx.lineWidth = .6 * s; ctx.beginPath(); ctx.arc(1 * s, 1 * s, 2.5 * s, 0.3, 2.8); ctx.stroke(); break;
    case 'baba': ctx.fillStyle = '#e4e0ee'; ctx.beginPath(); ctx.moveTo(4 * s, 1 * s); ctx.quadraticCurveTo(6 * s, 9 * s, 9 * s, 7 * s); ctx.quadraticCurveTo(10 * s, 3 * s, 10 * s, 1 * s); ctx.fill(); ctx.fillStyle = P1; ctx.fillRect(6.3 * s, -7 * s, 1 * s, 2.4 * s); break;
    case 'sultan': ctx.fillStyle = '#c9c2e6'; ctx.beginPath(); ctx.moveTo(3 * s, -4 * s); ctx.quadraticCurveTo(7 * s, -14 * s, 14 * s, -8 * s); ctx.lineTo(10 * s, -4 * s); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(14 * s, -8 * s, 1.5 * s, 0, 7); ctx.fill(); ctx.fillStyle = '#5a4b8e'; ctx.fillRect(5.5 * s, -4 * s, 4 * s, 1.8 * s); break;
    case 'topper': ctx.strokeStyle = '#fff'; ctx.lineWidth = .7 * s; ctx.beginPath(); ctx.arc(6 * s, -2.5 * s, 1.8 * s, 0, 7); ctx.arc(9.8 * s, -2.5 * s, 1.8 * s, 0, 7); ctx.stroke(); ctx.fillStyle = '#111'; ctx.fillRect(2 * s, -7.5 * s, 9 * s, 1.5 * s); ctx.fillRect(5 * s, -9 * s, 3 * s, 1.5 * s); break;
    case 'dj': ctx.strokeStyle = '#0a0812'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.arc(6.5 * s, -2 * s, 5.5 * s, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); ctx.fillStyle = P2; ctx.beginPath(); ctx.arc(2 * s, -1 * s, 2 * s, 0, 7); ctx.arc(11 * s, -1 * s, 2 * s, 0, 7); ctx.fill(); break;
    case 'express': ctx.fillStyle = '#1a1a3a'; ctx.fillRect(2.5 * s, -7.5 * s, 8 * s, 3 * s); ctx.fillRect(2 * s, -5 * s, 10 * s, 1 * s); ctx.fillStyle = 'rgba(220,220,255,.5)'; ctx.beginPath(); ctx.arc(-4 * s, -10 * s - (time * 20 % 6) * s, 2.5 * s, 0, 7); ctx.fill(); break;
    case 'mafia': ctx.fillStyle = '#0a0812'; ctx.fillRect(1.5 * s, -6.5 * s, 10 * s, 2.5 * s); ctx.fillRect(4 * s, -10 * s, 5 * s, 4 * s); ctx.fillStyle = '#000'; ctx.fillRect(5 * s, -3.5 * s, 6 * s, 1.8 * s); break;
    case 'overtime': ctx.fillStyle = P1; ctx.beginPath(); ctx.moveTo(1 * s, 3 * s); ctx.lineTo(3 * s, 3 * s); ctx.lineTo(2 * s, 9 * s); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = .7 * s; ctx.beginPath(); ctx.arc(6 * s, -2.5 * s, 1.8 * s, 0, 7); ctx.stroke(); break;
    case 'monsoon': ctx.fillStyle = '#4a5aa0'; ctx.beginPath(); ctx.arc(6.5 * s, -2 * s, 5.5 * s, Math.PI, 0); ctx.fill(); ctx.fillStyle = 'rgba(200,210,255,.7)'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-8 * s + i * 5 * s, -12 * s, 3 * s, 0, 7); ctx.fill(); } break;
    case 'ninjamaster': ctx.fillStyle = P1; ctx.fillRect(2 * s, -4 * s, 10 * s, 2.4 * s); ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(-14 * s, -10 * s); ctx.lineTo(-2 * s, 2 * s); ctx.stroke(); break;
    case 'cyber': ctx.fillStyle = '#0a1230'; ctx.beginPath(); ctx.arc(6.5 * s, -2 * s, 6 * s, Math.PI * 0.9, Math.PI * 2.1); ctx.fill(); ctx.fillStyle = `rgba(${ELEC},.9)`; ctx.font = `${3 * s}px monospace`; ctx.fillText('01', -16 * s, -6 * s); ctx.fillText('10', -12 * s, 10 * s); break;
    case 'ranimaa': crown(); ctx.fillStyle = 'rgba(233,225,255,.35)'; ctx.beginPath(); ctx.moveTo(4 * s, -6 * s); ctx.quadraticCurveTo(-6 * s, -4 * s, -10 * s, 8 * s); ctx.lineTo(2 * s, 2 * s); ctx.fill(); break;
    case 'twins': ctx.fillStyle = '#fff'; ctx.font = `900 ${5 * s}px Poppins`; ctx.textAlign = 'center'; ctx.fillText(m.twinB ? '2' : '1', -10 * s, 4 * s); ctx.fillStyle = '#1a0630'; ctx.fillRect(3 * s, -4.5 * s, 8 * s, 2 * s); break;
    case 'general': ctx.fillStyle = '#2a2a4a'; ctx.fillRect(2 * s, -8 * s, 9 * s, 3.5 * s); ctx.fillRect(4 * s, -6 * s, 10 * s, 1.4 * s); ctx.fillStyle = '#e9e1ff'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-1 * s + i * 2.5 * s, 3 * s, .9 * s, 0, 7); ctx.fill(); } break;
    case 'maharaja': crown(); ctx.fillStyle = '#20142e'; ctx.beginPath(); ctx.ellipse(9 * s, 1.5 * s, 4 * s, 1.2 * s, 0.2, 0, 7); ctx.fill(); break;
  }
  ctx.strokeStyle = '#2a2040'; ctx.lineWidth = 1.3 * s; ctx.beginPath(); ctx.moveTo(10 * s, 0); ctx.lineTo(19 * s, m.mode === 'dash' ? 5 * s : 2 * s); ctx.stroke();
  wings(s, m, true);
  ctx.restore();
}
function drawObjects(time) {
  for (const it of G.items) {
    ctx.save(); ctx.translate(it.x, it.y);
    const blink = it.kind !== 'trap' && it.life < 2 ? (Math.sin(time * 20) > 0 ? 1 : 0.3) : 1; ctx.globalAlpha = blink;
    const trap = it.kind === 'trap' && !it.disguise, mys = it.kind === 'mystery';
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 32 * S);
    if (trap) { g.addColorStop(0, 'rgba(10,5,20,.95)'); g.addColorStop(0.55, 'rgba(116,58,232,.5)'); g.addColorStop(1, 'rgba(0,0,0,0)'); }
    else { g.addColorStop(0, 'rgba(255,255,255,.6)'); g.addColorStop(0.5, 'rgba(154,109,245,.4)'); g.addColorStop(1, 'rgba(154,109,245,0)'); }
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 32 * S, 0, 7); ctx.fill();
    if (trap) { ctx.strokeStyle = `rgba(255,255,255,${0.5 + Math.sin(time * 15) * 0.4})`; ctx.lineWidth = 2 * S; ctx.setLineDash([4 * S, 3 * S]); ctx.lineDashOffset = time * 20; ctx.beginPath(); ctx.arc(0, 0, 20 * S, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      ctx.save(); ctx.translate((Math.random() - 0.5) * 3 * S, 0); ctx.font = `900 ${9 * S}px Poppins`; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText('TRAP ⚠️', 0, -26 * S); ctx.restore(); }
    else { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2 * S; ctx.beginPath(); ctx.arc(0, 0, 18 * S + Math.sin(time * 6) * 2 * S, 0, 7); ctx.stroke(); }
    if (it.disguise && Math.random() < 0.08) ctx.translate(rnd(-4, 4) * S, 0);
    ctx.font = `${20 * S}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(mys ? '❓' : ITEMS[it.disguise || it.key].icon, 0, 1 * S); ctx.restore();
  }
  ctx.textBaseline = 'alphabetic';
  for (const e of G.eggs) { ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(Math.sin(time * 20) * (e.t < 1 ? 0.3 : 0.05)); ctx.fillStyle = '#e9e1ff'; ctx.beginPath(); ctx.ellipse(0, 0, 7 * S, 9 * S, 0, 0, 7); ctx.fill(); ctx.fillStyle = P2; ctx.beginPath(); ctx.arc(-2 * S, -2 * S, 1.5 * S, 0, 7); ctx.arc(2 * S, 3 * S, 1.2 * S, 0, 7); ctx.fill(); ctx.restore(); }
  for (const b of G.bombs) { ctx.fillStyle = '#0a0812'; ctx.beginPath(); ctx.arc(b.x, b.y, 7 * S, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5 * S; ctx.beginPath(); ctx.moveTo(b.x, b.y - 7 * S); ctx.lineTo(b.x + 4 * S, b.y - 12 * S); ctx.stroke(); ctx.fillStyle = `rgba(${ELEC},${0.5 + Math.random() * 0.5})`; ctx.beginPath(); ctx.arc(b.x + 4 * S, b.y - 12 * S, 2.5 * S, 0, 7); ctx.fill(); }
  for (const j of G.jugnus) { const a = 0.6 + Math.sin(j.ph * 6) * 0.4, g = ctx.createRadialGradient(j.x, j.y, 0, j.x, j.y, 26 * S); g.addColorStop(0, `rgba(190,255,230,${a})`); g.addColorStop(1, 'rgba(190,255,230,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(j.x, j.y, 26 * S, 0, 7); ctx.fill(); ctx.fillStyle = '#eafff6'; ctx.beginPath(); ctx.arc(j.x, j.y, 3 * S, 0, 7); ctx.fill(); }
  if (G.fx.coil > 0) { const cx = bed.x + 10 * S, cy = bed.y + bed.h + 4 * S; ctx.strokeStyle = '#3a6a4a'; ctx.lineWidth = 3 * S; ctx.beginPath(); for (let a = 0; a < 14; a += 0.3) ctx.lineTo(cx + Math.cos(a) * a * 1.4 * S, cy + Math.sin(a) * a * 0.6 * S); ctx.stroke();
    for (let i = 0; i < 4; i++) { const k = (time * 0.4 + i / 4) % 1; ctx.fillStyle = `rgba(200,190,255,${0.22 * (1 - k)})`; ctx.beginPath(); ctx.arc(cx + Math.sin(k * 6 + i) * 20 * S, cy - k * 220 * S, (10 + k * 40) * S, 0, 7); ctx.fill(); } }
  for (const s of G.sleepers) if (G.fx.shield > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const a = G.fx.shield < 1.5 ? (Math.sin(time * 20) * 0.5 + 0.5) : 1; ctx.strokeStyle = `rgba(${ELEC},${0.8 * a})`; ctx.lineWidth = 3 * S; ctx.beginPath(); ctx.arc(s.x + 20 * S, s.y - 6 * S, 52 * S * s.sc, 0, 7); ctx.stroke(); ctx.fillStyle = `rgba(${ELEC},${0.08 * a})`; ctx.fill(); ctx.restore(); }
  for (const r of G.rings) { ctx.strokeStyle = r.bass ? `rgba(199,176,255,${r.a})` : `rgba(255,255,255,${r.a})`; ctx.lineWidth = (r.bass ? 10 : 6) * S; ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, 7); ctx.stroke(); }
  if (G.rainT > 0) { ctx.strokeStyle = 'rgba(180,200,255,.35)'; ctx.lineWidth = 1.2 * S; ctx.beginPath(); for (let i = 0; i < 70; i++) { const x = (i * 97 + time * 600) % W, y = (i * 53 + time * 900) % H; ctx.moveTo(x, y); ctx.lineTo(x - 4 * S, y + 14 * S); } ctx.stroke(); }
}
function drawBolts() {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  for (const l of G.laser) { const a = l.life / 0.35; ctx.strokeStyle = `rgba(${ELEC},${0.4 * a})`; ctx.lineWidth = 16 * S; ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(l.x2, l.y2); ctx.stroke(); ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 3 * S; ctx.stroke(); }
  for (const b of G.bolts) {
    const a = b.life / b.max, path = () => { ctx.beginPath(); ctx.moveTo(b.pts[0][0], b.pts[0][1]); for (let i = 1; i < b.pts.length; i++) ctx.lineTo(b.pts[i][0], b.pts[i][1]); };
    path(); ctx.strokeStyle = `rgba(${ELEC},${0.28 * a})`; ctx.lineWidth = 9 * S * b.w; ctx.stroke();
    path(); ctx.strokeStyle = `rgba(154,109,245,${0.35 * a})`; ctx.lineWidth = 4.5 * S * b.w; ctx.stroke();
    path(); ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 1.6 * S * b.w; ctx.stroke();
  }
  for (const p of G.parts) {
    const a = clamp(p.life / p.max, 0, 1);
    if (p.col === 'ring') { ctx.strokeStyle = `rgba(${ELEC},${a})`; ctx.lineWidth = 3 * S; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1.6 - a), 0, 7); ctx.stroke(); }
    else if (p.col === 'smoke') { ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = `rgba(200,190,230,${a * 0.25})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (2 - a), 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'lighter'; }
    else { ctx.globalAlpha = a; ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.5 + a * 0.5), 0, 7); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
  if (G.megaRing > 0) { const k = 1 - G.megaRing / 0.5; ctx.strokeStyle = `rgba(${ELEC},${1 - k})`; ctx.lineWidth = 10 * S * (1 - k) + 1; ctx.beginPath(); ctx.arc(G.megaX, G.megaY, 170 * S * k * RK().r, 0, 7); ctx.stroke(); }
  ctx.restore();
}
function racketShape(x, y, r, ang, alpha, z, rk, hot) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = '#2a1a5a'; rr(ctx, -6 * S, r * 0.72, 12 * S, r * 1.5, 5 * S); ctx.fill();
  const hg = ctx.createLinearGradient(-7 * S, 0, 7 * S, 0); hg.addColorStop(0, P1); hg.addColorStop(1, P2); ctx.fillStyle = hg; rr(ctx, -7 * S, r * 1.2, 14 * S, r * 0.9, 6 * S); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, r * 0.82, r * 0.7, 0, 0, 7); ctx.clip();
  ctx.fillStyle = hot ? `rgba(255,255,255,${0.15 + Math.random() * 0.15})` : `rgba(${ELEC},${0.06 + z * 0.35})`; ctx.fillRect(-r, -r, r * 2, r * 2);
  ctx.strokeStyle = `rgba(220,230,255,${0.35 + z * 0.5})`; ctx.lineWidth = 0.8 * S; const step = rk.id === 'jaali' ? 4.5 * S : 7 * S;
  for (let i = -r; i < r; i += step) { ctx.beginPath(); ctx.moveTo(i, -r); ctx.lineTo(i, r); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-r, i); ctx.lineTo(r, i); ctx.stroke(); }
  ctx.restore();
  ctx.strokeStyle = hot ? '#fff' : rk.col; ctx.lineWidth = 5 * S; if (['epic', 'legendary', 'mythic'].includes(rk.rar) || hot) { ctx.shadowColor = hot ? '#fff' : `rgb(${ELEC})`; ctx.shadowBlur = 14 * S; }
  ctx.beginPath(); ctx.ellipse(0, 0, r * 0.82, r * 0.7, 0, 0, 7); ctx.stroke(); ctx.shadowBlur = 0;
  ctx.restore();
}
function drawRacket(time) {
  if (G.boomer && G.boomer.px) racketShape(G.boomer.px, G.boomer.py, R(), G.boomer.rot, 1, 1, RK(), false);
  if (ptr.vis <= 0 || state !== 'play') return;
  const x = ptr.x, y = ptr.y, r = R(), z = ptr.zapT > 0 ? ptr.zapT / 0.18 : 0, rk = RK();
  racketShape(x, y, r, ptr.ang, ptr.vis, z, rk, ptr.hotT > 0);
  // heat ring
  if (ptr.heat > 5) { ctx.save(); ctx.lineWidth = 4 * S; ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.arc(x, y, r * 1.05, Math.PI * 0.6, Math.PI * 2.4); ctx.stroke(); ctx.strokeStyle = ptr.heat > 70 ? `rgba(255,255,255,${0.6 + Math.sin(time * 30) * 0.4})` : '#c7b0ff'; ctx.beginPath(); ctx.arc(x, y, r * 1.05, Math.PI * 0.6, Math.PI * 0.6 + Math.PI * 1.8 * ptr.heat / 100); ctx.stroke(); if (ptr.heat > 70) { ctx.font = `900 ${11 * S}px Poppins`; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText('🔥 HOT. KEEP MOVING!', x, y + r * 1.35); } ctx.restore(); }
  if (ptr.charge > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = ptr.charge >= 1 ? `rgba(${ELEC},${0.6 + Math.sin(time * 20) * 0.4})` : 'rgba(154,109,245,.9)';
    ctx.lineWidth = 5 * S; ctx.beginPath(); ctx.arc(x, y, r * 1.25, -Math.PI / 2, -Math.PI / 2 + ptr.charge * 6.283); ctx.stroke();
    if (ptr.charge >= 1) { ctx.fillStyle = '#fff'; ctx.font = `900 ${13 * S}px Poppins`; ctx.textAlign = 'center'; ctx.fillText(G.freeMega > 0 ? `RELEASE! (FREE x${G.freeMega})` : 'RELEASE!', x, y - r * 1.45); }
    ctx.restore();
  }
}
/* ---------- lighting ---------- */
function drawLighting(time) {
  ctx.save(); ctx.fillStyle = 'rgba(6,3,20,.22)'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter';
  const light = (x, y, r, c, a) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
  if (ptr.vis > 0 && state === 'play') light(ptr.x, ptr.y, 240 * S, ELEC, (0.07 + (ptr.zapT > 0 ? ptr.zapT * 1.2 : 0)) * ptr.vis);
  for (const b of G.bolts) { const p = b.pts[b.pts.length - 1]; light(p[0], p[1], 120 * S, ELEC, 0.14 * b.life / b.max); }
  if (G.megaRing > 0) light(G.megaX, G.megaY, 400 * S, ELEC, G.megaRing * 0.5);
  for (const m of G.mosq) if (m.boss && !m.fake) light(m.x, m.y, 200 * S, '154,109,245', 0.12);
  if (theme === 'gaon' && G.lamp) light(G.lamp.x, G.lamp.y, (130 + Math.sin(time * 9) * 6 + Math.sin(time * 23) * 3) * S, '255,150,110', 0.2);
  ctx.restore();
}
function drawDark(time) {
  const darkOn = (CL.task === 'dark' || G.fx.dark > 0 || (CL.task === 'powercut' && G.flickOn > 0) || HZ.dark()) && (state === 'play' || state === 'clear');
  const smokeOn = G.fx.smoke > 0 && state === 'play';
  if (smokeOn) { for (let i = 0; i < 9; i++) { const x = (i * 211 + time * 25 * (i % 2 ? 1 : -1)) % (W + 300) - 150, y = H * 0.15 + (i * 97) % (H * 0.6); const g = ctx.createRadialGradient(x, y, 0, x, y, 180 * S); g.addColorStop(0, 'rgba(190,180,220,.35)'); g.addColorStop(1, 'rgba(190,180,220,0)'); ctx.fillStyle = g; ctx.fillRect(x - 180 * S, y - 180 * S, 360 * S, 360 * S); } }
  if (!darkOn) return;
  const tube = hasGhar('tube');
  dkx.setTransform(DPR, 0, 0, DPR, 0, 0); dkx.globalCompositeOperation = 'source-over'; dkx.clearRect(0, 0, W, H);
  dkx.fillStyle = `rgba(2,1,10,${tube ? .82 : .93})`; dkx.fillRect(0, 0, W, H);
  dkx.globalCompositeOperation = 'destination-out';
  const hole = (x, y, r, a) => { const g = dkx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(0.6, `rgba(0,0,0,${a * 0.7})`); g.addColorStop(1, 'rgba(0,0,0,0)'); dkx.fillStyle = g; dkx.beginPath(); dkx.arc(x, y, r, 0, 7); dkx.fill(); };
  if (ptr.vis > 0) hole(ptr.x, ptr.y, 140 * S * (tube ? 1.3 : 1), 0.95 * ptr.vis);
  for (const s of G.sleepers) hole(s.x + 20 * S, s.y, 70 * S, 0.5);
  if (G.lamp) hole(G.lamp.x, G.lamp.y, 60 * S, 0.5 + Math.sin(time * 9) * 0.08);
  for (const b of G.bolts) { const p = b.pts[b.pts.length - 1]; hole(p[0], p[1], 60 * S, b.life / b.max); }
  for (const it of G.items) hole(it.x, it.y, 40 * S, 0.8);
  for (const j of G.jugnus) hole(j.x, j.y, 36 * S, 0.7);
  if (G.flash > 0) { dkx.fillStyle = `rgba(0,0,0,${Math.min(1, G.flash)})`; dkx.fillRect(0, 0, W, H); }
  ctx.drawImage(dk, 0, 0, W, H);
}
/* ---------- HUD ---------- */
function glass(x, y, w, h, r) {
  ctx.fillStyle = 'rgba(16,8,44,.62)'; rr(ctx, x, y, w, h, r); ctx.fill();
  const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(0.5, 'rgba(154,109,245,.35)'); g.addColorStop(1, 'rgba(116,58,232,.15)');
  ctx.strokeStyle = g; ctx.lineWidth = 1.2; rr(ctx, x, y, w, h, r); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.06)'; rr(ctx, x + 2, y + 2, w - 4, h * 0.4, r); ctx.fill();
}
function segBar(x, y, w, h, v, c1, c2, segs, blink) {
  const gap = 2, sw = (w - gap * (segs - 1)) / segs;
  for (let i = 0; i < segs; i++) {
    const f = clamp(v * segs - i, 0, 1);
    ctx.fillStyle = 'rgba(255,255,255,.08)'; rr(ctx, x + i * (sw + gap), y, sw, h, 2); ctx.fill();
    if (f > 0) { const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.globalAlpha = blink ? 0.5 + Math.sin(performance.now() / 80) * 0.5 : 1; rr(ctx, x + i * (sw + gap), y, sw * f, h, 2); ctx.fill(); ctx.globalAlpha = 1; }
  }
}
function drawHUD(time) {
  if (!['play', 'clear'].includes(state)) return;
  const pad = 10 * Math.max(1, S), top = 10 * Math.max(1, S), pw = Math.min(W * 0.38, 190 * S), ph = 46 * S;
  // neend panel
  const s0 = mainS(), nn = minNeend();
  glass(pad, top, pw, ph, 12 * S);
  ctx.font = `${22 * S}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(nn > 70 ? '😴' : nn > 40 ? '😣' : '😫', pad + 20 * S, top + ph / 2 + 1);
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.fillStyle = '#e9e1ff'; ctx.font = `800 ${10 * S}px Poppins`;
  ctx.fillText(G.sleepers.length > 1 ? 'FAMILY SLEEP' : `${CW.who.toUpperCase()}\'S SLEEP`, pad + 38 * S, top + 17 * S);
  segBar(pad + 38 * S, top + 24 * S, pw - 48 * S, 11 * S, nn / 100, P1, P2, 10, nn < 30);
  // battery panel
  const bw = Math.min(W * 0.3, 140 * S), bx = W - pad - bw;
  glass(bx, top, bw, ph, 12 * S);
  ctx.textAlign = 'right'; ctx.fillStyle = '#e9e1ff'; ctx.font = `800 ${10 * S}px Poppins`;
  ctx.fillText(CL.task === 'limzap' ? `🎯 ZAP: ${G.zapsLeft}` : CL.task === 'limbat' ? '🪫 LAST BATTERY' : '🔋 BATTERY', bx + bw - 10 * S, top + 17 * S);
  segBar(bx + 10 * S, top + 24 * S, bw - 20 * S, 11 * S, G.bat / G.batMax, '#4fa9e8', `rgb(${ELEC})`, 8, G.bat < G.batMax * 0.15);
  // center: level + goal + score
  ctx.textAlign = 'center'; ctx.fillStyle = '#d9ccff'; ctx.font = `800 ${10 * S}px Poppins`;
  const narrow = W - pw - bw - 2 * pad < 200 * S;
  ctx.fillText(narrow ? (CL.task === 'boss' ? 'BOSS' : CL.yam ? 'Y' + (CL.yamI + 1) : CL.shaadi ? 'D' + CL.shaadi.d : 'L' + CL.n) : `${CL.task === 'boss' ? 'BOSS' : CL.yam ? 'YAMLOK ' + (CL.yamI + 1) : CL.shaadi ? 'SHAADI DIN ' + CL.shaadi.d : 'LEVEL ' + CL.n} · ${TASKS[CL.task].icon} ${TASKS[CL.task].name.toUpperCase()}`, W / 2, top + 12 * S);
  if (narrow) { ctx.font = `800 ${9 * S}px Poppins`; ctx.fillText(TASKS[CL.task].icon, W / 2, top + 26 * S); }
  const pr = progress(); let cy = narrow ? top + ph + 6 * S : top + 26 * S;
  if (pr.txt) { ctx.font = `900 ${13 * S}px Poppins`; ctx.fillStyle = `rgb(${ELEC})`; ctx.fillText(pr.txt, W / 2, cy + 2 * S); cy += 16 * S; }
  ctx.font = `900 ${28 * S}px Poppins`; ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(154,109,245,.9)'; ctx.shadowBlur = 16 * S;
  ctx.fillText(fmt(G.disp), W / 2, cy + 24 * S); ctx.shadowBlur = 0; cy += 30 * S;
  ctx.font = `800 ${10 * S}px Poppins`; ctx.fillStyle = '#d9ccff'; ctx.fillText(`🪙 ${G.coins}${G.gems ? '   💎 ' + G.gems : ''}`, W / 2, cy + 4 * S); cy += 12 * S;
  // big timer
  if (CL.len && state === 'play') {
    const rem = timeLeft(), urgent = rem <= 10, r = 24 * S * (1 + G.pulse * 0.18), tx = W / 2, ty = cy + 30 * S;
    ctx.save(); if (urgent) { ctx.shadowColor = `rgb(${ELEC})`; ctx.shadowBlur = 20 * S * G.pulse; }
    ctx.fillStyle = 'rgba(16,8,44,.7)'; ctx.beginPath(); ctx.arc(tx, ty, r, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 4 * S; ctx.beginPath(); ctx.arc(tx, ty, r, 0, 7); ctx.stroke();
    ctx.strokeStyle = urgent ? '#fff' : P2; ctx.beginPath(); ctx.arc(tx, ty, r, -Math.PI / 2, -Math.PI / 2 + 6.283 * rem / CL.len); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = `900 ${(urgent ? 20 : 16) * S * (1 + G.pulse * 0.2)}px Poppins`; ctx.textBaseline = 'middle'; ctx.fillText(Math.ceil(rem), tx, ty + 1); ctx.textBaseline = 'alphabetic'; ctx.restore();
    cy += 62 * S;
  }
  // boss bars
  const bs = G.bosses.filter(b => !b.dead);
  bs.forEach((b, i) => {
    const w2 = Math.min(W * 0.8, 340 * S) / (bs.length > 1 ? 2.1 : 1), x = bs.length > 1 ? (i ? W / 2 + 6 : W / 2 - w2 - 6) : W / 2 - w2 / 2, y = cy + 8 * S;
    ctx.font = `900 ${11 * S}px Poppins`; ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    ctx.fillText(`${b.b.emoji} ${b.b.name}${b.phase > 1 ? ' · P' + b.phase : ''}${b.guards || b.books ? ' 🛡️' : ''}`, x + w2 / 2, y);
    segBar(x, y + 6 * S, w2, 10 * S, b.hp / b.maxhp, '#c7b0ff', P1, 20, b.phase === 3);
    [0.33, 0.66].forEach(t => { ctx.fillStyle = '#fff'; ctx.fillRect(x + w2 * t, y + 4 * S, 2, 14 * S); });
  });
  if (bs.length) cy += 30 * S;
  if (G.combo >= 2) {
    const p = 1 + Math.sin(time * 11) * 0.06, mult = 1 + Math.floor(G.combo / 5), x = W - pad - 34 * S, y = top + ph + 46 * S;
    ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
    ctx.fillStyle = 'rgba(16,8,44,.7)'; ctx.beginPath(); ctx.arc(0, 0, 30 * S, 0, 7); ctx.fill();
    ctx.strokeStyle = `rgb(${ELEC})`; ctx.lineWidth = 4 * S; ctx.beginPath(); ctx.arc(0, 0, 30 * S, -Math.PI / 2, -Math.PI / 2 + 6.283 * clamp(G.comboT / 1.6, 0, 1)); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = `900 ${17 * S}px Poppins`; ctx.fillText(G.combo, 0, 4 * S);
    ctx.font = `800 ${8 * S}px Poppins`; ctx.fillStyle = `rgb(${ELEC})`; ctx.fillText(`COMBO x${mult}`, 0, 15 * S); ctx.restore();
  }
  // effects chips
  let ey = top + ph + 14 * S; ctx.textAlign = 'left';
  const chips = [];
  for (const k in G.fx) { const lab = { dark: '🌑 Bijli gul', double: '🦟 Double', leak: '🪫 Leak', jam: '🥶 Jam', ulta: '🔄 Fan reversed', smoke: '💨 Smoke', small: '🔻 Tiny racket', turbo: '⚡ Turbo machhar' }[k]; if (lab) chips.push([lab, G.fx[k], ['coil', 'shield'].includes(k)]); }
  if (G.freeMega > 0) chips.push([`⚡ Free Mega x${G.freeMega}`, null, true]);
  for (const [lab, t, good] of chips) { const txt = t != null ? `${lab} ${t.toFixed(1)}s` : lab; ctx.font = `800 ${10 * S}px Poppins`; const w2 = ctx.measureText(txt).width + 14 * S; ctx.fillStyle = good ? 'rgba(116,58,232,.75)' : 'rgba(10,5,20,.85)'; rr(ctx, pad, ey, w2, 18 * S, 9 * S); ctx.fill(); ctx.strokeStyle = good ? 'rgba(199,176,255,.8)' : 'rgba(255,255,255,.5)'; ctx.lineWidth = 1; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillText(txt, pad + 7 * S, ey + 12.5 * S); ey += 22 * S; }
  if (CL.task === 'jugnu') { ctx.font = `800 ${10 * S}px Poppins`; ctx.fillStyle = '#eafff6'; ctx.fillText(`✨ Firefly hits: ${G.st.jugnuHits}/3`, pad, ey + 12 * S); }
}
function drawPopups() {
  for (const p of G.popups) {
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 20 * S;
    ctx.fillStyle = 'rgba(245,244,255,.97)'; rr(ctx, p.x, p.y, p.w, p.h, 12 * S); ctx.fill(); ctx.restore();
    ctx.fillStyle = P1; rr(ctx, p.x, p.y, p.w, 18 * S, 12 * S); ctx.fill(); ctx.fillRect(p.x, p.y + 10 * S, p.w, 8 * S);
    ctx.fillStyle = '#fff'; ctx.font = `800 ${9 * S}px Poppins`; ctx.textAlign = 'left'; ctx.fillText('🔔 MESSAGE · now', p.x + 8 * S, p.y + 13 * S);
    ctx.fillStyle = '#1a0b4a'; ctx.font = `800 ${11 * S}px Poppins`; ctx.fillText(`Share OTP ${p.code} and win ₹5000!`, p.x + 8 * S, p.y + 36 * S);
    ctx.fillStyle = '#5a3fb0'; ctx.font = `700 ${9 * S}px Poppins`; ctx.fillText(`⚠️ It is a scam. TAP to block (${Math.ceil(p.life)}s)`, p.x + 8 * S, p.y + 54 * S);
  }
}
function drawPops() {
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const p of G.pops) {
    const k = 1 - p.life / p.max, a = p.life < 0.25 ? p.life / 0.25 : 1, sc = k < 0.12 ? 0.5 + (k / 0.12) * 0.7 : k < 0.22 ? 1.2 - ((k - 0.12) / 0.1) * 0.2 : 1;
    const sz = Math.min(p.size * S * sc, W * 0.11 * (p.size / 34 + 0.3));
    ctx.globalAlpha = a; ctx.font = `900 ${sz}px Poppins`; const yy = p.y - k * p.rise * S;
    ctx.lineWidth = Math.max(3, sz * 0.16); ctx.strokeStyle = 'rgba(40,12,110,.9)'; ctx.strokeText(p.txt, p.x, yy); ctx.fillStyle = p.col; ctx.fillText(p.txt, p.x, yy);
  }
  ctx.globalAlpha = 1; drawAnn(); ctx.textBaseline = 'alphabetic';
}
function drawAnn() {
  const a = G.ann; if (!a || (state !== 'play' && state !== 'pause')) return;
  const t = a.t, inK = clamp(t / 0.18, 0, 1), out = clamp((a.life - t) / 0.22, 0, 1), sc = inK < 1 ? 0.7 + 0.38 * Math.sin(inK * Math.PI * 0.75) / Math.sin(Math.PI * 0.75) * inK : 1;
  const maxW = W * 0.72; let lines = a.lines.map((l, i) => { let sz = (i ? Math.min(l.size, 11.5) : Math.min(l.size, 18)) * S; ctx.font = `900 ${sz}px Poppins`; let w = ctx.measureText(l.txt).width; if (w > maxW - 28 * S) { sz *= (maxW - 28 * S) / w; ctx.font = `900 ${sz}px Poppins`; w = ctx.measureText(l.txt).width; } return { ...l, sz, w }; });
  const bw = Math.max(...lines.map(l => l.w)) + 24 * S, bh = lines.reduce((s, l) => s + l.sz * 1.25, 0) + 10 * S, cx = W / 2, cy = H * 0.315;
  ctx.save(); ctx.globalAlpha = out; ctx.translate(cx, cy); ctx.scale(sc, sc);
  ctx.fillStyle = a.pri ? 'rgba(40,10,90,.82)' : 'rgba(18,8,45,.62)'; ctx.strokeStyle = a.pri ? 'rgba(255,255,255,.75)' : 'rgba(154,109,245,.7)'; ctx.lineWidth = 1.5 * S;
  ctx.beginPath(); ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 14 * S); ctx.fill(); ctx.stroke();
  let y = -bh / 2 + 5 * S; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const l of lines) { y += l.sz * 0.625; ctx.font = `900 ${l.sz}px Poppins`; ctx.fillStyle = l.col; ctx.fillText(l.txt, 0, y); y += l.sz * 0.625; }
  if (G.annQ && G.annQ.length) { ctx.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < G.annQ.length; i++) { ctx.beginPath(); ctx.arc((i - (G.annQ.length - 1) / 2) * 9 * S, bh / 2 + 8 * S, 2.5 * S, 0, 6.283); ctx.fill(); } }
  ctx.restore();
}
function drawBossCard() {
  const c = G.bossCard; if (!c) return;
  const t = c.t, inA = clamp(t / 0.35, 0, 1), outA = clamp((2.6 - t) / 0.4, 0, 1), a = Math.min(inA, outA), y = H * 0.42;
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(5,2,15,.75)'; ctx.fillRect(0, y - 70 * S, W, 140 * S);
  const g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(116,58,232,0)'); g.addColorStop(0.5, 'rgba(154,109,245,.9)'); g.addColorStop(1, 'rgba(116,58,232,0)');
  ctx.fillStyle = g; ctx.fillRect(0, y - 72 * S, W, 3 * S); ctx.fillRect(0, y + 69 * S, W, 3 * S);
  const sl = (1 - inA) * W * 0.5;
  ctx.textAlign = 'center'; ctx.fillStyle = '#cbb8ff'; ctx.font = `800 ${11 * S}px Poppins`; ctx.fillText(`${TIERS[c.b.tier].name} BOSS`, W / 2 - sl, y - 38 * S);
  ctx.font = `900 ${Math.min(40 * S, W * 0.09)}px Poppins`; ctx.fillStyle = '#fff'; ctx.shadowColor = P2; ctx.shadowBlur = 24 * S; ctx.fillText(`${c.b.emoji} ${c.b.name}`, W / 2 + sl, y + 6 * S, W * 0.92); ctx.shadowBlur = 0;
  ctx.font = `700 ${13 * S}px Poppins`; ctx.fillStyle = '#e3d8ff'; ctx.fillText(`"${c.b.taunt}"`, W / 2 - sl, y + 40 * S);
  ctx.restore();
}
/* ---------- cinematic ---------- */
function camera() {
  const c = G.cine; if (!c || c.type !== 'wake') return null;
  const t = c.t, s = G.wakeS; let z = 1;
  if (t < 0.75) z = 1 + 0.9 * (1 - Math.pow(1 - t / 0.75, 3)); else if (t < 1.4) z = 1.9; else if (t < 1.8) z = 1.9 - 0.9 * ((t - 1.4) / 0.4); else z = 1;
  const k = (z - 1) / 0.9; return { z, fx: W / 2 + (s.x + 20 * S - W / 2) * k, fy: H / 2 + (s.y - H / 2) * k };
}
function drawCine(time) {
  const c = G.cine; if (!c || c.type === 'morning') return;
  if (c.type === 'fail') {
    const k = clamp(c.t / 0.3, 0, 1), sc = 2.5 - 1.5 * k;
    ctx.fillStyle = `rgba(5,2,15,${0.5 * k})`; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(W / 2, H * 0.4); ctx.scale(sc, sc); ctx.globalAlpha = k; ctx.textAlign = 'center';
    ctx.font = `900 ${Math.min(42 * S, W * 0.1)}px Poppins`; ctx.lineWidth = 9 * S; ctx.strokeStyle = 'rgba(40,12,110,.95)'; ctx.fillStyle = '#fff'; ctx.strokeText(c.title, 0, 0); ctx.fillText(c.title, 0, 0); ctx.restore();
    return;
  }
  const t = c.t, s = G.wakeS;
  // vignette darken
  ctx.fillStyle = `rgba(5,2,15,${clamp(t / 0.7, 0, 0.55)})`; ctx.fillRect(0, 0, W, H);
  // text slam
  if (t > 0.75 && t < 2.1) {
    const k = clamp((t - 0.75) / 0.18, 0, 1), sc = 3 - 2 * k, out = clamp((2.1 - t) / 0.3, 0, 1);
    const [l1, l2] = CW.shout.split('|');
    ctx.save(); ctx.globalAlpha = k * out; ctx.translate(W / 2 + (Math.random() - 0.5) * 6 * S * (1 - k), H * 0.26); ctx.scale(sc, sc); ctx.textAlign = 'center';
    ctx.font = `900 ${Math.min(50 * S, W * 0.12)}px Poppins`; ctx.lineWidth = 10 * S; ctx.strokeStyle = 'rgba(40,12,110,.95)'; ctx.fillStyle = '#fff'; ctx.strokeText(l1, 0, 0); ctx.fillText(l1, 0, 0);
    ctx.font = `900 ${Math.min(28 * S, W * 0.07)}px Poppins`; ctx.strokeText(l2, 0, 46 * S); ctx.fillText(l2, 0, 46 * S); ctx.restore();
  }
  // silhouette
  if (t > 1.4) {
    const k = clamp((t - 1.4) / 0.45, 0, 1), sx = clamp(s.x + 40 * S, W * 0.2, W * 0.5), base = H, hgt = H * 0.62 * k;
    ctx.save(); ctx.globalAlpha = 0.92;
    const g = ctx.createLinearGradient(0, base - hgt, 0, base); g.addColorStop(0, '#0a0420'); g.addColorStop(1, '#020108'); ctx.fillStyle = g;
    const hy = base - hgt + 50 * S;
    ctx.beginPath(); ctx.arc(sx, hy, 46 * S, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(sx - 90 * S, base); ctx.quadraticCurveTo(sx - 95 * S, hy + 60 * S, sx - 40 * S, hy + 45 * S); ctx.lineTo(sx + 40 * S, hy + 45 * S); ctx.quadraticCurveTo(sx + 95 * S, hy + 60 * S, sx + 90 * S, base); ctx.closePath(); ctx.fill();
    const throwK = t > 1.95 ? clamp((t - 1.95) / 0.15, 0, 1) : 0;
    const hx = sx + 70 * S + throwK * 40 * S, hhy = hy - 70 * S + throwK * 50 * S;
    ctx.lineWidth = 30 * S; ctx.lineCap = 'round'; ctx.strokeStyle = '#06021a'; ctx.beginPath(); ctx.moveTo(sx + 50 * S, hy + 55 * S); ctx.quadraticCurveTo(sx + 90 * S, hy + 10 * S, hx, hhy); ctx.stroke();
    ctx.shadowColor = P2; ctx.shadowBlur = 20 * S; ctx.fillStyle = '#e9e1ff'; ctx.beginPath(); ctx.ellipse(sx - 16 * S, hy - 4 * S, 9 * S, 5 * S, -0.2, 0, 7); ctx.ellipse(sx + 18 * S, hy - 4 * S, 9 * S, 5 * S, 0.2, 0, 7); ctx.fill();
    ctx.restore();
    c.hand = [hx, hhy];
    if (t < 1.95) drawChappal(hx, hhy, 1.6, Math.sin(time * 8) * 0.3, 1);
  }
  // flying chappal
  if (t >= 1.95 && t < 2.5) {
    const k = (t - 1.95) / 0.55, e = k * k, [hx, hy] = c.hand || [W * 0.4, H * 0.5], ix = W / 2, iy = H * 0.44;
    for (let g = 5; g >= 0; g--) { const kk = Math.max(0, k - g * 0.04), ee = kk * kk; drawChappal(hx + (ix - hx) * ee, hy + (iy - hy) * ee - Math.sin(kk * Math.PI) * 60 * S, 1.6 + ee * 9, kk * 22, g === 0 ? 1 : 0.12); }
  }
  if (t >= 2.5) {
    const slide = t > 3.3 ? Math.pow(t - 3.3, 2) * H * 2.2 : 0;
    drawChappal(W / 2, H * 0.44 + slide, 10.6, 0.25 + (t > 3.3 ? (t - 3.3) * 1.5 : 0), 1, true);
  }
}
function drawChappal(x, y, sc, spin, alpha, flat) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(flat ? spin : spin * 0.4);
  ctx.scale(sc * S * (flat ? 1 : Math.max(0.2, Math.abs(Math.cos(spin)))), sc * S);
  ctx.fillStyle = '#2a1a5a'; ctx.beginPath(); ctx.ellipse(0, 0, 16, 34, 0, 0, 7); ctx.fill();
  const g = ctx.createLinearGradient(-13, -30, 13, 30); g.addColorStop(0, '#7a5ad0'); g.addColorStop(1, '#4a2aa0'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -2, 13, 30, 0, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.12)'; for (let i = -24; i < 26; i += 6) ctx.fillRect(-10, i, 20, 1.2);
  ctx.strokeStyle = '#e9e1ff'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-12, 4); ctx.lineTo(0, -18); ctx.lineTo(12, 4); ctx.stroke();
  ctx.restore();
}
function drawCracks() {
  const c = G.cracks; if (!c) return;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const path = pts => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); };
  for (const l of c.lines) { path(l); ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 4 * S; ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1.3 * S; ctx.stroke(); }
  for (const r of c.rings) { path(r); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1 * S; ctx.stroke(); }
  const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 60 * S); g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c.x, c.y, 60 * S, 0, 7); ctx.fill();
  for (const s of G.shards) { ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.r); ctx.fillStyle = 'rgba(230,235,255,.75)'; ctx.beginPath(); ctx.moveTo(0, -s.s); ctx.lineTo(s.s * 0.7, s.s * 0.6); ctx.lineTo(-s.s * 0.6, s.s * 0.4); ctx.closePath(); ctx.fill(); ctx.restore(); }
  ctx.restore();
}
/* ---------- main render ---------- */
function render(time) {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
  const cam = camera();
  ctx.save(); ctx.translate((Math.random() - 0.5) * G.shake * 2, (Math.random() - 0.5) * G.shake * 2);
  if (cam) { ctx.translate(cam.fx, cam.fy); ctx.scale(cam.z, cam.z); ctx.translate(-cam.fx, -cam.fy); }
  ctx.drawImage(bg, 0, 0, W, H);
  if (state === 'play' && CL.task === 'powercut') { ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(0, 0, W, H); }
  drawFan();
  ctx.fillStyle = 'rgba(220,220,255,.35)';
  for (let i = 0; i < 22; i++) { const px = ((i * 97 + time * 8) % (W * 0.6)) + W * 0.25, py = ((i * 151 + time * 5 * (i % 3 + 1)) % (H * 0.6)) + H * 0.25; ctx.fillRect(px, py, 1.4 * S, 1.4 * S); }
  if (state !== 'menu' || true) { if (!(G.sleepers[0] && G.sleepers[0].walk)) drawBedFrame(); else drawBedFrame(); }
  for (const s of G.sleepers) if (!s.walk) drawPerson(s, time);
  for (const s of G.sleepers) if (s.walk) drawPerson(s, time);
  drawNet();
  for (const m of G.mosq) drawMosq(m, time);
  drawObjects(time);
  drawBolts();
  drawLighting(time);
  drawDark(time);
  drawRacket(time);
  ctx.restore();
  if (G.ts < 0.8) { ctx.fillStyle = `rgba(116,58,232,${(0.8 - G.ts) * 0.25})`; ctx.fillRect(0, 0, W, H); }
  const vg = ctx.createRadialGradient(W / 2, H * 0.5, Math.min(W, H) * 0.35, W / 2, H * 0.5, Math.max(W, H) * 0.8);
  const urgent = CL.len && state === 'play' && timeLeft() <= 10;
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(3,1,12,${0.7 + (urgent ? 0.2 * G.pulse : 0)})`); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  if (state === 'play' && minNeend() < 35) { ctx.fillStyle = `rgba(154,109,245,${(0.35 - minNeend() / 100) * (0.6 + Math.sin(time * 8) * 0.4)})`; const e = 6 * S; ctx.fillRect(0, 0, W, e); ctx.fillRect(0, H - e, W, e); ctx.fillRect(0, 0, e, H); ctx.fillRect(W - e, 0, e, H); }
  if (G.fever > 0 && state === 'play') {
    const a = 0.35 + Math.sin(time * 14) * 0.2, e = 18 * S; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const [x0, y0, x1, y1] of [[0, 0, 0, e], [0, H, 0, H - e], [0, 0, e, 0], [W, 0, W - e, 0]]) { const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, `rgba(154,109,245,${a})`); g.addColorStop(1, 'rgba(154,109,245,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    for (let i = 0; i < 6; i++) { const x = (i * 173 + time * 300) % W; ctx.fillStyle = `rgba(199,176,255,${0.15})`; ctx.beginPath(); ctx.arc(x, H - ((time * 200 + i * 90) % H), 6 * S, 0, 7); ctx.fill(); }
    ctx.restore();
    ctx.font = `900 ${16 * S}px Poppins`; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.shadowColor = P2; ctx.shadowBlur = 16 * S; ctx.fillText(`🔥 FEVER ${G.fever.toFixed(1)}s · 3X 🔥`, W / 2, H - 26 * S); ctx.shadowBlur = 0;
  }
  drawPopups(); drawPops(); drawHUD(time); drawBossCard(); drawCine(time); drawCracks();
  if (G.flash > 0) { ctx.fillStyle = `rgba(${G.flashCol},${Math.min(0.9, G.flash)})`; ctx.fillRect(0, 0, W, H); }
}

/* ================= BEAT SANX — cinematic clip engine v2 (v1.4) =================
   Makes 9:16 game videos that FEEL like the game: real HUD (hearts, level, coins),
   a finger that taps the tiles, camera zooms and shakes, beat-synced music with drops,
   level-clear bursts, red "WRONG" drama, slow-motion on the last tile and Sanx reacting live.
   Styles:  climb · play · duel · rush · close   (+ brag = the in-app "Save Clip" of your run)
   Everything is drawn in a 1080x1920 design space and scaled to the output size. */
'use strict';
const CLIP = (() => {
  const W = 1080, H = 1920;
  const COLORS = ['#ff3d7f', '#00e5ff', '#ffb020', '#22c55e', '#9a6df5', '#f97316', '#3b82f6', '#ec4899', '#14f195', '#ef4444', '#06b6d4', '#a3e635', '#8b5cf6', '#f43f5e', '#10b981', '#eab308'];
  const load = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  const svgImg = svg => load('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.includes('xmlns=') ? svg : svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')));
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const eOut = t => 1 - Math.pow(1 - clamp(t), 3);
  const eInOut = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const eBack = t => { t = clamp(t); const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const F = (w, s) => `${w} ${Math.round(s)}px Inter, system-ui, sans-serif`;
  function rr(x, a, b, w, h, r) { r = Math.min(r, w / 2, h / 2); x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
  function mul(seed) { let t = seed >>> 0; return () => { t = (t + 0x6D2B79F5) >>> 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }
  function makeSeq(rng, n, g) { const s = []; while (s.length < n) { const v = Math.floor(rng() * g * g); if (s.length && v === s[s.length - 1]) continue; s.push(v); } return s; }
  function wrap(x, txt, max) { const w = String(txt).split(' '), out = []; let cur = ''; for (const s of w) { const tr = cur ? cur + ' ' + s : s; if (x.measureText(tr).width > max && cur) { out.push(cur); cur = s; } else cur = tr; } if (cur) out.push(cur); return out; }

  function canRecord() { return !!(window.MediaRecorder && HTMLCanvasElement.prototype.captureStream); }
  function pickMime() {
    for (const m of ['video/mp4;codecs=avc1.42E01F,mp4a.40.2', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']) { try { if (MediaRecorder.isTypeSupported(m)) return m; } catch (e) { } }
    return '';
  }

  /* ================= TIMELINE ================= */
  function TL(bpm) {
    const T = { segs: [], cues: [], cams: [{ t: 0, z: 1, x: 0, y: 0, d: 0 }], shakes: [], flashes: [], beat: 60 / bpm, bpm, end: 0, P: { kick: 0 } };
    T.seg = (a, b, draw) => { T.segs.push({ a, b, draw }); T.end = Math.max(T.end, b); };
    T.cue = (t, fn) => T.cues.push({ t, fn });
    T.cam = (t, z, x = 0, y = 0, d = 0.5) => T.cams.push({ t, z, x, y, d });
    T.shake = (t, amp = 18, d = 0.35) => T.shakes.push({ t, amp, d });
    T.flash = (t, col = '#ffffff', d = 0.35, a = 0.55) => T.flashes.push({ t, col, d, a });
    T.snap = t => Math.ceil(t / T.beat - 0.001) * T.beat;
    return T;
  }
  function camAt(T, t) {
    const k = T.cams.filter(c => c.t <= t).sort((a, b) => a.t - b.t);
    if (k.length < 2) return k[0] || { z: 1, x: 0, y: 0 };
    const cur = k[k.length - 1], prev = k[k.length - 2], p = cur.d ? eInOut((t - cur.t) / cur.d) : 1;
    return { z: lerp(prev.z, cur.z, p), x: lerp(prev.x, cur.x, p), y: lerp(prev.y, cur.y, p) };
  }

  /* ================= DRAW PRIMITIVES ================= */
  function bg(x, A, t, wash, energy = 0.5) {
    const g = x.createRadialGradient(W / 2, H * 0.42, 40, W / 2, H * 0.45, H * 0.85);
    g.addColorStop(0, '#41189a'); g.addColorStop(0.45, '#1c0a4f'); g.addColorStop(1, '#06021a');
    x.fillStyle = g; x.fillRect(-300, -300, W + 600, H + 600);
    x.save(); x.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 4; k++) {
      const ang = Math.sin(t * (0.3 + energy * 0.5) + k * 1.7) * 0.4 + (k - 1.5) * 0.42, cx = W / 2 + (k - 1.5) * W * 0.26;
      x.save(); x.translate(cx, -120); x.rotate(ang);
      const bgr = x.createLinearGradient(0, 0, 0, H * 1.2); bgr.addColorStop(0, `rgba(154,109,245,${0.14 + energy * 0.14})`); bgr.addColorStop(1, 'rgba(154,109,245,0)');
      x.fillStyle = bgr; x.beginPath(); x.moveTo(-40, 0); x.lineTo(40, 0); x.lineTo(240, H * 1.2); x.lineTo(-240, H * 1.2); x.closePath(); x.fill(); x.restore();
    }
    for (const d of A.dust) { const y = ((d.y - t * d.s * (1 + energy)) % H + H) % H; x.fillStyle = `rgba(214,196,255,${d.a})`; x.beginPath(); x.arc(d.x + Math.sin(t + d.y) * 8, y, d.r, 0, 7); x.fill(); }
    x.restore();
    if (wash && wash.a > 0.01) { const w = x.createRadialGradient(W / 2, H * 0.52, 20, W / 2, H * 0.52, H * 0.62); w.addColorStop(0, wash.c + '66'); w.addColorStop(1, wash.c + '00'); x.globalAlpha = wash.a; x.fillStyle = w; x.fillRect(0, 0, W, H); x.globalAlpha = 1; }
  }
  function vignette(x, red = 0) {
    const v = x.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.78); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, red ? `rgba(170,0,35,${0.5 * red + 0.35})` : 'rgba(0,0,0,.55)');
    x.fillStyle = v; x.fillRect(0, 0, W, H);
  }
  function bigText(x, t, X, Y, size, o = {}) {
    const { w = 900, max = 960, c1 = '#ffffff', c2 = '#cbb2ff', depth = Math.round(size * 0.09), glow = 0.45, align = 'center' } = o;
    let s = size; x.font = F(w, s); while (x.measureText(t).width > max && s > 20) { s -= 3; x.font = F(w, s); }
    x.textAlign = align; x.textBaseline = 'alphabetic';
    for (let k = depth; k > 0; k -= 2) { x.fillStyle = k > depth * 0.55 ? '#10042b' : '#3b1580'; x.fillText(t, X, Y + k); }
    if (glow) { x.shadowColor = 'rgba(154,109,245,.9)'; x.shadowBlur = s * glow; }
    const gr = x.createLinearGradient(0, Y - s, 0, Y); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
    x.fillStyle = gr; x.fillText(t, X, Y); x.shadowBlur = 0; x.shadowColor = 'transparent';
    return s;
  }
  /* slam-in text: scale 2.1 -> 1 with a bounce, hold, fade out */
  function slam(x, txt, t0, t, X, Y, size, dur = 1.8, o = {}) {
    const u = t - t0; if (u < 0 || u > dur) return;
    const k = u < 0.28 ? lerp(2.1, 0.94, eOut(u / 0.28)) : u < 0.42 ? lerp(0.94, 1, (u - 0.28) / 0.14) : 1;
    x.save(); x.globalAlpha = clamp(u / 0.08) * clamp((dur - u) / 0.25); x.translate(X, Y); x.scale(k, k); bigText(x, txt, 0, 0, size, o); x.restore();
  }
  function chip(x, t, X, Y, s, bg = 'rgba(116,58,232,.92)', fg = '#fff') {
    x.font = F(800, s); const w = x.measureText(t).width + s * 1.6, h = s * 1.9;
    x.fillStyle = bg; rr(x, X - w / 2, Y - h / 2, w, h, h / 2); x.fill();
    x.strokeStyle = 'rgba(214,196,255,.55)'; x.lineWidth = 3; x.stroke();
    x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(t, X, Y + 2); x.textBaseline = 'alphabetic';
    return w;
  }
  function heart(x, X, Y, s, on) {
    x.save(); x.translate(X, Y); x.scale(s / 32, s / 32);
    x.beginPath(); x.moveTo(0, 10); x.bezierCurveTo(-26, -8, -14, -30, 0, -16); x.bezierCurveTo(14, -30, 26, -8, 0, 10); x.closePath();
    x.fillStyle = on ? '#ff3d6e' : 'rgba(255,255,255,.18)'; x.fill(); if (on) { x.fillStyle = 'rgba(255,255,255,.45)'; x.beginPath(); x.ellipse(-8, -12, 5, 3, -0.6, 0, 7); x.fill(); }
    x.restore();
  }
  function coin(x, X, Y, r) {
    const g = x.createRadialGradient(X - r * 0.3, Y - r * 0.3, r * 0.1, X, Y, r); g.addColorStop(0, '#fff3b0'); g.addColorStop(0.5, '#ffc93c'); g.addColorStop(1, '#c98a00');
    x.fillStyle = g; x.beginPath(); x.arc(X, Y, r, 0, 7); x.fill(); x.strokeStyle = '#a86e00'; x.lineWidth = r * 0.12; x.stroke();
    x.fillStyle = '#a86e00'; x.font = F(900, r * 1.1); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('S', X, Y + r * 0.06); x.textBaseline = 'alphabetic';
  }
  /* top game HUD like the app */
  function hud(x, A, s) {
    const y = 210;
    x.fillStyle = 'rgba(10,3,30,.55)'; rr(x, 40, y - 54, W - 80, 108, 54); x.fill(); x.strokeStyle = 'rgba(154,109,245,.45)'; x.lineWidth = 3; x.stroke();
    for (let i = 0; i < (s.max || 3); i++) heart(x, 108 + i * 64, y + 4, 44, i < s.hearts);
    if (s.level != null) chip(x, s.boss ? `BOSS · LEVEL ${s.level}` : `LEVEL ${s.level}`, W / 2, y, 34, s.boss ? 'rgba(255,45,90,.9)' : 'rgba(116,58,232,.92)');
    coin(x, W - 230, y, 26); x.font = F(900, 40); x.fillStyle = '#fff'; x.textAlign = 'left'; x.fillText(Math.round(s.coins || 0).toLocaleString('en'), W - 194, y + 14);
  }
  /* the board with 3D bevel tiles; returns tile centres */
  function board(x, A, t, st) {
    const g = st.g || 3, size = st.size || 860, cx = st.cx || W / 2, cy = st.cy || 1010, gap = size * 0.034, ts = (size - gap * (g - 1)) / g;
    const colors = st.colors || COLORS, pulse = 1 + (st.kick || 0) * 0.016, pos = [];
    x.save(); x.translate(cx, cy); x.scale(pulse, pulse); x.rotate(Math.sin(t * 0.7) * 0.012); x.translate(-size / 2, -size / 2);
    x.globalAlpha = st.alpha == null ? 1 : st.alpha;
    x.fillStyle = 'rgba(8,2,26,.62)'; rr(x, -gap * 1.8, -gap * 1.8, size + gap * 3.6, size + gap * 3.6, ts * 0.3); x.fill();
    x.strokeStyle = st.wrong != null ? `rgba(255,45,90,${0.5 + 0.5 * (st.wrongA || 0)})` : 'rgba(154,109,245,.6)'; x.lineWidth = 4; x.stroke();
    for (let i = 0; i < g * g; i++) {
      const r = Math.floor(i / g), c = i % g, X = c * (ts + gap), Y = r * (ts + gap), col = colors[i % colors.length];
      const L = (st.lit && st.lit[i]) || 0, P = (st.press && st.press[i]) || 0, isW = st.wrong === i ? Math.max(0.35, st.wrongA || 0) : 0;
      pos[i] = { x: cx + (X + ts / 2 - size / 2) * pulse, y: cy + (Y + ts / 2 - size / 2) * pulse, s: ts };
      const sc = 1 + L * 0.06 - P * 0.06;
      x.save(); x.translate(X + ts / 2, Y + ts / 2); x.scale(sc, sc); x.translate(-ts / 2, -ts / 2);
      if (L > 0) { x.shadowColor = col; x.shadowBlur = ts * 0.6 * L; }
      x.fillStyle = isW ? '#ff2d5a' : col; rr(x, 0, 0, ts, ts, ts * 0.22); x.fill(); x.shadowBlur = 0;
      const dim = isW ? 0 : 0.7 * (1 - Math.max(L, P * 0.8));
      x.fillStyle = `rgba(8,3,28,${dim})`; rr(x, 0, 0, ts, ts, ts * 0.22); x.fill();
      const bv = x.createLinearGradient(0, 0, 0, ts); bv.addColorStop(0, 'rgba(255,255,255,.3)'); bv.addColorStop(0.16, 'rgba(255,255,255,0)'); bv.addColorStop(0.8, 'rgba(0,0,0,0)'); bv.addColorStop(1, 'rgba(0,0,0,.35)');
      x.fillStyle = bv; rr(x, 0, 0, ts, ts, ts * 0.22); x.fill();
      if (L > 0.4 || P > 0.4) { x.strokeStyle = `rgba(255,255,255,${Math.max(L, P)})`; x.lineWidth = ts * 0.045; rr(x, ts * 0.05, ts * 0.05, ts * 0.9, ts * 0.9, ts * 0.18); x.stroke(); }
      if (st.newT === i && L > 0) chip(x, 'NEW', ts / 2, ts * 0.17, ts * 0.09, '#ffffff', '#4a2499');
      if (isW) { x.strokeStyle = '#fff'; x.lineWidth = ts * 0.07; x.lineCap = 'round'; x.beginPath(); x.moveTo(ts * 0.32, ts * 0.32); x.lineTo(ts * 0.68, ts * 0.68); x.moveTo(ts * 0.68, ts * 0.32); x.lineTo(ts * 0.32, ts * 0.68); x.stroke(); }
      if (st.nums && st.nums[i] != null) { x.fillStyle = '#fff'; x.font = F(900, ts * (String(st.nums[i]).length > 3 ? 0.24 : 0.4)); x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = 'rgba(0,0,0,.7)'; x.shadowBlur = 10; x.fillText(st.nums[i], ts / 2, ts / 2 + 3); x.shadowBlur = 0; x.textBaseline = 'alphabetic'; }
      x.restore();
    }
    x.restore();
    return { pos, top: cy - size / 2 - gap * 1.8, bottom: cy + size / 2 + gap * 1.8, ts };
  }
  function ripple(x, X, Y, u, col = '#ffffff') { if (u < 0 || u > 0.45) return; const k = u / 0.45; x.strokeStyle = col; x.globalAlpha = 1 - k; x.lineWidth = 10 * (1 - k) + 2; x.beginPath(); x.arc(X, Y, 40 + k * 120, 0, 7); x.stroke(); x.globalAlpha = 1; }
  /* cartoon pointing hand (fingertip at 0,0) */
  function finger(x, X, Y, press = 0, s = 1) {
    x.save(); x.translate(X, Y); x.scale(s * (1 - press * 0.12), s * (1 - press * 0.12)); x.rotate(-0.25);
    x.shadowColor = 'rgba(0,0,0,.45)'; x.shadowBlur = 24; x.shadowOffsetY = 12;
    x.fillStyle = '#ffe2c6'; x.strokeStyle = '#2a1650'; x.lineWidth = 7;
    rr(x, -26, -8, 52, 150, 26); x.fill(); x.stroke();
    x.shadowBlur = 0; x.shadowOffsetY = 0;
    x.beginPath(); x.ellipse(10, 160, 74, 64, 0, 0, 7); x.fill(); x.stroke();
    rr(x, 30, 110, 46, 84, 23); x.fill(); x.stroke();
    rr(x, 66, 128, 40, 72, 20); x.fill(); x.stroke();
    x.fillStyle = '#ffffff'; x.globalAlpha = 0.6; rr(x, -16, 0, 22, 34, 11); x.fill(); x.globalAlpha = 1;
    x.restore();
  }
  function digits(x, A, n, cx, cy, h) {
    const s = String(n), imgs = s.split('').map(d => A.digits[+d]);
    if (imgs.some(i => !i)) { bigText(x, s, cx, cy + h * 0.35, h); return; }
    const ws = imgs.map(i => i.width / i.height * h), tot = ws.reduce((a, b) => a + b, 0) - (imgs.length - 1) * h * 0.08;
    let X = cx - tot / 2; x.save(); x.shadowColor = 'rgba(154,109,245,.85)'; x.shadowBlur = h * 0.25;
    imgs.forEach((i, k) => { x.drawImage(i, X, cy - h / 2, ws[k], h); X += ws[k] - h * 0.08; }); x.restore();
  }
  /* Sanx live in the corner: pops in, face changes, speech bubble */
  function sanx(x, A, t, s) {
    if (!s || t < s.t0) return;
    const img = A.sanx[s.mood] || A.sanx.smug, k = eBack((t - s.t0) / 0.45), X = s.x || 170, Y = s.y || 1660, R = s.r || 118;
    x.save(); x.translate(X, Y); x.scale(k, k);
    x.fillStyle = '#743ae8'; x.beginPath(); x.arc(0, 0, R, 0, 7); x.fill();
    x.save(); x.beginPath(); x.arc(0, 0, R - 6, 0, 7); x.clip(); if (img) x.drawImage(img, -R * 1.05, -R * 0.95, R * 2.1, R * 2.1 * img.height / img.width); x.restore();
    x.strokeStyle = '#c4a7ff'; x.lineWidth = 8; x.beginPath(); x.arc(0, 0, R, 0, 7); x.stroke();
    x.restore();
    if (s.line && t - s.t0 > 0.3) {
      const a = clamp((t - s.t0 - 0.3) / 0.25); x.save(); x.globalAlpha = a; x.font = F(800, 42);
      const lines = wrap(x, s.line, 600), lh = 54, w = Math.max(...lines.map(l => x.measureText(l).width)) + 60, h = lines.length * lh + 36;
      const bx = s.right ? X - R - 30 - w : X + R + 26, by = Y - h / 2 - 16;
      x.fillStyle = '#ffffff'; rr(x, bx, by, w, h, 30); x.fill();
      x.beginPath(); if (s.right) { x.moveTo(bx + w, by + h * 0.5); x.lineTo(bx + w + 30, by + h * 0.62); x.lineTo(bx + w, by + h * 0.74); } else { x.moveTo(bx, by + h * 0.5); x.lineTo(bx - 30, by + h * 0.62); x.lineTo(bx, by + h * 0.74); } x.fill();
      x.fillStyle = '#1c0a4f'; x.textAlign = 'left'; lines.forEach((l, i) => x.fillText(l, bx + 30, by + 26 + lh * (i + 0.72)));
      x.restore();
    }
  }
  function avatarDisc(x, img, X, Y, R, ring = '#c4a7ff', label) {
    if (R <= 0) return;
    x.save(); x.fillStyle = '#743ae8'; x.beginPath(); x.arc(X, Y, R, 0, 7); x.fill();
    if (img) { x.save(); x.beginPath(); x.arc(X, Y, R - 6, 0, 7); x.clip(); x.drawImage(img, X - R, Y - R, R * 2, R * 2); x.restore(); }
    x.strokeStyle = ring; x.lineWidth = Math.max(4, R * 0.06); x.beginPath(); x.arc(X, Y, R, 0, 7); x.stroke(); x.restore();
    if (label) chip(x, label, X, Y + R + 40, 32);
  }
  function confetti(x, A, t0, t, cx = W / 2, cy = 900) {
    const u = t - t0; if (u < 0 || u > 2.4) return;
    for (const p of A.conf) { const X = cx + p.vx * u * 60, Y = cy + p.vy * u * 60 + 900 * u * u; x.save(); x.globalAlpha = clamp((2.4 - u) / 0.5); x.translate(X, Y); x.rotate(p.r + u * p.vr); x.fillStyle = p.c; x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); x.restore(); }
  }
  function coinBurst(x, t0, t, from, to, n = 8) {
    for (let i = 0; i < n; i++) { const u = clamp((t - t0 - i * 0.05) / 0.7); if (u <= 0 || u >= 1) continue; const e = eInOut(u), X = lerp(from.x, to.x, e) + Math.sin(u * Math.PI) * (i % 2 ? 90 : -90), Y = lerp(from.y, to.y, e) - Math.sin(u * Math.PI) * 170; coin(x, X, Y, 26); }
  }
  function progress(x, done, n, Y) {
    x.font = F(900, 54); x.fillStyle = '#fff'; x.textAlign = 'center'; x.fillText(`TILE ${Math.max(1, Math.min(n, done))} / ${n}`, W / 2, Y);
    x.fillStyle = 'rgba(255,255,255,.12)'; rr(x, 220, Y + 30, 640, 22, 11); x.fill();
    const pg = x.createLinearGradient(220, 0, 860, 0); pg.addColorStop(0, '#743ae8'); pg.addColorStop(1, '#c4a7ff'); x.fillStyle = pg; rr(x, 220, Y + 30, Math.max(22, 640 * clamp(done / n)), 22, 11); x.fill();
  }
  function label(x, txt, Y, col = '#fff', s = 56) { x.font = F(900, s); x.fillStyle = col; x.textAlign = 'center'; x.fillText(txt, W / 2, Y); }
  function endCard(x, A, t, t0, o) {
    const u = t - t0; if (u < 0) return;
    x.fillStyle = `rgba(6,2,26,${clamp(u / 0.4) * 0.6})`; x.fillRect(0, 0, W, H);
    if (A.logo) { const s = 760 * eBack(u / 0.6), h = s * A.logo.height / A.logo.width; x.drawImage(A.logo, (W - s) / 2, 200, s, h); }
    if (u > 0.5) slam(x, o.title || 'CAN YOU BEAT IT?', t0 + 0.5, t, W / 2, 880, 100, 99);
    if (u > 0.9) sanx(x, A, t, { t0: t0 + 0.9, mood: o.mood || 'smug', x: 230, y: 1170, r: 130, line: o.line || 'Think you can beat me?' });
    if (u > 1.4) { x.globalAlpha = clamp((u - 1.4) / 0.4); bigText(x, o.cta || 'PLAY FREE', W / 2, 1490, 84); if (A.gplay) { const gw = 520, gh = gw * A.gplay.height / A.gplay.width; x.drawImage(A.gplay, (W - gw) / 2, 1550, gw, gh); } if (o.footer) { x.font = F(800, 36); x.fillStyle = '#e4d7ff'; x.textAlign = 'center'; x.fillText(o.footer, W / 2, 1820); } x.globalAlpha = 1; }
  }

  /* ================= GAMEPLAY =================
     round(): one watch phase (tiles flash on the beat) and/or one input phase (finger taps).
     o.only = 'show' | 'input' | undefined (both) */
  function round(T, o) {
    const P = T.P, { seq, beat } = o, n = seq.length, show = o.showBeat || beat, tap = o.tapBeat || beat * 0.9, g = o.g || 3;
    const t0 = T.snap(o.start);
    const showEnd = o.only === 'input' ? t0 : t0 + n * show, inT0 = o.only === 'input' ? t0 : showEnd + beat * 0.6;
    const wrongAt = o.wrongAt == null ? -1 : o.wrongAt, taps = [];
    let end = showEnd;
    if (o.only !== 'show') {
      for (let k = 0; k < n; k++) {
        let tt = inT0 + k * tap; if (o.slowLast && k === n - 1) tt += tap * 1.7;
        taps.push(tt); end = tt + tap * 0.6; if (k === wrongAt) { end = tt + 0.2; break; }
      }
    }
    const R = { t0: o.only === 'input' ? -99 : t0, showEnd, inT0, taps, end, seq, show, wrongAt, g, wrongTile: wrongAt >= 0 ? (seq[wrongAt] + 1 + g) % (g * g) : null };
    if (o.only !== 'input') for (let k = 0; k < n; k++) T.cue(t0 + k * show, () => { SND.tile(seq[k], show * 0.6); P.kick = 1; });
    if (o.sound !== false) taps.forEach((tt, k) => T.cue(tt, () => { if (k === wrongAt) { SND.wrong(); SND.beat.drop(); } else { SND.tap(seq[k]); P.kick = 0.6; } }));
    if (wrongAt >= 0 && o.sound !== false) { const tw = taps[wrongAt]; T.shake(tw, 30, 0.5); T.flash(tw, '#ff2d5a', 0.45, 0.5); }
    return R;
  }
  function roundState(R, t) {
    const st = { lit: {}, press: {} };
    if (t >= R.t0 && t < R.showEnd) { const k = Math.floor((t - R.t0) / R.show), fr = (t - R.t0 - k * R.show) / R.show; st.lit[R.seq[k]] = fr < 0.7 ? 1 : clamp(1 - (fr - 0.7) / 0.3); st.cur = k; st.phase = 'show'; if (k === R.seq.length - 1 && R.markNew) st.newT = R.seq[k]; }
    else if (t >= R.showEnd) {
      st.phase = 'input';
      R.taps.forEach((tt, k) => { const u = t - tt; if (u >= 0 && u < 0.32 && k !== R.wrongAt) st.press[R.seq[k]] = 1 - u / 0.32; });
      if (R.wrongAt >= 0 && t >= R.taps[R.wrongAt]) { st.wrong = R.wrongTile; st.wrongA = clamp(1 - (t - R.taps[R.wrongAt] - 0.4) / 1.2); }
    }
    return st;
  }
  function fingerAt(R, t, pos) {
    if (!R.taps.length || t < R.inT0 - 0.6 || !pos.length) return null;
    const idx = R.taps.findIndex(tt => tt > t), k = idx === -1 ? R.taps.length - 1 : idx;
    const tile = i => (i === R.wrongAt ? R.wrongTile : R.seq[i]);
    const to = pos[tile(k)] || pos[0], from = k > 0 ? (pos[tile(k - 1)] || pos[0]) : { x: W * 0.82, y: 1750 };
    const tPrev = k > 0 ? R.taps[k - 1] : R.inT0 - 0.6, tNext = R.taps[k];
    const e = idx === -1 ? 1 : eInOut((t - tPrev - 0.06) / Math.max(0.1, (tNext - tPrev) * 0.7));
    const press = Math.max(0, ...R.taps.map(tt => { const u = t - tt; return u > -0.06 && u < 0.16 ? 1 - Math.abs(u - 0.04) / 0.12 : 0; }));
    return { x: lerp(from.x, to.x, e) + 10, y: lerp(from.y, to.y, e) + 22, press: clamp(press) };
  }
  function drawRound(x, A, T, R, t, extra = {}) {
    const st = Object.assign(roundState(R, t), { kick: T.P.kick, g: R.g }, extra);
    const b = board(x, A, t, st);
    R.taps.forEach((tt, k) => { const tile = k === R.wrongAt ? R.wrongTile : R.seq[k]; if (b.pos[tile]) ripple(x, b.pos[tile].x, b.pos[tile].y, t - tt, k === R.wrongAt ? '#ff2d5a' : '#ffffff'); });
    return { b, st };
  }
  const washOf = (R, t) => { const st = roundState(R, t), k = Object.keys(st.lit)[0]; return k != null ? { c: COLORS[k % COLORS.length], a: st.lit[k] } : null; };

  /* ================= STYLES ================= */
  const STYLES = {};

  /* 1) LEVEL CLIMB — fast gameplay montage, level 1 -> boss, fails on the last tile */
  STYLES.climb = (S, A, rng) => {
    const T = TL(S.bpm || 104), b = T.beat;
    const levels = S.levels || [1, 5, 10, 15], rounds = [], hs = [];
    T.seg(0, 2.7, (x, t) => { slam(x, S.hook1 || 'LEVEL 1 → 15', -0.3, t, W / 2, 820, 150, 2.6, { c2: '#e6d8ff' }); slam(x, S.hook2 || 'HOW FAR CAN YOU GO?', 0.75, t, W / 2, 1000, 84, 1.95); sanx(x, A, t, { t0: 1.1, mood: 'smug', line: 'Bet you quit at level 7.' }); });
    T.cue(0.1, () => SND.boss()); T.cue(0.75, () => SND.whoosh()); T.cam(0, 1.15, 0, 0, 0); T.cam(0.1, 1, 0, 0, 1.4);
    let t = 2.9, coins = 120, hearts = 3;
    levels.forEach((lv, i) => {
      const last = i === levels.length - 1, boss = last, n = Math.min(10, 3 + Math.floor(lv / 2.2)), beat = Math.max(0.3, b * (1 - i * 0.1));
      const intro = t; T.cue(intro, () => { SND.beat.tempo(Math.round(60 / beat)); SND.beat.mode(boss ? 'hype' : 'full'); SND.whoosh(); if (boss) SND.boss(); });
      if (boss) { T.flash(intro, '#ff2d5a', 0.5, 0.35); T.shake(intro, 16, 0.6); }
      const R = round(T, { seq: makeSeq(rng, n, 3), beat, start: intro + (boss ? 1.5 : 0.95), wrongAt: last ? n - 1 : -1, slowLast: last });
      R.markNew = true; rounds.push({ R, lv, intro, boss, last });
      hs.push({ t: intro, level: lv, coins, hearts, boss });
      if (last) { const tl = R.taps[R.taps.length - 1]; T.cam(tl - 1.3, 1.32, 0, -40, 1.0); T.cam(tl + 0.45, 1, 0, 0, 0.5); hs.push({ t: tl, level: lv, coins, hearts: hearts - 1, boss }); }
      else { coins += 20 + lv * 6; hs.push({ t: R.end + 0.35, level: lv, coins, hearts, boss }); T.cue(R.end, () => { SND.beat.fill(); SND.crash(); SND.level(); }); T.cam(R.end, 1.06, 0, 0, 0.1); T.cam(R.end + 0.12, 1, 0, 0, 0.4); }
      t = R.end + (last ? 0 : 1.05);
    });
    const fail = rounds[rounds.length - 1].R, tf = fail.taps[fail.wrongAt];
    T.cue(tf + 0.05, () => SND.beat.mode('still'));
    const endT = tf + 2.7;
    T.seg(2.7, endT, (x, t) => {
      const cur = rounds.filter(r => t >= r.intro).pop() || rounds[0], R = cur.R;
      hud(x, A, Object.assign({ max: 3 }, hs.filter(h => h.t <= t).pop() || hs[0]));
      const { b: bd, st } = drawRound(x, A, T, R, t);
      if (t < R.t0) { x.fillStyle = 'rgba(6,2,26,.45)'; x.fillRect(0, 300, W, 1500); slam(x, cur.boss ? 'BOSS LEVEL' : `LEVEL ${cur.lv}`, cur.intro, t, W / 2, 1040, cur.boss ? 160 : 130, R.t0 - cur.intro + 0.1, cur.boss ? { c2: '#ffb3c6' } : {}); }
      else if (st.phase === 'show') progress(x, st.cur + 1, R.seq.length, bd.bottom + 110);
      else if (t < R.end + 0.1) label(x, cur.last && t > fail.taps[fail.taps.length - 2] ? 'THE LAST TILE…' : 'YOUR TURN', bd.bottom + 110, cur.last && t > fail.taps[fail.taps.length - 2] ? '#ffb3c6' : '#fff');
      const f = fingerAt(R, t, bd.pos); if (f && t < R.taps[R.taps.length - 1] + 0.5) finger(x, f.x, f.y, f.press);
      rounds.forEach(r => { if (!r.last) { slam(x, 'LEVEL CLEAR!', r.R.end, t, W / 2, bd.top - 50, 96, 1.0); coinBurst(x, r.R.end, t, { x: W / 2, y: 1000 }, { x: W - 230, y: 210 }); } });
      if (t >= tf) slam(x, 'SO CLOSE!', tf + 0.15, t, W / 2, 860, 160, 2.7, { c2: '#ffb3c6' });
      sanx(x, A, t, t >= tf ? { t0: tf + 0.5, mood: 'laugh', line: 'HAHA! One tile away!' } : { t0: 3.0, mood: 'smug' });
    });
    T.cue(endT, () => { SND.beat.tempo(S.bpm || 104); SND.beat.mode('full'); SND.crash(); });
    T.seg(endT, endT + 4.8, (x, t) => endCard(x, A, t, endT, { title: S.endTitle || 'CAN YOU BEAT LEVEL 15?', line: S.sanxLine || 'Go on. Prove me wrong.', footer: S.footer }));
    T.wash = t => { const cur = rounds.filter(r => t >= r.intro).pop(); return cur ? washOf(cur.R, t) : null; };
    T.red = t => t >= tf ? clamp(1 - (t - tf) / 1.6) : 0;
    return T;
  };

  /* 2) PLAY ALONG — viewer plays: watch, freeze + timer, finger shows the answer, verdict */
  STYLES.play = (S, A, rng) => {
    const T = TL(S.bpm || 100), b = T.beat, g = S.grid || 3, n = S.len || 8, seq = makeSeq(rng, n, g);
    T.seg(0, T.snap(2.9), (x, t) => { slam(x, S.hook1 || 'ONLY 3% CAN', -0.3, t, W / 2, 840, 130, 2.7); slam(x, S.hook2 || 'REMEMBER THIS', 0.7, t, W / 2, 1010, 120, 2.1, { c2: '#e6d8ff' }); sanx(x, A, t, { t0: 1.2, mood: 'smug', line: `${n} tiles. No way you get all of them.` }); });
    T.cue(0.1, () => SND.boss()); T.cue(0.7, () => SND.whoosh()); T.cam(0, 1.2, 0, 0, 0); T.cam(0.1, 1, 0, 0, 1.6);
    const c0 = T.snap(2.9);
    T.seg(c0, c0 + b * 4, (x, t) => { board(x, A, t, { g, alpha: clamp((t - c0) / 0.4), kick: T.P.kick }); const k = Math.min(2, Math.floor((t - c0) / b)); if (t - c0 < b * 3) slam(x, ['3', '2', '1'][k], c0 + k * b, t, W / 2, 1140, 380, b * 0.95); bigText(x, 'WATCH CAREFULLY', W / 2, 380, 76); });
    [0, 1, 2].forEach(k => { T.cue(c0 + k * b, () => SND.tick()); T.shake(c0 + k * b, 8, 0.15); }); T.cue(c0, () => SND.beat.mode('full'));
    const R = round(T, { seq, beat: b, start: c0 + b * 4, g, only: 'show' });
    T.cue(R.t0, () => SND.beat.mode(n > 8 ? 'hype' : 'full'));
    seq.forEach((v, k) => { T.cam(R.t0 + k * b, 1.045, 0, 0, 0.07); T.cam(R.t0 + k * b + 0.08, 1, 0, 0, b * 0.8); });
    T.seg(R.t0, R.showEnd + 0.3, (x, t) => { const { b: bd, st } = drawRound(x, A, T, R, t); bigText(x, 'REMEMBER THE ORDER', W / 2, 380, 70); progress(x, (st.cur == null ? n - 1 : st.cur) + 1, n, bd.bottom + 110); });
    const tz = R.showEnd + 0.3, ans = S.answerTime || 5;
    T.cue(tz, () => { SND.beat.mode('light'); SND.whoosh(); });
    for (let s = 0; s < ans; s++) T.cue(tz + s, () => SND.tick());
    T.seg(tz, T.snap(tz + ans) + 0.02, (x, t) => {
      const nums = {}; for (let i = 0; i < g * g; i++) nums[i] = i + 1;
      const bd = board(x, A, t, { g, nums });
      slam(x, 'YOUR TURN!', tz, t, W / 2, 400, 130, ans + 1);
      label(x, 'Comment the numbers in order 👇', bd.bottom + 80, '#fff', 46);
      const left = Math.max(0, tz + ans - t), Rr = 84, X = W / 2, Y = bd.bottom + 200;
      x.lineWidth = 16; x.strokeStyle = 'rgba(255,255,255,.15)'; x.beginPath(); x.arc(X, Y, Rr, 0, 7); x.stroke();
      x.strokeStyle = left < 2 ? '#ff3d6e' : '#c4a7ff'; x.beginPath(); x.arc(X, Y, Rr, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left / ans); x.stroke();
      x.font = F(900, 86); x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(Math.ceil(left), X, Y + 4); x.textBaseline = 'alphabetic';
    });
    const ta = T.snap(tz + ans), A2 = round(T, { seq, beat: b, start: ta + b, g, only: 'input', tapBeat: b * 0.85 });
    T.cue(ta, () => { SND.beat.mode('hype'); SND.crash(); }); T.flash(ta, '#ffffff', 0.3, 0.4);
    const aEnd = A2.end + 1.8;
    T.seg(ta, aEnd, (x, t) => {
      const nums = {}; A2.taps.forEach((tt, k) => { if (t >= tt) nums[seq[k]] = (nums[seq[k]] ? nums[seq[k]] + '·' : '') + (k + 1); });
      const { b: bd } = drawRound(x, A, T, A2, t, { nums });
      slam(x, 'THE ANSWER', ta, t, W / 2, 400, 110, 99);
      progress(x, A2.taps.filter(tt => t >= tt).length, n, bd.bottom + 110);
      const f = fingerAt(A2, t, bd.pos); if (f && t < A2.end) finger(x, f.x, f.y, f.press);
      if (t > A2.end) slam(x, 'GOT IT?  ✅ or ❌', A2.end, t, W / 2, 1760, 76, 99);
    });
    T.cue(A2.end, () => SND.win());
    T.cue(aEnd, () => { SND.beat.fill(); SND.crash(); SND.beat.mode('full'); });
    T.seg(aEnd, aEnd + 4.6, (x, t) => endCard(x, A, t, aEnd, { title: 'PLAY THE FULL GAME', line: S.sanxLine || `All ${n}? You're in the top 3%.`, mood: 'shock', footer: S.footer }));
    T.wash = t => washOf(R, t);
    return T;
  };

  /* 3) DUEL — split screen: you vs Sanx, same pattern, 3 rounds, winner reveal */
  STYLES.duel = (S, A, rng) => {
    const T = TL(S.bpm || 108), b = T.beat, g = 3, you = S.youName || 'YOU', pw = S.playerWins !== false;
    T.seg(0, 3.0, (x, t) => {
      const k = eBack(t / 0.45);
      avatarDisc(x, A.av, W / 2 - 250 * k, 760, 170, '#c4a7ff', you); avatarDisc(x, A.sanxDisc, W / 2 + 250 * k, 760, 170, '#ff3d6e', 'SANX');
      slam(x, 'VS', 0.5, t, W / 2, 815, 170, 2.6, { c2: '#ffb3c6' });
      slam(x, S.hook1 || 'MEMORY DUEL', 0.9, t, W / 2, 1200, 120, 2.2); slam(x, S.hook2 || 'WHO REMEMBERS MORE?', 1.3, t, W / 2, 1330, 70, 1.8);
    });
    T.cue(0.1, () => SND.whoosh()); T.cue(0.5, () => SND.boss()); T.shake(0.5, 20, 0.4);
    let t = T.snap(3.2); const score = [0, 0], rounds = [];
    [5, 6, 7].forEach((n, i) => {
      const seq = makeSeq(rng, n, g), last = i === 2, intro = t;
      T.cue(intro, () => { SND.beat.mode(last ? 'hype' : 'full'); SND.whoosh(); });
      const RS = round(T, { seq, beat: b, start: intro + 1.0, g, only: 'show' });
      const yW = last && !pw ? n - 2 : -1, xW = last && pw ? n - 3 : -1;
      const mk = (wrongAt, off, sound) => { const taps = []; for (let k = 0; k < n; k++) { taps.push(RS.showEnd + b * 0.6 + k * b * 0.8 + off); if (k === wrongAt) break; } return { t0: -99, showEnd: RS.showEnd, inT0: RS.showEnd + b * 0.6, show: b, seq, g, taps, wrongAt, wrongTile: wrongAt >= 0 ? (seq[wrongAt] + 4) % 9 : null, end: taps[taps.length - 1] + 0.3 }; };
      const RY = mk(yW, 0), RX = mk(xW, 0.13);
      RY.taps.forEach((tt, k) => T.cue(tt, () => { if (k === RY.wrongAt) { SND.wrong(); SND.beat.drop(); } else SND.tap(seq[k]); }));
      RX.taps.forEach((tt, k) => { if (k === RX.wrongAt) T.cue(tt, () => { SND.wrong(); SND.beat.drop(); }); });
      [RY, RX].forEach(RR => { if (RR.wrongAt >= 0) { const tw = RR.taps[RR.wrongAt]; T.shake(tw, 26, 0.5); T.flash(tw, '#ff2d5a', 0.4, 0.35); T.cam(tw - 1.0, 1.06, 0, 0, 0.6); T.cam(tw + 0.4, 1, 0, 0, 0.4); } });
      const end = Math.max(RY.end, RX.end) + 0.3;
      if (!last) { score[0]++; score[1]++; T.cue(end, () => { SND.step(); }); } else if (pw) score[0]++; else score[1]++;
      rounds.push({ intro, seq, RS, RY, RX, last, end, score: score.slice() });
      t = end + 0.9;
    });
    const tw0 = rounds[2].end + 0.2;
    T.cue(tw0, () => { SND.beat.fill(); SND.crash(); SND.win(); });
    T.seg(3.0, tw0 + 3.2, (x, t) => {
      const cur = rounds.filter(r => t >= r.intro).pop() || rounds[0], i = rounds.indexOf(cur), sc = rounds.filter(r => t >= r.end).pop(), s = sc ? sc.score : [0, 0];
      x.fillStyle = 'rgba(10,3,30,.6)'; rr(x, 60, 70, W - 120, 150, 40); x.fill(); x.strokeStyle = 'rgba(154,109,245,.5)'; x.lineWidth = 3; x.stroke();
      avatarDisc(x, A.av, 150, 145, 56); avatarDisc(x, A.sanxDisc, W - 150, 145, 56, '#ff3d6e');
      bigText(x, `${s[0]}  :  ${s[1]}`, W / 2, 175, 92, { depth: 6 }); x.font = F(800, 30); x.fillStyle = '#e4d7ff'; x.textAlign = 'center'; x.fillText(`ROUND ${i + 1} / 3`, W / 2, 255);
      if (t < cur.RS.showEnd + 0.2) {
        const st = roundState(cur.RS, t), bd = board(x, A, t, Object.assign(st, { g, kick: T.P.kick, cy: 1000, size: 820 }));
        if (t < cur.RS.t0) { x.fillStyle = 'rgba(6,2,26,.4)'; x.fillRect(0, 300, W, 1400); slam(x, cur.last ? 'FINAL ROUND' : `ROUND ${i + 1}`, cur.intro, t, W / 2, 1040, 130, 1.1, cur.last ? { c2: '#ffb3c6' } : {}); }
        else { progress(x, (st.cur == null ? cur.seq.length - 1 : st.cur) + 1, cur.seq.length, bd.bottom + 100); label(x, 'BOTH WATCH THE SAME PATTERN', 330, '#e4d7ff', 40); }
      } else {
        const draw = (RR, cy, name, img, ring) => {
          const st = roundState(RR, t), bd = board(x, A, t, Object.assign(st, { g, kick: T.P.kick * 0.5, cy, size: 600 }));
          avatarDisc(x, img, 130, cy - 260, 60, ring); x.font = F(900, 42); x.fillStyle = '#fff'; x.textAlign = 'left'; x.fillText(name, 210, cy - 246);
          RR.taps.forEach((tt, k) => { const tile = k === RR.wrongAt ? RR.wrongTile : RR.seq[k]; if (bd.pos[tile]) ripple(x, bd.pos[tile].x, bd.pos[tile].y, t - tt, k === RR.wrongAt ? '#ff2d5a' : '#fff'); });
          const f = fingerAt(RR, t, bd.pos); if (f && t < RR.end + 0.3) finger(x, f.x, f.y, f.press, 0.72);
          if (RR.wrongAt >= 0 && t > RR.taps[RR.wrongAt]) slam(x, 'WRONG!', RR.taps[RR.wrongAt], t, W / 2, cy + 40, 130, 99, { c2: '#ffb3c6' });
          else if (t > RR.end && !cur.last) slam(x, '✔ PERFECT', RR.end, t, W / 2, cy + 30, 90, 99);
        };
        draw(cur.RY, 690, you, A.av, '#c4a7ff'); draw(cur.RX, 1395, 'SANX', A.sanxDisc, '#ff3d6e');
        x.fillStyle = 'rgba(196,167,255,.5)'; x.fillRect(80, 1040, W - 160, 4);
      }
      if (t >= tw0) { x.fillStyle = `rgba(6,2,26,${clamp((t - tw0) / 0.3) * 0.72})`; x.fillRect(0, 0, W, H); slam(x, pw ? `${you} WINS!` : 'SANX WINS!', tw0, t, W / 2, 860, 140, 99); avatarDisc(x, pw ? A.av : A.sanxDisc, W / 2, 1200, 180 * eBack((t - tw0 - 0.2) / 0.5), pw ? '#c4a7ff' : '#ff3d6e'); confetti(x, A, tw0, t, W / 2, 800); }
    });
    const e0 = tw0 + 3.2; T.cue(e0, () => { SND.beat.mode('full'); SND.crash(); });
    T.seg(e0, e0 + 4.6, (x, t) => endCard(x, A, t, e0, { title: 'DUEL YOUR FRIENDS', line: S.sanxLine || (pw ? 'Lucky. Rematch?' : 'Nobody beats Sanx.'), mood: pw ? 'shock' : 'laugh', footer: S.footer }));
    T.wash = t => { const cur = rounds.filter(r => t >= r.intro).pop(); return cur && t < cur.RS.showEnd ? washOf(cur.RS, t) : null; };
    T.red = t => { for (const r of rounds) for (const RR of [r.RY, r.RX]) if (RR.wrongAt >= 0) { const u = t - RR.taps[RR.wrongAt]; if (u >= 0 && u < 1.4) return 1 - u / 1.4; } return 0; };
    return T;
  };

  /* 4) RHYTHM RUSH — music-video energy, 8th-note flashes, combo to x24, then a mini challenge */
  STYLES.rush = (S, A, rng) => {
    const T = TL(S.bpm || 124), b = T.beat, g = S.grid || 3, words = S.words || ['REMEMBER', 'THE', 'BEAT'];
    T.seg(0, T.snap(2.7) + 0.02, (x, t) => { words.forEach((w, i) => slam(x, w, i * b - 0.3, t, W / 2, 760 + i * 175, 150, 2.5 - i * b)); sanx(x, A, t, { t0: 1.4, mood: 'smug', line: 'Keep up if you can.' }); });
    words.forEach((w, i) => { T.cue(0.02 + i * b, () => SND.tick()); T.shake(i * b, 12, 0.2); });
    const r0 = T.snap(2.7), n = 24, half = b / 2, seq = makeSeq(rng, n, g);
    T.cue(r0, () => { SND.beat.mode('hype'); SND.crash(); });
    seq.forEach((v, k) => { const tt = r0 + k * half; T.cue(tt, () => { SND.tile(v, half * 0.7); T.P.kick = 1; }); if (k % 4 === 0) { T.cam(tt, 1.06, k % 8 ? 34 : -34, 0, 0.06); T.cam(tt + 0.07, 1, 0, 0, half * 3); } if (k % 8 === 7) T.flash(tt, '#c4a7ff', 0.2, 0.25); });
    const rEnd = r0 + n * half + 0.4;
    T.seg(r0, T.snap(rEnd) + 0.02, (x, t) => {
      const k = Math.min(n - 1, Math.floor((t - r0) / half)), fr = (t - r0 - k * half) / half, lit = {}; lit[seq[k]] = fr < 0.6 ? 1 : clamp(1 - (fr - 0.6) / 0.4);
      const bd = board(x, A, t, { g, lit, kick: T.P.kick }), combo = k + 1;
      x.save(); const pk = 1 + (1 - fr) * 0.15; x.translate(W / 2, 420); x.scale(pk, pk); bigText(x, `x${combo}`, 0, 0, 160, { c2: combo > 16 ? '#ffb3c6' : '#cbb2ff' }); x.restore();
      label(x, combo >= 20 ? 'INSANE!' : combo >= 12 ? 'PERFECT STREAK' : 'COMBO', 500, '#fff', 50);
      progress(x, combo, n, bd.bottom + 110);
    });
    const c0 = T.snap(rEnd), last = seq.slice(-6), ans = 4;
    T.cue(c0, () => { SND.beat.mode('light'); SND.whoosh(); });
    for (let s = 0; s < ans; s++) T.cue(c0 + s, () => SND.tick());
    T.seg(c0, T.snap(c0 + ans) + 0.02, (x, t) => { const nums = {}; for (let i = 0; i < g * g; i++) nums[i] = i + 1; const bd = board(x, A, t, { g, nums }); slam(x, 'WHAT WERE THE', c0, t, W / 2, 360, 92, ans + 1); slam(x, 'LAST 6 TILES?', c0 + 0.3, t, W / 2, 490, 112, ans + 1, { c2: '#ffb3c6' }); bigText(x, String(Math.max(1, Math.ceil(c0 + ans - t))), W / 2, bd.bottom + 170, 110); });
    const ta = T.snap(c0 + ans), aT = k => ta + 0.3 + k * b;
    T.cue(ta, () => { SND.beat.mode('hype'); SND.crash(); }); T.flash(ta, '#fff', 0.3, 0.45);
    last.forEach((v, k) => T.cue(aT(k), () => { SND.tile(v, b * 0.6); T.P.kick = 1; }));
    const aEnd = aT(6) + 1.6;
    T.seg(ta, aEnd, (x, t) => { const nums = {}, lit = {}; last.forEach((v, k) => { if (t >= aT(k)) nums[v] = (nums[v] ? nums[v] + '·' : '') + (k + 1); if (t >= aT(k) && t < aT(k) + b * 0.7) lit[v] = 1; }); const bd = board(x, A, t, { g, nums, lit, kick: T.P.kick }); slam(x, 'ANSWER', ta, t, W / 2, 420, 120, 99); if (t > aT(6)) slam(x, 'COMMENT YOUR SCORE /6', aT(6), t, W / 2, bd.bottom + 130, 64, 99); });
    T.cue(aEnd, () => { SND.beat.fill(); SND.crash(); });
    T.seg(aEnd, aEnd + 4.6, (x, t) => endCard(x, A, t, aEnd, { title: 'FEEL THE BEAT', line: S.sanxLine || 'My game has 500+ levels like this.', footer: S.footer }));
    T.wash = t => { if (t < r0 || t > rEnd) return null; const k = Math.min(n - 1, Math.floor((t - r0) / half)); return { c: COLORS[seq[k] % COLORS.length], a: 0.85 }; };
    return T;
  };

  /* 5) SO CLOSE — two painful fails on the last tile, the third try finally makes it */
  STYLES.close = (S, A, rng) => {
    const T = TL(S.bpm || 104), b = T.beat, g = 3, n = S.len || 7, seq = makeSeq(rng, n, g);
    T.seg(0, 2.8, (x, t) => { slam(x, S.hook1 || '1 TILE AWAY', -0.3, t, W / 2, 860, 150, 2.7, { c2: '#ffb3c6' }); slam(x, S.hook2 || 'EVERY. SINGLE. TIME.', 0.8, t, W / 2, 1030, 76, 2); sanx(x, A, t, { t0: 1.3, mood: 'laugh', line: 'This one is painful. Hehe.' }); });
    T.cue(0.1, () => SND.boss()); T.cam(0, 1.15, 0, 0, 0); T.cam(0.1, 1, 0, 0, 1.2);
    const atts = []; let t = T.snap(3.0);
    [n - 1, n - 1, -1].forEach((wrongAt, i) => {
      const intro = t;
      T.cue(intro, () => { SND.whoosh(); SND.beat.mode(i === 2 ? 'hype' : 'full'); });
      const R = round(T, { seq, beat: b, start: intro + 1.0, g, wrongAt, slowLast: true, showBeat: i === 0 ? b : b * 0.6, tapBeat: i === 0 ? b * 0.9 : b * 0.7 });
      const tl = R.taps[R.taps.length - 1];
      T.cam(tl - 1.4, 1.3, 0, -30, 1.0); T.cam(tl + 0.5, 1, 0, 0, 0.5);
      if (wrongAt < 0) { T.cue(tl, () => { SND.beat.fill(); SND.crash(); SND.win(); }); T.flash(tl, '#ffffff', 0.4, 0.5); T.shake(tl, 14, 0.4); }
      else T.cue(tl + 0.05, () => SND.beat.mode('still'));
      atts.push({ R, intro, i, win: wrongAt < 0, tl });
      t = R.end + (wrongAt < 0 ? 2.9 : 2.1);
    });
    const shout = ['NOOO! 😤', 'NOT AGAIN…', ''];
    T.seg(2.8, t, (x, t2) => {
      const cur = atts.filter(a => t2 >= a.intro).pop() || atts[0], R = cur.R;
      hud(x, A, { max: 3, hearts: 3 - atts.filter(a => !a.win && t2 >= a.tl).length, level: 15, coins: 1240 });
      if (t2 < R.t0) { board(x, A, t2, { g, alpha: 0.4 }); slam(x, `ATTEMPT ${cur.i + 1}`, cur.intro, t2, W / 2, 1040, 130, 1.1); sanx(x, A, t2, cur.i ? { t0: cur.intro, mood: 'smug', line: cur.i === 1 ? 'Again? Sure.' : 'Last chance…' } : null); return; }
      const { b: bd, st } = drawRound(x, A, T, R, t2);
      if (st.phase === 'show') progress(x, st.cur + 1, n, bd.bottom + 110);
      else if (t2 < cur.tl + 0.1) { const tense = R.taps.length > 1 && t2 > R.taps[R.taps.length - 2]; label(x, tense ? 'THE LAST ONE…' : `${Math.min(n, R.taps.filter(tt => t2 >= tt).length)} / ${n}`, bd.bottom + 110, tense ? '#ffb3c6' : '#fff', 60); }
      const f = fingerAt(R, t2, bd.pos); if (f && t2 < cur.tl + 0.4) finger(x, f.x, f.y, f.press);
      if (t2 >= cur.tl) { if (cur.win) { slam(x, 'FINALLY!!!', cur.tl, t2, W / 2, 820, 170, 99); confetti(x, A, cur.tl, t2, W / 2, 700); } else slam(x, shout[cur.i], cur.tl + 0.1, t2, W / 2, 840, 140, 1.9, { c2: '#ffb3c6' }); }
      if (t2 >= cur.tl) sanx(x, A, t2, { t0: cur.tl + 0.3, mood: cur.win ? 'shock' : 'laugh', line: cur.win ? 'Okay… respect.' : cur.i === 0 ? 'HAHA so close!' : 'Hahaha! AGAIN!' });
    });
    const e0 = t; T.cue(e0, () => SND.beat.mode('full'));
    T.seg(e0, e0 + 4.6, (x, t2) => endCard(x, A, t2, e0, { title: 'YOUR TURN.', line: S.sanxLine || 'Bet you need 4 tries.', footer: S.footer }));
    T.wash = t2 => { const cur = atts.filter(a => t2 >= a.intro).pop(); return cur ? washOf(cur.R, t2) : null; };
    T.red = t2 => { const a = atts.find(a => !a.win && t2 >= a.tl && t2 < a.tl + 1.6); return a ? clamp(1 - (t2 - a.tl) / 1.6) : 0; };
    return T;
  };

  /* 6) BRAG — the in-app Save Clip: your best pattern played by the finger, then your score */
  STYLES.brag = (S, A, rng) => {
    const T = TL(S.bpm || 104), b = T.beat, seq = S.seq, n = seq.length, g = S.grid || 3;
    T.seg(0, 2.6, (x, t) => { if (A.av) avatarDisc(x, A.av, W / 2, 560, 140 * eBack((t - 0.2) / 0.5)); slam(x, 'CAN YOU BEAT', -0.3, t, W / 2, 870, 130, 2.5); slam(x, 'MY MEMORY?', 0.65, t, W / 2, 1040, 140, 1.95, { c2: '#e6d8ff' }); if (S.name && t > 1) chip(x, S.name, W / 2, 1160, 40); });
    T.cue(0.1, () => SND.boss()); T.cue(0.65, () => SND.whoosh());
    const beat = n * b > 9 ? Math.max(0.32, 9 / n) : b;
    const R = round(T, { seq, beat, start: 2.8, g, wrongAt: -1, tapBeat: beat * 0.8 });
    T.cue(R.t0, () => SND.beat.mode(n > 8 ? 'hype' : 'full'));
    T.seg(2.6, R.end + 0.4, (x, t) => {
      hud(x, A, { max: 3, hearts: 3, level: S.level || null, coins: S.coins || 0 });
      const { b: bd, st } = drawRound(x, A, T, R, t);
      if (st.phase === 'show') progress(x, (st.cur || 0) + 1, n, bd.bottom + 110); else if (st.phase) label(x, `${Math.min(n, R.taps.filter(tt => t >= tt).length)} / ${n}`, bd.bottom + 110);
      const f = fingerAt(R, t, bd.pos); if (f && t < R.end) finger(x, f.x, f.y, f.press);
    });
    const s0 = R.end + 0.4; T.cue(s0, () => { SND.beat.fill(); SND.crash(); SND.win(); }); T.flash(s0, '#fff', 0.3, 0.5); T.shake(s0, 18, 0.4);
    T.seg(s0, s0 + 3.6, (x, t) => { board(x, A, t, { g, alpha: 0.2 }); slam(x, 'I REMEMBERED', s0, t, W / 2, 560, 96, 99); const k = eBack((t - s0 - 0.3) / 0.5); x.save(); x.translate(W / 2, 900); x.scale(k, k); digits(x, A, S.score || n, 0, 0, 420); x.restore(); if (t > s0 + 0.8) bigText(x, 'TILES', W / 2, 1230, 110); if (S.rank && t > s0 + 1.2) chip(x, S.rank, W / 2, 1345, 44); confetti(x, A, s0 + 0.3, t, W / 2, 700); });
    const e0 = s0 + 3.6; T.cue(e0, () => SND.beat.mode('full'));
    T.seg(e0, e0 + 4.4, (x, t) => endCard(x, A, t, e0, { title: S.endTitle || 'BEAT MY SCORE', line: S.sanxLine || 'My memory is still better.', mood: S.mood2 || 'smug', cta: S.cta || 'PLAY FREE', footer: S.footer }));
    T.wash = t => washOf(R, t);
    return T;
  };

  /* ================= ASSETS + RENDER ================= */
  async function assets(spec) {
    try { await document.fonts.load(F(900, 40)); await document.fonts.load(F(800, 30)); } catch (e) { }
    const sx = {}; for (const m of ['smug', 'laugh', 'shock', 'angry', 'sad']) sx[m] = await svgImg(ART.sanx(m));
    const rng = mul(77);
    return {
      logo: await load('img/logo.png'), gplay: await load('share/gplay.png'),
      digits: await Promise.all([...Array(10).keys()].map(d => load(`share/d${d}.png`))),
      sanx: sx, sanxDisc: sx.smug, av: spec.avatar ? await load(spec.avatar) : null,
      dust: Array.from({ length: 50 }, () => ({ x: rng() * W, y: rng() * H, r: 1.5 + rng() * 3, s: 10 + rng() * 30, a: 0.15 + rng() * 0.35 })),
      conf: Array.from({ length: 90 }, () => ({ vx: (rng() - 0.5) * 30, vy: -10 - rng() * 22, r: rng() * 6, vr: (rng() - 0.5) * 12, w: 14 + rng() * 14, h: 8 + rng() * 10, c: ['#9a6df5', '#c4a7ff', '#ffffff', '#743ae8', '#ff3d7f', '#00e5ff'][Math.floor(rng() * 6)] }))
    };
  }
  function build(spec, A) { const T = (STYLES[spec.style] || STYLES.play)(spec, A, mul(spec.seed || 1)); T.total = T.end; return T; }
  function frame(x, A, T, t, scale, dt = 1 / 30) {
    x.setTransform(scale, 0, 0, scale, 0, 0);
    T.P.kick *= Math.pow(0.86, dt * 30);
    const c = camAt(T, t);
    let sx = 0, sy = 0; for (const s of T.shakes) { const u = t - s.t; if (u >= 0 && u < s.d) { const k = (1 - u / s.d) * s.amp; sx += Math.sin(u * 90) * k; sy += Math.cos(u * 77) * k; } }
    x.save(); x.translate(W / 2 + c.x + sx, H / 2 + c.y + sy); x.scale(c.z, c.z); x.translate(-W / 2, -H / 2);
    const wash = T.wash ? T.wash(t) : null;
    bg(x, A, t, wash, wash ? 0.8 : 0.4);
    for (const s of T.segs) if (t >= s.a && t < s.b) s.draw(x, t);
    x.restore();
    vignette(x, T.red ? T.red(t) : 0);
    for (const f of T.flashes) { const u = t - f.t; if (u >= 0 && u < f.d) { x.globalAlpha = f.a * (1 - u / f.d); x.fillStyle = f.col; x.fillRect(0, 0, W, H); x.globalAlpha = 1; } }
  }
  async function make(spec, { w = 720, h = 1280, fps = 30, onProgress, canvas } = {}) {
    if (!canRecord()) throw new Error('This phone cannot record video');
    const cv = canvas || document.createElement('canvas'); cv.width = w; cv.height = h;
    const x = cv.getContext('2d'), A = await assets(spec), T = build(spec, A), scale = w / W;
    const vs = cv.captureStream(fps), as = SND.rec(true);
    const stream = new MediaStream([...vs.getVideoTracks(), ...(as ? as.getAudioTracks() : [])]);
    const mime = pickMime();
    const recd = new MediaRecorder(stream, Object.assign({ videoBitsPerSecond: w >= 1080 ? 10e6 : 6e6, audioBitsPerSecond: 160000 }, mime ? { mimeType: mime } : {}));
    const chunks = []; recd.ondataavailable = e => e.data && e.data.size && chunks.push(e.data);
    const done = new Promise(res => { recd.onstop = res; });
    SND.beat.stop(); SND.beat.start(T.bpm, 'light');
    frame(x, A, T, 0, scale);
    recd.start(250);
    const T0 = SND.beat.t0 || SND.now(), cues = T.cues.slice().sort((a, b) => a.t - b.t); let ci = 0, last = 0;
    await new Promise(res => {
      const loop = () => {
        const t = SND.now() - T0;
        while (ci < cues.length && cues[ci].t <= t) { try { cues[ci].fn(); } catch (e) { } ci++; }
        frame(x, A, T, Math.max(0, Math.min(t, T.total)), scale, Math.max(0.001, t - last)); last = t;
        if (onProgress) onProgress(Math.min(1, t / T.total));
        if (t >= T.total + 0.3) return res();
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    });
    recd.stop(); await done;
    SND.beat.stop(); SND.rec(false);
    const type = (recd.mimeType || mime || 'video/webm').split(';')[0];
    return { blob: new Blob(chunks, { type }), mime: type, ext: type.includes('mp4') ? 'mp4' : 'webm', secs: T.total };
  }
  /* live preview with sound (Studio) */
  async function preview(spec, canvas, w = 540, h = 960, withSound = true) {
    canvas.width = w; canvas.height = h; const x = canvas.getContext('2d'), A = await assets(spec), T = build(spec, A);
    const cues = T.cues.slice().sort((a, b) => a.t - b.t); let ci = 0, last = 0;
    if (withSound) { SND.beat.stop(); SND.beat.start(T.bpm, 'light'); }
    const T0 = withSound ? (SND.beat.t0 || SND.now()) : 0;
    return {
      total: T.total,
      draw: tt => { const t = withSound ? SND.now() - T0 : tt; if (withSound) while (ci < cues.length && cues[ci].t <= t) { try { cues[ci].fn(); } catch (e) { } ci++; } frame(x, A, T, Math.max(0, Math.min(t, T.total)), w / W, Math.max(0.001, t - last)); last = t; return t; },
      stop: () => { if (withSound) SND.beat.stop(); }
    };
  }
  /* draw one frame at time t (for thumbnails / tests) */
  async function still(spec, canvas, t, w = 540, h = 960) { canvas.width = w; canvas.height = h; const x = canvas.getContext('2d'), A = await assets(spec), T = build(spec, A); frame(x, A, T, t, w / W); return T.total; }
  return { make, preview, still, canRecord, pickMime, STYLES: Object.keys(STYLES), COLORS };
})();

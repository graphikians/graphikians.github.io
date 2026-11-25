/* ================= MACHHAR MAARO STUDIO · ENGINE, COMPOSITOR, RENDER =================
   The real game runs in a hidden frame. For every video frame the Studio moves the game
   forward by exactly 1/30 s (or slower for slow motion), takes the real 1080×1920 game
   picture and builds the final frame on top: camera moves, frames, captions, cards, cuts,
   intro and outro. Sound: the game's own sounds are captured frame-exact, the music is
   built for this exact timeline, then everything is mixed (music ducks under game sounds)
   and joined into an H.264 + AAC MP4. Nothing leaves the device.
======================================================================================= */
const STUDIO = (() => {
  const FPS = 30;
  const BLUE = '#5fd0ff', P1 = '#743ae8', P2 = '#9a6df5', INK = '#12063a';
  const FONT = 'Inter, system-ui, sans-serif';
  const ENG = { win: null, S: null, D: null };
  const IMG = {};
  const img = k => { if (!k) return null; if (!IMG[k]) { const im = new Image(); im.decoding = 'async'; im.src = 'game/art/' + k + '.webp'; IMG[k] = im; } return IMG[k]; };
  const ok = im => im && im.complete && im.naturalWidth > 0;
  const loadImgs = ks => Promise.all(ks.map(k => new Promise(res => { const im = img(k); if (ok(im)) return res(); im.onload = im.onerror = () => res(); setTimeout(res, 8000); })));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const easeIO = t => { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const back = t => { t = clamp(t, 0, 1); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* ---------- engine ---------- */
  async function initEngine(frame) {
    if (ENG.S) return ENG;
    await new Promise((res, rej) => { const to = setTimeout(() => rej(new Error('Game engine did not load')), 30000); const chk = () => { const w = frame.contentWindow; if (w && w.STU && w.__mm && w.R7 && w.R9 && w.document.readyState === 'complete') { clearTimeout(to); res(); } else setTimeout(chk, 100); }; chk(); });
    ENG.win = frame.contentWindow; ENG.S = ENG.win.STU;
    await ENG.S.boot(); ENG.D = ENG.S.data();
    /* English for the few game lines that are still Hinglish */
    const EN = { turbo: 'Battery charges 70% faster', cricket: 'Fast swipe = SIXER! 1.5x points', brahmastra: 'Every 10th zap = FREE Mega Zap + chain', sasta: 'Where every hero starts' };
    for (const r of ENG.D.rackets || []) if (EN[r.id]) r.sp = EN[r.id];
    await loadImgs(['appicon', 'm1', 'm2', 'room', 'room_hospital', 'room_yamlok', 'u_inject', 'u_hospbed', 'u_halo', 'trophy']);
    return ENG;
  }

  /* resolve a shot level: number, special world, or base level with overrides */
  function resolveLv(lv) {
    const S = ENG.S;
    let L;
    if (typeof lv === 'number') L = ENG.win.__mm.LEVELS[lv - 1];
    else if (lv && lv.sp) L = S.level(lv.sp, lv.i, lv.ch);
    else if (lv && lv.over) L = Object.assign({}, ENG.win.__mm.LEVELS[(lv.n || 5) - 1], lv.over);
    else L = ENG.win.__mm.LEVELS[2];
    if (typeof L !== 'object') L = ENG.win.__mm.LEVELS[2];
    /* videos never end by accident: no fail rules, no early finish (the Studio decides when to win) */
    L = Object.assign({}, L);
    const FAIL = ['nobite', 'limbat', 'limzap', 'jugnu', 'combo', 'score', 'timeattack', 'rani', 'multi', 'sleepwalk', 'dark', 'powercut', 'collect', 'swipe'];
    if (FAIL.includes(L.task)) { L.task = 'kill'; L.target = 300; }
    if (L.task !== 'boss') { if (L.len) L.len = L.len + 300; if (L.target) L.target = Math.max(L.target * 6, 200); }
    L.maxBites = 999; if (L.zaps) L.zaps = 999;
    return L;
  }
  async function prepShot(sh, seed, prev) {
    const S = ENG.S;
    if (sh.cont && prev) { S.setBot(sh.bot || { mode: 'pro' }); S.floor = sh.floor != null ? sh.floor : null; return; }
    S.mute(true);
    S.setup({ seed, char: sh.char || 'papa', racket: sh.racket });
    const lv = resolveLv(sh.lv);
    const info = S.start(lv, sh.boosts || {});
    const need = ['r_' + (sh.racket || 'sasta')]; if (info.boss) need.push('b_' + info.boss);
    await S.images(need);
    S.setBot(sh.bot || { mode: 'pro' }); S.floor = sh.floor != null ? sh.floor : null;
    /* fast-forward without drawing so the scene opens mid-action */
    const n = Math.round((sh.pre || 0) * FPS);
    for (let i = 0; i < n; i++) S.step(1 / FPS, false);
    await S.images();
    for (let i = 0; i < 3; i++) S.step(1 / FPS, false);
  }

  /* ---------- camera that follows the action ---------- */
  function newCam() { return { z: 1, x: 540, y: 960, punch: 0, lastKills: 0, lastScore: 0 }; }
  function camUpdate(cam, mode, info, local, segDur) {
    const W = 1080, H = 1920, k = 2;  // engine coords are CSS px (540×960) → ×2
    let fx = 540, fy = 900, z = 1.04;
    if (info && info.state) {
      if (mode === 'boss' && info.boss) { fx = info.boss.x * k; fy = info.boss.y * k + 120; z = 1.18; }
      else if (mode === 'papa' && info.sleeper) { fx = info.sleeper.x * k + 180; fy = info.sleeper.y * k - 260; z = 1.16; }
      else if (mode === 'wide') { z = 1; }
      else { fx = 540; fy = 980; z = 1.05 + 0.05 * Math.sin(local * 0.6); if (info.boss) { fx = (540 + info.boss.x * k) / 2; fy = (980 + info.boss.y * k) / 2; } }
      if (info.kills > cam.lastKills) cam.punch = Math.min(0.06, cam.punch + 0.035);
      cam.lastKills = info.kills || 0;
      if (info.cine === 'wake' || info.cine === 'fail') { z = 1.22; if (info.sleeper) { fx = info.sleeper.x * k + 160; fy = info.sleeper.y * k - 200; } }
    }
    cam.punch *= 0.86;
    cam.z += (z - cam.z) * 0.06; cam.x += (fx - cam.x) * 0.07; cam.y += (fy - cam.y) * 0.07;
    return cam;
  }
  /* draw the real game picture with the camera, cover-fit into rect */
  function drawGame(x, src, cam, rx, ry, rw, rh) {
    const z = Math.max(1, cam.z + cam.punch), sw0 = 1080 / z, sh0 = 1920 / z;
    const ar = rw / rh; let sw = sw0, sh = sw0 / ar; if (sh > sh0) { sh = sh0; sw = sh0 * ar; }
    const sx = clamp(cam.x - sw / 2, 0, 1080 - sw), sy = clamp(cam.y - sh / 2, 0, 1920 - sh);
    try { x.drawImage(src, sx, sy, sw, sh, rx, ry, rw, rh); } catch (e) { }
  }
  const tiny = document.createElement('canvas'); tiny.width = 54; tiny.height = 96;
  function drawBlurBg(x, src, OW, OH, dark = 0.55) {
    const tx = tiny.getContext('2d'); try { tx.drawImage(src, 0, 0, 54, 96); } catch (e) { }
    x.save(); x.imageSmoothingQuality = 'high'; x.drawImage(tiny, -20, -20, OW + 40, OH + 40); x.fillStyle = `rgba(18,6,58,${dark})`; x.fillRect(0, 0, OW, OH); x.restore();
  }
  function rr(x, X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }

  /* ---------- frames (how the game sits in the video) ---------- */
  function frameGame(x, frame, src, cam, OW, OH, t, extra) {
    if (frame === 'full') { drawGame(x, src, cam, 0, 0, OW, OH); return { top: OH * 0.12, bottom: OH * 0.86 }; }
    if (frame === 'cinema') {
      drawGame(x, src, cam, 0, 0, OW, OH);
      const b = OH * 0.13; const g1 = x.createLinearGradient(0, 0, 0, b); g1.addColorStop(0, '#0b0326'); g1.addColorStop(1, 'rgba(11,3,38,.92)');
      x.fillStyle = g1; x.fillRect(0, 0, OW, b); const g2 = x.createLinearGradient(0, OH - b, 0, OH); g2.addColorStop(0, 'rgba(11,3,38,.92)'); g2.addColorStop(1, '#0b0326'); x.fillStyle = g2; x.fillRect(0, OH - b, OW, b);
      x.fillStyle = 'rgba(95,208,255,.6)'; x.fillRect(0, b - 2, OW, 2); x.fillRect(0, OH - b, OW, 2);
      return { top: b * 0.5, bottom: OH - b * 0.5, inBars: true, bar: b };
    }
    drawBlurBg(x, src, OW, OH);
    if (frame === 'neon') {
      const m = OW * 0.06, top = OH * 0.17, h = OH - top - OH * 0.05, w = OW - m * 2, r = 48;
      x.save(); x.shadowColor = BLUE; x.shadowBlur = 40; rr(x, m, top, w, h, r); x.strokeStyle = BLUE; x.lineWidth = 8; x.stroke(); x.restore();
      x.save(); rr(x, m, top, w, h, r); x.clip(); drawGame(x, src, cam, m, top, w, h); x.restore();
      const g = x.createLinearGradient(m, top, m + w, top + h); g.addColorStop(0, P2); g.addColorStop(0.5, BLUE); g.addColorStop(1, P1);
      x.save(); rr(x, m, top, w, h, r); x.strokeStyle = g; x.lineWidth = 6; x.stroke(); x.restore();
      return { top: top * 0.5, bottom: top + h - 60 };
    }
    if (frame === 'phone') {
      const pw = OW * 0.74, ph = Math.min(OH * 0.78, pw * 2.05), px = (OW - pw) / 2, py = OH * 0.2;
      x.save(); x.translate(OW / 2, py + ph / 2); x.rotate(-0.025 + Math.sin(t * 0.5) * 0.006); x.translate(-OW / 2, -(py + ph / 2));
      phoneBody(x, px, py, pw, ph, (sx, sy, sw, sh) => drawGame(x, src, cam, sx, sy, sw, sh));
      x.restore();
      return { top: py * 0.5, bottom: py + ph * 0.9 };
    }
    if (frame === 'split') {
      const gh = Math.round(OH * 0.62);
      drawGame(x, src, cam, 0, 0, OW, gh);
      x.fillStyle = INK; x.fillRect(0, gh, OW, OH - gh);
      const g = x.createLinearGradient(0, gh, OW, gh); g.addColorStop(0, P1); g.addColorStop(0.5, BLUE); g.addColorStop(1, P2); x.fillStyle = g; x.fillRect(0, gh - 4, OW, 8);
      if (extra && extra.cam) {
        const m = 34, cy = gh + 30, ch = OH - gh - 60, cw = OW - m * 2;
        x.save(); rr(x, m, cy, cw, ch, 36); x.clip(); const v = extra.cam, vw = v.videoWidth || v.width || 16, vh = v.videoHeight || v.height || 9, s = Math.max(cw / vw, ch / vh);
        try { x.drawImage(v, m + (cw - vw * s) / 2, cy + (ch - vh * s) / 2, vw * s, vh * s); } catch (e) { } x.restore();
        x.save(); rr(x, m, cy, cw, ch, 36); x.strokeStyle = BLUE; x.lineWidth = 5; x.shadowColor = BLUE; x.shadowBlur = 20; x.stroke(); x.restore();
        return { top: OH * 0.06, bottom: gh - 40, panel: null };
      }
      return { top: OH * 0.06, bottom: gh - 40, panel: { y: gh, h: OH - gh } };
    }
    drawGame(x, src, cam, 0, 0, OW, OH); return { top: OH * 0.12, bottom: OH * 0.86 };
  }
  /* a realistic phone: metal edge, glass, island, side buttons, reflection, soft shadow */
  function phoneBody(x, px, py, pw, ph, screen) {
    const r = pw * 0.13, bez = pw * 0.035;
    x.save(); x.shadowColor = 'rgba(5,0,25,.75)'; x.shadowBlur = 80; x.shadowOffsetY = 40; rr(x, px, py, pw, ph, r); x.fillStyle = '#1a1230'; x.fill(); x.restore();
    const edge = x.createLinearGradient(px, py, px + pw, py + ph); edge.addColorStop(0, '#5b5376'); edge.addColorStop(0.25, '#2a2440'); edge.addColorStop(0.55, '#8a83a8'); edge.addColorStop(0.8, '#2a2440'); edge.addColorStop(1, '#4b4466');
    rr(x, px, py, pw, ph, r); x.fillStyle = edge; x.fill();
    rr(x, px + 5, py + 5, pw - 10, ph - 10, r - 5); x.fillStyle = '#05030c'; x.fill();
    x.fillStyle = '#3a3454'; x.fillRect(px - 6, py + ph * 0.2, 6, ph * 0.08); x.fillRect(px - 6, py + ph * 0.31, 6, ph * 0.08); x.fillRect(px + pw, py + ph * 0.25, 6, ph * 0.12);
    const sx = px + bez, sy = py + bez, sw = pw - bez * 2, sh = ph - bez * 2;
    x.save(); rr(x, sx, sy, sw, sh, r - bez); x.clip(); screen(sx, sy, sw, sh);
    const gl = x.createLinearGradient(sx, sy, sx + sw, sy + sh * 0.6); gl.addColorStop(0, 'rgba(255,255,255,.14)'); gl.addColorStop(0.35, 'rgba(255,255,255,.03)'); gl.addColorStop(0.36, 'rgba(255,255,255,0)'); x.fillStyle = gl; x.fillRect(sx, sy, sw, sh);
    x.restore();
    const iw = sw * 0.3, ih = sw * 0.075; rr(x, px + (pw - iw) / 2, sy + ih * 0.5, iw, ih, ih / 2); x.fillStyle = '#000'; x.fill();
  }

  /* ---------- text ---------- */
  function parseRich(s) { const out = []; String(s).split(/(\*[^*]+\*)/).forEach(p => { if (!p) return; if (p[0] === '*' && p[p.length - 1] === '*') p.slice(1, -1).split(/(\s+)/).forEach(w => w && out.push({ w, hi: 1 })); else p.split(/(\s+)/).forEach(w => w && out.push({ w, hi: 0 })); }); return out; }
  function wrap(x, words, maxW) { const lines = [[]]; let lw = 0; for (const t of words) { const w = x.measureText(t.w).width; if (/^\s+$/.test(t.w)) { if (lines[lines.length - 1].length) { lines[lines.length - 1].push(t); lw += w; } continue; } if (lw + w > maxW && lines[lines.length - 1].length) { while (lines[lines.length - 1].length && /^\s+$/.test(lines[lines.length - 1][lines[lines.length - 1].length - 1].w)) lines[lines.length - 1].pop(); lines.push([]); lw = 0; } lines[lines.length - 1].push(t); lw += w; } return lines.filter(l => l.length); }
  function drawCaption(x, text, type, o) {
    const { cx, y, size, maxW, a = 1, sc = 1, rot = 0, align = 'center' } = o;
    if (a <= 0) return 0;
    x.save(); x.globalAlpha = clamp(a, 0, 1); x.translate(cx, y); x.rotate(rot); x.scale(sc, sc);
    const weight = type === 'minimal' ? 800 : 900; x.font = `${weight} ${size}px ${FONT}`; x.textBaseline = 'middle';
    const words = parseRich(text), lines = wrap(x, words, maxW), lh = size * (type === 'block' ? 1.28 : 1.12);
    const hTot = lines.length * lh; let yy = -hTot / 2 + lh / 2;
    for (const ln of lines) {
      const lw = ln.reduce((s, t) => s + x.measureText(t.w).width, 0);
      let xx = align === 'left' ? 0 : -lw / 2;
      if (type === 'block') { const px = size * 0.32, py = size * 0.12; x.save(); x.shadowColor = 'rgba(10,0,40,.5)'; x.shadowBlur = 20; x.shadowOffsetY = 6; rr(x, xx - px, yy - lh / 2 + py * 0.3, lw + px * 2, lh - py * 0.3, size * 0.22); x.fillStyle = P1; x.fill(); x.restore(); }
      if (type === 'minimal') { x.fillStyle = 'rgba(18,6,58,.82)'; rr(x, xx - size * 0.4, yy - lh / 2, lw + size * 0.8, lh, 10); x.fill(); x.fillStyle = BLUE; x.fillRect(xx - size * 0.4, yy - lh / 2, 8, lh); }
      for (const t of ln) {
        const w = x.measureText(t.w).width;
        if (type === 'comic') { x.lineJoin = 'round'; x.lineWidth = size * 0.2; x.strokeStyle = '#1b0a4d'; x.strokeText(t.w, xx, yy); }
        if (type === 'neon') { x.shadowColor = t.hi ? BLUE : P2; x.shadowBlur = size * 0.45; }
        else if (type !== 'block') { x.shadowColor = 'rgba(8,0,30,.75)'; x.shadowBlur = size * 0.25; x.shadowOffsetY = size * 0.05; }
        x.fillStyle = t.hi ? (type === 'block' ? '#bfeeff' : BLUE) : '#fff';
        x.fillText(t.w, xx, yy); x.shadowBlur = 0; x.shadowOffsetY = 0; xx += w;
      }
      yy += lh;
    }
    x.restore(); return hTot * sc;
  }
  function capAnim(type, local, len) {
    const a = clamp(local / 0.18, 0, 1) * clamp((len - local) / 0.16, 0, 1);
    let sc = 1, rot = 0;
    if (type === 'comic') { sc = 0.6 + 0.4 * back(local / 0.32); rot = -0.04; }
    else if (type === 'block') sc = 0.85 + 0.15 * back(local / 0.25);
    else if (type === 'neon') sc = 0.96 + 0.04 * ease(local / 0.3);
    return { a, sc, rot };
  }
  function pill(x, text, cx, cy, size, bg = 'rgba(18,6,58,.85)', fg = '#fff', border = BLUE) {
    x.save(); x.font = `900 ${size}px ${FONT}`; const w = x.measureText(text).width + size * 1.4, h = size * 1.9;
    rr(x, cx - w / 2, cy - h / 2, w, h, h / 2); x.fillStyle = bg; x.fill(); x.lineWidth = 4; x.strokeStyle = border; x.stroke();
    x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, cx, cy + 1); x.restore();
  }

  /* ---------- brand backgrounds and cards ---------- */
  function brandBg(x, OW, OH, t, room) {
    const g = x.createLinearGradient(0, 0, 0, OH); g.addColorStop(0, '#3a179e'); g.addColorStop(0.45, '#22106a'); g.addColorStop(1, '#0d0530'); x.fillStyle = g; x.fillRect(0, 0, OW, OH);
    if (room && ok(img(room))) { x.save(); x.globalAlpha = 0.28; const im = img(room), s = Math.max(OW / im.width, OH / im.height); x.drawImage(im, (OW - im.width * s) / 2, (OH - im.height * s) / 2, im.width * s, im.height * s); x.restore(); x.fillStyle = 'rgba(20,8,70,.45)'; x.fillRect(0, 0, OW, OH); }
    x.save(); x.translate(OW / 2, OH * 0.42); x.rotate(t * 0.12); x.globalAlpha = 0.07; x.fillStyle = '#fff';
    for (let i = 0; i < 18; i++) { x.rotate(Math.PI * 2 / 18); x.beginPath(); x.moveTo(0, 0); x.lineTo(-OW * 0.07, -OH); x.lineTo(OW * 0.07, -OH); x.closePath(); x.fill(); } x.restore();
    const rg = x.createRadialGradient(OW / 2, OH * 0.42, 0, OW / 2, OH * 0.42, OW * 0.8); rg.addColorStop(0, 'rgba(154,109,245,.45)'); rg.addColorStop(1, 'rgba(154,109,245,0)'); x.fillStyle = rg; x.fillRect(0, 0, OW, OH);
    const m = img('m1'); if (ok(m)) for (let i = 0; i < 5; i++) { const px = ((i * 263 + t * 70 * (i % 2 ? 1 : -1)) % (OW + 200) + OW + 200) % (OW + 200) - 100, py = OH * (0.12 + 0.17 * i) + Math.sin(t * 3 + i) * 20; x.save(); x.globalAlpha = 0.35; x.translate(px, py); x.scale(i % 2 ? -1 : 1, 1); x.drawImage(m, -40, -40, 80, 80); x.restore(); }
  }
  function drawImg(x, k, cx, cy, h, a = 1, rot = 0, glow) {
    const im = img(k); if (!ok(im)) return; const w = h * im.width / im.height;
    x.save(); x.globalAlpha = a; x.translate(cx, cy); x.rotate(rot); if (glow) { x.shadowColor = glow; x.shadowBlur = 60; } x.drawImage(im, -w / 2, -h / 2, w, h); x.restore();
  }
  function title(x, kick, big, OW, y, local, size = 104) {
    const a = clamp(local / 0.25, 0, 1);
    if (kick) pill(x, kick, OW / 2, y, 30, 'rgba(255,255,255,.1)', '#bfe9ff', 'rgba(255,255,255,.3)');
    x.save(); x.font = `900 ${size}px ${FONT}`; const n = wrap(x, parseRich(big), OW * 0.86).length; x.restore();
    drawCaption(x, big, 'neon', { cx: OW / 2, y: y + size * 0.95 + (n - 1) * size * 0.56, size, maxW: OW * 0.86, a, sc: 0.9 + 0.1 * back(local / 0.35) });
  }
  const RAR = { common: ['COMMON', '#b9a6ee'], rare: ['RARE', '#5fd0ff'], epic: ['EPIC', '#9a6df5'], legendary: ['LEGENDARY', '#7fd4ff'], mythic: ['MYTHIC', '#ffffff'] };
  function bar(x, X, Y, w, h, v, label, a = 1) {
    x.save(); x.globalAlpha = a; rr(x, X, Y, w, h, h / 2); x.fillStyle = 'rgba(255,255,255,.12)'; x.fill();
    const g = x.createLinearGradient(X, 0, X + w, 0); g.addColorStop(0, P2); g.addColorStop(1, BLUE); rr(x, X, Y, Math.max(h, w * clamp(v, 0, 1)), h, h / 2); x.fillStyle = g; x.fill();
    if (label) { x.font = `800 ${h * 1.1}px ${FONT}`; x.fillStyle = '#fff'; x.textBaseline = 'bottom'; x.fillText(label, X, Y - 8); }
    x.restore();
  }
  function drawCard(x, c, local, len, OW, OH, t) {
    const D = ENG.D || {}, cy = OH * 0.46;
    if (c.type === 'boss') {
      const b = (D.bosses || {})[c.id] || { name: 'BOSS', taunt: '' };
      brandBg(x, OW, OH, t, null);
      const sh = local < 0.6 ? Math.sin(local * 60) * 14 * (0.6 - local) : 0;
      drawImg(x, 'b_' + c.id, OW / 2 + sh, cy, OH * 0.4 * (0.6 + 0.4 * back(local / 0.5)), clamp(local / 0.2, 0, 1), 0, P2);
      title(x, (b.tier || 'boss').toUpperCase() + ' BOSS', b.name, OW, OH * 0.1, local, 92);
      drawCaption(x, '"' + b.taunt + '"', 'minimal', { cx: OW / 2, y: OH * 0.75, size: 40, maxW: OW * 0.8, a: clamp((local - 0.5) / 0.3, 0, 1) });
      bar(x, OW * 0.15, OH * 0.84, OW * 0.7, 30, ease((local - 0.3) / 1.2), 'BOSS HP', clamp((local - 0.3) / 0.3, 0, 1));
    } else if (c.type === 'racket') {
      const r = (D.rackets || []).find(z => z.id === c.id) || { name: c.id, rar: 'common', sp: '', r: 1, regen: 1, pow: 0 }, rar = RAR[r.rar] || RAR.common;
      brandBg(x, OW, OH, t, null);
      drawImg(x, 'r_' + c.id, OW / 2, cy - 30, OH * 0.42 * (0.7 + 0.3 * back(local / 0.45)), clamp(local / 0.2, 0, 1), -0.35 + 0.35 * ease(local / 0.6) + Math.sin(t * 2) * 0.03, r.rar === 'common' ? null : BLUE);
      pill(x, rar[0], OW / 2, OH * 0.09, 32, 'rgba(18,6,58,.8)', rar[1], rar[1]);
      drawCaption(x, r.name.toUpperCase(), 'neon', { cx: OW / 2, y: OH * 0.17, size: 96, maxW: OW * 0.9, a: clamp(local / 0.2, 0, 1) });
      if (r.sp) drawCaption(x, r.sp, 'minimal', { cx: OW / 2, y: OH * 0.72, size: 42, maxW: OW * 0.8, a: clamp((local - 0.4) / 0.3, 0, 1) });
      const st = [['RANGE', (r.r - 0.9) / 0.5], ['CHARGE', (r.regen - 0.8) / 1.1], ['POWER', (r.pow + 0.02) / 0.14]];
      st.forEach(([l, v], i) => bar(x, OW * 0.16, OH * (0.79 + i * 0.055), OW * 0.68, 24, ease((local - 0.5 - i * 0.12) / 0.8) * clamp(v, 0.08, 1), l, clamp((local - 0.4) / 0.3, 0, 1)));
    } else if (c.type === 'roster') {
      brandBg(x, OW, OH, t, 'room');
      title(x, '16 CHARACTERS', 'Protect the *whole family*', OW, OH * 0.08, local, 84);
      const ids = ['papa', 'mummy', 'dadi', 'dada', 'bhai', 'behen', 'bachcha', 'husband', 'wife', 'dost', 'dulha', 'dulhan', 'raja', 'girlfriend', 'crush', 'padoswali'];
      const cols = 4, cw = OW * 0.21, chh = cw * 1.12, x0 = (OW - cols * cw) / 2, y0 = OH * 0.3;
      ids.forEach((id, i) => { const k = clamp((local - 0.25 - i * 0.08) / 0.3, 0, 1); if (k <= 0) return; const cx = x0 + (i % cols) * cw + cw / 2, cyy = y0 + Math.floor(i / cols) * chh + chh / 2; x.save(); x.globalAlpha = k; x.translate(cx, cyy); const s = 0.6 + 0.4 * back(k); x.scale(s, s); rr(x, -cw * 0.45, -chh * 0.45, cw * 0.9, chh * 0.9, 26); x.fillStyle = 'rgba(255,255,255,.08)'; x.fill(); x.strokeStyle = i < 13 ? 'rgba(154,109,245,.8)' : BLUE; x.lineWidth = 3; x.stroke(); x.restore(); drawImg(x, 'sb_' + id, cx, cyy, chh * 0.82 * (0.6 + 0.4 * back(k)), k); });
      drawCaption(x, 'Each with their *own* 300 levels', 'minimal', { cx: OW / 2, y: OH * 0.92, size: 40, maxW: OW * 0.86, a: clamp((local - 1.4) / 0.3, 0, 1) });
    } else if (c.type === 'map') {
      brandBg(x, OW, OH, t, null);
      const prog = easeIO(local / Math.max(1, len - 0.6)), lv = Math.round(1 + 299 * prog);
      x.save(); x.font = `900 ${200}px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = BLUE; x.shadowBlur = 50; x.fillStyle = '#fff'; x.fillText(String(lv), OW / 2, OH * 0.2); x.restore();
      pill(x, 'LEVELS PER HERO', OW / 2, OH * 0.31, 32);
      const names = ['Home Bedroom', "Grandma's Village", 'Hostel Room', 'Wedding Tent', 'Mosquito Palace', 'Monsoon Bedroom', 'Sangeet Night', 'Diwali Village', 'Mehendi Night', 'Final Exams', "Emperor's Palace"];
      const scroll = prog * (names.length - 3);
      for (let i = 0; i < names.length; i++) {
        const yy = OH * 0.86 - (i - scroll) * OH * 0.15; if (yy < OH * 0.36 || yy > OH * 1.02) continue;
        const xx = OW / 2 + Math.sin(i * 1.3) * OW * 0.22, a2 = clamp((OH * 1.0 - yy) / (OH * 0.1), 0, 1) * clamp((yy - OH * 0.36) / (OH * 0.08), 0, 1);
        if (i > 0) { const py = OH * 0.86 - (i - 1 - scroll) * OH * 0.15, pxx = OW / 2 + Math.sin((i - 1) * 1.3) * OW * 0.22; x.save(); x.globalAlpha = a2 * 0.6; x.setLineDash([16, 18]); x.strokeStyle = '#c7b0ff'; x.lineWidth = 6; x.beginPath(); x.moveTo(pxx, py); x.lineTo(xx, yy); x.stroke(); x.restore(); }
        x.save(); x.globalAlpha = a2; x.beginPath(); x.arc(xx, yy, 56, 0, 7); const g = x.createLinearGradient(xx, yy - 56, xx, yy + 56); g.addColorStop(0, P2); g.addColorStop(1, P1); x.fillStyle = g; x.fill(); x.lineWidth = 6; x.strokeStyle = '#fff'; x.stroke();
        x.font = `900 40px ${FONT}`; x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(i === 0 ? 1 : i * 15 + (i > 9 ? 150 : 0)), xx, yy + 2);
        x.font = `800 34px ${FONT}`; x.textAlign = xx > OW / 2 ? 'right' : 'left'; x.fillText(names[i], xx > OW / 2 ? xx - 80 : xx + 80, yy); x.restore();
      }
      pill(x, '20 WORLDS · 28 MISSIONS', OW / 2, OH * 0.95, 30);
    } else if (c.type === 'hospital') {
      brandBg(x, OW, OH, t, 'room_hospital');
      title(x, c.vaccine ? 'VACCINE' : 'HOSPITAL', c.vaccine ? 'One shot = *home*' : 'Papa is in the *hospital*', OW, OH * 0.08, local, 86);
      drawImg(x, c.vaccine ? 'u_inject' : 'ov_papa', OW / 2, OH * 0.4, OH * 0.24 * (0.7 + 0.3 * back(local / 0.4)), clamp(local / 0.2, 0, 1), 0, P2);
      const st = ['WARD', 'ICU', 'CRITICAL'], k = Math.min(2, Math.floor(local / Math.max(0.6, (len - 0.8) / 3)));
      st.forEach((s, i) => { const on = c.vaccine ? i === 0 : i <= k, cx = OW * (0.22 + i * 0.28); pill(x, s, cx, OH * 0.62, 34, on ? (i === 2 ? '#ffffff' : P1) : 'rgba(255,255,255,.08)', on && i === 2 ? INK : '#fff', on ? BLUE : 'rgba(255,255,255,.2)'); });
      bar(x, OW * 0.16, OH * 0.74, OW * 0.68, 30, c.vaccine ? 1 - ease(local / 1.2) * 0.9 : 0.1 + 0.6 * ease(local / (len - 0.4)), 'SICKNESS', 1);
      drawCaption(x, c.vaccine ? 'Instant discharge from *any* stage' : 'Win the rounds to bring him *home*', 'minimal', { cx: OW / 2, y: OH * 0.88, size: 40, maxW: OW * 0.86, a: clamp((local - 0.6) / 0.3, 0, 1) });
    } else if (c.type === 'yamlok') {
      brandBg(x, OW, OH, t, 'room_yamlok');
      title(x, 'YAMLOK', 'Bring the *soul* back', OW, OH * 0.08, local, 90);
      drawImg(x, 'b_yamraj', OW / 2, OH * 0.45, OH * 0.36 * (0.7 + 0.3 * back(local / 0.4)), clamp(local / 0.2, 0, 1), 0, P2);
      bar(x, OW * 0.16, OH * 0.78, OW * 0.68, 30, ease(local / (len - 0.3)), 'SOUL', 1);
    } else if (c.type === 'event') {
      const D2 = ENG.D || {}, id = c.id.split(':')[1], isLove = c.id.startsWith('love:'), lv = isLove ? (D2.love || []).find(l => l.id === id) : null;
      const face = { wife: 'wife', gf: 'girlfriend', crush: 'crush', padoswali: 'padoswali', dulhan: 'dulhan' }[lv && lv.char] || (id === 'wedding' ? 'dulha_full' : 'trophy');
      brandBg(x, OW, OH, t, id === 'wedding' ? 'room_shaadi' : 'room');
      title(x, 'LIVE EVENT', lv ? lv.name : (id === 'wedding' ? 'Wedding Week' : 'Weekly Challenge'), OW, OH * 0.08, local, 86);
      drawImg(x, face, OW / 2, OH * 0.4, OH * 0.3 * (0.7 + 0.3 * back(local / 0.4)), clamp(local / 0.2, 0, 1), 0, P2);
      const days = lv ? [3, 5, 7, 10, 15] : id === 'wedding' ? [1, 2, 3, 4, 5, 6, 7] : [2, 2, 2, 2, 2];
      days.forEach((n, i) => { const k = clamp((local - 0.4 - i * 0.15) / 0.25, 0, 1); if (k <= 0) return; const cw = OW * 0.84 / days.length, cx = OW * 0.08 + cw * i + cw / 2; x.save(); x.globalAlpha = k; rr(x, cx - cw * 0.44, OH * 0.62, cw * 0.88, OH * 0.1, 22); x.fillStyle = 'rgba(255,255,255,.1)'; x.fill(); x.strokeStyle = BLUE; x.lineWidth = 3; x.stroke(); x.font = `800 26px ${FONT}`; x.fillStyle = '#c7b0ff'; x.textAlign = 'center'; x.fillText(lv ? 'DAY ' + (i + 1) : id === 'wedding' ? 'NIGHT ' + (i + 1) : 'LV ' + (i * 2 + 1) + '-' + (i * 2 + 2), cx, OH * 0.655); x.font = `900 44px ${FONT}`; x.fillStyle = '#fff'; x.fillText(lv ? n + ' lv' : '★', cx, OH * 0.7); x.restore(); });
      drawCaption(x, 'Champion = *vaccine* + gems', 'block', { cx: OW / 2, y: OH * 0.84, size: 46, maxW: OW * 0.86, a: clamp((local - 1.2) / 0.3, 0, 1) });
    } else if (c.type === 'item' || c.type === 'boost') {
      const isI = c.type === 'item', s = isI ? (D.saman || []).find(z => z.id === c.id) : (D.boosters || []).find(z => z.id === c.id);
      const k = isI ? (s && s.img) || 'c_' + c.id : 'p_' + c.id;
      brandBg(x, OW, OH, t, null);
      title(x, isI ? 'GADGET' : 'START BOOSTER', (s ? s.name : c.id).toUpperCase(), OW, OH * 0.08, local, 96);
      drawImg(x, k, OW / 2, OH * 0.43, OH * 0.3 * (0.6 + 0.4 * back(local / 0.45)), clamp(local / 0.2, 0, 1), Math.sin(t * 2) * 0.05, BLUE);
      if (s) drawCaption(x, s.desc, 'block', { cx: OW / 2, y: OH * 0.72, size: 50, maxW: OW * 0.84, a: clamp((local - 0.4) / 0.3, 0, 1) });
      pill(x, 'IN THE SHOP', OW / 2, OH * 0.86, 32);
    } else if (c.type === 'twist' || c.type === 'task') {
      const nm = c.type === 'twist' ? ((D.twists || {})[c.id] || {}).name : ((D.tasks || {})[c.id] || {}).name;
      brandBg(x, OW, OH, t, 'room_hostel');
      title(x, c.type === 'twist' ? 'LEVEL TWIST' : 'MISSION TYPE', (nm || c.id).toUpperCase(), OW, OH * 0.3, local, 110);
      drawImg(x, c.id === 'golden' ? 'tk_gold' : 'm2', OW / 2, OH * 0.62, OH * 0.2, clamp((local - 0.3) / 0.3, 0, 1), Math.sin(t * 3) * 0.1, BLUE);
      pill(x, '1 OF 28 MISSION TYPES', OW / 2, OH * 0.82, 32);
    } else if (c.type === 'char') {
      const ch = (D.chars || {})[c.id] || { n: c.id, qd: '' };
      brandBg(x, OW, OH, t, 'room');
      title(x, 'PROTECT', ch.n.toUpperCase(), OW, OH * 0.08, local, 110);
      drawImg(x, (c.id === 'raja' || c.id === 'dulha' || c.id === 'papa' || c.id === 'mummy' || c.id === 'dadi' || c.id === 'dada' || c.id === 'dost' || c.id === 'bachcha') ? c.id + '_full' : c.id, OW / 2, OH * 0.47, OH * 0.42 * (0.7 + 0.3 * back(local / 0.4)), clamp(local / 0.2, 0, 1));
      drawCaption(x, ch.qd, 'minimal', { cx: OW / 2, y: OH * 0.82, size: 40, maxW: OW * 0.84, a: clamp((local - 0.5) / 0.3, 0, 1) });
    } else { brandBg(x, OW, OH, t, null); title(x, 'MACHHAR MAARO', 'New in the game', OW, OH * 0.4, local); }
  }

  /* logo sting over the blurred game */
  function drawLogo(x, src, local, len, OW, OH, t) {
    drawBlurBg(x, src, OW, OH, 0.62);
    const k = back(local / 0.45), a = clamp(local / 0.12, 0, 1) * clamp((len - local) / 0.2, 0, 1);
    x.save(); x.globalAlpha = a;
    if (local < 0.25) { x.fillStyle = `rgba(191,233,255,${0.5 * (1 - local / 0.25)})`; x.fillRect(0, 0, OW, OH); }
    /* electric arcs */
    let s = 9; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    x.strokeStyle = BLUE; x.lineWidth = 5; x.shadowColor = BLUE; x.shadowBlur = 24;
    for (let j = 0; j < 4; j++) { if (((t * 12) | 0) % 4 === j) continue; x.beginPath(); let px = OW / 2, py = OH * 0.42; x.moveTo(px, py); const ang = j * Math.PI / 2 + 0.6; for (let q = 0; q < 6; q++) { px += Math.cos(ang) * 70 + (r() - 0.5) * 60; py += Math.sin(ang) * 70 + (r() - 0.5) * 60; x.lineTo(px, py); } x.stroke(); }
    x.shadowBlur = 0;
    drawImg(x, 'appicon', OW / 2, OH * 0.4, OW * 0.38 * k, 1, 0, P2);
    drawCaption(x, 'MACHHAR', 'neon', { cx: OW / 2, y: OH * 0.58, size: 118, maxW: OW, a: clamp((local - 0.12) / 0.2, 0, 1), sc: 0.8 + 0.2 * back((local - 0.1) / 0.35) });
    drawCaption(x, '*MAARO*', 'neon', { cx: OW / 2, y: OH * 0.655, size: 118, maxW: OW, a: clamp((local - 0.2) / 0.2, 0, 1), sc: 0.8 + 0.2 * back((local - 0.18) / 0.35) });
    x.restore();
  }

  /* pro outro: phone mockup with the live game, logo, download card, creator card */
  function drawOutro(x, src, local, len, OW, OH, t, opt) {
    brandBg(x, OW, OH, t, null);
    const up = ease(local / 0.7);
    drawImg(x, 'appicon', OW / 2 - 250, OH * 0.085, 130 * back(local / 0.4), clamp(local / 0.2, 0, 1));
    x.save(); x.globalAlpha = clamp((local - 0.1) / 0.25, 0, 1); x.font = `900 76px ${FONT}`; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillStyle = '#fff'; x.shadowColor = P2; x.shadowBlur = 30; x.fillText('MACHHAR', OW / 2 - 165, OH * 0.07); x.fillStyle = BLUE; x.shadowColor = BLUE; x.fillText('MAARO', OW / 2 - 165, OH * 0.07 + 74); x.restore();
    const pw = OW * 0.5, ph = pw * 2.05, px = (OW - pw) / 2, py = OH * 0.19 + (1 - up) * OH * 0.5;
    x.save(); x.translate(OW / 2, py + ph / 2); x.rotate(-0.04 * (1 - up) + Math.sin(t * 0.8) * 0.01); x.translate(-OW / 2, -(py + ph / 2));
    phoneBody(x, px, py, pw, ph, (sx, sy, sw, sh) => { try { const s = Math.max(sw / 1080, sh / 1920); x.drawImage(src, sx + (sw - 1080 * s) / 2, sy + (sh - 1920 * s) / 2, 1080 * s, 1920 * s); } catch (e) { } });
    x.restore();
    const ca = clamp((local - 0.6) / 0.3, 0, 1), pul = 1 + Math.sin(t * 6) * 0.025;
    x.save(); x.globalAlpha = ca; x.translate(OW / 2, OH * 0.83); x.scale(pul, pul);
    const bw = OW * 0.78, bh = 132; x.shadowColor = 'rgba(95,208,255,.7)'; x.shadowBlur = 40; rr(x, -bw / 2, -bh / 2, bw, bh, bh / 2); const g = x.createLinearGradient(0, -bh / 2, 0, bh / 2); g.addColorStop(0, P2); g.addColorStop(1, P1); x.fillStyle = g; x.fill(); x.shadowBlur = 0; x.lineWidth = 4; x.strokeStyle = 'rgba(255,255,255,.6)'; x.stroke();
    x.font = `900 54px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#fff'; x.fillText('DOWNLOAD FREE', 0, -12); x.font = `700 30px ${FONT}`; x.fillStyle = '#d8f1ff'; x.fillText('on Google Play', 0, 36);
    x.restore();
    if (opt && opt.photo !== false && (opt.photoImg || opt.name)) {
      const a2 = clamp((local - 1.0) / 0.3, 0, 1); x.save(); x.globalAlpha = a2;
      const cy = OH * 0.935, r = 48, nm = opt.name || 'Sanx', sub = opt.sub || 'SANX Graphikians';
      x.font = `800 34px ${FONT}`; const w1 = x.measureText('Made by ' + nm).width; x.font = `600 26px ${FONT}`; const w2 = x.measureText(sub).width; const tw = Math.max(w1, w2), cw = r * 2 + 28 + tw + 40, cx0 = (OW - cw) / 2;
      rr(x, cx0, cy - r - 10, cw, r * 2 + 20, r + 10); x.fillStyle = 'rgba(18,6,58,.75)'; x.fill(); x.strokeStyle = 'rgba(154,109,245,.7)'; x.lineWidth = 3; x.stroke();
      const pcx = cx0 + 10 + r, pcy = cy;
      x.save(); x.beginPath(); x.arc(pcx, pcy, r, 0, 7); x.clip(); if (opt.photoImg && ok(opt.photoImg)) { const im = opt.photoImg, s = Math.max(2 * r / im.width, 2 * r / im.height); x.drawImage(im, pcx - im.width * s / 2, pcy - im.height * s / 2, im.width * s, im.height * s); } else { x.fillStyle = P1; x.fillRect(pcx - r, pcy - r, 2 * r, 2 * r); } x.restore();
      x.beginPath(); x.arc(pcx, pcy, r, 0, 7); x.strokeStyle = BLUE; x.lineWidth = 4; x.stroke();
      x.textAlign = 'left'; x.textBaseline = 'middle'; x.font = `800 34px ${FONT}`; x.fillStyle = '#fff'; x.fillText('Made by ' + nm, pcx + r + 24, cy - 18); x.font = `600 26px ${FONT}`; x.fillStyle = '#c7b0ff'; x.fillText(sub, pcx + r + 24, cy + 20);
      x.restore();
    }
  }
  function watermark(x, OW, a, OH) {
    if (!a) return; const y = OH - 96; x.save(); x.globalAlpha = a * 0.9; drawImg(x, 'appicon', OW - 250, y, 70, a * 0.9); x.font = `900 28px ${FONT}`; x.textBaseline = 'middle'; x.fillStyle = '#fff'; x.shadowColor = 'rgba(0,0,0,.7)'; x.shadowBlur = 10; x.fillText('MACHHAR', OW - 205, y - 15); x.fillStyle = BLUE; x.fillText('MAARO', OW - 205, y + 15); x.restore();
  }

  /* ---------- one composite frame ---------- */
  function composite(R, t, x) {
    const T = R.T, OW = R.OW, OH = R.OH, look = T.look, seg = T.segs.find(s => t >= s.t0 && t < s.t1) || T.segs[T.segs.length - 1], local = t - seg.t0, len = seg.t1 - seg.t0;
    const src = ENG.S.canvas();
    x.save(); x.fillStyle = INK; x.fillRect(0, 0, OW, OH);
    let area = { top: OH * 0.12, bottom: OH * 0.86 };
    if (seg.k === 'logo') drawLogo(x, src, local, len, OW, OH, t);
    else if (seg.k === 'card') drawCard(x, seg.card, local, len, OW, OH, t);
    else if (seg.k === 'outro') drawOutro(x, src, local, len, OW, OH, t, R.opt);
    else area = frameGame(x, look.frame, src, R.cam, OW, OH, t, R.camVideo ? { cam: R.camVideo } : null);
    /* labels (LEVEL 1, character, racket) */
    if (!R.noCaps && seg.shot && seg.shot.label && (seg.k === 'game' || seg.k === 'climax')) { const a = clamp(local / 0.2, 0, 1) * clamp((len - local) / 0.2, 0, 1); x.save(); x.globalAlpha = a; pill(x, seg.shot.label, OW / 2, area.top + (area.inBars ? 0 : 150), 40, 'rgba(116,58,232,.92)', '#fff', BLUE); x.restore(); }
    if (!R.noCaps && (seg.k === 'game' || seg.k === 'climax' || seg.k === 'hook')) watermark(x, OW, (area.inBars || look.frame === 'split' || look.frame === 'phone' || look.frame === 'neon') ? 0 : 1, OH);
    /* captions */
    for (const c of (R.noCaps ? [] : T.caps)) {
      if (t < c.t0 || t >= c.t1) continue;
      const l = t - c.t0, L = c.t1 - c.t0, an = capAnim(look.type, l, L);
      if (c.big) {
        const y = area.inBars ? area.bar * 0.5 : (look.frame === 'split' ? OH * 0.2 : OH * 0.24);
        drawCaption(x, c.text, look.type === 'minimal' ? 'block' : look.type, { cx: OW / 2, y: area.inBars ? OH * 0.24 : y, size: look.type === 'comic' ? 96 : 88, maxW: OW * 0.86, a: an.a, sc: an.sc, rot: an.rot });
      } else if (seg.k !== 'card') {
        const y = area.inBars ? OH - area.bar * 0.5 : (look.frame === 'split' ? (area.panel ? area.panel.y + area.panel.h * 0.45 : area.top + 120) : look.frame === 'neon' ? OH * 0.085 : look.frame === 'phone' ? OH * 0.1 : OH * 0.3);
        const sz = look.type === 'minimal' ? 54 : look.type === 'comic' ? 74 : 66;
        drawCaption(x, c.text, look.type, { cx: look.type === 'minimal' ? OW * 0.09 : OW / 2, y, size: sz, maxW: OW * 0.84, a: an.a, sc: an.sc, rot: an.rot, align: look.type === 'minimal' ? 'left' : 'center' });
      }
    }
    /* split panel extras when there is no face cam */
    if (look.frame === 'split' && area.panel && (seg.k === 'game' || seg.k === 'climax' || seg.k === 'hook')) {
      const inf = R.lastInfo || {}; x.save(); x.font = `800 36px ${FONT}`; x.fillStyle = '#c7b0ff'; x.textAlign = 'center';
      x.fillText(`SCORE ${inf.score || 0}   ·   COMBO x${Math.max(1, inf.combo || 0)}   ·   SLEEP ${Math.round(inf.sleep || 100)}%`, OW / 2, area.panel.y + area.panel.h * 0.85); x.restore();
    }
    x.restore();
    /* transitions */
    if (!R.noCaps && seg.cut && local < 0.32 && R.snap) {
      const k = local / 0.32;
      if (seg.cut === 'flash') { x.fillStyle = `rgba(200,236,255,${0.85 * (1 - k)})`; x.fillRect(0, 0, OW, OH); }
      else if (seg.cut === 'punch') { const z = 1 + 0.12 * (1 - ease(k)); const tmp = R.tmp; tmp.getContext('2d').drawImage(x.canvas, 0, 0); x.drawImage(tmp, OW / 2 - OW * z / 2, OH / 2 - OH * z / 2, OW * z, OH * z); x.fillStyle = `rgba(116,58,232,${0.35 * (1 - k)})`; x.fillRect(0, 0, OW, OH); }
      else if (seg.cut === 'whip') { const e = easeIO(k); x.save(); x.globalAlpha = 1 - e; for (let i = 0; i < 4; i++) { x.globalAlpha = (1 - e) * 0.3; x.drawImage(R.snap, -e * OW * 1.2 - i * 40, 0, OW, OH); } x.restore(); }
    }
  }

  /* ---------- the run: preview (real time) or render (frame exact) ---------- */
  function speedOf(sh, local, len, R, info) {
    if (!sh || !sh.speed) return 1;
    if (sh.speed === 'slowStart') return local < 1.6 ? 0.45 : 1;
    if (sh.speed === 'boss') { if (info.boss && info.boss.hp / info.boss.max < 0.2) { R.slowT = 1.0; return 0.35; } if (R.slowT > 0) { R.slowT -= 1 / FPS; return 0.4; } return 1; }
    if (sh.speed === 'save') { const sv = ENG.S.bot.saved; if (sv && !R.savedAt) R.savedAt = local; if (R.savedAt != null && local - R.savedAt < 1.6) return 0.45; return 1; }
    return 1;
  }
  async function run(T, mode, o) {
    const S = ENG.S, OW = o.W || 1080, OH = o.H || 1920;
    const R = { T, OW, OH, cam: newCam(), opt: o.opt || {}, camVideo: o.camVideo || null, snap: null, tmp: document.createElement('canvas'), lastInfo: null, slowT: 0, events: { fails: [] } };
    R.tmp.width = OW; R.tmp.height = OH;
    const cv = o.canvas, x = cv.getContext('2d'); cv.width = OW; cv.height = OH;
    const snap = document.createElement('canvas'); snap.width = OW; snap.height = OH;
    if (mode === 'render') S.audio('offline', T.total); else if (o.sound) S.audio('live'); else S.audio('mute');
    S.VT = 0;
    let prevSeg = -1, shotPrev = null, segActs = [];
    const N = Math.ceil(T.total * FPS);
    const seedBase = (T.spec.seed || 1) * 101;
    for (let i = 0; i < N; i++) {
      if (o.abort && o.abort.stop) throw new Error('stopped');
      const t = i / FPS, seg = T.segs.find(s => t >= s.t0 && t < s.t1) || T.segs[T.segs.length - 1], local = t - seg.t0, len = seg.t1 - seg.t0;
      S.VT = t;
      if (seg.i !== prevSeg) {
        if (prevSeg >= 0) { snap.getContext('2d').drawImage(cv, 0, 0); R.snap = snap; }
        prevSeg = seg.i; R.savedAt = null;
        if (seg.shot) { await prepShot(seg.shot, seedBase + seg.i, shotPrev); shotPrev = seg.shot; R.cam = Object.assign(newCam(), { z: R.cam.z, x: R.cam.x, y: R.cam.y }); segActs = (seg.shot.acts || []).map(a => Object.assign({}, a, { at: a.at < 0 ? len + a.at : a.at, done: 0 })); }
        else segActs = [];
        const gameSeg = seg.k === 'game' || seg.k === 'climax' || seg.k === 'hook';
        S.mute(!gameSeg);
        if (seg.k === 'outro') { S.floor = 60; S.setBot({ mode: 'pro' }); }
        if (o.onSeg) o.onSeg(seg);
      }
      for (const a of segActs) if (!a.done && local >= a.at) { a.done = 1; if (a.a === 'bot') S.setBot(a.v); else S.act(a.a, a.v); }
      /* game moves (cards freeze it) */
      if (seg.k !== 'card') {
        const info0 = R.lastInfo || {};
        const sp = seg.k === 'outro' || seg.k === 'logo' ? 1 : speedOf(seg.shot, local, len, R, info0);
        S.step(sp / FPS, true);
        const info = S.info(); R.lastInfo = info;
        if ((info.cine === 'wake' || info.cine === 'fail') && !R.failSeen) { R.failSeen = 1; R.events.fails.push(t); }
        if (!info.cine) R.failSeen = 0;
        camUpdate(R.cam, seg.shot ? seg.shot.cam : 'auto', info, local, len);
      }
      if (o.beforeFrame) await o.beforeFrame(t, R);
      composite(R, t, x);
      if (o.onFrame) { const r = o.onFrame(i, N, t, R); if (r && r.then) await r; }
    }
    S.mute(true);
    return R;
  }

  /* ---------- audio: game capture + music + studio fx → one mix ---------- */
  function envOf(buf, win = 480) {
    const L = buf.getChannelData(0), Rr = buf.numberOfChannels > 1 ? buf.getChannelData(1) : L, n = Math.ceil(L.length / win), e = new Float32Array(n);
    for (let i = 0; i < n; i++) { let s = 0; const a = i * win, b = Math.min(L.length, a + win); for (let j = a; j < b; j++) { const v = (L[j] + Rr[j]) * 0.5; s += v * v; } e[i] = Math.sqrt(s / Math.max(1, b - a)); }
    return e;
  }
  function mix(total, game, music, fx, voice, vol) {
    const SR = 48000, N = Math.ceil(SR * total), L = new Float32Array(N), Rr = new Float32Array(N);
    const ch = (b, c) => b ? b.getChannelData(Math.min(c, b.numberOfChannels - 1)) : null;
    const gE = game ? envOf(game) : null, vE = voice ? envOf(voice) : null, win = 480;
    let duck = 1;
    const gl = ch(game, 0), gr = ch(game, 1), ml = ch(music, 0), mr = ch(music, 1), fl = ch(fx, 0), fr = ch(fx, 1), vl = ch(voice, 0), vr = ch(voice, 1);
    const gv = vol.game, mv = vol.music, vv = vol.voice || 1;
    for (let i = 0; i < N; i++) {
      if (i % win === 0) {
        const k = i / win | 0, ge = gE && k < gE.length ? gE[k] : 0, ve = vE && k < vE.length ? vE[k] : 0;
        const target = 1 - Math.min(0.55, ge * 4.5 * gv) - Math.min(0.5, ve * 6);
        duck += (target - duck) * (target < duck ? 0.6 : 0.08);
      }
      let a = 0, b = 0;
      if (gl && i < gl.length) { a += gl[i] * gv; b += gr[i] * gv; }
      if (ml && i < ml.length) { a += ml[i] * mv * duck; b += mr[i] * mv * duck; }
      if (fl && i < fl.length) { a += fl[i] * 0.7; b += fr[i] * 0.7; }
      if (vl && i < vl.length) { a += vl[i] * vv; b += vr[i] * vv; }
      L[i] = a; Rr[i] = b;
    }
    /* loudness: bring the mix to a strong level, then soft-limit the peaks */
    let s = 0; for (let i = 0; i < N; i += 2) s += L[i] * L[i] + Rr[i] * Rr[i]; const rms = Math.sqrt(s / Math.max(1, N)), g = rms > 0 ? Math.min(3, 0.19 / rms) : 1;
    for (let i = 0; i < N; i++) { L[i] = Math.tanh(L[i] * g * 1.1) * 0.94; Rr[i] = Math.tanh(Rr[i] * g * 1.1) * 0.94; }
    return { L, R: Rr, SR };
  }
  function wav(m) {
    const N = m.L.length, pcm = new Int16Array(N * 2); for (let i = 0; i < N; i++) { pcm[i * 2] = clamp(m.L[i], -1, 1) * 32767; pcm[i * 2 + 1] = clamp(m.R[i], -1, 1) * 32767; }
    const hd = new DataView(new ArrayBuffer(44)), ws = (p, s) => [...s].forEach((c, k) => hd.setUint8(p + k, c.charCodeAt(0)));
    ws(0, 'RIFF'); hd.setUint32(4, 36 + pcm.byteLength, true); ws(8, 'WAVE'); ws(12, 'fmt '); hd.setUint32(16, 16, true); hd.setUint16(20, 1, true); hd.setUint16(22, 2, true); hd.setUint32(24, m.SR, true); hd.setUint32(28, m.SR * 4, true); hd.setUint16(32, 4, true); hd.setUint16(34, 16, true); ws(36, 'data'); hd.setUint32(40, pcm.byteLength, true);
    return new Blob([hd.buffer, pcm.buffer], { type: 'audio/wav' });
  }
  async function musicFor(T, music, fails) {
    const MT = { total: T.total, drop: T.drop, outro: T.outro, introEnd: T.introEnd, fails: fails || [] };
    if (music && music.type === 'upload' && music.song) return await MUSIC.renderSong(music.song, MT);
    if (music && music.type === 'none') return null;
    return await MUSIC.renderTrack(music && music.id || T.style.music, MT);
  }
  async function fxFor(T) {
    return await MUSIC.renderSfx({ total: T.total, cuts: T.cuts.filter(c => Math.abs(c - (T.logoT || -9)) > 0.05), logo: T.logoT, pops: T.caps.filter(c => !c.big).map(c => c.t0), ding: T.outro + 0.6 });
  }

  /* ---------- MP4: H.264 frames + AAC sound ---------- */
  let FF = null;
  async function ffmpeg() {
    if (FF) return FF;
    if (!window.FFmpegWASM) await new Promise((res, rej) => { const s = document.createElement('script'); s.src = '/beat-sanx/play/ffmpeg/ffmpeg.js'; s.onload = res; s.onerror = () => rej(new Error('Could not load the video joiner')); document.head.appendChild(s); });
    FF = new FFmpegWASM.FFmpeg();
    await FF.load({ coreURL: new URL('/beat-sanx/play/ffmpeg/ffmpeg-core.js', location.href).href, wasmURL: new URL('/beat-sanx/play/ffmpeg/ffmpeg-core.wasm', location.href).href });
    return FF;
  }
  const canHD = () => !!(window.VideoEncoder && window.VideoFrame);
  async function render(T, o) {
    const OW = o.W || 1080, OH = o.H || 1920, cv = document.createElement('canvas');
    if (!canHD()) throw new Error('This browser cannot make HD video. Please use Chrome or Edge on a laptop or Android.');
    const chunks = []; let err = null;
    const enc = new VideoEncoder({ output: c => { const b = new Uint8Array(c.byteLength); c.copyTo(b); chunks.push(b); }, error: e => { err = e; } });
    let cfg = null;
    for (const codec of ['avc1.640028', 'avc1.4d0028', 'avc1.42e028']) { const c2 = { codec, width: OW, height: OH, bitrate: 14e6, framerate: FPS, latencyMode: 'quality', avc: { format: 'annexb' } }; try { if ((await VideoEncoder.isConfigSupported(c2)).supported) { cfg = c2; break; } } catch (e) { } }
    if (!cfg) throw new Error('HD encoder not available in this browser');
    enc.configure(cfg);
    const pv = o.preview ? o.preview.getContext('2d') : null; let thumb = null;
    let R;
    try {
      R = await run(T, 'render', {
        W: OW, H: OH, canvas: cv, opt: o.opt, camVideo: o.camVideo, abort: o.abort, beforeFrame: o.beforeFrame,
        onFrame: async (i, N, t, R0) => {
          if (err) throw err;
          const vf = new VideoFrame(cv, { timestamp: Math.round(i * 1e6 / FPS), duration: Math.round(1e6 / FPS) });
          enc.encode(vf, { keyFrame: i % (FPS * 2) === 0 }); vf.close();
          if (!thumb && t >= T.thumbT) { thumb = document.createElement('canvas'); thumb.width = OW; thumb.height = OH; R0.noCaps = true; composite(R0, t, thumb.getContext('2d')); R0.noCaps = false; }
          while (enc.encodeQueueSize > 3) await sleep(2);
          if (i % 5 === 0) { if (pv) pv.drawImage(cv, 0, 0, o.preview.width, o.preview.height); if (o.onProgress) o.onProgress(0.05 + 0.75 * i / N, 'Making the video'); }
          if (i % 2 === 0) await sleep(0);
        }
      });
      await enc.flush();
    } finally { try { enc.close(); } catch (e) { } }
    if (err) throw err;
    if (o.onProgress) o.onProgress(0.82, 'Mixing the sound');
    const game = await ENG.S.renderAudio();
    const mus = await musicFor(T, o.music, R.events.fails.length ? R.events.fails : T.fails);
    const fx = await fxFor(T);
    let voice = null; if (o.voiceBuf) voice = o.voiceBuf;
    const m = mix(T.total, game, mus, fx, voice, { game: o.vol ? o.vol.game : 1, music: o.vol ? o.vol.music : 0.8, voice: 1.2 });
    const wv = new Uint8Array(await wav(m).arrayBuffer());
    if (o.onProgress) o.onProgress(0.9, 'Joining HD video + sound');
    const n = chunks.reduce((a, b) => a + b.length, 0), h264 = new Uint8Array(n); let p = 0; for (const c of chunks) { h264.set(c, p); p += c.length; }
    const ff = await ffmpeg();
    await ff.writeFile('v.h264', h264); await ff.writeFile('a.wav', wv);
    await ff.exec(['-r', String(FPS), '-i', 'v.h264', '-i', 'a.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', 'out.mp4']);
    const data = await ff.readFile('out.mp4'); for (const f of ['v.h264', 'a.wav', 'out.mp4']) { try { await ff.deleteFile(f); } catch (e) { } }
    if (o.onProgress) o.onProgress(1, 'Done');
    return { blob: new Blob([data.buffer], { type: 'video/mp4' }), thumb, secs: T.total, fails: R.events.fails };
  }

  /* thumbnail: the best frame + big hook text + logo */
  function thumbnail(T, frameCanvas) {
    const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; const x = c.getContext('2d');
    if (frameCanvas) x.drawImage(frameCanvas, 0, 0, 1080, 1920);
    const g = x.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, 'rgba(18,6,58,.75)'); g.addColorStop(0.45, 'rgba(18,6,58,.1)'); g.addColorStop(1, 'rgba(18,6,58,.7)'); x.fillStyle = g; x.fillRect(0, 0, 1080, 1920);
    drawCaption(x, T.hookText, 'block', { cx: 540, y: 420, size: 104, maxW: 940 });
    drawImg(x, 'appicon', 540, 1600, 180);
    x.font = `900 64px ${FONT}`; x.textAlign = 'center'; x.fillStyle = '#fff'; x.fillText('MACHHAR MAARO', 540, 1760);
    return c;
  }

  return { ffmpeg, initEngine, run, render, thumbnail, musicFor, fxFor, mix, wav, ENG, loadImgs, img, FPS, canHD };
})();

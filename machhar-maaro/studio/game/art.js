/* ================= MACHHAR MAARO — PAINTED ART LAYER (Bedroom world v1) =================
   Sanx ke ChatGPT se bane painted assets ko game mein jodta hai.
   Bedroom: painted kamra, bistar, pankha, Papa (3 chehre), saaman.  Har jagah: machhar, Kallu, racket, UI.
========================================================================================= */
const ART_FILES = ['room', 'bed', 'papa', 'h1', 'h2', 'h3', 'm1', 'm2', 'm3', 'm4', 'k1', 'k2', 'k3', 'k4', 'racket', 'glass', 'phone', 'alarm', 'fan', 'switch', 'frame', 'btn', 'rbtn', 'panel', 'ribbon', 'star', 'coin', 'gem', 'heart', 'papacold', 'mummy', 'dadi', 'dada', 'kid', 'fm1', 'fm2', 'fm3', 'fd1', 'fd2', 'fd3', 'fD1', 'fD2', 'fD3', 'fk1', 'fk2', 'fk3', 't_helmet', 't_ninja', 't_ghost', 't_motu', 't_tez', 't_rani', 'room_gaon', 'room_hostel', 'room_shaadi', 'room_mahal', 'bed_gaon', 'bed_hostel', 'bed_shaadi', 'bed_mahal', 'dost', 'dulha', 'raja', 'fo2', 'fo3', 'fu2', 'fu3', 'fr2', 'fr3', 'cat1', 'cat2', 'liz1', 'liz2', 'liz3', 'jugnu', 'b_don', 'b_baba', 'b_sultan', 'b_topper', 'b_dj', 'b_express', 'b_mafia', 'b_overtime', 'b_monsoon', 'b_ninjamaster', 'b_cyber', 'b_ranimaa', 'b_twins', 'b_general', 'b_maharaja', 'rajawalk'];
const ART = {
  i: {}, ok: false, n: 0,
  src(k) { return (window.ART_DATA && ART_DATA[k]) || `art/${k}.webp`; },
  load() {
    ART_FILES.forEach(k => { const im = new Image(); im.onload = () => { if (++this.n === ART_FILES.length) this.ready(); }; im.onerror = () => { console.warn('art fail', k); if (++this.n === ART_FILES.length) this.ready(); }; im.src = this.src(k); this.i[k] = im; });
  },
  ready() { this.ok = true; try { buildBg(); } catch (e) { } document.body.classList.add('artOn'); },
  ROOMS: { bedroom: { bg: 'room', bed: 'bed', top: 0.47 }, gaon: { bg: 'room_gaon', bed: 'bed_gaon', top: 0.55 }, hostel: { bg: 'room_hostel', bed: 'bed_hostel', top: 0.63 }, shaadi: { bg: 'room_shaadi', bed: 'bed_shaadi', top: 0.52 }, mahal: { bg: 'room_mahal', bed: 'bed_mahal', top: 0.645, sw: [650, 758], win: [300, 250, 410, 470] } },
  R0() { return this.ROOMS[theme]; },
  bed() { const r = this.ok && this.ROOMS[theme]; return !!(r && this.i[r.bg] && this.i[r.bg].width); },
  rr: { ox: 0, oy: 0, s: 1 },
  P(px, py) { return [this.rr.ox + px * this.rr.s, this.rr.oy + py * this.rr.s]; },
  img(k, x, y, w, ax = 0.5, ay = 0.5, rot = 0, flip = 1, alpha = 1) {
    const im = this.i[k]; if (!im || !im.width) return; const h = w * im.height / im.width;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); if (rot) ctx.rotate(rot); if (flip < 0) ctx.scale(-1, 1); ctx.drawImage(im, -w * ax, -h * ay, w, h); ctx.restore();
  }
};
ART.load();

/* ---------- 1. painted room background ---------- */
const _aBuildBg = window.buildBg;
window.buildBg = function () {
  _aBuildBg();
  if (!ART.bed()) return;
  const im = ART.i[ART.R0().bg], g = bg.getContext('2d'); g.setTransform(DPR, 0, 0, DPR, 0, 0);
  const s = Math.max(W / im.width, H / im.height), ox = (W - im.width * s) * 0.3, oy = H - im.height * s;
  ART.rr = { ox, oy, s };
  g.drawImage(im, ox, oy, im.width * s, im.height * s);
  // raat ka gehrapan: upar halka andhera, neeche roshni
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(8,3,26,.38)'); gr.addColorStop(0.55, 'rgba(8,3,26,.12)'); gr.addColorStop(1, 'rgba(8,3,26,.30)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
};

/* ---------- 2. hazards ke positions painted kamre ke hisaab se ---------- */
const _aShelf = HZ.shelf.bind(HZ), _aPos = HZ.pos.bind(HZ), _aWin = HZ.win.bind(HZ);
HZ.shelf = function () { if (!ART.bed()) return _aShelf(); const [x, y] = ART.P(15, 538); return { x: x + 6, y, w: 282 * ART.rr.s - 12 }; };
HZ.pos = function (k) {
  if (!ART.bed()) return _aPos(k);
  const m = { glass: [112, 538], alarm: [190, 538], phone: [262, 538], frame: [160, 372], switch: ART.R0().sw || [662, 742] }[k];
  return m ? ART.P(m[0], m[1]) : _aPos(k);
};
HZ.win = function () { if (!ART.bed()) return _aWin(); const wv = ART.R0().win || [395, 255, 225, 395], [x, y] = ART.P(wv[0], wv[1]); return { x, y, w: wv[2] * ART.rr.s, h: wv[3] * ART.rr.s }; };

/* ---------- 3. pankha ---------- */
const _aFan = window.drawFan;
window.drawFan = function () {
  if (!ART.bed()) return _aFan();
  try { drawRoomItems(performance.now() / 1000); } catch (e) { }
  const t = performance.now() / 1000, off = HZ.on && HZ.on.pankha && HZ.o.pankha && HZ.o.pankha.st !== 'on', slow = off && HZ.o.pankha.st === 'slow';
  const w = W * 0.5, x = W / 2, y = -6 * S;
  if (!off || slow) {
    // ghoomte pankhe ka dhundhla ghera
    ctx.save(); ctx.globalAlpha = slow ? 0.25 : 0.4; const gr = ctx.createRadialGradient(x, y + w * 0.36, 0, x, y + w * 0.36, w * 0.55); gr.addColorStop(0, 'rgba(180,160,240,.5)'); gr.addColorStop(1, 'rgba(180,160,240,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(x, y + w * 0.36, w * 0.55, w * 0.12, 0, 0, 7); ctx.fill(); ctx.restore();
    const ph = Math.floor(t * (slow ? 8 : 30)) % 2;
    ART.img('fan', x, y, w, 0.5, 0, 0, ph ? -1 : 1, 0.85);
  } else ART.img('fan', x, y, w, 0.5, 0);
};

/* ---------- 4. bistar ---------- */
const _aBed = window.drawBedFrame;
window.drawBedFrame = function () {
  if (!ART.bed()) return _aBed();
  const w = bed.w * 1.16, x = bed.x - bed.w * 0.07, im = ART.i[ART.R0().bed], h = w * im.height / im.width;
  ctx.save(); ctx.fillStyle = 'rgba(5,2,15,.45)'; ctx.beginPath(); ctx.ellipse(x + w / 2, bed.y + h * 0.5, w * 0.52, 14 * S, 0, 0, 7); ctx.fill(); ctx.restore();
  ctx.drawImage(im, x, bed.y - h * ART.R0().top, w, h);
};

/* ---------- 5. Parivaar: painted body + 3 chehre (har duniya) ---------- */
const FAM = {
  papa: { b: 'papa', f: [null, 'h2', 'h3'], papa: 1 },
  mummy: { b: 'mummy', f: [null, 'fm2', 'fm3'] },
  dadi: { b: 'dadi', f: [null, 'fd2', 'fd3'] }, nani: { b: 'dadi', f: [null, 'fd2', 'fd3'] },
  dada: { b: 'dada', f: [null, 'fD2', 'fD3'] }, nana: { b: 'dada', f: [null, 'fD2', 'fD3'] },
  bachcha: { b: 'kid', f: [null, 'fk2', 'fk3'], kid: 1 },
  dost: { b: 'dost', f: [null, 'fo2', 'fo3'] }, dulha: { b: 'dulha', f: [null, 'fu2', 'fu3'] }, raja: { b: 'raja', f: [null, 'fr2', 'fr3'] }
};
const _aPerson = window.drawPerson;
window.drawPerson = function (s, time) {
  const id = s.cid || s.kind, F = FAM[id];
  if (!ART.ok || !F || s.walk || !ART.i[F.b] || !ART.i[F.b].width) return _aPerson(s, time);
  const multi = G.sleepers.length > 1, cold = !multi && HZ.on && HZ.on.kambal && HZ.o.kambal && HZ.o.kambal.st === 'off';
  const bodyK = cold && F.papa ? 'papacold' : F.b, bim = ART.i[bodyK];
  const seg = Math.max(60 * S, s.end - s.x), w = multi ? seg * (F.kid ? 1.15 : 1.25) : (ART.bed() ? bed.w * 0.86 : seg * 1.22), k = w / bim.width, h = bim.height * k;
  const x0 = s.x + 6 * S - 0.17 * w, y0 = bed.y + 8 * S - h;
  const br = Math.sin(time * 1.9 + s.x) * 0.012, wig = (s.wig > 0 ? Math.sin(time * 50) * 2.5 * S * Math.min(1, s.wig) : 0) + (cold ? Math.sin(time * 60) * 1.6 * S : 0);
  ctx.save(); ctx.translate(wig, 0);
  ctx.translate(x0 + w * 0.5, y0 + h); ctx.scale(1, 1 + br); ctx.translate(-(x0 + w * 0.5), -(y0 + h));
  ctx.drawImage(bim, x0, y0, w, h);
  const ang = G.cine && (G.cine.kind === 'wake' || G.cine.kind === 'fail') || s.neend < 22, irr = s.bitten > 0 || s.neend < 55;
  const fk = !cold && (ang ? F.f[2] : irr ? F.f[1] : null), fi = fk && ART.i[fk];
  if (fi && fi.width) { if (F.papa) ctx.drawImage(fi, x0 - 15 * k, y0 - 28 * k, fi.width * k, fi.height * k); else ctx.drawImage(fi, x0, y0, w, h); }
  ctx.restore();
  if (cold) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.22 + Math.sin(time * 6) * 0.08; const g = ctx.createRadialGradient(x0 + w * 0.4, y0 + h * 0.5, 0, x0 + w * 0.4, y0 + h * 0.5, w * 0.6); g.addColorStop(0, 'rgba(127,212,255,.9)'); g.addColorStop(1, 'rgba(127,212,255,0)'); ctx.fillStyle = g; ctx.fillRect(x0 - 20, y0 - 40, w + 40, h + 60); ctx.restore(); }
  if (!ang && typeof drawSleepZ === 'function') { try { drawSleepZ(s, S * s.sc, time); } catch (e) { } }
  if (multi) { const w2 = 64 * S, ch = CHARS[id] || { e: '😴', n: id }, sv = SENS(s), by = Math.min(y0 + h * 0.05, s.y - 64 * S); ctx.fillStyle = 'rgba(10,5,30,.8)'; rr(ctx, s.x - w2 / 2 + 20 * S, by, w2, 9 * S, 4.5 * S); ctx.fill(); ctx.fillStyle = s.neend < 30 ? '#fff' : sv > 1.3 ? '#c7b0ff' : P2; rr(ctx, s.x - w2 / 2 + 21 * S, by + 1, Math.max(4, (w2 - 2) * s.neend / 100), 7 * S, 3.5 * S); ctx.fill(); ctx.font = `800 ${8.5 * S}px Poppins`; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText(`${ch.e} ${ch.n}${sv > 1.3 ? ' ⚡' : ''}`, s.x + 20 * S, by - 5 * S); }
};

/* ---------- 6. machhar + Kallu sprites (har duniya) ---------- */
const _aMosq = window.drawMosq;
window.drawMosq = function (m, time) {
  if (!ART.ok || m.boss || m.t === 'heera') return _aMosq(m, time);
  if (m.t === 'jugnu') { if (m.dead) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 40 * S); gg.addColorStop(0, `rgba(${ELEC},.55)`); gg.addColorStop(1, 'rgba(127,212,255,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(m.x, m.y, 40 * S, 0, 7); ctx.fill(); ctx.restore(); ART.img('jugnu', m.x, m.y + Math.sin(time * 6 + m.x) * 3 * S, 44 * S, 0.5, 0.5, 0, (m.vx || 1) > 0 ? 1 : -1); return; }
  if (m.dead) return;
  const kal = m.kallu, sz = (kal ? 74 : 46) * S * (kal ? 1 : Math.min(1.6, m.size || 1));
  let f;
  if (kal) { if (m.l0 === undefined) m.l0 = m.life; f = m.hurt > 0 ? 'k3' : (m.l0 - m.life) < 1.6 || m.life < 1.5 ? 'k2' : 'k1'; }
  else { const TT = { helmet: 't_helmet', ninja: 't_ninja', ghost: 't_ghost', motu: 't_motu', tez: 't_tez', chhotu: 't_tez', rani: 't_rani' }[m.t]; f = TT && m.state !== 'bite' ? TT : m.state === 'bite' ? 'm3' : (Math.floor((m.flap || 0) / 3) % 2 ? 'm1' : 'm2'); }
  let a = 1; if (m.t === 'ghost' && !m.solid) a = 0.35; if (m.t === 'ninja') a = m.vis !== undefined ? m.vis : 0.55; if (m.alpha !== undefined) a = m.alpha;
  const bob = Math.sin((m.ph || 0) * 9) * 1.5 * S, dir = (m.dir || (m.vx > 0 ? 1 : -1)) || 1;
  // halki chhaya + glow taaki andhere mein bhi dikhe
  ctx.save(); ctx.globalAlpha = a * 0.5; ctx.globalCompositeOperation = 'lighter'; const gr = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, sz * 0.6); gr.addColorStop(0, 'rgba(154,109,245,.35)'); gr.addColorStop(1, 'rgba(154,109,245,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(m.x, m.y, sz * 0.6, 0, 7); ctx.fill(); ctx.restore();
  const isT = f.startsWith('t_'), szz = sz * (isT ? (m.t === 'motu' ? 1.25 : m.t === 'chhotu' ? 0.7 : m.t === 'rani' ? 1.2 : 1.05) : 1);
  ART.img(f, m.x, m.y + bob, szz, 0.5, 0.5, (m.vy || 0) * 0.0006 * dir + (isT ? Math.sin((m.flap || 0) * 1.3) * 0.05 : 0), dir, a);
  if (m.hurt > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, m.hurt * 4); ART.img(f, m.x, m.y + bob, sz, 0.5, 0.5, 0, dir); ctx.restore(); }
  if (!kal && !f.startsWith('t_') && m.t && m.t !== 'normal' && MT[m.t] && MT[m.t].emoji) { ctx.font = `${11 * S}px Poppins`; ctx.textAlign = 'center'; ctx.globalAlpha = a; ctx.fillText(MT[m.t].emoji, m.x + dir * sz * 0.1, m.y - sz * 0.42); ctx.globalAlpha = 1; }
  if (m.hp > 1 && m.maxhp > 1 && !kal) { const bw = 22 * S; ctx.fillStyle = 'rgba(10,4,30,.7)'; ctx.fillRect(m.x - bw / 2, m.y + sz * 0.38, bw, 3 * S); ctx.fillStyle = `rgb(${ELEC})`; ctx.fillRect(m.x - bw / 2, m.y + sz * 0.38, bw * m.hp / m.maxhp, 3 * S); }
  if (kal) NASHA.tag(m);
};

/* ---------- 7. racket sprite ---------- */
const _aRacket = window.drawRacket;
window.drawRacket = function (time) {
  if (!ART.ok || !(ptr.vis > 0) || state === 'menu') return _aRacket(time);
  const r = R(), w = r * 3.9, hot = ptr.hotT > 0, low = G.bat < 12;
  const tilt = clamp((ptr.vx || 0) * 0.0004, -0.35, 0.35);
  ctx.save(); ctx.globalAlpha = ptr.vis * (low ? 0.6 : 1);
  // mesh centre sprite ke (0.685, 0.33) pe hai
  ctx.translate(ptr.x, ptr.y); ctx.rotate(tilt);
  const im = ART.i.racket, h = w * im.height / im.width; ctx.drawImage(im, -w * 0.685, -h * 0.33, w, h);
  if (ptr.zapT > 0 || hot) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = hot ? 0.35 + Math.sin(time * 20) * 0.2 : Math.min(1, ptr.zapT * 5); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.2); g.addColorStop(0, hot ? 'rgba(255,255,255,.9)' : `rgba(${ELEC},.9)`); g.addColorStop(1, 'rgba(127,212,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 1.2, 0, 7); ctx.fill(); }
  ctx.restore();
  if (hot) { ctx.font = `900 ${11 * S}px Poppins`; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText('🔥 GARAM!', ptr.x, ptr.y - r - 10 * S); }
};

/* ---------- 8. shelf ka saaman, frame, switch (painted) ---------- */
const _aHZDraw = HZ.draw.bind(HZ);
HZ.draw = function (time) {
  _aHZDraw(time);
  if (!ART.bed() || !['play', 'clear', 'wake', 'over', 'fail', 'menu', 'intro', 'ko'].includes(state)) return;
  const O = this.o || {}, on = this.on || {}, s = ART.rr.s;
  // glass
  const g = O.glass || {}; if (g.st !== 'gone') { const [gx, gy0] = this.pos('glass'), gy = g.st === 'fall' ? g.fy : gy0, wob = g.st === 'wobble' ? Math.sin(time * 40) * 0.14 : g.st === 'fall' ? time * 8 : 0; ART.img('glass', gx, gy, 62 * s, 0.5, 1, wob); }
  const al = O.alarm || {}, [ax, ay] = this.pos('alarm'); ART.img('alarm', ax + (al.st === 'ring' ? Math.sin(time * 60) * 2 * S : 0), ay, 74 * s, 0.5, 1, al.st === 'ring' ? Math.sin(time * 45) * 0.08 : 0);
  const p = O.phone || {}, [px, py] = this.pos('phone'); ART.img('phone', px + (p.st === 'ring' ? Math.sin(time * 70) * 1.5 * S : 0), py, 46 * s, 0.5, 1, p.st === 'ring' ? Math.sin(time * 50) * 0.1 : 0);
  if (p.st === 'ring') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.5 + Math.sin(time * 18) * 0.4; const gg = ctx.createRadialGradient(px, py - 40 * s, 0, px, py - 40 * s, 60 * S); gg.addColorStop(0, `rgba(${ELEC},.8)`); gg.addColorStop(1, 'rgba(127,212,255,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(px, py - 40 * s, 60 * S, 0, 7); ctx.fill(); ctx.restore(); this.cring(px, py - 40 * s, 30 * S, p.t / 4.5); this.tapHint(px, py - 110 * s, '📱 TAP!'); }
  if (al.st === 'ring') { this.cring(ax, ay - 40 * s, 30 * S, al.t / 2); this.tapHint(ax, ay - 110 * s, '⏰ TAP!'); }
  if (g.st === 'wobble') { this.cring(gx2(), this.pos('glass')[1] - 30 * s, 28 * S, g.t / 1.1); this.tapHint(gx2(), this.pos('glass')[1] - 110 * s, '⚠️ TAP!'); }
  function gx2() { return HZ.pos('glass')[0]; }
  // frame (painted)
  const fr = O.frame || {}; if (fr.st !== 'gone') { const [fx, fy0] = this.pos('frame'), fy = fr.st === 'fall' ? fr.fy : fy0; ART.img('frame', fx, fy, 230 * s, 0.5, 1, fr.ang || 0); if (fr.st === 'tilt' && fr.t < 2.6) { this.cring(fx, fy - 110 * s, 60 * S, fr.t / 3.5); this.tapHint(fx, fy - 240 * s, '🖼️ TAP!'); } }
  // switch
  const [sx, sy] = this.pos('switch'); ART.img('switch', sx, sy, 112 * s);
  if (on.pankha && O.pankha && O.pankha.st === 'off') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.5 + Math.sin(time * 10) * 0.5; ctx.strokeStyle = `rgb(${ELEC})`; ctx.lineWidth = 4 * S; ctx.beginPath(); ctx.roundRect(sx - 64 * s, sy - 42 * s, 128 * s, 84 * s, 10 * S); ctx.stroke(); ctx.restore(); this.tapHint(sx, sy - 70 * s, '🔌 TAP!'); }
};

/* ---------- 9. painted Kallu in welcome, haar poster, share card ---------- */
const _aReady = ART.ready.bind(ART);
ART.ready = function () {
  _aReady();
  const mk = $('mKallu'); if (mk) { const sv = mk.querySelector('svg'); if (sv) sv.remove(); if (!mk.querySelector('img')) mk.insertAdjacentHTML('afterbegin', `<img src="${ART.src('k2')}" alt="" style="transform:scaleX(-1)">`); }
  if (typeof SHARE !== 'undefined') SHARE.kallu = () => Promise.resolve(ART.i.k1);
  const _ka = SHARE.kalluArt.bind(SHARE);
  SHARE.kalluArt = async function (c, x, y, w, stamp) { const im = stamp && /HAARA/.test(stamp) ? ART.i.k4 : ART.i.k2; c.save(); c.translate(x, y); c.rotate(-0.08); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 40; const h = w * im.height / im.width; c.drawImage(im, -w / 2, -h / 2, w, h); c.restore(); if (stamp) { c.save(); c.translate(x + 10, y + w * 0.32); c.rotate(-0.28); c.strokeStyle = '#fff'; c.lineWidth = 10; c.fillStyle = 'rgba(116,58,232,.85)'; c.font = '900 50px Poppins'; const sw2 = c.measureText(stamp).width + 70; c.beginPath(); c.roundRect(-sw2 / 2, -52, sw2, 104, 20); c.fill(); c.stroke(); this.txt(c, stamp, 0, 4, 50, '#fff', 900); c.restore(); } };
};
if (ART.ok) ART.ready();
const _aRoast = ROAST.play.bind(ROAST);
ROAST.play = function (after) { _aRoast(after); if (!ART.ok) return; const k = document.querySelector('#roast .rKallu'); if (k) k.innerHTML = `<img src="${ART.src('k2')}" alt="" style="transform:scaleX(-1)">`; };

/* ---------- 10. painted saaman pe tap: bada, saaf nishana ---------- */
const _aTap = HZ.tap.bind(HZ);
HZ.tap = function (x, y) {
  if (!ART.bed() || state !== 'play') return _aTap(x, y);
  const s = ART.rr.s, O = this.o, on = this.on, u = this.u();
  const hitAt = (k, hgt, rad) => { const [px, py] = k === 'glassFall' ? [this.pos('glass')[0], O.glass.fy] : this.pos(k); return Math.hypot(x - px, y - (py - hgt * s / 2)) < Math.max(rad * S, hgt * s * 0.75) ? [px, py] : null; };
  let p = null;
  if (on.glass && O.glass.st === 'wobble') p = hitAt('glass', 80, 46);
  else if (on.glass && O.glass.st === 'fall') p = hitAt('glassFall', 80, 60);
  if (p) return _aTap(p[0], p[1] - 12 * u);
  if (on.alarm && O.alarm.st === 'ring' && (p = hitAt('alarm', 90, 46))) return _aTap(p[0], p[1] - 12 * u);
  if (on.phone && O.phone.st === 'ring' && (p = hitAt('phone', 90, 46))) return _aTap(p[0], p[1] - 12 * u);
  if (on.frame && O.frame.st === 'tilt' && (p = hitAt('frame', 225, 60))) return _aTap(p[0], p[1] - 12 * u);
  if (on.pankha && O.pankha.st === 'off') { const [sx, sy] = this.pos('switch'); if (Math.hypot(x - sx, y - sy) < 52 * S) return _aTap(sx, sy); }
  return _aTap(x, y);
};

/* ---------- 11. Boss painted ---------- */
const _aBoss = window.drawBoss;
window.drawBoss = function (m, time) {
  const im = ART.ok && ART.i['b_' + m.key];
  if (!im || !im.width) return _aBoss(m, time);
  const sz = 120 * S * Math.min(1.25, (m.size || 3.1) / 3.1), h = sz * im.height / im.width;
  ctx.fillStyle = m.fake ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(m.x, m.y + h * 0.55, sz * 0.32, 7 * S, 0, 0, 7); ctx.fill();
  if (m.mode === 'warn' && m.aim) { ctx.save(); ctx.setLineDash([8 * S, 8 * S]); ctx.lineDashOffset = -time * 60; ctx.strokeStyle = `rgba(255,255,255,${0.5 + Math.sin(time * 30) * 0.4})`; ctx.lineWidth = 3 * S; ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.aim[0], m.aim[1]); ctx.stroke(); ctx.restore(); }
  if (m.draining && ptr.vis > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(127,212,255,.6)'; ctx.lineWidth = 6 * S; ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(ptr.x, ptr.y); ctx.stroke(); ctx.restore(); }
  const hot = m.mode === 'warn' || m.mode === 'dash', bob = Math.sin(time * 5 + m.x * 0.01) * 4 * S, dir = (m.vx || 0) < -5 ? -1 : 1;
  ctx.save(); ctx.globalAlpha = m.fake ? 0.55 : 1;
  if (m.enraged || hot) { ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, sz * 0.8); g.addColorStop(0, `rgba(${ELEC},${hot ? 0.55 : 0.3})`); g.addColorStop(1, 'rgba(127,212,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(m.x, m.y, sz * 0.8, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
  ART.img('b_' + m.key, m.x, m.y + bob, sz, 0.5, 0.5, Math.sin(time * 3) * 0.04 + (hot ? Math.sin(time * 40) * 0.05 : 0), dir);
  if (m.hurt > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, m.hurt * 4); ART.img('b_' + m.key, m.x, m.y + bob, sz, 0.5, 0.5, 0, dir); }
  ctx.restore();
  if (!m.fake) { const bw = 90 * S, y = m.y - h * 0.62; ctx.fillStyle = 'rgba(10,4,30,.75)'; rr(ctx, m.x - bw / 2, y, bw, 7 * S, 3.5 * S); ctx.fill(); ctx.fillStyle = m.enraged ? '#fff' : `rgb(${ELEC})`; rr(ctx, m.x - bw / 2 + 1, y + 1, Math.max(3, (bw - 2) * m.hp / m.maxhp), 5 * S, 2.5 * S); ctx.fill(); }
};

/* ---------- 12. Billi + Chhipkali painted ---------- */
const _aHZDraw2 = HZ.draw.bind(HZ);
HZ.draw = function (time) {
  _aHZDraw2(time);
  if (!ART.ok || !this.on || !['play', 'clear', 'wake', 'over', 'fail', 'ko'].includes(state)) return;
  const O = this.o || {};
  if (this.on.billi && O.billi && O.billi.st !== 'none') { const c = O.billi; ART.img(c.st === 'flee' ? 'cat2' : 'cat1', c.x, c.y - 10 * S + Math.abs(Math.sin(time * 12)) * -3 * S, 92 * S, 0.5, 0.6, 0, (c.dir || 1)); }
  if (this.on.chhipkali && O.chhipkali && O.chhipkali.st !== 'gone') { const l = O.chhipkali, eat = l.eatT > 0 || l.st === 'eat'; ART.img(l.st === 'fall' ? 'liz3' : eat ? 'liz2' : 'liz1', l.x, l.y, 78 * S, 0.5, 0.5, l.st === 'fall' ? time * 10 : 0, (l.vx || 1) > 0 ? 1 : -1); }
};

/* ---------- 13. Raja neend mein chalte hue ---------- */
const _aPerson3 = window.drawPerson;
window.drawPerson = function (s, time) {
  const im = ART.ok && ART.i.rajawalk;
  if (!s.walk || (s.cid || s.kind) !== 'raja' || !im || !im.width) return _aPerson3(s, time);
  const h = 165 * S, w = h * im.width / im.height, step = Math.sin(time * 6), bob = Math.abs(step) * 4 * S;
  ctx.save(); ctx.fillStyle = 'rgba(5,2,15,.4)'; ctx.beginPath(); ctx.ellipse(s.x, s.y + h * 0.78, w * 0.38, 7 * S, 0, 0, 7); ctx.fill(); ctx.restore();
  const wig = s.wig > 0 ? Math.sin(time * 50) * 2.5 * S : 0;
  ART.img('rajawalk', s.x + wig, s.y - h * 0.18 - bob, w, 0.48, 0.18, step * 0.04, s.dir < 0 ? -1 : 1);
  if (s.bitten > 0) { ctx.font = `${18 * S}px Poppins`; ctx.textAlign = 'center'; ctx.fillText('💢', s.x + 20 * S, s.y - h * 0.25); }
  ctx.font = `800 ${10 * S}px Poppins`; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillText('z z z', s.x + (s.dir < 0 ? -30 : 30) * S, s.y - h * 0.24 - Math.sin(time * 3) * 4 * S);
};

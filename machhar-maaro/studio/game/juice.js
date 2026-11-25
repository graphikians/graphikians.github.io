/* ================= MACHHAR MAARO — "HAR SECOND MAZA" (game feel) =================
   1. FLASH CHALLENGE — har ~10 sec ek chhota 4-6 sec ka target (streak = bada inaam)
   2. MULTI-KILL      — ek swipe mein 2/3/4/5+ = DOUBLE / TRIPLE / CHAUKA / MASSACRE
   3. KILL ANIMATION  — machhar jal ke ghoomta hua girta hai (X_X), kabhi 👻 aatma udti hai
   4. COIN FLY        — coins udke score tak jaate hain (tink tink)
   5. COMBO RING      — racket ke chaaron taraf combo ka timer + xN
   6. MACHHAR BAATEIN — machhar beech-beech mein bolte hain (Bhaago! / Slurrp 😋)
   7. DHADKAN BEAT    — combo ke saath badhta dholak-style beat
=================================================================================== */
const FLASH = [
  { id: 'k3', t: '🦟', n: 3, d: 4, ev: 'kill' },
  { id: 'k5', t: '🦟', n: 5, d: 6, ev: 'kill' },
  { id: 'air', t: '🌪️', n: 3, d: 5, ev: 'air' },
  { id: 'multi', t: '✌️', n: 1, d: 6, ev: 'multi' },
  { id: 'combo', t: '🔥x', n: 6, d: 6, ev: 'combo' }
];
const TALK = {
  idle: ['I want blood 😋', 'Papa tastes sweet 🍬', 'Party tonight 🥳', 'Bzz bzz bzz 🎵', 'I sing in your ear 🎤', 'On a diet, just 1 bite 😇'],
  scared: ['Run!! 😱', 'Racket incoming! 😨', 'Mummyyy 😭', 'I was just passing by 😅'],
  bite: ['Slurrp 😋', 'Ahh, fresh blood 🩸', 'Just one more sip ☕']
};
const JUICE = {
  reset() {
    Object.assign(G, { corpses: [], flyC: [], talks: [], fc: null, fcNext: rnd(6, 9), fcStreak: 0, mk: { n: 0, t: 0 }, talkT: rnd(2, 4), beatT: 0, beatStep: 0, tinkCd: 0 });
  },
  /* ---------- on every kill ---------- */
  onKill(m, how) {
    if (m.decoy || m.boss) return;
    // corpse: jalke ghoomta hua girta hai
    G.corpses.push({ x: m.x, y: m.y, vx: rnd(-60, 60) * S + (m.vx || 0) * 0.2, vy: -rnd(120, 220) * S, rot: 0, vr: rnd(-14, 14), life: 1.2, size: m.size, ghost: Math.random() < 0.22 });
    for (let i = 0; i < 4; i++) G.parts.push({ x: m.x, y: m.y, vx: rnd(-30, 30) * S, vy: -rnd(30, 70) * S, life: rnd(0.5, 0.9), max: 0.9, size: rnd(3, 6) * S, col: 'rgba(200,190,230,.35)', g: -20 * S });
    tone(rnd(3200, 4200), 1800, 0.18, 0.025, 'sawtooth', 0.04); // tsss
    // coins udte hain score ki taraf
    const c = Math.min(4, Math.max(1, Math.round((m.coin || 1) / 2)));
    for (let i = 0; i < c; i++) G.flyC.push({ x: m.x, y: m.y, vx: rnd(-160, 160) * S, vy: -rnd(120, 260) * S, t: -i * 0.05, sx: m.x, sy: m.y });
    // multi-kill window
    const mk = G.mk; if (G.t - mk.t < 0.16) mk.n++; else mk.n = 1; mk.t = G.t; mk.x = m.x; mk.y = m.y;
    // flash challenge progress
    const near = G.sleepers.some(s => s.pts.some(p => Math.hypot(m.x - s.x - p.x, m.y - s.y - p.y) < 110 * S));
    this.fcEv('kill', 1); if (!near) this.fcEv('air', 1); this.fcEv('combo', G.combo, true);
  },
  multiDone(n) {
    const L = { 2: ['DOUBLE ZAP!', 'Double!'], 3: ['TRIPLE! 🔥', 'Triple!'], 4: ['QUAD! 🏏', 'Quad!'] }[n] || ['MOSQUITO MASSACRE! 💀', 'Massacre!'];
    const b = n * 60; G.score += b;
    pop(L[0], G.mk.x || W / 2 + 3, (G.mk.y || H * 0.4) - 40 * S, 20, '#fff', 0.8, 50);
    slow(0.12 + n * 0.06); G.flash = 0.15 + n * 0.05; G.flashCol = '127,212,255'; shake(4 + n * 3); vib([20, 20, 20 * n]);
    [0, 4, 7, 12].slice(0, Math.min(4, n)).forEach((k, i) => tone(NOTES[Math.min(10, 3 + i * 2)], NOTES[Math.min(10, 3 + i * 2)], 0.14, 0.09, 'triangle', i * 0.06));
    if (n >= 3 && (G.sayCd || 0) < G.t) { G.sayCd = G.t + 5; NASHA.say(L[0], L[1]); }
    this.fcEv('multi', 1);
    META.x('Skill Spike (Multi-kill)');
  },
  /* ---------- flash challenges ---------- */
  fcEv(ev, v, set) {
    const f = G.fc; if (!f || f.done || f.ev !== ev) return;
    f.c = set ? Math.max(f.c, v) : f.c + v; if (f.c >= f.n) this.fcWin();
  },
  fcWin() {
    const f = G.fc; f.done = 1; f.endT = 0.9; G.fcStreak++;
    const r = 15 * G.fcStreak + 10; f.r = r; G.coins += r; G.score += 100 * G.fcStreak;
    pop(`+${r} 🪙`, W * 0.5 + 60 * S, H * 0.255, 14, '#fff', 0.9, 30);
    [0, 2, 4, 7].forEach((k, i) => tone(NOTES[k + 2], NOTES[k + 2], 0.12, 0.1, 'square', i * 0.05)); vib([15, 15, 40]);
    META.x('Micro-goal + Streak (Flash Challenge)');
  },
  /* ---------- per-frame ---------- */
  tick(dt, gdt) {
    if (!G.corpses) this.reset();
    for (const c of G.corpses) { c.vy += 900 * S * gdt; c.x += c.vx * gdt; c.y += c.vy * gdt; c.rot += c.vr * gdt; c.life -= gdt; if (Math.random() < 0.3) G.parts.push({ x: c.x, y: c.y, vx: rnd(-10, 10) * S, vy: -40 * S, life: 0.5, max: 0.5, size: rnd(2, 4) * S, col: 'rgba(200,190,230,.3)', g: -30 * S }); }
    G.corpses = G.corpses.filter(c => c.life > 0 && c.y < H + 40);
    const tx = W / 2, ty = 62 * S; G.tinkCd -= dt;
    for (const p of G.flyC) { p.t += dt; if (p.t < 0) continue; if (p.t < 0.28) { p.vy += 600 * S * dt; p.x += p.vx * dt; p.y += p.vy * dt; } else { const k = Math.min(1, dt * 9); p.x += (tx - p.x) * k; p.y += (ty - p.y) * k; if (Math.hypot(tx - p.x, ty - p.y) < 14 * S) { p.done = 1; if (G.tinkCd <= 0) { G.tinkCd = 0.05; tone(2400 + rnd(0, 600), 2400, 0.05, 0.03, 'triangle'); } } } }
    G.flyC = G.flyC.filter(p => !p.done && p.t < 1.6);
    // multi-kill close
    if (G.mk.n && G.t - G.mk.t > 0.17) { if (G.mk.n >= 2) this.multiDone(G.mk.n); G.mk.n = 0; }
    // flash challenge
    if (CL.n >= 2 && !CL.ev) {
      const f = G.fc;
      if (!f) { G.fcNext -= gdt; if (G.fcNext <= 0 && !G.bossCard) { const d = FLASH[(Math.random() * FLASH.length) | 0]; G.fc = Object.assign({ c: 0, left: d.d }, d); tone(1200, 1800, 0.1, 0.07, 'square'); tone(1800, 2400, 0.1, 0.07, 'square', 0.08); } }
      else if (f.done) { f.endT -= dt; if (f.endT <= 0) { G.fc = null; G.fcNext = rnd(5, 8); } }
      else { f.left -= gdt; if (f.left <= 0) { f.done = 1; f.fail = 1; f.endT = 0.7; if (G.fcStreak > 1) popOnce('fcl', 2, `💔 x${G.fcStreak}`, W / 2 + 40 * S, H * 0.255, 12, '#d9ccff', 0.8); G.fcStreak = 0; tone(400, 200, 0.2, 0.06, 'square'); } else if (f.left < 1.5 && ((f.left * 4) | 0) !== f.lt) { f.lt = (f.left * 4) | 0; tone(1600, 1600, 0.03, 0.04, 'square'); } }
    }
    // machhar baatein
    G.talkT -= gdt; for (const t of G.talks) t.life -= gdt; G.talks = G.talks.filter(t => t.life > 0 && !t.m.dead);
    if (G.talkT <= 0) {
      G.talkT = rnd(5, 8); if (G.ann || G.fc && !G.fc.done) return; const pool = G.mosq.filter(m => !m.dead && !m.boss && !m.decoy && !m.kallu && m.x > 40 && m.x < W - 40 && m.y > H * 0.15);
      if (pool.length) { const m = pool[(Math.random() * pool.length) | 0], scared = ptr.vis > 0 && Math.hypot(ptr.x - m.x, ptr.y - m.y) < 120 * S, k = m.state === 'bite' ? 'bite' : scared ? 'scared' : 'idle'; G.talks.push({ m, txt: TALK[k][(Math.random() * TALK[k].length) | 0], life: 1.7 }); }
    }
    // dhadkan beat (combo ke saath tez)
    if (!(G.fever > 0) && G.t > 2) {
      const bpm = 92 + Math.min(44, G.combo * 3), step = 60 / bpm / 2; G.beatT -= dt;
      if (G.beatT <= 0) {
        G.beatT += step; const s = G.beatStep++ % 8, lvl = G.combo;
        if (s % 2 === 1) noise(0.04, 0.025 + Math.min(0.03, lvl * 0.003), 'highpass', 7000);
        if (lvl >= 3 && (s === 0 || s === 3 || s === 4)) tone(130, 48, 0.14, 0.13 + Math.min(0.1, lvl * 0.008));
        if (lvl >= 8 && (s === 2 || s === 6)) noise(0.08, 0.06, 'bandpass', 1800, 0.002, 1.2);
        if (lvl >= 12 && s % 4 === 0) { const n = [0, 0, 3, 5][(G.beatStep >> 3) % 4]; tone(NOTES[n] / 4, NOTES[n] / 4, 0.2, 0.08, 'sawtooth'); }
      }
    }
  },
  /* ---------- draw ---------- */
  draw(time) {
    if (!G.corpses) return;
    ctx.save();
    for (const c of G.corpses) {
      const s = c.size * S * 1.3, a = clamp(c.life / 0.4, 0, 1);
      if (window.ART && ART.ok) { ctx.globalAlpha = a; ART.img('m4', c.x, c.y, 40 * S * c.size, 0.5, 0.5, c.rot * 0.3); } else {
      ctx.globalAlpha = a; ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot);
      ctx.strokeStyle = '#1a1028'; ctx.lineWidth = 1.2 * s; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-2 * s + i * 3 * s, 3 * s); ctx.lineTo(-6 * s + i * 5 * s, 11 * s); ctx.stroke(); }
      ctx.fillStyle = '#241a36'; ctx.beginPath(); ctx.ellipse(-8 * s, 2 * s, 9 * s, 3.8 * s, 0.25, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(5 * s, -1 * s, 3.4 * s, 0, 7); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.9 * s; ctx.beginPath(); ctx.moveTo(4.6 * s, -3.4 * s); ctx.lineTo(7.4 * s, -0.6 * s); ctx.moveTo(7.4 * s, -3.4 * s); ctx.lineTo(4.6 * s, -0.6 * s); ctx.stroke();
      ctx.restore(); }
      if (c.ghost) { const k = 1.2 - c.life; ctx.globalAlpha = clamp(c.life / 0.6, 0, 0.9); ctx.font = `${16 * S}px Poppins`; ctx.textAlign = 'center'; ctx.fillText('👻', c.x + Math.sin(k * 8) * 8 * S, c.y - 20 * S - k * 90 * S); }
    }
    ctx.globalAlpha = 1;
    for (const p of G.flyC) { if (p.t < 0) continue; const r = 4.5 * S; const g = ctx.createRadialGradient(p.x - r * 0.3, p.y - r * 0.3, 0, p.x, p.y, r); g.addColorStop(0, '#fff6cc'); g.addColorStop(0.45, '#f5b731'); g.addColorStop(1, '#a86a10'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fill(); ctx.strokeStyle = '#ffd65c'; ctx.lineWidth = 1 * S; ctx.stroke(); }
    // speech bubbles
    ctx.font = `800 ${9 * S}px Poppins`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const t of G.talks) {
      const a = Math.min(1, t.life / 0.25, (1.7 - t.life) / 0.15), w = ctx.measureText(t.txt).width + 14 * S, x = clamp(t.m.x, w / 2 + 6, W - w / 2 - 6), y = t.m.y - 34 * S;
      ctx.globalAlpha = a; ctx.fillStyle = 'rgba(255,255,255,.94)'; ctx.beginPath(); ctx.roundRect(x - w / 2, y - 9 * S, w, 16 * S, 8 * S); ctx.fill();
      ctx.beginPath(); ctx.moveTo(t.m.x - 4 * S, y + 8 * S); ctx.lineTo(t.m.x + 4 * S, y + 8 * S); ctx.lineTo(t.m.x, y + 14 * S); ctx.fill();
      ctx.fillStyle = '#2a1270'; ctx.fillText(t.txt, x, y - 1 * S);
    }
    ctx.globalAlpha = 1;
    // combo ring around racket
    if (G.combo >= 2 && ptr.vis > 0 && G.comboT > 0) {
      const r = 34 * S * RK().r * 0.9; ctx.strokeStyle = G.combo >= 10 ? `rgba(${ELEC},.9)` : 'rgba(199,176,255,.85)'; ctx.lineWidth = 3 * S; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(ptr.x, ptr.y, r, -Math.PI / 2, -Math.PI / 2 + 6.283 * clamp(G.comboT / 1.6, 0, 1)); ctx.stroke();
      ctx.font = `900 ${13 * S}px Poppins`; ctx.lineWidth = 3 * S; ctx.strokeStyle = 'rgba(40,12,110,.9)'; ctx.strokeText(`x${G.combo}`, ptr.x + r + 12 * S, ptr.y - r * 0.6); ctx.fillStyle = '#fff'; ctx.fillText(`x${G.combo}`, ptr.x + r + 12 * S, ptr.y - r * 0.6);
    }
    // high-combo screen edge glow
    if (G.combo >= 8) { const a = Math.min(0.35, (G.combo - 7) * 0.03) * (0.7 + Math.sin(time * 8) * 0.3), g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75); g.addColorStop(0, 'rgba(154,109,245,0)'); g.addColorStop(1, `rgba(127,212,255,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    // flash challenge pill
    const f = G.fc;
    if (f && state === 'play') {
      const y = H * 0.185, w = 132 * S, h = 24 * S, x = W - w - 8 * S, cx = x + w / 2, pr = clamp(f.c / f.n, 0, 1), pulse = !f.done && f.left < 1.5 ? 1 + Math.sin(time * 30) * 0.03 : 1;
      ctx.save(); ctx.translate(cx, y); ctx.scale(pulse, pulse); ctx.translate(-cx, -y);
      ctx.globalAlpha = f.done ? clamp(f.endT / 0.3, 0, 1) : 1;
      ctx.fillStyle = f.done && !f.fail ? '#743ae8' : 'rgba(18,8,45,.82)'; ctx.strokeStyle = f.fail ? 'rgba(255,255,255,.3)' : `rgb(${ELEC})`; ctx.lineWidth = 1.5 * S;
      ctx.beginPath(); ctx.roundRect(x, y - h / 2, w, h, h / 2); ctx.fill(); ctx.stroke();
      if (!f.done) { ctx.fillStyle = 'rgba(127,212,255,.22)'; ctx.beginPath(); ctx.roundRect(x, y - h / 2, w * pr, h, h / 2); ctx.fill(); ctx.fillStyle = `rgba(${ELEC},.9)`; ctx.fillRect(x + h / 2, y + h / 2 - 3 * S, (w - h) * clamp(f.left / f.d, 0, 1), 2.5 * S); }
      ctx.font = `900 ${11 * S}px Poppins`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = f.fail ? 'rgba(255,255,255,.7)' : '#fff';
      ctx.fillText(f.done ? (f.fail ? 'TIME UP' : `DONE  +${f.r || 0} COINS`) : `⚡ ${f.t} ${Math.min(f.c, f.n)}/${f.n} · ${Math.ceil(f.left)}s${G.fcStreak ? ` 🔥${G.fcStreak}` : ''}`, cx, y - 1 * S);
      ctx.restore();
    }
    ctx.restore(); ctx.textBaseline = 'alphabetic';
  }
};
const _jStart = META.onStart; META.onStart = function () { _jStart.apply(this, arguments); JUICE.reset(); };
const _jTick = META.tick; META.tick = function (dt, gdt) { _jTick.call(META, dt, gdt); JUICE.tick(dt, gdt); };
const _jKill = window.kill; window.kill = function (m, how) { const wasDead = m.dead; _jKill.apply(this, arguments); if (!wasDead && m.dead && state === 'play') JUICE.onKill(m, how); };
const _jPops = window.drawPops; window.drawPops = function () { if (state === 'play' || state === 'pause' || state === 'ko') JUICE.draw(G.t); _jPops(); };

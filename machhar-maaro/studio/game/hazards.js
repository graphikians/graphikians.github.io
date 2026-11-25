/* ================= MACHHAR MAARO — KHATRE (HAZARDS) ================= */
const HZDEF = {
  glass: { i: '🥛', n: 'Water Glass', how: 'Do not zap near the glass · TAP if it shakes · CATCH if it falls', at: 1 },
  kambal: { i: '🫣', n: 'Blanket Fell', how: 'SWIPE over the sleeper to cover them', at: 2 },
  phone: { i: '📱', n: '3 AM Phone Call', how: 'TAP the phone right away when it rings', at: 2 },
  taal: { i: '🌑', n: 'Blackout Rhythm', how: '3s of darkness every 5s. Use the racket glow', at: 3, timed: 1 },
  pankha: { i: '🌀', n: 'Fan Stops', how: 'TAP the glowing SWITCH 🔌', at: 3 },
  alarm: { i: '⏰', n: 'Alarm Clock', how: 'Do not zap near the clock · TAP to snooze when it rings', at: 4 },
  frame: { i: '🖼️', n: 'Tilted Photo Frame', how: 'TAP to straighten it when it tilts', at: 4 },
  bijli: { i: '⚡', n: 'Power Cut', how: 'Inverter beep = darkness is coming', at: 5 },
  billi: { i: '🐱', n: 'Naughty Cat', how: 'SWIPE the cat to chase it away', at: 6 },
  chhipkali: { i: '🦎', n: 'Lizard', how: 'It eats mosquitoes. Do NOT zap it!', at: 7 },
  shor: { i: '🔊', n: 'Street Noise', how: 'SWIPE or TAP the window to close it', at: 8 },
  kaan: { i: '👂', n: 'Buzz in the Ear', how: 'SWIPE the mosquitoes circling the ear', at: 9 }
};
const SHOR = { bedroom: ['🚚', 'Truck horn!'], gaon: ['🔔', 'Temple bells!'], hostel: ['🚪', 'The warden is knocking!'], shaadi: ['🥁', 'The wedding band!'], mahal: ['🎺', 'Trumpets!'] };

const HZ = {
  on: {}, o: {},
  forLevel(L) {
    const r = seeded(L.n * 17 + 11), pool = Object.keys(HZDEF).filter(k => HZDEF[k].at <= L.n && (!HZDEF[k].timed || L.len));
    const want = L.n <= 2 ? 1 : L.w === 0 ? (L.p <= 5 ? 2 : 3) : [3, 3, 4, 4, 5][L.w] - (L.boss ? 1 : 0);
    const list = []; const nw = pool.find(k => HZDEF[k].at === L.n); if (nw) list.push(nw);
    const rest = pool.filter(k => k !== nw); while (list.length < Math.max(1, want) && rest.length) list.push(rest.splice(Math.floor(r() * rest.length), 1)[0]);
    return list;
  },
  pct() { return { easy: 20, medium: 30, hard: 40, pro: 40, expert: 50 }[CL.tier] || 30; },
  fq() { return 1 - 0.1 * CL.w; },
  start() {
    this.on = {}; this.o = {}; this.list = this.forLevel(CL); this.list.forEach(k => this.on[k] = true);
    const f = this.fq();
    this.o = {
      glass: { st: 'idle', t: 0, sit: 0 }, alarm: { st: 'idle', t: 0 }, phone: { st: 'idle', t: 0, next: rnd(8, 14) * f },
      frame: { st: 'ok', ang: 0, t: 0, next: rnd(9, 14) * f }, pankha: { st: 'on', t: 0, next: rnd(8, 13) * f },
      taal: { t: 0 }, bijli: { st: 'on', t: 0, next: rnd(6, 10) * f }, billi: { st: 'none', t: 0, next: rnd(6, 10) * f },
      chhipkali: { st: 'wall', x: W * 0.3, y: H * 0.42, vx: 22 * S, t: 0, eaten: 0 }, kambal: { st: 'on', t: 0, next: rnd(9, 15) * f },
      shor: { st: 'none', t: 0, next: rnd(9, 15) * f, closed: 0 }, kaan: { next: rnd(10, 16) * f }
    };
    this.seen = SAVE.hzSeen = SAVE.hzSeen || {};
  },
  intro(k) { if (this.seen[k]) return; this.seen[k] = 1; save(); const d = HZDEF[k]; pop(`⚠️ NEW HAZARD: ${d.i} ${d.n}`, W / 2, H * 0.48, 22, '#fff', 2.2); pop(d.how, W / 2, H * 0.48 + 28 * S, 13, '#d9ccff', 2.2); },
  /* ---------- geometry ---------- */
  u() { return bed.u || S; },
  shelf() { const u = this.u(); return { x: bed.x + 30 * u, y: Math.max(H * 0.34, bed.y - (theme === 'hostel' ? 185 : 125) * u), w: 132 * u }; },
  pos(k) {
    const u = this.u(), sh = this.shelf();
    if (k === 'glass') return [sh.x + 22 * u, sh.y];
    if (k === 'alarm') return [sh.x + 64 * u, sh.y];
    if (k === 'phone') return [sh.x + 104 * u, sh.y];
    if (k === 'frame') return [clamp(bed.x + bed.w * 0.62, 60 * u, W - 60 * u), Math.max(H * 0.3, bed.y - 190 * u)];
    if (k === 'switch') return [Math.min(W - 30 * u, bed.x + bed.w + 26 * u), bed.y - 70 * u];
    return [0, 0];
  },
  win() { return { x: W * 0.66, y: H * 0.13, w: W * 0.32, h: H * 0.3 }; },
  /* ---------- damage ---------- */
  hit(f, label, s) {
    s = s || mainS(); const amt = this.pct() * f;
    if (G.fx.shield > 0) { pop('🛡️ SHIELD NE BACHA LIYA!', W / 2, H * 0.45, 22, '#fff', 1); return; }
    s.neend -= amt; s.bitten = 1.2; s.wig = 0.8;
    ANN_PRI = 1; pop(`${label}`, W / 2, H * 0.42, 30, '#fff', 1.4); pop(`SLEEP -${Math.round(amt)}% 😱`, W / 2, H * 0.42 + 34 * S, 24, '#c7b0ff', 1.4); ANN_PRI = 0;
    shake(24); vib([120, 40, 120]); G.flash = 0.5; G.flashCol = '20,10,40';
    META.x('Shock / Surprise Punishment');
  },
  crash(x, y) {
    noise(0.7, 0.6, 'highpass', 3000, 0.002); for (let i = 0; i < 12; i++) tone(rnd(2500, 6000), rnd(2000, 5000), rnd(0.03, 0.08), 0.08, 'square', Math.random() * 0.4); tone(120, 40, 0.3, 0.5);
    for (let i = 0; i < 26; i++) { const a = Math.random() * 6.283, v = rnd(100, 400) * S; G.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 200 * S, life: rnd(0.4, 0.9), max: 0.9, size: rnd(1.5, 3.5) * S, col: ['#e6f0ff', '#bfe3ff', '#ffffff'][(Math.random() * 3) | 0], g: 900 * S }); }
  },
  ring(type) { if (type === 'alarm') { for (let i = 0; i < 6; i++) tone(1800, 1800, 0.06, 0.12, 'square', i * 0.12); } else { tone(880, 880, 0.18, 0.1, 'triangle'); tone(1100, 1100, 0.18, 0.1, 'triangle', 0.22); } },
  /* ---------- multipliers ---------- */
  dark() { if (state !== 'play') return false; const t = this.o.taal; if (this.on.taal && t && (t.t % 8) >= 5) return true; return this.on.bijli && this.o.bijli && this.o.bijli.st === 'dark'; },
  fanMul() { const p = this.o.pankha; if (!this.on.pankha || !p) return 1; return p.st === 'off' ? 0 : p.st === 'slow' ? 0.3 : 1; },
  spMul() { let m = 1; if (this.on.pankha && this.o.pankha && this.o.pankha.st === 'off') m *= 1.3; if (this.o.shor && this.o.shor.closed > 0) m *= 1.1; return m; },
  spawnMul() { return this.on.pankha && this.o.pankha && this.o.pankha.st === 'off' ? 0.75 : 1; },
  /* ---------- input ---------- */
  tap(x, y) {
    if (state !== 'play') return false; const u = this.u(), O = this.o, near = (k, r) => { const [px, py] = this.pos(k); return Math.hypot(x - px, y - py + 12 * u) < r * u; };
    if (this.on.glass && (O.glass.st === 'wobble' || O.glass.st === 'fall')) { const gy = O.glass.st === 'fall' ? O.glass.fy : this.pos('glass')[1]; if (Math.hypot(x - this.pos('glass')[0], y - gy + 12 * u) < 45 * u) {
      if (O.glass.st === 'fall') { G.score += 200; pop('🥛 CATCH! +200 🔥', x, y - 40 * S, 26, '#fff', 1.1); slow(0.5); sfx.whoosh(); META.x('Reaction Skill (Catch)'); } else { G.score += 50; pop('BACHA LIYA! 😮‍💨 +50', x, y - 40 * S, 20, '#fff', 0.9); }
      O.glass.st = 'idle'; O.glass.sit = 0; sfx.defuse(); vib(20); return true; } }
    if (this.on.alarm && O.alarm.st === 'ring' && near('alarm', 40)) { O.alarm.st = 'idle'; G.score += 80; pop('SNOOZE! 😴 +80', x, y - 40 * S, 20, '#fff', 0.9); sfx.defuse(); return true; }
    if (this.on.phone && O.phone.st === 'ring' && near('phone', 40)) { O.phone.st = 'idle'; O.phone.next = rnd(12, 20) * this.fq(); G.score += 80; pop('SILENT! 🔕 +80', x, y - 40 * S, 20, '#fff', 0.9); sfx.defuse(); return true; }
    if (this.on.frame && O.frame.st === 'tilt' && near('frame', 55)) { O.frame.st = 'ok'; O.frame.ang = 0; O.frame.next = rnd(10, 15) * this.fq(); G.score += 60; pop('STRAIGHTENED! 🖼️ +60', x, y - 40 * S, 18, '#fff', 0.9); sfx.defuse(); return true; }
    if (this.on.pankha && O.pankha.st === 'off') { const [sx, sy] = this.pos('switch'); if (Math.hypot(x - sx, y - sy) < 40 * u) { O.pankha.st = 'on'; O.pankha.next = rnd(10, 16) * this.fq(); pop('FAN ON! 🌀', x, y - 40 * S, 20, '#fff', 0.9); sfx.power(); G.fanBoost = 1; return true; } }
    if (this.on.shor && O.shor.st === 'warn') { const w = this.win(); if (x > w.x && x < w.x + w.w && y > w.y && y < w.y + w.h) { this.closeWin(); return true; } }
    return false;
  },
  swipe(x1, y1, x2, y2) {
    if (state !== 'play') return; const u = this.u(), O = this.o;
    if (this.on.billi && O.billi.st === 'walk' && distSeg(O.billi.x, O.billi.y, x1, y1, x2, y2) < 45 * u) { O.billi.st = 'flee'; G.score += 100; pop('MEOW! 🐱 CHASED AWAY! +100', O.billi.x, O.billi.y - 40 * S, 20, '#fff', 1); tone(700, 1200, 0.2, 0.1, 'sawtooth'); tone(1200, 500, 0.3, 0.1, 'sawtooth', 0.2); }
    if (this.on.kambal && O.kambal.st === 'off') { for (const s of G.sleepers) if (!s.walk && distSeg(s.x + (s.end - s.x) * 0.5, bed.y - 22 * u, x1, y1, x2, y2) < 70 * u) { O.kambal.st = 'on'; O.kambal.next = rnd(12, 18) * this.fq(); G.score += 50; pop('TUCKED IN! 🥰 +50', s.x + 80 * u, bed.y - 70 * u, 18, '#fff', 1); sfx.power(); break; } }
    if (this.on.shor && O.shor.st === 'warn') { const w = this.win(); if ((x1 > w.x || x2 > w.x) && Math.min(y1, y2) < w.y + w.h && Math.max(y1, y2) > w.y) this.closeWin(); }
  },
  closeWin() { const O = this.o.shor; O.st = 'none'; O.closed = 8; O.next = rnd(12, 18) * this.fq(); G.score += 80; pop('WINDOW CLOSED! 🪟 +80 (it will get hot 🥵)', W / 2, H * 0.36, 17, '#fff', 1.2); tone(200, 100, 0.15, 0.3); META.x('Trade-off Decision'); },
  zapped(x, y, rad) { this.zapSeg(x, y, x, y, rad); },
  zapSeg(x1, y1, x2, y2, rad) {
    if (state !== 'play') return; const u = this.u(), O = this.o;
    if (this.on.glass && O.glass.st === 'idle') { const [gx, gy] = this.pos('glass'); if (distSeg(gx, gy - 12 * u, x1, y1, x2, y2) < rad + 6 * u) { O.glass.st = 'wobble'; O.glass.t = 1.1; pop('⚠️ GLASS HIL RAHA! TAP!', gx, gy - 50 * u, 16, '#fff', 1); META.x('Risk vs Reward (Glass trap)'); } }
    if (this.on.alarm && O.alarm.st === 'idle') { const [ax, ay] = this.pos('alarm'); if (distSeg(ax, ay - 12 * u, x1, y1, x2, y2) < rad) { O.alarm.st = 'ring'; O.alarm.t = 2; this.ring('alarm'); pop('⏰ ALARM RINGING! TAP!', ax, ay - 50 * u, 17, '#fff', 1); } }
    if (this.on.chhipkali && O.chhipkali.st === 'wall' && distSeg(O.chhipkali.x, O.chhipkali.y, x1, y1, x2, y2) < rad) { O.chhipkali.st = 'fall'; O.chhipkali.vy = 0; pop('OH NO! THE LIZARD FELL! 🦎😱', O.chhipkali.x, O.chhipkali.y - 40 * S, 18, '#fff', 1); }
  },
  /* ---------- update ---------- */
  update(gdt) {
    if (state !== 'play' || !this.list) return; const O = this.o, u = this.u(), f = this.fq();
    if (this.on.taal) { const t = O.taal; const before = t.t % 8; t.t += gdt; const ph = t.t % 8; if (ph >= 4 && ph < 5 && Math.random() < 0.15) G.flickF = 0.12; if (before < 5 && ph >= 5) { this.intro('taal'); sfx.heart(1.4); META.x('Andhera Taal (Rhythm Tension)'); } }
    if (this.on.glass) { const g = O.glass, [gx, gy] = this.pos('glass');
      if (g.st === 'idle') { const sitters = G.mosq.filter(m => !m.dead && m.glassSit > 0).length; if (sitters >= 2) { g.sit += gdt; if (g.sit > 1.5) { g.st = 'wobble'; g.t = 1.1; pop('Mosquitoes on the glass. IT IS SHAKING! TAP!', gx, gy - 50 * u, 14, '#fff', 1); } } else g.sit = Math.max(0, g.sit - gdt);
        if (Math.random() < 0.004) { const m = G.mosq.find(m => !m.dead && !m.boss && m.state === 'fly' && m.stage === 0 && !m.heera); if (m) { m.wp = { x: gx, y: gy - 30 * u }; m.glassGo = 1; } } }
      if (g.st === 'wobble') { g.t -= gdt; if (g.t <= 0) { g.st = 'fall'; g.fy = gy; g.vy = 0; this.intro('glass'); } }
      if (g.st === 'fall') { g.vy += 900 * S * gdt; g.fy += g.vy * gdt; if (g.fy > bed.y - 10 * u) { g.st = 'gone'; g.t = 8; this.crash(gx, bed.y - 10 * u); this.hit(1, '💥 GLASS BROKEN!'); } }
      if (g.st === 'gone') { g.t -= gdt; if (g.t <= 0) { g.st = 'idle'; pop('Mummy put out a new glass 🥛', gx, gy - 40 * u, 13, '#d9ccff', 1.2); } }
      for (const m of G.mosq) { if (m.glassGo && !m.dead) { if (Math.hypot(m.x - gx, m.y - (gy - 30 * u)) < 48 * u) { m.glassSit = 2.5; m.glassGo = 0; } } if (m.glassSit > 0) { m.glassSit -= gdt; m.x = gx + Math.sin(m.ph * 3) * 6 * u; m.y = gy - 22 * u; m.vx = m.vy = 0; if (m.glassSit <= 0) { m.stage = 1; chooseTarget(m); } } } }
    if (this.on.alarm && O.alarm.st === 'ring') { O.alarm.t -= gdt; if (Math.random() < 0.08) this.ring('alarm'); if (O.alarm.t <= 0) { O.alarm.st = 'idle'; this.intro('alarm'); this.hit(1, '⏰ THE ALARM WOKE THEM!'); } }
    if (this.on.phone) { const p = O.phone; if (p.st === 'idle') { p.next -= gdt; if (p.next <= 0) { p.st = 'ring'; p.t = 4.5; vib([200, 100, 200]); this.intro('phone'); pop('📱 3 AM CALL! TAP!', W / 2, H * 0.4, 20, '#fff', 1.2); META.x('Reaction Test (Call)'); } } else { p.t -= gdt; if ((p.t * 2.5 | 0) !== (p.lt | 0)) { p.lt = p.t * 2.5; this.ring('phone'); } if (p.t <= 0) { p.st = 'idle'; p.next = rnd(12, 20) * f; this.hit(0.8, '📵 MISSED IT. SLEEP BROKEN!'); } } }
    if (this.on.frame) { const fr = O.frame; if (fr.st === 'ok') { fr.next -= gdt; if (fr.next <= 0) { fr.st = 'tilt'; fr.t = 3.5; this.intro('frame'); } } else if (fr.st === 'tilt') { fr.t -= gdt; fr.ang = (1 - fr.t / 3.5) * 0.9; if (fr.t <= 0) { fr.st = 'fall'; fr.vy = 0; fr.fy = this.pos('frame')[1]; } } else if (fr.st === 'fall') { fr.vy += 900 * S * gdt; fr.fy += fr.vy * gdt; fr.ang += gdt * 6; if (fr.fy > bed.y - 20 * u) { fr.st = 'gone'; fr.t = 9; this.crash(this.pos('frame')[0], bed.y - 20 * u); this.hit(0.7, '🖼️ THE FRAME FELL. CRASH!'); } } else { fr.t -= gdt; if (fr.t <= 0) { fr.st = 'ok'; fr.ang = 0; fr.next = rnd(10, 15) * f; } } }
    if (this.on.pankha) { const p = O.pankha; if (p.st === 'on') { p.next -= gdt; if (p.next <= 0) { p.st = 'slow'; p.t = 1.5; pop('🌀 The fan is slowing down…', W / 2, H * 0.22, 15, '#d9ccff', 1.2); tone(200, 60, 1.5, 0.12, 'sawtooth'); } } else if (p.st === 'slow') { p.t -= gdt; if (p.t <= 0) { p.st = 'off'; p.t = 10; this.intro('pankha'); pop('FAN STOPPED! 🥵 TAP THE SWITCH 🔌', W / 2, H * 0.4, 20, '#fff', 1.4); META.x('Environmental Pressure'); } } else { p.t -= gdt; if (p.t <= 0) { p.st = 'on'; p.next = rnd(10, 16) * f; } } }
    if (this.on.bijli) { const b = O.bijli; if (b.st === 'on') { b.next -= gdt; if (b.next <= 0) { b.st = 'warn'; b.t = 1.2; for (let i = 0; i < 3; i++) tone(2200, 2200, 0.08, 0.1, 'square', i * 0.3); pop('🔋 Inverter beep… POWER CUT COMING!', W / 2, H * 0.22, 15, '#fff', 1.2); } } else if (b.st === 'warn') { b.t -= gdt; G.flickF = Math.random() < 0.3 ? 0.15 : G.flickF; if (b.t <= 0) { b.st = 'dark'; b.t = rnd(5, 7); this.intro('bijli'); sfx.hot(); } } else { b.t -= gdt; if (b.t <= 0) { b.st = 'on'; b.next = rnd(12, 18) * f; pop('💡 Power is back!', W / 2, H * 0.3, 18, '#fff', 0.9); } } }
    if (this.on.billi) { const c = O.billi, w = this.win();
      if (c.st === 'none') { c.next -= gdt; if (c.next <= 0) { c.st = 'walk'; c.x = w.x + w.w * 0.5; c.y = w.y + w.h; c.tg = Math.random() < 0.5 && this.on.frame ? 'frame' : 'glass'; this.intro('billi'); pop('🐱 CAT INCOMING! SWIPE IT!', W / 2, H * 0.36, 20, '#fff', 1.2); tone(600, 900, 0.3, 0.08, 'sawtooth'); } }
      else if (c.st === 'walk') { const [tx, ty] = this.pos(c.tg === 'frame' ? 'frame' : 'glass'), d = Math.hypot(tx - c.x, ty - c.y); c.x += (tx - c.x) / d * 55 * S * gdt; c.y += (ty - 10 * u - c.y) / d * 55 * S * gdt; c.dir = tx < c.x ? -1 : 1;
        if (d < 22 * u) { c.st = 'flee'; pop('THE CAT KNOCKED IT OVER! 😾', c.x, c.y - 40 * S, 18, '#fff', 1); if (c.tg === 'frame' && this.on.frame) { O.frame.st = 'fall'; O.frame.vy = 0; O.frame.fy = this.pos('frame')[1]; } else if (this.on.glass && O.glass.st !== 'gone') { O.glass.st = 'fall'; O.glass.fy = this.pos('glass')[1]; O.glass.vy = 0; } else this.hit(0.6, '🐱 MEOW! THE CAT JUMPED!'); } }
      else if (c.st === 'flee') { c.x += 300 * S * gdt; c.y -= 200 * S * gdt; c.dir = 1; if (c.x > W + 60 || c.y < -60) { c.st = 'none'; c.next = rnd(12, 18) * f; } } }
    if (this.on.chhipkali) { const l = O.chhipkali;
      if (l.st === 'wall') { l.t += gdt; l.x += l.vx * gdt; if (l.x < W * 0.1 || l.x > W * 0.9) l.vx *= -1; l.y = H * 0.4 + Math.sin(l.t * 0.3) * H * 0.06;
        for (const m of G.mosq) if (!m.dead && !m.boss && !m.heera && Math.hypot(m.x - l.x, m.y - l.y) < 26 * S) { m.dead = true; l.eaten++; pop('GULP! 🦎 (thanks, lizard)', l.x, l.y - 30 * S, 14, '#d9ccff', 0.8); if (l.eaten === 1) { this.intro('chhipkali'); META.x('Helper / Moral dilemma'); } } }
      else if (l.st === 'fall') { const s = mainS(); l.vy = (l.vy || 0) + 800 * S * gdt; l.x += (s.x + 20 * u - l.x) * Math.min(1, gdt * 3); l.y += l.vy * gdt; if (l.y > s.y - 10 * u) { l.st = 'gone'; l.t = 10; tone(900, 1500, 0.4, 0.3, 'sawtooth'); this.hit(0.6, '🦎 THE LIZARD FELL ON THE FACE! 😱'); } }
      else { l.t -= gdt; if (l.t <= 0) { l.st = 'wall'; l.x = W * 0.2; l.y = H * 0.4; l.t = 0; } } }
    if (this.on.kambal) { const k = O.kambal; for (const s of G.sleepers) s.kOff = clamp((s.kOff || 0) + (k.st === 'off' ? 3 : -3) * gdt, 0, 1);
      if (k.st === 'on') { k.next -= gdt; if (k.next <= 0) { k.st = 'warn'; k.t = 1; G.sleepers.forEach(s => s.wig = 0.6); pop('😬 the blanket is slipping…', mainS().x + 80 * u, bed.y - 70 * u, 14, '#d9ccff', 1); } }
      else if (k.st === 'warn') { k.t -= gdt; if (k.t <= 0) { k.st = 'off'; this.intro('kambal'); pop('🫣 BLANKET FELL! 2X BITES. SWIPE!', W / 2, H * 0.4, 18, '#fff', 1.4); } }
      else if (Math.random() < 0.02) G.sleepers.forEach(s => s.wig = 0.25); }
    if (this.on.shor) { const s = O.shor; s.closed = Math.max(0, s.closed - gdt);
      if (s.st === 'none') { s.next -= gdt; if (s.next <= 0) { s.st = 'warn'; s.t = 1.9; s.lab = SHOR[theme] || SHOR.bedroom; this.intro('shor'); pop(`${s.lab[0]} ${s.lab[1]} CLOSE THE WINDOW!`, W / 2, H * 0.36, 18, '#fff', 1.4); } }
      else { s.t -= gdt; if (s.t <= 0) { s.st = 'none'; s.next = rnd(12, 18) * f; tone(300, 280, 0.6, 0.35, 'sawtooth'); tone(380, 360, 0.6, 0.3, 'sawtooth'); noise(0.6, 0.3, 'bandpass', 600); this.hit(0.5, `${s.lab[0]} ${s.lab[1].toUpperCase()}`); } } }
    if (this.on.kaan) { const k = O.kaan; k.next -= gdt; if (k.next <= 0) { k.next = rnd(16, 22) * f; const s = mainS(); for (let i = 0; i < 3; i++) spawnMosq('normal', s.x + rnd(-80, 80) * S, s.y - 120 * S, { ear: true, ea: i * 2.1, pts: 30, coin: 1 }); this.intro('kaan'); pop('👂 BUZZING IN THE EAR!', W / 2, H * 0.4, 20, '#fff', 1.2); }
      const ears = G.mosq.filter(m => m.ear && !m.dead).length; if (ears) { const s = mainS(); s.neend -= 0.5 * ears * gdt; s.bitten = Math.max(s.bitten, 0.2); } }
    if (G.flickF > 0) G.flickF -= gdt;
  },
  earMove(m, gdt) { const s = mainS(); m.ea += gdt * 3.5; const tx = s.x - 14 * S + Math.cos(m.ea) * 34 * S, ty = s.y - 6 * S + Math.sin(m.ea) * 22 * S; m.x += (tx - m.x) * Math.min(1, gdt * 6); m.y += (ty - m.y) * Math.min(1, gdt * 6); m.dir = Math.cos(m.ea + 1.57) > 0 ? 1 : -1; },
  /* ---------- draw ---------- */
  cring(x, y, r, f) { ctx.save(); ctx.lineWidth = 4 * S; ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.shadowColor = P2; ctx.shadowBlur = 12 * S; ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + 6.283 * clamp(f, 0, 1)); ctx.stroke(); ctx.restore(); },
  tapHint(x, y, txt) { ctx.save(); ctx.font = `900 ${12 * S}px Poppins`; ctx.textAlign = 'center'; const w = ctx.measureText(txt).width + 16 * S; ctx.fillStyle = '#fff'; rr(ctx, x - w / 2, y - 12 * S, w, 22 * S, 11 * S); ctx.fill(); ctx.fillStyle = '#2a1270'; ctx.fillText(txt, x, y + 4 * S); ctx.restore(); },
  draw(time) {
    if (!this.list || !['play', 'clear', 'wake', 'over', 'fail'].includes(state)) return; const O = this.o, u = this.u();
    const shelfOn = this.on.glass || this.on.alarm || this.on.phone;
    if (shelfOn) { const sh = this.shelf(); ctx.fillStyle = '#4a2a5e'; rr(ctx, sh.x - 6 * u, sh.y, sh.w + 12 * u, 7 * u, 3 * u); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(sh.x - 6 * u, sh.y, sh.w + 12 * u, 2 * u); ctx.fillStyle = '#331a45'; ctx.fillRect(sh.x + 4 * u, sh.y + 7 * u, 5 * u, 12 * u); ctx.fillRect(sh.x + sh.w - 9 * u, sh.y + 7 * u, 5 * u, 12 * u); }
    if (this.on.glass && O.glass.st !== 'gone') { const [gx, gy0] = this.pos('glass'), g = O.glass, gy = g.st === 'fall' ? g.fy : gy0, wob = g.st === 'wobble' ? Math.sin(time * 40) * 0.25 : g.st === 'fall' ? (g.fy - gy0) * 0.02 : 0;
      ctx.save(); ctx.translate(gx, gy); ctx.rotate(wob); ctx.fillStyle = 'rgba(200,220,255,.25)'; ctx.beginPath(); ctx.moveTo(-8 * u, -24 * u); ctx.lineTo(8 * u, -24 * u); ctx.lineTo(6.5 * u, 0); ctx.lineTo(-6.5 * u, 0); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(127,212,255,.5)'; ctx.fillRect(-7 * u, -13 * u, 14 * u, 13 * u); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.2 * u; ctx.beginPath(); ctx.moveTo(-8 * u, -24 * u); ctx.lineTo(-6.5 * u, 0); ctx.lineTo(6.5 * u, 0); ctx.lineTo(8 * u, -24 * u); ctx.stroke(); ctx.restore();
      if (g.st === 'wobble') { this.cring(gx, gy - 12 * u, 26 * u, g.t / 1.1); this.tapHint(gx, gy - 46 * u, '⚠️ TAP!'); } if (g.st === 'fall') this.tapHint(gx + 40 * u, gy - 10 * u, '🫴 CATCH!'); }
    if (this.on.alarm) { const [ax, ay] = this.pos('alarm'), a = O.alarm, sh = a.st === 'ring' ? Math.sin(time * 60) * 2 * u : 0; ctx.save(); ctx.translate(ax + sh, ay - 12 * u); ctx.fillStyle = '#2a1a4a'; ctx.beginPath(); ctx.arc(-7 * u, -10 * u, 4 * u, 0, 7); ctx.arc(7 * u, -10 * u, 4 * u, 0, 7); ctx.fill(); ctx.fillStyle = a.st === 'ring' ? '#9a6df5' : '#5a46a0'; ctx.beginPath(); ctx.arc(0, 0, 12 * u, 0, 7); ctx.fill(); ctx.fillStyle = '#0a0620'; ctx.beginPath(); ctx.arc(0, 0, 9 * u, 0, 7); ctx.fill(); ctx.strokeStyle = `rgb(${ELEC})`; ctx.lineWidth = 1.4 * u; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -6 * u); ctx.moveTo(0, 0); ctx.lineTo(4 * u, 2 * u); ctx.stroke(); ctx.restore();
      if (a.st === 'ring') { this.cring(ax, ay - 12 * u, 24 * u, a.t / 2); this.tapHint(ax, ay - 46 * u, '⏰ TAP!'); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 2 * u; for (let i = 1; i <= 2; i++) { ctx.beginPath(); ctx.arc(ax, ay - 12 * u, (14 + i * 7) * u, -0.6, 0.6); ctx.stroke(); ctx.beginPath(); ctx.arc(ax, ay - 12 * u, (14 + i * 7) * u, Math.PI - 0.6, Math.PI + 0.6); ctx.stroke(); } } }
    if (this.on.phone) { const [px, py] = this.pos('phone'), p = O.phone, sh = p.st === 'ring' ? Math.sin(time * 70) * 1.5 * u : 0; ctx.save(); ctx.translate(px + sh, py); ctx.fillStyle = '#111'; rr(ctx, -7 * u, -22 * u, 14 * u, 22 * u, 2.5 * u); ctx.fill(); ctx.fillStyle = p.st === 'ring' ? '#fff' : '#2a3a6a'; rr(ctx, -5.5 * u, -20 * u, 11 * u, 18 * u, 1.5 * u); ctx.fill(); if (p.st === 'ring') { ctx.font = `${8 * u}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText('📞', 0, -8 * u); } ctx.restore();
      if (p.st === 'ring') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gg = ctx.createRadialGradient(px, py - 10 * u, 0, px, py - 10 * u, 70 * u); gg.addColorStop(0, 'rgba(127,212,255,.45)'); gg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gg; ctx.fillRect(px - 70 * u, py - 80 * u, 140 * u, 140 * u); ctx.restore(); this.cring(px, py - 11 * u, 24 * u, p.t / 2.6); this.tapHint(px, py - 46 * u, '📱 TAP!'); } }
    if (this.on.frame && O.frame.st !== 'gone') { const [fx, fy0] = this.pos('frame'), fr = O.frame, fy = fr.st === 'fall' ? fr.fy : fy0; ctx.save(); ctx.translate(fx, fy); ctx.rotate(fr.ang); ctx.fillStyle = '#4a2a5e'; rr(ctx, -30 * u, 0, 60 * u, 44 * u, 4 * u); ctx.fill(); ctx.fillStyle = '#d9d3f5'; ctx.fillRect(-25 * u, 5 * u, 50 * u, 34 * u); ctx.font = `${15 * u}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('👨‍👩‍👧', 0, 22 * u); ctx.textBaseline = 'alphabetic'; ctx.restore();
      if (fr.st === 'ok' || fr.st === 'tilt') { ctx.strokeStyle = 'rgba(200,200,220,.5)'; ctx.lineWidth = 1 * u; ctx.beginPath(); ctx.moveTo(fx - 20 * u, fy + 2 * u); ctx.lineTo(fx, fy - 14 * u); ctx.lineTo(fx + 20 * u, fy + 2 * u); ctx.stroke(); }
      if (fr.st === 'tilt' && fr.t < 2.6) { this.cring(fx, fy + 22 * u, 40 * u, fr.t / 3.5); this.tapHint(fx, fy - 26 * u, '🖼️ TAP!'); } }
    if (this.on.pankha) { const [sx, sy] = this.pos('switch'), off = O.pankha.st === 'off'; ctx.fillStyle = '#cfc8ea'; rr(ctx, sx - 14 * u, sy - 18 * u, 28 * u, 36 * u, 4 * u); ctx.fill(); ctx.fillStyle = off ? '#743ae8' : '#6a5aa8'; rr(ctx, sx - 6 * u, sy - 10 * u, 12 * u, 20 * u, 2 * u); ctx.fill(); ctx.fillStyle = off ? '#fff' : `rgb(${ELEC})`; ctx.fillRect(sx - 4 * u, off ? sy + 2 * u : sy - 8 * u, 8 * u, 6 * u);
      if (off) { const a = 0.5 + Math.sin(time * 10) * 0.5; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(199,176,255,${a})`; ctx.lineWidth = 4 * u; ctx.beginPath(); ctx.arc(sx, sy, 26 * u, 0, 7); ctx.stroke(); ctx.restore(); this.cring(sx, sy, 32 * u, O.pankha.t / 10); this.tapHint(sx - 10 * u, sy - 44 * u, '🔌 TAP!'); } }
    if (this.on.billi && O.billi.st !== 'none') { const c = O.billi; ctx.save(); ctx.translate(c.x, c.y); ctx.scale(c.dir || 1, 1); const s2 = S * 1.1, wk = Math.sin(time * 14) * 3 * s2;
      ctx.fillStyle = '#2a2240'; ctx.beginPath(); ctx.ellipse(0, 0, 20 * s2, 11 * s2, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(18 * s2, -8 * s2, 9 * s2, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(12 * s2, -14 * s2); ctx.lineTo(14 * s2, -24 * s2); ctx.lineTo(19 * s2, -15 * s2); ctx.lineTo(23 * s2, -24 * s2); ctx.lineTo(25 * s2, -12 * s2); ctx.fill();
      ctx.strokeStyle = '#2a2240'; ctx.lineWidth = 4 * s2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-18 * s2, -2 * s2); ctx.quadraticCurveTo(-34 * s2, -20 * s2 + wk, -28 * s2, -30 * s2); ctx.stroke(); for (const lx of [-10, 10]) { ctx.beginPath(); ctx.moveTo(lx * s2, 8 * s2); ctx.lineTo(lx * s2 + wk * 0.5, 18 * s2); ctx.stroke(); }
      ctx.fillStyle = '#c7f0a0'; ctx.beginPath(); ctx.ellipse(21 * s2, -9 * s2, 2.4 * s2, 3 * s2, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#000'; ctx.fillRect(20.5 * s2, -11 * s2, 1 * s2, 4 * s2); ctx.restore();
      if (c.st === 'walk') this.tapHint(c.x, c.y - 38 * S, '🐱 SWIPE!'); }
    if (this.on.chhipkali && O.chhipkali.st !== 'gone') { const l = O.chhipkali; ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(l.st === 'fall' ? time * 10 : (l.vx > 0 ? 0 : Math.PI)); const s2 = S; ctx.fillStyle = '#8a9a7a'; ctx.beginPath(); ctx.ellipse(0, 0, 14 * s2, 5 * s2, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(14 * s2, 0, 6 * s2, 4 * s2, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = '#8a9a7a'; ctx.lineWidth = 2.5 * s2; ctx.beginPath(); ctx.moveTo(-12 * s2, 0); ctx.quadraticCurveTo(-24 * s2, Math.sin(time * 6) * 6 * s2, -32 * s2, 0); ctx.stroke(); for (const [lx, ly] of [[8, 1], [8, -1], [-8, 1], [-8, -1]]) { ctx.beginPath(); ctx.moveTo(lx * s2, 0); ctx.lineTo(lx * s2 + 4 * s2, ly * 9 * s2); ctx.stroke(); }
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(17 * s2, -2 * s2, 1.2 * s2, 0, 7); ctx.arc(17 * s2, 2 * s2, 1.2 * s2, 0, 7); ctx.fill(); ctx.restore(); }
    if (this.on.shor) { const w = this.win(), s = O.shor;
      if (s.closed > 0) { ctx.fillStyle = 'rgba(60,40,90,.75)'; ctx.fillRect(w.x + w.w * 0.15, w.y + w.h * 0.1, w.w * 0.7, w.h * 0.8); ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 2 * S; for (let y = w.y + w.h * 0.15; y < w.y + w.h * 0.9; y += 8 * S) { ctx.beginPath(); ctx.moveTo(w.x + w.w * 0.15, y); ctx.lineTo(w.x + w.w * 0.85, y); ctx.stroke(); } ctx.font = `800 ${11 * S}px Poppins`; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(`🥵 heat ${s.closed.toFixed(0)}s`, w.x + w.w / 2, w.y + w.h + 14 * S); }
      if (s.st === 'warn') { const cx = w.x + w.w / 2, cy = w.y + w.h / 2, a = 0.5 + Math.sin(time * 20) * 0.5; ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 4 * S; ctx.setLineDash([10 * S, 6 * S]); ctx.strokeRect(w.x, w.y, w.w, w.h); ctx.setLineDash([]); ctx.font = `${34 * S}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText(s.lab[0], cx, cy + 10 * S); this.cring(cx, cy, 36 * S, s.t / 1.9); this.tapHint(cx, w.y + w.h + 16 * S, '🪟 SWIPE / TAP!'); } }
    if (this.on.kambal && O.kambal.st === 'off') { const s = mainS(); this.tapHint(s.x + (s.end - s.x) * 0.5, bed.y - 80 * u, '🫣 SWIPE TO COVER'); ctx.font = `900 ${12 * S}px Poppins`; ctx.fillStyle = '#d9ccff'; ctx.textAlign = 'center'; ctx.fillText('brrr… 🥶', s.x + 30 * u, s.y - 40 * u); }
    if (G.flickF > 0) { ctx.fillStyle = 'rgba(2,1,10,.55)'; ctx.fillRect(-W, -H, W * 3, H * 3); }
  }
};
window.HZ = HZ;
const _drawObjects = drawObjects; window.drawObjects = function (time) { _drawObjects(time); HZ.draw(time); };
const _metaTick2 = META.tick; META.tick = function (dt, gdt) { _metaTick2.call(META, dt, gdt); HZ.update(gdt); };
resize(); G.sleepers = makeSleepers();
requestAnimationFrame(loop);

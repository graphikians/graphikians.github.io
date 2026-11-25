/* ================= MACHHAR MAARO — "NASHA" LAYER =================
   1. KALLU BHAI  — personal nemesis machhar (yaad rakhta hai, badla leta hai, naam leke taunt karta hai)
   2. LUCKY TICKET — har jeet pe scratch card (variable reward + near-miss)
   3. ASLI RAAT   — asli ghadi 10PM–2AM: 2X coins, Kallu zyada aata hai
   4. STATUS CARD — WhatsApp status ke liye 1080x1920 image, ek tap share
================================================================== */
MT.kallu = { name: 'Kallu', emoji: '😈', tier: 'expert', sp: 300, size: 1.55, hp: 4, wa: 1.4, wf: 5, dmg: 0, pts: 1500, coin: 0, body: '#2a1850', unlock: 999, desc: 'Your personal enemy. He never forgets.' };

const KALLU_TAUNT = {
  first: [['{n}! I am KALLU. Tonight {c}\'s sleep is mine!', '{n}! I am Kallu. Tonight {c}\'s sleep is mine!']],
  escaped: [['Back again, {n}? Last time I took {s} of your coins 😏', 'Back again, {n}? Last time I took {s} of your coins!'], ['{n}, I bought new wings with your coins 😎', '{n}, I bought new wings with your coins!']],
  killed: [['{n}! You got me last time… now it is REVENGE! 🩹', '{n}! You got me last time. Now it is revenge!'], ['All bandaged up and back for you, {n} 🩹😤', 'All bandaged up and back for you, {n}!']],
  hit: ['OUCH! My wing! 😵', 'That was just the trailer! 😤', 'Mummy! 😭', 'Why so angry, bro? 😬', 'Catch me if you can! 😈'],
  flee: ['See you again, {n}! 😈', 'Your coins are mine! Bye bye 👋']
};
const fillT = (t, x) => t.replace(/\{n\}/g, x.n).replace(/\{c\}/g, x.c).replace(/\{s\}/g, x.s);

const NASHA = {
  /* ---------------- voice (surprise: machhar aapka naam leke bolta hai) ---------------- */
  say(roman, deva) {
    if (muted || !window.speechSynthesis) return;
    try {
      const vs = speechSynthesis.getVoices(), hi = vs.find(v => /hi[-_]IN/i.test(v.lang)), en = vs.find(v => /en[-_]IN/i.test(v.lang));
      const u = new SpeechSynthesisUtterance(roman.replace(/[^\w\s!?.,']/g, ''));
      if (en) u.voice = en; u.lang = 'en-IN';
      u.pitch = 1.9; u.rate = 1.08; u.volume = 1; speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch (e) { }
  },
  K() { return SAVE.kallu || (SAVE.kallu = { lv: 1, bounty: 300, stolen: 0, kills: 0, escapes: 0, meets: 0, last: '', gap: 0 }); },
  pname() { return (SAVE.pname && SAVE.pname !== 'Player' ? SAVE.pname : 'Hero'); },

  /* ---------------- Asli Raat (real-clock night) ---------------- */
  raat() { if (/raat=1/.test(location.search)) return true; const h = new Date().getHours(); return h >= 22 || h < 2; },
  raatLeft() { const d = new Date(), end = new Date(d); if (d.getHours() >= 22) end.setDate(end.getDate() + 1); end.setHours(2, 0, 0, 0); const m = Math.max(0, Math.round((end - d) / 60000)); return m ? `${Math.floor(m / 60)}h ${m % 60}m` : 'demo'; },

  /* ---------------- Kallu spawn / AI ---------------- */
  onStart() {
    G.kallu = null; G.kT = 0; const k = this.K();
    if (CL.ev || CL.boss || CL.n < 3 || ['multi'].includes(CL.task)) return;
    k.gap = (k.gap || 0) + 1;
    const chance = (this.raat() ? 0.55 : 0.3) + (k.stolen ? 0.15 : 0);
    if (k.gap >= 4 || Math.random() < chance || (CL.n === 3 && !k.meets)) G.kT = rnd(7, 14);
  },
  tick(gdt) {
    if (G.kT > 0) { G.kT -= gdt; if (G.kT <= 0) this.spawn(); }
  },
  spawn() {
    const k = this.K(); k.gap = 0; k.meets++; save();
    const hp = Math.min(9, 3 + k.lv), [x, y] = edgePos();
    const m = spawnMosq('normal', x, y, { t: 'kallu', heera: true, kallu: true, life: 9 + Math.min(4, k.lv * 0.5), sp: (240 + k.lv * 18) * S, size: 1.55, pts: 1500, coin: 0, hp, maxhp: hp, wa: 1.4, wf: 5, tpCd: 0 });
    m.wp = { x: rnd(W * 0.2, W * 0.8), y: rnd(H * 0.22, H * 0.5) }; G.kallu = m;
    const who = CHARS[CW.cid] ? CHARS[CW.cid].n : 'Papa', x2 = { n: this.pname(), c: who, s: k.stolen };
    const pool = k.meets === 1 ? KALLU_TAUNT.first : k.last === 'killed' ? KALLU_TAUNT.killed : k.last === 'escaped' ? KALLU_TAUNT.escaped : KALLU_TAUNT.first;
    const t = pool[(Math.random() * pool.length) | 0];
    ANN_PRI = 1; pop(`😈 KALLU IS HERE! · Lv ${k.lv}`, W / 2, H * 0.3, 18, '#fff', 1.4); ANN_PRI = 0;
    this.say(fillT(t[0], x2), fillT(t[1], x2));
    G.flash = 0.35; G.flashCol = '116,58,232'; shake(10); vib([60, 40, 60]); sfx.roar && sfx.roar();
    META.x('Nemesis System (Kallu yaad rakhta hai)');
  },
  upd(m, gdt) {
    m.life -= gdt; m.tpCd -= gdt;
    if (m.life <= 0) return this.escape(m);
    const k = this.K();
    // dodge: racket paas aaye to jhatka
    if (k.lv >= 2 && ptr.vis > 0 && m.tpCd <= 0 && Math.hypot(ptr.x - m.x, ptr.y - m.y) < 70 * S && Math.random() < 0.04 * k.lv) { m.tpCd = 1.6; sparks(m.x, m.y, 10, 140, [P2, '#fff']); m.x = clamp(m.x + rnd(-160, 160) * S, 30, W - 30); m.y = clamp(m.y + rnd(-90, 60) * S, H * 0.16, H * 0.62); sparks(m.x, m.y, 10, 140, [P2, '#fff']); popOnce('kdodge', 1.2, 'HEHEHE! 😜', m.x, m.y - 50 * S, 16, '#fff', 0.7); }
    let d = Math.hypot(m.wp.x - m.x, m.wp.y - m.y);
    if (d < 40 * S) m.wp = { x: rnd(W * 0.12, W * 0.88), y: rnd(H * 0.18, H * 0.6) };
    if (m.life < 1.4) m.wp = { x: m.x < W / 2 ? -220 * S : W + 220 * S, y: m.y - 120 * S };
    d = Math.hypot(m.wp.x - m.x, m.wp.y - m.y);
    const kk = Math.min(1, gdt * 3.5); m.vx += ((m.wp.x - m.x) / (d || 1) * m.sp - m.vx) * kk; m.vy += ((m.wp.y - m.y) / (d || 1) * m.sp - m.vy) * kk;
    m.x += m.vx * gdt; m.y += m.vy * gdt; m.dir = m.vx > 0 ? 1 : -1;
    if (Math.random() < 0.35) G.parts.push({ x: m.x - m.dir * 14 * S, y: m.y, vx: rnd(-20, 20) * S, vy: rnd(-10, 30) * S, life: 0.5, max: 0.5, size: rnd(1.5, 3) * S, col: Math.random() < 0.5 ? P2 : '#ffffff', g: 0 });
  },
  onHit(m) {
    const q = KALLU_TAUNT.hit[(Math.random() * KALLU_TAUNT.hit.length) | 0];
    if (Math.random() < 0.4) pop(q, m.x, m.y - 56 * S, 12, '#fff', 0.7); m.life += 0.6; tone(900, 1500, 0.12, 0.08, 'square');
    if (this.K().lv >= 3 && m.hp > 1 && Math.random() < 0.5) for (let i = 0; i < 2; i++) spawnMosq('clone', m.x + rnd(-50, 50) * S, m.y + rnd(-40, 40) * S, { decoy: true, hp: 1, pts: 0, coin: 0, dmg: 0, size: 1.4 });
  },
  escape(m) {
    m.dead = true; G.kallu = null; const k = this.K();
    const take = Math.min(SAVE.coins, 60 + k.lv * 40); SAVE.coins -= take; k.stolen += take; k.bounty += 150; k.escapes++; k.lv = Math.min(9, k.lv + 1); k.last = 'escaped'; save();
    G.kalluRes = { esc: true, take };
    const t = KALLU_TAUNT.flee[(Math.random() * KALLU_TAUNT.flee.length) | 0], x2 = { n: this.pname(), c: '', s: k.stolen };
    ANN_PRI = 1; pop('😈 KALLU ESCAPED!', W / 2, H * 0.3, 26, '#fff', 1.8); pop(take ? `🪙 -${take}` : `💰 ${fmt(k.bounty)}`, W / 2, H * 0.3 + 30 * S, 14, '#d9ccff', 1.8); ANN_PRI = 0;
    this.say(fillT(t, x2), fillT(t === KALLU_TAUNT.flee[0] ? 'See you again, {n}!' : 'Your coins are mine! Bye bye!', x2));
    META.x('Loss Aversion + Revenge (Kallu ne coins churaye)');
  },
  killed(m) {
    G.kallu = null; const k = this.K(), prize = k.bounty + k.stolen;
    G.coins += prize; G.gems += 3; k.kills++; k.lv = Math.min(9, k.lv + 1); k.stolen = 0; k.bounty = 300 + k.lv * 100; k.last = 'killed'; save();
    G.kalluRes = { kill: true, prize };
    slow(1.4); G.flash = 0.9; G.flashCol = '255,255,255'; shake(30); vib([80, 40, 80, 40, 160]);
    for (let i = 0; i < 70; i++) sparks(m.x, m.y, 1, rnd(150, 520), ['#fff', P2, `rgb(${ELEC})`, P1]);
    ANN_PRI = 1; pop(`💥 KALLU IS DOWN! +${fmt(prize)}`, W / 2, H * 0.3, 28, '#fff', 2.2); pop(`💎 +3`, W / 2, H * 0.3 + 30 * S, 15, `rgb(${ELEC})`, 2.2); ANN_PRI = 0;
    sfx.chest(); this.say('Nooo! I will be back!', 'Nooo! I will be back!');
    META.x('Peak Moment (Nemesis defeat)');
  },
  /* accessories drawn inside drawMosq transform (head at 6s,-1s) */
  acc(s, m, time) {
    const k = this.K();
    // sunglasses
    ctx.fillStyle = '#05030c'; ctx.beginPath(); ctx.roundRect(3.2 * s, -4.1 * s, 7.6 * s, 2.8 * s, 1.2 * s); ctx.fill();
    ctx.fillStyle = 'rgba(127,212,255,.8)'; ctx.fillRect(7.6 * s, -3.6 * s, 1.6 * s, 0.6 * s);
    // villain moustache
    ctx.strokeStyle = '#05030c'; ctx.lineWidth = 1.1 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(8.6 * s, 0.6 * s); ctx.quadraticCurveTo(6.6 * s, 2.2 * s, 5.4 * s, 0.6 * s); ctx.moveTo(8.6 * s, 0.6 * s); ctx.quadraticCurveTo(10.8 * s, 2.4 * s, 11.6 * s, 0.4 * s); ctx.stroke();
    // white chain
    ctx.fillStyle = '#fff'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(2.5 * s + i * 1.3 * s, 2.6 * s + Math.sin(i * 0.8) * 0.8 * s, 0.55 * s, 0, 7); ctx.fill(); }
    // bandages = har haar ka nishaan
    for (let i = 0; i < Math.min(3, k.kills); i++) { ctx.save(); ctx.translate(-6 * s - i * 6 * s, -1 * s + (i % 2) * 2 * s); ctx.rotate(0.6); ctx.fillStyle = '#f2eeff'; ctx.fillRect(-2.6 * s, -0.8 * s, 5.2 * s, 1.6 * s); ctx.fillRect(-0.8 * s, -2.6 * s, 1.6 * s, 5.2 * s); ctx.restore(); }
  },
  /* world-space overlay: tag, hp, timer */
  tag(m) {
    const k = this.K(), y = m.y - 46 * S, txt = `😈 KALLU · Lv ${k.lv}`;
    ctx.save(); ctx.font = `900 ${11 * S}px Poppins`; const w = ctx.measureText(txt).width + 16 * S;
    ctx.fillStyle = 'rgba(20,8,50,.85)'; ctx.strokeStyle = P2; ctx.lineWidth = 1.2 * S; ctx.beginPath(); ctx.roundRect(m.x - w / 2, y - 10 * S, w, 18 * S, 9 * S); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, m.x, y - 1 * S);
    const bw = 54 * S; ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(m.x - bw / 2, y + 11 * S, bw, 4 * S); ctx.fillStyle = `rgb(${ELEC})`; ctx.fillRect(m.x - bw / 2, y + 11 * S, bw * m.hp / m.maxhp, 4 * S);
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2.5 * S; ctx.beginPath(); ctx.arc(m.x, m.y, 30 * S, -Math.PI / 2, -Math.PI / 2 + 6.283 * clamp(m.life / 10, 0, 1)); ctx.stroke();
    ctx.font = `800 ${9 * S}px Poppins`; ctx.fillStyle = '#d9ccff'; ctx.fillText(`💰 ${fmt(k.bounty + k.stolen)}`, m.x, m.y + 42 * S);
    ctx.restore(); ctx.textBaseline = 'alphabetic';
  },

  /* ---------------- Map: WANTED poster + Asli Raat banner ---------------- */
  hubTop() {
    const k = this.K(), r = this.raat();
    let h = '';
    if (r) h += `<div class="raatB"><b>🌙 LATE NIGHT LIVE</b><span>2X coins · Kallu shows up more · ${this.raatLeft()} left</span></div>`;
    else { const d = new Date(), st = new Date(d); st.setHours(22, 0, 0, 0); if (d > st) st.setDate(st.getDate() + 1); const m = Math.round((st - d) / 60000); h += `<div class="raatB off"><b>🌙 LATE NIGHT</b><span>Tonight at 10 PM · 2X coins · in ${Math.floor(m / 60)}h ${m % 60}m</span></div>`; }
    if (k.meets) h += `<button class="wanted" id="kWanted"><div class="wf">😈<i>🦟</i></div><div class="wt"><small>WANTED · DEAD OR ALIVE</small><b>KALLU · Lv ${k.lv}</b><span>💰 Bounty ${fmt(k.bounty + k.stolen)}${k.stolen ? ` · he has ${fmt(k.stolen)} of your coins` : ''}</span></div></button>`;
    return h;
  },
  bindHub() { const b = $('kWanted'); if (b) b.onclick = () => { sfx.coin(); this.dossier(); }; },
  dossier() {
    const k = this.K(), last = k.last === 'escaped' ? `"Ha ha! ${this.pname()}, I am partying with your ${fmt(k.stolen)} coins 🥳"` : k.last === 'killed' ? `"Still bandaged… but I will be back, ${this.pname()} 🩹"` : '"I am coming…"';
    META.panel(`<div class="kick">KALLU\'S FILE</div><div class="bigrank" style="font-size:70px">😈</div><div class="big" style="font-size:30px">Lv ${k.lv} · ${['', 'Street Thug', 'Street Thug', 'Block Boss', 'Block Boss', 'City Don', 'City Don', 'King of the Night', 'King of the Night', 'SULTAN OF SLEEP'][k.lv]}</div>
      <div class="sub" style="margin-top:8px">${last}</div>
      <div class="stats" style="margin-top:12px"><div><b>${k.meets}</b>MEETINGS</div><div><b>${k.kills}</b>DEFEATED</div><div><b>${k.escapes}</b>ESCAPED</div><div><b>${fmt(k.bounty + k.stolen)}</b>BOUNTY</div></div>
      <div class="chip" style="margin-top:12px">He gets faster every time. He shows up more after 10 PM 🌙</div>`);
  },

  /* ---------------- Lucky Ticket (scratch card) ---------------- */
  roll() {
    const r = Math.random();
    if (r < 0.01) return { s: ['😈', '😈', '😈'], t: 'KALLU\'S TREASURE! 🤯', c: 1000, g: 10, big: 1 };
    if (r < 0.05) return { s: ['⚡', '⚡', '⚡'], t: 'BIG WIN!', c: 300 };
    if (r < 0.17) return { s: ['😈', '😈', '🦟'], t: 'SO CLOSE! The treasure was 1000 😱', c: 25, near: 1 };
    if (r < 0.32) return { s: ['💎', '💎', '💎'], t: 'GEMS!', g: 2 };
    if (r < 0.52) { const b = BOOSTERS[(Math.random() * BOOSTERS.length) | 0]; return { s: ['🎒', '🎒', '🎒'], t: `+1 ${b.name}`, b: b.id }; }
    return { s: ['⚡', '⚡', '⚡'], t: 'COINS!', c: Math.round(rnd(40, 90)) };
  },
  ticket(again) {
    const box = $('wTicket'), nx = $('wNextCard'); if (!box) return;
    const R2 = this.roll(); box.style.display = ''; nx.style.display = 'none';
    box.innerHTML = `<div class="tkHead"><b>🎟️ LUCKY TICKET${again ? ' #2' : ''}</b><span>3 of a kind = prize · 😈😈😈 = 1000 🪙</span></div>
      <div class="tkRow">${R2.s.map((x, i) => `<div class="tkCell" data-i="${i}"><i>${x}</i><canvas></canvas><div class="tkShine"></div></div>`).join('')}</div><div class="tkRes" id="tkRes"><span class="tkHint">👆 scratch all three</span></div>`;
    const cells = [...box.querySelectorAll('.tkCell')], open = [false, false, false]; let done = false;
    const burst = (cell, n, big) => { const r = cell.getBoundingClientRect(), b = box.getBoundingClientRect(); for (let k = 0; k < n; k++) { const p = document.createElement('i'); p.className = 'tkP'; const a = Math.random() * 6.28, d = (big ? 60 : 26) + Math.random() * (big ? 90 : 30); p.style.cssText = `left:${r.left - b.left + r.width / 2}px;top:${r.top - b.top + r.height / 2}px;--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d}px;background:${['#fff', '#ffd65c', '#9a6df5', 'rgb(127,212,255)'][k % 4]}`; box.appendChild(p); setTimeout(() => p.remove(), 900); } };
    const finish = () => {
      if (done) return; done = true;
      if (R2.c) SAVE.coins += R2.c; if (R2.g) SAVE.gems += R2.g; if (R2.b) SAVE.boost[R2.b] = (SAVE.boost[R2.b] || 0) + 1; save();
      box.classList.remove('sus'); box.classList.add(R2.near ? 'near' : 'won');
      if (R2.near) { tone(300, 150, 0.4, 0.15, 'sawtooth'); vib([30, 60, 30]); }
      else { cells.forEach(c => burst(c, R2.big ? 22 : 10, R2.big)); [0, 4, 7, 12].forEach((n, i) => tone(NOTES[Math.min(10, n)], NOTES[Math.min(10, n)], 0.25, 0.1, 'triangle', i * 0.07)); vib(R2.big ? [80, 40, 80, 40, 200] : 40); if (R2.big) G.flash = 1; }
      const rw = [R2.c ? `<span class="coin"></span>+${R2.c}` : '', R2.g ? `💎 +${R2.g}` : '', R2.b ? '🎒 +1' : ''].filter(Boolean).join(' &nbsp;');
      $('tkRes').innerHTML = `<b>${R2.t}</b> ${rw}${again ? '' : `<button class="x2" id="tkAgain">📺 1 aur ticket</button>`}`;
      META.x(R2.near ? 'Near-Miss (Lucky Ticket)' : 'Variable Ratio Reward (Lucky Ticket)');
      const a = $('tkAgain'); if (a) a.onclick = () => { a.disabled = true; showAd(() => this.ticket(true)); };
    };
    const reveal = i => {
      if (open[i]) return; open[i] = true; const c = cells[i]; c.classList.add('open'); burst(c, 8);
      tone(700 + i * 180, 1100 + i * 220, 0.12, 0.09, 'triangle'); vib(15);
      const sh = R2.s.filter((_, k) => open[k]);
      if (open.filter(Boolean).length === 2 && sh[0] === sh[1]) { box.classList.add('sus'); $('tkRes').innerHTML = `<b class="tkSus">🔥 ONE MORE! ${sh[0]}${sh[0]} …?</b>`; sfx.heart(1); setTimeout(() => sfx.heart(1), 420); vib([20, 40, 20]); }
      if (open.every(Boolean)) setTimeout(finish, 280);
    };
    cells.forEach((cell, i) => {
      const cv2 = cell.querySelector('canvas'), dpr = Math.min(2, devicePixelRatio || 1), w = cell.clientWidth, h = cell.clientHeight;
      cv2.width = w * dpr; cv2.height = h * dpr; const c = cv2.getContext('2d'); c.scale(dpr, dpr);
      const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#5b2fd0'); g.addColorStop(0.35, '#c9b3ff'); g.addColorStop(0.5, '#f4efff'); g.addColorStop(0.65, '#b39af2'); g.addColorStop(1, '#743ae8'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.globalAlpha = 0.25; c.strokeStyle = '#fff'; c.lineWidth = 1; for (let x = -h; x < w; x += 7) { c.beginPath(); c.moveTo(x, h); c.lineTo(x + h, 0); c.stroke(); }
      c.globalAlpha = 1; c.font = '900 22px Poppins'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(42,18,112,.55)'; c.fillText('?', w / 2, h / 2 + 1);
      let last = null, n = 0, down = false;
      const scr = (x, y) => { c.globalCompositeOperation = 'destination-out'; c.lineWidth = 26; c.lineCap = 'round'; c.beginPath(); if (last) c.moveTo(last[0], last[1]); else c.moveTo(x - 0.1, y); c.lineTo(x, y); c.stroke(); last = [x, y]; if (++n % 4 === 0) { tone(rnd(2200, 3200), rnd(1400, 2000), 0.03, 0.035, 'square'); const p = document.createElement('i'); p.className = 'tkS'; p.style.cssText = `left:${x}px;top:${y}px;--x:${rnd(-20, 20)}px;--y:${rnd(10, 34)}px`; cell.appendChild(p); setTimeout(() => p.remove(), 500); } if (n % 6 === 0) check(); };
      const check = () => { if (open[i]) return; const d = c.getImageData(0, 0, cv2.width, cv2.height).data; let cl = 0, t = 0; for (let k = 3; k < d.length; k += 32) { t++; if (d[k] < 20) cl++; } if (cl / t > 0.45) { cv2.style.opacity = 0; reveal(i); } };
      const pos = e => { const r = cv2.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      cv2.onpointerdown = e => { down = true; last = null; try { cv2.setPointerCapture(e.pointerId); } catch (_) { } scr(...pos(e)); };
      cv2.onpointermove = e => { if (down) scr(...pos(e)); };
      cv2.onpointerup = cv2.onpointercancel = () => { down = false; last = null; check(); };
    });
  },

  /* ---------------- WhatsApp Status card ---------------- */
  card() {
    const W2 = 1080, H2 = 1920, cv = document.createElement('canvas'); cv.width = W2; cv.height = H2; const c = cv.getContext('2d');
    const bg = c.createRadialGradient(W2 / 2, 620, 50, W2 / 2, 820, 1300); bg.addColorStop(0, '#9a6df5'); bg.addColorStop(0.38, '#4a1fa8'); bg.addColorStop(1, '#0b0520'); c.fillStyle = bg; c.fillRect(0, 0, W2, H2);
    c.save(); c.translate(W2 / 2, 640); c.globalAlpha = 0.13; c.fillStyle = '#fff'; for (let i = 0; i < 24; i++) { c.rotate(Math.PI / 12); c.beginPath(); c.moveTo(0, 0); c.lineTo(-60, -1300); c.lineTo(60, -1300); c.fill(); } c.restore();
    const T = (txt, y, size, col = '#fff', wt = 900) => { c.font = `${wt} ${size}px Poppins`; c.fillStyle = col; c.textAlign = 'center'; c.fillText(txt, W2 / 2, y); };
    const k = this.K(), ch = CHARS[CW.cid] || { e: '😴', n: 'Papa' }, st = SAVE.stars[CL.n] || 0;
    T('MACHHAR MAARO', 170, 64, '#fff'); T('🦟⚡', 260, 70);
    c.font = '900 260px Poppins'; c.textAlign = 'center'; c.fillText(ch.secret ? '😴' : ch.e, W2 / 2, 640);
    T(`I SAVED ${(ch.secret ? 'SOMEONE SPECIAL' : ch.n).toUpperCase()}\'S`, 790, 74); T('SLEEP! 😴', 880, 84);
    T('★'.repeat(st) + '☆'.repeat(3 - st), 1010, 110, '#e9e1ff');
    c.fillStyle = 'rgba(255,255,255,.1)'; c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 4; c.beginPath(); c.roundRect(140, 1070, 800, 280, 50); c.fill(); c.stroke();
    T(`LEVEL ${CL.n} · SCORE`, 1140, 40, '#d9ccff', 800); T(fmt(G.score), 1290, 150, '#fff');
    if (k.kills) T(`😈 Beat Kallu ${k.kills} time${k.kills > 1 ? 's' : ''}`, 1440, 46, 'rgb(127,212,255)', 800);
    c.fillStyle = '#fff'; c.beginPath(); c.roundRect(110, 1520, 860, 170, 85); c.fill();
    T('BET YOU CAN NOT 😏', 1600, 58, '#4a1fa8'); T('Search "Machhar Maaro" on the Play Store', 1660, 38, '#743ae8', 700);
    T('A SANX Graphikians Game', 1810, 38, '#cbb8ff', 700);
    return cv;
  },
  async share() {
    META.x('Social Proof (WhatsApp Status card)');
    const text = META.shareText(), cv = this.card();
    cv.toBlob(async b => {
      const f = new File([b], 'machhar-maaro.png', { type: 'image/png' });
      try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], text }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
      const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'machhar-maaro-status.png'; a.click();
      try { navigator.clipboard.writeText(text); } catch (e) { }
      toast('📸 Status image saved. Post it on WhatsApp!');
    }, 'image/png');
  },

  /* ---------------- win screen hook ---------------- */
  afterWin() {
    const k = this.K(), res = G.kalluRes; G.kalluRes = null;
    if (res && res.esc) { $('wNxE').textContent = '😈'; $('wNxK').textContent = 'TAKE REVENGE!'; $('wTeaser').textContent = `Kallu has ${fmt(k.stolen)} of your coins`; }
    if (this.raat()) { const kk = $('wKick'); kk.textContent += ' · 🌙 2X'; }
    this.ticket(false);
  }
};

/* ---------------- hooks ---------------- */
const _nOnStart = META.onStart; META.onStart = function () { _nOnStart.apply(this, arguments); NASHA.onStart(); if (NASHA.raat()) setTimeout(() => { if (state === 'play') pop('🌙 LATE NIGHT · 2X COINS', W / 2, H * 0.3, 20, '#fff', 1.4); }, 1700); };
const _nTick = META.tick; META.tick = function (dt, gdt) { _nTick.call(META, dt, gdt); NASHA.tick(gdt); };
const _nUpdH = META.updHeera; META.updHeera = function (m, gdt) { if (m.kallu) return NASHA.upd(m, gdt); return _nUpdH.call(this, m, gdt); };
const _nOnKill = META.onKill; META.onKill = function (m, near) { _nOnKill.apply(this, arguments); if (m.kallu) NASHA.killed(m); };
const _nHit = window.hit; window.hit = function (m, fx, fy, dmg, how) { const r = _nHit.apply(this, arguments); if (r && m.kallu && !m.dead) NASHA.onHit(m); return r; };
const _nDrawM = window.drawMosq; window.drawMosq = function (m, time) { _nDrawM(m, time); if (m.kallu && !m.dead) NASHA.tag(m); };
const _nHub = META.hub; META.hub = function () { const h = _nHub.call(this); return h.replace('<div class="hub">', '<div class="hub">' + NASHA.hubTop()); };
const _nBind = META.bindHub; META.bindHub = function () { _nBind.call(this); NASHA.bindHub(); };
const _nWin = window.showWin; window.showWin = function (st, objs) { _nWin.apply(this, arguments); if (!CL.ev) NASHA.afterWin(); };
document.querySelectorAll('.sharebtn').forEach(b => b.onclick = () => NASHA.share());
if (window.speechSynthesis) { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices(); }

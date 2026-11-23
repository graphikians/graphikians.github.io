/* ================= BEAT SANX — WhatsApp status posters (v1.3) =================
   Two approved 1080x1920 designs built from pre-rendered 3D art (www/share/):
   PODIUM: big 3D number standing on a neon podium · PHONE: 3D phone showing the game.
   Dynamic parts (number, ribbon, plate, chips, QR, Play badge, Sanx) are drawn on top.
   Daily share bonus: 50 coins. */
'use strict';
const SH = (() => {
  const PLAY = 'https://play.google.com/store/apps/details?id=com.sanxgraphikians.beatsanx';
  const fmt = n => UI.fmt(n);
  const cache = {};
  const load = src => cache[src] || (cache[src] = new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }));
  const img = svg => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.includes('xmlns=') ? svg : svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')); });
  function rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
  const F = (w, s) => `${w} ${s}px Inter, system-ui, sans-serif`;
  function txt(x, t, X, Y, size, w = 900, col = '#fff', align = 'center') { x.font = F(w, size); x.fillStyle = col; x.textAlign = align; x.textBaseline = 'alphabetic'; x.fillText(t, X, Y); }
  function fitSize(x, t, max, size, w) { let s = size; x.font = F(w, s); while (x.measureText(t).width > max && s > 18) { s -= 2; x.font = F(w, s); } return s; }
  function glow(x, col, blur) { x.shadowColor = col; x.shadowBlur = blur; x.shadowOffsetX = 0; x.shadowOffsetY = 0; }
  function noGlow(x) { x.shadowColor = 'transparent'; x.shadowBlur = 0; }
  function qr(x, url, X, Y, S) {
    if (typeof qrcode !== 'function') return;
    const q = qrcode(0, 'M'); q.addData(url); q.make(); const n = q.getModuleCount(), c = (S - 26) / n;
    glow(x, 'rgba(196,167,255,.8)', 26); x.fillStyle = '#9a6df5'; rr(x, X - 5, Y - 5, S + 10, S + 10, 26); x.fill(); noGlow(x);
    x.fillStyle = '#fff'; rr(x, X, Y, S, S, 22); x.fill();
    x.fillStyle = '#14063a'; for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) x.fillRect(X + 13 + k * c, Y + 13 + r * c, c + 0.6, c + 0.6);
  }
  /* neon game panel */
  function panel(x, X, Y, W, H, r = 30) {
    glow(x, 'rgba(154,109,245,.55)', 30);
    const g = x.createLinearGradient(0, Y, 0, Y + H); g.addColorStop(0, 'rgba(43,14,107,.94)'); g.addColorStop(1, 'rgba(20,6,58,.96)');
    x.fillStyle = '#14063a'; rr(x, X - 4, Y - 4, W + 8, H + 16, r + 4); x.fill(); noGlow(x);
    x.fillStyle = g; rr(x, X, Y, W, H, r); x.fill();
    x.lineWidth = 3; x.strokeStyle = '#9a6df5'; rr(x, X, Y, W, H, r); x.stroke();
  }
  function brackets(x, X, Y, W, H) {
    x.save(); x.strokeStyle = '#c4a7ff'; x.lineWidth = 6; x.lineCap = 'round'; glow(x, '#9a6df5', 10);
    const L = 50, o = 12;
    [[X - o, Y - o, 1, 1], [X + W + o, Y - o, -1, 1], [X - o, Y + H + o, 1, -1], [X + W + o, Y + H + o, -1, -1]].forEach(([a, b, sx, sy]) => { x.beginPath(); x.moveTo(a, b + sy * L); x.lineTo(a, b + sy * 14); x.quadraticCurveTo(a, b, a + sx * 14, b); x.lineTo(a + sx * L, b); x.stroke(); });
    x.restore();
  }
  function ribbon(x, t, cx, Y) {
    const s = fitSize(x, t, 640, 42, 900); x.font = F(900, s); const w = Math.min(760, x.measureText(t).width + 120), h = 84;
    // folded ends
    x.fillStyle = '#3b1580'; x.strokeStyle = '#c4a7ff'; x.lineWidth = 4;
    [[-1], [1]].forEach(([d]) => { const ex = cx + d * (w / 2 - 20); x.beginPath(); x.moveTo(ex, Y + 30); x.lineTo(ex + d * 90, Y + 30); x.lineTo(ex + d * 64, Y + 30 + 37); x.lineTo(ex + d * 90, Y + 104); x.lineTo(ex, Y + 104); x.closePath(); x.fill(); x.stroke(); });
    glow(x, 'rgba(196,167,255,.6)', 30);
    const g = x.createLinearGradient(0, Y, 0, Y + h); g.addColorStop(0, '#5b21b6'); g.addColorStop(1, '#2b0e6b');
    x.fillStyle = '#14063a'; rr(x, cx - w / 2 - 4, Y - 4, w + 8, h + 8, 12); x.fill(); noGlow(x);
    x.fillStyle = g; rr(x, cx - w / 2, Y, w, h, 10); x.fill(); x.strokeStyle = '#c4a7ff'; x.lineWidth = 4; rr(x, cx - w / 2, Y, w, h, 10); x.stroke();
    glow(x, 'rgba(196,167,255,.9)', 14); txt(x, t, cx, Y + h / 2 + s * 0.36, s, 900, '#fff'); noGlow(x);
  }
  function plate(x, t, cx, Y) {
    const s = fitSize(x, t, 720, 56, 900); x.font = F(900, s); const w = x.measureText(t).width + 110, h = 108;
    x.fillStyle = '#5b21b6'; x.strokeStyle = '#14063a'; x.lineWidth = 3;
    [-1, 1].forEach(d => { rr(x, cx + d * (w / 2 + 12) - (d < 0 ? 46 : 0), Y + h / 2 - 8, 46, 16, 4); x.fill(); x.stroke(); });
    glow(x, 'rgba(196,167,255,.75)', 36);
    x.fillStyle = '#14063a'; rr(x, cx - w / 2 - 9, Y - 9, w + 18, h + 18, 30); x.fill(); noGlow(x);
    x.fillStyle = '#5b21b6'; rr(x, cx - w / 2 - 5, Y - 5, w + 10, h + 10, 27); x.fill();
    const g = x.createLinearGradient(0, Y, 0, Y + h); g.addColorStop(0, '#2b0e6b'); g.addColorStop(1, '#14063a');
    x.fillStyle = g; rr(x, cx - w / 2, Y, w, h, 22); x.fill(); x.strokeStyle = '#c4a7ff'; x.lineWidth = 4; rr(x, cx - w / 2, Y, w, h, 22); x.stroke();
    glow(x, 'rgba(196,167,255,.95)', 18); txt(x, t, cx, Y + h / 2 + s * 0.36, s, 900, '#fff'); noGlow(x);
  }
  async function chips(x, list, cy) {
    if (!list || !list.length) return;
    x.font = F(900, 34); const ws = list.map(c => x.measureText(c.t).width + (c.coin || c.ic ? 104 : 64)); const gap = 22, tot = ws.reduce((a, b) => a + b, 0) + gap * (list.length - 1);
    let X = 540 - tot / 2;
    for (let i = 0; i < list.length; i++) {
      const c = list[i], w = ws[i], h = 80, gold = !!c.coin;
      glow(x, gold ? 'rgba(255,200,60,.5)' : 'rgba(154,109,245,.7)', 24); x.fillStyle = '#14063a'; rr(x, X - 4, cy - 4, w + 8, h + 17, 28); x.fill(); noGlow(x);
      const g = x.createLinearGradient(0, cy, 0, cy + h); g.addColorStop(0, '#743ae8'); g.addColorStop(1, '#3b1580'); x.fillStyle = g; rr(x, X, cy, w, h, 24); x.fill();
      x.strokeStyle = gold ? '#ffd84a' : '#c4a7ff'; x.lineWidth = 3; rr(x, X, cy, w, h, 24); x.stroke();
      let tx = X + 32;
      if (c.coin) { const ci = await img(ART.coinFull(46)); if (ci) x.drawImage(ci, X + 24, cy + 17, 46, 46); tx = X + 82; }
      else if (c.ic) { const ii = await img(ART.ic(c.ic).replace('<svg ', '<svg width="36" height="36" style="color:#e9ddff" ').replace(/currentColor/g, '#e9ddff')); if (ii) x.drawImage(ii, X + 26, cy + 22, 36, 36); tx = X + 76; }
      x.shadowColor = '#14063a'; x.shadowOffsetY = 3; txt(x, c.t, tx, cy + 53, 34, 900, '#fff', 'left'); noGlow(x); x.shadowOffsetY = 0;
      X += w + gap;
    }
  }
  /* big 3D number from pre-rendered Anton digits; falls back to drawn text for words */
  async function bigNumber(x, val, cx, bottom, maxW, maxH) {
    const s = String(val);
    if (/^\d{1,4}$/.test(s)) {
      const ims = await Promise.all([...s].map(d => load('share/d' + d + '.png')));
      if (ims.every(Boolean)) {
        const gap = -18; let tw = ims.reduce((a, i) => a + i.width, 0) + gap * (ims.length - 1);
        const k = Math.min(maxH / ims[0].height, maxW / tw);
        let X = cx - tw * k / 2;
        glow(x, 'rgba(196,167,255,.55)', 40);
        for (const i of ims) { x.drawImage(i, X, bottom - i.height * k, i.width * k, i.height * k); X += (i.width + gap) * k; }
        noGlow(x); return;
      }
    }
    const size = fitSize(x, s, maxW, Math.min(260, maxH * 0.6), 900);
    for (let d = 14; d > 0; d -= 2) txt(x, s, cx, bottom - 40 + d, size, 900, d > 10 ? '#14063a' : '#4c1d95');
    glow(x, 'rgba(196,167,255,.7)', 30); const g = x.createLinearGradient(0, bottom - 40 - size, 0, bottom - 40); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#b28cff');
    x.font = F(900, size); x.fillStyle = g; x.textAlign = 'center'; x.fillText(s, cx, bottom - 40); noGlow(x);
  }
  async function bottomPanel(x, d, full) {
    const X = full ? 70 : 46, W = full ? 940 : 700, Y = 1584, H = 296;
    panel(x, X, Y, W, H); brackets(x, X, Y, W, H);
    qr(x, d.url || PLAY, X + 34, Y + 35, 226);
    const tx = X + 300;
    const cta = (d.cta || 'BEAT MY SCORE').toUpperCase(), cs = fitSize(x, cta, W - 340 - 40, 38, 900); x.font = F(900, cs);
    const bw = x.measureText(cta).width + 44;
    glow(x, 'rgba(196,167,255,.75)', 22); x.fillStyle = '#14063a'; rr(x, tx - 3, Y + 40 - 3, bw + 6, 76 + 12, 18); x.fill(); noGlow(x);
    const g = x.createLinearGradient(0, Y + 40, 0, Y + 116); g.addColorStop(0, '#9a6df5'); g.addColorStop(.6, '#743ae8'); g.addColorStop(1, '#5b21b6');
    x.fillStyle = g; rr(x, tx, Y + 40, bw, 76, 16); x.fill(); x.strokeStyle = '#e9ddff'; x.lineWidth = 3; rr(x, tx, Y + 40, bw, 76, 16); x.stroke();
    x.shadowColor = '#2b0e6b'; x.shadowOffsetY = 3; txt(x, cta, tx + 22, Y + 40 + 38 + cs * 0.36, cs, 900, '#fff', 'left'); noGlow(x); x.shadowOffsetY = 0;
    txt(x, d.scan || 'Scan to download · 100% free', tx, Y + 162, 24, 700, '#d6c6ff', 'left');
    const gp = await load('share/gplay.png'); if (gp) { const h = 90, w = gp.width * h / gp.height; x.drawImage(gp, tx, Y + 180, w, h); }
  }
  async function sanx(x, mood, bubble) {
    const sx = await img(ART.sanx(mood || 'shock'));
    if (sx) { glow(x, 'rgba(154,109,245,.6)', 30); x.drawImage(sx, 1080 - 300 + 4, 1590, 300, 345); noGlow(x); }
    if (bubble) {
      x.save(); x.translate(925, 1590); x.rotate(-0.12);
      const s = 42; x.font = F(900, s); const w = x.measureText(bubble).width + 60, h = 84;
      glow(x, 'rgba(196,167,255,.8)', 28); x.fillStyle = '#14063a'; rr(x, -w / 2 - 4, -h - 4, w + 8, h + 8, 26); x.fill(); noGlow(x);
      const g = x.createLinearGradient(0, -h, 0, 0); g.addColorStop(0, 'rgba(116,58,232,.95)'); g.addColorStop(1, 'rgba(43,14,107,.95)');
      x.fillStyle = g; rr(x, -w / 2, -h, w, h, 22); x.fill(); x.strokeStyle = '#c4a7ff'; x.lineWidth = 4; rr(x, -w / 2, -h, w, h, 22); x.stroke();
      glow(x, '#c4a7ff', 12); txt(x, bubble, 0, -h / 2 + s * 0.36, s, 900, '#fff'); noGlow(x); x.restore();
    }
  }

  /* d: { k (ribbon), big, sub (plate), head (phone headline), chips[], mood, bubble, cta, url } */
  async function draw(kind, d, style) {
    try { await document.fonts.load('900 40px Inter'); await document.fonts.load('700 24px Inter'); } catch (e) { }
    const W = 1080, Hh = 1920, c = document.createElement('canvas'); c.width = W; c.height = Hh; const x = c.getContext('2d');
    const phone = style === 'phone';
    const bg = await load(phone ? 'share/bg_phone.jpg' : 'share/bg_podium.jpg');
    if (bg) x.drawImage(bg, 0, 0, W, Hh); else { x.fillStyle = '#14063a'; x.fillRect(0, 0, W, Hh); }
    if (!phone) {
      ribbon(x, (d.k || 'NEW PERSONAL BEST').toUpperCase(), 540, 430);
      await bigNumber(x, d.big, 540, 1172, 820, 575);
      plate(x, (d.sub || '').toUpperCase(), 540, 1282);
      await chips(x, d.chips, 1440);
      await bottomPanel(x, d, false);
      await sanx(x, d.mood, d.bubble || 'Kaise?!');
    } else {
      const head = (d.head || `${d.big} ${d.sub || ''}`).toUpperCase(), s = fitSize(x, head, 960, 86, 900);
      for (let k = 12; k > 0; k -= 2) txt(x, head, 540, 1372 + k, s, 900, k > 8 ? '#14063a' : '#4c1d95');
      glow(x, 'rgba(196,167,255,.7)', 26); const g = x.createLinearGradient(0, 1372 - s, 0, 1372); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#c4a7ff'); x.font = F(900, s); x.fillStyle = g; x.textAlign = 'center'; x.fillText(head, 540, 1372); noGlow(x);
      await chips(x, d.chips, 1430);
      await bottomPanel(x, d, true);
    }
    return c;
  }
  /* pick a poster, draw, share. text = WhatsApp message */
  async function send(kind, d, text) {
    const v = await UI.ask(`<div class="mdK">Share</div><div class="mdT">Pick your poster</div><div class="shPick"><button data-pick="podium">${ART.ic('trophy')}<b>3D Podium</b><small>Big number on stage</small></button><button data-pick="phone">${ART.ic('sparkle')}<b>Game Screen</b><small>Phone showing the game</small></button></div><button class="btn ghost" data-pick="no">Cancel</button>`);
    if (!v || v === 'no') return;
    UI.toast('Making your poster…', 'sparkle');
    const canvas = await draw(kind, d, v);
    const full = text + '\n\nGet Beat Sanx: ' + PLAY;
    let ok = false;
    try {
      if (window.BS_SHARE) { await window.BS_SHARE(text, PLAY, canvas); ok = true; }
      else if (navigator.canShare) {
        const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
        const file = new File([blob], 'beat-sanx.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: full }); ok = true; }
        else { await navigator.share({ text: full }); ok = true; }
      } else if (navigator.share) { await navigator.share({ text: full }); ok = true; }
      else { await navigator.clipboard.writeText(full); UI.toast('Message copied. Paste it in WhatsApp!', 'copy'); ok = true; }
    } catch (e) { if (!String(e).match(/abort|cancel/i)) { try { await navigator.clipboard.writeText(full); UI.toast('Message copied. Paste it in WhatsApp!', 'copy'); ok = true; } catch (e2) { UI.toast('Could not share', 'x'); } } }
    if (ok) bonus();
  }
  /* v1.4: plain text share (Daily Beat grid) — fast, no poster */
  async function textShare(text, url = PLAY) {
    const full = text + '\n' + url; let ok = false;
    try {
      const Sh = window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.Share;
      if (Sh) { await Sh.share({ title: 'Beat Sanx', text: full, dialogTitle: 'Share' }); ok = true; }
      else if (navigator.share) { await navigator.share({ text: full }); ok = true; }
      else { await navigator.clipboard.writeText(full); UI.toast('Copied. Paste it in WhatsApp!', 'copy'); ok = true; }
    } catch (e) { if (!String(e).match(/abort|cancel/i)) { try { await navigator.clipboard.writeText(full); UI.toast('Copied. Paste it in WhatsApp!', 'copy'); ok = true; } catch (e2) { UI.toast('Could not share', 'x'); } } }
    if (ok) bonus();
    return ok;
  }
  /* v1.4: share a video file (Save Clip) */
  async function fileShare(blob, name, text) {
    let ok = false;
    try {
      /* laptop / Creator Mode: save straight to Downloads (the Windows share sheet does not save files) */
      const desktop = window.BS_CREATOR || (!window.BS_SHARE_FILE && window.matchMedia && matchMedia('(pointer: fine)').matches && !('ontouchstart' in window));
      if (desktop) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => a.remove(), 1000); UI.toast('Video saved to Downloads', 'check'); ok = true; }
      else if (window.BS_SHARE_FILE) { await window.BS_SHARE_FILE(blob, name, text + '\n' + PLAY); ok = true; }
      else {
        const file = new File([blob], name, { type: blob.type });
        if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: text + '\n' + PLAY }); ok = true; }
        else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); UI.toast('Video saved to downloads', 'check'); ok = true; }
      }
    } catch (e) { if (!String(e).match(/abort|cancel/i)) UI.toast('Could not share the video', 'x'); }
    if (ok) bonus();
  }
  function bonus() { const st = S.st, d = S.dayKey(); if (st.shareDay === d) return; st.shareDay = d; S.save(); S.grant({ coins: 50 }); setTimeout(() => UI.toast('Share bonus +50 coins', 'coins'), 900); }

  const modeName = m => (D.MODE[m] || D.MODE.classic).name;
  return {
    draw, send, textShare, fileShare,
    result(r) {
      if (r && r.imp) return SH.imp(r.cleared);
      if (r && r.ladder) return send('result', { k: 'NEW PERSONAL BEST', big: r.tiles, sub: 'tiles remembered', head: `I remembered ${r.tiles} tiles`, chips: [{ t: modeName(r.mode), ic: (D.MODE[r.mode] || D.MODE.classic).icon }, { t: 'Combo ' + (r.maxCombo || 0), ic: 'fire' }], mood: 'shock' }, `🧠 I remembered a ${r.tiles}-tile pattern on Beat Sanx! Can you beat me?`);
      const lv = r && r.levels != null ? r.levels : S.best();
      const acc = r && r.taps ? Math.round(r.correct / r.taps * 100) : null;
      send('result', { k: r && r.levels >= S.st.stats.bestRun ? 'NEW PERSONAL BEST' : 'MY RUN', big: lv, sub: 'levels cleared', head: `I cleared ${lv} levels`, chips: [{ t: 'Combo ' + ((r && r.maxCombo) || 0), ic: 'fire' }, r && r.coins ? { t: '+' + fmt(r.coins), coin: true } : null, acc != null ? { t: acc + '%', ic: 'target' } : null].filter(Boolean), mood: lv >= 5 ? 'shock' : 'laugh' }, `🧠⚡ I cleared ${lv} levels${r && r.mode ? ' in ' + modeName(r.mode) : ''} on Beat Sanx! Can you beat Sanx?`);
    },
    imp(n) { send('imp', { k: 'IMPOSSIBLE 100', big: n, sub: 'tiles from memory', head: `My brain: ${n} tiles`, chips: [{ t: 'IMPOSSIBLE 100', ic: 'brain' }], mood: n >= 20 ? 'shock' : 'smug', bubble: n >= 20 ? 'Kaise?!' : 'Bas itna?', cta: 'Beat my brain' }, `🧠 My brain remembers ${n} tiles in IMPOSSIBLE 100 on Beat Sanx. Tum kitna yaad rakh sakte ho?`); },
    challenge(c, text) { send('challenge', { k: 'DUEL CHALLENGE', big: c.tiles, sub: 'tiles to beat', head: `Beat my ${c.tiles} tiles`, chips: [{ t: modeName(c.mode), ic: (D.MODE[c.mode] || D.MODE.classic).icon }, c.stake ? { t: 'Win ' + fmt(c.stake * 2), coin: true } : { t: 'Same pattern', ic: 'swords' }], mood: 'angry', bubble: 'Try me!', cta: 'Scan & accept', scan: 'Scan to play my duel · 100% free', url: 'https://graphikians.github.io/beat-sanx/c/?c=' + c.code }, text); },
    chalResult(p, text) { send(p.won ? 'victory' : 'result', { k: p.won ? 'DUEL WON' : 'DUEL RESULT', big: p.tiles, sub: `tiles · you had ${p.target}`, head: `${p.tiles} vs ${p.target} tiles`, chips: [{ t: p.won ? 'I won!' : 'You win', ic: p.won ? 'trophy' : 'swords' }], mood: p.won ? 'shock' : 'laugh', url: 'https://graphikians.github.io/beat-sanx/c/?c=' + p.code, cta: p.won ? 'Rematch?' : 'Beat my score' }, text); },
    victory(a, b) { send('victory', { k: 'DUEL WON', big: a, sub: `tiles vs ${b}`, head: `${a} vs ${b} tiles`, chips: [{ t: 'Victory', ic: 'trophy' }], mood: 'shock', cta: 'Who is next?' }, `🏆 I won my Beat Sanx duel: ${a} tiles vs ${b}! Who's next?`); },
    rank(name) { send('rank', { k: 'RANK UP', big: name.toUpperCase(), sub: 'new brain rank', head: `New rank: ${name}`, chips: [{ t: 'Rank up', ic: 'bars' }], mood: 'shock' }, `🚀 I just reached ${name} rank on Beat Sanx!`); },
    weekly() {
      const st = S.st, s = st.stats, acc = s.taps ? Math.round(s.correct / s.taps * 100) : 0;
      send('weekly', { k: 'WEEKLY BRAIN REPORT', big: (st.lb.score || 0), sub: 'levels this week', head: `${st.lb.score || 0} levels this week`, chips: [{ t: 'Best ' + S.best(), ic: 'flag' }, { t: 'Combo ' + s.bestCombo, ic: 'fire' }, { t: acc + '%', ic: 'target' }], mood: 'smug' }, `📊 My Beat Sanx brain report: ${st.lb.score || 0} levels this week, best combo ${s.bestCombo}, ${acc}% accuracy. Beat that!`);
    },
    /* after a good run: if the brain rank went up, offer the rank-up card once */
    maybeRankUp() {
      const st = S.st, r = D.rank(st.xp).name;
      if (!st.rankShown) { st.rankShown = r; S.save(); return; }
      if (st.rankShown === r) return; st.rankShown = r; S.save();
      setTimeout(async () => { const v = await UI.ask(`<div class="rwRays"></div><div class="htFace">${ART.sanx('shock')}</div><div class="mdK">Rank up</div><div class="mdT">${r}!</div><div class="mdS">Show your friends. Share bonus: +50 coins today.</div><button class="btn big pulse" data-pick="s">${ART.ic('share')} SHARE</button><button class="btn ghost" data-pick="n">Later</button>`, 'rw'); if (v === 's') SH.rank(r); }, 600);
    }
  };
})();

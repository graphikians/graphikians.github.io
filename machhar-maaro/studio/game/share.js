/* ================= MACHHAR MAARO — WHATSAPP STATUS CARDS (pro) =================
   2 card: (1) MERA RECORD — lifetime kitne machhar maare  (2) LEVEL JEET — is level ka score
   Share dabate hi neeche se sheet: dono ka preview, jo pasand ho woh bhejo.
================================================================================ */
const SH_RANKS = [[0, 'RACKET ROOKIE'], [100, 'STREET HUNTER'], [300, 'BLOCK PROTECTOR'], [700, 'SLEEP GUARDIAN'], [1500, 'MOSQUITO DOOM'], [3000, 'BUZZ BUSTER'], [6000, 'RACKET KING']];
const BRAG = ['Papa has no idea I saved his sleep 😎', 'Night shift all night, zero credit in the morning 😤', 'Mosquitoes change route when they see me 😏', 'Mosquitoes are BANNED from my house 🚫'];
const SHARE = {
  stats() {
    const st = SAVE.stars || {}, perfect = Object.values(st).filter(v => v >= 3).length;
    const tk = SAVE.tk || 0, rank = SH_RANKS.filter(r => tk >= r[0]).pop()[1], k = NASHA.K();
    return { tk, rank, perfect, combo: SAVE.bestCombo || 0, kallu: k.kills || 0, lvl: Math.max(1, (SAVE.unlocked || 1) - 1), name: (SAVE.pname && SAVE.pname !== 'Player' ? SAVE.pname : 'RACKET HERO').toUpperCase(), av: SAVE.avatar || '🦸‍♂️' };
  },
  img: null,
  kallu() { return new Promise(r => { if (this.img) return r(this.img); const im = new Image(); im.onload = () => { this.img = im; r(im); }; im.onerror = () => r(null); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(KALLU_SVG.replace('<svg ', '<svg width="400" height="420" ')); }); },
  /* ---------- shared premium base ---------- */
  base(c, W2, H2) {
    const bg = c.createRadialGradient(W2 * 0.5, H2 * 0.36, 40, W2 * 0.5, H2 * 0.5, H2 * 0.85); bg.addColorStop(0, '#8a5cf0'); bg.addColorStop(0.32, '#4d22b8'); bg.addColorStop(0.7, '#1c0a4f'); bg.addColorStop(1, '#07031a'); c.fillStyle = bg; c.fillRect(0, 0, W2, H2);
    // light beams
    c.save(); c.globalCompositeOperation = 'lighter'; c.translate(W2 / 2, H2 * 0.36);
    for (let i = 0; i < 18; i++) { c.rotate(Math.PI / 9); const g = c.createLinearGradient(0, 0, 0, -1400); g.addColorStop(0, 'rgba(255,255,255,.10)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.lineTo(-48, -1400); c.lineTo(48, -1400); c.fill(); }
    c.restore();
    // halftone bottom
    c.save(); c.fillStyle = 'rgba(0,0,0,.22)'; for (let y = H2 * 0.62; y < H2; y += 22) for (let x = (y / 22 % 2) * 11; x < W2; x += 22) { const r = 2 + (y - H2 * 0.62) / (H2 * 0.38) * 6; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } c.restore();
    // faded mosquito tally (X marks)
    c.save(); c.globalAlpha = 0.09; c.font = '64px Poppins'; c.textAlign = 'center'; const rr = seeded(7); for (let i = 0; i < 22; i++) { const x = rr() * W2, y = rr() * H2; c.fillText('🦟', x, y); c.strokeStyle = '#fff'; c.lineWidth = 6; c.beginPath(); c.moveTo(x - 30, y - 50); c.lineTo(x + 30, y + 10); c.moveTo(x + 30, y - 50); c.lineTo(x - 30, y + 10); c.stroke(); } c.restore();
    // frame
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 4; c.beginPath(); c.roundRect(36, 36, W2 - 72, H2 - 72, 48); c.stroke();
    // logo
    c.textAlign = 'center'; c.textBaseline = 'middle';
    this.txt(c, 'MACHHAR MAARO', W2 / 2, 140, 62, '#fff', 900, '#2a1270', 10);
    c.font = '800 26px Poppins'; c.fillStyle = 'rgb(127,212,255)'; c.fillText('⚡  INDIA\'S RACKET GAME  ⚡', W2 / 2, 200);
  },
  txt(c, t, x, y, size, col, wt = 900, stroke, sw = 0, glow) {
    c.font = `${wt} ${size}px Poppins`; if (stroke) { c.lineJoin = 'round'; c.lineWidth = sw; c.strokeStyle = stroke; c.strokeText(t, x, y); }
    if (glow) { c.save(); c.shadowColor = glow; c.shadowBlur = size * 0.45; c.fillStyle = col; c.fillText(t, x, y); c.restore(); }
    c.fillStyle = col; c.fillText(t, x, y);
  },
  star(c, x, y, r, on) { c.save(); c.translate(x, y); c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); if (on) { c.shadowColor = 'rgba(127,212,255,.9)'; c.shadowBlur = 30; const g = c.createLinearGradient(0, -r, 0, r); g.addColorStop(0, '#fff'); g.addColorStop(1, '#c7b0ff'); c.fillStyle = g; } else c.fillStyle = 'rgba(255,255,255,.18)'; c.fill(); c.shadowBlur = 0; c.lineWidth = 5; c.strokeStyle = '#fff'; c.stroke(); c.restore(); },
  player(c, W2, y, s) {
    c.font = '800 40px Poppins'; const nm = s.name, w = Math.max(420, c.measureText(nm).width + 200);
    c.fillStyle = 'rgba(10,4,30,.55)'; c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 3; c.beginPath(); c.roundRect(W2 / 2 - w / 2, y - 52, w, 104, 52); c.fill(); c.stroke();
    c.font = '64px Poppins'; c.fillText(s.av, W2 / 2 - w / 2 + 60, y + 4);
    c.textAlign = 'left'; this.txt(c, nm, W2 / 2 - w / 2 + 112, y - 12, 40, '#fff', 900); c.font = '800 24px Poppins'; c.fillStyle = 'rgb(127,212,255)'; c.fillText('🏆 ' + s.rank, W2 / 2 - w / 2 + 112, y + 26); c.textAlign = 'center';
  },
  tiles(c, W2, y, arr) {
    const w = 290, gap = 24, x0 = W2 / 2 - (w * 3 + gap * 2) / 2;
    arr.forEach(([ic, val, lab], i) => { const x = x0 + i * (w + gap); c.fillStyle = 'rgba(255,255,255,.08)'; c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 3; c.beginPath(); c.roundRect(x, y, w, 190, 34); c.fill(); c.stroke(); c.fillStyle = '#fff'; c.font = '54px Poppins'; c.fillText(ic, x + w / 2, y + 50); this.txt(c, String(val), x + w / 2, y + 112, 58, '#fff', 900); c.font = '700 24px Poppins'; c.fillStyle = '#d9ccff'; c.fillText(lab, x + w / 2, y + 160); });
  },
  challenge(c, W2, y, big, small) {
    const g = c.createLinearGradient(0, y, 0, y + 230); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#e4daff'); c.fillStyle = g; c.shadowColor = 'rgba(127,212,255,.7)'; c.shadowBlur = 40; c.beginPath(); c.roundRect(90, y, W2 - 180, 230, 60); c.fill(); c.shadowBlur = 0;
    let fz = 76; c.font = `900 ${fz}px Poppins`; while (c.measureText(big).width > W2 - 260 && fz > 40) { fz -= 2; c.font = `900 ${fz}px Poppins`; } this.txt(c, big, W2 / 2, y + 90, fz, '#3b14a8', 900); c.font = '800 34px Poppins'; c.fillStyle = '#743ae8'; c.fillText(small, W2 / 2, y + 168);
  },
  footer(c, W2, H2) { c.font = '800 30px Poppins'; c.fillStyle = '#fff'; c.fillText('📲 Search "Machhar Maaro" on the Play Store', W2 / 2, H2 - 150); c.font = '700 26px Poppins'; c.fillStyle = '#b9a6ef'; c.fillText('A SANX Graphikians Game', W2 / 2, H2 - 100); },
  async kalluArt(c, x, y, w, stamp) {
    const im = await this.kallu(); if (!im) return; c.save(); c.translate(x, y); c.rotate(-0.12); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 40; c.drawImage(im, -w / 2, -w * 0.525, w, w * 1.05); c.restore();
    if (stamp) { c.save(); c.translate(x + 10, y + w * 0.12); c.rotate(-0.28); c.strokeStyle = '#fff'; c.lineWidth = 10; c.fillStyle = 'rgba(116,58,232,.85)'; c.font = '900 50px Poppins'; const sw2 = c.measureText(stamp).width + 70; c.beginPath(); c.roundRect(-sw2 / 2, -52, sw2, 104, 20); c.fill(); c.stroke(); this.txt(c, stamp, 0, 4, 50, '#fff', 900); c.restore(); }
  },
  /* ---------- card 1: lifetime record ---------- */
  async recordCard() {
    const W2 = 1080, H2 = 1920, cv2 = document.createElement('canvas'); cv2.width = W2; cv2.height = H2; const c = cv2.getContext('2d'), s = this.stats();
    this.base(c, W2, H2); this.player(c, W2, 320, s);
    await this.kalluArt(c, W2 * 0.8, 600, 360, s.kallu ? 'DEFEATED 😵' : 'WANTED 😈');
    c.textAlign = 'center';
    this.txt(c, 'I SWATTED', W2 * 0.36, 500, 70, '#e2d6ff', 900, '#2a1270', 10);
    const num = fmt(s.tk); let fs = 230; c.font = `900 ${fs}px Poppins`; while (c.measureText(num).width > W2 * 0.6 && fs > 120) { fs -= 6; c.font = `900 ${fs}px Poppins`; }
    this.txt(c, num, W2 * 0.36, 680, fs, '#fff', 900, '#2a1270', 18, 'rgba(127,212,255,.9)');
    this.txt(c, 'MOSQUITOES', W2 * 0.36, 850, 64, '#fff', 900, '#2a1270', 10);
    c.font = '60px Poppins'; c.fillText('🦟⚡💥', W2 * 0.36, 940);
    this.tiles(c, W2, 1040, [['🔥', s.combo, 'BEST COMBO'], ['⭐', s.perfect, 'PERFECT NIGHTS'], ['😈', s.kallu, 'KALLU BEATEN']]);
    c.font = 'italic 700 34px Poppins'; c.fillStyle = '#e2d6ff'; c.fillText('"' + BRAG[(s.tk + s.perfect) % BRAG.length] + '"', W2 / 2, 1310);
    this.challenge(c, W2, 1390, 'HOW MANY DID YOU GET? 🤔', `Beat my record of ${fmt(s.tk)} 😏`);
    this.footer(c, W2, H2); return cv2;
  },
  /* ---------- card 2: this level ---------- */
  async levelCard() {
    const W2 = 1080, H2 = 1920, cv2 = document.createElement('canvas'); cv2.width = W2; cv2.height = H2; const c = cv2.getContext('2d'), s = this.stats();
    const ch = CHARS[CW.cid] || { e: '😴', n: 'Papa' }, who = ch.secret ? 'SOMEONE SPECIAL' : ch.n.toUpperCase(), st = SAVE.stars[CL.n] || 0;
    this.base(c, W2, H2); this.player(c, W2, 320, s);
    c.textAlign = 'center'; c.font = '800 34px Poppins'; c.fillStyle = 'rgb(127,212,255)'; c.fillText(`LEVEL ${CL.n} · ${WORLDS[CL.w].name.toUpperCase()}`, W2 / 2, 450);
    this.txt(c, `${who}\'S SLEEP`, W2 / 2, 545, 82, '#fff', 900, '#2a1270', 12);
    this.txt(c, 'IS SAVED! 😴', W2 / 2, 650, 104, '#fff', 900, '#2a1270', 14, 'rgba(154,109,245,.9)');
    [0, 1, 2].forEach(i => this.star(c, W2 / 2 + (i - 1) * 190, 800 + (i === 1 ? -20 : 0), i === 1 ? 92 : 74, i < st));
    c.fillStyle = 'rgba(10,4,30,.5)'; c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 3; c.beginPath(); c.roundRect(150, 920, W2 - 300, 290, 50); c.fill(); c.stroke();
    c.font = '800 30px Poppins'; c.fillStyle = '#cbb8ff'; c.fillText('SCORE', W2 / 2, 975);
    this.txt(c, fmt(G.score), W2 / 2, 1080, 150, '#fff', 900, null, 0, 'rgba(127,212,255,.8)');
    c.font = '700 30px Poppins'; c.fillStyle = '#e2d6ff'; c.fillText(`🦟 ${G.kills} swatted  ·  🔥 ${G.st.maxCombo} combo  ·  🌪️ ${G.st.air} air`, W2 / 2, 1170);
    await this.kalluArt(c, W2 * 0.2, 1350, 250, null);
    c.textAlign = 'left'; c.font = 'italic 700 34px Poppins'; c.fillStyle = '#fff'; const b = BRAG[CL.n % BRAG.length]; c.fillText(b.length > 34 ? b.slice(0, b.lastIndexOf(' ', 34)) : b, 380, 1330); if (b.length > 34) c.fillText(b.slice(b.lastIndexOf(' ', 34) + 1), 380, 1378); c.textAlign = 'center';
    this.challenge(c, W2, 1470, 'BET YOU CAN NOT 😏', `Beat ${fmt(G.score)} on Level ${CL.n}`);
    this.footer(c, W2, H2); return cv2;
  },
  /* ---------- picker sheet ---------- */
  async open() {
    META.x('Social Proof + Identity (Brag card)');
    const hasLv = typeof CL !== 'undefined' && CL && G.score > 0 && typeof CW !== 'undefined' && CW;
    const [a, b] = await Promise.all([this.recordCard(), hasLv ? this.levelCard() : null]);
    const sh = sheet(`<div class="kick">POST TO YOUR STATUS 📲</div><div class="big" style="font-size:22px;margin-top:4px">Which card will you send?</div>
      <div class="shPick" style="${b ? '' : 'grid-template-columns:1fr;max-width:220px;margin-left:auto;margin-right:auto'}"><button data-k="0"><img src="${a.toDataURL('image/jpeg', 0.7)}"><b>🦟 My Record</b></button>${b ? `<button data-k="1"><img src="${b.toDataURL('image/jpeg', 0.7)}"><b>⭐ Level Win</b></button>` : ''}</div>`);
    sh.querySelectorAll('[data-k]').forEach(btn => btn.onclick = () => { sh.className = ''; this.send(btn.dataset.k === '0' ? a : b, btn.dataset.k === '0'); });
  },
  send(cv2, rec) {
    const s = this.stats(), text = rec ? `I swatted ${fmt(s.tk)} mosquitoes 🦟⚡ How many can you get? 😏 Play Machhar Maaro and beat my record! ${window.R7 ? R7.shareLink() : ''}` : META.shareText();
    cv2.toBlob(async b => {
      const f = new File([b], 'machhar-maaro.png', { type: 'image/png' });
      try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], text }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
      const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'machhar-maaro-status.png'; a.click();
      try { navigator.clipboard.writeText(text); } catch (e) { }
      toast('📸 Image saved. Post it on WhatsApp!');
    }, 'image/png');
  }
};
/* lifetime record */
const _sKill = window.kill; window.kill = function (m, how) { const was = m.dead; _sKill.apply(this, arguments); if (!was && m.dead && !m.decoy) { SAVE.tk = (SAVE.tk || 0) + 1; if (G.combo > (SAVE.bestCombo || 0)) SAVE.bestCombo = G.combo; } };
NASHA.share = () => SHARE.open();
document.querySelectorAll('.sharebtn').forEach(b => b.onclick = () => SHARE.open());

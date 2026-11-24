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
  const FT = s => `${Math.round(s)}px 'Lilita One', Inter, sans-serif`;     // game display font (headlines)
  const FN = s => `${Math.round(s)}px Anton, Inter, sans-serif`;            // numbers
  /* hue rotate + brightness of a hex colour (same maths as the CSS filter, done once and cached) */
  const HS = new Map();
  function hueShift(hex, deg, br) {
    const key = hex + deg + br; if (HS.has(key)) return HS.get(key);
    let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    const a = deg * Math.PI / 180, c = Math.cos(a), s2 = Math.sin(a);
    const m = [0.213 + c * 0.787 - s2 * 0.213, 0.715 - c * 0.715 - s2 * 0.715, 0.072 - c * 0.072 + s2 * 0.928, 0.213 - c * 0.213 + s2 * 0.143, 0.715 + c * 0.285 + s2 * 0.140, 0.072 - c * 0.072 - s2 * 0.283, 0.213 - c * 0.213 - s2 * 0.787, 0.715 - c * 0.715 + s2 * 0.715, 0.072 + c * 0.928 + s2 * 0.072];
    const f = v => Math.max(0, Math.min(255, Math.round(v * br))).toString(16).padStart(2, '0');
    const out = '#' + f(m[0] * r + m[1] * g + m[2] * b) + f(m[3] * r + m[4] * g + m[5] * b) + f(m[6] * r + m[7] * g + m[8] * b);
    HS.set(key, out); return out;
  }
  function rr(x, a, b, w, h, r) { r = Math.min(r, w / 2, h / 2); x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
  function mul(seed) { let t = seed >>> 0; return () => { t = (t + 0x6D2B79F5) >>> 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }
  function makeSeq(rng, n, g) { const s = []; while (s.length < n) { const v = Math.floor(rng() * g * g); if (s.length && v === s[s.length - 1]) continue; s.push(v); } return s; }
  function wrap(x, txt, max) { const w = String(txt).split(' '), out = []; let cur = ''; for (const s of w) { const tr = cur ? cur + ' ' + s : s; if (x.measureText(tr).width > max && cur) { out.push(cur); cur = s; } else cur = tr; } if (cur) out.push(cur); return out; }

  /* ================= LOOK (variation) =================
     A variation changes the whole feel, not just the pattern: world, colour mood, headline type,
     camera style and transitions. Variation 1 = the style's signature look. */
  const LOOKS = {
    worlds: ['arena', 'studio', 'versus', 'club', 'space', 'tunnel', 'aurora'],
    types: ['gloss', 'neon', 'block', 'slant'],
    moods: ['royal', 'midnight', 'electric'],
    cams: ['punch', 'calm', 'drift'],
    trans: ['flash', 'swipe', 'zoom', 'glitch'],
    frames: ['none', 'viewfinder', 'cinema', 'glow', 'grain'],
    skins: ['galaxy', 'neon', 'cyber', 'ocean', 'aurora', 'prism', 'storm', 'retro', 'candy', 'nature']
  };
  const NAMES = { arena: 'Arena', studio: 'Spotlight', versus: 'Versus', club: 'Club', space: 'Space', tunnel: 'Tunnel', aurora: 'Aurora', gloss: '3D Gloss', neon: 'Neon', block: 'Block', slant: 'Italic', royal: 'Royal', midnight: 'Midnight', electric: 'Electric', none: 'Clean', viewfinder: 'Camera frame', cinema: 'Cinema bars', glow: 'Glow frame', grain: 'Film grain', punch: 'Punchy cam', calm: 'Calm cam', drift: 'Handheld', flash: 'Flash cuts', swipe: 'Swipe cuts', zoom: 'Zoom cuts', glitch: 'Glitch cuts' };
  let LK = { type: 'gloss', mood: 'royal', cam: 'punch', trans: 'flash' };
  function look(style, v, world0) {
    v = Math.max(1, v | 0); const base = { world: world0, type: 'gloss', mood: 'royal', cam: 'punch', trans: 'flash' };
    base.frame = 'none';
    if (v === 1) return base;
    const h = hashS(style), r = mul(h + v * 7919), pick = a => a[Math.floor(r() * a.length)];
    const ws = LOOKS.worlds.filter(w => w !== world0), types = LOOKS.types.slice(1);
    return { world: ws[(v - 2 + (h % ws.length)) % ws.length], type: v % 4 === 0 ? 'gloss' : types[(v + h) % types.length], mood: LOOKS.moods[(v + (h >> 3)) % 3], cam: pick(LOOKS.cams), trans: LOOKS.trans[(v + (h >> 5)) % 4], frame: LOOKS.frames[1 + (v + (h >> 2)) % 4] };
  }
  const hashS = st => Math.abs([...String(st)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7));
  /* every variation also plays in a real shop skin (variation 1 keeps the player's / default skin) */
  const lookSkin = (style, v) => (v | 0) > 1 ? LOOKS.skins[(v - 2 + hashS(style)) % LOOKS.skins.length] : null;
  const S0 = { climb: 'arena', play: 'studio', duel: 'versus', rush: 'club', close: 'space', spot: 'studio', brag: 'arena', lose: 'tunnel', myrun: 'arena', dbeat: 'aurora' };
  function lookName(style, v) { const L = look(style, v, S0[style] || 'studio'), sk = lookSkin(style, v); return [NAMES[L.world], sk ? D.skin(sk).name + ' skin' : 'Classic skin', NAMES[L.frame], NAMES[L.type], NAMES[L.trans]].join(' · '); }

  /* ================= SPRITE CACHE =================
     Heavy, mostly static things (glows, shadows, phone frame, headline text) are drawn ONCE into an
     offscreen canvas at the output resolution and then just stamped every frame. Keeps every frame
     well under 33 ms so videos record smoothly at 30 fps even on ordinary laptops. */
  let RS = 0.5;                       // output pixels per design pixel (set every frame)
  const SPR = new Map();
  function sprite(key, w, h, draw, q = 1) {
    const k = key + '@' + RS.toFixed(3) + 'q' + q; let s2 = SPR.get(k);
    if (!s2) {
      if (SPR.size > 400) SPR.clear();
      const r = RS * q, c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w * r)); c.height = Math.max(1, Math.ceil(h * r));
      const g = c.getContext('2d'); g.scale(r, r); draw(g); s2 = { c, w, h }; SPR.set(k, s2);
    }
    return s2;
  }
  const stamp = (x, sp, X, Y, w = sp.w, h = sp.h) => x.drawImage(sp.c, X, Y, w, h);

  function canRecord() { return !!(window.MediaRecorder && HTMLCanvasElement.prototype.captureStream); }
  function pickMime() {
    for (const m of ['video/mp4;codecs=avc1.42E01F,mp4a.40.2', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']) { try { if (MediaRecorder.isTypeSupported(m)) return m; } catch (e) { } }
    return '';
  }

  /* ================= TIMELINE ================= */
  let SYNC = false;
  function TL(bpm) {
    const T = { segs: [], cues: [], cams: [{ t: 0, z: 1, x: 0, y: 0, d: 0 }], shakes: [], flashes: [], trs: [], fails: [], beat: 60 / bpm, bpm, end: 0, P: { kick: 0, pulse: 0 }, sync: SYNC };
    T.tr = t => T.trs.push(t);
    /* with a song every flash and tap sits on the song's beat grid (half beats at the fastest) */
    T.q = d => !T.sync ? d : Math.max(T.beat / 2, Math.round(d / (T.beat / 2)) * (T.beat / 2));
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
  /* five different "worlds" so the styles never look the same (all inside the brand purple) */
  function bg(x, A, t, wash, energy = 0.5, world = 'studio', beat = 0.6) {
    const base = x.createRadialGradient(W / 2, H * 0.42, 40, W / 2, H * 0.45, H * 0.9);
    const M = { royal: ['#41189a', '#1c0a4f', '#05011a'], midnight: ['#22105a', '#0c062c', '#020010'], electric: ['#5a22d0', '#25096a', '#08021f'] }[LK.mood] || ['#41189a', '#1c0a4f', '#05011a'];
    base.addColorStop(0, world === 'space' ? '#2b0e6b' : M[0]); base.addColorStop(0.5, world === 'club' ? '#14052f' : M[1]); base.addColorStop(1, M[2]);
    x.fillStyle = base; x.fillRect(-300, -300, W + 600, H + 600);
    x.save(); x.globalCompositeOperation = 'lighter';
    if (world === 'arena') {
      /* synthwave floor: perspective grid rushing toward the camera + horizon glow */
      const hy = H * 0.64, sp = (t * 0.9) % 1;
      const hg = x.createLinearGradient(0, hy - 260, 0, hy + 60); hg.addColorStop(0, 'rgba(154,109,245,0)'); hg.addColorStop(0.8, 'rgba(154,109,245,.45)'); hg.addColorStop(1, 'rgba(196,167,255,.0)');
      x.fillStyle = hg; x.fillRect(0, hy - 260, W, 320);
      x.strokeStyle = 'rgba(154,109,245,.55)'; x.lineWidth = 3;
      for (let k = 0; k < 14; k++) { const z = (k + sp) / 14, y = hy + Math.pow(z, 2.2) * (H - hy); x.globalAlpha = z; x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); }
      x.globalAlpha = 0.7; for (let k = -10; k <= 10; k++) { x.beginPath(); x.moveTo(W / 2 + k * 30, hy); x.lineTo(W / 2 + k * 260, H); x.stroke(); }
      x.globalAlpha = 1;
    } else if (world === 'versus') {
      /* diagonal energy split */
      x.save(); x.translate(W / 2, H / 2); x.rotate(-0.32);
      const sg = x.createLinearGradient(-60, 0, 60, 0); sg.addColorStop(0, 'rgba(154,109,245,0)'); sg.addColorStop(0.5, `rgba(214,196,255,${0.35 + 0.25 * Math.sin(t * 8)})`); sg.addColorStop(1, 'rgba(154,109,245,0)');
      x.fillStyle = sg; x.fillRect(-60, -H, 120, H * 2); x.restore();
      for (let k = 0; k < 12; k++) { const y = ((k * 173 + t * 420) % (H + 200)) - 100; x.strokeStyle = 'rgba(196,167,255,.18)'; x.lineWidth = 6; x.beginPath(); x.moveTo(-50, y); x.lineTo(W + 50, y - 340); x.stroke(); }
    } else if (world === 'club') {
      /* light bars + equalizer pumping on the beat */
      const ph = (t / beat) % 1, pump = Math.pow(1 - ph, 3);
      for (let k = 0; k < 7; k++) { const xx = (k + 0.5) * W / 7, a = 0.08 + 0.22 * pump * ((k + Math.floor(t / beat)) % 2); const bg2 = x.createLinearGradient(0, 0, 0, H); bg2.addColorStop(0, `rgba(154,109,245,${a})`); bg2.addColorStop(1, 'rgba(154,109,245,0)'); x.fillStyle = bg2; x.fillRect(xx - 46, 0, 92, H); }
      for (let k = 0; k < 24; k++) { const hh = 40 + (Math.sin(k * 1.7 + t * 6) * 0.5 + 0.5) * 220 * (0.4 + pump * 0.6); x.fillStyle = 'rgba(196,167,255,.28)'; rr(x, 20 + k * 43, H - hh - 20, 30, hh, 10); x.fill(); }
    } else if (world === 'tunnel') {
      /* rounded squares flying toward the camera, like flying through the board */
      for (let k = 0; k < 12; k++) {
        const z = ((k / 12) + t * 0.22) % 1, sc = Math.pow(z, 2.4) * 2.6, s2 = 220 + sc * 1100, a = Math.min(1, z * 1.6) * (1 - z) * 0.9;
        x.strokeStyle = `rgba(154,109,245,${a})`; x.lineWidth = 3 + sc * 10; rr(x, W / 2 - s2 / 2, H * 0.47 - s2 / 2, s2, s2, s2 * 0.18); x.stroke();
      }
      const cg = x.createRadialGradient(W / 2, H * 0.47, 0, W / 2, H * 0.47, 420); cg.addColorStop(0, 'rgba(196,167,255,.35)'); cg.addColorStop(1, 'rgba(196,167,255,0)'); x.fillStyle = cg; x.fillRect(0, 0, W, H);
    } else if (world === 'aurora') {
      /* slow silk ribbons of light */
      for (let k = 0; k < 4; k++) {
        x.beginPath(); const y0 = H * (0.22 + k * 0.17);
        for (let xx = -40; xx <= W + 40; xx += 40) { const y = y0 + Math.sin(xx * 0.004 + t * (0.5 + k * 0.17) + k) * 120 + Math.sin(xx * 0.011 - t * 0.7) * 40; xx === -40 ? x.moveTo(xx, y) : x.lineTo(xx, y); }
        x.lineTo(W + 40, y0 + 380); x.lineTo(-40, y0 + 380); x.closePath();
        const ag = x.createLinearGradient(0, y0 - 160, 0, y0 + 380); ag.addColorStop(0, `rgba(${k % 2 ? '154,109,245' : '116,58,232'},0)`); ag.addColorStop(0.35, `rgba(${k % 2 ? '154,109,245' : '196,167,255'},${0.18 + energy * 0.1})`); ag.addColorStop(1, 'rgba(116,58,232,0)');
        x.fillStyle = ag; x.fill();
      }
    } else if (world === 'space') {
      for (const d of A.stars) { const tw = 0.5 + 0.5 * Math.sin(t * d.s + d.x); x.fillStyle = `rgba(230,220,255,${d.a * tw})`; x.beginPath(); x.arc((d.x + t * d.v) % W, d.y, d.r, 0, 7); x.fill(); }
      const nb = x.createRadialGradient(W * 0.7, H * 0.25, 10, W * 0.7, H * 0.25, 520); nb.addColorStop(0, 'rgba(154,109,245,.35)'); nb.addColorStop(1, 'rgba(154,109,245,0)'); x.fillStyle = nb; x.fillRect(0, 0, W, H);
      const nb2 = x.createRadialGradient(W * 0.2, H * 0.8, 10, W * 0.2, H * 0.8, 600); nb2.addColorStop(0, 'rgba(116,58,232,.35)'); nb2.addColorStop(1, 'rgba(116,58,232,0)'); x.fillStyle = nb2; x.fillRect(0, 0, W, H);
    } else {
      for (let k = 0; k < 4; k++) {
        const ang = Math.sin(t * (0.3 + energy * 0.5) + k * 1.7) * 0.4 + (k - 1.5) * 0.42, cx = W / 2 + (k - 1.5) * W * 0.26;
        x.save(); x.translate(cx, -120); x.rotate(ang);
        const bgr = x.createLinearGradient(0, 0, 0, H * 1.2); bgr.addColorStop(0, `rgba(154,109,245,${0.14 + energy * 0.14})`); bgr.addColorStop(1, 'rgba(154,109,245,0)');
        x.fillStyle = bgr; x.beginPath(); x.moveTo(-40, 0); x.lineTo(40, 0); x.lineTo(240, H * 1.2); x.lineTo(-240, H * 1.2); x.closePath(); x.fill(); x.restore();
      }
    }
    if (world !== 'space') for (const d of A.dust) { const y = ((d.y - t * d.s * (1 + energy)) % H + H) % H; x.fillStyle = `rgba(214,196,255,${d.a * 0.8})`; x.beginPath(); x.arc(d.x + Math.sin(t + d.y) * 8, y, d.r, 0, 7); x.fill(); }
    x.restore();
    if (wash && wash.a > 0.01) { const w = x.createRadialGradient(W / 2, H * 0.52, 20, W / 2, H * 0.52, H * 0.62); w.addColorStop(0, wash.c + '55'); w.addColorStop(1, wash.c + '00'); x.globalAlpha = wash.a; x.fillStyle = w; x.fillRect(0, 0, W, H); x.globalAlpha = 1; }
  }
  function vignette(x, red = 0) {
    const vs = sprite('vig', W, H, g => { const v = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.78); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = v; g.fillRect(0, 0, W, H); }, 0.5);
    stamp(x, vs, 0, 0, W, H);
    if (red > 0.01) { const rv = sprite('vigR', W, H, g => { const v = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.78); v.addColorStop(0, 'rgba(170,0,35,0)'); v.addColorStop(1, 'rgba(170,0,35,.85)'); g.fillStyle = v; g.fillRect(0, 0, W, H); }, 0.5); x.save(); x.globalAlpha = Math.min(1, red); stamp(x, rv, 0, 0, W, H); x.restore(); }
  }
  function bigText(x, t, X, Y, size, o = {}) {
    if (o._raw || !t || size < 6) return bigTextRaw(x, t, X, Y, size, o);
    const { max = 940, align = 'center', font = 'title' } = o, fnt = v => font === 'num' ? FN(v) : FT(v);
    let sz = Math.round(size); x.font = fnt(sz); let tw = x.measureText(t).width; while (tw > max && sz > 20) { sz -= 3; x.font = fnt(sz); tw = x.measureText(t).width; }
    const ty = o.type || LK.type, key = ['T', t, sz, ty, o.c1, o.c2, o.glow, o.stroke, font].join('|');
    const pad = sz * 0.75, w = tw + pad * 2 + sz * 0.25, h = sz * 1.9;
    const sp = sprite(key, w, h, g => { g.font = fnt(sz); bigTextRaw(g, t, pad, sz * 1.2, sz, Object.assign({}, o, { align: 'left', max: 1e9, type: ty })); }, 1.15);
    const ox = align === 'center' ? tw / 2 + pad : align === 'right' ? tw + pad : pad;
    stamp(x, sp, X - ox, Y - sz * 1.2);
    return sz;
  }
  function bigTextRaw(x, t, X, Y, size, o = {}) {
    const { max = 940, c1 = '#ffffff', c2 = '#e3d4ff', glow = 0.35, align = 'center', font = 'title' } = o;
    let sz = size; const fnt = v => font === 'num' ? FN(v) : FT(v);
    x.font = fnt(sz); while (x.measureText(t).width > max && sz > 20) { sz -= 3; x.font = fnt(sz); }
    x.textAlign = align; x.textBaseline = 'alphabetic'; x.lineJoin = 'round'; x.miterLimit = 2;
    const ty = o.type || LK.type;
    if (ty === 'neon') {
      x.shadowColor = 'rgba(154,109,245,1)'; x.shadowBlur = sz * 0.55; x.strokeStyle = '#9a6df5'; x.lineWidth = sz * 0.1; x.strokeText(t, X, Y); x.strokeText(t, X, Y);
      x.shadowBlur = sz * 0.2; x.shadowColor = '#c4a7ff'; x.fillStyle = o.c2 && o.c2 !== '#e3d4ff' && o.c2 !== '#e6d8ff' ? o.c2 : '#ffffff'; x.fillText(t, X, Y); x.shadowBlur = 0; x.shadowColor = 'transparent';
      x.lineWidth = Math.max(2, sz * 0.025); x.strokeStyle = 'rgba(255,255,255,.9)'; x.strokeText(t, X, Y); return sz;
    }
    if (ty === 'block') {
      x.fillStyle = '#2b0e6b'; x.fillText(t, X + sz * 0.07, Y + sz * 0.1); x.fillStyle = '#743ae8'; x.fillText(t, X + sz * 0.035, Y + sz * 0.05);
      x.fillStyle = o.c2 && o.c2 !== '#e3d4ff' && o.c2 !== '#e6d8ff' ? o.c2 : '#ffffff'; x.fillText(t, X, Y); return sz;
    }
    if (ty === 'slant' && !o._sl) { x.save(); x.translate(X, Y); x.transform(1, 0, -0.2, 1, 0, 0); const r2 = bigTextRaw(x, t, 0, 0, sz, Object.assign({}, o, { _sl: 1, type: 'gloss' })); x.restore(); return r2; }
    /* hard 3D drop */
    x.fillStyle = '#12052f'; x.strokeStyle = '#12052f'; x.lineWidth = sz * 0.2;
    x.strokeText(t, X, Y + sz * 0.1); x.fillText(t, X, Y + sz * 0.1);
    /* outline */
    if (glow) { x.shadowColor = 'rgba(154,109,245,.85)'; x.shadowBlur = sz * glow; }
    x.strokeStyle = o.stroke || '#3b1580'; x.lineWidth = sz * 0.16; x.strokeText(t, X, Y);
    x.shadowBlur = 0; x.shadowColor = 'transparent';
    const gr = x.createLinearGradient(0, Y - sz * 0.85, 0, Y); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
    x.fillStyle = gr; x.fillText(t, X, Y);
    /* glossy top shine */
    x.save(); x.beginPath(); x.rect(X - 2000, Y - sz * 0.9, 4000, sz * 0.42); x.clip(); x.fillStyle = 'rgba(255,255,255,.35)'; x.fillText(t, X, Y); x.restore();
    return sz;
  }
  function sub(x, t, X, Y, size, col = '#efe6ff', w = 800) { x.font = F(w, size); x.fillStyle = col; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.shadowColor = 'rgba(0,0,0,.55)'; x.shadowBlur = 12; x.fillText(t, X, Y); x.shadowBlur = 0; }
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
  /* the board: the SAME tiles as the game (skin colours + icons, dark veil, lit glow) */
  function board(x, A, t, st) {
    const g = st.g || 3, size = st.size || 860, cx = st.cx != null ? st.cx : W / 2, cy = st.cy != null ? st.cy : 1000, gap = size * (g >= 5 ? 0.024 : 0.032), pad = size * 0.04, ts = (size - gap * (g - 1)) / g;
    const colors = A.colors, pos = [];
    x.save(); x.translate(cx, cy); x.translate(-size / 2, -size / 2);
    x.globalAlpha = st.alpha == null ? 1 : st.alpha;
    x.fillStyle = 'rgba(10,4,30,.62)'; rr(x, -pad, -pad, size + pad * 2, size + pad * 2, size * 0.075); x.fill();
    x.strokeStyle = st.wrong != null ? `rgba(255,45,90,${0.5 + 0.5 * (st.wrongA || 0)})` : 'rgba(154,109,245,.55)'; x.lineWidth = 3; x.stroke();
    for (let i = 0; i < g * g; i++) {
      const r = Math.floor(i / g), c = i % g, X = c * (ts + gap), Y = r * (ts + gap), k = i % 9, v = Math.floor(i / 9), col = v ? hueShift(colors[k], v === 1 ? 28 : -30, v === 1 ? 1.08 : 0.92) : colors[k];
      const L = (st.lit && st.lit[i]) || 0, P = (st.press && st.press[i]) || 0, isW = st.wrong === i ? Math.max(0.35, st.wrongA || 0) : 0, on = Math.max(L, P);
      pos[i] = { x: cx + X + ts / 2 - size / 2, y: cy + Y + ts / 2 - size / 2, s: ts };
      const sc = 1 + L * 0.06 - P * 0.05, R = ts * 0.22;
      x.save(); x.translate(X + ts / 2, Y + ts / 2); x.scale(sc, sc); x.translate(-ts / 2, -ts / 2);

      if (L > 0.02) { const gw = x.createRadialGradient(ts / 2, ts / 2, ts * 0.35, ts / 2, ts / 2, ts * 0.95); gw.addColorStop(0, col); gw.addColorStop(1, col.length === 7 ? col + '00' : 'rgba(0,0,0,0)'); x.save(); x.globalAlpha *= 0.85 * L; x.fillStyle = gw; x.fillRect(-ts * 0.5, -ts * 0.5, ts * 2, ts * 2); x.restore(); }
      x.fillStyle = isW ? '#ff2d5a' : col; rr(x, 0, 0, ts, ts, R); x.fill();
      x.save(); rr(x, 0, 0, ts, ts, R); x.clip();
      /* inner bevel like the app: light top edge, dark bottom edge */
      x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(0, 0, ts, ts * 0.035);
      x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(0, ts - ts * 0.07, ts, ts * 0.07);
      /* dark veil (tile is "off") */
      x.fillStyle = `rgba(10,4,30,${0.66 * (1 - on) * (isW ? 0 : 1)})`; x.fillRect(0, 0, ts, ts);
      /* icon */
      const ic = A.icons[v ? 9 + ((i - 9) % 16) : k];
      if (ic) { const s2 = ts * (g >= 5 ? 0.46 : 0.42); x.globalAlpha *= 0.55 + 0.45 * on; x.drawImage(ic, (ts - s2) / 2, (ts - s2) / 2, s2, s2); x.globalAlpha = st.alpha == null ? 1 : st.alpha; }
      /* lit glow */
      if (L > 0) { const gl = x.createRadialGradient(ts / 2, ts / 2, 0, ts / 2, ts / 2, ts * 0.8); gl.addColorStop(0, `rgba(255,255,255,${0.45 * L})`); gl.addColorStop(0.6, 'rgba(255,255,255,0)'); x.fillStyle = gl; x.fillRect(0, 0, ts, ts); }
      if (P > 0.3 || L > 0.85) { x.strokeStyle = `rgba(255,255,255,${Math.max(P, L)})`; x.lineWidth = ts * 0.06; rr(x, ts * 0.03, ts * 0.03, ts * 0.94, ts * 0.94, R * 0.9); x.stroke(); }
      x.restore();
      if (st.newT === i && L > 0) { x.font = F(900, ts * 0.1); const tw = x.measureText('NEW').width + ts * 0.1; x.fillStyle = '#fff'; rr(x, ts / 2 - tw / 2, ts * 0.06, tw, ts * 0.15, ts * 0.04); x.fill(); x.fillStyle = '#743ae8'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('NEW', ts / 2, ts * 0.135); x.textBaseline = 'alphabetic'; }
      if (isW) { x.strokeStyle = '#fff'; x.lineWidth = ts * 0.07; x.lineCap = 'round'; x.beginPath(); x.moveTo(ts * 0.32, ts * 0.32); x.lineTo(ts * 0.68, ts * 0.68); x.moveTo(ts * 0.68, ts * 0.32); x.lineTo(ts * 0.32, ts * 0.68); x.stroke(); }
      if (st.nums && st.nums[i] != null) { const txt = String(st.nums[i]); x.fillStyle = 'rgba(10,4,30,.55)'; rr(x, ts * 0.18, ts * 0.18, ts * 0.64, ts * 0.64, ts * 0.32); x.fill(); x.font = FN(ts * (txt.length > 3 ? 0.22 : 0.4)); x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, ts / 2, ts / 2 + ts * 0.02); x.textBaseline = 'alphabetic'; }
      x.restore();
    }
    x.restore();
    return { pos, top: cy - size / 2 - pad, bottom: cy + size / 2 + pad, ts };
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
    const img = A.sanx[s.mood] || A.sanx.smug, k = eBack((t - s.t0) / 0.45), X = s.x || 150, Y = s.y || 1710, R = s.r || 100;
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
    if (!(R > 8)) return;
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
  /* realistic phone (titanium frame, thin bezel, dynamic island, glass) with the real game screen inside */
  function phone(x, A, t, cx, cy, ph, rot, o = {}) {
    const P0 = 860, pw = P0 * 0.475, X = -pw / 2, Y = -P0 / 2, R = pw * 0.17, pad = 140;
    const sp = pw * 0.045, SX = X + sp, SY = Y + sp, SW = pw - sp * 2, SH = P0 - sp * 2, SR = R - sp;
    /* static back layer: shadow, rim light, side buttons, titanium frame, black bezel */
    const back = sprite('phoneBack', pw + pad * 2, P0 + pad * 2, g => {
      g.translate(pad + pw / 2, pad + P0 / 2);
      g.save(); g.shadowColor = 'rgba(0,0,0,.65)'; g.shadowBlur = 90; g.shadowOffsetY = 40; g.fillStyle = '#000'; rr(g, X, Y, pw, P0, R); g.fill(); g.restore();
      g.save(); g.shadowColor = 'rgba(154,109,245,.75)'; g.shadowBlur = 70; g.strokeStyle = 'rgba(154,109,245,.5)'; g.lineWidth = 2; rr(g, X, Y, pw, P0, R); g.stroke(); g.restore();
      g.fillStyle = '#4a4360'; rr(g, X - 5, Y + P0 * 0.2, 7, P0 * 0.06, 3); g.fill(); rr(g, X - 5, Y + P0 * 0.29, 7, P0 * 0.1, 3); g.fill(); rr(g, X + pw - 2, Y + P0 * 0.25, 7, P0 * 0.13, 3); g.fill();
      const fg = g.createLinearGradient(X, 0, X + pw, 0); fg.addColorStop(0, '#2d2840'); fg.addColorStop(0.08, '#9d96b8'); fg.addColorStop(0.2, '#3b3552'); fg.addColorStop(0.8, '#3b3552'); fg.addColorStop(0.93, '#a59ec2'); fg.addColorStop(1, '#2d2840');
      g.fillStyle = fg; rr(g, X, Y, pw, P0, R); g.fill();
      const bz = pw * 0.022; g.fillStyle = '#05030a'; rr(g, X + bz, Y + bz, pw - bz * 2, P0 - bz * 2, R - bz); g.fill();
    });
    /* static front layer: glass reflection + dynamic island */
    const front = sprite('phoneFront', pw, P0, g => {
      g.translate(pw / 2, P0 / 2);
      g.save(); rr(g, SX, SY, SW, SH, SR); g.clip();
      const gl = g.createLinearGradient(SX, SY, SX + SW, SY + SH * 0.55); gl.addColorStop(0, 'rgba(255,255,255,.16)'); gl.addColorStop(0.42, 'rgba(255,255,255,.04)'); gl.addColorStop(0.43, 'rgba(255,255,255,0)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gl; g.fillRect(SX, SY, SW, SH); g.restore();
      g.fillStyle = '#000'; rr(g, -SW * 0.15, SY + SW * 0.035, SW * 0.3, SW * 0.085, SW * 0.0425); g.fill();
      g.fillStyle = '#1b1530'; g.beginPath(); g.arc(SW * 0.09, SY + SW * 0.0775, SW * 0.018, 0, 7); g.fill();
    });
    x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(ph / P0, ph / P0);
    stamp(x, back, X - pad, Y - pad);
    x.save(); rr(x, SX, SY, SW, SH, SR); x.clip(); gameScreen(x, A, t, SX, SY, SW, SH, o); x.restore();
    stamp(x, front, X, Y);
    x.restore();
  }
  /* the app's game screen in miniature: status bar, HUD, prize, live board, streak bar */
  function gameScreen(x, A, t, X, Y, w, h, o) {
    const g = x.createLinearGradient(0, Y, 0, Y + h); g.addColorStop(0, '#1f0b52'); g.addColorStop(0.55, '#110630'); g.addColorStop(1, '#07031a'); x.fillStyle = g; x.fillRect(X, Y, w, h);
    const s = w / 390, cx = X + w / 2, L = X + 16 * s, Rt = X + w - 16 * s;
    x.fillStyle = '#fff'; x.font = F(700, 13 * s); x.textAlign = 'left'; x.fillText('9:41', L + 8 * s, Y + 30 * s);
    x.textAlign = 'right'; x.fillText('▮▮▮  5G  ▰▰▰▱', Rt - 6 * s, Y + 30 * s);
    /* top bar */
    x.fillStyle = 'rgba(255,255,255,.08)'; rr(x, L, Y + 52 * s, 40 * s, 40 * s, 12 * s); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 2.4 * s; x.beginPath(); x.moveTo(L + 14 * s, Y + 66 * s); x.lineTo(L + 26 * s, Y + 78 * s); x.moveTo(L + 26 * s, Y + 66 * s); x.lineTo(L + 14 * s, Y + 78 * s); x.stroke();
    x.textAlign = 'center'; x.font = FT(22 * s); x.fillStyle = '#fff'; x.fillText(o.level ? `LEVEL ${o.level}` : 'BOSS LEVEL', cx, Y + 74 * s); x.font = F(700, 10.5 * s); x.fillStyle = '#c9b6ff'; x.fillText(o.world || 'World 3 · Ice Cave', cx, Y + 90 * s);
    x.fillStyle = 'rgba(255,255,255,.08)'; rr(x, Rt - 84 * s, Y + 56 * s, 84 * s, 32 * s, 16 * s); x.fill(); coin(x, Rt - 66 * s, Y + 72 * s, 10 * s); x.font = F(900, 14 * s); x.fillStyle = '#fff'; x.textAlign = 'left'; x.fillText(o.coins || '2,480', Rt - 52 * s, Y + 77 * s);
    for (let i = 0; i < 3; i++) heart(x, L + 14 * s + i * 26 * s, Y + 124 * s, 20 * s, i < 3);
    x.fillStyle = 'rgba(116,58,232,.35)'; rr(x, Rt - 128 * s, Y + 110 * s, 128 * s, 28 * s, 14 * s); x.fill(); x.font = F(800, 11.5 * s); x.fillStyle = '#e4d7ff'; x.textAlign = 'center'; x.fillText('Round 3/3', Rt - 64 * s, Y + 128 * s);
    x.font = F(900, 12 * s); x.fillStyle = '#c4a7ff'; x.fillText('W A T C H', cx, Y + 186 * s);
    const k = Math.floor(t / 0.36), seqL = [5, 10, 3, 12, 6, 0, 15, 9], lit = {}; lit[seqL[k % seqL.length]] = 1 - ((t / 0.36) % 1) * 0.5;
    const n = Math.min(8, (k % seqL.length) + 1); x.font = FT(30 * s); x.fillStyle = '#fff'; x.fillText(`${n} / 8 TILES`, cx, Y + 224 * s);
    x.fillStyle = 'rgba(255,255,255,.12)'; rr(x, cx - 120 * s, Y + 238 * s, 240 * s, 8 * s, 4 * s); x.fill(); x.fillStyle = '#9a6df5'; rr(x, cx - 120 * s, Y + 238 * s, 240 * s * n / 8, 8 * s, 4 * s); x.fill();
    board(x, A, t, { g: 4, size: w * 0.86, cx, cy: Y + h * 0.62, lit });
    const by = Y + h - 58 * s, bg2 = x.createLinearGradient(L, 0, Rt, 0); bg2.addColorStop(0, '#743ae8'); bg2.addColorStop(1, '#9a6df5');
    x.fillStyle = 'rgba(255,255,255,.08)'; rr(x, L, by, Rt - L, 30 * s, 15 * s); x.fill(); x.fillStyle = bg2; rr(x, L, by, (Rt - L) * (0.55 + 0.25 * Math.sin(t * 1.3)), 30 * s, 15 * s); x.fill();
    x.font = F(900, 12 * s); x.fillStyle = '#fff'; x.textAlign = 'center'; x.fillText('HOT STREAK  ×3', cx, by + 20 * s);
  }
  /* PRO OUTRO: big realistic phone with the real game running, DOWNLOAD FREE button that gets pressed, Play badge */
  function endCard(x, A, t, t0, o) {
    const u = t - t0; if (u < 0) return;
    x.fillStyle = `rgba(5,1,20,${clamp(u / 0.35) * 0.6})`; x.fillRect(0, 0, W, H);
    /* soft light behind the phone */
    const cy = 905;
    const rays = sprite('rays10', 2000, 2000, g => { g.translate(1000, 1000); const gl = g.createRadialGradient(0, 0, 40, 0, 0, 760); gl.addColorStop(0, 'rgba(154,109,245,.45)'); gl.addColorStop(0.5, 'rgba(116,58,232,.18)'); gl.addColorStop(1, 'rgba(116,58,232,0)'); g.fillStyle = gl; g.fillRect(-1000, -1000, 2000, 2000); for (let k = 0; k < 10; k++) { g.rotate(Math.PI / 5); const gr = g.createLinearGradient(0, 0, 0, -1000); gr.addColorStop(0, 'rgba(154,109,245,.12)'); gr.addColorStop(1, 'rgba(154,109,245,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(-20, 0); g.lineTo(20, 0); g.lineTo(130, -1000); g.lineTo(-130, -1000); g.closePath(); g.fill(); } }, 0.35);
    x.save(); x.globalCompositeOperation = 'lighter'; x.globalAlpha = clamp(u / 0.6); x.translate(W / 2, cy); x.rotate(u * 0.12); stamp(x, rays, -1000, -1000); x.restore();
    if (A.logo) { const k = eBack(u / 0.5), s2 = 300 * k, h = s2 * A.logo.height / A.logo.width; x.globalAlpha = clamp(u / 0.2); x.drawImage(A.logo, (W - s2) / 2, 112, s2, h); x.globalAlpha = 1; }
    if (u > 0.3) slam(x, o.title || 'CAN YOU BEAT IT?', t0 + 0.3, t, W / 2, 352, 88, 99);
    if (u > 0.65) { x.globalAlpha = clamp((u - 0.65) / 0.3); sub(x, o.line || 'Think you can beat me?', W / 2, 418, 36, '#e9dcff', 700); x.globalAlpha = 1; }
    /* the phone slides up and settles at a slight angle */
    if (u > 0.35) {
      const k = eBack((u - 0.35) / 0.7), e = eOut((u - 0.35) / 0.7);
      x.save(); x.globalAlpha = clamp((u - 0.35) / 0.25);
      if (k > 0.05) { x.save(); x.translate(W / 2, 1352); x.scale(1, 26 / 230); const sg = x.createRadialGradient(0, 0, 0, 0, 0, 260 * k); sg.addColorStop(0, 'rgba(0,0,0,.55)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = sg; x.fillRect(-270 * k, -270 * k, 540 * k, 540 * k); x.restore(); }
      phone(x, A, t, W / 2 + (1 - e) * 120, cy + (1 - e) * 380 + Math.sin(u * 1.4) * 6, 860 * (0.85 + 0.15 * k), -0.055 - (1 - e) * 0.2 + Math.sin(u * 0.9) * 0.008, o);
      x.restore();
    }
    /* DOWNLOAD FREE button: pops in, gets pressed once (ripple), keeps a shine sweep */
    if (u > 1.0) {
      const tapT = t0 + 2.2, pr = Math.max(0, 1 - Math.abs(t - tapT) / 0.14), k = eBack((u - 1.0) / 0.45) * (1 + Math.sin(u * 6) * 0.018) * (1 - pr * 0.07);
      const bw = 720 * k, bh = 140 * k, bx = W / 2 - bw / 2, by = 1470 - bh / 2;
      const btn = sprite('dlBtn', 720 + 160, 140 + 160, g => { g.translate(80, 80); g.shadowColor = 'rgba(154,109,245,.95)'; g.shadowBlur = 55; const bgB = g.createLinearGradient(0, 0, 0, 140); bgB.addColorStop(0, '#b794ff'); bgB.addColorStop(1, '#743ae8'); g.fillStyle = bgB; rr(g, 0, 0, 720, 140, 70); g.fill(); g.shadowBlur = 0; g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3; rr(g, 2, 2, 716, 136, 68); g.stroke(); });
      if (k > 0.02) stamp(x, btn, bx - 80 * k, by - 80 * k, 880 * k, 300 * k);
      x.save(); rr(x, bx, by, bw, bh, bh / 2); x.clip(); const sx = bx + ((u * 520) % (bw + 400)) - 200; const sh = x.createLinearGradient(sx - 80, 0, sx + 80, 0); sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.5, 'rgba(255,255,255,.45)'); sh.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = sh; x.fillRect(bx, by, bw, bh); x.restore();
      bigText(x, o.cta || 'DOWNLOAD FREE', W / 2, by + bh * 0.68, 70 * k, { glow: 0, stroke: '#2b0e6b', type: 'gloss' });
      for (const d of [0, 0.12]) { const v = t - tapT - d; if (v >= 0 && v < 0.6) { const q = v / 0.6; x.strokeStyle = `rgba(255,255,255,${0.7 * (1 - q)})`; x.lineWidth = 6 * (1 - q) + 2; rr(x, bx - q * 60, by - q * 40, bw + q * 120, bh + q * 80, (bh + q * 80) / 2); x.stroke(); } }
    }
    if (u > 1.4 && A.gplay) { x.globalAlpha = clamp((u - 1.4) / 0.3); const gw = 380, gh = gw * A.gplay.height / A.gplay.width; x.drawImage(A.gplay, (W - gw) / 2, 1580, gw, gh); x.globalAlpha = 1; }
    if (u > 1.7) { x.globalAlpha = clamp((u - 1.7) / 0.3); sub(x, o.footer || '500+ LEVELS · DUELS · DAILY BEAT', W / 2, 1775, 32, '#d9c8ff', 700); x.globalAlpha = 1; }
    /* v1.6: the creator's own name + avatar on every end card */
    if (END_ME.name && u > 0.9) {
      const k = eBack((u - 0.9) / 0.45), nm = '@' + END_ME.name.replace(/^@/, '').slice(0, 18);
      x.save(); x.globalAlpha = clamp((u - 0.9) / 0.3); x.font = F(800, 34); const tw = x.measureText(nm).width, pw = tw + (A.me ? 120 : 60), px = W / 2 - pw / 2 * k, py = 1860;
      x.fillStyle = 'rgba(20,6,58,.82)'; rr(x, px, py - 40, pw * k, 80, 40); x.fill(); x.strokeStyle = 'rgba(196,167,255,.6)'; x.lineWidth = 3; x.stroke();
      if (A.me && k > 0.5) avatarDisc(x, A.me, px + 44, py, 30);
      x.fillStyle = '#fff'; x.textAlign = 'left'; x.textBaseline = 'middle'; if (k > 0.6) x.fillText(nm, px + (A.me ? 90 : 30), py + 2); x.textBaseline = 'alphabetic'; x.restore();
    }
  }
  const END_ME = { name: '' };
  /* ================= GAMEPLAY =================
     round(): one watch phase (tiles flash on the beat) and/or one input phase (finger taps).
     o.only = 'show' | 'input' | undefined (both) */
  function round(T, o) {
    const P = T.P, { seq } = o, beat = T.q(o.beat), n = seq.length, show = T.q(o.showBeat || beat), tap = T.q(o.tapBeat || beat * 0.9), g = o.g || 3;
    const t0 = T.snap(o.start);
    const showEnd = o.only === 'input' ? t0 : t0 + n * show, inT0 = o.only === 'input' ? t0 : showEnd + (T.sync ? T.beat : beat * 0.6);
    const wrongAt = o.wrongAt == null ? -1 : o.wrongAt, taps = [];
    let end = showEnd;
    if (o.only !== 'show') {
      for (let k = 0; k < n; k++) {
        let tt = inT0 + k * tap; if (o.slowLast && k === n - 1) tt += T.sync ? tap * 2 : tap * 1.7;
        taps.push(tt); end = tt + tap * 0.6; if (k === wrongAt) { end = tt + 0.2; break; }
      }
    }
    const R = { t0: o.only === 'input' ? -99 : t0, showEnd, inT0, taps, end, seq, show, wrongAt, g, wrongTile: wrongAt >= 0 ? (seq[wrongAt] + 1 + g) % (g * g) : null };
    if (o.only !== 'input') for (let k = 0; k < n; k++) T.cue(t0 + k * show, () => { SND.tile(seq[k], show * 0.6); P.kick = 1; });
    if (o.sound !== false) taps.forEach((tt, k) => T.cue(tt, () => { if (k === wrongAt) { SND.wrong(); SND.beat.drop(); } else { SND.tap(seq[k]); P.kick = 0.6; } }));
    if (wrongAt >= 0 && o.sound !== false) { const tw = taps[wrongAt]; T.shake(tw, 30, 0.5); T.flash(tw, '#ff2d5a', 0.45, 0.5); T.fails.push(tw); }
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
    const T = TL(S.bpm || 104), b = T.beat; T.world = 'arena';
    const levels = S.levels || [1, 5, 10, 15], rounds = [], hs = [];
    T.seg(0, 2.7, (x, t) => { slam(x, S.hook1 || 'LEVEL 1 → 15', -0.3, t, W / 2, 820, 150, 2.6, { c2: '#e6d8ff' }); slam(x, S.hook2 || 'HOW FAR CAN YOU GO?', 0.75, t, W / 2, 1000, 84, 1.95); sanx(x, A, t, { t0: 1.1, mood: 'smug', line: 'Bet you quit at level 7.' }); });
    T.cue(0.1, () => SND.boss()); T.cue(0.75, () => SND.whoosh()); T.cam(0, 1.15, 0, 0, 0); T.cam(0.1, 1, 0, 0, 1.4);
    let t = 2.9, coins = 120, hearts = 3;
    levels.forEach((lv, i) => {
      const last = i === levels.length - 1, boss = last, n = Math.min(10, 3 + Math.floor(lv / 2.2)), beat = Math.max(0.3, b * (1 - i * 0.1));
      const intro = t; T.tr(intro); T.cue(intro, () => { SND.beat.tempo(Math.round(60 / beat)); SND.beat.mode(boss ? 'hype' : 'full'); SND.whoosh(); if (boss) SND.boss(); });
      if (boss) { T.flash(intro, '#ff2d5a', 0.5, 0.35); T.shake(intro, 16, 0.6); }
      const R = round(T, { seq: makeSeq(rng, n, 3), beat, start: intro + (boss ? 1.5 : 0.95), wrongAt: last ? n - 1 : -1, slowLast: last });
      R.markNew = true; rounds.push({ R, lv, intro, boss, last }); if (boss) T.drop = R.t0;
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
    const T = TL(S.bpm || 100); T.world = 'studio'; const b = T.beat, g = S.grid || 3, n = S.len || 8, seq = makeSeq(rng, n, g);
    T.seg(0, T.snap(2.9), (x, t) => { slam(x, S.hook1 || 'ONLY 3% CAN', -0.3, t, W / 2, 840, 130, 2.7); slam(x, S.hook2 || 'REMEMBER THIS', 0.7, t, W / 2, 1010, 120, 2.1, { c2: '#e6d8ff' }); sanx(x, A, t, { t0: 1.2, mood: 'smug', line: `${n} tiles. No way you get all of them.` }); });
    T.cue(0.1, () => SND.boss()); T.cue(0.7, () => SND.whoosh()); T.cam(0, 1.2, 0, 0, 0); T.cam(0.1, 1, 0, 0, 1.6);
    const c0 = T.snap(2.9);
    T.seg(c0, c0 + b * 4, (x, t) => { board(x, A, t, { g, alpha: clamp((t - c0) / 0.4), kick: T.P.kick }); const k = Math.min(2, Math.floor((t - c0) / b)); if (t - c0 < b * 3) slam(x, ['3', '2', '1'][k], c0 + k * b, t, W / 2, 1140, 380, b * 0.95); bigText(x, 'WATCH CAREFULLY', W / 2, 380, 76); });
    [0, 1, 2].forEach(k => { T.cue(c0 + k * b, () => SND.tick()); T.shake(c0 + k * b, 8, 0.15); }); T.cue(c0, () => SND.beat.mode('full'));
    const R = round(T, { seq, beat: b, start: c0 + b * 4, g, only: 'show' });
    T.cue(R.t0, () => SND.beat.mode(n > 8 ? 'hype' : 'full'));
    seq.forEach((v, k) => { T.cam(R.t0 + k * b, 1.045, 0, 0, 0.07); T.cam(R.t0 + k * b + 0.08, 1, 0, 0, b * 0.8); });
    T.seg(R.t0, R.showEnd + 0.3, (x, t) => { const { b: bd, st } = drawRound(x, A, T, R, t); bigText(x, 'REMEMBER THE ORDER', W / 2, 380, 70); progress(x, (st.cur == null ? n - 1 : st.cur) + 1, n, bd.bottom + 110); });
    const tz = R.showEnd + 0.3, ans = S.answerTime || 5; T.tr(c0); T.tr(tz);
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
    const ta = T.snap(tz + ans), A2 = round(T, { seq, beat: b, start: ta + b, g, only: 'input', tapBeat: b * 0.85 }); T.tr(ta); T.drop = ta;
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
    const T = TL(S.bpm || 108); T.world = 'versus'; const b = T.beat, g = 3, you = S.youName || 'YOU', pw = S.playerWins !== false;
    T.seg(0, 3.0, (x, t) => {
      const k = eBack(clamp(0.5 + t / 0.6));
      avatarDisc(x, A.av, W / 2 - 250 * k, 760, 170, '#c4a7ff', you); avatarDisc(x, A.sanxDisc, W / 2 + 250 * k, 760, 170, '#ff3d6e', 'SANX');
      slam(x, 'VS', 0.5, t, W / 2, 815, 170, 2.6, { c2: '#ffb3c6' });
      slam(x, S.hook1 || 'MEMORY DUEL', 0.9, t, W / 2, 1200, 120, 2.2); slam(x, S.hook2 || 'WHO REMEMBERS MORE?', 1.3, t, W / 2, 1330, 70, 1.8);
    });
    T.cue(0.1, () => SND.whoosh()); T.cue(0.5, () => SND.boss()); T.shake(0.5, 20, 0.4);
    let t = T.snap(3.2); const score = [0, 0], rounds = [];
    [5, 6, 7].forEach((n, i) => {
      const seq = makeSeq(rng, n, g), last = i === 2, intro = t; T.tr(intro);
      T.cue(intro, () => { SND.beat.mode(last ? 'hype' : 'full'); SND.whoosh(); });
      const RS = round(T, { seq, beat: b, start: intro + 1.0, g, only: 'show' }); if (last) T.drop = RS.t0;
      const yW = last && !pw ? n - 2 : -1, xW = last && pw ? n - 3 : -1;
      const gap = T.sync ? b : b * 0.6, step = T.q(b * 0.8);
      const mk = (wrongAt, off, sound) => { const taps = []; for (let k = 0; k < n; k++) { taps.push(RS.showEnd + gap + k * step + off); if (k === wrongAt) break; } return { t0: -99, showEnd: RS.showEnd, inT0: RS.showEnd + gap, show: b, seq, g, taps, wrongAt, wrongTile: wrongAt >= 0 ? (seq[wrongAt] + 4) % 9 : null, end: taps[taps.length - 1] + 0.3 }; };
      const RY = mk(yW, 0), RX = mk(xW, 0.13);
      RY.taps.forEach((tt, k) => T.cue(tt, () => { if (k === RY.wrongAt) { SND.wrong(); SND.beat.drop(); } else SND.tap(seq[k]); }));
      RX.taps.forEach((tt, k) => { if (k === RX.wrongAt) T.cue(tt, () => { SND.wrong(); SND.beat.drop(); }); });
      [RY, RX].forEach(RR => { if (RR.wrongAt >= 0) { const tw = RR.taps[RR.wrongAt]; T.fails.push(tw); T.shake(tw, 26, 0.5); T.flash(tw, '#ff2d5a', 0.4, 0.35); T.cam(tw - 1.0, 1.06, 0, 0, 0.6); T.cam(tw + 0.4, 1, 0, 0, 0.4); } });
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
    const T = TL(S.bpm || 124); T.world = 'club'; const b = T.beat, g = S.grid || 3, words = S.words || ['REMEMBER', 'THE', 'BEAT'];
    T.seg(0, T.snap(2.7) + 0.02, (x, t) => { words.forEach((w, i) => slam(x, w, i * b - 0.3, t, W / 2, 760 + i * 175, 150, 2.5 - i * b)); sanx(x, A, t, { t0: 1.4, mood: 'smug', line: 'Keep up if you can.' }); });
    words.forEach((w, i) => { T.cue(0.02 + i * b, () => SND.tick()); T.shake(i * b, 12, 0.2); });
    const r0 = T.snap(2.7), n = 24, half = b / 2, seq = makeSeq(rng, n, g); T.tr(r0); T.drop = r0;
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
    const c0 = T.snap(rEnd), last = seq.slice(-6), ans = 4; T.tr(c0);
    T.cue(c0, () => { SND.beat.mode('light'); SND.whoosh(); });
    for (let s = 0; s < ans; s++) T.cue(c0 + s, () => SND.tick());
    T.seg(c0, T.snap(c0 + ans) + 0.02, (x, t) => { const nums = {}; for (let i = 0; i < g * g; i++) nums[i] = i + 1; const bd = board(x, A, t, { g, nums }); slam(x, 'WHAT WERE THE', c0, t, W / 2, 360, 92, ans + 1); slam(x, 'LAST 6 TILES?', c0 + 0.3, t, W / 2, 490, 112, ans + 1, { c2: '#ffb3c6' }); bigText(x, String(Math.max(1, Math.ceil(c0 + ans - t))), W / 2, bd.bottom + 170, 110); });
    const ta = T.snap(c0 + ans), aT = k => ta + (T.sync ? b : 0.3) + k * b; T.tr(ta);
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
    const T = TL(S.bpm || 104); T.world = 'space'; const b = T.beat, g = 3, n = S.len || 7, seq = makeSeq(rng, n, g);
    T.seg(0, 2.8, (x, t) => { slam(x, S.hook1 || '1 TILE AWAY', -0.3, t, W / 2, 860, 150, 2.7, { c2: '#ffb3c6' }); slam(x, S.hook2 || 'EVERY. SINGLE. TIME.', 0.8, t, W / 2, 1030, 76, 2); sanx(x, A, t, { t0: 1.3, mood: 'laugh', line: 'This one is painful. Hehe.' }); });
    T.cue(0.1, () => SND.boss()); T.cam(0, 1.15, 0, 0, 0); T.cam(0.1, 1, 0, 0, 1.2);
    const atts = []; let t = T.snap(3.0);
    [n - 1, n - 1, -1].forEach((wrongAt, i) => {
      const intro = t; T.tr(intro);
      T.cue(intro, () => { SND.whoosh(); SND.beat.mode(i === 2 ? 'hype' : 'full'); });
      const R = round(T, { seq, beat: b, start: intro + 1.0, g, wrongAt, slowLast: true, showBeat: i === 0 ? b : b * 0.6, tapBeat: i === 0 ? b * 0.9 : b * 0.7 });
      const tl = R.taps[R.taps.length - 1]; if (i === 2) T.drop = R.t0;
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

  /* 8) SO MUCH TO LOSE — fear of loss: the stakes are shown, hearts drop, slow-mo last tile, he loses */
  STYLES.lose = (S, A, rng) => {
    const T = TL(S.bpm || 100); T.world = 'tunnel'; const b = T.beat, g = 3, n = S.len || 8, seq = makeSeq(rng, n, g);
    const lv = S.level || 99, streak = S.streak || 29, stake = S.stake || 12480;
    const stakes = [[`${streak}-DAY STREAK`, 'flame'], [`${stake.toLocaleString('en')} COINS`, 'coins'], [`LEVEL ${lv + 1} · ONE STEP AWAY`, 'crown']];
    T.seg(0, 3.4, (x, t) => {
      slam(x, S.hook1 || 'HE HAD', -0.3, t, W / 2, 520, 120, 3.3); slam(x, S.hook2 || 'EVERYTHING TO LOSE', 0.5, t, W / 2, 660, 86, 2.9, { c2: '#ffb3c6' });
      stakes.forEach(([s2, ic], i) => { if (t > 1.0 + i * 0.35) { x.globalAlpha = clamp((t - 1.0 - i * 0.35) / 0.25); chip(x, s2, W / 2, 900 + i * 130, 46); x.globalAlpha = 1; } });
    });
    T.cue(0.1, () => SND.boss()); [1.0, 1.35, 1.7].forEach(c => T.cue(c, () => SND.tick()));
    const atts = []; let t = T.snap(3.6);
    [[2, 'HEART 1 GONE'], [n - 2, 'LAST HEART…'], [n - 1, '']].forEach(([wrongAt, word], i) => {
      const intro = t; T.tr(intro); T.cue(intro, () => { SND.whoosh(); SND.beat.mode(i === 2 ? 'still' : 'full'); });
      const R = round(T, { seq, beat: b, start: intro + 0.9, g, wrongAt, slowLast: i === 2, showBeat: b * (i ? 0.7 : 0.85), tapBeat: b * 0.8 });
      const tl = R.taps[R.taps.length - 1];
      if (i === 2) { T.drop = R.t0; T.cam(tl - 2.2, 1.3, 0, -30, 1.6); T.cam(tl + 0.2, 1, 0, 0, 0.35); T.cue(tl + 0.05, () => { SND.crash(); SND.lose(); SND.beat.mode('still'); }); T.shake(tl, 22, 0.6); T.flash(tl, '#ff2d5a', 0.5, 0.6); }
      else { T.cue(tl + 0.05, () => SND.lose()); T.shake(tl, 10, 0.3); }
      atts.push({ R, intro, i, tl, word }); t = R.end + (i === 2 ? 2.6 : 1.6);
    });
    T.seg(3.4, t, (x, t2) => {
      const cur = atts.filter(a => t2 >= a.intro).pop() || atts[0], R = cur.R, lost = atts.filter(a => t2 >= a.tl).length;
      hud(x, A, { max: 3, hearts: 3 - lost, level: lv, coins: stake, boss: true });
      if (t2 < R.t0) { board(x, A, t2, { g, alpha: 0.4 }); slam(x, cur.i === 2 ? 'LAST CHANCE' : `ROUND ${cur.i + 1}`, cur.intro, t2, W / 2, 1040, 120, 1.0, cur.i === 2 ? { c2: '#ffb3c6' } : undefined); return; }
      const { b: bd, st } = drawRound(x, A, T, R, t2);
      if (st.phase === 'show') progress(x, st.cur + 1, n, bd.bottom + 110);
      else if (t2 < cur.tl + 0.1) { const tense = cur.i === 2 && R.taps.length > 1 && t2 > R.taps[R.taps.length - 2]; label(x, tense ? 'EVERYTHING ON THIS TILE…' : `${Math.min(n, R.taps.filter(tt => t2 >= tt).length)} / ${n}`, bd.bottom + 110, tense ? '#ffb3c6' : '#fff', tense ? 50 : 60); }
      const f = fingerAt(R, t2, bd.pos); if (f && t2 < cur.tl + 0.4) finger(x, f.x, f.y, f.press);
      if (t2 >= cur.tl && cur.i < 2) slam(x, cur.word, cur.tl + 0.1, t2, W / 2, 820, 104, 1.4, { c2: '#ffb3c6' });
      if (t2 >= cur.tl && cur.i === 2) {
        const u = t2 - cur.tl; x.fillStyle = `rgba(30,0,12,${clamp(u / 0.4) * 0.7})`; x.fillRect(0, 0, W, H);
        slam(x, 'GAME OVER', cur.tl + 0.15, t2, W / 2, 560, 150, 99, { c2: '#ffb3c6' });
        stakes.forEach(([s2], k) => { if (u > 0.7 + k * 0.35) { const v = clamp((u - 0.7 - k * 0.35) / 0.3); x.globalAlpha = v; chip(x, s2, W / 2, 820 + k * 130, 44, 'rgba(120,10,40,.85)'); x.strokeStyle = '#ff6b8a'; x.lineWidth = 7; x.beginPath(); x.moveTo(W / 2 - 330 * v, 820 + k * 130); x.lineTo(W / 2 + 330 * v, 820 + k * 130); x.stroke(); x.globalAlpha = 1; } });
        if (u > 2.0) { x.globalAlpha = clamp((u - 2.0) / 0.3); sub(x, 'ALL GONE. ONE TILE.', W / 2, 1300, 52, '#ffd0db', 900); x.globalAlpha = 1; }
      }
    });
    const q0 = t; T.cue(q0, () => SND.whoosh());
    T.seg(q0, q0 + 2.4, (x, t2) => { board(x, A, t2, { g, alpha: 0.15 }); slam(x, 'COULD YOU', q0, t2, W / 2, 820, 140, 99); slam(x, 'HAVE SAVED IT?', q0 + 0.4, t2, W / 2, 990, 110, 99, { c2: '#e6d8ff' }); sanx(x, A, t2, { t0: q0 + 0.8, mood: 'laugh', line: 'I bet you could not.' }); });
    const e0 = q0 + 2.4; T.cue(e0, () => SND.beat.mode('full'));
    T.seg(e0, e0 + 4.6, (x, t2) => endCard(x, A, t2, e0, { title: S.endTitle || 'COULD YOU SAVE IT?', line: S.sanxLine || 'Play it. Do not lose it all.', mood: 'laugh', footer: S.footer }));
    T.wash = t2 => { const cur = atts.filter(a => t2 >= a.intro).pop(); return cur ? washOf(cur.R, t2) : null; };
    T.red = t2 => { const a = atts.find(a => t2 >= a.tl && t2 < a.tl + (a.i === 2 ? 3 : 1.4)); return a ? clamp(1 - (t2 - a.tl) / (a.i === 2 ? 3 : 1.4)) * (a.i === 2 ? 1 : 0.7) : 0; };
    return T;
  };
  /* 9) MY RUN — the creator types level, mode, tiles and name; the finger plays that run */
  STYLES.myrun = (S, A, rng) => {
    const g = S.grid || (S.len >= 12 ? 4 : 3);
    const S2 = Object.assign({}, S, { seq: S.seq || makeSeq(rng, Math.max(3, Math.min(30, S.len || 9)), g), grid: g, score: S.len, name: S.name ? S.name.toUpperCase() : null, rank: `${(S.modeName || 'CLASSIC').toUpperCase()} · LEVEL ${S.level || 1}`, endTitle: S.endTitle || 'BEAT MY RUN' });
    return STYLES.brag(S2, A, rng);
  };
  /* 10) DAILY BEAT CARD — today's world pattern, Sanx's score, "can you beat it?" */
  STYLES.dbeat = (S, A, rng) => {
    const T = TL(S.bpm || 104); T.world = 'aurora'; const b = T.beat, no = S.dayNo || 1, sc = S.sanxScore || 9, n = Math.max(5, Math.min(12, sc)), g = 3, seq = makeSeq(rng, n, g);
    T.seg(0, 3.0, (x, t) => { slam(x, `DAILY BEAT #${no}`, -0.3, t, W / 2, 600, 104, 2.9); slam(x, 'SAME PATTERN', 0.45, t, W / 2, 760, 90, 2.5, { c2: '#e6d8ff' }); slam(x, 'FOR THE WHOLE WORLD', 0.85, t, W / 2, 870, 70, 2.1); if (t > 1.2) chip(x, `SANX SCORE: ${sc}`, W / 2, 1040, 50, 'rgba(255,45,111,.85)'); sanx(x, A, t, { t0: 1.5, mood: 'smug', line: `I got ${sc}. Your move.` }); });
    T.cue(0.1, () => SND.boss()); T.cue(1.2, () => SND.whoosh());
    const R = round(T, { seq, beat: b * 0.85, start: 3.2, g, only: 'show' }); T.drop = R.t0;
    T.seg(3.0, R.end + 0.6, (x, t) => { hud(x, A, { max: 1, hearts: 1, level: null, coins: 0 }); chip(x, `DAILY BEAT #${no} · ONE MISTAKE ENDS IT`, W / 2, 340, 30); const { b: bd, st } = drawRound(x, A, T, R, t); if (st.phase === 'show') progress(x, st.cur + 1, n, bd.bottom + 110); });
    const q0 = R.end + 0.6; T.cue(q0, () => { SND.beat.fill(); SND.crash(); });
    T.seg(q0, q0 + 2.6, (x, t) => { board(x, A, t, { g, alpha: 0.2 }); slam(x, `${n} TILES.`, q0, t, W / 2, 760, 150, 99); slam(x, 'GOT THEM ALL?', q0 + 0.45, t, W / 2, 940, 100, 99, { c2: '#e6d8ff' }); if (t > q0 + 1.0) sub(x, 'Comment the order 👇', W / 2, 1080, 46, '#efe6ff', 800); });
    const e0 = q0 + 2.6; T.cue(e0, () => SND.beat.mode('full'));
    T.seg(e0, e0 + 4.6, (x, t) => endCard(x, A, t, e0, { title: S.endTitle || `BEAT SANX'S ${sc}`, line: S.sanxLine || 'New pattern every day.', footer: S.footer }));
    T.wash = t => washOf(R, t);
    return T;
  };

  /* 6) BRAG — the in-app Save Clip: your best pattern played by the finger, then your score */
  STYLES.brag = (S, A, rng) => {
    const T = TL(S.bpm || 104); T.world = 'arena'; const b = T.beat, seq = S.seq, n = seq.length, g = S.grid || 3;
    T.seg(0, 2.6, (x, t) => { if (A.av) avatarDisc(x, A.av, W / 2, 560, 140 * eBack((t - 0.2) / 0.5)); slam(x, 'CAN YOU BEAT', -0.3, t, W / 2, 870, 130, 2.5); slam(x, 'MY MEMORY?', 0.65, t, W / 2, 1040, 140, 1.95, { c2: '#e6d8ff' }); if (S.name && t > 1) chip(x, S.name, W / 2, 1160, 40); });
    T.cue(0.1, () => SND.boss()); T.cue(0.65, () => SND.whoosh());
    const beat = n * b > 9 ? Math.max(0.32, 9 / n) : b;
    const R = round(T, { seq, beat, start: 2.8, g, wrongAt: -1, tapBeat: beat * 0.8 }); T.drop = R.t0;
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

  /* 7) FEATURE SPOTLIGHT — real game content in action: a booster, a skin, an event or a challenge.
     spec.feature = { kind: 'booster'|'skin'|'event'|'challenge', id, name, icon, desc, price, ... } */
  function featCard(x, A, t, t0, f, Y, o = {}) {
    const u = t - t0; if (u < 0) return; const k = eBack(u / 0.5), s2 = (o.size || 300) * k;
    x.save(); x.translate(W / 2, Y); x.rotate((1 - clamp(u / 0.5)) * -0.4 + Math.sin(u * 1.6) * 0.03);
    const base = sprite('featCard', 300 + 200, 300 + 200, g => { g.translate(250, 250); g.shadowColor = 'rgba(154,109,245,.95)'; g.shadowBlur = 70; const gr = g.createLinearGradient(0, -150, 0, 150); gr.addColorStop(0, '#9a6df5'); gr.addColorStop(1, '#5b21d6'); g.fillStyle = gr; rr(g, -150, -150, 300, 300, 72); g.fill(); g.shadowBlur = 0; g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 5; rr(g, -144, -144, 288, 288, 63); g.stroke(); });
    if (s2 > 4) stamp(x, base, -s2 / 300 * 250, -s2 / 300 * 250, s2 / 300 * 500, s2 / 300 * 500);
    if (A.fIcon) x.drawImage(A.fIcon, -s2 * 0.3, -s2 * 0.3, s2 * 0.6, s2 * 0.6);
    x.restore();
  }
  function boostBar(x, A, t, slots, active, Y, appear, tapAt, sz = 150, labels = true) {
    const u = t - appear; if (u < 0) return; const k = eBack(u / 0.4), ic = sz * 0.61;
    slots.forEach((sl, i) => {
      const X = W / 2 + (i - 1) * sz * 1.33, on = active != null && t >= active && i === 1, pr = tapAt != null ? Math.max(0, 1 - Math.abs(t - tapAt) / 0.12) : 0;
      x.save(); x.translate(X, Y + (1 - k) * 200); x.scale(1 - pr * 0.1, 1 - pr * 0.1);
      if (on) { x.shadowColor = '#c4a7ff'; x.shadowBlur = 50 + 20 * Math.sin(t * 8); }
      const g = x.createLinearGradient(0, -sz / 2, 0, sz / 2); g.addColorStop(0, on ? '#b794ff' : 'rgba(116,58,232,.55)'); g.addColorStop(1, on ? '#743ae8' : 'rgba(43,14,107,.75)');
      x.fillStyle = g; rr(x, -sz / 2, -sz / 2, sz, sz, sz * 0.24); x.fill(); x.shadowBlur = 0; x.strokeStyle = i === 1 ? '#e4d7ff' : 'rgba(196,167,255,.45)'; x.lineWidth = i === 1 ? 5 : 3; x.stroke();
      if (sl.img) x.drawImage(sl.img, -ic / 2, -ic / 2 - sz * 0.02, ic, ic);
      if (labels) { x.font = F(800, 24); x.fillStyle = '#fff'; x.textAlign = 'center'; x.fillText(on ? 'ACTIVE' : sl.name, 0, sz / 2 + 38); }
      x.restore();
    });
  }
  function hintRing(x, p, t) { if (!p) return; const a = 0.6 + 0.4 * Math.sin(t * 14); x.save(); x.shadowColor = '#ffffff'; x.shadowBlur = 40; x.strokeStyle = `rgba(255,255,255,${a})`; x.lineWidth = 12; rr(x, p.x - p.s / 2 - 8, p.y - p.s / 2 - 8, p.s + 16, p.s + 16, p.s * 0.26); x.stroke(); x.restore(); }
  function starRow(x, n, got, Y, t, tAt) {
    for (let i = 0; i < n; i++) {
      const X = W / 2 + (i - (n - 1) / 2) * 150, on = got > i, pop = tAt && tAt[i] != null ? eBack((t - tAt[i]) / 0.4) : 1, s2 = 56 * (on ? pop : 1);
      x.save(); x.translate(X, Y); x.beginPath(); for (let k = 0; k < 10; k++) { const r2 = k % 2 ? s2 * 0.45 : s2, a = -Math.PI / 2 + k * Math.PI / 5; x.lineTo(Math.cos(a) * r2, Math.sin(a) * r2); } x.closePath();
      x.fillStyle = on ? '#c4a7ff' : 'rgba(255,255,255,.12)'; if (on) { x.shadowColor = '#9a6df5'; x.shadowBlur = 30; } x.fill(); x.shadowBlur = 0; x.strokeStyle = on ? '#fff' : 'rgba(255,255,255,.3)'; x.lineWidth = 4; x.stroke(); x.restore();
    }
  }
  function infoCard(x, A, t, t0, f, lines) {
    const u = t - t0; if (u < 0) return;
    x.fillStyle = `rgba(6,2,26,${clamp(u / 0.3) * 0.7})`; x.fillRect(0, 0, W, H);
    featCard(x, A, t, t0, f, 640, { size: 260 });
    slam(x, f.name.toUpperCase(), t0 + 0.25, t, W / 2, 920, 104, 99);
    lines.forEach((l, i) => { if (u > 0.6 + i * 0.25) { x.globalAlpha = clamp((u - 0.6 - i * 0.25) / 0.3); if (i === 0) sub(x, l, W / 2, 1020, 44, '#efe6ff', 700); else chip(x, l, W / 2, 1110 + (i - 1) * 100, 36); x.globalAlpha = 1; } });
  }
  STYLES.spot = (S, A, rng) => {
    const T = TL(S.bpm || 110); T.world = 'studio'; const b = T.beat, f = S.feature || { kind: 'booster', id: 'xray', name: 'X-Ray', desc: 'Next tile glows', price: '500 coins' }, g = 3;
    const hk1 = S.hook1 || 'THIS BOOSTER', hk2 = S.hook2 || 'IS ILLEGAL 😳';
    T.seg(0, 3.0, (x, t) => {
      if (f.kind === 'skin') { const bd = board(x, A, t, { g, size: 620, cy: 1300, alpha: clamp((t - 0.6) / 0.4), lit: { [Math.floor(t * 3) % 9]: 1 } }); }
      else featCard(x, A, t, 0.55, f, 1320, { size: 320 });
      slam(x, hk1, -0.3, t, W / 2, 640, 128, 2.9); slam(x, hk2, 0.6, t, W / 2, 800, 96, 2.3, { c2: '#e6d8ff' });
    });
    T.cue(0.1, () => SND.boss()); T.cue(0.6, () => SND.whoosh()); T.cam(0, 1.15, 0, 0, 0); T.cam(0.1, 1, 0, 0, 1.4);
    let t = T.snap(3.1), endScene = 0, lv = 10 + (S.seed || 3) % 30, coins = 800 + ((S.seed || 1) * 37) % 2000;
    const segs = [];      // gameplay scenes drawn by one segment
    const scene = (o) => { segs.push(o); return o; };
    const playRound = (n, opt = {}) => {
      const intro = t; T.tr(intro); T.cue(intro, () => { SND.whoosh(); SND.beat.mode(opt.hype ? 'hype' : 'full'); if (opt.boss) SND.boss(); });
      const R = round(T, Object.assign({ seq: makeSeq(rng, n, g), beat: opt.beat || b, start: intro + (opt.pre || 1.0), g }, opt.r || {}));
      R.markNew = true; const sc = scene({ R, intro, label: opt.label, lv: opt.lv, boss: opt.boss, ...opt.extra });
      t = R.end + (opt.after != null ? opt.after : 1.0); return sc;
    };
    if (f.kind === 'booster') {
      const arch = { xray: 'glow', fog: 'glow', hint: 'replay', slow: 'slow', freeze: 'freeze', shield: 'save', second: 'save', heart: 'save', combo: 'save', double: 'reward', magnet: 'reward', lucky: 'reward', xp: 'reward', pass: 'reward', skip: 'skip' }[f.id] || 'glow';
      const s1 = playRound(6, { label: `LEVEL ${lv}`, lv });
      T.cue(s1.R.end, () => { SND.beat.fill(); SND.crash(); SND.level(); }); coins += 60;
      const intro2 = t, actT = intro2 + 1.1, tapT = actT - 0.05;
      T.cue(tapT, () => { SND.tap(4); }); T.cue(actT, () => { SND.crash(); SND.win(); }); T.flash(actT, '#c4a7ff', 0.35, 0.45); T.shake(actT, 14, 0.35);
      let s2;
      if (arch === 'skip') { s2 = scene({ skip: true, intro: intro2, actT, tapT, end: actT + 2.4, lv: lv + 1 }); T.tr(intro2); t = actT + 2.6; }
      else {
        const n2 = 9, opts = { label: 'BOSS LEVEL', lv: lv + 1, boss: true, hype: true, pre: 2.4, after: 0.4, extra: { actT, tapT, arch } };
        if (arch === 'slow') opts.beat = b * 1.5;
        if (arch === 'save') opts.r = { wrongAt: 5 };
        if (arch === 'replay') opts.r = { only: 'show' };
        s2 = playRound(n2, opts);
        if (arch === 'save') { const R = s2.R, tw = R.taps[5]; /* the wrong tap is blocked, then the run continues */
          const cont = round(T, { seq: R.seq.slice(5), beat: b, start: tw + 1.4, g, only: 'input', tapBeat: b * 0.8 }); s2.cont = cont; s2.saveT = tw; t = cont.end + 0.5;
          T.cue(tw + 0.05, () => SND.shield ? SND.shield() : SND.win()); T.flash(tw + 0.05, '#c4a7ff', 0.4, 0.4); }
        if (arch === 'replay') { const R = s2.R; s2.replay = round(T, { seq: R.seq, beat: b / 2, start: R.showEnd + b, g, only: 'show' }); s2.cont = round(T, { seq: R.seq, beat: b, start: s2.replay.showEnd + b, g, only: 'input', tapBeat: b * 0.8 }); t = s2.cont.end + 0.5; }
        const endR = s2.cont || s2.R; T.cue(endR.end, () => { SND.beat.fill(); SND.crash(); SND.win(); }); s2.clearT = endR.end; t = Math.max(t, endR.end + (arch === 'reward' ? 2.6 : 1.2));
      }
      const others = (f.others || []).slice(0, 2);
      T.seg(3.0, t, (x, tt) => {
        const sc = segs.filter(q => tt >= q.intro).pop() || segs[0];
        hud(x, A, { max: 3, hearts: sc.arch === 'save' && sc.saveT && tt > sc.saveT && f.id === 'heart' ? 3 : 3, level: sc.lv, boss: sc.boss, coins: tt > (s1.R.end) ? coins : coins - 60 });
        if (sc.skip) {
          const bd = board(x, A, tt, { g, alpha: tt < sc.actT ? 1 : clamp(1 - (tt - sc.actT) / 0.3) });
          if (tt < sc.actT) { slam(x, 'STUCK ON THIS ONE?', sc.intro, tt, W / 2, 400, 80, 99); }
          else { const k = eOut((tt - sc.actT) / 0.5); x.save(); x.translate(-k * W, 0); board(x, A, tt, { g, alpha: 0.5 }); x.restore(); slam(x, 'LEVEL SKIPPED!', sc.actT + 0.1, tt, W / 2, 1000, 130, 99); chip(x, `LEVEL ${sc.lv - 1}  →  ${sc.lv}`, W / 2, 1180, 44); }
          boostBar(x, A, tt, [{ img: A.oIcons[0], name: others[0] ? others[0].name : '' }, { img: A.fIcon, name: f.name }, { img: A.oIcons[1], name: others[1] ? others[1].name : '' }], sc.actT, 1730, sc.intro + 0.2, sc.tapT);
          if (tt > sc.tapT - 0.6 && tt < sc.tapT + 0.5) finger(x, W / 2 + 6, lerp(1920, 1746, eOut((tt - sc.tapT + 0.6) / 0.5)), Math.max(0, 1 - Math.abs(tt - sc.tapT) / 0.12));
          return;
        }
        const R = sc.R, useR = sc.cont && tt >= sc.cont.inT0 - 0.6 ? sc.cont : (sc.replay && tt >= sc.replay.t0 && tt < sc.replay.showEnd ? sc.replay : R);
        const extra = {};
        if (sc.arch === 'glow' && tt >= R.showEnd && useR === R) { const k = R.taps.findIndex(q => q > tt); if (k >= 0 && k >= R.taps.length - 5) extra.lit = { [R.seq[k]]: 0.4 + 0.25 * Math.sin(tt * 14) }; }
        const { b: bd, st } = drawRound(x, A, T, useR, tt, extra);
        /* booster effects */
        if (sc.arch === 'glow' && st.phase === 'input' && useR === R) { const k = R.taps.findIndex(q => q > tt); if (k >= 0 && k >= R.taps.length - 5) hintRing(x, bd.pos[R.seq[k]], tt); }
        if (sc.arch === 'freeze' && tt >= sc.actT) { const fr = clamp((tt - sc.actT) / 0.4); x.save(); x.globalAlpha = 0.5 * fr; const fg = x.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.7); fg.addColorStop(0, 'rgba(230,220,255,0)'); fg.addColorStop(1, 'rgba(230,220,255,.85)'); x.fillStyle = fg; x.fillRect(0, 0, W, H); x.restore();
          const left = tt < sc.actT ? 1 - (tt - sc.intro) / 6 : 0.32; x.lineWidth = 14; x.strokeStyle = 'rgba(255,255,255,.15)'; x.beginPath(); x.arc(W - 150, 380, 62, 0, 7); x.stroke(); x.strokeStyle = tt >= sc.actT ? '#e4d7ff' : '#ff3d6e'; x.beginPath(); x.arc(W - 150, 380, 62, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left); x.stroke(); if (tt >= sc.actT) { x.font = F(900, 30); x.fillStyle = '#fff'; x.textAlign = 'center'; x.fillText('❄', W - 150, 392); } }
        if (sc.arch === 'save' && sc.saveT && tt >= sc.saveT && tt < sc.saveT + 1.4) { const u = tt - sc.saveT, k = eBack(u / 0.4); x.save(); x.globalAlpha = clamp((1.4 - u) / 0.3); x.strokeStyle = '#e4d7ff'; x.shadowColor = '#9a6df5'; x.shadowBlur = 60; x.lineWidth = 16; x.beginPath(); x.arc(W / 2, 1000, 520 * k, 0, 7); x.stroke(); x.restore();
          slam(x, { shield: 'SHIELD SAVED YOU!', second: '2ND CHANCE!', heart: '+1 HEART SAVED IT', combo: 'COMBO KEPT!' }[f.id] || 'SAVED!', sc.saveT + 0.05, tt, W / 2, 1010, 104, 1.35); }
        if (sc.arch === 'reward' && sc.clearT && tt >= sc.clearT) { const u = tt - sc.clearT; x.fillStyle = `rgba(6,2,26,${clamp(u / 0.3) * 0.55})`; x.fillRect(0, 0, W, H);
          slam(x, { double: '×2 COINS!', magnet: '+50% COINS!', lucky: 'LUCKY BOX!', xp: '×2 XP!', pass: '×2 PASS POINTS!' }[f.id] || 'BONUS!', sc.clearT, tt, W / 2, 900, 150, 99);
          if (f.id === 'xp' || f.id === 'pass') progress(x, Math.round(10 * clamp(u / 1.2)), 10, 1080); else { coinBurst(x, sc.clearT + 0.2, tt, { x: W / 2, y: 1150 }, { x: W - 230, y: 210 }, 14); x.save(); x.translate(W / 2, 1180); const k = eBack((u - 0.3) / 0.5); x.scale(k, k); bigText(x, `+${f.id === 'double' ? 240 : f.id === 'magnet' ? 180 : 300}`, 0, 0, 120, { font: 'num' }); x.restore(); } }
        if (st.phase === 'show' && useR !== sc.replay) progress(x, st.cur + 1, R.seq.length, bd.bottom + 110);
        if (sc.replay && tt >= sc.replay.t0 && tt < sc.replay.showEnd) label(x, 'HINT: WATCH IT AGAIN', bd.bottom + 110, '#e4d7ff');
        if (tt < R.t0 && tt >= sc.intro) { x.fillStyle = 'rgba(6,2,26,.4)'; x.fillRect(0, 300, W, 1250); slam(x, sc.label, sc.intro, tt, W / 2, 1000, sc.boss ? 150 : 130, (sc.actT || R.t0) - sc.intro, sc.boss ? { c2: '#ffb3c6' } : {}); }
        if (sc.actT && tt >= sc.actT && tt < sc.actT + 1.3) slam(x, `${f.name.toUpperCase()} ON!`, sc.actT, tt, W / 2, 470, 96, 1.3);
        const f2 = fingerAt(useR, tt, bd.pos); if (f2 && tt < useR.taps[useR.taps.length - 1] + 0.4) finger(x, f2.x, f2.y, f2.press);
        if (sc.actT) { boostBar(x, A, tt, [{ img: A.oIcons[0], name: others[0] ? others[0].name : '' }, { img: A.fIcon, name: f.name }, { img: A.oIcons[1], name: others[1] ? others[1].name : '' }], sc.actT, 1730, sc.intro + 0.2, sc.tapT);
          if (tt > sc.tapT - 0.6 && tt < sc.tapT + 0.5) finger(x, W / 2 + 6, lerp(1920, 1746, eOut((tt - sc.tapT + 0.6) / 0.5)), Math.max(0, 1 - Math.abs(tt - sc.tapT) / 0.12)); }
        segs.forEach(q => { if (q.R && !q.boss && q.R.wrongAt < 0) slam(x, 'LEVEL CLEAR!', q.R.end, tt, W / 2, bd.top - 50, 96, 1.0); });
        if (sc.clearT && sc.arch !== 'reward' && tt >= sc.clearT) { slam(x, 'BOSS DOWN!', sc.clearT, tt, W / 2, 860, 150, 99); confetti(x, A, sc.clearT, tt, W / 2, 760); }
      });
      T.drop = s2.R ? s2.R.t0 : s2.actT;
      endScene = t; T.seg(t, t + 3.6, (x, tt) => infoCard(x, A, tt, endScene, f, [f.desc, f.price || 'Get it in the Shop', '1 OF 15 BOOSTERS']));
      T.cue(t, () => { SND.whoosh(); SND.beat.mode('full'); }); t += 3.6;
    } else if (f.kind === 'skin') {
      const rv = t; T.tr(rv); T.cue(rv + 0.4, () => { SND.crash(); SND.win(); }); T.flash(rv + 0.4, '#ffffff', 0.35, 0.5);
      T.seg(rv, rv + 3.0, (x, tt) => {
        const u = tt - rv, wipe = clamp((u - 0.4) / 0.7), lit = { [Math.floor(tt / (b / 2)) % 9]: 1 };
        x.save(); x.beginPath(); x.rect(-200, -200, W * wipe * 1.6 + 200, H + 400); x.clip(); board(x, A, tt, { g, lit, cy: 1080 }); x.restore();
        x.save(); x.beginPath(); x.rect(W * wipe * 1.6, -200, W + 400, H + 400); x.clip(); board(x, A.base, tt, { g, lit, cy: 1080 }); x.restore();
        if (wipe > 0 && wipe < 1) { x.save(); x.globalCompositeOperation = 'lighter'; const sx = W * wipe * 1.6 - 600 * wipe; const sg = x.createLinearGradient(sx - 80, 0, sx + 80, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,.8)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = sg; x.fillRect(sx - 80, 0, 160, H); x.restore(); }
        slam(x, 'NEW SKIN', rv + 0.2, tt, W / 2, 380, 90, 99); slam(x, f.name.toUpperCase(), rv + 0.5, tt, W / 2, 520, 140, 99, { c2: '#e6d8ff' });
        if (u > 1.2) chip(x, f.price || 'In the Shop', W / 2, 1620, 44);
      });
      t = rv + 3.1;
      const s1 = playRound(7, { label: `LEVEL ${lv}`, lv, hype: true });
      T.cue(s1.R.end, () => { SND.beat.fill(); SND.crash(); SND.level(); }); T.drop = s1.R.t0;
      T.seg(rv + 3.0, t, (x, tt) => { const sc = segs[0], R = sc.R; hud(x, A, { max: 3, hearts: 3, level: lv, coins }); const { b: bd, st } = drawRound(x, A, T, R, tt); if (tt < R.t0) { x.fillStyle = 'rgba(6,2,26,.4)'; x.fillRect(0, 300, W, 1250); slam(x, sc.label, sc.intro, tt, W / 2, 1000, 130, R.t0 - sc.intro); } else if (st.phase === 'show') progress(x, st.cur + 1, R.seq.length, bd.bottom + 110); const f2 = fingerAt(R, tt, bd.pos); if (f2 && tt < R.end) finger(x, f2.x, f2.y, f2.press); slam(x, 'LEVEL CLEAR!', R.end, tt, W / 2, bd.top - 50, 96, 1.0); chip(x, `${f.name} skin`, W / 2, 1700, 34); });
      const c0 = t; T.tr(c0); T.cue(c0, () => SND.whoosh());
      const pal = (f.collection || []).slice(0, 6);
      T.seg(c0, c0 + 3.2, (x, tt) => {
        slam(x, f.count ? `${f.count} SKINS` : '20+ SKINS', c0, tt, W / 2, 420, 140, 99); slam(x, 'TO COLLECT', c0 + 0.25, tt, W / 2, 560, 96, 99, { c2: '#e6d8ff' });
        pal.forEach((cols, i) => { const k = eBack((tt - c0 - 0.3 - i * 0.12) / 0.45); if (k <= 0) return; const X = 250 + (i % 3) * 290, Y = 900 + Math.floor(i / 3) * 360, s3 = 230 * k; x.save(); x.translate(X, Y); x.fillStyle = 'rgba(10,4,30,.7)'; rr(x, -s3 / 2 - 14, -s3 / 2 - 14, s3 + 28, s3 + 28, 30); x.fill(); x.strokeStyle = 'rgba(154,109,245,.55)'; x.lineWidth = 3; x.stroke(); for (let q = 0; q < 9; q++) { const ts = s3 / 3 - 8; x.fillStyle = cols.colors[q]; x.globalAlpha = (Math.floor(tt * 4) + i) % 9 === q ? 1 : 0.7; rr(x, -s3 / 2 + (q % 3) * (ts + 12), -s3 / 2 + Math.floor(q / 3) * (ts + 12), ts, ts, ts * 0.22); x.fill(); } x.globalAlpha = 1; x.font = F(800, 26); x.fillStyle = '#fff'; x.textAlign = 'center'; x.fillText(cols.name, 0, s3 / 2 + 50); x.restore(); });
      });
      t = c0 + 3.2;
    } else if (f.kind === 'event' || f.kind === 'challenge') {
      const isImp = f.id === 'imp', stars = f.stars || [5, 7, 9], win = (S.seed || 1) % 2 === 0;
      const lens = isImp ? [6, 10, 14] : f.kind === 'challenge' ? stars : [4, 6, 8];
      const modes = f.modes || [];
      /* banner */
      const bn = t; T.tr(bn); T.cue(bn, () => { SND.crash(); });
      T.seg(bn, bn + 2.6, (x, tt) => {
        const u = tt - bn; featCard(x, A, tt, bn, f, 760, { size: 280 });
        slam(x, f.name.toUpperCase(), bn + 0.2, tt, W / 2, 1060, 120, 99);
        if (u > 0.5) { x.globalAlpha = clamp((u - 0.5) / 0.3); sub(x, f.desc || '', W / 2, 1150, 42, '#efe6ff', 700); x.globalAlpha = 1; }
        if (u > 0.8) chip(x, f.kind === 'event' ? `LIVE NOW · ${f.period || 'DAILY'}` : isImp ? 'HOW FAR CAN YOU GO?' : `★ ${stars.join('  ★ ')} TILES`, W / 2, 1260, 40);
        if (u > 1.1 && f.prize) chip(x, f.prize, W / 2, 1370, 40, 'rgba(43,14,107,.92)');
      });
      t = bn + 2.7;
      const sc = [];
      lens.forEach((n, i) => {
        const last = i === lens.length - 1, wrongAt = last && (isImp || !win) ? n - 1 : -1;
        const lab = f.kind === 'challenge' ? (isImp ? `${n} TILES` : `★ ${i + 1} · ${n} TILES`) : (last ? 'FINAL STAGE' : `STAGE ${i * 3 + 2}`);
        const s1 = playRound(n, { label: lab, boss: last, hype: last, beat: isImp || n >= 9 ? b * 0.75 : n >= 8 ? b * 0.85 : b, pre: 1.0, after: last ? 0 : 0.8, r: { wrongAt, slowLast: last } });
        s1.mode = modes[i] || null; sc.push(s1);
        if (wrongAt < 0) T.cue(s1.R.end, () => { SND.beat.fill(); SND.crash(); SND.level(); }); else { const tw = s1.R.taps[wrongAt]; T.cue(tw + 0.05, () => SND.beat.mode('still')); }
        if (last) T.drop = s1.R.t0;
      });
      const lastS = sc[sc.length - 1], tEnd = lastS.R.end, fail = lastS.R.wrongAt >= 0;
      if (!fail) T.cue(tEnd, () => { SND.win(); });
      const starT = sc.map(q => q.R.wrongAt < 0 ? q.R.end : null);
      t = tEnd + 2.6;
      T.seg(bn + 2.6, t, (x, tt) => {
        const cur = sc.filter(q => tt >= q.intro).pop() || sc[0], R = cur.R, idx = sc.indexOf(cur);
        hud(x, A, { max: f.hearts || 3, hearts: Math.max(0, (f.hearts || 3) - (fail && tt >= R.taps[R.wrongAt] && cur === lastS ? 1 : 0)), level: null, coins });
        const { b: bd, st } = drawRound(x, A, T, R, tt);
        if (f.kind === 'challenge' && !isImp) starRow(x, 3, starT.filter(q => q != null && tt >= q).length, 330, tt, starT);
        if (isImp) { x.save(); x.translate(W / 2, 400); const k = 1 + T.P.kick * 0.06; x.scale(k, k); bigText(x, `${Math.max(0, R.taps.filter(q => tt >= q).length + (st.phase === 'input' ? 0 : 0)) + (idx ? lens[idx - 1] : 0)} / 100`, 0, 0, 120, { font: 'num' }); x.restore(); }
        if (tt < R.t0) { x.fillStyle = 'rgba(6,2,26,.45)'; x.fillRect(0, 300, W, 1250); slam(x, cur.label, cur.intro, tt, W / 2, 980, cur.boss ? 140 : 120, R.t0 - cur.intro, cur.boss ? { c2: '#ffb3c6' } : {}); if (cur.mode) chip(x, `MODE: ${cur.mode}`, W / 2, 1110, 40); }
        else if (st.phase === 'show') progress(x, st.cur + 1, R.seq.length, bd.bottom + 110);
        else if (tt < R.end + 0.1) label(x, R.wrongAt >= 0 && R.taps.length > 1 && tt > R.taps[R.taps.length - 2] ? 'THE LAST ONE…' : `${Math.min(R.seq.length, R.taps.filter(q => tt >= q).length)} / ${R.seq.length}`, bd.bottom + 110);
        const f2 = fingerAt(R, tt, bd.pos); if (f2 && tt < R.taps[R.taps.length - 1] + 0.4) finger(x, f2.x, f2.y, f2.press);
        sc.forEach(q => { if (q !== lastS && q.R.wrongAt < 0) slam(x, f.kind === 'challenge' && !isImp ? '★ STAR!' : 'CLEAR!', q.R.end, tt, W / 2, bd.top - 50, 96, 1.0); });
        if (tt >= tEnd) {
          x.fillStyle = `rgba(6,2,26,${clamp((tt - tEnd) / 0.3) * 0.5})`; x.fillRect(0, 0, W, H);
          if (fail) { slam(x, isImp ? `${lastS.R.seq.length - 1 + (lens[lens.length - 2] || 0)} TILES!` : 'SO CLOSE!', tEnd, tt, W / 2, 900, 150, 99, { c2: '#ffb3c6' }); slam(x, isImp ? 'CAN YOU GO HIGHER?' : 'ONE TILE AWAY', tEnd + 0.4, tt, W / 2, 1050, 80, 99); }
          else { slam(x, f.kind === 'challenge' ? '3 STARS!' : 'EVENT WON!', tEnd, tt, W / 2, 900, 150, 99); if (f.prize) { const k = eBack((tt - tEnd - 0.4) / 0.5); x.save(); x.translate(W / 2, 1080); x.scale(k, k); chip(x, f.prize, 0, 0, 52); x.restore(); } confetti(x, A, tEnd, tt, W / 2, 760); coinBurst(x, tEnd + 0.3, tt, { x: W / 2, y: 1100 }, { x: W - 230, y: 210 }, 12); }
        }
      });
      T.red = tt => fail && tt >= lastS.R.taps[lastS.R.wrongAt] ? clamp(1 - (tt - lastS.R.taps[lastS.R.wrongAt]) / 1.6) : 0;
    }
    const e0 = t; T.cue(e0, () => { SND.beat.mode('full'); SND.crash(); });
    const titles = { booster: 'GET THE EDGE', skin: 'COLLECT THEM ALL', event: 'JOIN THE EVENT', challenge: f.id === 'imp' ? 'BEAT MY SCORE' : 'GET ALL 30 STARS' };
    T.seg(e0, e0 + 4.6, (x, tt) => endCard(x, A, tt, e0, { title: S.endTitle || titles[f.kind] || 'PLAY FREE', line: S.sanxLine || 'Free on Google Play.', footer: S.footer }));
    T.wash = tt => { const cur = segs.filter(q => q.R && tt >= q.intro).pop(); return cur ? washOf(cur.R, tt) : null; };
    return T;
  };

  /* ================= ASSETS + RENDER ================= */
  /* assets are loaded once per skin / avatar / feature and reused (changing looks stays instant) */
  const ACACHE = new Map();
  function assets(spec) {
    const f = spec.feature, key = [spec.skin || lookSkin(spec.style, spec.variation || 1) || 'player', spec.avatar || '', spec.meImg ? spec.meImg.length + spec.meImg.slice(-40) : '', spec.meName ? 1 : 0, f ? f.kind + f.id + (f.others || []).map(o => o.icon).join() : '', (spec.colors || []).join()].join('|');
    if (!ACACHE.has(key)) { if (ACACHE.size > 40) ACACHE.clear(); ACACHE.set(key, assets0(spec).catch(e => { ACACHE.delete(key); throw e; })); }
    return ACACHE.get(key);
  }
  async function assets0(spec) {
    try { await document.fonts.load(F(900, 40)); await document.fonts.load(F(800, 30)); } catch (e) { }
    try { await document.fonts.load(FT(60)); await document.fonts.load(FN(60)); } catch (e) { }
    const sx = {}; for (const m of ['smug', 'laugh', 'shock', 'angry', 'sad']) sx[m] = await svgImg(ART.sanx(m));
    const rng = mul(77);
    const sk = spec.skin || lookSkin(spec.style, spec.variation || 1);
    const skin = sk ? D.skin(sk) : (typeof S !== 'undefined' && S.active ? D.skin(S.active('skin')) : D.SKINS[0]);
    const EXTRA = ['diamond', 'flame', 'drop', 'leaf', 'cloud', 'crown', 'plus', 'x', 'comet', 'planet', 'rocket', 'compass', 'chip', 'shield', 'square', 'skull'];
    const icons = await Promise.all([...skin.icons, ...EXTRA].map(n => svgImg(ART.tileIc(n).replace('class="ti" ', 'width="96" height="96" '))));
    let base = null;
    if (spec.feature && spec.feature.kind === 'skin') { const s0 = D.SKINS[0]; base = { colors: s0.colors, icons: await Promise.all([...s0.icons, ...EXTRA].map(n => svgImg(ART.tileIc(n).replace('class="ti" ', 'width="96" height="96" ')))) }; }
    const out = {
      colors: spec.colors && spec.colors.length >= 9 ? spec.colors : skin.colors, icons,
      stars: Array.from({ length: 140 }, () => ({ x: rng() * W, y: rng() * H, r: 0.8 + rng() * 2.4, a: 0.3 + rng() * 0.7, s: 1 + rng() * 3, v: rng() * 6 })),
      logo: await load('img/logo.png'), gplay: await load('share/gplay.png'),
      digits: await Promise.all([...Array(10).keys()].map(d => load(`share/d${d}.png`))),
      sanx: sx, sanxDisc: sx.smug, av: spec.avatar ? await load(spec.avatar) : null, me: spec.meImg ? await load(spec.meImg) : (spec.meName && spec.avatar ? await load(spec.avatar) : null),
      fIcon: spec.feature && spec.feature.icon ? await svgImg(icSvg(spec.feature.icon)) : null,
      oIcons: spec.feature && spec.feature.others ? await Promise.all(spec.feature.others.map(o => svgImg(icSvg(o.icon)))) : [],
      dust: Array.from({ length: 50 }, () => ({ x: rng() * W, y: rng() * H, r: 1.5 + rng() * 3, s: 10 + rng() * 30, a: 0.15 + rng() * 0.35 })),
      conf: Array.from({ length: 90 }, () => ({ vx: (rng() - 0.5) * 30, vy: -10 - rng() * 22, r: rng() * 6, vr: (rng() - 0.5) * 12, w: 14 + rng() * 14, h: 8 + rng() * 10, c: ['#9a6df5', '#c4a7ff', '#ffffff', '#743ae8', '#ff3d7f', '#00e5ff'][Math.floor(rng() * 6)] }))
    };
    if (base) out.base = Object.assign({}, out, base);
    return out;
  }
  const icSvg = n => ART.ic(n).replace(/class="[^"]*"/, 'width="96" height="96"').replace(/currentColor/g, '#ffffff');
  function build(spec, A) {
    SYNC = !!spec.sync;
    const T = (STYLES[spec.style] || STYLES.play)(spec, A, mul(spec.seed || 1)); SYNC = false;
    T.total = T.end;
    END_ME.name = spec.meName || '';
    T.look = look(spec.style, spec.variation || 1, T.world || 'studio'); T.world = T.look.world;
    /* cuts: every segment start + the style's own marks, at least 0.6 s apart */
    const marks = [...T.trs, ...T.segs.map(g => g.a)].filter(t => t > 0.6 && t < T.total - 0.3).sort((a, b) => a - b);
    T.trs = marks.filter((t, i) => !i || t - marks[i - 1] > 0.6);
    T.drop = T.drop != null ? T.drop : (T.trs[1] || T.total * 0.4);
    T.outro = T.segs.length ? T.segs[T.segs.length - 1].a : T.total - 4.6;
    T.spec = spec;
    /* the screen breathes with the song's beat */
    if (T.sync) for (let t = 0; t < T.total; t += T.beat) T.cue(t, () => { T.P.pulse = 1; });
    return T;
  }
  function trAt(T, t) { for (const tt of T.trs) { const u = (t - tt) / 0.24; if (u > -1 && u < 1) return u; } return null; }
  /* pro intro FX on top of every hook: light burst + logo slam with a shine sweep */
  function intro(x, A, t) {
    if (t > 2.4) return;
    if (t < 0.9) { const ir = sprite('introRays', 2200, 2200, g => { g.translate(1100, 1100); for (let k = 0; k < 16; k++) { g.rotate(Math.PI / 8); const gr = g.createLinearGradient(0, 0, 0, -1100); gr.addColorStop(0, 'rgba(196,167,255,.5)'); gr.addColorStop(1, 'rgba(196,167,255,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(-18, -160); g.lineTo(18, -160); g.lineTo(60, -1100); g.lineTo(-60, -1100); g.closePath(); g.fill(); } }, 0.35);
      const e = Math.max(0.05, eOut(t / 0.5)); x.save(); x.globalCompositeOperation = 'lighter'; x.globalAlpha = 1 - t / 0.9; x.translate(W / 2, 900); x.scale(e, e); stamp(x, ir, -1100, -1100); x.restore(); }
    if (A.logo) {
      const k = t < 0.3 ? lerp(1.8, 1, eOut(t / 0.3)) : 1, lw = 400 * k, lh = lw * A.logo.height / A.logo.width, lx = (W - lw) / 2, ly = 120;
      x.globalAlpha = clamp(t / 0.1) * clamp((2.4 - t) / 0.3); x.drawImage(A.logo, lx, ly, lw, lh);
      if (t > 0.3 && t < 1.1) { x.save(); x.beginPath(); x.rect(lx, ly, lw, lh); x.clip(); const sx = lx + (t - 0.3) / 0.8 * (lw + 300) - 150; const g = x.createLinearGradient(sx - 60, 0, sx + 60, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.globalCompositeOperation = 'lighter'; x.fillStyle = g; x.fillRect(lx, ly, lw, lh); x.restore(); }
      x.globalAlpha = 1;
    }
  }
  function frame(x, A, T, t, scale, dt = 1 / 30) {
    if (T.look) LK = T.look;
    RS = scale;
    if (x.reset) x.reset(); else { x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.shadowBlur = 0; x.filter = 'none'; }
    x.setTransform(scale, 0, 0, scale, 0, 0); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    T.P.kick *= Math.pow(0.86, dt * 30); T.P.pulse *= Math.pow(0.8, dt * 30);
    const c = Object.assign({}, camAt(T, t)), cm = LK.cam, tu = trAt(T, t), tk = tu == null ? 0 : 1 - Math.abs(tu);
    if (cm === 'calm') c.z = 1 + (c.z - 1) * 0.45;
    let sx = 0, sy = 0, rot = 0; const sa = cm === 'calm' ? 0.4 : 1;
    for (const s of T.shakes) { const u = t - s.t; if (u >= 0 && u < s.d) { const k = (1 - u / s.d) * s.amp * sa; sx += Math.sin(u * 90) * k; sy += Math.cos(u * 77) * k; } }
    if (cm === 'drift') { sx += Math.sin(t * 0.6) * 16; sy += Math.sin(t * 0.43 + 1) * 12; rot = Math.sin(t * 0.5) * 0.012; c.z *= 1.03; }
    if (LK.trans === 'zoom' && tk) c.z *= 1 + 0.16 * tk * tk;
    x.save(); x.translate(W / 2 + c.x + sx, H / 2 + c.y + sy); x.rotate(rot); x.scale(c.z, c.z); x.translate(-W / 2, -H / 2);
    const wash = T.wash ? T.wash(t) : null;
    bg(x, A, t, wash, (wash ? 0.8 : 0.4) + T.P.pulse * 0.35, T.world || 'studio', T.beat);
    if (T.P.pulse > 0.02) { const pg = x.createRadialGradient(W / 2, H * 0.5, 100, W / 2, H * 0.5, H * 0.7); pg.addColorStop(0, `rgba(154,109,245,${0.12 * T.P.pulse})`); pg.addColorStop(1, 'rgba(154,109,245,0)'); x.fillStyle = pg; x.fillRect(0, 0, W, H); }
    /* one bad frame never stops the video: the scene is skipped for that frame only */
    for (const s of T.segs) if (t >= s.a && t < s.b) { x.save(); try { s.draw(x, t); } catch (e) { if ((frame.warned = (frame.warned || 0) + 1) < 20) console.warn('clip frame', t.toFixed(2), String(e)); } x.restore(); x.globalAlpha = 1; x.shadowBlur = 0; x.filter = 'none'; x.globalCompositeOperation = 'source-over'; }
    x.restore();
    if (T.spec && T.spec.feature && T.spec.style !== 'spot') { try { featOverlay(x, A, T, t); } catch (e) { } }
    if (T.intro !== false) intro(x, A, t);
    if (LK.mood === 'midnight') { x.fillStyle = 'rgba(4,0,24,.16)'; x.fillRect(0, 0, W, H); }
    else if (LK.mood === 'electric') { x.save(); x.globalCompositeOperation = 'lighter'; x.fillStyle = 'rgba(116,58,232,.07)'; x.fillRect(0, 0, W, H); x.restore(); }
    vignette(x, T.red ? T.red(t) : 0);
    overlayFrame(x, LK.frame, t);
    for (const f of T.flashes) { const u = t - f.t; if (u >= 0 && u < f.d) { x.globalAlpha = f.a * (1 - u / f.d); x.fillStyle = f.col; x.fillRect(0, 0, W, H); x.globalAlpha = 1; } }
    if (tk) transition(x, LK.trans, tu, tk, scale);
  }
  /* any style + a feature: the booster bar is live in the run and the booster is tapped right before the
     big moment; events and challenges get a badge. The outro title follows the feature. */
  function featOverlay(x, A, T, t) {
    const f = T.spec.feature, out = T.outro || T.total; if (t < 2.9 || t >= out) return;
    if (f.kind === 'booster') {
      const tap = Math.max(3.2, T.drop - 1.1), others = f.others || [];
      const BY = T.spec.style === 'duel' ? 1850 : 1818;
      boostBar(x, A, t, [{ img: A.oIcons[0], name: '' }, { img: A.fIcon, name: f.name }, { img: A.oIcons[1], name: '' }], tap, BY, 2.9, tap, 104, false);
      if (t > tap - 0.6 && t < tap + 0.45) finger(x, W / 2 + 6, lerp(1990, BY + 14, eOut((t - tap + 0.6) / 0.5)), Math.max(0, 1 - Math.abs(t - tap) / 0.12), 0.8);
      if (t >= tap && t < tap + 1.5) { const k = eBack((t - tap) / 0.35); x.save(); x.globalAlpha = clamp((tap + 1.5 - t) / 0.3); x.translate(W / 2, BY - 92); x.scale(k, k); chip(x, `⚡ ${f.name.toUpperCase()} ACTIVATED`, 0, 0, 34, 'rgba(116,58,232,.97)'); x.restore(); }
      return;
    }
    if (f.kind === 'event' || f.kind === 'challenge') {
      const lab = (f.kind === 'event' ? 'EVENT · ' : f.id === 'imp' ? '' : 'CHALLENGE · ') + f.name.toUpperCase(), k = eBack((t - 2.9) / 0.4);
      x.save(); x.translate(W / 2, 1812); x.scale(k, k); chip(x, lab, 0, 0, 30, 'rgba(43,14,107,.92)'); x.restore();
    }
  }
  /* a finishing frame on top of everything, different per variation */
  function overlayFrame(x, kind, t) {
    if (!kind || kind === 'none') return;
    if (kind === 'viewfinder') {
      x.strokeStyle = 'rgba(255,255,255,.75)'; x.lineWidth = 6; x.lineCap = 'round'; const m = 46, L = 90;
      for (const [cx, cy, dx, dy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) { x.beginPath(); x.moveTo(cx, cy + dy * L); x.lineTo(cx, cy); x.lineTo(cx + dx * L, cy); x.stroke(); }
      if (Math.floor(t * 1.6) % 2 === 0) { x.fillStyle = '#ff2d5a'; x.beginPath(); x.arc(m + 44, m + 52, 13, 0, 7); x.fill(); }
      x.font = F(800, 30); x.fillStyle = '#fff'; x.textAlign = 'left'; x.fillText('REC', m + 68, m + 63);
      const sec = Math.floor(t), fr = Math.floor((t % 1) * 30); x.textAlign = 'right'; x.font = F(700, 28); x.fillText(`00:00:${String(sec).padStart(2, '0')}:${String(fr).padStart(2, '0')}`, W - m - 20, H - m - 22);
      x.fillText('4K · 60', W - m - 20, m + 63); return;
    }
    if (kind === 'cinema') {
      x.fillStyle = 'rgba(0,0,0,.88)'; x.fillRect(0, 0, W, 76); x.fillRect(0, H - 76, W, 76);
      x.font = F(800, 20); x.fillStyle = 'rgba(214,196,255,.85)'; x.textAlign = 'center'; x.fillText('B E A T   S A N X   ·   M E M O R Y   G A M E', W / 2, H - 31);
      return;
    }
    if (kind === 'glow') {
      const gf = sprite('glowFrame', W, H, g => { g.shadowColor = '#9a6df5'; g.shadowBlur = 36; g.strokeStyle = 'rgba(196,167,255,1)'; g.lineWidth = 7; rr(g, 22, 22, W - 44, H - 44, 70); g.stroke(); }, 0.6);
      x.save(); x.globalAlpha = 0.55 + 0.25 * Math.sin(t * 3); stamp(x, gf, 0, 0, W, H); x.restore();
      return;
    }
    if (kind === 'grain') {
      const n = Math.floor(t * 12) % 4, gr = sprite('grain' + n, W, H, g => { const r = mul(n * 97 + 5); g.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 1400; i++) g.fillRect(r() * W, r() * H, 2.5, 2.5); g.fillStyle = 'rgba(0,0,0,.08)'; for (let y = 0; y < H; y += 6) g.fillRect(0, y, W, 2); }, 0.5);
      stamp(x, gr, 0, 0, W, H);
    }
  }
  /* the cut between scenes, different per variation */
  function transition(x, kind, u, k, scale) {
    if (kind === 'flash') { if (u > -0.35) { x.globalAlpha = 0.55 * k * k; x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, H); x.globalAlpha = 1; } return; }
    if (kind === 'swipe') {
      const p = (u + 1) / 2, X0 = -W * 0.9 + p * W * 2.8;
      x.save(); x.translate(X0, H / 2); x.rotate(0.35);
      const g1 = x.createLinearGradient(-260, 0, 260, 0); g1.addColorStop(0, 'rgba(116,58,232,0)'); g1.addColorStop(0.25, '#743ae8'); g1.addColorStop(0.6, '#9a6df5'); g1.addColorStop(1, 'rgba(154,109,245,0)');
      x.fillStyle = g1; x.fillRect(-260, -H, 520, H * 2); x.fillStyle = 'rgba(255,255,255,.75)'; x.fillRect(150, -H, 10, H * 2); x.restore(); return;
    }
    if (kind === 'zoom') {
      x.save(); x.globalCompositeOperation = 'lighter'; x.translate(W / 2, H / 2);
      for (let i = 0; i < 26; i++) { const a = i * 0.2417 * 26, r1 = 260 + (i * 97) % 300; x.rotate(a); x.strokeStyle = `rgba(214,196,255,${0.35 * k})`; x.lineWidth = 6; x.beginPath(); x.moveTo(r1, 0); x.lineTo(r1 + 500 * k, 0); x.stroke(); }
      x.restore(); return;
    }
    if (kind === 'glitch') {
      const cv = x.canvas, cw = cv.width, ch = cv.height; x.save(); x.setTransform(1, 0, 0, 1, 0, 0);
      const r = mul(Math.floor((u + 1) * 12) + 3);
      for (let i = 0; i < 9; i++) { const y = Math.floor(r() * ch), h = Math.max(4, Math.floor(r() * ch * 0.06)), dx = Math.round((r() - 0.5) * cw * 0.12 * k); x.drawImage(cv, 0, y, cw, h, dx, y, cw, h); }
      x.globalCompositeOperation = 'lighter'; x.fillStyle = `rgba(154,109,245,${0.18 * k})`; for (let i = 0; i < 5; i++) x.fillRect(0, r() * ch, cw, r() * ch * 0.03);
      x.restore();
    }
  }
  async function make(spec, { w = 720, h = 1280, fps = 30, onProgress, canvas, music = null, musicVol = 0.8, sfxVol = 1 } = {}) {
    if (!canRecord()) throw new Error('This phone cannot record video');
    const cv = canvas || document.createElement('canvas'); cv.width = w; cv.height = h;
    const x = cv.getContext('2d'), A = await assets(spec), T = build(spec, A), scale = w / W;
    const vs = cv.captureStream(fps), as = SND.rec(true);
    const stream = new MediaStream([...vs.getVideoTracks(), ...(as ? as.getAudioTracks() : [])]);
    const mime = pickMime();
    const recd = new MediaRecorder(stream, Object.assign({ videoBitsPerSecond: w >= 1080 ? 10e6 : 6e6, audioBitsPerSecond: 160000 }, mime ? { mimeType: mime } : {}));
    const chunks = []; recd.ondataavailable = e => e.data && e.data.size && chunks.push(e.data);
    const done = new Promise(res => { recd.onstop = res; });
    SND.beat.stop(); SND.beat.lock(!!music); SND.beat.start(T.bpm, music ? 'still' : 'light'); SND.sfxVol(sfxVol);
    frame(x, A, T, 0, scale);
    recd.start(250);
    const T0 = SND.beat.t0 || SND.now(), cues = T.cues.slice().sort((a, b) => a.t - b.t); let ci = 0, last = 0;
    if (music && music.key) SND.key(music.key.root, music.key.minor);
    const mus = music ? playMusic(music, T, T0, musicVol) : null;
    await new Promise(res => {
      const loop = () => {
        const t = SND.now() - T0;
        /* cues are scheduled 0.12 s ahead at their exact time, so every note lands on the beat */
        while (ci < cues.length && cues[ci].t <= t + 0.12) { SND.at(T0 + cues[ci].t); try { cues[ci].fn(); } catch (e) { } SND.at(null); ci++; }
        try { frame(x, A, T, Math.max(0, Math.min(t, T.total)), scale, Math.max(0.001, t - last)); } catch (e) { console.warn('frame', e); } last = t;
        if (onProgress) onProgress(Math.min(1, t / T.total));
        if (t >= T.total + 0.3) return res();
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    });
    if (mus) mus.stop();
    recd.stop(); await done;
    SND.beat.stop(); SND.beat.lock(false); SND.rec(false); SND.setVol(); SND.key(null);
    const type = (recd.mimeType || mime || 'video/webm').split(';')[0];
    return { blob: new Blob(chunks, { type }), mime: type, ext: type.includes('mp4') ? 'mp4' : 'webm', secs: T.total };
  }
  /* ================= HD RENDER (Studio) =================
     Real 1080p: the sound is recorded first in real time (sample-exact capture of the game mix + song),
     then every video frame is rendered OFFLINE at exactly 30 fps and encoded with a high-quality H.264
     encoder (16 Mbps), then both are joined into an MP4 with AAC sound. No dropped frames on any laptop. */
  const canHQ = () => !!(window.VideoEncoder && window.VideoFrame && window.AudioWorkletNode);
  async function captureAudio(T, music, musicVol, sfxVol, onTick) {
    const c = SND.ctx(); if (c.state !== 'running') await c.resume();
    if (!captureAudio.ready) { const code = `class C extends AudioWorkletProcessor{process(i){const ch=i[0];if(ch&&ch.length){this.port.postMessage([ch[0].slice(0),(ch[1]||ch[0]).slice(0)]);}return true;}}registerProcessor('bs-cap',C);`; await c.audioWorklet.addModule(URL.createObjectURL(new Blob([code], { type: 'application/javascript' }))); captureAudio.ready = true; }
    const cap = new AudioWorkletNode(c, 'bs-cap', { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2], channelCount: 2, channelCountMode: 'explicit' });
    const L = [], R = []; cap.port.onmessage = e => { L.push(e.data[0]); R.push(e.data[1]); };
    SND.rec(true); const master = SND.masterNode(); master.connect(cap); cap.connect(c.destination);
    /* sync spike: one full-scale sample at a known time, straight into the capture (never heard) */
    const sb = c.createBuffer(1, 1, c.sampleRate); sb.getChannelData(0)[0] = 1; const sp = c.createBufferSource(); sp.buffer = sb; sp.connect(cap);
    const tSpike = c.currentTime + 0.15; sp.start(tSpike);
    await new Promise(r => setTimeout(r, 450));
    SND.beat.stop(); SND.beat.lock(!!music); SND.beat.start(T.bpm, music ? 'still' : 'light'); SND.sfxVol(sfxVol);
    if (music && music.key) SND.key(music.key.root, music.key.minor);
    const T0 = SND.beat.t0 || SND.now(), cues = T.cues.slice().sort((a, b) => a.t - b.t); let ci = 0; captureAudio.T0 = T0;
    const mus = music ? playMusic(music, T, T0, musicVol) : null;
    await new Promise(res => { const loop = () => { const t = SND.now() - T0; while (ci < cues.length && cues[ci].t <= t + 0.12) { SND.at(T0 + cues[ci].t); try { cues[ci].fn(); } catch (e) { } SND.at(null); ci++; } if (onTick) onTick(Math.max(0, Math.min(t, T.total))); if (t >= T.total + 0.35) return res(); requestAnimationFrame(loop); }; requestAnimationFrame(loop); });
    if (mus) mus.stop(); SND.beat.stop(); SND.beat.lock(false); SND.key(null); SND.setVol();
    await new Promise(r => setTimeout(r, 120));
    try { master.disconnect(cap); } catch (e) { } cap.disconnect(); cap.port.onmessage = null; SND.rec(false);
    /* stitch, find the spike, cut exactly [T0, T0 + total] */
    const n = L.reduce((a, b) => a + b.length, 0), l = new Float32Array(n), r = new Float32Array(n); let o = 0;
    for (let i = 0; i < L.length; i++) { l.set(L[i], o); r.set(R[i], o); o += L[i].length; }
    let si = 0; for (let i = 0; i < n; i++) if (l[i] > 0.97) { si = i; break; }
    const sr = c.sampleRate, i0 = si + Math.round((T0 - tSpike) * sr), N = Math.round(T.total * sr);
    const pcm = new Int16Array(N * 2);
    for (let i = 0; i < N; i++) { const j = i0 + i, a = j >= 0 && j < n ? l[j] : 0, b = j >= 0 && j < n ? r[j] : 0; pcm[i * 2] = Math.max(-1, Math.min(1, a)) * 32767; pcm[i * 2 + 1] = Math.max(-1, Math.min(1, b)) * 32767; }
    /* wav */
    const hd = new DataView(new ArrayBuffer(44)), ws = (p2, t2) => [...t2].forEach((ch, k) => hd.setUint8(p2 + k, ch.charCodeAt(0)));
    ws(0, 'RIFF'); hd.setUint32(4, 36 + pcm.byteLength, true); ws(8, 'WAVE'); ws(12, 'fmt '); hd.setUint32(16, 16, true); hd.setUint16(20, 1, true); hd.setUint16(22, 2, true); hd.setUint32(24, sr, true); hd.setUint32(28, sr * 4, true); hd.setUint16(32, 4, true); hd.setUint16(34, 16, true); ws(36, 'data'); hd.setUint32(40, pcm.byteLength, true);
    return new Uint8Array(await new Blob([hd.buffer, pcm.buffer]).arrayBuffer());
  }
  async function makeHQ(spec, { w = 1080, h = 1920, fps = 30, music = null, musicVol = 0.8, sfxVol = 1, onProgress, onStage, canvas, ffmpeg } = {}) {
    const A = await assets(spec), scale = w / W;
    /* 1) sound, live (the preview canvas shows the video while it records) */
    if (onStage) onStage('sound');
    const T1 = build(spec, A), pv = canvas ? canvas.getContext('2d') : null; if (canvas) { canvas.width = 540; canvas.height = 960; }
    let lastT = 0;
    const wav = await captureAudio(T1, music, musicVol, sfxVol, t => { if (pv) { try { frame(pv, A, T1, t, 540 / W, Math.max(0.001, t - lastT)); } catch (e) { } lastT = t; } if (onProgress) onProgress(0.4 * t / T1.total); });
    /* 2) video, offline: exact frames, high-quality encoder */
    if (onStage) onStage('video');
    const T = build(spec, A), big = document.createElement('canvas'); big.width = w; big.height = h; const x = big.getContext('2d');
    const chunks = []; let err = null;
    const enc = new VideoEncoder({ output: ch => { const b = new Uint8Array(ch.byteLength); ch.copyTo(b); chunks.push(b); }, error: e => { err = e; } });
    let cfg = null;
    for (const codec of ['avc1.640028', 'avc1.4d0028', 'avc1.42e028']) { const c2 = { codec, width: w, height: h, bitrate: w >= 1080 ? 16e6 : 9e6, framerate: fps, latencyMode: 'quality', avc: { format: 'annexb' } }; try { if ((await VideoEncoder.isConfigSupported(c2)).supported) { cfg = c2; break; } } catch (e) { } }
    if (!cfg) throw new Error('HD encoder not available in this browser');
    enc.configure(cfg);
    const cues = T.cues.slice().sort((a, b) => a.t - b.t); let ci = 0; const N = Math.ceil(T.total * fps);
    SND.silent(true);
    try {
      for (let i = 0; i <= N; i++) {
        if (err) throw err;
        const t = Math.min(T.total, i / fps);
        while (ci < cues.length && cues[ci].t <= t) { try { cues[ci].fn(); } catch (e) { } ci++; }
        try { frame(x, A, T, t, scale, 1 / fps); } catch (e) { }
        const vf = new VideoFrame(big, { timestamp: Math.round(i * 1e6 / fps), duration: Math.round(1e6 / fps) });
        enc.encode(vf, { keyFrame: i % (fps * 2) === 0 }); vf.close();
        while (enc.encodeQueueSize > 4) await new Promise(r => setTimeout(r, 2));
        if (i % 6 === 0) { if (pv) pv.drawImage(big, 0, 0, 540, 960); if (onProgress) onProgress(0.4 + 0.55 * i / N); await new Promise(r => setTimeout(r, 0)); }
      }
      await enc.flush();
    } finally { SND.silent(false); try { enc.close(); } catch (e) { } }
    if (err) throw err;
    const n = chunks.reduce((a, b) => a + b.length, 0), h264 = new Uint8Array(n); let o = 0; for (const c3 of chunks) { h264.set(c3, o); o += c3.length; }
    /* 3) join video + AAC sound into an MP4 */
    if (onStage) onStage('mux');
    const ff = await ffmpeg();
    await ff.writeFile('v.h264', h264); await ff.writeFile('a.wav', wav);
    await ff.exec(['-r', String(fps), '-i', 'v.h264', '-i', 'a.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', 'out.mp4']);
    const data = await ff.readFile('out.mp4'); for (const f of ['v.h264', 'a.wav', 'out.mp4']) { try { await ff.deleteFile(f); } catch (e) { } }
    if (onProgress) onProgress(1);
    return { blob: new Blob([data.buffer], { type: 'video/mp4' }), mime: 'video/mp4', ext: 'mp4', secs: T.total, aac: true, hq: true };
  }
  /* live preview with sound (Studio) */
  async function preview(spec, canvas, w = 540, h = 960, withSound = true, music = null, musicVol = 0.8) {
    canvas.width = w; canvas.height = h; const x = canvas.getContext('2d'), A = await assets(spec), T = build(spec, A);
    const cues = T.cues.slice().sort((a, b) => a.t - b.t); let ci = 0, last = 0;
    if (withSound) { SND.beat.stop(); SND.beat.lock(!!music); SND.beat.start(T.bpm, music ? 'still' : 'light'); }
    const T0 = withSound ? (SND.beat.t0 || SND.now()) : 0;
    if (withSound && music && music.key) SND.key(music.key.root, music.key.minor);
    const mus = withSound && music ? playMusic(music, T, T0, musicVol) : null;
    return {
      total: T.total,
      draw: tt => { const t = withSound ? SND.now() - T0 : tt; if (withSound) while (ci < cues.length && cues[ci].t <= t + 0.12) { SND.at(T0 + cues[ci].t); try { cues[ci].fn(); } catch (e) { } SND.at(null); ci++; } try { frame(x, A, T, Math.max(0, Math.min(t, T.total)), w / W, Math.max(0.001, t - last)); } catch (e) { console.warn('frame', e); } last = t; return t; },
      stop: () => { if (mus) mus.stop(); if (withSound) { SND.beat.stop(); SND.beat.lock(false); SND.key(null); } }
    };
  }
  /* draw one frame at time t (for thumbnails / tests) */
  async function still(spec, canvas, t, w = 540, h = 960) { canvas.width = w; canvas.height = h; const x = canvas.getContext('2d'), A = await assets(spec), T = build(spec, A); frame(x, A, T, t, w / W); return T.total; }
  /* ================= MUSIC ANALYSIS =================
     Finds the song's exact tempo and beat grid, where each bar starts, where the big "drop" is,
     and the musical key, so the video can be cut on the beat, the climax can land on the drop
     and the tile notes can be played in the song's key. Everything runs in the browser. */
  async function render(buf, sr, lp) {
    const len = Math.ceil(buf.duration * sr), oc = new OfflineAudioContext(1, len, sr), src = oc.createBufferSource(); src.buffer = buf;
    if (lp) { const f = oc.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; f.Q.value = 0.7; src.connect(f); f.connect(oc.destination); } else src.connect(oc.destination);
    src.start(); return (await oc.startRendering()).getChannelData(0);
  }
  function envelope(d, hop) { const n = Math.floor(d.length / hop), e = new Float32Array(n); for (let i = 0; i < n; i++) { let s2 = 0; for (let j = 0; j < hop; j++) { const v = d[i * hop + j]; s2 += v * v; } e[i] = Math.log(1e-6 + Math.sqrt(s2 / hop)); } return e; }
  function flux(e) { const o = new Float32Array(e.length); for (let i = 1; i < e.length; i++) o[i] = Math.max(0, e[i] - e[i - 1]); let m = 0; for (const v of o) m = Math.max(m, v); if (m) for (let i = 0; i < o.length; i++) o[i] /= m; return o; }
  function fft(re, im) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
    for (let len = 2; len <= n; len <<= 1) { const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang); for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const a = i + k, b2 = a + len / 2, tr = re[b2] * cr - im[b2] * ci, ti = re[b2] * ci + im[b2] * cr; re[b2] = re[a] - tr; im[b2] = im[a] - ti; re[a] += tr; im[a] += ti; const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr; } } }
  }
  /* Krumhansl-Schmuckler key profiles */
  const KMAJ = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88], KMIN = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
  const PITCH = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  function detectKey(d, sr, from, to) {
    const N = 4096, chroma = new Float64Array(12), re = new Float64Array(N), im = new Float64Array(N), win = Float64Array.from({ length: N }, (_, i) => 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N));
    const a = Math.floor(from * sr), b = Math.min(d.length - N, Math.floor(to * sr)), step = Math.max(N, Math.floor((b - a) / 160));
    for (let p = a; p < b; p += step) {
      for (let i = 0; i < N; i++) { re[i] = d[p + i] * win[i]; im[i] = 0; } fft(re, im);
      for (let k = 2; k < N / 2; k++) { const f = k * sr / N; if (f < 60 || f > 2000) continue; const m = Math.sqrt(re[k] * re[k] + im[k] * im[k]), pc = ((Math.round(12 * Math.log2(f / 261.63)) % 12) + 12) % 12; chroma[pc] += m; }
    }
    const corr = (prof, r) => { let mx = 0, my = 0; for (let i = 0; i < 12; i++) { mx += chroma[(i + r) % 12]; my += prof[i]; } mx /= 12; my /= 12; let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < 12; i++) { const dx = chroma[(i + r) % 12] - mx, dy = prof[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; } return sxy / Math.sqrt(sxx * syy || 1); };
    let best = { s: -2 }; for (let r = 0; r < 12; r++) for (const minor of [false, true]) { const sc = corr(minor ? KMIN : KMAJ, r); if (sc > best.s) best = { s: sc, r, minor }; }
    let root = 261.63 * Math.pow(2, best.r / 12); while (root > 330) root /= 2; while (root < 196) root *= 2;
    return { name: PITCH[best.r] + (best.minor ? ' minor' : ' major'), root, minor: best.minor, conf: best.s };
  }
  async function loadMusic(file) {
    const c = SND.ctx(), buf = await c.decodeAudioData(await file.arrayBuffer());
    const sr = 11025, hop = 110, fps = sr / hop;
    const full = await render(buf, sr), low = await render(buf, sr, 160);
    const oF = flux(envelope(full, hop)), oL = flux(envelope(low, hop)), n = oF.length, o = new Float32Array(n);
    for (let i = 0; i < n; i++) o[i] = oF[i] + 1.4 * oL[i];
    const at = tt => { const f = tt * fps, i = Math.floor(f), k = f - i; return i >= 0 && i + 1 < n ? o[i] * (1 - k) + o[i + 1] * k : 0; };
    /* 1) rough tempo: autocorrelation of the onset curve, gently preferring 90-140 BPM */
    const A0 = Math.floor(n * 0.1), A1 = Math.min(n, A0 + Math.floor(fps * 90));
    let bestB = 110, bestS = -1;
    for (let bpm = 70; bpm <= 180; bpm += 0.5) { const lag = 60 / bpm * fps; let sc = 0; for (let i = A0; i + lag * 2 < A1; i++) { const j = i + lag, j0 = Math.floor(j), k = j - j0; sc += o[i] * (o[j0] * (1 - k) + o[j0 + 1] * k); } sc *= Math.exp(-Math.pow(Math.log2(bpm / 118), 2) * 1.6); if (sc > bestS) { bestS = sc; bestB = bpm; } }
    /* 2) exact tempo + phase: comb over the whole song */
    let bpm = bestB, phase = 0, best = -1;
    for (let b2 = bestB - 1.2; b2 <= bestB + 1.2; b2 += 0.02) {
      const P = 60 / b2, beats = Math.floor((buf.duration - 1) / P);
      for (let ph = 0; ph < P; ph += P / 48) { let sc = 0; for (let k = 0; k < beats; k++) sc += at(ph + k * P); if (sc > best) { best = sc; bpm = b2; phase = ph; } }
    }
    const P = 60 / bpm, nb = Math.floor((buf.duration - phase) / P);
    /* fine phase (+/- 20 ms) */
    let fp = phase, fb = -1; for (let d = -0.02; d <= 0.02; d += 0.002) { let sc = 0; for (let k = 0; k < nb; k++) sc += at(phase + d + k * P); if (sc > fb) { fb = sc; fp = phase + d; } } phase = ((fp % P) + P) % P;
    /* 3) downbeat: the beat of the bar where the kick hits hardest */
    const atL = tt => { const i = Math.round(tt * fps); return i >= 0 && i < n ? oL[i] : 0; };
    let db = 0, dbS = -1; for (let j = 0; j < 4; j++) { let sc = 0; for (let k = j; k < nb; k += 4) sc += atL(phase + k * P); if (sc > dbS) { dbS = sc; db = j; } }
    const bar0 = phase + db * P, barLen = P * 4, nbar = Math.floor((buf.duration - bar0) / barLen);
    /* 4) loudness per bar, drops = biggest jump into a loud section */
    const rmsAt = (a2, b3) => { const i0 = Math.max(0, Math.floor(a2 * sr)), i1 = Math.min(full.length, Math.floor(b3 * sr)); let s2 = 0; for (let i = i0; i < i1; i += 4) s2 += full[i] * full[i]; return Math.sqrt(s2 / Math.max(1, (i1 - i0) / 4)); };
    const bars = []; for (let k = 0; k < nbar; k++) bars.push(rmsAt(bar0 + k * barLen, bar0 + (k + 1) * barLen));
    const mean = (a2, b3) => { let s2 = 0, c2 = 0; for (let k = Math.max(0, a2); k < Math.min(bars.length, b3); k++) { s2 += bars[k]; c2++; } return c2 ? s2 / c2 : 0; };
    const maxBar = Math.max(...bars, 1e-6), drops = [];
    for (let k = 2; k < bars.length - 2; k++) { const after = mean(k, k + 4), before = mean(k - 4, k), sc = (after - before) / maxBar + 0.6 * after / maxBar; drops.push({ t: bar0 + k * barLen, sc, k }); }
    drops.sort((a2, b3) => b3.sc - a2.sc);
    const top = []; for (const d of drops) { if (top.every(q => Math.abs(q.k - d.k) >= 8)) top.push(d); if (top.length >= 6) break; }
    /* refine each drop to the exact beat where the energy jumps (bar lines can be a beat off) */
    for (const d of top) { let bt = d.t, bs = -1; for (let j = -3; j <= 3; j++) { const t0 = d.t + j * P; if (t0 - 2 * P < 0 || t0 + 2 * P > buf.duration) continue; const sc = rmsAt(t0, t0 + 2 * P) - rmsAt(t0 - 2 * P, t0); if (sc > bs) { bs = sc; bt = t0; } } d.t = bt; }
    /* 5) key of the loudest part */
    const kd = top[0] ? top[0].t : buf.duration / 3, key = detectKey(full, sr, Math.max(0, kd - 10), Math.min(buf.duration, kd + 40));
    return { buffer: buf, bpm: Math.round(bpm * 100) / 100, period: P, phase, bar0, barLen, offset: phase, drops: top.map(d => d.t), bars, secs: buf.duration, name: file.name, key };
  }
  /* ================= AUTO MUSIC EDIT =================
     The song is cut into bars and re-assembled to fit THIS video: build-up under the hook and early
     gameplay, the drop exactly on the video's big moment, the high-energy part looped if the song is
     short, a one-bar cut on every fail (like the game), and a clean fade on the outro. Every cut is on
     a bar line of the same song, so tempo and key always match. */
  function musicPlan(m, T) {
    if (!m || !m.bars || m.bars.length < 4 || !m.barLen) return null;
    const L = m.barLen, nb = m.bars.length, mx = Math.max(...m.bars, 1e-6), lvl = k => m.bars[k] / mx;
    const dT = m.drops && m.drops.length ? m.drops[0] : m.bar0;
    let sd = Math.round((dT - m.bar0) / L); sd = Math.max(0, Math.min(nb - 1, sd));
    const sh = dT - (m.bar0 + sd * L);                 // beat-exact drop (can be a beat off the bar grid)
    const run = []; for (let k = sd; k < nb && run.length < 24 && (run.length < 4 || lvl(k) >= 0.42); k++) run.push(k);
    const pre = []; for (let k = Math.max(0, sd - 8); k < sd; k++) pre.push(k);
    const tD = T.drop, outro = T.outro != null ? T.outro : T.total - 4.6, segs = [];
    const jmin = -Math.ceil(tD / L - 1e-6), jmax = Math.ceil((T.total + 0.3 - tD) / L);
    for (let j = jmin; j < jmax; j++) {
      const s0 = tD + j * L, v0 = Math.max(0, s0), v1 = Math.min(T.total + 0.3, s0 + L); if (v1 <= v0) continue;
      let k;
      if (j >= 0) k = j < run.length ? run[j] : run[j % run.length];
      else if (sd + j >= 0) k = sd + j;
      else k = pre.length ? pre[((pre.length + (j % pre.length)) % pre.length)] : run[((run.length + (j % run.length)) % run.length)];
      const type = s0 >= outro - 0.01 ? 'outro' : j >= 0 ? 'drop' : j >= -2 ? 'build' : 'groove';
      segs.push({ v0, v1, song: Math.max(0, m.bar0 + k * L + sh + (v0 - s0)), k, type });
    }
    /* fails: the music cuts out until the next bar line (silence hurts, like in the game) */
    for (const tf of (T.fails || []).slice().sort((a, b) => a - b)) {
      const i = segs.findIndex(sg => tf >= sg.v0 && tf < sg.v1 && !sg.mute); if (i < 0) continue;
      const sg = segs[i], cut = { v0: tf, v1: sg.v1, song: sg.song + (tf - sg.v0), k: sg.k, type: 'cut', mute: true };
      sg.v1 = tf; segs.splice(i + 1, 0, cut);
    }
    /* merge pieces that already play continuously in the song */
    const out = []; for (const sg of segs) { const p = out[out.length - 1]; if (p && !p.mute && !sg.mute && p.type === sg.type && Math.abs(p.song + (p.v1 - p.v0) - sg.song) < 0.002) p.v1 = sg.v1; else if (sg.v1 - sg.v0 > 0.005) out.push(Object.assign({}, sg)); }
    return out;
  }
  function playMusic(m, T, T0, vol) {
    const plan = musicPlan(m, T);
    if (plan) return SND.playSegs(m.buffer, T0, plan, vol, T.total, 1.4);
    return SND.playBuffer(m.buffer, T0, musicStart(m, T), vol);
  }
  /* timeline for the Studio: what plays where (no assets needed) */
  function planFor(spec, m) { const T = build(spec, {}); return { total: T.total, drop: T.drop, outro: T.outro, fails: T.fails.slice(), segs: musicPlan(m, T) }; }
  /* where to start the song so its beats sit on the video's grid and the drop lands on the video's climax */
  function musicStart(m, T) {
    if (!m || !m.period) return m ? m.offset || 0 : 0;
    const k = Math.round(T.drop / T.beat), need = k * m.period;
    for (const d of m.drops || []) { const st = d - need; if (st >= 0 && st + T.total <= m.secs + 0.5) return st; }
    for (const d of m.drops || []) { const st = d - need; if (st >= 0) return st; }
    /* song too short / drop too early: first bar line that leaves room for the whole video */
    let st = m.bar0; while (st + T.total > m.secs && st - m.barLen >= 0) st -= m.barLen; return Math.max(0, st);
  }
  const setRS = v => { RS = v; };
  const _ = { captureAudio, build, setRS, phone, gameScreen, board, bigText, slam, sub, hud, endCard, intro, assets, bg, vignette, chip, ripple, rr, clamp, eBack, eOut, finger, W, H };
  return { _, make, makeHQ, canHQ, planFor, musicPlan, preview, still, loadMusic, musicStart, look, lookName, lookSkin, canRecord, pickMime, STYLES: Object.keys(STYLES), COLORS };
})();

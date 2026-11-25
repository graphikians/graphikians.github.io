/* ================= BEAT SANX — animated backgrounds (v1.6) =================
   Ported from the Studio "worlds". One canvas behind the home and game screens.
   Calm on purpose: no beat jerks, slow motion, dims while the pattern plays.
   Half resolution + paused when hidden / during ads, so it stays light on phones. */
'use strict';
const BG = (() => {
  const W = 540, H = 960;               // virtual space, scaled to the screen
  let cv = null, x = null, id = 'glow', raf = 0, t0 = performance.now(), last = 0, dimA = 0, dimT = 0;
  let glowC = '#9a6df5', glowA = 0, running = false, sx = 1, sy = 1;
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const stars = Array.from({ length: 90 }, () => ({ x: rnd() * W, y: rnd() * H, r: 0.6 + rnd() * 1.8, a: 0.3 + rnd() * 0.7, s: 0.6 + rnd() * 1.6, v: rnd() * 4 }));
  const dust = Array.from({ length: 34 }, () => ({ x: rnd() * W, y: rnd() * H, r: 1 + rnd() * 2.2, s: 6 + rnd() * 16, a: 0.12 + rnd() * 0.3 }));
  const drops = Array.from({ length: 46 }, () => ({ x: rnd() * W, y: rnd() * H, l: 40 + rnd() * 120, s: 120 + rnd() * 220, a: 0.15 + rnd() * 0.4 }));
  const gal = Array.from({ length: 260 }, (_, i) => ({ arm: i % 3, d: Math.pow(rnd(), 0.7), o: (rnd() - 0.5) * 0.5, r: 0.7 + rnd() * 1.8, a: 0.3 + rnd() * 0.7 }));

  const on = () => S.st.set.bg !== false;
  const active = () => { const b = S.st.bg || {}; const tr = b.trial; if (tr && tr.until > Date.now()) return tr.id; return b.on && (b.own || []).includes(b.on) ? b.on : 'glow'; };
  function rr(c, X, Y, w, h, r) { c.beginPath(); c.moveTo(X + r, Y); c.arcTo(X + w, Y, X + w, Y + h, r); c.arcTo(X + w, Y + h, X, Y + h, r); c.arcTo(X, Y + h, X, Y, r); c.arcTo(X, Y, X + w, Y, r); c.closePath(); }

  function draw(c, t, world, gc, ga) {
    const base = c.createRadialGradient(W / 2, H * 0.42, 20, W / 2, H * 0.45, H * 0.9);
    base.addColorStop(0, world === 'space' || world === 'galaxy' ? '#2b0e6b' : '#33127e'); base.addColorStop(0.5, '#160842'); base.addColorStop(1, '#05011a');
    c.fillStyle = base; c.fillRect(0, 0, W, H);
    c.save(); c.globalCompositeOperation = 'lighter';
    if (world === 'glow') {
      /* soft purple breathing, flares in the colour of the lit tile then fades back */
      const br = 0.12 + 0.05 * Math.sin(t * 0.8);
      const g0 = c.createRadialGradient(W / 2, H * 0.5, 10, W / 2, H * 0.5, H * 0.7); g0.addColorStop(0, `rgba(116,58,232,${br})`); g0.addColorStop(1, 'rgba(116,58,232,0)');
      c.fillStyle = g0; c.fillRect(0, 0, W, H);
      if (ga > 0.01) { const g1 = c.createRadialGradient(W / 2, H * 0.5, 10, W / 2, H * 0.5, H * 0.75); g1.addColorStop(0, hexA(gc, 0.55 * ga)); g1.addColorStop(0.6, hexA(gc, 0.18 * ga)); g1.addColorStop(1, hexA(gc, 0)); c.fillStyle = g1; c.fillRect(0, 0, W, H); }
    } else if (world === 'arena') {
      const hy = H * 0.66, sp = (t * 0.25) % 1;
      const hg = c.createLinearGradient(0, hy - 200, 0, hy + 40); hg.addColorStop(0, 'rgba(154,109,245,0)'); hg.addColorStop(0.85, 'rgba(154,109,245,.35)'); hg.addColorStop(1, 'rgba(196,167,255,0)');
      c.fillStyle = hg; c.fillRect(0, hy - 200, W, 240);
      c.strokeStyle = 'rgba(154,109,245,.5)'; c.lineWidth = 1.6;
      for (let k = 0; k < 12; k++) { const z = (k + sp) / 12, y = hy + Math.pow(z, 2.2) * (H - hy); c.globalAlpha = z; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      c.globalAlpha = 0.6; for (let k = -9; k <= 9; k++) { c.beginPath(); c.moveTo(W / 2 + k * 16, hy); c.lineTo(W / 2 + k * 130, H); c.stroke(); }
      c.globalAlpha = 1;
      for (let k = 0; k < 2; k++) { c.save(); c.translate(k ? W * 0.85 : W * 0.15, H); c.rotate((k ? -1 : 1) * (0.35 + Math.sin(t * 0.4 + k) * 0.12)); const bm = c.createLinearGradient(0, 0, 0, -H); bm.addColorStop(0, 'rgba(196,167,255,.22)'); bm.addColorStop(1, 'rgba(196,167,255,0)'); c.fillStyle = bm; c.beginPath(); c.moveTo(-14, 0); c.lineTo(14, 0); c.lineTo(80, -H); c.lineTo(-80, -H); c.fill(); c.restore(); }
    } else if (world === 'versus') {
      c.save(); c.translate(W / 2, H / 2); c.rotate(-0.32);
      const sg = c.createLinearGradient(-40, 0, 40, 0); sg.addColorStop(0, 'rgba(154,109,245,0)'); sg.addColorStop(0.5, `rgba(214,196,255,${0.22 + 0.1 * Math.sin(t * 1.4)})`); sg.addColorStop(1, 'rgba(154,109,245,0)');
      c.fillStyle = sg; c.fillRect(-40, -H, 80, H * 2); c.restore();
      for (let k = 0; k < 10; k++) { const y = ((k * 113 + t * 60) % (H + 160)) - 80; c.strokeStyle = 'rgba(196,167,255,.12)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-30, y); c.lineTo(W + 30, y - 180); c.stroke(); }
      const l = c.createRadialGradient(0, H * 0.3, 10, 0, H * 0.3, 360); l.addColorStop(0, 'rgba(116,58,232,.35)'); l.addColorStop(1, 'rgba(116,58,232,0)'); c.fillStyle = l; c.fillRect(0, 0, W, H);
      const r2 = c.createRadialGradient(W, H * 0.7, 10, W, H * 0.7, 360); r2.addColorStop(0, 'rgba(196,167,255,.25)'); r2.addColorStop(1, 'rgba(196,167,255,0)'); c.fillStyle = r2; c.fillRect(0, 0, W, H);
    } else if (world === 'club') {
      /* slow sweeping lasers + glowing floor (no beat pumping) */
      for (let k = 0; k < 5; k++) { c.save(); c.translate(W / 2, -20); c.rotate(Math.sin(t * 0.35 + k * 1.3) * 0.7); const lz = c.createLinearGradient(0, 0, 0, H * 1.1); lz.addColorStop(0, `rgba(${k % 2 ? '196,167,255' : '154,109,245'},.32)`); lz.addColorStop(1, 'rgba(154,109,245,0)'); c.fillStyle = lz; c.fillRect(-2, 0, 4, H * 1.1); c.restore(); }
      for (let k = 0; k < 6; k++) for (let j = 0; j < 3; j++) { const a = 0.05 + 0.07 * (0.5 + 0.5 * Math.sin(t * 0.9 + k * 1.1 + j * 2.3)); c.fillStyle = `rgba(154,109,245,${a})`; rr(c, 10 + k * 88, H - 150 + j * 48, 80, 42, 8); c.fill(); }
    } else if (world === 'tunnel') {
      for (let k = 0; k < 10; k++) {
        const z = ((k / 10) + t * 0.06) % 1, sc = Math.pow(z, 2.4) * 2.6, s2 = 110 + sc * 560, a = Math.min(1, z * 1.6) * (1 - z) * 0.7;
        c.strokeStyle = `rgba(154,109,245,${a})`; c.lineWidth = 1.5 + sc * 5; rr(c, W / 2 - s2 / 2, H * 0.47 - s2 / 2, s2, s2, s2 * 0.18); c.stroke();
      }
      const cg = c.createRadialGradient(W / 2, H * 0.47, 0, W / 2, H * 0.47, 220); cg.addColorStop(0, 'rgba(196,167,255,.25)'); cg.addColorStop(1, 'rgba(196,167,255,0)'); c.fillStyle = cg; c.fillRect(0, 0, W, H);
    } else if (world === 'aurora') {
      for (let k = 0; k < 4; k++) {
        c.beginPath(); const y0 = H * (0.2 + k * 0.17);
        for (let xx = -20; xx <= W + 20; xx += 20) { const y = y0 + Math.sin(xx * 0.008 + t * (0.25 + k * 0.08) + k) * 60 + Math.sin(xx * 0.022 - t * 0.35) * 20; xx === -20 ? c.moveTo(xx, y) : c.lineTo(xx, y); }
        c.lineTo(W + 20, y0 + 190); c.lineTo(-20, y0 + 190); c.closePath();
        const ag = c.createLinearGradient(0, y0 - 80, 0, y0 + 190); ag.addColorStop(0, 'rgba(116,58,232,0)'); ag.addColorStop(0.35, `rgba(${k % 2 ? '154,109,245' : '196,167,255'},.2)`); ag.addColorStop(1, 'rgba(116,58,232,0)');
        c.fillStyle = ag; c.fill();
      }
    } else if (world === 'space') {
      for (const d of stars) { const tw = 0.5 + 0.5 * Math.sin(t * d.s + d.x); c.fillStyle = `rgba(230,220,255,${d.a * tw})`; c.beginPath(); c.arc((d.x + t * d.v) % W, d.y, d.r, 0, 7); c.fill(); }
      const nb = c.createRadialGradient(W * 0.72, H * 0.24, 6, W * 0.72, H * 0.24, 260); nb.addColorStop(0, 'rgba(154,109,245,.32)'); nb.addColorStop(1, 'rgba(154,109,245,0)'); c.fillStyle = nb; c.fillRect(0, 0, W, H);
      const px = W * 0.2 + Math.sin(t * 0.05) * 20, py = H * 0.78; const pl = c.createRadialGradient(px - 18, py - 18, 4, px, py, 70); pl.addColorStop(0, 'rgba(196,167,255,.55)'); pl.addColorStop(1, 'rgba(60,20,140,.1)'); c.fillStyle = pl; c.beginPath(); c.arc(px, py, 62, 0, 7); c.fill();
    } else if (world === 'rain') {
      for (const d of drops) { const y = (d.y + t * d.s) % (H + d.l) - d.l; const g = c.createLinearGradient(0, y, 0, y + d.l); g.addColorStop(0, 'rgba(196,167,255,0)'); g.addColorStop(1, `rgba(196,167,255,${d.a})`); c.strokeStyle = g; c.lineWidth = 1.6; c.beginPath(); c.moveTo(d.x, y); c.lineTo(d.x, y + d.l); c.stroke(); }
      const fl = c.createLinearGradient(0, H * 0.8, 0, H); fl.addColorStop(0, 'rgba(154,109,245,0)'); fl.addColorStop(1, 'rgba(154,109,245,.3)'); c.fillStyle = fl; c.fillRect(0, H * 0.8, W, H * 0.2);
    } else if (world === 'galaxy') {
      const cx = W / 2, cy = H * 0.46, rot = t * 0.06;
      const core = c.createRadialGradient(cx, cy, 2, cx, cy, 140); core.addColorStop(0, 'rgba(230,215,255,.55)'); core.addColorStop(0.4, 'rgba(154,109,245,.25)'); core.addColorStop(1, 'rgba(116,58,232,0)'); c.fillStyle = core; c.fillRect(0, 0, W, H);
      for (const s of gal) { const a = rot + s.arm * 2.094 + s.d * 5.2 + s.o, rd = 20 + s.d * 300; c.fillStyle = `rgba(220,205,255,${s.a * (1 - s.d * 0.6)})`; c.beginPath(); c.arc(cx + Math.cos(a) * rd, cy + Math.sin(a) * rd * 0.55, s.r, 0, 7); c.fill(); }
    } else { /* spot: stage lights from above */
      for (let k = 0; k < 4; k++) {
        const ang = Math.sin(t * 0.25 + k * 1.7) * 0.3 + (k - 1.5) * 0.4, cx = W / 2 + (k - 1.5) * W * 0.26;
        c.save(); c.translate(cx, -60); c.rotate(ang);
        const bgr = c.createLinearGradient(0, 0, 0, H * 1.2); bgr.addColorStop(0, 'rgba(154,109,245,.2)'); bgr.addColorStop(1, 'rgba(154,109,245,0)');
        c.fillStyle = bgr; c.beginPath(); c.moveTo(-20, 0); c.lineTo(20, 0); c.lineTo(120, H * 1.2); c.lineTo(-120, H * 1.2); c.closePath(); c.fill(); c.restore();
      }
    }
    if (world !== 'space' && world !== 'rain' && world !== 'galaxy' && !(typeof document !== 'undefined' && document.body.classList.contains('smooth'))) for (const d of dust) { const y = ((d.y - t * d.s) % H + H) % H; c.fillStyle = `rgba(214,196,255,${d.a * 0.7})`; c.beginPath(); c.arc(d.x + Math.sin(t * 0.5 + d.y) * 5, y, d.r, 0, 7); c.fill(); }
    c.restore();
  }
  function hexA(h, a) { const n = parseInt((h || '#9a6df5').trim().replace('#', '').slice(0, 6), 16); if (isNaN(n)) return `rgba(154,109,245,${a})`; return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }

  function size() {
    if (!cv) return;
    const dv = document.body.classList.contains('smooth') ? 4 : 2.5;   // v1.7: lower resolution, it is a soft background
    const w = Math.max(1, Math.round(innerWidth / dv)), h = Math.max(1, Math.round(innerHeight / dv));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    /* cover: keep aspect of the virtual space */
    const s = Math.max(w / W, h / H); sx = s; sy = s;
  }
  function frame(now) {
    raf = 0; if (!running) return;
    raf = requestAnimationFrame(frame);
    /* v1.7: 30 fps on home, 20 fps while playing, 10 fps in Smooth mode; nothing while a popup covers it */
    const sm = document.body.classList.contains('smooth'), game = document.body.dataset.scr === 'game';
    if (now - last < (sm ? 100 : game ? 50 : 33)) return;
    last = now;
    if (document.hidden || (typeof ADS !== 'undefined' && ADS.showing)) return;
    const md = document.getElementById('modal'); if (md && md.classList.contains('on') && glowA < 0.02) return;
    const t = (now - t0) / 1000;
    glowA *= 0.94;
    dimA += ((dimT ? 0.55 : 0) - dimA) * 0.12;
    x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, cv.width, cv.height);
    x.setTransform(sx, 0, 0, sy, (cv.width - W * sx) / 2, (cv.height - H * sy) / 2);
    draw(x, t, id, glowC, glowA);
    if (dimA > 0.01) { x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = `rgba(5,1,26,${dimA})`; x.fillRect(0, 0, cv.width, cv.height); }
  }
  function refresh() {
    if (!cv) return;
    const scr = document.body.dataset.scr, want = on() && (scr === 'home' || scr === 'game');
    document.body.classList.toggle('bgOn', want);
    id = active();
    size();
    if (want && !running) { running = true; raf = requestAnimationFrame(frame); }
    else if (!want && running) { running = false; cancelAnimationFrame(raf); raf = 0; }
  }
  return {
    init() {
      cv = document.createElement('canvas'); cv.id = 'bgCv'; document.body.prepend(cv); x = cv.getContext('2d');
      addEventListener('resize', size);
      new MutationObserver(refresh).observe(document.body, { attributes: true, attributeFilter: ['data-scr'] });
      document.addEventListener('visibilitychange', refresh);
      setInterval(() => { if (running && active() !== id) id = active(); }, 4000);
      refresh();
    },
    refresh,
    pulse(c) { if (id !== 'glow' || !c) return; glowC = c; glowA = 1; },
    dim(v) { dimT = !!v; },
    active,
    /* little live preview for the shop card */
    preview(canvas, world) {
      const c = canvas.getContext('2d'), w = canvas.width, h = canvas.height, s = Math.max(w / W, h / H);
      let alive = true, gA = 0, gC = '#9a6df5', k = 0;
      const cols = ['#ff3d7f', '#00e5ff', '#22c55e', '#9a6df5', '#f97316'];
      const step = now => {
        if (!alive || !document.body.contains(canvas)) return;
        requestAnimationFrame(step);
        const t = (now - t0) / 1000;
        if (world === 'glow') { gA *= 0.95; if (Math.floor(t / 1.2) !== k) { k = Math.floor(t / 1.2); gC = cols[k % cols.length]; gA = 1; } }
        c.setTransform(s, 0, 0, s, (w - W * s) / 2, (h - H * s) / 2); draw(c, t, world, gC, gA);
      };
      requestAnimationFrame(step);
      return () => { alive = false; };
    }
  };
})();

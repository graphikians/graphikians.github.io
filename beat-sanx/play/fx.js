/* ================= BEAT SANX — particles & juice =================
   Tap effects, win effects, flying coins and count-up numbers.
   Everything is plain DOM + CSS animations (cheap on phones). */
'use strict';
const FX = (() => {
  const $ = id => document.getElementById(id);
  const R = (a, b) => a + Math.random() * (b - a);
  const layer = () => { let l = document.getElementById('fxLayer'); if (!l) { l = document.createElement('div'); l.id = 'fxLayer'; document.body.appendChild(l); } return l; };
  const SV = {
    star: c => `<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.2 6.6.6-5 4.5 1.5 6.7L12 17l-6 3.5 1.5-6.7-5-4.5 6.6-.6z" fill="${c}"/></svg>`,
    bolt: c => `<svg viewBox="0 0 24 24"><path d="M13 1 3 14h7l-1 9 11-14h-7z" fill="${c}" stroke="#fff" stroke-width="1"/></svg>`,
    crown: c => `<svg viewBox="0 0 24 24"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" fill="${c}" stroke="#7a4b00" stroke-width="1.2"/></svg>`,
    petal: c => `<svg viewBox="0 0 24 24"><path d="M12 2C6 8 6 16 12 22 18 16 18 8 12 2z" fill="${c}"/></svg>`,
    heart: c => `<svg viewBox="0 0 24 24"><path d="M20.4 5a5.3 5.3 0 0 0-7.6 0L12 5.9 11.2 5a5.3 5.3 0 0 0-7.6 7.5L12 21l8.4-8.5A5.3 5.3 0 0 0 20.4 5z" fill="${c}"/></svg>`,
    flame: c => `<svg viewBox="0 0 24 24"><path d="M12 2.5c.8 3.7 6 5.6 6 11.5a6 6 0 0 1-12 0c0-3 1.8-4.8 3-6.8 0 1.8 1 3 2 3 .2-3-.3-5.5 1-7.7z" fill="${c}"/></svg>`,
    coin: () => ART.coin(26)
  };
  const CONF = ['#ff3d7f', '#22d3ee', '#9a6df5', '#22c55e', '#f97316', '#3b82f6', '#ec4899', '#f5b70a', '#ffffff'];

  /* one particle: x,y start (px, viewport), dx,dy travel, life ms */
  function part(x, y, o) {
    const p = document.createElement('i'); p.className = 'pt ' + (o.cls || '');
    p.style.left = x + 'px'; p.style.top = y + 'px';
    p.style.setProperty('--dx', (o.dx || 0) + 'px'); p.style.setProperty('--dy', (o.dy || 0) + 'px');
    p.style.setProperty('--r', (o.r || 0) + 'deg'); p.style.setProperty('--s', o.s || 1);
    p.style.setProperty('--life', (o.life || 700) + 'ms'); p.style.setProperty('--delay', (o.delay || 0) + 'ms');
    if (o.size) { p.style.width = p.style.height = o.size + 'px'; }
    if (o.bg) p.style.background = o.bg;
    if (o.html) p.innerHTML = o.html;
    layer().appendChild(p);
    setTimeout(() => p.remove(), (o.life || 700) + (o.delay || 0) + 80);
    return p;
  }
  const burst = (x, y, n, f) => { for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + R(-.3, .3); f(a, i); } };

  /* ---------- TAP effects ---------- */
  function tap(el, kind, color) {
    if (!el || !kind || kind === 'none') return;
    const b = el.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2, w = b.width;
    const c = (color || '#fff').trim() || '#fff';
    switch (kind) {
      case 'sparks': burst(x, y, 10, a => part(x, y, { cls: 'spark', dx: Math.cos(a) * w * R(.5, .9), dy: Math.sin(a) * w * R(.5, .9), bg: '#fff', size: R(3, 6), life: 450 })); break;
      case 'confetti': burst(x, y, 14, (a, i) => part(x, y, { cls: 'conf', dx: Math.cos(a) * w * R(.5, 1), dy: Math.sin(a) * w * R(.5, 1) + 30, r: R(-360, 360), bg: CONF[i % CONF.length], life: 750 })); break;
      case 'bubbles': for (let i = 0; i < 7; i++) part(x + R(-w / 3, w / 3), y, { cls: 'bub', dx: R(-20, 20), dy: -R(w * .6, w * 1.2), size: R(8, 18), life: 900, delay: i * 40 }); break;
      case 'petals': burst(x, y, 8, (a, i) => part(x, y, { cls: 'svgp', dx: Math.cos(a) * w * .8, dy: Math.sin(a) * w * .5 + 40, r: R(-200, 200), html: SV.petal(i % 2 ? '#ff8fab' : '#ffc8dd'), size: 16, life: 900 })); break;
      case 'stars': burst(x, y, 9, (a, i) => part(x, y, { cls: 'svgp', dx: Math.cos(a) * w * R(.6, 1), dy: Math.sin(a) * w * R(.6, 1), r: R(-180, 180), html: SV.star(i % 3 ? '#fff' : c), size: R(10, 16), life: 650 })); break;
      case 'lightning': part(x, y - w * .55, { cls: 'boltp', html: SV.bolt('#ffe066'), size: w * .9, life: 420 }); part(x, y, { cls: 'flashp', size: w * 1.6, life: 300 }); break;
      case 'ink': burst(x, y, 9, (a, i) => part(x, y, { cls: 'ink', dx: Math.cos(a) * w * R(.4, .8), dy: Math.sin(a) * w * R(.4, .8), size: R(10, 22), bg: i % 2 ? c : '#fff', life: 700 })); break;
      case 'fire': for (let i = 0; i < 9; i++) part(x + R(-w / 3, w / 3), y + w / 4, { cls: 'svgp fire', dx: R(-15, 15), dy: -R(w * .5, w), html: SV.flame(i % 2 ? '#ff6a00' : '#ffb703'), size: R(14, 22), life: 650, delay: i * 25 }); break;
      case 'galaxy': part(x, y, { cls: 'galp', size: w * 1.4, life: 700 }); burst(x, y, 8, a => part(x, y, { cls: 'spark', dx: Math.cos(a) * w, dy: Math.sin(a) * w, bg: '#c4a7ff', size: 4, life: 600 })); break;
      case 'crowns': for (let i = 0; i < 5; i++) part(x + R(-w / 2, w / 2), y - w * .9, { cls: 'svgp', dx: R(-10, 10), dy: w * 1.2, r: R(-40, 40), html: SV.crown('#ffd700'), size: R(14, 20), life: 800, delay: i * 50 }); break;
    }
  }

  /* ---------- WIN effects (level clear) ---------- */
  function win(kind) {
    const W = innerWidth, H = innerHeight, cx = W / 2, cy = H * 0.42;
    switch (kind || 'basic') {
      case 'basic': burst(cx, cy, 12, a => part(cx, cy, { cls: 'spark', dx: Math.cos(a) * 140, dy: Math.sin(a) * 140, bg: '#c4a7ff', size: 6, life: 700 })); break;
      case 'confetti': for (let i = 0; i < 46; i++) part(R(0, W), -20, { cls: 'conf fall', dx: R(-60, 60), dy: H * R(.6, 1), r: R(-720, 720), bg: CONF[i % CONF.length], life: R(1300, 2000), delay: R(0, 400) }); break;
      case 'coinrain': for (let i = 0; i < 26; i++) part(R(10, W - 10), -30, { cls: 'svgp fall', dx: R(-30, 30), dy: H * R(.6, .95), r: R(-360, 360), html: SV.coin(), size: 26, life: R(1100, 1700), delay: R(0, 500) }); break;
      case 'stars': burst(cx, cy, 20, (a, i) => part(cx, cy, { cls: 'svgp', dx: Math.cos(a) * R(140, 220), dy: Math.sin(a) * R(140, 220), r: R(-180, 180), html: SV.star(CONF[i % CONF.length]), size: R(14, 24), life: 1000 })); break;
      case 'balloons': for (let i = 0; i < 12; i++) part(R(20, W - 20), H + 20, { cls: 'balloon', dx: R(-40, 40), dy: -H * R(.8, 1.1), bg: CONF[i % CONF.length], life: R(1600, 2200), delay: R(0, 400) }); break;
      case 'fireworks': for (let k = 0; k < 4; k++) { const x = R(W * .15, W * .85), y = R(H * .15, H * .45), col = CONF[k * 2 % CONF.length]; setTimeout(() => burst(x, y, 16, a => part(x, y, { cls: 'spark', dx: Math.cos(a) * 90, dy: Math.sin(a) * 90 + 20, bg: col, size: 5, life: 800 })), k * 280); } break;
      case 'lightning': part(cx, 0, { cls: 'flashp full', life: 400 }); for (let k = 0; k < 3; k++) part(R(W * .2, W * .8), H * .12, { cls: 'boltp big', html: SV.bolt('#ffe066'), size: 140, life: 500, delay: k * 140 }); break;
      case 'rockets': for (let k = 0; k < 5; k++) { const x = R(W * .1, W * .9), col = CONF[k % CONF.length]; part(x, H, { cls: 'rocket', dy: -H * .6, life: 700, delay: k * 150, bg: col }); setTimeout(() => burst(x, H * .4, 14, a => part(x, H * .4, { cls: 'spark', dx: Math.cos(a) * 80, dy: Math.sin(a) * 80, bg: col, size: 5, life: 700 })), 700 + k * 150); } break;
      case 'galaxy': part(cx, cy, { cls: 'galp big', size: Math.min(W, H) * 1.1, life: 1400 }); break;
      case 'phoenix': part(cx, H * .8, { cls: 'svgp phx', dy: -H * .55, html: SV.flame('#ff6a00'), size: 120, life: 1300 }); for (let i = 0; i < 20; i++) part(cx + R(-60, 60), H * .75, { cls: 'svgp fire', dx: R(-80, 80), dy: -R(H * .3, H * .6), html: SV.flame(i % 2 ? '#ff6a00' : '#ffb703'), size: R(14, 24), life: 1100, delay: R(0, 400) }); break;
      case 'sanx': part(cx, cy, { cls: 'sanxRage', html: ART.sanx('angry'), size: 220, life: 1300 }); for (let i = 0; i < 10; i++) part(cx, cy, { cls: 'svgp', dx: R(-160, 160), dy: R(-160, 160), html: SV.bolt('#9a6df5'), size: 26, life: 900 }); break;
    }
  }

  /* ---------- coins fly to the counter ---------- */
  function flyCoins(fromEl, toEl, n = 8) {
    const f = fromEl && fromEl.getBoundingClientRect ? fromEl.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    const t = (toEl || document.querySelector('.curs .cur')) ? (toEl || document.querySelector('.curs .cur')).getBoundingClientRect() : { left: 30, top: 20, width: 0, height: 0 };
    const x = f.left + f.width / 2, y = f.top + f.height / 2, tx = t.left + t.width / 2, ty = t.top + t.height / 2;
    for (let i = 0; i < n; i++) part(x + R(-30, 30), y + R(-20, 20), { cls: 'svgp coinFly', dx: tx - x, dy: ty - y, html: SV.coin(), size: 24, life: 700, delay: i * 60 });
    setTimeout(() => { try { SND.coin(); } catch (e) { } }, 650);
  }
  /* ---------- numbers count up ---------- */
  function countUp(el, to, ms = 900) {
    if (!el) return; const t0 = performance.now(), from = 0;
    const step = now => { const p = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(from + (to - from) * e).toLocaleString(); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  /* preview in the shop */
  function preview(cat, id, el) {
    if (cat === 'tap') tap(el, id, '#9a6df5');
    if (cat === 'win') win(id);
  }
  return { tap, win, flyCoins, countUp, preview, part };
})();

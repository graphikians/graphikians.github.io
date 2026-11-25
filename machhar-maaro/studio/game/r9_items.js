/* ================= MACHHAR MAARO · ROUND 9 · ITEMS THAT REALLY WORK =================
   Every shop item now does something you can see AND feel, in every level:
   Torch: bright beam around the racket, mosquitoes in it are dazzled (50% slower) and glow.
   Inverter: lights on + fan at full speed: no darkness, no power cuts, all mosquitoes 20% slower.
   Earplugs: noise can not wake anyone (calm rings). Pillow: +25% sleep with a big pop.
   Every use shows a big banner saying what the item is doing.
===================================================================================== */
R9.ITEMTXT = {
  torch: ['🔦', 'TORCH ON', 'Mosquitoes in the light are dazzled'], tent: ['🛡️', 'NET UP', 'No bites for 15 seconds'], coil: ['🌀', 'COIL LIT', 'All mosquitoes slow down'],
  inverter: ['💡', 'POWER ON', 'Lights on, fan at full speed'], earplug: ['🎧', 'EARPLUGS IN', 'Noise can not wake anyone'], cream: ['🧴', 'CREAM ON', '6 second shield'],
  mesh: ['🪟', 'MESH UP', 'Half the mosquitoes are blocked'], fan: ['🌪️', 'TURBO FAN', 'Every mosquito blown away'], cooler: ['❄️', 'COOLER ON', 'Racket cooled, mosquitoes slowed'],
  chai: ['☕', 'CHAI TIME', 'Racket will not overheat'], magnet: ['🧲', 'MAGNET ON', 'Double coins per mosquito'], pillow: ['💤', 'PILLOW', 'Everyone sleeps 25% deeper']
};
R9.itemBanner = function (id) {
  const t = R9.ITEMTXT[id]; if (!t) return;
  const s = R7.SAMAN.find(x => x.id === id), el = document.createElement('div'); el.className = 'r9IB';
  el.innerHTML = `<span class="ibI">${s && s.img ? R7.img(s.img) : t[0]}</span><span class="ibT"><b>${t[1]}</b><small>${t[2]}</small></span>`;
  document.body.appendChild(el); setTimeout(() => el.remove(), 1900);
};
(function () {
  const _use = R7.qb.use.bind(R7.qb);
  R7.qb.use = function (id) {
    const before = (SV().saman[id] || 0); _use(id); if ((SV().saman[id] || 0) >= before) return;
    R9.itemBanner(id);
    if (id === 'pillow') { for (const s of G.sleepers) pop('+25% SLEEP 💤', s.x, s.y - 60 * S, 20, '#7fd4ff', 1.2); }
    if (id === 'inverter') { G.flash = 0.5; G.flashCol = '255,255,255'; G.fx.ear = Math.max(G.fx.ear || 0, 0); }
    if (id === 'fan') { for (const m of G.mosq) if (!m.dead && !m.boss) m.stunT = 2.6; }
    if (id === 'torch') { G.flash = 0.35; G.flashCol = '200,230,255'; }
  };
})();
/* per frame: dazzle in the torch beam, inverter slows everyone */
R9.itemTick = function (dt) {
  if (state !== 'play' || !G.fx) return;
  const tor = G.fx.torch > 0, inv = G.fx.inv > 0, R = 165 * S;
  if (!tor && !inv) return;
  for (const m of G.mosq) {
    if (m.dead || m.boss || !m.vx && !m.vy) continue;
    let k = inv ? 0.3 : 0;
    if (tor && Math.hypot(m.x - ptr.x, m.y - ptr.y) < R) { k = Math.max(k, 0.5); m.r9dz = 0.3; }
    if (k) { m.x -= (m.vx || 0) * dt * k; m.y -= (m.vy || 0) * dt * k; }
    if (m.r9dz > 0) m.r9dz -= dt;
  }
};
(function () {
  let last = performance.now();
  const _dr = window.drawRacket;
  window.drawRacket = function () {
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
    try { R9.itemTick(dt); R9.drawItems(now / 1000); } catch (e) { }
    return _dr.apply(this, arguments);
  };
})();
R9.drawItems = function (t) {
  if (state !== 'play' || !G.fx) return;
  if (G.fx.inv > 0) {
    const a = Math.min(1, G.fx.inv) * 0.17; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,240,220,${a})`; ctx.fillRect(0, 0, W, H);
    const bx = W / 2, by = H * 0.135, g = ctx.createRadialGradient(bx, by, 0, bx, by, 120 * S); g.addColorStop(0, 'rgba(255,250,235,.55)'); g.addColorStop(1, 'rgba(255,250,235,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, 120 * S, 0, 7); ctx.fill(); ctx.restore();
    R9.pill(`💡 POWER ON · ${Math.ceil(G.fx.inv)}s`, H * 0.205);
  }
  if (G.fx.torch > 0) {
    const R = 165 * S; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(ptr.x, ptr.y, 10 * S, ptr.x, ptr.y, R); g.addColorStop(0, 'rgba(230,245,255,.6)'); g.addColorStop(0.7, 'rgba(160,210,255,.12)'); g.addColorStop(1, 'rgba(160,210,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ptr.x, ptr.y, R, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(200,235,255,.25)'; ctx.lineWidth = 2 * S; ctx.setLineDash([8 * S, 10 * S]); ctx.lineDashOffset = -t * 30; ctx.beginPath(); ctx.arc(ptr.x, ptr.y, R, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    for (const m of G.mosq) if (!m.dead && m.r9dz > 0) { ctx.fillStyle = 'rgba(255,255,255,.75)'; for (let k = 0; k < 3; k++) { const a = t * 6 + k * 2.1; ctx.beginPath(); ctx.arc(m.x + Math.cos(a) * 14 * S, m.y - 14 * S + Math.sin(a) * 5 * S, 2 * S, 0, 7); ctx.fill(); } }
    ctx.restore();
  }
  if (G.fx.torch > 0) R9.pill(`🔦 TORCH · ${Math.ceil(G.fx.torch)}s`, H * (G.fx.inv > 0 ? 0.24 : 0.205));
  if (G.fx.ear > 0) R9.pill(`🎧 EARPLUGS · ${Math.ceil(G.fx.ear)}s`, H * 0.275);
};
R9.pill = function (txt, y) {
  ctx.save(); ctx.font = `800 ${11 * S}px Inter,sans-serif`; const w = ctx.measureText(txt).width + 22 * S, x = W - w - 10 * S;
  ctx.fillStyle = 'rgba(18,8,45,.85)'; ctx.beginPath(); ctx.roundRect(x, y, w, 20 * S, 10 * S); ctx.fill(); ctx.strokeStyle = '#7fd4ff'; ctx.lineWidth = 1.2 * S; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, x + w / 2, y + 10.5 * S); ctx.restore();
};
R7.css(`
.r9IB{position:fixed;left:50%;top:30%;z-index:60;display:flex;align-items:center;gap:10px;padding:10px 18px 10px 10px;border-radius:22px;background:linear-gradient(135deg,rgba(116,58,232,.95),rgba(47,123,255,.95));border:2px solid #fff;color:#fff;box-shadow:0 12px 30px rgba(0,0,0,.45),0 0 30px rgba(127,212,255,.6);pointer-events:none;transform:translate(-50%,0) scale(.6);opacity:0;animation:r9ib 1.9s cubic-bezier(.2,.9,.3,1.3) forwards;font-family:Inter,sans-serif}
.r9IB .ibI{width:46px;height:46px;border-radius:14px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-size:28px}.r9IB .ibI img{width:40px;height:40px;object-fit:contain}
.r9IB b{display:block;font:900 18px Inter;letter-spacing:.5px}.r9IB small{display:block;font:600 12px Inter;opacity:.92}
@keyframes r9ib{10%{opacity:1;transform:translate(-50%,0) scale(1.06)}18%{transform:translate(-50%,0) scale(1)}80%{opacity:1;transform:translate(-50%,0) scale(1)}100%{opacity:0;transform:translate(-50%,-30px) scale(.95)}}
`);

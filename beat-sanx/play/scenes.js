/* ================= BEAT SANX — event hero scenes (v1.7) =================
   Every event screen opens with an animated scene: its own little world, not an icon.
   Pure SVG + CSS (cheap on phones). All text sits inside fixed boxes with ellipsis,
   positions are in % so nothing leaves its box on small phones. */
'use strict';
const EVS = (() => {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  /* seeded so a scene looks the same every time it is drawn */
  const rng = seed => { let t = seed >>> 0 || 7; return () => { t = (t * 1664525 + 1013904223) >>> 0; return t / 4294967296; }; };
  function parts(kind, n, seed = 3) {
    const r = rng(seed); let s = '';
    for (let i = 0; i < n; i++) {
      const x = (r() * 100).toFixed(1), d = (r() * 6).toFixed(2), du = (4 + r() * 6).toFixed(2), sz = (0.6 + r() * 0.9).toFixed(2), y = (r() * 80).toFixed(1);
      s += `<i class="p-${kind}" style="left:${x}%;top:${kind === 'star' || kind === 'tw' ? y + '%' : ''};--d:-${d}s;--du:${du}s;--s:${sz};--h:${Math.round(r() * 360)}"></i>`;
    }
    return `<div class="escP">${s}</div>`;
  }
  const svg = (inner, vb = '0 0 400 300', cls = 'escBg') => `<svg class="${cls}" viewBox="${vb}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${inner}</svg>`;
  const city = (c = '#120634', h = 1) => `<path fill="${c}" d="M0 300V${230 * h}h22v-30h18v18h14v-46h26v40h12v-62h30v52h10v-24h24v34h16v-70h28v60h14v-34h20v44h18v-56h26v48h16v-22h22v38h14v-50h24v66h22V300z"/>`;
  const hills = (c, y = 240) => `<path fill="${c}" d="M0 300V${y}q60-40 120-10t130-20 150 15V300z"/>`;
  const mtn = c => `<path fill="${c}" d="M0 300L70 190l40 40 90-150 70 110 40-40 90 150z"/>`;
  const crowd = c => { let s = ''; for (let i = 0; i < 26; i++) { const x = i * 16 + (i % 2) * 6, y = 262 + (i % 3) * 6; s += `<circle cx="${x}" cy="${y}" r="9" fill="${c}"/><rect x="${x - 10}" y="${y + 6}" width="20" height="40" rx="9" fill="${c}"/>`; } return s; };
  const av = (src, cls = '') => `<img class="escAv ${cls}" src="${src}" alt="" loading="lazy">`;
  const pill = (t, cls = '') => `<span class="escPill ${cls}">${t}</span>`;
  const bar = (pct, cls = '') => `<span class="escBar ${cls}"><i style="width:${Math.max(0, Math.min(100, pct))}%"></i></span>`;
  const big = (ic, cls = '') => `<div class="escBig ${cls}">${ART.ic(ic)}</div>`;

  const SC = {
    /* ---------- classic six ---------- */
    ring: o => `${svg(`<rect x="0" y="0" width="400" height="300" fill="url(#rg)"/><defs><radialGradient id="rg" cx=".5" cy=".1" r=".8"><stop offset="0" stop-color="#ffffff" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>
        <path d="M20 250 L380 250 L350 290 L50 290Z" fill="#2a0712"/><g stroke="#ff4d6d" stroke-width="4" opacity=".85"><path d="M30 150H370M30 185H370M30 220H370"/></g><g fill="#3b0518"><rect x="24" y="120" width="12" height="140" rx="4"/><rect x="364" y="120" width="12" height="140" rx="4"/></g>`)}
      ${parts('tw', 14, 11)}<div class="escSanx">${ART.sanx(o.mood || 'angry')}</div>
      <div class="escHp" style="left:8%;right:8%;top:6%"><b>SANX</b>${bar(o.hp == null ? 100 : o.hp, 'hp')}<em>${esc(o.hpTxt || '')}</em></div>`,
    throne: o => `${svg(`<defs><radialGradient id="tg" cx=".5" cy=".35" r=".6"><stop offset="0" stop-color="#ffd166" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs><rect width="400" height="300" fill="url(#tg)"/>
        <path d="M140 250V110q60-60 120 0v140z" fill="#3a1d00" stroke="#a16207" stroke-width="4"/><path d="M120 250h160v18H120z" fill="#5c3300"/><path d="M110 268h180v22H110z" fill="#2a1500"/>
        <g fill="#a16207" opacity=".7"><rect x="40" y="80" width="18" height="200"/><rect x="342" y="80" width="18" height="200"/></g>`)}
      ${parts('ember', 12, 21)}
      <div class="escThr">${ART.ic('crown', 'escCrown')}${av(o.img || ART.avFor(o.name), 'champ')}<b class="escName">${esc(o.name)} <em class="aiTag">AI</em></b></div>
      <div class="escHp" style="left:10%;right:10%;top:5%"><b>${esc(o.hpLabel || 'CHAMPION')}</b>${bar(o.hp, 'hp gold')}<em>${esc(o.hpTxt || '')}</em></div>
      <div class="escLad">${[1, 2, 3, 4, 5].map(i => `<i class="${i - 1 < (o.lvl || 0) ? 'down' : i - 1 === (o.lvl || 0) ? 'now' : ''}">${D.ROMAN[i]}</i>`).join('')}</div>`,
    army: o => `${svg(`${hills('#1a2a08', 230)}${hills('#0f1a05', 255)}<g stroke="#4d7c0f" stroke-width="2" opacity=".5"><path d="M0 200h400" stroke-dasharray="6 10"/></g>`)}${parts('ember', 8, 31)}
      <div class="escRow">${(o.soldiers || []).map((s, i) => `<div class="escSold ${s.down ? 'down' : ''} ${s.next ? 'next' : ''}">${av(ART.avFor(s.name))}${s.down ? `<span class="escX">${ART.ic('x')}</span>` : ''}<b>${esc(s.short)}</b><small>${s.at} tiles</small></div>`).join('')}</div>
      <div class="escYou">${o.me || ''}<b>YOU</b></div>`,
    vault: o => `${svg(`<defs><radialGradient id="vg" cx=".5" cy=".45" r=".5"><stop offset="0" stop-color="#ffb703" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs><rect width="400" height="300" fill="url(#vg)"/>
        <g fill="#b45309" opacity=".9"><ellipse cx="80" cy="270" rx="60" ry="14"/><ellipse cx="330" cy="275" rx="55" ry="12"/></g>`)}${parts('coin', 10, 41)}
      <div class="escVault"><div class="escDoor"><i></i><i></i><i></i><i></i><span class="escDial"></span></div></div>
      <div class="escStat"><b>${esc(o.big || '0')}</b><small>${esc(o.sub || '')}</small>${o.pct != null ? bar(o.pct, 'gold') : ''}</div>`,
    globe: o => `${parts('star', 22, 51)}<div class="escGlobe"><div class="escEarth"></div>${svg(`<ellipse cx="140" cy="140" rx="138" ry="48" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1.5"/><ellipse cx="140" cy="140" rx="60" ry="138" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="1.5"/><path d="M60 90c20-10 40-8 52 6s8 30 26 36 30-4 44 6M150 190c14-6 30 0 36 14" stroke="rgba(150,230,255,.35)" stroke-width="6" stroke-linecap="round" fill="none"/>`, '0 0 280 280', 'escOrbit')}</div>
      <svg class="escRoute" viewBox="0 0 400 300" preserveAspectRatio="none"><path d="M100 120 Q160 60 250 92 Q310 130 270 206 Q215 260 130 224" fill="none" stroke="#c4a7ff" stroke-width="2.5" stroke-dasharray="6 7"/></svg>
      ${(o.pins || []).map((p, i) => `<div class="escPin s-${p.st}" style="left:${[25, 63, 68, 33][i]}%;top:${[38, 27, 68, 74][i]}%"><span>${ART.ic(p.st === 'done' ? 'check' : p.st === 'lock' ? 'lock' : 'zap')}</span><b>${esc(p.name)}</b></div>`).join('')}`,
    stage: o => `${svg(`<defs><linearGradient id="sb" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#c77dff" stop-opacity=".5"/><stop offset="1" stop-color="#c77dff" stop-opacity="0"/></linearGradient></defs>
        <path class="escBeam" d="M60 0L20 230H120z" fill="url(#sb)"/><path class="escBeam b2" d="M340 0L280 230H380z" fill="url(#sb)"/><path class="escBeam b3" d="M200 0L150 230H250z" fill="url(#sb)"/>
        <rect x="40" y="200" width="320" height="26" rx="4" fill="#2b0e6b"/>${crowd('#0c0420')}`)}${parts('tw', 12, 61)}
      <div class="escEq">${Array.from({ length: 14 }, (_, i) => `<i style="--d:-${(i * 0.13).toFixed(2)}s"></i>`).join('')}</div>
      <div class="escStat top"><b>${esc(o.big || '')}</b><small>${esc(o.sub || '')}</small></div>`,
    /* ---------- weekly pool ---------- */
    city: o => `${parts('star', 18, 71)}${svg(`${city('#05030f', .95)}<g fill="#ffe066" opacity=".0">${''}</g>`)}<div class="escTorch"></div>${big('moon', 'dim')}<div class="escStat top"><b>${esc(o.big || '')}</b><small>${esc(o.sub || '')}</small></div>`,
    map: o => `<div class="escMap">${svg(`<path d="M30 250 C80 200 60 150 120 140 S200 180 220 120 300 60 360 70" fill="none" stroke="#7a4b14" stroke-width="5" stroke-dasharray="10 9" stroke-linecap="round"/><g stroke="#7a4b14" stroke-width="7" stroke-linecap="round"><path d="M345 55l26 26M371 55l-26 26"/></g><g fill="#a5743a" opacity=".5"><circle cx="90" cy="70" r="22"/><circle cx="300" cy="220" r="30"/><path d="M180 260q20-30 40 0z"/></g>`, '0 0 400 300', 'escBg')}
        <div class="escDig" style="left:${8 + (o.pct || 0) * 0.82}%;top:${80 - (o.pct || 0) * 0.62}%">${o.me || ART.ic('target')}</div></div>
      <div class="escStat top dark"><b>${esc(o.big || '')}</b><small>${esc(o.sub || '')}</small></div>`,
    detective: o => `${parts('fog', 8, 81)}<div class="escEye">${ART.ic('eye')}</div><div class="escLens"></div><div class="escStat top"><b>${esc(o.big || '')}</b><small>${esc(o.sub || '')}</small></div>`,
    traffic: o => `${svg(`<path d="M0 300L150 120h100L400 300z" fill="#1a1a2e"/><g class="escLane" stroke="#ffe066" stroke-width="6"><path d="M200 130v26M200 176v30M200 228v36M200 284v20"/></g>${city('#0b0520', .7)}`)}
      <div class="escLight"><i class="r"></i><i class="y"></i><i class="g"></i></div>${parts('streak', 10, 91)}<div class="escStat top"><b>${esc(o.big || '')}</b><small>${esc(o.sub || '')}</small></div>`,
    mountain: o => `${parts('star', 14, 101)}${svg(`${mtn('#1b1340')}<path d="M200 80l18 28h-36z" fill="#fff" opacity=".85"/>`)}
      <div class="escFlag">${ART.ic('crown')}</div>
      ${(o.climbers || []).map((c, i) => `<div class="escClimb ${c.me ? 'me' : ''} ${c.passed ? 'passed' : ''}" style="left:${c.x}%;top:${c.y}%">${c.me ? (o.me || '') : av(ART.avFor(c.name))}<b>${c.me ? 'YOU' : esc(c.name)}</b></div>`).join('')}`,
    lava: o => `${svg(`<defs><linearGradient id="lv" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ff7b00"/><stop offset="1" stop-color="#9d0208"/></linearGradient></defs><path d="M0 220q50-12 100 0t100 0 100 0 100 0V300H0z" fill="url(#lv)" class="escLava"/>
        <path d="M60 200h280l-10 16H70z" fill="#2b0d0d"/><g fill="#1a0505"><rect x="80" y="214" width="10" height="60"/><rect x="310" y="214" width="10" height="60"/></g>`)}${parts('ember', 16, 111)}${big('skull', 'red')}<div class="escStat top"><b>${esc(o.big || '')}</b><small>${esc(o.sub || '')}</small></div>`,
    casino: o => `${svg(`<ellipse cx="200" cy="270" rx="230" ry="70" fill="#0b3d2e"/><ellipse cx="200" cy="270" rx="230" ry="70" fill="none" stroke="#a16207" stroke-width="8"/>`)}${parts('tw', 10, 121)}
      <div class="escChips">${[0, 1, 2, 3, 4].map(i => `<span style="--h:${i * 7}">${'<i></i>'.repeat(3 + i)}</span>`).join('')}</div>
      <div class="escStat top"><b>${esc(o.big || '')}</b><small>${esc(o.sub || '')}</small></div>`,
    track: o => `${svg(`<path d="M-20 300Q200 140 420 300" fill="#7f1d1d"/><g fill="none" stroke="#fff" stroke-width="2" opacity=".55"><path d="M-20 300Q200 160 420 300"/><path d="M-20 300Q200 180 420 300"/><path d="M-20 300Q200 200 420 300"/></g>${crowd('#120634')}`)}
      <div class="escRunner" style="left:${8 + (o.pct || 0) * 0.8}%">${o.me || ''}</div>${big('flag', 'flag')}<div class="escStat top"><b>${esc(o.big || '')}</b><small>${esc(o.sub || '')}</small></div>`,
    arena: o => `${svg(`<path d="M0 300L120 180h160l120 120z" fill="#1c0a4f"/><g stroke="#743ae8" stroke-width="1.5" opacity=".6">${Array.from({ length: 8 }, (_, i) => `<path d="M${120 + i * 23} 180L${i * 57} 300"/>`).join('')}<path d="M60 240h280M30 270h340"/></g>`)}
      ${parts('tw', 14, 131)}${big(o.icon || 'swords')}<div class="escStat top"><b>${esc(o.big || '')}</b><small>${esc(o.sub || '')}</small></div>`,
    /* ---------- festivals ---------- */
    snow: o => `${parts('snow', 30, 141)}${svg(`${hills('#e9f5ff', 236)}<g fill="#7f1d1d"><path d="M60 236v-40h50v40z"/><path d="M280 238v-36h44v36z"/></g><g fill="#fff"><path d="M52 198l33-30 33 30z"/><path d="M272 204l30-28 30 28z"/></g><g fill="#ffd166"><rect x="76" y="210" width="10" height="10"/><rect x="295" y="214" width="9" height="9"/></g><path d="M190 240l18-60 18 60z" fill="#1b4332"/><path d="M180 210l28-50 28 50z" fill="#2d6a4f"/>`)}${o.extra || ''}`,
    fireworks: o => `${parts('fw', 7, 151)}${parts('star', 16, 152)}${svg(city('#07041a', .85))}<div class="escStat top"><b>${esc(o.big || '')}</b><small>${esc(o.sub || '')}</small></div>`,
    kites: o => `${parts('kite', 7, 161)}${svg(`${city('#2b1a4a', .8)}<path d="M0 0" />`)}${o.extra || ''}`,
    flagwave: o => `${parts('confetti', 18, 171)}<div class="escWave"><i style="background:${o.c1 || '#ff9933'}"></i><i style="background:#fff"></i><i style="background:${o.c2 || '#138808'}"></i></div>${big(o.icon || 'flag', 'mid')}${o.extra || ''}`,
    hearts: o => `${parts('heart', 18, 181)}${big(o.icon || 'heart', 'pink')}${o.extra || ''}`,
    moon: o => `${parts('star', 26, 191)}<div class="escMoon"></div>${svg(city('#0b1a2e', .7))}${o.extra || ''}`,
    colors: o => `<div class="escSplash">${['#ff006e', '#ffbe0b', '#3a86ff', '#8338ec', '#06d6a0', '#fb5607'].map((c, i) => `<i style="--c:${c};--d:-${i * 0.7}s;left:${[8, 60, 30, 72, 14, 48][i]}%;top:${[18, 12, 46, 52, 64, 30][i]}%"></i>`).join('')}</div>${parts('confetti', 14, 201)}${o.extra || ''}`,
    lanterns: o => `${parts('lantern', 12, 211)}${svg(city('#2a0505', .75))}${o.extra || ''}`,
    eggs: o => `${parts('petal', 12, 221)}${svg(`${hills('#55a630', 236)}${hills('#2b9348', 258)}`)}<div class="escEggs">${['#f15bb5', '#fee440', '#00bbf9', '#9b5de5', '#00f5d4'].map(c => `<i style="--c:${c}"></i>`).join('')}</div>${o.extra || ''}`,
    planet: o => `${parts('star', 20, 231)}<div class="escPlanet"></div>${parts('leaf', 8, 232)}${o.extra || ''}`,
    music: o => `${parts('note', 14, 241)}<div class="escEq">${Array.from({ length: 14 }, (_, i) => `<i style="--d:-${(i * 0.11).toFixed(2)}s"></i>`).join('')}</div>${svg(crowd('#0c0420'))}${o.extra || ''}`,
    rakhi: o => `${parts('heart', 12, 251)}<div class="escThread"><i></i><span>${ART.ic('sun')}</span></div>${o.extra || ''}`,
    sweets: o => `${parts('petal', 16, 261)}${big('drop', 'gold')}${o.extra || ''}`,
    garba: o => `${parts('confetti', 16, 271)}<div class="escRing"><i></i><i></i><i></i></div>${big('sun', 'gold')}${o.extra || ''}`,
    diyas: o => `${parts('ember', 14, 281)}${parts('fw', 4, 282)}<div class="escDiyas">${Array.from({ length: 9 }, (_, i) => `<i class="${i < (o.lit || 0) ? 'on' : ''}" style="--d:-${(i * 0.3).toFixed(1)}s"></i>`).join('')}</div>${o.extra || ''}`,
    ghosts: o => `${parts('fog', 8, 291)}<div class="escMoon orange"></div>${svg(`<path d="M120 300V170l20-30 20 30v130zM250 300V150l30-40 30 40v150z" fill="#10002b"/><g fill="#ff9e00"><rect x="135" y="190" width="10" height="12"/><rect x="273" y="170" width="12" height="14"/></g>`)}<div class="escGhosts"><i></i><i></i><i></i></div>${o.extra || ''}`,
    feast: o => `${parts('leaf', 14, 301)}${big('gift', 'gold')}${svg(hills('#3a2a10', 250))}${o.extra || ''}`
  };
  /* festival id -> scene */
  const FEST_SCENE = { xmas: 'snow', ny: 'fireworks', kite: 'kites', tri: 'flagwave', love: 'hearts', eid: 'moon', holi: 'colors', azadi: 'flagwave', rakhi: 'rakhi', modak: 'sweets', garba: 'garba', diya: 'diyas', ghost: 'ghosts', lunar: 'lanterns', easter: 'eggs', earth: 'planet', music: 'music', friend: 'hearts', thanks: 'feast' };

  function hero(key, o = {}) {
    const fn = SC[key] || SC.arena;
    return `<div class="esc sc-${key}" style="--a:${o.a || '#743ae8'};--b:${o.b || '#14063a'}">${fn(o)}${o.taunt ? `<div class="escTaunt">${ART.sanx(o.tmood || 'smug')}<span>${esc(o.taunt)}</span></div>` : ''}${o.chip ? `<div class="escChip">${o.chip}</div>` : ''}</div>`;
  }
  return { hero, FEST_SCENE, esc };
})();

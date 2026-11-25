/* ================= MACHHAR MAARO · ROUND 7B · BHAI/BEHEN/HUSBAND ART + 👰 SHAADI KA HAFTA =================
   Shaadi mein 7 asli din. Har din ek rasam: 3 mushkil level + rasam ki farmaish.
   Taiyari Meter (Din 7 tak 60%+ warna shaadi ruk jaati hai) · Glow Meter (chehre ke kaate) · Bimari 1.5X
   Naye machhar: Dholak, Photographer, Baraati · Final boss: Shaadi Bigaad Machhar · ads ka khazana
=========================================================================================================== */
/* ---------- 1. Bhai, Behen, Husband ab painted ---------- */
for (const id of ['bhai', 'behen', 'husband']) { FAM[id] = { b: id, f: [null, null, null], nw: id }; R7.KEY[id] = id; R7.OVK[id] = id; R7.SB[id] = id; }
/* tasveerein level shuru hone pe load hoti hain (R7.need) */

/* ---------- 2. Dulhan ---------- */
CHARS.dulhan = { n: 'Bride', e: '👰', look: 'mummy', q: 'light', qd: '7 days to the wedding! The hardest sleeper. One bite = ruined face, wedding in danger.', woke: 'THE BRIDE WOKE UP!', shout: 'MY WEDDING!|MY FACE IS RUINED!', morn: ['Such lovely sleep… I will shine at my wedding ✨', 'Thank you! Today\'s ritual will be perfect 💜', 'Look at my glow! The in-laws will be amazed 😍'] };
LOOK.dulhan = { b: 'mummy' }; SENS_MAP.dulhan = 1.65; R7.SENS0.dulhan = 1.65;
FAM.dulhan = { b: 'dulhan', f: [null, null, null], nw: 'dulhan' }; R7.KEY.dulhan = 'dulhan'; R7.OVK.dulhan = 'dulhan'; R7.SB.dulhan = 'dulhan';
Object.assign(ART.ROOMS, { r_dulhan: { bg: 'room_dulhan', bed: 'bed_shaadi', top: 0.52, sw: [700, 700], win: [330, 220, 230, 300] }, r_aangan: { bg: 'room_aangan', bed: 'bed_shaadi', top: 0.52, sw: [-999, -999] } });
Object.assign(R7.DM, {
  card: ['d_card', 'Wedding cards', 'Cards for everyone 💌'], lehenga: ['d_lehenga', 'Bridal dress', 'I need my dream dress 👗'], mehendi2: ['d_mehendi2', 'Henna artist', 'The best henna in town 🌿'], jewelset: ['d_jewelset', 'Bridal jewellery', 'Necklace, earrings, bangles 💎'],
  makeup: ['d_makeup', 'Bridal makeup', 'Hide the bite marks 💄'], decor: ['d_decor', 'Decoration', 'Fill the house with flowers 💐'], dj: ['d_dj', 'DJ', 'A blast at the music night 🎶'], thali: ['d_thali', 'Catering', 'Food for the guests 🍛'],
  hamper: ['d_hamper', 'Gifts for the in-laws', 'Keep the in-laws happy 🎁'], honeymoon: ['d_honeymoon', 'Honeymoon tickets', 'A trip after the wedding ✈️'], camera: ['d_camera', 'Photographer', 'Every moment on camera 📸'], shagun: ['d_shagun', 'Gift envelope', 'A lucky gift envelope 🧧']
});
R7.DCAT.dulhan = [['makeup', 450], ['lehenga', 0, 20], ['jewelset', 0, 25], ['card', 300], ['decor', 400], ['camera', 380], ['hamper', 500], ['honeymoon', 0, 30], ['dj', 420], ['thali', 450]];
R7.DCAT.bhai = [['recharge', 150], ['pizza', 220], ['cricket', 300], ['movie', 260], ['phone', 0, 20]];
R7.DCAT.behen = [['parlour', 260], ['perfume', 300], ['shopping', 350], ['mehendi', 200], ['choco', 120]];
R7.DCAT.husband = [['chai', 80], ['officebag', 320], ['dinner', 450], ['movie', 260], ['recharge', 150]];
Object.assign(BOSSES, { shaadibigaad: { name: 'WEDDING WRECKER MOSQUITO', emoji: '🤵', tier: 'expert', hp: 95, sp: 360, col: '#2a1466', summon: 'motu', moves: ['dash', 'guards', 'teleport', 'drain'], taunt: 'This wedding will not happen! I will not allow it!' } });

/* ---------- 3. Shaadi ka data ---------- */
R7.SD = [
  { n: 'Invitations', i: 's_mandap', e: '💌', theme: 'r_dulhan', v: null, hard: 'Guests keep calling all night', items: [['card', 300], ['shagun', 250]] },
  { n: 'Shopping', i: 'd_lehenga', e: '🛍️', theme: 'r_dulhan', v: null, hard: 'Tired bride, very light sleep', items: [['lehenga', 0, 18], ['jewelset', 600]] },
  { n: 'Henna', i: 'd_mehendi2', e: '🌿', theme: 'r_dulhan', v: 'dulhan_mehendi', hard: 'Henna on her hands, she can not scratch: every bite 2X', items: [['mehendi2', 420], ['decor', 380]] },
  { n: 'Haldi', i: 's_kalash', e: '✨', theme: 'r_aangan', v: 'dulhan_haldi', hard: 'Turmeric paste on her face: bites leave marks (glow drops 2X)', items: [['hamper', 450], ['thali', 420]] },
  { n: 'Music Night', i: 's_dholak', e: '🎶', theme: 'r_aangan', v: null, hard: 'DJ, drums, firecrackers: noise everywhere', items: [['dj', 480], ['camera', 400]] },
  { n: 'Salon', i: 'd_makeup', e: '💅', theme: 'r_dulhan', v: null, hard: 'Glow matters most. Even one bite hurts', items: [['makeup', 520], ['jewelset', 0, 15]] },
  { n: 'Wedding', i: 's_varmala', e: '💍', theme: 'r_aangan', v: 'dulhan_shaadi', hard: 'Final boss: the Wedding Wrecker and his guest army', items: [['honeymoon', 0, 25], ['shagun', 400]] }
];
R7.SDT = [['survive', 'kill', 'nobite'], ['combo', 'air', 'survive'], ['nobite', 'hunt', 'timeattack'], ['survive', 'waves', 'nobite'], ['score', 'powercut', 'combo'], ['nobite', 'dark', 'survive'], ['nobite', 'waves', 'boss']];
R7.sh = () => { const sv = SV(); if (!sv.shaadi) sv.shaadi = { start: null, wins: {}, paid: {}, taiyari: 0, glow: 100, album: {}, done: 0, fails: 0, ads: {}, early: 0, runs: 0 }; return sv.shaadi; };
R7.shDay = () => { const s = R7.sh(); if (s.start == null) return 0; return Math.min(7, R7.today() - s.start + 1 + (s.early || 0)); };
R7.shLeft = () => { const s = R7.sh(); return s.start == null ? 7 : Math.max(0, 7 - (R7.today() - s.start)); };
R7.shLevel = function (d, k) {
  const task = R7.SDT[d - 1][k], base = LEVELS.find(l => l.task === task && l.w >= 2 && l.w <= 3) || LEVELS[40 + k];
  const L = Object.assign({}, base, { n: 800 + d * 10 + k, shaadi: { d, k }, diff: (base.diff || 1.4) * 1.22, story: `The night of the ${R7.SD[d - 1].n}…` });
  if (task === 'boss') { L.boss = 'shaadibigaad'; L.tier = 'expert'; } else { L.boss = null; }
  return L;
};
R7.shDayDone = d => { const s = R7.sh(), w = s.wins[d] || {}; return [0, 1, 2].every(k => w[k]) && R7.SD[d - 1].items.every((_, i) => s.paid[d + '_' + i]); };
R7.shAd = k => { const s = R7.sh(), t = R7.today() + ''; if (!s.ads[k] || s.ads[k].d !== t) s.ads[k] = { d: t, n: 0 }; return s.ads[k]; };
R7.taiyari = v => { const s = R7.sh(); s.taiyari = clamp(s.taiyari + v, 0, 100); save(); };
R7.glow = v => { const s = R7.sh(); s.glow = clamp(s.glow + v, 0, 100); save(); };

/* ---------- 4. Shaadi ka screen ---------- */
R7.shaadiPanel = function () {
  const s = R7.sh(), sv = SV(), st = R7.status('dulhan');
  if (s.start == null) return R7.shaadiStart();
  if (st === 'hosp') return R7.ilaaj('dulhan');
  if (st === 'dead') return R7.yamlok('dulhan');
  R7.shCheck();
  const day = R7.shDay(), left = R7.shLeft(), firstOpen = [1, 2, 3, 4, 5, 6, 7].find(x => x <= day && !R7.shDayDone(x)) || Math.min(7, day), cur = R7._shSel && R7._shSel <= day ? R7._shSel : firstOpen, D = R7.SD[cur - 1], w = s.wins[cur] || {}, bm = R7.bim('dulhan');
  const tl = R7.SD.map((x, i) => { const d = i + 1, dn = R7.shDayDone(d), lk = d > day; return `<button class="shTl ${dn ? 'dn' : ''} ${d === cur ? 'cur' : ''} ${lk ? 'lk' : ''}" data-sd="${d}"><img src="${R7.A(x.i)}"><b>Day ${d}</b><small>${dn ? '✓' : lk ? '🔒' : x.n}</small></button>`; }).join('');
  const lv = [0, 1, 2].map(k => { const L = R7.shLevel(cur, k), ok = w[k]; return `<button class="shLv ${ok ? 'ok' : ''} ${L.boss ? 'boss' : ''}" data-sl="${k}"><span>${ok ? '✓' : L.boss ? R7.img('b_shaadibigaad') : TASKS[L.task].icon}</span><b>${L.boss ? 'BOSS' : 'Level ' + (k + 1)}</b><small>${L.boss ? 'Wedding Wrecker' : TASKS[L.task].name}</small></button>`; }).join('');
  const items = D.items.map((it, i) => { const inf = R7.DM[it[0]], paid = s.paid[cur + '_' + i]; return `<div class="shIt ${paid ? 'ok' : ''}"><img src="${R7.A(inf[0])}"><div><b>${inf[1]}</b><small>+3% prep</small></div>${paid ? '<em>✓</em>' : `<button class="buy" data-sp="${i}">${it[1] ? coinH(it[1]) : ''}${it[2] ? '💎 ' + it[2] : ''}</button>`}</div>`; }).join('');
  const a1 = R7.shAd('ash').n, a2 = R7.shAd('touch').n, a3 = R7.shAd('lifafa').n, a4 = R7.shAd('early').n;
  META.panel(`<div class="shp"><div class="drmBg" style="background-image:url(${R7.A(D.theme === 'r_aangan' ? 'room_aangan' : 'room_dulhan')})"></div>
    <div class="shTop"><span class="shPic"><img src="${R7.A('dulhan_h')}"></span><div><div class="kick">👰 WEDDING WEEK</div><div class="shCount">${left > 0 ? `💍 Wedding in <b>${left} days</b>` : '💍 <b>The wedding is today!</b>'}</div></div></div>
    <div class="shM"><span>📋 Prep</span><span class="r7bar"><i style="width:${s.taiyari}%"></i></span><b>${Math.round(s.taiyari)}%</b></div>
    <div class="shM glow"><span>✨ Glow</span><span class="r7bar"><i style="width:${s.glow}%"></i></span><b>${Math.round(s.glow)}%</b></div>
    <div class="shM bim"><span>🦠 Sickness</span><span class="r7bar"><i style="width:${bm}%"></i></span><b>${Math.round(bm)}%</b></div>
    <div class="shNote2">You need <b>60%+</b> prep by Day 7 or the wedding is off 😱</div>
    <div class="shTls">${tl}</div>
    <div class="shDay"><div class="shDh">${R7.img(D.i)}<div><b>Day ${cur}: ${D.n}</b><small>⚠️ ${D.hard}</small></div></div>
      <div class="shLvs">${lv}</div><div class="sect" style="margin-top:8px">RITUAL SHOPPING</div>${items}</div>
    <div class="shAds">
      <button class="ilB ad" id="saAsh" ${a1 ? 'disabled' : ''}><img src="${R7.A('s_thali')}"><b>🙏 Blessing</b><small>📺 +10% prep</small></button>
      <button class="ilB ad" id="saTouch" ${a2 >= 2 ? 'disabled' : ''}><img src="${R7.A('d_makeup')}"><b>💄 Touch up</b><small>📺 +25% glow (${2 - a2}/2)</small></button>
      <button class="ilB ad" id="saLif" ${a3 ? 'disabled' : ''}><img src="${R7.A('d_shagun')}"><b>🧧 Gift</b><small>📺 daily envelope</small></button>
      <button class="ilB ad" id="saEarly" ${a4 || day >= 7 ? 'disabled' : ''}><img src="${R7.A('s_timer')}"><b>⏩ Next ritual</b><small>📺 unlock it today</small></button>
      <button class="ilB" id="saPar"><img src="${R7.A('d_parlour')}"><b>Salon</b><small>🪙 400 · +30% glow</small></button>
      <button class="ilB" id="saAlb"><img src="${R7.A('s_album')}"><b>Wedding Album</b><small>${Object.keys(s.album).length}/7 photos</small></button>
    </div></div>`);
  document.querySelectorAll('[data-sd]').forEach(b => b.onclick = () => { const d = +b.dataset.sd; if (d > day) return toast(`🔒 Day ${d} unlocks ${d - day === 1 ? 'tomorrow' : 'in ' + (d - day) + ' days'}`); R7._shSel = d; R7.shaadiPanelDay(d); });
  document.querySelectorAll('[data-sl]').forEach(b => b.onclick = () => R7.shPlay(cur, +b.dataset.sl));
  document.querySelectorAll('[data-sp]').forEach(b => b.onclick = () => { const i = +b.dataset.sp, it = D.items[i]; if (SAVE.coins < (it[1] || 0) || SAVE.gems < (it[2] || 0)) { sfx.low(); return toast('Not enough money. Win levels or open a gift envelope'); } SAVE.coins -= it[1] || 0; SAVE.gems -= it[2] || 0; s.paid[cur + '_' + i] = 1; R7.taiyari(3); REWARD.show({ img: R7.DM[it[0]][0], kick: `DAY ${cur} RITUAL`, t: R7.DM[it[0]][1] + ' done!', sub: '📋 Prep +3%', cb: () => R7.shAfter(cur) }); });
  $('saAsh').onclick = () => showAd(() => { R7.shAd('ash').n++; R7.taiyari(10); REWARD.show({ img: 's_thali', kick: 'THE PRIEST\'S BLESSING', t: '📋 Prep +10%', cb: R7.shaadiPanel }); });
  $('saTouch').onclick = () => showAd(() => { R7.shAd('touch').n++; R7.glow(25); REWARD.show({ img: 'd_makeup', kick: 'TOUCH UP', t: '✨ Glow +25%', cb: R7.shaadiPanel }); });
  $('saLif').onclick = () => showAd(() => { R7.shAd('lifafa').n++; const c = Math.round(rnd(250, 600)); SAVE.coins += c; const sm = R7.SAMAN[(Math.random() * R7.SAMAN.length) | 0]; sv.saman[sm.id] = (sv.saman[sm.id] || 0) + 1; save(); REWARD.show({ img: 'd_shagun', kick: 'LUCKY GIFT ENVELOPE', t: `🪙 +${c}`, sub: `+1 ${sm.name}`, cb: R7.shaadiPanel }); });
  $('saEarly').onclick = () => showAd(() => { R7.shAd('early').n++; s.early = (s.early || 0) + 1; save(); REWARD.show({ img: 's_timer', kick: 'TOMORROW\'S RITUAL TODAY', t: `Day ${Math.min(7, R7.shDay())} unlocked!`, cb: R7.shaadiPanel }); });
  $('saPar').onclick = () => { if (SAVE.coins < 400) return toast('You need 🪙 400'); SAVE.coins -= 400; R7.glow(30); REWARD.show({ img: 'd_parlour', kick: 'SALON', t: '✨ Glow +30%', cb: R7.shaadiPanel }); };
  $('saAlb').onclick = () => R7.shAlbum();
};
R7.shaadiPanelDay = function (d) { const s = R7.sh(); const old = s.early; R7.shaadiPanel(); };
R7.shaadiStart = function () {
  META.modal(`<div class="drm home"><div class="drmPic"><img src="${R7.A('dulhan_h')}"></div><div class="kick">👰 NEW CHAPTER · THE HARDEST</div><div class="big" style="font-size:28px">WEDDING WEEK</div>
    <div class="sub">Only <b>7 days</b> to the wedding. One ritual every day. One mosquito bite and her face is ruined, the bride gets sick, the wedding is in danger!</div>
    <div class="drmHow"><div>📋 <b>Prep 60%+</b> or the wedding is off</div><div>✨ Protect her <b>Glow</b>: every face bite hurts</div><div>👑 Finish all 7 days = <b>Golden Bride</b> + 💎 60</div></div></div>`, '💍 START THE PREP', () => { const s = R7.sh(); s.start = R7.today(); s.runs++; save(); R7.shaadiPanel(); });
};
R7.shPlay = function (d, k) {
  RISHTE.gate(() => { $('meta').classList.add('hide'); const L = R7.shLevel(d, k); FAM.dulhan.nv = R7.SD[d - 1].v; hideAll(); CL = L; startLevel(L, R7._shBoost || {}); R7._shBoost = null; uiPlaying(true); });
};
R7.shAlbum = function () {
  const s = R7.sh();
  META.panel(`<div class="kick">ONE PHOTO FOR EVERY RITUAL</div><div class="big" style="font-size:28px">📸 WEDDING ALBUM</div><div class="alb">${R7.SD.map((x, i) => `<div class="albC ${s.album[i + 1] ? 'on' : ''}"><img src="${R7.A(s.album[i + 1] ? (i === 6 ? 'dulhan_shaadi' : R7.subah('dulhan')) : x.i)}"><b>Day ${i + 1}</b><small>${x.n}</small></div>`).join('')}</div><div class="sub">${s.done ? '👑 Golden Bride' : 'Finish each day to add its photo'}</div>`);
};
R7.shCheck = function () {
  const s = R7.sh(); if (s.start == null || s.done) return;
  if (R7.status('dulhan') === 'hosp') return;
  if (R7.today() - s.start > 8 && !R7.shDayDone(7)) { s.start += 2; R7.taiyari(-15); SV().cards.push({ k: 'muhurat' }); save(); }
};
R7.shAfter = function (d) {
  const s = R7.sh();
  if (R7.shDayDone(d) && !s.album[d]) { s.album[d] = 1; save(); R7._shSel = null; REWARD.show({ img: R7.SD[d - 1].i, kick: `DAY ${d} DONE`, t: `${R7.SD[d - 1].n} complete! 📸`, sub: 'New photo in the album', cb: () => { if (d === 7) R7.shFinal(); else R7.shaadiPanel(); } }); return; }
  if (d === 7 && R7.shDayDone(7) && !s.done) return R7.shFinal();
  R7.shaadiPanel();
};
R7.shFinal = function () {
  const s = R7.sh();
  if (s.taiyari < 60) {
    s.fails++; save();
    META.modal(`<div class="drm dead"><div class="drmPic"><img class="drmFam" src="${R7.A('rota')}"></div><div class="kick">📋 PREP ONLY ${Math.round(s.taiyari)}%</div><div class="big" style="font-size:30px">WEDDING CALLED OFF! 😱</div><div class="sub">The priest says a new date is needed. Replay Day 7.</div>
      <div class="row" style="gap:8px;justify-content:center;margin-top:8px"><button class="adbtn" id="muAd">📺 NEW DATE<small>+10% prep</small></button><button class="buy" id="muGem" style="width:auto;padding:12px 16px">💎 15</button></div></div>`, 'LATER', () => R7.shaadiPanel());
    const redo = () => { $('meta').classList.add('hide'); s.wins[7] = {}; R7.taiyari(10); R7.shaadiPanel(); };
    $('muAd').onclick = () => showAd(redo); $('muGem').onclick = () => { if (SAVE.gems < 15) return toast('Not enough 💎'); SAVE.gems -= 15; redo(); };
    return;
  }
  s.done = 1; const gl = s.glow; SAVE.gems += gl >= 50 ? 60 : 35; SV().titles.dulhan_gold = 1; save();
  META.modal(`<div class="drm home vid"><div class="drmPic big"><img src="${R7.A('dulhan_shaadi')}"></div><div class="kick">💍 THEY ARE MARRIED!</div><div class="big" style="font-size:30px">👑 GOLDEN BRIDE</div>
    <div class="sub">${gl >= 50 ? 'The bride was glowing and the in-laws are thrilled! Happy tears at the farewell 🥹' : 'The wedding happened, but there were marks on her face… the in-laws are a bit upset 😅'}</div>
    <div class="chip">💎 +${gl >= 50 ? 60 : 35} · 📸 Wedding Album complete · 👑 badge</div></div>`, 'FAREWELL 💜', () => showMap());
  try { sfx.clear(); setTimeout(() => sfx.chest(), 600); } catch (e) { }
};

/* ---------- 5. level ke andar: dulhan, kamra, naye machhar ---------- */
(function () {
  const _wc = RISHTE.withChar;
  RISHTE.withChar = function (w) {
    if (typeof CL !== 'undefined' && CL && CL.shaadi) { const c = CHARS.dulhan; return Object.assign({}, w, { sleeper: 'mummy', who: c.n, woke: c.woke, shout: c.shout, cid: 'dulhan', theme: R7.SD[CL.shaadi.d - 1].theme }); }
    return _wc.call(this, w);
  };
  const _sm = HZ.spawnMul.bind(HZ); HZ.spawnMul = function () { let k = _sm(); if (CL && CL.shaadi) k *= 0.8; return k; };
  const _sl = window.startLevel;
  window.startLevel = function (n, b) {
    _sl.apply(this, arguments);
    if (CL && CL.shaadi) { G.r7sp = { t: 4, dh: 0, ph: 0 }; FEED.q = []; FEED.add(`💍 Day ${CL.shaadi.d}: ${R7.SD[CL.shaadi.d - 1].n}`); } else { G.r7sp = null; FAM.dulhan.nv = null; }
  };
  const _tk = META.tick;
  META.tick = function (dt, gdt) {
    _tk.call(META, dt, gdt);
    const sp = G.r7sp; if (!sp || state !== 'play') return;
    sp.t -= gdt;
    if (sp.t <= 0) {
      const d = CL.shaadi.d, pool = d === 5 ? ['dholak', 'dholak', 'baraati', 'photo'] : d === 7 ? ['baraati', 'photo', 'dholak'] : ['photo', 'dholak', 'baraati'];
      const k = pool[(Math.random() * pool.length) | 0], n = k === 'baraati' ? 4 : 1;
      for (let i = 0; i < n; i++) { const m = spawnMosq('normal', k === 'baraati' ? W * (0.15 + i * 0.2) : undefined, k === 'baraati' ? H * 0.2 : undefined); if (m) { m.r7k = k; if (k !== 'baraati') { m.hp = m.maxhp = 3; } m.sz7 = k === 'baraati' ? 34 : 46; m.r7t = 2 + Math.random(); } }
      FEED.add({ dholak: '🥁 Drummer mosquito', photo: '📸 Photographer', baraati: '🎺 The wedding party arrived' }[k]);
      sp.t = Math.max(4, 9 - d * 0.6) * rnd(0.8, 1.2);
    }
    for (const m of G.mosq) {
      if (!m.r7k || m.dead) continue; m.r7t -= gdt; if (m.r7t > 0) continue;
      if (m.r7k === 'dholak') { m.r7t = 3; const s = G.sleepers[0]; if (s && !(G.fx.ear > 0)) { s.neend -= 3; s.wig = 0.4; } try { AU.thump(110, 60, 0.15, 0.4); AU.thump(160, 80, 0.12, 0.3, 0.16); } catch (e) { } G.shake = Math.max(G.shake || 0, 4); }
      if (m.r7k === 'photo') { m.r7t = 4.5; G.flash = 0.75; G.flashCol = '255,255,255'; try { AU.nz(0.12, 0.25, 'highpass', 5000); } catch (e) { } }
      if (m.r7k === 'baraati') { m.r7t = 99; }
    }
  };
  const _dm = window.drawMosq;
  window.drawMosq = function (m, time) {
    if (m.r7k && !m.dead) { const im = ART.i['m_' + m.r7k]; if (im && im.width) { const w = m.sz7 * S, bob = Math.sin(time * 9 + m.x) * 2 * S; ctx.save(); if (m.hurt > 0) ctx.globalAlpha = 0.6; ctx.translate(m.x, m.y + bob); if (m.vx < 0) ctx.scale(-1, 1); ctx.drawImage(im, -w / 2, -w / 2, w, w * im.height / im.width); ctx.restore(); return; } }
    return _dm.apply(this, arguments);
  };
  // glow: chehre ke kaate
  const _dp = window.drawPerson;
  window.drawPerson = function (s, time) { _dp.apply(this, arguments); if (CL && CL.shaadi && (s.cid || s.kind) === 'dulhan' && G.st && G.st.faceBites) { ctx.save(); ctx.fillStyle = 'rgba(255,90,122,.85)'; const n = Math.min(6, G.st.faceBites); for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(s.x + (8 + (i % 3) * 7) * S, bed.y - (92 - Math.floor(i / 3) * 7) * S, 2.2 * S, 0, 7); ctx.fill(); } ctx.restore(); } };
})();

/* ---------- 6. jeet / haar ---------- */
(function () {
  const _sw = window.showWin;
  window.showWin = function (st, objs) {
    if (CL && CL.shaadi) {
      const { d, k } = CL.shaadi, s = R7.sh(); G.cine = null; state = 'win'; const mo = $('r7morn'); if (mo) { mo.classList.add('out'); setTimeout(() => mo.remove(), 500); }
      const fb = G.st.faceBites || 0, b = G.st.bites || 0, gl = -(fb * (d === 4 ? 6 : 3) + b * 1);
      R7.glow(Math.max(-25, gl)); const ty = 3 + st + (s.glow < 30 ? 0 : 1); R7.taiyari(s.glow < 30 ? Math.round(ty / 2) : ty);
      s.wins[d] = s.wins[d] || {}; s.wins[d][k] = 1; const coins = G.coins + 60 + st * 20; SAVE.coins += coins; save();
      R7.addBim('dulhan', Math.min(16, (b * 0.55 + fb * 0.6) * 1.5)); if (R7.giveDawa(1)) { }
      const RS = R7.sh();
      META.modal(`<div class="drm home"><div class="drmPic"><img src="${R7.A(R7.subah('dulhan'))}"></div><div class="kick">💍 DAY ${d} · LEVEL ${k + 1} CLEARED</div><div class="big" style="font-size:28px">${'⭐'.repeat(st)} BRIDE IS SAFE</div>
        <div class="shM"><span>📋 Prep</span><span class="r7bar"><i style="width:${RS.taiyari}%"></i></span><b>${Math.round(RS.taiyari)}%</b></div>
        <div class="shM glow"><span>✨ Glow</span><span class="r7bar"><i style="width:${RS.glow}%"></i></span><b>${Math.round(RS.glow)}%</b></div>
        <div class="chip">🪙 +${coins} · 📋 +${s.glow < 30 ? Math.round(ty / 2) : ty}% prep${gl < 0 ? ` · ✨ ${Math.max(-25, gl)}% glow` : ''}</div>
        <button class="adbtn" id="shX2" style="margin-top:10px">📺 GIFT 2X<small>+${coins} more coins</small></button></div>`, 'CONTINUE ▶', () => R7.shAfter(d));
      $('shX2').onclick = () => { $('shX2').disabled = true; showAd(() => { SAVE.coins += coins; save(); REWARD.show({ img: 'd_shagun', kick: 'GIFT 2X', t: `🪙 +${coins}` }); }); };
      try { sfx.clear(); } catch (e) { } return;
    }
    return _sw.apply(this, arguments);
  };
  const _so = window.showOver;
  window.showOver = function () { if (CL && CL.shaadi) { R7.taiyari(-3); R7.glow(-Math.min(15, (G.st.faceBites || 0) * 3)); R7.addBim('dulhan', Math.min(16, ((G.st.bites || 0) * 0.55 + 3) * 1.5)); } return _so.apply(this, arguments); };
  // "Phir se" / intro: shaadi aur yamlok ke level ke liye sahi jagah bhejo
  const _si = window.showIntro;
  window.showIntro = function (n) {
    if (typeof n === 'number' && n > 300) { if (CL && CL.shaadi) { const { d, k } = CL.shaadi; return R7.shPlay(d, k); } if (CL && CL.yam) return R7.yamlok(CL.yam); return showMap(); }
    return _si.apply(this, arguments);
  };
  // shaadi ke level mein normal farmaish/bimari dobara na lage
  const _al = R7.afterLevel; R7.afterLevel = function () { if (CL && CL.shaadi) return; return _al.apply(this, arguments); };
  // hospital = shaadi tal gayi (din ruk jaate hain)
  const _ho = R7.hospital; R7.hospital = function (id) { _ho.apply(this, arguments); if (id === 'dulhan') { const s = R7.sh(); s.hospAt = R7.today(); save(); } };
  const _gd = R7.giveDawa1; R7.giveDawa1 = function (id) { _gd.apply(this, arguments); if (id === 'dulhan' && !SV().hosp.dulhan) { const s = R7.sh(); if (s.hospAt != null && s.start != null) s.start += R7.today() - s.hospAt; s.hospAt = null; save(); } };
  const _jn = R7.jaan; R7.jaan = function (id, v) { _jn.apply(this, arguments); if (id === 'dulhan' && !SV().dead.dulhan) { const s = R7.sh(); if (s.start != null && !s.done) { SV().shaadi = null; R7.sh(); } } };
})();

/* ---------- 7. map pe Shaadi ka Hafta ---------- */
(function () {
  const _st = R7.strip;
  R7.strip = function () {
    const s = R7.sh(), lock = (SAVE.unlocked || 1) < 6, st = R7.status('dulhan');
    const sub = lock ? '🔒 Unlocks after Level 6' : st === 'hosp' ? '🏥 The bride is in hospital · wedding on hold' : st === 'dead' ? '👻 Bring her back from Yamlok' : s.done ? '👑 Golden Bride · married' : s.start == null ? '7 days · 7 rituals · the hardest' : `💍 ${R7.shLeft()} days left · 📋 ${Math.round(s.taiyari)}% · ✨ ${Math.round(s.glow)}%`;
    return _st.call(this).replace(/<\/div>$/, '') + `<button class="shBan ${lock ? 'lk' : ''}" id="r7Shaadi"><img src="${R7.A('dulhan_h')}" alt=""><div><span class="kick">👰 NEW CHAPTER</span><b>WEDDING WEEK</b><small>${sub}</small></div><span class="hard">VERY HARD</span></button></div>`;
  };
  const _bh = META.bindHub;
  META.bindHub = function () { _bh.call(this); const b = $('r7Shaadi'); if (b) b.onclick = () => { if ((SAVE.unlocked || 1) < 6) return toast('🔒 Clear Level 6 to start the Wedding Week'); sfx.power(); R7.shaadiPanel(); }; };
  const _dr = R7.drama;
  R7.drama = function (k, id) { if (k === 'muhurat') { META.modal(`<div class="drm"><div class="drmPic small"><img src="${R7.A('s_muhurat')}"></div><div class="kick">⏳ A RITUAL WAS MISSED</div><div class="big" style="font-size:26px">WEDDING POSTPONED</div><div class="sub">The priest moved the wedding by 2 days. 📋 Prep −15%.</div></div>`, 'OK', () => renderMap()); return; } return _dr.apply(this, arguments); };
})();

R7.css(`
.shBan{position:relative;display:flex;align-items:center;gap:10px;width:100%;margin-top:10px;border:1.5px solid rgba(255,255,255,.55);border-radius:20px;padding:8px 10px 8px 6px;color:#fff;text-align:left;background:linear-gradient(120deg,#9a6df5,#4a1fa8 55%,#2a1270);box-shadow:0 0 26px rgba(154,109,245,.55);overflow:hidden}
.shBan:before{content:'';position:absolute;inset:-50%;background:linear-gradient(115deg,transparent 45%,rgba(255,255,255,.18) 50%,transparent 55%);animation:dilSweep 3s infinite}
.shBan img{width:74px;height:74px;border-radius:50%;object-fit:cover;object-position:50% 10%;border:3px solid #fff;flex:none;position:relative}
.shBan div{position:relative;flex:1;min-width:0}.shBan b{display:block;font:900 18px Poppins;letter-spacing:.5px}.shBan small{font:600 10.5px Poppins;opacity:.9}
.shBan .hard{position:absolute;top:6px;right:8px;background:#fff;color:#4a1fa8;font:900 8px Poppins;padding:3px 7px;border-radius:7px;letter-spacing:1px}
.shBan.lk img{filter:grayscale(.7)}.shBan.lk{opacity:.75}
.shp{position:relative;text-align:center}
.shTop{display:flex;gap:10px;align-items:center;text-align:left;position:relative}.shPic{width:70px;height:70px;border-radius:50%;overflow:hidden;border:3px solid #fff;flex:none;box-shadow:0 0 18px rgba(154,109,245,.8)}.shPic img{width:100%;height:100%;object-fit:cover;object-position:50% 10%}
.shCount{font:700 15px Poppins;margin-top:3px}.shCount b{font-weight:900;color:rgb(127,212,255)}
.shM{display:grid;grid-template-columns:72px 1fr 40px;align-items:center;gap:8px;margin-top:7px;text-align:left;position:relative}.shM span:first-child{font:700 11px Poppins}.shM .r7bar{margin:0;height:10px}.shM b{font:900 12px Poppins;text-align:right}
.shM.glow .r7bar i{background:linear-gradient(90deg,#c7b0ff,#fff)}.shM.bim .r7bar i{background:linear-gradient(90deg,#9a6df5,#ff6b8a)}
.shNote2{font:600 11px Poppins;color:#ffd0dc;margin:8px 0 4px;position:relative}
.shTls{display:flex;gap:5px;overflow-x:auto;padding:6px 0;scrollbar-width:none;position:relative}.shTls::-webkit-scrollbar{display:none}
.shTl{flex:none;width:56px;border:1.5px solid rgba(255,255,255,.18);border-radius:12px;background:rgba(255,255,255,.06);color:#fff;padding:4px 2px;display:flex;flex-direction:column;align-items:center}
.shTl img{width:30px;height:30px;object-fit:contain}.shTl b{font:800 9px Poppins}.shTl small{font:600 8px Poppins;opacity:.8;white-space:nowrap;overflow:hidden;max-width:100%}
.shTl.cur{border-color:#fff;background:linear-gradient(170deg,#9a6df5,#4a1fa8);box-shadow:0 0 12px rgba(154,109,245,.8)}.shTl.dn{border-color:rgb(127,212,255)}.shTl.lk{opacity:.45}.shTl.lk img{filter:grayscale(1)}
.shDay{position:relative;background:rgba(0,0,0,.22);border-radius:16px;padding:10px;margin-top:6px;text-align:left}
.shDh{display:flex;gap:10px;align-items:center}.shDh img{width:50px;height:50px;object-fit:contain}.shDh b{display:block;font:900 15px Poppins}.shDh small{font:600 10.5px Poppins;color:#ffd0dc}
.shLvs{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px}
.shLv{border:1.5px solid rgba(255,255,255,.2);border-radius:14px;background:linear-gradient(170deg,rgba(154,109,245,.4),rgba(28,12,79,.6));color:#fff;padding:7px 2px;display:flex;flex-direction:column;align-items:center}
.shLv span{font-size:22px;height:34px;display:flex;align-items:center}.shLv span img{height:34px}.shLv b{font:800 12px Poppins}.shLv small{font:600 9px Poppins;opacity:.8}
.shLv.ok{border-color:rgb(127,212,255);background:rgba(127,212,255,.18)}.shLv.boss{border-color:#ff6b8a;box-shadow:0 0 14px rgba(255,61,110,.4)}
.shIt{display:flex;gap:8px;align-items:center;background:rgba(255,255,255,.07);border-radius:12px;padding:6px 8px;margin-top:6px}.shIt img{width:40px;height:40px;object-fit:contain}.shIt div{flex:1}.shIt b{display:block;font:800 12px Poppins}.shIt small{font:600 10px Poppins;opacity:.8}.shIt .buy{width:auto;padding:7px 10px;font-size:12px}.shIt em{font-style:normal;font:900 18px Poppins;color:rgb(127,212,255)}.shIt.ok{opacity:.7}
.shAds{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:10px;position:relative}.shAds .ilB{padding:7px 3px}.shAds .ilB img{width:36px;height:36px}.shAds .ilB b{font-size:11px}.shAds .ilB small{font-size:9px}
.alb{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:10px 0}.albC{border-radius:14px;background:rgba(255,255,255,.06);border:2px dashed rgba(255,255,255,.2);padding:6px;display:flex;flex-direction:column;align-items:center}.albC img{width:100%;height:90px;object-fit:contain;filter:grayscale(1) brightness(.45)}.albC.on{border:2px solid #fff;background:linear-gradient(170deg,#efe8ff,#d9ccff)}.albC.on img{filter:none}.albC b{font:800 12px Poppins}.albC small{font:600 10px Poppins;opacity:.8}.albC.on b,.albC.on small{color:#2a1270}
.drmPic.big{height:210px}
`);

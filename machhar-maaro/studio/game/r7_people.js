/* ================= MACHHAR MAARO · ROUND 7 · RISHTE, DIL KE RISHTE, FARMAISH, BIMARI, YAMLOK =================
   - Dil ke Rishte: Wife, Girlfriend, Crush, Padoswali (sabse mushkil, sabse alag)
   - Rishta Meter: har level ke star se bharta hai, haar pe ghatta hai, 100% sirf saare level poore hone pe
   - Farmaish Diary: kaata to demand aati hai, poori karo to icon chamakta hai (x2, x3, tiers)
   - Bimari Meter: kaate se bharta hai, 100% = hospital, 3 din mein ilaaj nahi = aatma, Yamlok se wapas lao
================================================================================================= */
const DAY = 864e5;
const SV = () => {
  if (!SAVE.r7) SAVE.r7 = {};
  const d = { pen: {}, ms: {}, bim: {}, bimDay: Math.floor(Date.now() / DAY), hosp: {}, dead: {}, dem: { pend: [], done: {}, day: -1 }, titles: {}, outfit: {}, ovAds: {}, hero: null, heroAds: 0, heroes: {}, saman: {}, samanAd: { d: '', n: 0 }, dawaAd: {}, timeAd: {}, jaanAd: {}, boostAd: {}, loss2: 0, l5: 0, cards: [], deals: {}, ticketAd: 0 };
  for (const k in d) if (SAVE.r7[k] === undefined) SAVE.r7[k] = d[k];
  return SAVE.r7;
};
SV();
R7.today = () => Math.floor(Date.now() / DAY);

/* ---------- 1. naye kirdaar ---------- */
Object.assign(CHARS.wife, { n: 'Wife', e: '💍', q: 'light', dil: 1, secret: 0, qd: 'Lightest sleeper. Zap noise 2X. Every bite brings a new request!', woke: 'WIFE WOKE UP!', shout: 'MOSQUITOES AGAIN?!|NOW I NEED THE SALON!', morn: ['I slept so well… dinner of your choice tonight 😍', 'Look at my face, so fresh! No salon needed 💅', 'Without you I would be going shopping again 😌'] });
Object.assign(CHARS.gf, { e: '💕', dil: 1, secret: 0, qd: 'Her phone keeps lighting up. The light attracts mosquitoes.', shout: 'HELLO?!|WHY DID YOU WAKE ME?!' });
Object.assign(CHARS.crush, { e: '😍', q: 'silent', dil: 1, secret: 0, qd: 'SILENT MODE: racket noise counts 2.6X. Swat quietly!', woke: 'YOUR CRUSH WOKE UP! 😳', shout: 'WHO IS IT?!|YOU, HERE?!' });
CHARS.padoswali = { n: 'Neighbour', e: '🏠', look: 'mummy', q: 'double', dil: 1, qd: 'Her window is open: DOUBLE mosquitoes. If she wakes up, the whole street will know!', woke: 'THE NEIGHBOUR WOKE UP!', shout: 'OH NO!|I WILL TELL EVERYONE!', morn: ['Such lovely sleep… I owe you a cup of tea ☕😉', 'I look the freshest on the whole street 💜', 'Thank you, neighbour! Even the gossip feels nice today 😄'] };
LOOK.padoswali = { b: 'mummy' };
R7.DIL = ['wife', 'gf', 'crush', 'padoswali'];
const _pi = PUBLIC_IDS.indexOf('wife'); if (_pi >= 0) PUBLIC_IDS.splice(_pi, 1);
for (const id of ['gf', 'crush']) { const i = SECRET_IDS.indexOf(id); if (i >= 0) SECRET_IDS.splice(i, 1); }
Object.assign(SENS_MAP, { wife: 1.5, gf: 1.35, crush: 1.55, padoswali: 1.4 });
R7.SENS0 = Object.assign({}, SENS_MAP);
R7.KEY = { wife: 'wife', gf: 'girlfriend', crush: 'crush', padoswali: 'padoswali' };
R7.SB = { papa: 'papa', mummy: 'mummy', dadi: 'dadi', nani: 'dadi', dada: 'dada', nana: 'dada', bachcha: 'bachcha', bhai: 'dost', behen: 'mummy', husband: 'papa', dost: 'dost', dulha: 'dulha', raja: 'raja', bf: 'dost', wife: 'wife', gf: 'girlfriend', crush: 'crush', padoswali: 'padoswali' };
R7.OWNART = ['papa', 'mummy', 'dadi', 'nani', 'dada', 'nana', 'bachcha', 'dost', 'dulha', 'raja'];
R7.face = id => R7.KEY[id] ? R7.KEY[id] + '_h' : R7.OWNART.includes(id) ? 'sb_' + R7.SB[id] : null;
R7.subah = id => R7.SB[id] ? 'sb_' + R7.SB[id] : 'sb_papa';
R7.OLDG = { papa: 'papa_g', mummy: 'mummy_g', dadi: 'dadi_g', nani: 'dadi_g', dada: 'dada_g', nana: 'dada_g', bachcha: 'bachcha_g', dost: 'dost_g', dulha: 'dulha_g', raja: 'raja_g' };
R7.angry = id => R7.KEY[id] ? R7.KEY[id] + '_g' : R7.OLDG[id] || null;
R7.av = (id, cls = '') => { const f = R7.face(id); return f ? `<span class="r7av ${cls}"><img src="${R7.A(f)}" alt=""></span>` : `<span class="r7av ${cls} em">${CHARS[id].e}</span>`; };
const _ART_ROOMS = { gf: 'r_gf', crush: 'r_crush', padoswali: 'r_pad' };
Object.assign(ART.ROOMS, { r_gf: { bg: 'room_gf', bed: 'bed_hostel', top: 0.63, sw: [690, 700], win: [380, 230, 200, 300] }, r_crush: { bg: 'room_crush', bed: 'bed_hostel', top: 0.63, sw: [700, 690], win: [350, 230, 200, 270] }, r_pad: { bg: 'room_padoswali', bed: 'bed_shaadi', top: 0.52, sw: [700, 700], win: [330, 220, 230, 300] }, yamlok: { bg: 'room_yamlok', bed: 'bed_shaadi', top: 0.52, sw: [-999, -999] } });
for (const id of R7.DIL) FAM[id] = { b: R7.KEY[id], f: [null, null, null], nw: R7.KEY[id] };
const OVK = { papa: 'papa', husband: 'papa', mummy: 'mummy', behen: 'mummy', dadi: 'dadi', nani: 'dadi', dada: 'dada', nana: 'dada', bachcha: 'bachcha', dost: 'dost', dulha: 'dulha', raja: 'raja', wife: 'wife', gf: 'girlfriend', crush: 'crush', padoswali: 'padoswali' };
R7.OVK = OVK;
R7.outfitOn = id => !!(SV().outfit[id] && OVK[id]);

/* availability */
R7.status = id => SV().dead[id] ? 'dead' : SV().hosp[id] ? 'hosp' : 'ok';
const _cid = RISHTE.cid.bind(RISHTE);
RISHTE.cid = function (w) {
  let c = _cid(w);
  if (R7.status(c) !== 'ok') { const alt = PUBLIC_IDS.concat(R7.DIL).find(i => R7.status(i) === 'ok'); if (alt) c = alt; }
  return c;
};
const _withChar = RISHTE.withChar.bind(RISHTE);
RISHTE.withChar = function (w) {
  if (typeof CL !== 'undefined' && CL && CL.yam) { const id = CL.yam, c = CHARS[id]; return Object.assign({}, w, { sleeper: LOOK[c.look].b, who: c.n, woke: c.woke, shout: c.shout, cid: id, theme: 'yamlok' }); }
  const r = _withChar(w); if (_ART_ROOMS[r.cid]) r.theme = _ART_ROOMS[r.cid]; return r;
};

/* ---------- 2. naye kirdaar aur special kapde ko bistar pe draw karo ---------- */
(function () {
  const _dp = window.drawPerson;
  window.drawPerson = function (s, time) {
    const id = s.cid || s.kind, F = FAM[id], yam = CL && CL.yam && id === CL.yam;
    if (yam) { ctx.save(); ctx.globalAlpha = 0.62; try { ctx.filter = 'saturate(.35) brightness(1.3)'; } catch (e) { } ctx.translate(0, Math.sin(time * 2) * 4 * S); }
    let done = false;
    if (F && ART.ok && !s.walk) {
      const ang = s.neend < 22 || (G.cine && G.cine.type === 'wake');
      let key = null, wk = 0.84, ax = 0.08, dy = 14;
      if (R7.outfitOn(id) && ART.i['ov_' + OVK[id]] && ART.i['ov_' + OVK[id]].width) { key = 'ov_' + OVK[id]; wk = 0.9; ax = 0.12; dy = 18; }
      else if (F.nw) { const gk = F.ng || F.nw + '_g'; key = ang && ART.i[gk] && ART.i[gk].width ? gk : (F.nv && ART.i[F.nv] && ART.i[F.nv].width ? F.nv : F.nw); if (key === F.nv) { wk = 0.9; ax = 0.12; dy = 18; } }
      { const ki = key && ART.i[key]; if (ki && ki.width && !key.endsWith('_g') && ki.width / ki.height > 1.7) { wk = 1.0; ax = 0.1; dy = 12; } }
      const baseIm = F.nw && ART.i[F.nw];
      const im = key && ART.i[key];
      if (im && im.width) {
        const multi = G.sleepers.length > 1, seg = Math.max(60 * S, s.end - s.x); let w = multi ? seg * (wk > 1 ? 1.2 : 1.15) : bed.w * wk, h = im.height * w / im.width;
        if (key.endsWith('_g') && baseIm && baseIm.width) { h = bed.w * (multi ? 0.42 : 0.52); w = h * im.width / im.height; }
        const x0 = s.x + 6 * S - ax * w, y0 = bed.y + dy * S - h, br = Math.sin(time * 1.9 + s.x) * 0.012, wig = s.wig > 0 ? Math.sin(time * 50) * 2.5 * S * Math.min(1, s.wig) : 0;
        ctx.save(); ctx.translate(wig, 0); ctx.translate(x0 + w / 2, y0 + h); ctx.scale(1, 1 + br); ctx.translate(-(x0 + w / 2), -(y0 + h));
        ctx.drawImage(im, x0, y0, w, h);
        if (s.bitten > 0 || s.neend < 55) { ctx.globalCompositeOperation = 'source-atop'; }
        ctx.restore();
        if (s.bitten > 0) { ctx.save(); ctx.globalAlpha = Math.min(0.5, s.bitten) * (0.6 + Math.sin(time * 18) * 0.4); ctx.fillStyle = '#ff5a7a'; ctx.beginPath(); ctx.arc(x0 + w * 0.22, y0 + h * 0.25, 9 * S, 0, 7); ctx.fill(); ctx.restore(); }
        if (!ang && typeof drawSleepZ === 'function') { try { drawSleepZ(s, S * s.sc, time); } catch (e) { } }
        done = true;
      }
    }
    if (!done) _dp(s, time);
    if (yam) { ctx.restore(); const hi = ART.i.u_halo; if (hi && hi.width) { const hw = 54 * S; ctx.save(); ctx.globalAlpha = 0.9; ctx.drawImage(hi, s.x + 4 * S - hw / 2, bed.y - 150 * S + Math.sin(time * 2) * 4 * S, hw, hw * hi.height / hi.width); ctx.restore(); } }
  };
})();

/* ---------- 3. RISHTA METER ---------- */
R7.rp = id => { const r = RISHTE.rec(id), sum = Object.values(r.stars || {}).reduce((a, b) => a + b, 0); return clamp(sum / 225 * 100 - (SV().pen[id] || 0), 0, 100); };
R7.rpTxt = p => (p >= 10 ? Math.floor(p) : p.toFixed(1)) + '%';
R7.MS = [[25, 'Sweet Bond', 'g', 5, '🥉'], [50, 'Deep Bond', 'g', 10, '🥈'], [75, 'Unbreakable Bond', 'g', 20, '🥇'], [100, 'GOLDEN BOND', 'g', 50, '👑']];
R7.checkMs = function (id) {
  const p = R7.rp(id), sv = SV();
  for (const m of R7.MS) if (p >= m[0] && !sv.ms[id + m[0]]) { sv.ms[id + m[0]] = 1; SAVE.gems += m[3]; save(); REWARD.show({ img: R7.face(id), kick: `${m[0]}% BOND WITH ${CHARS[id].n.toUpperCase()}`, t: `${m[4]} ${m[1]}`, sub: `💎 +${m[3]} gems · new title: ${m[1]}`, to: '#mGems' }); }
};
R7.ring = (p, inner, cls = '') => `<span class="r7ring ${cls}" style="--p:${p}">${inner}</span>`;

/* ---------- 4. BIMARI METER ---------- */
R7.bim = id => clamp(SV().bim[id] || 0, 0, 100);
R7.bimDecay = function () {
  const sv = SV(), t = R7.today(), d = t - (sv.bimDay || t);
  if (d > 0) { for (const k in sv.bim) sv.bim[k] = Math.max(0, sv.bim[k] - 8 * d); sv.bimDay = t; save(); }
};
R7.addBim = function (id, v) {
  if (!id || R7.status(id) !== 'ok') return 0;
  const sv = SV(); sv.bim[id] = clamp((sv.bim[id] || 0) + v, 0, 100); save();
  if (sv.bim[id] >= 100) R7.hospital(id);
  return v;
};
R7.HOSP_MS = 3 * DAY;
R7.hospital = function (id) {
  const sv = SV(); if (sv.hosp[id] || sv.dead[id]) return;
  sv.hosp[id] = { t0: Date.now(), need: 8, got: 0 }; sv.bim[id] = 100;
  if (SAVE.curChar === id) SAVE.curChar = null; save();
  sv.cards.push({ k: 'hosp', id }); save();
};
R7.hospLeft = id => { const h = SV().hosp[id]; return h ? Math.max(0, h.t0 + R7.HOSP_MS - Date.now()) : 0; };
R7.fmtLeft = ms => { const h = Math.floor(ms / 36e5), d = Math.floor(h / 24); return d ? `${d}d ${h % 24}h` : `${h}h ${Math.floor(ms / 6e4) % 60}m`; };
R7.checkDeaths = function () {
  const sv = SV();
  for (const id in sv.hosp) if (R7.hospLeft(id) <= 0) { delete sv.hosp[id]; sv.dead[id] = { jaan: 0, lv: 0, t: Date.now() }; sv.bim[id] = 0; sv.cards.push({ k: 'dead', id }); save(); }
};
R7.giveDawa = function (n, why) {
  const sv = SV(); let any = false;
  for (const id in sv.hosp) { const h = sv.hosp[id]; h.got = Math.min(h.need, h.got + n); any = true; if (h.got >= h.need) { delete sv.hosp[id]; sv.bim[id] = 30; sv.cards.push({ k: 'home', id }); } }
  if (any) save(); return any;
};

/* ---------- 5. FARMAISH (DEMANDS) ---------- */
const DM = {
  parlour: ['d_parlour', 'Salon visit', 'The mosquitoes ruined my face! 💅'], shopping: ['d_shopping', 'Shopping trip', 'My sleep was ruined. Fix my mood 🛍️'], gift: ['d_gift', 'A gift', 'The best way to say sorry 🎁'],
  flowers: ['d_flowers', 'Flowers', 'Be a little romantic 💐'], choco: ['d_choco', 'Chocolate', 'Something sweet cools the anger 🍫'], dinner: ['d_dinner', 'Candle light dinner', 'Let us eat out tonight 🕯️'],
  movie: ['d_movie', 'Movie tickets', 'A new movie is out 🎬'], mehendi: ['d_mehendi', 'Henna', 'There is a wedding to go to 🌿'], perfume: ['d_perfume', 'Perfume', 'No more mosquito smell 🌸'],
  jewel: ['d_jewel', 'New necklace', 'Just a small one 💎'], bag: ['d_bag', 'Designer bag', 'Everyone has one except me 👜'], phone: ['d_phone', 'New phone', 'This phone light brought the mosquitoes 📱'],
  chai: ['d_chai', 'Hot tea', 'Sleep is broken. I need tea ☕'], dawa: ['d_dawa', 'Medicine', 'The itching will not stop 💊'], homework: ['d_homework', 'Homework help', 'No sleep, homework unfinished 📒'],
  toy: ['d_toy', 'New toy', 'A toy before the tears 🚗'], cricket: ['d_cricket', 'Cricket kit', 'Big match on Sunday 🏏'], pizza: ['d_pizza', 'Pizza party', 'Pizza makes up for last night 🍕'],
  specs: ['d_specs', 'New glasses', 'They broke in the dark 👓'], paper: ['d_paper', 'Newspaper', 'The morning paper is a must 📰'], ladoo: ['d_ladoo', 'Box of sweets', 'Sweets for the whole street 🍬'],
  recharge: ['d_recharge', 'Mobile recharge', 'Out of data 📶'], cooler: ['d_cooler', 'New cooler', 'More mosquitoes in the heat 💨'], officebag: ['d_officebag', 'Office bag', 'Meeting tomorrow 💼']
};
const DCAT = {
  wife: [['parlour', 300], ['shopping', 400, 3], ['mehendi', 250], ['perfume', 350], ['dinner', 450], ['movie', 220], ['flowers', 160], ['bag', 600], ['jewel', 0, 15], ['choco', 150]],
  gf: [['gift', 300], ['choco', 160], ['flowers', 200], ['movie', 260], ['dinner', 500], ['perfume', 350], ['bag', 520], ['phone', 0, 22], ['T_nobite'], ['jewel', 0, 18]],
  crush: [['T_nobite'], ['flowers', 220], ['choco', 200], ['movie', 320], ['gift', 420], ['T_stars3'], ['dinner', 600], ['perfume', 380], ['jewel', 0, 20], ['phone', 0, 25]],
  padoswali: [['ladoo', 300], ['gift', 350], ['recharge', 200], ['flowers', 160], ['perfume', 320], ['mehendi', 260], ['shopping', 420, 3], ['T_nobite'], ['bag', 560], ['jewel', 0, 16]],
  papa: [['chai', 80], ['paper', 60], ['specs', 220], ['officebag', 320], ['recharge', 150], ['cooler', 650]],
  mummy: [['shopping', 300], ['mehendi', 200], ['ladoo', 150], ['dinner', 380], ['cooler', 600], ['perfume', 260]],
  dadi: [['dawa', 120], ['specs', 180], ['ladoo', 100], ['chai', 60], ['paper', 70]], nani: [['dawa', 120], ['specs', 180], ['ladoo', 100], ['chai', 60]],
  dada: [['paper', 60], ['specs', 200], ['dawa', 150], ['chai', 60], ['cricket', 300]], nana: [['paper', 60], ['specs', 200], ['dawa', 150], ['chai', 60]],
  bachcha: [['homework', 100], ['toy', 250], ['choco', 120], ['pizza', 220], ['cricket', 320]],
  dost: [['pizza', 250], ['recharge', 150], ['movie', 300], ['homework', 120], ['cricket', 320]],
  dulha: [['flowers', 200], ['perfume', 300], ['dinner', 500], ['shopping', 600], ['jewel', 0, 25]],
  raja: [['ladoo', 400], ['cooler', 800], ['dinner', 700], ['jewel', 0, 30], ['perfume', 500]],
  _: [['chai', 80], ['pizza', 220], ['recharge', 150], ['gift', 300], ['choco', 150]]
};
const DTASK = { T_nobite: ['u_heartplus', 'Zero face bites', 'Win a level with no face bites 😤'], T_stars3: ['u_trophyheart', '3 stars', 'Win a level with 3 stars for this person ⭐'] };
R7.DM = DM; R7.DCAT = DCAT;
R7.cat = id => DCAT[id] || DCAT._;
R7.dInfo = (key) => DM[key] ? { img: DM[key][0], n: DM[key][1], line: DM[key][2] } : { img: DTASK[key][0], n: DTASK[key][1], line: DTASK[key][2], task: 1 };
R7.TIER = [[1, 'Bronze', '#c98a5a'], [3, 'Silver', '#cfd3e6'], [7, 'Gold', '#e8c15a'], [15, 'Diamond', '#7fd4ff']];
R7.tier = c => { let t = null; for (const x of R7.TIER) if (c >= x[0]) t = x; return t; };
R7.pend = id => SV().dem.pend.filter(d => !id || d.id === id);
R7.newDemand = function (id, urgent) {
  const sv = SV(), cat = R7.cat(id), done = sv.dem.done[id] || {}, uniq = Object.keys(done).length;
  const avail = cat.slice(0, Math.min(cat.length, 3 + uniq)).filter(c => !sv.dem.pend.some(p => p.id === id && p.k === c[0]));
  if (!avail.length) return null;
  const c = avail[(Math.random() * avail.length) | 0], dil = CHARS[id] && CHARS[id].dil, mult = (dil ? 1.25 : 1) * (1 + Math.min(1, (done[c[0]] || 0) * 0.12));
  const d = { uid: Date.now() + '' + ((Math.random() * 999) | 0), id, k: c[0], c: Math.round((c[1] || 0) * mult / 10) * 10, g: c[2] ? Math.round(c[2] * (dil ? 1.2 : 1)) : 0, at: Date.now(), until: urgent ? Date.now() + DAY : 0, urg: urgent ? 1 : 0, half: 0 };
  if (c[0].startsWith('T_')) { d.c = 0; d.g = 0; }
  sv.dem.pend.push(d); save(); return d;
};
R7.demandCard = function (d, to) { const i = R7.dInfo(d.k), c = CHARS[d.id]; REWARD.show({ img: i.img, kick: d.urg ? '⚡ TODAY\'S REQUEST' : `📜 ${c.n.toUpperCase()}\'S REQUEST`, t: i.n, sub: `${c.e} "${i.line}"`, to: to || '#r7Diary', hold: 2300 }); };
R7.completeDemand = function (d) {
  const sv = SV(), done = sv.dem.done[d.id] = sv.dem.done[d.id] || {}, before = R7.tier(done[d.k] || 0);
  done[d.k] = (done[d.k] || 0) + 1; sv.dem.pend = sv.dem.pend.filter(x => x.uid !== d.uid);
  sv.pen[d.id] = Math.max(0, (sv.pen[d.id] || 0) - 1.5);
  const after = R7.tier(done[d.k]), i = R7.dInfo(d.k); let sub = `${CHARS[d.id].e} ${CHARS[d.id].n} is happy! 💞 Bond up`;
  if (after && (!before || after[0] !== before[0])) { const gm = { Bronze: 1, Silver: 3, Gold: 6, Diamond: 12 }[after[1]]; SAVE.gems += gm; sub = `${after[1].toUpperCase()} request! 💎 +${gm}`; }
  if (d.urg) { SAVE.gems += 3; sub += ' · ⚡ +3 💎'; }
  const cat = R7.cat(d.id); if (!sv.titles[d.id] && cat.every(c => done[c[0]])) { sv.titles[d.id] = 1; SAVE.gems += 25; setTimeout(() => REWARD.show({ img: 'u_crown', kick: 'ALL REQUESTS DONE!', t: R7.TITLE(d.id), sub: '💎 +25 · new title unlocked' }), 300); }
  save(); REWARD.show({ img: i.img, kick: `×${done[d.k]} ${i.n.toUpperCase()}`, t: 'REQUEST DONE! ✅', sub, to: '#r7Diary' });
};
R7.TITLE = id => ({ wife: 'Husband of the Year 🏆', gf: 'Best Boyfriend 💕', crush: 'Heart Winner 😍', padoswali: 'Street Hero 🏠', papa: 'Best Son 👨', mummy: 'Mummy\'s Favourite 👩', dadi: 'Grandma\'s Darling 👵', dada: 'Grandpa\'s Tiger 👴', bachcha: 'Superhero Big Bro 🦸', dost: 'True Friend 🤝', dulha: 'Wedding Hero 🤵', raja: 'Royal Guard 👑' }[id] || 'King of Bonds 👑');
R7.payDemand = function (d, mode) {
  if (mode === 'ad') { if (d.half) return; showAd(() => { d.half = 1; d.c = Math.round(d.c / 2); d.g = Math.round(d.g / 2); save(); toast('📺 Half price unlocked!'); R7.diary(d.id); }); return; }
  if (SAVE.coins < d.c || SAVE.gems < d.g) { sfx.low(); return toast(SAVE.coins < d.c ? `You need ${fmt(d.c - SAVE.coins)} more coins` : `You need ${d.g - SAVE.gems} more gems`); }
  SAVE.coins -= d.c; SAVE.gems -= d.g; R7.completeDemand(d); R7.diary(d.id);
};
R7.demandTick = function () {
  const sv = SV(), now = Date.now();
  sv.dem.pend.filter(d => d.until && now > d.until).forEach(d => { sv.pen[d.id] = (sv.pen[d.id] || 0) + 2; sv.dem.pend = sv.dem.pend.filter(x => x !== d); });
  if (sv.dem.day !== R7.today()) { sv.dem.day = R7.today(); const pool = PUBLIC_IDS.concat(R7.DIL).filter(i => R7.status(i) === 'ok' && (RISHTE.rec(i).nights > 0 || i === RISHTE.cid(0))); const id = pool[(Math.random() * pool.length) | 0] || 'papa'; const d = R7.newDemand(id, true); if (d) sv.cards.push({ k: 'dem', uid: d.uid }); }
  save();
};
/* level khatam hone pe: farmaish, bimari, rishta */
R7.afterLevel = function (won, st) {
  if (CL.ev || CL.yam) return;
  const id = CW.cid, sv = SV(), dil = CHARS[id] && CHARS[id].dil, b = G.st.bites || 0, fb = G.st.faceBites || 0;
  const bimAdd = Math.min(14, b * 0.55 + fb * 0.6 + (won ? 0 : 3)) * (dil ? 1.2 : 1) * (hasGhar('net') ? 0.85 : 1);
  R7.lastBim = { id, add: Math.round(bimAdd * 10) / 10, v: R7.bim(id) + bimAdd };
  R7.addBim(id, bimAdd);
  if (won) { sv.pen[id] = Math.max(0, (sv.pen[id] || 0) - 0.8); if (R7.giveDawa(1)) R7.lastDawa = 1; }
  else sv.pen[id] = (sv.pen[id] || 0) + 0.6;
  // task farmaish poori?
  for (const d of R7.pend(id).filter(d => d.k.startsWith('T_'))) if (won && ((d.k === 'T_nobite' && fb === 0) || (d.k === 'T_stars3' && st >= 3))) setTimeout(() => R7.completeDemand(d), 2600);
  const need = dil ? 2 : 4;
  if (b >= need && R7.pend(id).length < 2 && Math.random() < (dil ? 0.9 : 0.55)) { const d = R7.newDemand(id); if (d) setTimeout(() => R7.demandCard(d, null), won ? 2600 : 2900); }
  save();
};
R7.showCards = function () {
  const sv = SV(); if (!sv.cards.length || state !== 'map') return;
  const c = sv.cards.shift(); save();
  if (c.k === 'dem') { const d = sv.dem.pend.find(x => x.uid === c.uid); if (d) R7.demandCard(d, '#r7Diary'); setTimeout(R7.showCards, 2500); return; }
  R7.drama(c.k, c.id);
};

/* ---------- 6. drama screens: hospital, ghar wapsi, aatma ---------- */
R7.drama = function (k, id) {
  const c = CHARS[id], n = c.n, sv = SV();
  let html = '', btn = 'OK', cb = () => { renderMap(); setTimeout(R7.showCards, 300); };
  if (k === 'hosp') {
    const h = sv.hosp[id] || { need: 8, got: 0 };
    html = `<div class="drm hosp"><div class="drmBg" style="background-image:url(${R7.A('room_hospital')})"></div><div class="drmPic"><img class="drmFam" src="${R7.A('rota')}" alt=""></div>
      <div class="kick">🚑 SICKNESS METER 100%</div><div class="big" style="font-size:28px">${n.toUpperCase()} IS IN HOSPITAL!</div>
      <div class="sub">High fever from mosquito bites. The doctor needs <b>${h.need} medicines</b>.</div>
      <div class="drmTimer">⏳ Treat ${n} within <b>${R7.fmtLeft(R7.hospLeft(id))}</b> or you will lose them 💔</div>
      <div class="drmHow"><div>🏆 Every level won = <b>1 medicine</b></div><div>📺 Watch an ad = <b>1 medicine</b></div><div>💎 12 gems = <b>1 medicine</b></div></div></div>`;
    btn = '💊 START TREATMENT'; cb = () => R7.ilaaj(id);
  } else if (k === 'home') {
    html = `<div class="drm home"><div class="drmPic"><img src="${R7.A(R7.subah(id))}" alt=""></div><div class="kick">🏠 TREATMENT DONE</div><div class="big" style="font-size:30px">${n.toUpperCase()} IS HOME!</div><div class="sub">Thanks to you, ${n} is healthy again. 💞 Your bond grew deeper.</div><div class="chip">💎 +10 gems · ❤️ hearts full</div></div>`;
    SAVE.gems += 10; SAVE.hearts = 5; save(); btn = 'THANK YOU 💜';
  } else if (k === 'dead') {
    const fk = R7.face(id);
    html = `<div class="drm dead"><div class="drmPic"><img class="drmFam" src="${R7.A('rota')}" alt=""><span class="drmGhost">${fk ? `<img src="${R7.A(fk)}" alt="">` : c.e}<img class="drmHalo" src="${R7.A('u_halo')}" alt=""></span></div>
      <div class="kick">💔 NOT TREATED IN 3 DAYS</div><div class="big" style="font-size:28px">${n.toUpperCase()} IS GONE</div>
      <div class="sub">The family is in tears. ${n}\'s spirit now wanders the house.</div>
      <div class="drmHow"><div>👹 Go to <b>Yamlok</b> and defeat the Yamraj Mosquito</div><div>💙 15 tough levels · fill the Soul Meter to 100%</div></div></div>`;
    btn = '👹 GO TO YAMLOK'; cb = () => R7.yamlok(id);
  }
  META.modal(html, btn, cb); try { sfx[k === 'home' ? 'clear' : 'heart'](1.4); } catch (e) { }
};
R7.ilaaj = function (id) {
  const sv = SV(), h = sv.hosp[id]; if (!h) return renderMap();
  const t = R7.today(), adN = (sv.dawaAd[id] && sv.dawaAd[id].d === t) ? sv.dawaAd[id].n : 0, tm = sv.timeAd[id] === t;
  META.panel(`<div class="drm hosp"><div class="drmBg" style="background-image:url(${R7.A('room_hospital')})"></div>
    <div class="kick">🏥 ${CHARS[id].n.toUpperCase()}\'S TREATMENT</div><div class="big" style="font-size:28px">💊 ${h.got} / ${h.need} MEDICINE</div>
    <div class="r7bar big"><i style="width:${h.got / h.need * 100}%"></i></div>
    <div class="drmTimer">⏳ Time left: <b>${R7.fmtLeft(R7.hospLeft(id))}</b></div>
    <div class="ilGrid">
      <button class="ilB" id="ilPlay"><img src="${R7.A('u_trophyheart')}"><b>Win levels</b><small>each win = 1 medicine</small></button>
      <button class="ilB ad" id="ilAd" ${adN >= 3 ? 'disabled' : ''}><img src="${R7.A('u_dawa')}"><b>📺 1 medicine</b><small>${3 - adN}/3 left today</small></button>
      <button class="ilB" id="ilGem"><img src="${R7.A('u_inject')}"><b>💎 12</b><small>1 medicine now</small></button>
      <button class="ilB ad" id="ilTime" ${tm ? 'disabled' : ''}><img src="${R7.A('u_timer')}"><b>📺 +12 hours</b><small>${tm ? 'again tomorrow' : 'more time'}</small></button>
    </div></div>`);
  const rf = () => R7.ilaaj(id);
  $('ilPlay').onclick = () => { $('meta').classList.add('hide'); showMap(); };
  $('ilAd').onclick = () => showAd(() => { const o = sv.dawaAd[id] = sv.dawaAd[id] && sv.dawaAd[id].d === t ? sv.dawaAd[id] : { d: t, n: 0 }; o.n++; R7.giveDawa1(id); rf(); });
  $('ilGem').onclick = () => { if (SAVE.gems < 12) return toast('Not enough 💎'); SAVE.gems -= 12; R7.giveDawa1(id); rf(); };
  $('ilTime').onclick = () => showAd(() => { sv.timeAd[id] = t; h.t0 += DAY / 2; save(); toast('⏳ +12 hours added'); rf(); });
};
R7.giveDawa1 = function (id) { const sv = SV(), h = sv.hosp[id]; if (!h) return; h.got++; sfx.power(); if (h.got >= h.need) { delete sv.hosp[id]; sv.bim[id] = 30; save(); $('meta').classList.add('hide'); R7.drama('home', id); } else save(); };

/* ---------- 7. YAMLOK ---------- */
Object.assign(BOSSES, {
  yamdoot: { name: 'YAMDOOT MOSQUITO', emoji: '😈', tier: 'pro', hp: 60, sp: 340, col: '#2a1a5a', summon: 'helmet', moves: ['dash', 'guards'], taunt: 'Nobody returns from Yamlok!' },
  chitragupt: { name: 'CHITRAGUPT MOSQUITO', emoji: '📖', tier: 'pro', hp: 70, sp: 320, col: '#2a2466', summon: 'tez', moves: ['dash', 'books', 'teleport'], taunt: 'I have written down every bite you missed!' },
  yamraj: { name: 'YAMRAJ MOSQUITO', emoji: '👹', tier: 'expert', hp: 110, sp: 360, col: '#1f0e52', summon: 'ninja', moves: ['dash', 'teleport', 'guards', 'drain'], taunt: 'Want the soul back? Beat me first!' }
});
R7.YAM = (function () {
  const tasks = ['survive', 'kill', 'air', 'nobite', 'boss', 'dark', 'combo', 'hunt', 'waves', 'boss', 'powercut', 'multi', 'timeattack', 'jugnu', 'boss'], bosses = ['yamdoot', 'chitragupt', 'yamraj'];
  let bi = 0;
  return tasks.map((task, i) => { const base = LEVELS.find(l => l.task === task && l.w >= 3) || LEVELS[60 + i]; const L = Object.assign({}, base, { n: 900 + i + 1, yamI: i, diff: (base.diff || 1.6) * 1.18, story: 'A night in Yamlok… save the soul!' }); if (task === 'boss') { L.boss = bosses[bi++]; L.tier = BOSSES[L.boss].tier; } return L; });
})();
R7.yamlok = function (id) {
  const d = SV().dead[id]; if (!d) return renderMap();
  const t = R7.today(), L = R7.YAM[Math.min(14, d.lv)], ja = SV().jaanAd[id] === t;
  META.panel(`<div class="drm dead yam"><div class="drmBg" style="background-image:url(${R7.A('room_yamlok')})"></div>
    <div class="drmPic small"><span class="drmGhost">${R7.face(id) ? `<img src="${R7.A(R7.face(id))}">` : CHARS[id].e}<img class="drmHalo" src="${R7.A('u_halo')}"></span></div>
    <div class="kick">👹 YAMLOK · LEVEL ${d.lv + 1} / 15</div><div class="big" style="font-size:26px">BRING ${CHARS[id].n.toUpperCase()} BACK</div>
    <div class="r7bar big jaan"><i style="width:${d.jaan}%"></i><span>💙 ${Math.round(d.jaan)}%</span></div>
    <div class="sub">Each win <b>+8%</b> · each loss <b>-5%</b> · 100% = ${CHARS[id].n} returns!</div>
    <div class="yamNext">${L.boss ? `${R7.img('b_' + L.boss)}<div><b>BOSS: ${BOSSES[L.boss].name}</b><small>"${BOSSES[L.boss].taunt}"</small></div>` : `<span>${TASKS[L.task].icon}</span><div><b>${TASKS[L.task].name}</b><small>${goalText(L)}</small></div>`}</div>
    <div class="row" style="gap:8px;justify-content:center"><button class="adbtn" id="yamAd" ${ja ? 'disabled' : ''}>📺 +10% SOUL<small>${ja ? 'again tomorrow' : 'once a day'}</small></button></div>
    <button class="btn pulse" id="yamGo" style="margin-top:10px">👹 FIGHT IN YAMLOK ▶</button></div>`);
  $('yamGo').onclick = () => RISHTE.gate(() => { $('meta').classList.add('hide'); const L2 = Object.assign({}, L, { yam: id }); hideAll(); CL = L2; startLevel(L2, {}); uiPlaying(true); });
  $('yamAd').onclick = () => showAd(() => { SV().jaanAd[id] = t; R7.jaan(id, 10); R7.yamlok(id); });
};
R7.jaan = function (id, v) {
  const sv = SV(), d = sv.dead[id]; if (!d) return;
  d.jaan = clamp(d.jaan + v, 0, 100); save();
  if (d.jaan >= 100) { delete sv.dead[id]; sv.bim[id] = 20; SAVE.gems += 30; save(); META.modal(`<div class="drm home"><div class="drmPic"><img src="${R7.A(R7.subah(id))}"></div><div class="kick">💙 SOUL METER 100%</div><div class="big" style="font-size:30px">${CHARS[id].n.toUpperCase()} IS BACK!</div><div class="sub">Even Yamraj lost. You are a true hero! 🦸</div><div class="chip">💎 +30 gems · 👑 Yamraj Slayer badge</div></div>`, 'GO HOME 🏠', () => showMap()); sfx.clear(); }
};
(function () {
  const _sw = window.showWin;
  window.showWin = function (st, objs) {
    if (CL && CL.yam) {
      const id = CL.yam, d = SV().dead[id]; G.cine = null; SAVE.coins += G.coins + 40; save();
      if (d) { d.lv = Math.min(14, d.lv + 1); const add = 8 + (st - 1) * 1; R7.jaan(id, add); if (SV().dead[id]) { state = 'win'; META.modal(`<div class="drm dead yam"><div class="drmBg" style="background-image:url(${R7.A('room_yamlok')})"></div><div class="kick">👹 YAMLOK LEVEL CLEARED</div><div class="big" style="font-size:28px">SOUL +${add}%</div><div class="r7bar big jaan"><i style="width:${d.jaan}%"></i><span>💙 ${Math.round(d.jaan)}%</span></div><div class="sub">${CHARS[id].n} is closer to coming back 💙</div></div>`, 'NEXT YAMLOK LEVEL ▶', () => R7.yamlok(id)); sfx.clear(); } }
      return;
    }
    _sw.apply(this, arguments);
  };
  const _so = window.showOver;
  window.showOver = function (kind, title, msg) {
    if (CL && CL.yam) R7.jaan(CL.yam, -5);
    return _so.apply(this, arguments);
  };
})();

/* ---------- 8. FARMAISH DIARY screen ---------- */
R7.diary = function (sel) {
  const sv = SV(), ids = R7.DIL.concat(PUBLIC_IDS.filter(i => i !== 'tommy'));
  sel = sel || (R7.pend()[0] && R7.pend()[0].id) || RISHTE.cid(0);
  const cat = R7.cat(sel), done = sv.dem.done[sel] || {}, pend = R7.pend(sel), got = cat.filter(c => done[c[0]]).length;
  const chips = ids.map(i => { const p = R7.pend(i).length; return `<button class="dChip ${i === sel ? 'on' : ''} ${CHARS[i].dil ? 'dil' : ''}" data-dc="${i}">${R7.av(i, 'sm')}<b>${CHARS[i].n}</b>${p ? `<i>${p}</i>` : ''}</button>`; }).join('');
  const pcards = pend.map(d => { const inf = R7.dInfo(d.k), left = d.until ? Math.max(0, d.until - Date.now()) : 0; return `<div class="dPend ${d.urg ? 'urg' : ''}"><img src="${R7.A(inf.img)}"><div class="dpT"><b>${inf.n}</b><small>${inf.line}</small>${d.urg ? `<em>⚡ ${R7.fmtLeft(left)} left · +3 💎</em>` : ''}</div>
    ${inf.task ? '<span class="dTask">🎯 do it in a level</span>' : `<div class="dpB"><button class="buy" data-pay="${d.uid}">${d.c ? coinH(d.c) : ''}${d.g ? `${d.c ? ' + ' : ''}💎 ${d.g}` : ''}</button>${d.half ? '' : `<button class="dAd" data-pad="${d.uid}">📺 half price</button>`}</div>`}</div>`; }).join('');
  const grid = cat.map(c => { const n = done[c[0]] || 0, t = R7.tier(n), inf = R7.dInfo(c[0]); return `<div class="dCell ${n ? 'lit' : ''}" style="--tc:${t ? t[2] : 'rgba(255,255,255,.15)'}"><img src="${R7.A(inf.img)}"><small>${inf.n}</small>${n ? `<i>×${n}</i>` : ''}${t ? `<em>${t[1]}</em>` : ''}</div>`; }).join('');
  META.panel(`<div class="kick">BITES BRING REQUESTS · FULFIL THEM TO GROW THE BOND</div><div class="big" style="font-size:30px">📜 REQUEST DIARY</div>
    <div class="dChips">${chips}</div>
    <div class="dHead">${R7.av(sel, 'lg')}<div><b>${CHARS[sel].n}</b><small>${got}/${cat.length} requests done ${sv.titles[sel] ? `· 🏆 ${R7.TITLE(sel)}` : ''}</small><div class="r7bar"><i style="width:${got / cat.length * 100}%"></i></div></div></div>
    ${pend.length ? `<div class="sect">CURRENT REQUESTS</div>${pcards}` : '<div class="sub" style="opacity:.75">No requests right now. Bites will bring some 😉</div>'}
    <div class="sect">ALL REQUESTS ${sv.titles[sel] ? '' : `· finish all = <b>${R7.TITLE(sel)}</b>`}</div><div class="dGrid">${grid}</div>`);
  document.querySelectorAll('[data-dc]').forEach(b => b.onclick = () => { sfx.coin(); R7.diary(b.dataset.dc); });
  document.querySelectorAll('[data-pay]').forEach(b => b.onclick = () => { const d = sv.dem.pend.find(x => x.uid === b.dataset.pay); if (d) R7.payDemand(d); });
  document.querySelectorAll('[data-pad]').forEach(b => b.onclick = () => { const d = sv.dem.pend.find(x => x.uid === b.dataset.pad); if (d) R7.payDemand(d, 'ad'); });
};

/* ---------- 9. MAP: rishton ki line + Dil ke Rishte (alag chamakti line) ---------- */
R7.charCard = function (id, big) {
  const st = R7.status(id), sel = RISHTE.cid(Math.min(4, Math.floor(((SAVE.unlocked || 1) - 1) / 15))) === id && st === 'ok', p = R7.rp(id), bm = R7.bim(id), pd = R7.pend(id).length;
  const badge = st === 'hosp' ? `<em class="hs">🏥 ${R7.fmtLeft(R7.hospLeft(id)).split(' ').slice(0, 2).join(' ')}</em>` : st === 'dead' ? '<em class="dd">👻 spirit</em>' : pd ? `<em class="pd">📜 ${pd}</em>` : '';
  return `<button class="rsC ${big ? 'big' : ''} ${sel ? 'sel' : ''} ${st}" data-rs="${id}">${R7.ring(p, R7.av(id))}${badge}<b>${CHARS[id].n}</b><small>💞 ${R7.rpTxt(p)}</small><span class="bimB ${bm > 70 ? 'hi' : ''}" title="Sickness"><i style="width:${bm}%"></i></span></button>`;
};
R7.strip = function () {
  const pd = R7.pend().length;
  return `<div class="rsStrip"><div class="rsHead"><b>💞 WHO WILL YOU PROTECT?</b><button class="rsDiary" id="r7Diary">📜 Requests${pd ? `<i>${pd}</i>` : ''}</button></div>
    <div class="rsRow">${PUBLIC_IDS.filter(i => i !== 'tommy').map(i => R7.charCard(i)).join('')}</div>
    <div class="rsDil"><div class="rsDilH"><span class="fl">🔥</span><div><b>HEART BONDS</b><small>hardest · biggest rewards</small></div><span class="hard">HARD</span></div>
    <div class="rsRow">${R7.DIL.map(i => R7.charCard(i, 1)).join('')}</div></div></div>`;
};
R7.pickChar = function (id, after) {
  const st = R7.status(id);
  if (st === 'hosp') return R7.ilaaj(id);
  if (st === 'dead') return R7.yamlok(id);
  SAVE.curChar = id; save(); sfx.power(); vib(15);
  if (CHARS[id].dil) toast(`🔥 ${CHARS[id].n}: HARD mode! Take a booster 😉`);
  after ? after() : renderMap();
};
(function () {
  const _hub = META.hub; META.hub = function () { return R7.strip() + _hub.call(this); };
  const _bh = META.bindHub; META.bindHub = function () {
    _bh.call(this);
    document.querySelectorAll('[data-rs]').forEach(b => b.onclick = () => R7.pickChar(b.dataset.rs));
    const dz = $('r7Diary'); if (dz) dz.onclick = () => { sfx.coin(); R7.diary(); };
  };
  const _om = META.onMap; META.onMap = function () { R7.bimDecay(); R7.checkDeaths(); R7.demandTick(); _om.apply(this, arguments); setTimeout(R7.showCards, 900); };
  // level start: pending farmaish = naraaz = jaldi jaagta hai
  const _os = META.onStart; META.onStart = function () { for (const k in R7.SENS0) SENS_MAP[k] = R7.SENS0[k]; const id = CW.cid; if (id && R7.pend(id).length) SENS_MAP[id] = (R7.SENS0[id] || 1) * 1.15; _os.apply(this, arguments); };
  const _w = window.showWin; window.showWin = function (st, objs) { _w.apply(this, arguments); if (!CL.ev && !CL.yam) { R7.afterLevel(true, st); setTimeout(() => R7.checkMs(CW.cid), 3200); } };
  const _o = window.showOver; window.showOver = function (k) { _o.apply(this, arguments); if (!CL.yam) R7.afterLevel(false, 0); };
})();

/* ---------- 10. CSS ---------- */
R7.css(`
.r7av{display:inline-flex;width:46px;height:46px;border-radius:50%;overflow:hidden;background:linear-gradient(160deg,#9a6df5,#4a1fa8);align-items:center;justify-content:center;flex:none}
.r7av img{width:100%;height:100%;object-fit:cover;object-position:50% 12%}
.r7av.em{font-size:24px}.r7av.sm{width:30px;height:30px}.r7av.lg{width:62px;height:62px;border:2px solid #fff}
.r7ring{--p:0;position:relative;display:inline-flex;padding:3px;border-radius:50%;background:conic-gradient(#fff calc(var(--p)*1%),rgba(255,255,255,.14) 0)}
.r7ring .r7av{border:2px solid #1c0a4f}
.r7bar{height:8px;border-radius:9px;background:rgba(255,255,255,.12);overflow:hidden;position:relative;margin-top:5px}
.r7bar i{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,#9a6df5,#fff);transition:width 1s cubic-bezier(.2,1,.3,1)}
.r7bar.big{height:16px;max-width:300px;margin:10px auto}.r7bar.jaan i{background:linear-gradient(90deg,#3a8dff,rgb(127,212,255),#fff)}
.r7bar span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:800 11px Poppins;color:#1c0a4f}
.rsStrip{margin:4px 0 14px}
.rsHead{display:flex;align-items:center;justify-content:space-between;margin:0 2px 6px}
.rsHead b{font:800 11px Poppins;letter-spacing:1.5px;color:#d9ccff}
.rsDiary{position:relative;border:0;border-radius:999px;padding:7px 12px;background:linear-gradient(180deg,#fff,#e5dcff);color:#4a1fa8;font:800 12px Poppins;box-shadow:0 4px 14px rgba(116,58,232,.5)}
.rsDiary i{position:absolute;top:-6px;right:-4px;background:#ff3d6e;color:#fff;font-style:normal;font-size:10px;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;border:2px solid #fff}
.rsRow{display:flex;gap:8px;overflow-x:auto;padding:4px 2px 8px;scrollbar-width:none}.rsRow::-webkit-scrollbar{display:none}
.rsC{position:relative;flex:none;width:76px;border:1px solid rgba(255,255,255,.12);border-radius:16px;background:rgba(28,12,79,.72);padding:8px 4px 7px;display:flex;flex-direction:column;align-items:center;gap:2px;color:#fff}
.rsC b{font:800 11px Poppins;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;margin-top:3px}
.rsC small{font:700 10px Poppins;color:#c7b0ff}
.rsC.sel{background:linear-gradient(170deg,#9a6df5,#4a1fa8);border-color:#fff;box-shadow:0 0 0 2px rgba(255,255,255,.5),0 6px 20px rgba(116,58,232,.6)}
.rsC.sel small{color:#fff}
.rsC em{position:absolute;top:4px;right:3px;font:800 9px Poppins;font-style:normal;border-radius:8px;padding:2px 5px;background:#ff3d6e;color:#fff}
.rsC em.hs{background:#3a8dff}.rsC em.dd{background:#2a1a5a;border:1px solid #c7b0ff}
.rsC.hosp .r7av img{filter:grayscale(.6) brightness(.8)}.rsC.dead .r7av img{filter:grayscale(1) brightness(1.4);opacity:.6}
.bimB{width:46px;height:4px;border-radius:3px;background:rgba(255,255,255,.12);overflow:hidden;margin-top:2px}.bimB i{display:block;height:100%;background:linear-gradient(90deg,#9a6df5,#ff6b8a)}.bimB.hi i{background:#ff3d6e;animation:rwBlink .8s infinite}
.rsDil{margin-top:4px;border-radius:20px;padding:10px 8px 4px;background:linear-gradient(135deg,rgba(255,61,110,.22),rgba(116,58,232,.35));border:1.5px solid rgba(255,140,170,.55);box-shadow:0 0 24px rgba(255,61,110,.25),inset 0 0 30px rgba(255,255,255,.04);position:relative;overflow:hidden}
.rsDil:before{content:'';position:absolute;inset:-50%;background:linear-gradient(115deg,transparent 45%,rgba(255,255,255,.12) 50%,transparent 55%);animation:dilSweep 3.5s infinite}
.rsDilH{display:flex;align-items:center;gap:8px;margin:0 4px 4px;position:relative}
.rsDilH .fl{font-size:22px;animation:rwBob 1s infinite}.rsDilH b{display:block;font:900 15px Poppins;letter-spacing:1px}.rsDilH small{font:600 10px Poppins;color:#ffd0dc}
.rsDilH .hard{margin-left:auto;background:#ff3d6e;color:#fff;font:900 10px Poppins;letter-spacing:2px;padding:4px 9px;border-radius:8px;box-shadow:0 0 12px rgba(255,61,110,.8)}
.rsC.big{width:84px;background:rgba(40,8,50,.6);border-color:rgba(255,140,170,.35)}
.rsC.big .r7av{width:56px;height:56px}
.rsC.big.sel{background:linear-gradient(170deg,#ff6b8a,#743ae8)}
@keyframes dilSweep{to{transform:translateX(60%)}}
/* drama */
.drm{position:relative;text-align:center;padding-top:4px}
.drmBg{position:absolute;inset:-22px -18px auto;height:230px;background-size:cover;background-position:center 60%;opacity:.35;mask:linear-gradient(#000 40%,transparent);-webkit-mask:linear-gradient(#000 40%,transparent);border-radius:24px 24px 0 0}
.drmPic{position:relative;height:170px;display:flex;align-items:flex-end;justify-content:center;margin-bottom:6px}.drmPic.small{height:120px}
.drmPic img{max-height:100%;max-width:100%;object-fit:contain;filter:drop-shadow(0 10px 20px rgba(0,0,0,.5))}
.drm.home .drmPic img{animation:rwBob 2s infinite}
.drmGhost{position:absolute;right:8%;bottom:30px;width:86px;height:86px;border-radius:50%;overflow:hidden;opacity:.7;filter:grayscale(.8) brightness(1.5) drop-shadow(0 0 16px #c7b0ff);animation:ghostF 3s ease-in-out infinite;font-size:50px;display:flex;align-items:center;justify-content:center;overflow:visible}
.drmPic.small .drmGhost{position:relative;right:auto;bottom:auto}
.drmGhost>img:first-child{width:86px;height:86px;border-radius:50%;object-fit:cover;object-position:50% 12%}
.drmGhost .drmHalo{position:absolute;top:-34px;left:50%;width:60px;transform:translateX(-50%);filter:none}
@keyframes ghostF{50%{transform:translateY(-10px)}}
.drmTimer{margin:10px auto;padding:8px 12px;border-radius:12px;background:rgba(58,141,255,.18);border:1px solid rgba(127,212,255,.5);font:700 13px Poppins;max-width:320px}
.drmHow{display:grid;gap:6px;margin-top:8px;font:600 12px Poppins}.drmHow div{background:rgba(255,255,255,.07);border-radius:10px;padding:7px}
.ilGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.ilB{border:1px solid rgba(255,255,255,.18);border-radius:16px;background:rgba(255,255,255,.08);color:#fff;padding:10px 6px;display:flex;flex-direction:column;align-items:center;gap:2px}
.ilB img{width:46px;height:46px;object-fit:contain}.ilB b{font:800 13px Poppins}.ilB small{font:600 10px Poppins;opacity:.75}
.ilB.ad{background:linear-gradient(170deg,rgba(127,212,255,.25),rgba(116,58,232,.35));border-color:rgba(127,212,255,.6)}
.ilB:disabled{opacity:.4}
.yamNext{display:flex;gap:10px;align-items:center;text-align:left;background:rgba(0,0,0,.25);border-radius:14px;padding:8px 10px;margin:8px 0}
.yamNext img{width:54px;height:54px;object-fit:contain}.yamNext span{font-size:34px}.yamNext b{display:block;font:800 13px Poppins}.yamNext small{font:600 11px Poppins;opacity:.8}
/* diary */
.dChips{display:flex;gap:6px;overflow-x:auto;padding:8px 0 6px;scrollbar-width:none}.dChips::-webkit-scrollbar{display:none}
.dChip{position:relative;flex:none;display:flex;align-items:center;gap:6px;border-radius:999px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);color:#fff;padding:3px 10px 3px 3px;font:700 11px Poppins}
.dChip.on{background:#fff;color:#4a1fa8}.dChip.dil{border-color:rgba(255,140,170,.6)}
.dChip i{font-style:normal;background:#ff3d6e;color:#fff;border-radius:8px;font-size:10px;padding:1px 6px}
.dHead{display:flex;gap:12px;align-items:center;text-align:left;margin:6px 0 4px}.dHead>div{flex:1}.dHead b{font:900 18px Poppins}.dHead small{display:block;font:600 11px Poppins;opacity:.8}
.dPend{display:flex;gap:10px;align-items:center;text-align:left;background:linear-gradient(135deg,rgba(255,255,255,.12),rgba(255,255,255,.04));border:1px solid rgba(255,255,255,.18);border-radius:16px;padding:8px;margin-bottom:8px}
.dPend.urg{border-color:rgb(127,212,255);box-shadow:0 0 18px rgba(127,212,255,.3)}
.dPend img{width:54px;height:54px;object-fit:contain;flex:none}.dpT{flex:1;min-width:0}.dpT b{display:block;font:800 13px Poppins}.dpT small{display:block;font:600 11px Poppins;opacity:.8}.dpT em{display:block;font:700 10px Poppins;color:rgb(127,212,255);font-style:normal;margin-top:2px}
.dpB{display:flex;flex-direction:column;gap:4px;align-items:stretch}.dpB .buy{width:auto;padding:8px 10px;font-size:12px}
.dAd{border:0;border-radius:10px;background:rgba(127,212,255,.2);color:#fff;font:700 10px Poppins;padding:5px 6px}
.dTask{font:700 11px Poppins;color:#c7b0ff}
.dGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.dCell{position:relative;border-radius:14px;background:rgba(255,255,255,.05);border:2px solid var(--tc);padding:6px 2px 5px;display:flex;flex-direction:column;align-items:center}
.dCell img{width:44px;height:44px;object-fit:contain;filter:grayscale(1) brightness(.5);opacity:.45}.dCell.lit img{filter:none;opacity:1}
.dCell small{font:600 9px/1.1 Poppins;opacity:.7;text-align:center;margin-top:2px}.dCell.lit small{opacity:1}
.dCell i{position:absolute;top:-7px;right:-5px;font:900 10px Poppins;font-style:normal;background:#fff;color:#4a1fa8;border-radius:8px;padding:1px 5px;box-shadow:0 2px 6px rgba(0,0,0,.3)}
.dCell em{font:800 8px Poppins;font-style:normal;color:var(--tc);letter-spacing:1px;text-transform:uppercase}
`);
/* Yamlok mein ghar ka saaman (glass, alarm, phone) nahi */
(function () { const _fl = HZ.forLevel.bind(HZ); HZ.forLevel = function (L) { return L && L.yam ? [] : _fl(L); }; const _hd = HZ.draw.bind(HZ); HZ.draw = function (t) { if (theme === 'yamlok') return; return _hd(t); }; })();
(function () { const _sl = window.startLevel; window.startLevel = function (n) { _sl.apply(this, arguments); if (CL && CL.yam) { FEED.q = []; FEED.add(`👹 Yamlok ${CL.yamI + 1}/15`); } }; })();
R7.css(`#metaBody .btn{display:block;width:100%!important;max-width:100%!important;box-sizing:border-box;padding:15px 10px!important;font-size:18px!important;white-space:nowrap;margin-left:0!important;margin-right:0!important}`);
/* ---------- Bistar thoda bada: kirdaar aaram se, aas paas jagah ---------- */
(function () {
  const _lb = window.layoutBed;
  window.layoutBed = function () {
    _lb.apply(this, arguments);
    if (CL && CL.task === 'multi') return;
    const k = 1.1, bw = Math.min(W * 0.8, bed.w * k), bsc = bed.sc * bw / bed.w;
    bed.w = bw; bed.sc = bsc; bed.u = S * bsc; bed.x = W / 2 - 0.51 * bw;
  };
})();
/* ---------- Purane kirdaar bhi nayi poori lambi tasveer mein (gussa aane pe purana chehra wala roop) ---------- */
(function () {
  const NF = { papa: 'papa_full', mummy: 'mummy_full', dadi: 'dadi_full', nani: 'dadi_full', dada: 'dada_full', nana: 'dada_full', bachcha: 'bachcha_full', dost: 'dost_full', dulha: 'dulha_full', raja: 'raja_full' };
  R7.NF = NF;
  const _dp = window.drawPerson;
  window.drawPerson = function (s, time) {
    const id = s.cid || s.kind, nk = NF[id], im = nk && ART.i[nk];
    const ang = s.neend < 22 || (G.cine && G.cine.type === 'wake'), cold = HZ.on && HZ.on.kambal && HZ.o.kambal && HZ.o.kambal.st === 'off';
    const gk = R7.OLDG[id], gi = gk && ART.i[gk];
    if (ang && gi && gi.width && !s.walk && !cold && ART.ok && !(CL && CL.yam === id)) { const multi = G.sleepers.length > 1, h = bed.w * (multi ? 0.42 : 0.52), w = h * gi.width / gi.height, x0 = s.x + 6 * S - 0.1 * w, y0 = bed.y + 14 * S - h, wig = s.wig > 0 ? Math.sin(time * 50) * 2.5 * S * Math.min(1, s.wig) : 0; ctx.drawImage(gi, x0 + wig, y0, w, h); return; }
    if (!im || !im.width || !ART.ok || s.walk || ang || cold || R7.outfitOn(id) || (CL && CL.yam === id)) return _dp.apply(this, arguments);
    const multi = G.sleepers.length > 1, seg = Math.max(60 * S, s.end - s.x), w = multi ? seg * 1.15 : bed.w * 1.0, h = im.height * w / im.width;
    const x0 = s.x + 6 * S - 0.1 * w, y0 = bed.y + 12 * S - h, br = Math.sin(time * 1.9 + s.x) * 0.012, wig = s.wig > 0 ? Math.sin(time * 50) * 2.5 * S * Math.min(1, s.wig) : 0;
    ctx.save(); ctx.translate(wig, 0); ctx.translate(x0 + w / 2, y0 + h); ctx.scale(1, 1 + br); ctx.translate(-(x0 + w / 2), -(y0 + h)); ctx.drawImage(im, x0, y0, w, h); ctx.restore();
    if (s.bitten > 0) { ctx.save(); ctx.globalAlpha = Math.min(0.5, s.bitten) * (0.6 + Math.sin(time * 18) * 0.4); ctx.fillStyle = '#ff5a7a'; ctx.beginPath(); ctx.arc(x0 + w * 0.14, y0 + h * 0.3, 9 * S, 0, 7); ctx.fill(); ctx.restore(); }
    if (typeof drawSleepZ === 'function') { try { drawSleepZ(s, S * s.sc, time); } catch (e) { } }
  };
})();

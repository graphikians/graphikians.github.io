/* ================= MACHHAR MAARO — RISHTE · SUBAH · KAMRA · HEARTS · EVENTS ================= */
const CHARS = {
  papa: { n: 'Papa', e: '👨', look: 'papa', q: 'snore', qd: 'Loud snoring pulls mosquitoes in (mosquitoes 10% faster)', woke: 'PAPA WOKE UP!', shout: 'WHO IS IT?!|TURN OFF THE LIGHT!', morn: ['Son, I slept so well tonight… thank you ❤️', 'Wow! Full energy at the office today 💪', 'Mosquitoes? What mosquitoes? 😄 Great sleep!'] },
  mummy: { n: 'Mummy', e: '👩', look: 'mummy', q: 'light', qd: 'Lightest sleeper. Zap noise counts 2X', woke: 'MUMMY WOKE UP!', shout: 'WHO IS IT?!|LET ME SLEEP!', morn: ['My sweetheart… I did not wake up once 🥰', 'I am making your favourite breakfast today! ❤️', 'Such peaceful sleep… thank you dear'] },
  dada: { n: 'Grandpa', e: '👴', look: 'dada', q: 'deaf', qd: 'Hearing aid is out, so noise does not matter. Soft skin though (bites 15% worse)', woke: 'GRANDPA WOKE UP!', shout: 'WHO IS THERE!|WHERE IS MY STICK?!', morn: ['Bless you! Even my knees feel better today 😄', 'I have not slept like this since I was young! 👴❤️', 'Well done! You are my soldier'] },
  dadi: { n: 'Grandma', e: '👵', look: 'dadi', q: 'early', qd: 'Wakes at 4 AM, so mosquitoes come in faster', woke: 'GRANDMA WOKE UP!', shout: 'OH MY GOD!|WHO IS IT?!', morn: ['God bless you, dear 🙏', 'I slept a full 8 hours! Want some sweets? 🍬', 'My darling… you chased every mosquito away ❤️'] },
  bhai: { n: 'Brother', e: '👦', look: 'bhai', q: 'phone', qd: 'Fell asleep holding his phone. The screen light attracts mosquitoes', woke: 'BROTHER WOKE UP!', shout: 'HEY!|WHERE IS MY PHONE?!', morn: ['Bro… thanks, you are a legend 🤜🤛', 'Sleep score 10/10! Pizza is on me 🍕', 'Last night sleep beat the game 😂'] },
  behen: { n: 'Sister', e: '👧', look: 'behen', q: 'facepack', qd: 'Face pack on. Face is safe, but arm and leg bites are 30% worse', woke: 'SISTER WOKE UP!', shout: 'MUMMYYY!|WHO IS IT?!', morn: ['Thank you! Look at my glow ✨', 'Face pack + full sleep = superstar 😎', 'Chocolate from me today! 🍫'] },
  bachcha: { n: 'Kid', e: '🧒', look: 'bachcha', q: 'kicker', qd: 'Kicks the blanket off and keeps rolling over', woke: 'THE KID WOKE UP!', shout: 'WAAAAH!|MUMMAAA!', morn: ['My superhero! 🦸 Are the mosquitoes gone?', 'I dreamt about a unicorn! 🦄', 'One more story tonight, please! ❤️'] },
  husband: { n: 'Husband', e: '🤵', look: 'husband', q: 'tosser', qd: 'Deep sleeper, but keeps rolling over', woke: 'HUSBAND WOKE UP!', shout: 'WHAT HAPPENED?!|LET ME SLEEP!', morn: ['Good morning ☕ I will make the tea today', 'Such good sleep… you are the best ❤️', 'Shopping today for sure! Your choice 😄'] },
  wife: { n: 'Wife', e: '👩‍🍼', look: 'wife', q: 'baby', qd: 'Sleeps next to the baby. Protect both', woke: 'WIFE WOKE UP!', shout: 'YOU WILL WAKE THE BABY!|QUIET!', morn: ['The baby slept all night too… thank you ❤️', 'For the first time we both slept peacefully 🥰', 'What would I do without you… ☕ tea is ready'] },
  dost: { n: 'Buddy', e: '🧑', look: 'dost', q: 'none', qd: 'Hostel roommate. Exam tomorrow', woke: 'BUDDY WOKE UP!', shout: 'DUDE!|LET ME SLEEP!', morn: ['Bro, without you I would have failed 😂 thanks!', 'Full sleep, full marks 💯', 'Canteen tea is on me! ☕'] },
  tommy: { n: 'Tommy', e: '🐶', look: 'dog', q: 'dog', qd: 'Barks when bitten. Bites count 30% more', woke: 'TOMMY WOKE UP!', shout: 'WOOF WOOF!|GRRRR!', morn: ['*wags tail* 🐶💜', '*licks your face* 😂', 'Woof! (Means: thank you, friend)'] },
  dulha: { n: 'Groom', e: '🤵', look: 'dulha', q: 'none', qd: 'Wedding tomorrow. Tonight sleep matters most', woke: 'THE GROOM WOKE UP!', shout: 'COME ON!|MY WEDDING IS TOMORROW!', morn: ['Wedding day and I feel super fresh! 😎', 'My wedding photos will glow ✨', 'You are my best man! 🤝'] },
  raja: { n: 'The King', e: '🤴', look: 'raja', q: 'none', qd: 'King of the palace. The most royal sleep', woke: 'THE KING WOKE UP!', shout: 'GUARDS!|WHAT IS GOING ON?!', morn: ['Well done, soldier! Reward him 👑', 'Such sleep… I declare a holiday for the kingdom! 🎉', 'You are my general!'] },
  gf: { n: 'Girlfriend', e: '💑', look: 'gf', q: 'phone', secret: 1, qd: 'Fell asleep on a video call', woke: 'GIRLFRIEND WOKE UP!', shout: 'HELLO?!|DID THE CALL DROP?!', morn: ['Good morning ☀️ I had the sweetest dreams 😊', 'I fell asleep listening to your voice… 💜', 'Today feels special ✨'] },
  bf: { n: 'Boyfriend', e: '💙', look: 'bf', q: 'gamer', secret: 1, qd: 'Fell asleep gaming. The screen light attracts mosquitoes', woke: 'BOYFRIEND WOKE UP!', shout: 'WHAT HAPPENED?!|I WAS WINNING!', morn: ['Morning ☀️ such good sleep… did you do something? 😄', 'Full energy today! Coffee date? ☕', 'You were in my dreams too 💙'] },
  crush: { n: 'Crush', e: '💘', look: 'crush', q: 'secret', secret: 1, qd: 'They have no idea you are guarding their sleep… (noise 1.5X)', woke: 'YOUR CRUSH WOKE UP! 😳', shout: 'WHO IS IT?!|…YOU, HERE?!', morn: ['Why do I feel so fresh this morning… 🌸', 'Everything just feels good today ✨', '(They will never know… but you do 💘)'] }
};
const PUBLIC_IDS = ['papa', 'mummy', 'dada', 'dadi', 'bhai', 'behen', 'bachcha', 'husband', 'wife', 'dost', 'tommy', 'dulha', 'raja'];
const SECRET_IDS = ['gf', 'bf', 'crush'];
const LOOK = { papa: { b: 'papa' }, mummy: { b: 'mummy' }, dada: { b: 'papa', grey: 1, glasses: 1 }, dadi: { b: 'dadi' }, bhai: { b: 'bachcha' }, behen: { b: 'mummy', nobindi: 1, pony: 1, facepack: 1 }, bachcha: { b: 'bachcha' }, husband: { b: 'papa' }, wife: { b: 'mummy' }, gf: { b: 'mummy', nobindi: 1, long: 1, heart: 1 }, bf: { b: 'dost' }, crush: { b: 'bachcha', sparkle: 1 }, dost: { b: 'dost' }, dog: { b: 'dog' }, dulha: { b: 'dulha' }, raja: { b: 'raja' } };
SKIN.dog = '#a8743f'; CLOTH.dog = ['#743ae8', '#4a1fa8', 0];
const ROOM = [
  { id: 'rug', i: '🟪', n: 'New Rug', c: 2, d: 'A soft rug under the bed', story: 'Ahh, so soft under the feet! 😌' },
  { id: 'plant', i: '🪴', n: 'Plant', c: 2, d: 'A little green in the room', story: 'The room feels alive! 🌿' },
  { id: 'frame', i: '🖼️', n: 'Family Photo', c: 3, d: 'Memories on the wall', story: 'This photo brings sweet dreams 🥹' },
  { id: 'lamp', i: '💡', n: 'Night Lamp', c: 4, d: 'More light in dark levels', story: 'No more fear of the dark ✨' },
  { id: 'paint', i: '🎨', n: 'Fresh Paint', c: 5, d: 'A new purple wall', story: 'The room looks brand new! 💜' },
  { id: 'ac', i: '❄️', n: 'AC', c: 7, d: 'Cool air. Mosquitoes 5% slower', story: 'So cool! The heat can not break sleep now ❄️' },
  { id: 'net', i: '🕸️', n: 'Mosquito Net', c: 8, d: 'Face bites 15% less', story: 'Mosquitoes stand no chance now! 🛡️' },
  { id: 'royal', i: '🛏️', n: 'Royal Bed', c: 12, d: 'Royal bed, royal sleep', story: 'Sleep like a king! 👑' }
];
const EVENTS = [
  { id: 'diwali', n: 'Diwali Blast', i: '🪔', from: '2026-11-01', to: '2026-11-12', d: 'Protect sleep through the firecracker noise! Collect diyas.', cur: '🪔', ms: [[10, 'c', 300], [30, 'g', 5], [60, 'skin', 'phuljhadi'], [100, 'g', 15]] },
  { id: 'shaadi', n: 'Wedding Season', i: '💒', from: '2026-11-20', to: '2026-12-15', d: 'Put the tired wedding guests to sleep', cur: '💍' },
  { id: 'uttarayan', n: 'Kite Festival', i: '🪁', from: '2027-01-10', to: '2027-01-16', d: 'Kite flying mosquitoes from the sky!', cur: '🪁' },
  { id: 'exam', n: 'Exam Season', i: '📚', from: '2027-02-15', to: '2027-03-31', d: 'Protect the kid who fell asleep studying', cur: '📚' },
  { id: 'ipl', n: 'IPL Night', i: '🏏', from: '2027-03-26', to: '2027-05-31', d: 'Fell asleep watching the match!', cur: '🏏' },
  { id: 'monsoon', n: 'Monsoon Fest', i: '🌧️', from: '2027-07-01', to: '2027-09-15', d: 'Rain = mosquito party', cur: '☔' }
];
const dOf = s => new Date(s + 'T00:00:00');
let diaryOpen = false;

const RISHTE = {
  init() {
    const d = { curChar: null, chr: {}, starBank: 0, rooms: {}, hearts: 5, heartNext: 0, pin: null, evc: {}, evClaim: {}, skin: null, nightsTotal: 0 };
    for (const k in d) if (SAVE[k] === undefined) SAVE[k] = d[k];
    save();
  },
  cid(w) { const c = SAVE.curChar; if (c && (!CHARS[c].secret || diaryOpen)) return c; return WORLDS[w !== undefined ? w : CL.w].sleeper; },
  withChar(w) { const id = this.cid(WORLDS.indexOf(w)), c = CHARS[id]; return Object.assign({}, w, { sleeper: LOOK[c.look].b, who: c.n, woke: c.woke, shout: c.shout, cid: id }); },
  q() { return CHARS[CW.cid || 'papa'] ? CHARS[CW.cid || 'papa'].q : 'none'; },
  rec(id) { return SAVE.chr[id] = SAVE.chr[id] || { stars: {}, best: {}, nights: 0, bond: 0 }; },
  bondLv(b) { let lv = 1, need = 40; while (b >= need) { b -= need; lv++; need += 30; } return { lv, cur: b, need }; },
  room(id) { return SAVE.rooms[id] = SAVE.rooms[id] || []; },
  has(item) { return this.room(CW.cid || 'papa').includes(item); },
  /* ---------- hearts ---------- */
  hearts() { const now = Date.now(); while (SAVE.hearts < 5 && SAVE.heartNext && now >= SAVE.heartNext) { SAVE.hearts++; SAVE.heartNext = SAVE.hearts < 5 ? SAVE.heartNext + 30 * 60e3 : 0; } return SAVE.hearts; },
  heartTime() { if (SAVE.hearts >= 5 || !SAVE.heartNext) return ''; const s = Math.max(0, Math.round((SAVE.heartNext - Date.now()) / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; },
  useHeart() { this.hearts(); if (SAVE.hearts > 0) { SAVE.hearts--; if (!SAVE.heartNext) SAVE.heartNext = Date.now() + 30 * 60e3; save(); } },
  gate(cb) {
    if (this.hearts() > 0) return cb();
    META.modal(`<div class="bigrank">💔</div><div class="big" style="font-size:30px">OUT OF HEARTS</div><div class="sub">Next ❤️ in <b>${this.heartTime()}</b></div>
      <div class="row"><button class="adbtn" id="hAd">📺 +1 HEART<small>WATCH AD</small></button><button class="buy" id="hGem" style="width:auto;padding:12px 18px">💎 5 = FULL ❤️x5</button></div>`, 'LATER', () => {});
    META.x('Scarcity (Lives) → Wapas aane ki wajah');
    $('hAd').onclick = () => { $('meta').classList.add('hide'); showAd(() => { SAVE.hearts++; save(); cb(); }); };
    $('hGem').onclick = () => { if (SAVE.gems < 5) return toast('Not enough 💎'); SAVE.gems -= 5; SAVE.hearts = 5; SAVE.heartNext = 0; save(); $('meta').classList.add('hide'); cb(); };
  },
  /* ---------- PIN ---------- */
  askPin(cb) {
    if (!SAVE.pin || diaryOpen) { diaryOpen = true; return cb(); }
    META.modal(`<div class="bigrank">🔒</div><div class="big" style="font-size:28px">SECRET DIARY</div><div class="sub">Enter your 4 digit PIN</div><input id="pinIn" class="pin2" type="password" inputmode="numeric" maxlength="4" placeholder="••••">`, 'OPEN 🔓', () => {
      if ($('pinIn').value === SAVE.pin) { diaryOpen = true; sfx.chest(); cb(); } else { sfx.low(); toast('❌ Wrong PIN'); }
    });
    setTimeout(() => $('pinIn') && $('pinIn').focus(), 100);
  },
  setPin() {
    META.modal(`<div class="bigrank">🔐</div><div class="big" style="font-size:28px">${SAVE.pin ? 'CHANGE PIN' : 'SET PIN'}</div><div class="sub">Only you can open the Secret Diary. Leave it empty to remove the PIN.</div><input id="pinNew" class="pin2" type="password" inputmode="numeric" maxlength="4" placeholder="4 digit">`, 'SAVE ✔', () => {
      const v = $('pinNew').value.trim(); if (v && !/^\d{4}$/.test(v)) return toast('PIN must be 4 digits');
      SAVE.pin = v || null; save(); toast(v ? '🔐 PIN set' : 'PIN removed'); this.diary();
    });
  },
  /* ---------- screens ---------- */
  card(id, sel) {
    const c = CHARS[id], r = this.rec(id), b = this.bondLv(r.bond), st = Object.values(r.stars).reduce((a, x) => a + x, 0);
    return `<div class="chc ${sel ? 'sel' : ''}"><div class="che">${c.e}</div><b>${c.n}</b><div class="bond">${'💜'.repeat(Math.min(5, b.lv))}${'🤍'.repeat(Math.max(0, 5 - b.lv))}</div>
      <small>Bond Lv ${b.lv} · 🌙 ${r.nights} nights · ⭐ ${st}</small><p>${c.qd}</p><button class="buy ${sel ? 'eqd' : ''}" data-pick="${id}">${sel ? '✓ SELECTED' : 'SELECT'}</button></div>`;
  },
  rishte() {
    const cur = SAVE.curChar;
    META.panel(`<div class="kick">WHO WILL YOU PROTECT?</div><div class="big" style="font-size:32px">💞 BONDS</div><div class="sub">Every person keeps their own record · More nights saved = deeper bond</div>
      <button class="btn2" data-pick="" style="margin-top:10px">${cur ? '↺ Use the world default' : '✓ Using the world default'}</button>
      <div class="chgrid">${PUBLIC_IDS.map(id => this.card(id, cur === id)).join('')}</div>
      <button class="btn2" id="toDiary" style="margin-top:12px">🔒 Open Secret Diary</button>`);
    this.bindPick(); $('toDiary').onclick = () => this.askPin(() => this.diary());
    META.x('Emotional Investment (Rishte)');
  },
  diary() {
    diaryOpen = true; const cur = SAVE.curChar;
    META.panel(`<div class="kick">🔒 JUST FOR YOU</div><div class="big" style="font-size:32px">SECRET DIARY</div><div class="sub">These records never show on your profile, league or shares</div>
      <div class="chgrid">${SECRET_IDS.map(id => this.card(id, cur === id)).join('')}</div>
      <button class="btn2" id="pinBtn" style="margin-top:12px">${SAVE.pin ? '🔐 Change / remove PIN' : '🔐 Set a PIN (optional)'}</button>`);
    this.bindPick(); $('pinBtn').onclick = () => this.setPin();
    META.x('Privacy + Curiosity (Secret Diary)');
  },
  bindPick(after) {
    document.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => { SAVE.curChar = b.dataset.pick || null; save(); sfx.power(); const c = CHARS[SAVE.curChar]; toast(c ? `${c.e} Now protecting ${c.n}!` : 'World default'); $('meta').classList.add('hide'); if (state === 'intro') showIntro(CL.n); else renderMap(); });
  },
  kamra() {
    const id = this.cid(CL.w), c = CHARS[id], items = this.room(id), pct = Math.round(items.length / ROOM.length * 100);
    META.panel(`<div class="kick">${c.e} ${c.n.toUpperCase()}\'S ROOM</div><div class="big" style="font-size:32px">🏠 DECORATE</div>
      <div class="sub">⭐ ${SAVE.starBank} stars to spend · Every win earns stars</div>
      <div class="xpbar" style="max-width:340px;margin:8px auto"><i style="width:${pct}%"></i></div><div class="sub">Room ${pct}% done · ${pct >= 100 ? '🏆 Dream room complete!' : `Next: ${(ROOM.find(r => !items.includes(r.id)) || {}).n || ''}`}</div>
      <div class="mlist">${ROOM.map(r => `<div class="mrow ${items.includes(r.id) ? 'cl' : ''}"><div style="font-size:26px">${r.i}</div><div style="flex:1"><b>${r.n}</b><br><small>${r.d}</small></div>${items.includes(r.id) ? '✅' : `<button class="buy" data-room="${r.id}">⭐ ${r.c}</button>`}</div>`).join('')}</div>
      <div class="sub" style="font-size:11px;opacity:.75">This is the room of the person you are protecting. Everything shows in the level</div>`);
    document.querySelectorAll('[data-room]').forEach(b => b.onclick = () => {
      const r = ROOM.find(x => x.id === b.dataset.room); if (SAVE.starBank < r.c) { sfx.low(); return toast(`Need ⭐ ${r.c - SAVE.starBank} more. Win levels!`); }
      SAVE.starBank -= r.c; items.push(r.id); save(); sfx.chest(); vib([30, 30, 60]);
      META.modal(`<div class="bigrank">${r.i}</div><div class="big" style="font-size:30px">${r.n} ADDED!</div><div class="speech">${c.e} "${r.story}"</div>`, 'DECORATE MORE ▶', () => this.kamra());
      META.x('IKEA Effect (Khud banaya = zyada pyaar)');
    });
    META.x('Long-term Goal (Kamra Sajao)');
  },
  activeEvent() { const now = new Date(); return EVENTS.find(e => now >= dOf(e.from) && now <= new Date(dOf(e.to).getTime() + 864e5)); },
  events() {
    const now = new Date(), act = this.activeEvent(), wk = META.weekend();
    const evc = act ? (SAVE.evc[act.id] || 0) : 0;
    META.panel(`<div class="kick">REAL WORLD DATES</div><div class="big" style="font-size:32px">📅 EVENTS</div>
      ${act ? `<div class="evcard"><div class="evi">${act.i}</div><div><b>${act.n}</b> <span class="live">● LIVE</span><p>${act.d}</p><p>Ends: ${dOf(act.to).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · Your ${act.cur}: <b>${evc}</b></p></div></div>
        ${act.ms ? `<div class="msroad">${act.ms.map((m, i) => { const done = evc >= m[0], cl = SAVE.evClaim[act.id + i]; return `<div class="ms ${done ? 'done' : ''}"><small>${m[0]} ${act.cur}</small><b>${m[1] === 'c' ? '🪙 ' + m[2] : m[1] === 'g' ? '💎 ' + m[2] : '✨ Sparkler Racket'}</b>${done && !cl ? `<button class="buy" data-ms="${i}">CLAIM</button>` : cl ? '✅' : '🔒'}</div>`; }).join('')}</div>` : ''}
        <button class="btn pulse" id="evPlay">${act.i} PLAY EVENT LEVEL</button>` : '<div class="sub">No big event is live right now</div>'}
      <div class="evcard" style="margin-top:10px"><div class="evi">👑</div><div><b>Weekend Boss Rush</b> ${wk ? '<span class="live">● LIVE</span>' : ''}<p>Every Saturday and Sunday: random boss, 2X coins</p></div>${wk ? '<button class="buy" id="bossRush" style="width:auto">PLAY</button>' : ''}</div>
      <div class="sect">UPCOMING EVENTS</div>
      <div class="mlist">${EVENTS.filter(e => dOf(e.from) > now).map(e => { const dd = Math.ceil((dOf(e.from) - now) / 864e5); return `<div class="mrow"><div style="font-size:26px">${e.i}</div><div style="flex:1"><b>${e.n}</b><br><small>${e.d}</small></div><small>in ${dd} days</small></div>`; }).join('')}</div>`);
    const ep = $('evPlay'); if (ep) ep.onclick = () => { $('meta').classList.add('hide'); this.startEvent(act.id); };
    const br = $('bossRush'); if (br) br.onclick = () => { $('meta').classList.add('hide'); this.startEvent('bossrush'); };
    document.querySelectorAll('[data-ms]').forEach(b => b.onclick = () => { const i = +b.dataset.ms, m = act.ms[i]; SAVE.evClaim[act.id + i] = 1; if (m[1] === 'c') SAVE.coins += m[2]; else if (m[1] === 'g') SAVE.gems += m[2]; else SAVE.skin = m[2]; save(); sfx.chest(); toast('🎁 Event reward claimed!'); this.events(); });
    META.x('Genuine Urgency (Asli Event)');
  },
  startEvent(id) {
    this.gate(() => {
      const base = LEVELS[clamp(SAVE.unlocked, 1, 300) - 1];
      let L;
      if (id === 'bossrush') { const bl = LEVELS.filter(l => l.boss && l.n <= Math.max(5, SAVE.unlocked)); L = Object.assign({}, bl[(Math.random() * bl.length) | 0], { ev: 'bossrush' }); }
      else L = Object.assign({}, base, { task: 'survive', len: 35, boss: null, newType: null, stars: ['neend80', 'combo15'], story: 'Diwali night… firecrackers outside, mosquitoes inside!', ev: id });
      hideAll(); CL = L; startLevel(L, {}); uiPlaying(true);
    });
  },
  eventWin(st) {
    const ev = CL.ev, add = ev === 'bossrush' ? 0 : 10 + st * 5, coins = Math.round((G.coins + st * 15) * (ev === 'bossrush' ? 2 : 1));
    if (ev !== 'bossrush') SAVE.evc[ev] = (SAVE.evc[ev] || 0) + add;
    SAVE.coins += coins; SAVE.gems += G.gems; save();
    const e = EVENTS.find(x => x.id === ev);
    META.modal(`<div class="bigrank">${e ? e.i : '👑'}</div><div class="big" style="font-size:30px">${e ? e.n : 'BOSS RUSH'} CLEARED!</div>
      <div class="coins">${add ? `${e.cur} +${add} &nbsp; ` : ''}${coinH(coins)}${G.gems ? ` 💎 +${G.gems}` : ''}</div>${ev === 'bossrush' ? '<div class="chip">👑 Weekend 2X coins</div>' : `<div class="sub">Total ${e.cur}: ${SAVE.evc[ev]}</div>`}`, 'BACK TO EVENTS ▶', () => { showMap(); setTimeout(() => this.events(), 400); });
  },
  /* ---------- win hook ---------- */
  onWin(st) {
    const id = CW.cid, r = this.rec(id), before = this.bondLv(r.bond).lv;
    r.stars[CL.n] = Math.max(r.stars[CL.n] || 0, st); r.best[CL.n] = Math.max(r.best[CL.n] || 0, G.score); r.nights++; r.bond += 10 + st * 5;
    SAVE.starBank += st; if (!CHARS[id].secret) SAVE.nightsTotal++;
    const b = this.bondLv(r.bond); save();
    $('wRishta').innerHTML = `<div class="rrow"><span>${CHARS[id].e} Bond with ${CHARS[id].n}</span><span>💜 Lv ${b.lv}</span></div><div class="xpbar"><i style="width:${b.cur / b.need * 100}%"></i></div>
      <div class="rrow"><span>🌙 ${CHARS[id].n} nights: <b>${r.nights}</b>${CHARS[id].secret ? ' 🔒' : ` · Total: <b>${SAVE.nightsTotal}</b>`}</span><span>⭐ +${st} for the room</span></div>`;
    /* purana rishta Lv toast hataya: ab sirf Rishta Meter (%) */
  },
  hubButtons() {
    const act = this.activeEvent(), canBuy = ROOM.some(r => !this.room(this.cid(CL.w)).includes(r.id) && r.c <= SAVE.starBank);
    return `<button data-r="rishte">💞<span>Bonds</span></button><button data-r="diary">🔒<span>Diary</span></button><button data-r="kamra">🏠<span>Room</span>${canBuy ? '<i class="dot">!</i>' : ''}</button><button data-r="events">📅<span>Events</span>${act || META.weekend() ? '<i class="dot">LIVE</i>' : ''}</button>`;
  },
  bindHub() {
    document.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { sfx.coin(); const r = b.dataset.r; if (r === 'rishte') this.rishte(); if (r === 'diary') this.askPin(() => this.diary()); if (r === 'kamra') this.kamra(); if (r === 'events') this.events(); });
  }
};
RISHTE.init();
window.RISHTE = RISHTE;

/* ================= DRAWING: looks, dog, props, room, morning, diwali ================= */
const _dph = drawProfileHead, _dfh = drawFrontHead;
window.drawProfileHead = function (s, u, time) {
  if (s.kind === 'dog') return drawDog(s, u, time);
  window._look = s.look || {}; _dph(s, u, time); lookExtras(s, u, time, 'p');
};
window.drawFrontHead = function (s, u, time) { window._look = s.look || {}; _dfh(s, u, time); lookExtras(s, u, time, 'f'); };
function lookExtras(s, u, time, mode) {
  const L = s.look || {}, r = 23 * u; if (!Object.keys(L).length) return;
  ctx.save();
  if (mode === 'p') { const wake = s.wk || 0; ctx.translate(s.x, s.y - wake * 18 * u); ctx.rotate(-Math.PI / 2 + (s.pose === 'sprawl' ? 0.28 : 0.06) + wake * 0.9); }
  else { ctx.translate(s.x + 2 * u, s.y - 2 * u); ctx.rotate(-Math.PI / 2 + 0.12); }
  if (L.grey) { ctx.fillStyle = 'rgba(230,226,240,.85)'; ctx.beginPath(); ctx.arc(0, 0, r * 1.05, Math.PI * 1.05, Math.PI * 1.5); ctx.arc(0, 0, r * 0.75, Math.PI * 1.5, Math.PI * 1.05, true); ctx.fill(); }
  if (L.glasses && mode === 'p') { ctx.strokeStyle = 'rgba(220,220,240,.9)'; ctx.lineWidth = 1.4 * u; ctx.beginPath(); ctx.arc(r * 0.63, -r * 0.3, r * 0.26, 0, 7); ctx.moveTo(r * 0.37, -r * 0.28); ctx.lineTo(-r * 0.05, -r * 0.2); ctx.stroke(); }
  if (L.long) { ctx.fillStyle = '#1a1030'; ctx.beginPath(); ctx.ellipse(-r * 1.25, r * 0.5, r * 0.45, r * 1.0, 0.4, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(154,109,245,.35)'; ctx.lineWidth = 1 * u; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(-r * 1.25, r * 0.5, r * (0.2 + i * 0.1), r * 0.9, 0.4, 2, 4.5); ctx.stroke(); } }
  if (L.pony) { ctx.fillStyle = '#1a1030'; ctx.beginPath(); ctx.ellipse(-r * 1.2, -r * 0.6, r * 0.35, r * 0.6, -0.6, 0, 7); ctx.fill(); ctx.fillStyle = P2; ctx.beginPath(); ctx.arc(-r * 0.95, -r * 0.5, 3 * u, 0, 7); ctx.fill(); }
  if (L.heart) { ctx.fillStyle = '#c7b0ff'; ctx.font = `${10 * u}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText('💜', -r * 0.6, -r * 0.75); }
  if (L.facepack) {
    if (mode === 'p') { ctx.fillStyle = 'rgba(190,235,215,.85)'; ctx.beginPath(); ctx.ellipse(r * 0.55, -r * 0.05, r * 0.42, r * 0.62, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#8fd0a0'; ctx.beginPath(); ctx.arc(r * 0.63, -r * 0.3, r * 0.17, 0, 7); ctx.fill(); ctx.fillStyle = '#d8f5e0'; ctx.beginPath(); ctx.arc(r * 0.63, -r * 0.3, r * 0.11, 0, 7); ctx.fill(); }
    else { ctx.fillStyle = 'rgba(190,235,215,.85)'; ctx.beginPath(); ctx.ellipse(0, r * 0.08, r * 0.8, r * 0.9, 0, 0, 7); ctx.fill(); for (const sx of [-1, 1]) { ctx.fillStyle = '#8fd0a0'; ctx.beginPath(); ctx.arc(sx * r * 0.36, -r * 0.08, r * 0.17, 0, 7); ctx.fill(); ctx.fillStyle = '#d8f5e0'; ctx.beginPath(); ctx.arc(sx * r * 0.36, -r * 0.08, r * 0.11, 0, 7); ctx.fill(); } }
  }
  ctx.restore();
  if (L.sparkle && state === 'play') { ctx.font = `${12 * u}px sans-serif`; ctx.textAlign = 'center'; ctx.globalAlpha = 0.5 + Math.sin(time * 4) * 0.5; ctx.fillText('✨', s.x - 30 * u, s.y - 40 * u); ctx.fillText('💘', s.x + 34 * u, s.y - 52 * u + Math.sin(time * 2) * 4 * u); ctx.globalAlpha = 1; }
}
function drawDog(s, u, time) {
  const r = 22 * u, wake = s.wk || 0, ex = exprOf(s);
  ctx.save(); ctx.translate(s.x + 4 * u, s.y + 4 * u - wake * 14 * u); ctx.scale(-1, 1); ctx.rotate(-0.35 + (s.wig > 0 ? Math.sin(s.wig * 50) * 0.1 : 0) - wake * 0.3);
  ctx.fillStyle = 'rgba(40,15,30,.45)'; ctx.beginPath(); ctx.arc(0, 0, r + 1.5 * u, 0, 7); ctx.ellipse(r * 0.95, r * 0.25, r * 0.65, r * 0.42, 0.1, 0, 7); ctx.fill();
  ctx.fillStyle = '#a8743f'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
  ctx.fillStyle = '#f0dcc0'; ctx.beginPath(); ctx.ellipse(r * 0.95, r * 0.25, r * 0.62, r * 0.4, 0.1, 0, 7); ctx.fill();
  ctx.fillStyle = '#2a1a1a'; ctx.beginPath(); ctx.ellipse(r * 1.5, r * 0.12, r * 0.16, r * 0.12, 0, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(r * 1.46, r * 0.08, 1.5 * u, 0, 7); ctx.fill();
  ctx.fillStyle = '#6a4220'; ctx.beginPath(); ctx.ellipse(-r * 0.3, r * 0.35, r * 0.32, r * 0.7, 0.35, 0, 7); ctx.fill();
  if (ex === 'awake') { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(r * 0.45, -r * 0.25, r * 0.17, 0, 7); ctx.fill(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(r * 0.5, -r * 0.25, r * 0.09, 0, 7); ctx.fill(); }
  else if (ex === 'happy') { ctx.strokeStyle = '#2a1a1a'; ctx.lineWidth = 2 * u; ctx.beginPath(); ctx.arc(r * 0.45, -r * 0.18, r * 0.14, Math.PI + 0.3, -0.3); ctx.stroke(); ctx.fillStyle = '#c86a7a'; ctx.beginPath(); ctx.ellipse(r * 1.1, r * 0.62, r * 0.12, r * 0.22, 0, 0, 7); ctx.fill(); }
  else { ctx.strokeStyle = '#2a1a1a'; ctx.lineWidth = 2 * u; ctx.beginPath(); ctx.arc(r * 0.45, -r * 0.3, r * 0.14, 0.3, Math.PI - 0.3); ctx.stroke(); }
  ctx.strokeStyle = '#2a1a1a'; ctx.lineWidth = 1.4 * u; ctx.beginPath(); ctx.moveTo(r * 1.5, r * 0.25); ctx.quadraticCurveTo(r * 1.3, r * 0.5, r * 1.0, r * 0.45); ctx.stroke();
  ctx.fillStyle = P1; rr(ctx, -r * 0.5, r * 0.75, r * 0.9, r * 0.22, 3 * u); ctx.fill(); ctx.fillStyle = '#e9e1ff'; ctx.beginPath(); ctx.arc(-r * 0.05, r * 1.0, 3 * u, 0, 7); ctx.fill();
  ctx.restore();
}
const _setPose = setPose;
window.setPose = function (s, p) { _setPose(s, p); if (s.kind === 'dog' && s.pose === 'side') { s.pose = 'sprawl'; s.pts = posePts(s); } };
const _exprOf = exprOf;
window.exprOf = function (s) { if (s.happy) return s.wk > 0.3 ? 'happy' : 'calm'; return _exprOf(s); };
/* happy face on humans: patch into profile drawing by overlay */
function happyOverlay(s, u) {
  if (!s.happy || !(s.wk > 0.3) || s.kind === 'dog') return;
  const r = 23 * u, wake = s.wk; ctx.save(); ctx.translate(s.x, s.y - wake * 18 * u); ctx.rotate(-Math.PI / 2 + (s.pose === 'sprawl' ? 0.28 : 0.06) + wake * 0.9);
  const sk = SKIN[s.kind] || SKIN.papa; ctx.fillStyle = sk; ctx.beginPath(); ctx.ellipse(r * 0.63, -r * 0.3, r * 0.26, r * 0.22, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(r * 0.86, r * 0.55, r * 0.2, r * 0.24, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#2a1020'; ctx.lineWidth = 2 * u; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(r * 0.63, -r * 0.22, r * 0.15, Math.PI + 0.35, -0.35); ctx.stroke();
  ctx.fillStyle = '#3a1020'; ctx.beginPath(); ctx.arc(r * 0.8, r * 0.55, r * 0.2, -Math.PI / 2, Math.PI / 2); ctx.fill();
  ctx.fillStyle = 'rgba(200,110,100,.35)'; ctx.beginPath(); ctx.arc(r * 0.4, r * 0.15, r * 0.18, 0, 7); ctx.fill();
  ctx.restore();
}
const _drawPerson = drawPerson;
window.drawPerson = function (s, time) {
  if (G.cine && G.cine.type === 'morning') { s.happy = true; } else s.happy = false;
  _drawPerson(s, time);
  if (G.cine && G.cine.type === 'morning') { s.wk = clamp((G.cine.t - 0.8) / 0.5, 0, 1); }
  happyOverlay(s, S * s.sc);
  // props
  const u = S * s.sc, q = CHARS[s.cid] ? CHARS[s.cid].q : '';
  if ((q === 'phone' || q === 'gamer') && !s.walk) {
    const px = s.x + 34 * u, py = bed.y - 8 * u; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(px, py, 0, px, py, 90 * u); g.addColorStop(0, q === 'gamer' ? 'rgba(154,109,245,.45)' : 'rgba(127,212,255,.4)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(px - 90 * u, py - 90 * u, 180 * u, 180 * u); ctx.restore();
    ctx.fillStyle = '#111'; rr(ctx, px - 7 * u, py - 12 * u, 14 * u, 22 * u, 2.5 * u); ctx.fill(); ctx.fillStyle = q === 'gamer' ? '#9a6df5' : '#8fc8ff'; rr(ctx, px - 5.5 * u, py - 10 * u, 11 * u, 18 * u, 1.5 * u); ctx.fill();
    ctx.font = `${7 * u}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText(s.cid === 'gf' ? '💜' : q === 'gamer' ? '🎮' : '📱', px, py + 2 * u);
  }
};
const _ui_render = render;
function drawRoomItems(time) {
  if (!['play', 'clear', 'wake', 'over', 'fail', 'intro'].includes(state)) return;
  const id = CW.cid || 'papa', items = RISHTE.room(id), u = bed.u || S, floorY = bed.y + bed.h;
  if (items.includes('paint')) { ctx.fillStyle = 'rgba(154,109,245,.10)'; ctx.fillRect(0, 0, W, H * 0.74); }
  if (items.includes('rug')) { const g = ctx.createRadialGradient(bed.x + bed.w / 2, floorY + 14 * u, 0, bed.x + bed.w / 2, floorY + 14 * u, bed.w * 0.7); g.addColorStop(0, 'rgba(116,58,232,.55)'); g.addColorStop(0.85, 'rgba(116,58,232,.4)'); g.addColorStop(1, 'rgba(116,58,232,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(bed.x + bed.w / 2, floorY + 14 * u, bed.w * 0.7, 22 * u, 0, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(233,225,255,.4)'; ctx.setLineDash([4 * u, 4 * u]); ctx.lineWidth = 1.5 * u; ctx.beginPath(); ctx.ellipse(bed.x + bed.w / 2, floorY + 14 * u, bed.w * 0.62, 17 * u, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
  if (items.includes('frame')) { const fx = bed.x + bed.w * 0.3, fy = bed.y - 170 * u; ctx.fillStyle = '#4a2a5e'; rr(ctx, fx - 32 * u, fy - 24 * u, 64 * u, 48 * u, 4 * u); ctx.fill(); ctx.fillStyle = '#d9d3f5'; ctx.fillRect(fx - 27 * u, fy - 19 * u, 54 * u, 38 * u); ctx.font = `${16 * u}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText((CHARS[id] || {}).e + '🧑', fx, fy + 1 * u); ctx.textBaseline = 'alphabetic'; }
  if (items.includes('ac')) { const ax = bed.x + bed.w * 0.7, ay = bed.y - 190 * u; ctx.fillStyle = '#eceaf6'; rr(ctx, ax - 50 * u, ay, 100 * u, 26 * u, 8 * u); ctx.fill(); ctx.fillStyle = '#c9c2e6'; ctx.fillRect(ax - 44 * u, ay + 18 * u, 88 * u, 3 * u); ctx.fillStyle = `rgb(${ELEC})`; ctx.beginPath(); ctx.arc(ax + 38 * u, ay + 8 * u, 2 * u, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(200,230,255,.35)'; ctx.lineWidth = 1.5 * u; for (let i = 0; i < 4; i++) { const k = (time * 0.6 + i / 4) % 1; ctx.globalAlpha = 1 - k; ctx.beginPath(); ctx.moveTo(ax - 40 * u + i * 26 * u, ay + 28 * u + k * 40 * u); ctx.quadraticCurveTo(ax - 30 * u + i * 26 * u, ay + 38 * u + k * 40 * u, ax - 40 * u + i * 26 * u, ay + 48 * u + k * 40 * u); ctx.stroke(); } ctx.globalAlpha = 1; }
  if (items.includes('plant')) { const px = Math.min(W - 30 * u, bed.x + bed.w + 34 * u), py = floorY; ctx.fillStyle = '#5a3a6a'; ctx.beginPath(); ctx.moveTo(px - 14 * u, py - 26 * u); ctx.lineTo(px + 14 * u, py - 26 * u); ctx.lineTo(px + 10 * u, py); ctx.lineTo(px - 10 * u, py); ctx.fill();
    ctx.fillStyle = '#3f7a5a'; for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.32 + Math.sin(time + i) * 0.04; ctx.save(); ctx.translate(px, py - 26 * u); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(18 * u, 0, 18 * u, 5 * u, 0, 0, 7); ctx.fill(); ctx.restore(); } }
  if (items.includes('lamp')) { const lx = bed.x - 24 * u, ly = bed.y - 70 * u; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 140 * u); g.addColorStop(0, 'rgba(233,225,255,.35)'); g.addColorStop(1, 'rgba(233,225,255,0)'); ctx.fillStyle = g; ctx.fillRect(lx - 140 * u, ly - 140 * u, 280 * u, 280 * u); ctx.restore();
    ctx.fillStyle = '#e9e1ff'; ctx.beginPath(); ctx.moveTo(lx - 12 * u, ly); ctx.lineTo(lx + 12 * u, ly); ctx.lineTo(lx + 7 * u, ly - 16 * u); ctx.lineTo(lx - 7 * u, ly - 16 * u); ctx.fill(); ctx.fillStyle = '#5a46a0'; ctx.fillRect(lx - 1.5 * u, ly, 3 * u, 20 * u); }
  if (CL.ev === 'diwali') {
    for (let i = 0; i < 7; i++) { const dx = bed.x - 40 * u + i * (bed.w + 80 * u) / 6, dy = floorY + 22 * u; ctx.fillStyle = '#8a4a34'; ctx.beginPath(); ctx.ellipse(dx, dy, 9 * u, 4 * u, 0, 0, Math.PI); ctx.fill();
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(dx, dy - 6 * u, 0, dx, dy - 6 * u, 40 * u); g.addColorStop(0, `rgba(255,170,120,${0.5 + Math.sin(time * 12 + i) * 0.1})`); g.addColorStop(1, 'rgba(255,170,120,0)'); ctx.fillStyle = g; ctx.fillRect(dx - 40 * u, dy - 46 * u, 80 * u, 80 * u); ctx.restore();
      ctx.fillStyle = '#ffb38a'; ctx.beginPath(); ctx.ellipse(dx, dy - 5 * u + Math.sin(time * 15 + i) * 0.6 * u, 2.5 * u, 5 * u, 0, 0, 7); ctx.fill(); }
    for (const f of (G.fw || [])) { for (const p of f.p) { ctx.globalAlpha = Math.max(0, f.life); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(f.x + p.vx * (1.4 - f.life), f.y + p.vy * (1.4 - f.life) + (1.4 - f.life) ** 2 * 30 * S, 2.2 * S, 0, 7); ctx.fill(); } } ctx.globalAlpha = 1;
  }
}
function drawMorning(time) {
  const c = G.cine; if (!c || c.type !== 'morning' || c.t < 0) return;
  const k = clamp(c.t / 1.2, 0, 1), s = mainS();
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgba(199,176,255,${0.3 * k})`); g.addColorStop(0.5, `rgba(160,190,255,${0.18 * k})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const sx = W * 0.82, sy = H * (0.36 - 0.12 * k), sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 260 * S); sg.addColorStop(0, `rgba(255,255,255,${0.7 * k})`); sg.addColorStop(0.2, `rgba(233,225,255,${0.35 * k})`); sg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sg; ctx.fillRect(sx - 260 * S, sy - 260 * S, 520 * S, 520 * S);
  ctx.strokeStyle = `rgba(255,255,255,${0.12 * k})`; ctx.lineWidth = 18 * S; for (let i = 0; i < 6; i++) { const a = Math.PI * 0.75 + i * 0.12 + Math.sin(time * 0.5) * 0.02; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(a) * W, sy + Math.sin(a) * W); ctx.stroke(); }
  ctx.restore();
  // birds
  ctx.strokeStyle = 'rgba(30,20,60,.7)'; ctx.lineWidth = 2 * S; for (let i = 0; i < 4; i++) { const bx = ((time * 60 + i * 90) % (W + 100)) - 50, by = H * 0.18 + i * 14 * S + Math.sin(time * 3 + i) * 6 * S, f = Math.sin(time * 12 + i) * 5 * S; ctx.beginPath(); ctx.moveTo(bx - 8 * S, by - f); ctx.quadraticCurveTo(bx - 3 * S, by - 4 * S, bx, by); ctx.quadraticCurveTo(bx + 3 * S, by - 4 * S, bx + 8 * S, by - f); ctx.stroke(); }
  // title
  const tk = clamp((c.t - 0.2) / 0.3, 0, 1); ctx.save(); ctx.globalAlpha = tk; ctx.textAlign = 'center'; ctx.font = `900 ${Math.min(40 * S, W * 0.09)}px Poppins`; ctx.lineWidth = 8 * S; ctx.strokeStyle = 'rgba(40,12,110,.9)'; ctx.fillStyle = '#fff';
  ctx.strokeText('☀️ GOOD MORNING!', W / 2, H * 0.3); ctx.fillText('☀️ GOOD MORNING!', W / 2, H * 0.3);
  ctx.font = `800 ${Math.min(17 * S, W * 0.042)}px Poppins`; ctx.lineWidth = 5 * S; const sub = `${CW.who} slept through the night 🌙→☀️`; ctx.strokeText(sub, W / 2, H * 0.3 + 32 * S); ctx.fillText(sub, W / 2, H * 0.3 + 32 * S); ctx.restore();
  // speech bubble
  if (c.t > 1.1 && s) {
    const a = clamp((c.t - 1.1) / 0.25, 0, 1), line = c.line, u = S;
    ctx.save(); ctx.globalAlpha = a; ctx.font = `800 ${Math.min(15 * u, W * 0.038)}px Poppins`;
    const maxW = Math.min(W * 0.8, 380 * u), words = line.split(' '), lines = []; let cur = '';
    for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW - 30 * u) { lines.push(cur); cur = w; } else cur = t; } lines.push(cur);
    const bw = Math.min(maxW, Math.max(...lines.map(l => ctx.measureText(l).width)) + 34 * u), bh = lines.length * 21 * u + 24 * u, bx = clamp(s.x - 20 * u, 10, W - bw - 10), by = s.y - 110 * u - bh * (1 - a * 0.1);
    ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 20 * u; ctx.fillStyle = '#fff'; rr(ctx, bx, by, bw, bh, 18 * u); ctx.fill(); ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.moveTo(clamp(s.x + 10 * u, bx + 20 * u, bx + bw - 20 * u), by + bh - 1); ctx.lineTo(s.x + 24 * u, by + bh + 18 * u); ctx.lineTo(clamp(s.x + 30 * u, bx + 30 * u, bx + bw - 10 * u), by + bh - 1); ctx.fill();
    ctx.fillStyle = '#2a1270'; ctx.textAlign = 'center'; lines.forEach((l, i) => ctx.fillText(l, bx + bw / 2, by + 28 * u + i * 21 * u)); ctx.restore();
    for (let i = 0; i < 5; i++) { const hk = ((time * 0.5 + i / 5) % 1); ctx.globalAlpha = Math.sin(hk * Math.PI) * a; ctx.font = `${(12 + hk * 10) * u}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText('💜', s.x + 30 * u + Math.sin(hk * 6 + i) * 30 * u, s.y - 40 * u - hk * 120 * u); } ctx.globalAlpha = 1;
  }
}
window.render = function (time) {
  _ui_render(time);
};
/* hook room items + morning into the draw pipeline via drawFan (called right after bg) and drawCine */
const _drawFan = drawFan; window.drawFan = function () { drawRoomItems(performance.now() / 1000); _drawFan(); };
const _drawCine = drawCine; window.drawCine = function (time) { drawMorning(time); _drawCine(time); };

/* ---------- per-frame: diwali fireworks, skin sparkles ---------- */
RISHTE.tick = function (gdt) {
  if (state !== 'play') return;
  if (CL.ev === 'diwali') {
    G.fw = G.fw || []; G.fwT = (G.fwT === undefined ? 2 : G.fwT) - gdt;
    if (G.fwT <= 0) {
      G.fwT = rnd(2.5, 4.5); const cols = ['#ffffff', '#c7b0ff', '#7fd4ff', '#9a6df5', '#ffb38a'];
      G.fw.push({ x: rnd(W * 0.1, W * 0.9), y: rnd(H * 0.14, H * 0.34), life: 1.4, p: Array.from({ length: 26 }, (_, i) => { const a = i / 26 * 6.283, v = rnd(60, 120) * S; return { vx: Math.cos(a) * v, vy: Math.sin(a) * v, c: cols[i % cols.length] }; }) });
      noise(0.5, 0.25, 'highpass', 1800, 0.002); for (let i = 0; i < 6; i++) tone(rnd(2000, 4000), rnd(1500, 3000), 0.03, 0.04, 'square', 0.1 + i * 0.06);
      if (Math.random() < 0.3) { const s = mainS(); s.neend -= 1.5; s.bitten = 0.4; pop('FIRECRACKER! 🧨 sleep shaken', s.x + 40 * S, s.y - 70 * S, 15, '#fff', 0.9); }
    }
    for (const f of G.fw) f.life -= gdt; G.fw = G.fw.filter(f => f.life > 0);
  }
  if (SAVE.skin === 'phuljhadi' && ptr.vis > 0 && Math.random() < 0.6) G.parts.push({ x: ptr.x + rnd(-1, 1) * R() * 0.8, y: ptr.y + rnd(-1, 1) * R() * 0.7, vx: rnd(-40, 40) * S, vy: rnd(-60, 0) * S, life: 0.4, max: 0.4, size: rnd(1, 2) * S, col: ['#fff', '#ffb38a', '#c7b0ff'][(Math.random() * 3) | 0], g: 120 * S });
};
const _metaTick = META.tick; META.tick = function (dt, gdt) { _metaTick.call(META, dt, gdt); RISHTE.tick(gdt); };


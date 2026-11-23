/* ================= BEAT SANX — events =================
   6 live events + Daily Challenge + festival events. All rivals are AI and labeled "AI".
   v1.2: themed arenas, (i) rules on every event, ribbons (NEW / ENDING SOON / REWARD READY),
   LIVE hero card on home, once-a-day "Event of the day" popup, +1 try per event per day with an ad. */
'use strict';
const EV = (() => {
  const $ = id => document.getElementById(id);
  const fmt = n => UI.fmt(n);
  const st = () => S.st;
  const E = k => (st().ev[k] = st().ev[k] || {});
  const acc = r => r.taps ? Math.max(0.6, r.correct / r.taps) : 0.6;
  const pick = a => a[Math.floor(Math.random() * a.length)];
  let curEv = null;

  /* ---------- time helpers ---------- */
  const dayEnd = () => { const d = new Date(); d.setHours(24, 0, 0, 0); return d.getTime(); };
  const weekEnd = () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + (8 - (d.getDay() || 7))); return d.getTime(); };
  const monthEnd = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime(); };
  const weekOfMonth = () => { const d = new Date().getDate(); return d <= 7 ? 1 : d <= 14 ? 2 : d <= 21 ? 3 : 4; };
  const surge = () => { const n = new Date(), s = n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds(), p = D.TOUR.surgeEveryH * 3600, pos = s % p; return pos < D.TOUR.surgeMins * 60 ? { on: true, left: D.TOUR.surgeMins * 60 - pos } : { on: false, in: p - pos }; };
  const lastHour = () => new Date().getHours() === 23;

  /* ---------- state per event (auto-reset by period) ---------- */
  function bts() { const e = E('bts'), k = S.dayKey(); if (e.day !== k) { e.day = k; e.att = 0; } e.streak = e.streak || 0; e.wins = e.wins || 0; return e; }
  function oma() { const e = E('oma'), k = S.weekKey(); if (e.wk !== k) Object.assign(e, { wk: k, att: 0, best: 0, beaten: 0, claimed: [] }); return e; }
  /* champion is locked for the week: your best pattern of the last 10 ladder runs + 2 tiles */
  const skillTiles = () => { const a = st().skill || []; return a.length ? Math.max(...a) : 6; };
  function btc() { const e = E('btc'), k = S.weekKey(), d = S.dayKey(); if (e.wk !== k || !e.tiles) Object.assign(e, { wk: k, best: 0, claimed: [], throne: false, lvl: 0, tiles: Math.max(D.BTC.minTiles, skillTiles() + D.BTC.lead) }); if (e.day !== d) { e.day = d; e.att = 0; } return e; }
  function bco() { const e = E('bco'), d = S.dayKey(); if (e.day !== d) { const y = new Date(); y.setDate(y.getDate() - 1); e.streak = e.played === S.dayKey(y) ? (e.streak || 0) + 1 : (e.played === d ? e.streak : 0); Object.assign(e, { day: d, best: 0, claimed: [], att: 0 }); } return e; }
  function tour() { const e = E('tour'), m = S.monthKey(); if (e.m !== m) Object.assign(e, { m, best: {}, att: {}, claimed: [] }); return e; }
  function mania() { const e = E('mania'), m = S.monthKey(), d = S.dayKey(); if (e.m !== m) { if (e.m && e.best > 0) { const dv = [...D.MANIA.divisions].reverse().find(x => e.best >= x.at); S.grant(dv.reward); setTimeout(() => UI.toast(`Sanx Mania: ${dv.name} division reward added`, 'trophy'), 800); } Object.assign(e, { m, best: 0, claimed: [] }); } if (e.day !== d) { e.day = d; e.att = 0; } return e; }
  const champ = () => { const b = D.BTC.champs[Math.floor(Date.now() / (7 * 864e5)) % D.BTC.champs.length], e = btc(); return { ...b, name: b.name + (e.lvl ? ' ' + D.ROMAN[e.lvl + 1] : ''), tiles: e.tiles, score: D.champScore(e.tiles) }; };
  const bounty = () => { const day = (new Date().getDay() + 6) % 7; return Math.round(Math.min(D.BTC.bountyMax, D.BTC.bountyBase + day * D.BTC.bountyDay) * Math.pow(D.BTC.bountyGrow, btc().lvl || 0)); };
  const maniaPhase = () => { const d = new Date().getDate(); return D.MANIA.phases.find(p => d <= p.to); };
  /* +1 try per event per day with a rewarded ad */
  const bonus = id => { const e = E('xtra'), d = S.dayKey(); if (e.d !== d) { e.d = d; e.n = {}; } return e.n[id] || 0; };
  const addBonus = id => { bonus(id); const e = E('xtra'); e.n[id] = (e.n[id] || 0) + 1; S.save(); };

  const LIST = [
    { id: 'bts',   name: 'Beat the Sanx',      period: 'DAILY',   icon: 'skull',  tag: 'Bet coins. Beat Sanx before the clock.', end: dayEnd,   c1: '#e11d48', c2: '#3b0518', arena: 'Boxing Ring' },
    { id: 'champ', name: 'Beat the Champion',  period: 'WEEKLY',  icon: 'crown',  tag: 'Dethrone this week\'s AI champion.',     end: weekEnd,  c1: '#a16207', c2: '#2a1500', arena: 'Throne Room' },
    { id: 'oma',   name: 'One Man Army',       period: 'WEEKLY',  icon: 'army',   tag: 'Outlast 5 AI soldiers. Sudden death.',    end: weekEnd,  c1: '#4d7c0f', c2: '#0f1a05', arena: 'Battlefield' },
    { id: 'bco',   name: 'Beat the Coins',     period: 'DAILY',   icon: 'vault',  tag: 'Raid the vault. Max coins in one run.',   end: dayEnd,   c1: '#b45309', c2: '#1f1003', arena: 'Vault Door' },
    { id: 'tour',  name: 'World Flash Tour',   period: 'MONTHLY', icon: 'globe',  tag: '4 grids. New one every week.',            end: monthEnd, c1: '#0369a1', c2: '#03142a', arena: 'World Globe' },
    { id: 'mania', name: 'Sanx Mania',         period: 'MONTHLY', icon: 'flame',  tag: 'Monthly score chase. Win the Sanx skin.', end: monthEnd, c1: '#7c3aed', c2: '#16052e', arena: 'Concert Stage' }
  ];
  const L = id => LIST.find(l => l.id === id);

  function status(id) {
    const b = bonus(id);
    if (id === 'bts') { const e = bts(); return { left: D.BTS.attempts + b - e.att, max: D.BTS.attempts }; }
    if (id === 'champ') { const e = btc(); return { left: D.BTC.attempts + b - e.att, max: D.BTC.attempts }; }
    if (id === 'oma') { const e = oma(); return { left: D.OMA.attempts + b - e.att, max: D.OMA.attempts }; }
    if (id === 'bco') { const e = bco(); return { left: 5 + b - e.att, max: 5 }; }
    if (id === 'mania') { const e = mania(); return { left: 5 + b - e.att, max: 5 }; }
    if (id === 'tour') { const e = tour(), w = weekOfMonth(); const sum = D.TOUR.stages.filter(s => s.week <= w).reduce((a, s) => a + (s.attempts - (e.att[s.id] || 0)), 0) + b; return { left: sum, max: null }; }
  }
  function readyReward(id) {
    try {
      if (id === 'champ') { const e = btc(), c = champ(); return D.BTC.rewards.some((w, i) => e.best >= c.score * w.pct && !e.claimed.includes(i)) || (e.best >= c.score && !e.claimed.includes('throne')); }
      if (id === 'oma') { const e = oma(); return e.att > 0 && OMA_RANKS.some((n, i) => e.beaten >= i && !e.claimed.includes(i)); }
      if (id === 'bco') { const e = bco(); return D.BCOINS.tiers.some((t, i) => e.best >= t.at && !e.claimed.includes(i)); }
      if (id === 'tour') { const e = tour(); return D.TOUR.stages.some((s, i) => (e.best[s.id] || 0) >= s.goal && !e.claimed.includes(i)); }
      if (id === 'mania') { const e = mania(); return D.MANIA.milestones.some((m, i) => e.best >= m.s && !e.claimed.includes(i)); }
    } catch (e) { }
    return false;
  }
  function ribbon(l) {
    const leftMs = l.end() - Date.now(), startedAgo = { DAILY: 864e5, WEEKLY: 7 * 864e5, MONTHLY: 30 * 864e5 }[l.period] - leftMs;
    if (readyReward(l.id)) return { t: 'REWARD READY', cls: 'rd' };
    if (leftMs < 6 * 36e5) return { t: 'ENDING SOON', cls: 'end' };
    if (startedAgo < 864e5 && l.period !== 'DAILY') return { t: 'NEW', cls: 'new' };
    return { t: 'LIVE', cls: 'live' };
  }
  function badgeCount() { return LIST.filter(l => (status(l.id).left || 0) > 0).length + (fest() && fest().live ? 1 : 0) + D.ARENA.filter(a => arenaLeft(a.id) > 0).length; }
  /* ---------- ARENA (5 premium daily challenges on the event ladder) ---------- */
  const AR = id => { const e = E('ar_' + id), d = S.dayKey(); if (e.day !== d) Object.assign(e, { day: d, att: 0 }); e.best = e.best || 0; e.claimed = e.claimed || []; return e; };
  const arenaLeft = id => D.ARENA_TRIES + bonus('ar_' + id) - AR(id).att;
  const dayIndex = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);
  const evOfDay = () => LIST[dayIndex() % LIST.length];

  /* ---------- FESTIVALS ---------- */
  function fest() {
    const q = new URLSearchParams(location.search).get('fest');
    const now = Date.now();
    if (q) { const f = D.FESTS.find(x => x.id === q); if (f) return { f, live: true, start: now - 864e5, end: now + 3 * 864e5 }; }
    for (const f of D.FESTS) { const a = D.festDate(f.from), b = D.festDate(f.to) + 864e5; if (now >= a && now < b) return { f, live: true, start: a, end: b }; }
    const next = D.FESTS.map(f => ({ f, start: D.festDate(f.from), end: D.festDate(f.to) + 864e5 })).filter(x => x.start > now).sort((a, b) => a.start - b.start)[0];
    return next ? { ...next, live: false } : null;
  }
  const FS = id => { const e = st().fest[id] = st().fest[id] || { won: false, claimed: [], count: 0, nights: [], advent: [], att: 0, day: '' }; const d = S.dayKey(); if (e.day !== d) { e.day = d; e.att = 0; } return e; };
  const festTries = id => 3 + bonus('f_' + id) - FS(id).att;

  /* ---------- home hero card ---------- */
  function heroInfo() {
    const fs = fest();
    if (fs && fs.live) { const f = fs.f; return { id: f.id, act: 'live', icon: f.icon, k: `${f.fest.toUpperCase()} EVENT · ${UI.left(fs.end)} LEFT`, name: f.name, sub: f.tag, c1: f.theme[0], c2: f.theme[1], rib: { t: 'FESTIVAL', cls: 'fest' } }; }
    const l = evOfDay(), sv = status(l.id);
    return { id: l.id, act: 'live', icon: l.icon, k: `EVENT OF THE DAY · ${UI.left(l.end())} LEFT`, name: l.name, sub: sv.left > 0 ? `${l.tag}` : 'Come back for more tries', c1: l.c1, c2: l.c2, rib: ribbon(l) };
  }
  function openHero() { const fs = fest(); if (fs && fs.live) openFest(fs.f.id); else open(evOfDay().id); }
  /* once a day, after the login reward */
  function dayPopup() {
    const s = st(), d = S.dayKey();
    if (s.evPopDay === d || !s.seenTut || s.stats.runs < 1) return false;
    s.evPopDay = d; S.save();
    const h = heroInfo();
    UI.modal(`<div class="evPop" style="--la:${h.c1};--lb:${h.c2}"><div class="rwRays"></div><span class="lvRib ${h.rib.cls}">${h.rib.t}</span><div class="epIc">${ART.ic(h.icon)}</div><div class="mdK">${h.k}</div><div class="mdT">${h.name}</div><div class="mdS">${h.sub}</div>
      <button class="btn big pulse" data-act="evPopGo">${ART.ic('play')} PLAY NOW</button><button class="btn ghost" data-act="closeModal">Later</button></div>`, 'evPopM');
    return true;
  }

  /* ---------- HUB ---------- */
  function renderHub() {
    const s = st(), fs = fest();
    const cards = LIST.map(l => {
      const sv = status(l.id), off = sv.left <= 0, rb = ribbon(l);
      const extra = l.id === 'tour' && surge().on ? '<em class="live">FLASH SURGE ×3</em>' : l.id === 'champ' ? `<em>Bounty ${fmt(bounty())}</em>` : l.id === 'mania' ? `<em>${maniaPhase().name}</em>` : '';
      return `<div class="evCard th-${l.id} ${off ? 'off' : ''}" style="--la:${l.c1};--lb:${l.c2}"><button class="evMain" data-ev="${l.id}"><span class="lvRib ${rb.cls}">${rb.t}</span><span class="evIc">${ART.ic(l.icon)}</span><span class="evTx"><small>${l.period} · ${l.arena}</small><b>${l.name}</b><span>${l.tag}</span>${extra}</span>
        <span class="evR"><em class="evTime">${ART.ic('clock')} ${UI.left(l.end())}</em><i>${off ? 'Done' : sv.max ? sv.left + '/' + sv.max : sv.left + ' left'}</i></span></button><button class="evInfo" data-act="rules:${l.id}">${ART.ic('info')}</button></div>`;
    }).join('');
    const dc = s.daily.done;
    const fc = fs ? (fs.live ? `<button class="festCard" data-act="ev:fest:${fs.f.id}" style="--la:${fs.f.theme[0]};--lb:${fs.f.theme[1]}"><span class="lvRib fest">FESTIVAL · ${UI.left(fs.end)} LEFT</span><span class="fcIc">${ART.ic(fs.f.icon)}</span><span class="evTx"><small>${fs.f.fest.toUpperCase()}</small><b>${fs.f.name}</b><span>${fs.f.tag}</span></span>${ART.ic('next')}</button>`
      : `<div class="festCard soon" style="--la:${fs.f.theme[0]};--lb:${fs.f.theme[1]}"><span class="fcIc">${ART.ic(fs.f.icon)}</span><span class="evTx"><small>COMING SOON · ${fs.f.fest.toUpperCase()}</small><b>${fs.f.name}</b><span>Starts in ${UI.left(fs.start)} · win the ${D.skin(fs.f.skin).name} skin</span></span><button class="evInfo" data-act="rules:${fs.f.id}">${ART.ic('info')}</button></div>`) : '';
    const evL = !S.feat('events');
    $('events').innerHTML = `${UI.topbar()}<div class="pgT">Events <span class="pgSub">${evL ? ART.ic('lock') + ' Level ' + D.UNLOCK.events.lv : badgeCount() + ' live'}</span></div><div class="pgBody ${evL ? 'evLocked' : ''}">
      ${evL ? `<div class="nextUnl big">${ART.ic('lock')}<span><b>All events unlock at Level ${D.UNLOCK.events.lv}</b><small>Daily Beat is open for everyone · play it now!</small></span></div>` : ''}
      ${fc}
      ${(() => { const db = S.dbeatToday(); return `${db.lost && !db.done ? `<button class="saveStreak" data-act="dbSave">${ART.ic('fire')}<span><b>Your ${db.lost}-day Daily Beat streak broke!</b><small>Watch an ad to save it</small></span><em>${ART.ic('ad')} SAVE</em></button>` : ''}<div class="dailyRow"><button class="dailyCard ${db.done ? 'off' : ''}" data-act="dbeat"><div class="dcL"><small>DAILY BEAT #${db.no}</small><b>${db.done ? `You ${db.score} · Sanx ${D.sanxScore(db.no)}` : 'Same pattern for the whole world'}</b><span>${db.done ? 'New pattern at midnight' : `Sanx got ${D.sanxScore(db.no)} today. One try.`}</span></div><div class="dcR">${db.done ? ART.ic('check') : ART.ic('play')}</div></button><button class="evInfo" data-act="rules:daily">${ART.ic('info')}</button></div>`; })()}
      ${cards}
      <div class="secT">Arena <span class="muted">Premium daily challenges</span></div>
      ${!S.feat('arena') ? `<div class="nextUnl big">${ART.ic('lock')}<span><b>5 Arena events</b><small>unlock at Level ${D.UNLOCK.arena.lv}</small></span></div>` : ''}
      <div class="arenaGrid" style="${S.feat('arena') ? '' : 'display:none'}">${D.ARENA.map(a => { const left = arenaLeft(a.id), e = AR(a.id); return `<button class="arCard ${left <= 0 ? 'off' : ''}" data-act="ev:arena:${a.id}"><span class="arIc">${ART.ic(a.icon)}</span><b>${a.name}</b><small>${a.tag}</small><em>${left > 0 ? left + ' tries' : 'Done'} · best ${e.best || 0}</em></button>`; }).join('')}</div></div>`;
  }

  /* ---------- DAILY ---------- */
  function seedRnd(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
  const dailyMode = () => ['classic', 'reverse', 'classic', 'focus', 'classic', 'reverse', 'speed'][new Date().getDay()];
  function dailySeq() { const r = seedRnd(+S.dayKey().replace(/\D/g, '') * 7); const n = 7 + Math.floor(r() * 3); return Array.from({ length: n }, () => Math.floor(r() * 9)); }
  function daily() { UI.dbeat(false); }

  /* ---------- generic event screen (themed arena) ---------- */
  function screen(l, inner) {
    $('event').innerHTML = `<div class="arenaBg th-${l.id}" style="--la:${l.c1};--lb:${l.c2}"><i></i><i></i><i></i></div><div class="evTop"><button class="iconBtn" data-go="events">${ART.ic('back')}</button><div><small>${l.period} EVENT · ${(l.arena || '').toUpperCase()}</small><b>${l.name}</b></div><button class="rulesBtn" data-act="rules:${l.id}">${ART.ic('info')} Rules</button></div><div class="evTime2">${ART.ic('clock')} ${UI.left(l.end())} left</div><div class="evBody">${inner}</div>`;
    UI.show('event'); ADS.banner(true); SND.music(true);
  }
  /* "no tries left" → watch an ad for one more (once per event per day) */
  const goBtn = (id, left, label, act, cls = '') => left > 0 ? `<button class="btn big pulse ${cls}" data-act="ev:${act}">${label}</button>`
    : bonus(id) < D.ADCAP.extraTry ? `<button class="btn big alt pulse" data-act="ev:extra:${id}">${ART.ic('ad')} WATCH AD · +1 TRY</button>` : `<button class="btn big off">No tries left · back tomorrow</button>`;
  const board = (rows, meScore, label = 'Best') => {
    const all = rows.map(r => ({ ...r, ai: true })).concat([{ name: st().name, score: meScore, me: true }]).sort((a, b) => b.score - a.score);
    return `<div class="secT">Leaderboard <span class="muted">You vs AI</span></div><div class="lbList">${all.map((r, i) => `<div class="lbRow ${r.me ? 'me' : ''} ${i < 3 ? 'top' + (i + 1) : ''}"><span class="lbN">${i + 1}</span><span class="lbName">${UI.esc(r.name)} ${r.ai ? '<em class="aiTag">AI</em>' : '<em class="youTag">YOU</em>'}</span><b>${fmt(r.score)}</b></div>`).join('')}</div>`;
  };
  const aiRows = (seedKey, n, top, low) => { const r = seedRnd([...seedKey].reduce((a, c) => a * 31 + c.charCodeAt(0), 7)); return Array.from({ length: n }, (_, i) => ({ name: D.AI_NAMES[Math.floor(r() * D.AI_NAMES.length)] + (i > 7 ? i : ''), score: Math.min(Math.round(top), Math.round(low + (top - low) * Math.pow(1 - i / n, 1.6) * (0.85 + r() * 0.15))) })).sort((a, b) => b.score - a.score); };
  const rwRow = (ok, claimed, label, sub, rw, key) => `<div class="rwRow ${claimed ? 'claimed' : ok ? 'ready' : ''}"><div><b>${label}</b><small>${sub}</small></div>${claimed ? ART.ic('check') : ok ? `<button class="btn sm pulse" data-act="ev:claim:${key}">${rw}</button>` : `<span>${rw}</span>`}</div>`;
  const rwTxt = r => [r.coins ? ART.coin(13) + fmt(r.coins) : '', r.gems ? ART.gem(13) + r.gems : '', r.shields ? ART.shieldC(13) + r.shields : '', r.skin ? 'Skin' : ''].filter(Boolean).join(' ');

  function open(id) {
    if (typeof id === 'object') id = id.id;
    if (String(id).startsWith('ar:')) return openArena(id.slice(3));
    if (D.FESTS.find(f => f.id === id)) return openFest(id);
    curEv = id;
    ({ bts: openBTS, champ: openChamp, oma: openOMA, bco: openBCO, tour: openTour, mania: openMania })[id]();
  }
  const evStart = (cfg) => { S.passAdd('event'); S.st.stats.evRuns = (S.st.stats.evRuns || 0) + 1; G.start(cfg); };

  /* ===== 1. BEAT THE SANX ===== */
  let btsTier = 0, btsIns = false;
  function openBTS() {
    const e = bts(), l = L('bts'), left = status('bts').left;
    const sb = [...D.BTS.streak].reverse().find(x => e.streak >= x.n);
    const tiers = D.BTS.tiers.map((t, i) => {
      const lock = e.wins < t.unlock;
      return `<button class="btsTier ${i === btsTier ? 'sel' : ''} ${lock ? 'locked' : ''}" data-act="ev:btsTier:${i}"><b>${t.tiles}<small>tiles</small></b><span>${ART.ic('clock')} ${Math.floor(t.secs / 60)}:${String(t.secs % 60).padStart(2, '0')}</span><span>Bet ${ART.coin(12)}${fmt(t.entry)}</span><em>${lock ? ART.ic('lock') + ` ${t.unlock} wins` : `Win ${ART.coin(12)}${fmt(Math.round(t.reward * (sb ? sb.m : 1)))}`}</em></button>`;
    }).join('');
    const t = D.BTS.tiers[btsTier], cost = btsIns ? Math.round(t.entry * (1 + D.BTS.insurance)) : t.entry;
    screen(l, `<div class="evHero sanxHero ring"><div class="ehSanx">${ART.sanx('angry')}</div><div class="heroBubble">${pick(['You think you can beat me?', 'Every round you fail, I keep your coins.', 'I dare you to pick 12.', 'Your coins are safe... until they\'re not.'])}</div></div>
      <div class="evStats"><div><b>${Math.max(0, left)}/${D.BTS.attempts}</b><small>Attempts today</small></div><div><b>${e.streak}</b><small>Win streak${sb ? ` · ×${sb.m}` : ''}</small></div><div><b>${e.wins}</b><small>Total wins</small></div></div>
      <div class="secT">Pick your challenge</div><div class="btsGrid">${tiers}</div>
      <button class="insRow ${btsIns ? 'on' : ''}" data-act="ev:btsIns">${ART.shieldC(20)}<span><b>Coin insurance</b><small>+30% bet · get 50% back if you lose</small></span><i class="sw ${btsIns ? 'on' : ''}"></i></button>
      ${goBtn('bts', left, `${ART.ic('swords')} FIGHT · Bet ${fmt(cost)}`, 'btsGo', 'danger')}
      <div class="evNote">Remember a ${t.tiles}-tile Classic pattern before the timer ends. Starts at 2 tiles, +1 every round. 3 hearts. No revives. ${ART.ic('ad')} Running out of time? +30 seconds once with an ad.</div>`);
  }
  function btsGo() {
    const e = bts(), t = D.BTS.tiers[btsTier];
    if (status('bts').left <= 0) return UI.toast('No attempts left today', 'clock');
    if (e.wins < t.unlock) return UI.toast(`Win ${t.unlock} times to unlock`, 'lock');
    const cost = btsIns ? Math.round(t.entry * (1 + D.BTS.insurance)) : t.entry;
    if (!NET.gate()) return;
    if (!S.spend('coins', cost)) return UI.toast('Not enough coins', 'coins');
    e.att++; S.save(); S.quest('event');
    const ins = btsIns; let fired = {};
    evStart({ mode: 'classic', ev: {
      id: 'bts', name: 'BEAT THE SANX', icon: 'skull', title: `Reach ${t.tiles} tiles`, hearts: 3, timer: t.secs, timerRunsAlways: true, noRevive: true, boss: false, timeAd: true, theme: [L('bts').c1, L('bts').c2],
      onStep: R => { G.info(`${R.maxLen} / ${t.tiles} tiles`); return R.maxLen >= t.tiles ? 'win' : null; },
      onTick: R => {
        const half = t.secs / 2;
        if (!fired.h && R.timeLeft < half) { fired.h = 1; G.say(pick(['Halfway... sweating yet?', 'Not bad. I\'ve seen better.', 'Tick tock.']), 'smug'); }
        if (!fired.m && R.timeLeft < 60 && t.secs > 90) { fired.m = 1; G.say('Last 60 seconds. Crack!', 'angry'); }
        if (!fired.f && R.timeLeft < 10) { fired.f = 1; G.say('10 seconds. DO. NOT. BLINK.', 'angry'); }
      },
      onEnd: r => {
        const sb = [...D.BTS.streak].reverse().find(x => e.streak + (r.won ? 1 : 0) >= x.n);
        let msg, g = {};
        if (r.won) { e.streak++; e.wins++; st().stats.btsWins++; g.coins = Math.round(t.reward * (sb ? sb.m : 1)); S.grant(g); msg = pick(['I didn\'t think you had it. Well played.', 'Beginner\'s luck. Come back tomorrow.', 'Fine. You earned it. This time.']); }
        else { e.streak = 0; if (ins) { g.coins = Math.round(t.entry * D.BTS.refund); S.grant(g); } msg = pick(['Your coins are mine now.', 'Did you really think you could beat me?', 'So close. Too bad.']); }
        S.save(); S.checkAch();
        result({ won: r.won, mood: r.won ? 'shock' : 'laugh', title: r.won ? 'SANX BEATEN!' : r.why === 'time' ? 'TIME UP' : 'SANX WINS', big: `${r.tiles}/${t.tiles}`, sub: 'tiles', line: msg, g, refund: !r.won && ins, id: 'bts' });
      }
    } });
  }

  /* ===== 2. BEAT THE CHAMPION ===== */
  function btcScore(r) { return Math.round(Math.pow(r.tiles, 2) * 110 * Math.min(3, 1 + r.maxCombo / 8) * acc(r) * (1 + 0.08 * r.prestige)); }
  function openChamp() {
    const e = btc(), c = champ(), l = L('champ'), left = status('champ').left, gap = c.score - e.best;
    const prox = e.throne ? 'Throne taken. You are the champion!' : e.best ? (gap / c.score <= 0.05 ? `Only ${fmt(gap)} points behind!` : `${fmt(gap)} points to dethrone`) : 'Make your first attempt';
    const rws = D.BTC.rewards.map((w, i) => rwRow(e.best >= c.score * w.pct, e.claimed.includes(i), w.label, `Score ${fmt(Math.round(c.score * w.pct))}+`, `${ART.coin(13)}${fmt(w.coins)}`, 'btc:' + i)).join('')
      + rwRow(e.best >= c.score, false, 'Dethrone', `Beat ${c.name} · then Champion ${D.ROMAN[(e.lvl || 0) + 2]} arrives`, `${ART.coin(13)}${fmt(bounty())} ${ART.shieldC(13)}2`, 'btc:throne');
    screen(l, `<div class="champCard"><div class="chCrown">${ART.ic('crown')}</div><div class="chName">${c.name} <em class="aiTag">AI</em></div><div class="chLine">"${c.line}"</div><div class="chScore">${fmt(c.score)}<small>points · reached ${c.tiles} tiles · ${D.MODE[c.mode].name}</small></div><div class="chLad">${[0, 1, 2, 3, 4].map(i => `<i class="${i < (e.lvl || 0) ? 'down' : i === (e.lvl || 0) ? 'now' : ''}">${D.ROMAN[i + 1]}</i>`).join('')}</div></div>
      <div class="evStats"><div><b>${fmt(e.best)}</b><small>Your best</small></div><div><b>${Math.max(0, left)}/${D.BTC.attempts}</b><small>Tries today</small></div><div><b>${fmt(bounty())}</b><small>Bounty (grows daily)</small></div></div>
      <div class="prox">${ART.ic('target')} ${prox}</div>
      ${goBtn('champ', left, `${ART.ic('swords')} CHALLENGE · ${D.MODE[c.mode].name}`, 'champGo')}
      <div class="secT">Weekly rewards</div>${rws}
      ${board(aiRows(e.wk + 'c', 6, c.score * 0.97, c.score * 0.35).concat([{ name: c.name + ' (Champion)', score: c.score }]), e.best)}`);
  }
  function champGo() {
    const e = btc(), c = champ();
    if (status('champ').left <= 0) return UI.toast('No tries left today', 'clock');
    if (!NET.gate()) return;
    e.att++; S.save(); S.quest('event');
    evStart({ mode: c.mode, ev: { id: 'champ', name: 'BEAT THE CHAMPION', icon: 'crown', title: `Beat ${fmt(c.score)} · ${c.tiles} tiles`, hearts: 3, noRevive: false, startLevel: 1, theme: [L('champ').c1, L('champ').c2],
      onEnd: r => { const sc = btcScore(r), pb = sc > e.best; if (pb) e.best = sc; if (sc >= c.score) e.throne = true; S.save();
        result({ won: sc >= c.score, mood: sc >= c.score ? 'shock' : 'smug', title: sc >= c.score ? 'NEW CHAMPION!' : pb ? 'NEW PERSONAL BEST' : 'TRY AGAIN', big: fmt(sc), sub: 'points', line: sc >= c.score ? `${c.name} has been dethroned!` : `${fmt(Math.max(0, c.score - sc))} points short of ${c.name}`, id: 'champ' }); } } });
  }

  /* ===== 3. ONE MAN ARMY ===== */
  function omaScore(r, beaten) { return Math.round(Math.pow(r.tiles, 2) * 50 * (1 + beaten * 0.6) * Math.min(2.5, 1 + r.maxCombo / 10)) + r.perfect * 200; }
  const OMA_RANKS = ['Recruit', 'Soldier', 'Sergeant', 'Lieutenant', 'Colonel', 'General'];
  const OMA_RW = [{ coins: 50 }, { coins: 150 }, { coins: 300, shields: 1 }, { coins: 600 }, { coins: 1200, xp: 500 }, { coins: 3000, shields: 2, xp: 1000 }];
  function openOMA() {
    const e = oma(), l = L('oma'), left = status('oma').left;
    const sold = D.OMA.rivals.map((r, i) => `<div class="soldier ${i < e.beaten ? 'down' : ''}"><span>${ART.ic(i < e.beaten ? 'x' : 'army')}</span><b>${r.name} <em class="aiTag">AI</em></b><small>Clear a ${r.at}-tile pattern · ${ART.coin(11)}${r.bounty}</small></div>`).join('');
    const rws = OMA_RANKS.map((n, i) => rwRow(e.att > 0 && e.beaten >= i, e.claimed.includes(i), n, i ? `Eliminate ${i} soldier${i > 1 ? 's' : ''}` : 'Enter the event', rwTxt(OMA_RW[i]), 'oma:' + i)).join('');
    screen(l, `<div class="evStats"><div><b>${OMA_RANKS[e.beaten]}</b><small>Your rank</small></div><div><b>${fmt(e.best)}</b><small>Best score</small></div><div><b>${Math.max(0, left)}/${D.OMA.attempts}</b><small>Attempts this week</small></div></div>
      <div class="secT">AI soldiers</div><div class="soldiers">${sold}</div>
      ${goBtn('oma', left, `${ART.ic('army')} DEPLOY`, 'omaGo')}
      <div class="evNote">Classic ladder: starts at 2 tiles, +1 every round · 3 hearts · Every ${D.OMA.suddenEvery}th tile length is SUDDEN DEATH (1 heart).</div>
      <div class="secT">Rank rewards</div>${rws}
      ${board(aiRows(e.wk + 'o', 7, 280000, 30000), e.best)}`);
  }
  function omaGo() {
    const e = oma(); if (status('oma').left <= 0) return UI.toast('No attempts left this week', 'clock');
    if (!NET.gate()) return;
    e.att++; S.save(); S.quest('event'); let down = 0;
    evStart({ mode: 'classic', ev: { id: 'oma', name: 'ONE MAN ARMY', icon: 'army', title: 'Survive', hearts: 3, noRevive: true, boss: false, startLevel: 1, theme: [L('oma').c1, L('oma').c2],
      sudden: R => R.seq.length % D.OMA.suddenEvery === 0,
      onStep: R => { const r = D.OMA.rivals[down]; if (r && R.maxLen >= r.at) { down++; S.grant({ coins: r.bounty }); G.info(`${r.name} eliminated! +${r.bounty}`); } },
      onEnd: r => { e.beaten = Math.max(e.beaten, down); const sc = omaScore(r, down); if (sc > e.best) e.best = sc; S.save();
        result({ won: down > 0, mood: down >= 3 ? 'shock' : 'laugh', title: down === 5 ? 'LAST MAN STANDING' : `${down} ELIMINATED`, big: fmt(sc), sub: 'points', line: `Longest pattern: ${r.tiles} tiles`, id: 'oma' }); } } });
  }

  /* ===== 4. BEAT THE COINS ===== */
  function bcoCoins(r, tierMult, jackpot) { const e = bco(); const sm = e.streak >= 7 ? 2 : e.streak >= 5 ? 1.7 : e.streak >= 3 ? 1.4 : e.streak >= 2 ? 1.2 : 1; return Math.round(r.tiles * r.tiles * 8 * Math.min(2.5, 1 + r.maxCombo / 10) * Math.max(0.7, acc(r)) * sm * tierMult * (jackpot ? 2 : 1) * (lastHour() ? 1.5 : 1) * (1 + 0.05 * r.prestige)); }
  function openBCO() {
    const e = bco(), l = L('bco'), left = status('bco').left;
    const tiers = D.BCOINS.tiers.map((t, i) => rwRow(e.best >= t.at, e.claimed.includes(i), t.name, `Raid ${fmt(t.at)} coins in one run`, `${ART.coin(13)}${fmt(t.reward)}`, 'bco:' + i)).join('');
    const next = D.BCOINS.tiers.find(t => e.best < t.at);
    screen(l, `<div class="vaultHero"><div class="vaultDoor">${ART.ic('vault')}</div><b>${fmt(e.best)}</b><small>Best raid today</small>${next ? `<div class="bar"><i style="width:${Math.min(100, e.best / next.at * 100)}%"></i></div><small>${fmt(next.at - e.best)} to ${next.name}</small>` : '<small>Diamond tier reached!</small>'}</div>
      <div class="evStats"><div><b>${Math.max(0, left)}/5</b><small>Raids today</small></div><div><b>${e.streak || 0}d</b><small>Daily streak</small></div><div><b>${lastHour() ? '×1.5' : '—'}</b><small>Last hour rush</small></div></div>
      ${goBtn('bco', left, `${ART.ic('vault')} RAID THE VAULT`, 'bcoGo')}
      <div class="evNote">Hit a 15 combo for the JACKPOT (×2). Play every day for a streak bonus.</div>
      <div class="secT">Tier rewards</div>${tiers}
      ${board(aiRows(e.day + 'b', 6, 8200, 800), e.best)}`);
  }
  function bcoGo() {
    const e = bco(); if (status('bco').left <= 0) return UI.toast('No raids left today', 'clock');
    if (!NET.gate()) return;
    e.att++; e.played = S.dayKey(); S.save(); S.quest('event');
    evStart({ mode: 'classic', ev: { id: 'bco', name: 'BEAT THE COINS', icon: 'vault', title: 'Vault raid', hearts: 3, noRevive: false, startLevel: 1, theme: [L('bco').c1, L('bco').c2],
      onLevel: R => { const room = [...D.BCOINS.rooms].reverse().find(x => R.levelsDone + 1 >= x.at); G.info(`Entering: ${room.n}`); },
      onEnd: r => { const jack = r.maxCombo >= 15, tier = [...D.BCOINS.tiers].reverse().find(t => e.best >= t.at); const c = bcoCoins(r, tier ? tier.mult : 1, jack); S.grant({ coins: c }); if (c > e.best) e.best = c; S.save();
        result({ won: true, mood: c > 1500 ? 'shock' : 'smug', title: jack ? 'JACKPOT RAID!' : 'RAID COMPLETE', big: fmt(c), sub: 'coins raided', line: `Longest pattern: ${r.tiles} tiles`, g: { coins: c }, id: 'bco' }); } } });
  }

  /* ===== 5. WORLD FLASH TOUR ===== */
  let tourStage = 1, tourMode = null;
  function tourScore(r, stg, sg) { return Math.round(Math.pow(r.tiles, 2) * 120 * Math.min(3, 1 + r.maxCombo / 8) * acc(r) * stg.mult * (1 + 0.08 * r.prestige) * (sg ? D.TOUR.surgeMult : 1)); }
  function openTour() {
    const e = tour(), l = L('tour'), w = weekOfMonth(), sg = surge();
    if (D.TOUR.stages.find(s => s.id === tourStage).week > w) tourStage = 1;
    const stg = D.TOUR.stages.find(s => s.id === tourStage);
    const modes = (stg.modes.length ? stg.modes : D.MODES.map(m => m.id)).filter(m => S.unlocked(m));
    if (!tourMode || !modes.includes(tourMode)) tourMode = modes[0] || 'classic';
    const stages = D.TOUR.stages.map(s => { const lock = s.week > w, best = e.best[s.id] || 0, done = best >= s.goal; return `<button class="stage ${s.id === tourStage ? 'sel' : ''} ${lock ? 'locked' : ''} ${done ? 'done' : ''}" data-act="ev:tourStage:${s.id}"><small>GRID ${s.id}</small><b>${s.name}</b><span>${lock ? ART.ic('lock') + ` Week ${s.week}` : done ? ART.ic('check') + ' Cleared' : `×${s.mult}`}</span></button>`; }).join('');
    const left = stg.attempts + bonus('tour') - (e.att[stg.id] || 0);
    const rw = D.TOUR.stages.map((s, i) => rwRow((e.best[s.id] || 0) >= s.goal, e.claimed.includes(i), `Clear Grid ${s.id}`, `Score ${fmt(s.goal)}+ on ${s.name}`, `${ART.coin(13)}${fmt(D.TOUR.rewards[i + 1])}`, 'tour:' + i)).join('');
    screen(l, `<div class="globeHero">${ART.ic('globe')}</div><div class="surge ${sg.on ? 'on' : ''}">${ART.ic('zap')} ${sg.on ? `FLASH SURGE LIVE · ×3 points · ${Math.ceil(sg.left / 60)}m left` : `Next Flash Surge (×3) in ${Math.floor(sg.in / 3600)}h ${Math.floor(sg.in % 3600 / 60)}m`}</div>
      <div class="stages">${stages}</div>
      <div class="secT">${stg.name} · pick a mode</div>
      <div class="tourModes">${modes.map(m => `<button class="${m === tourMode ? 'sel' : ''}" data-act="ev:tourMode:${m}">${ART.ic(D.MODE[m].icon)}${D.MODE[m].name}</button>`).join('') || '<div class="evNote">Unlock these modes first</div>'}</div>
      <div class="evStats"><div><b>${fmt(e.best[stg.id] || 0)}</b><small>Best on this grid</small></div><div><b>${fmt(stg.goal)}</b><small>Goal</small></div><div><b>${Math.max(0, left)}/${stg.attempts}</b><small>Tries this month</small></div></div>
      ${modes.length ? goBtn('tour', left, `${ART.ic('globe')} PLAY GRID ${stg.id}`, 'tourGo') : ''}
      <div class="secT">Grid rewards</div>${rw}
      ${board(aiRows(e.m + 't' + stg.id, 7, stg.goal * 2.2, stg.goal * 0.3), e.best[stg.id] || 0)}`);
  }
  function tourGo() {
    const e = tour(), stg = D.TOUR.stages.find(s => s.id === tourStage), used = e.att[stg.id] || 0;
    if (used >= stg.attempts + bonus('tour')) return UI.toast('No tries left on this grid', 'clock');
    if (!NET.gate()) return;
    e.att[stg.id] = used + 1; S.save(); S.quest('event');
    const sg = surge().on;
    evStart({ mode: tourMode, ev: { id: 'tour', name: 'WORLD FLASH TOUR', icon: 'globe', title: `Grid ${stg.id} · ${stg.name}`, hearts: 3, startLevel: 1, theme: [L('tour').c1, L('tour').c2],
      onEnd: r => { const sc = tourScore(r, stg, sg), pb = sc > (e.best[stg.id] || 0); if (pb) e.best[stg.id] = sc; S.save();
        result({ won: sc >= stg.goal, mood: sc >= stg.goal ? 'shock' : 'smug', title: sc >= stg.goal ? 'GRID CLEARED!' : pb ? 'NEW BEST' : 'KEEP PUSHING', big: fmt(sc), sub: 'points' + (sg ? ' · surge ×3' : ''), line: `Goal: ${fmt(stg.goal)}`, id: 'tour' }); } } });
  }

  /* ===== 6. SANX MANIA ===== */
  let maniaMode = 'classic';
  function maniaScore(r, ph) { return Math.round(Math.pow(r.tiles, 2) * 90 * Math.min(3, 1 + r.maxCombo / 8) * acc(r) * ph.mult); }
  function openMania() {
    const e = mania(), l = L('mania'), ph = maniaPhase(), left = status('mania').left;
    const modes = D.MODES.filter(m => S.unlocked(m.id) && m.id !== 'zen' && m.id !== 'blitz');
    if (!modes.find(m => m.id === maniaMode)) maniaMode = 'classic';
    const phs = D.MANIA.phases.map(p => `<div class="phase ${p.id === ph.id ? 'on' : ''}"><b>${p.name}</b><small>×${p.mult} points</small></div>`).join('');
    const ms = D.MANIA.milestones.map((m, i) => rwRow(e.best >= m.s, e.claimed.includes(i), `${fmt(m.s)} points`, i === 4 ? 'Unlock the Sanx Purple skin' : 'Monthly milestone', rwTxt(m), 'mania:' + i)).join('');
    const divs = D.MANIA.divisions, cur = [...divs].reverse().find(d => e.best >= d.at), nx = divs[divs.indexOf(cur) + 1];
    screen(l, `<div class="divCard"><small>DIVISION LEAGUE</small><b>${cur.name}</b><div class="divRow">${divs.map(d => `<i class="${d === cur ? 'now' : e.best >= d.at ? 'got' : ''}">${d.name.split(' ')[0]}</i>`).join('')}</div>${nx ? `<div class="bar"><i style="width:${Math.min(100, (e.best - cur.at) / (nx.at - cur.at) * 100)}%"></i></div><span>${fmt(nx.at - e.best)} points to ${nx.name}</span>` : '<span>Top division!</span>'}<em>Month-end reward: ${rwTxt(cur.reward)}</em></div>
      <div class="phases">${phs}</div>
      <div class="evStats"><div><b>${fmt(e.best)}</b><small>Best this month</small></div><div><b>×${ph.mult}</b><small>${ph.name}</small></div><div><b>${Math.max(0, left)}/5</b><small>Tries today</small></div></div>
      <div class="tourModes">${modes.map(m => `<button class="${m.id === maniaMode ? 'sel' : ''}" data-act="ev:maniaMode:${m.id}">${ART.ic(m.icon)}${m.name}</button>`).join('')}</div>
      ${goBtn('mania', left, `${ART.ic('flame')} PLAY MANIA`, 'maniaGo')}
      <div class="secT">Milestones</div>${ms}
      ${board(aiRows(e.m + 'm', 7, 150000, 12000), e.best)}`);
  }
  function maniaGo() {
    const e = mania(); if (status('mania').left <= 0) return UI.toast('No tries left today', 'clock');
    if (!NET.gate()) return;
    e.att++; S.save(); S.quest('event'); const ph = maniaPhase();
    evStart({ mode: maniaMode, ev: { id: 'mania', name: 'SANX MANIA', icon: 'flame', title: ph.name, hearts: 3, startLevel: 1, theme: [L('mania').c1, L('mania').c2],
      onEnd: r => { const sc = maniaScore(r, ph), pb = sc > e.best; if (pb) e.best = sc; S.save();
        result({ won: pb, mood: pb ? 'shock' : 'laugh', title: pb ? 'NEW MONTHLY BEST' : 'MANIA RUN', big: fmt(sc), sub: 'points', line: `${ph.name} · ×${ph.mult}`, id: 'mania' }); } } });
  }

  /* ================= ARENA ================= */
  let arenaCur = 'gauntlet';
  function openArena(id) {
    arenaCur = id; curEv = 'ar:' + id;
    const a = D.ARENA.find(x => x.id === id), e = AR(id), left = arenaLeft(id);
    const l = { id: 'ar_' + id, name: a.name, period: 'DAILY', arena: 'Arena', end: dayEnd, c1: '#743ae8', c2: '#14063a' };
    const rws = D.ARENA_RW.map((w, i) => rwRow(e.best >= w.t, e.claimed.includes(i), `${w.t} tiles`, 'Longest pattern today', rwTxt(w), 'ar:' + id + ':' + i)).join('');
    screen(l, `<div class="festHero" style="--la:#743ae8;--lb:#2b0e6b"><span class="fhIc">${ART.ic(a.icon)}</span><b>${a.name}</b><small>${a.tag}</small></div>
      <div class="evStats"><div><b>${e.best || 0}</b><small>Best today (tiles)</small></div><div><b>${Math.max(0, left)}/${D.ARENA_TRIES}</b><small>Tries today</small></div><div><b>${a.hearts}</b><small>Hearts</small></div></div>
      ${left > 0 ? `<button class="btn big pulse" data-act="ev:arenaGo:${id}">${ART.ic('play')} PLAY ${a.name.toUpperCase()}</button>` : bonus('ar_' + id) < D.ADCAP.extraTry ? `<button class="btn big alt pulse" data-act="ev:extra:ar_${id}">${ART.ic('ad')} WATCH AD · +1 TRY</button>` : `<button class="btn big off">No tries left · back tomorrow</button>`}
      <div class="secT">Rewards today</div>${rws}
      <div class="secT">Rules</div><ol class="rlList">${a.rules.map(r => `<li>${r}</li>`).join('')}</ol>`);
    $('event').querySelector('.rulesBtn').style.display = 'none';
  }
  function arenaGo(id) {
    const a = D.ARENA.find(x => x.id === id), e = AR(id);
    if (arenaLeft(id) <= 0) return UI.toast('No tries left today', 'clock');
    if (!NET.gate()) return;
    e.att++; S.save(); S.quest('event');
    const ev = { id: 'ar_' + id, name: a.name.toUpperCase(), icon: a.icon, title: a.tag, hearts: a.hearts, noRevive: id !== 'tower', maxAdRevive: id === 'tower' ? 1 : 0, boss: false, theme: ['#743ae8', '#14063a'] };
    let mode = 'classic', floor = 0;
    if (id === 'gauntlet') { const cyc = ['classic', 'reverse', 'chaos', 'ghost', 'negative', 'speed']; ev.modeAtRound = i => cyc[Math.floor(i / 3) % cyc.length]; }
    if (id === 'tower') ev.onStep = R => { const f = Math.floor(R.maxLen / 2); if (f > floor) { floor = f; const c = 40 * f; S.grant({ coins: c }); G.info(`Floor ${f}! +${c} coins`); } };
    if (id === 'speedrun') { mode = 'speed'; ev.stepTimer = true; }
    if (id === 'bossrush') { ev.speed = D.BOSS_SPEED; ev.coinMult = 3; }
    if (id === 'roulette') { const pool = D.MODES.filter(m => S.unlocked(m.id) && !['twin', 'blitz', 'zen'].includes(m.id)).map(m => m.id); ev.modeAtRound = () => pool[Math.floor(Math.random() * pool.length)]; }
    ev.onEnd = r => { const pb = r.tiles > (e.best || 0); if (pb) e.best = r.tiles; S.save();
      result({ won: pb, mood: pb ? 'shock' : 'laugh', title: pb ? 'NEW BEST TODAY' : a.name.toUpperCase(), big: r.tiles, sub: 'tiles', line: id === 'tower' ? `You reached floor ${floor}` : `${r.steps} rounds cleared`, id: 'ar:' + id }); };
    evStart({ mode, ev });
  }

  /* ================= FESTIVAL EVENTS ================= */
  function openFest(id) {
    const f = D.FESTS.find(x => x.id === id), cur = fest();
    const fs = cur && cur.f.id === id ? cur : { f, start: D.festDate(f.from), end: D.festDate(f.to) + 864e5, live: false };
    const live = fs.live;
    curEv = id;
    const e = FS(id), tries = festTries(id), sk = D.skin(f.skin), own = st().skins.includes(f.skin);
    const l = { id: 'f_' + id, name: f.name, period: f.fest.toUpperCase(), arena: 'Festival', end: () => live ? fs.end : fs.start, c1: f.theme[0], c2: f.theme[1] };
    let prog = '';
    if (f.kind === 'collect' || f.kind === 'diya') {
      const ms = f.kind === 'diya' ? [25, 50, 75, 100] : [11, 21, 51];
      prog = `<div class="festProg"><b>${e.count}/${f.goal}</b><small>${f.kind === 'diya' ? 'diyas lit' : 'modaks collected'}</small><div class="bar"><i style="width:${Math.min(100, e.count / f.goal * 100)}%"></i></div></div>`
        + ms.map((m, i) => rwRow(e.count >= m, e.claimed.includes(i), `${m} ${f.kind === 'diya' ? 'diyas' : 'modaks'}`, m === f.goal ? `Unlock the ${sk.name} skin` : 'Milestone', m === f.goal ? `${ART.coin(13)}${fmt(f.reward.coins)} ${ART.gem(13)}${f.reward.gems}` : `${ART.coin(13)}${fmt(Math.round(f.reward.coins * (i + 1) / (ms.length * 2)))}`, 'fest:' + id + ':' + i)).join('');
    } else if (f.kind === 'nights') {
      const night = Math.max(0, Math.min(8, Math.floor((Date.now() - D.festDate(f.from)) / 864e5)));
      prog = `<div class="nights">${f.nights.map((m, i) => `<div class="night ${e.nights.includes(i) ? 'lit' : ''} ${i === night ? 'now' : ''} ${i > night ? 'locked' : ''}"><small>Night ${i + 1}</small>${ART.ic(D.MODE[m].icon)}<b>${D.MODE[m].name}</b></div>`).join('')}</div>
        <div class="evNote">Tonight: <b>Night ${night + 1} · ${D.MODE[f.nights[night]].name}</b>. Light all 9 nights for the mega prize.</div>`;
    } else if (f.kind === 'advent') {
      const day = Math.max(0, Math.min(10, Math.floor((Date.now() - D.festDate(f.from)) / 864e5)));
      prog = `<div class="advent">${Array.from({ length: 11 }, (_, i) => `<button class="adv ${e.advent.includes(i) ? 'got' : ''} ${i === day && !e.advent.includes(i) ? 'now' : ''} ${i > day ? 'locked' : ''}" data-act="${i === day && !e.advent.includes(i) && live ? 'ev:advent:' + i : 'none'}"><small>${15 + i}</small>${ART.ic(e.advent.includes(i) ? 'check' : 'gift')}</button>`).join('')}</div>`;
    }
    screen(l, `<div class="festHero" style="--la:${f.theme[0]};--lb:${f.theme[1]}"><span class="fhIc">${ART.ic(f.icon)}</span><b>${f.name}</b><small>${f.tag}</small></div>
      ${prog}
      <div class="festSkin">${'<div class="miniBoard">' + sk.colors.map((c, i) => `<span class="tile" style="--c:${c}"><span class="tFace">${ART.tileIc(sk.icons[i])}</span></span>`).join('') + '</div>'}<div><b>${sk.name} skin</b><small>${own ? 'Unlocked!' : 'Limited: only during ' + f.fest}</small></div>${own ? (st().skin === f.skin ? `<span class="eqTag">${ART.ic('check')}</span>` : `<button class="btn sm ghost" data-equip="skin:${f.skin}">Equip</button>`) : ART.ic('lock')}</div>
      <div class="evStats"><div><b>${Math.max(0, tries)}/3</b><small>Tries today</small></div><div><b>${e.won ? 'WON' : '—'}</b><small>Status</small></div><div><b>${live ? UI.left(fs.end) : Date.now() > fs.end ? 'Ended' : 'Soon'}</b><small>${live ? 'Time left' : Date.now() > fs.end ? 'Next year' : 'Starts in ' + UI.left(fs.start)}</small></div></div>
      ${live ? (tries > 0 ? `<button class="btn big pulse" data-act="ev:festGo:${id}">${ART.ic('play')} PLAY ${f.name.toUpperCase()}</button>` : bonus('f_' + id) < D.ADCAP.extraTry ? `<button class="btn big alt pulse" data-act="ev:extra:f_${id}">${ART.ic('ad')} WATCH AD · +1 TRY</button>` : `<button class="btn big off">No tries left · back tomorrow</button>`) : `<button class="btn big off">${Date.now() > fs.end ? 'Festival ended' : 'Starts in ' + UI.left(fs.start)}</button>`}
      <div class="secT">Rules</div><ol class="rlList">${f.rules.map(r => `<li>${r}</li>`).join('')}</ol>`);
    $('event').querySelector('.rulesBtn').dataset.act = 'rules:' + id;
  }
  function festGo(id) {
    const f = D.FESTS.find(x => x.id === id), e = FS(id);
    if (festTries(id) <= 0) return UI.toast('No tries left today', 'clock');
    if (!NET.gate()) return;
    e.att++; S.save(); S.quest('event');
    let n = 0;
    const night = Math.max(0, Math.min(8, Math.floor((Date.now() - D.festDate(f.from)) / 864e5)));
    const ev = { id: 'f_' + id, fid: id, name: f.name.toUpperCase(), icon: f.icon, title: f.fest, hearts: 3, noRevive: true, boss: false, startLevel: 1, skin: f.skin, theme: f.theme,
      ladder: ['speed', 'tri', 'marathon', 'collect', 'spooky'].includes(f.kind) ? false : undefined };
    const mode = f.kind === 'nights' ? f.nights[night] : f.mode;
    if (f.kind === 'kite') { ev.onStep = R => { n++; G.info(n >= f.goal ? 'Last kite cut!' : `Kite cut! ${n}/${f.goal}`); return n >= f.goal ? 'win' : null; }; ev.onWrong = () => G.info('Your kite got cut!'); }
    if (f.kind === 'tri') { ev.speedAt = lv => Math.pow(0.92, lv - 1); ev.onLevel = R => R.levelsDone >= f.goal ? 'win' : null; }
    if (f.kind === 'twin' || f.kind === 'duo') ev.onStep = R => { n += R.seq.length; G.info(`${Math.min(n, f.goal)}/${f.goal} pairs`); return n >= f.goal ? 'win' : null; };
    if (f.kind === 'ghost' || f.kind === 'advent' || f.kind === 'nights') ev.onStep = R => { n++; return n >= f.goal ? 'win' : null; };
    if (f.kind === 'holi') { ev.beforeShow = (R, paint) => paint(true); ev.onStep = R => { n++; G.info('Colors swapped!'); return n >= f.goal ? 'win' : null; }; }
    if (f.kind === 'marathon') { ev.noRevive = false; ev.maxAdRevive = 1; ev.onLevel = R => { if (R.levelsDone % 5 === 0) { S.grant({ coins: 150 }); G.info(`${R.levelsDone} levels! +150`); } return R.levelsDone >= f.goal ? 'win' : null; }; }
    if (f.kind === 'collect') { ev.noRevive = false; ev.onLevel = R => { const k = 1 + Math.floor(Math.random() * 3); e.count = Math.min(f.goal * 2, e.count + k); n += k; S.save(); G.info(`+${k} modak!`); }; }
    if (f.kind === 'diya') { ev.noRevive = false; ev.onStep = R => { e.count = Math.min(f.goal * 2, e.count + 1); n++; S.save(); }; }
    if (f.kind === 'spooky') { ev.modeAt = lv => lv % 2 ? 'ghost' : 'chaos'; ev.onLevel = R => R.levelsDone >= f.goal ? 'win' : null; }
    if (f.kind === 'speed') { ev.timer = f.secs; ev.timerRunsAlways = true; ev.timePenalty = true; ev.timeWin = true; ev.hearts = 0; }
    ev.onEnd = r => {
      let won = r.won;
      if (f.kind === 'speed') won = r.steps >= f.goal;
      if (f.kind === 'collect' || f.kind === 'diya') won = false;
      let g = {};
      if (won) {
        if (f.kind === 'nights') { if (!e.nights.includes(night)) e.nights.push(night); if (e.nights.length >= 9 && !e.won) { e.won = true; g = { ...f.reward }; delete g.chest; S.grant({ skin: f.skin }); g.skin = f.skin; } else g = { coins: 300 }; }
        else if (!e.won) { e.won = true; g = { coins: f.reward.coins, gems: f.reward.gems, skin: f.skin }; S.grant({ skin: f.skin }); }
        else g = { coins: Math.round(f.reward.coins * 0.2) };
        S.grant({ coins: g.coins, gems: g.gems });
      }
      S.save();
      const big = f.kind === 'collect' ? `+${n}` : f.kind === 'diya' ? `+${n}` : ['advent', 'ghost', 'holi', 'nights'].includes(f.kind) ? r.tiles : f.kind === 'speed' ? r.steps : f.kind === 'twin' || f.kind === 'duo' ? `${Math.min(n, f.goal)}/${f.goal}` : f.kind === 'kite' ? `${n}/${f.goal}` : r.levels;
      const sub = f.kind === 'collect' ? `modaks · total ${e.count}` : f.kind === 'diya' ? `diyas · total ${e.count}` : ['advent', 'ghost', 'holi', 'nights'].includes(f.kind) ? 'tiles' : f.kind === 'speed' ? 'steps' : f.kind === 'kite' ? 'kites cut' : f.kind === 'twin' || f.kind === 'duo' ? 'pairs' : 'levels';
      result({ won: won || f.kind === 'collect' || f.kind === 'diya', mood: won ? 'shock' : 'laugh', title: won ? (g.skin ? `${D.skin(f.skin).name.toUpperCase()} SKIN UNLOCKED!` : 'FESTIVAL WIN!') : f.kind === 'collect' || f.kind === 'diya' ? 'NICE RUN' : 'SO CLOSE', big, sub, line: f.tag, g, id: 'f_' + id, fest: id });
      if (g.skin) FX.win('fireworks');
    };
    evStart({ mode, ev });
  }

  /* ---------- result modal (+ post-run nudge) ---------- */
  function result(o) {
    SND[o.won ? 'win' : 'lose']();
    UI.show('event');
    const g = o.g && (o.g.coins || o.g.gems || o.g.skin) ? `<div class="rwItems">${UI.rwItems(o.g)}${o.refund ? '<div class="rwI"><small>insurance refund</small></div>' : ''}</div>` : '';
    const next = LIST.filter(l => l.id !== o.id && status(l.id).left > 0)[0];
    const sv = o.fest || String(o.id).startsWith('ar:') ? null : status(o.id);
    const nudge = sv && sv.left > 0 ? `<div class="nudge">${ART.ic('fire')} ${sv.left} ${sv.left === 1 ? 'try' : 'tries'} left · go again!</div>` : next ? `<button class="nudge" data-act="ev:goto:${next.id}">${ART.ic(next.icon)} Next: <b>${next.name}</b> ${ART.ic('next')}</button>` : '';
    UI.modal(`<div class="evRes"><div class="rwRays"></div><div class="erFace">${ART.sanx(o.mood)}</div><div class="mdK">${o.title}</div><div class="erBig"><span id="erN">${o.big}</span><small>${o.sub}</small></div><div class="mdS">${o.line}</div>${g}${nudge}
      <button class="btn big" data-act="ev:back">CONTINUE</button>${UI.clipBtn(G.last)}<button class="btn ghost" data-act="ev:share">${ART.ic('share')} Share</button></div>`, 'evResM');
    if (o.g && o.g.coins) setTimeout(() => FX.flyCoins(document.querySelector('.evRes .rwI')), 400);
    lastEv = o;
  }
  let lastEv = null;

  /* ---------- claims ---------- */
  function claim(key) {
    const [ev, i, j] = key.split(':'); let r = null;
    if (ev === 'btc') { const e = btc(), c = champ(); if (i !== 'throne' && e.claimed.includes(+i)) return; if (i === 'throne') { if (e.best < c.score) return; r = { coins: bounty(), shields: 2 }; e.lvl = (e.lvl || 0) + 1; e.tiles += D.BTC.ladderStep; e.best = 0; e.throne = false; S.save(); UI.toast(`Champion ${D.ROMAN[e.lvl + 1]} has arrived!`, 'crown'); } else { const w = D.BTC.rewards[+i]; if (e.best < c.score * w.pct) return; r = { coins: w.coins }; e.claimed.push(+i); } }
    if (ev === 'oma') { const e = oma(); if (e.claimed.includes(+i) || e.beaten < +i || !e.att) return; r = OMA_RW[+i]; e.claimed.push(+i); }
    if (ev === 'bco') { const e = bco(), t = D.BCOINS.tiers[+i]; if (e.claimed.includes(+i) || e.best < t.at) return; r = { coins: t.reward }; e.claimed.push(+i); }
    if (ev === 'tour') { const e = tour(), s = D.TOUR.stages[+i]; if (e.claimed.includes(+i) || (e.best[s.id] || 0) < s.goal) return; r = { coins: D.TOUR.rewards[+i + 1] }; e.claimed.push(+i); }
    if (ev === 'mania') { const e = mania(), m = D.MANIA.milestones[+i]; if (e.claimed.includes(+i) || e.best < m.s) return; r = m; e.claimed.push(+i); }
    if (ev === 'ar') { const e = AR(i), w = D.ARENA_RW[+j]; if (e.claimed.includes(+j) || e.best < w.t) return; e.claimed.push(+j); S.grant(w); S.save(); UI.reward(w, 'Arena reward'); openArena(i); return; }
    if (ev === 'fest') { const f = D.FESTS.find(x => x.id === i), e = FS(i), k = +j, ms = f.kind === 'diya' ? [25, 50, 75, 100] : [11, 21, 51]; if (e.claimed.includes(k) || e.count < ms[k]) return; e.claimed.push(k); r = ms[k] === f.goal ? { coins: f.reward.coins, gems: f.reward.gems, skin: f.skin } : { coins: Math.round(f.reward.coins * (k + 1) / (ms.length * 2)) }; if (r.skin) e.won = true; S.grant(r); S.save(); UI.reward(r, 'Festival reward'); openFest(i); return; }
    if (r) { S.grant(r); S.save(); UI.reward(r, 'Event reward'); open(curEv); }
  }
  async function extra(id) {
    if (bonus(id) >= D.ADCAP.extraTry) return UI.toast('Extra try used today', 'clock');
    if (!(await ADS.rewarded('extraTry'))) return;
    addBonus(id); UI.toast('+1 try!', 'check');
    if (id.startsWith('f_')) openFest(id.slice(2)); else if (id.startsWith('ar_')) openArena(id.slice(3)); else open(id);
  }
  async function advent(i) {
    const id = 'xmas', e = FS(id); if (e.advent.includes(+i)) return;
    e.advent.push(+i); S.save();
    const n = +i, r = n === 10 ? { coins: 1000, gems: 10 } : n % 3 === 2 ? { gems: 3 } : { coins: 150 + n * 30 };
    S.grant(r); UI.reward(r, `Gift ${n + 1} of 11`); openFest(id);
  }

  /* ---------- action router ---------- */
  function act(a) {
    const [k, v, w] = a.split(':');
    switch (k) {
      case 'btsTier': btsTier = +v; openBTS(); break;
      case 'btsIns': btsIns = !btsIns; openBTS(); break;
      case 'btsGo': btsGo(); break;
      case 'champGo': champGo(); break;
      case 'omaGo': omaGo(); break;
      case 'bcoGo': bcoGo(); break;
      case 'tourStage': if (D.TOUR.stages.find(s => s.id === +v).week > weekOfMonth()) { UI.toast('Unlocks later this month', 'lock'); break; } tourStage = +v; openTour(); break;
      case 'tourMode': tourMode = v; openTour(); break;
      case 'tourGo': tourGo(); break;
      case 'maniaMode': maniaMode = v; openMania(); break;
      case 'maniaGo': maniaGo(); break;
      case 'claim': claim(a.split(':').slice(1).join(':')); break;
      case 'extra': extra(v); break;
      case 'fest': openFest(v); break;
      case 'festGo': festGo(v); break;
      case 'advent': advent(v); break;
      case 'arena': openArena(v); break;
      case 'arenaGo': arenaGo(v); break;
      case 'goto': UI.closeModal(); open(v); break;
      case 'back': UI.closeModal(); ADS.inter('run').then(() => open(curEv)); break;
      case 'share': if (lastEv) SH.send('result', { k: lastEv.title, mood: lastEv.mood, big: String(lastEv.big).replace(/<[^>]+>/g, ''), sub: lastEv.sub, line: 'Beat that in Beat Sanx!' }, `🔥 ${lastEv.title}: ${String(lastEv.big).replace(/<[^>]+>/g, '')} ${lastEv.sub} on Beat Sanx! Can you beat it?`); break;
    }
  }

  return { renderHub, open, act, daily, badgeCount, LIST, fest, heroInfo, openHero, dayPopup, openFest };
})();

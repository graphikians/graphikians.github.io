/* ================= BEAT SANX — FRIEND DUELS (Duel Ladder) =================
   Duel Ladder: pattern starts at 2 tiles, +1 every round, 4x4 grid, 2 hearts.
   Score = longest pattern cleared. Tie -> fewer mistakes -> faster time.
   Both players get the same seeded pattern.
   Online (Firebase on): challenge saved on the server, friend's result settles it automatically,
     invites by player ID, random opponent = a real player's recorded run.
   Offline (no Firebase config): challenge travels as a signed code / link over WhatsApp,
     friend sends a result code back.
   Bet safety: the bet sits in Sanx Bank (escrow). No reply in 24 hours = FULL REFUND.
   Coins never move between players: Sanx Bank pays the winner.
   Limits: bet <= 10% of wallet and <= 1,000 · 5 duels per friend per day · level 10 to win coins. */
'use strict';
const CH = (() => {
  const $ = id => document.getElementById(id);
  const fmt = n => UI.fmt(n);
  const st = () => S.st;
  const SECRET = 'S4nx#Be4t!26·' + 'graphikians';
  const MODES = D.CHAL.modes;
  const now = () => Date.now();
  const H = 36e5;
  const LINK = 'https://graphikians.github.io/beat-sanx/c/?c=';
  let mkMode = 'classic', mkStake = 0, mkTo = '';

  /* ---------- code format (v2 = tiles) ---------- */
  const b64 = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unb64 = s => { try { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return decodeURIComponent(escape(atob(s))); } catch (e) { return ''; } };
  const sig = body => (G.hash(body, SECRET) >>> 0).toString(36).slice(0, 6).padStart(6, '0') + (G.hash(SECRET, body, 7) >>> 0).toString(36).slice(0, 3);
  const rid = () => { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 8; i++) s += A[Math.floor(Math.random() * A.length)]; return s; };
  function makeCode(c) { const body = ['C2', c.id, st().pid, MODES.indexOf(c.mode), (c.seed >>> 0).toString(36), c.tiles, c.stake, Math.floor(c.ts / 6e4).toString(36), b64(st().name), c.err || 0, Math.round(c.secs || 0), st().avatar || ''].join('.'); return 'BSX-' + body + '.' + sig(body); }
  function makeResult(p) { const body = ['R2', p.id, st().pid, p.tiles, p.bet ? 1 : 0, Math.floor(p.ts / 6e4).toString(36), b64(st().name), p.target, p.err || 0, Math.round(p.secs || 0)].join('.'); return 'BSX-' + body + '.' + sig(body); }
  function parse(txt) {
    const m = String(txt || '').match(/BSX-([CR][12]\.[A-Za-z0-9_\-.]+)/); if (!m) return null;
    const parts = m[1].split('.'); const s = parts.pop(), body = parts.join('.');
    if (sig(body) !== s) return { bad: true };
    if (parts[0] === 'C1' || parts[0] === 'R1') return { old: true };
    if (parts[0] === 'C2') { const [, id, cid, mi, seed, t, stake, ts, nm, err, secs] = parts; return { av: D.AV[parts[11]] ? parts[11] : '', kind: 'C', id, cid, mode: MODES[+mi] || 'classic', seed: parseInt(seed, 36), tiles: +t, stake: +stake, ts: parseInt(ts, 36) * 6e4, name: unb64(nm) || 'Friend', err: +err || 0, secs: +secs || 0, code: 'BSX-' + m[1] }; }
    if (parts[0] === 'R2') { const [, id, fid, t, bet, ts, nm, target, err, secs] = parts; return { kind: 'R', id, fid, tiles: +t, bet: bet === '1', ts: parseInt(ts, 36) * 6e4, name: unb64(nm) || 'Friend', target: +target, err: +err || 0, secs: +secs || 0, code: 'BSX-' + m[1] }; }
    return null;
  }
  /* friend beats challenger: more tiles, or same tiles with fewer mistakes, or same mistakes and faster */
  const beats = (a, b) => a.tiles > b.tiles || (a.tiles === b.tiles && (a.err < b.err || (a.err === b.err && a.secs < b.secs)));

  /* ---------- limits ---------- */
  const maxStake = () => Math.min(1000, Math.floor(st().coins * D.CHAL.pct));
  const canWinCoins = () => S.best() >= D.CHAL.minLevel;
  const todayCount = (list, key, who) => list.filter(x => x[key] === who && x.day === S.dayKey()).length;
  const rakhi = () => { const f = EV.fest(); return f && f.live && f.f.id === 'rakhi'; };
  const expired = c => now() > c.ts + D.CHAL.expireH * H;
  function pendingCount() { return (st().chal.sent || []).filter(c => !c.settled && !expired(c)).length + (st().chal.invites || []).length; }

  /* escrow: an unanswered duel refunds the full bet after 24 hours */
  function refundExpired() {
    let n = 0, sum = 0;
    for (const c of st().chal.sent || []) if (!c.settled && expired(c) && !c.refunded) { c.refunded = true; c.settled = true; c.won = null; if (c.stake) { S.grant({ coins: c.stake }); sum += c.stake; } n++; }
    if (n) { S.save(); if (sum) UI.toast(`${n} duel${n > 1 ? 's' : ''} not answered in 24h · ${fmt(sum)} coins refunded`, 'coins'); }
  }
  /* online: settle finished duels + collect invites + ghost bonuses */
  async function sync() {
    if (!FB.on || !NET.ok) return;
    try {
      const s = st(), mine = await FB.myOpen(s.pid);
      for (const d of mine) { const c = s.chal.sent.find(x => x.id === d._id); if (c && !c.settled && d.status === 'done') settleWith(c, { fid: d.fid, name: d.fname, tiles: d.ftiles, err: d.ferr, secs: d.fsecs, ts: d.fts, bet: !!d.fbet }, true); }
      s.chal.invites = (await FB.invites(s.pid)).filter(d => !s.chal.played.some(p => p.id === d._id) && !expired({ ts: d.ts }));
      const b = await FB.collectInbox(s.pid); if (b) { S.grant({ coins: b }); UI.toast(`Your duel run was used as a ghost · +${fmt(b)} coins`, 'coins'); }
      S.save();
    } catch (e) { }
  }

  /* ---------- MAIN SHEET ---------- */
  function open() {
    refundExpired(); sync().then(() => { if (document.getElementById('sheet').classList.contains('chal')) render(); });
    render();
  }
  function render() {
    const s = st(), ms = maxStake();
    if (mkStake > ms) mkStake = 0;
    const sent = s.chal.sent.slice(-8).reverse(), played = s.chal.played.slice(-6).reverse(), inv = s.chal.invites || [];
    const modes = MODES.filter(m => S.unlocked(m));
    if (!modes.includes(mkMode)) mkMode = 'classic';
    const stakes = D.CHAL.stakes.map(v => { const off = v > 0 && (v > ms || !canWinCoins()); return `<button class="${v === mkStake ? 'on' : ''} ${off ? 'off' : ''}" data-act="${off ? 'chNoStake:' + v : 'chStake:' + v}">${v ? ART.coin(13) + fmt(v) : 'Free'}</button>`; }).join('');
    const sRows = sent.map(c => {
      const ex = expired(c), left = Math.max(0, c.ts + D.CHAL.expireH * H - now());
      const status = c.refunded ? `<em>No reply · refunded</em>` : c.settled ? (c.won ? `<em class="ok">WON ${c.paid ? '+' + fmt(c.paid) : ''}</em>` : `<em class="bad">LOST</em>`) : ex ? `<em>Refunding…</em>` : `<em>${Math.ceil(left / H)}h left</em>`;
      return `<div class="chRowC"><div><b>${D.MODE[c.mode].name} · ${c.tiles} tiles</b><small>${c.stake ? 'Bet ' + fmt(c.stake) : 'Free'} · ${c.settled && c.fname ? 'vs ' + UI.esc(c.fname) + (c.ftiles != null ? ' (' + c.ftiles + ')' : '') : 'waiting for friend'}</small></div>${status}${!c.settled && !ex ? `<button class="tryBtn" data-act="chResend:${c.id}">${ART.ic('share')} Send</button>` : ''}</div>`;
    }).join('');
    const pRows = played.map(p => `<div class="chRowC"><div><b>vs ${UI.esc(p.name)} · ${p.tiles} vs ${p.target}</b><small>${p.ghost ? 'Random opponent' : p.practice ? 'Practice' : p.bet ? 'Bet ' + fmt(p.stake) : p.stake ? 'Played with ad' : 'Free'}</small></div><em class="${p.won ? 'ok' : 'bad'}">${p.won ? 'WON' + (p.paid ? ' +' + fmt(p.paid) : '') : 'LOST'}</em>${p.ghost || FB.on ? '' : `<button class="tryBtn" data-act="chResult:${p.id}">${ART.ic('share')} Result</button>`}</div>`).join('');
    const iRows = inv.map(d => `<div class="chRowC inv"><div><b>${UI.esc(d.cname)} challenged you</b><small>${D.MODE[d.mode] ? D.MODE[d.mode].name : 'Classic'} · ${d.tiles} tiles · ${d.stake ? 'bet ' + fmt(d.stake) : 'free'}</small></div><button class="btn sm pulse" data-act="chInv:${d._id}">${ART.ic('swords')} PLAY</button></div>`).join('');
    UI.sheet(`<div class="chHead">${ART.ic('swords')}<div><small>${rakhi() ? 'RAKSHA BANDHAN · WINS PAY DOUBLE' : 'DUEL LADDER · SAME PATTERN'}</small><b>Duel a Friend</b></div><button class="rulesBtn" data-act="rules:chal">${ART.ic('info')} Rules</button></div>
      ${iRows ? `<div class="secT">Invites for you</div>${iRows}` : ''}
      <div class="chPaste"><input id="chCode" placeholder="Paste a friend's code (BSX-...)" autocomplete="off"><button class="btn sm" data-act="chPaste">${ART.ic('paste')} Paste</button></div>
      ${FB.on ? `<button class="chRandom" data-act="chRandom">${ART.ic('globe')}<span><b>Random opponent</b><small>Play a real player's recorded run · no waiting</small></span>${ART.ic('next')}</button>` : ''}
      <div class="secT">Create a duel</div>
      <div class="tourModes">${modes.map(m => `<button class="${m === mkMode ? 'sel' : ''}" data-act="chMode:${m}">${ART.ic(D.MODE[m].icon)}${D.MODE[m].name}</button>`).join('')}</div>
      <div class="chStakes">${stakes}</div>
      ${FB.on ? `<div class="chPaste"><input id="chTo" placeholder="Friend's player ID (optional, sends an invite)" value="${UI.esc(mkTo)}" autocomplete="off"></div>` : ''}
      <div class="chNote">${canWinCoins() ? `Max bet: ${ART.coin(11)} ${fmt(ms)} (10% of your coins, max 1,000)` : `Reach level ${D.CHAL.minLevel} to bet coins. Free duels work now.`}</div>
      <button class="btn big pulse" data-act="chMake">${ART.ic('swords')} PLAY & CREATE ${mkStake ? '· BET ' + fmt(mkStake) : ''}</button>
      <div class="chNote">Starts at 2 tiles, +1 every round · 4×4 grid · 2 hearts · Win: ${mkStake ? `${ART.coin(11)} ${fmt(mkStake * 2 * (rakhi() ? 2 : 1))}` : `${ART.coin(11)} ${D.CHAL.freeWin}`} · No reply in 24h = full refund</div>
      ${sRows ? `<div class="secT">Sent by you</div>${sRows}` : ''}${pRows ? `<div class="secT">You played</div>${pRows}` : ''}`, 'chal');
  }

  /* ---------- create ---------- */
  function make() {
    if (!NET.gate()) return;
    const ti = $('chTo'); mkTo = ti ? ti.value.trim().toUpperCase() : '';
    if (mkTo && mkTo === st().pid) return UI.toast('That is your own player ID', 'info');
    if (mkStake && (mkStake > maxStake() || !canWinCoins())) return UI.toast('Bet too high', 'coins');
    if (mkStake && !S.spend('coins', mkStake)) return UI.toast('Not enough coins', 'coins');
    const c = { id: rid(), mode: mkMode, seed: (Math.random() * 4294967295) >>> 0, stake: mkStake, ts: now(), to: mkTo };
    UI.closeSheet();
    G.start({ mode: c.mode, chal: { role: 'make', ...c } });
  }
  /* ---------- friend opens a challenge ---------- */
  async function accept(p) {
    const s = st();
    if (p.cid === s.pid) return UI.toast('That is your own duel. Send it to a friend!', 'swords');
    if (expired(p)) return UI.toast('This duel expired (24 hours)', 'clock');
    const done = s.chal.played.find(x => x.id === p.id);
    if (done) { if (!FB.on) shareResult(done); else UI.toast('You already played this duel', 'check'); return; }
    if (todayCount(s.chal.played, 'cid', p.cid) >= D.CHAL.perFriendDay) return UI.modal(`<div class="mdK">Limit reached</div><div class="mdT">${D.CHAL.perFriendDay} duels with ${UI.esc(p.name)} today</div><div class="mdS">Play another friend, or come back tomorrow.</div><button class="btn big" data-act="closeModal">OK</button>`);
    const left = Math.ceil((p.ts + D.CHAL.expireH * H - now()) / H);
    const practice = !canWinCoins();
    const canBet = p.stake > 0 && s.coins >= p.stake && !practice;
    const mult = rakhi() ? 2 : 1;
    const v = await UI.ask(`<div class="chVs">${S.avatarImg() ? `<img class="chVsAv" src="${S.avatarImg()}" alt="">` : ART.avatar('none', 'smug')}<b>VS</b><span class="chVsN"><img class="chVsAv" src="${p.av ? 'img/av/' + p.av + '.webp' : ART.avFor(p.name)}" alt=""><br>${UI.esc(p.name)}</span></div>
      <div class="mdK">${D.MODE[p.mode].name} · ${left}h left</div><div class="mdT">Beat ${p.tiles} tiles</div>
      <div class="mdS">Same pattern for both. Starts at 2 tiles, +1 every round. Remember <b>more than ${p.tiles} tiles</b> to win. Accepting starts the duel now.</div>
      ${practice ? `<div class="mdS warnT">Reach level ${D.CHAL.minLevel} to win coins. This one is practice.</div><button class="btn big" data-pick="practice">${ART.ic('play')} PLAY FOR FUN</button>` :
        p.stake ? `${canBet ? `<button class="btn big pulse" data-pick="bet">${ART.coin(18)} BET ${fmt(p.stake)} · WIN ${fmt(p.stake * 2 * mult)}</button>` : ''}<button class="btn big alt" data-pick="ad">${ART.ic('ad')} PLAY WITH AD · WIN ${fmt(D.CHAL.adWin * mult)}</button>`
        : `<button class="btn big pulse" data-pick="free">${ART.ic('play')} ACCEPT · WIN ${fmt(D.CHAL.freeWin * mult)}</button>`}
      <button class="btn ghost" data-pick="no">Not now</button>`, 'chAcc');
    if (!v || v === 'no') return;
    if (!NET.gate()) return;
    if (v === 'ad' && !(await ADS.rewarded('chalEntry'))) return;
    if (v === 'bet' && !S.spend('coins', p.stake)) return UI.toast('Not enough coins', 'coins');
    UI.closeSheet();
    G.start({ mode: p.mode, chal: { role: 'play', id: p.id, cid: p.cid, seed: p.seed, target: p.tiles, terr: p.err, tsecs: p.secs, stake: p.stake, bet: v === 'bet', practice: v === 'practice', name: p.name, ts: p.ts, how: v, ghost: !!p.ghost, gpid: p.gpid, guid: p.guid } });
  }
  async function acceptOnline(id) {
    if (!NET.gate()) return;
    try { const d = await FB.getDuel(id); if (!d) return UI.toast('Duel not found', 'info'); if (d.status === 'done') return UI.toast('This duel is already finished', 'check');
      accept({ kind: 'C', id: d._id, cid: d.cid, mode: d.mode, seed: d.seed, tiles: d.tiles, stake: d.stake, ts: d.ts, name: d.cname, err: d.err, secs: d.secs });
    } catch (e) { UI.toast('Could not load the duel. Check internet.', 'wifi'); }
  }
  async function random() {
    if (!NET.gate()) return;
    UI.toast('Finding a real opponent…', 'globe');
    try { const g = await FB.randomRun(st().pid); if (!g) return UI.toast('No opponents yet. Try again soon!', 'globe');
      accept({ kind: 'C', id: 'G' + rid(), cid: 'ghost:' + g.pid, mode: g.mode, seed: g.seed, tiles: g.tiles, stake: 0, ts: now(), name: g.name, err: g.err, secs: g.secs, ghost: true, gpid: g.pid, guid: g.uid || '' });
    } catch (e) { UI.toast('Could not reach the duel server', 'wifi'); }
  }
  /* ---------- settle (offline result code or online result) ---------- */
  async function settle(r) {
    const s = st(), c = s.chal.sent.find(x => x.id === r.id);
    if (!c) return UI.toast('This result is not for a duel you sent', 'info');
    if (r.fid === s.pid) return UI.toast('That is your own result code', 'info');
    if (c.settled) return UI.toast(c.refunded ? 'This duel was already refunded' : 'Already settled', 'check');
    settleWith(c, r, false);
  }
  function settleWith(c, r, quiet) {
    const s = st();
    if (r.ts > c.ts + D.CHAL.expireH * H) { c.settled = true; c.refunded = true; if (c.stake) S.grant({ coins: c.stake }); S.save(); return quiet ? null : UI.toast('Result came after 24 hours · bet refunded', 'clock'); }
    const friendWon = beats({ tiles: r.tiles, err: r.err || 0, secs: r.secs || 0 }, { tiles: c.tiles, err: c.err || 0, secs: c.secs || 0 });
    const limited = todayCount(s.chal.log, 'fid', r.fid) >= D.CHAL.perFriendDay;
    s.chal.log.push({ fid: r.fid, day: S.dayKey() }); if (s.chal.log.length > 60) s.chal.log.splice(0, 20);
    c.settled = true; c.won = !friendWon; c.fname = r.name; c.ftiles = r.tiles;
    let paid = 0;
    if (!friendWon && !limited) paid = Math.round((c.stake ? c.stake * 2 : D.CHAL.freeWin) * (rakhi() ? 2 : 1));
    if (!canWinCoins()) paid = c.stake ? c.stake : 0;   // never lose your own bet for being low level
    c.paid = paid; if (paid) S.grant({ coins: paid });
    if (!friendWon) { s.stats.chalWins = (s.stats.chalWins || 0) + 1; S.passAdd('chal'); if (s.stats.chalWins >= 5) UI.badge('slayer'); }
    S.save();
    if (quiet) { UI.toast(`${UI.esc(r.name)} played your duel: ${r.tiles} vs your ${c.tiles} · ${friendWon ? 'you lost' : 'YOU WON' + (paid ? ' +' + fmt(paid) : '')}`, friendWon ? 'x' : 'trophy'); return; }
    UI.closeSheet();
    resultScreen({ role: 'settle', won: !friendWon, mine: c.tiles, theirs: r.tiles, name: r.name, paid, limited, mode: c.mode, c });
  }

  /* ---------- end of a duel run ---------- */
  async function onEnd(res) {
    const s = st(), ch = res.chal, err = Math.max(0, res.taps - res.correct), secs = Math.round(res.time);
    if (ch.role === 'make') {
      const c = { id: ch.id, mode: ch.mode || res.mode, seed: ch.seed, stake: ch.stake, ts: ch.ts, tiles: res.tiles, err, secs, settled: false, to: ch.to };
      s.chal.sent.push(c); if (s.chal.sent.length > 30) s.chal.sent.splice(0, 10);
      c.code = makeCode(c); S.save();
      if (FB.on) { try { await FB.putDuel({ id: c.id, cid: s.pid, cname: s.name, mode: c.mode, seed: c.seed, tiles: c.tiles, err, secs, stake: c.stake, ts: c.ts, status: 'open', toPid: c.to || '' }); await FB.saveRun({ pid: s.pid, name: s.name, mode: c.mode, seed: c.seed, tiles: c.tiles, err, secs, ts: c.ts }); c.online = true; S.save(); } catch (e) { } }
      resultScreen({ role: 'made', c, tiles: res.tiles });
      return;
    }
    const won = beats({ tiles: res.tiles, err, secs }, { tiles: ch.target, err: ch.terr || 0, secs: ch.tsecs || 0 }), mult = rakhi() ? 2 : 1;
    let paid = 0;
    if (won && !ch.practice) paid = Math.round((ch.bet ? ch.stake * 2 : ch.how === 'ad' ? D.CHAL.adWin : D.CHAL.freeWin) * mult);
    if (paid) S.grant({ coins: paid });
    if (won) { s.stats.chalWins = (s.stats.chalWins || 0) + 1; S.passAdd('chal'); if (s.stats.chalWins >= 5) UI.badge('slayer'); }
    const p = { id: ch.id, cid: ch.cid, name: ch.name, target: ch.target, mode: res.mode, tiles: res.tiles, err, secs, won, bet: ch.bet, stake: ch.stake, practice: ch.practice, ghost: ch.ghost, paid, day: S.dayKey(), ts: now() };
    p.code = makeResult(p);
    s.chal.played.push(p); if (s.chal.played.length > 40) s.chal.played.splice(0, 10);
    s.chal.invites = (s.chal.invites || []).filter(d => d._id !== ch.id); S.save();
    if (FB.on) { try { if (ch.ghost) { if (won && ch.guid) await FB.sendBonus(ch.guid, 50, s.pid); } else await FB.finishDuel(ch.id, { fid: s.pid, fname: s.name, tiles: res.tiles, err, secs }); } catch (e) { } }
    resultScreen({ role: 'played', p, won, paid });
  }

  function resultScreen(o) {
    UI.show('result');
    let html;
    if (o.role === 'made') {
      const c = o.c;
      html = `<div class="resFace">${ART.sanx('smug')}<div class="heroBubble sm">Now make your friend sweat.</div></div>
        <div class="resK">DUEL READY</div><div class="resBig"><span id="resN">0</span><small>tiles to beat · ${D.MODE[c.mode].name}</small></div>
        ${c.to && c.online ? `<div class="resNext">Invite sent to player ${UI.esc(c.to)}.</div>` : `<div class="codeBox"><small>Duel code</small><b>${c.code.slice(0, 22)}…</b></div>`}
        <div class="resNext">${c.stake ? `Bet ${fmt(c.stake)} held in Sanx Bank. ` : ''}Your friend has <b>24 hours</b>. No reply = full refund.</div>
        <button class="btn big pulse" data-act="chSend:${c.id}">${ART.ic('share')} SEND ON WHATSAPP</button>
        <div class="row2"><button class="btn ghost" data-act="chCopy:${c.id}">${ART.ic('copy')} Copy code</button><button class="btn ghost" data-act="home">${ART.ic('home')} Home</button></div>`;
    } else if (o.role === 'played') {
      const p = o.p;
      html = `<div class="resFace">${ART.sanx(o.won ? 'shock' : 'laugh')}<div class="heroBubble sm">${o.won ? 'You beat ' + UI.esc(p.name) + '!' : UI.esc(p.name) + ' wins this one.'}</div></div>
        <div class="resK">${o.won ? 'DUEL WON' : 'DUEL LOST'}</div><div class="resBig"><span id="resN">0</span><small>tiles · ${UI.esc(p.name)} had ${p.target}</small></div>
        ${o.paid ? `<div class="resRow"><span>${ART.coin(18)} <b>+${fmt(o.paid)}</b></span></div>` : ''}
        ${o.won && o.paid ? `<button class="btn alt" data-act="chBonus:${Math.round(o.paid * D.CHAL.winBonusAd)}">${ART.ic('ad')} +50% bonus <small>+${fmt(Math.round(o.paid * D.CHAL.winBonusAd))}</small></button>` : ''}
        ${FB.on || p.ghost ? `<div class="resNext">${p.ghost ? 'Random opponent duel.' : UI.esc(p.name) + ' sees the result automatically.'}</div>` : `<button class="btn big pulse" data-act="chResult:${p.id}">${ART.ic('share')} SEND RESULT TO ${UI.esc(p.name).toUpperCase()}</button>`}
        ${UI.clipBtn(G.last)}
        ${!o.won ? `<button class="btn ghost" data-act="chRevenge:${p.id}">${ART.ic('ad')} Badla lo! Free rematch</button>` : ''}
        <div class="row2"><button class="btn ghost" data-act="chal">${ART.ic('swords')} Duels</button><button class="btn ghost" data-act="home">${ART.ic('home')} Home</button></div>`;
      if (o.won) FX.win('fireworks');
    } else {
      html = `<div class="resFace">${ART.sanx(o.won ? 'shock' : 'laugh')}<div class="heroBubble sm">${o.won ? UI.esc(o.name) + ' could not beat you!' : UI.esc(o.name) + ' beat you!'}</div></div>
        <div class="resK">${o.won ? 'YOU WIN' : 'YOU LOST'} · vs ${UI.esc(o.name)}</div><div class="resBig">${o.mine} <small>vs ${o.theirs} tiles</small></div>
        ${o.paid ? `<div class="resRow"><span>${ART.coin(18)} <b>+${fmt(o.paid)}</b></span><span>from Sanx Bank</span></div>` : o.won && o.limited ? `<div class="resNext">Daily limit with this friend reached: no coins this time</div>` : ''}
        ${o.won && o.paid ? `<button class="btn alt" data-act="chBonus:${Math.round(o.paid * D.CHAL.winBonusAd)}">${ART.ic('ad')} +50% bonus <small>+${fmt(Math.round(o.paid * D.CHAL.winBonusAd))}</small></button>` : ''}
        ${!o.won ? `<button class="btn big pulse" data-act="chRevengeMode:${o.mode}">${ART.ic('ad')} Badla lo! Free rematch</button>` : `<button class="btn big" data-act="chShareWin:${o.mine}:${o.theirs}">${ART.ic('share')} SHOW OFF</button>`}
        ${UI.clipBtn(G.last)}
        <div class="row2"><button class="btn ghost" data-act="chal">${ART.ic('swords')} Duels</button><button class="btn ghost" data-act="home">${ART.ic('home')} Home</button></div>`;
      if (o.won) FX.win('coinrain');
    }
    $('result').innerHTML = `<div class="resCard chRes">${html}</div>`;
    const n = $('resN'); if (n) FX.countUp(n, o.role === 'made' ? o.tiles : o.p.tiles, 700);
  }

  /* ---------- sharing ---------- */
  function shareChallenge(c) {
    const txt = `⚔️ ${st().name} challenged you on Beat Sanx!\nI remembered a ${c.tiles}-tile pattern in ${D.MODE[c.mode].name}. Beat me${c.stake ? ` and win ${fmt(c.stake * 2)} coins` : ''}!\n\nTap to play: ${LINK}${c.code}\n\nOr copy the code: ${c.code}\nOpen Beat Sanx → Duels → Paste. You have 24 hours.`;
    SH.challenge(c, txt);
  }
  function shareResult(p) {
    const txt = `${p.won ? '🏆' : '😅'} ${st().name} played your Beat Sanx duel: ${p.tiles} tiles (you had ${p.target}).\n\nTap to see who wins: ${LINK}${p.code}\n\nOr copy the result code: ${p.code}`;
    SH.chalResult(p, txt);
  }

  /* ---------- clipboard / paste ---------- */
  async function readClip() {
    try { const P = window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.Clipboard; if (P) { const r = await P.read(); return r && r.value || ''; } } catch (e) { }
    try { return await navigator.clipboard.readText(); } catch (e) { return ''; }
  }
  function handle(txt) {
    const p = parse(txt);
    if (!p) { UI.toast('No Beat Sanx code found', 'info'); return false; }
    if (p.bad) { UI.toast('This code looks changed or broken', 'x'); return false; }
    if (p.old) { UI.toast('This code is from an older version. Ask your friend for a new duel.', 'info'); return false; }
    const s = st(); s.chal.seen = s.chal.seen || []; if (!s.chal.seen.includes(p.code)) { s.chal.seen.push(p.code); if (s.chal.seen.length > 50) s.chal.seen.splice(0, 20); S.save(); }
    if (p.kind === 'C') accept(p); else settle(p);
    return true;
  }
  async function checkClipboard() {
    refundExpired(); sync();
    const q = new URLSearchParams(location.search).get('c'); if (q && !checkClipboard.urlDone) { checkClipboard.urlDone = true; handle(q); return; }
    if (!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform())) return;
    const txt = await readClip(); const p = parse(txt); if (!p || p.bad || p.old) return;
    const s = st(); s.chal.seen = s.chal.seen || []; if (s.chal.seen.includes(p.code)) return;
    if (p.kind === 'C' && p.cid === s.pid) return;
    if (p.kind === 'R' && !s.chal.sent.some(c => c.id === p.id && !c.settled)) return;
    const v = await UI.ask(`<div class="htFace">${ART.sanx('shock')}</div><div class="mdK">Code found</div><div class="mdT">${p.kind === 'C' ? UI.esc(p.name) + ' challenged you!' : UI.esc(p.name) + ' sent a result'}</div><button class="btn big pulse" data-pick="go">${ART.ic('swords')} OPEN</button><button class="btn ghost" data-pick="no">Later</button>`);
    if (v === 'go') handle(txt); else { s.chal.seen.push(p.code); S.save(); }
  }

  async function act(a, el) {
    const [k, v, w] = a.split(':'), s = st();
    switch (k) {
      case 'chMode': mkMode = v; { const ti = $('chTo'); if (ti) mkTo = ti.value; } render(); break;
      case 'chStake': mkStake = +v; { const ti = $('chTo'); if (ti) mkTo = ti.value; } render(); break;
      case 'chNoStake': UI.toast(!canWinCoins() ? `Reach level ${D.CHAL.minLevel} to bet coins` : 'Max bet is 10% of your coins', 'coins'); break;
      case 'chMake': make(); break;
      case 'chRandom': random(); break;
      case 'chInv': acceptOnline(v); break;
      case 'chPaste': { const i = $('chCode'); let txt = i && i.value.trim(); if (!txt) { txt = await readClip(); if (i) i.value = txt || ''; } if (txt) handle(txt); else UI.toast('Copy the code from WhatsApp first', 'paste'); break; }
      case 'chSend': case 'chResend': { const c = s.chal.sent.find(x => x.id === v); if (c) { if (!c.code) c.code = makeCode(c); shareChallenge(c); } break; }
      case 'chCopy': { const c = s.chal.sent.find(x => x.id === v); if (!c) break; try { await navigator.clipboard.writeText(c.code); UI.toast('Code copied', 'copy'); } catch (e) { UI.toast(c.code, 'copy'); } break; }
      case 'chResult': { const p = s.chal.played.find(x => x.id === v); if (p) shareResult(p); break; }
      case 'chBonus': if (await ADS.rewarded('chalBonus')) { S.grant({ coins: +v }); el.remove(); UI.toast(`+${fmt(+v)} bonus`, 'coins'); FX.flyCoins(el); } break;
      case 'chRevenge': case 'chRevengeMode': {
        if (!(await ADS.rewarded('revenge'))) break;
        const p = s.chal.played.find(x => x.id === v); mkMode = k === 'chRevengeMode' ? v : (p && p.mode) || 'classic';
        if (!S.unlocked(mkMode)) mkMode = 'classic';
        mkStake = 0; mkTo = ''; make(); break;
      }
      case 'chShareWin': SH.victory(+v, +w); break;
    }
  }
  return { open, act, onEnd, pendingCount, checkClipboard, handle, parse, makeCode, refundExpired, sync };
})();

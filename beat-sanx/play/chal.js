/* ================= BEAT SANX — CHALLENGES (v1.8) =================
   Two ways to duel. Both use the Duel Ladder: the pattern starts at 2 tiles and grows +1 every round,
   2 hearts, the grid the player picks (3x3 / 4x4 / 5x5). Score = longest pattern. Tie: fewer mistakes, then faster.

   CHALLENGE A FRIEND (open challenge, link only)
     The creator plays first. The link stays open for 24 hours: anyone can play it, ONE time each.
     Creator pays with a coin bet or a rewarded ad.
       ad  -> 500 coins, paid only ONCE (the first time a player fails to beat him), however many play.
       bet -> 50% of every losing coin bet, max 5x his own bet. No one plays in 24h = bet refunded.
     Challenger: coin bet (win 2x the bet) · watch ad (win 500) · no ad (win 100). No daily limit on no ad.
   CHALLENGE THE WORLD (always 1 vs 1)
     A live player online now with a near level gets an invite. Nobody accepts in 35 s = a Sanx bot (BOT tag).
     Bet (win 2x) or watch ad (win 200). Live duels are blind: both play the same pattern, results meet after.
   Watch-ad limits per day: Friend 5 (max 2,500), World 5 (max 1,000). Coins below level 10 = practice only. */
'use strict';
const CH = (() => {
  const $ = id => document.getElementById(id);
  const fmt = n => UI.fmt(n);
  const st = () => S.st;
  const C = () => D.CHAL;
  const SECRET = 'S4nx#Be4t!26·' + 'graphikians';
  const MODES = D.CHAL.modes;
  const now = () => Date.now();
  const H = 36e5;
  const LINK = 'https://graphikians.github.io/beat-sanx/c/?c=';
  /* flow state of the Challenges sheet */
  let view = 'home', kind = 'friend', mkMode = 'classic', mkGrid = 3, mkPay = 'ad', mkStake = 100;
  let searching = null;            // live World search in progress

  /* ---------- link code (C3 = v1.8 with grid + pay type; C2 still opens) ---------- */
  const b64 = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unb64 = s => { try { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return decodeURIComponent(escape(atob(s))); } catch (e) { return ''; } };
  const sig = body => (G.hash(body, SECRET) >>> 0).toString(36).slice(0, 6).padStart(6, '0') + (G.hash(SECRET, body, 7) >>> 0).toString(36).slice(0, 3);
  const rid = () => { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 8; i++) s += A[Math.floor(Math.random() * A.length)]; return s; };
  function makeCode(c) { const body = ['C3', c.id, st().pid, MODES.indexOf(c.mode), (c.seed >>> 0).toString(36), c.tiles, c.stake || 0, Math.floor(c.ts / 6e4).toString(36), b64(st().name), c.err || 0, Math.round(c.secs || 0), st().avatar || '', c.grid || 3, c.how === 'bet' ? 0 : 1].join('.'); return 'BSX-' + body + '.' + sig(body); }
  function parse(txt) {
    const m = String(txt || '').match(/BSX-([CR][123]\.[A-Za-z0-9_\-.]+)/); if (!m) return null;
    const parts = m[1].split('.'); const s = parts.pop(), body = parts.join('.');
    if (sig(body) !== s) return { bad: true };
    if (parts[0] === 'C3' || parts[0] === 'C2') {
      const [, id, cid, mi, seed, t, stake, ts, nm, err, secs, av, grid, how] = parts;
      return { kind: 'C', id, cid, mode: MODES[+mi] || 'classic', seed: parseInt(seed, 36), tiles: +t, stake: +stake || 0, ts: parseInt(ts, 36) * 6e4, name: unb64(nm) || 'Friend', err: +err || 0, secs: +secs || 0, av: D.AV && D.AV[av] ? av : '', grid: parts[0] === 'C3' ? (+grid || 3) : 4, how: parts[0] === 'C3' ? (how === '0' ? 'bet' : 'ad') : (+stake ? 'bet' : 'ad'), code: 'BSX-' + m[1] };
    }
    return { old: true };
  }
  const beats = (a, b) => a.tiles > b.tiles || (a.tiles === b.tiles && (a.err < b.err || (a.err === b.err && a.secs < b.secs)));

  /* ---------- limits ---------- */
  const maxStake = () => Math.min(1000, Math.floor(st().coins * C().pct));
  const canWinCoins = () => S.best() >= C().minLevel;
  const todayCount = (list, key, who) => list.filter(x => x[key] === who && x.day === S.dayKey()).length;
  const expired = c => now() > c.ts + C().expireH * H;
  function adDay() { const s = st(); const d = S.dayKey(); if (!s.chal.ad || s.chal.ad.d !== d) s.chal.ad = { d, f: 0, w: 0 }; return s.chal.ad; }
  const adLeft = k => (k === 'w' ? C().adCapW : C().adCapF) - adDay()[k];
  function useAd(k) { adDay()[k]++; S.save(); }
  function pendingCount() { const s = st(); return (s.chal.invites || []).length + (s.chal.sent || []).filter(c => c.fresh).length; }
  const gridName = g => `${g}×${g}`;
  const modeName = m => (D.MODE[m] || D.MODE.classic).name;

  /* ---------- server sync (creator settles from plays, World results, invites, presence) ---------- */
  let lastPres = 0, lastPlays = 0;
  function refundExpired() {
    let sum = 0, n = 0;
    for (const c of st().chal.sent || []) if (!c.settled && expired(c)) { c.settled = true; if (c.how === 'bet' && !c.plays && c.stake && !c.refunded) { c.refunded = true; S.grant({ coins: c.stake }); sum += c.stake; n++; } }
    if (sum) { S.save(); UI.toast(`${n} challenge${n > 1 ? 's' : ''} not played in 24h · ${fmt(sum)} coins refunded`, 'coins'); }
  }
  async function sync(force) {
    if (!FB.on || !NET.ok) return;
    const s = st();
    try {
      if (force || now() - lastPres > 150000) { lastPres = now(); FB.presence({ pid: s.pid, name: s.name, lv: S.best(), av: s.avatar || '' }).catch(() => { }); }
      if ((force || now() - lastPlays > 90000) && (s.chal.sent || []).some(c => !c.settled || now() - c.ts < 48 * H)) { lastPlays = now(); await settlePlays(); }
      await worldPending();
    } catch (e) { }
  }
  /* creator side: read every play of my challenges once, pay what the rules give */
  async function settlePlays() {
    const s = st(), list = await FB.playsByCreator(s.pid);
    s.chal.seenPlays = s.chal.seenPlays || [];
    let toast = [], earned = 0;
    for (const p of list) {
      if (s.chal.seenPlays.includes(p._id)) continue;
      const c = s.chal.sent.find(x => x.id === p.did); if (!c) continue;
      s.chal.seenPlays.push(p._id); if (s.chal.seenPlays.length > 300) s.chal.seenPlays.splice(0, 100);
      c.plays = (c.plays || 0) + 1; c.fresh = true;
      if (p.won) { c.beat = (c.beat || 0) + 1; continue; }
      let pay = 0;
      if (!canWinCoins()) { /* practice */ }
      else if (c.how === 'ad' && !c.adPaid) { c.adPaid = true; pay = C().creatorAdWin; }
      else if (c.how === 'bet' && p.how === 'bet' && p.stake) { const cap = c.stake * C().betCap - (c.earned || 0); pay = Math.max(0, Math.min(cap, Math.round(p.stake * C().betShare))); }
      if (pay) { c.earned = (c.earned || 0) + pay; earned += pay; S.grant({ coins: pay }); }
      toast.push(p.name);
    }
    if (toast.length || earned) {
      s.stats.chalWins = (s.stats.chalWins || 0) + toast.length; if (toast.length) S.passAdd('chal');
      S.save();
      if (UI.cur !== 'game') UI.toast(`${toast.length ? `${UI.esc(toast[0])}${toast.length > 1 ? ` +${toast.length - 1}` : ''} could not beat your challenge` : 'Challenge update'}${earned ? ` · +${fmt(earned)} coins` : ''}`, 'trophy');
    } else S.save();
  }

  /* ---------- MAIN SHEET ---------- */
  function open(k) {
    if (k) { kind = k; view = 'mode'; } else view = 'home';
    refundExpired(); render();
    sync(true).then(() => { if ($('sheet').classList.contains('chal') && view === 'home') render(); });
  }
  function render() {
    if (view === 'mode') return renderMode();
    if (view === 'set') return renderSet();
    const s = st(), inv = s.chal.invites || [];
    (s.chal.sent || []).forEach(c => { c.fresh = false; }); S.save();
    const sent = (s.chal.sent || []).slice(-8).reverse(), played = (s.chal.played || []).slice(-8).reverse();
    const sRows = sent.map(c => {
      const open = !c.settled && !expired(c), left = Math.max(0, c.ts + C().expireH * H - now());
      const tried = c.plays || 0, beat = c.beat || 0;
      return `<div class="chRowC"><div><b>${modeName(c.mode)} · ${gridName(c.grid || 4)} · ${c.tiles} tiles</b><small>${tried ? `${tried} tried · ${beat} beat you` : 'No one played yet'}${c.how === 'bet' ? ` · bet ${fmt(c.stake)}` : ' · ad'}${c.earned ? ` · +${fmt(c.earned)}` : ''}</small></div>${open ? `<em>${Math.ceil(left / H)}h left</em><button class="tryBtn" data-act="chResend:${c.id}">${ART.ic('share')} Share</button>` : `<em>${c.refunded ? 'Refunded' : 'Closed'}</em>`}</div>`;
    }).join('');
    const pRows = played.map(p => `<div class="chRowC"><div><b>vs ${UI.esc(p.name)}${p.bot ? ' <i class="botTag">BOT</i>' : ''} · ${p.tiles} vs ${p.target == null ? '…' : p.target}</b><small>${p.world ? 'World' : 'Friend'} · ${p.how === 'bet' ? 'bet ' + fmt(p.stake) : p.how === 'ad' ? 'with ad' : p.how === 'noad' ? 'no ad' : 'practice'}</small></div>${p.pending ? '<em>Waiting…</em>' : `<em class="${p.won ? 'ok' : 'bad'}">${p.void ? 'NO RESULT' : p.won ? 'WON' + (p.paid ? ' +' + fmt(p.paid) : '') : 'LOST'}</em>`}</div>`).join('');
    const iRows = inv.map(d => `<div class="chRowC inv"><div><b>${UI.esc(d.cname)} challenged you</b><small>${modeName(d.mode)} · ${gridName(d.grid)} · ${d.stake ? 'bet ' + fmt(d.stake) : 'ad duel'}</small></div><button class="btn sm pulse" data-act="chInv:${d._id}">${ART.ic('swords')} PLAY</button></div>`).join('');
    UI.sheet(`<div class="chHead">${ART.ic('swords')}<div><small>SAME PATTERN FOR BOTH</small><b>Challenges</b></div><button class="rulesBtn" data-act="rules:chal">${ART.ic('info')} Rules</button></div>
      ${iRows ? `<div class="secT">Challenges for you</div>${iRows}` : ''}
      <div class="chBlocks">
        <button class="chBlock fr" data-act="chKind:friend"><span class="cbIc">${ART.ic('users')}</span><b>Challenge a Friend</b><small>One link for WhatsApp, groups or social. Everyone can try once in 24h.</small><em>Ad win ${fmt(C().creatorAdWin)} · bets up to 5×</em></button>
        <button class="chBlock wd" data-act="chKind:world"><span class="cbIc">${ART.ic('globe')}</span><b>Challenge the World</b><small>1 vs 1 with a player online now, near your level.</small><em>Ad win ${fmt(C().worldAdWin)} · bet win 2×</em></button>
      </div>
      ${sRows ? `<div class="secT">Your challenges</div>${sRows}` : ''}${pRows ? `<div class="secT">You played</div>${pRows}` : ''}`, 'chal');
  }
  function head(t, sub) { return `<div class="chHead">${ART.ic(kind === 'world' ? 'globe' : 'users')}<div><small>${sub}</small><b>${t}</b></div><button class="rulesBtn" data-act="chBack">${ART.ic('back')} Back</button></div>`; }
  function renderMode() {
    const modes = MODES.filter(m => S.unlocked(m));
    if (!modes.includes(mkMode)) mkMode = 'classic';
    UI.sheet(`${head(kind === 'world' ? 'Challenge the World' : 'Challenge a Friend', 'STEP 1 OF 2 · PICK A MODE')}
      <div class="chModes">${MODES.map(m => { const ok = S.unlocked(m), d = D.MODE[m]; return `<button class="chMode ${ok ? '' : 'lk'}" data-act="${ok ? 'chMode:' + m : 'chModeLk:' + m}"><span>${ART.ic(ok ? d.icon : 'lock')}</span><b>${d.name}</b><small>${ok ? (d.tag || '') : 'Level ' + d.unlock}</small></button>`; }).join('')}</div>`, 'chal');
  }
  function renderSet() {
    const s = st(), ms = maxStake(), w = kind === 'world', aL = adLeft(w ? 'w' : 'f');
    if (mkPay === 'bet' && (!canWinCoins() || ms < C().stakes[0])) mkPay = 'ad';
    if (mkPay === 'bet' && mkStake > ms) mkStake = C().stakes.filter(v => v <= ms).pop() || C().stakes[0];
    const adWin = w ? C().worldAdWin : C().creatorAdWin;
    const stakes = C().stakes.map(v => { const off = v > ms || !canWinCoins(); return `<button class="${mkPay === 'bet' && v === mkStake ? 'on' : ''} ${off ? 'off' : ''}" data-act="${off ? 'chNoStake' : 'chStake:' + v}">${ART.coin(13)}${fmt(v)}</button>`; }).join('');
    UI.sheet(`${head(w ? 'Challenge the World' : 'Challenge a Friend', 'STEP 2 OF 2 · GRID AND PRIZE')}
      <div class="secT">Grid</div>
      <div class="chGrids">${C().grids.map(g => `<button class="${g === mkGrid ? 'on' : ''}" data-act="chGrid:${g}"><span class="gMini g${g}">${'<i></i>'.repeat(g * g)}</span><b>${gridName(g)}</b><small>${g === 3 ? 'Classic' : g === 4 ? 'Harder' : 'Brutal'}</small></button>`).join('')}</div>
      <div class="secT">How do you play?</div>
      <button class="chPay ${mkPay === 'ad' ? 'on' : ''} ${aL <= 0 ? 'off' : ''}" data-act="${aL <= 0 ? 'chAdCap' : 'chPay:ad'}">${ART.ic('ad')}<span><b>Watch an ad · win ${fmt(adWin)}</b><small>${aL > 0 ? `No coins needed · ${aL} of ${w ? C().adCapW : C().adCapF} left today` : 'Ad limit reached today · use a coin bet'}${!w ? ' · paid once, however many play' : ''}</small></span></button>
      <button class="chPay ${mkPay === 'bet' ? 'on' : ''} ${!canWinCoins() ? 'off' : ''}" data-act="${canWinCoins() ? 'chPay:bet' : 'chNoStake'}">${ART.coin(22)}<span><b>Bet coins · ${w ? 'win 2×' : 'earn from every loser'}</b><small>${canWinCoins() ? (w ? 'Winner gets double the bet' : `50% of each losing bet, up to 5× your bet`) : `Reach level ${C().minLevel} to bet coins`}</small></span></button>
      ${mkPay === 'bet' ? `<div class="chStakes">${stakes}</div><div class="chNote">Max bet: ${ART.coin(11)} ${fmt(ms)} (10% of your coins, max 1,000)</div>` : ''}
      <button class="btn big pulse" data-act="chGo">${ART.ic(w ? 'globe' : 'swords')} ${w ? 'FIND OPPONENT' : 'PLAY & CREATE'}</button>
      <div class="chNote">${modeName(mkMode)} · ${gridName(mkGrid)} · starts at 2 tiles, +1 every round · 2 hearts${w ? '' : ' · link open 24h, one try per player'}</div>`, 'chal');
  }

  /* ---------- pay + start ---------- */
  async function pay(w) {
    if (!NET.gate()) return null;
    if (mkPay === 'ad') {
      const k = w ? 'w' : 'f'; if (adLeft(k) <= 0) { UI.toast('Ad limit reached today', 'ad'); return null; }
      if (!(await ADS.rewarded(w ? 'chalWorld' : 'chalCreate'))) return null;
      useAd(k); return { how: 'ad', stake: 0 };
    }
    if (!canWinCoins() || mkStake > maxStake()) { UI.toast('Bet too high', 'coins'); return null; }
    if (!S.spend('coins', mkStake)) { UI.toast('Not enough coins', 'coins'); return null; }
    return { how: 'bet', stake: mkStake };
  }
  async function go() {
    if (kind === 'world') return world();
    const p = await pay(false); if (!p) return;
    const c = { id: rid(), mode: mkMode, grid: mkGrid, seed: (Math.random() * 4294967295) >>> 0, stake: p.stake, how: p.how, ts: now() };
    UI.closeSheet();
    G.start({ mode: c.mode, ladder: { start: C().ladder.start, grid: c.grid }, chal: { role: 'make', ...c } });
  }

  /* ---------- Challenge a Friend: a player opens the link ---------- */
  async function accept(p) {
    const s = st();
    if (p.cid === s.pid) return UI.toast('That is your own challenge. Share it!', 'swords');
    if (expired(p)) return UI.toast('This challenge expired (24 hours)', 'clock');
    if (s.chal.played.some(x => x.id === p.id)) return UI.toast('You already played this challenge', 'check');
    if (todayCount(s.chal.played, 'cid', p.cid) >= C().perFriendDay) return UI.modal(`<div class="mdK">Limit reached</div><div class="mdT">${C().perFriendDay} challenges from ${UI.esc(p.name)} today</div><div class="mdS">Try another player's challenge, or come back tomorrow.</div><button class="btn big" data-act="closeModal">OK</button>`);
    let tried = null;
    if (FB.on && NET.ok) {
      try {
        const t = new Promise(r => setTimeout(() => r('t'), 2500));
        const mine = await Promise.race([FB.getPlay(p.id, s.pid), t]);
        if (mine && mine !== 't') return UI.toast('You already played this challenge', 'check');
        const all = await Promise.race([FB.playsFor(p.id), t]); if (Array.isArray(all)) tried = { n: all.length, beat: all.filter(x => x.won).length };
      } catch (e) { }
    }
    const left = Math.ceil((p.ts + C().expireH * H - now()) / H), practice = !canWinCoins();
    const canBet = p.stake > 0 && s.coins >= p.stake && !practice, aL = adLeft('f');
    const v = await UI.ask(`<div class="chVs">${S.avatarImg() ? `<img class="chVsAv" src="${S.avatarImg()}" alt="">` : ART.avatar('none', 'smug')}<b>VS</b><span class="chVsN"><img class="chVsAv" src="${p.av ? 'img/av/' + p.av + '.webp' : ART.avFor(p.name)}" alt=""><br>${UI.esc(p.name)}</span></div>
      <div class="mdK">${modeName(p.mode)} · ${gridName(p.grid)} · ${left}h left</div><div class="mdT">Beat ${p.tiles} tiles</div>
      ${tried && tried.n ? `<div class="chTried">${ART.ic('users')} ${tried.n} tried · ${tried.beat} beat ${UI.esc(p.name)}</div>` : ''}
      <div class="mdS">Same pattern for everyone. Starts at 2 tiles, +1 every round. Remember <b>more than ${p.tiles} tiles</b> to win. One try only.</div>
      ${practice ? `<div class="mdS warnT">Reach level ${C().minLevel} to win coins. This one is practice.</div><button class="btn big" data-pick="practice">${ART.ic('play')} PLAY FOR FUN</button>` : `
        ${canBet ? `<button class="btn big" data-pick="bet">${ART.coin(18)} BET ${fmt(p.stake)} · WIN ${fmt(p.stake * 2)}</button>` : ''}
        <button class="btn big pulse ${aL <= 0 ? 'off' : ''}" data-pick="${aL <= 0 ? 'adcap' : 'ad'}">${ART.ic('ad')} WATCH AD · WIN ${fmt(C().adWin)}${aL <= 0 ? ' <small>(limit today)</small>' : ''}</button>
        <button class="btn big alt" data-pick="noad">${ART.ic('play')} NO AD · WIN ${fmt(C().noAdWin)}</button>`}
      <button class="btn ghost" data-pick="no">Not now</button>`, 'chAcc');
    if (!v || v === 'no') return;
    if (v === 'adcap') return UI.toast('Ad limit reached today. Play with no ad.', 'ad');
    if (!NET.gate()) return;
    if (v === 'ad') { if (!(await ADS.rewarded('chalEntry'))) return; useAd('f'); }
    if (v === 'bet' && !S.spend('coins', p.stake)) return UI.toast('Not enough coins', 'coins');
    UI.closeSheet();
    G.start({ mode: p.mode, ladder: { start: C().ladder.start, grid: p.grid }, chal: { role: 'play', id: p.id, cid: p.cid, seed: p.seed, target: p.tiles, terr: p.err, tsecs: p.secs, stake: v === 'bet' ? p.stake : 0, how: v, name: p.name, ts: p.ts, grid: p.grid } });
  }

  /* ---------- Challenge the World ---------- */
  function botFor(lv) { const b = D.BOTS.find(x => lv <= x.to) || D.BOTS[D.BOTS.length - 1]; const [a, z] = b.t; let t = a + Math.floor(Math.random() * (z - a + 1)); t -= mkGrid === 5 ? 1 : 0; return { ...b, tiles: Math.max(3, t), err: Math.floor(Math.random() * 2), secs: 20 + t * 6 + Math.floor(Math.random() * 15) }; }
  async function world() {
    const p = await pay(true); if (!p) return;
    const s = st(), seed = (Math.random() * 4294967295) >>> 0, base = { mode: mkMode, grid: mkGrid, seed, stake: p.stake, how: p.how };
    UI.closeSheet();
    let cand = null;
    if (FB.on && NET.ok) {
      try {
        const lv = S.best(), skip = s.chal.wSkip || [];
        const on = (await FB.online(C().onlineMs)).filter(x => x.pid !== s.pid && x.uid && !skip.includes(x.pid));
        on.sort((a, b) => Math.abs(a.lv - lv) - Math.abs(b.lv - lv));
        const near = on.filter(x => Math.abs(x.lv - lv) <= 15); const pool = (near.length ? near : on).slice(0, 3);
        cand = pool[Math.floor(Math.random() * pool.length)] || null;
      } catch (e) { cand = null; }
    }
    if (!cand) return vsBot(base);
    const id = 'W' + rid();
    try { await FB.wCreate({ id, cpid: s.pid, cname: s.name, clv: S.best(), cav: s.avatar || '', touid: cand.uid, topid: cand.pid, mode: base.mode, grid: base.grid, seed, stake: base.stake, chow: base.how }); }
    catch (e) { return vsBot(base); }
    searching = { id, cancel: false };
    const end = now() + C().worldWaitS * 1000;
    UI.modal(`<div class="wSearch"><div class="wRadar"><i></i><i></i><i></i>${ART.ic('globe')}</div><div class="mdK">Finding a live opponent</div><div class="mdT">${UI.esc(cand.name)} · Lv ${cand.lv}</div><div class="mdS">Waiting for them to accept… <b id="wLeft">${C().worldWaitS}</b>s</div><button class="btn ghost" data-act="chWCancel">Cancel</button></div>`, 'wsM');
    let d = null;
    while (now() < end && !searching.cancel) {
      await new Promise(r => setTimeout(r, 2500));
      const el = $('wLeft'); if (el) el.textContent = Math.max(0, Math.ceil((end - now()) / 1000));
      try { d = await FB.wGet(id); } catch (e) { d = null; }
      if (d && d.status !== 'invite') break;
    }
    const cancelled = searching.cancel; searching = null;
    if (!d || d.status === 'invite') {
      try { await FB.wPatch(id, { status: 'expired' }); } catch (e) { try { d = await FB.wGet(id); } catch (e2) { } }
    }
    if (d && d.status === 'accepted') {
      UI.closeModal();
      const w = { id, side: 'c', name: d.fname || cand.name, ...base, ts: now(), pending: true, world: true };
      s.chal.world = (s.chal.world || []).concat([w]).slice(-20); S.save();
      await UI.ask(`<div class="chVs">${S.avatarImg() ? `<img class="chVsAv" src="${S.avatarImg()}" alt="">` : ART.avatar('none', 'smug')}<b>VS</b><span class="chVsN"><img class="chVsAv" src="${d.fav ? 'img/av/' + d.fav + '.webp' : ART.avFor(w.name)}" alt=""><br>${UI.esc(w.name)}</span></div><div class="mdK">LIVE DUEL · ${modeName(base.mode)} · ${gridName(base.grid)}</div><div class="mdT">${UI.esc(w.name)} accepted!</div><div class="mdS">You both play the same pattern now. Go as far as you can.</div><button class="btn big pulse" data-pick="go">${ART.ic('play')} START</button>`, 'chAcc');
      return G.start({ mode: base.mode, ladder: { start: C().ladder.start, grid: base.grid }, chal: { role: 'world', side: 'c', id, name: w.name, ...base, world: true } });
    }
    if (cand) { s.chal.wSkip = (s.chal.wSkip || []).concat([cand.pid]).slice(-6); S.save(); }
    if (cancelled) { UI.closeModal(); if (base.how === 'bet' && base.stake) { S.grant({ coins: base.stake }); UI.toast('Search cancelled · bet refunded', 'coins'); } return; }
    vsBot(base, true);
  }
  async function vsBot(base, afterWait) {
    const b = botFor(S.best());
    const v = await UI.ask(`<div class="chVs">${S.avatarImg() ? `<img class="chVsAv" src="${S.avatarImg()}" alt="">` : ART.avatar('none', 'smug')}<b>VS</b><span class="chVsN"><span class="botAv">${ART.sanx('smug')}</span><br>${b.name} <i class="botTag">BOT</i></span></div>
      <div class="mdK">${afterWait ? 'No live player accepted' : 'No live player free right now'}</div><div class="mdT">Beat ${b.tiles} tiles</div>
      <div class="mdS">${modeName(base.mode)} · ${gridName(base.grid)}. Remember <b>more than ${b.tiles} tiles</b> to beat ${b.name}.</div>
      <button class="btn big pulse" data-pick="go">${ART.ic('play')} PLAY</button>`, 'chAcc');
    if (v !== 'go') { if (base.how === 'bet' && base.stake) { S.grant({ coins: base.stake }); UI.toast('Bet refunded', 'coins'); } return; }
    G.start({ mode: base.mode, ladder: { start: C().ladder.start, grid: base.grid }, chal: { role: 'play', id: 'B' + rid(), cid: 'bot:' + b.id, bot: true, seed: base.seed, target: b.tiles, terr: b.err, tsecs: b.secs, stake: base.stake, how: base.how, name: b.name, grid: base.grid, world: true } });
  }
  /* opponent side: a live invite arrived */
  async function inviteCheck() {
    if (!FB.on || !NET.ok || !S.feat('duel') || UI.cur === 'game' || document.hidden || searching) return;
    if ($('modal').classList.contains('on')) return;
    try {
      const s = st(), list = (await FB.wInvites()).filter(d => now() - d.ts < (C().worldWaitS - 4) * 1000 && !(s.chal.seenInv || []).includes(d._id));
      s.chal.invites = list; if (!list.length) return;
      const d = list[0]; s.chal.seenInv = (s.chal.seenInv || []).concat([d._id]).slice(-30); S.save();
      inviteModal(d);
    } catch (e) { }
  }
  async function inviteModal(d) {
    const s = st(), practice = !canWinCoins(), canBet = d.stake > 0 && s.coins >= d.stake && !practice, aL = adLeft('w');
    const secs = Math.max(5, C().worldWaitS - 3 - Math.round((now() - d.ts) / 1000));
    const timer = setTimeout(() => { if ($('modal').classList.contains('on') && document.querySelector('.wInv')) UI.closeModal(); }, secs * 1000);
    const v = await UI.ask(`<div class="wInv"><div class="chVs">${S.avatarImg() ? `<img class="chVsAv" src="${S.avatarImg()}" alt="">` : ART.avatar('none', 'smug')}<b>VS</b><span class="chVsN"><img class="chVsAv" src="${d.cav ? 'img/av/' + d.cav + '.webp' : ART.avFor(d.cname)}" alt=""><br>${UI.esc(d.cname)}</span></div>
      <div class="mdK">LIVE CHALLENGE · ${secs}s TO ACCEPT</div><div class="mdT">${UI.esc(d.cname)} (Lv ${d.clv}) challenged you!</div>
      <div class="mdS">${modeName(d.mode)} · ${gridName(d.grid)} · 1 vs 1, same pattern${d.stake ? ` · bet ${fmt(d.stake)}` : ''}</div>
      ${practice ? `<button class="btn big" data-pick="fun">${ART.ic('play')} ACCEPT · FOR FUN</button>` : `
        ${canBet ? `<button class="btn big" data-pick="bet">${ART.coin(18)} BET ${fmt(d.stake)} · WIN ${fmt(d.stake * 2)}</button>` : ''}
        ${aL > 0 ? `<button class="btn big pulse" data-pick="ad">${ART.ic('ad')} WATCH AD · WIN ${fmt(C().worldAdWin)}</button>` : `<button class="btn big" data-pick="fun">${ART.ic('play')} ACCEPT · NO PRIZE <small>(ad limit today)</small></button>`}`}
      <button class="btn ghost" data-pick="no">Decline</button></div>`, 'chAcc');
    clearTimeout(timer);
    if (!v) return;
    if (v === 'no') { FB.wPatch(d._id, { status: 'declined' }).catch(() => { }); return; }
    if (UI.cur === 'game') return;
    let how = v === 'bet' ? 'bet' : v === 'ad' ? 'ad' : 'fun';
    try { await FB.wPatch(d._id, { status: 'accepted', fhow: how, fname: s.name, fpid: s.pid, fav: s.avatar || '', acts: now() }); }
    catch (e) { return UI.toast('This challenge is no longer open', 'clock'); }
    if (how === 'bet' && !S.spend('coins', d.stake)) how = 'fun';
    if (how === 'ad') { if (await ADS.rewarded('chalWorld')) useAd('w'); else how = 'fun'; }
    const w = { id: d._id, side: 'f', name: d.cname, mode: d.mode, grid: d.grid, seed: d.seed, stake: how === 'bet' ? d.stake : 0, how, ts: now(), pending: true, world: true };
    s.chal.world = (s.chal.world || []).concat([w]).slice(-20); s.chal.invites = []; S.save();
    UI.closeSheet();
    G.start({ mode: d.mode, ladder: { start: C().ladder.start, grid: d.grid }, chal: { role: 'world', side: 'f', id: d._id, name: d.cname, mode: d.mode, grid: d.grid, seed: d.seed, stake: w.stake, how, world: true } });
  }
  /* settle live World duels once both results are in (15 min max, then the bet comes back) */
  async function worldPending() {
    const s = st(), list = (s.chal.world || []).filter(w => w.pending && w.done);
    for (const w of list) {
      let d = null; try { d = await FB.wGet(w.id); } catch (e) { continue; }
      if (d && d.cdone && d.fdone) settleWorld(w, d, true);
      else if (now() - w.ts > 15 * 6e4) { w.pending = false; w.void = true; if (w.how === 'bet' && w.stake) S.grant({ coins: w.stake }); const p = s.chal.played.find(x => x.id === w.id); if (p) { p.pending = false; p.void = true; } S.save(); }
    }
  }
  function settleWorld(w, d, quiet) {
    const s = st();
    const me = w.side === 'c' ? { tiles: d.ct, err: d.ce, secs: d.cs } : { tiles: d.ft, err: d.fe, secs: d.fs };
    const op = w.side === 'c' ? { tiles: d.ft, err: d.fe, secs: d.fs } : { tiles: d.ct, err: d.ce, secs: d.cs };
    const won = beats(me, op);
    let paid = 0;
    if (won && canWinCoins()) paid = w.how === 'bet' ? w.stake * 2 : w.how === 'ad' ? C().worldAdWin : 0;
    if (paid) S.grant({ coins: paid });
    if (won) { s.stats.chalWins = (s.stats.chalWins || 0) + 1; S.passAdd('chal'); if (s.stats.chalWins >= 5) UI.badge('slayer'); }
    w.pending = false; w.won = won; w.paid = paid;
    const p = s.chal.played.find(x => x.id === w.id); if (p) { p.pending = false; p.won = won; p.paid = paid; p.target = op.tiles; }
    S.save();
    if (quiet && UI.cur !== 'game') UI.toast(`Live duel vs ${UI.esc(w.name)}: ${me.tiles} vs ${op.tiles} · ${won ? 'YOU WON' + (paid ? ' +' + fmt(paid) : '') : 'you lost'}`, won ? 'trophy' : 'x');
    return { won, paid, me, op };
  }

  /* ---------- end of a duel run ---------- */
  async function onEnd(res) {
    const s = st(), ch = res.chal, err = Math.max(0, res.taps - res.correct), secs = Math.round(res.time);
    if (ch.role === 'make') {
      const c = { id: ch.id, mode: ch.mode || res.mode, grid: ch.grid, seed: ch.seed, stake: ch.stake, how: ch.how, ts: ch.ts, tiles: res.tiles, err, secs, settled: false, plays: 0, beat: 0, earned: 0 };
      s.chal.sent.push(c); if (s.chal.sent.length > 30) s.chal.sent.splice(0, 10);
      c.code = makeCode(c); S.save();
      if (FB.on) { try { await FB.putDuel({ id: c.id, cid: s.pid, cname: s.name, mode: c.mode, grid: c.grid, seed: c.seed, tiles: c.tiles, err, secs, stake: c.stake, how: c.how, ts: c.ts, status: 'open', toPid: '' }); c.online = true; S.save(); } catch (e) { } }
      return resultScreen({ role: 'made', c, tiles: res.tiles });
    }
    if (ch.role === 'world') {
      const w = (s.chal.world || []).find(x => x.id === ch.id) || {};
      w.done = true; w.tiles = res.tiles;
      const p = { id: ch.id, cid: 'world', name: ch.name, target: null, mode: res.mode, tiles: res.tiles, err, secs, won: false, how: ch.how, stake: ch.stake, world: true, pending: true, day: S.dayKey(), ts: now() };
      s.chal.played.push(p); if (s.chal.played.length > 40) s.chal.played.splice(0, 10); S.save();
      const mine = ch.side === 'c' ? { ct: res.tiles, ce: err, cs: secs, cdone: true } : { ft: res.tiles, fe: err, fs: secs, fdone: true };
      try { await FB.wPatch(ch.id, mine); } catch (e) { }
      return worldWait(w, p);
    }
    /* friend challenger or bot */
    const won = beats({ tiles: res.tiles, err, secs }, { tiles: ch.target, err: ch.terr || 0, secs: ch.tsecs || 0 });
    let paid = 0;
    if (won && ch.how !== 'practice' && canWinCoins()) paid = ch.how === 'bet' ? ch.stake * 2 : ch.how === 'ad' ? (ch.bot ? C().worldAdWin : C().adWin) : ch.how === 'noad' ? C().noAdWin : 0;
    if (paid) S.grant({ coins: paid });
    if (won) { s.stats.chalWins = (s.stats.chalWins || 0) + 1; S.passAdd('chal'); if (s.stats.chalWins >= 5) UI.badge('slayer'); }
    const p = { id: ch.id, cid: ch.cid, name: ch.name, target: ch.target, mode: res.mode, tiles: res.tiles, err, secs, won, how: ch.how, stake: ch.stake, bot: !!ch.bot, world: !!ch.world, paid, day: S.dayKey(), ts: now() };
    s.chal.played.push(p); if (s.chal.played.length > 40) s.chal.played.splice(0, 10); S.save();
    if (FB.on && !ch.bot) { try { await FB.putPlay({ did: ch.id, cpid: ch.cid, pid: s.pid, name: s.name, tiles: res.tiles, err, secs, how: ch.how, stake: ch.stake || 0, won, ts: now() }); } catch (e) { } }
    if (won && typeof RATE !== 'undefined') RATE.maybe('duel');
    resultScreen({ role: 'played', p, won, paid });
  }
  /* live World duel: wait on the result screen for the other player */
  async function worldWait(w, p) {
    resultScreen({ role: 'wwait', p });
    const end = now() + 3 * 6e4;
    while (now() < end && UI.cur === 'result') {
      await new Promise(r => setTimeout(r, 3500));
      let d = null; try { d = await FB.wGet(w.id); } catch (e) { }
      if (d && d.cdone && d.fdone) { const r = settleWorld(w, d, false); if (r.won && typeof RATE !== 'undefined') RATE.maybe('duel'); return resultScreen({ role: 'played', p: { ...p, target: r.op.tiles, won: r.won }, won: r.won, paid: r.paid }); }
    }
  }

  function resultScreen(o) {
    UI.show('result');
    let html;
    if (o.role === 'made') {
      const c = o.c;
      html = `<div class="resFace">${ART.sanx('smug')}<div class="heroBubble sm">Now share it. Who can beat you?</div></div>
        <div class="resK">CHALLENGE READY</div><div class="resBig"><span id="resN">0</span><small>tiles to beat · ${modeName(c.mode)} · ${gridName(c.grid)}</small></div>
        <div class="resNext">One link for everyone: WhatsApp, groups, Facebook, Instagram. Open for <b>24 hours</b>, one try per player.${c.how === 'bet' ? ` You earn 50% of every losing bet, up to ${fmt(c.stake * C().betCap)}.` : ` First player who fails pays you ${fmt(C().creatorAdWin)} coins.`}</div>
        <button class="btn big pulse" data-act="chSend:${c.id}">${ART.ic('share')} SHARE CHALLENGE</button>
        <div class="row2"><button class="btn ghost" data-act="chal">${ART.ic('swords')} Challenges</button><button class="btn ghost" data-act="home">${ART.ic('home')} Home</button></div>`;
    } else if (o.role === 'wwait') {
      const p = o.p;
      html = `<div class="resFace">${ART.sanx('smug')}<div class="heroBubble sm">Let's see what they got…</div></div>
        <div class="resK">LIVE DUEL</div><div class="resBig"><span id="resN">0</span><small>tiles · waiting for ${UI.esc(p.name)}</small></div>
        <div class="wRadar sm"><i></i><i></i><i></i>${ART.ic('globe')}</div>
        <div class="resNext">The result appears here when ${UI.esc(p.name)} finishes. You can leave: it settles by itself.</div>
        <div class="row2"><button class="btn ghost" data-act="chal">${ART.ic('swords')} Challenges</button><button class="btn ghost" data-act="home">${ART.ic('home')} Home</button></div>`;
    } else {
      const p = o.p;
      html = `<div class="resFace">${ART.sanx(o.won ? 'shock' : 'laugh')}<div class="heroBubble sm">${o.won ? 'You beat ' + UI.esc(p.name) + '!' : UI.esc(p.name) + ' wins this one.'}</div></div>
        <div class="resK">${o.won ? 'YOU WON' : 'YOU LOST'}${p.bot ? ' · vs BOT' : ''}</div><div class="resBig"><span id="resN">0</span><small>tiles · ${UI.esc(p.name)} had ${p.target}</small></div>
        ${o.paid ? `<div class="resRow"><span>${ART.coin(18)} <b>+${fmt(o.paid)}</b></span></div>` : ''}
        ${o.won && o.paid ? `<button class="btn alt" data-act="chBonus:${Math.round(o.paid * C().winBonusAd)}">${ART.ic('ad')} +50% bonus <small>+${fmt(Math.round(o.paid * C().winBonusAd))}</small></button>` : ''}
        ${UI.clipBtn(G.last)}
        ${o.won ? `<button class="btn big" data-act="chShareWin:${p.tiles}:${p.target}">${ART.ic('share')} SHOW OFF</button>` : `<button class="btn big pulse" data-act="chRematch:${p.mode}">${ART.ic('swords')} Rematch · make your own</button>`}
        <div class="row2"><button class="btn ghost" data-act="chal">${ART.ic('swords')} Challenges</button><button class="btn ghost" data-act="home">${ART.ic('home')} Home</button></div>`;
      if (o.won) FX.win('fireworks');
    }
    $('result').innerHTML = `<div class="resCard chRes">${html}</div>`;
    const n = $('resN'); if (n) FX.countUp(n, o.role === 'made' ? o.tiles : o.p.tiles, 700);
  }

  /* ---------- sharing (link only) ---------- */
  function shareChallenge(c) {
    const txt = `⚔️ ${st().name} challenges you on Beat Sanx!\nI remembered a ${c.tiles}-tile pattern (${modeName(c.mode)}, ${gridName(c.grid || 4)}). Can you beat me? One try only.\n\nTap to play: ${LINK}${c.code}\nOpen for 24 hours.`;
    SH.challenge(c, txt);
  }
  function handle(txt) {
    const p = parse(txt);
    if (!p) { UI.toast('No Beat Sanx challenge found in this link', 'info'); return false; }
    if (p.bad) { UI.toast('This link looks changed or broken', 'x'); return false; }
    if (p.old || p.kind !== 'C') { UI.toast('This link is from an older version. Ask for a new challenge.', 'info'); return false; }
    accept(p); return true;
  }
  /* app opened from a challenge link (web: ?c=...) + background checks */
  function checkClipboard() {
    refundExpired(); sync();
    const q = new URLSearchParams(location.search).get('c'); if (q && !checkClipboard.urlDone) { checkClipboard.urlDone = true; handle(q); }
  }
  let loop = null;
  function startLoop() { if (loop) return; loop = setInterval(() => { inviteCheck(); sync(); }, 20000); setTimeout(inviteCheck, 4000); }

  async function act(a, el) {
    const [k, v, w] = a.split(':'), s = st();
    switch (k) {
      case 'chKind': kind = v; view = 'mode'; render(); break;
      case 'chBack': view = view === 'set' ? 'mode' : 'home'; render(); break;
      case 'chMode': mkMode = v; view = 'set'; render(); break;
      case 'chModeLk': UI.toast(`Reach level ${D.MODE[v].unlock} to unlock`, 'lock'); break;
      case 'chGrid': mkGrid = +v; render(); break;
      case 'chPay': mkPay = v; render(); break;
      case 'chStake': mkPay = 'bet'; mkStake = +v; render(); break;
      case 'chNoStake': UI.toast(!canWinCoins() ? `Reach level ${C().minLevel} to bet coins` : 'Max bet is 10% of your coins', 'coins'); break;
      case 'chAdCap': UI.toast('Ad limit reached today. Use a coin bet.', 'ad'); break;
      case 'chGo': go(); break;
      case 'chWCancel': if (searching) searching.cancel = true; break;
      case 'chInv': { const d = (s.chal.invites || []).find(x => x._id === v); if (d) { UI.closeSheet(); inviteModal(d); } break; }
      case 'chSend': case 'chResend': { const c = s.chal.sent.find(x => x.id === v); if (c) { if (!c.code) c.code = makeCode(c); shareChallenge(c); } break; }
      case 'chBonus': if (await ADS.rewarded('chalBonus')) { S.grant({ coins: +v }); el.remove(); UI.toast(`+${fmt(+v)} bonus`, 'coins'); FX.flyCoins(el); } break;
      case 'chRematch': kind = 'friend'; mkMode = S.unlocked(v) ? v : 'classic'; view = 'set'; render(); break;
      case 'chShareWin': SH.victory(+v, +w); break;
    }
  }
  return { open, act, onEnd, pendingCount, checkClipboard, handle, parse, makeCode, refundExpired, sync, startLoop, inviteCheck };
})();

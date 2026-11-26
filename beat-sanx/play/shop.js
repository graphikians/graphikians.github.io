/* ================= BEAT SANX — SHOP =================
   Tabs: Free (ads) · Skins · Animated · Tap FX · Shapes · Sounds · Flash · Win FX · Frames · Sets · Boosters · Chests
   Normal items: coins (5,000+) + 30 min ad trial (max 10 trials a day).
   Premium items: coins or diamonds (500-5,000), no trial. */
'use strict';
const SHOP = (() => {
  const $ = id => document.getElementById(id);
  const fmt = n => UI.fmt(n);
  let tab = 'home';
  const TABS = [['free', 'Free', 'ad'], ['bg', 'Backgrounds', 'image'], ['anim', 'Animated', 'sparkle'], ['skins', 'Skins', 'palette'], ['tap', 'Tap FX', 'zap'], ['shape', 'Shapes', 'square'], ['sound', 'Sounds', 'music'],
    ['flash', 'Flash', 'sun'], ['win', 'Win FX', 'trophy'], ['frame', 'Frames', 'crown'], ['sets', 'Sets', 'gift'], ['boost', 'Boosters', 'bulb'], ['chests', 'Chests', 'vault']];
  const COLL_TABS = ['anim', 'tap', 'shape', 'sound', 'flash', 'win', 'frame'];
  const itemsOf = cat => cat === 'anim' ? D.SKINS.filter(s => s.cat === 'anim') : D.COS[cat].filter(x => x.cost > 0);

  const adDay = () => { const st = S.st, d = S.dayKey(); if (!st.adDay || st.adDay.d !== d) { st.adDay = { d, n: 0, got: [], offers: {} }; S.save(); } return st.adDay; };
  const curIc = (k, s = 26) => k === 'gem' ? ART.gem(s) : k === 'coin' ? ART.coin(s) : k === 'shield' ? ART.shieldC(s) : ART.ic(k);
  const rTxt = r => [r.coins ? `${ART.coin(13)}${fmt(r.coins)}` : '', r.gems ? `${ART.gem(13)}${r.gems}` : '', r.shields ? `${ART.shieldC(13)}${r.shields}` : '', r.chest ? `${ART.ic('gift')}${D.CHESTS.find(c => c.id === r.chest).name.split(' ')[0]}` : '', r.boost ? ART.ic(D.BOOST[r.boost] ? D.BOOST[r.boost].icon : 'bulb') : ''].filter(Boolean).join(' ');
  const hms = ms => { const h = Math.floor(ms / 36e5), m = Math.floor(ms % 36e5 / 6e4); return h ? `${h}h ${m}m` : `${m}m ${Math.floor(ms % 6e4 / 1e3)}s`; };
  function giftLeft() { return Math.max(0, (S.st.giftAt || 0) + D.FREE_GIFT_EVERY - Date.now()); }
  function dealSkin() { const pool = D.SKINS.filter(s => s.cost > 0 && !s.cat && !S.st.skins.includes(s.id)); if (!pool.length) return null; const seed = +S.dayKey().replace(/\D/g, ''); return pool[seed % pool.length]; }

  /* ---------- previews ---------- */
  const mini = (sk, attrs = '', n = 9, cls = '') => `<div class="miniBoard ${n === 4 ? 'four' : ''} ${cls}" ${attrs}>${Array.from({ length: n }, (_, i) => `<span class="tile" style="--c:${sk.colors[i % 9]}"><span class="tFace">${ART.tileIc(sk.icons[i % 9])}</span></span>`).join('')}</div>`;
  const prevSkin = () => D.skin(S.active('skin'));
  function preview(cat, it) {
    if (cat === 'anim') return mini(it, `data-anim="${it.anim}" data-shape="${S.active('shape')}"`);
    if (cat === 'skin') return mini(it, `data-shape="${S.active('shape')}"`);
    if (cat === 'shape') return mini(prevSkin(), `data-shape="${it.id}"`, 4);
    if (cat === 'flash') return `<div class="miniBoard fl" data-flash="${it.id}" data-shape="${S.active('shape')}">${[0, 1, 2, 3].map(i => `<span class="tile ${i === 1 ? 'on' : ''}" style="--c:${prevSkin().colors[i]}"><span class="tGlow"></span><span class="tFace">${ART.tileIc(prevSkin().icons[i])}</span><span class="tFx"></span></span>`).join('')}</div>`;
    if (cat === 'frame') return `<div class="frPrev">${ART.avatar(it.id)}</div>`;
    const ic = { tap: 'zap', sound: 'music', win: 'trophy' }[cat];
    return `<div class="fxPrev">${ART.ic(ic)}</div>`;
  }

  /* ---------- RENDER ---------- */
  /* landing: every category visible at once (no hidden horizontal scroll) */
  function homeGrid() {
    const st = S.st, ad = adDay(), freeDot = !giftLeft() || D.AD_TRACK.some((t, i) => ad.n >= t.n && !ad.got.includes(i));
    const cnt = { bg: `${D.BGS.length} live scenes`, free: 'Daily gifts', anim: `${itemsOf('anim').length} tiles`, skins: `${D.SKINS.filter(x => x.cost > 0 && !x.cat).length} skins`, tap: '10 effects', shape: '10 shapes', sound: '10 packs', flash: '10 styles', win: '10 effects', frame: '10 frames', sets: `${D.SETS.length} sets · 20% off`, boost: `${D.BOOSTERS.length} boosters`, chests: `${D.CHESTS.length} chests` };
    const feat = itemsOf('anim').find(x => x.gems && !S.st.skins.includes(x.id)) || itemsOf('anim')[0];
    return `${adFreeHero()}${passPerks()}<div class="free100">${ART.ic('check')}<span>100% FREE · Earn everything with coins and ads. Never real money.</span></div>
      ${feat ? `<button class="featShop" data-tab="anim"><small>FEATURED · ${feat.gems ? 'VIP' : 'NEW'}</small><b>${feat.name} tiles</b><span>${feat.gems ? 'Premium animated tiles' : 'Try free for 30 min with an ad'}</span><div class="fsBoard">${feat.colors.slice(0, 9).map(c => `<i style="--c:${c}"></i>`).join('')}</div></button>` : ''}
      <div class="catGrid">${TABS.map(([k, t, ic]) => `<button class="catC ${k === 'free' ? 'free' : ''}" data-tab="${k}">${k === 'free' && freeDot ? '<span class="nb">!</span>' : ['bg', 'anim', 'tap'].includes(k) ? '<span class="nb">NEW</span>' : ''}<span class="ci">${ART.ic(ic)}</span><b>${t}</b><small>${cnt[k]}</small></button>`).join('')}</div>`;
  }
  function render() {
    const st = S.st;
    // safety net: ad-unlock skins unlock as soon as the count is reached (also fixes 8/8 not unlocking)
    for (const sk of D.SKINS.filter(x => x.ads)) if ((st.adsTotal || 0) >= sk.ads && !st.skins.includes(sk.id)) { st.skins.push(sk.id); S.save(); setTimeout(() => UI.toast(`${sk.name} skin unlocked!`, 'sparkle'), 200); }
    let body = '';
    if (tab === 'home') body = homeGrid();
    else if (tab === 'free') body = freeTab();
    else if (tab === 'bg') body = bgTab();
    else if (tab === 'skins') body = skinsTab();
    else if (tab === 'anim' || D.COS[tab]) body = cosTab(tab);
    else if (tab === 'sets') body = setsTab();
    else if (tab === 'boost') body = boostTab();
    else body = chestTab();
    const freeDot = !giftLeft() || D.AD_TRACK.some((t, i) => adDay().n >= t.n && !adDay().got.includes(i));
    const tl = TABS.find(x => x[0] === tab);
    $('shop').innerHTML = `${UI.topbar()}<div class="shopHead">${tab === 'home' ? '<div class="pgT">Shop</div>' : `<button class="backCat" data-tab="home">${ART.ic('back')}<span>${tl ? tl[1] : 'Shop'}</span></button>`}<button class="trChip" data-act="shColl">${ART.ic('palette')} Collection</button><span class="trChip">${ART.ic('clock')} Trials ${S.trialsLeft()}/${D.TRIAL_MAX_DAY}</span></div>
      <div class="pgBody" id="shopBody">${body}</div>`;
  }

  /* v1.8 Sanx Pass perks shown in the Shop: active coupon + shard progress toward a real skin */
  function passPerks() {
    const st = S.st, off = S.couponOff(), n = st.shards || 0, t = S.shardTarget();
    let h = '';
    if (off) { const left = st.coupon.until - Date.now(); h += `<div class="ppCard cp">${ART.ic('ticket')}<div><b>${off}% OFF coupon</b><small>Any skin or style you buy with coins · ${Math.floor(left / 36e5)}h ${Math.floor(left % 36e5 / 6e4)}m left</small></div><button class="btn sm" data-tab="skins">Use it</button></div>`; }
    if (n > 0 && t) {
      const missing = Math.max(0, D.SHARDS - n), per = Math.ceil(t.cost / D.SHARDS);
      h += `<div class="ppCard sh">${ART.ic('diamond')}<div><b>${t.name} skin · ${Math.min(n, D.SHARDS)}/${D.SHARDS} shards</b><div class="bar"><i style="width:${Math.min(100, n / D.SHARDS * 100)}%"></i></div><small>${missing ? `Complete the rest for ${fmt(missing * per)} coins` : 'All shards collected!'}</small></div><button class="btn sm ${missing ? '' : 'pulse'}" data-act="shShard">${missing ? ART.coin(13) + ' ' + fmt(missing * per) : 'Claim'}</button></div>`;
    }
    return h;
  }
  function shardClaim() {
    const st = S.st, n = st.shards || 0, t = S.shardTarget(); if (!t || n <= 0) return;
    const missing = Math.max(0, D.SHARDS - n), cost = missing * Math.ceil(t.cost / D.SHARDS);
    if (cost && !S.spend('coins', cost)) { UI.toast('Not enough coins', 'coins'); return; }
    st.shards = Math.max(0, n - D.SHARDS); S.grant({ skin: t.id }); st.skin = t.id; S.save(); SND.win(); FX.win('fireworks'); UI.toast(`${t.name} skin unlocked!`, 'sparkle'); render();
  }
  /* v1.6 hero: the 1-crore-coin Ad-free, with a progress bar and 10% milestones */
  function adFreeHero() {
    const st = S.st;
    if (st.noAds) return `<div class="afHero own"><span class="afIc">${ART.ic('shield')}</span><div><small>AD-FREE</small><b>Ad-free is ON</b><em>No banners, no break ads. Reward ads stay optional.</em></div></div>`;
    const p = Math.min(1, st.coins / D.NO_ADS_PRICE), pc = Math.floor(p * 100), ms = Math.floor(p * 10);
    return `<div class="afHero"><div class="afTop"><span class="afIc">${ART.ic('shield')}</span><div><small>THE BIG ONE</small><b>Go Ad-free forever</b><em>1 crore coins · no banners, no break ads</em></div></div>
      <div class="afBar"><i style="width:${p * 100}%"></i>${Array.from({ length: 9 }, (_, k) => `<span class="${k < ms ? 'on' : ''}" style="left:${(k + 1) * 10}%"></span>`).join('')}</div>
      <div class="afRow"><span>${ART.coin(15)} <b>${UI.short(st.coins)}</b> / 1 Cr</span><span class="afPc">${pc}%${ms < 10 ? ` · next milestone ${(ms + 1) * 10}%` : ''}</span></div>
      <button class="btn big ${st.coins >= D.NO_ADS_PRICE ? 'pulse' : 'off'}" data-act="buyNoAds">${st.coins >= D.NO_ADS_PRICE ? `${ART.ic('shield')} UNLOCK AD-FREE` : `${ART.ic('lock')} ${UI.short(D.NO_ADS_PRICE - st.coins)} coins to go`}</button>
      <small class="afNote">Reward ads (free boosters, chests, revives) keep working after Ad-free.</small></div>`;
  }
  /* v1.6 animated backgrounds */
  const bgOwned = id => (S.st.bg.own || []).includes(id);
  function bgTab() {
    const st = S.st, b = st.bg, act = BG.active(), d = S.dayKey(); if (b.tday.d !== d) { b.tday = { d, n: 0 }; S.save(); }
    const tr = b.trial && b.trial.until > Date.now() ? b.trial : null;
    const cards = D.BGS.map(x => {
      const own = bgOwned(x.id), on = act === x.id, trying = tr && tr.id === x.id;
      const price = x.gems ? `${ART.gem(14)} ${fmt(x.gems)}` : x.cost ? `${ART.coin(14)} ${fmt(x.cost)}` : 'FREE';
      return `<div class="bgCard ${on ? 'on' : ''}"><canvas class="bgPrev" width="150" height="220" data-bg="${x.id}"></canvas>
        <div class="bgInfo"><b>${x.name}</b><small>${x.tag}</small>
        ${on ? `<em class="bgOnTag">${ART.ic('check')} ${trying ? 'Trying · ' + hms(tr.until - Date.now()) : 'In use'}</em>` : own ? `<button class="btn sm" data-act="bgUse:${x.id}">Use</button>`
          : `<div class="bgBtns"><button class="btn sm" data-act="bgBuy:${x.id}">${price}</button><button class="btn sm ghost" data-act="bgTry:${x.id}">${ART.ic('ad')} 30 min</button></div>`}</div></div>`;
    }).join('');
    setTimeout(() => document.querySelectorAll('.bgPrev').forEach(c => { if (!c._p) c._p = BG.preview(c, c.dataset.bg); }), 30);
    return `<div class="bgHead"><b>Live backgrounds</b><small>Behind your home and game screens. Calm, never distracting.</small>
      <button class="setRow bgTog" data-tog="bg">${ART.ic('image')}<span>Animated background</span><i class="sw ${st.set.bg !== false ? 'on' : ''}"></i></button>
      <small class="muted">Ad trials today: ${b.tday.n}/10</small></div><div class="bgGrid">${cards}</div>`;
  }
  function freeTab() {
    const st = S.st, ad = adDay(), gl = giftLeft(), last = D.AD_TRACK[D.AD_TRACK.length - 1].n;
    const nodes = D.AD_TRACK.map((t, i) => { const ok = ad.n >= t.n, got = ad.got.includes(i); return `<button class="tkNode ${ok ? 'ok' : ''} ${got ? 'got' : ''} ${i === D.AD_TRACK.length - 1 ? 'end' : ''}" style="left:${t.n / last * 100}%" data-act="${ok && !got ? 'shTrack:' + i : 'shTrackInfo:' + i}"><i>${got ? ART.ic('check') : t.n}</i><span>${rTxt(t.r)}</span></button>`; }).join('');
    const offers = D.AD_OFFERS.map(o => {
      const used = ad.offers[o.id] || 0, left = o.cap - used, coolLeft = o.cool ? Math.max(0, (st.offerCool && st.offerCool[o.id] || 0) + o.cool - Date.now()) : 0;
      const off = left <= 0 || coolLeft > 0;
      return `<button class="offer ${off ? 'off' : ''}" data-act="shOffer:${o.id}"><span class="ofIc">${curIc(o.icon, 30)}</span><b>${o.name}</b><small>${left <= 0 ? 'Back tomorrow' : coolLeft ? 'Ready in ' + hms(coolLeft) : left + ' left today'}</small><em>${ART.ic('ad')} FREE</em></button>`;
    }).join('');
    const ds = dealSkin(), dp = ds ? Math.round(ds.cost * (1 - D.DEAL_OFF)) : 0;
    const adSkins = D.SKINS.filter(x => x.ads).map(sk => { const own = st.skins.includes(sk.id), n = Math.min(sk.ads, st.adsTotal || 0); return `<div class="adSkin ${own ? 'own' : ''}">${mini(sk, '', 9, 'sm')}<div><b>${sk.name}</b><small>${own ? 'Unlocked' : `Watch ${sk.ads} reward ads`}</small>${own ? '' : `<div class="bar"><i style="width:${n / sk.ads * 100}%"></i></div><small>${n}/${sk.ads}</small>`}</div>${own ? (st.skin === sk.id ? `<span class="eqTag">${ART.ic('check')}</span>` : `<button class="btn sm ghost" data-equip="skin:${sk.id}">Equip</button>`) : ''}</div>`; }).join('');
    const fest = EV.fest();
    return `
      <div class="giftCard ${gl ? '' : 'ready'}"><span class="gfIc">${ART.ic('gift')}</span><div><b>Free gift</b><small>${gl ? 'Next gift in ' + hms(gl) : 'Ready! No ad needed'}</small></div>${gl ? `<button class="btn sm ghost" data-act="shGiftAd">${ART.ic('ad')} Skip wait</button>` : `<button class="btn sm" data-act="shGift">OPEN</button>`}</div>
      <div class="trackCard"><div class="tkHead"><b>${ART.ic('ad')} Daily ad rewards</b><span>${ad.n} watched today</span></div>
        <div class="tkBar"><div class="tkFill" style="width:${Math.min(100, ad.n / last * 100)}%"></div>${nodes}</div>
        <small class="tkNote">Every reward ad you watch fills the track. Resets at midnight.</small></div>
      <div class="secT">Watch & win</div><div class="offerGrid">${offers}</div>
      ${fest && fest.live ? `<button class="festShop" data-act="live" style="--la:${fest.f.theme[0]};--lb:${fest.f.theme[1]}">${ART.ic(fest.f.icon)}<div><b>${fest.f.fest} special</b><small>Win the ${D.skin(fest.f.skin).name} skin in the festival event</small></div>${ART.ic('next')}</button>` : ''}
      <div class="secT">Today's deals</div>
      ${ds ? `<div class="dealCard">${mini(ds, '', 9, 'sm')}<div><em class="offTag">${Math.round(D.DEAL_OFF * 100)}% OFF</em><b>${ds.name} skin</b><small><s>${fmt(ds.cost)}</s> today only</small></div><button class="btn sm" data-act="shDeal">${ART.coin(14)} ${fmt(dp)}</button></div>` : ''}
      <div class="dealCard"><span class="bsIc">${ART.ic('sparkle')}</span><div><b>Booster bundle</b><small>${D.BUNDLE.boosts} random boosters · save 40%</small></div><button class="btn sm" data-act="shBundle">${ART.coin(14)} ${fmt(D.BUNDLE.price)}</button></div>
      <div class="secT">Ad-unlock skins</div>${adSkins}
      </div>`;
  }

  function skinsTab() {
    const st = S.st, tr = S.trial('skin');
    const list = D.SKINS.filter(s => !s.cat && !s.ads && ((!s.fest && s.cost !== -6) || st.skins.includes(s.id)));
    return (tr ? trialBar('skin', tr) : '') + `<div class="skGrid">` + list.map(s => {
      const own = st.skins.includes(s.id), eq = st.skin === s.id && !tr, trying = tr && tr.id === s.id;
      let btn;
      if (eq) btn = `<span class="eqTag">${ART.ic('check')} Equipped</span>`;
      else if (own) btn = `<button class="btn sm ghost" data-equip="skin:${s.id}">Equip</button>`;
      else if (s.cost === -1) btn = `<span class="lockTag">${ART.ic('lock')} Prestige ${s.prestige}</span>`;
      else if (s.cost === -2) btn = `<span class="lockTag">${ART.ic('lock')} Sanx Mania</span>`;
      else if (s.cost === -5) btn = `<span class="lockTag">${ART.ic('ticket')} Pass tier 30</span>`;
      else if (s.cost < 0) btn = `<span class="lockTag">${ART.ic('lock')} Special</span>`;
      else btn = `<button class="btn sm" data-buyskin="${s.id}:coins">${ART.coin(14)} ${fmt(s.cost)}</button>${trying ? `<small class="tryOn">On trial</small>` : `<button class="tryBtn" data-act="shTrial:skin:${s.id}">${ART.ic('ad')} Try 30 min</button>`}`;
      return `<div class="skCard ${eq || trying ? 'eq' : ''}">${mini(s)}<b>${s.name}</b>${btn}</div>`;
    }).join('') + `</div>`;
  }
  function trialBar(cat, tr) { const name = cat === 'skin' ? D.skin(tr.id).name : D.cos(cat, tr.id).name; return `<div class="trialBar">${ART.ic('clock')} Trying <b>${name}</b> · ${hms(tr.until - Date.now())} left</div>`; }

  /* animated tiles + all cosmetic tabs share one layout */
  function cosTab(cat) {
    const st = S.st, key = cat === 'anim' ? 'skin' : cat, tr = S.trial(key);
    const all = itemsOf(cat), normal = all.filter(x => !x.premium), prem = all.filter(x => x.premium);
    const def = cat !== 'anim' ? D.COS[cat][0] : null;
    const tabInfo = cat === 'anim' ? { what: 'Tiles that move and glow' } : D.COS_TABS.find(x => x.id === cat);
    const owned = all.filter(i => S.owns(key, i.id)).length;
    const hero = prem[Math.floor(Date.now() / 864e5) % prem.length];
    const card = it => {
      const own = S.owns(key, it.id), eq = (cat === 'anim' ? st.skin : (st.cos[cat] || def.id)) === it.id && !tr, trying = tr && tr.id === it.id;
      let btn;
      if (eq) btn = `<span class="eqTag">${ART.ic('check')} Equipped</span>`;
      else if (own) btn = `<button class="btn sm ghost" data-equip="${key}:${it.id}">Equip</button>`;
      else if (it.premium) btn = `<div class="buy2"><button class="btn sm" data-buyskin="${key}:${it.id}:coins">${ART.coin(13)} ${UI.short(it.cost)}</button><button class="btn sm gemB" data-buyskin="${key}:${it.id}:gems">${ART.gem(13)} ${fmt(it.gems)}</button></div>`;
      else btn = `<button class="btn sm" data-buyskin="${key}:${it.id}:coins">${ART.coin(13)} ${fmt(it.cost)}</button>${trying ? `<small class="tryOn">On trial</small>` : `<button class="tryBtn" data-act="shTrial:${key}:${it.id}">${ART.ic('ad')} Try 30 min</button>`}`;
      return `<div class="cosCard ${it.premium ? 'vip' : ''} ${eq || trying ? 'eq' : ''}" data-cos="${cat}:${it.id}">${it.premium ? '<span class="vipRib">VIP</span>' : ''}${preview(cat, it)}<b>${it.name}</b><small>${it.desc || ''}</small>${btn}</div>`;
    };
    return (tr ? trialBar(key, tr) : '') + `
      <div class="cosHero" data-cos="${cat}:${hero.id}">${preview(cat, hero)}<div><span class="vipRib">VIP · FEATURED</span><b>${hero.name}</b><small>${hero.desc}</small><div class="buy2">${S.owns(key, hero.id) ? `<span class="eqTag">${ART.ic('check')} Owned</span>` : `<button class="btn sm" data-buyskin="${key}:${hero.id}:coins">${ART.coin(13)} ${UI.short(hero.cost)}</button><button class="btn sm gemB" data-buyskin="${key}:${hero.id}:gems">${ART.gem(13)} ${fmt(hero.gems)}</button>`}</div></div></div>
      <div class="cosInfo">${tabInfo.what} · <b>${owned}/10</b> owned · ${['tap', 'win', 'sound', 'flash'].includes(cat) ? 'Tap a card to preview' : 'Preview shown on each card'}</div>
      ${def ? `<div class="cosDef ${(st.cos[cat] || def.id) === def.id && !tr ? 'eq' : ''}"><b>${def.name}</b><small>Free default</small>${(st.cos[cat] || def.id) === def.id && !tr ? `<span class="eqTag">${ART.ic('check')}</span>` : `<button class="btn sm ghost" data-equip="${cat}:${def.id}">Use</button>`}</div>` : ''}
      <div class="secT">${ART.ic('ad')} Try with an ad · 30 min</div><div class="cosGrid">${normal.map(card).join('')}</div>
      <div class="secT vipT">${ART.ic('crown')} Premium VIP · no trial</div><div class="cosGrid">${prem.map(card).join('')}</div>
      ${cat === 'frame' && S.owns('frame', 'collector') ? `<div class="cosDef">${ART.avatar('collector')}<b>Collector frame</b>${(st.cos.frame === 'collector') ? `<span class="eqTag">${ART.ic('check')}</span>` : `<button class="btn sm ghost" data-equip="frame:collector">Use</button>`}</div>` : ''}`;
  }

  function setsTab() {
    const st = S.st;
    return `<div class="cosInfo">Matching items together · <b>20% off</b> · normal sets have a 30 min ad trial</div>` + D.SETS.map(set => {
      const pr = D.setPrice(set), items = Object.entries(set.items), owned = items.every(([k, id]) => S.owns(k === 'skin' ? 'skin' : k, id));
      const full = items.reduce((a, [k, id]) => a + D.setItem(k, id).cost, 0);
      const sk = D.skin(set.items.skin);
      return `<div class="setCard ${pr.premium ? 'vip' : ''} ${owned ? 'own' : ''}">${pr.premium ? '<span class="vipRib">VIP SET</span>' : ''}
        <div class="setTop">${mini(sk, `data-anim="${sk.anim || ''}"`)}<div><b>${ART.ic(set.icon)} ${set.name}</b><ul>${items.map(([k, id]) => `<li>${{ skin: 'Tiles', tap: 'Tap FX', sound: 'Sound', flash: 'Flash', win: 'Win FX', frame: 'Frame', shape: 'Shape' }[k]}: <b>${D.setItem(k, id).name}</b>${S.owns(k === 'skin' ? 'skin' : k, id) ? ' ' + ART.ic('check') : ''}</li>`).join('')}</ul></div></div>
        ${owned ? `<button class="btn ghost" data-act="shEquipSet:${set.id}">${ART.ic('check')} Equip whole set</button>` : `<div class="setBuy"><s>${ART.coin(12)} ${UI.short(full)}</s><button class="btn sm" data-act="shBuySet:${set.id}:coins">${ART.coin(13)} ${UI.short(pr.coins)}</button>${pr.premium ? `<button class="btn sm gemB" data-act="shBuySet:${set.id}:gems">${ART.gem(13)} ${fmt(pr.gems)}</button>` : `<button class="tryBtn" data-act="shTrialSet:${set.id}">${ART.ic('ad')} Try 30 min</button>`}</div>`}</div>`;
    }).join('');
  }
  function boostTab() {
    const st = S.st;
    return D.BOOSTERS.map(b => !S.boostOpen(b.id) ? `<div class="bsRow lockRow"><span class="bsIc">${ART.ic('lock')}</span><div class="bsTx"><b>${b.name}</b><small>${b.desc}</small></div><span class="lkTag">${ART.ic('lock')} LEVEL ${D.BOOST_LV[b.id]}</span></div>` : `<div class="bsRow"><span class="bsIc">${ART.ic(b.icon)}</span><div class="bsTx"><b>${b.name} <em>×${st.boosters[b.id] || 0}</em></b><small>${b.desc}</small></div>
        <div class="bsBtns"><button class="btn sm" data-buyb="${b.id}:coins">${ART.coin(14)} ${b.coins}</button><button class="btn sm ghost" data-buyb="${b.id}:gems">${ART.gem(14)} ${b.gems}</button></div></div>`).join('')
      + `<div class="bsRow"><span class="bsIc">${ART.shieldC(26)}</span><div class="bsTx"><b>Shield <em>×${st.shields}</em></b><small>Revive with full hearts after game over</small></div><div class="bsBtns"><button class="btn sm" data-act="shShield:coins">${ART.coin(14)} 400</button><button class="btn sm ghost" data-act="shShield:gems">${ART.gem(14)} ${D.SHIELD_GEMS}</button></div></div>
        <button class="freeHint" data-tab="free">${ART.ic('ad')} Get boosters free in the Free tab</button>`;
  }
  function chestTab() {
    return D.CHESTS.map(c => `<div class="chRow"><div class="chIc">${UI.chestSvg(c.color)}</div><div class="chTx"><b>${c.name}</b><small>${c.coins[0]}-${c.coins[1]} coins · ${c.gems[0]}-${c.gems[1]} diamonds · ${c.shields[0]}-${c.shields[1]} shields</small></div><button class="btn sm" data-chest="${c.id}">${ART.coin(14)} ${fmt(c.price)}</button></div>`).join('')
      + `<button class="freeHint" data-tab="free">${ART.ic('ad')} Free chest every 3 hours in the Free tab</button>`;
  }

  /* ---------- COLLECTION ---------- */
  function ownedCount() { return COLL_TABS.reduce((a, c) => a + itemsOf(c).filter(i => S.owns(c === 'anim' ? 'skin' : c, i.id)).length, 0); }
  function collection() {
    const st = S.st;
    const rows = COLL_TABS.map(c => {
      const key = c === 'anim' ? 'skin' : c, n = itemsOf(c).filter(i => S.owns(key, i.id)).length;
      const name = c === 'anim' ? 'Animated Tiles' : D.COS_TABS.find(x => x.id === c).name;
      return `<div class="clRow"><div><b>${name}</b><div class="bar"><i style="width:${n * 10}%"></i></div><small>${n}/10 · 5 = ${ART.gem(11)}50 + badge · 10 = ${ART.gem(11)}300 + Collector frame</small></div><em class="${st.collect.includes('tab10:' + c) ? 'ok' : st.collect.includes('tab5:' + c) ? 'half' : ''}">${n}/10</em></div>`;
    }).join('');
    const sets = D.SETS.map(s => `<span class="${st.collect.includes('set:' + s.id) ? 'ok' : ''}">${ART.ic(s.icon)} ${s.name}</span>`).join('');
    const tabsWith = COLL_TABS.filter(c => itemsOf(c).some(i => S.owns(c === 'anim' ? 'skin' : c, i.id))).length;
    UI.sheet(`<div class="shT">My collection</div><div class="shS">${ownedCount()}/70 items · rewards are given automatically</div>${rows}
      <div class="secT">Complete sets · ${ART.gem(12)} 100 each</div><div class="clSets">${sets}</div>
      <div class="clBig ${st.collect.includes('styleMaster') ? 'ok' : ''}">${ART.ic('sparkle')}<div><b>Style Master</b><small>Own at least 1 item in every tab (${tabsWith}/7) · ${ART.coin(11)} 20,000 + badge</small></div></div>
      <div class="clBig ${st.collect.includes('legend') ? 'ok' : ''}">${ART.ic('crown')}<div><b>Legend</b><small>Own everything (${ownedCount()}/70) · Legend title + exclusive Legend skin</small></div></div>`, 'coll');
  }
  function checkCollect() {
    const st = S.st, got = [];
    const give = (key, r, label) => { if (st.collect.includes(key)) return; st.collect.push(key); got.push({ r, label }); };
    COLL_TABS.forEach(c => {
      const key = c === 'anim' ? 'skin' : c, n = itemsOf(c).filter(i => S.owns(key, i.id)).length;
      const name = c === 'anim' ? 'Animated Tiles' : D.COS_TABS.find(x => x.id === c).name;
      if (n >= 5) give('tab5:' + c, { gems: D.COLLECT.tab5.gems, badge: 'collector' }, `${name} 5/10`);
      if (n >= 10) give('tab10:' + c, { gems: D.COLLECT.tab10.gems, item: 'Collector frame' }, `${name} complete`);
    });
    D.SETS.forEach(s => { if (Object.entries(s.items).every(([k, id]) => S.owns(k === 'skin' ? 'skin' : k, id))) give('set:' + s.id, { gems: D.COLLECT.set.gems }, s.name + ' complete'); });
    if (COLL_TABS.every(c => itemsOf(c).some(i => S.owns(c === 'anim' ? 'skin' : c, i.id)))) give('styleMaster', { coins: D.COLLECT.styleMaster.coins, badge: 'styleMaster' }, 'Style Master');
    if (ownedCount() >= 70) give('legend', { skin: 'legend', badge: 'legend' }, 'LEGEND');
    if (!got.length) return;
    const sum = {}; got.forEach(({ r }) => { if (r.gems) sum.gems = (sum.gems || 0) + r.gems; if (r.coins) sum.coins = (sum.coins || 0) + r.coins; if (r.badge) { UI.badge(r.badge); sum.badge = r.badge; } if (r.skin) { S.grant({ skin: r.skin }); sum.skin = r.skin; } if (r.item) { S.giveCos('frame', 'collector'); sum.item = r.item; } });
    S.grant({ coins: sum.coins, gems: sum.gems }); S.save();
    setTimeout(() => UI.reward(sum, 'Collection: ' + got.map(g => g.label).join(' · ')), 700);
  }

  /* ---------- actions ---------- */
  function equip(key, id) {
    const st = S.st;
    if (key === 'skin') st.skin = id; else st.cos[key] = id;
    if (st.trials[key]) delete st.trials[key];
    if (key === 'frame' && id === 'king') UI.badge('king');
    S.save(); render(); UI.toast('Equipped', 'check');
  }
  function buy(key, id, cur) {
    const it = key === 'skin' ? D.skin(id) : D.cos(key, id);
    if (S.owns(key, id)) return;
    let price = cur === 'gems' ? it.gems : it.cost;
    if (!price || price < 0) return;
    const off = cur === 'coins' ? S.couponOff() : 0;   // v1.8 Pass coupon
    if (off) price = Math.round(price * (1 - off / 100));
    if (!S.spend(cur, price)) { UI.toast(cur === 'gems' ? 'Not enough diamonds' : 'Not enough coins', cur === 'gems' ? 'diamond' : 'coins'); return; }
    if (off) { S.st.coupon = null; S.save(); }
    S.giveCos(key, id); equip(key, id); S.checkAch(); SND.win(); FX.win(it.premium ? 'fireworks' : 'confetti');
    UI.toast(`${it.name} unlocked!`, 'sparkle'); checkCollect();
  }
  async function trial(key, id) {
    if (S.trialsLeft() <= 0) { UI.toast('No trials left today. Back tomorrow!', 'clock'); return; }
    if (!(await ADS.rewarded('trial'))) return;
    S.startTrial(key, id); render();
    UI.toast(`${(key === 'skin' ? D.skin(id) : D.cos(key, id)).name} for 30 minutes!`, 'sparkle');
  }
  async function trialSet(sid) {
    const set = D.SETS.find(s => s.id === sid); if (!set || D.setPrice(set).premium) return;
    if (S.trialsLeft() <= 0) { UI.toast('No trials left today. Back tomorrow!', 'clock'); return; }
    if (!(await ADS.rewarded('trial'))) return;
    const st = S.st; st.trialDay.n++;
    Object.entries(set.items).forEach(([k, id]) => { if (!S.owns(k, id)) st.trials[k] = { id, until: Date.now() + D.TRIAL_MIN * 6e4 }; });
    S.save(); render(); UI.toast(`${set.name} for 30 minutes!`, 'sparkle');
  }
  function buySet(sid, cur) {
    const set = D.SETS.find(s => s.id === sid), pr = D.setPrice(set), price = cur === 'gems' ? pr.gems : pr.coins;
    if (!price) return;
    if (!S.spend(cur, price)) { UI.toast(cur === 'gems' ? 'Not enough diamonds' : 'Not enough coins', cur === 'gems' ? 'diamond' : 'coins'); return; }
    Object.entries(set.items).forEach(([k, id]) => S.giveCos(k, id));
    equipSet(sid, true); SND.win(); FX.win('fireworks'); UI.toast(`${set.name} unlocked!`, 'sparkle'); checkCollect();
  }
  function equipSet(sid, quiet) {
    const set = D.SETS.find(s => s.id === sid), st = S.st;
    Object.entries(set.items).forEach(([k, id]) => { if (k === 'skin') st.skin = id; else st.cos[k] = id; delete st.trials[k]; });
    S.save(); render(); if (!quiet) UI.toast('Set equipped', 'check');
  }
  async function act(a, el) {
    const st = S.st, ad = adDay();
    const [k, v, w] = a.split(':');
    const give = async (r, title) => {
      const g = { ...r };
      if (g.boost === 'random') g.boost = D.BOOSTERS[Math.floor(Math.random() * D.BOOSTERS.length)].id;
      if (g.chest) { const c = g.chest; delete g.chest; if (Object.keys(g).length) S.grant(g); await UI.chest(c, true); if (Object.keys(g).length) UI.reward(g, title); }
      else { S.grant(g); UI.reward(g, title); }
      render();
    };
    switch (k) {
      case 'shGift': { if (giftLeft()) return; st.giftAt = Date.now(); S.save(); const c = D.FREE_GIFT[0] + Math.floor(Math.random() * (D.FREE_GIFT[1] - D.FREE_GIFT[0])); await give({ coins: c }, 'Free gift'); return; }
      case 'shGiftAd': if (await ADS.rewarded('gift')) { st.giftAt = 0; S.save(); render(); UI.toast('Gift unlocked!', 'gift'); } return;
      case 'shTrack': { const i = +v, t = D.AD_TRACK[i]; if (ad.n < t.n || ad.got.includes(i)) return; ad.got.push(i); S.save(); await give(t.r, `Ad track · ${t.n} ads`); return; }
      case 'shTrackInfo': { const t = D.AD_TRACK[+v]; UI.toast(ad.got.includes(+v) ? 'Already claimed' : `Watch ${t.n - ad.n} more reward ads`, 'ad'); return; }
      case 'shOffer': {
        const o = D.AD_OFFERS.find(x => x.id === v), used = ad.offers[o.id] || 0;
        if (used >= o.cap) { UI.toast('Back tomorrow', 'clock'); return; }
        st.offerCool = st.offerCool || {};
        if (o.cool && Date.now() - (st.offerCool[o.id] || 0) < o.cool) { UI.toast('Not ready yet', 'clock'); return; }
        if (!(await ADS.rewarded('offer'))) return;
        const ad2 = adDay(); ad2.offers[o.id] = (ad2.offers[o.id] || 0) + 1; if (o.cool) st.offerCool[o.id] = Date.now(); S.save();
        await give(o.r, 'Thanks for watching'); return;
      }
      case 'shDeal': { const ds = dealSkin(); if (!ds) return; const p = Math.round(ds.cost * (1 - D.DEAL_OFF)); if (!S.spend('coins', p)) { UI.toast('Not enough coins', 'coins'); return; } st.skins.push(ds.id); st.skin = ds.id; S.save(); S.checkAch(); SND.win(); UI.toast(`${ds.name} unlocked!`, 'sparkle'); render(); return; }
      case 'shBundle': { if (!S.spend('coins', D.BUNDLE.price)) { UI.toast('Not enough coins', 'coins'); return; } const got = {}; for (let i = 0; i < D.BUNDLE.boosts; i++) { const b = D.BOOSTERS[Math.floor(Math.random() * D.BOOSTERS.length)].id; st.boosters[b] = Math.min(9, (st.boosters[b] || 0) + 1); got[b] = (got[b] || 0) + 1; } S.save(); SND.win(); UI.toast('Bundle: ' + Object.entries(got).map(([b, n]) => `${D.BOOST[b].name} ×${n}`).join(', '), 'sparkle'); render(); return; }
      case 'shShard': shardClaim(); return;
      case 'shTrial': trial(v, w); return;
      case 'shTrialSet': trialSet(v); return;
      case 'shBuySet': buySet(v, w); return;
      case 'shEquipSet': equipSet(v); return;
      case 'shShield': if (S.spend(v, v === 'coins' ? 400 : D.SHIELD_GEMS)) { S.add('shields', 1); UI.toast('Shield +1', 'shield'); render(); } else UI.toast(v === 'coins' ? 'Not enough coins' : 'Not enough diamonds', v === 'coins' ? 'coins' : 'diamond'); return;
      case 'shColl': collection(); return;
      case 'bgUse': { if (!bgOwned(v)) return; st.bg.on = v; if (st.bg.trial && st.bg.trial.id !== v) st.bg.trial = null; S.save(); BG.refresh(); render(); UI.toast(`${D.BG[v].name} on`, 'image'); return; }
      case 'bgBuy': { const x = D.BG[v]; if (!x || bgOwned(v)) return; const cur = x.gems ? 'gems' : 'coins', n = x.gems || x.cost;
        if (!S.spend(cur, n)) { UI.toast(cur === 'gems' ? 'Not enough diamonds' : 'Not enough coins', cur === 'gems' ? 'diamond' : 'coins'); return; }
        st.bg.own.push(v); st.bg.on = v; st.bg.trial = null; S.save(); SND.win(); BG.refresh(); UI.toast(`${x.name} unlocked!`, 'sparkle'); render(); return; }
      case 'bgTry': { const d = S.dayKey(); if (st.bg.tday.d !== d) st.bg.tday = { d, n: 0 }; if (st.bg.tday.n >= 10) { UI.toast('10 trials used today · back tomorrow', 'clock'); return; }
        if (!(await ADS.rewarded('bgTrial'))) return; st.bg.tday.n++; st.bg.trial = { id: v, until: Date.now() + 30 * 60e3 }; S.save(); BG.refresh(); UI.toast(`${D.BG[v].name} for 30 min`, 'clock'); render(); return; }
    }
  }
  /* clicks routed from UI (data-tab / data-equip / data-buyskin / data-buyb / data-cos) */
  function click(d, el) {
    if (d.tab) { tab = d.tab; render(); const b = document.getElementById('shopBody'); if (b) b.scrollTop = 0; return; }
    if (d.equip) { const [key, id] = d.equip.split(':'); equip(key, id); return; }
    if (d.buyskin) { const p = d.buyskin.split(':'); if (p.length === 2) buy('skin', p[0], 'coins'); else buy(p[0], p[1], p[2]); return; }
    if (d.buyb) { const [id, cur] = d.buyb.split(':'); const b = D.BOOST[id]; if ((S.st.boosters[id] || 0) >= 9) { UI.toast('Max 9 of each booster', 'info'); return; } if (!S.spend(cur, cur === 'coins' ? b.coins : b.gems)) { UI.toast(cur === 'coins' ? 'Not enough coins' : 'Not enough diamonds', cur === 'coins' ? 'coins' : 'diamond'); return; } S.grant({ boost: id }); SND.coin(); UI.toast(`${b.name} +1`, 'check'); render(); return; }
    if (d.cos) { // preview on tap
      const [cat, id] = d.cos.split(':');
      if (cat === 'sound') SND.preview(id);
      else if (cat === 'tap') FX.tap(el.querySelector('.fxPrev') || el, id, '#9a6df5');
      else if (cat === 'win') FX.win(id);
      else if (cat === 'flash') { const tl = el.querySelectorAll('.miniBoard .tile'); tl.forEach(x => x.classList.remove('on')); const k = Math.floor(Math.random() * tl.length); if (tl[k]) { tl[k].classList.add('on'); SND.tile(k, 0.3); setTimeout(() => tl[k].classList.remove('on'), 650); } }
    }
  }
  function noAds() {
    const st = S.st; if (st.noAds) return;
    if (!S.spend('coins', D.NO_ADS_PRICE)) { UI.toast('Not enough coins yet (1 crore needed)', 'coins'); return; }
    st.noAds = true; S.save(); ADS.banner(false); SND.win(); UI.toast('No forced ads. Enjoy!', 'shield'); render();
  }
  function adProgress() { // unlock ad skins + nudge track rewards
    const st = S.st, n = st.adsTotal || 0;
    for (const sk of D.SKINS.filter(x => x.ads)) if (n >= sk.ads && !st.skins.includes(sk.id)) { st.skins.push(sk.id); S.save(); UI.toast(`${sk.name} skin unlocked!`, 'sparkle'); SND.win(); }
    const ad = adDay(), ready = D.AD_TRACK.filter((t, i) => ad.n >= t.n && !ad.got.includes(i)).length;
    if (ready && UI.cur !== 'game') UI.toast(`Ad track reward ready in Shop`, 'gift');
    S.checkAch(); if (UI.cur === 'shop') render();
  }
  return { render, click, act, collection, ownedCount, checkCollect, noAds, adProgress, tab(t) { tab = t; } };
})();

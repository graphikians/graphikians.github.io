/* ================= MACHHAR MAARO STUDIO · VIDEO PLANNER =================
   Turns a choice (style + look + hook + length + music) into an exact timeline:
   hook (first 2 s) → logo sting → 3-5 real gameplay scenes / feature cards → climax on the
   music drop → pro outro. Every cut sits on a bar of the music. Max 50 seconds, and every
   scene stays on screen long enough to read (min ~3.5 s, captions 2.5 s+).
========================================================================== */
const PLAN = (() => {
  const OUTRO = 6;
  const rng = s => () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const pick = (r, a) => a[Math.floor(r() * a.length) % a.length];
  const ACTION = ['survive', 'kill', 'waves', 'air', 'hunt'];

  function levelTools(D) {
    const L = D.levels || [];
    const inW = w => L.filter(l => l.w === w);
    const normal = (wid, pos = 0.6) => {
      const W = CAT.W(wid);
      if (W.sp === 'hosp') return { sp: 'hosp', i: 3 };
      if (W.sp === 'yam') return { sp: 'yam', i: 3 };
      const ls = inW(W.w).filter(l => !l.boss && ACTION.includes(l.task)); const a = ls.length ? ls : inW(W.w).filter(l => !l.boss);
      return a.length ? a[Math.min(a.length - 1, Math.floor(a.length * pos))].n : 3;
    };
    const boss = (wid, k) => {
      const W = CAT.W(wid);
      if (W.sp === 'yam') return { n: 300, over: { boss: 'yamraj', task: 'boss', yamFx: 1 } };
      if (W.sp === 'hosp') return { n: 40, over: { boss: k || 'monsoon', task: 'boss' } };
      const b = inW(W.w).find(l => l.boss);
      if (k) return { n: b ? b.n : 5, over: { boss: k, task: 'boss' } };
      return b ? b.n : 5;
    };
    const bossOf = lv => { const n = typeof lv === 'number' ? lv : lv && lv.n; const o = lv && lv.over && lv.over.boss; if (o) return o; const l = L.find(x => x.n === n); return l && l.boss || 'don'; };
    const byTask = t => { const l = L.find(x => x.task === t); return l ? l.n : 17; };
    const byTwist = t => { const l = L.find(x => x.tw === t && !x.boss); return l ? l.n : 44; };
    return { normal, boss, bossOf, byTask, byTwist };
  }

  /* ---------- recipes: blocks with preferred / minimum bars ---------- */
  function recipe(spec, D, look, r) {
    const T = levelTools(D), world = look.world, rk = look.skin;
    const shot = (lv, o = {}) => Object.assign({ lv, racket: rk, pre: 3.5, bot: { mode: 'pro' }, acts: [], cam: 'auto' }, o);
    const pro = { mode: 'pro', react: 170, gap: 95, acc: 0.93 }, fast = { mode: 'pro', react: 120, gap: 70, acc: 0.96 }, sloppy = { mode: 'pro', react: 420, gap: 220, acc: 0.62 };
    const B = [];
    const add = (k, pref, min, o) => B.push(Object.assign({ k, pref, min }, o));
    const st = spec.style;
    if (spec.feature) return spotlight(spec, D, look, r, T, shot, add, B, pro, fast);
    if (st === 'survive' || st === 'creator') {
      const lv = T.normal(world, 0.7);
      add('hook', 1, 1, { shot: shot(lv, { pre: 7, bot: { mode: 'idle' }, acts: [{ at: 0, a: 'sleep', v: 34 }, { at: 0.2, a: 'swarm', v: 6 }], floor: 22, cam: 'papa' }) });
      add('logo', 1, 1, {});
      add('game', 3, 2, { shot: shot(lv, { pre: 3, bot: pro }), cap: pick(r, ['Wave 1. *Easy…* right?', 'It starts *calm.*', 'Just a few mosquitoes. *For now.*']) });
      add('game', 3, 2, { shot: shot(lv, { cont: 1, bot: sloppy, acts: [{ at: 0.4, a: 'swarm', v: 10 }, { at: 0.5, a: 'sleep', v: 58 }], floor: 30 }), cap: pick(r, ['Then the *swarm* came.', 'Sleep meter: *dropping…*', 'Here they come. *All of them.*']) });
      if (st === 'creator') add('game', 2, 0, { shot: shot(T.boss(world), { pre: 8, bot: pro, cam: 'boss' }), cap: 'And then… *the boss.*' });
      add('climax', 4, 3, { shot: shot(lv, { cont: st !== 'creator', pre: 2, bot: { mode: 'save', saveAt: 27, react: 140, gap: 75, acc: 0.96 }, acts: [{ at: 0, a: 'sleep', v: 34 }, { at: 0.1, a: 'swarm', v: 8 }, { at: -1.6, a: 'win' }], floor: 21, speed: 'save' }), cap: pick(r, ['LAST SECOND *SAVE!*', '*1%* sleep left…', 'NOT TODAY, *mosquitoes.*']) });
    } else if (st === 'boss') {
      const lv = T.boss(world), bk = T.bossOf(lv), bn = (D.bosses[bk] || {}).name || 'THE BOSS';
      add('hook', 1, 1, { shot: shot(lv, { pre: 9, bot: sloppy, cam: 'boss' }) });
      add('logo', 1, 1, {});
      add('card', 2, 2, { card: { type: 'boss', id: bk }, cap: null });
      add('game', 3, 2, { shot: shot(lv, { pre: 4, bot: pro, cam: 'boss' }), cap: `*${bn}* enters the room.` });
      add('game', 2, 0, { shot: shot(lv, { cont: 1, bot: pro, acts: [{ at: 0.3, a: 'swarm', v: 9 }], cam: 'auto' }), cap: 'Phase 2: he calls the *army.*' });
      add('climax', 3, 3, { shot: shot(lv, { cont: 1, bot: fast, acts: [{ at: 0.15, a: 'bossLow', v: 0.1 }, { at: -3.2, a: 'bossKill' }], cam: 'boss', speed: 'boss' }), cap: pick(r, ['FINAL *HIT.*', 'One more zap… *GONE.*', 'BOSS *DOWN!*']) });
    } else if (st === 'swats') {
      const lv = T.normal(world, 0.85);
      add('hook', 1, 1, { shot: shot(lv, { pre: 6, bot: fast, acts: [{ at: 0, a: 'fever', v: 4 }], cam: 'auto' }) });
      add('logo', 1, 1, {});
      add('game', 3, 2, { shot: shot(lv, { pre: 4, bot: fast }), cap: pick(r, ['Every zap = *satisfying.*', 'Listen to *that* sound.', 'Clean. *Electric.* Perfect.']) });
      add('game', 3, 2, { shot: shot(lv, { cont: 1, bot: fast, acts: [{ at: 0.3, a: 'swarm', v: 12 }, { at: 1.4, a: 'fever', v: 6 }] }), cap: '*x10* combo incoming…' });
      add('game', 2, 0, { shot: shot(lv, { cont: 1, bot: fast, acts: [{ at: 0.2, a: 'swarm', v: 10 }, { at: 1.1, a: 'mega' }] }), cap: 'MEGA *ZAP.*' });
      add('climax', 3, 3, { shot: shot(lv, { cont: 1, bot: fast, acts: [{ at: 0, a: 'swarm', v: 14 }, { at: 0.2, a: 'fever', v: 6 }, { at: -1.4, a: 'win' }], floor: 40, speed: 'slowStart' }), cap: pick(r, ['Not a *single* bite.', 'Perfect run. *Flawless.*', 'Pure *therapy.*']) });
    } else if (st === 'revenge') {
      const lv = T.normal(world, 0.65);
      add('hook', 1, 1, { shot: shot(lv, { pre: 5, bot: { mode: 'idle' }, acts: [{ at: 0, a: 'sleep', v: 9 }, { at: 0, a: 'swarm', v: 8 }], cam: 'papa' }) });
      add('logo', 1, 1, {});
      add('game', 3, 2, { shot: shot(lv, { pre: 3, bot: sloppy, acts: [{ at: 0.6, a: 'sleep', v: 26 }, { at: 0.7, a: 'swarm', v: 10 }, { at: 1.3, a: 'bot', v: { mode: 'idle' } }], cam: 'papa', fail: 1 }), cap: pick(r, ['One mistake…', 'I looked away for *one second.*', 'Papa is waking up… *NO NO NO.*']) });
      add('card', 3, 2, { card: { type: 'hospital' }, cap: null });
      add('game', 3, 0, { shot: shot({ sp: 'hosp', i: 2 }, { pre: 3, bot: pro }), cap: 'Hospital rounds: *win or else.*' });
      add('climax', 3, 3, { shot: shot(lv, { pre: 4, bot: fast, acts: [{ at: 0.1, a: 'swarm', v: 10 }, { at: 0.3, a: 'fever', v: 6 }, { at: -1.5, a: 'win' }], floor: 35, speed: 'slowStart' }), cap: pick(r, ['*REVENGE.*', 'Back from *ICU.* Back to win.', 'From Critical to *Champion.*']) });
    } else if (st === 'levelup') {
      add('hook', 1, 1, { shot: shot(T.boss('emperor'), { pre: 8, bot: pro, cam: 'boss' }) });
      add('logo', 1, 1, {});
      add('game', 2, 2, { shot: shot(1, { pre: 3, bot: pro, label: 'LEVEL 1' }), cap: '*Level 1:* a calm night.' });
      add('card', 3, 2, { card: { type: 'map' }, cap: null });
      add('game', 2, 0, { shot: shot(T.normal('sangeet', 0.5), { pre: 4, bot: pro, label: 'LEVEL 120' }), cap: 'Level 120: *chaos.*' });
      add('game', 2, 2, { shot: shot(T.normal('emperor', 0.8), { pre: 5, bot: fast, label: 'LEVEL 290' }), cap: 'Level 290: *pure madness.*' });
      add('climax', 3, 3, { shot: shot(300, { pre: 6, bot: fast, acts: [{ at: 0.2, a: 'bossLow', v: 0.12 }, { at: -3.2, a: 'bossKill' }], cam: 'boss', speed: 'boss', label: 'LEVEL 300' }), cap: '*LEVEL 300.* The Emperor falls.' });
    } else if (st === 'family') {
      const cast = [['mummy', 'bedroom', 'MUMMY', 'Mummy: the *lightest* sleeper.'], ['dadi', 'village', 'GRANDMA', 'Grandma wakes at *4 AM.*'], ['dulha', 'wedding', 'THE GROOM', 'Wedding *tomorrow.* No pressure.'], ['dada', 'bedroom', 'GRANDPA', 'Grandpa: hearing aid is *out.*'], ['bachcha', 'bedroom', 'THE KID', 'The kid *kicks* the blanket off.'], ['raja', 'palace', 'THE KING', 'Even *kings* need sleep.']];
      const rot = look.i % cast.length, pk = [cast[rot], cast[(rot + 2) % cast.length], cast[(rot + 4) % cast.length]];
      add('hook', 1, 1, { shot: shot(T.normal('bedroom', 0.6), { char: 'papa', pre: 6, bot: { mode: 'idle' }, acts: [{ at: 0, a: 'sleep', v: 40 }, { at: 0, a: 'swarm', v: 6 }], floor: 25, cam: 'papa' }) });
      add('logo', 1, 1, {});
      add('card', 2, 2, { card: { type: 'roster' }, cap: null });
      for (const [ch, wd, lab, cap] of pk) add('game', 2, 2, { shot: shot(T.normal(wd, 0.55), { char: ch, pre: 4, bot: pro, label: lab, cam: 'papa' }), cap });
      add('climax', 3, 3, { shot: shot(T.normal('bedroom', 0.7), { char: 'papa', pre: 3, bot: { mode: 'save', saveAt: 28, react: 140, gap: 75, acc: 0.96 }, acts: [{ at: 0, a: 'sleep', v: 36 }, { at: 0, a: 'swarm', v: 8 }, { at: -1.5, a: 'win' }], floor: 22, speed: 'save' }), cap: 'Papa *survives* the night.' });
    } else if (st === 'twist') {
      const pool = [['golden', 'task', 'GOLDEN HUNT', 'Catch the *golden* mosquito.'], ['giant', 'task', 'GIANT BUGS', 'Giant bugs: *2 hits* each.'], ['storm', 'task', 'STORM NIGHT', 'Storm night: the *wind* pushes them.'], ['tiny', 'task', 'TINY', 'Tiny ones. *So fast.*'], ['flicker', 'tw', 'LIGHTS FLICKER', 'Lights *flicker.* Mosquitoes don\'t.'], ['chain', 'task', 'DOUBLE KILL', 'Two in *one* swing.'], ['heavy', 'tw', 'HEAVY', 'Every mosquito takes *2 hits.*']];
      const rot = look.i % pool.length, pk = [0, 1, 2, 3].map(k => pool[(rot + k * 2) % pool.length]);
      const lvOf = p => p[1] === 'task' ? T.byTask(p[0]) : T.byTwist(p[0]);
      add('hook', 1, 1, { shot: shot(T.byTwist('flicker'), { pre: 5, bot: pro }) });
      add('logo', 1, 1, {});
      for (const p of pk) add('game', 2, 2, { shot: shot(lvOf(p), { pre: 3.5, bot: pro, label: p[2] }), cap: p[3] });
      add('climax', 3, 3, { shot: shot(T.byTask('crescendo'), { pre: 5, bot: fast, acts: [{ at: 0, a: 'swarm', v: 12 }, { at: 0.3, a: 'fever', v: 6 }], floor: 35, speed: 'slowStart' }), cap: '*28 missions.* Your move.' });
    } else if (st === 'racket') {
      const lv = T.normal(world, 0.7), myth = look.i % 2 ? 'sanxai' : 'brahmastra', mid = ['thunder', 'laser', 'frost', 'tesla', 'magnet', 'boomerang'].includes(rk) ? rk : 'thunder';
      const rn = id => (D.rackets.find(x => x.id === id) || { name: id }).name;
      add('hook', 1, 1, { shot: shot(lv, { racket: myth, pre: 5, bot: fast, acts: [{ at: 0.3, a: 'swarm', v: 10 }, { at: 0.9, a: 'mega' }] }) });
      add('logo', 1, 1, {});
      add('card', 2, 2, { card: { type: 'racket', id: 'sasta' }, cap: null });
      add('game', 2, 2, { shot: shot(lv, { racket: 'sasta', pre: 3, bot: sloppy, label: 'BASIC RACKET' }), cap: 'Basic racket: *meh.*' });
      add('card', 2, 2, { card: { type: 'racket', id: mid }, cap: null });
      add('game', 2, 0, { shot: shot(lv, { racket: mid, pre: 3, bot: pro, label: rn(mid).toUpperCase() }), cap: `${rn(mid)}: *way* better.` });
      add('card', 2, 2, { card: { type: 'racket', id: myth }, cap: null });
      add('climax', 3, 3, { shot: shot(lv, { racket: myth, pre: 3, bot: fast, acts: [{ at: 0.1, a: 'swarm', v: 14 }, { at: 0.8, a: 'mega' }, { at: -1.4, a: 'win' }], floor: 35, speed: 'slowStart', label: rn(myth).toUpperCase() }), cap: 'Mosquitoes *hate* this upgrade.' });
    }
    return B;
  }

  function spotlight(spec, D, look, r, T, shot, add, B, pro, fast) {
    const [kind, id] = spec.feature.split(':'), world = look.world;
    let lv = T.normal(world, 0.7), sh = {}, card = { type: 'feature', id: spec.feature }, cap1 = '', cap2 = '', clx = {};
    const rk = (D.rackets || []).find(x => x.id === id), sm = (D.saman || []).find(x => x.id === id), bo = (D.boosters || []).find(x => x.id === id);
    if (kind === 'racket') { sh = { racket: id }; card = { type: 'racket', id }; cap1 = `${rk ? rk.name : id}: *${rk ? rk.sp : ''}*`; cap2 = 'Watch it *clear the room.*'; clx = { racket: id, acts: [{ at: 0.1, a: 'swarm', v: 12 }, { at: 0.9, a: 'mega' }] }; }
    else if (kind === 'item') { card = { type: 'item', id }; sh = { acts: [{ at: 0.8, a: 'item', v: id }] }; cap1 = `${sm ? sm.name : id}: *${sm ? sm.desc : ''}*`; cap2 = 'Works in *every* level.'; clx = { acts: [{ at: 0.1, a: 'swarm', v: 10 }, { at: 0.5, a: 'item', v: id }] }; }
    else if (kind === 'boost') { card = { type: 'boost', id }; sh = { boosts: { [id]: 1 } }; cap1 = `${bo ? bo.name : id}: *${bo ? bo.desc : ''}*`; cap2 = 'Start *strong.*'; clx = { boosts: { [id]: 1 }, acts: [{ at: 0.2, a: 'swarm', v: 10 }].concat(id === 'mega' ? [{ at: 0.8, a: 'mega' }] : []) }; }
    else if (kind === 'boss') { lv = T.boss(world, id); card = { type: 'boss', id }; sh = { cam: 'boss', pre: 6 }; cap1 = `*${(D.bosses[id] || {}).name}* is here.`; cap2 = 'Can you take him *down?*'; clx = { cam: 'boss', acts: [{ at: 0.15, a: 'bossLow', v: 0.1 }, { at: -3.2, a: 'bossKill' }], speed: 'boss' }; }
    else if (kind === 'event' || kind === 'love') { card = { type: 'event', id: spec.feature }; lv = T.normal(id === 'wedding' ? 'wedding' : world, 0.6); cap1 = 'New levels *every day.*'; cap2 = 'Win the *Champion* prize.'; clx = { acts: [{ at: 0.1, a: 'swarm', v: 10 }, { at: -1.4, a: 'win' }] }; if (kind === 'love') { const l = (D.love || []).find(x => x.id === id); if (l) sh.char = l.char; clx.char = sh.char; } }
    else if (kind === 'feat') {
      if (id === 'hospital' || id === 'vaccine') { card = { type: 'hospital', vaccine: id === 'vaccine' }; lv = { sp: 'hosp', i: 3 }; cap1 = id === 'vaccine' ? 'One *vaccine* = instant discharge.' : 'Lose too much… *hospital.*'; cap2 = 'Win the rounds to go *home.*'; clx = { acts: [{ at: -1.4, a: 'win' }] }; }
      else if (id === 'yamlok') { card = { type: 'yamlok' }; lv = { sp: 'yam', i: 3 }; cap1 = 'Welcome to *Yamlok.*'; cap2 = 'Win back the *soul.*'; clx = { acts: [{ at: 0.1, a: 'swarm', v: 10 }] }; }
      else { card = { type: 'map' }; cap1 = '*300 levels* per hero.'; cap2 = '*20 worlds.* New ones coming.'; clx = {}; }
    }
    else if (kind === 'twist') { lv = T.byTwist(id); card = { type: 'twist', id }; cap1 = `Twist: *${(D.twists[id] || {}).name || id}*`; cap2 = 'Every level, *something new.*'; clx = { acts: [{ at: 0.1, a: 'swarm', v: 8 }] }; }
    else if (kind === 'task') { lv = T.byTask(id); card = { type: 'task', id }; cap1 = `Mission: *${(D.tasks[id] || {}).name || id}*`; cap2 = '*28* mission types.'; clx = { acts: [{ at: 0.1, a: 'swarm', v: 8 }] }; }
    else if (kind === 'char') { card = { type: 'char', id }; sh = { char: id, cam: 'papa' }; cap1 = `*${(D.chars[id] || {}).n}* needs you tonight.`; cap2 = 'Every hero has *300 levels.*'; clx = { char: id, acts: [{ at: 0, a: 'sleep', v: 38 }, { at: 0, a: 'swarm', v: 8 }, { at: -1.4, a: 'win' }], bot: { mode: 'save', saveAt: 28, react: 140, gap: 75, acc: 0.96 }, floor: 22, speed: 'save' }; }
    add('hook', 1, 1, { shot: shot(lv, Object.assign({ pre: 6, bot: fast }, sh, { acts: (sh.acts || []).map(a => Object.assign({}, a, { at: Math.min(a.at, 0.6) })) })) });
    add('logo', 1, 1, {});
    add('card', 3, 2, { card, cap: null });
    add('game', 3, 2, { shot: shot(lv, Object.assign({ pre: 3.5, bot: pro }, sh)), cap: cap1 });
    add('game', 2, 0, { shot: shot(lv, Object.assign({ cont: 1, bot: pro }, sh, { acts: [{ at: 0.3, a: 'swarm', v: 8 }] })), cap: cap2 });
    add('climax', 3, 3, { shot: shot(lv, Object.assign({ cont: 1, bot: fast, floor: 30, speed: 'slowStart' }, clx)), cap: 'Download *free.* Play tonight.' });
    return B;
  }

  /* ---------- build the timeline ---------- */
  function build(spec, D, mus) {
    const st = CAT.S(spec.style), look = CAT.looks(spec.style)[spec.look % 9], r = rng((spec.seed || 1) * 7919 + 13);
    const hookText = spec.feature && spec.hookText ? spec.hookText : st.hooks[spec.hook % st.hooks.length];
    const bpm = mus.bpm, beat = 60 / bpm, bar = beat * 4;
    const dur = Math.min(50, Math.max(20, spec.dur || 35));
    let B = recipe(spec, D, look, r);
    /* bars available for everything before the outro */
    const avail = Math.floor((dur - OUTRO) / bar + 0.001);
    const logoBars = bpm >= 108 ? 1 : 0.5;
    B.forEach(b => { if (b.k === 'logo') b.pref = b.min = logoBars; });
    const sum = () => B.reduce((a, b) => a + b.pref, 0);
    /* shrink: optional blocks first, then trim scenes down to their minimum */
    while (sum() > avail) {
      const opt = B.map((b, i) => [b, i]).filter(([b]) => b.min === 0); if (opt.length) { B.splice(opt[opt.length - 1][1], 1); continue; }
      const cand = B.filter(b => b.pref > b.min && b.k !== 'hook' && b.k !== 'logo').sort((a, b) => (b.pref - b.min) - (a.pref - a.min))[0];
      if (!cand) break; cand.pref -= 1;
    }
    while (sum() > avail) { const i = B.findIndex(b => b.k === 'game'); if (i < 0) break; B.splice(i, 1); }
    /* grow: longer scenes (max 5 bars each) */
    let guard = 0; while (sum() + 1 <= avail && guard++ < 40) { const g = B.filter(b => (b.k === 'game' || b.k === 'climax') && b.pref < 5).sort((a, b) => a.pref - b.pref)[0]; if (!g) break; g.pref += 1; }
    /* minimum readable time per scene */
    B.forEach(b => { if ((b.k === 'game' || b.k === 'card') && b.pref * bar < 3.4) b.pref = Math.ceil(3.4 / bar); });
    /* times */
    let t = 0; const segs = [];
    for (const b of B) { const d = b.pref * bar; segs.push(Object.assign({}, b, { t0: t, t1: t + d })); t += d; }
    const outroT = t, total = Math.min(50, t + OUTRO);
    segs.push({ k: 'outro', t0: outroT, t1: total, shot: null });
    segs.forEach((s, i) => { s.i = i; s.cut = i === 0 ? null : look.cut; });
    /* hook caption lives inside the hook block, scene captions inside their scenes */
    const caps = [];
    for (const s of segs) {
      if (s.k === 'hook') caps.push({ t0: 0, t1: s.t1 - 0.05, text: hookText, big: 1 });
      else if (s.cap && s.t1 - s.t0 >= 2) caps.push({ t0: s.t0 + 0.2, t1: s.t1 - 0.15, text: s.cap });
    }
    const climax = segs.find(s => s.k === 'climax');
    const logo = segs.find(s => s.k === 'logo');
    return {
      spec, style: st, look, hookText, bpm, beat, bar, total, segs, caps,
      drop: climax ? climax.t0 : outroT - bar * 2, outro: outroT, introEnd: logo ? logo.t1 : bar,
      logoT: logo ? logo.t0 : null, cuts: segs.slice(1).map(s => s.t0), fails: [], thumbT: climax ? climax.t0 + Math.min(1.2, (climax.t1 - climax.t0) * 0.4) : outroT - 2
    };
  }
  return { build, OUTRO, rng };
})();

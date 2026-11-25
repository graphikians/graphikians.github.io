/* ================= MACHHAR MAARO STUDIO · STYLES, LOOKS, HOOKS =================
   9 video styles. Each style has 9 looks (world + racket skin + frame + text type + cuts)
   and 8 hook lines for the first 2 seconds. *word* = highlighted in electric blue.
================================================================================== */
const CAT = (() => {
  const FRAMES = ['full', 'neon', 'phone', 'cinema', 'split'];
  const FRAME_N = { full: 'Full screen', neon: 'Neon frame', phone: 'Floating phone', cinema: 'Cinema bars', split: 'Split screen' };
  const TYPES = ['block', 'neon', 'comic', 'minimal'];
  const TYPE_N = { block: 'Bold Block', neon: 'Neon Glow', comic: 'Comic Pop', minimal: 'Clean Minimal' };
  const CUTS = ['punch', 'flash', 'whip', 'hard'];
  const CUT_N = { punch: 'Zoom punch', flash: 'Zap flash', whip: 'Whip pan', hard: 'Hard cut' };
  const SKINS = ['thunder', 'laser', 'frost', 'tesla', 'brahmastra', 'sanxai', 'magnet', 'turbo', 'boomerang'];
  /* worlds: w = game world index (0-19) or a special world */
  const WORLDS = [
    { id: 'bedroom', name: 'Home Bedroom', w: 0 }, { id: 'village', name: "Grandma's Village", w: 1 }, { id: 'hostel', name: 'Hostel Room', w: 2 },
    { id: 'wedding', name: 'Wedding Tent', w: 3 }, { id: 'palace', name: 'Mosquito Palace', w: 4 }, { id: 'monsoon', name: 'Monsoon Bedroom', w: 5 },
    { id: 'sangeet', name: 'Sangeet Night', w: 8 }, { id: 'diwali', name: 'Diwali Village', w: 11 }, { id: 'exams', name: 'Final Exams', w: 17 },
    { id: 'fortress', name: 'Mosquito Fortress', w: 14 }, { id: 'emperor', name: "Emperor's Palace", w: 19 },
    { id: 'hospital', name: 'Hospital', sp: 'hosp' }, { id: 'yamlok', name: 'Yamlok', sp: 'yam' }
  ];
  const W = id => WORLDS.find(w => w.id === id) || WORLDS[0];

  const STYLES = [
    { id: 'survive', name: 'Can You Survive?', music: 'night', worlds: ['bedroom', 'hostel', 'monsoon', 'wedding', 'exams', 'village', 'sangeet', 'hospital', 'fortress'],
      hooks: ['Only *1%* can survive this level.', 'Papa wakes up = *GAME OVER.*', 'You have *10 seconds.* Don\'t let him wake up.', 'This mosquito swarm is *NOT fair.*', 'I almost lost *everything* here…', 'Level 52. Storm night. *Zero mercy.*', 'Watch till the end. I *barely* made it.', 'Can *YOU* keep Papa asleep?'] },
    { id: 'boss', name: 'Boss Battle', music: 'boss', worlds: ['bedroom', 'village', 'hostel', 'wedding', 'palace', 'monsoon', 'fortress', 'emperor', 'yamlok'],
      hooks: ['This mosquito has a *BOSS* health bar.', 'Meet *Dengu Don.* He runs this house.', 'The final boss is… a *mosquito?!*', 'He has *studied* every move you make.', '*Yamraj* came for Papa. I said no.', 'One racket. One boss. *One chance.*', 'Boss fight at *2 AM* hits different.', 'Rate this *boss kill* 1–10.'] },
    { id: 'swats', name: 'Satisfying Swats', music: 'lofi', worlds: ['bedroom', 'sangeet', 'hostel', 'diwali', 'palace', 'wedding', 'monsoon', 'exams', 'emperor'],
      hooks: ['The most *satisfying* sound in the world.', '*x10 combo.* Wait for it…', 'POV: you *finally* got that mosquito.', 'Zap. Zap. *ZAP.*', 'I could watch this *all day.*', '*Headphones ON* for this one.', 'Perfect run. *Not a single bite.*', 'Electric racket *therapy.*'] },
    { id: 'revenge', name: 'Fail → Revenge', music: 'hype', worlds: ['bedroom', 'village', 'hostel', 'monsoon', 'wedding', 'exams', 'sangeet', 'diwali', 'palace'],
      hooks: ['I lost. Papa went to the *HOSPITAL.*', 'One mistake… and it\'s *ICU.*', 'This game is actually *brutal.*', 'I failed *7 times.* Then this happened.', 'Never underestimate a *tiny mosquito.*', 'From *Critical* to *Champion.*', 'They laughed. Then I got the *vaccine.*', '*Revenge* has never been this sweet.'] },
    { id: 'levelup', name: 'Level 1 vs Level 300', music: 'hype', worlds: ['bedroom', 'village', 'hostel', 'wedding', 'palace', 'sangeet', 'diwali', 'fortress', 'emperor'],
      hooks: ['*Level 1* vs *Level 300.*', 'It starts in a bedroom… it ends in *Yamlok.*', '*20 worlds.* One racket.', 'How it started vs *how it\'s going.*', 'This game gets *INSANE* later.', '*Day 1* player vs *Day 100* player.', 'Every world has a *new nightmare.*', 'Guess *which level* this is.'] },
    { id: 'family', name: 'Family Drama', music: 'comedy', worlds: ['bedroom', 'wedding', 'village', 'hostel', 'palace', 'sangeet', 'monsoon', 'diwali', 'exams'],
      hooks: ['Papa has work at *6 AM.* Mosquitoes don\'t care.', 'Protect the *groom* on his wedding night.', 'Grandma deserves *peaceful sleep.*', 'Every family has *THIS* night.', 'If Papa wakes up, *we\'re all dead.*', 'Mummy said: *don\'t let him wake up.*', 'Choose *who you protect* tonight.', 'The whole family is *counting on you.*'] },
    { id: 'twist', name: 'Twist Roulette', music: 'night', worlds: ['hostel', 'village', 'wedding', 'monsoon', 'exams', 'sangeet', 'diwali', 'fortress', 'palace'],
      hooks: ['Every level has a *new twist.*', 'Lights flicker. *Mosquitoes don\'t.*', '*Golden mosquito:* 4 seconds to catch it.', '*Giant* mosquitoes need TWO hits.', '*Storm night.* Wind changes everything.', 'Tiny mosquitoes. *Huge problem.*', '*28 ways* to lose your mind.', 'Which twist would *break you?*'] },
    { id: 'racket', name: 'Racket Upgrade', music: 'hype', worlds: ['bedroom', 'palace', 'hostel', 'wedding', 'village', 'emperor', 'sangeet', 'fortress', 'diwali'],
      hooks: ['Basic racket vs *BRAHMASTRA.*', 'This racket is *illegal.*', 'Upgrading my racket until it\'s *unfair.*', '*Thunder* vs *Laser:* which is better?', 'The *SANX AI Racket* plays by itself?!', 'Free racket vs *max racket.*', 'Mosquitoes *hate* this upgrade.', 'Rate my *setup.*'] },
    { id: 'creator', name: 'Creator / Reaction', music: 'hype', laptop: true, worlds: ['bedroom', 'hostel', 'wedding', 'palace', 'village', 'monsoon', 'fortress', 'yamlok', 'emperor'],
      hooks: ['Watch my *reaction* to this level.', 'I wasn\'t *ready* for this boss.', 'My *blood pressure* during this level…', 'Chat, I\'m actually *sweating.*', 'This game *humbled* me.', 'Don\'t laugh. This level is *HARD.*', '*First try* on Level 100…', 'You won\'t believe the *ending.*'] }
  ];
  const S = id => STYLES.find(s => s.id === id) || STYLES[0];

  /* 9 looks per style */
  function looks(styleId) {
    const st = S(styleId), si = STYLES.indexOf(st), out = [];
    for (let i = 0; i < 9; i++) {
      const world = st.worlds[i % st.worlds.length];
      const lk = {
        i, world, skin: SKINS[(i * 4 + si) % SKINS.length],
        frame: st.id === 'creator' ? 'split' : FRAMES[(i + si) % 4 + (i === 8 ? 1 : 0)] || 'full',
        type: TYPES[(i * 3 + si) % TYPES.length], cut: CUTS[(i * 2 + si) % CUTS.length]
      };
      if (lk.frame === 'split' && st.id !== 'creator' && i !== 8) lk.frame = 'full';
      lk.name = `${W(world).name} · ${lk.skin[0].toUpperCase() + lk.skin.slice(1)} · ${FRAME_N[lk.frame]} · ${TYPE_N[lk.type]}`;
      out.push(lk);
    }
    return out;
  }

  /* feature spotlights */
  function features(D) {
    const f = [];
    for (const r of (D.rackets || [])) if (r.id !== 'sasta') f.push({ id: 'racket:' + r.id, group: 'Racket skins', name: r.name, sub: r.sp });
    for (const s of (D.saman || [])) f.push({ id: 'item:' + s.id, group: 'Boosters & gadgets', name: s.name, sub: s.desc });
    for (const b of (D.boosters || [])) f.push({ id: 'boost:' + b.id, group: 'Start boosters', name: b.name, sub: b.desc });
    const BO = ['don', 'topper', 'dj', 'express', 'mafia', 'monsoon', 'ninjamaster', 'cyber', 'ranimaa', 'general', 'maharaja', 'yamraj', 'shaadibigaad'];
    for (const k of BO) if (D.bosses && D.bosses[k]) f.push({ id: 'boss:' + k, group: 'Bosses', name: D.bosses[k].name, sub: D.bosses[k].taunt });
    f.push({ id: 'event:wedding', group: 'Events', name: 'Wedding Week', sub: '7 rituals, the hardest nights' });
    f.push({ id: 'event:weekly', group: 'Events', name: 'Weekly Challenge', sub: '10 levels, Level 10 is the hardest' });
    for (const l of (D.love || [])) f.push({ id: 'love:' + l.id, group: 'Events', name: l.name, sub: '5 days · 40 levels' });
    f.push({ id: 'feat:hospital', group: 'Features', name: 'Hospital System', sub: 'Ward, ICU, Critical' });
    f.push({ id: 'feat:vaccine', group: 'Features', name: 'Vaccine', sub: 'Instant discharge from hospital' });
    f.push({ id: 'feat:levels', group: 'Features', name: '300 Levels', sub: '20 worlds per hero' });
    f.push({ id: 'feat:yamlok', group: 'Features', name: 'Yamlok', sub: 'Bring the soul back' });
    for (const [k, t] of Object.entries(D.twists || {})) f.push({ id: 'twist:' + k, group: 'Challenges & twists', name: t.name, sub: 'Level twist' });
    for (const k of ['golden', 'chain', 'giant', 'tiny', 'storm', 'rush', 'crescendo', 'facesafe']) if (D.tasks && D.tasks[k]) f.push({ id: 'task:' + k, group: 'Challenges & twists', name: D.tasks[k].name, sub: 'Mission type' });
    for (const k of ['papa', 'mummy', 'dadi', 'dada', 'dulha', 'raja', 'bachcha', 'behen', 'bhai', 'dost']) if (D.chars && D.chars[k]) f.push({ id: 'char:' + k, group: 'Characters', name: D.chars[k].n, sub: D.chars[k].qd });
    return f;
  }

  /* captions, platform text */
  const TAGS = {
    base: ['#MachharMaaro', '#mobilegame', '#gaming', '#androidgames', '#casualgames'],
    survive: ['#challenge', '#canyoudoit', '#hardestlevel'], boss: ['#bossfight', '#epic', '#gamer'], swats: ['#satisfying', '#asmr', '#oddlysatisfying'],
    revenge: ['#rage', '#comeback', '#fail'], levelup: ['#level300', '#progress', '#glowup'], family: ['#family', '#relatable', '#funny'],
    twist: ['#twist', '#challenge', '#puzzle'], racket: ['#upgrade', '#OP', '#mobilegaming'], creator: ['#reaction', '#gameplay', '#creator']
  };
  const plain = s => String(s).replace(/\*/g, '');
  function social(spec, styleName) {
    const hook = plain(spec.hookText), tags = [...TAGS.base, ...(TAGS[spec.style] || [])];
    const cta = 'Machhar Maaro is free on Google Play. Can you beat it?';
    return [
      `YOUTUBE SHORTS\nTitle: ${hook} #Shorts\nDescription: ${hook}\n${cta}\n${tags.join(' ')} #Shorts`,
      `INSTAGRAM REELS\n${hook}\n\n${cta} Link in bio.\n.\n${tags.join(' ')} #reels #reelsinstagram`,
      `FACEBOOK\n${hook} 😱\n${cta}\n${tags.slice(0, 5).join(' ')}`,
      `SNAPCHAT SPOTLIGHT\n${hook} ${tags.slice(0, 3).join(' ')}`,
      `\n(${styleName} · ${spec.lookName})`
    ].join('\n\n');
  }
  return { STYLES, S, looks, WORLDS, W, FRAMES, FRAME_N, TYPES, TYPE_N, CUTS, CUT_N, SKINS, features, social, plain };
})();

/* ================= MACHHAR MAARO v3 — DATA ================= */
const P1 = '#743ae8', P2 = '#9a6df5', ELEC = '127,212,255';
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = n => Math.round(n).toLocaleString('en-IN');
function seeded(seed) { let s = seed * 9301 + 49297; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

const TIERS = {
  easy: { name: 'EASY', bg: 'linear-gradient(135deg,#3a6ad8,#7fd4ff)' },
  medium: { name: 'MEDIUM', bg: 'linear-gradient(135deg,#5b3fc4,#9a6df5)' },
  hard: { name: 'HARD', bg: 'linear-gradient(135deg,#4a1fa8,#743ae8)' },
  pro: { name: 'PRO', bg: 'linear-gradient(135deg,#2a0f6e,#743ae8 60%,#c7b0ff)' },
  expert: { name: 'EXPERT', bg: 'linear-gradient(135deg,#0d0628,#4a1fa8 50%,#ffffff)' }
};
const TIER_ORDER = ['easy', 'medium', 'hard', 'pro', 'expert'];

const WORLDS = [
  { name: 'Home Bedroom', theme: 'bedroom', sleeper: 'papa', who: 'Papa', woke: 'PAPA WOKE UP!', shout: 'WHO IS IT?!|TURN OFF THE LIGHT!', icon: '🛏️', tier: 'easy',
    story: ['Papa has a 7 AM meeting tomorrow…', 'Papa came home exhausted from the office…', 'Papa meets a big client tomorrow…', 'Papa said: "Nobody disturb me tonight"…'] },
  { name: 'Grandma\'s Village', theme: 'gaon', sleeper: 'dadi', who: 'Grandma', woke: 'GRANDMA WOKE UP!', shout: 'OH MY GOD!|WHO IS IT?!', icon: '🏡', tier: 'medium',
    story: ['Grandma goes to the temple at 4 AM…', 'The village power keeps going on and off tonight…', 'Grandma made sweets for the whole village. She is tired…'] },
  { name: 'Hostel Room', theme: 'hostel', sleeper: 'dost', who: 'Buddy', woke: 'BUDDY WOKE UP!', shout: 'DUDE!|LET ME SLEEP!', icon: '🏫', tier: 'hard',
    story: ['There is an exam at 9 AM tomorrow…', 'Buddy studied until 3 AM…', 'The hostel window mesh is broken…'] },
  { name: 'Wedding Tent', theme: 'shaadi', sleeper: 'dulha', who: 'the Groom', woke: 'THE GROOM WOKE UP!', shout: 'COME ON!|MY WEDDING IS TOMORROW!', icon: '💒', tier: 'pro',
    story: ['The wedding is tomorrow morning. The groom needs sleep…', 'The party is over. Now the mosquitoes are partying…', 'The DJ stopped. The mosquito DJ just started…'] },
  { name: 'Mosquito Palace', theme: 'mahal', sleeper: 'raja', who: 'Raja Sahab', woke: 'THE KING WOKE UP!', shout: 'GUARDS!|WHAT IS GOING ON?!', icon: '🏰', tier: 'expert',
    story: ['The last night in the mosquito fort…', 'The Mosquito Emperor\'s army is ready…', 'Win this night and the mosquito rule ends…'] }
];

/* 28 mosquito types — sp speed, hp, wa/wf wobble, dmg, pts, coin, body colour, unlock level */
const MT = {
  normal: { name: 'Normal Mosquito', emoji: '🦟', tier: 'easy', sp: 72, size: 1, hp: 1, wa: .55, wf: 3, dmg: 4, pts: 10, coin: 1, body: '#3a2f5c', unlock: 1, desc: 'Flies straight' },
  motu: { name: 'Motu', emoji: '🎈', tier: 'easy', sp: 48, size: 1.55, hp: 2, wa: .3, wf: 2, dmg: 7, pts: 40, coin: 3, body: '#4a3a7a', unlock: 2, desc: 'Hit twice, more coins' },
  sust: { name: 'Lazy Mosquito', emoji: '🥱', tier: 'easy', sp: 40, size: 1.1, hp: 1, wa: .25, wf: 1.5, dmg: 4, pts: 12, coin: 1, body: '#5a5480', unlock: 3, desc: 'Slow, but do not ignore it' },
  bachcha: { name: 'Baby Mosquito', emoji: '🐣', tier: 'easy', sp: 110, size: .5, hp: 1, wa: .8, wf: 6, dmg: 2, pts: 8, coin: 0, body: '#7a6ab0', unlock: 4, desc: 'Small, fast, comes in swarms' },
  tez: { name: 'Fast Mosquito', emoji: '⚡', tier: 'medium', sp: 135, size: .85, hp: 1, wa: .95, wf: 7, dmg: 4, pts: 20, coin: 1, body: '#2f3a6c', unlock: 6, desc: 'Zigzags around. Swipe to catch it' },
  chhotu: { name: 'Tiny', emoji: '🔍', tier: 'medium', sp: 95, size: .62, hp: 1, wa: .7, wf: 5, dmg: 3, pts: 25, coin: 1, body: '#3a2f5c', unlock: 7, desc: 'So tiny you need sharp eyes' },
  helmet: { name: 'Helmet Mosquito', emoji: '🪖', tier: 'medium', sp: 70, size: 1.1, hp: 2, wa: .5, wf: 3, dmg: 5, pts: 35, coin: 2, body: '#3a2f5c', unlock: 8, desc: 'Break the helmet first, then the mosquito' },
  zigzag: { name: 'Zig-Zag', emoji: '〰️', tier: 'medium', sp: 105, size: .95, hp: 1, wa: 1.5, wf: 9, dmg: 4, pts: 28, coin: 2, body: '#2a4a8a', unlock: 9, desc: 'Flies in crazy paths' },
  leader: { name: 'Swarm Leader', emoji: '🚩', tier: 'medium', sp: 75, size: 1.2, hp: 2, wa: .4, wf: 2, dmg: 4, pts: 50, coin: 3, body: '#4a1fa8', unlock: 12, desc: 'Speeds up mosquitoes nearby. Hit it first' },
  ninja: { name: 'Ninja', emoji: '🥷', tier: 'hard', sp: 92, size: 1, hp: 1, wa: .8, wf: 4, dmg: 5, pts: 45, coin: 3, body: '#14101e', unlock: 16, desc: 'Invisible. Bring the racket close to see it' },
  chalak: { name: 'Sly', emoji: '🦊', tier: 'hard', sp: 88, size: 1, hp: 1, wa: .6, wf: 4, dmg: 5, pts: 45, coin: 3, body: '#3a2a6e', unlock: 17, desc: 'Runs from the racket and bites where you are not' },
  teleporter: { name: 'Teleporter', emoji: '🌀', tier: 'hard', sp: 70, size: 1, hp: 1, wa: .5, wf: 3, dmg: 5, pts: 50, coin: 3, body: '#2a2a7a', unlock: 18, desc: 'Vanishes and reappears somewhere else' },
  rani: { name: 'Queen Mosquito', emoji: '👑', tier: 'hard', sp: 40, size: 1.8, hp: 3, wa: .3, wf: 1.5, dmg: 6, pts: 80, coin: 5, body: '#5a2fb0', unlock: 21, desc: 'Spawns babies. Hit her fast!' },
  shieldwala: { name: 'Shield Mosquito', emoji: '🛡️', tier: 'hard', sp: 65, size: 1.15, hp: 1, wa: .4, wf: 2.5, dmg: 5, pts: 55, coin: 3, body: '#3a3f6e', unlock: 23, desc: 'Blocks zaps from the front. Hit it from BEHIND' },
  split: { name: 'Split', emoji: '✂️', tier: 'hard', sp: 80, size: 1.2, hp: 1, wa: .5, wf: 3, dmg: 4, pts: 40, coin: 2, body: '#4a3a9a', unlock: 26, desc: 'Splits into 2 babies when hit' },
  bomber: { name: 'Itch Bomber', emoji: '💣', tier: 'hard', sp: 70, size: 1.1, hp: 1, wa: .4, wf: 2, dmg: 4, pts: 55, coin: 3, body: '#2a2440', unlock: 28, desc: 'Drops itch bombs. Zap the bombs too' },
  clone: { name: 'Clone', emoji: '👥', tier: 'pro', sp: 85, size: 1, hp: 1, wa: .6, wf: 4, dmg: 5, pts: 70, coin: 4, body: '#3a2f6c', unlock: 31, desc: 'Makes 2 fake copies. Only the real one has a shadow' },
  kamikaze: { name: 'Kamikaze', emoji: '💥', tier: 'pro', sp: 70, size: 1.05, hp: 1, wa: .3, wf: 2, dmg: 10, pts: 70, coin: 4, body: '#3a2050', unlock: 32, desc: 'Stops, glows, then charges straight in!' },
  doctor: { name: 'Doctor Mosquito', emoji: '➕', tier: 'pro', sp: 60, size: 1.1, hp: 2, wa: .4, wf: 2, dmg: 3, pts: 80, coin: 5, body: '#e6e2f5', unlock: 33, desc: 'Heals other mosquitoes. Take it out first' },
  batterychor: { name: 'Battery Chor', emoji: '🪫', tier: 'pro', sp: 95, size: .95, hp: 1, wa: .7, wf: 5, dmg: 3, pts: 70, coin: 4, body: '#2a3a6a', unlock: 34, desc: 'Drains your battery when it gets close' },
  electric: { name: 'Electric-proof', emoji: '🔌', tier: 'pro', sp: 75, size: 1.2, hp: 3, wa: .4, wf: 3, dmg: 5, pts: 90, coin: 5, body: '#1f2f6a', unlock: 36, desc: 'Needs 3 zaps in a row or it heals' },
  ghost: { name: 'Ghost', emoji: '👻', tier: 'expert', sp: 80, size: 1.05, hp: 1, wa: .6, wf: 3, dmg: 6, pts: 100, coin: 6, body: '#c9c2e6', unlock: 46, desc: 'Can only be hit while glowing' },
  vampire: { name: 'Vampire', emoji: '🧛', tier: 'expert', sp: 78, size: 1.15, hp: 2, wa: .4, wf: 3, dmg: 6, pts: 100, coin: 6, body: '#2a0f4a', unlock: 47, desc: 'Gets stronger with every bite' },
  commander: { name: 'Commander', emoji: '🎖️', tier: 'expert', sp: 65, size: 1.3, hp: 3, wa: .3, wf: 2, dmg: 5, pts: 120, coin: 7, body: '#3a3a6a', unlock: 48, desc: 'Makes the whole army smarter' },
  chameleon: { name: 'Chameleon', emoji: '🦎', tier: 'expert', sp: 85, size: 1, hp: 1, wa: .6, wf: 4, dmg: 6, pts: 100, coin: 6, body: '#1a1430', unlock: 49, desc: 'Blends into the wall' },
  mafia: { name: 'Mafia Gang', emoji: '🕶️', tier: 'expert', sp: 80, size: 1.1, hp: 2, wa: .2, wf: 2, dmg: 5, pts: 90, coin: 5, body: '#1a1428', unlock: 51, desc: 'Flies in groups of three' },
  timefreeze: { name: 'Time-Freeze', emoji: '⏸️', tier: 'expert', sp: 70, size: 1.1, hp: 2, wa: .4, wf: 2, dmg: 5, pts: 120, coin: 7, body: '#2a2a5a', unlock: 52, desc: 'Freezes your racket for 1 second every 7 seconds' }
};
const MT_KEYS = Object.keys(MT);

/* 15 bosses */
const BOSSES = {
  don: { name: 'DENGU DON', emoji: '😎', tier: 'easy', hp: 24, sp: 300, col: '#3a2466', summon: 'normal', moves: ['dash'], taunt: 'I am the boss of this house!' },
  baba: { name: 'BHINBHIN BABA', emoji: '🧔', tier: 'easy', hp: 30, sp: 300, col: '#4a2a3a', summon: 'sust', moves: ['dash', 'teleport'], taunt: 'Bzzz… your racket can not handle my magic!' },
  sultan: { name: 'SUST SULTAN', emoji: '🥱', tier: 'easy', hp: 40, sp: 220, col: '#5a5480', summon: 'sust', moves: ['dash', 'yawn'], taunt: 'Yaaawn… let me nap first, then I bite' },
  topper: { name: 'TOPPER MOSQUITO', emoji: '🤓', tier: 'medium', hp: 40, sp: 340, col: '#2a3466', summon: 'tez', moves: ['dash', 'books'], taunt: 'I have studied every move you make!' },
  dj: { name: 'DJ MOSQUITO', emoji: '🎧', tier: 'medium', hp: 45, sp: 360, col: '#3a1f7a', summon: 'zigzag', moves: ['beat', 'bass'], taunt: 'DROP THE BASSSS!' },
  express: { name: 'EXPRESS MOSQUITO', emoji: '🚂', tier: 'medium', hp: 48, sp: 400, col: '#2a2a5a', summon: 'tez', moves: ['dash', 'train'], taunt: 'Choo choo… next stop: your Papa!' },
  mafia: { name: 'MALARIA MAFIA', emoji: '🕴️', tier: 'hard', hp: 50, sp: 320, col: '#1a1428', summon: 'helmet', moves: ['dash', 'guards'], taunt: 'My guards will deal with you first' },
  overtime: { name: 'OVERTIME BOSS', emoji: '💼', tier: 'hard', hp: 55, sp: 330, col: '#2a3a6a', summon: 'batterychor', moves: ['dash', 'drain'], taunt: 'Your battery is mine now. Overtime!' },
  monsoon: { name: 'MONSOON MONSTER', emoji: '🌧️', tier: 'hard', hp: 60, sp: 320, col: '#2a3a7a', summon: 'bachcha', moves: ['dash', 'split', 'rain'], taunt: 'The rain brought the mosquitoes!' },
  ninjamaster: { name: 'NINJA MASTER', emoji: '🥷', tier: 'pro', hp: 60, sp: 420, col: '#14101e', summon: 'ninja', moves: ['dash', 'teleport', 'clones'], taunt: 'Which one is real? Look for the shadow…' },
  cyber: { name: 'CYBER FRAUD MOSQUITO', emoji: '💻', tier: 'pro', hp: 65, sp: 360, col: '#1f2f6a', summon: 'chalak', moves: ['dash', 'otp', 'fakeitems'], taunt: 'Share your OTP, win a prize 😏' },
  ranimaa: { name: 'RANI MAA', emoji: '👸', tier: 'pro', hp: 70, sp: 300, col: '#5a2fb0', summon: 'bachcha', moves: ['dash', 'eggs', 'guards'], taunt: 'I have a thousand babies. You are alone!' },
  twins: { name: 'NIGHTMARE TWINS', emoji: '👯', tier: 'expert', hp: 45, sp: 400, col: '#2a0f4a', summon: 'vampire', moves: ['dash', 'teleport'], twin: true, taunt: 'Hit one and the other goes crazy!' },
  general: { name: 'MOSQUITO GENERAL', emoji: '🎖️', tier: 'expert', hp: 80, sp: 380, col: '#3a3a6a', summon: 'mafia', moves: ['dash', 'command', 'guards'], taunt: 'Army! Get smart, attack!' },
  maharaja: { name: 'MOSQUITO EMPEROR', emoji: '🤴', tier: 'expert', hp: 100, sp: 420, col: '#4a1fa8', summon: 'commander', moves: ['dash', 'teleport', 'clones', 'guards', 'otp'], taunt: 'This is my kingdom! No more sleep, ever!' }
};
const BOSS_ORDER = ['don', 'baba', 'sultan', 'topper', 'dj', 'express', 'mafia', 'overtime', 'monsoon', 'ninjamaster', 'cyber', 'ranimaa', 'twins', 'general', 'maharaja'];

/* 20 tasks */
const TASKS = {
  survive: { icon: '🌙', name: 'Save the Night', timed: true },
  kill: { icon: '🎯', name: 'Hunt' },
  boss: { icon: '👑', name: 'Boss Fight' },
  nobite: { icon: '🚫', name: 'Zero Bites', timed: true },
  combo: { icon: '🔥', name: 'Combo King', timed: true },
  air: { icon: '🌪️', name: 'Air Kills' },
  hunt: { icon: '🔎', name: 'Special Hunt' },
  multi: { icon: '👨‍👩‍👦', name: 'Whole Family', timed: true },
  limbat: { icon: '🪫', name: 'Last Battery' },
  limzap: { icon: '🎯', name: 'Sniper Night' },
  dark: { icon: '🌑', name: 'Dark Night', timed: true },
  rani: { icon: '👑', name: 'Rani Hunt', timed: true },
  sleepwalk: { icon: '🚶', name: 'Sleepwalker', timed: true },
  timeattack: { icon: '⏱️', name: 'Time Attack', timed: true },
  score: { icon: '💯', name: 'Score Attack', timed: true },
  waves: { icon: '🌊', name: 'Wave Defense' },
  powercut: { icon: '🔌', name: 'Bijli Gul', timed: true },
  swipe: { icon: '👆', name: 'Swipe Master' },
  collect: { icon: '🎁', name: 'Power Collector' },
  jugnu: { icon: '✨', name: 'Save the Fireflies' }
};
const PLAN = [
  ['survive', 'kill', 'air', 'combo', 'boss', 'collect', 'timeattack', 'nobite', 'hunt', 'boss', 'waves', 'dark', 'score', 'multi', 'boss'],
  ['survive', 'swipe', 'limzap', 'jugnu', 'boss', 'powercut', 'rani', 'sleepwalk', 'kill', 'boss', 'limbat', 'waves', 'combo', 'dark', 'boss'],
  ['hunt', 'nobite', 'timeattack', 'air', 'boss', 'jugnu', 'multi', 'score', 'swipe', 'boss', 'powercut', 'limzap', 'waves', 'sleepwalk', 'boss'],
  ['rani', 'combo', 'dark', 'collect', 'boss', 'limbat', 'hunt', 'jugnu', 'nobite', 'boss', 'multi', 'timeattack', 'swipe', 'waves', 'boss'],
  ['powercut', 'sleepwalk', 'air', 'score', 'boss', 'limzap', 'rani', 'dark', 'multi', 'boss', 'waves', 'jugnu', 'nobite', 'hunt', 'boss']
];
const STAR_OBJ = {
  neend80: { t: 'Keep sleep above 80%', ok: (st, g) => g.minNeend >= 80 },
  noface: { t: 'Zero face bites', ok: st => st.faceBites === 0 },
  combo15: { t: 'Build a 15+ combo', ok: st => st.maxCombo >= 15 },
  air10: { t: '10 air kills', ok: st => st.air >= 10 },
  nomega: { t: 'No Mega Zap', ok: st => st.megaUsed === 0 },
  notrap: { t: 'No traps hit', ok: st => st.trapsHit === 0 },
  nohot: { t: 'Racket never overheated', ok: st => st.overheated === 0 },
  defuse2: { t: 'Defuse 2 traps', ok: st => st.defused >= 2 },
  bites5: { t: 'Fewer than 5 bites', ok: st => st.bites < 5 }
};

const LEVELS = [];
(function buildLevels() {
  const unlockedBy = n => MT_KEYS.filter(k => MT[k].unlock <= n);
  let bi = 0;
  for (let w = 0; w < 5; w++) for (let p = 1; p <= 15; p++) {
    const n = w * 15 + p, task = PLAN[w][p - 1], r = seeded(n * 7 + 3);
    const L = { n, w, p, task, diff: 1 + w * 0.2 + p * 0.02 };
    const nt = MT_KEYS.find(k => MT[k].unlock === n); if (nt) L.newType = nt;
    const tierIdx = Math.min(4, Math.floor((p - 1) / 3));
    L.tier = task === 'boss' ? BOSSES[BOSS_ORDER[bi]].tier : TIER_ORDER[clamp(w + (p > 10 ? 1 : 0) - (p < 4 ? 1 : 0), 0, 4)];
    if (task === 'boss') L.boss = BOSS_ORDER[bi++];
    const pool = unlockedBy(n);
    L.huntType = pool.filter(k => !['bachcha'].includes(k)).slice(-1)[0];
    switch (task) {
      case 'survive': L.len = 38 + p * 2 + w * 6; break;
      case 'kill': L.target = 30 + p * 2 + w * 10; break;
      case 'air': L.target = Math.round(18 + p + w * 5); break;
      case 'combo': L.target = Math.round(15 + w * 5 + p / 2); L.len = 45; break;
      case 'nobite': L.len = 40 + w * 5; L.maxBites = 3; break;
      case 'hunt': L.target = 10 + w * 3; break;
      case 'multi': L.len = 42 + w * 5; break;
      case 'limbat': L.target = 20 + w * 5; break;
      case 'limzap': L.target = 20 + w * 5; L.zaps = Math.round((20 + w * 5) * 1.6); break;
      case 'dark': L.len = 40 + w * 5; break;
      case 'rani': L.target = Math.min(5, 3 + w); L.len = 45; break;
      case 'sleepwalk': L.len = 45; break;
      case 'timeattack': L.target = 25 + w * 7; L.len = 30; break;
      case 'score': L.target = 3000 + w * 2500; L.len = 40; break;
      case 'waves': L.target = 5; break;
      case 'powercut': L.len = 42 + w * 5; break;
      case 'swipe': L.target = 30 + w * 8; break;
      case 'collect': L.target = 8 + w * 2; break;
      case 'jugnu': L.target = 25 + w * 7; break;
    }
    if (n === 1) { L.len = 30; }
    // star objectives
    const keys = Object.keys(STAR_OBJ).filter(k => !(task === 'nobite' && k === 'bites5') && !(task === 'swipe' && k === 'nomega') && !(task === 'air' && k === 'air10') && !(task === 'combo' && k === 'combo15'));
    const a = keys[Math.floor(r() * keys.length)]; let b; do { b = keys[Math.floor(r() * keys.length)]; } while (b === a);
    L.stars = [a, b];
    L.story = WORLDS[w].story[Math.floor(r() * WORLDS[w].story.length)];
    LEVELS.push(L);
  }
})();
function goalText(L) {
  const who = (typeof CW !== 'undefined' && CW && CW.who) || WORLDS[L.w].who;
  switch (L.task) {
    case 'survive': return `Keep ${who} asleep for ${L.len} seconds`;
    case 'kill': return `Swat ${L.target} mosquitoes`;
    case 'boss': return `Defeat ${BOSSES[L.boss].name} ${BOSSES[L.boss].emoji}!`;
    case 'nobite': return `${L.len} seconds. More than ${L.maxBites} bites and you fail`;
    case 'combo': return `Build a ${L.target} combo in ${L.len} seconds`;
    case 'air': return `Swat ${L.target} mosquitoes IN THE AIR (away from the bed)`;
    case 'hunt': return `Hunt ${L.target} ${MT[L.huntType].name} ${MT[L.huntType].emoji}`;
    case 'multi': return `${L.len} seconds. Keep all three asleep`;
    case 'limbat': return `One battery only! Swat ${L.target} mosquitoes. No recharge`;
    case 'limzap': return `Swat ${L.target} mosquitoes with only ${L.zaps} zaps`;
    case 'dark': return `Dark all night. Survive ${L.len} seconds`;
    case 'rani': return `Take out all ${L.target} Queen Mosquitoes in ${L.len} seconds`;
    case 'sleepwalk': return `${who} is sleepwalking. Protect them for ${L.len} seconds`;
    case 'timeattack': return `${L.target} mosquitoes in ${L.len} seconds!`;
    case 'score': return `Score ${fmt(L.target)} points in ${L.len} seconds`;
    case 'waves': return `Stop 5 mosquito waves`;
    case 'powercut': return `Power cut, fan off. Survive ${L.len} seconds`;
    case 'swipe': return `Swat ${L.target} mosquitoes with SWIPES only (no tap, no Mega)`;
    case 'collect': return `Catch ${L.target} power-ups`;
    case 'jugnu': return `Swat ${L.target} mosquitoes. Do not hit fireflies! (3 hits = fail)`;
  }
  return '';
}

/* rackets: rarity, stats, special */
const RARITY = {
  common: { name: 'COMMON', col: '#a9a3c9', glow: 'rgba(169,163,201,.35)' },
  rare: { name: 'RARE', col: '#7fd4ff', glow: 'rgba(127,212,255,.45)' },
  epic: { name: 'EPIC', col: '#9a6df5', glow: 'rgba(154,109,245,.6)' },
  legendary: { name: 'LEGENDARY', col: '#c7b0ff', glow: 'rgba(199,176,255,.75)' },
  mythic: { name: 'MYTHIC', col: '#ffffff', glow: 'rgba(255,255,255,.85)' }
};
const RACKETS = [
  { id: 'sasta', name: 'Basic Racket', icon: '🏸', rar: 'common', price: 0, cur: 'c', r: 1, regen: 1, cost: 1, pow: 0, sp: '—', col: '#9a6df5' },
  { id: 'jaali', name: 'Double Mesh', icon: '🥅', rar: 'common', price: 300, cur: 'c', r: 1.3, regen: 1, cost: 1, pow: 0, sp: '+30% bigger area', col: '#c7b0ff' },
  { id: 'turbo', name: 'Turbo Racket', icon: '🔋', rar: 'rare', price: 800, cur: 'c', r: 1.15, regen: 1.7, cost: .7, pow: .03, sp: 'Battery 70% tez charge', col: '#7fd4ff' },
  { id: 'cricket', name: 'Cricket Bat Racket', icon: '🏏', rar: 'rare', price: 1200, cur: 'c', r: 1.15, regen: 1.1, cost: 1, pow: .05, sp: 'Tez swipe = SIXER! 1.5x points', col: '#d9ccff' },
  { id: 'thunder', name: 'Thunder Racket', icon: '⚡', rar: 'epic', price: 2500, cur: 'c', r: 1.2, regen: 1.3, cost: .85, pow: .05, sp: 'Every kill chains to 2 more mosquitoes', col: '#ffffff' },
  { id: 'laser', name: 'Laser Racket', icon: '🔦', rar: 'epic', price: 3000, cur: 'c', r: 1.1, regen: 1.3, cost: .9, pow: .06, sp: 'Swipes leave a laser line', col: '#7fd4ff' },
  { id: 'frost', name: 'Frost Racket', icon: '🧊', rar: 'epic', price: 40, cur: 'g', r: 1.2, regen: 1.3, cost: .9, pow: .05, sp: 'Freezes nearby mosquitoes for 2s', col: '#bfe9ff' },
  { id: 'magnet', name: 'Magnet Racket', icon: '🧲', rar: 'legendary', price: 6000, cur: 'c', r: 1.25, regen: 1.4, cost: .8, pow: .08, sp: 'Pulls mosquitoes towards it', col: '#c7b0ff' },
  { id: 'tesla', name: 'Tesla Coil', icon: '🌩️', rar: 'legendary', price: 80, cur: 'g', r: 1.2, regen: 1.5, cost: .8, pow: .08, sp: 'Hold down to auto zap', col: '#7fd4ff' },
  { id: 'boomerang', name: 'Boomerang Racket', icon: '🪃', rar: 'legendary', price: 100, cur: 'g', r: 1.2, regen: 1.4, cost: .8, pow: .08, sp: 'Mega Zap = a spinning racket across the whole screen', col: '#d9ccff' },
  { id: 'brahmastra', name: 'Brahmastra', icon: '🔱', rar: 'mythic', price: 180, cur: 'g', r: 1.35, regen: 1.6, cost: .7, pow: .12, sp: 'Har 10th zap FREE Mega Zap + chain', col: '#ffffff' },
  { id: 'sanxai', name: 'SANX AI Racket', icon: '🤖', rar: 'mythic', price: 250, cur: 'g', r: 1.3, regen: 1.8, cost: .7, pow: .12, sp: 'AI aims for you + chain', col: '#ffffff' }
];
const ITEMS = {
  coil: { icon: '🌀', name: 'MOSQUITO COIL!', good: 1 },
  pankha: { icon: '🌬️', name: 'FAN AT FULL SPEED!', good: 1 },
  shield: { icon: '🛡️', name: 'CREAM SHIELD!', good: 1 },
  battery: { icon: '🔋', name: 'BATTERY FULL!', good: 1 },
  bag: { icon: '💰', name: '+25 COINS!', good: 1 },
  gem: { icon: '💎', name: '+1 GEM!', good: 1 },
  t_dark5: { icon: '🌑', name: 'BIJLI GUL 5s!', dur: 5, fx: 'dark' },
  t_dark10: { icon: '🌑', name: 'BIJLI GUL 10s!', dur: 10, fx: 'dark' },
  t_double: { icon: '🦟', name: 'DOUBLE MOSQUITOES!', dur: 8, fx: 'double' },
  t_leak: { icon: '🪫', name: 'BATTERY LEAK!', dur: 6, fx: 'leak' },
  t_jam: { icon: '🥶', name: 'RACKET JAM!', dur: 3, fx: 'jam' },
  t_ulta: { icon: '🔄', name: 'FAN REVERSED!', dur: 6, fx: 'ulta' },
  t_smoke: { icon: '💨', name: 'INCENSE SMOKE!', dur: 7, fx: 'smoke' },
  t_small: { icon: '🔻', name: 'TINY RACKET!', dur: 8, fx: 'small' },
  t_turbo: { icon: '⚡', name: 'TURBO MOSQUITOES!', dur: 6, fx: 'turbo' },
  t_karvat: { icon: '😴', name: 'SUDDEN ROLL OVER!', dur: 0, fx: 'karvat' }
};
const GOOD_KEYS = ['coil', 'pankha', 'shield', 'battery', 'bag', 'gem'];
const TRAP_KEYS = Object.keys(ITEMS).filter(k => k.startsWith('t_'));
const GHAR = [
  { id: 'jaali', icon: '🪟', name: 'Window Mesh', desc: '10% fewer mosquitoes', price: 1500, cur: 'c' },
  { id: 'pankha', icon: '🌀', name: 'Fast New Fan', desc: 'Mosquitoes 7% slower', price: 2500, cur: 'c' },
  { id: 'cream', icon: '🧴', name: 'Mosquito Cream', desc: '4s shield at the start of every level', price: 25, cur: 'g' },
  { id: 'tube', icon: '💡', name: 'Emergency Light', desc: 'More light in dark levels', price: 3500, cur: 'c' },
  { id: 'powerbank', icon: '🔌', name: 'Power Bank', desc: 'Battery 20% tez charge', price: 40, cur: 'g' },
  { id: 'net', icon: '🕸️', name: 'Premium Mosquito Net', desc: 'Face bites hurt 20% less', price: 60, cur: 'g' }
];
const BOOSTERS = [
  { id: 'coil', icon: '🌀', name: 'Coil', desc: 'Mosquitoes slow for the first 8s', price: 150 },
  { id: 'shield', icon: '🛡️', name: 'Shield', desc: 'No bites for the first 8s', price: 200 },
  { id: 'battery', icon: '🔋', name: 'Super Battery', desc: '+50% battery capacity', price: 180 },
  { id: 'mega', icon: '⚡', name: 'Free Mega', desc: '3 free Mega Zaps', price: 250 }
];

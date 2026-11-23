/* ================= BEAT SANX — game data =================
   All tunable numbers live here. Brand UI = #743ae8 / #9a6df5.
   Tiles may use any color (incl. gold) — branding never does. */
'use strict';
const D = {};

/* ---------- Modes ---------- */
D.MODES = [
  { id: 'classic',  name: 'Classic',  tag: 'Repeat the pattern',      icon: 'zap',     unlock: 1,  flash: 560 },
  { id: 'reverse',  name: 'Reverse',  tag: 'Repeat it backwards',     icon: 'repeat',  unlock: 3,  flash: 560 },
  { id: 'speed',    name: 'Speed',    tag: 'Fast flashes + timer',    icon: 'bolt2',   unlock: 5,  flash: 280 },
  { id: 'twin',     name: 'Twin',     tag: 'Two tiles at once',       icon: 'copy',    unlock: 7,  flash: 760 },
  { id: 'chaos',    name: 'Chaos',    tag: 'Ignore the fake flashes', icon: 'shuffle', unlock: 9,  flash: 500 },
  { id: 'ghost',    name: 'Ghost',    tag: 'Tiles vanish. Use memory',icon: 'ghost',   unlock: 11, flash: 640 },
  { id: 'negative', name: 'Negative', tag: 'Find the dark tile',      icon: 'moon',    unlock: 13, flash: 640 },
  { id: 'focus',    name: 'Focus',    tag: 'Blink and you miss it',   icon: 'eye',     unlock: 15, flash: 150 },
  { id: 'blitz',    name: 'Blitz',    tag: '90 second race',          icon: 'clock',   unlock: 18, flash: 480 },
  { id: 'zen',      name: 'Zen',      tag: 'No fail. Just flow',      icon: 'leaf',    unlock: 1,  flash: 720 }
];
D.MODE = Object.fromEntries(D.MODES.map(m => [m.id, m]));
D.GAP = 200;
D.HEARTS = 3;
D.BLITZ_SECS = 90;
D.BOSS_SPEED = 0.65;
D.BONUS_CHANCE = 0.22;

/* ---------- Level plan (v1.3) ----------
   Tiles grow very slowly: 13 tiles only around level 500.
   Inside a level the pattern starts at 3 tiles and adds ONE new tile every round
   until the level target (Simon style), so the player never has to learn many new tiles at once.
   Difficulty inside each tile band comes from the grid cycle 3x3 -> 4x4 -> 5x5 (10 levels each)
   and slightly faster flashes on the 5x5 part. A new band resets to 3x3. */
D.MAX_LEN = 13;
D.BANDS = [[30, 4], [100, 5], [200, 6], [260, 7], [310, 8], [350, 9], [390, 10], [430, 11], [470, 12], [Infinity, 13]];
D.band = lv => { let a = 1; for (let i = 0; i < D.BANDS.length; i++) { const [to, n] = D.BANDS[i]; if (lv <= to) return { i, from: a, to, n }; a = to + 1; } };
/* v1.4 saw-tooth: every 10th level is a BOSS with +1 tile (a spike), levels x1/x2 after it are relief (slower flashes),
   level x5 is a TWIST level in Classic (a surprise mode) from level 15 on. */
D.levelLen = lv => D.band(lv).n + (lv % 10 === 0 ? 1 : 0);
D.isRelief = lv => lv > 10 && (lv % 10 === 1 || lv % 10 === 2);
D.TWISTS = ['reverse', 'chaos', 'ghost', 'speed', 'negative'];
D.twistFor = lv => (lv >= 15 && lv % 10 === 5) ? D.TWISTS[Math.floor(lv / 10) % D.TWISTS.length] : null;
/* beat tempo (BPM) of a level: rises slowly with the tile band, boss levels hit harder */
D.bpmFor = lv => Math.min(150, 96 + D.band(lv).i * 5 + (lv % 10 === 0 ? 10 : 0) - (D.isRelief(lv) ? 6 : 0));
D.bpmLadder = len => Math.min(150, 94 + Math.floor(len / 3) * 4);
D.gridChunk = lv => Math.floor(((lv - D.band(lv).from) % 30) / 10);      // 0,1,2 inside a band
D.gridFor = lv => [3, 4, 5][D.gridChunk(lv)];
D.speedFor = lv => (D.gridChunk(lv) === 2 ? 0.88 : 1) * (D.isRelief(lv) ? 1.12 : 1) * Math.max(0.78, 1 - D.band(lv).i * 0.025);
/* v1.4: always 3 rounds per level: target-2, target-1, target (level 1-30: 2, 3, 4 tiles) */
D.levelSteps = lv => { const n = D.levelLen(lv); return [Math.max(2, n - 2), Math.max(2, n - 1), n].filter((v, i, a) => i === 0 || v > a[i - 1]); };
D.LADDER_LV = 3;               // in ladder runs (duels / events) every 3 rounds count as one "level"
D.GRID_MULT = { 3: 1, 4: 1.3, 5: 1.6 };
D.TIERS = [
  { min: 1,   label: 'Beginner' }, { min: 31,  label: 'Apprentice' }, { min: 101, label: 'Skilled' },
  { min: 201, label: 'Expert' },   { min: 311, label: 'Master' },     { min: 431, label: 'Legend' }, { min: 500, label: 'Legend+' }
];
D.tier = lv => [...D.TIERS].reverse().find(t => lv >= t.min);
D.isBoss = lv => lv % 10 === 0;

/* ---------- Worlds (board background by level) ---------- */
D.WORLDS = [
  { min: 1,   name: 'Rookie Plains', icon: 'leaf',    a: '#140a33', b: '#07041a' },
  { min: 11,  name: 'Neon City',     icon: 'zap',     a: '#1a0b40', b: '#090420' },
  { min: 21,  name: 'Ice Cave',      icon: 'drop',    a: '#0a1a3d', b: '#030a1c' },
  { min: 31,  name: 'Mind Maze',     icon: 'brain',   a: '#0d1238', b: '#05061a' },
  { min: 41,  name: 'Lava Core',     icon: 'flame',   a: '#3a0d1c', b: '#14040a' },
  { min: 51,  name: 'Deep Space',    icon: 'planet',  a: '#0b0a2e', b: '#020114' },
  { min: 61,  name: 'Lost Jungle',   icon: 'leaf',    a: '#0b2a1e', b: '#03120c' },
  { min: 71,  name: 'Chaos Realm',   icon: 'shuffle', a: '#2a0b3a', b: '#0d0418' },
  { min: 81,  name: 'Storm Peak',    icon: 'cloud',   a: '#10203a', b: '#040a16' },
  { min: 91,  name: 'Legend Zone',   icon: 'crown',   a: '#22104f', b: '#0a0420' },
  { min: 101, name: 'Sanx Throne',   icon: 'mask',    a: '#2b0e6b', b: '#0b0520' }
];
D.world = lv => { if (lv > 110) { const w = D.WORLDS[1 + Math.floor((lv - 111) / 10) % (D.WORLDS.length - 1)]; return { ...w, min: lv - ((lv - 1) % 10) }; } return [...D.WORLDS].reverse().find(w => lv >= w.min); };

/* ---------- Economy ---------- */
/* coins follow playing time (tiles shown), not the level number, so the slower level plan
   pays the same coins per minute as before (about 2 coins per tile flashed). */
D.coinsRound = (len, g) => Math.max(1, Math.round(len * 0.9 * (D.GRID_MULT[g] || 1)));
D.coinsLevel = (steps, g, lv) => Math.round(steps.reduce((a, b) => a + b, 0) * 1.1 * (D.GRID_MULT[g] || 1) + Math.min(40, lv / 10));
D.xpLevel    = (steps, g) => Math.round(steps.reduce((a, b) => a + b, 0) * 4 * (D.GRID_MULT[g] || 1));
D.BOSS_COINS = 150;
D.COMBO = [
  { min: 0,  mult: 1,   label: '' },
  { min: 8,  mult: 1.5, label: 'COMBO ×1.5' },
  { min: 18, mult: 2,   label: 'HOT STREAK ×2' },
  { min: 32, mult: 3,   label: 'GODLIKE ×3' }
];
D.combo = n => [...D.COMBO].reverse().find(c => n >= c.min);
D.MILESTONES = { 3: 50, 5: 100, 8: 180, 10: 250, 15: 400, 20: 600, 25: 800, 30: 1000, 40: 1500, 50: 2500 };
D.NO_ADS_PRICE = 10000000;   // 1 crore coins: removes forced ads (banner + interstitial). Rewarded stay optional.

/* ---------- Brain rank (XP) ---------- */
D.RANKS = [
  { xp: 0,     name: 'Rookie' },  { xp: 300,   name: 'Sharp' },    { xp: 1200, name: 'Genius' },
  { xp: 4000,  name: 'Mastermind' }, { xp: 10000, name: 'Legend' }, { xp: 25000, name: 'Sanx Slayer' }
];
D.rank = xp => [...D.RANKS].reverse().find(r => xp >= r.xp);
D.nextRank = xp => D.RANKS.find(r => r.xp > xp) || null;

/* ---------- Prestige ---------- */
D.PRESTIGE_AT = [50, 100, 200, 300, 500];
D.prestigeMult = n => 1 + n * 0.5;
D.ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

/* ---------- Tile skins (9 colors + 9 icons) ---------- */
const I9 = ['zap', 'star', 'moon', 'tri', 'circle', 'eye', 'heart', 'sun', 'anchor'];
D.SKINS = [
  { id: 'classic', name: 'Classic', cost: 0,    icons: I9, colors: ['#22d3ee', '#9a6df5', '#22c55e', '#f5b70a', '#f97316', '#3b82f6', '#ec4899', '#14b8a6', '#d946ef'] },
  { id: 'galaxy',  name: 'Galaxy',  cost: 250,  icons: ['planet', 'star', 'moon', 'rocket', 'circle', 'eye', 'comet', 'sun', 'diamond'], colors: ['#4361ee', '#4cc9f0', '#7209b7', '#3a0ca3', '#b5179e', '#f72585', '#560bad', '#4895ef', '#9d4edd'] },
  { id: 'nature',  name: 'Nature',  cost: 250,  icons: ['leaf', 'drop', 'cloud', 'sun', 'moon', 'star', 'heart', 'tri', 'circle'], colors: ['#52b788', '#2d6a4f', '#95d5b2', '#40916c', '#74c69d', '#1b4332', '#b7e4c7', '#081c15', '#d8f3dc'] },
  { id: 'retro',   name: 'Retro',   cost: 400,  icons: ['square', 'tri', 'circle', 'plus', 'x', 'diamond', 'heart', 'star', 'zap'], colors: ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec', '#3a86ff', '#06d6a0', '#ef233c', '#e63946', '#f8961e'] },
  { id: 'inferno', name: 'Inferno', cost: 600,  icons: ['flame', 'zap', 'tri', 'sun', 'star', 'comet', 'drop', 'diamond', 'heart'], colors: ['#ff4500', '#ff6347', '#ff8c00', '#dc143c', '#ff0000', '#ffb000', '#b22222', '#ff6b35', '#ffd000'] },
  { id: 'ocean',   name: 'Ocean',   cost: 600,  icons: ['anchor', 'drop', 'compass', 'moon', 'circle', 'star', 'cloud', 'eye', 'diamond'], colors: ['#00ced1', '#00b4d8', '#0077b6', '#023e8a', '#48cae4', '#0096c7', '#ade8f4', '#90e0ef', '#03045e'] },
  { id: 'cyber',   name: 'Cyber',   cost: 900,  icons: ['chip', 'zap', 'eye', 'square', 'plus', 'x', 'diamond', 'tri', 'circle'], colors: ['#00f5c4', '#00b4d8', '#7209b7', '#f72585', '#b5179e', '#0077b6', '#560bad', '#4cc9f0', '#39ff14'] },
  { id: 'candy',   name: 'Candy',   cost: 900,  icons: ['heart', 'star', 'circle', 'diamond', 'cloud', 'sun', 'moon', 'drop', 'tri'], colors: ['#ffb7c5', '#ff85a1', '#ffc8dd', '#ffafcc', '#bde0fe', '#a2d2ff', '#cdb4db', '#ff99c8', '#fcf6bd'] },
  { id: 'royal',   name: 'Royal',   cost: 1500, icons: ['crown', 'diamond', 'star', 'shield', 'sun', 'heart', 'moon', 'tri', 'circle'], colors: ['#ffd700', '#7b2fff', '#c0c0c0', '#e8006b', '#ffb000', '#4a00e0', '#ffe066', '#9a6df5', '#b8860b'] },
  { id: 'storm',   name: 'Storm',   cost: 1500, icons: ['zap', 'cloud', 'drop', 'comet', 'eye', 'tri', 'star', 'moon', 'circle'], colors: ['#4cc9f0', '#4361ee', '#7209b7', '#b5179e', '#f72585', '#3a0ca3', '#90e0ef', '#560bad', '#ffffff'] },
  { id: 'dragon',  name: 'Dragon',  cost: 3000, icons: ['flame', 'shield', 'crown', 'zap', 'diamond', 'eye', 'star', 'tri', 'sun'], colors: ['#8b0000', '#dc143c', '#ff4500', '#ffd700', '#ff6347', '#daa520', '#b22222', '#ff8c00', '#ffb000'] },
  { id: 'prism',   name: 'Prism',   cost: 3000, icons: ['diamond', 'tri', 'circle', 'star', 'square', 'heart', 'sun', 'moon', 'plus'], colors: ['#ff0040', '#ff7f00', '#ffe600', '#00e676', '#00b0ff', '#651fff', '#d500f9', '#ff4081', '#1de9b6'] },
  { id: 'gold',    name: 'Gold Rush', cost: 5000, icons: ['crown', 'star', 'diamond', 'sun', 'shield', 'zap', 'heart', 'circle', 'tri'], colors: ['#ffd700', '#ffc200', '#ffab00', '#fff1a8', '#e6b800', '#ffcf40', '#d4af37', '#ffe680', '#f5b70a'] },
  { id: 'prestige',name: 'Prestige', cost: -1, prestige: 1, icons: ['crown', 'shield', 'star', 'diamond', 'zap', 'sun', 'heart', 'eye', 'tri'], colors: ['#ffd700', '#9a6df5', '#ffb347', '#743ae8', '#daa520', '#c4a7ff', '#ffe066', '#5b21b6', '#f5b70a'] },
  { id: 'sanx',    name: 'Sanx Purple', cost: -2, icons: ['mask', 'zap', 'star', 'crown', 'eye', 'diamond', 'shield', 'sun', 'heart'], colors: ['#743ae8', '#9a6df5', '#5b21b6', '#c4a7ff', '#8b5cf6', '#6d28d9', '#a78bfa', '#4c1d95', '#ddd6fe'] }
];
/* ad-unlock skins: earned by watching rewarded ads (lifetime count) */
D.SKINS.push(
  { id: 'neon',   name: 'Neon Rush', cost: -3, ads: 8,  icons: ['zap', 'star', 'diamond', 'tri', 'circle', 'comet', 'heart', 'plus', 'x'], colors: ['#00f0ff', '#ff00e5', '#7cff00', '#ff7a00', '#00ff9d', '#b026ff', '#ff2e63', '#00b3ff', '#fffb00'] },
  { id: 'aurora', name: 'Aurora',    cost: -3, ads: 20, icons: ['moon', 'star', 'cloud', 'drop', 'sun', 'comet', 'eye', 'diamond', 'leaf'], colors: ['#2de2e6', '#9a6df5', '#00f5a0', '#3d5afe', '#f72585', '#4cc9f0', '#7209b7', '#80ffdb', '#b5179e'] }
);
D.skin = id => D.SKINS.find(s => s.id === id) || D.SKINS[0];

/* ---------- Boosters ---------- */
D.BOOSTERS = [
  { id: 'slow',     name: 'Slow Flash',   icon: 'turtle',  desc: 'Tiles flash 30% slower',             coins: 400, gems: 3 },
  { id: 'heart',    name: 'Extra Heart',  icon: 'heart',   desc: 'Start with 1 extra heart',           coins: 400, gems: 3 },
  { id: 'double',   name: '2× Coins',     icon: 'coins',   desc: 'Double coins this run',              coins: 700, gems: 5 },
  { id: 'shield',   name: 'Auto Shield',  icon: 'shield',  desc: 'Free revive once',                   coins: 1100, gems: 8 },
  { id: 'hint',     name: 'Hint',         icon: 'bulb',    desc: 'Replay the whole pattern once',      coins: 400, gems: 3 },
  { id: 'freeze',   name: 'Freeze Time',  icon: 'clock',   desc: 'Timers run 50% slower',              coins: 500, gems: 4 },
  { id: 'xray',     name: 'X-Ray',        icon: 'eye',     desc: 'Stuck 3s? Next tile glows (2 per level)', coins: 500, gems: 4 },
  { id: 'second',   name: '2nd Chance',   icon: 'refresh', desc: 'First mistake costs no heart',       coins: 600, gems: 4 },
  { id: 'magnet',   name: 'Coin Magnet',  icon: 'coins',   desc: '+50% coins this run',                coins: 500, gems: 4 },
  { id: 'lucky',    name: 'Lucky Charm',  icon: 'dice',    desc: 'Lucky Box every 2 levels',           coins: 450, gems: 3 },
  { id: 'xp',       name: 'XP Boost',     icon: 'star',    desc: 'Double XP this run',                 coins: 350, gems: 3 },
  { id: 'combo',    name: 'Combo Keeper', icon: 'fire',    desc: 'One mistake keeps your combo',       coins: 450, gems: 3 },
  { id: 'skip',     name: 'Skip Level',   icon: 'next',    desc: 'Skip one level you are stuck on',    coins: 900, gems: 6 },
  { id: 'fog',      name: 'Fog Lens',     icon: 'sun',     desc: 'Ghost tiles keep a faint color',     coins: 450, gems: 3 },
  { id: 'pass',     name: 'Pass Boost',   icon: 'ticket',  desc: 'Double Sanx Pass points this run',   coins: 600, gems: 4 }
];
D.MAX_BOOSTS = 3;
D.BOOST = Object.fromEntries(D.BOOSTERS.map(b => [b.id, b]));
/* v1.4: only 6 boosters stay in the game (simple choice). Old ones are refunded as coins once. */
D.BOOSTERS_ALL = D.BOOSTERS;
D.BOOST_ACTIVE = ['slow', 'heart', 'double', 'shield', 'hint', 'xray'];
D.BOOSTERS = D.BOOSTERS_ALL.filter(b => D.BOOST_ACTIVE.includes(b.id));

/* ---------- v1.4 progressive unlock (classic level needed) ----------
   New players see a clean game; a new feature opens every few levels ("tomorrow something new"). */
D.UNLOCK = {
  spin:   { lv: 3,  name: 'Lucky Spin',     icon: 'sparkle' },
  quests: { lv: 4,  name: 'Daily Quests',   icon: 'flag' },
  duel:   { lv: 5,  name: 'Duels',          icon: 'swords' },
  chall:  { lv: 8,  name: 'Challenges',     icon: 'target' },
  events: { lv: 10, name: 'Events',         icon: 'trophy' },
  pass:   { lv: 15, name: 'Sanx Pass',      icon: 'ticket' },
  arena:  { lv: 20, name: 'Arena',          icon: 'crown' },
  imp:    { lv: 30, name: 'IMPOSSIBLE 100', icon: 'brain' }
};

/* ---------- v1.4 MEMORY SCORE ----------
   The one number that tells how strong your memory is: the longest pattern you ever
   remembered in Memory Test / Daily Beat / Duels / Events (ladder runs, no boosters). */
D.MEM_RANKS = [
  { min: 0,  name: 'Goldfish',   icon: 'drop' },
  { min: 5,  name: 'Rookie',     icon: 'leaf' },
  { min: 7,  name: 'Sharp',      icon: 'zap' },
  { min: 9,  name: 'Elephant',   icon: 'brain' },
  { min: 11, name: 'Genius',     icon: 'star' },
  { min: 13, name: 'Machine',    icon: 'chip' },
  { min: 15, name: 'Superhuman', icon: 'crown' },
  { min: 18, name: 'Sanx Level', icon: 'trophy' }
];
/* ---------- v1.4 AVATARS ----------
   Collection (unlock by playing) + Premium (coins: Rare 10k · Epic 50k · Mythic 2 lakh · Legend 5 lakh).
   The first 4 are ready; the rest are added as their art arrives. */
D.AV_TIERS = { free: { name: 'Free', coins: 0 }, rare: { name: 'Rare', coins: 10000 }, epic: { name: 'Epic', coins: 50000 }, mythic: { name: 'Mythic', coins: 200000 }, legend: { name: 'Legend', coins: 500000 } };
D.AVATARS = [
  { id: 'ace', name: 'Ace', g: 'm', set: 'collection', tier: 'free', unlock: { free: true } },
  { id: 'nova', name: 'Nova', g: 'f', set: 'collection', tier: 'free', unlock: { free: true } },
  { id: 'ronin', name: 'Cyber Ronin', g: 'm', set: 'premium', tier: 'mythic' },
  { id: 'astro', name: 'Astro Queen', g: 'f', set: 'premium', tier: 'legend' }
];
D.AV = Object.fromEntries(D.AVATARS.map(a => [a.id, a]));
D.AV_TOTAL = { collection: 60, premium: 40 };
D.memRank = n => [...D.MEM_RANKS].reverse().find(r => n >= r.min);
D.memNext = n => D.MEM_RANKS.find(r => r.min > n) || null;
D.TEST = { start: 3, grid: 3, hearts: 2 };             // Memory Test: unlimited ladder, 2 mistakes
/* ---------- v1.4 DAILY BEAT ----------
   One pattern a day, the same for every player in the world. One official try, one mistake ends it.
   Score = tiles remembered. Sanx posts his own score every day. */
D.DBEAT = { epoch: Date.UTC(2026, 10, 22), start: 3, grid: 3, hearts: 1, coins: 15, winBonus: 150, practiceAds: 1 };
D.dbeatNo = (d = new Date()) => Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - D.DBEAT.epoch) / 864e5) + 1;
D.sanxScore = no => 7 + ((no * 2654435761) >>> 0) % 5;   // 7..11, different every day

/* ---------- Chests ---------- */
D.CHESTS = [
  { id: 'bronze', name: 'Bronze Chest', price: 500,  coins: [60, 160],   gems: [1, 2],  shields: [0, 1], boost: 0.25, color: '#cd7f32' },
  { id: 'silver', name: 'Silver Chest', price: 1500, coins: [180, 420],  gems: [2, 4],  shields: [1, 2], boost: 0.55, color: '#c0c7d6' },
  { id: 'gold',   name: 'Gold Chest',   price: 3500, coins: [450, 900],  gems: [5, 9],  shields: [2, 3], boost: 0.9,  color: '#ffd24a' },
  { id: 'brain',  name: 'Brain Chest',  price: 7000, coins: [900, 2200], gems: [8, 16], shields: [2, 4], boost: 1,    color: '#9a6df5' }
];

/* ---------- Spin wheel ---------- */
D.SPIN = [
  { kind: 'coins', v: 50,  w: 22 }, { kind: 'gems', v: 1, w: 14 }, { kind: 'coins', v: 120, w: 16 }, { kind: 'shield', v: 1, w: 10 },
  { kind: 'coins', v: 250, w: 10 }, { kind: 'boost', v: 'slow', w: 10 }, { kind: 'gems', v: 3, w: 6 }, { kind: 'coins', v: 600, w: 4 },
  { kind: 'boost', v: 'double', w: 6 }, { kind: 'gems', v: 10, w: 2 }
];
D.SPIN_AD_MAX = 3;

/* ---------- Shop: free stuff (most of it through rewarded ads) ---------- */
D.FREE_GIFT_EVERY = 4 * 36e5;               // free gift (no ad) every 4 hours
D.FREE_GIFT = [40, 120];                    // coins range
D.AD_OFFERS = [
  { id: 'gems',   name: '3 Diamonds',     icon: 'gem',    cap: 5, r: { gems: 3 } },
  { id: 'coins',  name: '200 Coins',      icon: 'coin',   cap: 5, r: { coins: 200 } },
  { id: 'boost',  name: 'Mystery Booster',icon: 'bulb',   cap: 3, r: { boost: 'random' } },
  { id: 'shield', name: '1 Shield',       icon: 'shield', cap: 2, r: { shields: 1 } },
  { id: 'chest',  name: 'Free Chest',     icon: 'gift',   cap: 3, cool: 3 * 36e5, r: { chest: 'bronze' } },
  { id: 'xp',     name: '300 XP',         icon: 'brain',  cap: 3, r: { xp: 300 } }
];
/* daily ad track: every reward ad watched today fills it (all ads count) */
D.AD_TRACK = [
  { n: 2,  r: { coins: 150 } },
  { n: 5,  r: { gems: 4 } },
  { n: 8,  r: { chest: 'silver' } },
  { n: 12, r: { boost: 'shield', shields: 1 } },
  { n: 16, r: { chest: 'gold', gems: 5 } }
];
D.TRIAL_MIN = 30;                          // every ad trial lasts 30 minutes
D.TRIAL_MAX_DAY = 10;                      // max 10 trials a day (all shop tabs together)
D.SHIELD_GEMS = 8; D.SPIN_GEMS = 8;
D.DEAL_OFF = 0.4;                           // daily skin deal: 40% off
D.BUNDLE = { price: 600, boosts: 5 };       // booster bundle for coins

/* ---------- Daily login calendar ---------- */
D.LOGIN = [
  { coins: 100 }, { coins: 150 }, { gems: 2 }, { coins: 250 }, { shields: 1 }, { coins: 400 }, { gems: 5, chest: 'silver' }
];

/* ---------- Quests ---------- */
D.QUESTS = [
  { id: 'lv3',     t: 'Clear 3 levels',            k: 'levels', n: 3,  coins: 60 },
  { id: 'lv6',     t: 'Clear 6 levels',            k: 'levels', n: 6,  coins: 120 },
  { id: 'cl3',     t: 'Clear 3 Classic levels',    k: 'mode:classic', n: 3, coins: 70 },
  { id: 'rv2',     t: 'Clear 2 Reverse levels',    k: 'mode:reverse', n: 2, coins: 90 },
  { id: 'tw2',     t: 'Clear 2 Twin levels',       k: 'mode:twin', n: 2, coins: 100 },
  { id: 'gh2',     t: 'Clear 2 Ghost levels',      k: 'mode:ghost', n: 2, coins: 100 },
  { id: 'cb8',     t: 'Hit an 8-tap combo',        k: 'combo',  n: 8,  coins: 70 },
  { id: 'cb15',    t: 'Hit a 15-tap combo',        k: 'combo',  n: 15, coins: 140 },
  { id: 'pf2',     t: 'Clear 2 levels flawless',   k: 'perfect', n: 2, coins: 90 },
  { id: 'md3',     t: 'Play 3 different modes',    k: 'modes',  n: 3,  coins: 110 },
  { id: 'boss1',   t: 'Defeat a Boss level',       k: 'boss',   n: 1,  coins: 150 },
  { id: 'coin300', t: 'Earn 300 coins in games',   k: 'earn',   n: 300, coins: 100 },
  { id: 'ev1',     t: 'Play any Event',            k: 'event',  n: 1,  coins: 120 },
  { id: 'ad1',     t: 'Spin the wheel',            k: 'spin',   n: 1,  coins: 40 }
];
D.QUEST_ALL_GEMS = 3;

/* ---------- Achievements ---------- */
D.ACH = [
  { id: 'first',   t: 'First Step',      d: 'Clear your first level',         k: 'levelsTotal', n: 1,   c: 30 },
  { id: 'lv25',    t: 'Warming Up',      d: 'Clear 25 levels',                k: 'levelsTotal', n: 25,  c: 100 },
  { id: 'lv100',   t: 'Memory Machine',  d: 'Clear 100 levels',               k: 'levelsTotal', n: 100, c: 300 },
  { id: 'lv500',   t: 'Unstoppable',     d: 'Clear 500 levels',               k: 'levelsTotal', n: 500, c: 1000 },
  { id: 'best10',  t: 'Neon City',       d: 'Reach level 10 in any mode',     k: 'bestLevel',   n: 10,  c: 80 },
  { id: 'best25',  t: 'Mind Maze',       d: 'Reach level 25 in any mode',     k: 'bestLevel',   n: 25,  c: 200 },
  { id: 'best50',  t: 'Legend Zone',     d: 'Reach level 50 in any mode',     k: 'bestLevel',   n: 50,  c: 600 },
  { id: 'boss1',   t: 'Boss Slayer',     d: 'Defeat your first Boss',         k: 'bosses',      n: 1,   c: 120 },
  { id: 'boss10',  t: 'Boss Hunter',     d: 'Defeat 10 Bosses',               k: 'bosses',      n: 10,  c: 500 },
  { id: 'combo10', t: 'Hot Hands',       d: 'Hit a 10-tap combo',             k: 'bestCombo',   n: 10,  c: 60 },
  { id: 'combo25', t: 'Godlike',         d: 'Hit a 25-tap combo',             k: 'bestCombo',   n: 25,  c: 250 },
  { id: 'modes5',  t: 'Explorer',        d: 'Clear a level in 5 modes',       k: 'modesCleared', n: 5,  c: 150 },
  { id: 'modes10', t: 'Master of All',   d: 'Clear a level in all 10 modes',  k: 'modesCleared', n: 10, c: 500 },
  { id: 'streak3', t: 'On Fire',         d: '3-day login streak',             k: 'streak',      n: 3,   c: 80 },
  { id: 'streak7', t: 'Week Warrior',    d: '7-day login streak',             k: 'streak',      n: 7,   c: 250 },
  { id: 'daily1',  t: 'Daily Grind',     d: 'Win a Daily Challenge',          k: 'dailies',     n: 1,   c: 100 },
  { id: 'quest10', t: 'Quest Master',    d: 'Complete 10 quests',             k: 'quests',      n: 10,  c: 200 },
  { id: 'bts1',    t: 'Sanx Beaten',     d: 'Win Beat the Sanx once',         k: 'btsWins',     n: 1,   c: 200 },
  { id: 'bts10',   t: 'Sanx Nightmare',  d: 'Win Beat the Sanx 10 times',     k: 'btsWins',     n: 10,  c: 800 },
  { id: 'skin3',   t: 'Collector',       d: 'Own 3 tile skins',               k: 'skins',       n: 3,   c: 120 },
  { id: 'prest1',  t: 'Reborn',          d: 'Prestige once',                  k: 'prestige',    n: 1,   c: 500 },
  { id: 'rich',    t: 'Crystal Rich',    d: 'Hold 10,000 coins',              k: 'coins',       n: 10000, c: 300 }
];

/* ---------- Seasons (rotate every 7 days) ---------- */
D.SEASONS = [
  { id: 'coin',    name: 'Coin Rush',    desc: '2× coins on every level',     icon: 'coins' },
  { id: 'boss',    name: 'Boss Blitz',   desc: 'Boss rewards doubled',        icon: 'skull' },
  { id: 'gem',     name: 'Diamond Rain', desc: 'Diamonds drop on level clears', icon: 'diamond' },
  { id: 'xp',      name: 'Brain Storm',  desc: '2× XP on every level',        icon: 'brain' }
];
D.season = () => { const wk = Math.floor(Date.now() / (7 * 864e5)); const s = D.SEASONS[wk % D.SEASONS.length]; const end = (wk + 1) * 7 * 864e5; return { ...s, end }; };

/* ---------- AI rivals (always labeled as AI in the UI) ---------- */
D.AI_NAMES = ['Nexa', 'Bolt', 'Pixel', 'Vortex', 'Cipher', 'Nova', 'Echo', 'Blaze', 'Orbit', 'Frost', 'Rogue', 'Zenith', 'Quartz', 'Comet', 'Raven', 'Titan'];

/* ---------- Sanx lines ---------- */
D.SANX = {
  home: ['Back again? I never lose.', 'Your memory vs mine. Easy win.', 'Tap Play. I dare you.', 'Nobody beats Sanx. Nobody.', 'I remember everything. Do you?'],
  win: ['Okay... that was lucky.', 'Not bad. Not bad at all.', 'Hmph. Do it again.', 'You got me this time.'],
  lose: ['Ha! I knew it.', 'Is that all you got?', 'My turn to laugh.', 'Too slow. Try again.'],
  boss: ['BOSS LEVEL. Faster. Harder.', 'Let\'s see you handle THIS.', 'No mercy this round.'],
  near: ['So close... but no.', 'Almost had me. Almost.', 'One more tile. That\'s all you needed.', 'Painful, right? Go again.'],
  daily: ['Today I got {s}. Your move.', 'My score today: {s}. Good luck.', '{s} tiles. Beat that, if you can.', 'I did {s} before breakfast.'],
  dwin: ['WHAT? You beat my {s}?!', 'Fine. You win today. Tomorrow is mine.', 'Screenshot this. It won\'t happen again.'],
  dlose: ['{s} > {n}. As expected.', 'Nice try. Come back tomorrow.', 'Tell your friends you lost to Sanx.'],
  test: ['Let\'s see what your brain can do.', 'Memory Test. No boosters. No excuses.', 'Most people quit at 7.']
};

/* ---------- EVENTS ---------- */
/* Events run on the EVENT LADDER: pattern starts at 2 tiles and grows +1 every round.
   Goals are pattern lengths (tiles), so the slow level plan never makes events easy. */
D.BTS = {
  attempts: 5,
  tiers: [
    { tiles: 6,  entry: 100,  secs: 70,  reward: 180,  unlock: 0 },
    { tiles: 8,  entry: 200,  secs: 100, reward: 400,  unlock: 0 },
    { tiles: 9,  entry: 350,  secs: 120, reward: 770,  unlock: 1 },
    { tiles: 10, entry: 500,  secs: 140, reward: 1150, unlock: 3 },
    { tiles: 11, entry: 750,  secs: 165, reward: 1875, unlock: 5 },
    { tiles: 12, entry: 1200, secs: 190, reward: 3600, unlock: 10 }
  ],
  insurance: 0.3, refund: 0.5,
  streak: [{ n: 2, m: 1.2 }, { n: 3, m: 1.5 }, { n: 5, m: 2 }]
};
D.OMA = {
  attempts: 5,
  rivals: [
    { name: 'Private Jax',    at: 5,  bounty: 150 },
    { name: 'Corporal Drake', at: 7,  bounty: 250 },
    { name: 'Sergeant Vera',  at: 9,  bounty: 400 },
    { name: 'Captain Rook',   at: 11, bounty: 600 },
    { name: 'General Magnus', at: 13, bounty: 1000 }
  ],
  suddenEvery: 4      // every 4th tile length (4, 8, 12 ...) is sudden death: 1 heart
};
/* Beat the Champion: the AI champion is always ahead of YOU.
   Champion tiles = your best pattern (last 10 ladder runs) + 2, so it never gets easy.
   Beat him and Champion II, III ... arrive with bigger bounties. */
D.BTC = {
  attempts: 3,
  champs: [
    { name: 'Nexa',   mode: 'classic', line: 'Nobody has come close.' },
    { name: 'Bolt',   mode: 'speed',   line: 'Speed is my language.' },
    { name: 'Vortex', mode: 'chaos',   line: 'Chaos is my home.' },
    { name: 'Raven',  mode: 'ghost',   line: 'I play in the dark.' },
    { name: 'Frost',  mode: 'focus',   line: 'Zero mistakes.' },
    { name: 'Titan',  mode: 'reverse', line: 'Backwards is easy.' }
  ],
  lead: 2, minTiles: 7, ladderStep: 1, bountyGrow: 1.5,
  bountyBase: 1000, bountyDay: 1200, bountyMax: 9000,
  rewards: [{ pct: 0.8, coins: 350, label: 'Within 20%' }, { pct: 0.9, coins: 700, label: 'Within 10%' }, { pct: 0.95, coins: 1500, label: 'Within 5%' }]
};
D.champScore = t => Math.round(t * t * 110 * 2.6 * 0.93);
D.BCOINS = {
  tiers: [
    { name: 'Bronze',   at: 300,  reward: 100,  mult: 1 },
    { name: 'Silver',   at: 700,  reward: 250,  mult: 1.2 },
    { name: 'Gold',     at: 1500, reward: 500,  mult: 1.5 },
    { name: 'Platinum', at: 3000, reward: 1000, mult: 2 },
    { name: 'Diamond',  at: 6000, reward: 2500, mult: 3 }
  ],
  rooms: [{ at: 1, n: 'Lobby' }, { at: 4, n: 'Vault Hall' }, { at: 8, n: 'Security Wing' }, { at: 12, n: 'Gold Chamber' }, { at: 18, n: 'Diamond Vault' }, { at: 25, n: 'Inner Sanctum' }]
};
D.TOUR = {
  stages: [
    { id: 1, name: 'Classic Grid', week: 1, modes: ['classic', 'reverse', 'focus'],     mult: 1,   goal: 15000, attempts: 8 },
    { id: 2, name: 'Speed Grid',   week: 2, modes: ['speed', 'chaos'],                  mult: 1.5, goal: 30000, attempts: 6 },
    { id: 3, name: 'Shadow Grid',  week: 3, modes: ['ghost', 'negative', 'twin'],       mult: 2,   goal: 50000, attempts: 5 },
    { id: 4, name: 'Apex Grid',    week: 4, modes: [],                                  mult: 3,   goal: 90000, attempts: 3 }
  ],
  rewards: [200, 500, 1200, 2500, 5000],
  surgeEveryH: 4, surgeMins: 10, surgeMult: 3
};
D.MANIA = {
  phases: [{ id: 'qualifier', name: 'Qualifier', to: 14, mult: 1 }, { id: 'championship', name: 'Championship', to: 23, mult: 1.5 }, { id: 'final', name: 'Grand Final', to: 31, mult: 2 }],
  milestones: [{ s: 8000, coins: 200 }, { s: 18000, coins: 500 }, { s: 35000, coins: 1200, gems: 3 }, { s: 70000, coins: 2500, gems: 6 }, { s: 120000, coins: 5000, gems: 10, skin: 'sanx' }],
  /* Division League: your monthly best decides your division; finish high to start the next month higher */
  divisions: [
    { id: 'bronze',   name: 'Bronze',   at: 0,      reward: { coins: 300 } },
    { id: 'silver',   name: 'Silver',   at: 12000,  reward: { coins: 800 } },
    { id: 'gold',     name: 'Gold',     at: 30000,  reward: { coins: 1800, gems: 3 } },
    { id: 'platinum', name: 'Platinum', at: 60000,  reward: { coins: 3500, gems: 6 } },
    { id: 'diamond',  name: 'Diamond',  at: 100000, reward: { coins: 6000, gems: 10 } },
    { id: 'sanx',     name: 'Sanx League', at: 160000, reward: { coins: 10000, gems: 20 } }
  ]
};
/* ---------- Arena: 5 premium daily challenges (event ladder) ---------- */
D.ARENA = [
  { id: 'gauntlet', name: 'The Gauntlet',   icon: 'swords', tag: 'A new mode every 3 rounds',       hearts: 3, rules: ['Pattern starts at 2 tiles and grows +1 every round.', 'Every 3 rounds the mode changes: Classic, Reverse, Chaos, Ghost, Negative, Speed.', '3 hearts. No revives.', 'Rewards by the longest pattern you clear.'] },
  { id: 'tower',    name: 'Survival Tower', icon: 'flag',   tag: 'One heart. Climb floor by floor', hearts: 1, rules: ['Pattern starts at 2 tiles and grows +1 every round.', 'Every 2 tiles is a new floor. Each floor pays coins instantly.', '1 heart only. One mistake and you fall.', 'Watch an ad once to keep climbing.'] },
  { id: 'speedrun', name: 'Speed Run',      icon: 'clock',  tag: 'Fast flashes, a timer every round', hearts: 3, rules: ['Speed mode on the event ladder.', 'Every round has its own timer.', '3 hearts.', 'Rewards by the longest pattern you clear.'] },
  { id: 'bossrush', name: 'Boss Rush',      icon: 'skull',  tag: 'Every round is a boss round',     hearts: 2, rules: ['Every round flashes at boss speed.', '2 hearts. No revives.', 'Triple coins for every round.', 'Rewards by the longest pattern you clear.'] },
  { id: 'roulette', name: 'Mode Roulette',  icon: 'dice',   tag: 'Random mode every round',         hearts: 3, rules: ['Each round spins a random mode you have unlocked.', 'The mode name shows before the pattern.', '3 hearts.', 'Rewards by the longest pattern you clear.'] }
];
D.ARENA_RW = [{ t: 6, coins: 150 }, { t: 8, coins: 400 }, { t: 10, coins: 900 }, { t: 12, coins: 2000, gems: 3 }, { t: 14, coins: 4000, gems: 8 }];
D.ARENA_TRIES = 3;


/* =====================================================================
   v1.2 ADDITIONS
   ===================================================================== */

/* ---------- Animated tile skins (own shop tab). First 5: ad trial 30 min. Last 5: premium, no trial ---------- */
D.SKINS.push(
  { id: 'a_pulse',  cat: 'anim', anim: 'pulse',  name: 'Pulse',       cost: 5000,  desc: 'Tiles beat like a heart', icons: ['heart', 'zap', 'star', 'circle', 'diamond', 'sun', 'moon', 'tri', 'eye'], colors: ['#ff3d7f', '#ff5c8a', '#f72585', '#ff7aa2', '#d6245a', '#ff4d6d', '#c9184a', '#ff8fab', '#e5383b'] },
  { id: 'a_liquid', cat: 'anim', anim: 'liquid', name: 'Liquid',      cost: 7500,  desc: 'Water waves inside every tile', icons: ['drop', 'cloud', 'anchor', 'moon', 'circle', 'star', 'compass', 'eye', 'diamond'], colors: ['#00b4d8', '#0096c7', '#48cae4', '#0077b6', '#00a6fb', '#4cc9f0', '#3a86ff', '#90e0ef', '#0353a4'] },
  { id: 'a_neon',   cat: 'anim', anim: 'neon',   name: 'Neon Flicker',cost: 10000, desc: 'Neon sign glow and flicker', icons: ['zap', 'star', 'diamond', 'tri', 'circle', 'heart', 'plus', 'x', 'eye'], colors: ['#00f0ff', '#ff00e5', '#7cff00', '#ff7a00', '#00ff9d', '#b026ff', '#ff2e63', '#00b3ff', '#f9f871'] },
  { id: 'a_lava',   cat: 'anim', anim: 'lava',   name: 'Lava',        cost: 15000, desc: 'Molten lava flows inside', icons: ['flame', 'drop', 'sun', 'tri', 'star', 'comet', 'zap', 'diamond', 'circle'], colors: ['#ff4500', '#ff6a00', '#e63946', '#ff8c00', '#d00000', '#f48c06', '#dc2f02', '#ffba08', '#9d0208'] },
  { id: 'a_galaxy', cat: 'anim', anim: 'galaxy', name: 'Galaxy Swirl',cost: 20000, desc: 'A swirling galaxy in each tile', icons: ['planet', 'star', 'moon', 'rocket', 'comet', 'sun', 'eye', 'diamond', 'circle'], colors: ['#4361ee', '#7209b7', '#3a0ca3', '#b5179e', '#4cc9f0', '#560bad', '#f72585', '#480ca8', '#4895ef'] },
  { id: 'a_crystal',cat: 'anim', anim: 'crystal',name: 'Crystal',     cost: 35000,  gems: 500,  premium: 1, desc: 'Diamond shine and light rays', icons: ['diamond', 'star', 'sun', 'tri', 'eye', 'circle', 'moon', 'heart', 'crown'], colors: ['#a5f3fc', '#c4b5fd', '#99f6e4', '#bfdbfe', '#f5d0fe', '#bae6fd', '#ddd6fe', '#a7f3d0', '#e0e7ff'] },
  { id: 'a_thunder',cat: 'anim', anim: 'thunder',name: 'Thunder',     cost: 50000,  gems: 1000, premium: 1, desc: 'Lightning cracks on every tap', icons: ['zap', 'cloud', 'drop', 'comet', 'eye', 'tri', 'star', 'moon', 'shield'], colors: ['#4cc9f0', '#4361ee', '#7209b7', '#3a0ca3', '#00b4d8', '#560bad', '#90e0ef', '#3f37c9', '#48cae4'] },
  { id: 'a_phantom',cat: 'anim', anim: 'phantom',name: 'Phantom',     cost: 75000,  gems: 2000, premium: 1, desc: 'Tiles vanish into smoke and return', icons: ['ghost', 'moon', 'eye', 'skull', 'cloud', 'star', 'drop', 'tri', 'circle'], colors: ['#9ca3af', '#a78bfa', '#6b7280', '#c4b5fd', '#818cf8', '#94a3b8', '#7c3aed', '#cbd5e1', '#6366f1'] },
  { id: 'a_phoenix',cat: 'anim', anim: 'phoenix',name: 'Phoenix',     cost: 100000, gems: 3500, premium: 1, desc: 'Wings of fire, sparks on tap', icons: ['flame', 'sun', 'star', 'crown', 'zap', 'comet', 'heart', 'diamond', 'shield'], colors: ['#ff4800', '#ff9100', '#ff6d00', '#ffb700', '#e85d04', '#ff0054', '#ffaa00', '#d00000', '#ff7900'] },
  { id: 'a_king',   cat: 'anim', anim: 'king',   name: 'Sanx King',   cost: 200000, gems: 5000, premium: 1, desc: 'Sanx mask on every tile. He laughs when you tap', icons: ['mask', 'mask', 'mask', 'mask', 'crown', 'mask', 'mask', 'mask', 'mask'], colors: ['#743ae8', '#9a6df5', '#5b21b6', '#c4a7ff', '#ffd700', '#8b5cf6', '#6d28d9', '#a78bfa', '#4c1d95'] }
);

/* ---------- Cosmetic shop tabs. Each: 1 free default + 5 normal (ad trial) + 5 premium (no trial) ---------- */
D.COS_TABS = [
  { id: 'tap',   name: 'Tap Effects', icon: 'sparkle', def: 'none',    what: 'What happens when you tap a tile' },
  { id: 'shape', name: 'Tile Shapes', icon: 'square',  def: 'rounded', what: 'The shape of every tile' },
  { id: 'sound', name: 'Sound Packs', icon: 'music',   def: 'synth',   what: 'The sound each tile makes' },
  { id: 'flash', name: 'Flash Style', icon: 'zap',     def: 'glow',    what: 'How tiles light up' },
  { id: 'win',   name: 'Win Effects', icon: 'trophy',  def: 'basic',   what: 'Your level clear celebration' },
  { id: 'frame', name: 'Frames',      icon: 'crown',   def: 'none',    what: 'Profile frame and badge friends see' }
];
const _C = (id, name, cost, gems, desc) => ({ id, name, cost, gems: gems || 0, premium: gems ? 1 : 0, desc });
D.COS = {
  tap: [_C('none', 'Classic Pop', 0), _C('sparks', 'Sparks', 5000, 0, 'Bright sparks fly out'), _C('confetti', 'Confetti', 8000, 0, 'A burst of confetti'), _C('bubbles', 'Bubbles', 12000, 0, 'Soap bubbles float up'), _C('petals', 'Petals', 18000, 0, 'Flower petals drift away'), _C('stars', 'Stardust', 25000, 0, 'Tiny stars shoot out'),
    _C('lightning', 'Lightning', 40000, 500, 'A bolt strikes the tile'), _C('ink', 'Ink Splash', 60000, 1200, 'Paint splatters everywhere'), _C('fire', 'Fireburst', 85000, 2000, 'Flames burst from the tile'), _C('galaxy', 'Galaxy Dust', 120000, 3000, 'A mini galaxy explodes'), _C('crowns', 'Crown Rain', 150000, 4000, 'Golden crowns rain down')],
  shape: [_C('rounded', 'Rounded', 0), _C('circle', 'Circle', 5000, 0, 'Perfect round tiles'), _C('squircle', 'Squircle', 7500, 0, 'Soft phone-icon shape'), _C('diamond', 'Diamond', 10000, 0, 'Tilted diamond tiles'), _C('hexagon', 'Hexagon', 15000, 0, 'Honeycomb tiles'), _C('octagon', 'Octagon', 20000, 0, 'Eight-sided tiles'),
    _C('star', 'Star', 35000, 500, 'Star shaped tiles'), _C('heart', 'Heart', 50000, 900, 'Heart shaped tiles'), _C('shield', 'Shield', 65000, 1500, 'Knight shield tiles'), _C('leaf', 'Leaf', 80000, 2200, 'Leaf shaped tiles'), _C('crystal', 'Crystal Cut', 100000, 3000, 'Cut-gem tiles')],
  sound: [_C('synth', 'Classic Synth', 0), _C('piano', 'Piano', 5000, 0, 'Grand piano keys'), _C('marimba', 'Marimba', 8000, 0, 'Warm wooden marimba'), _C('8bit', '8-bit Retro', 12000, 0, 'Old arcade sounds'), _C('musicbox', 'Music Box', 18000, 0, 'Tiny music box chimes'), _C('drums', 'Drum Kit', 25000, 0, 'Every tile is a drum'),
    _C('tabla', 'Tabla', 40000, 500, 'Tabla bols on every tile'), _C('orchestra', 'Orchestra', 60000, 1200, 'Big strings and brass'), _C('synthwave', 'Synthwave', 85000, 2000, 'Retro 80s synths'), _C('glass', 'Glass Harp', 120000, 3000, 'Crystal glass tones'), _C('storm', 'Storm', 150000, 4000, 'Thunder and rain hits')],
  flash: [_C('glow', 'Glow', 0), _C('pulse', 'Pulse', 5000, 0, 'Tiles pulse when lit'), _C('bounce', 'Bounce', 7500, 0, 'Tiles jump when lit'), _C('zoom', 'Zoom', 10000, 0, 'Tiles zoom toward you'), _C('ripple', 'Ripple', 15000, 0, 'A ring ripples out'), _C('spin', 'Spin', 20000, 0, 'Tiles spin when lit'),
    _C('flip', 'Flip', 35000, 500, 'Tiles flip over like cards'), _C('shockwave', 'Shockwave', 50000, 900, 'A shockwave blasts out'), _C('neon', 'Neon Outline', 65000, 1500, 'Bright neon border'), _C('prism', 'Prism', 80000, 2200, 'Rainbow light sweep'), _C('supernova', 'Supernova', 100000, 3000, 'A star explodes on the tile')],
  win: [_C('basic', 'Classic', 0), _C('confetti', 'Confetti', 5000, 0, 'Confetti shower'), _C('coinrain', 'Coin Rain', 8000, 0, 'Coins rain down'), _C('stars', 'Star Burst', 12000, 0, 'Stars explode out'), _C('balloons', 'Balloons', 18000, 0, 'Balloons float up'), _C('fireworks', 'Fireworks', 25000, 0, 'A fireworks show'),
    _C('lightning', 'Thunder Win', 40000, 500, 'Lightning strikes the screen'), _C('rockets', 'Rockets', 60000, 1200, 'Rockets fly up and pop'), _C('galaxy', 'Galaxy', 85000, 2000, 'A galaxy swirls open'), _C('phoenix', 'Phoenix Rise', 120000, 3000, 'A fire bird rises'), _C('sanx', 'Sanx Rage', 150000, 4000, 'Sanx loses his mind')],
  frame: [_C('none', 'No frame', 0), _C('silver', 'Silver', 5000, 0, 'Clean silver ring'), _C('neon', 'Neon', 8000, 0, 'Glowing neon ring'), _C('flame', 'Flame', 12000, 0, 'Ring of fire'), _C('ice', 'Ice', 18000, 0, 'Frozen crystal ring'), _C('gold', 'Gold', 25000, 0, 'Shining gold ring'),
    _C('diamond', 'Diamond', 50000, 500, 'Sparkling diamond ring'), _C('thunder', 'Thunder', 80000, 1200, 'Electric storm ring'), _C('galaxy', 'Galaxy', 120000, 2500, 'Spinning galaxy ring'), _C('phoenix', 'Phoenix', 160000, 3800, 'Burning phoenix ring'), _C('king', 'Sanx King', 200000, 5000, 'Crown frame + King badge'), { id: 'collector', name: 'Collector', cost: -1, gems: 0, premium: 0, hidden: 1, desc: 'Own all 10 items of any shop tab' }]
};
D.cos = (cat, id) => (D.COS[cat] || []).find(x => x.id === id) || D.COS[cat][0];

/* ---------- Sets: matching items together, 20% off. Normal-only sets get a 30 min ad trial ---------- */
D.SETS = [
  { id: 'neon',    name: 'Neon Set',      icon: 'zap',    items: { skin: 'a_neon', tap: 'sparks', sound: '8bit', flash: 'pulse', frame: 'neon' } },
  { id: 'galaxy',  name: 'Galaxy Set',    icon: 'planet', items: { skin: 'a_galaxy', tap: 'stars', sound: 'musicbox', flash: 'ripple', win: 'stars' } },
  { id: 'thunder', name: 'Thunder Set',   icon: 'cloud',  items: { skin: 'a_thunder', tap: 'lightning', sound: 'storm', flash: 'shockwave', frame: 'thunder' } },
  { id: 'phoenix', name: 'Phoenix Set',   icon: 'flame',  items: { skin: 'a_phoenix', tap: 'fire', win: 'phoenix', flash: 'supernova', frame: 'phoenix' } },
  { id: 'king',    name: 'Sanx King Set', icon: 'crown',  items: { skin: 'a_king', tap: 'crowns', win: 'sanx', shape: 'crystal', frame: 'king' } }
];
D.SET_OFF = 0.2;
D.setItem = (k, id) => k === 'skin' ? D.skin(id) : D.cos(k, id);
D.setPrice = set => {
  const items = Object.entries(set.items).map(([k, id]) => D.setItem(k, id));
  const premium = items.some(i => i.premium);
  const coins = Math.round(items.reduce((a, i) => a + i.cost, 0) * (1 - D.SET_OFF) / 1000) * 1000;
  const gems = premium ? Math.round(items.reduce((a, i) => a + (i.gems || i.cost / 50), 0) * (1 - D.SET_OFF) / 100) * 100 : 0;
  return { coins, gems, premium };
};

/* ---------- Collection rewards ---------- */
D.COLLECT = { tab5: { gems: 50 }, tab10: { gems: 300 }, set: { gems: 100 }, styleMaster: { coins: 20000 }, legend: { skin: 'legend' } };
D.BADGES = {
  collector: { name: 'Collector', icon: 'gift' }, styleMaster: { name: 'Style Master', icon: 'sparkle' }, legend: { name: 'Legend', icon: 'crown' },
  king: { name: 'Sanx King', icon: 'mask' }, imp50: { name: 'Mind 50+', icon: 'brain' }, imp100: { name: 'IMPOSSIBLE', icon: 'trophy' }, slayer: { name: 'Friend Slayer', icon: 'swords' }
};
D.SKINS.push({ id: 'legend', name: 'Legend', cost: -6, desc: 'Only for players who own everything', icons: ['crown', 'diamond', 'star', 'mask', 'sun', 'shield', 'zap', 'heart', 'eye'], colors: ['#ffd700', '#9a6df5', '#00f0ff', '#ff3d7f', '#743ae8', '#7cff00', '#ff7a00', '#c4a7ff', '#ffffff'] });

/* ---------- IMPOSSIBLE 100 ---------- */
D.IMP = {
  min: 10, max: 100, quick: [10, 20, 30, 50, 60, 100],
  coins: n => n * n, gems: n => Math.floor(n * n / 100),
  secs: n => 5 + 2 * n,               // tap time for a round with n tiles (generous)
  flash: 520, gap: 230,               // same comfortable speed for the whole run
  checkpointEvery: 5, freeEntries: 1,
  continues: n => Math.ceil(n * 0.5),     // continues = 50% of the target (10 -> 5, 100 -> 50)
  contGems: 5, contCoins: 1000            // when no ad is available
};

/* ---------- Challenge a Friend ---------- */
/* ---------- Friend Duels (Duel Ladder) ----------
   Pattern starts at 2 tiles and grows +1 every round on a 4x4 grid, 2 hearts.
   Score = longest pattern cleared. Same seed for both players. */
D.CHAL = {
  stakes: [0, 100, 250, 500, 1000], pct: 0.10, expireH: 24, perFriendDay: 5,
  adWin: 200, freeWin: 100, minLevel: 10, winBonusAd: 0.5,
  ladder: { start: 2, grid: 4, hearts: 2 },
  modes: ['classic', 'reverse', 'speed', 'twin', 'chaos', 'ghost', 'negative', 'focus']
};

/* ---------- Challenges tab: 10 challenges x 3 stars, 30 stars = Legendary skin ---------- */
D.CHALLENGES = [
  { id: 'c1',  name: 'Warm Up',        icon: 'zap',     mode: 'classic',  stars: [5, 7, 9],    tag: 'Classic ladder' },
  { id: 'c2',  name: 'Mirror Mind',    icon: 'repeat',  mode: 'reverse',  stars: [5, 7, 9],    tag: 'Reverse ladder' },
  { id: 'c3',  name: 'Flash Point',    icon: 'bolt2',   mode: 'speed',    stars: [5, 7, 9],    tag: 'Speed ladder' },
  { id: 'c4',  name: 'Double Trouble', icon: 'copy',    mode: 'twin',     stars: [4, 6, 8],    tag: 'Twin ladder' },
  { id: 'c5',  name: 'Fake Out',       icon: 'shuffle', mode: 'chaos',    stars: [5, 7, 9],    tag: 'Chaos ladder' },
  { id: 'c6',  name: 'Lights Out',     icon: 'ghost',   mode: 'ghost',    stars: [5, 7, 9],    tag: 'Ghost ladder' },
  { id: 'c7',  name: 'Black Hole',     icon: 'moon',    mode: 'negative', stars: [5, 7, 9],    tag: 'Negative ladder' },
  { id: 'c8',  name: 'Blink',          icon: 'eye',     mode: 'focus',    stars: [5, 7, 9],    tag: 'Focus ladder' },
  { id: 'c9',  name: 'Big Board',      icon: 'square',  mode: 'classic',  stars: [6, 8, 10],   tag: '5x5 grid ladder', grid: 5 },
  { id: 'c10', name: 'One Heart',      icon: 'heart',   mode: 'classic',  stars: [7, 9, 11],   tag: '1 heart, no mistakes', hearts: 1 }
];
D.STAR_RW = [{ coins: 150 }, { coins: 350 }, { coins: 700, gems: 2 }];
D.STARS_FOR_SKIN = 30;
D.SKINS.push({ id: 'starlord', name: 'Star Legend', cost: -7, desc: 'Collect all 30 challenge stars', anim: 'pulse', icons: ['star', 'crown', 'diamond', 'comet', 'sun', 'planet', 'zap', 'shield', 'trophy'], colors: ['#ffd700', '#9a6df5', '#00e5ff', '#ff3d7f', '#743ae8', '#22c55e', '#f97316', '#c4a7ff', '#3b82f6'] });

/* ---------- Lucky Box (every 4th level clear) ---------- */
D.LUCKY_EVERY = 4;
D.luckyCoins = lv => 30 + lv * 3;

/* ---------- Sanx Pass SEASON (14 days, 30 tiers, free track + Gold track) ----------
   Gold track unlocks for free by watching 3 rewarded ads in the season (never real money). */
D.PASS = {
  tiers: 30, per: 60, goldAds: 3,
  pts: { level: 10, boss: 30, event: 25, quest: 40, daily: 50, imp: 40, chal: 40 },
  reward: i => { const n = i + 1; if (n === 30) return { skin: 'passx', gems: 30 }; if (n % 10 === 0) return { chest: n === 20 ? 'gold' : 'silver' }; if (n % 5 === 0) return { gems: 5 }; if (n % 3 === 0) return { boost: ['slow', 'heart', 'double', 'hint', 'shield', 'xray'][n % 6] }; return { coins: 80 + n * 20 }; },
  gold: i => { const n = i + 1; if (n % 5 === 0) return n % 10 === 0 ? { chest: n === 30 ? 'brain' : 'gold' } : { gems: 8 }; if (n % 2 === 0) return { boost: ['double', 'shield', 'xray', 'heart', 'slow', 'double', 'shield'][n % 7] }; return { coins: 150 + n * 30 }; },
  missions: [
    { id: 'm1', t: 'Clear 30 levels', k: 'levelsTotal', n: 30, pts: 120 },
    { id: 'm2', t: 'Win 3 duels', k: 'chalWins', n: 3, pts: 150 },
    { id: 'm3', t: 'Beat 5 bosses', k: 'bosses', n: 5, pts: 150 },
    { id: 'm4', t: 'Play 10 event runs', k: 'evRuns', n: 10, pts: 120 },
    { id: 'm5', t: 'Remember a 10-tile pattern', k: 'bestTiles', n: 10, pts: 200 }
  ]
};
D.SKINS.push({ id: 'passx', name: 'Pass Elite', cost: -5, desc: 'Reach tier 30 of a Sanx Pass', icons: ['bolt2', 'star', 'crown', 'diamond', 'mask', 'zap', 'shield', 'sun', 'trophy'], colors: ['#9a6df5', '#00e5ff', '#ff3d7f', '#743ae8', '#ffd700', '#22c55e', '#f97316', '#c4a7ff', '#3b82f6'] });

/* ---------- Comeback reward (away 3+ days) ---------- */
D.COMEBACK = { days: 3, r: { coins: 1000, gems: 10, boost: 'double' }, chest: 'silver' };

/* ---------- Rewarded-ad placement limits ---------- */
D.ADCAP = { replay: 3, extraTry: 1, bts30: 1, freeBoost: 3, questReroll: 1, dailyRetry: 1, contAd: 2 };

/* ---------- Festival skins (limited, only during the festival) ---------- */
D.SKINS.push(
  { id: 'f_xmas',  fest: 'xmas',  name: 'Christmas', cost: -4, icons: ['star', 'gift', 'heart', 'sun', 'diamond', 'moon', 'crown', 'circle', 'tri'], colors: ['#e63946', '#2a9d8f', '#f1faee', '#c1121f', '#40916c', '#ffd166', '#d62828', '#1b4332', '#ffffff'] },
  { id: 'f_ny',    fest: 'ny',    name: 'New Year',  cost: -4, icons: ['sparkle', 'star', 'clock', 'zap', 'diamond', 'crown', 'sun', 'comet', 'heart'], colors: ['#ffd700', '#c0c0c0', '#9a6df5', '#00e5ff', '#ff3d7f', '#743ae8', '#ffe066', '#ffffff', '#4cc9f0'] },
  { id: 'f_kite',  fest: 'kite',  name: 'Patang',    cost: -4, icons: ['diamond', 'diamond', 'diamond', 'sun', 'cloud', 'diamond', 'diamond', 'star', 'diamond'], colors: ['#ff006e', '#fb5607', '#ffbe0b', '#3a86ff', '#8338ec', '#06d6a0', '#ef476f', '#118ab2', '#ffd166'] },
  { id: 'f_tri',   fest: 'tri',   name: 'Tiranga',   cost: -4, icons: ['star', 'sun', 'star', 'circle', 'compass', 'circle', 'star', 'sun', 'star'], colors: ['#ff9933', '#ff9933', '#ff9933', '#ffffff', '#ffffff', '#ffffff', '#138808', '#138808', '#138808'] },
  { id: 'f_love',  fest: 'love',  name: 'Hearts',    cost: -4, icons: ['heart', 'heart', 'star', 'heart', 'diamond', 'heart', 'sparkle', 'heart', 'heart'], colors: ['#ff006e', '#ff4d6d', '#ff8fab', '#c9184a', '#ffb3c1', '#ff758f', '#e5383b', '#ffccd5', '#a4133c'] },
  { id: 'f_holi',  fest: 'holi',  name: 'Holi',      cost: -4, icons: ['drop', 'sparkle', 'drop', 'star', 'drop', 'heart', 'drop', 'sun', 'drop'], colors: ['#ff006e', '#ffbe0b', '#3a86ff', '#8338ec', '#06d6a0', '#fb5607', '#ff4d6d', '#00bbf9', '#9b5de5'] },
  { id: 'f_eid',   fest: 'eid',   name: 'Chand',     cost: -4, icons: ['moon', 'star', 'moon', 'star', 'sparkle', 'star', 'moon', 'star', 'moon'], colors: ['#2a9d8f', '#e9c46a', '#264653', '#90e0ef', '#ffd166', '#1d3557', '#a8dadc', '#f4a261', '#457b9d'] },
  { id: 'f_azadi', fest: 'azadi', name: 'Azadi',     cost: -4, icons: ['flag', 'star', 'flag', 'sun', 'compass', 'sun', 'flag', 'star', 'flag'], colors: ['#ff9933', '#ffb366', '#ff9933', '#ffffff', '#000080', '#ffffff', '#138808', '#2db34a', '#138808'] },
  { id: 'f_rakhi', fest: 'rakhi', name: 'Rakhi',     cost: -4, icons: ['sun', 'heart', 'star', 'sparkle', 'sun', 'sparkle', 'star', 'heart', 'sun'], colors: ['#ff006e', '#ffbe0b', '#e63946', '#fb8500', '#d00000', '#ffd166', '#c1121f', '#ff7b00', '#f72585'] },
  { id: 'f_modak', fest: 'modak', name: 'Modak',     cost: -4, icons: ['drop', 'flame', 'drop', 'sun', 'star', 'sun', 'drop', 'flame', 'drop'], colors: ['#ffb703', '#fb8500', '#e85d04', '#ffd60a', '#d00000', '#f48c06', '#ffba08', '#dc2f02', '#faa307'] },
  { id: 'f_garba', fest: 'garba', name: 'Garba',     cost: -4, icons: ['sun', 'star', 'circle', 'diamond', 'sparkle', 'diamond', 'circle', 'star', 'sun'], colors: ['#ff006e', '#ffbe0b', '#06d6a0', '#ef476f', '#118ab2', '#ffd166', '#8338ec', '#fb5607', '#3a86ff'] },
  { id: 'f_diya',  fest: 'diya',  name: 'Diwali',    cost: -4, icons: ['flame', 'sparkle', 'flame', 'star', 'sun', 'star', 'flame', 'sparkle', 'flame'], colors: ['#ff9f1c', '#ffbf69', '#e85d04', '#ffd60a', '#d00000', '#ffba08', '#f48c06', '#ffe066', '#dc2f02'] },
  { id: 'f_ghost', fest: 'ghost', name: 'Spooky',    cost: -4, icons: ['ghost', 'skull', 'moon', 'eye', 'ghost', 'eye', 'moon', 'skull', 'ghost'], colors: ['#ff7b00', '#7209b7', '#3c096c', '#ff9e00', '#10002b', '#ff6d00', '#5a189a', '#ff8500', '#240046'] }
);

/* ---------- FESTIVAL EVENTS (national + international). Dates for the next 12 months.
   Moving festivals (Holi, Eid, Rakhi, Ganesh, Navratri, Diwali) are updated every year.
   No deity images, no flag images: only colors and symbols. ---------- */
D.FESTS = [
  { id: 'xmas',  name: "Santa's Gifts",      fest: 'Christmas',       icon: 'gift',    from: '2026-12-15', to: '2026-12-26', skin: 'f_xmas',  kind: 'advent', theme: ['#c1121f', '#1b4332'],
    tag: 'A gift every day + snowy Classic challenge', rules: ['A new gift box opens every day from 15 to 25 December.', 'Play the Snow Challenge: remember a 9-tile Classic pattern (starts at 2, +1 every round). 3 hearts.', 'Win the Snow Challenge to unlock the Christmas tile skin.', '3 tries a day. Watch an ad for 1 extra try.'], goal: 8, mode: 'classic', reward: { coins: 1500, gems: 10 } },
  { id: 'ny',    name: 'New Year Countdown', fest: 'New Year',        icon: 'clock',   from: '2026-12-31', to: '2027-01-02', skin: 'f_ny',    kind: 'speed', theme: ['#ffd700', '#3a0ca3'],
    tag: '60 second speed race into the new year', rules: ['60 seconds on the clock.', 'Clear as many steps as you can in Speed mode.', 'Wrong tap costs 3 seconds.', '20+ steps unlocks the New Year skin.'], goal: 20, mode: 'speed', secs: 60, reward: { coins: 2026, gems: 12 } },
  { id: 'kite',  name: 'Kite Cut',           fest: 'Uttarayan',       icon: 'diamond', from: '2027-01-12', to: '2027-01-16', skin: 'f_kite',  kind: 'kite', theme: ['#fb5607', '#3a86ff'],
    tag: 'Every round you clear cuts an AI kite', rules: ['Each round you clear cuts one AI kite.', 'Cut 7 kites to win (pattern starts at 2 tiles, +1 every round).', '3 hearts. A wrong tap lets an AI kite cut yours (lose a heart).', 'Win to unlock the Patang skin.'], goal: 7, mode: 'classic', reward: { coins: 1400, gems: 8 } },
  { id: 'tri',   name: 'Tiranga Challenge',  fest: 'Republic Day',    icon: 'flag',    from: '2027-01-24', to: '2027-01-27', skin: 'f_tri',   kind: 'tri', theme: ['#ff9933', '#138808'],
    tag: 'Three colors. Speed rises every level', rules: ['The board uses only three colors.', 'Every level the flashes get 8% faster.', 'Survive 6 levels to win.', 'Win to unlock the Tiranga skin.'], goal: 6, mode: 'classic', reward: { coins: 1950, gems: 8 } },
  { id: 'love',  name: 'Heart Match',        fest: "Valentine's Day", icon: 'heart',   from: '2027-02-12', to: '2027-02-15', skin: 'f_love',  kind: 'twin', theme: ['#ff006e', '#a4133c'],
    tag: 'Twin mode: two hearts at once', rules: ['Twin mode: two tiles light together. Tap both.', 'Match 14 pairs to win.', '3 hearts, no revives.', 'Win to unlock the Hearts skin.'], goal: 14, mode: 'twin', reward: { coins: 1400, gems: 8 } },
  { id: 'eid',   name: 'Chand Raat',         fest: 'Eid',             icon: 'moon',    from: '2027-03-08', to: '2027-03-11', skin: 'f_eid',   kind: 'ghost', theme: ['#2a9d8f', '#1d3557'],
    tag: 'Play in the dark under the moon', rules: ['Ghost mode: tiles go dark after the pattern.', 'Remember an 8-tile pattern from memory (starts at 2, +1 every round).', '3 hearts.', 'Win to unlock the Chand skin.'], goal: 7, mode: 'ghost', reward: { coins: 1500, gems: 10 } },
  { id: 'holi',  name: 'Color Splash',       fest: 'Holi',            icon: 'drop',    from: '2027-03-20', to: '2027-03-24', skin: 'f_holi',  kind: 'holi', theme: ['#ff006e', '#3a86ff'],
    tag: 'Tile colors swap every round', rules: ['Every round the tile colors get shuffled.', 'Remember the position, not the color.', 'Remember a 9-tile pattern to win (starts at 2, +1 every round).', 'Win to unlock the Holi skin + diamonds.'], goal: 12, mode: 'classic', reward: { coins: 1500, gems: 15 } },
  { id: 'azadi', name: 'Azadi Run',          fest: 'Independence Day',icon: 'flag',    from: '2027-08-13', to: '2027-08-16', skin: 'f_azadi', kind: 'marathon', theme: ['#ff9933', '#138808'],
    tag: '15 level marathon', rules: ['Classic marathon: clear 15 levels in one run.', '3 hearts. One ad revive allowed.', 'Every 5 levels: bonus coins.', 'Win to unlock the Azadi skin.'], goal: 15, mode: 'classic', reward: { coins: 1947, gems: 15 } },
  { id: 'rakhi', name: 'Bhai-Behen Duo',     fest: 'Raksha Bandhan',  icon: 'heart',   from: '2027-08-15', to: '2027-08-18', skin: 'f_rakhi', kind: 'duo', theme: ['#ff006e', '#fb8500'],
    tag: 'Friend Challenges pay double', rules: ['Every Friend Challenge win pays double during the festival.', 'Duo round: Twin mode, clear 10 pairs.', '3 hearts.', 'Win the duo round to unlock the Rakhi skin.'], goal: 10, mode: 'twin', reward: { coins: 1200, gems: 8 } },
  { id: 'modak', name: 'Modak Hunt',         fest: 'Ganesh Chaturthi',icon: 'drop',    from: '2027-09-03', to: '2027-09-14', skin: 'f_modak', kind: 'collect', theme: ['#ffb703', '#d00000'],
    tag: 'Collect modaks on every level', rules: ['Every level you clear drops modaks (1 to 3).', 'Collect 51 modaks during the festival.', 'Milestones at 11, 21 and 51 modaks.', 'Reach 51 to unlock the Modak skin.'], goal: 51, mode: 'classic', reward: { coins: 2100, gems: 12 } },
  { id: 'garba', name: '9 Raatein Garba',    fest: 'Navratri',        icon: 'sun',     from: '2027-09-30', to: '2027-10-09', skin: 'f_garba', kind: 'nights', theme: ['#ff006e', '#06d6a0'],
    tag: '9 nights, a new mode every night', rules: ['Each night has its own mode.', 'Remember a 7-tile pattern in that mode to light the night.', 'Light all 9 nights for the mega prize.', 'Missed a night? Watch an ad to replay it once.'], goal: 6, mode: 'classic', reward: { coins: 3000, gems: 20, chest: 'gold' }, nights: ['classic', 'reverse', 'speed', 'twin', 'chaos', 'ghost', 'negative', 'focus', 'classic'] },
  { id: 'diya',  name: 'Diya Jalao',         fest: 'Diwali',          icon: 'flame',   from: '2027-10-25', to: '2027-11-03', skin: 'f_diya',  kind: 'diya', theme: ['#ff9f1c', '#d00000'],
    tag: 'Light 100 diyas. Every diya pays', rules: ['Every step you clear lights 1 diya.', 'Light 100 diyas during the festival.', 'Rewards at 25, 50, 75 and 100 diyas.', 'Reach 100 to unlock the Diwali skin.'], goal: 100, mode: 'classic', reward: { coins: 2500, gems: 20 } },
  { id: 'ghost', name: 'Ghost Night',        fest: 'Halloween',       icon: 'ghost',   from: '2027-10-29', to: '2027-11-01', skin: 'f_ghost', kind: 'spooky', theme: ['#ff7b00', '#3c096c'],
    tag: 'Ghost and Chaos swap every level', rules: ['Levels switch between Ghost and Chaos.', 'Survive 6 levels.', '3 hearts.', 'Win to unlock the Spooky skin.'], goal: 6, mode: 'ghost', reward: { coins: 1310, gems: 10 } }
];
D.festDate = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).getTime(); };

/* ---------- Event rules (shown with the (i) button) ---------- */
D.RULES = {
  bts: ['Event ladder: the pattern starts at 2 tiles and grows +1 every round.', 'Pick a target: 6 to 12 tiles, each with its own timer.', 'Bet coins to enter. Reach the target before the clock ends to win the prize.', '3 hearts, no revives. Lose and Sanx keeps your bet.', 'Coin insurance (+30% bet) gives 50% back if you lose.', 'Win streaks raise the prize up to 2×.', '5 attempts a day. Watch an ad for 1 extra try and once per round for +30 seconds.'],
  champ: ['The AI champion is always 2 tiles ahead of your best pattern (last 10 event runs). Locked for the week.', 'Event ladder: starts at 2 tiles, +1 every round. Score = tiles², combo and accuracy.', 'Reach 80%, 90%, 95% of the score for rewards.', 'Beat him: take the bounty, then Champion II arrives (+1 tile, 1.5× bounty). Then III, IV, V.', 'The bounty grows every day of the week.', '3 tries a day. Watch an ad for 1 extra try.'],
  oma: ['Event ladder in Classic: starts at 2 tiles, +1 every round.', '5 AI soldiers: clear a 5, 7, 9, 11 and 13 tile pattern to eliminate each one and win its bounty.', 'Every 4th tile length (4, 8, 12) is SUDDEN DEATH: 1 heart only.', 'No revives.', 'Rank rewards for every soldier you eliminate this week.', '5 attempts a week. Watch an ad for 1 extra try a day.'],
  bco: ['Raid the vault: earn as many coins as you can in one run.', 'Higher tiers raise your coin multiplier for the day.', '15+ combo = JACKPOT (×2). Last hour of the day = ×1.5.', 'Play every day for a streak bonus up to ×2.', '5 raids a day. Watch an ad for 1 extra raid.'],
  tour: ['4 grids this month. A new grid opens every week.', 'Each grid has its own modes and point multiplier.', 'Flash Surge every 4 hours: 10 minutes of ×3 points.', 'Hit the grid goal for a big reward.', 'Limited tries per grid. Watch an ad for 1 extra try a day.'],
  mania: ['Monthly score chase on the event ladder in any mode you unlocked.', 'Score = longest pattern², combo and accuracy.', 'Three phases: Qualifier ×1, Championship ×1.5, Grand Final ×2.', 'Division League: Bronze, Silver, Gold, Platinum, Diamond, Sanx League. Your division pays a reward when the month ends.', 'Milestones pay coins and diamonds. 1,20,000 points unlocks the Sanx Purple skin.', '5 tries a day. Watch an ad for 1 extra try.'],
  daily: ['DAILY BEAT: one pattern a day, the same for every player in the world.', 'It starts at 3 tiles and grows +1 every round.', 'ONE mistake ends it. Your score = tiles remembered.', 'Sanx posts his own score every day. Beat it for +150 coins.', 'Share your grid. Practice runs (ad) never change your official score.'],
  imp: ['Pick your target: 10 to 100 tiles.', 'The pattern starts at 1 tile and grows by 1 every round.', 'Same comfortable speed for the whole run. Generous tap timer: 5 sec + 2 sec per tile.', 'Checkpoint every 5 tiles (optional, with an ad). After a mistake you can restart from it.', 'Continue after a mistake with an ad: max 3 per run. Replay the pattern with an ad.', 'Reward: tiles × tiles coins. Diamonds only on your first win of each target per day.', '1 free entry a day. More entries with an ad.'],
  chal: ['Duel Ladder: the pattern starts at 2 tiles and grows +1 every round, on a 4x4 grid with 2 hearts.', 'Your score is the longest pattern you remember. Your friend plays the exact same pattern.', 'Friend must remember MORE tiles than you. Same tiles? Fewer mistakes wins, then the faster time.', 'No revives, no boosters, no ads inside a duel. Fair for both.', 'Bet limit: 10% of your coins, max 1,000. Coins never move between players: Sanx Bank pays the winner 2x the bet.', 'Your bet waits in Sanx Bank. No reply in 24 hours = your FULL bet comes back.', 'Max 5 duels with the same friend per day. You need level 10 to win coins.', 'Online duels (when on): results arrive by themselves, invite friends by player ID, or play a random real opponent.']
};

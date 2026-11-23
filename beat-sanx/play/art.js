/* ================= BEAT SANX — vector art =================
   Icon set (24px stroke icons), currency icons and the Sanx character. */
'use strict';
const ART = {};

const P = {
  zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  star: '<path d="M12 2.5l2.9 6.2 6.6.6-5 4.5 1.5 6.7L12 17l-6 3.5 1.5-6.7-5-4.5 6.6-.6z"/>',
  moon: '<path d="M20.5 13.3A8.5 8.5 0 1 1 10.7 3.5a6.6 6.6 0 0 0 9.8 9.8z"/>',
  tri: '<path d="M12 3.5 21.5 20h-19z"/>',
  circle: '<circle cx="12" cy="12" r="8.5"/>',
  eye: '<path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/>',
  heart: '<path d="M20.4 5a5.3 5.3 0 0 0-7.6 0L12 5.9 11.2 5a5.3 5.3 0 0 0-7.6 7.5L12 21l8.4-8.5A5.3 5.3 0 0 0 20.4 5z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/>',
  anchor: '<circle cx="12" cy="5" r="2.5"/><path d="M12 7.5V21M5 12H2.5a9.5 9.5 0 0 0 19 0H19M8 11h8"/>',
  planet: '<circle cx="12" cy="12" r="5.5"/><path d="M3.5 15.5c-2-2.5 2-6 8.5-8s11-.9 9 1.8-5.6 5.4-11.5 6.6-6 .1-6-.4"/>',
  rocket: '<path d="M14 4c3-1.5 6-1 6-1s.5 3-1 6l-6 6-4-4z"/><path d="M8 11l-4 1 3-4h4M13 16l-1 4 4-3v-4M6 18c-1 1-1.5 3-1.5 3s2-.5 3-1.5"/>',
  comet: '<circle cx="16" cy="8" r="4"/><path d="M13 11 3 21M11 8 4 15M16 13l-7 7"/>',
  diamond: '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M9 3l3 18 3-18"/>',
  leaf: '<path d="M4.5 20.5C4.5 10.5 10.5 4 20.5 4c0 10-6.5 16.5-16 16.5z"/><path d="M4.5 20.5 14 11"/>',
  drop: '<path d="M12 2.5l5.6 5.7a7.9 7.9 0 1 1-11.2 0z"/>',
  cloud: '<path d="M17.5 10h-1.2A7 7 0 1 0 9 19.5h8.5a4.75 4.75 0 0 0 0-9.5z"/>',
  square: '<rect x="4" y="4" width="16" height="16" rx="2.5"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  x: '<path d="M5.5 5.5l13 13M18.5 5.5l-13 13"/>',
  flame: '<path d="M12 2.5c.8 3.7 6 5.6 6 11.5a6 6 0 0 1-12 0c0-3 1.8-4.8 3-6.8 0 1.8 1 3 2 3 .2-3-.3-5.5 1-7.7z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5 13.6 13.6 8.5 15.5l1.9-5.1z"/>',
  chip: '<rect x="6" y="6" width="12" height="12" rx="1.5"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
  shield: '<path d="M12 21.5s8-4 8-10.2V5.2L12 2.5 4 5.2v6.1c0 6.2 8 10.2 8 10.2z"/>',
  mask: '<path d="M2 10c3-3 7-2.5 10 0 3-2.5 7-3 10 0-.5 4-3 6-6 6-2 0-3.2-1-4-2.5-.8 1.5-2 2.5-4 2.5-3 0-5.5-2-6-6z"/>',
  repeat: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
  bolt2: '<path d="M13 19l9-7-9-7zM2 19l9-7-9-7z"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 4 3h9a1.5 1.5 0 0 1 1.5 1.5V5"/>',
  shuffle: '<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
  ghost: '<path d="M5 21V10a7 7 0 0 1 14 0v11l-2.5-2-2.3 2-2.2-2-2.2 2-2.3-2z"/><circle cx="9.5" cy="10.5" r="1"/><circle cx="14.5" cy="10.5" r="1"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  turtle: '<path d="M4 15c0-4.5 3.6-8 8-8s8 3.5 8 8z"/><path d="M20 13h2M6 15l-1 3M18 15l1 3M9 9l3 6 3-6"/>',
  coins: '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v4c0 1.7 2.7 3 6 3s6-1.3 6-3V7"/><path d="M9 14v3c0 1.7 2.7 3 6 3s6-1.3 6-3v-4c0-1.6-2.4-2.9-5.5-3"/>',
  bulb: '<path d="M9 18h6M10 21.5h4M12 2.5a6.5 6.5 0 0 0-4 11.6c.6.5 1 1.3 1 2.1V16h6v-.8c0-.8.4-1.6 1-2.1A6.5 6.5 0 0 0 12 2.5z"/>',
  skull: '<path d="M12 2.5a8 8 0 0 0-5 14.2V20h10v-3.3A8 8 0 0 0 12 2.5z"/><circle cx="9" cy="11" r="1.6"/><circle cx="15" cy="11" r="1.6"/><path d="M10 20v-2M14 20v-2"/>',
  brain: '<path d="M9 3.5a3 3 0 0 0-3 3 3 3 0 0 0-2.5 4.6A3.2 3.2 0 0 0 5 17a3 3 0 0 0 4 3.3V3.5zM15 3.5a3 3 0 0 1 3 3 3 3 0 0 1 2.5 4.6A3.2 3.2 0 0 1 19 17a3 3 0 0 1-4 3.3V3.5z"/>',
  gift: '<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13M12 8C9 3 6 5 7.5 8M12 8c3-5 6-3 4.5 0"/>',
  trophy: '<path d="M7 3.5h10v5a5 5 0 0 1-10 0z"/><path d="M7 5.5H3.5c0 3 1.5 5 3.7 5.3M17 5.5h3.5c0 3-1.5 5-3.7 5.3M12 13.5v3.5M8 21h8M9.5 17h5v4h-5z"/>',
  home: '<path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/>',
  user: '<circle cx="12" cy="8" r="4.5"/><path d="M3.5 21.5c.8-4.5 4.2-7 8.5-7s7.7 2.5 8.5 7"/>',
  cart: '<path d="M2.5 3h3l2.3 11.3a2 2 0 0 0 2 1.7h8.4a2 2 0 0 0 2-1.6L21.5 7H6.4"/><circle cx="10" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/>',
  gear: '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
  play: '<path d="M7 4.5v15l12.5-7.5z"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="11" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
  check: '<path d="M4.5 12.5l5 5 10-11"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  back: '<path d="M15 4.5 7.5 12l7.5 7.5"/>',
  next: '<path d="M9 4.5 16.5 12 9 19.5"/>',
  sound: '<path d="M11 5 6 9H2.5v6H6l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
  mute: '<path d="M11 5 6 9H2.5v6H6l5 4zM22 9l-6 6M16 9l6 6"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  vibrate: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M3 8v8M21 8v8"/>',
  share: '<circle cx="18" cy="5" r="2.8"/><circle cx="6" cy="12" r="2.8"/><circle cx="18" cy="19" r="2.8"/><path d="M8.5 13.5l7 4M15.5 6.5l-7 4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16.5v-5M12 7.8v.1"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M16 3v4M8 3v4M3.5 10h17"/>',
  flag: '<path d="M4.5 21.5v-18M4.5 4h12l-2.5 4 2.5 4h-12"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  swords: '<path d="M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M9.5 6.5 14 2h3v3l-4.5 4.5M5 14l-2 2 2 2M8 19l-2 2"/>',
  bars: '<path d="M5 21V12M12 21V4M19 21v-6"/>',
  fire: '<path d="M12 22c4 0 7-2.8 7-7 0-5-5-6-4.5-12C10 5 8.5 9 9 12c-1.3-.7-2-2-2-3.5C5.5 10 5 12 5 15c0 4.2 3 7 7 7z"/>',
  sparkle: '<path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z"/>',
  refresh: '<path d="M20.5 4v5.5H15"/><path d="M19.6 14a8 8 0 1 1-1.8-8.3l2.7 3.8"/>',
  wifi: '<path d="M2 8.5a15 15 0 0 1 20 0M5.5 12.5a10 10 0 0 1 13 0M9 16.5a5 5 0 0 1 6 0"/><circle cx="12" cy="20" r="1"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.3 3 14.7 0 18M12 3c-3 3.3-3 14.7 0 18"/>',
  vault: '<rect x="3" y="3.5" width="18" height="17" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M12 8v1.5M12 14.5V16M8 12h1.5M14.5 12H16M3 20.5v1.5M21 20.5v1.5"/>',
  army: '<circle cx="12" cy="7" r="3.5"/><path d="M5 21v-3a7 7 0 0 1 14 0v3M2.5 11.5h3M18.5 11.5h3"/>',
  ad: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M7 15l2.5-6 2.5 6M7.8 13h3.4M14.5 9v6h1.5a3 3 0 0 0 0-6z"/>',
  ticket: '<path d="M3 7.5V5h18v2.5a2.5 2.5 0 0 0 0 5V15H3v-2.5a2.5 2.5 0 0 0 0-5z"/><path d="M9 5v10" stroke-dasharray="2 2"/><path d="M3 19h18"/>',
  map: '<path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z"/><path d="M9 4v13.5M15 6.5V20"/>',
  snow: '<path d="M12 2v20M4.2 6.5l15.6 9M4.2 17.5l15.6-9M9.5 3.5 12 6l2.5-2.5M9.5 20.5 12 18l2.5 2.5"/>',
  paste: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2.5h6V4M9 10h6M9 14h6"/>',
  users: '<circle cx="8.5" cy="8" r="3.5"/><circle cx="16.5" cy="9" r="2.8"/><path d="M2 20c.6-4 3.3-6 6.5-6s5.9 2 6.5 6M14.5 14.5c3.2-.5 6.3 1.3 7.5 5"/>',
  dice: '<rect x="3.5" y="3.5" width="17" height="17" rx="3.5"/><circle cx="8.5" cy="8.5" r="1.3"/><circle cx="15.5" cy="15.5" r="1.3"/><circle cx="15.5" cy="8.5" r="1.3"/><circle cx="8.5" cy="15.5" r="1.3"/><circle cx="12" cy="12" r="1.3"/>',
  palette: '<path d="M12 2.5a9.5 9.5 0 0 0 0 19c1.5 0 2-1 1.6-2.2-.5-1.4.3-2.8 1.9-2.8H18a3.5 3.5 0 0 0 3.5-3.5C21.5 7 17.2 2.5 12 2.5z"/><circle cx="7.5" cy="11" r="1.3"/><circle cx="10" cy="7" r="1.3"/><circle cx="15" cy="7" r="1.3"/>',
  hint: '<path d="M12 2.5a6.5 6.5 0 0 0-4 11.6c.6.5 1 1.3 1 2.1V16h6v-.8c0-.8.4-1.6 1-2.1A6.5 6.5 0 0 0 12 2.5zM9 18h6M10 21.5h4"/>'
};

ART.ic = (name, cls = '', sw = 2) =>
  `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || P.circle}</svg>`;

/* Filled tile icon (white on tile) */
ART.tileIc = name => `<svg class="ti" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${P[name] || P.circle}</svg>`;

/* Currency icons — coin: purple crystal coin with an S. gem: violet-blue diamond. */
/* real gold coin (approved exception to the purple-only rule) */
ART.coin = (s = 18) => `<svg class="cy" width="${s}" height="${s}" viewBox="0 0 64 64"><ellipse cx="32" cy="35" rx="29" ry="28" fill="#7a4100"/><circle cx="32" cy="31" r="29" fill="url(#gcB)"/><circle cx="32" cy="31" r="24" fill="url(#gcA)"/><circle cx="32" cy="31" r="24" fill="none" stroke="url(#gcC)" stroke-width="2.5"/><circle cx="32" cy="31" r="19.5" fill="none" stroke="#c98200" stroke-width="1" stroke-dasharray="2 2.4" opacity=".7"/><path d="M38.5 22.5c-1.8-1.6-4.2-2.4-6.8-2.4-4.4 0-7.6 2.3-7.6 5.9 0 3.4 2.6 4.8 6.8 5.8 3.2.8 4.2 1.5 4.2 3 0 1.6-1.6 2.6-3.8 2.6-2.4 0-4.4-.9-6-2.5l-2.6 3.2c2 2 5.2 3.2 8.4 3.2 4.8 0 8.2-2.4 8.2-6.3 0-3.5-2.4-5-6.8-6-3.1-.7-4.2-1.3-4.2-2.7 0-1.3 1.3-2.2 3.3-2.2 1.9 0 3.6.6 5 1.8z" fill="#9a5a00" transform="translate(0 1.2)" opacity=".55"/><path d="M38.5 22.5c-1.8-1.6-4.2-2.4-6.8-2.4-4.4 0-7.6 2.3-7.6 5.9 0 3.4 2.6 4.8 6.8 5.8 3.2.8 4.2 1.5 4.2 3 0 1.6-1.6 2.6-3.8 2.6-2.4 0-4.4-.9-6-2.5l-2.6 3.2c2 2 5.2 3.2 8.4 3.2 4.8 0 8.2-2.4 8.2-6.3 0-3.5-2.4-5-6.8-6-3.1-.7-4.2-1.3-4.2-2.7 0-1.3 1.3-2.2 3.3-2.2 1.9 0 3.6.6 5 1.8z" fill="#fff3b8"/><ellipse cx="22" cy="17" rx="9" ry="4.5" fill="#fff" opacity=".55" transform="rotate(-30 22 17)"/></svg>`;
/* shared gradient defs for the gold coin (inserted once into the page) */
ART.defs = () => `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><radialGradient id="gcA" cx="35%" cy="28%" r="75%"><stop offset="0" stop-color="#fff8d2"/><stop offset=".35" stop-color="#ffd84a"/><stop offset=".8" stop-color="#e59a00"/><stop offset="1" stop-color="#b86a00"/></radialGradient><linearGradient id="gcB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe98a"/><stop offset=".5" stop-color="#d48a00"/><stop offset="1" stop-color="#8a4b00"/></linearGradient><linearGradient id="gcC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a5a00"/><stop offset="1" stop-color="#ffdf6b"/></linearGradient></defs></svg>`;
ART.gem = (s = 18) => `<svg class="cy" width="${s}" height="${s}" viewBox="0 0 32 32"><path d="M8 5h16l6 8-14 15L2 13z" fill="#6d5dfc"/><path d="M2 13h28L16 28z" fill="#4f46e5"/><path d="M8 5l4 8 4-8 4 8 4-8" fill="none" stroke="#c7d2fe" stroke-width="1.4"/><path d="M12 13l4 15 4-15" fill="none" stroke="#a5b4fc" stroke-width="1.2"/><path d="M9.5 7.5l1.5 3" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>`;
ART.shieldC = (s = 18) => `<svg class="cy" width="${s}" height="${s}" viewBox="0 0 32 32"><path d="M16 29s11-5.4 11-13.8V7.2L16 3.5 5 7.2v8C5 23.6 16 29 16 29z" fill="#743ae8"/><path d="M16 25s7.5-3.9 7.5-10V9.6L16 7l-7.5 2.6V15c0 6.1 7.5 10 7.5 10z" fill="#9a6df5"/><path d="M12 15.5l3 3 5.5-6" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
ART.heartC = (s = 18, on = true) => `<svg class="cy" width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M20.4 5a5.3 5.3 0 0 0-7.6 0L12 5.9 11.2 5a5.3 5.3 0 0 0-7.6 7.5L12 21l8.4-8.5A5.3 5.3 0 0 0 20.4 5z" fill="${on ? '#ff3d7f' : 'rgba(255,255,255,.12)'}" stroke="${on ? '#ff8db5' : 'rgba(255,255,255,.25)'}" stroke-width="1.5"/>${on ? '<path d="M7 7.5c-1 .4-1.6 1.2-1.7 2.2" stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".8"/>' : ''}</svg>`;

/* ---------- SANX character (upper body). mood: smug | angry | shock | laugh | sad ---------- */
ART.sanx = (mood = 'smug', cls = '') => {
  const brows = {
    smug:  '<path d="M60 70 Q78 62 92 70" /><path d="M108 66 Q124 58 140 66"/>',
    angry: '<path d="M58 62 L92 74" /><path d="M142 62 L108 74"/>',
    shock: '<path d="M60 60 Q76 50 92 60" /><path d="M108 60 Q124 50 140 60"/>',
    laugh: '<path d="M60 66 Q76 58 92 66" /><path d="M108 66 Q124 58 140 66"/>',
    sad:   '<path d="M60 64 Q76 70 92 62" /><path d="M108 62 Q124 70 140 64"/>'
  }[mood];
  const eyes = {
    smug:  '<path d="M64 84 Q76 78 88 84 Q76 90 64 84z" fill="#fff"/><path d="M112 84 Q124 78 136 84 Q124 90 112 84z" fill="#fff"/><circle cx="79" cy="84" r="3.4" fill="#2b0e6b"/><circle cx="127" cy="84" r="3.4" fill="#2b0e6b"/>',
    angry: '<path d="M64 82 L90 88 Q76 94 64 86z" fill="#fff"/><path d="M136 82 L110 88 Q124 94 136 86z" fill="#fff"/><circle cx="80" cy="88" r="3" fill="#2b0e6b"/><circle cx="120" cy="88" r="3" fill="#2b0e6b"/>',
    shock: '<ellipse cx="77" cy="84" rx="11" ry="10" fill="#fff"/><ellipse cx="123" cy="84" rx="11" ry="10" fill="#fff"/><circle cx="77" cy="84" r="3.2" fill="#2b0e6b"/><circle cx="123" cy="84" r="3.2" fill="#2b0e6b"/>',
    laugh: '<path d="M64 86 Q76 76 88 86" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M112 86 Q124 76 136 86" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>',
    sad:   '<path d="M64 84 Q76 92 88 84 Q76 80 64 84z" fill="#fff"/><path d="M112 84 Q124 92 136 84 Q124 80 112 84z" fill="#fff"/><circle cx="76" cy="86" r="3" fill="#2b0e6b"/><circle cx="124" cy="86" r="3" fill="#2b0e6b"/>'
  }[mood];
  const mouth = {
    smug:  '<path d="M86 122 Q104 132 120 118" stroke="#3b1580" stroke-width="4" fill="none" stroke-linecap="round"/>',
    angry: '<path d="M84 126 Q100 116 116 126" stroke="#3b1580" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M90 124h20" stroke="#fff" stroke-width="3"/>',
    shock: '<ellipse cx="100" cy="124" rx="9" ry="11" fill="#3b1580"/><ellipse cx="100" cy="128" rx="6" ry="4" fill="#ff6b9a"/>',
    laugh: '<path d="M80 116 Q100 144 120 116z" fill="#3b1580"/><path d="M84 117h32" stroke="#fff" stroke-width="4"/><path d="M90 132 Q100 138 110 132" fill="#ff6b9a"/>',
    sad:   '<path d="M86 128 Q100 118 114 128" stroke="#3b1580" stroke-width="4" fill="none" stroke-linecap="round"/>'
  }[mood];
  return `<svg class="sanx ${cls}" viewBox="0 0 200 230" aria-label="Sanx">
  <defs>
    <linearGradient id="sxSuit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a6df5"/><stop offset="1" stop-color="#5b21b6"/></linearGradient>
    <linearGradient id="sxHair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b1580"/><stop offset="1" stop-color="#1c0a4f"/></linearGradient>
    <linearGradient id="sxCape" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#743ae8"/><stop offset="1" stop-color="#3b1580"/></linearGradient>
  </defs>
  <path d="M30 230 C26 180 40 156 64 150 L136 150 C160 156 174 180 170 230z" fill="url(#sxCape)"/>
  <path d="M46 230 C46 190 62 168 100 166 C138 168 154 190 154 230z" fill="url(#sxSuit)" stroke="#2b0e6b" stroke-width="4"/>
  <path d="M86 166 L100 186 L114 166" fill="#c4a7ff" stroke="#2b0e6b" stroke-width="3"/>
  <path d="M100 196 l9 9 -9 11 -9 -11z" fill="#fff" stroke="#2b0e6b" stroke-width="3"/>
  <path d="M100 200 l5 5 -5 6 -5 -6z" fill="#743ae8"/>
  <rect x="86" y="140" width="28" height="28" rx="8" fill="#f2c6a0" stroke="#2b0e6b" stroke-width="4"/>
  <ellipse cx="100" cy="96" rx="52" ry="54" fill="#f6cfaa" stroke="#2b0e6b" stroke-width="4"/>
  <ellipse cx="48" cy="100" rx="8" ry="11" fill="#f2c6a0" stroke="#2b0e6b" stroke-width="4"/>
  <ellipse cx="152" cy="100" rx="8" ry="11" fill="#f2c6a0" stroke="#2b0e6b" stroke-width="4"/>
  <path d="M44 92 C40 62 50 44 64 36 L54 12 L80 24 L86 0 L106 20 L124 -2 L128 24 L154 12 L148 40 C162 54 164 76 156 94 C148 76 136 66 122 62 L126 74 C112 64 96 62 82 66 L88 76 C72 70 58 78 50 88 Z" fill="url(#sxHair)" stroke="#120634" stroke-width="4" stroke-linejoin="round"/>
  <path d="M74 30 L84 16 M104 24 L112 10 M130 30 L142 20" stroke="#9a6df5" stroke-width="3" stroke-linecap="round" opacity=".75"/>
  <path d="M54 82 C60 70 80 68 100 78 C120 68 140 70 146 82 C146 98 136 106 122 104 C112 103 106 98 100 92 C94 98 88 103 78 104 C64 106 54 98 54 82z" fill="#1c0a4f" stroke="#120634" stroke-width="3"/>
  ${eyes}
  <g stroke="#120634" stroke-width="6" fill="none" stroke-linecap="round">${brows}</g>
  ${mouth}
  ${mood === 'laugh' ? '<path d="M150 72 q6 -6 12 0" stroke="#9a6df5" stroke-width="3" fill="none"/><path d="M44 72 q-6 -6 -12 0" stroke="#9a6df5" stroke-width="3" fill="none"/>' : ''}
  ${mood === 'shock' ? '<path d="M160 50 l8 -10 M168 62 l12 -4 M40 50 l-8 -10" stroke="#9a6df5" stroke-width="4" stroke-linecap="round"/>' : ''}
</svg>`;
};

/* ---------- App icon / logo mark (concept B, game feel) ---------- */
/* ---------- App icon (approved concept B: attitude mask + starburst) ----------
   anim=true adds motion for splash / welcome: spinning burst, blinking eyes,
   flickering bolt, popping tiles. */
ART.icon = (s = 120, anim = false) => `<svg class="appIcon ${anim ? 'anim' : ''}" width="${s}" height="${s}" viewBox="0 0 180 180">
  ${anim ? `<style>
    .appIcon.anim .burst{transform-origin:90px 92px;animation:icSpin 9s linear infinite}
    .appIcon.anim .face{transform-origin:90px 92px;animation:icBob 2.4s ease-in-out infinite}
    .appIcon.anim .eye{transform-box:fill-box;transform-origin:center;animation:icBlink 3.2s infinite}
    .appIcon.anim .bolt{animation:icBolt 1.6s infinite}
    .appIcon.anim .t1{transform-box:fill-box;transform-origin:center;animation:icPop 1.8s infinite}
    .appIcon.anim .t2{transform-box:fill-box;transform-origin:center;animation:icPop 1.8s .45s infinite}
    .appIcon.anim .brow{transform-box:fill-box;transform-origin:center;animation:icBrow 3.2s infinite}
    @keyframes icSpin{to{transform:rotate(360deg)}}
    @keyframes icBob{50%{transform:translateY(-3px) scale(1.03)}}
    @keyframes icBlink{0%,44%,52%,100%{transform:scaleY(1)}48%{transform:scaleY(.1)}}
    @keyframes icBolt{0%,60%,100%{opacity:1}66%{opacity:.2}72%{opacity:1}78%{opacity:.3}}
    @keyframes icPop{0%,70%,100%{transform:scale(1)}80%{transform:scale(1.35)}}
    @keyframes icBrow{0%,40%,100%{transform:translateY(0)}46%{transform:translateY(-3px)}}
  </style>` : ''}
  <rect width="180" height="180" rx="40" fill="#1a0b3d"/>
  <polygon class="burst" points="90,14 104,52 146,40 122,74 164,92 122,106 144,146 104,128 90,168 76,128 36,146 58,106 16,92 58,74 34,40 76,52" fill="#743ae8"/>
  <g class="face">
    <circle cx="90" cy="92" r="52" fill="#9a6df5"/>
    <path d="M34 86 Q56 60 90 76 Q124 60 146 86 Q142 120 112 120 Q96 120 90 106 Q84 120 68 120 Q38 120 34 86 Z" fill="#1a0b3d" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
    <path class="brow" d="M50 80 L76 88" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
    <path class="brow" d="M130 80 L104 88" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
    <g class="eye"><ellipse cx="66" cy="98" rx="12" ry="8" fill="#fff"/><circle cx="69" cy="99" r="4" fill="#743ae8"/></g>
    <g class="eye"><ellipse cx="114" cy="98" rx="12" ry="8" fill="#fff"/><circle cx="111" cy="99" r="4" fill="#743ae8"/></g>
    <path d="M76 130 Q90 140 104 130" stroke="#1a0b3d" stroke-width="5" fill="none" stroke-linecap="round"/>
  </g>
  <path class="bolt" d="M150 22 L140 40 H148 L144 54 L158 34 H150 Z" fill="#fff"/>
  <rect class="t1" x="18" y="140" width="18" height="18" rx="5" fill="#fff"/>
  <rect class="t2" x="24" y="118" width="11" height="11" rx="3" fill="#c4a7ff"/>
</svg>`;

/* avatar with the equipped frame (shop: Frames) */
ART.avatar = (frame, mood = 'smug', cls = '') => `<span class="avF fr-${frame || 'none'} ${cls}"><span class="avIn">${ART.sanx(mood, 'av')}</span>${frame === 'king' ? `<em class="avCrown">${P.crown ? `<svg viewBox="0 0 24 24"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" fill="#ffd700" stroke="#7a4b00" stroke-width="1.2"/></svg>` : ''}</em>` : ''}</span>`;

/* v1.4 the player's own avatar (picked in Profile); falls back to the Sanx face */
ART.me = (frame, cls = '') => { const a = typeof S !== 'undefined' && S.st && S.st.avatar && D.AV[S.st.avatar]; return a ? `<span class="avF fr-${frame || 'none'} ${cls}"><span class="avIn"><img class="avImg" src="img/av/${a.id}.webp" alt=""></span></span>` : ART.avatar(frame, 'smug', cls); };
ART.logo = () => `<div class="logo"><span class="lgBeat">BEAT</span><span class="lgSanx">SANX</span></div>`;
/* self-contained gold coin (for canvas / share images, where page defs are not available) */
ART.coinFull = (s = 64) => ART.coin(s).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/(<svg[^>]*>)/, '$1' + ART.defs().replace(/^<svg[^>]*>|<\/svg>$/g, ''));

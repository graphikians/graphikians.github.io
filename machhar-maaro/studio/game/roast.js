/* ================= MACHHAR MAARO — "KALLU KA DIALOGUE" (haar ka filmy poster) =================
   Haarne pe 2 sec: Kallu Bhai ka bada filmy poster + dhamakedaar dialogue (shabd ek-ek karke thappa)
   Phir poster dheere se 6% opacity + blur hoke peeche chala jaata hai, aur "Phir se khelo" screen upar aati hai.
   Tap = skip.
=============================================================================================== */
const ROAST_LINES = [
  ['EK MACHHAR…', 'AADMI KI NEEND', 'UDA DETA HAI!'],
  ['{C} JAAG GAYE…', 'AB TU', 'BHAAG! 😏'],
  ['RAAT MERI…', 'KAAN MERA…', 'JEET BHI MERI!'],
  ['TERA RACKET…', 'MERE AAGE', 'FAIL HAI BHAI!'],
  ['BHIN-BHIN KARUNGA…', 'KHOON PIYUNGA…', 'AUR MAZE LUNGA! 😈']
];
const KALLU_SVG = `<svg viewBox="0 0 400 420" xmlns="http://www.w3.org/2000/svg">
<defs>
 <radialGradient id="kb" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#5b3aa8"/><stop offset=".55" stop-color="#2a1660"/><stop offset="1" stop-color="#0d0624"/></radialGradient>
 <radialGradient id="kh" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#6c48c4"/><stop offset="1" stop-color="#140a33"/></radialGradient>
 <linearGradient id="kw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#9a6df5" stop-opacity=".25"/></linearGradient>
 <linearGradient id="gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a2a6a"/><stop offset=".45" stop-color="#05030c"/><stop offset="1" stop-color="#05030c"/></linearGradient>
</defs>
<g class="kWingL"><path d="M170 150 C 70 40, 10 70, 20 120 C 30 170, 120 175, 170 160Z" fill="url(#kw)" stroke="#fff" stroke-width="3"/><path d="M168 152 C 110 110, 60 100, 30 118" stroke="#fff" stroke-opacity=".6" stroke-width="2" fill="none"/></g>
<g class="kWingR"><path d="M230 150 C 330 40, 390 70, 380 120 C 370 170, 280 175, 230 160Z" fill="url(#kw)" stroke="#fff" stroke-width="3"/><path d="M232 152 C 290 110, 340 100, 370 118" stroke="#fff" stroke-opacity=".6" stroke-width="2" fill="none"/></g>
<g stroke="#0d0624" stroke-width="7" stroke-linecap="round" fill="none">
 <path d="M175 250 L120 300 L95 380"/><path d="M190 262 L165 330 L150 405"/><path d="M225 250 L280 300 L305 380"/><path d="M210 262 L235 330 L250 405"/>
 <path class="kPoint" d="M180 215 L120 200 L60 230" stroke-width="9"/>
 <path d="M220 215 L285 185 L330 140" stroke-width="9"/>
</g>
<circle class="kPoint" cx="56" cy="232" r="9" fill="#0d0624"/>
<ellipse cx="200" cy="300" rx="44" ry="92" fill="url(#kb)" stroke="#fff" stroke-width="4" transform="rotate(4 200 300)"/>
<g stroke="#9a6df5" stroke-width="5" stroke-opacity=".7" fill="none"><path d="M162 270 Q200 282 240 272"/><path d="M160 305 Q200 318 242 306"/><path d="M166 340 Q200 352 236 342"/></g>
<ellipse cx="200" cy="215" rx="52" ry="40" fill="url(#kb)" stroke="#fff" stroke-width="4"/>
<g fill="#fff">${[0, 1, 2, 3, 4, 5, 6].map(i => `<circle cx="${160 + i * 13}" cy="${246 + Math.sin(i * 0.9) * 4}" r="5"/>`).join('')}</g>
<circle cx="200" cy="150" r="58" fill="url(#kh)" stroke="#fff" stroke-width="4"/>
<path d="M200 190 L200 240" stroke="#0d0624" stroke-width="0"/>
<path d="M196 196 L190 300" stroke="#0d0624" stroke-width="7" stroke-linecap="round"/>
<path d="M150 128 Q200 108 250 128 L248 156 Q225 168 204 152 L196 152 Q175 168 152 156Z" fill="url(#gl)" stroke="#fff" stroke-width="3"/>
<path d="M162 132 L178 132" stroke="#7fd4ff" stroke-width="5" stroke-linecap="round"/><path d="M215 132 L231 132" stroke="#7fd4ff" stroke-width="5" stroke-linecap="round"/>
<path d="M140 118 L176 124 M260 118 L224 124" stroke="#0d0624" stroke-width="8" stroke-linecap="round"/>
<path d="M200 176 C 182 172, 160 182, 150 168 C 158 192, 186 190, 200 182 C 214 190, 242 192, 250 168 C 240 182, 218 172, 200 176Z" fill="#05030c" stroke="#fff" stroke-width="2.5"/>
<path d="M186 196 Q200 204 214 196" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M172 98 Q160 60 140 50 M228 98 Q240 60 262 50" stroke="#0d0624" stroke-width="6" fill="none" stroke-linecap="round"/>
<circle cx="140" cy="50" r="7" fill="#9a6df5" stroke="#fff" stroke-width="2"/><circle cx="262" cy="50" r="7" fill="#9a6df5" stroke="#fff" stroke-width="2"/>
</svg>`;

const ROAST = {
  n: 0,
  play(after) {
    let el = $('roast'); if (el) el.remove();
    el = document.createElement('div'); el.id = 'roast';
    const ln = (this.n++ === 0 || Math.random() < 0.4 ? ROAST_LINES[0] : ROAST_LINES[1 + ((Math.random() * (ROAST_LINES.length - 1)) | 0)]).map(s => s.replace('{C}', (CHARS[CW.cid] && !CHARS[CW.cid].secret ? CHARS[CW.cid].n : 'PAPA').toUpperCase()));
    el.innerHTML = `<div class="rBg"></div><div class="rRays"></div><div class="rDots"></div>
      <div class="rStreak s1"></div><div class="rStreak s2"></div><div class="rStreak s3"></div>
      <div class="rKallu">${KALLU_SVG}</div>
      <div class="rName">😈 KALLU BHAI</div>
      <div class="rTxt"><span class="w w1">${ln[0]}</span><span class="w w2">${ln[1]}</span><span class="w w3">${ln[2]}</span></div>
      <div class="rFlash"></div><div class="rSkip">tap = skip</div>`;
    document.body.insertBefore(el, $('over'));
    requestAnimationFrame(() => el.classList.add('go'));
    // filmy sound design
    try { noise(0.5, 0.45, 'lowpass', 1800, 0.003); tone(110, 32, 0.7, 0.55, 'sawtooth'); tone(70, 30, 0.9, 0.4); vib([60, 40, 120]); } catch (e) { }
    [380, 700, 1020].forEach((t, i) => setTimeout(() => { if (!el.isConnected || el.classList.contains('bg')) return; try { tone(150 - i * 20, 45, 0.25, 0.4); noise(0.12, 0.3, 'bandpass', 1100 - i * 200, 0.002, 1); vib(25 + i * 15); } catch (e) { } el.classList.remove('kick'); void el.offsetWidth; el.classList.add('kick'); }, t));
    setTimeout(() => { try { NASHA.say(ln.join(' '), ln.join(' ')); } catch (e) { } }, 420);
    let done = false;
    const toBg = () => { if (done) return; done = true; try { speechSynthesis.cancel(); } catch (e) { } el.classList.add('bg'); el.onpointerdown = null; after(); };
    const tm = setTimeout(toBg, 2100);
    el.onpointerdown = () => { clearTimeout(tm); toBg(); };
    META.x('Villain Taunt (Haar ko yaadgaar banao)');
  },
  clear() { const el = $('roast'); if (el) { el.classList.add('gone'); setTimeout(() => el.remove(), 400); } }
};

const _rOver = window.showOver;
window.showOver = function () {
  const a = arguments; if (CL && CL.ev) return _rOver.apply(this, a);
  ROAST.play(() => _rOver.apply(this, a));
};
// jaise hi player over screen chhode (retry / map / revive), poster hata do
['oAgain', 'oMap', 'oRevive'].forEach(id => { const b = $(id); if (b) b.addEventListener('click', () => ROAST.clear(), true); });
const _rStart = META.onStart; META.onStart = function () { _rStart.apply(this, arguments); ROAST.clear(); };
const _rMap = window.showMap; window.showMap = function () { ROAST.clear(); return _rMap.apply(this, arguments); };
const _rTick = META.tick; META.tick = function (dt, gdt) { _rTick.call(META, dt, gdt); const r = $('roast'); if (r && r.classList.contains('bg')) ROAST.clear(); };

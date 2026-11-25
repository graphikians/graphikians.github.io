/* ================= MACHHAR MAARO — WELCOME SCREEN (live) ================= */
const WELCOME = {
  bubs: ['Tonight is mine 😈', 'Catch me if you can! 😏', 'Bzz bzz bzz 🎵', 'Papa tastes sweet 🍬', 'I am not scared of rackets 😎'],
  fill() {
    const k = $('mKallu'); if (k && !k.querySelector('svg')) k.insertAdjacentHTML('afterbegin', KALLU_SVG);
    const s = SHARE.stats(), lv = Math.max(1, SAVE.unlocked || 1);
    $('menuBest').innerHTML = `<span>${s.av} ${s.name}</span><span>🗺️ Level ${lv}</span><span><span class="coin"></span>${fmt(SAVE.coins || 0)}</span><span>🦟 ${fmt(s.tk)}</span>`;
    const kk = NASHA.K(), r = NASHA.raat();
    $('mTick').textContent = r ? `🌙 LATE NIGHT LIVE · 2X COINS · ${NASHA.raatLeft()} left` : kk.meets ? `😈 Bounty on Kallu: 🪙 ${fmt(kk.bounty + kk.stolen)}` : '🌙 LATE NIGHT at 10 PM · 2X coins';
  }
};
WELCOME.fill();
setInterval(() => { const b = $('mBub'); if (b && state === 'menu') b.textContent = WELCOME.bubs[(Math.random() * WELCOME.bubs.length) | 0]; }, 3000);
$('mRec').onclick = () => { sfx.coin && sfx.coin(); SHARE.open(); };
$('mShop').onclick = () => { initAudio(); openShop('rackets', () => { hideAll(); state = 'menu'; $('menu').classList.remove('hide'); WELCOME.fill(); }); };

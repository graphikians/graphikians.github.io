/* ================= BEAT SANX — boot ================= */
'use strict';
window.BS_VERSION = '1.7';
(function boot() {
  if (window.BS_CREATOR) { S.st.seenTut = true; S.st.login.pending = false; ADS.inter = async () => false; ADS.rewarded = async () => true; ADS.banner = () => { }; document.body.classList.add('isCreator'); }
  if (window.BS_WEB) { D.DBEAT.practiceAds = 0; D.ADCAP.contAd = 0; D.ADCAP.replay = 0; S.st.seenTut = true; document.body.classList.add('isWeb'); }
  document.getElementById('spIcon').innerHTML = ART.icon(150, true);
  const away = S.st.lastSeen ? (Date.now() - S.st.lastSeen) / 864e5 : 0;
  S.rollover();
  S.st.lastSeen = Date.now(); S.save();
  setInterval(() => { S.st.lastSeen = Date.now(); S.save(); }, 60000);
  document.body.insertAdjacentHTML('afterbegin', ART.defs());
  G.build(); UI.init(); NET.init(); try { PERF.apply(); PERF.probe(); try { RATE.touch(); } catch (e) { } BG.init(); } catch (e) { }
  const go = () => {
    const sp = document.getElementById('splash'); sp.classList.add('out'); setTimeout(() => sp.remove(), 500);
    UI.show('home');
    const gq = new URLSearchParams(location.search).get('g');
    if (gq) { setTimeout(() => GR.join(gq), 400); return; }
    if (window.BS_WEB) return;
    if (!S.st.seenTut) setTimeout(() => UI.howto(true), 350);
    else if (away >= D.COMEBACK.days) UI.comeback(Math.floor(away));
    else UI.afterHome();
  };
  setTimeout(go, new URLSearchParams(location.search).has('fast') ? 50 : 1900);
  // new day while the app stays open
  setInterval(() => { const before = S.st.quests.day; S.rollover(); if (before !== S.st.quests.day && UI.cur === 'home') { UI.refresh(); UI.afterHome(); } }, 60000);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { SND.music(false); S.saveNow(); } else if (['home', 'events', 'shop', 'profile', 'event'].includes(UI.cur)) SND.music(true); });
})();

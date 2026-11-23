/* ================= BEAT SANX — ads layer =================
   Game code only talks to ADS. native.js plugs in real AdMob on Android.
   In the browser a short demo ad is shown instead (so testing works).
   Interstitial rules (player-friendly = better retention = more revenue):
   - never in the first 2 runs ever, never in the first 5 minutes of a new player's first day
   - at least 3 min between interstitials, never within 90 s after a rewarded ad
   - never before Daily Beat / inside duels
   - only at natural breaks (level clear after 4+ clears, or end of run)
   - never if the player bought "No Forced Ads" */
'use strict';
const ADS = (() => {
  const COOLDOWN = 180 * 1000, MIN_CLEARS = 3, GRACE_RUNS = 2, T0 = Date.now();
  const api = {
    native: false,
    _rewarded: null,   // set by native.js: async () => boolean
    _inter: null,      // set by native.js: async () => void
    _banner: null,     // set by native.js: (on) => void
    canInter(reason) {
      const st = S.st; if (st.noAds) return false;
      if (st.ads.runs < GRACE_RUNS) return false;
      if (Date.now() - (st.created || 0) < 864e5 && Date.now() - T0 < 5 * 60e3) return false;
      if (Date.now() - st.ads.lastInter < COOLDOWN) return false;
      if (Date.now() - (st.ads.lastReward || 0) < 90 * 1000) return false;
      if (reason === 'level' && st.ads.clears < MIN_CLEARS) return false;
      return true;
    },
    /* resolves only after the ad is CLOSED. returns true if an ad was shown */
    async inter(reason) {
      if (!api.canInter(reason)) return false;
      const st = S.st; st.ads.lastInter = Date.now(); st.ads.clears = 0; S.save();
      api.showing = true;
      try {
        if (api._inter) { SND.music(false); return !!(await api._inter()); }
        if (new URLSearchParams(location.search).has('adsdemo')) { await demo('Ad break', 3, false); return true; }
        return false;
      } catch (e) { return false; } finally { api.showing = false; }
    },
    async rewarded(slot) {
      let ok = false; api.showing = true;
      if (api._rewarded) { try { ok = await api._rewarded(slot); } catch (e) { ok = false; } }
      else ok = await demo('Reward ad (demo)', new URLSearchParams(location.search).has('fastads') ? 1 : 3, true);
      api.showing = false;
      if (ok) {   // count ads for the shop's ad track and ad-unlock skins
        const st = S.st, d = S.dayKey();
        st.adsTotal = (st.adsTotal || 0) + 1;
        if (!st.adDay || st.adDay.d !== d) st.adDay = { d, n: 0, got: [], offers: {} };
        st.adDay.n++; st.ads.lastReward = Date.now(); S.save();
        if ((typeof UI !== 'undefined')) setTimeout(() => UI.adProgress(), 300);
      }
      return ok;
    },
    banner(on) { if (api._banner) { try { api._banner(on && !S.st.noAds); } catch (e) { } } }
  };
  function demo(title, secs, reward) {
    return new Promise(res => {
      const o = document.createElement('div'); o.className = 'adDemo';
      o.innerHTML = `<div class="adBox"><div class="adK">${ART.ic('ad')} ${title}</div><div class="adMark">${ART.icon(84)}</div><div class="adT">Beat Sanx</div><div class="adS">Real ads play inside the Android app</div><div class="adC" id="adC">${secs}</div></div>`;
      document.body.appendChild(o);
      let n = secs; const iv = setInterval(() => { n--; const c = o.querySelector('#adC'); if (c) c.textContent = n; if (n <= 0) { clearInterval(iv); o.remove(); res(reward); } }, 1000);
    });
  }
  return api;
})();

/* ================= BEAT SANX — internet required =================
   Ads are the only earning, so the game needs internet.
   - Checks on start, every 15s, and on online/offline events.
   - No internet: full screen "Connect to play" (never mid-run: a running
     run continues, the screen appears when it ends).
   - Active in the Android app, or in the browser with ?netgate. */
'use strict';
const NET = (() => {
  const native = !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform());
  const q = new URLSearchParams(location.search);
  const active = native || q.has('netgate');
  let ok = true, checking = false, ov = null;
  const PING = ['https://clients3.google.com/generate_204', 'https://www.gstatic.com/generate_204'];
  async function probe() {
    if (q.has('forceoff')) return false;
    if (navigator.onLine === false) return false;
    for (const u of PING) {
      try {
        const c = new AbortController(); const t = setTimeout(() => c.abort(), 4500);
        await fetch(u + '?t=' + Date.now(), { mode: 'no-cors', cache: 'no-store', signal: c.signal });
        clearTimeout(t); return true;
      } catch (e) { }
    }
    return false;
  }
  async function check() { if (!active) return true; if (checking) return ok; checking = true; try { ok = await probe(); } finally { checking = false; } sync(); return ok; }
  function sync() {
    if (!ov) return;
    const playing = (typeof G !== 'undefined') && G.run && !G.run.ended;
    const show = !ok && !playing;
    if (show && !ov.classList.contains('on')) { ov.classList.add('on'); try { SND.music(false); } catch (e) { } }
    else if (!show && ov.classList.contains('on')) { ov.classList.remove('on'); try { UI.toast('Back online. Let\'s go!', 'wifi'); } catch (e) { } }
  }
  function init() {
    if (!active) return;
    ov = document.createElement('div'); ov.id = 'netGate';
    ov.innerHTML = `<div class="nBox">
      <div class="nIco">${ART.ic('wifi')}</div>
      <div class="nK">NO INTERNET</div>
      <div class="nT">Connect to play</div>
      <div class="nS">Beat Sanx needs internet for daily rewards, events, free boosters and gifts.</div>
      <div class="nL"><span>Turn on mobile data</span><span>or</span><span>Connect to Wi-Fi</span></div>
      <button id="netRetry" class="btn big"><span>TRY AGAIN</span></button>
      <div class="nW">Waiting for connection<i>.</i><i>.</i><i>.</i></div>
      <div class="nP">Your progress is safe on this phone</div></div>`;
    document.body.appendChild(ov);
    const b = ov.querySelector('#netRetry');
    b.onclick = async () => { b.querySelector('span').textContent = 'CHECKING...'; await check(); setTimeout(() => { b.querySelector('span').textContent = 'TRY AGAIN'; if (!ok) { ov.classList.remove('shake'); void ov.offsetWidth; ov.classList.add('shake'); } }, 350); };
    window.addEventListener('offline', () => { ok = false; sync(); });
    window.addEventListener('online', () => check());
    document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
    setInterval(() => { if (!document.hidden) check(); }, 15000);
    setInterval(sync, 1000);
    check();
  }
  /* call before starting any run */
  function gate() { if (!active) return true; if (!ok || navigator.onLine === false) { ok = false; sync(); check(); return false; } return true; }
  return { init, check, gate, get ok() { return ok; } };
})();

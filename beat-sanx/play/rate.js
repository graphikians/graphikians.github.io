/* ================= BEAT SANX — rating popup + feedback (v1.8) =================
   Google Play In-App Review: Google's own star card, shown inside the game.
   Rules we follow (Google policy): only after a happy moment, never after a loss / ad / mid-game,
   no question before it, no reward for rating. Google also limits how often it really shows.
   Our own limit: player active on 3+ days, level 15+, at most once in 30 days. */
'use strict';
const RATE = (() => {
  const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.sanxgraphikians.beatsanx';
  const plug = () => { const C = window.Capacitor; if (!C || !C.isNativePlatform || !C.isNativePlatform()) return null; return (C.Plugins && C.Plugins.AppReview) || (C.registerPlugin ? C.registerPlugin('AppReview') : null); };
  const R = () => { const st = S.st; if (!st.rate) st.rate = { days: [], last: 0, n: 0 }; return st.rate; };
  function touch() { const r = R(), d = S.dayKey(); if (!r.days.includes(d)) { r.days.push(d); if (r.days.length > 10) r.days.splice(0, r.days.length - 10); S.save(); } }
  function ok() {
    const r = R();
    return r.days.length >= 3 && S.best() >= 15 && Date.now() - (r.last || 0) > 30 * 864e5 && !(typeof ADS !== 'undefined' && ADS.showing);
  }
  /* call on a happy result screen; shows a moment later if still on that calm screen */
  function maybe(why) {
    touch();
    if (!ok()) return;
    setTimeout(async () => {
      if (!ok() || UI.cur === 'game' || document.getElementById('modal').classList.contains('on')) return;
      const p = plug(); if (!p) return;
      const r = R(); r.last = Date.now(); r.n = (r.n || 0) + 1; r.why = why; S.save();
      try { await p.requestReview(); } catch (e) { }
    }, 1600);
  }
  /* Settings button: always opens the Play Store page (a button must not call the review card) */
  async function store() {
    const p = plug();
    try { if (p) { await p.openAppStore(); return; } } catch (e) { }
    window.open(PLAY_URL, '_blank');
  }
  /* Settings: send feedback (saved to Firebase so Sanx can read bugs and ideas) */
  let kind = 'bug';
  function feedback() {
    kind = 'bug';
    UI.modal(`<div class="mdK">Help us improve</div><div class="mdT">Send feedback</div>
      <div class="fbKinds">${[['bug', 'Bug'], ['idea', 'Idea'], ['other', 'Other']].map(([k, t]) => `<button class="${k === kind ? 'on' : ''}" data-act="fbKind:${k}">${t}</button>`).join('')}</div>
      <textarea id="fbText" maxlength="600" placeholder="What happened, or what would make Beat Sanx better?"></textarea>
      <button class="btn big" data-act="fbSend">${ART.ic('share')} SEND</button><button class="btn ghost" data-act="closeModal">Cancel</button>`, 'fbM');
  }
  async function send() {
    const t = document.getElementById('fbText'), text = t ? t.value.trim() : '';
    if (text.length < 4) { UI.toast('Write a few words first', 'info'); return; }
    if (!FB.on || !NET.ok) { UI.toast('No internet. Try again later.', 'wifi'); return; }
    try { await FB.feedback({ kind, text: text.slice(0, 600), lv: S.best(), ver: '1.8', ts: Date.now() }); UI.closeModal(); UI.toast('Thank you! Feedback sent.', 'check'); }
    catch (e) { UI.toast('Could not send. Try again.', 'wifi'); }
  }
  function act(a) {
    const [k, v] = a.split(':');
    if (k === 'fbKind') { kind = v; document.querySelectorAll('.fbKinds button').forEach(b => b.classList.toggle('on', b.dataset.act === a)); }
    else if (k === 'fbSend') send();
  }
  return { touch, maybe, store, feedback, act };
})();

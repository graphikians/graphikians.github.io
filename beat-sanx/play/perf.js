/* ================= BEAT SANX — smooth mode (v1.7) =================
   Auto Smooth Mode: for the first seconds after the app opens we watch how fast the phone
   draws frames. On a slow phone the game turns on Smooth mode by itself (lighter background,
   fewer moving decorations). The player can force it on or off in Settings. */
'use strict';
const PERF = (() => {
  const st = () => (typeof S !== 'undefined' && S.st) ? S.st : null;
  const smooth = () => { const s = st(); if (!s) return false; if (s.set.smooth === true || s.set.smooth === false) return s.set.smooth; return !!s.perfLow; };
  function apply() { document.body.classList.toggle('smooth', smooth()); if (typeof BG !== 'undefined' && BG.refresh) BG.refresh(); }
  /* measure ~4 s of frames once per app start (skipped while hidden) */
  function probe() {
    const s = st(); if (!s) return;
    let n = 0, slow = 0, last = 0, t0 = 0;
    const step = t => {
      if (document.hidden) { last = 0; return requestAnimationFrame(step); }
      if (!t0) t0 = t;
      if (last) { n++; if (t - last > 34) slow++; }
      last = t;
      if (t - t0 < 4000) return requestAnimationFrame(step);
      if (n < 20) return;
      const low = slow / n > 0.25;               // more than 1 in 4 frames dropped = slow phone
      s.perfLow = low ? true : (s.perfLow && slow / n > 0.12);   // only switch back when clearly smooth
      S.save(); apply();
    };
    setTimeout(() => requestAnimationFrame(step), 2500);
  }
  return { smooth, apply, probe };
})();

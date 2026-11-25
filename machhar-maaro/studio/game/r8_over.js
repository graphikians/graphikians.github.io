/* ================= MACHHAR MAARO · ROUND 8 · FAIL SCREEN =================
   Kallu's roast poster removed. Fail screen: MISSION FAILED stamp, the angry
   family member, three animated stat cards, a clear reason and a useful tip.
=========================================================================== */
try { ROAST.play = function (after) { after && after(); }; ROAST.clear = function () { const el = $('roast'); if (el) el.remove(); }; } catch (e) { }

R8.failWhy = function (kind, title) {
  const t = (title || '').toUpperCase(), id = (G.wakeS && G.wakeS.cid) || CW.cid, nm = CHARS[id] ? CHARS[id].n : 'They';
  if (kind === 'wake') {
    if (CL.boss) return { k: 'boss', why: `${nm} woke up before the boss went down`, tip: 'The boss gets stronger in the dark. Carry a Torch or an Inverter, and keep hitting.' };
    if (G._noiseFeed) return { k: 'noise', why: `${nm} woke up from the noise`, tip: 'Zapping right next to the ear is loud. Hit mosquitoes away from the face.' };
    return { k: 'bites', why: `${nm} got bitten too many times and woke up`, tip: 'Swat mosquitoes before they reach the bed. A Shield booster blocks every bite for a few seconds.' };
  }
  if (CL.task === 'nobite') return { k: 'nobite', why: `${nm} got bitten ${G.st.bites} times. The limit was ${CL.maxBites}`, tip: 'Guard the bed first, chase later. A Shield booster or a Mosquito Net from the shop keeps bites at zero.' };
  if (/JUGNU|FIREFL/.test(t)) return { k: 'jugnu', why: 'You hit 3 fireflies', tip: 'Fireflies are friends. Hit only the mosquitoes.' };
  if (/BATTERY/.test(t)) return { k: 'bat', why: 'The racket battery ran out', tip: 'Every miss drains the battery. Tap only when a mosquito is inside the racket.' };
  if (/ZAP/.test(t)) return { k: 'zap', why: 'You ran out of zaps', tip: 'Wait for mosquitoes to group up, then hit two at once.' };
  return { k: 'time', why: 'Time ran out before the mission was done', tip: 'Keep swiping without stopping. Rage Mode and Double Coins boosters speed you up.' };
};
(function () {
  const ov = $('over'), wrap = ov.querySelector('.ovv'); if (!wrap) return;
  const stage = wrap.querySelector('.ovStage');
  const stamp = document.createElement('div'); stamp.className = 'r8Stamp'; stamp.innerHTML = '<span>MISSION</span><b>FAILED</b>'; stage.appendChild(stamp);
  const box = document.createElement('div'); box.className = 'r8Fail'; box.innerHTML = '<div class="r8Why" id="r8Why"></div><div class="r8Cards" id="r8Cards"></div><div class="r8Tip2" id="r8Tip2"></div>';
  wrap.querySelector('.ovBar').before(box);
  const count = (el, to, suf) => { const t0 = performance.now(); const f = now => { const k = Math.min(1, (now - t0) / 700); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + (suf || ''); if (k < 1 && el.isConnected) requestAnimationFrame(f); }; requestAnimationFrame(f); };
  const _so = window.showOver;
  window.showOver = function (kind, title, msg) {
    const r = _so.apply(this, arguments);
    const tok = R7.ovTok;
    const go = () => {
      if (tok !== R7.ovTok) return; if (ov.classList.contains('hide')) return setTimeout(go, 90);
      const w = R8.failWhy(kind, title), p = progress(), pct = Math.round((CL.len ? clamp(G.t / CL.len, 0, 1) : p.max ? clamp(p.cur / p.max, 0, 1) : 0.5) * 100);
      const id = (G.wakeS && G.wakeS.cid) || CW.cid, src = R7.angryImg(id), ch = $('oChar');
      if (src && ch) { ch.src = src; ch.style.display = ''; ov.classList.remove('noChar'); }
      $('r8Why').textContent = w.why;
      const cards = [
        w.k === 'time' ? ['⏱️', 'TIME LEFT', 0, 's'] : ['🦟', 'BITES', G.st.bites || 0, CL.task === 'nobite' ? ' / ' + CL.maxBites : ''],
        ['🎯', 'MISSION', pct, '%'],
        ['⚡', 'KILLS', G.kills || 0, '']
      ];
      $('r8Cards').innerHTML = cards.map((c, i) => `<div class="r8Card ${i === 0 ? 'bad' : ''}" style="--d:${0.35 + i * 0.12}s"><i>${c[0]}</i><b data-v="${c[2]}" data-s="${c[3]}">0</b><small>${c[1]}</small></div>`).join('');
      setTimeout(() => $('r8Cards').querySelectorAll('b').forEach(b => count(b, +b.dataset.v, b.dataset.s)), 420);
      $('r8Tip2').innerHTML = `<span>💡</span><p>${w.tip}</p>${CL.yam || CL.ev ? '' : '<button id="r8TipB">BOOSTERS</button>'}`;
      const tb = $('r8TipB'); if (tb) tb.onclick = () => { sfx.coin(); const n = CL.n; openShop('boosters', () => showIntro(n)); };
      stamp.classList.remove('on'); void stamp.offsetWidth; stamp.classList.add('on');
      setTimeout(() => { try { tone(90, 40, 0.25, 0.5); noise(0.15, 0.35, 'lowpass', 900, 0.002); vib([50]); } catch (e) { } ov.classList.add('r8Shk'); setTimeout(() => ov.classList.remove('r8Shk'), 350); }, 520);
    };
    go();
    return r;
  };
})();
R7.css(`
.ovKallu{width:34%!important;right:0!important;top:auto!important;bottom:8%!important;opacity:.95}
.ovHa{font-size:13px!important}
.r8Stamp{position:absolute;left:73%;top:26%;z-index:4;transform:translate(-50%,-50%) rotate(-10deg) scale(3);opacity:0;padding:6px 18px 4px;border:4px solid #ff4f8b;border-radius:14px;color:#ff4f8b;text-align:center;background:rgba(20,6,40,.55);box-shadow:0 0 0 3px rgba(255,79,139,.25),0 10px 30px rgba(0,0,0,.5);pointer-events:none}
.r8Stamp span{display:block;font:800 11px 'Baloo 2';letter-spacing:5px;margin-bottom:-5px}.r8Stamp b{display:block;font:400 30px/1.1 'Lilita One';letter-spacing:2px}#over .ovHa{display:none}
.r8Stamp.on{animation:r8st .5s .35s cubic-bezier(.3,1.6,.5,1) forwards}
@keyframes r8st{0%{opacity:0;transform:translate(-50%,-50%) rotate(-10deg) scale(3)}70%{opacity:1;transform:translate(-50%,-50%) rotate(-10deg) scale(.92)}100%{opacity:1;transform:translate(-50%,-50%) rotate(-10deg) scale(1)}}
#over.r8Shk .ovv{animation:r8sh .35s}@keyframes r8sh{20%{transform:translateX(-8px)}40%{transform:translateX(7px)}60%{transform:translateX(-5px)}80%{transform:translateX(3px)}}
.r8Fail{width:100%;max-width:400px;margin:4px auto 0}
.r8Why{font:700 15px/1.3 'Baloo 2';color:#ffd0e0;text-align:center;padding:0 8px}
.r8Cards{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0 8px}
.r8Card{padding:10px 4px 8px;border-radius:16px;background:linear-gradient(180deg,rgba(154,109,245,.25),rgba(40,16,100,.5));border:1px solid rgba(154,109,245,.45);opacity:0;transform:translateY(14px);animation:r8cd .4s var(--d) forwards}
.r8Card.bad{border-color:rgba(255,79,139,.7);background:linear-gradient(180deg,rgba(255,79,139,.25),rgba(60,10,60,.5))}
.r8Card i{font-style:normal;font-size:18px;display:block}.r8Card b{display:block;font:400 26px/1.1 'Lilita One';color:#fff}.r8Card small{display:block;font:800 10px 'Baloo 2';letter-spacing:1.5px;color:#cbb8ff}
@keyframes r8cd{to{opacity:1;transform:none}}
.r8Tip2{display:flex;align-items:center;gap:8px;text-align:left;padding:9px 10px;border-radius:14px;background:rgba(127,212,255,.1);border:1px solid rgba(127,212,255,.35)}
.r8Tip2>span{font-size:20px}.r8Tip2 p{flex:1;margin:0;font:600 12.5px/1.35 'Baloo 2';color:#e6f6ff}
.r8Tip2 button{flex:none;border:0;border-radius:12px;padding:8px 10px;background:linear-gradient(180deg,#5fd0ff,#2f7bff);color:#fff;font:400 13px 'Lilita One';letter-spacing:.5px;box-shadow:0 3px 0 #163b9a}
#over .ovMsgW,#over .ovBar{display:none}
`);

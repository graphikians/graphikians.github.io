/* ================= BEAT SANX — Daily Beat groups (v1.4) =================
   Make a group for your family / office / friends WhatsApp group. Everybody plays the same
   Daily Beat; the group board shows today's ranking. Needs Firebase (free plan).
   Links: https://graphikians.github.io/beat-sanx/g/?g=CODE  (opens the app, or the web game) */
'use strict';
const GR = (() => {
  const LINK = 'https://graphikians.github.io/beat-sanx/g/?g=';
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const st = () => S.st;
  const list = () => (st().groups = st().groups || []);
  const esc = s => UI.esc(s);
  const newCode = () => { let c = ''; for (let i = 0; i < 6; i++) c += A[Math.floor(Math.random() * A.length)]; return c; };

  /* post today's official score to every group I am in + world stats */
  async function postScore(d) {
    if (!FB.on || !d || !d.done) return;
    try { if (!d.statSent) { await FB.dstatAdd(d.no, d.score); d.statSent = true; S.save(); } } catch (e) { }
    for (const g of list()) { try { await FB.groupScore(g.code, d.no, S.pid(), st().name, d.score); } catch (e) { } }
  }
  /* "Better than X% of players today" (only with real data) */
  async function percentile(no, score) {
    if (!FB.on) return null;
    try {
      const s = await FB.dstat(no); if (!s || !s.n || s.n < 20) return null;
      let below = 0; for (let k = 0; k < score; k++) below += s['c' + k] || 0;
      return { pct: Math.round(below / s.n * 100), n: s.n };
    } catch (e) { return null; }
  }

  function sheet() {
    const gs = list();
    const rows = gs.length ? gs.map(g => `<button class="grRow" data-act="grOpen:${g.code}">${ART.ic('users')}<span><b>${esc(g.name)}</b><small>Code ${g.code}</small></span>${ART.ic('next')}</button>`).join('') : `<div class="muted sm" style="margin:8px 0">No groups yet. Make one for your family or office WhatsApp group.</div>`;
    UI.sheet(`<div class="shT">Daily Beat groups</div><div class="shS">Same pattern for everyone. See who has the best memory in your group today.</div>
      ${FB.on ? '' : `<div class="grOff">${ART.ic('info')} Group boards go live with online mode. You can already create and share your group.</div>`}
      <div class="grList">${rows}</div>
      <div class="row2"><button class="btn" data-act="grNew">${ART.ic('plus')} New group</button><button class="btn alt" data-act="grJoin">${ART.ic('users')} Join with code</button></div>`, 'groups');
  }
  async function create() {
    const name = await askName('Group name', 'Family, Office, College gang…');
    if (!name) return;
    const g = { code: newCode(), name: name.slice(0, 24) };
    list().unshift(g); st().groups = list().slice(0, 6); S.save();
    if (FB.on) { try { await FB.putGroup(g.code, g.name, S.pid()); } catch (e) { } }
    invite(g);
    postScore(S.dbeatToday());
  }
  async function join(code, silent) {
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (code.length !== 6) { UI.toast('Group code has 6 letters', 'x'); return; }
    if (list().some(g => g.code === code)) { open(code); return; }
    let name = 'Group ' + code;
    if (FB.on) { try { const g = await FB.getGroup(code); if (g && g.name) name = g.name; } catch (e) { } }
    list().unshift({ code, name }); st().groups = list().slice(0, 6); S.save();
    if (!silent) UI.toast(`Joined ${name}`, 'check');
    postScore(S.dbeatToday());
    open(code);
  }
  function inviteText(g) { return `🧠 Join my Beat Sanx group "${g.name}"! Every day the same memory pattern for all of us. Who remembers the most?\nGroup code: ${g.code}\n${LINK}${g.code}`; }
  function invite(g) { SH.textShare(inviteText(g), ''); }
  async function open(code) {
    const g = list().find(x => x.code === code); if (!g) return;
    const d = S.dbeatToday();
    UI.modal(`<div class="mdK">${esc(g.name)} · Daily Beat #${d.no}</div><div class="mdT">Today's board</div><div class="grBoard" id="grBoard"><div class="muted sm">${FB.on ? 'Loading…' : 'Boards go live with online mode.'}</div></div>
      ${d.done ? '' : `<button class="btn big pulse" data-act="dbeat">${ART.ic('play')} PLAY TODAY'S BEAT</button>`}
      <button class="btn alt" data-act="grInvite:${g.code}">${ART.ic('share')} Invite to group</button><button class="btn ghost" data-act="closeModal">Close</button>`);
    if (!FB.on) return;
    try {
      const rows = await FB.groupBoard(g.code, d.no), el = document.getElementById('grBoard'); if (!el) return;
      el.innerHTML = rows.length ? rows.map((r, i) => `<div class="grB ${r.pid === S.pid() ? 'me' : ''}"><em>${i + 1}</em><b>${esc(r.name)}</b><span>${r.score} tiles</span></div>`).join('') : '<div class="muted sm">Nobody played today yet. Be the first!</div>';
    } catch (e) { const el = document.getElementById('grBoard'); if (el) el.innerHTML = '<div class="muted sm">Could not load. Check your internet.</div>'; }
  }
  function askName(title, ph) {
    return new Promise(res => {
      UI.modal(`<div class="mdK">${title}</div><input id="grIn" class="nameIn" maxlength="24" placeholder="${ph}"><button class="btn big" id="grOk">${ART.ic('check')} OK</button><button class="btn ghost" data-act="closeModal">Cancel</button>`);
      const i = document.getElementById('grIn'); setTimeout(() => i && i.focus(), 80);
      document.getElementById('grOk').onclick = () => { const v = (i.value || '').trim(); UI.closeModal(); res(v); };
    });
  }
  async function joinAsk() { const c = await askName('Group code', '6 letters, e.g. K7PX2M'); if (c) join(c); }
  function act(k, v) {
    if (k === 'grNew') create(); else if (k === 'grJoin') joinAsk(); else if (k === 'grOpen') open(v);
    else if (k === 'grInvite') { const g = list().find(x => x.code === v); if (g) invite(g); }
    else if (k === 'groups') sheet();
  }
  return { sheet, create, join, open, act, postScore, percentile, LINK };
})();

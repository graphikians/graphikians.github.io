/* ================= BEAT SANX — online duels (Firebase, free Spark plan) =================
   Plain REST calls (no SDK): anonymous sign-in + Firestore.
   Turns on only when firebase-config.js has a projectId + apiKey. Until then duels work by link.
   Collections:
     duels/{id}   challenge + result (challenger app settles automatically, no result code)
     runs/{auto}  finished duel runs, used as "random opponent" ghosts
     inbox/{auto} small bonus for a player whose run was used as a ghost and lost
   Free quota (Spark): 50,000 reads + 20,000 writes per day. One duel = about 3-4 writes. */
'use strict';
const FB = (() => {
  const C = window.BS_FIREBASE || {};
  const on = !!(C.projectId && C.apiKey);
  const DB = on ? `https://firestore.googleapis.com/v1/projects/${C.projectId}/databases/(default)/documents` : '';
  let tok = null;

  /* ---------- auth (anonymous) ---------- */
  async function auth() {
    if (!on) throw new Error('off');
    const s = S.st, a = s.fbAuth || {};
    if (a.id && a.exp > Date.now() + 6e4) return (tok = a.id);
    let r;
    if (a.refresh) r = await post(`https://securetoken.googleapis.com/v1/token?key=${C.apiKey}`, { grant_type: 'refresh_token', refresh_token: a.refresh }, true);
    if (!r || !r.id_token && !r.idToken) r = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${C.apiKey}`, { returnSecureToken: true }, true);
    s.fbAuth = { id: r.id_token || r.idToken, refresh: r.refresh_token || r.refreshToken, uid: r.user_id || r.localId, exp: Date.now() + (+(r.expires_in || r.expiresIn || 3600)) * 1000 };
    S.save(); return (tok = s.fbAuth.id);
  }
  /* v1.7: every document carries the Firebase uid of its owner, so the security rules can check ownership */
  const myUid = async () => { await auth(); return S.st.fbAuth.uid; };
  async function post(url, body, noAuth) {
    const h = { 'Content-Type': 'application/json' }; if (!noAuth) h.Authorization = 'Bearer ' + (await auth());
    const r = await fetch(url, { method: 'POST', headers: h, body: JSON.stringify(body) });
    if (!r.ok) throw new Error('fb ' + r.status); return r.json();
  }
  async function req(method, path, body) {
    const r = await fetch(DB + path, { method, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (await auth()) }, body: body ? JSON.stringify(body) : undefined });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error('fb ' + r.status); return r.status === 204 ? {} : r.json();
  }

  /* ---------- Firestore value encoding ---------- */
  const enc = o => ({ fields: Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined).map(([k, v]) => [k, typeof v === 'number' ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v }) : typeof v === 'boolean' ? { booleanValue: v } : { stringValue: String(v) }])) });
  const dec = d => { if (!d || !d.fields) return null; const o = { _id: d.name.split('/').pop() }; for (const [k, v] of Object.entries(d.fields)) o[k] = 'integerValue' in v ? +v.integerValue : 'doubleValue' in v ? v.doubleValue : 'booleanValue' in v ? v.booleanValue : v.stringValue; return o; };
  const mask = o => Object.keys(o).map(k => 'updateMask.fieldPaths=' + k).join('&');
  async function query(coll, filters, limit = 10, order) {
    const where = filters.length === 1 ? { fieldFilter: filters[0] } : { compositeFilter: { op: 'AND', filters: filters.map(f => ({ fieldFilter: f })) } };
    const q = { structuredQuery: { from: [{ collectionId: coll }], where, limit } };
    if (order) q.structuredQuery.orderBy = [{ field: { fieldPath: order }, direction: 'ASCENDING' }];
    const r = await req('POST', ':runQuery', q);
    return (r || []).map(x => dec(x.document)).filter(Boolean);
  }
  const F = (field, op, v) => ({ field: { fieldPath: field }, op, value: enc({ v }).fields.v });

  /* ---------- duels ---------- */
  async function putDuel(d) { return req('PATCH', `/duels/${d.id}`, enc({ ...d, cuid: await myUid() })); }
  async function getDuel(id) { return dec(await req('GET', `/duels/${id}`)); }
  async function finishDuel(id, r) { const o = { status: 'done', fid: r.fid, fname: r.fname, ftiles: r.tiles, ferr: r.err, fsecs: r.secs, fts: Date.now(), fuid: await myUid() }; return req('PATCH', `/duels/${id}?${mask(o)}`, enc(o)); }
  async function myOpen(pid) { return query('duels', [F('cid', 'EQUAL', pid)], 30); }
  async function invites(pid) { return (await query('duels', [F('toPid', 'EQUAL', pid), F('status', 'EQUAL', 'open')], 10)); }
  /* ---------- random opponent ---------- */
  async function saveRun(r) { return req('POST', '/runs', enc({ ...r, r: Math.random(), uid: await myUid() })); }
  /* single-field range query (no composite index needed); the duel uses the ghost run's mode */
  async function randomRun(myPid) {
    const x = Math.random();
    let a = await query('runs', [F('r', 'GREATER_THAN_OR_EQUAL', x)], 8, 'r');
    if (a.filter(z => z.pid !== myPid).length === 0) a = await query('runs', [F('r', 'LESS_THAN', x)], 8, 'r');
    return a.filter(z => z.pid !== myPid)[0] || null;
  }
  async function sendBonus(touid, coins, from) { return req('POST', '/inbox', enc({ touid, coins, from, fuid: await myUid(), ts: Date.now() })); }
  async function collectInbox(pid) {
    const a = await query('inbox', [F('touid', 'EQUAL', await myUid())], 20);
    let sum = 0; for (const m of a) { sum += m.coins || 0; try { await req('DELETE', `/inbox/${m._id}`); } catch (e) { } }
    return sum;
  }
  /* ---------- v1.4 Daily Beat: world stats (counter doc, 1 write + 1 read per player) ---------- */
  async function dstatAdd(no, score) {
    const doc = `projects/${C.projectId}/databases/(default)/documents/dstats/d${no}`;
    return post(`https://firestore.googleapis.com/v1/projects/${C.projectId}/databases/(default)/documents:commit`, { writes: [{ transform: { document: doc, fieldTransforms: [{ fieldPath: 'c' + Math.min(60, score), increment: { integerValue: '1' } }, { fieldPath: 'n', increment: { integerValue: '1' } }] } }] });
  }
  async function dstat(no) { return dec(await req('GET', `/dstats/d${no}`)); }
  /* ---------- v1.4 groups (family / office WhatsApp groups) ---------- */
  async function putGroup(code, name, by) { return req('PATCH', `/groups/${code}`, enc({ code, name, by, uid: await myUid(), ts: Date.now() })); }
  async function getGroup(code) { return dec(await req('GET', `/groups/${code}`)); }
  async function groupScore(code, no, pid, name, score, av) { const id = `${code}_${no}_${pid}`; return req('PATCH', `/gscores/${id}`, enc({ gn: `${code}_${no}`, pid, name, score, av: av || '', uid: await myUid(), ts: Date.now() })); }
  async function groupBoard(code, no) { return (await query('gscores', [F('gn', 'EQUAL', `${code}_${no}`)], 60)).sort((a, b) => b.score - a.score); }
  return { on, dstatAdd, dstat, putGroup, getGroup, groupScore, groupBoard, auth, putDuel, getDuel, finishDuel, myOpen, invites, saveRun, randomRun, sendBonus, collectInbox };
})();

/* ================= BEAT SANX — online duels (Firebase, free Spark plan) =================
   Plain REST calls (no SDK): anonymous sign-in + Firestore.
   Turns on only when firebase-config.js has a projectId + apiKey. Until then duels work by link.
   Collections:
     duels/{id}          Challenge a Friend: the open challenge (24h, any number of players)
     plays/{duel_player} one result per player per challenge (the creator's app settles from these)
     presence/{uid}      who is online now (Challenge the World matching by level)
     wduels/{id}         Challenge the World: 1 vs 1 live invite + both results
     feedback/{auto}     Send feedback from Settings
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

  /* ---------- v1.8 Challenge a Friend: one open challenge, many players (one play each) ---------- */
  async function putDuel(d) { return req('PATCH', `/duels/${d.id}`, enc({ ...d, cuid: await myUid() })); }
  async function getDuel(id) { return dec(await req('GET', `/duels/${id}`)); }
  /* a play doc id is duel_player, created once: a second try is refused by the security rules */
  async function putPlay(p) { return req('PATCH', `/plays/${p.did}_${p.pid}?currentDocument.exists=false`, enc({ ...p, puid: await myUid() })); }
  async function getPlay(did, pid) { return dec(await req('GET', `/plays/${did}_${pid}`)); }
  async function playsFor(did) { return query('plays', [F('did', 'EQUAL', did)], 60); }
  async function playsByCreator(pid) { return query('plays', [F('cpid', 'EQUAL', pid)], 60); }
  /* ---------- v1.8 Challenge the World: who is online + 1 vs 1 live invites ---------- */
  async function presence(p) { const uid = await myUid(); return req('PATCH', `/presence/${uid}`, enc({ ...p, uid, ts: Date.now() })); }
  async function online(sinceMs) { return query('presence', [F('ts', 'GREATER_THAN_OR_EQUAL', Date.now() - sinceMs)], 40); }
  async function wCreate(d) { return req('PATCH', `/wduels/${d.id}?currentDocument.exists=false`, enc({ ...d, cuid: await myUid(), status: 'invite', ts: Date.now() })); }
  async function wGet(id) { return dec(await req('GET', `/wduels/${id}`)); }
  async function wPatch(id, o) { return req('PATCH', `/wduels/${id}?${mask(o)}`, enc(o)); }
  async function wInvites() { return query('wduels', [F('touid', 'EQUAL', await myUid()), F('status', 'EQUAL', 'invite')], 5); }
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
  /* ---------- v1.8 feedback (create only, read in the Firebase console) ---------- */
  async function feedback(f) { return req('POST', '/feedback', enc({ ...f, uid: await myUid() })); }
  return { on, feedback, dstatAdd, dstat, putGroup, getGroup, groupScore, groupBoard, auth, myUid, putDuel, getDuel, putPlay, getPlay, playsFor, playsByCreator, presence, online, wCreate, wGet, wPatch, wInvites };
})();

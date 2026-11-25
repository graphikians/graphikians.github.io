/* ================= MACHHAR MAARO STUDIO · PAGE ================= */
(() => {
  const $ = id => document.getElementById(id);
  const LS = { get(k, d) { try { const v = localStorage.getItem('mmStudio.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem('mmStudio.' + k, JSON.stringify(v)); } catch (e) { } } };
  const isPhone = matchMedia('(pointer:coarse)').matches && Math.min(screen.width, screen.height) < 820;
  let D = null, mode = 'one', hookI = 0, busy = false, abort = null, DIR = null, SONG = null, photoImg = null, photoOn = LS.get('photoOn', true);
  let CAM = null;   // creator recording { blob, video, voice, map }
  const SPOT_HOOKS = ['Meet the *{n}.*', 'The *{n}* is unfair.', 'Nobody talks about the *{n}.*', '{n}: *game changer.*', 'Wait till you see the *{n}.*', 'This is why I love the *{n}.*', 'POV: you just unlocked the *{n}.*', 'The *{n}* in action.'];

  /* ---------- setup ---------- */
  function fillStyles() {
    $('style').innerHTML = CAT.STYLES.filter(s => !(s.laptop && isPhone)).map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    $('mus').innerHTML = `<option value="auto">Auto: best track for the style</option>` + MUSIC.TRACKS.map(t => `<option value="${t.id}">${t.name} · ${t.feel}</option>`).join('') + `<option value="upload">Upload my own song…</option><option value="none">No music (game sounds only)</option>`;
    $('bStyles').innerHTML = CAT.STYLES.filter(s => !s.laptop).map(s => `<button class="on" data-s="${s.id}">${s.name}</button>`).join('');
    $('bStyles').querySelectorAll('button').forEach(b => b.onclick = () => b.classList.toggle('on'));
  }
  function fillLooks() { const ls = CAT.looks($('style').value); $('look').innerHTML = ls.map((l, i) => `<option value="${i}">Look ${i + 1} · ${l.name}</option>`).join(''); }
  function rich(s) { return String(s).replace(/\*([^*]+)\*/g, '<b>$1</b>'); }
  function hooksList() {
    if (mode === 'spot') { const f = curFeat(); return SPOT_HOOKS.map(h => h.replace('{n}', f ? f.name : 'feature')); }
    return CAT.S($('style').value).hooks;
  }
  function fillHooks() { const hs = hooksList(); hookI = Math.min(hookI, hs.length - 1); $('hooks').innerHTML = hs.map((h, i) => `<button data-i="${i}" class="${i === hookI ? 'on' : ''}">${rich(h)}</button>`).join(''); $('hooks').querySelectorAll('button').forEach(b => b.onclick = () => { hookI = +b.dataset.i; fillHooks(); showPlan(); }); }
  let FEATS = [];
  function fillFeats() { FEATS = CAT.features(D); const groups = [...new Set(FEATS.map(f => f.group))]; $('feat').innerHTML = groups.map(g => `<optgroup label="${g}">` + FEATS.filter(f => f.group === g).map(f => `<option value="${f.id}">${f.name}</option>`).join('') + '</optgroup>').join(''); }
  const curFeat = () => FEATS.find(f => f.id === $('feat').value);

  function specNow(extra) {
    const st = $('style').value, s = {
      style: st, look: +$('look').value, hook: hookI, dur: +$('dur').value, seed: Math.max(1, +$('seed').value || 1),
      feature: mode === 'spot' ? $('feat').value : null
    };
    if (s.feature) s.hookText = hooksList()[hookI];
    s.lookName = CAT.looks(st)[s.look].name;
    return Object.assign(s, extra || {});
  }
  function musicNow(st) {
    const v = $('mus').value;
    if (v === 'upload') return SONG ? { type: 'upload', song: SONG, bpm: SONG.bpm } : { type: 'builtin', id: CAT.S(st).music, bpm: MUSIC.byId(CAT.S(st).music).bpm };
    if (v === 'none') return { type: 'none', bpm: 120 };
    const id = v === 'auto' ? CAT.S(st).music : v; return { type: 'builtin', id, bpm: MUSIC.byId(id).bpm };
  }
  function planNow(extra) { const spec = specNow(extra), m = musicNow(spec.style); if (mode === 'creator') spec.style = 'creator'; return { T: PLAN.build(spec, D, m), m }; }
  function showPlan() {
    if (!D) return;
    try {
      const { T } = planNow(), N = { hook: 'HOOK', logo: 'LOGO', game: 'GAME', card: 'CARD', climax: 'CLIMAX', outro: 'OUTRO' };
      $('plan').innerHTML = `<div><span>${T.total.toFixed(1)}s</span><b>${T.style.name}</b> · ${T.bpm} BPM · drop at ${T.drop.toFixed(1)}s</div>` + T.segs.map(s => `<div><span>${s.t0.toFixed(1)}–${s.t1.toFixed(1)}</span>${N[s.k]}${s.card ? ' · ' + s.card.type : ''}${s.shot && s.shot.label ? ' · ' + s.shot.label : ''}${s.cap ? ' · ' + rich(s.cap) : s.k === 'hook' ? ' · ' + rich(T.hookText) : ''}</div>`).join('');
    } catch (e) { $('plan').textContent = 'Plan error: ' + e.message; }
  }

  /* ---------- photo / name ---------- */
  function loadPhoto() { const d = LS.get('photo', null); photoImg = new Image(); if (d) photoImg.src = d; else photoImg.src = 'game/art/appicon.webp'; $('phImg').src = photoImg.src; $('phOn').classList.toggle('on', photoOn); $('phOn').textContent = photoOn ? 'Photo ON' : 'Photo OFF'; $('phName').value = LS.get('name', 'Sanx'); $('phSub').value = LS.get('sub', 'SANX Graphikians'); }
  $('phBtn').onclick = () => $('phFile').click();
  $('phFile').onchange = e => { const f = e.target.files[0]; if (!f) return; const im = new Image(); im.onload = () => { const c = document.createElement('canvas'), s = 320 / Math.max(im.width, im.height); c.width = im.width * s; c.height = im.height * s; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); LS.set('photo', c.toDataURL('image/jpeg', 0.9)); loadPhoto(); }; im.src = URL.createObjectURL(f); };
  $('phOn').onclick = () => { photoOn = !photoOn; LS.set('photoOn', photoOn); loadPhoto(); };
  $('phName').onchange = () => LS.set('name', $('phName').value); $('phSub').onchange = () => LS.set('sub', $('phSub').value);
  const optNow = () => ({ photo: photoOn, photoImg: photoOn ? photoImg : null, name: photoOn ? $('phName').value : '', sub: $('phSub').value });

  /* ---------- tabs ---------- */
  function setMode(m) {
    mode = m; for (const [b, k] of [['tOne', 'one'], ['tSpot', 'spot'], ['tBatch', 'batch'], ['tCreator', 'creator']]) $(b).classList.toggle('on', k === m);
    $('cSpot').classList.toggle('hide', m !== 'spot'); $('cBatch').classList.toggle('hide', m !== 'batch'); $('cCreator').classList.toggle('hide', m !== 'creator'); $('cHook').classList.toggle('hide', m === 'batch');
    if (m === 'creator') { $('style').value = 'creator'; fillLooks(); }
    fillHooks(); showPlan();
  }
  $('tOne').onclick = () => setMode('one'); $('tSpot').onclick = () => setMode('spot'); $('tBatch').onclick = () => setMode('batch'); $('tCreator').onclick = () => setMode('creator');
  if (isPhone) $('tCreator').classList.add('hide');
  $('style').onchange = () => { fillLooks(); hookI = 0; fillHooks(); showPlan(); };
  for (const id of ['look', 'dur', 'seed', 'feat']) $(id).onchange = () => { if (id === 'feat') fillHooks(); showPlan(); };
  $('mus').onchange = () => { $('upWrap').classList.toggle('hide', $('mus').value !== 'upload'); showPlan(); };
  $('upFile').onchange = async e => { const f = e.target.files[0]; if (!f) return; $('upInfo').textContent = 'Listening to your song…'; try { const ac = new AudioContext(); SONG = await MUSIC.analyze(f, ac); ac.close(); $('upInfo').innerHTML = `<span class="ok">✓ ${SONG.name}: ${SONG.bpm} BPM, drop at ${(SONG.drops[0] || 0).toFixed(1)}s</span>`; showPlan(); } catch (er) { SONG = null; $('upInfo').textContent = 'Could not read this song: ' + er.message; } };

  /* ---------- save ---------- */
  $('dirBtn').onclick = async () => {
    if (!window.showDirectoryPicker) { $('dirInfo').textContent = 'This browser cannot pick a folder. Videos go to Downloads (use Chrome or Edge for folder saving).'; return; }
    try { DIR = await window.showDirectoryPicker({ id: 'mmstudio', mode: 'readwrite', startIn: 'videos' }); $('dirInfo').innerHTML = `<span class="ok">✓ Saving to folder: ${DIR.name}</span>`; } catch (e) { }
  };
  async function save(name, blob) {
    if (DIR) { try { const fh = await DIR.getFileHandle(name, { create: true }), w = await fh.createWritable(); await w.write(blob); await w.close(); return true; } catch (e) { } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 60000); return true;
  }
  const stamp = () => { const d = new Date(), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`; };

  /* ---------- busy state ---------- */
  function setBusy(b, label) {
    busy = b; $('pvBtn').disabled = b; $('rdBtn').disabled = b; $('bGo').disabled = b; $('crRec').disabled = b;
    $('stopBtn').classList.toggle('hide', !b); $('prog').classList.toggle('hide', !b && !label); if (label) $('ptxt').textContent = label;
  }
  const prog = (p, txt) => { $('pbar').style.width = Math.round(p * 100) + '%'; if (txt) $('ptxt').textContent = txt + ' · ' + Math.round(p * 100) + '%'; };
  $('stopBtn').onclick = () => { if (abort) abort.stop = true; try { if (PV.src) PV.src.stop(); } catch (e) { } };

  /* ---------- preview (real time, with sound) ---------- */
  const PV = { ac: null, src: null };
  async function preview(o = {}) {
    if (busy) return; const { T, m } = planNow(); abort = { stop: false }; setBusy(true, 'Preparing music…'); $('msg').classList.add('hide');
    try {
      PV.ac = PV.ac || new AudioContext(); await PV.ac.resume();
      const mb = await STUDIO.musicFor(T, m, T.fails), fx = await STUDIO.fxFor(T);
      const mixed = STUDIO.mix(T.total, null, mb, fx, null, { game: 0, music: +$('mv').value }), buf = PV.ac.createBuffer(2, mixed.L.length, 48000); buf.copyToChannel(mixed.L, 0); buf.copyToChannel(mixed.R, 1);
      let t0 = 0, started = false;
      prog(0, 'Preview');
      await STUDIO.run(T, 'preview', {
        canvas: $('pv'), opt: optNow(), sound: +$('gv').value > 0, abort, camVideo: o.camVideo,
        onFrame: async (i, N, t) => {
          if (!started) { started = true; PV.src = PV.ac.createBufferSource(); PV.src.buffer = buf; PV.src.connect(PV.ac.destination); t0 = performance.now() + 60; PV.src.start(PV.ac.currentTime + 0.06); if (o.onStart) o.onStart(); }
          if (o.onTick) o.onTick(t, i);
          const due = t0 + t * 1000, now = performance.now(); await new Promise(r => setTimeout(r, Math.max(0, due - now)));
          if (i % 6 === 0) prog(i / N, 'Preview');
        }
      });
      prog(1, 'Preview finished');
    } catch (e) { if (e.message !== 'stopped') { console.error(e); $('ptxt').textContent = 'Preview stopped: ' + e.message; } else $('ptxt').textContent = 'Stopped'; }
    finally { try { PV.src && PV.src.stop(); } catch (e) { } PV.src = null; setBusy(false, ' '); if (o.onEnd) o.onEnd(); }
  }
  $('pvBtn').onclick = () => preview();

  /* ---------- render one ---------- */
  function addOut(name, url, thumbUrl, txtUrl, label) {
    if ($('out').querySelector('p')) $('out').innerHTML = '';
    const d = document.createElement('div'); d.className = 'v'; d.innerHTML = `${thumbUrl ? `<img src="${thumbUrl}">` : ''}<div><b>${label}</b><br><a href="${url}" download="${name}">Video</a>${thumbUrl ? `<a href="${thumbUrl}" download="${name.replace('.mp4', '_thumb.png')}">Thumb</a>` : ''}${txtUrl ? `<a href="${txtUrl}" download="${name.replace('.mp4', '_captions.txt')}">Captions</a>` : ''}</div>`;
    $('out').prepend(d);
  }
  async function renderOne(spec, m, label, prefix) {
    const T = PLAN.build(spec, D, m);
    const out = await STUDIO.render(T, {
      preview: $('pv'), opt: optNow(), music: m, abort, vol: { music: +$('mv').value, game: +$('gv').value },
      camVideo: CAM && spec.style === 'creator' ? CAM.video : null, voiceBuf: CAM && spec.style === 'creator' ? CAM.voice : null,
      beforeFrame: CAM && spec.style === 'creator' ? seekCam : null,
      onProgress: (p, s) => prog(p, (prefix || '') + s)
    });
    const base = `MachharMaaro_${spec.feature ? 'Spotlight' : CAT.S(spec.style).name.replace(/[^A-Za-z0-9]+/g, '')}_${stamp()}`;
    await save(base + '.mp4', out.blob);
    const th = STUDIO.thumbnail(T, out.thumb), thBlob = await new Promise(r => th.toBlob(r, 'image/png'));
    await save(base + '_thumb.png', thBlob);
    const txt = new Blob([CAT.social(Object.assign({}, spec, { hookText: T.hookText }), spec.feature ? 'Feature Spotlight' : CAT.S(spec.style).name)], { type: 'text/plain' });
    await save(base + '_captions.txt', txt);
    addOut(base + '.mp4', URL.createObjectURL(out.blob), URL.createObjectURL(thBlob), URL.createObjectURL(txt), `${T.total.toFixed(0)}s · ${CAT.plain(T.hookText)}`);
    remember(spec);
    return out;
  }
  $('rdBtn').onclick = async () => {
    if (busy) return; abort = { stop: false }; setBusy(true, 'Starting…'); $('msg').classList.add('hide');
    try { const spec = specNow(); if (mode === 'creator') spec.style = 'creator'; await renderOne(spec, musicNow(spec.style), ''); prog(1, '✓ Saved'); }
    catch (e) { console.error(e); $('ptxt').textContent = e.message === 'stopped' ? 'Stopped' : 'Render failed: ' + e.message; }
    finally { setBusy(false, ' '); }
  };

  /* ---------- batch with variety memory ---------- */
  function usedRecent() { const now = Date.now(), u = LS.get('used', []).filter(x => now - x.d < 7 * 864e5); LS.set('used', u); return u; }
  function remember(spec) { const u = usedRecent(); u.push({ d: Date.now(), h: spec.style + ':' + (spec.feature || spec.hook), l: spec.style + ':' + spec.look }); LS.set('used', u.slice(-400)); }
  $('bN').querySelectorAll('button').forEach(b => b.onclick = () => { $('bN').querySelectorAll('button').forEach(z => z.classList.remove('on')); b.classList.add('on'); });
  $('bSpot').onclick = () => { $('bSpot').classList.toggle('on'); $('bSpot').textContent = $('bSpot').classList.contains('on') ? 'Yes' : 'No'; };
  function batchSpecs(n) {
    const styles = [...$('bStyles').querySelectorAll('button.on')].map(b => b.dataset.s); if (!styles.length) styles.push('survive');
    const u = usedRecent(), usedH = new Set(u.map(x => x.h)), usedL = new Set(u.map(x => x.l)), out = [], dur = +$('dur').value;
    let r = Date.now() % 9973 + 1; const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
    const order = styles.slice().sort(() => rnd() - 0.5);
    for (let i = 0; i < n; i++) {
      const spot = $('bSpot').classList.contains('on') && i === n - 1 && n >= 3;
      const st = order[i % order.length], S = CAT.S(st);
      const hs = S.hooks.map((_, k) => k).filter(k => !usedH.has(st + ':' + k)); const hook = (hs.length ? hs : S.hooks.map((_, k) => k))[Math.floor(rnd() * (hs.length || S.hooks.length))];
      const ls = [...Array(9).keys()].filter(k => !usedL.has(st + ':' + k)); const look = (ls.length ? ls : [...Array(9).keys()])[Math.floor(rnd() * (ls.length || 9))];
      const spec = { style: st, look, hook, dur, seed: 1 + Math.floor(rnd() * 9000) };
      if (spot) { const f = FEATS[Math.floor(rnd() * FEATS.length)]; spec.feature = f.id; spec.hookText = SPOT_HOOKS[Math.floor(rnd() * SPOT_HOOKS.length)].replace('{n}', f.name); }
      spec.lookName = CAT.looks(st)[look].name; usedH.add(st + ':' + hook); usedL.add(st + ':' + look);
      const tracks = MUSIC.TRACKS.map(t => t.id), mid = i === 0 ? S.music : (rnd() < 0.55 ? S.music : tracks[Math.floor(rnd() * tracks.length)]);
      out.push({ spec, m: { type: 'builtin', id: mid, bpm: MUSIC.byId(mid).bpm } });
    }
    return out;
  }
  $('bGo').onclick = async () => {
    if (busy) return; const n = +$('bN').querySelector('.on').textContent, list = batchSpecs(n);
    abort = { stop: false }; setBusy(true, 'Batch starting…'); $('msg').classList.add('hide');
    let done = 0;
    try { for (let i = 0; i < list.length; i++) { if (abort.stop) break; await renderOne(list[i].spec, list[i].m, '', `Video ${i + 1} of ${list.length} · `); done++; } prog(1, `✓ ${done} videos saved`); }
    catch (e) { console.error(e); $('ptxt').textContent = (e.message === 'stopped' ? 'Stopped' : 'Batch error: ' + e.message) + ` (${done} saved)`; }
    finally { setBusy(false, ' '); }
  };

  /* ---------- creator / reaction ---------- */
  async function seekCam(t, R) {
    if (!CAM || !CAM.frames.length) return;
    const idx = Math.max(0, Math.min(CAM.frames.length - 1, Math.round(t * 30)));
    if (CAM.cur !== idx) { try { if (CAM.bmp && CAM.bmp.close) CAM.bmp.close(); CAM.bmp = await createImageBitmap(CAM.frames[idx]); CAM.cur = idx; } catch (e) { } }
    if (R && CAM.bmp) R.camVideo = CAM.bmp;
  }
  function camTime(t) { const m = CAM.map; if (!m.length) return t; let i = 0; while (i < m.length - 1 && m[i + 1][0] <= t) i++; const a = m[i], b = m[Math.min(m.length - 1, i + 1)]; if (b[0] === a[0]) return a[1]; return a[1] + (b[1] - a[1]) * (t - a[0]) / (b[0] - a[0]); }
  $('crRec').onclick = async () => {
    if (busy) return;
    let stream; try { stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: { echoCancellation: true, noiseSuppression: true } }); } catch (e) { $('crInfo').textContent = 'Camera/mic not allowed: ' + e.message; return; }
    const live = $('cam'); live.srcObject = stream; live.classList.remove('hide'); await live.play();
    /* voice: the mic is recorded; face: one camera picture is kept for every video frame you see */
    const am = ['audio/webm;codecs=opus', 'audio/webm'].find(x => MediaRecorder.isTypeSupported(x)) || '';
    const rec = new MediaRecorder(new MediaStream(stream.getAudioTracks()), am ? { mimeType: am } : {}), parts = []; rec.ondataavailable = e => e.data.size && parts.push(e.data);
    const grab = document.createElement('canvas'); grab.width = 720; grab.height = 405; const gx = grab.getContext('2d');
    const frames = [], pend = [], map = []; let r0 = 0;
    rec.start(250); r0 = performance.now();
    await preview({
      onStart: () => { map.length = 0; },
      onTick: (t, i) => {
        map.push([t, (performance.now() - r0) / 1000]);
        const vw = live.videoWidth || 1280, vh = live.videoHeight || 720, sc = Math.max(720 / vw, 405 / vh);
        try { gx.drawImage(live, (720 - vw * sc) / 2, (405 - vh * sc) / 2, vw * sc, vh * sc); } catch (e) { }
        pend.push(new Promise(res => grab.toBlob(bl => { frames[i] = bl; res(); }, 'image/jpeg', 0.82)));
      }
    });
    await new Promise(res => { rec.onstop = res; rec.stop(); }); stream.getTracks().forEach(t => t.stop()); live.srcObject = null; live.classList.add('hide');
    $('crInfo').textContent = 'Preparing your recording…';
    await Promise.all(pend);
    for (let i = 1; i < frames.length; i++) if (!frames[i]) frames[i] = frames[i - 1];
    const blob = new Blob(parts, { type: rec.mimeType || 'audio/webm' });
    let voice = null;
    try {
      const ac = new AudioContext(), full = await ac.decodeAudioData(await blob.arrayBuffer()); ac.close();
      const total = planNow().T.total, SR = 48000, n = Math.ceil(total * SR), oc = new OfflineAudioContext(2, n, SR), out = oc.createBuffer(2, n, SR);
      const src = [full.getChannelData(0), full.getChannelData(Math.min(1, full.numberOfChannels - 1))], ssr = full.sampleRate;
      let k = 0; const rt = t => { if (!map.length) return t; if (k && map[k][0] > t) k = 0; while (k < map.length - 1 && map[k + 1][0] <= t) k++; const p = map[k], q = map[Math.min(map.length - 1, k + 1)]; return q[0] === p[0] ? p[1] + (t - p[0]) : p[1] + (q[1] - p[1]) * (t - p[0]) / (q[0] - p[0]); };
      for (let c = 0; c < 2; c++) { k = 0; const d = out.getChannelData(c), sc = src[c]; for (let j = 0; j < n; j++) { const x = rt(j / SR) * ssr, i0 = x | 0, f = x - i0; d[j] = (sc[i0] || 0) * (1 - f) + (sc[i0 + 1] || 0) * f; } }
      voice = out;
    } catch (e) { console.warn('voice', e); }
    const first = frames.length ? await createImageBitmap(frames[0]) : null;
    CAM = { frames, video: first, bmp: first, cur: 0, voice, map: [] }; $('crClear').disabled = false;
    $('crInfo').innerHTML = frames.length ? `<span class="ok">✓ Reaction recorded (${frames.length} frames). Now press Render HD.</span>` : 'Recording could not be read. Please try again.';
  };
  async function resample(b, sr) { if (b.sampleRate === sr) return b; const oc = new OfflineAudioContext(2, Math.ceil(b.duration * sr), sr), s = oc.createBufferSource(); s.buffer = b; s.connect(oc.destination); s.start(); return await oc.startRendering(); }
  $('crClear').onclick = () => { CAM = null; $('crClear').disabled = true; $('crInfo').textContent = ''; };

  /* ---------- boot ---------- */
  (async () => {
    fillStyles(); fillLooks(); fillHooks(); loadPhoto();
    if (!STUDIO.canHD()) $('msg').innerHTML = 'Preview works here. For HD video files please open this Studio in Chrome or Edge.';
    try {
      await STUDIO.initEngine($('eng')); D = STUDIO.ENG.D; fillFeats(); fillHooks(); showPlan();
      $('msg').textContent = 'Ready. Press Preview or Render HD.'; $('pvBtn').disabled = false; $('rdBtn').disabled = false;
      /* first frame on screen */
      const { T } = planNow(); await STUDIO.run(Object.assign({}, T, { total: 1 / 30 }), 'preview', { canvas: $('pv'), opt: optNow() }).catch(() => { }); $('msg').classList.add('hide');
    } catch (e) { $('msg').textContent = 'Could not start the game engine: ' + e.message; }
  })();
})();

/* ================= BEAT SANX — Reaction / Creator Mode (v1.5) =================
   Records the player's face (front camera / webcam + mic) while they play, logs every game
   moment (tiles lighting, taps, mistakes, level clears), then AUTO-EDITS one short video:
     game on top · face below (creator-commentary layout) · pro intro · slow-motion replay of the
     big moment · captions · DOWNLOAD FREE outro · always under 50 seconds.
   Everything stays on this device until the player chooses to share it. */
'use strict';
const REC = (() => {
  const W = 1080, H = 1920;
  let armed = false, cam = null, mr = null, chunks = [], t0 = 0, log = [], recording = false, creator = '';
  const now = () => (performance.now() - t0) / 1000;
  const ok = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);

  /* ---------- arm: open the camera before the run ---------- */
  async function arm(name) {
    if (!ok()) { UI.toast('Camera recording is not supported here', 'x'); return false; }
    try {
      cam = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 960 } }, audio: { echoCancellation: true, noiseSuppression: true } });
    } catch (e) { UI.toast('Camera permission is needed for Reaction Mode', 'x'); return false; }
    armed = true; creator = (name || (typeof S !== 'undefined' ? S.st.name : '') || 'PLAYER').toUpperCase().slice(0, 14);
    preview(true);
    return true;
  }
  function disarm() { armed = false; recording = false; try { if (mr && mr.state !== 'inactive') mr.stop(); } catch (e) { } if (cam) cam.getTracks().forEach(t => t.stop()); cam = null; preview(false); }
  /* small live camera bubble so the player knows it is recording */
  function preview(on) {
    let v = document.getElementById('recBubble');
    if (!on) { if (v) v.remove(); return; }
    if (!v) { v = document.createElement('div'); v.id = 'recBubble'; v.innerHTML = '<video autoplay muted playsinline></video><i>REC</i>'; document.body.appendChild(v); }
    v.querySelector('video').srcObject = cam; v.classList.toggle('live', recording);
  }
  /* ---------- run starts / game events / run ends ---------- */
  function begin() {
    if (!armed || !cam) return;
    chunks = []; log = []; t0 = performance.now(); recording = true;
    const mime = ['video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'].find(m => { try { return MediaRecorder.isTypeSupported(m); } catch (e) { return false; } }) || '';
    mr = new MediaRecorder(cam, Object.assign({ videoBitsPerSecond: 3.5e6 }, mime ? { mimeType: mime } : {}));
    mr.ondataavailable = e => e.data && e.data.size && chunks.push(e.data);
    mr.start(500); preview(true);
  }
  function evt(type, d = {}) { if (recording) log.push(Object.assign({ t: now(), type }, d)); }
  async function end(res) {
    if (!recording) return;
    recording = false; evt('end', { won: !!(res && res.won) });
    const stopped = new Promise(r => { mr.onstop = r; }); try { mr.stop(); } catch (e) { } await stopped;
    const blob = new Blob(chunks, { type: (mr.mimeType || 'video/webm').split(';')[0] }), dur = now();
    const data = { blob, log: log.slice(), dur, res, creator };
    disarm();
    setTimeout(() => offer(data), 600);
  }
  function offer(data) {
    UI.modal(`<div class="mdK">Reaction recorded</div><div class="mdT">Make your video?</div><div class="mdS">Auto-edited: game on top, your face below, best moment in slow motion, under 50 seconds.</div>
      <button class="btn big pulse" id="recMake">${ART.ic('play')} MAKE MY VIDEO</button><button class="btn ghost" data-act="closeModal">Not now</button>`);
    const q = new URLSearchParams(location.search);
    document.getElementById('recMake').onclick = () => make(data, { hook: q.get('hook') || undefined });
  }

  /* ---------- auto-edit plan ---------- */
  function plan(data) {
    const L = data.log, D = data.dur, wrongs = L.filter(e => e.type === 'wrong'), clears = L.filter(e => e.type === 'clear');
    const key = wrongs.length ? wrongs[wrongs.length - 1] : clears[clears.length - 1] || { t: D - 1 };
    const segs = [];
    const MAXG = 32;                                   // seconds of real gameplay in the video
    if (D <= MAXG) segs.push({ a: 0, b: D, rate: 1 });
    else {
      const endA = Math.max(0, Math.min(D, key.t + 2.2) - 22);
      const hl = clears.filter(c => c.t < endA - 3).sort((p, q) => (q.len || 0) - (p.len || 0)).slice(0, 2).sort((p, q) => p.t - q.t);
      hl.forEach(c => segs.push({ a: Math.max(0, c.t - 4), b: c.t + 1, rate: 1, tag: `LEVEL ${c.lv || ''} CLEAR` }));
      segs.push({ a: endA, b: Math.min(D, key.t + 2.2), rate: 1 });
    }
    /* slow-motion replay of the big moment */
    segs.push({ a: Math.max(0, key.t - 1.4), b: Math.min(D, key.t + 0.8), rate: 0.5, replay: true, key });
    return { segs, key, wrong: !!wrongs.length };
  }
  /* board state at source time ts (from the event log) */
  function stateAt(L, ts) {
    const st = { lit: {}, press: {}, g: 3, hearts: 3, max: 3, level: 1, coins: 0 };
    let hud = null;
    for (const e of L) {
      if (e.t > ts) break;
      if (e.type === 'hud') hud = e;
      if (e.type === 'lit') e.i.forEach(i => st.lit[i] = 1);
      if (e.type === 'unlit') e.i.forEach(i => delete st.lit[i]);
      if (e.type === 'tap' && ts - e.t < 0.3) st.press[e.i] = 1 - (ts - e.t) / 0.3;
      if (e.type === 'wrong' && ts - e.t < 1.6) { st.wrong = e.i; st.wrongA = 1 - (ts - e.t) / 1.6; }
    }
    if (hud) Object.assign(st, { g: hud.g || 3, hearts: hud.hearts, max: hud.max || 3, level: hud.level, coins: hud.coins, label: hud.label });
    return st;
  }

  /* ---------- render the final video (plays the camera clip and draws every frame) ---------- */
  async function make(data, opts = {}) {
    const P = plan(data), C = CLIP._, A = await C.assets({}), vid = document.createElement('video');
    vid.src = URL.createObjectURL(data.blob); vid.playsInline = true; vid.preload = 'auto'; vid.crossOrigin = 'anonymous';
    await new Promise(r => { vid.onloadeddata = r; vid.onerror = r; setTimeout(r, 4000); });
    const out = document.createElement('canvas'), w = opts.w || 720, h = opts.h || 1280, sc = w / W; out.width = w; out.height = h;
    const x = out.getContext('2d');
    UI.modal(`<div class="mdK">Making your video</div><div class="clipStage"><canvas id="recCv"></canvas></div><div class="clipPg"><i id="recPg"></i></div><div class="mdS">Keep the app open · about ${Math.round(P.segs.reduce((a, s) => a + (s.b - s.a) / s.rate, 0) + 5)} s</div>`, 'clipM');
    const pv = document.getElementById('recCv'); pv.width = 270; pv.height = 480; const px = pv.getContext('2d');
    /* audio: camera mic + re-played tile sounds + optional groove */
    const ac = SND.ctx(); let srcNode = null; try { srcNode = ac.createMediaElementSource(vid); srcNode.connect(SND.masterNode()); } catch (e) { }
    const recStream = SND.rec(true);
    const stream = new MediaStream([...out.captureStream(30).getVideoTracks(), ...(recStream ? recStream.getAudioTracks() : [])]);
    const mime = CLIP.pickMime(), rec = new MediaRecorder(stream, Object.assign({ videoBitsPerSecond: 6e6 }, mime ? { mimeType: mime } : {}));
    const parts = []; rec.ondataavailable = e => e.data && e.data.size && parts.push(e.data); const done = new Promise(r => { rec.onstop = r; });
    if (opts.music) { SND.beat.lock(true); SND.beat.start(opts.music.bpm || 100, 'still'); } else SND.beat.start(104, 'light');
    const mus = opts.music ? SND.playBuffer(opts.music.buffer, SND.now(), opts.music.offset || 0, opts.musicVol || 0.6) : null;
    rec.start(250);
    const total = P.segs.reduce((a, s) => a + (s.b - s.a) / s.rate, 0) + 4.8;
    let T = 0; const tStart = performance.now();
    const drawFrame = (ts, seg, segU, outT) => {
      x.setTransform(sc, 0, 0, sc, 0, 0);
      C.bg(x, A, outT, null, 0.5, 'studio', 0.6);
      /* frame panels */
      x.fillStyle = 'rgba(10,4,30,.55)'; C.rr(x, 36, 60, W - 72, 980, 44); x.fill(); x.strokeStyle = 'rgba(154,109,245,.6)'; x.lineWidth = 4; x.stroke();
      const st = stateAt(data.log, ts);
      C.hud(x, A, { hearts: st.hearts, max: st.max, level: st.level, coins: st.coins });
      C.board(x, A, outT, Object.assign({}, st, { size: 760, cy: 640 }));
      /* camera panel */
      const cx0 = 36, cy0 = 1070, cw = W - 72, ch = 800;
      x.save(); C.rr(x, cx0, cy0, cw, ch, 44); x.clip(); x.fillStyle = '#000'; x.fillRect(cx0, cy0, cw, ch);
      if (vid.videoWidth) { const vr = vid.videoWidth / vid.videoHeight, pr = cw / ch; let sw = vid.videoWidth, sh = vid.videoHeight, sx = 0, sy = 0; if (vr > pr) { sw = sh * pr; sx = (vid.videoWidth - sw) / 2; } else { sh = sw / pr; sy = (vid.videoHeight - sh) / 2; } const zoom = seg.replay ? 1 + 0.18 * C.eOut(segU / 0.6) : 1; const zw = sw / zoom, zh = sh / zoom; x.translate(cx0 + cw, cy0); x.scale(-1, 1); x.drawImage(vid, sx + (sw - zw) / 2, sy + (sh - zh) / 2, zw, zh, 0, 0, cw, ch); }
      x.restore();
      x.strokeStyle = 'rgba(154,109,245,.7)'; x.lineWidth = 4; C.rr(x, cx0, cy0, cw, ch, 44); x.stroke();
      C.chip(x, `${data.creator} vs BEAT SANX`, 300, cy0 + ch - 60, 34);
      if (seg.replay) { x.fillStyle = 'rgba(255,45,90,.92)'; C.rr(x, 60, 92, 300, 64, 32); x.fill(); x.font = "900 34px Inter"; x.fillStyle = '#fff'; x.textAlign = 'left'; x.fillText('⟲ REPLAY · 0.5×', 82, 136); C.slam(x, P.wrong ? '1 TILE AWAY 😱' : 'LEGEND! 🔥', 0, segU, W / 2, 1050, 110, 99); }
      if (seg.tag && segU < 1.6) C.slam(x, seg.tag, 0, segU, W / 2, 1050, 84, 1.6);
      /* intro: hook over the first seconds */
      if (outT < 2.6) { C.intro(x, A, outT); C.slam(x, opts.hook || 'CAN I BEAT THIS?', -0.3, outT, W / 2, 1050, 104, 2.6); }
      C.vignette(x, st.wrong != null ? (st.wrongA || 0) : 0);
    };
    let si = 0;
    for (const seg of P.segs) {
      vid.currentTime = seg.a; vid.playbackRate = seg.rate; try { vid.preservesPitch = false; } catch (e) { }
      await new Promise(r => { vid.onseeked = r; setTimeout(r, 800); });
      await vid.play().catch(() => { });
      const segStart = performance.now(); let lastTs = seg.a;
      await new Promise(res => {
        const loop = () => {
          const segU = (performance.now() - segStart) / 1000, ts = seg.a + segU * seg.rate, outT = T + segU;
          /* replay the tile notes of the log (normal speed parts only) */
          if (seg.rate === 1) data.log.forEach(e => { if (e.t > lastTs && e.t <= ts) { if (e.type === 'lit') e.i.forEach(i => SND.tile(i, 0.25)); if (e.type === 'tap') SND.tap(e.i); if (e.type === 'wrong') { SND.wrong(); } if (e.type === 'clear') { SND.crash(); } } });
          lastTs = ts;
          drawFrame(ts, seg, segU, outT); px.drawImage(out, 0, 0, 270, 480);
          const pg = document.getElementById('recPg'); if (pg) pg.style.width = Math.min(100, outT / total * 100) + '%';
          if (ts >= seg.b || vid.ended) return res();
          requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
      });
      vid.pause(); T += (seg.b - seg.a) / seg.rate; si++;
    }
    /* outro */
    SND.beat.fill(); SND.crash();
    const o0 = performance.now(), best = data.res ? (data.res.tiles || data.res.levels || 0) : 0;
    await new Promise(res => { const loop = () => { const u = (performance.now() - o0) / 1000; x.setTransform(sc, 0, 0, sc, 0, 0); C.bg(x, A, T + u, null, 0.5, 'arena', 0.6); C.endCard(x, A, T + u, T, { title: best ? `BEAT ${data.creator}'S ${best}!` : 'CAN YOU BEAT IT?', line: 'Same game. Your turn.', footer: '500+ LEVELS · DUELS · DAILY BEAT' }); px.drawImage(out, 0, 0, 270, 480); if (u >= 4.8) return res(); requestAnimationFrame(loop); }; requestAnimationFrame(loop); });
    if (mus) mus.stop();
    rec.stop(); await done; SND.beat.stop(); SND.beat.lock(false); SND.rec(false); try { srcNode && srcNode.disconnect(); } catch (e) { }
    URL.revokeObjectURL(vid.src);
    const type = (rec.mimeType || mime || 'video/webm').split(';')[0], blob = new Blob(parts, { type }), ext = type.includes('mp4') ? 'mp4' : 'webm';
    UI.closeModal();
    if (opts.onDone) return opts.onDone(blob, ext);
    window.__lastClip = blob;
    const v = await UI.ask(`<div class="mdK">Your reaction video is ready</div><div class="mdT">${Math.round(total)} sec</div><div class="mdS">Post it on Reels, Shorts or WhatsApp status.</div><button class="btn big pulse" data-pick="share">${ART.ic('share')} SHARE / SAVE</button><button class="btn ghost" data-pick="no">Close</button>`);
    if (v === 'share') SH.fileShare(blob, `beat-sanx-reaction.${ext}`, `😱 My Beat Sanx reaction! Can you do better?`);
  }
  return { arm, disarm, begin, evt, end, make, get armed() { return armed; }, get recording() { return recording; }, ok };
})();

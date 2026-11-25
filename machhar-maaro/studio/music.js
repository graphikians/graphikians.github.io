/* ================= MACHHAR MAARO STUDIO · MUSIC =================
   6 built-in tracks made from scratch in the browser (no copyright, zero cost).
   Every track follows the video: soft under the hook, groove under gameplay, a build-up
   before the big moment, the DROP exactly on the climax, a hard cut on every fail, and a
   clean fade on the outro. Your own song can be used too: its tempo, bars and drop are
   found automatically and it is re-cut on the bar lines to fit the video.
================================================================== */
const MUSIC = (() => {
  const SR = 48000;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const TRACKS = [
    { id: 'hype', name: 'Hype · Electro', bpm: 128, root: 45, minor: 1, prog: [0, -4, 3, -2], feel: 'Big drops, made for Shorts' },
    { id: 'boss', name: 'Boss Epic', bpm: 140, root: 38, minor: 1, prog: [0, 1, -4, -5], feel: 'Huge drums for boss fights' },
    { id: 'night', name: 'Spooky Night', bpm: 100, root: 45, minor: 1, prog: [0, -4, -2, -5], feel: '2 AM tension, music box' },
    { id: 'comedy', name: 'Comedy Bounce', bpm: 118, root: 48, minor: 0, prog: [0, 5, 7, 5], feel: 'Funny, bouncy, family drama' },
    { id: 'lofi', name: 'Lo-fi Chill', bpm: 88, root: 50, minor: 0, prog: [0, -3, 5, 7], feel: 'Satisfying swats, calm' },
    { id: 'dhol', name: 'Wedding Dhol Electro', bpm: 124, root: 50, minor: 0, prog: [0, 5, -2, 7], feel: 'Wedding nights, festivals' }
  ];
  const byId = id => TRACKS.find(t => t.id === id) || TRACKS[0];

  /* chord tones from a root offset (minor or major triad) */
  const chord = (root, off, minor) => { const r = root + off, third = minor ? 3 : 4; return [r, r + third, r + 7]; };
  const scale = (minor) => minor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];

  function kit(oc, out) {
    const nb = oc.createBuffer(1, SR * 2, SR), d = nb.getChannelData(0); let s = 7; for (let i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647) * 2 - 1; }
    const env = (g, t, a, peak, dec, sus = 0.0001) => { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(Math.max(0.0001, sus), t + a + dec); };
    const noise = (t, dur, type, f, q, vol, f2) => { const sn = oc.createBufferSource(); sn.buffer = nb; const fl = oc.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur); fl.Q.value = q; const g = oc.createGain(); env(g, t, 0.002, vol, dur); sn.connect(fl); fl.connect(g); g.connect(out); sn.start(t, Math.random() * 1.5); sn.stop(t + dur + 0.05); };
    const osc = (t, type, f, dur, vol, a = 0.005, f2, dest, filt) => { const o = oc.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur); const g = oc.createGain(); env(g, t, a, vol, dur); let n = o; if (filt) { const fl = oc.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(filt[0], t); fl.frequency.exponentialRampToValueAtTime(filt[1], t + dur); fl.Q.value = filt[2] || 1; o.connect(fl); n = fl; } n.connect(g); g.connect(dest || out); o.start(t); o.stop(t + a + dur + 0.05); return o; };
    return {
      kick: (t, v = 1) => { osc(t, 'sine', 150, 0.32, 0.9 * v, 0.002, 42); osc(t, 'triangle', 900, 0.02, 0.15 * v, 0.001, 200); },
      snare: (t, v = 1) => { noise(t, 0.18, 'bandpass', 1900, 0.7, 0.55 * v); osc(t, 'triangle', 220, 0.08, 0.25 * v, 0.001, 160); },
      clap: (t, v = 1) => { for (const d of [0, 0.012, 0.024]) noise(t + d, 0.12, 'bandpass', 1300, 1.2, 0.35 * v); },
      hat: (t, v = 1, open) => noise(t, open ? 0.2 : 0.045, 'highpass', 8200, 0.7, 0.18 * v),
      shaker: (t, v = 1) => noise(t, 0.06, 'bandpass', 6000, 2, 0.12 * v),
      bass: (t, m, dur, v = 1, type = 'sawtooth') => osc(t, type, mtof(m), dur, 0.32 * v, 0.006, null, null, [900, 180, 4]),
      sub: (t, m, dur, v = 1) => osc(t, 'sine', mtof(m), dur, 0.42 * v, 0.01),
      pluck: (t, m, dur, v = 1, type = 'triangle') => osc(t, type, mtof(m), dur, 0.16 * v, 0.003, null, null, [5200, 700, 2]),
      bell: (t, m, dur, v = 1) => { osc(t, 'sine', mtof(m), dur, 0.12 * v, 0.002); osc(t, 'sine', mtof(m) * 2.76, dur * 0.4, 0.04 * v, 0.002); },
      lead: (t, m, dur, v = 1) => { const o = osc(t, 'square', mtof(m), dur, 0.07 * v, 0.02, null, null, [3800, 1600, 1]); const l = oc.createOscillator(), lg = oc.createGain(); l.frequency.value = 5.5; lg.gain.value = mtof(m) * 0.012; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + 0.1); },
      pad: (t, ms, dur, v = 1) => { for (const m of ms) for (const det of [-7, 0, 7]) { const o = oc.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = det; const fl = oc.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 1300; const g = oc.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.022 * v, t + Math.min(0.4, dur * 0.3)); g.gain.setValueAtTime(0.022 * v, t + dur * 0.85); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.25); o.connect(fl); fl.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.3); } },
      stab: (t, ms, v = 1) => { for (const m of ms) for (const det of [-12, 0, 12]) osc(t, 'sawtooth', mtof(m + 12), 0.22, 0.05 * v, 0.003, null, null, [6000, 900, 1]); },
      tom: (t, f, v = 1) => { osc(t, 'sine', f, 0.28, 0.6 * v, 0.002, f * 0.55); noise(t, 0.05, 'lowpass', 1200, 0.8, 0.2 * v); },
      dhol: (t, low, v = 1) => { if (low) { osc(t, 'sine', 95, 0.36, 0.75 * v, 0.002, 60); noise(t, 0.04, 'lowpass', 600, 1, 0.3 * v); } else { osc(t, 'triangle', 420, 0.07, 0.3 * v, 0.001, 300); noise(t, 0.05, 'bandpass', 3200, 2, 0.35 * v); } },
      wood: (t, v = 1) => osc(t, 'sine', 1150, 0.05, 0.25 * v, 0.001, 900),
      riser: (t0, t1, v = 1) => { const dur = t1 - t0; noise(t0, dur, 'bandpass', 300, 1.5, 0.0001, 7000); const sn = oc.createBufferSource(); sn.buffer = nb; sn.loop = true; const fl = oc.createBiquadFilter(); fl.type = 'bandpass'; fl.Q.value = 1.2; fl.frequency.setValueAtTime(300, t0); fl.frequency.exponentialRampToValueAtTime(7000, t1); const g = oc.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.32 * v, t1); g.gain.linearRampToValueAtTime(0.0001, t1 + 0.05); sn.connect(fl); fl.connect(g); g.connect(out); sn.start(t0); sn.stop(t1 + 0.1); },
      impact: (t, v = 1) => { osc(t, 'sine', 70, 1.4, 0.9 * v, 0.002, 28); noise(t, 0.9, 'lowpass', 1800, 0.7, 0.45 * v, 120); },
      downer: (t, v = 1) => { osc(t, 'sawtooth', 600, 0.6, 0.18 * v, 0.005, 60, null, [3000, 300, 1]); noise(t, 0.4, 'lowpass', 2500, 0.8, 0.3 * v, 200); },
      noise, osc
    };
  }

  /* section at time t (from the video plan) */
  function secAt(T, t) {
    if (t >= T.outro) return 'outro';
    for (const f of (T.fails || [])) if (t >= f && t < f + T.barLen * 1.0) return 'break';
    if (T.drop != null && t >= T.drop && t < T.outro) return 'drop';
    if (T.drop != null && t >= T.drop - T.barLen * 2 && t < T.drop) return 'build';
    if (t < T.introEnd) return 'intro';
    return 'groove';
  }

  /* render one built-in track for a video plan T = { total, bpm, drop, fails, outro, introEnd } */
  async function renderTrack(id, T) {
    const tr = byId(id), bpm = tr.bpm, beat = 60 / bpm, bar = beat * 4;
    T = Object.assign({ fails: [], introEnd: 3 }, T, { barLen: bar });
    const total = T.total, oc = new OfflineAudioContext(2, Math.ceil(SR * (total + 1)), SR);
    const comp = oc.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3; comp.attack.value = 0.005; comp.release.value = 0.2;
    const master = oc.createGain(); master.gain.value = 0.9; master.connect(comp); comp.connect(oc.destination);
    /* fades: in at start, out at the end */
    master.gain.setValueAtTime(0.9, 0); master.gain.setValueAtTime(0.9, Math.max(0, total - 2.2)); master.gain.linearRampToValueAtTime(0.0001, total + 0.2);
    const K = kit(oc, master), sc = scale(tr.minor);
    const nBeats = Math.ceil((total + 0.5) / beat);
    let rng = 11; const r = () => { rng = (rng * 9301 + 49297) % 233280; return rng / 233280; };
    let lastRiser = -99;
    for (let b = 0; b < nBeats; b++) {
      const t = b * beat, barI = Math.floor(b / 4), bi = b % 4, sec = secAt(T, t + 0.001);
      const ch = chord(tr.root, tr.prog[barI % 4], tr.minor), first = bi === 0;
      const I = { intro: 0.45, groove: 0.8, build: 0.85, drop: 1, break: 0, outro: 0.5 }[sec];
      if (sec === 'build' && t - lastRiser > bar * 1.9 && T.drop - t <= bar * 2 + 0.01) { K.riser(t, T.drop - 0.02, 0.9); lastRiser = t; }
      if (sec === 'break') { if (first || b === 0) { } continue; }
      /* per-track patterns */
      if (tr.id === 'hype') {
        if (sec !== 'intro' || bi === 0) K.kick(t, sec === 'intro' ? 0.6 : 1);
        if (sec === 'drop' || sec === 'groove') { if (bi % 2 === 1) K.clap(t); K.hat(t + beat / 2, 0.9, sec === 'drop'); K.hat(t + beat * 0.25, 0.35); K.hat(t + beat * 0.75, 0.35); }
        if (sec === 'build') { const n = T.drop - t < bar ? 4 : 2; for (let k = 0; k < n; k++) K.snare(t + k * beat / n, 0.35 + 0.4 * ((t - (T.drop - bar * 2)) / (bar * 2))); }
        for (let k = 0; k < 2; k++) K.bass(t + k * beat / 2, ch[0] - 12 + (k ? 12 : 0), beat / 2.2, I);
        if (sec === 'drop' && (bi === 0 || bi === 2)) K.stab(t, ch, 1);
        const arp = [ch[0], ch[1], ch[2], ch[1] + 12]; for (let k = 0; k < 4; k++) if (sec !== 'intro' || k % 2 === 0) K.pluck(t + k * beat / 4, arp[k] + 12, beat / 3, 0.6 * I + 0.2, 'square');
        if (first) K.pad(t, ch.map(m => m + 12), bar * 0.98, sec === 'drop' ? 1 : 0.7);
      } else if (tr.id === 'boss') {
        if (bi === 0 || (sec === 'drop' && bi === 2) || (sec === 'drop' && r() < 0.25)) K.kick(t, 1);
        if (bi === 2 && sec !== 'intro') K.snare(t, 1);
        if (sec === 'drop' || sec === 'groove') { K.tom(t + beat * 0.5, 120, 0.5); if (bi === 3) { K.tom(t + beat * 0.5, 160, 0.6); K.tom(t + beat * 0.75, 140, 0.6); } K.hat(t, 0.5); K.hat(t + beat / 2, 0.4); }
        if (sec === 'build') for (let k = 0; k < 4; k++) K.tom(t + k * beat / 4, 110 + k * 25, 0.4 + k * 0.1);
        K.bass(t, ch[0] - 12, beat * 0.9, I, 'sawtooth'); if (sec === 'drop') K.bass(t + beat / 2, ch[0] - 12, beat * 0.4, 0.8);
        if (first) { K.pad(t, [ch[0], ch[1], ch[2], ch[0] + 12], bar * 0.98, 0.9); if (sec === 'drop') K.stab(t, ch, 1.2); }
        if (sec === 'drop' && bi === 0) K.lead(t, ch[2] + 12, beat * 1.5, 0.9);
      } else if (tr.id === 'night') {
        if (sec !== 'intro' && (bi === 0 || bi === 2.5)) K.kick(t, 0.8);
        if (sec === 'drop' || sec === 'groove') { if (bi === 2) K.snare(t, 0.6); K.shaker(t + beat / 2, 0.8); }
        if (sec === 'drop' && bi === 3) K.kick(t + beat / 2, 0.7);
        if (sec === 'build') for (let k = 0; k < 2; k++) K.snare(t + k * beat / 2, 0.3);
        const box = [ch[0] + 24, ch[2] + 12, ch[1] + 24, ch[2] + 12]; for (let k = 0; k < 2; k++) K.bell(t + k * beat / 2, box[(bi * 2 + k) % 4], beat * 0.9, 0.9);
        if (first) { K.sub(t, ch[0] - 12, bar * 0.95, I); K.pad(t, ch, bar, 0.6); }
      } else if (tr.id === 'comedy') {
        K.bass(t, (bi % 2 ? ch[2] : ch[0]) - 12, beat * 0.35, 0.9, 'triangle');
        if (sec !== 'intro') { K.hat(t + beat / 2, 0.6); if (bi % 2 === 1) K.snare(t, 0.5); if (bi % 2 === 0) K.kick(t, 0.7); }
        K.wood(t + beat * 0.75, 0.6);
        const mel = [0, 2, 4, 2, 4, 5, 4, 2]; for (let k = 0; k < 2; k++) { const deg = mel[(barI * 4 + bi * 2 + k) % 8]; K.pluck(t + k * beat / 2, tr.root + 24 + sc[deg % 7], beat * 0.3, 0.7 * I + 0.2, 'triangle'); }
        if (sec === 'drop' && bi === 0) K.stab(t, ch, 0.7);
        if (sec === 'build') K.wood(t + beat / 4, 0.7);
      } else if (tr.id === 'lofi') {
        const sw = beat * 0.58;
        if (bi === 0 || (bi === 2 && sec !== 'intro')) K.kick(t, 0.6);
        if (bi === 1 || bi === 3) K.snare(t, 0.35);
        K.hat(t, 0.35); K.hat(t + sw, 0.25);
        if (first) { const ms = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[0] + 23]; for (const m of ms) K.osc(t, 'sine', mtof(m), bar * 0.9, 0.05, 0.05); K.sub(t, ch[0] - 12, bar * 0.9, 0.8); }
        if (sec === 'drop' && (bi === 1 || bi === 3)) K.bell(t + sw, ch[2] + 24, beat, 0.6);
        K.noise(t, beat, 'bandpass', 3500, 0.3, 0.01);
      } else if (tr.id === 'dhol') {
        const pat = [1, 0, 0, 1, 0, 1, 1, 0];
        for (let k = 0; k < 2; k++) { const s2 = (bi * 2 + k) % 8; if (pat[s2]) K.dhol(t + k * beat / 2, true, I); else K.dhol(t + k * beat / 2, false, 0.7 * I + 0.2); }
        if (sec === 'drop') { K.kick(t, 1); if (bi % 2) K.clap(t); }
        if (sec === 'build') for (let k = 0; k < 4; k++) K.dhol(t + k * beat / 4, false, 0.5 + k * 0.1);
        K.bass(t, ch[0] - 12, beat * 0.45, I * 0.8);
        if (sec !== 'intro' && (bi === 0 || bi === 2)) { const deg = [4, 5, 4, 2, 4, 7, 5, 4][(barI * 2 + bi / 2) % 8]; K.lead(t, tr.root + 24 + (sc[deg % 7] || 0) + (deg >= 7 ? 12 : 0), beat * 1.8, sec === 'drop' ? 1 : 0.7); }
        if (first) K.pad(t, ch.map(m => m + 12), bar, 0.5);
      }
    }
    /* drop hit, fail stabs, outro chord */
    if (T.drop != null) K.impact(T.drop, 1);
    for (const f of T.fails || []) K.downer(f, 1);
    const och = chord(tr.root, tr.prog[0], tr.minor); K.pad(T.outro, och.map(m => m + 12), total - T.outro + 0.3, 0.9);
    return await oc.startRendering();
  }

  /* studio sound effects: whoosh on every cut, logo sting, caption ticks, outro ding */
  async function renderSfx(T) {
    const oc = new OfflineAudioContext(2, Math.ceil(SR * (T.total + 1)), SR), out = oc.createGain(); out.gain.value = 0.8; out.connect(oc.destination);
    const K = kit(oc, out);
    for (const c of T.cuts || []) { K.noise(Math.max(0, c - 0.18), 0.28, 'bandpass', 500, 1.1, 0.35, 5000); }
    if (T.logo != null) { const t = T.logo; K.noise(t, 0.25, 'highpass', 3000, 0.8, 0.5); K.osc(t, 'square', 2600, 0.12, 0.08, 0.002, 400); K.impact(t + 0.05, 0.55); K.osc(t + 0.12, 'sine', 880, 0.6, 0.12, 0.01); K.osc(t + 0.12, 'sine', 1320, 0.6, 0.08, 0.01); }
    for (const p of T.pops || []) K.osc(p, 'sine', 1400, 0.06, 0.07, 0.001, 900);
    for (const s of T.stamps || []) { K.impact(s, 0.4); K.noise(s, 0.12, 'bandpass', 2400, 1, 0.3); }
    if (T.ding != null) { for (const [m, d] of [[76, 0], [83, 0.12], [88, 0.24]]) K.bell(T.ding + d, m, 1.2, 1.1); }
    return await oc.startRendering();
  }

  /* ============ YOUR OWN SONG: tempo, bars, drop (same method as the Beat Sanx Studio) ============ */
  async function renderMono(buf, sr, lp) {
    const len = Math.ceil(buf.duration * sr), oc = new OfflineAudioContext(1, len, sr), src = oc.createBufferSource(); src.buffer = buf;
    if (lp) { const f = oc.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; f.Q.value = 0.7; src.connect(f); f.connect(oc.destination); } else src.connect(oc.destination);
    src.start(); return (await oc.startRendering()).getChannelData(0);
  }
  function envelope(d, hop) { const n = Math.floor(d.length / hop), e = new Float32Array(n); for (let i = 0; i < n; i++) { let s2 = 0; for (let j = 0; j < hop; j++) { const v = d[i * hop + j]; s2 += v * v; } e[i] = Math.log(1e-6 + Math.sqrt(s2 / hop)); } return e; }
  function flux(e) { const o = new Float32Array(e.length); for (let i = 1; i < e.length; i++) o[i] = Math.max(0, e[i] - e[i - 1]); let m = 0; for (const v of o) m = Math.max(m, v); if (m) for (let i = 0; i < o.length; i++) o[i] /= m; return o; }
  async function analyze(file, ctx) {
    const buf = await ctx.decodeAudioData(await file.arrayBuffer());
    const sr = 11025, hop = 110, fps = sr / hop;
    const full = await renderMono(buf, sr), low = await renderMono(buf, sr, 160);
    const oF = flux(envelope(full, hop)), oL = flux(envelope(low, hop)), n = oF.length, o = new Float32Array(n);
    for (let i = 0; i < n; i++) o[i] = oF[i] + 1.4 * oL[i];
    const at = tt => { const f = tt * fps, i = Math.floor(f), k = f - i; return i >= 0 && i + 1 < n ? o[i] * (1 - k) + o[i + 1] * k : 0; };
    const A0 = Math.floor(n * 0.1), A1 = Math.min(n, A0 + Math.floor(fps * 90));
    let bestB = 110, bestS = -1;
    for (let bpm = 70; bpm <= 180; bpm += 0.5) { const lag = 60 / bpm * fps; let s2 = 0; for (let i = A0; i + lag * 2 < A1; i++) { const j = i + lag, j0 = Math.floor(j), k = j - j0; s2 += o[i] * (o[j0] * (1 - k) + o[j0 + 1] * k); } s2 *= Math.exp(-Math.pow(Math.log2(bpm / 118), 2) * 1.6); if (s2 > bestS) { bestS = s2; bestB = bpm; } }
    let bpm = bestB, phase = 0, best = -1;
    for (let b2 = bestB - 1.2; b2 <= bestB + 1.2; b2 += 0.04) { const P = 60 / b2, beats = Math.floor((buf.duration - 1) / P); for (let ph = 0; ph < P; ph += P / 32) { let s2 = 0; for (let k = 0; k < beats; k++) s2 += at(ph + k * P); if (s2 > best) { best = s2; bpm = b2; phase = ph; } } }
    const P = 60 / bpm, nb = Math.floor((buf.duration - phase) / P);
    const atL = tt => { const i = Math.round(tt * fps); return i >= 0 && i < n ? oL[i] : 0; };
    let db = 0, dbS = -1; for (let j = 0; j < 4; j++) { let s2 = 0; for (let k = j; k < nb; k += 4) s2 += atL(phase + k * P); if (s2 > dbS) { dbS = s2; db = j; } }
    const bar0 = phase + db * P, barLen = P * 4, nbar = Math.floor((buf.duration - bar0) / barLen);
    const rmsAt = (a, b) => { const i0 = Math.max(0, Math.floor(a * sr)), i1 = Math.min(full.length, Math.floor(b * sr)); let s2 = 0; for (let i = i0; i < i1; i += 4) s2 += full[i] * full[i]; return Math.sqrt(s2 / Math.max(1, (i1 - i0) / 4)); };
    const bars = []; for (let k = 0; k < nbar; k++) bars.push(rmsAt(bar0 + k * barLen, bar0 + (k + 1) * barLen));
    const mean = (a, b) => { let s2 = 0, c = 0; for (let k = Math.max(0, a); k < Math.min(bars.length, b); k++) { s2 += bars[k]; c++; } return c ? s2 / c : 0; };
    const maxBar = Math.max(...bars, 1e-6), drops = [];
    for (let k = 2; k < bars.length - 2; k++) { const after = mean(k, k + 4), before = mean(k - 4, k); drops.push({ t: bar0 + k * barLen, sc: (after - before) / maxBar + 0.6 * after / maxBar, k }); }
    drops.sort((a, b) => b.sc - a.sc);
    const top = []; for (const d of drops) { if (top.every(q => Math.abs(q.k - d.k) >= 8)) top.push(d); if (top.length >= 4) break; }
    return { buffer: buf, bpm: Math.round(bpm * 10) / 10, bar0, barLen, bars, drops: top.map(d => d.t), secs: buf.duration, name: file.name };
  }
  /* re-cut the song on its own bar lines so its drop lands on the video's climax */
  function planSong(m, T) {
    if (!m || !m.bars || m.bars.length < 4) return [{ v0: 0, v1: T.total + 0.3, song: 0 }];
    const L = m.barLen, nb = m.bars.length, mx = Math.max(...m.bars, 1e-6), lvl = k => m.bars[k] / mx;
    const dT = m.drops.length ? m.drops[0] : m.bar0 + L * 4;
    let sd = Math.max(0, Math.min(nb - 1, Math.round((dT - m.bar0) / L)));
    const run = []; for (let k = sd; k < nb && run.length < 24 && (run.length < 4 || lvl(k) >= 0.42); k++) run.push(k);
    const pre = []; for (let k = Math.max(0, sd - 8); k < sd; k++) pre.push(k);
    const tD = T.drop != null ? T.drop : T.total * 0.6, segs = [];
    const jmin = -Math.ceil(tD / L - 1e-6), jmax = Math.ceil((T.total + 0.3 - tD) / L);
    for (let j = jmin; j < jmax; j++) {
      const s0 = tD + j * L, v0 = Math.max(0, s0), v1 = Math.min(T.total + 0.3, s0 + L); if (v1 <= v0) continue;
      let k; if (j >= 0) k = run[j % run.length]; else if (sd + j >= 0) k = sd + j; else k = pre.length ? pre[((pre.length + (j % pre.length)) % pre.length)] : run[0];
      segs.push({ v0, v1, song: Math.max(0, m.bar0 + k * L + (v0 - s0)) });
    }
    for (const tf of (T.fails || [])) { const i = segs.findIndex(s => tf >= s.v0 && tf < s.v1 && !s.mute); if (i < 0) continue; const s = segs[i], cut = { v0: tf, v1: s.v1, song: s.song + (tf - s.v0), mute: true }; s.v1 = tf; segs.splice(i + 1, 0, cut); }
    return segs;
  }
  async function renderSong(m, T) {
    const oc = new OfflineAudioContext(2, Math.ceil(SR * (T.total + 1)), SR), out = oc.createGain(); out.connect(oc.destination);
    out.gain.setValueAtTime(1, 0); out.gain.setValueAtTime(1, Math.max(0, T.total - 2.2)); out.gain.linearRampToValueAtTime(0.0001, T.total + 0.2);
    for (const s of planSong(m, T)) {
      if (s.mute) continue;
      const src = oc.createBufferSource(); src.buffer = m.buffer; const g = oc.createGain(), d = s.v1 - s.v0, f = 0.012;
      g.gain.setValueAtTime(0, s.v0); g.gain.linearRampToValueAtTime(1, s.v0 + f); g.gain.setValueAtTime(1, Math.max(s.v0 + f, s.v1 - f)); g.gain.linearRampToValueAtTime(0, s.v1);
      src.connect(g); g.connect(out); src.start(s.v0, Math.min(m.buffer.duration - 0.05, s.song), d + 0.02);
    }
    return await oc.startRendering();
  }

  return { TRACKS, byId, renderTrack, renderSfx, analyze, renderSong, SR };
})();

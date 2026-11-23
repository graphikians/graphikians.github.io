/* ================= BEAT SANX — sound + haptics =================
   Pure WebAudio synth (no audio files). Every tile has its own note
   from a pentatonic scale, so any sequence sounds like a melody. */
'use strict';
const SND = (() => {
  let ctx = null, master = null, sfxBus = null, musicGain = null, musicTimer = null, musicOn = false;
  const NOTES = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99]; // C D E G A C D E G
  /* 25 notes for bigger grids: pentatonic going down and up from the 9 base notes */
  const NOTE = i => { const PENT = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3]; const k = i < 9 ? i : i - 9; if (i < 9) return NOTES[i]; const o = Math.floor(k / 5), d = k % 5; return i < 17 ? 130.81 * PENT[d] * Math.pow(2, o % 2) : 1046.5 * PENT[d] * (k >= 13 ? 1.12 : 1); };
  let force = false;   // clip recording: always audible
  const vol = (k, d) => { try { const v = S.st.set[k]; return v == null ? d : v; } catch (e) { return d; } };
  const opt = () => force ? { sfx: true, music: true, vib: false } : ((typeof S !== 'undefined') && S.st) ? S.st.set : { sfx: true, music: true, vib: true };

  function ac() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
      ctx = new C(); master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
      sfxBus = ctx.createGain(); sfxBus.gain.value = vol('sfxVol', 1); sfxBus.connect(master);
      musicGain = ctx.createGain(); musicGain.gain.value = 0.0; musicGain.connect(master);
      /* v1.5: phones suspend audio after ads / app switch -> wake it up again */
      document.addEventListener('visibilitychange', () => { if (!document.hidden && ctx && ctx.state !== 'running') ctx.resume().catch(() => { }); });
      ['pointerdown', 'touchstart'].forEach(e => document.addEventListener(e, () => { if (ctx && ctx.state !== 'running') ctx.resume().catch(() => { }); }, { passive: true }));
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => { });
    return ctx;
  }
  function tone(f, t0, dur, { type = 'sine', vol = 0.25, attack = 0.008, release = 0.18, to = null, dest = null, lp = 0, detune = 0 } = {}) {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0); if (detune) o.detune.value = detune; if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + release);
    let node = o;
    if (lp) { const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; o.connect(fl); node = fl; }
    node.connect(g); g.connect(dest || sfxBus || master); o.start(t0); o.stop(t0 + dur + release + 0.05);
  }
  let noiseBuf = null;
  function noise(t0, dur, { vol = 0.2, hp = 800, lp2 = 0 } = {}) {
    const c = ac(); if (!c) return;
    if (!noiseBuf) { noiseBuf = c.createBuffer(1, c.sampleRate * 1, c.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = c.createBufferSource(); s.buffer = noiseBuf;
    const f = c.createBiquadFilter(); f.type = lp2 ? 'lowpass' : 'highpass'; f.frequency.value = lp2 || hp;
    const g = c.createGain(); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(sfxBus || master); s.start(t0); s.stop(t0 + dur + 0.05);
  }
  /* sound packs (shop): how one tile sounds */
  const PACKS = {
    synth: (f, t, d) => { tone(f, t, d, { type: 'triangle', vol: 0.32 }); tone(f * 2, t, d * 0.6, { type: 'sine', vol: 0.08 }); },
    piano: (f, t, d) => { tone(f, t, d, { vol: 0.3, release: 0.5 }); tone(f * 2, t, d, { vol: 0.1, release: 0.35 }); tone(f * 3, t, d * .5, { vol: 0.05, release: 0.25 }); },
    marimba: (f, t) => { tone(f, t, 0.05, { vol: 0.34, release: 0.3 }); tone(f * 4, t, 0.02, { vol: 0.06, release: 0.08 }); },
    '8bit': (f, t, d) => { tone(f, t, Math.min(d, .18), { type: 'square', vol: 0.11, release: 0.05 }); tone(f * 2, t + 0.04, 0.06, { type: 'square', vol: 0.05, release: 0.03 }); },
    musicbox: (f, t) => { tone(f * 2, t, 0.04, { vol: 0.22, release: 0.7 }); tone(f * 6, t, 0.02, { vol: 0.03, release: 0.3 }); },
    drums: (f, t, d, i) => { const k = i % 4; if (k === 0) tone(150, t, 0.12, { vol: 0.5, to: 45, release: 0.1 }); else if (k === 1) { noise(t, 0.16, { vol: 0.28, hp: 1500 }); tone(220, t, 0.05, { type: 'triangle', vol: 0.15 }); } else if (k === 2) tone(f / 2, t, 0.14, { vol: 0.4, to: f / 4, release: 0.12 }); else noise(t, 0.05, { vol: 0.18, hp: 6000 }); },
    tabla: (f, t, d, i) => { if (i % 2) tone(f / 2, t, 0.1, { vol: 0.42, to: f * 0.75, release: 0.25 }); else { tone(f, t, 0.04, { vol: 0.3, release: 0.15 }); tone(f * 2.4, t, 0.02, { vol: 0.08, release: 0.08 }); } },
    orchestra: (f, t, d) => { tone(f, t, d, { type: 'sawtooth', vol: 0.12, attack: 0.04, release: 0.35, lp: 1800 }); tone(f / 2, t, d, { type: 'sawtooth', vol: 0.08, attack: 0.05, release: 0.35, lp: 900 }); },
    synthwave: (f, t, d) => { tone(f, t, d, { type: 'sawtooth', vol: 0.1, release: 0.3, lp: 2400, detune: -8 }); tone(f, t, d, { type: 'sawtooth', vol: 0.1, release: 0.3, lp: 2400, detune: 8 }); tone(f / 2, t, d, { type: 'square', vol: 0.05, lp: 700 }); },
    glass: (f, t) => { tone(f * 2, t, 0.05, { vol: 0.22, release: 1.0 }); tone(f * 5.4, t, 0.03, { vol: 0.04, release: 0.6 }); },
    storm: (f, t, d) => { noise(t, 0.35, { vol: 0.16, lp2: 600 }); tone(f / 2, t, d, { type: 'triangle', vol: 0.26, release: 0.3 }); }
  };
  const packNow = () => { try { return ((typeof S !== 'undefined') && S.active) ? S.active('sound') : 'synth'; } catch (e) { return 'synth'; } };
  /* if the audio was asleep, play the sound right after it wakes up (no more missing tile notes) */
  const sfx = fn => { if (!opt().sfx) return; const c = ac(); if (!c) return; if (c.state !== 'running') { c.resume().then(() => fn(c.currentTime + 0.01)).catch(() => { }); return; } fn(c.currentTime); };
  /* the groove ducks under every tile note so the tile is always clear */
  const BEAT_LEVEL = () => 0.42 * vol('musicVol', 0.7);
  const duck = () => { if (!B.gain || !ctx) return; const g = B.gain.gain, t = ctx.currentTime; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(BEAT_LEVEL() * 0.3, t + 0.02); g.linearRampToValueAtTime(BEAT_LEVEL(), t + 0.38); };

  const api = {
    unlock() { ac(); },
    tile(i, dur = 0.28, pack) { dur = Math.max(0.22, dur); duck(); sfx(t => { const f = NOTE(i % 25); (PACKS[pack || packNow()] || PACKS.synth)(f, t, dur, i); }); },
    preview(pack) { sfx(t => [0, 2, 4, 7].forEach((n, k) => (PACKS[pack] || PACKS.synth)(NOTE(n), t + k * 0.2, 0.18, n))); },
    tap(i) { api.tile(i, 0.22); },
    setVol() { if (sfxBus) sfxBus.gain.value = vol('sfxVol', 1); if (B.gain) B.gain.gain.value = BEAT_LEVEL(); },
    wrong() { sfx(t => { tone(220, t, 0.28, { type: 'sawtooth', vol: 0.16, to: 90 }); tone(160, t + 0.05, 0.3, { type: 'square', vol: 0.07, to: 70 }); }); },
    decoy() { sfx(t => tone(140, t, 0.08, { type: 'square', vol: 0.05 })); },
    step() { sfx(t => { tone(783.99, t, 0.08, { vol: 0.12 }); tone(1046.5, t + 0.07, 0.12, { vol: 0.12 }); }); },
    level() { sfx(t => [523.25, 659.25, 783.99, 1046.5].forEach((f, k) => tone(f, t + k * 0.09, 0.18, { type: 'triangle', vol: 0.22 }))); },
    boss() { sfx(t => { tone(70, t, 0.5, { type: 'sine', vol: 0.5, to: 40 }); tone(140, t, 0.25, { type: 'sawtooth', vol: 0.08, to: 60 }); tone(70, t + 0.45, 0.5, { type: 'sine', vol: 0.45, to: 40 }); }); },
    coin() { sfx(t => { tone(1318.5, t, 0.06, { vol: 0.12 }); tone(1975.5, t + 0.06, 0.12, { vol: 0.1 }); }); },
    click() { sfx(t => tone(660, t, 0.04, { type: 'triangle', vol: 0.1 })); },
    win() { sfx(t => [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, k) => { tone(f, t + k * 0.11, 0.25, { type: 'triangle', vol: 0.22 }); tone(f / 2, t + k * 0.11, 0.25, { vol: 0.1 }); })); },
    lose() { sfx(t => [392, 349.23, 311.13, 261.63].forEach((f, k) => tone(f, t + k * 0.16, 0.22, { type: 'triangle', vol: 0.2 }))); },
    tick() { sfx(t => tone(1200, t, 0.03, { type: 'square', vol: 0.05 })); },
    spin() { sfx(t => tone(900 + Math.random() * 300, t, 0.03, { type: 'triangle', vol: 0.06 })); },
    combo(n) { sfx(t => tone(600 + Math.min(n, 30) * 25, t, 0.06, { type: 'sine', vol: 0.1 })); },

    music(on) {
      musicOn = on && opt().music; const c = ac(); if (!c) return;
      musicGain.gain.cancelScheduledValues(c.currentTime);
      musicGain.gain.linearRampToValueAtTime(musicOn ? 0.22 : 0.0, c.currentTime + 0.8);
      if (musicOn && !musicTimer) {
        const prog = [[0, 2, 4], [5, 7, 2], [3, 5, 0], [4, 6, 1]]; let bar = 0;
        const play = () => {
          if (!musicOn) { clearInterval(musicTimer); musicTimer = null; return; }
          const t = c.currentTime + 0.05, ch = prog[bar % 4];
          ch.forEach(n => tone(NOTES[n] / 2, t, 1.9, { type: 'sine', vol: 0.06, attack: 0.4, release: 0.6, dest: musicGain }));
          for (let k = 0; k < 8; k++) tone(NOTES[(ch[k % 3] + (k % 2 ? 2 : 0)) % 9], t + k * 0.25, 0.12, { type: 'triangle', vol: 0.035, dest: musicGain });
          bar++;
        };
        play(); musicTimer = setInterval(play, 2000);
      }
    },
    vib(ms) { if (opt().vib && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) { } } }
  };

  /* ================= BEAT ENGINE (v1.4) =================
     A drum + bass groove that runs under every level. The pattern flashes land ON the beat,
     taps that land on the beat count as "on beat", a mistake drops the beat for a moment,
     a level clear plays a fill. The clock keeps running silently when Music is off,
     so the game timing is the same for everybody. */
  const B = { on: false, bpm: 100, t0: 0, step: 0, next: 0, timer: null, mode: 'full', gain: null, dropUntil: 0, fill: false, onKick: null, onBeat: null, bar: 0 };
  const ROOTS = [0, 5, 3, 4];                     // C  A  G  ->  scale degrees of NOTES (C D E G A ...)
  const bGain = () => { const c = ac(); if (!c) return null; if (!B.gain) { B.gain = c.createGain(); B.gain.gain.value = BEAT_LEVEL(); B.gain.connect(master); } return B.gain; };
  const kick = (t, v = 0.9) => { const c = ac(), o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32); o.connect(g); g.connect(bGain()); o.start(t); o.stop(t + 0.35); };
  const hat = (t, v = 0.07, open = false) => { const c = ac(); if (!noiseBuf) noise(t, 0.001, { vol: 0.0001 }); const s = c.createBufferSource(); s.buffer = noiseBuf; const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000; const g = c.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + (open ? 0.22 : 0.05)); s.connect(f); f.connect(g); g.connect(bGain()); s.start(t); s.stop(t + 0.3); };
  const clap = (t, v = 0.22) => { const c = ac(); if (!noiseBuf) noise(t, 0.001, { vol: 0.0001 }); [0, 0.012, 0.024].forEach(d => { const s = c.createBufferSource(); s.buffer = noiseBuf; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1500; f.Q.value = 0.8; const g = c.createGain(); g.gain.setValueAtTime(v, t + d); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.14); s.connect(f); f.connect(g); g.connect(bGain()); s.start(t + d); s.stop(t + d + 0.2); }); };
  const bass = (t, f, d) => { tone(f, t, d, { type: 'sawtooth', vol: 0.11, release: 0.08, lp: 420, dest: bGain() }); tone(f, t, d, { type: 'sine', vol: 0.16, release: 0.08, dest: bGain() }); };
  const pad = (t, d, deg) => [0, 2, 4].forEach(k => tone(NOTES[(deg + k) % 9] / 2, t, d, { type: 'triangle', vol: 0.025, attack: 0.3, release: 0.5, dest: bGain() }));
  function schedStep(st, t) {
    const audible = opt().music && t >= B.dropUntil;
    const s = st % 16, bar = Math.floor(st / 16), deg = ROOTS[bar % 4], root = NOTES[deg] / 4;
    if (s % 4 === 0) { const ms = Math.max(0, (t - ctx.currentTime) * 1000); setTimeout(() => { if (B.on && B.onBeat) B.onBeat(s === 0); if (B.on && B.onKick && audible && B.mode !== 'still') B.onKick(); }, ms); }
    if (!audible || B.mode === 'still') return;
    const full = B.mode === 'full', hype = B.mode === 'hype';
    if (B.fill && bar === B.fillBar) {                       // level-clear fill: snare roll + crash on the next bar
      if (s >= 8) clap(t, 0.08 + (s - 8) * 0.02); if (s === 0) kick(t); return;
    }
    if (s === 0 || s === 8 || ((full || hype) && s === 10) || (hype && (s === 4 || s === 12))) kick(t, s === 0 ? 0.95 : 0.75);
    if ((full || hype) && (s === 4 || s === 12)) clap(t, hype ? 0.26 : 0.2);
    if (s % 2 === 0) hat(t, s % 4 === 2 ? 0.08 : 0.045, s === 14 && full);
    else if (hype) hat(t, 0.03);
    if (full || hype) { if (s === 0 || s === 6 || s === 8 || s === 11) bass(t, s === 11 ? root * 1.5 : root, 60 / B.bpm * 0.4); }
    if (s === 0 && B.mode !== 'light') pad(t, 60 / B.bpm * 4, deg);
  }
  function tick() {
    if (!B.on || !ctx) return;
    const sp = 60 / B.bpm / 4;                               // one 16th note
    while (B.next < ctx.currentTime + 0.12) { schedStep(B.step, B.next); B.step++; B.next += sp; }
  }
  const beat = {
    start(bpm = 100, mode = 'full') {
      const c = ac(); if (!c) return;
      B.bpm = bpm; B.mode = mode; B.fill = false;
      if (B.on) return;
      B.on = true; B.step = 0; B.t0 = c.currentTime + 0.06; B.next = B.t0;
      if (B.gain) { B.gain.gain.cancelScheduledValues(c.currentTime); B.gain.gain.setValueAtTime(BEAT_LEVEL(), c.currentTime); }
      clearInterval(B.timer); B.timer = setInterval(tick, 25); tick();
    },
    /* change tempo without losing the groove: re-anchor the clock on the next 16th */
    tempo(bpm) { if (!B.on || !ctx || bpm === B.bpm) { B.bpm = bpm; return; } const t = B.next; B.bpm = bpm; B.t0 = t; B.step = 0; B.next = t; },
    mode(m) { if (!B.locked) B.mode = m; },
    lock(on) { B.locked = !!on; if (on) B.mode = 'still'; },
    stop(slow) {
      if (!B.on) return; B.on = false; clearInterval(B.timer); B.timer = null;
      if (slow && ctx && opt().music) { tone(160, ctx.currentTime, 0.6, { type: 'sawtooth', vol: 0.1, to: 30, lp: 600 }); }
    },
    pause() { if (B.on) { B.paused = true; beat.stop(); } },
    resume() { if (B.paused) { B.paused = false; beat.start(B.bpm, B.mode); } },
    /* a mistake: the music cuts out for one bar (silence hurts) */
    drop() { if (!B.on || !ctx) return; B.dropUntil = ctx.currentTime + 60 / B.bpm * 2; if (opt().music) tone(110, ctx.currentTime, 0.35, { type: 'square', vol: 0.06, to: 55, lp: 500 }); },
    /* level clear: drum fill at the end of the current bar */
    fill() { if (!B.on) return; B.fill = true; B.fillBar = Math.floor(B.step / 16); setTimeout(() => { B.fill = false; }, 60 / B.bpm * 4000 + 200); },
    get on() { return B.on; }, get bpm() { return B.bpm; },
    set onKick(f) { B.onKick = f; }, set onBeat(f) { B.onBeat = f; },
    beatMs() { return 60000 / B.bpm; },
    /* ms until the next grid line (div 1 = beat, 2 = 8th, 4 = 16th) */
    untilNext(div = 1) {
      if (!B.on || !ctx) return 0;
      const len = 60 / B.bpm / div, now = ctx.currentTime + 0.03, k = Math.ceil((now - B.t0) / len);
      return Math.max(0, (B.t0 + k * len - ctx.currentTime) * 1000);
    },
    /* how far (seconds) the current moment is from the nearest grid line */
    err(div = 2) {
      if (!B.on || !ctx) return 1;
      const len = 60 / B.bpm / div, x = (ctx.currentTime - B.t0) / len, d = x - Math.round(x);
      return Math.abs(d * len);
    }
  };
  api.beat = beat;
  Object.defineProperty(beat, 't0', { get: () => B.t0 });
  /* v1.4 clip recorder: route the whole mix into a MediaStream as well */
  let recDest = null;
  api.now = () => (ac() ? ctx.currentTime : 0);
  api.ctx = () => ac();
  api.masterNode = () => { ac(); return master; };
  /* play an uploaded music file (Studio) through the main mix so it is recorded too */
  api.playBuffer = (buf, when = 0, offset = 0, vol = 0.8) => { const c = ac(); if (!c || !buf) return null; const s = c.createBufferSource(), g = c.createGain(); s.buffer = buf; g.gain.value = vol; s.connect(g); g.connect(master); s.start(Math.max(c.currentTime, when), offset); return { stop: () => { try { s.stop(); } catch (e) { } }, gain: g }; };
  api.sfxVol = v => { ac(); if (sfxBus) sfxBus.gain.value = v; };
  api.rec = on => {
    const c = ac(); if (!c) return null;
    if (on) { force = true; recDest = recDest || c.createMediaStreamDestination(); master.connect(recDest); return recDest.stream; }
    force = false; if (recDest) { try { master.disconnect(recDest); } catch (e) { } } return null;
  };
  api.crash = () => sfx(t => { noise(t, 1.1, { vol: 0.18, hp: 4000 }); tone(1046.5, t, 0.25, { type: 'triangle', vol: 0.12 }); tone(1568, t + 0.05, 0.3, { type: 'triangle', vol: 0.08 }); });
  api.perfect = () => sfx(t => [1046.5, 1318.5, 1568, 2093].forEach((f, k) => tone(f, t + k * 0.05, 0.1, { type: 'sine', vol: 0.09 })));
  api.whoosh = () => sfx(t => noise(t, 0.35, { vol: 0.12, lp2: 2400 }));
  ['pointerdown', 'touchstart', 'keydown'].forEach(ev => window.addEventListener(ev, () => ac(), { once: true, passive: true }));
  return api;
})();

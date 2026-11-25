/* ================= MACHHAR MAARO · ROUND 7 · NAYI AWAAZ + MUSIC =================
   Har awaaz ab kai tukdon se banti hai (chatak + dhamak + khanak + goonj). Machhar ki bhin-bhin waisi hi.
   Halka desi background music (menu shaant, khel mein josh) · alag on/off button 🎵
================================================================================= */
const AU = {
  rv: null, rvIn: null,
  ok() { if (!AC || muted) return false; if (!this.rv) this.init(); return true; },
  init() {
    try {
      const len = AC.sampleRate * 1.8, b = AC.createBuffer(2, len, AC.sampleRate);
      for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
      this.rv = AC.createConvolver(); this.rv.buffer = b; const g = AC.createGain(); g.gain.value = 0.32; this.rv.connect(g); g.connect(master); this.rvIn = this.rv;
    } catch (e) { this.rv = null; }
  },
  out(node, wet = 0) { node.connect(master); if (wet && this.rvIn) { const s = AC.createGain(); s.gain.value = wet; node.connect(s); s.connect(this.rvIn); } },
  osc(type, f1, f2, dur, vol, delay = 0, a = 0.004, wet = 0, filt) {
    if (!this.ok()) return; const t = AC.currentTime + delay, o = AC.createOscillator(), g = AC.createGain(); o.type = type;
    o.frequency.setValueAtTime(f1, t); if (f2 !== f1) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let n = o; if (filt) { const f = AC.createBiquadFilter(); f.type = filt[0]; f.frequency.setValueAtTime(filt[1], t); if (filt[2]) f.frequency.exponentialRampToValueAtTime(filt[2], t + dur); f.Q.value = filt[3] || 0.8; o.connect(f); n = f; }
    n.connect(g); this.out(g, wet); o.start(t); o.stop(t + dur + 0.05);
  },
  nz(dur, vol, type, f1, f2, delay = 0, a = 0.002, q = 0.8, wet = 0) {
    if (!this.ok()) return; const t = AC.currentTime + delay, s = AC.createBufferSource(); s.buffer = noiseBuf;
    const f = AC.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(f1, t); if (f2) f.frequency.exponentialRampToValueAtTime(f2, t + dur); f.Q.value = q;
    const g = AC.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); this.out(g, wet); s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05);
  },
  bell(f, dur, vol, delay = 0, wet = 0.35) { [[1, 1], [2.01, 0.45], [2.76, 0.3], [5.4, 0.12]].forEach(([m, v], i) => this.osc('sine', f * m, f * m, dur * (1 - i * 0.18), vol * v, delay, 0.002, wet)); },
  pluck(f, dur, vol, delay = 0, wet = 0.2) { this.osc('triangle', f, f, dur, vol, delay, 0.003, wet); this.osc('sawtooth', f, f * 0.995, dur * 0.6, vol * 0.35, delay, 0.002, wet, ['lowpass', f * 6, f * 1.2, 1]); },
  thump(f1, f2, dur, vol, delay = 0) { this.osc('sine', f1, f2, dur, vol, delay, 0.002); }
};
const PENTA = [261.6, 293.7, 329.6, 392, 440, 523.3, 587.3, 659.3, 784, 880, 1046.5, 1174.7, 1318.5, 1568];
Object.assign(sfx, {
  zap() { AU.nz(0.05, 0.28, 'highpass', 5200, 0, 0); AU.nz(0.07, 0.22, 'bandpass', 3200, 1600, 0.03, 0.002, 2); AU.osc('square', 3400, 700, 0.09, 0.06, 0); AU.thump(140, 60, 0.08, 0.18, 0); },
  miss() { AU.nz(0.12, 0.07, 'bandpass', 2400, 700, 0, 0.01, 1.4); },
  kill(c = 0) { const n = PENTA[Math.min(PENTA.length - 1, 4 + (c | 0))]; AU.osc('sine', 1100, 180, 0.07, 0.16, 0); AU.nz(0.05, 0.12, 'highpass', 4000, 0, 0); AU.pluck(n, 0.22, 0.11, 0.015); if (c >= 5) AU.bell(n * 2, 0.35, 0.04, 0.05); },
  crack() { AU.nz(0.06, 0.2, 'bandpass', 2600, 900, 0, 0.002, 3); AU.osc('square', 900, 300, 0.07, 0.06); },
  block() { AU.osc('square', 220, 180, 0.12, 0.1, 0, 0.002, 0.1, ['lowpass', 1200, 600]); AU.nz(0.08, 0.15, 'bandpass', 900, 0, 0, 0.002, 2); },
  mega() { AU.thump(130, 32, 0.7, 0.75, 0); AU.nz(0.8, 0.5, 'lowpass', 3000, 200, 0, 0.005, 0.7, 0.3); AU.osc('sawtooth', 160, 1900, 0.45, 0.1, 0, 0.01, 0.2, ['lowpass', 800, 5000]); AU.bell(1046, 0.8, 0.07, 0.12, 0.5); },
  bite() { AU.nz(0.16, 0.12, 'bandpass', 1400, 400, 0, 0.01, 4); AU.osc('sine', 260, 150, 0.12, 0.1, 0.03); },
  noise() { AU.osc('square', 500, 300, 0.1, 0.05); },
  whoosh() { AU.nz(0.45, 0.2, 'bandpass', 500, 2600, 0, 0.18, 1.6, 0.25); },
  heart(v = 1) { AU.thump(80, 42, 0.18, 0.55 * v, 0); AU.nz(0.1, 0.12 * v, 'lowpass', 300, 0, 0); AU.thump(72, 38, 0.2, 0.42 * v, 0.2); },
  tick() { AU.osc('square', 2400, 2400, 0.02, 0.04); },
  ui() { AU.osc('sine', 1600, 2400, 0.05, 0.05, 0, 0.002, 0.15); AU.osc('triangle', 800, 800, 0.04, 0.03); },
  clear() { [0, 2, 4, 5, 7].forEach((k, i) => AU.pluck(PENTA[k + 3], 0.32, 0.12, i * 0.085)); AU.thump(110, 50, 0.3, 0.4, 0); AU.thump(110, 50, 0.3, 0.3, 0.34); AU.bell(PENTA[12], 1.2, 0.08, 0.45, 0.5); AU.nz(0.6, 0.06, 'highpass', 6000, 0, 0.45, 0.05, 0.7, 0.4); },
  snore() { AU.nz(1.3, 0.07, 'lowpass', 260, 0, 0, 0.7, 3); },
  low() { AU.osc('triangle', 320, 180, 0.16, 0.12); AU.osc('sine', 160, 100, 0.18, 0.1); },
  hot() { AU.nz(0.5, 0.2, 'highpass', 4000, 0, 0, 0.02); AU.osc('sawtooth', 120, 60, 0.3, 0.12, 0, 0.005, 0, ['lowpass', 900]); },
  coin() { AU.bell(1976, 0.35, 0.07, 0, 0.3); AU.bell(2637, 0.5, 0.06, 0.06, 0.4); },
  power() { [4, 6, 8, 10, 11].forEach((k, i) => AU.pluck(PENTA[k], 0.2, 0.09, i * 0.045)); AU.nz(0.5, 0.05, 'highpass', 7000, 0, 0.1, 0.05, 0.7, 0.4); AU.bell(PENTA[13], 0.6, 0.05, 0.22); },
  trap() { [7, 5, 3, 1].forEach((k, i) => AU.osc('sawtooth', PENTA[k] / 2, PENTA[k] / 2.3, 0.18, 0.09, i * 0.09, 0.005, 0.1, ['lowpass', 1400, 500])); },
  defuse() { AU.bell(1760, 0.4, 0.07, 0, 0.4); AU.nz(0.25, 0.12, 'highpass', 3500, 0, 0); AU.osc('triangle', 1800, 3200, 0.15, 0.06); },
  roar() { AU.osc('sawtooth', 95, 48, 1, 0.3, 0, 0.05, 0.2, ['lowpass', 700, 200]); AU.nz(1, 0.25, 'lowpass', 500, 150, 0, 0.2); },
  tele() { AU.osc('sine', 400, 1800, 0.22, 0.08, 0, 0.005, 0.4); },
  chest() { AU.nz(0.35, 0.18, 'highpass', 1600, 0, 0, 0.01, 0.7, 0.3); [0, 2, 4, 7, 9].forEach((k, i) => AU.bell(PENTA[k + 4], 0.6, 0.06, 0.1 + i * 0.065, 0.45)); AU.thump(90, 45, 0.3, 0.3, 0.08); },
  laugh() { [0, 0.13, 0.26, 0.39].forEach((d, i) => AU.osc('sawtooth', 620 - i * 30, 480 - i * 30, 0.1, 0.07, d, 0.01, 0.1, ['bandpass', 1100, 900, 4])); },
  shout() { AU.osc('sawtooth', 220, 330, 0.25, 0.18, 0, 0.01, 0.1, ['bandpass', 900, 700, 2]); AU.osc('sawtooth', 330, 160, 0.4, 0.16, 0.22, 0.01, 0.15, ['bandpass', 800, 500, 2]); AU.nz(0.5, 0.12, 'bandpass', 600, 0, 0, 0.05, 1.5); },
  boss() { AU.thump(70, 30, 1, 0.6, 0); AU.nz(0.9, 0.3, 'lowpass', 400, 80, 0, 0.2, 0.7, 0.3); [110, 165, 220].forEach((f, i) => AU.osc('sawtooth', f, f * 0.98, 1.2, 0.1, 0.05 * i, 0.08, 0.35, ['lowpass', 400, 1600, 2])); },
  phase() { AU.osc('sawtooth', 220, 880, 0.5, 0.16, 0, 0.01, 0.3, ['lowpass', 600, 4000]); AU.nz(0.5, 0.25, 'bandpass', 1200, 0, 0, 0.1, 2); },
  thud() { AU.thump(150, 50, 0.18, 0.5); AU.nz(0.1, 0.2, 'lowpass', 900, 0, 0); }
});

/* ---------- button click ki halki awaaz ---------- */
document.addEventListener('pointerdown', e => { if (state === 'play') return; const b = e.target.closest && e.target.closest('button'); if (b && !b.disabled) { try { initAudio(); sfx.ui(); } catch (er) { } } }, true);

/* ---------- MUSIC: desi pentatonic dhun + tabla jaisa beat ---------- */
const MUS = {
  on: true, g: null, next: 0, step: 0, iv: null, mode: 'calm',
  start() {
    if (!AC || this.iv) return;
    this.g = AC.createGain(); this.g.gain.value = 0; this.g.connect(master); this.next = AC.currentTime + 0.1;
    this.iv = setInterval(() => this.sched(), 90);
  },
  vol() { if (!this.g) return; const want = (this.on && !muted && state !== 'ad') ? (state === 'play' ? 0.42 : 0.55) : 0; this.g.gain.setTargetAtTime(want, AC.currentTime, 0.4); },
  note(type, f, t, dur, vol, cut) { const o = AC.createOscillator(), g = AC.createGain(), fl = AC.createBiquadFilter(); o.type = type; o.frequency.setValueAtTime(f, t); fl.type = 'lowpass'; fl.frequency.setValueAtTime(cut || 2200, t); fl.frequency.exponentialRampToValueAtTime(400, t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(fl); fl.connect(g); g.connect(this.g); o.start(t); o.stop(t + dur + 0.05); },
  drum(t, f, vol, n) { const o = AC.createOscillator(), g = AC.createGain(); o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.5, t + 0.15); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2); o.connect(g); g.connect(this.g); o.start(t); o.stop(t + 0.25);
    if (n) { const s = AC.createBufferSource(); s.buffer = noiseBuf; const f2 = AC.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = n; f2.Q.value = 3; const g2 = AC.createGain(); g2.gain.setValueAtTime(vol * 0.5, t); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.08); s.connect(f2); f2.connect(g2); g2.connect(this.g); s.start(t, Math.random()); s.stop(t + 0.1); } },
  MEL: [[0, 2, 4, 2, 7, 4, 2, 0], [4, 5, 7, 9, 7, 5, 4, 2], [7, 9, 10, 9, 7, 4, 5, 4], [2, 4, 2, 0, 2, -1, 0, -1]],
  sched() {
    if (!AC) return; this.vol();
    const play = state === 'play', bpm = play ? 116 : 92, sp = 60 / bpm / 2;
    while (this.next < AC.currentTime + 0.25) {
      const t = this.next, s = this.step, bar = Math.floor(s / 8) % 4, i = s % 8, mel = this.MEL[bar][i];
      // tabla: dha (bass) + na (high)
      if (i === 0 || i === 3 || (play && i === 6)) this.drum(t, 95, 0.32, 0); if (i === 2 || i === 5 || i === 7) this.drum(t, 320, 0.09, 2600); if (play && i % 2 === 1) this.drum(t, 520, 0.04, 6000);
      // dhun: plucked, beech beech mein chupp
      if (mel >= 0 && (play || i % 2 === 0)) this.note('triangle', PENTA[mel + 2] || 523, t, sp * 1.6, play ? 0.05 : 0.06, 2600);
      if (i === 0) this.note('sine', [130.8, 146.8, 164.8, 110][bar], t, sp * 7, 0.09, 600);
      this.next += sp; this.step++;
    }
  }
};
window.MUS = MUS;
MUS.on = !(SAVE.r7 && SAVE.r7.musOff);
(function () {
  const b = document.createElement('button'); b.id = 'r7mus'; b.className = 'fixbtn'; b.title = 'Music'; b.textContent = MUS.on ? '🎵' : '🔇';
  document.body.appendChild(b);
  b.onclick = () => { MUS.on = !MUS.on; SV().musOff = !MUS.on; save(); b.textContent = MUS.on ? '🎵' : '🔇'; b.classList.toggle('off', !MUS.on); initAudio(); MUS.start(); MUS.vol(); };
  b.classList.toggle('off', !MUS.on);
  const _ia = window.initAudio; window.initAudio = function () { _ia.apply(this, arguments); try { MUS.start(); } catch (e) { } };
  document.addEventListener('pointerdown', () => { try { initAudio(); } catch (e) { } }, { once: true });
})();
R7.css(`#r7mus{left:auto;right:58px}#r7mus.off{opacity:.55}body.bnr #r7mus{bottom:66px}`);
/* test helper ko naye functions do */
try { Object.assign(window.__mm, { showIntro: (...a) => window.showIntro(...a), showMap: (...a) => window.showMap(...a), winLevel: (...a) => window.winLevel(...a), wake: (...a) => window.wake(...a), startLevel: (...a) => window.startLevel(...a), openShop: (...a) => window.openShop(...a) }); } catch (e) { }

/* ================= AUDIO ================= */
let AC = null, master, buzzOsc, buzzGain, buzzPan, noiseBuf, muted = false;
function initAudio() {
  if (AC) { AC.resume && AC.resume(); return; }
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    const comp = AC.createDynamicsCompressor(); comp.threshold.value = -10; comp.ratio.value = 4; comp.connect(AC.destination);
    master = AC.createGain(); master.gain.value = 0.9; master.connect(comp);
    noiseBuf = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    buzzOsc = AC.createOscillator(); buzzOsc.type = 'sawtooth'; buzzOsc.frequency.value = 520;
    const lfo = AC.createOscillator(); lfo.frequency.value = 9; const lg = AC.createGain(); lg.gain.value = 28; lfo.connect(lg); lg.connect(buzzOsc.frequency);
    const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1200; f.Q.value = 1.4;
    buzzGain = AC.createGain(); buzzGain.gain.value = 0; buzzOsc.connect(f); f.connect(buzzGain);
    if (AC.createStereoPanner) { buzzPan = AC.createStereoPanner(); buzzGain.connect(buzzPan); buzzPan.connect(master); } else buzzGain.connect(master);
    buzzOsc.start(); lfo.start();
  } catch (e) { AC = null; }
}
function noise(dur, vol, type, freq, attack = 0.003, q = 0.8, delay = 0, f2) {
  if (!AC || muted) return;
  const t = AC.currentTime + delay, s = AC.createBufferSource(); s.buffer = noiseBuf;
  const f = AC.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); if (f2) f.frequency.exponentialRampToValueAtTime(f2, t + dur); f.Q.value = q;
  const g = AC.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.05);
}
function tone(f1, f2, dur, vol, type = 'sine', delay = 0, attack = 0.005) {
  if (!AC || muted) return;
  const t = AC.currentTime + delay, o = AC.createOscillator(); o.type = type;
  o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
  const g = AC.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
}
const NOTES = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760, 2093];
const sfx = {
  zap() { noise(0.13, 0.32, 'highpass', 2600); tone(2600, 500, 0.09, 0.07, 'square'); },
  miss() { noise(0.06, 0.08, 'highpass', 3500); },
  kill(c) { const n = NOTES[Math.min(NOTES.length - 1, c)]; tone(n, n, 0.16, 0.12, 'triangle'); tone(n * 2, n * 2, 0.08, 0.03); },
  crack() { tone(900, 300, 0.08, 0.1, 'square'); },
  block() { tone(200, 180, 0.12, 0.15, 'square'); noise(0.08, 0.15, 'bandpass', 800); },
  mega() { noise(0.6, 0.55, 'lowpass', 2200, 0.01); tone(180, 1800, 0.4, 0.15, 'sawtooth'); tone(90, 40, 0.5, 0.35); },
  bite() { tone(240, 160, 0.1, 0.08); },
  noise() { tone(500, 300, 0.1, 0.05, 'square'); },
  whoosh() { noise(0.45, 0.18, 'bandpass', 900, 0.15, 2); },
  heart(v = 1) { tone(70, 45, 0.16, 0.5 * v); tone(65, 40, 0.18, 0.4 * v, 'sine', 0.2); },
  tick() { tone(2400, 2400, 0.02, 0.05, 'square'); },
  clear() { [0, 2, 4, 5, 7].forEach((k, i) => tone(NOTES[k], NOTES[k], 0.28, 0.12, 'triangle', i * 0.09)); },
  snore() { noise(1.3, 0.07, 'lowpass', 260, 0.7, 3); },
  low() { tone(300, 200, 0.12, 0.06, 'square'); },
  hot() { noise(0.5, 0.2, 'highpass', 4000, 0.02); tone(120, 60, 0.3, 0.15, 'sawtooth'); },
  coin() { tone(1568, 1568, 0.07, 0.06, 'square'); tone(2093, 2093, 0.12, 0.05, 'square', 0.06); },
  power() { [4, 6, 8, 10].forEach((k, i) => tone(NOTES[k], NOTES[k], 0.12, 0.1, 'triangle', i * 0.05)); },
  trap() { [6, 4, 2, 0].forEach((k, i) => tone(NOTES[k] / 2, NOTES[k] / 2.2, 0.15, 0.12, 'sawtooth', i * 0.07)); },
  defuse() { tone(1800, 3000, 0.15, 0.08, 'triangle'); noise(0.2, 0.15, 'highpass', 3000); },
  roar() { tone(90, 50, 0.9, 0.4, 'sawtooth'); noise(0.9, 0.25, 'lowpass', 400, 0.2); },
  tele() { tone(400, 1600, 0.2, 0.08); },
  chest() { noise(0.3, 0.2, 'highpass', 1500); [0, 2, 4, 7, 9].forEach((k, i) => tone(NOTES[k] * 1.5, NOTES[k] * 1.5, 0.2, 0.1, 'triangle', 0.1 + i * 0.07)); },
  laugh() { [0, 0.14, 0.28].forEach((d, i) => tone(900 - i * 60, 700 - i * 60, 0.1, 0.06, 'square', d)); },
  shout() { tone(220, 330, 0.25, 0.2, 'sawtooth'); tone(330, 160, 0.4, 0.18, 'sawtooth', 0.22); noise(0.5, 0.15, 'bandpass', 600, 0.05, 1.5); },
  throwW() { noise(0.55, 0.35, 'bandpass', 300, 0.4, 1.5, 0, 3000); tone(120, 900, 0.55, 0.12, 'sawtooth'); },
  impact() {
    tone(160, 30, 0.6, 0.9); noise(0.35, 0.7, 'lowpass', 700, 0.002);
    noise(0.9, 0.55, 'highpass', 3500, 0.002, 0.7, 0.02);
    for (let i = 0; i < 14; i++) tone(rnd(2500, 6000), rnd(2000, 5000), rnd(0.03, 0.09), 0.08, 'square', 0.03 + Math.random() * 0.5);
  },
  boss() { tone(110, 55, 1.2, 0.35, 'sawtooth'); tone(165, 82, 1.2, 0.25, 'sawtooth', 0.05); noise(1.2, 0.3, 'lowpass', 300, 0.3); },
  phase() { tone(220, 880, 0.5, 0.2, 'sawtooth'); noise(0.5, 0.3, 'bandpass', 1200, 0.1, 2); }
};
const vib = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };

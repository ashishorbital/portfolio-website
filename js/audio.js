(function() {
  let audioCtx = null;
  let soundEnabled = localStorage.getItem("sound-enabled") === "true";

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playHammerSound() {
    if (!soundEnabled) return;
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  }

  function playSplatSound() {
    if (!soundEnabled) return;
    initAudio();
    const bufferSize = audioCtx.sampleRate * 0.12;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.12);
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    noise.start();
    noise.stop(audioCtx.currentTime + 0.12);
  }

  function playChimeSound() {
    if (!soundEnabled) return;
    initAudio();
    const now = audioCtx.currentTime;
    
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.type = "square";
    osc1.frequency.setValueAtTime(440, now);
    gain1.gain.setValueAtTime(0.1, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc1.start();
    osc1.stop(now + 0.1);
    
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.type = "square";
    osc2.frequency.setValueAtTime(880, now + 0.08);
    gain2.gain.setValueAtTime(0.1, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.18);
  }

  function playKeySound() {
    if (!soundEnabled) return;
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.02);
    
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.02);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.02);
  }

  function playClickSound() {
    if (!soundEnabled) return;
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.03);
    
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.03);
  }

  function playSnakeDeathSound() {
    if (!soundEnabled) return;
    initAudio();
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.35);
    
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfo.frequency.value = 30;
    lfoGain.gain.value = 45;
    
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
    
    lfo.start(now);
    osc.start(now);
    
    lfo.stop(now + 0.35);
    osc.stop(now + 0.35);
  }

  // Expose functions globally
  window.initAudio = initAudio;
  window.playHammerSound = playHammerSound;
  window.playSplatSound = playSplatSound;
  window.playChimeSound = playChimeSound;
  window.playKeySound = playKeySound;
  window.playClickSound = playClickSound;
  window.playSnakeDeathSound = playSnakeDeathSound;

  window.isSoundEnabled = () => soundEnabled;
  window.toggleSound = () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem("sound-enabled", soundEnabled);
    return soundEnabled;
  };
})();

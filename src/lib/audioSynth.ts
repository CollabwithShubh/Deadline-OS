export type SoundType = 'none' | 'cyberpunk' | 'rain' | 'white_noise';

class AudioEngine {
  ctx: AudioContext | null = null;
  activeNodes: any[] = [];
  
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  stopAll() {
    this.activeNodes.forEach(node => {
      try {
        node.stop();
      } catch(e) {}
      try {
        node.disconnect();
      } catch(e) {}
    });
    this.activeNodes = [];
  }

  playNoise() {
    this.init();
    if (!this.ctx) return;
    this.stopAll();
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    // Lowpass filter to make it less harsh
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.05; // soft
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    noise.start();
    this.activeNodes.push(noise, filter, gain);
  }
  
  playRain() {
    this.init();
    if (!this.ctx) return;
    this.stopAll();
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    // Lowpass filter for rain effect
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400; // Deep rumble rain

    const gain = this.ctx.createGain();
    gain.gain.value = 0.4;
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    noise.start();
    this.activeNodes.push(noise, filter, gain);
  }

  playCyberpunk() {
    this.init();
    if (!this.ctx) return;
    this.stopAll();
    // Ambient drone
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.value = 55; // Low A
    
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.value = 55.5; // Slight detune
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    // LFO for filter modulation
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.2; // Slow sweep
    
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 200;
    
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = this.ctx.createGain();
    gain.gain.value = 0.05; // Keep it ambient
    
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc1.start();
    osc2.start();
    lfo.start();
    this.activeNodes.push(osc1, osc2, lfo, filter, gain);
  }

  setSound(type: SoundType, isPlaying: boolean) {
    if (!isPlaying || type === 'none') {
      this.stopAll();
      return;
    }
    
    if (type === 'white_noise') this.playNoise();
    else if (type === 'rain') this.playRain();
    else if (type === 'cyberpunk') this.playCyberpunk();
  }
}

export const audioEngine = new AudioEngine();

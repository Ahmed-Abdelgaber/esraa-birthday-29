import { ASSET_MANIFEST } from '../asset-manifest.js';
import { SETTINGS, getMoment, TOTAL_DURATION } from './story.js';

export const EFFECT_PROFILES = {
  click: { duration: .22, threshold: .35, fadeIn: .003, fadeOut: .025 },
  investigation: { duration: 4, threshold: .12, fadeIn: .12, fadeOut: .45 },
  'record-scratch': { duration: 1.15, threshold: .18, fadeIn: .006, fadeOut: .08 },
};

// Uploaded effects can contain several takes or an entire soundtrack. Keep one
// short audible excerpt, tame its peak and fade its edges; originals stay intact.
export function trimSoundEffect(input, name, context) {
  const profile = EFFECT_PROFILES[name];
  if (!profile) return { buffer: input, offset: 0, duration: input.duration };
  const channels = Array.from({ length: input.numberOfChannels }, (_, i) => input.getChannelData(i));
  let peak = 0;
  for (const samples of channels) for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
  const threshold = Math.max(.002, peak * profile.threshold);
  let onset = 0;
  scan: for (let i = 0; i < input.length; i++) {
    for (const samples of channels) if (Math.abs(samples[i]) >= threshold) { onset = i; break scan; }
  }
  const start = Math.max(0, onset - Math.round(input.sampleRate * .015));
  const length = Math.max(1, Math.min(input.length - start, Math.round(profile.duration * input.sampleRate)));
  const output = context.createBuffer(input.numberOfChannels, length, input.sampleRate);
  let excerptPeak = 0;
  for (const samples of channels) for (let i = start; i < start + length; i++) excerptPeak = Math.max(excerptPeak, Math.abs(samples[i]));
  const gain = excerptPeak > .0001 ? Math.min(3, .7 / excerptPeak) : 1;
  const attack = Math.max(1, Math.round(profile.fadeIn * input.sampleRate));
  const release = Math.max(1, Math.round(profile.fadeOut * input.sampleRate));
  let energy = 0;
  for (let channel = 0; channel < channels.length; channel++) {
    const samples = output.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      samples[i] = channels[channel][start + i] * gain * Math.min(1, i / attack, (length - 1 - i) / release);
      energy += samples[i] * samples[i];
    }
  }
  return { buffer: output, sourceDuration: input.duration, offset: start / input.sampleRate, duration: length / input.sampleRate, rms: Math.sqrt(energy / length / channels.length) };
}

export function musicLevelAt(time, hasNarration = false) {
  const { scene, localTime } = getMoment(time);
  if (['count', 'blackout', 'post-credit'].includes(scene.id)) return 0;
  let level = SETTINGS.musicVolume * (scene.act === 2 ? .55 : 1) * (hasNarration ? .4 : 1);
  if (scene.id === 'opening') level *= Math.min(1, localTime / 2);
  if (scene.id === 'credits') level *= Math.max(0, 1 - localTime / scene.duration);
  return level;
}

// One unlocked Web Audio context mixes everything, including scene narration.
// Pausing, seeking and replaying restart buffers at the matching story offset.
export class AudioDirector {
  constructor(onUnavailable, onReady) {
    this.context = null;
    this.buffers = new Map();
    this.sources = new Set();
    this.muted = false;
    this.playing = false;
    this.onUnavailable = onUnavailable;
    this.onReady = onReady;
    this.effectDetails = {};
  }
  async unlock() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.connect(this.context.destination);
      this.master.gain.value = this.muted ? 0 : 1;
      this.music = this.context.createGain();
      this.music.connect(this.master);
      this.voice = this.context.createGain();
      this.voice.gain.value = SETTINGS.voiceVolume;
      this.voice.connect(this.master);
      this.effects = this.context.createGain();
      this.effects.gain.value = SETTINGS.effectsVolume;
      this.effects.connect(this.master);
      if (ASSET_MANIFEST.audio.background && typeof document !== 'undefined' && this.context.createMediaElementSource) {
        // Stream a long MP3 instead of retaining a full decoded music buffer on phones.
        this.backgroundElement = document.createElement('audio');
        this.backgroundElement.id = 'background-audio';
        this.backgroundElement.hidden = true;
        this.backgroundElement.loop = true;
        this.backgroundElement.preload = 'auto';
        this.backgroundElement.src = ASSET_MANIFEST.audio.background;
        document.body.append(this.backgroundElement);
        this.context.createMediaElementSource(this.backgroundElement).connect(this.music);
        this.backgroundElement.addEventListener('loadedmetadata', () => {
          if (this.playing) this.alignMusic(this.getTime());
        });
        this.backgroundElement.addEventListener('error', () => this.onUnavailable?.());
      }
    }
    await this.context.resume().catch(() => this.onUnavailable?.());
  }
  async prepare() {
    if (!this.context || this.prepared) return;
    this.prepared = true;
    const supplied = Object.entries(ASSET_MANIFEST.audio).filter(([key, path]) => path && (key !== 'background' || !this.backgroundElement));
    const results = await Promise.allSettled(supplied.map(async ([key, path]) => {
      const response = await fetch(path);
      if (!response.ok) throw new Error('Audio unavailable');
      const decoded = await this.context.decodeAudioData(await response.arrayBuffer());
      const trimmed = trimSoundEffect(decoded, key, this.context);
      this.buffers.set(key, trimmed.buffer);
      if (EFFECT_PROFILES[key]) this.effectDetails[key] = { sourceDuration: trimmed.sourceDuration, offset: trimmed.offset, duration: trimmed.duration, rms: trimmed.rms };
    }));
    if (results.some(result => result.status === 'rejected')) this.onUnavailable?.();
    this.onReady?.({ loaded: [...this.buffers.keys(), ...(this.backgroundElement ? ['background'] : [])], contextState: this.context.state, effects: this.effectDetails, failed: results.filter(result => result.status === 'rejected').length });
    if (this.playing) this.sync(this.getTime());
  }
  setMuted(value) {
    this.muted = value;
    if (this.master) this.master.gain.setTargetAtTime(value ? 0 : 1, this.context.currentTime, .025);
  }
  start(getTime) {
    this.getTime = getTime;
    this.playing = true;
    // Call from the user gesture; the context is created before the first await.
    const unlocked = this.unlock();
    // Unlock native media during this same user gesture, before any await.
    this.backgroundElement?.play().catch(() => this.onUnavailable?.());
    unlocked.then(() => {
      if (!this.context || !this.playing) return;
      this.sync(this.getTime());
      this.prepare();
    });
  }
  stopNodes() {
    clearInterval(this.musicTimer);
    for (const source of this.sources) { try { source.stop(); } catch { /* Already ended. */ } }
    this.sources.clear();
  }
  pause() { this.playing = false; this.stopNodes(); this.backgroundElement?.pause(); }
  track(source) {
    this.sources.add(source);
    source.addEventListener('ended', () => this.sources.delete(source), { once: true });
    return source;
  }
  playBuffer(buffer, bus, offset = 0, loop = false, maxDuration) {
    if (!buffer || !this.context || offset >= buffer.duration && !loop) return;
    const source = this.track(this.context.createBufferSource());
    source.buffer = buffer;
    source.loop = loop;
    source.connect(bus);
    const startOffset = loop ? offset % buffer.duration : Math.max(0, offset);
    if (maxDuration !== undefined) source.start(0, startOffset, Math.min(maxDuration, buffer.duration - startOffset));
    else source.start(0, startOffset);
    return source;
  }
  sync(time) {
    if (!this.playing || !this.context) return;
    this.stopNodes();
    const { scene, localTime } = getMoment(time);
    const mode = SETTINGS.narrationMode;
    const single = mode === 'single' || mode === 'auto' && this.buffers.has('narration');
    const narration = mode !== 'off' ? this.buffers.get(single ? 'narration' : `scene-${scene.id}`) : null;
    const voiceOffset = single ? time : localTime;
    const voiceActive = narration && voiceOffset < narration.duration;
    this.setMusicLevel(time, Boolean(voiceActive));
    if (narration) this.playBuffer(narration, this.voice, voiceOffset, false, single ? TOTAL_DURATION - time : scene.duration - localTime);
    if (this.backgroundElement) this.alignMusic(time);
    else if (this.buffers.has('background')) this.playBuffer(this.buffers.get('background'), this.music, time, true);
    else if (SETTINGS.synthMusicWhenMissing) this.startScore();
  }
  alignMusic(time) {
    const element = this.backgroundElement;
    if (!element || !Number.isFinite(element.duration)) return;
    const offset = time % element.duration;
    if (Math.abs(element.currentTime - offset) > .12) element.currentTime = offset;
    if (this.playing && element.paused) element.play().catch(() => this.onUnavailable?.());
  }
  setMusicLevel(time, voiceActive) {
    const { scene, localTime } = getMoment(time);
    const now = this.context.currentTime;
    const gain = this.music.gain;
    gain.cancelScheduledValues?.(now);
    const level = musicLevelAt(time, voiceActive);
    gain.value = level;
    if (gain.setValueAtTime && gain.linearRampToValueAtTime) {
      gain.setValueAtTime(level, now);
      if (scene.id === 'opening' && localTime < 2) gain.linearRampToValueAtTime(musicLevelAt(2, voiceActive), now + 2 - localTime);
      if (scene.id === 'credits') gain.linearRampToValueAtTime(0, now + scene.duration - localTime);
    }
  }
  tone(frequency, duration, volume, when = this.context.currentTime, bus = this.music, type = 'sine') {
    const osc = this.track(this.context.createOscillator());
    const envelope = this.context.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    envelope.gain.setValueAtTime(0, when);
    envelope.gain.linearRampToValueAtTime(volume, when + Math.min(.05, duration / 4));
    envelope.gain.exponentialRampToValueAtTime(.0001, when + duration);
    osc.connect(envelope);
    envelope.connect(bus);
    osc.start(when); osc.stop(when + duration + .03);
  }
  startScore() {
    // An original, restrained ambient arpeggio. Never a downloaded song.
    const chords = [[220, 261.63, 329.63, 440], [174.61, 220, 261.63, 349.23], [196, 246.94, 293.66, 392], [164.81, 220, 246.94, 329.63]];
    let step = Math.floor(this.getTime() / .85);
    const schedule = () => {
      if (!this.playing) return;
      const { scene } = getMoment(this.getTime());
      // Silence gives the count, the blackout and the final joke their timing.
      if (['count', 'blackout', 'post-credit'].includes(scene.id)) return;
      const notes = chords[Math.floor(this.getTime() / 6.8) % chords.length];
      const investigation = scene.act === 2;
      this.tone(notes[step % 4] * (investigation ? .5 : 1), 2.3, investigation ? .13 : .17);
      if (step % 4 === 0) this.tone(notes[0] * .5, 3, .08);
      step++;
    };
    schedule(); this.musicTimer = setInterval(schedule, 850);
  }
  cue(name) {
    if (!this.context || !this.playing) return;
    if (this.buffers.has(name)) { this.playBuffer(this.buffers.get(name), this.effects); return; }
    if (!SETTINGS.synthEffectsWhenMissing) return;
    const now = this.context.currentTime;
    if (name === 'click') this.tone(760, .065, .35, now, this.effects);
    if (name === 'investigation') {
      [220, 164.81, 110].forEach((note, index) => this.tone(note, 1.1, .22, now + index * .16, this.effects, 'triangle'));
    }
    if (name === 'record-scratch') {
      const length = Math.ceil(this.context.sampleRate * .24);
      const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) samples[i] = (Math.random() * 2 - 1) * (1 - i / length) * .32;
      const source = this.track(this.context.createBufferSource());
      const filter = this.context.createBiquadFilter();
      filter.type = 'bandpass'; filter.Q.value = 2;
      filter.frequency.setValueAtTime(1900, now); filter.frequency.exponentialRampToValueAtTime(180, now + .24);
      source.buffer = buffer; source.connect(filter); filter.connect(this.effects); source.start();
    }
  }
}

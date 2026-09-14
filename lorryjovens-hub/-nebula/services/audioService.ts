
export class AudioService {
  private context: AudioContext;
  private analyser: AnalyserNode;
  private source: AudioBufferSourceNode | null = null;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private freqData: Uint8Array;
  private timeData: Uint8Array;
  
  private currentBuffer: AudioBuffer | null = null;
  private startTime: number = 0;
  private pauseOffset: number = 0;
  private isPlaying: boolean = false;
  private currentMode: 'file' | 'mic' = 'file';
  private onEndCallback: (() => void) | null = null;

  constructor() {
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 2048;
    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeData = new Uint8Array(this.analyser.frequencyBinCount);
  }

  async loadAudio(file: File): Promise<AudioBuffer> {
    const arrayBuffer = await file.arrayBuffer();
    return await this.context.decodeAudioData(arrayBuffer);
  }

  async startMic() {
    this.stop();
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.micSource = this.context.createMediaStreamSource(this.micStream);
      this.micSource.connect(this.analyser);
      this.isPlaying = true;
      this.currentMode = 'mic';
      if (this.context.state === 'suspended') await this.context.resume();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      throw err;
    }
  }

  play(buffer: AudioBuffer, onEnd: () => void, offset: number = 0) {
    this.stop();
    this.currentBuffer = buffer;
    this.onEndCallback = onEnd;
    this.pauseOffset = offset;

    this.source = this.context.createBufferSource();
    this.source.buffer = buffer;
    this.source.connect(this.analyser);
    this.analyser.connect(this.context.destination);
    
    this.source.onended = () => {
      if (this.isPlaying && this.onEndCallback) {
        this.isPlaying = false;
        this.onEndCallback();
      }
    };

    this.source.start(0, this.pauseOffset);
    this.startTime = this.context.currentTime - this.pauseOffset;
    this.isPlaying = true;
    this.currentMode = 'file';
    if (this.context.state === 'suspended') this.context.resume();
  }

  pause() {
    if (this.isPlaying && this.currentMode === 'file') {
      this.pauseOffset = this.context.currentTime - this.startTime;
      if (this.source) {
        this.source.onended = null;
        this.source.stop();
        this.source = null;
      }
      this.isPlaying = false;
    } else if (this.currentMode === 'mic') {
      this.stop();
    }
  }

  resume() {
    if (this.currentBuffer && !this.isPlaying && this.currentMode === 'file') {
      this.play(this.currentBuffer, this.onEndCallback!, this.pauseOffset);
    }
  }

  stop() {
    if (this.source) {
      this.source.onended = null;
      this.source.stop();
      this.source.disconnect();
      this.source = null;
    }
    if (this.micSource) {
      this.micSource.disconnect();
      this.micSource = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
      this.micStream = null;
    }
    this.isPlaying = false;
    this.pauseOffset = 0;
  }

  getAnalysis() {
    this.analyser.getByteFrequencyData(this.freqData);
    this.analyser.getByteTimeDomainData(this.timeData);

    let bass = 0;
    const bassCount = 12;
    for (let i = 0; i < bassCount; i++) bass += this.freqData[i];
    bass /= bassCount;

    let treble = 0;
    const trebleStart = Math.floor(this.analyser.frequencyBinCount * 0.4);
    const trebleEnd = Math.floor(this.analyser.frequencyBinCount * 0.8);
    for (let i = trebleStart; i < trebleEnd; i++) treble += this.freqData[i];
    treble /= (trebleEnd - trebleStart);

    return {
      bass: bass / 255,
      treble: treble / 255,
      rawFreq: this.freqData,
      rawTime: this.timeData
    };
  }

  getIsPlaying() { return this.isPlaying; }
  getMode() { return this.currentMode; }
}

export const audioService = new AudioService();

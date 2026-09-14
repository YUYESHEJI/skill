
export class CameraService {
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private prevFrameData: Uint8ClampedArray | null = null;
  private isDetecting = false;
  private onGesture: (type: 'point') => void = () => {};
  private sensitivity = 45; // Adaptable threshold

  constructor() {
    this.video = document.createElement('video');
    this.canvas = document.createElement('canvas');
    this.canvas.width = 160;
    this.canvas.height = 120;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }

  async start(facingMode: 'user' | 'environment', onGesture: (type: 'point') => void) {
    this.onGesture = onGesture;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: 320, height: 240, frameRate: 30 }
      });
      if (this.video) {
        this.video.srcObject = stream;
        this.video.play();
        this.isDetecting = true;
        this.detectLoop();
      }
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  }

  stop() {
    this.isDetecting = false;
    if (this.video && this.video.srcObject) {
      (this.video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      this.video.srcObject = null;
    }
    this.prevFrameData = null;
  }

  private detectLoop() {
    if (!this.isDetecting || !this.video || !this.ctx || !this.canvas) return;

    this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    const currentFrame = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;

    if (this.prevFrameData) {
      let motionSum = 0;
      // Define "Active Zone": Top-Right of mirrored video (which is top-left in feed)
      const startX = 0;
      const endX = Math.floor(this.canvas.width * 0.4);
      const startY = 0;
      const endY = Math.floor(this.canvas.height * 0.4);

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const i = (y * this.canvas.width + x) * 4;
          // Simple RGB difference
          const diff = Math.abs(currentFrame[i] - this.prevFrameData[i]) +
                       Math.abs(currentFrame[i+1] - this.prevFrameData[i+1]) +
                       Math.abs(currentFrame[i+2] - this.prevFrameData[i+2]);
          if (diff > 30) motionSum++; // Count "active" pixels
        }
      }
      
      const totalArea = (endX - startX) * (endY - startY);
      const density = (motionSum / totalArea) * 100;

      if (density > 15) { // Trigger if 15% of pixels in the zone moved
        this.onGesture('point');
        this.prevFrameData = null; // Clear to prevent double triggers
        setTimeout(() => this.detectLoop(), 1000); // 1s cooldown
        return;
      }
    }

    this.prevFrameData = currentFrame;
    requestAnimationFrame(() => this.detectLoop());
  }

  getVideoElement() { return this.video; }
}

export const cameraService = new CameraService();

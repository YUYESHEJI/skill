export interface Asset {
  id: string;
  type: 'video' | 'image' | 'audio';
  src: string;
  name: string;
  duration?: number; // in seconds
  thumbnail?: string;
  tags?: string[];
  fileHash?: string;
  uploadStatus?: 'uploading' | 'processing' | 'done' | 'error';
}

export interface FilterConfig {
  type: 'brightness' | 'contrast' | 'grayscale' | 'sepia' | 'saturate' | 'blur';
  value: number; // 0 to 100 or 0 to 2 usually
}

export interface TrackClip {
  id: string;
  assetId: string;
  startTime: number; // Position on timeline (seconds)
  duration: number; // Length of clip (seconds)
  offset: number; // Start point within the source asset (seconds)
  name: string;
  type: 'video' | 'image' | 'audio';
  src: string;
  filters?: FilterConfig[];
}

export interface Track {
  id: string;
  type: 'video' | 'audio';
  clips: TrackClip[];
}

export interface ProjectState {
  tracks: Track[];
  assets: Asset[];
  duration: number;
}

export enum TabOption {
  ASSETS = 'assets',
  AI_SCRIPT = 'ai_script',
  AI_VIDEO = 'ai_video',
  EXPORT = 'export'
}
export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  WORLD_BUILDER = 'WORLD_BUILDER',
  ASSET_FORGE = 'ASSET_FORGE',
  PHYSICS_LAB = 'PHYSICS_LAB',
  MR_PREVIEW = 'MR_PREVIEW',
  LIVE_NPC = 'LIVE_NPC',
  TRANSLATOR = 'TRANSLATOR'
}

export type AppLanguage = 'en' | 'cn';

export interface GeneratedAsset {
  id: string;
  name: string;
  type: 'MODEL' | 'TEXTURE' | 'SOUND' | 'SCRIPT';
  description: string;
  polyCount?: number;
  textureResolution?: string;
  scriptContent?: string;
  meshData?: string;
  aiConfidence: number;
}

export interface PhysicsMetric {
  timestamp: string;
  collisionLoad: number;
  physicsThreadTime: number;
  activeEntities: number;
}

export interface WorldGenerationResult {
  biome: string;
  lore: string;
  weatherPattern: string;
  difficultyRating: number;
}
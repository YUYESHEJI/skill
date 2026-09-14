import { geminiService } from './GeminiService.js';

class AssetGenerator {
  constructor() {
    this.assets = {
      character: {},
      enemies: [],
      backgrounds: [],
      items: [],
      tiles: []
    };
  }

  async generateCharacterFrames(referenceImage, config = {}, onProgress) {
    const {
      actions = ['idle', 'walk', 'run', 'jump', 'attack', 'special'],
      framesPerAction = 6,
      resolution = 64
    } = config;

    const characterFrames = {};
    let totalFrames = actions.length * framesPerAction;
    let completed = 0;

    for (const action of actions) {
      characterFrames[action] = [];
      for (let i = 0; i < framesPerAction; i++) {
        try {
          const frame = await geminiService.generateActionFrame(
            referenceImage, action, i, framesPerAction
          );
          characterFrames[action].push({
            id: `${action}_${i}`,
            dataUrl: frame,
            index: i
          });
          completed++;
          onProgress?.(completed, totalFrames, action, i);
        } catch (error) {
          console.error(`Failed to generate ${action} frame ${i}:`, error);
        }
      }
    }

    this.assets.character = characterFrames;
    return characterFrames;
  }

  async generateLevelAssets(levelTheme = 'temple') {
    const themes = {
      temple: {
        background: 'Ancient Greek temple ruins background, pixel art style, side scrolling game background, columns and stone architecture, dramatic lighting',
        tiles: 'Stone platform tiles, pixel art game tiles, ancient Greek style, various platform pieces',
        enemies: [
          'Pixel art enemy soldier, ancient Greek warrior, side view game sprite',
          'Pixel art enemy archer, ancient Greek archer, side view game sprite',
          'Pixel art boss enemy, large armored warrior, side view game sprite'
        ],
        items: [
          'Pixel art health potion, glowing red, game item sprite',
          'Pixel art power up, glowing blue orb, game item sprite',
          'Pixel art weapon pickup, shining sword, game item sprite'
        ]
      },
      volcano: {
        background: 'Volcanic landscape background, pixel art style, lava flows, dark rocks, side scrolling game background',
        tiles: 'Lava rock platform tiles, pixel art game tiles, volcanic style',
        enemies: [
          'Pixel art fire demon enemy, side view game sprite',
          'Pixel art lava golem enemy, side view game sprite',
          'Pixel art boss, fire dragon, side view game sprite'
        ],
        items: [
          'Pixel art fire resistance potion, game item sprite',
          'Pixel art power up, flame aura, game item sprite'
        ]
      }
    };

    const theme = themes[levelTheme] || themes.temple;

    const [background] = await Promise.all([
      geminiService.generateImage(theme.background)
    ]);

    this.assets.backgrounds.push({ id: 'bg_main', dataUrl: background, theme: levelTheme });

    for (let i = 0; i < theme.enemies.length; i++) {
      try {
        const enemy = await geminiService.generateImage(theme.enemies[i]);
        this.assets.enemies.push({ id: `enemy_${i}`, dataUrl: enemy, type: i });
      } catch (e) {
        console.error('Enemy generation failed:', e);
      }
    }

    for (let i = 0; i < theme.items.length; i++) {
      try {
        const item = await geminiService.generateImage(theme.items[i]);
        this.assets.items.push({ id: `item_${i}`, dataUrl: item, type: i });
      } catch (e) {
        console.error('Item generation failed:', e);
      }
    }

    return this.assets;
  }

  getAssets() {
    return this.assets;
  }
}

export const assetGenerator = new AssetGenerator();

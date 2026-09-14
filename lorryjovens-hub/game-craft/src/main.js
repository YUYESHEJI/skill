import { GameEngine } from './engine/GameEngine.js';
import { LevelGenerator } from './engine/LevelGenerator.js';
import { geminiService } from './services/GeminiService.js';
import { assetGenerator } from './services/AssetGenerator.js';

const canvas = document.getElementById('gameCanvas');
const game = new GameEngine(canvas);

const apiKey = localStorage.getItem('gemini_api_key');
if (apiKey) {
  geminiService.setApiKey(apiKey);
}

const defaultCharacterImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function initGame() {
  console.log('Initializing Saint Seiya Game...');
  
  const levelData = LevelGenerator.generateContraStyleLevel(1);
  game.loadLevel(levelData);
  
  game.start();
  
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'r' && !game.gameState.running) {
      game.restart();
    }
  });

  console.log('Game started! Use arrow keys to move, Z to jump, X to attack, C for special.');
}

window.startGeneration = async function() {
  const apiKeyInput = document.getElementById('apiKeyInput');
  if (apiKeyInput && apiKeyInput.value) {
    geminiService.setApiKey(apiKeyInput.value);
  }

  const refImage = document.getElementById('refImage');
  const refDataUrl = refImage ? refImage.src : defaultCharacterImage;

  console.log('Generating character frames...');
  const characterFrames = await assetGenerator.generateCharacterFrames(refDataUrl, {
    actions: ['idle', 'walk', 'jump', 'attack', 'special'],
    framesPerAction: 6
  }, (completed, total, action, frame) => {
    console.log(`Progress: ${completed}/${total} - ${action} frame ${frame}`);
  });

  console.log('Generating level assets...');
  await assetGenerator.generateLevelAssets('temple');

  const assets = assetGenerator.getAssets();
  game.setAssets(assets);
  
  console.log('Assets loaded! Game updated with AI-generated content.');
};

initGame();

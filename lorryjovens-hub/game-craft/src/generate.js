import { geminiService } from './services/GeminiService.js';
import { assetGenerator } from './services/AssetGenerator.js';
import { imageProcessor } from './services/ImageProcessor.js';

const CONFIG = {
  characterName: 'Saint Seiya - Dragon Shiryu',
  actions: ['idle', 'walk', 'run', 'jump', 'attack', 'special'],
  framesPerAction: 6,
  resolution: 64,
  levelTheme: 'temple',
  outputDir: './public/assets'
};

async function main() {
  console.log('=== 圣斗士星矢 - 魂斗罗风格游戏生成器 ===\n');

  const apiKey = process.env.GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
  if (!apiKey) {
    console.error('错误：请设置 GEMINI_API_KEY 环境变量或在浏览器中设置 API Key');
    return;
  }
  geminiService.setApiKey(apiKey);

  const characterImage = document.getElementById('characterImage')?.src;
  if (!characterImage) {
    console.error('错误：请先上传角色参考图像');
    return;
  }

  console.log('步骤 1/5: 图像抠像（背景移除）...');
  const抠像结果 = await imageProcessor.removeBackgroundSimple(characterImage);
  console.log('✓ 抠像完成');

  console.log('\n步骤 2/5: 生成动作序列帧...');
  const characterFrames = await assetGenerator.generateCharacterFrames(
    抠像结果,
    {
      actions: CONFIG.actions,
      framesPerAction: CONFIG.framesPerAction,
      resolution: CONFIG.resolution
    },
    (completed, total, action, frame) => {
      const percent = Math.round((completed / total) * 100);
      console.log(`  进度: ${percent}% - ${action} 第 ${frame + 1} 帧`);
    }
  );
  console.log(`✓ 生成了 ${Object.keys(characterFrames).length} 个动作，每个动作 ${CONFIG.framesPerAction} 帧`);

  console.log('\n步骤 3/5: 生成关卡资产...');
  const levelAssets = await assetGenerator.generateLevelAssets(CONFIG.levelTheme);
  console.log(`✓ 生成了 ${levelAssets.backgrounds.length} 个背景, ${levelAssets.enemies.length} 个敌人, ${levelAssets.items.length} 个道具`);

  console.log('\n步骤 4/5: 构建游戏代码...');
  const gameCode = generateGameCode(characterFrames, levelAssets);
  console.log('✓ 游戏代码生成完成');

  console.log('\n步骤 5/5: 保存输出...');
  saveOutput(gameCode, characterFrames, levelAssets);
  console.log('✓ 所有文件已保存');

  console.log('\n=== 生成完成！===');
  console.log('运行 npm run dev 启动游戏服务器');
}

function generateGameCode(characterFrames, levelAssets) {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>圣斗士星矢 - 魂斗罗风格</title>
  <style>
    body { margin: 0; background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; }
    canvas { border: 2px solid #333; image-rendering: pixelated; }
  </style>
</head>
<body>
  <canvas id="game" width="800" height="480"></canvas>
  <script>
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    
    const characterFrames = ${JSON.stringify(characterFrames)};
    const levelAssets = ${JSON.stringify(levelAssets)};
    
    let player = { x: 100, y: 300, vx: 0, vy: 0, state: 'idle', frame: 0, health: 100 };
    let keys = {};
    
    document.addEventListener('keydown', e => keys[e.key] = true);
    document.addEventListener('keyup', e => keys[e.key] = false);
    
    function update() {
      if (keys['ArrowLeft']) { player.vx = -4; player.state = 'walk'; }
      else if (keys['ArrowRight']) { player.vx = 4; player.state = 'walk'; }
      else { player.vx = 0; player.state = 'idle'; }
      
      if (keys['z'] && player.y >= 300) { player.vy = -12; player.state = 'jump'; }
      
      player.vy += 0.6;
      player.x += player.vx;
      player.y += player.vy;
      if (player.y > 300) { player.y = 300; player.vy = 0; }
      
      player.frame = (player.frame + 0.1) % 6;
    }
    
    function draw() {
      ctx.clearRect(0, 0, 800, 480);
      
      const frames = characterFrames[player.state] || characterFrames['idle'];
      const frame = frames[Math.floor(player.frame)];
      if (frame) {
        const img = new Image();
        img.src = frame.dataUrl;
        ctx.drawImage(img, player.x, player.y, 64, 64);
      }
      
      ctx.fillStyle = '#fff';
      ctx.font = '16px monospace';
      ctx.fillText('HP: ' + player.health, 10, 30);
      ctx.fillText('Controls: Arrows=Move, Z=Jump, X=Attack', 10, 460);
    }
    
    function loop() {
      update();
      draw();
      requestAnimationFrame(loop);
    }
    
    loop();
  </script>
</body>
</html>`;
}

function saveOutput(gameCode, characterFrames, levelAssets) {
  const output = {
    gameCode,
    characterFrames,
    levelAssets,
    generatedAt: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'saint-seiya-game-output.json';
  a.click();
  URL.revokeObjectURL(url);
}

main().catch(console.error);
